// turvakontroll.mjs – kas service-võti on lekkinud repo või brauseri sisse?
//
// Reegel 6 ütleb „saladusi ei panda koodi". See skript kontrollib, kas
// reeglist ka päriselt kinni peeti. Kaks kohta, kust võti lekib:
//
//   1. GIT – kui võti satub jälgitavasse faili, on ta ajaloos igavesti,
//      ka siis, kui järgmine commit ta ära kustutab;
//   2. BRAUSER – Vite paneb bundle'isse KÕIK `VITE_`-eesliitega muutujad.
//      Kui keegi nimetab service-võtme kunagi `VITE_...`-iks, saadetakse
//      ta iga külastaja arvutisse ja terve RLS on mõttetu.
//
// Skript ei trüki kunagi võtit ennast välja – ainult failinime ja rea.
//
//   npm run turvakontroll
//
// Väljumiskood 0 = puhas, 1 = midagi leiti.

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const juur = process.cwd();
const leiud = [];
const teated = [];
// Kontrollid, mis jäid TEGEMATA. Neid ei tohi vaikides „puhta" alla lugeda:
// kontrollimata bundle ei ole puhas bundle, ta on lihtsalt vaatamata.
const puudulik = [];

function leid(tekst) {
  leiud.push(tekst);
}

// ---------------------------------------------------------------------------
// 1. Millised saladused meil üldse on? Loeme .env.local failist VÄÄRTUSED,
//    et otsida just neid – nii jääb vahele nii nimemuutus kui ka copy-paste.
// ---------------------------------------------------------------------------
// Vite laeb build'i ajal KÕIK need failid – seega võib saladus bundle'isse
// sattuda ka .env.production kaudu, mitte ainult .env.local-ist.
// `.env.prod*` on prod-keskkonna võtmed (docs/TOODANG.md). MÕLEMAD nimed
// peavad siin olema: `--mode prod` puhul laeb Vite nii `.env.prod` kui ka
// `.env.prod.local`. Kui siin oleks ainult `.local`, jääks `.env.prod`-i
// pandud service-võti leidmata ja kontroll ütleks „puhas" – täpselt siis, kui
// bundle'isse läheks PRODUKTSIOONI võti, mis on kõige kallim leke üldse.
const ENV_FAILID = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
  ".env.prod",
  ".env.prod.local",
];

