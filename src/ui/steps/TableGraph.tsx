import type { TableRow } from "../../engine/answers";
import type { TableQuestion } from "../../engine/contract";
import { readNumber } from "../../checker/number";
import { axisTicks, tickDecimals, tickLabel } from "./tableGraphAxis";

/**
 * Mõõtetabeli punktdiagramm (sisu/MOODUL-vedeliku-rohk.md „collect").
 *
 * Joonis näitab ainult PUNKTE – sirget siia ei joonistata. Just selle
 * sõnastamine, et punktid on ühel sirgel ja sirge algab nullpunktist, on
 * järgmise küsimuse töö; ette joonistatud joon annaks vastuse ära.
 *
 * Oma SVG, mitte graafikuteek: neli punkti ja kaks telge on ~70 rida koodi ja
 * teegi lisamine tähendaks uut sõltuvust (CLAUDE.md reegel 4) igas moodulis,
 * mis tabelit kasutab.
 *
 * Siin LOETAKSE arve, aga ei OTSUSTATA midagi: lugemata jäänud lahter jääb
 * lihtsalt joonistamata ja ükski punkt ei ole „õige" ega „vale" värvi. Õigsuse
 * otsustab checker (CLAUDE.md reegel 3).
 */

/** Joonise mõõdud SVG-koordinaatides – kuvatav suurus tuleb CSS-ist. */
const WIDTH = 320;
const HEIGHT = 240;
const PAD = { left: 46, right: 12, top: 12, bottom: 38 };
const PLOT = {
  left: PAD.left,
  right: WIDTH - PAD.right,
  top: PAD.top,
  bottom: HEIGHT - PAD.bottom,
};

export function TableGraph({
  question,
  rows,
}: {
  question: TableQuestion;
  /** Praegused lahtrid – ka pooleli olevad; loetamatu lahter jääb vahele. */
  rows: TableRow[];
}) {
  const { graph } = question;
  if (!graph) return null;

  const xColumn = question.columns.find((column) => column.key === graph.x);
  const yColumn = question.columns.find((column) => column.key === graph.y);
  // Skeem valvab, et teljed osutavad veergudele, millel on min ja max
  // (contractSchema.ts) – see on kaitseklapp katkise mooduli vastu.
  if (
    !xColumn ||
    !yColumn ||
    xColumn.min === undefined ||
    xColumn.max === undefined ||
    yColumn.min === undefined ||
    yColumn.max === undefined ||
    xColumn.min === xColumn.max ||
    yColumn.min === yColumn.max
  ) {
    return null;
  }

  const xMin = xColumn.min;
  const xMax = xColumn.max;
  const yMin = yColumn.min;
  const yMax = yColumn.max;

  const toX = (value: number) =>
    PLOT.left + ((value - xMin) / (xMax - xMin)) * (PLOT.right - PLOT.left);
  const toY = (value: number) =>
    PLOT.bottom - ((value - yMin) / (yMax - yMin)) * (PLOT.bottom - PLOT.top);

  const points = rows.flatMap((row, index) => {
    const x = readNumber(row[xColumn.key] ?? "", xColumn.unit ?? "");
    const y = readNumber(row[yColumn.key] ?? "", yColumn.unit ?? "");
    if (x === undefined || y === undefined) return [];
    // Skaalast välja jäävat punkti ei nihutata serva – siis valetaks joonis
    // asukoha kohta. Sellise väärtuse peatab checker eraldi.
    if (x < xMin || x > xMax || y < yMin || y > yMax) return [];
    return [{ key: index, cx: toX(x), cy: toY(y) }];
  });

  const xTicks = axisTicks(xMin, xMax);
  const yTicks = axisTicks(yMin, yMax);
  const xDecimals = tickDecimals(xTicks);
  const yDecimals = tickDecimals(yTicks);

  const label = `Punktdiagramm: ${xColumn.label} rõhtteljel, ${yColumn.label} püstteljel. Punkte joonisel: ${points.length}. Samad arvud on tabelis.`;

  return (
    <figure className="m-0 max-w-md">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={label}
        className="w-full rounded-lg border border-line bg-white"
      >
        {/* Teljed: mõlemad algavad nullist vasakust alanurgast. */}
        <line
          x1={PLOT.left}
          y1={PLOT.top}
          x2={PLOT.left}
          y2={PLOT.bottom}
          className="stroke-ink"
          strokeWidth={2}
        />
        <line
          x1={PLOT.left}
          y1={PLOT.bottom}
          x2={PLOT.right}
          y2={PLOT.bottom}
          className="stroke-ink"
          strokeWidth={2}
        />

        {xTicks.map((tick) => (
          <g key={`x-${tick}`}>
            <line
              x1={toX(tick)}
              y1={PLOT.bottom}
              x2={toX(tick)}
              y2={PLOT.bottom + 5}
              className="stroke-ink"
              strokeWidth={2}
            />
            <text
              x={toX(tick)}
              y={PLOT.bottom + 20}
              textAnchor="middle"
              className="fill-ink-soft"
              fontSize={13}
            >
              {tickLabel(tick, xDecimals)}
            </text>
          </g>
        ))}

        {yTicks.map((tick) => (
          <g key={`y-${tick}`}>
            <line
              x1={PLOT.left - 5}
              y1={toY(tick)}
              x2={PLOT.left}
              y2={toY(tick)}
              className="stroke-ink"
              strokeWidth={2}
            />
            <text
              x={PLOT.left - 9}
              y={toY(tick) + 4}
              textAnchor="end"
              className="fill-ink-soft"
              fontSize={13}
            >
              {tickLabel(tick, yDecimals)}
            </text>
          </g>
        ))}

        {/* Telgede nimed ühikuga – ilma nendeta on joonis lihtsalt täppide hulk. */}
        <text
          x={(PLOT.left + PLOT.right) / 2}
          y={HEIGHT - 4}
          textAnchor="middle"
          className="fill-ink"
          fontSize={13}
        >
          {xColumn.label}
          {xColumn.unit ? ` (${xColumn.unit})` : ""}
        </text>
        <text
          x={12}
          y={(PLOT.top + PLOT.bottom) / 2}
          textAnchor="middle"
          transform={`rotate(-90 12 ${(PLOT.top + PLOT.bottom) / 2})`}
          className="fill-ink"
          fontSize={13}
        >
          {yColumn.label}
          {yColumn.unit ? ` (${yColumn.unit})` : ""}
        </text>

        {points.map((point) => (
          <circle key={point.key} cx={point.cx} cy={point.cy} r={6} className="fill-brand" />
        ))}
      </svg>
    </figure>
  );
}
