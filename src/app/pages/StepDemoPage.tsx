import type { Step } from "../../engine/contract";
import { StepShell } from "../../ui/StepShell";

/**
 * Arendusdemo (/m/test) – ainult raami katsumiseks.
 *
 * See EI ole päris moodul: ta ei ole registris ega kursusefailis ja
 * marsruut on App.tsx-is `import.meta.env.DEV` taga, seega toodangu buildi
 * ta ei jõua. Päris moodul tuleb sammus 1.13.
 */
const DEMO_STEPS: Step[] = [
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
      "Siledalt pinnalt (peegel, vaikne veepind) peegelduvad kõrvuti tulnud kiired korrapäraselt: nad jäävad ka pärast peegeldumist kõrvuti. Kare pind (paber, sein) saadab nad laiali eri suundadesse – seepärast näed peeglist oma nägu, seinast mitte.",
    ],
  },
  {
    type: "theory",
    id: "theory-3",
    title: "Normaal – joon, mille suhtes nurki mõõdetakse",
    body: [
      "Nurki ei mõõdeta mitte peegli pinna, vaid pinnaga risti oleva joone suhtes. Seda risti joont nimetatakse normaaliks.",
      "Sellest ühest kokkuleppest sõltub kogu peegeldumisseadus. Pinna suhtes mõõtes saad hoopis teise arvu: see täiendab normaalist mõõdetud nurga 90 kraadini.",
    ],
  },
];

export default function StepDemoPage() {
  return <StepShell moduleTitle="Näidistund (arendus)" steps={DEMO_STEPS} />;
}
