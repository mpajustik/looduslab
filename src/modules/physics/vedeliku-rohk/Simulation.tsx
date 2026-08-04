import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "../../../ui/Button";
import { formatNumber } from "../../../lib/format";
import { LIQUID_DENSITIES, pressure, toKilopascals, type LiquidId } from "./model";

/**
 * Vedeliku rõhu simulatsioon – ainult VAADE (sisu/MOODUL-vedeliku-rohk.md
 * samm „explore"; docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Siin ei ole ühtegi korrutamist ega ühikuteisendust: rõhk tuleb `pressure()`-st,
 * kilopaskalid `toKilopascals()`-st (CLAUDE.md reegel 1). Anuma kuju lisavaade
 * (kitsas/lai/lehter) tuleb sammus 1.17 – täna on anum üks kindel kuju, sest
 * mudel ei tea kujust midagi ja see EI OLE selle sammu ülesanne.
 *
 * Kaks muudetavat suurust (DISAINIJUHIS „max 2"): sügavus (liugur) ja vedelik
 * (valik). Vedelike EESTIKEELSED nimed elavad siin, mitte mudelis (samm 1.15
 * otsused) – `LIQUID_DENSITIES` annab ainult tiheduse, järjekorra ja arvud.
 */

const MIN_DEPTH_M = 0;
const MAX_DEPTH_M = 2;
const DEPTH_STEP_M = 0.1;
const DEFAULT_DEPTH_M = 0.5;
const DEFAULT_LIQUID: LiquidId = "vesi";

const LIQUID_LABELS: Record<LiquidId, string> = {
  vesi: "vesi",
  "soolane-vesi": "soolane vesi",
  oli: "õli",
  elavhobe: "elavhõbe",
};

/** Sama järjekord, mis `LIQUID_DENSITIES`-is (model.ts) – üks tõe allikas. */
const LIQUID_IDS = Object.keys(LIQUID_DENSITIES) as LiquidId[];

/** Sügavusjooned anuma joonisel, mille juures näidatakse ka arvu (m). */
const DEPTH_TICKS_M = [0, 0.5, 1, 1.5, 2];

// --- Paigutus (SVG kasutajaühikud) ------------------------------------------

const VIEW = { width: 260, height: 260 };
const TANK = { left: 60, right: 220, top: 30, bottom: 230 };
const TICK_LENGTH = 8;
const CABLE_TOP_Y = 6;

/**
 * Andma tihedusest sõltuv täituvus, et raskem vedelik näeks joonisel
 * tihedam välja – VÄRV ei kanna siin ainsana infot, sildid ja arvud all
 * ütlevad sama asja sõnadega (DISAINIJUHIS).
 */
const MIN_DENSITY = Math.min(...Object.values(LIQUID_DENSITIES));
const MAX_DENSITY = Math.max(...Object.values(LIQUID_DENSITIES));
function liquidFillOpacity(densityKgM3: number): number {
  const share = (densityKgM3 - MIN_DENSITY) / (MAX_DENSITY - MIN_DENSITY);
  return 0.15 + share * 0.45;
}

/** Sügavus (m) → SVG y-koordinaat anuma sees. h=0 on vedeliku pind. */
function depthToY(depthM: number): number {
  return TANK.top + (depthM / MAX_DEPTH_M) * (TANK.bottom - TANK.top);
}

