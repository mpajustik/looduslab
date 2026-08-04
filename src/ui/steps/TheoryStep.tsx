import type { ModuleFigures } from "../../engine/figures";
import type { StepOfType } from "./types";

/**
 * Lühike teooria: üks ekraanitäis teksti, vastust ei ole.
 *
 * `body` on lõikude massiiv (moodulileping) – iga lõik oma <p>-na, et
 * reavahed ja rea pikkus tuleksid stiilist, mitte sisust.
 *
 * Joonis (`step.figure`) tuleb teksti JÄRELE: tekst seletab mõiste ja joonis
 * võtab kokku. Ta ei asenda teksti – kes joonist ei näe, saab sammu ikka
 * läbida (vt contractSchema.ts theory).
 */
export function TheoryStep({
  step,
  figures,
}: {
  step: StepOfType<"theory">;
  figures?: ModuleFigures;
}) {
  // Silt ilma jooniseta tähendab katkist moodulit (registrist puudub kirje) –
  // seda valvab test, mitte see komponent. Ekraanil jääb siis lihtsalt tekst.
  const Figure = step.figure ? figures?.[step.figure] : undefined;

  return (
    <div className="flex max-w-prose flex-col gap-4 text-lg leading-relaxed text-ink">
      {step.body.map((paragraph, index) => (
        // Lõigud on staatilised ja neid ei sorteerita ega lisata juurde,
        // seega järjekorranumber on siin turvaline võti.
        <p key={index}>{paragraph}</p>
      ))}

      {Figure ? <Figure /> : null}
    </div>
  );
}
