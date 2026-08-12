/**
 * Õpetajajuhend (docs/MOODULILEPING.md „teacher.ts",
 * sisu/MOODUL-kumerpeegel.md „Õpetajale").
 *
 * See fail EI ole osa moodulilepingu (contract.ts) tüüpidest – engine ei loe
 * teda kunagi ja checker ei kontrolli tema järgi vastuseid. Ta on inimesele
 * mõeldud materjal õpetaja töölaual.
 *
 * `misconceptions` id-d vastavad TÄPSELT `activities.ts` küsimuste
 * `misconception` siltidele – uue lõksvastuse lisamisel lisa ka siia kirje,
 * muidu jääb õpetaja väärarusaamast teadmatusse. Kooskõla valvab test. Loendis
 * on ka need kaks väärarusaama (`nailine-fookus-on-peegli-ees`,
 * `lamedam-hajutab-rohkem`), mille lükkab ümber SIMULATSIOON, mitte ükski
 * vastusevariant: õpetaja peab neid ootama ka siis, kui ükski ülesanne neid ei
 * püüa.
 *
 * **Sellel moodulil ainekava praktilist tööd EI ole** (P1-PT1…PT4 on kõik juba
 * teiste moodulite all), seega ei ole siin `procedure`-välja. Kaks (K)
 * klassikatset – lusika kumer külg ja poe turvapeegel – on lühikesed
 * demonstratsioonid ja neid ei tohi praktilise tööna esitada.
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
    "Läikiv supilusikas iga õpilase või paari kohta (kumer külg = kumerpeegel, nõgus külg = nõguspeegel)",
    "(K) valikuline: jõulukuul, kroomitud ratta kell või muu läikiv ümar ese",
    "(K) valikuline: foto või päris ümar peegel koridori nurgas, parklas või ristmikul",
  ],
  /**
   * OHUTUS. Kumerpeegel valgust kokku ei koonda, seega ei sütita ta midagi –
   * see on hea koht öelda VÄLJA vahe nõguspeegliga. Aga „ohutu" ei tähenda
   * „tee mida tahad": pimestada saab ka koondamata valgusega.
   */
  safety:
    "Kumerpeegel hajutab valgust, seega ta midagi põlema ei pane – ütle see vahe nõguspeegliga klassis välja, sest seal kehtib vastupidine hoiatus. Ka hajutatud päikesevalgus on peeglilt ere: peegeldunud Päikest ei suunata kellelegi silma ega vaadata peeglist Päikest ennast, sest silma saab kahjustada ka koondamata valgusega. Kui keegi soovib koondamiskatset teha, kehtib mooduli „Nõguspeegel\" ohutusjuhend, mitte selle oma.",
  /**
   * (K) Lusikakatse kumeralt küljelt (2 min, vahendeid on igas klassis).
   *
   * Sama lusikas oli nõguspeegli moodulis – nüüd tehakse kõrvutine võrdlus.
   * Väiksena ja püstisena paistmine tuleb siin jutuks, sest õpilane NÄEB seda,
   * aga ükski ülesanne seda ei nõua (sisu/MOODUL-kumerpeegel.md „Piirid").
   */
  spoonActivity: [
    "Vaata läikivat supilusikat tagant poolt: see kumer külg ongi kumerpeegel.",
    "Vii lusikas silme lähedale ja siis aeglaselt kaugemale: nägu on ALATI väike ja püstine, ükskõik kui kaugelt vaadata.",
    "Keera lusikas ümber (nõgus külg): teatud kauguselt pöördub nägu pea peale. Just see kõrvutine võrdlus teeb kahest kõverpeeglist ühe paari.",
    "Ütle klassile ausalt, et seda, KUI SUURENA ja KUS ese peeglis paistab, uurime alles läätsede juures – siin on lusikas selleks, et kumerpeegel oleks käega katsutav asi, mitte ainult joonis.",
  ],
  /** (K) Poe turvapeegel või liikluspeegel – hooki päris vaste. */
  publicMirrorActivity: [
    "Kui koolis või kooli lähedal on ümar peegel (koridori nurgas, parklas, ristmikul), mine sinna klassiga või näita fotot.",
    "Lase õpilastel kirjeldada kaht asja: kui SUUR ala peeglis paistab ja kui suurena inimesed seal paistavad.",
    "Küsi, miks ei ole seal tasast peeglit. Oodatav vastus: kumer pind hajutab, seega jõuab peeglisse valgust laiemast alast ja terve ala mahub korraga ära.",
    "Rakendusi (auto külgpeegel, hoiatus „esemed on lähemal kui paistavad\") vaatame eraldi moodulis – siin piisab põhimõttest.",
  ],
  /**
   * Kus simulatsioon ja päris füüsika lahku lähevad – ütle see ETTE.
   *
   * Mudel arvutab KERAPINDA (model.ts idealiseering 1), sest ainekava räägib
   * kerapinnast ja 8. klassi joonis on kerapinnaga.
   */
  whyRealDiffers:
    "Kerapeegel koondab telje lähedaste kiirte pikendused hästi, servadelt tulevate omad lõikuvad peeglile lähemal. Simulatsioonis on peegel meelega nii kitsas (kiire kõrgus kuni viiendik raadiusest), et seda viga jääb alla 3 % (halvimal juhul 2,1 %) ja pikendused lõikuvad ekraanil ühes punktis. Väga kumeral peeglil paistab see kohe välja – just nii tehaksegi lõbustuspargi kõverpeeglid, ja sama põhjus paneb prožektorile paraboolse, mitte kerakujulise peegli.",
  discussionQuestions: [
    "Miks paistab jõulukuulis terve tuba korraga?",
    "Kumb peegel sobib poe nurka ja miks – kumer või nõgus?",
    "Mis juhtuks turvapeegliga, mida hakataks aina lamedamaks tegema?",
    "Kui kumerpeegel näitab kõike väiksemana, siis miks ta üldse abiks on?",
  ],
  /**
   * Millal see moodul tunnis: kohe PÄRAST moodulit `noguspeegel`. Kaks
   * kõverpeeglit on üks paar ja vahe (koondav / hajutav, päris / näiline
   * fookus) jääb nõrgaks, kui nad on teineteisest kaugel.
   */
  whenInLesson:
    "Kohe pärast moodulit „Nõguspeegel\" – kaks kõverpeeglit on üks paar. Sama tunnis või kõrvutistes tundides; kumbagi eraldi õpetada saab, aga vahe koondava ja hajutava peegli ning päris ja näilise fookuse vahel jääb nõrgaks, kui nad on kaugel teineteisest.",
  tip: "Kõige tähtsam liigutus simulatsioonis on pikenduste lüliti. Lase õpilasel enne selle avanemist vaadata, mis päriselt juhtub – kiired lähevad laiali ja peegli ees ei lõiku miski. Alles siis tulevad katkendlikud pikendused ja koos nendega näiline fookus. Kui see järjekord ära vahetada, jääb mulje, et peegli taga on midagi päris.",
  /**
   * Summa peab andma manifest.minutes.lesson (15 min). 45-minutilises tunnis
   * mahub kõrvale lusikakatse ja moodul „Nõguspeegel".
   */
  lessonPlan: [
    { step: "hook", minutes: 2 },
    { step: "theory", minutes: 3 },
    { step: "predict", minutes: 2 },
    { step: "explore", minutes: 5 },
    { step: "practice", minutes: 2 },
    { step: "exit", minutes: 1 },
  ] satisfies LessonPlanItem[],
  misconceptions: [
    {
      id: "koverpeegel-alati-koondab",
      description:
        "Õpilane arvab, et iga kõverpeegel koondab valguse fookusesse – nõguspeegli üldistus.",
      remedy:
        "Ennustus lukustub enne simulatsiooni ja siis näeb õpilane ekraanil, et kiired lähevad nähtavalt laiali: peegli ees ei ole ühtegi lõikepunkti. Klassis aitab lusikas: keera ta ümber ja nägu ei pöördu enam kunagi pea peale, ükskõik kui kaugele lusikas viia.",
    },
    {
      id: "kumer-peegeldab-tagasi",
      description:
        "Õpilane arvab, et kumeralt peeglilt tuleb valgus sama teed tagasi, kust ta tuli.",
      remedy:
        "Explore-3: valitud kiire langemis- ja peegeldumisnurk on ekraanil kirjas ja peegeldunud kiir kaldub peateljest kaks korda langemisnurga võrra eemale. Sama teed tagasi tuleb ainult see kiir, mis liigub täpselt mööda peatelge – seda saab liuguriga järele proovida (kiire kõrgus 0 cm).",
    },
    {
      id: "nailine-fookus-on-paris-fookus",
      description:
        "Õpilane arvab, et näilises fookuses koondub valgus – sinna pandud paberi saaks põlema panna.",
      remedy:
        "Pikenduste lüliti avaneb alles pärast kolmandat ülesannet: enne seda näeb õpilane ainult seda, mis päriselt juhtub. Pikendustel ei ole nooleotsi, sest valgus sinna ei liigu. Explore-4, practice-4 ja exit-3 küsivad sedasama sõnadega. Klassis: peegli taga on sein – sinna ei jõua ükski kiir.",
    },
    {
      id: "nailine-fookus-on-peegli-ees",
      description:
        "Õpilane arvab, et näiline fookus on peegli ees, nagu nõguspeeglil oli päris fookus.",
      remedy:
        "Simulatsiooni mõõdujoon läheb peegli tipust TAHAPOOLE ja peegli tagune ala on eraldi märgitud sildiga „siin valgust ei ole\". Kõverpeegleid õpetades ütle suund alati sõnadega välja: nõguspeeglil peegli ees, kumerpeeglil peegli taga.",
    },
    {
      id: "kumeral-seadus-ei-kehti",
      description:
        "Õpilane arvab, et kõveral pinnal peegeldumisseadus ei kehti – kiired peegelduvad „kuidas juhtub\".",
      remedy:
        "Teooria ütleb otse, mis muutub: ainult ristsirge siht (kerapinnal on ta raadiuse siht, kumerpeeglil peegli taha). Explore-3 laseb õpilasel ekraanilt lugeda, et langemis- ja peegeldumisnurk on võrdsed, ja mudeli test nõuab seda võrdsust kümnete raadiuse ja kõrguse paaride juures. Klassis: iga väike tükk kõverast peeglist ON pisike tasapeegel.",
    },
    {
      id: "fookus-on-kera-keskpunkt",
      description:
        "Õpilane arvab, et näiline fookus on seal, kus on kera keskpunkt.",
      remedy:
        "Simulatsioonis on kera keskpunkt C ja näiline fookus korraga näha ning fookus on täpselt poole lähemal. Teooria ütleb sama arvuga: pool raadiusest. Practice-3 joonisel on C eraldi punkt just selle valiku jaoks.",
    },
    {
      id: "kumer-teeb-esemed-vaiksemaks",
      description:
        "Õpilane arvab, et kumerpeegel vähendab esemeid päriselt – peeglis olev inimene on väiksem.",
      remedy:
        "Practice-4 selgitus: peegel ei muuda ühtegi eset, muutub ainult see, kui suurena me teda peeglis NÄEME. Klassis aitab küsimus: kas lusikas muudab su nina väiksemaks ka siis, kui sa lusikat käest paned?",
    },
    {
      id: "lamedam-hajutab-rohkem",
      description:
        "Õpilane arvab, et mida lamedam peegel, seda rohkem ta hajutab.",
      remedy:
        "Explore-1 ja explore-2: peegli pind jääb ekraanil samaks, raadius kasvab – ja näiline fookus läheb kaugemale, kiired lahknevad vähem. Piirjuht aitab: täiesti lame peegel (tasapeegel) ei hajuta üldse ja tema näiline fookus oleks lõpmatult kaugel.",
    },
  ] satisfies Misconception[],
};
