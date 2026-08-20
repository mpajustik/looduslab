/**
 * Õpetajajuhend (docs/MOODULILEPING.md „teacher.ts",
 * sisu/MOODUL-nurkpeegel.md „Õpetajale").
 *
 * See fail EI ole osa moodulilepingu (contract.ts) tüüpidest – engine ei loe
 * teda kunagi ja checker ei kontrolli tema järgi vastuseid. Ta on inimesele
 * mõeldud materjal õpetaja töölaual.
 *
 * `misconceptions` id-d vastavad TÄPSELT `activities.ts` küsimuste
 * `misconception` siltidele – uue lõksvastuse lisamisel lisa ka siia kirje,
 * muidu jääb õpetaja väärarusaamast teadmatusse. Kooskõla valvab test. Loendis
 * on ka need kaks väärarusaama (`teine-peegel-ei-jargi-seadust`,
 * `nurkpeegel-vajab-taisnurka`), mille lükkab ümber SIMULATSIOON, mitte ükski
 * vastusevariant: õpetaja peab neid ootama ka siis, kui ükski ülesanne neid ei
 * püüa.
 *
 * **Sellel moodulil ainekava praktilist tööd EI ole** (P1-PT1…PT4 on kõik juba
 * teiste moodulite all), seega ei ole siin `procedure`-välja. Kolm (K)
 * klassikatset – kaks taskupeeglit, kujutised nurkpeeglis ja papitorust
 * periskoop – on demonstratsioonid ja neid ei tohi praktilise tööna esitada.
 *
 * Ülesannete numeratsioon on KOODI oma (activities.ts id-d), mitte
 * spetsifikatsiooni loendi oma: lahendatud näidis on `worked`-väli, mitte
 * küsimus, seega on lünkülesanne practice-1, pöördülesanne practice-2, joonise
 * lugemine practice-3 ja periskoobi ülekanne practice-4.
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
    "Kaks väikest taskupeeglit iga paari kohta (nurkpeegli jaoks servapidi kokku pandavad)",
    "Laserosuti VÕI taskulamp koos papist piluga (kitsas valgusvihk) ja valge paber laual",
    "Malli või nurgamõõtja, millega paberile joonistatud sisse- ja väljuva kiire vahelist nurka mõõta",
    "(K) papitorust periskoobi jaoks: piimapakk või papitoru, kaks taskupeeglit, teip, nuga",
    "(K) valikuline: nööbike või pisike ese, mis käib kahe peegli vahele (kujutiste katse)",
  ],
  /**
   * OHUTUS. Selle mooduli oht ei tule peeglist, vaid laserist: nurkpeegel
   * saadab kiire TAGASI sinna, kust ta tuli – täisnurga all täpselt osuti
   * juurde. Just see, mis teeb mooduli huvitavaks, paneb kiire ka katsetaja
   * enda poole.
   */
  safety:
    "Laserosutit ei suunata kunagi kellegi silma ega peeglisse nii, et peegeldunud kiir kellelegi näkku läheks. Täisnurkne nurkpeegel saadab kiire tagasi TÄPSELT sinna, kust ta tuli – seega osuti hoidja enda poole. Lepi enne katset kokku, et laser jääb lauapinna kõrgusele ja kõik seisavad; nii ei ole ühegi õpilase silm kiire kõrgusel. Odavam ja ohutum variant on taskulamp koos papist pilu abil tehtud kitsa vihuga – seaduspära paistab paberil täpselt sama hästi välja.",
  /**
   * (K) Kaks taskupeeglit lauale (5 min) – mooduli päris katse.
   *
   * Peeglite nurk hoitakse LAI (60°…90°). Kitsama nurga korral ei pääse kiir
   * kahe peegeldusega välja ja pööre EI ole enam 2θ (model.ts: θ > 45° ja
   * α < 2θ − 90°). See ei ole katse äpardus, vaid reegli piir.
   */
  twoMirrorActivity: [
    "Pane kaks peeglit servapidi kokku nurga alla ja saada kitsas valgusvihk nende vahelisse kiilu.",
    "Märgi paberile sisse- ja väljuva kiire tee, mõõda malliga nende vaheline nurk ehk pööre ja võrdle peeglite nurgaga: pööre tuleb kaks korda suurem.",
    "Muuda peeglite nurka ja korda mõõtmist. Muuda siis AINULT seda, kust kiir sisse tuleb: pööre jääb samaks.",
    "Sea lõpuks peeglid täisnurga alla ja liiguta valgusallikat: kiir tuleb iga kord tagasi sinna, kust ta tuli.",
    "Hoia peeglite nurk lai (60°…90°). Kitsama nurga korral põrkab kiir peeglite vahel mitu korda ja siis EI ole pööre kaks korda peeglite nurk – see on reegli piir, mitte katse äpardus. Kui keegi selle leiab, on see hea koht öelda, et sealt algab kaleidoskoobi lugu.",
  ],
  /**
   * (K) Mitu kujutist nurkpeeglis (3 min, samad kaks peeglit).
   *
   * Kujutiste ARV (360° / nurk − 1) on TEINE õpieesmärk ja jääb sellest
   * moodulist välja (sisu/MOODUL-nurkpeegel.md „Piirid") – siin on ta hea
   * „ahaa" ja kaleidoskoobi seletus. Ütle klassile ausalt, et valemit siin ei
   * tuletata.
   */
  manyImagesActivity: [
    "Pane peeglite vahele nööbike või mõni muu pisike ese ja vaata, mitu neid peeglis paistab.",
    "Vähenda peeglite nurka: kujutisi tuleb aina rohkem (90° juures 3, 60° juures 5).",
    "Miks täpselt nii palju – see on juba KUJUTISTE lugu ja jääb sellest moodulist välja. Siin piisab tähelepanekust, et kitsam nurk annab rohkem kujutisi, ja sellest, et just nii on tehtud kaleidoskoop.",
  ],
  /** (K) Papitorust periskoop (10 min) – hooki päris vaste. */
  periscopeActivity: [
    "Lõika toru otstesse vastaspooltele avad ja teibi peeglid 45° kaldu, teineteisega paralleelselt.",
    "Lase õpilastel vaadata üle laua serva, üle kapi või ukse tagant.",
    "Küsi ENNE vaatamist, kas pilt tuleb pea peale. Vastus (ei tule – peeglite nurk on 0°, seega on pööre 0°) on selle mooduli oma ja õpilane saab ta ise ette öelda.",
  ],
  /**
   * Kus simulatsioon ja päris katse lahku lähevad – ütle see ETTE.
   *
   * model.ts idealiseeringud 1 ja 3: peeglid on ideaalselt tasased ja lõpmata
   * õhukesed, kiir on lõputult peenike joon.
   */
  whyRealDiffers:
    "Pööre tuleb ka laual 2 · peeglite nurk, aga paberil mõõdetuna paar kraadi kõrvale. Kolm põhjust: peegli klaas on paks ja peegeldav kiht on TAGA (viltu vaadates paistab topeltpilt), kaks peeglit ei ole päris servapidi koos, ja laseri kiir ise on lai – simulatsioonis on ta lõputult peenike joon. See on hea koht rääkida mõõtmisveast, mida simulatsioonis meelega ei ole. Päris peegel neelab ka iga peegeldusega umbes 5 % valgusest, seega on väljuv kiir nõrgem kui sisenev; mudelis intensiivsust ei ole üldse.",
  discussionQuestions: [
    "Miks on helkur täpitud pisikeste nurkadega, mitte lihtsalt tasane läikiv plaat? (Vastus tuleb järgmises moodulis, aga arvata võib juba nüüd.)",
    "Mis juhtub, kui nurkpeegli peeglid on täpselt paralleelsed ja panna nende vahele küünal?",
    "Kolm peeglit kuubi nurgana – miks saadab see valguse tagasi ka siis, kui valgus ei tule peeglite tasandis? (Kuu peale on jäetud just sellised reflektorid.)",
    "Miks ei ole periskoobi pilt pea peal, kuigi valgus peegeldub seal kaks korda?",
  ],
  /**
   * Millal see moodul tunnis: pärast peegeldumisseadust ja tasapeegli kujutist,
   * enne moodulit `helkur`. Kõverpeeglitega ta seotud ei ole – siin on mõlemad
   * pinnad tasased ja uus on ainult see, et neid on kaks.
   */
  whenInLesson:
    "Pärast mooduleid „Peegeldumisseadus\" ja „Tasapeegli kujutis\", enne moodulit „Helkur\". Kõverpeeglitega („Kumerpeegel\", „Nõguspeegel\") ta seotud ei ole: siin on mõlemad pinnad tasased ja ainus uudis on see, et peegleid on kaks. Kui klass on kõverpeeglid juba läbinud, ütle see vahe välja – muidu otsitakse siit fookust, mida siin ei ole.",
  tip: "Tee simulatsioon ENNE päris katset. Peeglite nurga täpne seadmine laual on tüütu ja hajub; ekraanil näeb seaduspära viie sekundiga ja laual otsib õpilane siis juba kinnitust, mitte mustrit. Simulatsiooni kõige tähtsam liigutus on pöörde lüliti: ta avaneb alles pärast esimest ülesannet, sest enne peab õpilane ise nägema, et kaks langemisnurka annavad kokku peeglite nurga.",
  /**
   * Summa peab andma manifest.minutes.lesson (15 min). 45-minutilises tunnis
   * mahub kõrvale kahe peegli katse ja periskoobi ehitamine.
   */
  lessonPlan: [
    { step: "hook", minutes: 2 },
    { step: "theory", minutes: 3 },
    { step: "predict", minutes: 2 },
    { step: "explore", minutes: 5 },
    { step: "practice", minutes: 2 },
    { step: "exit", minutes: 1 },
  ] satisfies LessonPlanItem[],
  misconceptions: [
    {
      id: "peeglite-nurk-on-poorde-nurk",
      description:
        "Õpilane arvab, et kiir pöördub sama palju, kui suur on peeglite nurk.",
      remedy:
        "Explore-2 ja explore-3: pöörde arv on ekraanil ja on iga kord täpselt kaks korda suurem kui peeglite nurk. Mõlemal ülesandel on peeglite nurga enda arv LÕKSUNA sees, seega saab õpilane just selle tagasiside, mitte üldise „vale\". Practice-2 nõuab jagamist, mitte kopeerimist: pööre on teada ja peeglite nurk otsitav.",
    },
    {
      id: "kaks-peeglit-tuhistavad",
      description:
        "Õpilane arvab, et kaks peegeldust tühistavad teineteist ja kiir läheb lihtsalt edasi.",
      remedy:
        "Explore-2: pöörde kaar ja arv on ekraanil. Teooria ütleb, et suund jääb samaks AINULT paralleelsete peeglite korral (peeglite nurk 0° → pööre 0°) – see on periskoop, mitte nurkpeegel. Klassis: pane peeglid laual täisnurga alla ja vaata, kuhu kiir läheb.",
    },
    {
      id: "poore-soltub-langemisnurgast",
      description:
        "Õpilane arvab, et kui kiir tuleb teise nurga alt, siis pöördub ta teisiti.",
      remedy:
        "Explore-4: langemisnurga liuguri liigutamine ei liiguta pöörde arvu üldse. Mudelil on selle kohta eraldi invariant-test (sama peeglite nurk, kümned eri langemisnurgad, sama pööre). Klassis: liiguta laserit ja jälgi väljuvat kiirt – ta jääb paralleelseks.",
    },
    {
      id: "tagasitulek-soltub-langemisnurgast",
      description:
        "Õpilane arvab, et 90° nurkpeegel saadab valguse tagasi ainult siis, kui kiir tuli „õige\" nurga alt (näiteks 45°).",
      remedy:
        "Explore-4 vastusevariant (c) on täpselt see. Simulatsioonis saab langemisnurga liugurit liigutada ja väljuv kiir jääb iga kord sissetulevaga paralleelseks. See on mooduli kõige tähtsam mudelitest: iga lubatud langemisnurga korral on väljuva kiire suund täpselt vastupidine sissetulevale.",
    },
    {
      id: "periskoop-poorab-pilti",
      description: "Õpilane arvab, et periskoop pöörab vaatesuunda 90° võrra.",
      remedy:
        "Teooria: peeglite nurk 0° → pööre 0°. Practice-4 ütleb sama kolme õige väitega. Klassis on kõige veenvam papitorust periskoop: õpilane vaatab otse edasi ja näeb otse edasi, ainult kõrgemalt.",
    },
    {
      id: "teine-peegel-ei-jargi-seadust",
      description:
        "Õpilane arvab, et teisel peeglil käib asi kuidagi teisiti, sest kiir tuleb sinna juba peegeldununa.",
      remedy:
        "Simulatsioonis on MÕLEMA peegli juures ristsirge ja kaks võrdset nurka koos arvudega. Teooria ütleb otse: iga peegel ei tea teisest mitte midagi. Klassis aitab küsimus: kust peaks teine peegel teadma, et see kiir on juba kord peegeldunud?",
    },
    {
      id: "pikem-tee-suurendab",
      description:
        "Õpilane arvab, et pikem valguse tee (kaks peeglit, pikk toru) suurendab pilti.",
      remedy:
        "Practice-4: peegel ei muuda eseme suurust, ta muudab ainult seda, kust me teda vaatame. Klassis: vaata periskoobist ja siis otse – ese on sama suur, ainult vaatekoht on teine.",
    },
    {
      id: "nurkpeegel-vajab-taisnurka",
      description:
        "Õpilane arvab, et nurkpeegel „töötab\" ainult 90° juures ja muu nurk ei anna midagi.",
      remedy:
        "Explore-1…4 käivad läbi 60°, 75° ja 90° ning igal juhul on pööre olemas ja arvutatav. Täisnurk ei ole ainus töötav nurk, ta on lihtsalt see, mille juures pööre tuleb 180° ehk täpselt tagasi. Klassis: mõõda paberil kolme eri nurga juures ja pane arvud kõrvuti.",
    },
  ] satisfies Misconception[],
};
