import type { AnswerPayload, Answers } from "../../engine/answers";
import type { ModuleFigures } from "../../engine/figures";
import { QuestionCard } from "./QuestionCard";
import type { StepOfType } from "./types";

/**
 * Eelteadmiste kontroll: 1–3 küsimust enne uut teemat.
 *
 * Küsimused on eraldi kaartidena ja igaüht esitatakse omaette – nii saab
 * checker (sammud 1.4–1.5) anda tagasisidet küsimuse, mitte terve sammu kohta,
 * ja andmebaasi läheb üks rida küsimuse kohta (docs/ANDMEMUDEL.md).
 */
export function PrecheckStep({
  step,
  answers,
  onAnswer,
  figures,
}: {
  step: StepOfType<"precheck">;
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
        />
      ))}
    </div>
  );
}
