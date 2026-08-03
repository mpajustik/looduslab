/**
 * Turvaline ligipääs brauseri localStorage'ile.
 *
 * localStorage EI ole alati olemas: Safari privaatrežiim, blokeeritud
 * küpsised, serveris renderdamine, kettaruumi lõpp. Iga ligipääs võib visata
 * vea – ja katkine salvestus ei tohi kunagi tähendada valget ekraani keset
 * tundi. Seepärast käib kogu rakenduse salvestus siit kaudu.
 */

/** Ainult see osa Storage'ist, mida me päriselt kasutame – testis on fake. */
export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/**
 * Brauseri localStorage või `null`, kui teda ei saa kasutada.
 *
 * Olemasolust ei piisa: Safari privaatrežiimis on `localStorage` objekt
 * olemas, aga esimene `setItem` viskab vea. Seepärast proovime KIRJUTADA
 * ühe võtme ja kustutame ta kohe – nii saab kutsuja teada tõe enne, kui
 * õpilase vastus kaotsi läheb.
 */
export function browserStorage(): StorageLike | null {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return null;
    const probe = "looduslab:proov";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}
