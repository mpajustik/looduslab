import { describe, expect, it } from "vitest";
import {
  BALL_DIAMETER_M,
  SLIDERS,
  hasUmbra,
  metersToCm,
  penumbraBandWidth,
  totalShadowWidth,
  umbraLengthBehindObject,
  umbraWidth,
} from "../src/modules/physics/vari-ja-poolvari/model";

/**
 * Täisvarju ja poolvarju mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist (sisu/MOODUL-vari-ja-poolvari.md
 * „Füüsika" → testiväärtuste tabel ning sammude juures kirjas olevad
 * vastused), mitte mudelist tagurpidi tuletatud – muidu testiks test
 * iseennast. Kaasa on võetud ka need arvud, mille peal moodul õpilast hiljem
 * päriselt kontrollib (simulatsiooni ülesanded, harjutused, väljumispilet,
 * kordamiskaardid) – nii selgub näpuviga siin, mitte tunnis.
 *
 * Sisufaile (manifest, activities) siin veel ei ole – need tulevad järgmise
 * sammuga ja siis lisandub siia ka nende leping, nagu teistes moodulites.
 */

describe("umbraWidth – täisvarju laius ekraanil", () => {
  it.each([
    ["punktallikas", 0.1, 0, 1, 3, 0.3],
    ["väike lamp", 0.1, 0.05, 1, 3, 0.2],
    ["lai lamp – täisvari on otsas", 0.1, 0.2, 1, 3, 0],
    ["allikas = keha", 0.1, 0.1, 1, 5, 0.1],
    ["ekraan keha juures", 0.1, 0.2, 1, 1.01, 0.099],
  ])("%s → %s m", (_what, d, s, a, b, expected) => {
    expect(umbraWidth(d, s, a, b)).toBeCloseTo(expected, 9);
  });

  it("punktallikas: vari on sama palju kordi laiem kui keha, kui palju kordi on ekraan kaugemal", () => {
    // Väärarusaam `vari-sama-suur-kui-keha`: 10 cm pall annab 3 m peal 30 cm
    // varju. Just seda näitab explore-1.
    expect(umbraWidth(BALL_DIAMETER_M, 0, 1, 3)).toBeCloseTo(
      BALL_DIAMETER_M * 3,
      9,
    );
    expect(umbraWidth(BALL_DIAMETER_M, 0, 1, 4)).toBeCloseTo(0.4, 9); // harjutus 1 (näidis)
  });

  it("laiem allikas SÖÖB täisvarju – ta ei tee seda laiemaks", () => {
    // Väärarusaam `laiem-allikas-laiem-vari` ja predict-sammu õige vastus (b).
    const sama = [BALL_DIAMETER_M, 1, 3] as const;
    const kitsenev = [0, 0.05, 0.1, 0.15].map((s) =>
      umbraWidth(sama[0], s, sama[1], sama[2]),
    );
    for (let i = 1; i < kitsenev.length; i += 1) {
      expect(kitsenev[i]).toBeLessThan(kitsenev[i - 1]);
    }
  });

  it("allikas = keha → täisvari on silinder: täpselt keha laiune ükskõik kui kaugel", () => {
    for (const b of [1.2, 2, 3, 5, 50]) {
      expect(umbraWidth(0.1, 0.1, 1, b)).toBeCloseTo(0.1, 9);
    }
  });

  it("negatiivset täisvarju ei tagastata – miinuse asemel on null", () => {
    // (0,1 · 3 − 0,2 · 2) / 1 = −0,1 → 0. „−10 cm laiune täisvari" ei tähenda
    // õpilase jaoks midagi; füüsikas tähendab miinus „täisvarju ei ole".
    expect(umbraWidth(0.1, 0.2, 1, 3)).toBe(0);
    expect(umbraWidth(0.1, 0.4, 1, 5)).toBe(0);
  });

  it("täpselt ekraanil lõppev täisvari annab nulli, mitte ujukomatolmu", () => {
    // Codexi leid 2026-08-10: (0,1 · 1,5 − 0,3 · 0,5) on paberil täpselt 0, aga
    // ujukomas 2,8e-17. Ilma läveta väidaks `hasUmbra` siin, et täisvari on
    // olemas, ja õpilane näeks suurt „0 cm" seal, kus peab seisma „täisvarju ei
    // ole". Kõik kolm väärtust on liuguritega seatavad, seega see seis on
    // päriselt kättesaadav.
    expect(umbraWidth(0.1, 0.3, 1, 1.5)).toBe(0);
    expect(hasUmbra(0.1, 0.3, 1, 1.5)).toBe(false);
  });

  it("nanomeetri-lävi ei söö ära ühtki nähtavat täisvarju", () => {
    // Lävi tohib kustutada ainult arvutusjääki. Väikseim täisvari, mida moodul
    // päriselt näitab, on sentimeetrite kandis – kontrolliks siin sajandik
    // millimeetrit, mis on lävest sada tuhat korda suurem ja peab alles jääma.
    expect(umbraWidth(0.1, 0.3, 1, 1.4999)).toBeGreaterThan(0);
    expect(hasUmbra(0.1, 0.3, 1, 1.4999)).toBe(true);
  });

  it("harjutus 2 (osaline lahendus): 6 cm lai lamp annab 18 cm täisvarju", () => {
    expect(umbraWidth(0.1, 0.06, 1, 3)).toBeCloseTo(0.18, 9);
  });

  it("väljumispilet 2: punktallikas, keha 5 cm, keha 0,5 m, ekraan 2 m → 20 cm", () => {
    expect(umbraWidth(0.05, 0, 0.5, 2)).toBeCloseTo(0.2, 9);
  });
});

