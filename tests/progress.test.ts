import { describe, expect, it } from "vitest";
import type { Step } from "../src/engine/contract";
import {
  createProgressStore,
  parseProgressFile,
  PROGRESS_KEY,
  startProgress,
  toAnswers,
  withAnswer,
  withCompleted,
  withCurrentStep,
  withModuleVersion,
  type ModuleProgress,
} from "../src/engine/progress";
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

const STEP: Step = {
  type: "precheck",
  id: "precheck-1",
  title: "Kontrolli",
  questions: [
    {
      kind: "choice",
      id: "precheck-1",
      prompt: "Mis on õige?",
      options: [
        { id: "oige", text: "See", correct: true },
        { id: "vale", text: "Too", correct: false, misconception: "silt" },
      ],
    },
    {
      kind: "numeric",
      id: "precheck-2",
      prompt: "Kui suur on nurk?",
      answer: 55,
      unit: "°",
      tolerance: { mode: "absolute", value: 0.5 },
    },
  ],
};

const OTHER_STEP: Step = {
  type: "theory",
  id: "theory-1",
  title: "Teooria",
  body: ["Tekst."],
};

function fresh(now = new Date("2026-08-03T10:00:00Z")): ModuleProgress {
  return startProgress({
    moduleId: "physics.demo",
    moduleVersion: "1.0.0",
    currentStep: "theory-1",
    now,
  });
}

describe("startProgress", () => {
  it("alustab pooleliolevast käigust ilma vastusteta", () => {
    const progress = fresh();

    expect(progress).toEqual({
      moduleId: "physics.demo",
      moduleVersion: "1.0.0",
      status: "started",
      currentStep: "theory-1",
      startedAt: "2026-08-03T10:00:00.000Z",
      finishedAt: null,
      responses: {},
    });
  });
});

describe("withCurrentStep", () => {
  it("liigub uuele sammule", () => {
    expect(withCurrentStep(fresh(), "precheck-1").currentStep).toBe("precheck-1");
  });

  it("sama sammu peale ei tee uut objekti (ei salvestata asjata)", () => {
    const progress = fresh();
    expect(withCurrentStep(progress, "theory-1")).toBe(progress);
  });
});

describe("withCompleted", () => {
  it("märgib mooduli tehtuks ja jätab lõpuaja", () => {
    const done = withCompleted(fresh(), new Date("2026-08-03T10:30:00Z"));

    expect(done.status).toBe("completed");
    expect(done.finishedAt).toBe("2026-08-03T10:30:00.000Z");
  });

  it("teine lõpetamine ei nihuta lõpuaega", () => {
    // Läbitud moodulis saab samme uuesti sirvida ja lõpetada – aga õpetaja
    // koondvaates ei tohi „kaua moodul võttis" iga vaatamisega kasvada.
    const done = withCompleted(fresh(), new Date("2026-08-03T10:30:00Z"));
    const again = withCompleted(done, new Date("2026-08-04T09:00:00Z"));

    expect(again).toBe(done);
  });

  it("ei puuduta vastuseid ega pooleli sammu", () => {
    const answered = withAnswer(withCurrentStep(fresh(), "precheck-1"), {
      step: STEP,
      questionId: "precheck-1",
      payload: { kind: "choice", optionIds: ["oige"] },
    });
    const done = withCompleted(answered, new Date("2026-08-03T10:30:00Z"));

    expect(done.currentStep).toBe("precheck-1");
    expect(done.responses).toEqual(answered.responses);
  });
});

