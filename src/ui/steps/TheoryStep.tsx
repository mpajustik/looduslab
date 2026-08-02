import type { StepOfType } from "./types";

/**
 * Lühike teooria: üks ekraanitäis teksti, vastust ei ole.
 *
 * `body` on lõikude massiiv (moodulileping) – iga lõik oma <p>-na, et
 * reavahed ja rea pikkus tuleksid stiilist, mitte sisust.
 */
export function TheoryStep({ step }: { step: StepOfType<"theory"> }) {
  return (
    <div className="flex max-w-prose flex-col gap-4 text-lg leading-relaxed text-ink">
      {step.body.map((paragraph, index) => (
        // Lõigud on staatilised ja neid ei sorteerita ega lisata juurde,
        // seega järjekorranumber on siin turvaline võti.
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}
