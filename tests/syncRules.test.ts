import { describe, expect, it } from "vitest";
import { findBlockingConflicts, findOrphans } from "../scripts/syncRules";

const peegeldumine = { id: "physics.peegeldumisseadus", slug: "peegeldumisseadus" };
const rohk = { id: "physics.vedeliku-rohk", slug: "vedeliku-rohk" };

describe("findBlockingConflicts", () => {
  it("lubab kirjutada, kui registri ja baasi read klapivad", () => {
    expect(findBlockingConflicts([peegeldumine, rohk], [peegeldumine, rohk])).toEqual([]);
  });

  it("lubab kirjutada, kui baas on tühi (esimene sünk)", () => {
    expect(findBlockingConflicts([peegeldumine, rohk], [])).toEqual([]);
  });

  it("keelab kirjutamise, kui olemasoleva mooduli slug on muutunud", () => {
    const problems = findBlockingConflicts(
      [{ id: "physics.vedeliku-rohk", slug: "vedelike-rohk" }],
      [rohk],
    );

    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("physics.vedeliku-rohk");
    expect(problems[0]).toContain("vedeliku-rohk");
  });

  it("keelab kirjutamise, kui slug kuulub baasis teisele moodulile", () => {
    const problems = findBlockingConflicts(
      [{ id: "physics.rohk-vedelikus", slug: "vedeliku-rohk" }],
      [rohk],
    );

    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("physics.vedeliku-rohk");
  });

  it("annab slugide vahetamisel mõlema mooduli kohta teate", () => {
    const problems = findBlockingConflicts(
      [
        { id: "physics.peegeldumisseadus", slug: "vedeliku-rohk" },
        { id: "physics.vedeliku-rohk", slug: "peegeldumisseadus" },
      ],
      [peegeldumine, rohk],
    );

    // Kaks moodulit × kaks reeglit (slug muutus + slug kuulub teisele).
    expect(problems).toHaveLength(4);
  });
});

describe("findOrphans", () => {
  it("ei leia orbe, kui baas ja register klapivad", () => {
    expect(findOrphans([peegeldumine, rohk], [peegeldumine, rohk])).toEqual([]);
  });

  it("leiab mooduli, mis on baasis, aga mitte registris", () => {
    expect(findOrphans([peegeldumine], [peegeldumine, rohk])).toEqual([
      "physics.vedeliku-rohk",
    ]);
  });

  it("ei pea uut moodulit orvuks", () => {
    expect(findOrphans([peegeldumine, rohk], [peegeldumine])).toEqual([]);
  });
});
