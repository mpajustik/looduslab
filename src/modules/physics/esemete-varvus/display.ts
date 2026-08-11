import { CHANNELS, type ChannelId } from "./model";

/**
 * Mooduli VÄRVID ekraanil (docs/MOODULILEPING.md „display.ts").
 *
 * Miks omaette failis: neid värve vajavad KAKS faili – `figures.tsx` (teooria
 * õun, kolme eseme joonis) ja `Simulation.tsx` (pime tuba lambiga). Kui nad
 * elaksid ühes neist, peaks teine ta importima ja tiriks kaasa kogu selle faili
 * koodi (CLAUDE.md reegel 13) – või, veel hullem, tekiks kaks värviloendit, mis
 * ühel päeval lahku lähevad ja õpilane näeks teoorias üht punast noolt ja
 * simulatsioonis teist.
 *
 * Miks MITTE `model.ts`-is: heksakood ei ole füüsika. Mudel ütleb, et kanali
 * nimi on „punane" ja ese paistab „kollane" – millise pikslivärviga seda
 * ekraanil näidata, on kuvamisotsus (CLAUDE.md reegel 1). Mudel jääb õigeks ka
 * siis, kui joonis kunagi mustvalgeks tehakse.
 *
 * **Värv ei ole kunagi ainus info kandja** (docs/DISAINIJUHIS.md) ja selles
 * moodulis on see eriti valus: ülesanne palub lugeda, mitu noolt eseme sisse
 * kaob, ning punase ja rohelise noole eristamine on just see, mis värvipimedal
 * õpilasel ebaõnnestub. Seepärast kannab iga nool ka kanali NIME sõnaga ja iga
 * vastus on mudelis sõna, mitte värv.
 */

/**
 * Kanali id → noole värv.
 *
 * Tüüp `Record<ChannelId, string>` on meelega: kui mudelisse lisada kunagi
 * neljas kanal, ei kompileeru see fail enne, kui ka tema värv on kirjas.
 * Vaikselt värvita nool oleks joonisel lihtsalt nähtamatu.
 *
 * Toonid on tumedad – nooled ja sildid peavad püsima valgel taustal loetavad
 * ka projektoril, mille kontrast on klassiruumis kehv.
 */
const CHANNEL_COLOURS: Record<ChannelId, string> = {
  red: "#b91c1c",
  green: "#15803d",
  blue: "#1d4ed8",
};

/**
 * Millise värviga seda kanalit joonistada.
 *
 * Tundmatu id VISKAB vea, nagu mudeliski: vaikne „läbipaistev" jätaks joonisele
 * augu, mida keegi enne tundi tähele ei paneks.
 */
export function channelColour(channelId: string): string {
  const colour = CHANNEL_COLOURS[channelId as ChannelId];
  if (colour === undefined) {
    throw new RangeError(`Tundmatu värvikanal: ${channelId}`);
  }
  return colour;
}

/** Kanalid koos värvidega `CHANNELS` järjekorras – noolte joonistamiseks. */
export const CHANNEL_STOPS = CHANNELS.map((channel) => ({
  id: channel.id,
  label: channel.label,
  colour: channelColour(channel.id),
}));

/**
 * Sama kolm kanalit PIMEDA TOA taustal (`DARK_ROOM_COLOUR`).
 *
 * Miks teine toon samale kanalile: ülemised värvid on meelega tumedad, sest
 * joonised (figures.tsx) on valgel taustal. Simulatsioon on aga pime tuba, ja
 * seal annab #b91c1c tumesinise taustaga kontrasti 2,8:1 – nool oleks
 * projektoril praktiliselt nähtamatu, tema NIMI aga loetamatu (WCAG nõuab
 * väiksel tekstil 4,5:1). Heledad toonid annavad 6,6:1 … 10,5:1 ja seda valvab
 * test.
 *
 * See EI ole füüsika muutumine: mudeli jaoks on kanal ikka „punane". Ainus
 * erinevus on, mis pikslivärviga teda millisel taustal joonistada – täpselt
 * sama otsus, mis kogu selles failis.
 */
const CHANNEL_COLOURS_ON_DARK: Record<ChannelId, string> = {
  red: "#f87171",
  green: "#4ade80",
  blue: "#60a5fa",
};

