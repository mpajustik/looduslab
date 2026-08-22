/**
 * Mooduli joonised (src/engine/figures.ts).
 *
 * Need on VAATED, täpselt nagu Simulation.tsx. Erinevalt mooduli `nurkpeegel`
 * joonistest EI tule nende kuju `model.ts`-ist ja see on tahtlik: kumbki joonis
 * ei väida ühtegi ARVU. Hooki joonis näitab ainult seda, ET helkuriga
 * jalakäija paistab ja ilma helkurita mitte; teooriajoonis näitab kolme pinna
 * käitumist kõrvuti. Selle mooduli mudel arvutab plekke, nurki ja võimendust –
 * mitte kiirte teed peeglite vahel – , seega ei ole tal siin midagi anda.
 *
 * **Miks tuleb valgus mõlemal joonisel ÜLEVALT, mitte vasakult**
 * (spetsifikatsioon ütles „vasakult"): nii langeb kimp igal kolmel pinnal
 * täpselt 45° alla ja kogu kiirte tee koosneb püstistest ja rõhtsatest
 * lõikudest. Ükski peegeldumise valem ei jõua sellega VAATESSE (CLAUDE.md
 * reegel 1: füüsika elab model.ts-is) ja joonis on ikkagi täpne, mitte silma
 * järgi sobitatud. Nurkpeegli paneelil tuleb sellest ka mooduli enda tulemus
 * ausalt välja: sisse minev ja välja tulev kiir on täpselt vastassuunas ning
 * teineteisest kõrval.
 *
 * SUUNAD: SVG-s kasvab y ALLA. „Üles" on siin failis −y ja seda ei keerata
 * kusagil ümber.
 *
 * VÄRV EI OLE AINUS INFO KANDJA (DISAINIJUHIS): sissetulev valgus on pidev
 * joon, tagasitulev katkendlik, ja mõlemal on oma silt.
 */

import type { ReactNode } from "react";

type Point = { x: number; y: number };

/** Nooleotsad. Ühed id-d kogu failis: korraga on ekraanil üks joonis. */
const ARROW_LIGHT = "hl-arrow-light";
const ARROW_RETURN = "hl-arrow-return";

