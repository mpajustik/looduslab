import { defineActivities } from "../../../engine/contract";
import type { ReviewCard, Step } from "../../../engine/contract";
import {
  EXAMPLE_SOURCES,
  POINT_SOURCE_MIN_RATIO,
  distanceToSizeRatio,
  pointSourceDistance,
} from "./model";

/**
 * Sammud ja kordamiskaardid (docs/MOODULILEPING.md,
 * sisu/MOODUL-valgusallikad.md).
 *
 * Mooduli suurus on SUHE `kaugus / mõõde`, mitte nurkmõõde: 8. klass
 * arkustangensit ei tunne ja põhivara ütleb sama asja täpselt nii – „mõõtmed on
 * väikesed võrreldes kaugusega". Õpilane teeb siin ainult jagamistehteid ja
 * võrdleb tulemust 60-ga. Kraadid on alles ainult simulatsiooni väikeses
 * lisanäidus; ükski küsimus neid ei küsi (seda valvab test).
 *
 * Kõik arvulised vastused tulevad MUDELIST, mitte käsitsi kirjutatud arvudest
 * (CLAUDE.md reegel 1). Nii ei saa ülesande vastus ja simulatsiooni näit
 * kunagi lahku minna – ka siis mitte, kui piir `POINT_SOURCE_MIN_RATIO` kunagi
 * muutuks. Et see ei jääks iseennast kontrollivaks ringiks, loeb
 * tests/valgusallikad.model.test.ts need arvud üle SPETSIFIKATSIOONI tabeli
 * järgi (200 · 100 · 50 · 108 · 72 m): vale mõõde või kaugus siin failis teeb
 * testi punaseks, mitte ei jõua tundi.
 */

/** Harjutuse näidis ja kordamiskaart rc-4: LED 5 mm, 1 m kauguselt. */
const LED_1M_RATIO = distanceToSizeRatio(
  EXAMPLE_SOURCES.led.sizeM,
  EXAMPLE_SOURCES.led.distanceM,
);

/**
 * Harjutus 2 arvuvariandid (docs/MOODULILEPING.md „Juhuslikkus"): neli
 * mõõtme-kauguse paari, kõik LAIENDATUD allikad (suhe kaugelt alla piiri 60).
 *
 * **ETTEVAATUST piiriga:** ükski variant ei tohi anda suhet piiri 60 lähedale
 * (display.ts nihutab näidiku näitu piiri lähedal sildist eemale, aga see
 * mudel ei puuduta – siin on oht lihtsalt see, et ülesanne näeks ühel
 * variandil välja nagu piirijuht, teisel selgelt mitte). Kõik neli jäävad
 * kuni 50-ni (10 võrra alla piiri), seega margin on lai.
 */
const PRACTICE_1_VARIANTS = [
  { id: "d4", sizeM: 0.08, distanceM: 4 },
  { id: "d3", sizeM: 0.1, distanceM: 3 },
  { id: "d2", sizeM: 0.05, distanceM: 2 },
  { id: "d5", sizeM: 0.2, distanceM: 5 },
].map(({ id, sizeM, distanceM }) => ({
  id,
  sizeM,
  distanceM,
  ratio: distanceToSizeRatio(sizeM, distanceM),
}));

/**
 * Simulatsiooni ülesanne 1: päevavalgustoru 1,2 m juures vähim kaugus,
 * millelt ta veel punktallikaks loeb (72 m).
 *
 * Toru suhet 2 m kauguselt (1,7) siin konstandina ei ole: seda arvu õpilane ei
 * kirjuta, ta loeb selle ekraanilt. Et ülesanne oleks üldse lahendatav, peab
 * toru 2 m kauguselt olema LAIENDATUD allikas – seda kontrollib mudeli test
 * `EXAMPLE_SOURCES` tabeli pealt.
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
const LED_CLOSE_RATIO = distanceToSizeRatio(
  EXAMPLE_SOURCES.led.sizeM,
  LED_CLOSE_DISTANCE_M,
);

/** Ennustuse ja harjutuse 4 tuum: Päike on 108 korda – üle piiri. */
const SUN_RATIO = distanceToSizeRatio(
  EXAMPLE_SOURCES.paike.sizeM,
  EXAMPLE_SOURCES.paike.distanceM,
);

/** Väljumispilet: tänavalambi pirn 0,06 m, 12 m kõrgusel. */
const EXIT_LAMP = { sizeM: 0.06, distanceM: 12 };
const EXIT_LAMP_RATIO = distanceToSizeRatio(EXIT_LAMP.sizeM, EXIT_LAMP.distanceM);

/** Eesti kombe järgi koma, mitte punkt: „1,7", mitte „1.7". */
function comma(value: number, decimals: number): string {
  return value.toFixed(decimals).replace(".", ",");
}

