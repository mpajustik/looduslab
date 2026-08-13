import { defineModule } from "../../../engine/contract";

/**
 * Mooduli metaandmed (docs/MOODULILEPING.md,
 * sisu/MOODUL-noguspeegli-rakendused.md).
 *
 * **Rakendusmoodul:** uut seadust ega uut joonist siin ei tule. Kiirte käigu ja
 * fookuse andis moodul `noguspeegel`; see moodul kannab sama üle kolme päris
 * seadmesse (taskulamp, peegelteleskoop, päikeseahi) ja vastab küsimusele, MIKS
 * neis on nõgus peegel ja mis on selle hind. Seepärast katab ta õpitulemusest
 * **P1-T2** ainult ülekande-tahu – täpsus on kirjas jaotuskavas
 * (sisu/JAOTUS-fyysika-8.md), manifest osalist katmist väljendada ei oska.
 *
 * `concepts`: spetsifikatsioon ütleb `–`, sest ainekava P1 põhimõistete loendis
 * ei ole „paralleelset valgusvihku" ega „valguse koondamist" ning
 * **nõguspeegel** ja **fookus** kuuluvad moodulile `noguspeegel`,
 * **valgusvihk** moodulile `valguse-sirgjooneline-levimine`. `manifestSchema`
 * nõuab siiski vähemalt ühte mõistet, seega on siin kaks asja, mida moodul
 * PÄRISELT seletab. Katvusraport (samm 4.0) ei loe neid ainekava katteks:
 * tundmatu mõiste läheb `extraConcepts` alla ehk märkuseks. Sama otsus ja sama
 * põhjendus on failides `varjutused/manifest.ts` ja
 * `kumerpeegli-rakendused/manifest.ts`.
 *
 * Siia EI tohi kirjutada `valgusvihk` (ainekava P1 põhimõiste) ega `fookus`:
 * katvusraport võrdleb mõisteid nime järgi ja siis paistaks üks põhimõiste
 * kaetuna kahest kohast. Kumb neist arhiveerimisel katte kaotab, ei oleks enam
 * kellelegi näha. „Paralleelne valgusvihk" on teine nimi ja läheb õigesti
 * märkuseks.
 *
 * `practicalWork`: tühi – P1-PT1…PT4 on kõik juba teiste moodulite all.
 * Õpetajajuhendi kaks (K) klassikatset (taskulambi peegeldi lahtivõtmine,
 * päikese koondamine paberile) on demonstratsioonid, mitte ainekava
 * praktilised tööd.
 */
export const manifest = defineModule({
  id: "physics.noguspeegli-rakendused",
  slug: "noguspeegli-rakendused",
  title: "Nõguspeegel meie ümber",
  goal: "Oskan seletada, miks taskulambis, teleskoobis ja päikeseahjus on nõgus peegel – ja miks kiir ikkagi laiali läheb",
  subject: "physics",
  outcomes: ["P1-T2"],
  concepts: ["paralleelne valgusvihk", "valguse koondamine"],
  practicalWork: [],
  minutes: { demo: 5, lesson: 15, homework: 12 },
  // Reeglid: docs/MOODULILEPING.md „Versioonimine".
  version: "1.0.0",
  status: "active",
});
