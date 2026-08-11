import { defineActivities } from "../../../engine/contract";
import type { ReviewCard, Step } from "../../../engine/contract";
import { formatNumber } from "../../../lib/format";
import {
  imageDistance,
  minMirrorHeight,
  objectImageSeparation,
  visibleBodyHeight,
} from "./model";

/**
 * Sammud ja kordamiskaardid (docs/MOODULILEPING.md,
 * sisu/MOODUL-tasapeegli-kujutis.md).
 *
 * **Ükski arv ei ole siia käsitsi kirjutatud** – kõik vastused ja tekstis
 * olevad tulemused tulevad `model.ts`-ist (CLAUDE.md reegel 1). Nii ei saa
 * ülesande vastus ja simulatsiooni näit kunagi lahku minna. Testis
 * (tests/tasapeegli-kujutis.model.test.ts) võrreldakse neid arve
 * SPETSIFIKATSIOONI tabeliga, mitte activities.ts iseendaga – vale
 * funktsioonivalik siin teeb testi punaseks, mitte ei jõua tundi.
 *
 * SEISUD (`d`, `M`, `H`) on aga käsitsi kirjas: need on ülesande tekst
 * („astu 2,5 m kaugusele"), mitte füüsika tulemus. Et iga seis oleks
 * liuguriga üldse seatav, kontrollib test neid `SLIDERS`-i vastu.
 *
 * **Kõik pikkused ja kaugused on meetrites** – teisendust selles moodulis ei
 * ole, sest inimese pikkus, peegli kõrgus ja kaugus peeglist on kõik meetri
 * kandis.
 *
 * Tolerantsid (spetsifikatsioon „explore"): kaugused ±0,1 m ja kõrgused
 * ±0,05 m, mõlemad ABSOLUUTSED. Protsent ei kõlba: liuguri samm on 0,1 m ja
 * 0,05 m, seega jätaks protsenttolerants väikeste arvude juures vähem
 * mänguruumi kui üks liuguri samm (sama põhjendus mis moodulites
 * `valguse-sirgjooneline-levimine` ja `vari-ja-poolvari`).
 */

/**
 * Meetrid õpilase kujul: eesti koma ja AINULT vajalikud kümnendkohad
 * ("3 m", "2,5 m", "0,85 m").
 *
 * Kümnendkohtade arvu ei anta väljastpoolt: „3,0 m" ja „0,80 m" oleksid
 * ülesande tekstis lihtsalt vale keel ja kutsuvad õpilast küsima, kas
 * kümnendkohal on mingi mõte. Kolm kohta ei teki – kõik selle mooduli arvud
 * on liuguri sammu (0,05 m) kordsed.
 */
function m(valueM: number): string {
  const kümnendikud = Math.abs(valueM * 10 - Math.round(valueM * 10));
  const decimals = Number.isInteger(valueM) ? 0 : kümnendikud < 1e-9 ? 1 : 2;
  return `${formatNumber(valueM, decimals)} m`;
}

/** Kaugus (`d`) ±0,1 m – liuguri samm on 0,1 m. */
const DISTANCE_TOLERANCE = { mode: "absolute", value: 0.1 } as const;

/** Kõrgus (`M`, nähtav osa) ±0,05 m – liuguri samm on 0,05 m. */
const HEIGHT_TOLERANCE = { mode: "absolute", value: 0.05 } as const;

// --- Ülesannetes kasutatavad seisud ja nende vastused (vastused mudelist) ---

/** Explore 1: seis 1 m kaugusel – kujutis on peegli taga sama kaugel. */
const EXPLORE_NEAR_M = 1;
const EXPLORE_NEAR_IMAGE_M = imageDistance(EXPLORE_NEAR_M);

/** Explore 2: seis 2,5 m kaugusel – kogu tee sinust kujutiseni. */
const EXPLORE_FAR_M = 2.5;
const EXPLORE_FAR_SEPARATION_M = objectImageSeparation(EXPLORE_FAR_M);

/** Explore 3 ja 4: sama peegel ja sama inimene, ainult kaugus muutub. */
const DEFAULT_MIRROR_M = 0.4;
const DEFAULT_PERSON_M = 1.6;
const EXPLORE_VISIBLE_M = visibleBodyHeight(DEFAULT_MIRROR_M, DEFAULT_PERSON_M);
/** Explore 4 teine seis: kaugus kolmekordistub, vastus jääb samaks. */
const EXPLORE_FARTHEST_M = 3;

