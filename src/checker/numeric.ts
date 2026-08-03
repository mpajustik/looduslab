import type { NumericQuestion } from "../engine/contract";

/**
 * Arvvastuse kontroll (CLAUDE.md reegel 3: õigsust ei otsusta kunagi vaade).
 *
 * `raw` on õpilase tipitud tekst muutmata kujul (src/engine/answers.ts
 * `AnswerPayload.numeric.raw`) – koma/punkti lugemine ja ühikuteisendus
 * käivad SIIN, mitte vaates.
 */
export type NumericCheckResult = {
  correct: boolean;
  feedback: string;
  /** Ainult siis, kui vastus tabas teadaolevat lõksu (question.traps). */
  misconception?: string;
};

/**
 * Toetatud ühikuperekonnad – iga kirje kaardistab ühiku kordajaks baasühikuni.
 * Uue perekonna (nt kg/g) lisamine on üks rida siia, midagi muud ei muutu.
 */
const UNIT_FAMILIES: readonly Readonly<Record<string, number>>[] = [
  { mm: 0.001, cm: 0.01, m: 1 }, // baasühik: m
  { Pa: 1, kPa: 1000 }, // baasühik: Pa
];

/**
 * "2,5 m" → { value: 2.5, unit: "m" }. Number tuleb alati enne ühikut ja
 * lubab ühte eraldajat (koma VÕI punkt) – regex ei mahuta kahte, seega
 * "2,5,6" ja "1.234,5" lükatakse iseenesest tagasi ilma lisakontrollita.
 */
const NUMBER_UNIT = /^([+-]?\d+(?:[.,]\d+)?)\s*([^\d\s]*)$/;

function parseRaw(raw: string): { value: number; unit: string } | undefined {
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  const match = NUMBER_UNIT.exec(trimmed);
  if (!match) return undefined;
  const [, numberPart, unitPart] = match;
  const value = Number(numberPart.replace(",", "."));
  if (!Number.isFinite(value)) return undefined;
  return { value, unit: unitPart };
}

/**
 * Leiab ühiku perekonnast tähesuurust eirates – nutitelefoni klaviatuur
 * suurtähestab esimese tähe iseenesest ("Cm"), see ei tohi õpilast lukku jätta.
 */
function findUnitKey(family: Readonly<Record<string, number>>, unit: string): string | undefined {
  const lower = unit.toLowerCase();
  return Object.keys(family).find((key) => key.toLowerCase() === lower);
}

/** Teisendab `fromUnit`-ist `toUnit`-isse. `undefined`, kui ühikud kokku ei sobi. */
function convert(value: number, fromUnit: string, toUnit: string): number | undefined {
  if (fromUnit.toLowerCase() === toUnit.toLowerCase()) return value;
  const family = UNIT_FAMILIES.find(
    (candidate) => findUnitKey(candidate, fromUnit) && findUnitKey(candidate, toUnit),
  );
  if (!family) return undefined;
  const fromKey = findUnitKey(family, fromUnit);
  const toKey = findUnitKey(family, toUnit);
  if (!fromKey || !toKey) return undefined;
  return (value * family[fromKey]) / family[toKey];
}

function maxDelta(question: NumericQuestion): number {
  return question.tolerance.mode === "percent"
    ? Math.abs(question.answer) * (question.tolerance.value / 100)
    : question.tolerance.value;
}

/**
 * Kas `actual` on `expected`-ist `tolerance` võrra (v.a ujukoma-ümardus).
 * Ümardusvaru skaleerub võrreldavate suurustega, mitte fikseeritud
 * konstandiga – muidu lubaks liiga suur konstant läbi vastuse, mis on
 * tegelikult nulltolerantsist väljas (nt 1 vs 1,0000000005).
 */
function withinTolerance(actual: number, expected: number, tolerance: number): boolean {
  const roundingAllowance = Number.EPSILON * 8 * Math.max(1, Math.abs(actual), Math.abs(expected));
  return Math.abs(actual - expected) <= tolerance + roundingAllowance;
}

/**
 * Kui õpilane ei kirjuta ühikut ("90"), eeldame küsimuse enda ühikut –
 * enamik vastuseid tuleb ilma ühikuta ja lukustaks muidu asjatult kinni.
 */
function resolveGivenUnit(givenUnit: string, expectedUnit: string): string {
  return givenUnit === "" ? expectedUnit : givenUnit;
}

export function checkNumericAnswer(question: NumericQuestion, raw: string): NumericCheckResult {
  const parsed = parseRaw(raw);
  if (!parsed) {
    return { correct: false, feedback: 'Ei tundnud vastust arvuna ära. Kirjuta nt "2,5".' };
  }

  const expectedUnit = question.unit ?? "";
  const givenUnit = resolveGivenUnit(parsed.unit, expectedUnit);
  const converted = convert(parsed.value, givenUnit, expectedUnit);
  if (converted === undefined) {
    return {
      correct: false,
      feedback: expectedUnit
        ? `See ühik ei sobi. Vasta ühikus ${expectedUnit}.`
        : "See küsimus ei vaja ühikut.",
    };
  }

  const delta = maxDelta(question);
  if (withinTolerance(converted, question.answer, delta)) {
    return { correct: true, feedback: "Õige!" };
  }

  const trap = question.traps?.find((candidate) =>
    withinTolerance(converted, candidate.answer, delta),
  );
  if (trap) {
    return { correct: false, feedback: trap.feedback, misconception: trap.misconception };
  }

  return { correct: false, feedback: "Vastus ei ole õige. Proovi uuesti." };
}
