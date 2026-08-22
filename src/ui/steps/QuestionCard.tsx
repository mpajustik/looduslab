import { useEffect, useId, useRef, useState } from "react";
import { Lightbulb, RotateCcw } from "lucide-react";
import { checkAnswer } from "../../checker";
import type { AnswerPayload } from "../../engine/answers";
import type { Question } from "../../engine/contract";
import type { ModuleFigures } from "../../engine/figures";
import { readableAnswerText } from "../../engine/recall";
import { answerStage } from "../../engine/retry";
import { Button } from "../Button";
import { ChoiceInput } from "./ChoiceInput";
import { Feedback } from "./Feedback";
import { Figure } from "./Figure";
import { LabelInput } from "./LabelInput";
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
 *
 * Vale vastuse parandamine (plaan/MOODULILEHT-UX.md samm 1) elab siin, sest
 * siin on koos küsimus, vastus ja checkeri otsus. Reegli ise otsustab
 * src/engine/retry.ts – see fail ainult järgib teda.
 */
export function QuestionCard({
  question,
  answer,
  onAnswer,
  figures,
  retry,
}: {
  question: Question;
  answer: AnswerPayload | undefined;
  onAnswer: (questionId: string, payload: AnswerPayload) => void;
  /** Mooduli joonised – küsimus võib ühele neist sildiga viidata. */
  figures?: ModuleFigures;
  /**
   * Kas selle sammu vale vastust tohib parandada – `allowsRetry(step.type)`.
   *
   * Kohustuslik prop, mitte vaikeväärtus: uus sammukomponent peab otsuse
   * teadlikult kaasa andma, mitte selle vaikimisi pärima.
   */
  retry: boolean;
}) {
  const promptId = useId();
  const result = answer ? checkAnswer(question, answer) : undefined;

  /**
   * Mitu korda on sellele küsimusele vastatud. Algväärtus arvestab juba
   * salvestatud vastust: sammu juurde tagasi tulles ei alusta lugemine nullist
   * (muidu annaks tagasitulek tasuta lisakatse enne õige vastuse näitamist).
   *
   * Olek on komponendis, mitte salvestuses: „mitmes katse KÄESOLEVAL ekraanil"
   * on ekraani asi. Õpetajani jõuab `revisedCount` (src/engine/progress.ts).
   */
  const [attempts, setAttempts] = useState(answer === undefined ? 0 : 1);
  /** Sisestus on uuesti lahti („Proovi veel" vajutatud). */
  const [retrying, setRetrying] = useState(false);
  /** Mitu vihjet on õpilane avanud – ükshaaval, mitte kõik korraga. */
  const [hintsShown, setHintsShown] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const stage = answerStage({
    retry,
    correct: result?.correct ?? null,
    attempts,
    revealed,
  });

  // Vihjeid pakume samas olukorras, kus Feedback neid üldse näitab: vale
  // vastuse juures. Loend on lõigatud avatud vihjete arvuni.
  const hints = question.hints ?? [];
  const canShowHint = result?.correct === false && hintsShown < hints.length;

  /**
   * „Proovi veel" kaob klõpsuga ise ära – ilma selleta jääks fookus kadunud
   * nupu peale ja klaviatuuriga (või ekraanilugejaga) liikuja peaks sisestuse
   * uuesti üles otsima. Raadionupu fookustamine EI vali teda ära, seega on see
   * ohutu ka valikvastuse juures.
   *
   * `select` on loendis, sest „märgi joonisele" vastatakse rippmenüüdest
   * (LabelInput) – ilma selleta jäi fookus just seal kadunud nupu peale
   * (Codexi ülevaatuse leid 2026-08-22). Uue sisestuskomponendi lisamisel
   * tuleb tema element siia kaasa võtta.
   */
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!retrying) return;
    cardRef.current?.querySelector<HTMLElement>("input, textarea, select")?.focus();
  }, [retrying]);

  const handleAnswer = (questionId: string, payload: AnswerPayload) => {
    setAttempts((count) => count + 1);
    setRetrying(false);
    onAnswer(questionId, payload);
  };

  // Parandamise ajal on sisestus lahti, aga eelmine katse jääb ekraanile:
  // tagasiside (ja avatud vihje) seisab sisestuse KOHAL, muidu vastaks
  // õpilane enne, kui jõuab vihjeni. Sisestusväli ise kannab eelmist vastust
  // – mustand elab üle esitamise (vt drafts.ts), seega saab õpilane oma
  // vastust parandada, mitte kirjutada nullist uuesti.
  //
  // Sisestus loeb esitatud vastust `answer`-i pealt: parandamise ajal anname
  // talle `undefined` ja ta avaneb tavalise sisestusena tagasi. Nii ei pea
  // ükski sisestuskomponent parandamisest midagi teadma.
  const openAnswer = retrying ? undefined : answer;
  // Mustand (poolik sisestus) elab ainult mälus – lehe värskendamise järel on
  // sisestusväli tühi. Siis on see rida ainus koht, kus õpilane näeb, mida ta
  // eelmisel korral pakkus. Mõõtetabelit siin ei näidata (`undefined`) – üheks
  // reaks kokku kleebitud tabel oleks loetamatu.
  const previousText = retrying ? readableAnswerText(question, answer) : undefined;

  const feedback = result ? (
    <Feedback
      result={result}
      hints={hints.slice(0, hintsShown)}
      showExpected={stage.showExpected}
    />
  ) : null;

  const actions =
    stage.canTryAgain || stage.canReveal || canShowHint ? (
      <div className="flex flex-wrap gap-2">
        {stage.canTryAgain && !retrying ? (
          <Button variant="secondary" onClick={() => setRetrying(true)}>
            <RotateCcw aria-hidden="true" className="size-4" />
            Proovi veel
          </Button>
        ) : null}
        {canShowHint ? (
          <Button variant="ghost" onClick={() => setHintsShown((count) => count + 1)}>
            <Lightbulb aria-hidden="true" className="size-4" />
            {hintsShown === 0 ? "Vihje" : "Veel üks vihje"}
          </Button>
        ) : null}
        {stage.canReveal ? (
          <Button variant="ghost" onClick={() => setRevealed(true)}>
            Näita vastust
          </Button>
        ) : null}
      </div>
    ) : null;

  return (
    <div ref={cardRef} className="flex max-w-prose flex-col gap-4">
      <p id={promptId} className="text-lg font-medium leading-relaxed text-ink">
        {question.prompt}
      </p>

      {/* Joonis küsimuse ja vastuse VAHEL: õpilane loeb küsimuse, vaatab
          joonist ja alles siis vastab. */}
      <Figure figures={figures} id={question.figure} />

      {/* Parandamise ajal seisab eelmine tagasiside sisestuse KOHAL. */}
      {retrying ? (
        <>
          {feedback}
          {actions}
          {/* „Edasi" jääb parandamise ajal lahti – vastatud samm ON vastatud
              ja lukk ei tohi karistada. Aga siis saab õpilane kirjutada uue
              vastuse ja lahkuda ilma seda esitamata, mispeale jääb kehtima
              vana vale vastus. Seda ei tohi juhtuda VAIKSELT (Codexi leid
              2026-08-22), seega ütleme selle välja seal, kus õpilane parasjagu
              vaatab. */}
          <p className="text-base text-ink-soft">
            {previousText ? (
              <>
                Sinu eelmine vastus: <span className="text-ink">{previousText}</span>. See
                kehtib seni, kuni esitad uue.
              </>
            ) : (
              // Mõõtetabelit ühe reana ei näidata – siis jääb ainult hoiatus.
              "Eelmine vastus kehtib seni, kuni esitad uue."
            )}
          </p>
        </>
      ) : null}

      {question.kind === "choice" ? (
        <ChoiceInput
          question={question}
          answer={openAnswer}
          onAnswer={(payload) => handleAnswer(question.id, payload)}
          labelledBy={promptId}
        />
      ) : question.kind === "numeric" ? (
        <NumericInput
          question={question}
          answer={openAnswer}
          onAnswer={(payload) => handleAnswer(question.id, payload)}
          labelledBy={promptId}
        />
      ) : question.kind === "table" ? (
        <TableInput
          question={question}
          answer={openAnswer}
          onAnswer={(payload) => handleAnswer(question.id, payload)}
          labelledBy={promptId}
        />
      ) : question.kind === "label" ? (
        <LabelInput
          question={question}
          answer={openAnswer}
          onAnswer={(payload) => handleAnswer(question.id, payload)}
          labelledBy={promptId}
        />
      ) : question.kind === "text" ? (
        <TextInput
          question={question}
          answer={openAnswer}
          onAnswer={(payload) => handleAnswer(question.id, payload)}
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

      {retrying ? null : (
        <>
          {feedback}
          {actions}
        </>
      )}
    </div>
  );
}