// `unlockedFeatures` (SimulationProps) puudub siin veel meelega – gate'itud
// lisavõimalust (anuma kuju, samm 1.17) ei ole enne, kui explore-samm ise
// avaneb. ModulePage annab siia ikkagi ainult `Simulation`, mille tüüp
// nõuab `ComponentType<SimulationProps>` – nullargumendiline funktsioon
// sobib, sest kutsuja pakub alati rohkem, kui see komponent parasjagu küsib.
export function Simulation() {
  const [depthM, setDepthM] = useState(DEFAULT_DEPTH_M);
  const [liquidId, setLiquidId] = useState<LiquidId>(DEFAULT_LIQUID);
  const sliderId = useId();
  const liquidGroupName = useId();

  const densityKgM3 = LIQUID_DENSITIES[liquidId];
  const pressureKPa = toKilopascals(pressure(densityKgM3, depthM));
  const sensorY = depthToY(depthM);

  return (
    <div className="flex flex-col gap-5">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        aria-label="Joonis: läbipaistev vedelikuga täidetud anum ja liigutatav rõhuandur, mis näitab sügavust ja rõhku."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Vedelik – täituvus näitab tihedust, aga silt ja arvud all kannavad infot */}
        <rect
          x={TANK.left}
          y={TANK.top}
          width={TANK.right - TANK.left}
          height={TANK.bottom - TANK.top}
          className="fill-info"
          fillOpacity={liquidFillOpacity(densityKgM3)}
        />

        {/* Anuma seinad ja põhi – vedeliku pind jääb lahtiseks (katkendjoon) */}
        <line
          x1={TANK.left}
          y1={TANK.top}
          x2={TANK.right}
          y2={TANK.top}
          className="stroke-ink-soft"
          strokeWidth={1.5}
          strokeDasharray="6 5"
        />
        <line
          x1={TANK.left}
          y1={TANK.top}
          x2={TANK.left}
          y2={TANK.bottom}
          className="stroke-ink"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <line
          x1={TANK.right}
          y1={TANK.top}
          x2={TANK.right}
          y2={TANK.bottom}
          className="stroke-ink"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <line
          x1={TANK.left}
          y1={TANK.bottom}
          x2={TANK.right}
          y2={TANK.bottom}
          className="stroke-ink"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <text x={TANK.left} y={TANK.top - 10} className="fill-ink-soft" fontSize={13}>
          vedeliku pind
        </text>

        {/* Sügavusjooned anuma kõrval */}
        <g className="stroke-ink-soft" strokeWidth={1}>
          {DEPTH_TICKS_M.map((tick) => {
            const y = depthToY(tick);
            return (
              <line
                key={tick}
                x1={TANK.right}
                y1={y}
                x2={TANK.right + TICK_LENGTH}
                y2={y}
              />
            );
          })}
        </g>
        <g className="fill-ink-soft" fontSize={11}>
          {DEPTH_TICKS_M.map((tick) => (
            <text key={tick} x={TANK.right + TICK_LENGTH + 4} y={depthToY(tick) + 4}>
              {formatNumber(tick, 1)} m
            </text>
          ))}
        </g>

        {/* Andur: kaabel ülevalt sensorini + sensor ise + katkendjoon sügavuse näitamiseks */}
        <line
          x1={(TANK.left + TANK.right) / 2}
          y1={CABLE_TOP_Y}
          x2={(TANK.left + TANK.right) / 2}
          y2={sensorY}
          className="stroke-ink"
          strokeWidth={2}
        />
        <line
          x1={TANK.left}
          y1={sensorY}
          x2={TANK.right}
          y2={sensorY}
          className="stroke-brand"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        <circle
          cx={(TANK.left + TANK.right) / 2}
          cy={sensorY}
          r={7}
          className="fill-brand stroke-white"
          strokeWidth={2}
        />
        <text
          x={(TANK.left + TANK.right) / 2 + 10}
          y={110}
          textAnchor="start"
          className="fill-ink-soft"
          fontSize={12}
        >
          rõhuandur
        </text>
      </svg>

      {/* Numbrid suurelt joonise all – vt peegeldumisseadus/Simulation.tsx sama
          põhjendus: projektorilt ei loe kaugelt istuv õpilane väikest silti. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Readout label="Sügavus" value={`${formatNumber(depthM, 1)} m`} tone="depth" />
        <Readout label="Rõhk vedelikus" value={`${formatNumber(pressureKPa, 1)} kPa`} tone="pressure" />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={sliderId} className="text-base font-medium text-ink">
          Sügavus (vedeliku pinnast)
        </label>
        <input
          id={sliderId}
          type="range"
          min={MIN_DEPTH_M}
          max={MAX_DEPTH_M}
          step={DEPTH_STEP_M}
          value={depthM}
          onChange={(event) => setDepthM(clampDepth(event.target.value))}
          aria-valuetext={`${formatNumber(depthM, 1)} meetrit`}
          className="h-11 w-full accent-brand"
        />
        <div className="flex justify-between text-sm text-ink-soft">
          <span>{formatNumber(MIN_DEPTH_M, 1)} m</span>
          <span>{formatNumber(MAX_DEPTH_M, 1)} m</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-base font-medium text-ink">Vedelik</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Vedeliku valik">
          {LIQUID_IDS.map((id) => (
            <label key={id} className="cursor-pointer">
              <input
                type="radio"
                name={liquidGroupName}
                value={id}
                checked={liquidId === id}
                onChange={() => setLiquidId(id)}
                className="peer sr-only"
              />
              <span className="flex min-h-11 items-center rounded-full border border-line px-4 text-base text-ink peer-checked:border-brand peer-checked:bg-brand-soft peer-checked:font-semibold peer-focus-visible:outline-2 peer-focus-visible:outline-brand peer-focus-visible:outline-offset-2">
                {LIQUID_LABELS[id]}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => {
            setDepthM(DEFAULT_DEPTH_M);
            setLiquidId(DEFAULT_LIQUID);
          }}
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          Alusta uuesti
        </Button>
      </div>
    </div>
  );
}

/**
 * Liuguri väärtus mudelile kõlblikuks.
 *
 * Mudel viskab vahemikust väljas vea (see on tahtlik – vt model.ts), seega
 * vaade ei tohi talle midagi kahtlast anda.
 */
function clampDepth(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_DEPTH_M;
  return Math.min(MAX_DEPTH_M, Math.max(MIN_DEPTH_M, parsed));
}

/** Üks suurus suurelt. Värv kordab anduri/vedeliku värvi, aga info kannab SILT. */
function Readout({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "depth" | "pressure";
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3 sm:flex-col sm:items-start sm:gap-1">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`h-1 w-5 shrink-0 rounded-full ${tone === "depth" ? "bg-brand" : "bg-info"}`}
        />
        <span className="text-sm font-medium text-ink-soft">{label}</span>
      </div>
      <p className="text-3xl font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
