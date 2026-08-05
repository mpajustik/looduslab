/**
 * join_class – õpilane liitub klassikoodiga (samm 2.9).
 *
 * Voog (docs/ANDMEMUDEL.md „Klassikoodi voog"):
 *   1. õpilane logib brauseris anonüümselt sisse (signInAnonymously)
 *   2. saadab siia { code, display_name }
 *   3. server räsib koodi ja otsib aegumata klassi – koodi EI kontrollita
 *      kunagi brauseris
 *   4. tekib `students` rida, mille id ON ALATI TOKENI OMANIK
 *
 * Päring:  POST { "code": "483920", "display_name": "Mari" }
 * Vastus:  200 { class_id, class_name, display_name }
 *
 * SEE FUNKTSIOON KASUTAB SERVICE-VÕTIT – ERINEVALT create_class_code'IST
 * ---------------------------------------------------------------------
 * Tabelitel `students` ja `join_attempts` EI OLE ühtegi INSERT-poliitikat
 * (002_rls.sql, tahtlikult): kui õpilane saaks ise `students` rea luua,
 * liituks ta suvalise klassiga ilma koodita. Seega peab kirjutama service
 * -võtmega, mis käib RLS-ist mööda – ja see tähendab, et SIIN FAILIS EI OLE
 * TURVAVÕRKU. create_class_code'i juures päästaks vea korral ikkagi RLS;
 * siin mitte. Kaks reeglit, mida siin kunagi rikkuda ei tohi:
 *
 *   a) `students.id` tuleb AINULT verifitseeritud tokenist (`user.id`),
 *      mitte kunagi päringu kehast. Muidu saaks igaüks kirjutada võõra
 *      õpilase nime ja klassi alla.
 *   b) service-klienti EI KASUTATA lugemiseks, mida klient ise ei tohiks
 *      näha. Siin loeme sellega ainult klassi koodiräsi järgi (kood ise on
 *      tõend) ja pidurduse logi.
 *
 * KAKS ERI KAITSET, KUMBKI EI ASENDA TEIST (docs/ANDMEMUDEL.md):
 *   - PIPAR kaitseb andmebaasi lekke vastu (räsi ei ole ilma piprata arvutatav)
 *   - PIDURDUS kaitseb võrgu kaudu äraarvamise vastu (miljon koodi on vähe)
 * Lisaks: iga ebaõnnestumine annab TÄPSELT SAMA teate. „Kood on olemas, aga
 * aegunud" ütleks ründajale, et ta arvas koodi ära.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  errorResponse,
  jsonResponse,
  preflightResponse,
} from "../_shared/cors.ts";
import { hashClassCode, readPepper } from "../_shared/classCode.ts";

/** Klassikood on täpselt kuus numbrit (vt _shared/classCode.ts). */
const CODE_PATTERN = /^[0-9]{6}$/;

/** Eesnimi: lühike, sest projektorile mahub nii rohkem nimesid. */
const MAX_NAME_LENGTH = 30;

/**
 * Pidurduse piirid. Kolm tükki, sest üksik piir on igas suunas katki –
 * põhjendus tervikuna on 005_join_throttle.sql päises. Lühidalt:
 *
 *   * sessioon: tabab äraarvajat, kes proovib koode ühe kontoga;
 *   * IP: tabab sessioonide vahetajat. Loeb ainult KINNITATUD
 *     ebaõnnestumisi, seega tunni alguses liituv klass seda ei puuduta;
 *   * poolelioleva puhangu piir: rida kirjutatakse enne, kui koodi õigsust
 *     teatakse, seega on 24 õiget liitumist hetkeks korraga „pooleli".
 *     Klassitäis mahub ära, 50 päringut korraga mitte.
 *
 * Need arvud on TÕE ALLIKAS – SQL-funktsioon võtab nad parameetritena, et
 * kaks kohta ei saaks lahku minna.
 */
const MAX_SESSION_ATTEMPTS = 5;
const MAX_IP_ATTEMPTS = 10;
const MAX_IP_PENDING = 40;
const THROTTLE_WINDOW_MINUTES = 10;
const PENDING_WINDOW_SECONDS = 60;

