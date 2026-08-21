import { defineActivities } from "../../../engine/contract";
import type { ReviewCard, Step } from "../../../engine/contract";
import { formatNumber } from "../../../lib/format";
import {
  EARTH_RADIUS_KM,
  MOON_APOGEE_KM,
  MOON_DIAMETER_KM,
  MOON_MEAN_KM,
  MOON_PERIGEE_KM,
  MOON_UMBRA_TIP_KM,
  SOLAR_ECLIPSE_LIMIT_KM,
  lunarPenumbraBandKm,
  lunarUmbraToMoonRatio,
  lunarUmbraWidthKm,
  solarEclipseKind,
  solarUmbraGapKm,
  solarUmbraSpotKm,
} from "./model";

/**
 * Sammud ja kordamiskaardid (docs/MOODULILEPING.md,
 * sisu/MOODUL-varjutused.md).
 *
 * **Rakendusmoodul:** kogu füüsika on mooduli `vari-ja-poolvari`
 * geomeetria, millele on ette antud kosmilised arvud. Ühtki valemit siin
 * kirjutatud ei ole – kõik arvulised vastused tulevad MUDELIST, mitte
 * käsitsi kirjutatud arvudest (CLAUDE.md reegel 1). Nii ei saa ülesande
 * vastus ja simulatsiooni näit kunagi lahku minna; testid
 * (tests/varjutused.model.test.ts) loevad neid arve üle
 * SPETSIFIKATSIOONI tabeli järgi, seega vale konstant siin failis teeb
 * testi punaseks, mitte ei jõua tundi.
 *
 * **Kõik pikkused ja kaugused on kilomeetrites** – siin ei ole
 * ühikuvahetust nagu moodulis `vari-ja-poolvari` (m ↔ cm), sest kilomeeter
 * on ainus ühik, milles need arvud on loetavad.
 */

/** Eesti kombe järgi tuhandete tühik ja koma – nt "374 289 km". */
function km(valueKm: number, decimals = 0): string {
  return `${formatNumber(valueKm, decimals)} km`;
}

// --- Ülesannetes kasutatavad arvud (kõik mudelist) --------------------------

/** Explore 2: Kuu lähimas punktis. */
const NEAR_UMBRA_SPOT_KM = solarUmbraSpotKm(MOON_PERIGEE_KM);

/** Practice 1 (osaline): Maa täisvari Kuu kaugusel ja Kuu enda läbimõõt. */
const LUNAR_UMBRA_KM = lunarUmbraWidthKm(MOON_MEAN_KM);
const LUNAR_UMBRA_RATIO = lunarUmbraToMoonRatio(MOON_MEAN_KM);

/** Practice 3 (iseseisev arv): Kuu 340 000 km kaugusel Maa keskpunktist. */
const PRACTICE_MOON_DISTANCE_KM = 340_000;
const PRACTICE_UMBRA_SPOT_KM = solarUmbraSpotKm(PRACTICE_MOON_DISTANCE_KM);

/** Exit 2: Kuu 395 000 km kaugusel Maa keskpunktist. */
const EXIT_MOON_DISTANCE_KM = 395_000;
const EXIT_UMBRA_GAP_KM = solarUmbraGapKm(EXIT_MOON_DISTANCE_KM);

/** Kordamiskaart rc-3: sama seis mis explore-3, sõnadega lahti seletatud. */
const CARD_MOON_DISTANCE_KM = MOON_MEAN_KM;
const CARD_UMBRA_GAP_KM = solarUmbraGapKm(CARD_MOON_DISTANCE_KM);
const CARD_ECLIPSE_KIND = solarEclipseKind(CARD_MOON_DISTANCE_KM);

/** Kordamiskaart rc-4: kuuvarjutuse ja päikesevarjutuse laiuste vastandus. */
const CARD_LUNAR_PENUMBRA_KM = lunarPenumbraBandKm(MOON_MEAN_KM);

