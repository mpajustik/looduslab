import { defineActivities } from "../../../engine/contract";
import type { ReviewCard, Step } from "../../../engine/contract";
import { formatNumber } from "../../../lib/format";
import {
  MIRROR_DIAMETER_CM,
  SLIDERS,
  SUN_ANGULAR_DEG,
  WALL_DISTANCE_M,
  beamDiameter,
  focalLength,
  focalSpotDiameter,
  metresFromCentimetres,
  metresFromMillimetres,
  millimetresFromMetres,
  solarConcentration,
} from "./model";

/**
 * Sammud ja kordamiskaardid (docs/MOODULILEPING.md,
 * sisu/MOODUL-noguspeegli-rakendused.md).
 *
 * **Ükski valgusringi laius, valgusplekk ega koondumistegur ei ole siia
 * käsitsi kirjutatud** – kõik tulevad `model.ts`-i valemitest (CLAUDE.md
 * reegel 1), nii et ülesande vastus ja simulatsiooni näit ei saa kunagi lahku
 * minna. Testis (tests/noguspeegli-rakendused.model.test.ts) võrreldakse neid
 * arve SPETSIFIKATSIOONI tabeliga, mitte activities.ts iseendaga.
 *
 * **Ühikud.** Mudel arvutab meetrites, õpilane räägib peegli mõõtudest
 * sentimeetrites, pirni suurusest ja valgusplekist millimeetrites ning
 * valgusringi laiusest meetrites. Ühik muutub AINULT mudeli
 * teisendusfunktsioonides – siin failis on nad kahes abifunktsioonis
 * (`beamWidthM`, `spotMm`), et ükski küsimus ei saaks teisendust vahele jätta.
 *
 * **Ekraanil on valgusringi laiused KAHE kohaga peale koma** ja see on otsus,
 * mitte lohakus. Spetsifikatsioon ütleb küll „ühe kohaga", aga tema enda
 * ülesanded nõuavad kahte: explore-3 lõpeb 0,23 m juures ja explore-4 0,17 m
 * juures ning ühe kohaga oleksid MÕLEMAD ekraanil „0,2 m". Siis ei saaks
 * õpilane kolmandat ülesannet neljandast eristada ega neljandat üldse
 * lahendada. Tolerants (0,2 m) jääb sellest hoolimata endiseks – ta lubab
 * lugemisviga, mitte kolmanda koha täpsust.
 *
 * **Piirid, mida see moodul EI ületa:** siin ei konstrueerita ühtegi kujutist
 * ega arvutata suurendust (gümnaasium ja P2 läätsede teema) ning ühtegi uut
 * langemis- või peegeldumisnurga ülesannet ei ole (moodul `noguspeegel`).
 * Sõna „kujutis" ei ole õpilase pooles kusagil ja ükski arvküsimus ei ole
 * kraadides – õpilase enda tehted on ainult jagamine, korrutamine ja
 * ruutuvõtmine. Mõlemat valvab test.
 */

const MIRROR_DIAMETER_M = metresFromCentimetres(MIRROR_DIAMETER_CM);

/** Valgusringi läbimõõt (m) seina peal – ainus tee mudelisse. */
function beamWidthM(radiusCm: number, sourceSizeMm: number): number {
  return beamDiameter(
    MIRROR_DIAMETER_M,
    focalLength(metresFromCentimetres(radiusCm)),
    metresFromMillimetres(sourceSizeMm),
    WALL_DISTANCE_M,
  );
}

/** Päikese valgusplekk fookuses (mm) – teine tee samasse mudelisse. */
function spotMm(focalLengthM: number): number {
  return millimetresFromMetres(
    focalSpotDiameter(focalLengthM, SUN_ANGULAR_DEG),
  );
}

/**
 * Laius ekraanile: kaks kohta peale koma, eesti kümnendkomaga.
 *
 * Vastuse VÄÄRTUS jääb ümardamata – checker võrdleb ise tolerantsiga.
 * Ümardamine käib ainult teksti sees, muidu satuks ujukoma jääk õpilase
 * lausesse.
 */
const width = (valueM: number): string => formatNumber(valueM, 2);

/** Valgusplekk ja pirni suurus ekraanile: üks koht peale koma, millimeetrites. */
const spot = (valueMm: number): string => formatNumber(valueMm, 1);

