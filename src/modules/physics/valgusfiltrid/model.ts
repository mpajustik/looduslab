/**
 * Valgusfiltrid – füüsika
 * (sisu/MOODUL-valgusfiltrid.md „Füüsika").
 *
 * Ainult puhtad funktsioonid: sama sisend → alati sama väljund, ei Reacti,
 * ei DOM-i, ei juhuslikkust (CLAUDE.md reegel 1). Simulation.tsx ainult kuvab
 * seda, mida siin arvutatakse.
 *
 * **See mudel ei arvuta energiat ega lainepikkusi – ta teeb HULGATEHTEID kahe
 * tabeli peal:** millistest värvikanalitest valgus koosneb (`LIGHTS`) ja
 * millised kanalid filter läbi laseb (`FILTERS`). Läbi jõuab see, mis on
 * valguses JA kõigis filtrites (ühisosa); kinni jääb see, mis oli valguses,
 * aga ei jõudnud läbi (vahe).
 *
 * **Miks oma kolm kanalit, mitte import moodulist `esemete-varvus`.** Moodulid
 * on iseseisvad – üks moodul ei impordi kunagi teise model.ts-i, muidu ei saa
 * kumbagi eraldi muuta ega arhiveerida (MOODULILEPING.md). Kolm kanalit on
 * siin sama valik samal põhjusel mis seal: silmas on kolme sorti värviandurid,
 * ja seitsme spektriribaga mudel nõuaks igalt filtrilt seitsmekohalist
 * läbilaskekõverat, mille iga vastus oleks kokkulepe.
 *
 * **Mida mudel meelega EI tea:**
 *
 * - *Peegeldumist ja esemete värvust* – see on mooduli `esemete-varvus` teema.
 *   Siin on kõik filtrid läbipaistvad ja ekraan alati valge: küsimus on „mis
 *   läheb LÄBI", mitte „mis tuleb tagasi".
 * - *Värvilise ESEME vaatamist läbi filtri* (punane joon punase klaasi all) –
 *   see nõuaks korraga kaht tabelit, eseme peegeldust JA filtri läbilaskvust.
 *   Anaglüüf on selles moodulis ülekandeülesanne ja päris katse, mitte mudeli
 *   funktsioon.
 * - *Miks* aine üht värvi neelab ja teist läbi laseb (molekulide
 *   energiatasemed, värvaine keemia) – gümnaasium. Siin on läbilaskvus ANTUD
 *   omadus: nii see kile käitub.
 * - *Heledust ja valgustugevust* – mudel loeb värvikanaleid, mitte vatte
 *   (vt idealiseering 1 ja `blockedShare` selgitus).
 *
 * IDEALISEERINGUD, mis peavad õpetajale ja UI-le teada olema:
 *
 * 1. **Filter laseb „oma" värvi läbi 100 %.** Päris kile neelab osa ka sellest
 *    värvist, mille ta läbi laseb – seepärast on filtri taga alati tuntavalt
 *    hämaram kui ilma filtrita. Mudelis heledust ei ole, ainult kanalid.
 * 2. **Kaks ühesugust filtrit annavad täpselt sama tulemuse mis üks.**
 *    `transmittedChannels("white", ["red", "red"])` = punane, sest hulkade
 *    ühisosa on idempotentne. Päris katses on kaks punast kilet üksteise peal
 *    nähtavalt TUMEDAMAD. See on mudeli piir, mitte õpilase mõõteviga.
 * 3. **Filtri servad ja paksus ei loe** – filter on mudelis pelgalt kanalite
 *    hulk.
 * 4. **Filtril on mudelis ainult kaks teed: läbi või kinni.** Päris kile
 *    pinnalt ka PEEGELDUB osa valgusest tagasi (just see annab kilele läike),
 *    seega `blockedChannels` ei ole päris elus täpselt sama asi mis „neeldub ja
 *    soojendab". Mudelis on kogu kinni jäänud osa neeldunud. UI ega
 *    õpetajajuhend ei tohi öelda „kolmandat teed ei ole" – see lause kehtib
 *    ainult läbipaistmatu eseme kohta moodulis `esemete-varvus`.
 *
 * Sildid (`label`) on eesti keeles, kuigi ülejäänud kood on inglise keeles
 * (reegel 9). Värvinimed EI ole siin pelgalt kasutajaliidese tekst, vaid
 * füüsika sisu: „kollane" on mudeli vastus ja täpselt sama sõna kontrollib
 * hiljem checker.
 *
 * Vigane sisend VISKAB vea, ta ei „paranda" ennast vaikselt – vaikne parandus
 * peidaks ära vea kutsuvas koodis (nt valikunupu vale id) ja õpilane näeks
 * õiget vastust vale sisendi pealt.
 */

