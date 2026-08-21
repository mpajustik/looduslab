import { defineActivities } from "../../../engine/contract";
import type { ReviewCard, Step } from "../../../engine/contract";
import { formatNumber } from "../../../lib/format";
import {
  angleFromOffsetDeg,
  offsetAtDistanceM,
  retroreflectionGain,
  returnDeviationDeg,
} from "./model";

/**
 * Sammud ja kordamiskaardid (docs/MOODULILEPING.md, sisu/MOODUL-helkur.md).
 *
 * **Ühtki plekki, nurka ega võimendust ei ole siia käsitsi kirjutatud** – kõik
 * tulevad `model.ts`-i valemitest α = 2·|θ − 90°|, h = L · tan α, α = atan(h/L)
 * ja 1/(1 − cos ω) (CLAUDE.md reegel 1). Nii ei saa ülesande vastus ja
 * simulatsiooni näit kunagi lahku minna. Testis (tests/helkur.model.test.ts)
 * võrreldakse neid arve SPETSIFIKATSIOONI tabeliga, mitte activities.ts
 * iseendaga.
 *
 * **Ühikud.** Nurgad kraadides, pikkused meetrites, võimendus ühikuta –
 * täpselt nii, nagu mudel neid annab. Ühikuteisendusi selles failis EI ole
 * (sisu/MOODUL-helkur.md „Füüsika"): iga ekraanil olev arv on juba meetrites
 * või kraadides loetav.
 *
 * **Kolm piiri, mida ükski ülesanne ei ületa** (sisu/MOODUL-helkur.md
 * „Piirid"):
 *
 * 1. **Kiirte käik kahe peegli vahel jääb moodulisse `nurkpeegel`.** Siin ei
 *    ole ühtki langemis- ega peegeldumisnurga ülesannet; pööre δ = 2·θ on
 *    EELDUS, mille teooria kordab kahe lausega.
 * 2. **Ruumilist kuubinurka ei arvutata.** Moodul ütleb välja, et päris
 *    helkuris on kolm peeglit risti, aga ühtegi ruumilist nurka ei küsi.
 * 3. **Fotomeetriat ega nähtavuskaugust meetrites ei ole.** Võrreldakse ainult
 *    SUHET matt pinnaga; „mitmest meetrist juht näeb" on hooki ja
 *    õpetajajuhendi jutt, mitte ülesanne (pidurdusteekond on plokk P3).
 */

/** Meeter ekraanile: sama üks koht peale koma, mis simulatsiooni kastikestes. */
const metres = (value: number): string => formatNumber(value, 1);

/** Nurk ekraanile: kaks kohta peale koma – 0,29° ja 1,43° on selle mooduli arvud. */
const degrees = (value: number): string => formatNumber(value, 2);

/** Täisarvuline kraad (peeglite nurgaviga ja kiire kõrvalekalle). */
const wholeDegrees = (value: number): string => formatNumber(value);

/**
 * Võimendus ekraanile: kaks tüvenumbrit ja alati sõnaga „umbes".
 *
 * Idealiseering 6 (model.ts): 26 000 on SUURUSJÄRK, mitte mõõdetud väärtus –
 * matt pind ei hajuta päris ühtlaselt üle poolkera. Täpne 26 262,6 lubaks
 * ekraanil täpsust, mida mudelil ei ole. Ümardamine on AINULT tekstis: küsimuse
 * `answer` jääb mudeli täpseks arvuks ja tolerants katab vahe ära.
 */
const gain = (value: number): string => {
  const magnitude = 10 ** (Math.floor(Math.log10(value)) - 1);
  return formatNumber(Math.round(value / magnitude) * magnitude);
};

/** Tagasituleva valgusplekki LÄBIMÕÕT: raadius on `offsetAtDistanceM` (model.ts). */
const spotDiameterM = (spreadDeg: number, distanceM: number): number =>
  2 * offsetAtDistanceM(spreadDeg, distanceM);

// --- Stsenaariumi arvud ja nende tulemused (tulemused mudelist) ------------

