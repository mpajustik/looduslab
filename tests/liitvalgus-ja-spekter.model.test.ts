import { describe, expect, it } from "vitest";
import {
  EYE_REGIONS,
  INITIAL_WAVELENGTH_NM,
  INVISIBLE_LABEL,
  LIGHT_SOURCES,
  MIXED_LABEL,
  SLIDERS,
  SPECTRUM_BANDS,
  VISIBLE_MAX_NM,
  VISIBLE_MIN_NM,
  WHITE_LABEL,
  bandCount,
  bandWidthNm,
  bandsForRanges,
  colourAtWavelength,
  emitsAtWavelength,
  emittedBands,
  isCompositeLight,
  perceivedColour,
  perceivedColourForBands,
  visibleRangeWidthNm,
} from "../src/modules/physics/liitvalgus-ja-spekter/model";

/**
 * Liitvalguse ja spektri mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist
 * (sisu/MOODUL-liitvalgus-ja-spekter.md „Füüsika" → testiväärtuste tabel ning
 * sammude juures kirjas olevad vastused), mitte mudelist tagurpidi tuletatud
 * – muidu testiks test iseennast. Kaasa on võetud ka need arvud, mille peal
 * moodul õpilast hiljem päriselt kontrollib (simulatsiooni ülesanded,
 * harjutused, väljumispilet, kordamiskaardid) – nii selgub näpuviga siin,
 * mitte tunnis.
 */

describe("colourAtWavelength – mis värv on selle lainepikkusega valgus", () => {
  it.each([
    [700, "punane"],
    [589, "kollane"],
    [510, "roheline"],
    [470, "sinine"],
    [400, "violett"],
    [430, "tumesinine"],
    [600, "oranž"],
  ])("%s nm → %s", (nm, expected) => {
    expect(colourAtWavelength(nm)).toBe(expected);
  });

  it("riba alumine ots kuulub ribasse: 620 nm on punane", () => {
    expect(colourAtWavelength(620)).toBe("punane");
  });

  it("riba ülemine ots ei kuulu ribasse: 619 nm on veel oranž", () => {
    expect(colourAtWavelength(619)).toBe("oranž");
  });

  it("nähtava ala kõige ülemine ots 760 nm on ikka punane, mitte nähtamatu", () => {
    expect(colourAtWavelength(VISIBLE_MAX_NM)).toBe("punane");
  });

  it.each([370, 379, 761, 800])("%s nm on väljaspool nähtavat ala", (nm) => {
    expect(colourAtWavelength(nm)).toBe(INVISIBLE_LABEL);
  });

  it("nähtava ala alumine ots 380 nm on violett", () => {
    expect(colourAtWavelength(VISIBLE_MIN_NM)).toBe("violett");
  });

  it("harjutus 4 ja rc-3: 589 nm jääb napilt 590-st allapoole ehk kollasesse", () => {
    expect(colourAtWavelength(589)).toBe("kollane");
    expect(colourAtWavelength(590)).toBe("oranž");
  });

  it("liuguri algväärtus 550 nm on roheline (nagu explore-sammu tekst lubab)", () => {
    expect(colourAtWavelength(INITIAL_WAVELENGTH_NM)).toBe("roheline");
  });

  it.each([NaN, Infinity, -500, 0])("vigane lainepikkus %s viskab vea", (nm) => {
    expect(() => colourAtWavelength(nm)).toThrow(RangeError);
  });
});

describe("emitsAtWavelength – kas allikas kiirgab seda lainepikkust", () => {
  it.each([
    ["laser", 650, true],
    ["laser", 500, false],
    ["led", 660, false],
    ["led", 470, true],
    ["sun", 660, true],
    ["sodium", 589, true],
    ["sodium", 620, false],
  ])("%s @ %s nm → %s", (sourceId, nm, expected) => {
    expect(emitsAtWavelength(sourceId as string, nm as number)).toBe(expected);
  });

  it("explore-3: LED-il puudub punane, aga sinine, roheline ja kollane on olemas", () => {
    expect(emitsAtWavelength("led", 640)).toBe(false);
    expect(emitsAtWavelength("led", 700)).toBe(false);
    expect(emitsAtWavelength("led", 460)).toBe(true);
    expect(emitsAtWavelength("led", 520)).toBe(true);
    expect(emitsAtWavelength("led", 580)).toBe(true);
  });

  it("pidev allikas kiirgab ka nähtava ala kõige ülemises otsas 760 nm", () => {
    expect(emitsAtWavelength("sun", VISIBLE_MAX_NM)).toBe(true);
    expect(emitsAtWavelength("bulb", VISIBLE_MIN_NM)).toBe(true);
  });

  it("naatriumlamp EI kiirga 590 nm juures – vahemiku ülemine ots ei kuulu sisse", () => {
    expect(emitsAtWavelength("sodium", 590)).toBe(false);
  });

  it("tundmatu allikas viskab vea", () => {
    expect(() => emitsAtWavelength("kuu", 500)).toThrow(RangeError);
  });

  it("vigane lainepikkus viskab vea ka olemasoleva allika juures", () => {
    expect(() => emitsAtWavelength("sun", NaN)).toThrow(RangeError);
  });
});

