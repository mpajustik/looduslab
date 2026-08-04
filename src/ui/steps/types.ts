import type { ComponentType } from "react";
import type { Answers, AnswerPayload } from "../../engine/answers";
import type { Step, StepType } from "../../engine/contract";
import type { ModuleFigures } from "../../engine/figures";
import type { RecalledAnswer } from "../../engine/recall";
import type { SimulationProps } from "../../engine/simulationFeatures";

/**
 * Sammukomponentide ühised tüübid.
 *
 * Eraldi failis (mitte registry.ts-is), et sammukomponent saaks need
 * importida ilma ringimpordita: registry.ts impordib komponente, komponendid
 * impordivad tüüpe.
 */

/** Üks konkreetne sammutüüp lepingust, nt StepOfType<"theory">. */
export type StepOfType<T extends StepType> = Extract<Step, { type: T }>;

/**
 * Sammukomponent saab TÄPSELT oma tüüpi sammu – TheoryStep ei näe kunagi
 * explore-sammu. Pealkirja ja edenemisriba joonistab StepShell, komponent
 * vastutab ainult sammu sisu eest.
 *
 * Vastused tulevad ülalt ja lähevad tagasi üles (`onAnswer`): sammukomponent
 * ei hoia esitatud vastust enda sees. Nii jääb sammus 1.6 salvestuse
 * lisamiseks üks koht – StepShell –, mitte iga sammutüüp eraldi.
 * Vastuseta sammud (TheoryStep) võivad need propsid lihtsalt ära jätta.
 *
 * `Simulation` on siin AINULT explore-sammu jaoks: StepShell ise ei tea
 * moodulitest (docs/ARHITEKTUUR.md), seega saab ta mooduli enda
 * Simulation.tsx propsina väljastpoolt (app-kihist, kes registrist mooduli
 * laadis) ja kannab ta läbi kõigile sammutüüpidele. Teised sammutüübid
 * jätavad selle propsi lihtsalt kasutamata.
 */
export type StepComponent<T extends StepType> = ComponentType<{
  step: StepOfType<T>;
  /** Kõik seni esitatud vastused, question_id kaupa. */
  answers: Answers;
  /** Kutsu, kui õpilane esitab ühe küsimuse vastuse. */
  onAnswer: (questionId: string, payload: AnswerPayload) => void;
  /** Mooduli simulatsioonikomponent, kui moodulil üks on. */
  Simulation?: ComponentType<SimulationProps>;
  /**
   * Mooduli joonised sildi kaupa (src/engine/figures.ts). Sama põhjus mis
   * `Simulation`-il: see fail ei tohi teada ühestki moodulist, seega tulevad
   * joonised väljastpoolt. Sammutüübid, millel `figure` välja ei ole,
   * jätavad selle propsi lihtsalt kasutamata.
   */
  figures?: ModuleFigures;
  /**
   * Varasema küsimuse vastus loetaval kujul (explain näitab ennustust).
   *
   * Funktsioon, mitte valmis andmed: ainult sammukomponent teab, MILLIST
   * vastust ta meelde tuletab, ja StepShell ei pea seda iga sammu jaoks ette
   * arvutama. Teised sammutüübid jätavad selle propsi lihtsalt kasutamata.
   */
  recall?: (questionId: string) => RecalledAnswer | null;
}>;
