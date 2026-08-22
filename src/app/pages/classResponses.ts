import { parseRaw } from "../../checker/number";
import type { AnswerPayload } from "../../engine/answers";
import type { Question } from "../../engine/contract";
import { readableAnswerText } from "../../engine/recall";

/**
 * Õpetaja klassivaate puhas loogika (ClassResponsesTab.tsx).
 *
 * Omaette failis kahel põhjusel: komponendifailist ei tohi eksportida muud kui
 * komponente (ESLint `react-refresh/only-export-components`), ja need kaks
 * otsust vajavad testi – nad kukkusid uue küsimuseliigi lisamisel vaikselt
 * välja (Codexi ülevaatuse leid 2026-08-22, tests/classResponses.test.ts).
 */

/**
 * Küsimuseliigid, mille kohta checker ütleb õige/vale (CLAUDE.md reegel 3).
 *
 * Vabatekst ja mõõtetabel siia EI kuulu: esimest ei hinnata kunagi, teisel on
 * töö ise mõõtmine. Uue hinnatava liigi lisamisel tuleb ta siia kaasa võtta –
 * muidu tuvastab checker vea ära, aga õpetaja koondvaade ei näita seda.
 */
export const GRADABLE_KINDS: readonly Question["kind"][] = [
  "numeric",
  "choice",
  "label",
];

/** Üks vastus õpetaja silmale – valmis tekstina, vaade ei pane teda kokku. */
export function formatAnswer(question: Question, answer: AnswerPayload): string {
  if (answer.kind === "numeric") {
    const unit = question.kind === "numeric" ? question.unit : undefined;
    // Kui õpilane tipib ühiku ise kaasa ("9,8 kPa"), ei tohi seda veel kord
    // juurde lisada – muidu näeks õpetaja "9,8 kPa kPa" (Codexi ülevaatuse leid).
    const hasOwnUnit = (parseRaw(answer.raw)?.unit ?? "") !== "";
    return unit && !hasOwnUnit ? `${answer.raw} ${unit}` : answer.raw;
  }
  if (answer.kind === "choice") {
    if (question.kind !== "choice") return answer.optionIds.join(", ");
    return answer.optionIds
      .map((id) => question.options.find((option) => option.id === id)?.text ?? id)
      .join(", ");
  }
  if (answer.kind === "text") return answer.text;
  // Märgi joonisele: „1 – langev kiir, 2 – pinna ristsirge". Vormistus tuleb
  // engine'ist, et õpetaja näeks vastust täpselt samal kujul kui õpilane
  // (src/engine/recall.ts) – ilma selleta langes label-vastus mõõtetabeli
  // reale ja õpetaja nägi teksti „(mõõtetabel)".
  if (answer.kind === "label") {
    return readableAnswerText(question, answer) ?? "(märkimata)";
  }
  return "(mõõtetabel)";
}
