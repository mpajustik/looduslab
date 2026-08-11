/**
 * Esemete värvus – füüsika
 * (sisu/MOODUL-esemete-varvus.md „Füüsika").
 *
 * Ainult puhtad funktsioonid: sama sisend → alati sama väljund, ei Reacti,
 * ei DOM-i, ei juhuslikkust (CLAUDE.md reegel 1). Simulation.tsx ainult kuvab
 * seda, mida siin arvutatakse.
 *
 * **See mudel ei arvuta energiat ega lainepikkusi – ta teeb HULGATEHTEID kahe
 * tabeli peal:** millistest värvikanalitest valgus koosneb (`LIGHTS`) ja
 * millised kanalid ese tagasi peegeldab (`OBJECTS`). Peegeldub see, mis on
 * mõlemas (ühisosa); neeldub see, mis oli valguses, aga mitte esemel (vahe).
 *
 * **Miks kolm kanalit, mitte eelmise mooduli seitse spektririba.** Moodulis
 * `liitvalgus-ja-spekter` on spekter riba lahutusega nanomeeter, sest seal on
 * küsimus „mis värv on 589 nm". Siin on küsimus „mis tuleb tagasi", ja sellele
 * vastab kolme kanali mudel täpselt nii hästi, kui 8. klassis vaja – ka silmas
 * on kolme sorti värviandurid. Seitsme ribaga mudel nõuaks igalt esemelt
 * seitsmekohalist peegeldusspektrit ja iga vastus („mis värvi see paistab")
 * oleks kokkulepe. Kaks moodulit on seepärast meelega KAKS eri mudelit ja
 * kumbki EI IMPORDI teist (moodulid on iseseisvad, vt MOODULILEPING.md).
 *
 * **Mida mudel meelega EI tea:**
 *
 * - *Valgusfiltrit* ehk valgust, mis läheb esemest LÄBI – see on mooduli
 *   `valgusfiltrid` teema. Siin on kõik esemed läbipaistmatud: valgus kas
 *   peegeldub tagasi või neeldub, kolmandat teed ei ole.
 * - *Miks* aine üht värvi neelab ja teist ei neela (aatomite energiatasemed) –
 *   see on gümnaasiumi aine. Siin on neeldumine ANTUD omadus: nii see pind on.
 * - *Kuhu* valgus peegeldub (langemis- ja peegeldumisnurk) – moodul
 *   `peegeldumisseadus`. Siin ei ole ühtegi nurka: kõik pinnad on matid ehk
 *   hajutavad, seepärast on esemel „oma värv" igast vaatenurgast sama.
 *
 * IDEALISEERINGUD, mis peavad õpetajale ja UI-le teada olema:
 *
 * 1. **Valge paber ei neela selles mudelis kunagi midagi** (`absorbedShare`
 *    = 0). Päris valge paber või valge särk neelab siiski umbes kümnendiku
 *    talle langevast valgusest ja soojeneb päikese käes veidi (hooki joonisel
 *    34 °C). Mudel loeb KANALEID („kas seda värvi tuleb tagasi"), mitte
 *    energiat, ja kanali kaupa on valge paberi vastus „tuleb tagasi" kõigi
 *    kolme puhul. Seepärast ei tohi UI kunagi öelda „ei neela midagi", vaid
 *    „peaaegu ei neela".
 * 2. **`absorbedShare` on kanalite JAGATIS, mitte energiaosakaal.** „Valgest
 *    valgusest neeldub 2 kanalit 3-st" on 2/3 ≈ 0,67; päris punane õun neelab
 *    valgest valgusest umbes 90 %, sest ka punases ribas ei peegeldu kõik.
 *    Seepärast ei küsi ükski selle mooduli ülesanne „mitu protsenti
 *    energiast" – küsitakse „mitu värvi kolmest". Kui seda vahet mitte hoida,
 *    õpetab moodul vaikselt vale suurusjärku.
 * 3. **`warmsUp` on jäme lihtsustus.** Päris soojenemine sõltub ka valguse
 *    võimsusest, eseme massist, materjalist ja tuulest. Mudel vastab ainult
 *    „kas neeldub üle poole langenud kanalitest".
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
 * järjekorras, olenemata sellest, mis järjekorras nad tabelis kirjas on –
 * muidu sõltuks `perceivedColour` tabelivõti juhusest ja simulatsiooni nooled
 * hüppaksid valguse vahetamisel kohta.
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
 * Tüüp ise keelab tühja loendi ära juba kompileerimisel – valgus, milles ei
 * ole ühtegi kanalit, on pimedus, ja pimedust selles tabelis ei ole (vt
 * `LIGHTS`). Käitusajal valvab sama asja `assertTables`, sest tüübid kaovad
 * enne käivitamist.
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
 * Simulatsiooni viis valgust.
 *
 * **Kollane valgus on tabelis meelega:** tema abil näeb explore-sammus, et
 * kollane sidrun paistab kollane ka siis, kui sinist valgust üldse ei ole –
 * „ese peegeldab seda, mida ta saab". Ilma kollaseta jääks alles ainult
 * „valge vs üks kanal" ja mudeli ühisosa-loogika ei tuleks kordagi välja.
 *
 * Pimedust (tühi `channels`) siin ei ole: „mis värvi on ese pimedas" on
 * väärarusaama `varv-on-esemes` küsimus, millele vastab teooria sõnadega,
 * mitte simulatsiooni valikunupp.
 */