describe("penumbraBandWidth – poolvarju riba laius ühel serval", () => {
  it.each([
    ["punktallikas", 0, 1, 3, 0],
    ["väike lamp", 0.05, 1, 3, 0.1],
    ["lai lamp", 0.2, 1, 3, 0.4],
    ["allikas = keha", 0.1, 1, 5, 0.4],
    ["ekraan keha juures", 0.2, 1, 1.01, 0.002],
  ])("%s → %s m", (_what, s, a, b, expected) => {
    expect(penumbraBandWidth(s, a, b)).toBeCloseTo(expected, 9);
  });

  it("punktallikas annab täpselt nulli – seepärast on tema vari teravaservaline", () => {
    // Väärarusaam `punktallikas-annab-poolvarju` ja explore-1 kontrollküsimus.
    for (const b of [1.2, 2, 3, 5]) {
      expect(penumbraBandWidth(0, 1, b)).toBe(0);
    }
  });

  it("poolvarju riba ei sõltu keha suurusest, ainult allikast ja kaugustest", () => {
    // Funktsioon ei võtagi keha läbimõõtu – seda valvab siin see, et kogu vari
    // kasvab suurema palli juures TÄPSELT täisvarju võrra ja mitte rohkem.
    const väikePall = totalShadowWidth(0.1, 0.05, 1, 3);
    const suurPall = totalShadowWidth(0.5, 0.05, 1, 3);
    expect(suurPall - väikePall).toBeCloseTo(
      umbraWidth(0.5, 0.05, 1, 3) - umbraWidth(0.1, 0.05, 1, 3),
      9,
    );
  });

  it("mida kaugemal ekraan, seda laiem riba – pea vari on hägusam kui jalgade oma", () => {
    // Harjutus 3 õige vastus (a): pea on maapinnast kaugemal.
    expect(penumbraBandWidth(0.05, 1, 1.01)).toBeLessThan(
      penumbraBandWidth(0.05, 1, 3),
    );
  });
});

describe("totalShadowWidth – kogu tume ala", () => {
  it.each([
    ["punktallikas", 0.1, 0, 1, 3, 0.3],
    ["väike lamp", 0.1, 0.05, 1, 3, 0.4],
    ["lai lamp", 0.1, 0.2, 1, 3, 0.7],
    ["allikas = keha", 0.1, 0.1, 1, 5, 0.9],
    ["ekraan keha juures", 0.1, 0.2, 1, 1.01, 0.103],
  ])("%s → %s m", (_what, d, s, a, b, expected) => {
    expect(totalShadowWidth(d, s, a, b)).toBeCloseTo(expected, 9);
  });

  it("kokku = täisvari + kaks poolvarju riba, niikaua kui täisvari on olemas", () => {
    for (const [d, s, a, b] of [
      [0.1, 0, 1, 3],
      [0.1, 0.05, 1, 3],
      [0.1, 0.1, 1, 5],
      [0.1, 0.2, 1, 1.01],
    ] as const) {
      expect(hasUmbra(d, s, a, b)).toBe(true);
      expect(totalShadowWidth(d, s, a, b)).toBeCloseTo(
        umbraWidth(d, s, a, b) + 2 * penumbraBandWidth(s, a, b),
        9,
      );
    }
  });

  it("pärast täisvarju kadumist seos EI kehti – see on teadlik", () => {
    // Nulliga piiramine on õpilase huvides, aga tal on hind: 0 + 2 · 0,4 = 0,8,
    // päris tume ala on 0,7. Kui see test kunagi „ära paraneb", tähendab see,
    // et keegi on nulliga piiramise ära võtnud.
    expect(hasUmbra(0.1, 0.2, 1, 3)).toBe(false);
    expect(totalShadowWidth(0.1, 0.2, 1, 3)).toBeCloseTo(0.7, 9);
    expect(umbraWidth(0.1, 0.2, 1, 3) + 2 * penumbraBandWidth(0.2, 1, 3)).toBeCloseTo(
      0.8,
      9,
    );
  });

  it("kogu vari ei kao ka siis, kui täisvari on kadunud – jääb hägune laik", () => {
    expect(totalShadowWidth(0.1, 0.4, 1, 5)).toBeGreaterThan(0);
  });
});

