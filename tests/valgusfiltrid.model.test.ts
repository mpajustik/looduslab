import { describe, expect, it } from "vitest";
import {
  CHANNELS,
  type ChannelId,
  FILTERS,
  LIGHTS,
  blockedChannels,
  blockedShare,
  perceivedColour,
  perceivedColourForChannels,
  transmittedChannels,
} from "../src/modules/physics/valgusfiltrid/model";

/**
 * Valgusfiltrite mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist (sisu/MOODUL-valgusfiltrid.md
 * „Füüsika" → testiväärtuste tabel ning sammude juures kirjas olevad
 * vastused), mitte mudelist tagurpidi tuletatud – muidu testiks test
 * iseennast.
 *
 * Kolm seaduspära on siin katsetatud TSÜKLIGA üle kõigi valguste ja
 * filtrikombinatsioonide, mitte ühe näite peal: järjekord ei loe, filter ei
 * lisa kunagi midagi, filtri lisamine ainult vähendab. Need kolm ongi mooduli
 * õpieesmärk ja üksik näide ei tõesta neist ühtegi.
 */

/** Testis on mugavam võrrelda nimesid kui objekte. */
const labelsOf = (channels: readonly { label: string }[]): string[] =>
  channels.map((channel) => channel.label);

/** Kanalite id-d – nii saab tulemusi hulkadena võrrelda. */
const idsOf = (channels: readonly { id: string }[]): string[] =>
  channels.map((channel) => channel.id);

/** Kõik filtrikombinatsioonid, mida simulatsiooni kaks pesa anda saavad. */
const slotCombinations = (): string[][] => {
  const ids = FILTERS.map((filter) => filter.id);
  const combos: string[][] = [[]];
  for (const first of ids) {
    combos.push([first]);
    for (const second of ids) {
      combos.push([first, second]);
    }
  }
  return combos;
};

describe("transmittedChannels – mis jõuab ekraanile", () => {
  it.each([
    ["white", [], ["punane", "roheline", "sinine"]],
    ["white", ["red"], ["punane"]],
    ["white", ["yellow"], ["punane", "roheline"]],
    ["white", ["yellow", "red"], ["punane"]],
    ["white", ["yellow", "green"], ["roheline"]],
    ["white", ["red", "blue"], []],
    ["white", ["blue", "red"], []],
    ["white", ["yellow", "blue"], []],
    ["yellow", ["red"], ["punane"]],
    ["yellow", ["blue"], []],
    ["red", ["green"], []],
    ["red", ["red"], ["punane"]],
  ] as [string, string[], string[]][])(
    "%s valgus + filtrid %j → %j",
    (lightId, filterIds, expected) => {
      expect(labelsOf(transmittedChannels(lightId, filterIds))).toEqual(expected);
    },
  );

  it("kaks ühesugust filtrit annavad mudelis sama tulemuse mis üks", () => {
    // Idealiseering 2 (vt model.ts päis): päris katses on kaks punast kilet
    // üksteise peal nähtavalt TUMEDAMAD. Mudel loeb värve, mitte heledust.
    expect(labelsOf(transmittedChannels("white", ["red", "red"]))).toEqual([
      "punane",
    ]);
    for (const filter of FILTERS) {
      for (const light of LIGHTS) {
        expect(
          idsOf(transmittedChannels(light.id, [filter.id, filter.id])),
          `${light.id}/${filter.id}`,
        ).toEqual(idsOf(transmittedChannels(light.id, [filter.id])));
      }
    }
  });

  it("filtrite järjekord ei muuda tulemust (kõik paarid, kõik valgused)", () => {
    // Mooduli keskne avastus (explore-4). Üks näide siin ei piisaks: kui
    // ühisosa oleks kogemata „esimese filtri võit", jääks see enamiku paaride
    // puhul märkamata.
    for (const light of LIGHTS) {
      for (const a of FILTERS) {
        for (const b of FILTERS) {
          expect(
            idsOf(transmittedChannels(light.id, [a.id, b.id])),
            `${light.id}: ${a.id}+${b.id}`,
          ).toEqual(idsOf(transmittedChannels(light.id, [b.id, a.id])));
        }
      }
    }
  });

  it("filter ei lisa kunagi midagi: tulemus on valguse kanalite alamhulk", () => {
    // Mooduli kõige olulisem „filter ei värvi valgust" tõestus
    // (väärarusaamad `filter-lisab-varvi` ja `filter-teeb-valgust`).
    for (const light of LIGHTS) {
      const available = new Set<string>(light.channels);
      for (const combo of slotCombinations()) {
        for (const channel of transmittedChannels(light.id, combo)) {
          expect(available, `${light.id}: ${combo.join("+")}`).toContain(
            channel.id,
          );
        }
      }
    }
  });

  it("filtri lisamine ainult vähendab läbi läinud kanaleid", () => {
    for (const light of LIGHTS) {
      for (const a of FILTERS) {
        const alone = transmittedChannels(light.id, [a.id]);
        for (const b of FILTERS) {
          const together = transmittedChannels(light.id, [a.id, b.id]);
          expect(
            together.length,
            `${light.id}: ${a.id}+${b.id}`,
          ).toBeLessThanOrEqual(alone.length);
          // Ja tegemist on päris alamhulgaga, mitte lihtsalt lühema loendiga.
          const aloneIds = new Set(idsOf(alone));
          for (const channel of together) {
            expect(aloneIds, `${light.id}: ${a.id}+${b.id}`).toContain(
              channel.id,
            );
          }
        }
      }
    }
  });

  it("tulemus on alati CHANNELS järjekorras, mitte sisendi järjekorras", () => {
    for (const light of LIGHTS) {
      for (const combo of slotCombinations()) {
        const ids = idsOf(transmittedChannels(light.id, combo));
        const ordered = CHANNELS.map((channel) => channel.id).filter((id) =>
          ids.includes(id),
        );
        expect(ids, `${light.id}: ${combo.join("+")}`).toEqual(ordered);
      }
    }
  });
});

