import { defineActivities } from "../../../engine/contract";
import type { ReviewCard, Step } from "../../../engine/contract";
import {
  BALL_DIAMETER_M,
  SLIDERS,
  metersToCm,
  penumbraBandWidth,
  umbraLengthBehindObject,
  umbraWidth,
} from "./model";

/**
 * Sammud ja kordamiskaardid (docs/MOODULILEPING.md,
 * sisu/MOODUL-vari-ja-poolvari.md).
 *
 * Kogu moodul tugineb ühele lausele: valgus levib sirgjooneliselt, seega on
 * varju piir see koht, kust allikat enam ei paista. Matemaatikat on siin
 * täpselt kaks tehet – jagamine ja korrutamine (sama otsus mis moodulites
 * `valgusallikad` ja `valguse-sirgjooneline-levimine`, samm 4.1d).
 *
 * Kõik arvulised vastused tulevad MUDELIST, mitte käsitsi kirjutatud arvudest
 * (CLAUDE.md reegel 1). Nii ei saa ülesande vastus ja simulatsiooni näit kunagi
 * lahku minna. Et see ei jääks iseennast kontrollivaks ringiks, loeb
 * tests/vari-ja-poolvari.model.test.ts need arvud üle SPETSIFIKATSIOONI tabeli
 * järgi (30 cm · 20 cm · 2 m · 0,18 m · 0,5 m · 0,2 m): vale allika laius või
 * kaugus siin failis teeb testi punaseks, mitte ei jõua tundi.
 *
 * **Ühikud ei ole ühtlased ja see on meelega** (sama otsus mis moodulis
 * `valguse-sirgjooneline-levimine`): simulatsiooni ülesanded küsivad laiust
 * sentimeetrites, sest just nii seisab arv ekraanil, ülejäänud arvküsimused
 * meetrites, sest nende tekst annab arvud meetrites ja palub tehte teha.
 * Checker teisendab m ↔ cm ise (src/checker/number.ts), seega „30 cm“ ja
 * „0,3 m“ on mõlemad õiged – ühik küsimuse juures ütleb ainult, mida ilma
 * ühikuta kirjutatud arv tähendab.
 *
 * **Kauguste tolerants on ABSOLUUTNE ±0,1 m, mitte protsent.** Liuguri samm on
 * 0,1 m ja 5% kahest meetrist oleks täpselt üks samm – protsent ei jätaks
 * õpilasele mänguruumi (sama põhjendus mis moodulis
 * `valguse-sirgjooneline-levimine`).
 */

// --- Simulatsiooni seisud (kõik liuguri väärtused, vt model.ts SLIDERS) -----

/** Punktvalgusallikas: liuguri väärtus 0, mitte eraldi nupp. */
const POINT_SOURCE_M = 0;
/** Väike lamp, ülesanne 2. */
const SMALL_LAMP_M = 0.05;
/** Lai lamp (pallist laiem), ülesanded 3 ja 4. */
const WIDE_LAMP_M = 0.2;

/** Palli vaikimisi kaugus allikast – ülesannetes 1–3 muutumatu. */
const BALL_FAR_M = SLIDERS.objectDistanceM.max;
/** Ülesandes 4 tuuakse pall allikale lähemale. */
const BALL_NEAR_M = SLIDERS.objectDistanceM.min;
/** Ekraan ülesannetes 1, 2 ja 4. */
const SCREEN_FAR_M = 3;
/** Ekraani lähim koht – ülesandes 3 tuuakse ta siia tagasi. */
const SCREEN_NEAR_M = SLIDERS.screenDistanceM.min;

/** Ülesanne 1: punktallikas → 30 cm täisvari ja poolvarju ei ole üldse. */
const POINT_UMBRA_CM = metersToCm(
  umbraWidth(BALL_DIAMETER_M, POINT_SOURCE_M, BALL_FAR_M, SCREEN_FAR_M),
);
const POINT_PENUMBRA_CM = metersToCm(
  penumbraBandWidth(POINT_SOURCE_M, BALL_FAR_M, SCREEN_FAR_M),
);

