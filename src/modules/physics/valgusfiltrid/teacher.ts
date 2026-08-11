/**
 * Õpetajajuhend (docs/MOODULILEPING.md „teacher.ts",
 * sisu/MOODUL-valgusfiltrid.md „Õpetajale").
 *
 * See fail EI ole osa moodulilepingu (contract.ts) tüüpidest – engine ei loe
 * teda kunagi ja checker ei kontrolli tema järgi vastuseid. Ta on inimesele
 * mõeldud materjal õpetaja töölaual.
 *
 * `misconceptions` id-d vastavad TÄPSELT `activities.ts` küsimuste
 * `misconception` siltidele – uue lõksvastuse lisamisel lisa ka siia kirje,
 * muidu jääb õpetaja väärarusaamast teadmatusse. Kooskõla valvab test.
 *
 * **Sellel moodulil ON ainekava praktiline töö: P1-PT2** („värvilise valguse
 * uurimine valgusfiltritega"). Seepärast on siin `procedure` – katse käik koos
 * HÜPOTEESIGA, nagu ainekava nõuab. Simulatsioon üksi praktilist tööd ei asenda:
 * ainekava tahab, et õpilane ka päris kilesid käes hoiaks.
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
    "Värvilised läbipaistvad kiled: punane, roheline, sinine ja kollane (sobivad kaustakaante kiled, tsellofaan, teatrikile näidised või värviline klaaspaber)",
    "Tugev valge taskulamp või telefoni taskulamp",
    "Valge paber või valge sein ekraaniks",
    "Maalriteip kilede kinnitamiseks",
    "Pime või pimendatud tuba",
    "(K) anaglüüfi jaoks: punane ja sinine viltpliiats, valge paber ning punane ja sinine kile (või vanad 3D-prillid)",
  ],
  /**
   * OHUTUS. Selle mooduli kõige tähtsam lause ei ole taskulambi kohta, vaid
   * kile kohta: värviline kile EI kaitse silma. Õpilane, kes usub vastupidist,
   * võib vaadata läbi kile Päikest või päikesevarjutust.
   */
  safety:
    "Taskulambiga ei valgustata kellelegi silma. Päikest ei vaadata ka läbi värvilise kile – kile EI kaitse silma, ta võtab ära ainult osa nähtavast valgusest, mitte ohtlikku kiirgust. Sama põhjusel ei vaadata läbi kile ka päikesevarjutust. Päikeseprillide klaas ei ole värvifilter selle sõna mõttes ja teda ei kasutata katses.",
  /**
   * (K) P1-PT2 päris katse käik.
   *
   * Hüpotees on 1. punktis ja ta on KIRJALIK: ainekava nõuab praktiliselt
   * töölt hüpoteesi ning suuline arvamus ununeb kohe, kui tulemus on ekraanil.
   * Just kollane + sinine on see paar, mille peal hüpotees enamasti puruneb.
   */
  procedure: [
    "Iga rühm kirjutab ENNE katset hüpoteesi: mis tuleb ekraanile, kui valge valgus läbib kollase ja siis sinise kile?",
    "Valgusta valget paberit taskulambiga ja pane ette üks kile korraga. Kirjuta üles, mis värvi paber iga kilega paistab.",
    "Pane kaks kilet üksteise peale ja kirjuta iga paari tulemus üles: kollane + sinine, punane + sinine, kollane + roheline.",
    "Vaheta kilede järjekord ära ja vaata, kas tulemus muutub.",
    "Võrdle hüpoteesiga ja sõnasta järeldus: läbi pääseb ainult see värv, mida lasevad läbi mõlemad kiled.",
  ],
  /**
   * Kus simulatsioon ja päris klass lahku lähevad – ütle see ETTE.
   *
   * Mudel loeb KANALEID, mitte energiat (model.ts idealiseeringud 1 ja 2).
   * Ilma selle jututa jääb õpilane uskuma, et katse ebaõnnestus: ekraanil on
   * „pime" päris pime, klassis on ta väga tume punakas.
   */
  whyRealDiffers:
    "Ütle klassile ette kolm asja. 1) Päris kile neelab osa ka „omast\" värvist, seega iga kile lisab hämarust ja kahe kile taga on tuntavalt tumedam kui ühe taga – simulatsioonis heledust ei ole. 2) Päris kile ei ole puhas: punane kile laseb tavaliselt natuke ka oranži ja kollast läbi, seega „pime\" on klassis pigem väga tume punakas kui täiesti must. 3) Kaks ühesugust punast kilet üksteise peal annavad simulatsioonis täpselt sama tulemuse mis üks, päris elus aga nähtavalt tumedama – mudel loeb värve, mitte heledust. Kui see vahe ette öelda, ei jää õpilane uskuma, et katse ebaõnnestus.",
  /**
   * (K) Anaglüüf ehk 3D-prillid – ainekava soovitatud tegevus ja practice-4
   * ülekandeülesande päris vaste.
   */
  anaglyphActivity: [
    "Joonista valgele paberile sama lihtne kujund kaks korda – üks kord punase, teine kord sinise viltpliiatsiga, veidi nihkes.",
    "Vaata läbi punase klaasi või punase kile: punane joonis kaob valge paberi taustal peaaegu ära, sinine paistab tumedana. Sinise klaasiga on vastupidi.",
    "Seleta, et 3D-pildis on kummalegi silmale mõeldud pilt joonistatud eri värviga ja prillid annavad igale silmale ainult tema oma pildi – nii tekib ajus ruumiline mulje.",
    "Kui prille käepärast ei ole, leiab vana punase-sinise 3D-pildi internetist; siis piisab kiledest.",
  ],
  discussionQuestions: [
    "Miks on fotograafi stuudios prožektori ees kile, mitte värviline lamp?",
    "Miks on pimikus punane valgus?",
    "Miks paistab kollane päästevest tänavavalgustuse all määrdunud oranž?",
    "Kui panna päikeseprillid taskulambi ette, kas tuleb värviline valgus – ja miks mitte?",
  ],
  /**
   * Millal see moodul tunnis: PÄRAST mooduleid `liitvalgus-ja-spekter` (valges
   * valguses on mitu värvi korraga) ja `esemete-varvus` (peegeldumine ja
   * neeldumine). Filter on „sama lugu, aga läbi eseme" ja ülekandeülesanne
   * (anaglüüf) eeldab mõlemat.
   */
  whenInLesson:
    "Pärast mooduleid „Liitvalgus ja spekter\" ning „Esemete värvus\". Filter on sama lugu, aga läbi eseme – ja anaglüüfi ülesanne eeldab mõlemat.",
  tip: "Lase simulatsioon läbida ENNE päris katset: simulatsioonis on tulemus puhas (pime on päriselt pime), päris kiledega jääb alati veidi valgust läbi. Õpilane ennustab simulatsiooniga, kiledega kontrollib.",
  /**
   * Summa peab andma manifest.minutes.lesson (20 min). 45-minutilises tunnis
   * järgneb sellele päris katse kiledega (`procedure`).
   */
  lessonPlan: [
    { step: "hook", minutes: 2 },
    { step: "theory", minutes: 3 },
    { step: "predict", minutes: 2 },
    { step: "explore", minutes: 6 },
    { step: "practice", minutes: 4 },
    { step: "exit", minutes: 3 },
  ] satisfies LessonPlanItem[],
  misconceptions: [
    {
      id: "filter-lisab-varvi",
      description:
        "Õpilane arvab, et filter värvib valguse ära, nagu värv värvib seina – ta lisab midagi juurde.",
      remedy:
        "Teooria ütleb otse: filter ainult VÕTAB ÄRA. Explore-5 näitab, et punane valgus rohelise filtriga ei anna rohelist, vaid pimeduse. Mudeli test valvab sama asja tsükliga: läbi läinud värvid on ALATI langenud valguse alamhulk.",
    },
    {
      id: "filtrid-segavad-varve",
      description:
        "Õpilane arvab, et kaks järjestikust filtrit segavad värve nagu guašš: kollane + sinine = roheline.",
      remedy:
        "Ennustus lukustub enne katset, siis näitab explore-3, et kollane ja sinine filter koos annavad pimeduse. Sõnadega: purgis segatakse värviAINEID, mis valgust neelavad; kaks kilet ei sega midagi, kumbki ainult võtab ära.",
    },
    {
      id: "filtrite-jarjekord-loeb",
      description:
        "Õpilane arvab, et tulemus sõltub sellest, kumb filter on ees.",
      remedy:
        "Explore-4 palub filtrid pesades ära vahetada – tulemus ei muutu. Mudeli test käib tsükliga läbi KÕIK filtripaarid kõigi valgustega, mitte ühe näite. Reegel: läbi pääseb ainult mõlema filtri ühine värv, ja ühisosa ei tea, kumb oli ees.",
    },
    {
      id: "filter-ei-vota-midagi",
      description:
        "Õpilane arvab, et filtri taga on sama palju valgust, ainult teist värvi.",
      remedy:
        "Hook algab soojast kilest, teooria seletab neeldumise ja simulatsiooni riba näitab, kui suur osa jääb kinni („kinni jääb 2 värvi 3-st\"). Klassis pane käsi kile taha ja siis kile ette – vahe on näha.",
    },
    {
      id: "filter-teeb-valgust",
      description:
        "Õpilane arvab, et filter suudab teha värvi, mida talle langevas valguses ei ole.",
      remedy:
        "Explore-5 (punane valgus, roheline filter) ja practice-3 (kollane valgus, sinine filter) annavad mõlemad pimeduse. Küsi klassis: mida see filter läbi laseb – ja kas seda värvi üldse temani jõuab?",
    },
    {
      id: "filter-lahutab-nagu-prisma",
      description:
        "Õpilane arvab, et filter lahutab valge valguse värvideks, nagu prisma.",
      remedy:
        "Teooria tõmbab piiri ühe lausega: prisma lahutab värvid laiali ja kõik jäävad alles; filter võtab osa ära ja need kaovad soojusena. Simulatsioonis on näha, et filtri taga on nooli VÄHEM, mitte laiali.",
    },
  ] satisfies Misconception[],
};