const saladused = [];
for (const fail of ENV_FAILID) {
  const tee = join(juur, fail);
  if (!existsSync(tee)) continue;
  for (const rida of readFileSync(tee, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(rida);
    if (!m) continue;
    const [, nimi, toorVaartus] = m;
    const vaartus = toorVaartus.trim().replace(/^["']|["']$/g, "");
    if (!vaartus || vaartus.length < 20) continue;
    // Anon-võti ON avalik – tema brauserist leidmine on ootuspärane.
    if (nimi.includes("ANON")) continue;
    if (nimi.includes("SERVICE") || nimi.includes("SECRET") || nimi.includes("PEPPER")) {
      saladused.push({ nimi, vaartus });
    }
  }
}

if (saladused.length === 0) {
  puudulik.push(
    "env-failidest ei leitud ühtegi saladust (SERVICE/SECRET/PEPPER) – kõige " +
      "olulisem otsing jäi tegemata. Kas .env.local on olemas?",
  );
} else {
  teated.push(`Otsitakse ${saladused.length} saladuse väärtust: ${saladused.map((s) => s.nimi).join(", ")}`);
}

// ---------------------------------------------------------------------------
// 2. Jälgitavad failid – ükski neist ei tohi saladust sisaldada.
//    Käime git'i nimekirja, mitte kaustapuud: just git'i minev sisu loeb.
// ---------------------------------------------------------------------------
const jälgitavad = execFileSync("git", ["ls-files"], { cwd: juur, encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

// package-lock.json on suur ja masinatoodetud – räsid seal näevad välja nagu
// saladused, aga ei ole. Saladuse VÄÄRTUSE otsing käib ikka ka temas.
const binaarne = /\.(png|jpg|jpeg|gif|webp|ico|pdf|woff2?|ttf|zip)$/i;

for (const fail of jälgitavad) {
  if (binaarne.test(fail)) continue;
  const tee = join(juur, fail);
  if (!existsSync(tee) || statSync(tee).isDirectory()) continue;
  const sisu = readFileSync(tee, "utf8");

  for (const { nimi, vaartus } of saladused) {
    if (sisu.includes(vaartus)) {
      leid(`${fail}: sisaldab saladuse ${nimi} VÄÄRTUST – see fail on git'is!`);
    }
  }

  // JWT-kujuline string koodis. Anon-võti on avalik, aga ta ei kuulu
  // koodifaili ka siis – ta kuulub .env.local-i.
  if (/\.(ts|tsx|js|mjs|jsx|json|jsonc|html|css)$/.test(fail) && fail !== "package-lock.json") {
    const rida = sisu.split(/\r?\n/).findIndex((r) => /eyJ[A-Za-z0-9_-]{20,}\./.test(r));
    if (rida >= 0) {
      leid(`${fail}:${rida + 1}: JWT-kujuline string koodis (võtmed kuuluvad .env-i)`);
    }
  }
}

// ---------------------------------------------------------------------------
// 3. .env failid ei tohi olla git'is (peale .env.example).
// ---------------------------------------------------------------------------
for (const fail of jälgitavad) {
  if (/(^|\/)\.env/.test(fail) && !fail.endsWith(".env.example")) {
    leid(`${fail}: .env fail on git'is – seal on saladused, ta kuulub .gitignore'i`);
  }
}

// ---------------------------------------------------------------------------
// 4. VITE_-eesliitega saladus. Vite paneb need bundle'isse AUTOMAATSELT.
// ---------------------------------------------------------------------------
for (const fail of [...ENV_FAILID, ".env.example"]) {
  const tee = join(juur, fail);
  if (!existsSync(tee)) continue;
  for (const rida of readFileSync(tee, "utf8").split(/\r?\n/)) {
    const m = /^\s*(VITE_[A-Z0-9_]+)\s*=/.exec(rida);
    if (!m) continue;
    const nimi = m[1];
    if (/SERVICE|SECRET|PEPPER/.test(nimi)) {
      leid(`${fail}: ${nimi} – VITE_ eesliide saadab selle IGASSE brauserisse!`);
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Build'itud bundle. Siin on tõde selle kohta, mis külastajani jõuab.
// ---------------------------------------------------------------------------
const dist = join(juur, "dist");
if (!existsSync(dist)) {
  puudulik.push(
    "dist/ puudub – BUNDLE JÄI KONTROLLIMATA, st kõige tähtsam osa (mis " +
      "külastaja brauserisse jõuab). Jooksuta `npm run build` ja siis see skript uuesti.",
  );
} else {
  const failid = [];
  (function käi(kaust) {
    for (const nimi of readdirSync(kaust)) {
      const tee = join(kaust, nimi);
      if (statSync(tee).isDirectory()) käi(tee);
      else if (!binaarne.test(nimi)) failid.push(tee);
    }
  })(dist);

  let vaadatud = 0;
  for (const tee of failid) {
    const sisu = readFileSync(tee, "utf8");
    vaadatud++;
    for (const { nimi, vaartus } of saladused) {
      if (sisu.includes(vaartus)) {
        leid(
          `${relative(juur, tee)}: BUNDLE sisaldab saladust ${nimi} – see läheb iga külastaja brauserisse!`,
        );
      }
    }
  }
  teated.push(`Bundle: ${vaadatud} faili läbi vaadatud.`);
}

// ---------------------------------------------------------------------------
// Tulemus
// ---------------------------------------------------------------------------
for (const t of teated) console.log(t);
console.log("");

if (leiud.length > 0) {
  console.error(`VIGA: ${leiud.length} leidu.\n`);
  for (const l of leiud) console.error("  - " + l);
  console.error(
    "\nKui saladus on juba git'i läinud, ei piisa kustutamisest: võti tuleb Supabase'is VÄLJA VAHETADA.",
  );
  process.exit(1);
}

// Leide ei olnud – aga „puhas" tohib öelda ainult siis, kui kõik kontrollid
// ka päriselt jooksid. Muidu saaks plaani linnukese kätte skriptiga, kes
// vaatas tühja kausta.
if (puudulik.length > 0) {
  console.error("POOLIK: leide ei olnud, AGA osa kontrolle jäi tegemata.\n");
  for (const p of puudulik) console.error("  - " + p);
  console.error("\nSee EI ole roheline tuli. Tee puuduv ära ja jooksuta uuesti.");
  process.exit(1);
}

console.log("OK: service-võtit ega muid saladusi repost ega bundle'ist ei leitud.");
process.exit(0);
