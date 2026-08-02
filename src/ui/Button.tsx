import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

/** Värvid tulevad semantilistest tokenitest (src/index.css), mitte teal-700-st. */
const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-strong",
  secondary: "border border-line bg-white text-ink hover:bg-brand-soft",
  ghost: "text-brand hover:bg-brand-soft",
};

/**
 * md = 44 px kõrge (min-h-11) – väikseim klikiala, mis sõrmega telefonis
 * töötab. lg on projektori/demo-režiimi jaoks (docs/DISAINIJUHIS.md).
 */
const SIZES: Record<Size, string> = {
  md: "min-h-11 px-5 text-base",
  lg: "min-h-14 px-7 text-lg",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
