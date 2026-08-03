import type { Answers } from "./answers";
import type { Step } from "./contract";

/**
 * Leping explore-sammu ja mooduli enda Simulation.tsx vahel.
 *
 * `ui/steps/ExploreStep` (üldine, ei tea ühestki konkreetsest moodulist) saab
 * mooduli Simulation-komponendi propsina väljastpoolt (docs/ARHITEKTUUR.md:
 * `ui/` ei tohi teada moodulitest). Feature-sildid (`unlockedFeatures`) on
 * ExploreStepile ja engine'ile läbipaistmatu tekst – ainult mooduli enda
 * Simulation.tsx teab, mida "mattpind" tähendab.
 */
export type SimulationProps = {
  /** Millised lisavõimalused on avatud (vt `unlockedSimulationFeatures`). */
  unlockedFeatures: ReadonlySet<string>;
};

/**
 * Millised simulatsiooni lisavõimalused on avatud (docs/MOODULILEPING.md
 * „Simulation.tsx – reeglid": alguses max 2 muudetavat suurust, ülejäänud
 * avanevad hiljem).
 *
 * Iga lisavõimalus (nt „mattpind") avaneb, kui explore-sammu manifestis
 * (`step.simulation.unlocks`) nimetatud küsimusele on vastatud – kõik
 * ülejäänud sammutüübid ja mooduli Simulation.tsx ei tea sellest reeglist
 * midagi, seega ei pea neid uue lisavõimaluse jaoks muutma.
 *
 * Puhas funktsioon (samas mõttes mis checker): sama samm + samad vastused
 * annavad alati sama tulemuse.
 */
export function unlockedSimulationFeatures(step: Step, answers: Answers): ReadonlySet<string> {
  if (step.type !== "explore" || !step.simulation) return new Set();
  const unlocked = step.simulation.unlocks
    .filter((unlock) => answers[unlock.afterQuestion] !== undefined)
    .map((unlock) => unlock.feature);
  return new Set(unlocked);
}
