import { defineActivities } from "../../../engine/contract";
import type { ReviewCard, Step } from "../../../engine/contract";
import { formatNumber } from "../../../lib/format";
import { deviationDeg, secondIncidenceDeg } from "./model";

/**
 * Sammud ja kordamiskaardid (docs/MOODULILEPING.md, sisu/MOODUL-nurkpeegel.md).
 *
 * **Ükski pööre ega langemisnurk ei ole siia käsitsi kirjutatud** – kõik tulevad
 * `model.ts`-i valemitest δ = 2θ ja β = θ − α (CLAUDE.md reegel 1). Nii ei saa
 * ülesande vastus ja simulatsiooni näit kunagi lahku minna. Testis
 * (tests/nurkpeegel.model.test.ts) võrreldakse neid arve SPETSIFIKATSIOONI
 * tabeliga, mitte activities.ts iseendaga.
 *
 * **Ühikud.** Kõik selle mooduli arvud on kraadides – nii mudelis kui ka
 * õpilase ekraanil. Ühikuteisendusi siin failis ei ole ja see on ainus moodul
 * peeglite sarjas, kus neid ei olegi (kumer- ja nõguspeegel rääkisid
 * sentimeetrites, mudel meetrites).
 *
 * **Kaks piiri, mida ükski ülesanne ei ületa** (sisu/MOODUL-nurkpeegel.md
 * „Piirid"):
 *
 * 1. **Peeglite nurk jääb vahemikku 60°…90°.** Kitsamas kiilus ei pääse kiir
 *    kahe peegeldusega välja – ta põrkab peeglite vahel edasi-tagasi ja siis EI
 *    ole pööre 2θ. Iga selle faili (θ, α) paar on mudeli piirides
 *    (α < 2θ − 90°), seega ei küsi ükski ülesanne arvu, mida mudel keeldub
 *    andmast. Seda valvab test.
 * 2. **Kujutistest siin juttu ei ole.** Kaks peeglit annavad hulga kujutisi
 *    (kaleidoskoop, 360° / nurk − 1), aga see on TEINE õpieesmärk ja jääb
 *    õpetajajuhendi klassikatsesse. Sõnu „kujutis" ja „helkur" õpilase pool ei
 *    seleta: helkur on järgmise mooduli oma ja tohib siin olla ainult ühe
 *    lausega, ilma seletuseta.
 */

/**
 * Nurk ekraanile.
 *
 * Kõik selle mooduli arvud on täisarvulised kraadid (liuguri samm on 5°), aga
 * vorminda ta ikkagi ühest kohast: ujukoma jääk ei tohi kunagi õpilase teksti
 * sattuda. Vastuse VÄÄRTUS jääb ümardamata – checker võrdleb ise tolerantsiga.
 */
const deg = (value: number): string => formatNumber(value);

// --- Ülesannete seisud ja nende vastused (vastused mudelist) ---------------

/** Simulatsiooni algseis: liugurite algväärtused (sisu/MOODUL-nurkpeegel.md „explore"). */
const START_MIRROR_DEG = 60;
const START_INCIDENCE_DEG = 20;
/** β esimeses ülesandes – kaks langemisnurka annavad kokku peeglite nurga. */
const START_SECOND_DEG = secondIncidenceDeg(START_MIRROR_DEG, START_INCIDENCE_DEG);
const START_DEVIATION_DEG = deviationDeg(START_MIRROR_DEG);

/** Teine liuguriseis (explore-3): peeglite nurk kasvab 15°, pööre 30°. */
const WIDER_MIRROR_DEG = 75;
const WIDER_DEVIATION_DEG = deviationDeg(WIDER_MIRROR_DEG);

/** Täisnurkne nurkpeegel – mooduli tipp (explore-4, predict, exit). */
const RIGHT_MIRROR_DEG = 90;
const RIGHT_DEVIATION_DEG = deviationDeg(RIGHT_MIRROR_DEG);

