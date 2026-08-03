import { describe, expect, it } from "vitest";
import type { Answers } from "../src/engine/answers";
import type { Step } from "../src/engine/contract";
import { recallAnswer } from "../src/engine/recall";

/**
 * Varasema vastuse meeldetuletus (explain-samm näitab õpilase ennustust).
 *
 * Kaks reeglit, mida testid valvavad: vastus tuleb ÕPILASE keeles (valiku id
 * asemel variandi tekst) ja puuduolev vastus ei tekita tühja kasti, vaid
 * `null`-i.
 */

const steps: Step[] = [
  {
    type: "predict",
    id: "predict-1",
    title: "Paku ennustus",
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt: "Kui suur on peegeldumisnurk?",
        options: [
          { id: "15", text: "15°", correct: false },
          { id: "30", text: "30°", correct: true },
        ],
      },
    ],
  },
  {
    type: "explore",
    id: "explore-1",
    title: "Katseta",
    questions: [
      {
        kind: "numeric",
        id: "explore-1",
        prompt: "Mis on peegeldumisnurk?",
        answer: 30,
        unit: "°",
        tolerance: { mode: "absolute", value: 1 },
      },
    ],
  },
];

describe("recallAnswer", () => {
  it("annab valikvastuse variandi TEKSTI, mitte id", () => {
    const answers: Answers = { "predict-1": { kind: "choice", optionIds: ["15"] } };
    expect(recallAnswer(steps, answers, "predict-1")).toEqual({
      prompt: "Kui suur on peegeldumisnurk?",
      text: "15°",
    });
  });

  it("ei reeda, milline variant oli õige", () => {
    // Vale ennustus näeb välja täpselt nagu õige – ennustust ei hinnata.
    const answers: Answers = { "predict-1": { kind: "choice", optionIds: ["15"] } };
    const recalled = recallAnswer(steps, answers, "predict-1");
    expect(recalled?.text).not.toContain("30");
  });

  it("annab arvvastuse õpilase tipitud kujul", () => {
    const answers: Answers = { "explore-1": { kind: "numeric", raw: "30,0°" } };
    expect(recallAnswer(steps, answers, "explore-1")?.text).toBe("30,0°");
  });

  it("annab null-i, kui õpilane ei ole vastanud", () => {
    expect(recallAnswer(steps, {}, "predict-1")).toBeNull();
  });

  it("annab null-i, kui küsimust ei ole (ümber nimetatud id)", () => {
    const answers: Answers = { "predict-1": { kind: "choice", optionIds: ["15"] } };
    expect(recallAnswer(steps, answers, "predict-9")).toBeNull();
  });

  it("annab null-i, kui vastus ei käi küsimusega kokku", () => {
    // Katkine moodul või vana vastus – parem mitte midagi kui vale asi.
    const answers: Answers = { "predict-1": { kind: "numeric", raw: "30" } };
    expect(recallAnswer(steps, answers, "predict-1")).toBeNull();
  });

  it("annab null-i, kui valitud varianti küsimuses ei ole", () => {
    const answers: Answers = { "predict-1": { kind: "choice", optionIds: ["puudub"] } };
    expect(recallAnswer(steps, answers, "predict-1")).toBeNull();
  });

  it("annab null-i ka siis, kui ÜKS valik on tundmatu", () => {
    // CodeRabbiti ülevaatuse leid (2026-08-03): tundmatu variant filtreeriti
    // vaikselt välja ja õpilane nägi POOLIKUT ennustust omaenda vastuse
    // pähe. Sama reegel mis valikuchecker'is (samm 1.5): pool vastust ei ole
    // vastus.
    const answers: Answers = { "predict-1": { kind: "choice", optionIds: ["15", "puudub"] } };
    expect(recallAnswer(steps, answers, "predict-1")).toBeNull();
  });
});
