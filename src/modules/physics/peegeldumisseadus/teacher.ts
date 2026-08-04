/**
 * Õpetajajuhend (docs/MOODULILEPING.md „teacher.ts", sisu/MOODUL-peegeldumisseadus.md
 * „Väärarusaamad" + „Õpetajale").
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
  /** Vahendid päris katseks (sisu/MOODUL-peegeldumisseadus.md). */
  equipment: [
    "Laser- või taskulamp (madala võimsusega)",
    "Tasapeegel",
    "Mall nurkade mõõtmiseks (nurgamõõtja või valmis joonis)",
    "Valge paber, mille peal kiire teekonda näidata",
  ],
  safety:
    "Laserit või taskulampi ei tohi kunagi suunata silma ega peeglilt silma – peegeldunud kiir võib tabada ootamatut suunda.",
  /** Miks simulatsioon eelneb päris katsele. */
  tip: "Lase simulatsioon läbida ENNE päris katset – siis teab õpilane juba, mida katses mõõta minnakse.",
  discussionQuestions: [
    "Miks näed ennast peeglis, aga mitte seinast?",
    "Kus kasutab juuksur kahte peeglit?",
    "Kuidas töötab jalgratta helkur?",
  ],
  /**
   * Summa peab andma manifest.minutes.lesson (51 min).
   *
   * `sisu/MOODUL-peegeldumisseadus.md` ise ei nimeta teooria-samme (spetsi
   * 45 min plaan algab otse hook'ist) – need kolm lühikonspekti lisandusid
   * hiljem StepShelli raami esimese demona (samm 1.2) ja jäid mooduli
   * osaks. Kasutaja otsustas (2026-08-04) need alles jätta, mitte kärpida
   * mujalt – tund tohib olla plaanitust pikem.
   */
  lessonPlan: [
    { step: "teooria", minutes: 6 },
    { step: "hook", minutes: 5 },
    { step: "precheck", minutes: 3 },
    { step: "predict", minutes: 5 },
    { step: "explore", minutes: 10 },
    { step: "collect", minutes: 5 },
    { step: "explain", minutes: 7 },
    { step: "practice", minutes: 7 },
    { step: "exit", minutes: 3 },
  ] satisfies LessonPlanItem[],
  misconceptions: [
    {
      id: "nurk-pinna-suhtes",
      description:
        "Õpilane mõõdab nurki peegli pinnast, mitte pinna ristsirgest – annab ristsirge suhtes mõõdetud nurga asemel selle täiendnurga (90° miinus õige nurk).",
      remedy:
        "Joonista mõlemad nurgad (pinnast ja ristsirgest) samale joonisele kõrvuti – vahe jääb nähtavaks. Harjuta lõksülesannetega (practice-2), kus nurk on antud pinna suhtes.",
    },
    {
      id: "ainult-peegel-peegeldab",
      description:
        "Õpilane arvab, et ainult läikivad esemed (peeglid) peegeldavad valgust; mattpind justkui \"neelab\" kogu valguse.",
      remedy:
        "Näita simulatsioonis mattpinna hajusat peegeldumist (explore-4, lüliti avaneb pärast 2. ülesannet): miks me üldse esemeid näeme, kui mitte peegleid.",
    },
    {
      id: "mattpind-uks-kiir",
      description:
        "Õpilane arvab, et mattpind peegeldab ikka üheks kindlaks kiireks nagu tasapeegel – ei mõista, et hajumine tähendab MITUT suunda korraga.",
      remedy:
        "Lülita simulatsioonis mattpind sisse-välja: tasapeeglil üks kindel kiir, mattpinnal kimp erinevates suundades (explore-4).",
    },
    {
      id: "nurk-kiirte-vahel",
      description:
        "Õpilane mõõdab nurka langemis- ja peegeldunud kiire VAHEL, mitte kummagi kiire ja ristsirge vahel eraldi.",
      remedy:
        "Rõhuta, et langemisnurk ja peegeldumisnurk on KAKS eri nurka, mõlemad mõõdetud ristsirgest – nende summa (mitte kumbki üksi) annab kiirte vahelise nurga.",
    },
    {
      id: "peegel-ei-poora-kiirt",
      description:
        "Õpilane arvab, et peegel ainult \"edastab\" valgust edasi, ilma suunda muutmata – nagu toru, mitte pöörav pind.",
      remedy:
        "Näita üksikul peeglil kõrvuti langemis- ja peegeldunud kiirt: suund muutub selgelt. Periskoobi ülesandes (practice-3) aitab kahe pöörde eraldi joonistamine.",
    },
    {
      id: "kiir-liigub-klaasis",
      description:
        "Periskoobi ülesandes arvab õpilane, et valgus liigub kahe peegli vahel klaasi SEES, mitte õhus peeglite vahel.",
      remedy:
        "Näita periskoobi läbilõiget: valgus käib peeglite vahel õhus, toru ja peeglite raam on ainult tugikonstruktsioon.",
    },
  ] satisfies Misconception[],
};