/** Teooria näited: pööre on alati kaks korda peeglite nurk. */
const THEORY_MIRROR_DEG = 65;
const THEORY_DEVIATION_DEG = deviationDeg(THEORY_MIRROR_DEG);
const THEORY_WIDE_MIRROR_DEG = 80;
const THEORY_WIDE_DEVIATION_DEG = deviationDeg(THEORY_WIDE_MIRROR_DEG);

/** Paralleelsed peeglid ehk periskoop: pööre on aus null. */
const PARALLEL_MIRROR_DEG = 0;
const PARALLEL_DEVIATION_DEG = deviationDeg(PARALLEL_MIRROR_DEG);

/** Lahendatud näidis (practice `worked`) – sama nurk mis teoorias. */
const WORKED_MIRROR_DEG = THEORY_MIRROR_DEG;
const WORKED_DEVIATION_DEG = THEORY_DEVIATION_DEG;

/** Osaline ülesanne: tehe on ees, vastus tuleb ise (practice-1). */
const GAP_MIRROR_DEG = THEORY_WIDE_MIRROR_DEG;
const GAP_DEVIATION_DEG = THEORY_WIDE_DEVIATION_DEG;

/**
 * Pöördülesanne (practice-2): pööre on teada, küsitakse peeglite nurka.
 *
 * Mudelil pöördfunktsiooni EI ole – θ = δ / 2 on sama valem tagurpidi ja teine
 * arvutus võiks ühel päeval esimesest lahku minna (sama põhjendus, mis hoiab
 * peegeldumisnurga ja langemisnurga ühe arvu küljes). Seepärast on peeglite
 * nurk siin KIRJAS ja pööre tuletatakse temast mudeliga: kui valem muutub,
 * muutub küsimuse tekst, mitte vastus. Kooskõla valvab test.
 */
const LASER_MIRROR_DEG = 80;
const LASER_DEVIATION_DEG = deviationDeg(LASER_MIRROR_DEG);

/** Joonise lugemine (practice-3, joonis `np-loe-nurgad`). */
const FIGURE_MIRROR_DEG = 70;
const FIGURE_INCIDENCE_DEG = 25;
const FIGURE_SECOND_DEG = secondIncidenceDeg(FIGURE_MIRROR_DEG, FIGURE_INCIDENCE_DEG);

/** Väljumispilet (exit-1). */
const EXIT_MIRROR_DEG = FIGURE_MIRROR_DEG;
const EXIT_DEVIATION_DEG = deviationDeg(EXIT_MIRROR_DEG);

/** Kordamiskaardid rc-2 ja rc-3. */
const CARD_DEVIATION_MIRROR_DEG = EXIT_MIRROR_DEG;
const CARD_DEVIATION_DEG = deviationDeg(CARD_DEVIATION_MIRROR_DEG);
const CARD_MIRROR_DEG = 80;
const CARD_INCIDENCE_DEG = 30;
const CARD_SECOND_DEG = secondIncidenceDeg(CARD_MIRROR_DEG, CARD_INCIDENCE_DEG);

/**
 * Lugemistolerants, MITTE mõõtemääramatus: simulatsioon on ideaalne, aga
 * õpilane loeb ekraanilt nurgakaare juurest arvu ja tipib käsitsi. 0,5° lubab
 * näpuvea, aga ei lase naaberväärtust õigeks: liuguri samm on 5° ja pööre
 * liigub 10° kaupa (sisu/MOODUL-nurkpeegel.md „explore"). Sama arv kehtib ka
 * arvutatud vastustel – kogu moodul on kraadides ja ühtki ümardamist siin ei
 * ole.
 */
const ANGLE_TOLERANCE = { mode: "absolute", value: 0.5 } as const;

