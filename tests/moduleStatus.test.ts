import { describe, expect, it } from "vitest";
import { deriveModuleStatus } from "../src/engine/moduleStatus";
import type { ModuleProgress } from "../src/engine/progress";

const NOW = new Date(2026, 7, 7, 12, 0, 0);

function progress(status: "started" | "completed"): ModuleProgress {
  return {
    moduleId: "m1",
    moduleVersion: "1.0.0",
    status,
    currentStep: "hook",
    startedAt: NOW.toISOString(),
    finishedAt: status === "completed" ? NOW.toISOString() : null,
    responses: {},
  };
}

describe("deriveModuleStatus", () => {
  it("annab not-started, kui moodulikäiku pole", () => {
    expect(deriveModuleStatus(undefined, false)).toBe("not-started");
  });

  it("annab not-started ka siis, kui käiku pole, aga (vale) due-kaart oleks", () => {
    // Ilma moodulikäiguta ei saa kordamiskaarti olla, aga funktsioon ei tohi
    // due-lipust hooleta esimest kontrolli mööda lasta.
    expect(deriveModuleStatus(undefined, true)).toBe("not-started");
  });

  it("annab in-progress, kui moodul on pooleli", () => {
    expect(deriveModuleStatus(progress("started"), false)).toBe("in-progress");
  });

  it("annab in-progress, kui moodul on pooleli, ka siis, kui due-kaart on olemas", () => {
    expect(deriveModuleStatus(progress("started"), true)).toBe("in-progress");
  });

  it("annab completed, kui moodul on lõpetatud ja ühtki kaarti ei oota", () => {
    expect(deriveModuleStatus(progress("completed"), false)).toBe("completed");
  });

  it("annab needs-review, kui moodul on lõpetatud ja mõni kaart ootab täna", () => {
    expect(deriveModuleStatus(progress("completed"), true)).toBe("needs-review");
  });
});
