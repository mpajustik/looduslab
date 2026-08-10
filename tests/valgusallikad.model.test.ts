import { describe, expect, it } from "vitest";
import {
  EXAMPLE_SOURCES,
  POINT_SOURCE_MIN_RATIO,
  apparentSizeDeg,
  classifyByRatio,
  distanceToSizeRatio,
  pointSourceDistance,
} from "../src/modules/physics/valgusallikad/model";
import { formatRatio } from "../src/modules/physics/valgusallikad/display";
import { manifest } from "../src/modules/physics/valgusallikad/manifest";
import { activities } from "../src/modules/physics/valgusallikad/activities";
import { teacher } from "../src/modules/physics/valgusallikad/teacher";
import {
  activitiesSchema,
  manifestSchema,
} from "../src/engine/contractSchema";
import { stepQuestions } from "../src/engine/contract";
import { checkNumericAnswer } from "../src/checker/numeric";

/**
 * Valgusallikate mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist (sisu/MOODUL-valgusallikad.md
 * „Füüsika" → testiväärtuste tabel ning sammude juures kirjas olevad
 * vastused), mitte mudelist tagurpidi tuletatud – muidu testiks test
 * iseennast. Kaasa on võetud ka need arvud, mille peal moodul õpilast hiljem
 * päriselt kontrollib (simulatsiooni ülesanded, harjutused, väljumispilet,
 * kordamiskaardid) – nii selgub näpuviga siin, mitte tunnis.
 *
 * Mooduli PÕHISUURUS on suhe `kaugus / mõõde`, mitte nurkmõõde: 8. klass
 * arkustangensit ei tunne. Nurkmõõde on alles, aga ainult simulatsiooni
 * lisanäiduna ja joonise sisendina – ükski ülesanne teda ei küsi ja tema järgi
 * ei liigitata.
 */

describe("distanceToSizeRatio – mitu korda on kaugus suurem kui mõõde", () => {
  it("LED 5 mm 1 m kauguselt → 200 korda", () => {
    expect(distanceToSizeRatio(0.005, 1)).toBeCloseTo(200, 6);
  });

  it("hõõgniit 1 cm 3 m kauguselt → 300 korda", () => {
    expect(distanceToSizeRatio(0.01, 3)).toBeCloseTo(300, 6);
  });

  it("lambipirn 0,08 m 4 m kauguselt → 50 korda (harjutus 2)", () => {
    expect(distanceToSizeRatio(0.08, 4)).toBeCloseTo(50, 6);
  });

  it("päevavalgustoru 1,2 m 2 m kauguselt → 1,7 korda (simulatsiooni ülesanne 1)", () => {
    expect(distanceToSizeRatio(1.2, 2)).toBeCloseTo(1.67, 2);
  });

  it("aken 1,5 m 3 m kauguselt → 2 korda", () => {
    expect(distanceToSizeRatio(1.5, 3)).toBeCloseTo(2, 6);
  });

  it("LED 5 mm 0,5 m kauguselt → 100 korda (simulatsiooni ülesanne 2)", () => {
    expect(distanceToSizeRatio(0.005, 0.5)).toBeCloseTo(100, 6);
  });

  it("tänavalambi pirn 0,06 m 12 m kõrgusel → 200 korda (väljumispilet 2)", () => {
    expect(distanceToSizeRatio(0.06, 12)).toBeCloseTo(200, 6);
  });

  it("Päike: 1 392 000 km läbimõõt, 150 000 000 km kaugus → 108 korda (harjutus 4)", () => {
    // Suhe on ühikuta, seega vastus on sama nii kilomeetrites kui meetrites –
    // just seepärast ütleb harjutuse vihje, et teisendama ei pea.
    expect(distanceToSizeRatio(1_392_000_000, 150_000_000_000)).toBeCloseTo(
      107.76,
      2,
    );
    expect(distanceToSizeRatio(1_392_000, 150_000_000)).toBeCloseTo(107.76, 2);
  });

  it("kaks korda kaugemal → kaks korda suurem suhe (mooduli põhiidee)", () => {
    // Erinevalt nurkmõõtmest on see seos TÄPSELT võrdeline kogu ulatuses –
    // see ongi põhjus, miks suhe sobib 8. klassile ja nurk mitte.
    expect(distanceToSizeRatio(1.2, 20)).toBeCloseTo(
      distanceToSizeRatio(1.2, 2) * 10,
      6,
    );
  });

  it("mõõde 0, negatiivne või NaN viskab vea (ei paranda vaikselt)", () => {
    expect(() => distanceToSizeRatio(0, 1)).toThrow(RangeError);
    expect(() => distanceToSizeRatio(-1, 1)).toThrow(RangeError);
    expect(() => distanceToSizeRatio(Number.NaN, 1)).toThrow(RangeError);
  });

  it("kaugus 0 või negatiivne viskab vea – vaatleja oleks allika sees", () => {
    expect(() => distanceToSizeRatio(0.005, 0)).toThrow(RangeError);
    expect(() => distanceToSizeRatio(0.005, -3)).toThrow(RangeError);
  });

  it("üle voolav tulemus viskab vea, ei tagasta Infinity't", () => {
    // Pisike allikas tohutult kaugel: jagatis ei mahu arvu sisse. Vaikne
    // Infinity jõuaks ekraanile sildina „lõpmata palju kordi".
    expect(() => distanceToSizeRatio(Number.MIN_VALUE, Number.MAX_VALUE)).toThrow(
      RangeError,
    );
  });
});

