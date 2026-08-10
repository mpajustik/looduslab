/**
 * Õpetajajuhend (docs/MOODULILEPING.md „teacher.ts",
 * sisu/MOODUL-valgusallikad.md „Õpetajale").
 *
 * See fail EI ole osa moodulilepingu (contract.ts) tüüpidest – engine ei loe
 * teda kunagi ja checker ei kontrolli tema järgi vastuseid. Ta on inimesele
 * mõeldud materjal õpetaja töölaual.
 *
 * `misconceptions` id-d vastavad TÄPSELT `activities.ts` küsimuste
 * `misconception` siltidele – uue lõksvastuse lisamisel lisa ka siia kirje,
 * muidu jääb õpetaja väärarusaamast teadmatusse. Kooskõla valvab test.
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
  /** Vahendid päris katseks (sisu/MOODUL-valgusallikad.md „Õpetajale"). */
  equipment: [
    "Taskulamp või telefonituli",
    "Hajuti: küpsetuspaberi leht või matt kilekott – hoitakse lambi EES, mitte lambi ümber",
    "Pliiats",
    "Valge paberileht",
  ],
  /**
   * Hajutit EI mähita lambi ümber ja lampi ei kaeta kinni: kuum lamp ja tema
   * vastu surutud plast on tuleoht, ka siis kui katse kestab minuti
   * (CodeRabbiti ülevaatuse leid 2026-08-10). Optikast ei jää midagi puudu –
   * hajuti töötab ühtemoodi, olgu ta lambi küljes või tema ees õhus.
   */
  safety:
    "Päikesesse ega taskulambi LED-i EI vaadata otse. Hajutit hoitakse lambi ees õhus – lampi ei kaeta kinni ega mähita millegagi ümber. Laserit selles tunnis ei kasutata.",
  /**
   * Miks simulatsioon eelneb päris katsele: õpilane ennustab enne, kumb vari
   * tuleb teravam, ja kontrollib siis paberil.
   */
  tip: "Hoia pliiatsit paberi kohal ja valgusta esmalt palja LED-iga – vari on terav. Hoia siis teise käega hajutit lambi ja pliiatsi vahel (lampi puudutamata) ja valgusta uuesti – vari muutub uduseks. Küsi, kumb allikas oli punktallikale lähemal. Lase simulatsioon läbida ENNE seda katset, siis on õpilasel ennustus juba olemas.",
  discussionQuestions: [
    "Miks öeldakse, et Kuu „paistab“, aga lambi kohta öeldakse, et ta „põleb“?",
    "Miks on operatsioonilambil palju väikeseid LED-e, mitte üks suur pirn?",
    "Mis juhtuks, kui Maalt lahkuv pikalaineline soojuskiirgus jääks kinni?",
  ],
  /**
   * Summa peab andma manifest.minutes.lesson (15 min). Hook ja teooria käivad
   * ühe 2-minutilise plokina (sisu/MOODUL-valgusallikad.md „Tunniplaan"), aga
   * plaanis on nad eraldi ridadena – nii klapib rida sammuga.
   *
   * 45-minutilises tunnis järgneb sellele moodul `lambivalik` või
   * `vari-ja-poolvari`.
   */
  lessonPlan: [
    { step: "hook", minutes: 1 },
    { step: "theory", minutes: 1 },
    { step: "predict", minutes: 2 },
    { step: "explore", minutes: 4 },
    { step: "practice", minutes: 4 },
    { step: "exit", minutes: 3 },
  ] satisfies LessonPlanItem[],
  misconceptions: [
    {
      id: "kuu-on-valgusallikas",
      description:
        "Õpilane peab valgusallikaks kõike, mis öösel heledana paistab – Kuud, helkurit, peeglit.",
      remedy:
        "Küsi iga keha kohta: kas ta jääks pimedas ka siis heledaks, kui KÕIK muud tuled kustuksid? Valgusallikas kiirgab ISE, ülejäänud ainult peegeldavad võõrast valgust.",
    },
    {
      id: "suurus-ilma-kauguseta",
      description:
        "Õpilane arvab, et punktallikas tähendab lihtsalt väikest keha: Päike on suur, seega laiendatud allikas.",
      remedy:
        "Punktallikaks olemine on keha JA vaatluskoha suhte omadus. Näita simulatsioonis, kuidas sama päevavalgustoru muutub kaugenedes punktallikaks – keha ise ei muutunud milligrammigi.",
    },
    {
      id: "kulm-valgus-varvus",
      description:
        "Õpilane arvab, et „külm valgusallikas“ tähendab sinakat või jaheda tooniga valgust.",
      remedy:
        "Külm tähendab, KUIDAS valgus tekib: allikas kiirgab ilma hõõguma minemata (luminestsents). Sinakas valgus tuleb hoopis KÕRGEST temperatuurist – seega soojuslikust allikast.",
    },
    {
      id: "led-ei-soojene-uldse",
      description:
        "Õpilane arvab, et külm valgusallikas ei soojene üldse ja on alati puutel jahe.",
      remedy:
        "Ütle täpselt: külm allikas kiirgab valgust ilma hõõgumata, aga natuke soojust tekib igal lambil – LED-lambi jalg läheb pikal põlemisel leigeks. Kuuma lampi ei lasta katsuda; küsi selle asemel, kas keegi on seda kodus märganud.",
    },
    {
      id: "soojuslik-kulmaks",
      description:
        "Õpilane liigitab soojusliku allika (küünlaleek, hõõglamp, Päike) külmaks – tavaliselt seepärast, et valgus tundub kollane ja pehme või allikas on kaugel.",
      remedy:
        "Küsi ühte asja: kas see keha on kuum? Küünlaleek, hõõgniit ja Päike on kõik üle 600 °C ja kiirgavad just sellepärast. Kaugus ei muuda allika kiirgamise VIISI, ainult tema näivat suurust.",
    },
    {
      id: "punktallikas-uks-kiir",
      description:
        "Õpilane arvab, et punktvalgusallikas kiirgab ainult ühte kiirt (nagu jooniste ainus nool).",
      remedy:
        "Punktallikas kiirgab kiiri KÕIKIDESSE suundadesse – joonisele joonistatakse neist ainult üks või kaks, sest kõiki ei jõuaks. „Punkt“ käib allika näiva SUURUSE, mitte kiirte arvu kohta.",
    },
    {
      // Asendas väärarusaama `poolnurk-unustatud` (arkustangensi poolitamine):
      // moodul ei küsi enam nurka, vaid suhet, ja tüüpiline viga on nüüd see,
      // et jagatakse valetpidi. Silt jäi õpetajajuhendisse, sest õpetaja tunneb
      // selle vastuste seast ära – ülesannetes lõksu ei ole.
      id: "suhe-tagurpidi",
      description:
        "Õpilane jagab mõõtme kaugusega, mitte kauguse mõõtmega – vastuseks tuleb 0,005 ja ta järeldab, et allikas on „väga väike ehk punktallikas“.",
      remedy:
        "Küsi, mida arv tähendab: „mitu korda mahub allikas kauguse sisse?“ Suur arv tähendab, et allikas on kauguse kõrval tilluke. Kui vastuseks tuleb nullilähedane murd, on jagamine tagurpidi.",
    },
  ] satisfies Misconception[],
};