describe("withAnswer", () => {
  const at = (iso: string) => new Date(iso);

  it("õigsuse otsustab checker, mitte vaade", () => {
    const right = withAnswer(fresh(), {
      step: STEP,
      questionId: "precheck-1",
      payload: { kind: "choice", optionIds: ["oige"] },
    });
    const wrong = withAnswer(fresh(), {
      step: STEP,
      questionId: "precheck-1",
      payload: { kind: "choice", optionIds: ["vale"] },
    });

    expect(right.responses["precheck-1"]?.isCorrect).toBe(true);
    expect(wrong.responses["precheck-1"]?.isCorrect).toBe(false);
  });

  it("salvestab vastuse koos sammu, versiooni ja ajaga", () => {
    const progress = withAnswer(fresh(), {
      step: STEP,
      questionId: "precheck-2",
      payload: { kind: "numeric", raw: "55 °" },
      now: at("2026-08-03T10:05:00Z"),
    });

    expect(progress.responses["precheck-2"]).toEqual({
      step: "precheck-1",
      questionId: "precheck-2",
      moduleVersion: "1.0.0",
      payload: { kind: "numeric", raw: "55 °" },
      isCorrect: true,
      revisedCount: 0,
      createdAt: "2026-08-03T10:05:00.000Z",
    });
  });

  it("esimene vastus on revisedCount 0, iga muutmine kasvatab ühe võrra", () => {
    const first = withAnswer(fresh(), {
      step: STEP,
      questionId: "precheck-2",
      payload: { kind: "numeric", raw: "35" },
      now: at("2026-08-03T10:05:00Z"),
    });
    const second = withAnswer(first, {
      step: STEP,
      questionId: "precheck-2",
      payload: { kind: "numeric", raw: "55" },
      now: at("2026-08-03T10:06:00Z"),
    });
    const third = withAnswer(second, {
      step: STEP,
      questionId: "precheck-2",
      payload: { kind: "numeric", raw: "55,0" },
      now: at("2026-08-03T10:07:00Z"),
    });

    expect(first.responses["precheck-2"]?.revisedCount).toBe(0);
    expect(second.responses["precheck-2"]?.revisedCount).toBe(1);
    expect(third.responses["precheck-2"]?.revisedCount).toBe(2);
    // Sünniaeg on vastuse oma, mitte viimase puudutuse oma.
    expect(third.responses["precheck-2"]?.createdAt).toBe("2026-08-03T10:05:00.000Z");
    expect(third.responses["precheck-2"]?.isCorrect).toBe(true);
  });

  it("teise versiooni vastus algab uuesti nullist, mitte ei jätka vana lugu", () => {
    const answered = withAnswer(fresh(), {
      step: STEP,
      questionId: "precheck-2",
      payload: { kind: "numeric", raw: "35" },
      now: at("2026-08-03T10:05:00Z"),
    });
    const upgraded = withModuleVersion(answered, "2.0.0");
    const again = withAnswer(upgraded, {
      step: STEP,
      questionId: "precheck-2",
      payload: { kind: "numeric", raw: "55" },
      now: at("2026-08-04T10:00:00Z"),
    });

    expect(again.responses["precheck-2"]?.moduleVersion).toBe("2.0.0");
    expect(again.responses["precheck-2"]?.revisedCount).toBe(0);
    expect(again.responses["precheck-2"]?.createdAt).toBe("2026-08-04T10:00:00.000Z");
  });

  it("tundmatu küsimus samm ei ole vale vastus, vaid hindamata", () => {
    const progress = withAnswer(fresh(), {
      step: OTHER_STEP,
      questionId: "precheck-1",
      payload: { kind: "choice", optionIds: ["oige"] },
    });

    // Vastus jääb alles – õpilane andis ta ju ära.
    expect(progress.responses["precheck-1"]?.payload).toEqual({
      kind: "choice",
      optionIds: ["oige"],
    });
    expect(progress.responses["precheck-1"]?.isCorrect).toBeNull();
  });

  it("ei muuda vana objekti", () => {
    const progress = fresh();
    withAnswer(progress, {
      step: STEP,
      questionId: "precheck-1",
      payload: { kind: "choice", optionIds: ["oige"] },
    });

    expect(progress.responses).toEqual({});
  });
});

