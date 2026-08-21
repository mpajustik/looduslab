import { defineModule } from "../../../engine/contract";

/**
 * Mooduli metaandmed (docs/MOODULILEPING.md, sisu/MOODUL-peeglikiri.md).
 *
 * **Rakendusmoodul:** uut peegeldumisfüüsikat siin ei tule. Tulemuse „kujutis on
 * peeglist sama kaugel kui ese ja päripidine" andis moodul `tasapeegli-kujutis`,
 * peegeldumisseaduse enda (α = β, ristsirge, mattpind) moodul
 * `peegeldumisseadus`. See moodul vastab küsimusele, MIS see „vasak-parem
 * pööramine" täpselt on ja miks kiirabiauto kapotile kirjutatakse sõna
 * tagurpidi – ainekava õpitulemuse P1-T2 üks tahk. Osalist katmist manifest
 * väljendada ei oska; täpsustus on kirjas jaotuskavas
 * (sisu/JAOTUS-fyysika-8.md).
 *
 * `concepts`: ainekava põhimõistete loendis (sisu/AINEKAVA-fyysika-8.md P1) ei
 * ole peeglikirja – moodul ei võta ühtki ainekava mõistet katteks omanikuna
 * endale. `manifestSchema` nõuab siiski vähemalt üht mõistet, seega on siin
 * kirjas see üks asi, mida moodul PÄRISELT seletab. Katvusraport (samm 4.0)
 * paneb ta `extraConcepts` alla ehk märkuseks, mitte katteks. Sama otsus ja sama
 * põhjendus on failides `varjutused/manifest.ts`, `helkur/manifest.ts`,
 * `kuu-faasid/manifest.ts` ja `lambivalik/manifest.ts`.
 *
 * Siia EI tohi kirjutada „tasapeegel" ega „näiline kujutis" (ainekava P1
 * põhimõisted, mis kuuluvad moodulitele `peegeldumisseadus` ja
 * `tasapeegli-kujutis`): katvusraport võrdleb mõisteid nime järgi ja siis
 * paistaks üks põhimõiste kaetuna kahest kohast.
 *
 * `practicalWork`: tühi – P1-PT1…PT4 on kõik teiste moodulite all. Peeglikirja
 * kirjutamise katse on õpetajajuhendi demonstratsioon, mitte ainekava praktiline
 * töö.
 */
export const manifest = defineModule({
  id: "physics.peeglikiri",
  slug: "peeglikiri",
  title: "Peeglikiri",
  goal: "Oskan seletada, miks peegel ei vaheta vasakut ja paremat ära – ja miks peeglikiri sellest hoolimata tagurpidi kirjutatakse",
  subject: "physics",
  outcomes: ["P1-T2"],
  concepts: ["peeglikiri"],
  practicalWork: [],
  minutes: { demo: 5, lesson: 15, homework: 12 },
  // Reeglid: docs/MOODULILEPING.md „Versioonimine".
  version: "1.0.0",
  status: "active",
});
