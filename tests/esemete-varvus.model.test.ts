import { describe, expect, it } from "vitest";
import {
  CHANNELS,
  type ChannelId,
  LIGHTS,
  OBJECTS,
  absorbedChannels,
  absorbedShare,
  perceivedColour,
  perceivedColourForChannels,
  reflectedChannels,
  warmsUp,
} from "../src/modules/physics/esemete-varvus/model";
import { manifest } from "../src/modules/physics/esemete-varvus/manifest";
import { activities } from "../src/modules/physics/esemete-varvus/activities";
import { teacher } from "../src/modules/physics/esemete-varvus/teacher";
import {
  CHANNEL_STOPS,
  DARK_LABEL_COLOUR,
  channelColour,
  swatchColour,
  swatchLabelColour,
} from "../src/modules/physics/esemete-varvus/display";
import { activitiesSchema, manifestSchema } from "../src/engine/contractSchema";
import { stepQuestions } from "../src/engine/contract";
import { checkNumericAnswer } from "../src/checker/numeric";

/**
 * Esemete värvuse mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist (sisu/MOODUL-esemete-varvus.md
 * „Füüsika" → testiväärtuste tabel ning sammude juures kirjas olevad
 * vastused), mitte mudelist tagurpidi tuletatud – muidu testiks test
 * iseennast. Kaasa on võetud ka need arvud ja värvid, mille peal moodul
 * õpilast hiljem päriselt kontrollib (simulatsiooni ülesanded, harjutused,
 * väljumispilet, kordamiskaardid) – nii selgub näpuviga siin, mitte tunnis.
 *
 * Alumine osa (samm 4.1bb) katab manifesti, samme, jooniste värve ja
 * õpetajajuhendit – sama muster mis tests/liitvalgus-ja-spekter.model.test.ts.
 */

/** Testis on mugavam võrrelda nimesid kui objekte. */
const labelsOf = (channels: readonly { label: string }[]): string[] =>
  channels.map((channel) => channel.label);

describe("perceivedColour – mis värvi ese paistab", () => {
  it.each([
    ["white", "paper", "valge"],
    ["white", "shirt", "must"],
    ["white", "apple", "punane"],
    ["white", "lemon", "kollane"],
    ["red", "apple", "punane"],
    ["green", "apple", "must"],
    ["red", "paper", "punane"],
    ["blue", "leaf", "must"],
    ["yellow", "lemon", "kollane"],
    ["yellow", "mug", "must"],
    ["red", "shirt", "must"],
  ])("%s valgus + %s → %s", (lightId, objectId, expected) => {
    expect(perceivedColour(lightId, objectId)).toBe(expected);
  });

  it("ükski valguse ja eseme paar ei anna tühja ega tundmatut vastust", () => {
    const seen = new Set<string>();
    for (const light of LIGHTS) {
      for (const object of OBJECTS) {
        const colour = perceivedColour(light.id, object.id);
        expect(colour).not.toBe("");
        seen.add(colour);
      }
    }
    // Praeguste tabelitega tulevad ette ainult need kuus – „lilla" ja
    // „helesinine" ei tule ühegi paari pealt välja (ükski ese ei peegelda
    // punast + sinist). Test ütleb selle välja, et uue eseme lisamine
    // paistaks kohe ära; kaheksa hulga katvust kontrollib eraldi test allpool
    // `perceivedColourForChannels` kaudu.
    expect([...seen].sort()).toEqual([
      "kollane",
      "must",
      "punane",
      "roheline",
      "sinine",
      "valge",
    ]);
  });
});

