import { describe, expect, it } from "vitest";
import { course } from "../src/content/fyysika-8";
import { courseSchema } from "../src/content/courseSchema";
import { blockModules } from "../src/content/schema";
import { hasModule } from "../src/modules/registry";

/**
 * Siin kontrollitakse kursusefaili STRUKTUURI, mitte sisu õigsust.
 *
 * See test ON kursusefaili ainus valvur: rakendus ise skeemi ei jooksuta
 * (vt src/content/schema.ts), seega katkine kursusefail avastatakse siin.
 */
describe("kursusefail fyysika-8", () => {
  it("läbib skeemi", () => {
    expect(() => courseSchema.parse(course)).not.toThrow();
  });

  it("viitab ainult moodulitele, mis on registris olemas", () => {
    // Kirjaviga mooduli id-s annaks lehel tühja koha, mitte veateate.
    // Registrist puuduv id on siin viga (docs/ARHITEKTUUR.md).
    const missing = course.blocks
      .flatMap(blockModules)
      .filter((id) => !hasModule(id));
    expect(missing).toEqual([]);
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

  it("ei loe pealkirjaks tühikuid", () => {
    expect(() =>
      courseSchema.parse({
        ...validCourse,
        blocks: [{ title: "   ", modules: [] }],
      }),
    ).toThrow();
  });

  it("nõuab plokilt kas mooduleid või alateemasid, mitte kumbagi puudu", () => {
    expect(() =>
      courseSchema.parse({ ...validCourse, blocks: [{ title: "Plokk" }] }),
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
    // Kolmas tase on VIGA, mitte vaikselt äravisatav lisaväli – muidu
    // kaoks kogu alamsisu ära ja keegi ei saaks teada.
    expect(() =>
      courseSchema.parse({
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
      }),
    ).toThrow();
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
