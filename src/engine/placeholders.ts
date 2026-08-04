/**
 * Kohahoidjad küsimuse tekstis: „Sea nurk {nurk}°".
 *
 * Miks omaette fail: mustrit on vaja KAHES kohas, mis ei tohi teineteist
 * importida – skeem (contractSchema.ts) kontrollib, et iga variant katab
 * kõik kohahoidjad, ja engine (resolve.ts) asendab nad päris arvudega.
 * contractSchema toob kaasa zodi, mis ei tohi jõuda brauseri bundle'isse
 * (CLAUDE.md reegel 13), seega ei saa resolve.ts sealt midagi importida.
 *
 * Kaks eraldi kirjutatud mustrit tähendaks, et ühe muutmisel kontrollib
 * skeem ühte asja ja engine asendab teist – ja vahe paistaks välja alles
 * õpilase ekraanil.
 */

/**
 * Uus mustri eksemplar iga kutse kohta.
 *
 * `/g`-lipuga regexil on olek (`lastIndex`), seega ühine muutuja annaks
 * järgmisel kutsel poolikuid tulemusi.
 */
function pattern(): RegExp {
  return /\{([a-zA-Z][a-zA-Z0-9]*)\}/g;
}

/** Millised kohahoidjad neis tekstides esinevad (`{nurk}` → `nurk`). */
export function placeholdersIn(texts: string[]): Set<string> {
  const found = new Set<string>();
  for (const text of texts) {
    for (const match of text.matchAll(pattern())) found.add(match[1]);
  }
  return found;
}

/**
 * Kohahoidjad päris väärtusteks.
 *
 * Väärtuseta kohahoidja jääb alles, MITTE ei muutu tühjaks: „{nurk}°" on
 * ekraanil nähtav viga, „°" oleks nähtamatu viga. Praktikas ei saa seda
 * juhtuda – skeem nõuab igalt variandilt kõiki nimesid.
 */
export function fillPlaceholders(
  text: string,
  values: Readonly<Record<string, string>>,
): string {
  return text.replace(pattern(), (whole, name: string) => values[name] ?? whole);
}
