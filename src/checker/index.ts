import type { AnswerPayload } from "../engine/answers";
import type { Question } from "../engine/contract";
import { checkChoiceAnswer } from "./choice";
import { checkNumericAnswer } from "./numeric";
import { checkTableAnswer } from "./table";
import { NOT_CHECKABLE, type CheckResult } from "./types";

export type { CheckResult } from "./types";

/**
 * Checkeri sissepääs: üks küsimus + üks vastus → üks tulemus.
 *
 * Küsimuseliigid on REGISTER, mitte switch-lause (docs/MOODULILEPING.md
 * „Raudreeglid laiendamisel": küsimusetüüpe checkeris ainult lisatakse).
 * Uue liigi lisamine = skeem contractSchema.ts-i, vastuse kuju answers.ts-i
 * ja üks rida siia – ühtegi olemasolevat kirjet ei puudutata.
 */
type QuestionKind = Question["kind"];

/**
 * Ühe liigi checker saab TÄPSELT oma liiki küsimuse ja vastuse: `numeric`
 * kirje ei näe kunagi valikvastust. Seost hoiab kaardistus allpool.
 */
type CheckerFor<K extends QuestionKind> = (
  question: Extract<Question, { kind: K }>,
  answer: Extract<AnswerPayload, { kind: K }>,
) => CheckResult;

export const questionCheckers: { [K in QuestionKind]: CheckerFor<K> } = {
  numeric: (question, answer) => checkNumericAnswer(question, answer.raw),
  choice: (question, answer) => checkChoiceAnswer(question, answer.optionIds),
  // Vabateksti EI hinnata kunagi automaatselt (CLAUDE.md reegel 3: õigsust ei
  // otsusta AI). Vastus läheb õpetajale, `correct: null` jõuab andmebaasis
  // `is_correct = null`-iks. Pikkusenõue (`minWords`) on sisestuse, mitte
  // õigsuse küsimus: selle eest hoolitseb TextInput, mitte checker.
  text: () => ({ correct: null, feedback: "Vastus on salvestatud." }),
  table: (question, answer) => checkTableAnswer(question, answer.rows),
};

export function checkAnswer(question: Question, answer: AnswerPayload): CheckResult {
  // Liigid peavad klappima. Erinevus tähendab katkist moodulit või vana
  // vastust – siis me ei hinda, mitte ei loe valeks (vt NOT_CHECKABLE).
  if (answer.kind !== question.kind) return NOT_CHECKABLE;

  // Ainus koht, kus me TypeScriptile ütleme selle, mida rida ülal juba
  // kontrollis: võti on sama mõlemal, seega kirje sobib küsimusega kokku.
  // Sama muster nagu StepShellil sammukomponendiga.
  const check = questionCheckers[question.kind] as CheckerFor<QuestionKind>;
  return check(question, answer);
}
