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

/**
 * Esemete värvuse mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist (sisu/MOODUL-esemete-varvus.md
 * „Füüsika" → testiväärtuste tabel ning sammude juures kirjas olevad
 * vastused), mitte mudelist tagurpidi tuletatud – muidu testiks test
 * iseennast. Kaasa on võetud ka need arvud ja värvid, mille peal moodul
 * õpilast hiljem päriselt kontrollib (simulatsiooni ülesanded, harjutused,
 * väljumispilet, kordamiskaardid) – nii selgub näpuviga siin, mitte tunnis.
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