describe("classifyByRatio – kokkuleppeline 60 korda piir", () => {
  it("piir on 60 ja ta on KAASAV", () => {
    expect(POINT_SOURCE_MIN_RATIO).toBe(60);
    expect(classifyByRatio(60)).toBe("point");
  });

  it("üle piiri → punktallikas, alla piiri → laiendatud allikas", () => {
    expect(classifyByRatio(200)).toBe("point");
    expect(classifyByRatio(107.76)).toBe("point");
    expect(classifyByRatio(50)).toBe("extended");
    expect(classifyByRatio(1.67)).toBe("extended");
  });

  it("napilt alla piiri on juba laiendatud – piir ei ole udune", () => {
    expect(classifyByRatio(59.9)).toBe("extended");
    // CodeRabbiti leid 2026-08-10: lubatud viga oli nii lai (1e-9), et ka
    // päris – kui ka mõttetult napp – puudujääk luges punktallikaks. Nüüd on
    // ta ujukomamüra suurusjärgus ja see arv jääb õigesti alla piiri.
    expect(classifyByRatio(60 * (1 - 5e-10))).toBe("extended");
  });

  it("edasi-tagasi teekonna ujukomaviga EI vii silti valeks", () => {
    // Vastupidine nõue eelmisele: mõõde 0,06 m (väljumispileti tänavalamp) annab
    // `(0,06 · 60) / 0,06` = 59,999999999999993. Ilma lubatud veata loeks moodul
    // selle laiendatud allikaks TÄPSELT sellel kaugusel, mille ta ise
    // punktallika piiriks arvutas. Just seda paari testi vahel lubatud viga
    // tasakaalustabki.
    const sizeM = 0.06;
    const ratio = distanceToSizeRatio(sizeM, pointSourceDistance(sizeM));
    expect(ratio).toBeLessThan(POINT_SOURCE_MIN_RATIO);
    expect(classifyByRatio(ratio)).toBe("point");
  });

  it("suhe 0 on laiendatud allikas, mitte viga", () => {
    // Mudel oskab ise nulli toota: hiiglaslik allikas päris lähedal annab
    // jagatise, mis kaob ujukoma alla. Kui `classifyByRatio` seal vea viskaks,
    // kukuks mudel oma enda väljundi peale.
    expect(classifyByRatio(0)).toBe("extended");
    expect(classifyByRatio(distanceToSizeRatio(Number.MAX_VALUE, 1))).toBe(
      "extended",
    );
  });

  it("negatiivne suhe või NaN viskab vea", () => {
    expect(() => classifyByRatio(-1)).toThrow(RangeError);
    expect(() => classifyByRatio(Number.NaN)).toThrow(RangeError);
  });
});