describe("blockedChannels – mis jääb kinni", () => {
  it.each([
    ["white", ["red"], ["roheline", "sinine"]],
    ["white", [], []],
    ["red", ["red"], []],
    ["yellow", ["blue"], ["punane", "roheline"]],
  ] as [string, string[], string[]][])(
    "%s valgus + filtrid %j → %j",
    (lightId, filterIds, expected) => {
      expect(labelsOf(blockedChannels(lightId, filterIds))).toEqual(expected);
    },
  );

  it("kinni jääda saab ainult see, mis filtrini jõudis", () => {
    // Punane filter jätab valgest valgusest kaks kanalit kinni, aga punasest
    // valgusest mitte ühtegi – kinni jäämiseks peab kanal olema kohal olnud.
    expect(blockedChannels("red", ["red"])).toEqual([]);
    expect(blockedChannels("white", ["red"])).toHaveLength(2);
  });

  it("läbi läinud ja kinni jäänud annavad kokku valguse kanalid", () => {
    for (const light of LIGHTS) {
      for (const combo of slotCombinations()) {
        const through = transmittedChannels(light.id, combo);
        const blocked = blockedChannels(light.id, combo);
        const where = `${light.id}: ${combo.join("+")}`;
        // Mudelis on ainult kaks teed: läbi või kinni (idealiseering 4 –
        // päris kile pinnalt peegeldub ka veidi tagasi).
        expect(through.length + blocked.length, where).toBe(
          light.channels.length,
        );
        expect([...idsOf(through), ...idsOf(blocked)].sort(), where).toEqual(
          [...light.channels].sort(),
        );
      }
    }
  });
});

describe("blockedShare – kui suur osa jõudnud valgusest jääb kinni", () => {
  it.each([
    ["white", [], 0],
    ["white", ["red"], 2 / 3],
    ["white", ["yellow"], 1 / 3],
    ["white", ["red", "blue"], 1],
    ["red", ["green"], 1],
  ] as [string, string[], number][])(
    "%s valgus + filtrid %j → %s",
    (lightId, filterIds, expected) => {
      expect(blockedShare(lightId, filterIds)).toBeCloseTo(expected, 10);
    },
  );

  it("nimetaja on valguse kanalite arv, mitte alati kolm", () => {
    // Punases valguses ei ole rohelise filtri taha jääda 1/3, vaid 1/1: kogu
    // filtrini jõudnud valgus jääb kinni.
    expect(blockedShare("red", ["green"])).toBe(1);
    expect(blockedShare("yellow", ["blue"])).toBe(1);
    expect(blockedShare("yellow", ["red"])).toBe(0.5);
  });

  it("on alati 0…1", () => {
    for (const light of LIGHTS) {
      for (const combo of slotCombinations()) {
        const share = blockedShare(light.id, combo);
        const where = `${light.id}: ${combo.join("+")}`;
        expect(share, where).toBeGreaterThanOrEqual(0);
        expect(share, where).toBeLessThanOrEqual(1);
      }
    }
  });

  it("ilma filtrita ei jää kunagi midagi kinni", () => {
    for (const light of LIGHTS) {
      expect(blockedShare(light.id, []), light.id).toBe(0);
    }
  });
});

