import { defineModule } from "../../../engine/contract";

/**
 * Mooduli metaandmed (docs/MOODULILEPING.md, sisu/MOODUL-kuu-faasid.md).
 *
 * **Mikromoodul:** katab õpitulemusest P1-T2 ainult ÜHE osa – õppesisu real
 * „vari ja varjutused; Kuu faasid" on Kuu faasid ainuke asi, mis EI ole vari.
 * Vari ise on kaetud moodulites `vari-ja-poolvari` ja `varjutused`; siin on
 * faas ehk vaatenurk valgustatud poolkerale. Täpsustus on kirjas jaotuskavas
 * (sisu/JAOTUS-fyysika-8.md), manifest osalist katmist väljendada ei oska.
 *
 * `concepts`: ainekava põhimõistete loendis (sisu/AINEKAVA-fyysika-8.md P1)
 * ei ole „kuu faasi" ega „noorkuud"/„täiskuud" – moodul ei võta ühtki mõistet
 * ainekava katteks omanikuna endale. `manifestSchema` nõuab siiski vähemalt
 * üht mõistet, seega on siin kirjas kaks nähtust, mida moodul PÄRISELT
 * seletab. Katvusraport (samm 4.0) paneb need `extraConcepts` alla ehk
 * märkuseks, mitte katteks. Sama otsus ja sama põhjendus on failides
 * `varjutused/manifest.ts` ja `helkur/manifest.ts`.
 *
 * Siia EI tohi kirjutada „täisvari" ega „poolvari" (ainekava P1 põhimõisted,
 * kuuluvad moodulile `vari-ja-poolvari`): katvusraport võrdleb mõisteid nime
 * järgi ja siis paistaks üks põhimõiste kaetuna kahest kohast.
 *
 * `practicalWork`: tühi – moodulil ei ole omaette praktilist tööd
 * (sisu/MOODUL-kuu-faasid.md). Kuu vaatlemine kahe nädala jooksul on
 * teacher.ts kodutöö (K), mitte ainekava praktiline töö.
 */
export const manifest = defineModule({
  id: "physics.kuu-faasid",
  slug: "kuu-faasid",
  title: "Kuu faasid",
  goal: "Oskan selgitada, miks Kuu kuju muutub – ja miks see EI ole vari",
  subject: "physics",
  outcomes: ["P1-T2"],
  concepts: ["kuufaas", "valgustatud poolkera"],
  practicalWork: [],
  minutes: { demo: 5, lesson: 15, homework: 13 },
  // Reeglid: docs/MOODULILEPING.md „Versioonimine".
  //
  // 1.0.1: kolmele küsimusele lisati vihje, mis seni puudus (explore-3,
  // practice-4, exit-1) – sõnastus, mitte õige vastus, seega patch.
  // 1.0.2: theory-1 joonisele (kf-valgustatud-pool) lisati 27,3 vs 29,5 päeva
  // joonis (SynodicVsSiderealFigure) LitHalfFigure'i juurde – visuaali
  // muutus, patch (docs/MOODULILEPING.md).
  version: "1.0.2",
  status: "active",
});