/** Suhtarv jutu sisse: üks koht peale koma. */
const times = (value: number): string => formatNumber(value, 1);

/**
 * Koondumistegur jutu sisse: ümardatud sajalisteni.
 *
 * „Umbes 11 555 korda" oleks iseendaga vastuolus – kui juba „umbes", siis
 * ümmargune arv. Ümardamine käib ainult TEKSTIS; ülesande vastus ja tolerants
 * jäävad mudeli täpsete arvude peale (practice-1).
 */
const about = (value: number): string =>
  formatNumber(Math.round(value / 100) * 100);

// --- Simulatsiooni seisud ja nende vastused (vastused mudelist) -------------

/** Algseis: mõlemad liugurid oma algväärtustel (explore-1). */
const START_RADIUS_CM = SLIDERS.radiusCm.min;
const START_SOURCE_MM = 2;
const START_BEAM_M = beamWidthM(START_RADIUS_CM, START_SOURCE_MM);

/**
 * Ideaalne punktallikas: sama seis, aga s = 0.
 *
 * See arv on ekraanil kogu aeg („Ideaalse punktallikaga oleks") ja ta ongi
 * kogu mooduli lähtekoht: vihk jääks igal kaugusel peegli laiuseks. Mudel
 * lubab s = 0 meelega – vt model.ts `assertNotNegative`.
 */
const POINT_SOURCE_BEAM_M = beamDiameter(
  MIRROR_DIAMETER_M,
  focalLength(metresFromCentimetres(START_RADIUS_CM)),
  0,
  WALL_DISTANCE_M,
);

/** Hõõgniit LED-i asemel (explore-2): sama peegel, viis korda suurem allikas. */
const FILAMENT_MM = 10;
const FILAMENT_BEAM_M = beamWidthM(START_RADIUS_CM, FILAMENT_MM);

/** Lamedam peegel (explore-3): raadiuse liuguri kõige ülemine seis. */
const FLATTER_RADIUS_CM = SLIDERS.radiusCm.max;
const FLATTER_BEAM_M = beamWidthM(FLATTER_RADIUS_CM, START_SOURCE_MM);

/** Parim seis liuguritel (explore-4): lamedaim peegel + väikseim pirn. */
const SMALLEST_SOURCE_MM = SLIDERS.sourceSizeMm.min;
const BEST_BEAM_M = beamWidthM(FLATTER_RADIUS_CM, SMALLEST_SOURCE_MM);

/**
 * Mitu korda kitsam on parim seis algseisust – explore-sammu kokkuvõte.
 *
 * Jagatakse ümardamata arvudega, ümardatakse alles tekstis. See on LAIUSTE
 * suhe: lahtiminekute suhe on sama seisu juures kuus ja tolerants ei tohi teda
 * sisse lasta (vt RATIO_TOLERANCE).
 */
const NARROW_RATIO = START_BEAM_M / BEST_BEAM_M;

// --- Päikeseahi ja teleskoop (practice, exit) -------------------------------

/** Lahendatud näidis: päikeseahi, peegel 1 m lai ja fookuskaugus 1 m. */
const OVEN_DIAMETER_M = 1;
const OVEN_FOCAL_M = 1;
const OVEN_SPOT_MM = spotMm(OVEN_FOCAL_M);
const OVEN_RATIO =
  OVEN_DIAMETER_M / focalSpotDiameter(OVEN_FOCAL_M, SUN_ANGULAR_DEG);
const OVEN_CONCENTRATION = solarConcentration(OVEN_DIAMETER_M, OVEN_FOCAL_M);

/** Osaline ülesanne (practice-1): kaks korda pikem fookuskaugus. */
const LONG_FOCAL_M = 2;
const LONG_SPOT_MM = spotMm(LONG_FOCAL_M);
const LONG_RATIO =
  OVEN_DIAMETER_M / focalSpotDiameter(LONG_FOCAL_M, SUN_ANGULAR_DEG);
const LONG_CONCENTRATION = solarConcentration(OVEN_DIAMETER_M, LONG_FOCAL_M);

/**
 * Väike päikeseahi (practice-2): kümme korda väiksem peegel JA kümme korda
 * lühem fookuskaugus.
 *
 * Sama suhe D : f, seega mudeli invariandi järgi täpselt sama koondumistegur.
 * See on mooduli kõige üllatavam väide ja ainus koht, kus õpilase intuitsioon
 * („suurem peegel koondab tihedamalt") päriselt ümber lükatakse.
 */
