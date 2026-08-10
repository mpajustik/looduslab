import { describe, expect, it } from "vitest";
import {
  EARTH_DIAMETER_KM,
  EARTH_RADIUS_KM,
  EARTH_UMBRA_TIP_KM,
  MOON_APOGEE_KM,
  MOON_DIAMETER_KM,
  MOON_MEAN_KM,
  MOON_PERIGEE_KM,
  MOON_UMBRA_TIP_KM,
  SLIDERS,
  SOLAR_ECLIPSE_LIMIT_KM,
  SUN_DIAMETER_KM,
  SUN_TO_EARTH_KM,
  lunarPenumbraBandKm,
  lunarUmbraToMoonRatio,
  lunarUmbraWidthKm,
  penumbraBandAtDistance,
  solarEclipseKind,
  solarUmbraGapKm,
  solarUmbraSpotKm,
  umbraTipDistance,
  umbraWidthAtDistance,
} from "../src/modules/physics/varjutused/model";
import {
  penumbraBandWidth as vpPenumbraBandWidth,
  umbraLengthBehindObject as vpUmbraLengthBehindObject,
  umbraWidth as vpUmbraWidth,
} from "../src/modules/physics/vari-ja-poolvari/model";
import { manifest } from "../src/modules/physics/varjutused/manifest";
import { activities } from "../src/modules/physics/varjutused/activities";
import { teacher } from "../src/modules/physics/varjutused/teacher";
import { activitiesSchema, manifestSchema } from "../src/engine/contractSchema";
import { stepQuestions } from "../src/engine/contract";
import { checkNumericAnswer } from "../src/checker/numeric";
import { formatNumber } from "../src/lib/format";

/**
 * Päikese- ja kuuvarjutuse mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist (sisu/MOODUL-varjutused.md
 * „Füüsika" → testiväärtuste tabel ning sammude juures kirjas olevad
 * vastused), mitte mudelist tagurpidi tuletatud – muidu testiks test
 * iseennast. Kaasa on võetud ka need arvud, mille peal moodul õpilast hiljem
 * päriselt kontrollib (simulatsiooni ülesanded, harjutused, väljumispilet,
 * kordamiskaardid) – nii selgub näpuviga siin, mitte tunnis.
 *
 * Kilomeetrid on ümardatud täisarvuni (`Math.round`), sest just nii seisavad
 * nad spetsifikatsioonis ja hiljem õpilase ekraanil. Ümardamata võrdlus
 * nõuaks siia mudelist maha kirjutatud kümnendkohti ja test hakkaks kontrollima
 * ujukomat, mitte füüsikat.
 *
 * Alumine osa (samm 4.1o) katab manifesti, samme ja õpetajajuhendit – sama
 * muster mis tests/vari-ja-poolvari.model.test.ts.
 */

const round = (value: number) => Math.round(value);

describe("konstandid on need, mis spetsifikatsioonis", () => {
  it.each([
    ["Päikese läbimõõt", SUN_DIAMETER_KM, 1_392_000],
    ["Kuu läbimõõt", MOON_DIAMETER_KM, 3_474],
    ["Maa läbimõõt", EARTH_DIAMETER_KM, 12_742],
    ["Maa raadius", EARTH_RADIUS_KM, 6_371],
    ["Maa kaugus Päikesest", SUN_TO_EARTH_KM, 149_600_000],
    ["Kuu lähim kaugus", MOON_PERIGEE_KM, 356_500],
    ["Kuu keskmine kaugus", MOON_MEAN_KM, 384_400],
    ["Kuu kaugeim kaugus", MOON_APOGEE_KM, 406_700],
  ])("%s = %s km", (_what, actual, expected) => {
    expect(actual).toBe(expected);
  });

  it("Maa raadius on täpselt pool läbimõõdust", () => {
    // Kui keegi ühte neist muudab ja teist mitte, läheb kogu päikesevarjutuse
    // osa vaikselt valeks – ekraan on Maa PIND ja pinna leiab ainult raadiusega.
    expect(EARTH_RADIUS_KM).toBe(EARTH_DIAMETER_KM / 2);
  });
});

