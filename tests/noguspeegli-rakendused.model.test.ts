import { describe, expect, it } from "vitest";
import { checkNumericAnswer } from "../src/checker/numeric";
import { stepQuestions } from "../src/engine/contract";
import { activitiesSchema, manifestSchema } from "../src/engine/contractSchema";
import { focalLength as concaveFocalLength } from "../src/modules/physics/noguspeegel/model";
import { activities } from "../src/modules/physics/noguspeegli-rakendused/activities";
import { manifest } from "../src/modules/physics/noguspeegli-rakendused/manifest";
import { teacher } from "../src/modules/physics/noguspeegli-rakendused/teacher";
import {
  MIRROR_DIAMETER_CM,
  SLIDERS,
  SUN_ANGULAR_DEG,
  WALL_DISTANCE_M,
  beamDiameter,
  centimetresFromMetres,
  focalLength,
  focalSpotDiameter,
  metresFromCentimetres,
  metresFromMillimetres,
  millimetresFromMetres,
  solarConcentration,
} from "../src/modules/physics/noguspeegli-rakendused/model";

/**
 * Nõguspeegli rakenduste mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist
 * (sisu/MOODUL-noguspeegli-rakendused.md „Füüsika (model.ts jaoks)" →
 * testiväärtuste tabel ning piirjuhud ja invariandid), mitte mudelist
 * tagurpidi tuletatud – muidu testiks test iseennast.
 *
 * Pikkused on mudelis meetrites, nurgad kraadides. Simulatsiooni algseis on
 * D = 0,1 m, f = 0,1 m, s = 0,002 m ja sein L = 20 m kaugusel; osa ridu
 * kasutab meelega teisi mõõte (päikeseahi, teleskoop), sest mudel peab
 * vastama õigesti ka väljaspool liuguri vahemikku ja just seal on piirid.
 */

