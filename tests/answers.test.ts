import { describe, expect, it } from "vitest";
import { isStepAnswered } from "../src/engine/answers";
import type { AnswerPayload } from "../src/engine/answers";
import type { Step } from "../src/engine/contract";

/**
 * „Edasi" luku loogika (samm 1.3).
 *
 * See on ainus koht, mis otsustab, kas õpilane saab sammult edasi – seepärast
 * on tal test, kuigi ta on lühike. Vaade (StepShell) ainult küsib.
 */

const theoryStep: Step = {
  type: "theory",
  id: "theory-1",
  title: "Valgus liigub sirgjooneliselt",
  body: ["Ühtlases keskkonnas liigub valgus sirget joont mööda."],
};

/** Kaks küsimust, et saaks katsetada ka poolikut vastamist. */
const precheckStep: Step = {
  type: "precheck",
  id: "precheck-1",
  title: "Kontrolli, kas jäi meelde",
  questions: [
    {
      kind: "choice",
      id: "precheck-1",
      prompt: "Millise joone suhtes mõõdetakse langemisnurka?",
      options: [
        { id: "pind", text: "Peegli pinna suhtes", correct: false },
        { id: "normaal", text: "Normaali suhtes", correct: true },
      ],
    },
    {
      kind: "numeric",
      id: "precheck-2",
      prompt: "Kui suur on normaali ja peegli pinna vaheline nurk?",
      answer: 90,
      unit: "°",
      tolerance: { mode: "absolute", value: 0 },
    },
  ],
};

const chose = (optionId: string): AnswerPayload => ({
  kind: "choice",
  optionIds: [optionId],
});

describe("isStepAnswered", () => {
  it("laseb vastuseta sammult (theory) alati edasi", () => {
    expect(isStepAnswered(theoryStep, {})).toBe(true);
  });

  it("hoiab vastamata sammu kinni", () => {
    expect(isStepAnswered(precheckStep, {})).toBe(false);
  });

  it("hoiab kinni ka siis, kui osa küsimusi on vastamata", () => {
    expect(isStepAnswered(precheckStep, { "precheck-1": chose("normaal") })).toBe(false);
  });

  it("avab luku, kui kõik küsimused on vastatud", () => {
    expect(
      isStepAnswered(precheckStep, {
        "precheck-1": chose("normaal"),
        "precheck-2": { kind: "numeric", raw: "90" },
      }),
    ).toBe(true);
  });

  it("ei vaata, kas vastus oli õige – vale vastus avab samuti luku", () => {
    expect(
      isStepAnswered(precheckStep, {
        "precheck-1": chose("pind"),
        "precheck-2": { kind: "numeric", raw: "45" },
      }),
    ).toBe(true);
  });

  it("ei loe vastuseks teise sammu küsimuse vastust", () => {
    expect(isStepAnswered(precheckStep, { "explore-1": chose("normaal") })).toBe(false);
  });
});
