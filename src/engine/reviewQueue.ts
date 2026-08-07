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

/**
 * Kaks tehet, mis serveris EI OLE sama asi:
 *
 * - `create` – uus kaart, „lisa, kui veel ei ole". Olemasolevat rida ei
 *   puutu, sest seal võib teine seade intervalli juba kasvatanud olla.
 * - `update` – hinnatud kaart, rida kirjutatakse meelega üle.
 *
 * Sama kaardi kohta on järjekorras alati üks kirje ja `update` võidab: üle
 * kirjutatud rida sisaldab ka seda, mida `create` oleks lisanud (upsert lisab
 * puuduva rea), aga vastupidi mitte.
 */
export type ReviewOp = "create" | "update";

export type ReviewEntry = {
  item: ReviewItem;
  op: ReviewOp;
};

/** `moodul:kaart` → saatmata kaart koos tehtega. */
export type ReviewQueue = Record<string, ReviewEntry>;

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
    const entry = toEntry(value);
    // Ka võti peab klappima – muidu saadaks järjekord serverisse kaardi,
    // mille id ei ole see, mille all ta siin seisab.
    if (entry && reviewKey(entry.item.moduleId, entry.item.cardId) === key) {
      pending[key] = entry;
    }
  }
  return pending;
}

/**
 * Kirje kahes kujus: uus `{ item, op }` ja sammu 3.1 oma, kus väärtus OLI
 * kaart ise. Vana kuju loeme `create`-ks – nii ei kao eelmise seansi saatmata
 * kaardid siis, kui õpilane uue versiooni peale satub.
 */
function toEntry(value: unknown): ReviewEntry | null {
  if (isReviewItem(value)) return { item: value, op: "create" };
  if (!isRecord(value)) return null;
  if (value.op !== "create" && value.op !== "update") return null;
  if (!isReviewItem(value.item)) return null;
  return { item: value.item, op: value.op };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
