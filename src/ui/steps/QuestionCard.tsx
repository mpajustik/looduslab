import { useId } from "react";
import type { AnswerPayload } from "../../engine/answers";
import type { Question } from "../../engine/contract";
import { ChoiceInput } from "./ChoiceInput";

/**
 * Üks küsimus: tekst + vastamise koht.
 *
 * Küsimuse liik valitakse siin `if`-iga, mitte registriga (nagu sammutüübid).
 * Põhjus: uus sammutüüp on ainult uus ekraan, aga uus küsimuseliik nõuab ALATI
 * ka uut checkerit ja skeemi – liike on kolm ja nad ei kasva iseenesest juurde.
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
      ) : (
        // Arvvastus valmib sammus 1.4, vabatekst sammus 1.11. Kuni siis EI TOHI
        // ühelgi päris moodulil sellist küsimust olla: vastamata küsimus hoiab
        // „Edasi" nupu lukus ja õpilane jääks sammule kinni. Praegu on ainus
        // sisu arendusdemo (/m/test), kus on ainult valikvastus.
        <p className="text-lg text-ink-soft">
          Sellele küsimusele ei oska rakendus veel vastust vastu võtta.
        </p>
      )}
    </div>
  );
}