describe("withModuleVersion", () => {
  it("uuendab käigu versiooni, aga jätab vastused nende oma versiooni külge", () => {
    const answered = withAnswer(fresh(), {
      step: STEP,
      questionId: "precheck-1",
      payload: { kind: "choice", optionIds: ["oige"] },
    });
    const upgraded = withModuleVersion(answered, "1.1.0");

    expect(upgraded.moduleVersion).toBe("1.1.0");
    expect(upgraded.responses["precheck-1"]?.moduleVersion).toBe("1.0.0");
  });
});

describe("toAnswers", () => {
  it("annab vaatele question_id → vastus", () => {
    const progress = withAnswer(fresh(), {
      step: STEP,
      questionId: "precheck-1",
      payload: { kind: "choice", optionIds: ["oige"] },
    });

    expect(toAnswers(progress)).toEqual({
      "precheck-1": { kind: "choice", optionIds: ["oige"] },
    });
  });
});

describe("createProgressStore – persist", () => {
  it("kirjutab ja loeb sama edenemise", () => {
    const { storage } = memoryStorage();
    const store = createProgressStore("persist", () => storage);
    const progress = withCurrentStep(fresh(), "precheck-1");

    store.write(progress);

    expect(store.read("physics.demo")).toEqual(progress);
    expect(createProgressStore("persist", () => storage).read("physics.demo")).toEqual(
      progress,
    );
  });

  it("tundmatu mooduli kohta tuleb null", () => {
    const { storage } = memoryStorage();
    expect(createProgressStore("persist", () => storage).read("physics.puudub")).toBeNull();
  });

  it("clear kustutab ainult selle mooduli", () => {
    const { storage } = memoryStorage();
    const store = createProgressStore("persist", () => storage);
    const first = fresh();
    const second = startProgress({
      moduleId: "physics.teine",
      moduleVersion: "1.0.0",
      currentStep: "theory-1",
    });

    store.write(first);
    store.write(second);
    store.clear("physics.demo");

    expect(store.read("physics.demo")).toBeNull();
    expect(store.read("physics.teine")).toEqual(second);
  });

  it("ilma localStorage'ita ei kuku kokku, lihtsalt ei salvesta", () => {
    const store = createProgressStore("persist", () => null);
    store.write(fresh());
    expect(store.read("physics.demo")).toBeNull();
  });
});

describe("createProgressStore – preview", () => {
  it("ei kirjuta MITTE KUHUGI", () => {
    const { storage, data } = memoryStorage();
    const store = createProgressStore("preview", () => storage);

    store.write(withCurrentStep(fresh(), "precheck-1"));
    store.clear("physics.demo");

    expect(data.size).toBe(0);
  });

  it("ei loe ka olemasolevat edenemist – eelvaade algab puhtalt lehelt", () => {
    const { storage } = memoryStorage();
    createProgressStore("persist", () => storage).write(fresh());

    expect(createProgressStore("preview", () => storage).read("physics.demo")).toBeNull();
  });

  it("ei kustuta seadmes olevat edenemist", () => {
    const { storage } = memoryStorage();
    const persist = createProgressStore("persist", () => storage);
    persist.write(fresh());

    createProgressStore("preview", () => storage).clear("physics.demo");

    expect(persist.read("physics.demo")).not.toBeNull();
  });

  it("ei kutsu resolveStorage'it kordagi – isegi proovikirjutust EI tehta", () => {
    const resolveStorage = () => {
      throw new Error("preview ei tohi localStorage'i üldse puudutada");
    };

    const store = createProgressStore("preview", resolveStorage);
    store.write(fresh());
    store.clear("physics.demo");
    expect(store.read("physics.demo")).toBeNull();
  });
});

