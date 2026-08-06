import { useEffect, useState } from "react";
import { Card, CardTitle } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { supabase } from "../../lib/supabase";
import { moduleRegistry, type LoadedModule } from "../../modules/registry";
import { checkAnswer } from "../../checker";
import { parseRaw } from "../../checker/number";
import { resolveSteps } from "../../engine/resolve";
import { stepQuestions } from "../../engine/contract";
import type { Question, StepType } from "../../engine/contract";
import type { AnswerPayload } from "../../engine/answers";

type ResponseRow = {
  attempt_id: string;
  module_version: string;
  question_id: string;
  payload: AnswerPayload;
  is_correct: boolean | null;
  created_at: string;
  attempts: {
    module_id: string;
    students: { id: string; display_name: string };
  };
};

async function fetchClassResponses(classId: string): Promise<ResponseRow[]> {
  const { data, error } = await supabase
    .from("responses")
    .select(
      "attempt_id, module_version, question_id, payload, is_correct, created_at, attempts!inner(module_id, students!inner(id, display_name, class_id))",
    )
    .eq("attempts.students.class_id", classId);
  if (error) throw error;
  return data as unknown as ResponseRow[];
}

/** Ainult MAJOR loeb (docs/MOODULILEPING.md „Versioonimine") – patch ja minor ei lõhu koondit. */
function majorVersion(version: string): number {
  return Number(version.split(".")[0]);
}

const moduleCache = new Map<string, Promise<LoadedModule | null>>();

function loadModule(moduleId: string): Promise<LoadedModule | null> {
  let cached = moduleCache.get(moduleId);
  if (!cached) {
    const load = moduleRegistry[moduleId];
    cached = load ? load() : Promise.resolve(null);
    // Ebaõnnestunud laadimine ei jää igavesti vahemällu, samal põhjusel mis
    // ClassLivePage'is: võrguviga on ajutine, „Värskenda" peab saama uuesti proovida.
    cached.catch(() => moduleCache.delete(moduleId));
    moduleCache.set(moduleId, cached);
  }
  return cached;
}

/** Üks vastus, tõlgituna küsimuse ja mooduli konteksti. */
type ResponseInfo = {
  studentId: string;
  studentName: string;
  moduleId: string;
  moduleTitle: string;
  major: number;
  stepType: StepType;
  questionId: string;
  /**
   * Resolveeritud küsimus (arvvariandi puhul konkreetse variandi arvudega) –
   * sama funktsioon, mida kasutab õpilase enda ekraan (src/engine/resolve.ts),
   * et vale vastuse väärarusaama silt tuvastuks ka variantküsimustel.
   */
  question: Question;
  answer: AnswerPayload;
  /**
   * Õigsus tuleb SALVESTATUD väärtusest, mitte siin uuesti arvutatust
   * (CLAUDE.md reegel 3: õigsuse üle otsustab checker, mitte vaade – ja
   * checker on selle juba moodulikäigu ajal otsustanud).
   */
  correct: boolean | null;
  /** checkAnswer'i taasarvutus on siin AINULT väärarusaama sildi jaoks. */
  misconception: string | undefined;
  /**
   * Millal see konkreetne rida salvestati – vajalik ainult dedup'iks
   * (vt `dedupeByStudentAndQuestion`), mitte kuvamiseks.
   */
  createdAt: string;
};

function describeResponse(mod: LoadedModule, row: ResponseRow): ResponseInfo | null {
  const { steps } = resolveSteps(mod.activities.steps, 0, {
    [row.question_id]: row.payload.variantId,
  });
  for (const step of steps) {
    const question = stepQuestions(step).find((q) => q.id === row.question_id);
    if (!question) continue;
    return {
      studentId: row.attempts.students.id,
      studentName: row.attempts.students.display_name,
      moduleId: row.attempts.module_id,
      moduleTitle: mod.manifest.title,
      major: majorVersion(row.module_version),
      stepType: step.type,
      questionId: row.question_id,
      question,
      answer: row.payload,
      correct: row.is_correct,
      misconception: checkAnswer(question, row.payload).misconception,
      createdAt: row.created_at,
    };
  }
  // Küsimus on kadunud (major-muudatus eemaldas ta) – vana vastus ei mahu
  // enam ühegi praeguse sammu alla, seega ei saa teda kuvada.
  return null;
}

