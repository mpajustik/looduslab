/**
 * Korratav juhuslikkus: sama seeme → alati sama tulemus.
 *
 * Kaks kasutajat, üks kokkulepe: `resolve.ts` segab valikvastuseid ja valib
 * arvuvariandi, `review.ts` segab tänased kordamiskaardid. Mõlemal on sama
 * nõue – `Math.random` ei sobi, sest lehe värskendamine ei tohi järjekorda
 * vahetada ja testis peab tulemus olema ette teada.
 *
 * Füüsikat siin ei ole ja sõltuvusi ei ole (CLAUDE.md reegel 4): kümme rida
 * matemaatikat on odavam kui npm-pakett.
 */

/**
 * 32-bitine räsi tekstist (FNV-1a) – tekstist seeme.
 *
 * Miks räsi, mitte lihtsalt arv: seeme peab olema seotud millegi nähtavaga
 * (moodulikäigu algusaeg + küsimuse id, kordamisel tänane kuupäev). Ilma
 * selleta saaksid kõik ühe ekraani loosid sama seemne ja seguneksid ühtemoodi.
 */
export function hash32(text: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Korratav juhuslike arvude jada (mulberry32) ühest seemnest. */
export function randomFrom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates: iga järjekord on võrdselt tõenäoline. Algset loendit ei muuda. */
export function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
