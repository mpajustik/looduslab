/**
 * Õpilase tipitud arvu lugemine: koma, ühik, tolerants.
 *
 * Eraldi failis, sest seda vajab kaks checkerit: `numeric.ts` (üks vastus) ja
 * `table.ts` (mõõtetabeli lahtrid). Kui koma lugemine oleks kahes kohas, läheks
 * ta ühel päeval lahku – ja siis loeks tabel „2,5" teisiti kui vastusekast.
 *
 * Siin ei otsustata, kas vastus on ÕIGE – siin loetakse ainult, mis õpilane
 * kirjutas. Otsuse teeb kutsuv checker (CLAUDE.md reegel 3).
 */

import { NBSP, formatNumber } from "../lib/format";

/** Lubatud viga: kas protsent oodatud vastusest või absoluutne samas ühikus. */
export type Tolerance = { mode: "percent" | "absolute"; value: number };

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

export function parseRaw(raw: string): { value: number; unit: string } | undefined {
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
export function convert(value: number, fromUnit: string, toUnit: string): number | undefined {
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

/**
 * Kui õpilane ei kirjuta ühikut ("90"), eeldame oodatud ühikut – enamik
 * vastuseid tuleb ilma ühikuta ja lukustaks muidu asjatult kinni.
 */
export function resolveGivenUnit(givenUnit: string, expectedUnit: string): string {
  return givenUnit === "" ? expectedUnit : givenUnit;
}

/**
 * Tipitud tekst → arv oodatud ühikus. `undefined`, kui teksti ei saa arvuna
 * lugeda VÕI kui ühik ei kuulu oodatud ühikuga samasse perekonda.
 */
export function readNumber(raw: string, expectedUnit: string): number | undefined {
  const parsed = parseRaw(raw);
  if (!parsed) return undefined;
  return convert(parsed.value, resolveGivenUnit(parsed.unit, expectedUnit), expectedUnit);
}

/**
 * Ühikud, mis kirjutatakse arvu külge kinni: „30°", „40 %" oleks vale, aga
 * „12 cm" on õige. Sama kokkulepe kehtib liuguritel (src/ui/SliderField.tsx).
 */
const TIGHT_UNITS = new Set(["°", "%"]);

/**
 * Kümnendkohtade ülempiir. `toFixed` lubaks sada, aga nii pika arvu taga ei
 * ole enam ühtegi päris füüsikaülesannet – see on kaitseklapp, mitte valik.
 */
const MAX_DECIMALS = 20;

/**
 * Mitu kümnendkohta näidata, et NÄIDATUD arv oleks checkeri enda mõõdupuu
 * järgi õige vastus.
 *
 * Mõõdupuu on küsimuse tolerants, mitte kokkulepitud „kaks kohta": kui õpilane
 * kirjutab järgmine kord täpselt selle, mis ekraanil seisab, PEAB checker
 * ütlema „Õige!". Kolme koha peale ümardamine seda ei taganud – vastus 1,23456
 * tolerantsiga 0,00001 jõudis ekraanile kujul „1,235", mille checker ise oleks
 * lugenud valeks, ja 0,0000005 kujul „0" (CodeRabbiti ja Codexi ühine leid
 * 2026-08-22). Ekraanilt maha kirjutatud vale vastus on hullem kui nähtav
 * krahh, sest keegi ei märka teda.
 *
 * `toPrecision(12)` lõikab enne ära ujukoma müra (0,1 + 0,2 =
 * 0,30000000000000004), mis muidu nõuaks kõiki 17 kohta.
 */
function decimalsFor(value: number, tolerance: Tolerance): number {
  const plain = Number(value.toPrecision(12));
  const delta = maxDelta(plain, tolerance);
  for (let decimals = 0; decimals < MAX_DECIMALS; decimals += 1) {
    const shown = Number(plain.toFixed(decimals));
    // Kaks nõuet korraga: näidatud arv mahub tolerantsi sisse JA nullist
    // erinevast vastusest ei ole saanud nulli (nulltolerants ei luba viimast
    // niikuinii, aga protsenttolerants lubaks).
    if (withinTolerance(shown, plain, delta) && (shown !== 0 || plain === 0)) {
      return decimals;
    }
  }
  return MAX_DECIMALS;
}

/**
 * Arv + ühik õpilase keeles: „42°", „2,5 kPa", „19 600 Pa".
 *
 * Vormindamine, mitte otsustamine – siin ei öelda, kas vastus on õige. Elab
 * siin, sest siin on juba kogu ühikutarkus (vt faili päist). Tolerants on
 * kaasas, sest tema otsustab, mitu kohta on vaja (vt `decimalsFor`).
 */
export function formatValue(value: number, unit: string, tolerance: Tolerance): string {
  const text = formatNumber(value, decimalsFor(value, tolerance));
  if (unit === "") return text;
  return TIGHT_UNITS.has(unit) ? `${text}${unit}` : `${text}${NBSP}${unit}`;
}

/** Lubatud hälve absoluutarvuna – protsent arvutatakse oodatud vastusest. */
export function maxDelta(expected: number, tolerance: Tolerance): number {
  return tolerance.mode === "percent"
    ? Math.abs(expected) * (tolerance.value / 100)
    : tolerance.value;
}

/**
 * Kas `actual` on `expected`-ist `tolerance` võrra (v.a ujukoma-ümardus).
 * Ümardusvaru skaleerub võrreldavate suurustega, mitte fikseeritud
 * konstandiga – muidu lubaks liiga suur konstant läbi vastuse, mis on
 * tegelikult nulltolerantsist väljas (nt 1 vs 1,0000000005).
 */
export function withinTolerance(actual: number, expected: number, tolerance: number): boolean {
  const roundingAllowance = Number.EPSILON * 8 * Math.max(1, Math.abs(actual), Math.abs(expected));
  return Math.abs(actual - expected) <= tolerance + roundingAllowance;
}
