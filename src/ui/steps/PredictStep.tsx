import type { AnswerPayload, Answers } from "../../engine/answers";
import type { ModuleFigures } from "../../engine/figures";
import { ChoiceInput } from "./ChoiceInput";
import { Figure } from "./Figure";
import type { StepOfType } from "./types";

/**
 * Ennustus enne simulatsiooni (sisu/MOODUL-peegeldumisseadus.md „predict").
 *
 * Erinevalt precheck'ist EI kasutata siin QuestionCardi: see kutsuks
 * checkAnswer + Feedback välja ja näitaks kohe õige/vale, mis on ennustuse
 * mõttele otse vastu (contractSchema.ts „Salvestatakse, EI hinnata"). Õpilane
 * peab saama vabalt pakkuda, mitte arvama, mida rakendus tahab kuulda –
 * kas ennustus pidas paika, tuleb välja alles simulatsioonist (explore)
 * ja explain-sammust (1.11).
 *
 * `ChoiceInput` iseenesest ei näita õigsust (ainult õpilase enda valikut),
 * seega sobib see siia otse.
 */
export function PredictStep({
  step,
  answers,
  onAnswer,
  figures,
}: {
  step: StepOfType<"predict">;
  answers: Answers;
  onAnswer: (questionId: string, payload: AnswerPayload) => void;
  /** Mooduli joonised – küsimus võib ühele neist sildiga viidata. */
  figures?: ModuleFigures;
}) {
  return (
    <div className="flex flex-col gap-8">
      {step.body ? (
        <div className="flex max-w-prose flex-col gap-4 text-lg leading-relaxed text-ink">
          {step.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      ) : null}

      {step.questions.map((question) =>
        question.kind === "choice" ? (
          <div key={question.id} className="flex max-w-prose flex-col gap-4">
            <p
              id={`${question.id}-prompt`}
              className="text-lg font-medium leading-relaxed text-ink"
            >
              {question.prompt}
            </p>
            {/* Sama koht mis QuestionCardis: küsimuse ja vastuse vahel. */}
            <Figure figures={figures} id={question.figure} />
            <ChoiceInput
              question={question}
              answer={answers[question.id]}
              onAnswer={(payload) => onAnswer(question.id, payload)}
              labelledBy={`${question.id}-prompt`}
            />
          </div>
        ) : (
          // Ennustuse küsimus on spetsifikatsioonis alati valikvastus. Vabatekst
          // („Miks sa nii arvad?") jääb explain-sammuga (1.11) samasse ajastusse,
          // nagu QuestionCard vabateksti puhulgi – enne seda ei tohi ükski päris
          // moodul sellist küsimust kasutada.
          <p key={question.id} className="text-lg text-ink-soft">
            Sellele küsimusele ei oska rakendus veel vastust vastu võtta.
          </p>
        ),
      )}
    </div>
  );
}
