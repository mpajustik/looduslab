import { describe, expect, it } from "vitest";
import { formatNumber } from "../src/lib/format";

/** Sisemine tühik – sama, mida formatNumber tuhandete vahele paneb. */
const NBSP = " ";

describe("formatNumber", () => {
  it("eraldab tuhanded sisemise tühikuga", () => {
    expect(formatNumber(19600)).toBe(`19${NBSP}600`);
    expect(formatNumber(1000000)).toBe(`1${NBSP}000${NBSP}000`);
  });

  it("jätab lühikese arvu puutumata", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(999)).toBe("999");
  });

  it("kasutab kümnendkoha eraldajana koma", () => {
    expect(formatNumber(9.81, 2)).toBe("9,81");
    expect(formatNumber(1234.5, 1)).toBe(`1${NBSP}234,5`);
  });

  it("säilitab miinusmärgi", () => {
    expect(formatNumber(-1500)).toBe(`-1${NBSP}500`);
  });
});
