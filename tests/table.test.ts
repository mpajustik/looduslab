import { describe, expect, it } from "vitest";
import { checkTableAnswer } from "../src/checker/table";
import type { TableRow } from "../src/engine/answers";
import type { TableQuestion } from "../src/engine/contract";
import { questionSchema } from "../src/engine/contractSchema";
import { reflectionAngle } from "../src/modules/physics/peegeldumisseadus/model";

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
