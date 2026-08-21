import { defineActivities } from "../../../engine/contract";
import type { ReviewCard, Step } from "../../../engine/contract";
import { formatNumber } from "../../../lib/format";
import {
  changingLettersOf,
  letterList,
  letters,
  mirrorWordText,
  symmetricLettersOf,
} from "./display";
import {
  SLIDERS,
  SYMMETRIC_LETTERS,
  imageDepthM,
  isVerticallySymmetricLetter,
  mirrorLetterIndex,
} from "./model";

/**
 * Sammud ja kordamiskaardid (docs/MOODULILEPING.md,
 * sisu/MOODUL-peeglikiri.md).
 *
 * **Ühtki tähe kohta ega „kas see täht on sümmeetriline" otsust ei ole siia
 * käsitsi kirjutatud** – kõik tulevad `model.ts`-i tehetest wordLength − 1 −
 * indexFromLeft ja loendist `SYMMETRIC_LETTERS` (CLAUDE.md reegel 1). Ka sõna
 * „OSKAT" ei ole siia tipitud: ta pannakse kokku `display.ts`-is, mis küsib iga
 * tähe uue koha mudelilt. Nii kukub vale arv testis, mitte tunnis.
 *
 * **Ühikud.** Tähe koht sõnas on ühikuta TÄISARV, kaugus peeglist meetrites.
 * Ühikuteisendusi selles moodulis ei ole (sisu/MOODUL-peeglikiri.md „Füüsika"):
 * indeksil ei ole ühikut ja meeter on ainus pikkusühik, milles moodul arve
 * näitab.
 *
 * **Kaugusel ei ole ühtki arvküsimust ja see on otsus, mitte unustus.** Liugur
 * on ekraanil selleks, et näidata, et kaugus EI muuda tähtede järjekorda ega
 * kuju (explore-4 on valikküsimus). Kaugusest arvu küsimine oleks mooduli
 * `tasapeegli-kujutis` ülesanne, mis siin juba läbitud eeldusena seisab
 * (sisu/MOODUL-peeglikiri.md „Piirid").
 *
 * **Neli piiri, mida ükski ülesanne ei ületa** (sisu/MOODUL-peeglikiri.md
 * „Piirid"):
 *
 * 1. **Kujutise kaugus ja päripidisus jäävad moodulisse `tasapeegli-kujutis`.**
 *    Siin on see EELDUS – teooria kordab tulemuse ühe lausega ja kasutab edasi.
 * 2. **Peegeldumisseadus ise** (α = β, ristsirge, mattpind) kuulub moodulile
 *    `peegeldumisseadus`. Ühtki nurka siin ei ole.
 * 3. **Ainult suured trükitähed.** Teistsugused tähekujud ja väiketähed jäävad
 *    välja – nemad nõuaksid tähekuju täpset joonist, mitte geomeetrilist reeglit.
 * 4. **3D-objektid ja pööramine ruumis** on inimese kehataju küsimus, mitte
 *    peegli füüsika. Moodul käsitleb lapikut kirja peegli ees.
 *
 * **Lõkse (`traps`) selles moodulis ei ole ja see on otsus, mitte unustus:**
 * mooduli väärarusaamad on kõik SÕNALISED („peegel vahetab vasaku ja parema
 * ära"), mitte kindla vale ARVU kujul. Ainus arvuline eksimus, mis siin mõeldav
 * oleks – lugeda indeksit ühest, mitte nullist – ei ole ühegi väärarusaama silt,
 * vaid lugemisviga; väljamõeldud lõksuarv annaks õpilasele sildi, mille
 * väärarusaama tal ei olnud (sama joon mis moodulites `kuu-faasid` ja
 * `lambivalik`).
 */

// --- Sõnad, mille peal moodul töötab ---------------------------------------

/**
 * Simulatsiooni nupurea kolm sõna (sisu/MOODUL-peeglikiri.md „explore").
 *
 * Eksporditud, sest samad kolm sõna on ka simulatsiooni nupureas
 * (Simulation.tsx, järgmine samm) – kaks loendit läheksid ühel päeval lahku ja
 * siis küsiks explore-1 sõna, mida ekraanil ei ole.
 *
 * TAKSO on Eestis päris levinud autokiri ja õpilasele tuttavam kui ingliskeelne
 * „AMBULANCE". TAAT (vanaisa) on valitud, sest ta on lühike eestikeelne sõna,
 * mis läbib KORRAGA mõlemad tingimused: ta on palindroom JA kõik tema tähed on
 * peegli-sümmeetrilised. Seda ei ole kusagilt kopeeritud, vaid otsitud
 * (sisu/MOODUL-peeglikiri.md „Allikad").
 */
