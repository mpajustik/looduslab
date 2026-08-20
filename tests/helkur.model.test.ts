import { describe, expect, it } from "vitest";
import { deviationDeg as cornerDeviationDeg } from "../src/modules/physics/nurkpeegel/model";
import {
  SLIDERS,
  angleFromOffsetDeg,
  offsetAtDistanceM,
  retroreflectionGain,
  returnDeviationDeg,
} from "../src/modules/physics/helkur/model";

/**
 * Helkuri mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist (sisu/MOODUL-helkur.md „Füüsika
 * (model.ts jaoks)" → testiväärtuste tabel ning piirjuhud ja invariandid),
 * mitte mudelist tagurpidi tuletatud – muidu testiks test iseennast.
 *
 * Nurgad on kraadides, pikkused meetrites. Simulatsiooni algseis on ω = 0,5°
 * ja L = 100 m; osa ridu kasutab meelega teisi väärtusi (ω = 90° matt pind,
 * θ = 85° lubatud vahemiku ots), sest mudel peab vastama õigesti ka
 * väljaspool liuguri vahemikku ja just seal on piirid.
 */

/** Kogu hajuvusnurga liuguri võre: 0,1…2,0° sammuga 0,1°. */
const SPREAD_GRID: number[] = [];
for (
  let step = Math.round(SLIDERS.spreadDeg.min * 10);
  step <= Math.round(SLIDERS.spreadDeg.max * 10);
  step += Math.round(SLIDERS.spreadDeg.step * 10)
) {
  SPREAD_GRID.push(step / 10);
}

/** Kogu kauguse liuguri võre: 10…150 m sammuga 10 m. */
const DISTANCE_GRID: number[] = [];
for (
  let distanceM = SLIDERS.distanceM.min;
  distanceM <= SLIDERS.distanceM.max;
  distanceM += SLIDERS.distanceM.step
) {
  DISTANCE_GRID.push(distanceM);
}

describe("returnDeviationDeg – vale nurk peeglites kahekordistub", () => {
  it.each([
    // Täpne helkur – kiir läheb täpselt tagasi.
    [90, 0],
    // Pool kraadi peeglites → kraad valgusele.
    [90.5, 1],
    // Vale suund annab sama tulemuse.
    [89.5, 1],
    [91, 2],
    // Lubatud vahemiku otsad.
    [85, 10],
    [95, 10],
  ])("θ = %s° → kõrvalekalle %s°", (mirrorAngleDeg, expected) => {
    expect(returnDeviationDeg(mirrorAngleDeg)).toBeCloseTo(expected, 12);
  });

  /**
   * Kogu mooduli lähtekoht: ideaalne helkur on täpselt täpne, mitte „peaaegu".
   */
  it("täisnurk annab täpselt nulli", () => {
    expect(returnDeviationDeg(90)).toBe(0);
  });

  /**
   * Sümmeetria on eraldi väide, sest õpilase intuitsioon ütleb, et „liiga
   * terav" ja „liiga nüri" nurk on eri asjad. Mudeli jaoks on nad sama.
   */
  it.each([0, 0.1, 0.25, 0.5, 1, 2, 3.5, 5])(
    "ε = %s° annab mõlemale poole sama kõrvalekalde 2ε",
    (epsilonDeg) => {
      expect(returnDeviationDeg(90 + epsilonDeg)).toBeCloseTo(
        2 * epsilonDeg,
        12,
      );
      expect(returnDeviationDeg(90 - epsilonDeg)).toBeCloseTo(
        2 * epsilonDeg,
        12,
      );
      expect(returnDeviationDeg(90 + epsilonDeg)).toBe(
        returnDeviationDeg(90 - epsilonDeg),
      );
    },
  );

  it("väljaspool vahemikku 85…95° ei ole see enam helkur", () => {
    expect(() => returnDeviationDeg(80)).toThrow(RangeError);
    expect(() => returnDeviationDeg(84.9)).toThrow(RangeError);
    expect(() => returnDeviationDeg(95.1)).toThrow(RangeError);
    expect(() => returnDeviationDeg(60)).toThrow(RangeError);
    expect(() => returnDeviationDeg(Number.NaN)).toThrow(RangeError);
    expect(() => returnDeviationDeg(Number.POSITIVE_INFINITY)).toThrow(
      RangeError,
    );
  });

  /**
   * Ristkontroll mooduliga `nurkpeegel` – ainus koht, kus selle mooduli testid
   * teist moodulit puudutavad. Rakenduse kood EI impordi `nurkpeegel`-i
   * mudelit (vt model.ts päist); seda, et kordus jääb õigeks, valvab see test.
   */
  it("annab sama, mis |nurkpeegel.deviationDeg(θ) − 180|", () => {
    for (let mirrorAngleDeg = 85; mirrorAngleDeg <= 90; mirrorAngleDeg += 0.5) {
      expect(returnDeviationDeg(mirrorAngleDeg)).toBeCloseTo(
        Math.abs(cornerDeviationDeg(mirrorAngleDeg) - 180),
        12,
      );
    }
  });
});