describe("bandCount ja emittedBands – mitu vikerkaarevärvi spektris on", () => {
  it.each([
    ["sun", 7],
    ["bulb", 7],
    ["led", 4],
    ["sodium", 1],
    ["laser", 1],
  ])("%s → %s riba", (sourceId, expected) => {
    expect(bandCount(sourceId as string)).toBe(expected);
  });

  it("explore-1: päikesevalguse spektris on kõik seitse vikerkaarevärvi", () => {
    expect(bandCount("sun")).toBe(SPECTRUM_BANDS.length);
  });

  it("valge LED katab sinise, rohelise, kollase ja oranži – punast ei ole", () => {
    expect(emittedBands("led").map((band) => band.id)).toEqual([
      "blue",
      "green",
      "yellow",
      "orange",
    ]);
  });

  it("naatriumlamp jääb ühte ribasse: kollane", () => {
    expect(emittedBands("sodium").map((band) => band.label)).toEqual(["kollane"]);
  });

  it("laser jääb ühte ribasse: punane", () => {
    expect(emittedBands("laser").map((band) => band.label)).toEqual(["punane"]);
  });

  it("riba ots ei tee ribat: täpselt 495–570 nm annab ainult rohelise", () => {
    const bands = bandsForRanges([{ minNm: 495, maxNm: 570 }]);
    expect(bands.map((band) => band.id)).toEqual(["green"]);
  });

  it("kattuvad vahemikud ei loe sama riba kaks korda", () => {
    const bands = bandsForRanges([
      { minNm: 500, maxNm: 520 },
      { minNm: 510, maxNm: 560 },
    ]);
    expect(bands.map((band) => band.id)).toEqual(["green"]);
  });

  it("tundmatu allikas viskab vea", () => {
    expect(() => bandCount("kuu")).toThrow(RangeError);
    expect(() => emittedBands("kuu")).toThrow(RangeError);
  });

  it.each([
    ["tagurpidi vahemik", { minNm: 600, maxNm: 500 }],
    ["nullpikkune vahemik", { minNm: 500, maxNm: 500 }],
    ["negatiivne alumine ots", { minNm: -10, maxNm: 500 }],
    ["mittearvuline ots", { minNm: 500, maxNm: NaN }],
  ])("vigane vahemik (%s) viskab vea, ei anna vaikselt tühja loendit", (_what, range) => {
    expect(() => bandsForRanges([range as { minNm: number; maxNm: number }])).toThrow(
      RangeError,
    );
  });
});

describe("isCompositeLight – liht- või liitvalgus", () => {
  it.each([
    ["sun", true],
    ["bulb", true],
    ["led", true],
    ["sodium", false],
    ["laser", false],
  ])("%s → liitvalgus: %s", (sourceId, expected) => {
    expect(isCompositeLight(sourceId as string)).toBe(expected);
  });

  it("predict ja explore-4: laser ja naatriumlamp on lihtvalgus", () => {
    expect(isCompositeLight("laser")).toBe(false);
    expect(isCompositeLight("sodium")).toBe(false);
  });
});

describe("perceivedColour – kuidas silm valgust näeb", () => {
  it.each([
    ["sun", WHITE_LABEL],
    ["bulb", WHITE_LABEL],
    ["led", WHITE_LABEL],
    ["sodium", "kollane"],
    ["laser", "punane"],
  ])("%s → %s", (sourceId, expected) => {
    expect(perceivedColour(sourceId as string)).toBe(expected);
  });

  it("explore-3: LED paistab valge, kuigi punast riba tal ei ole", () => {
    expect(perceivedColour("led")).toBe(WHITE_LABEL);
    expect(emittedBands("led").some((band) => band.id === "red")).toBe(false);
  });

  it("kolmas haru: punane + sinine (roheline ala puudu) on segavärv", () => {
    const bands = bandsForRanges([
      { minNm: 630, maxNm: 700 },
      { minNm: 455, maxNm: 490 },
    ]);
    expect(bands.map((band) => band.id)).toEqual(["blue", "red"]);
    expect(perceivedColourForBands(bands)).toBe(MIXED_LABEL);
  });

  it("üksik riba annab alati oma nime", () => {
    for (const band of SPECTRUM_BANDS) {
      expect(perceivedColourForBands([band])).toBe(band.label);
    }
  });

  it("kolme piirkonna reegel käib enne ribade arvu: violett + roheline + punane on valge", () => {
    const bands = SPECTRUM_BANDS.filter((band) =>
      ["violet", "green", "red"].includes(band.id),
    );
    expect(perceivedColourForBands(bands)).toBe(WHITE_LABEL);
  });
});