/**
 * Sama teade KÕIGI ebaõnnestumiste puhul: tundmatu kood, aegunud kood,
 * vigase kujuga kood. Erinev sõnastus oleks ründaja jaoks vihje.
 */
const GENERIC_CODE_ERROR = "Vale või aegunud kood. Küsi õpetajalt uus.";

/**
 * IP räsi sool. Eraldi saladus, MITTE sama mis CLASS_CODE_PEPPER: kui üks
 * neist kunagi lekib või vahetatakse, ei tohi see teist puudutada. Pipra
 * vahetamine tapaks kõik klassikoodid, soola vahetamine ainult pidurduse
 * ajaloo (mis on 24 h pärast niikuinii kadunud).
 */
function readIpSalt(): string {
  const salt = Deno.env.get("JOIN_IP_SALT") ?? "";

  if (salt.length < 32) {
    throw new Error(
      "JOIN_IP_SALT puudub või on lühem kui 32 märki. Seadista: " +
        "supabase secrets set JOIN_IP_SALT=...",
    );
  }

  return salt;
}

/**
 * SHA-256(IP + sool) hex-ina. Avatekstis IP-d me EI SALVESTA (CLAUDE.md
 * reegel 6 vaimus ja docs/ANDMEMUDEL.md nõue) – räsi kõlbab võrdlemiseks,
 * aga baasi lugejale ei ütle, kes kust liitus.
 */
