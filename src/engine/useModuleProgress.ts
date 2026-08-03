import { useMemo, useState } from "react";
import type { AnswerPayload, Answers } from "./answers";
import type { Step } from "./contract";
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
  mode = "persist",
}: {
  moduleId: string;
  moduleVersion: string;
  steps: Step[];
  /** Vaikimisi salvestatakse. `preview` tuleb marsruudilt, mitte moodulist. */
  mode?: ProgressMode;
}): ModuleProgressHandle {
  const store = useMemo(() => createProgressStore(mode), [mode]);
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

  const answers = useMemo(() => toAnswers(progress), [progress]);

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
    answers,
    runId,
    hasProgress: index > 0 || Object.keys(progress.responses).length > 0,
    isCompleted: progress.status === "completed",
    goToIndex: (target) => {
      const step = steps[target];
      if (step) commit((current) => withCurrentStep(current, step.id));
    },
    answer: (step, questionId, payload) =>
      commit((current) => withAnswer(current, { step, questionId, payload })),
    finish: () => commit((current) => withCompleted(current)),
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
