import { defineActivities } from "../../../engine/contract";
import type { ReviewCard, Step } from "../../../engine/contract";
import {
  LIGHTS,
  blockedChannels,
  perceivedColour,
  transmittedChannels,
} from "./model";

/**
 * Sammud ja kordamiskaardid (docs/MOODULILEPING.md,
 * sisu/MOODUL-valgusfiltrid.md).
 *
 * **Ükski arv ega värvinimi ei ole siia käsitsi kirjutatud** – läbi läinud ja
 * kinni jäänud kanalite arv ning ekraani värv tulevad `model.ts`-ist (CLAUDE.md
 * reegel 1). Nii ei saa ülesande vastus ja simulatsiooni näit kunagi lahku
 * minna: kui keegi muudab kollase filtri läbilastavaid kanaleid, muutub ka
 * harjutuse tekst. Testis (tests/valgusfiltrid.model.test.ts) võrreldakse neid
 * arve SPETSIFIKATSIOONI tabeliga, mitte activities.ts iseendaga.
 *
 * **Teooria räägib ainult ÜHEST filtrist.** Kahe filtri koosmõju (läbi pääseb
 * ainult ühisosa, järjekord ei loe) jääb õpilase enda avastada – nii nõuab
 * ainekava metoodiline soovitus („valgusfiltrite tööpõhimõte las õpilane ise
 * avastab"). Seepärast on ennustus (samm 3) kahe filtri kohta ja tema kontroll
 * tuleb alles simulatsioonis (explore-3).
 *
 * **Tolerantsid.** Kõik arvulised vastused on selles moodulis loendatud
 * täisarvud (värvide arv), ühikuta. Spetsifikatsioonis seisab tolerants 0, aga
 * moodulileping nõuab positiivset arvu – ±0,5 tähendab täpselt sama asja:
 * naaberarv (1 või 3) läheb valeks. Lugemistolerantsi selles moodulis ei ole,
 * sest simulatsioonis ei ole ühtegi mõõdetavat suurust (ei liugurit ega
 * näidikut) – sama teadlik valik nagu moodulis `esemete-varvus`.
 */

/** Valgus mudelist – ülesande tekst ei tohi valguse koostist peast teada. */
function light(lightId: string) {
  const found = LIGHTS.find((candidate) => candidate.id === lightId);
  if (!found) throw new RangeError(`Tundmatu valgus: ${lightId}`);
  return found;
}

/** Loendatud täisarv: ±0,5 tähendab „täpselt see arv" (vt faili päist). */
const EXACT_TOLERANCE = { mode: "absolute", value: 0.5 } as const;

// --- Ülesannete seisud ja nende vastused (vastused mudelist) ---------------

/** Mitu värvi on valges valguses – kõigi „mitu kolmest" küsimuste nimetaja. */
const WHITE_CHANNEL_COUNT = light("white").channels.length;

/** Explore 1: punane filter valges valguses – mitu kanalit jääb kinni. */
const RED_FILTER_BLOCKED = blockedChannels("white", ["red"]).length;

/** Practice 1: kollane filter valges valguses – mitu läheb läbi, mitu jääb. */
const YELLOW_FILTER_PASSED = transmittedChannels("white", ["yellow"]).length;
const YELLOW_FILTER_BLOCKED = blockedChannels("white", ["yellow"]).length;

/** Exit 2: sinine filter valges valguses. */
const BLUE_FILTER_BLOCKED = blockedChannels("white", ["blue"]).length;

/**
 * Ülesannete ekraanivärvid – kõik mudelilt, mitte peast.
 *
 * Just need on selle mooduli ÕIGED VASTUSED. Kui nad oleksid siin sõnadena
 * kirjas, saaks mudel ühel päeval ühte öelda ja ülesanne teist – ja õpilane
 * näeks ekraanil pimedust, aga „õige" vastus oleks roheline.
 */
const WHITE_THROUGH_GREEN = perceivedColour("white", ["green"]);
const WHITE_THROUGH_YELLOW = perceivedColour("white", ["yellow"]);
const YELLOW_THEN_BLUE = perceivedColour("white", ["yellow", "blue"]);
const BLUE_THEN_YELLOW = perceivedColour("white", ["blue", "yellow"]);
const YELLOW_THEN_GREEN = perceivedColour("white", ["yellow", "green"]);
const RED_LIGHT_GREEN_FILTER = perceivedColour("red", ["green"]);
const YELLOW_LIGHT_BLUE_FILTER = perceivedColour("yellow", ["blue"]);

