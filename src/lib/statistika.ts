/**
 * Kasutusstatistika (plaan 2.17): Cloudflare Web Analytics.
 *
 * Miks just tema: ta ei pane küpsist ega jälgi kasutajat üle lehtede, seega
 * ei ole vaja nõusolekubännerit. Näeme, milliseid lehti avatakse ja kas
 * miski on liiga aeglane – midagi konkreetse lapse kohta ei näe.
 *
 * Miks ta ei ole `index.html`-is: seal ei saa rida tingimuslikuks teha ja
 * siis laadiks iga arendusserveri käivitus Cloudflare'i skripti. Siit käib
 * ta ainult toodangus ja ainult siis, kui märgis on antud.
 */

const BEACON_URL = "https://static.cloudflareinsights.com/beacon.min.js";

/**
 * Teed, mille sees on midagi, mida kolmanda teenuse aruandesse saata ei tohi:
 * `/liitu/483920` on klassikood (klassi uks!) ja `/opetaja/klass/<uuid>` on
 * konkreetne klass.
 *
 * Miks see üldse loeb: Cloudflare EI logi päringut (`?kood=…`), aga logib
 * TEE. Ainuüksi päringu vältimisest siin ei piisaks.
 */
const TUNDLIKUD_TEED = [/^\/liitu\//, /^\/opetaja\/klass\//];

export function onTundlikTee(path: string): boolean {
  return TUNDLIKUD_TEED.some((muster) => muster.test(path));
}

let lisatud = false;

export function alustaStatistikat(): void {
  if (lisatud) return;

  const token = import.meta.env.VITE_CF_ANALYTICS_TOKEN;
  if (!token || !import.meta.env.PROD) return;

  /*
   * Beacon jälgib ka SPA-navigeerimist ja saadab iga teevahetuse juures
   * SELLE tee, millelt lahkuti. Maha võtta teda enam ei saa. Seega ainus
   * viis klassikoodi eemal hoida on teda tundlikul lehel ÜLDSE mitte
   * käivitada – need lehevaated jäävad lihtsalt lugemata.
   *
   * Teine pool sellest kaitsest on `ModulePage`-is: koodi sisestamisest
   * liitumislehele minnakse täislaadimisega, et juba laetud beacon ei saaks
   * uut teed näha.
   */
  if (onTundlikTee(window.location.pathname)) return;

  lisatud = true;
  const script = document.createElement("script");
  script.src = BEACON_URL;
  script.defer = true;
  // Cloudflare loeb märgise sellest atribuudist (JSON, mitte pelk string).
  script.setAttribute("data-cf-beacon", JSON.stringify({ token }));
  document.head.append(script);
}
