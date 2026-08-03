import { describe, expect, it } from "vitest";
import {
  STEP_TYPES,
  activitiesSchema,
  manifestSchema,
  stepSchema,
  stepSchemas,
} from "../src/engine/contractSchema";
import { stepQuestions } from "../src/engine/contract";

/**
 * Moodulilepingu skeemi test.
 *
 * Rakendus ise skeemi ei jooksuta (src/engine/contract.ts), seega katkine
 * moodul avastatakse siin. Testitakse REEGLEID (kas id-d on kooskõlas, kas
 * õigeid variante on õige arv), mitte kuju – kuju vaatab TypeScript.
 */

const validManifest = {
  id: "physics.peegeldumisseadus",
  slug: "peegeldumisseadus",
  title: "Valguse peegeldumine",
  subject: "physics",
  goal: "Oskan ennustada, kuhu valguskiir peegeldub",
  outcomes: ["P1-T2"],
  concepts: ["valguskiir", "tasapeegel"],
  practicalWork: ["P1-PT3"],
  minutes: { demo: 10, lesson: 45, homework: 25 },
  version: "1.0.0",
  status: "active",
};

describe("manifestSchema", () => {
  it("võtab vastu korras manifesti", () => {
    expect(() => manifestSchema.parse(validManifest)).not.toThrow();
  });

  it("nõuab, et id oleks täpselt <subject>.<slug>", () => {
    expect(() =>
      manifestSchema.parse({ ...validManifest, slug: "peegeldumine" }),
    ).toThrow();
  });

  it("ei luba tundmatut välja (kirjaviga võtmes on viga, mitte tühjus)", () => {
    expect(() =>
      manifestSchema.parse({ ...validManifest, outcome: ["P1-T2"] }),
    ).toThrow();
  });

  it("nõuab vähemalt üht ainekava õpitulemust", () => {
    expect(() =>
      manifestSchema.parse({ ...validManifest, outcomes: [] }),
    ).toThrow();
  });

  it("nõuab õpitulemuselt ainekava kuju", () => {
    expect(() =>
      manifestSchema.parse({ ...validManifest, outcomes: ["valgus"] }),
    ).toThrow();
  });

  it("nõuab versioonilt kuju major.minor.patch", () => {
    expect(() =>
      manifestSchema.parse({ ...validManifest, version: "1.0" }),
    ).toThrow();
  });

  it("ei luba replacedBy-d aktiivsel moodulil", () => {
    expect(() =>
      manifestSchema.parse({ ...validManifest, replacedBy: "physics.muu" }),
    ).toThrow();
  });

  it("lubab replacedBy arhiveeritud moodulil", () => {
    expect(() =>
      manifestSchema.parse({
        ...validManifest,
        status: "archived",
        replacedBy: "physics.muu",
      }),
    ).not.toThrow();
  });
});

describe("küsimused", () => {
  const choiceStep = (options: unknown) => ({
    type: "precheck",
    id: "precheck-1",
    title: "Eelteadmised",
    questions: [{ kind: "choice", id: "precheck-1", prompt: "Kumb?", options }],
  });

  it("nõuab valikküsimuselt vähemalt üht õiget vastust", () => {
    expect(() =>
      stepSchema.parse(
        choiceStep([
          { id: "a", text: "A", correct: false },
          { id: "b", text: "B", correct: false },
        ]),
      ),
    ).toThrow();
  });

  it("lubab mitut õiget ainult koos multiple: true", () => {
    const options = [
      { id: "a", text: "A", correct: true },
      { id: "b", text: "B", correct: true },
    ];
    expect(() => stepSchema.parse(choiceStep(options))).toThrow();
  });

  it("ei luba väärarusaama silti õige variandi küljes", () => {
    expect(() =>
      stepSchema.parse(
        choiceStep([
          { id: "a", text: "A", correct: true, misconception: "vale-nurk" },
          { id: "b", text: "B", correct: false },
        ]),
      ),
    ).toThrow();
  });

  it("ei luba kaht sama id-ga vastusevarianti", () => {
    expect(() =>
      stepSchema.parse(
        choiceStep([
          { id: "a", text: "A", correct: true },
          { id: "a", text: "B", correct: false },
        ]),
      ),
    ).toThrow();
  });

  it("ei luba üle kahe vihje", () => {
    expect(() =>
      stepSchema.parse({
        type: "practice",
        id: "practice-1",
        title: "Harjuta",
        questions: [
          {
            kind: "numeric",
            id: "practice-1",
            prompt: "Kui suur on nurk?",
            answer: 30,
            unit: "°",
            tolerance: { mode: "absolute", value: 1 },
            hints: ["Vihje 1", "Vihje 2", "Vihje 3"],
          },
        ],
      }),
    ).toThrow();
  });

  it("nõuab explore-sammult vähemalt üht ülesannet", () => {
    expect(() =>
      stepSchema.parse({ type: "explore", id: "explore-1", title: "Katseta", questions: [] }),
    ).toThrow();
  });

  it("nõuab tolerantsilt positiivset väärtust", () => {
    expect(() =>
      stepSchema.parse({
        type: "practice",
        id: "practice-1",
        title: "Harjuta",
        questions: [
          {
            kind: "numeric",
            id: "practice-1",
            prompt: "Kui suur on nurk?",
            answer: 30,
            tolerance: { mode: "percent", value: 0 },
          },
        ],
      }),
    ).toThrow();
  });
});

