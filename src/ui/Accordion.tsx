import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Akordion brauseri enda `<details>` elemendi peal.
 *
 * Miks mitte shadcn/ui (Radix) akordion? Sest `<details>`/`<summary>` ANNAB
 * ligipääsetavuse tasuta: klaviatuur (Tab + Enter/Space), ekraanilugeja
 * (teatab "ahendatud/avatud") ja lehesisene otsing (Ctrl+F leiab ka kinnise
 * ploki sisu) töötavad ilma ühegi realise JavaScriptita. Radixi akordion
 * tooks kaasa uue paketi ja ~10 kB, et jõuda samasse kohta.
 *
 * Kui kunagi on vaja "korraga avatud ainult üks" käitumist või animeeritud
 * kõrgust, siis tuleb see valik uuesti läbi vaadata – siis on Radixil sisu.
 */
export function AccordionItem({
  title,
  meta,
  children,
}: {
  title: ReactNode;
  /** Lühike olekutekst pealkirja kõrval, nt "Tulekul" või "3 tundi" */
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-line bg-white shadow-sm">
      {/* min-h-11 = 44 px klikiala ka siis, kui pealkiri on ühel real */}
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 rounded-2xl p-4 text-left [&::-webkit-details-marker]:hidden">
        <ChevronDown
          className="size-5 shrink-0 text-ink-soft transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
        <span className="flex-1 text-lg font-semibold text-ink">{title}</span>
        {meta ? (
          <span className="shrink-0 text-sm text-ink-soft">{meta}</span>
        ) : null}
      </summary>
      <div className="border-t border-line p-4 text-ink-soft">{children}</div>
    </details>
  );
}