const steps: Step[] = [
  {
    type: "hook",
    id: "hook-1",
    // Joonis näitab AINULT ajavahet – ei ütle, MIKS see nii pikk on. See
    // ongi sammu küsimus.
    figure: "vj-eesti-varjutus",
    title: "Miks tuleb täielik varjutus nii harva?",
    body: [
      "Kuu tiirleb ümber Maa iga 27 päeva tagant ja möödub iga kuu korra Maa ja Päikese vahelt.",
      "1961. aastal nägi Eesti peaaegu täielikku päikesevarjutust – 88% Päikesest oli kaetud. Järgmine täielik varjutus tuleb Eestisse alles 2126. aastal.",
      "Miks tuleb täielik päikesevarjutus Eestisse nii harva, kui Kuu käib iga kuu Maa ja Päikese vahelt läbi? Täna oskad sellele joonisega vastata.",
    ],
  },
  {
    type: "theory",
    id: "theory-1",
    title: "Kes kelle varju jääb",
    body: [
      "Päikesevarjutus: Kuu on Maa ja Päikese vahel. Varju heidab Kuu, vari langeb Maale. Kes on Kuu täisvarjus, sellele on Päike täiesti kadunud (täielik varjutus); kes on poolvarjus, sellele on Päikesest tükk ära söödud (osaline varjutus).",
      "Kuuvarjutus: Maa on Päikese ja Kuu vahel. Varju heidab Maa, vari langeb Kuule. Kuu ei kao ära, vaid tumeneb ja läheb punakaks.",
      "Miks siis mitte iga kuu? Kuu rada on Maa raja suhtes viltu, umbes 5°. Enamasti möödub Kuu vari Maast ülevalt või alt ja Kuu ise möödub Maa varjust. Varjutus tuleb ainult siis, kui Kuu juhtub olema parajasti tasandite lõikekohas.",
      "Kuu faas ei ole varjutus. Kahanev Kuu ei ole Maa vari Kuu peal – Kuud valgustab alati pool ja meie näeme sellest poolest kord rohkem, kord vähem.",
    ],
    figure: "vj-kaks-varjutust",
  },
  {
    type: "predict",
    id: "predict-1",
    title: "Paku oma ennustus",
    body: [
      `Kuu kaugus Maast ei ole alati sama: ta kõigub ${km(MOON_PERIGEE_KM)} ja ${km(MOON_APOGEE_KM)} vahel. Mis juhtub päikesevarjutusega siis, kui Kuu on parajasti oma kaugeimas punktis?`,
    ],
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt: "Mis juhtub päikesevarjutusega, kui Kuu on kõige kaugemal Maast?",
        options: [
          {
            id: "vaiksem",
            text: "Varjutus on samasugune, ainult vari on väiksem",
            correct: false,
            misconception: "taisvari-ei-loppe",
          },
          {
            id: "rongas",
            text: "Täisvari ei jõua Maani – Päike jääb Kuu ümber helendava rõngana paistma",
            correct: true,
          },
          {
            id: "pole",
            text: "Varjutust ei tule üldse, Kuu on liiga kaugel",
            correct: false,
            misconception: "varjutus-koik-voi-mitte-midagi",
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
    title: "Katseta simulatsiooniga",
    body: [
      "Vasakul on Päike, keskel varju heitev keha (Kuu või Maa), paremal teine keha. Täisvarju koonus on must, poolvarju alad hallid. Joonis ei ole mõõtkavas.",
      "Vaheta valikuga, kumb varjutus – päikesevarjutus või kuuvarjutus – on kuvatud, ja liiguta Kuu kauguse liugurit.",
    ],
    questions: [
      {
        // Kontrollküsimus: koonuse pikkus EI sõltu liugurist, sest ta tuleb
        // ainult Päikese ja Kuu suurusest.
        kind: "numeric",
        id: "explore-1",
        prompt: "Vaata päikesevarjutust. Kui pikk on Kuu täisvarju koonus?",
        hints: [
          "Suur arv ekraani ülaosas ütleb koonuse pikkuse kilomeetrites.",
          "See arv ei muutu, kui liigutad Kuu kauguse liugurit – koonuse kuju otsustavad ainult Päikese ja Kuu suurus.",
        ],
        unit: "km",
        tolerance: { mode: "percent", value: 5 },
        answer: MOON_UMBRA_TIP_KM,
      },
      {
        kind: "numeric",
        id: "explore-2",
        prompt: `Lohista Kuu lähimasse punkti (${km(MOON_PERIGEE_KM)}). Kui lai on täisvarju laik Maal?`,
        hints: [
          "Koonuse ots on terav – kui sügavale ta Maa pinnast sisse jõuab?",
          "Maa pind on 6371 km lähemal kui Maa keskpunkt.",
        ],
        unit: "km",
        tolerance: { mode: "percent", value: 10 },
        answer: NEAR_UMBRA_SPOT_KM,
      },
      {
        kind: "numeric",
        id: "explore-3",
        prompt: "Lohista Kuu aeglaselt kaugemale. Millisel kaugusel muutub varjutus täielikust rõngasjaks?",
        hints: ["See on koht, kus täisvarju laik jääb nulli."],
        unit: "km",
        // Absoluutne, mitte protsent: piir on suur arv (~380 000), aga
        // sisuline otsus (täielik/rõngasjas) ei nihku kogu liuguri
        // ulatuses ka ±5000 km juures (vt model.ts SUN_TO_EARTH_KM
        // kommentaari).
        tolerance: { mode: "absolute", value: 5000 },
        answer: SOLAR_ECLIPSE_LIMIT_KM,
      },
      {
        // Kvalitatiivne meelega: Maa täisvari on Kuu kaugusel palju laiem
        // kui Kuu ise, seega mahub Kuu tervenisti sisse.
        kind: "choice",
        id: "explore-4",
        prompt: "Vaheta kuuvarjutusele. Kumb väide on õige?",
        hints: [
          "Kuu kaugus Maast on tunduvalt väiksem kui varju enda pikkus – vaata liuguril, kui laiaks vari selle vahemaa peal jõuab kasvada.",
        ],
        options: [
          {
            id: "sama",
            text: "Maa täisvari on Kuu kaugusel umbes sama lai kui Kuu",
            correct: false,
            misconception: "taisvari-on-suur",
          },
          {
            id: "laiem",
            text: "Maa täisvari on Kuu kaugusel üle kahe korra laiem kui Kuu",
            correct: true,
          },
          {
            id: "loppeb",
            text: "Maa täisvari lõpeb enne Kuud ära, nagu Kuu oma enne Maad",
            correct: false,
            misconception: "taisvari-ei-loppe",
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
      prompt:
        "Miks kestab täielik päikesevarjutus ainult mõne minuti, kuuvarjutus aga tunde?",
      solution: [
        `Täisvarju laik Maal on päikesevarjutuse ajal ainult ${km(NEAR_UMBRA_SPOT_KM)} lai, kõige lähemas punktis, ja Kuu vari libiseb üle Maa pinna tuhande kilomeetriga tunnis – ühest kohast käib ta läbi mõne minutiga.`,
        `Kuuvarjutuse ajal on Maa täisvari Kuu kaugusel ${km(LUNAR_UMBRA_KM, 0)} lai, Kuu ise ainult ${km(MOON_DIAMETER_KM, 0)} – Kuul kulub sellest läbiminekuks tunde, sest ta mahub tervenisti täisvarju sisse.`,
      ],
      answer: "Päikesevarjutuse laik on kitsas ja libiseb kiiresti üle Maa; kuuvarjutuse ajal on Kuu ise laigust palju väiksem ja jääb sinna tundideks.",
    },
    questions: [
      {
        // Osaline: tehe on ees, vastus tuleb ise.
        kind: "numeric",
        id: "practice-1",
        prompt: `Maa täisvari on Kuu kaugusel ${km(LUNAR_UMBRA_KM, 0)} lai, Kuu läbimõõt on ${km(MOON_DIAMETER_KM, 0)}. Mitu korda on Maa täisvari laiem kui Kuu ise? Täida: ${formatNumber(LUNAR_UMBRA_KM, 0)} / ${formatNumber(MOON_DIAMETER_KM, 0)} = ___`,
        hints: [
          "Jaga varju laius Kuu läbimõõduga.",
          "Vastus on veidi üle kahe.",
        ],
        tolerance: { mode: "percent", value: 5 },
        answer: LUNAR_UMBRA_RATIO,
      },
      {
        // Iseseisev (kaardilugemine).
        kind: "choice",
        id: "practice-2",
        figure: "vj-varjutuse-rada",
        prompt: "Mida näeb inimene punktis B?",
        hints: ["Tume riba on täisvari, hall ala poolvari."],
        options: [
          {
            id: "taielik",
            text: "Täielikku varjutust",
            correct: false,
            misconception: "taisvari-on-suur",
          },
          {
            id: "osaline",
            text: "Osalist varjutust – Päikesest on tükk kaetud",
            correct: true,
          },
          {
            id: "tavaline",
            text: "Mitte midagi erilist",
            correct: false,
            misconception: "varjutus-koik-voi-mitte-midagi",
          },
        ],
      },
      {
        // Iseseisev (arv). Kuu 340 000 km on liuguri vahemikust VÄLJAS
        // (allpool lähimat punkti) – see on lubatud, sest tegemist ei ole
        // enam simulatsiooni piiriga, vaid lihtsalt teise seisuga (vt
        // model.ts assertOutsideEarth kommentaari).
        kind: "numeric",
        id: "practice-3",
        prompt: `Kui Kuu oleks ${km(PRACTICE_MOON_DISTANCE_KM)} kaugusel Maa keskpunktist, kui suur oleks täisvarju laik Maal? (Kui koonus ei jõuaks Maani, oleks vastus null ja varjutus rõngasjas.)`,
        hints: [
          `Maa pind on Kuu keskpunktist ${formatNumber(PRACTICE_MOON_DISTANCE_KM, 0)} − 6371 = ${formatNumber(PRACTICE_MOON_DISTANCE_KM - EARTH_RADIUS_KM, 0)} km kaugusel.`,
          `Kuu täisvarju koonus on ${km(MOON_UMBRA_TIP_KM, 0)} pikk.`,
        ],
        unit: "km",
        tolerance: { mode: "percent", value: 10 },
        answer: PRACTICE_UMBRA_SPOT_KM,
      },
      {
        // Ülekanne, mitu õiget. `shuffle: true` on vaikimisi sees, aga
        // kirjas siin meelega: järjekord ei kanna siin tähendust.
        kind: "choice",
        id: "practice-4",
        prompt: "Millised väited on õiged?",
        hints: [
          "Kes kelle vahel seisab, otsustab, kumb varjutus on tegu – ja täisvarju laius otsustab, kui suur ala seda korraga näeb.",
        ],
        multiple: true,
        shuffle: true,
        options: [
          {
            id: "kuu-vahel-paike",
            text: "Täieliku päikesevarjutuse ajal on Kuu Maa ja Päikese vahel",
            correct: true,
          },
          {
            id: "kuu-vahel-kuu",
            text: "Kuuvarjutuse ajal on Kuu Maa ja Päikese vahel",
            correct: false,
            misconception: "varjutused-segamini",
          },
          {
            id: "kuuvarjutus-pool-maad",
            text: "Kuuvarjutust näeb korraga umbes pool maakera",
            correct: true,
          },
          {
            id: "paikesevarjutus-pool-maad",
            text: "Täielikku päikesevarjutust näeb korraga umbes pool maakera",
            correct: false,
            misconception: "taisvari-on-suur",
          },
          {
            id: "mitte-igal-kuul",
            text: "Varjutust ei tule iga kuu, sest Kuu rada on viltu",
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
        prompt: "Päikesevarjutuse ajal langeb…",
        hints: ["Kes on siin keskel, Maa ja Päikese vahel?"],
        options: [
          {
            id: "maa-kuule",
            text: "Maa vari Kuule",
            correct: false,
            misconception: "varjutused-segamini",
          },
          {
            id: "kuu-maale",
            text: "Kuu vari Maale",
            correct: true,
          },
          {
            id: "kuu-paikesele",
            text: "Kuu vari Päikesele",
            correct: false,
            misconception: "varjutused-segamini",
          },
        ],
      },
      {
        kind: "numeric",
        id: "exit-2",
        prompt: `Kuu täisvarju koonus on ${km(MOON_UMBRA_TIP_KM, 0)} pikk. Kuu keskpunkt on Maa keskpunktist ${km(EXIT_MOON_DISTANCE_KM)} kaugusel. Kui palju jääb täisvarjul Maa pinnani puudu?`,
        hints: ["Maa pind on 6371 km lähemal kui keskpunkt."],
        unit: "km",
        tolerance: { mode: "percent", value: 5 },
        answer: EXIT_UMBRA_GAP_KM,
      },
      {
        kind: "text",
        id: "exit-3",
        prompt:
          "Kuu tiirleb ümber Maa iga 27 päeva tagant. Selgita, miks ei ole siis iga kuu ühte päikesevarjutust ja ühte kuuvarjutust.",
        minWords: 10,
      },
    ],
  },
];

/**
 * Kordamiskaardid (docs/MOODULILEPING.md „activities.ts – kordamiskaardid",
 * sisu/MOODUL-varjutused.md „Kordamiskaardid").
 */
const reviewCards: ReviewCard[] = [
  {
    id: "rc-1",
    type: "concept",
    question: "Kes heidab varju ja kellele see langeb päikesevarjutuse ajal?",
    answer:
      "Kuu heidab varju, vari langeb Maale (Kuu on Maa ja Päikese vahel).",
  },
  {
    id: "rc-2",
    type: "concept",
    question: "Mis vahe on täielikul ja rõngasjal päikesevarjutusel?",
    answer:
      "Täieliku ajal jõuab Kuu täisvarju koonuse tipp Maani; rõngasja ajal jääb koonus lühikeseks, sest Kuu on kaugemal, ja Päike paistab Kuu ümber rõngana.",
  },
  {
    id: "rc-3",
    type: "calc",
    question: `Kuu täisvarju koonus on ${km(MOON_UMBRA_TIP_KM, 0)} pikk. Kuu keskpunkt on ${km(CARD_MOON_DISTANCE_KM, 0)} kaugusel Maa keskpunktist. Kas varjutus on täielik?`,
    answer: `Maa pind on ${formatNumber(CARD_MOON_DISTANCE_KM, 0)} − 6371 = ${formatNumber(CARD_MOON_DISTANCE_KM - EARTH_RADIUS_KM, 0)} km kaugusel, koonus ${formatNumber(MOON_UMBRA_TIP_KM, 0)} km – jääb ${km(CARD_UMBRA_GAP_KM, 0)} puudu, seega ${CARD_ECLIPSE_KIND === "total" ? "täielik" : "rõngasjas"}.`,
  },
  {
    id: "rc-4",
    type: "explain",
    question:
      "Miks näeb kuuvarjutust korraga pool maakera, päikesevarjutust aga ainult kitsas riba?",
    answer: `Maa täisvari on Kuu kaugusel ${km(LUNAR_UMBRA_KM, 0)} lai ja katab Kuu tervenisti (Kuu on ${km(MOON_DIAMETER_KM, 0)}); Kuu täisvari on Maal ainult ${km(NEAR_UMBRA_SPOT_KM, 0)} lai laik. (Maa poolvari, mis Kuu kaugusel ulatub ${km(CARD_LUNAR_PENUMBRA_KM, 0)} riba servani, on ühel serval veelgi laiem.)`,
  },
  {
    id: "rc-5",
    type: "transfer",
    question:
      "Miks ei ole varjutust iga kuu, kuigi Kuu tiirleb ümber Maa iga 27 päeva tagant?",
    answer:
      "Kuu rada on Maa raja tasandi suhtes ~5° viltu – enamasti möödub vari Maast ülevalt või alt; varjutus tuleb ainult tasandite lõikekohas.",
  },
];

export const activities = defineActivities({ steps, reviewCards });
