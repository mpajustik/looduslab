import { describe, expect, it } from "vitest";
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
