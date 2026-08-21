import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Valvetest: simulatsioonis ei tohi olla toorest `<input type="range">`.
 *
 * Miks ta olemas on. P1 kõigis 17 simulatsioonis oli liuguri juures ainult nimi
 * ja otspunktid, aga MITTE praegust väärtust – väärtus elas `Readout`-ribal
 * ekraani ülaosas ja telefonis pidi õpilane liugurit lohistades kerima, et
 * näha, mille peale ta sättis. Parandus oli ühiskomponent `ui/SliderField.tsx`.
 *
 * See test on parandusest TÄHTSAM. Ilma temata kirjutab järgmine moodul (P2
 * „Valguse murdumine" ja edasi) lihtsalt uue `<input type="range">`-i – muster
 * on nakkav, sest uus moodul tehakse vana eeskujul. Dokumendirida on lootus,
 * test on garantii: rikkuv moodul kukub `npm run test`-il läbi enne commit'i,
 * ka siis, kui keegi ei mäleta, miks see reegel olemas on.
 *
 * Testi ei saa teha komponenditestina (renderdada ja väärtust otsida): projekti
 * Vitest jookseb `environment: "node"`-is ja jsdom oleks uus sõltuvus
 * (CLAUDE.md reegel 4). Lähtekoodi lugemine annab siin sama kindluse ja on
 * kiirem – kontrollitav asi ongi „mis failis kirjas on", mitte „mis ekraanile
 * jõuab".
 */

const MODULES_DIR = join(process.cwd(), "src", "modules", "physics");

/**
 * Kommentaarid välja, ENNE kui koodist liugurit otsime.
 *
 * Mitmes simulatsioonis on JSDoc-lõik, mis SELETAB liugurit ja sisaldab
 * seepärast teksti `<input type="range">`. Ilma selle sammuta kukuks test läbi
 * failide peal, mis on täiesti korras – ja seletav kommentaar oleks järsku
 * keelatud.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function simulationFiles(): { module: string; source: string }[] {
  return readdirSync(MODULES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      module: entry.name,
      path: join(MODULES_DIR, entry.name, "Simulation.tsx"),
    }))
    .filter((entry) => {
      try {
        readFileSync(entry.path);
        return true;
      } catch {
        // Moodulil ei pruugi explore-sammu ja seega simulatsiooni olla.
        return false;
      }
    })
    .map((entry) => ({
      module: entry.module,
      source: readFileSync(entry.path, "utf8"),
    }));
}

describe("simulatsioonide liugurid", () => {
  const files = simulationFiles();

  it("mooduleid on üldse olemas (test ise ei tohi vaikselt tühjaks jääda)", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)(
    "$module ei kasuta toorest <input type=\"range\">, vaid ui/SliderField'i",
    ({ source }) => {
      expect(stripComments(source)).not.toContain('type="range"');
    },
  );

  it.each(files)("$module impordib SliderField'i, kui ta teda kasutab", ({ source }) => {
    const code = stripComments(source);
    if (!code.includes("<SliderField")) return;
    expect(code).toContain('from "../../../ui/SliderField"');
  });
});
