import { describe, expect, it } from "vitest";
import { STEP_TYPES } from "../src/engine/contractSchema";
import { STEP_LABELS, STEP_NOTES, stepRegistry } from "../src/ui/steps/registry";

/**
 * Sammutüübi ja tema ekraani kooskõla.
 *
 * Skeem (contractSchema.ts) ja UI-register (ui/steps/registry.ts) on kaks eri
 * loendit. Kui nad lahku lähevad, ei paista see kuskilt välja enne, kui
 * õpilane satub sammule, mille peale rakendus ütleb „ei oska näidata" –
 * ja see juhtub tunnis, mitte arenduses.
 *
 * Test ei renderda midagi (keskkond on node, vt vite.config.ts): kontrollime
 * registri kirjeid, mitte ekraanipilti.
 */

describe("sammuregister", () => {
  it("igal sammutüübil on komponent", () => {
    const missing = STEP_TYPES.filter((type) => stepRegistry[type] === undefined);
    expect(missing).toEqual([]);
  });

  it("registris ei ole tüüpe, mida skeem ei tunne", () => {
    expect(Object.keys(stepRegistry).sort()).toEqual([...STEP_TYPES].sort());
  });
});

describe("usalduslaused", () => {
  /**
   * Moodulileping: „Engine lisab automaatselt … ennustuse sammule »see ei ole
   * hinne« lause; õpetajale nähtavatele sammudele (explain, exit) märke »Sinu
   * vastust näeb õpetaja«". Mooduli autor neid ei kirjuta – seega peab siin
   * olema valvur, muidu kaob lause ühe hooletu muudatusega kõigist moodulitest
   * korraga ja keegi ei märka.
   */
  it("ennustuse samm ütleb, et see ei ole hinne", () => {
    expect(STEP_NOTES.predict).toContain("ei ole hinne");
  });

  it("õpetajale nähtavad sammud ütlevad seda õpilasele ette", () => {
    expect(STEP_NOTES.explain).toBe("Sinu vastust näeb õpetaja.");
    expect(STEP_NOTES.exit).toBe("Sinu vastust näeb õpetaja.");
  });

  it("igal sammutüübil on silt (või teadlik null)", () => {
    // `Record` sunnib kirje olemas olema, aga mitte selle täidetust – see
    // test hoiab ära, et uus tüüp saaks kogemata tühja stringi.
    for (const type of STEP_TYPES) {
      const label = STEP_LABELS[type];
      expect(label === null || label.trim().length > 0).toBe(true);
    }
  });
});