/** Explore 5: pikkuse liugur avaneb, 1,8 m inimene vajab poolt sellest. */
const TALL_PERSON_M = 1.8;
const TALL_MIN_MIRROR_M = minMirrorHeight(TALL_PERSON_M);

/** Näidis (worked): 0,6 m kaugusel ja siis 0,2 m lähemal. */
const WORKED_DISTANCE_M = 0.6;
const WORKED_STEP_M = 0.2;
const WORKED_SEPARATION_M = objectImageSeparation(WORKED_DISTANCE_M);
const WORKED_CLOSER_SEPARATION_M = objectImageSeparation(
  WORKED_DISTANCE_M - WORKED_STEP_M,
);

/** Practice 1 (osaline): Mari on 1,5 m pikk. */
const MARI_HEIGHT_M = 1.5;
const MARI_MIN_MIRROR_M = minMirrorHeight(MARI_HEIGHT_M);

/** Practice 3 (iseseisev arv): 0,3 m peegel, 1,7 m inimene. */
const SMALL_MIRROR_M = 0.3;
const FRIEND_HEIGHT_M = 1.7;
const SMALL_MIRROR_VISIBLE_M = visibleBodyHeight(SMALL_MIRROR_M, FRIEND_HEIGHT_M);

/** Exit 2: 1,2 m kaugusel peeglist. */
const EXIT_DISTANCE_M = 1.2;
const EXIT_SEPARATION_M = objectImageSeparation(EXIT_DISTANCE_M);

/** Exit 3 (vabatekst) ja rc-4: 1,7 m sõber 1 m peegli ees. */
const SHOP_MIRROR_M = 1;
const FRIEND_MIN_MIRROR_M = minMirrorHeight(FRIEND_HEIGHT_M);

/** Kordamiskaardid rc-3 ja rc-4. */
const CARD_DISTANCE_M = 1.5;
const CARD_SEPARATION_M = objectImageSeparation(CARD_DISTANCE_M);
const CARD_PERSON_M = 1.8;
const CARD_MIN_MIRROR_M = minMirrorHeight(CARD_PERSON_M);

