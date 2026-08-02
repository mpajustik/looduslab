import { BookOpen, GraduationCap, Repeat, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Navigatsioon on AINULT siin – ülariba (töölaud) ja alumine riba (telefon)
 * loevad mõlemad seda loendit, nii ei saa need omavahel lahku minna.
 *
 * Reegel disainijuhisest: maksimaalselt 4 valikut. Kui tekib soov viies
 * lisada, tuleb enne midagi ära võtta.
 */
export type NavItem = {
  to: string;
  /** Pikk silt ülaribale */
  label: string;
  /** Lühike silt telefoni alumisele ribale (mahub 360 px laiusele) */
  shortLabel: string;
  icon: LucideIcon;
  /** Õpetaja-ala on ALATI kollane (docs/DISAINIJUHIS.md) */
  teacher?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { to: "/kursus", label: "Kursus", shortLabel: "Kursus", icon: BookOpen },
  {
    to: "/kordamine",
    label: "Kordamine",
    shortLabel: "Kordamine",
    icon: Repeat,
  },
  {
    to: "/edenemine",
    label: "Minu edenemine",
    shortLabel: "Edenemine",
    icon: TrendingUp,
  },
  {
    to: "/opetaja",
    label: "Õpetajale",
    shortLabel: "Õpetaja",
    icon: GraduationCap,
    teacher: true,
  },
];
