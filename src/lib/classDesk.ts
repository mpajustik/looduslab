/**
 * Õpetaja töölaua puhtad abifunktsioonid (klasside nimekiri, koodi aegumine,
 * create_class_code veateated). Eraldi failis, et need saaksid testidega
 * kaetud olla ilma Reacti komponenti käivitamata (samas vaimus mis
 * authMessages.ts).
 */

/** Kuupäev eesti kujul, nt "19. augustil 2026". */
const KUUD = [
  "jaanuaril",
  "veebruaril",
  "märtsil",
  "aprillil",
  "mail",
  "juunil",
  "juulil",
  "augustil",
  "septembril",
  "oktoobril",
  "novembril",
  "detsembril",
];

/** Klassikoodi aegumise silt. `now` on parameeter, et testida ilma kellata. */
export function formatExpiry(expiresAtIso: string, now = new Date()): string {
  const expiresAt = new Date(expiresAtIso);
  const kuupaev = `${expiresAt.getDate()}. ${KUUD[expiresAt.getMonth()]} ${expiresAt.getFullYear()}`;

  if (expiresAt.getTime() <= now.getTime()) {
    return `Kood aegus ${kuupaev}`;
  }
  return `Kood aegub ${kuupaev}`;
}

/**
 * Aadress, mis läheb QR-koodi sisse.
 *
 * QR EI TOHI sisaldada ainult numbrit: telefoni kaamera näitaks siis lihtsalt
 * teksti „483920" ja laps peaks selle ikkagi käsitsi kuhugi trükkima. Terve
 * link avab liitumislehe ühe puudutusega – see on kogu QR-i mõte.
 *
 * Marsruut on /liitu/:kood (samm 2.10). Kui see kunagi muutub, muutub siin
 * üks rida ja QR-id kõigis vaadetes tulevad automaatselt kaasa.
 */
export function joinUrl(code: string, origin: string): string {
  return `${origin}/liitu/${encodeURIComponent(code)}`;
}

/** Klassiga liitunud õpilane projektorivaates – rohkem ei ole vaja näidata. */
export type JoinedStudent = { id: string; display_name: string };

/**
 * Liidab uued liitujad olemasolevatele, ilma kordusteta.
 *
 * Projektorivaade saab õpilasi KAHEST allikast: realtime-kanalist (INSERT)
 * ja algseisu päringust. Kumbki võib jõuda kohale enne teist, seega peab
 * liitmine olema järjekorrast sõltumatu ja sama õpilane ei tohi ekraanile
 * kaks korda tekkida. Olemasolevate järjekord säilib – tunni alguses on
 * rahutu, kui juba nähtud nimed hüppavad ringi.
 */
export function mergeStudents(
  current: JoinedStudent[],
  incoming: JoinedStudent[],
): JoinedStudent[] {
  const known = new Set(current.map((student) => student.id));
  const added: JoinedStudent[] = [];

  for (const student of incoming) {
    // Lisame ID ka siin, mitte ainult alguses: sama sõnum võib kanalist
    // korduda ja siis ei tohi ta ka ÜHE liitmise sees kaks korda läbi minna.
    if (known.has(student.id)) continue;
    known.add(student.id);
    added.push(student);
  }

  return added.length === 0 ? current : [...current, ...added];
}

/** Üldine teade, kui vastust ei õnnestunud lugeda (võrguviga, aegumine). */
export const CLASS_CODE_NETWORK_ERROR =
  "Ei õnnestunud ühendust luua. Kontrolli internetiühendust ja proovi uuesti.";

/**
 * `supabase.functions.invoke` viga eesti keeles.
 *
 * Kui funktsioon vastas (mitte-2xx), on supabase-js viga `FunctionsHttpError`,
 * mille `context` on Response ise – JSON-keha on `{ error: "eestikeelne
 * selgitus" }` (vt supabase/functions/_shared/cors.ts errorResponse). Kui
 * funktsioonini ei jõutud (võrk katki), sellist keha ei ole – siis üldine
 * teade.
 */
export async function classCodeErrorMessage(error: {
  context?: unknown;
}): Promise<string> {
  const context = error.context;
  if (
    context &&
    typeof context === "object" &&
    "json" in context &&
    typeof (context as Response).json === "function"
  ) {
    try {
      const body = (await (context as Response).json()) as { error?: unknown };
      if (typeof body.error === "string" && body.error.length > 0) {
        return body.error;
      }
    } catch {
      // Keha ei olnud JSON – langeme üldise teate peale.
    }
  }
  return CLASS_CODE_NETWORK_ERROR;
}
