import { useEffect, useId, useRef, useState, type ComponentType } from "react";
import { ArrowLeft, ArrowRight, Lock, RotateCcw } from "lucide-react";
import { isStepAnswered } from "../engine/answers";
import { stepQuestions, type Step, type StepType } from "../engine/contract";
import type { ProgressMode } from "../engine/progress";
import type { SimulationProps } from "../engine/simulationFeatures";
import { useModuleProgress } from "../engine/useModuleProgress";
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
 * Pooleli samm ja vastused elavad engine'is (`useModuleProgress`), mitte
 * siin: sealt käib ka salvestus seadmesse. Vaade ei tea, KAS ja KUHU
 * salvestatakse – nii ei saa `preview` (õpetaja „Vaata õpilasena") kogemata
 * jälge jätta.
 */
export function StepShell({
  moduleId,
  moduleVersion,
  moduleTitle,
  steps,
  mode = "persist",
  Simulation,
}: {
  /**
   * Mooduli id (või demo puhul mõni püsiv silt). Muutumine tähendab: õpilane
   * on teises moodulis – samm ja vastused laaditakse selle mooduli omadeks.
   * Ilma selleta kanduksid vastused üle, sest küsimuste id-d (`precheck-1`)
   * korduvad moodulite vahel ja `/m/:slug` renderdab kõigil moodulitel SAMA
   * komponenti.
   */
  moduleId: string;
  /** Mooduli versioon (manifest.version) – läheb iga vastuse külge. */
  moduleVersion: string;
  /** Mooduli pealkiri – õpilane näeb, mis tunnis ta on. */
  moduleTitle: string;
  steps: Step[];
  /** `preview` ei salvesta mitte kuhugi. Tuleb marsruudilt, mitte moodulist. */
  mode?: ProgressMode;
  /**
   * Mooduli simulatsioonikomponent (explore-sammu jaoks). StepShell ise ei
   * tea moodulitest (docs/ARHITEKTUUR.md) – kutsuja (app-kiht, kes registrist
   * mooduli laadis) annab selle propsina kaasa.
   */
  Simulation?: ComponentType<SimulationProps>;
}) {
  const progress = useModuleProgress({ moduleId, moduleVersion, steps, mode });
  const [askRestart, setAskRestart] = useState(false);
  const [askRestartModuleId, setAskRestartModuleId] = useState(moduleId);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lockHintId = useId();

  const { index, answers, runId } = progress;

  // Teise moodulisse minnes kaob lahtine „Alusta uuesti" küsimus koos vana
  // mooduliga – muidu kinnitaks „Jah" nupp uue mooduli vastuste kustutamise,
  // mida õpilane ei ole veel isegi näinud küsitavat (renderdamise ajal, mitte
  // efektis – sama muster mis mujal selles failis moodulivahetuse peale).
  if (askRestartModuleId !== moduleId) {
    setAskRestartModuleId(moduleId);
    setAskRestart(false);
  }

  useEffect(() => {
    // Sammu vahetusel läheb fookus uue sammu pealkirjale: ekraanilugeja
    // loeb uue sammu ette ja klaviatuuriga liikuja ei alusta uuesti lehe
    // algusest. Kerimise teeme ise, et fookus ei hüpaks poole ekraani peale.
    //
    // `runId` on sõltuvustes „Alusta uuesti" pärast: kui õpilane oli juba
    // esimesel sammul, jääb `index` nulli ja ilma selleta jääks fookus
    // kadunud nupu peale.
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [index, runId]);

  if (steps.length === 0) {
    return <p className="text-lg text-ink-soft">Selles tunnis ei ole ühtegi sammu.</p>;
  }

  // `index` tuleb engine'ist salvestatud sammu ID järgi, seega ta osutab alati
  // olemasolevale sammule – ka siis, kui mooduli sammud on vahepeal muutunud.
  const step = steps[index];
  const label = STEP_LABELS[step.type];
  // Võti on `step.type`, seega komponent SAAB just seda tüüpi sammu. Seda
  // seost TypeScript ise ei näe – siin on ainus koht, kus me talle ütleme.
  const StepContent = stepRegistry[step.type] as StepComponent<StepType> | undefined;

  const isFirst = index === 0;
  const isLast = index === steps.length - 1;
  // Lukk hoiab kinni VASTAMATA sammu, mitte valesti vastatud sammu: vale
  // vastusega peab saama edasi liikuda, muidu muutub õppimine karistuseks.
  //
  // Kui sammu ei OSATA näidata (tüübil pole veel komponenti), ei tohi ka
  // vastust nõuda – muidu näeks õpilane teadet „ei oska näidata" ja lukus
  // nuppu korraga, ehk umbteed. Kui kõik tüübid on olemas, on see tingimus
  // alati tõene ja muutub kahjutuks turvaklapiks.
  const locked = StepContent !== undefined && !isStepAnswered(step, answers);
  const questionCount = stepQuestions(step).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-4">
          <p className="truncate text-sm font-medium text-ink-soft">{moduleTitle}</p>
          <p className="shrink-0 text-sm font-medium text-ink-soft">
            Samm {index + 1}/{steps.length}
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
            style={{ width: `${((index + 1) / steps.length) * 100}%` }}
          />
        </div>
        {/* Ilma selleta näeks õpetaja „Vaata õpilasena" režiimis, et miski ei
            salvestu, ja arvaks, et rakendus on katki. */}
        {mode === "preview" ? (
          <p className="text-sm text-ink-soft">
            Eelvaade – vastuseid ei salvestata.
          </p>
        ) : null}
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
          // Võti sunnib uue mooduli, sammu või uue käigu peal uue instantsi.
          // Ilma selleta taaskasutab React sama komponenti ja sammukomponendi
          // POOLELI olek (nt tehtud, aga esitamata valik) kanduks üle –
          // küsimuste id-d (`precheck-1`) korduvad moodulite vahel, seega ei
          // aita ka võtmed allpool. Esitatud vastused tulevad engine'ist.
          <StepContent
            key={`${moduleId}:${runId}:${step.id}`}
            step={step}
            answers={answers}
            onAnswer={(questionId, payload) => progress.answer(step, questionId, payload)}
            Simulation={Simulation}
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
          <Button
            variant="secondary"
            onClick={() => progress.goToIndex(index - 1)}
            disabled={isFirst}
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
            Tagasi
          </Button>
          {/* Viimasel sammul on „Edasi" lukus – mooduli kokkuvõtteekraan
              lisandub sammus 1.12. */}
          <Button
            onClick={() => progress.goToIndex(index + 1)}
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

      {/* „Alusta uuesti" kustutab kõik vastused – seepärast küsitakse üle.
          Üks eksikombel tabatud nupp ei tohi tunnitööd ära pühkida. */}
      {progress.hasProgress ? (
        <div className="flex justify-center">
          {askRestart ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-line p-4">
              <p className="text-base text-ink">
                Alustame otsast? Senised vastused kustuvad.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="secondary"
                  // Fookus liigub küsimuse juurde – muidu jääks ta kadunud
                  // nupu peale ja klaviatuuriga tuleks otsida uuesti.
                  autoFocus
                  onClick={() => {
                    progress.restart();
                    setAskRestart(false);
                  }}
                >
                  Jah, alusta uuesti
                </Button>
                <Button variant="ghost" onClick={() => setAskRestart(false)}>
                  Loobu
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="ghost" onClick={() => setAskRestart(true)}>
              <RotateCcw aria-hidden="true" className="size-4" />
              Alusta uuesti
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
