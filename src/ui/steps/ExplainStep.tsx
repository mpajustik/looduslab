import type { AnswerPayload, Answers } from "../../engine/answers";
import type { ModuleFigures } from "../../engine/figures";
import type { RecalledAnswer } from "../../engine/recall";
import { QuestionCard } from "./QuestionCard";
import type { StepOfType } from "./types";

/**
 * Selgitus oma sõnadega (sisu/MOODUL-peegeldumisseadus.md „explain").
 *
 * Kõrval on õpilase enda varasem vastus – ennustus 3. sammust. Ilma selleta
 * peaks ta võrdlemiseks sammud tagasi kerima, ja siis ta pigem ei võrdle.
 * Vastuse otsib üles engine (`recallAnswer`), sest valiku id → variandi teksti
 * tõlkimiseks on vaja KÜSIMUST, mida see samm ei näe.
 *
 * Meeldetuletuse juures ei ole märki õigest ega valest: ennustust ei hinnata
 * ja „sa eksisid" enne selgitust paneks õpilase kirjutama seda, mida ta arvab
 * meid kuulda tahtvat.
 */
export function ExplainStep({
  step,
  answers,
  onAnswer,
  figures,
  recall,
}: {
  step: StepOfType<"explain">;
  answers: Answers;
  onAnswer: (questionId: string, payload: AnswerPayload) => void;
  /** Mooduli joonised – küsimus võib ühele neist sildiga viidata. */
  figures?: ModuleFigures;
  recall?: (questionId: string) => RecalledAnswer | null;
}) {
  const recalled = step.recallQuestion ? (recall?.(step.recallQuestion) ?? null) : null;

  return (
    <div className="flex flex-col gap-8">
      {step.body ? (
        <div className="flex max-w-prose flex-col gap-4 text-lg leading-relaxed text-ink">
          {step.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      ) : null}

      {/* Vastamata küsimusest ei jää tühja kasti – siis ei ole ka mida
          meelde tuletada. */}
      {recalled ? (
        <aside className="flex max-w-prose flex-col gap-2 rounded-lg border border-info bg-info-soft p-4">
          <p className="text-base font-semibold text-ink">Sinu varasem vastus</p>
          <p className="text-base leading-relaxed text-ink-soft">{recalled.prompt}</p>
          <p className="text-lg font-medium leading-relaxed text-ink">{recalled.text}</p>
        </aside>
      ) : null}

      <div className="flex flex-col gap-8">
        {step.questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            answer={answers[question.id]}
            onAnswer={onAnswer}
            figures={figures}
          />
        ))}
      </div>
    </div>
  );
}
