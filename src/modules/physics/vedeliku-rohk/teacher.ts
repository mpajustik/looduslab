/**
 * Õpetajajuhend (docs/MOODULILEPING.md „teacher.ts", sisu/MOODUL-vedeliku-rohk.md
 * „Õpetajale").
 *
 * See fail EI ole osa moodulilepingu (contract.ts) tüüpidest – engine ei
 * loe teda kunagi, checker ei kontrolli tema järgi vastuseid. Ta on
 * inimesele mõeldud materjal, mida näitab õpetaja töölaud (TeacherPage,
 * etapp 2). Kuni selle ekraanini valmib, on need lihtsalt andmed, mida
 * keegi ei loe – sama kokkulepe mis `reviewCards`-il.
 *
 * `misconceptions` id-d vastavad TÄPSELT `activities.ts` küsimuste
 * `misconception` siltidele – kui uus lõksvastus lisandub, lisa ka siia
 * kirje, muidu jääb õpetaja väärarusaamast teadmatusse.
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
  /** Vahendid päris katseks (sisu/MOODUL-vedeliku-rohk.md „Õpetajale"). */
  equipment: [
    "1,5-liitrine plastpudel",
    "Naaskel või nael kolme augu tegemiseks (eri kõrgustel)",
    "Kleepteip aukude sulgemiseks enne vee valamist",
    "Vesi",
    "Vann või õueala – katse teeb märjaks",
  ],
  safety:
    "Auke tehakse ainult õpetaja järelevalve all (terav ese) ja katse tehakse vanni kohal või õues – kolmest august purskav vesi teeb ümbruse märjaks.",
  /**
   * Miks simulatsioon eelneb päris katsele.
   *
   * NB: „kaugeim juga" on lennuulatuse (kaugvise) küsimus, mida see moodul
   * EI õpeta – klassikaline „lekkiva ämbri" katse näitab, et kaugeimale
   * jõuab tegelikult KESKMINE auk, mitte alumine (vt sammu 1.20 otsused,
   * `activities.ts` practice-4 kommentaar). Kasuta seda vaatlust
   * uudishimu tekitajana ja mainigi vastuolu, aga ÄRA lase sellest saada
   * mooduli õpitulemust – moodul testib ainult joa KIIRUST/rõhku, mis
   * kasvab sügavusega monotoonselt.
   */
  tip: "Lase simulatsioon läbida ENNE päris katset – õpilane teab siis juba, et joa KIIRUS kasvab sügavusega. Kui katses paistab kaugeim juga tulevat keskmisest august, mitte alumisest, ütle ausalt, et see on teine (lennuulatuse) küsimus, mida moodul ei õpeta – ei vale vastus, lihtsalt mujale kuuluv.",
  discussionQuestions: [
    "Miks on sukeldujal sügavuse piir?",
    "Miks on suure tammi müür alumises otsas paksem kui ülal?",
    "Kuidas töötab veetorn?",
  ],
  /**
   * Summa peab andma manifest.minutes.lesson (45 min). Moodulil ei ole
   * teooria-sammu (erinevalt peegeldumisseaduse moodulist) – tund algab
   * otse hook'ist (sisu/MOODUL-vedeliku-rohk.md „45 min plaan").
   */
  lessonPlan: [
    { step: "hook", minutes: 5 },
    { step: "precheck", minutes: 4 },
    { step: "predict", minutes: 4 },
    { step: "explore", minutes: 10 },
    { step: "collect", minutes: 6 },
    { step: "explain", minutes: 6 },
    { step: "practice", minutes: 8 },
    { step: "exit", minutes: 2 },
  ] satisfies LessonPlanItem[],
  misconceptions: [
    {
      id: "rohk-tihedus-segi",
      description:
        "Õpilane segab rõhu (jõud pindalaühiku kohta) ja tiheduse (mass ruumalaühiku kohta) valemid omavahel.",
      remedy:
        "Kõrvuta mõlemad valemid (p = F/S, ρ = m/V) ja nende ühikud (Pa vs kg/m³) – erinevad ühikud teevad vahe nähtavaks.",
    },
    {
      id: "vee-tihedus-vale",
      description:
        "Õpilane ei tea vee tihedust peast või ajab suurusjärgu sassi (100 kg/m³ või 10 000 kg/m³ asemel 1000 kg/m³).",
      remedy:
        "Seo tuttava kogusega: 1 liiter vett kaalub ligikaudu 1 kg, seega 1 m³ (1000 l) kaalub 1000 kg.",
    },
    {
      id: "paskal-tihedus-segi",
      description: "Õpilane arvab, et paskal (Pa) on tiheduse, mitte rõhu ühik.",
      remedy:
        "Tuleta paskal otse valemist: p = F/S, seega [Pa] = [N]/[m²] = 1 N/m². Tihedusel on hoopis oma ühik, kg/m³.",
    },
    {
      id: "paskal-toojoud-segi",
      description: "Õpilane ajab paskali (rõhk) segi töö või jõumomendi ühikuga (N·m).",
      remedy:
        "Rõhk jagab jõu PINDALAGA (jagamine), töö korrutab jõu TEEPIKKUSEGA (korrutamine) – erinev tehe, erinev ühik.",
    },
    {
      id: "kuju-mojutab-rohku",
      description:
        "Õpilane arvab, et laiemas, suuremas või teistsuguse kujuga anumas on sama sügavuse juures suurem rõhk (hüdrostaatiline paradoks jääb mõistmata).",
      remedy:
        "Näita simulatsioonis kolme eri kujuga anumat sama veetasemega – rõhk põhjas on võrdne. Loeb ainult see, mis on ANDURI KOHAL (sügavus ja vedelik), mitte anuma kogumaht.",
    },
    {
      id: "tihedus-vale-suund",
      description:
        "Õpilane arvab, et kergem vedelik (õli) annab samal sügavusel SUUREMA rõhu kui vesi – suund on ümber pööratud.",
      remedy:
        "Rõhk on tihedusega VÕRDELINE (p = ρ·g·h): väiksem tihedus tähendab väiksemat rõhku samal sügavusel. Vaheta simulatsioonis vesi ja õli samal sügavusel ja loe näitu.",
    },
    {
      id: "rohk-ei-solju-tihedusest",
      description: "Õpilane arvab, et vedeliku vahetus ei muuda rõhku samal sügavusel üldse.",
      remedy:
        "Vaheta simulatsioonis vedelikku sügavust muutmata – näidik muutub kohe. Tihedus on valemis (p = ρ·g·h) sama olulisel kohal kui sügavus.",
    },
    {
      id: "rohk-kullastub",
      description:
        "Õpilane loeb graafikult, et rõhk kasvab alguses kiiresti ja sügavamal aina aeglasemalt (justkui lähenedes mingile piirile).",
      remedy:
        "Näita, et graafiku punktid on TÄPSELT sirgel, mitte kõveral – kahekordne sügavus annab alati kahekordse rõhu, ka kõige sügavamas otsas.",
    },
    {
      id: "rohk-ruutsoltuvus",
      description:
        "Õpilane arvab, et sügavuse kahekordistamisel kasvab rõhk neli korda (ruutsõltuvus, nagu mõnel teisel füüsikaseosel).",
      remedy:
        "p = ρ·g·h on ESIMESE astme seos h suhtes, mitte ruutseos. Kontrolli oma tabelist: 2× sügavus andis TÄPSELT 2× rõhu, mitte 4×.",
    },
    {
      id: "rohk-ei-solju-sugavusest",
      description:
        "Õpilane arvab, et rõhk on kõikjal anumas ühesugune, sõltumata sügavusest (nt tünni kõigist aukudest purskab vesi ühtviisi kõvasti).",
      remedy:
        "Näita tünni joonist: alumise augu kohal on kõige rohkem vett ja seal on kõige suurem rõhk, seega purskab vesi sealt kõige suurema kiirusega.",
    },
    {
      id: "cm-m-teisendus",
      description:
        "Õpilane jätab sügavuse valemisse sentimeetrites, unustades teisendada meetriteks (nt 40 cm asemel arvutab 40-ga, mitte 0,4-ga).",
      remedy:
        "Rõhuta, et valem p = ρ·g·h nõuab sügavust MEETRITES. Harjuta teisendust eraldi, enne kui arv valemisse läheb (40 cm = 0,4 m).",
    },
  ] satisfies Misconception[],
};
