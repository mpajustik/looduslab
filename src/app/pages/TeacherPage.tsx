import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";
import { LogOut, Mail, X } from "lucide-react";
import QRCode from "qrcode";
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
import {
  classCodeErrorMessage,
  formatExpiry,
  joinUrl,
  mergeStudents,
} from "../../lib/classDesk";
import type { JoinedStudent } from "../../lib/classDesk";
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

/** Sisselogitud õpetaja töölaud: proovi ise + klasside haldus. */
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
          <ClassesSection />
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

/**
 * QR-pilt liitumislingist. Tagastab koodi KOOS pildiga, et kutsuja saaks
 * kontrollida, kas pilt käib jooksva koodi kohta – QR valmib asünkroonselt
 * ja vahepeal võib kood juba vahetunud olla („Uuenda koodi").
 */
function useQrCode(code: string | undefined, width: number) {
  const [qr, setQr] = useState<{ code: string; url: string } | null>(null);

  useEffect(() => {
    if (!code) return;
    let active = true;
    QRCode.toDataURL(joinUrl(code, window.location.origin), { width, margin: 1 })
      .then((url) => {
        if (active) setQr({ code, url });
      })
      .catch(() => {
        // QR ei valminud – kood on ikka numbritena ekraanil, õpilane saab
        // selle käsitsi sisestada.
      });
    return () => {
      active = false;
    };
  }, [code, width]);

  return qr;
}

/** Klassi rida `classes` tabelist – ilma koodita, see EI OLE baasis. */
type ClassRow = { id: string; name: string; code_expires_at: string };

/** Klassikood on ainult mällu jäetud (see tuli üks kord loomisel/uuendamisel). */
type KnownCode = { code: string; expiresAt: string };

