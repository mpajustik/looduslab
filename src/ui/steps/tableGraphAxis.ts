/**
 * Mõõtetabeli graafiku teljesildid (TableGraph.tsx).
 *
 * Omaette failis kahel põhjusel: komponendifail tohib eksportida ainult
 * komponente (react-refresh), ja need on puhtad funktsioonid, mida saab
 * testida ilma SVG-d renderdamata.
 *
 * Siin ei ole ühtki õppeaine reeglit – ainult arvu vormistus.
 */

/** Telje otsad ja kolm silti: algus, keskkoht, lõpp. */
export function axisTicks(min: number, max: number): number[] {
  return [min, (min + max) / 2, max];
}

/** Arv teljesildile – eesti koma, ilma tühja komakohata täisarvu järel. */
export function tickLabel(value: number, decimals: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(decimals).replace(".", ",");
}

/**
 * Mitu komakohta telje sildid vajavad.
 *
 * Fikseeritud üks komakoht (esimene kirjapanek) andis kitsal teljel (0 … 0,1)
 * sildid „0", „0,1", „0,1" – kaks eri kohta näevad välja ühesugused
 * (CodeRabbiti leid 2026-08-04). Täna sellist telge ei ole, aga järgmine
 * moodul võib selle tuua ja siis ei paista viga kuskilt välja.
 *
 * Kaks nõuet korraga, sest ainult erinevusest ei piisa: teljel 0 … 2,5 oleks
 * silt „3" küll teistest erinev, aga NÄITAKS VALET ARVU. Seepärast peab silt
 * ka oma väärtust ausalt esitama.
 *
 * Ülempiir 4 hoiab sildid loetavana: veel kitsam telg on joonise, mitte sildi
 * probleem.
 */
export function tickDecimals(ticks: number[]): number {
  const span = Math.abs(Math.max(...ticks) - Math.min(...ticks));
  // Lubatud ümardusviga on osa telje pikkusest, mitte fikseeritud arv – muidu
  // sõltuks reegel sellest, kas telg on meetrites või kilopaskalites.
  const allowed = span / 200;
  for (let decimals = 0; decimals < 4; decimals += 1) {
    const labels = ticks.map((tick) => tickLabel(tick, decimals));
    const distinct = new Set(labels).size === labels.length;
    const honest = ticks.every(
      (tick, index) => Math.abs(Number(labels[index].replace(",", ".")) - tick) <= allowed,
    );
    if (distinct && honest) return decimals;
  }
  return 4;
}