describe("umbraTipDistance – täisvarju koonuse pikkus", () => {
  it("Kuu täisvarju koonus on 374 289 km pikk", () => {
    // Mooduli kõige tähtsam arv (explore-1, kordamiskaart rc-3, väljumispilet 2).
    expect(round(MOON_UMBRA_TIP_KM)).toBe(374_289);
    expect(
      round(umbraTipDistance(SUN_DIAMETER_KM, MOON_DIAMETER_KM, SUN_TO_EARTH_KM)),
    ).toBe(374_289);
  });

  it("Maa täisvarju koonus on 1 382 050 km pikk", () => {
    expect(round(EARTH_UMBRA_TIP_KM)).toBe(1_382_050);
  });

  it("Maa koonus on peaaegu neli korda pikem kui Kuu kaugus – Kuuni ta jõuab kindlasti", () => {
    // See ongi vastus küsimusele, miks kuuvarjutus ei ole kunagi „rõngasjas".
    expect(EARTH_UMBRA_TIP_KM).toBeGreaterThan(3 * MOON_APOGEE_KM);
  });

  it("koonuse pikkus EI sõltu sellest, kui kaugel on ekraan", () => {
    // explore-1 kontrollküsimus: liuguri liigutamine ei tohi seda arvu muuta,
    // sest koonuse kuju otsustavad ainult Päikese ja Kuu suurus ning nende
    // vaheline kaugus.
    expect(MOON_UMBRA_TIP_KM).toBe(
      umbraTipDistance(SUN_DIAMETER_KM, MOON_DIAMETER_KM, SUN_TO_EARTH_KM),
    );
  });

  it("suurem keha → pikem koonus", () => {
    expect(EARTH_UMBRA_TIP_KM).toBeGreaterThan(MOON_UMBRA_TIP_KM);
  });

  it("Päike → Kuu kauguse asemel on Päike → Maa kaugus – teadlik lihtsustus", () => {
    // Codexi leid 2026-08-10, otsustatud sammus 4.1n: arv jääb, lihtsustus
    // läheb kirja. Test hoiab kirjas MÕLEMAD arvud, et keegi ei saaks kunagi
    // väita, nagu poleks vahet märgatud – ja et vahe suurus oleks nähtav.
    //
    // Puudutab ainult päikesevarjutust. Kuuvarjutuse juures on vari heitev
    // keha Maa ise, seega on Päike → keha kaugus seal TÄPSELT õige.
    const täpneKoonus = umbraTipDistance(
      SUN_DIAMETER_KM,
      MOON_DIAMETER_KM,
      SUN_TO_EARTH_KM - MOON_MEAN_KM,
    );
    expect(round(täpneKoonus)).toBe(373_328);

    // Lihtsustuse hind on 962 km. Maa orbiidi ekstsentrilisus, mida mudel juba
    // arvestamata jätab (147,1–152,1 mln km), kõigutab koonust 12 500 km ehk
    // kolmteist korda rohkem. Väiksema paranduse tegemine suurema kõrval
    // annaks ainult täpsema välimuse. Kui see suhe kunagi ümber pöördub, on
    // lihtsustuse põhjendus kadunud ja otsus tuleb uuesti läbi vaadata.
    const lihtsustuseHind = MOON_UMBRA_TIP_KM - täpneKoonus;
    const ekstsentrilisus =
      umbraTipDistance(SUN_DIAMETER_KM, MOON_DIAMETER_KM, 152_100_000) -
      umbraTipDistance(SUN_DIAMETER_KM, MOON_DIAMETER_KM, 147_100_000);
    expect(round(lihtsustuseHind)).toBe(962);
    expect(ekstsentrilisus).toBeGreaterThan(6 * lihtsustuseHind);
  });

  it("lihtsustus ei nihuta täieliku ja rõngasja piiri üle tolerantsi", () => {
    // Täpse geomeetriaga oleks piir seal, kus d − 6371 = koonus(149 600 000 − d)
    // ehk 379 710 km. Explore-3 tolerants on ±5000 km, seega jääks ka täpse
    // mudeli vastus lubatud aknasse – lihtsustus ei muuda ühtki õpilase
    // vastust valeks.
    const k = MOON_DIAMETER_KM / (SUN_DIAMETER_KM - MOON_DIAMETER_KM);
    const täpnePiir = (k * SUN_TO_EARTH_KM + EARTH_RADIUS_KM) / (1 + k);
    expect(round(täpnePiir)).toBe(379_710);
    expect(Math.abs(SOLAR_ECLIPSE_LIMIT_KM - täpnePiir)).toBeLessThan(5_000);
  });

  it("allikas kehast väiksem või sama suur → koonusel ei ole tippu", () => {
    // Astronoomias seda juhtu ei tule (allikas on alati Päike), aga funktsioon
    // peab vastama õigesti, mitte lõpmatusega jagama – muidu rändab valem ühel
    // päeval valesse konteksti (CodeRabbiti leid spetsi juures).
    expect(umbraTipDistance(0.1, 0.2, 1)).toBe(Number.POSITIVE_INFINITY);
    expect(umbraTipDistance(0.1, 0.1, 1)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("umbraWidthAtDistance – täisvarju laius kaugusel", () => {
  it("Kuu lähimas punktis on täisvarju laik Maal 224 km", () => {
    // Ekraan on Maa PIND: 356 500 − 6371 = 350 129 km.
    expect(
      round(
        umbraWidthAtDistance(
          SUN_DIAMETER_KM,
          MOON_DIAMETER_KM,
          SUN_TO_EARTH_KM,
          MOON_PERIGEE_KM - EARTH_RADIUS_KM,
        ),
      ),
    ).toBe(224);
  });

  it("Kuu kaugeimas punktis täisvarju Maal ei ole", () => {
    // 406 700 − 6371 = 400 329 km, koonus lõpeb 374 289 km peal.
    expect(
      umbraWidthAtDistance(
        SUN_DIAMETER_KM,
        MOON_DIAMETER_KM,
        SUN_TO_EARTH_KM,
        MOON_APOGEE_KM - EARTH_RADIUS_KM,
      ),
    ).toBe(0);
  });

  it("Maa täisvari on Kuu kaugusel 9198 km lai", () => {
    expect(
      round(
        umbraWidthAtDistance(
          SUN_DIAMETER_KM,
          EARTH_DIAMETER_KM,
          SUN_TO_EARTH_KM,
          MOON_MEAN_KM,
        ),
      ),
    ).toBe(9_198);
  });

  it("täisvari kahaneb ühtlaselt nullini täpselt tipus", () => {
    // Teine kuju samast valemist: laius = läbimõõt · (1 − kaugus / tipu kaugus).
    // Ta kehtib ainult siis, kui allikas on kehast SUUREM – seepärast on
    // kontroll siin astronoomiliste arvudega, mitte üldjuhul.
    for (const share of [0.001, 0.25, 0.5, 0.75, 0.999]) {
      const bodyToScreen = MOON_UMBRA_TIP_KM * share;
      expect(
        umbraWidthAtDistance(
          SUN_DIAMETER_KM,
          MOON_DIAMETER_KM,
          SUN_TO_EARTH_KM,
          bodyToScreen,
        ),
      ).toBeCloseTo(
        MOON_DIAMETER_KM * (1 - bodyToScreen / MOON_UMBRA_TIP_KM),
        6,
      );
    }
  });

  it("täpselt tipus on laius null, mitte ujukomatolm", () => {
    // Sama mure ja sama lahendus mis moodulis `vari-ja-poolvari` (Codexi leid
    // 2026-08-10): ilma läveta jääks siia jääk ja mudel väidaks, et täisvari on
    // olemas, kuvades samas suurt „0 km".
    expect(
      umbraWidthAtDistance(
        SUN_DIAMETER_KM,
        MOON_DIAMETER_KM,
        SUN_TO_EARTH_KM,
        MOON_UMBRA_TIP_KM,
      ),
    ).toBe(0);
  });

  it("millimeetri-lävi ei söö ära ühtki nähtavat täisvarju", () => {
    // Lävi tohib kustutada ainult arvutusjääki. Väikseim täisvari, mida moodul
    // päriselt näitab, on kilomeetrite kandis; kontrolliks siin sada meetrit,
    // mis on lävest sada tuhat korda suurem ja peab alles jääma.
    // Laius = läbimõõt · (1 − kaugus / tipp), seega annab 100 m laiuse see
    // kaugus, kus suhe on 1 − 0,1 / 3474.
    const sadaMeetritEnneTippu =
      MOON_UMBRA_TIP_KM * (1 - 0.1 / MOON_DIAMETER_KM);
    const width = umbraWidthAtDistance(
      SUN_DIAMETER_KM,
      MOON_DIAMETER_KM,
      SUN_TO_EARTH_KM,
      sadaMeetritEnneTippu,
    );
    expect(width).toBeGreaterThan(0);
    expect(width).toBeCloseTo(0.1, 6);
  });

  it("allikas kehast väiksem → täisvari KASVAB kaugusega, mitte ei kahane", () => {
    // Spetsifikatsiooni piirjuht: tippu ei tekigi, seega kehtib ainult
    // max-iga valem. 0,2 − 1 · (0,1 − 0,2) / 1 = 0,3.
    expect(umbraWidthAtDistance(0.1, 0.2, 1, 1)).toBeCloseTo(0.3, 9);
    expect(umbraWidthAtDistance(0.1, 0.2, 1, 2)).toBeGreaterThan(
      umbraWidthAtDistance(0.1, 0.2, 1, 1),
    );
  });

  it("allikas = keha → täisvari on silinder", () => {
    for (const bodyToScreen of [1, 10, 1000]) {
      expect(umbraWidthAtDistance(0.1, 0.1, 1, bodyToScreen)).toBeCloseTo(0.1, 9);
    }
  });
});

describe("penumbraBandAtDistance – poolvarju riba laius", () => {
  it("Maa poolvarju riba on Kuu kaugusel 3577 km lai", () => {
    expect(
      round(
        penumbraBandAtDistance(SUN_DIAMETER_KM, SUN_TO_EARTH_KM, MOON_MEAN_KM),
      ),
    ).toBe(3_577);
  });

  it("riba laius ei sõltu keha suurusest – funktsioon ei võtagi läbimõõtu", () => {
    // Kuu ja Maa on väga eri suurusega, aga samal kaugusel on nende poolvarju
    // serv ühesugune. Siin on see näha nii, et sama kutse annab ühe ja sama arvu
    // olenemata sellest, kumba keha me parajasti mõtleme.
    expect(lunarPenumbraBandKm(MOON_MEAN_KM)).toBe(
      penumbraBandAtDistance(SUN_DIAMETER_KM, SUN_TO_EARTH_KM, MOON_MEAN_KM),
    );
  });

  it("mida kaugemal ekraan, seda laiem riba", () => {
    expect(lunarPenumbraBandKm(MOON_PERIGEE_KM)).toBeLessThan(
      lunarPenumbraBandKm(MOON_APOGEE_KM),
    );
  });
});

describe("päikesevarjutus – täielik või rõngasjas", () => {
  it("piir on 380 660 km keskpunktide vahel", () => {
    // explore-3 õige vastus. See üksainus arv on kogu mooduli süda.
    expect(round(SOLAR_ECLIPSE_LIMIT_KM)).toBe(380_660);
    expect(SOLAR_ECLIPSE_LIMIT_KM).toBe(MOON_UMBRA_TIP_KM + EARTH_RADIUS_KM);
  });

  it("Kuu keskmine kaugus on piirist SUUREM – rõngasjas on veidi sagedasem", () => {
    expect(MOON_MEAN_KM).toBeGreaterThan(SOLAR_ECLIPSE_LIMIT_KM);
  });

  it.each([
    ["lähim punkt", MOON_PERIGEE_KM, "total"],
    ["keskmine kaugus", MOON_MEAN_KM, "annular"],
    ["kaugeim punkt", MOON_APOGEE_KM, "annular"],
    ["harjutus 4: 340 000 km", 340_000, "total"],
  ])("%s (%s km) → %s", (_what, distance, kind) => {
    expect(solarEclipseKind(distance as number)).toBe(kind);
  });

  it("mudel tagastab ingliskeelse sildi, mitte eestikeelset teksti", () => {
    // model.ts ei tea UI keelest midagi – „täielik" ja „rõngasjas" paneb peale
    // Simulation.tsx (CLAUDE.md reegel 9: kood inglise, tekstid eesti keeles).
    expect(["total", "annular"]).toContain(solarEclipseKind(MOON_MEAN_KM));
  });

  it("silt ja suur arv ei saa kunagi lahku minna", () => {
    // Kogu liuguri võre läbi: „täielik" ⟺ täisvarju laik on olemas ⟺ midagi ei
    // jää puudu. Kui need kolm väidet saaksid eri arvamusele jääda, näeks
    // õpilane ekraanil silti „täielik varjutus" ja kõrval „täisvarju Maal ei
    // ole".
    const { min, max, step } = SLIDERS.moonDistanceKm;
    for (let d = min; d <= max; d += step) {
      const total = solarEclipseKind(d) === "total";
      expect(solarUmbraSpotKm(d) > 0, `${d} km`).toBe(total);
      expect(solarUmbraGapKm(d) === 0, `${d} km`).toBe(total);
    }
  });

  it("täisvarju laik Maal: 224 km lähimas punktis, 0 kaugeimas", () => {
    // explore-2 vastus. „Eestist Riiani" – kõrval, poolvarjus, on osaline
    // varjutus ja seda näeb tuhandete kilomeetrite laiuselt.
    expect(round(solarUmbraSpotKm(MOON_PERIGEE_KM))).toBe(224);
    expect(solarUmbraSpotKm(MOON_APOGEE_KM)).toBe(0);
  });

  it("harjutus 4: 340 000 km → täielik varjutus, laik 377 km", () => {
    expect(solarEclipseKind(340_000)).toBe("total");
    expect(round(solarUmbraSpotKm(340_000))).toBe(377);
  });

  it("väljumispilet 2: 395 000 km → täisvarjul jääb 14 340 km puudu", () => {
    expect(round(solarUmbraGapKm(395_000))).toBe(14_340);
  });

  it("kordamiskaart rc-3: keskmisel kaugusel jääb ligi 3700 km puudu", () => {
    expect(round(solarUmbraGapKm(MOON_MEAN_KM))).toBe(3_740);
  });

  it("kui koonus jõuab kohale, ei jää midagi puudu", () => {
    expect(solarUmbraGapKm(MOON_PERIGEE_KM)).toBe(0);
    expect(solarUmbraGapKm(340_000)).toBe(0);
  });

  it("mida kaugemal Kuu, seda kitsam laik ja seda rohkem jääb puudu", () => {
    // Väärarusaam `taisvari-ei-loppe`: täisvari ei lähe ainult väiksemaks, vaid
    // saab ühel hetkel päriselt otsa.
    let eelmineLaik = Number.POSITIVE_INFINITY;
    let eelminePuudu = -1;
    for (let d = 356_500; d <= 406_700; d += 1_000) {
      const laik = solarUmbraSpotKm(d);
      const puudu = solarUmbraGapKm(d);
      expect(laik, `${d} km`).toBeLessThan(eelmineLaik);
      expect(puudu, `${d} km`).toBeGreaterThanOrEqual(eelminePuudu);
      eelmineLaik = laik === 0 ? Number.POSITIVE_INFINITY : laik;
      eelminePuudu = puudu;
    }
  });
});

describe("kuuvarjutus – Maa vari Kuu kaugusel", () => {
  it("Maa täisvari on Kuu kaugusel 9198 km lai", () => {
    expect(round(lunarUmbraWidthKm(MOON_MEAN_KM))).toBe(9_198);
  });

  it("harjutus 2: Maa täisvari on 2,6 korda laiem kui Kuu ise", () => {
    expect(lunarUmbraToMoonRatio(MOON_MEAN_KM)).toBeCloseTo(2.6, 1);
    expect(lunarUmbraToMoonRatio(MOON_MEAN_KM)).toBeGreaterThan(2);
  });

  it("Kuu mahub Maa täisvarju tervenisti sisse kogu orbiidi ulatuses", () => {
    // explore-4 õige vastus (b) ja väärarusaam `varjutused-segamini`
    // vastupidine: kuuvarjutus ei jää kunagi ära sellepärast, et vari on liiga
    // kitsas.
    for (const d of [MOON_PERIGEE_KM, MOON_MEAN_KM, MOON_APOGEE_KM]) {
      expect(lunarUmbraWidthKm(d), `${d} km`).toBeGreaterThan(
        2 * MOON_DIAMETER_KM,
      );
    }
  });

  it("Maa vari Kuu kaugusel on ligi 40 korda laiem kui Kuu vari Maal", () => {
    // Siit tuleb praktika näidise mõte: päikesevarjutus kestab minuteid,
    // kuuvarjutus tunde.
    //
    // Testi nimi ütles algselt „tuhandeid kordi" – see oli vale suurusjärk
    // (Codexi leid 2026-08-10). Päris suhe on 9455 / 224 ≈ 42, seega on arv
    // siin kirjas, mitte ainult „suurem kui".
    const suhe =
      lunarUmbraWidthKm(MOON_PERIGEE_KM) / solarUmbraSpotKm(MOON_PERIGEE_KM);
    expect(round(suhe)).toBe(42);
  });
});

/**
 * Kordus on teadlik (vt model.ts päis ja spetsifikatsiooni „Miks valemid on
 * siin uuesti"): moodulid laaditakse dünaamiliselt ja ristimport tõmbaks ühe
 * mooduli teise bundle'isse. Seda kordust valvab SEE test – mõlema mooduli
 * valemid peavad samadel sisenditel andma sama tulemuse, ühikuid mudel ei tea.
 *
 * Tähelepanu tõlkele: moodulis `vari-ja-poolvari` on mõlemad kaugused mõõdetud
 * ALLIKAST (`a` ja `b`), siin allikast kehani ja sealt edasi. Seepärast on
 * `b = a + bodyToScreen`.
 */
describe("kontroll vari-ja-poolvari vastu – samad valemid, samad arvud", () => {
  const d = 0.1; // keha läbimõõt
  const s = 0.2; // allika laius / läbimõõt
  const a = 1; // allikas → keha

  it("koonuse pikkus on mõlemas moodulis sama", () => {
    expect(umbraTipDistance(s, d, a)).toBeCloseTo(
      vpUmbraLengthBehindObject(d, s, a),
      9,
    );
    expect(umbraTipDistance(s, d, a)).toBeCloseTo(1, 9);
  });

  it("täisvarju laius on mõlemas moodulis sama", () => {
    for (const bodyToScreen of [0.2, 0.5, 0.8]) {
      expect(
        umbraWidthAtDistance(s, d, a, bodyToScreen),
        String(bodyToScreen),
      ).toBeCloseTo(vpUmbraWidth(d, s, a, a + bodyToScreen), 9);
    }
  });

  it("poolvarju riba laius on mõlemas moodulis sama", () => {
    for (const bodyToScreen of [0.2, 0.5, 0.8]) {
      expect(
        penumbraBandAtDistance(s, a, bodyToScreen),
        String(bodyToScreen),
      ).toBeCloseTo(vpPenumbraBandWidth(s, a, a + bodyToScreen), 9);
    }
  });

  it("ka täisvarju kadumise koht on mõlemas moodulis sama", () => {
    const tip = umbraTipDistance(s, d, a);
    expect(umbraWidthAtDistance(s, d, a, tip)).toBe(0);
    expect(vpUmbraWidth(d, s, a, a + tip)).toBe(0);
    expect(umbraWidthAtDistance(s, d, a, tip - 0.001)).toBeGreaterThan(0);
    expect(vpUmbraWidth(d, s, a, a + tip - 0.001)).toBeGreaterThan(0);
  });
});

describe("SLIDERS – liuguri piirid", () => {
  it("liugur katab Kuu orbiidi lähimast punktist kaugeimani", () => {
    expect(SLIDERS.moonDistanceKm.min).toBe(MOON_PERIGEE_KM);
    expect(SLIDERS.moonDistanceKm.max).toBe(MOON_APOGEE_KM);
  });

  it("liuguri võre tabab kõiki spetsifikatsiooni kaugusi", () => {
    // Miks samm on 100 km, mitte spetsis algselt kirjas olnud 1000 km:
    // (384 400 − 356 500) / 1000 = 27,9 ehk algväärtus jääks võre alt välja ja
    // õpilane ei saaks pärast esimest liigutust enam kunagi tagasi sinna, kust
    // ta alustas. Sama lugu kaugeima punktiga.
    const { min, max, step } = SLIDERS.moonDistanceKm;
    const võrePeal = (value: number) =>
      value >= min &&
      value <= max &&
      Math.abs(Math.round((value - min) / step) - (value - min) / step) < 1e-9;

    for (const distance of [MOON_PERIGEE_KM, MOON_MEAN_KM, MOON_APOGEE_KM]) {
      expect(võrePeal(distance), String(distance)).toBe(true);
    }
  });

  it("explore-3 vastus on liuguri vahemikus ja tolerants ±5000 km katab võre", () => {
    // Vastus 380 660 km ei ole ise võre peal (see on arvutuse tulemus, mitte
    // liuguri seis), aga ±5000 km sisse jääb hulk seatavaid väärtusi – õpilane
    // saab piiri leida liugurit liigutades.
    expect(SOLAR_ECLIPSE_LIMIT_KM).toBeGreaterThan(SLIDERS.moonDistanceKm.min);
    expect(SOLAR_ECLIPSE_LIMIT_KM).toBeLessThan(SLIDERS.moonDistanceKm.max);
    expect(5_000).toBeGreaterThan(SLIDERS.moonDistanceKm.step);
  });

  it("liuguri mõlemas otsas on eri vastus – muidu ei õpetaks liugur midagi", () => {
    expect(solarEclipseKind(SLIDERS.moonDistanceKm.min)).toBe("total");
    expect(solarEclipseKind(SLIDERS.moonDistanceKm.max)).toBe("annular");
  });
});

describe("vigased sisendid viskavad vea, mitte ei paranda ennast vaikselt", () => {
  it.each([
    ["koonus: allika läbimõõt 0", () => umbraTipDistance(0, 3_474, 149_600_000)],
    ["koonus: keha läbimõõt 0", () => umbraTipDistance(1_392_000, 0, 149_600_000)],
    ["koonus: kaugus 0", () => umbraTipDistance(1_392_000, 3_474, 0)],
    ["koonus: negatiivne kaugus", () => umbraTipDistance(1_392_000, 3_474, -1)],
    ["laius: keha läbimõõt negatiivne", () => umbraWidthAtDistance(1_392_000, -1, 149_600_000, 1)],
    ["laius: ekraani kaugus 0", () => umbraWidthAtDistance(1_392_000, 3_474, 149_600_000, 0)],
    ["laius: ekraani kaugus negatiivne", () => umbraWidthAtDistance(1_392_000, 3_474, 149_600_000, -1)],
    ["poolvari: allika läbimõõt 0", () => penumbraBandAtDistance(0, 149_600_000, 1)],
    ["poolvari: ekraani kaugus 0", () => penumbraBandAtDistance(1_392_000, 149_600_000, 0)],
    ["NaN sisendina", () => umbraWidthAtDistance(1_392_000, Number.NaN, 149_600_000, 1)],
    ["lõpmatus sisendina", () => umbraTipDistance(Number.POSITIVE_INFINITY, 3_474, 149_600_000)],
  ])("%s", (_what, kutse) => {
    expect(kutse).toThrow(RangeError);
  });

  it.each([
    ["Kuu kaugus 0", 0],
    ["Kuu kaugus negatiivne", -1],
    ["Kuu täpselt Maa pinnal", EARTH_RADIUS_KM],
    ["Kuu Maa sees", 1_000],
  ])("%s → viga kõigis rakendusfunktsioonides", (_what, distance) => {
    // Kuu Maa sees ei ole „veidi vale sisend", vaid teine ülesanne: kaugus
    // pinnani tuleks null või negatiivne ja mudel arvutaks vaikselt jama.
    expect(() => solarUmbraSpotKm(distance)).toThrow(RangeError);
    expect(() => solarUmbraGapKm(distance)).toThrow(RangeError);
    expect(() => solarEclipseKind(distance)).toThrow(RangeError);
    expect(() => lunarUmbraWidthKm(distance)).toThrow(RangeError);
    expect(() => lunarPenumbraBandKm(distance)).toThrow(RangeError);
    expect(() => lunarUmbraToMoonRatio(distance)).toThrow(RangeError);
  });

  it("liuguri vahemikust väljas, aga Maast väljas kaugus on LUBATUD", () => {
    // Harjutus 4 annab 340 000 km, mis on lähimast punktist väiksem. Kui mudel
    // piiraks end liuguri vahemikuga, ei saaks seda ülesannet üldse arvutada.
    expect(340_000).toBeLessThan(SLIDERS.moonDistanceKm.min);
    expect(() => solarUmbraSpotKm(340_000)).not.toThrow();
  });
});

describe("manifest", () => {
  it("vastab moodulilepingu skeemile", () => {
    expect(() => manifestSchema.parse(manifest)).not.toThrow();
  });

  it("viitab ainekava õpitulemusele; praktilist tööd ei ole (kaetud vari-ja-poolvari's)", () => {
    expect(manifest.outcomes).toContain("P1-T2");
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

  it("hookil ja teoorial on spetsifikatsiooni joonised", () => {
    // Sildid peavad klappima registriga (moduleFigures) – seda valvab
    // tests/registry.test.ts alles siis, kui moodul on registris.
    const figures = activities.steps
      .filter((step) => step.type === "hook" || step.type === "theory")
      .map((step) =>
        step.type === "hook" || step.type === "theory" ? step.figure : undefined,
      );
    expect(figures).toEqual(["vj-eesti-varjutus", "vj-kaks-varjutust"]);
  });

  it("kaardilugemise harjutus viitab oma joonisele", () => {
    const practice = activities.steps.find((step) => step.type === "practice");
    const question =
      practice?.type === "practice"
        ? stepQuestions(practice).find((item) => item.id === "practice-2")
        : undefined;
    expect(question?.kind === "choice" ? question.figure : undefined).toBe(
      "vj-varjutuse-rada",
    );
  });
});

/**
 * Ülesannete vastused vs. mudel.
 *
 * `activities.ts` arvutab iga vastuse MUDELIST (CLAUDE.md reegel 1), seega
 * valemi näpuviga siin välja ei paistaks – küll aga paistab välja vale
 * sisendkaugus või vale funktsioonivalik. Seepärast võrreldakse arve
 * MUDELI enda funktsioonidega spetsifikatsiooni tabeli järgi (sisu
 * MOODUL-varjutused.md „Testiväärtused"), mitte activities.ts iseendaga.
 */
describe("ülesannete vastused käivad mudeliga kokku", () => {
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

  it.each([
    ["explore-1", "Kuu täisvarju koonus", MOON_UMBRA_TIP_KM],
    ["explore-2", "täisvarju laik Kuu lähimas punktis", solarUmbraSpotKm(MOON_PERIGEE_KM)],
    ["explore-3", "täieliku/rõngasja piir", SOLAR_ECLIPSE_LIMIT_KM],
    ["practice-1", "Maa täisvarju ja Kuu suhe", lunarUmbraToMoonRatio(MOON_MEAN_KM)],
    ["practice-3", "täisvarju laik 340 000 km juures", solarUmbraSpotKm(340_000)],
    ["exit-2", "puudujääv koonuse osa 395 000 km juures", solarUmbraGapKm(395_000)],
  ])("%s (%s) → %s", (questionId, _what, expected) => {
    expect(numericQuestion(questionId as string).answer).toBeCloseTo(
      expected as number,
      9,
    );
  });

  it("kõik arvküsimused peale osalise harjutuse on kilomeetrites", () => {
    // practice-1 on ühikuta suhe (9198 / 3474), ülejäänud on kaugused/laiused
    // kilomeetrites – siin ei ole ühikuvahetust nagu moodulis
    // `vari-ja-poolvari` (m ↔ cm).
    for (const step of activities.steps) {
      for (const question of stepQuestions(step)) {
        if (question.kind !== "numeric") continue;
        if (question.id === "practice-1") {
          expect(question.unit, question.id).toBeUndefined();
        } else {
          expect(question.unit, question.id).toBe("km");
        }
      }
    }
  });

  it("checker võtab vastu ka ühikuga kirjutatud arvu", () => {
    const question = numericQuestion("explore-1");
    expect(checkNumericAnswer(question, "374289").correct).toBe(true);
    expect(checkNumericAnswer(question, "374289 km").correct).toBe(true);
    // Maa koonuse pikkus on siin selgelt vale vastus.
    expect(checkNumericAnswer(question, String(round(EARTH_UMBRA_TIP_KM))).correct).toBe(
      false,
    );
  });

  it("explore-3 tolerants on absoluutne ja katab kogu liuguri võre", () => {
    const question = numericQuestion("explore-3");
    expect(question.tolerance).toEqual({ mode: "absolute", value: 5000 });
    expect(checkNumericAnswer(question, "380660").correct).toBe(true);
    expect(checkNumericAnswer(question, String(round(MOON_MEAN_KM))).correct).toBe(true);
    expect(checkNumericAnswer(question, String(round(MOON_PERIGEE_KM))).correct).toBe(
      false,
    );
  });

  it("lahendatud näidis ja kordamiskaart rc-3 kasutavad mudelist tulevaid arve", () => {
    const practice = activities.steps.find((step) => step.type === "practice");
    const worked = practice?.type === "practice" ? practice.worked : undefined;
    // Eesti vormingus tuhandete eraldaja on tühik (NBSP), mitte koma – vt
    // src/lib/format.ts formatNumber.
    expect(worked?.solution.join(" ")).toContain(
      `${round(solarUmbraSpotKm(MOON_PERIGEE_KM))}`,
    );
    expect(worked?.solution.join(" ")).toContain(
      formatNumber(lunarUmbraWidthKm(MOON_MEAN_KM), 0),
    );

    const card = activities.reviewCards.find((item) => item.id === "rc-3");
    expect(card?.answer).toContain(
      CARD_ECLIPSE_KIND_LABEL(solarEclipseKind(MOON_MEAN_KM)),
    );
  });
});

function CARD_ECLIPSE_KIND_LABEL(kind: "total" | "annular"): string {
  return kind === "total" ? "täielik" : "rõngasjas";
}

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
      "varjutused-segamini",
      "varjutus-igal-kuul",
      "taisvari-ei-loppe",
      "taisvari-on-suur",
      "varjutus-koik-voi-mitte-midagi",
      "kuu-faas-on-vari",
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
