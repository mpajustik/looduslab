import { describe, expect, it } from "vitest";
import {
  applyReviewResult,
  createReviewStore,
  DAILY_CARD_LIMIT,
  dateKey,
  dueDateAfter,
  dueReviewItems,
  incomingReviewItems,
  isDue,
  newReviewItems,
  nextIntervalDays,
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

describe("incomingReviewItems", () => {
  /** Serverist tulnud kaart – seadmes teda ei ole. */
  const teisest: ReviewItem = {
    moduleId: "physics.vedeliku-rohk",
    cardId: "rc-3",
    dueDate: "2026-08-09",
    intervalDays: 1,
    lastResult: null,
    updatedAt: "2026-08-07T09:00:00.000Z",
  };

  it("võtab vastu kaardi, mida seadmes ei ole", () => {
    expect(incomingReviewItems({ existing: [CARD], incoming: [teisest] })).toEqual([
      teisest,
    ]);
  });

  it("uuem hinnang serverist võidab seadmes olevat", () => {
    const seadmes: ReviewItem = { ...CARD, updatedAt: "2026-08-07T09:00:00.000Z" };
    const serveris: ReviewItem = {
      ...CARD,
      dueDate: "2026-08-14",
      intervalDays: 7,
      lastResult: "good",
      updatedAt: "2026-08-07T10:00:00.000Z",
    };

    expect(incomingReviewItems({ existing: [seadmes], incoming: [serveris] })).toEqual([
      serveris,
    ]);
  });

  it("vanem seis serverist EI kirjuta üle just antud hinnangut", () => {
    const seadmes: ReviewItem = {
      ...CARD,
      intervalDays: 7,
      lastResult: "good",
      updatedAt: "2026-08-07T10:00:00.000Z",
    };
    const serveris: ReviewItem = { ...CARD, updatedAt: "2026-08-07T09:00:00.000Z" };

    expect(incomingReviewItems({ existing: [seadmes], incoming: [serveris] })).toEqual([]);
  });

  it("sama ajatempel jätab seadme oma alles – tarbetut kirjutamist ei tule", () => {
    const serveris: ReviewItem = { ...CARD, intervalDays: 21 };

    expect(incomingReviewItems({ existing: [CARD], incoming: [serveris] })).toEqual([]);
  });

  it("võrdleb aega arvuna, mitte tekstina", () => {
    // Postgres annab `+00:00`, seade kirjutab `Z`. Tekstina võrreldes oleks
    // "2026-08-07T10:00:00+00:00" < "2026-08-07T09:00:00.000Z" ja uuem kaart
    // jääks võtmata.
    const seadmes: ReviewItem = { ...CARD, updatedAt: "2026-08-07T09:00:00.000Z" };
    const serveris: ReviewItem = { ...CARD, updatedAt: "2026-08-07T10:00:00+00:00" };

    expect(incomingReviewItems({ existing: [seadmes], incoming: [serveris] })).toEqual([
      serveris,
    ]);
  });

  it("katkise ajatempliga kaart serverist ei võida", () => {
    const serveris: ReviewItem = { ...CARD, intervalDays: 21, updatedAt: "eile" };

    expect(incomingReviewItems({ existing: [CARD], incoming: [serveris] })).toEqual([]);
  });

  it("katkise ajatempliga kaart SEADMES asendub loetavaga", () => {
    const seadmes: ReviewItem = { ...CARD, updatedAt: "eile" };

    expect(incomingReviewItems({ existing: [seadmes], incoming: [CARD] })).toEqual([CARD]);
  });

  it("sama kaart kaks korda sissetulevas loendis annab ÜHE vastuse", () => {
    const vanem: ReviewItem = { ...CARD, updatedAt: "2026-08-07T09:00:00.000Z" };
    const uuem: ReviewItem = { ...CARD, intervalDays: 7, updatedAt: "2026-08-07T11:00:00.000Z" };

    // Kummaski järjekorras: võidab uuem ja tagastuses on täpselt üks kirje.
    // Funktsioon lubab „mis seadmes muutub", mitte „mis kirjed läbi käisid" –
    // kaks kirjet sama võtmega oleks kutsujale lõks (CodeRabbiti leid).
    expect(incomingReviewItems({ existing: [], incoming: [vanem, uuem] })).toEqual([uuem]);
    expect(incomingReviewItems({ existing: [], incoming: [uuem, vanem] })).toEqual([uuem]);
  });
});

describe("nextIntervalDays", () => {
  it("„teadsin“ viib redelil ühe astme edasi: 1 → 3 → 7 → 21", () => {
    expect(nextIntervalDays(1, "good")).toBe(3);
    expect(nextIntervalDays(3, "good")).toBe(7);
    expect(nextIntervalDays(7, "good")).toBe(21);
  });

  it("tipust edasi ei liigu – 21 päeva jääb pikimaks", () => {
    expect(nextIntervalDays(21, "good")).toBe(21);
  });

  it("„raskelt“ jätab intervalli samaks", () => {
    expect(nextIntervalDays(7, "hard")).toBe(7);
    expect(nextIntervalDays(21, "hard")).toBe(21);
  });

  it("„ei mäletanud“ viib igalt astmelt tagasi ühele päevale", () => {
    expect(nextIntervalDays(21, "again")).toBe(1);
    expect(nextIntervalDays(1, "again")).toBe(1);
  });

  it("redeliväline arv leiab ikka järgmise astme", () => {
    // Nii juhtub siis, kui localStorage'is on käsitsi muudetud või vanemast
    // versioonist pärit intervall.
    expect(nextIntervalDays(5, "good")).toBe(7);
    expect(nextIntervalDays(100, "good")).toBe(21);
  });

  it("null ega murdosa ei tee kaarti, mis tuleb samal päeval igavesti", () => {
    expect(nextIntervalDays(0, "hard")).toBe(1);
    expect(nextIntervalDays(-5, "good")).toBe(3);
    expect(nextIntervalDays(1.5, "hard")).toBe(1);
  });

  it("„raskelt“ ei jäta alles redelist pikemat intervalli", () => {
    // Rikutud või vanast versioonist pärit 100 päeva ei tohi kaardi juures
    // igaveseks kinni jääda – pikim aste on 21 päeva.
    expect(nextIntervalDays(100, "hard")).toBe(21);
  });

  it("NaN ja lõpmatus annavad ikka päris arvu", () => {
    // Ilma selleta läheks arv kuupäeva arvutusse ja `dueDate` oleks
    // „NaN-NaN-NaN": kaart kaoks järgmisel lugemisel vaikselt ära
    // (CodeRabbiti ülevaatuse leid 2026-08-07).
    expect(nextIntervalDays(Number.NaN, "hard")).toBe(1);
    expect(nextIntervalDays(Number.POSITIVE_INFINITY, "hard")).toBe(1);
    expect(nextIntervalDays(Number.NaN, "good")).toBe(3);
  });
});

describe("applyReviewResult", () => {
  it("„teadsin“ lükkab kaardi kolme päeva pärast ette", () => {
    const graded = applyReviewResult(CARD, "good", NOW);

    expect(graded.intervalDays).toBe(3);
    expect(graded.dueDate).toBe("2026-08-10");
    expect(graded.lastResult).toBe("good");
    expect(graded.updatedAt).toBe(NOW.toISOString());
  });

  it("uus kuupäev arvutatakse hindamise päevast, mitte vanast tähtajast", () => {
    // Kaart ootas 8. augustil, õpilane korrab teda alles 20. augustil.
    // Vanast tähtajast arvutades tuleks ta 23. augustil, ehk kohe uuesti.
    const hiline = new Date(2026, 7, 20, 12);
    const graded = applyReviewResult(CARD, "good", hiline);

    expect(graded.dueDate).toBe("2026-08-23");
  });

  it("„ei mäletanud“ toob kaardi homme tagasi ka pika intervalli pealt", () => {
    const kaugel: ReviewItem = { ...CARD, intervalDays: 21, dueDate: "2026-08-28" };
    const graded = applyReviewResult(kaugel, "again", NOW);

    expect(graded.intervalDays).toBe(1);
    expect(graded.dueDate).toBe("2026-08-08");
  });

  it("ei muuda kaardi identiteeti", () => {
    const graded = applyReviewResult(CARD, "hard", NOW);

    expect(graded.moduleId).toBe(CARD.moduleId);
    expect(graded.cardId).toBe(CARD.cardId);
  });
});

describe("isDue", () => {
  it("tänane ja eilne kaart ootavad, homne mitte", () => {
    expect(isDue({ ...CARD, dueDate: "2026-08-07" }, NOW)).toBe(true);
    expect(isDue({ ...CARD, dueDate: "2026-08-01" }, NOW)).toBe(true);
    expect(isDue({ ...CARD, dueDate: "2026-08-08" }, NOW)).toBe(false);
  });
});

describe("dueReviewItems", () => {
  /** `count` kaarti ühest moodulist, kõik ootel (eilne kuupäev). */
  function due(moduleId: string, count: number): ReviewItem[] {
    return Array.from({ length: count }, (_, index) => ({
      ...CARD,
      moduleId,
      cardId: `rc-${index + 1}`,
      dueDate: "2026-08-06",
    }));
  }

  it("võtab ainult ootel kaardid", () => {
    const items = [
      { ...CARD, cardId: "rc-1", dueDate: "2026-08-07" },
      { ...CARD, cardId: "rc-2", dueDate: "2026-08-09" },
    ];
    expect(dueReviewItems({ items, now: NOW }).map((item) => item.cardId)).toEqual([
      "rc-1",
    ]);
  });

  it("ei anna päevas üle kümne kaardi", () => {
    const items = due("physics.a", 25);
    expect(dueReviewItems({ items, now: NOW })).toHaveLength(DAILY_CARD_LIMIT);
  });

  it("segab moodulid: kümne kaardi sisse mahuvad mõlemad", () => {
    // Kaks moodulit, kummalgi rohkem kaarte kui piir lubab. Ilma
    // ringiratast-jaotuseta võiks üks moodul kogu päeva ära võtta – see on
    // täpselt see, mida etapi eesmärk keelab („mõlemast moodulist segamini").
    const picked = dueReviewItems({
      items: [...due("physics.a", 8), ...due("physics.b", 8)],
      now: NOW,
    });
    const modules = new Set(picked.map((item) => item.moduleId));
    expect(picked).toHaveLength(DAILY_CARD_LIMIT);
    expect(modules).toEqual(new Set(["physics.a", "physics.b"]));
  });

  it("ei anna sama kaarti kaks korda", () => {
    const picked = dueReviewItems({
      items: [...due("physics.a", 3), ...due("physics.b", 4)],
      now: NOW,
    });
    const keys = picked.map((item) => `${item.moduleId}:${item.cardId}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toHaveLength(7);
  });

  it("sama päev annab sama järjekorra, uus päev uue", () => {
    const items = [...due("physics.a", 5), ...due("physics.b", 5)];
    const ids = (now: Date) =>
      dueReviewItems({ items, now }).map((item) => `${item.moduleId}:${item.cardId}`);

    // Lehe värskendamine ei tohi kaarte ümber segada.
    expect(ids(NOW)).toEqual(ids(new Date(2026, 7, 7, 20, 0, 0)));
    expect(ids(NOW)).not.toEqual(ids(new Date(2026, 7, 8, 12, 0, 0)));
  });

  it("üks moodul üksinda tuleb ikka välja", () => {
    const picked = dueReviewItems({ items: due("physics.a", 4), now: NOW });
    expect(picked).toHaveLength(4);
  });

  it("täna juba hinnatud kaardid söövad päevapiiri ära", () => {
    // Codexi ülevaatuse leid 2026-08-07: ilma selleta annaks lehe
    // VÄRSKENDAMINE kohe järgmised kümme kaarti ja „max 10 päevas" ei peaks.
    const graded = Array.from({ length: 4 }, (_, index) => ({
      ...CARD,
      cardId: `tehtud-${index}`,
      // Hinnatud kaart on juba homse peal – ootel ta ei ole.
      dueDate: "2026-08-10",
      lastResult: "good" as const,
      updatedAt: new Date(2026, 7, 7, 9, 0, 0).toISOString(),
    }));

    const picked = dueReviewItems({ items: [...graded, ...due("physics.a", 25)], now: NOW });
    expect(picked).toHaveLength(DAILY_CARD_LIMIT - 4);
  });

  it("eile hinnatud kaardid ei vähenda tänast päeva", () => {
    const yesterday = [
      {
        ...CARD,
        cardId: "eilne",
        dueDate: "2026-08-14",
        lastResult: "good" as const,
        updatedAt: new Date(2026, 7, 6, 9, 0, 0).toISOString(),
      },
    ];
    const picked = dueReviewItems({
      items: [...yesterday, ...due("physics.a", 25)],
      now: NOW,
    });
    expect(picked).toHaveLength(DAILY_CARD_LIMIT);
  });

  it("päev täis = tänaseks ei tule ühtegi kaarti juurde", () => {
    const graded = Array.from({ length: DAILY_CARD_LIMIT }, (_, index) => ({
      ...CARD,
      cardId: `tehtud-${index}`,
      dueDate: "2026-08-10",
      lastResult: "hard" as const,
      updatedAt: NOW.toISOString(),
    }));
    expect(dueReviewItems({ items: [...graded, ...due("physics.a", 5)], now: NOW })).toEqual(
      [],
    );
  });

  it("täna SÜNDINUD kaart ei ole veel hinnatud ega vähenda piiri", () => {
    // Mooduli lõpetamine paneb `updatedAt`-i tänaseks, aga `lastResult` jääb
    // null-iks. Vastasel juhul kaotaks moodulit lõpetav õpilane oma
    // kordamispäeva ära.
    const born = newReviewItems({
      existing: [],
      moduleId: "physics.b",
      cardIds: ["rc-1", "rc-2"],
      now: NOW,
    });
    expect(
      dueReviewItems({ items: [...born, ...due("physics.a", 25)], now: NOW }),
    ).toHaveLength(DAILY_CARD_LIMIT);
  });

  it("tühi loend ja null-piir ei krahhi", () => {
    expect(dueReviewItems({ items: [], now: NOW })).toEqual([]);
    expect(dueReviewItems({ items: due("physics.a", 5), now: NOW, limit: 0 })).toEqual(
      [],
    );
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

  it("merge toob teises seadmes tehtud mooduli kaardid siia", () => {
    const { storage } = memoryStorage();
    const store = createReviewStore("persist", () => storage);
    store.addCards(CARD.moduleId, ["rc-1"], NOW);

    const telefonist: ReviewItem = {
      moduleId: "physics.vedeliku-rohk",
      cardId: "rc-1",
      dueDate: "2026-08-09",
      intervalDays: 1,
      lastResult: null,
      updatedAt: "2026-08-08T09:00:00.000Z",
    };

    expect(store.merge([telefonist])).toEqual([telefonist]);
    // Uus kaart lisandus, vana jäi alles.
    expect(store.list()).toHaveLength(2);
    // Ka pärast uut lugemist – kirjas on ta salvestuses, mitte ainult mälus.
    expect(createReviewStore("persist", () => storage).list()).toHaveLength(2);
  });

  it("merge ei saada serverist tulnud kaarte serverisse tagasi", () => {
    const { storage } = memoryStorage();
    const saadetud: ReviewItem[] = [];
    const store = createReviewStore("persist", () => storage, {
      push: (items) => saadetud.push(...items),
      save: (items) => saadetud.push(...items),
    });

    store.merge([CARD]);

    expect(saadetud).toEqual([]);
  });

  it("merge ei lükka seadmes antud hinnangut tagasi vanema seisu peale", () => {
    const { storage } = memoryStorage();
    const store = createReviewStore("persist", () => storage);
    store.addCards(CARD.moduleId, ["rc-1"], NOW);
    const hinnatud = store.grade(CARD.moduleId, "rc-1", "good", new Date(2026, 7, 8, 12));

    // Server ei tea hinnangust veel midagi – tema koopia on eilsest.
    const serveris: ReviewItem = { ...CARD, updatedAt: NOW.toISOString() };

    expect(store.merge([serveris])).toEqual([]);
    expect(store.list()[0]).toEqual(hinnatud);
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

  it("hindamine muudab kaardi kuupäeva ja jääb püsima", () => {
    const { storage } = memoryStorage();
    const store = createReviewStore("persist", () => storage);
    store.addCards(CARD.moduleId, ["rc-1", "rc-2"], NOW);

    const graded = store.grade(CARD.moduleId, "rc-1", "good", new Date(2026, 7, 8, 12));

    expect(graded?.dueDate).toBe("2026-08-11");
    // Uues hoidlas (sama salvestus) on sama seis – kirjutati päriselt ära.
    const uus = createReviewStore("persist", () => storage);
    expect(uus.list().find((item) => item.cardId === "rc-1")?.intervalDays).toBe(3);
    // Teine kaart jäi puutumata.
    expect(uus.list().find((item) => item.cardId === "rc-2")?.dueDate).toBe("2026-08-08");
  });

  it("olematu kaardi hindamine annab null, mitte uue kaardi", () => {
    const { storage } = memoryStorage();
    const store = createReviewStore("persist", () => storage);

    expect(store.grade(CARD.moduleId, "rc-1", "good", NOW)).toBeNull();
    expect(store.list()).toEqual([]);
  });

  it("preview ei salvesta ka hinnangut", () => {
    // Kaart ON seadmes olemas – muidu väljuks `grade` kohe „sellist kaarti ei
    // ole" haru kaudu ja test ei puudutakski preview-režiimi
    // (CodeRabbiti ülevaatuse leid 2026-08-07).
    const { storage, data } = memoryStorage();
    createReviewStore("persist", () => storage).addCards(CARD.moduleId, ["rc-1"], NOW);
    const enne = data.get(REVIEW_KEY);

    const store = createReviewStore("preview", () => storage);

    expect(store.grade(CARD.moduleId, "rc-1", "good", NOW)).toBeNull();
    expect(store.list()).toEqual([]);
    expect(data.get(REVIEW_KEY)).toBe(enne);
  });

  it("täis ketas ei võta hinnangut ära – kordamine saab edasi minna", () => {
    // Lugemine töötab, kirjutamine mitte (kvoot täis). Hinnang läks serverisse,
    // seega `null` valetaks kutsujale, et midagi ei juhtunud.
    const { data } = memoryStorage();
    const täisKetas: StorageLike = {
      getItem: (key) => data.get(key) ?? null,
      setItem: (key, value) => {
        if (key === REVIEW_KEY && data.has(key)) throw new Error("QuotaExceeded");
        data.set(key, value);
      },
      removeItem: (key) => void data.delete(key),
    };
    const store = createReviewStore("persist", () => täisKetas);
    store.addCards(CARD.moduleId, ["rc-1"], NOW);

    const graded = store.grade(CARD.moduleId, "rc-1", "good", new Date(2026, 7, 8, 12));

    expect(graded?.dueDate).toBe("2026-08-11");
    // Sama seansi sees on uus seis nähtav, kuigi kettale ta ei jõudnud.
    expect(store.list()[0]?.dueDate).toBe("2026-08-11");
    // Uues seansis (uus hoidla) on alles vana, salvestatud seis.
    expect(createReviewStore("persist", () => täisKetas).list()[0]?.dueDate).toBe(
      "2026-08-08",
    );
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
