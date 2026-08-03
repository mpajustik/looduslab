import { useId, useState } from "react";
import type { AnswerPayload } from "../../engine/answers";
import type { TextQuestion } from "../../engine/contract";
import { countWords } from "../../lib/text";
import { Button } from "../Button";

/**
 * Vabatekst: õpilane selgitab oma sõnadega.
 *
 * Siin ei hinnata MIDAGI (CLAUDE.md reegel 3) – vastus läheb õpetajale ja
 * checker jätab ta `correct: null`-iks. Ainus nõue on PIKKUS (`minWords`) ja
 * seegi on vormi, mitte õigsuse asi: „Ütle rohkem" ei ole hinnang sisule.
 *
 * Loendur on abistav, mitte karistav – ta ütleb, kui palju on kirjas, ja
 * kaob ära, kui nõue on täidetud. Vastust ise ta ei kommenteeri.
 */
export function TextInput({
  question,
  answer,
  onAnswer,
  labelledBy,
}: {
  question: TextQuestion;
  /** Esitatud vastus või `undefined`, kui õpilane pole veel vastanud. */
  answer: AnswerPayload | undefined;
  onAnswer: (payload: AnswerPayload) => void;
  /** Küsimuse teksti id – väli viitab sellele oma nimena. */
  labelledBy: string;
}) {
  const [draft, setDraft] = useState("");
  const counterId = useId();

  // Vale kujuga vastus tähendab katkist moodulit (küsimus text, vastus
  // numeric) – siis käitume nii, nagu vastust ei oleks.
  const submitted = answer?.kind === "text" ? answer.text : undefined;

  if (submitted !== undefined) {
    return (
      // Õpilase tekst renderdub Reacti tavalise escapimisega
      // (CLAUDE.md reegel 12) – `whitespace-pre-line` hoiab ainult reavahetused.
      <p className="whitespace-pre-line rounded-lg border border-line bg-white p-4 text-lg leading-relaxed text-ink">
        {submitted}
      </p>
    );
  }

  const words = countWords(draft);
  const { minWords } = question;
  // Ilma `minWords`-ita nõuame vähemalt üht sõna: tühi vastus ei ole vastus
  // ja avaks „Edasi" luku ilma, et õpilane oleks midagi öelnud.
  const enough = words >= Math.max(minWords ?? 0, 1);

  // Lukus nupul on ALATI nähtav põhjus – ka siis, kui moodul `minWords`-i ei
  // määranud ja nõue on lihtsalt „vähemalt üks sõna" (CodeRabbiti ülevaatuse
  // leid 2026-08-03). Lukus nupp ilma põhjuseta on 8. klassi õpilase jaoks
  // lihtsalt katkine nupp; sama reegel kehtib StepShelli „Edasi" nupul.
  const hint =
    minWords === undefined
      ? enough
        ? null
        : "Kirjuta oma vastus, siis saad selle esitada."
      : enough
        ? `Sõnu on piisavalt (${words}).`
        : `Kirjas on ${words} sõna, oodatud on vähemalt ${minWords}.`;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!enough) return;
        onAnswer({ kind: "text", text: draft.trim() });
      }}
      className="flex flex-col gap-3"
    >
      <textarea
        rows={5}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        aria-labelledby={labelledBy}
        aria-describedby={hint ? counterId : undefined}
        className="w-full rounded-lg border border-line bg-white p-4 text-lg leading-relaxed text-ink"
      />

      {hint ? (
        <p id={counterId} className="text-base text-ink-soft">
          {hint}
        </p>
      ) : null}

      <div>
        {/* Lukus nupu põhjus on loendur – ilma `aria-describedby`-ta oleks ta
            ekraanilugeja jaoks lihtsalt katkine nupp. */}
        <Button
          type="submit"
          disabled={!enough}
          aria-describedby={!enough && hint ? counterId : undefined}
        >
          Esita vastus
        </Button>
      </div>
    </form>
  );
}
