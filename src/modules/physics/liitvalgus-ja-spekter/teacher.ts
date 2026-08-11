/**
 * Õpetajajuhend (docs/MOODULILEPING.md „teacher.ts",
 * sisu/MOODUL-liitvalgus-ja-spekter.md „Õpetajale").
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
    "Vana CD- või DVD-plaat (kõige odavam spektroskoop; üks plaat kahe õpilase peale)",
    "Prisma, kui koolis on",
    "Papp, käärid, vikerkaarevärvides pliiatsid või viltpliiatsid ja pliiats teljeks (Newtoni ketas)",
    "Telefoni taskulamp (valge LED) ja klassi lagi- või laualamp – kaks eri spektrit kõrvuti",
  ],
  /**
   * Ohutus. Selle mooduli kaks ohtu on mõlemad „aga see on ju nõrk" tüüpi:
   * osuti-laser ja Päike. Kumbagi ei tohi pisendada.
   */
  safety:
    "Laserikiirt EI suunata kunagi silma ega peegeldavale pinnale, ka mitte „nõrka\" osuti-laserit. Päikesesse ei vaadata palja silmaga ega läbi CD-plaadi – CD-ga vaadatakse alati peegelduvat või hajusat valgust, mitte allikat ennast.",
  /** (K) Spekter oma silmaga – kõige odavam variant. */
  cdActivity: [
    "Hoia vana CD- või DVD-plaati akna poole nii, et selle pinnalt peegelduks päikesevalgus (MITTE otse Päike!) seinale või lakke – seinal on vikerkaareriba.",
    "Vaata sama plaadiga klassi lambi valgust ja siis telefoni taskulambi (valge LED) valgust.",
    "LED-i „vikerkaares\" on selgelt näha, et punane ots on nõrk – täpselt see, mida simulatsioon ülesandes 3 näitab.",
    "Kui koolis on prisma, tee sama katse prismaga: riba on ühtlasem ja kergem seletada.",
  ],
  /**
   * (K) Newtoni ketas – värvid tagasi kokku.
   *
   * Ütle klassile ETTE, miks ketas ei lähe puhtvalgeks. Muidu jääb katse
   * õpilase mällu „ebaõnnestunuks" ja see kinnitab hoopis väärarusaama, et
   * värvide kokkupanemine valget ei anna.
   */
  newtonDisk:
    "Lõika papist ketas, jaga seitsmeks sektoriks, värvi vikerkaarevärvidega, torka pliiats keskele ja keeruta. Ketas läheb hallikasvalgeks. Ütle kohe, miks mitte puhtvalgeks: värvipliiatsi värvid ei ole spektri puhtad värvid ja osa valgust neeldub paberis.",
  /** (K) Koduülesanne – seob mooduli hooki päris tänavaga. */
  homeObservation:
    "Vaadake õhtul, mis värvi on teie tänava valgustid, ja proovige öelda, mis värvi on parkivad autod. Vanade kollaste naatriumlampide all on see peaaegu võimatu – see ongi mooduli hook päris elus.",
  tip: "Lase simulatsioon läbida ENNE CD-plaadi katset: siis on õpilasel ennustus (mitu riba laseril on?) juba olemas ja päris spekter kontrollib teda. Projektoriga klassis tasub explore-samm teha koos – viis allikat jõuab kahe minutiga läbi käia.",
  /**
   * Kus simulatsioon ja päris elu lahku lähevad.
   *
   * Mudel ütleb ainult, KAS lainepikkus on olemas, mitte kui palju seda on
   * (model.ts). Päris spektris on tugevused erinevad ja seda on CD-plaadiga
   * kohe näha – õpetaja peab teadma, et see EI ole viga.
   */
  whyRealDiffers:
    "Simulatsioon näitab ainult seda, KAS mingi värv valguses on – mitte kui tugev ta on. Päris spektris on tugevused erinevad: hõõglambil on punane ots tugevam kui sinine, valgel LED-il on punane ots nõrk (mitte päris puudu) ja päikesevalgus on kõige ühtlasem. Tugevuste jaotus nõuaks kiirgusseadusi, mida 8. klassis ei õpita, seega on see vahe siin sõnadega, mitte arvudega.",
  discussionQuestions: [
    "Kui laser oleks roheline, kus oleks tema riba spektris?",
    "Miks paistavad tähed eri värvi – üks sinakas, teine punakas? (Seos mooduliga `valgusallikad`: mida kuumem keha, seda sinakam valgus.)",
    "Miks on fotograafil vaja teada, mis lambiga pilt tehti?",
    "Miks tundub uue LED-valgusti all tänav „külmem\" kui vana lambi all, kuigi mõlemad paistavad valged?",
  ],
  /**
   * Millal see moodul tunnis: PÄRAST moodulit `valgusallikad` (sealt tuleb
   * liigitus suuruse järgi, siin spektri järgi) ja ENNE mooduleid
   * `esemete-varvus` ja `valgusfiltrid`, mis mõlemad eeldavad spektri mõistet.
   * Murdumist (plokk P2) see moodul EI eelda – simulatsioon on meelega
   * spektroskoop, mitte prisma.
   */
  whenInLesson:
    "Pärast moodulit `valgusallikad`, enne mooduleid `esemete-varvus` ja `valgusfiltrid`. Murdumist ei eelda.",
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
      id: "valge-on-varvitu",
      description:
        "Õpilane arvab, et valge valgus on „ilma värvita\" valgus – värvid on midagi, mis tuleb sellele lisada.",
      remedy:
        "Teooria definitsioon ja explore-1: päikesevalguse spektris on kõik seitse riba korraga olemas. Exit-1 küsib seda otse. Sõnadega: valge ei ole „värvitu\", vaid „kõik korraga\".",
    },
    {
      id: "varvid-tekivad-prismas",
      description:
        "Õpilane arvab, et värvid tekivad prismas või vikerkaares juurde – valguses neid enne ei olnud.",
      remedy:
        "Spektroskoop näitab värve, ilma et miski neid „tegema\" peaks. Kui lahutatud värvid uuesti kokku viia, tuleb jälle valge (Newtoni ketas) – prisma ei saa midagi juurde teha ega ära võtta. Practice-4 vale variandina.",
    },
    {
      id: "koik-valgus-on-liitvalgus",
      description:
        "Õpilane arvab, et igas valguses on kõik värvid olemas ja lihtvalgust ei ole olemas – või et lihtvalgusel „ei olegi spektrit\".",
      remedy:
        "Predict lukustub enne katset, siis näitavad explore-2 ja explore-4, et laseril ja naatriumlambil on täpselt üks riba. Spekter on ka lihtvalgusel – see on lihtsalt üks kitsas riba, mitte tühjus.",
    },
    {
      id: "spekter-soltub-eredusest",
      description:
        "Õpilane arvab, et mida eredam valgus, seda rohkem värve selles on; hämar valgus on „vähem valge\".",
      remedy:
        "Laser on klassi kõige eredam valgus ja tal on ÜKSAINUS riba. Simulatsioon eredust ei näitagi – ainult seda, millised värvid olemas on. Practice-4 vale variandina.",
    },
    {
      id: "valge-lamp-on-taielik",
      description:
        "Õpilane arvab, et kui lamp paistab valge, on tema valguses kõik värvid olemas.",
      remedy:
        "Explore-3: valge LED paistab valge, aga punane riba on tal peaaegu puudu – silm näeb valget, sest tema kolm värvitundlikku andurit saavad kõik oma osa kätte. Exit-3 palub seda oma sõnadega seletada. CD-plaat telefoni taskulambi ees näitab sama asja päris elus.",
    },
    {
      id: "valgus-ja-varviaine-sama",
      description:
        "Õpilane arvab, et valgusi liidetakse samamoodi nagu guaššvärve – kollane on „segavärv\", sest värvipurgis saab ta segamise teel.",
      remedy:
        "Teooria tõmbab piiri ühe lausega: värviained NEELAVAD valgust, valgusvihud LIIDUVAD. Explore-4 vale variandina. Päriselt lükkab selle ümber moodul `esemete-varvus` – siia sellele ei laskuta.",
    },
  ] satisfies Misconception[],
};
