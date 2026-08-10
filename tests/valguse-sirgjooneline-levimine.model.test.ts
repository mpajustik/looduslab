import { describe, expect, it } from "vitest";
import {
  EXAMPLE_OBJECTS,
  holeDiameterFromMm,
  pinholeBlurWidth,
  pinholeBoxDepth,
  pinholeImageHeight,
  pinholeMagnification,
} from "../src/modules/physics/valguse-sirgjooneline-levimine/model";

/**
 * Sirgjoonelise levimise mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist
 * (sisu/MOODUL-valguse-sirgjooneline-levimine.md „Füüsika" → testiväärtuste
 * tabel ning sammude juures kirjas olevad vastused), mitte mudelist tagurpidi
 * tuletatud – muidu testiks test iseennast. Kaasa on võetud ka need arvud,
 * mille peal moodul õpilast hiljem päriselt kontrollib (simulatsiooni
 * ülesanded, harjutused, väljumispilet, kordamiskaardid) – nii selgub näpuviga
 * siin, mitte tunnis.
 */

describe("pinholeImageHeight – nõelaugukaamera kujutise kõrgus", () => {
  it.each([
    ["küünal (näidislahendus)", 0.2, 1, 0.1, 0.02],
    ["inimene (harjutus 2)", 1.8, 9, 0.15, 0.03],
    ["puu (simulatsiooni ülesanne 1, kordamiskaart rc-3)", 6, 12, 0.2, 0.1],
    ["maja (väljumispilet 2)", 8, 40, 0.25, 0.05],
  ])("%s → %s m", (_what, heightM, distanceM, depthM, expected) => {
    expect(pinholeImageHeight(heightM, distanceM, depthM)).toBeCloseTo(
      expected,
      9,
    );
  });

  it("Päikese laik puu all: 5 m kõrguste okste alt umbes 4,6 cm", () => {
    // Kosmoseskaala kontroll: valem peab kannatama 1,4 miljoni kilomeetri
    // suurust eset 150 miljoni kilomeetri kauguselt. Meetrites arvutatuna
    // annab ta sama vastuse mis õpilase „5 / 108".
    expect(pinholeImageHeight(1.392e9, 1.5e11, 5)).toBeCloseTo(0.0464, 4);
    expect(pinholeImageHeight(1.392e9, 1.5e11, 5)).toBeCloseTo(5 / 108, 3);
  });

  it("kaks korda sügavam kamber → kaks korda kõrgem kujutis", () => {
    // Simulatsiooni ülesanne 2 tugineb täpselt sellele võrdelisusele.
    expect(pinholeImageHeight(6, 12, 0.4)).toBeCloseTo(
      2 * pinholeImageHeight(6, 12, 0.2),
      9,
    );
  });

  it("kaks korda kaugem ese → kaks korda madalam kujutis", () => {
    expect(pinholeImageHeight(6, 24, 0.2)).toBeCloseTo(
      pinholeImageHeight(6, 12, 0.2) / 2,
      9,
    );
  });

  it("kujutis on alati positiivne – pea peal olemine on joonise, mitte arvu asi", () => {
    // Väärarusaam `pea-peal-vajab-laatse` lükatakse ümber joonisel ja predict
    // sammus. Kui mudel hakkaks tagastama miinusmärki, jõuaks see õpilase
    // ekraanile ja checker hakkaks „−10 cm" nõudma.
    for (const { heightM, distanceM } of Object.values(EXAMPLE_OBJECTS)) {
      expect(pinholeImageHeight(heightM, distanceM, 0.2)).toBeGreaterThan(0);
    }
  });

  it("null, negatiivne või NaN viskab vea (ei paranda vaikselt)", () => {
    expect(() => pinholeImageHeight(0, 1, 0.1)).toThrow(RangeError);
    expect(() => pinholeImageHeight(0.2, 0, 0.1)).toThrow(RangeError);
    expect(() => pinholeImageHeight(0.2, 1, 0)).toThrow(RangeError);
    expect(() => pinholeImageHeight(-0.2, 1, 0.1)).toThrow(RangeError);
    expect(() => pinholeImageHeight(0.2, -1, 0.1)).toThrow(RangeError);
    expect(() => pinholeImageHeight(0.2, 1, Number.NaN)).toThrow(RangeError);
  });

  it("üle voolav tulemus viskab vea, ei tagasta Infinity't", () => {
    // Vaikne Infinity jõuaks ekraanile kujutise kõrgusena.
    expect(() =>
      pinholeImageHeight(Number.MAX_VALUE, Number.MIN_VALUE, 1),
    ).toThrow(RangeError);
  });
});

