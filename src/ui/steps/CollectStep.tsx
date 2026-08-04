import type { ComponentType } from "react";
import type { AnswerPayload, Answers } from "../../engine/answers";
import type { ModuleFigures } from "../../engine/figures";
import type { SimulationProps } from "../../engine/simulationFeatures";
import { unlockedSimulationFeatures } from "../../engine/simulationFeatures";
import { QuestionCard } from "./QuestionCard";
import type { StepOfType } from "./types";

/**
 * Andmete kogumine simulatsioonist (sisu/MOODUL-peegeldumisseadus.md
 * „collect").
 *
 * Simulatsioon on ka SIIN nähtav, mitte ainult explore-sammul: õpilane peab
 * kolm mõõtmist päriselt ette võtma. Ilma selleta käiks ta iga rea pärast
 * „Tagasi"–„Edasi" ja tipiks lõpuks mälu järgi – siis mõõdab ta iseennast,
 * mitte simulatsiooni.
 *
 * `unlockedSimulationFeatures` tagastab mitte-explore sammul tühja hulga, seega
 * on mõõtmise ajal näha põhivaade (peegel) – mattpinna lüliti kuulub avastamise,
 * mitte mõõtmise juurde. Erikäsitlust selleks ei ole: sama funktsioon, üks
 * muster.
 */
export function CollectStep({
  step,
  answers,
  onAnswer,
  figures,
  Simulation,
}: {
  step: StepOfType<"collect">;
  answers: Answers;
  onAnswer: (questionId: string, payload: AnswerPayload) => void;
  /** Mooduli joonised – küsimus võib ühele neist sildiga viidata. */
  figures?: ModuleFigures;
  Simulation?: ComponentType<SimulationProps>;
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

      {Simulation ? <Simulation unlockedFeatures={unlockedSimulationFeatures(step, answers)} /> : null}

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
