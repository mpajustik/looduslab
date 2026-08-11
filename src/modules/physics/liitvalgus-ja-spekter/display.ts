import { SPECTRUM_BANDS, type SpectrumBandId } from "./model";

/**
 * Spektri ribade VÄRVID ekraanil (docs/MOODULILEPING.md „display.ts").
 *
 * Miks omaette failis: neid värve vajavad KAKS faili – `figures.tsx`
 * (teooria spektririba, kolm spektrit harjutuses) ja `Simulation.tsx`
 * (spektroskoobi riba). Kui nad elaksid ühes neist, peaks teine ta importima
 * ja tiriks kaasa kogu selle faili koodi (CLAUDE.md reegel 13) – või, veel
 * hullem, tekiks kaks värviloendit, mis ühel päeval lahku lähevad ja õpilane
 * näeks teoorias ühte rohelist ja simulatsioonis teist.
 *
 * Miks MITTE `model.ts`-is: heksakood ei ole füüsika. Mudel ütleb, et riba
 * nimi on „roheline" – millise pikslivärviga seda ekraanil näidata, on
 * kuvamisotsus (CLAUDE.md reegel 1). Mudel jääb ka siis õigeks, kui joonis
 * kunagi hoopis mustvalgeks tehakse.
 *
 * Otsuseid siin ei ole: fail ei tea, kas riba on värviline või tume – seda
 * otsustab `emitsAtWavelength` mudelis. Siin on ainult vastus küsimusele
 * „mis värvi seda riba joonistada".
 *
 * **Värv ei ole kunagi ainus info kandja** (docs/DISAINIJUHIS.md): iga riba
 * kannab joonisel ka nime („roheline") ja lainepikkuse skaalat, seega töötab
 * kogu moodul ka värvipimeda õpilase jaoks. Just seepärast on ka mudeli
 * vastused SÕNAD, mitte värvid.
 */

/**
 * Riba id → ekraanivärv.
 *
 * Tüüp `Record<SpectrumBandId, string>` on siin meelega: kui mudelisse lisada
 * kunagi kaheksas riba, ei kompileeru see fail enne, kui ka tema värv on
 * kirjas. Vaikselt värvita riba oleks joonisel lihtsalt auk.
 *
 * Toonid on tumedad meelega – kollane ja oranž peavad püsima valgel taustal
 * loetavad ka projektoril, mille kontrast on klassiruumis kehv.
 */
const BAND_COLOURS: Record<SpectrumBandId, string> = {
  violet: "#7c3aed",
  indigo: "#4338ca",
  blue: "#1d4ed8",
  green: "#15803d",
  yellow: "#ca8a04",
  orange: "#ea580c",
  red: "#b91c1c",
};

/**
 * Millise värviga see riba ekraanil on.
 *
 * Tundmatu id VISKAB vea, nagu mudeliski: vaikne „läbipaistev" jätaks
 * joonisele augu, mida keegi enne tundi tähele ei paneks.
 */
export function bandColour(bandId: string): string {
  const colour = BAND_COLOURS[bandId as SpectrumBandId];
  if (colour === undefined) {
    throw new RangeError(`Tundmatu spektri riba: ${bandId}`);
  }
  return colour;
}

/**
 * Ribad, mille peal peab sildi tekst olema TUME.
 *
 * Kollane (#ca8a04) ja oranž (#ea580c) on nii heledad, et valge tekst annab
 * kontrasti 2,9:1 ja 3,6:1 – WCAG nõuab väiksel tekstil 4,5:1 ja meie tekst on
 * joonisel 10 px. Tumeda sildiga on samad ribad 5,6:1 ja 4,7:1. See ei ole
 * pisiasi: joonist loetakse projektorilt klassi tagant (CLAUDE.md „fondid
 * loetavad ka projektorilt"). Kontrasti valvab test (CodeRabbiti leid samm
 * 4.1w).
 */
const DARK_LABEL_BANDS: readonly SpectrumBandId[] = ["yellow", "orange"];

/** Sildi värv tumeda riba peal. */
export const LIGHT_LABEL_COLOUR = "#ffffff";

/**
 * Sildi värv heleda riba peal – sama toon mis rakenduse tekst (`--color-ink`,
 * slate-900).
 *
 * Riba tumeda aluse toon (`SPECTRUM_OFF_COLOUR`, slate-800) EI kõlba: oranžil
 * ribal annab ta 4,1:1 ehk jääks piirist napilt alla. Testi ootus on 4,5:1,
 * seega ta kukuks – ja just nii see viga leitigi.
 */
export const DARK_LABEL_COLOUR = "#0f172a";

/** Millise värviga kirjutada riba NIMI riba enda peale. */
export function bandLabelColour(bandId: string): string {
  // Läbi `bandColour`-i, et tundmatu id viskaks vea siingi – vaikselt valge
  // silt tundmatul ribal oleks täpselt see, mida see fail vältida püüab.
  bandColour(bandId);
  return DARK_LABEL_BANDS.includes(bandId as SpectrumBandId)
    ? DARK_LABEL_COLOUR
    : LIGHT_LABEL_COLOUR;
}

/**
 * Spektririba värv seal, kus allikas EI kiirga (ja väljaspool nähtavat ala).
 *
 * Tume, mitte valge: spektroskoop näitab pimedust, mitte tühja paberit. Valge
 * riba tähendaks õpilase silmis „valge valgus" ja see on täpselt vastupidine
 * sellele, mida ta seal näha peaks.
 */
export const SPECTRUM_OFF_COLOUR = "#1e293b";

/** Ribade värvid spektri järjekorras – riba joonistamiseks vasakult paremale. */
export const SPECTRUM_STOPS = SPECTRUM_BANDS.map((band) => ({
  id: band.id,
  label: band.label,
  minNm: band.minNm,
  maxNm: band.maxNm,
  colour: bandColour(band.id),
  labelColour: bandLabelColour(band.id),
}));
