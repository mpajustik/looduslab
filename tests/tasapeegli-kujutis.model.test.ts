import { describe, expect, it } from "vitest";
import {
  EYE_BELOW_TOP_M,
  SLIDERS,
  eyeHeight,
  imageDistance,
  imageHeight,
  minMirrorHeight,
  mirrorBottomEdgeHeight,
  mirrorTopEdgeHeight,
  objectImageSeparation,
  visibleBodyHeight,
  visibleBottomHeight,
} from "../src/modules/physics/tasapeegli-kujutis/model";

/**
 * Tasapeegli kujutise mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist
 * (sisu/MOODUL-tasapeegli-kujutis.md „Füüsika" → testiväärtuste tabel ning
 * sammude juures kirjas olevad vastused), mitte mudelist tagurpidi tuletatud
 * – muidu testiks test iseennast. Kaasa on võetud ka need arvud, mille peal
 * moodul õpilast hiljem päriselt kontrollib (simulatsiooni ülesanded,
 * harjutused, väljumispilet, kordamiskaardid) – nii selgub näpuviga siin,
 * mitte tunnis.
 *
 * Manifest, sammud ja õpetajajuhend tulevad järgmise sammuga; siis lisandub
 * siia faili teine pool, mis valvab sisufaile (nii nagu moodulites
 * `vari-ja-poolvari` ja `varjutused`).
 */

describe("imageDistance – kus kujutis on", () => {
  it.each([
    [0.5, 0.5],
    [1, 1],
    [2.5, 2.5],
    [1.2, 1.2],
  ])("%s m peegli ees → %s m peegli taga", (d, expected) => {
    expect(imageDistance(d)).toBeCloseTo(expected, 9);
  });

  it("explore-1: 1 m kaugusel seistes on kujutis 1 m peegli taga", () => {
    expect(imageDistance(1)).toBeCloseTo(1, 9);
  });
});

describe("objectImageSeparation – vahemaa sinust kujutiseni", () => {
  it.each([
    ["explore-2: 2,5 m kaugusel", 2.5, 5],
    ["exit-2: 1,2 m kaugusel", 1.2, 2.4],
    ["rc-3: 1,5 m kaugusel", 1.5, 3],
    ["harjutus 1 (näidis): 0,6 m kaugusel", 0.6, 1.2],
    ["harjutus 1 (näidis) pärast sammu: 0,4 m kaugusel", 0.4, 0.8],
  ])("%s → %s m", (_what, d, expected) => {
    expect(objectImageSeparation(d as number)).toBeCloseTo(expected as number, 9);
  });

  it("üks samm lähemale kahandab vahet KAHE sammu võrra", () => {
    // Lahendatud näidise (practice-1) mõte: 0,6 m → 0,4 m ehk 0,2 m samm
    // kahandab vahet 0,4 m võrra. Just see üllatab õpilast.
    const enne = objectImageSeparation(0.6);
    const pärast = objectImageSeparation(0.4);
    expect(enne - pärast).toBeCloseTo(2 * (0.6 - 0.4), 9);
    expect(enne - pärast).toBeCloseTo(0.4, 9);
  });

  it("vahemaa on alati täpselt kaks korda kaugus peeglist", () => {
    for (const d of [0.5, 1, 1.7, 3]) {
      expect(objectImageSeparation(d)).toBeCloseTo(2 * imageDistance(d), 9);
    }
  });
});

describe("imageHeight – kujutis on esemega ühesuurune", () => {
  it.each([
    [1.6, 1.6],
    [1.8, 1.8],
    [0.2, 0.2],
  ])("%s m ese → %s m kujutis", (h, expected) => {
    expect(imageHeight(h)).toBeCloseTo(expected, 9);
  });

  it("kaugus ei kahanda kujutist – funktsioon ei võtagi kaugust", () => {
    // Väärarusaam `kujutis-vaheneb-kaugusega`. Kaugust ei ole valemis, seega
    // ei saa teda ka kogemata sisse tuua; siin on see väide kirjas testina.
    expect(imageHeight.length).toBe(1);
    expect(imageHeight(1.6)).toBe(1.6);
  });
});

