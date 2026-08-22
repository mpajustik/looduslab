import { Check, CloudOff, RefreshCw } from "lucide-react";
import type { SaveState } from "../lib/progressSync";

/**
 * „Salvestatud ✓" – kas õpilase töö jõuab õpetajani (MOODULILEHT-UX samm 2).
 *
 * Telefonis vastav õpilane ei näe muidu ühtegi märki sellest, et vastus
 * kuskile jõudis. Riba on väike ja rahulik: ta on kinnitus, mitte teade.
 *
 * **Veateadet siin ei ole.** Katkine võrk EI OLE õpilase viga ja punane
 * hoiatus keset tundi ainult ehmataks – vastus on seadmes alles ja läheb
 * teele, kui võrk taastub (src/lib/progressSync.ts). Seepärast on kolmas
 * seis „Salvestan, kui võrk taastub", mitte „Salvestamine ebaõnnestus".
 */
export function SaveNotice({ state }: { state: SaveState }) {
  // `unknown` – veel ei ole midagi salvestada; `off` – seda tööd ei salvestatagi
  // (külaline, õpetaja eelvaade). Lubadus, mida täita ei saa, on hullem kui vaikus.
  if (state === "unknown" || state === "off") return null;

  const { Icon, text, spin } = NOTICES[state];

  return (
    // `role="status"` ütleb ekraanilugejale muudatuse rahulikult, katkestamata.
    <p role="status" className="flex items-center gap-2 text-sm text-ink-soft">
      <Icon
        aria-hidden="true"
        className={`size-4 shrink-0${spin ? " motion-safe:animate-spin" : ""}`}
      />
      {text}
    </p>
  );
}

const NOTICES = {
  saved: { Icon: Check, text: "Salvestatud", spin: false },
  saving: { Icon: RefreshCw, text: "Salvestan …", spin: true },
  waiting: { Icon: CloudOff, text: "Salvestan, kui võrk taastub", spin: false },
} as const satisfies Record<
  Exclude<SaveState, "unknown" | "off">,
  { Icon: typeof Check; text: string; spin: boolean }
>;
