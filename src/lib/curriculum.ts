/**
 * Ainekava lugemine – puhtad funktsioonid (sammud 4.0a ja 4.0b).
 *
 * Siin elab ainekava faili (sisu/AINEKAVA-fyysika-8.md) parser. Ta oli
 * algselt scripts/coverageRules.ts sees, aga sammus 4.0b tekkis TEINE
 * lugeja: õpetaja vaade näitab mooduli juures, mida see tund ainekavast
 * katab. Kaks lugejat = kaks võimalust sama asja erinevalt mõista, seepärast
 * on parser nüüd ühes kohas ja raport impordib ta siit.
 *
 * Parsimine on tahtlikult range: tunneme ära ainult täpselt need read, mis
 * ainekava failis kokku lepitud kujul on (`## P1. …`, `- **P1-T1** …`,
 * `**Põhimõisted:** …`). Nii ei teki olukorda, kus fail on vaikselt katki,
 * aga raport näitab rõõmsalt „kõik kaetud" – tühi plokk annab vea.
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
export function normalizeConcept(concept: string): string {
  return concept.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Ainekava markdown → plokid.
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

  /**
   * Juba nähtud ID-d – KOGU faili peale.
   *
   * Kopeeritud rida ei tee raportit punaseks, vaid VALEKS: sama õpitulemus
   * loetakse kaks korda ja „3/30" muutub vaikselt „3/31"-ks
   * (CodeRabbiti leid, 2026-08-08).
   */
  const seenIds = new Set<string>();

  const flushConcepts = () => {
    if (block === null || conceptsText === "") return;
    const concepts = conceptsText
      .split(",")
      .map((concept) => concept.trim())
      .filter((concept) => concept !== "");

    /**
     * Mõiste peab olema unikaalne PLOKI SEES, mitte failis.
     *
     * Miks mitte failis: „optiline keskkond" on riiklikus ainekavas
     * põhimõiste nii P1 (valguse levimine) kui ka P2 (murdumine) all – see
     * ei ole trükiviga, vaid sama mõiste kahes teemas. Ploki sees kaks
     * korda on aga alati kopeerimisviga.
     */
    const seen = new Set<string>();
    for (const concept of concepts) {
      const key = normalizeConcept(concept);
      if (seen.has(key)) {
        throw new Error(
          `Ainekava: mõiste "${concept}" on plokis ${block.id} kaks korda. Kustuta ` +
            "kordus – muidu loeb katvusraport teda kaks korda ja protsent ei klapi.",
        );
      }
      seen.add(key);
    }

    block.concepts = concepts;
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
      if (seenIds.has(id)) {
        throw new Error(
          `Ainekava: ID "${id}" on failis kaks korda. Kustuta kordus – muidu ` +
            "loeb katvusraport sama asja kaks korda ja protsent ei klapi.",
        );
      }
      seenIds.add(id);

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

/** Mooduli manifesti ainekava-viited koos ainekava enda tekstiga (samm 4.0b). */
export type ModuleCurriculum = {
  outcomes: CurriculumEntry[];
  practicalWork: CurriculumEntry[];
  /** Mõiste ja see, kas ainekava teda nimeliselt nimetab (miinimum, mitte loend). */
  concepts: { name: string; inCurriculum: boolean }[];
};

/**
 * Mida üks moodul ainekavast katab – ÕPETAJALE loetaval kujul.
 *
 * Kaks otsust, mis siin katvusraportist erinevad:
 *
 * 1. **Tundmatu ID ei kao ekraanilt.** Raport nimetab ta veaks
 *    (`unknownReferences`) ja kukub läbi, aga õpetaja vaade näitab teda
 *    ikka – ilma tekstita. Nähtav „P9-T1" ilma seletuseta on aus:
 *    manifest ütleb, et see moodul katab midagi, mida ainekavas ei ole.
 *    Vaikselt ära jättes arvaks õpetaja, et moodulil polegi seost.
 * 2. **Mõiste juurde käib märge**, kas ainekava teda nimeliselt nimetab.
 *    Mõlemad on õiged mõisted (ainekava põhimõisted on miinimum), aga
 *    õpetaja peab nägema, kumb neist ainekavas kirjas seisab.
 *
 * Järjekord tuleb MANIFESTIST, mitte ainekavast: moodul ise ütleb, mis
 * järjekorras ta oma seoseid nimetab.
 */
export function moduleCurriculum(
  blocks: readonly CurriculumBlock[],
  manifest: {
    outcomes: readonly string[];
    practicalWork: readonly string[];
    concepts: readonly string[];
  },
): ModuleCurriculum {
  const byId = new Map<string, CurriculumEntry>();
  const conceptNames = new Set<string>();

  for (const block of blocks) {
    for (const entry of [...block.outcomes, ...block.practicalWork]) {
      byId.set(entry.id, entry);
    }
    for (const concept of block.concepts) {
      conceptNames.add(normalizeConcept(concept));
    }
  }

  const lookup = (ids: readonly string[]): CurriculumEntry[] =>
    ids.map((id) => byId.get(id) ?? { id, text: "" });

  return {
    outcomes: lookup(manifest.outcomes),
    practicalWork: lookup(manifest.practicalWork),
    concepts: manifest.concepts.map((name) => ({
      name,
      inCurriculum: conceptNames.has(normalizeConcept(name)),
    })),
  };
}
