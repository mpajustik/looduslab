import { describe, expect, it } from "vitest";
import { manifestSchema } from "../src/engine/contractSchema";
import { manifest } from "../src/modules/physics/peegeldumisseadus/manifest";
import {
  angleFromNormal,
  angleFromSurface,
  incidentDirection,
  reflectedDirection,
  reflectionAngle,
} from "../src/modules/physics/peegeldumisseadus/model";

/**
 * Peegeldumisseaduse mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist (sisu/MOODUL-peegeldumisseadus.md
 * „Füüsika" → „Testid"), mitte mudelist tagurpidi tuletatud – muidu testiks
 * test iseennast. Lisaks on siin need nurgad, mille peal moodul õpilast
 * päriselt kontrollib (harjutus 3 ja kordamiskaardid).
 */

describe("reflectionAngle – peegeldumisnurk = langemisnurk", () => {
  it("0° → 0° (kiir langeb risti ja tuleb sama teed tagasi)", () => {
    expect(reflectionAngle(0)).toBe(0);
  });

  it("30° → 30°", () => {
    expect(reflectionAngle(30)).toBe(30);
  });

  it("45° → 45°", () => {
    expect(reflectionAngle(45)).toBe(45);
  });

  it("90° → 90° (lubatud piirjuht: kiir libiseb piki pinda)", () => {
    expect(reflectionAngle(90)).toBe(90);
  });
});

describe("reflectionAngle – definitsioonipiirkond", () => {
  it("−5° viskab vea, mitte ei paranda vaikselt", () => {
    expect(() => reflectionAngle(-5)).toThrow();
  });

  it("95° viskab vea", () => {
    expect(() => reflectionAngle(95)).toThrow();
  });

  it("NaN viskab vea (tühja sisendivälja tulemus ei tohi läbi lipsata)", () => {
    expect(() => reflectionAngle(Number.NaN)).toThrow();
  });

  it("Infinity viskab vea", () => {
    expect(() => reflectionAngle(Number.POSITIVE_INFINITY)).toThrow();
  });

  it("veateade nimetab lubatud vahemiku", () => {
    expect(() => reflectionAngle(120)).toThrow(/0…90/);
  });
});

describe("angleFromSurface – ristsirge suhtes → pinna suhtes", () => {
  it("ristsirge suhtes 60° on pinna suhtes 30° (simulatsiooni ülesanne 3)", () => {
    expect(angleFromSurface(60)).toBe(30);
  });

  it("0° ristsirge suhtes on 90° pinna suhtes", () => {
    expect(angleFromSurface(0)).toBe(90);
  });

  it("90° ristsirge suhtes on 0° pinna suhtes", () => {
    expect(angleFromSurface(90)).toBe(0);
  });

  it("väljaspool 0…90° viskab vea", () => {
    expect(() => angleFromSurface(-1)).toThrow();
    expect(() => angleFromSurface(91)).toThrow();
  });
});

describe("angleFromNormal – pinna suhtes → ristsirge suhtes", () => {
  it("pinnaga 35° tähendab ristsirge suhtes 55° (harjutus 3, lõks)", () => {
    expect(angleFromNormal(35)).toBe(55);
  });

  it("pinnaga 20° tähendab ristsirge suhtes 70° (kordamiskaart 3)", () => {
    expect(angleFromNormal(20)).toBe(70);
  });

  it("on angleFromSurface'i pöördfunktsioon", () => {
    for (const angle of [0, 15, 30, 45, 60, 85, 90]) {
      expect(angleFromNormal(angleFromSurface(angle))).toBe(angle);
    }
  });

  it("väljaspool 0…90° viskab vea", () => {
    expect(() => angleFromNormal(-1)).toThrow();
    expect(() => angleFromNormal(91)).toThrow();
  });
});

describe("kiirte suunad tasandil", () => {
  it("0° juures langeb kiir otse alla ja peegeldub otse tagasi", () => {
    expect(incidentDirection(0).x).toBeCloseTo(0, 10);
    expect(incidentDirection(0).y).toBeCloseTo(-1, 10);
    expect(reflectedDirection(0).x).toBeCloseTo(0, 10);
    expect(reflectedDirection(0).y).toBeCloseTo(1, 10);
  });

  it("45° juures on mõlemad komponendid võrdsed (√2/2)", () => {
    const half = Math.SQRT1_2;
    expect(incidentDirection(45).x).toBeCloseTo(half, 10);
    expect(incidentDirection(45).y).toBeCloseTo(-half, 10);
    expect(reflectedDirection(45).x).toBeCloseTo(half, 10);
    expect(reflectedDirection(45).y).toBeCloseTo(half, 10);
  });

  it("90° juures libisevad mõlemad kiired piki pinda samas suunas", () => {
    expect(incidentDirection(90).x).toBeCloseTo(1, 10);
    expect(incidentDirection(90).y).toBeCloseTo(0, 10);
    expect(reflectedDirection(90).x).toBeCloseTo(1, 10);
    expect(reflectedDirection(90).y).toBeCloseTo(0, 10);
  });

  it("suunad on ristsirge suhtes sümmeetrilised: x sama, y vastandmärgiga", () => {
    for (const angle of [0, 15, 30, 45, 60, 85, 90]) {
      const incident = incidentDirection(angle);
      const reflected = reflectedDirection(angle);
      expect(reflected.x).toBeCloseTo(incident.x, 10);
      expect(reflected.y).toBeCloseTo(-incident.y, 10);
    }
  });

  it("mõlemad suunad on ühikvektorid", () => {
    for (const angle of [0, 30, 45, 60, 85, 90]) {
      for (const direction of [incidentDirection(angle), reflectedDirection(angle)]) {
        expect(Math.hypot(direction.x, direction.y)).toBeCloseTo(1, 10);
      }
    }
  });

  it("nurk suuna ja ristsirge vahel ON langemisnurk", () => {
    // Kontroll mudelist sõltumatu teed pidi: normaal on (0, 1), seega
    // peegeldunud kiire y-komponent = cos(peegeldumisnurk).
    for (const angle of [0, 30, 45, 60, 85, 90]) {
      const reflected = reflectedDirection(angle);
      const angleToNormalDeg = (Math.acos(reflected.y) * 180) / Math.PI;
      expect(angleToNormalDeg).toBeCloseTo(reflectionAngle(angle), 6);
    }
  });

  it("väljaspool 0…90° viskavad mõlemad vea", () => {
    expect(() => incidentDirection(-5)).toThrow();
    expect(() => reflectedDirection(95)).toThrow();
  });
});

describe("manifest", () => {
  it("vastab moodulilepingu skeemile", () => {
    expect(() => manifestSchema.parse(manifest)).not.toThrow();
  });

  it("viitab ainekava õpitulemusele ja praktilisele tööle", () => {
    expect(manifest.outcomes).toContain("P1-T2");
    expect(manifest.practicalWork).toContain("P1-PT3");
  });
});