describe("offsetAtDistanceM – nurk annab kauguse peal meetrid", () => {
  it.each([
    // Kraadi viga 100 m peal – üle poole auto laiusest.
    [1, 100, 1.7455065],
    [2, 100, 3.4920769],
    // Pool kaugust, pool kõrvalekallet.
    [1, 50, 0.87275325],
    // Sama funktsioon annab hajuvuskoonuse RAADIUSE.
    [0.5, 100, 0.87268678],
    // Kõige kitsam liuguri seis: plekk 0,35 m.
    [0.1, 100, 0.17453310],
  ])("α = %s°, L = %s m → %s m", (deviation, distanceM, expected) => {
    expect(offsetAtDistanceM(deviation, distanceM)).toBeCloseTo(expected, 7);
  });

  it("täpne helkur ei möödu millestki", () => {
    for (const distanceM of DISTANCE_GRID) {
      expect(offsetAtDistanceM(0, distanceM)).toBe(0);
    }
  });

  /**
   * L = 0 on siin TAHTLIKULT lubatud – auto juures ei ole veel kõrvale mindud.
   * Naaberfunktsioonis `angleFromOffsetDeg` viskab sama arv vea.
   */
  it("nullkaugusel ei ole veel kõrvale mindud", () => {
    expect(offsetAtDistanceM(1, 0)).toBe(0);
  });

  it("kõrvalekalle on kaugusega võrdeline", () => {
    for (const deviation of [0.5, 1, 2]) {
      for (const distanceM of [10, 50, 100]) {
        expect(offsetAtDistanceM(deviation, 2 * distanceM)).toBeCloseTo(
          2 * offsetAtDistanceM(deviation, distanceM),
          12,
        );
      }
    }
  });

  it("vigased sisendid viskavad vea", () => {
    // tan 90° ei ole olemas.
    expect(() => offsetAtDistanceM(90, 10)).toThrow(RangeError);
    expect(() => offsetAtDistanceM(120, 10)).toThrow(RangeError);
    expect(() => offsetAtDistanceM(-1, 10)).toThrow(RangeError);
    expect(() => offsetAtDistanceM(1, -10)).toThrow(RangeError);
    expect(() => offsetAtDistanceM(Number.NaN, 10)).toThrow(RangeError);
    expect(() => offsetAtDistanceM(1, Number.POSITIVE_INFINITY)).toThrow(
      RangeError,
    );
  });
});

