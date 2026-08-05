/**
 * sync-modules reeglid – puhtad funktsioonid (samm 2.5, ülevaatuse leiud).
 *
 * Miks eraldi failis ja miks TypeScript: siin on ainus koht, kus skript
 * OTSUSTAB midagi (kas tohib kirjutada). Otsus peab olema testitav ilma
 * andmebaasita – täpselt nagu model.ts füüsikas (CLAUDE.md reegel 1 mõte).
 * Skript ise (sync-modules.mjs) loeb selle faili Vite kaudu sisse.
 */

/** modules tabeli rida, nii palju kui reeglid vajavad. */
export type ModuleRow = {
  id: string;
  slug: string;
};

/**
 * Kas registri read tohib baasi kirjutada?
 *
 * Kaks olukorda, mille peale peab kirjutamine ÄRA JÄÄMA (mõlemad rikuvad
 * CLAUDE.md reeglit 11 „id ja slug on igavesed"):
 *
 * 1. sama id, uus slug – upsert kirjutaks vana slugi vaikselt üle ja kõik
 *    juba jagatud lingid `/m/vana-slug` läheksid katki;
 * 2. sama slug, teine id – baasi unique-piirang viskaks küll vea, aga alles
 *    kirjutamise hetkel ja arusaamatu sõnastusega.
 *
 * Tagastab veateated (tühi loend = tohib kirjutada), mitte ei viska ise –
 * nii saab skript need korraga välja trükkida ja test neid lugeda.
 */
export function findBlockingConflicts(
  registryRows: readonly ModuleRow[],
  existingRows: readonly ModuleRow[],
): string[] {
  const problems: string[] = [];
  const slugById = new Map(existingRows.map((row) => [row.id, row.slug]));
  const idBySlug = new Map(existingRows.map((row) => [row.slug, row.id]));

  for (const row of registryRows) {
    const oldSlug = slugById.get(row.id);
    if (oldSlug !== undefined && oldSlug !== row.slug) {
      problems.push(
        `${row.id}: slug on baasis "${oldSlug}", registris "${row.slug}". ` +
          "Slug on igavene (CLAUDE.md reegel 11) – juba jagatud lingid ja " +
          "QR-koodid viitavad vanale. Taasta vana slug manifestis.",
      );
    }

    const ownerId = idBySlug.get(row.slug);
    if (ownerId !== undefined && ownerId !== row.id) {
      problems.push(
        `${row.id}: slug "${row.slug}" kuulub baasis moodulile ${ownerId}. ` +
          "Slug peab olema globaalselt unikaalne – vali uuele moodulile teine slug.",
      );
    }
  }

  return problems;
}

/**
 * Baasis olevad moodulid, mida registris ei ole.
 *
 * Neid EI kustutata: attempts.module_id viitab neile (ON DELETE RESTRICT) ja
 * õpilaste vastused ripuvad küljes. Õige lahendus on moodul alles jätta ja
 * panna manifestis `status: "archived"`.
 */
export function findOrphans(
  registryRows: readonly ModuleRow[],
  existingRows: readonly ModuleRow[],
): string[] {
  const registryIds = new Set(registryRows.map((row) => row.id));
  return existingRows.map((row) => row.id).filter((id) => !registryIds.has(id));
}
