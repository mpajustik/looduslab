/**
 * Õpilase eesnimi ülariba jaoks (samm 2.10) ja liitumise olek selles seadmes
 * (samm 2.14).
 *
 * Nimi ei ole isikutuvastus – ta on ainult mugavus: „liitusid kui Mari"
 * asemel, et anonüümne sessioon tunduks isikupäratu. Andmebaasis elab
 * sama nimi juba `students.display_name` all; see siin on ainult
 * brauseripoolne koopia, mille kaotamine (Safari privaatrežiim,
 * localStorage puudub) ei riku midagi – nimi lihtsalt ei ilmu ülaribale.
 */
import type { StorageLike } from "./storage";
import { browserStorage } from "./storage";

const NAME_KEY = "looduslab:opilase-nimi";
const CLASS_KEY = "looduslab:klass";
const GUEST_KEY = "looduslab:kulaline";

export function readStudentName(storage: StorageLike | null = browserStorage()): string | null {
  if (!storage) return null;
  const value = storage.getItem(NAME_KEY);
  return value && value.trim().length > 0 ? value : null;
}

export function writeStudentName(
  name: string,
  storage: StorageLike | null = browserStorage(),
): void {
  if (!storage) return;
  storage.setItem(NAME_KEY, name);
}

/**
 * Kas selles seadmes on klassiga liitutud – ja kui ei ole, kas kasutaja on
 * juba öelnud „jätkan külalisena".
 *
 * TÕDE liitumise kohta on serveris (`students` rida). Siin on ainult
 * seadmepoolne märge, mille ainus ülesanne on otsustada, kas mooduli avamisel
 * KÜSIDA klassikoodi. Eksimise hind on mõlemat pidi väike: kadunud märge
 * tähendab üht lisaküsimust, mille saab „jätka külalisena" nupuga ära öelda.
 * Sellepärast ei ole siin võrgupäringut – jagatud link peab avanema kohe,
 * ilma supabase-js't alla laadimata (CLAUDE.md reegel 13).
 */
export type Membership = "joined" | "guest" | "unknown";

export function readMembership(
  storage: StorageLike | null = browserStorage(),
): Membership {
  if (!storage) return "unknown";
  // Klassinimi on samm 2.14 võti; nimi üksi tähendab enne seda sammu
  // liitunud õpilast, kellelt ei tohi nüüd tagantjärele koodi küsima hakata.
  if (storage.getItem(CLASS_KEY) || readStudentName(storage)) return "joined";
  if (storage.getItem(GUEST_KEY)) return "guest";
  return "unknown";
}

/** Liitumine õnnestus – klassi nimi jääb meelde, et seda saaks kuvada. */
export function writeJoinedClass(
  className: string,
  storage: StorageLike | null = browserStorage(),
): void {
  if (!storage) return;
  storage.setItem(CLASS_KEY, className);
  // Varasem „jätkan külalisena" ei tohi liitumise järel enam midagi öelda.
  storage.removeItem(GUEST_KEY);
}

/** Klassi nimi kuvamiseks, kui see on teada. */
export function readJoinedClass(
  storage: StorageLike | null = browserStorage(),
): string | null {
  if (!storage) return null;
  const value = storage.getItem(CLASS_KEY);
  return value && value.trim().length > 0 ? value : null;
}

/**
 * „Jätkan külalisena" – koodi enam ei küsita.
 *
 * Külalise töö jääb ainult sellesse seadmesse: serverisse ta ei jõua, sest
 * `students` rida puudub (docs/ANDMEMUDEL.md piirang 3).
 */
export function markGuest(storage: StorageLike | null = browserStorage()): void {
  if (!storage) return;
  storage.setItem(GUEST_KEY, "1");
}

/**
 * Külalise valik tagasi – õpilane tahab siiski klassikoodi sisestada.
 *
 * Ilma selleta oleks „jätkan külalisena" IGAVENE otsus: õpilane, kes valis
 * esimeses jagatud tunnis külalise, ei näeks kunagi enam koodiküsimist, ja
 * kogu tema edasine töö jääks vaikselt seadmesse – õpetaja klassivaates teda
 * lihtsalt ei oleks (Codexi ülevaatuse leid, 2026-08-06). Seepärast on
 * külalise olek nähtav ja alati tagasipööratav.
 */
export function clearGuest(storage: StorageLike | null = browserStorage()): void {
  if (!storage) return;
  storage.removeItem(GUEST_KEY);
}
