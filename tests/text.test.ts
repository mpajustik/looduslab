import { describe, expect, it } from "vitest";
import { countWords } from "../src/lib/text";

/**
 * Sõnade lugemine explain-sammu pikkusenõude jaoks (`minWords`).
 *
 * See on SISESTUSE, mitte õigsuse kontroll – sisu üle otsustab õpetaja
 * (CLAUDE.md reegel 3). Seepärast on ta lubav: kahtluse korral pigem loeb
 * sõnaks, kui jätab õpilase nupu taha kinni.
 */

describe("countWords", () => {
  it("loeb tavalise lause sõnad", () => {
    expect(countWords("Peegeldumisnurk on alati sama suur kui langemisnurk")).toBe(7);
  });

  it("ei loe tühja teksti ega ainult tühikuid", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   \n  ")).toBe(0);
  });

  it("ei lase mitmel tühikul ega reavahetusel arvu paisutada", () => {
    expect(countWords("  üks   kaks \n kolm  ")).toBe(3);
  });

  it("loeb sidekriipsuga sõna üheks", () => {
    // „väide–tõend–põhjendus" on õpilase jaoks üks mõiste, mitte kolm sõna.
    expect(countWords("väide–tõend–põhjendus")).toBe(1);
  });

  it("ei nõua kirjavahemärkide järel tühikut", () => {
    expect(countWords("Nurgad on võrdsed.")).toBe(3);
  });
});
