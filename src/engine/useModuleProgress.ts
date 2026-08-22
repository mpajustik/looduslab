import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { appNow } from "../lib/devClock";
import { sharedProgressSync } from "../lib/progressRemote";
import type { SaveState } from "../lib/progressSync";
import { sharedReviewSync } from "../lib/reviewRemote";
import { browserStorage } from "../lib/storage";
import type { AnswerPayload, Answers } from "./answers";
import type { ReviewCard, Step } from "./contract";
import {
  answeredVariants,
  answersForCurrentVariants,
  attemptSeed,
  resolveSteps,
} from "./resolve";
import {
  createProgressStore,
  startProgress,
  toAnswers,
  withAnswer,
  withCompleted,
  withCurrentStep,
  withModuleVersion,
  type ModuleProgress,
  type ProgressMode,
  type ProgressStore,
} from "./progress";
import { createReviewStore } from "./review";

/**
 * Mooduli edenemine Reactile: pooleli samm, vastused ja nende salvestus.
 *
 * Vaade (StepShell) ei tea, KUHU salvestatakse ega kas üldse – ta kutsub
 * `answer` ja `goToIndex`. Nii jääb salvestusrežiim ühe koha otsustada
 * (`createProgressStore`) ja `preview` ei saa kogemata läbi lipsata
 * (CLAUDE.md reegel 14).
 */
export type ModuleProgressHandle = {
  /** Mitmes samm on lahti (0-põhine). */
  index: number;
  /**
   * Sammud SELLISEL kujul, nagu õpilane neid selles käigus näeb: valikvastuste
   * järjekord segatud ja arvuvariant valitud (src/engine/resolve.ts). Vaade
   * peab kasutama just neid, mitte omaenda propsi – checker saab vastuse
   * kõrvale sama kuju ja ekraanil ei saa olla teine küsimus kui kontrollis.
   */
  steps: Step[];
  /** Esitatud vastused question_id kaupa – sellisel kujul, nagu vaade ootab. */
  answers: Answers;
  /**
   * Kasvab „Alusta uuesti" peale. Vaade paneb selle sammukomponendi võtmesse,
   * et ka POOLELI (esitamata) valik kaoks – muidu jääks nullitud sammule
   * eelmise käigu märgistatud raadionupp.
   */
  runId: number;
  /** Kas on midagi, mida nullida (ollakse edasi liikunud või vastatud). */
  hasProgress: boolean;
  /** Kas moodul on läbi tehtud – siis kuulub ekraan kokkuvõttele. */
  isCompleted: boolean;
  /**
   * Kas vastused on serverisse jõudnud (`unknown`/`off` = ära ütle midagi).
   * Vaade ainult kuvab – seisu omanik on sünkroonimisjärjekord.
   */
  saveState: SaveState;
  goToIndex: (index: number) => void;
  answer: (step: Step, questionId: string, payload: AnswerPayload) => void;
  /** Viimase sammu „Lõpetan": märgib mooduli tehtuks (kordusvajutus ei muuda). */
  finish: () => void;
  restart: () => void;
};

