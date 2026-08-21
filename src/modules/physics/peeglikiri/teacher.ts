/**
 * Õpetajajuhend (docs/MOODULILEPING.md „teacher.ts",
 * sisu/MOODUL-peeglikiri.md „Õpetajale").
 *
 * See fail EI ole osa moodulilepingu (contract.ts) tüüpidest – engine ei loe
 * teda kunagi ja checker ei kontrolli tema järgi vastuseid. Ta on inimesele
 * mõeldud materjal õpetaja töölaual.
 *
 * `misconceptions` id-d vastavad TÄPSELT `activities.ts` küsimuste
 * `misconception` siltidele – uue lõksvastuse lisamisel lisa ka siia kirje,
 * muidu jääb õpetaja väärarusaamast teadmatusse. Kooskõla valvab test.
 *
 * **Sellel moodulil ainekava praktilist tööd EI ole** (P1-PT1…PT4 on kõik
 * teiste moodulite all), seega ei ole siin `procedure`-välja. Peeglikirja
 * kirjutamise katse on ainekava ÕPILASE TEGEVUS „(K) korraldab katsed" ja seda
 * ei tohi praktilise tööna esitada.
 *
 * Ülesannete numeratsioon on KOODI oma (activities.ts id-d), mitte
 * spetsifikatsiooni loendi oma: lahendatud näidis on `worked`-väli, mitte
 * küsimus, seega on KIIRABI lünkülesanne practice-1, PEEGEL practice-2,
 * tähtede sümmeetria practice-3 ja teleprompteri ülekanne practice-4.
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
    "Igale õpilasele (või pinginaabrite paarile) üks väike käsipeegel",
    "Paber ja pliiats – peeglikirja kirjutamiseks",
    "Kaks käsipeeglit, mille saab vastastikku seada (peegel peegli ees)",
    "Valikuline: aken või lambi valgus, et paberit valguse poolt läbi vaadata",
  ],
  /**
   * OHUTUS. Selle mooduli oht ei tule optikast, vaid klaasist: käsipeegel on
   * klaas ja purunedes on ta terav.
   */
  safety:
    "Käsipeegel on klaas: ta ei käi taskus ega põrandal ja teda ei painutata. Purunenud peegli tükke ei korjata paljakäsi – tõmba klass eemale, korja tükid papi abil kokku ja pane suletud karpi. Peegliga EI suunata päikesevalgust ega lambivalgust kellelegi silma.",
  /**
   * (K) Peeglikirja kirjutamine (10 min) – ainekava õpilase tegevus „korraldab
   * katsed". Mooduli kõige tähtsam klassitegevus.
   */
  mirrorWritingActivity: [
    "Iga õpilane kirjutab paberile oma nime tavalises kirjas, suurte trükitähtedega.",
    "Seejärel proovib ta kirjutada sama nime nii, et see PEEGLIS õigesti loetaks. Kontroll käib käsipeegliga.",
    "Lihtsaim strateegia: kirjuta sõna tavaliselt, pööra paber ümber ja vaata seda VALGUSE POOLT LÄBI (nagu aknal) – nii näed kohe õiget peeglikirja kuju, sest valguse läbi vaadates näed tagantvaadet, ja just seda peegel näitabki.",
    "Võrrelge klassis, kelle nimi oli lihtne: mida rohkem tähti loendist A, H, I, M, O, T, U, V, W, X, Y, seda vähem on ümber joonistada.",
  ],
  /**
   * (K) Peegel peegli ees (2 min) – näitab, et peegel ei „pööra" midagi ümber,
   * vaid näitab tagantvaadet.
   */
  twoMirrorsActivity: [
    "Sea kaks peeglit vastastikku ja pane sõna nende vahele – sõna peegeldub mitu korda.",
    "Igal peegeldusel pöördub järjekord veel kord: paarisarvu peegelduste järel on järjekord sama, mis algselt, paaritu arvu järel vastupidi.",
    "Mõte ei ole trikis, vaid järelduses: peegel EI PÖÖRA midagi ümber – ta näitab tagantvaadet, ja kaks tagantvaadet järjest annavad jälle eestvaate.",
  ],
  /**
   * Mooduli kõige raskem klassivaidlus – ja aus vastus sellele.
   */
  whyLeftRightIsConfusing:
    "„Miks peegel vahetab vasaku ja parema ära, aga mitte üleval-all?\" on EKSITAV küsimus, mitte peegli omadus – peegel ei tee kumbagi telge erilisemaks kui teist. Vahe tekitab meie enda harjumus kujutada kujutist ette meie poole PÖÖRATUD inimesena; peapeale pööratuna me kedagi ette ei kujuta, seepärast ei aja üleval-all telg kedagi segadusse. Kui õpilane vaidleb vastu (paljud teevad), lase tal joonistada enda asemel NOOL, mis osutab paremale, ja hoida seda peegli ees: nool jääb ikka paremale osutama, kui peegel on tema EES, mitte kõrval.",
  /**
   * Seos teleprompteriga (practice-4 ülekandeülesanne).
   */
  teleprompterNote:
    "Uudistelugeja loeb teksti läbi kaldu klaasi, mis on kaamera ees. Klaas peegeldab ekraanilt tulevat teksti lugeja poole, kaamera näeb aga läbi klaasi otse lugejat. Ekraanil kuvatakse tekst juba peegelkirjas, et see pärast klaasilt peegeldumist lugejale õigetpidi paistaks – täpselt sama nipp, mis kiirabiauto kapotil. Seadme optikat (kaldu poolläbipaistev klaas, selle taga ekraan) moodul ei joonista.",
  /**
   * Mida see moodul EI räägi. Aus vastus on tähtis: 3D-pööramine on ahvatlev
   * jätk, aga ta ei ole enam peegli füüsika.
   */
  notInThisModule:
    "Miks su peegelpilt „tundub\" parema käe tõstvat, kui sa keha pöörad, on inimese KEHATAJU küsimus, mitte peegli füüsika – see jääb gümnaasiumisse. Väiketähed jäävad samuti välja: neil on omaette sümmeetriad („o\" ja „x\" on sümmeetrilised, aga „b\" muutub peeglis „d\"-sarnaseks) ja need nõuaksid tähekuju täpset joonist. Kujutise KAUGUSE ja päripidisuse arvutas juba moodul „Tasapeegli kujutis\", peegeldumisseaduse enda (α = β) moodul „Peegeldumisseadus\" – siin on need eeldused, mitte uued ülesanded.",
  /**
   * Kus mudel ja päris maailm lahku lähevad – ütle see ETTE.
   *
   * model.ts idealiseeringud 1, 2 ja 4.
   */
  whyRealDiffers:
    "Mudel eeldab LAPIKUT kirja tasasel peeglil. Päris kiirabiauto kapott on kaardus ja kaldu, mistõttu peegelkiri paistab lähedalt vaadates moondunud, ja läikiv auto uks käitub kumera peeglina. Loend „need tähed jäävad peeglis samaks\" kehtib ainult LIHTSAS trükitähestikus – teistsuguse tähekujuga ei ole näiteks T enam täpselt sümmeetriline. Ka Š ja Ž ei ole loendis, sest katus tähe kohal on ise viltune märk, mis peeglis suunda vahetab.",
  discussionQuestions: [
    "Miks on taksofirmade nimed autol vahel valitud nii, et nad on ka peeglis loetavad?",
    "Miks kirjutatakse operatsioonisaali seinapeeglisse vahel hoiatustekst tagurpidi?",
    "Mis juhtub kellaga, kui vaatad teda peeglist – kuhu liiguvad osutid?",
    "Miks on sõna „TAAT\" peeglis samasugune, aga sõna „TAKSO\" mitte?",
  ],
  /**
   * Millal see moodul tunnis: kohe pärast moodulit `tasapeegli-kujutis` – see
   * on sama tunni teine pool.
   */
  whenInLesson:
    "Kohe PÄRAST moodulit „Tasapeegli kujutis\" – see on sama tunni teine pool. Uut peegeldumisfüüsikat siin ei tule, on ainult ülekanne, seega sobib moodul ka koduseks tööks. Peeglikirja kirjutamise katse on aga põnevam koos klassis teha ja tema jaoks on 45-minutilise tunni lõpp hea koht.",
  tip: "Kõige tähtsam liigutus simulatsioonis on KAUGUSE liuguri lohistamine: õpilane ootab, et midagi juhtuks, ja mitte midagi ei juhtu. Just see „ei juhtu midagi\" on vastus – kaugus muudab ainult kujutise sügavust, mitte tähtede järjekorda ega kuju. Kui klass jõuab selleni ise, ei pea explore-4 vastust enam seletama.",
  /**
   * Summa peab andma manifest.minutes.lesson (15 min). 45-minutilises tunnis
   * mahub ette moodul „Tasapeegli kujutis" ja lõppu peeglikirja katse.
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
      id: "peegel-vahetab-vasaku-parema",
      description:
        "Õpilane arvab, et peegel vahetab füüsiliselt vasaku ja parema ära.",
      remedy:
        "Predict-1 ja exit-1: kujutise tõstetud käsi on toa SAMAL poolel, mitte vastaspoolel. Teooria ütleb põhjuse: peegel peegeldab ainult endaga risti suunda ehk sügavust. Klassis: noolega paberileht peegli ees – nool jääb paremale osutama.",
    },
    {
      id: "peegel-poorab-90-kraadi",
      description:
        "Õpilane arvab, et peegel pöörab kujutist mingi kraadide arvu võrra.",
      remedy:
        "Predict-1 kolmas variant ja teooria: peegli PINNAGA paralleelne asend ei muutu üldse (mudeli funktsioon `alongMirrorPositionM` tagastab sama arvu, mis sisse tuli). Pööramist ei toimu kummalgi teljel – muutub ainult sügavus.",
    },
    {
      id: "jarjekord-ei-poordu",
      description:
        "Õpilane arvab, et kiri on peeglis samas järjekorras, mis paberil.",
      remedy:
        "Explore-1 ja practice-1…2: „TAKSO\" on peeglis „OSKAT\". Põhjus on teoorias – iga täht on omaeti sügavusel ja sügavus pöördub, seega kaugeimast tähest saab lähim. Klassis: kirjuta sõna paberile ja hoia see peegli ette.",
    },
    {
      id: "t-ei-ole-summeetriline",
      description: "Õpilane arvab, et ükski täht ei jää peeglis iseendaks.",
      remedy:
        "Teooria joonis ja explore-2…3: T, A, O, H, M, X ja teised jäävad peeglis täpselt samaks – seepärast ongi „TAAT\" peeglis loetav. Klassis: kirjuta suur T paberile ja vaata seda peeglist.",
    },
    {
      id: "kaugus-muudab-jarjekorda",
      description:
        "Õpilane arvab, et kaugus peeglist mõjutab tähtede järjekorda peeglis.",
      remedy:
        "Explore-4: lohista liugur ühest otsast teise – „Sõna peeglis\" ei muutu. Kaugus muudab ainult kujutise sügavust (mudeli funktsioon `imageDepthM`), mitte tähtede järjekorda ega kuju.",
    },
    {
      id: "koik-tahed-tunduvad-summeetrilised",
      description:
        "Õpilane arvab, et enamik tähti näeb peeglis endistviisi välja.",
      remedy:
        "Practice-3 ja teooria joonis: sümmeetrilisi tähti on 15, muutuvaid 17 – enamik tähestikust (K, S, F, E jt) muutub peeglis loetamatuks. Klassis: iga õpilane kontrollib oma nime tähed peegliga ükshaaval üle.",
    },
  ] satisfies Misconception[],
};
