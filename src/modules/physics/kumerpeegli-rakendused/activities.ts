import { defineActivities } from "../../../engine/contract";
import type { ReviewCard, Step } from "../../../engine/contract";
import { formatNumber } from "../../../lib/format";
import {
  AISLE_DISTANCE_CM,
  MIRROR_APERTURE_CM,
  SLIDERS,
  convexViewWidth,
  flatViewWidth,
  metresFromCentimetres,
} from "./model";

/**
 * Sammud ja kordamiskaardid (docs/MOODULILEPING.md,
 * sisu/MOODUL-kumerpeegli-rakendused.md).
 *
 * **Ükski nähtava ala laius ei ole siia käsitsi kirjutatud** – kõik tulevad
 * `model.ts`-i valemitest (CLAUDE.md reegel 1), nii et ülesande vastus ja
 * simulatsiooni näit ei saa kunagi lahku minna. Testis
 * (tests/kumerpeegli-rakendused.model.test.ts) võrreldakse neid arve
 * SPETSIFIKATSIOONI tabeliga, mitte activities.ts iseendaga.
 *
 * **Ühikud.** Mudel arvutab meetrites, õpilane räägib peegli ja vaataja
 * mõõtudest sentimeetrites ja nähtavast alast meetrites. Ühik muutub AINULT
 * `metresFromCentimetres` sees – siin failis on ta kahes abifunktsioonis
 * (`convexWidthM`, `flatWidthM`), et ükski küsimus ei saaks teisendust vahele
 * jätta.
 *
 * **Ekraanil on laiused ühe kohaga peale koma** (`width`), sest tolerants on
 * 0,2 m: kolmanda koha näitamine lubaks õpilasel arvata, et mõõdujoont saab
 * lugeda sentimeetri täpsusega.
 *
 * **Kõik õpilase jagamised käivad LAIUSTE, mitte nurkadega.** Nurgad on
 * ekraanil olemas (nad seletavad, MIKS lehvik lai on), aga nende suhe on teine
 * arv kui laiuste suhe – peegli enda laius 2a on laiuses alati sees. Ülesanne,
 * mis jagab nurki, ja ülesanne, mis jagab laiusi, ei tohi sattuda kõrvuti
 * (sisu/MOODUL-kumerpeegli-rakendused.md „explore", ülesanne 4).
 *
 * **Piirid, mida see moodul EI ületa:** siin ei arvutata ühtegi fookust (see on
 * moodul `kumerpeegel`) ega kujutise suurust ega kohta (gümnaasium). Sõnu
 * „fookuskaugus" ja „kujutis" ei ole õpilase pooles kusagil – esimene on P2
 * põhimõiste (katvusraport võrdleb mõisteid nime järgi), teine viiks
 * konstrueerimiseni, mida see moodul ei tee. Mõlemat valvab test.
 */

const APERTURE_M = metresFromCentimetres(MIRROR_APERTURE_CM);

/** Kumerpeeglis nähtava ala laius (m) – ainus tee mudelisse. */
function convexWidthM(
  radiusCm: number,
  eyeDistanceCm: number,
  distanceCm: number,
): number {
  return convexViewWidth(
    metresFromCentimetres(radiusCm),
    APERTURE_M,
    metresFromCentimetres(eyeDistanceCm),
    metresFromCentimetres(distanceCm),
  );
}

/** Sama suures TASAPEEGLIS nähtava ala laius (m). Raadiust ta ei võta. */
function flatWidthM(eyeDistanceCm: number, distanceCm: number): number {
  return flatViewWidth(
    APERTURE_M,
    metresFromCentimetres(eyeDistanceCm),
    metresFromCentimetres(distanceCm),
  );
}

/**
 * Laius ekraanile: üks koht peale koma, eesti kümnendkomaga.
 *
 * Vastuse VÄÄRTUS jääb ümardamata – checker võrdleb ise tolerantsiga. Ümardamine
 * käib ainult teksti sees, muidu satuks ujukoma jääk õpilase lausesse.
 */
