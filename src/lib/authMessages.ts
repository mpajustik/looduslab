/**
 * Sisselogimise puhtad abifunktsioonid: e-posti normaliseerimine, lihtne
 * kujukontroll ja Supabase'i veateate tõlge eesti keelde.
 *
 * Miks eraldi failis: need on puhtad funktsioonid (sisend → väljund) ja
 * kaetud testidega. Komponendi sees oleks sama loogika testimatu.
 */

/** Ette ja taha jäänud tühikud on kasutaja kirjaviga, mitte tema soov. */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Kas aadress näeb üldse e-posti moodi välja.
 *
 * Kontroll on TAHTLIKULT lõtv: päris kontrolli teeb ainult see, kas kiri
 * kohale jõuab. Range regexp jätaks päris aadresse kõrvale ja tekitaks
 * õpetajale veateate, mille põhjust ta ei mõista.
 */
export function isLikelyEmail(value: string): boolean {
  const email = normalizeEmail(value);
  if (email.length < 5 || email.length > 320) return false;
  if (/\s/.test(email)) return false;
  const at = email.indexOf("@");
  // Täpselt üks @, midagi on ees ja domeenis on punkt keskel.
  if (at <= 0 || at !== email.lastIndexOf("@")) return false;
  const domain = email.slice(at + 1);
  const dot = domain.indexOf(".");
  return dot > 0 && dot < domain.length - 1;
}

/** Supabase'i vea kuju, mida me päriselt kasutame (kogu tüüpi pole vaja). */
export type AuthErrorLike = {
  code?: string;
  status?: number;
  message?: string;
};

/**
 * Veateade eesti keeles. Supabase'i enda tekstid on inglise keeles ja
 * tehnilised („For security purposes, you can only request this after 51
 * seconds") – õpetaja ei pea neid lugema.
 *
 * Tundmatu vea puhul anname üldise teate: aimamine annaks vale nõuande.
 */
export function magicLinkErrorMessage(error: AuthErrorLike): string {
  const code = error.code ?? "";

  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit") {
    return "Liiga palju katseid järjest. Oota paar minutit ja proovi uuesti.";
  }
  if (code === "validation_failed" || code === "email_address_invalid") {
    return "See e-posti aadress ei ole õiges kirjapildis. Kontrolli üle.";
  }
  if (code === "signup_disabled" || code === "email_provider_disabled") {
    return "Sisselogimine on ajutiselt suletud. Anna palun teada.";
  }
  if (error.status === 429) {
    return "Liiga palju katseid järjest. Oota paar minutit ja proovi uuesti.";
  }

  return "Lingi saatmine ei õnnestunud. Kontrolli internetiühendust ja proovi uuesti.";
}
