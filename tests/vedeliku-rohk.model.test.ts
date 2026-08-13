import { describe, expect, it } from "vitest";
import { activitiesSchema, manifestSchema } from "../src/engine/contractSchema";
import { activities } from "../src/modules/physics/vedeliku-rohk/activities";
import { manifest } from "../src/modules/physics/vedeliku-rohk/manifest";
import {
  GRAVITY_MS2,
  LIQUID_DENSITIES,
  depthFromPressure,
  metresFromCentimetres,
  pressure,
  toKilopascals,
} from "../src/modules/physics/vedeliku-rohk/model";

/**
 * Vedeliku rõhu mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist (sisu/MOODUL-vedeliku-rohk.md
 * „Füüsika" → „Testid" ning sammude juures kirjas olevad vastused), mitte
 * mudelist tagurpidi tuletatud – muidu testiks test iseennast. Kaasa on
 * võetud ka need arvud, mille peal moodul õpilast hiljem päriselt kontrollib
 * (simulatsiooni ülesanded, harjutused, väljumispilet, kordamiskaardid) –
 * nii selgub näpuviga siin, mitte tunnis.
 */

describe("pressure – p = ρ · g · h", () => {
  it("vesi 1 m sügavusel → 9800 Pa", () => {
    expect(pressure(LIQUID_DENSITIES.vesi, 1)).toBeCloseTo(9800, 6);
  });

  it("pinnal (h = 0) on vedelikusamba rõhk 0 Pa", () => {
    // See ON graafiku nullpunkt (samm 1.19), mitte erijuht: sirge p(h) algab
    // nullist, sest pinnal ei ole ühtki veekihti sinu kohal.
    expect(pressure(LIQUID_DENSITIES.vesi, 0)).toBe(0);
  });

  it("kaks korda sügavamal on rõhk kaks korda suurem (võrdeline seos)", () => {
    const shallow = pressure(LIQUID_DENSITIES.vesi, 0.5);
    const deep = pressure(LIQUID_DENSITIES.vesi, 1);
    expect(shallow).toBeCloseTo(4900, 6);
    expect(deep).toBeCloseTo(2 * shallow, 6);
  });

  it("graafiku punktid langevad täpselt sirgele p = k · h", () => {
    // Simulatsioon on ideaalne (spetsifikatsioon, samm collect): p/h peab
    // olema iga sügavuse juures sama arv, muidu ei tohiks tolerants olla ±2%.
    const slopes = [0.25, 0.5, 1, 1.5, 2].map(
      (depth) => pressure(LIQUID_DENSITIES.vesi, depth) / depth,
    );
    for (const slope of slopes) {
      expect(slope).toBeCloseTo(LIQUID_DENSITIES.vesi * GRAVITY_MS2, 6);
    }
  });

  it("elavhõbedas on samal sügavusel 13,6 korda suurem rõhk kui vees", () => {
    const depth = 1;
    expect(pressure(LIQUID_DENSITIES.elavhobe, depth)).toBeCloseTo(133280, 6);
    expect(pressure(LIQUID_DENSITIES.elavhobe, depth)).toBeCloseTo(
      13.6 * pressure(LIQUID_DENSITIES.vesi, depth),
      6,
    );
  });

  it("õlis on samal sügavusel väiksem rõhk kui vees (simulatsiooni ülesanne 2)", () => {
    const depth = 0.9;
    expect(pressure(LIQUID_DENSITIES.oli, depth)).toBeLessThan(
      pressure(LIQUID_DENSITIES.vesi, depth),
    );
  });

  it("õlis 1,0 m on sama rõhk kui vees 0,9 m (simulatsiooni ülesanne 3)", () => {
    expect(pressure(LIQUID_DENSITIES.oli, 1)).toBeCloseTo(
      pressure(LIQUID_DENSITIES.vesi, 0.9),
      6,
    );
    expect(pressure(LIQUID_DENSITIES.vesi, 0.9)).toBeCloseTo(8820, 6);
  });

  it("merevees on 1 m sügavusel suurem rõhk kui järvevees (kordamiskaart 6)", () => {
    expect(pressure(LIQUID_DENSITIES["soolane-vesi"], 1)).toBeGreaterThan(
      pressure(LIQUID_DENSITIES.vesi, 1),
    );
  });
});

