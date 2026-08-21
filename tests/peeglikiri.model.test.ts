import { describe, expect, it } from "vitest";
import { stepQuestions } from "../src/engine/contract";
import { activitiesSchema } from "../src/engine/contractSchema";
import { activities } from "../src/modules/physics/peeglikiri/activities";
import { mirrorWordText } from "../src/modules/physics/peeglikiri/display";
import { manifest } from "../src/modules/physics/peeglikiri/manifest";
import { teacher } from "../src/modules/physics/peeglikiri/teacher";
import { imageDistance } from "../src/modules/physics/tasapeegli-kujutis/model";
import {
  ESTONIAN_UPPERCASE_LETTERS,
  MAX_OBJECT_DEPTH_M,
  MAX_WORD_LENGTH,
  SLIDERS,
  SYMMETRIC_LETTERS,
  alongMirrorPositionM,
  imageDepthM,
  isVerticallySymmetricLetter,
  mirrorLetterIndex,
} from "../src/modules/physics/peeglikiri/model";

/**
 * Peeglikirja mudeli test.
 *
 * Väärtused on võetud spetsifikatsioonist (sisu/MOODUL-peeglikiri.md „Füüsika
 * (model.ts jaoks)" → testiväärtuste tabel ning piirjuhud ja invariandid),
 * mitte mudelist tagurpidi tuletatud – muidu testiks test iseennast.
 *
 * Ühikud: sügavus ja asend meetrites, tähe koht sõnas ühikuta täisarv.
 */

/** Kõik lubatud sõnapikkused 1…20 – mitu invarianti käib neid kõiki läbi. */
const WORD_LENGTHS = Array.from(
  { length: MAX_WORD_LENGTH },
  (_, index) => index + 1,
);

