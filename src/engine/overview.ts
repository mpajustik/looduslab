import type { ModuleProgress } from "./progress";
import { dueReviewItems, reviewedToday, type ReviewItem } from "./review";

/**
 * „Minu edenemine" arvutus (plaani samm 3.4): kus õpilane kursusel on ja
 * mida talle järgmisena soovitada.
 *
 * Puhas funktsioon: sisend → väljund, ei loe salvestust ega kella. Vaade
 * (src/app/pages/ProgressPage.tsx) ainult joonistab. Nii saab kogu „mida
 * soovitada" loogika testida ilma brauserita.
 *
 * Kursuse järjekord tuleb SISENDINA (`blocks`), mitte importi kaudu: engine
 * ei tohi teada, et parasjagu on üks kursus nimega fyysika-8 – järjestus ja
 * rühmitamine elavad kursusefailis (docs/SISUHALDUS.md, CLAUDE.md reegel 11).
 *
 * Punktisüsteemi ja edetabelit siin TEADLIKULT ei ole (plaan): loend näitab,
 * mis on tehtud ja mis järgmisena teha – mitte kes on parem.
 */

/** Üks kursuse plokk sisendina – ainult see, mida arvutus vajab. */
export type OverviewBlock = {
  title: string;
  moduleIds: string[];
};

/** Ühe ploki seis ekraanile. */
export type BlockProgress = {
  title: string;
  /** Mitu moodulit on plokis üldse olemas. Null = plokk on veel tegemisel. */
  total: number;
  completed: number;
  /** Alustatud, aga lõpetamata. */
  started: number;
};

/**
 * Üks selge soovitus – täpselt üks nupp, mitte valikute loend
 * (docs/DISAINIJUHIS.md: üks ekraan = üks tegevus).
 *
 * Järjekord on tähtsuse järjekord, vt `nextAction`.
 */
export type NextAction =
  | { kind: "continue"; moduleId: string }
  | { kind: "review"; count: number }
  | { kind: "start"; moduleId: string }
  | { kind: "done" };

export type CourseOverview = {
  blocks: BlockProgress[];
  /** Kursusel olevad moodulid kokku (tühjad plokid ei anna midagi juurde). */
  totalModules: number;
  completedModules: number;
  startedModules: number;
  /** Mitu kaarti täna päriselt ette tuleb – sama arv, mis kordamislehel. */
  dueCards: number;
  /** Mitu kaarti on täna juba hinnatud. */
  reviewedToday: number;
  next: NextAction;
};

/**
 * Ühe ploki seis progressist. Eraldi funktsioon, sest CoursePage (sisu +
 * staatuse liitvaade) vajab sama loendust ilma kogu `courseOverview()`-t
 * kutsumata (nt kordamiskaarte pole CoursePage'il vaja lugeda).
 *
 * Loeme ainult kursusel olevaid mooduleid: salvestuses võib olla käike, mis
 * kursusel enam ei ole (arhiveeritud moodul jääb seadmesse alles) ja need
 * annaksid muidu „5/3 tehtud".
 */
export function blockProgress(
  block: OverviewBlock,
  progressById: Map<string, ModuleProgress>,
): BlockProgress {
  let completed = 0;
  let started = 0;
  for (const moduleId of block.moduleIds) {
    const status = progressById.get(moduleId)?.status;
    if (status === "completed") completed += 1;
    else if (status === "started") started += 1;
  }
  return { title: block.title, total: block.moduleIds.length, completed, started };
}

export function courseOverview(args: {
  blocks: OverviewBlock[];
  progress: ModuleProgress[];
  reviewItems: ReviewItem[];
  now?: Date;
}): CourseOverview {
  const now = args.now ?? new Date();
  const byId = new Map(args.progress.map((item) => [item.moduleId, item]));

  const blocks: BlockProgress[] = args.blocks.map((block) =>
    blockProgress(block, byId),
  );

  // Kaardid loeme SAMA funktsiooniga, mida kordamisleht kasutab: kui
  // edenemisleht ütleks „ootel 14", aga kordamisleht annaks kümme, oleks üks
  // neist valetanud. Kaarte, mille küsimus on moodulist kadunud, siin EI
  // filtreerita – engine ei tea moodulite laadimisest midagi. Seda teeb
  // kutsuja (src/app/reviewContent.ts), mõlema lehe jaoks ühtemoodi.
  const dueCards = dueReviewItems({ items: args.reviewItems, now }).length;

  return {
    blocks,
    totalModules: blocks.reduce((sum, block) => sum + block.total, 0),
    completedModules: blocks.reduce((sum, block) => sum + block.completed, 0),
    startedModules: blocks.reduce((sum, block) => sum + block.started, 0),
    dueCards,
    reviewedToday: reviewedToday(args.reviewItems, now),
    next: nextAction({ blocks: args.blocks, byId, dueCards }),
  };
}

/**
 * Soovituse tähtsusjärjekord – neli reeglit, mille õpetaja suudab klassi ees
 * ette lugeda:
 *
 * 1. **Pooleli moodul.** Katkenud tund on kõige lähemal valmimisele ja
 *    lõpetamata moodul ei anna ka kordamiskaarte – seega ta blokeerib kõike
 *    muud, mis edasi tuleks.
 * 2. **Tänased kordamiskaardid.** Kordamine on ajatundlik: eile õpitu ununeb
 *    homme. Uus moodul ootab kannatlikult, kordamispäev mitte.
 * 3. **Järgmine alustamata moodul** kursuse järjekorras.
 * 4. **Kõik tehtud** – siis ei ole soovitust ja seda ütleme ausalt välja.
 *
 * Järjekorra annab KURSUSEFAIL, mitte salvestus: „järgmine" tähendab
 * järgmist kursusel, mitte viimati puudutatut.
 */
function nextAction(args: {
  blocks: OverviewBlock[];
  byId: Map<string, ModuleProgress>;
  dueCards: number;
}): NextAction {
  const moduleIds = args.blocks.flatMap((block) => block.moduleIds);

  const unfinished = moduleIds.find(
    (moduleId) => args.byId.get(moduleId)?.status === "started",
  );
  if (unfinished) return { kind: "continue", moduleId: unfinished };

  if (args.dueCards > 0) return { kind: "review", count: args.dueCards };

  const untouched = moduleIds.find((moduleId) => !args.byId.has(moduleId));
  if (untouched) return { kind: "start", moduleId: untouched };

  return { kind: "done" };
}