describe("pinholeMagnification – mitu korda kujutis esemest väiksem on", () => {
  it("puu 12 m kauguselt, kamber 0,2 m → 1/60 ehk 0,0167", () => {
    expect(pinholeMagnification(12, 0.2)).toBeCloseTo(0.016_666_7, 6);
  });

  it("inimene 9 m kauguselt, kamber 0,15 m → 1/60 (harjutuse 2 vihje)", () => {
    // Vihje ütleb „9 / 0,15 = 60, seega kujutis on 60 korda väiksem".
    expect(1 / pinholeMagnification(9, 0.15)).toBeCloseTo(60, 6);
  });

  it("küünal 1 m kauguselt, kamber 0,1 m → 1/10 (näidislahendus)", () => {
    expect(pinholeMagnification(1, 0.1)).toBeCloseTo(0.1, 9);
  });

  it("annab kujutise kõrgusega sama vastuse", () => {
    // Kaks funktsiooni, üks füüsika: kui need lahku lähevad, näitab
    // simulatsioon suurendust, mis ei käi kuvatava kujutisega kokku.
    for (const { heightM, distanceM } of Object.values(EXAMPLE_OBJECTS)) {
      expect(pinholeImageHeight(heightM, distanceM, 0.25)).toBeCloseTo(
        heightM * pinholeMagnification(distanceM, 0.25),
        9,
      );
    }
  });

  it("ei ole piiratud ühega – kamber võib olla kaugusest sügavamgi", () => {
    // Liuguritega saab need võrdseks seada (kaugus alates 0,5 m, sügavus kuni
    // 0,5 m). Mudel ainult jagab; piiri lisamine tähendaks, et ta keeldub
    // olukorrast, mille simulatsioon ise võimaldab.
    expect(pinholeMagnification(0.5, 0.5)).toBeCloseTo(1, 9);
    expect(pinholeMagnification(0.25, 0.5)).toBeCloseTo(2, 9);
  });

  it("null või negatiivne viskab vea", () => {
    expect(() => pinholeMagnification(0, 0.2)).toThrow(RangeError);
    expect(() => pinholeMagnification(12, 0)).toThrow(RangeError);
    expect(() => pinholeMagnification(-12, 0.2)).toThrow(RangeError);
  });
});

describe("pinholeBoxDepth – pöördülesanne", () => {
  it("puu 12 m kauguselt, kujutis 20 cm → kamber 0,4 m (simulatsiooni ülesanne 2)", () => {
    expect(pinholeBoxDepth(6, 0.2, 12)).toBeCloseTo(0.4, 9);
  });

  it("inimene 9 m kauguselt, kujutis 5 cm → kamber 0,25 m", () => {
    expect(pinholeBoxDepth(1.8, 0.05, 9)).toBeCloseTo(0.25, 9);
  });

  it("edasi-tagasi: arvutatud sügavus annab TÄPSELT soovitud kujutise", () => {
    // Spetsifikatsioon nõuab seda otsesõnu. Kui tehete järjekord kahes
    // funktsioonis lahku läheks, tuleks siit viimase biti võrra vale arv ja
    // simulatsiooni ülesande 2 vastus ei klapiks liuguri näiduga.
    for (const [id, { heightM, distanceM }] of Object.entries(EXAMPLE_OBJECTS)) {
      for (const wantedM of [0.02, 0.05, 0.1, 0.2]) {
        const depthM = pinholeBoxDepth(heightM, wantedM, distanceM);
        expect(
          pinholeImageHeight(heightM, distanceM, depthM),
          `${id} → ${wantedM} m`,
        ).toBeCloseTo(wantedM, 12);
      }
    }
  });

  it("null või negatiivne viskab vea", () => {
    expect(() => pinholeBoxDepth(0, 0.2, 12)).toThrow(RangeError);
    expect(() => pinholeBoxDepth(6, 0, 12)).toThrow(RangeError);
    expect(() => pinholeBoxDepth(6, 0.2, 0)).toThrow(RangeError);
    expect(() => pinholeBoxDepth(6, -0.2, 12)).toThrow(RangeError);
  });
});

