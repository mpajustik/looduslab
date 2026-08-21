import { describe, expect, it } from "vitest";
import {
  MOON_MEAN_KM as VARJUTUSED_MOON_MEAN_KM,
  lunarUmbraWidthKm,
} from "../src/modules/physics/varjutused/model";
import {
  EARTH_UMBRA_WIDTH_AT_MOON_KM,
  EARTH_YEAR_DAYS,
  MOON_MEAN_KM,
  SIDEREAL_MONTH_DAYS,
  SLIDERS,
  SYNODIC_MONTH_DAYS,
  dayFromPhaseAngle,
  earthShadowCentreCovered,
  earthShadowHalfAngleDeg,
  illuminatedFraction,
  isWaxing,
  normalizeAngleDeg,
  phaseAngleFromDay,
  phaseLabel,
  shadowWindowHours,
  synodicMonthDays,
  terminatorFactor,
} from "../src/modules/physics/kuu-faasid/model";

/**
 * Kuu faaside mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist (sisu/MOODUL-kuu-faasid.md „Füüsika
 * (model.ts jaoks)" → testiväärtuste tabel ning piirjuhud), mitte mudelist
 * tagurpidi tuletatud – muidu testiks test iseennast.
 *
 * Nurgad on kraadides, kaugused kilomeetrites, ajad ööpäevades (erand
 * `shadowWindowHours` – tunnid). Simulatsiooni algseis on θ = 0°
 * (kuuloomine).
 */

/** Kogu liuguri võre: 0…360° sammuga 5°. */
const ANGLE_GRID: number[] = [];
for (
  let angleDeg = SLIDERS.phaseAngleDeg.min;
  angleDeg <= SLIDERS.phaseAngleDeg.max;
  angleDeg += SLIDERS.phaseAngleDeg.step
) {
  ANGLE_GRID.push(angleDeg);
}

describe("synodicMonthDays – miks 29,5 ja mitte 27,3", () => {
  it("27,32 ööpäeva ümber Maa ja 365,25 ööpäeva ümber Päikese → 29,5287", () => {
    expect(synodicMonthDays(27.32, 365.25)).toBeCloseTo(29.5287, 4);
  });

  /**
   * Väärarusaam `faas-ja-tiirlemisaeg`: tsükkel EI ole 27,3 päeva. Kuu peab
   * Päikese suunale järele jõudma, sest Maa on ise edasi liikunud.
   */
  it("annab alati pikema tsükli kui üks tiir ümber Maa", () => {
    expect(SYNODIC_MONTH_DAYS).toBeGreaterThan(SIDEREAL_MONTH_DAYS);
    expect(SYNODIC_MONTH_DAYS - SIDEREAL_MONTH_DAYS).toBeCloseTo(2.21, 2);
  });

  /**
   * Konstant on ARVUTATUD, mitte sisse kirjutatud – nii ei saa rakenduses
   * kuskil olla arv, mis mudeliga lahku läheb.
   */
  it("SYNODIC_MONTH_DAYS on sama, mis funktsioon konstantidest annab", () => {
    expect(SYNODIC_MONTH_DAYS).toBe(
      synodicMonthDays(SIDEREAL_MONTH_DAYS, EARTH_YEAR_DAYS),
    );
    // Õpiku ja rakenduse „29,5 ööpäeva" on selle arvu ümardus.
    expect(SYNODIC_MONTH_DAYS.toFixed(1)).toBe("29.5");
  });

  it("argumendid vahetuses viskab vea, mitte ei anna negatiivset tsüklit", () => {
    expect(() => synodicMonthDays(365.25, 27.32)).toThrow(RangeError);
  });

  it.each([
    [0, 365.25],
    [-27.32, 365.25],
    [27.32, 0],
    [27.32, -365.25],
    [Number.NaN, 365.25],
    [27.32, Number.POSITIVE_INFINITY],
  ])("vigane sisend (%s, %s) viskab vea", (siderealDays, yearDays) => {
    expect(() => synodicMonthDays(siderealDays, yearDays)).toThrow(RangeError);
  });

  it("võrdsete perioodide korral viskab vea (Kuu ei jõuaks kunagi järele)", () => {
    expect(() => synodicMonthDays(27.32, 27.32)).toThrow(RangeError);
  });
});

