import type { SupabaseClient } from "@supabase/supabase-js";
import type { ModuleProgress } from "../engine/progress";
import {
  createProgressSync,
  type ProgressSyncHandle,
  type PushResult,
  type RemoteProgress,
} from "./progressSync";
import { classify, currentStudent, loadClient } from "./remoteSession";

/**
 * Õpilase edenemise kirjutamine Supabase'i (samm 2.11).
 *
 * Andmekuju on TÄPSELT sama, mis seadmes (src/engine/progress.ts) – muutub
 * ainult sihtkoht. Üks `attempts` rida moodulikäigu kohta, selle all
 * `responses` read (docs/ANDMEMUDEL.md).
 *
 * Iga saatmine on kogu käigu HETKESEIS, mitte muudatus: `upsert` kirjutab
 * rea üle. Nii on kordussaatmine kahjutu ja järjekord (progressSync.ts)
 * ei pea muudatusi õiges järjekorras hoidma.
 *
 * Klient, sessioonikontroll ja veaotsus elavad ./remoteSession.ts-is – neid
 * jagab meiega kordamiskaartide saatja (reviewRemote.ts).
 */

export function createSupabaseRemote(
  getClient: () => Promise<SupabaseClient> = loadClient,
): RemoteProgress {
  return {
    async push(progress: ModuleProgress, reset: boolean): Promise<PushResult> {
      const client = await getClient();
      const student = await currentStudent(client);
      if (!student.ok) return student.result;

      if (reset) {
        // Vahele jäänud „Alusta uuesti": vana käik peab kaduma ENNE uue
        // kirjutamist, muidu jäävad eelmise käigu vastused külge rippuma.
        const cleared = await deleteAttempt(client, student.id, progress.moduleId);
        if (cleared !== "ok") return cleared;
      }

      // `onConflict` on täpselt tabeli unique (student_id, module_id): üks
      // rida moodulikäigu kohta, mitte üks rida sammu kohta.
      const attempt = await client
        .from("attempts")
        .upsert(
          {
            student_id: student.id,
            module_id: progress.moduleId,
            module_version: progress.moduleVersion,
            status: progress.status,
            current_step: progress.currentStep,
            started_at: progress.startedAt,
            finished_at: progress.finishedAt,
          },
          { onConflict: "student_id,module_id" },
        )
        .select("id")
        .single();

      if (attempt.error) return classify(attempt.error, "Edenemise");

      const rows = Object.values(progress.responses)
        .filter((response) => response !== undefined)
        .map((response) => ({
          attempt_id: attempt.data.id as string,
          // Versioon tuleb VASTUSE pealt, mitte käigu pealt: käigu oma on
          // „viimati kasutatud" ja annaks vanale vastusele vale sildi
          // (docs/ANDMEMUDEL.md; andmebaasis valvab seda ka trigger).
          module_version: response.moduleVersion,
          step: response.step,
          question_id: response.questionId,
          payload: response.payload,
          is_correct: response.isCorrect,
          revised_count: response.revisedCount,
          // Muutmisel jääb sünniaeg alles (vt withAnswer) – nii ei näi
          // parandatud vastus õpetajale värskena.
          created_at: response.createdAt,
        }));

      if (rows.length === 0) return "ok";

      const responses = await client
        .from("responses")
        .upsert(rows, { onConflict: "attempt_id,question_id,module_version" });

      return responses.error ? classify(responses.error, "Edenemise") : "ok";
    },

    async remove(moduleId: string): Promise<PushResult> {
      const client = await getClient();
      const student = await currentStudent(client);
      if (!student.ok) return student.result;

      return deleteAttempt(client, student.id, moduleId);
    },
  };
}

/**
 * Moodulikäik serverist ära. Vastused kaovad kaasa – `responses.attempt_id`
 * on ON DELETE CASCADE. Rea puudumine EI OLE viga: kustutamine, mille kohta
 * serveris midagi ei ole, on juba tehtud.
 */
async function deleteAttempt(
  client: SupabaseClient,
  studentId: string,
  moduleId: string,
): Promise<PushResult> {
  const { error } = await client
    .from("attempts")
    .delete()
    .eq("student_id", studentId)
    .eq("module_id", moduleId);

  return error ? classify(error, "Edenemise") : "ok";
}

let shared: ProgressSyncHandle | null = null;

/**
 * Rakenduse ainus järjekord.
 *
 * Üks ühine, mitte üks mooduli kohta: siis proovib iga avatud moodul ka
 * eelmiste moodulite saatmata vastuseid uuesti teele saata. Loomise hetkel
 * käivitub esimene katse – just see toob kohale eile katkenud ühendusega
 * seadmesse jäänud vastused.
 */
export function sharedProgressSync(): ProgressSyncHandle {
  if (shared) return shared;

  const sync = createProgressSync(createSupabaseRemote());
  shared = sync;

  // Võrgu naasmine on ainus sündmus, mille peale tasub ise proovida. Muidu
  // ootaks saatmata vastus õpilase järgmist klõpsu – mida tunni lõpus enam
  // ei tule.
  if (typeof globalThis.addEventListener === "function") {
    globalThis.addEventListener("online", () => void sync.flush());
  }
  void sync.flush();

  return sync;
}
