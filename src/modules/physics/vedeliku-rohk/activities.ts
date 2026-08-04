import { defineActivities } from "../../../engine/contract";
import type { Step } from "../../../engine/contract";

/**
 * Sammud (docs/MOODULILEPING.md, sisu/MOODUL-vedeliku-rohk.md).
 *
 * Samm 1.17 kirjutab AINULT explore-sammu – hook/precheck/predict (1.18),
 * collect/explain (1.19) ja practice/exit (1.20) tulevad hilisemates
 * sessioonides (plaan/ETAPP-1-moodulid.md „Moodul 2"). `reviewCards` jääb
 * lahtiseks 1.21-ni (teacher.ts kõrval) – enne seda ei impordi seda faili
 * keegi (moodul ei ole veel `registry.ts`-is), seega tühi steps-loend
 * praegu ei katkesta midagi.
 */
const steps: Step[] = [
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
