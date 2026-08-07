import { useState } from "react";
import { Clock } from "lucide-react";
import {
  devClockOffsetDays,
  resetDevClock,
  shiftDevClock,
} from "../lib/devClock";
import { Button } from "../ui/Button";

/**
 * Ajakerimise riba (plaani samm 3.5) – NÄHTAV AINULT ARENDUSES.
 *
 * Kolm otsust:
 *
 * 1. **Muudatuse järel laeb leht uuesti** (`location.reload`). Lehed loevad
 *    kordamisseisu üks kord avamisel (`useState`/`useEffect` – see on meelega
 *    nii, vt ReviewPage otsus 2), seega ei paneks uus kuupäev neid ümber
 *    arvutama. Reload on arendustööriistas ausam kui kella jagamine läbi
 *    konteksti, mida toodangus keegi ei kasuta.
 * 2. **Kolm sammu: +1, +7, nulli.** +1 katab „kas kaart tuleb homme", +7
 *    hüppab redelil (1 → 3 → 7 → 21) astme edasi ilma seitsme klõpsuta.
 *    Tagasi kerimist ei ole: nihke nullimine annab sama, ilma segaduseta.
 * 3. **Riba on all vasakul**, telefoni alumise navigatsiooniriba kohal
 *    (`bottom-20`), et ta ei kataks kunagi seda nuppu, mida parasjagu
 *    testitakse.
 *
 * Kutsuja (AppLayout) kontrollib `devClockAvailable` – nii ei jõua ka see
 * fail toodangu bundle'isse.
 */
export function DevClockPanel() {
  const [offset, setOffset] = useState(devClockOffsetDays);

  const shift = (days: number) => {
    setOffset(shiftDevClock(days));
    window.location.reload();
  };

  const reset = () => {
    resetDevClock();
    setOffset(0);
    window.location.reload();
  };

  return (
    <aside
      aria-label="Arenduse ajakerimine"
      className="fixed bottom-20 left-4 z-20 flex flex-col gap-2 rounded-xl border border-line bg-white/95 p-3 shadow-lg sm:bottom-4"
    >
      <p className="flex items-center gap-2 text-sm font-medium text-ink">
        <Clock aria-hidden="true" className="size-4" />
        {offset === 0 ? "Aeg: päris" : `Aeg: ${offsetLabel(offset)}`}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => shift(1)}>
          +1 päev
        </Button>
        <Button variant="secondary" onClick={() => shift(7)}>
          +7 päeva
        </Button>
        <Button variant="ghost" onClick={reset} disabled={offset === 0}>
          Nulli
        </Button>
      </div>
    </aside>
  );
}

/**
 * „+1 päev", aga „+7 päeva". Miinusmärgi paneb `offset` ise – nihe saab
 * negatiivne olla ainult käsitsi muudetud salvestusest, aga siis peab riba
 * seda ausalt näitama.
 */
function offsetLabel(offset: number): string {
  const sign = offset > 0 ? "+" : "";
  return `${sign}${offset} ${Math.abs(offset) === 1 ? "päev" : "päeva"}`;
}
