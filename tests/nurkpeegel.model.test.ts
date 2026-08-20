import { describe, expect, it } from "vitest";
import { checkNumericAnswer } from "../src/checker/numeric";
import { stepQuestions } from "../src/engine/contract";
import { activitiesSchema, manifestSchema } from "../src/engine/contractSchema";
import { activities } from "../src/modules/physics/nurkpeegel/activities";
import { manifest } from "../src/modules/physics/nurkpeegel/manifest";
import { teacher } from "../src/modules/physics/nurkpeegel/teacher";
import {
  type Vector2,
  deviationDeg,
  secondHitDistanceM,
  secondIncidenceDeg,
  traceCornerRay,
} from "../src/modules/physics/nurkpeegel/model";

/**
 * Nurkpeegli mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist (sisu/MOODUL-nurkpeegel.md
 * „Füüsika (model.ts jaoks)" → testiväärtuste tabel ning piirjuhud ja
 * invariandid), mitte mudelist tagurpidi tuletatud – muidu testiks test
 * iseennast.
 *
 * Nurgad on kraadides, pikkused meetrites. Simulatsiooni algseis on θ = 60°,
 * α = 20°; osa ridu kasutab meelega teisi väärtusi (θ = 90° nurkpeegel,
 * α = 0 risti langev kiir), sest mudel peab vastama õigesti ka väljaspool
 * liuguri vahemikku ja just seal on piirid.
 */

/** Kõik lubatud täisarvulised (θ, α) paarid: 45° < θ ≤ 90°, θ − 90 < α < 2θ − 90. */
const VALID_PAIRS: Array<[number, number]> = [];
for (let mirrorAngleDeg = 46; mirrorAngleDeg <= 90; mirrorAngleDeg += 1) {
  const maxExclusiveDeg = 2 * mirrorAngleDeg - 90;
  const minExclusiveDeg = mirrorAngleDeg - 90;
  for (
    let firstIncidenceDeg = Math.max(0, minExclusiveDeg + 1);
    firstIncidenceDeg < maxExclusiveDeg;
    firstIncidenceDeg += 1
  ) {
    VALID_PAIRS.push([mirrorAngleDeg, firstIncidenceDeg]);
  }
}

function vectorLength(vector: Vector2): number {
  return Math.hypot(vector.x, vector.y);
}

/** Suunanurk kraadides, 0° = piki peeglit 1 tipust eemale. */
function directionAngleDeg(vector: Vector2): number {
  return (Math.atan2(vector.y, vector.x) * 180) / Math.PI;
}

describe("VALID_PAIRS – testivõre ise on mõistlik", () => {
  it("katab nii kitsaima kui laiima nurga", () => {
    expect(VALID_PAIRS.length).toBeGreaterThan(500);
    expect(VALID_PAIRS).toContainEqual([46, 0]);
    expect(VALID_PAIRS).toContainEqual([60, 20]);
    expect(VALID_PAIRS).toContainEqual([90, 89]);
    // θ = 90 juures on α = 0 keelatud (kiir jääks peegliga 2 paralleelseks).
    expect(VALID_PAIRS).not.toContainEqual([90, 0]);
  });
});

