/**
 * Checkeri ühine vastus (CLAUDE.md reegel 3: õigsuse üle otsustab checker).
 *
 * Sama kuju kõigil küsimuseliikidel – nii ei pea vaade teadma, MIS liiki
 * küsimusele ta tagasisidet näitab, ja sammus 1.6 läheb salvestusse üks väli.
 */
export type CheckResult = {
  /**
   * `true`/`false` = hinnatud. `null` = EI HINNATA – kas küsimus ise ei ole
   * hinnatav (vabatekst) või ei saa vastust küsimusega kokku viia (katkine
   * moodul, vana vastus uue versiooni küljes). Vastab otse
   * `responses.is_correct` veerule (docs/ANDMEMUDEL.md), mis on samuti nullitav.
   *
   * Kontrolli ALATI `=== true` või `=== false`: `!result.correct` loeks
   * hindamata vastuse valeks ja õpilane saaks punase risti asja eest, mille
   * eest teda ei hinnatagi.
   */
  correct: boolean | null;
  /** Lause õpilasele – valmis kujul, vaade ei pane teda kokku. */
  feedback: string;
  /**
   * Väärarusaama silt (nt `nurk-pinna-suhtes`), kui vale vastus tabas
   * teadaolevat lõksu. See on ID õpetaja jaoks, MITTE tekst õpilasele –
   * õpilasele mõeldud lause on `feedback`.
   */
  misconception?: string;
};

/**
 * Vastus ja küsimus ei käi kokku, või vastus viitab variandile, mida küsimuses
 * ei ole. See on rakenduse, mitte õpilase viga – seepärast `null` (ei hinnata),
 * mitte `false`. Vale vastuse eest ei tohi karistada kedagi, kelle moodul
 * meie käe läbi vahetus.
 */
export const NOT_CHECKABLE: CheckResult = {
  correct: null,
  feedback: "Seda vastust ei õnnestunud kontrollida.",
};
