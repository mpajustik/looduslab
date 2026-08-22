import { describe, expect, it } from "vitest";
import { checkAnswer } from "../src/checker";
import { checkLabelAnswer } from "../src/checker/label";
import { stepSchema } from "../src/engine/contractSchema";
import type { LabelQuestion } from "../src/engine/contract";
import { readableAnswerText } from "../src/engine/recall";

/**
 * „Märgi joonisele" (plaan/LUHITOOD.md etapp A): checker ja skeem.
 *
 * Kaks poolt ühes failis, sest nad valvavad sama asja eri otsast: skeem
 * hoiab ära katkise küsimuse, checker otsustab vastuse õigsuse (CLAUDE.md
 * reegel 3).
 */

const question: LabelQuestion = {
  kind: "label",
  id: "practice-1",
  prompt: "Märgi joonisele, mis on mis.",
  figure: "peegeldumise-osad",
  spots: [
    { id: "s1", marker: 1, answer: "langev-kiir" },
    { id: "s2", marker: 2, answer: "ristsirge" },
    { id: "s3", marker: 3, answer: "peegeldunud-kiir" },
  ],
  names: [
    { id: "langev-kiir", text: "langev kiir" },
    { id: "ristsirge", text: "pinna ristsirge" },
    { id: "peegeldunud-kiir", text: "peegeldunud kiir" },
    { id: "valguse-kiirus", text: "valguse kiirus" },
  ],
};

const allCorrect = {
  s1: "langev-kiir",
  s2: "ristsirge",
  s3: "peegeldunud-kiir",
};

describe("checkLabelAnswer", () => {
  it("kõik kohad õigesti on õige vastus", () => {
    expect(checkLabelAnswer(question, allCorrect).correct).toBe(true);
  });

  it("üks koht valesti teeb terve vastuse valeks", () => {
    // Osaliselt õige EI ole õige: muidu tähendaks „õige", et joonis on selge,
    // kuigi osa sellest on veel segi.
    const result = checkLabelAnswer(question, { ...allCorrect, s3: "valguse-kiirus" });
    expect(result.correct).toBe(false);
  });

  it("ütleb, mitu kohta oli õigesti – aga mitte, millised", () => {
    const result = checkLabelAnswer(question, { ...allCorrect, s3: "valguse-kiirus" });
    expect(result.feedback).toBe("Õigesti on 2 kohta 3-st.");
    // Ilma selleta saaks paari katsega kõik kohad ükshaaval välja nuputada:
    // tagasiside ei tohi nimetada, MILLINE koht oli õigesti.
    for (const name of question.names) {
      expect(result.feedback).not.toContain(name.text);
    }
  });

  it("ainsuse ja mitmuse lõpp on eesti keeles õige", () => {
    const result = checkLabelAnswer(question, {
      s1: "langev-kiir",
      s2: "valguse-kiirus",
      s3: "ristsirge",
    });
    expect(result.feedback).toBe("Õigesti on 1 koht 3-st.");
  });

  it("täiesti vale vastus saab oma lause, mitte nulliga loenduse", () => {
    const result = checkLabelAnswer(question, {
      s1: "ristsirge",
      s2: "peegeldunud-kiir",
      s3: "langev-kiir",
    });
    expect(result.feedback).toBe("Ükski nimi ei ole veel õiges kohas.");
  });

  it("eristab nimetamata kohta valest nimest", () => {
    // „Õigesti on 2 kohta 3-st" jätaks mulje, et kolmas on valesti – kuigi ta
    // on lihtsalt nimetamata.
    const result = checkLabelAnswer(question, { s1: "langev-kiir", s2: "ristsirge" });
    expect(result.correct).toBe(false);
    expect(result.feedback).toBe("Nimetamata on veel 1 koht 3-st.");
  });

  it("tühi vastus on vale, mitte hindamata", () => {
    const result = checkLabelAnswer(question, {});
    expect(result.correct).toBe(false);
    expect(result.feedback).toBe("Ükski koht ei ole veel nimetatud.");
  });

  it("näitab vale vastuse juures õiget vastust numbrite järjekorras", () => {
    const result = checkLabelAnswer(question, { ...allCorrect, s3: "valguse-kiirus" });
    expect(result.expected).toBe(
      "Õige vastus: 1 – langev kiir, 2 – pinna ristsirge, 3 – peegeldunud kiir.",
    );
  });

  it("ei anna õige vastuse juures õiget vastust ette", () => {
    expect(checkLabelAnswer(question, allCorrect).expected).toBeUndefined();
  });

  it("tundmatu koha id-ga vastust ei hinnata", () => {
    // Moodul muutus vahepeal – see on rakenduse, mitte õpilase viga.
    const result = checkLabelAnswer(question, { ...allCorrect, s9: "ristsirge" });
    expect(result.correct).toBeNull();
  });

  it("tundmatu nime id-ga vastust ei hinnata", () => {
    const result = checkLabelAnswer(question, { ...allCorrect, s1: "peegel" });
    expect(result.correct).toBeNull();
  });

  it("checkAnswer viib küsimuse ja vastuse kokku", () => {
    expect(
      checkAnswer(question, { kind: "label", picks: allCorrect }).correct,
    ).toBe(true);
  });

  it("vale liiki vastust ei hinnata", () => {
    expect(checkAnswer(question, { kind: "text", text: "30" }).correct).toBeNull();
  });
});

