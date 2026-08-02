import { describe, expect, it } from "vitest";
import { course } from "../src/content/fyysika-8";
import { courseSchema } from "../src/content/courseSchema";
import { blockModules } from "../src/content/schema";

/**
 * Siin kontrollitakse kursusefaili STRUKTUURI, mitte sisu õigsust.
 *
 * See test ON kursusefaili ainus valvur: rakendus ise skeemi ei jooksuta
 * (vt src/content/schema.ts), seega katkine kursusefail avastatakse siin.
 *
 * TULEB SAMMUS 1.1: kontroll, et iga viidatud mooduli id on olemas ka
 * src/modules/registry.ts-is. Registrit veel ei ole, seega katkist viidet
 * praegu tabada ei saa. Kui registry.ts valmib, lisa siia test:
 *   "iga kursusefaili moodul on registris olemas".
 */
describe("kursusefail fyysika-8", () => {
  it("läbib skeemi", () => {
    expect(() => courseSchema.parse(course)).not.toThrow();
  });

  it("sisaldab ainekava seitset plokki, igal pealkiri olemas", () => {
    expect(course.blocks).toHaveLength(7);
    for (const block of course.blocks) {
      expect(block.title.trim().length).toBeGreaterThan(0);
    }
  });

  it("ei sisalda kahte sama pealkirjaga plokki", () => {
    const titles = course.blocks.map((block) => block.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe("kursuse skeem", () => {
  const validCourse = {
    id: "test",
    title: "Test",
    blocks: [{ title: "Plokk", modules: ["physics.esimene"] }],
  };

  it("nõuab plokilt pealkirja", () => {
    expect(() =>
      courseSchema.parse({
        ...validCourse,
        blocks: [{ title: "", modules: [] }],
      }),
    ).toThrow();
  });

  it("ei luba sama mooduli id-d ühes loendis kaks korda", () => {
    expect(() =>
      courseSchema.parse({
        ...validCourse,
        blocks: [
          { title: "Plokk", modules: ["physics.esimene", "physics.esimene"] },
        ],
      }),
    ).toThrow();
  });

  it("ei luba plokil korraga nii mooduleid kui alateemasid", () => {
    expect(() =>
      courseSchema.parse({
        ...validCourse,
        blocks: [
          {
            title: "Plokk",
            modules: ["physics.esimene"],
            parts: [{ title: "Alateema", modules: [] }],
          },
        ],
      }),
    ).toThrow();
  });

  it("piirab sügavuse kahe tasemega: alateemal ei saa olla alateemasid", () => {
    const parsed = courseSchema.parse({
      ...validCourse,
      blocks: [
        {
          title: "Plokk",
          parts: [
            {
              title: "Alateema",
              modules: [],
              parts: [{ title: "Liiga sügav", modules: [] }],
            },
          ],
        },
      ],
    });
    // Kolmas tase ei jõua kursusesse – skeem viskab selle minema.
    expect(parsed.blocks[0].parts?.[0]).not.toHaveProperty("parts");
  });

  it("nõuab mooduli id-lt kokkulepitud kuju", () => {
    expect(() =>
      courseSchema.parse({
        ...validCourse,
        blocks: [{ title: "Plokk", modules: ["Peegeldumine"] }],
      }),
    ).toThrow();
  });
});

describe("blockModules", () => {
  it("loeb kokku ka alateemade moodulid", () => {
    const block = {
      title: "Plokk",
      parts: [
        { title: "A", modules: ["physics.a1", "physics.a2"] },
        { title: "B", modules: ["physics.b1"] },
      ],
    };
    expect(blockModules(block)).toEqual([
      "physics.a1",
      "physics.a2",
      "physics.b1",
    ]);
  });

  it("annab tühja loendi, kui plokis pole veel mooduleid", () => {
    expect(blockModules({ title: "Plokk", modules: [] })).toEqual([]);
  });
});
