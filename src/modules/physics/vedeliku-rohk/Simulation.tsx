import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { SimulationProps } from "../../../engine/simulationFeatures";
import { Button } from "../../../ui/Button";
import { formatNumber } from "../../../lib/format";
import { LIQUID_DENSITIES, pressure, toKilopascals, type LiquidId } from "./model";

/**
 * Vedeliku rõhu simulatsioon – ainult VAADE (sisu/MOODUL-vedeliku-rohk.md
 * samm „explore"; docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Siin ei ole ühtegi korrutamist ega ühikuteisendust: rõhk tuleb `pressure()`-st,
 * kilopaskalid `toKilopascals()`-st (CLAUDE.md reegel 1). Anuma kuju
 * (kitsas/lai/lehter) on AINULT selle faili teadmine – mudel ei võta kuju
 * argumendina (model.ts päis: „see on kogu mooduli mõte"), seega kuju muudab
 * ainult joonist, mitte kordagi arvutuskäiku.
 *
 * Kaks muudetavat suurust põhivaates (DISAINIJUHIS „max 2"): sügavus (liugur)
 * ja vedelik (valik). Anuma kuju on KOLMAS, aga avaneb alles pärast ülesannet 1
 * (`unlockedFeatures`, vt allpool) – enne seda ei ole ekraanil rohkem valikuid,
 * kui DISAINIJUHIS lubab. Vedelike EESTIKEELSED nimed elavad siin, mitte
 * mudelis (samm 1.15 otsused) – `LIQUID_DENSITIES` annab ainult tiheduse,
 * järjekorra ja arvud.
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

type ContainerShape = "lai" | "kitsas" | "lehter";

/** Anuma kuju lisavaate feature-silt (vt activities.ts `simulation.unlocks`). */
const SHAPE_FEATURE = "anuma-kuju";
const DEFAULT_SHAPE: ContainerShape = "lai";

// --- Paigutus (SVG kasutajaühikud) ------------------------------------------

const VIEW = { width: 260, height: 260 };
const TANK = { left: 60, right: 220, top: 30, bottom: 230 };
/** Sügavusjoonte (skaala) x-koht – FIKSEERITUD, ei liigu anuma kujuga kaasa. */
const AXIS_X = TANK.right;
const TICK_LENGTH = 8;
const CABLE_TOP_Y = 6;
const CENTER_X = (TANK.left + TANK.right) / 2;

/**
 * Anuma kuju: hüdrostaatilise paradoksi lisavaade (sisu/MOODUL-vedeliku-rohk.md
 * „explore" lisavaade). Iga kuju annab poollaiuse (SVG ühikutes) anuma
 * ülaservas ja põhjas – lehter kitseneb allapoole, ülejäänud kaks on ühtlase
 * laiusega. „lai" on VAIKIMISI ja kattub täpselt varasema (1.16) kindla
 * anumaga, et enne lisavaate avanemist ei muutuks joonis.
 */
const CONTAINER_HALF_WIDTHS: Record<ContainerShape, { top: number; bottom: number }> = {
  lai: { top: 80, bottom: 80 },
  kitsas: { top: 40, bottom: 40 },
  lehter: { top: 80, bottom: 30 },
};

const CONTAINER_SHAPES: ContainerShape[] = ["lai", "kitsas", "lehter"];

const CONTAINER_SHAPE_LABELS: Record<ContainerShape, string> = {
  lai: "lai",
  kitsas: "kitsas",
  lehter: "lehter",
};

/** Anuma poollaius (SVG ühikud) antud sügavusel – lehtril lineaarne kahanemine. */
function containerHalfWidthAt(shape: ContainerShape, depthM: number): number {
  const { top, bottom } = CONTAINER_HALF_WIDTHS[shape];
  const fraction = depthM / MAX_DEPTH_M;
  return top + (bottom - top) * fraction;
}

/** Anuma nurgapunktid (SVG koordinaadid) – nelinurk, mille servad võivad kalduda. */
function containerCorners(shape: ContainerShape) {
  const { top, bottom } = CONTAINER_HALF_WIDTHS[shape];
  return {
    topLeft: { x: CENTER_X - top, y: TANK.top },
    topRight: { x: CENTER_X + top, y: TANK.top },
    bottomLeft: { x: CENTER_X - bottom, y: TANK.bottom },
    bottomRight: { x: CENTER_X + bottom, y: TANK.bottom },
  };
}

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

