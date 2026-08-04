import { defineActivities } from "../../../engine/contract";
import type { Step } from "../../../engine/contract";

/**
 * Sammud (docs/MOODULILEPING.md, sisu/MOODUL-vedeliku-rohk.md).
 *
 * Samm 1.18 lisab hook/precheck/predict. collect/explain (1.19) ja
 * practice/exit (1.20) tulevad hilisemates sessioonides
 * (plaan/ETAPP-1-moodulid.md „Moodul 2"). Kasutaja otsustas 1.18 juures, et
 * hook/predict jäävad esialgu jooniseta – peegeldumisseadus moodul lisas
 * joonised (figures.tsx) samuti eraldi sessioonides, mitte kohe sammuga
 * koos. `reviewCards` jääb lahtiseks 1.21-ni (teacher.ts kõrval) – enne
 * seda ei impordi seda faili keegi (moodul ei ole veel `registry.ts`-is),
 * seega tühi loend praegu ei katkesta midagi.
 */
const steps: Step[] = [
  {
    type: "hook",
    id: "hook-1",
    title: "Miks on tamm alt paksem kui üleval?",
    body: [
      "Vaata suurt veetammi: selle müür on põhja juures palju paksem kui ülal veepinna lähedal. Miks ei ehitata tammi kogu ulatuses ühesuguse paksusega?",
      "Sama küsimus teistmoodi: kui sukeldud basseinis sügavamale, hakkavad kõrvad valutama ja tunned end „lukus“. Pinnal seistes seda ei juhtu.",
      "Täna õpid arvutama, kui suur on rõhk vee all – ja miks see sügavusega kasvab.",
    ],
  },
  {
    type: "precheck",
    id: "precheck-1",
    title: "Kontrolli, kas jäi meelde",
    questions: [
      {
        kind: "choice",
        id: "precheck-1",
        prompt: "Rõhk on defineeritud kui…",
        hints: ["Rõhk näitab, kui palju jõudu mõjub igale pindala ühikule."],
        options: [
          { id: "korda", text: "jõud korda pindala", correct: false },
          { id: "jagatud", text: "jõud jagatud pindalaga", correct: true },
          {
            id: "tihedus",
            text: "mass jagatud ruumalaga",
            correct: false,
            // See on tiheduse, mitte rõhu valem – väärarusaam, et mõisted
            // segunevad, ei ole moodulit läbivate märkide (Väärarusaamad-tabel)
            // hulgas, seega omaette silt.
            misconception: "rohk-tihedus-segi",
          },
        ],
      },
      {
        kind: "choice",
        id: "precheck-2",
        prompt: "Vee tihedus on ligikaudu…",
        hints: ["1 liiter vett kaalub ligikaudu 1 kg."],
        options: [
          { id: "sada", text: "100 kg/m³", correct: false, misconception: "vee-tihedus-vale" },
          { id: "tuhat", text: "1000 kg/m³", correct: true },
          {
            id: "kumnetuhat",
            text: "10 000 kg/m³",
            correct: false,
            misconception: "vee-tihedus-vale",
          },
        ],
      },
      {
        kind: "choice",
        id: "precheck-3",
        prompt: "Ühik paskal (Pa) tähendab…",
        hints: ["Pa on rõhu ühik: jõud pindalaühiku kohta."],
        options: [
          { id: "njm2", text: "1 N/m²", correct: true },
          {
            id: "kgm3",
            text: "1 kg/m³",
            correct: false,
            misconception: "paskal-tihedus-segi",
          },
          {
            id: "nm",
            text: "1 N·m",
            correct: false,
            misconception: "paskal-toojoud-segi",
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
      "Kujuta ette kolme erineva kujuga anumat: kitsas, lai ja lehtrikujuline (ülevalt laiem). Kõigis kolmes on vesi TÄPSELT sama kõrguseni ja rõhku mõõdetakse anuma põhjas.",
    ],
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt: "Millises anumas on rõhk põhjas kõige suurem?",
        options: [
          {
            id: "kitsas",
            text: "Kitsas anumas",
            correct: false,
            misconception: "kuju-mojutab-rohku",
          },
          {
            id: "lai",
            text: "Laias anumas",
            correct: false,
            misconception: "kuju-mojutab-rohku",
          },
          {
            id: "lehter",
            text: "Lehtrikujulises anumas",
            correct: false,
            misconception: "kuju-mojutab-rohku",
          },
          { id: "vordne", text: "Kõigis anumates on rõhk võrdne", correct: true },
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
      "Liiguta rõhuandurit ja vaheta vedelikku. Jälgi, kuidas sügavus ja vedelik rõhku mõjutavad.",
    ],
    questions: [
      {
        // Ülesanne 1, esimene pool (sisu/MOODUL-vedeliku-rohk.md „explore").
        kind: "numeric",
        id: "explore-1",
        prompt: "Vii andur vees 0,5 m sügavusele. Mis on rõhk?",
        hints: ["p = ρ · g · h. Vee tihedus on 1000 kg/m³."],
        unit: "kPa",
        // Lugemistolerants: näidik kuvab kPa ühe komakohaga, sim ise on ideaalne.
        tolerance: { mode: "absolute", value: 0.1 },
        answer: 4.9,
      },
      {
        // Ülesanne 1, teine pool – samas vedelikus, kahekordne sügavus.
        // Anuma kuju lisavaade avaneb pärast SEDA küsimust (vt allpool
        // `simulation.unlocks`), sest see on ülesanne 1 lõpp.
        kind: "numeric",
        id: "explore-2",
        prompt: "Nüüd vii andur 1,0 m sügavusele. Mis on rõhk nüüd?",
        hints: ["p = ρ · g · h. Vee tihedus on 1000 kg/m³."],
        unit: "kPa",
        tolerance: { mode: "absolute", value: 0.1 },
        answer: 9.8,
      },
      {
        // Ülesanne 2: vedeliku vahetus samal sügavusel (spets „explore").
        kind: "choice",
        id: "explore-3",
        prompt:
          "Vaheta vesi õli vastu (sügavus jääb samaks). Kas rõhk kasvas või kahanes?",
        options: [
          {
            id: "kahanes",
            text: "Kahanes – õli on veest kergem",
            correct: true,
          },
          {
            id: "kasvas",
            text: "Kasvas – õli on veest raskem",
            correct: false,
            misconception: "tihedus-vale-suund",
          },
          {
            id: "samaks",
            text: "Jäi samaks – vedelik ei mõjuta rõhku",
            correct: false,
            misconception: "rohk-ei-solju-tihedusest",
          },
        ],
      },
      {
        // Ülesanne 3: sügavus, kus õlis on sama rõhk mis vees 0,9 m juures
        // (spets „explore" ülesanne 3; vastuse tuletab model.ts
        // depthFromPressure, vt samm 1.15 otsused).
        kind: "numeric",
        id: "explore-4",
        prompt:
          "Vees on 0,9 m sügavusel teatud rõhk. Leia sügavus, kus ÕLIS on sama rõhk.",
        hints: [
          "Arvuta kõigepealt rõhk vees 0,9 m sügavusel.",
          "Sama rõhu juures on õli sügavam, sest õli on kergem vedelik.",
        ],
        unit: "m",
        tolerance: { mode: "absolute", value: 0.05 },
        answer: 1.0,
      },
    ],
    // Anuma kuju lisavaade avaneb pärast ülesannet 1 (sisu/MOODUL-vedeliku-rohk.md
    // „explore" – „Lisavaade avaneb pärast ül 1"). Simulation.tsx ainus koht,
    // mis teab, mida silt „anuma-kuju" tähendab (docs/ARHITEKTUUR.md).
    simulation: {
      unlocks: [{ feature: "anuma-kuju", afterQuestion: "explore-2" }],
    },
  },
];

export const activities = defineActivities({ steps, reviewCards: [] });
