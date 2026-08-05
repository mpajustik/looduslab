import { isModuleProgress, type ModuleProgress } from "./progress";

/**
 * Sünkroonimisjärjekord: mis on veel Supabase'i saatmata (samm 2.11).
 *
 * Miks järjekord üldse: koolis on wifi kehv ja tunni keskel võib võrk ära
 * kaduda. Vastus PEAB sellest hoolimata ekraanile jääma ja hiljem ise
 * kohale jõudma – õpilane ei tohi kunagi vastust uuesti sisestada.
 *
 * Üks kirje MOODULI kohta, mitte sammu kohta: iga saadetis on kogu
 * moodulikäigu HETKESEIS (upsert), seega uuem seis asendab vana täielikult.
 * Nii ei saa järjekord tunni jooksul pikaks kasvada ega jõuda kohale vales
 * järjekorras.
 *
 * Fail sisaldab ainult PUHAST loogikat (kuju, lugemine, kirjutamine) – päris
 * saatmine elab src/lib/progressSync.ts-is, et seda saaks testida ilma
 * võrguta.
 */

/** Järjekord elab ühe võtme all, edenemisest eraldi. */
export const SYNC_QUEUE_KEY = "looduslab:sync-queue";

/** Sama mõte mis progress.ts FILE_VERSION-il: vana kuju peab olema äratuntav. */
const FILE_VERSION = 1;

/**
 * `write` kannab kogu seisu kaasa, mitte viidet edenemisfailile.
 *
 * Nii jõuab vastus kohale ka siis, kui localStorage on kasutamatu (Safari
 * privaatrežiim): järjekord elab siis ainult mälus, aga saatmine töötab.
 * `delete` tähendab „Alusta uuesti" – vana käik peab ka serverist kaduma,
 * muidu näeks õpetaja vastuseid, mille õpilane ise ära kustutas.
 *
 * `reset` on „Alusta uuesti", mis EI JÕUDNUD enne uut vastust teele: uus
 * seis asendab järjekorras vana kirje, seega kaoks kustutamine muidu
 * jäljetult ära ja serverisse jääksid eelmise käigu vastused. Lipp kannab
 * selle edasi – saatja kustutab käigu enne kirjutamist.
 */
export type SyncEntry =
  | { op: "write"; progress: ModuleProgress; reset: boolean }
  | { op: "delete" };

/** moduleId → viimane saatmata muudatus. */
export type SyncQueue = Record<string, SyncEntry>;

type QueueFile = {
  version: number;
  pending: SyncQueue;
};

export function serializeSyncQueue(queue: SyncQueue): string {
  const file: QueueFile = { version: FILE_VERSION, pending: queue };
  return JSON.stringify(file);
}

/**
 * localStorage'i sisu on VÕÕRAS andmed (vt progress.ts sama kommentaar) –
 * kontrollime, ei usu. Katkine kirje visatakse kõrvale ükshaaval: ühe
 * mooduli rikutud kirje ei tohi kaotada teiste moodulite saatmata vastuseid.
 */
export function parseSyncQueue(raw: string | null): SyncQueue {
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }

  if (!isRecord(parsed) || parsed.version !== FILE_VERSION) return {};
  if (!isRecord(parsed.pending)) return {};

  const pending: SyncQueue = {};
  for (const [moduleId, value] of Object.entries(parsed.pending)) {
    if (!isRecord(value)) continue;
    if (value.op === "delete") {
      pending[moduleId] = { op: "delete" };
      continue;
    }
    // Ka võti peab klappima: `pending["a"] = {progress: {moduleId: "b"}}`
    // saadaks serverisse vale mooduli edenemise.
    if (value.op === "write" && isModuleProgress(value.progress)) {
      if (value.progress.moduleId === moduleId) {
        // Ainult sõnaselge `true` loeb: katkise välja puhul on kustutamata
        // jätmine ohutum kui kustutamine, mida keegi ei palunud.
        pending[moduleId] = {
          op: "write",
          progress: value.progress,
          reset: value.reset === true,
        };
      }
    }
  }
  return pending;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