describe("pinholeBlurWidth – augu tekitatud udu (lisanäit)", () => {
  it("2 mm auk määrib 10 cm kujutise serva 2 mm ulatuses – terav", () => {
    expect(pinholeBlurWidth(0.002, 12, 0.2)).toBeCloseTo(0.002_033_3, 7);
  });

  it("2 cm auk määrib sama kujutise 2 cm ulatuses – udune", () => {
    expect(pinholeBlurWidth(0.02, 12, 0.2)).toBeCloseTo(0.020_333_3, 7);
  });

  it("suurem auk EI tee kujutist suuremaks, ainult uduseks (explore-3)", () => {
    // Väärarusaam `suurem-auk-suurem-kujutis`: kujutise kõrgus ei sõltu august
    // üldse, seepärast ei võta `pinholeImageHeight` augu läbimõõtu sisendiks.
    // See test hoiab selle omaduse paigal ka siis, kui keegi tahaks kunagi
    // valemit „täpsustada".
    const suur = pinholeBlurWidth(0.02, 12, 0.4);
    const vaike = pinholeBlurWidth(0.0005, 12, 0.4);
    expect(suur).toBeGreaterThan(vaike);
    expect(pinholeImageHeight(6, 12, 0.4)).toBeCloseTo(0.2, 9);
  });

  it("hägu ei sõltu eseme kõrgusest – suur kujutis on suhteliselt teravam", () => {
    // Sama auk, sama kamber, kaks eri eset: hägu on ühesugune, aga puu kujutis
    // on majast kaks korda kõrgem, seega udune riba on tal suhteliselt kitsam.
    const blurM = pinholeBlurWidth(0.002, 12, 0.2);
    expect(pinholeBlurWidth(0.002, 12, 0.2)).toBe(blurM);
    expect(blurM / pinholeImageHeight(6, 12, 0.2)).toBeLessThan(
      blurM / pinholeImageHeight(1.8, 12, 0.2),
    );
  });

  it("hägu on alati vähemalt augu laiune", () => {
    // `(L + b) / L` on alati > 1, seega auk ise on alumine piir. Kui see
    // kunagi katki läheks, joonistaks sim august kitsama uduse riba.
    for (const holeM of [0.0005, 0.002, 0.01, 0.02]) {
      expect(pinholeBlurWidth(holeM, 40, 0.05)).toBeGreaterThan(holeM);
    }
  });

  it("null või negatiivne viskab vea", () => {
    expect(() => pinholeBlurWidth(0, 12, 0.2)).toThrow(RangeError);
    expect(() => pinholeBlurWidth(0.002, 0, 0.2)).toThrow(RangeError);
    expect(() => pinholeBlurWidth(0.002, 12, 0)).toThrow(RangeError);
    expect(() => pinholeBlurWidth(-0.002, 12, 0.2)).toThrow(RangeError);
  });
});

describe("holeDiameterFromMm – liuguri millimeetrid mudeli meetriteks", () => {
  it("liuguri otspunktid 0,5 mm ja 20 mm", () => {
    expect(holeDiameterFromMm(0.5)).toBeCloseTo(0.0005, 12);
    expect(holeDiameterFromMm(20)).toBeCloseTo(0.02, 12);
  });

  it("2 mm auk annab spetsifikatsiooni hägu (2,03 mm)", () => {
    // Terve tee liugurist arvuni, nii nagu simulatsioon teda käib – see test
    // läheks punaseks, kui keegi teisenduse kunagi vahele jätaks.
    expect(pinholeBlurWidth(holeDiameterFromMm(2), 12, 0.2)).toBeCloseTo(
      0.002_033_3,
      7,
    );
  });

  it("null või negatiivne viskab vea", () => {
    expect(() => holeDiameterFromMm(0)).toThrow(RangeError);
    expect(() => holeDiameterFromMm(-2)).toThrow(RangeError);
  });
});

describe("EXAMPLE_OBJECTS – simulatsiooni nupurea näited", () => {
  it("annavad spetsifikatsiooni tabeli kujutised", () => {
    const expected: Record<
      keyof typeof EXAMPLE_OBJECTS,
      { depthM: number; imageM: number }
    > = {
      kuunal: { depthM: 0.1, imageM: 0.02 },
      inimene: { depthM: 0.15, imageM: 0.03 },
      puu: { depthM: 0.2, imageM: 0.1 },
      maja: { depthM: 0.25, imageM: 0.05 },
    };

    for (const [id, object] of Object.entries(EXAMPLE_OBJECTS)) {
      const want = expected[id as keyof typeof EXAMPLE_OBJECTS];
      expect(
        pinholeImageHeight(object.heightM, object.distanceM, want.depthM),
        id,
      ).toBeCloseTo(want.imageM, 9);
    }
  });

  it("mahuvad kauguse liuguri vahemikku 0,5–40 m", () => {
    // Kui näite kaugust ei saa liuguriga seada, ei ole nupurea nupp
    // simulatsioonis lahendatav.
    for (const [id, object] of Object.entries(EXAMPLE_OBJECTS)) {
      expect(object.distanceM, id).toBeGreaterThanOrEqual(0.5);
      expect(object.distanceM, id).toBeLessThanOrEqual(40);
    }
  });
});
