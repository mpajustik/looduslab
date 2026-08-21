/**
 * Õpetajajuhend (docs/MOODULILEPING.md „teacher.ts",
 * sisu/MOODUL-lambivalik.md „Õpetajale").
 *
 * See fail EI ole osa moodulilepingu (contract.ts) tüüpidest – engine ei loe
 * teda kunagi ja checker ei kontrolli tema järgi vastuseid. Ta on inimesele
 * mõeldud materjal õpetaja töölaual.
 *
 * `misconceptions` id-d vastavad TÄPSELT `activities.ts` küsimuste
 * `misconception` siltidele – uue lõksvastuse lisamisel lisa ka siia kirje,
 * muidu jääb õpetaja väärarusaamast teadmatusse. Kooskõla valvab test. Loendis
 * on ka `led-on-noruk`, mida ükski vastusevariant ei püüa: selle lükkab ümber
 * ARVUTUS (ennustus + lahendatud näidis), aga õpetaja peab teda klassis ootama.
 *
 * **Sellel moodulil ainekava praktilist tööd EI ole** (P1-PT1…PT4 on kõik
 * teiste moodulite all), seega ei ole siin `procedure`-välja. Kodulampide
 * võrdlus on ainekava ÕPILASE TEGEVUS „(K) valib kodulambid + põhjendab" ja
 * seda ei tohi praktilise tööna esitada.
 *
 * Ülesannete numeratsioon on KOODI oma (activities.ts id-d), mitte
 * spetsifikatsiooni loendi oma: lahendatud näidis on `worked`-väli, mitte
 * küsimus, seega on säästulambi lünkülesanne practice-1, elutoa vatid
 * practice-2, kelvini tähendus practice-3 ja magamistoa ülekanne practice-4.
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
    "Õpilaste kodus leitud lambid või lambikarbid (kodune ülesanne, vt allpool)",
    "Üks laualamp, mille varjundi saab ära võtta – paljas pirn ja varjundiga lamp kõrvuti",
    "Valge paberileht ja pliiats (varjude võrdlemiseks)",
    "(K) valikuline: telefon, millel saab automaatse valgetasakaalu välja lülitada",
  ],
  /**
   * OHUTUS. Selle mooduli oht ei tule optikast, vaid päris lampidest: kuum
   * klaas ja katkise säästulambi elavhõbe.
   */
  safety:
    "Lampi ei keerata pesast välja enne, kui valgus on lülitist välja lülitatud ja lamp on jahtunud – hõõg- ja halogeenlamp on põledes kuum ning võib põletada. Katkist säästulampi EI koristata tolmuimejaga: sees on veidi elavhõbedat. Tuuluta tuba, korja tükid kokku papi või paberiga ja pane suletud purki. Kodust toovad õpilased eelistatult lambikarbi, mitte lambi enda.",
  /**
   * (K) Kodulampide võrdlus – ainekava õpilase tegevus „valib kodulambid +
   * põhjendab". Kodune töö + 10 min tunnis.
   */
  homeLampComparison: [
    "Iga õpilane leiab kodus kolm lampi (või lambikarpi) ja kirjutab üles kolm arvu: võimsus (W), valgusvoog (lm) ja värvustemperatuur (K).",
    "Kui pakendit enam ei ole, seisavad arvud tihti lambi sokli või klaasi peal väikeses kirjas.",
    "Tunnis arvutage iga lambi valgusviljakus (lm / W) ja pange lambid ühte tabelisse.",
    "Otsustage iga lambi kohta, kas ta on õiges toas. Põhjendus peab nimetama vähemalt KAKS arvu – üks arv üksi ei ole lambivaliku põhjendus.",
  ],
  /**
   * (K) Paljas pirn vs varjund (3 min) – moodulist `valgusallikad` tuttav punkt-
   * ja laiendatud allika vahe, ainult et nüüd on ta ostuotsus.
   */
  bareBulbActivity: [
    "Pane laualamp põlema ilma varjundita ja hoia pliiatsit valge paberi kohal.",
    "Vari on terav ja lampi ennast on valus vaadata – paljas pirn on väike allikas.",
    "Pane varjund (või hajuti) tagasi: vari muutub pehmeks ja lamp ei pimesta enam.",
    "Ühtki suhet siin ei arvutata – see arv (kaugus jagatud mõõtmega) kuulub moodulile „Valgusallikad\".",
  ],
  /**
   * (K) Sama tuba, kaks lampi (3 min) – värvustemperatuuri vahe päriselt näha.
   */
  twoLampsActivity:
    "Kui klassis või koridoris on eri värvustemperatuuriga valgustid, pange üks valge paberileht kordamööda mõlema alla ja pildistage telefoniga. Automaatne valgetasakaal tuleb telefonis välja lülitada, muidu ta „parandab\" vahe ära – ja just see vahe ongi pildi mõte.",
  /**
   * Miks vatt ikka veel pakendil on – mooduli peamise väärarusaama ajalugu.
   */
  whyWattStillOnPackage:
    "Hõõglampide ajal oli vatt hea heleduse asendaja, sest kõik lambid olid sama tüüpi: 60 W tähendas alati sama valgust. Täna on vatt ainult tarbimisarv. Poes räägitakse endiselt „60-vatisest lambist\" – see on harjumus, mitte mõõt.",
  /**
   * Mida see moodul EI räägi. Aus vastus on tähtis: elektriarve on ahvatlev
   * jätk, aga ta on nimeliselt ploki P6 mooduli `voimsus-elus` sisu.
   */
  notInThisModule:
    "Kui palju lamp elektriarvel maksab, siin ei arvutata. See on plokk P6 (moodul „Võimsus elus\"), kus tuleb kilovatt-tund. Kui õpilane küsib, on aus vastus „selle arvutame ära, kui jõuame võimsuse ja energiani\". Kui see moodul teeks elektriarve ära, jääks P6 moodul tühjaks.",
  /**
   * CRI – mainimiseks, mitte arvutamiseks (mooduli piirid).
   */
  criNote:
    "Kaks sama värvustemperatuuriga lampi võivad värve päris erinevalt näidata – odava lambi all paistavad riided ja toit tuhmid. Pakendil on see arv Ra või CRI (hea on üle 90). Ekraanil seda arvu ei ole ja moodul ei arvuta teda: värvusesitus nõuaks spektri mõõtmist.",
  /**
   * Kus simulatsioon ja päris tuba lahku lähevad – ütle see ETTE.
   *
   * model.ts idealiseeringud 1, 2, 5 ja 6.
   */
  whyRealDiffers:
    "Mudel korrutab pindala ja soovitatava tiheduse – see on taskuarvutusreegel, mitte valgustusprojekt. Päris valgusti varjund, tolm ja suund söövad osa valgusest ära (kasutustegur on tihti 0,5…0,8) ja tume sisustus neelab valgust; lambi all on heledam ja nurgas hämaram, seepärast kasutataksegi mitut valgustit. Päris LED-ide viljakus on 60…160 lm/W, nii et tabeli 100 lm/W on SUURUSJÄRK. Valgustussoovitused ise on ümarad kokkulepped ja sõltuvad vanusest – vanem silm vajab rohkem valgust.",
  discussionQuestions: [
    "Miks kasutatakse tänavavalgustuses tihti kollakat valgust?",
    "Miks on operatsioonivalgustil väga suur luumenite arv ja väga hea värvusesitus?",
    "Miks soovitatakse õhtul telefoniekraani „öörežiimi\" (soojem toon)?",
    "Miks vajab vanem inimene lugemiseks rohkem valgust kui laps?",
  ],
  /**
   * Millal see moodul tunnis: kohe pärast moodulit `valgusallikad` – see on sama
   * tunni teine pool. Uut füüsikat siin ei ole, on ainult ülekanne.
   */
  whenInLesson:
    "Kohe PÄRAST moodulit „Valgusallikad\" – see on sama tunni teine pool. Uut füüsikat siin ei tule, on ainult ülekanne, seega sobib moodul ka koduseks tööks. Kodulampide võrdlus on loomulik kodune ülesanne, mille tulemused vaadatakse järgmises tunnis koos üle.",
  tip: "Kõige tähtsam liigutus simulatsioonis on ruuminupu vahetamine: sama 800 lm lamp on õppelaual peaaegu piisav ja elutoas selgelt hämar. Sealt tuleb mooduli teine üllatus – „palju luumeneid\" ei ole omadus, mis lambil üksi olla saaks, ta on alati ruumi kohta.",
  /**
   * Summa peab andma manifest.minutes.lesson (15 min). 45-minutilises tunnis
   * mahub ette moodul „Valgusallikad" ja lõppu palja pirni katse.
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
      id: "vatt-on-heledus",
      description: "Õpilane arvab, et vatt ütleb, kui hele lamp on.",
      remedy:
        "Predict-1 ja teooria tabel: 8 W LED annab 800 lm, 60 W hõõglamp 720 lm – väiksem vattide arv, rohkem valgust. Exit-1 kordab sama küsimust pakendi lugemisena. Klassis: pange kaks kodust lampi kõrvuti ja lugege mõlemalt kolm arvu.",
    },
    {
      id: "vastab-on-tapne",
      description:
        "Õpilane arvab, et „vastab 60 W lambile\" tähendab täpselt sama valgusvoogu.",
      remedy:
        "Predict-1 kolmas variant ja teooria: 800 lm vs 720 lm. „Vastab\" on ümar lubadus, luumenid ütlevad täpselt. Hea klassiküsimus: kumb annab rohkem valgust ja kui palju?",
    },
    {
      id: "kelvin-on-lambi-temperatuur",
      description: "Õpilane arvab, et 6500 K lamp läheb 6500 kraadi kuumaks.",
      remedy:
        "Teooria, practice-3 ja exit-3: kelvin kirjeldab valguse VÄRVI – millise temperatuuriga hõõguv keha annaks sellist valgust. LED ise on käega katsudes leige. Kuum läheb hoopis hõõglamp, mille valgus on 2700 K ehk „soe\".",
    },
    {
      id: "kelvin-on-heledus",
      description: "Õpilane arvab, et suurem kelvin tähendab heledamat lampi.",
      remedy:
        "Practice-3 kolmas variant ja exit-1: kelvin on värv, heledus on luumenites. Simulatsioonis muuda ainult värvustemperatuuri – soovitatav valgusvoog ei liigu paigast.",
    },
    {
      id: "soe-tahendab-suurt-arvu",
      description:
        "Õpilane ootab, et „külm valge\" oleks väiksem arv kui „soe valge\".",
      remedy:
        "Teooria ütleb selle otse välja ja explore-3 laseb mõlemad sildid ise ekraanile tuua. Sõnastuseks: nimi käib TUNDE kohta, arv aga hõõguva keha temperatuuri kohta – ja need kaks käivad vastupidi.",
    },
    {
      id: "uks-lamp-piisab",
      description:
        "Õpilane arvab, et üks tavaline lamp valgustab iga toa või tööpinna ära.",
      remedy:
        "Explore-2: elutuppa on vaja 2700 lm ehk nelja 800 lm lampi (2700 / 800 ≈ 3,4 – kolmest jääb puudu). Sama silt on explore-4 lõksu all: kes valgusvoo liugurit ei liiguta, kirjutab kastikesest maha algseisu 8 W ehk ühe tavalise LED-lambi – aga õppelauale soovitatakse 1000 lm, milleks kulub 10 W. Klassis: lugege kokku, mitu valgustit on klassiruumi laes.",
    },
    {
      id: "rohkem-on-alati-parem",
      description: "Õpilane arvab, et mida rohkem luumeneid, seda parem.",
      remedy:
        "Practice-4: magamistuppa 3000 lm on liig – seal piisab umbes 100 lm ruutmeetri kohta. Loeb ruumi TEGEVUS, mitte suurim arv. Sama näitab simulatsioon: vaheta ruumi ja vaata, kuidas soovitus muutub.",
    },
    {
      id: "iga-valgus-sobib-igale-poole",
      description:
        "Õpilane arvab, et valguse värv on maitseasi ja füüsikaga seost pole.",
      remedy:
        "Explore-3 ja practice-4: õppimiseks ja tööks soovitatakse neutraalset valget, magamistuppa sooja. Teooria joonis näitab sama tuba kolme värvustemperatuuriga. Klassis: paberileht kahe eri valgusti all, pildistatuna.",
    },
    {
      id: "paljas-pirn-sobib",
      description: "Õpilane arvab, et varjund on ainult ilu pärast.",
      remedy:
        "Teooria ja practice-4: paljas pirn on väike allikas – ta pimestab ja annab teravad varjud. Varjund teeb temast laiendatud allika (moodul „Valgusallikad\"). Klassis: palja pirni ja varjundiga lambi katse pliiatsi varjuga.",
    },
    {
      id: "led-on-noruk",
      description:
        "Õpilane arvab, et LED on nõrk lamp, sest tal on vähe vatte.",
      remedy:
        "Predict-1 ja lahendatud näidis: LED teeb samast elektrist umbes kaheksa korda rohkem valgust (100 lm/W vs 12 lm/W). Ükski valikvastus seda ei püüa – see tuleb ARVUTUSEST, seega esita see klassis ise küsimusena: „kumb lamp on nõrgem, 8 W või 60 W?\"",
    },
  ] satisfies Misconception[],
};
