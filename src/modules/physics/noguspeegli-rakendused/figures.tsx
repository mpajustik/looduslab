import type { ReactNode } from "react";
import { formatNumber } from "../../../lib/format";
import {
  MIRROR_DIAMETER_CM,
  SLIDERS,
  WALL_DISTANCE_M,
  beamDiameter,
  focalLength,
  metresFromCentimetres,
  metresFromMillimetres,
  solarConcentration,
} from "./model";

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

// ---------------------------------------------------------------------------
// nr-kaks-suunda – teooria, teine osa: „allikas ei ole punkt“
// ---------------------------------------------------------------------------

const SOURCE_VIEW = { width: 360, height: 206 };
const SOURCE_PANEL = { top: 30, height: 130 };

/** Sama peegel, mis explore-1 vaikeseisus – arv ei tohi lahku minna. */
const SOURCE_FIGURE_RADIUS_CM = SLIDERS.radiusCm.min;
const SOURCE_FIGURE_FOCAL_M = focalLength(
  metresFromCentimetres(SOURCE_FIGURE_RADIUS_CM),
);
const SOURCE_FIGURE_MIRROR_M = metresFromCentimetres(MIRROR_DIAMETER_CM);

/** Valgusringi laius (m) mudelist – sama valem, mis explore-1/2 küsimustel. */
function sourceBeamWidthM(sourceMm: number): number {
  return beamDiameter(
    SOURCE_FIGURE_MIRROR_M,
    SOURCE_FIGURE_FOCAL_M,
    metresFromMillimetres(sourceMm),
    WALL_DISTANCE_M,
  );
}

/** Ekraanile: kaks kohta koma järel, nagu explore-sammu vastustel. */
const sourceWidth = (valueM: number): string => formatNumber(valueM, 2);

/**
 * Paneeli visuaalne poollaius pikslites: RUUTJUUR laiusest, mitte laius ise.
 *
 * See on PAIGUTUSE otsus, mitte füüsika (sama põhjendus mis
 * `kumerpeegli-rakendused/MockPanel`-i `scale`-il): tegelikud laiused (0,10 m,
 * 0,50 m, 2,10 m) on kakskümmend korda lahus, ja lineaarne skaala teeks
 * esimese paneeli olematuks või kolmanda ekraanivälliseks. Ruutjuur hoiab
 * järjekorra ja suhte NÄHTAVANA – täpne arv seisab ikkagi tekstina paneeli
 * all, joonis ise pikslites midagi ei väida.
 */
const SOURCE_VISUAL_SCALE = 40;

/** Peegli poollaius paneelil (px) – sama kõigil kolmel, nagu simulatsioonis. */
const SOURCE_MIRROR_HALF_PX = 15;

/**
 * Klammerdatud peegli poollaiusega alt: mudeli valem ütleb, et valgusring on
 * ALATI vähemalt peegli laiune (s = 0 piirjuhul täpselt nii lai, vt
 * `beamDiameter`). Ilma klambrita jääks ruutjuure-skaala punktallika juures
 * peeglist kitsamaks ja joonis näitaks kimpu kitsenemas – täpselt vastupidist
 * sellele, mida mudel väidab (CodeRabbiti leid).
 */
function sourceVisualHalfWidthPx(widthM: number): number {
  return Math.max(Math.sqrt(widthM) * SOURCE_VISUAL_SCALE, SOURCE_MIRROR_HALF_PX);
}

function SourcePanel({
  x,
  panelWidth,
  label,
  sourceMm,
}: {
  x: number;
  panelWidth: number;
  label: string;
  sourceMm: number;
}) {
  const widthM = sourceBeamWidthM(sourceMm);
  const halfPx = sourceVisualHalfWidthPx(widthM);
  const axisY = SOURCE_PANEL.top + SOURCE_PANEL.height / 2;
  const mirrorX = x + 16;
  const wallX = x + panelWidth - 16;

  return (
    <g>
      <rect
        x={x}
        y={SOURCE_PANEL.top}
        width={panelWidth}
        height={SOURCE_PANEL.height}
        rx={10}
        className="fill-white stroke-line"
        strokeWidth={1}
      />
      {/* Laienev kimp: värv JA joonemuster, mitte ainult värv (DISAINIJUHIS). */}
      <polygon
        points={`${mirrorX},${axisY - SOURCE_MIRROR_HALF_PX} ${wallX},${axisY - halfPx} ${wallX},${axisY + halfPx} ${mirrorX},${axisY + SOURCE_MIRROR_HALF_PX}`}
        className="fill-brand"
        fillOpacity={0.14}
      />
      <g className="stroke-brand" strokeWidth={1.5} strokeDasharray="5 3">
        <line
          x1={mirrorX}
          y1={axisY - SOURCE_MIRROR_HALF_PX}
          x2={wallX}
          y2={axisY - halfPx}
        />
        <line
          x1={mirrorX}
          y1={axisY + SOURCE_MIRROR_HALF_PX}
          x2={wallX}
          y2={axisY + halfPx}
        />
      </g>
      {/* Peegel: jäme joon, sama kõigil kolmel paneelil. */}
      <line
        x1={mirrorX}
        y1={axisY - SOURCE_MIRROR_HALF_PX}
        x2={mirrorX}
        y2={axisY + SOURCE_MIRROR_HALF_PX}
        className="stroke-ink"
        strokeWidth={4}
        strokeLinecap="round"
      />
      {/* Sein: ring seisab siin, laius loetav mõõdujoonelt. */}
      <line
        x1={wallX}
        y1={axisY - halfPx - 4}
        x2={wallX}
        y2={axisY + halfPx + 4}
        className="stroke-ink-soft"
        strokeWidth={2}
      />
      <text
        x={x + panelWidth / 2}
        y={SOURCE_PANEL.top - 8}
        textAnchor="middle"
        className="fill-ink"
        fontSize={10}
        fontWeight={600}
      >
        {label}
      </text>
      <text
        x={x + panelWidth / 2}
        y={SOURCE_PANEL.top + SOURCE_PANEL.height + 18}
        textAnchor="middle"
        className="fill-ink-soft"
        fontSize={9}
      >
        {sourceWidth(widthM)} m lai ring
      </text>
    </g>
  );
}

