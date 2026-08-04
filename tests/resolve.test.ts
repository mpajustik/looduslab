import { describe, expect, it } from "vitest";
import type { ChoiceQuestion, NumericQuestion, Step } from "../src/engine/contract";
import {
  answersForCurrentVariants,
  attemptSeed,
  resolveSteps,
} from "../src/engine/resolve";

/**
 * Juhuslikkus: valikvastuste järjekord ja arvuvariandid (src/engine/resolve.ts).
 *
 * Kaks asja, mis peavad korraga kehtima: küsimus vahetub käikude vahel, aga
 * EI vahetu ühe käigu sees. Kumbki üksi ei aita – muutumatu küsimus tähendab
 * pähe õpitud vastust, keset käiku muutuv küsimus aga seda, et õpilane vastab
 * ühele ekraanile ja checker kontrollib teist.
 */

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function stepWith(questions: (ChoiceQuestion | NumericQuestion)[]): Step {
  return { type: "precheck", id: "precheck-1", title: "Proovi", questions };
}

function choiceStep(options: string[], shuffle?: boolean): Step {
  const question: ChoiceQuestion = {
    kind: "choice",
    id: "precheck-1",
    prompt: "Kumb on õige?",
    options: options.map((id, index) => ({ id, text: id, correct: index === 0 })),
    ...(shuffle === undefined ? {} : { shuffle }),
  };
  return stepWith([question]);
}

/** Esimese sammu küsimused – nii, nagu õpilane neid ekraanil näeb. */
function questionsOf(steps: Step[]) {
  const step = steps[0];
  return "questions" in step ? step.questions : [];
}

/** Variantide id-d selles järjekorras, nagu õpilane neid ekraanil näeb. */
function optionOrder(steps: Step[]): string[] {
  const question = questionsOf(steps)[0];
  return question?.kind === "choice" ? question.options.map((option) => option.id) : [];
}

const OPTIONS = ["a", "b", "c", "d", "e"];

describe("valikvastuste segamine", () => {
  it("sama seeme annab alati sama järjekorra", () => {
    const steps = [choiceStep(OPTIONS)];
    const first = optionOrder(resolveSteps(steps, 12345).steps);
    const second = optionOrder(resolveSteps(steps, 12345).steps);
    expect(second).toEqual(first);
  });

  it("teine seeme annab teise järjekorra", () => {
    const steps = [choiceStep(OPTIONS)];
    const orders = SEEDS.map((seed) => optionOrder(resolveSteps(steps, seed).steps).join(""));
    // Kümme eri seemet ei tohi anda kümmet ühesugust rida. (Üksik
    // kokkulangevus on lubatud – Fisher–Yates võib anda ka algse järjekorra.)
    expect(new Set(orders).size).toBeGreaterThan(1);
  });

  it("ükski variant ei kao ega teki juurde", () => {
    const order = optionOrder(resolveSteps([choiceStep(OPTIONS)], 7).steps);
    expect([...order].sort()).toEqual([...OPTIONS].sort());
  });

  it("shuffle: false hoiab autori järjekorra", () => {
    for (const seed of SEEDS) {
      expect(optionOrder(resolveSteps([choiceStep(OPTIONS, false)], seed).steps)).toEqual(
        OPTIONS,
      );
    }
  });

  it("kaks küsimust ühes sammus ei sega end ühtemoodi", () => {
    // Seeme seotakse küsimuse id-ga. Ilma selleta oleks igal küsimusel sama
    // „loos" ja mustri õppimine oleks tagasi (a → c, b → a igal küsimusel).
    const first: ChoiceQuestion = {
      kind: "choice",
      id: "precheck-1",
      prompt: "Esimene",
      options: OPTIONS.map((id, index) => ({ id, text: id, correct: index === 0 })),
    };
    const second: ChoiceQuestion = { ...first, id: "precheck-2", prompt: "Teine" };
    const resolved = resolveSteps([stepWith([first, second])], 42).steps;
    const orders = questionsOf(resolved).map((question) =>
      question.kind === "choice"
        ? question.options.map((option) => option.id).join("")
        : "",
    );
    expect(orders[0]).not.toEqual(orders[1]);
  });
});

