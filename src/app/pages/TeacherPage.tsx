import { useId, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";
import { LogOut, Mail } from "lucide-react";
import { Button } from "../../ui/Button";
import { Card, CardDescription, CardTitle } from "../../ui/Card";
import { PageHeader } from "../../ui/PageHeader";
import { buttonClasses } from "../../ui/buttonStyles";
import { supabase } from "../../lib/supabase";
import {
  isLikelyEmail,
  magicLinkErrorMessage,
  normalizeEmail,
} from "../../lib/authMessages";
import { isTeacherSession, useSession } from "../../lib/useSession";

/** Moodul, mida õpetajale tühjas olekus proovimiseks pakume. */
const DEMO_MODULE_PATH = "/m/peegeldumisseadus?eelvaade=1";

export default function TeacherPage() {
  const { status, session } = useSession();

  return (
    <div className="flex flex-col gap-6">
      {/* Kollane riba: õpilane ei tohi kunagi kahelda, kelle ala see on. */}
      <p className="rounded-lg bg-teacher-soft px-4 py-3 text-teacher">
        Õpetaja ala
      </p>

      {status === "loading" ? (
        <p className="text-ink-soft">Kontrollin sisselogimist …</p>
      ) : isTeacherSession(session) ? (
        <TeacherDesk email={session?.user.email ?? null} />
      ) : (
        <SignIn />
      )}
    </div>
  );
}

type SignInState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; to: string }
  | { kind: "error"; message: string };

/**
 * Sisselogimine ühekordse lingiga (Supabase Auth magic link).
 * Parooli EI OLE – see on teadlik valik: üks asi vähem, mida unustada.
 */
function SignIn() {
  const fieldId = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SignInState>({ kind: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = normalizeEmail(email);

    if (!isLikelyEmail(address)) {
      setState({
        kind: "error",
        message: "Kirjuta oma e-posti aadress kujul nimi@kool.ee.",
      });
      return;
    }

    setState({ kind: "sending" });
    const { error } = await supabase.auth.signInWithOtp({
      email: address,
      // Link toob õpetaja tagasi TÄPSELT siia lehele.
      options: { emailRedirectTo: `${window.location.origin}/opetaja` },
    });

    if (error) {
      setState({ kind: "error", message: magicLinkErrorMessage(error) });
      return;
    }
    setState({ kind: "sent", to: address });
  }

  if (state.kind === "sent") {
    return (
      <>
        <PageHeader
          title="Vaata postkasti"
          lead={`Saatsime sisselogimislingi aadressile ${state.to}. Ava kiri samas seadmes, kus tahad tööd teha.`}
        />
        <Card className="flex flex-col items-start gap-3">
          <CardDescription>
            Kirja ei tulnud? Vaata rämpsposti kausta.
          </CardDescription>
          <Button variant="secondary" onClick={() => setState({ kind: "idle" })}>
            Saada uuesti
          </Button>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Õpetajale"
        lead="Loo klass, jaga klassikoodi ja vaata, kuidas tunnitöö edeneb."
      />

      <Card className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Logi sisse e-postiga</CardTitle>
          <CardDescription>
            Parooli ei ole vaja. Saadame sulle kirja, milles on ühekordne
            sisselogimislink.
          </CardDescription>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label htmlFor={fieldId} className="font-medium text-ink">
            Sinu e-posti aadress
          </label>
          <input
            id={fieldId}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder="nimi@kool.ee"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-describedby={
              state.kind === "error" ? `${fieldId}-viga` : undefined
            }
            aria-invalid={state.kind === "error" || undefined}
            className="min-h-11 w-full rounded-lg border border-line px-4 text-base text-ink placeholder:text-ink-soft"
          />

          {/* role="alert" – ekraanilugeja loeb vea ette ka siis, kui fookus
              on juba nupul. Värv üksi infot ei kanna, seepärast ka sõna. */}
          {state.kind === "error" ? (
            <p id={`${fieldId}-viga`} role="alert" className="text-ink">
              <strong className="text-retry">Ei õnnestunud.</strong>{" "}
              {state.message}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={state.kind === "sending"}
            className="self-start"
          >
            <Mail aria-hidden="true" className="size-5" />
            {state.kind === "sending" ? "Saadan …" : "Saada sisselogimislink"}
          </Button>
        </form>
      </Card>
    </>
  );
}

/**
 * Sisselogitud õpetaja töölaud – praegu ainult TÜHI OLEK.
 *
 * Tühi olek ei ole valge ala: ta juhatab kahe sammuga edasi. Klasside
 * nimekiri tuleb siia sammus 2.8, kui klassi loomine on olemas.
 */
function TeacherDesk({ email }: { email: string | null }) {
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    // scope: "local" – väljalogimine käib AINULT sellest seadmest. Supabase'i
    // vaikimisi "global" lõpetaks ka koduarvuti sessiooni, mida õpetaja ei
    // oota; klassiarvutis on soov just see seade puhtaks saada.
    const { error } = await supabase.auth.signOut({ scope: "local" });
    // Õnnestumisel vahetab onAuthStateChange kogu vaate sisselogimisvormi
    // vastu ja see komponent kaob; vea korral peab nupp jääma vajutatavaks.
    if (error) setSigningOut(false);
  }

  return (
    <>
      <PageHeader
        title="Tere tulemast!"
        lead="Alusta kahest sammust – need võtavad kokku umbes 15 minutit."
      />

      <ol className="flex flex-col gap-4">
        <li>
          <Card className="flex flex-col items-start gap-3">
            <CardTitle>1. Proovi üht tundi ise õpilasena</CardTitle>
            <CardDescription>
              Nii tead, mida lapsed ekraanil näevad. Sinu vastuseid ei
              salvestata kuhugi.
            </CardDescription>
            <Link to={DEMO_MODULE_PATH} className={buttonClasses()}>
              Ava moodul „Peegeldumisseadus”
            </Link>
          </Card>
        </li>

        <li>
          <Card className="flex flex-col items-start gap-3">
            <CardTitle>2. Loo oma esimene klass</CardTitle>
            <CardDescription>
              Klass annab klassikoodi, millega õpilased liituvad ilma kontota.
              See osa valmib järgmisena.
            </CardDescription>
            <Button variant="secondary" disabled>
              Loo klass (tulekul)
            </Button>
          </Card>
        </li>
      </ol>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4 text-ink-soft">
        {/* break-all: pikk katkematu e-post ei tohi 360 px vaates realt
            välja joosta (reegel 10). */}
        {email ? (
          <span className="break-all">Sisse logitud: {email}</span>
        ) : null}
        <Button variant="ghost" onClick={handleSignOut} disabled={signingOut}>
          <LogOut aria-hidden="true" className="size-5" />
          Logi välja
        </Button>
      </div>
    </>
  );
}