describe("readableAnswerText – märgi joonisele", () => {
  it("annab vastuse numbrite järjekorras ja nimede tekstiga", () => {
    expect(readableAnswerText(question, { kind: "label", picks: allCorrect })).toBe(
      "1 – langev kiir, 2 – pinna ristsirge, 3 – peegeldunud kiir",
    );
  });

  it("jätab tundmatu nime korral meeldetuletuse tegemata", () => {
    expect(
      readableAnswerText(question, { kind: "label", picks: { s1: "peegel" } }),
    ).toBeUndefined();
  });
});

describe("label-küsimuse skeem", () => {
  const labelStep = (question: Record<string, unknown>) => ({
    type: "practice",
    id: "practice-1",
    title: "Harjuta",
    questions: [
      {
        kind: "label",
        id: "practice-1",
        prompt: "Märgi joonisele, mis on mis.",
        figure: "peegeldumise-osad",
        spots: [
          { id: "s1", marker: 1, answer: "langev-kiir" },
          { id: "s2", marker: 2, answer: "ristsirge" },
        ],
        names: [
          { id: "langev-kiir", text: "langev kiir" },
          { id: "ristsirge", text: "pinna ristsirge" },
        ],
        ...question,
      },
    ],
  });

  it("võtab vastu korras küsimuse", () => {
    expect(() => stepSchema.parse(labelStep({}))).not.toThrow();
  });

  it("nõuab joonist – ilma selleta ei ole midagi märkida", () => {
    const step = labelStep({});
    delete (step.questions[0] as Record<string, unknown>).figure;
    expect(() => stepSchema.parse(step)).toThrow();
  });

  it("nõuab vähemalt kaht kohta", () => {
    expect(() =>
      stepSchema.parse(
        labelStep({ spots: [{ id: "s1", marker: 1, answer: "langev-kiir" }] }),
      ),
    ).toThrow();
  });

  it("ei luba kaht sama id-ga kohta", () => {
    expect(() =>
      stepSchema.parse(
        labelStep({
          spots: [
            { id: "s1", marker: 1, answer: "langev-kiir" },
            { id: "s1", marker: 2, answer: "ristsirge" },
          ],
        }),
      ),
    ).toThrow();
  });

  it("ei luba kaht sama id-ga nime", () => {
    expect(() =>
      stepSchema.parse(
        labelStep({
          names: [
            { id: "langev-kiir", text: "langev kiir" },
            { id: "langev-kiir", text: "pinna ristsirge" },
          ],
        }),
      ),
    ).toThrow();
  });

  it("nõuab numbreid 1 … n ilma aukudeta", () => {
    // Auk tähendaks joonisel numbrit, mille juurde ei käi ühtegi valikut.
    expect(() =>
      stepSchema.parse(
        labelStep({
          spots: [
            { id: "s1", marker: 1, answer: "langev-kiir" },
            { id: "s2", marker: 4, answer: "ristsirge" },
          ],
        }),
      ),
    ).toThrow();
  });

  it("ei luba kaht sama numbriga kohta", () => {
    expect(() =>
      stepSchema.parse(
        labelStep({
          spots: [
            { id: "s1", marker: 1, answer: "langev-kiir" },
            { id: "s2", marker: 1, answer: "ristsirge" },
          ],
        }),
      ),
    ).toThrow();
  });

  it("ei luba osutada nimele, mida loendis ei ole", () => {
    // Sellisele kohale ei saaks õpilane KUNAGI õigesti vastata.
    expect(() =>
      stepSchema.parse(
        labelStep({
          spots: [
            { id: "s1", marker: 1, answer: "langev-kiir" },
            { id: "s2", marker: 2, answer: "peegel" },
          ],
        }),
      ),
    ).toThrow();
  });

  it("ei luba ühte nime õigeks vastuseks kahes kohas", () => {
    expect(() =>
      stepSchema.parse(
        labelStep({
          spots: [
            { id: "s1", marker: 1, answer: "langev-kiir" },
            { id: "s2", marker: 2, answer: "langev-kiir" },
          ],
        }),
      ),
    ).toThrow();
  });

  it("lubab nimesid rohkem kui kohti (eksitajad)", () => {
    expect(() =>
      stepSchema.parse(
        labelStep({
          names: [
            { id: "langev-kiir", text: "langev kiir" },
            { id: "ristsirge", text: "pinna ristsirge" },
            { id: "valguse-kiirus", text: "valguse kiirus" },
          ],
        }),
      ),
    ).not.toThrow();
  });

  it("ei luba kaht nime sama tekstiga", () => {
    // Eri id, sama tekst annaks rippmenüüsse kaks ühesugust rida, millest üks
    // on õige ja teine vale – õpilane ei saaks neid kuidagi eristada.
    expect(() =>
      stepSchema.parse(
        labelStep({
          names: [
            { id: "langev-kiir", text: "langev kiir" },
            { id: "ristsirge", text: "pinna ristsirge" },
            { id: "langev-kiir-2", text: "langev kiir" },
          ],
        }),
      ),
    ).toThrow();
  });

  it("ei luba tundmatut välja", () => {
    expect(() => stepSchema.parse(labelStep({ shuffle: true }))).toThrow();
  });
});