describe("arvuvariandid", () => {
  /** Kaks varianti: sama küsimus, eri arv, eri vastus ja eri lõks. */
  const variantQuestion: NumericQuestion = {
    kind: "numeric",
    id: "practice-1",
    prompt: "Kiir moodustab pinnaga {pinnanurk}° nurga. Kui suur on nurk ristsirgest?",
    hints: ["Ristsirge ja pinna vahel on 90°.", "Sinu arv on {pinnanurk}°."],
    unit: "°",
    tolerance: { mode: "absolute", value: 0.5 },
    variants: [
      {
        id: "p35",
        values: { pinnanurk: 35 },
        answer: 55,
        traps: [{ answer: 35, misconception: "nurk-pinna-suhtes", feedback: "Pinna suhtes." }],
      },
      {
        id: "p20",
        values: { pinnanurk: 20 },
        answer: 70,
        traps: [{ answer: 20, misconception: "nurk-pinna-suhtes", feedback: "Pinna suhtes." }],
      },
    ],
  };

  const resolveOne = (seed: number) => {
    const result = resolveSteps([stepWith([variantQuestion])], seed);
    const question = questionsOf(result.steps)[0];
    if (question?.kind !== "numeric") throw new Error("küsimus kadus");
    return { question, variantIds: result.variantIds };
  };

  it("kohahoidja asendub päris arvuga", () => {
    for (const seed of SEEDS) {
      const { question } = resolveOne(seed);
      expect(question.prompt).not.toContain("{");
      expect(question.prompt).toMatch(/pinnaga (35|20)° nurga/);
    }
  });

  it("ka vihjed saavad sama variandi arvu", () => {
    const { question } = resolveOne(1);
    const shown = question.prompt.match(/pinnaga (\d+)°/)?.[1];
    expect(question.hints?.[1]).toBe(`Sinu arv on ${shown}°.`);
  });

  it("õige vastus ja lõks tulevad valitud variandist", () => {
    for (const seed of SEEDS) {
      const { question } = resolveOne(seed);
      const shown = Number(question.prompt.match(/pinnaga (\d+)°/)?.[1]);
      // Vastus PEAB käima kokku sellega, mis ekraanil on – muidu kontrollib
      // checker teist ülesannet kui see, mille õpilane luges.
      expect(question.answer).toBe(90 - shown);
      expect(question.traps?.[0].answer).toBe(shown);
    }
  });

  it("valitud variandi id jõuab salvestuseni", () => {
    for (const seed of SEEDS) {
      const { question, variantIds } = resolveOne(seed);
      const shown = Number(question.prompt.match(/pinnaga (\d+)°/)?.[1]);
      expect(variantIds["practice-1"]).toBe(shown === 35 ? "p35" : "p20");
    }
  });

  it("variandid on pärast valikut otsas – teist loosi ei tehta", () => {
    expect(resolveOne(1).question.variants).toBeUndefined();
  });

  it("sama seeme annab alati sama variandi", () => {
    expect(resolveOne(12345).question.prompt).toBe(resolveOne(12345).question.prompt);
  });

  it("eri seemned annavad ka teise variandi", () => {
    const seen = new Set(SEEDS.map((seed) => resolveOne(seed).variantIds["practice-1"]));
    expect(seen.size).toBe(2);
  });

  it("variantideta arvküsimus jääb muutumatuks", () => {
    const plain: NumericQuestion = {
      kind: "numeric",
      id: "exit-2",
      prompt: "Langemisnurk on 50°. Kui suur on peegeldumisnurk?",
      answer: 50,
      unit: "°",
      tolerance: { mode: "absolute", value: 0.5 },
    };
    const result = resolveSteps([stepWith([plain])], 5);
    expect(questionsOf(result.steps)[0]).toEqual(plain);
    // Variantideta küsimusel ei ole midagi salvestada – tühi kirje tähendaks
    // õpetaja koondvaates variandisilti, mida ei ole olemas.
    expect(result.variantIds).toEqual({});
  });

  it("kümnendkoht kirjutatakse eesti moodi komaga", () => {
    const decimal: NumericQuestion = {
      kind: "numeric",
      id: "practice-1",
      prompt: "Kaugus on {kaugus} m. Mitu meetrit läbib kiir?",
      unit: "m",
      tolerance: { mode: "absolute", value: 0.1 },
      variants: [
        { id: "k1", values: { kaugus: 2.5 }, answer: 5 },
        { id: "k2", values: { kaugus: 2.5 }, answer: 5 },
      ],
    };
    const question = questionsOf(resolveSteps([stepWith([decimal])], 1).steps)[0];
    expect(question?.kind === "numeric" ? question.prompt : "").toContain("2,5 m");
  });
});

