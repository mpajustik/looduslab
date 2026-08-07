import { browserStorage, type StorageLike } from "../lib/storage";
import type { ProgressMode } from "./progress";

/**
 * Kordamiskaartide seis: mis kaardid on õpilasel olemas ja millal nad ootavad.
 *
 * Kaartide SISU (küsimus ja vastus) elab moodulis (`activities.reviewCards`) –
 * siia salvestatakse ainult ajastus. Nii ei jäädvustu vana sõnastus õpilase
 * seadmesse: kui moodul paraneb, näeb ta järgmisel kordamisel uut teksti, aga
 * ajastus jääb alles (CLAUDE.md reegel 11 – `card_id` on igavene).
 *
 * Kuju järgib täpselt tabelit `review_items` (docs/ANDMEMUDEL.md), et etapi
 * 3 serverisünk oleks sama objekti teise kohta kirjutamine, mitte uus mudel.
 *
 * Ajastusloogika (1 → 3 → 7 → 21 päeva) tuleb sammus 3.2. Siin on ainult
 * kaardi SÜND: mooduli lõpetamine paneb kaardi homse peale.
 */

/** Õpilase hinnang kaardile. Sama loend, mis `review_items.last_result`. */
export type ReviewResult = "again" | "hard" | "good";

export type ReviewItem = {
  moduleId: string;
  /** Kaardi id moodulist (`rc-1`) – igavene, vt CLAUDE.md reegel 11. */
  cardId: string;
  /** Ootamise päev kohaliku aja järgi, kujul `2026-08-08`. */
  dueDate: string;
  intervalDays: number;
  /** `null` = kaarti ei ole veel korratud. */
  lastResult: ReviewResult | null;
  updatedAt: string;
};

/** Uue kaardi esimene intervall: homme. */
export const FIRST_INTERVAL_DAYS = 1;

/**
 * Kaardi identiteet. Sama kolmik, mis andmebaasi unique-reegel
 * (student_id, module_id, card_id) – õpilane on seadmes alati üks.
 */
export function reviewKey(moduleId: string, cardId: string): string {
  return `${moduleId}:${cardId}`;
}

/**
 * Kuupäev kujul `2026-08-08` KOHALIKU aja järgi.
 *
 * Miks mitte `toISOString().slice(0, 10)`: see annab UTC kuupäeva ja Eestis
 * (UTC+2/+3) tähendaks õhtul kella 22 järel tehtud moodul kaarti, mis „ootab"
 * juba täna. Õpilase homme algab tema südaööl, mitte Greenwichi omal.
 */
export function dateKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Kuupäev `days` päeva pärast, kohaliku aja järgi.
 *
 * Päev lisatakse kuupäeva osale, mitte millisekunditele: kellakeeramise ööl
 * on ööpäev 23 või 25 tundi ja millisekundite liitmine annaks siis vale päeva.
 */
export function dueDateAfter(now: Date, days: number): string {
  return dateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + days));
}

/**
 * Mooduli lõpetamisel sündivad kaardid – ainult need, mida veel EI OLE.
 *
 * Teistkordne lõpetamine ei tohi ajastust nullida: õpilane, kes läbitud
 * mooduli uuesti läbi klõpsib, kaotaks muidu kolme nädala pikkuseks
 * kasvanud intervalli ja saaks kõik kaardid homme uuesti ette. Sama valvab
 * andmebaasis unique (student_id, module_id, card_id).
 *
 * Puhas funktsioon: sisend → väljund, ei loe ega kirjuta kuhugi.
 */
export function newReviewItems(args: {
  existing: ReviewItem[];
  moduleId: string;
  cardIds: string[];
  now?: Date;
}): ReviewItem[] {
  const now = args.now ?? new Date();
  const seen = new Set(args.existing.map((item) => reviewKey(item.moduleId, item.cardId)));
  const created: ReviewItem[] = [];

  for (const cardId of args.cardIds) {
    const key = reviewKey(args.moduleId, cardId);
    // Ka sama loendi sees: kaks ühesugust id-d annaksid kaks kaarti, mida
    // andmebaas hiljem vastu ei võtaks.
    if (seen.has(key)) continue;
    seen.add(key);
    created.push({
      moduleId: args.moduleId,
      cardId,
      dueDate: dueDateAfter(now, FIRST_INTERVAL_DAYS),
      intervalDays: FIRST_INTERVAL_DAYS,
      lastResult: null,
      updatedAt: now.toISOString(),
    });
  }

  return created;
}