async function fetchClasses(): Promise<ClassRow[]> {
  const { data, error } = await supabase
    .from("classes")
    .select("id, name, code_expires_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Klassi loomine, klasside nimekiri ja koodi/QR kuvamine.
 *
 * Klassikoodi baasis EI OLE (ainult räsi) – seepärast elab avatekstis kood
 * ainult selle komponendi mälus, `codes` seisus, ja kaob lehe värskendamisel.
 * See on tahtlik: kui õpetaja tuleb tagasi, tuleb kood „Uuenda koodi" nupuga
 * uuesti tuua.
 */
function ClassesSection() {
  const [classes, setClasses] = useState<ClassRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [codes, setCodes] = useState<Record<string, KnownCode>>({});
  const [projectorClassId, setProjectorClassId] = useState<string | null>(
    null,
  );

  const reload = useCallback(() => {
    fetchClasses()
      .then((rows) => {
        setClasses(rows);
        setLoadError(null);
      })
      .catch(() => {
        setLoadError("Klasside laadimine ei õnnestunud. Proovi lehte värskendada.");
      });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  function handleCreated(row: ClassRow, code: string) {
    setClasses((prev) => [row, ...(prev ?? [])]);
    setCodes((prev) => ({
      ...prev,
      [row.id]: { code, expiresAt: row.code_expires_at },
    }));
  }

  function handleRotated(classId: string, expiresAt: string, code: string) {
    setClasses((prev) =>
      (prev ?? []).map((c) =>
        c.id === classId ? { ...c, code_expires_at: expiresAt } : c,
      ),
    );
    setCodes((prev) => ({ ...prev, [classId]: { code, expiresAt } }));
  }

  const projectorClass = classes?.find((c) => c.id === projectorClassId);
  const projectorCode = projectorClassId ? codes[projectorClassId] : undefined;

  return (
    <Card className="flex flex-col items-start gap-4">
      <div className="flex flex-col gap-1">
        <CardTitle>2. Klassid</CardTitle>
        <CardDescription>
          Klass annab klassikoodi, millega õpilased liituvad ilma kontota.
        </CardDescription>
      </div>

      <CreateClassForm onCreated={handleCreated} />

      {loadError ? (
        <p role="alert" className="text-ink">
          <strong className="text-retry">Ei õnnestunud.</strong> {loadError}
        </p>
      ) : null}

      {classes === null ? (
        <p className="text-ink-soft">Laen klasse …</p>
      ) : classes.length === 0 ? (
        <p className="text-ink-soft">Klasse ei ole veel loodud.</p>
      ) : (
        <ul className="flex w-full flex-col gap-3">
          {classes.map((klass) => (
            <li key={klass.id}>
              <ClassCard
                klass={klass}
                known={codes[klass.id]}
                onRotated={(expiresAt, code) =>
                  handleRotated(klass.id, expiresAt, code)
                }
                onShowProjector={() => setProjectorClassId(klass.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {projectorClass && projectorCode ? (
        <ProjectorView
          classId={projectorClass.id}
          className={projectorClass.name}
          code={projectorCode.code}
          onClose={() => setProjectorClassId(null)}
        />
      ) : null}
    </Card>
  );
}

function CreateClassForm({
  onCreated,
}: {
  onCreated: (row: ClassRow, code: string) => void;
}) {
  const fieldId = useId();
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setError("Anna klassile nimi, nt „8.a füüsika”.");
      return;
    }

    setSending(true);
    setError(null);

    const { data, error: invokeError } = await supabase.functions.invoke(
      "create_class_code",
      { body: { name: trimmed } },
    );

    if (invokeError) {
      setError(await classCodeErrorMessage(invokeError));
      setSending(false);
      return;
    }

    const result = data as {
      class_id: string;
      name: string;
      code: string;
      expires_at: string;
    };
    onCreated(
      { id: result.class_id, name: result.name, code_expires_at: result.expires_at },
      result.code,
    );
    setName("");
    setSending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor={fieldId} className="font-medium text-ink">
          Uue klassi nimi
        </label>
        <input
          id={fieldId}
          type="text"
          placeholder="nt 8.a füüsika"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-describedby={error ? `${fieldId}-viga` : undefined}
          aria-invalid={error ? true : undefined}
          className="min-h-11 w-full rounded-lg border border-line px-4 text-base text-ink placeholder:text-ink-soft"
        />
      </div>
      <Button type="submit" disabled={sending} className="shrink-0">
        {sending ? "Loon …" : "Loo klass"}
      </Button>
      {error ? (
        <p id={`${fieldId}-viga`} role="alert" className="w-full text-ink sm:basis-full">
          <strong className="text-retry">Ei õnnestunud.</strong> {error}
        </p>
      ) : null}
    </form>
  );
}

function ClassCard({
  klass,
  known,
  onRotated,
  onShowProjector,
}: {
  klass: ClassRow;
  known: KnownCode | undefined;
  onRotated: (expiresAt: string, code: string) => void;
  onShowProjector: () => void;
}) {
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // QR hoitakse koos koodiga, mille pealt ta tehti: nii ei jää koodi
  // uuendamise ja uue pildi valmimise vahele hetke, kus ekraanil on uus
  // number ja vana QR.
  const qr = useQrCode(known?.code, 320);

  async function handleRotate() {
    setRotating(true);
    setError(null);

    const { data, error: invokeError } = await supabase.functions.invoke(
      "create_class_code",
      { body: { class_id: klass.id } },
    );

    if (invokeError) {
      setError(await classCodeErrorMessage(invokeError));
      setRotating(false);
      return;
    }

    const result = data as { code: string; expires_at: string };
    onRotated(result.expires_at, result.code);
    setRotating(false);
  }

  async function handleCopy() {
    if (!known) return;
    try {
      await navigator.clipboard.writeText(known.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Lõikelaud pole saadaval (nt vana brauser) – kood on ikka ekraanil
      // näha ja käsitsi kopeeritav, seega vaikne vebamine piisab.
    }
  }

  return (
    <Card className="flex flex-col gap-3 bg-brand-soft/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle>{klass.name}</CardTitle>
        <span className="text-ink-soft">{formatExpiry(klass.code_expires_at)}</span>
      </div>

      {known ? (
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          {qr?.code === known.code ? (
            <img
              src={qr.url}
              alt={`QR-kood, mis avab liitumislehe koodiga ${known.code}`}
              className="size-40 rounded-lg border border-line bg-white p-2"
            />
          ) : null}
          <div className="flex flex-col gap-2">
            <p className="font-mono text-3xl tracking-widest text-ink">
              {known.code}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={handleCopy}>
                {copied ? "Kopeeritud!" : "Kopeeri kood"}
              </Button>
              <Button type="button" onClick={onShowProjector}>
                Näita klassile
              </Button>
              <Link to={`/opetaja/klass/${klass.id}`} className={buttonClasses("secondary")}>
                Klassi vaade
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <CardDescription>
          Kood ei ole enam ekraanil (see näidatakse ainult üks kord). Uuenda
          koodi, et saada uus.
        </CardDescription>
      )}

      <div>
        <Button type="button" variant="ghost" onClick={handleRotate} disabled={rotating}>
          {rotating ? "Uuendan …" : "Uuenda koodi"}
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-ink">
          <strong className="text-retry">Ei õnnestunud.</strong> {error}
        </p>
      ) : null}
    </Card>
  );
}

/**
 * Täisekraani projektorivaade: HIIGELSUUR QR + kood + liitunud õpilased
 * reaalajas. See on tunni alguse kriitiline hetk – tekst peab olema loetav
 * klassi tagant.
 */
function ProjectorView({
  classId,
  className,
  code,
  onClose,
}: {
  classId: string;
  className: string;
  code: string;
  onClose: () => void;
}) {
  const qr = useQrCode(code, 480);
  const [students, setStudents] = useState<JoinedStudent[]>([]);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    // students tabel peab olema Supabase Realtime publikatsioonis
    // (004_realtime_students.sql), muidu see kanal ei anna viga – ta lihtsalt
    // vaikib ja nimekiri ei täiene.
    const channel = supabase
      .channel(`classes:${classId}:students`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "students",
          filter: `class_id=eq.${classId}`,
        },
        (payload) => {
          const row = payload.new as JoinedStudent;
          setStudents((prev) => mergeStudents(prev, [row]));
        },
      )
      .subscribe((status) => {
        // Algseisu päring käib AINULT siis, kui kanal on päriselt kuulama
        // hakanud. `subscribe()` on asünkroonne: kohe pärast väljakutset ta
        // veel EI kuula. Kui päringu siis teha, jääb nende kahe vahele aken,
        // kus liituja ei jõua ei hetktõmmisesse ega kanalisse – ja kaob
        // projektorilt jäädavalt. Sellest järjekorrast sõltub, kas laps
        // näeb ennast ekraanil.
        if (status !== "SUBSCRIBED" || !active) return;

        void supabase
          .from("students")
          .select("id, display_name")
          .eq("class_id", classId)
          .then(({ data, error }) => {
            if (!active) return;
            if (error) {
              // Vaikne null oleks siin halvim vastus: õpetaja seisab klassi
              // ees ja usub, et keegi pole liitunud.
              setStudentsError(
                "Liitunute nimekirja ei õnnestunud laadida. Uued liitujad ilmuvad siia ikka.",
              );
              return;
            }
            setStudentsError(null);
            // LIIDAME olemasolevale, mitte ei kirjuta üle – kanal on juba
            // kuulanud ja võis mõne liituja lisada.
            setStudents((prev) => mergeStudents(prev, data));
          });
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [classId]);

  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  /**
   * Modaali klaviatuurikäitumine: Esc sulgeb, Tab jääb modaali sisse ja
   * fookus naaseb sulgemisel sinna nupule, millelt tuldi.
   *
   * Ilma fookuselõksuta rändab Tab nähtamatult modaali taha jäänud töölauale
   * – klaviatuuriga või ekraanilugejaga kasutaja satub siis vaatesse, mida
   * ta ei näe (docs/DISAINIJUHIS.md → Ligipääsetavus).
   */
  useEffect(() => {
    // Element, mis oli fookuses avamise hetkel – sinna tuleb tagasi minna.
    const openedFrom = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // Ringi otsad kokku: viimaselt edasi → esimene, esimeselt tagasi → viimane.
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      openedFrom?.focus();
    };
  }, [onClose]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex flex-col items-center gap-8 overflow-y-auto bg-white px-6 py-8"
    >
      <Button
        ref={closeRef}
        type="button"
        variant="ghost"
        onClick={onClose}
        className="self-end"
      >
        <X aria-hidden="true" className="size-6" />
        Sulge
      </Button>

      <h1
        id={titleId}
        className="text-center text-3xl font-semibold text-ink sm:text-5xl"
      >
        {className}
      </h1>

      {qr?.code === code ? (
        <img
          src={qr.url}
          alt={`QR-kood, mis avab liitumislehe koodiga ${code}`}
          className="w-full max-w-md rounded-2xl border border-line bg-white p-4"
        />
      ) : null}

      {/* Kaks teed sisse: QR neile, kelle kaamera töötab, ja käsitsi trükitav
          aadress neile, kellel mitte. Kumbki ei tohi olla ainus võimalus.
          Aadress on TÄPSELT see, mis QR-i sees – üks tõde, mitte kaks. */}
      <p className="text-center text-lg text-ink-soft sm:text-2xl">
        Ava telefonis:
      </p>
      {/* break-all: pikk aadress ei tohi projektoril ekraanilt välja joosta. */}
      <p className="break-all text-center font-mono text-2xl text-ink-soft sm:text-4xl">
        {joinUrl(code, window.location.host)}
      </p>

      {/* Kood eraldi ja KÕIGE SUUREM: kui laps on liitumislehe juba lahti
          saanud, on see ainus number, mida ta ekraanilt otsib. */}
      <p className="text-center text-lg text-ink-soft sm:text-2xl">
        Klassikood
      </p>
      <p className="font-mono text-6xl tracking-[0.2em] text-ink sm:text-8xl">
        {code}
      </p>

      <div className="flex w-full max-w-2xl flex-col items-center gap-3">
        <p className="text-xl text-ink-soft">
          Liitunud: {students.length}
        </p>

        {studentsError ? (
          <p role="alert" className="text-center text-lg text-ink">
            <strong className="text-retry">Ei õnnestunud.</strong>{" "}
            {studentsError}
          </p>
        ) : null}
        <ul className="flex flex-wrap justify-center gap-2">
          {students.map((student) => (
            <li
              key={student.id}
              className="rounded-full bg-brand-soft px-4 py-2 text-lg text-ink"
            >
              {student.display_name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
