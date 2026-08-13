import { defineActivities } from "../../../engine/contract";
import type { ReviewCard, Step } from "../../../engine/contract";
import { formatNumber } from "../../../lib/format";
import {
  SLIDERS,
  centimetresFromMetres,
  focalLength,
  metresFromCentimetres,
  reflectParallelRay,
} from "./model";

/**
 * Sammud ja kordamiskaardid (docs/MOODULILEPING.md,
 * sisu/MOODUL-noguspeegel.md).
 *
 * **Ükski fookuse kaugus ei ole siia käsitsi kirjutatud** – kõik tulevad
 * `model.ts`-i valemist f = R/2 (CLAUDE.md reegel 1). Nii ei saa ülesande
 * vastus ja simulatsiooni näit kunagi lahku minna. Testis
 * (tests/noguspeegel.model.test.ts) võrreldakse neid arve SPETSIFIKATSIOONI
 * tabeliga, mitte activities.ts iseendaga.
 *
 * **Ühikud.** Mudel arvutab meetrites, õpilane räägib sentimeetrites (cm on
 * 8. klassile õige ühik). Ühik muutub AINULT `metresFromCentimetres` ja
 * `centimetresFromMetres` sees – siin failis on nad koos ühes funktsioonis
 * `focusCm`, et ükski küsimus ei saaks teisendust vahele jätta.
 *
 * **Piirid, mida see moodul EI ületa** (sisu/MOODUL-noguspeegel.md „Piirid"):
 * kujutisi nõguspeeglis siin ei konstrueerita (see on P2 läätsede juures) ega
 * kasutata sõna „fookuskaugus" (P2 põhimõiste – vt manifest.ts). Ülesanded
 * küsivad ainult paralleelset valgusvihku ja fookuse kaugust.
 */

/**
 * Fookuse kaugus sentimeetrites: mudeli valem koos mõlema teisendusega.
 *
 * Ainus koht selles failis, kus fookuse kaugus tekib. Iga ülesande arv käib
 * siit läbi – ka siis, kui vastus on „ilus" täisarv.
 */
function focusCm(radiusCm: number): number {
  return centimetresFromMetres(focalLength(metresFromCentimetres(radiusCm)));
}

/**
 * Sama arv ekraanile.
 *
 * Ujukoma jääk ei tohi õpilase teksti sattuda: `focusCm(160)` annab
 * 80,00000000000001 ja liitmisel lause sisse paistaks see täpselt nii.
 * Vastuse VÄÄRTUS jääb ümardamata – checker võrdleb ise tolerantsiga.
 */
const cm = (value: number): string => formatNumber(value);

// --- Ülesannete seisud ja nende vastused (vastused mudelist) ---------------

/** Simulatsiooni algseis (SLIDERS.radiusCm algväärtus, explore-1). */
const START_RADIUS_CM = 100;
const START_FOCUS_CM = focusCm(START_RADIUS_CM);

/** Lamedam peegel (explore-2) – ühtlasi ennustuse (samm 3) vastus. */
const FLAT_RADIUS_CM = 160;
const FLAT_FOCUS_CM = focusCm(FLAT_RADIUS_CM);

/** Teooria näide: mida lamedam peegel, seda kaugemal fookus. */
const THEORY_RADIUS_CM = 80;
const THEORY_FOCUS_CM = focusCm(THEORY_RADIUS_CM);

/** Lahendatud näidis (practice `worked`). */
const WORKED_RADIUS_CM = 60;
const WORKED_FOCUS_CM = focusCm(WORKED_RADIUS_CM);

/** Osaline ülesanne: tehe on ees, vastus tuleb ise (practice-1). */
const GAP_RADIUS_CM = 90;
const GAP_FOCUS_CM = focusCm(GAP_RADIUS_CM);

/**
 * Pöördülesanne (practice-2): fookus on teada, küsitakse raadiust.
 *
 * Mudelil pöördfunktsiooni EI ole – R = 2f on sama valem tagurpidi ja teine
 * arvutus võiks ühel päeval esimesest lahku minna (sama põhjendus, mis hoiab
 * peegeldumisnurga ja langemisnurga ühe arvu küljes). Seepärast on raadius
 * siin KIRJAS ja fookus tuletatakse temast mudeliga: kui valem muutub, muutub
 * küsimuse tekst, mitte vastus. Kooskõla valvab test.
 */