/**
 * Sama õpilase kaks vastust samale küsimusele (patch/minor tõstis
 * `module_version`-i vastuste vahel, seega tekkis salvestusse UUS rida,
 * mitte üle kirjutatud vana – vt src/lib/progressRemote.ts `onConflict`)
 * loevad muidu koondis kaheks vastanuks. Alles jääb kõige VÄRSKEM
 * (Codexi ülevaatuse leid, /ulevaatus samm 2.13).
 */
function dedupeByStudentAndQuestion(infos: ResponseInfo[]): ResponseInfo[] {
  const latest = new Map<string, ResponseInfo>();
  for (const info of infos) {
    const key = `${info.moduleId}:${info.major}:${info.studentId}:${info.questionId}`;
    const existing = latest.get(key);
    if (!existing || info.createdAt > existing.createdAt) latest.set(key, info);
  }
  return [...latest.values()];
}

function formatAnswer(question: Question, answer: AnswerPayload): string {
  if (answer.kind === "numeric") {
    const unit = question.kind === "numeric" ? question.unit : undefined;
    // Kui õpilane tipib ühiku ise kaasa ("9,8 kPa"), ei tohi seda veel kord
    // juurde lisada – muidu näeks õpetaja "9,8 kPa kPa" (Codexi ülevaatuse leid).
    const hasOwnUnit = (parseRaw(answer.raw)?.unit ?? "") !== "";
    return unit && !hasOwnUnit ? `${answer.raw} ${unit}` : answer.raw;
  }
  if (answer.kind === "choice") {
    if (question.kind !== "choice") return answer.optionIds.join(", ");
    return answer.optionIds
      .map((id) => question.options.find((option) => option.id === id)?.text ?? id)
      .join(", ");
  }
  if (answer.kind === "text") return answer.text;
  return "(mõõtetabel)";
}

type RecallPair = {
  /**
   * KÕIK selle sammu küsimused, kus `recallQuestion` elab – mitte ainult
   * meelde tuletatav küsimus üksi. Ennustus-sammus on tihti ka teine
   * küsimus („Miks sa nii arvad?"), mis muidu jääks vaatest täiesti välja
   * (Codexi ülevaatuse leid, /ulevaatus samm 2.13).
   */
  predictQuestionIds: string[];
  explainStepId: string;
  explainQuestionIds: string[];
};

/** Ennustus-samm(ud), mida mõni explain-samm hiljem meelde tuletab. */
function recallPairs(mod: LoadedModule): RecallPair[] {
  const pairs: RecallPair[] = [];
  for (const step of mod.activities.steps) {
    if (step.type === "explain" && step.recallQuestion) {
      const predictStep = mod.activities.steps.find((candidate) =>
        stepQuestions(candidate).some((question) => question.id === step.recallQuestion),
      );
      pairs.push({
        predictQuestionIds: predictStep
          ? stepQuestions(predictStep).map((question) => question.id)
          : [step.recallQuestion],
        explainStepId: step.id,
        explainQuestionIds: stepQuestions(step).map((question) => question.id),
      });
    }
  }
  return pairs;
}

type ModuleGroupKey = string;

function groupKey(moduleId: string, major: number): ModuleGroupKey {
  return `${moduleId}::${major}`;
}

/**
 * Klassivaate „Vastused" sakk (samm 2.13): ennustused ↔ lõppselgitused,
 * väljumispiletid ja valede vastuste koond väärarusaamade siltidega.
 *
 * Ei uuene automaatselt (erinevalt elavast vaatest) – õpetaja vaatab seda
 * pärast tundi, mitte tunni ajal, ja „Värskenda" nupp piisab.
 */