describe("angleFromOffsetDeg – kui suure nurga alt kaks asja paistavad", () => {
  it.each([
    // Juhi silmad on esituledest 0,5 m kõrval.
    [0.5, 100, 0.28647651],
    [0.5, 50, 0.5729387],
    // Lähedal on sama 0,5 m suurem nurk.
    [0.5, 20, 1.4320962],
    [0.5, 150, 0.19098522],
  ])("h = %s m, L = %s m → %s°", (offsetM, distanceM, expected) => {
    expect(angleFromOffsetDeg(offsetM, distanceM)).toBeCloseTo(expected, 7);
  });

  it("silm täpselt tule kohal annab nurga 0", () => {
    expect(angleFromOffsetDeg(0, 100)).toBe(0);
  });

  it("nullkaugusel ei ole nurka", () => {
    expect(() => angleFromOffsetDeg(0.5, 0)).toThrow(RangeError);
    expect(() => angleFromOffsetDeg(0.5, -100)).toThrow(RangeError);
    expect(() => angleFromOffsetDeg(-0.5, 100)).toThrow(RangeError);
    expect(() => angleFromOffsetDeg(Number.NaN, 100)).toThrow(RangeError);
    expect(() => angleFromOffsetDeg(0.5, Number.NaN)).toThrow(RangeError);
  });

  /**
   * Ainus koht, kus mudeli kaks poolt teineteist ristkontrollivad – ilma
   * selleta võiks üks neist vaikselt kraadid ja radiaanid segi ajada ja ükski
   * üksikväärtuse test seda ei näitaks.
   */
  it("on funktsiooni offsetAtDistanceM pöördfunktsioon", () => {
    for (const offsetM of [0, 0.5, 1.7, 3.5]) {
      for (const distanceM of DISTANCE_GRID) {
        expect(
          offsetAtDistanceM(angleFromOffsetDeg(offsetM, distanceM), distanceM),
        ).toBeCloseTo(offsetM, 9);
      }
    }
  });

  it("kehtib ka teistpidi: nurgast meetriteks ja tagasi", () => {
    for (const deviation of [0, 0.1, 0.5, 1, 2, 10]) {
      for (const distanceM of DISTANCE_GRID) {
        expect(
          angleFromOffsetDeg(offsetAtDistanceM(deviation, distanceM), distanceM),
        ).toBeCloseTo(deviation, 9);
      }
    }
  });
});

describe("retroreflectionGain – mitu korda tihedamalt valgus tagasi tuleb", () => {
  it.each([
    // Simulatsiooni algseis.
    [0.5, 26262.617],
    [0.4, 41035.246],
    // Kaks korda kitsam kui 0,5° – neli korda suurem.
    [0.25, 105049.97],
    [1, 6565.7794],
    // Kõige laiem liuguri seis.
    [2, 1641.5699],
  ])("ω = %s° → %s korda", (spreadDeg, expected) => {
    expect(retroreflectionGain(spreadDeg)).toBeCloseTo(expected, 2);
  });

  /**
   * Mudeli mõistlikkuse ankur: matt pind ise. Väiksem arv kui 1 tähendaks
   * „halvem kui valge lapp" ja on võimatu.
   */
  it("ω = 90° annab täpselt 1 ehk matt pinna", () => {
    expect(retroreflectionGain(90)).toBeCloseTo(1, 12);
  });

  it("on kogu liuguri võres rangelt kahanev ja alati vähemalt 1", () => {
    let previousGain = Number.POSITIVE_INFINITY;
    for (const spreadDeg of SPREAD_GRID) {
      const gain = retroreflectionGain(spreadDeg);
      expect(gain, `ω = ${spreadDeg}°`).toBeLessThan(previousGain);
      expect(gain, `ω = ${spreadDeg}°`).toBeGreaterThanOrEqual(1);
      previousGain = gain;
    }
  });

  /**
   * Väikeste nurkade juures on 1 − cos ω ≈ ω²/2. See on practice-2 vastuse
   * alus ja peab olema mudelis kinni, mitte ainult tekstis.
   */
  it.each([0.5, 1, 2])(
    "poole kitsam koonus (ω = %s°) annab neli korda suurema võimenduse",
    (spreadDeg) => {
      const ratio =
        retroreflectionGain(spreadDeg / 2) / retroreflectionGain(spreadDeg);
      expect(ratio).toBeGreaterThan(3.96);
      expect(ratio).toBeLessThan(4.04);
    },
  );

  /**
   * Väga väikese nurga juures on `cos ω` topelttäpsuses juba täpselt 1 ja
   * lahutamine `1 − cos ω` kaotaks kogu info: vastus tuleks kõigepealt vaikselt
   * vale (ω = 1e-6° juures 37 % viga) ja siis lõpmatus, kuigi võimendus mahub
   * arvu sisse suurepäraselt. Mudel kasutab seepärast samaväärset, aga
   * numbriliselt stabiilset kuju 1 / (2·sin²(ω/2)).
   *
   * Liuguri vahemikus (0,1…2°) vahet ei ole – see test valvab lepingut
   * `0 < ω ≤ 90`, mitte simulatsiooni (CodeRabbiti ja Codexi ühine leid, samm
   * 4.1fff).
   */
  it.each([
    [1e-4, 656561270002.5],
    [1e-6, 6565612700023489],
    [1e-7, 656561270002348800],
  ])("väga kitsas koonus ω = %s° annab lõpliku vastuse", (spreadDeg, expected) => {
    const gain = retroreflectionGain(spreadDeg);
    expect(Number.isFinite(gain)).toBe(true);
    expect(gain / expected).toBeCloseTo(1, 6);
  });

  it("ideaalne helkur ja võimatud nurgad viskavad vea", () => {
    // Lõpmatu võimendus – mudel ei vasta küsimusele, mille peale tema sõnastus
    // enam ei kehti.
    expect(() => retroreflectionGain(0)).toThrow(RangeError);
    expect(() => retroreflectionGain(-0.5)).toThrow(RangeError);
    expect(() => retroreflectionGain(90.1)).toThrow(RangeError);
    expect(() => retroreflectionGain(Number.NaN)).toThrow(RangeError);
    expect(() => retroreflectionGain(Number.POSITIVE_INFINITY)).toThrow(
      RangeError,
    );
  });
});