describe("pressure – anuma kuju ei ole parameeter (hüdrostaatiline paradoks)", () => {
  it("sama vedelik ja sama sügavus annavad ALATI sama rõhu", () => {
    // Kitsas, lai ja lehtrikujuline anum (predict-samm ja explore lisavaade):
    // simulatsioonil pole midagi anda, mis vastust muudaks – ainus, mida ta
    // kuju vahetamisel teeb, on pildi vahetamine. Väärarusaam
    // `kuju-mojutab-rohku` sureb siin, mitte tekstis.
    const depth = 0.8;
    const readings = [1, 2, 3].map(() => pressure(LIQUID_DENSITIES.vesi, depth));
    expect(new Set(readings).size).toBe(1);
  });
});

describe("pressure – raskuskiirendus", () => {
  it("vaikimisi arvutab 9,8-ga", () => {
    expect(GRAVITY_MS2).toBe(9.8);
    expect(pressure(LIQUID_DENSITIES.vesi, 2)).toBeCloseTo(
      pressure(LIQUID_DENSITIES.vesi, 2, 9.8),
      6,
    );
  });

  it("g = 10 kasutanud õpilane jääb 5% tolerantsi sisse", () => {
    // Just see väide lubab harjutustes tolerantsi 5% (samm 1.20). Ilma testita
    // oleks ta lootus, mitte otsus.
    for (const depth of [0.4, 1.5, 2, 3, 12]) {
      const exact = pressure(LIQUID_DENSITIES.vesi, depth);
      const rounded = pressure(LIQUID_DENSITIES.vesi, depth, 10);
      expect(Math.abs(rounded - exact) / exact).toBeLessThan(0.05);
    }
  });
});

describe("pressure – definitsioonipiirkond", () => {
  it("negatiivne sügavus viskab vea (vedeliku kohal ei ole vedelikku)", () => {
    expect(() => pressure(LIQUID_DENSITIES.vesi, -0.5)).toThrow(RangeError);
  });

  it("tihedus 0 või negatiivne viskab vea", () => {
    expect(() => pressure(0, 1)).toThrow(RangeError);
    expect(() => pressure(-1000, 1)).toThrow(RangeError);
  });

  it("raskuskiirendus 0 või negatiivne viskab vea", () => {
    expect(() => pressure(LIQUID_DENSITIES.vesi, 1, 0)).toThrow(RangeError);
    expect(() => pressure(LIQUID_DENSITIES.vesi, 1, -9.8)).toThrow(RangeError);
  });

  it("NaN viskab vea (tühja sisendivälja tulemus ei tohi läbi lipsata)", () => {
    expect(() => pressure(LIQUID_DENSITIES.vesi, Number.NaN)).toThrow(RangeError);
    expect(() => pressure(Number.NaN, 1)).toThrow(RangeError);
  });

  it("Infinity viskab vea", () => {
    expect(() =>
      pressure(LIQUID_DENSITIES.vesi, Number.POSITIVE_INFINITY),
    ).toThrow(RangeError);
    expect(() => pressure(Number.POSITIVE_INFINITY, 1)).toThrow(RangeError);
  });

  it("ülivoolav korrutis viskab vea, ei tagasta Infinity't", () => {
    // Iga sisend on siin eraldi võttes lõplik ja positiivne – vea teeb alles
    // korrutis. Mõlemad ülevaatajad osutasid samale kohale (2026-08-04).
    expect(() => pressure(1e308, 2)).toThrow(RangeError);
  });
});

