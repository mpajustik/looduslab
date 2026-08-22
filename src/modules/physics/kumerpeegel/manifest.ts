import { defineModule } from "../../../engine/contract";

/**
 * Mooduli metaandmed (docs/MOODULILEPING.md, sisu/MOODUL-kumerpeegel.md).
 *
 * Moodul katab õpitulemuse **P1-T2** ÜHE tahu: peegeldumisseaduse kandmise kera
 * VÄLIMISELE pinnale. Moodul `peegeldumisseadus` andis seaduse tasasel pinnal,
 * `noguspeegel` näitas kera sisemist pinda ja päris fookust – see moodul on
 * paari teine pool: sama seadus, sama kerapind, aga peegeldub väljastpoolt.
 *
 * Osalist katmist manifest väljendada ei oska – katvusraport (samm 4.0) loeb
 * õpitulemuse kaetuks. Pooliku katvuse täpsuse eest vastutab jaotuskava
 * (sisu/JAOTUS-fyysika-8.md), kus rea juures seisab „(osa: kumerpeegli kiirte
 * käik)".
 *
 * `concepts`: **kumerpeegel** on ainekava P1 põhimõistete reas ja katvusraporti
 * järgi ploki viimane katmata põhimõiste. Sõnu „kõverpeegel" ja „näiline
 * fookus" moodul kasutab ja seletab, aga ainekava põhimõistete loendis neid ei
 * ole – nemad jääksid `extraConcepts` alla ehk märkuseks ja siia kirja ei tule.
 * Mõiste **fookus** on juba mooduli `noguspeegel` all: siin teda uuesti ei
 * nõuta, vaid kasutatakse.
 *
 * `fookuskaugus` siia EI kuulu, kuigi moodul räägib näilise fookuse kaugusest:
 * `fookuskaugus` on ploki **P2** põhimõiste (läätsed) ja katvusraport võrdleb
 * mõisteid NIME järgi üle kogu ainekava. Siia kirjutatuna näitaks raport P2
 * mõistet vaikselt kaetuna, kuigi läätsi see moodul ei puuduta. Sama põhjusel
 * ei ole siin `optiline tugevus` ega `kujutis`. Sama otsus on failis
 * `noguspeegel/manifest.ts`.
 *
 * `practicalWork`: tühi – ploki P1 neli praktilist tööd (P1-PT1…PT4) on juba
 * teiste moodulite all. Õpetajajuhendis on kaks (K) klassikatset (lusika kumer
 * külg ja poe turvapeegel), aga need ei ole ainekava praktilised tööd ja neid
 * ei tohi siia kirja panna – muidu näitaks raport kaetuna tööd, mida see moodul
 * ei kata.
 */
export const manifest = defineModule({
  id: "physics.kumerpeegel",
  slug: "kumerpeegel",
  title: "Kumerpeegel",
  goal: "Tean, mis juhtub valgusega kumerpeeglil, ja oskan öelda, kus on tema näiline fookus",
  subject: "physics",
  outcomes: ["P1-T2"],
  concepts: ["kumerpeegel"],
  practicalWork: [],
  minutes: { demo: 5, lesson: 15, homework: 12 },
  // Reeglid: docs/MOODULILEPING.md „Versioonimine".
  //
  // 1.0.1: kolmele küsimusele lisati vihje, mis seni puudus (explore-3,
  // practice-4, exit-1) – sõnastus, mitte õige vastus, seega patch.
  // 1.0.2: theory-1 joonisele (kp-ristsirge) lisati terve kimbu joonis
  // (WideBeamFigure) NormalFigure'i juurde – visuaali muutus, patch
  // (docs/MOODULILEPING.md).
  version: "1.0.2",
  status: "active",
});
