import type { LabelPicks } from "../engine/answers";
import type { LabelQuestion } from "../engine/contract";
import { NOT_CHECKABLE, type CheckResult } from "./types";

/**
 * „Märgi joonisele" kontroll (CLAUDE.md reegel 3).
 *
 * Vastus on ÜKS tervik: õige on ainult see, kus KÕIK kohad on õigesti
 * nimetatud. Osaliselt õige vastus loeb valeks – muidu tähendaks „õige", et
 * joonis on selge, kuigi pool sellest on veel segi.
 *
 * Aga tagasiside ütleb, MITU kohta oli õigesti. Ilma selleta ei tea õpilane,
 * kas ta eksis ühes kohas või kõigis, ja teine katse on pime pakkumine.
 * MILLISED kohad olid õigesti, me ei ütle: siis piisaks kolmest katsest, et
 * ükshaaval kõik kohad välja nuputada, ilma joonist vaatamata.
 *
 * `picks` on koha id → valitud nime id (src/engine/answers.ts).
 */
export function checkLabelAnswer(
  question: LabelQuestion,
  picks: LabelPicks,
): CheckResult {
  const spotIds = new Set(question.spots.map((spot) => spot.id));
  const nameIds = new Set(question.names.map((name) => name.id));

  // Tundmatu koht või nimi tähendab, et vastus ja küsimus ei käi kokku
  // (moodul muutus vahepeal) – siis me ei hinda, mitte ei loe valeks. Sama
  // reegel mis valikvastusel: vaikne kõrvalejätmine võiks „õige + prügi"
  // muuta õigeks vastuseks.
  for (const [spotId, nameId] of Object.entries(picks)) {
    if (!spotIds.has(spotId)) return NOT_CHECKABLE;
    if (nameId !== undefined && !nameIds.has(nameId)) return NOT_CHECKABLE;
  }

  const expected = expectedText(question);
  const total = question.spots.length;
  const answered = question.spots.filter((spot) => picks[spot.id] !== undefined).length;
  const correct = question.spots.filter((spot) => picks[spot.id] === spot.answer).length;

  if (correct === total) return { correct: true, feedback: "Õige!" };

  // Pooleli jäänud vastus vajab teist lauset kui vale vastus: „õigesti on 2
  // kohta 4-st" jätaks mulje, et kaks ülejäänut on valesti, kuigi nad on
  // lihtsalt nimetamata.
  if (answered < total) {
    return {
      correct: false,
      feedback:
        answered === 0
          ? "Ükski koht ei ole veel nimetatud."
          : `Nimetamata on veel ${countText(total - answered)} ${total}-st.`,
      expected,
    };
  }

  return {
    correct: false,
    feedback:
      correct === 0
        ? "Ükski nimi ei ole veel õiges kohas."
        : `Õigesti on ${countText(correct)} ${total}-st.`,
    expected,
  };
}

/** „1 koht" / „2 kohta" – eesti keeles ei kanna ainsus ja mitmus sama lõppu. */
function countText(count: number): string {
  return count === 1 ? "1 koht" : `${count} kohta`;
}

/**
 * „Õige vastus: 1 – langev kiir, 2 – pinna ristsirge."
 *
 * Terve lause, mitte väärtuste loend: vaade ei pane tagasisidet kokku
 * (vt CheckResult). Järjekord tuleb NUMBRIST, mitte loendi järjekorrast – nii
 * saab õpilane lause joonisega kõrvuti läbi käia.
 */
function expectedText(question: LabelQuestion): string {
  const nameText = new Map(question.names.map((name) => [name.id, name.text]));
  const list = [...question.spots]
    .sort((a, b) => a.marker - b.marker)
    .map((spot) => `${spot.marker} – ${nameText.get(spot.answer) ?? spot.answer}`)
    .join(", ");
  return `Õige vastus: ${list}.`;
}