describe("depthFromPressure – h = p / (ρ · g)", () => {
  it("29,4 kPa vees tähendab 3,0 m sügavust (harjutuse 1 näidislahendus)", () => {
    expect(depthFromPressure(29400, LIQUID_DENSITIES.vesi)).toBeCloseTo(3, 6);
  });

  it("on pressure'i pöördfunktsioon", () => {
    for (const depth of [0, 0.4, 0.9, 1.5, 3, 12]) {
      const found = depthFromPressure(
        pressure(LIQUID_DENSITIES["soolane-vesi"], depth),
        LIQUID_DENSITIES["soolane-vesi"],
      );
      expect(found).toBeCloseTo(depth, 6);
    }
  });

  it("vees 0,9 m rõhk tuleb õlis 1,0 m sügavuselt (simulatsiooni ülesanne 3)", () => {
    const target = pressure(LIQUID_DENSITIES.vesi, 0.9);
    expect(depthFromPressure(target, LIQUID_DENSITIES.oli)).toBeCloseTo(1, 6);
  });

  it("ülisuur tihedus viskab vea, ei tagasta vaikselt nulli", () => {
    // Kõige salakavalam kolmest: nimetaja (ρ · g) voolab üle Infinity'ks ja
    // jagatis kukub NULLI. Vastuseks tuleks „0 m" – arv, mitte veateade,
    // seega ei märkaks keegi midagi.
    expect(() => depthFromPressure(9800, 1e308)).toThrow(RangeError);
  });

  it("ülivoolav jagatis viskab vea", () => {
    expect(() => depthFromPressure(1e308, 1e-320)).toThrow(RangeError);
  });

  it("vigane sisend viskab vea", () => {
    expect(() => depthFromPressure(-1, LIQUID_DENSITIES.vesi)).toThrow(RangeError);
    expect(() => depthFromPressure(9800, 0)).toThrow(RangeError);
    expect(() => depthFromPressure(Number.NaN, LIQUID_DENSITIES.vesi)).toThrow(
      RangeError,
    );
    expect(() => depthFromPressure(9800, LIQUID_DENSITIES.vesi, 0)).toThrow(
      RangeError,
    );
  });
});

describe("ühikud", () => {
  it("9800 Pa = 9,8 kPa (kordamiskaart 5)", () => {
    expect(toKilopascals(9800)).toBeCloseTo(9.8, 6);
  });

  it("60 cm = 0,6 m (kordamiskaart 5)", () => {
    expect(metresFromCentimetres(60)).toBeCloseTo(0.6, 6);
  });

  it("teisendab ka kahe rõhu vahet, seega lubab negatiivset arvu", () => {
    expect(toKilopascals(-2000)).toBeCloseTo(-2, 6);
  });

  it("mittearv viskab vea", () => {
    expect(() => toKilopascals(Number.NaN)).toThrow(RangeError);
    expect(() => metresFromCentimetres(Number.POSITIVE_INFINITY)).toThrow(
      RangeError,
    );
  });

  /**
   * Mõlemad teisendused JAGAVAD, seega üle voolata ei saa: lõplikust arvust
   * tuleb jagades alati lõplik arv (samm 4.1qq). Alavool on siin aus vastus,
   * mitte viga – väga väike sügavus ongi peaaegu null.
   */
  it("lõplikust sisendist tuleb lõplik arv ka ääremistes arvudes", () => {
    expect(Number.isFinite(toKilopascals(1e308))).toBe(true);
    expect(Number.isFinite(metresFromCentimetres(-1e308))).toBe(true);
    expect(metresFromCentimetres(1e-320)).toBeGreaterThanOrEqual(0);
  });
});

