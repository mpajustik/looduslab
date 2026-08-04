import { Lightbulb } from "lucide-react";
import type { AnswerPayload, Answers } from "../../engine/answers";
import type { ModuleFigures } from "../../engine/figures";
import { QuestionCard } from "./QuestionCard";
import type { StepOfType } from "./types";

/**
 * Harjutamine: näidis → osaline → iseseisev (sisu/MOODUL-peegeldumisseadus.md
 * „practice").
 *
 * Näidis on LAHENDATUD ülesanne, mitte küsimus: õpilane näeb ühe käigu lõpuni
 * enne, kui ise proovib. Seepärast ei tule ta ka `questions` seest – tal ei
 * ole vastust, mida esitada, ega id-d, mille alla midagi salvestada. Ekraanil
 * on ta selgelt eristatav kast, muidu loeks õpilane teda järjekordse
 * ülesandena ja otsiks, kuhu vastata.
 *
 * Ülesannete raskus kasvab andmetes (activities.ts), mitte siin: see komponent
 * joonistab nad järjekorras, milles moodul nad kirja pani.
 */
export function PracticeStep({
  step,
  answers,
  onAnswer,
  figures,
}: {
  step: StepOfType<"practice">;
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

      {step.worked ? (
        <section
          aria-label="Lahendatud näidis"
          className="flex max-w-prose flex-col gap-3 rounded-lg border border-info bg-info-soft p-4"
        >
          <p className="flex items-center gap-2 text-base font-semibold text-ink">
            <Lightbulb aria-hidden="true" className="size-5 shrink-0 text-info" />
            Näidis – lahendatud koos
          </p>
          <p className="text-lg leading-relaxed text-ink">{step.worked.prompt}</p>
          {/* Nummerdatud loend, sest tegu on JÄRJEKORRAS mõttesammudega –
              punktiirloend jätaks mulje, et need on üksteisest sõltumatud. */}
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-base leading-relaxed text-ink">
            {step.worked.solution.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ol>
          <p className="text-lg font-medium text-ink">Vastus: {step.worked.answer}</p>
        </section>
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
