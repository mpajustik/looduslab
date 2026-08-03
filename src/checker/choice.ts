import type { ChoiceQuestion } from "../engine/contract";
import { NOT_CHECKABLE, type CheckResult } from "./types";

/**
 * Valikvastuse kontroll (CLAUDE.md reegel 3).
 *
 * Kaks režiimi tulevad küsimuse enda küljest: ilma `multiple: true`-ta on
 * täpselt üks õige (skeem valvab seda), `multiple: true` korral peab valitud
 * hulk klappima õigete hulgaga TÄPSELT – osaline valik ei ole õige vastus.
 *
 * `optionIds` on õpilase valik (src/engine/answers.ts `AnswerPayload.choice`).
 */
export function checkChoiceAnswer(
  question: ChoiceQuestion,
  optionIds: string[],
): CheckResult {
  // Hulk, mitte loend: sama variant kaks korda ei ole kaks valikut.
  const chosen = new Set(optionIds);

  // Tundmatu id tähendab, et vastus ja küsimus ei käi kokku (moodul muutus
  // vahepeal). Teadmata variandi vaikne kõrvale jätmine oleks ohtlik: siis
  // võiks „õige + prügi" muutuda õigeks vastuseks.
  const known = new Set(question.options.map((option) => option.id));
  if ([...chosen].some((id) => !known.has(id))) return NOT_CHECKABLE;

  if (chosen.size === 0) {
    return { correct: false, feedback: "Ühtegi vastust ei olnud valitud." };
  }

  const multiple = question.multiple === true;
  if (!multiple && chosen.size > 1) {
    return { correct: false, feedback: "Sellel küsimusel on ainult üks õige vastus." };
  }

  const missing = question.options.filter((option) => option.correct && !chosen.has(option.id));
  const wrongChosen = question.options.filter(
    (option) => !option.correct && chosen.has(option.id),
  );

  if (missing.length === 0 && wrongChosen.length === 0) {
    return { correct: true, feedback: "Õige!" };
  }

  return {
    correct: false,
    feedback: multiple ? multipleFeedback(missing.length, wrongChosen.length) : "See ei ole õige vastus.",
    // Esimene sildiga vale valik küsimuse enda järjekorras – nii annab sama
    // valik alati sama sildi, olenemata klõpsamise järjekorrast.
    misconception: wrongChosen.find((option) => option.misconception)?.misconception,
  };
}

/**
 * Mitme õige vastuse korral ütleme, MIS suunas vastus vale on – „vale" üksi
 * ei anna 8. klassi õpilasele midagi, mille kallal edasi mõelda. Õigeid
 * variante siin ette ei öelda.
 */
function multipleFeedback(missingCount: number, wrongCount: number): string {
  if (wrongCount === 0) return "Kõiki õigeid variante ei ole veel valitud.";
  if (missingCount === 0) return "Vähemalt üks valitud variant ei ole õige.";
  return "Mõni valitud variant ei ole õige ja mõni õige jäi valimata.";
}
