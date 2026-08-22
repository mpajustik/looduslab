import { defineModule } from "../../../engine/contract";

/**
 * Mooduli metaandmed (docs/MOODULILEPING.md, sisu/MOODUL-helkur.md).
 *
 * **Uut seadust siin ei ole.** Pöörde δ = 2·θ ja tema erijuhu θ = 90° → 180°
 * andis moodul `nurkpeegel`; see moodul on RAKENDUS – ta vastab küsimusele,
 * miks see erijuht on pimedal maanteel elu ja surma küsimus ja mis on tema
 * hind. Seepärast katab ta õpitulemusest **P1-T2** ainult ühe tahu (kahe
 * tasapeegli rakenduslik pool); täpsustus on kirjas jaotuskavas
 * (sisu/JAOTUS-fyysika-8.md), manifest osalist katmist väljendada ei oska.
 *
 * `concepts`: spetsifikatsioon ütleb `–`, sest rakendusmoodulil ei ole ühtki
 * ainekava põhimõistet. `manifestSchema` nõuab siiski vähemalt üht mõistet,
 * seega on siin kaks asja, mida moodul PÄRISELT seletab ja mida ainekava
 * nimeliselt ei nimeta. Katvusraport (samm 4.0) ei loe neid ainekava katteks:
 * tundmatu mõiste läheb `extraConcepts` alla ehk märkuseks. Sama otsus ja sama
 * põhjendus on failides `varjutused/manifest.ts`,
 * `kumerpeegli-rakendused/manifest.ts`, `noguspeegli-rakendused/manifest.ts` ja
 * `nurkpeegel/manifest.ts`.
 *
 * Siia EI tohi kirjutada `tasapeegel` ega `mattpind` (ainekava P1 põhimõisted,
 * kuuluvad moodulile `peegeldumisseadus`) ega `valguskiir`: katvusraport
 * võrdleb mõisteid nime järgi ja siis paistaks üks põhimõiste kaetuna kahest
 * kohast. Kumb neist arhiveerimisel katte kaotab, ei oleks enam kellelegi näha.
 *
 * `practicalWork`: tühi – P1-PT1…PT4 on kõik juba teiste moodulite all. Pimeda
 * klassi katse taskulambiga (õpetajajuhendi (K)) on demonstratsioon, mitte
 * ainekava praktiline töö.
 */
export const manifest = defineModule({
  id: "physics.helkur",
  slug: "helkur",
  title: "Helkur",
  goal: "Oskan seletada, miks helkur saadab valguse tagasi just sinna, kust ta tuli – ja miks ta peab olema natuke ebatäpne",
  subject: "physics",
  outcomes: ["P1-T2"],
  concepts: ["helkur", "tagasipeegeldumine"],
  practicalWork: [],
  minutes: { demo: 5, lesson: 15, homework: 12 },
  // Reeglid: docs/MOODULILEPING.md „Versioonimine".
  //
  // 1.0.1: neljale küsimusele lisati vihje, mis seni puudus (practice-2,
  // practice-3, practice-4, exit-1) – sõnastus, mitte õige vastus, seega
  // patch.
  // 1.0.2: theory-1 joonisele (hl-kolm-pinda) lisati kuubinurga 3D-joonis
  // (CubeCornerFigure) ThreeSurfacesFigure'i juurde – visuaali muutus,
  // patch (docs/MOODULILEPING.md).
  version: "1.0.2",
  status: "active",
});
