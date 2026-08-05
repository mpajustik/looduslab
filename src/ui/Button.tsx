import type { ComponentProps } from "react";
import { buttonClasses } from "./buttonStyles";
import type { ButtonSize, ButtonVariant } from "./buttonStyles";

/**
 * `ComponentProps<"button">`, mitte `ButtonHTMLAttributes` – esimene sisaldab
 * ka `ref`-i. React 19-s on ref tavaline prop (forwardRef't enam vaja ei ole)
 * ja seda läheb vaja igal pool, kus fookus tuleb koodist seada: projektori-
 * vaate modaal viib avamisel fookuse „Sulge" nupule.
 */
export type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
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
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}
