import { defineActivities } from "../../../engine/contract";
import type { ReviewCard, Step } from "../../../engine/contract";
import { formatNumber } from "../../../lib/format";
import {
  SYNODIC_MONTH_DAYS,
  dayFromPhaseAngle,
  earthShadowHalfAngleDeg,
  EARTH_UMBRA_WIDTH_AT_MOON_KM,
  illuminatedFraction,
  MOON_MEAN_KM,
  phaseAngleFromDay,
  phaseLabel,
  shadowWindowHours,
} from "./model";

/**
 * Sammud ja kordamiskaardid (docs/MOODULILEPING.md,
 * sisu/MOODUL-kuu-faasid.md).
 *
 * Kõik arvulised vastused tulevad MUDELIST, mitte käsitsi kirjutatud arvudest
 * (CLAUDE.md reegel 1) – nii ei saa ülesande vastus ja simulatsiooni näit
 * kunagi lahku minna. `illuminatedFraction` annab murru 0…1; protsendiks
 * (× 100) korrutamine on selle faili töö, mitte mudeli oma (vt model.ts
 * kommentaari) – õpilane loeb ekraanilt just protsenti.
 *
 * **Terminoloogialõks (sisu/MOODUL-kuu-faasid.md „Terminoloogia"):** ükski
 * küsimus siin ei riputu sõna „noorkuu" külge – kasutusel on ainult
 * kirjeldavad nimed (kuuloomine, kasvav sirp, esimene veerand, …).
 */

/** Murd → protsent, ümardatud täisarvuni (õpilane loeb ekraanilt just seda). */
function percent(fraction: number): number {
  return Math.round(fraction * 100);
}

const PERCENT_TOLERANCE = { mode: "absolute", value: 3 } as const;
const COUNT_TOLERANCE = { mode: "absolute", value: 0.5 } as const;
const DAY_TOLERANCE = { mode: "percent", value: 5 } as const;

// --- Ülesannetes kasutatavad arvud (kõik mudelist) --------------------------

/** Predict/explore: kuuloomine (0°) ja mõlemad veerandid (90°, 270°). */
const NEW_MOON_PERCENT = percent(illuminatedFraction(0));
const QUARTER_PERCENT = percent(illuminatedFraction(90));

/** Practice 2 (osaline): kuuloomisest täiskuuni on pool tsüklit. */
const HALF_CYCLE_DAYS = dayFromPhaseAngle(180);

/** Practice 4 (iseseisev ülekanne): kuuloomisest 22 ööpäeva edasi. */
const DAY_22_PHASE_ANGLE = phaseAngleFromDay(22);
const DAY_22_LABEL = phaseLabel(DAY_22_PHASE_ANGLE);

/** Exit 2: esimesest veerandist täiskuuni on veerand tsüklit. */
const QUARTER_CYCLE_DAYS = dayFromPhaseAngle(180) - dayFromPhaseAngle(90);

/** Maa varju geomeetria (mooduli vastuargument, explore-3 ja kordamiskaardid). */
const SHADOW_HALF_ANGLE_DEG = earthShadowHalfAngleDeg(EARTH_UMBRA_WIDTH_AT_MOON_KM, MOON_MEAN_KM);
const SHADOW_WINDOW_HOURS = shadowWindowHours();