/**
 * Näidiku vorming ei tohi sildiga vastuollu minna.
 *
 * Mõlemad ülevaatajad osutasid siia (CodeRabbit 2026-08-10, kaks korda):
 * ümardatud arv „60,0" silmatorkava sildi „laiendatud allikas" kõrval on
 * täpselt see koht, kuhu ülesanne 1 õpilase saadab („kaugenda, kuni silt
 * muutub"). Otsuse teeb ikka mudel – siin kontrollitakse ainult, et KUVATAV
 * arv jääks otsusega samale poole piiri.
 */
describe("formatRatio – kuvatav arv on alati sildiga samal pool piiri", () => {
  const agrees = (ratio: number) => {
    const kind = classifyByRatio(ratio);
    // `formatNumber` eraldab tuhandeid SISEMISE tühikuga (U+00A0), seega
    // „1 000 000" tuleb enne arvuks lugemist tühikutest puhastada.
    const shown = Number(
      formatRatio(ratio, kind).replace(/\s/gu, "").replace(",", "."),
    );
    return (shown >= POINT_SOURCE_MIN_RATIO) === (kind === "point");
  };

  it("napilt alla piiri ei kuvata piirina", () => {
    expect(formatRatio(59.6, classifyByRatio(59.6))).toBe("59,6");
    // Ilma paranduseta ümardus see „60,0"-ks ja seisis „laiendatud allika" kõrval.
    expect(formatRatio(59.96, classifyByRatio(59.96))).toBe("59,9");
  });

  it("täpselt piiril ja napilt üle on 60,0", () => {
    expect(formatRatio(60, classifyByRatio(60))).toBe("60,0");
    expect(formatRatio(60.04, classifyByRatio(60.04))).toBe("60,0");
  });

  it("piirist kaugemal ümardab tavaliselt – 1,7 jääb 1,7 ja Päike 108", () => {
    expect(formatRatio(1.6667, classifyByRatio(1.6667))).toBe("1,7");
    expect(formatRatio(50, classifyByRatio(50))).toBe("50,0");
    expect(formatRatio(107.7586, classifyByRatio(107.7586))).toBe("108");
    expect(formatRatio(200, classifyByRatio(200))).toBe("200");
  });

  it("ükski suhe ei jää sildiga vastuollu", () => {
    for (const ratio of [0.5, 1.6667, 50, 59.9, 59.96, 59.999, 60, 60.001, 99.96, 107.76, 200, 1e6]) {
      expect(agrees(ratio), String(ratio)).toBe(true);
    }
  });
});

describe("pointSourceDistance – vähim kaugus punktallikaks lugemisel", () => {
  it("päevavalgustoru 1,2 m → 72 m (simulatsiooni ülesanne 1)", () => {
    // Simulatsiooni kauguse liugur peab ulatuma üle selle arvu, muidu ei ole
    // ülesanne lahendatav.
    expect(pointSourceDistance(1.2)).toBeCloseTo(72, 6);
    expect(pointSourceDistance(1.2)).toBeLessThan(80);
  });

  it("sellelt kauguselt tuleb suhteks täpselt piir (edasi-tagasi test)", () => {
    // Kümnendmurruga mõõdu juures ei ole korrutamine ja jagamine teineteise
    // täpsed pöördtehted – see test valvab, et ujukomamüra ei viskaks silti
    // piiri juures valeks (vt RATIO_EPSILON model.ts-is).
    for (const sizeM of [0.005, 0.08, 1.2, 1.5]) {
      const distanceM = pointSourceDistance(sizeM);
      expect(distanceToSizeRatio(sizeM, distanceM)).toBeCloseTo(
        POINT_SOURCE_MIN_RATIO,
        9,
      );
      expect(classifyByRatio(distanceToSizeRatio(sizeM, distanceM))).toBe("point");
    }
  });

  it("sellest lähemal on sama allikas laiendatud allikas", () => {
    const distanceM = pointSourceDistance(1.2);
    expect(classifyByRatio(distanceToSizeRatio(1.2, distanceM * 0.9))).toBe(
      "extended",
    );
    expect(classifyByRatio(distanceToSizeRatio(1.2, distanceM * 1.1))).toBe(
      "point",
    );
  });

  it("kaugus on mõõtmega võrdeline", () => {
    expect(pointSourceDistance(2.4)).toBeCloseTo(2 * pointSourceDistance(1.2), 6);
  });

  it("mõõde 0 või negatiivne viskab vea", () => {
    expect(() => pointSourceDistance(0)).toThrow(RangeError);
    expect(() => pointSourceDistance(-1.2)).toThrow(RangeError);
  });

  it("üle voolav tulemus viskab vea, ei tagasta Infinity't", () => {
    expect(() => pointSourceDistance(Number.MAX_VALUE)).toThrow(RangeError);
  });
});

