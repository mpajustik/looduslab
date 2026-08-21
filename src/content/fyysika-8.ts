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
        // Lambivalik on valgusallikate rakendusmoodul ja käib oma mikromooduli
        // JÄREL, täpselt nagu `helkur`, `varjutused` ja peeglite rakendused:
        // uut liigitust siin ei tule, vaid „soojuslik / külm" ja „punkt- /
        // laiendatud allikas" kantakse üle poeriiulile. Jaotuskava P1 tabelis
        // (sisu/JAOTUS-fyysika-8.md) on ta samuti kohe `valgusallikad`-e järel.
        "physics.lambivalik",
        "physics.valguse-sirgjooneline-levimine",
        "physics.vari-ja-poolvari",
        "physics.varjutused",
        // Kuu faasid tuleb PÄRAST varjutusi (teacher.ts „whenInLesson"):
        // faasi ja varjutuse eristamine on lihtsam, kui varjutus on äsja
        // läbi võetud – siis on „Maa vari" konkreetne asi, millele osutada.
        "physics.kuu-faasid",
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
        // Nurkpeegel on peegeldumisseaduse teine rakendus: sama seadus, aga
        // KAKS tasast peeglit järjest. Ta eeldab ainult `peegeldumisseadus`t
        // (langemisnurk = peegeldumisnurk mõlemal peeglil) ja on siin
        // jaotuskava järjekorras (sisu/JAOTUS-fyysika-8.md P1 tabel: kohe
        // tasapeegli kujutise järel). Kõveraid peegleid ta ei vaja ega maini,
        // seega tuleb ta enne neid – valgus liigub siin ikka tasastel pindadel.
        "physics.nurkpeegel",
        // Helkur on nurkpeegli rakendus ja käib oma mikromooduli JÄREL, täpselt
        // nagu kumerpeegli ja nõguspeegli rakendused: uut seadust siin ei tule,
        // teooria algab meeldetuletusega („kaks peeglit täisnurga all pööravad
        // kiirt 180°") ja kannab selle üle päris asjasse. Kõveraid peegleid ta
        // ei vaja ega maini, seega tuleb ta enne neid – ja jaotuskava P1 tabelis
        // on ta samuti kohe nurkpeegli järel.
        "physics.helkur",
        // Nõguspeegel on peegeldumisseaduse KOLMAS aste: seadus ise (tasane
        // pind) → tema tagajärg tasapeeglil → sama seadus kõveral pinnal, kus
        // ristsirge tuleb kera keskpunktist. Ta EELDAB peegeldumisseadust,
        // seega ei saa ta tulla enne teda.
        "physics.noguspeegel",
        // Kumerpeegel on sama kerapinna TEINE pool: nõguspeegel näitas kera
        // sisemist pinda ja päris fookust, siin peegeldub valgus väljastpoolt
        // ja fookus on näiline. Jaotuskava tabelis on ta nõguspeegli ees, aga
        // moodul ISE eeldab teda: teooria, sammud ja kordamiskaardid võrdlevad
        // kogu aeg nõguspeegliga („eelmine moodul"). Seepärast käib ta tema
        // järel – kursusefail otsustab järjekorra, mitte tabeli rea number
        // (docs/SISUHALDUS.md).
        "physics.kumerpeegel",
        // Rakendusmoodul käib oma mikromooduli JÄREL: uut seadust ega uut
        // joonist siin ei tule, vaid kumerpeegli kiirte käik ja näiline fookus
        // kantakse üle kolme päris seadmesse. Teooria algab lausega
        // „meeldetuletus eelmisest moodulist", seega ta eeldab teda otsesõnu.
        "physics.kumerpeegli-rakendused",
        // Nõguspeegli rakendused käivad viimasena: teooria algab lausega
        // „meeldetuletus eelmisest moodulist" ja võtab moodulist `noguspeegel`
        // nii fookuse kui ka kiirte käigu. Jaotuskava tabelis (P1) on ta
        // `noguspeegel`-i järel ja seda järjekorda ta ka vajab. Kumerpeegli
        // rakenduste JÄREL on ta seepärast, et need kaks moodulit vastavad
        // samale küsimusele („milleks seda peeglit kasutatakse") kahe eri
        // peegli kohta – õpilane läbib nad paarina, hajutav enne, koondav
        // pärast (docs/SISUHALDUS.md – järjekorra otsustab kursusefail).
        "physics.noguspeegli-rakendused",
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
