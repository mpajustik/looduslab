import type { z } from "zod";
import type { courseSchema, partSchema } from "./courseSchema";

/**
 * Kursusefaili tüübid ja abifunktsioonid.
 *
 * Tüübid on tuletatud zod-skeemist (./courseSchema), aga import on
 * `import type` – see kaob kompileerimisel jäljetult ära, nii et zod EI
 * jõua toodangu bundle'isse. Tõe allikas jääb ikka üks: kui skeemi muudad,
 * muutuvad tüübid kaasa.
 */
export type Course = z.infer<typeof courseSchema>;
export type CourseBlock = Course["blocks"][number];
export type CoursePart = z.infer<typeof partSchema>;

/**
 * Kursusefaili sissepääs.
 *
 * Kontrolli teeb test (tests/course.test.ts), mitte see funktsioon –
 * kursusefail on staatiline, seega piisab, kui see valideeritakse üks kord
 * CI-s, mitte iga kord igas brauseris. Funktsioon ise annab kursusefailile
 * tüübi ja ühe selge sissepääsu.
 *
 * NB: viidatud mooduli OLEMASOLU ei kontrolli praegu keegi – moodulite
 * registrit (src/modules/registry.ts) veel ei ole, see tuleb sammuga 1.1.
 */
export function defineCourse(course: Course): Course {
  return course;
}

/** Ploki moodulid ühes loendis, olenemata kas plokk kasutab parts'i. */
export function blockModules(block: CourseBlock): string[] {
  if (block.parts) return block.parts.flatMap((part) => part.modules);
  return block.modules ?? [];
}
