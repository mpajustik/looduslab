import { defineModule } from "../../../engine/contract";

/**
 * Mooduli metaandmed (docs/MOODULILEPING.md, sisu/MOODUL-esemete-varvus.md).
 *
 * Moodul katab õpitulemusest **P1-T3** („seostab peegeldunud valguse spektrit
 * esemete värvusega") selle SÜDAME: ese ei tee värvi ise, vaid peegeldab tagasi
 * osa temale langevast valgusest ja neelab ülejäänu. Eeldus (mis on spekter,
 * mis on liitvalgus) tuli moodulist `liitvalgus-ja-spekter`, valgusfiltri pool
 * jääb moodulile `valgusfiltrid`.
 *
 * Osalist katmist manifest väljendada ei oska – katvusraport (samm 4.0) loeb
 * õpitulemuse kaetuks. Pooliku katvuse täpsuse eest vastutab jaotuskava
 * (sisu/JAOTUS-fyysika-8.md), kus rea juures seisab „(osa: …)".
 *
 * `concepts`: „valguse neeldumine" EI OLE ainekava põhimõistete loendis –
 * ainekava nimetab neeldumist õppesisus, mitte mõistete reas. Katvusraport
 * paneb ta seepärast `extraConcepts` alla ehk MÄRKUSEKS, mitte kaetud mõisteks
 * (scripts/coverageRules.ts). See on teadlik: moodul õpetab neeldumist
 * päriselt ja vale oleks siia kirjutada mõni ainekava mõiste, mida ta ei õpeta.
 *
 * `practicalWork`: tühi. Ploki praktiline töö P1-PT2 („värvilise valguse
 * uurimine valgusfiltritega") on mooduli `valgusfiltrid` oma – siia kirjutatuna
 * petaks ta katvusraportit.
 */
export const manifest = defineModule({
  id: "physics.esemete-varvus",
  slug: "esemete-varvus",
  title: "Esemete värvus",
  goal: "Oskan selgitada, miks ese on mingit värvi, ja ennustada, mis värvi ta paistab teistsuguses valguses",
  subject: "physics",
  outcomes: ["P1-T3"],
  concepts: ["valguse neeldumine"],
  practicalWork: [],
  minutes: { demo: 5, lesson: 18, homework: 14 },
  // Reeglid: docs/MOODULILEPING.md „Versioonimine".
  //
  // 1.0.1: neljale küsimusele lisati vihje, mis seni puudus (explore-2,
  // explore-4, practice-4, exit-1) – sõnastus, mitte õige vastus, seega
  // patch.
  version: "1.0.1",
  status: "active",
});