describe("minMirrorHeight – pool pikkusest piisab", () => {
  it.each([
    ["explore-5: 1,8 m inimene", 1.8, 0.9],
    ["harjutus 2: Mari 1,5 m", 1.5, 0.75],
    ["rc-4: 1,8 m inimene", 1.8, 0.9],
    ["algseis: 1,6 m inimene", 1.6, 0.8],
    ["exit-3: sõber 1,7 m", 1.7, 0.85],
  ])("%s → %s m", (_what, h, expected) => {
    expect(minMirrorHeight(h as number)).toBeCloseTo(expected as number, 9);
  });

  it("EI sõltu kaugusest – kaugus ei ole isegi parameeter", () => {
    // Väärarusaam `taispikk-peegel` ja mooduli kõige üllatavam tulemus.
    expect(minMirrorHeight.length).toBe(1);
  });

  it("täpselt vähima peegli juures paistab TÄPSELT kogu inimene, mitte grammi rohkem", () => {
    for (const h of [1.2, 1.5, 1.6, 1.8, 1.9]) {
      const m = minMirrorHeight(h);
      expect(visibleBodyHeight(m, h)).toBeCloseTo(h, 9);
      expect(visibleBottomHeight(m, h)).toBeCloseTo(0, 9);
      // Grammi võrra väiksem peegel EI näita enam jalgu.
      expect(visibleBodyHeight(m - 0.001, h)).toBeLessThan(h);
      expect(visibleBottomHeight(m - 0.001, h)).toBeGreaterThan(0);
    }
  });

  it("exit-3: 1,7 m inimesele piisab 0,85 m peeglist, seega 1 m peegel on juba küllalt suur", () => {
    expect(minMirrorHeight(1.7)).toBeCloseTo(0.85, 9);
    expect(visibleBodyHeight(1, 1.7)).toBeCloseTo(1.7, 9);
  });
});

describe("visibleBodyHeight – kui suur osa sinust peeglist paistab", () => {
  // Spetsifikatsiooni testiväärtuste tabel (sisu/MOODUL-tasapeegli-kujutis.md).
  it.each([
    ["lähedal", 0.4, 1.6, 0.8],
    ["kaugel (sama peegel, sama inimene)", 0.4, 1.6, 0.8],
    ["täpselt pool", 0.8, 1.6, 1.6],
    ["liiga suur peegel", 1.2, 1.6, 1.6],
    ["pisike peegel", 0.15, 1.7, 0.3],
    ["harjutus 4: 0,3 m peegel, 1,7 m inimene", 0.3, 1.7, 0.6],
  ])("%s: peegel %s m, inimene %s m → %s m", (_what, m, h, expected) => {
    expect(visibleBodyHeight(m as number, h as number)).toBeCloseTo(
      expected as number,
      9,
    );
  });

  it("KAUGUS EI MUUDA nähtavat osa – see on mooduli põhitõde", () => {
    // Väärarusaam `kaugus-muudab-vaadet`, predict-samm ja explore-4.
    // Kaugus ei ole funktsiooni parameeter – ja just see ongi füüsikaväide,
    // seepärast kontrollib test funktsiooni kuju, mitte ainult arve.
    expect(visibleBodyHeight.length).toBe(2);
    // explore-3 (1 m) ja explore-4 (3 m): peegel ja inimene samad, kaugus
    // muutub kolmekordseks, vastus jääb 0,8 m. Seis on liuguritega seatav,
    // seega õpilane näeb päriselt sedasama.
    expect(visibleBodyHeight(0.4, 1.6)).toBeCloseTo(0.8, 9);
    for (const d of [1, 3]) {
      expect(d).toBeGreaterThanOrEqual(SLIDERS.objectDistanceM.min);
      expect(d).toBeLessThanOrEqual(SLIDERS.objectDistanceM.max);
      // Kaugus muudab AINULT kujutise kaugust, mitte nähtavat osa.
      expect(imageDistance(d)).toBeCloseTo(d, 9);
    }
  });

  it("peeglist paistab kaks korda rohkem, kui peegel ise kõrge on", () => {
    // Kuni piirini `H`. Harjutus 4 vihje ütleb sedasama sõnadega.
    for (const m of [0.15, 0.3, 0.4, 0.5]) {
      expect(visibleBodyHeight(m, 1.9)).toBeCloseTo(2 * m, 9);
    }
  });

  it("liiga suur peegel ei tekita inimest juurde", () => {
    // 2 · 1,2 = 2,4, aga inimene on 1,6 – piiramine annab 1,6. Ilma selleta
    // näitaks simulatsioon „3,2 m inimest" ja kiri „kogu inimene" kaotaks mõtte.
    expect(visibleBodyHeight(1.2, 1.6)).toBeCloseTo(1.6, 9);
    expect(visibleBodyHeight(5, 1.6)).toBeCloseTo(1.6, 9);
    expect(visibleBodyHeight(1.2, 1.6)).toBeLessThan(2 * 1.2);
  });

  it("suurem peegel ei näita kunagi vähem", () => {
    let eelmine = 0;
    for (let m = 0.1; m <= 1.0001; m += 0.05) {
      const nüüd = visibleBodyHeight(m, 1.6);
      expect(nüüd).toBeGreaterThanOrEqual(eelmine);
      eelmine = nüüd;
    }
  });
});

