import { describe, expect, it } from "vitest";
import { stepQuestions } from "../src/engine/contract";
import { activitiesSchema } from "../src/engine/contractSchema";
import { activities } from "../src/modules/physics/lambivalik/activities";
import { manifest } from "../src/modules/physics/lambivalik/manifest";
import { teacher } from "../src/modules/physics/lambivalik/teacher";
import {
  AREA_MAX_M2,
  AREA_MIN_M2,
  DENSITY_MAX_LM_PER_M2,
  DENSITY_MIN_LM_PER_M2,
  KELVIN_MAX,
  KELVIN_MIN,
  MAX_EFFICACY_LM_PER_W,
  NEUTRAL_MAX_K,
  SLIDERS,
  WARM_MAX_K,
  classifyColorTemperature,
  luminousEfficacy,
  powerForLumens,
  requiredLumens,
} from "../src/modules/physics/lambivalik/model";

/**
 * Lambivaliku mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist (sisu/MOODUL-lambivalik.md „Füüsika
 * (model.ts jaoks)" → testiväärtuste tabel ning piirjuhud ja invariandid),
 * mitte mudelist tagurpidi tuletatud – muidu testiks test iseennast.
 *
 * Ühikud: valgusvoog lm, võimsus W, viljakus lm/W, värvustemperatuur K,
 * pindala m². Ühikuteisendusi selles moodulis ei ole – kõik arvud on need, mis
 * seisavad lambipakendil.
 */

/**
 * Teooria lambitabel (sisu/MOODUL-lambivalik.md samm 2).
 *
 * Arvud on tahtlikult valitud nii, et jagatis tuleb TÄISARV – ekraanil ei tohi
 * seista „11,999999". Tabel on nii teoorias, simulatsioonis kui ülesannetes;
 * kui keegi muudab kunagi ühte arvu, peab kukkuma test, mitte ekraanile ilmuma
 * vale jagatis.
 */
const LAMP_TABLE = [
  { nimi: "hõõglamp", powerW: 60, lumensLm: 720, efficacyLmPerW: 12 },
  { nimi: "halogeenlamp", powerW: 42, lumensLm: 630, efficacyLmPerW: 15 },
  { nimi: "säästulamp", powerW: 15, lumensLm: 810, efficacyLmPerW: 54 },
  { nimi: "LED-lamp", powerW: 8, lumensLm: 800, efficacyLmPerW: 100 },
] as const;

/** Kogu valgusvoo liuguri võre: 200…3000 lm sammuga 100 lm. */
const LUMENS_GRID: number[] = [];
for (
  let lumensLm = SLIDERS.lumensLm.min;
  lumensLm <= SLIDERS.lumensLm.max;
  lumensLm += SLIDERS.lumensLm.step
) {
  LUMENS_GRID.push(lumensLm);
}

/** Kogu värvustemperatuuri liuguri võre: 2200…6500 K sammuga 100 K. */
const KELVIN_GRID: number[] = [];
for (
  let kelvin = SLIDERS.kelvin.min;
  kelvin <= SLIDERS.kelvin.max;
  kelvin += SLIDERS.kelvin.step
) {
  KELVIN_GRID.push(kelvin);
}

