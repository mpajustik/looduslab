import { describe, expect, it } from "vitest";
import { moduleCurriculum, parseCurriculum } from "../src/lib/curriculum";

/**
 * Sama kujuga väike ainekava nagu tests/coverageRules.test.ts oma – parseri
 * enda testid on seal, siin ainult see, mida õpetaja vaade (samm 4.0b)
 * manifestist ja ainekavast kokku paneb.
 */
const ainekava = `## P1. Valgus ja peegeldumine

**Õpitulemused:**

- **P1-T1** tunneb valgusallikaid
- **P1-T2** tunneb peegeldumise seadust

**Põhimõisted:** valguskiir, tasapeegel, mattpind

**Praktilised tööd:**

- **P1-PT3** peegeldumisseaduse uurimine
`;

const blocks = parseCurriculum(ainekava);

describe("moduleCurriculum", () => {
  it("toob ainekava teksti manifesti ID juurde", () => {
    const seos = moduleCurriculum(blocks, {
      outcomes: ["P1-T2"],
      practicalWork: ["P1-PT3"],
      concepts: ["tasapeegel"],
    });

    expect(seos.outcomes).toEqual([
      { id: "P1-T2", text: "tunneb peegeldumise seadust" },
    ]);
    expect(seos.practicalWork).toEqual([
      { id: "P1-PT3", text: "peegeldumisseaduse uurimine" },
    ]);
  });

  it("hoiab manifesti järjekorda, mitte ainekava oma", () => {
    const seos = moduleCurriculum(blocks, {
      outcomes: ["P1-T2", "P1-T1"],
      practicalWork: [],
      concepts: [],
    });

    expect(seos.outcomes.map((entry) => entry.id)).toEqual(["P1-T2", "P1-T1"]);
  });

  it("tundmatu ID jääb nähtavale, aga ilma tekstita", () => {
    // Katvusraport nimetab seda veaks ja kukub läbi. Õpetaja vaade EI TOHI
    // teda vaikselt ära jätta – muidu arvab õpetaja, et seost polegi.
    const seos = moduleCurriculum(blocks, {
      outcomes: ["P9-T1"],
      practicalWork: [],
      concepts: [],
    });

    expect(seos.outcomes).toEqual([{ id: "P9-T1", text: "" }]);
  });

  it("eristab ainekava põhimõiste ja mooduli oma mõiste", () => {
    const seos = moduleCurriculum(blocks, {
      outcomes: [],
      practicalWork: [],
      concepts: ["Tasapeegel", "peegeldumisnurk"],
    });

    expect(seos.concepts).toEqual([
      // Suurtäht ei tee mõistet tundmatuks, aga ekraanile jääb mooduli
      // enda kirjapilt – ainekava sõna ei kirjuta manifesti üle.
      { name: "Tasapeegel", inCurriculum: true },
      { name: "peegeldumisnurk", inCurriculum: false },
    ]);
  });

  it("tühi ainekava ei lõhu vaadet – ID-d jäävad alles", () => {
    // Nii käitub curriculumSource.ts siis, kui ainekava fail on katki:
    // pigem ID ilma tekstita kui valge ekraan.
    const seos = moduleCurriculum([], {
      outcomes: ["P1-T2"],
      practicalWork: [],
      concepts: ["tasapeegel"],
    });

    expect(seos.outcomes).toEqual([{ id: "P1-T2", text: "" }]);
    expect(seos.concepts).toEqual([{ name: "tasapeegel", inCurriculum: false }]);
  });
});
