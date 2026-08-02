import type { Activities, ModuleManifest } from "../engine/contract";

/**
 * Moodulite register – AINUS koht, mis teab kõiki mooduleid.
 *
 * Temast sõltub kolm asja (docs/ARHITEKTUUR.md):
 * 1. `/m/:slug` laadib mooduli laisalt (dünaamiline import, CLAUDE.md reegel 13)
 * 2. kursusefaili test kontrollib, et iga viidatud id on siin olemas
 * 3. `sync-modules` (etapp 2.5) ja `coverage` (etapp 4.0) käivad registrit läbi
 *
 * Uue mooduli lisamine = kaust + üks kirje siia + üks rida kursusefailis.
 */

/** Mooduli kaks poolt, mida rakendus vajab: metaandmed ja õppesisu. */
export type LoadedModule = {
  manifest: ModuleManifest;
  activities: Activities;
};

export type ModuleLoader = () => Promise<LoadedModule>;

export const moduleRegistry: Record<string, ModuleLoader> = {
  // Esimene moodul lisandub sammus 1.13. Kirje näeb välja nii:
  //
  // "physics.peegeldumisseadus": async () => ({
  //   manifest: (await import("./physics/peegeldumisseadus/manifest")).manifest,
  //   activities: (await import("./physics/peegeldumisseadus/activities")).activities,
  // }),
  //
  // `import()` peab olema kirjas TÄISTEENA – muutujaga tee (`./physics/${slug}/…`)
  // jätaks Vite'ile arvamise, mida bundle'isse panna.
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