describe("sammud, mida ei puudutata", () => {
  it("küsimusteta samm jääb muutumatuks", () => {
    const steps: Step[] = [
      { type: "theory", id: "theory-1", title: "Valgus", body: ["Sirgjooneliselt."] },
    ];
    expect(resolveSteps(steps, 3).steps).toEqual(steps);
  });

  it("algne loend ei muutu (puhas funktsioon)", () => {
    const steps = [choiceStep(OPTIONS)];
    resolveSteps(steps, 9);
    expect(optionOrder(steps)).toEqual(OPTIONS);
  });
});

describe("moodulikäigu seeme", () => {
  it("sama algusaeg annab sama seemne", () => {
    expect(attemptSeed("2026-08-04T10:00:00.000Z")).toBe(
      attemptSeed("2026-08-04T10:00:00.000Z"),
    );
  });

  it("uus käik (uus algusaeg) annab uue seemne", () => {
    // „Alusta uuesti" teeb uue moodulikäigu uue algusajaga – just see on koht,
    // kus õpilane peab saama teise küsimuse (kasutaja otsus 2026-08-04).
    expect(attemptSeed("2026-08-04T10:00:00.000Z")).not.toBe(
      attemptSeed("2026-08-04T10:00:00.001Z"),
    );
  });
});

/**
 * Juba vastatud küsimus ei tohi variandiks vahetada (Codexi ülevaatuse leid,
 * 2026-08-04).
 *
 * Loos käib variantide loendi INDEKSI järgi. Kui moodulile lisatakse hiljem
 * variant juurde – mida moodulileping lubab minor-muudatusena –, muutub
 * loendi pikkus ja sama seeme annab teise variandi. Õpilase salvestatud
 * vastus ripuks siis teise arvuga küsimuse küljes: ekraanil punane rist
 * ülesande eest, mida ta ei näinudki.
 */
