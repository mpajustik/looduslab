import type { ReactNode } from "react";
import { focalLength } from "./model";

/**
 * Mooduli joonised (src/engine/figures.ts).
 *
 * Need on VAATED, täpselt nagu Simulation.tsx. Rakendusmoodulil ei ole ühtegi
 * joonist, mis mõõdaks arve ekraanilt – seepärast ei ole siin ka mõõdujooni
 * ega laiuse silte. Ainus arv, mida teooriajoonis VÄIDAB, on fookuse koht, ja
 * ta tuleb `model.ts`-i funktsioonist `focalLength` (CLAUDE.md reegel 1), mitte
 * silma järgi valitud punktist. Nii ei saa joonis ja simulatsioon kunagi eri
 * kohta fookuseks nimetada.
 *
 * ÜHIKUD: mudel räägib meetrites, joonis pikslites. Ühik muutub ainult
 * skaleerimisel (`PX_PER_METRE`). Mõõtkava on MÕLEMAL teljel sama, muidu ei
 * oleks joonisel olev peegel enam kerapinna osa.
 *
 * PEEGLI KAAR on kokku pandud kera enda parametriseeringust (punkt nurga θ
 * juures on kera keskpunktist R kaugusel), mitte käsitsi sobitatud Bézier'st.
 * Nii on kaar täpselt see kerapind, millest mudel räägib, ja tema sügavus ei
 * ole kellegi ilutunde asi. Hooki joonisel on peeglid seevastu lihtsad kaared:
 * hook ei väida ühtegi arvu ega nurka, ta näitab ainult, ET need kolm seadet
 * on seest ühesugused.
 *
 * SUUNAD: kõik vektorid on SVG-koordinaatides (y kasvab ALLA). Mudel annab
 * ainult ühe arvu (fookuskaugus), mitte suundi, seega ei ole siin ühtegi kohta,
 * kus y-telge pööratakse.
 *
 * MIKS EI OLE VÄRV AINUS INFO KANDJA (DISAINIJUHIS): kaks kiirtesuunda on eri
 * värvi JA eri joonemustriga JA neil on nooled; kumbki korrus on lisaks
 * sõnadega alla kirjutatud.
 */

type Point = { x: number; y: number };

/** Nooleotsad. Ühed id-d kogu failis: korraga on ekraanil üks joonis. */
const ARROW_OUT = "nr-arrow-out";
const ARROW_IN = "nr-arrow-in";

function RayArrowDefs() {
  return (
    <defs>
      {/* `fill` on markeril otse küljes: marker ei päri värvi teda kasutavalt
          joonelt. */}
      <marker
        id={ARROW_OUT}
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
        id={ARROW_IN}
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
  );
}

/** Kiir noolega: kolm punkti, et `marker-mid` saaks kuhugi kinnituda. */
function rayPath(from: Point, to: Point, arrowAt: number): string {
  const arrow = {
    x: from.x + (to.x - from.x) * arrowAt,
    y: from.y + (to.y - from.y) * arrowAt,
  };
  return `M ${from.x} ${from.y} L ${arrow.x} ${arrow.y} L ${to.x} ${to.y}`;
}

// ---------------------------------------------------------------------------
// nr-kolm-seadet – hook
// ---------------------------------------------------------------------------

const HOOK_VIEW = { width: 360, height: 190 };
const HOOK_PANEL = { top: 6, height: 134 };

/** Ühe hookipaneeli raam, pealkiri ja ühine silt „nõguspeegel". */
function HookPanel({
  x,
  panelWidth,
  title,
  children,
}: {
  x: number;
  panelWidth: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect
        x={0}
        y={HOOK_PANEL.top}
        width={panelWidth}
        height={HOOK_PANEL.height}
        rx={10}
        className="fill-white stroke-line"
        strokeWidth={1}
      />
      {children}
      <text
        x={panelWidth / 2}
        y={HOOK_PANEL.top + HOOK_PANEL.height + 16}
        textAnchor="middle"
        className="fill-ink"
        fontSize={11}
        fontWeight={600}
      >
        {title}
      </text>
      <text
        x={panelWidth / 2}
        y={HOOK_PANEL.top + HOOK_PANEL.height + 30}
        textAnchor="middle"
        className="fill-ink-soft"
        fontSize={10}
      >
        nõguspeegel
      </text>
    </g>
  );
}

/**
 * Häälestav joonis: kolm seadet, mille sees on sama peegel.
 *
 * Joonis ei väida ühtegi arvu ega nurka – hook ei tohi vastust ette öelda. Ta
 * näitab ainult seda, ET taskulambi, teleskoobi ja päikeseahju sees on üks ja
 * seesama nõgus peegel, ja seda, et valgus liigub neis eri suunas. MIKS see nii
 * on, ütlevad teooria ja simulatsioon. Peeglid on siin lihtsad kaared, mitte
 * mudeli kerapind.
 */