describe("focalLength – fookus on poole raadiuse kaugusel", () => {
  it.each([
    // Simulatsiooni algseis: R = 20 cm.
    [0.2, 0.1],
    [1, 0.5],
    [0.6, 0.3],
  ])("R = %s m → f = %s m", (radiusM, expected) => {
    expect(focalLength(radiusM)).toBeCloseTo(expected, 9);
  });

  it("vigased arvud viskavad vea", () => {
    expect(() => focalLength(0)).toThrow(RangeError);
    expect(() => focalLength(-1)).toThrow(RangeError);
    expect(() => focalLength(Number.NaN)).toThrow(RangeError);
    expect(() => focalLength(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe("beamDiameter – valgusringi läbimõõt kaugel seinal", () => {
  it.each([
    // Simulatsiooni algseis: 2 mm LED-kiip.
    [0.1, 0.1, 0.002, 20, 0.5],
    // Hõõgpirn LED-i asemel – sama peegel, neli korda laiem ring.
    [0.1, 0.1, 0.01, 20, 2.1],
    // Lamedam peegel – kitsam vihk.
    [0.1, 0.3, 0.002, 20, 0.233333],
    // Parim seis liuguritel.
    [0.1, 0.3, 0.001, 20, 0.166667],
    [0.1, 0.2, 0.001, 20, 0.2],
    // Päris taskulamp 50 m kaugusel.
    [0.1, 0.1, 0.005, 50, 2.6],
  ])(
    "D = %s m, f = %s m, s = %s m, L = %s m → %s m",
    (mirrorM, focalM, sourceM, distM, expected) => {
      expect(beamDiameter(mirrorM, focalM, sourceM, distM)).toBeCloseTo(
        expected,
        6,
      );
    },
  );

  /**
   * Kogu mooduli lähtekoht: ideaalse punktallikaga jääks vihk igavesti peegli
   * laiuseks. See peab olema testis, mitte ainult tekstis.
   */
  it("s = 0 hoiab vihu koos: iga kaugus annab peegli enda laiuse", () => {
    for (const distM of [0, 1, 20, 50, 1000, 100000]) {
      expect(beamDiameter(0.1, 0.1, 0, distM)).toBeCloseTo(0.1, 9);
    }
  });

  it("L = 0 annab peegli enda laiuse ka päris pirniga", () => {
    expect(beamDiameter(0.1, 0.1, 0.002, 0)).toBeCloseTo(0.1, 9);
  });

  it("negatiivne kaugus ja negatiivne allikas viskavad vea", () => {
    expect(() => beamDiameter(0.1, 0.1, 0.002, -1)).toThrow(RangeError);
    expect(() => beamDiameter(0.1, 0.1, -0.002, 20)).toThrow(RangeError);
  });

  it("ilma suuruseta peeglit ega fookust ei ole olemas", () => {
    expect(() => beamDiameter(0, 0.1, 0.002, 20)).toThrow(RangeError);
    expect(() => beamDiameter(-0.1, 0.1, 0.002, 20)).toThrow(RangeError);
    expect(() => beamDiameter(0.1, 0, 0.002, 20)).toThrow(RangeError);
    expect(() => beamDiameter(0.1, -0.1, 0.002, 20)).toThrow(RangeError);
  });

  it("vigased arvud viskavad vea", () => {
    expect(() => beamDiameter(Number.NaN, 0.1, 0.002, 20)).toThrow(RangeError);
    expect(() => beamDiameter(0.1, Number.NaN, 0.002, 20)).toThrow(RangeError);
    expect(() => beamDiameter(0.1, 0.1, Number.NaN, 20)).toThrow(RangeError);
    expect(() => beamDiameter(0.1, 0.1, 0.002, Number.NaN)).toThrow(RangeError);
    expect(() => beamDiameter(0.1, 0.1, 0.002, Number.POSITIVE_INFINITY)).toThrow(
      RangeError,
    );
  });

  /**
   * Codexi leid (sammud 4.1ii ja 4.1mm): lõplikest sisenditest võib tulla
   * lõpmatus, sest korrutis L · s / f voolab üle. Mudel ei tohi tagastada arvu,
   * mille taga ta seista ei saa.
   */
  it("ülevool ei anna vaikset lõpmatust", () => {
    expect(() => beamDiameter(0.1, 1e-300, 1e300, 20)).toThrow(RangeError);
  });
});

describe("focalSpotDiameter – kauge allika plekk fookuses", () => {
  it.each([
    [1, SUN_ANGULAR_DEG, 0.00930267],
    [0.1, SUN_ANGULAR_DEG, 0.000930267],
    // Pika fookusega teleskoop: 9,3 cm.
    [10, SUN_ANGULAR_DEG, 0.0930267],
  ])("f = %s m, α = %s° → %s m", (focalM, angleDeg, expected) => {
    // Spetsifikatsiooni tabel annab kuus tüvenumbrit (0,00930267), seega on ka
    // võrdlus kuue tüvenumbri täpsusega – rohkem numbreid oleks mudelist
    // tagurpidi tuletatud, mitte spetsifikatsioonist võetud.
    expect(focalSpotDiameter(focalM, angleDeg)).toBeCloseTo(expected, 7);
  });

  it("α = 0 on lubatud: punktallikas ehk täht annab punkti", () => {
    expect(focalSpotDiameter(1, 0)).toBe(0);
  });

  it("plekk kasvab fookuskaugusega võrdeliselt", () => {
    for (const focalM of [0.1, 0.25, 0.5, 1, 2, 5]) {
      expect(focalSpotDiameter(2 * focalM, SUN_ANGULAR_DEG)).toBeCloseTo(
        2 * focalSpotDiameter(focalM, SUN_ANGULAR_DEG),
        12,
      );
    }
  });

  it("ketas, mis katab pool taevast, ei ole enam kauge allikas", () => {
    expect(() => focalSpotDiameter(1, 180)).toThrow(RangeError);
    expect(() => focalSpotDiameter(1, 200)).toThrow(RangeError);
    expect(() => focalSpotDiameter(1, -1)).toThrow(RangeError);
  });

  it("vigased arvud viskavad vea", () => {
    expect(() => focalSpotDiameter(0, SUN_ANGULAR_DEG)).toThrow(RangeError);
    expect(() => focalSpotDiameter(-1, SUN_ANGULAR_DEG)).toThrow(RangeError);
    expect(() => focalSpotDiameter(1, Number.NaN)).toThrow(RangeError);
    expect(() => focalSpotDiameter(Number.NaN, SUN_ANGULAR_DEG)).toThrow(
      RangeError,
    );
  });

  it("ülevool ei anna vaikset lõpmatust", () => {
    expect(() => focalSpotDiameter(1e308, SUN_ANGULAR_DEG)).toThrow(RangeError);
  });
});

describe("solarConcentration – mitu korda tihedamaks valgus koondub", () => {
  it.each([
    [1, 1, 11555.4],
    // Sama arv väiksel peeglil – sõltub ainult suhtest D / f.
    [0.1, 0.1, 11555.4],
    // Kaks korda pikem fookus – neli korda vähem.
    [1, 2, 2888.85],
    // Piiril: D = 2f. Spetsifikatsiooni tabelis on 46 221,7 – see arv on
    // saadud ümardatud 11 555,4 neljakordistamisest. Täpne arv on 46 221,56 ja
    // mudel annab just selle; õpilase pool seda arvu ei kasuta.
    [1, 0.5, 46221.56],
  ])("D = %s m, f = %s m → %s korda", (mirrorM, focalM, expected) => {
    expect(solarConcentration(mirrorM, focalM)).toBeCloseTo(expected, 1);
  });

  /**
   * Mooduli kõige üllatavam väide ja ainus koht, kus õpilase intuitsioon
   * („suurem peegel koondab tihedamalt") päriselt ümber lükatakse.
   */
  it("koondumistegur sõltub ainult suhtest D / f", () => {
    const base = solarConcentration(1, 1);
    for (const k of [0.01, 0.1, 0.5, 2, 10, 100]) {
      expect(solarConcentration(k * 1, k * 1)).toBeCloseTo(base, 6);
    }
    // Sama ka teise suhtega, et test ei istuks ühel D / f väärtusel.
    const half = solarConcentration(1, 2);
    for (const k of [0.1, 3, 25]) {
      expect(solarConcentration(k * 1, k * 2)).toBeCloseTo(half, 6);
    }
  });

  it("liiga kiire peegel (D > 2f) viskab vea", () => {
    expect(() => solarConcentration(1, 0.4)).toThrow(RangeError);
    // Täpselt piiril veel vastab.
    expect(solarConcentration(1, 0.5)).toBeGreaterThan(0);
  });

  it("vigased arvud viskavad vea", () => {
    expect(() => solarConcentration(0, 1)).toThrow(RangeError);
    expect(() => solarConcentration(1, 0)).toThrow(RangeError);
    expect(() => solarConcentration(-1, 1)).toThrow(RangeError);
    expect(() => solarConcentration(1, Number.NaN)).toThrow(RangeError);
    expect(() => solarConcentration(Number.POSITIVE_INFINITY, 1)).toThrow(
      RangeError,
    );
  });
});

/**
 * Kogu liugurivõre: 21 raadiust × 20 pirni suurust. Kõik seaduspärade testid
 * käivad sama võre peal – nii ei ole ükski väide ühe testirea peal kinni.
 */
const RADII_M = Array.from(
  {
    length:
      (SLIDERS.radiusCm.max - SLIDERS.radiusCm.min) / SLIDERS.radiusCm.step + 1,
  },
  (_unused, index) =>
    metresFromCentimetres(SLIDERS.radiusCm.min + index * SLIDERS.radiusCm.step),
);
const SOURCE_SIZES_M = Array.from(
  {
    length:
      (SLIDERS.sourceSizeMm.max - SLIDERS.sourceSizeMm.min) /
        SLIDERS.sourceSizeMm.step +
      1,
  },
  (_unused, index) =>
    metresFromMillimetres(
      SLIDERS.sourceSizeMm.min + index * SLIDERS.sourceSizeMm.step,
    ),
);
const MIRROR_M = metresFromCentimetres(MIRROR_DIAMETER_CM);

describe("vihk läheb kaugusega ühtlaselt laiemaks", () => {
  it("kahekordne kaugus annab kahekordse LISA, mitte kahekordse laiuse", () => {
    const near = beamDiameter(0.1, 0.1, 0.002, 10);
    const middle = beamDiameter(0.1, 0.1, 0.002, 20);
    const far = beamDiameter(0.1, 0.1, 0.002, 40);
    // Lisa peegli laiusele kahekordistub…
    expect(middle - 0.1).toBeCloseTo(2 * (near - 0.1), 9);
    expect(far - 0.1).toBeCloseTo(2 * (middle - 0.1), 9);
    // …aga laius ise mitte, sest peegli oma läbimõõt on alati sees.
    expect(middle).toBeLessThan(2 * near);
  });
});

describe("väiksem allikas ja pikem fookus = kitsam vihk", () => {
  it("s kasvades kasvab valgusring rangelt monotoonselt", () => {
    for (const radiusM of RADII_M) {
      const focalM = focalLength(radiusM);
      let previous = 0;
      for (const sourceM of SOURCE_SIZES_M) {
        const widthM = beamDiameter(MIRROR_M, focalM, sourceM, WALL_DISTANCE_M);
        expect(widthM).toBeGreaterThan(previous);
        previous = widthM;
      }
    }
  });

  it("f kasvades kahaneb valgusring rangelt monotoonselt", () => {
    for (const sourceM of SOURCE_SIZES_M) {
      let previous = Number.POSITIVE_INFINITY;
      for (const radiusM of RADII_M) {
        const widthM = beamDiameter(
          MIRROR_M,
          focalLength(radiusM),
          sourceM,
          WALL_DISTANCE_M,
        );
        expect(widthM).toBeLessThan(previous);
        previous = widthM;
      }
    }
  });
});

/**
 * Väärarusaam `suurem-peegel-kitsam-kiir` on siin testiga kinni löödud: D on
 * valemis liidetavana, mitte lahtimineku sees.
 */
describe("suurem peegel EI anna kitsamat vihku", () => {
  it("kahekordne peegel annab igas liuguriseisus laiema valgusringi", () => {
    for (const radiusM of RADII_M) {
      const focalM = focalLength(radiusM);
      for (const sourceM of SOURCE_SIZES_M) {
        expect(
          beamDiameter(2 * MIRROR_M, focalM, sourceM, WALL_DISTANCE_M),
        ).toBeGreaterThan(
          beamDiameter(MIRROR_M, focalM, sourceM, WALL_DISTANCE_M),
        );
      }
    }
  });
});

describe("simulatsiooni turvavöönd – kogu liugurivõre annab mõistlikud arvud", () => {
  it("valgusring on positiivne, lõplik ja jääb seina peale (alla 10 m)", () => {
    for (const radiusM of RADII_M) {
      for (const sourceM of SOURCE_SIZES_M) {
        const widthM = beamDiameter(
          MIRROR_M,
          focalLength(radiusM),
          sourceM,
          WALL_DISTANCE_M,
        );
        expect(Number.isFinite(widthM)).toBe(true);
        expect(widthM).toBeGreaterThan(0);
        expect(widthM).toBeLessThan(10);
      }
    }
  });

  it("kõige kitsam ring on 0,17 m ja kõige laiem 4,1 m", () => {
    let smallest = Number.POSITIVE_INFINITY;
    let largest = 0;
    for (const radiusM of RADII_M) {
      for (const sourceM of SOURCE_SIZES_M) {
        const widthM = beamDiameter(
          MIRROR_M,
          focalLength(radiusM),
          sourceM,
          WALL_DISTANCE_M,
        );
        smallest = Math.min(smallest, widthM);
        largest = Math.max(largest, widthM);
      }
    }
    // R = 60 cm ja s = 1 mm ning R = 20 cm ja s = 20 mm.
    expect(smallest).toBeCloseTo(0.166667, 6);
    expect(largest).toBeCloseTo(4.1, 9);
  });

  /**
   * Idealiseering 1: kerapinna lähendus kehtib, kui peegli läbimõõt jääb
   * fookuskaugusest väiksemaks või sellega võrdseks. Just see määrab liuguri
   * alumise piiri, mitte ilutunne – kui keegi seda hiljem langetab, kukub
   * mudeli oma eeldus ära ja see test ütleb seda.
   */
  it("peegli läbimõõt jääb kogu võres fookuskaugusest väiksemaks (D ≤ f)", () => {
    for (const radiusM of RADII_M) {
      expect(MIRROR_M).toBeLessThanOrEqual(focalLength(radiusM));
    }
  });

  it("liugurite algväärtused on võre peal – õpilane saab alguskoha tagasi", () => {
    expect((20 - SLIDERS.radiusCm.min) % SLIDERS.radiusCm.step).toBe(0);
    expect((2 - SLIDERS.sourceSizeMm.min) % SLIDERS.sourceSizeMm.step).toBe(0);
  });
});

/**
 * Ristkontroll mooduliga `noguspeegel`: kaks eraldi kirjutatud rida peavad
 * andma sama arvu (spetsifikatsioon „Miks EI ole see mooduli `noguspeegel`
 * mudeli taaskasutus"). See on AINUS koht, kus selle mooduli testid teist
 * moodulit puudutavad – ja see on testis, mitte rakenduse koodis.
 */
describe("ristkontroll mooduliga noguspeegel (ainult testis)", () => {
  it("focalLength annab sama arvu mõlemas moodulis", () => {
    for (const radiusM of [...RADII_M, 1, 2.5, 10]) {
      expect(focalLength(radiusM)).toBeCloseTo(concaveFocalLength(radiusM), 12);
    }
  });

  it("mõlemas viskab null raadius vea", () => {
    expect(() => focalLength(0)).toThrow(RangeError);
    expect(() => concaveFocalLength(0)).toThrow(RangeError);
  });
});

/**
 * Need on arvud, mida moodul õpilaselt päriselt küsib (explore 1–4, practice
 * 1–3 ja exit-2). Kui mudel ja spetsifikatsioon lähevad lahku, peab see
 * selguma siin – mitte tunnis. Ülesanded ise tulevad hilisemas sammus.
 */
describe("õpilase arvud tulevad mudelist", () => {
  const startFocalM = focalLength(metresFromCentimetres(20));
  const flatFocalM = focalLength(metresFromCentimetres(60));

  it("explore-1: algseis R = 20 cm, s = 2 mm → 0,5 m", () => {
    expect(
      beamDiameter(
        MIRROR_M,
        startFocalM,
        metresFromMillimetres(2),
        WALL_DISTANCE_M,
      ),
    ).toBeCloseTo(0.5, 9);
  });

  it("explore-2: 10 mm hõõgniit → 2,1 m ehk umbes 4 korda laiem", () => {
    const wideM = beamDiameter(
      MIRROR_M,
      startFocalM,
      metresFromMillimetres(10),
      WALL_DISTANCE_M,
    );
    expect(wideM).toBeCloseTo(2.1, 9);
    expect(wideM / 0.5).toBeCloseTo(4.2, 1);
  });

  it("explore-3: R = 60 cm juures kahaneb ring 0,5 m pealt 0,23 m peale", () => {
    const narrowM = beamDiameter(
      MIRROR_M,
      flatFocalM,
      metresFromMillimetres(2),
      WALL_DISTANCE_M,
    );
    expect(narrowM).toBeCloseTo(0.233333, 6);
    // Ekraanil kahe kohaga: 0,23 m. Lugemistolerants 0,2 m katab.
    expect(Math.abs(narrowM - 0.23)).toBeLessThan(0.2);
  });

  it("explore-4: parim seis annab 0,17 m ehk 3 korda kitsama ringi", () => {
    const bestM = beamDiameter(
      MIRROR_M,
      flatFocalM,
      metresFromMillimetres(1),
      WALL_DISTANCE_M,
    );
    expect(bestM).toBeCloseTo(0.166667, 6);
    // Vastus 3, tolerants 1 – õpilane jagab ekraanilt loetud arvud.
    expect(Math.abs(0.5 / bestM - 3)).toBeLessThan(1);
    // Isegi parim seis on laiem kui peegel ise – päriselt paralleelset kiirt
    // ei ole olemas.
    expect(bestM).toBeGreaterThan(MIRROR_M);
  });

  it("practice-1: päikeseahi D = 1 m, f = 1 m → 9,3 mm plekk ja ≈ 11 500 korda", () => {
    const spotMm = millimetresFromMetres(
      focalSpotDiameter(1, SUN_ANGULAR_DEG),
    );
    expect(spotMm).toBeCloseTo(9.30267, 5);
    // Ekraanil ja tekstis 9,3 mm; lugemistolerants 0,5 mm katab.
    expect(Math.abs(spotMm - 9.3)).toBeLessThan(0.5);
    expect(solarConcentration(1, 1)).toBeCloseTo(11555.4, 1);
    // Tekstis „umbes 11 500 korda" – tolerants 200 katab.
    expect(Math.abs(solarConcentration(1, 1) - 11500)).toBeLessThan(200);
  });

  it("practice-2: kaks korda pikem fookus → plekk 18,6 mm ja tihedus 2889", () => {
    expect(
      millimetresFromMetres(focalSpotDiameter(2, SUN_ANGULAR_DEG)),
    ).toBeCloseTo(18.60534, 5);
    expect(solarConcentration(1, 2)).toBeCloseTo(2888.85, 2);
    expect(Math.abs(solarConcentration(1, 2) - 2889)).toBeLessThan(200);
  });

  it("practice-3: suur ja väike päikeseahi koondavad täpselt sama tihedaks", () => {
    expect(solarConcentration(1, 1)).toBeCloseTo(solarConcentration(0.1, 0.1), 9);
  });

  it("exit-2: f = 50 cm annab 4,7 mm, kaks korda pikem fookus 9,3 mm", () => {
    const shortMm = millimetresFromMetres(
      focalSpotDiameter(0.5, SUN_ANGULAR_DEG),
    );
    const longMm = millimetresFromMetres(focalSpotDiameter(1, SUN_ANGULAR_DEG));
    expect(shortMm).toBeCloseTo(4.65134, 5);
    expect(Math.abs(shortMm - 4.7)).toBeLessThan(0.5);
    expect(longMm).toBeCloseTo(2 * shortMm, 9);
    expect(Math.abs(longMm - 9.3)).toBeLessThan(0.5);
  });

  /**
   * Spetsifikatsiooni hoiatus: lahtimineku suhe ja laiuse suhe on kaks eri
   * arvu, sest peegli oma läbimõõt on laiuses alati sees. Kui need kaks
   * kunagi kõrvuti satuvad, tuleb õpilasele kaks eri vastust.
   */
  it("lahtimineku suhe ja laiuse suhe on kaks eri arvu", () => {
    const smallM = metresFromMillimetres(2);
    const bigM = metresFromMillimetres(10);
    const spreadRatio = bigM / smallM;
    const widthRatio =
      beamDiameter(MIRROR_M, startFocalM, bigM, WALL_DISTANCE_M) /
      beamDiameter(MIRROR_M, startFocalM, smallM, WALL_DISTANCE_M);
    expect(spreadRatio).toBeCloseTo(5, 9);
    expect(widthRatio).toBeCloseTo(4.2, 9);
    expect(spreadRatio - widthRatio).toBeGreaterThan(0.5);
  });
});

describe("ühikuteisendused – ainsad neli kohta, kus ühik muutub", () => {
  it.each([
    [20, 0.2],
    [60, 0.6],
    [10, 0.1],
    [0, 0],
  ])("%s cm → %s m", (lengthCm, expected) => {
    expect(metresFromCentimetres(lengthCm)).toBeCloseTo(expected, 9);
  });

  it.each([
    [0.1, 10],
    [0.2, 20],
  ])("%s m → %s cm", (lengthM, expected) => {
    expect(centimetresFromMetres(lengthM)).toBeCloseTo(expected, 9);
  });

  it.each([
    [2, 0.002],
    [10, 0.01],
    [1, 0.001],
    [0, 0],
  ])("%s mm → %s m", (lengthMm, expected) => {
    expect(metresFromMillimetres(lengthMm)).toBeCloseTo(expected, 12);
  });

  it("valgusplekk jõuab ekraanile millimeetrites", () => {
    expect(
      millimetresFromMetres(focalSpotDiameter(1, SUN_ANGULAR_DEG)),
    ).toBeCloseTo(9.30267, 5);
  });

  it("teisendus edasi-tagasi annab sama arvu", () => {
    for (const lengthCm of [0, 10, 20, 40, 60]) {
      expect(centimetresFromMetres(metresFromCentimetres(lengthCm))).toBeCloseTo(
        lengthCm,
        9,
      );
    }
    for (const lengthMm of [0, 1, 2, 10, 20]) {
      expect(millimetresFromMetres(metresFromMillimetres(lengthMm))).toBeCloseTo(
        lengthMm,
        9,
      );
    }
  });

  it("vigane sisend viskab vea", () => {
    expect(() => metresFromCentimetres(Number.NaN)).toThrow(RangeError);
    expect(() => centimetresFromMetres(Number.POSITIVE_INFINITY)).toThrow(
      RangeError,
    );
    expect(() => metresFromMillimetres(Number.NaN)).toThrow(RangeError);
    expect(() => millimetresFromMetres(Number.NEGATIVE_INFINITY)).toThrow(
      RangeError,
    );
  });

  it("lõplikust sisendist ei tohi tulla lõpmatust", () => {
    expect(() => centimetresFromMetres(1e308)).toThrow(RangeError);
    expect(() => millimetresFromMetres(1e308)).toThrow(RangeError);
    expect(() => millimetresFromMetres(-1e308)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// Mooduli sisu: manifest, sammud, õpetajajuhend (samm 4.1xx)
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
    // `valgusvihk` kuulub moodulile valguse-sirgjooneline-levimine, `fookus` ja
    // `nõguspeegel` moodulile noguspeegel. Katvusraport võrdleb mõisteid NIME
    // järgi (normalizeConcept: trim + väiketähed), seega on „paralleelne
    // valgusvihk" tema jaoks TEINE nimi ja läheb õigesti märkuseks.
    expect(manifest.concepts).toEqual([
      "paralleelne valgusvihk",
      "valguse koondamine",
    ]);
    for (const concept of manifest.concepts) {
      for (const owned of ["valgusvihk", "fookus", "nõguspeegel", "kumerpeegel"]) {
        expect(concept.toLowerCase(), owned).not.toBe(owned);
      }
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

  it("spetsifikatsiooni kaks joonist on õigetes kohtades", () => {
    // Sildid peavad klappima registriga (moduleFigures) – seda valvab
    // tests/registry.test.ts alles siis, kui moodul on registris.
    const figures: (string | undefined)[] = [];
    for (const step of activities.steps) {
      if (step.type === "hook" || step.type === "theory") figures.push(step.figure);
      for (const question of stepQuestions(step)) {
        if (question.figure) figures.push(question.figure);
      }
    }
    expect(figures).toEqual(["nr-kolm-seadet", "nr-kaks-suunda"]);
  });

  it("õpilase pool ei ületa mooduli piire: kujutist siin ei konstrueerita", () => {
    // sisu/MOODUL-noguspeegli-rakendused.md „Piirid": kujutise konstrueerimine
    // ja suurenduse arvutamine on gümnaasium ning P2 läätsede teema.
    // Meigipeegel ja hambaarsti peegel tohivad moodulis olla ainult
    // ülekandeülesandes ühe sõnaga.
    // Väiketäheks enne kontrolli: lause alguses olev „Kujutis" lipsaks muidu
    // läbi (CodeRabbiti leid, samm 4.1xx).
    const all = studentTexts().join(" ").toLowerCase();
    expect(all).not.toContain("kujutis");
    expect(all).not.toContain("suurendus");
  });

  it("ükski ülesanne ei nõua nurga arvutamist", () => {
    // Valgusplekk tuleb tangensist, mida 8. klassis ei ole (spetsifikatsiooni
    // „Piirid"). Arvud tulevad ekraanilt; õpilase enda tehted on ainult
    // jagamine, korrutamine ja ruutuvõtmine, seega ei ole ükski arvküsimus
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
 * `activities.ts` võtab iga laiuse, plekki ja koondumisteguri MUDELIST
 * (CLAUDE.md reegel 1), seega näpuviga arvutuses siin välja ei paistaks – küll
 * aga paistab välja vale liuguriseis, vale ühik või vale tolerants. Seepärast on
 * ootus kirjutatud SPETSIFIKATSIOONI järgi
 * (sisu/MOODUL-noguspeegli-rakendused.md „Sammud" ja testiväärtuste tabel).
 */
describe("ülesannete vastused käivad spetsifikatsiooniga kokku", () => {
  it("explore-1: algseisus on valgusring täpselt 0,5 m", () => {
    const question = numericQuestion("explore-1");
    expect(question.answer).toBeCloseTo(0.5, 9);
    expect(question.unit).toBe("m");
  });

  it("explore-2: hõõgniit annab sama peegliga 2,1 m", () => {
    const question = numericQuestion("explore-2");
    expect(question.answer).toBeCloseTo(2.1, 9);
    expect(question.unit).toBe("m");
  });

  it("explore-4: parim seis on 3 korda kitsam ja vastus on ühikuta", () => {
    const question = numericQuestion("explore-4");
    expect(question.answer).toBeCloseTo(3, 9);
    expect(question.unit).toBeUndefined();
  });

  it("practice-1: kaks korda pikem fookus annab 2889-kordse koondumise", () => {
    const question = numericQuestion("practice-1");
    expect(question.answer).toBeCloseTo(2888.85, 2);
    expect(question.unit).toBeUndefined();
  });

  it("exit-2: kaks korda pikem fookus annab 9,3 mm plekki", () => {
    const question = numericQuestion("exit-2");
    expect(question.answer).toBeCloseTo(9.30267, 5);
    expect(question.unit).toBe("mm");
  });

  it("tolerantsid on spetsifikatsiooni omad", () => {
    for (const id of ["explore-1", "explore-2"]) {
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
      value: 200,
    });
    expect(numericQuestion("exit-2").tolerance).toEqual({
      mode: "absolute",
      value: 0.5,
    });
  });

  it("lugemistolerants lubab ekraanilt loetud arvu, aga ei sega kaht pirni", () => {
    // Ekraanil on laiused kahe kohaga peale koma. LED-i ja hõõgniidi arvud
    // peavad jääma teineteisest kaugele: vale liuguriseisu lugemine on just see
    // viga, mida explore-2 püüab.
    const led = numericQuestion("explore-1");
    expect(checkNumericAnswer(led, "0,50").correct).toBe(true);
    expect(checkNumericAnswer(led, "0,6").correct).toBe(true);
    expect(checkNumericAnswer(led, "2,10").correct).toBe(false);
    const filament = numericQuestion("explore-2");
    expect(checkNumericAnswer(filament, "2,1").correct).toBe(true);
    expect(checkNumericAnswer(filament, "0,50").correct).toBe(false);
  });

  it("sentimeetrites kirjutatud vastus loetakse samuti õigeks", () => {
    // Checker teisendab ühikuperekonna sees (src/checker/number.ts) – õpilast ei
    // tohi lukku jätta sellepärast, et ta kirjutas 50 cm.
    expect(checkNumericAnswer(numericQuestion("explore-1"), "50 cm").correct).toBe(
      true,
    );
  });

  it("explore-4 tolerants ei luba LAHTIMINEKUTE suhet vastuseks", () => {
    // Spetsifikatsiooni hoiatus: lahtimineku suhe ja laiuse suhe on kaks eri
    // arvu, sest peegli enda läbimõõt on laiuses alati sees. Selle ülesande
    // seisus on laiuste suhe 3 ja lahtiminekute suhe 6. Kui tolerants laieneks,
    // muutuks vale tehe vaikselt õigeks.
    const start = beamDiameter(0.1, 0.1, 0.002, WALL_DISTANCE_M);
    const best = beamDiameter(0.1, 0.3, 0.001, WALL_DISTANCE_M);
    expect((start - 0.1) / (best - 0.1)).toBeCloseTo(6, 9);
    const question = numericQuestion("explore-4");
    expect(checkNumericAnswer(question, "3").correct).toBe(true);
    expect(checkNumericAnswer(question, "6").correct).toBe(false);
  });

  it("exit-2 tolerants ei luba lühema fookuse plekki vastuseks", () => {
    // Ülesande sisendiks antud arv (4,7 mm) on lähim vale vastus: kes valemi
    // asemel etteantud arvu kordab, ei tohi õiget saada.
    const question = numericQuestion("exit-2");
    expect(checkNumericAnswer(question, "9,3").correct).toBe(true);
    expect(checkNumericAnswer(question, "4,7").correct).toBe(false);
  });

  it("predict-1 õige vastus on LED ja mõlemad valed on nimetatud", () => {
    const question = choiceQuestion("predict-1");
    expect(
      question.options.filter((option) => option.correct).map((option) => option.id),
    ).toEqual(["led"]);
    const wrong = question.options.filter((option) => !option.correct);
    expect(wrong.map((option) => option.misconception)).toEqual([
      "suurem-allikas-kitsam-kiir",
      "peegel-maarab-koik",
    ]);
  });

  it("explore-3 ütleb raadiuse mõlemad seisud välja ja kannab mudeli arve", () => {
    // Ülesanne palub liugurit liigutada, seega peab tekstis olema, kust kuhu.
    // Õige variandi kaks arvu tulevad mudelist ja on samad, mis ekraanil.
    const question = choiceQuestion("explore-3");
    expect(question.prompt).toContain("20 cm");
    expect(question.prompt).toContain("60 cm");
    const correct = question.options.filter((option) => option.correct);
    expect(correct.map((option) => option.id)).toEqual(["kitsamaks"]);
    expect(correct[0].text).toContain("0,50 m");
    expect(correct[0].text).toContain("0,23 m");
  });

  it("practice-2 lükkab ümber mooduli kõige üllatavama väärarusaama", () => {
    const question = choiceQuestion("practice-2");
    expect(question.options.filter((option) => option.correct)[0].id).toBe(
      "kummaski-mitte",
    );
    const wrong = question.options.filter((option) => !option.correct);
    expect(wrong.map((option) => option.misconception).sort()).toEqual([
      "suurem-peegel-koondab-tihedamalt",
      "vaiksem-plekk-tihedam",
    ]);
    // Mõlema ahju koondumistegur on mudelis TÄPSELT sama – see on kogu
    // ülesande sisu ja seda valvab ka mudeli invariandi test.
    expect(solarConcentration(0.1, 0.1)).toBeCloseTo(solarConcentration(1, 1), 9);
  });

  it("practice-4 ülekandeülesandel on kolm õiget kohta", () => {
    const question = choiceQuestion("practice-4");
    expect(question.multiple).toBe(true);
    expect(question.options.filter((option) => option.correct)).toHaveLength(3);
    // Mõlemad valed on kumerpeegli tööd – just seda väärarusaama moodul püüab.
    const wrong = question.options.filter((option) => !option.correct);
    expect(wrong.map((option) => option.misconception)).toEqual([
      "nogus-annab-laia-vaate",
      "nogus-annab-laia-vaate",
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

  it("spetsifikatsiooni kümme väärarusaama on kõik olemas", () => {
    for (const id of [
      "suurem-allikas-kitsam-kiir",
      "peegel-maarab-koik",
      "lamedam-peegel-laiem-kiir",
      "suurem-peegel-kitsam-kiir",
      "suurem-peegel-koondab-tihedamalt",
      "vaiksem-plekk-tihedam",
      "paike-on-punkt",
      "nogus-annab-laia-vaate",
      "valgus-vasib",
      "peegel-teeb-valgust-juurde",
    ]) {
      expect(known, id).toContain(id);
    }
  });

  it("ohutus ütleb süttimisohu välja ja nõuab kustutusvahendit", () => {
    // Siin on ohutus TEISTPIDI kui kumerpeeglil: nõguspeegel KOONDAB ja
    // koondatud päikesevalgus süütab paberi. Kolm asja peavad olema kirjas:
    // mis juhtub, mis peab kõrval olema ja mis saab peeglist pärast katset.
    expect(teacher.safety).toContain("koondab");
    expect(teacher.safety).toContain("süütab");
    expect(teacher.safety).toContain("vett või liiva");
  });

  it("õpetaja saab teada, miks päris peegel on parabool", () => {
    // model.ts idealiseering 1 – UI ei tohi seda päris füüsikana esitada.
    expect(teacher.parabolaNote).toContain("parabool");
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
