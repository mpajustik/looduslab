import { Suspense, useEffect, useId, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { ArrowRight, Info } from "lucide-react";
import { Button } from "../../ui/Button";
import { Card, CardDescription, CardTitle } from "../../ui/Card";
import { buttonClasses } from "../../ui/buttonStyles";
import { PageHeader } from "../../ui/PageHeader";
import { StepShell } from "../../ui/StepShell";
import type { ProgressMode } from "../../engine/progress";
import { joinPath } from "../../lib/shareLinks";
import { clearGuest, markGuest, readMembership } from "../../lib/studentIdentity";
import type { Membership } from "../../lib/studentIdentity";
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
 * `?eelvaade=1` lülitab `preview`-režiimi – seda kasutab õpetaja nupp „Vaata
 * õpilasena" (samm 2.14).
 *
 * Jagatud link (`/m/:slug`) on tihti õpilase ESIMENE kokkupuude rakendusega:
 * ta ei ole kursuse lehte näinud ega klassiga liitunud. Siis küsib
 * `JoinGate` enne tunni avamist klassikoodi – või laseb edasi külalisena.
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
  const [params] = useSearchParams();
  const mode: ProgressMode =
    params.get("eelvaade") === "1" ? "preview" : "persist";
  const id = slug ? slugIndex.get(slug) : undefined;

  if (!id || !slug) {
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

  // `key` sisaldab ka režiimi: kui sama tunni aadressile lisandub
  // `?eelvaade=1` ilma lehte vahetamata, peab olek NULLI minema. Vastasel
  // juhul jääks alles eelmise režiimi `membership` – ja preview-vaates
  // avanenud värav kirjutaks „Jätka külalisena" peale localStorage'i, mida
  // reegel 14 keelab (CodeRabbiti ülevaatuse leid, 2026-08-06).
  return (
    <ModuleEntry key={`${id}:${mode}`} id={id} slug={slug} mode={mode} />
  );
}

/**
 * Värav mooduli ette: kas seda õpilast tuleb enne klassiga liitma kutsuda?
 *
 * Vastus loetakse SEADMEST, mitte serverist (src/lib/studentIdentity.ts):
 * jagatud link peab avanema kohe, ilma supabase-js't alla laadimata
 * (CLAUDE.md reegel 13). Eelvaates ei küsi me midagi ega puuduta salvestust
 * üldse – `browserStorage()` teeb proovikirjutuse ja reegel 14 ütleb „mitte
 * kuhugi", ilma eranditeta.
 */
function ModuleEntry({
  id,
  slug,
  mode,
}: {
  id: string;
  slug: string;
  mode: ProgressMode;
}) {
  const [membership, setMembership] = useState<Membership>(() =>
    mode === "preview" ? "guest" : readMembership(),
  );

  if (membership === "unknown") {
    return (
      <JoinGate
        slug={slug}
        onGuest={() => {
          markGuest();
          setMembership("guest");
        }}
      />
    );
  }

  // Külalise olek peab jääma NÄHTAVAKS ja tagasipööratavaks. Vaikiv külaline
  // oli ülevaatuse leid: õpilane vajutab ühe korra „Jätka külalisena" ja
  // kogu tema edasine töö kaob õpetaja klassivaatest ilma, et keegi seda
  // märkaks. Eelvaates riba ei ole – seal ei ole ka kedagi, kes liituks.
  const showGuestNotice = membership === "guest" && mode === "persist";

  return (
    <div className="flex flex-col gap-4">
      {showGuestNotice ? (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-info-soft px-4 py-3 text-info">
          <Info aria-hidden="true" className="size-5 shrink-0" />
          <span>Töötad külalisena – õpetaja sinu tööd ei näe.</span>
          <button
            type="button"
            onClick={() => {
              clearGuest();
              setMembership("unknown");
            }}
            className="min-h-11 font-medium text-info underline underline-offset-2 hover:no-underline"
          >
            Liitu klassiga
          </button>
        </p>
      ) : null}
      <ModuleLoader id={id} mode={mode} />
    </div>
  );
}

/**
 * „Kust sa tuled?" – klassikood või külalisena edasi.
 *
 * Koodi ise siin EI kontrollita: kontroll elab Edge Functionis `join_class`
 * (samm 2.9, koos pidurdusega) ja liitumisleht oskab seda juba küsida. Siit
 * läheb õpilane sinna KOOS teadmisega, kuhu pärast tagasi tulla – muidu
 * viskaks liitumine ta kursuse esilehele ja jagatud tund kaoks silmist.
 */
function JoinGate({ slug, onGuest }: { slug: string; onGuest: () => void }) {
  const fieldId = useId();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = code.trim();
    if (trimmed.length === 0) {
      setError("Kirjuta klassikood, mille õpetaja ekraanil näitab.");
      return;
    }
    navigate(joinPath(trimmed, `/m/${slug}`));
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Enne kui alustad"
        lead="Kas sul on õpetajalt saadud klassikood? Siis näeb õpetaja sinu tööd ja saab aidata."
      />

      <Card className="flex flex-col gap-4">
        <CardTitle>Sisesta klassikood</CardTitle>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label htmlFor={fieldId} className="font-medium text-ink">
            Klassikood
          </label>
          <input
            id={fieldId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="nt 483920"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            aria-describedby={error ? `${fieldId}-viga` : undefined}
            aria-invalid={error ? true : undefined}
            className="min-h-11 w-full rounded-lg border border-line px-4 font-mono text-2xl tracking-widest text-ink placeholder:font-sans placeholder:text-base placeholder:tracking-normal placeholder:text-ink-soft"
          />
          <Button type="submit" className="self-start">
            Liitu klassiga
          </Button>
          {error ? (
            <p id={`${fieldId}-viga`} role="alert" className="text-ink">
              <strong className="text-retry">Ei õnnestunud.</strong> {error}
            </p>
          ) : null}
        </form>
      </Card>

      <Card className="flex flex-col items-start gap-3">
        <CardTitle>Koodi ei ole?</CardTitle>
        <CardDescription>
          Saad tunni ikka läbi teha. Sinu töö jääb siis ainult sellesse
          seadmesse – õpetaja seda ei näe.
        </CardDescription>
        <Button type="button" variant="secondary" onClick={onGuest}>
          Jätka külalisena
        </Button>
      </Card>
    </div>
  );
}

function ModuleLoader({ id, mode }: { id: string; mode: ProgressMode }) {
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
