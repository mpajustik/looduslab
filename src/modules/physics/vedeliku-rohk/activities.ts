import { defineActivities } from "../../../engine/contract";
import type { Step } from "../../../engine/contract";
import { LIQUID_DENSITIES, pressure, toKilopascals } from "./model";

/**
 * Mõõtetabeli kordaja: rõhk vees ühe meetri sügavusel (kPa/m).
 *
 * Arvutatud MUDELIST, mitte kirjutatud arvuna (CLAUDE.md reegel 1). Kui g või
 * vee tihedus mudelis kunagi muutub, muutub kordaja kaasa – käsitsi kirjutatud
 * 9,8 jääks vaikselt vanaks.
 */
const WATER_KPA_PER_METRE = toKilopascals(pressure(LIQUID_DENSITIES.vesi, 1));

/**
 * Sammud (docs/MOODULILEPING.md, sisu/MOODUL-vedeliku-rohk.md).
 *
 * Sammud 1.18 (hook/precheck/predict) ja 1.19 (collect/explain) on tehtud;
 * practice/exit (1.20) tuleb järgmises sessioonis
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
  {
    type: "collect",
    id: "collect-1",
    title: "Kogu neli mõõtmist",
    body: [
      "Vali vedelikuks vesi. Vii andur nelja ERINEVASSE sügavusse ja kirjuta iga kord üles nii sügavus kui ka rõhk.",
      "Ühikuid ei pea kirjutama – piisab arvudest. Graafik joonistub tabeli alla ise, iga täidetud rida lisab ühe punkti.",
    ],
    questions: [
      {
        kind: "table",
        id: "collect-1",
        prompt: "Neli mõõtmist vees",
        // `min`/`max`/`step` on SIMULATSIOONI liuguri piirid ja samm
        // (Simulation.tsx: sügavus 0–2 m, 0,1 m kaupa). Sammuta läbiks
        // kontrolli ka 0,05 m, mis on vahemikus ja teiste punktidega ühel
        // sirgel, aga mida liuguril kunagi ei olnud. Rõhu ülempiir 20 kPa on
        // veidi üle sügavaima vee lugemi (19,6 kPa) – nii mahub ümardus
        // piiridesse, aga elavhõbeda arv ei mahu. Rõhul SAMMU EI OLE: näidik
        // on arvutatud suurus, mitte liugur.
        columns: [
          { key: "depth", label: "Sügavus", unit: "m", min: 0, max: 2, step: 0.1 },
          { key: "pressure", label: "Rõhk", unit: "kPa", min: 0, max: 20 },
        ],
        rows: 4,
        // Neli ERI sügavust: ühest korratud punktist ei paista sirge välja.
        distinctColumn: "depth",
        // Liuguri samm on 0,1 m, seega kaks kõrvutist astet on kaks mõõtmist.
        // Ilma selle arvuta võrreldaks meetreid reegli kilopaskalitega.
        distinctTolerance: { mode: "absolute", value: 0.05 },
        rule: {
          kind: "proportional",
          column: "pressure",
          perColumn: "depth",
          // Kordaja tuleb MUDELIST, mitte käsitsi kirjutatud arvust: rõhk vees
          // ühe meetri sügavusel, kilopaskalites (CLAUDE.md reegel 1).
          factor: WATER_KPA_PER_METRE,
          // Lugemistolerants = näidiku täpsus (kPa ühe komakohaga), mitte
          // protsent. Spetsis pakutud ±2% kahaneb 0,1 m sügavusel 0,02 kPa
          // peale ehk ALLA ümardusvea ja lükkaks õigesti loetud punkti tagasi.
          tolerance: { mode: "absolute", value: 0.1 },
        },
        // Sirge kuju ongi järgmise küsimuse sisu, seepärast on tabeli kõrval
        // joonis. Punktid ilma jooneta – joone sõnastab õpilane ise.
        graph: { x: "depth", y: "pressure" },
      },
      {
        kind: "choice",
        id: "collect-2",
        prompt: "Vaata oma punkte. Mida ütleb nende kuju rõhu ja sügavuse seose kohta?",
        hints: [
          "Kui sügavus kahekordistub, mitu korda kasvab rõhk sinu tabelis?",
        ],
        options: [
          {
            id: "vordeline",
            text: "Rõhk on sügavusega võrdeline – kaks korda sügavamal on rõhk kaks korda suurem",
            correct: true,
          },
          {
            id: "aeglustub",
            text: "Rõhk kasvab alguses kiiresti ja sügavamal aina aeglasemalt",
            correct: false,
            misconception: "rohk-kullastub",
          },
          {
            id: "ruut",
            text: "Sügavuse kahekordistamisel kasvab rõhk neli korda",
            correct: false,
            misconception: "rohk-ruutsoltuvus",
          },
          {
            id: "sotumatu",
            text: "Rõhk ei sõltu sügavusest – punktid on ühel kõrgusel",
            correct: false,
            misconception: "rohk-ei-solju-sugavusest",
          },
        ],
      },
    ],
  },
  {
    type: "explain",
    id: "explain-1",
    title: "Selgita, miks rõhk sügavusega kasvab",
    body: [
      "Kasuta mõtet: mida sügavamal sa oled, seda rohkem vett on sinu kohal – ja kogu see vesi vajutab alla.",
      "Võrdle ka oma ennustusega anumate kohta. Kas pidid midagi ümber mõtlema?",
    ],
    // Ennustus on kõrval näha, et võrdlemiseks ei peaks samme tagasi kerima.
    recallQuestion: "predict-1",
    questions: [
      {
        kind: "text",
        id: "explain-1",
        prompt: "Selgita oma sõnadega, MIKS rõhk vedelikus sügavusega kasvab.",
        // Spetsi „vabatekst min 20 sõna" – lühem vastus jääb tavaliselt
        // valemi ümberkirjutuseks, mitte selgituseks.
        minWords: 20,
      },
    ],
  },
];

export const activities = defineActivities({ steps, reviewCards: [] });