describe("umbraLengthBehindObject – kui kaugele keha taha täisvari ulatub", () => {
  it("20 cm lai allikas: 10 cm palli täisvari lõpeb 1 m palli taga", () => {
    expect(umbraLengthBehindObject(0.1, 0.2, 1)).toBeCloseTo(1, 9);
  });

  it("harjutus 4: 30 cm lai lamp → täisvari ulatub 0,5 m palli taha", () => {
    expect(umbraLengthBehindObject(0.1, 0.3, 1)).toBeCloseTo(0.5, 9);
  });

  it("edasi-tagasi: seal, kus täisvari lõpeb, annab umbraWidth nulli", () => {
    // explore-3 vastus: 20 cm laia allikaga kaob täisvari 2 m peal ALLIKAST
    // (1 m palli taga). Kaks eri valemit peavad näitama sama kohta.
    const kehaTaga = umbraLengthBehindObject(0.1, 0.2, 1);
    const allikast = 1 + kehaTaga;
    expect(allikast).toBeCloseTo(2, 9);
    expect(umbraWidth(0.1, 0.2, 1, allikast)).toBeCloseTo(0, 9);
    expect(umbraWidth(0.1, 0.2, 1, allikast - 0.001)).toBeGreaterThan(0);
    expect(umbraWidth(0.1, 0.2, 1, allikast + 0.001)).toBe(0);
  });

  it("explore-3 algseis: 1,2 m peal on täisvari veel olemas (8 cm)", () => {
    // Ülesande sõnastus nõuab ekraani tagasitoomist 1,2 m peale; kui seal enam
    // täisvarju ei oleks, ei näeks õpilane üleminekut.
    expect(umbraWidth(0.1, 0.2, 1, 1.2)).toBeCloseTo(0.08, 9);
    expect(hasUmbra(0.1, 0.2, 1, 1.2)).toBe(true);
  });

  it("allikas kehast väiksem või sama lai → täisvari ei lõpe kunagi", () => {
    expect(umbraLengthBehindObject(0.1, 0, 1)).toBe(Number.POSITIVE_INFINITY);
    expect(umbraLengthBehindObject(0.1, 0.05, 1)).toBe(Number.POSITIVE_INFINITY);
    expect(umbraLengthBehindObject(0.1, 0.1, 1)).toBe(Number.POSITIVE_INFINITY);
  });

  it("mida laiem allikas, seda lühem täisvari", () => {
    expect(umbraLengthBehindObject(0.1, 0.3, 1)).toBeLessThan(
      umbraLengthBehindObject(0.1, 0.2, 1),
    );
  });
});

describe("hasUmbra – kas ekraanil on üldse täisvarju", () => {
  it("explore-4: pall allikale lähemale → täisvari jääb kadunuks, poolvari läheb laiemaks", () => {
    // Valikküsimuse õige vastus (b). Mõlemat poolt kontrollitakse, sest
    // vastusevariant (a) „täisvari tuleb tagasi" on just see, mida õpilane
    // ootab.
    expect(hasUmbra(0.1, 0.2, 1, 3)).toBe(false);
    expect(hasUmbra(0.1, 0.2, 0.5, 3)).toBe(false);
    expect(penumbraBandWidth(0.2, 0.5, 3)).toBeGreaterThan(
      penumbraBandWidth(0.2, 1, 3),
    );
    expect(totalShadowWidth(0.1, 0.2, 0.5, 3)).toBeGreaterThan(
      totalShadowWidth(0.1, 0.2, 1, 3),
    );
  });
});

