import type { ReviewItem, ReviewSync } from "../engine/review";
import { reviewKey } from "../engine/review";
import {
  parseReviewQueue,
  REVIEW_QUEUE_KEY,
  serializeReviewQueue,
  type ReviewEntry,
  type ReviewOp,
  type ReviewQueue,
} from "../engine/reviewQueue";
import type { PushResult } from "./progressSync";
import { browserStorage, type StorageLike } from "./storage";

/**
 * Kordamiskaartide saatmisjärjekorra käitaja (samm 3.1).
 *
 * Siin EI OLE Supabase'i – ainult tüüp `RemoteReview`. Nii saab kogu
 * korduskatsete loogika testida päris võrguta (tests/reviewSync.test.ts).
 *
 * Lihtsam kui edenemise järjekord (progressSync.ts): kaardil on kaks tehet
 * (uus kaart / hinnatud kaart), kustutamist ega „Alusta uuesti" lippu ei ole.
 * Teele läheb üks päring MOODULI ja tehte kohta (vt `drain`) – kaardi kaupa
 * oleks 10 päringut ühe lõpetamise peale, kõik korraga aga laseks ühel
 * vigasel real teiste moodulite kaardid kinni hoida.
 */

/** `PushResult` tähendused on samad, mis edenemisel – vt progressSync.ts. */
export type RemoteReview = {
  /**
   * Lisa kaardid, mida serveris veel ei ole. EI TOHI muuta olemasolevat rida:
   * seal on kasvanud intervall, mida teine seade juba edasi liigutas.
   */
  create(items: ReviewItem[]): Promise<PushResult>;
  /**
   * Kirjuta hinnatud kaardid üle. Siin ON ülekirjutamine õige: viimasena
   * antud hinnang on kõige värskem teadmine õpilase mälust.
   */
  save(items: ReviewItem[]): Promise<PushResult>;
};

export type ReviewSyncHandle = ReviewSync & {
  /** Proovi järjekord tühjaks saata (lehe avamisel, võrgu naasmisel). */
  flush(): Promise<void>;
};

export function createReviewSync(
  remote: RemoteReview,
  resolveStorage: () => StorageLike | null = browserStorage,
): ReviewSyncHandle {
  const storage = resolveStorage();

  /**
   * Järjekorra TÕDE on mälus, localStorage on ainult koopia lehe
   * värskendamise üleelamiseks (sama valik mis progressSync.ts-is).
   */
  const pending: ReviewQueue = read();

  let running: Promise<void> | null = null;
  /** Saatmise AJAL tuli uus kaart – tee veel üks ring. */
  let again = false;

  function read(): ReviewQueue {
    if (!storage) return {};
    try {
      return parseReviewQueue(storage.getItem(REVIEW_QUEUE_KEY));
    } catch {
      return {};
    }
  }

  /** Järjekorra koopia localStorage'i (nimi eristub tehtest `save`). */
  function persistQueue(): void {
    if (!storage) return;
    try {
      if (Object.keys(pending).length === 0) {
        storage.removeItem(REVIEW_QUEUE_KEY);
        return;
      }
      storage.setItem(REVIEW_QUEUE_KEY, serializeReviewQueue(pending));
    } catch {
      // Ketas täis või kirjutamine keelatud. Järjekord jääb siis ainult
      // mällu: sama seansi sees jõuavad kaardid kohale, lehe värskendamine
      // kaotaks saatmata kaardid.
    }
  }

  /**
   * Saatmine käib MOODULI ja tehte kaupa, mitte kõik korraga.
   *
   * Postgres lükkab vigase rea peale tagasi terve päringu. Kui kõik kaardid
   * läheksid ühes päringus, peataks üks võõrvõtme viga (moodulit ei ole veel
   * `modules` tabelis, sest `sync-modules` on käivitamata) KOGU seadme
   * kordamise – ka nende moodulite kaardid, millega kõik korras on
   * (Codexi ülevaatuse leid 2026-08-07).
   *
   * Moodul on õige jaotus, sest just moodul on see, mille pärast rida
   * tagasi lükatakse. Tehte järgi jaotame sellepärast, et `create` ja `save`
   * on serveris eri päringud. Ühe mooduli kaarte on 3–10, seega päringute
   * arv jääb väikeseks.
   */
  async function drain(): Promise<void> {
    const batches = new Map<string, [string, ReviewEntry][]>();
    for (const entry of Object.entries(pending)) {
      const key = `${entry[1].op} ${entry[1].item.moduleId}`;
      const group = batches.get(key);
      if (group) group.push(entry);
      else batches.set(key, [entry]);
    }

    for (const batch of batches.values()) {
      const op: ReviewOp = batch[0][1].op;
      const items = batch.map(([, entry]) => entry.item);
      let result: PushResult;
      try {
        result = op === "update" ? await remote.save(items) : await remote.create(items);
      } catch {
        // Ootamatu viga (nt `fetch` viskas) loeme võrguveaks: parem proovida
        // uuesti kui kaart vaikselt kaotada.
        result = "retry";
      }

      if (result === "retry") continue;

      for (const [key, entry] of batch) {
        // Kirje on vahepeal asendunud uuemaga – teda EI tohi kustutada, sest
        // saadetud sai vana.
        if (pending[key] === entry) delete pending[key];
      }
      persistQueue();
    }
  }

  function run(): Promise<void> {
    // Üks ring korraga; kutsuja liitub käimasolevaga. Uue ringi tellib ainult
    // UUS muudatus (`again`) – muidu hakkaks katkise võrgu ajal iga `flush`
    // kohe uut korduskatset tegema.
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

  function enqueue(items: ReviewItem[], op: ReviewOp): void {
    if (items.length === 0) return;
    for (const item of items) {
      const key = reviewKey(item.moduleId, item.cardId);
      // `create` ei tohi juba ootavat `update`-i alla kirjutada: ülekirjutav
      // päring teeb ka lisamise ära, vastupidi aga mitte. Päriselus juhtub
      // see siis, kui hindamise päring ootab võrku ja õpilane klõpsib
      // vahepeal sama mooduli uuesti läbi.
      if (op === "create" && pending[key]?.op === "update") continue;
      pending[key] = { item, op };
    }
    persistQueue();
    again = true;
    // Teadlikult ootamata: ei lõpetamine ega hindamine tohi võrku oodata.
    void run();
  }

  return {
    push: (items) => enqueue(items, "create"),
    save: (items) => enqueue(items, "update"),
    flush: run,
  };
}