describe("harjutuste ja väljumispileti vastused", () => {
  it("2,0 m vees ≈ 19,6 kPa (harjutus 2)", () => {
    expect(toKilopascals(pressure(LIQUID_DENSITIES.vesi, 2))).toBeCloseTo(19.6, 6);
  });

  it("sukelduja 12 m meres ≈ 121 kPa (harjutus 3)", () => {
    const kPa = toKilopascals(pressure(LIQUID_DENSITIES["soolane-vesi"], 12));
    expect(kPa).toBeCloseTo(121.128, 6);
    // Spetsis on ümardatud vastus 121 kPa – kontrolli, et 5% tolerants katab.
    expect(Math.abs(kPa - 121) / kPa).toBeLessThan(0.05);
  });

  it("akvaarium 40 cm ≈ 3,9 kPa ja teisendamata jätmine annab ~392 kPa", () => {
    const depthM = metresFromCentimetres(40);
    expect(toKilopascals(pressure(LIQUID_DENSITIES.vesi, depthM))).toBeCloseTo(
      3.92,
      6,
    );
    // Väärarusaama `cm-m-teisendus` lõksuarv (samm 1.20): sentimeetrid otse
    // valemisse. 100 korda suurem – lõks ei mahu kuidagi õige vastuse
    // tolerantsi sisse.
    expect(toKilopascals(pressure(LIQUID_DENSITIES.vesi, 40))).toBeCloseTo(392, 6);
  });

  it("1,5 m vees ≈ 14,7 kPa (väljumispilet 2)", () => {
    expect(toKilopascals(pressure(LIQUID_DENSITIES.vesi, 1.5))).toBeCloseTo(
      14.7,
      6,
    );
  });

  it("3,0 m vees ≈ 29,4 kPa (kordamiskaart 2)", () => {
    expect(toKilopascals(pressure(LIQUID_DENSITIES.vesi, 3))).toBeCloseTo(29.4, 6);
  });
});

describe("LIQUID_DENSITIES", () => {
  it("sisaldab simulatsiooni nelja vedelikku spetsis antud tihedustega", () => {
    expect(LIQUID_DENSITIES).toEqual({
      vesi: 1000,
      "soolane-vesi": 1030,
      oli: 900,
      elavhobe: 13600,
    });
  });
});

describe("manifest", () => {
  it("vastab moodulilepingu skeemile", () => {
    expect(() => manifestSchema.parse(manifest)).not.toThrow();
  });

  it("viitab ainekava õpitulemustele", () => {
    expect(manifest.outcomes).toContain("P5-T4");
    expect(manifest.outcomes).toContain("P5-T5");
  });

  it("ei võta enda arvele üleslükkejõu praktilist tööd", () => {
    // P5-PT3 on JÄRGMISE mooduli oma (spetsifikatsioon hoiatab eraldi) –
    // vale kirje siin annaks katvusraportile (etapp 4.0) valeteate.
    expect(manifest.practicalWork).toEqual([]);
  });
});

describe("activities", () => {
  it("sammud vastavad moodulilepingu skeemile", () => {
    // Moodul EI ole veel registris (samm 1.21), seega registry.test.ts teda
    // veel läbi ei käi – ilma selle reata jääks vigane samm märkamata kuni
    // hetkeni, mil ta juba õpilase ekraanil on.
    //
    // Kordamiskaardid tulevad alles sammuga 1.21 (leping nõuab neid vähemalt
    // kolme), seega paneme kontrolli ajaks kohatäited: kontrollida tahame
    // SAMME, mitte veel kirjutamata kaarte.
    const placeholders = [1, 2, 3].map((number) => ({
      id: `rc-${number}`,
      type: "concept" as const,
      question: "kohatäide",
      answer: "kohatäide",
    }));
    expect(() =>
      activitiesSchema.parse({ ...activities, reviewCards: placeholders }),
    ).not.toThrow();
  });

  it("võtab mõõtetabeli kordaja mudelist", () => {
    // Kordaja on kPa ühe meetri kohta vees. Kui g või vee tihedus mudelis
    // muutub, peab tabeli reegel muutuma kaasa (CLAUDE.md reegel 1).
    const collect = activities.steps.find((step) => step.type === "collect");
    const table = collect?.questions.find((question) => question.kind === "table");
    expect(table?.rule).toMatchObject({
      kind: "proportional",
      factor: toKilopascals(pressure(LIQUID_DENSITIES.vesi, 1)),
    });
  });
});