describe("luminousEfficacy – mitu luumenit ühest vatist", () => {
  it.each([
    // Hõõglamp – soojuslik allikas, enamik energiast läheb soojuseks.
    [720, 60, 12],
    // Halogeen – veidi parem hõõglamp.
    [630, 42, 15],
    // Säästulamp – külm allikas, aga vanema tehnoloogiaga.
    [810, 15, 54],
    // LED – külm allikas.
    [800, 8, 100],
  ])("Φ = %s lm, P = %s W → %s lm/W", (lumensLm, powerW, expected) => {
    expect(luminousEfficacy(lumensLm, powerW)).toBeCloseTo(expected, 12);
  });

  /**
   * Tabeli arvud peavad tulema TÄPSELT täisarvudena, mitte „umbes".
   * `toBeCloseTo` lubaks siin 11,9999999 – tabelis on 12.
   */
  it.each(LAMP_TABLE)(
    "$nimi: $lumensLm lm / $powerW W = $efficacyLmPerW lm/W täpselt",
    ({ lumensLm, powerW, efficacyLmPerW }) => {
      expect(luminousEfficacy(lumensLm, powerW)).toBe(efficacyLmPerW);
    },
  );

  /**
   * Mooduli keskne väide (teooria + practice-1): LED teeb samast elektrist
   * umbes kaheksa korda rohkem valgust. See peab olema arvudes kinni, mitte
   * ainult tekstis.
   */
  it("LED on hõõglambist umbes 8 korda viljakam", () => {
    const incandescent = luminousEfficacy(720, 60);
    const led = luminousEfficacy(800, 8);
    const ratio = led / incandescent;

    expect(ratio).toBeGreaterThanOrEqual(8);
    expect(ratio).toBeLessThanOrEqual(9);
  });

  /**
   * Viljakus on lambitüübi omadus, mitte lampide arvu oma: kaks 8 W LED-i on
   * sama viljakad kui üks. Ilma selle testita võiks mudelisse pugeda liitmine
   * või konstant, mis lampide arvuga kaasa läheb.
   */
  it.each([0.5, 1, 2, 3, 10, 100])(
    "sama lamp k = %s korda: viljakus ei muutu",
    (k) => {
      for (const { lumensLm, powerW, efficacyLmPerW } of LAMP_TABLE) {
        expect(luminousEfficacy(k * lumensLm, k * powerW)).toBeCloseTo(
          efficacyLmPerW,
          9,
        );
      }
    },
  );

  /**
   * Füüsikaline ülempiir 683 lm/W: mudel, mis vastaks rahulikult küsimusele
   * „800 lm ühest vatist", õpetaks valet asja.
   */
  it("üle füüsikalise piiri viskab vea", () => {
    expect(() => luminousEfficacy(800, 1)).toThrow(RangeError);
    expect(() => luminousEfficacy(MAX_EFFICACY_LM_PER_W + 1, 1)).toThrow(
      RangeError,
    );
  });

  it("piir ise on kaasav", () => {
    expect(luminousEfficacy(MAX_EFFICACY_LM_PER_W, 1)).toBe(
      MAX_EFFICACY_LM_PER_W,
    );
  });

  it.each([
    // Lamp ei tarbi nulli.
    [800, 0],
    [800, -8],
    // See ei ole lamp.
    [0, 8],
    [-800, 8],
    // Lõpmatus ja NaN ei ole arvud, mille peale mudel vastab.
    [Number.NaN, 8],
    [800, Number.NaN],
    [Number.POSITIVE_INFINITY, 8],
    [800, Number.POSITIVE_INFINITY],
  ])("vigane sisend Φ = %s, P = %s viskab vea", (lumensLm, powerW) => {
    expect(() => luminousEfficacy(lumensLm, powerW)).toThrow(RangeError);
  });

  /**
   * Lõplikest sisenditest võib tulla lõpmatus – ja see peab jääma vea, mitte
   * ekraanile ilmuva „∞" taha (Codexi leiud, sammud 4.1ii ja 4.1mm).
   */
  it("üle voolav jagatis viskab vea, mitte ei anna lõpmatust", () => {
    expect(() => luminousEfficacy(1e308, 1e-308)).toThrow(RangeError);
  });

  /**
   * Alla voolav jagatis on lõpmatuse vaikne vend: mõlemad sisendid on
   * korralikud positiivsed arvud, aga jagatis kaob nulliks. „0 lm/W" on
   * füüsikaliselt vale vastus lambi kohta, mis annab valgust – ja erinevalt
   * lõpmatusest EI paista ta ekraanil kahtlane (Codexi leid, samm 4.1nnn).
   */
  it("alla voolav jagatis viskab vea, mitte ei anna nulli", () => {
    expect(() => luminousEfficacy(Number.MIN_VALUE, 2)).toThrow(RangeError);
  });
});

