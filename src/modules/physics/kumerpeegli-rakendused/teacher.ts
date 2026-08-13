/**
 * Õpetajajuhend (docs/MOODULILEPING.md „teacher.ts",
 * sisu/MOODUL-kumerpeegli-rakendused.md „Õpetajale").
 *
 * See fail EI ole osa moodulilepingu (contract.ts) tüüpidest – engine ei loe
 * teda kunagi ja checker ei kontrolli tema järgi vastuseid. Ta on inimesele
 * mõeldud materjal õpetaja töölaual.
 *
 * `misconceptions` id-d vastavad TÄPSELT `activities.ts` küsimuste
 * `misconception` siltidele – uue lõksvastuse lisamisel lisa ka siia kirje,
 * muidu jääb õpetaja väärarusaamast teadmatusse. Kooskõla valvab test.
 *
 * **Sellel moodulil ainekava praktilist tööd EI ole** (P1-PT1…PT4 on kõik juba
 * teiste moodulite all), seega ei ole siin `procedure`-välja. Kaks (K)
 * klassikatset – päris turvapeegli mõõtmine ja auto külgpeeglite võrdlus – on
 * lühikesed demonstratsioonid ja neid ei tohi praktilise tööna esitada.
 */

export type Misconception = {
  /** Vastab activities.ts küsimuste `misconception` väljale. */
  id: string;
  description: string;
  remedy: string;
};

export type LessonPlanItem = {
  step: string;
  minutes: number;
};

