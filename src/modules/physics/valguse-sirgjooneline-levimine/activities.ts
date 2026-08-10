import { defineActivities } from "../../../engine/contract";
import type { ReviewCard, Step } from "../../../engine/contract";
import {
  EXAMPLE_OBJECTS,
  SLIDERS,
  metersToCm,
  pinholeBoxDepth,
  pinholeImageHeight,
  pinholeMagnification,
} from "./model";

/**
 * Sammud ja kordamiskaardid (docs/MOODULILEPING.md,
 * sisu/MOODUL-valguse-sirgjooneline-levimine.md).
 *
 * Kogu moodul tugineb ühele lausele: ühtlases läbipaistvas keskkonnas levib
 * valgus mööda sirgjoont. Matemaatikat on siin täpselt kaks tehet – jagamine ja
 * korrutamine (sama otsus mis moodulis `valgusallikad`): 8. klass
 * arkustangensit ei tunne ja nõelaugukaamera ei vaja teda.
 *
 * Kõik arvulised vastused tulevad MUDELIST, mitte käsitsi kirjutatud arvudest
 * (CLAUDE.md reegel 1). Nii ei saa ülesande vastus ja simulatsiooni näit kunagi
 * lahku minna. Et see ei jääks iseennast kontrollivaks ringiks, loeb
 * tests/valguse-sirgjooneline-levimine.model.test.ts need arvud üle
 * SPETSIFIKATSIOONI tabeli järgi (2 cm · 3 cm · 10 cm · 5 cm · 0,4 m · 4,6 cm):
 * vale kõrgus või kaugus siin failis teeb testi punaseks, mitte ei jõua tundi.
 *
 * **Ühikud ei ole ühtlased ja see on meelega:** simulatsiooni ülesanne küsib
 * kujutist sentimeetrites, sest just nii seisab arv ekraanil, ülejäänud
 * arvküsimused meetrites, sest nende tekst annab arvud meetrites ja palub
 * tehte teha. Checker teisendab m ↔ cm ise (src/checker/number.ts), seega
 * „10 cm" ja „0,1 m" on mõlemad õiged – ühik küsimuse juures ütleb ainult,
 * mida ilma ühikuta kirjutatud arv tähendab.
 */

/** Simulatsiooni ülesanne 1 ja kordamiskaart rc-3: puu 6 m, 12 m kauguselt. */
const TREE = EXAMPLE_OBJECTS.puu;

/** Ülesanne 1: kambri sügavus 0,2 m → kujutis 10 cm. */
const TREE_DEPTH_M = 0.2;
const TREE_IMAGE_M = pinholeImageHeight(
  TREE.heightM,
  TREE.distanceM,
  TREE_DEPTH_M,
);
const TREE_IMAGE_CM = metersToCm(TREE_IMAGE_M);

/** Ülesanne 2 (pöördülesanne): sama puu, soovitud kujutis 20 cm. */
const TREE_WANTED_IMAGE_M = 0.2;
const TREE_WANTED_DEPTH_M = pinholeBoxDepth(
  TREE.heightM,
  TREE_WANTED_IMAGE_M,
  TREE.distanceM,
);

/** Lahendatud näidis ja kordamiskaart rc-3 kõrval: küünal 0,2 m, 1 m, kamber 0,1 m. */
const CANDLE = EXAMPLE_OBJECTS.kuunal;
const CANDLE_DEPTH_M = 0.1;
const CANDLE_IMAGE_M = pinholeImageHeight(
  CANDLE.heightM,
  CANDLE.distanceM,
  CANDLE_DEPTH_M,
);
/** Näidislahenduse teine rida: „kamber on 10 korda lühem kui kaugus". */
const CANDLE_SHRINK = 1 / pinholeMagnification(CANDLE.distanceM, CANDLE_DEPTH_M);

/** Harjutus 1: inimene 1,8 m 9 m kauguselt, kamber 0,15 m. */
const PERSON = EXAMPLE_OBJECTS.inimene;
const PERSON_DEPTH_M = 0.15;
const PERSON_IMAGE_M = pinholeImageHeight(
  PERSON.heightM,
  PERSON.distanceM,
  PERSON_DEPTH_M,
);
/** Vihje 2: „9 / 0,15 = 60, seega kujutis on 60 korda väiksem". */
const PERSON_SHRINK = 1 / pinholeMagnification(PERSON.distanceM, PERSON_DEPTH_M);

