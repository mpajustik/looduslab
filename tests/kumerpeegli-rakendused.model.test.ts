import { describe, expect, it } from "vitest";
import { checkNumericAnswer } from "../src/checker/numeric";
import { stepQuestions } from "../src/engine/contract";
import { activitiesSchema, manifestSchema } from "../src/engine/contractSchema";
import {
  mirrorBulge as convexMirrorBulge,
  normalAngleDeg as convexNormalAngleDeg,
} from "../src/modules/physics/kumerpeegel/model";
import { activities } from "../src/modules/physics/kumerpeegli-rakendused/activities";
import { manifest } from "../src/modules/physics/kumerpeegli-rakendused/manifest";
import { teacher } from "../src/modules/physics/kumerpeegli-rakendused/teacher";
import {
  AISLE_DISTANCE_CM,
  MAX_HALF_ANGLE_DEG,
  MIRROR_APERTURE_CM,
  SLIDERS,
  centimetresFromMetres,
  convexViewWidth,
  flatViewAngleDeg,
  flatViewWidth,
  metresFromCentimetres,
  mirrorBulge,
  viewAngleDeg,
} from "../src/modules/physics/kumerpeegli-rakendused/model";

/**
 * Kumerpeegli rakenduste mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist
 * (sisu/MOODUL-kumerpeegli-rakendused.md „Füüsika (model.ts jaoks)" →
 * testiväärtuste tabel ning piirjuhud ja invariandid), mitte mudelist
 * tagurpidi tuletatud – muidu testiks test iseennast.
 *
 * Pikkused on mudelis meetrites, nurgad kraadides. Simulatsiooni vaikeväärtus
 * on a = 0,15 m (30 cm läbimõõduga peegel); osa ridu kasutab meelega teisi
 * mõõte, sest mudel peab vastama õigesti ka väljaspool liuguri vahemikku ja
 * just seal on piirid.
 */

describe("mirrorBulge – kui palju on peegli serv tipust taga", () => {
  it.each([
    [1, 0.15, 0.011314],
    // Ümmargune arv: 3-4-5 kolmnurk.
    [1, 0.6, 0.2],
  ])("R = %s m, a = %s m → %s m", (radiusM, apertureM, expected) => {
    expect(mirrorBulge(radiusM, apertureM)).toBeCloseTo(expected, 6);
  });

  /**
   * Vahe moodulist `kumerpeegel`, mis peab olema nähtav testis: seal on teine
   * argument ühe KIIRE kõrgus ja 0 on lubatud (peateljel levinud kiir), siin
   * on ta PEEGLI poolläbimõõt ja laiuseta peeglit ei ole olemas.
   */
  it("a = 0 viskab vea – erinevalt sama nimega funktsioonist kumerpeeglis", () => {
    expect(() => mirrorBulge(1, 0)).toThrow(RangeError);
    expect(convexMirrorBulge(1, 0)).toBe(0);
  });

  it("peegel ei saa olla oma kerast suurem", () => {
    expect(() => mirrorBulge(1, 1)).toThrow(RangeError);
    expect(() => mirrorBulge(1, 1.5)).toThrow(RangeError);
  });

  it("vigased arvud viskavad vea", () => {
    expect(() => mirrorBulge(0, 0.15)).toThrow(RangeError);
    expect(() => mirrorBulge(-1, 0.15)).toThrow(RangeError);
    expect(() => mirrorBulge(1, -0.15)).toThrow(RangeError);
    expect(() => mirrorBulge(1, Number.NaN)).toThrow(RangeError);
    expect(() => mirrorBulge(Number.POSITIVE_INFINITY, 0.15)).toThrow(RangeError);
  });

  /**
   * Codexi leid (sammud 4.1ii ja 4.1mm): lõplikest sisenditest võib tulla NaN,
   * sest R² ja a² voolavad mõlemad üle lõpmatuseks. Mudel ei tohi tagastada
   * arvu, mille taga ta seista ei saa.
   */
  it("ülevool ei anna vaikset NaN-i", () => {
    expect(() => mirrorBulge(1e308, 1e307)).toThrow(RangeError);
  });
});

