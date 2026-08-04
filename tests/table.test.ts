import { describe, expect, it } from "vitest";
import { checkTableAnswer } from "../src/checker/table";
import type { TableRow } from "../src/engine/answers";
import type { TableQuestion } from "../src/engine/contract";
import { questionSchema } from "../src/engine/contractSchema";
import { reflectionAngle } from "../src/modules/physics/peegeldumisseadus/model";
import {
  LIQUID_DENSITIES,
  pressure,
  toKilopascals,
} from "../src/modules/physics/vedeliku-rohk/model";

/**
 * Mõõtetabeli checker (sisu/MOODUL-peegeldumisseadus.md „collect").
 *
 * ±1° on LUGEMISTOLERANTS, mitte mõõtmisviga: simulatsioon on ideaalne, aga
 * õpilane loeb liugurilt ja tipib käsitsi.
 */

const question: TableQuestion = {
  kind: "table",
  id: "collect-1",
  prompt: "Kolm mõõtmist simulatsioonist",
  // `min`/`max` on liuguri piirid (Simulation.tsx) – väljaspool seda ei saa
  // ükski mõõtmine simulatsioonist tulla.
  columns: [
    { key: "angleIn", label: "Langemisnurk", unit: "°", min: 0, max: 85 },
    { key: "angleOut", label: "Peegeldumisnurk", unit: "°", min: 0, max: 85 },
  ],
  rows: 3,
  distinctColumn: "angleIn",
  rule: {
    kind: "equal-columns",
    column: "angleOut",
    equalsColumn: "angleIn",
    tolerance: { mode: "absolute", value: 1 },
  },
};

/** Lühend: paarid → tabeli read. */
function table(...pairs: [string, string][]): TableRow[] {
  return pairs.map(([angleIn, angleOut]) => ({ angleIn, angleOut }));
}

describe("checkTableAnswer – korras tabel", () => {
  it("võtab vastu kolm eri nurka, mis mudeliga klapivad", () => {
    const result = checkTableAnswer(question, table(["0", "0"], ["30", "30"], ["85", "85"]));
    expect(result.correct).toBe(true);
  });

  it("loeb koma ja ühikuga kirjutatud väärtused", () => {
    // „30,0" ja „45 °" peavad jõudma checkerini muutmata ja siin loetavaks –
    // sama lugemine, mis üksiku arvvastuse juures (src/checker/number.ts).
    const result = checkTableAnswer(
      question,
      table(["30,0", "30"], ["45 °", "45,0°"], ["60", "60"]),
    );
    expect(result.correct).toBe(true);
  });

  it("lubab lugemistolerantsi piires eksida", () => {
    // Õpilane luges 30 pealt 31 – täpselt ±1° peal, seega veel õige.
    expect(
      checkTableAnswer(question, table(["10", "11"], ["30", "31"], ["60", "59"])).correct,
    ).toBe(true);
  });

  it("ei luba tolerantsist väljas olevat rida", () => {
    const result = checkTableAnswer(
      question,
      table(["10", "10"], ["30", "31,5"], ["60", "60"]),
    );
    expect(result.correct).toBe(false);
    // Tagasiside nimetab rea, aga EI ütle, mis seal olema peaks:
    // seaduspärasuse sõnastamine on järgmise sammu (explain) töö.
    expect(result.feedback).toContain("2. rida");
    expect(result.feedback).not.toContain("30");
  });
});

describe("checkTableAnswer – kolm ERI nurka", () => {
  it("ei võta vastu sama nurka mitmes reas", () => {
    const result = checkTableAnswer(question, table(["30", "30"], ["30", "30"], ["60", "60"]));
    expect(result.correct).toBe(false);
    expect(result.feedback).toContain("Langemisnurk");
  });

  it("ei lase eristamatut väärtust kolmandaks mõõtmiseks", () => {
    // 30 ja 30,2 mahuvad sama lugemistolerantsi sisse – need ei ole kaks
    // mõõtmist, vaid üks mõõtmine kaks korda kirja pandud.
    expect(
      checkTableAnswer(question, table(["30", "30"], ["30,2", "30"], ["60", "60"])).correct,
    ).toBe(false);
  });
});

