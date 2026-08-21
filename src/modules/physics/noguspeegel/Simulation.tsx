import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { SimulationProps } from "../../../engine/simulationFeatures";
import { Button } from "../../../ui/Button";
import { SliderField } from "../../../ui/SliderField";
import { formatNumber } from "../../../lib/format";
import {
  MIRROR_HALF_HEIGHT_CM,
  SLIDERS,
  centimetresFromMetres,
  focalLength,
  metresFromCentimetres,
  mirrorDepth,
  reflectParallelRay,
} from "./model";

/**
 * Nõguspeegli simulatsioon – ainult VAADE (sisu/MOODUL-noguspeegel.md,
 * samm „explore"; docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Siin ei ole ühtegi füüsikavalemit: peegli kaar, kohtumispunktid, teljelõiked,
 * fookus ja mõlemad nurgad tulevad `model.ts`-ist (CLAUDE.md reegel 1). Selles
 * failis on ainult PAIGUTUS – meetrite skaleerimine piksliteks, kaarte raadiused
 * ja siltide kohad. Sama füüsika toidab ka mooduli joonised (figures.tsx), seega
 * ei saa joonis ja simulatsioon kunagi eri asja näidata.
 *
 * ÜHIKUD: mudel arvutab meetrites, liugurid ja ekraan räägivad sentimeetrites.
 * Ühik muutub AINULT `metresFromCentimetres` (liugur → mudel) ja
 * `centimetresFromMetres` (mudel → ekraan) sees; pikslid tulevad meetritest
 * `PX_PER_METRE` kaudu. Mõõtkava on MÕLEMAL teljel sama – muidu ei oleks
 * joonisel olevad nurgad enam päris nurgad, ja just neid siin loetakse.
 *
 * MÕÕTKAVA EI MUUTU raadiusega. Kiusatus oleks joonist iga raadiuse juures
 * ümber skaleerida (siis mahuks kera keskpunkt alati ära), aga siis jääks
 * fookus ekraanil ALATI samasse kohta ja kaoks kogu mooduli avastus: mida
 * lamedam peegel, seda kaugemal on fookus. Kaugele jääv keskpunkt jäetakse
 * seepärast lihtsalt joonistamata (sisu/MOODUL-noguspeegel.md „explore":
 * „kera keskpunkt C märgitud, kui ta joonisele mahub").
 *
 * PEEGLI KAAR ON VÕIMENDAMATA. Lamedam peegel paistabki peaaegu sirge – see on
 * aus pilt, sest sama joonise pealt loetakse nurki. Kaare võimendamine teeks
 * ekraanil oleva nurga suuremaks kui see, mille mudel kõrvale kirjutab.
 *
 * `unlockedFeatures` tuleb explore-sammult (`ExploreStep` →
 * `unlockedSimulationFeatures`): SEE fail on ainus koht, mis teab, mida silt
 * „suuna-lyliti" tähendab (docs/ARHITEKTUUR.md „ui/ ei tohi teada moodulitest").
 */

// --- Paigutus (SVG kasutajaühikud, y kasvab ALLA) --------------------------

const VIEW = { width: 360, height: 180 };
/** Peegli tipp: peatelje ja peegli lõikepunkt, kust kõiki kaugusi mõõdetakse. */
const VERTEX_X = 30;
const AXIS_Y = 78;
/** Kust paralleelsed kiired joonisele tulevad (paremast servast). */
const RAY_START_X = 352;

/**
 * Mõõtkava: 1 m = 260 px ehk 1 cm = 2,6 px.
 *
 * Valitud kõige kaugema fookuse järgi, mis liuguriga saavutatav on: R = 200 cm
 * annab fookuse 100 cm ehk 260 px kaugusele tipust (x = 290), mis jääb koos
 * sildiga joonisele ära. Kera keskpunkt mahub joonisele kuni R ≈ 120 cm.
 */
const PX_PER_METRE = 260;

/** Peegli poolkõrgus – mudeli oma arv (turvavöönd, vt model.ts). */
const MIRROR_HALF_HEIGHT_M = MIRROR_HALF_HEIGHT_CM / 100;

/**
 * Nelja püsiva kiire kõrgused (m). Need EI sõltu liugurist: nemad näitavad
 * kimpu, mis koondub, ja jäävad paigale ka siis, kui valitud kiirt liigutada.
 */
