export type ClassValue = string | false | null | undefined;

/**
 * Liidab klassinimed üheks stringiks ja jätab välja tühjad väärtused.
 * Nii saab kirjutada `cn("p-4", isActive && "bg-brand-soft", className)`.
 *
 * Oma 15 rida `clsx` + `tailwind-merge` asemel (CLAUDE.md reegel 4).
 * Erinevus originaalist: see EI lahenda vastuolulisi Tailwindi klasse
 * (`p-4` + `p-8` korral võidab see, mis on Tailwindi stiililehes tagapool,
 * mitte see, mis on siin viimane). Kokkulepe: komponendile antud `className`
 * on ainult PAIGUTUSE jaoks (mx-auto, w-full, mt-4) – värvi ja polsterdust
 * muuda komponendi enda variandiga, mitte ülekirjutamisega.
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter((value): value is string => Boolean(value)).join(" ");
}