// ---------------------------------------------------------------------------
// Salvestus
// ---------------------------------------------------------------------------

/** Kõik kordamiskaardid elavad ühe võtme all (vrd `looduslab:progress`). */
export const REVIEW_KEY = "looduslab:review";

const FILE_VERSION = 1;

type ReviewFile = {
  version: number;
  items: Record<string, ReviewItem | undefined>;
};

/**
 * Serverisse saatmine. Sama muster mis edenemisel (`ProgressSync`): kutse EI
 * OODA võrku ära, vaid paneb kaardid järjekorda. Kes päriselt saadab, elab
 * src/lib/reviewRemote.ts-is – engine ei tea Supabase'ist midagi.
 */
export type ReviewSync = {
  push(items: ReviewItem[]): void;
};

export type ReviewStore = {
  list(): ReviewItem[];
  /**
   * Mooduli kaardid seadmesse, kui neid veel ei ole. Tagastab need, mis
   * päriselt lisandusid – nii saab kutsuja (ja test) teada, kas midagi juhtus.
   */
  addCards(moduleId: string, cardIds: string[], now?: Date): ReviewItem[];
};

/**
 * Ei loe ega kirjuta midagi – preview ja localStorage'ita seade.
 *
 * Sama põhjus mis edenemisel (CLAUDE.md reegel 14): õpetaja „Vaata
 * õpilasena" ei tohi tema enda seadmesse kordamiskaarte tekitada.
 */
const EPHEMERAL_STORE: ReviewStore = {
  list: () => [],
  addCards: () => [],
};

/**
 * Seade ilma localStorage'ita (Safari privaatrežiim): kaardid lähevad ainult
 * serverisse.
 *
 * Kaarte ei saa siis kohapeal võrrelda, seega saadetakse nad IGA lõpetamise
 * peale uuesti. See on kahjutu, sest serverisse kirjutatakse „lisa, kui veel
 * ei ole" (reviewRemote.ts): olemasoleva kaardi kasvanud intervalli see ei
 * puuduta.
 */
function syncOnlyStore(sync: ReviewSync): ReviewStore {
  return {
    list: () => [],
    addCards: (moduleId, cardIds, now) => {
      const created = newReviewItems({ existing: [], moduleId, cardIds, now });
      if (created.length > 0) sync.push(created);
      // Tagastame tühja: seadmesse ei lisandunud midagi.
      return [];
    },
  };
}

/**
 * Kordamiskaartide hoidla režiimi järgi.
 *
 * `preview` saab tühja hoidla SIIN, ühes kohas – ka server jääb siis
 * puutumata, sest sünnini ei jõuta kunagi (CLAUDE.md reegel 14).
 *
 * Seade ja server on TEINEUTEISEST SÕLTUMATUD (sama valik mis progress.ts-is):
 * kui localStorage'i ei ole, lähevad kaardid ikka serverisse, ja kui võrku ei
 * ole, jäävad nad ikka seadmesse.
 */