/**
 * Juhi silmade kaugus esituledest (m) – tavalise sõiduauto mõõt.
 *
 * Miks siin, mitte model.ts konstandina: Päikese nurk on looduskonstant, auto
 * mõõt on STSENAARIUMI arv (sisu/MOODUL-helkur.md). Nii saab õpetajajuhend
 * rääkida ka veokist (2 m) ilma mudelit puutumata.
 */
const EYE_OFFSET_M = 0.5;

/** Simulatsiooni algseis (sisu/MOODUL-helkur.md „explore"): ω = 0,5°, L = 100 m. */
const START_SPREAD_DEG = 0.5;
const START_DISTANCE_M = 100;
const START_SPOT_M = spotDiameterM(START_SPREAD_DEG, START_DISTANCE_M);
const START_EYE_ANGLE_DEG = angleFromOffsetDeg(EYE_OFFSET_M, START_DISTANCE_M);
const START_GAIN = retroreflectionGain(START_SPREAD_DEG);

/** Liuguri kitsaim seis (explore-2): „liiga täpne helkur". */
const NARROW_SPREAD_DEG = 0.1;
const NARROW_SPOT_M = spotDiameterM(NARROW_SPREAD_DEG, START_DISTANCE_M);

/** Lähedal (explore-3): sama 0,5 m paistab palju suurema nurga alt. */
const NEAR_DISTANCE_M = 20;
const NEAR_EYE_ANGLE_DEG = angleFromOffsetDeg(EYE_OFFSET_M, NEAR_DISTANCE_M);

/** Liuguri laiim seis (explore-4): koonus on lai, võimendus kukub. */
const WIDE_SPREAD_DEG = 2;
const WIDE_GAIN = retroreflectionGain(WIDE_SPREAD_DEG);

/** Poole kitsam koonus (practice-1): ruuminurk neli korda väiksem. */
const HALF_SPREAD_DEG = 0.25;
const HALF_GAIN = retroreflectionGain(HALF_SPREAD_DEG);

/** Lahendatud näidis (practice `worked`): tehases läks vorm 0,5° paigast. */
const WORKED_MIRROR_DEG = 90.5;
const WORKED_MIRROR_ERROR_DEG = WORKED_MIRROR_DEG - 90;
const WORKED_DEVIATION_DEG = returnDeviationDeg(WORKED_MIRROR_DEG);
const WORKED_OFFSET_M = offsetAtDistanceM(WORKED_DEVIATION_DEG, START_DISTANCE_M);

/** Väljumispilet (exit-2): kraad vormis, kaks kraadi valgusele. */
const EXIT_MIRROR_DEG = 91;
const EXIT_MIRROR_ERROR_DEG = EXIT_MIRROR_DEG - 90;
const EXIT_DEVIATION_DEG = returnDeviationDeg(EXIT_MIRROR_DEG);
const EXIT_OFFSET_M = offsetAtDistanceM(EXIT_DEVIATION_DEG, START_DISTANCE_M);
/**
 * Lõks exit-2 juures: kes unustab kahekordistamise, arvutab 100 · tan 1°.
 *
 * Kõrvalekalle tuleb siin peeglite nurgaveast ILMA kahekordistamiseta – täpselt
 * see viga, mida lõks püüab. Arv käib läbi sama mudeli, seega jääb ta õigeks ka
 * siis, kui kaugus kunagi muutub.
 */
const EXIT_TRAP_OFFSET_M = offsetAtDistanceM(
  EXIT_MIRROR_ERROR_DEG,
  START_DISTANCE_M,
);

/**
 * Lugemistolerantsid, MITTE mõõtemääramatus: simulatsioon on ideaalne, aga
 * õpilane loeb kastikesest arvu ja tipib käsitsi (sisu/MOODUL-helkur.md
 * „explore").
 */
/** Plekki läbimõõt: ekraanil on arv ühe kohaga peale koma. */
const METRE_TOLERANCE = { mode: "absolute", value: 0.3 } as const;
/** Nurk: 0,29° ja 1,43° peavad jääma teineteisest kindlalt eraldi. */
const ANGLE_TOLERANCE = { mode: "absolute", value: 0.05 } as const;
/** Võimendus on suurusjärk (idealiseering 6), seega lubab ümardamist mõlemas otsas. */
const GAIN_TOLERANCE = { mode: "absolute", value: 300 } as const;
/** Sama, aga saja tuhande juures: 4 · 26 000 ei pea täppi minema. */
const BIG_GAIN_TOLERANCE = { mode: "absolute", value: 10000 } as const;
/** Väljumispileti arvutus: kraadi jagu suurem viga annab suurema hüppe. */
const EXIT_TOLERANCE = { mode: "absolute", value: 0.5 } as const;