describe("viewAngleDeg – kumerpeegli vaatevälja täisnurk", () => {
  it.each([
    [1, 0.15, 2, 43.038],
    // Lamedam peegel – kitsam vaateväli.
    [2, 0.15, 2, 25.759],
    // Vaataja lähemal – laiem vaateväli.
    [1, 0.15, 1, 51.381],
    [1, 0.15, 5, 37.937],
    [3, 0.15, 5, 14.898],
  ])("R = %s m, a = %s m, d = %s m → %s°", (radiusM, apertureM, eyeM, expected) => {
    expect(viewAngleDeg(radiusM, apertureM, eyeM)).toBeCloseTo(expected, 3);
  });

  it("vaataja kaugus mõjub ainult φ liikmele: kaugelt jääb alles 4θ", () => {
    // θ = arcsin(0,15) = 8,627°, seega 4θ = 34,508°. Tasapeegli oma läheneb
    // samal ajal nullile – see ongi kogu mooduli väide.
    expect(viewAngleDeg(1, 0.15, 100000)).toBeCloseTo(34.508, 3);
    expect(flatViewAngleDeg(0.15, 100000)).toBeLessThan(0.001);
  });

  it("vigased arvud viskavad vea", () => {
    expect(() => viewAngleDeg(1, 0.15, 0)).toThrow(RangeError);
    expect(() => viewAngleDeg(1, 0.15, -2)).toThrow(RangeError);
    expect(() => viewAngleDeg(1, 0, 2)).toThrow(RangeError);
    expect(() => viewAngleDeg(1, 0.15, Number.NaN)).toThrow(RangeError);
  });

  it("a >= R viskab vea: poolkeral kaotab vaateväli mõtte", () => {
    expect(() => viewAngleDeg(1, 1, 2)).toThrow(RangeError);
  });

  /**
   * Mudel ei vasta küsimusele, mille peale tema sõnastus enam ei kehti – sama
   * põhimõte nagu `reflectParallelRay` piiril moodulis `kumerpeegel`.
   */
  it("poolnurk 90° või üle selle viskab vea, ei anna negatiivset laiust", () => {
    // θ = 64,2°, seega 2θ + φ on juba üle 90°: vaatevälja serv ei osutaks enam
    // peeglist ette, vaid taha.
    expect(() => viewAngleDeg(1, 0.9, 0.1)).toThrow(RangeError);
    // Sama kontroll kehtib laiuse sees, sest ta arvutab sama nurga.
    expect(() => convexViewWidth(1, 0.9, 0.1, 5)).toThrow(RangeError);
  });
});

describe("flatViewAngleDeg – sama suure tasapeegli võrdlusarv", () => {
  it.each([
    [0.15, 2, 8.578],
    [0.15, 5, 3.437],
    [0.15, 1, 17.062],
    // Silm täpselt peegli serva sihis.
    [0.5, 0.5, 90],
  ])("a = %s m, d = %s m → %s°", (apertureM, eyeM, expected) => {
    expect(flatViewAngleDeg(apertureM, eyeM)).toBeCloseTo(expected, 3);
  });

  it("vigased arvud viskavad vea", () => {
    expect(() => flatViewAngleDeg(0, 2)).toThrow(RangeError);
    expect(() => flatViewAngleDeg(0.15, 0)).toThrow(RangeError);
    expect(() => flatViewAngleDeg(0.15, Number.NaN)).toThrow(RangeError);
  });
});

describe("flatViewWidth – tasapeeglis nähtava ala laius", () => {
  it.each([
    [0.15, 2, 5, 1.05],
    [0.15, 5, 5, 0.6],
    // Peegli enda laius 2a.
    [0.15, 2, 0, 0.3],
    [0.5, 1, 3, 4],
  ])("a = %s m, d = %s m, L = %s m → %s m", (apertureM, eyeM, distM, expected) => {
    expect(flatViewWidth(apertureM, eyeM, distM)).toBeCloseTo(expected, 9);
  });

  it("L = 0 on lubatud, negatiivne L ei ole", () => {
    expect(flatViewWidth(0.15, 2, 0)).toBeCloseTo(0.3, 9);
    expect(() => flatViewWidth(0.15, 2, -1)).toThrow(RangeError);
  });

  it("ülevool ei anna lõpmatust", () => {
    expect(() => flatViewWidth(1e308, 1, 1)).toThrow(RangeError);
  });
});

describe("convexViewWidth – kumerpeeglis nähtava ala laius", () => {
  it.each([
    [1, 0.15, 2, 5, 4.252],
    [1, 0.15, 5, 5, 3.745],
    // Lamedam peegel – kitsam ala.
    [3, 0.15, 2, 5, 2.067],
    // Liuguri kõige laiem seis.
    [0.8, 0.15, 0.5, 5, 8.1],
  ])(
    "R = %s m, a = %s m, d = %s m, L = %s m → %s m",
    (radiusM, apertureM, eyeM, distM, expected) => {
      expect(convexViewWidth(radiusM, apertureM, eyeM, distM)).toBeCloseTo(
        expected,
        2,
      );
    },
  );

  /**
   * See test ongi selle mooduli päris vea vastu pandud lõks (CodeRabbiti leid,
   * samm 4.1rr): tipust arvutav valem annaks siin nulli. Peegli oma laius peab
   * laiuses alati sees olema.
   */
  it("L = 0 annab peegli enda laiuse, mitte nulli", () => {
    // Kumeral veidi rohkem kui 2a = 0,3 m, sest äärmine kiir väljub serva
    // punktist, mis on tipust bulge võrra taga.
    expect(convexViewWidth(1, 0.15, 2, 0)).toBeCloseTo(0.309, 3);
    expect(convexViewWidth(1, 0.15, 2, 0)).toBeGreaterThan(0.3);
  });

  it("negatiivne mõõtmiskaugus viskab vea", () => {
    expect(() => convexViewWidth(1, 0.15, 2, -1)).toThrow(RangeError);
    expect(() => convexViewWidth(1, 0.15, 2, Number.NaN)).toThrow(RangeError);
  });

  it("vigased peegli mõõdud viskavad vea", () => {
    expect(() => convexViewWidth(0, 0.15, 2, 5)).toThrow(RangeError);
    expect(() => convexViewWidth(1, 0, 2, 5)).toThrow(RangeError);
    expect(() => convexViewWidth(1, 0.15, 0, 5)).toThrow(RangeError);
  });
});

