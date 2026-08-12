/**
 * Õpetajajuhend (docs/MOODULILEPING.md „teacher.ts",
 * sisu/MOODUL-noguspeegel.md „Õpetajale").
 *
 * See fail EI ole osa moodulilepingu (contract.ts) tüüpidest – engine ei loe
 * teda kunagi ja checker ei kontrolli tema järgi vastuseid. Ta on inimesele
 * mõeldud materjal õpetaja töölaual.
 *
 * `misconceptions` id-d vastavad TÄPSELT `activities.ts` küsimuste
 * `misconception` siltidele – uue lõksvastuse lisamisel lisa ka siia kirje,
 * muidu jääb õpetaja väärarusaamast teadmatusse. Kooskõla valvab test.
 *
 * **Sellel moodulil ainekava praktilist tööd EI ole** (P1-PT1…PT4 on kõik juba
 * teiste moodulite all), seega ei ole siin `procedure`-välja. Kaks (K)
 * klassikatset – lusikas ja taskulambi peegeldi – on lühikesed demonstratsioonid
 * ja neid ei tohi praktilise tööna esitada.
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
    "Läikiv supilusikas iga õpilase või paari kohta (nõgus külg = nõguspeegel, kumer külg = kumerpeegel)",
    "Taskulamp, mille saab lahti võtta – või väljalülitatud auto esituli, millele saab otsa vaadata",
    "(K) valikuline: nõguspeegel või kosmeetikapeegli suurendav pool",
    "(K) valikuline: paberileht ja kausitäis vett, kui teed Päikese koondamise katset õues",
  ],
  /**
   * OHUTUS. Selle mooduli kõige tähtsam lause: nõguspeegel koondab Päikese
   * valguse laigule, kus paber läheb mõne sekundiga põlema. Õpilane, kes seda
   * ei tea, proovib seda ise järele – lusikas on igal koolilapsel käepärast.
   */
  safety:
    "Nõguspeegel koondab Päikese valguse fookuses väga väikesele laigule ja seal läheb paber mõne sekundiga põlema. Kui seda katset üldse teha, siis ainult õues, õpetaja käes ja kausitäie vee kõrval. Koondatud valgust ei suunata KUNAGI kellegi poole ega vaadata fookusesse. Päikest ennast ei vaadata peegli kaudu mitte kunagi. Kõige turvalisem variant on jätta katse ära ja näidata selle asemel päikeseahju videot (Odeillo päikeseahi Prantsusmaal: võimsus 1 MW, fookuses üle 3500 °C).",
  /**
   * (K) Lusikakatse (2 min, vahendeid on igas klassis).
   *
   * Kujutise pööramine tuleb siin jutuks, sest õpilane NÄEB seda – aga ükski
   * ülesanne seda ei nõua (sisu/MOODUL-noguspeegel.md „Piirid": kujutise
   * konstrueerimine on ainekavas P2, läätsede juures). Ütle see klassile ausalt
   * välja, muidu jääb õpilane ootama vastust, mida see moodul ei anna.
   */
  spoonActivity: [
    "Vaata läikivat supilusikat mõlemalt poolt: süvendipoolne külg on nõguspeegel, kumer külg kumerpeegel.",
    "Hoia lusika nõgusat külge päris silme lähedal ja vii siis aeglaselt kaugemale: nägu on esmalt suur ja püstine, teatud kauguselt aga PEA PEAL.",
    "Kumeras küljes on nägu alati väike ja püstine – see on järgmise mooduli teema.",
    "Ütle klassile ausalt, et kujutise pööramist uurime alles läätsede juures: siin on lusikas selleks, et kõverpeegel oleks päris asi, mitte ainult joonis.",
  ],
  /** (K) Taskulambi peegeldi – hooki päris vaste. */
  flashlightActivity: [
    "Võta taskulamp lahti (või vaata otsa väljalülitatud auto esituld) ja lase õpilastel peegeldi kuju kirjeldada: nõgus, läikiv, pirn on tema keskel õõnsuses.",
    "Küsi, mis juhtuks, kui pirn nihkuks fookusest välja. Vastus: kiir läheb laiali või koondub liiga vara – täpselt seda teeb halvasti reguleeritud autotuli, mis pimestab vastutulijaid.",
    "Vii ring hooki juurde tagasi: peegeldi ei tee ühtegi lisavatti, ta korjab kokku selle valguse, mis oleks muidu taha ja külgedele laiali läinud.",
  ],
  /**
   * Kus simulatsioon ja päris füüsika lahku lähevad – ütle see ETTE.
   *
   * Mudel arvutab KERAPINDA (model.ts idealiseering 1), sest ainekava räägib
   * kerapinnast ja 8. klassi joonis on kerapinnaga. Päris prožektori peegel on
   * parabool just sellepärast, et kerapind kõiki kiiri ühte punkti ei koonda.
   */
  whyRealDiffers:
    "Ütle klassile, et päris prožektori, autotule ja teleskoobi peegel on parabool, mitte kera osa. Kerapeegel koondab telje lähedased kiired hästi, aga servadelt tulevad kiired lõikavad telge peeglile lähemal – simulatsioonis on peegel meelega nii lai, et seda viga on alla 2 % ja ta ei paista välja. Kui keegi küsib, MIKS kõverpeegel toas nägu moonutab, on vastus just see: väga sügav kõverpeegel ei koonda enam ühte punkti (nii tehaksegi lõbustuspargi kõverpeeglid).",
  discussionQuestions: [
    "Miks on satelliittaldrik nõgus ja miks on tema vastuvõtja täpselt taldriku ees õhus?",
    "Miks on peegelteleskoobi peegel seda parem, mida suurem ta on?",
    "Miks pannakse kaminasse või radiaatori taha vahel läikiv plaat?",
    "Kui panna nõguspeegli fookusesse lamp ja peeglit siis aeglaselt lamedamaks muuta, mis juhtub kiirega?",
  ],
  /**
   * Millal see moodul tunnis: PÄRAST mooduleid `peegeldumisseadus` (seadus ja
   * ristsirge) ja `tasapeegli-kujutis` (tasane pind kui võrdlus). Vahetult
   * järgneb `kumerpeegel` – kaks kõverpeeglit on üks paar.
   */
  whenInLesson:
    "Pärast mooduleid „Valguse peegeldumine\" ja „Tasapeegli kujutis\": seadus ja ristsirge peavad olema selged, sest siin muutub ainult see, kust ristsirge tuleb. Vahetult järgneb „Kumerpeegel\" – kaks kõverpeeglit on üks paar ja neid on mõistlik õpetada samas või kõrvutistes tundides.",
  tip: "Lase lusikakatse teha ENNE simulatsiooni: siis on „kõverpeegel\" õpilase jaoks käega katsutud asi, mitte joonis. Simulatsioonis on kõige tähtsam liigutus raadiuse liuguri liigutamine – lase õpilasel jälgida, kuidas fookus liigub täpselt poole aeglasemalt kui raadius.",
  /**
   * Summa peab andma manifest.minutes.lesson (15 min). 45-minutilises tunnis
   * mahub kõrvale lusikakatse ja moodul „Kumerpeegel".
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
      id: "koveral-seadus-ei-kehti",
      description:
        "Õpilane arvab, et kõveral pinnal peegeldumisseadus ei kehti – kiired peegelduvad „kuidas juhtub\".",
      remedy:
        "Teooria ütleb otse, mis muutub: ainult ristsirge siht (kerapinnal on ta raadius). Explore-3 laseb õpilasel ekraanilt lugeda, et langemis- ja peegeldumisnurk on võrdsed, ja mudeli test nõuab seda võrdsust kümnete raadiuse ja kõrguse paaride juures. Klassis: iga väike tükk kõverast peeglist ON pisike tasapeegel.",
    },
    {
      id: "fookus-on-peegli-peal",
      description:
        "Õpilane arvab, et fookus on peegli pinnal või peegli kõige sügavamas kohas.",
      remedy:
        "Simulatsiooni mõõdujoon algab peegli TIPUST ja lõpeb fookuses – fookus on nähtavalt peegli EES, õhus. Exit-1 küsib sama asja sõnadega. Klassis aitab taskulamp: pirn on peegeldi süvendis õhus, mitte vastu peeglit.",
    },
    {
      id: "fookus-soltub-peegli-suurusest",
      description:
        "Õpilane arvab, et fookus sõltub sellest, kui SUUR peegel on (kui lai tema pind).",
      remedy:
        "Explore-1 ja explore-2: peegli pind jääb ekraanil samaks, muutub ainult kera raadius – ja fookus liigub. Küsi klassis: kas suur lame peegel ja väike lame peegel koondavad valgust erinevalt? Loeb ainult see, kui kõver ta on.",
    },
    {
      id: "lamedam-koondab-lahemale",
      description:
        "Õpilane arvab, et mida lamedam peegel, seda lähemal on fookus.",
      remedy:
        "Ennustus lukustub enne simulatsiooni, siis annab explore-2 raadiusega 160 cm fookuse 80 cm kaugusele – kaugemal kui 100 cm peeglil. Piirjuht aitab: täiesti lame peegel (tasapeegel) ei koonda üldse, tema fookus on lõpmatult kaugel.",
    },
    {
      id: "fookus-on-kera-keskpunkt",
      description:
        "Õpilane arvab, et fookus on seal, kus on kera keskpunkt.",
      remedy:
        "Simulatsioonis on kera keskpunkt C ja fookus korraga näha ning fookus on täpselt poole lähemal. Teooria ütleb sama arvuga: pool raadiusest. Exit-1 kolmas variant on just see väärarusaam.",
    },
    {
      id: "peegel-teeb-valgust-juurde",
      description:
        "Õpilane arvab, et peegel tekitab valgust juurde, mida pirnist ei tulnud.",
      remedy:
        "Practice-4 selgitus: peegeldi ei tee ühtegi lisavatti – ta korjab kokku selle valguse, mis oleks muidu taha ja külgedele laiali läinud, ja saadab selle ettepoole. Tunnista klassis ausalt, et ETTEPOOLE paistab tänu sellele tõesti heledam: valgus on ümber suunatud, mitte juurde tehtud.",
    },
  ] satisfies Misconception[],
};