/** Üks värvikanal: mudeli kõige väiksem osa valgusest. */
export interface Channel {
  readonly id: string;
  /** Kanali nimi eesti keeles – seda sõna näitab simulatsioon noole juures. */
  readonly label: string;
}

/**
 * Mudeli kolm värvikanalit.
 *
 * **Järjekord on OLULINE.** Kõik funktsioonid annavad kanaleid tagasi selles
 * järjekorras, olenemata sellest, mis järjekorras filtrid ette antakse – muidu
 * sõltuks `perceivedColour` tabelivõti sellest, kumb filter on pesas 1, ja
 * „ühisosa ei sõltu järjekorrast" ei kehtiks enam.
 */
export const CHANNELS = [
  { id: "red", label: "punane" },
  { id: "green", label: "roheline" },
  { id: "blue", label: "sinine" },
] as const satisfies readonly Channel[];

/** Värvikanali id („red", „green", „blue"). */
export type ChannelId = (typeof CHANNELS)[number]["id"];

/**
 * Vähemalt ühe elemendiga kanalite loend.
 *
 * Tüüp keelab tühja loendi ära juba kompileerimisel: valgus ilma kanaliteta on
 * pimedus (seda tabelis ei ole) ja filter ilma läbilastava kanalita ei ole
 * filter, vaid kate. Käitusajal valvab sama asja `assertTables`, sest tüübid
 * kaovad enne käivitamist.
 */
type NonEmptyChannels = readonly [ChannelId, ...ChannelId[]];

/** Üks valgus: millistest kanalitest ta koosneb. */
export interface Light {
  readonly id: string;
  /** Valguse nimi eesti keeles (simulatsiooni valikurida). */
  readonly label: string;
  /** Kanalid, mis selles valguses olemas on. Ei tohi olla tühi. */
  readonly channels: NonEmptyChannels;
}

/**
 * Simulatsiooni kolm valgust.
 *
 * Kolm, mitte viis: valge on põhitööriist, kollane näitab, et filter ei saa
 * läbi lasta seda, mida talle ei antud (kollases valguses sinist ei ole), ja
 * punane annab kõige teravama juhtumi – punane valgus rohelise filtri taga ei
 * anna midagi.
 */
export const LIGHTS = [
  { id: "white", label: "valge valgus", channels: ["red", "green", "blue"] },
  { id: "yellow", label: "kollane valgus", channels: ["red", "green"] },
  { id: "red", label: "punane valgus", channels: ["red"] },
] as const satisfies readonly Light[];

/** Valguse id („white", „yellow", „red"). */
export type LightId = (typeof LIGHTS)[number]["id"];

/** Üks filter: millised kanalid ta endast läbi laseb. */
export interface Filter {
  readonly id: string;
  /** Filtri nimi eesti keeles (simulatsiooni valikurida). */
  readonly label: string;
  /**
   * Kanalid, mille see filter läbi laseb. Ei tohi olla tühi – musta pappi
   * mudelis ei ole, see ei ole filter, vaid kate.
   */
  readonly passes: NonEmptyChannels;
}