const TORCH_RADIUS_CM = 4;
const TORCH_FOCUS_CM = focusCm(TORCH_RADIUS_CM);

/** Väljumispilet (exit-2). */
const EXIT_RADIUS_CM = 24;
const EXIT_FOCUS_CM = focusCm(EXIT_RADIUS_CM);

/** Kordamiskaart rc-3. */
const CARD_RADIUS_CM = 70;
const CARD_FOCUS_CM = focusCm(CARD_RADIUS_CM);

/** Valitud kiire kõrgus, mille juures explore-3 nurki loetakse. */
const RAY_HEIGHT_CM = SLIDERS.rayHeightCm.max;

/**
 * Langemis- ja peegeldumisnurk explore-3 seisus.
 *
 * Vastus on VALIK („täpselt sama suur"), mitte arv – see arv läheb ainult
 * õige variandi selgitusse. Mõlemad nurgad tulevad ühest mudelikutsest, seega
 * ei saa selgitus väita võrdsust, mida mudel ei anna.
 */
const SELECTED_RAY = reflectParallelRay(
  metresFromCentimetres(START_RADIUS_CM),
  metresFromCentimetres(RAY_HEIGHT_CM),
);

/**
 * Lugemistolerants, MITTE mõõtemääramatus: simulatsioon on ideaalne, aga
 * õpilane loeb mõõdujoont ja tipib käsitsi. 2 cm lubab lugemisvea, aga ei lase
 * naaberväärtust õigeks: liuguri samm on 10 cm ja fookus liigub 5 cm kaupa
 * (sisu/MOODUL-noguspeegel.md „explore").
 */
const READING_TOLERANCE = { mode: "absolute", value: 2 } as const;

/**
 * Arvutatud vastus: spetsifikatsioonis seisab tolerants 0, aga moodulileping
 * nõuab positiivset arvu. ±0,5 cm tähendab täpselt sama asja – täisarv kõrvalt
 * (44 või 46) läheb valeks.
 */
const EXACT_TOLERANCE = { mode: "absolute", value: 0.5 } as const;

