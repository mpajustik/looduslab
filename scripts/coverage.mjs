/**
 * coverage – ainekava katvuse raport (samm 4.0).
 *
 * Vastab ühele küsimusele: MIDA ainekavast (sisu/AINEKAVA-fyysika-8.md) ei
 * ole veel ükski aktiivne moodul katnud? Sellest algab iga uue mooduli töö
 * (docs/MOODULILEPING.md, plaan/ETAPP-4-laiendus.md 4.1).
 *
 * Käsk:  npm run coverage              (kogu raport)
 *        npm run coverage -- --katmata (ainult augud – lühike loend)
 *
 * VÄLJUMISKOOD, sest CI loeb ainult seda:
 *   0 – kõik korras VÕI ainult katmata asju (need on ootuspärased: kaks
 *       pilootmoodulit katavad murdosa – plaan ütleb ise, et ülejäänu on
 *       punane). CI-s HOIATUS, mitte viga.
 *   1 – midagi on päriselt katki: manifest viitab ID-le, mida ainekavas ei
 *       ole (trükiviga – moodul jääks raportis nähtamatuks), või ainekava
 *       faili kuju on muutunud nii, et parsimine ei leia enam sisu.
 *
 * Miks .mjs ja Vite: täpselt samal põhjusel mis sync-modules.mjs juures –
 * moodulite manifestid on TypeScript ja ainus tõe allikas nende kohta on
 * src/modules/registry.ts. Teist, käsitsi hooldatavat nimekirja siia ei tehta.
 */
import { readFile } from "node:fs/promises";
import { createServer } from "vite";

const AINEKAVA = "sisu/AINEKAVA-fyysika-8.md";

const onlyMissing = process.argv.includes("--katmata");

function fail(message) {
  console.error(`\ncoverage: ${message}\n`);
  process.exit(1);
}

/**
 * Loe registrist kõikide moodulite manifestid – sama võte kui sync-modules:
 * Vite middleware-režiimis (ühtegi porti ei avata) ainult TS-i lugemiseks.
 */
async function readFromSource() {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "warn",
  });

  try {
    const { moduleRegistry } = await server.ssrLoadModule("/src/modules/registry.ts");
    const { manifestSchema } = await server.ssrLoadModule("/src/engine/contractSchema.ts");
    const rules = await server.ssrLoadModule("/scripts/coverageRules.ts");

    const manifests = [];
    for (const load of Object.values(moduleRegistry)) {
      const { manifest } = await load();
      manifests.push(manifestSchema.parse(manifest));
    }
    return { manifests, rules };
  } finally {
    await server.close();
  }
}

/** „3/14 (21%)" – protsent on siin selleks, et pilt oleks aus, mitte ilus. */
function share({ covered, total }) {
  const percent = total === 0 ? 100 : Math.round((covered / total) * 100);
  return `${covered}/${total} (${percent}%)`;
}

function printItems(label, items) {
  const missing = items.filter((item) => item.modules.length === 0);
  const covered = items.filter((item) => item.modules.length > 0);

  if (items.length === 0) return;

  console.log(`  ${label}: ${share({ covered: covered.length, total: items.length })}`);

  if (!onlyMissing) {
    for (const item of covered) {
      console.log(`    [x] ${item.id} – ${item.modules.join(", ")}`);
    }
  }
  for (const item of missing) {
    console.log(`    [ ] ${item.id}`);
  }
}

const { manifests, rules } = await readFromSource();

let markdown;
try {
  markdown = await readFile(AINEKAVA, "utf8");
} catch (error) {
  fail(`${AINEKAVA} ei ole loetav: ${error.message}. Käivita käsk projekti juurkaustast.`);
}

let coverage;
try {
  coverage = rules.buildCoverage(rules.parseCurriculum(markdown), manifests);
} catch (error) {
  fail(error.message);
}

console.log(`Ainekava katvus – ${AINEKAVA}`);
console.log(
  `Aktiivseid mooduleid: ${manifests.filter((manifest) => manifest.status === "active").length}` +
    (coverage.ignoredModules.length > 0
      ? ` (arvestamata arhiveeritud: ${coverage.ignoredModules.join(", ")})`
      : ""),
);
console.log("");

for (const block of coverage.blocks) {
  console.log(`${block.id}. ${block.title}`);
  printItems("Õpitulemused", block.outcomes);
  printItems("Põhimõisted", block.concepts);
  printItems("Praktilised tööd", block.practicalWork);
  console.log("");
}

if (!onlyMissing) {
  console.log("Mooduli kaupa:");
  for (const module of rules.summarizeModules(manifests)) {
    const parts = [...module.outcomes, ...module.practicalWork];
    console.log(`  ${module.id} – "${module.title}"`);
    console.log(`    ainekava: ${parts.length > 0 ? parts.join(", ") : "—"}`);
    console.log(`    mõisted: ${module.concepts.join(", ")}`);
  }
  console.log("");
}

console.log("KOKKU");
console.log(`  Õpitulemused:     ${share(coverage.totals.outcomes)}`);
console.log(`  Põhimõisted:      ${share(coverage.totals.concepts)}`);
console.log(`  Praktilised tööd: ${share(coverage.totals.practicalWork)}`);

if (coverage.extraConcepts.length > 0) {
  // Märkus, mitte hoiatus: moodul TOHIB õpetada mõistet, mida ainekava
  // põhimõistete loendis ei ole. Kirjas on ta selleks, et trükiviga
  // („tasapeeglid") ei jääks vaikselt katvust lõhkuma.
  console.log("\nMärkus – mõisted, mida ainekava nimeliselt ei nimeta:");
  for (const extra of coverage.extraConcepts) {
    console.log(`  ${extra.module}: "${extra.concept}"`);
  }
}

if (coverage.unknownReferences.length > 0) {
  fail(
    `${coverage.unknownReferences.length} viidet ainekavasse ei lähe kokku:\n` +
      coverage.unknownReferences.map((problem) => `  - ${problem}`).join("\n") +
      "\nParanda manifestis või lisa ID ainekava faili. Sellise viitega moodul " +
      "EI kata raportis midagi, kuigi ta seda arvab.",
  );
}

const missing =
  coverage.totals.outcomes.total -
  coverage.totals.outcomes.covered +
  (coverage.totals.concepts.total - coverage.totals.concepts.covered) +
  (coverage.totals.practicalWork.total - coverage.totals.practicalWork.covered);

if (missing > 0) {
  // HOIATUS, mitte viga (plaan 4.0): katmata ainekava on praegu normaalne
  // seis, mitte rike. Väljumiskood jääb 0-ks, et CI ei jääks punaseks
  // asja pärast, mida iga uus moodul niikuinii vähendab.
  console.log(`\nHoiatus: ${missing} ainekava asja on veel katmata.`);
}
