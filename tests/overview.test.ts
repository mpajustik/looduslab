import { describe, expect, it } from "vitest";
import { courseOverview, type OverviewBlock } from "../src/engine/overview";
import type { ModuleProgress } from "../src/engine/progress";
import { DAILY_CARD_LIMIT, type ReviewItem } from "../src/engine/review";

/** Kell 12 päeval – nii ei sõltu kuupäev testija ajavööndist. */
const NOW = new Date(2026, 7, 7, 12, 0, 0);

const BLOCKS: OverviewBlock[] = [
  { title: "Valgus ja peegeldumine", moduleIds: ["m1", "m2"] },
  { title: "Valguse murdumine", moduleIds: [] },
  { title: "Rõhk", moduleIds: ["m3"] },
];

function progress(moduleId: string, status: "started" | "completed"): ModuleProgress {
  return {
    moduleId,
    moduleVersion: "1.0.0",
    status,
    currentStep: "hook",
    startedAt: NOW.toISOString(),
    finishedAt: status === "completed" ? NOW.toISOString() : null,
    responses: {},
  };
}

function card(moduleId: string, cardId: string, dueDate: string): ReviewItem {
  return {
    moduleId,
    cardId,
    dueDate,
    intervalDays: 1,
    lastResult: null,
    updatedAt: NOW.toISOString(),
  };
}

function overview(args: {
  progress?: ModuleProgress[];
  reviewItems?: ReviewItem[];
}) {
  return courseOverview({
    blocks: BLOCKS,
    progress: args.progress ?? [],
    reviewItems: args.reviewItems ?? [],
    now: NOW,
  });
}

describe("courseOverview – plokkide seis", () => {
  it("loeb iga ploki lõpetatud ja pooleli tunnid", () => {
    const result = overview({
      progress: [progress("m1", "completed"), progress("m2", "started")],
    });

    expect(result.blocks[0]).toEqual({
      title: "Valgus ja peegeldumine",
      total: 2,
      completed: 1,
      started: 1,
    });
    expect(result.blocks[2]).toEqual({
      title: "Rõhk",
      total: 1,
      completed: 0,
      started: 0,
    });
  });

  it("hoiab tühja ploki alles (seitse plokki jääb seitsmeks)", () => {
    const result = overview({});
    expect(result.blocks).toHaveLength(BLOCKS.length);
    expect(result.blocks[1]).toEqual({
      title: "Valguse murdumine",
      total: 0,
      completed: 0,
      started: 0,
    });
  });

  it("liidab kokku ainult kursusel olevad moodulid", () => {
    const result = overview({
      progress: [
        progress("m1", "completed"),
        progress("m3", "completed"),
        // Arhiveeritud moodul on seadmes alles, aga kursusel teda ei ole.
        progress("vana-moodul", "completed"),
      ],
    });

    expect(result.totalModules).toBe(3);
    expect(result.completedModules).toBe(2);
    expect(result.startedModules).toBe(0);
  });
});

describe("courseOverview – kordamise seis", () => {
  it("loeb tänased kaardid ja täna juba korratud kaardid", () => {
    const done: ReviewItem = {
      ...card("m1", "rc-1", "2026-08-10"),
      lastResult: "good",
      updatedAt: NOW.toISOString(),
    };
    const result = overview({
      reviewItems: [done, card("m1", "rc-2", "2026-08-07"), card("m1", "rc-3", "2026-08-06")],
    });

    expect(result.dueCards).toBe(2);
    expect(result.reviewedToday).toBe(1);
  });

  it("ei näita rohkem kaarte, kui päevapiir lubab", () => {
    const many = Array.from({ length: DAILY_CARD_LIMIT + 5 }, (_, index) =>
      card("m1", `rc-${index}`, "2026-08-01"),
    );
    expect(overview({ reviewItems: many }).dueCards).toBe(DAILY_CARD_LIMIT);
  });

  it("tuleviku kaart ei ole täna ootel", () => {
    expect(overview({ reviewItems: [card("m1", "rc-1", "2026-08-08")] }).dueCards).toBe(0);
  });
});

describe("courseOverview – järgmine soovitus", () => {
  it("pooleli tund käib kordamisest ees", () => {
    const result = overview({
      progress: [progress("m1", "completed"), progress("m2", "started")],
      reviewItems: [card("m1", "rc-1", "2026-08-07")],
    });

    expect(result.next).toEqual({ kind: "continue", moduleId: "m2" });
  });

  it("kordamine käib uue tunni alustamisest ees", () => {
    const result = overview({
      progress: [progress("m1", "completed")],
      reviewItems: [card("m1", "rc-1", "2026-08-07")],
    });

    expect(result.next).toEqual({ kind: "review", count: 1 });
  });

  it("ilma kaartideta soovitab kursuse järgmist alustamata tundi", () => {
    const result = overview({ progress: [progress("m1", "completed")] });
    expect(result.next).toEqual({ kind: "start", moduleId: "m2" });
  });

  it("tühjal lehel soovitab kursuse kõige esimest tundi", () => {
    expect(overview({}).next).toEqual({ kind: "start", moduleId: "m1" });
  });

  it("kõik tehtud ja kaarte ei oota – soovitust ei ole", () => {
    const result = overview({
      progress: [
        progress("m1", "completed"),
        progress("m2", "completed"),
        progress("m3", "completed"),
      ],
      reviewItems: [card("m1", "rc-1", "2026-08-20")],
    });

    expect(result.next).toEqual({ kind: "done" });
  });
});
