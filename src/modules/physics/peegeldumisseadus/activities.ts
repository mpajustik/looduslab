import { defineActivities } from "../../../engine/contract";
import type { ReviewCard, Step } from "../../../engine/contract";

/**
 * Sammud ja kordamiskaardid (docs/MOODULILEPING.md, sisu/MOODUL-peegeldumisseadus.md).
 *
 * Sisu on pärit sammuraami arendusdemost (endine StepDemoPage, sammud
 * 1.9–1.12), kus see juba läbis kaks ülevaatusringi (CodeRabbit + Codex) ja
 * telefonis katsetuse. Demo (`/m/test`) on samm 1.13 seisuga eemaldatud –
 * päris moodul (`/m/peegeldumisseadus`) katab nüüd sama eesmärki, seega
 * kahte kohta sama sisuga enam ei ole.
 */
const steps: Step[] = [
  {
    type: "theory",
    id: "theory-1",
    title: "Valgus liigub sirgjooneliselt",
    body: [
      "Ühtlases keskkonnas – õhus, vees, klaasis – liigub valgus sirget joont mööda. Just seepärast tekib eseme taha terav vari.",
      "Valguskiir on joonisel see sirge joon koos noolega. Nool näitab, kuhupoole valgus liigub.",
    ],
  },
  {
    type: "theory",
    id: "theory-2",
    title: "Peegeldumine",
    body: [
      "Kui valguskiir jõuab siledale pinnale, ei jää ta sinna pidama: ta põrkab tagasi. Seda nimetatakse peegeldumiseks.",
      "Siledalt pinnalt (peegel, vaikne veepind) peegelduvad kõrvuti tulnud kiired korrapäraselt: nad jäävad ka pärast peegeldumist kõrvuti. Mattpind (paber, sein) saadab nad laiali eri suundadesse – seepärast näed peeglist oma nägu, seinast mitte.",
    ],
    // Kaks pinda kõrvuti: sõnadest üksi ei tule vahe välja (katsetus
    // 2026-08-04).
    figure: "sile-ja-mattpind",
  },
  {
    type: "theory",
    id: "theory-3",
    title: "Pinna ristsirge – joon, mille suhtes nurki mõõdetakse",
    body: [
      "Nurki ei mõõdeta mitte peegli pinna, vaid pinnaga risti oleva joone suhtes. Seda risti joont nimetatakse pinna ristsirgeks.",
      "Sellest ühest kokkuleppest sõltub kogu peegeldumisseadus. Pinna suhtes mõõtes saad hoopis teise arvu: see täiendab ristsirgest mõõdetud nurga 90 kraadini.",
    ],
    // Kõik mõisted korraga ühel joonisel – siin on nad esimest korda koos
    // (katsetus 2026-08-04: tekstist üksi ei saanud õpilane pilti kokku).
    figure: "peegeldumise-moisted",
  },
  {
    type: "hook",
    id: "hook-1",
    title: "Kuhu peegeldub valguskiir?",
    body: [
      "Mari mängib pimedas toas taskulambiga. Ta suunab valguskiire peeglile, aga tahab, et kiir tabaks kindlat kohta seinal – täpselt märklauda.",
      "Praegu läheb kiir peeglilt hoopis mööda märklauast. Kuhupoole peab Mari peeglit keerama, et kiir tabaks märklauda?",
      "Täna õpid ennustama, kuhu valguskiir peegeldub – ja miks see nii juhtub.",
    ],
    // Olukord pildis: ilma selleta pidi õpilane kolme lause järgi ise stseeni
    // ette kujutama (katsetus 2026-08-04).
    figure: "mari-taskulambiga",
  },
  {
    type: "precheck",
    id: "precheck-1",
    title: "Kontrolli, kas jäi meelde",
    questions: [
      {
        kind: "choice",
        id: "precheck-1",
        prompt: "Millise joone suhtes mõõdetakse valguskiire langemisnurka?",
        hints: ["Kummast joonest mõõdetakse peegeldumisseaduse nurki?"],
        options: [
          {
            id: "pind",
            text: "Peegli pinna suhtes",
            correct: false,
            misconception: "nurk-pinna-suhtes",
          },
          {
            // Variandi id jääb muutumatuks ka mõiste ümbernimetamisel –
            // vastused ripuvad id, mitte teksti küljes (CLAUDE.md reegel 11).
            id: "normaal",
            text: "Pinna ristsirge suhtes – joone suhtes, mis on peegli pinnaga risti",
            correct: true,
          },
          {
            id: "kiir",
            text: "Peegeldunud kiire suhtes",
            correct: false,
            misconception: "nurk-kiirte-vahel",
          },
        ],
      },
      {
        // Arvvastus koos lõksuga: antud nurk on PINNA suhtes, õige vastus
        // ristsirge suhtes (sisu/MOODUL-peegeldumisseadus.md, practice 3).
        // Neli varianti, et kordamisel ei saaks vastust pähe õppida – lõks
        // käib variandi juurde, sest ta on alati just see antud arv.
        kind: "numeric",
        id: "precheck-2",
        prompt:
          "Kiir langeb tasapeeglile nii, et moodustab peegli PINNAGA {pinnanurk}° nurga. Kui suur on peegeldumisnurk pinna ristsirge suhtes?",
        hints: [
          "Kummast joonest mõõdetakse peegeldumisseaduse nurki?",
          "Ristsirge ja pinna vahel on 90°.",
        ],
        unit: "°",
        // Tolerants peab olema positiivne (contractSchema) – 0,5° on siin
        // sisuliselt „täpne vastus", vt plaani lahtist küsimust sammu 1.4 all.
        tolerance: { mode: "absolute", value: 0.5 },
        variants: [
          {
            id: "p35",
            values: { pinnanurk: 35 },
            answer: 55,
            traps: [
              {
                answer: 35,
                misconception: "nurk-pinna-suhtes",
                feedback:
                  "See on nurk pinna suhtes. Nurki mõõdetakse pinna ristsirgest ja ristsirge ning pinna vahele jääb 90°.",
              },
            ],
          },
          {
            id: "p20",
            values: { pinnanurk: 20 },
            answer: 70,
            traps: [
              {
                answer: 20,
                misconception: "nurk-pinna-suhtes",
                feedback:
                  "See on nurk pinna suhtes. Nurki mõõdetakse pinna ristsirgest ja ristsirge ning pinna vahele jääb 90°.",
              },
            ],
          },
          {
            id: "p50",
            values: { pinnanurk: 50 },
            answer: 40,
            traps: [
              {
                answer: 50,
                misconception: "nurk-pinna-suhtes",
                feedback:
                  "See on nurk pinna suhtes. Nurki mõõdetakse pinna ristsirgest ja ristsirge ning pinna vahele jääb 90°.",
              },
            ],
          },
          {
            id: "p65",
            values: { pinnanurk: 65 },
            answer: 25,
            traps: [
              {
                answer: 65,
                misconception: "nurk-pinna-suhtes",
                feedback:
                  "See on nurk pinna suhtes. Nurki mõõdetakse pinna ristsirgest ja ristsirge ning pinna vahele jääb 90°.",
              },
            ],
          },
        ],
      },
      {
        kind: "choice",
        id: "precheck-3",
        prompt: "Millised väited peegeldumise kohta on õiged? Õigeid vastuseid on mitu.",
        multiple: true,
        options: [
          { id: "sile", text: "Siledalt pinnalt peegelduvad kõrvuti kiired korrapäraselt", correct: true },
          { id: "matt", text: "Mattpind saadab kiired laiali eri suundadesse", correct: true },
          {
            id: "ainult-peegel",
            text: "Ainult läikivad esemed peegeldavad valgust",
            correct: false,
            misconception: "ainult-peegel-peegeldab",
          },
        ],
      },
    ],
  },
  {
    type: "predict",
    id: "predict-1",
    title: "Paku oma ennustus",
    body: [
      "Kujuta ette tasapeeglit, mis lebab laual. Sellele langeb valguskiir 30° nurga all – nurk on mõõdetud pinnaga risti oleva joone (ristsirge) suhtes.",
    ],
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt: "Kui suure nurga all ristsirge suhtes lahkub peegeldunud kiir?",
        // Ainus küsimus, mille variandid EI lähe segamisse: arvud on kasvavas
        // reas ja „sõltub materjalist" kuulub lõppu. Segatud kraadid näeksid
        // välja nagu trükiviga (vt contractSchema `shuffle`).
        shuffle: false,
        options: [
          { id: "15", text: "15°", correct: false },
          { id: "30", text: "30°", correct: true },
          { id: "60", text: "60°", correct: false },
          { id: "materjal", text: "Sõltub peegli materjalist", correct: false },
        ],
      },
    ],
  },
  {
    type: "explore",
    id: "explore-1",
    title: "Katseta simulatsiooniga",
    body: [
      "Liiguta liugurit ja jälgi, kuidas peegeldumisnurk langemisnurgaga kaasas käib.",
    ],
    questions: [
      {
        kind: "numeric",
        id: "explore-1",
        prompt: "Sea langemisnurk 30°. Mis on peegeldumisnurk?",
        answer: 30,
        unit: "°",
        tolerance: { mode: "absolute", value: 1 },
      },
      {
        kind: "numeric",
        id: "explore-2",
        prompt: "Leia nurk, mille korral kiir peegeldub otse tagasi.",
        answer: 0,
        unit: "°",
        tolerance: { mode: "absolute", value: 1 },
      },
      {
        kind: "numeric",
        id: "explore-3",
        prompt:
          "Lülita sisse „Näita nurka pinna suhtes“. Sea langemisnurk ristsirge suhtes 60°. Mitu kraadi on see pinna suhtes?",
        answer: 30,
        unit: "°",
        tolerance: { mode: "absolute", value: 1 },
      },
      {
        // Ainus ülesanne, mis nõuab mattpinna lülitit – see avaneb ülesande 2
        // järel, aga kuni selleni ei kasutanud teda ükski ülesanne (katsetus
        // 2026-08-04).
        kind: "choice",
        id: "explore-4",
        prompt: "Lülita sisse „Mattpind“ sama nurga juures. Mis kiirtega juhtub?",
        options: [
          {
            id: "hajub-seaduse-jargi",
            text: "Kiired hajuvad mitmes suunas, aga iga üksik kiir järgib ikka peegeldumisseadust",
            correct: true,
          },
          {
            id: "ei-peegeldu",
            text: "Valgus ei peegeldu mattpinnalt, sest see pole peegel",
            correct: false,
            misconception: "ainult-peegel-peegeldab",
          },
          {
            id: "uks-kiir",
            text: "Tuleb tagasi ikka ainult üks kindel kiir, samamoodi nagu tasapeeglilt",
            correct: false,
            misconception: "mattpind-uks-kiir",
          },
        ],
      },
    ],
    simulation: {
      unlocks: [{ feature: "mattpind", afterQuestion: "explore-2" }],
    },
  },
  {
    type: "collect",
    id: "collect-1",
    title: "Kirjuta mõõtmised üles",
    body: [
      "Vali kolm erinevat langemisnurka. Loe iga kord ekraanilt mõlemad nurgad ja kirjuta need tabelisse.",
      "Kraadimärki ei pea kirjutama – piisab arvust.",
    ],
    questions: [
      {
        kind: "table",
        id: "collect-1",
        prompt: "Kolm mõõtmist simulatsioonist",
        // `min`/`max` on SIMULATSIOONI liuguri piirid: ilma nendeta läbiks
        // kontrolli iga kaks võrdset arvu, ka „10000 ja 10000", mida ekraanil
        // kunagi ei olnud (Codexi ülevaatuse leid 2026-08-03).
        columns: [
          { key: "angleIn", label: "Langemisnurk", unit: "°", min: 0, max: 85 },
          { key: "angleOut", label: "Peegeldumisnurk", unit: "°", min: 0, max: 85 },
        ],
        rows: 3,
        // Kolm ERI nurka: ühest korratud väärtusest ei paista seaduspärasus
        // välja (sisu/MOODUL-peegeldumisseadus.md „collect").
        distinctColumn: "angleIn",
        rule: {
          kind: "equal-columns",
          column: "angleOut",
          equalsColumn: "angleIn",
          // ±1° on LUGEMISTOLERANTS: simulatsioon on ideaalne, aga õpilane
          // loeb liugurilt ja tipib käsitsi. Mõõtmishajuvus jääb päris katsele.
          tolerance: { mode: "absolute", value: 1 },
        },
      },
    ],
  },
  {
    type: "explain",
    id: "explain-1",
    title: "Sõnasta seaduspärasus",
    body: [
      "Vaata oma kolme mõõtmist. Mis on langemisnurga ja peegeldumisnurga vahel ühist?",
      "Kirjuta oma sõnadega kolm asja: mida sa väidad, millised mõõtmised seda näitavad ja miks see nii on. Võrdle ka oma ennustusega – kas pidid midagi ümber mõtlema?",
    ],
    // Ennustus on kõrval näha, et võrdlemiseks ei peaks samme tagasi kerima.
    recallQuestion: "predict-1",
    questions: [
      {
        kind: "text",
        id: "explain-1",
        prompt: "Sõnasta oma mõõtmiste põhjal seaduspärasus.",
        minWords: 15,
      },
    ],
  },
  {
    type: "practice",
    id: "practice-1",
    // Pealkiri EI kordu sildiga („Harjuta"), mis on kohe kohal – kaks korda
    // sama sõna kohakuti ei ütle õpilasele midagi juurde.
    title: "Proovi ise järele",
    // Näidis on LAHENDATUD ülesanne, mitte küsimus – õpilane näeb ühe
    // lahenduskäigu lõpuni enne, kui ise proovib.
    worked: {
      prompt:
        "Valguskiir langeb tasapeeglile 40° nurga all pinna ristsirge suhtes. Kui suur on peegeldumisnurk?",
      solution: [
        "Nurgad mõõdetakse pinna ristsirgest – nii langemis- kui ka peegeldumisnurk.",
        "Peegeldumisseadus: peegeldumisnurk võrdub langemisnurgaga.",
        "Langemisnurk on 40°, seega peegeldumisnurk on samuti 40°.",
      ],
      answer: "40°",
    },
    questions: [
      {
        kind: "numeric",
        id: "practice-1",
        prompt:
          "Nüüd sina: valguskiir langeb peeglile {nurk}° nurga all pinna ristsirge suhtes. Kui suur on peegeldumisnurk?",
        unit: "°",
        // Sama kokkulepe mis mujal: tolerants peab olema positiivne, seega
        // 0,5° tähendab siin „täpne vastus" (vt plaani samm 1.4).
        tolerance: { mode: "absolute", value: 0.5 },
        // Ükski variant ei ole 40° – see on näidisülesande arv kohe ülalpool.
        // Sama arv tähendaks, et vastuse saab maha kirjutada, mitte arvutada.
        variants: [
          { id: "n25", values: { nurk: 25 }, answer: 25 },
          { id: "n35", values: { nurk: 35 }, answer: 35 },
          { id: "n55", values: { nurk: 55 }, answer: 55 },
          { id: "n70", values: { nurk: 70 }, answer: 70 },
        ],
      },
      {
        // Lõksülesanne: nurk on antud PINNA, mitte ristsirge suhtes.
        // Variandiarvud on teised kui precheck-2-l, et sama tunni sees ei
        // korduks sama arv kaks korda (variandi loos on küsimuste vahel
        // sõltumatu – vt src/engine/resolve.ts).
        kind: "numeric",
        id: "practice-2",
        prompt:
          "Kiir langeb tasapeeglile nii, et moodustab peegli PINNAGA {pinnanurk}° nurga. Kui suur on peegeldumisnurk pinna ristsirge suhtes?",
        hints: [
          "Kummast joonest mõõdetakse peegeldumisseaduse nurki?",
          "Ristsirge ja pinna vahel on 90°.",
        ],
        unit: "°",
        tolerance: { mode: "absolute", value: 0.5 },
        variants: [
          {
            id: "p25",
            values: { pinnanurk: 25 },
            answer: 65,
            traps: [
              {
                answer: 25,
                misconception: "nurk-pinna-suhtes",
                feedback:
                  "See on nurk pinna suhtes. Nurki mõõdetakse pinna ristsirgest ja ristsirge ning pinna vahele jääb 90°.",
              },
            ],
          },
          {
            id: "p40",
            values: { pinnanurk: 40 },
            answer: 50,
            traps: [
              {
                answer: 40,
                misconception: "nurk-pinna-suhtes",
                feedback:
                  "See on nurk pinna suhtes. Nurki mõõdetakse pinna ristsirgest ja ristsirge ning pinna vahele jääb 90°.",
              },
            ],
          },
          {
            id: "p60",
            values: { pinnanurk: 60 },
            answer: 30,
            traps: [
              {
                answer: 60,
                misconception: "nurk-pinna-suhtes",
                feedback:
                  "See on nurk pinna suhtes. Nurki mõõdetakse pinna ristsirgest ja ristsirge ning pinna vahele jääb 90°.",
              },
            ],
          },
          {
            id: "p15",
            values: { pinnanurk: 15 },
            answer: 75,
            traps: [
              {
                answer: 15,
                misconception: "nurk-pinna-suhtes",
                feedback:
                  "See on nurk pinna suhtes. Nurki mõõdetakse pinna ristsirgest ja ristsirge ning pinna vahele jääb 90°.",
              },
            ],
          },
        ],
      },
      {
        kind: "choice",
        id: "practice-3",
        prompt:
          "Periskoobis on kaks peeglit, mõlemad toru suhtes 45° nurga all. Miks väljub kiir samas suunas, kuhu ta sisenes?",
        hints: ["Mõtle, mitu korda kiir pöördub ja kummale poole kumbki pööre käib."],
        // Ilma pildita ei tea 8. klassi õpilane, mis asi periskoop üldse on, ja
        // küsimus mõõdab siis sõnavara, mitte peegeldumise mõistmist
        // (katsetus 2026-08-04). Skeem näitab ehitust, mitte vastust.
        figure: "periskoop",
        options: [
          {
            // Vastus peab ütlema, miks suund jääb SAMAKS – „paralleelne" üksi ei
            // ütle seda: kaks samasuunalist 90° pööret annaksid vastassuuna
            // (CodeRabbiti ülevaatuse leid 2026-08-03).
            id: "kaks-poordet",
            text: "Esimene peegel pöörab kiirt 90° ühele poole ja teine 90° vastaspoole – kokku jääb suund samaks, kiir on ainult kõrvale nihkunud",
            correct: true,
          },
          {
            id: "peegel-ei-poora",
            text: "Peegel ei muuda kiire suunda, ta ainult toob valguse edasi",
            correct: false,
            misconception: "peegel-ei-poora-kiirt",
          },
          {
            id: "klaas",
            text: "Valgus liigub peeglite vahel klaasis ja klaas hoiab suunda",
            correct: false,
            misconception: "kiir-liigub-klaasis",
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
        prompt: "Peegeldumisnurka mõõdetakse …",
        options: [
          {
            id: "pind",
            text: "peegli pinnast",
            correct: false,
            misconception: "nurk-pinna-suhtes",
          },
          { id: "normaal", text: "pinna ristsirgest", correct: true },
          {
            id: "kiir",
            text: "langemiskiirest",
            correct: false,
            misconception: "nurk-kiirte-vahel",
          },
        ],
      },
      {
        kind: "numeric",
        id: "exit-2",
        prompt:
          "Langemisnurk on {nurk}° pinna ristsirge suhtes. Kui suur on peegeldumisnurk?",
        unit: "°",
        tolerance: { mode: "absolute", value: 0.5 },
        // Teised arvud kui practice-1-l: väljumispilet küsib sama oskust, aga
        // ei tohi olla sama ülesanne, mille õpilane just lahendas.
        variants: [
          { id: "n20", values: { nurk: 20 }, answer: 20 },
          { id: "n38", values: { nurk: 38 }, answer: 38 },
          { id: "n50", values: { nurk: 50 }, answer: 50 },
          { id: "n62", values: { nurk: 62 }, answer: 62 },
        ],
      },
      {
        kind: "text",
        id: "exit-3",
        prompt: "Ütle ühe lausega, mida sa täna õppisid ja mis jäi segaseks.",
        // Lühem nõue kui explain-sammul: üks lause, mitte selgitus. Liiga
        // pikk nõue väljumispiletis tähendab, et viimane küsimus jääb tühjaks.
        minWords: 5,
      },
    ],
  },
];

/**
 * Kordamiskaardid (docs/MOODULILEPING.md „activities.ts – kordamiskaardid",
 * sisu/MOODUL-peegeldumisseadus.md „Kordamiskaardid"). Kordamismootor
 * valmib alles etapis 3 – kuni selleni ei loe neid keegi, aga nad on juba
 * olemas, et moodulit hiljem uuesti lahti võtta ei peaks.
 */
const reviewCards: ReviewCard[] = [
  {
    id: "rc-1",
    type: "concept",
    question: "Millise joone suhtes mõõdetakse langemis- ja peegeldumisnurka?",
    answer: "Pinna ristsirge suhtes",
  },
  {
    id: "rc-2",
    type: "calc",
    question: "Langemisnurk on 35° ristsirge suhtes. Kui suur on peegeldumisnurk?",
    answer: "35°",
  },
  {
    id: "rc-3",
    type: "calc",
    question:
      "Kiir moodustab peegli pinnaga 20° nurga. Kui suur on peegeldumisnurk ristsirge suhtes?",
    answer: "70° (90° − 20°, sest nurgad mõõdetakse ristsirgest, mitte pinnast)",
  },
  {
    id: "rc-4",
    type: "explain",
    question:
      "Miks näeme matti seina igast suunast, aga peeglist ainult kindla nurga alt?",
    answer:
      "Mattpind hajutab valgust igas suunas (hajus peegeldumine); sile pind peegeldab korrapäraselt (peegelpeegeldus), seega jõuab kindel kujutis silma ainult ühest nurgast.",
  },
  {
    id: "rc-5",
    type: "transfer",
    question: "Miks saadab helkur valguse tagasi täpselt sinna, kust see tuli?",
    // Ülevaatuse leid (CodeRabbit, 2026-08-04): eelmine sõnastus võrdles
    // helkurit ekslikult periskoobiga. Periskoobi kaks PARALLEELSET 45°
    // peeglit säilitavad kiire algse suuna (ainult nihutavad kõrvale) –
    // helkuri nurkpeegel (kaks peeglit TÄISNURGA all) pöörab kiire tagasi
    // valgusallika poole. Erinev peeglipaigutus, erinev tulemus.
    answer:
      "Helkuris on nurkpeegel (kaks peeglit täisnurga all), mis peegeldab kiire alati tagasi täpselt sinna, kust see tuli – erinevalt periskoobi paralleelsetest peeglitest, mis säilitavad kiire suuna, aga nihutavad seda kõrvale.",
  },
];

export const activities = defineActivities({ steps, reviewCards });