/**
 * Nurkmõõde on LISANÄIT: simulatsioon joonistab tema järgi kiirte kimbu ja
 * näitab kraade väikeses kirjas. Ülesannetes teda ei ole, aga ta peab ikka
 * õige olema – vale kraad tähendaks valesti joonistatud kimpu.
 */
describe("apparentSizeDeg – lisanäit kraadides", () => {
  it("annab spetsifikatsiooni tabeli nurgad", () => {
    expect(apparentSizeDeg(0.005, 1)).toBeCloseTo(0.29, 2);
    expect(apparentSizeDeg(0.08, 4)).toBeCloseTo(1.15, 2);
    expect(apparentSizeDeg(1.2, 2)).toBeCloseTo(33.4, 1);
    expect(apparentSizeDeg(1.5, 3)).toBeCloseTo(28.1, 1);
    expect(apparentSizeDeg(1_392_000_000, 150_000_000_000)).toBeCloseTo(0.53, 2);
  });

  it("piiril olev suhe 60 vastab umbes 0,95° nurgale", () => {
    // Kokkulepe „60 korda" ei ole kraadidest lahti seotud – ta on ligikaudu
    // sama vana 1° piir. See test hoiab kaks lugu koos: kui keegi muudab
    // kunagi piiri, peab ta nägema, mida see kraadides tähendab.
    const sizeM = 1.2;
    expect(apparentSizeDeg(sizeM, pointSourceDistance(sizeM))).toBeCloseTo(
      0.95,
      2,
    );
  });

  it("väga suur mõõde ja kaugus ei vooluta arvutust üle (mõlema ülevaataja leid)", () => {
    expect(apparentSizeDeg(Number.MAX_VALUE, Number.MAX_VALUE)).toBeCloseTo(
      53.13,
      2,
    );
  });

  it("mõõde või kaugus 0 viskab vea", () => {
    expect(() => apparentSizeDeg(0, 1)).toThrow(RangeError);
    expect(() => apparentSizeDeg(0.005, 0)).toThrow(RangeError);
  });
});

describe("EXAMPLE_SOURCES – simulatsiooni ja ülesannete näited", () => {
  it("annavad spetsifikatsiooni tabeli suhted ja liigid", () => {
    const expected: Record<
      keyof typeof EXAMPLE_SOURCES,
      { ratio: number; digits: number; size: "point" | "extended" }
    > = {
      led: { ratio: 200, digits: 6, size: "point" },
      lambipirn: { ratio: 50, digits: 6, size: "extended" },
      paevavalgustoru: { ratio: 1.67, digits: 2, size: "extended" },
      aken: { ratio: 2, digits: 6, size: "extended" },
      paike: { ratio: 107.76, digits: 2, size: "point" },
    };

    for (const [id, source] of Object.entries(EXAMPLE_SOURCES)) {
      const want = expected[id as keyof typeof EXAMPLE_SOURCES];
      const ratio = distanceToSizeRatio(source.sizeM, source.distanceM);
      expect(ratio, id).toBeCloseTo(want.ratio, want.digits);
      expect(classifyByRatio(ratio), id).toBe(want.size);
    }
  });

  it("Päike on punktallikas, kuigi ta on näidetest tohutult suurim", () => {
    // Just see paar ridu on väärarusaama `suurus-ilma-kauguseta` vastus:
    // suurim keha annab suurima suhte, sest ta on kaugel.
    expect(EXAMPLE_SOURCES.paike.sizeM).toBeGreaterThan(
      EXAMPLE_SOURCES.aken.sizeM,
    );
    expect(
      distanceToSizeRatio(
        EXAMPLE_SOURCES.paike.sizeM,
        EXAMPLE_SOURCES.paike.distanceM,
      ),
    ).toBeGreaterThan(
      distanceToSizeRatio(
        EXAMPLE_SOURCES.aken.sizeM,
        EXAMPLE_SOURCES.aken.distanceM,
      ),
    );
  });
});

