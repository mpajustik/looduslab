/**
 * Katvusraporti reeglid – puhtad funktsioonid (samm 4.0).
 *
 * Miks eraldi failis ja miks TypeScript: siin on kaks asja, mis võivad
 * VAIKSELT valesti minna – ainekava faili parsimine (üks muutunud rida ja
 * pool ainekavast kaob raportist) ja katvuse arvutus. Mõlemad on puhtad
 * funktsioonid ja testitavad ilma failide ning moodulite laadimiseta,
 * täpselt nagu füüsika model.ts-is (CLAUDE.md reegel 1 mõte).
 * Skript ise (scripts/coverage.mjs) loeb selle faili Vite kaudu sisse.
 */

/** Üks ainekava õpitulemus või praktiline töö: P1-T2 / P1-PT3. */
export type CurriculumEntry = {
  id: string;
  text: string;
};

/** Üks ainekava plokk (## P1. …) koos kõige sellega, mida katta tuleb. */
export type CurriculumBlock = {
  id: string;
  title: string;
  outcomes: CurriculumEntry[];
  concepts: string[];
  practicalWork: CurriculumEntry[];
};

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

const BLOCK_HEADING = /^## (P[1-9][0-9]*)\.\s+(.+)$/;
const ENTRY_BULLET = /^- \*\*(P[1-9][0-9]*-P?T[1-9][0-9]*)\*\*\s*(.*)$/;
const CONCEPTS_LINE = /^\*\*Põhimõisted:\*\*\s*(.*)$/;
/** Rida, mis TAHAB olla kirje, aga ei ole – vt parseCurriculum. */
const ENTRY_LOOKALIKE = /^- \*\*P[0-9]/;

/**
 * Mõisteid võrreldakse NIME järgi (ainekava fail ütleb seda ise), seega
 * peab võrdlus taluma seda, mida inimene kirjutades varieerib: suurtäht rea
 * alguses ja topeltvahe reamurdmise kohal. Muud mitte – „rõhk" ja „õhurõhk"
 * on eri mõisted ja peavadki eri mõisteteks jääma.
 */
function normalizeConcept(concept: string): string {
  return concept.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Ainekava markdown → plokid.
 *
 * Parsimine on tahtlikult range: tunneme ära ainult täpselt need read, mis
 * ainekava failis kokku lepitud kujul on (`## P1. …`, `- **P1-T1** …`,
 * `**Põhimõisted:** …`). Nii ei teki olukorda, kus fail on vaikselt katki,
 * aga raport näitab rõõmsalt „kõik kaetud" – tühi plokk annab vea.
 *
 * Mitmele reale murtud tekst liidetakse kokku: markdownis on see üks kirje,
 * mitte kaks.
 */
export function parseCurriculum(markdown: string): CurriculumBlock[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: CurriculumBlock[] = [];

  let block: CurriculumBlock | null = null;
  /** Kuhu järgmine murtud rida läheb: kirje teksti või mõistete loendisse. */
  let pending: { kind: "entry"; entry: CurriculumEntry } | { kind: "concepts" } | null = null;
  let conceptsText = "";

  const flushConcepts = () => {
    if (block === null || conceptsText === "") return;
    block.concepts = conceptsText
      .split(",")
      .map((concept) => concept.trim())
      .filter((concept) => concept !== "");
    conceptsText = "";
  };

  for (const line of lines) {
    const heading = BLOCK_HEADING.exec(line);
    if (heading) {
      flushConcepts();
      block = { id: heading[1], title: heading[2].trim(), outcomes: [], concepts: [], practicalWork: [] };
      blocks.push(block);
      pending = null;
      continue;
    }

    if (block === null) continue;

    const bullet = ENTRY_BULLET.exec(line);
    if (bullet) {
      flushConcepts();
      const [, id, text] = bullet;
      if (!id.startsWith(`${block.id}-`)) {
        throw new Error(
          `Ainekava: kirje "${id}" on ploki ${block.id} all. ID plokinumber peab ` +
            "klappima pealkirjaga, muidu ei leia raport teda üles.",
        );
      }
      const entry: CurriculumEntry = { id, text: text.trim() };
      // -PT enne -T: „P1-PT3" sisaldab samuti „-T"-d.
      if (id.includes("-PT")) block.practicalWork.push(entry);
      else block.outcomes.push(entry);
      pending = { kind: "entry", entry };
      continue;
    }

    // Kirje MOODI rida, mis mustriga ei sobinud (`- **P1-T0** …`, `- **P1T1** …`).
    // Ilma selleta valguks ta lihtsalt eelmise kirje teksti sisse ja üks
    // ainekava õpitulemus kaoks raportist jäljetult (CodeRabbiti leid).
    if (ENTRY_LOOKALIKE.test(line)) {
      throw new Error(
        `Ainekava: rida "${line.trim()}" näeb välja nagu kirje, aga ID ei ole ` +
          "kujul P1-T2 või P1-PT3. Paranda ainekava fail – muidu kaob see kirje raportist.",
      );
    }

    const concepts = CONCEPTS_LINE.exec(line);
    if (concepts) {
      flushConcepts();
      conceptsText = concepts[1].trim();
      pending = { kind: "concepts" };
      continue;
    }

    // Tühi rida või uus lõik lõpetab murtud teksti; muidu liidame juurde.
    if (line.trim() === "" || line.startsWith("**") || line.startsWith("#")) {
      flushConcepts();
      pending = null;
      continue;
    }

    if (pending?.kind === "entry") {
      pending.entry.text = `${pending.entry.text} ${line.trim()}`.trim();
    } else if (pending?.kind === "concepts") {
      conceptsText = `${conceptsText} ${line.trim()}`.trim();
    }
  }

  flushConcepts();

  // Ilma selle kontrollita annaks tühi või vale fail „0/0 (100%)" – roheline
  // raport olukorras, kus ainekava on hoopis kaotsi läinud (CodeRabbiti leid).
  if (blocks.length === 0) {
    throw new Error(
      "Ainekava: ühtegi plokki (`## P1. …`) ei leitud. Kas fail on õige ja " +
        "kas käsk käivitati projekti juurkaustast?",
    );
  }

  const empty = blocks.filter(
    (candidate) => candidate.outcomes.length === 0 && candidate.concepts.length === 0,
  );
  if (empty.length > 0) {
    throw new Error(
      `Ainekava: plokkidel ${empty.map((candidate) => candidate.id).join(", ")} ei ole ` +
        "ühtegi õpitulemust ega põhimõistet. Kas faili kuju on muutunud?",
    );
  }

  return blocks;
}

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
