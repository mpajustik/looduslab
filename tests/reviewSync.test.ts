import { describe, expect, it } from "vitest";
import { createReviewStore, type ReviewItem } from "../src/engine/review";
import { parseReviewQueue, REVIEW_QUEUE_KEY } from "../src/engine/reviewQueue";
import type { PushResult } from "../src/lib/progressSync";
import { createReviewSync, type RemoteReview } from "../src/lib/reviewSync";
import type { StorageLike } from "../src/lib/storage";

/** Mälupõhine localStorage'i teisik – testid jooksevad node-keskkonnas. */
function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const storage: StorageLike = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
  return { storage, data };
}

/** Server, mis vastab ette antud tulemustega ja peab kutsutust arvet. */
function fakeRemote(results: PushResult[] = []) {
  const batches: ReviewItem[][] = [];
  let next = 0;

  const remote: RemoteReview = {
    create: (items) => {
      batches.push(items);
      return Promise.resolve(results[next++] ?? "ok");
    },
  };
  return { remote, batches };
}

/** Server, mis lükkab ühe MOODULI kaardid tagasi ja võtab teised vastu. */
function pickyRemote(brokenModuleId: string) {
  const accepted: ReviewItem[] = [];

  const remote: RemoteReview = {
    create: (items) => {
      if (items.some((item) => item.moduleId === brokenModuleId)) {
        // Nii käitub Postgres: üks vigane rida lükkab kogu päringu tagasi.
        return Promise.resolve<PushResult>("retry");
      }
      accepted.push(...items);
      return Promise.resolve<PushResult>("ok");
    },
  };
  return { remote, accepted };
}

const NOW = new Date(2026, 7, 7, 12, 0, 0);

const CARD: ReviewItem = {
  moduleId: "physics.peegeldumisseadus",
  cardId: "rc-1",
  dueDate: "2026-08-08",
  intervalDays: 1,
  lastResult: null,
  updatedAt: NOW.toISOString(),
};

const CARD_2: ReviewItem = { ...CARD, cardId: "rc-2" };

describe("createReviewSync", () => {
  it("saadab kaardid ühe päringuga ja tühjendab järjekorra", async () => {
    const { storage, data } = memoryStorage();
    const { remote, batches } = fakeRemote();
    const sync = createReviewSync(remote, () => storage);

    sync.push([CARD, CARD_2]);
    await sync.flush();

    expect(batches).toEqual([[CARD, CARD_2]]);
    expect(data.has(REVIEW_QUEUE_KEY)).toBe(false);
  });

  it("võrguvea korral jäävad kaardid järjekorda ja lähevad hiljem teele", async () => {
    const { storage, data } = memoryStorage();
    const { remote, batches } = fakeRemote(["retry"]);
    const sync = createReviewSync(remote, () => storage);

    sync.push([CARD]);
    await sync.flush();

    expect(Object.keys(parseReviewQueue(data.get(REVIEW_QUEUE_KEY) ?? null))).toEqual([
      `${CARD.moduleId}:rc-1`,
    ]);

    await sync.flush();

    expect(batches).toHaveLength(2);
    expect(data.has(REVIEW_QUEUE_KEY)).toBe(false);
  });

  it("ühe mooduli kirjutamatu kaart EI peata teiste moodulite kaarte", async () => {
    // Nii juhtub päriselt siis, kui `sync-modules` on käivitamata: selle
    // mooduli rida puudub `modules` tabelis ja võõrvõti lükkab ta tagasi.
    // Ilma moodulite kaupa saatmiseta jääks kogu seadme kordamine seisma
    // (Codexi ülevaatuse leid 2026-08-07).
    const { storage } = memoryStorage();
    const katkine: ReviewItem = { ...CARD, moduleId: "physics.sunkimata" };
    const { remote, accepted } = pickyRemote(katkine.moduleId);
    const sync = createReviewSync(remote, () => storage);

    sync.push([katkine, CARD, CARD_2]);
    await sync.flush();

    expect(accepted.map((item) => item.cardId)).toEqual(["rc-1", "rc-2"]);
    expect(Object.keys(parseReviewQueue(storage.getItem(REVIEW_QUEUE_KEY)))).toEqual([
      `${katkine.moduleId}:rc-1`,
    ]);
  });

  it("kirjutamatu kaart (külaline) kaob järjekorrast, ei jää igavesti proovima", async () => {
    const { storage, data } = memoryStorage();
    const { remote } = fakeRemote(["skipped"]);
    const sync = createReviewSync(remote, () => storage);

    sync.push([CARD]);
    await sync.flush();

    expect(data.has(REVIEW_QUEUE_KEY)).toBe(false);
  });

  it("visatud viga loeb võrguveaks, mitte kadunud kaardiks", async () => {
    const { storage } = memoryStorage();
    const remote: RemoteReview = {
      create: () => Promise.reject(new Error("võrk katki")),
    };
    const sync = createReviewSync(remote, () => storage);

    sync.push([CARD]);
    await sync.flush();

    expect(parseReviewQueue(storage.getItem(REVIEW_QUEUE_KEY))).toHaveProperty(
      `${CARD.moduleId}:rc-1`,
    );
  });

  it("eelmisest seansist jäänud järjekord läheb teele ilma uue kaardita", async () => {
    const { storage } = memoryStorage({
      [REVIEW_QUEUE_KEY]: JSON.stringify({
        version: 1,
        pending: { [`${CARD.moduleId}:rc-1`]: CARD },
      }),
    });
    const { remote, batches } = fakeRemote();
    const sync = createReviewSync(remote, () => storage);

    await sync.flush();

    expect(batches).toEqual([[CARD]]);
  });

  it("localStorage'ita seadmes saadab ikka, järjekord elab mälus", async () => {
    const { remote, batches } = fakeRemote();
    const sync = createReviewSync(remote, () => null);

    sync.push([CARD]);
    await sync.flush();

    expect(batches).toEqual([[CARD]]);
  });

  it("tühja loendi peale ei tehta päringut", async () => {
    const { storage } = memoryStorage();
    const { remote, batches } = fakeRemote();
    const sync = createReviewSync(remote, () => storage);

    sync.push([]);
    await sync.flush();

    expect(batches).toEqual([]);
  });
});

