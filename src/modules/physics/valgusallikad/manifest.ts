import { defineModule } from "../../../engine/contract";

/**
 * Mooduli metaandmed (docs/MOODULILEPING.md, sisu/MOODUL-valgusallikad.md).
 *
 * `id` ja `slug` on IGAVESED (CLAUDE.md reegel 11). Moodul ei tea, kus kohas
 * kursust ta asub – järjestuse määrab kursusefail (src/content/fyysika-8.ts).
 *
 * See on esimene TAVAmoodul: väike (15 min, 6 sammu, üks õpieesmärk), mitte
 * pilootmoodulite täispikk juhitud tund. Suurusreegel: sisu/MALL-moodul.md.
 */
export const manifest = defineModule({
  id: "physics.valgusallikad",
  slug: "valgusallikad",
  title: "Valgusallikad",
  goal: "Oskan öelda, mis liiki valgusallikaga on tegu",
  subject: "physics",
  // Õpitulemusest P1-T1 katab moodul OSA: kaks liigitust – soojuslik/külm ja
  // punkt/laiendatud (sisu/JAOTUS-fyysika-8.md). Spektraalse koostise sisu
  // (valge valgus, spekter) on moodulis `liitvalgus-ja-spekter`, lambi
  // valimine moodulis `lambivalik`. Katvusraport (samm 4.0) loeb tõe siit,
  // seega siin ei tohi lubada rohkem, kui moodul päriselt õpetab.
  outcomes: ["P1-T1"],
  // Ainus mõiste, mille moodul ise selgeks õpetab. „Valgusallikas" ise on
  // ainekavas P1 sissejuhatav sõna, mitte eraldi loetletud põhimõiste.
  concepts: ["punktvalgusallikas"],
  // Praktilist tööd see moodul ei kata: P1-PT1 (täis- ja poolvari) on moodulis
  // `vari-ja-poolvari` – siin varju servi EI õpetata.
  practicalWork: [],
  minutes: { demo: 6, lesson: 15, homework: 12 },
  // Reeglid: docs/MOODULILEPING.md „Versioonimine".
  version: "1.0.0",
  status: "active",
});