const steps: Step[] = [
  {
    type: "hook",
    id: "hook-1",
    figure: "kf-kolm-ohtut",
    title: "Kaks nädalat, kolm õhtut, kolm kuju",
    body: [
      "3. mai: kitsas sirp, valgustatud paremalt. 10. mai: täpselt poolik. 17. mai: peaaegu täis. Sama taevas, sama koht.",
      "Kas Kuu ise muutus, jäi midagi tema ette, või muutus hoopis midagi muud?",
    ],
  },
  {
    type: "theory",
    id: "theory-1",
    title: "Kuud valgustab alati pool",
    figure: "kf-valgustatud-pool",
    body: [
      "Kuu ei helenda ise. Ta paistab ainult sellepärast, et temalt peegeldub päikesevalgus – täpselt nagu igalt teiselt esemelt toas (Kuu on valgustatud keha, mitte valgusallikas).",
      "Päike valgustab igal hetkel täpselt poolt Kuust. See ei muutu kunagi. Teine pool on parajasti pime – seal on Kuu öö.",
      "Muutub see, kust meie vaatame. Kuu tiirleb ümber Maa, seega näeme me seda valgustatud poolt iga päev veidi teise nurga alt: kord tagant (Kuud ei paista), kord küljelt (pool ketast), kord otse eest (täiskuu). Faas ongi vaatenurk, mitte vari.",
      `Tsükkel kestab umbes ${formatNumber(SYNODIC_MONTH_DAYS, 1)} ööpäeva. Kuu teeb tiiru ümber Maa 27,3 päevaga, aga Maa ise on selle ajaga Päikese ümber edasi liikunud – Kuu peab Päikese suunale järele jõudma ja selleks kulub veel paar päeva.`,
      "Kuu pöörab meie poole alati sama külge. Seepärast näeme me alati sama Kuu nägu. See EI tähenda, et teine pool oleks pime – ka seal vahelduvad päev ja öö, me lihtsalt ei näe seda kunagi.",
      "Sõnad „noorkuu” ja „vanakuu” tähendavad eri inimeste suus eri asju (kord nähtamatut Kuud, kord kasvavat või kahanevat). Selguse mõttes kasutame siin: kuuloomine (ei paista), kasvav sirp, esimene veerand, kasvav kumer, täiskuu, kahanev kumer, viimane veerand, kahanev sirp.",
    ],
  },
  {
    type: "predict",
    id: "predict-1",
    title: "Paku oma ennustus",
    body: [
      "Täna on Kuu täpselt poolik: pool ketast helendab, pool on tume. Mis on juhtunud selle Kuu poolega, mida Päike valgustab?",
    ],
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt: "Mis on juhtunud selle Kuu poolega, mida Päike valgustab?",
        options: [
          {
            id: "vahem-valgustatud",
            text: "Päike valgustab praegu Kuust ainult poolt sellest, mida tavaliselt",
            correct: false,
            misconception: "paike-valgustab-vahem",
          },
          {
            id: "maa-vari-katab",
            text: "Pool valgustatud poolest on Maa varjus",
            correct: false,
            misconception: "kuu-faas-on-vari",
          },
          {
            id: "vaatenurk",
            text: "Valgustatud pool on endiselt terve – meie näeme seda parajasti küljelt ja seepärast paistab meile sellest ainult pool",
            correct: true,
          },
        ],
      },
      {
        kind: "text",
        id: "predict-2",
        prompt: "Miks sa nii arvad?",
        minWords: 5,
      },
    ],
  },
  {
    type: "explore",
    id: "explore-1",
    title: "Katseta simulatsiooniga",
    body: [
      "Ülaltvaates on Päike vasakul servas, keskel Maa, ümber tema Kuu orbiidiring. Nii Maa kui Kuu on joonistatud pooleldi valgustatuna. „Nii paistab Maalt” näitab, mida Maa peal seisja päriselt näeb.",
      "Liigu liuguriga Kuu asukohta orbiidil ja jälgi mõlemat paneeli korraga.",
    ],
    questions: [
      {
        kind: "numeric",
        id: "explore-1",
        prompt: "Liugur on alguses 0° peal – Kuu on Maa ja Päikese vahel. Kui suur osa Kuu kettast on Maalt vaadates valgustatud?",
        hints: [
          "Vaata ÜLALTVAADET – kas Päike valgustab Kuud ka praegu?",
          "Valgustatud pool on olemas, aga kummale poole ta jääb?",
        ],
        unit: "%",
        tolerance: PERCENT_TOLERANCE,
        answer: NEW_MOON_PERCENT,
      },
      {
        kind: "numeric",
        id: "explore-2",
        prompt: "Keri 90° juurde ja siis 270° juurde. Kui suur osa on valgustatud mõlemal juhul?",
        hints: ["Vaata „Nii paistab Maalt” paneeli – mitu protsenti näidik ütleb?"],
        unit: "%",
        tolerance: PERCENT_TOLERANCE,
        answer: QUARTER_PERCENT,
      },
      {
        kind: "choice",
        id: "explore-3",
        prompt: "Lülita sisse Maa vari ja keri kogu orbiit läbi. Kus on Maa vari Kuu lähedal?",
        hints: [
          "Vari ulatub orbiidile ainult seal, kus Kuu on Päikesest kõige kaugemal – kell see on?",
        ],
        options: [
          {
            id: "kogu-pool",
            text: "Kogu selles pooles, kus Kuu on Päikesest eemal",
            correct: false,
            misconception: "kuu-faas-on-vari",
          },
          {
            id: "uhes-kohas",
            text: "Ainult ühes ainsas kohas – täiskuu juures (180°)",
            correct: true,
          },
          {
            id: "igal-pool",
            text: "Igal pool peale täiskuu",
            correct: false,
            misconception: "kuu-faas-on-vari",
          },
        ],
      },
      {
        kind: "numeric",
        id: "explore-4",
        prompt: "Keri aeglaselt 0°-st 360°-ni. Mitu korda on Kuu Maalt vaadates täpselt pooleldi valgustatud?",
        hints: ["Vaata näitu „valgustatud osa” – mitu korda ta läbib 50%?"],
        tolerance: COUNT_TOLERANCE,
        answer: 2,
      },
    ],
    simulation: {
      unlocks: [{ feature: "maa-vari", afterQuestion: "explore-2" }],
    },
  },
  {
    type: "practice",
    id: "practice-1",
    title: "Proovi ise järele",
    worked: {
      prompt: "Miks on vale öelda, et sirbikujuline Kuu on Maa varjus?",
      solution: [
        `Maa vari on Päikesest eemale suunatud koonus ja ta ulatub Kuu orbiidile ainult ühes kohas – täpselt täiskuu juures, ${formatNumber(2 * SHADOW_HALF_ANGLE_DEG, 1)}° ulatuses kogu 360°-st (poolnurk ${formatNumber(SHADOW_HALF_ANGLE_DEG, 2)}°, kokku umbes ${formatNumber(SHADOW_WINDOW_HOURS, 1)} tundi ${formatNumber(SYNODIC_MONTH_DAYS, 1)} ööpäevast).`,
        "Sirp on aga täiesti mujal: siis on Kuu peaaegu Päikese suunas, varjust nii kaugel kui üldse olla saab. Sirp tekib sellest, et me näeme valgustatud poolkerast serva.",
      ],
      answer:
        "Maa vari on orbiidil ühesainsas kohas (täiskuu juures) ja sirbi ajal on Kuu selle vastasküljel – sirp tekib vaatenurgast, mitte varjust.",
    },
    questions: [
      {
        kind: "numeric",
        id: "practice-1",
        prompt: `Tsükkel kestab ${formatNumber(SYNODIC_MONTH_DAYS, 1)} ööpäeva. Kuuloomisest täiskuuni on pool tsüklit. Täida: ${formatNumber(SYNODIC_MONTH_DAYS, 1)} / 2 = ___`,
        hints: ["Pool tsüklit."],
        unit: "päeva",
        tolerance: DAY_TOLERANCE,
        answer: HALF_CYCLE_DAYS,
      },
      {
        kind: "choice",
        id: "practice-2",
        figure: "kf-kaks-sirpi",
        prompt: "Sa vaatad taevast Eestis. Kumb neist on kasvav Kuu (liigub täiskuu poole)?",
        hints: [
          "Kasvav Kuu on Päikesele järele jõudmas – Päike loojub läänes ja kasvav Kuu on temast idas.",
          "Keri simulatsioonis 60° juurde ja vaata, kummal serval valgus on.",
        ],
        options: [
          {
            id: "vasak",
            text: "Vasakpoolne – valgustatud paremalt",
            correct: true,
          },
          {
            id: "parem",
            text: "Parempoolne – valgustatud vasakult",
            correct: false,
            misconception: "kasvav-kahanev-segamini",
          },
          {
            id: "sama",
            text: "Mõlemad on ühesugused, kuju on sama",
            correct: false,
            misconception: "kasvav-kahanev-segamini",
          },
        ],
      },
      {
        kind: "choice",
        id: "practice-3",
        prompt: "Täna on kuuloomine (päev 0). Milline on Kuu 22 ööpäeva pärast?",
        hints: ["22 päeva on kolmveerand 29,5-päevasest tsüklist – keri simulatsioonis päevani 22."],
        options: [
          {
            id: "taiskuu",
            text: "Täiskuu",
            correct: false,
            misconception: "faas-ja-tiirlemisaeg",
          },
          {
            id: "viimane-veerand",
            text: "Kahanev poolik ehk viimane veerand",
            correct: DAY_22_LABEL === "last-quarter",
          },
          {
            id: "kasvav-sirp",
            text: "Kasvav sirp",
            correct: false,
            misconception: "faas-ja-tiirlemisaeg",
          },
        ],
      },
      {
        kind: "choice",
        id: "practice-4",
        prompt: "Millised väited on õiged?",
        hints: [
          "Faasi tekitab vaatenurk valgustatud poolkerale, mitte Maa vari – vari puutub orbiiti ainult ühes kohas.",
        ],
        multiple: true,
        shuffle: true,
        options: [
          {
            id: "paike-alati-pool",
            text: "Päike valgustab Kuust alati täpselt poolt",
            correct: true,
          },
          {
            id: "sirp-on-vari",
            text: "Kuu sirp tekib siis, kui Maa vari katab osa Kuust",
            correct: false,
            misconception: "kuu-faas-on-vari",
          },
          {
            id: "peegeldunud-valgus",
            text: "Kuu paistab ainult peegeldunud päikesevalguse tõttu",
            correct: true,
          },
          {
            id: "tume-tagakylg",
            text: "Kuu tagumine pool on igavesti pime",
            correct: false,
            misconception: "kuu-tume-pool",
          },
          {
            id: "tsykkel-29-5",
            text: "Faaside tsükkel kestab umbes 29,5 ööpäeva",
            correct: true,
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
        prompt: "Miks me kuuloomise ajal Kuud ei näe?",
        hints: ["Kuuloomisel on Kuu Maa ja Päikese vahel – kumb pool Kuust on siis meie poole?"],
        options: [
          {
            id: "maa-vari",
            text: "Maa vari katab ta ära",
            correct: false,
            misconception: "kuu-faas-on-vari",
          },
          {
            id: "ara-poore",
            text: "Tema valgustatud pool on parajasti meist ära pööratud",
            correct: true,
          },
          {
            id: "paike-ei-valgusta",
            text: "Päike ei valgusta teda sel ajal",
            correct: false,
            misconception: "paike-valgustab-vahem",
          },
        ],
      },
      {
        kind: "numeric",
        id: "exit-2",
        prompt: `Faaside tsükkel kestab ${formatNumber(SYNODIC_MONTH_DAYS, 1)} ööpäeva. Täna on esimene veerand (poolik, kasvav). Mitme ööpäeva pärast on täiskuu?`,
        hints: ["Esimesest veerandist täiskuuni on veerand tsüklit."],
        unit: "päeva",
        tolerance: DAY_TOLERANCE,
        answer: QUARTER_CYCLE_DAYS,
      },
      {
        kind: "text",
        id: "exit-3",
        prompt:
          "Sinu sõber ütleb: „Poolik Kuu on selline sellepärast, et Maa vari katab teise poole ära.” Kirjuta talle vastus.",
        minWords: 10,
      },
    ],
  },
];

/**
 * Kordamiskaardid (docs/MOODULILEPING.md „activities.ts – kordamiskaardid",
 * sisu/MOODUL-kuu-faasid.md „Kordamiskaardid").
 */
const reviewCards: ReviewCard[] = [
  {
    id: "rc-1",
    type: "concept",
    question: "Kui suurt osa Kuust valgustab Päike?",
    answer:
      "Alati täpselt poolt – see ei muutu kunagi. Muutub ainult see, kui suurt osa sellest valgustatud poolest me Maalt näeme.",
  },
  {
    id: "rc-2",
    type: "explain",
    question: "Miks me kuuloomise ajal Kuud ei näe?",
    answer:
      "Kuu on siis Maa ja Päikese vahel – tema valgustatud pool on Päikese poole ehk meist ära pööratud, meie poole jääb pime pool.",
  },
  {
    id: "rc-3",
    type: "calc",
    question: "Faaside tsükkel kestab 29,5 ööpäeva. Mitme päeva pärast on esimesest veerandist täiskuu?",
    answer: `Veerand tsüklit: ${formatNumber(SYNODIC_MONTH_DAYS, 1)} / 4 ≈ ${formatNumber(QUARTER_CYCLE_DAYS, 1)} ööpäeva.`,
  },
  {
    id: "rc-4",
    type: "transfer",
    question: "Sõber ütleb, et poolik Kuu on Maa varjus. Mis on vale?",
    answer: `Maa vari on Päikesest eemal ja ulatub Kuu orbiidile ainult täiskuu kohal, ${formatNumber(2 * SHADOW_HALF_ANGLE_DEG, 1)}° ulatuses kogu 360°-st. Poolik Kuu on hoopis mujal – me lihtsalt näeme valgustatud poolt küljelt. Kui Kuu sinna varju satub, tekib kuuvarjutus.`,
  },
  {
    id: "rc-5",
    type: "concept",
    question: "Miks kestab faaside tsükkel 29,5 päeva, kui Kuu teeb tiiru ümber Maa 27,3 päevaga?",
    answer:
      "Maa on selle aja jooksul ise ümber Päikese edasi liikunud, seega peab Kuu Päikese suunale järele jõudma – selleks kulub veel umbes kaks päeva.",
  },
];

export const activities = defineActivities({ steps, reviewCards });