describe("perceivedColour – mis värvi on ekraan", () => {
  it.each([
    ["white", [], "valge"],
    ["white", ["red"], "punane"],
    ["white", ["yellow"], "kollane"],
    ["white", ["yellow", "blue"], "pime"],
    ["white", ["yellow", "green"], "roheline"],
    ["red", ["green"], "pime"],
    ["yellow", ["red"], "punane"],
  ] as [string, string[], string][])(
    "%s valgus + filtrid %j → %s",
    (lightId, filterIds, expected) => {
      expect(perceivedColour(lightId, filterIds)).toBe(expected);
    },
  );

  it("tühja ekraani vastus on pime, mitte must", () => {
    // Ekraan ei ole must ese, ta on lihtsalt valgustamata – moodul
    // `esemete-varvus` ütleb sama tühja hulga kohta „must" ja see vahe on
    // teadlik (sisu/MOODUL-valgusfiltrid.md „Füüsika").
    expect(perceivedColour("white", ["red", "blue"])).toBe("pime");
    expect(perceivedColourForChannels([])).toBe("pime");
  });

  it("ükski valguse ja filtrikombinatsiooni paar ei anna tühja vastust", () => {
    const seen = new Set<string>();
    for (const light of LIGHTS) {
      for (const combo of slotCombinations()) {
        const colour = perceivedColour(light.id, combo);
        expect(colour, `${light.id}: ${combo.join("+")}`).not.toBe("");
        seen.add(colour);
      }
    }
    // Praeguste tabelitega tulevad ette ainult need kuus – „lilla" ja
    // „helesinine" ei tule ühegi kombinatsiooni pealt välja (ükski filter ei
    // lase läbi punast + sinist ega rohelist + sinist). Test ütleb selle
    // välja, et uue filtri lisamine paistaks kohe ära.
    expect([...seen].sort()).toEqual([
      "kollane",
      "pime",
      "punane",
      "roheline",
      "sinine",
      "valge",
    ]);
  });
});

