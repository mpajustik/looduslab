import { isReviewItem, reviewKey, type ReviewItem } from "./review";

/**
 * Kordamiskaartide saatmisjärjekord: mis kaardid on veel serverisse jõudmata.
 *
 * Miks eraldi järjekord, mitte edenemise oma (src/engine/syncQueue.ts): seal
 * on üks kirje MOODULI kohta ja kirje sisu on kogu moodulikäik. Kaart on
 * teine asi – tema võti on `moodul + kaart` ja teda ei asenda ükski
 * moodulikäik. Ühise järjekorra tegemiseks tuleks 2.11 sünk ümber kirjutada;
 * see on riskikoht, mida see samm ei puuduta (CLAUDE.md reegel 7).
 *
 * Fail sisaldab ainult PUHAST loogikat (kuju, lugemine, kirjutamine) – päris
 * saatmine elab src/lib/reviewSync.ts-is, et seda saaks testida ilma võrguta.
 */

/** Järjekord elab ühe võtme all, kaartidest eraldi. */
export const REVIEW_QUEUE_KEY = "looduslab:review-queue";

/** Sama mõte mis mujal: vana kuju peab olema äratuntav. */
const FILE_VERSION = 1;

/** `moodul:kaart` → saatmata kaart. */
export type ReviewQueue = Record<string, ReviewItem>;

type QueueFile = {
  version: number;
  pending: ReviewQueue;
};

export function serializeReviewQueue(queue: ReviewQueue): string {
  const file: QueueFile = { version: FILE_VERSION, pending: queue };
  return JSON.stringify(file);
}

/**
 * localStorage'i sisu on VÕÕRAS andmed (vt progress.ts sama kommentaar) –
 * kontrollime, ei usu. Katkine kirje visatakse kõrvale ükshaaval.
 */
export function parseReviewQueue(raw: string | null): ReviewQueue {
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }

  if (!isRecord(parsed) || parsed.version !== FILE_VERSION) return {};
  if (!isRecord(parsed.pending)) return {};

  const pending: ReviewQueue = {};
  for (const [key, value] of Object.entries(parsed.pending)) {
    // Ka võti peab klappima – muidu saadaks järjekord serverisse kaardi,
    // mille id ei ole see, mille all ta siin seisab.
    if (isReviewItem(value) && reviewKey(value.moduleId, value.cardId) === key) {
      pending[key] = value;
    }
  }
  return pending;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
