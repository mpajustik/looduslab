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
 * sisu/MOODUL-kumerpeegel.md).
 *
 * **Ükski näilise fookuse kaugus ei ole siia käsitsi kirjutatud** – kõik
 * tulevad `model.ts`-i valemist f = R/2 (CLAUDE.md reegel 1). Nii ei saa
 * ülesande vastus ja simulatsiooni näit kunagi lahku minna. Testis
 * (tests/kumerpeegel.model.test.ts) võrreldakse neid arve SPETSIFIKATSIOONI
 * tabeliga, mitte activities.ts iseendaga.
 *
 * **Ühikud.** Mudel arvutab meetrites, õpilane räägib sentimeetrites (cm on
 * 8. klassile õige ühik). Ühik muutub AINULT `metresFromCentimetres` ja
 * `centimetresFromMetres` sees – siin failis on nad koos ühes funktsioonis
 * `focusCm`, et ükski küsimus ei saaks teisendust vahele jätta.
 *
 * **Sõna, mida see fail kordab meelega:** näiline fookus on koht, kus lõikuvad
 * ainult PIKENDUSED. Iga kord, kui teda nimetatakse, käib kaasa „peegli taga"
 * või „pikendused" – muidu jääb temast nõguspeegli päris fookuse koopia.
 *
 * **Piirid, mida see moodul EI ületa** (sisu/MOODUL-kumerpeegel.md „Piirid"):
 * siin ei konstrueerita midagi, mis peeglis paistab (see on P2 läätsede juures)
 * ega kasutata sõna „fookuskaugus" (P2 põhimõiste – vt manifest.ts).
 * Rakendused (auto külgpeegel, liikluspeegel) käivad eraldi mooduli alla:
 * poe peegel on siin ainult häälestav probleem ja üks ülekandeülesanne.
 */

/**
 * Näilise fookuse kaugus sentimeetrites: mudeli valem koos mõlema teisendusega.
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

/** Lamedam peegel (explore-2) – tema ümber käib väärarusaam `lamedam-hajutab-rohkem`. */
const FLAT_RADIUS_CM = 160;
const FLAT_FOCUS_CM = focusCm(FLAT_RADIUS_CM);

/** Teooria näide: mida lamedam peegel, seda kaugemal näiline fookus. */
const THEORY_RADIUS_CM = 80;
const THEORY_FOCUS_CM = focusCm(THEORY_RADIUS_CM);

/** Lahendatud näidis (practice `worked`). */
const WORKED_RADIUS_CM = 60;
const WORKED_FOCUS_CM = focusCm(WORKED_RADIUS_CM);

/** Osaline ülesanne: tehe on ees, vastus tuleb ise (practice-1). */
const GAP_RADIUS_CM = 90;
const GAP_FOCUS_CM = focusCm(GAP_RADIUS_CM);

/**
 * Pöördülesanne (practice-2): näiline fookus on teada, küsitakse raadiust.
 *
 * Mudelil pöördfunktsiooni EI ole – R = 2f on sama valem tagurpidi ja teine
 * arvutus võiks ühel päeval esimesest lahku minna (sama põhjendus, mis hoiab
 * peegeldumisnurga ja langemisnurga ühe arvu küljes). Seepärast on jõulukuuli
 * raadius siin KIRJAS ja näiline fookus tuletatakse temast mudeliga: kui valem
 * muutub, muutub küsimuse tekst, mitte vastus. Kooskõla valvab test.
 */
const BAUBLE_RADIUS_CM = 5;
const BAUBLE_FOCUS_CM = focusCm(BAUBLE_RADIUS_CM);

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
 * Vastus on VALIK („täpselt sama suur"), mitte arv – see arv läheb ainult õige
 * variandi selgitusse. Mõlemad nurgad tulevad ühest mudelikutsest, seega ei saa
 * selgitus väita võrdsust, mida mudel ei anna.
 */
const SELECTED_RAY = reflectParallelRay(
  metresFromCentimetres(START_RADIUS_CM),
  metresFromCentimetres(RAY_HEIGHT_CM),
);

/**
 * Lugemistolerants, MITTE mõõtemääramatus: simulatsioon on ideaalne, aga
 * õpilane loeb mõõdujoont ja tipib käsitsi. 2 cm lubab lugemisvea, aga ei lase
 * naaberväärtust õigeks: liuguri samm on 10 cm ja näiline fookus liigub 5 cm
 * kaupa (sisu/MOODUL-kumerpeegel.md „explore").
 */
const READING_TOLERANCE = { mode: "absolute", value: 2 } as const;

/**
 * Arvutatud vastus: spetsifikatsioonis seisab tolerants 0,5 cm ehk täisarv
 * kõrvalt (44 või 46) läheb valeks.
 */
const EXACT_TOLERANCE = { mode: "absolute", value: 0.5 } as const;

const steps: Step[] = [
  {
    type: "hook",
    id: "hook-1",
    // Joonis näitab ainult seda, ET ümar peegel näeb laiemat ala. MIKS, seda
    // ütlevad teooria ja simulatsioon – hook ei tohi vastust ette öelda.
    figure: "kp-turvapeegel",
    title: "Miks on poe laes ümar peegel?",
    body: [
      "Poe laes vahekäigu kohal on ümar läikiv peegel. Müüja näeb selles korraga tervet vahekäiku: mõlemat otsa, kõiki riiuleid ja kõiki inimesi.",
      "Seina peal on samas poes ka tasaseid peegleid. Sama suur tasane peegel näitaks vahekäigust ainult kitsast riba – ühe riiuli.",
      "Miks ei piisa sama suurest tasasest peeglist? Täna saad teada, mis juhtub valgusega kumerpeeglil ja kus on tema näiline fookus.",
    ],
  },
  {
    type: "theory",
    id: "theory-1",
    title: "Kumerpeegel ja näiline fookus",
    body: [
      "Kõverpeegleid on kahte sorti ja mõlemat võib vaadelda läikiva kera ühe tükina. NÕGUSPEEGLIL (eelmine moodul) on läikiv pind kera SEEST poolt. KUMERPEEGLIL on ta VÄLJAST poolt – nagu lusika tagakülg või jõulukuul. Kumerpeegli kera keskpunkt jääb peegli TAHA.",
      "Peegeldumisseadus kehtib ka siin – muutub ainult ristsirge. Kerapinnal on ristsirge iga punkti oma RAADIUSE siht ehk joon kera keskpunkti poole; kumerpeeglil läheb see joon peegli taha. Kui see joon on olemas, käib kõik nagu enne: langemisnurk = peegeldumisnurk. Iga väikest tükki kõverast peeglist võib vaadelda kui pisikest tasapeeglit.",
      "Peateljega paralleelne valgusvihk peegeldub kumerpeeglilt nii, et kiired lähevad üksteisest eemale. Peegli ees ei koondu nad kunagi ühte punkti – kumerpeegel on HAJUTAV peegel.",
      "Kui peegeldunud kiired tagurpidi pikendada (katkendliku joonega, peegli taha), lõikuvad kõik pikendused ühes punktis. Seda punkti nimetatakse NÄILISEKS FOOKUSEKS. Näiline ta on sellepärast, et seal ei ole ühtegi valguskiirt: valgus läks peeglilt hoopis laiali. Sinna pandud paber ei süttiks kunagi.",
      `Näiline fookus on peegli taga poole kera raadiuse kaugusel. Kui peegel on välja lõigatud ${cm(THEORY_RADIUS_CM)} cm raadiusega kerast, on näiline fookus peegli taga ${cm(THEORY_FOCUS_CM)} cm kaugusel. Mida lamedam peegel (suurem raadius), seda kaugemal ta on ja seda vähem peegel hajutab.`,
      "Sellepärast on kumerpeegli vaateväli lai: peeglisse jõuab valgust palju laiemast alast kui sama suurde tasapeeglisse ja kõik see mahub peeglisse korraga ära. Hinnaks on see, et esemed paistavad väiksemad – peeglis on ju rohkem asju sama pinna peal.",
    ],
    figure: "kp-ristsirge",
  },
  {
    type: "predict",
    id: "predict-1",
    title: "Paku oma ennustus",
    body: [
      "Kumerpeegli poole saadetakse peateljega paralleelne valgusvihk – täpselt samasugune kimp, mis nõguspeeglil koondus fookusesse.",
    ],
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt: "Mis peegeldunud kiirtest saab?",
        options: [
          {
            id: "koonduvad",
            text: "Nad koonduvad peegli ees ühte punkti, nagu nõguspeeglil",
            correct: false,
            misconception: "koverpeegel-alati-koondab",
          },
          {
            id: "hajuvad",
            text: "Nad hajuvad laiali; ühte punkti lõikuvad ainult nende pikendused peegli taga",
            correct: true,
          },
          {
            id: "tagasi",
            text: "Nad tulevad täpselt sama teed tagasi, kust tulid",
            correct: false,
            misconception: "kumer-peegeldab-tagasi",
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
    title: "Uuri kumerpeegliga",
    body: [
      "Vasakul on kumerpeegel külgvaates: tipp kummub valguse poole ja katkendlik joon on peatelg. Peeglist vasakule jääb peegli tagune ala – sinna ei jõua ükski valguskiir.",
      "Paremalt tuleb neli peateljega paralleelset kiirt; nooleotsad näitavad, kummale poole valgus liigub. Valitud kiir on paksu joonega. Tema kohtumispunktist läheb katkendlik joon läbi peegli kera keskpunkti – see on selle punkti ristsirge. Nurgakaarte juures on kirjas langemis- ja peegeldumisnurk.",
      "Liuguritega saad muuta kera raadiust ja valitud kiire kõrgust. Mõõdujoon peegli taga näitab, kui kaugel tipust on näiline fookus.",
    ],
    questions: [
      {
        kind: "numeric",
        id: "explore-1",
        prompt: `Jäta raadiuseks ${cm(START_RADIUS_CM)} cm. Kui kaugel peegli taga on näiline fookus?`,
        hints: [
          "Vaata mõõdujoont peegli taga.",
          "Võrdle raadiuse arvuga – mitu korda väiksem see on?",
        ],
        unit: "cm",
        tolerance: READING_TOLERANCE,
        answer: START_FOCUS_CM,
      },
      {
        kind: "numeric",
        id: "explore-2",
        prompt: `Sea raadiuseks ${cm(FLAT_RADIUS_CM)} cm. Kui kaugel peegli taga on näiline fookus nüüd?`,
        hints: ["Mitu korda väiksem on see raadiusest?"],
        unit: "cm",
        tolerance: READING_TOLERANCE,
        answer: FLAT_FOCUS_CM,
      },
      {
        kind: "choice",
        id: "explore-3",
        // Raadius öeldakse siin UUESTI: eelmine ülesanne jättis liuguri 160 cm
        // peale ja õige variandi juures olev nurk kehtib ainult
        // START_RADIUS_CM juures. Ilma selle lauseta näeks õpilane ekraanil
        // 3,6° ja loeks vastusevariandist 5,7° (CodeRabbiti leid, samm 4.1nn).
        prompt: `Sea raadiuseks ${cm(START_RADIUS_CM)} cm tagasi ja kiire kõrguseks ${cm(RAY_HEIGHT_CM)} cm, siis loe langemisnurk. Kui suur on peegeldumisnurk?`,
        options: [
          {
            id: "null",
            text: "Null – kumeralt pinnalt tuleb kiir tagasi sama teed",
            correct: false,
            misconception: "kumer-peegeldab-tagasi",
          },
          {
            id: "sama",
            // Nurga arv tuleb mudelist, mitte peast: sama arv on ka ekraanil.
            text: `Täpselt sama suur (${formatNumber(SELECTED_RAY.reflectionDeg, 1)}°) – kumeral peeglil kehtib täpselt sama peegeldumisseadus mis tasapeeglil, ainult ristsirge tuleb kera keskpunktist, mis on siin peegli taga`,
            correct: true,
          },
          {
            id: "kaks-korda",
            text: "Kaks korda suurem kui langemisnurk",
            correct: false,
            misconception: "kumeral-seadus-ei-kehti",
          },
        ],
      },
      {
        kind: "choice",
        id: "explore-4",
        prompt:
          "Lülita pikendused sisse. Kus peegeldunud kiired päriselt kokku saavad?",
        hints: ["Vaata, kummal pool peeglit on nooleotsad."],
        options: [
          {
            id: "nailises-fookuses",
            text: "Näilises fookuses peegli taga",
            correct: false,
            misconception: "nailine-fookus-on-paris-fookus",
          },
          {
            id: "mitte-kusagil",
            text: "Mitte kusagil – peegli ees nad hajuvad ja peegli taha ei jõua ükski kiir. Näilises fookuses lõikuvad ainult katkendlikud pikendused; valgust seal ei ole, sellepärast ongi ta NÄILINE",
            correct: true,
          },
          {
            id: "peegli-pinnal",
            text: "Peegli pinnal, seal kus nad peeglit puudutavad",
            correct: false,
          },
        ],
      },
    ],
    simulation: {
      // Pikenduste lüliti avaneb alles pärast kolmandat ülesannet. Kaks
      // põhjust: korraga muudetavaid suurusi jääb kaks, mitte kolm
      // (moodulileping), ja – mis tähtsam – näiline fookus tuleb ekraanile
      // alles siis, kui õpilane on juba näinud, et valgus sinna ei lähe.
      unlocks: [{ feature: "pikenduste-lyliti", afterQuestion: "explore-3" }],
    },
  },
  {
    type: "practice",
    id: "practice-1",
    title: "Proovi ise järele",
    // Näidis on LAHENDATUD ülesanne, mitte küsimus (docs/MOODULILEPING.md).
    worked: {
      prompt: `Kumerpeegel on välja lõigatud kerast raadiusega ${cm(WORKED_RADIUS_CM)} cm. Kus on tema näiline fookus?`,
      solution: [
        "Näiline fookus on peegli TAGA peateljel, poole kera raadiuse kaugusel peegli tipust.",
        `Seega ${cm(WORKED_RADIUS_CM)} cm : 2 = ${cm(WORKED_FOCUS_CM)} cm.`,
      ],
      answer: `Näiline fookus on peegli tipust ${cm(WORKED_FOCUS_CM)} cm kaugusel, peegli TAGA peateljel. Sinna lõikuvad peegeldunud kiirte pikendused – mitte kiired ise.`,
    },
    questions: [
      {
        // Osaline: tehe on ees, vastus tuleb ise.
        kind: "numeric",
        id: "practice-1",
        prompt: `Peegli kera raadius on ${cm(GAP_RADIUS_CM)} cm. Näiline fookus on peegli taga ${cm(GAP_RADIUS_CM)} : 2 = ___ cm kaugusel.`,
        hints: ["Pool raadiusest."],
        unit: "cm",
        tolerance: EXACT_TOLERANCE,
        answer: GAP_FOCUS_CM,
      },
      {
        // Iseseisev, pöördülesanne: näiline fookus on teada, raadius otsitav.
        kind: "numeric",
        id: "practice-2",
        prompt: `Läikiva jõulukuuli näiline fookus on ${cm(BAUBLE_FOCUS_CM)} cm kuuli pinna taga. Kui suur on kuuli raadius?`,
        hints: [
          "Näiline fookus on pool raadiusest – mis on siis raadius?",
          `${cm(BAUBLE_FOCUS_CM)} cm on pool millest?`,
        ],
        unit: "cm",
        tolerance: EXACT_TOLERANCE,
        answer: BAUBLE_RADIUS_CM,
      },
      {
        // Iseseisev, joonise lugemine.
        kind: "choice",
        id: "practice-3",
        figure: "kp-kolm-kiirt",
        prompt:
          "Vaata joonist: kolm peateljega paralleelset kiirt peegelduvad kumerpeeglilt laiali ja nende pikendused on peegli taga katkendliku joonega. Peateljele on märgitud kolm punkti. Milline punkt on peegli näiline fookus?",
        hints: [
          "Fookus on seal, kus jooned kokku saavad – ja kumerpeeglil saavad kokku ainult pikendused.",
        ],
        // Punktid A, B ja C on joonisel peateljel kindlas järjekorras – nende
        // segamine ekraanil lahutaks vastusevariandid joonisest.
        shuffle: false,
        options: [
          {
            id: "a",
            text: "Punkt A – peegli ees, seal kus paralleelsed kiired peeglile jõuavad",
            correct: false,
          },
          {
            id: "b",
            text: "Punkt B – peegli taga, seal kus pikendused lõikuvad",
            correct: true,
          },
          {
            id: "c",
            text: "Punkt C – peegli taga kaugemal, kera keskpunktis",
            correct: false,
            misconception: "fookus-on-kera-keskpunkt",
          },
        ],
      },
      {
        // Ülekanne, mitu õiget: poe turvapeegel.
        kind: "choice",
        id: "practice-4",
        prompt:
          "Poe laes on ümar kumerpeegel. Millised väited on õiged?",
        multiple: true,
        shuffle: true,
        options: [
          {
            id: "hajuvad",
            text: "Peeglilt tulevad kiired hajuvad laiali",
            correct: true,
          },
          {
            id: "laiem-ala",
            text: "Peeglisse mahub korraga laiem ala kui sama suurde tasapeeglisse",
            correct: true,
          },
          {
            id: "paistavad-vaiksemad",
            text: "Peeglis paistavad inimesed väiksemad kui nad on",
            correct: true,
          },
          {
            id: "teeb-vaiksemaks",
            text: "Kumerpeegel teeb esemed päriselt väiksemaks",
            correct: false,
            misconception: "kumer-teeb-esemed-vaiksemaks",
          },
          {
            id: "koondab-taga",
            text: "Peegli taga näilises fookuses on koht, kuhu koondub valgus",
            correct: false,
            misconception: "nailine-fookus-on-paris-fookus",
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
        prompt: "Mis on kumerpeegel?",
        options: [
          {
            id: "seest",
            text: "Peegel, mille läikiv pind on kera seest poolt",
            correct: false,
          },
          {
            id: "valjast",
            text: "Peegel, mille läikiv pind on kera väljast poolt",
            correct: true,
          },
          {
            id: "suurem",
            text: "Peegel, mis on lihtsalt suurem kui tasapeegel",
            correct: false,
          },
        ],
      },
      {
        kind: "numeric",
        id: "exit-2",
        prompt: `Kumerpeegel on lõigatud kerast raadiusega ${cm(EXIT_RADIUS_CM)} cm. Kui kaugel peegli taga on näiline fookus?`,
        hints: ["Pool raadiusest."],
        unit: "cm",
        tolerance: EXACT_TOLERANCE,
        answer: EXIT_FOCUS_CM,
      },
      {
        kind: "text",
        id: "exit-3",
        prompt:
          "Sõber ütleb: „Paneme kumerpeegli näilisesse fookusesse paberi – küll ta seal põlema läheb, fookus on ju fookus.\" Mida sa talle vastad?",
        minWords: 10,
      },
    ],
  },
];

/**
 * Kordamiskaardid (docs/MOODULILEPING.md „activities.ts – kordamiskaardid",
 * sisu/MOODUL-kumerpeegel.md „Kordamiskaardid").
 */
const reviewCards: ReviewCard[] = [
  {
    id: "rc-1",
    type: "concept",
    question: "Mis on kumerpeegel?",
    answer:
      "Kõverpeegel, mille läikiv pind on kera väljast poolt (nagu lusika tagakülg või jõulukuul). Peateljega paralleelse valgusvihu ta hajutab laiali.",
  },
  {
    id: "rc-2",
    type: "concept",
    question: "Mis on kumerpeegli näiline fookus?",
    answer:
      "Punkt peegli taga peateljel, kus lõikuvad peegeldunud kiirte pikendused. Näiline sellepärast, et valgust seal ei ole – peegli taha ei jõua ükski kiir.",
  },
  {
    id: "rc-3",
    type: "calc",
    question: `Kumerpeegel on lõigatud kerast raadiusega ${cm(CARD_RADIUS_CM)} cm. Kui kaugel on näiline fookus?`,
    answer: `${cm(CARD_FOCUS_CM)} cm peegli taga – pool raadiusest.`,
  },
  {
    id: "rc-4",
    type: "explain",
    question: "Kas kõveral peeglil kehtib peegeldumisseadus?",
    answer:
      "Jah, igas punktis täpselt samamoodi: langemisnurk = peegeldumisnurk. Erinevus on ainult selles, et ristsirge on igas punktis raadiuse siht – kumerpeeglil läheb see joon peegli taha kera keskpunkti.",
  },
  {
    id: "rc-5",
    type: "transfer",
    question: "Miks on poe turvapeegel kumer, mitte tasane?",
    answer:
      "Kumer pind hajutab valgust, seega jõuab peeglisse valgust palju laiemast alast ja terve vahekäik mahub korraga ära. Hinnaks on see, et esemed paistavad väiksemad.",
  },
];

export const activities = defineActivities({ steps, reviewCards });