describe("perceivedColourForChannels – kõik kaheksa kanalihulka", () => {
  // Spetsifikatsiooni tabel (sisu/MOODUL-valgusfiltrid.md „Füüsika"), kõik
  // 2^3 alamhulka. Kaks seguvärvi ei tule selle mooduli ülesannetes ette, aga
  // funktsioon peab neile õigesti vastama, kui keegi lisab uue filtri.
  it.each([
    [[], "pime"],
    [["red"], "punane"],
    [["green"], "roheline"],
    [["blue"], "sinine"],
    [["red", "green"], "kollane"],
    [["red", "blue"], "lilla"],
    [["green", "blue"], "helesinine"],
    [["red", "green", "blue"], "valge"],
  ] as [ChannelId[], string][])("%j → %s", (channels, expected) => {
    expect(perceivedColourForChannels(channels)).toBe(expected);
  });

  it("töötab ka iteraatoriga, mida saab ainult ühe korra läbi käia", () => {
    // CodeRabbiti ja Codexi kattuv leid (samm 4.1ee): kui funktsioon käib
    // `Iterable` sisendi kaks korda läbi, on ta teisel korral juba tühi ja
    // vastus tuleks vaikselt „pime". Set-i iteraator ja generaator on täpselt
    // sellised sisendid.
    expect(perceivedColourForChannels(new Set(["red", "green"]).values())).toBe(
      "kollane",
    );
    function* punaneJaSinine(): Generator<string> {
      yield "red";
      yield "blue";
    }
    expect(perceivedColourForChannels(punaneJaSinine())).toBe("lilla");
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

describe("sisu ülesannete vastused (simulatsioon, harjutused, väljumispilet)", () => {
  it("predict ja explore-3: kollane + sinine filter → pime, mitte roheline", () => {
    expect(perceivedColour("white", ["yellow", "blue"])).toBe("pime");
  });

  it("explore-1: punane filter jätab valgest valgusest 2 värvi kinni", () => {
    expect(blockedChannels("white", ["red"])).toHaveLength(2);
  });

  it("explore-2: kollane filter valge valguse ees → kollane ekraan", () => {
    expect(perceivedColour("white", ["yellow"])).toBe("kollane");
  });

  it("explore-4: filtrid vahetusse – ekraan jääb ikka pimedaks", () => {
    expect(perceivedColour("white", ["blue", "yellow"])).toBe("pime");
    expect(perceivedColour("white", ["yellow", "blue"])).toBe("pime");
  });

  it("explore-5: punane valgus + roheline filter → pime", () => {
    expect(perceivedColour("red", ["green"])).toBe("pime");
    expect(blockedShare("red", ["green"])).toBe(1);
  });

  it("practice-1: valge valgus + roheline filter → roheline, 2 jääb kinni", () => {
    expect(perceivedColour("white", ["green"])).toBe("roheline");
    expect(blockedChannels("white", ["green"])).toHaveLength(2);
  });

  it("practice-2: kollane filter laseb läbi 2, kinni jääb 1", () => {
    expect(transmittedChannels("white", ["yellow"])).toHaveLength(2);
    expect(blockedChannels("white", ["yellow"])).toHaveLength(1);
  });

  it("practice-3: kollane + roheline filter → roheline", () => {
    expect(perceivedColour("white", ["yellow", "green"])).toBe("roheline");
  });

  it("practice-4: kollane valgus + sinine filter → pime", () => {
    expect(perceivedColour("yellow", ["blue"])).toBe("pime");
  });

  it("exit-2: sinine filter jätab valgest valgusest 2 värvi kinni", () => {
    expect(blockedChannels("white", ["blue"])).toHaveLength(2);
  });

  it("exit-3: punane ja sinine kile üksteise peal ei anna lillat", () => {
    expect(perceivedColour("white", ["red", "blue"])).toBe("pime");
    // Lilla saaks ÜHE filtriga, mis laseb läbi punase ja sinise – sellist
    // filtrit tabelis ei ole, aga värvinimi on mudelis olemas.
    expect(perceivedColourForChannels(["red", "blue"])).toBe("lilla");
  });
});

describe("vigased sisendid viskavad vea", () => {
  it.each([
    ["transmittedChannels tundmatu valgus", () => transmittedChannels("kuu", ["red"])],
    ["transmittedChannels tundmatu filter", () => transmittedChannels("white", ["lilla"])],
    ["perceivedColour tundmatu filter", () => perceivedColour("white", ["lilla"])],
    ["perceivedColour tundmatu valgus", () => perceivedColour("", [])],
    ["blockedChannels tundmatu filter", () => blockedChannels("white", ["", "red"])],
    ["blockedShare tühi valguse id", () => blockedShare("", [])],
    ["blockedShare must papp ei ole filter", () => blockedShare("white", ["must"])],
  ])("%s", (_name, call) => {
    expect(call).toThrow(RangeError);
  });

  it("tundmatu filter viskab vea ka siis, kui ta on teisel kohal", () => {
    expect(() => transmittedChannels("white", ["red", "roosa"])).toThrow(
      RangeError,
    );
  });
});

describe("tabelite terviklus", () => {
  const channelIds = new Set<string>(CHANNELS.map((channel) => channel.id));

  it("kanalite id-d on unikaalsed", () => {
    expect(channelIds.size).toBe(CHANNELS.length);
  });

  it("igal valgusel on vähemalt üks kanal, kordusteta ja tuntud", () => {
    for (const light of LIGHTS) {
      expect(light.channels.length, light.id).toBeGreaterThan(0);
      expect(new Set<ChannelId>(light.channels).size, light.id).toBe(
        light.channels.length,
      );
      for (const id of light.channels) {
        expect(channelIds, light.id).toContain(id);
      }
    }
  });

  it("iga filter laseb läbi vähemalt ühe kanali, kordusteta ja tuntud", () => {
    // Tühi `passes` oleks must papp, mitte filter – seda mudelis ei ole.
    for (const filter of FILTERS) {
      expect(filter.passes.length, filter.id).toBeGreaterThan(0);
      expect(new Set<ChannelId>(filter.passes).size, filter.id).toBe(
        filter.passes.length,
      );
      for (const id of filter.passes) {
        expect(channelIds, filter.id).toContain(id);
      }
    }
  });

  it("valguste ja filtrite id-d on unikaalsed", () => {
    expect(new Set(LIGHTS.map((light) => light.id)).size).toBe(LIGHTS.length);
    expect(new Set(FILTERS.map((filter) => filter.id)).size).toBe(
      FILTERS.length,
    );
  });

  it("iga kanali kohta on olemas filter, mis ta läbi laseb", () => {
    // Muidu oleks mudelis värv, mida ükski filter ekraanile ei lase, ja
    // simulatsiooni valikurida jääks poolikuks.
    for (const channel of CHANNELS) {
      const passing = FILTERS.filter((filter) =>
        (filter.passes as readonly string[]).includes(channel.id),
      );
      expect(passing.length, channel.id).toBeGreaterThan(0);
    }
  });
});