export const WORDS = ["TAKSO", "KIIRABI", "TAAT"] as const;

const TAXI = WORDS[0];
const AMBULANCE = WORDS[1];
const GRANDPA = WORDS[2];

/** Harjutusülesannete sõnad – simulatsiooni nupureas neid ei ole. */
const CAR = "AUTO";
const MIRROR = "PEEGEL";

/**
 * Simulatsiooni liuguri algväärtus (m) – laual tehtava katse kaugus.
 *
 * Eksporditud samal põhjusel mis {@link WORDS}: Simulation.tsx impordib
 * needsamad arvud. Väärtus on liuguri võre peal (`SLIDERS.objectDepthM`), seega
 * saab õpilane alguskoha alati tagasi – see oli mooduli `varjutused` õppetund.
 */
export const START_DEPTH_M = 0.5;

/** Kujutise kaugus peegli TAGA (m) algseisus – märgita, nagu kastikeses. */
const START_IMAGE_DEPTH_M = Math.abs(imageDepthM(START_DEPTH_M));

// --- Arvud, mis tulevad mudelist -------------------------------------------

/** Sõna pikkus – üks koht, kust tähtede arv tuleb. */
const lengthOf = (word: string): number => letters(word).length;

/** Mitmes koht paberil (vasakult, nullist) – MUDELI tehe, mitte siinne. */
const paperIndex = (mirrorIndex: number, word: string): number =>
  mirrorLetterIndex(mirrorIndex, lengthOf(word));

/**
 * Mitu tähte sõnas jäävad peeglis ISE samasuguseks (explore-2).
 *
 * Loeb KÕIKI tähti, ka korduvaid – küsimus on „mitu tähte sõnas", mitte „mitu
 * eri tähte". TAKSO-s ei kordu ükski täht, aga TAAT-is kordub ja siis peab arv
 * olema neli, mitte kaks.
 */
const symmetricLetterCount = (word: string): number =>
  letters(word).filter((letter) => isVerticallySymmetricLetter(letter)).length;

const TAXI_MIRRORED = mirrorWordText(TAXI);
const TAXI_SYMMETRIC = symmetricLettersOf(TAXI);
const TAXI_CHANGING = changingLettersOf(TAXI);
const TAXI_SYMMETRIC_COUNT = symmetricLetterCount(TAXI);

/** Näidis: sõna AUTO esimene täht peeglis tuleb paberil kohalt 3. */
const CAR_FIRST_ON_PAPER = paperIndex(0, CAR);
/** Osaline: sõna KIIRABI viimane täht peeglis tuleb paberil kohalt 0. */
const AMBULANCE_LAST_ON_PAPER = paperIndex(lengthOf(AMBULANCE) - 1, AMBULANCE);
/** Iseseisev: sõna PEEGEL kolmas täht (koht 2) tuleb paberil kohalt 3. */
const MIRROR_MIDDLE_ON_PAPER = paperIndex(2, MIRROR);
/** Väljumispilet: sõna AUTO koht 1 tuleb paberil kohalt 2. */
const CAR_SECOND_ON_PAPER = paperIndex(1, CAR);

/**
 * Practice-3 tähevalik: kolm sümmeetrilist ja kolm muutuvat.
 *
 * Kumb on kumb, EI ole siia kirjutatud – iga variandi `correct` küsitakse
 * mudelilt. Kui `SYMMETRIC_LETTERS` kunagi muutub (nt kirjatüübi vahetusega),
 * muutub ülesande õige vastus koos temaga, mitte tema vastu.
 */
const PRACTICE_LETTERS = ["H", "M", "X", "K", "S", "F"] as const;

/**
 * Lugemistolerants, MITTE mõõtemääramatus: vastus on loendatud või arvutatud
 * TÄISARV. Spetsifikatsioonis seisab tolerants 0, aga moodulileping nõuab
 * positiivset arvu – ±0,5 tähendab täpselt sama asja, sest täisarv kõrvalt
 * (2 või 4) läheb valeks.
 */
const EXACT_TOLERANCE = { mode: "absolute", value: 0.5 } as const;

