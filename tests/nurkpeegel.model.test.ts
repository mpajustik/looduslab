import { describe, expect, it } from "vitest";
import {
  type Vector2,
  deviationDeg,
  secondHitDistanceM,
  secondIncidenceDeg,
  traceCornerRay,
} from "../src/modules/physics/nurkpeegel/model";

/**
 * Nurkpeegli mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist (sisu/MOODUL-nurkpeegel.md
 * „Füüsika (model.ts jaoks)" → testiväärtuste tabel ning piirjuhud ja
 * invariandid), mitte mudelist tagurpidi tuletatud – muidu testiks test
 * iseennast.
 *
 * Nurgad on kraadides, pikkused meetrites. Simulatsiooni algseis on θ = 60°,
 * α = 20°; osa ridu kasutab meelega teisi väärtusi (θ = 90° nurkpeegel,
 * α = 0 risti langev kiir), sest mudel peab vastama õigesti ka väljaspool
 * liuguri vahemikku ja just seal on piirid.
 */

/** Kõik lubatud täisarvulised (θ, α) paarid: 45° < θ ≤ 90°, θ − 90 < α < 2θ − 90. */
const VALID_PAIRS: Array<[number, number]> = [];
for (let mirrorAngleDeg = 46; mirrorAngleDeg <= 90; mirrorAngleDeg += 1) {
  const maxExclusiveDeg = 2 * mirrorAngleDeg - 90;
  const minExclusiveDeg = mirrorAngleDeg - 90;
  for (
    let firstIncidenceDeg = Math.max(0, minExclusiveDeg + 1);
    firstIncidenceDeg < maxExclusiveDeg;
    firstIncidenceDeg += 1
  ) {
    VALID_PAIRS.push([mirrorAngleDeg, firstIncidenceDeg]);
  }
}

function vectorLength(vector: Vector2): number {
  return Math.hypot(vector.x, vector.y);
}

/** Suunanurk kraadides, 0° = piki peeglit 1 tipust eemale. */
function directionAngleDeg(vector: Vector2): number {
  return (Math.atan2(vector.y, vector.x) * 180) / Math.PI;
}

describe("VALID_PAIRS – testivõre ise on mõistlik", () => {
  it("katab nii kitsaima kui laiima nurga", () => {
    expect(VALID_PAIRS.length).toBeGreaterThan(500);
    expect(VALID_PAIRS).toContainEqual([46, 0]);
    expect(VALID_PAIRS).toContainEqual([60, 20]);
    expect(VALID_PAIRS).toContainEqual([90, 89]);
    // θ = 90 juures on α = 0 keelatud (kiir jääks peegliga 2 paralleelseks).
    expect(VALID_PAIRS).not.toContainEqual([90, 0]);
  });
});

