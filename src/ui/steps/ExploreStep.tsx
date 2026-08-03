import type { ComponentType } from "react";
import type { AnswerPayload, Answers } from "../../engine/answers";
import type { SimulationProps } from "../../engine/simulationFeatures";
import { unlockedSimulationFeatures } from "../../engine/simulationFeatures";
import { QuestionCard } from "./QuestionCard";
import type { StepOfType } from "./types";

/**
 * Simulatsioon ülesandega (sisu/MOODUL-peegeldumisseadus.md „explore").
 *
 * Simulatsioonikomponent tuleb propsina (StepShell → siia), mitte otse
 * imporditult – see fail ei tohi teada, milline moodul parasjagu käib
 * (docs/ARHITEKTUUR.md „ui/ ei tohi teada moodulitest"). Milliseid
 * lisavõimalusi (nt „mattpind") simulatsioonile näidata, otsustab
 * `unlockedSimulationFeatures` sammu enda `simulation.unlocks` andmete järgi
 * – see fail tähendust ei tea, ainult kannab tulemuse edasi.
 *
 * Ülesanded on tavalised numbrivastusega küsimused (nagu precheck'is): kord
 * loeb õpilane vastuse simulatsiooni pealt ja tipib selle sisse – vastust
 * kontrollib checker, mitte simulatsioon ise (CLAUDE.md reegel 3).
 *
 * Ülesanded avanevad JÄRJEST (sisu/MOODUL-peegeldumisseadus.md „(järjest)"):
 * järgmine küsimus paistab alles pärast eelmisele vastamist. Ilma selleta
 * saaks vahele jätta ülesande 1 ja vastata kohe ülesandele 2 – mattpinna
 * lüliti (mis avaneb ülesande 2 järel) ilmuks siis liiga vara
 * (ülevaatus 2026-08-03: CodeRabbit + Codex leidsid mõlemad sama viga).
 */
export function ExploreStep({
  step,
  answers,
  onAnswer,
  Simulation,
}: {
  step: StepOfType<"explore">;
  answers: Answers;
  onAnswer: (questionId: string, payload: AnswerPayload) => void;
  Simulation?: ComponentType<SimulationProps>;
}) {
  const unlockedFeatures = unlockedSimulationFeatures(step, answers);

  const visibleQuestions: typeof step.questions = [];
  for (const question of step.questions) {
    visibleQuestions.push(question);
    if (answers[question.id] === undefined) break;
  }

  return (
    <div className="flex flex-col gap-8">
      {step.body ? (
        <div className="flex max-w-prose flex-col gap-4 text-lg leading-relaxed text-ink">
          {step.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      ) : null}

      {Simulation ? (
        <Simulation unlockedFeatures={unlockedFeatures} />
      ) : (
        // Ei tohiks õpilane kunagi näha – aga tühi ala oleks hullem kui aus lause.
        <p className="text-lg text-ink-soft">Simulatsiooni ei õnnestunud laadida.</p>
      )}

      <div className="flex flex-col gap-8">
        {visibleQuestions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            answer={answers[question.id]}
            onAnswer={onAnswer}
          />
        ))}
      </div>
    </div>
  );
}
