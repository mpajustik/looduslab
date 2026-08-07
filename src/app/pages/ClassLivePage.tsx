import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { Card, CardTitle } from "../../ui/Card";
import { PageHeader } from "../../ui/PageHeader";
import { cn } from "../../ui/cn";
import { supabase } from "../../lib/supabase";
import { classActivity } from "../../lib/classDesk";
import type { ClassActivity, ClassAttempt } from "../../lib/classDesk";
import { moduleRegistry } from "../../modules/registry";
import ClassResponsesTab from "./ClassResponsesTab";

/** Nii tihti värskendame – piisavalt tihe, et tunni jooksul tunduda "elav". */
const POLL_INTERVAL_MS = 10_000;

type StudentRow = { id: string; display_name: string };

/**
 * Moodulikäik ühe õpilase kohta. `students!inner(class_id)` on ainult filtri
 * jaoks (attempts tabelis endas class_id veergu ei ole) – RLS-i
 * "attempts_read_teacher" reegel lubab õpetajal näha ainult oma klasside
 * õpilaste ridu, seega vale klassi id lihtsalt ei anna ühtegi rida.
 *
 * Toome NII pooleliolevad kui ka lõpetatud käigud: ainult 'started' ridadega
 * nägi lõpetanud õpilane välja nagu see, kes pole alustanudki.
 */
type AttemptRow = ClassAttempt & { student_id: string };

async function fetchStudents(classId: string): Promise<StudentRow[]> {
  const { data, error } = await supabase
    .from("students")
    .select("id, display_name")
    .eq("class_id", classId)
    .order("display_name");
  if (error) throw error;
  return data;
}

async function fetchAttempts(classId: string): Promise<AttemptRow[]> {
  const { data, error } = await supabase
    .from("attempts")
    .select(
      "student_id, module_id, current_step, status, started_at, finished_at, students!inner(class_id)",
    )
    .eq("students.class_id", classId);
  if (error) throw error;
  return data as unknown as AttemptRow[];
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

/**
 * `current_step` on sammu ID (nt "explore-2"), mitte järjekorranumber
 * (docs/ANDMEMUDEL.md „Miks attempts on moodulikäigu kohta") – number näitaks
 * vale sammu peale, kui mooduli sammude järjekord kunagi muutub. Numbriks
 * tõlgime alles siin, klassivaates.
 *
 * Tulemus on valmis lause õpilase rea jaoks (või `null`, kui mooduli info
 * ei laadinud – siis peab õpetajale jääma selge, et tegu on tehnilise veaga,
 * mitte tühja käiguga).
 */
function useActivityLabels(
  activities: Record<string, ClassActivity | null>,
): Record<string, string | null> {
  const [labels, setLabels] = useState<Record<string, string | null>>({});

  useEffect(() => {
    let active = true;
    const entries = Object.entries(activities).filter(
      (entry): entry is [string, ClassActivity] => entry[1] !== null,
    );
    const moduleIds = [...new Set(entries.map(([, a]) => a.moduleId))];

    Promise.all(
      moduleIds.map((moduleId) =>
        loadModuleSteps(moduleId)
          .then((info) => [moduleId, info] as const)
          .catch(() => [moduleId, null] as const),
      ),
    ).then((loaded) => {
      if (!active) return;
      const infoByModule = new Map(loaded);
      const next: Record<string, string | null> = {};

      for (const [studentId, activity] of entries) {
        const info = infoByModule.get(activity.moduleId);
        if (!info) {
          next[studentId] = null;
          continue;
        }

        if (activity.kind === "completed") {
          next[studentId] =
            activity.count > 1
              ? `Lõpetanud ${activity.count} tundi – viimati „${info.title}”`
              : `Lõpetanud: ${info.title}`;
          continue;
        }

        const index =
          activity.currentStep === null
            ? -1
            : info.stepIds.indexOf(activity.currentStep);
        const stepLabel =
          index === -1 ? "samm pooleli" : `samm ${index + 1}/${info.stepIds.length}`;
        next[studentId] = `${info.title} – ${stepLabel}`;
      }
      setLabels(next);
    });

    return () => {
      active = false;
    };
  }, [activities]);

  return labels;
}

/**
 * Õpetaja klassivaade: kes on liitunud ja mitmes samm kellelgi pooleli.
 * Uueneb iga 10 sekundi järel – lihtne poll, mitte realtime (kanalit ühe
 * lehe kohta hoida oleks üle jõu käiv keerukus MVP jaoks; 10 s on piisavalt
 * "elav", et õpetaja tunni jooksul näeks, kes on kinni jäänud).
 */
export default function ClassLivePage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<"elav" | "vastused">("elav");
  const [students, setStudents] = useState<StudentRow[] | null>(null);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
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
      Promise.all([fetchStudents(classId), fetchAttempts(classId)])
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

  // Rühmitame käigud õpilaste kaupa ja valime igaühelt selle, mis ekraanile
  // läheb (loogika ise on classDesk.ts-is, et olla testitav).
  const activities = useMemo(() => {
    const byStudent = new Map<string, ClassAttempt[]>();
    for (const attempt of attempts) {
      const list = byStudent.get(attempt.student_id);
      if (list) list.push(attempt);
      else byStudent.set(attempt.student_id, [attempt]);
    }
    const next: Record<string, ClassActivity | null> = {};
    for (const [studentId, list] of byStudent) {
      next[studentId] = classActivity(list);
    }
    return next;
  }, [attempts]);

  const labels = useActivityLabels(activities);

  return (
    <div className="flex flex-col gap-6">
      {/* Kollane riba: sama tähis mis kõikjal mujal õpetaja-alas. */}
      <p className="rounded-lg bg-teacher-soft px-4 py-3 text-teacher">
        Õpetaja ala
      </p>

      <PageHeader
        title="Klass"
        lead={
          tab === "elav"
            ? "Nimekiri uueneb iga 10 sekundi järel."
            : "Ennustused, selgitused ja väärarusaamad."
        }
      />

      <Link
        to="/opetaja"
        className="inline-flex min-h-11 w-fit items-center text-teacher underline"
      >
        ← Tagasi klasside juurde
      </Link>

      <div role="tablist" className="flex w-fit gap-1 rounded-lg border border-line bg-white p-1">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "elav"}
          onClick={() => setTab("elav")}
          className={cn(
            "min-h-11 rounded-md px-4 text-base font-medium",
            tab === "elav" ? "bg-teacher-soft text-teacher" : "text-ink-soft",
          )}
        >
          Elav vaade
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "vastused"}
          onClick={() => setTab("vastused")}
          className={cn(
            "min-h-11 rounded-md px-4 text-base font-medium",
            tab === "vastused" ? "bg-teacher-soft text-teacher" : "text-ink-soft",
          )}
        >
          Vastused
        </button>
      </div>

      {tab === "vastused" ? (
        // `key={id}` sunnib täieliku ümbermontaaži klassi vahetusel – ilma
        // selleta jääks eelmise klassi vastused hetkeks uue klassi pealkirja
        // alla nähtavaks, kuni uus päring jõuab kohale (CodeRabbiti leid).
        id ? <ClassResponsesTab key={id} classId={id} /> : null
      ) : (
        <>
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
                const activity = activities[student.id] ?? null;
                const label = labels[student.id];
                return (
                  <li key={student.id}>
                    <Card className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle>{student.display_name}</CardTitle>
                      <span className="text-ink-soft">
                        {activity === null
                          ? "Pole veel alustanud"
                          : label === undefined
                            ? "Laen …"
                            : label === null
                              ? "Mooduli andmeid ei õnnestunud laadida"
                              : label}
                      </span>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
