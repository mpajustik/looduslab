import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReviewItem } from "../engine/review";
import type { PushResult } from "./progressSync";
import { classify, currentStudent, loadClient } from "./remoteSession";
import { createReviewSync, type RemoteReview, type ReviewSyncHandle } from "./reviewSync";

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
  return {
    async create(items: ReviewItem[]): Promise<PushResult> {
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

      // `ignoreDuplicates` teeb sellest „lisa, kui veel ei ole" (SQL: on
      // conflict do nothing). See EI OLE optimeerimine, vaid sisuline nõue:
      // olemasoleval real võib teine seade olla intervalli juba kolme
      // nädala peale kasvatanud ja tavaline upsert lükkaks selle tagasi
      // homsele. Hinnangu salvestamine (samm 3.2) on teine tehe ja tuleb
      // eraldi – seal kirjutatakse rida meelega üle.
      const { error } = await client
        .from("review_items")
        .upsert(rows, {
          onConflict: "student_id,module_id,card_id",
          ignoreDuplicates: true,
        });

      return error ? classify(error, "Kordamiskaartide") : "ok";
    },
  };
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
