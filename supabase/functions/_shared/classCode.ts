/**
 * Klassikoodi genereerimine ja räsimine.
 *
 * Jagatud fail, sest sama räsi arvutab KAKS funktsiooni: create_class_code
 * (2.7) kirjutab räsi baasi ja join_class (2.9) otsib selle järgi klassi
 * üles. Kui arvutus oleks kahes kohas eraldi, läheks üks neist ükskord
 * vaikselt teisiti ja liitumine lakkaks töötamast.
 *
 * MIKS HMAC-SHA256, MITTE BCRYPT
 * ------------------------------
 * Bcrypt-räsi sisaldab juhuslikku soola, seega SAMA kood annab iga kord
 * ERINEVA räsi. Otsida saab ainult nii, et võtad kõik aegumata klassid ja
 * võrdled ükshaaval – 100 ms räsi kohta, 1000 klassi = 100 sekundit.
 * Liitumine peab olema kiire (24 last, 2 minutit), seega see ei kõlba.
 *
 * HMAC-SHA256 on determinstlik: sama kood → sama räsi → üks indekseeritud
 * päring. Kiiruse eest maksame sellega, et kiire räsi on ka ründajale kiire
 * – 6-kohalist koodi saaks miljoni SHA-arvutusega läbi proovida. Selle vastu
 * on PIPAR (CLASS_CODE_PEPPER): salajane võti, mis elab AINULT Edge
 * Functioni keskkonnamuutujas, mitte andmebaasis. Andmebaasi leke üksi ei
 * anna seega ühtegi koodi kätte, sest räsi ilma piprata ei ole arvutatav.
 */

const CODE_LENGTH = 6;

/** Vahemälu: võtme importimine on aeglane, aga pipar ei muutu. */
let cachedKey: CryptoKey | null = null;
let cachedPepper: string | null = null;

/**
 * Kuuekohaline numbrikood, nt "483920".
 *
 * Ainult numbrid, sest telefonis avaneb siis numbriklaviatuur ja projektorilt
 * ette lugedes ei aja keegi segi O/0 ega I/1.
 *
 * `crypto.getRandomValues` annab juhuslikud baidid 0–255. Lihtne `bait % 10`
 * annaks kallutatud tulemuse (256 ei jagu 10-ga, seega numbrid 0–5 tuleksid
 * veidi sagedamini), seepärast viskame 250-st suuremad baidid lihtsalt ära.
 */
export function generateClassCode(): string {
  let code = "";

  while (code.length < CODE_LENGTH) {
    const bytes = new Uint8Array(CODE_LENGTH);
    crypto.getRandomValues(bytes);

    for (const byte of bytes) {
      if (byte >= 250) continue; // kallutatud jääk – proovime uue baidi
      code += String(byte % 10);
      if (code.length === CODE_LENGTH) break;
    }
  }

  return code;
}

/** Loe pipar keskkonnast; puuduv või lühike pipar on seadistusviga. */
export function readPepper(): string {
  const pepper = Deno.env.get("CLASS_CODE_PEPPER") ?? "";

  if (pepper.length < 32) {
    throw new Error(
      "CLASS_CODE_PEPPER puudub või on lühem kui 32 märki. Seadista: " +
        "supabase secrets set CLASS_CODE_PEPPER=...",
    );
  }

  return pepper;
}

/** HMAC-SHA256(kood, pipar) hex-stringina – täpselt see, mis läheb baasi. */
export async function hashClassCode(
  code: string,
  pepper: string,
): Promise<string> {
  if (cachedKey === null || cachedPepper !== pepper) {
    cachedKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(pepper),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    cachedPepper = pepper;
  }

  const signature = await crypto.subtle.sign(
    "HMAC",
    cachedKey,
    new TextEncoder().encode(code),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