describe("powerForLumens – mitu vatti kulub sama valguse jaoks", () => {
  it.each([
    // LED, mis annab 800 lm.
    [800, 100, 8],
    // Sama valgus hõõglambiga.
    [800, 12, 66.666667],
    // Elutuba LED-idega.
    [2700, 100, 27],
    // Sama elutuba hõõglampidega – 8,3 korda rohkem.
    [2700, 12, 225],
    // Piir on kaasav.
    [800, MAX_EFFICACY_LM_PER_W, 1.1713031],
  ])("Φ = %s lm, η = %s lm/W → %s W", (lumensLm, efficacy, expected) => {
    expect(powerForLumens(lumensLm, efficacy)).toBeCloseTo(expected, 6);
  });

  it("üle füüsikalise piiri viskab vea", () => {
    expect(() => powerForLumens(800, 700)).toThrow(RangeError);
  });

  it.each([
    [800, 0],
    [800, -100],
    [0, 100],
    [-800, 100],
    [Number.NaN, 100],
    [800, Number.NaN],
    [Number.POSITIVE_INFINITY, 100],
    [800, Number.POSITIVE_INFINITY],
  ])("vigane sisend Φ = %s, η = %s viskab vea", (lumensLm, efficacy) => {
    expect(() => powerForLumens(lumensLm, efficacy)).toThrow(RangeError);
  });

  it("üle voolav jagatis viskab vea, mitte ei anna lõpmatust", () => {
    expect(() => powerForLumens(1e308, 1e-308)).toThrow(RangeError);
  });

  /** Sama alla voolamine kui viljakuse juures – „0 W" on vaikne vale vastus. */
  it("alla voolav jagatis viskab vea, mitte ei anna nulli", () => {
    expect(() => powerForLumens(Number.MIN_VALUE, 100)).toThrow(RangeError);
  });

  /**
   * Rohkem valgust nõuab rohkem vatte ja viljakam lamp vähem – mõlemad
   * rangelt, mitte „üldiselt". Ilma selleta võiks mudelisse pugeda korrutamine
   * jagamise asemel ja üksikväärtuste testid ei näitaks midagi, kui juhtumisi
   * mõlemad arvud sobiksid.
   */
  it("on valgusvoo suhtes rangelt kasvav", () => {
    for (const efficacy of [12, 15, 54, 100]) {
      for (let i = 1; i < LUMENS_GRID.length; i += 1) {
        expect(powerForLumens(LUMENS_GRID[i], efficacy)).toBeGreaterThan(
          powerForLumens(LUMENS_GRID[i - 1], efficacy),
        );
      }
    }
  });

  it("on valgusviljakuse suhtes rangelt kahanev", () => {
    const efficacies = [1, 5, 12, 15, 54, 100, 350, MAX_EFFICACY_LM_PER_W];
    for (const lumensLm of [200, 800, 1200, 2700, 3000]) {
      for (let i = 1; i < efficacies.length; i += 1) {
        expect(powerForLumens(lumensLm, efficacies[i])).toBeLessThan(
          powerForLumens(lumensLm, efficacies[i - 1]),
        );
      }
    }
  });
});

/**
 * Mudeli kaks poolt ristkontrollivad teineteist. See on ainus test, mis
 * püüaks kinni vaikselt ära vahetatud jagatava ja jagaja – ükski
 * üksikväärtuse test seda ei näitaks.
 */
describe("luminousEfficacy ja powerForLumens on teineteise pöörded", () => {
  const PAARID: Array<[number, number]> = [
    [720, 60],
    [630, 42],
    [810, 15],
    [800, 8],
    [2700, 27],
    [1200, 12],
    [1000, 10],
    [200, 2],
    [3000, 30],
  ];

  it.each(PAARID)(
    "Φ = %s lm, P = %s W → viljakus → tagasi sama võimsus",
    (lumensLm, powerW) => {
      const efficacy = luminousEfficacy(lumensLm, powerW);
      const tagasi = powerForLumens(lumensLm, efficacy);

      expect(Math.abs(tagasi - powerW) / powerW).toBeLessThan(1e-9);
    },
  );

  it.each(PAARID)(
    "Φ = %s lm, P = %s W → võimsus → tagasi sama viljakus",
    (lumensLm, powerW) => {
      const efficacy = luminousEfficacy(lumensLm, powerW);
      const tagasi = luminousEfficacy(
        lumensLm,
        powerForLumens(lumensLm, efficacy),
      );

      expect(Math.abs(tagasi - efficacy) / efficacy).toBeLessThan(1e-9);
    },
  );
});

