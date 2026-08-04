import type { NumericQuestion } from "../engine/contract";
import { maxDelta, parseRaw, readNumber, withinTolerance } from "./number";
import { NOT_CHECKABLE, type CheckResult } from "./types";

/**
 * Arvvastuse kontroll (CLAUDE.md reegel 3: õigsust ei otsusta kunagi vaade).
 *
 * `raw` on õpilase tipitud tekst muutmata kujul (src/engine/answers.ts
 * `AnswerPayload.numeric.raw`) – koma/punkti lugemine ja ühikuteisendus
 * käivad ./number.ts-is, mitte vaates. Sama lugemist kasutab mõõtetabeli
 * checker (./table.ts), et „2,5" tähendaks mõlemas kohas sama asja.
 *
 * Tulemuse kuju on ühine kõigi checkeritega (./types). `correct: null` tuleb
 * siit ainult siis, kui küsimusel EI OLE õiget vastust – see tähendab
 * resolveerimata variantküsimust (vt allpool), mitte õpilase viga.
 */
export function checkNumericAnswer(question: NumericQuestion, raw: string): CheckResult {
  // Variantidega küsimusel elab vastus variandi sees ja engine valib variandi
  // enne ekraanile andmist (src/engine/resolve.ts). Kui vastust siin ei ole,
  // on küsimus meieni jõudnud resolveerimata – see on meie, mitte õpilase
  // viga, seega EI HINDA (sama loogika mis NOT_CHECKABLE mujal). Vale vastuse
  // eest ei tohi karistada kedagi, kelle küsimus jäi meie käe läbi poolikuks.
  if (question.answer === undefined) return NOT_CHECKABLE;

  const expectedUnit = question.unit ?? "";

  // Kaks eri viga, kaks eri lauset: „ei ole arv" ja „vale ühik". Ühine
  // `readNumber` annab mõlemal juhul `undefined`, seega eristame siin.
  if (!parseRaw(raw)) {
    return { correct: false, feedback: 'Seda vastust ei tundnud arvuna ära – oodatud on arv, nt „2,5".' };
  }

  const converted = readNumber(raw, expectedUnit);
  if (converted === undefined) {
    return {
      correct: false,
      feedback: expectedUnit
        ? `See ühik ei sobi – oodatud ühik on ${expectedUnit}.`
        : "See küsimus ei vaja ühikut.",
    };
  }

  const delta = maxDelta(question.answer, question.tolerance);
  if (withinTolerance(converted, question.answer, delta)) {
    return { correct: true, feedback: "Õige!" };
  }

  const trap = question.traps?.find((candidate) =>
    withinTolerance(converted, candidate.answer, delta),
  );
  if (trap) {
    return { correct: false, feedback: trap.feedback, misconception: trap.misconception };
  }

  // Lause EI kutsu uuesti proovima: esitatud vastust ei saa praegu muuta
  // („Muuda vastust" tuleb hiljem). Käsk, mida ekraanil täita ei saa,
  // paneb õpilase arvama, et rakendus on katki. Sama sõnastus valikvastusel.
  return { correct: false, feedback: "See ei ole õige vastus." };
}
