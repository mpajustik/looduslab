/**
 * Õpetajajuhend (docs/MOODULILEPING.md „teacher.ts",
 * sisu/MOODUL-varjutused.md „Õpetajale").
 *
 * See fail EI ole osa moodulilepingu (contract.ts) tüüpidest – engine ei loe
 * teda kunagi ja checker ei kontrolli tema järgi vastuseid. Ta on inimesele
 * mõeldud materjal õpetaja töölaual.
 *
 * `misconceptions` id-d vastavad TÄPSELT `activities.ts` küsimuste
 * `misconception` siltidele – uue lõksvastuse lisamisel lisa ka siia kirje,
 * muidu jääb õpetaja väärarusaamast teadmatusse. Kooskõla valvab test.
 *
 * **Sellel moodulil ei ole omaette praktilist tööd** (P1-PT1 on kaetud
 * moodulis `vari-ja-poolvari`). Ainekava nõuab siin selle asemel kaartide ja
 * videote kasutamist – need on `procedure`-välja asemel `fieldTrip`-is ja
 * `discussionQuestions`-is.
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
   * OHUTUS on selle teema juures kõige tähtsam punkt – ainekava nõuab, et
   * see oleks öeldud enne kaardi- ja videotegevusi, mitte nende järel.
   */
  safety:
    "Päikesesse EI vaadata palja silmaga, päikeseprillidega, suitsuklaasiga, röntgenfilmiga ega läbi teleskoobi/binokli. Ainus lubatud vahend on varjutusprillid standardiga ISO 12312-2 või kaudne vaatlus (auguga papp, mis projitseerib Päikese kujutise teisele papile). Osalise varjutuse ajal on Päike sama ohtlik kui tavaliselt – hämaram taevas petab silma, aga kiirgus ei kao. Kuuvarjutust võib vaadata täiesti vabalt, ka binokliga.",
  /**
   * (K) möödunud varjutuste videod – ainekava metoodiline rõhk. See EI ole
   * praktiline töö (P1-PT1 on juba kaetud), vaid vaatlusmaterjal.
   */
  videos: [
    "Täieliku päikesevarjutuse video koos inimeste reaktsiooniga ja hämariku saabumisega paari sekundiga – enne vaatamist küsi: jälgi, kui kaua täielik faas kestab (siin minutid).",
    "Kuuvarjutuse timelapse kõrvale võrdluseks – seal kestab täielik faas tunde, mitte minuteid.",
  ],
  /**
   * (K) kaardi lugemine – simulatsiooni samm 5 harjutab seda skemaatilisel
   * joonisel, päris kaart on internetis ja muutub, seepärast ei ole ta
   * rakendusse sisse kirjutatud.
   */
  mapActivity:
    "Otsige klassiga, millal on järgmine varjutus Eestist nähtav ja kui suur osa Päikesest siis kaetud on. Vaadake koos, kuidas täisvarju kitsas riba kaardil kulgeb ja kui palju laiem on selle ümber poolvarju ala.",
  /**
   * (K) arutelu: miks on varjutuse teekond kaardil kõver, mitte sirge? Kuu
   * vari liigub sirgjooneliselt, aga jälg jääb PÖÖRLEVALE kerale – samamoodi
   * nagu lennuki lühim tee kaardil kaarena.
   */
  whyPathIsCurved:
    "Kuu vari liigub sirgjooneliselt, aga ta joonistab jälje kerale, mis ise samal ajal pöörleb. Sirge tee kera pinnal näeb lamedal kaardil välja kõverana – samamoodi nagu lennuki lühim tee Tallinnast New Yorki kaardil kaarena. Hea kõrvutus: näidake sama teekonda maakeral ja kaardil.",
  discussionQuestions: [
    "Kui Kuu oleks kaks korda kaugemal, kas täielikku päikesevarjutust saaks üldse olla?",
    "Miks on suur õnn, et Kuu paistab taevas peaaegu täpselt sama suur kui Päike?",
    "Mida näeb Kuu peal seisev astronaut siis, kui Maal on kuuvarjutus? (Vastus: päikesevarjutust – Maa katab tema jaoks Päikese ära.)",
  ],
  /**
   * Kaudne vaatlus klassis (K, kui varjutus juhtub) – sama nähtus, mis
   * moodulis `valguse-sirgjooneline-levimine`, aga varjutuse ajal on
   * kujutis poolkuu kujuline.
   */
  fieldwork:
    "Kui klassiaeg langeb kokku päikesevarjutusega: tehke papitükki nõelaga auk ja laske Päikese kujutis langeda valgele paberile. Varjutuse ajal on kujutis poolkuu kujuline. Puu lehtede vahelt langeb varjutuse ajal maha sadu poolkuukujulisi laike – iga leheauk on üks auguga papp.",
  /**
   * Summa peab andma manifest.minutes.lesson (18 min). Spetsifikatsioon
   * annab hooki ja teooriat ÜHE 2-minutilise plokina; siin on nad eraldi
   * ridadena (nii klapib rida sammuga), aga koos annavad nad sama 2 min.
   *
   * **Millal see moodul tunnis:** PÄRAST moodulit `vari-ja-poolvari` – kogu
   * arvutus on selle ülekanne. Enne moodulit `kuu-faasid`, sest faasi ja
   * varjutuse eristamine on lihtsam siis, kui varjutus on värskelt läbi
   * võetud.
   */
  lessonPlan: [
    { step: "hook", minutes: 1 },
    { step: "theory", minutes: 1 },
    { step: "predict", minutes: 2 },
    { step: "explore", minutes: 6 },
    { step: "practice", minutes: 5 },
    { step: "exit", minutes: 3 },
  ] satisfies LessonPlanItem[],
  misconceptions: [
    {
      id: "varjutused-segamini",
      description:
        "Õpilane arvab, et päikesevarjutuse ajal langeb Maa vari Kuule (või vastupidi) – ei erista, KES heidab varju ja KELLELE see langeb.",
      remedy:
        "Teooria ja joonis `vj-kaks-varjutust` nimetavad iga kord eraldi: päikesevarjutuse ajal on Kuu Maa ja Päikese vahel ning heidab varju Maale, kuuvarjutuse ajal on Maa Päikese ja Kuu vahel ning heidab varju Kuule. Exit-1 ja practice-4 kontrollivad seda otse.",
    },
    {
      id: "varjutus-igal-kuul",
      description:
        "Kuna Kuu tiirleb ümber Maa iga kuu, peaks õpilase arvates ka varjutus olema igakuine.",
      remedy:
        "Kuu rada on Maa raja tasandi suhtes ~5° viltu, seega möödub Kuu vari enamasti Maast ülevalt või alt mööda. Varjutus tuleb ainult siis, kui Kuu on parajasti tasandite lõikejoonel – hook ja exit-3 küsivad seda otse.",
    },
    {
      id: "taisvari-ei-loppe",
      description:
        "Õpilane arvab, et täisvari ulatub lõpmatuseni ja läheb kaugusega ainult järjest väiksemaks, kuid ei kao kunagi täielikult.",
      remedy:
        "Koonusel on tipp – Kuu täisvarju koonus lõpeb 374 289 km peal. Explore-1 ja explore-3 näitavad, et pärast seda kaugust ei ole täisvarju ÜLDSE (sama tulemus tuli juba moodulis `vari-ja-poolvari` laia lambiga).",
    },
    {
      id: "taisvari-on-suur",
      description:
        "Õpilane arvab, et täielikku päikesevarjutust näeb korraga terve maakera või vähemalt pool sellest.",
      remedy:
        "Explore-2: täisvarju laik on Maal ainult ~200 km lai. Practice-2 kaardil on tume riba kitsas ja poolvarju ala palju laiem – nemad ongi see, mida suurem osa maailmast näeb.",
    },
    {
      id: "varjutus-koik-voi-mitte-midagi",
      description:
        "Õpilane arvab, et varjutus kas on täielikult olemas või seda ei ole üldse – vahepealseid seisundeid ei ole.",
      remedy:
        "Simulatsioonis on kolm ala: täisvari, poolvari ja valgustatud ala – neist tulevad täielik, osaline ja rõngasjas varjutus. Rõngasjas varjutuse juures ei jõua koonus Maani, aga Päike ei kao ka täiesti ära.",
    },
    {
      id: "kuu-faas-on-vari",
      description:
        "Õpilane arvab, et kahanev Kuu on Maa vari Kuu peal ehk sama nähtus, mis kuuvarjutus.",
      remedy:
        "Teooria tõmbab piiri ühe lausega: Kuu faas ei ole varjutus, Kuud valgustab alati pool ja meie näeme sellest poolest kord rohkem, kord vähem. Päriselt lükkab selle ümber moodul `kuu-faasid` (kus on ka oma simulatsioon).",
    },
  ] satisfies Misconception[],
};
