/**
 * Veaseire (plaan 2.17). Ilma selleta ei saa me kunagi teada, et õpilasel
 * läks midagi katki – laps ei kirjuta kellelegi, ta lihtsalt loobub.
 *
 * Kolm otsust, mis siin on teadlikult tehtud:
 *
 * 1. **Sentry laaditakse alles siis, kui viga juhtub.** Pakk on ~148 kB
 *    gzip – rohkem kui kogu ülejäänud esileht. Kui õpilasel midagi katki
 *    ei lähe (tavaline juhtum), ei laadi ta sellest baiti. Alguses
 *    registreerime ainult kaks kuulajat, mis on paar rida koodi.
 *    Hind: esimesel veal ei ole Sentryl „leivapuru" (mida kasutaja enne
 *    tegi). Virna ja veateate ta saab – ja vähem andmeid on siin pigem
 *    voorus (vt punkt 3).
 * 2. **Töötab ainult toodangus ja ainult siis, kui DSN on olemas.**
 *    Arenduses on konsool niikuinii lahti. NB! `VITE_SENTRY_DSN` peab
 *    olema olemas **build'i ajal** (Cloudflare → Build variables) – kui
 *    teda ei ole, viskab Vite kogu selle koodi buildist välja.
 * 3. **Isikuandmeid ei saadeta.** Vt `puhastaSyndmus` – selle faili
 *    kõige tähtsam osa.
 */

type SentryModule = typeof import("@sentry/react");
type SentryOptions = NonNullable<Parameters<SentryModule["init"]>[0]>;
type SentryEvent = Parameters<NonNullable<SentryOptions["beforeSend"]>>[0];

/** Kas laadimine on juba käima lükatud – teist korda enam ei proovi. */
let laadimine: Promise<SentryModule | null> | null = null;

/** Kas kuulajad on registreeritud (StrictMode kutsub `alustaSeiret` kaks korda). */
let alustatud = false;

/**
 * Aadress, kust võiks kogemata isikuandmeid välja lugeda:
 * `/liitu/ABC123` on klassikood, `/opetaja/klass/<uuid>` on klassi id.
 * Mõlemad asendame kohanimega – veaotsingul piisab teadmisest, MILLINE
 * leht katki läks, mitte KELLE oma.
 */
export function maskiTunnused(text: string): string {
  return text
    .replace(/\/liitu\/[^/?#\s]+/g, "/liitu/:kood")
    .replace(/\/opetaja\/klass\/[^/?#\s]+/g, "/opetaja/klass/:id");
}

/**
 * Sama, aga aadressi peal: lisaks maskimisele lendab päring (`?…`) ja ankur
 * (`#…`) tervikuna ära, sest sinna võib sattuda „kuhu edasi" link.
 *
 * Vabateksti peal seda EI tohi kasutada – seal lõikaks ta lause esimese
 * küsimärgi kohalt pooleks.
 */
export function puhastaAadress(url: string): string {
  return maskiTunnused(url).replace(/[?#].*$/, "");
}

/**
 * Viimane vahe enne saatmist. Sentry ei saada vabateksti omal algatusel,
 * aga veateade ise võib olla kirjutatud nii, et sisaldab õpilase nime või
 * vastust – ja aadress sisaldab klassikoodi. Seepärast:
 *
 * - `user` maha (me ei taha teada, KES vea sai)
 * - aadressid puhtaks, päring ja küpsised maha
 * - **ka vea enda tekst** – aadress võib olla lause sees (ülevaatuse leid:
 *   `Error("Liitumine ebaõnnestus: /liitu/483920")` läheks muidu välja
 *   koodiga, kuigi `request.url` on korralikult maskitud)
 */
export function puhastaSyndmus(event: SentryEvent): SentryEvent {
  delete event.user;

  if (event.message) event.message = maskiTunnused(event.message);
  if (event.logentry?.message) {
    event.logentry.message = maskiTunnused(event.logentry.message);
  }
  for (const viga of event.exception?.values ?? []) {
    if (viga.value) viga.value = maskiTunnused(viga.value);
  }

  if (event.request) {
    if (event.request.url) event.request.url = puhastaAadress(event.request.url);
    delete event.request.query_string;
    delete event.request.cookies;
    delete event.request.data;
    delete event.request.headers;
  }

  for (const jälg of event.breadcrumbs ?? []) {
    if (jälg.message) jälg.message = maskiTunnused(jälg.message);
    for (const võti of ["url", "to", "from"] as const) {
      const väärtus = jälg.data?.[võti];
      if (typeof väärtus === "string") jälg.data![võti] = puhastaAadress(väärtus);
    }
  }

  return event;
}

/** Laeb ja seadistab Sentry. Kutsutakse alles esimese vea peale. */
function laeSentry(): Promise<SentryModule | null> {
  // See rida ei ole liigne, kuigi `teataViga` juba kontrollis. Vite asendab
  // `import.meta.env.VITE_SENTRY_DSN` build'i ajal päris väärtusega – kui
  // DSN-i ei ole, näeb ehitaja siit `if (true) return`, viskab ülejäänu ära
  // ja Sentry pakki EI PANDA üldse dist-kausta. Ilma selle reata veaks iga
  // dev-build kaasa 450 kB koodi, mida keegi kunagi alla ei lae.
  if (!import.meta.env.VITE_SENTRY_DSN) return Promise.resolve(null);

  laadimine ??= import("@sentry/react")
    .then((moodul) => {
      moodul.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        // Ei IP-aadressi, ei kasutajanime – Sentry ei tuleta neid ise juurde.
        sendDefaultPii: false,
        // Jõudlusmõõtmist ega salvestusi (Replay) me ei tee: need saadaksid
        // kaasa lehe sisu, kus on laste nimed ja vastused.
        tracesSampleRate: 0,
        beforeSend: puhastaSyndmus,
      });
      return moodul;
    })
    .catch(() => null); // Seire allakukkumine ei tohi rakendust segada.

  return laadimine;
}

/** Kas seire on üldse sisse lülitatud (DSN antud ja tegemist on toodanguga). */
function seireSees(): boolean {
  return Boolean(import.meta.env.VITE_SENTRY_DSN) && import.meta.env.PROD;
}

/**
 * Teatab veast. Toodangus laeb esimene viga Sentry alla ja saadab ta ära;
 * arenduses jääb kõik konsooli.
 */
export function teataViga(error: unknown, kontekst?: string): void {
  console.error(kontekst ? `Püütud viga (${kontekst}):` : "Püütud viga:", error);
  if (!seireSees()) return;

  void laeSentry().then((moodul) => {
    moodul?.captureException(error, kontekst ? { tags: { kontekst } } : undefined);
  });
}

/**
 * Registreerib kuulajad vigadele, mida ükski `try` ega ErrorBoundary kinni
 * ei püüa. Kutsutakse `main.tsx`-ist üks kord.
 */
export function alustaSeiret(): void {
  if (alustatud || !seireSees()) return;
  alustatud = true;

  window.addEventListener("error", (sündmus) => {
    teataViga(sündmus.error ?? sündmus.message, "window.error");
  });
  window.addEventListener("unhandledrejection", (sündmus) => {
    teataViga(sündmus.reason, "unhandledrejection");
  });
}
