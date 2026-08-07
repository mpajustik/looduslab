import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { PushResult } from "./progressSync";

/**
 * Ühine osa kõigist serverisse kirjutajatest: KES me oleme ja mida veaga teha.
 *
 * Kirjutajaid on kaks – edenemine (progressRemote.ts) ja kordamiskaardid
 * (reviewRemote.ts). Kui kummalgi oleks oma sessioonikontroll, saaks neist
 * ühel päeval kaks eri reeglit: üks kirjutaks õpetaja seadmest, teine mitte.
 * Sama reegel elab andmebaasi pool RLS-is – liides ja andmebaas peavad
 * ütlema sama (docs/ANDMEMUDEL.md).
 */

/**
 * Supabase'i klient tuleb kohale alles siis, kui on midagi saata.
 *
 * See `import()` on siin MEELEGA (CLAUDE.md reegel 13): supabase-js on
 * ~200 kB ja moodulileht ei tohi seda esilehe bundle'iga kaasa tirida.
 */
let client: Promise<SupabaseClient> | null = null;

export function loadClient(): Promise<SupabaseClient> {
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

export type StudentCheck = { ok: true; id: string } | { ok: false; result: PushResult };

/**
 * Kelle nimel me kirjutame.
 *
 * Kirjutame AINULT anonüümse sessiooni nimel: õpilane on anonüümne
 * auth-kasutaja (samm 2.10). Sisselogitud õpetajal ei ole `students` rida,
 * seega tema seadmes läbi proovitud moodul ei tohi üldse serverisse minna –
 * muidu põrkaks iga saatmine võõrvõtme vastu. Sama kontroll on RLS-i pool
 * `public.is_teacher_account()`.
 */
export async function currentStudent(client: SupabaseClient): Promise<StudentCheck> {
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
 * Andmebaasi viga EI VISKA rida kunagi ära – ta läheb alati uuesti teele.
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
 * PÄRISELT teame: külaline ilma sessioonita ja õpetaja oma seadmes.
 *
 * Hind: kirjutamatu rida jääb järjekorda ja iga klõps proovib teda uuesti.
 * See on üks tühi päring, mitte kadunud vastus – õige pool eksida.
 */
export function classify(error: PostgrestError, what: string): PushResult {
  // Jälg konsooli (ja sealt Sentrysse, samm 2.17): kirjutamatu rida proovib
  // nüüd igavesti uuesti ja ilma selle reata ei saaks keegi teada, MIKS ta
  // ei õnnestu. Õpilase vastust siia EI panda – see on isikuandmed.
  console.warn(`${what} salvestamine ebaõnnestus:`, error.code, error.message);
  return "retry";
}
