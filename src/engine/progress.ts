import { checkAnswer } from "../checker";
import { browserStorage, type StorageLike } from "../lib/storage";
import type { AnswerPayload, Answers } from "./answers";
import type { Step } from "./contract";
import { stepQuestions } from "./contract";

/**
 * Õpilase edenemine ühes moodulis: kuju, muutused ja salvestus.
 *
 * Kuju järgib docs/ANDMEMUDEL.md-d: ÜKS moodulikäik (`attempts` rida) ja
 * selle all vastused (`responses` read). Nii ei pea etapis 2 andmeid ümber
 * tõstma – Supabase'i minek tähendab siis sama objekti teise kohta
 * kirjutamist, mitte uut andmemudelit.
 *
 * Kõik siinsed muutused on PUHTAD funktsioonid: `withAnswer(progress, …)`
 * tagastab uue objekti, ei muuda vana. Kirjutamine elab ainult
 * `ProgressStore`-is – ja just seepärast saab preview-režiim olla üks
 * kaheredaline valik ühes kohas, mitte lipp, mida iga kutsuja peab meeles
 * pidama (CLAUDE.md reegel 14).
 */

/**
 * `persist` salvestab seadmesse, `preview` EI KIRJUTA MITTE KUHUGI.
 *
 * Preview tuleb marsruudilt (õpetaja „Vaata õpilasena" 2.14, demo-režiim
 * 4.2), mitte moodulist – moodul ei tea, kes teda parasjagu vaatab.
 */
export type ProgressMode = "persist" | "preview";

/** Üks vastus = üks `responses` rida (docs/ANDMEMUDEL.md). */
export type StoredResponse = {
  /** Sammu id, kust vastus tuli (nt `precheck-1`) – igavene, mitte number. */
  step: string;
  /** Küsimuse id – igavene (CLAUDE.md reegel 11). */
  questionId: string;
  /**
   * Mooduli versioon vastamise hetkel. Elab vastuse enda küljes, MITTE
   * moodulikäigu pealt loetuna: kui moodul hiljem muutub, peab vana vastus
   * jääma seotuks versiooniga, mille kohta ta anti (docs/ANDMEMUDEL.md).
   */
  moduleVersion: string;
  payload: AnswerPayload;
  /** Checkeri otsus. `null` = ei hinnata (vabatekst või kokkuviimatu vastus). */
  isCorrect: boolean | null;
  /** Mitu korda õpilane on vastust MUUTNUD. Esimene vastus = 0. */
  revisedCount: number;
  createdAt: string;
};

/** Üks moodulikäik = üks `attempts` rida (docs/ANDMEMUDEL.md). */
export type ModuleProgress = {
  moduleId: string;
  /** Viimati kasutatud versioon – vastuste omast eraldi, vt StoredResponse. */
  moduleVersion: string;
  status: "started" | "completed";
  /**
   * Pooleli sammu ID, mitte järjekorranumber. Number näitaks uues versioonis
   * vale sammu peale (üks samm juurde ja kõik nihkuvad); id on igavene ja
   * kadunud sammu puhul on tagasilangus nähtav – algame algusest.
   *
   * `status: "completed"` ja `finishedAt` seab `withCompleted` – mooduli
   * viimasel sammul vajutatud „Lõpetan".
   */
  currentStep: string;
  startedAt: string;
  finishedAt: string | null;
  /** question_id → vastus. Ainult ESITATUD vastused. */
  responses: Record<string, StoredResponse | undefined>;
};

// ---------------------------------------------------------------------------
// Puhtad muutused
// ---------------------------------------------------------------------------

/** Uus moodulikäik – tühi leht. */
export function startProgress(args: {
  moduleId: string;
  moduleVersion: string;
  currentStep: string;
  now?: Date;
}): ModuleProgress {
  return {
    moduleId: args.moduleId,
    moduleVersion: args.moduleVersion,
    status: "started",
    currentStep: args.currentStep,
    startedAt: (args.now ?? new Date()).toISOString(),
    finishedAt: null,
    responses: {},
  };
}

/**
 * Moodulikäigu versioon jooksvaks – täpselt see, mida teeb `attempts` upsert
 * andmebaasis („viimati kasutatud versioon"). Juba antud vastuseid see EI
 * puuduta: nemad kannavad oma versiooni edasi.
 */
export function withModuleVersion(
  progress: ModuleProgress,
  moduleVersion: string,
): ModuleProgress {
  if (progress.moduleVersion === moduleVersion) return progress;
  return { ...progress, moduleVersion };
}