/** Mudeli värvinimi lause algusesse ehk vastusevariandi tekstiks. */
function capitalise(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

const steps: Step[] = [
  {
    type: "hook",
    id: "hook-1",
    // Joonis näitab ainult seda, ET lava on sinine ja kile soe. MIKS, seda
    // ütlevad teooria ja simulatsioon – hook ei tohi vastust ette öelda.
    figure: "vf-lava-prozektor",
    title: "Kust tuli lavale sinine valgus?",
    body: [
      "Kontserdilaval on sügavsinine valgus. Prožektori sees põleb aga tavaline valge lamp – sinist lampi seal ei ole.",
      "Prožektori ees on sinine kile. Kui pärast kontserti kilet katsuda, on ta käega tuntavalt soe.",
      "Kust see sinine värv tuli – ja miks on kile palav? Täna saad teada, mis juhtub valgusega filtris, ja õpid ennustama, mis jõuab kahe filtri taha.",
    ],
  },
  {
    type: "theory",
    id: "theory-1",
    title: "Mida teeb üks filter",
    body: [
      "Valgusfilter on läbipaistev kile või klaas, mis laseb läbi ainult osa värvidest. Punane filter laseb läbi punase; rohelise ja sinise ta NEELAB ehk võtab endasse. See, mis läbi ei läinud, jäi peaaegu tervenisti filtrisse kinni ja muutus seal soojuseks – sellepärast on lava kile soe. (Väike osa peegeldub ka kile pinnalt tagasi – seda läiget on näha, kui kilet valguse käes keerata –, aga see on nii väike, et meie arvestame ainult kaht teed: läbi või kinni.)",
      `Filter EI tee värvi juurde. Ta ainult VÕTAB ÄRA. Valgest valgusest saab punase filtriga punase valguse, sest valges valguses oli punane juba olemas. Kui filtrile langeb punane valgus ja ette panna roheline filter, ei tule välja rohelist – ekraan jääb ${RED_LIGHT_GREEN_FILTER}.`,
      "Seos eelmise mooduliga: punane õun VALIS, mis tuleb tagasi; punane filter valib, mis läheb edasi. Sama seaduspära, kaks eri suunda.",
      "Filter ei ole prisma. Prisma lahutab valge valguse värvideks laiali (see tuleb 9. klassis); filter ei lahuta midagi, ta lihtsalt ei lase osa värve läbi ja need kaovad soojusena ära.",
      "Vikerkaares on värve palju, aga silmas on kolme sorti värviandurid: punase, rohelise ja sinise jaoks. Sellepärast saab meie mudel kolme värviga hakkama – sama lihtsustus, mis moodulis „Esemete värvus\".",
    ],
    figure: "vf-uks-filter",
  },
  {
    type: "predict",
    id: "predict-1",
    title: "Paku oma ennustus",
    body: [
      "Valge valgus läbib kõigepealt KOLLASE filtri ja kohe seejärel SINISE filtri. Ekraan on valge.",
    ],
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt: "Mis paistab valgele ekraanile?",
        options: [
          {
            id: "roheline",
            text: "Roheline – kollane ja sinine annavad ju rohelise",
            correct: false,
            misconception: "filtrid-segavad-varve",
          },
          {
            id: "helesinine",
            text: "Helesinine – kaks värvi segunevad",
            correct: false,
            misconception: "filter-lisab-varvi",
          },
          {
            id: "pime",
            // Mudeli sõna jääb muutumata kujul lause lõppu: käändelõpu
            // liitmine („pime" + „daks") läheks katki kohe, kui mudel annaks
            // ühel päeval mõne teise värvi nime.
            text: `Ei midagi – ekraan on ${YELLOW_THEN_BLUE}`,
            correct: true,
          },
        ],
      },
      {
        kind: "text",
        id: "predict-2",
        prompt: "Miks sa nii arvad? Põhjenda oma vastust.",
        minWords: 5,
      },
    ],
  },
  {
    type: "explore",
    id: "explore-1",
    title: "Uuri kahe filtripesaga",
    body: [
      "Vasakul on lamp, keskel kaks filtripesa üksteise järel ja paremal valge ekraan. Kumbki pesa võib olla tühi.",
      "Nooled näitavad, mis kuhugi jõuab: lambist tulevad ainult need värvid, mis valitud valguses olemas on, ja filtris kinni jäänud nool lõpeb filtri sees sildiga „neeldub\". Paremal näed, mis ekraanile jõuab ja mis värvi ekraan paistab.",
    ],
    questions: [
      {
        kind: "numeric",
        id: "explore-1",
        prompt: `Pane pessa 1 punane filter ja jäta pesa 2 tühjaks. Mitu värvi ${WHITE_CHANNEL_COUNT}-st jääb filtrisse kinni?`,
        hints: [
          "Loe nooli, mis filtri sees ära lõpevad.",
          "Läbi läheb ainult punane – ülejäänud kaks jäävad kinni.",
        ],
        tolerance: EXACT_TOLERANCE,
        answer: RED_FILTER_BLOCKED,
      },
      {
        kind: "choice",
        id: "explore-2",
        prompt:
          "Vaheta pesas 1 punane filter kollase vastu. Mis värvi on ekraan?",
        hints: ["Vaata, mitu noolt (mitu värvi) filter läbi laseb – kollane laseb rohkem kui üks."],
        options: [
          {
            id: "valge",
            text: "Valge – filter ei võta ju midagi ära",
            correct: false,
            misconception: "filter-ei-vota-midagi",
          },
          {
            id: "kollane",
            text: `${capitalise(WHITE_THROUGH_YELLOW)} – läbi lähevad korraga punane ja roheline ning silm näeb neid kahte koos kollasena`,
            correct: true,
          },
          { id: "punane", text: "Punane", correct: false },
        ],
      },
      {
        kind: "choice",
        id: "explore-3",
        prompt:
          "Jäta kollane filter pessa 1 ja pane pessa 2 sinine filter. Mis on ekraanil?",
        hints: ["Vaata, mitu noolt jõuab pesade VAHELE ja mitu neist edasi."],
        options: [
          {
            id: "roheline",
            text: "Roheline",
            correct: false,
            misconception: "filtrid-segavad-varve",
          },
          {
            id: "helesinine",
            text: "Helesinine",
            correct: false,
            misconception: "filter-lisab-varvi",
          },
          {
            id: "pime",
            text: `Ei midagi – ekraan on ${YELLOW_THEN_BLUE}. Kollane filter sinist läbi ei lase, seega sinisel filtril ei ole enam midagi läbi lasta`,
            correct: true,
          },
        ],
      },
      {
        kind: "choice",
        id: "explore-4",
        prompt:
          "Vaheta filtrid pesades ära: pessa 1 sinine, pessa 2 kollane. Mis muutub?",
        hints: [
          "Kumb filter jäi mõlemal juhul ilma läbilaskva värvita järele – kas järjekord seda muudab?",
        ],
        options: [
          {
            id: "sinine",
            text: "Nüüd tuleb ekraanile sinine",
            correct: false,
            misconception: "filtrite-jarjekord-loeb",
          },
          {
            id: "ei-muutu",
            text: `Ei muutu midagi – ekraan on ikka ${BLUE_THEN_YELLOW}. Läbi pääseb ainult see värv, mille MÕLEMAD filtrid läbi lasevad, ja sellist värvi siin ei ole`,
            correct: true,
          },
          {
            id: "kollane",
            text: "Nüüd tuleb ekraanile kollane",
            correct: false,
            misconception: "filtrite-jarjekord-loeb",
          },
        ],
      },
      {
        kind: "choice",
        id: "explore-5",
        prompt:
          "Sea lambiks PUNANE valgus ja pane pessa 1 roheline filter (pesa 2 tühjaks). Mis värvi on ekraan?",
        hints: ["Kas rohelisel filtril on üldse midagi läbi lasta?"],
        options: [
          {
            id: "roheline",
            text: "Roheline",
            correct: false,
            misconception: "filter-teeb-valgust",
          },
          {
            id: "pime",
            text: capitalise(RED_LIGHT_GREEN_FILTER),
            correct: true,
          },
          {
            id: "punane",
            text: "Punane – filter ei saa punast kinni pidada",
            correct: false,
            misconception: "filter-ei-vota-midagi",
          },
        ],
      },
    ],
    simulation: {
      // Lambi valik avaneb alles pärast ülesannet 3: enne seda on lamp valge ja
      // labor uurib ainult filtreid. Nii jääb korraga muutuma kaks asja, mitte
      // kolm (sisu/MOODUL-valgusfiltrid.md „explore").
      unlocks: [{ feature: "valguse-valik", afterQuestion: "explore-3" }],
    },
  },
  {
    type: "practice",
    id: "practice-1",
    title: "Proovi ise järele",
    // Näidis on LAHENDATUD ülesanne, mitte küsimus (docs/MOODULILEPING.md).
    worked: {
      prompt: "Valge valgus läbib rohelise filtri. Mis paistab ekraanile?",
      solution: [
        `Valges valguses on ${WHITE_CHANNEL_COUNT} värvi: punane, roheline ja sinine.`,
        "Roheline filter laseb läbi ainult ROHELISE; punase ja sinise ta NEELAB ja need muutuvad filtris soojuseks.",
        "Ekraanile jõuab ainult roheline valgus.",
      ],
      answer: `Ekraan paistab ${WHITE_THROUGH_GREEN}. Filter ei teinud rohelist juurde – see oli valges valguses juba olemas.`,
    },
    questions: [
      {
        // Osaline: tehe on ees, vastus tuleb ise.
        kind: "numeric",
        id: "practice-1",
        prompt: `Valges valguses on ${WHITE_CHANNEL_COUNT} värvi. Kollane filter laseb neist läbi ${YELLOW_FILTER_PASSED}. Mitu värvi jääb filtrisse kinni? Täida: ${WHITE_CHANNEL_COUNT} − ${YELLOW_FILTER_PASSED} = ___`,
        hints: ["See, mis läbi ei läinud, jäi kinni."],
        tolerance: EXACT_TOLERANCE,
        answer: YELLOW_FILTER_BLOCKED,
      },
      {
        kind: "choice",
        id: "practice-2",
        figure: "vf-kaks-pesa",
        prompt:
          "Vaata joonist: valge lamp, pesas 1 kollane filter, pesas 2 roheline filter. Mis värvi on ekraan?",
        hints: ["Läbi pääseb ainult see, mida lasevad läbi MÕLEMAD filtrid."],
        options: [
          {
            id: "kollane",
            text: "Kollane",
            correct: false,
            misconception: "filter-ei-vota-midagi",
          },
          { id: "roheline", text: capitalise(YELLOW_THEN_GREEN), correct: true },
          { id: "pime", text: "Pime", correct: false },
        ],
      },
      {
        kind: "choice",
        id: "practice-3",
        prompt:
          "Kollases valguses on punane ja roheline, sinist ei ole. Kollase valguse ette pannakse sinine filter. Mis on ekraanil?",
        hints: [
          "Kas filtrini jõuab üldse seda värvi, mida ta läbi lasta oskab?",
        ],
        options: [
          {
            id: "sinine",
            text: "Sinine",
            correct: false,
            misconception: "filter-teeb-valgust",
          },
          {
            id: "kollane",
            text: "Kollane",
            correct: false,
            misconception: "filter-ei-vota-midagi",
          },
          {
            id: "pime",
            text: `Ei midagi – ekraan on ${YELLOW_LIGHT_BLUE_FILTER}`,
            correct: true,
          },
        ],
      },
      {
        // Ülekanne, mitu õiget: anaglüüf ehk 3D-prillid (ainekava soovitus).
        kind: "choice",
        id: "practice-4",
        prompt:
          "3D-prillidel on üks klaas punane ja teine sinine. Valgele paberile on sama pilt joonistatud kaks korda: üks kord punase, teine kord sinise pliiatsiga. Millised väited on õiged?",
        hints: [
          "Punane filter laseb läbi punase, aga neelab sinise – mõtle iga joonise kohta eraldi, mida punase klaasi taga näed.",
        ],
        multiple: true,
        shuffle: true,
        options: [
          {
            id: "ainult-punane",
            text: "Punase klaasi läbi jõuab silma ainult punane valgus",
            correct: true,
          },
          {
            id: "punane-kaob",
            text: "Punase klaasi läbi vaadates kaob punane joonis valge paberi taustal peaaegu ära",
            correct: true,
          },
          {
            id: "sinine-tume",
            text: "Punase klaasi läbi paistab sinine joonis tumeda joonena",
            correct: true,
          },
          {
            id: "muudab-punaseks",
            text: "Punane klaas muudab sinise joonise punaseks",
            correct: false,
            misconception: "filter-lisab-varvi",
          },
          {
            id: "molemad-uhtemoodi",
            text: "Iga silm näeb mõlemat joonist ühtemoodi",
            correct: false,
            misconception: "filter-ei-vota-midagi",
          },
        ],
      },
    ],
  },
  {
    type: "exit",
    id: "exit-1",
    title: "Väljumispilet",
    questions: [
      {
        kind: "choice",
        id: "exit-1",
        prompt: "Mis juhtub värvidega, mida filter läbi ei lase?",
        hints: ["Filter kuumeneb kasutades – kuhu see energia jääb?"],
        options: [
          {
            id: "tagasi",
            text: "Nad põrkavad kõik lambi juurde tagasi",
            correct: false,
            misconception: "filter-ei-vota-midagi",
          },
          {
            id: "neelduvad",
            text: "Nad neelduvad peaaegu tervenisti filtris ja muutuvad seal soojuseks – sellepärast filter soojeneb",
            correct: true,
          },
          {
            id: "varvuvad",
            text: "Nad muutuvad filtri enda värviks",
            correct: false,
            misconception: "filter-lisab-varvi",
          },
        ],
      },
      {
        kind: "numeric",
        id: "exit-2",
        prompt: `Valges valguses on ${WHITE_CHANNEL_COUNT} värvi (punane, roheline, sinine). Valgus läbib sinise filtri. Mitu värvi jääb filtrisse kinni?`,
        hints: ["Üks läheb läbi, ülejäänud jäävad kinni."],
        tolerance: EXACT_TOLERANCE,
        answer: BLUE_FILTER_BLOCKED,
      },
      {
        kind: "text",
        id: "exit-3",
        prompt:
          "Sõber tahab teha koduse diskovalguse ja ütleb: „Panen taskulambi ette kõigepealt punase ja siis sinise kile – tuleb ilus lilla valgus.\" Mis tegelikult juhtub ja mida sa tal teha soovitad?",
        minWords: 10,
      },
    ],
  },
];