async function hashIp(ip: string, salt: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${ip}:${salt}`),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Kliendi IP – ja MILLISEST PÄISEST ta tuli.
 *
 * VARASEM VERSIOON OLI KATKI: ta võttis `x-forwarded-for` ESIMESE kirje ja
 * väitis kommentaaris, et äär paneb kliendi aadressi ette. Vastupidi –
 * puhverserverid LISAVAD oma nähtud aadressi LOPPU, seega esimene kirje on
 * see, mille klient ise saatis. Ründaja oleks pannud iga päringu ette uue
 * väljamõeldud aadressi ja pidurdus poleks lugenud kunagi üle ühe.
 *
 * Nüüd usaldame ainult päiseid, mille paneb äär ise ja mille ta kliendi
 * omaga ÜLE KIRJUTAB (`cf-connecting-ip`, `x-real-ip`). `x-forwarded-for`
 * on viimane variant ja sealt võtame VIIMASE kirje – see on aadress, mida
 * nägi meile kõige lähem puhverserver, ainus, mida klient juurde luisata
 * ei saa.
 *
 * Kui ühtegi päist ei ole, läheb kogu selline liiklus ühte ämbrisse
 * ("unknown"): pigem pidurdame liiga palju kui ei pidurda üldse.
 *
 * `source` läheb logisse (ainult NIMI, mitte aadress) – nii saab pärast
 * deploy'd Supabase'i logist kontrollida, milline päis päriselt kohale
 * jõuab, ilma et keegi peaks IP-sid logisse kirjutama.
 */
function readClientIp(request: Request): { ip: string; source: string } {
  for (const header of ["cf-connecting-ip", "x-real-ip"]) {
    const value = request.headers.get(header)?.trim() ?? "";
    if (value.length > 0) return { ip: value, source: header };
  }

  const chain = (request.headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  const nearest = chain.at(-1) ?? "";
  if (nearest.length > 0) return { ip: nearest, source: "x-forwarded-for" };

  return { ip: "unknown", source: "none" };
}

/**
 * Nimi ekraanile: ilma juht- ja nähtamatute märkideta, ühe reana.
 * HTML-i siin EI puhastata ega pea puhastama – React escapib teksti ise
 * (CLAUDE.md reegel 12), seega ainsad ohud on „nähtamatu nimi" ja
 * projektorivaadet lõhkuv reavahetus.
 */
function cleanDisplayName(raw: unknown): string {
  if (typeof raw !== "string") return "";

  // Juhtmärgid, nullpikkusega tühik, suunamärgid, reavaheturid ja BOM →
  // tavaline tühik. Ilma selleta saaks nimeks "nähtamatu" string, mis näeb
  // projektoril välja nagu viga.
  // deno-lint-ignore no-control-regex
  const invisible = /[\u0000-\u001F\u007F\u200B-\u200F\u2028\u2029\uFEFF]/g;

  return raw.replace(invisible, " ").replace(/\s+/g, " ").trim();
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return preflightResponse(request);

  if (request.method !== "POST") {
    return errorResponse(request, 405, "Lubatud on ainult POST.");
  }

  // ---------------------------------------------------------------------
  // Seadistus. Kaks esimest süstib Supabase ise, kaks saladust seab kasutaja.
  // ---------------------------------------------------------------------
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  let pepper: string;
  let ipSalt: string;
  try {
    pepper = readPepper();
    ipSalt = readIpSalt();
  } catch (error) {
    // Seadistusviga: kasutajale üldine teade, üksikasjad ainult logisse.
    console.error(error);
    return errorResponse(request, 500, "Serveri seadistus on puudulik.");
  }

  if (!supabaseUrl || !anonKey || !serviceKey) {
    console.error("SUPABASE_URL, SUPABASE_ANON_KEY või SUPABASE_SERVICE_ROLE_KEY puudub.");
    return errorResponse(request, 500, "Serveri seadistus on puudulik.");
  }

  // ---------------------------------------------------------------------
  // Kes liitub? Ainult anonüümne õpilase sessioon.
  //
  // Miks õpetaja konto siia ei kõlba: `students` rida seob edenemise selle
  // kontoga ja klassivaade näitaks õpetajat oma klassis õpilasena. Õpetaja
  // moodulite proovimiseks on „Vaata õpilasena" (preview-režiim, CLAUDE.md
  // reegel 14), mis EI KIRJUTA mitte kuhugi.
  // ---------------------------------------------------------------------
  const authHeader = request.headers.get("Authorization") ?? "";

  if (!authHeader.startsWith("Bearer ")) {
    return errorResponse(request, 401, "Liitumiseks ava palun link uuesti.");
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData?.user;

  if (userError || !user) {
    return errorResponse(request, 401, "Sessioon on aegunud. Ava link uuesti.");
  }

  if (!user.is_anonymous) {
    return errorResponse(
      request,
      403,
      "Õpetaja konto ei saa klassiga õpilasena liituda. " +
        "Mooduli proovimiseks kasuta „Vaata õpilasena”.",
    );
  }

  // ---------------------------------------------------------------------
  // Sisend.
  // ---------------------------------------------------------------------
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(request, 400, "Päringu sisu ei ole korrektne JSON.");
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return errorResponse(request, 400, "Päringu sisu peab olema JSON-objekt.");
  }

  const fields = body as { code?: unknown; display_name?: unknown };

  const code = typeof fields.code === "string" ? fields.code.trim() : "";
  const displayName = cleanDisplayName(fields.display_name);

  // Nime viga EI OLE turvaküsimus – siin tohib öelda, mis täpselt viga on.
  if (displayName.length === 0 || displayName.length > MAX_NAME_LENGTH) {
    return errorResponse(
      request,
      400,
      `Palun kirjuta oma eesnimi (kuni ${MAX_NAME_LENGTH} märki).`,
    );
  }

  // ---------------------------------------------------------------------
  // Service-klient: alates siit käime RLS-ist mööda. Vt faili päist.
  // ---------------------------------------------------------------------
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const client = readClientIp(request);
  const ipHash = await hashIp(client.ip, ipSalt);

  // ---------------------------------------------------------------------
  // PIDURDUS ENNE KOODI KONTROLLI, ÜHE ATOMAARSE KÄIGUGA.
  //
  // Varem oli see kaks päringut: loe arv, hiljem kirjuta rida. Nende vahele
  // mahtus kogu rünne – 50 korraga saadetud päringut lugesid kõik „katseid
  // on 0" ja said kõik läbi. Nüüd teeb kontrolli ja kirjutamise ÜKS
  // SQL-funktsioon nõuandeluku all (005_join_throttle.sql).
  //
  // Rida lisatakse KOHE `pending`-ina, enne kui me koodi õigsust teame.
  // Lõpus saab ta ühe kahest saatusest: liitumine õnnestus → rida
  // KUSTUTATAKSE; kood oli vale → rida märgitakse `failed`. Turvapiir loeb
  // ainult `failed` ridu, seega tunni alguses liituv klass ei söö ise
  // pidurduse eelarvet ära.
  // ---------------------------------------------------------------------
  const { data: throttle, error: throttleError } = await adminClient
    .rpc("register_join_attempt", {
      p_ip_hash: ipHash,
      p_student_id: user.id,
      // Ainult koodi algus: silumiseks piisab, terve kood baasis oleks
      // sama hea kui koodide avatekstis hoidmine.
      p_code_prefix: code.slice(0, 2),
      p_window_minutes: THROTTLE_WINDOW_MINUTES,
      p_max_ip: MAX_IP_ATTEMPTS,
      p_max_session: MAX_SESSION_ATTEMPTS,
      p_max_ip_pending: MAX_IP_PENDING,
      p_pending_seconds: PENDING_WINDOW_SECONDS,
    })
    .maybeSingle<{ allowed: boolean; attempt_id: string | null }>();

  if (throttleError || !throttle) {
    // Kui pidurdus ei vasta, EI LASE me läbi: katkine logi tähendaks
    // piiramatut äraarvamist. Parem üks tund käsitsi koode jagada.
    console.error("Pidurdus ebaõnnestus:", throttleError);
    return errorResponse(request, 503, "Liitumine ei õnnestunud. Proovi hetke pärast uuesti.");
  }

  if (!throttle.allowed) {
    return errorResponse(
      request,
      429,
      `Liiga palju katseid. Proovi ${THROTTLE_WINDOW_MINUTES} minuti pärast uuesti.`,
    );
  }

  // Ainult päise NIMI, mitte aadress – vt readClientIp. Ilma selleta ei saa
  // pärast deploy'd kontrollida, kas pidurdus loeb üldse õiget asja;
  // "none" tähendab, et ta loeb kogu liiklust ühe ämbrina.
  console.log(`Liitumiskatse (kliendi IP päisest: ${client.source}).`);

  /**
   * Katse maha arvamine: seda kutsume siis, kui päring EI OLNUD koodi
   * äraarvamise katse (liitumine õnnestus või kood oli õige, aga liitumine
   * jäi muul põhjusel ära). Viga siin ei katkesta vastust – kasutaja saab
   * oma tulemuse, rida vananeb minutiga niikuinii arvestusest välja.
   */
  const forgetAttempt = async () => {
    if (!throttle.attempt_id) return;

    const { error } = await adminClient
      .from("join_attempts")
      .delete()
      .eq("id", throttle.attempt_id);

    if (error) console.error("Katse mahaarvamine ebaõnnestus:", error);
  };

  /**
   * Katse KINNITAMINE ebaõnnestunuks – alles see paneb ta turvapiiri
   * arvesse. Kui see kirjutus mingil põhjusel ei õnnestu, jääb rida
   * `pending`-iks ja kaob minutiga arvestusest: pidurdus muutub siis
   * leebemaks, mitte rangemaks. Seepärast läheb viga logisse, aga
   * kasutajale vastame ikka samamoodi – vastasel juhul erineks vale koodi
   * vastus olukorrast olenevalt ja see oleks ründajale vihje.
   */
  const failAttempt = async () => {
    if (!throttle.attempt_id) return;

    const { error } = await adminClient
      .from("join_attempts")
      .update({ outcome: "failed" })
      .eq("id", throttle.attempt_id);

    if (error) console.error("Katse märkimine ebaõnnestus:", error);
  };

  // Vigase kujuga kood läheb samuti arvesse: muidu saaks pidurdusest mööda,
  // saates iga õige katse vahele mürana midagi muud.
  if (!CODE_PATTERN.test(code)) {
    await failAttempt();
    return errorResponse(request, 404, GENERIC_CODE_ERROR);
  }

  // ---------------------------------------------------------------------
  // Koodi kontroll: üks indekseeritud päring räsi järgi (HMAC on
  // determinstlik – vt _shared/classCode.ts).
  // ---------------------------------------------------------------------
  const codeHash = await hashClassCode(code, pepper);

  const { data: klass, error: classError } = await adminClient
    .from("classes")
    .select("id, name, code_expires_at")
    .eq("code_hash", codeHash)
    .maybeSingle();

  if (classError) {
    console.error("Klassi otsimine ebaõnnestus:", classError);
    return errorResponse(request, 500, "Liitumine ei õnnestunud. Proovi uuesti.");
  }

  // Aegumist kontrollime SERVERI kellaga, mitte päringu tingimusena – nii
  // on tundmatu ja aegunud koodi vastus tagatult identne.
  const isExpired =
    !klass || new Date(klass.code_expires_at).getTime() <= Date.now();

  if (isExpired) {
    await failAttempt();
    return errorResponse(request, 404, GENERIC_CODE_ERROR);
  }

  // ---------------------------------------------------------------------
  // KLASSIVAHETUSE KAITSE.
  //
  // Skeem lubab ühel õpilasel olla korraga ühes klassis (students.id on
  // primaarvõti). Kui sama seade liitub teise klassiga, kirjutaks upsert
  // class_id üle – ja siis juhtuks kaks halba asja korraga: vana õpetaja
  // kaotaks õpilase koos tema vastustega oma vaatest ning uus õpetaja
  // näeks vastuseid, mis anti hoopis teises klassis (RLS loeb õpetaja
  // õigust praeguse class_id järgi, mitte vastuse tekkimise järgi).
  //
  // Seepärast: liikuda tohib ainult see seade, millega ei ole veel ühtegi
  // moodulikäiku alustatud. Tühja seadme liikumine on tavaline (laps
  // proovis esimesel korral vale koodi), tehtud töödega seadme oma mitte.
  // ---------------------------------------------------------------------
  const { data: existing, error: existingError } = await adminClient
    .from("students")
    .select("class_id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingError) {
    console.error("Senise klassi kontroll ebaõnnestus:", existingError);
    return errorResponse(request, 500, "Liitumine ei õnnestunud. Proovi uuesti.");
  }

  if (existing && existing.class_id !== klass.id) {
    const { count: workCount, error: workError } = await adminClient
      .from("attempts")
      .select("id", { count: "exact", head: true })
      .eq("student_id", user.id);

    if (workError) {
      console.error("Varasemate tööde kontroll ebaõnnestus:", workError);
      return errorResponse(request, 500, "Liitumine ei õnnestunud. Proovi uuesti.");
    }

    if ((workCount ?? 0) > 0) {
      // Kood oli õige – see ei olnud äraarvamise katse.
      await forgetAttempt();
      return errorResponse(
        request,
        409,
        "Selle seadmega on juba liitutud teise klassiga ja seal on töid tehtud. " +
          "Ava see link brauseri privaatses aknas või küsi õpetajalt abi.",
      );
    }
  }

  // ---------------------------------------------------------------------
  // Õpilase rida. `upsert` id järgi, sest sama laps võib lehe uuesti avada
  // (topeltklikk, F5) – see peab andma sama tulemuse, mitte viga.
  //
  // id tuleb tokenist. Mitte kunagi kehast. Vt faili päist.
  // ---------------------------------------------------------------------
  const { error: joinError } = await adminClient
    .from("students")
    .upsert(
      { id: user.id, class_id: klass.id, display_name: displayName },
      { onConflict: "id" },
    );

  if (joinError) {
    console.error("Liitumine ebaõnnestus:", joinError);
    return errorResponse(request, 500, "Liitumine ei õnnestunud. Proovi uuesti.");
  }

  // Liitumine õnnestus – see ei olnud äraarvamise katse. Ilma selleta
  // sööks 24 last tunni alguses IP piiri ise ära.
  await forgetAttempt();

  return jsonResponse(request, 200, {
    class_id: klass.id,
    class_name: klass.name,
    display_name: displayName,
  });
});