describe("perceivedColourForChannels – kõik kaheksa kanalihulka", () => {
  // Spetsifikatsiooni tabel (sisu/MOODUL-esemete-varvus.md „Füüsika"),
  // kõik 2^3 alamhulka. Kaks viimast seguvärvi ei tule selle mooduli
  // ülesannetes ette, aga funktsioon peab neile õigesti vastama, kui keegi
  // lisab uue eseme (CodeRabbiti ja Codexi kattuv leid samm 4.1aa).
  it.each([
    [[], "must"],
    [["red"], "punane"],
    [["green"], "roheline"],
    [["blue"], "sinine"],
    [["red", "green"], "kollane"],
    [["red", "blue"], "lilla"],
    [["green", "blue"], "helesinine"],
    [["red", "green", "blue"], "valge"],
  ] as [ChannelId[], string][])("%s → %s", (channels, expected) => {
    expect(perceivedColourForChannels(channels)).toBe(expected);
  });

  it("vastus ei sõltu sisendi järjekorrast ega kordustest", () => {
    expect(perceivedColourForChannels(["green", "red"])).toBe("kollane");
    expect(perceivedColourForChannels(["blue", "red", "red"])).toBe("lilla");
  });

  it("tundmatu kanal viskab vea, mitte ei jäta kanalit vaikselt välja", () => {
    expect(() => perceivedColourForChannels(["red", "sinine"])).toThrow(
      RangeError,
    );
  });
});

describe("reflectedChannels – mis tuleb esemelt tagasi", () => {
  it("valge valgus + kollane sidrun → punane, roheline (selles järjekorras)", () => {
    expect(labelsOf(reflectedChannels("white", "lemon"))).toEqual([
      "punane",
      "roheline",
    ]);
  });

  it("sinine valgus + kollane sidrun → ei midagi", () => {
    expect(reflectedChannels("blue", "lemon")).toEqual([]);
  });

  it("on alati CHANNELS järjekorras, mitte sisendi järjekorras", () => {
    // Kollane valgus on tabelis punane+roheline, valge paber peegeldab
    // punane+roheline+sinine – tulemus peab tulema CHANNELS järjekorras.
    const order = labelsOf(reflectedChannels("yellow", "paper"));
    expect(order).toEqual(["punane", "roheline"]);
  });
});

describe("absorbedChannels – mis neeldub", () => {
  it("valge valgus + punane õun → roheline, sinine", () => {
    expect(labelsOf(absorbedChannels("white", "apple"))).toEqual([
      "roheline",
      "sinine",
    ]);
  });

  it("punane valgus + sinine kruus → punane", () => {
    expect(labelsOf(absorbedChannels("red", "mug"))).toEqual(["punane"]);
  });

  it("neelduda saab ainult langenu: punane valgus + punane õun → ei midagi", () => {
    expect(absorbedChannels("red", "apple")).toEqual([]);
  });

  it("peegeldunud ja neeldunud kanalid annavad kokku valguse kanalid", () => {
    for (const light of LIGHTS) {
      for (const object of OBJECTS) {
        const reflected = reflectedChannels(light.id, object.id);
        const absorbed = absorbedChannels(light.id, object.id);
        // Kolmandat teed ei ole: mis ei peegeldunud, on neeldunud.
        expect(reflected.length + absorbed.length).toBe(light.channels.length);
        const together = [...reflected, ...absorbed].map(
          (channel) => channel.id,
        );
        expect([...together].sort()).toEqual([...light.channels].sort());
      }
    }
  });
});

