/**
 * Progressiriba. `aria-hidden`, sest riba on ALATI kordus kõrvalseisvast
 * tekstist (nt "3/5 lõpetatud") – värv ega pikkus ei ole kunagi ainus
 * infokandja (docs/DISAINIJUHIS.md).
 */
export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-brand-soft">
      <div className="h-full rounded-full bg-brand" style={{ width: `${clamped}%` }} />
    </div>
  );
}
