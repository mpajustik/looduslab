/**
 * Õpetajajuhend (docs/MOODULILEPING.md „teacher.ts",
 * sisu/MOODUL-valguse-sirgjooneline-levimine.md „Õpetajale").
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
  /** Vahendid nõelaugukaamera jaoks (sisu/MOODUL-valguse-sirgjooneline-levimine.md). */
  equipment: [
    "Kingakarp või papptoru",
    "Alumiiniumfoolium ja nööpnõel",
    "Küpsetuspaber",
    "Must teip",
    "Küünal või pime tuba akna vastas",
  ],
  /**
   * Ohutus on siin kahes tükis ja mõlemad on olulised: silm ei satu KUNAGI
   * augu ja Päikese sihti, aga karpi ennast tohib Päikese poole suunata – nii
   * ongi ta mõeldud päikesekujutist tegema. Kujutist vaadatakse ainult
   * küpsetuspaberilt.
   */
  safety:
    "Läbi augu ei vaadata kunagi Päikese poole – silm jääb alati augu ja Päikese sihist eemale. Karbi tohib Päikese poole suunata, aga kujutist vaadatakse ainult küpsetuspaberilt. Küünlaga töötades pikad juuksed kinni ja karp leegist eemal.",
  tip: "Lõika karbi ühte otsa auk, katta fooliumiga ja torka nööpnõelaga auk; teise otsa küpsetuspaber, servad musta teibiga valguskindlaks. Vaata pimedas toas põleva küünla või valge akna poole. Lase simulatsioon läbida ENNE päris katset – siis on õpilasel ennustus (kas kujutis on pea peal?) juba olemas ja karp kontrollib teda.",
  discussionQuestions: [
    "Miks on nõelaugukaamera pilt hämar?",
    "Mis juhtub kujutisega, kui teha fooliumisse teine auk?",
    "Miks on aknaluukide praost tuppa paistev laik akna kujutis alles siis, kui sein on kaugel?",
  ],
  /**
   * Viie minutiga õue: pildistage laike telefoniga ja võrrelge neid lehtede
   * vahede kujuga. Osalise päikesevarjutuse päeval on see sama katse kogu kooli
   * jaoks – laigud lähevad poolkuu kujuliseks (väljumispileti 3. küsimus).
   */
  fieldwork:
    "Päikeselaigud: minge puu alla, pildistage laike ja võrrelge lehtede vahede kujuga. Sama katse osalise päikesevarjutuse ajal näitab poolkuu kujulisi laike.",
  /**
   * Summa peab andma manifest.minutes.lesson (15 min). Hook ja teooria käivad
   * ühe 2-minutilise plokina (spetsifikatsiooni „Tunniplaan"), aga plaanis on
   * nad eraldi ridadena – nii klapib rida sammuga.
   *
   * 45-minutilises tunnis järgneb sellele moodul `vari-ja-poolvari`.
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
      id: "kiir-on-asi",
      description:
        "Õpilane arvab, et valguskiir on päriselt olemas – õhuke valguse niit, mida saaks põhimõtteliselt pihku võtta.",
      remedy:
        "Päriselt levib VIHK: taskulambi koonus udus on nähtav ja laiali. Kiir on joonise abijoon, millega me näitame, mis sihis vihk läheb. Küsi: kui palju kiiri lähtub küünlast? Lõpmata palju – me joonistame neist kaks.",
    },
    {
      id: "pea-peal-vajab-laatse",
      description:
        "Õpilane arvab, et tagurpidi kujutise saab ainult läätsega, sest kaamerates ja luupides on klaas.",
      remedy:
        "Lase joonistada kaks kiirt: tipust ja jalalt. Mõlemad lähevad läbi SAMA augu, seega tipu kiir jõuab alla ja jala oma üles. Ainus kasutatud reegel oli sirgjooneline levimine – klaasi ei olnud vaja. Ütle täpselt: koondav lääts moodustab kaameras samuti pea peal kujutise, aga ümberpööramiseks EI OLE teda vaja. Lääts annab juurde heleduse ja teravuse.",
    },
    {
      id: "auk-annab-augu-kuju",
      description:
        "Õpilane arvab, et laigu kuju maapinnal tuleb augu kujust – sakiline vahe peaks andma sakilise laigu.",
      remedy:
        "Laik on ALLIKA kujutis, mitte augu kuju. Katse: torka papi sisse kolmnurkne auk ja vaata laiku kaugelt seinalt – ta on ikka ümmargune, sest Päike on ümmargune. Päris lähedal (paberit augu vastas hoides) näed seevastu augu kuju – seal ei ole kujutis veel tekkinud.",
    },
    {
      id: "suurem-auk-suurem-kujutis",
      description:
        "Õpilane arvab, et suurem auk teeb kujutise suuremaks – rohkem valgust, suurem pilt.",
      remedy:
        "Näita simulatsioonis: kujutise kõrgus ei muutu üldse, kui augu läbimõõtu keerata. Suurus sõltub ainult kaugusest ja kambri sügavusest. Suurem auk laseb läbi rohkem valgust (heledam) ja iga eseme punkt joonistab suurema laigu (udusem).",
    },
    {
      id: "valgus-alati-sirge",
      description:
        "Õpilane võtab sirgjoonelisuse igavese reeglina ja ei märka tingimust „ühtlases keskkonnas“.",
      remedy:
        "Küsi, kus ta on näinud, et kauge pilt „ujub“ – kuuma asfaldi või lõkke kohal. Seal on õhk eri kohtades eri tihedusega, seega keskkond ei ole ühtlane ja tee kõverdub. Klaasis ja vaakumis, kui nad on ühtlased, levib valgus ikka sirgelt.",
    },
    {
      // Ülesannetes lõksu ei ole, aga vastuste seas on see kõige sagedasem
      // näpuviga – õpetaja tunneb ta ära, kui teab, mida otsida.
      id: "tehe-tagurpidi",
      description:
        "Õpilane jagab kambri sügavuse kaugusega ja korrutab eseme kõrgusega vales järjekorras – vastuseks tuleb kujutis, mis on esemest suurem.",
      remedy:
        "Küsi enne arvutamist üks küsimus: kas kujutis peab tulema esemest suurem või väiksem? Kamber on kaugusest lühem, seega väiksem. Kui vastuseks tuleb 6 m kõrge puu kohta meetrites mõõdetav kujutis, on tehe tagurpidi.",
    },
  ] satisfies Misconception[],
};
