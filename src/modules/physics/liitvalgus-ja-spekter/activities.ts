import { defineActivities } from "../../../engine/contract";
import type { ReviewCard, Step } from "../../../engine/contract";
import {
  LIGHT_SOURCES,
  SPECTRUM_BANDS,
  VISIBLE_MAX_NM,
  VISIBLE_MIN_NM,
  bandCount,
  bandWidthNm,
  visibleRangeWidthNm,
} from "./model";

/**
 * Sammud ja kordamiskaardid (docs/MOODULILEPING.md,
 * sisu/MOODUL-liitvalgus-ja-spekter.md).
 *
 * **Ükski arv ei ole siia käsitsi kirjutatud** – ribade arv, ribade piirid,
 * riba laius ja nähtava ala laius tulevad `model.ts`-ist (CLAUDE.md reegel 1).
 * Nii ei saa ülesande vastus ja simulatsiooni näit kunagi lahku minna: kui
 * keegi muudab kollase riba ülemist otsa, muutub ka harjutuse tekst. Testis
 * (tests/liitvalgus-ja-spekter.model.test.ts) võrreldakse neid arve
 * SPETSIFIKATSIOONI tabeliga, mitte activities.ts iseendaga.
 *
 * **Kõik lainepikkused on nanomeetrites** – teisendust selles moodulis ei ole.
 *
 * Tolerantsid (spetsifikatsioon „explore"):
 *
 * - lainepikkus ±5 nm, ABSOLUUTNE. Protsent oleks eksitav: 5% kuuesajast on
 *   30 nm ehk poolteist ribat, 5% neljasajast aga 20 nm – sama vastus oleks
 *   spektri eri otstes eri rangusega. ±5 nm juures on laseri vastuse ümber
 *   lubatud täpselt need liuguri asendid (645, 650, 655), kus riba on
 *   värviline; ±10 nm võtaks vastu ka 640 ja 660, kus sama ekraan ütleb „ei
 *   kiirga" (Codexi leid samm 4.1v).
 * - loendatud ribad ja riba laius: TÄPNE arv. Moodulileping nõuab positiivset
 *   tolerantsi, seega on kirjas ±0,5 – väikseim arv, mis tähendab „täpselt see
 *   täisarv" ja ei lase naaberarvu läbi.
 */

/** Riba mudelist – ülesande tekst ei tohi ribade piire peast teada. */
function band(bandId: string) {
  const found = SPECTRUM_BANDS.find((candidate) => candidate.id === bandId);
  if (!found) throw new RangeError(`Tundmatu spektri riba: ${bandId}`);
  return found;
}

/**
 * Allika ainus kiirgusvahemik mudelist.
 *
 * Kasutame teda ainult ühe riba allikate (laser, naatriumlamp) juures – nende
 * jaoks ta ongi „see koht spektris". Mitme vahemikuga allikal ei oleks sellel
 * mõtet, seega viskab funktsioon siis vea, mitte ei vali vaikselt esimest.
 */
function onlyRange(sourceId: string) {
  const source = LIGHT_SOURCES.find((candidate) => candidate.id === sourceId);
  if (!source) throw new RangeError(`Tundmatu valgusallikas: ${sourceId}`);
  if (source.emitted.length !== 1) {
    throw new RangeError(`Allikal "${sourceId}" ei ole täpselt üht vahemikku`);
  }
  return source.emitted[0];
}

/** Lainepikkus ±5 nm – liuguri samm on 5 nm (vt faili päist). */
const WAVELENGTH_TOLERANCE = { mode: "absolute", value: 5 } as const;

/** Loendatud või lahutatud täisarv: ±0,5 tähendab „täpselt see arv". */
const EXACT_TOLERANCE = { mode: "absolute", value: 0.5 } as const;

// --- Ülesannete seisud ja nende vastused (vastused mudelist) ---------------

