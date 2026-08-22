import type { AnswerPayload, Answers } from "../../engine/answers";
import type { ModuleFigures } from "../../engine/figures";
import { allowsRetry } from "../../engine/retry";
import { QuestionCard } from "./QuestionCard";
import type { StepOfType } from "./types";

/**
 * Väljumispilet: 2–3 küsimust mooduli lõpus (moodulileping).
 *
 * Kuju on sama mis precheck'il – eristab teda kaks asja, ja kumbki ei ole
 * selles failis: silt („Kokkuvõte") ja usalduslause („Sinu vastust näeb
 * õpetaja") tulevad engine'ilt (./registry.ts), sest mooduli autori
 * meelespidamise peale jäetuna ununeksid nad ühel moodulil kindlasti.
 *
 * Vabatekstiküsimust („mis jäi segaseks") checker ei hinda – tema vastus jääb
 * `correct: null` (CLAUDE.md reegel 3). Just see küsimus on õpetajale kõige
 * kasulikum, seega ta EI tohi olla „valesti vastatav".
 */
export function ExitStep({
  step,
  answers,
  onAnswer,
  figures,
}: {
  step: StepOfType<"exit">;
  answers: Answers;
  onAnswer: (questionId: string, payload: AnswerPayload) => void;
  /** Mooduli joonised – küsimus võib ühele neist sildiga viidata. */
  figures?: ModuleFigures;
}) {
  return (
    <div className="flex flex-col gap-8">
      {step.questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          answer={answers[question.id]}
          onAnswer={onAnswer}
          figures={figures}
          retry={allowsRetry(step.type)}
        />
      ))}
    </div>
  );
}
