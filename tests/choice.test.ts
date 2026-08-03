import { describe, expect, it } from "vitest";
import { checkChoiceAnswer } from "../src/checker/choice";
import type { ChoiceQuestion } from "../src/engine/contract";

/**
 * Valikvastuse checker: üks õige, mitu õiget, väärarusaama silt vale valiku
 * küljes (CLAUDE.md reegel 3 – vaade ei otsusta ise).
 */

const singleQuestion: ChoiceQuestion = {
  kind: "choice",
  id: "precheck-1",
  prompt: "Millise joone suhtes mõõdetakse langemisnurka?",
  options: [
    { id: "pind", text: "Peegli pinna suhtes", correct: false, misconception: "nurk-pinna-suhtes" },
    { id: "normaal", text: "Normaali suhtes", correct: true },
    { id: "kiir", text: "Peegeldunud kiire suhtes", correct: false },
  ],
};

const multipleQuestion: ChoiceQuestion = {
  kind: "choice",
  id: "practice-1",
  prompt: "Millised väited on õiged?",
  multiple: true,
  options: [
    { id: "sile", text: "Sile pind peegeldab korrapäraselt", correct: true },
    { id: "matt", text: "Kare pind hajutab kiired", correct: true },
    {
      id: "ainult-peegel",
      text: "Ainult läikivad esemed peegeldavad",
      correct: false,
      misconception: "ainult-peegel-peegeldab",
    },
  ],
};

describe("checkChoiceAnswer – üks õige vastus", () => {
  it("õige variant on õige", () => {
    const result = checkChoiceAnswer(singleQuestion, ["normaal"]);
    expect(result.correct).toBe(true);
  });

  it("vale variant on vale", () => {
    const result = checkChoiceAnswer(singleQuestion, ["kiir"]);
    expect(result.correct).toBe(false);
  });

  it("sildiga vale variant annab väärarusaama sildi", () => {
    const result = checkChoiceAnswer(singleQuestion, ["pind"]);
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe("nurk-pinna-suhtes");
  });

  it("sildita vale variant ei saa silti juurde", () => {
    expect(checkChoiceAnswer(singleQuestion, ["kiir"]).misconception).toBeUndefined();
  });

  it("kaks valikut ühe õige küsimusel ei lähe läbi, ka siis kui õige on nende seas", () => {
    const result = checkChoiceAnswer(singleQuestion, ["normaal", "pind"]);
    expect(result.correct).toBe(false);
  });
});

describe("checkChoiceAnswer – mitu õiget vastust", () => {
  it("täpselt õigete hulk on õige", () => {
    expect(checkChoiceAnswer(multipleQuestion, ["sile", "matt"]).correct).toBe(true);
  });

  it("järjekord ei loe", () => {
    expect(checkChoiceAnswer(multipleQuestion, ["matt", "sile"]).correct).toBe(true);
  });

  it("sama variant kaks korda ei riku õiget vastust", () => {
    expect(checkChoiceAnswer(multipleQuestion, ["sile", "sile", "matt"]).correct).toBe(true);
  });

  it("osaline valik ei ole õige ja tagasiside ütleb, mis puudu on", () => {
    const result = checkChoiceAnswer(multipleQuestion, ["sile"]);
    expect(result.correct).toBe(false);
    expect(result.feedback).toContain("valitud");
  });

  it("õiged + üks vale on vale ja annab vale variandi sildi", () => {
    const result = checkChoiceAnswer(multipleQuestion, ["sile", "matt", "ainult-peegel"]);
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe("ainult-peegel-peegeldab");
  });
});

describe("checkChoiceAnswer – katkised sisendid", () => {
  it("tühja valikut ei loeta õigeks", () => {
    expect(checkChoiceAnswer(singleQuestion, []).correct).toBe(false);
  });

  it("tundmatut varianti ei hinnata (correct: null), mitte ei jäeta vaikselt kõrvale", () => {
    // Kui prügi kõrvale jätta, muutuks „õige + tundmatu" õigeks vastuseks.
    expect(checkChoiceAnswer(multipleQuestion, ["sile", "matt", "puudub"]).correct).toBeNull();
    expect(checkChoiceAnswer(singleQuestion, ["puudub"]).correct).toBeNull();
  });
});