const steps: Step[] = [
  {
    type: "hook",
    id: "hook-1",
    // Joonis näitab ainult seda, ET peegeldiga tuleb kitsas kiir. MIKS, seda
    // ütlevad teooria ja simulatsioon – hook ei tohi vastust ette öelda.
    figure: "np-taskulamp",
    title: "Kust tuleb taskulambi kitsas kiir?",
    body: [
      "Taskulambi pirn saadab valgust igasse suunda – ka tahapoole ja külgedele. Paljas pirn valgustab toa ühtlaselt ära, aga kaugele tema valgus ei ulatu.",
      "Taskulamp teeb samast pirnist kitsa kiire, mis ulatub kümneid meetreid kaugele – üle poole jalgpalliväljaku. Pirni taga on läikiv nõgus peegeldi.",
      "Kuidas see peegeldi kitsa kiire tekitab? Täna saad teada, kuhu nõguspeegel paralleelse valguse koondab ja kui kaugel see punkt peeglist on.",
    ],
  },
  {
    type: "theory",
    id: "theory-1",
    title: "Kõverpeegel ja fookus",
    body: [
      "Kõverpeegli pind ei ole tasane. Kumer- ja nõguspeeglit võib vaadelda läikiva kera ühe tükina. NÕGUSPEEGLIL on läikiv pind kera SEEST poolt – nagu lusika süvend. Kumerpeeglil on ta väljast poolt. Neid kahte koos nimetatakse kõverpeegliteks; kumerpeegel tuleb järgmises moodulis.",
      "Peegeldumisseadus kehtib ka siin – muutub ainult ristsirge. Tasapeegli puhul oli ristsirge kõikjal ühesuguse sihiga. Kerapinnal on ristsirge iga punkti oma RAADIUSE siht ehk joon kera keskpunkti poole. Kui see joon on olemas, käib kõik nagu enne: langemisnurk = peegeldumisnurk. Iga väikest tükki kõverast peeglist võib vaadelda kui pisikest tasapeeglit.",
      "Peateljega paralleelne valgusvihk peegeldub nõguspeeglilt nii, et kõik kiired lõikuvad peegli ees ühes punktis. Seda punkti nimetatakse peegli FOOKUSEKS.",
      `Fookuse kaugus peeglist on pool kera raadiusest. Kui peegel on välja lõigatud ${cm(THEORY_RADIUS_CM)} cm raadiusega kerast, on fookus peeglist ${cm(THEORY_FOCUS_CM)} cm kaugusel. Mida lamedam peegel (suurem raadius), seda kaugemal on fookus.`,
      "Valgus võib sama teed käia mõlemat pidi. Kui panna väike lamp täpselt fookusesse, väljub peeglilt paralleelne kimp – täpselt see, mis taskulambis toimub.",
    ],
    figure: "np-ristsirge",
  },
  {
    type: "predict",
    id: "predict-1",
    title: "Paku oma ennustus",
    body: [
      "Kaks nõguspeeglit on ühesuuruse pinnaga, aga üks on välja lõigatud väiksemast kerast (sügavam peegel) ja teine suuremast (lamedam peegel).",
    ],
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt: "Kummal peeglil on fookus peeglile lähemal?",
        options: [
          {
            id: "sugavam",
            text: "Sügavamal peeglil – sellel, mis on lõigatud väiksemast kerast",
            correct: true,
          },
          {
            id: "lamedam",
            text: "Lamedamal peeglil – sellel, mis on lõigatud suuremast kerast",
            correct: false,
            misconception: "lamedam-koondab-lahemale",
          },
          {
            id: "uhekaugusel",
            text: "Mõlemal ühekaugusel – fookus sõltub ainult peegli suurusest",
            correct: false,
            misconception: "fookus-soltub-peegli-suurusest",
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
    title: "Uuri nõguspeegliga",
    body: [
      "Vasakul on nõguspeegel külgvaates ja katkendlik joon on peatelg. Paremalt tuleb neli peateljega paralleelset kiirt; nooleotsad näitavad, kummale poole valgus liigub.",
      "Valitud kiir on paksu joonega. Tema kohtumispunktist läheb katkendlik joon kera keskpunkti – see on selle punkti ristsirge. Nurgakaarte juures on kirjas langemisnurk ja peegeldumisnurk.",
      "Liuguritega saad muuta kera raadiust ja valitud kiire kõrgust. Mõõdujoon näitab, kui kaugel peegli tipust kiired koonduvad.",
    ],
    questions: [
      {
        kind: "numeric",
        id: "explore-1",
        prompt: `Jäta raadiuseks ${cm(START_RADIUS_CM)} cm. Kui kaugel peeglist kiired koonduvad?`,
        hints: [
          "Vaata mõõdujoont koondumispunkti juures.",
          "See punkt on fookus – mõõdujoon algab peegli tipust.",
        ],
        unit: "cm",
        tolerance: READING_TOLERANCE,
        answer: START_FOCUS_CM,
      },
      {
        kind: "numeric",
        id: "explore-2",
        prompt: `Sea raadiuseks ${cm(FLAT_RADIUS_CM)} cm. Kui kaugel on fookus nüüd?`,
        hints: [
          "Võrdle raadiuse arvuga – mitu korda väiksem see on?",
        ],
        unit: "cm",
        tolerance: READING_TOLERANCE,
        answer: FLAT_FOCUS_CM,
      },
      {
        kind: "choice",
        id: "explore-3",
        // Raadius öeldakse siin UUESTI: eelmine ülesanne jättis liuguri 160 cm
        // peale ja õige variandi juures olev nurk kehtib ainult
        // START_RADIUS_CM juures. Ilma selle lauseta loeks õpilane ekraanilt
        // ühe nurga ja vastusevariandist teise (CodeRabbiti leid sammust
        // 4.1nn, kus sama viga parandati moodulis kumerpeegel).
        prompt: `Sea raadiuseks ${cm(START_RADIUS_CM)} cm tagasi ja kiire kõrguseks ${cm(RAY_HEIGHT_CM)} cm, siis loe langemisnurk. Kui suur on peegeldumisnurk?`,
        options: [
          {
            id: "null",
            text: "Null – kõveralt pinnalt peegeldub kiir tagasi sama teed",
            correct: false,
            misconception: "koveral-seadus-ei-kehti",
          },
          {
            id: "sama",
            // Nurga arv tuleb mudelist, mitte peast: sama arv on ka ekraanil.
            text: `Täpselt sama suur (${formatNumber(SELECTED_RAY.reflectionDeg, 1)}°) – kõveral peeglil kehtib täpselt sama peegeldumisseadus mis tasapeeglil, ainult ristsirge tuleb kera keskpunktist`,
            correct: true,
          },
          {
            id: "kaks-korda",
            text: "Kaks korda suurem kui langemisnurk",
            correct: false,
            misconception: "koveral-seadus-ei-kehti",
          },
        ],
      },
      {
        kind: "choice",
        id: "explore-4",
        prompt:
          "Lülita valguse suund ümber: lamp on fookuses. Milline kimp peeglilt väljub?",
        hints: ["Joonis ei muutu – muutub ainult see, kummale poole nooled näitavad."],
        options: [
          {
            id: "paralleelne",
            text: "Paralleelne – kiired lähevad kõrvuti kaugusesse. Valgus võib sama teed käia mõlemat pidi, ja just nii teeb taskulamp pirnist kitsa kiire: pirn on peegeldi fookuses",
            correct: true,
          },
          {
            id: "koondub",
            text: "Kimp koondub peegli ees uuesti kokku",
            correct: false,
          },
          {
            id: "laiali",
            text: "Kimp valgub laiali igasse suunda, nagu paljas pirn",
            correct: false,
          },
        ],
      },
    ],
    simulation: {
      // Suunalüliti avaneb alles pärast kolmandat ülesannet: enne seda on
      // korraga muudetavaid suurusi kaks (raadius ja kiire kõrgus), mitte kolm
      // (moodulileping: „alguses nähtaval max 2 muudetavat suurust").
      unlocks: [{ feature: "suuna-lyliti", afterQuestion: "explore-3" }],
    },
  },
  {
    type: "practice",
    id: "practice-1",
    title: "Proovi ise järele",
    // Näidis on LAHENDATUD ülesanne, mitte küsimus (docs/MOODULILEPING.md).
    worked: {
      prompt: `Nõguspeegel on välja lõigatud kerast raadiusega ${cm(WORKED_RADIUS_CM)} cm. Kus on fookus?`,
      solution: [
        "Fookus on peegli ees peateljel, poole kera raadiuse kaugusel peegli tipust.",
        `Seega ${cm(WORKED_RADIUS_CM)} cm : 2 = ${cm(WORKED_FOCUS_CM)} cm.`,
      ],
      answer: `Fookus on peegli tipust ${cm(WORKED_FOCUS_CM)} cm kaugusel, peegli EES peateljel. Sinna koondub peateljega paralleelne valgusvihk.`,
    },
    questions: [
      {
        // Osaline: tehe on ees, vastus tuleb ise.
        kind: "numeric",
        id: "practice-1",
        prompt: `Peegli kera raadius on ${cm(GAP_RADIUS_CM)} cm. Fookus on ${cm(GAP_RADIUS_CM)} : 2 = ___ cm kaugusel.`,
        hints: ["Pool raadiusest."],
        unit: "cm",
        tolerance: EXACT_TOLERANCE,
        answer: GAP_FOCUS_CM,
      },
      {
        // Iseseisev, pöördülesanne: fookus on teada, raadius otsitav.
        kind: "numeric",
        id: "practice-2",
        prompt: `Taskulambi peegeldi fookus on ${cm(TORCH_FOCUS_CM)} cm kaugusel – just sinna on pandud pirn. Kui suur on peegeldi kera raadius?`,
        hints: [
          "Fookus on pool raadiusest – mis on siis raadius?",
          `${cm(TORCH_FOCUS_CM)} cm on pool millest?`,
        ],
        unit: "cm",
        tolerance: EXACT_TOLERANCE,
        answer: TORCH_RADIUS_CM,
      },
      {
        // Iseseisev, joonise lugemine.
        kind: "choice",
        id: "practice-3",
        figure: "np-kolm-kiirt",
        prompt:
          "Vaata joonist: kolm peateljega paralleelset kiirt peegelduvad nõguspeeglilt. Peateljele on märgitud kolm punkti. Milline punkt on peegli fookus?",
        hints: ["Fookus on seal, kus kiired kokku saavad."],
        // Punktid A, B ja C on joonisel peateljel kindlas järjekorras – nende
        // segamine ekraanil lahutaks vastusevariandid joonisest.
        shuffle: false,
        options: [
          { id: "a", text: "Punkt A – peegli tipu lähedal", correct: false },
          {
            id: "b",
            text: "Punkt B – seal, kus peegeldunud kiired lõikuvad",
            correct: true,
          },
          { id: "c", text: "Punkt C – kaugel peegli ees", correct: false },
        ],
      },
      {
        // Ülekanne, mitu õiget: auto esitule peegeldi.
        kind: "choice",
        id: "practice-4",
        prompt:
          "Auto esitules on pirni taga läikiv nõgus peegeldi. Millised väited on õiged?",
        multiple: true,
        shuffle: true,
        options: [
          {
            id: "pirn-fookuses",
            text: "Pirn asub peegeldi fookuses",
            correct: true,
          },
          {
            id: "paralleelne-vihk",
            text: "Peegeldilt väljub peaaegu paralleelne valgusvihk",
            correct: true,
          },
          {
            id: "ilma-peegeldita",
            text: "Ilma peegeldita valguks pirni valgus igasse suunda laiali",
            correct: true,
          },
          {
            id: "teeb-valgust",
            text: "Peegeldi tekitab juurde valgust, mida pirnist ei tulnud",
            correct: false,
            misconception: "peegel-teeb-valgust-juurde",
          },
          {
            id: "ainult-tugev-pirn",
            text: "Peegeldi töötab ainult siis, kui pirn on väga tugev",
            correct: false,
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
        prompt: "Mis on nõguspeegli fookus?",
        options: [
          {
            id: "sugavaim-koht",
            text: "Peegli kõige sügavam koht",
            correct: false,
            misconception: "fookus-on-peegli-peal",
          },
          {
            id: "koondumispunkt",
            text: "Punkt peegli ees, kuhu koondub peateljega paralleelne valgusvihk",
            correct: true,
          },
          {
            id: "kera-keskpunkt",
            text: "Peegli kera keskpunkt",
            correct: false,
            misconception: "fookus-on-kera-keskpunkt",
          },
        ],
      },
      {
        kind: "numeric",
        id: "exit-2",
        prompt: `Nõguspeegel on lõigatud kerast raadiusega ${cm(EXIT_RADIUS_CM)} cm. Kui kaugel peeglist on fookus?`,
        hints: ["Pool raadiusest."],
        unit: "cm",
        tolerance: EXACT_TOLERANCE,
        answer: EXIT_FOCUS_CM,
      },
      {
        kind: "text",
        id: "exit-3",
        prompt:
          "Sõber ütleb: „Kõveral peeglil peegeldumisseadus ei kehti – seal peegelduvad kiired ju igasse suunda laiali.\" Mida sa talle vastad?",
        minWords: 10,
      },
    ],
  },
];

/**
 * Kordamiskaardid (docs/MOODULILEPING.md „activities.ts – kordamiskaardid",
 * sisu/MOODUL-noguspeegel.md „Kordamiskaardid").
 */
const reviewCards: ReviewCard[] = [
  {
    id: "rc-1",
    type: "concept",
    question: "Mis on nõguspeegel?",
    answer:
      "Kõverpeegel, mille läikiv pind on kera seest poolt (nagu lusika süvend). Peateljega paralleelse valgusvihu ta koondab.",
  },
  {
    id: "rc-2",
    type: "concept",
    question: "Mis on peegli fookus?",
    answer:
      "Punkt peegli ees peateljel, kuhu koonduvad peateljega paralleelsed kiired pärast peegeldumist.",
  },
  {
    id: "rc-3",
    type: "calc",
    question: `Nõguspeegel on lõigatud kerast raadiusega ${cm(CARD_RADIUS_CM)} cm. Kui kaugel on fookus?`,
    answer: `${cm(CARD_FOCUS_CM)} cm – pool raadiusest.`,
  },
  {
    id: "rc-4",
    type: "explain",
    question: "Kas kõveral peeglil kehtib peegeldumisseadus?",
    answer:
      "Jah, igas punktis täpselt samamoodi: langemisnurk = peegeldumisnurk. Erinevus on ainult selles, et ristsirge on igas punktis raadiuse siht, seega eri punktides eri suunas.",
  },
  {
    id: "rc-5",
    type: "transfer",
    question:
      "Miks ulatub taskulambi kiir kaugele, kuigi pirn valgustab igasse suunda?",
    answer:
      "Pirn on nõgusa peegeldi fookuses. Fookusest välja läinud valgus peegeldub paralleelseks kimbuks – valgus ei lähe laiali, vaid liigub kõrvuti ühes suunas. Valgust juurde peegel ei tee.",
  },
];

export const activities = defineActivities({ steps, reviewCards });