describe("visibleBottomHeight – kust nähtav osa algab", () => {
  it.each([
    ["lähedal / kaugel: 0,4 m peegel, 1,6 m inimene", 0.4, 1.6, 0.8],
    ["täpselt pool: jalad on ka näha", 0.8, 1.6, 0],
    ["liiga suur peegel: jalad on ka näha", 1.2, 1.6, 0],
    ["pisike peegel: peeglist paistab ainult pea", 0.15, 1.7, 1.4],
  ])("%s → %s m", (_what, m, h, expected) => {
    expect(visibleBottomHeight(m as number, h as number)).toBeCloseTo(
      expected as number,
      9,
    );
  });

  it("nähtav osa + nähtamatu alaosa = kogu inimene, alati", () => {
    for (const h of [1.2, 1.6, 1.7, 1.9]) {
      for (const m of [0.1, 0.15, 0.3, 0.4, 0.8, 1, 1.2]) {
        expect(
          visibleBodyHeight(m, h) + visibleBottomHeight(m, h),
          `M=${m} H=${h}`,
        ).toBeCloseTo(h, 9);
      }
    }
  });

  it("kunagi ei tule negatiivset – „−0,8 m maast\" ei tähenda midagi", () => {
    expect(visibleBottomHeight(1.2, 1.6)).toBe(0);
    expect(visibleBottomHeight(5, 1.2)).toBe(0);
  });
});

describe("mirrorTopEdgeHeight – kus peegel seinal ripub", () => {
  it("täpselt pealae ja silmade keskel", () => {
    // Spetsifikatsiooni juhtum „täpselt pool": e = 1,5 m, H = 1,6 m → 1,55 m.
    expect(mirrorTopEdgeHeight(1.5, 1.6)).toBeCloseTo(1.55, 9);
    expect(mirrorTopEdgeHeight(1.6, 1.7)).toBeCloseTo(1.65, 9);
  });

  it("ülaserv jääb alati silmade ja pealae vahele", () => {
    for (const h of [1.2, 1.6, 1.9]) {
      const e = eyeHeight(h);
      const top = mirrorTopEdgeHeight(e, h);
      expect(top).toBeGreaterThan(e);
      expect(top).toBeLessThan(h);
    }
  });

  it("silmad täpselt pealael on lubatud piirjuht", () => {
    // e = H ei ole vale sisend, vaid äärmus: siis on ülaserv täpselt pealae
    // kõrgusel. Nähtav osa jääb ka siis `2M`.
    expect(mirrorTopEdgeHeight(1.6, 1.6)).toBeCloseTo(1.6, 9);
    expect(visibleBodyHeight(0.4, 1.6)).toBeCloseTo(0.8, 9);
  });
});

