import { useState } from "react";
import { Check } from "lucide-react";
import type { AnswerPayload } from "../../engine/answers";
import type { ChoiceQuestion } from "../../engine/contract";
import { Button } from "../Button";
import { cn } from "../cn";

/** Ühe variandi rea ühine kuju – valitud variant on alati ka SÕNAS, mitte ainult värvis. */
const OPTION_ROW =
  "flex min-h-11 items-start gap-3 rounded-lg border px-4 py-3 text-lg leading-relaxed";

/**
 * Valikvastus: üks õige (raadionupud) või mitu õiget (märkeruudud).
 *
 * Esitamata küsimusel elab valik siinses mustandiolekus – ülespoole (ja
 * sammus 1.6 salvestusse) jõuab ainult ESITATUD vastus. Nii ei loeta poolikut
 * klõpsu vastuseks ja „Edasi" lukk ei ava end kogemata.
 *
 * Õigsust siin EI hinnata (CLAUDE.md reegel 3): `option.correct` on olemas,
 * aga seda loeb checker (src/checker/choice.ts). Pärast esitamist näitab see
 * komponent ainult õpilase enda valikut – õiget varianti me välja ei anna,
 * tagasiside tuleb kõrvale checkerilt (QuestionCard → Feedback).
 */
export function ChoiceInput({
  question,
  answer,
  onAnswer,
  labelledBy,
}: {
  question: ChoiceQuestion;
  /** Esitatud vastus või `undefined`, kui õpilane pole veel vastanud. */
  answer: AnswerPayload | undefined;
  onAnswer: (payload: AnswerPayload) => void;
  /** Küsimuse teksti id – variandirühm viitab sellele oma nimena. */
  labelledBy: string;
}) {
  const [draft, setDraft] = useState<string[]>([]);
  const multiple = question.multiple === true;

  // Vastus võib tulla vale kujuga ainult siis, kui moodul on katki (küsimus
  // choice, vastus numeric) – siis käitume nii, nagu vastust ei oleks.
  const submitted = answer?.kind === "choice" ? answer.optionIds : undefined;

  if (submitted) {
    return (
      <ul aria-label="Sinu valik" className="flex flex-col gap-2">
        {question.options.map((option) => {
          const chosen = submitted.includes(option.id);
          return (
            <li
              key={option.id}
              className={cn(
                OPTION_ROW,
                chosen
                  ? "border-brand bg-brand-soft font-medium text-ink"
                  : "border-line text-ink-soft",
              )}
            >
              {/* Ikoon on kaunistus – sama info on kõrval sõnadega, sest värv
                  ega kujund ei tohi olla ainus info kandja. */}
              <Check
                aria-hidden="true"
                className={cn("mt-1 size-5 shrink-0", chosen ? "text-brand" : "invisible")}
              />
              <span>
                {option.text}
                {chosen ? <span className="sr-only"> – sinu vastus</span> : null}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  const toggle = (optionId: string) => {
    setDraft((current) => {
      if (!multiple) return [optionId];
      return current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        // Raadionuppudel on oma rollinimi; märkeruutude jaoks piisab rühmast.
        role={multiple ? "group" : "radiogroup"}
        aria-labelledby={labelledBy}
        className="flex flex-col gap-2"
      >
        {question.options.map((option) => {
          const chosen = draft.includes(option.id);
          return (
            <label
              key={option.id}
              className={cn(
                OPTION_ROW,
                "cursor-pointer",
                chosen
                  ? "border-brand bg-brand-soft font-medium text-ink"
                  : "border-line bg-white text-ink hover:bg-brand-soft",
              )}
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                // Sama nimi seob ühe küsimuse raadionupud üheks rühmaks –
                // ilma selleta saaks õpilane valida kaks vastust korraga.
                name={question.id}
                value={option.id}
                checked={chosen}
                onChange={() => toggle(option.id)}
                className="mt-1 size-5 shrink-0 accent-[var(--color-brand)]"
              />
              <span>{option.text}</span>
            </label>
          );
        })}
      </div>

      {multiple ? (
        <p className="text-base text-ink-soft">Õigeid vastuseid võib olla mitu.</p>
      ) : null}

      <div>
        <Button
          onClick={() => onAnswer({ kind: "choice", optionIds: draft })}
          disabled={draft.length === 0}
        >
          Esita vastus
        </Button>
      </div>
    </div>
  );
}
