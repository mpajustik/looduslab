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

/**
 * Üks moodulikäik klassivaate jaoks (attempts rida, ainult vajalikud veerud).
 */
export type ClassAttempt = {
  module_id: string;
  current_step: string | null;
  status: "started" | "completed";
  started_at: string;
  finished_at: string | null;
};

/**
 * Mida õpetaja ühe õpilase rea kohta näeb.
 *
 * `null` tähendab „pole veel alustanud" – ja AINULT seda. Varem sai sama
 * teksti ka lõpetanud õpilane, sest klassivaade päris ainult `status =
 * 'started'` ridu; õpetaja jaoks nägi tunni lõpetanu välja nagu see, kes ei
 * olnud arvutit lahtigi teinud.
 */
export type ClassActivity =
  | { kind: "started"; moduleId: string; currentStep: string | null }
  | { kind: "completed"; moduleId: string; count: number };

/**
 * Ühe õpilase kõigist moodulikäikudest see, mida klassivaates näidata.
 *
 * Valime VIIMASE toimunu, mitte lihtsalt poolelioleva: pooleli jäänud käik
 * ei aegu kunagi ise ära ja varjutaks muidu igavesti kõik hilisemad lõpetatud
 * tunnid („esmaspäeval pooleli jäänud A" jääks ekraanile ka pärast seda, kui
 * laps teisipäeval B ära lõpetas – Codexi leid).
 *
 * Ajatempel: poolelioleval `started_at`, lõpetatul `finished_at`. Viigi
 * korral võidab pooleliolev – siis on laps ilmselt just praegu tunnis sees.
 *
 * Piirang, mida tasub teada: poolelioleva käigu kohta ON ainult alustamise
 * aeg (baasis ei ole „viimati tegutses"). Kui laps alustab A, käib vahepeal
 * ära B lõpetamas ja naaseb A juurde, näitab vaade „lõpetas B" – seda saaks
 * täpsemaks alles siis, kui attempts saab viimase tegevuse ajatempli.
 */
export function classActivity(attempts: ClassAttempt[]): ClassActivity | null {
  const started = attempts.filter((a) => a.status === "started");
  const completed = attempts.filter((a) => a.status === "completed");

  const latestStarted =
    started.length === 0
      ? null
      : started.reduce((best, a) => (a.started_at > best.started_at ? a : best));

  // finished_at võib teoorias puududa (vana rida) – siis loeb started_at,
  // et võrdlus ei kukuks undefined'i peale ja järjestus jääks mõistlikuks.
  const finishStamp = (a: ClassAttempt) => a.finished_at ?? a.started_at;
  const latestCompleted =
    completed.length === 0
      ? null
      : completed.reduce((best, a) =>
          finishStamp(a) > finishStamp(best) ? a : best,
        );

  if (
    latestStarted &&
    (!latestCompleted ||
      latestStarted.started_at >= finishStamp(latestCompleted))
  ) {
    return {
      kind: "started",
      moduleId: latestStarted.module_id,
      currentStep: latestStarted.current_step,
    };
  }

  if (!latestCompleted) return null;
  return {
    kind: "completed",
    moduleId: latestCompleted.module_id,
    count: completed.length,
  };
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

/**
 * Kas õpetaja trükkis kinnituseks klassi nime õigesti (samm 2.15)?
 *
 * Klassi kustutamine on PÖÖRDUMATU ja võtab kaasa teiste inimeste (õpilaste)
 * töö – seepärast ei piisa siin ühest „Kas oled kindel?" klõpsust. Nime
 * trükkimine sunnib vaatama, MILLIST klassi parasjagu kustutatakse; kaks
 * sarnast nime („8.a füüsika" ja „8.b füüsika") on just see koht, kus
 * lohakas klõps läheb valesti.
 *
 * Võrdlus on leebe seal, kus eksimine on kahjutu (algustäht, tühikud otstes
 * ja sees), ja range seal, kus see on oluline (tähed ja numbrid ise).
 */
export function matchesClassName(input: string, className: string): boolean {
  // `normalize("NFC")` EI ole siin ilustus: iOS-i ja macOS-i klaviatuur
  // saadab „ü" tihti kahe märgina (u + täpid), Windows ühe märgina. Ilma
  // selleta ei loeks õigesti trükitud „8.a füüsika" õigeks ja õpetaja ei
  // saaks oma klassi iPadist üldse kustutada (CodeRabbiti leid, 2026-08-06).
  const normalize = (value: string) =>
    value.normalize("NFC").trim().replace(/\s+/gu, " ").toLocaleLowerCase("et");

  const wanted = normalize(className);
  // Tühja nimega klassi ei ole (vorm ei luba), aga kui ta kuidagi tekiks,
  // ei tohi tühi väli olla kehtiv kinnitus.
  if (wanted.length === 0) return false;
  return normalize(input) === wanted;
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