/** Õpilane liikus teisele sammule. */
export function withCurrentStep(
  progress: ModuleProgress,
  stepId: string,
): ModuleProgress {
  if (progress.currentStep === stepId) return progress;
  return { ...progress, currentStep: stepId };
}

/**
 * Õpilane jõudis mooduli lõppu (vajutas viimasel sammul „Lõpetan").
 *
 * Teine kutse EI muuda midagi: `finishedAt` on hetk, mil moodul esimest korda
 * läbi sai. Kui õpilane pärast kokkuvõtet samme uuesti sirvib ja lõpetab
 * teist korda, näeks õpetaja muidu iga vaatamise järel uut lõpuaega ja
 * „kaua moodul võttis" läheks paigast (docs/ANDMEMUDEL.md).
 *
 * Vastuseid see ei puuduta – lõpetatud moodulis saab vastust ikka muuta
 * (`revisedCount` kasvab), ilma et käik uuesti „algaks".
 */
export function withCompleted(progress: ModuleProgress, now?: Date): ModuleProgress {
  if (progress.status === "completed") return progress;
  return {
    ...progress,
    status: "completed",
    finishedAt: (now ?? new Date()).toISOString(),
  };
}

/**
 * Õpilane esitas ühe küsimuse vastuse.
 *
 * `isCorrect` tuleb ALATI checkerilt (CLAUDE.md reegel 3) – seepärast käib
 * see läbi engine'i, mitte vaate: nii ei saa ükski ekraan salvestada oma
 * arvamust õigsusest.
 */
export function withAnswer(
  progress: ModuleProgress,
  args: {
    step: Step;
    questionId: string;
    payload: AnswerPayload;
    /**
     * Valitud arvuvariandi id (src/engine/resolve.ts). Ta tuleb engine'ist,
     * MITTE vaatest: vaade näeb ainult valmis küsimust ja ei tea, mitmes
     * variant see oli.
     */
    variantId?: string;
    now?: Date;
  },
): ModuleProgress {
  const { step, questionId } = args;
  // Variant käib vastuse juurde, mitte küsimuse juurde: küsimus muutub
  // järgmise moodulikäiguga, vastus jääb.
  const payload = args.variantId
    ? { ...args.payload, variantId: args.variantId }
    : args.payload;
  const question = stepQuestions(step).find((item) => item.id === questionId);

  // Küsimust ei ole selles sammus – see on meie, mitte õpilase viga. Vastus
  // jääb alles (ta on antud!), aga hindamata: sama loogika mis checkeri
  // NOT_CHECKABLE. Praktikas ei tohiks siia sattuda, sest vaade joonistab
  // küsimused samast sammust.
  const isCorrect = question ? checkAnswer(question, payload).correct : null;

  const previous = progress.responses[questionId];
  // Kordusvastus loeb ainult SAMA versiooni sees: teise versiooni vastus on
  // andmebaasis eraldi rida (unique attempt_id + question_id + module_version),
  // seega ei ole ta selle vastuse varasem kuju, vaid teine vastus.
  const revised =
    previous && previous.moduleVersion === progress.moduleVersion ? previous : undefined;
  const now = (args.now ?? new Date()).toISOString();

  const response: StoredResponse = {
    step: step.id,
    questionId,
    moduleVersion: progress.moduleVersion,
    payload,
    isCorrect,
    revisedCount: revised ? revised.revisedCount + 1 : 0,
    // Muutmisel jääb vastuse sünniaeg alles – muidu näeks õpetaja koondvaates
    // parandatud vastus värskena ja „kaua moodul võttis" läheks paigast.
    createdAt: revised ? revised.createdAt : now,
  };

  return { ...progress, responses: { ...progress.responses, [questionId]: response } };
}

/** Salvestatud vastused vaatele sobival kujul (question_id → vastus). */
export function toAnswers(progress: ModuleProgress): Answers {
  const answers: Record<string, AnswerPayload> = {};
  for (const [questionId, response] of Object.entries(progress.responses)) {
    if (response) answers[questionId] = response.payload;
  }
  return answers;
}

// ---------------------------------------------------------------------------
// Salvestus
// ---------------------------------------------------------------------------

/** Kõigi moodulite edenemine elab ühe võtme all. */
export const PROGRESS_KEY = "looduslab:progress";

/**
 * Faili versioon. Kui kuju kunagi muutub, saab vana faili ära tunda ja kas
 * teisendada või kõrvale heita – ilma selle numbrita saaks vana kuju uue
 * koodi kätte ainult krahhi kaudu.
 */
const FILE_VERSION = 1;

type ProgressFile = {
  version: number;
  modules: Record<string, ModuleProgress | undefined>;
};