describe("imageDepthM – kujutise sügavus (märgiga)", () => {
  it("annab spetsifikatsiooni tabeli väärtused", () => {
    expect(imageDepthM(1)).toBe(-1);
    expect(imageDepthM(0.3)).toBeCloseTo(-0.3, 12);
    expect(imageDepthM(MAX_OBJECT_DEPTH_M)).toBe(-5);
  });

  it("on alati negatiivne – kujutis on peegli TAGA", () => {
    for (const depthM of [0.1, 0.5, 1, 2.5, 5]) {
      expect(imageDepthM(depthM)).toBeLessThan(0);
    }
  });

  it("viskab vea sügavusel 0 – peegli sees ei ole kirja", () => {
    expect(() => imageDepthM(0)).toThrow(RangeError);
  });

  it("viskab vea üle lubatud vahemiku ja negatiivsel sügavusel", () => {
    expect(() => imageDepthM(6)).toThrow(RangeError);
    expect(() => imageDepthM(MAX_OBJECT_DEPTH_M + 0.001)).toThrow(RangeError);
    expect(() => imageDepthM(-1)).toThrow(RangeError);
  });

  it("viskab vea, kui sisend ei ole lõplik arv", () => {
    expect(() => imageDepthM(Number.NaN)).toThrow(RangeError);
    expect(() => imageDepthM(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => imageDepthM(Number.NEGATIVE_INFINITY)).toThrow(RangeError);
  });

  /**
   * Ristkontroll mooduliga `tasapeegli-kujutis` – ainus koht, kus selle mooduli
   * testid teist moodulit puudutavad (rakenduse kood seda importi EI tee).
   * Kaks moodulit ei tohi hoida sama fakti kahes eri arvus: kujutise kaugus on
   * mõlemas sama, siin on ainult märk suunda näitamas.
   */
  it("annab sama suuruse, mis tasapeegli-kujutis.imageDistance(d)", () => {
    for (let tenths = 1; tenths <= 50; tenths += 1) {
      const depthM = tenths / 10;
      expect(Math.abs(imageDepthM(depthM))).toBe(imageDistance(depthM));
    }
  });

  it("vastab kogu liuguri võre peal", () => {
    const { min, max, step } = SLIDERS.objectDepthM;
    const stepCount = Math.round((max - min) / step);
    for (let index = 0; index <= stepCount; index += 1) {
      const depthM = Number((min + index * step).toFixed(10));
      expect(depthM).toBeGreaterThan(0);
      expect(depthM).toBeLessThanOrEqual(MAX_OBJECT_DEPTH_M);
      expect(imageDepthM(depthM)).toBeCloseTo(-depthM, 12);
    }
  });

  it("liuguri algväärtus 0,5 m on võre peal", () => {
    const { min, step } = SLIDERS.objectDepthM;
    expect(Math.round((0.5 - min) / step)).toBeCloseTo((0.5 - min) / step, 9);
  });
});

describe("alongMirrorPositionM – peegli pinnaga paralleelne asend", () => {
  /**
   * Mooduli kõige tähtsam üksikväide: peegel EI liiguta midagi vasakule ega
   * paremale. Võrdlus on TÄPNE (`toBe`), mitte ligikaudne – ligikaudne test
   * laseks läbi ka mudeli, mis asendit natuke nihutab.
   */
  it("tagastab täpselt sisendi (positiivne, negatiivne, null, murdarvud)", () => {
    const values = [0, 0.5, -0.5, 1, -1, 0.123456789, -0.123456789, 12.5, -12.5, 1000];
    for (const value of values) {
      expect(alongMirrorPositionM(value)).toBe(value);
    }
  });

  it("annab spetsifikatsiooni tabeli väärtused", () => {
    expect(alongMirrorPositionM(0.5)).toBe(0.5);
    expect(alongMirrorPositionM(-0.5)).toBe(-0.5);
    expect(alongMirrorPositionM(0)).toBe(0);
  });

  it("ei muuda märki – vasak jääb vasakule, parem paremale", () => {
    for (const value of [0.2, 1.4, 3]) {
      expect(alongMirrorPositionM(value)).toBeGreaterThan(0);
      expect(alongMirrorPositionM(-value)).toBeLessThan(0);
    }
  });

  it("viskab vea, kui sisend ei ole lõplik arv", () => {
    expect(() => alongMirrorPositionM(Number.NaN)).toThrow(RangeError);
    expect(() => alongMirrorPositionM(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => alongMirrorPositionM(Number.NEGATIVE_INFINITY)).toThrow(RangeError);
  });
});

describe("mirrorLetterIndex – tähe koht sõnas", () => {
  it("annab spetsifikatsiooni tabeli väärtused", () => {
    // TAKSO: „T" käib paberil kõige PAREMALE, „O" kõige VASAKULE.
    expect(mirrorLetterIndex(0, 5)).toBe(4);
    expect(mirrorLetterIndex(4, 5)).toBe(0);
    expect(mirrorLetterIndex(2, 5)).toBe(2);
    expect(mirrorLetterIndex(0, 1)).toBe(0);
  });

  it("annab practice- ja exit-ülesannete vastused", () => {
    expect(mirrorLetterIndex(0, 4)).toBe(3); // AUTO, näidis
    expect(mirrorLetterIndex(6, 7)).toBe(0); // KIIRABI, osaline
    expect(mirrorLetterIndex(2, 6)).toBe(3); // PEEGEL, iseseisev
    expect(mirrorLetterIndex(1, 4)).toBe(2); // AUTO, väljumispilet
  });

  it("on involutsioon: kaks korda rakendatuna tuleb algne indeks", () => {
    for (const wordLength of WORD_LENGTHS) {
      for (let index = 0; index < wordLength; index += 1) {
        expect(mirrorLetterIndex(mirrorLetterIndex(index, wordLength), wordLength)).toBe(
          index,
        );
      }
    }
  });

  it("jääb alati sõna sisse", () => {
    for (const wordLength of WORD_LENGTHS) {
      for (let index = 0; index < wordLength; index += 1) {
        const mirrored = mirrorLetterIndex(index, wordLength);
        expect(mirrored).toBeGreaterThanOrEqual(0);
        expect(mirrored).toBeLessThan(wordLength);
      }
    }
  });

  it("jätab paaritu pikkusega sõna keskmise tähe paigale", () => {
    for (const wordLength of [1, 5, 9]) {
      const middle = (wordLength - 1) / 2;
      expect(mirrorLetterIndex(middle, wordLength)).toBe(middle);
    }
  });

  it("paarisarvulise pikkusega sõnas ei jää ükski täht paigale", () => {
    for (const wordLength of WORD_LENGTHS.filter((n) => n % 2 === 0)) {
      for (let index = 0; index < wordLength; index += 1) {
        expect(mirrorLetterIndex(index, wordLength)).not.toBe(index);
      }
    }
  });

  it("viskab vea, kui indeks on väljaspool sõna", () => {
    expect(() => mirrorLetterIndex(5, 5)).toThrow(RangeError);
    expect(() => mirrorLetterIndex(-1, 5)).toThrow(RangeError);
    expect(() => mirrorLetterIndex(1, 1)).toThrow(RangeError);
  });

  it("viskab vea vigase sõnapikkuse korral", () => {
    expect(() => mirrorLetterIndex(0, 0)).toThrow(RangeError);
    expect(() => mirrorLetterIndex(0, -3)).toThrow(RangeError);
    expect(() => mirrorLetterIndex(0, MAX_WORD_LENGTH + 1)).toThrow(RangeError);
  });

  it("viskab vea, kui argument ei ole täisarv", () => {
    expect(() => mirrorLetterIndex(1.5, 5)).toThrow(RangeError);
    expect(() => mirrorLetterIndex(0, 5.5)).toThrow(RangeError);
    expect(() => mirrorLetterIndex(Number.NaN, 5)).toThrow(RangeError);
    expect(() => mirrorLetterIndex(0, Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe("isVerticallySymmetricLetter – tähe enda kuju", () => {
  it("annab spetsifikatsiooni tabeli väärtused", () => {
    expect(isVerticallySymmetricLetter("A")).toBe(true);
    expect(isVerticallySymmetricLetter("T")).toBe(true);
    expect(isVerticallySymmetricLetter("O")).toBe(true);
    expect(isVerticallySymmetricLetter("Ä")).toBe(true);
    expect(isVerticallySymmetricLetter("K")).toBe(false);
    expect(isVerticallySymmetricLetter("S")).toBe(false);
    expect(isVerticallySymmetricLetter("Š")).toBe(false);
  });

  /**
   * Loend ja funktsioon ei tohi kunagi lahku minna: kui keegi lisab tähe
   * loendisse või võtab sealt ära, peab see kohe funktsiooni vastuses paista.
   */
  it("käib kokku loendiga SYMMETRIC_LETTERS kõigi 32 tähe peal", () => {
    const symmetric: ReadonlySet<string> = new Set(SYMMETRIC_LETTERS);
    for (const letter of ESTONIAN_UPPERCASE_LETTERS) {
      expect(isVerticallySymmetricLetter(letter)).toBe(symmetric.has(letter));
    }
  });

  it("tähestikus on 32 tähte ja sümmeetrilisi 15", () => {
    expect(ESTONIAN_UPPERCASE_LETTERS).toHaveLength(32);
    expect(SYMMETRIC_LETTERS).toHaveLength(15);
    expect(new Set(ESTONIAN_UPPERCASE_LETTERS).size).toBe(32);
  });

  it("iga sümmeetriline täht on olemas ka tähestikus", () => {
    const alphabet: ReadonlySet<string> = new Set(ESTONIAN_UPPERCASE_LETTERS);
    for (const letter of SYMMETRIC_LETTERS) {
      expect(alphabet.has(letter)).toBe(true);
    }
  });

  it("viskab vea väiketähe, mitme tähe, numbri ja tühiku korral", () => {
    expect(() => isVerticallySymmetricLetter("a")).toThrow(RangeError);
    expect(() => isVerticallySymmetricLetter("AB")).toThrow(RangeError);
    expect(() => isVerticallySymmetricLetter("5")).toThrow(RangeError);
    expect(() => isVerticallySymmetricLetter(" ")).toThrow(RangeError);
    expect(() => isVerticallySymmetricLetter("")).toThrow(RangeError);
    expect(() => isVerticallySymmetricLetter("Ö ")).toThrow(RangeError);
  });

  it("tunneb ära ka lahtikirjutatud täpitähe (NFD → NFC)", () => {
    expect(isVerticallySymmetricLetter("Ä")).toBe(true); // Ä lahku kirjutatuna
    expect(isVerticallySymmetricLetter("Š")).toBe(false); // Š lahku kirjutatuna
  });

});

describe("TAAT ja TAKSO – explore- ja practice-ülesannete alus", () => {
  const isPalindrome = (word: string): boolean =>
    word === [...word].reverse().join("");

  const allLettersSymmetric = (word: string): boolean =>
    [...word].every((letter) => isVerticallySymmetricLetter(letter));

  it("TAAT on palindroom JA kõik tema tähed on sümmeetrilised", () => {
    expect(isPalindrome("TAAT")).toBe(true);
    expect(allLettersSymmetric("TAAT")).toBe(true);
  });

  it("TAKSO ei ole kumbagi – seepärast ta peeglis ei loe", () => {
    expect(isPalindrome("TAKSO")).toBe(false);
    expect(allLettersSymmetric("TAKSO")).toBe(false);
  });

  it("TAKSO tähtedest on peeglis samasugused täpselt kolm (T, A, O)", () => {
    const symmetricCount = [..."TAKSO"].filter((letter) =>
      isVerticallySymmetricLetter(letter),
    ).length;
    expect(symmetricCount).toBe(3);
  });

  it("TAKSO seisab peeglis järjekorras OSKAT", () => {
    const word = "TAKSO";
    const inMirror = Array.from(
      { length: word.length },
      (_, index) => word[mirrorLetterIndex(index, word.length)],
    ).join("");
    expect(inMirror).toBe("OSKAT");
  });

  it("KIIRABI seisab peeglis järjekorras IBARIIK (hooki joonis)", () => {
    const word = "KIIRABI";
    const inMirror = Array.from(
      { length: word.length },
      (_, index) => word[mirrorLetterIndex(index, word.length)],
    ).join("");
    expect(inMirror).toBe("IBARIIK");
  });
});

/* --------------------------------------------------------------------------
 * Mooduli sisu: sammud, ülesanded ja õpetajajuhend (samm 4.1sss)
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
    // Katvusraport võrdleb mõisteid NIME järgi: „tasapeegel" kuulub moodulile
    // `peegeldumisseadus` ja „näiline kujutis" moodulile `tasapeegli-kujutis`.
    // Siin paistaks üks põhimõiste kaetuna kahest kohast
    // (sisu/MOODUL-peeglikiri.md „Ainekava seos").
    expect(manifest.concepts).toEqual(["peeglikiri"]);
    expect(manifest.practicalWork).toEqual([]);
    expect(manifest.outcomes).toEqual(["P1-T2"]);
    expect(manifest.id).toBe("physics.peeglikiri");
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
    expect(figures).toEqual(["pk-kiirabiauto", "pk-tahtede-summeetria"]);
  });

  it("explore't ei lukusta ükski lisavõimalus", () => {
    // Ekraanil on üks liugur ja üks nupurida – midagi ei ole hiljem avada.
    const explore = activities.steps.find((step) => step.type === "explore");
    expect(explore?.type).toBe("explore");
    if (explore?.type !== "explore") return;
    expect(explore.simulation).toBeUndefined();
  });

  it("õpilase pool ei ületa mooduli piire", () => {
    // sisu/MOODUL-peeglikiri.md „Piirid": väiketähed ja teistsugused tähekujud
    // jäävad välja, teleprompteri seadme optikat ei joonistata,
    // peegeldumisseaduse mõisted kuuluvad teistele moodulitele. Kõik need on
    // õpetajajuhendis olemas, aga õpilase ekraanile nad ei jõua.
    const all = studentTexts().join(" ").toLowerCase();
    for (const forbidden of [
      "väiketäht",
      "kaldkiri",
      "käsikiri",
      "kirjatüüp",
      "prisma",
      "periskoop",
      "mattpind",
      "näiline",
      "langemisnurk",
    ]) {
      expect(all, forbidden).not.toContain(forbidden);
    }
  });

  it("iga arvküsimus on ühikuta täisarv täpse tolerantsiga", () => {
    // Tähe koht sõnas ja tähtede arv on ühikuta (sisu/MOODUL-peeglikiri.md
    // „Füüsika"). ±0,5 tähendab „täpselt see täisarv" – moodulileping ei luba
    // tolerantsi 0.
    const seen: string[] = [];
    for (const step of activities.steps) {
      for (const question of stepQuestions(step)) {
        if (question.kind !== "numeric") continue;
        seen.push(question.id);
        expect(question.unit, question.id).toBeUndefined();
        expect(question.tolerance, question.id).toEqual({
          mode: "absolute",
          value: 0.5,
        });
        expect(Number.isInteger(question.answer), question.id).toBe(true);
      }
    }
    expect(seen).toEqual(["explore-2", "practice-1", "practice-2", "exit-2"]);
  });

  it("kaugusest ei küsi ükski arvküsimus – liugur näitab, et ta EI muuda midagi", () => {
    // Kauguse arvutamine on mooduli `tasapeegli-kujutis` oma; siin on liugur
    // selleks, et tähtede järjekord ja kuju jääksid tema all paigale
    // (explore-4 on seepärast valikküsimus).
    const explore = activities.steps.find((step) => step.type === "explore");
    if (explore?.type !== "explore") throw new Error("explore-sammu ei ole");
    expect(
      explore.questions.find((question) => question.id === "explore-4")?.kind,
    ).toBe("choice");
  });
});

/**
 * Ülesannete vastused vs. mudel.
 *
 * `activities.ts` võtab iga tähe koha MUDELIST (CLAUDE.md reegel 1), seega
 * näpuviga tehtes siin välja ei paistaks – küll aga paistab välja vale sõna,
 * vale koht sõnas või vale tolerants. Seepärast on ootus kirjutatud
 * SPETSIFIKATSIOONI järgi (sisu/MOODUL-peeglikiri.md „Sammud"), mitte
 * activities.ts-ist tagurpidi tuletatud.
 */
describe("ülesannete vastused käivad spetsifikatsiooniga kokku", () => {
  it("explore-2: sõnas TAKSO on kolm peeglis muutumatut tähte", () => {
    expect(numericQuestion("explore-2").answer).toBe(3);
  });

  it("practice-1: KIIRABI (7 tähte) viimane täht peeglis tuleb paberil kohalt 0", () => {
    expect(numericQuestion("practice-1").answer).toBe(mirrorLetterIndex(6, 7));
    expect(numericQuestion("practice-1").answer).toBe(0);
  });

  it("practice-2: PEEGEL (6 tähte) koht 2 peeglis tuleb paberil kohalt 3", () => {
    expect(numericQuestion("practice-2").answer).toBe(mirrorLetterIndex(2, 6));
    expect(numericQuestion("practice-2").answer).toBe(3);
  });

  it("exit-2: AUTO (4 tähte) koht 1 tuleb paberil kohalt 2", () => {
    expect(numericQuestion("exit-2").answer).toBe(mirrorLetterIndex(1, 4));
    expect(numericQuestion("exit-2").answer).toBe(2);
  });

  it("lahendatud näidis lõpeb kohaga 3 (AUTO, koht 0 peeglis)", () => {
    const practice = activities.steps.find((step) => step.type === "practice");
    if (practice?.type !== "practice") throw new Error("practice-sammu ei ole");
    expect(mirrorLetterIndex(0, 4)).toBe(3);
    expect(practice.worked?.prompt).toContain("AUTO");
    expect(practice.worked?.answer).toContain("3");
  });

  it("predict-1 õige vastus on „samal pool” ja mõlemad valed on nimetatud", () => {
    const question = choiceQuestion("predict-1");
    const correct = question.options.filter((option) => option.correct);
    expect(correct).toHaveLength(1);
    expect(correct[0].id).toBe("samal-pool");
    expect(
      question.options
        .filter((option) => !option.correct)
        .map((option) => option.misconception),
    ).toEqual(["peegel-vahetab-vasaku-parema", "peegel-poorab-90-kraadi"]);
  });

  it("explore-1 õige vastus on tähed vastupidises järjekorras", () => {
    // Sõna „OSKAT" ei tohi olla käsitsi kirjutatud: ta pannakse kokku
    // display.ts-is, mis küsib iga tähe koha mudelilt.
    const correct = choiceQuestion("explore-1").options.find(
      (option) => option.correct,
    );
    expect(correct?.text).toContain("O, S, K, A, T");
    expect(mirrorWordText("TAKSO")).toBe("OSKAT");
  });

  it("explore-3: TAAT on peeglis samasugune, mõlemad valed kannavad silti", () => {
    const question = choiceQuestion("explore-3");
    const correct = question.options.filter((option) => option.correct);
    expect(correct).toHaveLength(1);
    expect(correct[0].id).toBe("jah");
    // Kaks tingimust korraga: palindroom JA kõik tähed sümmeetrilised.
    expect(mirrorWordText("TAAT")).toBe("TAAT");
    for (const letter of ["T", "A"]) {
      expect(isVerticallySymmetricLetter(letter), letter).toBe(true);
    }
    expect(
      question.options
        .filter((option) => !option.correct)
        .map((option) => option.misconception),
    ).toEqual(["jarjekord-ei-poordu", "t-ei-ole-summeetriline"]);
  });

  it("explore-4: kaugus ei muuda järjekorda ja vale variant kannab silti", () => {
    const question = choiceQuestion("explore-4");
    expect(question.options.find((option) => option.correct)?.id).toBe("ei-muutu");
    expect(
      question.options.find((option) => !option.correct)?.misconception,
    ).toBe("kaugus-muudab-jarjekorda");
  });

  it("practice-3: kolm sümmeetrilist tähte on õiged, kolm muutuvat valed", () => {
    const question = choiceQuestion("practice-3");
    expect(question.multiple).toBe(true);
    expect(question.shuffle).toBe(true);
    // Õigsuse otsustab MUDEL, mitte activities.ts – seepärast kontrollime seda
    // tähehaaval, mitte id-loendiga.
    for (const option of question.options) {
      expect(option.correct, option.text).toBe(
        isVerticallySymmetricLetter(option.text),
      );
      if (!option.correct) {
        expect(option.misconception, option.text).toBe(
          "koik-tahed-tunduvad-summeetrilised",
        );
      }
    }
    expect(question.options.filter((option) => option.correct)).toHaveLength(3);
    expect(question.options.filter((option) => !option.correct)).toHaveLength(3);
  });

  it("practice-4 ülekanne osutab klaasilt peegeldumisele, mitte trikile", () => {
    const correct = choiceQuestion("practice-4").options.find(
      (option) => option.correct,
    );
    expect(correct?.id).toBe("peegeldub-klaasilt");
  });

  it("exit-1 vale variant „sõltub kaugusest” on meelega sildita", () => {
    // `kaugus-muudab-jarjekorda` käib tähtede JÄRJEKORRA, mitte käe poole
    // kohta – vale sildi all jõuaks õpetaja koondvaatesse väärarusaam, mida
    // õpilasel ei olnud (sama joon mis moodulis `lambivalik`).
    const option = choiceQuestion("exit-1").options.find(
      (item) => item.id === "soltub-kaugusest",
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

  it("spetsifikatsiooni kuus väärarusaama on kõik olemas", () => {
    for (const id of [
      "peegel-vahetab-vasaku-parema",
      "peegel-poorab-90-kraadi",
      "jarjekord-ei-poordu",
      "t-ei-ole-summeetriline",
      "kaugus-muudab-jarjekorda",
      "koik-tahed-tunduvad-summeetrilised",
    ]) {
      expect(known, id).toContain(id);
    }
  });

  it("ohutus räägib klaasist peeglist ja purunenud tükkidest", () => {
    expect(teacher.safety).toContain("klaas");
    expect(teacher.safety).toContain("tükke");
    expect(teacher.safety).toContain("silma");
  });

  it("kujutise kaugus ja peegeldumisseadus jäävad teistele moodulitele", () => {
    // Kui see moodul teeks nende tööd ära, saaks õpilane sama asja kaks korda
    // (sisu/MOODUL-peeglikiri.md „Piirid").
    expect(teacher.notInThisModule).toContain("Tasapeegli kujutis");
    expect(teacher.notInThisModule).toContain("Peegeldumisseadus");
  });

  it("õpetaja saab teada, miks päris kiri mudelist erineb", () => {
    // model.ts idealiseeringud 1, 2 ja 4 – UI ei tohi neid päris füüsikana
    // esitada.
    expect(teacher.whyRealDiffers).toContain("kapott");
    expect(teacher.whyRealDiffers).toContain("trükitähestikus");
  });

  it("peeglikirja katse annab õpilasele töötava strateegia", () => {
    // Ainekava õpilase tegevus on „korraldab katsed" – katse peab klassis
    // päriselt õnnestuma, mitte jääma katse-eksituse meetodiks.
    const activity = teacher.mirrorWritingActivity.join(" ");
    expect(activity).toContain("VALGUSE POOLT LÄBI");
    expect(activity).toContain("käsipeegliga");
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