const RAY_HEIGHTS_M = [
  MIRROR_HALF_HEIGHT_M,
  MIRROR_HALF_HEIGHT_M / 2,
  -MIRROR_HALF_HEIGHT_M / 2,
  -MIRROR_HALF_HEIGHT_M,
];

/** Mõõdujoon tipust fookuseni – peegli ja kiirte kimbu ALL. */
const MEASURE_Y = 124;
const MEASURE_TICK = 6;
const MEASURE_LABEL_Y = 142;
const FOCUS_LABEL_Y = 160;

const ARC_RADIUS = 30;
const ARC_LABEL_RADIUS = 46;
/**
 * Nurgasildi vähim kaugus ristsirgest.
 *
 * Selle mooduli nurgad on VÄIKESED (liuguri piirides α ≤ 11,6°), seega jääksid
 * α ja β kaare peal peaaegu kohakuti. Silte lükatakse ristsirgest eemale, aga
 * KAARED jäävad päris nurga peale – nihkub ainult number, mitte väide.
 */
const MIN_LABEL_GAP = 15;

/** Mitmest tükist kaar kokku pannakse (sama arv mis figures.tsx-is). */
const ARC_STEPS = 24;

/** Feature-silt, mida see fail explore-sammu `unlockedFeatures` seast otsib. */
const DIRECTION_FEATURE = "suuna-lyliti";

/** Nooleotste id-d – oma eesliide, et nad ei põrkaks jooniste omadega. */
const ARROW_INCIDENT = "np-sim-arrow-incident";
const ARROW_REFLECTED = "np-sim-arrow-reflected";

const DEFAULT_RADIUS_CM = 100;
// Tüüp `number`, mitte `10`: `SLIDERS` on `as const`, seega oleks liuguri
// algväärtus muidu KONSTANT ja `setHeightCm` ei võtaks vastu ühtegi teist arvu.
const DEFAULT_HEIGHT_CM: number = SLIDERS.rayHeightCm.max;

/** Valguse suund: kaks nimega olekut, mitte „linnuke" – õpilane loeb mõlemat. */
const DIRECTIONS = [
  { id: "kaugelt", label: "Valgus tuleb kaugelt" },
  { id: "fookusest", label: "Lamp on fookuses" },
] as const;
type DirectionId = (typeof DIRECTIONS)[number]["id"];

type Point = { x: number; y: number };

/** Peegli punkt kõrgusel h: sügavus tuleb mudelist, mitte kaarevalemist. */
function mirrorPoint(radiusM: number, heightM: number): Point {
  return {
    x: VERTEX_X + mirrorDepth(radiusM, heightM) * PX_PER_METRE,
    y: AXIS_Y - heightM * PX_PER_METRE,
  };
}

/**
 * Peegli kaar murdjoonena, iga punkt mudeli `mirrorDepth`-ist.
 *
 * Bézier'ga tehtud kaar näeks välja peaaegu samasugune, aga tema kuju ei
 * tuleks füüsikast – ja siis ei saaks kaare peal loetavad nurgad enam õiged
 * olla.
 */
function mirrorArcPath(radiusM: number): string {
  return Array.from({ length: ARC_STEPS * 2 + 1 }, (_, index) =>
    mirrorPoint(radiusM, MIRROR_HALF_HEIGHT_M * (index / ARC_STEPS - 1)),
  )
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function unitVector(from: Point, to: Point): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  return { x: dx / length, y: dy / length };
}

function along(origin: Point, direction: Point, distance: number): Point {
  return {
    x: origin.x + direction.x * distance,
    y: origin.y + direction.y * distance,
  };
}

/** Kahe suuna vaheline poolitaja – nurgasilt läheb kaare keskele. */
function bisector(a: Point, b: Point): Point {
  const x = a.x + b.x;
  const y = a.y + b.y;
  const length = Math.hypot(x, y);
  return { x: x / length, y: y / length };
}

/**
 * Kiir noolega: kolm punkti, et `marker-mid` saaks kuhugi kinnituda.
 *
 * Suunalüliti pöörab siin AINULT otspunktid ümber – joon ise jääb täpselt
 * samaks, nagu spetsifikatsioon nõuab (valguse teekonna pööratavus).
 */