describe("requiredLumens – kui palju valgust ruumi vaja on", () => {
  it.each([
    // Magamistuba 12 m².
    [12, 100, 1200],
    // Elutuba 18 m².
    [18, 150, 2700],
    // Köögi tööpind 4 m² – sama luumenite arv väiksemale pinnale.
    [4, 300, 1200],
    // Õppelaud 2 m².
    [2, 500, 1000],
  ])("S = %s m², tihedus %s lm/m² → %s lm", (areaM2, density, expected) => {
    expect(requiredLumens(areaM2, density)).toBe(expected);
  });

  it("piirid on kaasavad", () => {
    expect(requiredLumens(AREA_MIN_M2, DENSITY_MIN_LM_PER_M2)).toBe(
      AREA_MIN_M2 * DENSITY_MIN_LM_PER_M2,
    );
    expect(requiredLumens(AREA_MAX_M2, DENSITY_MAX_LM_PER_M2)).toBe(
      AREA_MAX_M2 * DENSITY_MAX_LM_PER_M2,
    );
  });

  it.each([
    // Alla 1 m² ei ole tuba.
    [0.5, 300],
    [0, 300],
    [-12, 300],
    // Ladu ei ole enam kodutuba.
    [101, 300],
    // Alla 50 lm/m² ei ole valgustatud ruum.
    [12, 20],
    [12, 0],
    [12, -100],
    // Üle 1000 lm/m² ei ole enam taskuarvutusreegli asi.
    [12, 1001],
    // Lõpmatus ja NaN.
    [Number.NaN, 300],
    [12, Number.NaN],
    [Number.POSITIVE_INFINITY, 300],
    [12, Number.POSITIVE_INFINITY],
  ])("vigane sisend S = %s m², tihedus %s viskab vea", (areaM2, density) => {
    expect(() => requiredLumens(areaM2, density)).toThrow(RangeError);
  });
});

describe("classifyColorTemperature – soe, neutraalne või külm valge", () => {
  it.each([
    // Hõõglamp ja „soe valge" LED.
    [2700, "soe"],
    [3299, "soe"],
    // Alumine piir on kaasav.
    [3300, "neutraalne"],
    // Töölaud.
    [4000, "neutraalne"],
    // Ülemine piir on kaasav.
    [5300, "neutraalne"],
    [5301, "kulm"],
    // Päevavalguslamp.
    [6500, "kulm"],
  ])("T = %s K → %s", (kelvin, expected) => {
    expect(classifyColorTemperature(kelvin)).toBe(expected);
  });

  /**
   * Piirid elavad konstantides, mitte laiali sisufailides – see test seob
   * konstandid ja käitumise kokku, et keegi ei saaks ühte muuta ilma teiseta.
   */
  it("piirid tulevad konstantidest", () => {
    expect(classifyColorTemperature(WARM_MAX_K - 1)).toBe("soe");
    expect(classifyColorTemperature(WARM_MAX_K)).toBe("neutraalne");
    expect(classifyColorTemperature(NEUTRAL_MAX_K)).toBe("neutraalne");
    expect(classifyColorTemperature(NEUTRAL_MAX_K + 1)).toBe("kulm");
  });

  it("lubatud vahemiku otsad töötavad", () => {
    expect(classifyColorTemperature(KELVIN_MIN)).toBe("soe");
    expect(classifyColorTemperature(KELVIN_MAX)).toBe("kulm");
  });

  it.each([
    // Allpool lambivaliku vahemikku.
    [1400],
    [500],
    [0],
    [-2700],
    // Ülalpool.
    [12_000],
    [Number.NaN],
    [Number.POSITIVE_INFINITY],
  ])("vigane sisend T = %s K viskab vea", (kelvin) => {
    expect(() => classifyColorTemperature(kelvin)).toThrow(RangeError);
  });
});

/**
 * Simulatsiooni turvavöönd.
 *
 * Liuguritega saab õpilane liikuda kogu võre peal – mudel peab vastama igal
 * ühelgi punktil ja tulemused peavad mahtuma ekraani kastikestesse. Nii ei saa
 * keegi hiljem liuguri piire muutes vaikselt ekraanile tuua väärtust, mille
 * peale mudel enam ei vasta.
 */
