import { defineActivities } from "../../../engine/contract";
import type { ReviewCard, Step } from "../../../engine/contract";
import {
  EXAMPLE_SOURCES,
  POINT_SOURCE_MAX_DEG,
  apparentSizeDeg,
  pointSourceDistance,
} from "./model";

/**
 * Sammud ja kordamiskaardid (docs/MOODULILEPING.md,
 * sisu/MOODUL-valgusallikad.md).
 *
 * Kõik arvulised vastused tulevad MUDELIST, mitte käsitsi kirjutatud arvudest
 * (CLAUDE.md reegel 1). Nii ei saa ülesande vastus ja simulatsiooni näit
 * kunagi lahku minna – ka siis mitte, kui piir `POINT_SOURCE_MAX_DEG` kunagi
 * muutuks. Et see ei jääks iseennast kontrollivaks ringiks, loeb
 * tests/valgusallikad.model.test.ts need arvud üle SPETSIFIKATSIOONI tabeli
 * järgi (0,29° · 1,15° · 0,53° · 68,8 m): vale mõõde või kaugus siin failis
 * teeb testi punaseks, mitte ei jõua tundi.
 */

/** Harjutuse näidis ja kordamiskaart rc-4: LED 5 mm, 1 m kauguselt. */
const LED_1M_DEG = apparentSizeDeg(
  EXAMPLE_SOURCES.led.sizeM,
  EXAMPLE_SOURCES.led.distanceM,
);

/** Harjutus 2: lambipirn 0,08 m, 4 m kauguselt – esimene LAIENDATUD allikas. */
const BULB_4M_DEG = apparentSizeDeg(
  EXAMPLE_SOURCES.lambipirn.sizeM,
  EXAMPLE_SOURCES.lambipirn.distanceM,
);

/**
 * Simulatsiooni ülesanne 1: päevavalgustoru 1,2 m juures vähim kaugus,
 * millelt ta veel punktallikaks loeb (≈ 69 m).
 *
 * Toru näivat suurust 2 m kauguselt (33,4°) siin konstandina ei ole: seda
 * arvu õpilane ei kirjuta, ta loeb selle ekraanilt. Et ülesanne oleks üldse
 * lahendatav, peab toru 2 m kauguselt olema LAIENDATUD allikas – seda
 * kontrollib mudeli test `EXAMPLE_SOURCES` tabeli pealt.
 */
const TUBE_POINT_DISTANCE_M = pointSourceDistance(
  EXAMPLE_SOURCES.paevavalgustoru.sizeM,
);

/**
 * Simulatsiooni ülesanne 2: sama LED toodud 0,5 m kaugusele.
 *
 * Kaugus on siin kirjas, mitte `EXAMPLE_SOURCES`-is: näite kaugus on TÜÜPILINE
 * vaatluskaugus, ülesanne aga küsib meelega teist. Mõõde tuleb ikka näitest,
 * sest „5 mm LED" peab olema kõikjal sama keha.
 */
const LED_CLOSE_DISTANCE_M = 0.5;
const LED_CLOSE_DEG = apparentSizeDeg(
  EXAMPLE_SOURCES.led.sizeM,
  LED_CLOSE_DISTANCE_M,
);

/** Ennustuse ja harjutuse 4 tuum: Päike on 0,53° – alla piiri. */
const SUN_DEG = apparentSizeDeg(
  EXAMPLE_SOURCES.paike.sizeM,
  EXAMPLE_SOURCES.paike.distanceM,
);

/** Väljumispilet: tänavalambi pirn 0,06 m, 12 m kõrgusel. */
const EXIT_LAMP = { sizeM: 0.06, distanceM: 12 };
const EXIT_LAMP_DEG = apparentSizeDeg(EXIT_LAMP.sizeM, EXIT_LAMP.distanceM);

/** Eesti kombe järgi koma, mitte punkt: „0,29", mitte „0.29". */
function comma(value: number, decimals: number): string {
  return value.toFixed(decimals).replace(".", ",");
}