describe("checkTableAnswer – katkine sisestus", () => {
  it("ei võta vastu poolikut tabelit", () => {
    const rows: TableRow[] = [
      { angleIn: "30", angleOut: "30" },
      { angleIn: "45", angleOut: "" },
      { angleIn: "60", angleOut: "60" },
    ];
    const result = checkTableAnswer(question, rows);
    expect(result.correct).toBe(false);
    expect(result.feedback).toContain("täitmata");
  });

  it("ei võta vastu puuduvat lahtrit", () => {
    const rows: TableRow[] = [
      { angleIn: "30", angleOut: "30" },
      { angleIn: "45" },
      { angleIn: "60", angleOut: "60" },
    ];
    expect(checkTableAnswer(question, rows).correct).toBe(false);
  });

  it("ei tunne teksti arvuna ära", () => {
    const result = checkTableAnswer(
      question,
      table(["30", "kolmkümmend"], ["45", "45"], ["60", "60"]),
    );
    expect(result.correct).toBe(false);
    expect(result.feedback).toContain("1. reas");
  });

  it("ei võta vastu sobimatut ühikut", () => {
    const result = checkTableAnswer(question, table(["30", "30 cm"], ["45", "45"], ["60", "60"]));
    expect(result.correct).toBe(false);
    expect(result.feedback).toContain("ühik");
  });

  it("ei võta vastu vale ridade arvu", () => {
    expect(checkTableAnswer(question, table(["30", "30"], ["45", "45"])).correct).toBe(false);
  });
});

describe("checkTableAnswer – väärtus peab olema simulatsioonist saadav", () => {
  // Codexi ülevaatuse leid (2026-08-03): ilma vahemikuta läbis „iga kaks
  // võrdset arvu" kontrolli, ka selline, mida liuguril olemas ei ole.
  it("ei võta vastu negatiivset nurka", () => {
    const result = checkTableAnswer(
      question,
      table(["-10", "-10"], ["30", "30"], ["60", "60"]),
    );
    expect(result.correct).toBe(false);
    expect(result.feedback).toContain("1. reas");
  });

  it("ei võta vastu liuguri ülempiirist suuremat nurka", () => {
    expect(
      checkTableAnswer(question, table(["30", "30"], ["100", "100"], ["60", "60"])).correct,
    ).toBe(false);
  });

  it("ei võta vastu ilmselgelt võimatuid väärtusi, kuigi veerud on võrdsed", () => {
    expect(
      checkTableAnswer(
        question,
        table(["-10", "-10"], ["100", "100"], ["10000", "10000"]),
      ).correct,
    ).toBe(false);
  });

  it("lubab täpselt piiril olevad väärtused", () => {
    expect(
      checkTableAnswer(question, table(["0", "0"], ["85", "85"], ["40", "40"])).correct,
    ).toBe(true);
  });
});

describe("tabeli reegel klapib füüsikamudeliga", () => {
  it("mudeli järgi arvutatud paarid on checkeri jaoks õiged", () => {
    // See on selle sammu kõige tähtsam test: `equal-columns` reegel on
    // activities.ts-i ANDMED, aga tõde peab tulema model.ts-ist (CLAUDE.md
    // reegel 1). Kui peegeldumisseadus mudelis kunagi muutub, kukub see test –
    // muidu läheks tabel vaikselt mudelist lahku.
    const angles = [0, 15, 30, 60, 85];
    for (let index = 0; index + 2 < angles.length; index += 1) {
      const rows = angles.slice(index, index + 3).map((angle) => ({
        angleIn: String(angle),
        angleOut: String(reflectionAngle(angle)),
      }));
      expect(checkTableAnswer(question, rows).correct).toBe(true);
    }
  });
});

