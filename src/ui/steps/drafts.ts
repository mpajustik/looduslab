import { createContext, useContext, useState } from "react";

/**
 * Pooleli mustandid: see, mis on kirjutatud, aga veel esitamata.
 *
 * Miks eraldi hoidla: StepShell näitab korraga ÜHT sammu ja annab sellele iga
 * kord uue `key` – tagasi ja edasi liikudes sisestuskomponent hävib ja tema
 * oma olek koos sellega. Ilma selleta kaotas õpilane pooleli kirjutatud
 * selgituse iga kord, kui käis mõõtmisi üle vaatamas (katsetus 2026-08-04).
 *
 * Mustandid elavad AINULT mälus (Map komponendi olekus, mitte engine'is ega
 * localStorage'is): esitamata tekst ei ole vastus ega tohi jõuda salvestusse –
 * nii jääb ka preview-režiim kirjutamisvabaks (CLAUDE.md reegel 14). Lehe
 * värskendamisel nad kaovad, esitatud vastused mitte.
 */
export const DraftContext = createContext<Map<string, unknown> | null>(null);

/**
 * Hoidla StepShelli jaoks. `resetKey` ütleb, millal mustandid kaovad: sama
 * hetk, mil kaovad ka vastused (teine moodul või „Alusta uuesti").
 *
 * Map elab olekus, mitte ref-is – ref-i ei tohi renderdamise ajal lugeda ja
 * context vajab väärtust just siis.
 */
export function useDraftStore(resetKey: string) {
  const [store, setStore] = useState(() => ({
    key: resetKey,
    drafts: new Map<string, unknown>(),
  }));

  if (store.key !== resetKey) {
    setStore({ key: resetKey, drafts: new Map() });
  }

  return store.drafts;
}

/**
 * Mustand ühele küsimusele. Nagu `useState`, aga väärtus elab sammu vahetust üle.
 *
 * `restore` teisendab hoidlast tulnud väärtuse õigeks kujuks – hoidla ise ei
 * tea küsimuseliikidest midagi, seega teab kuju ainult sisestuskomponent.
 */
export function useDraft<T>(key: string, restore: (saved: unknown) => T) {
  const store = useContext(DraftContext);
  const [value, setValue] = useState<T>(() => restore(store?.get(key)));

  return [
    value,
    (next: T) => {
      setValue(next);
      store?.set(key, next);
    },
  ] as const;
}
