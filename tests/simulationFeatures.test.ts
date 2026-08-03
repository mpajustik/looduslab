import { describe, expect, it } from "vitest";
import type { Step } from "../src/engine/contract";
import { unlockedSimulationFeatures } from "../src/engine/simulationFeatures";

/**
 * unlockedSimulationFeatures test (samm 1.9).
 *
 * Mattpinna lüliti (sisu/MOODUL-peegeldumisseadus.md „explore") avaneb pärast
 * ülesannet 2 – see funktsioon on ainus koht, mis seda otsustab.
 */

const exploreStep: Extract<Step, { type: "explore" }> = {
  type: "explore",
  id: "explore-1",
  title: "Katseta",
  questions: [
    { kind: "numeric", id: "explore-1", prompt: "?", answer: 30, tolerance: { mode: "absolute", value: 1 } },
    { kind: "numeric", id: "explore-2", prompt: "?", answer: 0, tolerance: { mode: "absolute", value: 1 } },
  ],
  simulation: { unlocks: [{ feature: "mattpind", afterQuestion: "explore-2" }] },
};

describe("unlockedSimulationFeatures", () => {
  it("annab tühja hulga, kui vastamata", () => {
    expect(unlockedSimulationFeatures(exploreStep, {}).size).toBe(0);
  });

  it("annab tühja hulga, kui vastatud on teisele küsimusele", () => {
    const answers = { "explore-1": { kind: "numeric" as const, raw: "30" } };
    expect(unlockedSimulationFeatures(exploreStep, answers).has("mattpind")).toBe(false);
  });

  it("avab lisavõimaluse, kui nõutud küsimusele on vastatud", () => {
    const answers = { "explore-2": { kind: "numeric" as const, raw: "0" } };
    expect(unlockedSimulationFeatures(exploreStep, answers).has("mattpind")).toBe(true);
  });

  it("annab tühja hulga sammul, millel simulatsiooni lisavõimalusi ei ole", () => {
    const withoutSimulation: Extract<Step, { type: "explore" }> = {
      ...exploreStep,
      simulation: undefined,
    };
    const answers = { "explore-2": { kind: "numeric" as const, raw: "0" } };
    expect(unlockedSimulationFeatures(withoutSimulation, answers).size).toBe(0);
  });

  it("annab tühja hulga teist tüüpi sammul", () => {
    const theoryStep: Step = { type: "theory", id: "theory-1", title: "T", body: ["x"] };
    expect(unlockedSimulationFeatures(theoryStep, {}).size).toBe(0);
  });
});