describe("mirrorBottomEdgeHeight – peegli alaserv", () => {
  it("täpselt vähima peegli juures on alaserv täpselt e/2", () => {
    // Spetsifikatsiooni juhtum „täpselt pool": e = 1,5, H = 1,6, M = 0,8 →
    // ülaserv 1,55 ja alaserv 0,75 = e/2. See on jalgade kiire tabamiskoht.
    expect(mirrorBottomEdgeHeight(1.5, 1.6, 0.8)).toBeCloseTo(0.75, 9);
    for (const h of [1.2, 1.6, 1.9]) {
      const e = eyeHeight(h);
      expect(mirrorBottomEdgeHeight(e, h, minMirrorHeight(h))).toBeCloseTo(e / 2, 9);
    }
  });

  it("pisike peegel ripub kõrgel: 0,15 m peegel 1,7 m inimesele algab 1,5 m pealt", () => {
    expect(mirrorBottomEdgeHeight(1.6, 1.7, 0.15)).toBeCloseTo(1.5, 9);
  });

  it("alaserv ei lähe põrandast läbi", () => {
    // Ainus vaikne parandus selles failis. Seis tekib alles siis, kui peegel on
    // niigi üleliia suur – ja siis paistab inimene juba tervenisti.
    expect(mirrorBottomEdgeHeight(1.5, 1.6, 2)).toBe(0);
    expect(visibleBottomHeight(2, 1.6)).toBe(0);
  });

  it("alaserv on alati ülaservast allpool", () => {
    for (const m of [0.1, 0.4, 0.8, 1]) {
      expect(mirrorBottomEdgeHeight(1.5, 1.6, m)).toBeLessThan(
        mirrorTopEdgeHeight(1.5, 1.6),
      );
    }
  });

  it("peegli servad ja nähtav osa räägivad sama juttu", () => {
    // Geomeetria: peegli punkt kõrgusel `b` näitab inimese punkti kõrguselt
    // `2b − e`. Kui need kaks funktsiooni kunagi lahku lähevad, näitaks
    // simulatsioon peeglit ühes kohas ja nähtavat osa teises.
    for (const h of [1.2, 1.6, 1.7, 1.9]) {
      const e = eyeHeight(h);
      for (const m of [0.1, 0.15, 0.3, 0.4, 0.8, 1]) {
        const alaservast = 2 * mirrorBottomEdgeHeight(e, h, m) - e;
        expect(visibleBottomHeight(m, h), `M=${m} H=${h}`).toBeCloseTo(
          Math.max(0, alaservast),
          9,
        );
        // Ja ülaserv näitab alati täpselt pealage – seepärast ripubki peegel
        // simulatsioonis alati õigel kõrgusel.
        expect(2 * mirrorTopEdgeHeight(e, h) - e).toBeCloseTo(h, 9);
      }
    }
  });
});

describe("eyeHeight – silmade kõrgus pikkusest", () => {
  it.each([
    [1.6, 1.5],
    [1.7, 1.6],
    [1.2, 1.1],
    [1.9, 1.8],
  ])("%s m pikk inimene → silmad %s m", (h, expected) => {
    expect(eyeHeight(h)).toBeCloseTo(expected, 9);
  });

  it("kogu liuguri vahemikus jääb 0 < e < H", () => {
    const { min, max, step } = SLIDERS.personHeightM;
    for (let h = min; h <= max + 1e-9; h += step) {
      const e = eyeHeight(h);
      expect(e, String(h)).toBeGreaterThan(0);
      expect(e, String(h)).toBeLessThan(h);
    }
  });

  it("liiga lühike „inimene\" viskab vea, mitte ei anna negatiivseid silmi", () => {
    expect(() => eyeHeight(EYE_BELOW_TOP_M)).toThrow(RangeError);
    expect(() => eyeHeight(0.05)).toThrow(RangeError);
  });
});

describe("SLIDERS – liugurite piirid", () => {
  const sammuPeal = (
    value: number,
    { min, max, step }: { min: number; max: number; step: number },
  ) =>
    value >= min &&
    value <= max &&
    Math.abs(Math.round((value - min) / step) - (value - min) / step) < 1e-9;

  it("simulatsiooni ülesannete seisud on liuguritega üldse seatavad", () => {
    // Kui mõni seis jääks vahemikust või sammu pealt välja, ei saaks õpilane
    // teda kunagi seada – ja seda ei paneks brauseris keegi tähele.
    // explore 1–5 nõuavad: d = 1 / 2,5 / 3 m; M = 0,4 m; H = 1,8 m.
    for (const d of [1, 2.5, 3]) {
      expect(sammuPeal(d, SLIDERS.objectDistanceM), String(d)).toBe(true);
    }
    expect(sammuPeal(0.4, SLIDERS.mirrorHeightM)).toBe(true);
    expect(sammuPeal(1.8, SLIDERS.personHeightM)).toBe(true);
    // Algväärtused (spetsifikatsioon „explore"): 1 m, 0,4 m, 1,6 m.
    for (const [value, slider] of [
      [1, SLIDERS.objectDistanceM],
      [0.4, SLIDERS.mirrorHeightM],
      [1.6, SLIDERS.personHeightM],
    ] as const) {
      expect(sammuPeal(value, slider), String(value)).toBe(true);
    }
  });

  it("explore-5 vastus 0,9 m on peegli liuguriga tabatav", () => {
    // Ülesanne käsib liuguriga otsida hetke, mil kiri „kogu inimene" tekib.
    // Kui 0,9 m jääks vahemikust välja, ei saaks õpilane vastuseni jõuda.
    const vaja = minMirrorHeight(1.8);
    expect(vaja).toBeCloseTo(0.9, 9);
    expect(sammuPeal(vaja, SLIDERS.mirrorHeightM)).toBe(true);
    expect(visibleBodyHeight(vaja, 1.8)).toBeCloseTo(1.8, 9);
    expect(visibleBodyHeight(vaja - SLIDERS.mirrorHeightM.step, 1.8)).toBeLessThan(1.8);
  });

  it("pikkuse liugur hoiab eeldust 0 < e ≤ H püsti", () => {
    // Kui alampiir kunagi allapoole 0,1 m langeks, viskaks eyeHeight vea ja
    // simulatsioon jääks seisma. See test kukub enne.
    expect(SLIDERS.personHeightM.min).toBeGreaterThan(EYE_BELOW_TOP_M);
  });

  it("iga liuguri vahemik on sammu peal ka lõpust", () => {
    for (const [nimi, slider] of Object.entries(SLIDERS)) {
      expect(sammuPeal(slider.max, slider), nimi).toBe(true);
    }
  });
});

