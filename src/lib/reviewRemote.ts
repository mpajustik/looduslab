import type { SupabaseClient } from "@supabase/supabase-js";
import { isReviewItem, type ReviewItem } from "../engine/review";
import type { PushResult } from "./progressSync";
import { classify, currentStudent, loadClient } from "./remoteSession";
import {
  createReviewSync,
  type PullResult,
  type RemoteReview,
  type ReviewSyncHandle,
} from "./reviewSync";

/**
 * Kordamiskaardid Supabase'i ja tagasi (sammud 3.1 ja 3.6).
 *
 * Andmekuju on TÄPSELT sama, mis seadmes (src/engine/review.ts) – muutub
 * ainult sihtkoht. Üks `review_items` rida kaardi kohta (docs/ANDMEMUDEL.md).
 *
 * Kolm tehet ja igaühel oma põhjus (tabel: docs/ANDMEMUDEL.md):
 *
 * - `create` – upsert „lisa, kui veel ei ole";
 * - `save` – `rpc('save_review_items')`, kus võidab uuem `updated_at`;
 * - `pull` – tavaline `select` oma ridade pealt.
 *
 * Kellel rida ei teki: külaline ilma sessioonita ja õpetaja oma seadmes
 * (`currentStudent` → `skipped`). Külalise kordamine jääb seadmesse – see on
 * teadlik otsus, sama mis edenemisel.
 */

