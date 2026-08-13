import { describe, expect, it } from "vitest";
import { checkNumericAnswer } from "../src/checker/numeric";
import { stepQuestions } from "../src/engine/contract";
import {
  activitiesSchema,
  manifestSchema,
} from "../src/engine/contractSchema";
import { activities } from "../src/modules/physics/noguspeegel/activities";
import { manifest } from "../src/modules/physics/noguspeegel/manifest";
import { teacher } from "../src/modules/physics/noguspeegel/teacher";
import {
  MIRROR_HALF_HEIGHT_CM,
  SAFE_HEIGHT_RATIO,
  SLIDERS,
  centimetresFromMetres,
  focalLength,
  metresFromCentimetres,
  mirrorDepth,
  normalAngleDeg,
  reflectParallelRay,
} from "../src/modules/physics/noguspeegel/model";

/**
 * Nõguspeegli mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist (sisu/MOODUL-noguspeegel.md
 * „Füüsika" → testiväärtuste tabel ja aberratsioonitabel ning sammude juures
 * kirjas olevad vastused), mitte mudelist tagurpidi tuletatud – muidu testiks
 * test iseennast. Kaasa on võetud ka need arvud, mille peal moodul õpilast
 * hiljem päriselt kontrollib (simulatsiooni ülesanded, harjutused,
 * väljumispilet, kordamiskaardid) – nii selgub näpuviga siin, mitte tunnis.
 *
 * Pikkused on mudelis meetrites, nurgad kraadides.
 */