const steps: Step[] = [
  {
    type: "hook",
    id: "hook-1",
    // Joonis näitab AINULT auto kahte kirja. Miks nad eri pidi on, ütlevad
    // teooria ja simulatsioon – hook ei tohi vastust ette öelda.
    figure: "pk-kiirabiauto",
    title: "Sama sõna kahte pidi samal autol",
    body: [
      `Kiirabiauto kapotil ja uksel on sama sõna „${AMBULANCE}", aga kapotil on ta „valesti" kirjutatud.`,
      "Tehas ei teinud viga – vaata, mis juhtub, kui vaatad seda sõna auto ETTE jäävas peeglis.",
      "Sama nipp on taksodel, päästeautodel ja teleuudiste lugeja ees. Mille poolest peegel neid sõnu muudab?",
    ],
  },
  {
    type: "theory",
    id: "theory-1",
    title: "Üks lause peeglist, kaks lauset kirjast",
    figure: "pk-tahtede-summeetria",
    body: [
      "Meeldetuletus moodulist „Tasapeegli kujutis\": kujutis on peeglist sama kaugel kui ese ja ta on PÄRIPIDINE – pea on üleval, jalad all. Peegel ei tõsta midagi pea peale.",
      "Peegel peegeldab ainult ENDAGA RISTI suunas – sügavust. Ühtki peegli PINNAGA paralleelset suunda (vasak-parem ega üleval-alt-alla) ta ei puuduta. Mis sellest sinu enda peegelpildi kohta järeldub, uurime kohe hüpoteesiga.",
      `Miks kiri on siis ikkagi „tagurpidi"? Mõtle sõnale paberiribana, mis lebab LAUAL nii, et üks ots puudutab peeglit. Iga täht on siis omaeti sügavusel: sõna esimene täht on peeglist KAUGEL, viimane täht LÄHEDAL.`,
      `Sügavus pöördub – seesama fakt, ainult et nüüd eraldi iga tähe jaoks. Kaugel olnud tähest saab peeglis lähedal olev ja vastupidi, seega pöördub kogu tähtede JÄRJEKORD. Sõna „${TAXI}" paistab peeglis kujul „${TAXI_MIRRORED}", kuigi ükski üksik täht ise vasakule ega paremale ei liigu.`,
      "Selleks, et kiri peeglis LOETAV oleks, peavad klappima kaks asja korraga. Esiteks peavad tähed olema PABERIL vastupidises järjekorras. Teiseks peab iga TÄHT ISE olema peegeldatud kujuga.",
      `Enamik tähti (K, S, E, F...) näeb peeglis välja lihtsalt vale. Mõned aga näevad peegeldatuna välja täpselt samasugused: ${letterList(
        SYMMETRIC_LETTERS,
      )}. Neid tähti ei pea peeglikirjas ümber joonistama – nad on juba õiged.`,
    ],
  },
  {
    type: "predict",
    id: "predict-1",
    title: "Paku oma ennustus",
    body: [
      "Seisad peegli ees ja tõstad OMA PAREMA käe üles. Vaata nüüd kujutist.",
    ],
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt:
          "Kummal pool tuba on kujutise tõstetud käsi – kas kujutise vaatepunktist vasakul või samal pool tuba, kus on sinu tõstetud käsi?",
        options: [
          {
            id: "kujutise-vasakul",
            text: "Kujutise vasakul käel – peegel vahetab vasaku ja parema ära",
            correct: false,
            misconception: "peegel-vahetab-vasaku-parema",
          },
          {
            id: "samal-pool",
            text: "Samal pool tuba, kus on sinu tõstetud käsi – peegel ei liiguta midagi vasakule ega paremale, ainult sügavusse",
            correct: true,
          },
          {
            id: "ules",
            text: "Üleval, sest peegel pöörab kõik 90° võrra",
            correct: false,
            misconception: "peegel-poorab-90-kraadi",
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
    title: "Katseta sõna peegli ees",
    body: [
      "Pilt on PEALTVAADE: peegel on püstine joon, selle ees laual paberileht sõnaga. Nupureaga valid sõna, mis paberil seisab.",
      "Ekraanil on korraga kaks asja: PABER (sõna tavalises kirjas) ja KUJUTIS PEEGLIS (sama sõna peegeldatuna) – kumbki oma sildi all.",
      `Rohelised tähed jäävad peeglis ise samasuguseks, punased muutuvad. Sõnas „${TAXI}" on rohelised ${letterList(
        TAXI_SYMMETRIC,
      )} ja punased ${letterList(TAXI_CHANGING)}.`,
      `Liugur muudab paberi kaugust peeglist: ${formatNumber(
        SLIDERS.objectDepthM.min,
        1,
      )}…${formatNumber(SLIDERS.objectDepthM.max, 1)} m, alguses ${formatNumber(
        START_DEPTH_M,
        1,
      )} m. Kastikeses seisab siis „peegli taga ${formatNumber(
        START_IMAGE_DEPTH_M,
        1,
      )} m" – täpselt sama palju, kui paber on peeglist ees.`,
    ],
    questions: [
      {
        kind: "choice",
        id: "explore-1",
        prompt: `Vali sõna „${TAXI}". Mis järjekorras seisavad tähed peeglis?`,
        hints: [`Loe kastikest „Sõna peeglis".`],
        // Järjekord kannab siin tähendust (sama, vastupidi, segamini), aga
        // segamine ei tee sellest vihjet – variandid on nagunii eri kujuga.
        options: [
          {
            id: "sama",
            text: `${letterList(letters(TAXI))} (sama)`,
            correct: false,
            misconception: "jarjekord-ei-poordu",
          },
          {
            id: "vastupidi",
            text: `${letterList(letters(TAXI_MIRRORED))} (täpselt vastupidi)`,
            correct: true,
          },
          {
            // Sildita vale variant: „juhuslik segamini" ei ole ükski mooduli
            // väärarusaamadest – see on lihtsalt pakkumine.
            id: "segamini",
            text: "Juhuslikult segamini",
            correct: false,
          },
        ],
      },
      {
        kind: "numeric",
        id: "explore-2",
        prompt: `Vaata rohelisi ja punaseid tähti. Mitu tähte sõnas „${TAXI}" jäävad peeglis ISE samasuguseks (rohelised)?`,
        hints: [`Loe rohelisi tähti – ${letterList(TAXI_SYMMETRIC)}.`],
        // Ühikut ei ole: loendatud tähtede arv on ühikuta.
        tolerance: EXACT_TOLERANCE,
        answer: TAXI_SYMMETRIC_COUNT,
      },
      {
        kind: "choice",
        id: "explore-3",
        prompt: `Vali sõna „${GRANDPA}". Ilmub see sõna peeglis täpselt samasugusena?`,
        hints: [
          `Vaata kahte asja: kas sõna peeglis on sama, ja kas kõik tähed on rohelised.`,
        ],
        options: [
          {
            id: "jah",
            text: `Jah – „${GRANDPA}" on palindroom (tagant ette loetuna sama) JA kõik tema tähed on sümmeetrilised`,
            correct: true,
          },
          {
            id: "jarjekord",
            text: "Ei, sest tähtede järjekord ikkagi pöördub",
            correct: false,
            misconception: "jarjekord-ei-poordu",
          },
          {
            id: "t-ei-ole",
            text: "Ei, sest T ei ole sümmeetriline täht",
            correct: false,
            misconception: "t-ei-ole-summeetriline",
          },
        ],
      },
      {
        kind: "choice",
        id: "explore-4",
        prompt: `Lohista paberi kaugus ${formatNumber(
          SLIDERS.objectDepthM.min,
          1,
        )} m pealt ${formatNumber(
          SLIDERS.objectDepthM.max,
          1,
        )} m peale. Kas tähtede JÄRJEKORD peeglis muutub?`,
        hints: [
          "Vaata liigutamise ajal kastikest „Sõna peeglis\" – kas ta muutub?",
        ],
        options: [
          {
            id: "muutub",
            text: "Jah, kaugemal on järjekord teine",
            correct: false,
            misconception: "kaugus-muudab-jarjekorda",
          },
          {
            id: "ei-muutu",
            text: "Ei – kaugus muudab ainult kujutise sügavust, mitte tähtede järjekorda ega kuju",
            correct: true,
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
      prompt: `Sõna „${CAR}" tähed on kohtadel ${letters(CAR)
        .map((letter, index) => `${index} (${letter})`)
        .join(", ")}. Mitmendale kohale peab paberil minema täht, mis peeglis paistab kohal 0?`,
      solution: [
        `Sõnas on ${formatNumber(lengthOf(CAR))} tähte.`,
        `Tähtede arv − 1 − koht peeglis = ${formatNumber(
          lengthOf(CAR),
        )} − 1 − 0 = ${formatNumber(CAR_FIRST_ON_PAPER)}.`,
        `Kontroll: täht kohal ${formatNumber(
          CAR_FIRST_ON_PAPER,
        )} on paberil kõige LÄHEMAL peeglile – ja lähim täht paistab peeglis sõna alguses.`,
      ],
      answer: `Kohale ${formatNumber(CAR_FIRST_ON_PAPER)}.`,
    },
    questions: [
      {
        // Osaline: tehe on ees, vastus tuleb ise.
        kind: "numeric",
        id: "practice-1",
        prompt: `Sõnas „${AMBULANCE}" on ${formatNumber(
          lengthOf(AMBULANCE),
        )} tähte (kohad 0…${formatNumber(
          lengthOf(AMBULANCE) - 1,
        )}). Millisel kohal peab paberil olema täht, mis peeglis paistab kõige viimasel kohal (kohal ${formatNumber(
          lengthOf(AMBULANCE) - 1,
        )})? ${formatNumber(lengthOf(AMBULANCE))} − 1 − ${formatNumber(
          lengthOf(AMBULANCE) - 1,
        )} = ___`,
        hints: [
          `${formatNumber(lengthOf(AMBULANCE))} − 1 − ${formatNumber(
            lengthOf(AMBULANCE) - 1,
          )}`,
        ],
        tolerance: EXACT_TOLERANCE,
        answer: AMBULANCE_LAST_ON_PAPER,
      },
      {
        // Iseseisev: sama tehe ilma ette antud lünkata.
        kind: "numeric",
        id: "practice-2",
        prompt: `Sõnas „${MIRROR}" on ${formatNumber(
          lengthOf(MIRROR),
        )} tähte. Mitmendale kohale paberil peab minema täht, mis peeglis paistab keset sõna, kohal 2?`,
        hints: [
          "Kasuta sama tehet: tähtede arv − 1 − koht peeglis.",
          `${formatNumber(lengthOf(MIRROR))} − 1 − 2`,
        ],
        tolerance: EXACT_TOLERANCE,
        answer: MIRROR_MIDDLE_ON_PAPER,
      },
      {
        // Iseseisev, mitu õiget: tähe KUJU, mitte koht.
        kind: "choice",
        id: "practice-3",
        prompt:
          "Millised neist tähtedest on peegli-sümmeetrilised (näevad peeglis välja täpselt samasugused)?",
        hints: [
          "Kujuta ette peeglit tähe vertikaalsel keskjoonel – kas vasak ja parem pool kattuvad?",
        ],
        multiple: true,
        shuffle: true,
        // Õigsust EI otsusta see fail: iga variant küsib mudelilt.
        options: PRACTICE_LETTERS.map((letter) => {
          const symmetric = isVerticallySymmetricLetter(letter);
          return {
            id: letter.toLowerCase(),
            text: letter,
            correct: symmetric,
            ...(symmetric
              ? {}
              : { misconception: "koik-tahed-tunduvad-summeetrilised" }),
          };
        }),
      },
      {
        // Ülekanne: sama nipp teises seadmes.
        kind: "choice",
        id: "practice-4",
        prompt:
          "Miks kirjutatakse teleprompteri (souflööri) tekst ekraanil peegelkirjas?",
        hints: [
          "Tekst käib teel lugejani läbi klaasi, kust ta peegeldub – peegeldumine pöörab kirja teist korda.",
        ],
        options: [
          {
            // Sildita vale variant: „et keegi maha ei kirjutaks" ei ole ükski
            // mooduli väärarusaamadest, vaid pakkumine.
            id: "maha-kirjutamine",
            text: "Et vaataja ei saaks teksti maha kirjutada",
            correct: false,
          },
          {
            id: "peegeldub-klaasilt",
            text: "Selleks, et tekst näeks pärast poolläbipaistvalt klaasilt peegeldumist LUGEJALE õigetpidi välja",
            correct: true,
          },
          {
            id: "mahub-ekraanile",
            text: "Et tekst mahuks ekraanile väiksemana",
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
        prompt:
          "Seisad peegli ees ja tõstad parema käe. Kummal pool tuba on kujutise tõstetud käsi?",
        hints: [
          "Peegel ei vaheta vasakut ja paremat ära – proovi ise peegli ees, kummal pool käsi tõuseb.",
        ],
        options: [
          {
            id: "kujutise-vasakul",
            text: "Kujutise vasakul",
            correct: false,
            misconception: "peegel-vahetab-vasaku-parema",
          },
          {
            id: "samal-pool",
            text: "Samal pool tuba, kus sinu käsi on",
            correct: true,
          },
          {
            // Sildita vale variant: kauguse mõju kujutise POOLELE ei ole ükski
            // mooduli väärarusaamadest – `kaugus-muudab-jarjekorda` käib
            // tähtede järjekorra, mitte käe poole kohta. Vale silt jõuaks
            // õpetaja koondvaatesse väärarusaamana, mida õpilasel ei olnud.
            id: "soltub-kaugusest",
            text: "Sõltub sellest, kui kaugel peeglist seisad",
            correct: false,
          },
        ],
      },
      {
        kind: "numeric",
        id: "exit-2",
        prompt: `Sõnas „${CAR}" (${formatNumber(
          lengthOf(CAR),
        )} tähte, kohad 0…${formatNumber(
          lengthOf(CAR) - 1,
        )}) peab täht kohalt 1 minema paberil mitmendale kohale, et ta peeglis paistaks kohal 1?`,
        hints: [`${formatNumber(lengthOf(CAR))} − 1 − 1`],
        tolerance: EXACT_TOLERANCE,
        answer: CAR_SECOND_ON_PAPER,
      },
      {
        kind: "text",
        id: "exit-3",
        prompt:
          "Sõber ütleb: „Peeglid on veidrad – nad vahetavad vasaku ja parema ära, aga mitte üleval-all.\" Mis sa talle vastad?",
        minWords: 10,
      },
    ],
  },
];

/**
 * Kordamiskaardid (docs/MOODULILEPING.md „activities.ts – kordamiskaardid",
 * sisu/MOODUL-peeglikiri.md „Kordamiskaardid").
 */
const reviewCards: ReviewCard[] = [
  {
    id: "rc-1",
    type: "explain",
    question:
      "Miks öeldakse, et peegel vahetab vasaku ja parema ära, kui tegelikult ta seda ei tee?",
    answer:
      "Peegel peegeldab ainult ENDAGA RISTI suunas ehk sügavust. Vasak-parem vahetus tundub tekkivat ainult siis, kui kujutame kujutist ette meie poole pööratud inimesena – see mõtteline pööramine, mitte peegel, ajab vasaku ja parema segi.",
  },
  {
    id: "rc-2",
    type: "transfer",
    question: `Miks kirjutatakse kiirabiauto kapotile sõna „${AMBULANCE}" tagurpidi?`,
    answer:
      "Et see auto EES sõitva juhi tahavaatepeeglis õigetpidi loetav oleks. Peegel näitab kapoti tagantvaadet, kus tähtede järjekord on pöördunud.",
  },
  {
    id: "rc-3",
    type: "calc",
    question: `Sõnas on ${formatNumber(
      lengthOf(TAXI),
    )} tähte (kohad 0…${formatNumber(
      lengthOf(TAXI) - 1,
    )}). Mitmendale kohale peab paberil minema täht, mis peeglis peab paistma esimesena (kohal 0)?`,
    answer: `Tähtede arv − 1 − koht peeglis = ${formatNumber(
      lengthOf(TAXI),
    )} − 1 − 0 = ${formatNumber(
      paperIndex(0, TAXI),
    )}. Täht peab olema paberil kõige lähemal peeglile.`,
  },
  {
    id: "rc-4",
    type: "concept",
    question: "Mis teeb tähe „vertikaalselt sümmeetriliseks\"?",
    answer: `Ta näeb pärast peegeldust välja täpselt samasugune – näiteks ${letterList(
      SYMMETRIC_LETTERS,
    )}. Enamik tähti (K, S, E, F jt) ei ole sümmeetrilised ja muutuvad peeglis loetamatuks.`,
  },
  {
    id: "rc-5",
    type: "explain",
    question: `Sõna „${GRANDPA}" ilmub peeglis täpselt samasugusena. Miks just see sõna?`,
    answer: `Kaks põhjust korraga: „${GRANDPA}" on palindroom (tagant ette loetuna sama) JA kõik tema tähed (${letterList(
      symmetricLettersOf(GRANDPA),
    )}) on vertikaalselt sümmeetrilised. Enamikul sõnadel jääb vähemalt üks neist kahest tingimusest täitmata.`,
  },
];

export const activities = defineActivities({ steps, reviewCards });