/**
 * Simulatsiooni neli filtrit.
 *
 * **Kollane filter on tabelis meelega:** tema abil avastab õpilane, et
 * „kollane + sinine" ei anna rohelist ega helesinist, vaid pimeduse – kollane
 * laseb läbi punase ja rohelise, sinine ainult sinise, ühisosa on tühi. Ilma
 * temata jääks alles ainult „üks kanal vs üks kanal" ja kahe filtri ühisosa ei
 * tuleks kordagi huvitavalt välja.
 */
export const FILTERS = [
  { id: "red", label: "punane filter", passes: ["red"] },
  { id: "green", label: "roheline filter", passes: ["green"] },
  { id: "blue", label: "sinine filter", passes: ["blue"] },
  { id: "yellow", label: "kollane filter", passes: ["red", "green"] },
] as const satisfies readonly Filter[];

/** Filtri id („red", „green", „blue", „yellow"). */
export type FilterId = (typeof FILTERS)[number]["id"];

/**
 * Mis värvi paistab ekraan, kui temale jõuab täpselt see kanalite hulk.
 *
 * Võti on kanalite id-d `CHANNELS` järjekorras, kokku liidetud sidekriipsuga;
 * tühi võti (`""`) on „ekraanile ei jõua midagi".
 *
 * **Tabel, mitte if-ahel, ja KÕIK kaheksa juhtu on kirjas** – ka „lilla", mida
 * praeguste tabelitega ühegi valguse ja filtrikombinatsiooniga kokku ei saa
 * (ükski filter ei lase läbi punast + sinist). Nii vastab funktsioon õigesti ka
 * siis, kui keegi lisab `FILTERS`-isse uue filtri.
 *
 * Tühja vastus on siin **„pime"**, mitte „must" nagu moodulis
 * `esemete-varvus`: ekraanile ei jõua valgust ja ekraan ei ole must ese, ta on
 * lihtsalt valgustamata. Kaks moodulit kirjeldavad kaht eri olukorda ja
 * peavadki eri sõna kasutama.
 */
const PERCEIVED_COLOURS: Readonly<Record<string, string>> = {
  "": "pime",
  red: "punane",
  green: "roheline",
  blue: "sinine",
  "red-green": "kollane",
  "red-blue": "lilla",
  "green-blue": "helesinine",
  "red-green-blue": "valge",
};

/**
 * Kanalite hulk `CHANNELS` järjekorras, kordusteta.
 *
 * Kogu mudeli järjekorrareegel on siin ÜHES kohas: temast sõltuvad nii
 * `transmittedChannels` kui ka `blockedChannels` ja seega ka `perceivedColour`
 * tabelivõti. Just see funktsioon teeb ka „filtrite järjekord ei loe"
 * seaduspära nähtavaks: ükskõik mis järjekorras filtrid ette anda, tuleb
 * vastus alati punane–roheline–sinine järjekorras.
 */
function inChannelOrder(ids: Iterable<string>): readonly Channel[] {
  const wanted = new Set<string>(ids);
  return CHANNELS.filter((channel) => wanted.has(channel.id));
}

/**
 * Valgus id järgi. Tundmatu id on viga, mitte tühi vastus – tühja vastuse
 * peale joonistaks Simulation.tsx vaikselt pimeda ekraani ja õpilane arvaks,
 * et „filter võttis kõik ära".
 */
function findLight(lightId: string): Light {
  const light = LIGHTS.find((candidate) => candidate.id === lightId);
  if (!light) {
    throw new RangeError(`Tundmatu valgus: ${lightId}`);
  }
  return light;
}

/** Filter id järgi. Tundmatu id on viga samal põhjusel mis valguse puhul. */
function findFilter(filterId: string): Filter {
  const filter = FILTERS.find((candidate) => candidate.id === filterId);
  if (!filter) {
    throw new RangeError(`Tundmatu filter: ${filterId}`);
  }
  return filter;
}