export const LIGHTS = [
  { id: "white", label: "valge valgus", channels: ["red", "green", "blue"] },
  { id: "red", label: "punane valgus", channels: ["red"] },
  { id: "green", label: "roheline valgus", channels: ["green"] },
  { id: "blue", label: "sinine valgus", channels: ["blue"] },
  { id: "yellow", label: "kollane valgus", channels: ["red", "green"] },
] as const satisfies readonly Light[];

/** Valguse id („white" … „yellow"). */
export type LightId = (typeof LIGHTS)[number]["id"];

/** Üks ese: millised kanalid tema pind tagasi peegeldab. */
export interface SurfaceObject {
  readonly id: string;
  /** Eseme nimi eesti keeles (simulatsiooni valikurida). */
  readonly label: string;
  /**
   * Kanalid, mida see pind tagasi peegeldab. TOHIB olla tühi – tühi loend
   * ongi musta eseme definitsioon selle mudeli keeles.
   */
  readonly reflects: readonly ChannelId[];
}

/**
 * Simulatsiooni kuus eset. Kõik pinnad on matid ja läbipaistmatud.
 *
 * Must särk on ainus, mille `reflects` on tühi. Valge paber on tema
 * vastand – tema peegeldab kõik kolm ja on mudeli kõige olulisem „ese ei tee
 * värvi ise" tõestus: ta paistab alati lambi enda värvi.
 *
 * Kollane sidrun peegeldab KAHT kanalit ja on seepärast ainus ese, mille
 * paistev värv muutub kolmel eri moel (kollane, punane, roheline, must).
 */
export const OBJECTS = [
  { id: "paper", label: "valge paber", reflects: ["red", "green", "blue"] },
  { id: "shirt", label: "must särk", reflects: [] },
  { id: "apple", label: "punane õun", reflects: ["red"] },
  { id: "leaf", label: "roheline leht", reflects: ["green"] },
  { id: "mug", label: "sinine kruus", reflects: ["blue"] },
  { id: "lemon", label: "kollane sidrun", reflects: ["red", "green"] },
] as const satisfies readonly SurfaceObject[];

/** Eseme id („paper" … „lemon"). */
export type ObjectId = (typeof OBJECTS)[number]["id"];

/**
 * Mis värvi paistab ese, kui temalt tuleb tagasi täpselt see kanalite hulk.
 *
 * Võti on kanalite id-d `CHANNELS` järjekorras, kokku liidetud sidekriipsuga;
 * tühi võti (`""`) on „tagasi ei tule midagi".
 *
 * **Tabel, mitte if-ahel, ja KÕIK kaheksa juhtu on kirjas** – ka „lilla" ja
 * „helesinine", mida selle mooduli ülesannetes ette ei tule (ükski ese ei
 * peegelda punast+sinist). Nii vastab funktsioon õigesti ka siis, kui keegi
 * lisab `OBJECTS`-i uue eseme.
 *
 * Neid kaht seguvärvi saab testida ainult `perceivedColourForChannels` kaudu –
 * praeguste tabelitega ei tule nad ühegi valguse ja eseme paari pealt välja.
 */