describe("simulatsiooni turvavöönd", () => {
  /**
   * Nii ei saa keegi hiljem liuguri piire muutes vaikselt ekraanile tuua arvu,
   * mida joonis enam ei kanna.
   */
  it("kogu liugurivõres jääb valgusplekk maantee joonisele", () => {
    for (const spreadDeg of SPREAD_GRID) {
      for (const distanceM of DISTANCE_GRID) {
        const diameterM = 2 * offsetAtDistanceM(spreadDeg, distanceM);
        expect(
          Number.isFinite(diameterM),
          `ω = ${spreadDeg}°, L = ${distanceM} m`,
        ).toBe(true);
        expect(
          diameterM,
          `ω = ${spreadDeg}°, L = ${distanceM} m`,
        ).toBeGreaterThanOrEqual(0.03);
        expect(
          diameterM,
          `ω = ${spreadDeg}°, L = ${distanceM} m`,
        ).toBeLessThanOrEqual(11);
      }
    }
  });

  it("kogu liugurivõres jääb võimendus loetavasse vahemikku", () => {
    for (const spreadDeg of SPREAD_GRID) {
      const gain = retroreflectionGain(spreadDeg);
      expect(gain, `ω = ${spreadDeg}°`).toBeGreaterThanOrEqual(1600);
      expect(gain, `ω = ${spreadDeg}°`).toBeLessThanOrEqual(660000);
    }
  });

  /**
   * Mooduli teine pool arvudes: algseisus (ω = 0,5°, L = 100 m) peab koonus
   * ulatuma esituledest juhi silmadeni, kõige kitsamas seisus (ω = 0,1°) aga
   * mitte. Just selle vahe peal seisab explore-2.
   */
  it("algseis jõuab juhi silmadeni, kõige täpsem helkur ei jõua", () => {
    // Juhi silmad on esituledest 0,5 m kõrval (sõiduauto mõõt – tuleb
    // activities.ts-ist ja Simulation.tsx-ist, mitte mudeli konstandist).
    const eyeOffsetM = 0.5;
    expect(offsetAtDistanceM(0.5, 100)).toBeGreaterThan(eyeOffsetM);
    expect(offsetAtDistanceM(SLIDERS.spreadDeg.min, 100)).toBeLessThan(
      eyeOffsetM,
    );
    // Sama asi nurkade keeles: koonuse pool-avanurk vs silmade nurk.
    expect(angleFromOffsetDeg(eyeOffsetM, 100)).toBeLessThan(0.5);
    expect(angleFromOffsetDeg(eyeOffsetM, 100)).toBeGreaterThan(
      SLIDERS.spreadDeg.min,
    );
  });
});
