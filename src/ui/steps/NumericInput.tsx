import { useId } from "react";
import type { AnswerPayload } from "../../engine/answers";
import type { NumericQuestion } from "../../engine/contract";
import { Button } from "../Button";
import { useDraft } from "./drafts";

/**
 * Arvvastus: õpilane tipib arvu (soovi korral koos ühikuga).
 *
 * Siin ei parsita ega teisendata MIDAGI – tipitud tekst läheb muutmata kujul
 * `AnswerPayload.numeric.raw` sisse ja koma, punkti ning ühiku lugemine on
 * checkeri töö (CLAUDE.md reegel 3, src/checker/numeric.ts).
 *
 * Väli on `type="text"` + `inputMode="decimal"`, mitte `type="number"`:
 * number-väli keeldub Eesti komast ja kerimine muudaks vastust kogemata.
 */
export function NumericInput({
  question,
  answer,
  onAnswer,
  labelledBy,
}: {
  question: NumericQuestion;
  /** Esitatud vastus või `undefined`, kui õpilane pole veel vastanud. */
  answer: AnswerPayload | undefined;
  onAnswer: (payload: AnswerPayload) => void;
  /** Küsimuse teksti id – väli viitab sellele oma nimena. */
  labelledBy: string;
}) {
  // Tipitud arv elab mustandihoidlas – sammu vahetus ei tohi teda kaotada
  // (vt drafts.tsx).
  const [draft, setDraft] = useDraft(question.id, (saved) =>
    typeof saved === "string" ? saved : "",
  );
  const hintId = useId();

  // Vale kujuga vastus tähendab katkist moodulit (küsimus numeric, vastus
  // choice) – siis käitume nii, nagu vastust ei oleks.
  const submitted = answer?.kind === "numeric" ? answer.raw : undefined;

  if (submitted !== undefined) {
    return (
      <p className="text-lg text-ink">
        Sinu vastus: <strong className="font-semibold">{submitted}</strong>
      </p>
    );
  }

  return (
    <form
      // Vorm annab telefoniklaviatuuri „mine"-nupule tähenduse: Enter esitab
      // vastuse, nagu nupp.
      onSubmit={(event) => {
        event.preventDefault();
        if (draft.trim() === "") return;
        onAnswer({ kind: "numeric", raw: draft });
      }}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-labelledby={labelledBy}
          aria-describedby={question.unit ? hintId : undefined}
          className="min-h-11 w-40 rounded-lg border border-line bg-white px-4 text-lg text-ink"
        />
        {question.unit ? (
          <span id={hintId} className="text-lg text-ink-soft">
            Vasta ühikus {question.unit}
          </span>
        ) : null}
      </div>

      <div>
        <Button type="submit" disabled={draft.trim() === ""}>
          Esita vastus
        </Button>
      </div>
    </form>
  );
}