/** Explore 1: päikesevalguse spektris on kõik vikerkaarevärvid. */
const SUN_BAND_COUNT = bandCount("sun");

/**
 * Explore 2: laseri riba keskkoht.
 *
 * Vastus tuleb mudeli vahemikust, mitte peast: kui laseri riba kunagi nihkub,
 * nihkub ülesande vastus temaga koos. Keskkoht on ka liuguri võre peal, sest
 * vahemik 645–655 on sammu (5 nm) kordne.
 */
const LASER_RANGE = onlyRange("laser");
const LASER_PEAK_NM = (LASER_RANGE.minNm + LASER_RANGE.maxNm) / 2;

/** Explore 3 ja 4: valge LED-i ribade arv ja naatriumlambi üksainus riba. */
const LED_BAND_COUNT = bandCount("led");
const SODIUM_RANGE = onlyRange("sodium");
const SODIUM_BAND = band("yellow");

/** Practice 2 (osaline): rohelise riba laius. */
const GREEN = band("green");
const GREEN_WIDTH_NM = bandWidthNm(GREEN.id);

/** Practice 4 ja rc-3: naatriumlambi 589 nm – napilt kollase ülemise otsa all. */
const SODIUM_LINE_NM = 589;

/** Exit 2: kogu nähtava ala laius. */
const VISIBLE_WIDTH_NM = visibleRangeWidthNm();