/**
 * Tabelite terviklikkuse kontroll, mis jookseb kohe mooduli laadimisel.
 *
 * Miks käitusajal, kui tüübid juba katavad tundmatud kanalid ja tühja loendi:
 * kordusi (`["red", "red"]`) tüüp ei näe, ja korduv kanal teeks `blockedShare`
 * nimetaja valeks (2/2 = 1 asemel 2/3). See läheks katki VAIKSELT ja alles
 * siis, kui keegi hiljem uue filtri või valguse trükiveaga lisab – seepärast
 * räägib viga kohe, mitte tunnis.
 */
function assertTables(): void {
  const channelIds = new Set<string>(CHANNELS.map((channel) => channel.id));
  if (channelIds.size !== CHANNELS.length) {
    throw new RangeError("CHANNELS: kanali id-d peavad olema unikaalsed");
  }
  const assertChannelSet = (ids: readonly string[], where: string): void => {
    if (ids.length === 0) {
      throw new RangeError(`${where}: kanalite loend ei tohi olla tühi`);
    }
    if (new Set(ids).size !== ids.length) {
      throw new RangeError(`${where}: sama kanal on loendis mitu korda`);
    }
    for (const id of ids) {
      if (!channelIds.has(id)) {
        throw new RangeError(`${where}: tundmatu kanal ${id}`);
      }
    }
  };
  for (const light of LIGHTS) {
    assertChannelSet(light.channels, `LIGHTS/${light.id}`);
  }
  for (const filter of FILTERS) {
    assertChannelSet(filter.passes, `FILTERS/${filter.id}`);
  }
}

assertTables();

/**
 * Millised kanalid jõuavad ekraanile: valguse kanalid ∩ iga filtri `passes`.
 *
 * Filtreid antakse ette LOENDINA, sest simulatsioonis on kaks pesa ja kumbki
 * võib olla tühi. Tühi loend tähendab „filtrit ei ole" – siis jõuab ekraanile
 * kogu valgus.
 *
 * Just see funktsioon otsustab, mitu noolt läheb simulatsioonis filtritest läbi
 * ekraanini – ja seega ka selle, mis värvi ekraan paistab.
 *
 * @param filterIds filtrite id-d pesade järjekorras (tühi loend = filtrit ei
 *   ole); järjekord ei muuda tulemust, sest ühisosa on vahetuv
 * @returns kanalid alati `CHANNELS` järjekorras, tühi loend = ekraan on pime
 */
export function transmittedChannels(
  lightId: string,
  filterIds: readonly string[],
): readonly Channel[] {
  const light = findLight(lightId);
  const passSets = filterIds.map(
    (filterId) => new Set<string>(findFilter(filterId).passes),
  );
  return inChannelOrder(
    light.channels.filter((id) => passSets.every((passes) => passes.has(id))),
  );
}

/**
 * Millised valguse kanalid EI jõua ekraanile: valguse kanalid ∖ läbi läinud.
 *
 * **Kinni jääda saab ainult see, mis filtrini jõudis.** Punane filter ei
 * „neela" kollasest valgusest sinist, sest sinist seal ei olnud –
 * `blockedChannels("red", ["red"])` on tühi, kuigi seesama punane filter jätab
 * valgest valgusest kaks kanalit kinni. Kui see funktsioon lähtuks filtri
 * omadustest, mitte langenud valgusest, õpetaks moodul vaikselt, et filter
 * neelab värve, mida talle ei antudki.
 */
export function blockedChannels(
  lightId: string,
  filterIds: readonly string[],
): readonly Channel[] {
  const light = findLight(lightId);
  const transmitted = new Set<string>(
    transmittedChannels(lightId, filterIds).map((channel) => channel.id),
  );
  return inChannelOrder(light.channels.filter((id) => !transmitted.has(id)));
}

