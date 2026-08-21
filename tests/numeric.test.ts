import { describe, expect, it } from "vitest";
import { checkNumericAnswer } from "../src/checker/numeric";
import type { NumericQuestion } from "../src/engine/contract";

/** Sisemine tühik arvu ja ühiku vahel – sama, mida checker vastusesse paneb. */
const NBSP = " ";

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

describe("valimata variant", () => {
  /**
   * Variantidega küsimus, mis EI ole läbinud engine'i valikut
   * (src/engine/resolve.ts) – õiget vastust ei ole veel olemas.
   */
  const unresolved: NumericQuestion = {
    kind: "numeric",
    id: "practice-5",
    prompt: "Kiir moodustab pinnaga {pinnanurk}° nurga. Kui suur on nurk ristsirgest?",
    unit: "°",
    tolerance: { mode: "absolute", value: 0.5 },
    variants: [
      { id: "p35", values: { pinnanurk: 35 }, answer: 55 },
      { id: "p20", values: { pinnanurk: 20 }, answer: 70 },
    ],
  };

  it("ei hinda vastust, kui küsimusel ei ole õiget vastust", () => {
    // See on MEIE viga (küsimus jõudis checkerini poolikuna), mitte õpilase
    // oma – seega `null`, mitte `false`. Vale vastuse eest ei karistata
    // kedagi, kelle küsimus jäi meie käe läbi valimata.
    expect(checkNumericAnswer(unresolved, "55").correct).toBeNull();
    expect(checkNumericAnswer(unresolved, "70").correct).toBeNull();
  });
});

describe("checkNumericAnswer – õige vastus öeldakse vale vastuse juures välja", () => {
  it("kraad kirjutatakse arvu külge kinni", () => {
    expect(checkNumericAnswer(trapQuestion, "30").expected).toBe("Õige vastus: 70°.");
  });

  it("ühik tuleb arvust sisemise tühikuga lahku ja koma on eesti kombe järgi", () => {
    expect(checkNumericAnswer(lengthQuestion, "0,5 m").expected).toBe(`Õige vastus: 0,25${NBSP}m.`);
  });

  it("täisarvule ei teki tühje kümnendkohti", () => {
    expect(checkNumericAnswer(unitlessQuestion, "5").expected).toBe("Õige vastus: 3.");
  });

  it("lõksuvastus saab nii oma tagasiside kui ka õige vastuse", () => {
    const result = checkNumericAnswer(trapQuestion, "20");
    expect(result.misconception).toBe("nurk-pinna-suhtes");
    expect(result.expected).toBe("Õige vastus: 70°.");
  });

  it("vale ühik ei jäta õpilast õige vastuseta", () => {
    const result = checkNumericAnswer(pressureQuestion, "250 m");
    expect(result.correct).toBe(false);
    expect(result.expected).toBe(`Õige vastus: 250${NBSP}kPa.`);
  });

  it("arvuks mitteloetav vastus ei jäta õpilast õige vastuseta", () => {
    expect(checkNumericAnswer(unitlessQuestion, "ei tea").expected).toBe("Õige vastus: 3.");
  });

  it("õige vastuse juures õiget vastust üle ei korrata", () => {
    expect(checkNumericAnswer(unitlessQuestion, "3").expected).toBeUndefined();
  });
});

describe("checkNumericAnswer – õige vastus peab ka ise õige olema", () => {
  /**
   * Ekraanile jõudev arv on see, mille õpilane järgmine kord kirjutab. Kui
   * vormindus ümardab ta tolerantsist välja, õpetab rakendus vale vastust –
   * CodeRabbiti ja Codexi ühine leid 2026-08-22.
   */
  const preciseQuestion: NumericQuestion = {
    kind: "numeric",
    id: "practice-5",
    prompt: "Täpne vastus tiheda tolerantsiga",
    answer: 1.23456,
    tolerance: { mode: "absolute", value: 0.00001 },
  };

  const tinyQuestion: NumericQuestion = {
    kind: "numeric",
    id: "practice-6",
    prompt: "Väga väike vastus",
    answer: 5e-7,
    unit: "m",
    tolerance: { mode: "absolute", value: 1e-8 },
  };

  it("tihe tolerants ei lubanud vastust lühemaks ümardada", () => {
    expect(checkNumericAnswer(preciseQuestion, "1").expected).toBe("Õige vastus: 1,23456.");
  });

  it("nullist erinev vastus ei kuva kunagi nullina", () => {
    expect(checkNumericAnswer(tinyQuestion, "1").expected).toBe(
      `Õige vastus: 0,0000005${NBSP}m.`,
    );
  });

  it("ekraanilt maha kirjutatud vastuse loeb checker õigeks", () => {
    for (const question of [preciseQuestion, tinyQuestion, lengthQuestion, pressureQuestion, trapQuestion]) {
      const shown = checkNumericAnswer(question, "-1").expected ?? "";
      // "Õige vastus: 0,25 m." → "0,25 m"
      const raw = shown.replace("Õige vastus: ", "").replace(/\.$/, "");
      expect(checkNumericAnswer(question, raw).correct, `${question.id}: ${raw}`).toBe(true);
    }
  });
});