describe("manifest", () => {
  it("vastab moodulilepingu skeemile", () => {
    expect(() => manifestSchema.parse(manifest)).not.toThrow();
  });

  it("viitab ainekava õpitulemusele ja õpetab punktvalgusallika mõistet", () => {
    expect(manifest.outcomes).toContain("P1-T1");
    expect(manifest.concepts).toContain("punktvalgusallikas");
    // Praktilist tööd see moodul ei kata – P1-PT1 on moodulis
    // `vari-ja-poolvari`. Katvusraport ei tohi siin rohelist näidata.
    expect(manifest.practicalWork).toEqual([]);
  });
});

describe("activities", () => {
  it("vastab moodulilepingu skeemile", () => {
    expect(() => activitiesSchema.parse(activities)).not.toThrow();
  });

  it("on väike moodul: kuus sammu, üks ekraan korraga", () => {
    // Suurusreegel (sisu/MALL-moodul.md): 3–6 sammu. Seitsmes samm oleks
    // märk, et moodul tuleks pooleks jagada.
    expect(activities.steps.map((step) => step.type)).toEqual([
      "hook",
      "theory",
      "predict",
      "explore",
      "practice",
      "exit",
    ]);
  });

  it("ükski arvküsimus ei küsi kraade – arkustangens ei ole 8. klassi matemaatika", () => {
    // Mooduli suurus on suhe. Kui siia ilmub kunagi kraadides küsimus, on see
    // märk, et lisanäit on vaikselt reegliks tagasi roninud.
    for (const step of activities.steps) {
      for (const question of stepQuestions(step)) {
        if (question.kind === "numeric") {
          expect(question.unit ?? "", question.id).not.toContain("°");
        }
      }
    }
  });
});

/**
 * Ülesannete vastused vs. spetsifikatsioon.
 *
 * `activities.ts` arvutab iga vastuse MUDELIST (CLAUDE.md reegel 1), seega
 * valemi näpuviga siin välja ei paistaks – küll aga paistab välja vale mõõde
 * või kaugus. Seepärast võrreldakse arve spetsifikatsiooni tabeliga
 * (sisu/MOODUL-valgusallikad.md), mitte mudeliga uuesti: see on ainus koht,
 * kus keegi ütleb sõltumatult, MILLINE arv õpilase ekraanile peab jõudma.
 */
