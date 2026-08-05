import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Card, CardTitle } from "../../ui/Card";
import { PageHeader } from "../../ui/PageHeader";
import { supabase } from "../../lib/supabase";
import { moduleRegistry } from "../../modules/registry";

/** Nii tihti värskendame – piisavalt tihe, et tunni jooksul tunduda "elav". */
const POLL_INTERVAL_MS = 10_000;

type StudentRow = { id: string; display_name: string };

/**
 * Käimasolev moodulikäik ühe õpilase kohta. `students!inner(class_id)` on
 * ainult filtri jaoks (attempts tabelis endas class_id veergu ei ole) –
 * RLS-i "attempts_read_teacher" reegel lubab õpetajal näha ainult oma
 * klasside õpilaste ridu, seega vale klassi id lihtsalt ei anna ühtegi rida.
 */
type ActiveAttemptRow = {
  student_id: string;
  module_id: string;
  current_step: string;
};

async function fetchStudents(classId: string): Promise<StudentRow[]> {
  const { data, error } = await supabase
    .from("students")
    .select("id, display_name")
    .eq("class_id", classId)
    .order("display_name");
  if (error) throw error;
  return data;
}

async function fetchActiveAttempts(classId: string): Promise<ActiveAttemptRow[]> {
  const { data, error } = await supabase
    .from("attempts")
    .select("student_id, module_id, current_step, students!inner(class_id)")
    .eq("students.class_id", classId)
    .eq("status", "started");
  if (error) throw error;
  return data as unknown as ActiveAttemptRow[];
}

/** Mooduli pealkiri + sammu-id-de järjestus. Laaditakse laisalt, üks kord mooduli kohta. */
const moduleStepsCache = new Map<
  string,
  Promise<{ title: string; stepIds: string[] }>
>();

function loadModuleSteps(moduleId: string) {
  let cached = moduleStepsCache.get(moduleId);
  if (!cached) {
    const load = moduleRegistry[moduleId];
    cached = load
      ? load().then((mod) => ({
          title: mod.manifest.title,
          stepIds: mod.activities.steps.map((step) => step.id),
        }))
      : Promise.reject(new Error(`Tundmatu moodul registris: ${moduleId}`));
    // Ebaõnnestunud laadimine EI jää vahemällu: võrguviga on ajutine ja
    // järgmine poll (10 s pärast) peab saama uuesti proovida, mitte igavesti
    // sama tõrjutud promise'i tagasi saada.
    cached.catch(() => moduleStepsCache.delete(moduleId));
    moduleStepsCache.set(moduleId, cached);
  }
  return cached;
}

type StepProgress =
  | { kind: "progress"; title: string; stepLabel: string }
  | { kind: "error" };

/**
 * `current_step` on sammu ID (nt "explore-2"), mitte järjekorranumber
 * (docs/ANDMEMUDEL.md „Miks attempts on moodulikäigu kohta") – number näitaks
 * vale sammu peale, kui mooduli sammude järjekord kunagi muutub. Numbriks
 * tõlgime alles siin, klassivaates.
 */
function useStepProgress(
  attempts: ActiveAttemptRow[],
): Record<string, StepProgress> {
  const [progress, setProgress] = useState<Record<string, StepProgress>>({});

  useEffect(() => {
    let active = true;
    const moduleIds = [...new Set(attempts.map((a) => a.module_id))];

    Promise.all(
      moduleIds.map((moduleId) =>
        loadModuleSteps(moduleId)
          .then((info) => [moduleId, info] as const)
          .catch(() => [moduleId, null] as const),
      ),
    ).then((entries) => {
      if (!active) return;
      const infoByModule = new Map(entries);
      const next: Record<string, StepProgress> = {};

      for (const attempt of attempts) {
        const info = infoByModule.get(attempt.module_id);
        if (!info) {
          // Vaikimisi "Pole veel alustanud" oleks siin eksitav – õpilane ON
          // alustanud, aga mooduli info ei laadinud. Õpetajale peab jääma
          // selge, et tegu on tehnilise veaga, mitte tühja käiguga.
          next[attempt.student_id] = { kind: "error" };
          continue;
        }
        const index = info.stepIds.indexOf(attempt.current_step);
        next[attempt.student_id] = {
          kind: "progress",
          title: info.title,
          stepLabel:
            index === -1 ? "samm pooleli" : `samm ${index + 1}/${info.stepIds.length}`,
        };
      }
      setProgress(next);
    });

    return () => {
      active = false;
    };
  }, [attempts]);

  return progress;
}

/**
 * Õpetaja klassivaade: kes on liitunud ja mitmes samm kellelgi pooleli.
 * Uueneb iga 10 sekundi järel – lihtne poll, mitte realtime (kanalit ühe
 * lehe kohta hoida oleks üle jõu käiv keerukus MVP jaoks; 10 s on piisavalt
 * "elav", et õpetaja tunni jooksul näeks, kes on kinni jäänud).
 */
export default function ClassLivePage() {
  const { id } = useParams<{ id: string }>();
  const [students, setStudents] = useState<StudentRow[] | null>(null);
  const [attempts, setAttempts] = useState<ActiveAttemptRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const classId = id;
    let active = true;
    // Kui üks poll venib (aeglane võrk), ei tohi tema hilinenud vastus üle
    // kirjutada juba jõudnud värskemat tulemust – seepärast käib igal
    // väljakutsel oma järjekorranumber ja vana tulemus visatakse ära.
    let latestRequestId = 0;

    function reload() {
      const requestId = ++latestRequestId;
      Promise.all([fetchStudents(classId), fetchActiveAttempts(classId)])
        .then(([studentRows, attemptRows]) => {
          if (!active || requestId !== latestRequestId) return;
          setStudents(studentRows);
          setAttempts(attemptRows);
          setError(null);
        })
        .catch(() => {
          if (!active || requestId !== latestRequestId) return;
          setError(
            "Klassi vaadet ei õnnestunud värskendada. Proovime uuesti 10 sekundi pärast.",
          );
        });
    }

    reload();
    const timer = setInterval(reload, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [id]);

  const stepProgress = useStepProgress(attempts);

  return (
    <div className="flex flex-col gap-6">
      {/* Kollane riba: sama tähis mis kõikjal mujal õpetaja-alas. */}
      <p className="rounded-lg bg-teacher-soft px-4 py-3 text-teacher">
        Õpetaja ala
      </p>

      <PageHeader
        title="Klassi elav vaade"
        lead="Nimekiri uueneb iga 10 sekundi järel."
      />

      <Link
        to="/opetaja"
        className="inline-flex min-h-11 w-fit items-center text-teacher underline"
      >
        ← Tagasi klasside juurde
      </Link>

      {error ? (
        <p role="alert" className="text-ink">
          <strong className="text-retry">Ei õnnestunud.</strong> {error}
        </p>
      ) : null}

      {students === null ? (
        <p className="text-ink-soft">Laen klassi …</p>
      ) : students.length === 0 ? (
        <Card>
          <p className="text-ink-soft">
            Selles klassis ei ole veel ühtegi õpilast liitunud.
          </p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {students.map((student) => {
            const progress = stepProgress[student.id];
            return (
              <li key={student.id}>
                <Card className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle>{student.display_name}</CardTitle>
                  <span className="text-ink-soft">
                    {!progress
                      ? "Pole veel alustanud"
                      : progress.kind === "progress"
                        ? `${progress.title} – ${progress.stepLabel}`
                        : "Mooduli andmeid ei õnnestunud laadida"}
                  </span>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