describe("focalLength – fookus on pool raadiusest", () => {
  it.each([
    [0.5, 0.25],
    [1, 0.5],
    [1.6, 0.8],
    [0.04, 0.02],
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

describe("mirrorDepth – kui sügaval on kohtumispunkt", () => {
  it.each([
    [1, 0, 0],
    [1, 0.6, 0.2],
    [1, 0.1, 0.0050126],
    [0.5, 0.1, 0.0101021],
  ])("R = %s m, h = %s m → %s m", (radiusM, heightM, expected) => {
    expect(mirrorDepth(radiusM, heightM)).toBeCloseTo(expected, 6);
  });

  it("|h| = R on poolkera: sügavus on täpselt R", () => {
    expect(mirrorDepth(0.5, 0.5)).toBeCloseTo(0.5, 9);
    expect(mirrorDepth(0.5, -0.5)).toBeCloseTo(0.5, 9);
  });

  it("negatiivne kõrgus annab sama sügavuse mis positiivne", () => {
    expect(mirrorDepth(1, -0.6)).toBeCloseTo(mirrorDepth(1, 0.6), 9);
  });

  it("kiir ei saa peeglist mööda minna: |h| > R viskab vea", () => {
    expect(() => mirrorDepth(0.5, 0.51)).toThrow(RangeError);
    expect(() => mirrorDepth(0.5, -0.51)).toThrow(RangeError);
  });

  it("vigased arvud viskavad vea", () => {
    expect(() => mirrorDepth(0, 0.1)).toThrow(RangeError);
    expect(() => mirrorDepth(1, Number.NaN)).toThrow(RangeError);
    expect(() => mirrorDepth(1, Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe("normalAngleDeg – ristsirge on raadiuse siht", () => {
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
  it("R = 1 m, h = 0,6 m: α = β = 36,870°, kalle 73,740°, lõige 0,375 m", () => {
    const ray = reflectParallelRay(1, 0.6);
    expect(ray.depthM).toBeCloseTo(0.2, 9);
    expect(ray.incidenceDeg).toBeCloseTo(36.87, 3);
    expect(ray.reflectionDeg).toBeCloseTo(36.87, 3);
    expect(ray.deflectionDeg).toBeCloseTo(73.74, 3);
    // Täpne arv: 3-4-5 kolmnurk annab siin murruna 0,375.
    expect(ray.axisCrossM).toBeCloseTo(0.375, 9);
  });

  it("R = 1 m, h = 0,1 m: α = β = 5,739°, kalle 11,478°, lõige 0,49748 m", () => {
    const ray = reflectParallelRay(1, 0.1);
    expect(ray.incidenceDeg).toBeCloseTo(5.739, 3);
    expect(ray.deflectionDeg).toBeCloseTo(11.478, 3);
    expect(ray.axisCrossM).toBeCloseTo(0.49748, 4);
  });

  it("R = 0,5 m, h = 0,1 m: α = β = 11,537°, kalle 23,074°, lõige 0,24484 m", () => {
    const ray = reflectParallelRay(0.5, 0.1);
    expect(ray.incidenceDeg).toBeCloseTo(11.537, 3);
    expect(ray.deflectionDeg).toBeCloseTo(23.074, 3);
    expect(ray.axisCrossM).toBeCloseTo(0.24484, 4);
  });

  it("h = 0 on kokkulepe: piirväärtus on täpselt fookus R/2", () => {
    const ray = reflectParallelRay(1, 0);
    expect(ray.depthM).toBeCloseTo(0, 9);
    expect(ray.incidenceDeg).toBeCloseTo(0, 9);
    expect(ray.deflectionDeg).toBeCloseTo(0, 9);
    expect(ray.axisCrossM).toBeCloseTo(focalLength(1), 9);
  });

  it("peegli serv (|h| = R) viskab vea, ei tagasta lõpmatust", () => {
    expect(() => reflectParallelRay(0.5, 0.5)).toThrow(RangeError);
    expect(() => reflectParallelRay(0.5, -0.5)).toThrow(RangeError);
    expect(() => reflectParallelRay(1, 1)).toThrow(RangeError);
  });

  it("vigased arvud viskavad vea", () => {
    expect(() => reflectParallelRay(-1, 0.1)).toThrow(RangeError);
    expect(() => reflectParallelRay(1, Number.NaN)).toThrow(RangeError);
  });
});

/**
 * Codexi leid (samm 4.1ii): lõplikest sisenditest võib tulla NaN või
 * lõpmatus, ja see jõuaks joonisele vaikselt vale füüsikana. Mudel viskab
 * sellises kohas vea, ei tagasta arvu, mille taga ta seista ei saa.
 */
describe("ülevool ei tohi anda vaikset NaN-i", () => {
  it("mirrorDepth: R² ja h² voolavad üle, vahe oleks NaN", () => {
    expect(() => mirrorDepth(1e308, 1e307)).toThrow(RangeError);
  });

  it("normalAngleDeg: sama sisend annab ausa nurga, mitte NaN-i", () => {
    // Siin ülevoolu ei teki (jagatis |h|/R jääb alla ühe), seega on ainus
    // õige käitumine päris vastus – test hoiab selle vahe nähtaval.
    expect(normalAngleDeg(1e308, 1e307)).toBeCloseTo(
      normalAngleDeg(1, 0.1),
      9,
    );
  });

  it("reflectParallelRay: teljelõige voolaks serva lähedal üle", () => {
    expect(() => reflectParallelRay(1e308, 1e308 * (1 - 1e-15))).toThrow(
      RangeError,
    );
  });

  it("tavalised suured, aga mõistlikud arvud jäävad tööle", () => {
    // Peegelteleskoobi mõõtu peegel (R = 20 m) ei tohi kontrollide taha jääda.
    // f = 10 m, aberratsioon h/R = 0,05 juures on ~0,13 % → 9,98748 m.
    expect(reflectParallelRay(20, 1).axisCrossM).toBeCloseTo(9.98748, 4);
  });
});

/**
 * Kümme raadiust × kümme kõrgust – need paarid katavad nii lameda kui ka
 * sügava peegli ja neid kasutavad kõik allpool olevad seaduspärade testid.
 * h püsib alati rangelt alla R (peegli serv on eraldi kontrollitud).
 */
const RADII_M = [0.1, 0.25, 0.4, 0.5, 0.75, 1, 1.2, 1.6, 2, 5];
const HEIGHT_RATIOS = [0, 0.05, 0.1, 0.2, 0.3, 0.45, 0.6, 0.75, 0.9, 0.99];

describe("peegeldumisseadus on invariant, mitte üks testirida", () => {
  it("α = β ja kalle = 2α iga R ja h korral", () => {
    for (const radiusM of RADII_M) {
      for (const ratio of HEIGHT_RATIOS) {
        const heightM = ratio * radiusM;
        const ray = reflectParallelRay(radiusM, heightM);
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
    expect(big.axisCrossM).toBeCloseTo(2 * small.axisCrossM, 9);
    expect(big.depthM).toBeCloseTo(2 * small.depthM, 9);
    // Nurgad on mõõtkavast SÕLTUMATUD – need ei kahekordistu.
    expect(big.incidenceDeg).toBeCloseTo(small.incidenceDeg, 9);
  });

  it("kaks korda suurem peegel iga R ja h korral", () => {
    for (const radiusM of RADII_M) {
      for (const ratio of HEIGHT_RATIOS) {
        const heightM = ratio * radiusM;
        expect(reflectParallelRay(2 * radiusM, 2 * heightM).axisCrossM).toBeCloseTo(
          2 * reflectParallelRay(radiusM, heightM).axisCrossM,
          9,
        );
      }
    }
  });
});

describe("sfääriline aberratsioon on ühesuunaline ja monotoonne", () => {
  it("lõikepunkt ei ole kunagi fookusest kaugemal", () => {
    for (const radiusM of RADII_M) {
      for (const ratio of HEIGHT_RATIOS) {
        const ray = reflectParallelRay(radiusM, ratio * radiusM);
        expect(ray.axisCrossM).toBeLessThanOrEqual(focalLength(radiusM) + 1e-12);
      }
    }
  });

  it("|h| kasvades lõikepunkt ainult läheneb peeglile", () => {
    for (const radiusM of RADII_M) {
      let previous = Number.POSITIVE_INFINITY;
      for (let ratio = 0; ratio <= 0.99; ratio += 0.01) {
        const current = reflectParallelRay(radiusM, ratio * radiusM).axisCrossM;
        expect(current).toBeLessThanOrEqual(previous);
        previous = current;
      }
    }
  });

  it("aberratsioonitabel spetsifikatsioonist", () => {
    expect(reflectParallelRay(1, 0).axisCrossM).toBeCloseTo(0.5, 9);
    expect(reflectParallelRay(1, 0.1).axisCrossM).toBeCloseTo(0.49748, 4);
    expect(reflectParallelRay(0.5, 0.1).axisCrossM).toBeCloseTo(0.24484, 4);
    expect(reflectParallelRay(1, 0.6).axisCrossM).toBeCloseTo(0.375, 9);
  });
});

describe("simulatsiooni turvavöönd hoiab lauset „koonduvad ühte punkti“", () => {
  it("h/R ≤ 0,2 korral on erinevus fookusest alla 3 %", () => {
    for (const radiusM of RADII_M) {
      for (let ratio = 0; ratio <= SAFE_HEIGHT_RATIO + 1e-12; ratio += 0.01) {
        const focusM = focalLength(radiusM);
        const crossM = reflectParallelRay(radiusM, ratio * radiusM).axisCrossM;
        expect(Math.abs(focusM - crossM) / focusM).toBeLessThan(0.03);
      }
    }
  });

  it("liugurite piirid jäävad turvavööndisse", () => {
    // Halvim juht: kõige kõrgem kiir kõige väiksema raadiusega peeglil.
    const worstRatio =
      SLIDERS.rayHeightCm.max / SLIDERS.radiusCm.min;
    expect(worstRatio).toBeLessThanOrEqual(SAFE_HEIGHT_RATIO);
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
      const crossM = reflectParallelRay(radiusM, heightM).axisCrossM;
      expect(Math.abs(focusM - crossM) / focusM).toBeLessThan(0.03);
    }
  });
});

describe("ühikuteisendused – ainsad kaks kohta, kus ühik muutub", () => {
  it.each([
    [100, 1],
    [50, 0.5],
    [10, 0.1],
    [0, 0],
    [-10, -0.1],
  ])("%s cm → %s m", (lengthCm, expected) => {
    expect(metresFromCentimetres(lengthCm)).toBeCloseTo(expected, 9);
  });

  it.each([
    [1, 100],
    [0.25, 25],
    [0.02, 2],
  ])("%s m → %s cm", (lengthM, expected) => {
    expect(centimetresFromMetres(lengthM)).toBeCloseTo(expected, 9);
  });

  it("teisendus edasi-tagasi annab sama arvu", () => {
    for (const lengthCm of [0, 1, 10, 50, 160, 200]) {
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
});

/**
 * Need on arvud, mida moodul õpilaselt päriselt küsib. Kui mudel ja
 * spetsifikatsioon lähevad lahku, peab see selguma siin – mitte tunnis.
 * Õpilase pool räägib sentimeetrites, seega käib iga arv läbi teisenduse.
 */
describe("õpilase arvud tulevad mudelist", () => {
  function focusCm(radiusCm: number): number {
    return centimetresFromMetres(focalLength(metresFromCentimetres(radiusCm)));
  }

  it.each([
    ["explore-1: R = 100 cm", 100, 50],
    ["explore-2: R = 160 cm", 160, 80],
    ["teooria näide: R = 80 cm", 80, 40],
    ["practice näidis: R = 60 cm", 60, 30],
    ["practice-1 lünk: R = 90 cm", 90, 45],
    ["exit-2: R = 24 cm", 24, 12],
    ["rc-3: R = 70 cm", 70, 35],
  ])("%s → fookus %s cm", (_nimi, radiusCm, expected) => {
    expect(focusCm(radiusCm)).toBeCloseTo(expected, 9);
  });

  it("practice-2 pöördülesanne: fookus 2 cm → raadius 4 cm", () => {
    // Pöördülesandel ei ole oma funktsiooni (R = 2f on sama valem tagurpidi);
    // test kontrollib, et vastus 4 cm on mudeliga kooskõlas.
    expect(focusCm(4)).toBeCloseTo(2, 9);
  });

  it("explore-3: kiire kõrgusel 10 cm on α = β ja ekraanil 5,7°", () => {
    const ray = reflectParallelRay(
      metresFromCentimetres(100),
      metresFromCentimetres(10),
    );
    expect(ray.incidenceDeg).toBe(ray.reflectionDeg);
    // Ekraanil kuvatakse üks koht pärast koma (tolerants 0,5°).
    expect(ray.incidenceDeg).toBeCloseTo(5.7, 1);
  });

  it("simulatsiooni algseis: R = 100 cm → fookus 50 cm, tolerants 2 cm katab", () => {
    expect(Math.abs(focusCm(100) - 50)).toBeLessThan(2);
  });
});

// ---------------------------------------------------------------------------
// Samm 4.1jj: manifest, sammud, õpetajajuhend, joonised
// ---------------------------------------------------------------------------

describe("manifest", () => {
  it("vastab moodulilepingu skeemile", () => {
    expect(() => manifestSchema.parse(manifest)).not.toThrow();
  });

  it("viitab õpitulemusele P1-T2 ega võta endale praktilist tööd", () => {
    // P1 neli praktilist tööd on juba teiste moodulite all. Õpetajajuhendi
    // kaks klassikatset ei ole ainekava praktilised tööd.
    expect(manifest.outcomes).toEqual(["P1-T2"]);
    expect(manifest.practicalWork).toEqual([]);
  });

  it("õpetab ainekava P1 põhimõisteid nõguspeegel ja fookus", () => {
    expect(manifest.concepts).toEqual(["nõguspeegel", "fookus"]);
  });

  it("ei nimeta P2 mõisteid – muidu näitaks katvusraport läätsi kaetuna", () => {
    // Katvusraport võrdleb mõisteid NIME järgi üle kogu ainekava (samm 4.0),
    // seega „fookuskaugus" siin muudaks P1 mooduli vaikselt P2 katteks.
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
    expect(figures).toEqual(["np-taskulamp", "np-ristsirge", "np-kolm-kiirt"]);
  });

  it("suunalüliti avaneb alles pärast kolmandat ülesannet", () => {
    // Enne seda on korraga muudetavaid suurusi kaks (raadius ja kiire kõrgus),
    // mitte kolm – moodulileping nõuab alguses maksimaalselt kaht.
    const explore = activities.steps.find((step) => step.type === "explore");
    const simulation = explore?.type === "explore" ? explore.simulation : undefined;
    expect(simulation?.unlocks).toEqual([
      { feature: "suuna-lyliti", afterQuestion: "explore-3" },
    ]);
  });

  it("õpilase pool ei ületa mooduli piire: ei kujutist ega fookuskaugust", () => {
    // sisu/MOODUL-noguspeegel.md „Piirid": kujutise konstrueerimine on ainekavas
    // läätsede juures (P2) ja sõna „fookuskaugus" on P2 põhimõiste. Kui nad
    // siia sisse hiilivad, õpetab moodul vaikselt järgmise ploki sisu.
    const texts: string[] = [];
    for (const step of activities.steps) {
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
    const all = texts.join(" ");
    expect(all).not.toContain("fookuskaugus");
    expect(all).not.toContain("kujutis");
  });
});

/**
 * Ülesannete vastused vs. mudel.
 *
 * `activities.ts` võtab iga fookuse kauguse MUDELIST (CLAUDE.md reegel 1),
 * seega näpuviga arvutuses siin välja ei paistaks – küll aga paistab välja vale
 * raadius, vale ühik või vale tolerants. Seepärast on ootus kirjutatud
 * SPETSIFIKATSIOONI järgi (sisu/MOODUL-noguspeegel.md „Sammud").
 */
describe("ülesannete vastused käivad spetsifikatsiooniga kokku", () => {
  const numericQuestion = (questionId: string) => {
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
  };

  const choiceQuestion = (questionId: string) => {
    for (const step of activities.steps) {
      for (const question of stepQuestions(step)) {
        if (question.id === questionId && question.kind === "choice") return question;
      }
    }
    throw new Error(`Valikküsimust "${questionId}" ei ole moodulis`);
  };

  it.each([
    ["explore-1", 50],
    ["explore-2", 80],
    ["practice-1", 45],
    ["practice-2", 4],
    ["exit-2", 12],
  ])("%s vastus on %s cm", (questionId, expected) => {
    const question = numericQuestion(questionId);
    expect(question.answer).toBeCloseTo(expected, 9);
    // Kauguse ühik on õpilase poolel ALATI cm (8. klassi õige ühik).
    expect(question.unit).toBe("cm");
  });

  it("simulatsiooni ülesannetel on lugemistolerants 2 cm, arvutatutel 0,5 cm", () => {
    for (const id of ["explore-1", "explore-2"]) {
      expect(numericQuestion(id).tolerance, id).toEqual({
        mode: "absolute",
        value: 2,
      });
    }
    for (const id of ["practice-1", "practice-2", "exit-2"]) {
      expect(numericQuestion(id).tolerance, id).toEqual({
        mode: "absolute",
        value: 0.5,
      });
    }
  });

  it("lugemistolerants lubab lugemisvea, aga ei lase naaberväärtust õigeks", () => {
    // Liuguri samm on 10 cm ja fookus liigub 5 cm kaupa: raadius 110 cm annaks
    // fookuse 55 cm. See ei tohi 100 cm juures õige olla.
    const question = numericQuestion("explore-1");
    expect(checkNumericAnswer(question, "50").correct).toBe(true);
    expect(checkNumericAnswer(question, "51,5").correct).toBe(true);
    expect(checkNumericAnswer(question, "55").correct).toBe(false);
    expect(checkNumericAnswer(question, "45").correct).toBe(false);
  });

  it("meetrites kirjutatud vastus loetakse samuti õigeks", () => {
    // Checker teisendab ühikuperekonna sees (src/checker/number.ts) – õpilast
    // ei tohi lukku jätta sellepärast, et ta kirjutas 0,5 m.
    expect(checkNumericAnswer(numericQuestion("explore-1"), "0,5 m").correct).toBe(
      true,
    );
  });

  it("arvutatud vastustel läheb täisarv kõrvalt valeks", () => {
    for (const [id, answer] of [
      ["practice-1", 45],
      ["practice-2", 4],
      ["exit-2", 12],
    ] as const) {
      const question = numericQuestion(id);
      expect(checkNumericAnswer(question, String(answer)).correct, id).toBe(true);
      expect(checkNumericAnswer(question, String(answer - 1)).correct, id).toBe(
        false,
      );
      expect(checkNumericAnswer(question, String(answer + 1)).correct, id).toBe(
        false,
      );
    }
  });

  it("explore-3 õige vastus on sama suur nurk ja ta kannab mudeli arvu", () => {
    const question = choiceQuestion("explore-3");
    const correct = question.options.filter((option) => option.correct);
    expect(correct.map((option) => option.id)).toEqual(["sama"]);
    // Nurk tuleb mudelist: R = 100 cm ja h = 10 cm annavad 5,7°.
    expect(correct[0].text).toContain("5,7°");
  });

  it("explore-3 ütleb raadiuse uuesti – eelmine ülesanne jättis liuguri 160 cm peale", () => {
    // CodeRabbiti leid (samm 4.1nn, kumerpeegel): vastusevariandi nurk kehtib
    // ainult 100 cm juures. 160 cm peal näitaks ekraan teist arvu ja õpilane
    // loeks variandist 5,7°.
    const prompt = choiceQuestion("explore-3").prompt;
    expect(prompt).toContain("100 cm");
    const shown = reflectParallelRay(
      metresFromCentimetres(100),
      metresFromCentimetres(MIRROR_HALF_HEIGHT_CM),
    );
    expect(shown.incidenceDeg).toBeCloseTo(5.739, 3);
    // Sama seis 160 cm juures annaks päris teise arvu – just see vahe oli viga.
    const flat = reflectParallelRay(
      metresFromCentimetres(160),
      metresFromCentimetres(MIRROR_HALF_HEIGHT_CM),
    );
    expect(Math.abs(flat.incidenceDeg - shown.incidenceDeg)).toBeGreaterThan(0.5);
  });

  it("practice-3 õige punkt on B ja punktide järjekorda ei segata", () => {
    const question = choiceQuestion("practice-3");
    expect(question.shuffle).toBe(false);
    expect(question.options.map((option) => option.id)).toEqual(["a", "b", "c"]);
    expect(question.options.filter((option) => option.correct)[0].id).toBe("b");
  });

  it("practice-4 ülekandeülesandel on kolm õiget väidet", () => {
    const question = choiceQuestion("practice-4");
    expect(question.multiple).toBe(true);
    expect(question.options.filter((option) => option.correct)).toHaveLength(3);
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

  it("spetsifikatsiooni kuus väärarusaama on kõik olemas", () => {
    for (const id of [
      "koveral-seadus-ei-kehti",
      "fookus-on-peegli-peal",
      "fookus-soltub-peegli-suurusest",
      "lamedam-koondab-lahemale",
      "fookus-on-kera-keskpunkt",
      "peegel-teeb-valgust-juurde",
    ]) {
      expect(known, id).toContain(id);
    }
  });

  it("ohutus ütleb välja, et fookuses läheb paber põlema", () => {
    // Selle mooduli kõige tähtsam lause: lusikas on igal koolilapsel käepärast
    // ja Päikese koondamist proovitakse ise järele.
    expect(teacher.safety).toContain("põlema");
    expect(teacher.safety).toContain("Päikest ennast ei vaadata");
  });

  it("õpetaja saab teada, miks päris peegel ei ole kerapind", () => {
    // model.ts idealiseering 1 – UI seda päris füüsikana esitada ei tohi.
    expect(teacher.whyRealDiffers).toContain("parabool");
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
