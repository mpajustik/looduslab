/**
 * Õpilase kirjutatud teksti mõõtmine.
 *
 * Eraldi failis, sest sõnade lugemine on LOOGIKA, mis vajab testi – komponendi
 * sisse peidetuna jääks ta katmata. Sisu ennast siin ei hinnata: mida õpilane
 * kirjutas, otsustab õpetaja (CLAUDE.md reegel 3).
 */

/**
 * Mitu sõna tekstis on.
 *
 * „Sõna" = mis tahes tühikuteta jupp. Kirjavahemärki eraldi ei arvestata ja
 * sidekriipsuga sõna („väide–tõend") loeb üheks – nii ei jää õpilane
 * lugemistehnika taha kinni, kui ta sisu on olemas.
 */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}
