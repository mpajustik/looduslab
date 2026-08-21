import { defineModule } from "../../../engine/contract";

/**
 * Mooduli metaandmed (docs/MOODULILEPING.md,
 * sisu/MOODUL-liitvalgus-ja-spekter.md).
 *
 * Moodul katab MÕLEMAST õpitulemusest ainult ühe poole:
 *
 * - **P1-T1** – „liigitab valgusallikaid suuruse ja spektraalse koostise
 *   järgi". Suuruse järgi liigitamise tegi ära moodul `valgusallikad`; siin on
 *   liigitus liht- ja liitvalguse järgi.
 * - **P1-T3** – „seostab peegeldunud valguse spektrit esemete värvusega". Siin
 *   on ainult EELDUS (mis on spekter); peegeldumise ja neeldumise pool jääb
 *   moodulile `esemete-varvus`.
 *
 * Osalist katmist manifest väljendada ei oska – katvusraport (samm 4.0) loeb
 * õpitulemuse kaetuks. See on teadlik valik: raport näitab, mis on PUUTUMATA,
 * ja pooliku katvuse täpsuse eest vastutab jaotuskava
 * (sisu/JAOTUS-fyysika-8.md), kus mõlema rea juures seisab „(osa: …)".
 *
 * `concepts`: kolm sõnastust on TÄPSELT ainekava põhimõistete loendist
 * (sisu/AINEKAVA-fyysika-8.md plokk P1) – katvusraport võrdleb neid
 * sõnasõnalt, seega „lihtvalgus ja liitvalgus" jääks arvestamata.
 *
 * `practicalWork`: tühi. Ploki praktiline töö P1-PT2 („värvilise valguse
 * uurimine valgusfiltritega") on mooduli `valgusfiltrid` oma – spektroskoobi
 * simulatsioon ei ole see töö ja seda siia kirjutada oleks katvusraporti
 * petmine.
 */
export const manifest = defineModule({
  id: "physics.liitvalgus-ja-spekter",
  slug: "liitvalgus-ja-spekter",
  title: "Liitvalgus ja spekter",
  goal: "Tean, et valge valgus koosneb paljudest värvidest, ja oskan spektri järgi öelda, kas valgus on liht- või liitvalgus",
  subject: "physics",
  outcomes: ["P1-T1", "P1-T3"],
  concepts: ["valge valgus", "liht- ja liitvalgus", "valguse spekter"],
  practicalWork: [],
  minutes: { demo: 5, lesson: 18, homework: 14 },
  // Reeglid: docs/MOODULILEPING.md „Versioonimine".
  //
  // 1.0.1: neljale küsimusele lisati vihje, mis seni puudus (explore-3,
  // explore-4, practice-4, exit-1) – sõnastus, mitte õige vastus, seega
  // patch.
  version: "1.0.1",
  status: "active",
});