describe("metersToCm – ühikuteisendus", () => {
  it.each([
    [0.3, 30],
    [0.2, 20],
    [0.08, 8],
    [0, 0],
  ])("%s m → %s cm", (m, cm) => {
    expect(metersToCm(m)).toBeCloseTo(cm, 9);
  });

  it("null on lubatud – „täisvarju 0 cm\" on päris tulemus, mitte viga", () => {
    expect(metersToCm(umbraWidth(0.1, 0.2, 1, 3))).toBe(0);
  });

  it("negatiivne pikkus viskab vea", () => {
    expect(() => metersToCm(-0.1)).toThrow(RangeError);
  });
});

describe("SLIDERS – liugurite piirid", () => {
  it("b > a on liuguritega alati täidetud, ilma et komponent peaks piirama", () => {
    // Mooduli spetsi otsus: `a` suurim väärtus on väiksem kui `b` vähim, seega
    // ei saa ükski liuguriseis mudelit vea viskama panna. Kui keegi vahemikke
    // muudab, kukub see test enne, kui õpilane simulatsiooni katki näeb.
    expect(SLIDERS.objectDistanceM.max).toBeLessThan(
      SLIDERS.screenDistanceM.min,
    );
  });

  it("punktallikas on liuguri päris väärtus, mitte eraldi nupp", () => {
    expect(SLIDERS.sourceWidthM.min).toBe(0);
  });

  it("ülesannete väärtused jäävad liugurite vahemikku ja sammu peale", () => {
    // explore 1–4 nõuavad: s = 0 / 0,05 / 0,2 m; b = 3 / 1,2 m; a = 1 / 0,5 m.
    const sammuPeal = (v: number, { min, max, step }: { min: number; max: number; step: number }) =>
      v >= min && v <= max && Math.abs(Math.round((v - min) / step) - (v - min) / step) < 1e-9;

    for (const s of [0, 0.05, 0.2]) {
      expect(sammuPeal(s, SLIDERS.sourceWidthM)).toBe(true);
    }
    for (const b of [1.2, 2, 3]) {
      expect(sammuPeal(b, SLIDERS.screenDistanceM)).toBe(true);
    }
    for (const a of [0.5, 1]) {
      expect(sammuPeal(a, SLIDERS.objectDistanceM)).toBe(true);
    }
  });

  it("explore-3 vastus 2 m mahub liuguri vahemikku", () => {
    expect(2).toBeGreaterThanOrEqual(SLIDERS.screenDistanceM.min);
    expect(2).toBeLessThanOrEqual(SLIDERS.screenDistanceM.max);
  });
});

describe("vigased sisendid viskavad vea, mitte ei paranda ennast vaikselt", () => {
  it.each([
    ["keha läbimõõt 0", () => umbraWidth(0, 0.05, 1, 3)],
    ["keha läbimõõt negatiivne", () => umbraWidth(-0.1, 0.05, 1, 3)],
    ["allika laius negatiivne", () => umbraWidth(0.1, -1, 1, 3)],
    ["kaugus kehani 0", () => umbraWidth(0.1, 0.05, 0, 3)],
    ["ekraan keha peal (b = a)", () => umbraWidth(0.1, 0.05, 1, 1)],
    ["ekraan keha ees (b < a)", () => umbraWidth(0.1, 0.05, 1, 0.5)],
    ["poolvari: b = a", () => penumbraBandWidth(0.05, 1, 1)],
    ["poolvari: allika laius negatiivne", () => penumbraBandWidth(-1, 1, 3)],
    ["kokku: b < a", () => totalShadowWidth(0.1, 0.05, 1, 0.5)],
    ["ulatus: keha läbimõõt 0", () => umbraLengthBehindObject(0, 0.2, 1)],
    ["ulatus: kaugus 0", () => umbraLengthBehindObject(0.1, 0.2, 0)],
    ["ulatus: allika laius negatiivne", () => umbraLengthBehindObject(0.1, -1, 1)],
    ["NaN sisendina", () => umbraWidth(0.1, Number.NaN, 1, 3)],
  ])("%s", (_what, kutse) => {
    expect(kutse).toThrow(RangeError);
  });
});
