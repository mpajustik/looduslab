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
    //
    // Alagrupid vastavad ainekava kolmele õpitulemusele (P1-T1, P1-T2,
    // P1-T3 – sisu/AINEKAVA-fyysika-8.md). Kuna T3 moodulid (esemete-varvus,
    // valgusfiltrid) ei vaja peegeldumisseadust, said nad varem T2 peeglite
    // VAHEL koha – õpilase jaoks tegi see aga T1/T2/T3 alagrupid puruks.
    // Nüüd on nad tõstetud oma T3 alagruppi lõppu: eeldused (liitvalgus enne
    // neid) jäävad täidetuks, aga alagrupid vastavad puhtalt ainekavale.
    {
      title: "Valgus ja peegeldumine",
      parts: [
        {
          title: "P1-T1 Valgusallikad ja spekter",
          modules: [
            "physics.valgusallikad",
            // Lambivalik on valgusallikate rakendusmoodul ja käib oma
            // mikromooduli JÄREL, täpselt nagu `helkur`, `varjutused` ja
            // peeglite rakendused: uut liigitust siin ei tule, vaid
            // „soojuslik / külm" ja „punkt- / laiendatud allikas" kantakse
            // üle poeriiulile.
            "physics.lambivalik",
            // Liitvalgus ja spekter on valgusallikate TEINE pool (P1-T1:
            // liigitus spektraalse koostise järgi) ja eeldus moodulile
            // `esemete-varvus` (T3-s allpool). Peegeldumist ta ei vaja.
            "physics.liitvalgus-ja-spekter",
          ],
        },
        {
          title: "P1-T2 Sirgjooneline levimine ja peegeldumine",
          modules: [
            "physics.valguse-sirgjooneline-levimine",
            "physics.vari-ja-poolvari",
            "physics.varjutused",
            // Kuu faasid tuleb PÄRAST varjutusi (teacher.ts „whenInLesson"):
            // faasi ja varjutuse eristamine on lihtsam, kui varjutus on äsja
            // läbi võetud – siis on „Maa vari" konkreetne asi, millele
            // osutada.
            "physics.kuu-faasid",
            "physics.peegeldumisseadus",
            // Tasapeegli kujutis EELDAB peegeldumisseadust (α = β): kogu
            // moodul on selle seaduse tagajärg tasapeeglil, seega tuleb ta
            // kohe tema järel.
            "physics.tasapeegli-kujutis",
            // Peeglikiri on tasapeegli kujutise rakendusmoodul ja käib oma
            // mikromooduli JÄREL, nagu `lambivalik`, `helkur` ja peeglite
            // rakendused. Uut peegeldumisfakti siin ei tule: teooria algab
            // meeldetuletusega („kujutis on peeglist sama kaugel ja
            // päripidine") ja kannab selle üle tähtedele – seega EELDAB ta
            // moodulit `tasapeegli-kujutis` otsesõnu.
            "physics.peeglikiri",
            // Nurkpeegel on peegeldumisseaduse teine rakendus: sama seadus,
            // aga KAKS tasast peeglit järjest. Ta eeldab ainult
            // `peegeldumisseadus`t (langemisnurk = peegeldumisnurk mõlemal
            // peeglil). Kõveraid peegleid ta ei vaja ega maini, seega tuleb
            // ta enne neid – valgus liigub siin ikka tasastel pindadel.
            "physics.nurkpeegel",
            // Helkur on nurkpeegli rakendus ja käib oma mikromooduli JÄREL,
            // täpselt nagu kumerpeegli ja nõguspeegli rakendused: uut seadust
            // siin ei tule, teooria algab meeldetuletusega („kaks peeglit
            // täisnurga all pööravad kiirt 180°") ja kannab selle üle päris
            // asjasse. Kõveraid peegleid ta ei vaja ega maini, seega tuleb ta
            // enne neid.
            "physics.helkur",
            // Nõguspeegel on peegeldumisseaduse KOLMAS aste: seadus ise
            // (tasane pind) → tema tagajärg tasapeeglil → sama seadus kõveral
            // pinnal, kus ristsirge tuleb kera keskpunktist. Ta EELDAB
            // peegeldumisseadust, seega ei saa ta tulla enne teda.
            "physics.noguspeegel",
            // Kumerpeegel on sama kerapinna TEINE pool: nõguspeegel näitas
            // kera sisemist pinda ja päris fookust, siin peegeldub valgus
            // väljastpoolt ja fookus on näiline. Jaotuskava tabelis on ta
            // nõguspeegli ees, aga moodul ISE eeldab teda: teooria, sammud ja
            // kordamiskaardid võrdlevad kogu aeg nõguspeegliga („eelmine
            // moodul"). Seepärast käib ta tema järel – kursusefail otsustab
            // järjekorra, mitte tabeli rea number (docs/SISUHALDUS.md).
            "physics.kumerpeegel",
            // Rakendusmoodul käib oma mikromooduli JÄREL: uut seadust ega uut
            // joonist siin ei tule, vaid kumerpeegli kiirte käik ja näiline
            // fookus kantakse üle kolme päris seadmesse. Teooria algab
            // lausega „meeldetuletus eelmisest moodulist", seega ta eeldab
            // teda otsesõnu.
            "physics.kumerpeegli-rakendused",
            // Nõguspeegli rakendused käivad viimasena: teooria algab lausega
            // „meeldetuletus eelmisest moodulist" ja võtab moodulist
            // `noguspeegel` nii fookuse kui ka kiirte käigu. Kumerpeegli
            // rakenduste JÄREL on ta seepärast, et need kaks moodulit
            // vastavad samale küsimusele („milleks seda peeglit kasutatakse")
            // kahe eri peegli kohta – õpilane läbib nad paarina, hajutav
            // enne, koondav pärast (docs/SISUHALDUS.md – järjekorra otsustab
            // kursusefail).
            "physics.noguspeegli-rakendused",
          ],
        },
        {
          title: "P1-T3 Peegeldumine ja värvus",
          modules: [
            // Esemete värvus EELDAB liitvalgust ja spektrit („valges valguses
            // on kõik värvid koos", T1-s eespool). Peegeldumise SEADUST
            // (α = β) ta ei vaja: siin on kõik pinnad matid ja küsimus on
            // „mis tuleb tagasi", mitte „mis nurga all" – seega ei pea ta
            // enam ootama T2 peeglite lõppu, aga on siia T3 alagruppi
            // koondatud, et ainekava jaotus jääks puhas (kasutaja otsus).
            "physics.esemete-varvus",
            // Valgusfiltrid on P1-T3 KOLMAS tahk: liitvalgus ütles, millest
            // valgus koosneb, esemete värvus vaatas, mis tuleb esemelt
            // TAGASI – siin vaadatakse, mis läheb esemest LÄBI. Ta EELDAB
            // mõlemat eelmist, peegeldumise seadust aga mitte.
            "physics.valgusfiltrid",
          ],
        },
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