const width = (valueM: number): string => formatNumber(valueM, 1);

/** Peegli läbimõõt õpilase keeles: poolläbimõõt on mudeli asi. */
const MIRROR_DIAMETER_CM = MIRROR_APERTURE_CM * 2;

// --- Simulatsiooni seisud ja nende vastused (vastused mudelist) -------------

/** Algseis: liugurid oma algväärtustel (explore-1 ja explore-2). */
const START_RADIUS_CM = 100;
const START_EYE_CM = 200;
const START_CONVEX_M = convexWidthM(
  START_RADIUS_CM,
  START_EYE_CM,
  AISLE_DISTANCE_CM,
);
const START_FLAT_M = flatWidthM(START_EYE_CM, AISLE_DISTANCE_CM);

/**
 * Mitu korda pikema lõigu näeb müüja algseisus – läheb väljumispileti
 * selgitusse.
 *
 * See on explore-1 ja explore-2 kokkuvõte ühes arvus: peegel oli mõlemal korral
 * täpselt sama suur. Ümardatakse alles tekstis, jagatakse ümardamata arvudega.
 */
const START_RATIO = START_CONVEX_M / START_FLAT_M;

/** Lamedam peegel (explore-3): liuguri kõige ülemine seis. */
const FLATTER_RADIUS_CM = SLIDERS.radiusCm.max;
const FLATTER_CONVEX_M = convexWidthM(
  FLATTER_RADIUS_CM,
  START_EYE_CM,
  AISLE_DISTANCE_CM,
);

/** Vaataja kaugemal (explore-4): liuguri kõige kaugem seis. */
const FAR_EYE_CM = SLIDERS.eyeDistanceCm.max;
const FAR_CONVEX_M = convexWidthM(START_RADIUS_CM, FAR_EYE_CM, AISLE_DISTANCE_CM);
const FAR_FLAT_M = flatWidthM(FAR_EYE_CM, AISLE_DISTANCE_CM);

/**
 * Kumera eelis vaataja kauguse kasvades – kogu explore-sammu tulemus.
 *
 * Suhtarv on ühikuta, seega `unit` puudub. Mõlemad laiused tulevad mudelist,
 * seega ei saa vastus ja ekraani arvud lahku minna. Et suhe kasvab kauguse
 * kasvades monotoonselt, nõuab mudeli test (piirjuhud ja invariandid).
 */
const FAR_RATIO = FAR_CONVEX_M / FAR_FLAT_M;

/**
 * Lahendatud näidis (practice `worked`): ristmiku peegel.
 *
 * Siin on peegel sama suur (30 cm) mis simulatsioonis – „sama suur tasapeegel"
 * on kogu mooduli võrdlus ja teise suurusega peegel lõhuks selle. Juht on
 * peeglist 15 m kaugusel ja ristuv tee 4 m kaugusel peeglist.
 */
const WORKED_EYE_CM = 1500;
const WORKED_ROAD_CM = 400;
const WORKED_CONVEX_M = convexWidthM(
  START_RADIUS_CM,
  WORKED_EYE_CM,
  WORKED_ROAD_CM,
);
const WORKED_FLAT_M = flatWidthM(WORKED_EYE_CM, WORKED_ROAD_CM);

/**
 * Mõõdetud arvud (practice-1 ja exit-2).
 *
 * Need EI tule mudelist ja see on otsus, mitte unustus: ülesande sisend on
 * „ristmikul mõõdeti" ehk kaks valmis mõõtmistulemust, mitte simulatsiooni
 * seis. Mudelist tuleks siia vale asi – need arvud ei pea käima kokku ühegi
 * peegli mõõduga. Tehe ise on koodis, seega ei saa tekst ja vastus lahku minna.
 */
const MEASURED_CONVEX_M = 12;
const MEASURED_FLAT_M = 3;
const MEASURED_RATIO = MEASURED_CONVEX_M / MEASURED_FLAT_M;