describe("parseReviewQueue", () => {
  it("tühi või katkine sisu annab tühja järjekorra", () => {
    expect(parseReviewQueue(null)).toEqual({});
    expect(parseReviewQueue("{")).toEqual({});
    expect(parseReviewQueue(JSON.stringify({ version: 9, pending: {} }))).toEqual({});
  });

  it("vale võtme all olev kaart visatakse kõrvale", () => {
    const raw = JSON.stringify({ version: 1, pending: { "vale:rc-1": CARD } });

    expect(parseReviewQueue(raw)).toEqual({});
  });
});

describe("hoidla ja sünk koos", () => {
  it("uued kaardid lähevad nii seadmesse kui serverisse", () => {
    const { storage } = memoryStorage();
    const { remote, batches } = fakeRemote();
    const sync = createReviewSync(remote, () => storage);
    const store = createReviewStore("persist", () => storage, sync);

    store.addCards(CARD.moduleId, ["rc-1", "rc-2"], NOW);

    expect(store.list()).toHaveLength(2);
    expect(batches[0]?.map((item) => item.cardId)).toEqual(["rc-1", "rc-2"]);
  });

  it("teistkordne lõpetamine ei saada midagi uuesti", () => {
    const { storage } = memoryStorage();
    const { remote, batches } = fakeRemote();
    const sync = createReviewSync(remote, () => storage);
    const store = createReviewStore("persist", () => storage, sync);

    store.addCards(CARD.moduleId, ["rc-1"], NOW);
    store.addCards(CARD.moduleId, ["rc-1"], new Date(2026, 8, 1, 12));

    expect(batches).toHaveLength(1);
  });

  it("preview ei saada serverisse mitte midagi", () => {
    const { storage } = memoryStorage();
    const { remote, batches } = fakeRemote();
    const sync = createReviewSync(remote, () => storage);
    const store = createReviewStore("preview", () => storage, sync);

    store.addCards(CARD.moduleId, ["rc-1"], NOW);

    expect(batches).toEqual([]);
    expect(storage.getItem(REVIEW_QUEUE_KEY)).toBeNull();
  });

  it("localStorage'ita seadmes lähevad kaardid ikka serverisse", () => {
    const { remote, batches } = fakeRemote();
    const sync = createReviewSync(remote, () => null);
    const store = createReviewStore("persist", () => null, sync);

    store.addCards(CARD.moduleId, ["rc-1"], NOW);

    expect(batches[0]?.map((item) => item.cardId)).toEqual(["rc-1"]);
  });

  it("täis ketas ei võta serverisse saatmist kaasa", () => {
    const täisKetas: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceeded");
      },
      removeItem: () => {},
    };
    const { remote, batches } = fakeRemote();
    const sync = createReviewSync(remote, () => täisKetas);
    const store = createReviewStore("persist", () => täisKetas, sync);

    store.addCards(CARD.moduleId, ["rc-1"], NOW);

    expect(batches[0]?.map((item) => item.cardId)).toEqual(["rc-1"]);
  });
});