export function Simulation({ unlockedFeatures = new Set() }: Partial<SimulationProps> = {}) {
  const [depthM, setDepthM] = useState(DEFAULT_DEPTH_M);
  const [liquidId, setLiquidId] = useState<LiquidId>(DEFAULT_LIQUID);
  const [shape, setShape] = useState<ContainerShape>(DEFAULT_SHAPE);
  const sliderId = useId();
  const liquidGroupName = useId();
  const shapeGroupName = useId();

  const densityKgM3 = LIQUID_DENSITIES[liquidId];
  const pressureKPa = toKilopascals(pressure(densityKgM3, depthM));
  const sensorY = depthToY(depthM);

  // Anuma kuju lisavaade avaneb pärast explore-1 ülesannet (activities.ts
  // `simulation.unlocks`) – enne seda ei näe õpilane veel valikut ega jooniselgi
  // muud kuju kui „lai" (`shape` jääb DEFAULT_SHAPE peale).
  const shapeAvailable = unlockedFeatures.has(SHAPE_FEATURE);
  const activeShape = shapeAvailable ? shape : DEFAULT_SHAPE;
  const corners = containerCorners(activeShape);
  const sensorHalfWidth = containerHalfWidthAt(activeShape, depthM);
  const sensorLeftX = CENTER_X - sensorHalfWidth;
  const sensorRightX = CENTER_X + sensorHalfWidth;
  const containerPolygon = `${corners.topLeft.x},${corners.topLeft.y} ${corners.topRight.x},${corners.topRight.y} ${corners.bottomRight.x},${corners.bottomRight.y} ${corners.bottomLeft.x},${corners.bottomLeft.y}`;

  return (
    <div className="flex flex-col gap-5">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        aria-label={
          shapeAvailable
            ? `Joonis: läbipaistev ${CONTAINER_SHAPE_LABELS[activeShape]} kujuga anum vedelikuga ja liigutatav rõhuandur, mis näitab sügavust ja rõhku.`
            : "Joonis: läbipaistev vedelikuga täidetud anum ja liigutatav rõhuandur, mis näitab sügavust ja rõhku."
        }
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Vedelik – täituvus näitab tihedust, aga silt ja arvud all kannavad infot.
            Anum on ALATI täis: sügavus loetakse pinnast, mitte anuma põhjast. */}
        <polygon
          points={containerPolygon}
          className="fill-info"
          fillOpacity={liquidFillOpacity(densityKgM3)}
        />

        {/* Anuma seinad ja põhi – vedeliku pind jääb lahtiseks (katkendjoon) */}
        <line
          x1={corners.topLeft.x}
          y1={corners.topLeft.y}
          x2={corners.topRight.x}
          y2={corners.topRight.y}
          className="stroke-ink-soft"
          strokeWidth={1.5}
          strokeDasharray="6 5"
        />
        <line
          x1={corners.topLeft.x}
          y1={corners.topLeft.y}
          x2={corners.bottomLeft.x}
          y2={corners.bottomLeft.y}
          className="stroke-ink"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <line
          x1={corners.topRight.x}
          y1={corners.topRight.y}
          x2={corners.bottomRight.x}
          y2={corners.bottomRight.y}
          className="stroke-ink"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <line
          x1={corners.bottomLeft.x}
          y1={corners.bottomLeft.y}
          x2={corners.bottomRight.x}
          y2={corners.bottomRight.y}
          className="stroke-ink"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <text x={TANK.left} y={TANK.top - 10} className="fill-ink-soft" fontSize={13}>
          vedeliku pind
        </text>

        {/* Sügavusjooned FIKSEERITUD kohal (AXIS_X) – ei liigu anuma kujuga
            kaasa, muidu peaks õpilane skaalat iga kord uuesti otsima. */}
        <g className="stroke-ink-soft" strokeWidth={1}>
          {DEPTH_TICKS_M.map((tick) => {
            const y = depthToY(tick);
            return (
              <line
                key={tick}
                x1={AXIS_X}
                y1={y}
                x2={AXIS_X + TICK_LENGTH}
                y2={y}
              />
            );
          })}
        </g>
        <g className="fill-ink-soft" fontSize={11}>
          {DEPTH_TICKS_M.map((tick) => (
            <text key={tick} x={AXIS_X + TICK_LENGTH + 4} y={depthToY(tick) + 4}>
              {formatNumber(tick, 1)} m
            </text>
          ))}
        </g>

        {/* Andur: kaabel ülevalt sensorini + sensor ise + katkendjoon sügavuse näitamiseks.
            Katkendjoone laius järgib anuma kuju sellel sügavusel – nii on
            hüdrostaatiline paradoks nähtav: laius muutub, rõhu näit all mitte. */}
        <line
          x1={CENTER_X}
          y1={CABLE_TOP_Y}
          x2={CENTER_X}
          y2={sensorY}
          className="stroke-ink"
          strokeWidth={2}
        />
        <line
          x1={sensorLeftX}
          y1={sensorY}
          x2={sensorRightX}
          y2={sensorY}
          className="stroke-brand"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        <circle
          cx={CENTER_X}
          cy={sensorY}
          r={7}
          className="fill-brand stroke-white"
          strokeWidth={2}
        />
        <text
          x={CENTER_X + 10}
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

      {/* Lisavõimalus: väiksem valik, mitte peanupp – see on vaate valik,
          mitte füüsikaline suurus (DISAINIJUHIS „max 2 muudetavat suurust"),
          ja avaneb alles pärast ülesannet 1 (vt `shapeAvailable` ülal). */}
      {shapeAvailable ? (
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <div className="flex flex-col gap-2">
            <span className="text-base font-medium text-ink">Anuma kuju</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Anuma kuju valik">
              {CONTAINER_SHAPES.map((id) => (
                <label key={id} className="cursor-pointer">
                  <input
                    type="radio"
                    name={shapeGroupName}
                    value={id}
                    checked={shape === id}
                    onChange={() => setShape(id)}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-11 items-center rounded-full border border-line px-4 text-base text-ink peer-checked:border-brand peer-checked:bg-brand-soft peer-checked:font-semibold peer-focus-visible:outline-2 peer-focus-visible:outline-brand peer-focus-visible:outline-offset-2">
                    {CONTAINER_SHAPE_LABELS[id]}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <p className="text-base leading-relaxed text-ink-soft">
            Rõhk sõltub ainult sügavusest ja vedelikust, mitte anuma kujust – vaheta
            kuju ja vaata, et rõhu näit samal sügavusel ei muutu.
          </p>
        </div>
      ) : null}

      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => {
            setDepthM(DEFAULT_DEPTH_M);
            setLiquidId(DEFAULT_LIQUID);
            setShape(DEFAULT_SHAPE);
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
