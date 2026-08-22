import type { ModuleProgress, ProgressSync } from "../engine/progress";
import {
  parseSyncQueue,
  serializeSyncQueue,
  SYNC_QUEUE_KEY,
  type SyncEntry,
} from "../engine/syncQueue";
import { browserStorage, type StorageLike } from "./storage";

/**
 * Sünkroonimisjärjekorra käitaja (samm 2.11).
 *
 * Siin EI OLE Supabase'i – ainult tüüp `RemoteProgress`. Nii saab kogu
 * korduskatsete loogika testida päris võrguta ja päris andmebaasita
 * (tests/progressSync.test.ts).
 */

/**
 * Saatmise tulemus. Kolm seisu, sest kaks oleks vale:
 *
 * - `ok` – kohal, kirje kaob järjekorrast.
 * - `retry` – VÕRK oli katki (või server vastas veaga, mille põhjust me ei
 *   tea). Kirje jääb järjekorda ja läheb hiljem uuesti teele.
 * - `skipped` – seda rida EI SAA kunagi kirjutada: külaline ilma sessioonita,
 *   õpetaja oma seadmes, klassiga liitumata õpilane. Kirje kaob järjekorrast,
 *   sest lõputu kordamine ei tee teda kunagi õigeks. Külalise edenemine jääb
 *   seadmesse – see on teadlik otsus (docs/ANDMEMUDEL.md piirang 3).
 */
export type PushResult = "ok" | "skipped" | "retry";

export type RemoteProgress = {
  /**
   * `reset` – kustuta serveris olev käik enne kirjutamist („Alusta uuesti"
   * jõudis järjekorda enne seda seisu, vt syncQueue.ts).
   */
  push(progress: ModuleProgress, reset: boolean): Promise<PushResult>;
  remove(moduleId: string): Promise<PushResult>;
};

/**
 * Mida õpilasele sünkroonimise kohta ekraanil öelda (MOODULILEHT-UX samm 2).
 *
 * Need ei ole uus olek, vaid järjekorra enda seisu NIMED: `pending` sisu ja
 * viimane `PushResult` kokku. Kaks tähendavad „ära ütle midagi":
 *
 * - `unknown` – selle mooduli kohta ei ole veel midagi juhtunud (moodul on
 *   just avatud, esimest vastust ei ole). Tühi rida on ausam kui „Salvestatud".
 * - `off` – server vastas `skipped`: külaline ilma sessioonita, õpetaja oma
 *   seadmes, klassiga liitumata õpilane. Siin EI OLE kunagi midagi salvestada,
 *   seega ei tohi ka lubadust anda (plaan: „külalisele ei näidata").
 */
export type SaveState = "unknown" | "saving" | "waiting" | "saved" | "off";

export type ProgressSyncHandle = ProgressSync & {
  /**
   * Proovi järjekord tühjaks saata. Kutsutakse lehe avamisel ja siis, kui
   * brauser teatab võrgu naasmisest – muidu jääks tunni lõpus katkenud
   * ühendusega vastus seadmesse kuni järgmise klõpsuni.
   */
  flush(): Promise<void>;
  /** Mooduli salvestusseis praegu – vaade loeb, ei muuda. */
  saveState(moduleId: string): SaveState;
  /** Teata muutusest. Tagastab lahtiütlemise (React `useSyncExternalStore`). */
  subscribe(moduleId: string, listener: () => void): () => void;
};