/** Ülesanne 2: 5 cm lai lamp sööb täisvarju 30 cm-lt 20 cm-le. */
const SMALL_LAMP_UMBRA_CM = metersToCm(
  umbraWidth(BALL_DIAMETER_M, SMALL_LAMP_M, BALL_FAR_M, SCREEN_FAR_M),
);

/**
 * Ülesanne 3: kus täisvari kaob, mõõdetuna ALLIKAST.
 *
 * `umbraLengthBehindObject` annab kauguse KEHAST, liugur näitab kaugust
 * allikast – seepärast liidetakse palli kaugus juurde. Sama liitmine on
 * testis edasi-tagasi kontrollitud: just seal annab `umbraWidth` nulli.
 */
const UMBRA_ENDS_M =
  BALL_FAR_M + umbraLengthBehindObject(BALL_DIAMETER_M, WIDE_LAMP_M, BALL_FAR_M);
/** 1,2 m peal on täisvari veel olemas (8 cm) – sellepärast algab ülesanne sealt. */
const WIDE_LAMP_NEAR_UMBRA_CM = metersToCm(
  umbraWidth(BALL_DIAMETER_M, WIDE_LAMP_M, BALL_FAR_M, SCREEN_NEAR_M),
);

/** Näidis (lahendatud): punktallikas, ekraan 4 m peal → 40 cm täisvari. */
const WORKED_SCREEN_M = 4;
const WORKED_UMBRA_M = umbraWidth(
  BALL_DIAMETER_M,
  POINT_SOURCE_M,
  BALL_FAR_M,
  WORKED_SCREEN_M,
);
/** „Ekraan on 4 korda kaugemal kui pall, seega on vari 4 korda laiem.“ */
const WORKED_RATIO = WORKED_SCREEN_M / BALL_FAR_M;

/** Harjutus 1 (osaline): 6 cm lai lamp → 0,18 m täisvari. */
const PRACTICE_LAMP_M = 0.06;
const PRACTICE_UMBRA_M = umbraWidth(
  BALL_DIAMETER_M,
  PRACTICE_LAMP_M,
  BALL_FAR_M,
  SCREEN_FAR_M,
);
/**
 * Vihje 2: kui palju allika laius täisvarjust ära sööb (m).
 *
 * Arv tuleb MUDELIST, mitte siinsest korrutamisest (CLAUDE.md reegel 1,
 * CodeRabbiti leid 2026-08-10). Kaotus on nimelt täpselt ühe poolvarju riba
 * laius: punktallika täisvari on `d·b/a`, laiusega allika oma
 * `(d·b − s·(b − a))/a`, ja nende vahe `s·(b − a)/a` ongi
 * `penumbraBandWidth`. Seda seost valvab test – kui ta kunagi katki läheb,
 * on vihje arv vale ja õpilane arvutab valet tehet.
 */
const PRACTICE_UMBRA_LOSS_M = penumbraBandWidth(
  PRACTICE_LAMP_M,
  BALL_FAR_M,
  SCREEN_FAR_M,
);

/** Harjutus 3 (iseseisev arv): 30 cm lai lamp → täisvari ulatub 0,5 m palli taha. */
const PRACTICE_WIDE_LAMP_M = 0.3;
const PRACTICE_UMBRA_LENGTH_M = umbraLengthBehindObject(
  BALL_DIAMETER_M,
  PRACTICE_WIDE_LAMP_M,
  BALL_FAR_M,
);

/**
 * Väljumispilet 2: punktallikas, keha 5 cm, keha 0,5 m, ekraan 2 m → 0,2 m.
 *
 * Keha on siin MUUD mõõtu kui simulatsioonis (5 cm, mitte 10 cm) ja kaugused
 * teised – nii ei saa vastust mälust võtta, vaid tuleb sama tehe uuesti teha.
 */
const EXIT_OBJECT_M = 0.05;
const EXIT_BALL_DISTANCE_M = 0.5;
const EXIT_SCREEN_M = 2;
const EXIT_UMBRA_M = umbraWidth(
  EXIT_OBJECT_M,
  POINT_SOURCE_M,
  EXIT_BALL_DISTANCE_M,
  EXIT_SCREEN_M,
);

