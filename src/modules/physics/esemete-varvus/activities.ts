import { defineActivities } from "../../../engine/contract";
import type { ReviewCard, Step } from "../../../engine/contract";
import {
  LIGHTS,
  absorbedChannels,
  perceivedColour,
  reflectedChannels,
} from "./model";

/**
 * Sammud ja kordamiskaardid (docs/MOODULILEPING.md,
 * sisu/MOODUL-esemete-varvus.md).
 *
 * **Ükski arv ega värvinimi ei ole siia käsitsi kirjutatud** – neeldunud
 * kanalite arv, peegeldunud kanalite arv ja paistev värv tulevad `model.ts`-ist
 * (CLAUDE.md reegel 1). Nii ei saa ülesande vastus ja simulatsiooni näit kunagi
 * lahku minna: kui keegi muudab sidruni peegeldatavaid kanaleid, muutub ka
 * harjutuse tekst. Testis (tests/esemete-varvus.model.test.ts) võrreldakse neid
 * arve SPETSIFIKATSIOONI tabeliga, mitte activities.ts iseendaga.
 *
 * **Tolerantsid.** Kõik arvulised vastused on selles moodulis loendatud
 * täisarvud (kanalite arv), ühikuta. Spetsifikatsioonis seisab tolerants 0, aga
 * moodulileping nõuab positiivset arvu – ±0,5 tähendab täpselt sama asja:
 * naaberarv (1 või 3) läheb valeks. Lugemistolerantsi selles moodulis ei ole,
 * sest simulatsioonis ei ole ühtegi mõõdetavat suurust (ei liugurit ega
 * näidikut) – see on teadlik erinevus näiteks moodulist `liitvalgus-ja-spekter`.
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

/** Explore 1 ja exit 2: punases õunas neelduvad kanalid valges valguses. */
const APPLE_ABSORBED = absorbedChannels("white", "apple").length;

/** Practice 1: sinine kruus valges valguses – peegeldab ühe, neelab ülejäänud. */
const MUG_REFLECTED = reflectedChannels("white", "mug").length;
const MUG_ABSORBED = absorbedChannels("white", "mug").length;

/**
 * Näidise ja ülesannete paistvad värvid – kõik mudelilt, mitte peast.
 *
 * Just need on selle mooduli ÕIGED VASTUSED. Kui nad oleksid siin sõnadena
 * kirjas, saaks mudel ühel päeval ühte öelda ja ülesanne teist – ja õpilane
 * näeks ekraanil musta õuna, aga „õige" vastus oleks punane.
 */
const LEAF_IN_WHITE = perceivedColour("white", "leaf");
const APPLE_IN_GREEN = perceivedColour("green", "apple");
const LEMON_IN_RED = perceivedColour("red", "lemon");
const MUG_IN_YELLOW = perceivedColour("yellow", "mug");

