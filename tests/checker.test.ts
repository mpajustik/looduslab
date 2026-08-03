import { describe, expect, it } from "vitest";
import { checkAnswer, questionCheckers } from "../src/checker";
import type { Question } from "../src/engine/contract";
import { questionSchema } from "../src/engine/contractSchema";

/**
 * Checkeri sissepääs: õige küsimuseliik jõuab õige checkerini ja ükski liik
 * ei jää ilma checkerita (docs/MOODULILEPING.md – küsimusetüüpe ainult
 * lisatakse registrisse).
 */

const numericQuestion: Question = {
  kind: "numeric",
  id: "practice-1",
  prompt: "Peegeldumisnurk?",
  answer: 55,
  unit: "°",
  tolerance: { mode: "absolute", value: 0.5 },
};

const choiceQuestion: Question = {
  kind: "choice",
  id: "practice-2",
  prompt: "Millise joone suhtes?",
  options: [
    { id: "normaal", text: "Normaali suhtes", correct: true },
    { id: "pind", text: "Pinna suhtes", correct: false },
  ],
};

const textQuestion: Question = {
  kind: "text",
  id: "explain-1",
  prompt: "Sõnasta seaduspärasus oma sõnadega.",
  minWords: 15,
};

describe("checkAnswer – register katab kõik küsimuseliigid", () => {
  it("igal skeemi küsimuseliigil on checker", () => {
    // Tõe allikas on skeem: uus liik contractSchema.ts-is ilma checkerita
    // kukutaks selle testi, mitte ei jätaks vastust vaikselt kontrollimata.
    const kindsInSchema = questionSchema.options.map((option) => option.shape.kind.value);
    expect(Object.keys(questionCheckers).sort()).toEqual([...kindsInSchema].sort());
  });
});

describe("checkAnswer – suunab õigesse checkerisse", () => {
  it("arvvastus käib läbi arvchecker'i (ühikuteisendus töötab)", () => {
    expect(checkAnswer(numericQuestion, { kind: "numeric", raw: "55" }).correct).toBe(true);
    expect(checkAnswer(numericQuestion, { kind: "numeric", raw: "35" }).correct).toBe(false);
  });

  it("valikvastus käib läbi valikuchecker'i", () => {
    expect(
      checkAnswer(choiceQuestion, { kind: "choice", optionIds: ["normaal"] }).correct,
    ).toBe(true);
  });

  it("vabateksti ei hinnata kunagi (is_correct jääb null-iks)", () => {
    const result = checkAnswer(textQuestion, { kind: "text", text: "Nurgad on võrdsed." });
    expect(result.correct).toBeNull();
  });
});

describe("checkAnswer – vastus ja küsimus ei käi kokku", () => {
  it("vale liiki vastust ei loeta valeks, vaid jäetakse hindamata", () => {
    // See on meie, mitte õpilase viga (katkine moodul või vana vastus) –
    // `false` tähendaks, et ta sai punase risti asja eest, mida ta ei teinud.
    const result = checkAnswer(numericQuestion, { kind: "choice", optionIds: ["normaal"] });
    expect(result.correct).toBeNull();
  });
});