describe("sammutüüpide register", () => {
  it("iga registri tüüp on ka sammu skeemis", () => {
    // Kui lisad tüübi stepSchemas-i, aga unustad stepSchema loendist, ei
    // valideeriks teda keegi. See test hoiab kaks loendit koos.
    expect(stepSchema.options).toHaveLength(STEP_TYPES.length);
    const inUnion = stepSchema.options.map(
      (option) => option.shape.type.value as string,
    );
    expect([...inUnion].sort()).toEqual([...STEP_TYPES].sort());
  });

  it("sisaldab moodulilepingu üheksat baastüüpi", () => {
    expect(STEP_TYPES).toEqual([
      "theory",
      "hook",
      "precheck",
      "predict",
      "explore",
      "collect",
      "explain",
      "practice",
      "exit",
    ]);
  });

  it("nõuab väljumispiletilt 2–3 küsimust", () => {
    // Moodulileping: exit = „väljumispilet 2–3 küsimust". Ühe küsimusega
    // väljumispilet ei ütle õpetajale, kas asi jäi selgeks või läks õnneks.
    const exitStep = (count: number) => ({
      type: "exit",
      id: "exit-1",
      title: "Väljumispilet",
      questions: Array.from({ length: count }, (_, index) => ({
        kind: "text",
        id: `exit-${index + 1}`,
        prompt: "Mida sa täna õppisid?",
      })),
    });
    expect(() => stepSchema.parse(exitStep(1))).toThrow();
    expect(() => stepSchema.parse(exitStep(2))).not.toThrow();
    expect(() => stepSchema.parse(exitStep(4))).toThrow();
  });

  it("ei tunne tundmatut sammutüüpi", () => {
    expect(() =>
      stepSchema.parse({ type: "video", id: "video-1", title: "Video" }),
    ).toThrow();
  });

  it("stepQuestions annab küsimusteta sammul tühja loendi", () => {
    const theory = stepSchemas.theory.parse({
      type: "theory",
      id: "theory-1",
      title: "Teooria",
      body: ["Valgus levib sirgjooneliselt."],
    });
    expect(stepQuestions(theory)).toEqual([]);
  });
});

