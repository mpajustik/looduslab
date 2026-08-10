/**
 * Õpetajajuhend (docs/MOODULILEPING.md „teacher.ts“,
 * sisu/MOODUL-vari-ja-poolvari.md „Õpetajale“).
 *
 * See fail EI ole osa moodulilepingu (contract.ts) tüüpidest – engine ei loe
 * teda kunagi ja checker ei kontrolli tema järgi vastuseid. Ta on inimesele
 * mõeldud materjal õpetaja töölaual.
 *
 * `misconceptions` id-d vastavad TÄPSELT `activities.ts` küsimuste
 * `misconception` siltidele – uue lõksvastuse lisamisel lisa ka siia kirje,
 * muidu jääb õpetaja väärarusaamast teadmatusse. Kooskõla valvab test.
 *
 * **Siin on ainekava praktiline töö P1-PT1 päris kujul.** Simulatsioon üksi
 * teda ei kata: ainekava nõuab hüpoteesiga uurimist ja päris mõõtmist, seega
 * on `procedure` sama tähtis kui explore-samm ja mitte lisavõimalus.
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
  /** (K) P1-PT1 vahendid (sisu/MOODUL-vari-ja-poolvari.md „Õpetajale“). */
  equipment: [
    "Väike LED-taskulamp (punktvalgusallikas)",
    "Matt klaasiga öölamp või telefoniekraan valgel taustal (laiendatud allikas)",
    "Pingpongipall või mandariin pulga otsas",
    "Valge paber või sein ekraaniks",
    "Joonlaud ja mõõdulint",
    "Pime tuba",
  ],
  /**
   * Ohutus: taskulamp on nõrk, aga silma suunatuna ikkagi ebameeldiv, ja
   * laserit EI kasutata selles katses üldse – ka mitte osutamiseks. Laseriga
   * „näitamine“ on täpselt see hetk, kus keegi vaatab kogemata sisse.
   */
  safety:
    "Taskulambiga ei valgustata kellelegi silma. Lasereid selles katses EI kasutata, isegi mitte osutamiseks.",
  /**
   * Katse käik hüpoteesiga, nagu ainekava P1-PT1 nõuab.
   *
   * **Kõiki kaugusi mõõdetakse LAMBIST, mitte pallist** – see on sama
   * kokkulepe, mis simulatsioonis (`a` ja `b`, vt model.ts) ja ainult nii
   * tuleb varju kahekordistumine mõõtes välja: 2 m / 1 m = 2 ja 4 m / 1 m = 4.
   * Pallist mõõtes annaks sama katse 1 m ja 3 m ehk kolmekordse varju ja
   * õpilase tabel ei klapiks simulatsiooniga.
   */
  procedure: [
    "Kirjuta hüpotees: mis juhtub varjuga, kui allikas läheb laiemaks?",
    "Taskulambiga: jäta pall 1 m kaugusele lambist ja mõõda täisvarju laius, kui ekraan on 2 m ja siis 4 m kaugusel LAMBIST. Vari peab minema kaks korda laiemaks.",
    "Vaheta taskulamp telefoniekraani vastu samale kohale ja mõõda uuesti.",
    "Leia varju serva juurest poolvari ja mõõda selle laius.",
    "Võrdle tulemust oma hüpoteesiga.",
  ],
  tip: "Lase simulatsioon läbida ENNE päris katset – siis on õpilasel ennustus (mis juhtub laia allikaga?) juba olemas ja taskulamp ning telefoniekraan kontrollivad teda. Pime tuba on kohustuslik: hämaras toas ujub poolvari toa muu valguse sisse ära.",
  /**
   * Miks päris mõõtmine erineb simulatsioonist – see EI ole viga, vaid
   * arutelu koht. Simulatsioon on ideaalne (model.ts ei tekita müra), päris
   * katses on poolvarju piir sujuv ja iga õpilane loeb ta natuke erinevalt.
   */
  whyRealDiffers:
    "Simulatsioonis on servad matemaatiliselt täpsed, päris katses on poolvarju piir sujuv ja iga õpilane loeb selle natuke erinevalt. Arutage, kust täpselt „poolvari lõpeb“ ja kui palju rühmade tulemused erinevad – hajuvus ise on tulemus, mitte äpardus.",
  discussionQuestions: [
    "Miks on operatsioonilampides palju väikseid valgusteid?",
    "Miks on päevavalguslambiga ruumis varjud pehmed?",
    "Miks panevad fotograafid välklambi ette valge riide?",
    "Kui Päike on nii tohutult suur, miks on meil siis üldse teravat varju?",
  ],
  /**
   * Viie minutiga õue: seisa päikesepaistes asfaldil ja vaata oma varju.
   * Jalgade juures on serv nuga-terav, pea juures laiaks määrdunud – täpselt
   * see, mille kohta hook küsib ja mille harjutus practice-2 seletab.
   */
  fieldwork:
    "Oma vari asfaldil: mõõtke joonlauaga, kui lai on varju hägune serv jalgade juures ja kui lai pea juures. Sama vari, sama Päike – vahe tuleb ainult kaugusest maapinnani.",
  /**
   * Summa peab andma manifest.minutes.lesson (20 min). Hook ja teooria käivad
   * spetsifikatsioonis ühe 2-minutilise plokina, aga plaanis on nad eraldi
   * ridadena – nii klapib rida sammuga.
   *
   * 45-minutilises tunnis eelneb sellele `valguse-sirgjooneline-levimine` ja
   * järgneb päris katse (`procedure`).
   */
  lessonPlan: [
    { step: "hook", minutes: 1 },
    { step: "theory", minutes: 1 },
    { step: "predict", minutes: 3 },
    { step: "explore", minutes: 7 },
    { step: "practice", minutes: 5 },
    { step: "exit", minutes: 3 },
  ] satisfies LessonPlanItem[],
  misconceptions: [
    {
      id: "vari-on-asi",
      description:
        "Õpilane arvab, et vari on midagi, mis kehast välja tuleb või kehal küljes on – „pall teeb varju“.",
      remedy:
        "Vari on RUUMI PIIRKOND, kuhu valgus ei jõua. Varju „ei tehta“, vaid valgus jääb tulemata. Küsi: kus on palli vari, kui lamp on välja lülitatud? Teda ei ole – ja pall on ikka alles.",
    },
    {
      id: "poolvari-on-pool",
      description:
        "Õpilane arvab, et poolvari on pool varjust või poolik täisvari – nimi ütleb ju „pool“.",
      remedy:
        "Poolvari on ala, kust paistab allika ÜKS OSA. Tema laiust määrab allika laius, mitte „pool millestki“ – seda näitab explore-1 (punktallikaga on poolvari täpselt 0) ja väljumispileti esimene küsimus. Lase õpilasel end poolvarju kujutleda: lambist paistab tükk, ülejäänu on palli taga peidus.",
    },
    {
      id: "vari-sama-suur-kui-keha",
      description:
        "Õpilane arvab, et vari on alati keha suurune – 10 cm pall annab 10 cm varju.",
      remedy:
        "Simulatsioon explore-1: punktallikaga on 10 cm pall 3 m peal juba 30 cm vari. Sõnadega: vari on sama palju kordi laiem kui keha, kui palju kordi on ekraan kaugemal kui keha.",
    },
    {
      id: "laiem-allikas-laiem-vari",
      description:
        "Õpilane arvab, et laiem lamp teeb ka täisvarju laiemaks – või (sagedasem variant) et allika laius muudab ainult serva ja jätab täisvarju endiseks. Mõlema juur on sama: allika laiust ei seostata täisvarju laiusega.",
      remedy:
        "Laiem allikas SÖÖB täisvarju mõlemalt poolt, kuni see kaob – explore-2 (5 cm lamp: 30 cm asemel 20 cm) ja explore-3 (20 cm lamp: täisvari kaob 2 m peal). Joonisel on näha, miks: allika kumbki serv paistab palli tagant natuke mööda.",
    },
    {
      id: "hagu-tuleb-silmast",
      description:
        "Õpilane otsib hägusale servale põhjust mujalt kui varju geomeetriast: silma või kaamera viga, „valgus jõuab kaugemale nõrgemini“, õhk vahel. Ühine juur on see, et poolvarju ei peeta arvutatavaks suuruseks.",
      remedy:
        "Simulatsiooni joonisel on poolvari kiirtega välja joonistatud ja tema laius on arvutatav arv – hägu ei ole „ebateravus“, vaid piirkond, kust paistab osa allikast. Kaamera näeb sedasama. Valguse tugevus siin midagi ei muuda: hämara ja ereda lambi poolvari on ühesuguse laiusega, kui lambid on sama laiad.",
    },
    {
      id: "punktallikas-annab-poolvarju",
      description:
        "Õpilane arvab, et igal varjul on hägune serv – poolvari peab alati olemas olema.",
      remedy:
        "Explore-1: punktallikaga on poolvari täpselt 0 cm ja seda näitab simulatsioon ise. Poolvari on LAIENDATUD allika tunnus; kus allikal ei ole laiust, ei ole ka kohta, kust „pool valgust“ paistaks.",
    },
  ] satisfies Misconception[],
};
