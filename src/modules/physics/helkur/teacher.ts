/**
 * Õpetajajuhend (docs/MOODULILEPING.md „teacher.ts",
 * sisu/MOODUL-helkur.md „Õpetajale").
 *
 * See fail EI ole osa moodulilepingu (contract.ts) tüüpidest – engine ei loe
 * teda kunagi ja checker ei kontrolli tema järgi vastuseid. Ta on inimesele
 * mõeldud materjal õpetaja töölaual.
 *
 * `misconceptions` id-d vastavad TÄPSELT `activities.ts` küsimuste
 * `misconception` siltidele – uue lõksvastuse lisamisel lisa ka siia kirje,
 * muidu jääb õpetaja väärarusaamast teadmatusse. Kooskõla valvab test. Loendis
 * on ka `nurgaviga-ei-loe`, mille lükkab ümber ARVUTUS (practice näidis ja
 * exit-2), mitte ükski vastusevariant: õpetaja peab seda ootama ka siis, kui
 * ükski valikvastus seda ei püüa.
 *
 * **Sellel moodulil ainekava praktilist tööd EI ole** (P1-PT1…PT4 on kõik juba
 * teiste moodulite all), seega ei ole siin `procedure`-välja. Pime klass
 * taskulambiga ja helkuri keeramine on (K) demonstratsioonid ja neid ei tohi
 * praktilise tööna esitada.
 *
 * Ülesannete numeratsioon on KOODI oma (activities.ts id-d), mitte
 * spetsifikatsiooni loendi oma: lahendatud näidis on `worked`-väli, mitte
 * küsimus, seega on lünkülesanne practice-1, pime tuba practice-2, kõrvalseisja
 * practice-3 ja rakenduste ülekanne practice-4.
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
    "Helkur (kõige parem rippuv helkur, mis on ka õpilastel endil kotil)",
    "Väike tasapeegel ja valge paberileht või valge riidetükk – kolm asja kõrvuti võrdlemiseks",
    "Taskulamp (telefoni lamp kõlbab ka), mida saab hoida otsaesise juures",
    "Võimalus klassi pimendada (kardinad) ja umbes 5–8 m vaba pikkust",
    "(K) valikuline: jalgratta helkur või teemärgi tükk – päris kuubinurkade välja saab lähedalt vaadata",
  ],
  /**
   * OHUTUS. Selle mooduli oht ei tule optikast, vaid pimedast klassist ja
   * silma suunatud lambist – laserit siin EI kasutata.
   */
  safety:
    "Laserosutit selles moodulis ei kasutata: helkur saadab kiire tagasi täpselt sinna, kust ta tuli, ehk otse hoidja silmadesse. Taskulamp on ohutu, aga ka teda ei suunata kellelegi näkku – hoia lampi otsaesise juures ja suuna seina poole. Pimendatud klassis lepi enne kokku, et kõik jäävad oma kohale: pimedas liikumine on selle katse ainus päris oht. Süüta valgus enne, kui keegi hakkab kohti vahetama.",
  /**
   * (K) Pime klass ja taskulamp (5 min) – mooduli päris katse.
   *
   * Katse tehakse KAKS korda: esimest korda lamp enda otsaesise juures, teist
   * korda lamp kõrvalseisja käes. Just see vahe ongi kogu moodul – loeb, kus on
   * VAATAJA valgusallika suhtes, mitte see, kui ere lamp on.
   */
  darkRoomActivity: [
    "Pane klassi tagaseinale kõrvuti kolm asja: helkur, väike tasapeegel ja valge paberileht.",
    "Kustuta valgus, mine klassi teise otsa ja hoia taskulampi OTSAESISE juures, oma silmade kõrval.",
    "Helkur „süttib\" ere valgena, paber paistab tuhmilt, peegel enamasti üldse mitte (tema saadab valguse kuhugi kõrvale).",
    "Anna nüüd taskulamp kõrvalseisjale ja palu tal valgustada, samal ajal kui sina vaatad samast kohast edasi: helkur kustub.",
    "See kaks korda tehtud katse ongi kogu moodul. Küsi klassilt, mis muutus – ei muutunud helkur ega lamp, muutus ainult see, kus on vaataja valgusallika suhtes.",
  ],
  /**
   * (K) Helkuri keeramine (2 min) – koht, kus lihtne mudel otsa saab.
   *
   * model.ts idealiseering 4: mudel eeldab, et helkur on risti valguse suunas,
   * ja viltuse helkuri kahanevat pindala ta EI arvuta.
   */
  tiltActivity: [
    "Hoia helkurit taskulambi valguses ja keera teda tasapisi viltu.",
    "Kuni umbes 40° on ta ikka ere, siis kustub kiiresti: viltu vaadates kahaneb helkuri nähtav pindala ja osa kiiri ei läbi enam kõiki kolme peeglit.",
    "Simulatsioon seda ei arvuta (idealiseering 4) – ütle see klassile välja, see on aus koht, kus lihtne mudel otsa saab.",
    "Sama katse seletab, miks soovitatakse RIPPUVAT helkurit: rippuv helkur pöörab ennast kogu aeg ja tabab õige nurga ise.",
  ],
  /**
   * Miks päris helkur on prisma, mitte peegel – üks lause, mitte uus teema.
   *
   * Täielik peegeldumine tuleb plokis P2 (valguse murdumine); siin piisab
   * sellest, et klaasi sisepind teeb sama töö ära.
   */
  whyPrism:
    "Teemärgi ja autohelkuri sees ei ole hõbetatud peeglid, vaid läbipaistvad kuubinurga kujulised prismad, kus valgus peegeldub klaasi sisepinnalt täielikult tagasi. Miks see nii saab olla, tuleb plokis P2 (valguse murdumine ja täielik peegeldumine) – siin piisab lausest „peegli asemel võib sama töö ära teha ka klaasi sisepind\". Kiirte käik prismas on täpselt sama nurkpeegli lugu.",
  /**
   * Kus simulatsioon ja päris helkur lahku lähevad – ütle see ETTE.
   *
   * model.ts idealiseeringud 1–3, 5 ja 6.
   */
  whyRealDiffers:
    "Simulatsioonis on helkur ÜKS kahe peegliga nurk ja tagasitulev valgus on terava servaga koonus, mille sees on valgus ühtlane. Päris helkur on väli sadadest kolme peegliga kuubinurkadest ja tema koonuse servad on hajusad – heledus kahaneb sujuvalt, seepärast mõõdavad standardid tagasipeegeldumist mitme nurga juures (umbes 0,2°…1,5°). Päris peegel neelab ka iga peegeldusega umbes 5 % valgusest ja peegeldusi on kolm; mudelis intensiivsust ei ole üldse, ainult ruuminurkade suhe. Võimendusarv 26 000 on seepärast SUURUSJÄRK, mitte mõõdetud väärtus. Udu, vihma ja mustust mudel ei tunne, kuigi just need viivad päris helkuri tööulatuse alla.",
  /**
   * Seos liiklusega. Seaduse sõnastust EI ole siia kirjutatud: ta muutub ja
   * vananenud tsitaat klassis on halvem kui viide.
   */
  trafficNote:
    "Pimeda ajal või halva nähtavuse korral valgustamata teel liikudes peab jalakäija kandma helkurit või valgusallikat (liiklusseadus – kontrolli kehtivat sõnastust, kui loed seda tunnis ette). Practice-näidise arvutus annab põhjuse, miks mustaks läinud, kriimustatud või murdunud servaga helkur ära visatakse: helkur töötab ainult siis, kui nurgad on täpsed ja pind puhas. Pool kraadi vormis tähendab 100 m kaugusel juba 1,7 m kõrvale.",
  discussionQuestions: [
    "Miks on helkur soovitatavalt rippumas, mitte lapiti seljakotil?",
    "Miks paistab kassi silm autotuledes samamoodi „põlema\"? (Sama põhimõte: silmapõhja taga on peegeldav kiht, mis saadab valguse allika poole tagasi.)",
    "Miks on jalgratta tagahelkur punane ja esihelkur valge?",
    "Miks jäeti Kuu peale laserreflektor ja mis oleks juhtunud, kui tema nurgad oleksid olnud kraadi võrra valed? (Kuu kauguse juures oleks kõrvalekalle tuhandeid kilomeetreid.)",
  ],
  /**
   * Millal see moodul tunnis: kohe pärast moodulit `nurkpeegel` – see on sama
   * tunni teine pool. Uut füüsikat siin ei ole, ainult ülekanne.
   */
  whenInLesson:
    "Kohe PÄRAST moodulit „Nurkpeegel\" – see on sama tunni teine pool. Uut seadust siin ei tule, on ainult ülekanne päris seadmesse, seega sobib moodul ka koduseks tööks. Pime klass ja taskulamp on aga palju parem koos klassis teha; kui see katse on plaanis, tee terve moodul tunnis.",
  tip: "Tee simulatsioon ENNE pimeda klassi katset. Ekraanil näeb viie sekundiga, et kitsas koonus möödub silmadest, ja pimedas klassis otsib õpilane siis juba kinnitust, mitte mustrit. Kõige tähtsam liigutus simulatsioonis on hajuvuse liuguri viimine kõige väiksemasse asendisse (0,1°): sealt tuleb mooduli üllatus – liiga täpne helkur on kasutu.",
  /**
   * Summa peab andma manifest.minutes.lesson (15 min). 45-minutilises tunnis
   * mahub ette moodul „Nurkpeegel" ja lõppu pimeda klassi katse.
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
      id: "peegel-on-parem",
      description:
        "Õpilane arvab, et tavaline peegel paistab pimedas paremini kui helkur, sest peegel peegeldab kõige rohkem valgust.",
      remedy:
        "Predict-1 ja teooria: tasapeegel saadab valguse ühte kindlasse suunda – teeäärne peegel viskaks autotulede valguse metsa, mitte juhile. Klassis: pime klass ja taskulamp, kus peegel enamasti üldse ei paista.",
    },
    {
      id: "valge-on-parem",
      description:
        "Õpilane arvab, et valge matt riie on parim, sest valge paistab pimedas kõige paremini.",
      remedy:
        "Explore-4: isegi kõige laiema koonuse (ω = 2°) juures on helkur veel umbes 1600 korda eredam kui matt pind. Klassis: valge paber paistab pimedas klassis tuhmilt, helkur eredalt.",
    },
    {
      id: "helkur-teeb-valgust",
      description:
        "Õpilane arvab, et helkur helendab ise – nagu fosforvärv, LED või kellaosuti.",
      remedy:
        "Practice-2 ja hook: pimedas toas ei paista helkur üldse. Klassis on see katse ilmne – kustuta lamp ja helkur kaob. Sõnastuseks „ta saadab tagasi ainult selle valguse, mis talle langeb\".",
    },
    {
      id: "tapsem-on-parem",
      description: "Õpilane arvab, et mida täpsem helkur, seda parem.",
      remedy:
        "Explore-2: ω = 0,1° juures on plekk ainult 0,3 m lai ega ulatu enam juhi silmadeni: plekk on tulede ümber, seega peaks ta silmadeni jõudmiseks olema vähemalt 1,0 m lai (silmad on tuledest 0,5 m kõrval). Explore-4 lõks annab sama tagasiside teistpidi. Just see on mooduli üllatus – päris helkur on tahtlikult natuke ebatäpne.",
    },
    {
      id: "tagasi-tahendab-silma",
      description:
        "Õpilane arvab, et kui valgus tuleb tagasi, siis juht automaatselt näeb seda.",
      remedy:
        "Explore-2 ja teooria „hind 2\": tagasi tuleb TULEDESSE, aga juhi silmad on tuledest 0,5 m kõrval. Simulatsioonis on ideaalse helkuri kiir eraldi joonega näha – ta läheb täpselt tuledesse ja silmadest mööda.",
    },
    {
      id: "nurgaviga-ei-loe",
      description:
        "Õpilane arvab, et kraadi jagu vale nurk peeglites on tühine.",
      remedy:
        "Practice-näidis ja exit-2: 100 m peal on kraad 1,7 m ja kaks kraadi 3,5 m – rohkem kui auto laius. Ükski valikvastus seda ei püüa, see tuleb ARVUTUSEST. Klassis on hea küsimus: kui palju eksib kraadi võrra vale helkur 1 km kaugusel?",
    },
    {
      id: "viga-ei-kahekordistu",
      description:
        "Õpilane arvab, et kui peeglid on 0,5° viltu, kaldub ka kiir 0,5° kõrvale.",
      remedy:
        "Teooria ja practice-näidis: pööre on kaks korda peeglite nurk (moodul „Nurkpeegel\"), seega kahekordistub ka viga. Exit-2 lõks püüab täpselt selle: kes arvutab 100 · tan 1° asemel õigest 2°-st, saab just selle tagasiside.",
    },
    {
      id: "kaugus-maarab-koik",
      description:
        "Õpilane arvab, et kõrvalseisja ei näe helkurit ainult seepärast, et ta on kaugemal.",
      remedy:
        "Practice-3: asi on koonuse SUUNAS, mitte kauguses – tee ääres seisja ei ole koonuse sees, kuigi ta võib olla juhist lähemal. Explore-3 lõks näitab sama arvudes: kaugus muudab nurka, aga ei otsusta, kes valgust näeb. Klassis: kõrvalseisja lambiga katse.",
    },
    {
      id: "helkur-vajab-liikumist",
      description:
        "Õpilane arvab, et helkur töötab ainult siis, kui vaataja või helkur liigub.",
      remedy:
        "Practice-3: liikumine ei muuda midagi, loeb ainult see, kas oled koonuse sees. Klassis seisavad kõik paigal ja helkur paistab ikka – ja kustub kohe, kui lamp läheb kõrvalseisja kätte.",
    },
    {
      id: "koik-peeglid-on-samad",
      description:
        "Õpilane arvab, et iga peegel teeb sama asja – olgu ta kumer, tasane või nurgas.",
      remedy:
        "Practice-4: turvapeegel on KUMER (lai vaateväli) ja periskoobis on kaks PARALLEELSET peeglit (suund ei muutu, tee nihkub kõrvale). Helkuris on peeglid täisnurga all – ainus nurk, mis saadab valguse tagasi. Klassis: pane kaks peeglit järjest paralleelselt ja siis täisnurga alla.",
    },
  ] satisfies Misconception[],
};
