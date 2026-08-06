import { useId, useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router";
import { Button } from "../../ui/Button";
import { Card, CardDescription, CardTitle } from "../../ui/Card";
import { PageHeader } from "../../ui/PageHeader";
import { supabase } from "../../lib/supabase";
import { classCodeErrorMessage, CLASS_CODE_NETWORK_ERROR } from "../../lib/classDesk";
import { safeNextPath } from "../../lib/shareLinks";
import { writeJoinedClass, writeStudentName } from "../../lib/studentIdentity";
import { isTeacherSession, useSession } from "../../lib/useSession";

type JoinResult = {
  class_id: string;
  class_name: string;
  display_name: string;
};

/**
 * /liitu/:kood – õpilase liitumisleht (samm 2.10).
 *
 * Laisalt laaditud (nagu TeacherPage, CLAUDE.md reegel 13): supabase-js
 * ei tohi kaasa tulla esilehe põhipaketiga, aga just see leht avaneb QR-i
 * skaneerides ehk esimese asjana õpilase telefonis.
 */
export default function JoinPage() {
  const { kood } = useParams<{ kood: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  // Kuhu pärast liitumist? Jagatud lingilt tulnu tahab TAGASI sellesse tundi,
  // mille pärast ta üldse tuli. Väärtus tuleb aadressiribalt, seega läbib ta
  // enne `safeNextPath` kontrolli (avatud ümbersuunamine – vt shareLinks.ts).
  const next = safeNextPath(params.get("edasi") ?? "") ?? "/kursus";
  const { status, session } = useSession();
  const fieldId = useId();
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!kood) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setError("Kirjuta oma eesnimi.");
      return;
    }

    setSending(true);
    setError(null);

    // Esimene külastaja sellel seadmel: anonüümne sessioon tekib alles
    // liitumise hetkel, mitte lehe avamisel – muidu koguneks Supabase'i
    // anonüümseid kasutajaid ka neist, kes lingi lihtsalt avasid ja lahkusid.
    if (!session) {
      const { error: signInError } = await supabase.auth.signInAnonymously();
      if (signInError) {
        setError(CLASS_CODE_NETWORK_ERROR);
        setSending(false);
        return;
      }
    }

    const { data, error: invokeError } = await supabase.functions.invoke(
      "join_class",
      { body: { code: kood, display_name: trimmed } },
    );

    if (invokeError) {
      setError(await classCodeErrorMessage(invokeError));
      setSending(false);
      return;
    }

    const result = data as JoinResult;
    writeStudentName(result.display_name);
    // Klassi märge seadmesse: nii ei küsi jagatud lingi värav (ModulePage)
    // sellelt õpilaselt enam koodi.
    writeJoinedClass(result.class_name);
    navigate(next, { replace: true });
  }

  const isTeacher = status === "ready" && isTeacherSession(session);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Liitu klassiga" lead={`Klassikood: ${kood}`} />

      {isTeacher ? (
        <Card>
          <CardDescription>
            See link on õpilastele. Sina oled sisse logitud õpetajana –
            liitumiseks õpilasena ava link brauseri privaatses aknas.
          </CardDescription>
        </Card>
      ) : (
        <Card className="flex flex-col gap-4">
          <CardTitle>Sisesta oma eesnimi</CardTitle>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label htmlFor={fieldId} className="font-medium text-ink">
              Eesnimi
            </label>
            <input
              id={fieldId}
              type="text"
              autoFocus
              placeholder="nt Mari"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-describedby={error ? `${fieldId}-viga` : undefined}
              aria-invalid={error ? true : undefined}
              className="min-h-11 w-full rounded-lg border border-line px-4 text-base text-ink placeholder:text-ink-soft"
            />
            <Button type="submit" disabled={sending || status === "loading"}>
              {sending ? "Liitun …" : "Liitu"}
            </Button>
            {error ? (
              <p id={`${fieldId}-viga`} role="alert" className="text-ink">
                <strong className="text-retry">Ei õnnestunud.</strong> {error}
              </p>
            ) : null}
          </form>
        </Card>
      )}
    </div>
  );
}
