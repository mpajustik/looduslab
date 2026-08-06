import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * Modaali klaviatuurikäitumine: Esc sulgeb, Tab jääb modaali sisse ja fookus
 * naaseb sulgemisel sinna, kust modaal avati.
 *
 * Ilma fookuselõksuta rändab Tab nähtamatult modaali taha jäänud lehele –
 * klaviatuuri või ekraanilugejaga kasutaja satub siis vaatesse, mida ta ei
 * näe (docs/DISAINIJUHIS.md → Ligipääsetavus).
 *
 * Miks eraldi hook: sama käitumist vajab nüüd kaks modaali – projektorivaade
 * (samm 2.8) ja klassi kustutamise kinnitus (samm 2.15). Kopeeritud
 * fookuselõks läheks varem või hiljem neis kahes kohas lahku ja ligipääsetavus
 * laguneks vaikselt just seal, kus keegi seda ei katsu.
 */
export function useDialogKeys({
  dialogRef,
  initialFocusRef,
  onClose,
}: {
  /** Element, mille sisse Tab peab jääma (role="dialog" konteiner). */
  dialogRef: RefObject<HTMLElement | null>;
  /** Kuhu fookus avamisel läheb. Kustutusdialoogis EI ole see hävitav nupp. */
  initialFocusRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}): void {
  useEffect(() => {
    // Element, mis oli fookuses avamise hetkel – sinna tuleb tagasi minna.
    const openedFrom = document.activeElement as HTMLElement | null;
    initialFocusRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // Ringi otsad kokku: viimaselt edasi → esimene, esimeselt tagasi → viimane.
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      // `isConnected`: nupp, millelt modaal avati, võib vahepeal kadunud
      // olla – täpselt nii juhtub klassi kustutamisel, kus kogu kaart lendab
      // nimekirjast välja. Kadunud elemendile `focus()` ei tee midagi ja
      // fookus jääks vaikselt lehe algusesse (CodeRabbiti leid, 2026-08-06).
      if (openedFrom?.isConnected) openedFrom.focus();
    };
    // initialFocusRef/dialogRef on stabiilsed ref-objektid – sõltuvuses on
    // ainult onClose, et vahetunud sulgeja ei jääks vanasse sulgemisse kinni.
  }, [dialogRef, initialFocusRef, onClose]);
}