/** Kordamiskaart rc-3: sama seis mis explore-1, aga sõnadega lahti seletatud. */
const CARD_RATIO = SCREEN_FAR_M / BALL_FAR_M;

/** Eesti kombe järgi koma, mitte punkt: „0,18“, mitte „0.18“. */
function comma(value: number, decimals: number): string {
  return value.toFixed(decimals).replace(".", ",");
}

const steps: Step[] = [
  {
    type: "hook",
    id: "hook-1",
    // Joonis näitab, ET servad on erinevad, aga ei ütle MIKS – see ongi sammu
    // küsimus. Kiiri, allika laiust ega poolvarju nime joonisel ei ole.
    figure: "vp-oma-vari",
    title: "Miks on ühel varjul kaks serva?",
    body: [
      "Seisa päikesepaistelisel päeval asfaldil ja vaata oma varju. Jalgade juures on varju serv nuga-terav – näed täpselt, kust vari algab.",
      "Vaata siis üles, oma pea varju juurde. Seal on serv laiaks määrdunud: tume läheb heledaks tasapisi ja piiri ei olegi.",
      "Sama vari, sama Päike. Täna õpid, miks varjul on kaks osa, ja oskad välja arvutada, kui lai on täisvari.",
    ],
  },
  {
    type: "theory",
    id: "theory-1",
    title: "Täisvari ja poolvari",
    body: [
      "Täisvari on see osa varjust, kuhu ei jõua allikast ühtki valguskiirt. Kui seisaksid täisvarjus ja vaataksid lambi poole, ei näeks sa lambist mitte midagi – keha katab selle täielikult kinni.",
      "Poolvari on osa, kuhu jõuab valgus allika ühest osast, aga mitte teisest. Poolvarjus seistes paistaks lambist tükk ära, ülejäänu oleks keha taga peidus. Just seepärast on poolvari heledam kui täisvari ja muutub ühtlaselt heledamaks, mida kaugemale servast minna.",
      "Punktvalgusallikas annab AINULT täisvarju – poolvarju pole kellelgi tekitada, sest allikal ei ole „teist serva“. Poolvari on laiendatud allika tunnus.",
      "Vari ei ole seega asi, mis kehast välja tuleb. Vari on ruumi piirkond, kuhu valgus jääb tulemata.",
    ],
    // Neli kiirt allika mõlemast servast mõlema palliserva poole – nemad
    // lõikavad ekraani kolmeks ja teevad mõlema mõiste korraga nähtavaks.
    figure: "vp-taisvari-poolvari",
  },
  {
    type: "predict",
    id: "predict-1",
    title: "Paku oma ennustus",
    body: [
      "Taskulamp valgustab palli ja pall heidab varju seinale. Nüüd vahetame taskulambi sisselülitatud valge teleriekraani vastu, mis on palju laiem, aga sama kaugel ja sama ere.",
    ],
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt: "Mis juhtub täisvarjuga seinal?",
        options: [
          {
            id: "laiem",
            text: "Läheb laiemaks",
            correct: false,
            misconception: "laiem-allikas-laiem-vari",
          },
          {
            id: "kitsam",
            text: "Läheb kitsamaks või kaob hoopis",
            correct: true,
          },
          {
            id: "sama",
            text: "Jääb samaks, ainult serv läheb hägusaks",
            correct: false,
            // Sama juur mis eelmisel lõksul: allika laiust ei seostata
            // täisvarju laiusega. Õpetajajuhendis on mõlemad variandid
            // kirjas ühe kirje all, sest lahendus on neil sama.
            misconception: "laiem-allikas-laiem-vari",
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
      `Vasakul on allikas, keskel ${comma(metersToCm(BALL_DIAMETER_M), 0)} cm läbimõõduga pall ja paremal ekraan. Neli kiirt – allika mõlemast servast mõlema palliserva poole – jagavad ekraani kolmeks: täisvari keskel, poolvarju riba mõlemal pool ja siis valgus.`,
      "Liuguritega saad muuta allika laiust ja ekraani kaugust; kolmas liugur – palli kaugus – ilmub pärast teist ülesannet. Kõik kaugused on mõõdetud ALLIKAST, nii nagu joonisel kirjas.",
    ],
    questions: [
      {
        // Ülesanne 1: põhivalem punktallikaga. Ühik on cm, sest just nii seisab
        // arv ekraanil – õpilane loeb ta näidikult, mitte ei arvuta peast.
        // Kontrollküsimusena on poolvarju riba 0 cm ja seda näitab sim ise.
        kind: "numeric",
        id: "explore-1",
        prompt: `Sea allika laiuseks ${comma(metersToCm(POINT_SOURCE_M), 0)} (punktvalgusallikas) ja ekraan ${comma(SCREEN_FAR_M, 0)} m kaugusele. Kui lai on täisvari?`,
        hints: [
          "Suur arv ekraani ülaosas ütleb täisvarju laiuse sentimeetrites.",
          `Vaata ka poolvarju rida: punktallikaga on ta ${comma(POINT_PENUMBRA_CM, 0)} cm – seepärast ongi see vari teravaservaline.`,
        ],
        unit: "cm",
        tolerance: { mode: "percent", value: 5 },
        answer: POINT_UMBRA_CM,
      },
      {
        // Ülesanne 2: sama seis, ainult allikal on nüüd laius. Vastus on
        // VÄIKSEM kui ülesandes 1 – see ongi predict-sammu vastus.
        kind: "numeric",
        id: "explore-2",
        prompt: `Jäta ekraan ${comma(SCREEN_FAR_M, 0)} m peale ja tee allikas ${comma(metersToCm(SMALL_LAMP_M), 0)} cm laiuseks. Kui lai on nüüd täisvari?`,
        hints: [
          "Vaata, kas täisvari läks laiemaks või kitsamaks kui punktallikaga.",
          "Iga allika serv sööb täisvarju omalt poolt.",
        ],
        unit: "cm",
        tolerance: { mode: "percent", value: 5 },
        answer: SMALL_LAMP_UMBRA_CM,
      },
      {
        // Ülesanne 3: täisvarju KADUMINE. Ekraani tagasitoomine 1,2 m peale on
        // ülesande osa, mitte kaunistus – pärast ülesannet 2 on ekraan 3 m peal
        // ja 20 cm laia allikaga on täisvari seal juba kadunud, seega kaugemale
        // nihutades ei näekski õpilane üleminekut.
        kind: "numeric",
        id: "explore-3",
        prompt: `Sea allika laiuseks ${comma(metersToCm(WIDE_LAMP_M), 0)} cm (allikas on nüüd pallist laiem), too ekraan tagasi ${comma(SCREEN_NEAR_M, 1)} m peale ja nihuta seda siis aeglaselt kaugemale. Millisel kaugusel täisvari kaob?`,
        hints: [
          `${comma(SCREEN_NEAR_M, 1)} m peal on täisvari veel olemas – ${comma(WIDE_LAMP_NEAR_UMBRA_CM, 0)} cm.`,
          "Otsi kohta, kus suure arvu asemel ilmub tekst „täisvarju ei ole“.",
        ],
        unit: "m",
        // Absoluutne, mitte protsent: liuguri samm on 0,1 m ja 5% kahest
        // meetrist oleks täpselt üks samm (vt faili päist).
        tolerance: { mode: "absolute", value: 0.1 },
        answer: UMBRA_ENDS_M,
      },
      {
        // Ülesanne 4: palli kauguse liugur. Kvalitatiivne meelega – õpilane
        // ootab, et lähemale toodud pall toob täisvarju tagasi, ja simulatsioon
        // näitab, et ei too.
        kind: "choice",
        id: "explore-4",
        prompt: `Jäta allikas ${comma(metersToCm(WIDE_LAMP_M), 0)} cm laiaks ja ekraan ${comma(SCREEN_FAR_M, 0)} m peale. Too nüüd pall allikale lähemale (${comma(BALL_NEAR_M, 1)} m). Mis juhtub?`,
        hints: [
          "Täisvari kadus juba eelmises ülesandes lai allika tõttu – palli kaugus üksi seda tagasi ei too.",
        ],
        options: [
          {
            id: "tagasi",
            text: "Täisvari tuleb tagasi",
            correct: false,
            misconception: "laiem-allikas-laiem-vari",
          },
          {
            id: "poolvari-laiem",
            text: "Täisvari jääb kadunuks ja poolvari läheb veel laiemaks",
            correct: true,
          },
          {
            id: "kaob",
            text: "Vari kaob täiesti ära",
            correct: false,
            misconception: "vari-on-asi",
          },
        ],
      },
    ],
    // Palli kauguse liugur avaneb alles pärast ülesannet 2 (moodulileping:
    // alguses maksimaalselt kaks muudetavat suurust). Pedagoogiline põhjus on
    // tähtsam kui reegel: ülesanded 1 ja 2 peavad näitama, et täisvarju laius
    // sõltub ALLIKA LAIUSEST – kui palli kaugus oleks kohe käes, jääks kergesti
    // mulje, et kitsamaks tegi selle hoopis miski muu.
    simulation: {
      unlocks: [{ feature: "palli-kaugus", afterQuestion: "explore-2" }],
    },
  },
  {
    type: "practice",
    id: "practice-1",
    title: "Proovi ise järele",
    // Näidis on LAHENDATUD ülesanne, mitte küsimus (docs/MOODULILEPING.md).
    worked: {
      prompt: `Punktvalgusallikas, pall ${comma(metersToCm(BALL_DIAMETER_M), 0)} cm läbimõõduga on ${comma(BALL_FAR_M, 0)} m kaugusel allikast, ekraan ${comma(WORKED_SCREEN_M, 0)} m kaugusel allikast. Kui lai on täisvari?`,
      solution: [
        `Ekraan on ${comma(WORKED_RATIO, 0)} korda kaugemal kui pall: ${comma(WORKED_SCREEN_M, 0)} / ${comma(BALL_FAR_M, 0)} = ${comma(WORKED_RATIO, 0)}.`,
        `Seega on täisvari ${comma(WORKED_RATIO, 0)} korda laiem kui pall: ${comma(metersToCm(BALL_DIAMETER_M), 0)} · ${comma(WORKED_RATIO, 0)} = ${comma(metersToCm(WORKED_UMBRA_M), 0)} cm.`,
        `Poolvarju ei ole, sest punktvalgusallikal ei ole laiust – ei ole kohta, kust „pool valgust“ paistaks.`,
      ],
      answer: `${comma(metersToCm(WORKED_UMBRA_M), 0)} cm ehk ${comma(WORKED_UMBRA_M, 1)} m`,
    },
    questions: [
      {
        // Osaline (spets p 2): tehe on ees, vastus tuleb ise.
        kind: "numeric",
        id: "practice-1",
        // Sõnastus: „pall 10 cm, pall 1 m" kandis sama sõnaga kaht eri suurust
        // (CodeRabbiti leid 2026-08-10). Läbimõõt ja kaugus on nüüd nimetatud.
        prompt: `Lamp on ${comma(metersToCm(PRACTICE_LAMP_M), 0)} cm lai. Pall on ${comma(metersToCm(BALL_DIAMETER_M), 0)} cm läbimõõduga ja ${comma(BALL_FAR_M, 0)} m kaugusel lambist, ekraan ${comma(SCREEN_FAR_M, 0)} m kaugusel lambist. Kui lai on täisvari? Täida: (${comma(BALL_DIAMETER_M, 1)} · ${comma(SCREEN_FAR_M, 0)} − ${comma(PRACTICE_LAMP_M, 2)} · ${comma(SCREEN_FAR_M - BALL_FAR_M, 0)}) / ${comma(BALL_FAR_M, 0)} = ___ m`,
        hints: [
          `Punktallikas annaks ${comma(umbraWidth(BALL_DIAMETER_M, POINT_SOURCE_M, BALL_FAR_M, SCREEN_FAR_M), 1)} m – kui palju allika laius sellest ära sööb?`,
          `Allika laius sööb täisvarjust täpselt ühe poolvarju riba jagu: ${comma(PRACTICE_UMBRA_LOSS_M, 2)} m.`,
        ],
        unit: "m",
        tolerance: { mode: "percent", value: 5 },
        answer: PRACTICE_UMBRA_M,
      },
      {
        // Iseseisev valik (spets p 3): hooki küsimuse vastus.
        kind: "choice",
        id: "practice-2",
        prompt: "Miks on jalgade vari asfaldil terav ja pea vari hägune?",
        hints: [
          "Poolvarju riba laius sõltub sellest, kui kaugel keha ekraanist (siin: maapinnast) on – mitte keha kujust.",
        ],
        options: [
          {
            id: "kaugus",
            text: "Pea on maapinnast kaugemal, seega on poolvarju riba seal laiem",
            correct: true,
          },
          {
            id: "kuju",
            text: "Pea on ümmargune ja jalad teravad",
            correct: false,
            misconception: "vari-on-asi",
          },
          {
            id: "tugevus",
            text: "Päikese valgus jõuab maani tugevamalt kui peani",
            correct: false,
            misconception: "hagu-tuleb-silmast",
          },
        ],
      },
      {
        // Iseseisev arv (spets p 4): teine valem – kui KAUGELE täisvari ulatub.
        kind: "numeric",
        id: "practice-3",
        prompt: `Lamp on ${comma(metersToCm(PRACTICE_WIDE_LAMP_M), 0)} cm lai, pall ${comma(metersToCm(BALL_DIAMETER_M), 0)} cm läbimõõduga on ${comma(BALL_FAR_M, 0)} m kaugusel lambist. Kui kaugele palli taha ulatub täisvari?`,
        hints: [
          `${comma(BALL_FAR_M, 0)} · ${comma(BALL_DIAMETER_M, 1)} / (${comma(PRACTICE_WIDE_LAMP_M, 1)} − ${comma(BALL_DIAMETER_M, 1)})`,
        ],
        unit: "m",
        tolerance: { mode: "percent", value: 5 },
        answer: PRACTICE_UMBRA_LENGTH_M,
      },
      {
        // Ülekanne (spets p 5), mitu õiget. `shuffle: true` on vaikimisi sees,
        // aga kirjas siin meelega: järjekord ei kanna siin tähendust ja
        // kordamisel ei tohi meelde jääda „kaks esimest“.
        kind: "choice",
        id: "practice-4",
        prompt:
          "Millistel juhtudel on varju serv PEAAEGU terav ehk poolvari väga kitsas?",
        hints: [
          "Kitsas poolvari tuleb VÄIKESEST allikast, mitte hägusest valgusest – mõtle, kui lai on iga näite valgusallikas.",
        ],
        multiple: true,
        shuffle: true,
        options: [
          { id: "led", text: "Väike LED-taskulamp pimedas toas", correct: true },
          {
            // Silt oli algul `punktallikas-annab-poolvarju`, aga see on
            // tagurpidi (CodeRabbiti leid 2026-08-10): kes usub, et IGAL varjul
            // on hägune serv, see ei valikski pilvist päeva „teravaks". Siin
            // eksib õpilane vastupidi – ei seosta allika laiust serva laiusega.
            id: "pilvine",
            text: "Pilvine päev õues",
            correct: false,
            misconception: "laiem-allikas-laiem-vari",
          },
          { id: "kasi-laual", text: "Käsi otse vastu lauda päikesepaistes", correct: true },
          {
            id: "valgusriba",
            text: "Valge lae alla peidetud lai valgusriba",
            correct: false,
            misconception: "laiem-allikas-laiem-vari",
          },
          { id: "taht", text: "Täht öötaevas kui allikas", correct: true },
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
        prompt: "Poolvari on koht, kus…",
        hints: ["Mõtle, mida see koht KEHA taga näeks, kui ta suudaks ringi vaadata."],
        options: [
          {
            id: "pool-valgust",
            text: "valgust on täpselt pool sellest, mis valgustatud alal",
            correct: false,
            misconception: "poolvari-on-pool",
          },
          {
            id: "osa-paistab",
            text: "allikast paistab osa ja ülejäänu on keha taga peidus",
            correct: true,
          },
          {
            id: "poolik",
            text: "vari on poolik, sest keha on läbipaistev",
            correct: false,
            misconception: "poolvari-on-pool",
          },
        ],
      },
      {
        kind: "numeric",
        id: "exit-2",
        prompt: `Punktvalgusallikas, keha läbimõõt ${comma(metersToCm(EXIT_OBJECT_M), 0)} cm, keha ${comma(EXIT_BALL_DISTANCE_M, 1)} m kaugusel allikast, ekraan ${comma(EXIT_SCREEN_M, 0)} m kaugusel allikast. Kui lai on täisvari?`,
        hints: [
          "Punktallikas tähendab, et poolvarju ei ole: sama valem mis näidises – ekraani kaugus jagatud keha kaugusega korda keha läbimõõt.",
        ],
        unit: "m",
        tolerance: { mode: "percent", value: 5 },
        answer: EXIT_UMBRA_M,
      },
      {
        kind: "text",
        id: "exit-3",
        prompt:
          "Pilvise ilmaga ei ole inimesel õues peaaegu üldse varju. Selgita, miks.",
        minWords: 10,
      },
    ],
  },
];

/**
 * Kordamiskaardid (docs/MOODULILEPING.md „activities.ts – kordamiskaardid“,
 * sisu/MOODUL-vari-ja-poolvari.md „Kordamiskaardid“).
 */
const reviewCards: ReviewCard[] = [
  {
    id: "rc-1",
    type: "concept",
    question: "Mis vahe on täisvarjul ja poolvarjul?",
    answer:
      "Täisvarjus ei paista allikast midagi, poolvarjus paistab allika üks osa – seepärast on poolvari heledam.",
  },
  {
    id: "rc-2",
    type: "concept",
    question: "Millise allikaga tekib ainult täisvari, ilma poolvarjuta?",
    answer:
      "Punktvalgusallikaga. Allikal ei ole laiust, seega ei ole kohta, kust „pool valgust“ paistaks.",
  },
  {
    id: "rc-3",
    type: "calc",
    question: `Punktallikas, pall ${comma(metersToCm(BALL_DIAMETER_M), 0)} cm, pall ${comma(BALL_FAR_M, 0)} m ja ekraan ${comma(SCREEN_FAR_M, 0)} m kaugusel allikast. Kui lai on täisvari?`,
    answer: `${comma(metersToCm(BALL_DIAMETER_M), 0)} · ${comma(CARD_RATIO, 0)} / ${comma(BALL_FAR_M, 0)} = ${comma(POINT_UMBRA_CM, 0)} cm – ekraan on ${comma(CARD_RATIO, 0)} korda kaugemal, seega on vari ${comma(CARD_RATIO, 0)} korda laiem.`,
  },
  {
    id: "rc-4",
    type: "explain",
    question:
      "Miks kaob täisvari ära, kui allikas on kehast laiem ja ekraan piisavalt kaugel?",
    answer:
      "Allika kumbki serv paistab keha tagant mööda. Ühest kohast alates jõuab igasse punkti valgus vähemalt ühest allika servast – seega täisvarju enam ei ole, on ainult poolvari.",
  },
  {
    id: "rc-5",
    type: "transfer",
    question:
      "Miks on pilvise ilmaga õues peaaegu varjutu ja päikesepaistes terav vari?",
    answer:
      "Pilvekiht on hiiglaslik laiendatud allikas: tuleb ainult poolvari ja seegi laiali valgunud. Päike on kaugusega võrreldes väike ehk peaaegu punktallikas, seega annab terava täisvarju.",
  },
];

export const activities = defineActivities({ steps, reviewCards });