describe("parseProgressFile", () => {
  const valid = fresh();

  it("tühi või katkine sisu annab tühja faili, mitte viga", () => {
    for (const raw of [null, "", "{", "[]", '"tekst"', "null"]) {
      expect(parseProgressFile(raw)).toEqual({ version: 1, modules: {} });
    }
  });

  it("tundmatu faili versioon jäetakse kõrvale", () => {
    const raw = JSON.stringify({ version: 99, modules: { "physics.demo": valid } });
    expect(parseProgressFile(raw).modules).toEqual({});
  });

  it("katkine kirje ei vii teiste moodulite edenemist kaasa", () => {
    const raw = JSON.stringify({
      version: 1,
      modules: {
        "physics.demo": valid,
        "physics.katki": { moduleId: "physics.katki", status: "hämmastav" },
      },
    });

    expect(parseProgressFile(raw).modules).toEqual({ "physics.demo": valid });
  });

  it("võti ja moduleId peavad klappima", () => {
    const raw = JSON.stringify({ version: 1, modules: { "physics.muu": valid } });
    expect(parseProgressFile(raw).modules).toEqual({});
  });

  it("tundmatu vastusekuju jäetakse kõrvale", () => {
    const withJunk = {
      ...valid,
      responses: {
        "precheck-1": {
          step: "precheck-1",
          questionId: "precheck-1",
          moduleVersion: "1.0.0",
          payload: { kind: "midagi-muud" },
          isCorrect: true,
          revisedCount: 0,
          createdAt: "2026-08-03T10:00:00.000Z",
        },
      },
    };
    const raw = JSON.stringify({ version: 1, modules: { "physics.demo": withJunk } });

    expect(parseProgressFile(raw).modules).toEqual({});
  });

  it("katkine sisu localStorage'is ei takista uue salvestamist", () => {
    const { storage } = memoryStorage({ [PROGRESS_KEY]: "see ei ole json" });
    const store = createProgressStore("persist", () => storage);

    store.write(valid);

    expect(store.read("physics.demo")).toEqual(valid);
  });
});

describe("variandi id vastuse juures", () => {
  /**
   * Variantidega küsimusel peab vastus kandma infot, MILLISELE küsimusele ta
   * anti (docs/MOODULILEPING.md „Juhuslikkus"). Ilma selleta on „55" õpetaja
   * koondvaates mõttetu arv: ta on õige ühe variandi ja vale teise juures.
   */
  it("salvestab valitud variandi vastuse payload'i sisse", () => {
    const progress = withAnswer(fresh(), {
      step: STEP,
      questionId: "precheck-2",
      payload: { kind: "numeric", raw: "55" },
      variantId: "p35",
    });

    expect(progress.responses["precheck-2"]?.payload).toEqual({
      kind: "numeric",
      raw: "55",
      variantId: "p35",
    });
  });

  it("variandita küsimusel ei teki tühja silti", () => {
    const progress = withAnswer(fresh(), {
      step: STEP,
      questionId: "precheck-2",
      payload: { kind: "numeric", raw: "55" },
    });

    expect(progress.responses["precheck-2"]?.payload).not.toHaveProperty("variantId");
  });

  it("loeb variandi salvestusest tagasi, aga viskab vigase kõrvale", () => {
    const withVariant = parseProgressFile(
      JSON.stringify({
        version: 1,
        modules: {
          "physics.demo": {
            ...fresh(),
            responses: {
              "precheck-2": {
                step: "precheck-1",
                questionId: "precheck-2",
                moduleVersion: "1.0.0",
                payload: { kind: "numeric", raw: "55", variantId: "p35" },
                isCorrect: true,
                revisedCount: 0,
                createdAt: "2026-08-03T10:05:00.000Z",
              },
            },
          },
        },
      }),
    );
    expect(
      withVariant.modules["physics.demo"]?.responses["precheck-2"]?.payload,
    ).toHaveProperty("variantId", "p35");

    const broken = parseProgressFile(
      JSON.stringify({
        version: 1,
        modules: {
          "physics.demo": {
            ...fresh(),
            responses: {
              "precheck-2": {
                step: "precheck-1",
                questionId: "precheck-2",
                moduleVersion: "1.0.0",
                payload: { kind: "numeric", raw: "55", variantId: 7 },
                isCorrect: true,
                revisedCount: 0,
                createdAt: "2026-08-03T10:05:00.000Z",
              },
            },
          },
        },
      }),
    );
    expect(broken.modules["physics.demo"]).toBeUndefined();
  });
});
