import { describe, expect, it } from "vitest";
import { startProgress, type ModuleProgress } from "../src/engine/progress";
import {
  parseSyncQueue,
  serializeSyncQueue,
  type SyncQueue,
} from "../src/engine/syncQueue";

const progress = (moduleId = "physics.demo"): ModuleProgress =>
  startProgress({
    moduleId,
    moduleVersion: "1.0.0",
    currentStep: "precheck-1",
    now: new Date("2026-08-05T10:00:00.000Z"),
  });

describe("serializeSyncQueue + parseSyncQueue", () => {
  it("toob sama järjekorra tagasi", () => {
    const queue: SyncQueue = {
      "physics.demo": { op: "write", progress: progress(), reset: false },
      "physics.teine": { op: "delete" },
    };

    expect(parseSyncQueue(serializeSyncQueue(queue))).toEqual(queue);
  });

  it("tühi salvestus annab tühja järjekorra", () => {
    expect(parseSyncQueue(null)).toEqual({});
    expect(parseSyncQueue("")).toEqual({});
  });

  it("rämps ei tee krahhi", () => {
    expect(parseSyncQueue("{ see ei ole json")).toEqual({});
    expect(parseSyncQueue("[1, 2, 3]")).toEqual({});
  });

  it("tundmatu failiversioon visatakse kõrvale", () => {
    const raw = JSON.stringify({ version: 99, pending: { "physics.demo": { op: "delete" } } });

    expect(parseSyncQueue(raw)).toEqual({});
  });

  it("katkine kirje ei võta teisi kaasa", () => {
    const raw = JSON.stringify({
      version: 1,
      pending: {
        "physics.katki": { op: "write", progress: { moduleId: 42 } },
        "physics.teine": { op: "delete" },
      },
    });

    expect(parseSyncQueue(raw)).toEqual({ "physics.teine": { op: "delete" } });
  });

  it("katkist reset-lippu ei loeta kustutamiskäsuks", () => {
    const raw = JSON.stringify({
      version: 1,
      pending: {
        "physics.demo": { op: "write", progress: progress(), reset: "jah" },
      },
    });

    expect(parseSyncQueue(raw)).toEqual({
      "physics.demo": { op: "write", progress: progress(), reset: false },
    });
  });

  it("vale mooduli alla pandud edenemist ei usuta", () => {
    const raw = JSON.stringify({
      version: 1,
      pending: { "physics.demo": { op: "write", progress: progress("physics.teine") } },
    });

    expect(parseSyncQueue(raw)).toEqual({});
  });

  it("tundmatu tegevus visatakse kõrvale", () => {
    const raw = JSON.stringify({
      version: 1,
      pending: { "physics.demo": { op: "kustuta-koik" } },
    });

    expect(parseSyncQueue(raw)).toEqual({});
  });
});