export function createReviewStore(
  mode: ProgressMode,
  resolveStorage: () => StorageLike | null = browserStorage,
  sync: ReviewSync | null = null,
): ReviewStore {
  // Funktsioon, mitte väärtus: preview ei tohi kutsuda ka `browserStorage()`,
  // sest see teeb proovikirjutuse (vt progress.ts sama koht).
  if (mode === "preview") return EPHEMERAL_STORE;

  const storage = resolveStorage();
  // Ilma salvestuseta seade saadab ikka serverisse – muidu kaotaks Safari
  // privaatrežiim kordamise ka klassiga liitunud õpilasel.
  if (storage === null) return sync === null ? EPHEMERAL_STORE : syncOnlyStore(sync);

  const readFile = (): ReviewFile => {
    try {
      return parseReviewFile(storage.getItem(REVIEW_KEY));
    } catch {
      return { version: FILE_VERSION, items: {} };
    }
  };

  return {
    list: () => Object.values(readFile().items).filter((item) => item !== undefined),
    addCards: (moduleId, cardIds, now) => {
      const file = readFile();
      const existing = Object.values(file.items).filter((item) => item !== undefined);
      const created = newReviewItems({ existing, moduleId, cardIds, now });
      if (created.length === 0) return [];

      const items = { ...file.items };
      for (const item of created) items[reviewKey(item.moduleId, item.cardId)] = item;
      try {
        storage.setItem(REVIEW_KEY, JSON.stringify({ version: FILE_VERSION, items }));
      } catch {
        // Ketas täis või kirjutamine keelatud. Seadmesse kaarte ei teki, aga
        // serverisse lähevad nad ikka – seade ja server on teineteisest
        // sõltumatud (sama valik mis progress.ts-is).
        sync?.push(created);
        return [];
      }
      sync?.push(created);
      return created;
    },
  };
}

// ---------------------------------------------------------------------------
// Lugemine: kontrolli, ära usu
// ---------------------------------------------------------------------------

/**
 * localStorage'i sisu on VÕÕRAS andmed (vana kuju, käsitsi muudetud tekst).
 * Zodi siia ei too – ta ei tohi jõuda brauseri bundle'isse (reegel 13).
 *
 * Katkine kaart visatakse kõrvale ÜKSHAAVAL: ühe rikutud kirje pärast ei
 * tohi kaduda kõigi teiste moodulite kordamisseis.
 */
export function parseReviewFile(raw: string | null): ReviewFile {
  const empty: ReviewFile = { version: FILE_VERSION, items: {} };
  if (!raw) return empty;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return empty;
  }

  if (!isRecord(parsed) || parsed.version !== FILE_VERSION) return empty;
  if (!isRecord(parsed.items)) return empty;

  const items: Record<string, ReviewItem | undefined> = {};
  for (const [key, value] of Object.entries(parsed.items)) {
    // Ka võti peab klappima: `items["a:rc-1"] = {moduleId: "b"}` tähendaks,
    // et kaart kirjutataks hiljem vale mooduli alla.
    if (isReviewItem(value) && reviewKey(value.moduleId, value.cardId) === key) {
      items[key] = value;
    }
  }
  return { version: FILE_VERSION, items };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Kas tekst on päris kuupäev kujul `2026-08-08`?
 *
 * Kuju kontrollib regex, olemasolu kontrollib `Date`: 30. veebruari puhul
 * libiseb `Date` edasi 1. või 2. märtsile ja siis EI klapi tagasi kirjutatud
 * tekst algsega. Ajavöönd on siin `Z`, sest võrdleme ainult teksti tekstiga –
 * kohalik aeg on `dateKey`-i asi.
 */
function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
  );
}

/**
 * Avalik, sest saatmisjärjekord (src/engine/reviewQueue.ts) hoiab samu
 * objekte localStorage'is ja peab neid sama rangelt kontrollima.
 */
export function isReviewItem(value: unknown): value is ReviewItem {
  if (!isRecord(value)) return false;
  if (typeof value.moduleId !== "string" || value.moduleId === "") return false;
  if (typeof value.cardId !== "string" || value.cardId === "") return false;
  // Kuupäev peab olema kuju `2026-08-08` JA päriselt olemas: vigane kuupäev
  // sorteeriks kaardi valesse kohta ja „tänased kaardid" (samm 3.3) näitaks
  // teda kas kohe või mitte kunagi. Ainult kuju kontrollimisest ei piisa –
  // `2026-02-30` on õige kujuga, aga sellist päeva ei ole
  // (CodeRabbiti ülevaatuse leid 2026-08-07).
  if (typeof value.dueDate !== "string") return false;
  if (!isCalendarDate(value.dueDate)) return false;
  if (typeof value.intervalDays !== "number" || !Number.isFinite(value.intervalDays)) {
    return false;
  }
  if (typeof value.updatedAt !== "string") return false;
  return (
    value.lastResult === null ||
    value.lastResult === "again" ||
    value.lastResult === "hard" ||
    value.lastResult === "good"
  );
}
