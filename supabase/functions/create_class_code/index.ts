/**
 * create_class_code – loob õpetajale klassi ja tema klassikoodi (samm 2.7).
 *
 * Voog (docs/ANDMEMUDEL.md „Klassikoodi voog"):
 *   1. kood genereeritakse SERVERIS (mitte kunagi brauseris)
 *   2. baasi läheb ainult räsi + aegumisaeg (14 päeva)
 *   3. avatekstis kood tagastatakse ÜKS KORD – kui õpetaja selle ära kaotab,
 *      ei saa seda kuskilt lugeda, vaid tuleb genereerida uus
 *
 * Päring:
 *   POST { "name": "8.a füüsika" }                 → loob uue klassi
 *   POST { "class_id": "uuid" }                    → uuendab olemasoleva
 *                                                    klassi koodi (2.8 nupp
 *                                                    „Uuenda koodi")
 * Vastus:
 *   200 { class_id, name, code, expires_at }
 *
 * KIRJUTAB ÕPETAJA ENDA TOKENIGA, MITTE SERVICE-VÕTMEGA
 * Nii kehtib ka siin RLS-poliitika `classes_own` – kui selles failis oleks
 * viga, ei saaks funktsioon ikkagi kirjutada võõrasse klassi. Turvalisus ei
 * sõltu ainult ühest if-lausest. Service-võtit see funktsioon EI VAJA.
 *
 * KOODI UNIKAALSUSE OTSUSTAB ANDMEBAAS
 * Varasem versioon kontrollis enne kirjutamist ise, kas kood on vaba. Kahe
 * samaaegse päringu vahele jäi auk: mõlemad näevad koodi vabana, mõlemad
 * kirjutavad. Nüüd on unikaalne indeks (003_class_code_unique.sql) ja me
 * lihtsalt PROOVIME kirjutada – kui baas ütleb 23505 („juba olemas"),
 * genereerime uue koodi. Ainus koht, kus „ei tohi korduda" päriselt
 * jõustub, on baas ise.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  errorResponse,
  jsonResponse,
  preflightResponse,
} from "../_shared/cors.ts";
import {
  generateClassCode,
  hashClassCode,
  readPepper,
} from "../_shared/classCode.ts";

/** Koodi eluiga: 14 päeva (docs/ANDMEMUDEL.md). */
const CODE_TTL_DAYS = 14;

/** Mitu korda proovime, kui juhuslik kood satub juba kasutusel olevaks. */
const MAX_CODE_ATTEMPTS = 8;

/** Postgresi veakood „unique_violation" – meie jaoks „proovi uut koodi". */
const UNIQUE_VIOLATION = "23505";

const MAX_NAME_LENGTH = 60;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return preflightResponse(request);

  if (request.method !== "POST") {
    return errorResponse(request, 405, "Lubatud on ainult POST.");
  }

  // ---------------------------------------------------------------------
  // Seadistus. Kaks esimest süstib Supabase ise, pipar tuleb ise seada.
  // ---------------------------------------------------------------------
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  let pepper: string;
  try {
    pepper = readPepper();
  } catch (error) {
    // Seadistusviga: kasutajale üldine teade, üksikasjad ainult logisse.
    console.error(error);
    return errorResponse(request, 500, "Serveri seadistus on puudulik.");
  }

  if (!supabaseUrl || !anonKey) {
    console.error("SUPABASE_URL või SUPABASE_ANON_KEY puudub.");
    return errorResponse(request, 500, "Serveri seadistus on puudulik.");
  }

  // ---------------------------------------------------------------------
  // Kes küsib? Ainult päris (mitte-anonüümne) konto saab klassi luua.
  // ---------------------------------------------------------------------
  const authHeader = request.headers.get("Authorization") ?? "";

  if (!authHeader.startsWith("Bearer ")) {
    return errorResponse(request, 401, "Palun logi enne sisse.");
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData?.user;

  if (userError || !user) {
    return errorResponse(request, 401, "Sessioon on aegunud. Logi uuesti sisse.");
  }

  // Õpilase anonüümne sessioon on samuti `authenticated` – õpetaja eristab
  // ainult see, et konto EI OLE anonüümne (vt 002_rls.sql is_teacher_account).
  if (user.is_anonymous) {
    return errorResponse(
      request,
      403,
      "Klassi saab luua ainult õpetaja konto.",
    );
  }

  // ---------------------------------------------------------------------
  // Sisend. `request.json()` võib anda ka `null`-i või massiivi – kontrolli
  // enne, kui väljasid loed, muidu tuleb 500 seal, kus peaks tulema 400.
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

  const fields = body as { name?: unknown; class_id?: unknown };

  const classId =
    typeof fields.class_id === "string" ? fields.class_id.trim() : "";
  const isRotation = classId.length > 0;

  // Vigane UUID annaks Postgresile jõudes 500; parem öelda kohe, mis viga on.
  if (isRotation && !UUID_PATTERN.test(classId)) {
    return errorResponse(request, 400, "class_id ei ole korrektne UUID.");
  }

  const name = typeof fields.name === "string" ? fields.name.trim() : "";

  if (!isRotation && (name.length === 0 || name.length > MAX_NAME_LENGTH)) {
    return errorResponse(
      request,
      400,
      `Klassi nimi peab olema 1–${MAX_NAME_LENGTH} märki.`,
    );
  }

  // ---------------------------------------------------------------------
  // Genereeri kood ja proovi kirjutada. Kokkupõrke (23505) korral uus kood.
  // ---------------------------------------------------------------------
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const code = generateClassCode();
    const codeHash = await hashClassCode(code, pepper);
    const expiresAt = new Date(
      Date.now() + CODE_TTL_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data, error } = isRotation
      ? await userClient
          .from("classes")
          .update({ code_hash: codeHash, code_expires_at: expiresAt })
          .eq("id", classId)
          .select("id, name")
          .maybeSingle()
      : await userClient
          .from("classes")
          .insert({
            teacher_id: user.id,
            name,
            code_hash: codeHash,
            code_expires_at: expiresAt,
          })
          .select("id, name")
          .maybeSingle();

    if (error) {
      if (error.code === UNIQUE_VIOLATION) continue; // kood juba kasutusel

      console.error(
        isRotation ? "Koodi uuendamine ebaõnnestus:" : "Klassi loomine ebaõnnestus:",
        error,
      );
      return errorResponse(
        request,
        500,
        isRotation ? "Koodi uuendamine ebaõnnestus." : "Klassi loomine ebaõnnestus.",
      );
    }

    // Tühi tulemus tähendab uuendamisel: sellist klassi ei ole VÕI see ei ole
    // sinu oma (RLS filtreeris rea välja). Mõlemal juhul sama vastus – muidu
    // saaks võõraste klasside olemasolu ID-sid proovides välja uurida.
    if (!data) {
      if (isRotation) {
        return errorResponse(request, 404, "Sellist klassi ei leitud.");
      }
      // Loomisel ei tohi tühja tulemust tulla – kui tuleb, on midagi katki.
      console.error("Klassi loomine ei tagastanud rida.");
      return errorResponse(request, 500, "Klassi loomine ebaõnnestus.");
    }

    return jsonResponse(request, 200, {
      class_id: data.id,
      name: data.name,
      code,
      expires_at: expiresAt,
    });
  }

  console.error(`Vaba koodi ei leitud ${MAX_CODE_ATTEMPTS} katsega.`);
  return errorResponse(request, 503, "Koodi loomine ebaõnnestus. Proovi uuesti.");
});
