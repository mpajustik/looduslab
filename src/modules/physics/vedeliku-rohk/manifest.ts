import { defineModule } from "../../../engine/contract";

/**
 * Mooduli metaandmed (docs/MOODULILEPING.md, sisu/MOODUL-vedeliku-rohk.md).
 *
 * `id` ja `slug` on IGAVESED (CLAUDE.md reegel 11) – neid ei muudeta ka siis,
 * kui pealkiri või sisu muutub. Moodul ei tea, kus kohas kursust ta asub:
 * järjestuse määrab kursusefail (src/content/fyysika-8.ts, samm 1.21).
 *
 * NB: see on täispikk „juhitud tund" tüüpi pilootmoodul (45 min, 8 sammu).
 * Tavamoodul on väiksem – 5–20 min ja 3–6 sammu (sisu/MALL-moodul.md).
 */
export const manifest = defineModule({
  id: "physics.vedeliku-rohk",
  slug: "vedeliku-rohk",
  title: "Vedeliku rõhk",
  subject: "physics",
  goal: "Oskan arvutada, kui suur on rõhk vee all",
  // Mõlemast õpitulemusest katab moodul osa (sisu/JAOTUS-fyysika-8.md):
  // P5-T4 vedelikusamba rõhu, P5-T5 seose p = ρ·g·h. Õhurõhk, üleslükkejõud
  // ja p = F/S jäävad teistele moodulitele – katvusraport (etapp 4.0) näeb
  // seda ainult siis, kui siin ei ole rohkem lubatud, kui moodul õpetab.
  outcomes: ["P5-T4", "P5-T5"],
  concepts: ["rõhk", "rõhumisjõud"],
  // Ainekava praktilist tööd see moodul ei kata: P5-PT3 „üleslükkejõu
  // uurimine" on ERALDI moodul (spetsifikatsioon hoiatab eraldi, et neid kahte
  // teemat ei tohi ühte tundi panna).
  practicalWork: [],
  minutes: { demo: 10, lesson: 45, homework: 25 },
  // Reeglid: docs/MOODULILEPING.md „Versioonimine".
  version: "1.0.0",
  status: "active",
});
