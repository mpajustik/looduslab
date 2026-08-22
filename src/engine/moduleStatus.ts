import type { ModuleProgress } from "./progress";

/**
 * Mooduli olek kursuse lehel: neli seisu, mida õpilane näeb ilma lehte
 * avamata.
 *
 * `ModuleProgress.status` tunneb ainult `started`/`completed`
 * (src/engine/progress.ts) – "vajab kordamist" ei ole moodulikäigu enda
 * omadus, vaid tuleb eraldi kordamiskaartide seisust (src/engine/review.ts).
 * See funktsioon liidab need kaks kokku, et vaade ei peaks seda loogikat ise
 * kokku panema.
 */
export type ModuleStatus = "not-started" | "in-progress" | "needs-review" | "completed";

/**
 * @param hasDueCard Kas mõni selle mooduli kordamiskaart ootab TÄNA
 * (`isDue()`, src/engine/review.ts) – ilma päevalimiidita, sest siin
 * küsitakse "kas moodul vajab kordamist", mitte "mitu kaarti tohib täna
 * ette tulla".
 */
export function deriveModuleStatus(
  progress: ModuleProgress | undefined,
  hasDueCard: boolean,
): ModuleStatus {
  if (!progress) return "not-started";
  if (progress.status === "started") return "in-progress";
  return hasDueCard ? "needs-review" : "completed";
}
