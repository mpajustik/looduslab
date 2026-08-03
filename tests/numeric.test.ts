import { describe, expect, it } from "vitest";
import { checkNumericAnswer } from "../src/checker/numeric";
import type { NumericQuestion } from "../src/engine/contract";

/**
 * Checker peab lugema koma JA punkti, teisendama mm/cm/m ja Pa/kPa ning
 * tundma ära lõksuvastused (CLAUDE.md reegel 3 – vaade ei otsusta ise).
 */

const lengthQuestion: NumericQuestion = {
  kind: "numeric",
  id: "practice-1",
  prompt: "Kui kaugel on kujutis peeglist?",
  answer: 0.25,
  unit: "m",
  tolerance: { mode: "absolute", value: 0.01 },
};

const pressureQuestion: NumericQuestion = {
  kind: "numeric",
  id: "practice-2",
  prompt: "Kui suur on rõhk anuma põhjas?",
  answer: 250,
  unit: "kPa",
  tolerance: { mode: "percent", value: 5 },
};

const unitlessQuestion: NumericQuestion = {
  kind: "numeric",
  id: "practice-3",
  prompt: "Mitu korda suurenes jõud?",
  answer: 3,
  tolerance: { mode: "absolute", value: 0.1 },
};

const trapQuestion: NumericQuestion = {
  kind: "numeric",
  id: "practice-4",
  prompt: "Kui suur on langemisnurk, kui kiir langeb peegli pinnaga 20° nurga all?",
  answer: 70,
  unit: "°",
  tolerance: { mode: "absolute", value: 0.5 },
  traps: [
    {
      answer: 20,
      misconception: "nurk-pinna-suhtes",
      feedback: "Nurka mõõdetakse normaali, mitte peegli pinna suhtes.",
    },
  ],
};

describe("checkNumericAnswer – õiged vastused", () => {
  it("täpne vastus ilma ühikuta on õige", () => {
    expect(checkNumericAnswer(unitlessQuestion, "3").correct).toBe(true);
  });

  it("punkt-kujuline kümnendkoht sobib", () => {
    expect(checkNumericAnswer(lengthQuestion, "0.25 m").correct).toBe(true);
  });

  it("koma-kujuline kümnendkoht sobib", () => {
    expect(checkNumericAnswer(lengthQuestion, "0,25 m").correct).toBe(true);
  });

  it("ühikuta sisend eeldab küsimuse enda ühikut", () => {
    expect(checkNumericAnswer(lengthQuestion, "0,25").correct).toBe(true);
  });
});

describe("checkNumericAnswer – tolerants", () => {
  it("absoluutse tolerantsi piiril (täpselt delta peal) on veel õige", () => {
    expect(checkNumericAnswer(lengthQuestion, "0,26 m").correct).toBe(true);
  });

  it("absoluutsest tolerantsist üle on vale", () => {
    expect(checkNumericAnswer(lengthQuestion, "0,27 m").correct).toBe(false);
  });

  it("protsenditolerantsi piires on õige (5% 250-st = 12,5)", () => {
    const result = checkNumericAnswer(pressureQuestion, "260 kPa");
    expect(result.correct).toBe(true);
  });

  it("protsenditolerantsist üle on vale", () => {
    const result = checkNumericAnswer(pressureQuestion, "300 kPa");
    expect(result.correct).toBe(false);
  });
});

describe("checkNumericAnswer – ümardusvaru ei tohi tolerantsi lõdvendada", () => {
  it("nulltolerantsi korral ei loeta 1,0000000005 vastuseks 1", () => {
    const exactQuestion: NumericQuestion = {
      kind: "numeric",
      id: "practice-9",
      prompt: "x",
      answer: 1,
      tolerance: { mode: "absolute", value: 0 },
    };
    expect(checkNumericAnswer(exactQuestion, "1.0000000005").correct).toBe(false);
  });
});

