import { formatNumber } from "../../../lib/format";
import { POINT_SOURCE_MIN_RATIO, type SourceSize } from "./model";

/**
 * Valgusallikate näidiku vormindus – ainult TEKST, mitte otsused.
 *
 * Omaette failis kahel põhjusel: Simulation.tsx tohib eksportida ainult
 * komponente (ESLint `react-refresh/only-export-components`), ja seda
 * funktsiooni on vaja testis (tests/valgusallikad.model.test.ts) – näidiku ja
 * sildi kooskõla piiri juures on selle mooduli tundlik koht.
 */

/**
 * Suhe näidikule: kuni 100 ühe kümnendkohaga („59,6"), üle selle täisarvuna
 * („108", „200").
 *
 * Miks mitte kõik täisarvuna: piir on 60 ja täisarvuks ümardades näeks õpilane
 * 59,6 juures näidikul „60 korda", kõrval aga silti „laiendatud allikas" –
 * ümardatud arv vaidleks sildiga vastu just seal, kuhu ülesanne 1 ta saadab
 * (CodeRabbiti leid 2026-08-10). Sada ja rohkem on piirist nii kaugel, et koma
 * seal ainult risustaks – ja siis ütlevad näidik ja kordamiskaart sama arvu
 * („108").
 *
 * Üks kümnendkoht ei kaota vastuolu päris ära: 59,96 ümarduks ikka „60,0"-ks.
 * Seepärast VÕRDLEB see funktsioon lõpuks kuvatavat arvu sildiga ja nihutab ta
 * vajadusel piirist eemale (mitte kunagi üle piiri): kui silt ütleb
 * „laiendatud", kuvatakse 59,9, mitte 60,0. Kaugemal piirist ei tee see reegel
 * midagi, seega 1,7 jääb 1,7-ks ja 107,76 jääb 108-ks (CodeRabbiti kordusleid).
 *
 * `kind` tuleb argumendina MUDELIST (`classifyByRatio`) – nii ei teki siia
 * teist, ujukomavea suhtes teistmoodi käituvat piirivõrdlust (CLAUDE.md
 * reegel 1: võrdluse teeb mudel, siin on ainult vorming).
 */
export function formatRatio(ratio: number, kind: SourceSize): string {
  const decimals = ratio < 100 ? 1 : 0;
  const scale = 10 ** decimals;
  const rounded = Math.round(ratio * scale) / scale;
  const agrees = rounded >= POINT_SOURCE_MIN_RATIO === (kind === "point");
  const shown = agrees
    ? rounded
    : kind === "point"
      ? Math.ceil(ratio * scale) / scale
      : Math.floor(ratio * scale) / scale;
  return formatNumber(shown, decimals);
}