describe("bandWidthNm ja visibleRangeWidthNm – laiused", () => {
  it.each([
    ["green", 75],
    ["red", 140],
    ["yellow", 20],
    ["violet", 45],
  ])("%s riba laius on %s nm", (bandId, expected) => {
    expect(bandWidthNm(bandId as string)).toBe(expected);
  });

  it("harjutus 2: roheline riba 495–570 nm on 75 nm lai", () => {
    expect(bandWidthNm("green")).toBe(75);
  });

  it("exit-2: nähtav ala 380–760 nm on 380 nm lai", () => {
    expect(visibleRangeWidthNm()).toBe(380);
  });

  it("tundmatu riba viskab vea", () => {
    expect(() => bandWidthNm("roosa")).toThrow(RangeError);
  });
});

describe("tabelid ise on terved", () => {
  it("ribad on järjest, augukohtadeta ja katavad kogu nähtava ala", () => {
    expect(SPECTRUM_BANDS[0].minNm).toBe(VISIBLE_MIN_NM);
    expect(SPECTRUM_BANDS[SPECTRUM_BANDS.length - 1].maxNm).toBe(VISIBLE_MAX_NM);
    for (let i = 1; i < SPECTRUM_BANDS.length; i += 1) {
      expect(SPECTRUM_BANDS[i].minNm).toBe(SPECTRUM_BANDS[i - 1].maxNm);
    }
  });

  it("iga riba on positiivse laiusega ja tal on eestikeelne nimi", () => {
    for (const band of SPECTRUM_BANDS) {
      expect(band.maxNm).toBeGreaterThan(band.minNm);
      expect(band.label.length).toBeGreaterThan(0);
    }
  });

  it("silma kolm piirkonda katavad iga riba täpselt ühe korra", () => {
    const covered = Object.values(EYE_REGIONS).flatMap((region) => [...region]);
    expect([...covered].sort()).toEqual(
      SPECTRUM_BANDS.map((band) => band.id).sort(),
    );
  });

  it("iga allika kiirgus jääb nähtavasse alasse ja vahemikud on kasvavad", () => {
    for (const source of LIGHT_SOURCES) {
      expect(source.emitted.length).toBeGreaterThan(0);
      for (const range of source.emitted) {
        expect(range.maxNm).toBeGreaterThan(range.minNm);
        expect(range.minNm).toBeGreaterThanOrEqual(VISIBLE_MIN_NM);
        expect(range.maxNm).toBeLessThanOrEqual(VISIBLE_MAX_NM);
      }
    }
  });

  it("allikate id-d ja ribade id-d on kordumatud", () => {
    const sourceIds = LIGHT_SOURCES.map((source) => source.id);
    const bandIds = SPECTRUM_BANDS.map((band) => band.id);
    expect(new Set(sourceIds).size).toBe(sourceIds.length);
    expect(new Set(bandIds).size).toBe(bandIds.length);
  });
});

describe("liuguri piirid – kas ülesande vastust saab üldse seada", () => {
  it("liugur katab täpselt nähtava ala", () => {
    expect(SLIDERS.wavelengthNm.min).toBe(VISIBLE_MIN_NM);
    expect(SLIDERS.wavelengthNm.max).toBe(VISIBLE_MAX_NM);
  });

  it.each([
    ["algväärtus", INITIAL_WAVELENGTH_NM],
    ["explore-2 vastus 650 nm", 650],
    ["liuguri ülemine ots", VISIBLE_MAX_NM],
  ])("%s satub liuguri võre peale", (_what, nm) => {
    const steps = ((nm as number) - SLIDERS.wavelengthNm.min) / SLIDERS.wavelengthNm.step;
    expect(Number.isInteger(steps)).toBe(true);
  });

  it("algväärtus jääb liuguri piiridesse", () => {
    expect(INITIAL_WAVELENGTH_NM).toBeGreaterThanOrEqual(SLIDERS.wavelengthNm.min);
    expect(INITIAL_WAVELENGTH_NM).toBeLessThanOrEqual(SLIDERS.wavelengthNm.max);
  });

  it("explore-2: laseri riba on liuguri sammuga leitav (±5 nm tolerants)", () => {
    // Vastus 650 nm ja tolerants ±5 nm ehk lubatud liuguri asendid 645, 650 ja
    // 655. Riba on värviline asendites 645 ja 650; 655 on vahemiku ülemine ots,
    // mis mudeli ühtse reegli järgi enam ei kiirga, aga tolerantsi sisse jääb.
    // ±10 nm oleks lubanud ka 640 ja 660, kus riba on selgelt TUME – siis
    // ütleksid simulatsioon ja kontroll õpilasele eri asja (Codexi leid 4.1v).
    expect(emitsAtWavelength("laser", 645)).toBe(true);
    expect(emitsAtWavelength("laser", 650)).toBe(true);
    expect(emitsAtWavelength("laser", 640)).toBe(false);
    expect(emitsAtWavelength("laser", 660)).toBe(false);
  });
});
