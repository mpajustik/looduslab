import type { TableRow } from "../engine/answers";
import type { TableQuestion } from "../engine/contract";
import { maxDelta, parseRaw, readNumber, withinTolerance } from "./number";
import type { CheckResult } from "./types";

/**
 * Mõõtetabeli kontroll (sisu/MOODUL-peegeldumisseadus.md „collect").
 *
 * Kolm nõuet, selles järjekorras: read on täidetud ja loetavad → valitud
 * väärtused on erinevad → iga rida käib reegliga kokku. Esimene katkine asi
 * peatab kontrolli: kaks korraga antud etteheidet ei aita kedagi.
 *
 * **Siin ei ole füüsikat.** Checker teab ainult, et üks veerg peab teisega
 * kokku käima – MIKS (peegeldumisseadus) teab `model.ts` (CLAUDE.md reegel 1).
 * Seost hoiab kooskõlas test, mitte import.
 *
 * Tolerants on LUGEMISTOLERANTS, mitte mõõtmisviga: simulatsioon on ideaalne,
 * aga õpilane loeb liugurilt ja tipib käsitsi.
 *
 * Tagasiside ei anna kunagi ära seaduspärasust ennast – just selle sõnastamine
 * on järgmise sammu (explain) töö.
 */

/**
 * Üks rida arvudeks. `string` = viga õpilase keeles, `Map` = korras rida.
 * Ridade nummerdus algab õpilase jaoks ühest, mitte nullist.
 */
function readRow(
  row: TableRow | undefined,
  columns: TableQuestion["columns"],
  rowNumber: number,
): Map<string, number> | string {
  const values = new Map<string, number>();
  for (const column of columns) {
    const unit = column.unit ?? "";
    const raw = row?.[column.key] ?? "";
    if (raw.trim() === "") return "Tabelis on veel täitmata lahtreid.";
    if (!parseRaw(raw)) {
      return `${rowNumber}. reas on väärtus, mida ei tundnud arvuna ära.`;
    }
    const value = readNumber(raw, unit);
    if (value === undefined) {
      return `${rowNumber}. reas ei sobi ühik – oodatud ühik on ${unit}.`;
    }
    // Vahemikust väljas väärtus ei saa simulatsioonist tulla. Ilma selleta
    // läbiks kontrolli iga kaks võrdset arvu – ka „10000 ja 10000" (Codexi
    // ülevaatuse leid 2026-08-03). Lause ei ütle, MIS vahemik see on: piirid
    // on liuguril näha ja õige arvu me ette ei ütle.
    if (
      (column.min !== undefined && value < column.min) ||
      (column.max !== undefined && value > column.max)
    ) {
      return `${rowNumber}. reas on väärtus, mida simulatsioonilt lugeda ei saa.`;
    }
    values.set(column.key, value);
  }
  return values;
}

export function checkTableAnswer(question: TableQuestion, rows: TableRow[]): CheckResult {
  // Ridade arvu hoiab tavaliselt juba vorm – see on kaitseklapp vana või
  // käsitsi muudetud vastuse vastu.
  if (rows.length !== question.rows) {
    return { correct: false, feedback: "Tabelis ei ole nõutud arv ridu." };
  }

  const parsedRows: Map<string, number>[] = [];
  for (const [index, row] of rows.entries()) {
    const parsed = readRow(row, question.columns, index + 1);
    if (typeof parsed === "string") return { correct: false, feedback: parsed };
    parsedRows.push(parsed);
  }

  const { rule } = question;

  if (question.distinctColumn) {
    const key = question.distinctColumn;
    const label =
      question.columns.find((column) => column.key === key)?.label ?? key;
    const values = parsedRows.map((row) => row.get(key) ?? Number.NaN);
    // „Erinev" tähendab siin: lugemistolerantsi juures ERISTATAV. Kaks
    // väärtust, mis mahuvad sama tolerantsi sisse, ei ole kaks mõõtmist –
    // muidu läheks 30 ja 30,2 kolme eri nurga arvestusse. Tolerants tuleb
    // võrreldava väärtuse pealt, sest protsenttolerants sõltub suurusest.
    const repeated = values.some((value, index) =>
      values.some(
        (other, otherIndex) =>
          otherIndex > index &&
          withinTolerance(value, other, maxDelta(other, rule.tolerance)),
      ),
    );
    if (repeated) {
      return {
        correct: false,
        feedback: `Veerus „${label}" on sama väärtus mitu korda – ühest ja samast mõõtmisest seaduspärasus välja ei paista.`,
      };
    }
  }

  for (const [index, row] of parsedRows.entries()) {
    const actual = row.get(rule.column);
    const expected = row.get(rule.equalsColumn);
    // Mõlemad on olemas: skeem valvab, et reegel osutab olemasolevale veerule,
    // ja readRow luges iga veeru ära.
    if (actual === undefined || expected === undefined) continue;
    if (!withinTolerance(actual, expected, maxDelta(expected, rule.tolerance))) {
      return {
        correct: false,
        feedback: `${index + 1}. rida ei klapi simulatsiooniga.`,
      };
    }
  }

  return { correct: true, feedback: "Mõõtmised on kirjas ja klapivad simulatsiooniga." };
}