export default function ClassResponsesTab({ classId }: { classId: string }) {
  const [infos, setInfos] = useState<ResponseInfo[] | null>(null);
  const [modules, setModules] = useState<Record<string, LoadedModule>>({});
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    fetchClassResponses(classId)
      .then(async (rows) => {
        const moduleIds = [...new Set(rows.map((row) => row.attempts.module_id))];
        const loaded = await Promise.all(
          moduleIds.map(async (id) => [id, await loadModule(id)] as const),
        );
        if (!active) return;
        const byId: Record<string, LoadedModule> = {};
        for (const [id, mod] of loaded) if (mod) byId[id] = mod;

        const described: ResponseInfo[] = [];
        for (const row of rows) {
          const mod = byId[row.attempts.module_id];
          if (!mod) continue;
          const info = describeResponse(mod, row);
          if (info) described.push(info);
        }
        setModules(byId);
        setInfos(dedupeByStudentAndQuestion(described));
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError("Vastuseid ei õnnestunud laadida.");
      });
    return () => {
      active = false;
    };
  }, [classId, reloadToken]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="secondary" onClick={() => setReloadToken((n) => n + 1)}>
          Värskenda
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-ink">
          <strong className="text-retry">Ei õnnestunud.</strong> {error}
        </p>
      ) : null}

      {infos === null ? (
        <p className="text-ink-soft">Laen vastuseid …</p>
      ) : infos.length === 0 ? (
        <Card>
          <p className="text-ink-soft">Selles klassis ei ole veel ühtegi vastust.</p>
        </Card>
      ) : (
        <ModuleGroups infos={infos} modules={modules} />
      )}
    </div>
  );
}

function ModuleGroups({
  infos,
  modules,
}: {
  infos: ResponseInfo[];
  modules: Record<string, LoadedModule>;
}) {
  const majorsByModule = new Map<string, Set<number>>();
  for (const info of infos) {
    const set = majorsByModule.get(info.moduleId) ?? new Set<number>();
    set.add(info.major);
    majorsByModule.set(info.moduleId, set);
  }

  const groups = new Map<ModuleGroupKey, ResponseInfo[]>();
  for (const info of infos) {
    const key = groupKey(info.moduleId, info.major);
    const list = groups.get(key) ?? [];
    list.push(info);
    groups.set(key, list);
  }

  const sortedKeys = [...groups.keys()].sort((a, b) => a.localeCompare(b));

  return (
    <div className="flex flex-col gap-8">
      {sortedKeys.map((key) => {
        const groupInfos = groups.get(key);
        if (!groupInfos) return null;
        const first = groupInfos[0];
        if (!first) return null;
        const mod = modules[first.moduleId];
        const hasMultipleMajors = (majorsByModule.get(first.moduleId)?.size ?? 1) > 1;
        return (
          <section key={key} className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-ink">
              {first.moduleTitle}
              {hasMultipleMajors ? ` — versioon ${first.major}.x` : ""}
            </h2>
            {hasMultipleMajors ? (
              <p className="text-sm text-ink-soft">
                Selles klassis on eri versioonide vastuseid – need on eraldi näidatud,
                sest õige vastus või küsimus muutus vahepeal (major-muudatus).
              </p>
            ) : null}

            {mod ? <PredictVsExplain mod={mod} infos={groupInfos} /> : null}
            <ExitTickets infos={groupInfos} />
            <WrongAnswerSummary infos={groupInfos} />
          </section>
        );
      })}
    </div>
  );
}

