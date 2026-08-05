import { describe, expect, it } from "vitest";
import { startProgress, withCurrentStep, type ModuleProgress } from "../src/engine/progress";
import { parseSyncQueue, SYNC_QUEUE_KEY } from "../src/engine/syncQueue";
import {
  createProgressSync,
  type PushResult,
  type RemoteProgress,
} from "../src/lib/progressSync";
import type { StorageLike } from "../src/lib/storage";

/** Mälupõhine localStorage'i teisik – testid jooksevad node-keskkonnas. */
function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const storage: StorageLike = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
  return { storage, data };
}

/** Server, mis vastab ette antud tulemustega ja peab kutsutust arvet. */
function fakeRemote(results: PushResult[] = []) {
  const pushed: ModuleProgress[] = [];
  const resets: boolean[] = [];
  const removed: string[] = [];
  let next = 0;
  const answer = (): PushResult => results[next++] ?? "ok";

  const remote: RemoteProgress = {
    push: (progress, reset) => {
      pushed.push(progress);
      resets.push(reset);
      return Promise.resolve(answer());
    },
    remove: (moduleId) => {
      removed.push(moduleId);
      return Promise.resolve(answer());
    },
  };
  return { remote, pushed, resets, removed };
}

const demo = startProgress({
  moduleId: "physics.demo",
  moduleVersion: "1.0.0",
  currentStep: "precheck-1",
  now: new Date("2026-08-05T10:00:00.000Z"),
});

describe("createProgressSync", () => {
  it("saadab edenemise ja tühjendab järjekorra", async () => {
    const { storage, data } = memoryStorage();
    const { remote, pushed } = fakeRemote();
    const sync = createProgressSync(remote, () => storage);

    sync.push(demo);
    await sync.flush();

    expect(pushed).toEqual([demo]);
    expect(data.has(SYNC_QUEUE_KEY)).toBe(false);
  });

  it("võrguvea korral jääb vastus järjekorda ja läheb hiljem teele", async () => {
    const { storage } = memoryStorage();
    const { remote, pushed } = fakeRemote(["retry"]);
    const sync = createProgressSync(remote, () => storage);

    sync.push(demo);
    await sync.flush();

    expect(pushed).toEqual([demo]);
    expect(parseSyncQueue(storage.getItem(SYNC_QUEUE_KEY))).toEqual({
      "physics.demo": { op: "write", progress: demo, reset: false },
    });

    await sync.flush();

    expect(pushed).toEqual([demo, demo]);
    expect(storage.getItem(SYNC_QUEUE_KEY)).toBeNull();
  });

  it("kirjutamatut rida ei proovita lõputult uuesti", async () => {
    const { storage } = memoryStorage();
    const { remote, pushed } = fakeRemote(["skipped"]);
    const sync = createProgressSync(remote, () => storage);

    sync.push(demo);
    await sync.flush();
    await sync.flush();

    expect(pushed).toEqual([demo]);
    expect(storage.getItem(SYNC_QUEUE_KEY)).toBeNull();
  });

  it("alustamine otsast saadab käigu kustutamise", async () => {
    const { storage } = memoryStorage();
    const { remote, removed } = fakeRemote();
    const sync = createProgressSync(remote, () => storage);

    sync.remove("physics.demo");
    await sync.flush();

    expect(removed).toEqual(["physics.demo"]);
  });

  it("saatmata jäänud kustutamine kandub uue seisuga edasi", async () => {
    const { storage } = memoryStorage();
    const { remote, pushed, resets, removed } = fakeRemote(["retry"]);
    const sync = createProgressSync(remote, () => storage);
    const uus = withCurrentStep(demo, "explore-1");

    sync.remove("physics.demo"); // „Alusta uuesti" võrguta
    await sync.flush();
    sync.push(uus); // õpilane vastab kohe uuesti
    await sync.flush();

    // Kustutamine ei kadunud uue seisu alla ära, vaid sõidab sellega kaasa.
    expect(removed).toEqual(["physics.demo"]);
    expect(pushed).toEqual([uus]);
    expect(resets).toEqual([true]);
    expect(storage.getItem(SYNC_QUEUE_KEY)).toBeNull();
  });

  it("lipp püsib, kuni seis päriselt kohale jõuab", async () => {
    const { storage } = memoryStorage();
    const { remote, resets } = fakeRemote(["retry", "retry"]);
    const sync = createProgressSync(remote, () => storage);

    sync.remove("physics.demo");
    await sync.flush();
    sync.push(demo);
    await sync.flush(); // katkine võrk
    sync.push(withCurrentStep(demo, "explore-1"));
    await sync.flush();

    expect(resets).toEqual([true, true]);
  });

  it("tavaline vastus ei kustuta serveris midagi", async () => {
    const { storage } = memoryStorage();
    const { remote, resets, removed } = fakeRemote();
    const sync = createProgressSync(remote, () => storage);

    sync.push(demo);
    await sync.flush();

    expect(resets).toEqual([false]);
    expect(removed).toEqual([]);
  });

  it("uuem seis asendab saatmata vana seisu, mitte ei lisandu talle", async () => {
    const { storage } = memoryStorage();
    const { remote, pushed } = fakeRemote(["retry"]);
    const sync = createProgressSync(remote, () => storage);
    const later = withCurrentStep(demo, "explore-1");

    sync.push(demo);
    await sync.flush(); // katkine võrk – jääb järjekorda
    sync.push(later);
    await sync.flush();

    // Vahepealset seisu EI saadeta uuesti: iga saadetis on kogu hetkeseis.
    expect(pushed).toEqual([demo, later]);
    expect(storage.getItem(SYNC_QUEUE_KEY)).toBeNull();
  });

  it("saatmise ajal tekkinud uuem seis ei lähe kaduma", async () => {
    const { storage } = memoryStorage();
    const pushed: ModuleProgress[] = [];
    const later = withCurrentStep(demo, "explore-1");

    let started = () => {};
    const firstStarted = new Promise<void>((resolve) => {
      started = resolve;
    });
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    const remote: RemoteProgress = {
      push: async (progress) => {
        pushed.push(progress);
        if (pushed.length === 1) {
          started();
          await gate;
        }
        return "ok";
      },
      remove: () => Promise.resolve("ok"),
    };

    const sync = createProgressSync(remote, () => storage);
    sync.push(demo);
    await firstStarted;
    sync.push(later); // õpilane klõpsab, kuni esimene saadetis on veel teel
    release();
    await sync.flush();

    expect(pushed).toEqual([demo, later]);
    expect(storage.getItem(SYNC_QUEUE_KEY)).toBeNull();
  });

  it("lehe värskendamine ei kaota saatmata vastust", async () => {
    const { storage } = memoryStorage();
    const first = fakeRemote(["retry"]);
    const sync = createProgressSync(first.remote, () => storage);

    sync.push(demo);
    await sync.flush();

    // Uus leht, uus järjekord – seis loetakse localStorage'ist.
    const second = fakeRemote();
    await createProgressSync(second.remote, () => storage).flush();

    expect(second.pushed).toEqual([demo]);
    expect(storage.getItem(SYNC_QUEUE_KEY)).toBeNull();
  });

  it("töötab ka ilma localStorage'ita (Safari privaatrežiim)", async () => {
    const { remote, pushed } = fakeRemote();
    const sync = createProgressSync(remote, () => null);

    sync.push(demo);
    await sync.flush();

    expect(pushed).toEqual([demo]);
  });
});