const steps: Step[] = [
  {
    type: "hook",
    id: "hook-1",
    // Joonis näitab ainult seda, ET kaks peeglit toovad pildi aia tagant alla.
    // MIKS, seda ütlevad teooria ja simulatsioon – hook ei tohi vastust ette
    // öelda ega ühtegi nurka väita.
    figure: "np-ule-aia",
    title: "Kuidas näha üle kõrge aia?",
    body: [
      "Kõrge plankaia taga toimub midagi huvitavat, aga aiast üle ei näe – ka varvastele tõustes mitte.",
      "Papitoru, mille mõlemas otsas on viltune peegel, teeb selle ära sinu eest: valgus tuleb aia tagant ülemisele peeglile, läheb toru mööda alla ja jõuab teiselt peeglilt sinu silma.",
      "Kaks peeglit ja valgus käib nurga taha. Kuidas nad seda teevad – ja kui palju valgus nende vahel üldse pöördub?",
    ],
  },
  {
    type: "theory",
    id: "theory-1",
    title: "Kaks peeglit järjest",
    body: [
      "NURKPEEGEL on kaks tasast peeglit, mis on servapidi nurga all koos. Nende vahelist nurka nimetame PEEGLITE NURGAKS. Valgus, mis peeglite vahele kiilu satub, peegeldub esmalt ühelt ja siis teiselt peeglilt.",
      "Uut seadust siin ei ole. Mõlemal peeglil kehtib täpselt seesama peegeldumisseadus mis üksikul tasapeeglil: langemisnurk = peegeldumisnurk, mõõdetuna selle peegli enda ristsirgest. Iga peegel ei tea teisest mitte midagi.",
      "Kaks langemisnurka annavad kokku peeglite nurga. Kui kiir langeb esimesele peeglile nurga α all, siis teisele langeb ta nurga β all, ja alati kehtib α + β = peeglite nurk. Kui esimene nurk kasvab, kahaneb teine täpselt sama palju.",
      `Kokku pöördub kiir kaks korda rohkem, kui on peeglite nurk. Peeglite nurk ${deg(THEORY_MIRROR_DEG)}° → kiir pöördub ${deg(THEORY_DEVIATION_DEG)}°. Peeglite nurk ${deg(THEORY_WIDE_MIRROR_DEG)}° → ${deg(THEORY_WIDE_DEVIATION_DEG)}°. See EI sõltu sellest, kust kiir tuli – ainult peeglitest endist.`,
      "See kehtib nii kaua, kui peegeldusi on täpselt kaks. Kui peeglid on teineteise vastu liiga kitsa nurga all, ei pääse kiir kahe peegeldusega välja: ta põrkab nende vahel edasi-tagasi mitu korda ja pöördub kokku rohkem. Seepärast on selle mooduli peeglid alati laiema nurga all.",
      `Täisnurkne nurkpeegel saadab valguse tagasi sinna, kust ta tuli. Kui peeglite nurk on ${deg(RIGHT_MIRROR_DEG)}°, on pööre 2 · ${deg(RIGHT_MIRROR_DEG)}° = ${deg(RIGHT_DEVIATION_DEG)}°. Kiir väljub täpselt vastassuunas, ükskõik kui viltu ta sisse tuli. Just seepärast „süttivad" helkurid autotulede valguses – aga sellest räägime eraldi.`,
      `Kaks paralleelset peeglit ei pööra midagi. Kui peeglite nurk on ${deg(PARALLEL_MIRROR_DEG)}°, on ka pööre ${deg(PARALLEL_DEVIATION_DEG)}°: valgus väljub täpselt samas suunas, ainult natuke kõrvale nihkunult. Nii on tehtud PERISKOOP – kaks peeglit toru otstes, mõlemad 45° kaldu, teineteisega paralleelsed. Sa vaatad otse edasi ja näed otse edasi, ainult meetri võrra kõrgemalt.`,
    ],
    figure: "np-kaks-peeglit",
  },
  {
    type: "predict",
    id: "predict-1",
    title: "Paku oma ennustus",
    body: [
      `Kaks peeglit on täisnurga all (${deg(RIGHT_MIRROR_DEG)}°). Kiir langeb esimesele peeglile viltu ja peegeldub sealt teisele peeglile.`,
    ],
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt: "Kus ta pärast teist peeglit välja tuleb?",
        options: [
          {
            id: "edasi",
            text: "Ta jätkab teed edasi, nagu poleks midagi juhtunud",
            correct: false,
            misconception: "kaks-peeglit-tuhistavad",
          },
          {
            id: "tagasi",
            text: "Ta läheb täpselt tagasi sinna, kust ta tuli",
            correct: true,
          },
          {
            id: "peeglite-nurga-all",
            text: `Ta väljub ${deg(RIGHT_MIRROR_DEG)}° nurga all – sama palju, kui on peeglite nurk`,
            correct: false,
            misconception: "peeglite-nurk-on-poorde-nurk",
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
    title: "Uuri nurkpeegliga",
    body: [
      // Paigutus on sama, mis mooduli joonistel (figures.tsx): tipp vasakul
      // all, peegel 1 sealt paremale, peegel 2 nurga all üles.
      "Vasakul all kohtuvad kaks peeglit – see koht on nende tipp. Peegel 1 läheb tipust paremale, peegel 2 nurga all üles. Viirutatud külg on peegli tagakülg: peegeldab see pool, kus viirutust ei ole.",
      "Kiir tuleb paremalt, tabab peeglit 1 punktis P₁, läheb sealt peeglile 2 punkti P₂ ja väljub. Nooleotsad näitavad, kummale poole valgus liigub.",
      "Mõlemas langemispunktis on katkendlik ristsirge ja tema kahel pool nurgakaared koos arvudega. Kastikestes paremal (kitsal ekraanil joonise all) on samad arvud sõnadega välja kirjutatud.",
      "Liuguritega saad muuta peeglite nurka ja langemisnurka esimesel peeglil. Kui langemisnurk läheb liiga suureks, ei jõua kiir kahe peegeldusega välja – ta põrkaks peeglite vahel edasi –, seepärast liugur nii kaugele ei ulatugi.",
    ],
    questions: [
      {
        kind: "numeric",
        id: "explore-1",
        prompt: `Jäta peeglite nurgaks ${deg(START_MIRROR_DEG)}° ja langemisnurgaks esimesel peeglil ${deg(START_INCIDENCE_DEG)}°. Kui suur on langemisnurk TEISEL peeglil?`,
        hints: [
          "Vaata teise peegli ristsirget ja tema juures olevat arvu.",
          "Liida kaks langemisnurka kokku ja võrdle peeglite nurgaga.",
        ],
        unit: "°",
        tolerance: ANGLE_TOLERANCE,
        answer: START_SECOND_DEG,
      },
      {
        kind: "numeric",
        id: "explore-2",
        prompt:
          "Lülita sisse „näita pöörde nurka\". Kui palju kiir kahe peegeldusega kokku pöördus?",
        hints: ["Võrdle peeglite nurgaga – mitu korda suurem?"],
        unit: "°",
        tolerance: ANGLE_TOLERANCE,
        answer: START_DEVIATION_DEG,
        // Lõks: kes loeb pöördeks peeglite nurga enda, saab just selle
        // tagasiside – see on mooduli kõige sagedasem väärarusaam.
        traps: [
          {
            answer: START_MIRROR_DEG,
            misconception: "peeglite-nurk-on-poorde-nurk",
            feedback:
              "See on peeglite nurk ise. Vaata pöörde kaart: ta on kaks korda suurem – kiir pöördub mõlemal peeglil.",
          },
        ],
      },
      {
        kind: "numeric",
        id: "explore-3",
        prompt: `Sea peeglite nurgaks ${deg(WIDER_MIRROR_DEG)}°. Kui palju kiir nüüd pöördub?`,
        hints: ["Pööre on alati kaks korda peeglite nurk."],
        unit: "°",
        tolerance: ANGLE_TOLERANCE,
        answer: WIDER_DEVIATION_DEG,
        traps: [
          {
            answer: WIDER_MIRROR_DEG,
            misconception: "peeglite-nurk-on-poorde-nurk",
            feedback: `See on peeglite nurk ise. Pööre on kaks korda suurem: 2 · ${deg(WIDER_MIRROR_DEG)}° = ${deg(WIDER_DEVIATION_DEG)}°.`,
          },
        ],
      },
      {
        kind: "choice",
        id: "explore-4",
        prompt: `Sea peeglite nurgaks ${deg(RIGHT_MIRROR_DEG)}°. Muuda nüüd AINULT langemisnurka. Mis juhtub väljuva kiirega?`,
        hints: ["Vaata pöörde arvu: kas ta liigub liuguriga kaasa?"],
        options: [
          {
            id: "muudab-suunda",
            text: "Ta muudab suunda koos langemisnurgaga",
            correct: false,
            misconception: "poore-soltub-langemisnurgast",
          },
          {
            id: "alati-vastassuunas",
            // Arv tuleb mudelist, mitte peast: sama arv on ka ekraanil.
            text: `Ta jääb alati sissetulevaga paralleelseks ja liigub vastassuunas – pööre on ${deg(RIGHT_DEVIATION_DEG)}° ükskõik millise langemisnurga juures`,
            correct: true,
          },
          {
            id: "ainult-45",
            text: "Ta väljub vastassuunas ainult siis, kui langemisnurk on 45°",
            correct: false,
            misconception: "tagasitulek-soltub-langemisnurgast",
          },
        ],
      },
    ],
    simulation: {
      // Pöörde lüliti avaneb alles pärast ESIMEST ülesannet. Kaks põhjust:
      // korraga muudetavaid suurusi jääb kaks, mitte kolm (moodulileping), ja –
      // mis tähtsam – õpilane peab kõigepealt ise nägema kaht peegeldust eraldi
      // (α + β = θ). Kui pöörde arv oleks kohe ekraanil, oleks mooduli vastus
      // („2θ") käes enne, kui ta on küsimuseni jõudnud.
      unlocks: [{ feature: "poorde-lyliti", afterQuestion: "explore-1" }],
    },
  },
  {
    type: "practice",
    id: "practice-1",
    title: "Proovi ise järele",
    // Näidis on LAHENDATUD ülesanne, mitte küsimus (docs/MOODULILEPING.md).
    worked: {
      prompt: `Kaks peeglit on ${deg(WORKED_MIRROR_DEG)}° nurga all. Kui palju pöördub nende vahelt läbi käiv kiir?`,
      solution: [
        "Pööre on kaks korda peeglite nurk.",
        `Seega 2 · ${deg(WORKED_MIRROR_DEG)}° = ${deg(WORKED_DEVIATION_DEG)}°.`,
      ],
      answer: `Kiir pöördub ${deg(WORKED_DEVIATION_DEG)}°. Peale peeglite nurga ei ole vaja midagi teada – ka seda mitte, kust kiir tuli.`,
    },
    questions: [
      {
        // Osaline: tehe on ees, vastus tuleb ise.
        kind: "numeric",
        id: "practice-1",
        prompt: `Peeglite nurk on ${deg(GAP_MIRROR_DEG)}°. Kiir pöördub 2 · ${deg(GAP_MIRROR_DEG)}° = ___ °.`,
        hints: ["Kaks korda peeglite nurk."],
        unit: "°",
        tolerance: ANGLE_TOLERANCE,
        answer: GAP_DEVIATION_DEG,
      },
      {
        // Iseseisev, pöördülesanne: pööre on teada, peeglite nurk otsitav.
        kind: "numeric",
        id: "practice-2",
        prompt: `Tahad suunata laseri valguse täpselt ${deg(LASER_DEVIATION_DEG)}° võrra tagasi ja kasutad selleks nurkpeeglit. Mis nurga alla pead peeglid seadma?`,
        hints: [
          "Pööre on kaks korda peeglite nurk – mis on siis peeglite nurk?",
          `${deg(LASER_DEVIATION_DEG)}° on kaks korda mis?`,
        ],
        unit: "°",
        tolerance: ANGLE_TOLERANCE,
        answer: LASER_MIRROR_DEG,
        // Kes kopeerib pöörde arvu jagamise asemel, saab just selle tagasiside.
        traps: [
          {
            answer: LASER_DEVIATION_DEG,
            misconception: "peeglite-nurk-on-poorde-nurk",
            feedback: `See on pööre ise. Peeglite nurk on POOL pöördest: ${deg(LASER_DEVIATION_DEG)}° : 2 = ${deg(LASER_MIRROR_DEG)}°.`,
          },
        ],
      },
      {
        // Iseseisev, joonise lugemine.
        kind: "numeric",
        id: "practice-3",
        figure: "np-loe-nurgad",
        prompt: `Vaata joonist: peeglite nurk on ${deg(FIGURE_MIRROR_DEG)}° ja langemisnurk esimesel peeglil ${deg(FIGURE_INCIDENCE_DEG)}°. Teise peegli juures on nurgakaar, aga arvu asemel küsimärk. Kui suur on langemisnurk teisel peeglil?`,
        hints: ["Kaks langemisnurka annavad kokku peeglite nurga."],
        unit: "°",
        tolerance: ANGLE_TOLERANCE,
        answer: FIGURE_SECOND_DEG,
      },
      {
        // Ülekanne, mitu õiget: periskoop.
        kind: "choice",
        id: "practice-4",
        prompt: `Periskoobis on kaks peeglit teineteisega paralleelselt (peeglite nurk ${deg(PARALLEL_MIRROR_DEG)}°), mõlemad 45° kaldu toru suhtes. Millised väited on õiged?`,
        hints: [
          "Iga peegel pöörab kiirt oma 90° eraldi, aga kaks 45°-kaldu peeglit paralleelselt tähendab, et lõppsuund jääb samaks – ainult koht muutub.",
        ],
        multiple: true,
        shuffle: true,
        options: [
          {
            id: "suund-ei-muutu",
            text: "Valguse suund ei muutu – vaatad otse edasi ja näed otse edasi",
            correct: true,
          },
          {
            id: "nihkub-korvale",
            text: "Valguse tee nihkub kõrvale, umbes toru pikkuse võrra",
            correct: true,
          },
          {
            id: "seadus-kehtib",
            text: "Mõlemal peeglil kehtib peegeldumisseadus",
            correct: true,
          },
          {
            id: "poorab-90",
            text: "Periskoop pöörab pilti 90° võrra",
            correct: false,
            misconception: "periskoop-poorab-pilti",
          },
          {
            id: "suurendab",
            text: "Periskoop suurendab pilti, sest valgus käib pikema tee",
            correct: false,
            misconception: "pikem-tee-suurendab",
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
        kind: "numeric",
        id: "exit-1",
        prompt: `Kaks peeglit on ${deg(EXIT_MIRROR_DEG)}° nurga all. Kui palju pöördub kiir kokku?`,
        hints: ["Kaks korda peeglite nurk."],
        unit: "°",
        tolerance: ANGLE_TOLERANCE,
        answer: EXIT_DEVIATION_DEG,
        traps: [
          {
            answer: EXIT_MIRROR_DEG,
            misconception: "peeglite-nurk-on-poorde-nurk",
            feedback: `See on peeglite nurk ise. Pööre on kaks korda suurem: 2 · ${deg(EXIT_MIRROR_DEG)}° = ${deg(EXIT_DEVIATION_DEG)}°.`,
          },
        ],
      },
      {
        kind: "choice",
        id: "exit-2",
        prompt: `Mis on täisnurkse (${deg(RIGHT_MIRROR_DEG)}°) nurkpeegli juures erilist?`,
        hints: ["Kaks korda peeglite nurk (90°) annab kokku 180° – kuhupoole see kiire pöörab?"],
        options: [
          {
            // Sildita vale variant: „jääb kinni" ei ole ükski mooduli
            // väärarusaamadest. `kaks-peeglit-tuhistavad` tähendab vastupidist
            // („kiir läheb lihtsalt edasi") ja vale sildi all jõuaks õpetaja
            // koondvaatesse väärarusaam, mida õpilasel ei olnud. Kitsas kiilus
            // kiir tõesti põrkab mitu korda, aga see küsimus käib 90° kohta ja
            // mitmekordne käik jääb sellest moodulist välja (spetsi „Piirid").
            id: "jaab-kinni",
            text: "Valgus jääb peeglite vahele kinni",
            correct: false,
          },
          {
            id: "tuleb-tagasi",
            text: "Valgus tuleb tagasi täpselt sinna, kust ta tuli – ükskõik kust ta tuli",
            correct: true,
          },
          {
            id: "valjub-90",
            text: `Valgus väljub ${deg(RIGHT_MIRROR_DEG)}° nurga all sissetuleva kiire suhtes`,
            correct: false,
            misconception: "peeglite-nurk-on-poorde-nurk",
          },
        ],
      },
      {
        kind: "text",
        id: "exit-3",
        prompt:
          "Sõber ütleb: „Periskoobis peegeldub valgus kaks korda, seega peab pilt olema kaks korda pööratud – ma ei saa sealt midagi aru.\" Mida sa talle vastad?",
        minWords: 10,
      },
    ],
  },
];

/**
 * Kordamiskaardid (docs/MOODULILEPING.md „activities.ts – kordamiskaardid",
 * sisu/MOODUL-nurkpeegel.md „Kordamiskaardid").
 */
const reviewCards: ReviewCard[] = [
  {
    id: "rc-1",
    type: "concept",
    question: "Mis on nurkpeegel?",
    answer:
      "Kaks tasast peeglit, mis on servapidi nurga all koos. Nende vahelt läbi käiv kiir peegeldub kaks korda ja pöördub kokku kaks korda rohkem, kui on peeglite vaheline nurk.",
  },
  {
    id: "rc-2",
    type: "calc",
    question: `Kaks peeglit on ${deg(CARD_DEVIATION_MIRROR_DEG)}° nurga all. Kui palju pöördub kiir?`,
    answer: `${deg(CARD_DEVIATION_DEG)}° – kaks korda peeglite nurk (2 · ${deg(CARD_DEVIATION_MIRROR_DEG)}°).`,
  },
  {
    id: "rc-3",
    type: "calc",
    question: `Kiir langeb esimesele peeglile ${deg(CARD_INCIDENCE_DEG)}° nurga all. Peeglite nurk on ${deg(CARD_MIRROR_DEG)}°. Kui suur on langemisnurk teisel peeglil?`,
    answer: `${deg(CARD_SECOND_DEG)}°, sest kaks langemisnurka annavad kokku peeglite nurga: ${deg(CARD_MIRROR_DEG)}° − ${deg(CARD_INCIDENCE_DEG)}° = ${deg(CARD_SECOND_DEG)}°.`,
  },
  {
    id: "rc-4",
    type: "explain",
    question: "Mis on täisnurkse nurkpeegli juures erilist?",
    answer: `Pööre on 2 · ${deg(RIGHT_MIRROR_DEG)}° = ${deg(RIGHT_DEVIATION_DEG)}°, seega väljub kiir alati sissetulevaga vastassuunas – ükskõik kui viltu ta sisse tuli. Sellel omadusel töötab helkur.`,
  },
  {
    id: "rc-5",
    type: "transfer",
    question:
      "Periskoobi peeglid on teineteisega paralleelsed. Miks ei ole pilt sealt pea peale pööratud?",
    answer: `Peeglite nurk on ${deg(PARALLEL_MIRROR_DEG)}°, seega on pööre 2 · ${deg(PARALLEL_MIRROR_DEG)}° = ${deg(PARALLEL_DEVIATION_DEG)}°. Esimene peegel keerab valgust ühele poole, teine sama palju tagasi – suund jääb samaks, muutub ainult koht, kust vaatame.`,
  },
];

export const activities = defineActivities({ steps, reviewCards });