describe("activitiesSchema", () => {
  const card = (n: number) => ({
    id: `rc-${n}`,
    type: "concept" as const,
    question: `Küsimus ${n}?`,
    answer: `Vastus ${n}`,
  });
  const reviewCards = [card(1), card(2), card(3)];

  const theoryStep = {
    type: "theory",
    id: "theory-1",
    title: "Teooria",
    body: ["Peegeldumisnurk võrdub langemisnurgaga."],
  };

  const practiceStep = (questionId: string) => ({
    type: "practice",
    id: "practice-1",
    title: "Harjuta",
    questions: [
      {
        kind: "numeric",
        id: questionId,
        prompt: "Kui suur on peegeldumisnurk?",
        answer: 30,
        unit: "°",
        tolerance: { mode: "absolute", value: 1 },
      },
    ],
  });

  it("võtab vastu korras mooduli sisu", () => {
    expect(() =>
      activitiesSchema.parse({
        steps: [theoryStep, practiceStep("practice-1")],
        reviewCards,
      }),
    ).not.toThrow();
  });

  it("nõuab vähemalt kolme kordamiskaarti", () => {
    expect(() =>
      activitiesSchema.parse({
        steps: [theoryStep],
        reviewCards: [card(1), card(2)],
      }),
    ).toThrow();
  });

  it("ei luba kaht sama id-ga sammu", () => {
    expect(() =>
      activitiesSchema.parse({
        steps: [theoryStep, { ...theoryStep }],
        reviewCards,
      }),
    ).toThrow();
  });

  it("nõuab, et sammu id algaks sammu tüübiga", () => {
    expect(() =>
      activitiesSchema.parse({
        steps: [{ ...theoryStep, id: "samm-1" }],
        reviewCards,
      }),
    ).toThrow();
  });

  it("nõuab, et küsimuse id algaks sammu tüübiga", () => {
    // practice-sammus olev küsimus exit-1 lõhuks õpetaja koondvaate:
    // vastus näiks tulevat väljumispiletist.
    expect(() =>
      activitiesSchema.parse({
        steps: [practiceStep("exit-1")],
        reviewCards,
      }),
    ).toThrow();
  });

  it("ei luba kaht sama id-ga küsimust üle mooduli", () => {
    expect(() =>
      activitiesSchema.parse({
        steps: [
          practiceStep("practice-1"),
          { ...practiceStep("practice-1"), id: "practice-2" },
        ],
        reviewCards,
      }),
    ).toThrow();
  });

  it("ei luba kaht sama id-ga kordamiskaarti", () => {
    expect(() =>
      activitiesSchema.parse({
        steps: [theoryStep],
        reviewCards: [card(1), card(2), { ...card(3), id: "rc-1" }],
      }),
    ).toThrow();
  });

  const exploreStep = (unlocks: unknown) => ({
    type: "explore",
    id: "explore-1",
    title: "Katseta",
    questions: [
      {
        kind: "numeric",
        id: "explore-1",
        prompt: "Sea langemisnurk 30°. Mis on peegeldumisnurk?",
        answer: 30,
        unit: "°",
        tolerance: { mode: "absolute", value: 1 },
      },
      {
        kind: "numeric",
        id: "explore-2",
        prompt: "Leia nurk, mille korral kiir peegeldub otse tagasi.",
        answer: 0,
        unit: "°",
        tolerance: { mode: "absolute", value: 1 },
      },
    ],
    simulation: { unlocks },
  });

  it("lubab lisavõimalusel avaneda sama sammu küsimuse järel", () => {
    expect(() =>
      activitiesSchema.parse({
        steps: [exploreStep([{ feature: "mattpind", afterQuestion: "explore-2" }])],
        reviewCards,
      }),
    ).not.toThrow();
  });

  it("ei luba lisavõimalust avaneda küsimuse järel, mida sammus ei ole", () => {
    expect(() =>
      activitiesSchema.parse({
        steps: [exploreStep([{ feature: "mattpind", afterQuestion: "explore-9" }])],
        reviewCards,
      }),
    ).toThrow();
  });

  it("ei luba sama lisavõimalust kahe unlock-kirjena", () => {
    expect(() =>
      activitiesSchema.parse({
        steps: [
          exploreStep([
            { feature: "mattpind", afterQuestion: "explore-1" },
            { feature: "mattpind", afterQuestion: "explore-2" },
          ]),
        ],
        reviewCards,
      }),
    ).toThrow();
  });

  const explainStep = (recallQuestion: string) => ({
    type: "explain",
    id: "explain-1",
    title: "Selgita",
    recallQuestion,
    questions: [
      {
        kind: "text",
        id: "explain-1",
        prompt: "Sõnasta seaduspärasus.",
        minWords: 15,
      },
    ],
  });

  it("lubab meelde tuletada varasema sammu küsimust", () => {
    expect(() =>
      activitiesSchema.parse({
        steps: [practiceStep("practice-1"), explainStep("practice-1")],
        reviewCards,
      }),
    ).not.toThrow();
  });

  it("ei luba meelde tuletada küsimust, mida moodulis ei ole", () => {
    expect(() =>
      activitiesSchema.parse({
        steps: [explainStep("predict-9")],
        reviewCards,
      }),
    ).toThrow();
  });

  it("ei luba meelde tuletada hilisema sammu küsimust", () => {
    // Sellele ei ole selleks hetkeks veel vastatud – meeldetuletus jääks
    // igaveseks tühjaks ja seda ei paneks keegi brauseris tähele.
    expect(() =>
      activitiesSchema.parse({
        steps: [explainStep("practice-1"), practiceStep("practice-1")],
        reviewCards,
      }),
    ).toThrow();
  });
});
