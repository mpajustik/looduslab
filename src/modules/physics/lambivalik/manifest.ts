import { defineModule } from "../../../engine/contract";

/**
 * Mooduli metaandmed (docs/MOODULILEPING.md, sisu/MOODUL-lambivalik.md).
 *
 * **Rakendusmoodul:** uut liigitust siin ei tule. Mõlemad teljed (soojuslik /
 * külm, punkt- / laiendatud allikas) andis moodul `valgusallikad` ja spektri
 * moodul `liitvalgus-ja-spekter`. See moodul vastab küsimusele, MIDA nende
 * liigitustega poes peale hakata – ainekava metoodiline rõhk „lambivalik koos
 * põhjendusega" õpitulemuse P1-T1 all. Osalist katmist manifest väljendada ei
 * oska; täpsustus on kirjas jaotuskavas (sisu/JAOTUS-fyysika-8.md).
 *
 * `concepts`: ainekava põhimõistete loendis (sisu/AINEKAVA-fyysika-8.md P1) ei
 * ole valgusvoogu, valgusviljakust ega värvustemperatuuri – moodul ei võta ühtki
 * ainekava mõistet katteks omanikuna endale. `manifestSchema` nõuab siiski
 * vähemalt üht mõistet, seega on siin kirjas kolm asja, mida moodul PÄRISELT
 * seletab. Katvusraport (samm 4.0) paneb need `extraConcepts` alla ehk
 * märkuseks, mitte katteks. Sama otsus ja sama põhjendus on failides
 * `varjutused/manifest.ts`, `helkur/manifest.ts` ja `kuu-faasid/manifest.ts`.
 *
 * Siia EI tohi kirjutada „punktvalgusallikas" (ainekava P1 põhimõiste, kuulub
 * moodulile `valgusallikad`) ega „valguse spekter" (kuulub moodulile
 * `liitvalgus-ja-spekter`): katvusraport võrdleb mõisteid nime järgi ja siis
 * paistaks üks põhimõiste kaetuna kahest kohast.
 *
 * `practicalWork`: tühi – P1-PT1…PT4 on kõik teiste moodulite all. Kodulampide
 * võrdlus on teacher.ts kodutöö (K), ainekava õpilase tegevus, mitte ainekava
 * praktiline töö.
 */
export const manifest = defineModule({
  id: "physics.lambivalik",
  slug: "lambivalik",
  title: "Lambivalik",
  goal: "Oskan lambipakendi arvude järgi valida ruumi jaoks sobiva lambi ja oma valikut põhjendada",
  subject: "physics",
  outcomes: ["P1-T1"],
  concepts: ["valgusvoog", "valgusviljakus", "värvustemperatuur"],
  practicalWork: [],
  minutes: { demo: 5, lesson: 15, homework: 12 },
  // Reeglid: docs/MOODULILEPING.md „Versioonimine".
  //
  // 1.0.1: kolmele küsimusele lisati vihje, mis seni puudus (practice-3,
  // practice-4, exit-1) – sõnastus, mitte õige vastus, seega patch.
  // 1.0.2: theory-1 joonisele lisati pakendisilt (lm ja W selgitus) – visuaal,
  // mitte sisumuutus, seega patch (docs/MOODULILEPING.md).
  version: "1.0.2",
  status: "active",
});