/**
 * Harjutus 3: Päikese laik puu all, oksad 5 m kõrgusel.
 *
 * Päike ei ole `EXAMPLE_OBJECTS`-is: teda ei saa kauguse liuguriga (0,5–40 m)
 * seada, seega simulatsiooni nupureal teda ei ole. Arvud on siin ikkagi päris
 * omad, mitte ümardatud suhe 108 – nii tuleb vastus samast valemist, mida
 * ülejäänud moodul kasutab, ja test saab kontrollida, et ümardatud suhtega
 * arvutatud õpilase vastus mahub tolerantsi sisse.
 */
const SUN = { heightM: 1.392e9, distanceM: 1.5e11 };
const SUN_BRANCH_HEIGHT_M = 5;
/** Ümardatud suhe, mille õpilane ülesandes ette saab (sama arv mis moodulis `valgusallikad`). */
const SUN_RATIO_ROUNDED = 108;
const SUN_SPOT_M = pinholeImageHeight(
  SUN.heightM,
  SUN.distanceM,
  SUN_BRANCH_HEIGHT_M,
);

/** Väljumispilet: maja 8 m, 40 m kaugusel, kamber 0,25 m. */
const HOUSE = EXAMPLE_OBJECTS.maja;
const HOUSE_DEPTH_M = 0.25;
const HOUSE_IMAGE_M = pinholeImageHeight(
  HOUSE.heightM,
  HOUSE.distanceM,
  HOUSE_DEPTH_M,
);

/** Eesti kombe järgi koma, mitte punkt: „0,02", mitte „0.02". */
function comma(value: number, decimals: number): string {
  return value.toFixed(decimals).replace(".", ",");
}

