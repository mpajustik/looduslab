import type { ColorTemperatureClass } from "./model";

/**
 * Värvustemperatuuri SILDID ja toonid ekraanil (docs/MOODULILEPING.md
 * „display.ts", sisu/MOODUL-lambivalik.md „Füüsika").
 *
 * Miks omaette failis: mudel annab koodinime (`"soe"`, `"neutraalne"`,
 * `"kulm"`), aga eestikeelset silti „soe valge" vajavad KOLM kohta – teooria
 * joonis (figures.tsx), ülesannete tekstid (activities.ts) ja hiljem
 * simulatsiooni kastike (Simulation.tsx). Kui silt elaks ühes neist, tekiks
 * teine loend, mis ühel päeval lahku läheb, ja õpilane näeks teoorias üht sõna
 * ja simulatsioonis teist.
 *
 * Miks MITTE model.ts-is: sõnastus ega heksakood ei ole füüsika (CLAUDE.md
 * reegel 1). Mudel ütleb, MILLISESSE vahemikku värvustemperatuur langeb; kuidas
 * seda nimetada ja millise tooniga näidata, on kuvamisotsus. Nii ei jõua vaidlus
 * sõnastuse üle kunagi ühegi kontrollitava küsimuse õige vastuse sisse.
 *
 * **Värv ei ole ainus info kandja** (docs/DISAINIJUHIS.md): iga joonis ja iga
 * kastike kannab tooni kõrval ka SILTI ja kelvinite arvu. Just see moodul oleks
 * muidu värvipimeda õpilase jaoks läbimatu – „soe" ja „külm" ongi siin
 * värvivahe.
 */

/**
 * Koodinimi → eestikeelne silt.
 *
 * Tüüp `Record<ColorTemperatureClass, string>` on meelega: kui mudelisse
 * lisanduks kunagi neljas liigitus, ei kompileeruks see fail enne, kui ka tema
 * silt on kirjas. Vaikselt sildita liigitus jätaks ekraanile tühja koha.
 */
const LABELS: Record<ColorTemperatureClass, string> = {
  soe: "soe valge",
  neutraalne: "neutraalne valge",
  kulm: "külm valge",
};

/** Eestikeelne silt, mida õpilane ekraanil näeb („soe valge"). */
export function colorTemperatureLabel(kind: ColorTemperatureClass): string {
  return LABELS[kind];
}

/**
 * Toon, millega seda valgust joonisel näidata.
 *
 * Toonid on HELED (nad on tausta, mitte teksti värv) ja tahtlikult tagasihoidlik
 * vahe – päris 2700 K tuba ei ole oranž. Loetavus ei tohi neist sõltuda: sildid
 * ja arvud on kõigil kolmel pildil sama tumeda tekstiga.
 */
const TINTS: Record<ColorTemperatureClass, string> = {
  soe: "#fde68a",
  neutraalne: "#fef9c3",
  kulm: "#dbeafe",
};

/** Ruumi valguse toon joonisel – vt {@link TINTS}. */
export function lightTint(kind: ColorTemperatureClass): string {
  return TINTS[kind];
}