/**
 * Võrdeline reegel (`proportional`, sisu/MOODUL-vedeliku-rohk.md „collect").
 *
 * Kordaja tuleb mudelist, mitte kirjutatud arvust – täpselt nii, nagu moodul
 * ise teeb. Tolerants 0,1 kPa on näidiku täpsus: sim on ideaalne, aga õpilane
 * loeb kPa ühe komakohaga.
 */
const KPA_PER_METRE = toKilopascals(pressure(LIQUID_DENSITIES.vesi, 1));

const graphQuestion: TableQuestion = {
  kind: "table",
  id: "collect-1",
  prompt: "Neli mõõtmist vees",
  columns: [
    { key: "depth", label: "Sügavus", unit: "m", min: 0, max: 2, step: 0.1 },
    { key: "pressure", label: "Rõhk", unit: "kPa", min: 0, max: 20 },
  ],
  rows: 4,
  distinctColumn: "depth",
  distinctTolerance: { mode: "absolute", value: 0.05 },
  rule: {
    kind: "proportional",
    column: "pressure",
    perColumn: "depth",
    factor: KPA_PER_METRE,
    tolerance: { mode: "absolute", value: 0.1 },
  },
  graph: { x: "depth", y: "pressure" },
};

/** Lühend: paarid (sügavus; rõhk) → tabeli read. */
function depths(...pairs: [string, string][]): TableRow[] {
  return pairs.map(([depth, pressureCell]) => ({ depth, pressure: pressureCell }));
}