describe("ülesannete vastused käivad spetsifikatsiooniga kokku", () => {
  const numericAnswer = (questionId: string): number => {
    for (const step of activities.steps) {
      for (const question of stepQuestions(step)) {
        if (question.id === questionId && question.kind === "numeric") {
          // Variante sellel moodulil ei ole – vastus on küsimuse enda küljes.
          expect(question.variants, questionId).toBeUndefined();
          expect(question.answer, questionId).toBeDefined();
          return question.answer as number;
        }
      }
    }
    throw new Error(`Arvküsimust "${questionId}" ei ole moodulis`);
  };

  it.each([
    ["explore-2", "päevavalgustoru punktallikaks (m)", 72, 6],
    ["explore-3", "LED 0,5 m kauguselt (korda)", 100, 6],
    ["practice-1", "lambipirn 4 m kauguselt (korda)", 50, 6],
    ["practice-3", "Päikese suhe (korda)", 107.76, 2],
    ["exit-2", "tänavalamp 12 m kõrgusel (korda)", 200, 6],
  ])("%s (%s) → %s", (questionId, _what, expected, digits) => {
    expect(numericAnswer(questionId as string)).toBeCloseTo(
      expected as number,
      digits as number,
    );
  });

  it("suhteküsimus võtab vastu nii arvu kui ka arvu koos sõnaga „korda“ (Codexi leid)", () => {
    // Küsimus küsib „Mitu korda…", seega õpilane kirjutab loomulikult sõna
    // kaasa. Ilma `unit: "korda"` väljata luges checker selle valeks ja
    // sisuliselt õige vastus oleks salvestunud valena – sealtkaudu ka õpetaja
    // koondvaatesse. Vale arv peab muidugi ikka valeks jääma.
    const question = stepQuestions(
      activities.steps.find((step) => step.type === "explore")!,
    ).find((item) => item.id === "explore-3")!;
    if (question.kind !== "numeric") throw new Error("explore-3 peab olema arvküsimus");

    expect(question.unit).toBe("korda");
    expect(checkNumericAnswer(question, "100").correct).toBe(true);
    expect(checkNumericAnswer(question, "100 korda").correct).toBe(true);
    expect(checkNumericAnswer(question, "100,0").correct).toBe(true);
    expect(checkNumericAnswer(question, "72").correct).toBe(false);

    // Meeter EI ole siin õige: suhe on ühikuta arv ja „100 m" tähendab, et
    // õpilane vastas hoopis teisele küsimusele.
    const wrongUnit = checkNumericAnswer(question, "100 m");
    expect(wrongUnit.correct).toBe(false);
    expect(wrongUnit.feedback).toContain("korda");
  });

  it("explore-2 lubatud viga ei ulatu sinna, kus silt ekraanil veel ei ole vahetunud", () => {
    // 5% oleks olnud 68,4–75,6 m: sinna mahub ka 68,8 m, mille juures näidik
    // ütleb ikka „laiendatud allikas" – aga küsimus palub leida just sildi
    // vahetumise koha (Codexi leid 2026-08-10). Liuguri samm on 0,5 m.
    const question = stepQuestions(
      activities.steps.find((step) => step.type === "explore")!,
    ).find((item) => item.id === "explore-2")!;
    if (question.kind !== "numeric") throw new Error("explore-2 peab olema arvküsimus");

    expect(question.tolerance).toEqual({ mode: "absolute", value: 1 });
    expect(checkNumericAnswer(question, "72").correct).toBe(true);
    expect(checkNumericAnswer(question, "71,5").correct).toBe(true);
    expect(checkNumericAnswer(question, "73").correct).toBe(true);
    expect(checkNumericAnswer(question, "68,8").correct).toBe(false);
    // Ja see arv peab ka päriselt olema veel laiendatud allikas – muidu ei
    // oleks eelmine rida põhjendatud, vaid lihtsalt karm.
    expect(classifyByRatio(distanceToSizeRatio(1.2, 68.8))).toBe("extended");
  });

  it("KÕIK suhteküsimused kannavad sama ühikut – muidu jääks üks neist lukku", () => {
    // Ainus erand on explore-2, mis küsib kaugust meetrites.
    const ratioQuestions = ["explore-3", "practice-1", "practice-3", "exit-2"];
    for (const step of activities.steps) {
      for (const question of stepQuestions(step)) {
        if (question.kind !== "numeric") continue;
        const expected = ratioQuestions.includes(question.id) ? "korda" : "m";
        expect(question.unit, question.id).toBe(expected);
      }
    }
  });

  it("lahendatud näidis ja kordamiskaart rc-4 ütlevad sama arvu (200 korda)", () => {
    const practice = activities.steps.find((step) => step.type === "practice");
    const worked = practice?.type === "practice" ? practice.worked : undefined;
    expect(worked?.answer).toContain("200");
    const card = activities.reviewCards.find((item) => item.id === "rc-4");
    expect(card?.answer).toContain("200");
  });

  it("kordamiskaart rc-5 ütleb Päikese suhte (108 korda)", () => {
    const card = activities.reviewCards.find((item) => item.id === "rc-5");
    expect(card?.answer).toContain("108");
  });

  it("simulatsiooni ülesanne 1 on üldse lahendatav", () => {
    // Kui toru oleks 2 m kauguselt juba punktallikas, oleks explore-1 õige
    // vastus „jah" ja explore-2 küsiks kaugust, mida ei olegi.
    const { sizeM, distanceM } = EXAMPLE_SOURCES.paevavalgustoru;
    expect(classifyByRatio(distanceToSizeRatio(sizeM, distanceM))).toBe(
      "extended",
    );
    expect(pointSourceDistance(sizeM)).toBeGreaterThan(distanceM);
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