describe("deviationDeg – pööre on kaks korda peeglite nurk", () => {
  it.each([
    // Spetsi testiväärtuste tabel.
    [90, 180],
    [80, 160],
    [65, 130],
    // Arv on õige, aga sellise nurga juures ei ole kahe peegeldusega teed –
    // seda ütlevad ülejäänud kolm funktsiooni, mitte see.
    [45, 90],
    // Paralleelsed peeglid ehk periskoop.
    [0, 0],
  ])("θ = %s° → pööre %s°", (mirrorAngleDeg, expected) => {
    expect(deviationDeg(mirrorAngleDeg)).toBeCloseTo(expected, 9);
  });

  it("vigased arvud viskavad vea", () => {
    expect(() => deviationDeg(-1)).toThrow(RangeError);
    expect(() => deviationDeg(91)).toThrow(RangeError);
    expect(() => deviationDeg(Number.NaN)).toThrow(RangeError);
    expect(() => deviationDeg(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe("secondIncidenceDeg – kaks langemisnurka annavad kokku peeglite nurga", () => {
  it.each([
    // Spetsi testiväärtuste tabel.
    [90, 30, 60],
    [90, 60, 30],
    [60, 20, 40],
    [70, 25, 45],
    [80, 30, 50],
    // α = 0 on lubatud, kui θ < 90: kiir langeb peeglile 1 risti, tuleb sama
    // teed tagasi ja tabab peeglit 2 ikka, sest peegel 2 on kiilu kohal viltu.
    [60, 0, 60],
  ])("θ = %s°, α = %s° → β = %s°", (mirrorAngleDeg, firstDeg, expected) => {
    expect(secondIncidenceDeg(mirrorAngleDeg, firstDeg)).toBeCloseTo(expected, 9);
  });

  it("θ ≤ 45° viskab vea – kahe peegeldusega teed ei ole olemas", () => {
    expect(() => secondIncidenceDeg(45, 10)).toThrow(RangeError);
    expect(() => secondIncidenceDeg(30, 10)).toThrow(RangeError);
    // Paralleelsetel peeglitel ei ole tippu ega „kaugust tipust".
    expect(() => secondIncidenceDeg(0, 0)).toThrow(RangeError);
  });

  it("vigane nurk viskab vea", () => {
    expect(() => secondIncidenceDeg(91, 10)).toThrow(RangeError);
    expect(() => secondIncidenceDeg(-1, 10)).toThrow(RangeError);
    expect(() => secondIncidenceDeg(60, -1)).toThrow(RangeError);
    expect(() => secondIncidenceDeg(Number.NaN, 10)).toThrow(RangeError);
    expect(() => secondIncidenceDeg(60, Number.NaN)).toThrow(RangeError);
    expect(() => secondIncidenceDeg(60, Number.POSITIVE_INFINITY)).toThrow(
      RangeError,
    );
  });
});

describe("secondHitDistanceM – kui kaugel tipust on teine langemispunkt", () => {
  it.each([
    // Spetsi testiväärtuste tabel.
    // Sümmeetriline juht: α = β, seega e = d.
    [90, 45, 0.1, 0.1],
    [90, 30, 0.1, 0.17321],
    [60, 20, 0.1, 0.12267],
    [80, 20, 0.2, 0.37588],
    // Risti langenud kiir: e = d / cos θ.
    [60, 0, 0.1, 0.2],
  ])("θ = %s°, α = %s°, d = %s m → e = %s m", (mirrorDeg, firstDeg, d, expected) => {
    expect(secondHitDistanceM(mirrorDeg, firstDeg, d)).toBeCloseTo(expected, 5);
  });

  it("kaugus ilma langemispunktita viskab vea", () => {
    expect(() => secondHitDistanceM(60, 20, 0)).toThrow(RangeError);
    expect(() => secondHitDistanceM(60, 20, -0.1)).toThrow(RangeError);
    expect(() => secondHitDistanceM(60, 20, Number.NaN)).toThrow(RangeError);
    expect(() => secondHitDistanceM(60, 20, Number.POSITIVE_INFINITY)).toThrow(
      RangeError,
    );
  });

  it("θ ≤ 45° ja vigased nurgad viskavad vea", () => {
    expect(() => secondHitDistanceM(45, 10, 0.1)).toThrow(RangeError);
    expect(() => secondHitDistanceM(91, 10, 0.1)).toThrow(RangeError);
    expect(() => secondHitDistanceM(60, -1, 0.1)).toThrow(RangeError);
  });

  it("ülevoolav tulemus viskab vea, mitte ei anna lõpmatust", () => {
    // Iga argument eraldi on korralik arv ja α = 1e-13 on lubatud (suurem kui
    // piir θ − 90° = 0), aga siis on β praktiliselt 90°: cos β ≈ 1,7e-15 ja
    // jagatis ei mahu arvu sisse.
    expect(() => secondHitDistanceM(90, 1e-13, 1e308)).toThrow(RangeError);
  });
});

describe("traceCornerRay – kogu teekond korraga", () => {
  const rightAngle = traceCornerRay(90, 30, 0.2);

  it("esimene langemispunkt on peeglil 1 kaugusel d", () => {
    expect(rightAngle.firstHitM).toEqual({ x: 0.2, y: 0 });
  });

  it("teine langemispunkt on spetsi tabeli järgi", () => {
    expect(rightAngle.secondHitM.x).toBeCloseTo(0, 9);
    expect(rightAngle.secondHitM.y).toBeCloseTo(0.34641, 5);
  });

  it("kolm suunda on spetsi tabeli järgi", () => {
    expect(rightAngle.middleDirection.x).toBeCloseTo(-0.5, 5);
    expect(rightAngle.middleDirection.y).toBeCloseTo(0.86603, 5);
    expect(rightAngle.incidentDirection.x).toBeCloseTo(-0.5, 5);
    expect(rightAngle.incidentDirection.y).toBeCloseTo(-0.86603, 5);
    // Täpselt vastupidine sissetulevale – see ongi nurkpeegli mõte.
    expect(rightAngle.outgoingDirection.x).toBeCloseTo(0.5, 5);
    expect(rightAngle.outgoingDirection.y).toBeCloseTo(0.86603, 5);
  });

  it("nurgad tulevad kaasa samast arvutusest", () => {
    const path = traceCornerRay(60, 20, 0.1);
    expect(path.firstIncidenceDeg).toBeCloseTo(20, 9);
    expect(path.secondIncidenceDeg).toBeCloseTo(40, 9);
    expect(path.deviationDeg).toBeCloseTo(120, 9);
  });

  it("keelatud sisend viskab vea", () => {
    // θ ≤ 45° – kahe peegeldusega teed ei ole olemas.
    expect(() => traceCornerRay(30, 10, 0.1)).toThrow(RangeError);
    expect(() => traceCornerRay(45, 5, 0.1)).toThrow(RangeError);
    // Täpselt piiril: ψ₂ = 0, kiir libiseks piki peeglit 1.
    expect(() => traceCornerRay(60, 30, 0.1)).toThrow(RangeError);
    // ψ₂ = −10° – kiir peegelduks kolmandat korda.
    expect(() => traceCornerRay(60, 40, 0.1)).toThrow(RangeError);
    // Ainus juht alumise piiri taga: peeglilt 1 tulnud kiir jääks peegliga 2
    // paralleelseks.
    expect(() => traceCornerRay(90, 0, 0.1)).toThrow(RangeError);
    expect(() => traceCornerRay(60, 20, 0)).toThrow(RangeError);
    expect(() => traceCornerRay(60, Number.NaN, 0.1)).toThrow(RangeError);
  });
});

describe("invariandid – need on mooduli päris väited", () => {
  it("α + β = θ ja pööre = 2θ kogu lubatud võres", () => {
    for (const [mirrorAngleDeg, firstIncidenceDeg] of VALID_PAIRS) {
      const path = traceCornerRay(mirrorAngleDeg, firstIncidenceDeg, 0.1);
      expect(path.firstIncidenceDeg + path.secondIncidenceDeg).toBe(
        mirrorAngleDeg,
      );
      expect(path.deviationDeg).toBe(2 * mirrorAngleDeg);
    }
  });

  it("90° nurkpeegel saadab valguse tagasi sinna, kust ta tuli", () => {
    // Mooduli kõige tähtsam test: kui see punaseks läheb, on katki see,
    // mille peal helkur seisab.
    for (let firstIncidenceDeg = 1; firstIncidenceDeg < 90; firstIncidenceDeg += 1) {
      const path = traceCornerRay(90, firstIncidenceDeg, 0.1);
      expect(path.outgoingDirection.x).toBeCloseTo(-path.incidentDirection.x, 12);
      expect(path.outgoingDirection.y).toBeCloseTo(-path.incidentDirection.y, 12);
    }
  });

  it("pööre ei sõltu langemisnurgast", () => {
    for (const mirrorAngleDeg of [60, 70, 75, 80, 90]) {
      const angles = VALID_PAIRS.filter(([theta]) => theta === mirrorAngleDeg).map(
        ([, alpha]) => alpha,
      );
      expect(angles.length).toBeGreaterThan(1);
      const deviations = new Set(
        angles.map(
          (alpha) => traceCornerRay(mirrorAngleDeg, alpha, 0.1).deviationDeg,
        ),
      );
      expect(deviations).toEqual(new Set([2 * mirrorAngleDeg]));
    }
  });

  it("mõõtkava: kahekordne d annab kaks korda kaugemad punktid, samad suunad", () => {
    for (const [mirrorAngleDeg, firstIncidenceDeg] of VALID_PAIRS) {
      const small = traceCornerRay(mirrorAngleDeg, firstIncidenceDeg, 0.1);
      const large = traceCornerRay(mirrorAngleDeg, firstIncidenceDeg, 0.2);

      expect(large.firstHitM.x).toBeCloseTo(2 * small.firstHitM.x, 12);
      expect(large.firstHitM.y).toBeCloseTo(2 * small.firstHitM.y, 12);
      expect(large.secondHitM.x).toBeCloseTo(2 * small.secondHitM.x, 12);
      expect(large.secondHitM.y).toBeCloseTo(2 * small.secondHitM.y, 12);

      expect(large.middleDirection.x).toBeCloseTo(small.middleDirection.x, 12);
      expect(large.middleDirection.y).toBeCloseTo(small.middleDirection.y, 12);
      expect(large.outgoingDirection.x).toBeCloseTo(small.outgoingDirection.x, 12);
      expect(large.outgoingDirection.y).toBeCloseTo(small.outgoingDirection.y, 12);
      expect(large.secondIncidenceDeg).toBe(small.secondIncidenceDeg);
      expect(large.deviationDeg).toBe(small.deviationDeg);
    }
  });

  it("kõik kolm suunda on ühikvektorid", () => {
    for (const [mirrorAngleDeg, firstIncidenceDeg] of VALID_PAIRS) {
      const path = traceCornerRay(mirrorAngleDeg, firstIncidenceDeg, 0.1);
      expect(vectorLength(path.incidentDirection)).toBeCloseTo(1, 12);
      expect(vectorLength(path.middleDirection)).toBeCloseTo(1, 12);
      expect(vectorLength(path.outgoingDirection)).toBeCloseTo(1, 12);
    }
  });

  it("teine langemispunkt on peeglil 2 ja õigel kaugusel tipust", () => {
    for (const [mirrorAngleDeg, firstIncidenceDeg] of VALID_PAIRS) {
      const path = traceCornerRay(mirrorAngleDeg, firstIncidenceDeg, 0.1);
      expect(directionAngleDeg(path.secondHitM)).toBeCloseTo(mirrorAngleDeg, 9);
      expect(vectorLength(path.secondHitM)).toBeCloseTo(
        secondHitDistanceM(mirrorAngleDeg, firstIncidenceDeg, 0.1),
        12,
      );
    }
  });

  it("väljuva kiire suund on ψ₂ = 2θ − 90° − α ja jääb kiilust välja", () => {
    // Valem ja vektorarvutus on siin teineteise ristkontroll: kui üks neist
    // kunagi eksib, ei kattu nad enam.
    for (const [mirrorAngleDeg, firstIncidenceDeg] of VALID_PAIRS) {
      const path = traceCornerRay(mirrorAngleDeg, firstIncidenceDeg, 0.1);
      const expectedDeg = 2 * mirrorAngleDeg - 90 - firstIncidenceDeg;
      expect(directionAngleDeg(path.outgoingDirection)).toBeCloseTo(
        expectedDeg,
        9,
      );
      expect(expectedDeg).toBeGreaterThan(0);
      expect(expectedDeg).toBeLessThan(mirrorAngleDeg);
    }
  });

  it("sissetulev kiir liigub tipu poole ja alla, keskmine lõik üles", () => {
    for (const [mirrorAngleDeg, firstIncidenceDeg] of VALID_PAIRS) {
      const path = traceCornerRay(mirrorAngleDeg, firstIncidenceDeg, 0.1);
      // Kiir tuleb ülalt peeglile 1 (y-komponent alla), läheb sealt üles
      // peeglile 2.
      expect(path.incidentDirection.y).toBeLessThan(0);
      expect(path.middleDirection.y).toBeGreaterThan(0);
      // Peegeldumisseadus peeglil 1 vektorkujul: x jääb samaks, y pöördub.
      expect(path.middleDirection.x).toBeCloseTo(path.incidentDirection.x, 12);
    }
  });
});