const steps: Step[] = [
  {
    type: "hook",
    id: "hook-1",
    // Joonis näitab AINULT seda, ET kaugemale astumine ei aita – MIKS, seda
    // ütlevad teooria ja simulatsioon. Hooki joonis ei tohi vastust ette öelda.
    figure: "tp-poe-peegel",
    title: "Miks ei aita tagurpidi astumine?",
    body: [
      "Proovid poes uusi pükse. Peegel on väike ja jalad ei paista – astud kaks sammu tagasi, et rohkem endast näha.",
      "Peeglis paistab täpselt sama palju kui enne. Miks tagurpidi astumine ei aita?",
      "Täna saad teada, kus su kujutis peeglis päriselt on, kui suur ta on ja kui suurt peeglit on vaja, et end täies pikkuses näha.",
    ],
  },
  {
    type: "theory",
    id: "theory-1",
    title: "Näiline kujutis",
    body: [
      "Kus kujutis on: peegli taga, täpselt sama kaugel, kui sina oled peegli ees. Astud sammu lähemale – kujutis astub sammu lähemale ka, seega teie vahe väheneb KAKS sammu.",
      "Kui suur ta on: täpselt sinuga ühesuurune ja päripidine. Kaugemalt paistab ta väiksem täpselt samamoodi, nagu päris inimene kaugemalt väiksem paistab – aga ta EI LÄHE väiksemaks.",
      "Miks „näiline\": peegli taga ei ole tegelikult midagi. Silma jõuavad peeglilt peegeldunud kiired ja aju pikendab neid sirgelt tahapoole; seal, kus pikendused lõikuvad, paistabki kujutis olevat. Seepärast ei saa seda kujutist paberile ega ekraanile kinni püüda.",
      "Kõik see tuleb ühest juba tuttavast seadusest: peegeldumisnurk võrdub langemisnurgaga. Kujutis on lihtsalt see koht, kuhu pikendused kokku jooksevad.",
    ],
    figure: "tp-nailine-kujutis",
  },
  {
    type: "predict",
    id: "predict-1",
    title: "Paku oma ennustus",
    body: [
      "Seisad 1 m kaugusel väikesest seinapeeglist ja näed peeglis end vöökohast ülespoole. Nüüd astud 2 m kaugusele.",
    ],
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt: "Kui suur osa sinust nüüd peeglis paistab?",
        options: [
          {
            id: "rohkem",
            text: "Rohkem – näen end põlvedeni",
            correct: false,
            // Nii „rohkem" kui ka „vähem" tulevad samast juurest: usutakse, et
            // kaugus muudab nähtavat osa. Sama silt, sama lahendus.
            misconception: "kaugus-muudab-vaadet",
          },
          {
            id: "sama",
            text: "Täpselt sama palju – vöökohast ülespoole",
            correct: true,
          },
          {
            id: "vahem",
            text: "Vähem – näen ainult pead",
            correct: false,
            misconception: "kaugus-muudab-vaadet",
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
    title: "Uuri simulatsiooniga",
    body: [
      "Külgvaates on vasakul sina, paremal seinal peegel ja peeglist paremal katkendjoonega sinu kujutis. Kaks kiirt – pealaest ja jalgadest – lähevad peeglile ja sealt silma; nende katkendlikud pikendused viivad kujutise juurde.",
      "Mõõdulindil sinu kõrval on eraldi märgitud see osa sinust, mis peeglist paistab. Peegel ripub alati õigel kõrgusel – seina peal teda liigutada ei saa.",
    ],
    simulation: {
      // Pikkuse liugur avaneb alles siis, kui ülesanne 4 on tehtud: kuni
      // selle ajani on muutujaid kaks (moodulileping) ja õpilane ei saa
      // „kaugus ei muuda" tulemust kogemata pikkust muutes ära segada.
      unlocks: [{ feature: "inimese-pikkus", afterQuestion: "explore-4" }],
    },
    questions: [
      {
        kind: "numeric",
        id: "explore-1",
        prompt: `Sea end ${m(EXPLORE_NEAR_M)} kaugusele peeglist. Kui kaugel peegli TAGA on sinu kujutis?`,
        hints: ["Suur arv ekraanil ütleb kujutise kauguse peeglist."],
        unit: "m",
        tolerance: DISTANCE_TOLERANCE,
        answer: EXPLORE_NEAR_IMAGE_M,
      },
      {
        kind: "numeric",
        id: "explore-2",
        prompt: `Astu ${m(EXPLORE_FAR_M)} kaugusele. Kui pikk on nüüd kogu tee sinust kujutiseni?`,
        hints: [
          "Kujutis on peegli taga sama kaugel, kui sina oled peegli ees.",
          `${m(EXPLORE_FAR_M)} sinust peeglini + ${m(EXPLORE_FAR_M)} peeglist kujutiseni.`,
        ],
        unit: "m",
        tolerance: DISTANCE_TOLERANCE,
        answer: EXPLORE_FAR_SEPARATION_M,
      },
      {
        kind: "numeric",
        id: "explore-3",
        prompt: `Tule tagasi ${m(EXPLORE_NEAR_M)} kaugusele ja jäta peegel ${m(DEFAULT_MIRROR_M)} kõrguseks. Kui suur osa sinust peeglis paistab?`,
        hints: ["Mõõdulindil on nähtav osa eraldi värvi ja mustriga, sildiga „paistab\"."],
        unit: "m",
        tolerance: HEIGHT_TOLERANCE,
        answer: EXPLORE_VISIBLE_M,
      },
      {
        // Mooduli põhitõde: ainus erinevus eelmise ülesandega on kaugus.
        kind: "choice",
        id: "explore-4",
        prompt: `Jäta peegel ${m(DEFAULT_MIRROR_M)} kõrguseks ja astu ${m(EXPLORE_FARTHEST_M)} kaugusele. Mis juhtub sellega, kui suur osa sinust paistab?`,
        options: [
          {
            id: "rohkem",
            text: "Paistab rohkem",
            correct: false,
            misconception: "kaugus-muudab-vaadet",
          },
          {
            id: "sama",
            text: `Paistab täpselt sama palju – ${m(EXPLORE_VISIBLE_M)}`,
            correct: true,
          },
          {
            id: "vahem",
            text: "Paistab vähem",
            correct: false,
            misconception: "kaugus-muudab-vaadet",
          },
        ],
      },
      {
        kind: "numeric",
        id: "explore-5",
        prompt: `Sea oma pikkuseks ${m(TALL_PERSON_M)}. Kui kõrge peab peegel VÄHEMALT olema, et näeksid end täies pikkuses?`,
        hints: [
          "Proovi peegli liuguriga ja vaata, millal tekib kiri „kogu inimene\".",
          "Vastus ei sõltu sellest, kui kaugel sa parajasti seisad – proovi järele.",
        ],
        unit: "m",
        tolerance: HEIGHT_TOLERANCE,
        answer: TALL_MIN_MIRROR_M,
      },
    ],
  },
  {
    type: "practice",
    id: "practice-1",
    title: "Proovi ise järele",
    // Näidis on LAHENDATUD ülesanne, mitte küsimus (docs/MOODULILEPING.md).
    worked: {
      prompt: `Seisad ${m(WORKED_DISTANCE_M)} kaugusel peeglist. Kui suur on sinu ja kujutise vahe ning kui palju see muutub, kui astud ${m(WORKED_STEP_M)} lähemale?`,
      solution: [
        `Kujutis on peegli taga ${m(WORKED_DISTANCE_M)}, seega on sinu ja kujutise vahe ${formatNumber(WORKED_DISTANCE_M, 1)} + ${formatNumber(WORKED_DISTANCE_M, 1)} = ${m(WORKED_SEPARATION_M)}.`,
        `Astud ${m(WORKED_STEP_M)} lähemale: nüüd oled peeglist ${m(WORKED_DISTANCE_M - WORKED_STEP_M)} kaugusel ja vahe on ${m(WORKED_CLOSER_SEPARATION_M)}.`,
        `Vahe vähenes ${m(WORKED_SEPARATION_M - WORKED_CLOSER_SEPARATION_M)} võrra – kaks korda rohkem, kui sina ise liikusid. Kujutis astus ju sinuga koos sammu lähemale.`,
      ],
      answer: `Vahe on ${m(WORKED_SEPARATION_M)} ja väheneb ${m(WORKED_SEPARATION_M - WORKED_CLOSER_SEPARATION_M)} võrra ehk kaks korda rohkem kui sinu enda samm.`,
    },
    questions: [
      {
        // Osaline: tehe on ees, vastus tuleb ise.
        kind: "numeric",
        id: "practice-1",
        prompt: `Mari on ${m(MARI_HEIGHT_M)} pikk. Kui kõrge peab olema peegel, milles ta end täies pikkuses näeb? Täida: ${formatNumber(MARI_HEIGHT_M, 1)} / ___ = ___ m`,
        hints: [
          "Pealae kiir tabab peeglit pealae ja silma keskel, jalgade kiir silma ja põranda keskel.",
          "Nende kahe koha vahe on täpselt pool pikkusest.",
        ],
        unit: "m",
        tolerance: HEIGHT_TOLERANCE,
        answer: MARI_MIN_MIRROR_M,
      },
      {
        kind: "choice",
        id: "practice-2",
        prompt: "Miks ei näe sa end kaugemale astudes peeglis rohkem?",
        options: [
          {
            id: "kiired-kalduvad",
            text: "Kaugemal kalduvad pealae ja jalgade kiired mõlemad täpselt sama palju, seega jääb nende vahe peeglil samaks",
            correct: true,
          },
          {
            id: "peegel-vaike",
            text: "Sest peegel on selleks liiga väike",
            correct: false,
            misconception: "taispikk-peegel",
          },
          {
            id: "kujutis-eemale",
            text: "Sest kujutis liigub sinuga koos peeglist eemale",
            correct: false,
            misconception: "kaugus-muudab-vaadet",
          },
        ],
      },
      {
        kind: "numeric",
        id: "practice-3",
        prompt: `Peegel on ${m(SMALL_MIRROR_M)} kõrge ja ripub õigel kohal. Kui suur osa ${m(FRIEND_HEIGHT_M)} pikast inimesest sellest paistab?`,
        hints: ["Peeglist paistab kaks korda rohkem, kui peegel ise kõrge on."],
        unit: "m",
        tolerance: HEIGHT_TOLERANCE,
        answer: SMALL_MIRROR_VISIBLE_M,
      },
      {
        // Ülekanne, mitu õiget. `shuffle: true` on vaikimisi sees, aga kirjas
        // siin meelega: järjekord ei kanna siin tähendust.
        kind: "choice",
        id: "practice-4",
        prompt: "Millised väited tasapeegli kujutise kohta on õiged?",
        multiple: true,
        shuffle: true,
        options: [
          {
            id: "uhesuurune",
            text: "Kujutis on esemega ühesuurune",
            correct: true,
          },
          {
            id: "sama-kaugel",
            text: "Kujutis on peegli taga sama kaugel, kui ese on peegli ees",
            correct: true,
          },
          {
            id: "peegli-pinnal",
            text: "Kujutis tekib peegli pinnale",
            correct: false,
            misconception: "kujutis-peegli-pinnal",
          },
          {
            id: "ei-saa-puuda",
            text: "Kujutist ei saa valgele paberile kinni püüda",
            correct: true,
          },
          {
            id: "tagurpidi",
            text: "Kujutis on pea alaspidi",
            correct: false,
            misconception: "kujutis-tagurpidi",
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
        prompt: "Sõna „näiline\" tähendab kujutise puhul, et…",
        options: [
          {
            id: "udune",
            text: "Kujutis on udune ja ebaselge",
            correct: false,
            misconception: "kujutis-on-asi",
          },
          {
            id: "pikendused",
            text: "Peegli taga ei ole tegelikult midagi – kujutis paistab olevat seal, kus silma jõudvate kiirte pikendused lõikuvad",
            correct: true,
          },
          {
            id: "vaiksem",
            text: "Kujutis on esemest väiksem",
            correct: false,
            misconception: "kujutis-vaheneb-kaugusega",
          },
        ],
      },
      {
        kind: "numeric",
        id: "exit-2",
        prompt: `Seisad ${m(EXIT_DISTANCE_M)} kaugusel tasapeeglist. Kui suur on vahemaa sinu ja su kujutise vahel?`,
        unit: "m",
        tolerance: DISTANCE_TOLERANCE,
        answer: EXIT_SEPARATION_M,
      },
      {
        kind: "text",
        id: "exit-3",
        prompt: `Poes on seinal ${m(SHOP_MIRROR_M)} kõrgune peegel. Sinu sõber, kes on ${m(FRIEND_HEIGHT_M)} pikk, ütleb, et ta peab kaugemale astuma, et end täies pikkuses näha. Mida sa talle vastad?`,
        minWords: 10,
      },
    ],
  },
];

/**
 * Kordamiskaardid (docs/MOODULILEPING.md „activities.ts – kordamiskaardid",
 * sisu/MOODUL-tasapeegli-kujutis.md „Kordamiskaardid").
 */
const reviewCards: ReviewCard[] = [
  {
    id: "rc-1",
    type: "concept",
    question: "Kus asub tasapeeglis tekkiv kujutis ja kui suur ta on?",
    answer:
      "Peegli taga täpselt sama kaugel, kui ese on peegli ees; esemega ühesuurune ja päripidine.",
  },
  {
    id: "rc-2",
    type: "concept",
    question: "Mida tähendab, et tasapeegli kujutis on NÄILINE?",
    answer:
      "Peegli taga ei ole midagi – kujutis paistab olevat seal, kus silma jõudvate kiirte pikendused lõikuvad. Ekraanile ega paberile teda püüda ei saa.",
  },
  {
    id: "rc-3",
    type: "calc",
    question: `Seisad ${m(CARD_DISTANCE_M)} kaugusel peeglist. Kui suur on vahemaa sinu ja su kujutise vahel?`,
    answer: `${formatNumber(CARD_DISTANCE_M, 1)} + ${formatNumber(CARD_DISTANCE_M, 1)} = ${m(CARD_SEPARATION_M)}`,
  },
  {
    id: "rc-4",
    type: "calc",
    question: `Kui kõrge peegel on vaja ${m(CARD_PERSON_M)} pikale inimesele, et ta end täies pikkuses näeks?`,
    answer: `${formatNumber(CARD_PERSON_M, 1)} / 2 = ${m(CARD_MIN_MIRROR_M)} (kaugus siin midagi ei muuda; peegel peab rippuma õigel kõrgusel)`,
  },
  {
    id: "rc-5",
    type: "explain",
    question:
      "Miks ei aita kaugemale astumine, kui tahad peeglis rohkem endast näha?",
    // „Kaks korda peegli kõrgus" kehtib kuni piirini `H`: rohkem inimest ei
    // ole (model.ts `visibleBodyHeight` piirab tulemuse pikkusega). Kaardil
    // peab see tingimus kirjas olema – muidu õpetaks ta suure peegli juures
    // valet (CodeRabbiti leid 2026-08-11).
    answer: `Kaugenedes kalduvad pealae ja jalgade kiired täpselt sama palju, seega jääb nende tabamiskohtade vahe peeglil samaks – nähtav osa on kaks korda peegli kõrgus, kuni paistad tervenisti (rohkem sind ei ole). Näiteks ${m(FRIEND_HEIGHT_M)} pikale inimesele piisab ${m(FRIEND_MIN_MIRROR_M)} peeglist, olgu ta kus tahes.`,
  },
];

export const activities = defineActivities({ steps, reviewCards });