export type ProgressStore = {
  read(moduleId: string): ModuleProgress | null;
  /**
   * Kõik seadmes olevad moodulikäigud. Vajab „Minu edenemine" (samm 3.4):
   * tema küsimus ei ole „kuidas läheb SELLES moodulis", vaid „kus ma kursusel
   * olen" – ühe mooduli kaupa lugemine tähendaks localStorage'i parsimist iga
   * mooduli kohta eraldi.
   *
   * Järjekorda EI lubata: kursuse järjekord elab kursusefailis, mitte
   * salvestuses (docs/SISUHALDUS.md).
   */
  list(): ModuleProgress[];
  write(progress: ModuleProgress): void;
  clear(moduleId: string): void;
};

/**
 * Serverisse saatmine (samm 2.11). Mõlemad kutsed on „viska teele ja unusta":
 * nad EI OOTA võrku ära, vaid panevad muudatuse järjekorda.
 *
 * Miks ilma `Promise`-ta: vastuse salvestamine ekraanil ei tohi kunagi oodata
 * võrku. Kui kutsuja saaks siit lubaduse, tekiks kiusatus seda oodata – ja
 * kehva wifiga kool tähendaks nuppu, mis „ei tööta".
 *
 * Kes päriselt saadab, elab src/lib/progressSync.ts-is: engine ei tea
 * Supabase'ist midagi (docs/ARHITEKTUUR.md).
 */
export type ProgressSync = {
  push(progress: ModuleProgress): void;
  remove(moduleId: string): void;
};

/**
 * Ei kirjuta ega loe midagi – edenemine elab ainult selles seansis.
 *
 * Kaks kasutust: preview-režiim ja seade, kus localStorage'i ei saa kasutada.
 * Preview EI LOE ka: õpetaja „Vaata õpilasena" peab algama puhtalt lehelt,
 * mitte tema enda seadmesse jäänud poolikust käigust.
 */
const EPHEMERAL_STORE: ProgressStore = {
  read: () => null,
  list: () => [],
  write: () => {},
  clear: () => {},
};

/**
 * Salvestuskiht režiimi järgi.
 *
 * `preview` saab tühja poe SIIN, ühes kohas – ükski kutsuja ei pea „ära
 * salvesta" lippu meeles pidama. Just unustatud lipp on see koht, kust
 * tekib fantoomõpilane õpetaja klassivaates (docs/ARHITEKTUUR.md). Sama
 * rida katab nüüd ka serveri: preview ei jõua `sync`-ini kunagi.
 *
 * Seade ja server on TEINEUTEISEST SÕLTUMATUD: kui localStorage puudub
 * (Safari privaatrežiim), läheb vastus ikka serverisse, ja kui võrku ei ole,
 * jääb ta ikka seadmesse. Nii ei võta üks katkine pool teist kaasa.
 */
export function createProgressStore(
  mode: ProgressMode,
  resolveStorage: () => StorageLike | null = browserStorage,
  sync: ProgressSync | null = null,
): ProgressStore {
  // `resolveStorage` on funktsioon, mitte väärtus: preview EI TOHI kutsuda
  // `browserStorage()` isegi mitte proovikirjutuse jaoks (see teeb kohe
  // setItem+removeItem) – ükskõik kui kahjutu see näib, on reegel 14 „ei
  // kirjuta MITTE KUHUGI" ilma erandita.
  if (mode === "preview") return EPHEMERAL_STORE;

  const local = createLocalStore(resolveStorage);
  if (sync === null) return local;

  return {
    read: (moduleId) => local.read(moduleId),
    list: () => local.list(),
    write: (progress) => {
      local.write(progress);
      sync.push(progress);
    },
    // „Alusta uuesti" kustutab käigu ka serverist: õpetaja ei tohi näha
    // vastuseid, mille õpilane ise ära pühkis.
    clear: (moduleId) => {
      local.clear(moduleId);
      sync.remove(moduleId);
    },
  };
}

/** Ainult seade – server on `createProgressStore`-i asi. */
function createLocalStore(resolveStorage: () => StorageLike | null): ProgressStore {
  const storage = resolveStorage();
  if (storage === null) return EPHEMERAL_STORE;

  const readFile = (): ProgressFile => {
    try {
      return parseProgressFile(storage.getItem(PROGRESS_KEY));
    } catch {
      return { version: FILE_VERSION, modules: {} };
    }
  };

  const writeFile = (file: ProgressFile) => {
    try {
      storage.setItem(PROGRESS_KEY, JSON.stringify(file));
    } catch {
      // Ketas täis või kirjutamine keelatud. Edenemine jääb siis ainult
      // sellesse seansi – see on halb, aga krahh keset tundi oleks hullem
      // (docs/ANDMEMUDEL.md „teadaolevad piirangud" p 2).
    }
  };

  return {
    read: (moduleId) => readFile().modules[moduleId] ?? null,
    list: () =>
      Object.values(readFile().modules).filter((item) => item !== undefined),
    write: (progress) => {
      const file = readFile();
      writeFile({ ...file, modules: { ...file.modules, [progress.moduleId]: progress } });
    },
    clear: (moduleId) => {
      const file = readFile();
      const modules = { ...file.modules };
      delete modules[moduleId];
      writeFile({ ...file, modules });
    },
  };
}

