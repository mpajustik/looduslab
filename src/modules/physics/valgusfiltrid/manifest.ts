import { defineModule } from "../../../engine/contract";

/**
 * Mooduli metaandmed (docs/MOODULILEPING.md, sisu/MOODUL-valgusfiltrid.md).
 *
 * Moodul katab õpitulemuse **P1-T3** KOLMANDA tahu: moodulid
 * `liitvalgus-ja-spekter` ja `esemete-varvus` vaatasid, mis tuleb esemelt
 * TAGASI, siin vaadatakse, mis läheb esemest LÄBI. Sama seaduspära teistpidi:
 * filter ei tee värvi juurde, ta ainult valib, mis edasi pääseb.
 *
 * Osalist katmist manifest väljendada ei oska – katvusraport (samm 4.0) loeb
 * õpitulemuse kaetuks. Pooliku katvuse täpsuse eest vastutab jaotuskava
 * (sisu/JAOTUS-fyysika-8.md), kus rea juures seisab „(osa: valgusfilter)".
 *
 * `concepts`: „valgusfilter" EI OLE ainekava põhimõistete loendis – ainekava
 * nimetab teda õppesisus ja praktilise töö nimes, mitte mõistete reas.
 * Katvusraport paneb ta seepärast `extraConcepts` alla ehk MÄRKUSEKS
 * (scripts/coverageRules.ts), täpselt nagu moodulis `esemete-varvus`
 * „valguse neeldumise". Skeem nõuab vähemalt üht mõistet ja vale oleks siia
 * kirjutada mõni ainekava mõiste, mida moodul ei õpeta.
 *
 * `practicalWork`: **P1-PT2** – ja see moodul katab ta MÕLEMAL kujul.
 * Simulatsioon (samm explore) on virtuaalne labor ning `teacher.ts` sisaldab
 * päris katse juhendi vahendite, käigu ja hüpoteesiga, nagu ainekava nõuab.
 */
export const manifest = defineModule({
  id: "physics.valgusfiltrid",
  slug: "valgusfiltrid",
  title: "Valgusfiltrid",
  goal: "Tean, mis juhtub valgusega filtris, ja oskan ennustada, mis jõuab kahe filtri taha",
  subject: "physics",
  outcomes: ["P1-T3"],
  concepts: ["valgusfilter"],
  practicalWork: ["P1-PT2"],
  minutes: { demo: 5, lesson: 20, homework: 15 },
  // Reeglid: docs/MOODULILEPING.md „Versioonimine".
  //
  // 1.0.1: neljale küsimusele lisati vihje, mis seni puudus (explore-2,
  // explore-4, practice-4, exit-1) – sõnastus, mitte õige vastus, seega
  // patch.
  version: "1.0.1",
  status: "active",
});
