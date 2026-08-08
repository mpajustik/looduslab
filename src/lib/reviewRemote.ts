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
 * Kordamiskaartide kirjutamine Supabase'i (samm 3.1).
 *
 * Andmekuju on TÄPSELT sama, mis seadmes (src/engine/review.ts) – muutub
 * ainult sihtkoht. Üks `review_items` rida kaardi kohta (docs/ANDMEMUDEL.md).
 *
 * Kellel rida ei teki: külaline ilma sessioonita ja õpetaja oma seadmes
 * (`currentStudent` → `skipped`). Külalise kordamine jääb seadmesse – see on
 * teadlik otsus, sama mis edenemisel.
 */

export function createSupabaseReviewRemote(
  getClient: () => Promise<SupabaseClient> = loadClient,
): RemoteReview {
  /**
   * Mõlemal tehtel on sama päring – vahet teeb ainult `ignoreDuplicates`.
   *
   * `keepExisting: true` teeb sellest „lisa, kui veel ei ole" (SQL: on
   * conflict do nothing). See EI OLE optimeerimine, vaid sisuline nõue:
   * olemasoleval real võib teine seade olla intervalli juba kolme nädala
   * peale kasvatanud ja tavaline upsert lükkaks selle tagasi homsele.
   *
   * `keepExisting: false` kirjutab rea üle. Hindamise puhul on just see õige:
   * viimasena antud hinnang on kõige värskem teadmine õpilase mälust. Kuni
   * sammuni 3.6 võib see kaotada hinnangu, mille õpilane andis samal ajal
   * teises seadmes – seal hakkab võitma uuem `updated_at`.
   */
  async function write(items: ReviewItem[], keepExisting: boolean): Promise<PushResult> {
    if (items.length === 0) return "ok";

    const client = await getClient();
    const student = await currentStudent(client);
    if (!student.ok) return student.result;

    const rows = items.map((item) => ({
      student_id: student.id,
      module_id: item.moduleId,
      card_id: item.cardId,
      due_date: item.dueDate,
      interval_days: item.intervalDays,
      last_result: item.lastResult,
      updated_at: item.updatedAt,
    }));

    const { error } = await client.from("review_items").upsert(rows, {
      onConflict: "student_id,module_id,card_id",
      ignoreDuplicates: keepExisting,
    });

    return error ? classify(error, "Kordamiskaartide") : "ok";
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

  return {
    create: (items) => write(items, true),
    save: (items) => write(items, false),
    pull,
  };
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
