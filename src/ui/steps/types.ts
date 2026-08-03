import type { ComponentType } from "react";
import type { Answers, AnswerPayload } from "../../engine/answers";
import type { Step, StepType } from "../../engine/contract";

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
 */
export type StepComponent<T extends StepType> = ComponentType<{
  step: StepOfType<T>;
  /** Kõik seni esitatud vastused, question_id kaupa. */
  answers: Answers;
  /** Kutsu, kui õpilane esitab ühe küsimuse vastuse. */
  onAnswer: (questionId: string, payload: AnswerPayload) => void;
}>;