/** Kanali värv pimeda toa taustal. Tundmatu id viskab vea, nagu ülalgi. */
export function channelColourOnDark(channelId: string): string {
  const colour = CHANNEL_COLOURS_ON_DARK[channelId as ChannelId];
  if (colour === undefined) {
    throw new RangeError(`Tundmatu värvikanal: ${channelId}`);
  }
  return colour;
}

/** Kanalid koos pimeda toa värvidega `CHANNELS` järjekorras. */
export const CHANNEL_STOPS_ON_DARK = CHANNELS.map((channel) => ({
  id: channel.id,
  label: channel.label,
  colour: channelColourOnDark(channel.id),
}));

/**
 * Paistva värvi NIMI (mudeli vastus) → laigu värv ekraanil.
 *
 * Võtmed on täpselt need kaheksa sõna, mida `perceivedColour` tagastada saab.
 * Võti on siin STRING, mitte tüübist tuletatud liit: mudel annab vastuse
 * sõnana ja tema `PERCEIVED_COLOURS` tabel on mudeli sisemine asi. Kooskõla
 * valvab test, mis käib mudeli kaudu läbi kõik kaheksa kanalihulka – nii ei saa
 * uus värvinimi mudelis jääda siin vaikselt värvituks.
 */
const SWATCH_COLOURS: Readonly<Record<string, string>> = {
  must: "#1e293b",
  punane: "#b91c1c",
  roheline: "#15803d",
  sinine: "#1d4ed8",
  kollane: "#ca8a04",
  lilla: "#7c3aed",
  helesinine: "#0e7490",
  valge: "#f8fafc",
};

/**
 * Millise värviga joonistada ese, mis paistab selle nimega värvi.
 *
 * Tundmatu nimi viskab vea samal põhjusel mis kanali oma: nähtamatu ese oleks
 * ekraanil täpselt sama, mis „ese on must" – ja see on selle mooduli kõige
 * tähtsam vastus, mida ei tohi juhuse hooleks jätta.
 */
export function swatchColour(colourName: string): string {
  const colour = SWATCH_COLOURS[colourName];
  if (colour === undefined) {
    throw new RangeError(`Tundmatu paistev värv: ${colourName}`);
  }
  return colour;
}

/** Sildi värv tumeda laigu peal. */
export const LIGHT_LABEL_COLOUR = "#ffffff";

/** Sildi värv heleda laigu peal – sama toon mis rakenduse tekst (slate-900). */
export const DARK_LABEL_COLOUR = "#0f172a";

/**
 * Laigud, mille peal peab sildi tekst olema TUME.
 *
 * Valge (#f8fafc) ja kollane (#ca8a04) on nii heledad, et valge tekst annab
 * kontrasti 1,1:1 ja 2,9:1 – WCAG nõuab väiksel tekstil 4,5:1 ja meie tekst on
 * joonisel 10–12 px. Tumeda sildiga on samad laigud 18,8:1 ja 5,6:1. Joonist
 * loetakse projektorilt klassi tagant (CLAUDE.md „fondid loetavad ka
 * projektorilt"), seega valvab kontrasti test.
 */
const DARK_LABEL_SWATCHES: readonly string[] = ["valge", "kollane"];

/** Millise värviga kirjutada värvi NIMI laigu enda peale. */
export function swatchLabelColour(colourName: string): string {
  // Läbi `swatchColour`-i, et tundmatu nimi viskaks vea siingi – vaikselt valge
  // silt tundmatul laigul oleks täpselt see, mida see fail vältida püüab.
  swatchColour(colourName);
  return DARK_LABEL_SWATCHES.includes(colourName)
    ? DARK_LABEL_COLOUR
    : LIGHT_LABEL_COLOUR;
}

/**
 * Pimeda toa taust (simulatsioon) ja kaadri taust joonistel.
 *
 * Tume, mitte must: päris must taust neelaks ka musta eseme ääre ära ja õpilane
 * ei näeks, KAS ese seal üldse on. „Ese on must" peab olema näha, mitte
 * arvatav.
 */
export const DARK_ROOM_COLOUR = "#0f172a";

/**
 * Eseme ääre värv pimedas toas.
 *
 * Musta eset joonistatakse tumedale taustale – ilma ääreta kaoks ta ära. Ääris
 * ei ole „valgus", vaid kontuur, seepärast on ta hallikas, mitte valge.
 */
export const OUTLINE_COLOUR = "#64748b";
