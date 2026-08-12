import { describe, expect, it } from "vitest";
import { reflectParallelRay as concaveReflectParallelRay } from "../src/modules/physics/noguspeegel/model";
import {
  MAX_RAY_HEIGHT_RATIO,
  MIRROR_HALF_HEIGHT_CM,
  SAFE_HEIGHT_RATIO,
  SLIDERS,
  centimetresFromMetres,
  focalLength,
  metresFromCentimetres,
  mirrorBulge,
  normalAngleDeg,
  reflectParallelRay,
} from "../src/modules/physics/kumerpeegel/model";

/**
 * Kumerpeegli mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist (sisu/MOODUL-kumerpeegel.md
 * „Füüsika" → testiväärtuste tabel ja aberratsioonitabel ning sammude juures
 * kirjas olevad vastused), mitte mudelist tagurpidi tuletatud – muidu testiks
 * test iseennast. Kaasa on võetud ka need arvud, mille peal moodul õpilast
 * hiljem päriselt kontrollib (simulatsiooni ülesanded, harjutused,
 * väljumispilet, kordamiskaardid) – nii selgub näpuviga siin, mitte tunnis.
 *
 * Pikkused on mudelis meetrites, nurgad kraadides.
 */

describe("focalLength – näiline fookus on pool raadiusest", () => {
  it.each([
    [0.5, 0.25],
    [1, 0.5],
    [1.6, 0.8],
    [0.14, 0.07],
  ])("R = %s m → f = %s m", (radiusM, expected) => {
    expect(focalLength(radiusM)).toBeCloseTo(expected, 9);
  });

  it("vigane raadius viskab vea", () => {
    expect(() => focalLength(0)).toThrow(RangeError);
    expect(() => focalLength(-1)).toThrow(RangeError);
    expect(() => focalLength(Number.NaN)).toThrow(RangeError);
    expect(() => focalLength(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe("mirrorBulge – kui palju on kohtumispunkt tipust taga", () => {
  it.each([
    [1, 0, 0],
    [1, 0.6, 0.2],
    [1, 0.1, 0.0050126],
    [0.5, 0.1, 0.0101021],
  ])("R = %s m, h = %s m → %s m", (radiusM, heightM, expected) => {
    expect(mirrorBulge(radiusM, heightM)).toBeCloseTo(expected, 6);
  });

  it("|h| = R on poolkera: kummumine on täpselt R", () => {
    expect(mirrorBulge(0.5, 0.5)).toBeCloseTo(0.5, 9);
    expect(mirrorBulge(0.5, -0.5)).toBeCloseTo(0.5, 9);
  });

  it("negatiivne kõrgus annab sama kummumise mis positiivne", () => {
    expect(mirrorBulge(1, -0.6)).toBeCloseTo(mirrorBulge(1, 0.6), 9);
  });

  it("kiir ei saa peeglist mööda minna: |h| > R viskab vea", () => {
    expect(() => mirrorBulge(0.5, 0.51)).toThrow(RangeError);
    expect(() => mirrorBulge(0.5, -0.51)).toThrow(RangeError);
  });

  it("vigased arvud viskavad vea", () => {
    expect(() => mirrorBulge(0, 0.1)).toThrow(RangeError);
    expect(() => mirrorBulge(1, Number.NaN)).toThrow(RangeError);
    expect(() => mirrorBulge(1, Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe("normalAngleDeg – ristsirge on raadiuse siht, peegli taha", () => {
  it.each([
    [1, 0.5, 30],
    [0.4, 0.2, 30],
    [1, 0.6, 36.87],
    [1, 0, 0],
  ])("R = %s m, h = %s m → %s°", (radiusM, heightM, expected) => {
    expect(normalAngleDeg(radiusM, heightM)).toBeCloseTo(expected, 2);
  });

  it("−h annab sama nurga mis +h (peegel on sümmeetriline)", () => {
    expect(normalAngleDeg(1, -0.5)).toBeCloseTo(30, 9);
  });

  it("peegli servas on ristsirge peateljega risti: 90°", () => {
    expect(normalAngleDeg(0.5, 0.5)).toBeCloseTo(90, 9);
    expect(normalAngleDeg(0.5, -0.5)).toBeCloseTo(90, 9);
  });

  it("|h| > R viskab vea", () => {
    expect(() => normalAngleDeg(1, 1.0001)).toThrow(RangeError);
  });
});

describe("reflectParallelRay – paralleelse kiire saatus", () => {
  it("R = 1 m, h = 0,6 m: α = β = 36,870°, kalle 73,740°, pikenduse lõige 0,375 m", () => {
    const ray = reflectParallelRay(1, 0.6);
    expect(ray.bulgeM).toBeCloseTo(0.2, 9);
    expect(ray.incidenceDeg).toBeCloseTo(36.87, 3);
    expect(ray.reflectionDeg).toBeCloseTo(36.87, 3);
    expect(ray.deflectionDeg).toBeCloseTo(73.74, 3);
    // Täpne arv: 3-4-5 kolmnurk annab siin murruna 0,375.
    expect(ray.virtualCrossM).toBeCloseTo(0.375, 9);
  });

  it("R = 1 m, h = 0,1 m: α = β = 5,739°, kalle 11,478°, lõige 0,49748 m", () => {
    const ray = reflectParallelRay(1, 0.1);
    expect(ray.incidenceDeg).toBeCloseTo(5.739, 3);
    expect(ray.deflectionDeg).toBeCloseTo(11.478, 3);
    expect(ray.virtualCrossM).toBeCloseTo(0.49748, 4);
  });

  it("R = 0,5 m, h = 0,1 m: α = β = 11,537°, kalle 23,074°, lõige 0,24484 m", () => {
    const ray = reflectParallelRay(0.5, 0.1);
    expect(ray.incidenceDeg).toBeCloseTo(11.537, 3);
    expect(ray.deflectionDeg).toBeCloseTo(23.074, 3);
    expect(ray.virtualCrossM).toBeCloseTo(0.24484, 4);
  });

  it("h = 0 on kokkulepe: piirväärtus on täpselt näiline fookus R/2", () => {
    const ray = reflectParallelRay(1, 0);
    expect(ray.bulgeM).toBeCloseTo(0, 9);
    expect(ray.incidenceDeg).toBeCloseTo(0, 9);
    expect(ray.deflectionDeg).toBeCloseTo(0, 9);
    expect(ray.virtualCrossM).toBeCloseTo(focalLength(1), 9);
  });

  it("vahetult piiri all vastab veel: R = 1 m, h = 0,86 m → α = 59,317°, lõige 0,0202 m", () => {
    const ray = reflectParallelRay(1, 0.86);
    expect(ray.incidenceDeg).toBeCloseTo(59.317, 3);
    expect(ray.virtualCrossM).toBeCloseTo(0.0202, 4);
    // Arv on väike, aga POSITIIVNE – lubadus „kaugus peegli taga" kehtib veel.
    expect(ray.virtualCrossM).toBeGreaterThan(0);
  });
});

/**
 * Kumerpeegli mudeli oma piir, mida nõguspeeglil ei ole: peegeldunud kiire
 * pikendus peab lõikama peatelge peegli TAGA. θ = 60° juures tuleks null ja
 * edasi negatiivne arv, θ = 90° juures lõpmatus – kumbagi ei tohi mudel
 * vaikselt tagastada, sest selles moodulis ei ole ühtegi negatiivset pikkust.
 */
describe("liiga kõrgele langev kiir viskab vea, ei anna negatiivset kaugust", () => {
  it("θ = 60° täpselt (|h| = R·√3/2) on juba viga: lõige oleks null", () => {
    expect(() => reflectParallelRay(1, Math.sqrt(3) / 2)).toThrow(RangeError);
    expect(() => reflectParallelRay(1, -Math.sqrt(3) / 2)).toThrow(RangeError);
  });

  it("θ > 60° (h = 0,9 m) annaks negatiivse arvu", () => {
    expect(() => reflectParallelRay(1, 0.9)).toThrow(RangeError);
  });

  it("peegli serv (|h| = R) viskab vea, ei tagasta lõpmatust", () => {
    expect(() => reflectParallelRay(0.5, 0.5)).toThrow(RangeError);
    expect(() => reflectParallelRay(0.5, -0.5)).toThrow(RangeError);
    expect(() => reflectParallelRay(1, 1)).toThrow(RangeError);
  });

  it("piir on √3/2 ehk ligikaudu 0,866", () => {
    expect(MAX_RAY_HEIGHT_RATIO).toBeCloseTo(0.8660254, 7);
  });

  it("mirrorBulge ja normalAngleDeg jäävad LAIEMA vahemiku juurde", () => {
    // Sama sisend, mis reflectParallelRay's on viga: peegli kaare joonistamiseks
    // on ta mõistlik, ainult lõikepunkt kaotab mõtte varem.
    expect(mirrorBulge(1, 0.9)).toBeCloseTo(1 - Math.sqrt(1 - 0.81), 9);
    expect(normalAngleDeg(1, 0.9)).toBeCloseTo(64.158, 3);
  });

  it("vigased arvud viskavad vea", () => {
    expect(() => reflectParallelRay(-1, 0.1)).toThrow(RangeError);
    expect(() => reflectParallelRay(1, Number.NaN)).toThrow(RangeError);
    expect(() => reflectParallelRay(1, Number.POSITIVE_INFINITY)).toThrow(
      RangeError,
    );
  });
});

/**
 * Codexi leid (samm 4.1ii, sama klass viga leiti ka vedeliku-rohu mudelis):
 * lõplikest sisenditest võib tulla NaN või lõpmatus, ja see jõuaks joonisele
 * vaikselt vale füüsikana. Mudel viskab sellises kohas vea.
 */
describe("ülevool ei tohi anda vaikset NaN-i", () => {
  it("mirrorBulge: R² ja h² voolavad üle, vahe oleks NaN", () => {
    expect(() => mirrorBulge(1e308, 1e307)).toThrow(RangeError);
  });

  it("normalAngleDeg: sama sisend annab ausa nurga, mitte NaN-i", () => {
    // Siin ülevoolu ei teki (jagatis |h|/R jääb alla ühe), seega on ainus
    // õige käitumine päris vastus – test hoiab selle vahe nähtaval.
    expect(normalAngleDeg(1e308, 1e307)).toBeCloseTo(normalAngleDeg(1, 0.1), 9);
  });

  it("reflectParallelRay: hiiglaslik peegel jääb tööle, sest cos θ ≥ 0,5", () => {
    // Kumerpeegli piir (θ < 60°) hoiab jagatise ohutuna, seega on õige
    // käitumine päris vastus. Nõguspeeglil, kus serv on lubatud lähemale,
    // sama sisend viskab vea – see vahe on meelega.
    expect(reflectParallelRay(1e308, 1e307).virtualCrossM).toBeCloseTo(
      1e308 * reflectParallelRay(1, 0.1).virtualCrossM,
      -300,
    );
  });

  it("tavalised suured, aga mõistlikud arvud jäävad tööle", () => {
    // Liikluspeegli mõõtu kera (R = 2 m), kiir 20 cm kõrgusel: h/R = 0,1.
    expect(reflectParallelRay(2, 0.2).virtualCrossM).toBeCloseTo(0.99497, 4);
  });
});

/**
 * Kümme raadiust × kümme kõrgust – need paarid katavad nii lameda kui ka
 * kumera peegli ja neid kasutavad kõik allpool olevad seaduspärade testid.
 * h püsib alati rangelt alla lubatud piiri R·√3/2 (piir ise on eraldi
 * kontrollitud).
 */
const RADII_M = [0.1, 0.25, 0.4, 0.5, 0.75, 1, 1.2, 1.6, 2, 5];
const HEIGHT_RATIOS = [0, 0.05, 0.1, 0.2, 0.3, 0.45, 0.6, 0.75, 0.8, 0.86];

describe("peegeldumisseadus on invariant, mitte üks testirida", () => {
  it("α = β ja kalle = 2α iga R ja h korral", () => {
    for (const radiusM of RADII_M) {
      for (const ratio of HEIGHT_RATIOS) {
        const ray = reflectParallelRay(radiusM, ratio * radiusM);
        expect(ray.reflectionDeg).toBe(ray.incidenceDeg);
        expect(ray.deflectionDeg).toBe(2 * ray.incidenceDeg);
      }
    }
  });

  it("langemisnurk on sama arv, mille annab normalAngleDeg", () => {
    for (const radiusM of RADII_M) {
      for (const ratio of HEIGHT_RATIOS) {
        const heightM = ratio * radiusM;
        expect(reflectParallelRay(radiusM, heightM).incidenceDeg).toBeCloseTo(
          normalAngleDeg(radiusM, heightM),
          9,
        );
      }
    }
  });

  it("kohtumispunkt on sama arv, mille annab mirrorBulge", () => {
    for (const radiusM of RADII_M) {
      for (const ratio of HEIGHT_RATIOS) {
        const heightM = ratio * radiusM;
        expect(reflectParallelRay(radiusM, heightM).bulgeM).toBeCloseTo(
          mirrorBulge(radiusM, heightM),
          9,
        );
      }
    }
  });
});

describe("sümmeetria: +h ja −h annavad sama vastuse", () => {
  it("kõik väljad on samad", () => {
    for (const radiusM of RADII_M) {
      for (const ratio of HEIGHT_RATIOS) {
        const heightM = ratio * radiusM;
        expect(reflectParallelRay(radiusM, -heightM)).toEqual(
          reflectParallelRay(radiusM, heightM),
        );
      }
    }
  });
});

describe("mõõtkava: peegli suuremaks tegemine venitab ainult joonist", () => {
  it("reflectParallelRay(1, 0.2) = 2 × reflectParallelRay(0.5, 0.1)", () => {
    const big = reflectParallelRay(1, 0.2);
    const small = reflectParallelRay(0.5, 0.1);
    expect(big.virtualCrossM).toBeCloseTo(2 * small.virtualCrossM, 9);
    expect(big.bulgeM).toBeCloseTo(2 * small.bulgeM, 9);
    // Nurgad on mõõtkavast SÕLTUMATUD – need ei kahekordistu.
    expect(big.incidenceDeg).toBeCloseTo(small.incidenceDeg, 9);
  });

  it("kaks korda suurem peegel iga R ja h korral", () => {
    for (const radiusM of RADII_M) {
      for (const ratio of HEIGHT_RATIOS) {
        const heightM = ratio * radiusM;
        expect(
          reflectParallelRay(2 * radiusM, 2 * heightM).virtualCrossM,
        ).toBeCloseTo(2 * reflectParallelRay(radiusM, heightM).virtualCrossM, 9);
      }
    }
  });
});

describe("sfääriline aberratsioon on ühesuunaline ja monotoonne", () => {
  it("lõikepunkt ei ole kunagi näilisest fookusest kaugemal", () => {
    for (const radiusM of RADII_M) {
      for (const ratio of HEIGHT_RATIOS) {
        const ray = reflectParallelRay(radiusM, ratio * radiusM);
        expect(ray.virtualCrossM).toBeLessThanOrEqual(
          focalLength(radiusM) + 1e-12,
        );
      }
    }
  });

  it("|h| kasvades lõikepunkt ainult läheneb peeglile, aga jääb positiivseks", () => {
    for (const radiusM of RADII_M) {
      let previous = Number.POSITIVE_INFINITY;
      for (let ratio = 0; ratio <= 0.86; ratio += 0.01) {
        const current = reflectParallelRay(radiusM, ratio * radiusM)
          .virtualCrossM;
        expect(current).toBeLessThanOrEqual(previous);
        // Kogu lubatud vahemikus on vastus kaugus peegli TAGA, mitte ees.
        expect(current).toBeGreaterThan(0);
        previous = current;
      }
    }
  });

  it("aberratsioonitabel spetsifikatsioonist", () => {
    expect(reflectParallelRay(1, 0).virtualCrossM).toBeCloseTo(0.5, 9);
    expect(reflectParallelRay(1, 0.1).virtualCrossM).toBeCloseTo(0.49748, 4);
    expect(reflectParallelRay(0.5, 0.1).virtualCrossM).toBeCloseTo(0.24484, 4);
    expect(reflectParallelRay(1, 0.6).virtualCrossM).toBeCloseTo(0.375, 9);
  });
});

/**
 * Ristkontroll nõguspeegliga: kaks eraldi kirjutatud geomeetriat peavad andma
 * sama arvu (spetsifikatsioon „Miks EI ole see nõguspeegli mudeli taaskasutus").
 * Kui üks neist kunagi lahku läheb, on üks katki. See on AINUS koht, kus
 * kumerpeegel teist moodulit üldse puudutab – ja see on testis, mitte
 * rakenduse koodis.
 */
describe("ristkontroll nõguspeegli mudeliga (ainult testis)", () => {
  it("virtualCrossM on sama arv, mis nõguspeegli axisCrossM", () => {
    for (const radiusM of RADII_M) {
      for (const ratio of HEIGHT_RATIOS) {
        const heightM = ratio * radiusM;
        const convex = reflectParallelRay(radiusM, heightM);
        const concave = concaveReflectParallelRay(radiusM, heightM);
        expect(convex.virtualCrossM).toBeCloseTo(concave.axisCrossM, 12);
        expect(convex.bulgeM).toBeCloseTo(concave.depthM, 12);
        expect(convex.incidenceDeg).toBeCloseTo(concave.incidenceDeg, 12);
      }
    }
  });

  it("sama arv, vastupidine tähendus – seda hoiab lahus ainult nimi", () => {
    // Arv on identne, aga kumerpeeglil on ta peegli TAGA (pikenduste lõige) ja
    // nõguspeeglil peegli EES (koht, kust valgus päriselt läbi käib). Sellepärast
    // on kaks eraldi moodulit, mitte üks ühine „kõverpeegel".
    expect(reflectParallelRay(1, 0.6).virtualCrossM).toBeCloseTo(
      concaveReflectParallelRay(1, 0.6).axisCrossM,
      12,
    );
  });
});

describe("simulatsiooni turvavöönd hoiab lauset „pikendused lõikuvad ühes punktis“", () => {
  it("h/R ≤ 0,2 korral on erinevus näilisest fookusest alla 3 %", () => {
    for (const radiusM of RADII_M) {
      for (let ratio = 0; ratio <= SAFE_HEIGHT_RATIO + 1e-12; ratio += 0.01) {
        const focusM = focalLength(radiusM);
        const crossM = reflectParallelRay(radiusM, ratio * radiusM)
          .virtualCrossM;
        expect(Math.abs(focusM - crossM) / focusM).toBeLessThan(0.03);
      }
    }
  });

  it("liugurite piirid jäävad turvavööndisse", () => {
    // Halvim juht: kõige kõrgem kiir kõige väiksema raadiusega peeglil.
    const worstRatio = SLIDERS.rayHeightCm.max / SLIDERS.radiusCm.min;
    expect(worstRatio).toBeLessThanOrEqual(SAFE_HEIGHT_RATIO);
    // Ja turvavöönd ise jääb kaugele mudeli veapiirist.
    expect(SAFE_HEIGHT_RATIO).toBeLessThan(MAX_RAY_HEIGHT_RATIO);
  });

  it("peegel ei ole valitud kiirest madalam", () => {
    expect(SLIDERS.rayHeightCm.max).toBe(MIRROR_HALF_HEIGHT_CM);
  });

  it("liuguri iga raadiuse juures on peegli servakiir alla 3 % vea", () => {
    const { min, max, step } = SLIDERS.radiusCm;
    for (let radiusCm = min; radiusCm <= max; radiusCm += step) {
      const radiusM = metresFromCentimetres(radiusCm);
      const heightM = metresFromCentimetres(MIRROR_HALF_HEIGHT_CM);
      const focusM = focalLength(radiusM);
      const crossM = reflectParallelRay(radiusM, heightM).virtualCrossM;
      expect(Math.abs(focusM - crossM) / focusM).toBeLessThan(0.03);
    }
  });
});

describe("ühikuteisendused – ainsad kaks kohta, kus ühik muutub", () => {
  it.each([
    [100, 1],
    [60, 0.6],
    [10, 0.1],
    [0, 0],
    [-10, -0.1],
  ])("%s cm → %s m", (lengthCm, expected) => {
    expect(metresFromCentimetres(lengthCm)).toBeCloseTo(expected, 9);
  });

  it.each([
    [1, 100],
    [0.3, 30],
    [0.025, 2.5],
  ])("%s m → %s cm", (lengthM, expected) => {
    expect(centimetresFromMetres(lengthM)).toBeCloseTo(expected, 9);
  });

  it("teisendus edasi-tagasi annab sama arvu", () => {
    for (const lengthCm of [0, 1, 10, 24, 50, 90, 160, 200]) {
      expect(
        centimetresFromMetres(metresFromCentimetres(lengthCm)),
      ).toBeCloseTo(lengthCm, 9);
    }
  });

  it("vigane sisend viskab vea", () => {
    expect(() => metresFromCentimetres(Number.NaN)).toThrow(RangeError);
    expect(() => centimetresFromMetres(Number.POSITIVE_INFINITY)).toThrow(
      RangeError,
    );
  });

  /**
   * Codexi leid (samm 4.1mm): sisend on lõplik arv, aga korrutis voolab üle.
   * Liuguri piirides (50…200 cm) seda ei juhtu, aga teisendus on viimane koht
   * enne ekraanile jõudmist – siit tohib välja tulla ainult arv, mille taga
   * mudel seista saab.
   */
  it("lõplikust sisendist ei tohi tulla lõpmatust", () => {
    expect(() => centimetresFromMetres(1e308)).toThrow(RangeError);
    expect(() => centimetresFromMetres(-1e308)).toThrow(RangeError);
    // Jagamine üle ei voola, aga alla küll: väga väike arv jääb siin ausalt
    // nulli lähedale ja see EI ole viga.
    expect(metresFromCentimetres(1e-320)).toBeGreaterThanOrEqual(0);
  });
});

/**
 * Need on arvud, mida moodul õpilaselt päriselt küsib. Kui mudel ja
 * spetsifikatsioon lähevad lahku, peab see selguma siin – mitte tunnis.
 * Õpilase pool räägib sentimeetrites, seega käib iga arv läbi mõlema
 * teisenduse.
 */
describe("õpilase arvud tulevad mudelist", () => {
  /** Näilise fookuse kaugus sentimeetrites, nii nagu ekraanile jõuab. */
  function focusCm(radiusCm: number): number {
    return centimetresFromMetres(focalLength(metresFromCentimetres(radiusCm)));
  }

  it.each([
    // [raadius cm, näiline fookus cm, kust ülesanne pärit on]
    [100, 50, "explore-1"],
    [160, 80, "explore-2"],
    [60, 30, "practice-1 näidis"],
    [90, 45, "practice-2 lünk"],
    [24, 12, "exit-2"],
    [70, 35, "rc-3 kordamiskaart"],
  ])("R = %s cm → näiline fookus %s cm (%s)", (radiusCm, expected) => {
    expect(focusCm(radiusCm)).toBeCloseTo(expected, 9);
  });

  it("practice-3 pöördülesanne: näiline fookus 2,5 cm → jõulukuuli raadius 5 cm", () => {
    // Pöördülesanne käib sama valemiga tagurpidi: R = 2f. Mudelis eraldi
    // funktsiooni ei ole (õpilane teeb selle peast), seega kontrollib test, et
    // edasi arvutades tuleb sama arv tagasi.
    expect(focusCm(5)).toBeCloseTo(2.5, 9);
  });

  it("explore-3: kiire kõrgusel 10 cm on α = β ja ekraanil 5,7°", () => {
    const radiusM = metresFromCentimetres(100);
    const heightM = metresFromCentimetres(MIRROR_HALF_HEIGHT_CM);
    const ray = reflectParallelRay(radiusM, heightM);
    expect(ray.incidenceDeg).toBe(ray.reflectionDeg);
    // Ekraanil ühe kohaga: 5,7°. Tolerants 0,5° katab lugemisvea.
    expect(ray.incidenceDeg).toBeCloseTo(5.739, 3);
    expect(Math.abs(ray.incidenceDeg - 5.7)).toBeLessThan(0.5);
  });

  it("simulatsiooni algseis: R = 100 cm → näiline fookus 50 cm, tolerants 2 cm katab", () => {
    const radiusM = metresFromCentimetres(100);
    const heightM = metresFromCentimetres(MIRROR_HALF_HEIGHT_CM);
    // Ekraanil olev mõõdujoon näitab fookust R/2, aga valitud kiire pikendus
    // lõikab telge natuke lähemal (aberratsioon). Vahe peab mahtuma ülesande
    // lugemistolerantsi 2 cm sisse, muidu näeks õpilane kahte eri arvu.
    const focusCmValue = centimetresFromMetres(focalLength(radiusM));
    const crossCm = centimetresFromMetres(
      reflectParallelRay(radiusM, heightM).virtualCrossM,
    );
    expect(focusCmValue).toBeCloseTo(50, 9);
    expect(Math.abs(focusCmValue - crossCm)).toBeLessThan(2);
  });
});
