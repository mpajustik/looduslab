import type { LucideIcon } from "lucide-react";
import { cn } from "./cn";

/**
 * Väike olekumärgis: alati ikoon + tekst koos, mitte kunagi ainult värv
 * (docs/DISAINIJUHIS.md – "värv pole kunagi ainus infokandja").
 *
 * `tone` kasutab AINULT olemasolevaid semantilisi tokeneid (src/index.css
 * `@theme`), mitte otse Tailwindi värvinimesid – nii jääb DISAINIJUHIS
 * ainsaks kohaks, kust värvitähendus muutub.
 */
const TONE_CLASSES = {
  neutral: "bg-ink-soft/10 text-ink-soft",
  brand: "bg-brand-soft text-brand",
  info: "bg-info-soft text-info",
  correct: "bg-correct-soft text-correct",
} as const;

export function Badge({
  icon: Icon,
  label,
  tone,
  className,
}: {
  icon: LucideIcon;
  label: string;
  tone: keyof typeof TONE_CLASSES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium",
        TONE_CLASSES[tone],
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      {label}
    </span>
  );
}
