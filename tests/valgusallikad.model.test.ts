import { describe, expect, it } from "vitest";
import {
  EXAMPLE_SOURCES,
  POINT_SOURCE_MAX_DEG,
  apparentSizeDeg,
  classifyBySize,
  pointSourceDistance,
} from "../src/modules/physics/valgusallikad/model";

/**
 * Valgusallikate mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist (sisu/MOODUL-valgusallikad.md
 * „Füüsika" → testiväärtuste tabel ning sammude juures kirjas olevad
 * vastused), mitte mudelist tagurpidi tuletatud – muidu testiks test
 * iseennast. Kaasa on võetud ka need arvud, mille peal moodul õpilast hiljem
 * päriselt kontrollib (simulatsiooni ülesanded, harjutused, väljumispilet,
 * kordamiskaardid) – nii selgub näpuviga siin, mitte tunnis.
 */

describe("apparentSizeDeg – näiv nurkmõõde 2 · atan(d / (2 · L))", () => {
  it("LED 5 mm 1 m kauguselt → 0,29°", () => {
    expect(apparentSizeDeg(0.005, 1)).toBeCloseTo(0.29, 2);
  });

  it("hõõgniit 1 cm 3 m kauguselt → 0,19°", () => {
    expect(apparentSizeDeg(0.01, 3)).toBeCloseTo(0.19, 2);
  });

  it("lambipirn 0,08 m 4 m kauguselt → 1,15° (harjutus 2)", () => {
    expect(apparentSizeDeg(0.08, 4)).toBeCloseTo(1.15, 2);
  });

  it("päevavalgustoru 1,2 m 2 m kauguselt → 33,4° (simulatsiooni ülesanne 1)", () => {
    expect(apparentSizeDeg(1.2, 2)).toBeCloseTo(33.4, 1);
  });

  it("aken 1,5 m 3 m kauguselt → 28,1°", () => {
    expect(apparentSizeDeg(1.5, 3)).toBeCloseTo(28.1, 1);
  });

  it("LED 5 mm 0,5 m kauguselt → 0,57° (simulatsiooni ülesanne 2)", () => {
    expect(apparentSizeDeg(0.005, 0.5)).toBeCloseTo(0.57, 2);
  });

  it("tänavalambi pirn 0,06 m 12 m kõrgusel → 0,29° (väljumispilet 2)", () => {
    expect(apparentSizeDeg(0.06, 12)).toBeCloseTo(0.29, 2);
  });

  it("Päike: 1 392 000 km läbimõõt, 150 000 000 km kaugus → 0,53° (harjutus 4)", () => {
    // Arvud on samades ühikutes ja jagatis on ühikuteta – seepärast ütleb
    // harjutuse vihje, et teisendama ei pea. Mudelis on nad meetrites.
    expect(apparentSizeDeg(1_392_000_000, 150_000_000_000)).toBeCloseTo(0.53, 2);
  });

  it("sama allikas kaugemalt paistab väiksemana (mooduli põhiidee)", () => {
    const nearDeg = apparentSizeDeg(1.2, 2);
    const farDeg = apparentSizeDeg(1.2, 20);
    expect(farDeg).toBeLessThan(nearDeg);
    // Kaugus 10× ei tähenda nurka täpselt 10× väiksemat: atan lameneb suurte
    // nurkade juures, seega 33,4° juurest kaugenedes kahaneb nurk AEGLASEMALT
    // kui pöördvõrdeliselt. Väikeste nurkade juures (järgmine test) langeb see
    // vahe ära – seepärast tohib mõelda „kaks korda kaugemal, kaks korda
    // väiksem" ainult seal.
    expect(farDeg).toBeGreaterThan(nearDeg / 10);
  });

  it("väikeste nurkade juures on seos peaaegu pöördvõrdeline", () => {
    // 0,29° juures on atan sirgest eristamatu – seepärast tohib õpilane
    // simulatsioonis mõelda „kaks korda kaugemal, kaks korda väiksem".
    expect(apparentSizeDeg(0.005, 2)).toBeCloseTo(apparentSizeDeg(0.005, 1) / 2, 4);
  });

  it("väga suur mõõde ja kaugus ei vooluta arvutust üle (mõlema ülevaataja leid)", () => {
    // Nimetaja `2 · L` voolaks üle Infinity-ks ja jagatis kukuks nulli:
    // vastuseks tuleks 0° – arv arvu moodi, mida keegi kahtlustama ei hakkaks.
    // Sama mõõde ja kaugus tähendab nurka 2 · atan(0,5) = 53,13°.
    expect(apparentSizeDeg(Number.MAX_VALUE, Number.MAX_VALUE)).toBeCloseTo(
      53.13,
      2,
    );
  });

  it("mõõde 0, negatiivne või NaN viskab vea (ei paranda vaikselt)", () => {
    expect(() => apparentSizeDeg(0, 1)).toThrow(RangeError);
    expect(() => apparentSizeDeg(-1, 1)).toThrow(RangeError);
    expect(() => apparentSizeDeg(Number.NaN, 1)).toThrow(RangeError);
  });

  it("kaugus 0 või negatiivne viskab vea – vaatleja oleks allika sees", () => {
    expect(() => apparentSizeDeg(0.005, 0)).toThrow(RangeError);
    expect(() => apparentSizeDeg(0.005, -3)).toThrow(RangeError);
  });
});

