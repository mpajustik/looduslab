import type { StepType } from "../../engine/contract";
import type { StepComponent } from "./types";
import { ExploreStep } from "./ExploreStep";
import { HookStep } from "./HookStep";
import { PrecheckStep } from "./PrecheckStep";
import { PredictStep } from "./PredictStep";
import { TheoryStep } from "./TheoryStep";

/**
 * Sammutüüpide UI-register (docs/MOODULILEPING.md „Laiendatavus").
 *
 * StepShell EI ole switch-lause: ta otsib komponendi siit. Uue sammutüübi
 * lisamine = skeem contractSchema.ts-i + komponent + üks rida siia.
 * Olemasolevaid tüüpe ei kustutata ega nimetata ümber – vanad vastused
 * viitavad neile.
 *
 * Tüüp `{ [T in StepType]?: StepComponent<T> }` seob võtme ja komponendi:
 * `theory: ExploreStep` ei kompileeru. Küsimärk on seepärast, et enamik
 * tüüpe alles valmib (sammud 1.4–1.12) – puuduva komponendi eest hoolitseb
 * StepShell.
 */
export const stepRegistry: { [T in StepType]?: StepComponent<T> } = {
  theory: TheoryStep,
  hook: HookStep,
  precheck: PrecheckStep,
  predict: PredictStep,
  explore: ExploreStep,
};

/**
 * Sammu silt õpilase keeles (docs/DISAINIJUHIS.md „UI-sõnastik").
 * `null` = sammul ei ole silti (hook algab kohe küsimusega).
 *
 * `Record` ilma küsimärgita meelega: uut sammutüüpi ei saa lisada nii, et
 * silt ununeb – TypeScript nõuab kirjet.
 */
export const STEP_LABELS: Record<StepType, string | null> = {
  theory: "Loe läbi",
  hook: null,
  precheck: "Tuleta meelde",
  predict: "Paku ennustus",
  explore: "Katseta",
  collect: "Mõõda",
  explain: "Selgita oma sõnadega",
  practice: "Harjuta",
  exit: "Kokkuvõte",
};
