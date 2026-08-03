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
  minutes: { demo: 10, lesson: 45, homework: 25 },
  version: "1.0.0",
  status: "active",
});