// ---------------------------------------------------------------------------
// Lugemine: kontrolli, ära usu
// ---------------------------------------------------------------------------

/**
 * localStorage'i sisu on VÕÕRAS andmed: seal on vana versiooni kuju, teise
 * rakenduse võti, käsitsi muudetud tekst. Zodi siia ei too (ta ei tohi jõuda
 * brauseri bundle'isse – CLAUDE.md reegel 13), seega kontrollime käsitsi.
 *
 * Katkine kirje visatakse kõrvale ÜKSHAAVAL: ühe mooduli rikutud andmed ei
 * tohi kaotada teiste moodulite edenemist.
 */
export function parseProgressFile(raw: string | null): ProgressFile {
  const empty: ProgressFile = { version: FILE_VERSION, modules: {} };
  if (!raw) return empty;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return empty;
  }

  if (!isRecord(parsed) || parsed.version !== FILE_VERSION) return empty;
  if (!isRecord(parsed.modules)) return empty;

  const modules: Record<string, ModuleProgress | undefined> = {};
  for (const [moduleId, value] of Object.entries(parsed.modules)) {
    // Ka võti peab klappima: `modules["a"] = {moduleId: "b"}` tähendaks, et
    // salvestus kirjutaks vastuse vale mooduli alla.
    if (isModuleProgress(value) && value.moduleId === moduleId) {
      modules[moduleId] = value;
    }
  }
  return { version: FILE_VERSION, modules };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Avalik, sest sünkroonimisjärjekord (src/engine/syncQueue.ts) hoiab samu
 * objekte localStorage'is ja peab neid sama rangelt kontrollima.
 */
export function isModuleProgress(value: unknown): value is ModuleProgress {
  if (!isRecord(value)) return false;
  if (typeof value.moduleId !== "string") return false;
  if (typeof value.moduleVersion !== "string") return false;
  if (value.status !== "started" && value.status !== "completed") return false;
  if (typeof value.currentStep !== "string") return false;
  if (typeof value.startedAt !== "string") return false;
  if (value.finishedAt !== null && typeof value.finishedAt !== "string") return false;
  if (!isRecord(value.responses)) return false;
  return Object.entries(value.responses).every(
    ([questionId, response]) => isStoredResponse(response) && response.questionId === questionId,
  );
}

function isStoredResponse(value: unknown): value is StoredResponse {
  if (!isRecord(value)) return false;
  if (typeof value.step !== "string") return false;
  if (typeof value.questionId !== "string") return false;
  if (typeof value.moduleVersion !== "string") return false;
  if (typeof value.createdAt !== "string") return false;
  if (value.isCorrect !== null && typeof value.isCorrect !== "boolean") return false;
  if (typeof value.revisedCount !== "number" || !Number.isFinite(value.revisedCount)) {
    return false;
  }
  return isAnswerPayload(value.payload);
}

function isAnswerPayload(value: unknown): value is AnswerPayload {
  if (!isRecord(value)) return false;
  // Variant on valikuline (vanad vastused ja variantideta küsimused), aga kui
  // ta on, peab ta olema silt – mitte arv ega objekt.
  if (value.variantId !== undefined && typeof value.variantId !== "string") return false;
  switch (value.kind) {
    case "numeric":
      return typeof value.raw === "string";
    case "choice":
      return (
        Array.isArray(value.optionIds) &&
        value.optionIds.every((id) => typeof id === "string")
      );
    case "text":
      return typeof value.text === "string";
    case "table":
      return (
        Array.isArray(value.rows) &&
        value.rows.every(
          (row) =>
            isRecord(row) && Object.values(row).every((cell) => typeof cell === "string"),
        )
      );
    case "label":
      // Koha id → nime id, mõlemad sõned. `undefined` väärtust siit ei tule:
      // JSON-is teda ei ole ja vastamata koht lihtsalt puudub kirjest.
      return (
        isRecord(value.picks) &&
        Object.values(value.picks).every((pick) => typeof pick === "string")
      );
    default:
      return false;
  }
}