/**
 * Kordamiskaardid (docs/MOODULILEPING.md „activities.ts – kordamiskaardid",
 * sisu/MOODUL-valgusfiltrid.md „Kordamiskaardid").
 */
const reviewCards: ReviewCard[] = [
  {
    id: "rc-1",
    type: "concept",
    question: "Mida teeb valgusfilter talle langeva valgusega?",
    answer:
      "Laseb läbi ainult osa värvidest, ülejäänud neelab – need muutuvad filtris soojuseks. Juurde ta midagi ei tee.",
  },
  {
    id: "rc-2",
    type: "explain",
    question: "Miks paistab valge lamp punase filtri taga punane?",
    answer: `Valges valguses on kõik ${WHITE_CHANNEL_COUNT} värvi; punane filter laseb läbi punase ja neelab rohelise ja sinise, seega edasi jõuab ainult punane.`,
  },
  {
    id: "rc-3",
    type: "calc",
    question: `Valges valguses on ${WHITE_CHANNEL_COUNT} värvi. Kollane filter laseb läbi ${YELLOW_FILTER_PASSED}. Mitu jääb kinni?`,
    answer: `${YELLOW_FILTER_BLOCKED} (${WHITE_CHANNEL_COUNT} − ${YELLOW_FILTER_PASSED}); see värv neeldub filtris ja soojendab teda.`,
  },
  {
    id: "rc-4",
    type: "concept",
    question:
      "Mis jõuab ekraanile, kui valge valgus läbib kollase ja siis sinise filtri?",
    answer: `Mitte midagi – ekraan on ${YELLOW_THEN_BLUE}. Läbi pääseb ainult see värv, mida lasevad läbi mõlemad filtrid, ja ühist värvi neil ei ole. Järjekord ei muuda tulemust.`,
  },
  {
    id: "rc-5",
    type: "transfer",
    question:
      "Miks kaob punase kile läbi vaadates punase pliiatsiga joonistatud pilt valgelt paberilt ära?",
    answer:
      "Punase kile taga jõuab silma ainult punane valgus; nii valge paber kui ka punane joon saadavad punast tagasi, seega neid ei saa eristada. Sinine joon punast ei peegelda ja paistab tumedana – nii töötavad 3D-prillid.",
  },
];

export const activities = defineActivities({ steps, reviewCards });