export function useModuleProgress({
  moduleId,
  moduleVersion,
  steps,
  reviewCards = [],
  mode = "persist",
}: {
  moduleId: string;
  moduleVersion: string;
  steps: Step[];
  /**
   * Mooduli kordamiskaardid (`activities.reviewCards`). Mooduli lõpetamine
   * paneb need ootele (src/engine/review.ts) – moodul ise ei tea sellest
   * midagi ega salvesta kunagi ise (docs/ARHITEKTUUR.md).
   *
   * Vaikimisi tühi: sammuraami demol (`/m/test`) kaarte ei ole.
   */
  reviewCards?: ReviewCard[];
  /** Vaikimisi salvestatakse. `preview` tuleb marsruudilt, mitte moodulist. */
  mode?: ProgressMode;
}): ModuleProgressHandle {
  // Server tuleb juurde ainult `persist` režiimis. `createProgressStore`
  // jätaks preview puhul `sync` niikuinii kasutamata, aga siin on see ka
  // nähtav: õpetaja „Vaata õpilasena" ei loo isegi järjekorda.
  const sync = useMemo(
    () => (mode === "persist" ? sharedProgressSync() : null),
    [mode],
  );
  const store = useMemo(
    () => createProgressStore(mode, browserStorage, sync),
    [mode, sync],
  );
  // Kordamiskaartide hoidla saab režiimi samast kohast: preview ei tekita
  // ühtegi kaarti ei seadmesse ega serverisse, ka siis, kui õpetaja demo
  // lõpuni klõpsib (reegel 14).
  const reviewStore = useMemo(
    () =>
      createReviewStore(
        mode,
        browserStorage,
        mode === "persist" ? sharedReviewSync() : null,
      ),
    [mode],
  );
  const [progress, setProgress] = useState(() =>
    loadProgress(store, { moduleId, moduleVersion, steps }),
  );
  const [loadedKey, setLoadedKey] = useState(`${mode}:${moduleId}:${moduleVersion}`);
  const [runId, setRunId] = useState(0);

  // Teine moodul, versioon või režiim = teine edenemine. Lähtestamine käib
  // renderdamise ajal, mitte efektis: nii ei jõua õpilane näha ühtegi kaadrit
  // eelmise mooduli vastustega (React'i „prop muutus → korrigeeri olekut").
  const key = `${mode}:${moduleId}:${moduleVersion}`;
  if (loadedKey !== key) {
    setLoadedKey(key);
    setProgress(loadProgress(store, { moduleId, moduleVersion, steps }));
    setRunId((current) => current + 1);
  }

  /**
   * Salvestusseis järjekorrast. `useSyncExternalStore` on siin õige riist:
   * järjekord elab väljaspool Reacti (üks kogu rakenduse peale) ja muutub ka
   * siis, kui selles komponendis midagi ei juhtu – nt kui võrk taastub.
   *
   * Eelvaates järjekorda EI OLE (`sync === null`), seega jääb seis `unknown`
   * ja ekraan vaikib – reegel 14 ilma eraldi erandita.
   */
  const saveState = useSyncExternalStore(
    useCallback(
      (listener: () => void) => sync?.subscribe(moduleId, listener) ?? (() => {}),
      [sync, moduleId],
    ),
    useCallback(() => sync?.saveState(moduleId) ?? "unknown", [sync, moduleId]),
    // Serveris renderdades ei ole järjekorda ega brauserit.
    () => "unknown" as const,
  );

  const stored = useMemo(() => toAnswers(progress), [progress]);

  // Seeme tuleb käigu algusajast, seega ta on kogu käigu vältel sama ja
  // vahetub täpselt „Alusta uuesti" peale (vt resolve.ts). Sammude kuju
  // arvutatakse üks kord, mitte igal renderdusel – muidu hüppaks valikute
  // järjekord iga klõpsu peale.
  //
  // Juba vastatud küsimused lähevad loosi sisendisse: nende variant on
  // vastuse sees kirjas ja seda EI loosita uuesti (Codexi ülevaatuse leid).
  const resolved = useMemo(
    () => resolveSteps(steps, attemptSeed(progress.startedAt), answeredVariants(stored)),
    [steps, progress.startedAt, stored],
  );

  // Vastus, mille variant enam ei kehti (autor eemaldas variandi), ei kuulu
  // ekraanil oleva küsimuse juurde – vaade käitub nii, nagu vastust ei oleks.
  const answers = useMemo(
    () => answersForCurrentVariants(stored, resolved.variantIds),
    [stored, resolved],
  );

  // Pooleli samm on salvestatud ID-na. Kui seda sammu enam ei ole (moodul
  // muutus), alustame algusest – nähtav tagasilangus on parem kui vaikselt
  // vale samm.
  const storedIndex = steps.findIndex((step) => step.id === progress.currentStep);
  const index = storedIndex >= 0 ? storedIndex : 0;

  /**
   * Funktsionaalne `setState`-uuendus, mitte suletud `progress`-i lugemine:
   * kui `commit` kutsutaks kaks korda SAMA sündmuse sees (nt tulevane
   * „vasta ja liigu automaatselt edasi", samm 1.9), näeks teine kutse
   * suletuse kaudu ikka vana `progress`-i ja kaotaks esimese muudatuse.
   * React garanteerib, et järjestikused `setState`-uuendajad saavad ikka
   * eelmise uuendaja tulemuse, seega on `current` siin alati värske.
   */
  const commit = (updater: (current: ModuleProgress) => ModuleProgress) => {
    setProgress((current) => {
      const next = updater(current);
      if (next === current) return current; // muutust ei olnud – ei salvesta ka
      store.write(next);
      return next;
    });
  };

  return {
    index,
    steps: resolved.steps,
    answers,
    runId,
    hasProgress: index > 0 || Object.keys(progress.responses).length > 0,
    isCompleted: progress.status === "completed",
    saveState,
    goToIndex: (target) => {
      const step = steps[target];
      if (step) commit((current) => withCurrentStep(current, step.id));
    },
    answer: (step, questionId, payload) =>
      commit((current) =>
        // Variandi id tuleb siit, mitte vaatest: vaade näeb ainult valmis
        // küsimust ja ei tea, milline variant talle loositi.
        withAnswer(current, {
          step,
          questionId,
          payload,
          variantId: resolved.variantIds[questionId],
        }),
      ),
    finish: () =>
      commit((current) => {
        const next = withCompleted(current);
        // Kaardid sünnivad ainult ESIMESEL lõpetamisel: `withCompleted`
        // tagastab juba läbitud moodulil sama objekti. Kordusvajutus (ja
        // React StrictMode, mis uuendaja kaks korda läbi jooksutab) on siiski
        // kahjutu – `addCards` jätab olemasoleva kaardi puutumata, nii et
        // kolme nädala pikkuseks kasvanud intervall ei lähe nulli.
        if (next !== current) {
          // Kaardi tähtaeg tuleb `appNow`-st (src/lib/devClock.ts): arenduses
          // saab mooduli lõpetada „nädal hiljem" ja vaadata, kus kaart maandub.
          // Edenemise ajatemplid (`startedAt`, `finishedAt`) jäävad PÄRIS
          // kellast – need lähevad õpetaja koondvaatesse ja seal ei tohi
          // arendustööriist kunagi tulevikku kirjutada.
          reviewStore.addCards(
            moduleId,
            reviewCards.map((card) => card.id),
            appNow(),
          );
        }
        return next;
      }),
    restart: () => {
      store.clear(moduleId);
      setProgress(
        startProgress({ moduleId, moduleVersion, currentStep: steps[0]?.id ?? "" }),
      );
      setRunId((current) => current + 1);
    },
  };
}

function loadProgress(
  store: ProgressStore,
  args: { moduleId: string; moduleVersion: string; steps: Step[] },
): ModuleProgress {
  const stored = store.read(args.moduleId);
  if (stored) {
    // Moodulikäik kannab VIIMATI kasutatud versiooni (docs/ANDMEMUDEL.md).
    // Juba antud vastused jäävad oma versiooni külge – neid see ei puuduta.
    return withModuleVersion(stored, args.moduleVersion);
  }
  return startProgress({
    moduleId: args.moduleId,
    moduleVersion: args.moduleVersion,
    currentStep: args.steps[0]?.id ?? "",
  });
}
