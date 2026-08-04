import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";
import type { Activities, ModuleManifest } from "../engine/contract";
import type { ModuleFigures } from "../engine/figures";
import type { SimulationProps } from "../engine/simulationFeatures";

/**
 * Moodulite register – AINUS koht, mis teab kõiki mooduleid.
 *
 * Temast sõltub kolm asja (docs/ARHITEKTUUR.md):
 * 1. `/m/:slug` laadib mooduli laisalt (`React.lazy` + registri `import()`)
 * 2. kursusefaili test kontrollib, et iga viidatud id on siin olemas
 * 3. `sync-modules` (etapp 2.5) ja `coverage` (etapp 4.0) käivad registrit läbi
 *
 * Uue mooduli lisamine = kaust + üks kirje `moduleRegistry`-sse + (kui moodulil
 * on explore-samm) üks kirje `moduleSimulations`-se + üks rida kursusefailis.
 */

/** Mooduli kaks poolt, mida rakendus vajab: metaandmed ja õppesisu. */
export type LoadedModule = {
  manifest: ModuleManifest;
  activities: Activities;
};

export type ModuleLoader = () => Promise<LoadedModule>;

export const moduleRegistry: Record<string, ModuleLoader> = {
  "physics.peegeldumisseadus": async () => ({
    manifest: (await import("./physics/peegeldumisseadus/manifest")).manifest,
    activities: (await import("./physics/peegeldumisseadus/activities")).activities,
  }),
  // `import()` peab olema kirjas TÄISTEENA – muutujaga tee (`./physics/${slug}/…`)
  // jätaks Vite'ile arvamise, mida bundle'isse panna.
};

/**
 * Explore-sammu simulatsioonikomponendid, eraldi `moduleRegistry`-st.
 *
 * `React.lazy` juba ise dünaamilise import()-i, seega ModulePage ei pea
 * ise `lazy()`-t kutsuma iga renderduse peale (see looks uue komponendi
 * IGA KORD, kui teeks seda render'i sees). Eraldi kaart manifest+activities
 * kõrval hoiab ka ära, et pelgalt pealkirja vajav ekraan (nt CoursePage)
 * peaks Simulation.tsx-i kaasa laadima (samm 1.1 otsus, üle vaadatud
 * sammus 1.13 – activities.ts ise Simulation.tsx-i ei impordi, seega
 * `moduleRegistry` üksi ei tiri seda kaasa, aga ModulePage vajab siiski
 * OMAETTE viisi, kuidas õige komponent slugi järgi kätte saada).
 *
 * Moodulil, millel pole explore-sammu (nt puhas teooriakonspekt), ei ole
 * siin kirjet – StepShelli `Simulation` prop on valikuline.
 */
export const moduleSimulations: Record<
  string,
  LazyExoticComponent<ComponentType<SimulationProps>>
> = {
  "physics.peegeldumisseadus": lazy(() =>
    import("./physics/peegeldumisseadus/Simulation").then((module) => ({
      default: module.Simulation,
    })),
  ),
};

/**
 * Sammude joonised (theory/hook sammu `figure` silt), eraldi kaart nagu
 * simulatsioonidel ja samal põhjusel.
 *
 * Iga joonis on `lazy` – nii ei võta esilehe bundle neid kaasa (CLAUDE.md
 * reegel 13) ja kõik ühe mooduli joonised jagavad üht tükki (sama import()
 * tee). Kaart ise on SÜNKROONNE: ModulePage saab ta kohe kätte ja ei pea
 * jooniste jaoks omaette laadimisolekut hoidma – ootamise eest hoolitseb
 * Suspense, mis on lehel juba olemas.
 *
 * Sildid peavad klappima activities.ts `figure` väljadega – seda valvab test
 * (tests/registry.test.ts), sest puuduv joonis ei tee ekraani katki, ta
 * lihtsalt EI ILMU ja seda ei pruugi keegi märgata.
 */
export const moduleFigures: Record<string, ModuleFigures> = {
  "physics.peegeldumisseadus": {
    "peegeldumise-moisted": lazy(() =>
      import("./physics/peegeldumisseadus/figures").then((module) => ({
        default: module.ReflectionConceptFigure,
      })),
    ),
    "sile-ja-mattpind": lazy(() =>
      import("./physics/peegeldumisseadus/figures").then((module) => ({
        default: module.SurfaceComparisonFigure,
      })),
    ),
    "mari-taskulambiga": lazy(() =>
      import("./physics/peegeldumisseadus/figures").then((module) => ({
        default: module.MariFlashlightFigure,
      })),
    ),
    periskoop: lazy(() =>
      import("./physics/peegeldumisseadus/figures").then((module) => ({
        default: module.PeriscopeFigure,
      })),
    ),
  },
};

/**
 * Slug id-st: id on alati `<subject>.<slug>` (docs/MOODULILEPING.md).
 * Vigane id on programmeerija viga, mitte kasutaja oma – seega viskame vea.
 */
export function slugFromId(id: string): string {
  const dot = id.indexOf(".");
  if (dot <= 0 || dot === id.length - 1) {
    throw new Error(
      `Mooduli id "${id}" ei ole kujul <subject>.<slug>, nt physics.peegeldumisseadus`,
    );
  }
  return id.slice(dot + 1);
}

/**
 * Slug → id indeks.
 *
 * Miks see viskab vea: registri võtmed on id-d, seega kaks sama slugiga
 * moodulit (`physics.rohk` ja `chemistry.rohk`) EI tekita duplikaatvõtit –
 * register on täiesti korrektne ja `/m/rohk` lahendaks lihtsalt selle, kumb
 * ees on. Vaikne vale moodul on hullem kui krahh, seega krahh
 * (docs/MOODULILEPING.md „Slug-konventsioon").
 */
export function buildSlugIndex(
  registry: Record<string, ModuleLoader>,
): ReadonlyMap<string, string> {
  const index = new Map<string, string>();
  for (const id of Object.keys(registry)) {
    const slug = slugFromId(id);
    const existing = index.get(slug);
    if (existing !== undefined) {
      throw new Error(
        `Kaks moodulit jagavad slugi "${slug}": ${existing} ja ${id}. ` +
          "Slug peab olema unikaalne üle kõigi ainete, sest /m/:slug ainet ei tea.",
      );
    }
    index.set(slug, id);
  }
  return index;
}

/**
 * Ehitatakse üks kord, mooduli laadimisel. Katkine register annab vea kohe
 * rakenduse käivitumisel, mitte alles siis, kui õpilane lingile klõpsab.
 */
export const slugIndex = buildSlugIndex(moduleRegistry);

/** Kas selline moodul on registris olemas (kursusefaili test kasutab seda). */
export function hasModule(id: string): boolean {
  return Object.hasOwn(moduleRegistry, id);
}

/** Laadi moodul URL-i slugi järgi. `null` = sellist moodulit ei ole. */
export function loadModuleBySlug(slug: string): Promise<LoadedModule> | null {
  const id = slugIndex.get(slug);
  if (id === undefined) return null;
  return moduleRegistry[id]();
}
