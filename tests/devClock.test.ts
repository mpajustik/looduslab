import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createDevClock,
  DEV_CLOCK_KEY,
  MAX_OFFSET_DAYS,
  parseOffsetDays,
  shiftedNow,
} from "../src/lib/devClock";
import type { StorageLike } from "../src/lib/storage";

/** Mälupõhine localStorage'i teisik – sama muster mis review.test.ts-is. */
function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const storage: StorageLike = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
  return { storage, data };
}

/** Kell 12 päeval – nii ei sõltu kuupäev testija ajavööndist. */
const NOW = new Date(2026, 7, 7, 12, 0, 0);

describe("parseOffsetDays", () => {
  it("loeb päris arvu", () => {
    expect(parseOffsetDays("7")).toBe(7);
    expect(parseOffsetDays("-3")).toBe(-3);
  });

  it("annab tühja salvestuse peale nulli", () => {
    expect(parseOffsetDays(null)).toBe(0);
    expect(parseOffsetDays("")).toBe(0);
  });

  it("annab rikutud väärtuse peale nulli", () => {
    // Käsitsi muudetud salvestus ei tohi anda kuupäeva „NaN-NaN-NaN".
    expect(parseOffsetDays("homme")).toBe(0);
    expect(parseOffsetDays("Infinity")).toBe(0);
  });

  it("viskab murdosa ära ja surub piiridesse", () => {
    expect(parseOffsetDays("2.9")).toBe(2);
    expect(parseOffsetDays("1000000")).toBe(MAX_OFFSET_DAYS);
    expect(parseOffsetDays("-1000000")).toBe(-MAX_OFFSET_DAYS);
  });
});

describe("shiftedNow", () => {
  it("nihutab kuupäeva, jätab kellaaja alles", () => {
    const shifted = shiftedNow(1, NOW);
    expect(shifted.getFullYear()).toBe(2026);
    expect(shifted.getMonth()).toBe(7);
    expect(shifted.getDate()).toBe(8);
    expect(shifted.getHours()).toBe(12);
  });

  it("nihe 0 annab sama hetke", () => {
    expect(shiftedNow(0, NOW).getTime()).toBe(NOW.getTime());
  });

  it("liigub üle kuupiiri õigesti", () => {
    // 7. august + 25 päeva = 1. september, mitte „32. august".
    const shifted = shiftedNow(25, NOW);
    expect(shifted.getMonth()).toBe(8);
    expect(shifted.getDate()).toBe(1);
  });
});

describe("createDevClock", () => {
  // Päris kell tagasi ka siis, kui test vahepeal katkeb – muidu jääks
  // külmutatud aeg järgmiste testide kaela.
  afterEach(() => {
    vi.useRealTimers();
  });

  it("alustab päris ajast", () => {
    const { storage } = memoryStorage();
    expect(createDevClock(() => storage).offsetDays()).toBe(0);
  });

  it("liidab nihkeid ja salvestab need", () => {
    const { storage, data } = memoryStorage();
    const clock = createDevClock(() => storage);

    expect(clock.shift(1)).toBe(1);
    expect(clock.shift(7)).toBe(8);
    expect(clock.offsetDays()).toBe(8);
    expect(data.get(DEV_CLOCK_KEY)).toBe("8");
  });

  it("hoiab nihke piirides ka suure sammu korral", () => {
    const { storage } = memoryStorage();
    const clock = createDevClock(() => storage);
    expect(clock.shift(1e9)).toBe(MAX_OFFSET_DAYS);
  });

  it("nullimine viib tagasi päris aja peale", () => {
    const { storage, data } = memoryStorage({ [DEV_CLOCK_KEY]: "5" });
    const clock = createDevClock(() => storage);

    clock.reset();
    expect(clock.offsetDays()).toBe(0);
    expect(data.has(DEV_CLOCK_KEY)).toBe(false);
  });

  it("loeb salvestatud nihke `now`-sse", () => {
    // Kell külmutatakse: ilma selleta loeks test `new Date()` kaks korda ja
    // täpselt südaöö vahetusel jääks võrdlus eri päevadele – punane test
    // ilma päris veata (mõlema ülevaataja leid 2026-08-07).
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    const { storage } = memoryStorage({ [DEV_CLOCK_KEY]: "2" });
    const clock = createDevClock(() => storage);

    expect(clock.now().getTime()).toBe(shiftedNow(2, NOW).getTime());
  });

  it("ilma salvestuseta seade saab päris aja", () => {
    const clock = createDevClock(() => null);
    expect(clock.shift(3)).toBe(0);
    expect(clock.offsetDays()).toBe(0);
  });

  it("katkine salvestus ei lõhu kella", () => {
    const { storage } = memoryStorage({ [DEV_CLOCK_KEY]: "eile" });
    const clock = createDevClock(() => storage);
    expect(clock.offsetDays()).toBe(0);
    expect(Number.isFinite(clock.now().getTime())).toBe(true);
  });
});
