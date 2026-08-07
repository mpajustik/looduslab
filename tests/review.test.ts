import { describe, expect, it } from "vitest";
import {
  createReviewStore,
  dateKey,
  dueDateAfter,
  newReviewItems,
  parseReviewFile,
  REVIEW_KEY,
  type ReviewItem,
} from "../src/engine/review";
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

/** Kell 12 päeval – nii ei sõltu kuupäev testija ajavööndist. */
const NOW = new Date(2026, 7, 7, 12, 0, 0);

const CARD: ReviewItem = {
  moduleId: "physics.peegeldumisseadus",
  cardId: "rc-1",
  dueDate: "2026-08-08",
  intervalDays: 1,
  lastResult: null,
  updatedAt: NOW.toISOString(),
};

describe("kuupäevad", () => {
  it("kirjutab kohaliku kuupäeva kujul 2026-08-07", () => {
    expect(dateKey(NOW)).toBe("2026-08-07");
  });

  it("hilisõhtune moodul saab kaardi ikka HOMSEKS, mitte tänaseks", () => {
    // UTC järgi oleks kell 23:30 kohalikku aega juba järgmine päev ja kaart
    // ootaks kohe – see on täpselt see viga, mille pärast kohalikku aega
    // kasutame.
    expect(dueDateAfter(new Date(2026, 7, 7, 23, 30), 1)).toBe("2026-08-08");
  });

  it("liigub üle kuupiiri ja üle veebruari lõpu", () => {
    expect(dueDateAfter(new Date(2026, 7, 31, 12), 1)).toBe("2026-09-01");
    expect(dueDateAfter(new Date(2028, 1, 28, 12), 1)).toBe("2028-02-29");
  });
});

describe("newReviewItems", () => {
  it("teeb igast kaardist ühe kirje, mis ootab homme", () => {
    const created = newReviewItems({
      existing: [],
      moduleId: "physics.vedeliku-rohk",
      cardIds: ["rc-1", "rc-2"],
      now: NOW,
    });

    expect(created).toHaveLength(2);
    expect(created[0]).toEqual({
      moduleId: "physics.vedeliku-rohk",
      cardId: "rc-1",
      dueDate: "2026-08-08",
      intervalDays: 1,
      lastResult: null,
      updatedAt: NOW.toISOString(),
    });
  });

  it("ei tee olemasolevat kaarti uuesti – intervall jääb alles", () => {
    const kasvanud: ReviewItem = { ...CARD, dueDate: "2026-08-28", intervalDays: 21 };

    const created = newReviewItems({
      existing: [kasvanud],
      moduleId: CARD.moduleId,
      cardIds: ["rc-1", "rc-2"],
      now: NOW,
    });

    expect(created.map((item) => item.cardId)).toEqual(["rc-2"]);
  });

  it("sama id kaks korda loendis annab ikka ühe kaardi", () => {
    const created = newReviewItems({
      existing: [],
      moduleId: CARD.moduleId,
      cardIds: ["rc-1", "rc-1"],
      now: NOW,
    });

    expect(created).toHaveLength(1);
  });

  it("teise mooduli sama kaardi id on eraldi kaart", () => {
    const created = newReviewItems({
      existing: [CARD],
      moduleId: "physics.vedeliku-rohk",
      cardIds: ["rc-1"],
      now: NOW,
    });

    expect(created).toHaveLength(1);
  });
});

describe("createReviewStore", () => {
  it("salvestab kaardid ja loeb nad tagasi", () => {
    const { storage, data } = memoryStorage();
    const store = createReviewStore("persist", () => storage);

    store.addCards(CARD.moduleId, ["rc-1", "rc-2"], NOW);

    expect(store.list()).toHaveLength(2);
    expect(data.get(REVIEW_KEY)).toContain("rc-1");
  });

  it("teistkordne lõpetamine ei muuda ühtegi kaarti", () => {
    const { storage } = memoryStorage();
    const store = createReviewStore("persist", () => storage);

    store.addCards(CARD.moduleId, ["rc-1"], NOW);
    const hiljem = new Date(2026, 8, 1, 12);
    const teine = store.addCards(CARD.moduleId, ["rc-1"], hiljem);

    expect(teine).toEqual([]);
    expect(store.list()[0]?.dueDate).toBe("2026-08-08");
  });

  it("preview EI kirjuta mitte kuhugi", () => {
    const { storage, data } = memoryStorage();
    const store = createReviewStore("preview", () => storage);

    expect(store.addCards(CARD.moduleId, ["rc-1"], NOW)).toEqual([]);
    expect(store.list()).toEqual([]);
    expect(data.size).toBe(0);
  });

  it("preview ei puuduta salvestust isegi proovikirjutusega", () => {
    let küsitud = false;
    createReviewStore("preview", () => {
      küsitud = true;
      return null;
    });

    expect(küsitud).toBe(false);
  });

  it("localStorage'ita seadmes ei krahhi, aga ka ei salvesta", () => {
    const store = createReviewStore("persist", () => null);

    expect(store.addCards(CARD.moduleId, ["rc-1"], NOW)).toEqual([]);
    expect(store.list()).toEqual([]);
  });

  it("täis ketas ei vii mooduli lõpetamist krahhi", () => {
    const store = createReviewStore("persist", () => ({
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceeded");
      },
      removeItem: () => {},
    }));

    expect(store.addCards(CARD.moduleId, ["rc-1"], NOW)).toEqual([]);
  });
});

describe("parseReviewFile", () => {
  it("tühi või katkine sisu annab tühja faili", () => {
    expect(parseReviewFile(null).items).toEqual({});
    expect(parseReviewFile("{").items).toEqual({});
    expect(parseReviewFile(JSON.stringify({ version: 99, items: {} })).items).toEqual({});
  });

  it("viskab kõrvale ainult katkise kaardi, mitte kogu faili", () => {
    const raw = JSON.stringify({
      version: 1,
      items: {
        [`${CARD.moduleId}:rc-1`]: CARD,
        [`${CARD.moduleId}:rc-2`]: { ...CARD, cardId: "rc-2", dueDate: "eile" },
      },
    });

    expect(Object.keys(parseReviewFile(raw).items)).toEqual([`${CARD.moduleId}:rc-1`]);
  });

  it("olematu kuupäev (2026-02-30) ei kõlba, ka kui kuju on õige", () => {
    const raw = JSON.stringify({
      version: 1,
      items: { [`${CARD.moduleId}:rc-1`]: { ...CARD, dueDate: "2026-02-30" } },
    });

    expect(parseReviewFile(raw).items).toEqual({});
  });

  it("liigaasta 29. veebruar on olemas ja kõlbab", () => {
    const kaart = { ...CARD, dueDate: "2028-02-29" };
    const raw = JSON.stringify({
      version: 1,
      items: { [`${CARD.moduleId}:rc-1`]: kaart },
    });

    expect(parseReviewFile(raw).items[`${CARD.moduleId}:rc-1`]).toEqual(kaart);
  });

  it("vale võtme all olev kaart visatakse kõrvale", () => {
    const raw = JSON.stringify({ version: 1, items: { "vale:rc-1": CARD } });

    expect(parseReviewFile(raw).items).toEqual({});
  });
});