/**
 * Kümme raadiust × kümme vaataja kaugust × kolm mõõtmiskaugust. Kõik allpool
 * olevad seaduspärade testid käivad sama võre peal – nii ei ole ükski väide
 * ühe testirea peal kinni.
 */
const RADII_M = [0.5, 0.8, 1, 1.2, 1.5, 2, 2.5, 3, 5, 10];
const EYE_DISTANCES_M = [0.3, 0.5, 0.75, 1, 1.5, 2, 3, 5, 8, 12];
const MEASURE_DISTANCES_M = [0, 2, 5];
const APERTURE_M = 0.15;

describe("kumer võidab alati – kogu mooduli väide, mitte üks testirida", () => {
  it("vaatevälja nurk on kumeral alati suurem kui tasapeeglil", () => {
    for (const radiusM of RADII_M) {
      for (const eyeM of EYE_DISTANCES_M) {
        expect(viewAngleDeg(radiusM, APERTURE_M, eyeM)).toBeGreaterThan(
          flatViewAngleDeg(APERTURE_M, eyeM),
        );
      }
    }
  });

  it("nähtav ala on kumeral alati laiem kui tasapeeglil", () => {
    for (const radiusM of RADII_M) {
      for (const eyeM of EYE_DISTANCES_M) {
        for (const distM of MEASURE_DISTANCES_M) {
          expect(
            convexViewWidth(radiusM, APERTURE_M, eyeM, distM),
          ).toBeGreaterThan(flatViewWidth(APERTURE_M, eyeM, distM));
        }
      }
    }
  });
});

describe("lamedam peegel = kitsam vaateväli", () => {
  it("R kasvades vaatevälja nurk ainult kahaneb", () => {
    for (const eyeM of EYE_DISTANCES_M) {
      let previous = Number.POSITIVE_INFINITY;
      for (const radiusM of RADII_M) {
        const current = viewAngleDeg(radiusM, APERTURE_M, eyeM);
        expect(current).toBeLessThan(previous);
        previous = current;
      }
    }
  });

  it("R = 10 000 m juures erineb kumera nurk tasapeegli omast alla 0,01°", () => {
    for (const eyeM of EYE_DISTANCES_M) {
      const difference =
        viewAngleDeg(10000, APERTURE_M, eyeM) -
        flatViewAngleDeg(APERTURE_M, eyeM);
      expect(difference).toBeGreaterThan(0);
      expect(difference).toBeLessThan(0.01);
    }
  });

  it("suur R viib ka laiuse tasapeegli omale: erinevus alla 0,1 %", () => {
    const convex = convexViewWidth(10000, APERTURE_M, 2, 5);
    const flat = flatViewWidth(APERTURE_M, 2, 5);
    expect(convex).toBeCloseTo(1.0503, 4);
    expect(flat).toBeCloseTo(1.05, 9);
    expect((convex - flat) / flat).toBeLessThan(0.001);
  });
});

/**
 * Lause „mida kaugemal vaataja, seda rohkem kumerpeegel võidab" ainus tõestus
 * (explore-4 tulemus). Spetsifikatsiooni arvud: 2,1 · 2,8 · 4,0 · 6,2.
 */
describe("kumera eelis kasvab vaataja kaugusega", () => {
  it.each([
    [0.5, 2.1],
    [1, 2.8],
    [2, 4.0],
    [5, 6.2],
  ])("d = %s m → kumer on %s korda laiem", (eyeM, expected) => {
    const ratio =
      convexViewWidth(1, APERTURE_M, eyeM, 5) /
      flatViewWidth(APERTURE_M, eyeM, 5);
    expect(ratio).toBeCloseTo(expected, 1);
  });

  it("suhe kasvab d kasvades monotoonselt", () => {
    let previous = 0;
    for (const eyeM of EYE_DISTANCES_M) {
      const ratio =
        convexViewWidth(1, APERTURE_M, eyeM, 5) /
        flatViewWidth(APERTURE_M, eyeM, 5);
      expect(ratio).toBeGreaterThan(previous);
      previous = ratio;
    }
  });
});

describe("peegli enda laius on alati sees", () => {
  it("L = 0 annab tasapeeglil täpselt 2a ja kumeral veidi rohkem", () => {
    for (const eyeM of EYE_DISTANCES_M) {
      expect(flatViewWidth(APERTURE_M, eyeM, 0)).toBeCloseTo(2 * APERTURE_M, 9);
      for (const radiusM of RADII_M) {
        expect(convexViewWidth(radiusM, APERTURE_M, eyeM, 0)).toBeGreaterThan(
          2 * APERTURE_M,
        );
      }
    }
  });
});