function RayArrowDefs() {
  return (
    <defs>
      {/* `fill` on markeril otse küljes: marker ei päri värvi teda kasutavalt
          joonelt. Kaks eri marker'it, sest sissetulev ja tagasitulev valgus on
          kahte eri värvi. */}
      <marker
        id={ARROW_LIGHT}
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
        id={ARROW_RETURN}
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

const HATCH_STEP_PX = 13;
const HATCH_LENGTH_PX = 7;

/**
 * Peegel: paks joon ja viirutus TAGUMISEL küljel.
 *
 * Kumb pool peegeldab, on nähtav ilma värvita – viirutus on kuju, mitte toon.
 * `back` on ühikvektor, mis näitab peegli tagumise külje poole.
 */
function Mirror({ from, to, back }: { from: Point; to: Point; back: Point }) {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  const unit = { x: (to.x - from.x) / length, y: (to.y - from.y) / length };
  const ticks = Array.from(
    { length: Math.floor(length / HATCH_STEP_PX) },
    (_, index) => (index + 0.5) * HATCH_STEP_PX,
  );
  return (
    <>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        className="stroke-ink"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <g className="stroke-ink-soft" strokeWidth={1.5} strokeLinecap="round">
        {ticks.map((distance) => {
          const foot = {
            x: from.x + unit.x * distance,
            y: from.y + unit.y * distance,
          };
          return (
            <line
              key={distance}
              x1={foot.x}
              y1={foot.y}
              x2={foot.x + back.x * HATCH_LENGTH_PX + unit.x * HATCH_LENGTH_PX * 0.6}
              y2={foot.y + back.y * HATCH_LENGTH_PX + unit.y * HATCH_LENGTH_PX * 0.6}
            />
          );
        })}
      </g>
    </>
  );
}

// ---------------------------------------------------------------------------
// hl-kaks-jalakaijat – hook
// ---------------------------------------------------------------------------

const ROAD_VIEW = { width: 360, height: 250 };
/** Tee servad ja keskjoon – pealtvaade, auto sõidab alt üles. */
const ROAD = { left: 78, right: 282, top: 8, bottom: ROAD_VIEW.height - 8 };
const CAR = { x: 156, y: 186, width: 48, height: 56 };
/** Mõlema jalakäija kõrgus pildil on sama: nad erinevad ainult helkuri poolest. */
const WALKER_Y = 74;

/**
 * Häälestav joonis: pime maantee pealtvaates, kaks jalakäijat.
 *
 * Vasakul jalakäija ilma helkurita – ainult hall kontuur, sest autotulede
 * valgus läheb temalt igale poole laiali ja juhini jõuab tibatilluke osa.
 * Paremal sama jalakäija, aga rinnal helkur, millest tuleb auto poole kitsas
 * hele kimp.
 *
 * Ühtki nurka siin ei mõõdeta ega väideta: hook ei tohi teooria vastust ette
 * öelda. Autotulede valgusvihk on seepärast pehme kolmnurk, mitte kiirte kimp.
 */
export function TwoWalkersFigure() {
  const leftWalker = { x: 104, y: WALKER_Y };
  const rightWalker = { x: 254, y: WALKER_Y };
  const headlightLeft = { x: CAR.x + 8, y: CAR.y };
  const headlightRight = { x: CAR.x + CAR.width - 8, y: CAR.y };

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${ROAD_VIEW.width} ${ROAD_VIEW.height}`}
        role="img"
        aria-label="Joonis: pimeda maantee pealtvaade. All keskel on auto kahe esitulega, millest lähtub lai hele valgusvihk üles mööda teed. Vasakul tee ääres seisab jalakäija ilma helkurita – ta on joonisel ainult kahvatu hall kontuur. Paremal tee ääres seisab samasugune jalakäija, kellel on rinnal helkur; helkurilt läheb kitsas hele kiir tagasi alla auto poole."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />

        {/* Tee: kaks serva ja katkendlik keskjoon. */}
        <rect
          x={ROAD.left}
          y={ROAD.top}
          width={ROAD.right - ROAD.left}
          height={ROAD.bottom - ROAD.top}
          className="fill-line stroke-ink-soft"
          fillOpacity={0.5}
          strokeWidth={1.5}
        />
        <line
          x1={(ROAD.left + ROAD.right) / 2}
          y1={ROAD.top + 6}
          x2={(ROAD.left + ROAD.right) / 2}
          y2={ROAD.bottom - 6}
          className="stroke-ink-soft"
          strokeWidth={1.5}
          strokeDasharray="10 12"
        />

        {/* Esitulede valgusvihk: pehme kolmnurk, mitte kiirte kimp. */}
        <path
          d={`M ${headlightLeft.x} ${headlightLeft.y} L ${ROAD.left - 24} ${ROAD.top + 24} L ${ROAD.right + 24} ${ROAD.top + 24} L ${headlightRight.x} ${headlightRight.y} z`}
          className="fill-brand-soft"
        />

        {/* Auto: kere, kaks esituld ja juhi koht. */}
        <rect
          x={CAR.x}
          y={CAR.y}
          width={CAR.width}
          height={CAR.height}
          rx={10}
          className="fill-white stroke-ink"
          strokeWidth={2}
        />
        <g className="fill-brand">
          <circle cx={headlightLeft.x} cy={headlightLeft.y} r={5} />
          <circle cx={headlightRight.x} cy={headlightRight.y} r={5} />
        </g>

        {/* Jalakäija ilma helkurita: kahvatu kontuur. */}
        <g className="fill-white stroke-line" strokeWidth={2}>
          <circle cx={leftWalker.x} cy={leftWalker.y} r={11} />
          <rect
            x={leftWalker.x - 9}
            y={leftWalker.y + 13}
            width={18}
            height={30}
            rx={6}
          />
        </g>

        {/* Jalakäija helkuriga: sama kontuur, aga rinnal hele helkur. */}
        <g className="fill-white stroke-ink" strokeWidth={2}>
          <circle cx={rightWalker.x} cy={rightWalker.y} r={11} />
          <rect
            x={rightWalker.x - 9}
            y={rightWalker.y + 13}
            width={18}
            height={30}
            rx={6}
          />
        </g>
        <rect
          x={rightWalker.x - 5}
          y={rightWalker.y + 20}
          width={10}
          height={10}
          rx={2}
          className="fill-info stroke-info"
          strokeWidth={1.5}
        />

        {/* Tagasitulev valgus: helkurilt auto poole, katkendlik ja teist värvi. */}
        <path
          d={rayPath(
            { x: rightWalker.x - 4, y: rightWalker.y + 32 },
            { x: headlightRight.x + 4, y: headlightRight.y - 8 },
            0.55,
          )}
          className="fill-none stroke-info"
          strokeWidth={2.5}
          strokeDasharray="9 6"
          markerMid={`url(#${ARROW_RETURN})`}
        />

        {/* Sildid – joonis peab olema loetav ka ilma värvita. */}
        <text
          x={leftWalker.x}
          y={leftWalker.y - 20}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={11}
        >
          ilma helkurita
        </text>
        <text
          x={rightWalker.x}
          y={rightWalker.y - 20}
          textAnchor="middle"
          className="fill-ink"
          fontSize={11}
          fontWeight={600}
        >
          helkuriga
        </text>
        <text
          x={ROAD.left - 8}
          y={ROAD.bottom - 30}
          textAnchor="end"
          className="fill-brand"
          fontSize={11}
        >
          esitulede
        </text>
        <text
          x={ROAD.left - 8}
          y={ROAD.bottom - 16}
          textAnchor="end"
          className="fill-brand"
          fontSize={11}
        >
          valgus
        </text>
        <text
          x={ROAD.right + 8}
          y={WALKER_Y + 76}
          className="fill-info"
          fontSize={11}
          fontWeight={600}
        >
          tagasi
        </text>
        <text x={ROAD.right + 8} y={WALKER_Y + 90} className="fill-info" fontSize={11}>
          auto poole
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Mõlemad jalakäijad on autotulede valguses. Helkuriga jalakäijalt tuleb
        valgus tagasi auto poole – ilma helkurita jalakäijalt peaaegu mitte.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// hl-kolm-pinda – teooria
// ---------------------------------------------------------------------------

const PANEL_VIEW = { width: 360, height: 220 };
const PANEL_WIDTH = 112;
const PANEL_GAP = 12;
const PANEL_TOP = 34;
const PANEL_HEIGHT = 158;
/** Kimbu kaks kiirt: kaugused paneeli keskjoonest (px). */
const RAY_OFFSETS = [12, 26];
/** Kus kiirte kimp algab ja kus pinnaga kohtub. */
const RAY_START_Y = PANEL_TOP + 16;
const SURFACE_Y = PANEL_TOP + 104;

function panelLeft(index: number): number {
  const total = 3 * PANEL_WIDTH + 2 * PANEL_GAP;
  return (PANEL_VIEW.width - total) / 2 + index * (PANEL_WIDTH + PANEL_GAP);
}

/** Paneeli raam ja pealkiri – kolm ühesugust kasti kõrvuti. */
function Panel({
  index,
  title,
  caption,
  children,
}: {
  index: number;
  title: string;
  caption: string;
  children: ReactNode;
}) {
  const left = panelLeft(index);
  const centre = left + PANEL_WIDTH / 2;
  return (
    <g>
      <rect
        x={left}
        y={PANEL_TOP}
        width={PANEL_WIDTH}
        height={PANEL_HEIGHT}
        rx={10}
        className="fill-white stroke-line"
        strokeWidth={1.5}
      />
      <text
        x={centre}
        y={PANEL_TOP - 12}
        textAnchor="middle"
        className="fill-ink"
        fontSize={12}
        fontWeight={600}
      >
        {title}
      </text>
      {children}
      <text
        x={centre}
        y={PANEL_TOP + PANEL_HEIGHT + 16}
        textAnchor="middle"
        className="fill-ink-soft"
        fontSize={11}
      >
        {caption}
      </text>
    </g>
  );
}

/** Sissetulev kimp: püstised kiired ülevalt alla, pidev joon. */
function IncomingRays({ xs, toY }: { xs: number[]; toY: (x: number) => number }) {
  return (
    <g
      className="fill-none stroke-brand"
      strokeWidth={2.5}
      strokeLinecap="round"
    >
      {xs.map((x) => (
        <path
          key={x}
          d={rayPath({ x, y: RAY_START_Y }, { x, y: toY(x) }, 0.6)}
          markerMid={`url(#${ARROW_LIGHT})`}
        />
      ))}
    </g>
  );
}

/**
 * Kolm pinda kõrvuti: tasapeegel, matt pind, nurkpeegel.
 *
 * Igal paneelil on TÄPSELT SAMA sissetulev kimp (kaks püstist kiirt ülevalt) ja
 * ainus vahe on pind. Nii on näha, et helkur ei tee valgust rohkem – ta saadab
 * ta ainult teise suunda.
 *
 * Kogu geomeetria on 45° peal: sissetulev kiir on püstine, peeglid on 45° kaldu,
 * seega on iga peegeldunud lõik kas rõhtne või püstine. Ühtegi peegeldumise
 * valemit ei ole siin failis – ja ometi ei ole joonisel ühtki silma järgi
 * sobitatud nurka.
 *
 * Matt pinna kiirtekimp on AINUS koht, mis on skemaatiline: päris matt pind
 * saadab valguse laiali üle terve poolkera ja iga suund saab natuke. Joonisel on
 * neid suundi seitse, sest rohkem ei mahu – arvu ta ei väida.
 */
export function ThreeSurfacesFigure() {
  const mirrorCentre = panelLeft(0) + PANEL_WIDTH / 2;
  const mattCentre = panelLeft(1) + PANEL_WIDTH / 2;
  const cornerCentre = panelLeft(2) + PANEL_WIDTH / 2;

  // Tasapeegel: 45° kaldu ülevalt vasakult alla paremale. Püstine kiir läheb
  // sellelt rõhtsalt paremale – kogu valgus ühte suunda.
  const tiltedFrom = { x: mirrorCentre - 34, y: SURFACE_Y - 34 };
  const tiltedTo = { x: mirrorCentre + 34, y: SURFACE_Y + 34 };

  // Nurkpeegel: kaks peeglit täisnurga all, tipp all keskel. Püstine kiir tabab
  // vasakut peeglit, läheb rõhtsalt paremale ja väljub püstiselt üles –
  // täpselt vastassuunas ja kimbu teisel serval.
  const vertex = { x: cornerCentre, y: SURFACE_Y + 34 };
  const cornerArm = 46;

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${PANEL_VIEW.width} ${PANEL_VIEW.height}`}
        role="img"
        aria-label="Joonis: kolm skeemi kõrvuti, igal ühesugune valguskimp, mis tuleb ülevalt alla. Vasakul tasapeegel 45 kraadi kaldu – kimp peegeldub sellelt ühte suunda, paremale. Keskel matt pind – valgus läheb sealt lühikeste kiirtena igasse suunda laiali. Paremal nurkpeegel, kaks peeglit täisnurga all – kimp läheb esimeselt peeglilt teisele ja väljub täpselt tagasi üles, sissetulevaga vastassuunas."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />

        {/* --- Tasapeegel: valgus ühte kindlasse suunda --- */}
        <Panel index={0} title="tasapeegel" caption="kõrvale, ühte suunda">
          <Mirror
            from={tiltedFrom}
            to={tiltedTo}
            back={{ x: -Math.SQRT1_2, y: Math.SQRT1_2 }}
          />
          <IncomingRays
            xs={RAY_OFFSETS.map((offset) => mirrorCentre - offset)}
            // Püstine kiir tabab 45° peeglit seal, kus peegli joon on parajasti
            // sama x juures: y = SURFACE_Y + (x − keskkoht).
            toY={(x) => SURFACE_Y + (x - mirrorCentre)}
          />
          <g
            className="fill-none stroke-info"
            strokeWidth={2.5}
            strokeDasharray="9 6"
            strokeLinecap="round"
          >
            {RAY_OFFSETS.map((offset) => {
              const y = SURFACE_Y - offset;
              return (
                <path
                  key={offset}
                  d={rayPath(
                    { x: mirrorCentre - offset, y },
                    { x: panelLeft(0) + PANEL_WIDTH - 8, y },
                    0.6,
                  )}
                  markerMid={`url(#${ARROW_RETURN})`}
                />
              );
            })}
          </g>
        </Panel>

        {/* --- Matt pind: valgus igasse suunda laiali --- */}
        <Panel index={1} title="matt pind" caption="igasse suunda laiali">
          <Mirror
            from={{ x: mattCentre - 40, y: SURFACE_Y }}
            to={{ x: mattCentre + 40, y: SURFACE_Y }}
            back={{ x: 0, y: 1 }}
          />
          <IncomingRays
            xs={RAY_OFFSETS.map((offset) => mattCentre - offset)}
            toY={() => SURFACE_Y}
          />
          <g
            className="fill-none stroke-info"
            strokeWidth={2}
            strokeDasharray="7 5"
            strokeLinecap="round"
          >
            {[20, 43, 66, 90, 114, 137, 160].map((angleDeg) => {
              const radians = (angleDeg * Math.PI) / 180;
              const length = 40;
              return (
                <line
                  key={angleDeg}
                  x1={mattCentre - RAY_OFFSETS[0]}
                  y1={SURFACE_Y}
                  x2={mattCentre - RAY_OFFSETS[0] + Math.cos(radians) * length}
                  y2={SURFACE_Y - Math.sin(radians) * length}
                />
              );
            })}
          </g>
        </Panel>

        {/* --- Nurkpeegel: valgus tagasi sinna, kust ta tuli --- */}
        <Panel index={2} title="nurkpeegel" caption="tagasi sinna, kust tuli">
          <Mirror
            from={{ x: vertex.x - cornerArm, y: vertex.y - cornerArm }}
            to={vertex}
            back={{ x: -Math.SQRT1_2, y: Math.SQRT1_2 }}
          />
          <Mirror
            from={vertex}
            to={{ x: vertex.x + cornerArm, y: vertex.y - cornerArm }}
            back={{ x: Math.SQRT1_2, y: Math.SQRT1_2 }}
          />
          <IncomingRays
            xs={RAY_OFFSETS.map((offset) => vertex.x - offset)}
            // Vasak peegel: y = vertex.y − (vertex.x − x).
            toY={(x) => vertex.y - (vertex.x - x)}
          />
          <g
            className="fill-none stroke-info"
            strokeWidth={2.5}
            strokeDasharray="9 6"
            strokeLinecap="round"
          >
            {RAY_OFFSETS.map((offset) => {
              const hitY = vertex.y - offset;
              return (
                <g key={offset}>
                  {/* Rõhtne lõik vasakult peeglilt paremale peeglile. */}
                  <path
                    d={rayPath(
                      { x: vertex.x - offset, y: hitY },
                      { x: vertex.x + offset, y: hitY },
                      0.6,
                    )}
                    markerMid={`url(#${ARROW_RETURN})`}
                  />
                  {/* Väljuv kiir: püstiselt üles, sissetulevaga vastassuunas. */}
                  <path
                    d={rayPath(
                      { x: vertex.x + offset, y: hitY },
                      { x: vertex.x + offset, y: RAY_START_Y },
                      0.6,
                    )}
                    markerMid={`url(#${ARROW_RETURN})`}
                  />
                </g>
              );
            })}
          </g>
        </Panel>

        {/* Kimbu sildid: pidev joon = sisse, katkendlik = välja. */}
        <text x={8} y={16} className="fill-brand" fontSize={11} fontWeight={600}>
          sissetulev valgus (pidev joon)
        </text>
        <text
          x={PANEL_VIEW.width - 8}
          y={16}
          textAnchor="end"
          className="fill-info"
          fontSize={11}
          fontWeight={600}
        >
          väljuv valgus (katkendlik)
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Kõigil kolmel pinnal on täpselt sama sissetulev valgus. Vahe on ainult
        selles, KUHU valgus edasi läheb – ja helkur saadab ta tagasi allika
        poole.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// hl-kolm-pinda – teooria (kuubinurk isomeetrias)
// ---------------------------------------------------------------------------

const CUBE_VIEW = { width: 360, height: 260 };
/** Esinurk (kus põrand ja kaks seina kohtuvad LÄHIMAS servas). */
const CUBE_FRONT = { x: 150, y: 224 };
/** Põranda poolteljed (isomeetriline diagonaal) ja seinte kõrgus. */
const CUBE_HALF = 66;
const CUBE_HEIGHT = 148;

const CUBE_RIGHT = { x: CUBE_FRONT.x + CUBE_HALF, y: CUBE_FRONT.y - CUBE_HALF / 2 };
const CUBE_LEFT = { x: CUBE_FRONT.x - CUBE_HALF, y: CUBE_FRONT.y - CUBE_HALF / 2 };
/** Tagumine alaserv – siit läheb üles PÜSTINE serv, mida kolm pinda jagavad. */
const CUBE_BACK_BOTTOM = { x: CUBE_FRONT.x, y: CUBE_FRONT.y - CUBE_HALF };
const CUBE_BACK_TOP = { x: CUBE_BACK_BOTTOM.x, y: CUBE_BACK_BOTTOM.y - CUBE_HEIGHT };
const CUBE_RIGHT_TOP = { x: CUBE_RIGHT.x, y: CUBE_RIGHT.y - CUBE_HEIGHT };
const CUBE_LEFT_TOP = { x: CUBE_LEFT.x, y: CUBE_LEFT.y - CUBE_HEIGHT };

const polygonPoints = (points: Point[]) =>
  points.map((point) => `${point.x},${point.y}`).join(" ");

/**
 * Punkt tasapinnalise nelinurga SEES: `corner + s·(edgeA) + t·(edgeB)`.
 *
 * Kiire põrkepunktid TULEVAD SIIT, mitte käsitsi valitud koordinaadist – kui
 * `s` ja `t` on vahemikus (0, 1), on tulemus garanteeritult tahu SEES, mitte
 * kogemata õhus või kahe tahu ühisserval (CodeRabbiti moodi leid: kolmest
 * põrkepunktist kaks olid varem tahust väljas, kuigi joonis väitis vastupidist).
 */
function facePoint(
  corner: Point,
  edgeA: Point,
  edgeB: Point,
  s: number,
  t: number,
): Point {
  return {
    x: corner.x + edgeA.x * s + edgeB.x * t,
    y: corner.y + edgeA.y * s + edgeB.y * t,
  };
}

/**
 * Kuubinurk isomeetrias: põrand + kaks seina, nagu toa nurk.
 *
 * Teooriateksti viimane lause ütleb, et päris helkur on „täpitud pisikestest
 * kuubinurkadest: kolm peeglit risti nagu toa nurk, kus kaks seina ja põrand
 * kokku saavad" – aga kaks kõrvutist tasapaneeli (`ThreeSurfacesFigure`) ei
 * saa kolmandat mõõdet kunagi näidata. See joonis on 2D `ThreeSurfacesFigure`
 * RUUMILINE vaste: sama kolm risti pinda, aga nüüd päriselt kolmes suunas.
 *
 * **Põrkepunktid on siin SKEMAATILISED, mitte tuletatud** (samal viisil nagu
 * `ThreeSurfacesFigure` matt-paneeli seitse suunda) – need ei tule
 * arvutusest, sest see moodul ei arvuta kiirte teid peeglite vahel (vt
 * faili päist). Väljuva kiire SUUND on aga tuletatud sisenevast (vastassuund) –
 * joonis väidab seda, mida tekst juba väidab: kiir puudutab kõiki kolme
 * pinda ja tuleb tagasi täpselt vastassuunas.
 */
export function CubeCornerFigure() {
  const incomingStart = { x: 296, y: 30 };
  // Iga põrkepunkt on OMA tahu sees (s, t ∈ (0, 1)) – vt `facePoint`.
  const hitRightWall = facePoint(
    CUBE_RIGHT,
    { x: CUBE_BACK_BOTTOM.x - CUBE_RIGHT.x, y: CUBE_BACK_BOTTOM.y - CUBE_RIGHT.y },
    { x: CUBE_RIGHT_TOP.x - CUBE_RIGHT.x, y: CUBE_RIGHT_TOP.y - CUBE_RIGHT.y },
    0.5,
    0.55,
  );
  const hitLeftWall = facePoint(
    CUBE_LEFT,
    { x: CUBE_BACK_BOTTOM.x - CUBE_LEFT.x, y: CUBE_BACK_BOTTOM.y - CUBE_LEFT.y },
    { x: CUBE_LEFT_TOP.x - CUBE_LEFT.x, y: CUBE_LEFT_TOP.y - CUBE_LEFT.y },
    0.5,
    0.55,
  );
  const hitFloor = facePoint(
    CUBE_FRONT,
    { x: CUBE_RIGHT.x - CUBE_FRONT.x, y: CUBE_RIGHT.y - CUBE_FRONT.y },
    { x: CUBE_LEFT.x - CUBE_FRONT.x, y: CUBE_LEFT.y - CUBE_FRONT.y },
    0.5,
    0.2,
  );
  // Väljuv kiir on sisenevaga VASTASSUUNALINE (helkuri põhiomadus) – seepärast
  // tuletatud sissetuleva suuna negatsioonina, mitte käsitsi valitud punktina.
  const incomingDirection = {
    x: hitRightWall.x - incomingStart.x,
    y: hitRightWall.y - incomingStart.y,
  };
  const outgoingEnd = {
    x: hitFloor.x - incomingDirection.x,
    y: hitFloor.y - incomingDirection.y,
  };

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${CUBE_VIEW.width} ${CUBE_VIEW.height}`}
        role="img"
        aria-label="Joonis: kuubi sisenurk isomeetrilises vaates, nagu toa nurk, kus põrand ja kaks seina kohtuvad. Kõik kolm pinda on peeglid. Sissetulev kiir puudutab paremat seina, siis vasakut seina, siis põrandat, ja tuleb tagasi peaaegu täpselt samast suunast, kust ta tuli."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />

        {/* Põrand ja kaks seina – kolm risti pinda, iga oma tooniga. */}
        <polygon
          points={polygonPoints([CUBE_FRONT, CUBE_RIGHT, CUBE_BACK_BOTTOM, CUBE_LEFT])}
          className="fill-brand stroke-ink"
          fillOpacity={0.18}
        />
        <polygon
          points={polygonPoints([
            CUBE_RIGHT,
            CUBE_BACK_BOTTOM,
            CUBE_BACK_TOP,
            CUBE_RIGHT_TOP,
          ])}
          className="fill-brand stroke-ink"
          fillOpacity={0.32}
        />
        <polygon
          points={polygonPoints([
            CUBE_LEFT,
            CUBE_BACK_BOTTOM,
            CUBE_BACK_TOP,
            CUBE_LEFT_TOP,
          ])}
          className="fill-brand stroke-ink"
          fillOpacity={0.46}
        />
        <g className="stroke-ink" strokeWidth={1.5} strokeLinejoin="round">
          <polyline
            points={polygonPoints([CUBE_FRONT, CUBE_RIGHT, CUBE_RIGHT_TOP])}
            fill="none"
          />
          <polyline
            points={polygonPoints([CUBE_FRONT, CUBE_LEFT, CUBE_LEFT_TOP])}
            fill="none"
          />
          <line
            x1={CUBE_BACK_BOTTOM.x}
            y1={CUBE_BACK_BOTTOM.y}
            x2={CUBE_BACK_TOP.x}
            y2={CUBE_BACK_TOP.y}
          />
        </g>

        <text x={CUBE_FRONT.x} y={CUBE_FRONT.y + 20} textAnchor="middle" className="fill-ink-soft" fontSize={10}>
          põrand
        </text>
        <text x={CUBE_RIGHT_TOP.x + 6} y={CUBE_RIGHT_TOP.y + 14} textAnchor="start" className="fill-ink-soft" fontSize={10}>
          sein A
        </text>
        <text x={CUBE_LEFT_TOP.x - 6} y={CUBE_LEFT_TOP.y + 14} textAnchor="end" className="fill-ink-soft" fontSize={10}>
          sein B
        </text>

        {/* Kiire tee: sissetulev pidev, kolm põrget, väljuv katkendlik. */}
        <g className="fill-none stroke-brand" strokeWidth={2.5} strokeLinecap="round">
          <path
            d={rayPath(incomingStart, hitRightWall, 0.55)}
            markerMid={`url(#${ARROW_LIGHT})`}
          />
          <path d={`M ${hitRightWall.x} ${hitRightWall.y} L ${hitLeftWall.x} ${hitLeftWall.y}`} />
          <path d={`M ${hitLeftWall.x} ${hitLeftWall.y} L ${hitFloor.x} ${hitFloor.y}`} />
        </g>
        <g className="fill-none stroke-info" strokeWidth={2.5} strokeLinecap="round" strokeDasharray="6 5">
          <path
            d={rayPath(hitFloor, outgoingEnd, 0.6)}
            markerMid={`url(#${ARROW_RETURN})`}
          />
        </g>
        <circle cx={hitRightWall.x} cy={hitRightWall.y} r={2.5} className="fill-ink" />
        <circle cx={hitLeftWall.x} cy={hitLeftWall.y} r={2.5} className="fill-ink" />
        <circle cx={hitFloor.x} cy={hitFloor.y} r={2.5} className="fill-ink" />

        <text x={incomingStart.x + 6} y={incomingStart.y - 4} textAnchor="middle" className="fill-brand" fontSize={10} fontWeight={600}>
          sisse
        </text>
        <text x={outgoingEnd.x + 6} y={outgoingEnd.y + 4} textAnchor="start" className="fill-info" fontSize={10} fontWeight={600}>
          välja
        </text>

        <text
          x={CUBE_VIEW.width / 2}
          y={CUBE_VIEW.height - 8}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={10}
        >
          kolm põrget – kiir tagasi peaaegu sealt, kust tuli
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Päris helkur on kolm peeglit risti, nagu toa nurk. Kiir põrkab kõigilt
        kolmelt ja tuleb tagasi peaaegu täpselt sealt, kust ta tuli.
      </figcaption>
    </figure>
  );
}

/**
 * Theory-1 juurde: kaks kõrvutist tasapaneeli (`ThreeSurfacesFigure`) ja
 * selle all kolmemõõtmeline kuubinurk (`CubeCornerFigure`) – kaks eri
 * raskusastet samast teooriatekstist ühe joonisena, moodul jääb 6 sammu
 * juurde, teist theory-sammu ei lisata (sama muster mis mujal P1-s).
 */
export function ThreeSurfacesAndCubeCornerFigure() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <ThreeSurfacesFigure />
      <CubeCornerFigure />
    </div>
  );
}
