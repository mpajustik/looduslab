import { describe, expect, it } from "vitest";
import {
  buildCoverage,
  parseCurriculum,
  summarizeModules,
  type ManifestLike,
} from "../scripts/coverageRules";

/** Väike ainekava sama kujuga nagu sisu/AINEKAVA-fyysika-8.md. */
const ainekava = `# Pealkiri

Sissejuhatav jutt, mida parser ei tohi kirjeteks pidada.

## P1. Valgus ja peegeldumine

**Õpitulemused:**

- **P1-T1** tunneb valgusallikaid
- **P1-T2** tunneb peegeldumise seadust,
  konstrueerib jooniseid

**Õppesisu:** valgus kui energia; peegeldumine

**Põhimõisted:** valguskiir, tasapeegel,
mattpind

**Praktilised tööd:**

- **P1-PT1** varju uurimine
- **P1-PT2** peegeldumisseaduse uurimine

**Õpilase tegevused:**

- (D) võrdleb valgusallikaid

## P5. Rõhk

**Õpitulemused:**

- **P5-T1** seletab rõhku

**Põhimõisted:** rõhk, õhurõhk

**Praktilised tööd:**

- **P5-PT1** rõhu määramine

## Katvuse reeglid

1. Iga õpitulemus peab olema kaetud
`;

const moodul = (osad: Partial<ManifestLike>): ManifestLike => ({
  id: "physics.test",
  title: "Test",
  status: "active",
  outcomes: [],
  concepts: [],
  practicalWork: [],
  ...osad,
});

describe("parseCurriculum", () => {
  const blocks = parseCurriculum(ainekava);

  it("leiab plokid, aga mitte lõpupeatükki „Katvuse reeglid“", () => {
    expect(blocks.map((block) => block.id)).toEqual(["P1", "P5"]);
    expect(blocks[0].title).toBe("Valgus ja peegeldumine");
  });

  it("eristab õpitulemused praktilistest töödest (-T vs -PT)", () => {
    expect(blocks[0].outcomes.map((entry) => entry.id)).toEqual(["P1-T1", "P1-T2"]);
    expect(blocks[0].practicalWork.map((entry) => entry.id)).toEqual(["P1-PT1", "P1-PT2"]);
  });

  it("liidab mitmele reale murtud teksti kokku", () => {
    expect(blocks[0].outcomes[1].text).toBe(
      "tunneb peegeldumise seadust, konstrueerib jooniseid",
    );
    expect(blocks[0].concepts).toEqual(["valguskiir", "tasapeegel", "mattpind"]);
  });

  it("ei pea õpilase tegevusi ega õppesisu kirjeteks", () => {
    expect(blocks[0].outcomes).toHaveLength(2);
    expect(blocks[0].concepts).not.toContain("valgus kui energia");
  });

  it("viskab vea, kui ID plokinumber ei klapi pealkirjaga", () => {
    expect(() =>
      parseCurriculum("## P1. Valgus\n\n- **P2-T1** vale ploki all\n"),
    ).toThrow(/P2-T1/);
  });

  it("viskab vea, kui plokk jääb tühjaks (faili kuju on muutunud)", () => {
    expect(() => parseCurriculum("## P1. Valgus\n\nlihtsalt teksti\n")).toThrow(/P1/);
  });

  it("viskab vea, kui kirje ID on katki – vaikselt kaduv õpitulemus on hullem", () => {
    // P1-T0 ei sobi mustriga (ID-d algavad ühest). Enne parandust liideti see
    // rida eelmise kirje TEKSTI otsa ja õpitulemus kadus raportist jäljetult.
    expect(() =>
      parseCurriculum("## P1. Valgus\n\n- **P1-T1** esimene\n- **P1-T0** katkine\n"),
    ).toThrow(/P1-T0/);
  });

  it("viskab vea, kui ainekavas ei ole ühtegi plokki", () => {
    // Ilma selleta annaks vale või tühi fail „0/0 (100%)" – roheline raport
    // olukorras, kus ainekava on hoopis kaotsi läinud.
    expect(() => parseCurriculum("# Pealkiri\n\nlihtsalt teksti\n")).toThrow(/plokki/);
  });
});

