import { describe, expect, it } from "vitest";
import { axisTicks, tickDecimals, tickLabel } from "../src/ui/steps/tableGraphAxis";

/**
 * Mõõtetabeli graafiku teljesildid.
 *
 * Testitakse ainult ARVUDE vormistust, mitte SVG-d: sildi tekst on ainus koht,
 * kus joonis saab õpilasele valet öelda. Punktide asukoha eest vastutab
 * lineaarteisendus, mida silmaga näeb.
 *
 * CodeRabbiti ülevaatuse leid (2026-08-04): fikseeritud üks komakoht andis
 * kitsal teljel kaks ühesugust silti.
 */

/** Sildid ühe telje otste vahemikust – nii, nagu komponent nad koostab. */
function labels(min: number, max: number): string[] {
  const ticks = axisTicks(min, max);
  const decimals = tickDecimals(ticks);
  return ticks.map((tick) => tickLabel(tick, decimals));
}

describe("teljesildid", () => {
  it("kirjutab vedeliku rõhu mooduli teljed täisarvudena", () => {
    // Sügavus 0–2 m ja rõhk 0–20 kPa: komakohta siin vaja ei ole.
    expect(labels(0, 2)).toEqual(["0", "1", "2"]);
    expect(labels(0, 20)).toEqual(["0", "10", "20"]);
  });

  it("lisab komakoha, kui keskmine silt seda nõuab", () => {
    expect(labels(0, 1)).toEqual(["0", "0,5", "1"]);
  });

  it("ei anna kitsal teljel kahele eri kohale ühesugust silti", () => {
    // Enne parandust: „0", „0,1", „0,1" – kaks eri kohta näevad ühesugused.
    const narrow = labels(0, 0.1);
    expect(new Set(narrow).size).toBe(narrow.length);
  });

  it("ei näita silti, mis on oma väärtusest mööda", () => {
    // Ainult „erinevusest" ei piisaks: teljel 0–2,5 oleks „3" küll teistest
    // erinev, aga näitaks arvu, mida teljel ei ole.
    expect(labels(0, 2.5)).toEqual(["0", "1,25", "2,50"]);
  });

  it("kasutab eesti koma, mitte punkti", () => {
    expect(labels(0, 1).join(" ")).not.toContain(".");
  });
});