describe("juba vastatud variant jääb paigale", () => {
  const question: NumericQuestion = {
    kind: "numeric",
    id: "practice-1",
    prompt: "Kiir moodustab pinnaga {pinnanurk}° nurga. Kui suur on nurk ristsirgest?",
    unit: "°",
    tolerance: { mode: "absolute", value: 0.5 },
    variants: [
      { id: "p35", values: { pinnanurk: 35 }, answer: 55 },
      { id: "p20", values: { pinnanurk: 20 }, answer: 70 },
    ],
  };
  /** Sama küsimus pärast seda, kui autor lisas kaks varianti juurde. */
  const grown: NumericQuestion = {
    ...question,
    variants: [
      ...question.variants!,
      { id: "p50", values: { pinnanurk: 50 }, answer: 40 },
      { id: "p65", values: { pinnanurk: 65 }, answer: 25 },
    ],
  };

  const variantAt = (numeric: NumericQuestion, seed: number, answered = {}) =>
    resolveSteps([stepWith([numeric])], seed, answered).variantIds["practice-1"];

  it("ilma paranduseta NIHKUKS loos – see test hoiab ohu nähtavana", () => {
    // Kui see test ühel päeval kukub, ei ole viga mitte siin: siis on muutunud
    // räsi või loend. Ilma nihketa oleks järgmine test tühi tõotus – ta
    // „hoiaks paigal" midagi, mis niikuinii ei liigu.
    const shifted = SEEDS.filter(
      (seed) => variantAt(question, seed) !== variantAt(grown, seed),
    );
    expect(shifted.length).toBeGreaterThan(0);
  });

  it("salvestatud variant võidab loosi, kui variante tuleb juurde", () => {
    for (const seed of SEEDS) {
      const answeredWith = variantAt(question, seed);
      // Ilma salvestatud variandita võib loos uues loendis mujale kukkuda…
      // …aga salvestatud variandiga peab ta jääma täpselt sinna, kus oli.
      expect(variantAt(grown, seed, { "practice-1": answeredWith })).toBe(answeredWith);
    }
  });

  it("salvestatud variandi arv jääb ka küsimuse teksti", () => {
    const resolved = resolveSteps([stepWith([grown])], 1, { "practice-1": "p65" });
    const shown = questionsOf(resolved.steps)[0];
    expect(shown?.kind === "numeric" ? shown.prompt : "").toContain("pinnaga 65°");
    expect(shown?.kind === "numeric" ? shown.answer : 0).toBe(25);
  });

  it("kadunud variant ei jäta vastust valesse kohta rippuma", () => {
    // Variandi EEMALDAMINE on major-muudatus. Siis ei ole enam midagi
    // taastada – loos otsustab ja vana vastus tuleb kõrvale jätta
    // (vt answersForCurrentVariants).
    const resolved = resolveSteps([stepWith([question])], 1, { "practice-1": "kadunud" });
    const chosen = resolved.variantIds["practice-1"];
    expect(["p35", "p20"]).toContain(chosen);
    expect(
      answersForCurrentVariants(
        { "practice-1": { kind: "numeric", raw: "55", variantId: "kadunud" } },
        resolved.variantIds,
      )["practice-1"],
    ).toBeUndefined();
  });

  it("õige variandi vastus jääb alles", () => {
    const resolved = resolveSteps([stepWith([question])], 1, {});
    const chosen = resolved.variantIds["practice-1"];
    const answers = { "practice-1": { kind: "numeric" as const, raw: "55", variantId: chosen } };
    expect(answersForCurrentVariants(answers, resolved.variantIds)).toEqual(answers);
  });

  it("teadusliku kuju arv ei ümardu nulliks", () => {
    // Valguse lainepikkus 5e-7 m on 8. klassi optikas päris võimalik arv.
    // `String(5e-7)` annab „5e-7", seega ilma eksponenti lugemata tuleks
    // küsimusse „0 m" (CodeRabbiti ülevaatuse leid 2026-08-04).
    const wavelength: NumericQuestion = {
      kind: "numeric",
      id: "practice-2",
      prompt: "Lainepikkus on {pikkus} m. Mitu nanomeetrit see on?",
      unit: "nm",
      tolerance: { mode: "absolute", value: 1 },
      variants: [
        { id: "w5", values: { pikkus: 5e-7 }, answer: 500 },
        { id: "w6", values: { pikkus: 6e-7 }, answer: 600 },
      ],
    };
    const shown = questionsOf(resolveSteps([stepWith([wavelength])], 2).steps)[0];
    expect(shown?.kind === "numeric" ? shown.prompt : "").toMatch(
      /Lainepikkus on 0,000000[56] m/,
    );
  });

  it("variandita küsimuse vastust ei puudutata", () => {
    const answers = { "exit-3": { kind: "text" as const, text: "Õppisin peegeldumist." } };
    expect(answersForCurrentVariants(answers, {})).toEqual(answers);
  });
});
