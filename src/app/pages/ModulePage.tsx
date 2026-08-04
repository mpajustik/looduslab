import { Suspense, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "../../ui/buttonStyles";
import { PageHeader } from "../../ui/PageHeader";
import { StepShell } from "../../ui/StepShell";
import type { ProgressMode } from "../../engine/progress";
import type { LoadedModule } from "../../modules/registry";
import {
  moduleFigures,
  moduleRegistry,
  moduleSimulations,
  slugIndex,
} from "../../modules/registry";

/**
 * Päris moodul (`/m/:slug`) – laeb mooduli registrist slugi järgi ja
 * renderdab `StepShell`-i, mida sammuraami arendusdemo (`/m/test`, sammud
 * 1.2–1.12) katsetas. Demo on samm 1.13 seisuga kadunud – see leht katab
 * nüüd sama eesmärki päris sisuga. Ta ei tea, MIS moodul parasjagu käib –
 * kogu sisu tuleb registrist (docs/ARHITEKTUUR.md „app/ ei tohi sisaldada
 * äriloogikat").
 *
 * `?eelvaade=1` lülitab `preview`-režiimi (õpetaja „Vaata õpilasena",
 * samm 2.14) juba enne, kui see funktsioon päriselt olemas on.
 *
 * Vale slug on TEADA juba renderdamise ajal (`slugIndex` on sünkroonne
 * registri väljavõte) – see haru ei vaja efekti ega olekut. Ainult PÄRIS
 * mooduli laadimine on asünkroonne, seega ainult see läheb `ModuleLoader`
 * alamkomponenti, mis `key={id}` abil taasehitub, kui õpilane liigub otse
 * ühelt moodulilt teisele (nt "Edasi" nupuga tulevikus) – nii ei pea efekt
 * ise vana oleku käsitsi nullima (React'i enda soovitatud muster).
 */
export default function ModulePage() {
  const { slug } = useParams();
  const id = slug ? slugIndex.get(slug) : undefined;

  if (!id) {
    return (
      <div className="flex flex-col items-start gap-6">
        <PageHeader
          title="Sellist tundi ei ole"
          lead="Võib-olla on link vana või kirjapildis viga. Alusta kursusest."
        />
        <Link to="/kursus" className={buttonClasses()}>
          Ava kursus
        </Link>
      </div>
    );
  }

  return <ModuleLoader key={id} id={id} />;
}

function ModuleLoader({ id }: { id: string }) {
  const [params] = useSearchParams();
  const mode: ProgressMode =
    params.get("eelvaade") === "1" ? "preview" : "persist";
  const [loaded, setLoaded] = useState<LoadedModule | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Registri kirje on siin garanteeritud olemas (id tuli `slugIndex`-ist,
    // mis on samast registrist ehitatud) – seega ei ole siin teist "vale
    // moodul" haru vaja. Küll aga on `import()` ise VÕRGUPÄRING – telefonis
    // katkendliku ühendusega õpilasel läheb see päriselt katki
    // (ülevaatuse leid, CodeRabbit, 2026-08-04): ilma `.catch`-ita jääks
    // ekraan igaveseks "Laen tundi …" peale.
    moduleRegistry[id]()
      .then((module) => {
        if (!cancelled) setLoaded(module);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (failed) {
    return (
      <div className="flex flex-col items-start gap-6">
        <PageHeader
          title="Tund ei laadinud"
          lead="Kontrolli internetiühendust ja proovi uuesti."
        />
        <button
          type="button"
          className={buttonClasses()}
          onClick={() => window.location.reload()}
        >
          Proovi uuesti
        </button>
      </div>
    );
  }

  if (!loaded) {
    // Mooduli kood laetakse eraldi failina (samm 1.13 valmis-kontroll) –
    // väike viivitus enne sisu ilmumist on ootuspärane, mitte viga.
    return <PageHeader title="Laen tundi …" />;
  }

  const { manifest, activities } = loaded;

  // Laisalt laetakse nii simulatsioon kui ka joonised, seega ütleb ootelause
  // „sisu", mitte „simulatsioon" – teooriasammul oleks teine sõna vale.
  return (
    <Suspense fallback={<PageHeader title="Laen tunni sisu …" />}>
      <StepShell
        moduleId={manifest.id}
        moduleVersion={manifest.version}
        moduleTitle={manifest.title}
        moduleGoal={manifest.goal}
        steps={activities.steps}
        mode={mode}
        Simulation={moduleSimulations[manifest.id]}
        figures={moduleFigures[manifest.id]}
        // Edasiviiv nupp tuleb app-kihist, sest ui ei tea marsruutidest.
        summaryAction={
          <Link to="/kursus" className={buttonClasses()}>
            Tagasi kursuse juurde
            <ArrowRight aria-hidden="true" className="size-5" />
          </Link>
        }
      />
    </Suspense>
  );
}