export function createProgressSync(
  remote: RemoteProgress,
  resolveStorage: () => StorageLike | null = browserStorage,
): ProgressSyncHandle {
  const storage = resolveStorage();

  /**
   * Järjekorra TÕDE on mälus, localStorage on ainult koopia lehe
   * värskendamise üleelamiseks. Nii töötab saatmine ka seadmes, kus
   * localStorage'i ei ole – ja mälus olev objekt annab meile identsuse,
   * mille abil saame allpool aru, kas kirje vahepeal muutus.
   */
  const pending = new Map<string, SyncEntry>(
    Object.entries(parseSyncQueue(read())),
  );

  let running: Promise<void> | null = null;
  /** Saatmise AJAL tuli uus muudatus – tee veel üks ring. */
  let again = false;

  /**
   * Ekraanile mõeldud seis mooduli kaupa. Eraldi `pending`-ist, sest tühi
   * järjekord tähendab kaht eri asja: „kohal" ja „ei olegi veel midagi olnud".
   */
  const states = new Map<string, SaveState>();
  const listeners = new Map<string, Set<() => void>>();
  // Lehe avamisel järjekorras leitud kirje ootab võrku – ta jäi eelmisest
  // korrast saatmata. `flush` teeb sellest kohe „salvestan", kui võrk on.
  for (const moduleId of pending.keys()) states.set(moduleId, "waiting");

  function setState(moduleId: string, next: SaveState): void {
    if (states.get(moduleId) === next) return;
    states.set(moduleId, next);
    for (const listener of listeners.get(moduleId) ?? []) listener();
  }

  /** `off` on lõplik: külalisele ei vilgu vahepeal „Salvestan …". */
  function markSending(moduleId: string): void {
    if (states.get(moduleId) === "off") return;
    setState(moduleId, "saving");
  }

  function read(): string | null {
    if (!storage) return null;
    try {
      return storage.getItem(SYNC_QUEUE_KEY);
    } catch {
      return null;
    }
  }

  function save(): void {
    if (!storage) return;
    try {
      if (pending.size === 0) {
        storage.removeItem(SYNC_QUEUE_KEY);
        return;
      }
      storage.setItem(SYNC_QUEUE_KEY, serializeSyncQueue(Object.fromEntries(pending)));
    } catch {
      // Ketas täis või kirjutamine keelatud. Järjekord jääb siis ainult
      // mällu: sama seansi sees toimib kõik, lehe värskendamine kaotaks
      // saatmata vastused. Krahh oleks hullem (sama valik mis progress.ts-is).
    }
  }

  async function drain(): Promise<void> {
    // Koopia pealt: kui saatmise ajal lisandub kirje, ei muutu see loend
    // meie all ja uus kirje saab oma ringi (`again`).
    for (const [moduleId, entry] of [...pending]) {
      // Kirje on vahepeal asendunud uuemaga – vana saatmine oleks samm
      // tagasi (nt „Alusta uuesti" tuli peale vastuse salvestamist).
      if (pending.get(moduleId) !== entry) continue;

      markSending(moduleId);

      let result: PushResult;
      try {
        result =
          entry.op === "write"
            ? await remote.push(entry.progress, entry.reset)
            : await remote.remove(moduleId);
      } catch {
        // Ootamatu viga (nt `fetch` viskas) loeme võrguveaks: parem proovida
        // uuesti kui vaikselt vastus kaotada.
        result = "retry";
      }

      if (result === "retry") {
        setState(moduleId, "waiting");
        continue;
      }
      // Uuem kirje tuli just saatmise ajal – teda EI tohi kustutada. Seis jääb
      // siis „salvestan": kohal on vana seis, mitte see, mida ekraan näitab.
      if (pending.get(moduleId) === entry) {
        pending.delete(moduleId);
        save();
        setState(moduleId, result === "skipped" ? "off" : "saved");
      }
    }
  }

  function run(): Promise<void> {
    // Kaks saatmist korraga tähendaks, et sama rida kirjutatakse kaks korda
    // ja hilisem (vanem) seis võib võita. Üks ring korraga; kutsuja liitub
    // käimasolevaga. Uue ringi tellib ainult UUS muudatus (`again`) – muidu
    // hakkaks katkise võrgu ajal iga `flush` kohe uut korduskatset tegema.
    if (running) return running;
    const task = (async () => {
      try {
        do {
          again = false;
          await drain();
        } while (again);
      } finally {
        running = null;
      }
    })();
    running = task;
    return task;
  }

  function enqueue(moduleId: string, entry: SyncEntry): void {
    pending.set(moduleId, entry);
    save();
    // Kohe, mitte alles saatmise alguses: vastuse esitamise ja esimese
    // võrgupäringu vahele jääks muidu hetk, kus ekraanil seisab veel eelmise
    // vastuse „Salvestatud ✓".
    markSending(moduleId);
    // Kui saatmine juba käib, teeb see lipp talle veel ühe ringi – muidu
    // jääks just lisatud kirje ootama järgmist klõpsu.
    again = true;
    // Teadlikult ootamata: salvestamine ekraanil ei tohi võrku oodata.
    void run();
  }

  return {
    push: (progress) => {
      // Saatmata „Alusta uuesti" ei tohi uue seisu alla kaduda – muidu jääks
      // serverisse eelmise käigu vastused (vt syncQueue.ts `reset`).
      const waiting = pending.get(progress.moduleId);
      const reset = waiting?.op === "delete" || waiting?.reset === true;
      enqueue(progress.moduleId, { op: "write", progress, reset });
    },
    remove: (moduleId) => enqueue(moduleId, { op: "delete" }),
    flush: run,
    saveState: (moduleId) => states.get(moduleId) ?? "unknown",
    subscribe: (moduleId, listener) => {
      let forModule = listeners.get(moduleId);
      if (!forModule) {
        forModule = new Set();
        listeners.set(moduleId, forModule);
      }
      forModule.add(listener);
      return () => {
        forModule.delete(listener);
        // Tühi hulk kaob kaasa: järjekord elab kogu seansi, seega jääks iga
        // avatud mooduli järel muidu tühi kirje igaveseks rippuma.
        if (forModule.size === 0) listeners.delete(moduleId);
      };
    },
  };
}