describe("simulatsiooni liugurivõre", () => {
  it("algväärtused on liuguri võre peal (õpilane saab alguskoha tagasi)", () => {
    expect(LUMENS_GRID).toContain(800);
    expect(KELVIN_GRID).toContain(2700);
  });

  it("värvustemperatuuri liugur ei anna ühelgi sammul viga", () => {
    for (const kelvin of KELVIN_GRID) {
      expect(() => classifyColorTemperature(kelvin)).not.toThrow();
    }
  });

  it("liuguri võrel esinevad kõik kolm liigitust", () => {
    const liigitused = new Set(KELVIN_GRID.map(classifyColorTemperature));
    expect(liigitused).toEqual(new Set(["soe", "neutraalne", "kulm"]));
  });

  it("LED-i võimsus jääb kogu valgusvoo võre peal vahemikku 2…30 W", () => {
    for (const lumensLm of LUMENS_GRID) {
      const powerW = powerForLumens(lumensLm, 100);
      expect(powerW).toBeGreaterThanOrEqual(2);
      expect(powerW).toBeLessThanOrEqual(30);
    }
  });

  it("kõik ruumide soovitused mahuvad valgusvoo liuguri vahemikku", () => {
    // Neli explore-nupurea ruumi (sisu/MOODUL-lambivalik.md samm 4).
    const RUUMID: Array<[number, number]> = [
      [12, 100], // magamistuba
      [18, 150], // elutuba
      [4, 300], // köögi tööpind
      [2, 500], // õppelaud
    ];

    for (const [areaM2, density] of RUUMID) {
      const soovitus = requiredLumens(areaM2, density);
      expect(soovitus).toBeGreaterThanOrEqual(SLIDERS.lumensLm.min);
      expect(soovitus).toBeLessThanOrEqual(SLIDERS.lumensLm.max);
      // Soovitus peab olema liuguriga TÄPSELT tabatav – explore-ülesanne 4
      // palub seada valgusvoo soovitusega võrdseks.
      expect(soovitus % SLIDERS.lumensLm.step).toBe(0);
    }
  });
});

/* --------------------------------------------------------------------------
 * Mooduli sisu: sammud, ülesanded ja õpetajajuhend (samm 4.1ooo)
 * ----------------------------------------------------------------------- */

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