const SMALL_OVEN_DIAMETER_M = 0.1;
const SMALL_OVEN_FOCAL_M = 0.1;
const SMALL_OVEN_CONCENTRATION = solarConcentration(
  SMALL_OVEN_DIAMETER_M,
  SMALL_OVEN_FOCAL_M,
);

/** Väljumispilet (exit-2): 50 cm fookuskaugusega peegel ja tema kahekordne. */
const EXIT_SHORT_FOCAL_M = 0.5;
const EXIT_SHORT_SPOT_MM = spotMm(EXIT_SHORT_FOCAL_M);
const EXIT_LONG_FOCAL_M = EXIT_SHORT_FOCAL_M * 2;
const EXIT_LONG_SPOT_MM = spotMm(EXIT_LONG_FOCAL_M);

// --- Tolerantsid ------------------------------------------------------------

/**
 * Lugemistolerants, MITTE mõõtemääramatus: simulatsioon on ideaalne, aga
 * õpilane loeb mõõdujoont ja tipib käsitsi. 0,2 m lubab lugemisvea, aga hoiab
 * LED-i (0,50 m) ja hõõgniidi (2,10 m) arvud kaugel teineteisest.
 */
const READING_TOLERANCE = { mode: "absolute", value: 0.2 } as const;

/**
 * Suhtarv: tolerants 1, sest õpilane jagab ekraanilt loetud ümardatud arve.
 *
 * 0,50 : 0,17 = 2,9 ja 0,5 : 0,166 = 3,0 – mõlemad peavad olema õiged.
 * LAHTIMINEKUTE suhe on samas seisus 6 (0,40 m : 0,067 m) ja jääb sellest
 * kaugele välja, seega vale tehe ei lipsa läbi. Just see kaks arvu segi ajamine
 * on spetsifikatsiooni hoiatus („lahtimineku suhe ja laiuse suhe on kaks eri
 * arvu").
 */
const RATIO_TOLERANCE = { mode: "absolute", value: 1 } as const;

/**
 * Koondumistegur: tolerants 200, sest õpilane korrutab ümardatud arvu (53,7)
 * iseendaga ja saab 2884, mitte 2889.
 *
 * Kaks korda pikema fookuse õige vastus (2889) ja algse peegli oma (11 555)
 * on teineteisest neli korda kaugemal, seega vale peegli arv ei mahu tolerantsi
 * sisse ka pool sammu kõrvalt.
 */
const CONCENTRATION_TOLERANCE = { mode: "absolute", value: 200 } as const;

/**
 * Valgusplekk millimeetrites: tolerants 0,5 mm.
 *
 * Õige vastus on 9,3 mm ja lähim vale (poole lühem fookus, 4,7 mm) jääb
 * neli millimeetrit eemale – tolerants ei tohi neid kokku lasta.
 */
const SPOT_TOLERANCE = { mode: "absolute", value: 0.5 } as const;

