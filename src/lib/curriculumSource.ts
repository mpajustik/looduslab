import markdown from "../../sisu/AINEKAVA-fyysika-8.md?raw";
import { parseCurriculum, type CurriculumBlock } from "./curriculum";
import { teataViga } from "./seire";

/**
 * Ainekava fail rakenduse sees (samm 4.0b).
 *
 * Miks `?raw` ja mitte käsitsi TS-i kirjutatud koopia: sisu/AINEKAVA-fyysika-8.md
 * on ainekava AINUS tõe allikas (CLAUDE.md „Viited"). Koopia läheks esimese
 * ainekava paranduse järel vaikselt lahku ja õpetaja loeks ekraanilt teksti,
 * mida ainekavas enam ei ole. Fail on ~14 kB ja teda impordib ainult õpetaja
 * ala, mis on niikuinii laisalt laaditud (App.tsx) – õpilase esilehele see
 * ei jõua (reegel 13).
 *
 * Parsimine käib alles esimesel küsimisel ja tulemus jääb meelde: see on
 * sama fail kogu lehe eluea jooksul.
 */
let cached: CurriculumBlock[] | null = null;

/**
 * Ainekava plokid – või tühi loend, kui fail on katki.
 *
 * Parser viskab meelega vea (vt curriculum.ts), aga õpetaja ala EI TOHI
 * selle pärast valgeks minna: ainekava seos on lisainfo, mitte lehe mõte.
 * Tühja loendiga näitab vaade ikka manifesti ID-d, lihtsalt ilma
 * ainekava tekstita. Päris viga püüab kinni `npm run coverage`, mis sama
 * faili sama parseriga läbi loeb ja väljumiskoodiga 1 lõpetab.
 */
export function curriculumBlocks(): CurriculumBlock[] {
  if (cached !== null) return cached;

  try {
    cached = parseCurriculum(markdown);
  } catch (error) {
    teataViga(error, "ainekava parsimine");
    cached = [];
  }

  return cached;
}
