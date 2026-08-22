import type { z } from "zod";
import type {
  activitiesSchema,
  manifestSchema,
  questionSchema,
  reviewCardSchema,
  stepSchema,
} from "./contractSchema";

/**
 * Moodulileping (docs/MOODULILEPING.md) – tüübid ja sissepääsud.
 *
 * Iga moodul kutsub siit `defineModule` (manifest.ts) ja `defineActivities`
 * (activities.ts). Mõlemad AINULT annavad objektile tüübi ja tagastavad ta
 * muutmata – reeglite kontroll käib zod-skeemiga (./contractSchema) TESTIS,
 * mitte brauseris. Põhjus on sama mis kursusefailil: moodulite sisu on
 * staatiline, seega piisab ühest kontrollist CI-s ja zod ei jõua bundle'isse
 * (CLAUDE.md reegel 13). Import on `import type` – see kaob kompileerimisel.
 */
export type ModuleManifest = z.infer<typeof manifestSchema>;
export type Activities = z.infer<typeof activitiesSchema>;
export type Step = z.infer<typeof stepSchema>;
export type StepType = Step["type"];
export type Question = z.infer<typeof questionSchema>;
export type NumericQuestion = Extract<Question, { kind: "numeric" }>;
export type ChoiceQuestion = Extract<Question, { kind: "choice" }>;
export type TextQuestion = Extract<Question, { kind: "text" }>;
export type TableQuestion = Extract<Question, { kind: "table" }>;
export type LabelQuestion = Extract<Question, { kind: "label" }>;
export type ReviewCard = z.infer<typeof reviewCardSchema>;

/** manifest.ts sissepääs – metaandmed, mida moodul endast räägib. */
export function defineModule(manifest: ModuleManifest): ModuleManifest {
  return manifest;
}

/** activities.ts sissepääs – sammud ja kordamiskaardid. */
export function defineActivities(activities: Activities): Activities {
  return activities;
}

/**
 * Sammu küsimused ühtemoodi kätte, olenemata tüübist.
 *
 * Osal sammutüüpidel (theory, hook) küsimusi ei ole – siis tuleb tühi loend.
 * Nii ei pea engine, checker ega test tüüpe ükshaaval läbi käima ja uue
 * sammutüübi lisamine ei unusta kedagi.
 */
export function stepQuestions(step: Step): Question[] {
  return "questions" in step ? step.questions : [];
}