export function createSupabaseReviewRemote(
  getClient: () => Promise<SupabaseClient> = loadClient,
): RemoteReview {
  /** Kaardi kuju serveri veerunimedega. `student_id` lisab kutsuja. */
  function toRow(item: ReviewItem) {
    return {
      module_id: item.moduleId,
      card_id: item.cardId,
      due_date: item.dueDate,
      interval_days: item.intervalDays,
      last_result: item.lastResult,
      updated_at: item.updatedAt,
    };
  }

  /**
   * UUS kaart: „lisa, kui veel ei ole" (SQL: on conflict do nothing).
   *
   * See EI OLE optimeerimine, vaid sisuline nõue: olemasoleval real võib
   * teine seade olla intervalli juba kolme nädala peale kasvatanud ja
   * tavaline upsert lükkaks selle tagasi homsele.
   */
  async function create(items: ReviewItem[]): Promise<PushResult> {
    if (items.length === 0) return "ok";

    const client = await getClient();
    const student = await currentStudent(client);
    if (!student.ok) return student.result;

    const { error } = await client.from("review_items").upsert(
      items.map((item) => ({ student_id: student.id, ...toRow(item) })),
      { onConflict: "student_id,module_id,card_id", ignoreDuplicates: true },
    );

    return error ? classify(error, "Kordamiskaartide") : "ok";
  }

  /**
   * HINNATUD kaart: läheb `rpc`-ga, mitte upsertiga (samm 3.6b).
   *
   * Miks mitte tavaline upsert: ta kirjutab rea üle TINGIMUSETA. Kaks
   * seadet, sama kaart – telefonis kell 10:00 „Teadsin", arvutis 09:55 „Ei
   * mäletanud". Kui arvuti päring viibib võrgus ja jõuab kohale hiljem,
   * kaob õpilase viimane hinnang. Seadmepoolne liitmine
   * (`incomingReviewItems`) seda ei päästa, sest konflikt tekib SERVERIS.
   *
   * Tingimuse „ainult siis, kui minu `updated_at` on uuem" hoiab
   * `public.save_review_items` (supabase/migrations/006_review_save.sql) –
   * PostgREST-i upsertile sellist tingimust anda ei saa.
   *
   * `student_id` EI ole päringus: funktsioon võtab ta sessioonist. Nii ei
   * ole kliendil võimalustki kirjutada kellegi teise nimel.
   */
  async function save(items: ReviewItem[]): Promise<PushResult> {
    if (items.length === 0) return "ok";

    const client = await getClient();
    // Kontroll jääb ka siin alles, kuigi funktsioon viskaks sessioonita vea:
    // külaline ja õpetaja peavad saama `skipped`, mitte igavesti korduva
    // `retry`. Vea järgi neid eristada ei saa (vt `classify`).
    const student = await currentStudent(client);
    if (!student.ok) return student.result;

    const { error } = await client.rpc("save_review_items", {
      p_items: items.map(toRow),
    });

    return error ? classify(error, "Kordamishinnangu") : "ok";
  }

  /**
   * Kõik selle õpilase kaardid serverist (samm 3.6).
   *
   * `student_id` on päringus KIRJAS, kuigi RLS lubaks niikuinii ainult enda
   * ridu: nii kasutab Postgres indeksit `review_items_due_idx` ja päring ei
   * sõltu sellest, et keegi ei ole poliitikat kunagi lõdvemaks teinud.
   *
   * Ridade arv on väike (kaartide arv = läbitud moodulid × 3–10), seega
   * loeme kõik korraga – ka tulevikus ootel olevad. Ainult tänaseid lugedes
   * jääks teises seadmes kasvanud intervall siia kunagi jõudmata.
   */
  async function pull(): Promise<PullResult> {
    const client = await getClient();
    const student = await currentStudent(client);
    // `skipped` (külaline, õpetaja) vs `retry` (katkine seansisalvestus) –
    // `currentStudent` eristab neid juba, ära kaota seda vahet ära: esimene
    // on tavaline seis, teisest peab õpilane teada saama.
    if (!student.ok) return { ok: false, reason: student.result };

    const { data, error } = await client
      .from("review_items")
      .select("module_id, card_id, due_date, interval_days, last_result, updated_at")
      .eq("student_id", student.id);

    if (error) {
      // `classify` logib ja ütleb „retry" – lugemisel on see alati õige
      // vastus: rida ei kao kuhugi, järgmine avamine proovib uuesti.
      return { ok: false, reason: classify(error, "Kordamiskaartide") };
    }

    // Server on siin VÕÕRAS andmed täpselt samamoodi nagu localStorage:
    // vana kuju, käsitsi muudetud rida, tulevane veerg. Katkine rida jäetakse
    // ÜKSHAAVAL kõrvale, et ta ei võtaks kaasa kõiki teisi.
    const items: ReviewItem[] = [];
    for (const row of data ?? []) {
      const item = {
        moduleId: row.module_id,
        cardId: row.card_id,
        dueDate: row.due_date,
        intervalDays: row.interval_days,
        lastResult: row.last_result,
        // Postgres annab `2026-08-07T10:00:00+00:00`, seade kirjutab
        // `...Z`. Ühtlustame kohe siin, et seadmes oleks üks kuju –
        // võrdlus ise käib niikuinii arvuna (`incomingReviewItems`).
        updatedAt: toIsoString(row.updated_at),
      };
      if (isReviewItem(item)) items.push(item);
    }
    return { ok: true, items };
  }

  return { create, save, pull };
}

/**
 * Serveri ajatempel seadme kujule. Loetamatu jääb muutmata – siis kukub rida
 * `isReviewItem`-i kontrollis välja, mitte ei muutu vaikselt „Invalid Date"-ks.
 */
function toIsoString(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : value;
}

let shared: ReviewSyncHandle | null = null;

/**
 * Rakenduse ainus kordamisjärjekord – sama muster, mis `sharedProgressSync`.
 *
 * Loomise hetkel käivitub esimene katse: just see toob kohale eile katkenud
 * ühendusega seadmesse jäänud kaardid.
 */
export function sharedReviewSync(): ReviewSyncHandle {
  if (shared) return shared;

  const sync = createReviewSync(createSupabaseReviewRemote());
  shared = sync;

  if (typeof globalThis.addEventListener === "function") {
    globalThis.addEventListener("online", () => void sync.flush());
  }
  void sync.flush();

  return sync;
}
