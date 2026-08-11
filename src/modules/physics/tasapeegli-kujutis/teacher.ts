/**
 * Õpetajajuhend (docs/MOODULILEPING.md „teacher.ts",
 * sisu/MOODUL-tasapeegli-kujutis.md „Õpetajale").
 *
 * See fail EI ole osa moodulilepingu (contract.ts) tüüpidest – engine ei loe
 * teda kunagi ja checker ei kontrolli tema järgi vastuseid. Ta on inimesele
 * mõeldud materjal õpetaja töölaual.
 *
 * `misconceptions` id-d vastavad TÄPSELT `activities.ts` küsimuste
 * `misconception` siltidele – uue lõksvastuse lisamisel lisa ka siia kirje,
 * muidu jääb õpetaja väärarusaamast teadmatusse. Kooskõla valvab test.
 *
 * **Siin on ainekava praktiline töö P1-PT4 päris kujul.** Simulatsioon üksi
 * teda ei kata: ainekava nõuab hüpoteesiga uurimist ja päris mõõtmist, seega
 * on `procedure` sama tähtis kui explore-samm ja mitte lisavõimalus.
 *
 * Sammuviited (explore-3, practice-1 jne) on ACTIVITIES.TS id-d, mitte
 * spetsifikatsiooni loendinumbrid – spetsis on lahendatud näidis esimene
 * punkt, koodis ei ole ta küsimus ja seega ei ole tal id-d.
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
  /** (K) P1-PT4 vahendid (sisu/MOODUL-tasapeegli-kujutis.md „Õpetajale"). */
  equipment: [
    "Seinapeegel või vähemalt 40 cm käsipeegel, mis saab seina najale kindlalt toetuda",
    "Maalriteip (kleepub nõrgalt ja tuleb peeglilt jäljetult ära)",
    "Mõõdulint",
    "Paariline, kes teibitükke kleebib",
  ],
  /**
   * Ohutus. Peegel on selle katse ainus vahend ja ka ainus oht: klaasi serv
   * lõikab ja pragunenud peegel puruneb liigutamisel edasi.
   */
  safety:
    "Käsipeegli servad katke teibiga. Peeglit ei kanta lahtiselt ega panda põrandale, kuhu keegi peale astub. Pragunenud peegliga katset EI tehta.",
  /**
   * **Maalriteip, mitte pakketeip.** Tavaline kleeplint jätab peeglile liimi
   * ja koolipeegel on tavaliselt kellegi teise oma – see ei ole pisiasi, vaid
   * põhjus, miks katse teist korda teha ei lubata.
   */
  procedure: [
    "Kirjuta hüpotees: kui kõrge peegel on sulle täies pikkuses nägemiseks vaja?",
    "Seisa peegli ette 1 m kaugusele. Paariline kleebib peeglile ühe teibitüki sinna, kus sa NÄED oma pealage, ja teise sinna, kus näed oma jalataldu (väikese peegli puhul kõige alumist nähtavat kohta).",
    "Mõõda teipide vahe ja võrdle oma pikkusega – kas tuleb pool?",
    "Astu 2 m kaugusele ja vaata uuesti: pealagi ja jalad paistavad ikka samade teipide juures. See on katse kõige tähtsam hetk – ärge jätke seda ajapuudusel ära.",
    "Mõõda kujutise kaugus: pane väike ese peegli ette ja liiguta teist eset peegli kõrval seni, kuni see paistab kujutisega ühel kaugusel.",
    "Võrdle tulemust oma hüpoteesiga.",
  ],
  tip: "Lase simulatsioon läbida ENNE päris katset – siis on õpilasel ennustus (mis juhtub kaugemale astudes?) juba olemas ja teibitükid päris peeglil kontrollivad teda.",
  /**
   * Kus simulatsioon ja päris elu lahku lähevad. See EI ole simulatsiooni
   * viga, vaid teadlik valik (model.ts `mirrorTopEdgeHeight`): peegel ripub
   * seal alati õigel kõrgusel, et katset ei saaks segada vale riputus.
   */
  whyRealDiffers:
    "Simulatsioonis ripub peegel ALATI õigel kõrgusel – ülaserv täpselt pealae ja silmade keskel – seega paistab alati pealagi. Päris elus ripub peegel seal, kuhu keegi ta pani, ja just seepärast paistavad paljudes kohtades peeglist jalad, aga pealagi mitte. Reegel „pool pikkusest piisab\" kehtib AINULT õigel kõrgusel rippuva peegli puhul. Laske klassil arvutada, kui kõrgele tuleks nende oma peegel riputada: ülaserv (silmade kõrgus + pikkus) / 2.",
  discussionQuestions: [
    "Miks on tantsusaali ja riidepoe peeglid ikkagi põrandast laeni, kui pool piisaks? (Siis näeb ka kõrvalseisjaid, see töötab igal pikkusel inimesel ja ka siis, kui astud kõrvale.)",
    "Miks paistab peeglist rohkem tuba, kui kaugemale astud, kuigi endast paistab sama palju?",
    "Miks kirjutatakse kiirabiautole kiri peegelpidi? (Juhatab mooduli `peeglikiri` juurde.)",
    "Kui kujutis on peegli taga 2 m kaugusel, kuhu peab fotoaparaat teravustama, et kujutis oleks terav?",
  ],
  /**
   * Summa peab andma manifest.minutes.lesson (20 min). Spetsifikatsioon annab
   * hooki ja teooriat ÜHE 2-minutilise plokina; siin on nad eraldi ridadena
   * (nii klapib rida sammuga), aga koos annavad nad sama 2 min.
   *
   * **Millal see moodul tunnis:** PÄRAST moodulit `peegeldumisseadus` – kogu
   * kujutise geomeetria on selle seaduse tagajärg. 45-minutilises tunnis
   * järgneb sellele päris katse teibiga (`procedure`).
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
      id: "kaugus-muudab-vaadet",
      description:
        "Õpilane arvab, et kaugemale astudes näeb ta peeglis endast rohkem – või (harvem) vähem. Mõlema juur on sama: usutakse, et kaugus muudab nähtavat osa.",
      remedy:
        "Ennustus lukustub enne katset, seejärel näitavad explore-3 ja explore-4 sama peegli ja sama inimesega, et 1 m ja 3 m kaugusel on nähtav osa täpselt sama 0,8 m. Sõnadega: kaugenedes kalduvad pealae ja jalgade kiired MÕLEMAD täpselt sama palju, seega jääb nende vahe peeglil samaks.",
    },
    {
      id: "taispikk-peegel",
      description:
        "Õpilane arvab, et täies pikkuses nägemiseks on vaja enda pikkust peeglit.",
      remedy:
        "Explore-5 (1,8 m inimene, 0,9 m peegel) ja practice-1 (Mari 1,5 m → 0,75 m): piisab poolest, sest kiir käib peeglini ja tagasi ehk iga sentimeeter peeglit „katab\" kaks sentimeetrit inimest – seda kuni inimene otsa saab, poolest suurem peegel enam rohkem ei näita. Päris katse teibitükkidega annab sama tulemuse mõõdulindiga.",
    },
    {
      id: "kujutis-peegli-pinnal",
      description:
        "Õpilane arvab, et kujutis on peegli pinnal, nagu pilt paberil või ekraanil.",
      remedy:
        "Teooria ja joonis `tp-nailine-kujutis`: kiirte pikendused lõikuvad peegli TAGA, sama kaugel, kui ese on ees. Practice-4 vale variandina. Küsi klassilt: kui kujutis oleks pinnal, miks peab silm siis kaugemale teravustama kui peegli klaasile?",
    },
    {
      id: "kujutis-on-asi",
      description:
        "Õpilane arvab, et kujutis on päris asi peegli taga – selle saaks ekraanile või paberile püüda, ta on lihtsalt „udune\" või kaugel.",
      remedy:
        "Näiline tähendab, et kiired seal päriselt ei käi – nad ainult paistavad sealt tulevat. Exit-1 küsib seda otse. Kui klassis on projektor, näidake vastandit: projektori kujutis TEKIB seinale, peegli oma mitte.",
    },
    {
      id: "kujutis-vaheneb-kaugusega",
      description:
        "Õpilane arvab, et kaugemale astudes läheb kujutis väiksemaks.",
      remedy:
        "Kujutis on alati esemega ühesuurune (`imageHeight` ei võtagi kaugust). Kaugemalt PAISTAB ta väiksem täpselt samamoodi nagu iga päris asi – see on nägemise, mitte kujutise omadus. Exit-1 vale variandina.",
    },
    {
      id: "kujutis-tagurpidi",
      description:
        "Õpilane arvab, et peeglis on kujutis pea alaspidi, nagu veepeegelduses.",
      remedy:
        "Teooria ütleb otse: kujutis on päripidine. Practice-4 vale variandina. Vasak-parem „pööramine\" on hoopis teine asi ja seda käsitleb moodul `peeglikiri` – siin sellele ei laskuta.",
    },
  ] satisfies Misconception[],
};