/** Mudeli värvinimi lause algusesse ehk vastusevariandi tekstiks. */
function capitalise(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

const steps: Step[] = [
  {
    type: "hook",
    id: "hook-1",
    // Joonis näitab ainult seda, ET must särk on kuumem. MIKS, seda ütlevad
    // teooria ja simulatsioon – hook ei tohi vastust ette öelda.
    figure: "ev-must-ja-valge-sark",
    title: "Miks on must särk päikese käes palavam?",
    body: [
      "Kaks last seisavad kõrvuti päikese käes. Ühel on must särk, teisel valge. Mõlemale langeb täpselt sama palju päikesevalgust, aga musta särgi pind on 14 kraadi kuumem.",
      "Valgus jõudis mõlemani ühtemoodi. Kuhu see valgus valge särgi pealt kadus?",
      "Täna saad teada, miks ese on mingit värvi, ja õpid ennustama, mis värvi ta paistab teistsuguses valguses.",
    ],
  },
  {
    type: "theory",
    id: "theory-1",
    title: "Peegeldumine ja neeldumine",
    body: [
      "Kui valgus langeb läbipaistmatule esemele, juhtub kaks asja: osa valgusest PEEGELDUB tagasi, osa NEELDUB ehk läheb esemesse ja muutub seal soojuseks. Kolmandat teed ei ole – see, mis ei peegeldunud, on neeldunud. (Läbipaistvast esemest võib valgus ka läbi minna, aga see on juba valgusfiltri teema.)",
      "Me näeme eset selle valguse järgi, mis temalt tagasi tuleb. Ese ise valgust ei tee – ta on ainult see, kes valib, mida tagasi saata.",
      "VALGE ese peegeldab tagasi kõik värvid (natuke neelab temagi). MUST ese ei peegelda peaaegu midagi ja neelab peaaegu kõik – sellepärast must särk soojeneb. VÄRVILINE ese peegeldab tagasi „oma\" värvi ja neelab teised: punane õun peegeldab punase ning neelab rohelise ja sinise.",
      "Vikerkaares on värve palju rohkem, aga silmas on kolme sorti värviandurid: punase, rohelise ja sinise jaoks. Sellepärast saab ka meie mudel kolme värviga hakkama. Kui tagasi tuleb korraga punane ja roheline, näeb silm kollast; kui kõik kolm, siis valget; kui mitte midagi, siis musta.",
      `Ese saab peegeldada ainult seda, mis talle langeb. Punane õun rohelise valguse all paistab ${APPLE_IN_GREEN} – peegeldada oleks tal punast, aga punast valgust seal ei ole. Sellepärast ei tasu riiete värvi valida poe valguses.`,
      "Värvide segamine guaššiga on hoopis teine asi. Purgis segatakse värviAINEID, mis valgust ära neelavad – sellepärast annab kollane + sinine värvipurgis rohelise. Siin liidetakse VALGUSI ja kollane valgus ongi punane + roheline korraga.",
    ],
    figure: "ev-punane-oun",
  },
  {
    type: "predict",
    id: "predict-1",
    title: "Paku oma ennustus",
    body: [
      "Paneme pimedasse tuppa punase õuna ja valgustame teda ROHELISE lambiga. Muud valgust toas ei ole.",
    ],
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt: "Mis värvi õun paistab?",
        options: [
          {
            id: "punane",
            text: "Punane – ta on ju punane õun",
            correct: false,
            misconception: "varv-on-esemes",
          },
          {
            id: "roheline",
            text: "Roheline – ta peegeldab lambi valgust tagasi",
            correct: false,
            misconception: "ese-peegeldab-koike-mis-langeb",
          },
          {
            id: "must",
            text: "Must – ta ei saa peegeldada värvi, mida talle ei langenudki",
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
    title: "Uuri pimedas toas lambiga",
    body: [
      "Vasakul on lamp, keskel ese ja paremal silm. Lambi ja eseme vahel on nooled – ainult need värvid, mis valitud valguses päriselt olemas on.",
      "Eseme juurest lähevad silma poole need nooled, mis TAGASI tulid; ülejäänud kaovad eseme sisse sildiga „neeldub\". Paremal näed, mis tagasi tuleb ja mis värvi silm eset näeb.",
    ],
    questions: [
      {
        kind: "numeric",
        id: "explore-1",
        prompt: `Vali valge valgus ja punane õun. Mitu värvi ${WHITE_CHANNEL_COUNT}-st neeldub õunas?`,
        hints: [
          "Loe nooli, mis õuna sisse kaovad.",
          "Tagasi tuleb ainult punane – ülejäänud jäävad sisse.",
        ],
        tolerance: EXACT_TOLERANCE,
        answer: APPLE_ABSORBED,
      },
      {
        kind: "choice",
        id: "explore-2",
        prompt:
          "Jäta punane õun ja vaheta lamp roheliseks. Mis värvi õun nüüd paistab?",
        options: [
          {
            id: "punane",
            text: "Punane",
            correct: false,
            misconception: "varv-on-esemes",
          },
          {
            id: "roheline",
            text: "Roheline",
            correct: false,
            misconception: "ese-peegeldab-koike-mis-langeb",
          },
          { id: "must", text: capitalise(APPLE_IN_GREEN), correct: true },
        ],
      },
      {
        kind: "choice",
        id: "explore-3",
        prompt:
          "Vali kollane sidrun ja punane lamp. Mis värvi sidrun paistab?",
        hints: [
          "Sidrun peegeldab punast JA rohelist – aga mida punane lamp talle annab?",
        ],
        options: [
          {
            id: "kollane",
            text: "Kollane",
            correct: false,
            misconception: "varv-on-esemes",
          },
          { id: "punane", text: capitalise(LEMON_IN_RED), correct: true },
          { id: "must", text: "Must", correct: false },
        ],
      },
      {
        kind: "choice",
        id: "explore-4",
        prompt:
          "Proovi valget paberit kõigi viie lambiga läbi. Mille järgi paberi värv käib?",
        options: [
          {
            id: "alati-valge",
            text: "Paber on alati valge, sest ta ongi valge",
            correct: false,
            misconception: "varv-on-esemes",
          },
          {
            id: "lambi-jargi",
            text: "Paber paistab alati sama värvi, mis lamp – ta peegeldab kõik tagasi",
            correct: true,
          },
          {
            id: "teeb-valgeks",
            text: "Paber muudab valguse alati valgeks",
            correct: false,
          },
        ],
      },
    ],
  },
  {
    type: "practice",
    id: "practice-1",
    title: "Proovi ise järele",
    // Näidis on LAHENDATUD ülesanne, mitte küsimus (docs/MOODULILEPING.md).
    worked: {
      prompt: "Miks paistab roheline leht valges päikesevalguses roheline?",
      solution: [
        `Päikesevalguses on kõik ${WHITE_CHANNEL_COUNT} värvi: punane, roheline ja sinine.`,
        "Lehe pind peegeldab tagasi ROHELISE ja neelab PUNASE ja SINISE – need kaks muutuvad lehes soojuseks.",
        "Silma jõuab ainult roheline valgus.",
      ],
      answer: `Silma tuleb tagasi ainult roheline, seepärast paistab leht ${LEAF_IN_WHITE}. Leht ise valgust ei tee – ta ainult valib, mis tagasi läheb.`,
    },
    questions: [
      {
        // Osaline: tehe on ees, vastus tuleb ise.
        kind: "numeric",
        id: "practice-1",
        prompt: `Sinist kruusi valgustatakse valge valgusega. Kruus peegeldab ${MUG_REFLECTED} värvi ${WHITE_CHANNEL_COUNT}-st. Mitu värvi neeldub? Täida: ${WHITE_CHANNEL_COUNT} − ${MUG_REFLECTED} = ___`,
        hints: ["See, mis ei peegeldunud, on neeldunud."],
        tolerance: EXACT_TOLERANCE,
        answer: MUG_ABSORBED,
      },
      {
        kind: "choice",
        id: "practice-2",
        figure: "ev-kolm-eset",
        prompt:
          "Vaata kolme eset ühe ja sama valge lambi all. Milline neist soojeneb päikese käes kõige rohkem?",
        hints: ["Soojust annab see valgus, mis EI tule tagasi."],
        // Järjekord A, B, C kannab tähendust – joonisel on esemed samas reas.
        shuffle: false,
        options: [
          {
            id: "a",
            text: "A – tema juurest läheb tagasi kõik kolm noolt",
            correct: false,
            misconception: "valge-neelab-koige-rohkem",
          },
          { id: "b", text: "B – tema juurest läheb tagasi üks sinine nool", correct: false },
          { id: "c", text: "C – tema juurest ei lähe tagasi ühtegi noolt", correct: true },
        ],
      },
      {
        kind: "choice",
        id: "practice-3",
        prompt:
          "Sinine kruus pannakse kollase lambi alla. Kollases valguses on punane ja roheline, sinist ei ole. Mis värvi kruus paistab?",
        hints: [
          "Kas kruusile langeb üldse seda värvi, mida ta peegeldada oskab?",
        ],
        options: [
          {
            id: "sinine",
            text: "Sinine",
            correct: false,
            misconception: "varv-on-esemes",
          },
          {
            id: "kollane",
            text: "Kollane",
            correct: false,
            misconception: "ese-peegeldab-koike-mis-langeb",
          },
          { id: "must", text: capitalise(MUG_IN_YELLOW), correct: true },
        ],
      },
      {
        // Ülekanne, mitu õiget.
        kind: "choice",
        id: "practice-4",
        prompt: "Millised väited on õiged?",
        multiple: true,
        shuffle: true,
        options: [
          {
            id: "must-neelab",
            text: "Must ese neelab peaaegu kogu temale langeva valguse",
            correct: true,
          },
          {
            id: "valge-peegeldab",
            text: "Valge ese peegeldab kõik värvid tagasi",
            correct: true,
          },
          {
            id: "kiirgab-ise",
            text: "Ese kiirgab ise oma värvi valgust",
            correct: false,
            misconception: "ese-kiirgab-ise",
          },
          {
            id: "sama-ese-eri-varvi",
            text: "Sama ese võib eri valgustes paista eri värvi",
            correct: true,
          },
          {
            id: "pimedas-punane",
            text: "Pimedas toas on punane õun ikka punane",
            correct: false,
            misconception: "varv-on-esemes",
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
        prompt: "Miks paistab must särk must?",
        options: [
          {
            id: "kiirgab-musta",
            text: "Sest ta kiirgab musta valgust",
            correct: false,
            misconception: "must-varv-on-varv",
          },
          {
            id: "neelab",
            text: "Sest ta neelab peaaegu kogu temale langeva valguse ja tagasi ei tule peaaegu midagi",
            correct: true,
          },
          {
            id: "sile",
            text: "Sest tema pind on liiga sile, et valgust peegeldada",
            correct: false,
          },
        ],
      },
      {
        kind: "numeric",
        id: "exit-2",
        prompt: `Punast õuna valgustatakse valge valgusega, milles on ${WHITE_CHANNEL_COUNT} värvi (punane, roheline, sinine). Mitu neist neeldub õunas?`,
        hints: ["Üks tuleb tagasi, ülejäänud jäävad sisse."],
        tolerance: EXACT_TOLERANCE,
        answer: APPLE_ABSORBED,
      },
      {
        kind: "text",
        id: "exit-3",
        prompt:
          "Sõber ütleb: „Poes paistis see jope tumesinine, aga õues on ta must.\" Selgita, kuidas see võimalik on ja mida sa soovitaksid tal järgmine kord poes teha.",
        minWords: 10,
      },
    ],
  },
];

/**
 * Kordamiskaardid (docs/MOODULILEPING.md „activities.ts – kordamiskaardid",
 * sisu/MOODUL-esemete-varvus.md „Kordamiskaardid").
 */
const reviewCards: ReviewCard[] = [
  {
    id: "rc-1",
    type: "concept",
    question: "Mis juhtub valgusega, kui ta langeb läbipaistmatule esemele?",
    answer:
      "Osa peegeldub tagasi, ülejäänu neeldub ehk läheb esemesse ja muutub soojuseks – kolmandat teed ei ole.",
  },
  {
    id: "rc-2",
    type: "concept",
    question: "Miks on üks ese valge ja teine must?",
    answer:
      "Valge peegeldab tagasi kõik värvid, must ei peegelda peaaegu midagi ja neelab peaaegu kõik.",
  },
  {
    id: "rc-3",
    type: "explain",
    question: `Miks paistab punane õun rohelises valguses ${APPLE_IN_GREEN}?`,
    answer: `Õun oskab tagasi saata ainult punast, aga punast valgust talle ei lange. Rohelise ta neelab, seega silma ei jõua midagi ja ta paistab ${APPLE_IN_GREEN}.`,
  },
  {
    id: "rc-4",
    type: "calc",
    question: `Valges valguses on ${WHITE_CHANNEL_COUNT} värvi. Sinine kruus peegeldab neist ${MUG_REFLECTED}. Mitu neeldub?`,
    answer: `${MUG_ABSORBED} (${WHITE_CHANNEL_COUNT} − ${MUG_REFLECTED}); see, mis ei peegeldunud, neeldub ja soojendab kruusi.`,
  },
  {
    id: "rc-5",
    type: "transfer",
    question:
      "Miks värvitakse kuumas kliimas majad valgeks ja miks on must särk päikese käes palav?",
    answer:
      "Valge pind peegeldab valguse tagasi ega neela seda soojuseks; must pind neelab peaaegu kogu langeva valguse ja soojeneb.",
  },
];

export const activities = defineActivities({ steps, reviewCards });
