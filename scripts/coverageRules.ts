/**
 * Katvusraporti reeglid – puhtad funktsioonid (samm 4.0).
 *
 * Miks eraldi failis ja miks TypeScript: katvuse arvutus võib VAIKSELT
 * valesti minna, on puhas funktsioon ja testitav ilma failide ning
 * moodulite laadimiseta – täpselt nagu füüsika model.ts-is (CLAUDE.md
 * reegel 1 mõte). Skript ise (scripts/coverage.mjs) loeb selle faili Vite
 * kaudu sisse.
 *
 * Ainekava PARSIMINE elab src/lib/curriculum.ts-is, sest sammust 4.0b alates
 * loeb sama faili ka õpetaja vaade. Kaks parserit tähendaks kahte arvamust
 * selle kohta, mis ainekavas kirjas on. Vanad importijad leiavad
 * `parseCurriculum`-i endiselt siit (re-export allpool).
 */
import {
  normalizeConcept,
  parseCurriculum,
  type CurriculumBlock,
  type CurriculumEntry,
} from "../src/lib/curriculum";

export { parseCurriculum };
export type { CurriculumBlock, CurriculumEntry };

/** Manifestist ainult see, mida katvus vajab (vt src/engine/contractSchema.ts). */
export type ManifestLike = {
  id: string;
  title: string;
  status: string;
  outcomes: readonly string[];
  concepts: readonly string[];
  practicalWork: readonly string[];
};

/** Üks kaetav asi koos moodulitega, mis teda katavad (tühi = katmata). */
export type CoveredItem = {
  id: string;
  text: string;
  modules: string[];
};

export type BlockCoverage = {
  id: string;
  title: string;
  outcomes: CoveredItem[];
  concepts: CoveredItem[];
  practicalWork: CoveredItem[];
};

export type CoverageTotals = {
  covered: number;
  total: number;
};

export type Coverage = {
  blocks: BlockCoverage[];
  totals: {
    outcomes: CoverageTotals;
    concepts: CoverageTotals;
    practicalWork: CoverageTotals;
  };
  /** Manifest viitab ID-le, mida ainekavas EI OLE – trükiviga, mitte katvuse auk. */
  unknownReferences: string[];
  /** Moodul õpetab mõistet, mida ainekava põhimõistete hulgas ei ole – lubatud. */
  extraConcepts: { module: string; concept: string }[];
  /** Arhiveeritud moodulid: nende katvus EI loe (ainekava katvuse reegel 1). */
  ignoredModules: string[];
};

function coveredItems(
  entries: CurriculumEntry[],
  byId: Map<string, string[]>,
): CoveredItem[] {
  return entries.map((entry) => ({
    id: entry.id,
    text: entry.text,
    modules: byId.get(entry.id) ?? [],
  }));
}

function count(items: CoveredItem[]): CoverageTotals {
  return {
    covered: items.filter((item) => item.modules.length > 0).length,
    total: items.length,
  };
}

function add(a: CoverageTotals, b: CoverageTotals): CoverageTotals {
  return { covered: a.covered + b.covered, total: a.total + b.total };
}

/**
 * Kes mida katab.
 *
 * Kaks asja, mida see tahtlikult ERINEVALT kohtleb:
 *
 * 1. **Tundmatu ID** (`P9-T1`, mida ainekavas ei ole) läheb
 *    `unknownReferences`-i. See EI OLE katvuse auk, vaid trükiviga: moodul
 *    arvab end katvat midagi, mida ei ole olemas, ja jääb raportis nähtamatuks.
 * 2. **Tundmatu MÕISTE** on lubatud (`extraConcepts`). Ainekava põhimõisted
 *    on miinimum, mitte lubatud sõnade loend – „peegeldumisnurk" on hea
 *    mõiste ka siis, kui ainekava teda nimeliselt ei nimeta.
 *
 * Arhiveeritud moodulid jäetakse välja: katvuse reegel 1 nõuab ACTIVE
 * moodulit, sest arhiveeritud moodul ei ole ühelgi kursusel enam ees.
 */
export function buildCoverage(
  blocks: CurriculumBlock[],
  manifests: readonly ManifestLike[],
): Coverage {
  const active = manifests.filter((manifest) => manifest.status === "active");
  const ignoredModules = manifests
    .filter((manifest) => manifest.status !== "active")
    .map((manifest) => manifest.id);

  const knownOutcomes = new Set(blocks.flatMap((block) => block.outcomes.map((o) => o.id)));
  const knownPractical = new Set(
    blocks.flatMap((block) => block.practicalWork.map((work) => work.id)),
  );

  const outcomeModules = new Map<string, string[]>();
  const practicalModules = new Map<string, string[]>();
  const conceptModules = new Map<string, string[]>();
  const unknownReferences: string[] = [];
  const extraConcepts: { module: string; concept: string }[] = [];

  const remember = (map: Map<string, string[]>, key: string, moduleId: string) => {
    const existing = map.get(key);
    if (existing) existing.push(moduleId);
    else map.set(key, [moduleId]);
  };

  const knownConcepts = new Set(
    blocks.flatMap((block) => block.concepts.map((concept) => normalizeConcept(concept))),
  );

  for (const manifest of active) {
    for (const outcome of manifest.outcomes) {
      if (knownOutcomes.has(outcome)) remember(outcomeModules, outcome, manifest.id);
      else unknownReferences.push(`${manifest.id}: õpitulemust "${outcome}" ei ole ainekavas`);
    }
    for (const work of manifest.practicalWork) {
      if (knownPractical.has(work)) remember(practicalModules, work, manifest.id);
      else unknownReferences.push(`${manifest.id}: praktilist tööd "${work}" ei ole ainekavas`);
    }
    for (const concept of manifest.concepts) {
      const key = normalizeConcept(concept);
      if (knownConcepts.has(key)) remember(conceptModules, key, manifest.id);
      else extraConcepts.push({ module: manifest.id, concept });
    }
  }

  const blockCoverage: BlockCoverage[] = blocks.map((block) => ({
    id: block.id,
    title: block.title,
    outcomes: coveredItems(block.outcomes, outcomeModules),
    practicalWork: coveredItems(block.practicalWork, practicalModules),
    concepts: block.concepts.map((concept) => ({
      id: concept,
      text: "",
      modules: conceptModules.get(normalizeConcept(concept)) ?? [],
    })),
  }));

  const zero: CoverageTotals = { covered: 0, total: 0 };

  return {
    blocks: blockCoverage,
    totals: {
      outcomes: blockCoverage.reduce((sum, block) => add(sum, count(block.outcomes)), zero),
      concepts: blockCoverage.reduce((sum, block) => add(sum, count(block.concepts)), zero),
      practicalWork: blockCoverage.reduce(
        (sum, block) => add(sum, count(block.practicalWork)),
        zero,
      ),
    },
    unknownReferences,
    extraConcepts,
    ignoredModules,
  };
}

/** Mida üks moodul ainekavast katab – raporti „mooduli kaupa" osa. */
export type ModuleSummary = {
  id: string;
  title: string;
  outcomes: string[];
  practicalWork: string[];
  concepts: string[];
};

export function summarizeModules(manifests: readonly ManifestLike[]): ModuleSummary[] {
  return manifests
    .filter((manifest) => manifest.status === "active")
    .map((manifest) => ({
      id: manifest.id,
      title: manifest.title,
      outcomes: [...manifest.outcomes],
      practicalWork: [...manifest.practicalWork],
      concepts: [...manifest.concepts],
    }));
}