const steps: Step[] = [
  {
    type: "hook",
    id: "hook-1",
    // Joonis näitab ainult seda, ET vana lambi all paistavad autod ühesugused.
    // MIKS, seda ütlevad teooria ja simulatsioon – hook ei tohi vastust ette
    // öelda.
    figure: "ls-tanavavalgusti",
    title: "Miks olid vana lambi all kõik autod ühte värvi?",
    body: [
      "Vana tänavavalgusti all nägid kõik pargitud autod välja ühtemoodi kollakashallid. Uue valgusti all on üks neist punane ja teine sinine.",
      "Autod on täpselt samad. Mis on siis teistsugune?",
      "Täna saad teada, et valge valgus koosneb paljudest värvidest, ja õpid spektri järgi ütlema, kas valgus on liht- või liitvalgus.",
    ],
  },
  {
    type: "theory",
    id: "theory-1",
    title: "Valge valgus on värvide segu",
    body: [
      "Valguse SPEKTER näitab, millistest värvidest ehk lainepikkustest valgus koosneb. Spektri saab nähtavaks teha prisma või CD-plaadiga – miks see nii juhtub, uurime murdumise juures.",
      "LIITVALGUS koosneb mitmest värvist, LIHTVALGUS ainult ühest. Lihtvalguse spektris on üksainus kitsas riba (näiteks punase laseri oma 650 nm ümber), liitvalguse spektris mitu.",
      "Valge valgus on liitvalgus: päikesevalguses on olemas kõik vikerkaarevärvused – violett, tumesinine, sinine, roheline, kollane, oranž ja punane. Kui need uuesti kokku panna, tuleb jälle valge. Valge ei ole seega „värvitu\", vaid „kõik korraga\".",
      `Lainepikkust mõõdetakse nanomeetrites (nm, miljardik meetrit). Nähtav valgus on ${VISIBLE_MIN_NM}–${VISIBLE_MAX_NM} nm; lühem on ultraviolett, pikem infrapunane – neid silm ei näe.`,
      "Värvide segamine guaššiga on hoopis teine asi. Seal segatakse värviAINEID, mis valgust ära neelavad; siin liidetakse VALGUSI. Sellepärast annab kollane + sinine värvipurgis rohelise, aga valgusvihkudena hoopis valkja tooni.",
    ],
    figure: "ls-spekter-riba",
  },
  {
    type: "predict",
    id: "predict-1",
    title: "Paku oma ennustus",
    body: [
      "Spektroskoop on riist, mis näitab, millised värvid valguses olemas on. Vaatame sellega kahte valgust: päikesevalgust ja punase laseri kiirt.",
    ],
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt: "Mida näitab spektroskoop laseri kohta?",
        options: [
          {
            id: "vikerkaar",
            text: "Sama vikerkaart nagu päikesevalgusel, ainult punakamat",
            correct: false,
            misconception: "koik-valgus-on-liitvalgus",
          },
          {
            id: "uks-riba",
            text: "Ainult üht kitsast punast riba, mujal on tühjus",
            correct: true,
          },
          {
            id: "mitte-midagi",
            text: "Mitte midagi – laser on liiga ere",
            correct: false,
            misconception: "spekter-soltub-eredusest",
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
    title: "Uuri spektroskoobiga",
    body: [
      "Ülal valid valgusallika, keskel on spektririba 380–760 nm. Värviline on riba ainult seal, kus valitud allikas päriselt kiirgab – ülejäänu jääb tumedaks.",
      "Liuguriga liigutad markerit mööda riba: all seisab, mis värv sellel lainepikkusel on ja kas see allikas seda värvi kiirgab. Paremal näed, mitu vikerkaarevärvi ribas on ja kuidas silm seda valgust näeb.",
    ],
    simulation: {
      // Silma kolme anduri selgitus ilmub alles pärast ülesannet 3: enne seda
      // peab õpilane spektrist ise nägema, et punane riba on puudu.
      unlocks: [{ feature: "silma-andurid", afterQuestion: "explore-3" }],
    },
    questions: [
      {
        kind: "numeric",
        id: "explore-1",
        prompt: "Vali päikesevalgus. Mitu vikerkaarevärvi on spektris olemas?",
        hints: ["Loe ribas olevad värvid kokku – paremal on ka näidik."],
        tolerance: EXACT_TOLERANCE,
        answer: SUN_BAND_COUNT,
      },
      {
        kind: "numeric",
        id: "explore-2",
        prompt:
          "Vali punane laser ja otsi liuguriga üles koht, kus riba on värviline. Mis lainepikkusel laser kiirgab?",
        hints: [
          "Liigu punase otsa poole.",
          "Riba on kitsas – ainult paar liuguri sammu lai.",
        ],
        unit: "nm",
        tolerance: WAVELENGTH_TOLERANCE,
        answer: LASER_PEAK_NM,
      },
      {
        kind: "choice",
        id: "explore-3",
        prompt:
          "Vali valge LED-lamp. Ta paistab valge, aga vaata spektrit hoolega. Milline värv on peaaegu puudu?",
        options: [
          { id: "sinine", text: "Sinine", correct: false },
          { id: "roheline", text: "Roheline", correct: false },
          { id: "punane", text: "Punane", correct: true },
        ],
      },
      {
        kind: "choice",
        id: "explore-4",
        prompt: "Vali naatriumlamp. Kumb väide on õige?",
        options: [
          {
            id: "liitvalgus",
            text: "Naatriumlamp annab liitvalgust, sest kollane on segavärv",
            correct: false,
            // Segavärv on VÄRVIAINETE mõte: kollase värvi saab purgis segades.
            // Valgusena on kollane üksainus lainepikkuste riba.
            misconception: "valgus-ja-varviaine-sama",
          },
          {
            id: "lihtvalgus",
            text: "Naatriumlamp annab lihtvalgust – spektris on ainult üks riba",
            correct: true,
          },
          {
            id: "pole-spektrit",
            text: "Naatriumlambil ei ole spektrit",
            correct: false,
            misconception: "koik-valgus-on-liitvalgus",
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
      prompt: "Mille poolest erineb päikesevalgus laseri valgusest?",
      solution: [
        `Päikesevalguse spektris on kõik ${SUN_BAND_COUNT} vikerkaarevärvi ${VISIBLE_MIN_NM} nm-st ${VISIBLE_MAX_NM} nm-ni – see on LIITVALGUS ja silm näeb seda valgena.`,
        `Laseri spektris on üksainus kitsas riba ${LASER_PEAK_NM} nm juures – see on LIHTVALGUS ja silm näeb seda punasena.`,
        "Vahet ei tee eredus, vaid see, mitu värvi valguses on.",
      ],
      answer: `Päikesevalgus on liitvalgus (${SUN_BAND_COUNT} riba), laseri valgus on lihtvalgus (üks riba ${LASER_PEAK_NM} nm juures).`,
    },
    questions: [
      {
        // Osaline: tehe on ees, vastus tuleb ise.
        kind: "numeric",
        id: "practice-1",
        prompt: `Rohelise riba lainepikkused on ${GREEN.minNm}–${GREEN.maxNm} nm. Kui lai see riba on? Täida: ${GREEN.maxNm} − ${GREEN.minNm} = ___ nm`,
        hints: ["Lahuta suuremast väiksem."],
        unit: "nm",
        tolerance: EXACT_TOLERANCE,
        answer: GREEN_WIDTH_NM,
      },
      {
        kind: "choice",
        id: "practice-2",
        figure: "ls-kolm-spektrit",
        prompt: "Vaata kolme spektrit. Milline neist on kindlasti LIHTvalgus?",
        hints: ["Lihtvalguse spektris on ainult üks kitsas riba."],
        // Järjekord A, B, C kannab tähendust – joonisel on ribad samas reas.
        shuffle: false,
        options: [
          {
            id: "a",
            text: "A – värviline algusest lõpuni",
            correct: false,
            misconception: "koik-valgus-on-liitvalgus",
          },
          { id: "b", text: "B – üksainus kitsas kollane riba", correct: true },
          { id: "c", text: "C – kolm eraldi ribat", correct: false },
        ],
      },
      {
        kind: "choice",
        id: "practice-3",
        prompt: `Naatriumlamp kiirgab ${SODIUM_LINE_NM} nm juures. Mis värvi valgus see on ja mis vahemikku see riba kuulub?`,
        hints: [
          `Vaata teooria spektririba skaalat – ${SODIUM_LINE_NM} jääb napilt ${SODIUM_BAND.maxNm}-st allapoole.`,
        ],
        // Vahemikud on kasvavas järjekorras – see järjekord kannab tähendust.
        shuffle: false,
        options: [
          { id: "roheline", text: `Roheline, ${GREEN.minNm}–${GREEN.maxNm} nm`, correct: false },
          {
            id: "kollane",
            text: `Kollane, ${SODIUM_BAND.minNm}–${SODIUM_BAND.maxNm} nm`,
            correct: true,
          },
          {
            id: "oranz",
            text: `Oranž, ${band("orange").minNm}–${band("orange").maxNm} nm`,
            correct: false,
          },
        ],
      },
      {
        // Ülekanne, mitu õiget.
        kind: "choice",
        id: "practice-4",
        prompt: "Millised väited on õiged?",
        multiple: true,
        shuffle: true,
        options: [
          { id: "valge-liit", text: "Valge valgus on liitvalgus", correct: true },
          {
            id: "laser-liht",
            text: "Laseri punane valgus on lihtvalgus",
            correct: true,
          },
          {
            id: "prismas",
            text: "Valge valgus on värvitu ja värvid tekivad alles prismas",
            correct: false,
            misconception: "varvid-tekivad-prismas",
          },
          {
            id: "kokku-valge",
            text: "Kui spektri värvid uuesti kokku viia, tuleb jälle valge valgus",
            correct: true,
          },
          {
            id: "ere-valge",
            text: "Iga ere valgus on valge valgus",
            correct: false,
            misconception: "spekter-soltub-eredusest",
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
        prompt: "Valge valgus on…",
        options: [
          {
            id: "varvitu",
            text: "Värvitu valgus, milles ühtki värvi ei ole",
            correct: false,
            misconception: "valge-on-varvitu",
          },
          {
            // Sõnastus „mitu värvi, päikesevalguses kõik" on täpne meelega:
            // „koosneb KÕIGIST vikerkaarevärvidest" oleks vastuolus sammuga
            // explore-3, kus valge LED paistab valge, kuigi punane riba on tal
            // peaaegu puudu (CodeRabbiti leid samm 4.1u).
            id: "liitvalgus",
            text: "Liitvalgus – temas on korraga mitu värvi (päikesevalguses kõik vikerkaarevärvid)",
            correct: true,
          },
          {
            id: "lihtvalgus",
            text: "Lihtvalgus, mille lainepikkus on 550 nm",
            correct: false,
            misconception: "koik-valgus-on-liitvalgus",
          },
        ],
      },
      {
        kind: "numeric",
        id: "exit-2",
        prompt: `Nähtava valguse ala on ${VISIBLE_MIN_NM}–${VISIBLE_MAX_NM} nm. Kui lai see ala on?`,
        hints: ["Lahuta suuremast väiksem."],
        unit: "nm",
        tolerance: EXACT_TOLERANCE,
        answer: VISIBLE_WIDTH_NM,
      },
      {
        kind: "text",
        id: "exit-3",
        prompt:
          "Kaks lampi paistavad mõlemad valged, aga ühe spektris on kõik värvid ja teise spektris on punane peaaegu puudu. Selgita, mille poolest need lambid erinevad ja kummast oleks poes riiete värvi vaadates rohkem kasu.",
        minWords: 10,
      },
    ],
  },
];

/**
 * Kordamiskaardid (docs/MOODULILEPING.md „activities.ts – kordamiskaardid",
 * sisu/MOODUL-liitvalgus-ja-spekter.md „Kordamiskaardid").
 */
const reviewCards: ReviewCard[] = [
  {
    id: "rc-1",
    type: "concept",
    question: "Mis on valguse spekter?",
    answer:
      "Ülevaade sellest, millistest värvidest ehk lainepikkustest valgus koosneb.",
  },
  {
    id: "rc-2",
    type: "concept",
    question: "Mis vahe on liht- ja liitvalgusel? Too mõlemast näide.",
    answer: `Lihtvalguses on ainult üks värv ehk spektris üksainus kitsas riba (laser ${LASER_PEAK_NM} nm juures, naatriumlamp ${SODIUM_RANGE.minNm}–${SODIUM_RANGE.maxNm} nm). Liitvalguses on ribasid mitu (päikesevalgus ${SUN_BAND_COUNT}, hõõglamp sama palju, valge LED ${LED_BAND_COUNT}).`,
  },
  {
    id: "rc-3",
    type: "calc",
    question: `Mis värvi on ${SODIUM_LINE_NM} nm lainepikkusega valgus, kui kollane riba on ${SODIUM_BAND.minNm}–${SODIUM_BAND.maxNm} nm?`,
    answer: `Kollane – ${SODIUM_LINE_NM} jääb napilt ${SODIUM_BAND.maxNm}-st allapoole.`,
  },
  {
    id: "rc-4",
    type: "explain",
    question: "Miks öeldakse, et valge valgus ei ole värvitu?",
    answer:
      "Valges valguses on mitu värvi korraga – päikesevalguses kõik vikerkaarevärvid. Kui need lahutada ja uuesti kokku panna, tuleb jälle valge.",
  },
  {
    id: "rc-5",
    type: "transfer",
    question:
      "Kaks lampi paistavad ühtviisi valged. Kuidas saab teada, kumb neist annab täielikuma spektri?",
    answer:
      "Vaadata nende valgust CD-plaadi või prismaga: täieliku spektriga lambil on riba katkematu, LED-lambil on punane ots nõrk või puudu.",
  },
];

export const activities = defineActivities({ steps, reviewCards });
