import { describe, expect, it } from "vitest";
import { readStudentName, writeStudentName } from "../src/lib/studentIdentity";
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