describe("classifyBySize – kokkuleppeline 1° piir", () => {
  it("piir on 1° ja ta on KAASAV", () => {
    expect(POINT_SOURCE_MAX_DEG).toBe(1);
    expect(classifyBySize(1)).toBe("point");
  });

  it("alla piiri → punktallikas, üle piiri → laiendatud allikas", () => {
    expect(classifyBySize(0.29)).toBe("point");
    expect(classifyBySize(0.53)).toBe("point");
    expect(classifyBySize(1.15)).toBe("extended");
    expect(classifyBySize(33.4)).toBe("extended");
  });

  it("2 m kaugusel on piiril olev mõõde 0,0349 m ja see loeb veel punktallikaks", () => {
    // Spetsifikatsiooni piirjuht: d = 2 · tan(0,5°) · L annab TÄPSELT 1°.
    const boundarySizeM = 2 * Math.tan((0.5 * Math.PI) / 180) * 2;
    expect(boundarySizeM).toBeCloseTo(0.0349, 4);
    expect(apparentSizeDeg(boundarySizeM, 2)).toBeCloseTo(1, 9);
    expect(classifyBySize(apparentSizeDeg(boundarySizeM, 2))).toBe("point");
    // Napilt suurem allikas on juba laiendatud – piir ei ole udune, ta on
    // ainult ujukomavea võrra järeleandlik.
    expect(classifyBySize(apparentSizeDeg(boundarySizeM * 1.01, 2))).toBe(
      "extended",
    );
  });

  it("nurk 0 on punktallikas, mitte viga (CodeRabbiti leid)", () => {
    // Mudel oskab ise nulli toota: pisike allikas tohutult kaugel annab
    // jagatise, mis kaob ujukoma alla. Kui `classifyBySize` seal vea viskaks,
    // kukuks mudel oma enda väljundi peale.
    expect(classifyBySize(0)).toBe("point");
    expect(classifyBySize(apparentSizeDeg(Number.MIN_VALUE, 1))).toBe("point");
  });

  it("negatiivne nurk või NaN viskab vea", () => {
    expect(() => classifyBySize(-1)).toThrow(RangeError);
    expect(() => classifyBySize(Number.NaN)).toThrow(RangeError);
  });
});

describe("pointSourceDistance – vähim kaugus punktallikaks lugemisel", () => {
  it("päevavalgustoru 1,2 m → ≈ 68,8 m (simulatsiooni ülesanne 1)", () => {
    // Ülesande vastus on „≈ 69 m"; simulatsiooni kauguse liugur peab seepärast
    // ulatuma üle selle arvu, muidu ei ole ülesanne lahendatav.
    expect(pointSourceDistance(1.2)).toBeCloseTo(68.75, 2);
    expect(pointSourceDistance(1.2)).toBeLessThan(80);
  });

  it("sellelt kauguselt tuleb nurgaks täpselt piir (edasi-tagasi test)", () => {
    for (const sizeM of [0.005, 0.08, 1.2, 1.5]) {
      const distanceM = pointSourceDistance(sizeM);
      expect(apparentSizeDeg(sizeM, distanceM)).toBeCloseTo(
        POINT_SOURCE_MAX_DEG,
        9,
      );
      expect(classifyBySize(apparentSizeDeg(sizeM, distanceM))).toBe("point");
    }
  });

  it("sellest lähemal on sama allikas laiendatud allikas", () => {
    const distanceM = pointSourceDistance(1.2);
    expect(classifyBySize(apparentSizeDeg(1.2, distanceM * 0.9))).toBe(
      "extended",
    );
    expect(classifyBySize(apparentSizeDeg(1.2, distanceM * 1.1))).toBe("point");
  });

  it("kaugus on mõõtmega võrdeline", () => {
    expect(pointSourceDistance(2.4)).toBeCloseTo(2 * pointSourceDistance(1.2), 6);
  });

  it("mõõde 0 või negatiivne viskab vea", () => {
    expect(() => pointSourceDistance(0)).toThrow(RangeError);
    expect(() => pointSourceDistance(-1.2)).toThrow(RangeError);
  });

  it("üle voolav tulemus viskab vea, ei tagasta Infinity't", () => {
    expect(() => pointSourceDistance(Number.MAX_VALUE)).toThrow(RangeError);
  });
});

describe("EXAMPLE_SOURCES – simulatsiooni ja ülesannete näited", () => {
  it("annavad spetsifikatsiooni tabeli nurgad ja liigid", () => {
    const expected: Record<
      keyof typeof EXAMPLE_SOURCES,
      { deg: number; digits: number; size: "point" | "extended" }
    > = {
      led: { deg: 0.29, digits: 2, size: "point" },
      lambipirn: { deg: 1.15, digits: 2, size: "extended" },
      paevavalgustoru: { deg: 33.4, digits: 1, size: "extended" },
      aken: { deg: 28.1, digits: 1, size: "extended" },
      paike: { deg: 0.53, digits: 2, size: "point" },
    };

    for (const [id, source] of Object.entries(EXAMPLE_SOURCES)) {
      const want = expected[id as keyof typeof EXAMPLE_SOURCES];
      const angleDeg = apparentSizeDeg(source.sizeM, source.distanceM);
      expect(angleDeg, id).toBeCloseTo(want.deg, want.digits);
      expect(classifyBySize(angleDeg), id).toBe(want.size);
    }
  });

  it("Päike on punktallikas, kuigi ta on näidetest tohutult suurim", () => {
    // Just see paar ridu on väärarusaama `suurus-ilma-kauguseta` vastus:
    // suurim keha annab väikseima nurga peale LED-i, sest ta on kaugel.
    expect(EXAMPLE_SOURCES.paike.sizeM).toBeGreaterThan(
      EXAMPLE_SOURCES.aken.sizeM,
    );
    expect(
      apparentSizeDeg(
        EXAMPLE_SOURCES.paike.sizeM,
        EXAMPLE_SOURCES.paike.distanceM,
      ),
    ).toBeLessThan(
      apparentSizeDeg(EXAMPLE_SOURCES.aken.sizeM, EXAMPLE_SOURCES.aken.distanceM),
    );
  });
});
