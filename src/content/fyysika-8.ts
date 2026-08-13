import { defineCourse } from "./schema";

/**
 * 8. klassi füüsika kursus.
 *
 * See fail on AINUS koht, mis teab, mis järjekorras ja mis rühmades
 * moodulid õpilasele näidatakse (docs/SISUHALDUS.md). Moodul ise ei tea
 * oma kohta kursuses – teema ümbertõstmine on siin ühe rea liigutamine.
 *
 * Plokid vastavad ainekava plokkidele P1–P7
 * (sisu/AINEKAVA-fyysika-8.md). Pealkirjad on siin lühemad, sest need
 * loeb õpilane telefoniekraanilt; ainekava täispealkiri jääb ainekavva.
 *
 * Moodulite loendid täituvad samm-sammult etapis 1 – esimene on
 * "Valguse peegeldumine" (samm 1.13).
 */
export const course = defineCourse({
  id: "fyysika-8",
  title: "8. klassi füüsika",
  blocks: [
    // P1. Valgus ja valguse sirgjooneline levimine. Peegeldumine ja neeldumine
    {
      title: "Valgus ja peegeldumine",
      // Järjekord tuleb sisu/JAOTUS-fyysika-8.md P1 tabelist: valgusallikad
      // enne peegeldumisseadust – enne kui valgus millegi pealt tagasi
      // põrkab, peab olema selge, kust ta üldse tuleb. Sirgjooneline levimine
      // on nende vahel: kust valgus tuleb → kuidas ta liigub → mis juhtub, kui
      // ta millegi pealt tagasi põrkab.
      modules: [
        "physics.valgusallikad",
        "physics.valguse-sirgjooneline-levimine",
        "physics.vari-ja-poolvari",
        "physics.varjutused",
        // Liitvalgus ja spekter on valgusallikate TEINE pool (P1-T1: liigitus
        // spektraalse koostise järgi) ja eeldus moodulile `esemete-varvus`.
        // Peegeldumist ta ei vaja, seega on ta jaotuskava järjekorras enne
        // peegeldumisseadust (sisu/JAOTUS-fyysika-8.md P1 tabel).
        "physics.liitvalgus-ja-spekter",
        // Esemete värvus EELDAB liitvalgust ja spektrit („valges valguses on
        // kõik värvid koos") ja tuleb seepärast kohe tema järel. Peegeldumise
        // SEADUST (α = β) ta ei vaja: siin on kõik pinnad matid ja küsimus on
        // „mis tuleb tagasi", mitte „mis nurga all".
        "physics.esemete-varvus",
        // Valgusfiltrid on P1-T3 KOLMAS tahk: liitvalgus ütles, millest valgus
        // koosneb, esemete värvus vaatas, mis tuleb esemelt TAGASI – siin
        // vaadatakse, mis läheb esemest LÄBI. Ta EELDAB mõlemat eelmist
        // (sisu/JAOTUS-fyysika-8.md P1 tabel), peegeldumise seadust aga mitte.
        "physics.valgusfiltrid",
        "physics.peegeldumisseadus",
        // Tasapeegli kujutis EELDAB peegeldumisseadust (α = β): kogu moodul on
        // selle seaduse tagajärg tasapeeglil, seega tuleb ta kohe tema järel.
        "physics.tasapeegli-kujutis",
        // Nõguspeegel on peegeldumisseaduse KOLMAS aste: seadus ise (tasane
        // pind) → tema tagajärg tasapeeglil → sama seadus kõveral pinnal, kus
        // ristsirge tuleb kera keskpunktist. Ta EELDAB peegeldumisseadust,
        // seega ei saa ta tulla enne teda. Jaotuskava järjekorras (P1 tabel) on
        // tema ees veel `nurkpeegel` – teda pole ehitatud ja nõguspeegel teda
        // ei vaja, seega tuleb ta siia, kui valmis saab.
        "physics.noguspeegel",
        // Kumerpeegel on sama kerapinna TEINE pool: nõguspeegel näitas kera
        // sisemist pinda ja päris fookust, siin peegeldub valgus väljastpoolt
        // ja fookus on näiline. Jaotuskava tabelis on ta nõguspeegli ees, aga
        // moodul ISE eeldab teda: teooria, sammud ja kordamiskaardid võrdlevad
        // kogu aeg nõguspeegliga („eelmine moodul"). Seepärast käib ta tema
        // järel – kursusefail otsustab järjekorra, mitte tabeli rea number
        // (docs/SISUHALDUS.md).
        "physics.kumerpeegel",
      ],
    },
    // P2. Valguse murdumine
    { title: "Valguse murdumine", modules: [] },
    // P3. Liikumine ja jõud
    { title: "Liikumine ja jõud", modules: [] },
    // P4. Jõud looduses
    { title: "Jõud looduses", modules: [] },
    // P5. Rõhumisjõud ja rõhk. Rõhk ja üleslükkejõud vedelikes ja gaasides
    { title: "Rõhk ja üleslükkejõud", modules: ["physics.vedeliku-rohk"] },
    // P6. Mehaaniline töö, energia ja võimsus
    { title: "Töö, energia ja võimsus", modules: [] },
    // P7. Võnkumine ja laine
    { title: "Võnkumine ja laine", modules: [] },
  ],
});