const steps: Step[] = [
  {
    type: "hook",
    id: "hook-1",
    // Joonis näitab ainult seda, ET helkuriga jalakäija paistab ja ilma
    // helkurita mitte. MIKS, seda ütlevad teooria ja simulatsioon – hook ei
    // tohi vastust ette öelda ega ühtegi nurka väita.
    figure: "hl-kaks-jalakaijat",
    title: "50 senti, mis teeb pimedas nähtavaks",
    body: [
      "Helkur maksab 50 senti, ei tarbi voolu ega tee ise ühtki valguskiirt. Ometi näeb autojuht helkuriga jalakäijat pimedal maanteel mitu korda varem kui ilma.",
      "Sama tükk plastikut on aga pimedas toas täiesti nähtamatu – ta ei helenda, ei sära ega paista kuidagi silma.",
      "Kuidas teeb üks tükk plastikut sellise vahe? Ja miks paistab ta ainult siis, kui keegi teda valgustab?",
    ],
  },
  {
    type: "theory",
    id: "theory-1",
    title: "Valgus tagasi sinna, kust ta tuli",
    body: [
      "Meeldetuletus: kaks tasast peeglit nurga all pööravad kiirt kokku kaks korda rohkem, kui on peeglite nurk – ükskõik kust kiir tuli. Täisnurga all (90°) on pööre 180°: kiir läheb täpselt tagasi sinna, kust ta tuli. Just see ongi HELKUR.",
      "Helkur ei ole tavaline peegel. Tasapeegel saadab valguse ühte kindlasse suunda: teeäärne peegel viskaks autotulede valguse metsa, mitte juhile. Matt valge riie hajutab valguse igasse suunda laiali ja juhini jõuab sellest tibatilluke osa. Helkur teeb kolmandat asja – saadab valguse tagasi ALLIKA poole. Seepärast „süttib\" ta ainult selle jaoks, kes on valgusallika juures.",
      "Pimedas ta ei paista, sest ta ei tee valgust. Helkur saadab tagasi ainult selle valguse, mis talle langeb – ilma autotuledeta ei ole tal midagi tagasi saata. See on TAGASIPEEGELDUMINE, mitte helendamine.",
      "Päris helkuris on kolm peeglit, mitte kaks. Kaks peeglit saadavad kiire täpselt tagasi ainult siis, kui valgus tuleb nende ühisservaga – kahe peegli kokkusaamise joonega – risti. Serva sihis liikuvat osa valgusest ei pööra kumbki peegel ümber. Tänaval tuleb valgus ka ülalt ja alt, seepärast on päris helkur täpitud pisikestest kuubinurkadest: kolm peeglit risti nagu toa nurk, kus kaks seina ja põrand kokku saavad.",
      `Hind 1: vale nurk kahekordistub. Kui peeglid ei ole täpselt 90°, vaid ${formatNumber(WORKED_MIRROR_ERROR_DEG, 1)}° võrra viltu, kaldub tagasitulev kiir ${wholeDegrees(WORKED_DEVIATION_DEG)}° võrra kõrvale – pööre on kaks korda peeglite nurk, seega kahekordistub ka viga. ${formatNumber(START_DISTANCE_M)} m kaugusel tähendab see ${metres(WORKED_OFFSET_M)} m ehk üle poole auto laiusest.`,
      `Hind 2: liiga täpne helkur oleks kasutu. Juhi silmad on esituledest umbes ${metres(EYE_OFFSET_M)} m kõrval, mis ${formatNumber(START_DISTANCE_M)} m kauguselt on ainult ${degrees(START_EYE_ANGLE_DEG)}°. Täiesti täpne helkur saadaks kogu valguse tagasi TULEDESSE ja juht ei näeks midagi. Seepärast on päris helkur tahtlikult natuke ebatäpne: tagasitulev valgus läheb kitsa koonusena laiali, nii et ta ulatub tuledest silmadeni – aga mitte palju kaugemale.`,
    ],
    figure: "hl-kolm-pinda",
  },
  {
    type: "predict",
    id: "predict-1",
    title: "Paku oma ennustus",
    body: [
      "Kolmel jalakäijal on rinnal kolm eri asja: ühel tavaline tasapeegel, teisel valge matt riidetükk, kolmandal helkur. Kõik kolm on ühesuuruse pinnaga ja ripuvad rinnal niisama, ilma et keegi neid auto poole sihiks.",
    ],
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt: "Keda juht pimedal maanteel kõige kaugemalt näeb?",
        options: [
          {
            id: "peegel",
            text: "Tasapeegliga jalakäijat – peegel peegeldab kõige rohkem valgust",
            correct: false,
            misconception: "peegel-on-parem",
          },
          {
            id: "valge-riie",
            text: "Valge riidega jalakäijat – valge paistab pimedas kõige paremini",
            correct: false,
            misconception: "valge-on-parem",
          },
          {
            id: "helkur",
            text: "Helkuriga jalakäijat – tema saadab valguse tagasi just auto poole",
            correct: true,
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
    title: "Uuri helkurit pimedal maanteel",
    body: [
      `Pilt on maantee PEALTVAADE. All on auto kahe esitulega ja nende kõrval juhi silmad – nad on tuledest ${metres(EYE_OFFSET_M)} m kõrval ja see ei muutu. Üleval tee ääres seisab jalakäija, kellel on rinnal helkur.`,
      "Autolt läheb helkurile hele kimp. Helkurilt tuleb tagasi koonus, mis läheb kaugusega aina laiemaks. Auto juures on selle koonuse plekk näha mõõdujoone ja arvuga: kas plekk katab juhi silmad või jääb neist ilma?",
      "Korraga on ekraanil kaks asja: PÄRIS koonus (hajuvusega, laieneb) ja õhem IDEAALSE helkuri kiir (hajuvuseta, tuleb täpselt tuledesse tagasi). Nad on eri värvi ja eri joonemustriga, mõlemal on oma silt – vahe nende kahe vahel ongi kogu mooduli mõte.",
      "Liuguritega saad muuta hajuvusnurka ω (kui laiali tagasitulev valgus läheb) ja kaugust auto ning helkuri vahel. Kastikestes on plekki läbimõõt, silmade ja tulede vaheline nurk ning see, mitu korda eredam on helkur matist riidest.",
    ],
    questions: [
      {
        kind: "numeric",
        id: "explore-1",
        prompt: `Jäta hajuvusnurgaks ω = ${degrees(START_SPREAD_DEG)}° ja kauguseks ${formatNumber(START_DISTANCE_M)} m. Kui lai on tagasituleva valguse plekk auto juures?`,
        hints: [
          "Vaata mõõdujoont auto juures.",
          "Arv on kastikeses „Tagasituleva valguse plekk\".",
        ],
        unit: "m",
        tolerance: METRE_TOLERANCE,
        answer: START_SPOT_M,
      },
      {
        kind: "choice",
        id: "explore-2",
        prompt: `Sea hajuvus kõige väiksemaks: ω = ${degrees(NARROW_SPREAD_DEG)}°. Kas valgus jõuab nüüd juhi silma?`,
        hints: [
          `Plekk on tulede ÜMBER: silmadeni ulatub ta alles siis, kui ta on vähemalt kaks korda ${metres(EYE_OFFSET_M)} m ehk ${metres(2 * EYE_OFFSET_M)} m lai.`,
        ],
        options: [
          {
            id: "jah-tapsem",
            text: "Jah, sest kitsam kiir on täpsem",
            correct: false,
            misconception: "tapsem-on-parem",
          },
          {
            id: "ei",
            text: `Ei – plekk on ainult ${metres(NARROW_SPOT_M)} m lai, aga silmadeni ulatumiseks peaks ta olema ${metres(2 * EYE_OFFSET_M)} m (silmad on tuledest ${metres(EYE_OFFSET_M)} m kõrval, plekk on tulede ümber)`,
            correct: true,
          },
          {
            id: "jah-alati",
            text: "Jah, sest helkur saadab valguse alati tagasi",
            correct: false,
            misconception: "tagasi-tahendab-silma",
          },
        ],
      },
      {
        kind: "numeric",
        id: "explore-3",
        prompt: `Sea ω = ${degrees(START_SPREAD_DEG)}° tagasi ja lohista kaugus ${formatNumber(NEAR_DISTANCE_M)} m peale. Mitme kraadi kaugusel tuledest paistavad juhi silmad nüüd?`,
        hints: ["Arv on kastikeses „Silmad paistavad …\"."],
        unit: "°",
        tolerance: ANGLE_TOLERANCE,
        answer: NEAR_EYE_ANGLE_DEG,
        // Lõks: kes kaugust ei muutnud, loeb ekraanilt algseisu nurga.
        traps: [
          {
            answer: START_EYE_ANGLE_DEG,
            misconception: "kaugus-maarab-koik",
            feedback: `See on nurk ${formatNumber(START_DISTANCE_M)} m kaugusel. Lähemal paistab sama ${metres(EYE_OFFSET_M)} m palju suurema nurga alt – lohista kaugus ${formatNumber(NEAR_DISTANCE_M)} m peale ja loe uuesti.`,
          },
        ],
      },
      {
        kind: "numeric",
        id: "explore-4",
        prompt: `Jäta kaugus ${formatNumber(NEAR_DISTANCE_M)} m ja sea ω = ${degrees(WIDE_SPREAD_DEG)}°. Mitu korda eredam on helkur veel matist riidest?`,
        hints: [
          "Arv on kastikeses „Nii ere kui matt riie\".",
          "Laiem koonus tähendab väiksemat arvu.",
        ],
        tolerance: GAIN_TOLERANCE,
        answer: WIDE_GAIN,
        traps: [
          {
            answer: START_GAIN,
            misconception: "tapsem-on-parem",
            feedback: `See on kitsa koonuse (ω = ${degrees(START_SPREAD_DEG)}°) võimendus. Laiem koonus jagab sama valguse suurema ala peale, seega arv KAHANEB.`,
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
      prompt: `Tehases läks helkuri vorm veidi paigast ja peeglite nurgaks tuli ${formatNumber(WORKED_MIRROR_DEG, 1)}° täpse 90° asemel. Kui palju möödub tagasitulev valgus autost ${formatNumber(START_DISTANCE_M)} m kaugusel?`,
      solution: [
        `Peeglite nurgaviga on ${formatNumber(WORKED_MIRROR_ERROR_DEG, 1)}°, aga kiire kõrvalekalle on kaks korda suurem: 2 · ${formatNumber(WORKED_MIRROR_ERROR_DEG, 1)}° = ${wholeDegrees(WORKED_DEVIATION_DEG)}°.`,
        `${formatNumber(START_DISTANCE_M)} m kaugusel annab see ${formatNumber(START_DISTANCE_M)} · tan ${wholeDegrees(WORKED_DEVIATION_DEG)}° = ${metres(WORKED_OFFSET_M)} m.`,
      ],
      answer: `Valgus möödub autost ${metres(WORKED_OFFSET_M)} m kauguselt. Auto on umbes 1,8 m lai ja juhi silmad on tuledest ${metres(EYE_OFFSET_M)} m kõrval – pool kraadi vormis tähendab, et helkur ei tööta.`,
    },
    questions: [
      {
        // Osaline: tehe on ees, vastus tuleb ise.
        kind: "numeric",
        id: "practice-1",
        prompt: `Ühe helkuri hajuvusnurk on ${degrees(START_SPREAD_DEG)}° ja tema võimendus umbes ${gain(START_GAIN)} korda. Teise helkuri koonus on kaks korda kitsam (${degrees(HALF_SPREAD_DEG)}°). Kaks korda kitsam koonus tähendab NELI korda väiksemat ruuminurka, seega ${gain(START_GAIN)} · 4 = ___ korda.`,
        hints: ["Ruuminurk sõltub nurga ruudust."],
        tolerance: BIG_GAIN_TOLERANCE,
        answer: HALF_GAIN,
      },
      {
        // Iseseisev: helkur ei tee ise valgust.
        kind: "choice",
        id: "practice-2",
        prompt: "Miks ei paista helkur pimedas toas, kus ühtki valgusallikat ei ole?",
        hints: ["Helkur ise ei sära – mõtle, mida ta täpselt teeb valgusega, mis talle langeb."],
        options: [
          {
            id: "soojus",
            text: "Sest ta vajab soojust",
            correct: false,
            misconception: "helkur-teeb-valgust",
          },
          {
            id: "ei-tee-valgust",
            text: "Sest helkur ei tee ise valgust – ta saadab tagasi ainult selle valguse, mis talle langeb",
            correct: true,
          },
          {
            id: "plastik-kaotab",
            text: "Sest pimedas kaotab plastik oma peegeldusvõime",
            correct: false,
            misconception: "helkur-teeb-valgust",
          },
        ],
      },
      {
        // Iseseisev: loeb koonuse suund, mitte kaugus.
        kind: "choice",
        id: "practice-3",
        prompt:
          "Sina seisad tee ÄÄRES ja vaatad jalakäijat, keda mööduva auto tuled valgustavad. Miks ei paista tema helkur sulle nii eredalt kui autojuhile?",
        hints: [
          "Helkur saadab valguse kitsa koonusena tagasi TÄPSELT sinna, kust see tuli – kas sina oled selles koonuses?",
        ],
        options: [
          {
            id: "kaugemal",
            text: "Sest ma olen kaugemal",
            correct: false,
            misconception: "kaugus-maarab-koik",
          },
          {
            id: "koonusest-valjas",
            text: "Sest helkur saadab valguse kitsa koonusena tagasi auto poole ja mina ei ole selle koonuse sees",
            correct: true,
          },
          {
            id: "vajab-liikumist",
            text: "Sest helkur töötab ainult liikuva vaataja jaoks",
            correct: false,
            misconception: "helkur-vajab-liikumist",
          },
        ],
      },
      {
        // Ülekanne, mitu õiget: kus kasutatakse sama põhimõtet.
        kind: "choice",
        id: "practice-4",
        prompt:
          "Kus kasutatakse sama põhimõtet, mis helkuris (valgus tagasi sinna, kust ta tuli)?",
        hints: [
          "Otsi asju, mida nähakse just autotuledes helendamas – tavaline peegel ei tee seda, sest tema peegeldab vastavalt nurgale, mitte alati tagasi allikale.",
        ],
        multiple: true,
        shuffle: true,
        options: [
          { id: "jalgratta-helkur", text: "Jalgratta tagahelkur", correct: true },
          {
            id: "teemark",
            text: "Teeäärne teemärk, mis autotulede käes helendab",
            correct: true,
          },
          {
            id: "jooksja-vest",
            text: "Jooksja vest, mis paistab autotuledes",
            correct: true,
          },
          {
            id: "turvapeegel",
            text: "Poe koridori nurgas olev turvapeegel",
            correct: false,
            misconception: "koik-peeglid-on-samad",
          },
          {
            id: "periskoop",
            text: "Periskoop, millega vaadatakse üle müüri",
            correct: false,
            misconception: "koik-peeglid-on-samad",
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
        prompt: "Miks saadab helkur valguse tagasi just auto poole?",
        hints: [
          "Läikiv on ka tavaline peegel, aga tema ei saada valgust tagasi sinna, kust see tuli – helkuril on selleks eriline sisemine ehitus.",
        ],
        options: [
          {
            // Sildita vale variant: „tugevalt läikiv" ei ole ükski mooduli
            // väärarusaamadest – see on poolik seletus (läikiv on ka
            // tasapeegel, aga tema saadab valguse metsa, mitte juhile).
            id: "laikiv",
            text: "Sest ta on tugevalt läikiv",
            correct: false,
          },
          {
            id: "taisnurk",
            text: "Sest tema pisikesed peeglid on omavahel täisnurga all ja kaks (ruumis kolm) peegeldust pööravad kiirt kokku 180°",
            correct: true,
          },
          {
            id: "suunatud",
            text: "Sest ta on suunatud tee poole",
            correct: false,
            misconception: "tagasi-tahendab-silma",
          },
        ],
      },
      {
        kind: "numeric",
        id: "exit-2",
        prompt: `Helkuri peeglite nurgaks tuli tehases ${formatNumber(EXIT_MIRROR_DEG)}° täpse 90° asemel. Mitu meetrit möödub tagasitulev valgus autost ${formatNumber(START_DISTANCE_M)} m kaugusel?`,
        hints: [
          "Kõrvalekalle on kaks korda peeglite nurgaviga.",
          `${formatNumber(START_DISTANCE_M)} · tan ${wholeDegrees(EXIT_DEVIATION_DEG)}°`,
        ],
        unit: "m",
        tolerance: EXIT_TOLERANCE,
        answer: EXIT_OFFSET_M,
        traps: [
          {
            answer: EXIT_TRAP_OFFSET_M,
            misconception: "viga-ei-kahekordistu",
            feedback: `See on ${wholeDegrees(EXIT_MIRROR_ERROR_DEG)}° suuruse kõrvalekalde vastus. Peeglite nurgaviga on ${wholeDegrees(EXIT_MIRROR_ERROR_DEG)}°, aga kiir kaldub kaks korda rohkem: ${wholeDegrees(EXIT_DEVIATION_DEG)}°.`,
          },
        ],
      },
      {
        kind: "text",
        id: "exit-3",
        prompt:
          "Sõber ütleb: „Kõige parem helkur oleks selline, mis saadab valguse täpselt tagasi, ilma igasuguse hajumiseta.\" Mis sa talle vastad?",
        minWords: 10,
      },
    ],
  },
];

/**
 * Kordamiskaardid (docs/MOODULILEPING.md „activities.ts – kordamiskaardid",
 * sisu/MOODUL-helkur.md „Kordamiskaardid").
 */
const reviewCards: ReviewCard[] = [
  {
    id: "rc-1",
    type: "transfer",
    question: "Miks saadab helkur autotulede valguse tagasi just auto poole?",
    answer:
      "Tema pisikesed peeglid on omavahel täisnurga all. Kaks peegeldust täisnurgas pööravad kiirt kokku 180° – ükskõik kust valgus tuli, läheb ta tagasi sinna, kust ta tuli.",
  },
  {
    id: "rc-2",
    type: "explain",
    question: "Miks ei paista helkur pimedas toas?",
    answer:
      "Helkur ei tee ise valgust. Ta saadab tagasi ainult selle valguse, mis talle langeb – ilma valgusallikata ei ole tal midagi tagasi saata.",
  },
  {
    id: "rc-3",
    type: "calc",
    question: `Helkuri peeglite nurgaks tuli ${formatNumber(EXIT_MIRROR_DEG)}° täpse 90° asemel. Mitu kraadi kaldub tagasitulev kiir kõrvale ja mitu meetrit on see ${formatNumber(START_DISTANCE_M)} m kaugusel?`,
    answer: `Kõrvalekalle on kaks korda nurgaviga ehk ${wholeDegrees(EXIT_DEVIATION_DEG)}°; ${formatNumber(START_DISTANCE_M)} · tan ${wholeDegrees(EXIT_DEVIATION_DEG)}° ≈ ${metres(EXIT_OFFSET_M)} m – valgus möödub autost.`,
  },
  {
    id: "rc-4",
    type: "explain",
    question: "Miks peab helkur olema natuke ebatäpne?",
    answer: `Täiesti täpne helkur saadaks kogu valguse tagasi esituledesse, aga juhi silmad on tuledest umbes ${metres(EYE_OFFSET_M)} m kõrval. Tagasitulev valgus peab minema kitsa koonusena nii laiali, et ulatuks tuledest silmadeni – ${formatNumber(START_DISTANCE_M)} m kaugusel on see nurk ${degrees(START_EYE_ANGLE_DEG)}°.`,
  },
  {
    id: "rc-5",
    type: "transfer",
    question:
      "Sina seisad tee ääres ja vaatad helkuriga jalakäijat, keda auto tuled valgustavad. Miks ei paista helkur sulle eredalt?",
    answer:
      "Helkur saadab valguse kitsa koonusena tagasi auto poole ja sina ei ole selle koonuse sees. Sama kitsus, mis teeb ta juhi jaoks eredaks, teeb ta kõrvalseisjale tuhmiks.",
  },
];

export const activities = defineActivities({ steps, reviewCards });
