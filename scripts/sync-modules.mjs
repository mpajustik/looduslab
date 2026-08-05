/**
 * sync-modules – moodulite manifestid Supabase `modules` tabelisse (samm 2.5).
 *
 * Käivitub ARVUTIS/CI-s, mitte rakenduses: rakendus ainult LOEB modules
 * tabelit (002_rls.sql poliitika `modules_read_all`). Kirjutamiseks on vaja
 * service-võtit, mis käib RLS-ist mööda – see võti ei tohi kunagi jõuda
 * brauserisse, seega ta EI OLE `VITE_` eesliitega (CLAUDE.md reegel 6).
 *
 * Käsk:  npm run sync-modules            (kirjutab baasi)
 *        npm run sync-modules -- --dry-run   (näitab ainult, mida teeks)
 *
 * Miks .mjs, mitte .ts: skript ise on tavaline Node-fail, aga moodulite
 * manifestid on TypeScript ja impordivad üksteist laiendita. Nende lugemiseks
 * kasutame Vite'i (juba olemas devDependency'na) `ssrLoadModule`-t – nii kehtib
 * skriptis TÄPSELT sama moodulite register kui rakenduses (src/modules/
 * registry.ts on ainus koht, mis teab kõiki mooduleid) ega teki teist,
 * käsitsi hooldatavat nimekirja, mis vaikselt tegelikkusest maha jääks.
 */
import { createClient } from "@supabase/supabase-js";
import { createServer } from "vite";

const dryRun = process.argv.includes("--dry-run");

/** Ühtne lõpetus: viga läheb stderr'i ja väljumiskood on 1 (CI näeb). */
function fail(message) {
  console.error(`\nsync-modules: ${message}\n`);
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!dryRun && (!url || !serviceKey)) {
  fail(
    "SUPABASE_URL ja SUPABASE_SERVICE_ROLE_KEY peavad .env failis olema " +
      "(vt .env.example). .env on gitignore'is – võtit koodi ei panda.",
  );
}

// Sama viga, teine suund: VITE_-eesliitega võti satuks Vite'i kaudu
// brauseribundle'isse. Parem katkestada kohe kui vaikselt saladus lekitada.
if (process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
  fail(
    "VITE_SUPABASE_SERVICE_ROLE_KEY on defineeritud. Service-võti EI TOHI " +
      "olla VITE_ eesliitega – Vite paneb kõik VITE_ muutujad brauserisse. " +
      "Nimeta ta .env failis ümber SUPABASE_SERVICE_ROLE_KEY-ks.",
  );
}

/** Otsustusreeglid (scripts/syncRules.ts), täidetakse readManifests()-is. */
let rules;

/**
 * Loe registrist kõikide moodulite manifestid.
 *
 * Vite server käivitatakse middleware-režiimis (ühtegi porti ei avata) ainult
 * selleks, et TS-failid Node'is käima saada; lõpuks paneme ta kinni.
 */
async function readManifests() {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "warn",
  });

  try {
    const { moduleRegistry } = await server.ssrLoadModule("/src/modules/registry.ts");
    const { manifestSchema } = await server.ssrLoadModule("/src/engine/contractSchema.ts");
    // Reeglid tulevad sama teed – vt scripts/syncRules.ts.
    rules = await server.ssrLoadModule("/scripts/syncRules.ts");

    const manifests = [];
    for (const [id, load] of Object.entries(moduleRegistry)) {
      const { manifest } = await load();

      // Zod-kontroll ka siin, mitte ainult testis: see skript kirjutab baasi,
      // kust õpetaja koondvaade oma pealkirjad võtab. Vigane manifest peab
      // jääma faili, mitte jõudma tabelisse.
      const parsed = manifestSchema.parse(manifest);

      if (parsed.id !== id) {
        fail(
          `Registri võti "${id}" ja manifest.id "${parsed.id}" ei klapi. ` +
            "Võti PEAB olema sama, mis mooduli id (docs/MOODULILEPING.md).",
        );
      }
      manifests.push(parsed);
    }
    return manifests;
  } finally {
    await server.close();
  }
}

const manifests = await readManifests();

if (manifests.length === 0) {
  fail("Registris ei ole ühtegi moodulit – midagi sünkida ei ole.");
}

// Ainult need veerud, mis modules tabelis on (001_tables.sql). Manifesti
// ülejäänud väljad (goal, outcomes, concepts, practicalWork) elavad koodis –
// neid vajab katvusraport (etapp 4.0), mitte klassivaade.
const rows = manifests.map((manifest) => ({
  id: manifest.id,
  slug: manifest.slug,
  title: manifest.title,
  subject: manifest.subject,
  status: manifest.status,
  version: manifest.version,
  minutes: manifest.minutes,
}));

console.log(`Registris ${rows.length} moodulit:`);
for (const row of rows) {
  console.log(`  ${row.id}  v${row.version}  ${row.status}  "${row.title}"`);
}

if (dryRun) {
  console.log("\n--dry-run: baasi ei kirjutatud.");
  process.exit(0);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// LOE ENNE KUI KIRJUTAD. Baasi praegune seis otsustab, kas kirjutada tohib:
// muutunud või kolinud slug tuleb kinni püüda ENNE upsert'i, sest pärast on
// vana slug juba üle kirjutatud ja lingid katki (ülevaatuse leid).
const { data: existing, error: readError } = await supabase.from("modules").select("id, slug");

if (readError) {
  // Levinuim põhjus: service-võtme asemel on anon-võti (RLS lubab lugeda,
  // aga mitte kirjutada) või vale projekt .env failis.
  fail(`Baasi lugemine ebaõnnestus: ${readError.message}`);
}

const conflicts = rules.findBlockingConflicts(rows, existing);

if (conflicts.length > 0) {
  fail(
    `Baasi EI kirjutatud, ${conflicts.length} vastuolu:\n` +
      conflicts.map((problem) => `  - ${problem}`).join("\n"),
  );
}

// upsert onConflict: "id" – id on igavene (CLAUDE.md reegel 11), seega teistkordne
// käivitamine uuendab olemasolevat rida ega tekita duplikaati.
const { error: upsertError } = await supabase
  .from("modules")
  .upsert(rows, { onConflict: "id" });

if (upsertError) {
  fail(`Kirjutamine ebaõnnestus: ${upsertError.message}`);
}

console.log(`\nSünkitud ${rows.length} moodulit.`);

// Baasis võib olla mooduleid, mida registris enam ei ole (nt kaust kustutatud).
// Neid EI kustutata: attempts.module_id viitab neile (ON DELETE RESTRICT) ja
// õpilaste vanad vastused ripuvad küljes. Õige viis on status: "archived".
// Kirjutamine ise õnnestus, aga väljumiskood on 1: vaikne „kõik korras" oleks
// siin vale, sest baas ja register lahknevad (ülevaatuse leid).
const orphans = rules.findOrphans(rows, existing);

if (orphans.length > 0) {
  fail(
    `Moodulid kirjutati, AGA baasis on ${orphans.length} moodulit, mida registris ei ole:\n` +
      orphans.map((id) => `  - ${id}`).join("\n") +
      "\nNeid EI kustutatud (vastused viitavad neile). Kui moodul on tõesti " +
      'pensionil, taasta ta kaust ja pane manifesti status: "archived".',
  );
}
