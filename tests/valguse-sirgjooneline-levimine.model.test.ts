import { describe, expect, it } from "vitest";
import {
  BRIGHT_MIN_HOLE_M,
  EXAMPLE_OBJECTS,
  SHARP_MAX_BLUR_SHARE,
  SLIDERS,
  classifyBrightness,
  classifySharpness,
  holeDiameterFromMm,
  metersToCm,
  pinholeBlurWidth,
  pinholeBoxDepth,
  pinholeImageHeight,
  pinholeMagnification,
} from "../src/modules/physics/valguse-sirgjooneline-levimine/model";
import { manifest } from "../src/modules/physics/valguse-sirgjooneline-levimine/manifest";
import { activities } from "../src/modules/physics/valguse-sirgjooneline-levimine/activities";
import { teacher } from "../src/modules/physics/valguse-sirgjooneline-levimine/teacher";
import {
  activitiesSchema,
  manifestSchema,
} from "../src/engine/contractSchema";
import { stepQuestions } from "../src/engine/contract";
import { checkNumericAnswer } from "../src/checker/numeric";

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

describe("metersToCm – mudeli meetrid ekraani sentimeetriteks", () => {
  it("puu kujutis 0,1 m on ekraanil 10 cm (simulatsiooni ülesanne 1)", () => {
    // Terve tee mudelist ekraanile, nii nagu simulatsioon ja explore-1 teda
    // käivad – see test läheks punaseks, kui keegi teisenduse vahele jätaks.
    expect(metersToCm(pinholeImageHeight(6, 12, 0.2))).toBeCloseTo(10, 9);
  });

  it("küünla kujutis 0,02 m on 2 cm (näidislahendus)", () => {
    expect(metersToCm(0.02)).toBeCloseTo(2, 9);
  });

  it("null või negatiivne viskab vea", () => {
    expect(() => metersToCm(0)).toThrow(RangeError);
    expect(() => metersToCm(-0.1)).toThrow(RangeError);
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

  it("mahuvad kauguse liuguri vahemikku", () => {
    // Kui näite kaugust ei saa liuguriga seada, ei ole nupurea nupp
    // simulatsioonis lahendatav.
    for (const [id, object] of Object.entries(EXAMPLE_OBJECTS)) {
      expect(object.distanceM, id).toBeGreaterThanOrEqual(SLIDERS.distanceM.min);
      expect(object.distanceM, id).toBeLessThanOrEqual(SLIDERS.distanceM.max);
    }
  });

  it("iga näite kaugus on liuguri sammu kordne", () => {
    // Nupp seab kauguse liuguri väärtuseks. Kui arv sammu vahele jääks, näitaks
    // liugur pärast nupuvajutust naaberväärtust ja ülesande vastus läheks vale.
    for (const [id, object] of Object.entries(EXAMPLE_OBJECTS)) {
      const steps = object.distanceM / SLIDERS.distanceM.step;
      expect(steps, id).toBeCloseTo(Math.round(steps), 9);
    }
  });
});

describe("SLIDERS – simulatsiooni liugurite piirid", () => {
  it("vastavad spetsifikatsiooni sammule „explore“", () => {
    expect(SLIDERS.distanceM).toEqual({ min: 0.5, max: 40, step: 0.5 });
    expect(SLIDERS.boxDepthM).toEqual({ min: 0.05, max: 0.5, step: 0.01 });
    expect(SLIDERS.holeMm).toEqual({ min: 0.5, max: 20, step: 0.5 });
  });

  it("iga liuguri otspunktid on mudelile kõlblikud sisendid", () => {
    // Liugur ei tohi anda mudelile väärtust, mille peal see vea viskab.
    for (const holeMm of [SLIDERS.holeMm.min, SLIDERS.holeMm.max]) {
      expect(() => holeDiameterFromMm(holeMm)).not.toThrow();
    }
    for (const distanceM of [SLIDERS.distanceM.min, SLIDERS.distanceM.max]) {
      for (const depthM of [SLIDERS.boxDepthM.min, SLIDERS.boxDepthM.max]) {
        expect(() =>
          pinholeImageHeight(EXAMPLE_OBJECTS.maja.heightM, distanceM, depthM),
        ).not.toThrow();
      }
    }
  });
});

describe("classifyBrightness – hele või hämar", () => {
  it("liuguri väikseim auk on hämar, suurim hele", () => {
    expect(classifyBrightness(holeDiameterFromMm(SLIDERS.holeMm.min))).toBe("dim");
    expect(classifyBrightness(holeDiameterFromMm(SLIDERS.holeMm.max))).toBe("bright");
  });

  it("piir ise (5 mm) loeb juba heledaks", () => {
    expect(BRIGHT_MIN_HOLE_M).toBe(0.005);
    expect(classifyBrightness(holeDiameterFromMm(5))).toBe("bright");
    expect(classifyBrightness(holeDiameterFromMm(4.5))).toBe("dim");
  });

  it("ei sõltu kaugusest ega kambrist – ainult august", () => {
    // Heledus ja teravus käivad eri suundades: suur kujutis laia augu juures on
    // ühtaegu terav JA hele. Seda paari valvab see test koos ülemisega.
    const holeM = holeDiameterFromMm(SLIDERS.holeMm.max);
    const bigImageM = pinholeImageHeight(6, 0.5, 0.4);
    const blurM = pinholeBlurWidth(holeM, 0.5, 0.4);
    expect(classifyBrightness(holeM)).toBe("bright");
    expect(classifySharpness(blurM, bigImageM)).toBe("sharp");
  });

  it("null või negatiivne viskab vea", () => {
    expect(() => classifyBrightness(0)).toThrow(RangeError);
    expect(() => classifyBrightness(-0.002)).toThrow(RangeError);
  });
});

describe("classifySharpness – terav või udune", () => {
  // Explore-3 seis: puu 6 m 12 m kauguselt, kamber 0,4 m, kujutis 20 cm.
  const imageM = pinholeImageHeight(6, 12, 0.4);

  it("liuguri väikseim auk annab terava kujutise", () => {
    const blurM = pinholeBlurWidth(holeDiameterFromMm(SLIDERS.holeMm.min), 12, 0.4);
    expect(classifySharpness(blurM, imageM)).toBe("sharp");
  });

  it("liuguri suurim auk annab udu, mis on üle 5% kujutise kõrgusest", () => {
    const blurM = pinholeBlurWidth(holeDiameterFromMm(SLIDERS.holeMm.max), 12, 0.4);
    // 20 mm auk määrib 20 cm kujutise serva umbes 2 cm ehk 10% ulatuses.
    expect(blurM / imageM).toBeGreaterThan(SHARP_MAX_BLUR_SHARE);
    expect(classifySharpness(blurM, imageM)).toBe("blurry");
  });

  it("ülesande 1 seis (kamber 0,2 m, auk 2 mm) ei paista udune", () => {
    // Ülesanne 1 küsib kujutise kõrgust – kui näidik ütleks seal „udune“, ajaks
    // see õpilase segadusse enne, kui augu liugur üldse avaneb.
    const taskImageM = pinholeImageHeight(6, 12, 0.2);
    const blurM = pinholeBlurWidth(holeDiameterFromMm(2), 12, 0.2);
    expect(classifySharpness(blurM, taskImageM)).toBe("sharp");
  });

  it("sama auk on suure kujutise juures terav ja väikese juures udune", () => {
    // Hägu ei sõltu kujutise suurusest – seepärast otsustab SUHE.
    const blurM = pinholeBlurWidth(holeDiameterFromMm(10), 12, 0.4);
    expect(classifySharpness(blurM, 0.2)).toBe("blurry");
    expect(classifySharpness(blurM, 2)).toBe("sharp");
  });

  it("null või negatiivne viskab vea", () => {
    expect(() => classifySharpness(0, 0.2)).toThrow(RangeError);
    expect(() => classifySharpness(0.01, 0)).toThrow(RangeError);
    expect(() => classifySharpness(-0.01, 0.2)).toThrow(RangeError);
  });
});

describe("manifest", () => {
  it("vastab moodulilepingu skeemile", () => {
    expect(() => manifestSchema.parse(manifest)).not.toThrow();
  });

  it("viitab ainekava õpitulemusele ja õpetab kaht mõistet", () => {
    expect(manifest.outcomes).toContain("P1-T2");
    expect(manifest.concepts).toEqual(["valgusvihk", "optiline keskkond"]);
    // Praktilist tööd see moodul ei kata – P1-PT1 on moodulis
    // `vari-ja-poolvari`. Katvusraport ei tohi siin rohelist näidata.
    expect(manifest.practicalWork).toEqual([]);
  });
});

describe("activities", () => {
  it("vastab moodulilepingu skeemile", () => {
    expect(() => activitiesSchema.parse(activities)).not.toThrow();
  });

  it("on väike moodul: kuus sammu, üks ekraan korraga", () => {
    // Suurusreegel (sisu/MALL-moodul.md): 3–6 sammu.
    expect(activities.steps.map((step) => step.type)).toEqual([
      "hook",
      "theory",
      "predict",
      "explore",
      "practice",
      "exit",
    ]);
  });

  it("ükski arvküsimus ei küsi kraade – arkustangensit siin ei ole", () => {
    // Vaatab NII ühikut kui ka küsimuse teksti (CodeRabbiti leid 2026-08-10):
    // „Mitu kraadi on nurk?" ilma ühikuta oleks sama viga, aga paljas
    // `unit`-kontroll laseks ta läbi.
    for (const step of activities.steps) {
      for (const question of stepQuestions(step)) {
        if (question.kind === "numeric") {
          expect(
            `${question.prompt} ${question.unit ?? ""}`.toLowerCase(),
            question.id,
          ).not.toMatch(/°|kraad/u);
        }
      }
    }
  });

  it("ükski ülesanne ei küsi hägu laiust – augu mõju on kvalitatiivne", () => {
    // Spetsifikatsioon nõuab seda otsesõnu: `pinholeBlurWidth` on
    // simulatsiooni lisanäit, mitte hinnatav suurus. Kui keegi lisab kunagi
    // arvküsimuse hägu kohta, läheb see test punaseks – ja alles siis saab
    // otsustada, kas moodul on selleks üldse õige koht.
    const blurValues = [0.002, 0.02].flatMap((holeM) =>
      [12, 40].map((distanceM) => pinholeBlurWidth(holeM, distanceM, 0.2)),
    );
    for (const step of activities.steps) {
      for (const question of stepQuestions(step)) {
        if (question.kind !== "numeric") continue;
        expect(question.prompt.toLowerCase(), question.id).not.toContain("hägu");
        for (const blurM of blurValues) {
          expect(question.answer, question.id).not.toBeCloseTo(blurM, 6);
        }
      }
    }
  });
});

/**
 * Ülesannete vastused vs. spetsifikatsioon.
 *
 * `activities.ts` arvutab iga vastuse MUDELIST (CLAUDE.md reegel 1), seega
 * valemi näpuviga siin välja ei paistaks – küll aga paistab välja vale kõrgus,
 * kaugus või kambri sügavus. Seepärast võrreldakse arve spetsifikatsiooni
 * tabeliga (sisu/MOODUL-valguse-sirgjooneline-levimine.md), mitte mudeliga
 * uuesti: see on ainus koht, kus keegi ütleb sõltumatult, MILLINE arv õpilase
 * ekraanile peab jõudma.
 */
describe("ülesannete vastused käivad spetsifikatsiooniga kokku", () => {
  const numericQuestion = (questionId: string) => {
    for (const step of activities.steps) {
      for (const question of stepQuestions(step)) {
        if (question.id === questionId && question.kind === "numeric") {
          // Variante sellel moodulil ei ole – vastus on küsimuse enda küljes.
          expect(question.variants, questionId).toBeUndefined();
          expect(question.answer, questionId).toBeDefined();
          return question;
        }
      }
    }
    throw new Error(`Arvküsimust "${questionId}" ei ole moodulis`);
  };

  it.each([
    ["explore-1", "puu kujutis (cm)", 10, 9],
    ["explore-2", "kamber 20 cm kujutise jaoks (m)", 0.4, 9],
    ["practice-1", "inimese kujutis (m)", 0.03, 9],
    ["practice-3", "Päikese laik puu all (m)", 0.046, 3],
    ["exit-2", "maja kujutis (m)", 0.05, 9],
  ])("%s (%s) → %s", (questionId, _what, expected, digits) => {
    expect(numericQuestion(questionId as string).answer).toBeCloseTo(
      expected as number,
      digits as number,
    );
  });

  it("kujutise kõrgust küsitakse simulatsioonis cm-des, arvutustes meetrites", () => {
    // Ühikud ei ole moodulis ühtlased ja see on meelega: explore-1 loeb arvu
    // EKRAANILT (näidik on sentimeetrites), ülejäänud arvküsimused annavad
    // tekstis meetrid ja paluvad tehte teha.
    const expectedUnits: Record<string, string> = {
      "explore-1": "cm",
      "explore-2": "m",
      "practice-1": "m",
      "practice-3": "m",
      "exit-2": "m",
    };
    for (const step of activities.steps) {
      for (const question of stepQuestions(step)) {
        if (question.kind !== "numeric") continue;
        expect(question.unit, question.id).toBe(expectedUnits[question.id]);
      }
    }
  });

  it("checker võtab kujutise kõrguse vastu nii sentimeetrites kui meetrites", () => {
    // Checker teisendab m ↔ cm ise (src/checker/number.ts), seega ühik küsimuse
    // juures ütleb ainult, mida ILMA ühikuta kirjutatud arv tähendab. Ekraanilt
    // loetud „10" ja peast teisendatud „0,1 m" peavad mõlemad kõlbama.
    const question = numericQuestion("explore-1");
    expect(checkNumericAnswer(question, "10").correct).toBe(true);
    expect(checkNumericAnswer(question, "10 cm").correct).toBe(true);
    expect(checkNumericAnswer(question, "0,1 m").correct).toBe(true);
    // Vale arv jääb valeks ka õiges ühikus.
    expect(checkNumericAnswer(question, "20").correct).toBe(false);
    // „0,1" ilma ühikuta tähendab 0,1 cm – see EI ole õige vastus, ja just
    // seepärast ütleb vihje, kust arvu lugeda.
    expect(checkNumericAnswer(question, "0,1").correct).toBe(false);
  });

  it("ümardatud suhtega 108 arvutatud vastus mahub Päikese laigu tolerantsi", () => {
    // Õpilane arvutab „5 / 108", vastus tuleb päris arvudest (1 392 000 km ja
    // 150 000 000 km). Kui tolerants seda vahet ei kataks, oleks vihje lõks.
    const question = numericQuestion("practice-3");
    expect(checkNumericAnswer(question, String(5 / 108).replace(".", ",")).correct).toBe(
      true,
    );
    expect(checkNumericAnswer(question, "0,046").correct).toBe(true);
    expect(checkNumericAnswer(question, "4,6 cm").correct).toBe(true);
  });

  it("explore-2 tolerants on liuguri sammust laiem", () => {
    // Kambri sügavuse liugur liigub 0,01 m kaupa. 5% vastusest 0,4 m on
    // 0,02 m ehk kaks sammu mõlemale poole – õpilane saab õigesse vahemikku.
    // Lühema kambri korral tuleks anda ABSOLUUTNE tolerants ±0,01 m.
    const question = numericQuestion("explore-2");
    const sliderStepM = SLIDERS.boxDepthM.step;
    expect(question.tolerance).toEqual({ mode: "percent", value: 5 });
    expect((question.answer as number) * 0.05).toBeGreaterThan(sliderStepM);
    expect(checkNumericAnswer(question, "0,4").correct).toBe(true);
    expect(checkNumericAnswer(question, "0,39").correct).toBe(true);
    expect(checkNumericAnswer(question, "0,2").correct).toBe(false);
  });

  it("lahendatud näidis ja kordamiskaart rc-3 ütlevad mudeliga sama arvu", () => {
    const practice = activities.steps.find((step) => step.type === "practice");
    const worked = practice?.type === "practice" ? practice.worked : undefined;
    // Küünal: 0,2 · 0,1 / 1 = 0,02 m ehk 2 cm.
    expect(worked?.answer).toContain("0,02");
    expect(worked?.answer).toContain("2 cm");
    // Puu: 6 · 0,2 / 12 = 0,1 m ehk 10 cm.
    const card = activities.reviewCards.find((item) => item.id === "rc-3");
    expect(card?.answer).toContain("0,1 m");
    expect(card?.answer).toContain("10 cm");
  });

  it("simulatsiooni ülesanded on liuguritega üldse lahendatavad", () => {
    // Kui ülesande 2 vastus jääks liuguri vahemikust välja, ei saaks õpilane
    // teda kunagi seada – ja brauseris ei paistaks see kuidagi välja.
    const depthM = numericQuestion("explore-2").answer as number;
    expect(depthM).toBeGreaterThanOrEqual(SLIDERS.boxDepthM.min);
    expect(depthM).toBeLessThanOrEqual(SLIDERS.boxDepthM.max);
    // Ülesande 1 kambri sügavus 0,2 m tuleb küsimuse tekstist, seega piisab
    // kontrollist, et ka tema on liuguriga seatav.
    expect(0.2).toBeLessThanOrEqual(SLIDERS.boxDepthM.max);
    expect(EXAMPLE_OBJECTS.puu.distanceM).toBeLessThanOrEqual(SLIDERS.distanceM.max);
  });

  it("augu liugur avaneb pärast ülesannet 2, mitte enne", () => {
    // Ülesanne 3 KÄSIB augu läbimõõtu keerata – kui lukk avaneks alles pärast
    // seda küsimust, ei saaks õpilane ülesannet üldse teha.
    const explore = activities.steps.find((step) => step.type === "explore");
    const unlocks = explore?.type === "explore" ? explore.simulation?.unlocks : undefined;
    expect(unlocks).toEqual([{ feature: "augu-labimoot", afterQuestion: "explore-2" }]);
  });
});

describe("õpetajajuhend katab mooduli väärarusaamad", () => {
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

  it("spetsifikatsiooni viis väärarusaama on kõik olemas", () => {
    for (const id of [
      "kiir-on-asi",
      "pea-peal-vajab-laatse",
      "auk-annab-augu-kuju",
      "suurem-auk-suurem-kujutis",
      "valgus-alati-sirge",
    ]) {
      expect(known, id).toContain(id);
    }
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
