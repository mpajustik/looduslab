import { defineModule } from "../../../engine/contract";

/**
 * Mooduli metaandmed (docs/MOODULILEPING.md, sisu/MOODUL-nurkpeegel.md).
 *
 * **Uut seadust siin ei ole.** Peegeldumisseaduse andis moodul
 * `peegeldumisseadus` ühel peeglil; siin rakendatakse teda KAHEL tasasel
 * peeglil järjest. Seepärast katab moodul õpitulemusest **P1-T2** ainult ühe
 * tahu (kiirte käik kahe peegli vahel, periskoop) – täpsustus on kirjas
 * jaotuskavas (sisu/JAOTUS-fyysika-8.md), manifest osalist katmist väljendada
 * ei oska. Ainekava metoodiliste rõhkude real seisavad „nurkpeegel" ja
 * „periskoop" NIMELISELT ning õpilase tegevuste real „(D) joonestab/uurib
 * kiirte käiku periskoobis, nurkpeeglis" – see moodul on selle rea täitmine.
 *
 * `concepts`: spetsifikatsioon ütleb `–`, sest ainekava P1 põhimõistete loendis
 * ei ole „nurkpeeglit" ega „periskoopi". `manifestSchema` nõuab siiski
 * vähemalt üht mõistet, seega on siin kaks asja, mida moodul PÄRISELT seletab.
 * Katvusraport (samm 4.0) ei loe neid ainekava katteks: tundmatu mõiste läheb
 * `extraConcepts` alla ehk märkuseks. Sama otsus ja sama põhjendus on failides
 * `varjutused/manifest.ts`, `kumerpeegli-rakendused/manifest.ts` ja
 * `noguspeegli-rakendused/manifest.ts`.
 *
 * Siia EI tohi kirjutada `tasapeegel` (ainekava P1 põhimõiste, kuulub
 * moodulitele `peegeldumisseadus` ja `tasapeegli-kujutis`) ega `valguskiir`:
 * katvusraport võrdleb mõisteid nime järgi ja siis paistaks üks põhimõiste
 * kaetuna kahest kohast. Kumb neist arhiveerimisel katte kaotab, ei oleks enam
 * kellelegi näha.
 *
 * `practicalWork`: tühi – P1-PT1…PT4 on kõik juba teiste moodulite all.
 * Õpetajajuhendi kolm (K) katset (kaks taskupeeglit, kujutised nurkpeeglis,
 * papitorust periskoop) on demonstratsioonid, mitte ainekava praktilised tööd.
 */
export const manifest = defineModule({
  id: "physics.nurkpeegel",
  slug: "nurkpeegel",
  title: "Nurkpeegel",
  goal: "Oskan öelda, kui palju kiir kahe peegli vahel pöördub, ja tean, mis on 90° nurkpeegli juures erilist",
  subject: "physics",
  outcomes: ["P1-T2"],
  concepts: ["nurkpeegel", "periskoop"],
  practicalWork: [],
  minutes: { demo: 5, lesson: 15, homework: 12 },
  // Reeglid: docs/MOODULILEPING.md „Versioonimine".
  //
  // 1.0.1: kahele küsimusele lisati vihje, mis seni puudus (practice-4,
  // exit-2) – sõnastus, mitte õige vastus, seega patch.
  // 1.0.2: theory-1 joonisele lisati kaks erijuhtu (θ = 90° ja θ = 0°) –
  // visuaali täiendus, mitte õppesisu muutus, seega patch.
  version: "1.0.2",
  status: "active",
});
