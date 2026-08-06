import { cn } from "./cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "dangerGhost";
export type ButtonSize = "md" | "lg";

/**
 * Värvid tulevad semantilistest tokenitest (src/index.css), mitte teal-700-st.
 *
 * `danger` ja `dangerGhost` on olemas selleks, et hävitava nupu punast EI
 * pandaks `className`-iga peale: `cn` ei lahenda vastuolulisi Tailwindi
 * klasse (vt src/ui/cn.ts), seega `bg-brand` + `bg-retry` koos annaks selle
 * värvi, mis juhtub stiililehes tagapool olema. Kustutamise nupp, mis
 * renderdub tealina, on täpselt see viga, mida keegi ei märka enne, kui
 * keegi valesti klõpsab (Codexi leid, 2026-08-06).
 */
const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-strong",
  secondary: "border border-line bg-white text-ink hover:bg-brand-soft",
  ghost: "text-brand hover:bg-brand-soft",
  danger: "bg-retry text-white hover:bg-retry-strong",
  dangerGhost: "text-retry hover:bg-retry-soft",
};

/**
 * md = 44 px kõrge (min-h-11) – väikseim klikiala, mis sõrmega telefonis
 * töötab. lg on projektori/demo-režiimi jaoks (docs/DISAINIJUHIS.md).
 */
const SIZES: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 text-base",
  lg: "min-h-14 px-7 text-lg",
};

/**
 * Nupu klassid eraldi failis, et ka LINK saaks välja näha nupuna.
 * Linki <button> sisse panna EI tohi (vigane HTML): kui klõps viib teisele
 * lehele, on see alati <Link>, mis kannab neid klasse.
 */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150",
    "disabled:cursor-not-allowed disabled:opacity-60",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}