describe("normalizeAngleDeg – tsükkel on ring", () => {
  it.each([
    [0, 0],
    [90, 90],
    // Liuguri ülemine ots: 360° peab käituma kuuloomisena, mitte kukkuma
    // kõigist phaseLabel akendest välja.
    [360, 0],
    [365, 5],
    [725, 5],
    // „40 päeva pärast" ja tagurpidi kerimine peavad töötama.
    [-90, 270],
    [-1, 359],
    [-720, 0],
  ])("%s° → %s°", (input, expected) => {
    expect(normalizeAngleDeg(input)).toBeCloseTo(expected, 12);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "vigane nurk %s viskab vea",
    (deg) => {
      expect(() => normalizeAngleDeg(deg)).toThrow(RangeError);
    },
  );
});

describe("illuminatedFraction – kui suurt osa me valgustatud poolest näeme", () => {
  it.each([
    [0, 0], // kuuloomine
    [60, 0.25], // kasvav sirp
    [90, 0.5], // esimene veerand
    [120, 0.75], // kasvav kumer
    [180, 1], // täiskuu
    [240, 0.75], // kahanev kumer
    [270, 0.5], // viimane veerand
    [300, 0.25], // kahanev sirp
  ])("θ = %s° → %s", (phaseAngleDeg, expected) => {
    expect(illuminatedFraction(phaseAngleDeg)).toBeCloseTo(expected, 10);
  });

  /**
   * 0 % ja 100 % on sama geomeetria kaks otsa ja mõlemad on ekraanil näha –
   * ümardusvea tõttu veidi negatiivne protsent oleks lihtsalt katki.
   */
  it("otsapunktid on TÄPSELT 0 ja TÄPSELT 1", () => {
    expect(illuminatedFraction(0)).toBe(0);
    expect(illuminatedFraction(360)).toBe(0);
    expect(illuminatedFraction(180)).toBe(1);
  });

  /**
   * Explore-2 süda: 90° ja 270° annavad mõlemad 50 %. Kui keegi „lihtsustaks"
   * mudelit vahemikku 0…180, kaoks kogu kahanev pool tsüklist ära.
   */
  it.each([
    [60, 300],
    [90, 270],
    [120, 240],
  ])("θ = %s° ja %s° annavad sama osa", (waxing, waning) => {
    expect(illuminatedFraction(waxing)).toBeCloseTo(
      illuminatedFraction(waning),
      12,
    );
  });

  it("jääb kogu liuguri võres vahemikku 0…1", () => {
    for (const angleDeg of ANGLE_GRID) {
      const fraction = illuminatedFraction(angleDeg);
      expect(fraction).toBeGreaterThanOrEqual(0);
      expect(fraction).toBeLessThanOrEqual(1);
    }
  });

  it("kasvab kuuloomisest täiskuuni ühtlaselt", () => {
    for (let angleDeg = 0; angleDeg < 180; angleDeg += 5) {
      expect(illuminatedFraction(angleDeg + 5)).toBeGreaterThan(
        illuminatedFraction(angleDeg),
      );
    }
  });
});

describe("terminatorFactor – faasi KUJU, mitte külg", () => {
  it.each([
    [0, 1], // täisketas pime pool meie poole
    [60, 0.5], // sirp: piir nõgus
    [90, 0], // täpselt poolik: piir on sirge
    [120, -0.5], // kumerfaas: piir kumer
    [180, -1],
    [240, -0.5],
    [270, 0],
    [300, 0.5],
  ])("θ = %s° → %s", (phaseAngleDeg, expected) => {
    expect(terminatorFactor(phaseAngleDeg)).toBeCloseTo(expected, 10);
  });

  /**
   * Veerandi juures peab piir olema TÄPSELT sirge. Ujukoma annaks
   * `Math.cos(Math.PI / 2)` = 6,1e-17 ja siis ripuks joonis (sirp või
   * kumerfaas) ujukomavea märgi küljes.
   */
  it("veerandi juures on täpselt 0", () => {
    expect(terminatorFactor(90)).toBe(0);
    expect(terminatorFactor(270)).toBe(0);
  });

  /**
   * Kasvava ja kahaneva Kuu faasi kuju on TÄPSELT sama – mitte
   * vastandmärgiga. Külje otsustab ainult `isWaxing`.
   */
  it.each([
    [60, 300],
    [90, 270],
    [120, 240],
  ])("θ = %s° ja %s° annavad SAMA kuju", (waxing, waning) => {
    expect(terminatorFactor(waxing)).toBeCloseTo(terminatorFactor(waning), 12);
  });

  /** Märgivahetus 90° ja 270° juures eristab sirbi kumerfaasist. */
  it("on sirbi juures positiivne ja kumerfaasi juures negatiivne", () => {
    for (const crescent of [5, 60, 85, 275, 300, 355]) {
      expect(terminatorFactor(crescent)).toBeGreaterThan(0);
      expect(illuminatedFraction(crescent)).toBeLessThan(0.5);
    }
    for (const gibbous of [95, 120, 175, 185, 240, 265]) {
      expect(terminatorFactor(gibbous)).toBeLessThan(0);
      expect(illuminatedFraction(gibbous)).toBeGreaterThan(0.5);
    }
  });
});

describe("isWaxing – kumb külg on valgustatud", () => {
  it.each([
    [0, false], // pöördepunkt, mitte kasvamine
    [5, true],
    [60, true],
    [90, true],
    [179, true],
    [180, false], // pöördepunkt
    [240, false],
    [270, false],
    [300, false],
    [359, false],
    [360, false], // sama, mis 0°
    [-60, false], // = 300°
  ])("θ = %s° → %s", (phaseAngleDeg, expected) => {
    expect(isWaxing(phaseAngleDeg)).toBe(expected);
  });
});

describe("phaseLabel – kaheksa akent, igaüks ±22,5°", () => {
  it.each([
    [0, "new"],
    [60, "waxing-crescent"],
    [90, "first-quarter"],
    [120, "waxing-gibbous"],
    [180, "full"],
    [240, "waning-gibbous"],
    [270, "last-quarter"],
    [300, "waning-crescent"],
  ])("θ = %s° → %s", (phaseAngleDeg, expected) => {
    expect(phaseLabel(phaseAngleDeg)).toBe(expected);
  });

  /** Akende otsad: alumine ots kuulub aknasse, ülemine juba järgmisele. */
  it.each([
    [22.4, "new"],
    [22.5, "waxing-crescent"],
    [67.5, "first-quarter"],
    [112.5, "waxing-gibbous"],
    [157.5, "full"],
    [202.5, "waning-gibbous"],
    [247.5, "last-quarter"],
    [292.5, "waning-crescent"],
    [337.5, "new"],
    [359.9, "new"],
  ])("piir θ = %s° → %s", (phaseAngleDeg, expected) => {
    expect(phaseLabel(phaseAngleDeg)).toBe(expected);
  });

  /**
   * Liuguri ülemine ots ja tagurpidi kerimine ei tohi ühestki aknast välja
   * kukkuda – just selleks normaliseerib iga funktsioon oma sisendi.
   */
  it("360° ja negatiivsed nurgad saavad ikka sildi", () => {
    expect(phaseLabel(360)).toBe("new");
    expect(phaseLabel(-90)).toBe("last-quarter");
    expect(phaseLabel(450)).toBe("first-quarter");
  });

  it("annab kogu liuguri võres alati sildi", () => {
    for (const angleDeg of ANGLE_GRID) {
      expect(phaseLabel(angleDeg)).toBeTypeOf("string");
    }
  });
});

describe("päev ↔ nurk", () => {
  it("päev 22 tsüklis → 268,2° ehk viimane veerand", () => {
    expect(phaseAngleFromDay(22)).toBeCloseTo(268.2, 1);
    expect(phaseLabel(phaseAngleFromDay(22))).toBe("last-quarter");
  });

  it("θ = 90° → 7,382 ööpäeva (veerand tsüklit)", () => {
    expect(dayFromPhaseAngle(90)).toBeCloseTo(7.382, 3);
  });

  it("kuuloomisest täiskuuni on pool tsüklit", () => {
    expect(dayFromPhaseAngle(180)).toBeCloseTo(14.764, 3);
  });

  /** Tsükkel on perioodiline: null, üks ja kaks tsüklit annavad sama nurga. */
  it.each([0, SYNODIC_MONTH_DAYS, 2 * SYNODIC_MONTH_DAYS])(
    "päev %s → 0°",
    (dayInCycle) => {
      expect(phaseAngleFromDay(dayInCycle)).toBeCloseTo(0, 10);
    },
  );

  it("negatiivne päev annab õige nurga, mitte negatiivse", () => {
    expect(phaseAngleFromDay(-7.382172)).toBeCloseTo(270, 4);
  });

  it("on teineteise pöördfunktsioonid kogu liuguri võres", () => {
    for (const angleDeg of ANGLE_GRID) {
      expect(phaseAngleFromDay(dayFromPhaseAngle(angleDeg))).toBeCloseTo(
        normalizeAngleDeg(angleDeg),
        8,
      );
    }
  });

  it("40 päeva pärast tuleb tagasi teise tsükli päevana", () => {
    expect(dayFromPhaseAngle(phaseAngleFromDay(40))).toBeCloseTo(
      40 - SYNODIC_MONTH_DAYS,
      8,
    );
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "tsükli pikkus %s viskab vea",
    (synodicDays) => {
      expect(() => phaseAngleFromDay(10, synodicDays)).toThrow(RangeError);
      expect(() => dayFromPhaseAngle(90, synodicDays)).toThrow(RangeError);
    },
  );

  it.each([Number.NaN, Number.POSITIVE_INFINITY])(
    "vigane päev %s viskab vea",
    (dayInCycle) => {
      expect(() => phaseAngleFromDay(dayInCycle)).toThrow(RangeError);
    },
  );
});

describe("Maa vari – miks vari faase seletada ei saa", () => {
  it("varju poolnurk Kuu kaugusel on 0,6855°", () => {
    expect(earthShadowHalfAngleDeg(9198, 384_400)).toBeCloseTo(0.6855, 4);
  });

  it("kogu aken on 1,4° ehk alla poole protsendi tsüklist", () => {
    const fullWindowDeg =
      2 * earthShadowHalfAngleDeg(EARTH_UMBRA_WIDTH_AT_MOON_KM, MOON_MEAN_KM);
    expect(fullWindowDeg).toBeCloseTo(1.371, 3);
    expect(fullWindowDeg / 360).toBeLessThan(0.005);
  });

  it("vari saab Kuud katta ainult täiskuu juures", () => {
    expect(earthShadowCentreCovered(180)).toBe(true);
    expect(earthShadowCentreCovered(180.5)).toBe(true);
    expect(earthShadowCentreCovered(179.5)).toBe(true);
    // Juba kraad täiskuust mööda on vari otsas.
    expect(earthShadowCentreCovered(181)).toBe(false);
    expect(earthShadowCentreCovered(90)).toBe(false);
    expect(earthShadowCentreCovered(270)).toBe(false);
    expect(earthShadowCentreCovered(0)).toBe(false);
  });

  /**
   * Explore-3 vastus: kogu liuguri võres on ainus koht, kus vari Kuuni ulatub,
   * täiskuu. Sirp (60°, 300°) on varjust nii kaugel kui üldse olla saab.
   */
  it("on kogu liuguri võres tõene ainult 180° juures", () => {
    const covered = ANGLE_GRID.filter((angleDeg) =>
      earthShadowCentreCovered(angleDeg),
    );
    expect(covered).toEqual([180]);
  });

  it("aken on 2,70 tundi 29,5 ööpäevast", () => {
    expect(shadowWindowHours()).toBeCloseTo(2.6988, 4);
    expect(shadowWindowHours(SYNODIC_MONTH_DAYS)).toBe(shadowWindowHours());
    // 2,7 tundi 29,5 ööpäevast on 0,4 % tsüklist.
    expect(shadowWindowHours() / (SYNODIC_MONTH_DAYS * 24)).toBeLessThan(0.005);
  });

  it.each([
    [0, 384_400],
    [-9198, 384_400],
    [9198, 0],
    [9198, -384_400],
    [Number.NaN, 384_400],
    [9198, Number.POSITIVE_INFINITY],
  ])("vigane sisend (%s, %s) viskab vea", (umbraWidthKm, distanceKm) => {
    expect(() => earthShadowHalfAngleDeg(umbraWidthKm, distanceKm)).toThrow(
      RangeError,
    );
  });

  it.each([0, -1, Number.NaN])("tsükli pikkus %s viskab vea", (synodicDays) => {
    expect(() => shadowWindowHours(synodicDays)).toThrow(RangeError);
  });

  /**
   * Ristkontroll mooduliga `varjutused` – ainus koht, kus selle mooduli testid
   * teist moodulit puudutavad. Rakenduse kood EI impordi `varjutused` mudelit
   * (vt model.ts konstandi kommentaari); seda, et kordus jääb õigeks, valvab
   * see test.
   */
  it("EARTH_UMBRA_WIDTH_AT_MOON_KM klapib mooduli varjutused arvutusega", () => {
    expect(MOON_MEAN_KM).toBe(VARJUTUSED_MOON_MEAN_KM);
    expect(
      Math.abs(EARTH_UMBRA_WIDTH_AT_MOON_KM - lunarUmbraWidthKm(MOON_MEAN_KM)),
    ).toBeLessThanOrEqual(1);
  });
});

describe("SLIDERS – liuguri võre", () => {
  it("algväärtus 0° ja mõlemad otsad on kuuloomine", () => {
    expect(SLIDERS.phaseAngleDeg.min).toBe(0);
    expect(SLIDERS.phaseAngleDeg.max).toBe(360);
    expect(phaseLabel(SLIDERS.phaseAngleDeg.min)).toBe("new");
    expect(phaseLabel(SLIDERS.phaseAngleDeg.max)).toBe("new");
  });

  /**
   * Ülesannete sihtnurgad peavad võrele sattuma – muidu on küsimusele
   * „keri 90° juurde" liuguriga võimatu vastata (mooduli `varjutused`
   * õppetund).
   */
  it.each([0, 60, 90, 120, 180, 270, 300])(
    "ülesande sihtnurk %s° on võrel",
    (angleDeg) => {
      expect(ANGLE_GRID).toContain(angleDeg);
    },
  );

  it("võre katab terve tsükli täpselt ühe korra", () => {
    expect(ANGLE_GRID).toHaveLength(73);
    expect(ANGLE_GRID.at(-1)).toBe(360);
  });
});
