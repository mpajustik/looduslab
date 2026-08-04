import type { ModuleFigures } from "../../engine/figures";
import { Figure } from "./Figure";
import type { StepOfType } from "./types";

/**
 * Häälestav probleem enne uut teemat: üks ekraanitäis teksti, vastust ei ole.
 *
 * Sisu on samamoodi üles ehitatud kui TheoryStep – ainult tähendus on teine
 * (moodulileping): hook äratab huvi ja seab eesmärgi, teooria seletab. Eraldi
 * komponent, sest tüübid on moodulilepingus lahus (docs/MOODULILEPING.md
 * „Laiendatavus") ja vastuste tabelis peab sammu tüüp olema õigesti tuletatav.
 */
export function HookStep({
  step,
  figures,
}: {
  step: StepOfType<"hook">;
  figures?: ModuleFigures;
}) {
  return (
    <div className="flex max-w-prose flex-col gap-4 text-lg leading-relaxed text-ink">
      {step.body.map((paragraph, index) => (
        // Lõigud on staatilised ja neid ei sorteerita ega lisata juurde,
        // seega järjekorranumber on siin turvaline võti.
        <p key={index}>{paragraph}</p>
      ))}

      <Figure figures={figures} id={step.figure} />
    </div>
  );
}