const steps: Step[] = [
  {
    type: "hook",
    id: "hook-1",
    // Joonis näitab laikude ja lehtede vahede KUJU, aga ei ütle, miks nad
    // erinevad – see ongi sammu küsimus.
    figure: "oo-puulaigud",
    title: "Miks ei ole laigud sakilised?",
    body: [
      "Vaata päikesepaistelisel päeval puu alla. Maapinnal on heledad laigud – ja nad on peaaegu täiuslikult ümmargused.",
      "Vaata siis üles: lehtede vahed, millest valgus läbi tuleb, ei ole ümmargused. Nad on sakilised ja igaüks isemoodi.",
      "Täna õpid joonistama, kuidas valgus läbi augu levib, ja arvutama, kui suur kujutis tekib.",
    ],
  },
  {
    type: "theory",
    id: "theory-1",
    title: "Vihk, kiir ja optiline keskkond",
    body: [
      "Valgusvihk on valguse joa see osa, mis kuhugi levib: taskulambi koonus udus, päikesekiirte kimp pilvede vahelt. Valguskiir on selle joonise MUDEL – joon, mille sihis valgus levib. Päris elus ühte üksikut kiirt ei ole, ta on meie abijoon.",
      "Vihk võib olla hajuv (lambist eemale laienev), paralleelne (väga kauge allikas, näiteks Päike) või koonduv. Punktvalgusallikast lähtub alati hajuv vihk.",
      "Optiline keskkond on aine, milles valgus levib: õhk, vesi, klaas, vaakum. Ühtlases läbipaistvas keskkonnas levib valgus mööda sirgjoont. Ühtlane tähendab, et keskkond on kõikjal ühesugune.",
      "Kui keskkond EI ole ühtlane, võib tee kõverduda: kuuma asfaldi kohal õhk vireleb ja kaugem pilt „ujub“, sest soe ja külm õhk juhivad valgust erinevalt. Sirgjoonelisus on seega tingimusega reegel, mitte igavene tõde.",
    ],
  },
  {
    type: "predict",
    id: "predict-1",
    title: "Paku oma ennustus",
    body: [
      "Papist karbi ühel seinal on nööpnõelaga tehtud auk, vastasseinal küpsetuspaber. Karp on suunatud põleva küünla poole.",
    ],
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt: "Mida on küpsetuspaberil näha?",
        options: [
          {
            id: "plekk",
            text: "Ainult ümmargune valgusplekk",
            correct: false,
            misconception: "auk-annab-augu-kuju",
          },
          {
            id: "pusti",
            text: "Küünla kujutis püstiselt",
            correct: false,
            misconception: "pea-peal-vajab-laatse",
          },
          { id: "peapeal", text: "Küünla kujutis pea peal", correct: true },
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
      "Vasakul on ese, keskel auguga sein ja paremal ekraan. Kaks kiirt – eseme tipust ja jalalt – lähevad läbi augu ja lõikuvad seal.",
      "Liuguritega saad muuta kaugust esemeni ja kambri sügavust; kolmas liugur – augu läbimõõt – ilmub pärast teist ülesannet. Joonisel on kambri sügavuse ja kujutise suhe päris, aga kaugus mitte: ese seisab alati mugaval kaugusel ja päris kaugus on kirjas arvuna.",
    ],
    questions: [
      {
        // Ülesanne 1: põhivalem liuguritega. Ühik on cm, sest just nii seisab
        // arv ekraanil – õpilane loeb ta näidikult, mitte ei arvuta peast.
        kind: "numeric",
        id: "explore-1",
        prompt: `Vali „puu“ (${comma(TREE.heightM, 0)} m kõrge, ${comma(TREE.distanceM, 0)} m kaugusel) ja sea kambri sügavuseks ${comma(TREE_DEPTH_M, 1)} m. Kui kõrge on kujutis?`,
        hints: [
          "Suur arv ekraani ülaosas ütleb kujutise kõrguse sentimeetrites.",
        ],
        unit: "cm",
        tolerance: { mode: "percent", value: 5 },
        answer: TREE_IMAGE_CM,
      },
      {
        // Ülesanne 2: pöördülesanne. Tolerants 5% on 0,02 m ehk kaks liuguri
        // sammu (samm on 0,01 m) – ohutu. LÜHEMA kambri korral tuleks anda
        // absoluutne tolerants ±0,01 m, sest 5% jääks siis liuguri sammust
        // väiksemaks ja õpilane ei saakski õigesse vahemikku (sama otsus mis
        // moodulis `valgusallikad` explore-2 juures).
        kind: "numeric",
        id: "explore-2",
        prompt: `Jäta puu paika ja tee kujutis ${comma(metersToCm(TREE_WANTED_IMAGE_M), 0)} cm kõrguseks. Kui sügav peab kamber olema?`,
        hints: [
          "Kujutis peab minema kaks korda kõrgemaks kui eelmises ülesandes. Mida tuleb siis kambriga teha?",
        ],
        unit: "m",
        tolerance: { mode: "percent", value: 5 },
        answer: TREE_WANTED_DEPTH_M,
      },
      {
        // Ülesanne 3: augu mõju on kvalitatiivne – seepärast on see valikküsimus
        // ja hägu arvu ei küsi keegi (seda valvab test).
        kind: "choice",
        id: "explore-3",
        prompt: `Jäta kamber ${comma(TREE_WANTED_DEPTH_M, 1)} m peale ja keera augu läbimõõt ${comma(SLIDERS.holeMm.min, 1)} mm-lt ${comma(SLIDERS.holeMm.max, 0)} mm-ni. Mis kujutisega juhtub?`,
        options: [
          {
            id: "suurem",
            text: "Läheb suuremaks",
            correct: false,
            misconception: "suurem-auk-suurem-kujutis",
          },
          { id: "udune", text: "Läheb heledamaks, aga uduseks", correct: true },
          { id: "pusti", text: "Läheb pea peale tagasi ehk püstiseks", correct: false },
        ],
      },
    ],
    // Augu liugur avaneb alles pärast ülesannet 2 (moodulileping: alguses max
    // kaks muudetavat suurust). Pedagoogiline põhjus on tähtsam kui reegel:
    // ülesanded 1 ja 2 näitavad, et kujutise SUURUS sõltub ainult kaugusest ja
    // kambrist. Kui auk oleks kohe käes, jääks õpilasel kergesti mulje, et ka
    // tema muudab suurust (väärarusaam `suurem-auk-suurem-kujutis`).
    simulation: {
      unlocks: [{ feature: "augu-labimoot", afterQuestion: "explore-2" }],
    },
  },
  {
    type: "practice",
    id: "practice-1",
    title: "Proovi ise järele",
    // Näidis on LAHENDATUD ülesanne, mitte küsimus (docs/MOODULILEPING.md).
    worked: {
      prompt: `Küünal on ${comma(CANDLE.heightM, 1)} m kõrge ja seisab ${comma(CANDLE.distanceM, 0)} m kaugusel. Kamber on ${comma(CANDLE_DEPTH_M, 1)} m sügav. Kui kõrge on kujutis?`,
      solution: [
        `Korruta eseme kõrgus kambri sügavusega ja jaga kaugusega: ${comma(CANDLE.heightM, 1)} · ${comma(CANDLE_DEPTH_M, 1)} / ${comma(CANDLE.distanceM, 0)} = ${comma(CANDLE_IMAGE_M, 2)} m.`,
        `${comma(CANDLE_IMAGE_M, 2)} m on ${comma(metersToCm(CANDLE_IMAGE_M), 0)} cm.`,
        `Sama asi sõnadega: kamber on ${comma(CANDLE_SHRINK, 0)} korda lühem kui kaugus, seega on kujutis ${comma(CANDLE_SHRINK, 0)} korda väiksem kui küünal.`,
      ],
      answer: `${comma(CANDLE_IMAGE_M, 2)} m ehk ${comma(metersToCm(CANDLE_IMAGE_M), 0)} cm`,
    },
    questions: [
      {
        // Osaline (spets p 2): tehe on ees, vastus tuleb ise.
        kind: "numeric",
        id: "practice-1",
        prompt: `Inimene on ${comma(PERSON.heightM, 1)} m pikk ja seisab ${comma(PERSON.distanceM, 0)} m kaugusel, kamber on ${comma(PERSON_DEPTH_M, 2)} m sügav. ${comma(PERSON.heightM, 1)} · ${comma(PERSON_DEPTH_M, 2)} / ${comma(PERSON.distanceM, 0)} = ___ m`,
        hints: [
          "Mitu korda on kaugus kambrist pikem?",
          `${comma(PERSON.distanceM, 0)} / ${comma(PERSON_DEPTH_M, 2)} = ${comma(PERSON_SHRINK, 0)}, seega on kujutis ${comma(PERSON_SHRINK, 0)} korda väiksem kui inimene.`,
        ],
        unit: "m",
        tolerance: { mode: "percent", value: 5 },
        answer: PERSON_IMAGE_M,
      },
      {
        // Iseseisev valik (spets p 3): hooki küsimuse vastus.
        kind: "choice",
        id: "practice-2",
        prompt:
          "Miks on puu all päikeselaigud ümmargused, kuigi lehtede vahed on sakilised?",
        options: [
          {
            id: "kujutis",
            text: "Iga vahe on nõelauk ja laik on Päikese ümmargune kujutis",
            correct: true,
          },
          {
            id: "painutab",
            text: "Valgus painutab vahe servades nurgad ümaraks",
            correct: false,
            misconception: "auk-annab-augu-kuju",
          },
          {
            id: "varjavad",
            text: "Lehed varjavad nurgad ära",
            correct: false,
            misconception: "auk-annab-augu-kuju",
          },
        ],
      },
      {
        // Iseseisev arvutus (spets p 4). Vastus tuleb PÄRIS arvudest, aga
        // õpilane arvutab ümardatud suhtega – 5% tolerants katab vahe kuhjaga
        // (seda kontrollib test).
        kind: "numeric",
        id: "practice-3",
        prompt: `Sama puu all on laigud maapinnast ${comma(SUN_BRANCH_HEIGHT_M, 0)} m kõrguste okste alt. Päikese kujutis on ${SUN_RATIO_ROUNDED} korda väiksem kui kaugus august. Kui suure läbimõõduga on laik?`,
        hints: [`${comma(SUN_BRANCH_HEIGHT_M, 0)} / ${SUN_RATIO_ROUNDED}`],
        unit: "m",
        tolerance: { mode: "percent", value: 5 },
        answer: SUN_SPOT_M,
      },
      {
        // Ülekanne (spets p 5), mitu õiget. `shuffle: true` on vaikimisi sees,
        // aga kirjas siin meelega: järjekord ei kanna siin tähendust ja
        // kordamisel ei tohi meelde jääda „kaks esimest".
        kind: "choice",
        id: "practice-4",
        prompt: "Millistel juhtudel EI levi valgus sirgjooneliselt?",
        multiple: true,
        shuffle: true,
        options: [
          { id: "asfalt", text: "Kuuma asfaldi kohal vireleva õhu sees", correct: true },
          {
            id: "klaas",
            text: "Puhtas klaasis",
            correct: false,
            misconception: "valgus-alati-sirge",
          },
          {
            id: "vesi",
            text: "Soolase ja mageda vee segunemispiiril",
            correct: true,
          },
          {
            id: "vaakum",
            text: "Vaakumis",
            correct: false,
            misconception: "valgus-alati-sirge",
          },
          {
            id: "uhtlane-ohk",
            text: "Ühtlases õhus",
            correct: false,
            misconception: "valgus-alati-sirge",
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
        prompt: "Valguskiir on…",
        options: [
          {
            id: "abijoon",
            text: "abijoon, mis näitab, mis sihis valgus levib",
            correct: true,
          },
          {
            id: "osake",
            text: "valguse kõige väiksem osake",
            correct: false,
            misconception: "kiir-on-asi",
          },
          {
            id: "vihk",
            text: "sama mis valgusvihk",
            correct: false,
            misconception: "kiir-on-asi",
          },
        ],
      },
      {
        kind: "numeric",
        id: "exit-2",
        prompt: `${comma(HOUSE.heightM, 0)} m kõrge maja on ${comma(HOUSE.distanceM, 0)} m kaugusel, kamber on ${comma(HOUSE_DEPTH_M, 2)} m sügav. Kui kõrge on kujutis?`,
        unit: "m",
        tolerance: { mode: "percent", value: 5 },
        answer: HOUSE_IMAGE_M,
      },
      {
        kind: "text",
        id: "exit-3",
        prompt:
          "Osalise päikesevarjutuse ajal on puu all olevad laigud poolkuu kujulised. Selgita, miks.",
        minWords: 10,
      },
    ],
  },
];

/**
 * Kordamiskaardid (docs/MOODULILEPING.md „activities.ts – kordamiskaardid",
 * sisu/MOODUL-valguse-sirgjooneline-levimine.md „Kordamiskaardid").
 */
const reviewCards: ReviewCard[] = [
  {
    id: "rc-1",
    type: "concept",
    question: "Mis vahe on valgusvihul ja valguskiirel?",
    answer:
      "Vihk on see osa valgusest, mis kuhugi levib (taskulambi koonus); kiir on joonise abijoon, mis näitab levimise sihti.",
  },
  {
    id: "rc-2",
    type: "concept",
    question: "Millises keskkonnas levib valgus sirgjooneliselt?",
    answer:
      "Ühtlases läbipaistvas optilises keskkonnas. Kui keskkond ei ole ühtlane – näiteks vireleb kuum õhk –, siis tee kõverdub.",
  },
  {
    id: "rc-3",
    type: "calc",
    question: `Puu on ${comma(TREE.heightM, 0)} m kõrge ja ${comma(TREE.distanceM, 0)} m kaugusel, kamber ${comma(TREE_DEPTH_M, 1)} m sügav. Kui kõrge on kujutis?`,
    answer: `${comma(TREE.heightM, 0)} · ${comma(TREE_DEPTH_M, 1)} / ${comma(TREE.distanceM, 0)} = ${comma(TREE_IMAGE_M, 1)} m ehk ${comma(TREE_IMAGE_CM, 0)} cm.`,
  },
  {
    id: "rc-4",
    type: "explain",
    question: "Miks on nõelaugukaamera kujutis pea peal?",
    answer:
      "Tipust tulev kiir läheb läbi augu alla ja jalast tulev üles – kiired lõikuvad augus. Läätse ei ole vaja, piisab sirgjoonelisest levimisest.",
  },
  {
    id: "rc-5",
    type: "transfer",
    question:
      "Miks on puu all päikeselaigud ümmargused ja osalise varjutuse ajal poolkuu kujulised?",
    answer:
      "Iga lehtede vahe on nõelauk ja laik on Päikese kujutis – laigu kuju on allika, mitte augu kuju.",
  },
];

export const activities = defineActivities({ steps, reviewCards });