describe("checkTableAnswer – võrdeline seos", () => {
  it("võtab vastu neli punkti, mis mudeliga klapivad", () => {
    // See on selle sammu kõige tähtsam test: kui `pressure` mudelis muutub,
    // kukub siin, mitte vaikselt õpilase ekraanil (CLAUDE.md reegel 1).
    const rows = [0, 0.5, 1, 2].map((depthM) => ({
      depth: String(depthM),
      pressure: toKilopascals(pressure(LIQUID_DENSITIES.vesi, depthM)).toFixed(1),
    }));
    expect(checkTableAnswer(graphQuestion, rows).correct).toBe(true);
  });

  it("lubab näidiku ümardust ka kõige väiksemal sügavusel", () => {
    // 0,1 m → 0,98 kPa, näidik kuvab 1,0. Protsenttolerants (±2% = 0,02 kPa)
    // lükkaks selle tagasi – seepärast on tolerants absoluutne.
    expect(
      checkTableAnswer(
        graphQuestion,
        depths(["0,1", "1,0"], ["0,5", "4,9"], ["1", "9,8"], ["2", "19,6"]),
      ).correct,
    ).toBe(true);
  });

  it("võtab nullpunkti vastu tavalise mõõtmisena", () => {
    // h = 0 on graafiku nullpunkt, mitte erijuht (samm 1.15 otsused).
    expect(
      checkTableAnswer(
        graphQuestion,
        depths(["0", "0"], ["0,5", "4,9"], ["1", "9,8"], ["1,5", "14,7"]),
      ).correct,
    ).toBe(true);
  });

  it("ei võta vastu rida, kus rõhk sügavusega kokku ei käi", () => {
    const result = checkTableAnswer(
      graphQuestion,
      depths(["0,5", "4,9"], ["1", "19,6"], ["1,5", "14,7"], ["2", "19,6"]),
    );
    expect(result.correct).toBe(false);
    expect(result.feedback).toContain("2. rida");
    // Tagasiside ei ütle, mis seal olema peaks – seaduspärasuse sõnastab
    // õpilane järgmises küsimuses.
    expect(result.feedback).not.toContain("9,8");
  });

  it("ei võta vastu väljamõeldud võrdelist rida", () => {
    // Punktid on omavahel ilusti sirgel (p = 2·h), aga sellist lugemit
    // simulatsioonist ei saa – kordaja on mudelist, mitte õpilase peast.
    expect(
      checkTableAnswer(
        graphQuestion,
        depths(["0,5", "1"], ["1", "2"], ["1,5", "3"], ["2", "4"]),
      ).correct,
    ).toBe(false);
  });

  it("ei loe kahte kõrvutist liuguriastet üheks mõõtmiseks", () => {
    // 0,5 ja 0,6 on kaks eri mõõtmist. Reegli tolerants (0,1 kPa) neelaks
    // selle vahe alla, kui teda kasutataks meetrite peal – seepärast on
    // eristatavusel oma arv.
    expect(
      checkTableAnswer(
        graphQuestion,
        depths(["0,5", "4,9"], ["0,6", "5,9"], ["1", "9,8"], ["2", "19,6"]),
      ).correct,
    ).toBe(true);
  });

  it("ei võta vastu sama sügavust kaks korda", () => {
    const result = checkTableAnswer(
      graphQuestion,
      depths(["0,5", "4,9"], ["0,5", "4,9"], ["1", "9,8"], ["2", "19,6"]),
    );
    expect(result.correct).toBe(false);
    expect(result.feedback).toContain("Sügavus");
  });

  it("ei võta vastu sügavust, mida liuguril olemas ei ole", () => {
    // Codexi ülevaatuse leid (2026-08-04): vahemikust üksi ei piisa. Liuguri
    // samm on 0,1 m ja näidik näitab üht komakohta, seega 0,05 m ei ole
    // mõõtmine – need punktid on ilusti sirgel, aga ekraanil neid ei olnud.
    const result = checkTableAnswer(
      graphQuestion,
      depths(["0,05", "0,5"], ["0,95", "9,3"], ["1,45", "14,2"], ["1,95", "19,1"]),
    );
    expect(result.correct).toBe(false);
    expect(result.feedback).toContain("1. reas");
  });

  it("ei võta vastu liuguri piiridest välja jäävat sügavust", () => {
    expect(
      checkTableAnswer(
        graphQuestion,
        depths(["0,5", "4,9"], ["1", "9,8"], ["2", "19,6"], ["10", "98"]),
      ).correct,
    ).toBe(false);
  });

  it("loeb ühikuga kirjutatud lahtri ja teisendab paskalid", () => {
    // „4900 Pa" on sama arv teises ühikus – lugemine on number.ts töö.
    expect(
      checkTableAnswer(
        graphQuestion,
        depths(["0,5 m", "4900 Pa"], ["1", "9,8 kPa"], ["1,5", "14,7"], ["2", "19,6"]),
      ).correct,
    ).toBe(true);
  });
});

