import { describe, expect, it } from "vitest";
import {
  buildSlugIndex,
  hasModule,
  moduleRegistry,
  slugFromId,
  slugIndex,
} from "../src/modules/registry";
import type { ModuleLoader } from "../src/modules/registry";
import {
  activitiesSchema,
  manifestSchema,
} from "../src/engine/contractSchema";

/** Laadija, mida ei kutsuta – indeksi ehitamine vaatab ainult võtmeid. */
const stub: ModuleLoader = () => {
  throw new Error("ei tohiks laadida");
};

describe("slugFromId", () => {
  it("võtab slugi id lõpust", () => {
    expect(slugFromId("physics.peegeldumisseadus")).toBe("peegeldumisseadus");
  });

  it("viskab vea, kui id-l ei ole aine eesliidet", () => {
    expect(() => slugFromId("peegeldumisseadus")).toThrow();
  });
});

describe("slug-indeks", () => {
  it("seob slugi id-ga", () => {
    const index = buildSlugIndex({
      "physics.peegeldumisseadus": stub,
      "physics.vedeliku-rohk": stub,
    });
    expect(index.get("vedeliku-rohk")).toBe("physics.vedeliku-rohk");
  });

  it("VISKAB VEA, kui kaks moodulit jagavad slugi", () => {
    // Register ise on korrektne (võtmed erinevad), aga /m/rohk peaks kahe
    // vahel loosima. Vaikne vale moodul on hullem kui krahh.
    expect(() =>
      buildSlugIndex({ "physics.rohk": stub, "chemistry.rohk": stub }),
    ).toThrow(/rohk/);
  });
});

describe("moodulite register", () => {
  it("iga id on kujul <subject>.<slug>", () => {
    for (const id of Object.keys(moduleRegistry)) {
      expect(() => slugFromId(id)).not.toThrow();
    }
  });

  it("indeksis on täpselt sama palju kirjeid kui registris", () => {
    expect(slugIndex.size).toBe(Object.keys(moduleRegistry).length);
  });

  it("hasModule ei aja objekti oma välju mooduliks", () => {
    expect(hasModule("constructor")).toBe(false);
    expect(hasModule("toString")).toBe(false);
  });

  // Register on praegu tühi (esimene moodul tuleb sammus 1.13), seega see
  // test läheb päriselt tööle alles siis. Kirjas on ta juba nüüd, et uus
  // moodul valideeritaks automaatselt, ilma et keegi peaks meeles pidama.
  it.each(Object.entries(moduleRegistry))(
    "moodul %s vastab moodulilepingule",
    async (id, load) => {
      const { manifest, activities } = await load();
      expect(manifestSchema.parse(manifest).id).toBe(id);
      expect(() => activitiesSchema.parse(activities)).not.toThrow();
    },
  );
});
