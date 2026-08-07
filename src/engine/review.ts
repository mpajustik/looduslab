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
 * Kaks tehet: kaardi SÜND (mooduli lõpetamine paneb kaardi homse peale) ja
 * kaardi HINDAMINE (samm 3.2 – õpilase vastus liigutab intervalli).
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
// Ajastus: mis päeval kaart uuesti ette tuleb
// ---------------------------------------------------------------------------

/**
 * Intervalliredel päevades. TEADLIKULT lihtne, MITTE SM-2 ega FSRS: neli
 * astet, mille õpetaja suudab õpilasele peast ära seletada („homme, siis
 * kolme päeva, siis nädala, siis kolme nädala pärast"). Päris SRS-algoritm
 * annaks paremad intervallid, aga tema arvutust ei oska keegi klassi ees
 * põhjendada ja tema vigu ei oska keegi näha.
 */
export const REVIEW_INTERVALS = [1, 3, 7, 21] as const;

/** Kaugeim aste: siit edasi kaart enam ei liigu. */
export const MAX_INTERVAL_DAYS = REVIEW_INTERVALS[REVIEW_INTERVALS.length - 1];

/**
 * Järgmine intervall hinnangu järgi:
 *
 * - `again` („ei mäletanud") → tagasi algusesse, kaart tuleb homme;
 * - `hard` („raskelt") → sama intervall uuesti, edasi ei liiguta;
 * - `good` („teadsin") → redelil üks aste edasi, tipus jääb 21 päeva peale.
 *
 * `current` võib tulla localStorage'ist ehk olla ükskõik mis arv. Seepärast
 * surume ta enne kasutamist redeli piiridesse:
 *
 * - alla ühe päeva ei lasta – 0 tähendaks kaarti, mis tuleb samal päeval
 *   igavesti uuesti;
 * - üle 21 päeva ei lasta – rikutud 100 ei tohi kaardi juures kinni jääda;
 * - `NaN` ja lõpmatus loeme rikutuks ja alustame algusest. Ilma selleta
 *   jõuaks `NaN` kuupäeva arvutusse ja `dueDate` oleks „NaN-NaN-NaN": kaart
 *   ei läbiks enam `isReviewItem` kontrolli ja kaoks vaikselt ära
 *   (CodeRabbiti ülevaatuse leid 2026-08-07).
 */
export function nextIntervalDays(current: number, result: ReviewResult): number {
  if (result === "again") return FIRST_INTERVAL_DAYS;

  const rounded = Math.floor(current);
  const safe = Number.isFinite(rounded)
    ? Math.min(MAX_INTERVAL_DAYS, Math.max(FIRST_INTERVAL_DAYS, rounded))
    : FIRST_INTERVAL_DAYS;
  if (result === "hard") return safe;

  return REVIEW_INTERVALS.find((days) => days > safe) ?? MAX_INTERVAL_DAYS;
}

/**
 * Hinnatud kaart: uus intervall, uus ootamispäev, uus `updatedAt`.
 *
 * Puhas funktsioon – kirjutamine on `ReviewStore.grade` asi. `dueDate`
 * arvutatakse HINDAMISE hetkest, mitte vanast `dueDate`-ist: nädal hiljem
 * meelde tulnud kaart ei tohi kohe uuesti ette tulla.
 */
export function applyReviewResult(
  item: ReviewItem,
  result: ReviewResult,
  now: Date = new Date(),
): ReviewItem {
  const intervalDays = nextIntervalDays(item.intervalDays, result);
  return {
    ...item,
    intervalDays,
    dueDate: dueDateAfter(now, intervalDays),
    lastResult: result,
    updatedAt: now.toISOString(),
  };
}

/**
 * Kas kaart ootab sel päeval? Ka eilne ja üleeilne kaart ootab – vahele
 * jäänud päev ei tohi kaarti igaveseks kaotada.
 */
export function isDue(item: ReviewItem, now: Date = new Date()): boolean {
  return item.dueDate <= dateKey(now);
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
  /** Uus kaart: serveris olevat rida EI tohi puutuda. */
  push(items: ReviewItem[]): void;
  /** Hinnatud kaart: serveris olev rida kirjutatakse meelega üle. */
  save(items: ReviewItem[]): void;
};

export type ReviewStore = {
  list(): ReviewItem[];
  /**
   * Mooduli kaardid seadmesse, kui neid veel ei ole. Tagastab need, mis
   * päriselt lisandusid – nii saab kutsuja (ja test) teada, kas midagi juhtus.
   */
  addCards(moduleId: string, cardIds: string[], now?: Date): ReviewItem[];
  /**
   * Õpilase hinnang ühele kaardile. Tagastab uue kuju või `null`, kui sellist
   * kaarti seadmes ei ole (nt teises seadmes tehtud moodul – kuni sammuni 3.6
   * ei tule kaardid serverist tagasi).
   */
  grade(
    moduleId: string,
    cardId: string,
    result: ReviewResult,
    now?: Date,
  ): ReviewItem | null;
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
  grade: () => null,
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
    // Hinnata saab ainult kaarti, mis on olemas – siin ei ole ühtegi.
    grade: () => null,
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

  /**
   * Hinnangud, mida ei õnnestunud kettale kirjutada (kvoot täis).
   *
   * Elab ainult selle seansi mälus: lehe värskendamine kaotab nad ja
   * seadmesse jääb vana kuupäev. See on parim, mis teha annab – ilma
   * puhvrita tuleks juba hinnatud kaart samas seansis kohe uuesti ette.
   * Server on sel juhul ainus püsiv koopia (`sync.save` käib ikka).
   */
  const unsaved = new Map<string, ReviewItem>();

  /** Kettal olev seis + salvestamata hinnangud peale. */
  const currentItems = (): Record<string, ReviewItem | undefined> => {
    const items = { ...readFile().items };
    for (const [key, item] of unsaved) items[key] = item;
    return items;
  };

  return {
    list: () => Object.values(currentItems()).filter((item) => item !== undefined),
    addCards: (moduleId, cardIds, now) => {
      const file = readFile();
      const existing = Object.values(currentItems()).filter((item) => item !== undefined);
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
    grade: (moduleId, cardId, result, now) => {
      const items = currentItems();
      const key = reviewKey(moduleId, cardId);
      const current = items[key];
      if (!current) return null;

      const graded = applyReviewResult(current, result, now ?? new Date());
      try {
        storage.setItem(
          REVIEW_KEY,
          JSON.stringify({ version: FILE_VERSION, items: { ...items, [key]: graded } }),
        );
        // Kirja said ka varem salvestamata jäänud hinnangud – nad olid
        // `items` sees.
        unsaved.clear();
      } catch {
        // Ketas täis: hinnang jääb selle seansi mällu, kettale ta ei jõua.
        // Serverisse saadame ikka – seade ja server on teineteisest
        // sõltumatud (sama valik mis kaardi sünnil).
        unsaved.set(key, graded);
      }
      sync?.save([graded]);
      return graded;
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
