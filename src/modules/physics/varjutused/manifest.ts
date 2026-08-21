import { defineModule } from "../../../engine/contract";

/**
 * Mooduli metaandmed (docs/MOODULILEPING.md,
 * sisu/MOODUL-varjutused.md).
 *
 * **Rakendusmoodul:** ta ei õpeta ühtki uut valemit ega ainekava
 * põhimõistet – kogu füüsika on mooduli `vari-ja-poolvari` ülekanne
 * kosmilistesse mõõtudesse. Spetsifikatsioon ütleb `concepts: –`, sest
 * ainekavas ei ole „päikesevarjutust" ega „kuuvarjutust" põhimõistete
 * loendis. `manifestSchema` nõuab siiski vähemalt ühte mõistet (kõik
 * senised moodulid täidavad seda), seega on siin kirjas kaks nähtust, mida
 * moodul PÄRISELT käsitleb – need lihtsalt ei ole ainekava enda
 * põhimõisted ja katvusraport ei loe neid sealt.
 *
 * `id` ja `slug` on IGAVESED (CLAUDE.md reegel 11). Moodul ei tea, kus
 * kohas kursust ta asub – järjestuse määrab kursusefail
 * (src/content/fyysika-8.ts). Rakenduses eeldab moodul, et
 * `vari-ja-poolvari` on juba läbitud, aga seda eeldust ei saa siin
 * väljendada – see on kursusefaili järjestuse otsus.
 */
export const manifest = defineModule({
  id: "physics.varjutused",
  slug: "varjutused",
  title: "Päikese- ja kuuvarjutus",
  goal: "Oskan joonisega selgitada, kuidas tekivad Päikese- ja kuuvarjutus, ja miks üks neist on haruldane ja teine tavaline",
  subject: "physics",
  // P1-T2 osaliselt: ainult varju ÜLEKANNE taevakehadele (kaardid, videod).
  // Varjugeomeetria ise on moodulis `vari-ja-poolvari`, Kuu faasid moodulis
  // `kuu-faasid` (varjutus EI OLE faas, vt sisu/MOODUL-varjutused.md
  // „Piirid").
  outcomes: ["P1-T2"],
  concepts: ["päikesevarjutus", "kuuvarjutus"],
  // P1-PT1 on kaetud juba moodulis `vari-ja-poolvari` – siin ei ole omaette
  // praktilist tööd.
  practicalWork: [],
  minutes: { demo: 6, lesson: 18, homework: 15 },
  // Reeglid: docs/MOODULILEPING.md „Versioonimine".
  //
  // 1.0.1: kolmele küsimusele lisati vihje, mis seni puudus (explore-4,
  // practice-4, exit-1) – sõnastus, mitte õige vastus, seega patch.
  version: "1.0.1",
  status: "active",
});