/**
 * Teooriajoonis: sama peegel, kolm allikasuurust – ideaalne punkt, LED-kiip,
 * hõõgniit. Kõik kolm laiust tulevad `beamDiameter`-ist, sama valemiga, mida
 * kasutab explore-1/2 (CLAUDE.md reegel 1) – see joonis on nende ülesannete
 * eelvaade, mitte eraldi väide.
 */
export function SourceSizeFigure() {
  const pointWidthM = sourceBeamWidthM(0);
  const ledWidthM = sourceBeamWidthM(2);
  const filamentWidthM = sourceBeamWidthM(10);

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${SOURCE_VIEW.width} ${SOURCE_VIEW.height}`}
        role="img"
        aria-label={`Kolm paneeli kõrvuti, igas sama peegel vasakul ja laienev valguskimp seinani paremal. Vasakpoolses paneelis on ideaalne punktallikas: kimp jääb peegli laiuseks ehk ${sourceWidth(pointWidthM)} m. Keskmises paneelis on 2 millimeetrise LED-kiibiga allikas: kimp laieneb ${sourceWidth(ledWidthM)} meetrini. Parempoolses paneelis on 10 millimeetrise hõõgniidiga allikas: kimp laieneb juba ${sourceWidth(filamentWidthM)} meetrini. Mida suurem allikas, seda laiem ring seinal, kuigi peegel on kõigil kolmel täpselt sama.`}
        className="w-full rounded-2xl border border-line bg-white"
      >
        <SourcePanel x={4} panelWidth={104} label="ideaalne punkt" sourceMm={0} />
        <SourcePanel x={116} panelWidth={104} label="LED-kiip 2 mm" sourceMm={2} />
        <SourcePanel
          x={228}
          panelWidth={128}
          label="hõõgniit 10 mm"
          sourceMm={10}
        />
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Sama peegel kõigil kolmel. Ainus vahe on allika suurus – ja just see,
        mitte peegel, otsustab, kui laiaks kimp kaugusega läheb.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// nr-kaks-suunda – teooria, kolmas osa: peegli suurus vs koondumine
// ---------------------------------------------------------------------------

const CONCENTRATION_VIEW = { width: 360, height: 196 };
const CONCENTRATION_PANEL_WIDTH = 110;
const CONCENTRATION_BASELINE_Y = 176;
const CONCENTRATION_BAR_MAX_HEIGHT = 118;
const CONCENTRATION_BAR_WIDTH = 30;

/**
 * Kolm peeglit: sama arvud, mis practice-1/2 ülesannetel (päikeseahi, väike
 * päikeseahi, kaks korda pikem fookuskaugus). Kordus on meelega – õpilane
 * näeb neid samu arve kahes kohas.
 */
const CONCENTRATION_CASES = [
  { label: "suur peegel", diameterM: 1, focalM: 1 },
  { label: "väike peegel", diameterM: 0.1, focalM: 0.1 },
  { label: "suur, lame peegel", diameterM: 1, focalM: 2 },
] as const;

/** Koondumistegurid mudelist – ei ühtegi neist ei ole siia käsitsi kirjutatud. */
const CONCENTRATION_VALUES = CONCENTRATION_CASES.map((mirror) =>
  solarConcentration(mirror.diameterM, mirror.focalM),
);
const MAX_CONCENTRATION = Math.max(...CONCENTRATION_VALUES);

/** Ümardatud sajalisteni jutu sisse, sama otsus, mis activities.ts `about`-il. */
const concentrationLabel = (value: number): string =>
  formatNumber(Math.round(value / 100) * 100);

function ConcentrationPanel({
  x,
  label,
  diameterM,
  focalM,
  concentration,
}: {
  x: number;
  label: string;
  diameterM: number;
  focalM: number;
  concentration: number;
}) {
  const centreX = x + CONCENTRATION_PANEL_WIDTH / 2;
  const barHeight =
    (concentration / MAX_CONCENTRATION) * CONCENTRATION_BAR_MAX_HEIGHT;
  const barTop = CONCENTRATION_BASELINE_Y - barHeight;

  return (
    <g>
      <text
        x={centreX}
        y={16}
        textAnchor="middle"
        className="fill-ink"
        fontSize={11}
        fontWeight={600}
      >
        {label}
      </text>
      <text
        x={centreX}
        y={32}
        textAnchor="middle"
        className="fill-ink-soft"
        fontSize={9}
      >
        D = {formatNumber(diameterM, 1)} m · f = {formatNumber(focalM, 1)} m
      </text>
      {/* Tihedustulp: kõrgus tuleb otse koondumistegurist, mitte silma järgi. */}
      <rect
        x={centreX - CONCENTRATION_BAR_WIDTH / 2}
        y={barTop}
        width={CONCENTRATION_BAR_WIDTH}
        height={barHeight}
        rx={5}
        className="fill-teacher"
      />
      <text
        x={centreX}
        y={barTop - 8}
        textAnchor="middle"
        className="fill-ink"
        fontSize={11}
        fontWeight={600}
      >
        ≈ {concentrationLabel(concentration)}×
      </text>
    </g>
  );
}

/**
 * Teooriajoonis: kolm peeglit, üks tulp iga peegli koondumisteguri jaoks.
 *
 * Vasak ja keskmine tulp on ÜHEPIKKUSED – eri suurusega peeglid, aga sama
 * suhe läbimõõt : fookuskaugus, seega sama tihedus. Vasak ja parem peegel on
 * SAMA suurusega (D = 1 m mõlemal), aga eri fookuskaugusega, seega eri
 * kõrgusega tulp. Kaks eri võrdlust ühel pildil – täpselt see, mida tekst
 * hoiatab, et enamik segi ajab.
 */
export function MirrorSizeVsConcentrationFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${CONCENTRATION_VIEW.width} ${CONCENTRATION_VIEW.height}`}
        role="img"
        aria-label={`Kolm peeglit kõrvuti, iga peegli all tulp, mille kõrgus näitab koondumistegurit. Vasakul suur peegel, läbimõõt 1 meeter ja fookuskaugus 1 meeter, koondumistegur umbes ${concentrationLabel(CONCENTRATION_VALUES[0])} korda. Keskel väike peegel, läbimõõt 10 sentimeetrit ja fookuskaugus 10 sentimeetrit – tulp on täpselt sama kõrge, koondumistegur samuti umbes ${concentrationLabel(CONCENTRATION_VALUES[1])} korda, sest suhe läbimõõt jagatud fookuskaugusega on mõlemal sama. Paremal on sama suur peegel kui vasakul, läbimõõt 1 meeter, aga kaks korda pikema fookuskaugusega, 2 meetrit – tulp on palju madalam, koondumistegur ainult umbes ${concentrationLabel(CONCENTRATION_VALUES[2])} korda.`}
        className="w-full rounded-2xl border border-line bg-white"
      >
        <line
          x1={6}
          y1={CONCENTRATION_BASELINE_Y}
          x2={CONCENTRATION_VIEW.width - 6}
          y2={CONCENTRATION_BASELINE_Y}
          className="stroke-ink-soft"
          strokeWidth={1.5}
        />
        {CONCENTRATION_CASES.map((mirror, index) => (
          <ConcentrationPanel
            key={mirror.label}
            x={index * CONCENTRATION_PANEL_WIDTH}
            label={mirror.label}
            diameterM={mirror.diameterM}
            focalM={mirror.focalM}
            concentration={CONCENTRATION_VALUES[index]}
          />
        ))}
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Vasak ja keskmine peegel on eri suurusega, aga sama suhtega – ja
        seepärast sama tihe. Vasak ja parem peegel on sama suurusega, aga eri
        suhtega – ja seepärast eri tihe, kuigi mõlemad on ühe meetri suured.
      </figcaption>
    </figure>
  );
}

/**
 * Theory-1 juurde: kolm joonist üksteise all, sama järjekord, mis
 * teooriateksti lõikudel – kõigepealt kaks suunda (`TwoDirectionsFigure`),
 * siis „allikas ei ole punkt" (`SourceSizeFigure`), siis peegli suurus vs
 * koondumine (`MirrorSizeVsConcentrationFigure`). Moodul jääb ühe
 * theory-sammu juurde, teist ei lisata (sama muster mis
 * `valgusallikad/SourceKindsFigure` ja
 * `kumerpeegli-rakendused/ViewFieldAndSizeIllusionFigure`).
 */
export function TwoDirectionsSourceAndConcentrationFigure() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <TwoDirectionsFigure />
      <SourceSizeFigure />
      <MirrorSizeVsConcentrationFigure />
    </div>
  );
}
