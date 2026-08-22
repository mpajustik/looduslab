import type { Step } from "./contract";
import { stepQuestions } from "./contract";

/**
 * Õpilase vastus ühele küsimusele.
 *
 * Kuju on TAHTLIKULT sama, mis läheb hiljem `responses.payload` jsonb-veergu
 * (docs/ANDMEMUDEL.md) – nii ei pea sammus 1.6 (localStorage) ega etapis 2
 * (Supabase) andmekuju ümber tegema. Diskrimineeriv väli `kind` on sama, mis
 * küsimusel: nii saab checker (sammud 1.4–1.5) vastuse ja küsimuse kokku viia
 * ilma arvamata.
 *
 * `numeric.raw` on õpilase tipitud TEKST, mitte arv: „2,5 m" peab jõudma
 * checkerini muutmata, sest just tema teab, kuidas koma ja ühikut lugeda
 * (CLAUDE.md reegel 3 – õigsust ei otsusta kunagi vaade).
 */
export type AnswerPayload = AnswerValue & {
  /**
   * MILLISE variandiga küsimusele see vastus anti (`activities.ts` `variants`,
   * valiku teeb src/engine/resolve.ts). Puudub, kui küsimusel variante ei ole.
   *
   * Ilma selleta ei tea õpetaja koondvaade, mille kohta vastus käib: „55" on
   * õige 35-kraadise variandi juures ja vale 20-kraadise juures. Salvestuses
   * elab ta `payload`-i sees, mitte omaette veerus – `responses.payload` on
   * just selle jaoks jsonb (docs/ANDMEMUDEL.md „küsimuste struktuur muutub,
   * tabel mitte").
   */
  variantId?: string;
};

/** Vastuse sisu liigi kaupa – see osa käib küsimuse `kind`-iga kokku. */
type AnswerValue =
  | { kind: "numeric"; raw: string }
  | { kind: "choice"; optionIds: string[] }
  | { kind: "text"; text: string }
  /**
   * Mõõtetabel: iga rida on veeru võti → õpilase tipitud TEKST. Sama põhjus
   * mis `numeric.raw`-il – „30°" ja „30" peavad jõudma checkerini muutmata.
   */
  | { kind: "table"; rows: TableRow[] }
  /**
   * Märgi joonisele: koha id → valitud nime id. Mõlemad on IGAVESED id-d, mitte
   * ekraanil olev tekst – nii teab õpetaja koondvaade ka hiljem, mille õpilane
   * kuhu pani, ka siis kui nime sõnastus vahepeal muutub (CLAUDE.md reegel 11).
   *
   * Vastamata koht puudub kirjest (mitte tühi sõne): „ei vastanud" ja „valis
   * tühja nime" ei tohi salvestuses ühte moodi välja näha.
   */
  | { kind: "label"; picks: LabelPicks };

/** Üks mõõtetabeli rida: veeru võti → tipitud tekst. */
export type TableRow = Readonly<Record<string, string>>;

/** Märgi joonisele: koha id → valitud nime id. */
export type LabelPicks = Readonly<Record<string, string | undefined>>;

/**
 * question_id → esitatud vastus. Ainult ESITATUD vastused – pooleli mustand
 * elab sisestuskomponendi enda olekus ja ei jõua siia.
 *
 * `| undefined` on meelega kirjas: `noUncheckedIndexedAccess` ei ole sees,
 * seega ilma selleta lubaks TypeScript olematut vastust nagu olemasolevat.
 */
export type Answers = Readonly<Record<string, AnswerPayload | undefined>>;

/**
 * Kas sammuga on ühele poole saadud?
 *
 * Vastuseta sammud (theory, hook) on alati „valmis" – neil ei ole küsimusi,
 * seega tühi loend annab `true`. Siin EI vaadata, kas vastus oli õige: lukk
 * hoiab kinni vastamata sammu, mitte vale vastust. Õigsuse üle otsustab
 * checker (sammud 1.4–1.5), ja ka siis jääb edasiliikumine lubatuks – õppimine
 * ei tohi vale vastuse taha kinni jääda.
 */
export function isStepAnswered(step: Step, answers: Answers): boolean {
  return stepQuestions(step).every((question) => answers[question.id] !== undefined);
}
