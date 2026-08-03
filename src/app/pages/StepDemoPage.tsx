import { useSearchParams } from "react-router";
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
    title: "Pinna ristsirge – joon, mille suhtes nurki mõõdetakse",
    body: [
      "Nurki ei mõõdeta mitte peegli pinna, vaid pinnaga risti oleva joone suhtes. Seda risti joont nimetatakse pinna ristsirgeks.",
      "Sellest ühest kokkuleppest sõltub kogu peegeldumisseadus. Pinna suhtes mõõtes saad hoopis teise arvu: see täiendab ristsirgest mõõdetud nurga 90 kraadini.",
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
        // Arvvastus koos lõksuga: 35° on nurk PINNA suhtes, õige vastus on
        // 55° ristsirge suhtes (sisu/MOODUL-peegeldumisseadus.md, practice 3).
        kind: "numeric",
        id: "precheck-2",
        prompt:
          "Kiir langeb tasapeeglile nii, et moodustab peegli PINNAGA 35° nurga. Kui suur on peegeldumisnurk pinna ristsirge suhtes?",
        hints: [
          "Kummast joonest mõõdetakse peegeldumisseaduse nurki?",
          "Ristsirge ja pinna vahel on 90°.",
        ],
        answer: 55,
        unit: "°",
        // Tolerants peab olema positiivne (contractSchema) – 0,5° on siin
        // sisuliselt „täpne vastus", vt plaani lahtist küsimust sammu 1.4 all.
        tolerance: { mode: "absolute", value: 0.5 },
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
        kind: "choice",
        id: "precheck-3",
        prompt: "Millised väited peegeldumise kohta on õiged? Õigeid vastuseid on mitu.",
        multiple: true,
        options: [
          { id: "sile", text: "Siledalt pinnalt peegelduvad kõrvuti kiired korrapäraselt", correct: true },
          { id: "matt", text: "Kare pind saadab kiired laiali eri suundadesse", correct: true },
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
];

export default function StepDemoPage() {
  // `/m/test?eelvaade=1` – nii saab preview-režiimi (õpetaja „Vaata
  // õpilasena", samm 2.14) käega katsuda juba enne, kui see marsruut olemas
  // on: läbi tehtud moodul ei tohi jätta localStorage'i ühtegi jälge.
  const [params] = useSearchParams();
  const mode = params.has("eelvaade") ? "preview" : "persist";

  return (
    <StepShell
      moduleId="demo"
      // Demol ei ole manifesti – versioon on siin ainult selleks, et vastused
      // saaksid oma versioonisildi (docs/ANDMEMUDEL.md).
      moduleVersion="0.0.0"
      moduleTitle="Näidistund (arendus)"
      steps={DEMO_STEPS}
      mode={mode}
    />
  );
}
