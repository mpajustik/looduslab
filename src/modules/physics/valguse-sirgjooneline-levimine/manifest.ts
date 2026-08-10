import { defineModule } from "../../../engine/contract";

/**
 * Mooduli metaandmed (docs/MOODULILEPING.md,
 * sisu/MOODUL-valguse-sirgjooneline-levimine.md).
 *
 * `id` ja `slug` on IGAVESED (CLAUDE.md reegel 11). Moodul ei tea, kus kohas
 * kursust ta asub – järjestuse määrab kursusefail (src/content/fyysika-8.ts).
 *
 * Mikromoodul: üks õpieesmärk, 6 sammu, 15 min (sisu/MALL-moodul.md).
 */
export const manifest = defineModule({
  id: "physics.valguse-sirgjooneline-levimine",
  slug: "valguse-sirgjooneline-levimine",
  title: "Valgus levib sirgjooneliselt",
  goal: "Oskan joonistada, kuidas valgus läbi augu levib, ja arvutada, kui suur kujutis tekib",
  subject: "physics",
  // Õpitulemusest P1-T2 katab moodul OSA: ainult sirgjoonelise levimise poole
  // (valgusvihk ühtlases keskkonnas, kiirte joonis läbi augu). Peegeldumise
  // seadus on moodulis `peegeldumisseadus`, varju servad moodulis
  // `vari-ja-poolvari`. Katvusraport (samm 4.0) loeb tõe siit, seega siin ei
  // tohi lubada rohkem, kui moodul päriselt õpetab.
  outcomes: ["P1-T2"],
  concepts: ["valgusvihk", "optiline keskkond"],
  // Praktilist tööd see moodul ei kata: P1-PT1 (täis- ja poolvari) on moodulis
  // `vari-ja-poolvari`. Nõelaugukaamera meisterdamine on õpetajajuhendis
  // (teacher.ts), sest ainekava seda praktilise tööna ei nõua.
  practicalWork: [],
  minutes: { demo: 6, lesson: 15, homework: 12 },
  // Reeglid: docs/MOODULILEPING.md „Versioonimine".
  version: "1.0.0",
  status: "active",
});