const EXIT_FLAT_M = 0.8;
const EXIT_FACTOR = 4;
const EXIT_CONVEX_M = EXIT_FLAT_M * EXIT_FACTOR;

/**
 * Lugemistolerants, MITTE mõõtemääramatus: simulatsioon on ideaalne, aga
 * õpilane loeb mõõdujoont ja tipib käsitsi. 0,2 m lubab lugemisvea, aga hoiab
 * tasapeegli (1,05 m) ja kumerpeegli (4,3 m) arvud kaugel teineteisest.
 */
const READING_TOLERANCE = { mode: "absolute", value: 0.2 } as const;

/**
 * Suhtarv: tolerants 1, sest õpilane jagab ekraanilt loetud ümardatud arve.
 *
 * 3,7 : 0,6 = 6,2 ja 3,75 : 0,6 = 6,25 – mõlemad peavad olema õiged. Nurkade
 * suhe (11,0) jääb sellest kaugele välja, seega vale tehe ei lipsa läbi.
 */
const RATIO_TOLERANCE = { mode: "absolute", value: 1 } as const;

/** Arvutatud vastus: pool ühikut kõrvalt läheb valeks. */
const EXACT_RATIO_TOLERANCE = { mode: "absolute", value: 0.5 } as const;

const steps: Step[] = [
  {
    type: "hook",
    id: "hook-1",
    // Joonis näitab ainult kolme kohta, kus kumer peegel on. MIKS ta seal on,
    // ütlevad teooria ja simulatsioon – hook ei tohi vastust ette öelda.
    figure: "kr-kolm-peeglit",
    title: "Üks peegel aitab, teine petab",
    body: [
      "Ristmikul, kus maja nurk varjab vaate, aitab posti otsas olev ümar peegel juhil näha tervet ristuvat teed. Poe koridori nurgas näeb müüja samasuguses ümaras peeglis korraga kogu vahekäiku.",
      "Sama ümar peegel auto küljel aga PETAB – seal on isegi hoiatus peale kirjutatud: „Esemed on peeglis lähemal kui nad paistavad.\"",
      "Kuidas saab üks ja sama peegel korraga nii palju aidata kui ka petta? Täna saad teada, mida kumer peegel juurde annab ja mille arvelt.",
    ],
  },
  {
    type: "theory",
    id: "theory-1",
    title: "Kolm tagajärge ühest asjast",
    body: [
      "Meeldetuletus eelmisest moodulist: kumerpeegel on kera VÄLIMINE pind. Peateljega paralleelsed kiired hajuvad temalt laiali ja lõikuvad ainult pikendustena näilises fookuses peegli taga, poole raadiuse kaugusel. Kogu tänane moodul tuleb sellest ainsast asjast.",
      "TAGAJÄRG 1: LAI VAATEVÄLI. Kui peeglilt lähevad kiired laiali, siis vastupidi vaadates jõuab peeglisse valgust palju laiemast alast kui sama suurde tasapeeglisse. VAATEVÄLI on see ala, mida sa peeglis korraga näed. Kumeral peeglil on ta lai ka siis, kui peegel ise on väike.",
      "Kui lai, sõltub kahest asjast. Mida KUMERAM peegel (väiksem raadius), seda laiem vaateväli. Vaataja kaugus mõjutab ka: eemale minnes vaateväli kitseneb, aga kumeral peeglil palju vähem kui tasasel. Just seepärast ongi kumer peegel kasulik seal, kus vaataja on kaugel: ristmikul teisel pool teed, poe koridori teises otsas.",
      "TAGAJÄRG 2: ESEMED PAISTAVAD VÄIKSEMAD. Laiem ala mahub samale peeglipinnale ära ainult nii, et kõik selles on väiksem. Peegel EI muuda ühtegi eset – muutub ainult see, kui suurena me teda peeglis näeme.",
      "TAGAJÄRG 3: KAUGUS TUNDUB SUUREM. Aju hindab kaugust suuruse järgi: mida väiksem asi paistab, seda kaugemal ta meie arvates on. Kumerpeeglis paistab tagant tulev auto väike, seega tundub ta kaugemal olevat, kui ta päriselt on. Sellepärast ongi külgpeeglile kirjutatud „esemed on peeglis lähemal kui nad paistavad\" – hoiatus, et sellele hinnangule ei tohi mööda sõites kindel olla.",
      "Kokkuvõte ühe lausega: kumerpeegel vahetab SUURUSE VAATEVÄLJA VASTU. Kus on tähtis kõike korraga näha, seal ta sobib; kus on tähtis kaugust täpselt hinnata, seal ta petab.",
    ],
    figure: "kr-vaatevali",
  },
  {
    type: "predict",
    id: "predict-1",
    title: "Paku oma ennustus",
    body: [
      `Ristmikul on ${formatNumber(MIRROR_DIAMETER_CM)} cm läbimõõduga kumer peegel. Keegi vahetab selle sama suure TASASE peegli vastu.`,
    ],
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt: "Mida juht nüüd peeglis näeb?",
        options: [
          {
            id: "sama-palju",
            text: "Sama palju teed kui enne, ainult teravamalt",
            correct: false,
            misconception: "peegli-suurus-maarab-vaatevalja",
          },
          {
            id: "kitsam",
            text: "Palju kitsamat lõiku teest",
            correct: true,
          },
          {
            id: "laiem-vaiksem",
            text: "Laiemat lõiku teest, aga kõike väiksemana",
            correct: false,
            misconception: "tasapeegel-naitab-rohkem",
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
    title: "Uuri poe vahekäiguga",
    body: [
      `Vaade on ÜLALT poe vahekäigule. Vasakul seinal on ${formatNumber(MIRROR_DIAMETER_CM)} cm läbimõõduga peegel – see suurus on kogu aeg sama ja liuguriga ei muutu. Katkendlik joon on peatelg, tema peal seisab müüja.`,
      `Peeglist ${width(metresFromCentimetres(AISLE_DISTANCE_CM))} m kaugusel jookseb vahekäigu joon. Ekraanil on korraga MÕLEMA peegli vaateväli: kumerpeegli lai lehvik ja sama suure tasapeegli kitsas lehvik, eri värvi ja eri joonemustriga. Mõlema lehviku lõik vahekäigu joonel on eraldi mõõdujoone ja arvuga.`,
      "Liuguritega saad muuta peegli kõverusraadiust ja müüja kaugust peeglist. Peegel on siin otse seina peal. Päris poes on ta nurga all – see muudab, KUHU vaateväli osutab, mitte kui LAI ta on.",
    ],
    questions: [
      {
        kind: "numeric",
        id: "explore-1",
        prompt: `Jäta raadiuseks ${formatNumber(START_RADIUS_CM)} cm ja müüja kauguseks ${formatNumber(START_EYE_CM)} cm. Kui pika lõigu vahekäigust näeb müüja KUMERPEEGLIS?`,
        hints: [
          "Vaata laia lehviku mõõdujoont vahekäigu peal.",
          "Arv on kastikeses „Kumerpeegel\".",
        ],
        unit: "m",
        tolerance: READING_TOLERANCE,
        answer: START_CONVEX_M,
      },
      {
        kind: "numeric",
        id: "explore-2",
        prompt:
          "Sama seis, aga vaata nüüd TASAPEEGLI lehvikut. Kui pika lõigu näeks müüja sama suures tasases peeglis?",
        hints: ["Kitsas lehvik ulatub vahekäigul ainult ühe riiuli jagu."],
        unit: "m",
        tolerance: READING_TOLERANCE,
        answer: START_FLAT_M,
      },
      {
        kind: "choice",
        id: "explore-3",
        // Kaks eelmist ülesannet ei liigutanud liugureid, seega on seis endine.
        // Raadius öeldakse siin sellegipoolest välja, sest ülesanne PALUB teda
        // muuta – õpilane peab teadma, kust kuhu (sama õppetund mis moodulis
        // kumerpeegel, samm 4.1pp).
        prompt: `Lohista raadius ${formatNumber(START_RADIUS_CM)} cm pealt ${formatNumber(FLATTER_RADIUS_CM)} cm peale – peegel läheb lamedamaks. Mis juhtub kumerpeegli vaateväljaga?`,
        hints: [
          "Mida kumeram peegel, seda lähemal on tema näiline fookus ja seda enam ta valgust hajutab – kõige lamedam peegel ongi tasapeegel.",
        ],
        options: [
          {
            id: "laiemaks",
            text: "Läheb laiemaks",
            correct: false,
            misconception: "lamedam-vaatevali-laiem",
          },
          {
            id: "kitsamaks",
            text: `Läheb kitsamaks ja liigub tasapeegli oma poole: nähtav lõik kahaneb ${width(START_CONVEX_M)} m pealt ${width(FLATTER_CONVEX_M)} m peale. Lamedam peegel hajutab vähem – tema näiline fookus on kaugemal –, seega mahub temasse vähem. Kõige lamedam peegel ongi tasane`,
            correct: true,
          },
          {
            id: "ei-muutu",
            text: "Ei muutu, sest peegli suurus jäi samaks",
            correct: false,
            misconception: "peegli-suurus-maarab-vaatevalja",
          },
        ],
      },
      {
        kind: "numeric",
        id: "explore-4",
        prompt: `Sea raadius ${formatNumber(START_RADIUS_CM)} cm peale tagasi ja vii müüja ${formatNumber(FAR_EYE_CM)} cm kaugusele. Mitu korda pikema lõigu näeb ta nüüd kumerpeeglis kui tasapeeglis?`,
        hints: [
          "Jaga kumerpeegli arv tasapeegli arvuga – mõlemad on meetrites, mitte kraadides.",
          `${width(FAR_CONVEX_M)} m ja ${width(FAR_FLAT_M)} m.`,
        ],
        // Ühikut ei ole: meeter jagatud meetriga on paljas arv.
        tolerance: RATIO_TOLERANCE,
        answer: FAR_RATIO,
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
        "Miks pannakse ristmiku vastasnurka just kumer peegel, mitte sama suur tasane?",
      solution: [
        `Juht on peeglist kaugel – umbes ${formatNumber(WORKED_EYE_CM / 100)} m – ja ristuv tee jookseb peeglist ${formatNumber(WORKED_ROAD_CM / 100)} m kaugusel.`,
        `Sama suur tasapeegel näitaks talle sellelt kauguselt ristuvast teest ainult ${width(WORKED_FLAT_M)} m pikkust lõiku: täpselt seda kohta, kuhu peegel juhtub olema suunatud.`,
        `Kumer pind hajutab valgust, seega jõuab peeglisse valgust palju laiemast alast ja sama peegel näitab ${width(WORKED_CONVEX_M)} m pikkust lõiku – terve ristmik korraga.`,
      ],
      answer: `Sest kumer peegel annab sama suure peegli juures palju laiema vaatevälja (${width(WORKED_CONVEX_M)} m ${width(WORKED_FLAT_M)} m asemel). Hind: autod paistavad peeglis väikesed ja tunduvad seetõttu kaugemal olevat, kui nad on.`,
    },
    questions: [
      {
        // Osaline: tehe on ees, vastus tuleb ise.
        kind: "numeric",
        id: "practice-1",
        prompt: `Ristmikul mõõdeti: kumerpeeglis on näha ${formatNumber(MEASURED_CONVEX_M)} m pikkune lõik ristuvast teest, sama suures tasapeeglis ${formatNumber(MEASURED_FLAT_M)} m. Mitu korda pikem lõik on kumerpeeglis? ${formatNumber(MEASURED_CONVEX_M)} : ${formatNumber(MEASURED_FLAT_M)} = ___`,
        hints: ["Jaga suurem arv väiksemaga."],
        tolerance: EXACT_RATIO_TOLERANCE,
        answer: MEASURED_RATIO,
      },
      {
        // Iseseisev: miks kumer peegel petab.
        kind: "choice",
        id: "practice-2",
        prompt:
          "Auto külgpeeglis paistab tagant tulev jalgrattur väiksem, kui ta päriselt on. Miks teeb see kauguse hindamise petlikuks?",
        hints: [
          "Peegel ise ei liiguta jalgratturit kuhugi – ta ainult näitab teda VÄIKSEMANA. Mida aju harjumuspäraselt väiksusest järeldab?",
        ],
        options: [
          {
            id: "viib-kaugemale",
            text: "Peegel viib jalgratturi päriselt kaugemale",
            correct: false,
            misconception: "peegel-muudab-kaugust",
          },
          {
            id: "aju-arvab",
            text: "Aju arvab, et väike asi on kaugel – seega tundub jalgrattur kaugemal olevat, kui ta on. Peegel ise ei liiguta midagi: ta ainult näitab kõike väiksemana",
            correct: true,
          },
          {
            id: "aeglustab",
            text: "Peegel aeglustab valgust, seega jõuab pilt hiljem kohale",
            correct: false,
            misconception: "peegel-aeglustab-valgust",
          },
        ],
      },
      {
        // Iseseisev, joonise lugemine.
        kind: "choice",
        id: "practice-3",
        figure: "kr-ristmik",
        prompt:
          "Vaata joonist: maja varjab juhil vaate vasakule ristuvale teele ja teisel pool teed on posti otsas ümar peegel. Peegli vaateväli on joonisel lai lehvik üle ristuva tee. Milliseid autosid näeb juht peeglis?",
        hints: ["Peeglis on näha see, mis jääb vaatevälja lehviku sisse."],
        // Autod A, B ja C on joonisel kindlas järjekorras – nende segamine
        // ekraanil lahutaks vastusevariandid joonisest.
        shuffle: false,
        options: [
          {
            id: "ainult-a",
            text: "Ainult autot A",
            correct: false,
          },
          {
            id: "a-ja-b",
            text: "Autosid A ja B – nemad jäävad lehviku sisse. Auto C jääb lehvikust välja ja teda ei näita ükski peegel; selle koha nimi on PIMEALA",
            correct: true,
          },
          {
            id: "koiki",
            text: "Kõiki kolme",
            correct: false,
            misconception: "kumerpeegel-naitab-koike",
          },
        ],
      },
      {
        // Ülekanne, mitu õiget: kuhu kumer peegel sobib.
        kind: "choice",
        id: "practice-4",
        prompt: "Kuhu sobib KUMER peegel?",
        hints: [
          "Kumer peegel hajutab valgust ja annab LAIA vaatevälja, aga väiksemana – see sobib sinna, kus tahetakse näha PALJU, mitte suurendada.",
        ],
        multiple: true,
        shuffle: true,
        options: [
          {
            id: "poe-koridor",
            text: "Poe koridori nurka, kus müüja tahab tervet vahekäiku korraga näha",
            correct: true,
          },
          {
            id: "parkla",
            text: "Parkla väljasõidule, kus vaade mõlemale poole on kinni",
            correct: true,
          },
          {
            id: "bussijuht",
            text: "Bussi juhi peegliks, mis näitab tervet tagumist ust",
            correct: true,
          },
          {
            id: "meigipeegel",
            text: "Meigipeegliks, kus nägu peab paistma suurena",
            correct: false,
            misconception: "kumer-suurendab",
          },
          {
            id: "teleskoop",
            text: "Teleskoobi peapeegliks, mis peab tähe valguse kokku koguma",
            correct: false,
            misconception: "kumer-koondab",
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
        prompt: "Miks pannakse poe koridori nurka kumer, mitte tasane peegel?",
        hints: ["Sama suur tasapeegel näitaks ainult ühte kitsast lõiku – mida teeb kumerus vaatevälja mõõtmega?"],
        options: [
          {
            id: "odavam",
            text: "Kumer peegel on odavam ja vastupidavam",
            correct: false,
          },
          {
            id: "hajutab",
            text: `Kumer peegel hajutab valgust, seega mahub temasse korraga laiem ala – simulatsioonis umbes ${formatNumber(START_RATIO)} korda pikem lõik vahekäigust, kuigi peegel oli täpselt sama suur`,
            correct: true,
          },
          {
            id: "suurendab",
            text: "Kumer peegel suurendab, seega on varas paremini näha",
            correct: false,
            misconception: "kumer-suurendab",
          },
        ],
      },
      {
        kind: "numeric",
        id: "exit-2",
        prompt: `Ühes kohas näitab tasapeegel teest ${width(EXIT_FLAT_M)} m laiust lõiku. Sama suur kumerpeegel näitab ${formatNumber(EXIT_FACTOR)} korda laiemat lõiku. Kui lai see on?`,
        hints: [`${formatNumber(EXIT_FACTOR)} korda laiem kui ${width(EXIT_FLAT_M)} m.`],
        unit: "m",
        tolerance: READING_TOLERANCE,
        answer: EXIT_CONVEX_M,
      },
      {
        kind: "text",
        id: "exit-3",
        prompt:
          "Sõber küsib: „Miks on auto külgpeeglile kirjutatud, et esemed on lähemal kui paistavad? Kas peegel valetab?\" Mida sa talle vastad?",
        minWords: 10,
      },
    ],
  },
];

/**
 * Kordamiskaardid (docs/MOODULILEPING.md „activities.ts – kordamiskaardid",
 * sisu/MOODUL-kumerpeegli-rakendused.md „Kordamiskaardid").
 *
 * rc-5 räägib meelega „väikesena paistmisest", mitte „väikesest kujutisest":
 * kujutise konstrueerimine ja tema suurus on gümnaasiumi asi ning sõna „kujutis"
 * ei kuulu selle mooduli õpilase poolele (vt faili päist).
 */
const reviewCards: ReviewCard[] = [
  {
    id: "rc-1",
    type: "transfer",
    question: "Miks on poe turvapeegel ja ristmikupeegel kumerad?",
    answer:
      "Kumer pind hajutab valgust, seega jõuab peeglisse valgust palju laiemast alast ja terve vahekäik või ristmik mahub väikesesse peeglisse korraga ära.",
  },
  {
    id: "rc-2",
    type: "concept",
    question: "Mis on peegli vaateväli?",
    answer:
      "Ala, mida peeglis korraga näha on. Sama suurel peeglil on ta seda laiem, mida kumeram peegel on.",
  },
  {
    id: "rc-3",
    type: "calc",
    question: `Tasapeegel näitab teest ${width(EXIT_FLAT_M)} m laiust lõiku, kumerpeegel ${formatNumber(EXIT_FACTOR)} korda laiemat. Kui lai lõik on kumerpeeglis?`,
    answer: `${width(EXIT_FLAT_M)} · ${formatNumber(EXIT_FACTOR)} = ${width(EXIT_CONVEX_M)} m.`,
  },
  {
    id: "rc-4",
    type: "explain",
    question:
      "Miks on auto külgpeeglil kiri „esemed on peeglis lähemal kui nad paistavad\"?",
    answer:
      "Kumer peegel näitab kõike väiksemana; aju arvab, et väike asi on kaugel, seega tundub tagant tulev auto kaugemal olevat, kui ta on. Peegel ise midagi ei muuda.",
  },
  {
    id: "rc-5",
    type: "transfer",
    question: "Kumb peegel sobib meigipeegliks ja kumb poe koridori nurka?",
    answer:
      "Meigipeegliks nõguspeegel (suurendab), koridori nurka kumerpeegel (lai vaateväli, aga kõik paistab seal väiksemana).",
  },
];

export const activities = defineActivities({ steps, reviewCards });