const PERCEIVED_COLOURS: Readonly<Record<string, string>> = {
  "": "must",
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
 * `reflectedChannels` kui ka `absorbedChannels` ja seega ka `perceivedColour`
 * tabelivõti. Kui reegel oleks kirjas kaks korda, võiks ühel päeval juhtuda,
 * et nooled joonisel on ühes järjekorras ja vastus teises.
 */
function inChannelOrder(ids: Iterable<string>): readonly Channel[] {
  const wanted = new Set<string>(ids);
  return CHANNELS.filter((channel) => wanted.has(channel.id));
}

/**
 * Valgus id järgi. Tundmatu id on viga, mitte tühi vastus – tühja vastuse
 * peale joonistaks Simulation.tsx vaikselt pimeda toa ja õpilane arvaks, et
 * „see ese ongi must".
 */
function findLight(lightId: string): Light {
  const light = LIGHTS.find((candidate) => candidate.id === lightId);
  if (!light) {
    throw new RangeError(`Tundmatu valgus: ${lightId}`);
  }
  return light;
}

/** Ese id järgi. Tundmatu id on viga samal põhjusel mis valguse puhul. */
function findObject(objectId: string): SurfaceObject {
  const object = OBJECTS.find((candidate) => candidate.id === objectId);
  if (!object) {
    throw new RangeError(`Tundmatu ese: ${objectId}`);
  }
  return object;
}

/**
 * Tabelite terviklikkuse kontroll, mis jookseb kohe mooduli laadimisel.
 *
 * Miks käitusajal, kui tüübid juba katavad tundmatud kanalid ja tühja
 * valguse: kordusi (`["red", "red"]`) tüüp ei näe, ja korduv kanal teeks
 * `absorbedShare` nimetaja valeks (2/2 = 1 asemel 2/3). See läheks katki
 * VAIKSELT ja alles siis, kui keegi hiljem uue eseme või valguse trükiveaga
 * lisab – seepärast räägib viga kohe, mitte tunnis.
 */
function assertTables(): void {
  const channelIds = new Set<string>(CHANNELS.map((channel) => channel.id));
  if (channelIds.size !== CHANNELS.length) {
    throw new RangeError("CHANNELS: kanali id-d peavad olema unikaalsed");
  }
  const assertChannelSet = (
    ids: readonly string[],
    where: string,
    allowEmpty: boolean,
  ): void => {
    if (!allowEmpty && ids.length === 0) {
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
    assertChannelSet(light.channels, `LIGHTS/${light.id}`, false);
  }
  for (const object of OBJECTS) {
    assertChannelSet(object.reflects, `OBJECTS/${object.id}`, true);
  }
}

assertTables();

/**
 * Millised kanalid tulevad esemelt TAGASI: valguse kanalid ∩ eseme kanalid.
 *
 * Just see funktsioon otsustab, mitu noolt läheb simulatsioonis eseme juurest
 * silma poole – ja seega ka selle, mis värvi ese paistab.
 *
 * @returns kanalid alati `CHANNELS` järjekorras, tühi loend = tagasi ei tule
 *   midagi
 */
export function reflectedChannels(
  lightId: string,
  objectId: string,
): readonly Channel[] {
  const light = findLight(lightId);
  const object = findObject(objectId);
  const reflected = new Set<string>(object.reflects);
  return inChannelOrder(light.channels.filter((id) => reflected.has(id)));
}

/**
 * Millised kanalid esemes NEELDUVAD: valguse kanalid ∖ eseme kanalid.
 *
 * **Neelduda saab ainult see, mis esemele langes.** Sinine kruus ei „neela"
 * punases valguses rohelist, sest rohelist seal ei olnud –
 * `absorbedChannels("red", "apple")` on tühi, kuigi valges valguses neelab
 * seesama õun kaks kanalit. Kui see funktsioon lähtuks eseme omadustest,
 * mitte langenud valgusest, õpetaks moodul vaikselt, et ese neelab värve, mida
 * talle ei antudki.
 */
export function absorbedChannels(
  lightId: string,
  objectId: string,
): readonly Channel[] {
  const light = findLight(lightId);
  const object = findObject(objectId);
  const reflected = new Set<string>(object.reflects);
  return inChannelOrder(light.channels.filter((id) => !reflected.has(id)));
}

/**
 * Mis värvi paistab valgus, mis koosneb täpselt neist kanalitest.
 *
 * Eraldi (valgusest ja esemest sõltumatu) funktsioon selleks, et testida saaks
 * ka neid kanalihulki, mida praeguste tabelite pealt kokku ei saa: „lilla"
 * (punane + sinine) ja „helesinine" (roheline + sinine). Sama muster mis
 * moodulis `liitvalgus-ja-spekter` (`perceivedColourForBands`) – võltseseme
 * lisamine `OBJECTS`-i tooks ta ka õpilase valikuritta (CodeRabbiti ja Codexi
 * kattuv leid samm 4.1aa).
 *
 * Sisendi järjekord ei loe ja kordused ei loe – vastus tuleb hulgast.
 * Tundmatu kanal on viga, mitte vaikselt ära jäetud kanal: muidu annaks
 * `["red", "sinine"]` vastuseks „punane" ja keegi otsiks viga värvitabelist.
 *
 * @returns värvi nimi eesti keeles, „must" kui kanaleid ei ole
 */
export function perceivedColourForChannels(
  channels: Iterable<string>,
): string {
  for (const id of channels) {
    if (!CHANNELS.some((channel) => channel.id === id)) {
      throw new RangeError(`Tundmatu värvikanal: ${id}`);
    }
  }
  const key = inChannelOrder(channels)
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
 * Mis värvi ese paistab – vastuse annab peegeldunud kanalite hulk
 * (`PERCEIVED_COLOURS`).
 *
 * @returns värvi nimi eesti keeles, „must" kui tagasi ei tule midagi
 */
export function perceivedColour(lightId: string, objectId: string): string {
  return perceivedColourForChannels(
    reflectedChannels(lightId, objectId).map((channel) => channel.id),
  );
}

/**
 * Kui suur osa esemele LANGENUD valgusest neeldub: neeldunud kanalid jagatud
 * langenud kanalitega, arv 0…1.
 *
 * Ümardamist mudel ei tee – vormindus on `display.ts` või UI asi.
 *
 * Nimetaja on VALGUSE kanalite arv, mitte alati kolm: punases valguses
 * rohelisel lehel neeldub kogu talle langenud valgus, seega 1/1 = 1, mitte
 * 1/3. Ja see ongi õige vastus küsimusele „kui palju sellest, mis temale
 * langes, jäi esemesse".
 *
 * Vt faili päise idealiseeringud 1 ja 2: see arv ei ole energiaosakaal ja
 * valge paberi 0 on lihtsustus, mitte päris füüsika.
 */
export function absorbedShare(lightId: string, objectId: string): number {
  const light = findLight(lightId);
  return absorbedChannels(lightId, objectId).length / light.channels.length;
}

/**
 * Kas ese sellises valguses tuntavalt soojeneb: `absorbedShare > 0.5`.
 *
 * JÄME lihtsustus (vt faili päise idealiseering 3) – mudel ei tea valguse
 * võimsust ega eseme massi, seega ei oska ta vastata küsimusele „kui palju
 * kraade", vaid ainult „kas üle poole langenud valgusest jääb esemesse".
 *
 * Range võrdlus (`>`, mitte `>=`) on meelega: praeguste tabelitega täpselt
 * poolt ei tule kunagi ette (kolme kanaliga valguses on osad 0, 1/3, 2/3, 1),
 * aga kahe kanaliga kollases valguses annab üks neeldunud kanal 1/2 – ja siis
 * on aus vastus „ei soojene tuntavalt", mitte „soojeneb".
 */
export function warmsUp(lightId: string, objectId: string): boolean {
  return absorbedShare(lightId, objectId) > 0.5;
}
