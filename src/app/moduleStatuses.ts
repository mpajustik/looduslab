import { useEffect, useState } from "react";
import { deriveModuleStatus, type ModuleStatus } from "../engine/moduleStatus";
import { createProgressStore } from "../engine/progress";
import { createReviewStore, isDue, type ReviewItem } from "../engine/review";
import { appNow } from "../lib/devClock";
import { browserStorage } from "../lib/storage";
import { countableReviewItems, loadReviewContent, possibleReviewItems } from "./reviewContent";

/**
 * Iga viidatud mooduli olek (pole alustatud / pooleli / vajab kordamist /
 * lõpetatud) seadme salvestuse põhjal.
 *
 * "Vajab kordamist" tuleb ainult kaardist, mis ON PÄRISELT OLEMAS: kaart võib
 * seadmes seista ka pärast seda, kui moodul on arhiveeritud või kaart ise on
 * mooduli `activities.ts`-ist eemaldatud (küsimus osutus halvaks) –
 * kordamisleht ise sellist kaarti ei näita, seega ei tohi ka kursuse leht
 * lubada tööd, mida õpilane tegelikult teha ei saa (Codexi ülevaatuse leid
 * 2026-08-22). Sama „esmalt optimistlik, siis täpsustatud" muster, mis
 * ProgressPage.tsx `readOverview`-l: registrist tuletatud arv kohe, sisu
 * (activities.ts) põhjal täpsustatud arv taustal.
 */
export function useModuleStatuses(moduleIds: string[]): Record<string, ModuleStatus> {
  const [statuses, setStatuses] = useState<Record<string, ModuleStatus>>(() =>
    readStatuses(moduleIds, possibleReviewItems(readReviewItems())),
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const now = appNow();
      const items = readReviewItems();
      const content = await loadReviewContent({ items, now });
      if (cancelled) return;
      setStatuses(readStatuses(moduleIds, countableReviewItems({ items, content, now })));
    })();

    return () => {
      cancelled = true;
    };
    // `moduleIds` tuleb kursusefailist ja ei muutu käigu pealt – jooksutame
    // täpsustuse ainult üks kord, lehe avanedes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return statuses;
}

function readReviewItems(): ReviewItem[] {
  return createReviewStore("persist", browserStorage).list();
}

function readStatuses(
  moduleIds: string[],
  reviewItems: ReviewItem[],
): Record<string, ModuleStatus> {
  const now = appNow();
  const progress = createProgressStore("persist", browserStorage).list();
  const progressById = new Map(progress.map((item) => [item.moduleId, item]));

  const statuses: Record<string, ModuleStatus> = {};
  for (const moduleId of moduleIds) {
    const hasDueCard = reviewItems.some(
      (item) => item.moduleId === moduleId && isDue(item, now),
    );
    statuses[moduleId] = deriveModuleStatus(progressById.get(moduleId), hasDueCard);
  }
  return statuses;
}