/**
 * Ristkontroll mooduliga `kumerpeegel`: kaks eraldi kirjutatud geomeetriat
 * peavad andma sama arvu (spetsifikatsioon „Miks EI ole see mooduli
 * `kumerpeegel` mudeli taaskasutus"). See on AINUS koht, kus selle mooduli
 * testid teist moodulit puudutavad – ja see on testis, mitte rakenduse koodis.
 * Käib ainult positiivsete väärtustega, sest a = 0 tähendus on siin teine.
 */
describe("ristkontroll mooduliga kumerpeegel (ainult testis)", () => {
  it("mirrorBulge annab sama arvu mõlemas moodulis", () => {
    for (const radiusM of RADII_M) {
      for (const apertureM of [0.05, 0.15, 0.3]) {
        expect(mirrorBulge(radiusM, apertureM)).toBeCloseTo(
          convexMirrorBulge(radiusM, apertureM),
          12,
        );
      }
    }
  });

  it("vaateväljas peituv θ on sama nurk, mille annab normalAngleDeg", () => {
    // θ tuleb kokkupandud nurgast tagasi: 2θ = vaatevälja poolnurk − φ, kus
    // φ on sama suure tasapeegli poolnurk kaugusel d + bulge.
    for (const radiusM of RADII_M) {
      for (const eyeM of EYE_DISTANCES_M) {
        const halfDeg = viewAngleDeg(radiusM, APERTURE_M, eyeM) / 2;
        const eyeAngleDeg =
          flatViewAngleDeg(APERTURE_M, eyeM + mirrorBulge(radiusM, APERTURE_M)) /
          2;
        expect((halfDeg - eyeAngleDeg) / 2).toBeCloseTo(
          convexNormalAngleDeg(radiusM, APERTURE_M),
          9,
        );
      }
    }
  });
});

describe("simulatsiooni turvavöönd – kogu liugurivõre annab mõistlikud arvud", () => {
  /** Kõik liuguriseisud, mida õpilane päriselt saavutada saab. */
  function* gridM(): Generator<{ radiusM: number; eyeM: number }> {
    for (
      let radiusCm = SLIDERS.radiusCm.min;
      radiusCm <= SLIDERS.radiusCm.max;
      radiusCm += SLIDERS.radiusCm.step
    ) {
      for (
        let eyeCm = SLIDERS.eyeDistanceCm.min;
        eyeCm <= SLIDERS.eyeDistanceCm.max;
        eyeCm += SLIDERS.eyeDistanceCm.step
      ) {
        yield {
          radiusM: metresFromCentimetres(radiusCm),
          eyeM: metresFromCentimetres(eyeCm),
        };
      }
    }
  }

  const apertureM = metresFromCentimetres(MIRROR_APERTURE_CM);
  const aisleM = metresFromCentimetres(AISLE_DISTANCE_CM);

  it("vaatevälja nurk jääb vahemikku 14,9°…75,8° ja alla veapiiri", () => {
    let smallest = Number.POSITIVE_INFINITY;
    let largest = 0;
    for (const { radiusM, eyeM } of gridM()) {
      const angleDeg = viewAngleDeg(radiusM, apertureM, eyeM);
      expect(angleDeg).toBeGreaterThan(0);
      // Poolnurk on kaugel valemi 90° piirist – seda hoiab mudeli oma kontroll,
      // aga liugurid ei tohi sinna lähedalegi viia.
      expect(angleDeg / 2).toBeLessThan(MAX_HALF_ANGLE_DEG);
      expect(angleDeg / 2).toBeLessThan(38);
      smallest = Math.min(smallest, angleDeg);
      largest = Math.max(largest, angleDeg);
    }
    // R = 300 cm, d = 500 cm ja R = 80 cm, d = 50 cm.
    expect(smallest).toBeCloseTo(14.898, 3);
    expect(largest).toBeCloseTo(75.754, 3);
  });

  it("nähtava ala laius on kogu võres positiivne ja lõplik", () => {
    for (const { radiusM, eyeM } of gridM()) {
      const widthM = convexViewWidth(radiusM, apertureM, eyeM, aisleM);
      expect(Number.isFinite(widthM)).toBe(true);
      expect(widthM).toBeGreaterThan(2 * apertureM);
    }
  });

  it("peegli serva nihe on kõige rohkem 1,42 cm", () => {
    // Mitte 1,1 cm – see kehtib ainult algväärtusel R = 100 cm (CodeRabbiti
    // leid, samm 4.1rr). Halvim juht on kõige kumeram peegel R = 80 cm.
    let largestCm = 0;
    for (const { radiusM } of gridM()) {
      largestCm = Math.max(
        largestCm,
        centimetresFromMetres(mirrorBulge(radiusM, apertureM)),
      );
    }
    expect(largestCm).toBeLessThan(1.42);
    expect(largestCm).toBeCloseTo(1.4188, 4);
  });

  it("peegel jääb kera peal tagasihoidlikuks lõiguks: a / R <= 0,1875", () => {
    const worstRatio = MIRROR_APERTURE_CM / SLIDERS.radiusCm.min;
    expect(worstRatio).toBeCloseTo(0.1875, 9);
    // Peegel peab kera peale ka päriselt ära mahtuma.
    expect(MIRROR_APERTURE_CM).toBeLessThan(SLIDERS.radiusCm.min);
  });

  it("liugurite algväärtused on võre peal – õpilane saab alguskoha tagasi", () => {
    expect((100 - SLIDERS.radiusCm.min) % SLIDERS.radiusCm.step).toBe(0);
    expect((200 - SLIDERS.eyeDistanceCm.min) % SLIDERS.eyeDistanceCm.step).toBe(
      0,
    );
  });
});

