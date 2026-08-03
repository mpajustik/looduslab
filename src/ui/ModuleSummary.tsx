import type { ReactNode, RefObject } from "react";
import { CheckCircle2, Eye } from "lucide-react";
import { Button } from "./Button";

/**
 * Mooduli kokkuvõtteekraan (docs/DISAINIJUHIS.md „Turvatunne").
 *
 * Väike positiivne hetk ILMA punktide, protsentide ja edetabelita: õpilane ei
 * pea lõpus teada saama, mitu viga ta tegi – vale vastus oli õppimise osa, mitte
 * arve, mis lõpus esitatakse. Seepärast ei ole siin ühtegi arvu.
 *
 * Lause „Täna õppisid: …" tuleb manifest'i `goal`-ist (õpilase keeles
 * sõnastatud õpieesmärk) – nii ütleb kokkuvõte iga mooduli puhul midagi
 * sisulist, ilma et mooduli autor peaks lõputeksti eraldi kirjutama.
 *
 * Disainijuhises on kokkuvõttes ka lause „Kordamisküsimused lisatud sinu
 * kordamisse". Seda EI ole siin: kordamismootor valmib etapis 3 ja praegu ei
 * lisata mitte kuhugi mitte midagi. Lubadus, mille taga ei ole tegu, õpetab
 * õpilast ekraani mitte uskuma – lause lisandub koos kordamisega.
 */
export function ModuleSummary({
  goal,
  onReview,
  action,
  headingRef,
}: {
  /** Mooduli õpieesmärk õpilase keeles. Demol/arendusraamil võib puududa. */
  goal?: string;
  /** „Vaata samme uuesti" – tagasi esimesele sammule, kokkuvõtet kaotamata. */
  onReview: () => void;
  /**
   * Üks selge edasiviiv nupp (nt „Tagasi kursuse juurde"). Tuleb app-kihist,
   * sest ui-kiht ei tea marsruutidest (docs/ARHITEKTUUR.md) – kuhu edasi, see
   * sõltub sellest, kust õpilane tuli.
   */
  action?: ReactNode;
  headingRef?: RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-w-prose flex-col gap-3 rounded-lg border border-correct bg-correct-soft p-6">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
        >
          {/* Ikoon on kaunistus – sõnum „Valmis!" kannab sama info tekstina
              (docs/DISAINIJUHIS.md: värv ega ikoon ei ole ainus info kandja). */}
          <CheckCircle2 aria-hidden="true" className="size-8 shrink-0 text-correct" />
          Valmis!
        </h1>
        {goal ? (
          <p className="text-lg leading-relaxed text-ink">
            Täna õppisid: <span className="font-medium">{goal}</span>
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {action}
        {/* Ikoon on meelega ERI ikoon kui „Alusta uuesti" oma (RotateCcw):
            üks avab sammud vaatamiseks, teine kustutab kõik vastused. Sama
            ikoon kahe nii eri tagajärje peal on eksitav ka siis, kui tekst
            on kõrval. */}
        <Button variant="secondary" onClick={onReview}>
          <Eye aria-hidden="true" className="size-5" />
          Vaata samme uuesti
        </Button>
      </div>
    </div>
  );
}