const steps: Step[] = [
  {
    type: "hook",
    id: "hook-1",
    // Joonis näitab ainult kolme seadet, mille sees on sama peegel. MIKS ta
    // seal on, ütlevad teooria ja simulatsioon – hook ei tohi vastust ette
    // öelda.
    figure: "nr-kolm-seadet",
    title: "Üks peegel, kolm hoopis eri asja",
    body: [
      "Taskulamp mahub taskusse, peegelteleskoop kaalub tonne ja päikeseahi sulatab terast. Ometi on kõigis kolmes täpselt sama asi: nõgus peegel.",
      "Kuidas saab üks ja sama peegel korraga valgust välja saata ja kokku koguda?",
      "Täna saad teada, miks nendes seadmetes on just nõgus peegel – ja miks isegi kõige parema taskulambi kiir läheb kaugusega ikkagi laiali.",
    ],
  },
  {
    type: "theory",
    id: "theory-1",
    title: "Üks peegel, kaks suunda",
    body: [
      "Meeldetuletus eelmisest moodulist: nõguspeegel on kera SISEMINE pind. Peateljega paralleelsed kiired koonduvad peale peegeldumist ühte punkti – fookusesse –, mis on poole kõverusraadiuse kaugusel peegli tipust. Kogu tänane moodul tuleb sellest ainsast asjast.",
      "SUUND 1: FOOKUSEST VÄLJA. Pane valgusallikas fookusesse ja käi sama teed tagurpidi: peeglilt lähevad kiired välja peateljega PARALLEELSELT. Valgus, mis oleks muidu igasse suunda laiali läinud, läheb nüüd ühte suunda. Nii teevad taskulamp, auto esituli ja prožektor.",
      "SUUND 2: PARALLEELSELT SISSE. Väga kaugelt – Päikeselt või tähelt – tulev valgus on peaaegu paralleelne ja koondub peeglilt fookusesse. Kogu suure peegli püütud valgus tuleb kokku ühte väikesesse kohta. Nii teevad peegelteleskoop, satelliittaldrik ja päikeseahi.",
      "Üks lause seob need kaks kokku: valguse tee on pööratav. Sama peegel, sama fookus – vahe on ainult selles, kummast otsast valgus tuleb.",
      "HIND: ALLIKAS EI OLE PUNKT. Päris pirnil on suurus (LED-i kiip 2 mm, hõõgniit 10 mm) ja Päike paistab taevas kettana. Seepärast ei ole ükski vihk päriselt paralleelne ja ükski plekk ei ole päriselt punkt. Mida väiksem allikas ja mida pikem fookuskaugus, seda kitsam kiir.",
      "MIDA PEEGLI SUURUS TEEB JA MIDA EI TEE. Suurem peegel püüab rohkem valgust kinni – teleskoop näeb hämaramaid tähti, päikeseahi saab rohkem energiat. Kaugele minevat kiirt ta kitsamaks EI tee: peegli enda läbimõõt liidetakse valgusringile juurde, ta ei vähenda lahtiminekut.",
      "Koondumisega on peenem lugu. Tihedus sõltub ainult SUHTEST läbimõõt : fookuskaugus. Kui peeglit suurendada nii, et fookuskaugus jääb samaks, koondub valgus küll tihedamaks – peegel läheb „sügavamaks\". Kui aga suurendada mõlemat ühepalju, jääb tihedus täpselt samaks ja kasvab ainult püütud valguse hulk. Just seda vahet – „kui tihe\" ja „kui palju\" – ajab enamik segi.",
    ],
    figure: "nr-kaks-suunda",
  },
  {
    type: "predict",
    id: "predict-1",
    title: "Paku oma ennustus",
    body: [
      `Kaks taskulampi on täpselt ühesugused: sama peegel, sama fookuskaugus. Ainus vahe on pirnis – ühes on ${formatNumber(START_SOURCE_MM)} mm LED-kiip, teises ${formatNumber(FILAMENT_MM)} mm hõõgniit.`,
    ],
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt: `Kumma valgusring on ${formatNumber(WALL_DISTANCE_M)} m kaugusel seinal kitsam?`,
        options: [
          {
            id: "led",
            text: "LED-lambi oma – väiksem allikas annab kitsama kiire",
            correct: true,
          },
          {
            id: "hoogpirn",
            text: "Hõõgpirni oma – suurem pirn annab tugevama ja seega kitsama kiire",
            correct: false,
            misconception: "suurem-allikas-kitsam-kiir",
          },
          {
            id: "uhesugused",
            text: "Mõlemad on ühesugused, sest peegel on sama",
            correct: false,
            misconception: "peegel-maarab-koik",
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
    title: "Uuri prožektoriga",
    body: [
      `Vaade on KÜLJELT prožektorile. Vasakul on nõgus peegel läbimõõduga ${formatNumber(MIRROR_DIAMETER_CM)} cm – see suurus on kogu aeg sama ja liuguriga ei muutu. Katkendlik joon on peatelg.`,
      "Fookuses on pirn ja tema suurust saad liuguriga muuta. Pirn on ALATI fookuses: raadiust muutes liigub fookuse koht ja pirn liigub temaga kaasa.",
      `Paremal on ${formatNumber(WALL_DISTANCE_M)} m kaugusel sein. Ekraanil on korraga KAKS vihku: päris vihk (allika suurusega, läheb laiali) ja õhem ideaalne vihk, mis tuleks punktallikast ja jääks igal kaugusel peegli laiuseks ehk ${width(POINT_SOURCE_BEAM_M)} m. Nad on eri värvi ja eri joonemustriga; vahe nende kahe vahel ongi selle mooduli „hind".`,
    ],
    questions: [
      {
        kind: "numeric",
        id: "explore-1",
        prompt: `Jäta raadiuseks ${formatNumber(START_RADIUS_CM)} cm ja pirni suuruseks ${formatNumber(START_SOURCE_MM)} mm. Kui lai on valgusring ${formatNumber(WALL_DISTANCE_M)} m kaugusel seinal?`,
        hints: [
          "Vaata mõõdujoont seina peal.",
          "Arv on kastikeses „Valgusring seinal\".",
        ],
        unit: "m",
        tolerance: READING_TOLERANCE,
        answer: START_BEAM_M,
      },
      {
        kind: "numeric",
        id: "explore-2",
        prompt: `Vaheta pirn suuremaks: sea suuruseks ${formatNumber(FILAMENT_MM)} mm (hõõgniit). Kui lai on valgusring nüüd?`,
        hints: ["Peegel ei muutunud – muutus ainult pirn."],
        unit: "m",
        tolerance: READING_TOLERANCE,
        answer: FILAMENT_BEAM_M,
      },
      {
        kind: "choice",
        id: "explore-3",
        // Ülesanne PALUB liugureid liigutada, seega on mõlema seis tekstis
        // välja öeldud – õpilane peab teadma, kust kuhu (sama õppetund mis
        // moodulites kumerpeegel ja noguspeegel, sammud 4.1pp ja 4.1tt).
        prompt: `Sea pirn ${formatNumber(START_SOURCE_MM)} mm peale tagasi ja lohista raadius ${formatNumber(START_RADIUS_CM)} cm pealt ${formatNumber(FLATTER_RADIUS_CM)} cm peale – peegel läheb lamedamaks ja fookus kaugemale. Mis juhtub valgusringiga?`,
        options: [
          {
            id: "laiemaks",
            text: "Läheb laiemaks, sest lamedam peegel koondab vähem",
            correct: false,
            misconception: "lamedam-peegel-laiem-kiir",
          },
          {
            id: "kitsamaks",
            text: `Läheb kitsamaks: ${width(START_BEAM_M)} m pealt ${width(FLATTER_BEAM_M)} m peale. Mida kaugemal fookus on, seda väiksema nurga alt sama suur pirn peeglilt paistab – ja seda vähem läheb vihk laiali. Kitsast kiirt tahtev prožektor tehakse seepärast pikk, mitte sügav`,
            correct: true,
          },
          {
            id: "ei-muutu",
            text: "Ei muutu, sest pirn on ikka fookuses",
            correct: false,
            misconception: "peegel-maarab-koik",
          },
        ],
      },
      {
        kind: "numeric",
        id: "explore-4",
        prompt: `Jäta raadius ${formatNumber(FLATTER_RADIUS_CM)} cm ja sea pirni suurus ${formatNumber(SMALLEST_SOURCE_MM)} mm. Mitu korda kitsam on valgusring kui esimeses ülesandes (${width(START_BEAM_M)} m)?`,
        hints: [
          "Jaga esimese ülesande arv uue arvuga.",
          `${width(START_BEAM_M)} m ja ${width(BEST_BEAM_M)} m.`,
        ],
        // Ühikut ei ole: meeter jagatud meetriga on paljas arv.
        tolerance: RATIO_TOLERANCE,
        answer: NARROW_RATIO,
      },
    ],
  },
  {
    type: "practice",
    id: "practice-1",
    title: "Proovi ise järele",
    // Näidis on LAHENDATUD ülesanne, mitte küsimus (docs/MOODULILEPING.md).
    worked: {
      prompt: `Päikeseahju peegli läbimõõt on ${formatNumber(OVEN_DIAMETER_M)} m ja fookuskaugus ${formatNumber(OVEN_FOCAL_M)} m. Miks tekib fookuses nii kuum koht?`,
      solution: [
        `Päike ei ole punkt: ta paistab taevas ${formatNumber(SUN_ANGULAR_DEG, 3)}° laiuse kettana. Seepärast ei koondu tema valgus punkti, vaid ${spot(OVEN_SPOT_MM)} mm laiusesse plekki.`,
        `Peeglile langeb valgust ${formatNumber(OVEN_DIAMETER_M)} m laiuselt ringilt ja kogu see valgus surutakse sellesse plekki: läbimõõt on ${times(OVEN_RATIO)} korda väiksem.`,
        `Pindala väheneb ruudus: ${times(OVEN_RATIO)} · ${times(OVEN_RATIO)} ehk umbes ${about(OVEN_CONCENTRATION)} korda. Sama palju kordi tihedamaks valgus koondub – ja nii tuleb temperatuur, mis sulatab metalli.`,
      ],
      answer: `Sest kogu ${formatNumber(OVEN_DIAMETER_M)} m laiuse peegli valgus surutakse ${spot(OVEN_SPOT_MM)} mm laiusesse plekki: valgus koondub umbes ${about(OVEN_CONCENTRATION)} korda tihedamaks. Punktiks ei koondu ta kunagi, sest Päike ise ei ole punkt.`,
    },
    questions: [
      {
        // Osaline: tehe on ees, vastus tuleb ise.
        kind: "numeric",
        id: "practice-1",
        prompt: `Sama peegli asemel võetakse kaks korda pikema fookuskaugusega peegel (läbimõõt ${formatNumber(OVEN_DIAMETER_M)} m, fookuskaugus ${formatNumber(LONG_FOCAL_M)} m). Valgusplekk on nüüd kaks korda laiem ehk ${spot(LONG_SPOT_MM)} mm. Mitu korda tihedamaks valgus koondub? ${formatNumber(OVEN_DIAMETER_M)} : ${formatNumber(LONG_SPOT_MM / 1000, 5)} = ${times(LONG_RATIO)} ja ${times(LONG_RATIO)} · ${times(LONG_RATIO)} = ___`,
        hints: [`Korruta ${times(LONG_RATIO)} iseendaga.`],
        tolerance: CONCENTRATION_TOLERANCE,
        answer: LONG_CONCENTRATION,
      },
      {
        // Iseseisev: mooduli kõige üllatavam väide.
        kind: "choice",
        id: "practice-2",
        prompt: `Kaks päikeseahju: ühe peegel on ${formatNumber(OVEN_DIAMETER_M)} m lai ja fookuskaugus ${formatNumber(OVEN_FOCAL_M)} m, teise peegel ${formatNumber(SMALL_OVEN_DIAMETER_M * 100)} cm lai ja fookuskaugus ${formatNumber(SMALL_OVEN_FOCAL_M * 100)} cm. Kummas koondub valgus TIHEDAMAKS?`,
        options: [
          {
            id: "suures",
            text: "Suures – suurem peegel koondab alati tihedamalt",
            correct: false,
            misconception: "suurem-peegel-koondab-tihedamalt",
          },
          {
            id: "kummaski-mitte",
            text: `Kummaski ei ole tihedam: mõlemal on sama suhe läbimõõt : fookuskaugus, seega sama koondumistegur ehk umbes ${about(SMALL_OVEN_CONCENTRATION)} korda. Suur peegel püüab lihtsalt palju rohkem valgust kinni – tema plekk on võimsam, mitte tihedam`,
            correct: true,
          },
          {
            id: "vaikeses",
            text: "Väikeses, sest väiksem plekk on alati tihedam",
            correct: false,
            misconception: "vaiksem-plekk-tihedam",
          },
        ],
      },
      {
        // Iseseisev: kogu mooduli „hind" ühe küsimusena.
        kind: "choice",
        id: "practice-3",
        prompt:
          "Miks ei ole ühegi taskulambi kiir päriselt paralleelne, isegi kui pirn on täpselt fookuses?",
        options: [
          {
            id: "must-peegel",
            text: "Sest peegel ei ole kunagi päris puhas",
            correct: false,
          },
          {
            id: "pirnil-on-suurus",
            text: "Sest pirnil on suurus – ta ei ole punkt, ja iga tema punkt annab veidi eri suunda mineva kimbu",
            correct: true,
          },
          {
            id: "valgus-vasib",
            text: "Sest valgus väsib pika tee peal ära",
            correct: false,
            misconception: "valgus-vasib",
          },
        ],
      },
      {
        // Ülekanne, mitu õiget: kuhu nõgus peegel sobib.
        kind: "choice",
        id: "practice-4",
        prompt: "Kuhu sobib NÕGUS peegel?",
        multiple: true,
        shuffle: true,
        options: [
          {
            id: "taskulamp",
            text: "Taskulambi peegeldiks, mis peab valgust ühte suunda saatma",
            correct: true,
          },
          {
            id: "teleskoop",
            text: "Peegelteleskoobi peapeegliks, mis kogub tähe valgust kokku",
            correct: true,
          },
          {
            id: "hambaarst",
            text: "Hambaarsti peeglisse, mis näitab hammast suuremana",
            correct: true,
          },
          {
            id: "poe-koridor",
            text: "Poe koridori nurka, kus müüja tahab tervet vahekäiku korraga näha",
            correct: false,
            misconception: "nogus-annab-laia-vaate",
          },
          {
            id: "kulgpeegel",
            text: "Auto külgpeegliks, mis peab näitama tervet kõrvalrida",
            correct: false,
            misconception: "nogus-annab-laia-vaate",
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
        prompt: "Miks on taskulambis nõgus peegel?",
        options: [
          {
            id: "kaitse",
            text: "Et pirn oleks kaitstud",
            correct: false,
          },
          {
            id: "uhte-suunda",
            text: "Et pirni valgus, mis muidu läheks igasse suunda, läheks peeglilt tagasi ühte suunda – pirn on peegli fookuses",
            correct: true,
          },
          {
            id: "suurem",
            text: "Et pirn paistaks suurem",
            correct: false,
          },
        ],
      },
      {
        kind: "numeric",
        id: "exit-2",
        prompt: `Peegli fookuskaugus on ${formatNumber(EXIT_SHORT_FOCAL_M * 100)} cm. Päikese valgusplekk on tema fookuses ${spot(EXIT_SHORT_SPOT_MM)} mm lai. Kui lai oleks plekk kaks korda pikema fookuskaugusega peeglil?`,
        hints: ["Plekk kasvab fookuskaugusega võrdeliselt."],
        unit: "mm",
        tolerance: SPOT_TOLERANCE,
        answer: EXIT_LONG_SPOT_MM,
      },
      {
        kind: "text",
        id: "exit-3",
        prompt:
          "Sõber ütleb: „Ostan endale suurema taskulambi, siis ulatub kiir kaugemale ja jääb kitsam.\" Mis sa talle vastad?",
        minWords: 10,
      },
    ],
  },
];

/**
 * Kordamiskaardid (docs/MOODULILEPING.md „activities.ts – kordamiskaardid",
 * sisu/MOODUL-noguspeegli-rakendused.md „Kordamiskaardid").
 *
 * rc-4 arv tuleb mudelist, mitte tekstist: kordamiskaart on ainus koht, kus
 * õpilane näeb arvu ilma simulatsioonita, ja vale arv siin jääks märkamata.
 */
const reviewCards: ReviewCard[] = [
  {
    id: "rc-1",
    type: "transfer",
    question: "Miks on taskulambis ja auto esitules nõgus peegel?",
    answer:
      "Pirn on peegli fookuses, seega läheb tema valgus peeglilt tagasi peateljega paralleelselt – valgus, mis oleks muidu igasse suunda laiali läinud, läheb ühte suunda.",
  },
  {
    id: "rc-2",
    type: "concept",
    question: "Mis juhtub nõguspeeglile langeva paralleelse valgusvihuga?",
    answer:
      "Ta koondub fookusesse, mis on poole kõverusraadiuse kaugusel peegli tipust. Nii töötavad peegelteleskoop, satelliittaldrik ja päikeseahi.",
  },
  {
    id: "rc-3",
    type: "explain",
    question: "Miks ei ole ükski taskulambi kiir päriselt paralleelne?",
    answer:
      "Sest pirn ei ole punkt. Igast pirni punktist tuleb veidi eri suunda minev kimp, seega läheb vihk kaugusega laiali. Mida väiksem pirn ja mida pikem fookuskaugus, seda kitsam kiir.",
  },
  {
    id: "rc-4",
    type: "calc",
    question: `Peegli fookuskaugus on ${formatNumber(OVEN_FOCAL_M)} m. Kui lai on Päikese valgusplekk tema fookuses?`,
    answer: `Umbes ${spot(OVEN_SPOT_MM)} mm – Päike paistab ${formatNumber(SUN_ANGULAR_DEG, 3)}° laiuse kettana, mitte punktina.`,
  },
  {
    id: "rc-5",
    type: "transfer",
    question: "Kumb peegel sobib taskulampi ja kumb poe koridori nurka?",
    answer:
      "Taskulampi nõguspeegel (koondab valguse ühte suunda), koridori nurka kumerpeegel (lai vaateväli, aga kõik paistab väiksemana).",
  },
];

export const activities = defineActivities({ steps, reviewCards });
