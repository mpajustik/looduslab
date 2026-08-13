import { defineModule } from "../../../engine/contract";

/**
 * Mooduli metaandmed (docs/MOODULILEPING.md,
 * sisu/MOODUL-kumerpeegli-rakendused.md).
 *
 * **Rakendusmoodul:** uut seadust ega uut joonist siin ei tule. Kiirte käigu ja
 * näilise fookuse andis moodul `kumerpeegel`; see moodul kannab sama üle kolme
 * päris seadmesse (liikluspeegel, poe turvapeegel, auto külgpeegel) ja vastab
 * küsimusele, MIKS need seadmed kumerad on. Seepärast katab ta õpitulemusest
 * **P1-T2** ainult ülekande-tahu – täpsus on kirjas jaotuskavas
 * (sisu/JAOTUS-fyysika-8.md), manifest osalist katmist väljendada ei oska.
 *
 * `concepts`: spetsifikatsioon ütleb `–`, sest ainekava P1 põhimõistete loendis
 * ei ole „vaatevälja" ega „pimeala" ning **kumerpeegel** kuulub moodulile
 * `kumerpeegel`, **fookus** moodulile `noguspeegel`. `manifestSchema` nõuab
 * siiski vähemalt ühte mõistet, seega on siin kaks asja, mida moodul PÄRISELT
 * seletab. Katvusraport (samm 4.0) ei loe neid ainekava katteks: tundmatu mõiste
 * läheb `extraConcepts` alla ehk märkuseks. Sama otsus ja sama põhjendus on
 * failis `varjutused/manifest.ts`.
 *
 * Siia EI tohi kirjutada `kumerpeegel`: katvusraport võrdleb mõisteid nime järgi
 * ja siis paistaks üks ainekava põhimõiste kaetuna kahest kohast. Kumb neist
 * arhiveerimisel katte kaotab, ei oleks enam kellelegi näha.
 *
 * `practicalWork`: tühi – P1-PT1…PT4 on kõik juba teiste moodulite all.
 * Õpetajajuhendi kaks (K) klassikatset (päris turvapeegel, auto külgpeeglite
 * võrdlus) on demonstratsioonid, mitte ainekava praktilised tööd.
 */
export const manifest = defineModule({
  id: "physics.kumerpeegli-rakendused",
  slug: "kumerpeegli-rakendused",
  title: "Kumerpeegel meie ümber",
  goal: "Oskan seletada, miks mingisse kohta pandi kumer peegel ja mis on selle hinnaks",
  subject: "physics",
  outcomes: ["P1-T2"],
  concepts: ["vaateväli", "pimeala"],
  practicalWork: [],
  minutes: { demo: 5, lesson: 15, homework: 12 },
  // Reeglid: docs/MOODULILEPING.md „Versioonimine".
  version: "1.0.0",
  status: "active",
});
