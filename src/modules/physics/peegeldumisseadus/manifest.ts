import { defineModule } from "../../../engine/contract";

/**
 * Mooduli metaandmed (docs/MOODULILEPING.md, sisu/MOODUL-peegeldumisseadus.md).
 *
 * `id` ja `slug` on IGAVESED (CLAUDE.md reegel 11) – neid ei muudeta ka siis,
 * kui pealkiri või sisu muutub. Moodul ei tea, kus kohas kursust ta asub:
 * järjestuse määrab kursusefail (src/content/fyysika-8.ts).
 *
 * NB: see on täispikk „juhitud tund" tüüpi pilootmoodul (45 min, 8 sammu).
 * Tavamoodul on väiksem – 5–20 min ja 3–6 sammu (sisu/MALL-moodul.md).
 */
export const manifest = defineModule({
  id: "physics.peegeldumisseadus",
  slug: "peegeldumisseadus",
  title: "Valguse peegeldumine",
  subject: "physics",
  goal: "Oskan ennustada, kuhu valguskiir peegeldub",
  outcomes: ["P1-T2"],
  concepts: [
    "valguskiir",
    "tasapeegel",
    "mattpind",
    "langemisnurk",
    "peegeldumisnurk",
    "pinna ristsirge",
  ],
  practicalWork: ["P1-PT3"],
  // lesson: 45 min spetsi järgi (sisu/MOODUL-peegeldumisseadus.md) + 6 min
  // kolmele teooria-sammule (teacher.ts lessonPlan) – kasutaja otsustas
  // (2026-08-04) need alles jätta, mitte kärpida.
  minutes: { demo: 10, lesson: 51, homework: 25 },
  // 1.1.0: uus küsimus explore-4 (mattpind) – minor.
  // 1.1.1: teooriasammu mõistejoonis – visuaal on patch.
  // 1.1.2: sile pind vs mattpind joonis – samuti visuaal.
  // 1.1.3: Mari joonis avasammul – samuti visuaal.
  // 1.1.4: periskoobi skeem practice-3 juures – samuti visuaal.
  // 1.1.5: valikvastuste järjekord segatakse (predict-1 jääb `shuffle: false`).
  //        Küsimus, õige vastus ega variandi id ei muutu – seega patch.
  // 2.0.0: neljal arvküsimusel (precheck-2, practice-1, practice-2, exit-2) on
  //        nüüd arvuvariandid. Õige vastus sõltub loositud variandist, seega
  //        vana `is_correct` EI ole uuega võrreldav – MAJOR.
  // 2.0.1: üheksale küsimusele lisati vihje, mis seni puudus (precheck-3,
  //        explore-1..4, collect-1, practice-1, exit-1, exit-2) – sõnastus,
  //        mitte õige vastus, seega patch.
  // 2.0.2: theory-1 juurde lisati joonis „kiir = joon + nool" – visuaal on
  //        patch.
  // Reeglid: docs/MOODULILEPING.md „Versioonimine".
  version: "2.0.2",
  status: "active",
});
