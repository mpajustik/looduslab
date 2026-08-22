import type { StepType } from "./contract";

/**
 * Kas ja millal tohib vale vastust parandada.
 *
 * Disainijuhis lubab: „Vale vastus ei karista: alati saab uuesti proovida"
 * (docs/DISAINIJUHIS.md „Turvatunne"). Kuni siiani lukustas esimene esitamine
 * vastuse KÕIGIL sammudel – kogemata tabatud vale variant lõpetas mõtlemise
 * ära ja ainus tee tagasi oli „Alusta uuesti", mis kustutab terve mooduli.
 *
 * Otsus tuleb SAMMUTÜÜBIST, mitte küsimuse lipust (plaan/MOODULILEHT-UX.md
 * samm 1). Põhjus: „kas siia tohib uuesti vastata" on pedagoogiline omadus,
 * mis kehtib terve sammu kohta – ennustust ei parandata sellepärast, et ta ON
 * ennustus, mitte sellepärast, et selle mooduli autor nii otsustas. Lipp
 * `activities.ts`-is tähendaks, et iga uus moodul saab sama otsuse uuesti
 * teha (ja ühel moodulil ununeb).
 *
 * Siin ei hinnata midagi – õigsus tuleb checkerilt (CLAUDE.md reegel 3). Need
 * on puhtad funktsioonid: sama sisend annab alati sama vastuse ja neid saab
 * testida ilma ekraanita.
 */

/**
 * Sammutüüp → kas vale vastust tohib parandada.
 *
 * `Record` (mitte hulk) on meelega: uus sammutüüp EI kompileeru enne, kui
 * keegi on siia otsuse kirjutanud. Vaikimisi „ei tohi" oleks vaikne vale
 * vastus – uus küsimustega samm käituks nagu ennustus.
 */
const RETRY_BY_STEP: Record<StepType, boolean> = {
  // Küsimustega sammud, kus vale vastus on osa õppimisest.
  precheck: true,
  explore: true,
  collect: true,
  practice: true,

  // Ennustus jääb lukku – TEADLIK otsus (plaan/ETAPP-1-moodulid.md samm 1.10).
  // Ennustust ei hinnata; „parandamine" tähendaks siin ennustuse tagantjärele
  // ümbertegemist, mis võtab explain-sammult tema võrdluse ära.
  predict: false,

  // Vabatekst, mida ei hinnata ja mida näeb õpetaja. Checker ütleb `null`,
  // seega ei ole siin „valet", mida parandada.
  explain: false,
  exit: false,

  // Küsimusteta sammud – siia ei jõua ükski vastus.
  theory: false,
  hook: false,
};

/** Kas selle sammutüübi vale vastust tohib uuesti proovida? */
export function allowsRetry(stepType: StepType): boolean {
  return RETRY_BY_STEP[stepType];
}

/**
 * Mida on ühe vastuse juures parasjagu näha.
 *
 * Kolm nuppu ei ole kolm sõltumatut lippu: „Näita vastust" ja teine katse
 * viivad mõlemad sama olekuni (õige vastus väljas), ja õige vastuse juures ei
 * ole neist ühtegi. Ühes funktsioonis on see nähtav ja testitav; kolme
 * `&&`-ahelana komponendi sees ei oleks.
 */
export type AnswerStage = {
  /** Näita nuppu „Proovi veel" (sisestus avaneb uuesti). */
  canTryAgain: boolean;
  /** Näita nuppu „Näita vastust". */
  canReveal: boolean;
  /** Õige vastus (`CheckResult.expected`) tohib nähtavale tulla. */
  showExpected: boolean;
};

export function answerStage(args: {
  /** `allowsRetry(step.type)` – kas see samm lubab parandamist. */
  retry: boolean;
  /** Checkeri otsus. `null` = ei hinnata. */
  correct: boolean | null;
  /** Mitu korda õpilane on sellele küsimusele vastanud (esitamata = 0). */
  attempts: number;
  /** Kas „Näita vastust" on juba vajutatud. */
  revealed: boolean;
}): AnswerStage {
  const { retry, correct, attempts, revealed } = args;

  // Parandamiseta samm käitub täpselt nagu enne: vale vastuse juures on õige
  // vastus kohe kirjas, sest teist katset ei tule.
  if (!retry) {
    return { canTryAgain: false, canReveal: false, showExpected: correct === false };
  }

  // Õige või hindamata vastus on valmis – „proovi veel" oleks siin ainult
  // kahtluse külvamine. `!== false` katab mõlemad, sh `null`-i: `!correct`
  // loeks hindamata vastuse valeks.
  if (correct !== false) {
    return { canTryAgain: false, canReveal: false, showExpected: false };
  }

  // Õige vastus paistab alles pärast TEIST katset või nupuvajutust: esimese
  // vale vastuse järel on ekraanil vihje ja uus katse, mitte lahendus.
  const showExpected = revealed || attempts >= 2;
  return {
    // Ka pärast vastuse nägemist – lukku ei panda kunagi (disainijuhis:
    // „alati saab uuesti proovida").
    canTryAgain: true,
    canReveal: !showExpected,
    showExpected,
  };
}