describe("tableQuestionSchema – valvurid", () => {
  it("võtab vastu korras tabeliküsimuse", () => {
    expect(() => questionSchema.parse(question)).not.toThrow();
  });

  it("ei luba reeglil osutada olematule veerule", () => {
    expect(() =>
      questionSchema.parse({
        ...question,
        rule: { ...question.rule, equalsColumn: "puudub" },
      }),
    ).toThrow();
  });

  it("ei luba veerul võrduda iseendaga", () => {
    expect(() =>
      questionSchema.parse({
        ...question,
        rule: { ...question.rule, equalsColumn: "angleOut" },
      }),
    ).toThrow();
  });

  it("ei luba distinctColumn-il osutada olematule veerule", () => {
    expect(() => questionSchema.parse({ ...question, distinctColumn: "puudub" })).toThrow();
  });

  it("ei luba võrrelda eri ühikus veerge", () => {
    expect(() =>
      questionSchema.parse({
        ...question,
        columns: [
          { key: "angleIn", label: "Langemisnurk", unit: "°" },
          { key: "angleOut", label: "Peegeldumisnurk", unit: "cm" },
        ],
      }),
    ).toThrow();
  });

  it("võtab vastu korras võrdelise tabeliküsimuse", () => {
    expect(() => questionSchema.parse(graphQuestion)).not.toThrow();
  });

  it("ei luba võrdelisel reeglil osutada olematule veerule", () => {
    expect(() =>
      questionSchema.parse({
        ...graphQuestion,
        rule: { ...graphQuestion.rule, perColumn: "puudub" },
      }),
    ).toThrow();
  });

  it("ei luba veerul olla võrdeline iseendaga", () => {
    expect(() =>
      questionSchema.parse({
        ...graphQuestion,
        rule: { ...graphQuestion.rule, perColumn: "pressure" },
      }),
    ).toThrow();
  });

  it("ei luba nulli ega negatiivset kordajat", () => {
    for (const factor of [0, -9.8]) {
      expect(() =>
        questionSchema.parse({ ...graphQuestion, rule: { ...graphQuestion.rule, factor } }),
      ).toThrow();
    }
  });

  it("nõuab eri ühikus eristataval veerul oma tolerantsi", () => {
    // Ilma selleta võrreldaks meetreid kilopaskalites lubatud veaga ja kaks
    // eri sügavust loetaks vaikselt üheks mõõtmiseks.
    const withoutTolerance = { ...graphQuestion };
    delete withoutTolerance.distinctTolerance;
    expect(() => questionSchema.parse(withoutTolerance)).toThrow();
  });

  it("lubab sama ühiku korral eristatavusel reegli tolerantsi kasutada", () => {
    // Peegeldumisseaduse tabelis (kraadid mõlemal pool) on distinctTolerance
    // puudu ja see on korras – vana moodul ei tohi uue välja pärast katki minna.
    expect(() => questionSchema.parse(question)).not.toThrow();
  });

  it("ei luba graafikut ilma veeru piirideta", () => {
    // Ise skaleeruv telg venitaks iga tabeli sirgeks ja peidaks vea ära.
    expect(() =>
      questionSchema.parse({
        ...graphQuestion,
        columns: [
          { key: "depth", label: "Sügavus", unit: "m", min: 0 },
          { key: "pressure", label: "Rõhk", unit: "kPa", min: 0, max: 20 },
        ],
      }),
    ).toThrow();
  });

  it("ei luba graafiku teljel kokku langevaid otspunkte", () => {
    // Codexi ülevaatuse leid (2026-08-04): `min: 0, max: 0` läbis skeemi
    // (min <= max on lubatud), aga joonis kaob brauseris vaikselt ära –
    // ja järgmine küsimus palub just selle kuju kohta vastata.
    expect(() =>
      questionSchema.parse({
        ...graphQuestion,
        columns: [
          { key: "depth", label: "Sügavus", unit: "m", min: 0, max: 0, step: 0.1 },
          { key: "pressure", label: "Rõhk", unit: "kPa", min: 0, max: 20 },
        ],
      }),
    ).toThrow();
  });

  it("ei luba sammu, mis ei ole positiivne", () => {
    expect(() =>
      questionSchema.parse({
        ...graphQuestion,
        columns: [
          { key: "depth", label: "Sügavus", unit: "m", min: 0, max: 2, step: 0 },
          { key: "pressure", label: "Rõhk", unit: "kPa", min: 0, max: 20 },
        ],
      }),
    ).toThrow();
  });

  it("ei luba graafiku teljel osutada olematule veerule", () => {
    expect(() =>
      questionSchema.parse({ ...graphQuestion, graph: { x: "puudub", y: "pressure" } }),
    ).toThrow();
  });

  it("ei luba mõlemat telge sama veeru peal", () => {
    expect(() =>
      questionSchema.parse({ ...graphQuestion, graph: { x: "depth", y: "depth" } }),
    ).toThrow();
  });

  it("ei luba kahel veerul sama võtit", () => {
    expect(() =>
      questionSchema.parse({
        ...question,
        columns: [
          { key: "angleIn", label: "Langemisnurk", unit: "°" },
          { key: "angleIn", label: "Peegeldumisnurk", unit: "°" },
        ],
      }),
    ).toThrow();
  });
});
