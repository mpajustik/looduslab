import { defineModule } from "../../../engine/contract";

/**
 * Mooduli metaandmed (docs/MOODULILEPING.md,
 * sisu/MOODUL-tasapeegli-kujutis.md).
 *
 * Moodul katab õpitulemusest P1-T2 ainult ÜHE osa: peegeldumisseaduse
 * tagajärje tasapeeglil (kus kujutis on, kui suur ta on, kui suurt peeglit on
 * vaja). Seadus ise (α = β, ristsirge) on moodulis `peegeldumisseadus`, mis
 * käib kursuses selle ees – seda eeldust manifestis väljendada ei saa, sest
 * järjestuse otsustab kursusefail (src/content/fyysika-8.ts, CLAUDE.md
 * reegel 11).
 *
 * `concepts`: ainekava põhimõistete loendis on `tasapeegel` ja selle katab
 * `peegeldumisseadus`. Siin on kirjas „näiline kujutis" – see ei ole ainekava
 * põhimõiste ja katvusraport teda sealt ei loe, aga `manifestSchema` nõuab
 * vähemalt üht mõistet ja see on aus vastus küsimusele, mida moodul päriselt
 * defineerib (sama lahendus mis moodulis `varjutused`).
 *
 * `practicalWork`: P1-PT4 on kaetud MÕLEMAL kujul – simulatsioon sammus 4 ja
 * päris katse teibiga õpetajajuhendis (teacher.ts `procedure`).
 */
export const manifest = defineModule({
  id: "physics.tasapeegli-kujutis",
  slug: "tasapeegli-kujutis",
  title: "Tasapeegli kujutis",
  goal: "Tean, kus ja kui suur on kujutis tasapeeglis, ja oskan välja arvutada, kui suurt peeglit on vaja",
  subject: "physics",
  outcomes: ["P1-T2"],
  concepts: ["näiline kujutis"],
  practicalWork: ["P1-PT4"],
  minutes: { demo: 6, lesson: 20, homework: 15 },
  // Reeglid: docs/MOODULILEPING.md „Versioonimine".
  version: "1.0.0",
  status: "active",
});
