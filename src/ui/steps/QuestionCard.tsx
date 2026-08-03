import { useId } from "react";
import { checkAnswer } from "../../checker";
import type { AnswerPayload } from "../../engine/answers";
import type { Question } from "../../engine/contract";
import { ChoiceInput } from "./ChoiceInput";
import { Feedback } from "./Feedback";
import { NumericInput } from "./NumericInput";
import { TableInput } from "./TableInput";
import { TextInput } from "./TextInput";

/**
 * Üks küsimus: tekst + vastamise koht + tagasiside pärast esitamist.
 *
 * Sisestuskomponent valitakse siin `if`-iga, mitte registriga (nagu
 * sammutüübid). Põhjus: uus sammutüüp on ainult uus ekraan, aga uus
 * küsimuseliik nõuab ALATI ka uut checkerit ja skeemi – liike on kolm ja nad
 * ei kasva iseenesest juurde. Checkeri pool ON register (src/checker/index.ts),
 * sest seal nõuab seda moodulileping.
 *
 * Tagasiside arvutatakse siin renderdamise ajal, mitte olekusse: checker on
 * puhas funktsioon, seega sama vastus annab alati sama tulemuse ja ühte tõde
 * ei pea kahes kohas hoidma.
 */
export function QuestionCard({
  question,
  answer,
  onAnswer,
}: {
  question: Question;
  answer: AnswerPayload | undefined;
  onAnswer: (questionId: string, payload: AnswerPayload) => void;
}) {
  const promptId = useId();
  const result = answer ? checkAnswer(question, answer) : undefined;

  return (
    <div className="flex max-w-prose flex-col gap-4">
      <p id={promptId} className="text-lg font-medium leading-relaxed text-ink">
        {question.prompt}
      </p>

      {question.kind === "choice" ? (
        <ChoiceInput
          question={question}
          answer={answer}
          onAnswer={(payload) => onAnswer(question.id, payload)}
          labelledBy={promptId}
        />
      ) : question.kind === "numeric" ? (
        <NumericInput
          question={question}
          answer={answer}
          onAnswer={(payload) => onAnswer(question.id, payload)}
          labelledBy={promptId}
        />
      ) : question.kind === "table" ? (
        <TableInput
          question={question}
          answer={answer}
          onAnswer={(payload) => onAnswer(question.id, payload)}
          labelledBy={promptId}
        />
      ) : question.kind === "text" ? (
        <TextInput
          question={question}
          answer={answer}
          onAnswer={(payload) => onAnswer(question.id, payload)}
          labelledBy={promptId}
        />
      ) : (
        // Kaitseklapp: täna on igal skeemi küsimuseliigil oma sisestus, seega
        // siia ei jõuta. Uus liik ilma sisestuseta hoiaks „Edasi" nupu lukus –
        // aus lause on parem kui tühi koht, aga liik tuleb siia kohe lisada.
        <p className="text-lg text-ink-soft">
          Sellele küsimusele ei oska rakendus veel vastust vastu võtta.
        </p>
      )}

      {result ? <Feedback result={result} hints={question.hints} /> : null}
    </div>
  );
}