function rayPath(from: Point, to: Point, arrowAt: number, reversed: boolean): string {
  const start = reversed ? to : from;
  const end = reversed ? from : to;
  const at = reversed ? 1 - arrowAt : arrowAt;
  const arrow = {
    x: start.x + (end.x - start.x) * at,
    y: start.y + (end.y - start.y) * at,
  };
  return `M ${start.x} ${start.y} L ${arrow.x} ${arrow.y} L ${end.x} ${end.y}`;
}

/** Nurgakaar suunast suunani. `sweep` 1 = ekraanil päripäeva. */
function angleArc(origin: Point, from: Point, to: Point, sweep: 0 | 1): string {
  const start = along(origin, from, ARC_RADIUS);
  const end = along(origin, to, ARC_RADIUS);
  return `M ${start.x} ${start.y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 ${sweep} ${end.x} ${end.y}`;
}

/**
 * Nurgasildi koht: kaare keskel, aga vähemalt `MIN_LABEL_GAP` kaugusel
 * ristsirgest. `side` −1 on ristsirgest ülalpool (langemisnurk), +1 allpool
 * (peegeldumisnurk) – väikeste nurkade juures satuksid nad muidu kohakuti.
 */
function angleLabelPoint(hit: Point, normal: Point, direction: Point, side: -1 | 1): Point {
  const point = along(hit, bisector(normal, direction), ARC_LABEL_RADIUS);
  // Ristsirge ristsuund ekraanil: n = (x, y) → (−y, x) osutab „allapoole".
  const across = { x: -normal.y, y: normal.x };
  const distance = (point.x - hit.x) * across.x + (point.y - hit.y) * across.y;
  const wanted = side * MIN_LABEL_GAP;
  const missing = side < 0 ? Math.min(0, wanted - distance) : Math.max(0, wanted - distance);
  return along(point, across, missing);
}

