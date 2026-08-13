/**
 * Õpetajajuhend (docs/MOODULILEPING.md „teacher.ts",
 * sisu/MOODUL-noguspeegli-rakendused.md „Õpetajale").
 *
 * See fail EI ole osa moodulilepingu (contract.ts) tüüpidest – engine ei loe
 * teda kunagi ja checker ei kontrolli tema järgi vastuseid. Ta on inimesele
 * mõeldud materjal õpetaja töölaual.
 *
 * `misconceptions` id-d vastavad TÄPSELT `activities.ts` küsimuste
 * `misconception` siltidele – uue lõksvastuse lisamisel lisa ka siia kirje,
 * muidu jääb õpetaja väärarusaamast teadmatusse. Kooskõla valvab test. Loend on
 * pikem kui activities.ts oma: kolm väärarusaama (suurem peegel annab kitsama
 * kiire, Päike on punkt, peegel teeb valgust juurde) lükkab moodul ümber
 * teoorias ja lahendatud näidises, mitte vale valikvastusega – õpetaja peab
 * neist sellegipoolest teadma, sest klassis tulevad nad jutuks.
 *
 * **Sellel moodulil ainekava praktilist tööd EI ole** (P1-PT1…PT4 on kõik juba
 * teiste moodulite all), seega ei ole siin `procedure`-välja. Kaks (K)
 * klassikatset – taskulambi peegeldi lahtivõtmine ja päikese koondamine
 * paberile – on lühikesed demonstratsioonid ja neid ei tohi praktilise tööna
 * esitada.
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
    "(K) odav taskulamp, mille saab lahti keerata – peegeldi peab käes hoida saama",
    "(K) nõguspeegel või suur luup päikese koondamiseks (ainult õues, vt ohutus)",
    "Paberileht ja mõõdulint või joonlaud",
    "Ämber vett või liiva päikesekatse juurde – kohustuslik, mitte valikuline",
  ],
  /**
   * OHUTUS. Siin on ta TEISTPIDI kui kumerpeeglil: nõguspeegel KOONDAB ja
   * koondatud päikesevalgus süütab paberi. See ei ole hoiatuse pärast lisatud
   * lause, vaid katse osa – unustatud peegel süütab edasi ka siis, kui katse on
   * läbi.
   */
  safety:
    "Nõguspeegel koondab valgust – see on kogu mooduli sisu ja ühtlasi kogu ohu allikas. Koondatud päikesevalgus süütab paberi ja põletab naha mõne sekundiga. Reeglid on lühikesed ja neist ei tehta erandit: ei kunagi silma ega teise inimese poole; ainult täiskasvanu juuresolekul; ämber vett või liiva kohe kõrval; katse käib õues, mitte klassis. Peegel pannakse pärast katset kohe varju või kaetakse kinni – kotti unustatud peegel süütab edasi. Rahutu rühmaga tehke katset ainult demonstratsioonina. Päikesesse ei vaadata peegli ega luubi kaudu MITTE KUNAGI.",
  /** (K) Taskulambi peegeldi lahtivõtmine (5 min). */
  torchActivity: [
    "Võtke odav taskulamp lahti ja laske õpilastel peegeldit käes hoida – nõgus pind on käega katsudes veenvam kui joonisel.",
    "Küsige, kus pirn peegli suhtes asub (fookuses) ja mis juhtuks, kui ta oleks kaugemal või lähemal.",
    "Mõnel taskulambil saab pead keerates pirni nihutada – see ongi „zoom\": fookusest välja nihkunud pirn annab laia hajuva laigu.",
    "Mudel seda EI arvuta (nihutatud allikas nõuab peeglivalemit, mis on gümnaasium), seega jääb see katse teadlikult klassi, mitte ekraanile. Ütelge see õpilastele välja.",
  ],
  /** (K) Päikese koondamine paberile, õues (10 min). Ohutus on eespool. */
  sunActivity: [
    "Nõguspeegli või suure luubiga koondage päikesevalgus paberile ja mõõtke tekkiva heleda plekki läbimõõt.",
    "Võrrelge simulatsiooni valemiga: plekk ≈ fookuskaugus · 0,0093. Poole meetri fookuskaugusega peegel annab umbes 4,7 mm plekki.",
    "Küsige, miks plekk ei lähe punktiks, kui peeglit paremini suunata. Vastus on kogu mooduli teine pool: Päike ise ei ole punkt.",
    "Enne katset lugege ohutusreeglid ette ja pange ämber vett või liiva kohale valmis. Peegel kaetakse kohe pärast katset.",
  ],
  /**
   * Koht, kus lihtne mudel otsa saab – näita seda klassile MEELEGA.
   *
   * model.ts idealiseering 1: mudel arvutab kerapinnaga. Päris seadme peegel on
   * parabool. See ei ole viga, vaid mudeli piir.
   */
  parabolaNote:
    "Kerapeeglil ei koondu servadelt tulevad kiired täpselt samasse punkti ja mida sügavam peegel, seda rohkem see paistab. Prožektori, teleskoobi ja päikeseahju peeglid on seepärast paraboolid, mitte kerapinna osad. 8. klassi joonis ja selle mooduli mudel on kerapinnaga – näidake seda õpilastele kui kohta, kus lihtne mudel otsa saab, mitte kui viga. Sama otsus ja sama põhjendus on moodulis „Nõguspeegel\".",
  /**
   * Seos mooduliga `kumerpeegli-rakendused`: kaks moodulit on teineteise
   * peegelpildid. Rakendusi EI korrata – practice-4 kaks viimast valikut ongi
   * see koht, kus nad kokku saavad.
   */
  convexMirrorLink:
    "See moodul ja „Kumerpeegel meie ümber\" on teineteise peegelpildid. Kumer hajutab: lai vaateväli, aga väike kujutis ja kaugus tundub suurem. Nõgus koondab: kitsas kiir või ere plekk, aga peegel peab olema täpselt suunatud. Kui mõlemad moodulid on tehtud, sobib tunni lõppu üks küsimus: „Kumb peegel kuhu ja miks?\"",
  /**
   * Kus simulatsioon ja päris seade lahku lähevad – ütle see ETTE.
   *
   * model.ts idealiseeringud 2–5: pirn on täpselt fookuses, kogu valgus
   * peegeldub, valgus levib takistuseta ja kõik on ühes tasapinnas.
   */
  whyRealDiffers:
    "Simulatsioonis on pirn alati täpselt fookuses ja kogu peeglile langev valgus jõuab vihku. Päris taskulambis peegeldub 85–95 % valgusest ja osa läheb pirnist otse peeglist mööda välja – see ongi „udu\" ümber kiire, mida ekraanil ei ole. Päris kiir kaob udus ja vihmas ära palju varem, kui valem ütleb, sest mudel ei tunne atmosfääri hajumist. Simulatsioon näitab ka ainult ühte tasapinda: päris vihk ja päris plekk on ringid, aga nende läbimõõt tuleb sama valemiga.",
  discussionQuestions: [
    "Miks on autotulel lisaks peeglile ka klaas triipudega?",
    "Miks on suurte teleskoopide peeglid nii suured, kui koondumistegur suurusest ei sõltu?",
    "Miks peavad satelliittaldrik ja päikeseahi olema täpselt suunatud?",
    "Mis juhtuks, kui prožektori pirn läheks fookusest välja?",
  ],
  /**
   * Millal see moodul tunnis: kohe PÄRAST moodulit `noguspeegel`. Uut füüsikat
   * siin ei ole, seega sobib ta ka koduseks tööks.
   */
  whenInLesson:
    "Kohe pärast moodulit „Nõguspeegel\" – see on sama tunni teine pool. Kui aega on vähe, sobib ta koduseks tööks: uut füüsikat siin ei ole, on ainult ülekanne. Mooduli „Kumerpeegel meie ümber\" läbimine ei ole eelduseks, aga practice-4 kaks viimast valikut (poe koridor, auto külgpeegel) on lihtsamad, kui ta on tehtud. 45-minutilises tunnis mahub ette moodul „Nõguspeegel\" ja lõppu päikese koondamise katse õues.",
  tip: "Kõige tähtsam liigutus simulatsioonis on PIRNI SUURUSE liugur, mitte raadiuse oma. Laske õpilastel vaadata, mis juhtub kahe vihuga korraga: ideaalne vihk jääb paigale, päris vihk paisub. Peegel on kogu aeg täpselt sama – kogu vahe tuleb pirnist. Alles siis liikuge raadiuse liuguri juurde, muidu jääb mulje, et asi on ikkagi peeglis.",
  /**
   * Summa peab andma manifest.minutes.lesson (15 min). 45-minutilises tunnis
   * mahub ette moodul „Nõguspeegel" ja lõppu päikese koondamise katse õues.
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
      id: "suurem-allikas-kitsam-kiir",
      description:
        "Õpilane arvab, et suurem või võimsam pirn annab kitsama kiire – „tugevam valgus jääb paremini koos\".",
      remedy:
        "Ennustus lukustub enne simulatsiooni ja explore-2 vastab: sama peegliga annab 10 mm hõõgniit umbes neli korda laiema ringi kui 2 mm LED. Ütelge välja, mis segi läheb: eredus ja laius on kaks eri asja. Suur pirn annab eredama JA laiema vihu.",
    },
    {
      id: "peegel-maarab-koik",
      description:
        "Õpilane arvab, et kiire laius sõltub ainult peeglist ja allikas ei loe.",
      remedy:
        "Explore-1 ja explore-2: peegel on kogu aeg sama 10 cm ja see on ekraanil kirjas, ainus muutus on pirn – arv muutub neli korda. Explore-3 muudab ainult kõverust ja arv muutub uuesti. Klassis aitab küsimus: kui asi oleks peeglis, siis miks on kallil taskulambil väike LED?",
    },
    {
      id: "lamedam-peegel-laiem-kiir",
      description:
        "Õpilane arvab, et mida lamedam peegel, seda laiem kiir – lamedam peegel justkui „koondab vähem\".",
      remedy:
        "Explore-3: raadius 60 cm peale ja valgusring kahaneb 0,50 m pealt 0,23 m peale. Põhjus tasub välja öelda: mida kaugemal fookus on, seda väiksema nurga alt sama suur pirn peeglilt paistab. Kitsast kiirt tahtev prožektor on seepärast pikk, mitte sügav.",
    },
    {
      id: "suurem-peegel-kitsam-kiir",
      description:
        "Õpilane arvab, et suurem peegel annab kaugel kitsama valgusringi – „suur peegel hoiab kiirt koos\".",
      remedy:
        "Teooria „mida peegli suurus teeb ja mida ei tee\" ning exit-3 sõbra jutt. Mudelis on peegli läbimõõt valemis LIIDETAVANA, mitte lahtimineku sees: suurem peegel annab kaugel laiema, mitte kitsama ringi. Kitsa kiire teeb väike allikas ja pikk fookuskaugus.",
    },
    {
      id: "suurem-peegel-koondab-tihedamalt",
      description:
        "Õpilane arvab, et suurem peegel koondab valgust alati tihedamalt.",
      remedy:
        "Practice-2: 10 cm ja 1 m peegel sama suhtega läbimõõt : fookuskaugus annavad täpselt sama koondumisteguri. Lahutage kaks asja lahku: „kui tihe\" tuleb suhtest, „kui palju\" peegli pindalast. Suur teleskoop kogub rohkem valgust, aga ei koonda teda tihedamaks.",
    },
    {
      id: "vaiksem-plekk-tihedam",
      description:
        "Õpilane arvab, et väiksem plekk tähendab alati tihedamat valgust.",
      remedy:
        "Practice-2: võrrelda tuleb plekki PEEGLIGA, mitte teise plekiga. Väike peegel annab väikese plekki, aga ta püüab ka vähem valgust – suhe jääb samaks. Klassis: mitu korda väiksem on plekk peeglist, mitte mitu millimeetrit ta on.",
    },
    {
      id: "paike-on-punkt",
      description:
        "Õpilane arvab, et Päikese valgus koondub ühte punkti, kui peegel on hea.",
      remedy:
        "Lahendatud näidis (practice-1 ees): Päike paistab 0,533° laiuse kettana ja 1 m fookuskaugusega peegel annab tema kettast 9,3 mm plekki. Õues tehtud katse näitab sedasama – mõõtke plekk ära ja võrrelge valemiga.",
    },
    {
      id: "nogus-annab-laia-vaate",
      description:
        "Õpilane arvab, et nõguspeegel annab laia vaatevälja – ta ajab nõgus- ja kumerpeegli segi.",
      remedy:
        "Practice-4, kus poe turvapeegel ja auto külgpeegel on valed vastused. Nõguspeegel koondab: ta saadab valgust ühte suunda, kogub seda kokku ja suurendab lähedalt vaadates. Kus on vaja LAIA VAATEVÄLJA, seal on vaja kumerpeeglit – vt moodul „Kumerpeegel meie ümber\".",
    },
    {
      id: "valgus-vasib",
      description:
        "Õpilane arvab, et valgus „väsib\" või aeglustub pika tee peal ja seepärast vihk hajub.",
      remedy:
        "Practice-3: hajumise põhjus on allika suurus, mitte tee pikkus. Simulatsiooni ideaalne vihk käib sama pika tee ja jääb ikka peegli laiuseks – ainus vahe on see, kas allikal on suurus või mitte.",
    },
    {
      id: "peegel-teeb-valgust-juurde",
      description:
        "Õpilane arvab, et peegel lisab valgust juurde – peegeldiga taskulamp „annab rohkem valgust\".",
      remedy:
        "Teooria „suund 1\": peegel ainult suunab ümber selle valguse, mis pirnist niikuinii välja tuleb. Ette poole läheb rohkem, taha poole ei lähe enam midagi. Klassis: mis juhtub taskulambi patarei kestvusega, kui peegeldi ette panna? (Mitte midagi.)",
    },
  ] satisfies Misconception[],
};
