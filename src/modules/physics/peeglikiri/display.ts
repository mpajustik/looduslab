import { isVerticallySymmetricLetter, mirrorLetterIndex } from "./model";

/**
 * Tähtede KUVAMINE ekraanil (docs/MOODULILEPING.md „display.ts",
 * sisu/MOODUL-peeglikiri.md „Füüsika").
 *
 * Miks omaette failis: mudel annab kaks puhast fakti – mitmendal kohal täht
 * peeglis seisab ({@link mirrorLetterIndex}) ja kas täht ise jääb peeglis
 * samaks ({@link isVerticallySymmetricLetter}). Sõna kokkupanek nendest
 * faktidest, eestikeelne silt („sama peeglis") ja roheline/punane toon on
 * KUVAMISOTSUSED, aga neid vajavad kolm kohta: teooriajoonis (figures.tsx),
 * ülesannete tekstid (activities.ts) ja hiljem simulatsioon (Simulation.tsx).
 * Kui nad elaksid ühes neist, tekiks teine loend, mis ühel päeval lahku läheb,
 * ja õpilane näeks teoorias üht sõna ning simulatsioonis teist.
 *
 * Miks MITTE model.ts-is: sõnastus, heksakood ega sõne kokkupanek ei ole
 * füüsika (CLAUDE.md reegel 1). Spetsifikatsioon ütleb selle otse välja –
 * mudelis EI OLE funktsiooni „peegelda terve sõna korraga", sest see
 * kombineeriks kahte olemasolevat fakti. Just seda kombineerimist teeb
 * {@link mirrorWordText} – ja ta ei tea ise ühtki reeglit, vaid küsib iga tähe
 * koha mudelilt.
 *
 * **Värv ei ole ainus info kandja** (docs/DISAINIJUHIS.md): iga roheline ja
 * punane täht kannab ekraanil ka SILTI („sama peeglis" / „muutub peeglis") ning
 * jooniste sisu on `aria-label`-is lausetena kirjas. Just see moodul oleks
 * muidu värvipimeda õpilase jaoks läbimatu.
 */

/**
 * Sõna tähtedeks – üks koht, kus sõne lahti võetakse.
 *
 * `[...word]` (mitte `word.split("")`) hoiab eesti täpitähed tervena: „Ä" on üks
 * märk, mitte kaks poolikut koodiühikut.
 */
export function letters(word: string): string[] {
  return [...word];
}

/**
 * Sõna nii, nagu ta peeglis paistab: **tähed vastupidises järjekorras**.
 *
 * Ainus tehe tuleb mudelist – iga tähe uue koha küsib see funktsioon
 * {@link mirrorLetterIndex}-lt, ta ei pööra sõnet ise ümber. Nii ei saa ekraanil
 * seista sõna, mille järjekord ei käi kokku ülesande vastusega.
 *
 * Tähe KUJU siin ei muudeta: „OSKAT" on tähtede JÄRJEKORD peeglis, mitte see,
 * milline iga täht seal välja näeb. Kuju eest vastutab
 * {@link isVerticallySymmetricLetter} ja joonisel SVG peegeldus.
 */
export function mirrorWordText(word: string): string {
  const source = letters(word);
  return source
    .map((_, index) => source[mirrorLetterIndex(index, source.length)])
    .join("");
}

/**
 * Sõna need tähed, mis jäävad peeglis ISE samasuguseks (rohelised).
 *
 * Kordused jäetakse välja – kastikeses „Sümmeetrilised tähed: T, A, O" on jutt
 * SELLEST, millised tähed sõnas on, mitte sellest, mitu korda igaüks esineb.
 * Loendamise küsimus (explore-2) käib seevastu KÕIGI tähtede peale, seega ta ei
 * kasuta seda funktsiooni.
 */
export function symmetricLettersOf(word: string): string[] {
  return [...new Set(letters(word))].filter((letter) =>
    isVerticallySymmetricLetter(letter),
  );
}

/** Sõna need tähed, mis peeglis muutuvad (punased). Vt {@link symmetricLettersOf}. */
export function changingLettersOf(word: string): string[] {
  return [...new Set(letters(word))].filter(
    (letter) => !isVerticallySymmetricLetter(letter),
  );
}

/** Tähtede loend ekraanile: „T, A, O". */
export function letterList(list: readonly string[]): string {
  return list.join(", ");
}

/**
 * Silt tähe kõrval – eestikeelne sõnastus, mida õpilane näeb.
 *
 * Sildid on lühikesed meelega: nad seisavad joonisel tähtede rea kohal ja
 * simulatsioonis kastikeses, mitte lauses.
 */
const SYMMETRY_LABELS = {
  same: "sama peeglis",
  changes: "muutub peeglis",
} as const;

/** Kas täht jääb peeglis samaks – silt ekraanile. */
export function letterSymmetryLabel(symmetric: boolean): string {
  return symmetric ? SYMMETRY_LABELS.same : SYMMETRY_LABELS.changes;
}

/**
 * Tähe toon joonisel ja simulatsioonis.
 *
 * Roheline ja punane on valitud tumedad (700-tugevus), sest nad on TEKSTI, mitte
 * tausta värv – valgel taustal annavad nad mõlemad üle 4,5:1 kontrasti. Sildi
 * ({@link letterSymmetryLabel}) kõrval on värv teine info kandja, mitte esimene.
 */
const SYMMETRY_COLOURS = {
  same: "#15803d",
  changes: "#b91c1c",
} as const;

/** Tähe toon – vt {@link SYMMETRY_COLOURS}. */
export function letterSymmetryColour(symmetric: boolean): string {
  return symmetric ? SYMMETRY_COLOURS.same : SYMMETRY_COLOURS.changes;
}
