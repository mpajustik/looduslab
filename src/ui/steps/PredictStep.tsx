import type { AnswerPayload, Answers } from "../../engine/answers";
import type { ModuleFigures } from "../../engine/figures";
import { ChoiceInput } from "./ChoiceInput";
import { Figure } from "./Figure";
import { TextInput } from "./TextInput";
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
 * `ChoiceInput` ja `TextInput` ise õigsust ei näita (ainult õpilase enda
 * valikut või teksti), seega sobivad nad siia otse.
 *
 * Vabatekst lisandus sammus 1.19: vedeliku rõhu moodul küsib ennustuse kõrval
 * „Miks sa nii arvad?", aga samm oskas näidata ainult valikvastust ja jättis
 * õpilase lukku – „Edasi" ootas vastust küsimusele, millel polnud vastamise
 * kohta. Leitud moodulit ise läbi käies.
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

      {step.questions.map((question) => (
        <div key={question.id} className="flex max-w-prose flex-col gap-4">
          <p
            id={`${question.id}-prompt`}
            className="text-lg font-medium leading-relaxed text-ink"
          >
            {question.prompt}
          </p>
          {/* Sama koht mis QuestionCardis: küsimuse ja vastuse vahel. */}
          <Figure figures={figures} id={question.figure} />
          {question.kind === "choice" ? (
            <ChoiceInput
              question={question}
              answer={answers[question.id]}
              onAnswer={(payload) => onAnswer(question.id, payload)}
              labelledBy={`${question.id}-prompt`}
            />
          ) : question.kind === "text" ? (
            // „Miks sa nii arvad?" – põhjendus ennustuse kõrval (vedeliku rõhu
            // moodul, samm 1.18). Ka see läheb ilma tagasisideta: ennustust ei
            // hinnata, ta ainult salvestatakse.
            <TextInput
              question={question}
              answer={answers[question.id]}
              onAnswer={(payload) => onAnswer(question.id, payload)}
              labelledBy={`${question.id}-prompt`}
            />
          ) : (
            // Arv ega mõõtetabel ennustusse ei kuulu: mõlemal on üks õige
            // vastus ja checker ütleks selle kohe välja.
            <p className="text-lg text-ink-soft">
              Sellele küsimusele ei oska rakendus veel vastust vastu võtta.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
