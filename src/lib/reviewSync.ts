import type { ReviewItem, ReviewSync } from "../engine/review";
import { reviewKey } from "../engine/review";
import {
  parseReviewQueue,
  REVIEW_QUEUE_KEY,
  serializeReviewQueue,
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
 * Lihtsam kui edenemise järjekord (progressSync.ts): kaardil on ainult üks
 * tehe („lisa, kui veel ei ole"), kustutamist ega „Alusta uuesti" lippu ei
 * ole. Teele läheb üks päring MOODULI kohta (vt `drain`) – kaardi kaupa
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

  function save(): void {
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
   * Saatmine käib MOODULI kaupa, mitte kõik korraga.
   *
   * Postgres lükkab vigase rea peale tagasi terve päringu. Kui kõik kaardid
   * läheksid ühes päringus, peataks üks võõrvõtme viga (moodulit ei ole veel
   * `modules` tabelis, sest `sync-modules` on käivitamata) KOGU seadme
   * kordamise – ka nende moodulite kaardid, millega kõik korras on
   * (Codexi ülevaatuse leid 2026-08-07).
   *
   * Moodul on õige jaotus, sest just moodul on see, mille pärast rida
   * tagasi lükatakse. Ühe mooduli kaarte on 3–10, seega päringute arv jääb
   * väikeseks.
   */
  async function drain(): Promise<void> {
    const byModule = new Map<string, [string, ReviewItem][]>();
    for (const entry of Object.entries(pending)) {
      const group = byModule.get(entry[1].moduleId);
      if (group) group.push(entry);
      else byModule.set(entry[1].moduleId, [entry]);
    }

    for (const batch of byModule.values()) {
      let result: PushResult;
      try {
        result = await remote.create(batch.map(([, item]) => item));
      } catch {
        // Ootamatu viga (nt `fetch` viskas) loeme võrguveaks: parem proovida
        // uuesti kui kaart vaikselt kaotada.
        result = "retry";
      }

      if (result === "retry") continue;

      for (const [key, item] of batch) {
        // Kirje on vahepeal asendunud uuemaga – teda EI tohi kustutada, sest
        // saadetud sai vana.
        if (pending[key] === item) delete pending[key];
      }
      save();
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

  return {
    push: (items) => {
      if (items.length === 0) return;
      for (const item of items) pending[reviewKey(item.moduleId, item.cardId)] = item;
      save();
      again = true;
      // Teadlikult ootamata: mooduli lõpetamine ei tohi võrku oodata.
      void run();
    },
    flush: run,
  };
}
