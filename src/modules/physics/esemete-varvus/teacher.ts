/**
 * Õpetajajuhend (docs/MOODULILEPING.md „teacher.ts",
 * sisu/MOODUL-esemete-varvus.md „Õpetajale").
 *
 * See fail EI ole osa moodulilepingu (contract.ts) tüüpidest – engine ei loe
 * teda kunagi ja checker ei kontrolli tema järgi vastuseid. Ta on inimesele
 * mõeldud materjal õpetaja töölaual.
 *
 * `misconceptions` id-d vastavad TÄPSELT `activities.ts` küsimuste
 * `misconception` siltidele – uue lõksvastuse lisamisel lisa ka siia kirje,
 * muidu jääb õpetaja väärarusaamast teadmatusse. Kooskõla valvab test.
 *
 * **Sellel moodulil ei ole ainekava praktilist tööd** (P1-PT2 „värvilise
 * valguse uurimine valgusfiltritega" on mooduli `valgusfiltrid` oma), seega ei
 * ole siin ka `procedure`-välja. Kolm klassikatset allpool on ainekava
 * SOOVITATUD tegevused – nad on head ja odavad, aga nad ei ole see töö, mille
 * eest katvusraport punkti annab.
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
    "Punane õun või tomat, roheline leht, sinine ese ja valge paberileht (ühevärvilise valguse katse jaoks)",
    "Telefon, millel saab avada täisekraanil ühevärvilise pildi (punane, roheline, sinine) – kõige lihtsam ühevärviline valgusallikas",
    "Taskulamp ja värviline kile, kui telefoni ei kasutata",
    "Valge papp ja must paberitükk (päikese käes soojenemise katse)",
    "Guašš või vesivärvid: kollane ja sinine (värviaine vs valgus)",
  ],
  /**
   * Ohutus. Selles moodulis ei ole midagi päriselt ohtlikku – aga just seepärast
   * tasub kaks „see on ju tühiasi" kohta välja öelda.
   */
  safety:
    "Midagi ohtlikku selles moodulis ei ole. Taskulampi ei suunata silma. Päikest ei vaadata palja silmaga – ka mitte „ainult korraks\", et kahe särgi valgust võrrelda.",
  /**
   * (K) Kõige mõjuvam katse: värviline valgus pimedas klassis.
   *
   * Ütle klassile ETTE, et päris õun ei lähe päris mustaks. Muidu jääb katse
   * õpilase mällu „ebaõnnestunuks" ja kinnitab hoopis väärarusaama
   * `varv-on-esemes` („näed, natuke punane ta ikka on").
   */
  darkRoomActivity: [
    "Pane lauale punane õun või tomat, roheline leht, sinine ese ja valge paber.",
    "Pimenda klass ja valgusta neid ühevärvilise valgusega: telefoni ekraanil täisekraanil punane, siis roheline, siis sinine.",
    "Lapsed ütlevad ennustuse ETTE ja alles siis vaadatakse. Kõige tugevam hetk on punane ese rohelises valguses – ta läheb tumehalliks või peaaegu mustaks.",
    "Ütle ette, et päris mustaks ta ilmselt ei lähe: telefoni „roheline\" ekraan kiirgab natuke ka teisi värve, tuppa jääb alati veidi kõrvalvalgust ja päris õun ei ole nii puhtalt punane kui mudeli õun. Ekraanil on ese päris must, klassis tumehall – see vahe on ootuspärane, mitte katse ebaõnnestumine.",
  ],
  /** (K) Must ja valge paber päikese käes – neeldumine käega katsutavaks. */
  warmthActivity:
    "Kleebi valge papi peale must paberitükk, jäta aknalauale päikese kätte 10 minutiks ja katsu sõrmega (või mõõda infrapunatermomeetriga, kui on). Vahe on käega tuntav. Sama katse talvel: lumel olev must täpp vajub aukusse.",
  /**
   * (K) Värvipurk ja valgus – see lause peab tunnis kõlama.
   *
   * Ilma selleta läheb pool klassist segadusse: nad on lasteaiast saadik
   * teadnud, et kollane + sinine = roheline, ja simulatsioonis annab kollane
   * valgus punase + rohelise.
   */
  paintVsLight:
    "Sega guašiga kollane ja sinine – tuleb roheline. Ütle kohe välja, et VALGUSTEGA see nii ei käi (punane + roheline valgus annab kollase) ja et 8. klassis me värviainete keemiat ei ava.",
  tip: "Lase simulatsioon läbida ENNE päris katset. Päris katse õnnestub ainult päris pimedas ja päris ühevärvilise valgusega; kui see ei õnnestu (aknast tuleb valgust), näeb laps „poolikut\" tulemust ja jääb uskuma, et õun on ikka natuke punane. Simulatsioon annab puhta pildi, päris katse kinnitab.",
  /**
   * Kus simulatsioon ja päris elu lahku lähevad.
   *
   * Mudel loeb KANALEID, mitte energiat (model.ts idealiseeringud 1 ja 2).
   * Õpetaja peab teadma, et valge paberi „0" ei ole päris füüsika – hooki
   * joonisel on valge särk 34 °C ehk ta ON pisut soojenenud.
   */
  whyRealDiffers:
    "Simulatsioon loeb värve, mitte energiat. Mudelis ei neela valge paber MITTE MIDAGI – päris valge paber või särk neelab siiski umbes kümnendiku talle langevast valgusest ja soojeneb päikese käes veidi (hooki joonisel 34 °C). Sellepärast ütleb rakendus alati „peaaegu ei neela\", mitte „ei neela midagi\". Samal põhjusel ei küsi ükski ülesanne protsente: „neeldub 2 värvi 3-st\" ei ole „neeldub 67% energiast\".",
  /** Hooki arvud on ÜHE mõõtmise näide, mitte konstandid. */
  hookNumbers:
    "Hooki joonise 48 °C ja 34 °C on ühe suvise mõõtmise näide (mõõdetud särgi pinnalt, sama päike, sama aeg). Päris vahe sõltub päikesest, tuulest ja riide materjalist – kui klassikatses tuleb 39 °C, ei ole see ebaõnnestunud katse. Suund – must on soojem – on alati sama, ja seda küsitaksegi.",
  discussionQuestions: [
    "Miks on kõrbes ja lõunamaades majad valgeks värvitud?",
    "Miks on päästjate ja teetööliste vestid ere kollakasroheline – mis värvi see silmale tagasi saadab?",
    "Mis värvi on lehed sügisel ja mis jäi neis siis peegeldamata?",
    "Miks tundub sama seinavärv poes ja kodus eri tooni?",
  ],
  /**
   * Millal see moodul tunnis: PÄRAST moodulit `liitvalgus-ja-spekter` (õpilane
   * peab teadma, et valges valguses on mitu värvi korraga) ja soovitatavalt ENNE
   * moodulit `valgusfiltrid` – filter on „sama lugu, aga läbi eseme".
   * Peegeldumisseadust see moodul EI eelda: siin ei ole ühtegi nurka.
   */
  whenInLesson:
    "Pärast moodulit `liitvalgus-ja-spekter`, soovitatavalt enne moodulit `valgusfiltrid`. Peegeldumisseadust ei eelda – siin ei ole ühtegi nurka.",
  /** Summa peab andma manifest.minutes.lesson (18 min). */
  lessonPlan: [
    { step: "hook", minutes: 2 },
    { step: "theory", minutes: 3 },
    { step: "predict", minutes: 2 },
    { step: "explore", minutes: 5 },
    { step: "practice", minutes: 4 },
    { step: "exit", minutes: 2 },
  ] satisfies LessonPlanItem[],
  misconceptions: [
    {
      id: "varv-on-esemes",
      description:
        "Õpilane arvab, et värv on eseme enda omadus, mis ei sõltu valgusest – ka pimedas on õun punane.",
      remedy:
        "Ennustus lukustub enne katset, siis näitavad explore-2 ja explore-3, et sama õun paistab rohelises lambis must ja sama sidrun punases lambis punane. Practice-4 kordab sama väitena. Sõnadega: ese ei tee värvi ise, ta ainult valib, mida tagasi saata.",
    },
    {
      id: "ese-kiirgab-ise",
      description:
        "Õpilane arvab, et värviline ese kiirgab ise oma värvi valgust – nagu väike lamp.",
      remedy:
        "Teooria ütleb selle otse välja ja simulatsiooni nooled näitavad: eseme juurest ei lähe ühtegi noolt, mida enne ei langenud. Practice-4 vale variandina. Kõige lühem kontrollküsimus klassis: mis värvi on ese päris pimedas toas?",
    },
    {
      id: "ese-peegeldab-koike-mis-langeb",
      description:
        "Õpilane arvab, et ese peegeldab tagasi kogu talle langeva valguse, olgu see mis värvi tahes.",
      remedy:
        "Ennustuse vale variant (b) ja explore-2: roheline valgus punasel õunal ei peegeldu, vaid neeldub. Practice-3 kordab sama sinise kruusiga kollases valguses.",
    },
    {
      id: "must-varv-on-varv",
      description:
        "Õpilane arvab, et musta valgust on olemas ja must ese saadab seda tagasi.",
      remedy:
        "Exit-1 küsib seda otse. Simulatsioonis on musta eseme juures NULL tagasitulevat noolt – must ei ole see, mida tagasi saadetakse, vaid see, et tagasi ei tule midagi.",
    },
    {
      id: "valge-neelab-koige-rohkem",
      description:
        "Õpilane arvab, et valge ese soojeneb päikese käes rohkem, sest „valge tõmbab valgust ligi\".",
      remedy:
        "Hook algab mõõdetud kraadidest (must särk on kuumem), explore-4 lisab lause valge paberi kohta ja practice-2 palub kolme eseme joonise pealt öelda, milline soojeneb kõige rohkem. Reegel: soojust annab see valgus, mis EI tule tagasi.",
    },
    {
      id: "valgus-ja-varviaine-sama",
      description:
        "Õpilane arvab, et valguste liitmine käib nagu guaššvärvide segamine: kollane + sinine = roheline.",
      remedy:
        "Teooria tõmbab piiri ühe lausega: purgis segatakse värviAINEID, mis valgust NEELAVAD; siin liidetakse VALGUSI, ja kollane valgus ongi punane + roheline. Klassis tee see katse päriselt ära (vt `paintVsLight`) – ilma selle lauseta läheb pool klassist segadusse.",
    },
  ] satisfies Misconception[],
};
