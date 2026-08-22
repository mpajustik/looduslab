import { describe, expect, it } from "vitest";
import { GRADABLE_KINDS, formatAnswer } from "../src/app/pages/classResponses";
import { questionCheckers } from "../src/checker";
import type { LabelQuestion, Question } from "../src/engine/contract";

/**
 * Õpetaja klassivaate kaks kohta, kust uus küsimuseliik VAIKSELT välja
 * kukkus (Codexi ülevaatuse leid 2026-08-22): vastuse vormistus ja
 * „Kus läks valesti" koond.
 *
 * Ekraani siin ei renderdata (keskkond on node) – need on puhtad
 * funktsioonid, mille üle vaade otsustab.
 */

const labelQuestion: LabelQuestion = {
  kind: "label",
  id: "practice-4",
  prompt: "Märgi joonisele, mis on mis.",
  figure: "peegeldumise-osad",
  spots: [
    { id: "s1", marker: 1, answer: "langev-kiir" },
    { id: "s2", marker: 2, answer: "ristsirge" },
  ],
  names: [
    { id: "langev-kiir", text: "langev kiir" },
    { id: "ristsirge", text: "pinna ristsirge" },
  ],
};

describe("formatAnswer", () => {
  it("näitab sildistamisvastust nii, nagu õpilane ta andis", () => {
    // Enne parandust langes label-vastus mõõtetabeli reale ja õpetaja nägi
    // iga vastuse asemel teksti „(mõõtetabel)".
    expect(
      formatAnswer(labelQuestion, {
        kind: "label",
        picks: { s1: "langev-kiir", s2: "ristsirge" },
      }),
    ).toBe("1 – langev kiir, 2 – pinna ristsirge");
  });

  it("ei näita tühja vastust mõõtetabelina", () => {
    expect(formatAnswer(labelQuestion, { kind: "label", picks: {} })).toBe("(märkimata)");
  });
});

describe("GRADABLE_KINDS", () => {
  it("sisaldab sildistamist – checker hindab teda", () => {
    expect(GRADABLE_KINDS).toContain("label");
  });

  it("ei sisalda vabateksti ega mõõtetabelit", () => {
    // Vabateksti ei hinnata kunagi (CLAUDE.md reegel 3) ja mõõtetabelil on
    // töö ise mõõtmine – kumbki ei kuulu „kus läks valesti" koondi.
    expect(GRADABLE_KINDS).not.toContain("text");
    expect(GRADABLE_KINDS).not.toContain("table");
  });

  it("ei nimeta liiki, mida skeem ei tunne", () => {
    // Kaks loendit ei tohi lahku minna: checkeri register on kõigi liikide
    // tõe allikas.
    const known = Object.keys(questionCheckers) as Question["kind"][];
    for (const kind of GRADABLE_KINDS) {
      expect(known).toContain(kind);
    }
  });
});
