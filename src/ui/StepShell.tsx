import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Step, StepType } from "../engine/contract";
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
 * Praegu elab sammu number ainult komponendi olekus. Salvestus (localStorage,
 * hiljem Supabase) tuleb sammus 1.6 – siis liigub see engine'i, mitte siia.
 */
export function StepShell({
  moduleTitle,
  steps,
}: {
  /** Mooduli pealkiri – õpilane näeb, mis tunnis ta on. */
  moduleTitle: string;
  steps: Step[];
}) {
  const [index, setIndex] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Sammu vahetusel läheb fookus uue sammu pealkirjale: ekraanilugeja
    // loeb uue sammu ette ja klaviatuuriga liikuja ei alusta uuesti lehe
    // algusest. Kerimise teeme ise, et fookus ei hüpaks poole ekraani peale.
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [index]);

  if (steps.length === 0) {
    return <p className="text-lg text-ink-soft">Selles tunnis ei ole ühtegi sammu.</p>;
  }

  // Miks kaitse: `/m/:slug` renderdab kõigil moodulitel SAMA komponenti,
  // seega moodulilt moodulile liikudes React seda maha ei võta ja `index`
  // jääb alles. 8-sammuliselt moodulilt 3-sammulisele minnes oleks
  // `steps[5]` olematu ja ekraan valge.
  const safeIndex = Math.min(index, steps.length - 1);
  const step = steps[safeIndex];
  const label = STEP_LABELS[step.type];
  // Võti on `step.type`, seega komponent SAAB just seda tüüpi sammu. Seda
  // seost TypeScript ise ei näe – siin on ainus koht, kus me talle ütleme.
  const StepContent = stepRegistry[step.type] as StepComponent<StepType> | undefined;

  const isFirst = safeIndex === 0;
  const isLast = safeIndex === steps.length - 1;
  // Liigume `safeIndex`-ist, mitte `index`-ist: kui indeks oli vahemikust
  // väljas, viiks vana väärtusest arvutamine nupu lukku.
  const move = (delta: number) =>
    setIndex(Math.min(Math.max(safeIndex + delta, 0), steps.length - 1));

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
          <StepContent step={step} />
        ) : (
          // Seda ei tohiks õpilane kunagi näha – aga tühi valge ekraan oleks
          // hullem kui aus lause. Ülejäänud sammutüübid valmivad 1.3–1.12.
          <p className="text-lg text-ink-soft">
            Seda sammu ei oska rakendus veel näidata.
          </p>
        )}
      </div>

      <nav
        aria-label="Sammud"
        className="flex items-center justify-between gap-3 border-t border-line pt-4"
      >
        <Button variant="secondary" onClick={() => move(-1)} disabled={isFirst}>
          <ArrowLeft aria-hidden="true" className="size-5" />
          Tagasi
        </Button>
        {/* Viimasel sammul on „Edasi" lukus – mooduli kokkuvõtteekraan
            lisandub sammus 1.12. */}
        <Button onClick={() => move(1)} disabled={isLast}>
          Edasi
          <ArrowRight aria-hidden="true" className="size-5" />
        </Button>
      </nav>
    </div>
  );
}
