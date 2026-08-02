import { describe, expect, it } from "vitest";
import { NAV_ITEMS } from "../src/app/navigation";

describe("navigatsioon", () => {
  it("hoiab disainijuhise piiri: maksimaalselt 4 valikut", () => {
    expect(NAV_ITEMS.length).toBeLessThanOrEqual(4);
  });

  it("ei sisalda korduvat aadressi", () => {
    const paths = NAV_ITEMS.map((item) => item.to);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("kasutab absoluutseid aadresse ja eestikeelseid silte", () => {
    for (const item of NAV_ITEMS) {
      expect(item.to.startsWith("/")).toBe(true);
      expect(item.label.length).toBeGreaterThan(0);
      // Alumine riba on 360 px laiusel neljas tulbas – pikk silt ei mahu.
      expect(item.shortLabel.length).toBeLessThanOrEqual(10);
    }
  });

  it("märgib õpetaja-ala eraldi (kollane värv tuleb sellest lipust)", () => {
    const teacherItems = NAV_ITEMS.filter((item) => item.teacher);
    expect(teacherItems.map((item) => item.to)).toEqual(["/opetaja"]);
  });
});
