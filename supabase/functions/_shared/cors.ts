/**
 * CORS ja JSON-vastused kõigile Edge Functionitele.
 *
 * Miks CORS-i üldse vaja on: funktsiooni kutsub brauser (supabase-js
 * `functions.invoke`), mis elab teisel domeenil kui *.supabase.co. Ilma
 * lubavate päisteta blokeerib brauser vastuse enne, kui meie kood seda näeb.
 *
 * Lubatud lähtekohad tulevad keskkonnamuutujast ALLOWED_ORIGINS (komadega
 * eraldatud). Kui seda EI OLE seatud, lubame `*` – see on turvaline just
 * siin, sest me ei kasuta küpsiseid: iga päring peab kaasa tooma
 * `Authorization` päise, mille võõras leht kasutaja eest kaasa panna ei saa.
 */

const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

/** Päised, mille brauser peab vastuses nägema, et ta seda üldse edastaks. */
export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin");

  const allowOrigin =
    allowedOrigins.length === 0
      ? "*"
      : origin && allowedOrigins.includes(origin)
        ? origin
        : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    // `x-client-info` ja `x-supabase-api-version` saadab supabase-js ISE iga
    // `functions.invoke` juures. Kui neid siin ei ole, blokeerib brauser
    // kutse juba eelpäringul – curl-test läheks läbi, rakendus mitte.
    "Access-Control-Allow-Headers":
      "authorization, content-type, apikey, x-client-info, x-supabase-api-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    // Erinev vastus erineva Origin'i kohta – ilma selleta võib vahemälu
    // ühele domeenile antud loa teisele edasi anda.
    Vary: "Origin",
  };
}

/** JSON-vastus koos CORS-päistega. */
export function jsonResponse(
  request: Request,
  status: number,
  body: unknown,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

/**
 * Veavastus ühtses kujus: `{ error: "eestikeelne selgitus" }`.
 * Kasutajaliides võib selle otse ekraanile panna.
 */
export function errorResponse(
  request: Request,
  status: number,
  message: string,
): Response {
  return jsonResponse(request, status, { error: message });
}

/** Brauseri eelpäring (preflight) – sisu ei ole, ainult päised. */
export function preflightResponse(request: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
