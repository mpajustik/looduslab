/** Sisemine tühik (U+00A0) – hoiab arvu ja ühiku ühel real. */
const NBSP = " ";

/**
 * Vormindab arvu eesti keele reeglite järgi: koma kümnendkoha eraldajana ja
 * sisemine tühik tuhandete eraldajana (19600 → "19 600", 9.81 → "9,81").
 */
export function formatNumber(value: number, decimals = 0): string {
  const [whole, fraction] = value.toFixed(decimals).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return fraction ? `${grouped},${fraction}` : grouped;
}