const steps: Step[] = [
  {
    type: "hook",
    id: "hook-1",
    title: "Kumb annab ise valgust?",
    // Joonis näitab öist tänavat, aga EI ütle, milline neist ise kiirgab –
    // see ongi sammu küsimus.
    figure: "oo-linn",
    body: [
      "Vaata öist tänavat: tänavalamp, auto tuled, valgustatud aknad, Kuu ja liiklusmärgi helkur. Öösel paistavad need kõik heledana.",
      "Aga ainult osa neist annab ise valgust – ülejäänud ainult peegeldavad võõrast valgust tagasi. Kumb on Kuu?",
      "Täna õpid ütlema, mis liiki valgusallikaga on tegu.",
    ],
  },
  {
    type: "theory",
    id: "theory-1",
    title: "Kaks viisi valgusallikaid liigitada",
    body: [
      "Valgusallikas on keha, mis ise kiirgab valgust. Kuu, helkur ja peegel EI ole valgusallikad – nad peegeldavad Päikese või lambi valgust.",
      "Spektraalse koostise järgi: soojuslikud allikad kiirgavad valgust sellepärast, et nad on kuumad (üle umbes 600 °C) – Päike, tähed, küünlaleek, hõõglamp, tuli. Mida kuumem on keha, seda sinakam on tema valgus. Külmad allikad kiirgavad ilma hõõguma minemata: LED, päevavalguslamp, telefoniekraan, jaaniuss. „Külm“ ei tähenda siin valguse värvust ega seda, et lamp üldse ei soojene – see ütleb, KUIDAS valgus tekib.",
      `Suuruse järgi: loeb näiv suurus, mitte päris mõõde. Kui allikas paistab meile kuni ${POINT_SOURCE_MAX_DEG}° suurusena, nimetame teda punktvalgusallikaks; muidu on ta laiendatud allikas. Sama lamp on kaugelt punktallikas ja lähedalt laiendatud allikas – liik sõltub alati sellest, kust me vaatame.`,
      "Päike kui elu võimaldaja: Päikeselt jõuab Maale peamiselt lühilaineline kiirgus (sh nähtav valgus ja ultraviolett), Maalt läheb tagasi pikalaineline soojuskiirgus. See sisse-välja tasakaal hoiab Maa temperatuuri elule sobivana.",
    ],
  },
  {
    type: "predict",
    id: "predict-1",
    title: "Paku oma ennustus",
    body: [
      "Päikese läbimõõt on umbes 100 korda suurem kui Maa oma – ta on kõige suurem keha, mida sa taevas näed.",
    ],
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt: "Kumb on Päike MEIE jaoks?",
        options: [
          { id: "punkt", text: "Punktvalgusallikas", correct: true },
          {
            id: "laiendatud",
            text: "Laiendatud allikas – ta on ju hiiglaslik",
            correct: false,
            misconception: "suurus-ilma-kauguseta",
          },
          {
            id: "eikumbki",
            text: "Ei kumbki – Päike ei ole üldse valgusallikas",
            correct: false,
            misconception: "kuu-on-valgusallikas",
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
      "Liuguritega saad muuta allika mõõdet ja kaugust vaatluskohast. Jälgi, kuidas näiv suurus kraadides muutub – ja millal silt „punktvalgusallikas“ vahetub „laiendatud allika“ vastu.",
    ],
    questions: [
      {
        // Ülesanne 1, esimene pool (sisu/MOODUL-valgusallikad.md „explore").
        kind: "choice",
        id: "explore-1",
        prompt:
          "Pane päevavalgustoru (1,2 m) 2 m kaugusele. Kas ta on punktvalgusallikas?",
        options: [
          {
            id: "ei",
            text: `Ei – ta paistab palju suuremana kui ${POINT_SOURCE_MAX_DEG}°`,
            correct: true,
          },
          {
            id: "jah-vaike",
            text: "Jah – lambi hõõguv osa on ju õhuke",
            correct: false,
            misconception: "suurus-ilma-kauguseta",
          },
          {
            id: "jah-alati",
            text: "Jah – iga lamp on punktvalgusallikas",
            correct: false,
            misconception: "suurus-ilma-kauguseta",
          },
        ],
      },
      {
        // Ülesanne 1, teine pool: sama toru, ainult kaugus muutub. Just see
        // arv on väärarusaama `suurus-ilma-kauguseta` vastus – keha jäi samaks,
        // liik muutus. Kosmoseskaala avaneb alles pärast ülesannet 2.
        kind: "numeric",
        id: "explore-2",
        prompt:
          "Jäta toru mõõt samaks ja kaugenda, kuni silt muutub. Mis kaugusel see juhtus?",
        hints: [
          "Vaata näivat suurust kraadides – silt vahetub täpselt siis, kui see langeb piirini.",
        ],
        unit: "m",
        // Liuguriga otsitud kaugus, mitte peast arvutatud arv: 5% on ligikaudu
        // 3,4 m ja katab liuguri astumise ka jämedama sammuga.
        tolerance: { mode: "percent", value: 5 },
        answer: TUBE_POINT_DISTANCE_M,
      },
      {
        // Ülesanne 2: pisike allikas väga lähedal on ikka punktallikas –
        // vastupidine suund samale mõttele.
        kind: "numeric",
        id: "explore-3",
        prompt:
          "Vali LED (5 mm) ja too ta 0,5 m kaugusele. Kui suur on tema näiv suurus?",
        hints: ["Näidik ekraani ülaosas näitab näivat suurust kraadides."],
        unit: "°",
        tolerance: { mode: "percent", value: 5 },
        answer: LED_CLOSE_DEG,
      },
      {
        // Ülesanne 3: ennustuse kontroll. Vastust ei hinnata – õpilane paneb
        // sõnadesse, mis ta äsja nägi.
        kind: "text",
        id: "explore-4",
        prompt:
          "Vajuta nupule „Päike“. Mida näidik näitab ja kuidas see läheb kokku sinu ennustusega?",
        minWords: 10,
      },
    ],
    // Kosmoseskaala (Päikese nupp) avaneb alles pärast maiseid ülesandeid:
    // enne peab õpilane olema ise näinud, et sama keha liik sõltub kaugusest.
    // Sildi tähendust teab ainult selle mooduli Simulation.tsx.
    simulation: {
      unlocks: [{ feature: "kosmoseskaala", afterQuestion: "explore-3" }],
    },
  },
  {
    type: "practice",
    id: "practice-1",
    title: "Proovi ise järele",
    // Näidis on LAHENDATUD ülesanne, mitte küsimus (docs/MOODULILEPING.md).
    worked: {
      prompt: "LED-i läbimõõt on 5 mm ja sa vaatad teda 1 m kauguselt. Kui suur on tema näiv suurus ja mis liiki allikaga on tegu?",
      solution: [
        "Teisenda mõõt meetriteks: 5 mm = 0,005 m.",
        `Näiv suurus = 2 · atan(0,005 / (2 · 1)) = ${comma(LED_1M_DEG, 2)}°.`,
        `${comma(LED_1M_DEG, 2)}° on väiksem kui ${POINT_SOURCE_MAX_DEG}°, seega on tegu punktvalgusallikaga.`,
      ],
      answer: `${comma(LED_1M_DEG, 2)}° – punktvalgusallikas`,
    },
    questions: [
      {
        // Osaline: valem on osaliselt ees, üks arv ja vastus tulevad ise.
        kind: "numeric",
        id: "practice-1",
        prompt:
          "Lambipirni läbimõõt on 0,08 m ja sa vaatad teda 4 m kauguselt. Näiv suurus = 2 · atan(0,08 / (2 · ___)) = ___°",
        hints: [
          "Puuduv arv on kaugus meetrites.",
          // Sagedasim viga on see, et arkustangensi tulemus jääb kahega
          // korrutamata. Siin hoiatab selle eest vihje, mitte lõks: lõksu arv
          // (pool õigest vastusest) tähendaks, et sisufail arvutab ise ühe
          // füüsikalise suuruse välja, ja füüsika elab ainult model.ts-is
          // (CLAUDE.md reegel 1, CodeRabbiti leid 2026-08-10). Väärarusaam
          // `poolnurk-unustatud` jääb õpetajajuhendisse alles – õpetaja
          // tunneb selle vastuste seast ise ära.
          "Ära unusta lõpuks kahega korrutada – arkustangens annab ainult poole nurgast.",
        ],
        unit: "°",
        tolerance: { mode: "percent", value: 5 },
        answer: BULB_4M_DEG,
      },
      {
        // Iseseisev, mitu õiget (spets p 3). Segamine on vaikimisi sees.
        kind: "choice",
        id: "practice-2",
        prompt: "Millised neist on külmad valgusallikad?",
        multiple: true,
        options: [
          { id: "led", text: "LED-lamp", correct: true },
          {
            id: "kuunlaleek",
            text: "Küünlaleek",
            correct: false,
            misconception: "soojuslik-kulmaks",
          },
          { id: "telefoniekraan", text: "Telefoniekraan", correct: true },
          {
            id: "hooglamp",
            text: "Hõõglamp",
            correct: false,
            misconception: "soojuslik-kulmaks",
          },
          { id: "jaaniuss", text: "Jaaniuss", correct: true },
          {
            id: "paike",
            text: "Päike",
            correct: false,
            misconception: "soojuslik-kulmaks",
          },
        ],
      },
      {
        // Iseseisev arvutus (spets p 4): mõlemad arvud samas ühikus, seega
        // teisendama ei pea – see ongi esimene vihje.
        kind: "numeric",
        id: "practice-3",
        prompt:
          "Päikese läbimõõt on 1 392 000 km ja tema kaugus Maast 150 000 000 km. Kui suur on tema näiv suurus?",
        hints: [
          "Mõlemad arvud on samades ühikutes – teisendama ei pea.",
          "Näiv suurus = 2 · atan(läbimõõt / (2 · kaugus)).",
        ],
        unit: "°",
        tolerance: { mode: "percent", value: 5 },
        answer: SUN_DEG,
      },
      {
        // Ülekanne (spets p 5): sama mõte päris ilmas – hiiglaslik laiendatud
        // allikas ei tekita teravat varju.
        kind: "choice",
        id: "practice-4",
        prompt:
          "Selge ilmaga on inimese vari maapinnal terava servaga, pilvise ilmaga varju peaaegu ei olegi. Miks?",
        hints: [
          "Kust valgus pilvise ilmaga tuleb – ühest väikesest kohast või kogu taevast?",
        ],
        options: [
          {
            id: "taevas",
            text: "Pilvine taevas on hiiglaslik laiendatud allikas, Päike aga punktallikas",
            correct: true,
          },
          {
            id: "neelavad",
            text: "Pilved neelavad kogu valguse ära",
            correct: false,
          },
          {
            id: "sirgelt",
            text: "Pilvedes ei levi valgus enam sirgjooneliselt",
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
    // Spetsi teine küsimus küsis nii arvu kui ka liiki. Väljumispilet lubab
    // kuni 3 küsimust, seega on siin ainult ARV: liigitamine sai juba kaks
    // hinnatavat korda (explore-1 ja practice-4) ja arvutuskäik on see, mis
    // nõuab mõlemat sammu korraga – arvuta ja võrdle piiriga.
    questions: [
      {
        kind: "choice",
        id: "exit-1",
        prompt: "Punktvalgusallikas on allikas, mis…",
        options: [
          {
            id: "nurk",
            text: `paistab vaatluskohast kuni ${POINT_SOURCE_MAX_DEG}° suurusena`,
            correct: true,
          },
          {
            id: "vaike",
            text: "on väiksem kui 1 cm",
            correct: false,
            misconception: "suurus-ilma-kauguseta",
          },
          {
            id: "ykskiir",
            text: "annab ainult ühe valguskiire",
            correct: false,
            misconception: "punktallikas-uks-kiir",
          },
        ],
      },
      {
        kind: "numeric",
        id: "exit-2",
        prompt:
          "Tänavalambi pirni läbimõõt on 0,06 m ja lamp ripub 12 m kõrgusel. Kui suur on tema näiv suurus maapinnalt vaadates?",
        unit: "°",
        tolerance: { mode: "percent", value: 5 },
        answer: EXIT_LAMP_DEG,
      },
      {
        kind: "text",
        id: "exit-3",
        prompt:
          "Nimeta üks valgusallikas oma kodust ja ütle, kas ta on soojuslik või külm.",
        minWords: 5,
      },
    ],
  },
];

/**
 * Kordamiskaardid (docs/MOODULILEPING.md „activities.ts – kordamiskaardid",
 * sisu/MOODUL-valgusallikad.md „Kordamiskaardid").
 */
const reviewCards: ReviewCard[] = [
  {
    id: "rc-1",
    type: "concept",
    question: "Mis on valgusallikas?",
    answer:
      "Keha, mis ise kiirgab valgust. Kuu ja helkur ei ole valgusallikad – nad peegeldavad võõrast valgust.",
  },
  {
    id: "rc-2",
    type: "concept",
    question: "Millal nimetatakse allikat punktvalgusallikaks?",
    answer: `Kui tema mõõtmed on väikesed võrreldes kaugusega – näiv suurus on kuni ${POINT_SOURCE_MAX_DEG}°.`,
  },
  {
    id: "rc-3",
    type: "concept",
    question: "Too näide soojuslikust ja külmast valgusallikast.",
    answer:
      "Soojuslik: Päike, küünal, hõõglamp. Külm: LED, päevavalguslamp, jaaniuss.",
  },
  {
    id: "rc-4",
    type: "calc",
    question: "LED läbimõõduga 5 mm on 1 m kaugusel. Kui suur on näiv suurus ja mis liiki allikaga on tegu?",
    answer: `${comma(LED_1M_DEG, 2)}° – punktvalgusallikas.`,
  },
  {
    id: "rc-5",
    type: "transfer",
    question: "Päike on hiiglaslik. Miks ta on meie jaoks ikkagi punktvalgusallikas?",
    answer: `Ta on väga kaugel: näiv suurus on ainult ${comma(SUN_DEG, 2)}°, alla ${POINT_SOURCE_MAX_DEG}° piiri (piir on kaasav – ka täpselt ${POINT_SOURCE_MAX_DEG}° loeb punktallikaks).`,
  },
];

export const activities = defineActivities({ steps, reviewCards });
