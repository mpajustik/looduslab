import { useState } from "react";
import type { AnswerPayload, TableRow } from "../../engine/answers";
import type { TableQuestion } from "../../engine/contract";
import { Button } from "../Button";

/**
 * Mõõtetabel: õpilane loeb simulatsioonilt väärtused ja tipib need ridadena.
 *
 * Siin ei parsita ega hinnata MIDAGI – tipitud tekst läheb muutmata kujul
 * `AnswerPayload.table.rows` sisse ja koma, ühiku ning tolerantsi lugemine on
 * checkeri töö (CLAUDE.md reegel 3, src/checker/table.ts).
 *
 * Nupp on lukus, kuni kõik lahtrid on täidetud. See on VORMI, mitte õigsuse
 * kontroll: „kas midagi on kirjas" otsustab vorm, „kas see klapib" otsustab
 * checker. Sama piir on NumericInputil.
 *
 * Väljad on `type="text"` + `inputMode="decimal"`, mitte `type="number"`:
 * number-väli keeldub Eesti komast ja kerimine muudaks väärtust kogemata.
 */
export function TableInput({
  question,
  answer,
  onAnswer,
  labelledBy,
}: {
  question: TableQuestion;
  /** Esitatud vastus või `undefined`, kui õpilane pole veel vastanud. */
  answer: AnswerPayload | undefined;
  onAnswer: (payload: AnswerPayload) => void;
  /** Küsimuse teksti id – tabel viitab sellele oma nimena. */
  labelledBy: string;
}) {
  const [draft, setDraft] = useState<TableRow[]>(() =>
    Array.from({ length: question.rows }, () => ({})),
  );

  // Vale kujuga vastus tähendab katkist moodulit (küsimus table, vastus
  // numeric) – siis käitume nii, nagu vastust ei oleks.
  const submitted = answer?.kind === "table" ? answer.rows : undefined;
  const rows = submitted ?? draft;

  const complete = draft.every((row) =>
    question.columns.every((column) => (row[column.key] ?? "").trim() !== ""),
  );

  const setCell = (rowIndex: number, key: string, value: string) => {
    setDraft((current) =>
      current.map((row, index) => (index === rowIndex ? { ...row, [key]: value } : row)),
    );
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        // Esitatud tabelit ei saa uuesti esitada – sama reegel mis mujal:
        // esitatud vastust ei muudeta.
        if (submitted || !complete) return;
        onAnswer({ kind: "table", rows: draft });
      }}
      className="flex flex-col gap-4"
    >
      {/* Kitsal ekraanil kerib tabel ise, mitte kogu leht (mobile-first).
          Laiust piirab `max-w-md`: telefonis täidab ta ekraani, töölaual ei
          veni kaks veergu üle poole ekraani laiuseks – siis oleks arv oma
          pealkirjast kaugel ja tabelit ei loeks enam reana. */}
      <div className="-mx-1 max-w-md overflow-x-auto px-1">
        <table aria-labelledby={labelledBy} className="w-full border-collapse text-lg">
          <thead>
            <tr>
              {/* Reanumbri veerul ei ole pealkirja – ta on ainult silt. */}
              <th scope="col" className="w-8">
                <span className="sr-only">Mõõtmine</span>
              </th>
              {question.columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-2 pb-2 text-center text-base font-semibold text-ink"
                >
                  {column.label}
                  {column.unit ? (
                    <span className="font-normal text-ink-soft"> ({column.unit})</span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              // Rea järjekord on tabelis püsiv (ridade arv tuleb küsimusest ja
              // ei muutu), seega on indeks siin stabiilne võti.
              <tr key={rowIndex}>
                <th
                  scope="row"
                  className="pr-1 text-right text-base font-normal text-ink-soft"
                >
                  {rowIndex + 1}.
                </th>
                {question.columns.map((column) => {
                  const value = row[column.key] ?? "";
                  return (
                    <td key={column.key} className="px-1 py-1">
                      {submitted ? (
                        // Sama joondus mis sisestusväljal – muidu hüppaks arv
                        // esitamise hetkel oma kohalt ära.
                        <p className="min-h-11 px-2 py-2 text-center font-semibold text-ink">
                          {value}
                        </p>
                      ) : (
                        <input
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          value={value}
                          onChange={(event) => setCell(rowIndex, column.key, event.target.value)}
                          // Ekraanilugeja ütleb lahtri juures, mis rida ja mis
                          // veerg – ilma selleta oleks see lihtsalt „tekstiväli".
                          aria-label={`${rowIndex + 1}. mõõtmine, ${column.label}`}
                          className="min-h-11 w-full min-w-16 rounded-lg border border-line bg-white px-2 text-center text-lg text-ink"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {submitted ? null : (
        <div>
          <Button type="submit" disabled={!complete}>
            Esita tabel
          </Button>
        </div>
      )}
    </form>
  );
}