export function Simulation({ unlockedFeatures = new Set() }: Partial<SimulationProps> = {}) {
  const [radiusCm, setRadiusCm] = useState(DEFAULT_RADIUS_CM);
  const [heightCm, setHeightCm] = useState(DEFAULT_HEIGHT_CM);
  const [directionId, setDirectionId] = useState<DirectionId>("kaugelt");
  const radiusSliderId = useId();
  const heightSliderId = useId();

  // Suunalüliti avaneb pärast ülesannet 3 – enne seda on korraga muudetavaid
  // suurusi kaks, mitte kolm (moodulileping).
  const directionAvailable = unlockedFeatures.has(DIRECTION_FEATURE);
  const reversed = directionAvailable && directionId === "fookusest";

  // Ainus tee mudelisse: liuguri cm → m. Ükski allpool olev rida ei tohi
  // sentimeetreid valemisse anda.
  const radiusM = metresFromCentimetres(radiusCm);
  const heightM = metresFromCentimetres(heightCm);

  const focusM = focalLength(radiusM);
  const focusCm = centimetresFromMetres(focusM);
  const focusX = VERTEX_X + focusM * PX_PER_METRE;

  const selected = reflectParallelRay(radiusM, heightM);
  const hit = mirrorPoint(radiusM, heightM);
  const centre = { x: VERTEX_X + radiusM * PX_PER_METRE, y: AXIS_Y };
  const centreVisible = centre.x <= VIEW.width - 16;

  // Ristsirge on kerapinnal RAADIUSE siht – kohtumispunktist kera keskpunkti.
  // See on puhas geomeetria pikslites; ühtegi nurka siin ei arvutata.
  const normal = unitVector(hit, centre);
  const normalEnd = along(hit, normal, Math.min(Math.hypot(centre.x - hit.x, centre.y - hit.y), VIEW.width - 8 - hit.x));

  // Peateljel levinud kiir (h = 0) tuleb sama teed tagasi ega lõika telge
  // kusagil – mudel annab talle piirväärtuse R/2, aga joonis ei tohi väita
  // lõiget, mida seal ei ole (vt model.ts `reflectParallelRay`).
  const straightBack = heightCm === 0;
  const selectedCross = straightBack
    ? { x: RAY_START_X, y: AXIS_Y }
    : { x: VERTEX_X + selected.axisCrossM * PX_PER_METRE, y: AXIS_Y };

  // Nurgakaared kaovad h = 0 juures: seal ON nurk null ja kaar oleks punkt.
  // Arvud jäävad kastikestesse alles, seega info ekraanilt ei kao.
  const showAngles = !straightBack;
  const incidentOut: Point = { x: 1, y: 0 };
  const reflectedOut = unitVector(hit, selectedCross);

  const reset = () => {
    setRadiusCm(DEFAULT_RADIUS_CM);
    setHeightCm(DEFAULT_HEIGHT_CM);
    setDirectionId("kaugelt");
  };

  return (
    <div className="flex flex-col gap-5">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        // Kirjeldus ei korda liuguri arve (siis loeks ekraanilugeja iga
        // sentimeetri juures terve lause uuesti ette) – arvud on kastikestes
        // joonise all. Valguse SUUND aga muudab pildi sisu, seega ta on siin.
        aria-label={
          reversed
            ? "Joonis: nõguspeegel külgvaates, peatelg katkendjoonena. Lamp on fookuses ja nooled näitavad, kuidas valgus väljub peeglilt peateljega paralleelse kimbuna."
            : "Joonis: nõguspeegel külgvaates, peatelg katkendjoonena. Paremalt tulevad peateljega paralleelsed kiired, peegelduvad peeglilt ja koonduvad peatelje peal fookusesse."
        }
        className="w-full rounded-2xl border border-line bg-white"
      >
        <defs>
          {/* `fill` on markeril otse küljes: marker ei päri värvi teda
              kasutavalt joonelt. */}
          <marker
            id={ARROW_INCIDENT}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-brand" />
          </marker>
          <marker
            id={ARROW_REFLECTED}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-info" />
          </marker>
        </defs>

        {/* Peatelg – katkendjoon, sest ta ei ole valguskiir, vaid abijoon */}
        <line
          x1={VERTEX_X}
          y1={AXIS_Y}
          x2={VIEW.width - 8}
          y2={AXIS_Y}
          className="stroke-ink-soft"
          strokeWidth={1.5}
          strokeDasharray="7 5"
        />

        {/* Peegel: kaar mudeli järgi + viirutus tagumisel (läikimatul) poolel */}
        <path
          d={mirrorArcPath(radiusM)}
          className="fill-none stroke-ink"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <g className="stroke-ink-soft" strokeWidth={1.5} strokeLinecap="round">
          {Array.from({ length: 11 }, (_, index) =>
            mirrorPoint(radiusM, MIRROR_HALF_HEIGHT_M * (index / 5 - 1)),
          ).map((point) => {
            // Väljapoole = kera keskpunktist EEMALE: nii kaldub iga kriips
            // sinna, kuhu peegli tagumine pool jääb.
            const outward = unitVector(centre, point);
            const end = along(point, outward, 8);
            return <line key={point.y} x1={point.x} y1={point.y} x2={end.x} y2={end.y} />;
          })}
        </g>

        {/* Neli püsivat kiirt: nemad näitavad, et kimp koondub ühte punkti */}
        {RAY_HEIGHTS_M.map((rayHeightM) => {
          const rayHit = mirrorPoint(radiusM, rayHeightM);
          const cross = {
            x: VERTEX_X + reflectParallelRay(radiusM, rayHeightM).axisCrossM * PX_PER_METRE,
            y: AXIS_Y,
          };
          return (
            <g key={rayHeightM}>
              <path
                d={rayPath({ x: RAY_START_X, y: rayHit.y }, rayHit, 0.35, reversed)}
                className="fill-none stroke-brand/60"
                strokeWidth={2}
                markerMid={`url(#${ARROW_INCIDENT})`}
              />
              <path
                d={rayPath(rayHit, cross, 0.6, reversed)}
                className="fill-none stroke-info/60"
                strokeWidth={2}
                markerMid={`url(#${ARROW_REFLECTED})`}
              />
            </g>
          );
        })}

        {/* Ristsirge: katkendlik joon kohtumispunktist kera keskpunkti */}
        <line
          x1={hit.x}
          y1={hit.y}
          x2={normalEnd.x}
          y2={normalEnd.y}
          className="stroke-ink-soft"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        {centreVisible ? (
          <>
            <circle cx={centre.x} cy={centre.y} r={3.5} className="fill-ink-soft" />
            <text
              x={centre.x}
              y={AXIS_Y - MIRROR_HALF_HEIGHT_M * PX_PER_METRE - 10}
              textAnchor={centre.x > VIEW.width - 60 ? "end" : "middle"}
              className="fill-ink-soft"
              fontSize={12}
            >
              kera keskpunkt
            </text>
          </>
        ) : null}

        {/* Nurgakaared ristsirgest mõlema kiireni – päris nurga peal */}
        {showAngles ? (
          <>
            <path
              d={angleArc(hit, incidentOut, normal, 1)}
              className="fill-none stroke-brand"
              strokeWidth={2}
            />
            <path
              d={angleArc(hit, normal, reflectedOut, 1)}
              className="fill-none stroke-info"
              strokeWidth={2}
            />
          </>
        ) : null}

        {/* Valitud kiir paksu joonega, kaarte peal */}
        <path
          d={rayPath({ x: RAY_START_X, y: hit.y }, hit, 0.2, reversed)}
          className="fill-none stroke-brand"
          strokeWidth={3.5}
          strokeLinecap="round"
          markerMid={`url(#${ARROW_INCIDENT})`}
        />
        <path
          d={rayPath(hit, selectedCross, 0.75, reversed)}
          className="fill-none stroke-info"
          strokeWidth={3.5}
          strokeLinecap="round"
          markerMid={`url(#${ARROW_REFLECTED})`}
        />
        <circle cx={hit.x} cy={hit.y} r={3.5} className="fill-ink" />

        {/* Fookus: punkt teljel + mõõdujoon tipust temani + sõna „fookus".
            Kolm eri kandjat sama info jaoks (DISAINIJUHIS: värv ega joonis ei
            ole kunagi ainus info kandja). */}
        <circle cx={focusX} cy={AXIS_Y} r={4.5} className="fill-ink" />
        <line
          x1={focusX}
          y1={AXIS_Y + 6}
          x2={focusX}
          y2={MEASURE_Y - MEASURE_TICK}
          className="stroke-ink-soft"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <g className="stroke-ink-soft" strokeWidth={1.5}>
          <line x1={VERTEX_X} y1={MEASURE_Y} x2={focusX} y2={MEASURE_Y} />
          <line
            x1={VERTEX_X}
            y1={MEASURE_Y - MEASURE_TICK}
            x2={VERTEX_X}
            y2={MEASURE_Y + MEASURE_TICK}
          />
          <line
            x1={focusX}
            y1={MEASURE_Y - MEASURE_TICK}
            x2={focusX}
            y2={MEASURE_Y + MEASURE_TICK}
          />
        </g>

        {/* Sildid kõige viimasena ja valge äärisega: kiired mööduvad neist
            napilt ja jookseksid muidu neist läbi. */}
        <g className="stroke-white" strokeWidth={4} paintOrder="stroke">
          <text x={8} y={AXIS_Y - MIRROR_HALF_HEIGHT_M * PX_PER_METRE - 10} className="fill-ink" fontSize={12}>
            nõguspeegel
          </text>
          <text
            x={VIEW.width - 8}
            y={AXIS_Y - 8}
            textAnchor="end"
            className="fill-ink-soft"
            fontSize={12}
          >
            peatelg
          </text>
          <text
            x={(VERTEX_X + focusX) / 2}
            y={MEASURE_LABEL_Y}
            textAnchor="middle"
            className="fill-ink"
            fontSize={15}
            fontWeight={600}
          >
            {formatNumber(focusCm)} cm
          </text>
          <text
            x={focusX}
            y={FOCUS_LABEL_Y}
            textAnchor="middle"
            className="fill-ink"
            fontSize={13}
            fontWeight={600}
          >
            fookus
          </text>
          {showAngles ? (
            <>
              <text
                {...angleLabelPoint(hit, normal, incidentOut, -1)}
                className="fill-brand"
                fontSize={15}
                fontWeight={600}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {formatNumber(selected.incidenceDeg, 1)}°
              </text>
              <text
                {...angleLabelPoint(hit, normal, reflectedOut, 1)}
                className="fill-info"
                fontSize={15}
                fontWeight={600}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {formatNumber(selected.reflectionDeg, 1)}°
              </text>
            </>
          ) : null}
        </g>
      </svg>

      {/* Numbrid suurelt ka joonise all: 13-pikslist silti ei loe projektorilt
          klassi tagant istuv õpilane. 360 px ekraanil lähevad kastid üksteise
          alla, mitte kõrvale. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Readout label="Kera raadius R" value={`${formatNumber(radiusCm)} cm`} />
        <Readout label="Fookus on peeglist" value={`${formatNumber(focusCm)} cm`} tone="focus" />
        <Readout
          label="Valitud kiir: langemisnurk"
          value={`${formatNumber(selected.incidenceDeg, 1)}°`}
          tone="incident"
        />
        <Readout
          label="Valitud kiir: peegeldumisnurk"
          value={`${formatNumber(selected.reflectionDeg, 1)}°`}
          tone="reflected"
        />
      </div>

      <SliderField
        id={radiusSliderId}
        label="Kera raadius R"
        value={radiusCm}
        min={SLIDERS.radiusCm.min}
        max={SLIDERS.radiusCm.max}
        step={SLIDERS.radiusCm.step}
        onChange={(event) =>
          setRadiusCm(clamp(event.target.value, SLIDERS.radiusCm, DEFAULT_RADIUS_CM))
        }
        valueText={`${radiusCm} cm`}
        // Ekraanilugeja ütleks muidu paljast arvu – ühik on siin kogu jutt.
        ariaValueText={`${radiusCm} sentimeetrit`}
        minLabel={`${SLIDERS.radiusCm.min} cm`}
        maxLabel={`${SLIDERS.radiusCm.max} cm`}
      />

      <SliderField
        id={heightSliderId}
        label="Valitud kiire kõrgus h"
        value={heightCm}
        min={SLIDERS.rayHeightCm.min}
        max={SLIDERS.rayHeightCm.max}
        step={SLIDERS.rayHeightCm.step}
        onChange={(event) =>
          setHeightCm(clamp(event.target.value, SLIDERS.rayHeightCm, DEFAULT_HEIGHT_CM))
        }
        valueText={`${heightCm} cm`}
        ariaValueText={`${heightCm} sentimeetrit peateljest`}
        minLabel={`${SLIDERS.rayHeightCm.min} cm`}
        maxLabel={`${SLIDERS.rayHeightCm.max} cm`}
      />

      {directionAvailable ? (
        <div className="flex flex-col gap-2 border-t border-line pt-4">
          <span className="text-base font-medium text-ink">Valguse suund</span>
          {/* Lülitusnupud (`aria-pressed`), mitte `role="radio"` – sama muster
              mis mujal projektis: nooleklahvidega liikumist me ei paku, seega
              ei tohi ekraanilugejale seda ka lubada. */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Valguse suund">
            {DIRECTIONS.map((option) => {
              const active = option.id === directionId;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDirectionId(option.id)}
                  className={`flex min-h-11 items-center rounded-full border px-4 text-base focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 ${
                    active ? "border-brand bg-brand-soft font-semibold text-ink" : "border-line text-ink"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {reversed ? (
            <p className="text-base leading-relaxed text-ink-soft">
              Joonis ise ei muutu – ümber pöördusid ainult noolte otsad. Valgus
              võib sama teed käia mõlemat pidi: fookusest välja läinud valgus
              lahkub peeglilt peateljega paralleelse kimbuna. Just nii teeb
              taskulamp pirnist kitsa kiire.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex justify-center">
        <Button variant="ghost" onClick={reset}>
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
 * vaade ei tohi talle midagi kahtlast anda. `<input type="range">` hoiab piire
 * ise, aga see rida maksab vähem kui valge ekraan.
 */
function clamp(
  value: string,
  bounds: { min: number; max: number },
  fallback: number,
): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(bounds.max, Math.max(bounds.min, Math.round(parsed)));
}

/** Üks suurus suurelt. Värvitriip kordab joonise värvi, info kannab SILT. */
function Readout({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "focus" | "incident" | "reflected";
}) {
  const stripe =
    tone === "incident" ? "bg-brand" : tone === "reflected" ? "bg-info" : "bg-ink";
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3 sm:flex-col sm:items-start sm:gap-1">
      <div className="flex items-center gap-2">
        {tone ? (
          <span aria-hidden="true" className={`h-1 w-5 shrink-0 rounded-full ${stripe}`} />
        ) : null}
        <span className="text-sm font-medium text-ink-soft">{label}</span>
      </div>
      <p className="text-xl font-semibold tabular-nums text-ink sm:text-2xl">{value}</p>
    </div>
  );
}
