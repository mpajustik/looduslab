import { describe, expect, it } from "vitest";
import {
  clearGuest,
  markGuest,
  readJoinedClass,
  readMembership,
  readStudentName,
  writeJoinedClass,
  writeStudentName,
} from "../src/lib/studentIdentity";
import type { StorageLike } from "../src/lib/storage";

function fakeStorage(): StorageLike {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

describe("studentIdentity", () => {
  it("loeb kirjutatud nime tagasi", () => {
    const storage = fakeStorage();
    writeStudentName("Mari", storage);
    expect(readStudentName(storage)).toBe("Mari");
  });

  it("tagastab null, kui storage't ei ole (Safari privaatrežiim)", () => {
    expect(readStudentName(null)).toBeNull();
    // writeStudentName ei tohi visata, kui storage't ei ole.
    expect(() => writeStudentName("Mari", null)).not.toThrow();
  });

  it("tagastab null, kui midagi ei ole veel salvestatud", () => {
    expect(readStudentName(fakeStorage())).toBeNull();
  });
});

describe("readMembership", () => {
  it("puutumata seade ei tea veel midagi", () => {
    expect(readMembership(fakeStorage())).toBe("unknown");
  });

  it("liitunud klass jääb meelde koos nimega", () => {
    const storage = fakeStorage();
    writeJoinedClass("8.a füüsika", storage);
    expect(readMembership(storage)).toBe("joined");
    expect(readJoinedClass(storage)).toBe("8.a füüsika");
  });

  it("enne sammu 2.14 liitunu (ainult nimi) loeb ikka liitunuks", () => {
    const storage = fakeStorage();
    writeStudentName("Mari", storage);
    expect(readMembership(storage)).toBe("joined");
  });

  it("külalise valik jääb meelde", () => {
    const storage = fakeStorage();
    markGuest(storage);
    expect(readMembership(storage)).toBe("guest");
  });

  it("liitumine kustutab varasema külalise valiku", () => {
    const storage = fakeStorage();
    markGuest(storage);
    writeJoinedClass("8.a füüsika", storage);
    expect(readMembership(storage)).toBe("joined");
  });

  // Ülevaatuse leid (Codex, 2026-08-06): külalise valik EI TOHI olla igavene.
  // Muidu ei näe õpilane, kes ühe korra külalist valis, enam kunagi
  // koodiküsimist – ja kogu ta töö kaob õpetaja klassivaatest vaikselt ära.
  it("külalise valiku saab tagasi võtta", () => {
    const storage = fakeStorage();
    markGuest(storage);
    expect(readMembership(storage)).toBe("guest");
    clearGuest(storage);
    expect(readMembership(storage)).toBe("unknown");
  });

  it("külalise valiku tagasivõtmine ei kustuta liitumist", () => {
    const storage = fakeStorage();
    writeJoinedClass("8.a füüsika", storage);
    clearGuest(storage);
    expect(readMembership(storage)).toBe("joined");
  });

  it("ilma storage'ita ei tea me midagi ega viska viga", () => {
    expect(readMembership(null)).toBe("unknown");
    expect(() => markGuest(null)).not.toThrow();
    expect(() => clearGuest(null)).not.toThrow();
    expect(() => writeJoinedClass("8.a", null)).not.toThrow();
    expect(readJoinedClass(null)).toBeNull();
  });
});
