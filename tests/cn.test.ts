import { describe, expect, it } from "vitest";
import { cn } from "../src/ui/cn";

describe("cn", () => {
  it("liidab klassid tühikuga", () => {
    expect(cn("rounded-lg", "bg-brand")).toBe("rounded-lg bg-brand");
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