/**
 * Mis värvi paistab valgus, mis koosneb täpselt neist kanalitest.
 *
 * Eraldi (valgusest ja filtritest sõltumatu) funktsioon selleks, et testida
 * saaks ka neid kanalihulki, mida praeguste tabelite pealt kokku ei saa:
 * „lilla" (punane + sinine). Sama muster mis moodulites `esemete-varvus` ja
 * `liitvalgus-ja-spekter` – võltsfiltri lisamine `FILTERS`-isse tooks ta ka
 * õpilase valikuritta.
 *
 * Sisendi järjekord ei loe ja kordused ei loe – vastus tuleb hulgast.
 * Tundmatu kanal on viga, mitte vaikselt ära jäetud kanal: muidu annaks
 * `["red", "sinine"]` vastuseks „punane" ja keegi otsiks viga värvitabelist.
 *
 * Sisend loetakse KÕIGEPEALT massiivi, alles siis kontrollitakse. Muidu käiks
 * funktsioon `Iterable`-sisendi kaks korda läbi ja generaator või Set-i
 * iteraator oleks teisel korral juba tühi – vastus tuleks vaikselt „pime".
 * (CodeRabbiti ja Codexi kattuv leid samm 4.1ee.)
 *
 * @returns värvi nimi eesti keeles, „pime" kui kanaleid ei ole
 */
export function perceivedColourForChannels(
  channels: Iterable<string>,
): string {
  const given = [...channels];
  for (const id of given) {
    if (!CHANNELS.some((channel) => channel.id === id)) {
      throw new RangeError(`Tundmatu värvikanal: ${id}`);
    }
  }
  const key = inChannelOrder(given)
    .map((channel) => channel.id)
    .join("-");
  const colour = PERCEIVED_COLOURS[key];
  if (colour === undefined) {
    // Siia ei saa jõuda, kuni `PERCEIVED_COLOURS` katab kõik kaheksa hulka
    // (seda valvab test). Vaikne `undefined` jõuaks aga UI-sse tühja sõnana.
    throw new RangeError(`Kanalite hulgale ei ole värvi nime: ${key}`);
  }
  return colour;
}

/**
 * Mis värvi on ekraan – vastuse annab läbi läinud kanalite hulk
 * (`PERCEIVED_COLOURS`).
 *
 * @returns värvi nimi eesti keeles, „pime" kui ekraanile ei jõua midagi
 */
export function perceivedColour(
  lightId: string,
  filterIds: readonly string[],
): string {
  return perceivedColourForChannels(
    transmittedChannels(lightId, filterIds).map((channel) => channel.id),
  );
}

/**
 * Kui suur osa filtrini JÕUDNUD valgusest jääb kinni: kinni jäänud kanalid
 * jagatud valguse kanalitega, arv 0…1.
 *
 * Ümardamist mudel ei tee – vormindus on `display.ts` või UI asi.
 *
 * Nimetaja on VALGUSE kanalite arv, mitte alati kolm: punases valguses jääb
 * rohelise filtri taha kogu talle langenud valgus, seega 1/1 = 1, mitte 1/3.
 * Ja see ongi õige vastus küsimusele „kui palju sellest, mis filtrini jõudis,
 * jäi kinni".
 *
 * **Miks kanalite JAGATIS, mitte energia.** Mudel loeb kanaleid, mitte vatte:
 * „valgest valgusest jääb punase filtri taha 2 kanalit 3-st" on 2/3 ≈ 0,67.
 * See EI ole päris energiaosakaal (päris punane kile neelab valgest valgusest
 * tublisti üle 80 %, sest ka punases ribas ei lähe kõik läbi) ja seepärast ei
 * küsi ükski selle mooduli ülesanne „mitu protsenti valgusest" – küsitakse
 * „mitu värvi kolmest". Kui seda vahet mitte hoida, õpetab moodul vaikselt
 * vale suurusjärku.
 */
export function blockedShare(
  lightId: string,
  filterIds: readonly string[],
): number {
  const light = findLight(lightId);
  return blockedChannels(lightId, filterIds).length / light.channels.length;
}
