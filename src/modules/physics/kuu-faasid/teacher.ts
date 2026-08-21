/**
 * Õpetajajuhend (docs/MOODULILEPING.md „teacher.ts",
 * sisu/MOODUL-kuu-faasid.md „Õpetajale").
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
  /**
   * (K) Kuu vaatlemine kahe nädala jooksul – kõige väärtuslikum kodutöö selle
   * teema juures ja ainus asi, mida ekraan ei asenda. See EI ole ainekava
   * praktiline töö (manifest.practicalWork on tühi), vaid vaatlusmaterjal.
   */
  moonObservation:
    "Iga õpilane joonistab paberile umbes iga teine õhtu Kuu kuju ja kirjutab kuupäeva ning kellaaja. Kahe nädala pärast on klassis 8–10 joonist, mille saab ritta panna. Vihje õpilasele: Kuu on nähtav ka päeval – kasvavat Kuud otsi pärastlõunal idataevast, kahanevat hommikul läänest.",
  /**
   * (K) apelsin ja lambike – kogu simulatsioon päris asjadena. Simulatsioon
   * ENNE ja apelsinikatse PÄRAST: apelsinikatses ei ole ülaltvaadet ja
   * õpilane ei näe, et valgustatud pool on kogu aeg sama suur – seda näitab
   * ainult ekraan. Ekraan annab ülaltvaate, apelsin annab kehalise kogemuse.
   */
  orangeAndLampActivity:
    "Pime klass, üks lamp (Päike), õpilane hoiab apelsini (Kuu) käes ja keerab end aeglaselt ringi, apelsin kogu aeg peast veidi kõrgemal. Tema pea on Maa. Apelsin läbib ise kõik faasid ja iga õpilane näeb seda oma silmaga – see katse veenab paremini kui ükski joonis. Kui apelsin juhtub täpselt varju sattuma (õpilase enda pea vari), on see just kuuvarjutus – ja see näitab, miks apelsinit tuleb hoida veidi kõrgemal: päris Kuu rada on samamoodi viltu.",
  /**
   * Millal see moodul tunnis: PÄRAST moodulit `varjutused` – siis on „Maa
   * vari” konkreetne asi, millele saab osutada, mitte ähmane mälestus.
   */
  whenInLesson:
    "PÄRAST moodulit `varjutused`. Faasi ja varjutuse eristamine on lihtsam, kui varjutus on äsja läbi võetud.",
  /**
   * Terminoloogialõks: õpik ja kalender kasutavad sõna „noorkuu” erinevalt
   * (sisu/MOODUL-kuu-faasid.md „Terminoloogia").
   */
  terminologyWarning:
    "Õpikus (ptk 1.8) on faaside loend „kuu loomine, noorkuu, täiskuu, vanakuu” – seal tähendab noorkuu KASVAVAT Kuud, mitte nähtamatut. Kalendrites ja astronoomias tähendab noorkuu enamasti just nähtamatut Kuud. Rakendus kasutab meelega kirjeldavaid nimesid (kuuloomine, kasvav sirp, esimene veerand jne) ja ükski hinnatav küsimus ei rippu sõna „noorkuu” küljes. Kui õpilane seda sõna kasutab, küsi üle, kumba ta mõtles – see ise on hea arutelu.",
  discussionQuestions: [
    "Mis kellaajal on täiskuu taevas kõige kõrgemal? (Keskööl – täiskuu on Päikesele vastaspoolel, seega ta tõuseb päikeseloojangul ja loojub päikesetõusul. Simulatsioonist seda välja lugeda EI saa – kellaaeg nõuab Maa pöörlemist ja vaatleja horisonti, mida ülaltvaade ei kujuta.)",
    "Mida näeb Kuu peal seisev astronaut siis, kui Maal on täiskuu? (Pimedat Maad – Maa on tema jaoks Päikese ja tema vahel, valgustatud pool ära pööratud. Faasid on täpselt vastupidised.)",
    "Kui Kuu tiirleks ümber Maa kaks korda kiiremini, kui pikk oleks faaside tsükkel? (Ligi kaks korda lühem – aga mitte täpselt, sest Maa liigub ikka edasi.)",
    "Miks paistab sirbikujuline Kuu tavaliselt madalal horisondi lähedal ja alati Päikese suunas? (Sirp tähendab, et Kuu on taevas Päikese lähedal – sellepärast ongi teda näha ainult vahetult pärast päikeseloojangut või enne tõusu.)",
  ],
  /**
   * Summa peab andma manifest.minutes.lesson (15 min).
   */
  lessonPlan: [
    { step: "hook + theory", minutes: 2 },
    { step: "predict", minutes: 2 },
    { step: "explore", minutes: 5 },
    { step: "practice", minutes: 4 },
    { step: "exit", minutes: 2 },
  ] satisfies LessonPlanItem[],
  misconceptions: [
    {
      id: "kuu-faas-on-vari",
      description: "Kuu kuju muutub, sest Maa vari katab osa Kuust.",
      remedy:
        "Explore-3: lisavõimalus „Maa vari” näitab, et vari on orbiidil ühesainsas kohas (1,4° kogu 360°-st) ja sedagi täiskuu juures, kus Kuu on kõige TÄIEM. Practice-1 näidis ja practice-4 kordavad seda. Sama silt on kasutusel moodulis `varjutused` – seal tõmmatakse piir, siin lükatakse ümber.",
    },
    {
      id: "paike-valgustab-vahem",
      description: "Päike valgustab Kuust eri aegadel eri suurt osa.",
      remedy:
        "Teooria ja joonis „kf-valgustatud-pool”: valgustatud pool on kõigis neljas asendis sama suur. Explore ülaltvaade näitab seda liuguri iga asendi juures.",
    },
    {
      id: "kasvav-kahanev-segamini",
      description: "Kasvavat ja kahanevat Kuud ei saa vaadates eristada, sest kuju on sama.",
      remedy:
        "Explore-2: 90° ja 270° annavad mõlemad 50%, aga valgustatud on eri külg. Practice-2 küsib seda joonisel; `terminatorFactor` märgivahetus on mudelis testitud.",
    },
    {
      id: "kuu-tume-pool",
      description: "Kuu tagumine pool on igavesti pime.",
      remedy:
        "Teooria: Kuu pöörab meie poole sama külge, aga ka teisel pool vahelduvad päev ja öö – ta on KAUGEM pool, mitte pime pool. Practice-4 kontrollib.",
    },
    {
      id: "faas-ja-tiirlemisaeg",
      description: "Faaside tsükkel kestab 27,3 päeva (nagu tiir ümber Maa).",
      remedy:
        "Teooria seletab, miks 29,5 ja mitte 27,3 (Maa liigub ise edasi, Kuu peab järele jõudma). `SYNODIC_MONTH_DAYS` on mudelis ARVUTATUD, mitte kirjutatud. Practice-3 kasutab seda.",
    },
  ] satisfies Misconception[],
};
