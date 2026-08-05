import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { ModuleProgress } from "../engine/progress";
import {
  createProgressSync,
  type ProgressSyncHandle,
  type PushResult,
  type RemoteProgress,
} from "./progressSync";

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
 */

/**
 * Supabase'i klient tuleb kohale alles siis, kui on midagi saata.
 *
 * See `import()` on siin MEELEGA (CLAUDE.md reegel 13): supabase-js on
 * ~200 kB ja moodulileht ei tohi seda esilehe bundle'iga kaasa tirida.
 * Külalise seadmes laaditakse ta esimese vastuse peale taustal alla ja
 * saadetakse siis minema (`skipped`) – ekraani see ei peata.
 */
let client: Promise<SupabaseClient> | null = null;

function loadClient(): Promise<SupabaseClient> {
  client ??= import("./supabase").then(
    (module) => module.supabase,
    (error: unknown) => {
      // Ebaõnnestunud allalaadimine EI TOHI vahemällu jääda: chunki toomine
      // luhtub just kehva võrguga, ehk täpselt siis, kui järjekord peaks
      // tööle hakkama. Vahemällu jäänud tagasilükatud lubadus tähendaks, et
      // ükski hilisem saatmine ei proovi enam kunagi – kuni lehe
      // värskendamiseni (CodeRabbiti ülevaatuse leid).
      client = null;
      throw error;
    },
  );
  return client;
}

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

      if (attempt.error) return classify(attempt.error);

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

      return responses.error ? classify(responses.error) : "ok";
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

  return error ? classify(error) : "ok";
}

type StudentCheck = { ok: true; id: string } | { ok: false; result: PushResult };

/**
 * Kelle nimel me kirjutame.
 *
 * Kirjutame AINULT anonüümse sessiooni nimel: õpilane on anonüümne
 * auth-kasutaja (samm 2.10). Sisselogitud õpetajal ei ole `students` rida,
 * seega tema seadmes läbi proovitud moodul ei tohi üldse serverisse minna –
 * muidu põrkaks iga saatmine võõrvõtme vastu. Sama kontroll on RLS-i pool
 * `public.is_teacher_account()` – liides ja andmebaas peavad ütlema sama.
 */
async function currentStudent(client: SupabaseClient): Promise<StudentCheck> {
  const { data, error } = await client.auth.getSession();
  // Katkine seansisalvestus või võrguviga tokeni uuendamisel: proovime hiljem
  // uuesti, mitte ei viska vastust minema.
  if (error) return { ok: false, result: "retry" };

  const session = data.session;
  if (!session) return { ok: false, result: "skipped" };
  if (session.user.is_anonymous !== true) return { ok: false, result: "skipped" };

  return { ok: true, id: session.user.id };
}

/**
 * Andmebaasi viga EI VISKA vastust kunagi ära – ta läheb alati uuesti teele.
 *
 * Kiusatus on veakoodi järgi otsustada „seda rida ei saa siia kunagi
 * kirjutada", aga koodid seda ei erista. Võõrvõti `23503` tähendab kas
 * „õpilane ei ole ühegi klassiga liitunud" (jäädav) VÕI „moodulit ei ole
 * veel `modules` tabelis, sest sync-modules on käivitamata" (paraneb ise
 * ära) – ja teisel juhul kaoks vastus vaikselt: õpilane näeb teda oma
 * seadmes, õpetaja klassivaatesse ta enam kunagi ei jõua (ülevaatuse leid,
 * mille tõid nii Codex kui CodeRabbit).
 *
 * Ainus jäädav „ära saada" tuleb `currentStudent`-ist, kus me sessiooni
 * PÄRISELT teame: külaline ilma sessioonita ja õpetaja oma seadmes. Oletamine
 * jääb sinna, kus oletada ei ole vaja.
 *
 * Hind: kirjutamatu rida jääb järjekorda ja iga klõps proovib teda uuesti.
 * See on üks tühi päring, mitte kadunud vastus – õige pool eksida.
 */
function classify(error: PostgrestError): PushResult {
  // Jälg konsooli (hiljem Sentrysse, samm 2.17): kirjutamatu rida proovib
  // nüüd igavesti uuesti ja ilma selle reata ei saaks keegi teada, MIKS ta
  // ei õnnestu. Õpilase vastust siia EI panda – see on isikuandmed.
  console.warn("Edenemise salvestamine ebaõnnestus:", error.code, error.message);
  return "retry";
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