/**
 * Need on arvud, mida moodul õpilaselt päriselt küsib (explore-1, -2 ja -4).
 * Kui mudel ja spetsifikatsioon lähevad lahku, peab see selguma siin – mitte
 * tunnis. Ülesanded ise tulevad sammus 4.1tt.
 */
describe("õpilase arvud tulevad mudelist", () => {
  const apertureM = metresFromCentimetres(MIRROR_APERTURE_CM);
  const aisleM = metresFromCentimetres(AISLE_DISTANCE_CM);

  it("explore-1: algseis R = 100 cm, d = 200 cm → kumeras 4,3 m", () => {
    const widthM = convexViewWidth(
      metresFromCentimetres(100),
      apertureM,
      metresFromCentimetres(200),
      aisleM,
    );
    expect(widthM).toBeCloseTo(4.252, 3);
    // Ekraanil ühe kohaga peale koma; lugemistolerants 0,2 m katab.
    expect(Math.abs(widthM - 4.3)).toBeLessThan(0.2);
  });

  it("explore-2: sama seis tasapeeglis → 1,05 m ehk umbes 4 korda vähem", () => {
    const flatM = flatViewWidth(apertureM, metresFromCentimetres(200), aisleM);
    expect(flatM).toBeCloseTo(1.05, 9);
    const ratio =
      convexViewWidth(
        metresFromCentimetres(100),
        apertureM,
        metresFromCentimetres(200),
        aisleM,
      ) / flatM;
    expect(ratio).toBeCloseTo(4, 0);
  });

  it("explore-3: R = 300 cm juures kitseneb vaateväli tasapeegli poole", () => {
    const wide = viewAngleDeg(
      metresFromCentimetres(100),
      apertureM,
      metresFromCentimetres(200),
    );
    const flatter = viewAngleDeg(
      metresFromCentimetres(300),
      apertureM,
      metresFromCentimetres(200),
    );
    expect(flatter).toBeLessThan(wide);
    expect(flatter).toBeGreaterThan(flatViewAngleDeg(apertureM, 2));
  });

  it("explore-4: d = 500 cm → 3,7 m ja 0,6 m ehk 6 korda", () => {
    const eyeM = metresFromCentimetres(500);
    const convex = convexViewWidth(
      metresFromCentimetres(100),
      apertureM,
      eyeM,
      aisleM,
    );
    const flat = flatViewWidth(apertureM, eyeM, aisleM);
    expect(convex).toBeCloseTo(3.745, 3);
    expect(flat).toBeCloseTo(0.6, 9);
    // Vastus 6, tolerants 1 – õpilane jagab ekraanilt loetud arvud.
    expect(Math.abs(convex / flat - 6)).toBeLessThan(1);
  });

  it("õpilase jagamine käib LAIUSTE, mitte nurkadega", () => {
    // Nurkade suhe on teine arv kui laiuste suhe (peegli enda laius on laiuses
    // sees). Kui need kaks kunagi kõrvuti satuvad, tuleb õpilasele kaks eri
    // vastust – seepärast on vahe siin nähtaval.
    const eyeM = metresFromCentimetres(200);
    const radiusM = metresFromCentimetres(100);
    const angleRatio =
      viewAngleDeg(radiusM, apertureM, eyeM) / flatViewAngleDeg(apertureM, eyeM);
    const widthRatio =
      convexViewWidth(radiusM, apertureM, eyeM, aisleM) /
      flatViewWidth(apertureM, eyeM, aisleM);
    expect(Math.abs(angleRatio - widthRatio)).toBeGreaterThan(0.5);
  });
});