describe("vigased sisendid viskavad vea, mitte ei paranda ennast vaikselt", () => {
  it.each([
    ["kaugus 0", () => imageDistance(0)],
    ["kaugus negatiivne", () => imageDistance(-1)],
    ["vahemaa: kaugus 0", () => objectImageSeparation(0)],
    ["eseme kõrgus 0", () => imageHeight(0)],
    ["eseme kõrgus negatiivne", () => imageHeight(-1.6)],
    ["pikkus 0", () => minMirrorHeight(0)],
    ["peegli kõrgus 0", () => visibleBodyHeight(0, 1.6)],
    ["peegli kõrgus negatiivne", () => visibleBodyHeight(-0.4, 1.6)],
    ["pikkus 0 nähtava osa juures", () => visibleBodyHeight(0.4, 0)],
    ["alaosa: peegli kõrgus 0", () => visibleBottomHeight(0, 1.6)],
    ["silmade kõrgus 0", () => mirrorTopEdgeHeight(0, 1.6)],
    ["silmad pealaest kõrgemal", () => mirrorTopEdgeHeight(1.7, 1.6)],
    ["alaserv: silmad pealaest kõrgemal", () => mirrorBottomEdgeHeight(1.7, 1.6, 0.4)],
    ["alaserv: peegli kõrgus 0", () => mirrorBottomEdgeHeight(1.5, 1.6, 0)],
    ["NaN sisendina", () => visibleBodyHeight(Number.NaN, 1.6)],
    ["lõpmatus sisendina", () => imageDistance(Number.POSITIVE_INFINITY)],
  ])("%s", (_what, kutse) => {
    expect(kutse).toThrow(RangeError);
  });

  it.each([
    ["vahemaa kujutiseni", () => objectImageSeparation(1e308)],
    ["peegli ülaserv", () => mirrorTopEdgeHeight(1e308, 1e308)],
    ["peegli alaserv", () => mirrorBottomEdgeHeight(1e308, 1e308, 1)],
  ])("lõplikest sisenditest üle voolanud tulemus on ka viga: %s", (_what, kutse) => {
    // Codexi leid 2026-08-11. Sisend on lõplik ja läbib `assertPositive`, aga
    // liitmine voolab arvupiirist üle ja tulemus oleks `Infinity`. Liugurid
    // sellist seisu ei luba, aga mudel ei tohi tagastada arvu, mille taga ta
    // seista ei saa – sama valvur on moodulites `vari-ja-poolvari` ja
    // `varjutused`.
    expect(kutse).toThrow(RangeError);
  });

  it("visibleBodyHeight on ülevoolu vastu juba oma kuju tõttu kaitstud", () => {
    // `Math.min` piirab tulemuse inimese pikkusega, seega ei jõua `2 · M`
    // lõpmatus kunagi väljundisse – siia eraldi valvurit vaja ei ole.
    expect(visibleBodyHeight(1e308, 1.6)).toBeCloseTo(1.6, 9);
  });
});