describe("deviationDeg – pööre on kaks korda peeglite nurk", () => {
  it.each([
    // Spetsi testiväärtuste tabel.
    [90, 180],
    [80, 160],
    [65, 130],
    // Arv on õige, aga sellise nurga juures ei ole kahe peegeldusega teed –
    // seda ütlevad ülejäänud kolm funktsiooni, mitte see.
    [45, 90],
    // Paralleelsed peeglid ehk periskoop.
    [0, 0],
  ])("θ = %s° → pööre %s°", (mirrorAngleDeg, expected) => {
    expect(deviationDeg(mirrorAngleDeg)).toBeCloseTo(expected, 9);
  });

  it("vigased arvud viskavad vea", () => {
    expect(() => deviationDeg(-1)).toThrow(RangeError);
    expect(() => deviationDeg(91)).toThrow(RangeError);
    expect(() => deviationDeg(Number.NaN)).toThrow(RangeError);
    expect(() => deviationDeg(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe("secondIncidenceDeg – kaks langemisnurka annavad kokku peeglite nurga", () => {
  it.each([
    // Spetsi testiväärtuste tabel.
    [90, 30, 60],
    [90, 60, 30],
    [60, 20, 40],
    [70, 25, 45],
    [80, 30, 50],
    // α = 0 on lubatud, kui θ < 90: kiir langeb peeglile 1 risti, tuleb sama
    // teed tagasi ja tabab peeglit 2 ikka, sest peegel 2 on kiilu kohal viltu.
    [60, 0, 60],
  ])("θ = %s°, α = %s° → β = %s°", (mirrorAngleDeg, firstDeg, expected) => {
    expect(secondIncidenceDeg(mirrorAngleDeg, firstDeg)).toBeCloseTo(expected, 9);
  });

  it("θ ≤ 45° viskab vea – kahe peegeldusega teed ei ole olemas", () => {
    expect(() => secondIncidenceDeg(45, 10)).toThrow(RangeError);
    expect(() => secondIncidenceDeg(30, 10)).toThrow(RangeError);
    // Paralleelsetel peeglitel ei ole tippu ega „kaugust tipust".
    expect(() => secondIncidenceDeg(0, 0)).toThrow(RangeError);
  });

  it("vigane nurk viskab vea", () => {
    expect(() => secondIncidenceDeg(91, 10)).toThrow(RangeError);
    expect(() => secondIncidenceDeg(-1, 10)).toThrow(RangeError);
    expect(() => secondIncidenceDeg(60, -1)).toThrow(RangeError);
    expect(() => secondIncidenceDeg(Number.NaN, 10)).toThrow(RangeError);
    expect(() => secondIncidenceDeg(60, Number.NaN)).toThrow(RangeError);
    expect(() => secondIncidenceDeg(60, Number.POSITIVE_INFINITY)).toThrow(
      RangeError,
    );
  });
});

describe("secondHitDistanceM – kui kaugel tipust on teine langemispunkt", () => {
  it.each([
    // Spetsi testiväärtuste tabel.
    // Sümmeetriline juht: α = β, seega e = d.
    [90, 45, 0.1, 0.1],
    [90, 30, 0.1, 0.17321],
    [60, 20, 0.1, 0.12267],
    [80, 20, 0.2, 0.37588],
    // Risti langenud kiir: e = d / cos θ.
    [60, 0, 0.1, 0.2],
  ])("θ = %s°, α = %s°, d = %s m → e = %s m", (mirrorDeg, firstDeg, d, expected) => {
    expect(secondHitDistanceM(mirrorDeg, firstDeg, d)).toBeCloseTo(expected, 5);
  });

  it("kaugus ilma langemispunktita viskab vea", () => {
    expect(() => secondHitDistanceM(60, 20, 0)).toThrow(RangeError);
    expect(() => secondHitDistanceM(60, 20, -0.1)).toThrow(RangeError);
    expect(() => secondHitDistanceM(60, 20, Number.NaN)).toThrow(RangeError);
    expect(() => secondHitDistanceM(60, 20, Number.POSITIVE_INFINITY)).toThrow(
      RangeError,
    );
  });

  it("θ ≤ 45° ja vigased nurgad viskavad vea", () => {
    expect(() => secondHitDistanceM(45, 10, 0.1)).toThrow(RangeError);
    expect(() => secondHitDistanceM(91, 10, 0.1)).toThrow(RangeError);
    expect(() => secondHitDistanceM(60, -1, 0.1)).toThrow(RangeError);
  });

  it("ülevoolav tulemus viskab vea, mitte ei anna lõpmatust", () => {
    // Iga argument eraldi on korralik arv ja α = 1e-13 on lubatud (suurem kui
    // piir θ − 90° = 0), aga siis on β praktiliselt 90°: cos β ≈ 1,7e-15 ja
    // jagatis ei mahu arvu sisse.
    expect(() => secondHitDistanceM(90, 1e-13, 1e308)).toThrow(RangeError);
  });
});

describe("traceCornerRay – kogu teekond korraga", () => {
  const rightAngle = traceCornerRay(90, 30, 0.2);

  it("esimene langemispunkt on peeglil 1 kaugusel d", () => {
    expect(rightAngle.firstHitM).toEqual({ x: 0.2, y: 0 });
  });

  it("teine langemispunkt on spetsi tabeli järgi", () => {
    expect(rightAngle.secondHitM.x).toBeCloseTo(0, 9);
    expect(rightAngle.secondHitM.y).toBeCloseTo(0.34641, 5);
  });

  it("kolm suunda on spetsi tabeli järgi", () => {
    expect(rightAngle.middleDirection.x).toBeCloseTo(-0.5, 5);
    expect(rightAngle.middleDirection.y).toBeCloseTo(0.86603, 5);
    expect(rightAngle.incidentDirection.x).toBeCloseTo(-0.5, 5);
    expect(rightAngle.incidentDirection.y).toBeCloseTo(-0.86603, 5);
    // Täpselt vastupidine sissetulevale – see ongi nurkpeegli mõte.
    expect(rightAngle.outgoingDirection.x).toBeCloseTo(0.5, 5);
    expect(rightAngle.outgoingDirection.y).toBeCloseTo(0.86603, 5);
  });

  it("nurgad tulevad kaasa samast arvutusest", () => {
    const path = traceCornerRay(60, 20, 0.1);
    expect(path.firstIncidenceDeg).toBeCloseTo(20, 9);
    expect(path.secondIncidenceDeg).toBeCloseTo(40, 9);
    expect(path.deviationDeg).toBeCloseTo(120, 9);
  });

  it("keelatud sisend viskab vea", () => {
    // θ ≤ 45° – kahe peegeldusega teed ei ole olemas.
    expect(() => traceCornerRay(30, 10, 0.1)).toThrow(RangeError);
    expect(() => traceCornerRay(45, 5, 0.1)).toThrow(RangeError);
    // Täpselt piiril: ψ₂ = 0, kiir libiseks piki peeglit 1.
    expect(() => traceCornerRay(60, 30, 0.1)).toThrow(RangeError);
    // ψ₂ = −10° – kiir peegelduks kolmandat korda.
    expect(() => traceCornerRay(60, 40, 0.1)).toThrow(RangeError);
    // Ainus juht alumise piiri taga: peeglilt 1 tulnud kiir jääks peegliga 2
    // paralleelseks.
    expect(() => traceCornerRay(90, 0, 0.1)).toThrow(RangeError);
    expect(() => traceCornerRay(60, 20, 0)).toThrow(RangeError);
    expect(() => traceCornerRay(60, Number.NaN, 0.1)).toThrow(RangeError);
  });
});

describe("invariandid – need on mooduli päris väited", () => {
  it("α + β = θ ja pööre = 2θ kogu lubatud võres", () => {
    for (const [mirrorAngleDeg, firstIncidenceDeg] of VALID_PAIRS) {
      const path = traceCornerRay(mirrorAngleDeg, firstIncidenceDeg, 0.1);
      expect(path.firstIncidenceDeg + path.secondIncidenceDeg).toBe(
        mirrorAngleDeg,
      );
      expect(path.deviationDeg).toBe(2 * mirrorAngleDeg);
    }
  });

  it("90° nurkpeegel saadab valguse tagasi sinna, kust ta tuli", () => {
    // Mooduli kõige tähtsam test: kui see punaseks läheb, on katki see,
    // mille peal helkur seisab.
    for (let firstIncidenceDeg = 1; firstIncidenceDeg < 90; firstIncidenceDeg += 1) {
      const path = traceCornerRay(90, firstIncidenceDeg, 0.1);
      expect(path.outgoingDirection.x).toBeCloseTo(-path.incidentDirection.x, 12);
      expect(path.outgoingDirection.y).toBeCloseTo(-path.incidentDirection.y, 12);
    }
  });

  it("pööre ei sõltu langemisnurgast", () => {
    for (const mirrorAngleDeg of [60, 70, 75, 80, 90]) {
      const angles = VALID_PAIRS.filter(([theta]) => theta === mirrorAngleDeg).map(
        ([, alpha]) => alpha,
      );
      expect(angles.length).toBeGreaterThan(1);
      const deviations = new Set(
        angles.map(
          (alpha) => traceCornerRay(mirrorAngleDeg, alpha, 0.1).deviationDeg,
        ),
      );
      expect(deviations).toEqual(new Set([2 * mirrorAngleDeg]));
    }
  });

  it("mõõtkava: kahekordne d annab kaks korda kaugemad punktid, samad suunad", () => {
    for (const [mirrorAngleDeg, firstIncidenceDeg] of VALID_PAIRS) {
      const small = traceCornerRay(mirrorAngleDeg, firstIncidenceDeg, 0.1);
      const large = traceCornerRay(mirrorAngleDeg, firstIncidenceDeg, 0.2);

      expect(large.firstHitM.x).toBeCloseTo(2 * small.firstHitM.x, 12);
      expect(large.firstHitM.y).toBeCloseTo(2 * small.firstHitM.y, 12);
      expect(large.secondHitM.x).toBeCloseTo(2 * small.secondHitM.x, 12);
      expect(large.secondHitM.y).toBeCloseTo(2 * small.secondHitM.y, 12);

      expect(large.middleDirection.x).toBeCloseTo(small.middleDirection.x, 12);
      expect(large.middleDirection.y).toBeCloseTo(small.middleDirection.y, 12);
      expect(large.outgoingDirection.x).toBeCloseTo(small.outgoingDirection.x, 12);
      expect(large.outgoingDirection.y).toBeCloseTo(small.outgoingDirection.y, 12);
      expect(large.secondIncidenceDeg).toBe(small.secondIncidenceDeg);
      expect(large.deviationDeg).toBe(small.deviationDeg);
    }
  });

  it("kõik kolm suunda on ühikvektorid", () => {
    for (const [mirrorAngleDeg, firstIncidenceDeg] of VALID_PAIRS) {
      const path = traceCornerRay(mirrorAngleDeg, firstIncidenceDeg, 0.1);
      expect(vectorLength(path.incidentDirection)).toBeCloseTo(1, 12);
      expect(vectorLength(path.middleDirection)).toBeCloseTo(1, 12);
      expect(vectorLength(path.outgoingDirection)).toBeCloseTo(1, 12);
    }
  });

  it("teine langemispunkt on peeglil 2 ja õigel kaugusel tipust", () => {
    for (const [mirrorAngleDeg, firstIncidenceDeg] of VALID_PAIRS) {
      const path = traceCornerRay(mirrorAngleDeg, firstIncidenceDeg, 0.1);
      expect(directionAngleDeg(path.secondHitM)).toBeCloseTo(mirrorAngleDeg, 9);
      expect(vectorLength(path.secondHitM)).toBeCloseTo(
        secondHitDistanceM(mirrorAngleDeg, firstIncidenceDeg, 0.1),
        12,
      );
    }
  });

  it("väljuva kiire suund on ψ₂ = 2θ − 90° − α ja jääb kiilust välja", () => {
    // Valem ja vektorarvutus on siin teineteise ristkontroll: kui üks neist
    // kunagi eksib, ei kattu nad enam.
    for (const [mirrorAngleDeg, firstIncidenceDeg] of VALID_PAIRS) {
      const path = traceCornerRay(mirrorAngleDeg, firstIncidenceDeg, 0.1);
      const expectedDeg = 2 * mirrorAngleDeg - 90 - firstIncidenceDeg;
      expect(directionAngleDeg(path.outgoingDirection)).toBeCloseTo(
        expectedDeg,
        9,
      );
      expect(expectedDeg).toBeGreaterThan(0);
      expect(expectedDeg).toBeLessThan(mirrorAngleDeg);
    }
  });

  it("sissetulev kiir liigub tipu poole ja alla, keskmine lõik üles", () => {
    for (const [mirrorAngleDeg, firstIncidenceDeg] of VALID_PAIRS) {
      const path = traceCornerRay(mirrorAngleDeg, firstIncidenceDeg, 0.1);
      // Kiir tuleb ülalt peeglile 1 (y-komponent alla), läheb sealt üles
      // peeglile 2.
      expect(path.incidentDirection.y).toBeLessThan(0);
      expect(path.middleDirection.y).toBeGreaterThan(0);
      // Peegeldumisseadus peeglil 1 vektorkujul: x jääb samaks, y pöördub.
      expect(path.middleDirection.x).toBeCloseTo(path.incidentDirection.x, 12);
    }
  });
});

// ---------------------------------------------------------------------------
// Mooduli sisu: manifest, sammud, õpetajajuhend (samm 4.1bbb)
// ---------------------------------------------------------------------------

describe("manifest", () => {
  it("vastab moodulilepingu skeemile", () => {
    expect(() => manifestSchema.parse(manifest)).not.toThrow();
  });

  it("viitab õpitulemusele P1-T2 ega võta endale praktilist tööd", () => {
    // Uut seadust ei tule ja P1-PT1…PT4 on kõik teiste moodulite all.
    expect(manifest.outcomes).toEqual(["P1-T2"]);
    expect(manifest.practicalWork).toEqual([]);
  });

  it("ei võta endale teiste moodulite ainekava põhimõisteid", () => {
    // `tasapeegel` kuulub moodulitele peegeldumisseadus ja tasapeegli-kujutis,
    // `kumerpeegel`, `nõguspeegel` ja `fookus` kõverpeeglite moodulitele.
    // Katvusraport võrdleb mõisteid NIME järgi, seega on „nurkpeegel" ja
    // „periskoop" tema jaoks tundmatud nimed ja lähevad õigesti märkuseks.
    expect(manifest.concepts).toEqual(["nurkpeegel", "periskoop"]);
    for (const concept of manifest.concepts) {
      for (const owned of [
        "tasapeegel",
        "kumerpeegel",
        "nõguspeegel",
        "fookus",
        "valguskiir",
        "valgusvihk",
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
    expect(figures).toEqual(["np-ule-aia", "np-kaks-peeglit", "np-loe-nurgad"]);
  });

  it("pöörde lüliti avaneb alles pärast esimest ülesannet", () => {
    // Enne seda näeb õpilane ainult kaht peegeldust eraldi ja jõuab seoseni
    // α + β = θ ise. Kui pöörde arv oleks kohe ekraanil, oleks mooduli vastus
    // („2θ") käes enne küsimust.
    const explore = activities.steps.find((step) => step.type === "explore");
    expect(explore?.type).toBe("explore");
    if (explore?.type !== "explore") return;
    expect(explore.simulation?.unlocks).toEqual([
      { feature: "poorde-lyliti", afterQuestion: "explore-1" },
    ]);
  });

  it("õpilase pool ei ületa mooduli piire: kujutisi siin ei loeta", () => {
    // sisu/MOODUL-nurkpeegel.md „Piirid": kujutiste arv nurkpeeglis
    // (kaleidoskoop) on TEINE õpieesmärk ja jääb õpetajajuhendisse; helkur on
    // järgmise mooduli oma ja tohib olla ainult ühe lausega ilma seletuseta.
    // Väiketäheks enne kontrolli: lause alguses olev „Kujutis" lipsaks muidu
    // läbi (CodeRabbiti leid, samm 4.1xx).
    const all = studentTexts().join(" ").toLowerCase();
    expect(all).not.toContain("kujutis");
    expect(all).not.toContain("kaleidoskoop");
    expect(all).not.toContain("peeglikiri");
    const helkur = studentTexts().filter((text) =>
      text.toLowerCase().includes("helkur"),
    );
    expect(helkur.length).toBeLessThanOrEqual(2);
  });

  it("iga arvküsimus on kraadides ja sama tolerantsiga", () => {
    // Kogu moodul on kraadides – ühikuteisendusi siin ei ole. 0,5° on
    // LUGEMISTOLERANTS: liuguri samm on 5° ja pööre liigub 10° kaupa, seega
    // naaberväärtus jääb kindlalt välja.
    for (const step of activities.steps) {
      for (const question of stepQuestions(step)) {
        if (question.kind === "numeric") {
          expect(question.unit, question.id).toBe("°");
          expect(question.tolerance, question.id).toEqual({
            mode: "absolute",
            value: 0.5,
          });
        }
      }
    }
  });
});

/**
 * Ülesannete vastused vs. mudel.
 *
 * `activities.ts` võtab iga pöörde ja langemisnurga MUDELIST (CLAUDE.md reegel
 * 1), seega näpuviga arvutuses siin välja ei paistaks – küll aga paistab välja
 * vale liuguriseis, vale ühik või vale tolerants. Seepärast on ootus
 * kirjutatud SPETSIFIKATSIOONI järgi (sisu/MOODUL-nurkpeegel.md „Sammud").
 */
describe("ülesannete vastused käivad spetsifikatsiooniga kokku", () => {
  it("explore-1: algseisus on langemisnurk teisel peeglil 40°", () => {
    expect(numericQuestion("explore-1").answer).toBe(40);
  });

  it("explore-2: algseisu pööre on 120°", () => {
    expect(numericQuestion("explore-2").answer).toBe(120);
  });

  it("explore-3: 75° peeglite nurk annab pöördeks 150°", () => {
    expect(numericQuestion("explore-3").answer).toBe(150);
  });

  it("practice-1, practice-2 ja practice-3 on spetsi arvud", () => {
    expect(numericQuestion("practice-1").answer).toBe(160);
    // Pöördülesanne: pööre on teada, peeglite nurk otsitav.
    expect(numericQuestion("practice-2").prompt).toContain("160°");
    expect(numericQuestion("practice-2").answer).toBe(80);
    expect(numericQuestion("practice-3").answer).toBe(45);
  });

  it("exit-1: 70° peeglite nurk annab pöördeks 140°", () => {
    expect(numericQuestion("exit-1").answer).toBe(140);
  });

  it("iga ülesande seis on mudeli piirides", () => {
    // Ükski ülesanne ei tohi küsida arvu, mida mudel keeldub andmast:
    // θ > 45° ja α < 2θ − 90° (kahe peegeldusega tee). Explore-1 ja
    // practice-3 on ainsad kaks kohta, kus langemisnurk üldse ette antakse.
    expect(() => secondIncidenceDeg(60, 20)).not.toThrow();
    expect(() => secondIncidenceDeg(70, 25)).not.toThrow();
    expect(() => secondIncidenceDeg(80, 30)).not.toThrow();
    // Sama seis ühe sammu võrra kitsama nurga juures oleks juba keelatud –
    // nii on näha, et piir ei ole kaugel ja seisud on valitud, mitte juhuslikud.
    expect(() => secondIncidenceDeg(55, 20)).toThrow(RangeError);
  });

  it("lugemistolerants ei luba peeglite nurka pöörde vastuseks", () => {
    // Kogu mooduli kõige sagedasem viga: pööre = peeglite nurk. Ta peab
    // kukkuma läbi ja saama LÕKSU tagasiside, mitte üldise „vale".
    const deviation = numericQuestion("explore-2");
    expect(checkNumericAnswer(deviation, "120").correct).toBe(true);
    expect(checkNumericAnswer(deviation, "60").correct).toBe(false);
    const inverse = numericQuestion("practice-2");
    expect(checkNumericAnswer(inverse, "80").correct).toBe(true);
    expect(checkNumericAnswer(inverse, "160").correct).toBe(false);
  });

  it("lõksud katavad mõlemat pidi eksimise", () => {
    // Nii see, kes kordab peeglite nurka pöörde asemel, kui ka see, kes
    // kordab pöörde arvu peeglite nurga asemel.
    const trapAnswers = ["explore-2", "explore-3", "practice-2", "exit-1"].map(
      (id) => numericQuestion(id).traps?.[0]?.answer,
    );
    expect(trapAnswers).toEqual([60, 75, 160, 70]);
    for (const id of ["explore-2", "explore-3", "practice-2", "exit-1"]) {
      expect(numericQuestion(id).traps?.[0]?.misconception, id).toBe(
        "peeglite-nurk-on-poorde-nurk",
      );
    }
  });

  it("predict-1 õige vastus on tagasitulek ja mõlemad valed on nimetatud", () => {
    const question = choiceQuestion("predict-1");
    expect(
      question.options.filter((option) => option.correct).map((option) => option.id),
    ).toEqual(["tagasi"]);
    const wrong = question.options.filter((option) => !option.correct);
    expect(wrong.map((option) => option.misconception)).toEqual([
      "kaks-peeglit-tuhistavad",
      "peeglite-nurk-on-poorde-nurk",
    ]);
  });

  it("explore-4 kannab mudeli arvu ja püüab mõlemad langemisnurga-väärarusaamad", () => {
    const question = choiceQuestion("explore-4");
    const correct = question.options.filter((option) => option.correct);
    expect(correct.map((option) => option.id)).toEqual(["alati-vastassuunas"]);
    // 180° tuleb mudelist ja on sama arv, mis ekraanil.
    expect(correct[0].text).toContain(`${deviationDeg(90)}°`);
    const wrong = question.options.filter((option) => !option.correct);
    expect(wrong.map((option) => option.misconception)).toEqual([
      "poore-soltub-langemisnurgast",
      "tagasitulek-soltub-langemisnurgast",
    ]);
  });

  it("practice-4 ülekandeülesandel on kolm õiget kohta", () => {
    const question = choiceQuestion("practice-4");
    expect(question.multiple).toBe(true);
    expect(question.options.filter((option) => option.correct)).toHaveLength(3);
    const wrong = question.options.filter((option) => !option.correct);
    expect(wrong.map((option) => option.misconception)).toEqual([
      "periskoop-poorab-pilti",
      "pikem-tee-suurendab",
    ]);
  });

  it("exit-2 vale variant „jääb kinni\" on meelega sildita", () => {
    // Ta ei ole ükski mooduli väärarusaamadest: `kaks-peeglit-tuhistavad`
    // tähendab vastupidist („kiir läheb lihtsalt edasi"). Vale sildi all
    // jõuaks õpetaja koondvaatesse väärarusaam, mida õpilasel ei olnud
    // (CodeRabbiti leid, samm 4.1bbb).
    const question = choiceQuestion("exit-2");
    const trapped = question.options.find((option) => option.id === "jaab-kinni");
    expect(trapped?.correct).toBe(false);
    expect(trapped?.misconception).toBeUndefined();
    expect(
      question.options.find((option) => option.id === "valjub-90")?.misconception,
    ).toBe("peeglite-nurk-on-poorde-nurk");
  });

  it("periskoobi arv on mudeli oma: paralleelsed peeglid ei pööra midagi", () => {
    expect(deviationDeg(0)).toBe(0);
    expect(choiceQuestion("practice-4").prompt).toContain("0°");
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

  it("spetsifikatsiooni kaheksa väärarusaama on kõik olemas", () => {
    for (const id of [
      "peeglite-nurk-on-poorde-nurk",
      "kaks-peeglit-tuhistavad",
      "poore-soltub-langemisnurgast",
      "tagasitulek-soltub-langemisnurgast",
      "periskoop-poorab-pilti",
      "teine-peegel-ei-jargi-seadust",
      "pikem-tee-suurendab",
      "nurkpeegel-vajab-taisnurka",
    ]) {
      expect(known, id).toContain(id);
    }
  });

  it("ohutus ütleb välja, et nurkpeegel saadab kiire katsetaja enda poole", () => {
    // Selle mooduli oht ei tule peeglist, vaid laserist: just see omadus, mis
    // teeb mooduli huvitavaks, suunab kiire tagasi osuti hoidja poole.
    expect(teacher.safety).toContain("Laserosutit");
    expect(teacher.safety).toContain("tagasi");
    expect(teacher.safety).toContain("taskulamp");
  });

  it("õpetaja saab teada, miks päris katse arvud lohisevad", () => {
    // model.ts idealiseeringud 1–3 – UI ei tohi neid päris füüsikana esitada.
    expect(teacher.whyRealDiffers).toContain("klaas");
    expect(teacher.whyRealDiffers).toContain("5 %");
  });

  it("klassikatse hoiatab kitsa nurga eest", () => {
    // Kitsamas kiilus ei ole pööre enam 2θ (model.ts piir θ > 45°). Kui
    // õpetaja seda ei tea, paistab reegli piir katse äpardusena.
    expect(teacher.twoMirrorActivity.join(" ")).toContain("60°…90°");
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