describe("ühikuteisendused – ainsad kaks kohta, kus ühik muutub", () => {
  it.each([
    [100, 1],
    [500, 5],
    [15, 0.15],
    [0, 0],
  ])("%s cm → %s m", (lengthCm, expected) => {
    expect(metresFromCentimetres(lengthCm)).toBeCloseTo(expected, 9);
  });

  it.each([
    [1, 100],
    [0.011314, 1.1314],
    [0.15, 15],
  ])("%s m → %s cm", (lengthM, expected) => {
    expect(centimetresFromMetres(lengthM)).toBeCloseTo(expected, 9);
  });

  it("peegli serva nihe sentimeetrites, nii nagu ekraanile jõuab", () => {
    expect(centimetresFromMetres(mirrorBulge(1, 0.15))).toBeCloseTo(1.1314, 4);
  });

  it("teisendus edasi-tagasi annab sama arvu", () => {
    for (const lengthCm of [0, 15, 50, 100, 200, 300, 500]) {
      expect(centimetresFromMetres(metresFromCentimetres(lengthCm))).toBeCloseTo(
        lengthCm,
        9,
      );
    }
  });

  it("vigane sisend viskab vea", () => {
    expect(() => metresFromCentimetres(Number.NaN)).toThrow(RangeError);
    expect(() => centimetresFromMetres(Number.POSITIVE_INFINITY)).toThrow(
      RangeError,
    );
  });

  it("lõplikust sisendist ei tohi tulla lõpmatust", () => {
    expect(() => centimetresFromMetres(1e308)).toThrow(RangeError);
    expect(() => centimetresFromMetres(-1e308)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// Mooduli sisu: manifest, sammud, õpetajajuhend (samm 4.1tt)
// ---------------------------------------------------------------------------

describe("manifest", () => {
  it("vastab moodulilepingu skeemile", () => {
    expect(() => manifestSchema.parse(manifest)).not.toThrow();
  });

  it("viitab õpitulemusele P1-T2 ega võta endale praktilist tööd", () => {
    // Rakendusmoodul: uut seadust ei tule, P1-PT1…PT4 on teiste moodulite all.
    expect(manifest.outcomes).toEqual(["P1-T2"]);
    expect(manifest.practicalWork).toEqual([]);
  });

  it("ei võta endale teiste moodulite ainekava põhimõisteid", () => {
    // `kumerpeegel` kuulub moodulile kumerpeegel, `fookus` moodulile
    // noguspeegel. Katvusraport võrdleb mõisteid NIME järgi: siia kirjutatuna
    // paistaks üks põhimõiste kaetuna kahest kohast ja arhiveerimisel ei oleks
    // enam näha, kumb katte kaotab.
    expect(manifest.concepts).toEqual(["vaateväli", "pimeala"]);
  });

  it("ei nimeta P2 mõisteid – muidu näitaks katvusraport läätsi kaetuna", () => {
    for (const concept of manifest.concepts) {
      expect(concept).not.toContain("fookuskaugus");
      expect(concept).not.toContain("optiline tugevus");
      expect(concept).not.toContain("kujutis");
    }
  });

  it("on mikromoodul: tund 15 min", () => {
    expect(manifest.minutes.lesson).toBe(15);
  });
});

/** Kogu tekst, mida ÕPILANE selles moodulis näeb – ühes hunnikus. */
function studentTexts(): string[] {
  const texts: string[] = [];
  for (const step of activities.steps) {
    texts.push(step.title);
    if ("body" in step && step.body) texts.push(...step.body);
    if (step.type === "practice" && step.worked) {
      texts.push(step.worked.prompt, ...step.worked.solution, step.worked.answer);
    }
    for (const question of stepQuestions(step)) {
      texts.push(question.prompt, ...(question.hints ?? []));
      if (question.kind === "choice") {
        texts.push(...question.options.map((option) => option.text));
      }
    }
  }
  for (const card of activities.reviewCards) {
    texts.push(card.question, card.answer);
  }
  return texts;
}

/** Ülesanne id järgi – veateade nimetab puuduja, mitte ei viska undefined-it. */
function numericQuestion(questionId: string) {
  for (const step of activities.steps) {
    for (const question of stepQuestions(step)) {
      if (question.id === questionId && question.kind === "numeric") {
        expect(question.variants, questionId).toBeUndefined();
        expect(question.answer, questionId).toBeDefined();
        return question;
      }
    }
  }
  throw new Error(`Arvküsimust "${questionId}" ei ole moodulis`);
}

function choiceQuestion(questionId: string) {
  for (const step of activities.steps) {
    for (const question of stepQuestions(step)) {
      if (question.id === questionId && question.kind === "choice") return question;
    }
  }
  throw new Error(`Valikküsimust "${questionId}" ei ole moodulis`);
}

describe("activities", () => {
  it("vastab moodulilepingu skeemile", () => {
    expect(() => activitiesSchema.parse(activities)).not.toThrow();
  });

  it("on väike moodul: kuus sammu, üks ekraan korraga", () => {
    // Suurusreegel (sisu/MALL-moodul.md): 3–6 sammu, üks õpieesmärk.
    expect(activities.steps.map((step) => step.type)).toEqual([
      "hook",
      "theory",
      "predict",
      "explore",
      "practice",
      "exit",
    ]);
  });

  it("spetsifikatsiooni kolm joonist on õigetes kohtades", () => {
    // Sildid peavad klappima registriga (moduleFigures) – seda valvab
    // tests/registry.test.ts alles siis, kui moodul on registris.
    const figures: (string | undefined)[] = [];
    for (const step of activities.steps) {
      if (step.type === "hook" || step.type === "theory") figures.push(step.figure);
      for (const question of stepQuestions(step)) {
        if (question.figure) figures.push(question.figure);
      }
    }
    expect(figures).toEqual(["kr-kolm-peeglit", "kr-vaatevali", "kr-ristmik"]);
  });

  it("õpilase pool ei ületa mooduli piire: ei fookuskaugust ega kujutist", () => {
    // sisu/MOODUL-kumerpeegli-rakendused.md „Piirid": fookuse arvutamine jäi
    // eelmisse moodulisse ja kujutise suurus on gümnaasium. „fookuskaugus" on
    // lisaks P2 põhimõiste – katvusraport võrdleb mõisteid nime järgi.
    const all = studentTexts().join(" ");
    expect(all).not.toContain("fookuskaugus");
    expect(all).not.toContain("kujutis");
  });

  it("ükski ülesanne ei nõua nurga arvutamist", () => {
    // Vaatevälja nurga valemis on arkussiinus ja arkustangens, mida 8. klassis
    // ei ole (spetsifikatsiooni „Piirid"). Arvud tulevad ekraanilt; õpilase enda
    // tehted on ainult jagamine ja korrutamine, seega ei ole ükski arvküsimus
    // kraadides.
    for (const step of activities.steps) {
      for (const question of stepQuestions(step)) {
        if (question.kind === "numeric") {
          expect(question.unit, question.id).not.toBe("°");
        }
      }
    }
  });
});

/**
 * Ülesannete vastused vs. mudel.
 *
 * `activities.ts` võtab iga laiuse MUDELIST (CLAUDE.md reegel 1), seega näpuviga
 * arvutuses siin välja ei paistaks – küll aga paistab välja vale liuguriseis,
 * vale ühik või vale tolerants. Seepärast on ootus kirjutatud SPETSIFIKATSIOONI
 * järgi (sisu/MOODUL-kumerpeegli-rakendused.md „Sammud" ja testiväärtuste
 * tabel).
 */
describe("ülesannete vastused käivad spetsifikatsiooniga kokku", () => {
  it("explore-1: kumerpeeglis on näha 4,252 m vahekäigust", () => {
    const question = numericQuestion("explore-1");
    expect(question.answer).toBeCloseTo(4.252, 3);
    expect(question.unit).toBe("m");
  });

  it("explore-2: sama suur tasapeegel näitab täpselt 1,05 m", () => {
    const question = numericQuestion("explore-2");
    expect(question.answer).toBeCloseTo(1.05, 9);
    expect(question.unit).toBe("m");
  });

  it("explore-4: 5 m kaugusel on kumera eelis 6,2-kordne ja ühikuta", () => {
    // Spetsifikatsiooni invariant „kumera eelis kasvab kaugusega": d = 2 m
    // juures 4,0 ja d = 5 m juures 6,2. Suhtarv on paljas arv.
    const question = numericQuestion("explore-4");
    expect(question.answer).toBeCloseTo(6.2, 1);
    expect(question.unit).toBeUndefined();
  });

  it("practice-1 ja exit-2 on mõõdetud arvudega, mitte simulatsioonist", () => {
    expect(numericQuestion("practice-1").answer).toBeCloseTo(4, 9);
    expect(numericQuestion("practice-1").unit).toBeUndefined();
    expect(numericQuestion("exit-2").answer).toBeCloseTo(3.2, 9);
    expect(numericQuestion("exit-2").unit).toBe("m");
  });

  it("laiustel on lugemistolerants 0,2 m, suhtarvudel 1 ja 0,5", () => {
    for (const id of ["explore-1", "explore-2", "exit-2"]) {
      expect(numericQuestion(id).tolerance, id).toEqual({
        mode: "absolute",
        value: 0.2,
      });
    }
    expect(numericQuestion("explore-4").tolerance).toEqual({
      mode: "absolute",
      value: 1,
    });
    expect(numericQuestion("practice-1").tolerance).toEqual({
      mode: "absolute",
      value: 0.5,
    });
  });

  it("lugemistolerants lubab ekraanilt loetud arvu, aga ei sega kaht peeglit", () => {
    // Ekraanil on laiused ühe kohaga peale koma. Kumera ja tasase peegli arvud
    // peavad jääma teineteisest kaugele: vale lehviku lugemine on just see viga,
    // mida explore-2 püüab.
    const convex = numericQuestion("explore-1");
    expect(checkNumericAnswer(convex, "4,3").correct).toBe(true);
    expect(checkNumericAnswer(convex, "1,05").correct).toBe(false);
    const flat = numericQuestion("explore-2");
    expect(checkNumericAnswer(flat, "1,05").correct).toBe(true);
    expect(checkNumericAnswer(flat, "1,1").correct).toBe(true);
    expect(checkNumericAnswer(flat, "4,3").correct).toBe(false);
  });

  it("sentimeetrites kirjutatud vastus loetakse samuti õigeks", () => {
    // Checker teisendab ühikuperekonna sees (src/checker/number.ts) – õpilast ei
    // tohi lukku jätta sellepärast, et ta kirjutas 105 cm.
    expect(checkNumericAnswer(numericQuestion("explore-2"), "105 cm").correct).toBe(
      true,
    );
  });

  it("explore-4 tolerants ei luba nurkade suhet vastuseks", () => {
    // Spetsifikatsiooni hoiatus: nurkade suhe on TEINE arv kui laiuste suhe,
    // sest peegli enda laius on laiuses sees. Selle ülesande seisus (d = 5 m) on
    // nurkade suhe 37,9° : 3,4° ≈ 11 ja laiuste suhe 6,2. Kui tolerants
    // laieneks, muutuks vale tehe vaikselt õigeks.
    const question = numericQuestion("explore-4");
    expect(
      viewAngleDeg(1, 0.15, 5) / flatViewAngleDeg(0.15, 5),
    ).toBeCloseTo(11.04, 2);
    expect(checkNumericAnswer(question, "6,2").correct).toBe(true);
    expect(checkNumericAnswer(question, "11").correct).toBe(false);
  });

  it("predict-1 õige vastus on kitsam lõik ja mõlemad valed on nimetatud", () => {
    const question = choiceQuestion("predict-1");
    expect(
      question.options.filter((option) => option.correct).map((option) => option.id),
    ).toEqual(["kitsam"]);
    const wrong = question.options.filter((option) => !option.correct);
    expect(wrong.map((option) => option.misconception)).toEqual([
      "peegli-suurus-maarab-vaatevalja",
      "tasapeegel-naitab-rohkem",
    ]);
  });

  it("explore-3 ütleb raadiuse mõlemad seisud välja ja kannab mudeli arve", () => {
    // Ülesanne palub liugurit liigutada, seega peab tekstis olema, kust kuhu.
    // Õige variandi kaks arvu tulevad mudelist ja on samad, mis ekraanil.
    const question = choiceQuestion("explore-3");
    expect(question.prompt).toContain("100 cm");
    expect(question.prompt).toContain("300 cm");
    const correct = question.options.filter((option) => option.correct);
    expect(correct.map((option) => option.id)).toEqual(["kitsamaks"]);
    expect(correct[0].text).toContain("4,3 m");
    expect(correct[0].text).toContain("2,1 m");
  });

  it("practice-3 autode järjekorda ei segata ja õige vastus on A ja B", () => {
    const question = choiceQuestion("practice-3");
    expect(question.shuffle).toBe(false);
    expect(question.options.map((option) => option.id)).toEqual([
      "ainult-a",
      "a-ja-b",
      "koiki",
    ]);
    expect(question.options.filter((option) => option.correct)[0].id).toBe("a-ja-b");
    // „Kõiki kolme" on väärarusaam, mitte lihtsalt vale arv.
    const all = question.options.find((option) => option.id === "koiki");
    expect(all?.misconception).toBe("kumerpeegel-naitab-koike");
  });

  it("practice-4 ülekandeülesandel on kolm õiget kohta", () => {
    const question = choiceQuestion("practice-4");
    expect(question.multiple).toBe(true);
    expect(question.options.filter((option) => option.correct)).toHaveLength(3);
    // Kaks valet on nõguspeegli tööd – just need kaks väärarusaama moodul püüab.
    const wrong = question.options.filter((option) => !option.correct);
    expect(wrong.map((option) => option.misconception).sort()).toEqual([
      "kumer-koondab",
      "kumer-suurendab",
    ]);
  });
});

describe("õpetajajuhend katab mooduli väärarusaamad ja ohutuse", () => {
  const known = new Set(teacher.misconceptions.map((item) => item.id));

  it("iga activities.ts silt on õpetajajuhendis lahti seletatud", () => {
    for (const step of activities.steps) {
      for (const question of stepQuestions(step)) {
        if (question.kind === "choice") {
          for (const option of question.options) {
            if (option.misconception) {
              expect(known, `${question.id}/${option.id}`).toContain(
                option.misconception,
              );
            }
          }
        }
        if (question.kind === "numeric") {
          for (const trap of question.traps ?? []) {
            expect(known, question.id).toContain(trap.misconception);
          }
        }
      }
    }
  });

  it("spetsifikatsiooni kaheksa väärarusaama on kõik olemas", () => {
    for (const id of [
      "peegli-suurus-maarab-vaatevalja",
      "tasapeegel-naitab-rohkem",
      "kumer-suurendab",
      "kumer-koondab",
      "peegel-muudab-kaugust",
      "peegel-aeglustab-valgust",
      "kumerpeegel-naitab-koike",
      "lamedam-vaatevali-laiem",
    ]) {
      expect(known, id).toContain(id);
    }
  });

  it("ohutus ütleb vahe nõguspeegliga välja ja ei luba peeglil pead asendada", () => {
    // Siin on ohutus TEISTPIDI kui nõguspeeglil: kumerpeegel ei sütita midagi.
    // Just seepärast tuleb vahe välja öelda – ja lisada, mis siin ASEMEL ohtlik
    // on: pimestamine ja usk, et peegel näitab kõike.
    expect(teacher.safety).toContain("hajutab");
    expect(teacher.safety).toContain("Nõguspeegel");
    expect(teacher.safety).toContain("pea pööramist");
  });

  it("õpetaja saab teada, miks päris peegel on nurga all", () => {
    // model.ts idealiseeringud 1 ja 5 – UI ei tohi neid päris füüsikana esitada.
    expect(teacher.whyRealDiffers).toContain("nurga all");
  });

  it("tunniplaani minutid annavad kokku manifesti tunnipikkuse", () => {
    const total = teacher.lessonPlan.reduce((sum, item) => sum + item.minutes, 0);
    expect(total).toBe(manifest.minutes.lesson);
  });

  it("iga tunniplaani rida vastab päris sammule", () => {
    const types = new Set(activities.steps.map((step) => step.type));
    for (const item of teacher.lessonPlan) {
      expect(types, item.step).toContain(item.step);
    }
  });
});
