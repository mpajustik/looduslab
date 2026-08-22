import { describe, expect, it } from "vitest";
import { STEP_TYPES } from "../src/engine/contractSchema";
import { allowsRetry, answerStage } from "../src/engine/retry";

/**
 * Vale vastuse parandamine (plaan/MOODULILEHT-UX.md samm 1).
 *
 * Testid on siin, mitte komponendil: testikeskkond on node (vt vite.config.ts)
 * ja reegel ise on puhas funktsioon. QuestionCard ainult järgib teda.
 */

describe("allowsRetry", () => {
  it("küsimustega õppesammudel saab uuesti proovida", () => {
    for (const type of ["precheck", "explore", "collect", "practice"] as const) {
      expect(allowsRetry(type)).toBe(true);
    }
  });

  /**
   * Ennustuse lukk on TEADLIK otsus (plaan/ETAPP-1-moodulid.md samm 1.10):
   * ennustust ei hinnata ja tagantjärele parandamine võtaks explain-sammult
   * tema võrdluse. Valvur on siin selleks, et keegi ei „ühtlustaks" seda
   * hiljem kogemata ära.
   */
  it("ennustust ja õpetajale minevat vabateksti ei parandata", () => {
    for (const type of ["predict", "explain", "exit"] as const) {
      expect(allowsRetry(type)).toBe(false);
    }
  });

  it("igal skeemi sammutüübil on otsus olemas", () => {
    for (const type of STEP_TYPES) {
      expect(typeof allowsRetry(type)).toBe("boolean");
    }
  });
});

describe("answerStage", () => {
  const stage = (over: Partial<Parameters<typeof answerStage>[0]> = {}) =>
    answerStage({ retry: true, correct: false, attempts: 1, revealed: false, ...over });

  it("esimese vale vastuse järel saab proovida, aga vastust ei näidata", () => {
    expect(stage()).toEqual({ canTryAgain: true, canReveal: true, showExpected: false });
  });

  it("teise vale vastuse järel tuleb õige vastus välja", () => {
    expect(stage({ attempts: 2 })).toEqual({
      canTryAgain: true,
      canReveal: false,
      showExpected: true,
    });
  });

  it("nupp „Näita vastust\" toob vastuse välja ka esimesel katsel", () => {
    expect(stage({ revealed: true })).toEqual({
      canTryAgain: true,
      canReveal: false,
      showExpected: true,
    });
  });

  it("õige vastuse juures ei pakuta midagi", () => {
    expect(stage({ correct: true })).toEqual({
      canTryAgain: false,
      canReveal: false,
      showExpected: false,
    });
  });

  /**
   * `null` = ei hinnata (vabatekst). `!correct` loeks selle valeks ja pakuks
   * õpilasele „proovi veel" vastuse peale, millel ei olegi õiget kuju.
   */
  it("hindamata vastuse juures ei pakuta midagi", () => {
    expect(stage({ correct: null })).toEqual({
      canTryAgain: false,
      canReveal: false,
      showExpected: false,
    });
  });

  it("parandamiseta sammus on õige vastus kohe kirjas ja nuppe ei ole", () => {
    expect(stage({ retry: false })).toEqual({
      canTryAgain: false,
      canReveal: false,
      showExpected: true,
    });
    expect(stage({ retry: false, correct: null })).toEqual({
      canTryAgain: false,
      canReveal: false,
      showExpected: false,
    });
  });
});
