import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import type { AnswerPayload, Answers } from "../engine/answers";
import { isStepAnswered } from "../engine/answers";
import { stepQuestions, type Step, type StepType } from "../engine/contract";
import { Button } from "./Button";
import { STEP_LABELS, stepRegistry } from "./steps/registry";
import type { StepComponent } from "./steps/types";

/**
 * Mooduli raam: üks samm korraga, edenemine üleval, liikumine all.
 *
 * Siin ei ole ühtegi sammutüübi nime peale `stepRegistry` päringu – sisu
 * joonistab sammukomponent. Nii ei pea seda faili uue sammutüübi pärast
 * avama (docs/MOODULILEPING.md „Laiendatavus").
 *
 * Praegu elavad sammu number ja vastused ainult komponendi olekus. Salvestus
 * (localStorage, hiljem Supabase) tuleb sammus 1.6 – siis liigub see engine'i,
 * mitte siia. Vastuse KUJU (`AnswerPayload`) on juba engine'i oma, et sammus
 * 1.6 ei peaks andmeid ümber tõstma.
 */
export function StepShell({
  moduleId,
  moduleTitle,
  steps,
}: {
  /**
   * Mooduli id (või demo puhul mõni püsiv silt). Muutumine tähendab: õpilane
   * on teises moodulis – samm ja vastused algavad nullist. Ilma selleta
   * kanduksid vastused üle, sest küsimuste id-d (`precheck-1`) korduvad
   * moodulite vahel ja `/m/:slug` renderdab kõigil moodulitel SAMA komponenti.
   */
  moduleId: string;
  /** Mooduli pealkiri – õpilane näeb, mis tunnis ta on. */
  moduleTitle: string;
  steps: Step[];
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [currentModuleId, setCurrentModuleId] = useState(moduleId);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lockHintId = useId();

  // Olek lähtestatakse renderdamise ajal, mitte efektis: nii ei jõua õpilane
  // näha ühtegi kaadrit eelmise mooduli vastustega (React'i „prop muutus →
  // korrigeeri olekut" muster).
  if (currentModuleId !== moduleId) {
    setCurrentModuleId(moduleId);
    setIndex(0);
    setAnswers({});
  }

  useEffect(() => {
    // Sammu vahetusel läheb fookus uue sammu pealkirjale: ekraanilugeja
    // loeb uue sammu ette ja klaviatuuriga liikuja ei alusta uuesti lehe
    // algusest. Kerimise teeme ise, et fookus ei hüpaks poole ekraani peale.
    //
    // `moduleId` on sõltuvustes seepärast, et teise mooduli avamisel jääb
    // `index` nulli – ilma selleta vahetuks sisu ekraanilugeja jaoks vaikselt.
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [index, moduleId]);

  if (steps.length === 0) {
    return <p className="text-lg text-ink-soft">Selles tunnis ei ole ühtegi sammu.</p>;
  }

  // Teine kaitsekiht `moduleId` kõrval: sama mooduli sammude arv võib muutuda
  // ka ilma id vahetuseta (uus versioon keset seanssi, arenduses hot reload).
  // 8-sammuliselt moodulilt 3-sammulisele minnes oleks `steps[5]` olematu ja
  // ekraan valge.
  const safeIndex = Math.min(index, steps.length - 1);
  const step = steps[safeIndex];
  const label = STEP_LABELS[step.type];
  // Võti on `step.type`, seega komponent SAAB just seda tüüpi sammu. Seda
  // seost TypeScript ise ei näe – siin on ainus koht, kus me talle ütleme.
  const StepContent = stepRegistry[step.type] as StepComponent<StepType> | undefined;

  const isFirst = safeIndex === 0;
  const isLast = safeIndex === steps.length - 1;
  // Lukk hoiab kinni VASTAMATA sammu, mitte valesti vastatud sammu: vale
  // vastusega peab saama edasi liikuda, muidu muutub õppimine karistuseks.
  //
  // Kui sammu ei OSATA näidata (tüübil pole veel komponenti), ei tohi ka
  // vastust nõuda – muidu näeks õpilane teadet „ei oska näidata" ja lukus
  // nuppu korraga, ehk umbteed. Kui kõik tüübid on olemas, on see tingimus
  // alati tõene ja muutub kahjutuks turvaklapiks.
  const locked = StepContent !== undefined && !isStepAnswered(step, answers);
  const questionCount = stepQuestions(step).length;

  // Liigume `safeIndex`-ist, mitte `index`-ist: kui indeks oli vahemikust
  // väljas, viiks vana väärtusest arvutamine nupu lukku.
  const move = (delta: number) =>
    setIndex(Math.min(Math.max(safeIndex + delta, 0), steps.length - 1));

  const handleAnswer = (questionId: string, payload: AnswerPayload) =>
    setAnswers((current) => ({ ...current, [questionId]: payload }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-4">
          <p className="truncate text-sm font-medium text-ink-soft">{moduleTitle}</p>
          <p className="shrink-0 text-sm font-medium text-ink-soft">
            Samm {safeIndex + 1}/{steps.length}
          </p>
        </div>
        {/* Riba on kaunistus: sama info on kõrval sõnadega ja ekraanilugeja
            saab ta sealt. Nii ei kordu number kaks korda. */}
        <div
          aria-hidden="true"
          className="h-2 w-full overflow-hidden rounded-full bg-brand-soft"
        >
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-200"
            style={{ width: `${((safeIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          {label ? (
            <p className="text-sm font-semibold tracking-wide text-brand">{label}</p>
          ) : null}
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
          >
            {step.title}
          </h1>
        </div>

        {StepContent ? (
          // Võti sunnib uue mooduli või sammu peal uue instantsi. Ilma selleta
          // taaskasutab React sama komponenti ja sammukomponendi POOLELI olek
          // (nt tehtud, aga esitamata valik) kanduks üle – küsimuste id-d
          // (`precheck-1`) korduvad moodulite vahel, seega ei aita ka võtmed
          // allpool. Esitatud vastused nullib `moduleId` kontroll ülal.
          <StepContent
            key={`${moduleId}:${step.id}`}
            step={step}
            answers={answers}
            onAnswer={handleAnswer}
          />
        ) : (
          // Seda ei tohiks õpilane kunagi näha – aga tühi valge ekraan oleks
          // hullem kui aus lause. Ülejäänud sammutüübid valmivad 1.4–1.12.
          <p className="text-lg text-ink-soft">
            Seda sammu ei oska rakendus veel näidata.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-4">
        {/* Lukus nupp ilma põhjenduseta on 8. klassi õpilase jaoks lihtsalt
            katkine nupp. Lause on nähtav (mitte ainult ekraanilugejale) ja
            kaob ise, kui vastus on esitatud. */}
        {locked && !isLast ? (
          <p id={lockHintId} className="flex items-center gap-2 text-base text-ink-soft">
            <Lock aria-hidden="true" className="size-4 shrink-0" />
            {questionCount > 1
              ? "Vasta kõigile küsimustele, siis saad edasi."
              : "Vasta küsimusele, siis saad edasi."}
          </p>
        ) : null}

        <nav aria-label="Sammud" className="flex items-center justify-between gap-3">
          <Button variant="secondary" onClick={() => move(-1)} disabled={isFirst}>
            <ArrowLeft aria-hidden="true" className="size-5" />
            Tagasi
          </Button>
          {/* Viimasel sammul on „Edasi" lukus – mooduli kokkuvõtteekraan
              lisandub sammus 1.12. */}
          <Button
            onClick={() => move(1)}
            disabled={isLast || locked}
            // Lukus nupule ei saa fookust viia, aga ekraanilugeja
            // sirvimisrežiimis loeb ta põhjuse siiski ette.
            aria-describedby={locked && !isLast ? lockHintId : undefined}
          >
            Edasi
            <ArrowRight aria-hidden="true" className="size-5" />
          </Button>
        </nav>
      </div>
    </div>
  );
}
