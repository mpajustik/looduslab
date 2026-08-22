import { defineModule } from "../../../engine/contract";

/**
 * Mooduli metaandmed (docs/MOODULILEPING.md, sisu/MOODUL-noguspeegel.md).
 *
 * Moodul katab õpitulemuse **P1-T2** ÜHE tahu: peegeldumisseaduse kandmise
 * kõverale pinnale. Moodul `peegeldumisseadus` andis seaduse tasasel pinnal,
 * `tasapeegli-kujutis` selle tagajärje – siin muutub ainult see, kust ristsirge
 * tuleb (kerapinnal on ta raadiuse siht).
 *
 * Osalist katmist manifest väljendada ei oska – katvusraport (samm 4.0) loeb
 * õpitulemuse kaetuks. Pooliku katvuse täpsuse eest vastutab jaotuskava
 * (sisu/JAOTUS-fyysika-8.md), kus rea juures seisab „(osa: nõguspeegli kiirte
 * käik, fookus)".
 *
 * `concepts`: **nõguspeegel** ja **fookus** on mõlemad ainekava P1 põhimõistete
 * reas (sisu/AINEKAVA-fyysika-8.md rida 39), seega läheb katvusraport nende
 * võrra rohelisemaks. Sõna „kõverpeegel" moodul kasutab ja seletab, aga
 * ainekava põhimõistete loendis teda ei ole – ta jääks `extraConcepts` alla ehk
 * märkuseks ja ei tohi siia kirja tulla.
 *
 * `fookuskaugus` siia EI kuulu, kuigi moodul räägib fookuse kaugusest:
 * `fookuskaugus` on ploki **P2** põhimõiste (läätsed, rida 100) ja katvusraport
 * võrdleb mõisteid NIME järgi üle kogu ainekava. Siia kirjutatuna näitaks
 * raport P2 mõistet vaikselt kaetuna, kuigi läätsi see moodul ei puuduta. Sama
 * põhjusel ei ole siin `optiline tugevus` ega `kujutis`.
 *
 * `practicalWork`: tühi – ploki P1 neli praktilist tööd (P1-PT1…PT4) on juba
 * teiste moodulite all. Õpetajajuhendis on kaks (K) klassikatset (lusikas ja
 * taskulambi peegeldi), aga need ei ole ainekava praktilised tööd ja neid ei
 * tohi siia kirja panna – muidu näitaks raport kaetuna tööd, mida see moodul
 * ei kata.
 */
export const manifest = defineModule({
  id: "physics.noguspeegel",
  slug: "noguspeegel",
  title: "Nõguspeegel",
  goal: "Tean, kuhu nõguspeegel paralleelse valguse koondab, ja oskan öelda, kui kaugel see punkt peeglist on",
  subject: "physics",
  outcomes: ["P1-T2"],
  concepts: ["nõguspeegel", "fookus"],
  practicalWork: [],
  minutes: { demo: 5, lesson: 15, homework: 12 },
  // Reeglid: docs/MOODULILEPING.md „Versioonimine".
  //
  // 1.0.1: kolmele küsimusele lisati vihje, mis seni puudus (explore-3,
  // practice-4, exit-1) – sõnastus, mitte õige vastus, seega patch.
  // 1.0.2: theory-1 joonisele (np-ristsirge) lisati F ja C suhte joonis
  // (FocalRadiusFigure) NormalFigure'i juurde – visuaali muutus, patch
  // (docs/MOODULILEPING.md).
  version: "1.0.2",
  status: "active",
});