describe("checkNumericAnswer – ühikuteisendus", () => {
  it("teisendab cm → m", () => {
    expect(checkNumericAnswer(lengthQuestion, "25 cm").correct).toBe(true);
  });

  it("teisendab mm → m", () => {
    expect(checkNumericAnswer(lengthQuestion, "250 mm").correct).toBe(true);
  });

  it("teisendab Pa → kPa", () => {
    expect(checkNumericAnswer(pressureQuestion, "250000 Pa").correct).toBe(true);
  });

  it("ühiku tähesuurus ei loe (nutitelefon suurtähestab esimese tähe)", () => {
    expect(checkNumericAnswer(lengthQuestion, "25 Cm").correct).toBe(true);
    expect(checkNumericAnswer(pressureQuestion, "250000 pa").correct).toBe(true);
  });

  it("tundmatu ühik annab vea, mitte vaikimisi õigeks lugemise", () => {
    const result = checkNumericAnswer(lengthQuestion, "25 kg");
    expect(result.correct).toBe(false);
    expect(result.feedback).toContain("m");
  });

  it("ühikuta küsimusele antud ühikuga vastus ei lähe läbi", () => {
    const result = checkNumericAnswer(unitlessQuestion, "3 N");
    expect(result.correct).toBe(false);
  });
});

describe("checkNumericAnswer – lõksud", () => {
  it("tunneb ära teadaoleva väärarusaama ja annab sildi", () => {
    const result = checkNumericAnswer(trapQuestion, "20");
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe("nurk-pinna-suhtes");
    expect(result.feedback).toContain("normaali");
  });

  it("tavaline vale vastus ei saa lõksu silti", () => {
    const result = checkNumericAnswer(trapQuestion, "45");
    expect(result.correct).toBe(false);
    expect(result.misconception).toBeUndefined();
  });
});

describe("checkNumericAnswer – tagasiside ei käsi teha võimatut", () => {
  /**
   * Esitatud vastust ei saa praegu muuta („Muuda vastust" tuleb sammus 1.6).
   * Seni ei tohi ükski lause öelda „proovi uuesti" ega „kirjuta" – õpilane
   * näeks käsku, mida ekraanil täita ei saa, ja arvaks, et rakendus on katki.
   * Kui 1.6 lisab vastuse muutmise, TOHIB selle testi kaotada – aga siis
   * teadlikult, mitte kogemata.
   */
  const forbidden = /uuesti|kirjuta|vasta ühikus/i;

  it("vale vastus ei kutsu uuesti proovima", () => {
    expect(checkNumericAnswer(lengthQuestion, "9 m").feedback).not.toMatch(forbidden);
  });

  it("arusaamatu sisend ei anna käsku, mida täita ei saa", () => {
    expect(checkNumericAnswer(lengthQuestion, "kakskümmend").feedback).not.toMatch(forbidden);
  });

  it("vale ühik ei anna käsku, mida täita ei saa, aga ütleb oodatud ühiku", () => {
    const result = checkNumericAnswer(lengthQuestion, "25 kg");
    expect(result.feedback).not.toMatch(forbidden);
    expect(result.feedback).toContain("m");
  });
});

describe("checkNumericAnswer – imelikud sisendid", () => {
  it("tühi string ei ole arv", () => {
    expect(checkNumericAnswer(lengthQuestion, "").correct).toBe(false);
  });

  it("ainult tühikud ei ole arv", () => {
    expect(checkNumericAnswer(lengthQuestion, "   ").correct).toBe(false);
  });

  it("sõna ei ole arv", () => {
    expect(checkNumericAnswer(lengthQuestion, "kakskümmend").correct).toBe(false);
  });

  it("kaks eraldajat korraga ei parsi", () => {
    expect(checkNumericAnswer(lengthQuestion, "2,5,6").correct).toBe(false);
  });

  it("ühik ilma numbrita ei parsi", () => {
    expect(checkNumericAnswer(lengthQuestion, "m").correct).toBe(false);
  });

  it("ühikuvahe tühikuta ('0,25m') parsib siiski", () => {
    expect(checkNumericAnswer(lengthQuestion, "0,25m").correct).toBe(true);
  });

  it("ümbritsevad tühikud ei sega", () => {
    expect(checkNumericAnswer(lengthQuestion, "   0,25   m   ").correct).toBe(true);
  });
});
