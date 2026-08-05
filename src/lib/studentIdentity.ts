/**
 * Õpilase eesnimi ülariba jaoks (samm 2.10).
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
