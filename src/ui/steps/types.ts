import type { ComponentType } from "react";
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
 */
export type StepComponent<T extends StepType> = ComponentType<{
  step: StepOfType<T>;
}>;
