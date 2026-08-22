import type { AnswerPayload, Answers } from "./answers";
import type { Question, Step } from "./contract";
import { stepQuestions } from "./contract";

/**
 * Varasema vastuse meeldetuletus.
 *
 * Explain-samm näitab õpilase enda ennustust kõrval
 * (sisu/MOODUL-peegeldumisseadus.md: „Võrdle oma ennustusega 3. sammust").
 * Ilma selleta peaks õpilane sammu tagasi kerima – ja siis ta pigem ei võrdle.
 *
 * Miks engine, mitte komponent: vastuse LOETAVAKS tegemine nõuab küsimust
 * (valiku id → variandi tekst). Sammukomponent näeb ainult oma sammu, seega
 * teeb selle töö StepShell engine'i funktsiooniga. Puhas funktsioon – sama
 * sisend annab alati sama tulemuse.
 *
 * Õigsust siin EI näidata: ennustust ei hinnata (contractSchema.ts
 * „Salvestatakse, EI hinnata") ja õiget vastust me kõrvale ei kirjuta.
 */
export type RecalledAnswer = {
  /** Küsimus, mille peale õpilane vastas. */
  prompt: string;
  /** Vastus õpilase keeles – valiku id asemel variandi tekst. */
  text: string;
};

/**
 * Vastus loetavaks. `undefined`, kui vastust ei ole või kui ta ei käi
 * küsimusega kokku (katkine moodul, vana vastus) – siis parem mitte midagi
 * kui vale asi.
 *
 * Avalik, sest ka vale vastuse parandamine näitab eelmist katset kõrval
 * (src/ui/steps/QuestionCard.tsx): lehe värskendamine kustutab mustandi, aga
 * esitatud vastus jääb – ja ilma selleta oleks „proovi veel" tühi väli, kus
 * õpilane ei mäleta, mida ta pakkus.
 */
export function readableAnswerText(
  question: Question,
  answer: AnswerPayload | undefined,
): string | undefined {
  if (!answer) return undefined;

  switch (question.kind) {
    case "choice": {
      if (answer.kind !== "choice") return undefined;
      // Ainult VALITUD variandid – nii ei paista siit välja, milline neist
      // õige oli. Järjekord tuleb küsimuselt, et vastus näeks välja nii,
      // nagu õpilane teda ekraanil nägi.
      const chosen = question.options.filter((option) =>
        answer.optionIds.includes(option.id),
      );
      // Tundmatut varianti EI jäeta vaikselt kõrvale (sama reegel mis
      // valikuchecker'is, samm 1.5): siis näeks õpilane POOLIKUT ennustust
      // omaenda vastuse pähe. Kui kasvõi üks id ei klapi, on vastus tervikuna
      // kokkuviimatu – parem mitte midagi kui vale asi.
      if (chosen.length !== answer.optionIds.length) return undefined;
      return chosen.length > 0 ? chosen.map((option) => option.text).join(", ") : undefined;
    }
    case "numeric":
      return answer.kind === "numeric" ? answer.raw : undefined;
    case "text":
      return answer.kind === "text" ? answer.text : undefined;
    // Mõõtetabelit ei tuletata meelde ühe reana – kui seda kunagi vaja on,
    // vajab ta oma kuju, mitte kokkukleebitud teksti.
    case "table":
      return undefined;
  }
}

/**
 * Leiab küsimuse sammude seast ja tagastab tema vastuse loetaval kujul.
 *
 * `null`, kui küsimust ei ole (ümber nimetatud) või kui õpilane ei ole
 * vastanud – siis jääb meeldetuletus lihtsalt näitamata, mitte ei tekita
 * tühja kasti ega viga.
 */
export function recallAnswer(
  steps: Step[],
  answers: Answers,
  questionId: string,
): RecalledAnswer | null {
  for (const step of steps) {
    for (const question of stepQuestions(step)) {
      if (question.id !== questionId) continue;
      const text = readableAnswerText(question, answers[question.id]);
      return text === undefined ? null : { prompt: question.prompt, text };
    }
  }
  return null;
}
