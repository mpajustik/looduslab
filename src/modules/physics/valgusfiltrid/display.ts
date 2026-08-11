import {
  CHANNELS,
  type ChannelId,
  FILTERS,
  perceivedColourForChannels,
} from "./model";

/**
 * Mooduli VÄRVID ekraanil (docs/MOODULILEPING.md „display.ts").
 *
 * Miks omaette failis: neid värve vajavad KAKS faili – `figures.tsx` (ühe
 * filtri joonis, kahe pesa joonis) ja `Simulation.tsx` (labor). Kui nad
 * elaksid ühes neist, peaks teine ta importima ja tiriks kaasa kogu selle
 * faili koodi (CLAUDE.md reegel 13) – või, veel hullem, tekiks kaks
 * värviloendit, mis ühel päeval lahku lähevad ja õpilane näeks teoorias üht
 * punast noolt ja simulatsioonis teist.
 *
 * Miks MITTE `model.ts`-is: heksakood ei ole füüsika. Mudel ütleb, et kanali
 * nimi on „punane" ja ekraan paistab „kollane" – millise pikslivärviga seda
 * näidata, on kuvamisotsus (CLAUDE.md reegel 1).
 *
 * **Värv ei ole kunagi ainus info kandja** (docs/DISAINIJUHIS.md) ja siin on
 * see eriti valus: explore ülesanne 1 palub lugeda, mitu noolt filtri sisse
 * kaob, ning just punase ja rohelise noole eristamine ebaõnnestub värvipimedal
 * õpilasel. Seepärast kannab iga nool ka kanali NIME sõnaga ja iga vastus on
 * mudelis sõna, mitte värv.
 */

/**
 * Kanali id → noole värv.
 *
 * Tüüp `Record<ChannelId, string>` on meelega: kui mudelisse lisada kunagi
 * neljas kanal, ei kompileeru see fail enne, kui ka tema värv on kirjas.
 * Vaikselt värvita nool oleks joonisel lihtsalt nähtamatu.
 *
 * Toonid on tumedad – nooled ja sildid peavad püsima valgel taustal loetavad
 * ka projektoril, mille kontrast on klassiruumis kehv. Selle mooduli
 * simulatsioon on valgel taustal (labor, mitte pime tuba), seega teist
 * tooniloendit siin ei ole – vastupidi moodulile `esemete-varvus`.
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
 * Paistva värvi NIMI (mudeli vastus) → laigu värv ekraanil.
 *
 * Võtmed on täpselt need kaheksa sõna, mida `perceivedColour` tagastada saab.
 * Võti on siin STRING, mitte tüübist tuletatud liit: mudel annab vastuse
 * sõnana ja tema `PERCEIVED_COLOURS` tabel on mudeli sisemine asi. Kooskõla
 * valvab test, mis käib mudeli kaudu läbi kõik kaheksa kanalihulka – nii ei saa
 * uus värvinimi mudelis jääda siin vaikselt värvituks.
 *
 * „Pime" on TUMEHALL, mitte must: päris must ekraan sulaks kokku joonise
 * raamiga ja õpilane ei näeks, kas ekraan seal üldse on. „Ekraanile ei jõua
 * midagi" peab olema NÄHA, mitte arvata – ja et värv ei jääks ainsaks info
 * kandjaks, on tumeda ekraani peal ka sõna „PIME".
 */
const SWATCH_COLOURS: Readonly<Record<string, string>> = {
  pime: "#334155",
  punane: "#b91c1c",
  roheline: "#15803d",
  sinine: "#1d4ed8",
  kollane: "#ca8a04",
  lilla: "#7c3aed",
  helesinine: "#0e7490",
  valge: "#f8fafc",
};

/**
 * Millise värviga joonistada ekraan, mis paistab selle nimega värvi.
 *
 * Tundmatu nimi viskab vea samal põhjusel mis kanali oma: värvita ekraan oleks
 * täpselt sama, mis „ekraan on pime" – ja see on selle mooduli kõige tähtsam
 * vastus, mida ei tohi juhuse hooleks jätta.
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
 * joonisel 10–12 px. Joonist loetakse projektorilt klassi tagant (CLAUDE.md
 * „fondid loetavad ka projektorilt"), seega valvab kontrasti test.
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
 * Filtri klaasi toon – TULETATUD mudelist, mitte oma tabel.
 *
 * Filtri värv ongi see valgus, mille ta läbi laseb: kollane filter laseb läbi
 * punase ja rohelise ehk paistab kollane. Nii ei saa keegi lisada mudelisse
 * filtrit ja anda talle joonisel juhuslikult vale tooni – ega ka unustada
 * uuele filtrile värvi anda.
 */
export function filterColour(filterId: string): string {
  const filter = FILTERS.find((candidate) => candidate.id === filterId);
  if (!filter) {
    throw new RangeError(`Tundmatu filter: ${filterId}`);
  }
  return swatchColour(perceivedColourForChannels(filter.passes));
}

/**
 * Noolte kõrgused joonistel – üks kanali kohta, kanali ID järgi.
 *
 * `Record<ChannelId, number>`, mitte massiiv: massiivi indekseeriks kanali
 * järjekorranumber ja neljas kanal annaks `undefined`, mille tüüp oleks ikka
 * `number` (`noUncheckedIndexedAccess` ei ole projektis sees) – nool
 * joonistuks koordinaadiga `NaN` ja kaoks jooniselt VAIKSELT ära. Nüüd ei
 * kompileeru uus kanal enne, kui ka tema koht joonisel on kirjas. Sama otsus
 * ja sama põhjus mis värvidel ülalpool (CodeRabbiti leid samm 4.1ff).
 *
 * Miks siin, mitte figures.tsx-is: `.tsx`-fail tohib eksportida ainult
 * komponente (ESLint `react-refresh/only-export-components`), ja test peab
 * neid kaarte nägema, et kontrollida, kas iga kanal on kaetud ja kas kaks
 * noolt satuvad ühele kõrgusele.
 */
export const SINGLE_FILTER_RAY_Y: Record<ChannelId, number> = {
  red: 76,
  green: 116,
  blue: 156,
};

/** Sama kahe pesa joonisel – vt `SINGLE_FILTER_RAY_Y`. */
export const TWO_SLOT_RAY_Y: Record<ChannelId, number> = {
  red: 70,
  green: 106,
  blue: 142,
};

/**
 * Filtri klaasi läbipaistvus joonisel.
 *
 * Filter EI ole läbipaistmatu ese (see on mooduli `esemete-varvus` teema) –
 * temast peab paistma, et ta on kile või klaas. Poolläbipaistev täide näitab
 * seda ilma ühegi lisasildita.
 */
export const FILTER_OPACITY = 0.55;

/** Eseme ja raami ääre värv – kontuur, mitte valgus. */
export const OUTLINE_COLOUR = "#64748b";

/**
 * Tühja filtripesa toon.
 *
 * Tühi pesa peab olema NÄHTAV (õpilane peab aru saama, et pesa on olemas, aga
 * tühi), aga ta ei tohi paista klaasina – seepärast on ta ainult katkendlik
 * hall raam ilma täiteta ja tema all seisab sõna „tühi".
 */
export const EMPTY_SLOT_COLOUR = "#94a3b8";