function PredictVsExplain({ mod, infos }: { mod: LoadedModule; infos: ResponseInfo[] }) {
  const pairs = recallPairs(mod);
  if (pairs.length === 0) return null;

  const byStudentAndQuestion = new Map<string, ResponseInfo>();
  for (const info of infos) byStudentAndQuestion.set(`${info.studentId}:${info.questionId}`, info);

  const studentNames = new Map<string, string>();
  for (const info of infos) studentNames.set(info.studentId, info.studentName);

  return (
    <Card className="flex flex-col gap-4">
      <CardTitle>Ennustused ja lõppselgitused</CardTitle>
      {pairs.map((pair) => {
        const rows = [...studentNames.entries()]
          .map(([studentId, studentName]) => {
            const predictions = pair.predictQuestionIds
              .map((questionId) => byStudentAndQuestion.get(`${studentId}:${questionId}`))
              .filter((info): info is ResponseInfo => info !== undefined);
            const explanations = pair.explainQuestionIds
              .map((questionId) => byStudentAndQuestion.get(`${studentId}:${questionId}`))
              .filter((info): info is ResponseInfo => info !== undefined);
            if (predictions.length === 0 && explanations.length === 0) return null;
            return { studentId, studentName, predictions, explanations };
          })
          .filter((row): row is NonNullable<typeof row> => row !== null);

        if (rows.length === 0) return null;

        return (
          <div key={pair.explainStepId} className="flex flex-col gap-2">
            <ul className="flex flex-col gap-2">
              {rows.map((row) => (
                <li key={row.studentId} className="rounded-lg border border-line p-3">
                  <p className="font-medium text-ink wrap-break-word">{row.studentName}</p>
                  <p className="text-ink-soft wrap-break-word">
                    Ennustas:{" "}
                    {row.predictions.length > 0
                      ? row.predictions
                          .map((info) => formatAnswer(info.question, info.answer))
                          .join(" · ")
                      : "–"}
                  </p>
                  <p className="text-ink-soft wrap-break-word">
                    Selgitas:{" "}
                    {row.explanations.length > 0
                      ? row.explanations
                          .map((info) => formatAnswer(info.question, info.answer))
                          .join(" · ")
                      : "–"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </Card>
  );
}

function ExitTickets({ infos }: { infos: ResponseInfo[] }) {
  const exitInfos = infos.filter((info) => info.stepType === "exit");
  if (exitInfos.length === 0) return null;

  const byStudent = new Map<string, ResponseInfo[]>();
  for (const info of exitInfos) {
    const list = byStudent.get(info.studentId) ?? [];
    list.push(info);
    byStudent.set(info.studentId, list);
  }

  return (
    <Card className="flex flex-col gap-4">
      <CardTitle>Väljumispiletid</CardTitle>
      <ul className="flex flex-col gap-3">
        {[...byStudent.entries()].map(([studentId, answers]) => (
          <li key={studentId} className="rounded-lg border border-line p-3">
            <p className="font-medium text-ink wrap-break-word">{answers[0]?.studentName}</p>
            <ul className="flex flex-col gap-1">
              {answers.map((info) => (
                <li key={info.questionId} className="text-ink-soft wrap-break-word">
                  {info.question.prompt} — {formatAnswer(info.question, info.answer)}
                  {info.correct === true ? " ✓" : info.correct === false ? " ✗" : ""}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function WrongAnswerSummary({ infos }: { infos: ResponseInfo[] }) {
  // Väärarusaam on mõistlik ainult hinnatavatel liikidel (docs/MOODULILEPING.md) –
  // vabatekst ja mõõtetabel ei tea misconception-silte.
  const gradable = infos.filter(
    (info) => info.question.kind === "numeric" || info.question.kind === "choice",
  );
  if (gradable.length === 0) return null;

  const byQuestion = new Map<string, ResponseInfo[]>();
  for (const info of gradable) {
    const list = byQuestion.get(info.questionId) ?? [];
    list.push(info);
    byQuestion.set(info.questionId, list);
  }

  const rows = [...byQuestion.entries()]
    .map(([questionId, questionInfos]) => {
      const graded = questionInfos.filter((info) => info.correct !== null);
      const wrong = graded.filter((info) => info.correct === false);
      if (wrong.length === 0) return null;

      const misconceptionCounts = new Map<string, number>();
      let unlabelled = 0;
      for (const info of wrong) {
        if (info.misconception) {
          misconceptionCounts.set(
            info.misconception,
            (misconceptionCounts.get(info.misconception) ?? 0) + 1,
          );
        } else {
          unlabelled += 1;
        }
      }

      return {
        questionId,
        prompt: questionInfos[0]?.question.prompt ?? questionId,
        wrongCount: wrong.length,
        totalCount: graded.length,
        misconceptionCounts,
        unlabelled,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => b.wrongCount / b.totalCount - a.wrongCount / a.totalCount);

  if (rows.length === 0) return null;

  return (
    <Card className="flex flex-col gap-4">
      <CardTitle>Kus läks valesti</CardTitle>
      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <li key={row.questionId} className="rounded-lg border border-line p-3">
            <p className="font-medium text-ink">{row.prompt}</p>
            <p className="text-ink-soft">
              {row.wrongCount} valesti {row.totalCount} vastanust
            </p>
            {row.misconceptionCounts.size > 0 || row.unlabelled > 0 ? (
              <ul className="mt-1 flex flex-wrap gap-2">
                {[...row.misconceptionCounts.entries()].map(([misconception, count]) => (
                  <li
                    key={misconception}
                    className="rounded-full bg-teacher-soft px-3 py-1 text-sm text-teacher"
                  >
                    {misconception} × {count}
                  </li>
                ))}
                {row.unlabelled > 0 ? (
                  <li className="rounded-full bg-line px-3 py-1 text-sm text-ink-soft">
                    muu × {row.unlabelled}
                  </li>
                ) : null}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </Card>
  );
}