/** Suhe tekstina: suured arvud täisarvuna („200"), väikesed ühe kohaga („1,7"). */
function ratioText(value: number): string {
  return comma(value, value < 10 ? 1 : 0);
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
    figure: "va-liigid",
    body: [
      "Valgusallikas on keha, mis ise kiirgab valgust. Kuu, helkur ja peegel EI ole valgusallikad – nad peegeldavad Päikese või lambi valgust.",
      "Spektraalse koostise järgi: soojuslikud allikad kiirgavad valgust sellepärast, et nad on kuumad (üle umbes 600 °C) – Päike, tähed, küünlaleek, hõõglamp, tuli. Mida kuumem on keha, seda sinakam on tema valgus. Külmad allikad kiirgavad ilma hõõguma minemata: LED, päevavalguslamp, telefoniekraan, jaaniuss. „Külm“ ei tähenda siin valguse värvust ega seda, et lamp üldse ei soojene – see ütleb, KUIDAS valgus tekib.",
      `Suuruse järgi: loeb see, kui väike on allikas VÕRRELDES kaugusega, mitte tema päris mõõt. Jaga kaugus allika mõõtmega. Kui vastus on vähemalt ${POINT_SOURCE_MIN_RATIO}, nimetame allikat punktvalgusallikaks; kui vähem, on ta laiendatud allikas. Sama lamp on kaugelt punktallikas ja lähedalt laiendatud allikas – liik sõltub alati sellest, kust me vaatame.`,
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
      `Liuguritega saad muuta allika mõõdet ja kaugust vaatluskohast. Näidik ütleb, mitu korda on kaugus suurem kui allika mõõde – jälgi, millal see arv jõuab ${POINT_SOURCE_MIN_RATIO}-ni ja silt „laiendatud allikas“ vahetub „punktvalgusallika“ vastu.`,
    ],
    questions: [
      {
        // Ülesanne 1, esimene pool (sisu/MOODUL-valgusallikad.md „explore").
        kind: "choice",
        id: "explore-1",
        prompt:
          "Pane päevavalgustoru (1,2 m) 2 m kaugusele. Kas ta on punktvalgusallikas?",
        hints: [
          `Jaga kaugus toru mõõtmega: 2 / 1,2. Kas tulemus on vähemalt ${POINT_SOURCE_MIN_RATIO}?`,
        ],
        options: [
          {
            id: "ei",
            text: `Ei – kaugus on ainult umbes 2 korda suurem kui toru ise, aga vaja oleks ${POINT_SOURCE_MIN_RATIO}`,
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
          `Vaata näidikut: silt vahetub täpselt siis, kui kaugus saab ${POINT_SOURCE_MIN_RATIO} korda suuremaks kui toru mõõt.`,
        ],
        unit: "m",
        // Liuguriga otsitud kaugus, mitte peast arvutatud arv – aga lubatud viga
        // on siin ABSOLUUTNE ja kitsas, erinevalt mooduli teistest küsimustest.
        // 5% oleks 68,4–75,6 m ja võtaks õigeks ka arvud, mille juures ekraanil
        // seisab veel „laiendatud allikas" (Codexi leid 2026-08-10) – just selle
        // sildi vahetumist see küsimus aga otsida palub. Liuguri samm on 0,5 m,
        // seega ±1 m katab kaks sammu mõlemale poole ja rohkem ei ole vaja.
        tolerance: { mode: "absolute", value: 1 },
        answer: TUBE_POINT_DISTANCE_M,
      },
      {
        // Ülesanne 2: pisike allikas päris lähedal on ikka punktallikas –
        // vastupidine suund samale mõttele. Ühikut ei ole: suhe on ühikuta arv
        // (meetrid taanduvad jagamisel välja).
        kind: "numeric",
        id: "explore-3",
        prompt:
          "Vali LED (5 mm) ja too ta 0,5 m kaugusele. Mitu korda on kaugus suurem kui LED-i mõõde?",
        hints: [
          "Näidik ekraani ülaosas ütleb selle arvu. Sama saad ka ise: jaga 0,5 m LED-i mõõtmega 0,005 m.",
        ],
        // „korda" ei ole SI-ühik, vaid siin ühiku KOHAL: suhe on ühikuta arv.
        // Ilma selle väljata luges checker vastuse „100 korda" valeks (Codexi
        // leid 2026-08-10) – õpilane kirjutab loomulikult sõna kaasa ja
        // sisuliselt õige vastus oleks salvestunud valena, sealtkaudu ka
        // õpetaja koondvaatesse. Nüüd kõlbavad mõlemad, „100" ja „100 korda",
        // ja „100 m" annab selge veateate. Sama väli on kõigil selle mooduli
        // suhteküsimustel (practice-1, practice-3, exit-2).
        unit: "korda",
        tolerance: { mode: "percent", value: 5 },
        answer: LED_CLOSE_RATIO,
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
      prompt:
        "LED-i läbimõõt on 5 mm ja sa vaatad teda 1 m kauguselt. Mitu korda on kaugus suurem kui LED ise ja mis liiki allikaga on tegu?",
      solution: [
        "Teisenda mõõt meetriteks: 5 mm = 0,005 m.",
        `Jaga kaugus mõõtmega: 1 / 0,005 = ${ratioText(LED_1M_RATIO)}.`,
        `${ratioText(LED_1M_RATIO)} on suurem kui ${POINT_SOURCE_MIN_RATIO}, seega on tegu punktvalgusallikaga.`,
      ],
      answer: `${ratioText(LED_1M_RATIO)} korda – punktvalgusallikas`,
    },
    questions: [
      {
        // Osaline: tehe on ees, vastus tuleb ise.
        kind: "numeric",
        id: "practice-1",
        prompt:
          "Valgusallika läbimõõt on {moode} m ja sa vaatad teda {kaugus} m kauguselt. Mitu korda on kaugus suurem kui allikas? {kaugus} / {moode} = ___",
        hints: [
          "Mõlemad arvud on juba meetrites – teisendama ei pea.",
          `Kui vastus tuleb vähemalt ${POINT_SOURCE_MIN_RATIO}, on tegu punktallikaga. Siin ta nii suur ei ole.`,
        ],
        unit: "korda",
        tolerance: { mode: "percent", value: 5 },
        variants: PRACTICE_1_VARIANTS.map(({ id, sizeM, distanceM, ratio }) => ({
          id,
          values: { moode: sizeM, kaugus: distanceM },
          answer: ratio,
        })),
      },
      {
        // Iseseisev, mitu õiget (spets p 3). Segamine on vaikimisi sees.
        kind: "choice",
        id: "practice-2",
        prompt: "Millised neist on külmad valgusallikad?",
        hints: [
          "„Külm“ ei tähenda tuhmi valgust – see ütleb, KUIDAS valgus tekib: kas keha peab kuumaks minema (soojuslik) või mitte (külm).",
          "Kas kirjas olevad allikad hõõguvad kuumusest (nagu leek või hõõgniit) või kiirgavad valgust ilma selleta?",
        ],
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
          "Päikese läbimõõt on 1 392 000 km ja tema kaugus Maast 150 000 000 km. Mitu korda on kaugus suurem kui Päike ise?",
        hints: [
          "Mõlemad arvud on samades ühikutes – teisendama ei pea.",
          "Jaga kaugus läbimõõduga.",
        ],
        unit: "korda",
        tolerance: { mode: "percent", value: 5 },
        answer: SUN_RATIO,
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
        hints: ["Liik ei sõltu allika päris suurusest, vaid suhtest kaugusega."],
        options: [
          {
            id: "nurk",
            text: `on vaatluskohast vähemalt ${POINT_SOURCE_MIN_RATIO} korda kaugemal, kui on tema enda mõõde`,
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
          "Tänavalambi pirni läbimõõt on 0,06 m ja lamp ripub 12 m kõrgusel. Mitu korda on kaugus suurem kui pirn?",
        hints: ["Jaga kaugus läbimõõduga: 12 / 0,06."],
        unit: "korda",
        tolerance: { mode: "percent", value: 5 },
        answer: EXIT_LAMP_RATIO,
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
    answer: `Kui tema mõõtmed on väikesed võrreldes kaugusega – kaugus on vähemalt ${POINT_SOURCE_MIN_RATIO} korda suurem kui allika mõõde.`,
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
    question:
      "LED läbimõõduga 5 mm on 1 m kaugusel. Mitu korda on kaugus suurem kui LED ja mis liiki allikaga on tegu?",
    answer: `1 / 0,005 = ${ratioText(LED_1M_RATIO)} korda – punktvalgusallikas.`,
  },
  {
    id: "rc-5",
    type: "transfer",
    question: "Päike on hiiglaslik. Miks ta on meie jaoks ikkagi punktvalgusallikas?",
    answer: `Ta on väga kaugel: kaugus on ${ratioText(SUN_RATIO)} korda suurem kui Päikese enda läbimõõt, seega üle ${POINT_SOURCE_MIN_RATIO} piiri (piir on kaasav – ka täpselt ${POINT_SOURCE_MIN_RATIO} loeb punktallikaks).`,
  },
  {
    id: "rc-6",
    type: "explain",
    question:
      "LED ja päevavalguslamp lähevad kasutamisel soojaks ja annavad ju valgust. Miks nimetatakse neid ikkagi KÜLMADEKS valgusallikateks?",
    answer:
      "„Külm“ ei kirjelda, kui palav lamp puudutades on ega valguse värvust – see ütleb, KUIDAS valgus tekib. Soojuslik allikas kiirgab, sest keha on hõõguma minemas kuum (üle umbes 600 °C, nagu hõõgniit või leek); külm allikas tekitab valgust muu protsessiga ega pea selleks nii kuumaks minema.",
  },
  {
    id: "rc-7",
    type: "graph",
    question:
      "Allika mõõde jääb samaks, aga vaatluskaugus kahekordistub. Mis juhtub suhtega kaugus / mõõde?",
    answer:
      "Suhe kahekordistub ka – suhe on kaugusega VÕRDELINE (sirge läbi nullpunkti), sest mõõde on jagamisel muutumatu nimetaja.",
  },
];

export const activities = defineActivities({ steps, reviewCards });