export function ThreeDevicesFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${HOOK_VIEW.width} ${HOOK_VIEW.height}`}
        role="img"
        aria-label="Kolm pilti kõrvuti. Vasakul on taskulamp küljelt ja lahti lõigatuna: keha sees on läikiv nõgus peegeldi ja selle keskel pirn, lambist väljub kolm paralleelset valguskiirt. Keskel on peegelteleskoop: püstine toru, mille põhjas on suur nõgus peegel, ülalt tulevad torusse paralleelsed kiired ja koonduvad peegli kohal ühte punkti. Paremal on päikeseahi: suur nõgus peegel, paremalt tulevad Päikese paralleelsed kiired ja koonduvad peegli ette väikeseks eredaks plekiks. Kõigi kolme all on silt „nõguspeegel“."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />

        {/* 1. Taskulamp: valgus läheb fookusest välja. */}
        <HookPanel x={4} panelWidth={104} title="taskulamp">
          <rect
            x={10}
            y={48}
            width={44}
            height={44}
            rx={6}
            className="fill-none stroke-ink-soft"
            strokeWidth={1.5}
          />
          <path
            d="M 24 52 Q 8 70 24 88"
            className="fill-none stroke-ink"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <circle
            cx={30}
            cy={70}
            r={5}
            className="fill-teacher stroke-ink"
            strokeWidth={1.5}
          />
          <g
            className="fill-none stroke-brand"
            strokeWidth={2}
            markerMid={`url(#${ARROW_OUT})`}
          >
            {[58, 70, 82].map((y) => (
              <path
                key={y}
                d={rayPath({ x: 56, y }, { x: 98, y }, 0.55)}
              />
            ))}
          </g>
          <text x={52} y={110} textAnchor="middle" className="fill-ink-soft" fontSize={9}>
            valgus välja
          </text>
        </HookPanel>

        {/* 2. Peegelteleskoop: valgus tuleb kaugelt sisse ja koondub. */}
        <HookPanel x={116} panelWidth={104} title="peegelteleskoop">
          <rect
            x={26}
            y={22}
            width={52}
            height={82}
            rx={4}
            className="fill-none stroke-ink-soft"
            strokeWidth={1.5}
          />
          <path
            d="M 30 100 Q 52 82 74 100"
            className="fill-none stroke-ink"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <g
            className="fill-none stroke-info"
            strokeWidth={2}
            strokeDasharray="5 3"
            markerMid={`url(#${ARROW_IN})`}
          >
            {[36, 52, 68].map((x) => (
              <path key={x} d={rayPath({ x, y: 16 }, { x, y: 92 }, 0.5)} />
            ))}
          </g>
          <circle cx={52} cy={62} r={3.5} className="fill-brand" />
          <text x={52} y={118} textAnchor="middle" className="fill-ink-soft" fontSize={9}>
            valgus kokku
          </text>
        </HookPanel>

        {/* 3. Päikeseahi: sama suund mis teleskoobil, teine töö. */}
        <HookPanel x={228} panelWidth={128} title="päikeseahi">
          <path
            d="M 24 34 Q 4 70 24 106"
            className="fill-none stroke-ink"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <g
            className="fill-none stroke-info"
            strokeWidth={2}
            strokeDasharray="5 3"
            markerMid={`url(#${ARROW_IN})`}
          >
            {[44, 58, 70, 82, 96].map((y) => (
              <path key={y} d={rayPath({ x: 118, y }, { x: 40, y }, 0.45)} />
            ))}
          </g>
          <circle cx={40} cy={70} r={6} className="fill-teacher stroke-ink" strokeWidth={1.5} />
          <text x={72} y={26} textAnchor="middle" className="fill-ink-soft" fontSize={9}>
            Päikeselt
          </text>
          <text x={64} y={122} textAnchor="middle" className="fill-ink-soft" fontSize={9}>
            ere kuum plekk
          </text>
        </HookPanel>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Kolm hoopis eri seadet, üks ja sama asi nende sees: nõgus peegel. Vahe on
        ainult selles, kummast otsast valgus tuleb.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// nr-kaks-suunda – teooria
// ---------------------------------------------------------------------------

const TWO_VIEW = { width: 360, height: 268 };

/**
 * Joonise kera raadius (m) ja mõõtkava.
 *
 * Raadius on 1 m ainult sellepärast, et mudelile tuleb anda meetrid: joonis ei
 * näita ühtegi ARVU, ainult kuju ja fookuse KOHTA. Mõõtkava on mõlemal teljel
 * sama.
 */
const RADIUS_M = 1;
const PX_PER_METRE = 150;
const RADIUS_PX = RADIUS_M * PX_PER_METRE;

/** Fookus MUDELIST, mitte poolitatud pikslimõõdust. */
const FOCAL_PX = focalLength(RADIUS_M) * PX_PER_METRE;

/**
 * Peegli poolnurk kera keskpunktist: 14°.
 *
 * See ei ole ilutunne, vaid sama piir, mis simulatsiooni liuguril: 14° juures
 * on peegli läbimõõt 0,48 · R ehk pisut alla fookuskauguse (D ≤ f), kus
 * kerapinna lähendus veel kehtib (model.ts idealiseering 1). Sügavama peegli
 * joonistamine näitaks kiirte koondumist täpsemana, kui mudel lubab.
 */
const HALF_ANGLE_DEG = 14;

/** Kiirte nurgad kera keskpunktist – neli kiirt, kaks peatelje kummalgi pool. */
const RAY_ANGLES_DEG = [HALF_ANGLE_DEG, HALF_ANGLE_DEG / 2, -HALF_ANGLE_DEG / 2, -HALF_ANGLE_DEG];

const RADIANS_PER_DEGREE = Math.PI / 180;

/** Peegli tipp paneeli sees ja kaare koostamise sammude arv. */
const VERTEX_X = 26;
const ARC_STEPS = 24;

/**
 * Peegli punkt nurga θ juures: kera keskpunkt on peegli EES kaugusel R, seega
 * on pinnapunkt temast R kaugusel suunas, mis moodustab peateljega nurga θ.
 *
 * Siin ei ole ühtegi kaarevalemit ega Bézier'd – on kera enda definitsioon.
 */
function mirrorPoint(axisY: number, angleDeg: number): Point {
  const rad = angleDeg * RADIANS_PER_DEGREE;
  const centreX = VERTEX_X + RADIUS_PX;
  return {
    x: centreX - RADIUS_PX * Math.cos(rad),
    y: axisY - RADIUS_PX * Math.sin(rad),
  };
}

/** Peegli kaar murdjoonena: iga punkt tuleb samast parametriseeringust. */
function mirrorArcPath(axisY: number): string {
  return Array.from({ length: ARC_STEPS + 1 }, (_, index) =>
    mirrorPoint(axisY, HALF_ANGLE_DEG * (1 - (2 * index) / ARC_STEPS)),
  )
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

/** Viirutus peegli TAGUMISEL poolel – kummal pool on läikiv pind. */
function MirrorArc({ axisY }: { axisY: number }) {
  return (
    <>
      <path
        d={mirrorArcPath(axisY)}
        className="fill-none stroke-ink"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <g className="stroke-ink-soft" strokeWidth={1.5} strokeLinecap="round">
        {Array.from({ length: 9 }, (_, index) =>
          HALF_ANGLE_DEG * (1 - index / 4),
        ).map((angleDeg) => {
          const point = mirrorPoint(axisY, angleDeg);
          // Väljapoole = kera keskpunktist EEMALE. Nii kaldub iga kriips
          // täpselt sinna, kuhu peegli tagumine, mitteläikiv pool jääb.
          const rad = angleDeg * RADIANS_PER_DEGREE;
          return (
            <line
              key={angleDeg}
              x1={point.x}
              y1={point.y}
              x2={point.x - 8 * Math.cos(rad)}
              y2={point.y - 8 * Math.sin(rad)}
            />
          );
        })}
      </g>
      {/* Läikiv pool on kera SEEST poolt – seda ei tohi jätta ainult
          viirutuse kanda (DISAINIJUHIS: muster ei ole ainus info kandja). */}
      <text
        x={VERTEX_X + 4}
        y={axisY + RADIUS_PX * Math.sin(HALF_ANGLE_DEG * RADIANS_PER_DEGREE) + 16}
        className="fill-ink-soft"
        fontSize={9}
      >
        läikiv pind on seest poolt
      </text>
    </>
  );
}

/** Peatelg katkendjoonena – ta ei ole kiir, vaid abijoon. */
function PrincipalAxis({ axisY }: { axisY: number }) {
  return (
    <line
      x1={VERTEX_X}
      y1={axisY}
      x2={TWO_VIEW.width - 8}
      y2={axisY}
      className="stroke-ink-soft"
      strokeWidth={1.5}
      strokeDasharray="7 5"
    />
  );
}

/** Fookus: täpp, täht F ja sõnaline silt. Koht tuleb mudelist. */
function FocusMark({ axisY, label }: { axisY: number; label: string }) {
  const x = VERTEX_X + FOCAL_PX;
  return (
    <>
      <circle cx={x} cy={axisY} r={4} className="fill-ink" />
      <text
        x={x}
        y={axisY - 10}
        textAnchor="middle"
        className="fill-ink"
        fontSize={12}
        fontWeight={600}
      >
        F
      </text>
      <text x={x + 10} y={axisY + 16} className="fill-ink-soft" fontSize={10}>
        {label}
      </text>
    </>
  );
}

const TOP_AXIS_Y = 68;
const BOTTOM_AXIS_Y = 200;
const RAY_END_X = TWO_VIEW.width - 10;

/**
 * Teooriajoonis: sama peegel kaks korda, kaks vastassuunda.
 *
 * Ülemisel korrusel on fookuses pirn ja kiired lähevad peeglilt välja
 * peateljega paralleelselt; alumisel tulevad paralleelsed kiired sisse ja
 * koonduvad fookusesse. Peegel, fookus ja kiirte teed on MÕLEMAL korrusel
 * täpselt samad – ainus vahe on noolte suund. Just see ongi lause „valguse tee
 * on pööratav".
 */
export function TwoDirectionsFigure() {
  const topPoints = RAY_ANGLES_DEG.map((angleDeg) =>
    mirrorPoint(TOP_AXIS_Y, angleDeg),
  );
  const bottomPoints = RAY_ANGLES_DEG.map((angleDeg) =>
    mirrorPoint(BOTTOM_AXIS_Y, angleDeg),
  );
  const topFocus: Point = { x: VERTEX_X + FOCAL_PX, y: TOP_AXIS_Y };
  const bottomFocus: Point = { x: VERTEX_X + FOCAL_PX, y: BOTTOM_AXIS_Y };

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${TWO_VIEW.width} ${TWO_VIEW.height}`}
        role="img"
        aria-label="Joonis kahest korrusest, mõlemal täpselt sama nõgus peegel ja katkendjoonega peatelg. Ülemisel korrusel on peegli fookuses pirn: temast lähtuvad kiired jõuavad peeglile ja lähevad sealt tagasi paremale peateljega paralleelselt, nooled näitavad peeglist eemale. Alumisel korrusel tulevad paremalt sisse peateljega paralleelsed kiired, nooled näitavad peegli poole, ja pärast peeglilt peegeldumist koonduvad nad kõik samasse fookusesse. Fookus on mõlemal korrusel märgitud tähega F ja asub poole kõverusraadiuse kaugusel peegli tipust."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />

        {/* ---- Ülemine korrus: fookusest välja ---- */}
        <text x={VERTEX_X} y={20} className="fill-ink" fontSize={12} fontWeight={600}>
          suund 1: fookusest välja
        </text>
        <PrincipalAxis axisY={TOP_AXIS_Y} />
        <MirrorArc axisY={TOP_AXIS_Y} />
        <g
          className="fill-none stroke-brand"
          strokeWidth={2}
          markerMid={`url(#${ARROW_OUT})`}
        >
          {topPoints.map((point) => (
            <g key={point.y}>
              <path d={rayPath(topFocus, point, 0.6)} />
              <path d={rayPath(point, { x: RAY_END_X, y: point.y }, 0.5)} />
            </g>
          ))}
        </g>
        <circle
          cx={topFocus.x}
          cy={topFocus.y}
          r={6}
          className="fill-teacher stroke-ink"
          strokeWidth={1.5}
        />
        <FocusMark axisY={TOP_AXIS_Y} label="pirn on fookuses" />
        <text
          x={RAY_END_X}
          y={TOP_AXIS_Y - RADIUS_PX * Math.sin(HALF_ANGLE_DEG * RADIANS_PER_DEGREE) - 6}
          textAnchor="end"
          className="fill-ink"
          fontSize={10}
        >
          välja paralleelselt
        </text>

        {/* ---- Alumine korrus: paralleelselt sisse ---- */}
        <text x={VERTEX_X} y={152} className="fill-ink" fontSize={12} fontWeight={600}>
          suund 2: paralleelselt sisse
        </text>
        <PrincipalAxis axisY={BOTTOM_AXIS_Y} />
        <MirrorArc axisY={BOTTOM_AXIS_Y} />
        <g
          className="fill-none stroke-info"
          strokeWidth={2}
          strokeDasharray="6 4"
          markerMid={`url(#${ARROW_IN})`}
        >
          {bottomPoints.map((point) => (
            <g key={point.y}>
              <path d={rayPath({ x: RAY_END_X, y: point.y }, point, 0.5)} />
              <path d={rayPath(point, bottomFocus, 0.6)} />
            </g>
          ))}
        </g>
        <FocusMark axisY={BOTTOM_AXIS_Y} label="siia koondub kogu valgus" />
        <text
          x={RAY_END_X}
          y={BOTTOM_AXIS_Y - RADIUS_PX * Math.sin(HALF_ANGLE_DEG * RADIANS_PER_DEGREE) - 6}
          textAnchor="end"
          className="fill-ink"
          fontSize={10}
        >
          Päikeselt või tähelt
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Peegel ja fookus on mõlemal korrusel täpselt samad. Erineb ainult noolte
        suund – valguse tee on pööratav.
      </figcaption>
    </figure>
  );
}
