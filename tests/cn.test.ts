import { describe, expect, it } from "vitest";
import { cn } from "../src/ui/cn";

describe("cn", () => {
  it("liidab klassid tühikuga", () => {
    // SIHILIKULT KATKI: CI harjutus (plaan/ETAPP-0, samm 0.6).
    // Õige ootus on "rounded-lg bg-brand" – järgmine commit parandab tagasi.
    expect(cn("rounded-lg", "bg-brand")).toBe("see ootus on vale");
  });

  it("jätab välja false, null ja undefined", () => {
    expect(cn("p-4", false, null, undefined, "gap-2")).toBe("p-4 gap-2");
  });

  it("jätab välja tühja stringi, et ei tekiks topelttühikut", () => {
    expect(cn("p-4", "", "gap-2")).toBe("p-4 gap-2");
  });

  it("tagastab tühja stringi, kui midagi anda pole", () => {
    expect(cn()).toBe("");
    expect(cn(undefined)).toBe("");
  });

  it("lubab tingimuslikku klassi", () => {
    const isActive = true;
    expect(cn("tab", isActive && "tab-active")).toBe("tab tab-active");
  });
});