export const teacher = {
  equipment: [
    "(K) päris ümar peegel kooli koridori nurgas, parklas või lähedal ristmikul – kui koolis ühtki ei ole, sobib ka foto",
    "Mõõdulint või rulett (5 m või pikem)",
    "(K) valikuline: parklas seisev auto, mille mõlemad külgpeeglid on näha",
  ],
  /**
   * OHUTUS. Siin on ta TEISTPIDI kui nõguspeeglil: kumerpeegel ei koonda ega
   * sütita midagi. Just seepärast tuleb vahe välja öelda – „ohutu" ei tähenda
   * „tee mida tahad", sest pimestada saab ka koondamata valgusega. Teine pool
   * on liiklus: ükski peegel ei asenda pea pööramist.
   */
  safety:
    "Kumerpeegel hajutab valgust, seega ta valgust kokku ei koonda ja põletusohtu temaga ei ole – see on vastupidi moodulile „Nõguspeegel\" ja ütle see vahe klassis välja. Ere päikesevalgus on peeglilt sellegipoolest pimestav: peegeldunud Päikest ei suunata kellelegi silma. Liikluses ei mängi peeglitega. Ükski peegel ei asenda pea pööramist – pimeala jääb alati alles, mida näitab ka practice-3. Külgpeeglite võrdlust tehke ainult PARKLAS SEISVA auto juures, mitte sõidutee ääres.",
  /** (K) Päris turvapeegel või liikluspeegel mõõdulindiga (5 min). */
  publicMirrorActivity: [
    "Kui koolis või kooli lähedal on ümar peegel (koridori nurgas, parklas, ristmikul), minge klassiga kohale.",
    "Üks õpilane seisab peegli ees ja ütleb, kust kohani ta peeglis veel midagi näeb; teised märgivad need kaks kohta ja mõõdavad vahemaa.",
    "Võrrelge mõõdetud arvu simulatsiooni omaga. Täpselt kokku ei lähe – päris peegli raadius on teadmata ja vaataja ei seisa täpselt peatelje peal.",
    "Astuge kaks sammu kaugemale ja korrake: vaateväli kitseneb, aga vähe. Just see „aga vähe\" ongi kumerpeegli mõte – tasapeeglil kitseneks ta kordades rohkem.",
  ],
  /** (K) Auto külgpeeglite võrdlus – hoiatuskirja päris vaste. */
  carMirrorActivity: [
    "Euroopas on juhipoolne külgpeegel tavaliselt tasane või väga vähe kumer, kõrvalistuja poolne aga selgelt kumer – ja hoiatuskiri on just sellel.",
    "Laske õpilastel mõlemasse vaadata ja öelda, kummas paistab sama auto väiksem ja kummas on rohkem ümbrust näha.",
    "Küsige, miks on hoiatus ainult ühel peeglil. Oodatav vastus: ainult kumer peegel näitab kõike väiksemana, seega ainult tema puhul eksib kauguse hindamine.",
    "Ohutus: ainult parklas seisva auto juures, mitte sõidutee ääres.",
  ],
  /**
   * Koht, kus lihtne mudel otsa saab – näita seda klassile MEELEGA.
   *
   * Mudel oskab ainult kerapinda (model.ts idealiseering 3). Peegel, mille
   * kõverus muutub, ei ole enam üks R – see ei ole viga, vaid mudeli piir.
   */
  asphericalNote:
    "Mõnel autol on külgpeegli välimine osa kumeram kui sisemine (peeglil võib olla kiri „aspherical\") ja peeglis on näha peenike jaotusjoon. Selle mooduli mudel oskab ainult ühe kõverusega kerapinda – näidake seda õpilastele kui kohta, kus lihtne mudel otsa saab, mitte kui viga.",
  /**
   * Kus simulatsioon ja päris peegel lahku lähevad – ütle see ETTE.
   *
   * model.ts idealiseeringud 1 ja 5: vaataja silm on punkt peateljel ja kõik on
   * ühes tasapinnas. Peegli PÖÖRAMINE on siin tähtsaim asi, sest päris peegel
   * on alati nurga all ja õpilane näeb seda iga päev.
   */
  whyRealDiffers:
    "Simulatsioonis vaatab müüja peeglit otse ja peegel on seina peal risti. Päris turvapeegel on alati nurga all – see muudab, KUHU vaateväli osutab, mitte kui LAI ta on, ja seepärast tohib simulatsioon vaadata otse. Mudel arvutab ka ainult ühe tasapinna (ülalt vaade) ja eeldab, et silm on punkt peatelje peal; päris müüja seisab kõrval, seega tema vaateväli on veidi nihkes, aga sama lai. Päris peegel on ümar ja tema vaateväli on koonus – kõrgussuunas tuleb laius sama valemiga, aga seda simulatsioon ei kuva.",
  discussionQuestions: [
    "Miks ei tehta ristmikupeeglit lihtsalt suureks ja tasaseks?",
    "Mida kaotaks poemüüja, kui ta paneks koridori väga kumera peegli?",
    "Miks ei ole hoiatuskirja tasasel juhipoolsel peeglil?",
    "Kus koolis oleks kumerast peeglist kasu ja kus oleks temast hoopis tüli?",
  ],
  /**
   * Millal see moodul tunnis: kohe PÄRAST moodulit `kumerpeegel`. Uut füüsikat
   * siin ei ole, seega sobib ta ka koduseks tööks.
   */
  whenInLesson:
    "Kohe pärast moodulit „Kumerpeegel\" – see on sama tunni teine pool. Kui aega on vähe, sobib ta koduseks tööks: uut füüsikat siin ei ole, on ainult ülekanne. Mooduli „Nõguspeegel\" läbimine ei ole eelduseks, aga practice-4 kaks viimast valikut (meigipeegel, teleskoop) on lihtsamad, kui ta on tehtud.",
  tip: "Kõige tähtsam liigutus simulatsioonis on VAATAJA KAUGUSE liugur, mitte raadiuse oma. Laske õpilastel vaadata, mis juhtub kahe arvu SUHTEGA, kui müüja eemale läheb: tasapeegli lehvik kaob peaaegu ära, kumera oma kitseneb vaevu. Just see vastab küsimusele, miks pannakse kumer peegel sinna, kus vaataja on kaugel – ristmikule teisele poole teed ja poekoridori teise otsa.",
  /**
   * Summa peab andma manifest.minutes.lesson (15 min). 45-minutilises tunnis
   * mahub ette moodul „Kumerpeegel" ja lõppu päris turvapeegli juurde minek.
   */
  lessonPlan: [
    { step: "hook", minutes: 2 },
    { step: "theory", minutes: 3 },
    { step: "predict", minutes: 1 },
    { step: "explore", minutes: 5 },
    { step: "practice", minutes: 3 },
    { step: "exit", minutes: 1 },
  ] satisfies LessonPlanItem[],
  misconceptions: [
    {
      id: "peegli-suurus-maarab-vaatevalja",
      description:
        "Õpilane arvab, et vaateväli sõltub ainult peegli suurusest – kuju ei loe.",
      remedy:
        "Explore-1 ja explore-2: peegli läbimõõt on kogu aeg sama 30 cm ja ekraanil kirjas, aga nähtav lõik erineb neli korda. Explore-3 muudab ainult kõverust ja arv muutub uuesti. Klassis aitab küsimus: kui asi oleks suuruses, kui suur peaks tasapeegel siis olema?",
    },
    {
      id: "tasapeegel-naitab-rohkem",
      description:
        "Õpilane arvab, et tasapeegel näitab rohkem, sest ta ei „moonuta\" – kumer peegel justkui surub pildi kokku ja kaotab midagi ära.",
      remedy:
        "Ennustus lukustub enne simulatsiooni ja siis on mõlemad lehvikud korraga ekraanil: tasapeegli oma on nähtavalt kitsam ja tema arv väiksem. Ütle välja, MIS kokku surutakse – mitte ala, vaid see, kui suurena me seda näeme.",
    },
    {
      id: "lamedam-vaatevali-laiem",
      description:
        "Õpilane arvab, et mida lamedam peegel, seda laiem vaateväli – lame pind justkui „näeb rohkem korraga\".",
      remedy:
        "Explore-3: raadius 300 cm peale ja lõik kahaneb, liikudes tasapeegli oma poole. Piirjuht aitab: kõige lamedam peegel ONGI tasane, ja tema on kogu aeg olnud võrdluses kitsam. Seost eelmise mooduliga tasub öelda: lamedama peegli näiline fookus on kaugemal, seega ta hajutab vähem.",
    },
    {
      id: "kumer-suurendab",
      description:
        "Õpilane arvab, et kumerpeegel suurendab – ta ajab kumer- ja nõguspeegli segi.",
      remedy:
        "Teooria tagajärg 2 ütleb otse: laiem ala mahub samale pinnale ainult väiksemana. Practice-4 lisab meigipeegli vale valikuna ja exit-1 sama mõtte teistpidi. Klassis: lusika kumer külg (moodul „Kumerpeegel\") – nägu on seal alati väike.",
    },
    {
      id: "kumer-koondab",
      description:
        "Õpilane arvab, et kumerpeegel koondab valgust nagu taskulambi peegeldi.",
      remedy:
        "Practice-4 teleskoobi valik + eelmise mooduli näiline fookus: kumerpeeglilt lähevad kiired laiali ja peegli taha ei jõua ükski kiir. Kus on vaja valgust KOKKU koguda, seal on vaja nõguspeeglit.",
    },
    {
      id: "peegel-muudab-kaugust",
      description:
        "Õpilane arvab, et peegel viib eseme päriselt kaugemale või lähemale – hoiatuskiri on justkui peegli enda tegu.",
      remedy:
        "Practice-2 ja exit-3: muutub ainult see, kui suurena me eset näeme. Peegel ei liiguta midagi. Küsi klassis, mis juhtub jalgratturiga siis, kui juht peeglisse ei vaatagi.",
    },
    {
      id: "peegel-aeglustab-valgust",
      description:
        "Õpilane arvab, et peeglis on pilt „hilisem\" – valgus jõuab peeglist kohale viivitusega.",
      remedy:
        "Practice-2 selgitus: peegel ei aeglusta midagi. Valgus läbib peeglini ja tagasi paar meetrit – see aeg on kaduvväike. Eksitab meie enda kauguse hindamine, mitte aeg.",
    },
    {
      id: "kumerpeegel-naitab-koike",
      description:
        "Õpilane arvab, et kumerpeegel näitab kogu ümbrust ja pimeala ei jäägi – kui peegel on olemas, on kõik näha.",
      remedy:
        "Practice-3 joonis: auto C jääb lehvikust välja. Vaateväli on lai, aga mitte lõputu. Liikluses on see ohutuse küsimus, mitte füüsika detail: ükski peegel ei asenda pea pööramist (vt ohutus).",
    },
  ] satisfies Misconception[],
};
