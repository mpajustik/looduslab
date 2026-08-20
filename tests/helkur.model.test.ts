import { describe, expect, it } from "vitest";
import { deviationDeg as cornerDeviationDeg } from "../src/modules/physics/nurkpeegel/model";
import {
  SLIDERS,
  angleFromOffsetDeg,
  offsetAtDistanceM,
  retroreflectionGain,
  returnDeviationDeg,
} from "../src/modules/physics/helkur/model";
import { activities } from "../src/modules/physics/helkur/activities";
import { manifest } from "../src/modules/physics/helkur/manifest";
import { teacher } from "../src/modules/physics/helkur/teacher";
import {
  activitiesSchema,
  manifestSchema,
} from "../src/engine/contractSchema";
import { stepQuestions } from "../src/engine/contract";

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

// ---------------------------------------------------------------------------
// Mooduli sisu: manifest, sammud, õpetajajuhend (samm 4.1ggg)
// ---------------------------------------------------------------------------

describe("manifest", () => {
  it("vastab moodulilepingu skeemile", () => {
    expect(() => manifestSchema.parse(manifest)).not.toThrow();
  });

  it("viitab õpitulemusele P1-T2 ega võta endale praktilist tööd", () => {
    // Uut seadust ei tule ja P1-PT1…PT4 on kõik teiste moodulite all: pime
    // klass taskulambiga on demonstratsioon, mitte ainekava praktiline töö.
    expect(manifest.outcomes).toEqual(["P1-T2"]);
    expect(manifest.practicalWork).toEqual([]);
  });

  it("ei võta endale teiste moodulite ainekava põhimõisteid", () => {
    // `tasapeegel`, `mattpind` ja `valguskiir` kuuluvad moodulile
    // peegeldumisseadus, `nurkpeegel` moodulile nurkpeegel. Katvusraport
    // võrdleb mõisteid NIME järgi, seega on „helkur" ja „tagasipeegeldumine"
    // tema jaoks tundmatud nimed ja lähevad õigesti märkuseks (extraConcepts).
    expect(manifest.concepts).toEqual(["helkur", "tagasipeegeldumine"]);
    for (const concept of manifest.concepts) {
      for (const owned of [
        "tasapeegel",
        "mattpind",
        "valguskiir",
        "valgusvihk",
        "nurkpeegel",
        "kumerpeegel",
        "nõguspeegel",
      ]) {
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
      if (question.kind === "numeric") {
        texts.push(...(question.traps ?? []).map((trap) => trap.feedback));
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
    expect(figures).toEqual(["hl-kaks-jalakaijat", "hl-kolm-pinda"]);
  });

  it("explore't ei lukusta ükski lisavõimalus", () => {
    // Liugureid on täpselt kaks (moodulileping: korraga max 2 muudetavat
    // suurust), seega ei ole midagi hiljem avada – `simulation` puudub
    // meelega, mitte kogemata.
    const explore = activities.steps.find((step) => step.type === "explore");
    expect(explore?.type).toBe("explore");
    if (explore?.type !== "explore") return;
    expect(explore.simulation).toBeUndefined();
  });

  it("õpilase pool ei ületa mooduli piire", () => {
    // sisu/MOODUL-helkur.md „Piirid": murdumine ja prisma on ploki P2 oma,
    // pidurdusteekond ploki P3 oma, fotomeetria ühikuid siin ei ole. Kõik need
    // on õpetajajuhendis olemas, aga õpilase ekraanile nad ei jõua.
    const all = studentTexts().join(" ").toLowerCase();
    for (const forbidden of [
      "murdumi",
      "prisma",
      "pidurdus",
      "peatumis",
      "kandela",
      "luks",
      "steradiaan",
    ]) {
      expect(all, forbidden).not.toContain(forbidden);
    }
  });

  it("iga arvküsimus kannab õiget ühikut ja lugemistolerantsi", () => {
    // Meetrid, kraadid ja ühikuta suhtarv – täpselt nii, nagu mudel neid annab.
    // Ühikuteisendusi selles moodulis ei ole (sisu/MOODUL-helkur.md „Füüsika").
    const expected: Record<string, { unit?: string; tolerance: number }> = {
      "explore-1": { unit: "m", tolerance: 0.3 },
      "explore-3": { unit: "°", tolerance: 0.05 },
      "explore-4": { tolerance: 300 },
      "practice-1": { tolerance: 10000 },
      "exit-2": { unit: "m", tolerance: 0.5 },
    };
    const seen: string[] = [];
    for (const step of activities.steps) {
      for (const question of stepQuestions(step)) {
        if (question.kind !== "numeric") continue;
        seen.push(question.id);
        const rule = expected[question.id];
        expect(rule, question.id).toBeDefined();
        expect(question.unit, question.id).toBe(rule.unit);
        expect(question.tolerance, question.id).toEqual({
          mode: "absolute",
          value: rule.tolerance,
        });
      }
    }
    expect(seen).toEqual(Object.keys(expected));
  });
});

/**
 * Ülesannete vastused vs. mudel.
 *
 * `activities.ts` võtab iga plekki, nurga ja võimenduse MUDELIST (CLAUDE.md
 * reegel 1), seega näpuviga arvutuses siin välja ei paistaks – küll aga paistab
 * välja vale liuguriseis, vale ühik või vale tolerants. Seepärast on ootus
 * kirjutatud SPETSIFIKATSIOONI järgi (sisu/MOODUL-helkur.md „Sammud").
 */
describe("ülesannete vastused käivad spetsifikatsiooniga kokku", () => {
  it("explore-1: algseisus on plekk auto juures 1,7 m lai", () => {
    // Plekki LÄBIMÕÕT on kaks korda koonuse raadius.
    expect(numericQuestion("explore-1").answer).toBeCloseTo(
      2 * offsetAtDistanceM(0.5, 100),
      12,
    );
    expect(numericQuestion("explore-1").answer).toBeCloseTo(1.7453736, 6);
  });

  it("explore-2 võrdleb silmadeni ulatumist plekki RAADIUSE järgi", () => {
    // Plekk on tulede ÜMBER, seega otsustab silmadeni ulatumise tema RAADIUS:
    // valgus jõuab silma alles siis, kui raadius ületab 0,5 m ehk läbimõõt on
    // vähemalt 1,0 m. Kõige kitsamas seisus on raadius 0,17 m (läbimõõt
    // 0,35 m) – seega ei ulatu. Läbimõõdu otse 0,5 m-ga võrdlemine annaks siin
    // juhuslikult õige vastuse, aga õpetaks kaks korda vale reegli.
    const narrowRadiusM = offsetAtDistanceM(0.1, 100);
    const narrowSpotM = 2 * narrowRadiusM;
    expect(narrowSpotM).toBeCloseTo(0.34906620, 7);
    expect(narrowRadiusM).toBeLessThan(0.5);
    expect(narrowSpotM).toBeLessThan(2 * 0.5);
    const question = choiceQuestion("explore-2");
    const correct = question.options.find((option) => option.correct);
    // Ekraanil olev läbimõõt ja nõutav läbimõõt on mõlemad vastuses väljas.
    expect(correct?.text).toContain("0,3");
    expect(correct?.text).toContain("1,0");
    expect(correct?.text).toContain("0,5");
    // Vihje ei tohi käskida läbimõõtu otse kõrvalekaldega võrrelda.
    expect(question.hints?.join(" ")).toContain("1,0");
  });

  it("explore-3: 20 m kaugusel paistavad silmad 1,43° kõrval", () => {
    expect(numericQuestion("explore-3").answer).toBeCloseTo(
      angleFromOffsetDeg(0.5, 20),
      12,
    );
    expect(numericQuestion("explore-3").answer).toBeCloseTo(1.4320962, 6);
  });

  it("explore-4: kõige laiem koonus annab veel üle tuhande korra", () => {
    expect(numericQuestion("explore-4").answer).toBeCloseTo(
      retroreflectionGain(2),
      9,
    );
    expect(numericQuestion("explore-4").answer).toBeCloseTo(1641.5699, 3);
  });

  it("practice-1: poole kitsam koonus annab neli korda suurema võimenduse", () => {
    const answer = numericQuestion("practice-1").answer ?? Number.NaN;
    expect(answer).toBeCloseTo(retroreflectionGain(0.25), 6);
    expect(answer).toBeCloseTo(105049.97, 1);
    // Ülesande tekst ütleb „26 000 · 4" – tolerants peab selle katma.
    expect(Math.abs(answer - 4 * 26000)).toBeLessThan(10000);
  });

  it("exit-2: kraad vormis annab 100 m peal 3,5 m", () => {
    expect(returnDeviationDeg(91)).toBe(2);
    expect(numericQuestion("exit-2").answer).toBeCloseTo(
      offsetAtDistanceM(2, 100),
      12,
    );
    expect(numericQuestion("exit-2").answer).toBeCloseTo(3.4920769, 6);
  });

  it("exit-2 lõks püüab kahekordistamata vastuse ja jääb tolerantsist välja", () => {
    // Kes arvutab 100 · tan 1° (peeglite nurgaviga ilma kahekordistamiseta),
    // saab just selle tagasiside – mitte üldise „vale".
    const question = numericQuestion("exit-2");
    const trap = question.traps?.[0];
    expect(trap?.answer).toBeCloseTo(offsetAtDistanceM(1, 100), 12);
    expect(trap?.misconception).toBe("viga-ei-kahekordistu");
    const answer = question.answer ?? Number.NaN;
    expect(Math.abs(answer - (trap?.answer ?? 0))).toBeGreaterThan(
      question.tolerance.value * 2,
    );
  });

  it("explore-3 ja explore-4 lõksud on eristatavad õigest vastusest", () => {
    for (const id of ["explore-3", "explore-4"]) {
      const question = numericQuestion(id);
      const trap = question.traps?.[0];
      expect(trap, id).toBeDefined();
      const answer = question.answer ?? Number.NaN;
      expect(
        Math.abs(answer - (trap?.answer ?? 0)),
        id,
      ).toBeGreaterThan(question.tolerance.value * 2);
    }
  });

  it("predict-1 õige vastus on helkur ja mõlemad valed on nimetatud", () => {
    const question = choiceQuestion("predict-1");
    const correct = question.options.filter((option) => option.correct);
    expect(correct).toHaveLength(1);
    expect(correct[0].id).toBe("helkur");
    expect(
      question.options
        .filter((option) => !option.correct)
        .map((option) => option.misconception),
    ).toEqual(["peegel-on-parem", "valge-on-parem"]);
  });

  it("practice-4 ülekandeülesandel on kolm õiget ja kaks valet peeglit", () => {
    const question = choiceQuestion("practice-4");
    expect(question.multiple).toBe(true);
    expect(question.shuffle).toBe(true);
    expect(question.options.filter((option) => option.correct)).toHaveLength(3);
    for (const wrongId of ["turvapeegel", "periskoop"]) {
      const option = question.options.find((item) => item.id === wrongId);
      expect(option?.misconception, wrongId).toBe("koik-peeglid-on-samad");
    }
  });

  it("exit-1 vale variant „tugevalt läikiv\" on meelega sildita", () => {
    // Läikivus ei ole ükski mooduli väärarusaamadest – vale sildi all jõuaks
    // õpetaja koondvaatesse väärarusaam, mida õpilasel ei olnud.
    const option = choiceQuestion("exit-1").options.find(
      (item) => item.id === "laikiv",
    );
    expect(option?.correct).toBe(false);
    expect(option?.misconception).toBeUndefined();
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
      "peegel-on-parem",
      "valge-on-parem",
      "helkur-teeb-valgust",
      "tapsem-on-parem",
      "tagasi-tahendab-silma",
      "nurgaviga-ei-loe",
      "viga-ei-kahekordistu",
      "kaugus-maarab-koik",
      "helkur-vajab-liikumist",
      "koik-peeglid-on-samad",
    ]) {
      expect(known, id).toContain(id);
    }
  });

  it("ohutus ütleb välja, et laserit siin EI kasutata", () => {
    // Helkur saadab kiire tagasi täpselt sinna, kust ta tuli – laserosuti
    // korral hoidja enda silmadesse. Katse tehakse taskulambiga.
    expect(teacher.safety).toContain("Laserosutit");
    expect(teacher.safety).toContain("ei kasutata");
    expect(teacher.safety).toContain("Taskulamp");
  });

  it("õpetaja saab teada, miks päris helkur simulatsioonist erineb", () => {
    // model.ts idealiseeringud 1–3 ja 6 – UI ei tohi neid päris füüsikana
    // esitada.
    expect(teacher.whyRealDiffers).toContain("kuubinurkadest");
    expect(teacher.whyRealDiffers).toContain("5 %");
    expect(teacher.whyRealDiffers).toContain("SUURUSJÄRK");
  });

  it("pimeda klassi katse tehakse kaks korda, kaks eri lambihoidjaga", () => {
    // Just see vahe ongi kogu moodul: loeb, kus on VAATAJA valgusallika suhtes.
    const steps = teacher.darkRoomActivity.join(" ").toLowerCase();
    expect(steps).toContain("otsaesise");
    expect(steps).toContain("kõrvalseisjale");
  });

  it("prismade jutt jääb õpetajajuhendisse ja viitab plokile P2", () => {
    expect(teacher.whyPrism).toContain("P2");
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
