import { defineModule } from "../../../engine/contract";

/**
 * Mooduli metaandmed (docs/MOODULILEPING.md,
 * sisu/MOODUL-vari-ja-poolvari.md).
 *
 * `id` ja `slug` on IGAVESED (CLAUDE.md reegel 11). Moodul ei tea, kus kohas
 * kursust ta asub – järjestuse määrab kursusefail (src/content/fyysika-8.ts).
 *
 * Mikromoodul: üks õpieesmärk, 6 sammu, 20 min (sisu/MALL-moodul.md).
 */
export const manifest = defineModule({
  id: "physics.vari-ja-poolvari",
  slug: "vari-ja-poolvari",
  title: "Täisvari ja poolvari",
  goal: "Tean, miks varjul on kaks osa, ja oskan välja arvutada, kui lai on täisvari",
  subject: "physics",
  // Õpitulemusest P1-T2 katab moodul OSA: ainult sirgjoonelise levimise
  // TAGAJÄRJE (varju joonis ja varju servade seaduspärasus). Levimine ise on
  // moodulis `valguse-sirgjooneline-levimine`, peegeldumisseadus moodulis
  // `peegeldumisseadus`, varju ülekanne taevakehadele tulevases moodulis
  // `varjutused-ja-kuu-faasid`. Katvusraport (samm 4.0) loeb tõe siit, seega
  // siin ei tohi lubada rohkem, kui moodul päriselt õpetab.
  outcomes: ["P1-T2"],
  concepts: ["täisvari", "poolvari"],
  // P1-PT1 on kaetud MÕLEMAL kujul, nagu ainekava nõuab: simulatsioon
  // explore-sammus (hüpotees → mõõtmine → järeldus) ja päris katse juhend
  // õpetajale (teacher.ts). Ilma päris katseta ei tohiks seda siia märkida.
  practicalWork: ["P1-PT1"],
  minutes: { demo: 7, lesson: 20, homework: 15 },
  // Reeglid: docs/MOODULILEPING.md „Versioonimine“.
  //
  // 1.0.1: viiele küsimusele lisati vihje, mis seni puudus (explore-4,
  // practice-2, practice-4, exit-1, exit-2) – sõnastus, mitte õige vastus,
  // seega patch.
  version: "1.0.1",
  status: "active",
});