describe("manifest", () => {
  it("ei võta endale teiste moodulite ainekava mõisteid", () => {
    // Katvusraport võrdleb mõisteid NIME järgi: „punktvalgusallikas" kuulub
    // moodulile `valgusallikad` ja „valguse spekter" moodulile
    // `liitvalgus-ja-spekter`. Siin paistaks üks põhimõiste kaetuna kahest
    // kohast (sisu/MOODUL-lambivalik.md „Ainekava seos").
    expect(manifest.concepts).toEqual([
      "valgusvoog",
      "valgusviljakus",
      "värvustemperatuur",
    ]);
    expect(manifest.practicalWork).toEqual([]);
    expect(manifest.outcomes).toEqual(["P1-T1"]);
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
    expect(figures).toEqual(["lv-poeriiul", "lv-kolm-varvust"]);
  });

  it("explore't ei lukusta ükski lisavõimalus", () => {
    // Liugureid on täpselt kaks (moodulileping: korraga max 2 muudetavat
    // suurust) ja ruumivalik on nupurida – midagi ei ole hiljem avada.
    const explore = activities.steps.find((step) => step.type === "explore");
    expect(explore?.type).toBe("explore");
    if (explore?.type !== "explore") return;
    expect(explore.simulation).toBeUndefined();
  });

  it("õpilase pool ei ületa mooduli piire", () => {
    // sisu/MOODUL-lambivalik.md „Piirid": elektriarve ja kilovatt-tund on
    // ploki P6 oma, fotomeetria ühikud ja värvusesitusindeks jäävad välja,
    // punkt- ja laiendatud allika ARVUTUS kuulub moodulile `valgusallikad`.
    // Kõik need on õpetajajuhendis olemas, aga õpilase ekraanile nad ei jõua.
    const all = studentTexts().join(" ").toLowerCase();
    for (const forbidden of [
      "kilovatt",
      "elektriarve",
      "euro",
      "senti",
      "kandela",
      "steradiaan",
      "luks",
      "värvusesitus",
      "punktvalgusallikas",
    ]) {
      expect(all, forbidden).not.toContain(forbidden);
    }
  });

  it("iga arvküsimus kannab õiget ühikut ja lugemistolerantsi", () => {
    // Luumenid, vatid ja lm/W – täpselt nii, nagu nad pakendil seisavad.
    // Ühikuteisendusi selles moodulis ei ole (sisu/MOODUL-lambivalik.md).
    const expected: Record<string, { unit: string; tolerance: number }> = {
      "explore-1": { unit: "lm", tolerance: 50 },
      "explore-4": { unit: "W", tolerance: 1 },
      "practice-1": { unit: "lm/W", tolerance: 2 },
      "practice-2": { unit: "W", tolerance: 3 },
      "exit-2": { unit: "lm", tolerance: 50 },
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
 * `activities.ts` võtab iga luumenite arvu, vati ja viljakuse MUDELIST
 * (CLAUDE.md reegel 1), seega näpuviga arvutuses siin välja ei paistaks – küll
 * aga paistab välja vale ruum, vale lambitüüp või vale tolerants. Seepärast on
 * ootus kirjutatud SPETSIFIKATSIOONI järgi (sisu/MOODUL-lambivalik.md
 * „Sammud"), mitte activities.ts-ist tagurpidi tuletatud.
 */
describe("ülesannete vastused käivad spetsifikatsiooniga kokku", () => {
  it("explore-1: elutuppa (18 m², 150 lm/m²) soovitatakse 2700 lm", () => {
    expect(numericQuestion("explore-1").answer).toBe(requiredLumens(18, 150));
    expect(numericQuestion("explore-1").answer).toBe(2700);
  });

  it("explore-4: õppelaua 1000 lm tuleb LED-iga 10 vatiga", () => {
    expect(requiredLumens(2, 500)).toBe(1000);
    expect(numericQuestion("explore-4").answer).toBe(powerForLumens(1000, 100));
    expect(numericQuestion("explore-4").answer).toBe(10);
  });

  it("explore-4 ei loe õigeks liigutamata liuguri näitu 8 W", () => {
    // Algseisus (800 lm) seisab kastikeses „8 W". Kes liugurit EI liiguta ja
    // kirjutab selle arvu maha, ei tohi saada „Õige!" – ülesanne palub seada
    // valgusvoo soovitusega (1000 lm) võrdseks (CodeRabbiti leid, samm 4.1ooo).
    const question = numericQuestion("explore-4");
    const answer = question.answer ?? Number.NaN;
    const startWatts = powerForLumens(800, 100);
    expect(startWatts).toBe(8);
    expect(Math.abs(answer - startWatts)).toBeGreaterThan(question.tolerance.value);

    // Ja ta saab selle asemel suunatud tagasiside, mitte üldise „vale".
    const trap = question.traps?.[0];
    expect(trap?.answer).toBe(startWatts);
    expect(trap?.misconception).toBe("uks-lamp-piisab");
  });

  it("practice-1: säästulambi viljakus on 54 lm/W", () => {
    expect(numericQuestion("practice-1").answer).toBe(luminousEfficacy(810, 15));
    expect(numericQuestion("practice-1").answer).toBe(54);
  });

  it("practice-2: elutoa 2700 lm tuleb LED-idega 27 vatiga", () => {
    expect(numericQuestion("practice-2").answer).toBe(powerForLumens(2700, 100));
    expect(numericQuestion("practice-2").answer).toBe(27);
    // Sama valgus hõõglambiga nõuab kaheksa korda rohkem vatte – see arv on
    // teoorias väljas, aga ühtki ülesannet ta ei moodusta.
    expect(powerForLumens(2700, 12)).toBe(225);
  });

  it("exit-2: köögi tööpinnale (4 m², 300 lm/m²) on vaja 1200 lm", () => {
    expect(numericQuestion("exit-2").answer).toBe(requiredLumens(4, 300));
    expect(numericQuestion("exit-2").answer).toBe(1200);
  });

  it("predict-1 õige vastus on LED ja mõlemad valed on nimetatud", () => {
    const question = choiceQuestion("predict-1");
    const correct = question.options.filter((option) => option.correct);
    expect(correct).toHaveLength(1);
    expect(correct[0].id).toBe("led");
    expect(
      question.options
        .filter((option) => !option.correct)
        .map((option) => option.misconception),
    ).toEqual(["vatt-on-heledus", "vastab-on-tapne"]);
  });

  it("explore-3 õige vastus kannab mõlemat silti display.ts-ist", () => {
    // Sildid EI tohi olla siia käsitsi kirjutatud: nad tulevad mudeli
    // liigitusest läbi display.ts-i.
    const correct = choiceQuestion("explore-3").options.find(
      (option) => option.correct,
    );
    expect(correct?.text).toContain("soe valge");
    expect(correct?.text).toContain("neutraalne valge");
    expect(classifyColorTemperature(2700)).toBe("soe");
    expect(classifyColorTemperature(4000)).toBe("neutraalne");
  });

  it("practice-4 ülekandeülesandel on kolm õiget ja kolm valet valikut", () => {
    const question = choiceQuestion("practice-4");
    expect(question.multiple).toBe(true);
    expect(question.shuffle).toBe(true);
    expect(question.options.filter((option) => option.correct)).toHaveLength(3);
    const wrong = Object.fromEntries(
      question.options
        .filter((option) => !option.correct)
        .map((option) => [option.id, option.misconception]),
    );
    expect(wrong).toEqual({
      "kulm-valgus": "iga-valgus-sobib-igale-poole",
      "paljas-pirn": "paljas-pirn-sobib",
      "3000-lm": "rohkem-on-alati-parem",
    });
  });

  it("explore-2 vale variant „liiga hele” on meelega sildita", () => {
    // Kastikeste vale lugemine ei ole ükski mooduli väärarusaamadest – vale
    // sildi all jõuaks õpetaja koondvaatesse väärarusaam, mida õpilasel ei
    // olnud.
    const option = choiceQuestion("explore-2").options.find(
      (item) => item.id === "liiga-hele",
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
      "vatt-on-heledus",
      "vastab-on-tapne",
      "kelvin-on-lambi-temperatuur",
      "kelvin-on-heledus",
      "soe-tahendab-suurt-arvu",
      "uks-lamp-piisab",
      "rohkem-on-alati-parem",
      "iga-valgus-sobib-igale-poole",
      "paljas-pirn-sobib",
      "led-on-noruk",
    ]) {
      expect(known, id).toContain(id);
    }
  });

  it("ohutus räägib kuumast lambist ja katkise säästulambi elavhõbedast", () => {
    expect(teacher.safety).toContain("jahtunud");
    expect(teacher.safety).toContain("elavhõbedat");
    expect(teacher.safety).toContain("tolmuimejaga");
  });

  it("elektriarve jääb selgelt plokki P6", () => {
    // Kui see moodul teeks elektriarve ära, jääks P6 moodul tühjaks ja õpilane
    // saaks sama asja kaks korda (sisu/MOODUL-lambivalik.md „Piirid").
    expect(teacher.notInThisModule).toContain("P6");
    expect(teacher.notInThisModule).toContain("kilovatt-tund");
  });

  it("õpetaja saab teada, miks päris tuba mudelist erineb", () => {
    // model.ts idealiseeringud 1, 2, 5 ja 6 – UI ei tohi neid päris füüsikana
    // esitada.
    expect(teacher.whyRealDiffers).toContain("kasutustegur");
    expect(teacher.whyRealDiffers).toContain("SUURUSJÄRK");
  });

  it("kodulampide võrdlus nõuab põhjenduses vähemalt kahte arvu", () => {
    // Ainekava õpilase tegevus on „valib kodulambid + PÕHJENDAB" – üks arv
    // üksi ei ole lambivaliku põhjendus.
    const homework = teacher.homeLampComparison.join(" ");
    expect(homework).toContain("KAKS arvu");
    expect(homework.toLowerCase()).toContain("lm / w");
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