describe("buildCoverage", () => {
  const blocks = parseCurriculum(ainekava);

  it("näitab, kes mida katab", () => {
    const coverage = buildCoverage(blocks, [
      moodul({ id: "physics.a", outcomes: ["P1-T2"], practicalWork: ["P1-PT2"] }),
    ]);

    const p1 = coverage.blocks[0];
    expect(p1.outcomes.find((item) => item.id === "P1-T2")?.modules).toEqual(["physics.a"]);
    expect(p1.outcomes.find((item) => item.id === "P1-T1")?.modules).toEqual([]);
    expect(p1.practicalWork.find((item) => item.id === "P1-PT2")?.modules).toEqual([
      "physics.a",
    ]);
    expect(coverage.totals.outcomes).toEqual({ covered: 1, total: 3 });
    expect(coverage.totals.practicalWork).toEqual({ covered: 1, total: 3 });
  });

  it("loeb kaks moodulit sama õpitulemuse juurde", () => {
    const coverage = buildCoverage(blocks, [
      moodul({ id: "physics.a", outcomes: ["P1-T1"] }),
      moodul({ id: "physics.b", outcomes: ["P1-T1"] }),
    ]);

    expect(coverage.blocks[0].outcomes[0].modules).toEqual(["physics.a", "physics.b"]);
    expect(coverage.totals.outcomes.covered).toBe(1);
  });

  it("EI arvesta arhiveeritud moodulit", () => {
    const coverage = buildCoverage(blocks, [
      moodul({ id: "physics.vana", status: "archived", outcomes: ["P1-T1"] }),
    ]);

    expect(coverage.blocks[0].outcomes[0].modules).toEqual([]);
    expect(coverage.ignoredModules).toEqual(["physics.vana"]);
  });

  it("tundmatu ID on viga, mitte katvuse auk", () => {
    const coverage = buildCoverage(blocks, [
      moodul({ id: "physics.a", outcomes: ["P9-T1"], practicalWork: ["P9-PT1"] }),
    ]);

    expect(coverage.unknownReferences).toHaveLength(2);
    expect(coverage.unknownReferences[0]).toContain("P9-T1");
    expect(coverage.totals.outcomes.covered).toBe(0);
  });

  it("tundmatu mõiste on lubatud – ainekava põhimõisted on miinimum", () => {
    const coverage = buildCoverage(blocks, [
      moodul({ id: "physics.a", concepts: ["valguskiir", "peegeldumisnurk"] }),
    ]);

    expect(coverage.unknownReferences).toEqual([]);
    expect(coverage.extraConcepts).toEqual([
      { module: "physics.a", concept: "peegeldumisnurk" },
    ]);
    expect(coverage.totals.concepts.covered).toBe(1);
  });

  it("mõistet võrreldakse suurtähest ja reamurdmisest hoolimata", () => {
    const coverage = buildCoverage(blocks, [
      moodul({ id: "physics.a", concepts: ["Tasapeegel", "õhu  rõhk"] }),
    ]);

    expect(coverage.blocks[0].concepts.find((item) => item.id === "tasapeegel")?.modules).toEqual(
      ["physics.a"],
    );
    // „õhu rõhk" EI ole „õhurõhk" – tühik on tähendust muutev, mitte kosmeetiline.
    expect(coverage.extraConcepts).toHaveLength(1);
  });

  it("mõiste läheb kirja ka teise ploki moodulist (loetakse nime järgi)", () => {
    const coverage = buildCoverage(blocks, [
      moodul({ id: "physics.a", concepts: ["õhurõhk"] }),
    ]);

    expect(coverage.blocks[1].concepts.find((item) => item.id === "õhurõhk")?.modules).toEqual([
      "physics.a",
    ]);
  });
});

describe("summarizeModules", () => {
  it("annab ainult aktiivsed moodulid koos nende ainekava seostega", () => {
    const summary = summarizeModules([
      moodul({ id: "physics.a", title: "A", outcomes: ["P1-T1"], concepts: ["valguskiir"] }),
      moodul({ id: "physics.vana", status: "archived" }),
    ]);

    expect(summary).toEqual([
      {
        id: "physics.a",
        title: "A",
        outcomes: ["P1-T1"],
        practicalWork: [],
        concepts: ["valguskiir"],
      },
    ]);
  });
});
