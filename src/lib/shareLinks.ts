/**
 * Jagamislinkide puhtad abifunktsioonid (samm 2.14).
 *
 * Kolm aadressi, mis peavad olema ühes kohas: mooduli otselink, mille õpetaja
 * jagab; sama link eelvaatena („Vaata õpilasena"); ja liitumislink koos
 * teadmisega, KUHU pärast liitumist edasi minna. Kui marsruut kunagi muutub,
 * muutub see fail – mitte viis komponenti.
 */

/** Mooduli otselink, mis läheb QR-koodi ja lõikelauale. */
export function moduleUrl(slug: string, origin: string): string {
  return `${origin}/m/${encodeURIComponent(slug)}`;
}

/**
 * Sama moodul eelvaates: `?eelvaade=1` paneb engine'i preview-režiimi
 * (CLAUDE.md reegel 14 – ei kirjuta MITTE KUHUGI).
 */
export function modulePreviewPath(slug: string): string {
  return `/m/${encodeURIComponent(slug)}?eelvaade=1`;
}

/**
 * Liitumislehe tee. `next` on koht, kuhu õpilane pärast liitumist läheb –
 * ilma selleta viskaks liitumine ta kursuse esilehele ja jagatud tund, mille
 * pärast ta üldse tuli, jääks otsimata.
 */
export function joinPath(code: string, next?: string | null): string {
  const base = `/liitu/${encodeURIComponent(code)}`;
  const safe = next ? safeNextPath(next) : null;
  return safe ? `${base}?edasi=${encodeURIComponent(safe)}` : base;
}

/**
 * Juhtsümbol aadressis (reavahetus, tabulaator, nullbait).
 *
 * Silmus, mitte regulaaravaldis: juhtsümboli kirjutamine regulaaravaldise
 * sisse tähendaks nende sümbolite endi panemist LÄHTEKOODI, kus nad on
 * nähtamatud ja kus järgmine lugeja neid kogemata katki teeb.
 */
function hasControlChars(value: string): boolean {
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

/**
 * Aadressiribalt tulnud „kuhu edasi" – kas seda tohib usaldada?
 *
 * See väärtus tuleb LINGIST ehk võõrast kohast, ja me anname ta otse
 * `navigate()`-ile. Ilma kontrollita saaks pahatahtlik link kujul
 * `/liitu/483920?edasi=https://vale-sait.ee` viia lapse pärast liitumist
 * võõrale lehele, mis näeb välja nagu meie oma (avatud ümbersuunamine).
 * Seepärast läbib ainult meie enda rakenduse sisene tee:
 *
 * - algab ühe kaldkriipsuga (`/kursus`), mitte kahega (`//vale-sait.ee` on
 *   brauserile TÄISAADRESS, mitte tee) ega `/\` -ga (osa brausereid loeb
 *   sedagi protokollivabaks aadressiks);
 * - ei sisalda juhtsümboleid – just nendega üritatakse kontrolli mööda
 *   hiilida (reavahetus keset aadressi).
 *
 * Tagastab `null`, kui tee ei kõlba – kutsuja läheb siis vaikimisi kohta.
 */
export function safeNextPath(raw: string): string | null {
  if (raw.length === 0 || raw.length > 512) return null;
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return null;
  if (hasControlChars(raw)) return null;
  return raw;
}