describe("absorbedShare – kui suur osa langenud valgusest neeldub", () => {
  it.each([
    ["white", "shirt", 1],
    ["white", "paper", 0],
    ["white", "apple", 2 / 3],
    ["yellow", "lemon", 0],
    ["red", "leaf", 1],
  ])("%s valgus + %s → %s", (lightId, objectId, expected) => {
    expect(absorbedShare(lightId, objectId)).toBeCloseTo(expected, 10);
  });

  it("must särk neelab igas valguses kõik", () => {
    for (const light of LIGHTS) {
      expect(absorbedShare(light.id, "shirt")).toBe(1);
      expect(perceivedColour(light.id, "shirt")).toBe("must");
    }
  });

  it("valge paber ei neela selles mudelis kunagi midagi ja paistab lambi värvi", () => {
    // Mudeli kõige olulisem „ese ei tee värvi ise" tõestus. NB! 0 on
    // idealiseering (vt model.ts päis) – päris valge paber neelab veidi.
    const lightColour: Record<string, string> = {
      white: "valge",
      red: "punane",
      green: "roheline",
      blue: "sinine",
      yellow: "kollane",
    };
    for (const light of LIGHTS) {
      expect(absorbedShare(light.id, "paper")).toBe(0);
      expect(perceivedColour(light.id, "paper")).toBe(lightColour[light.id]);
    }
  });

  it("on alati 0…1", () => {
    for (const light of LIGHTS) {
      for (const object of OBJECTS) {
        const share = absorbedShare(light.id, object.id);
        expect(share).toBeGreaterThanOrEqual(0);
        expect(share).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("warmsUp – kas ese soojeneb tuntavalt", () => {
  it.each([
    ["white", "shirt", true],
    ["white", "paper", false],
    ["white", "apple", true],
  ])("%s valgus + %s → %s", (lightId, objectId, expected) => {
    expect(warmsUp(lightId, objectId)).toBe(expected);
  });

  it("täpselt pool ei ole veel soojenemine", () => {
    // Kollases valguses (punane + roheline) neelab punane õun ühe kanali
    // kahest ehk 1/2 – range võrdlus annab siin `false`.
    expect(absorbedShare("yellow", "apple")).toBe(0.5);
    expect(warmsUp("yellow", "apple")).toBe(false);
  });
});

describe("sisu ülesannete vastused (simulatsioon, harjutused, väljumispilet)", () => {
  it("explore-1: valge valgus + punane õun → 2 värvi neeldub", () => {
    expect(absorbedChannels("white", "apple")).toHaveLength(2);
  });

  it("explore-2: punane õun rohelises lambis paistab must", () => {
    expect(perceivedColour("green", "apple")).toBe("must");
  });

  it("explore-3: kollane sidrun punases lambis paistab punane", () => {
    expect(perceivedColour("red", "lemon")).toBe("punane");
  });

  it("practice-2 ja exit-2: sinine kruus valges valguses – 2 kanalit neeldub", () => {
    expect(reflectedChannels("white", "mug")).toHaveLength(1);
    expect(absorbedChannels("white", "mug")).toHaveLength(2);
  });

  it("practice-4: sinine kruus kollases lambis paistab must", () => {
    expect(perceivedColour("yellow", "mug")).toBe("must");
  });

  it("predict ja practice-5: sama ese paistab eri valgustes eri värvi", () => {
    expect(perceivedColour("white", "lemon")).toBe("kollane");
    expect(perceivedColour("red", "lemon")).toBe("punane");
    expect(perceivedColour("green", "lemon")).toBe("roheline");
    expect(perceivedColour("blue", "lemon")).toBe("must");
  });
});

describe("vigased sisendid viskavad vea", () => {
  it.each([
    ["perceivedColour tundmatu valgus", () => perceivedColour("kuu", "apple")],
    ["reflectedChannels tundmatu ese", () => reflectedChannels("white", "kass")],
    ["absorbedShare tühi valguse id", () => absorbedShare("", "paper")],
    ["absorbedChannels tundmatu ese", () => absorbedChannels("white", "")],
    ["warmsUp tundmatu valgus", () => warmsUp("pime", "shirt")],
  ])("%s", (_name, call) => {
    expect(call).toThrow(RangeError);
  });
});

describe("tabelite terviklus", () => {
  const channelIds = new Set<string>(CHANNELS.map((channel) => channel.id));

  it("kanalite id-d on unikaalsed", () => {
    expect(channelIds.size).toBe(CHANNELS.length);
  });

  it("igal valgusel on vähemalt üks kanal, kordusteta ja tuntud", () => {
    for (const light of LIGHTS) {
      expect(light.channels.length).toBeGreaterThan(0);
      expect(new Set<ChannelId>(light.channels).size).toBe(
        light.channels.length,
      );
      for (const id of light.channels) {
        expect(channelIds.has(id)).toBe(true);
      }
    }
  });

  it("iga eseme peegeldatavad kanalid on kordusteta ja tuntud", () => {
    for (const object of OBJECTS) {
      expect(new Set<ChannelId>(object.reflects).size).toBe(
        object.reflects.length,
      );
      for (const id of object.reflects) {
        expect(channelIds.has(id)).toBe(true);
      }
    }
  });

  it("valguste ja esemete id-d on unikaalsed", () => {
    expect(new Set(LIGHTS.map((light) => light.id)).size).toBe(LIGHTS.length);
    expect(new Set(OBJECTS.map((object) => object.id)).size).toBe(
      OBJECTS.length,
    );
  });

  it("täpselt üks ese ei peegelda midagi (must särk)", () => {
    const black = OBJECTS.filter((object) => object.reflects.length === 0);
    expect(black.map((object) => object.id)).toEqual(["shirt"]);
  });
});

describe("manifest", () => {
  it("vastab moodulilepingu skeemile", () => {
    expect(() => manifestSchema.parse(manifest)).not.toThrow();
  });

  it("viitab ainekava õpitulemusele P1-T3, praktilist tööd ei ole", () => {
    // P1-PT2 (valgusfiltrid) on teise mooduli oma – siia kirjutatuna petaks ta
    // katvusraportit.
    expect(manifest.outcomes).toEqual(["P1-T3"]);
    expect(manifest.practicalWork).toEqual([]);
  });

  it("õpetab neeldumist, mida ainekava põhimõistete loendis ei ole", () => {
    // Katvusraport paneb selle `extraConcepts` alla ehk MÄRKUSEKS – see on
    // teadlik valik (sisu/MOODUL-esemete-varvus.md „Ainekava seos").
    expect(manifest.concepts).toEqual(["valguse neeldumine"]);
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
    expect(figures).toEqual([
      "ev-must-ja-valge-sark",
      "ev-punane-oun",
      "ev-kolm-eset",
    ]);
  });

  it("simulatsioonil ei ole lukustatud lisavõimalusi", () => {
    // Mõlemad juhtnupud (lamp ja ese) on kohe nähtaval: mooduli mõte on just
    // nende KAHE koosmõju ja ühe peitmine teeks esimese ülesande mõttetuks.
    const explore = activities.steps.find((step) => step.type === "explore");
    expect(explore?.type === "explore" ? explore.simulation : undefined).toBeUndefined();
  });
});

/**
 * Ülesannete vastused vs. mudel.
 *
 * `activities.ts` võtab iga vastuse MUDELIST (CLAUDE.md reegel 1), seega
 * näpuviga arvutuses siin välja ei paistaks – küll aga paistab välja vale
 * funktsioonivalik või vale ese. Seepärast on ootus kirjutatud
 * SPETSIFIKATSIOONI järgi (sisu/MOODUL-esemete-varvus.md „Sammud").
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

  const correctText = (questionId: string) =>
    choiceQuestion(questionId).options.find((option) => option.correct)?.text;

  it.each([
    ["explore-1", "punases õunas neelduvad värvid valges valguses", 2],
    ["practice-1", "sinises kruusis neelduvad värvid valges valguses", 2],
    ["exit-2", "sama küsimus väljumispiletis", 2],
  ])("%s (%s) → %s", (questionId, _what, expected) => {
    expect(numericQuestion(questionId as string).answer).toBe(expected as number);
  });

  it("ükski arvvastus ei kanna ühikut – loendatakse värve, mitte nanomeetreid", () => {
    for (const id of ["explore-1", "practice-1", "exit-2"]) {
      expect(numericQuestion(id).unit, id).toBeUndefined();
    }
  });

  it("kõik arvvastused on täpsed: ±0,5 ehk naaberarv läheb valeks", () => {
    for (const id of ["explore-1", "practice-1", "exit-2"]) {
      const question = numericQuestion(id);
      expect(question.tolerance, id).toEqual({ mode: "absolute", value: 0.5 });
      expect(checkNumericAnswer(question, "2").correct, id).toBe(true);
      expect(checkNumericAnswer(question, "1").correct, id).toBe(false);
      expect(checkNumericAnswer(question, "3").correct, id).toBe(false);
    }
  });

  it("ennustuse õige vastus on sama, mille mudel rohelise lambi all annab", () => {
    expect(perceivedColour("green", "apple")).toBe("must");
    expect(correctText("predict-1")).toContain("Must");
  });

  it("explore-2 ja explore-3 vastused tulevad mudelilt, mitte peast", () => {
    expect(correctText("explore-2")).toBe("Must");
    expect(perceivedColour("green", "apple")).toBe("must");
    // Sidrun peegeldab punast JA rohelist, aga punases lambis on tagasi saata
    // ainult punane – seepärast paistab ta punane, mitte kollane.
    expect(correctText("explore-3")).toBe("Punane");
    expect(perceivedColour("red", "lemon")).toBe("punane");
  });

  it("explore-4: valge paber paistab iga lambi enda värvi", () => {
    // See on mooduli kõige olulisem „ese ei tee värvi ise" tõestus, seega peab
    // ta kehtima KÕIGI viie lambiga, mitte ainult ülesande omaga.
    for (const light of LIGHTS) {
      expect(perceivedColour(light.id, "paper"), light.id).toBe(
        perceivedColourForChannels(light.channels),
      );
      expect(absorbedShare(light.id, "paper"), light.id).toBe(0);
    }
    expect(correctText("explore-4")).toContain("sama värvi, mis lamp");
  });

  it("practice-2 õige vastus on ese, mis ei peegelda midagi (joonise C)", () => {
    expect(correctText("practice-2")).toContain("ei lähe tagasi ühtegi");
    // Joonisel on C must särk: tema neelab kogu langeva valguse ja soojeneb.
    expect(reflectedChannels("white", "shirt")).toHaveLength(0);
    expect(absorbedShare("white", "shirt")).toBe(1);
    expect(warmsUp("white", "shirt")).toBe(true);
    // Ja A (valge paber) EI soojene – just see on väärarusaama lõks.
    expect(warmsUp("white", "paper")).toBe(false);
  });

  it("practice-3: sinine kruus kollases valguses paistab must", () => {
    expect(correctText("practice-3")).toBe("Must");
    expect(perceivedColour("yellow", "mug")).toBe("must");
  });

  it("lahendatud näidis kasutab mudelist tulevat värvi", () => {
    const practice = activities.steps.find((step) => step.type === "practice");
    const worked = practice?.type === "practice" ? practice.worked : undefined;
    expect(worked?.answer).toContain(perceivedColour("white", "leaf"));
    expect(worked?.solution.join(" ")).toContain("3 värvi");
  });

  it("kordamiskaardid näitavad mudeli arve ja värve", () => {
    const kaart = (id: string) => activities.reviewCards.find((card) => card.id === id);
    expect(kaart("rc-3")?.question).toContain(perceivedColour("green", "apple"));
    expect(kaart("rc-4")?.answer).toContain("2 (3 − 1)");
    expect(activities.reviewCards).toHaveLength(5);
  });
});

describe("jooniste värvid (display.ts)", () => {
  it("igal mudeli kanalil on värv ja kanalid on mudeli järjekorras", () => {
    expect(CHANNEL_STOPS.map((stop) => stop.id)).toEqual(
      CHANNELS.map((channel) => channel.id),
    );
    for (const stop of CHANNEL_STOPS) {
      expect(stop.colour, stop.id).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("kaks kanalit ei jaga sama värvi – muidu ei saaks nooli eristada", () => {
    const colours = CHANNEL_STOPS.map((stop) => stop.colour);
    expect(new Set(colours).size).toBe(colours.length);
  });

  /**
   * Iga paistev värv, mida mudel ANDA SAAB, peab olema joonistatav.
   *
   * Käime läbi kõik kaheksa kanalihulka (mitte ainult praeguste tabelite
   * paarid) – nii jääks uus värvinimi mudelis siin kohe vahele, selle asemel et
   * ilmuda ekraanile nähtamatu esemena.
   */
  const allChannelSubsets = (): ChannelId[][] => {
    const ids = CHANNELS.map((channel) => channel.id);
    const subsets: ChannelId[][] = [];
    for (let mask = 0; mask < 2 ** ids.length; mask += 1) {
      subsets.push(ids.filter((_, index) => (mask & (1 << index)) !== 0));
    }
    return subsets;
  };

  it("kõigil kaheksal paistval värvil on laigu värv olemas", () => {
    const names = allChannelSubsets().map((subset) =>
      perceivedColourForChannels(subset),
    );
    expect(new Set(names).size).toBe(8);
    for (const name of names) {
      expect(swatchColour(name), name).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("iga valguse ja eseme paari värv on joonistatav", () => {
    for (const light of LIGHTS) {
      for (const object of OBJECTS) {
        const name = perceivedColour(light.id, object.id);
        expect(() => swatchColour(name), `${light.id}/${object.id}`).not.toThrow();
      }
    }
  });

  it("tundmatu kanal või värv viskab vea, mitte ei jäta joonisele auku", () => {
    expect(() => channelColour("roosa")).toThrow(RangeError);
    expect(() => swatchColour("roosa")).toThrow(RangeError);
    expect(() => swatchLabelColour("roosa")).toThrow(RangeError);
  });

  /**
   * Sildi ja laigu kontrast (WCAG 2.1, väike tekst: 4,5:1).
   *
   * Joonisel ja simulatsioonis on värvi nimi (või eseme täht) kirjutatud laigu
   * enda peale 10–18 px fondiga ja seda loetakse projektorilt klassi tagant.
   * Valge tekst valgel või kollasel laigul jääks loetamatuks.
   */
  const relativeLuminance = (hex: string) => {
    const channel = (from: number) => {
      const srgb = Number.parseInt(hex.slice(from, from + 2), 16) / 255;
      return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  };

  const contrast = (a: string, b: string) => {
    const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort(
      (x, y) => y - x,
    );
    return (light + 0.05) / (dark + 0.05);
  };

  it("iga värvi nimi on oma laigu peal loetav (kontrast vähemalt 4,5:1)", () => {
    for (const subset of allChannelSubsets()) {
      const name = perceivedColourForChannels(subset);
      expect(
        contrast(swatchColour(name), swatchLabelColour(name)),
        name,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("valge silt valgel või kollasel laigul EI läbiks seda kontrolli", () => {
    // Test, mis silditooni valiku tingis: ilma tumeda sildita jäävad need kaks
    // laiku 1,1:1 ja 2,9:1 peale.
    for (const name of ["valge", "kollane"]) {
      expect(contrast(swatchColour(name), "#ffffff"), name).toBeLessThan(4.5);
      expect(swatchLabelColour(name)).toBe(DARK_LABEL_COLOUR);
    }
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

  it("spetsifikatsiooni kuus väärarusaama on kõik olemas", () => {
    for (const id of [
      "varv-on-esemes",
      "ese-kiirgab-ise",
      "ese-peegeldab-koike-mis-langeb",
      "must-varv-on-varv",
      "valge-neelab-koige-rohkem",
      "valgus-ja-varviaine-sama",
    ]) {
      expect(known, id).toContain(id);
    }
  });

  it("õpetaja saab teada, kus simulatsioon ja päris klass lahku lähevad", () => {
    // Valge paberi 0 on idealiseering (model.ts) ja päris õun ei lähe
    // rohelises valguses päris mustaks – mõlemad peavad olema kirjas, muidu
    // paistab õnnestunud katse õpilasele ebaõnnestununa.
    expect(teacher.whyRealDiffers).toContain("peaaegu ei neela");
    expect(teacher.darkRoomActivity.join(" ")).toContain("tumehall");
    expect(teacher.hookNumbers).toContain("48 °C");
  });

  it("ohutus nimetab mõlemat kohta: taskulampi ja Päikest", () => {
    expect(teacher.safety).toContain("askulampi");
    expect(teacher.safety).toContain("Päikest");
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
