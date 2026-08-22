import type { ReactNode } from "react";
import { type Vector2, traceCornerRay } from "./model";

/**
 * Mooduli joonised (src/engine/figures.ts).
 *
 * Need on VAATED, täpselt nagu Simulation.tsx – aga kaks neist teevad
 * GEOMEETRILISE VÄITE („kaks langemisnurka annavad kokku peeglite nurga",
 * „pööre on kaks korda peeglite nurk"), seega ei tohi nende kuju tulla käsitsi
 * sobitatud joontest. Mõlemad langemispunktid, kõik kolm kiire suunda ja
 * seeläbi ka iga nurgakaar tulevad `model.ts`-i funktsioonist `traceCornerRay`
 * (CLAUDE.md reegel 1); joonis ise ainult skaleerib meetrid piksliteks. Nii ei
 * saa joonis ja simulatsioon kunagi eri füüsikat näidata.
 *
 * ÜHIKUD: mudel räägib meetrites, joonis pikslites. Ühik muutub ainult
 * skaleerimisel (`PX_PER_METRE`) – kõik mudelile antavad arvud on meetrites.
 * Mõõtkava on MÕLEMAL teljel sama, muidu ei oleks joonisel olevad nurgad enam
 * päris nurgad – ja siis oleks α = α silmale vale.
 *
 * SUUNAD: mudelis kasvab y ÜLES (matemaatika), SVG-s ALLA. Ainus koht, kus see
 * pöördub, on `toScreen` ja `toScreenDirection`; mujal ei tohi ühtegi y-märki
 * käsitsi keerata. Paigutus on kõigil joonistel ja Simulation.tsx-il sama:
 * peeglite tipp vasakul all, peegel 1 sealt paremale, peegel 2 nurga all üles.
 *
 * PEEGEL 2 ON JOONISEL LÜHIKE – ta lõpeb natuke pärast teist langemispunkti
 * (model.ts idealiseering 5). Lõpmata pikk peegel jääks sissetuleva kiire ette
 * ja joonisel paistaks, nagu tuleks valgus peeglist LÄBI. Päris nurkpeeglil on
 * peeglid lühikesed ja valgus tuleb sisse nende otste vahelt.
 *
 * Hooki joonis (`np-ule-aia`) ei tohi vastust ette öelda: ta näitab ainult
 * seda, ET kaks peeglit toovad pildi aia tagant alla. Tema peeglid on
 * seepärast lihtsad kaldkriipsud, mitte mudeli geomeetria – ta ei väida ühtegi
 * nurka ega kaugust.
 */

type Point = { x: number; y: number };

/** Nooleotsad. Ühed id-d kogu failis: korraga on ekraanil üks joonis. */
const ARROW_LIGHT = "np-arrow-light";

function RayArrowDefs() {
  return (
    <defs>
      {/* `fill` on markeril otse küljes: marker ei päri värvi teda kasutavalt
          joonelt. */}
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

function along(origin: Point, direction: Point, distance: number): Point {
  return {
    x: origin.x + direction.x * distance,
    y: origin.y + direction.y * distance,
  };
}

/** Vastassuund – „sinnapoole, kust kiir tuli". */
function opposite(direction: Point): Point {
  return { x: -direction.x, y: -direction.y };
}

/** Kahe suuna vaheline poolitaja – nurgasilt läheb kaare keskele. */
function bisector(a: Point, b: Point): Point {
  const x = a.x + b.x;
  const y = a.y + b.y;
  const length = Math.hypot(x, y);
  return { x: x / length, y: y / length };
}

/**
 * Nurgakaar suunast suunani, alati LÜHEMAT teed.
 *
 * Sweep-lipu valib ristkorrutis, mitte silm: kaks langemispunkti on joonisel
 * eri pidi (peegel 1 all, peegel 2 kaldu) ja käsitsi valitud lipp läheks ühes
 * neist vale ringi ümber.
 */
function angleArc(
  origin: Point,
  from: Point,
  to: Point,
  radius: number,
): string {
  const start = along(origin, from, radius);
  const end = along(origin, to, radius);
  const sweep = from.x * to.y - from.y * to.x > 0 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 ${sweep} ${end.x} ${end.y}`;
}

/** Kahe sirge lõikepunkt: (p + t·u) = (q + s·v). Paralleelsed sirged siia ei jõua. */
function intersection(p: Point, u: Point, q: Point, v: Point): Point {
  const determinant = u.x * v.y - u.y * v.x;
  const t = ((q.x - p.x) * v.y - (q.y - p.y) * v.x) / determinant;
  return along(p, u, t);
}

// ---------------------------------------------------------------------------
// Ühine nurkpeegli geomeetria (np-kaks-peeglit ja np-loe-nurgad)
// ---------------------------------------------------------------------------

/**
 * Mõõtkava ja esimese langemispunkti kaugus tipust.
 *
 * Kaugus on 0,1 m ainult sellepärast, et mudel nõuab meetreid: joonis ei näita
 * ühtegi PIKKUST ega ütle, kui suur nurkpeegel on. Tähtsad on ainult nurgad ja
 * need ei sõltu mõõtkavast (mudeli invariant: kaks korda kaugem langemispunkt
 * annab täpselt sama teekonna kuju).
 */
const FIRST_HIT_M = 0.1;
const PX_PER_METRE = 1100;

/** Mudeli punkt (m, y üles) ekraanipunktiks (px, y alla). */
function toScreen(vertex: Point, point: Vector2): Point {
  return {
    x: vertex.x + point.x * PX_PER_METRE,
    y: vertex.y - point.y * PX_PER_METRE,
  };
}

/** Mudeli suund ekraanisuunaks: skaala on mõlemal teljel sama, muutub ainult y märk. */
function toScreenDirection(direction: Vector2): Point {
  return { x: direction.x, y: -direction.y };
}

/** Peegel 1 tipust paremale; peegel 2 tipust nurga all üles. */
function mirrorDirections(mirrorAngleDeg: number): {
  first: Point;
  second: Point;
} {
  const rad = (mirrorAngleDeg * Math.PI) / 180;
  return {
    first: { x: 1, y: 0 },
    second: toScreenDirection({ x: Math.cos(rad), y: Math.sin(rad) }),
  };
}

/** Mitu viirutuskriipsu peegli tagaküljele – ühtlane samm mõlemal peeglil. */
const HATCH_STEP_PX = 15;
const HATCH_LENGTH_PX = 8;

/**
 * Peegel: paks joon ja viirutus TAGUMISEL küljel.
 *
 * Kumb pool peegeldab, on joonisel nähtav ilma värvita – viirutus on kuju, mitte
 * toon (DISAINIJUHIS: värv ei ole kunagi ainus info kandja).
 */
function Mirror({
  from,
  direction,
  length,
  backSide,
}: {
  from: Point;
  direction: Point;
  length: number;
  backSide: Point;
}) {
  const end = along(from, direction, length);
  const ticks = Array.from(
    { length: Math.floor(length / HATCH_STEP_PX) },
    (_, index) => (index + 0.5) * HATCH_STEP_PX,
  );
  return (
    <>
      <line
        x1={from.x}
        y1={from.y}
        x2={end.x}
        y2={end.y}
        className="stroke-ink"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <g className="stroke-ink-soft" strokeWidth={1.5} strokeLinecap="round">
        {ticks.map((distance) => {
          const foot = along(from, direction, distance);
          // Kriips kaldub tahapoole ja natuke edasi – nii on ta tavaline
          // tehnilise joonise viirutus, mitte peegliga risti olev ripsmerida.
          const tip = along(
            along(foot, backSide, HATCH_LENGTH_PX),
            direction,
            HATCH_LENGTH_PX * 0.6,
          );
          return (
            <line key={distance} x1={foot.x} y1={foot.y} x2={tip.x} y2={tip.y} />
          );
        })}
      </g>
    </>
  );
}

/** Ristsirge: katkendjoon, sest see ei ole valguskiir, vaid abijoon. */
function Normal({
  at,
  direction,
  length,
}: {
  at: Point;
  direction: Point;
  length: number;
}) {
  const end = along(at, direction, length);
  return (
    <line
      x1={at.x}
      y1={at.y}
      x2={end.x}
      y2={end.y}
      className="stroke-ink"
      strokeWidth={1.5}
      strokeDasharray="6 5"
    />
  );
}

function HitPoint({ at, label }: { at: Point; label: string }) {
  return (
    <>
      <circle cx={at.x} cy={at.y} r={3.5} className="fill-ink" />
      <text
        x={at.x + 8}
        y={at.y + 14}
        className="fill-ink"
        fontSize={12}
        fontWeight={600}
      >
        {label}
      </text>
    </>
  );
}

// ---------------------------------------------------------------------------
// np-ule-aia – hook
// ---------------------------------------------------------------------------

const FENCE_VIEW = { width: 360, height: 230 };
const FENCE_X = 96;
const TUBE = { x: 176, top: 42, width: 34, bottom: 186 };
/** Peeglid toru otstes: kaldkriips, mille pikkus on toru laius korda √2 / 2. */
const MIRROR_TILT = 24;

/**
 * Häälestav joonis: laps aia taga, käes kahe peegliga toru.
 *
 * Joonis näitab ainult TEEKONDA (valgus tuleb aia tagant, läheb toru mööda alla
 * ja jõuab silma). Ühtegi nurka ta ei väida ega mõõda: hook ei tohi teooria
 * vastust ette öelda. Valgusjoon on katkendlik, sest ta on siin skeem, mitte
 * mõõdetud kiir.
 */
export function OverFenceFigure() {
  const topMirror = { x: TUBE.x + TUBE.width / 2, y: TUBE.top + 16 };
  const bottomMirror = { x: TUBE.x + TUBE.width / 2, y: TUBE.bottom - 22 };
  const eye = { x: TUBE.x + TUBE.width + 34, y: bottomMirror.y };

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${FENCE_VIEW.width} ${FENCE_VIEW.height}`}
        role="img"
        aria-label="Joonis: kõrge plankaed, mille taga on puu. Aia ees seisab laps ja hoiab käes püstist toru, mille mõlemas otsas on viltune peegel. Katkendlik valgusjoon tuleb aia tagant vasakult toru ülemisse otsa, langeb seal ülemisele peeglile, läheb toru mööda alla, langeb alumisele peeglile ja jõuab sealt lapse silma. Ülemine peegel on toru ülemises otsas, alumine peegel toru alumises otsas."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />

        {/* Maapind. */}
        <line
          x1={8}
          y1={FENCE_VIEW.height - 20}
          x2={FENCE_VIEW.width - 8}
          y2={FENCE_VIEW.height - 20}
          className="stroke-ink-soft"
          strokeWidth={2}
        />

        {/* Aia taga olev puu – see on see, mida laps näha tahab. */}
        <g className="fill-line stroke-ink-soft" strokeWidth={1}>
          <circle cx={44} cy={70} r={26} />
          <rect x={40} y={92} width={8} height={40} />
        </g>

        {/* Plankaed: kõrgem kui laps. */}
        <g className="fill-white stroke-ink" strokeWidth={1.5}>
          {[0, 1, 2, 3].map((index) => (
            <rect
              key={index}
              x={FENCE_X + index * 15}
              y={54}
              width={12}
              height={FENCE_VIEW.height - 74}
            />
          ))}
        </g>

        {/* Toru kahe peegliga. */}
        <rect
          x={TUBE.x}
          y={TUBE.top}
          width={TUBE.width}
          height={TUBE.bottom - TUBE.top}
          rx={5}
          className="fill-white stroke-ink"
          strokeWidth={2}
        />
        <g className="stroke-ink" strokeWidth={3.5} strokeLinecap="round">
          <line
            x1={topMirror.x - MIRROR_TILT / 2}
            y1={topMirror.y + MIRROR_TILT / 2}
            x2={topMirror.x + MIRROR_TILT / 2}
            y2={topMirror.y - MIRROR_TILT / 2}
          />
          <line
            x1={bottomMirror.x - MIRROR_TILT / 2}
            y1={bottomMirror.y + MIRROR_TILT / 2}
            x2={bottomMirror.x + MIRROR_TILT / 2}
            y2={bottomMirror.y - MIRROR_TILT / 2}
          />
        </g>

        {/* Valguse tee: aia tagant ülemisele peeglile, toru mööda alla, silma. */}
        <g
          className="fill-none stroke-brand"
          strokeWidth={2.5}
          strokeDasharray="8 5"
        >
          <path
            d={rayPath({ x: 30, y: topMirror.y - 8 }, topMirror, 0.55)}
            markerMid={`url(#${ARROW_LIGHT})`}
          />
          <path
            d={rayPath(topMirror, bottomMirror, 0.55)}
            markerMid={`url(#${ARROW_LIGHT})`}
          />
          <path
            d={rayPath(bottomMirror, eye, 0.6)}
            markerMid={`url(#${ARROW_LIGHT})`}
          />
        </g>

        {/* Laps: pea ja keha – tema silm on toru alumise otsa juures. */}
        <g className="fill-white stroke-ink" strokeWidth={1.5}>
          <circle cx={eye.x + 16} cy={eye.y} r={16} />
          <path
            d={`M ${eye.x + 2} ${eye.y + 22} L ${eye.x + 2} ${FENCE_VIEW.height - 20} M ${eye.x + 30} ${eye.y + 22} L ${eye.x + 30} ${FENCE_VIEW.height - 20}`}
            className="fill-none stroke-ink"
          />
        </g>
        <circle cx={eye.x + 8} cy={eye.y - 2} r={2.5} className="fill-ink" />

        {/* Sildid – joonis peab olema loetav ka ilma värvita. */}
        <text
          x={TUBE.x - 6}
          y={topMirror.y - 6}
          textAnchor="end"
          className="fill-ink"
          fontSize={11}
        >
          ülemine peegel
        </text>
        <text
          x={TUBE.x - 6}
          y={bottomMirror.y + 20}
          textAnchor="end"
          className="fill-ink"
          fontSize={11}
        >
          alumine peegel
        </text>
        <text x={10} y={26} className="fill-brand" fontSize={11} fontWeight={600}>
          valguse tee
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Kaks peeglit torus toovad pildi aia tagant alla silmani. Aiast üle
        vaatama ei pea.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// np-kaks-peeglit – teooria
// ---------------------------------------------------------------------------

const THEORY_VIEW = { width: 360, height: 260 };
const THEORY_VERTEX: Point = { x: 40, y: 224 };

/** Teooriajoonise seis: sama, mis simulatsiooni algseis (60°, 20°). */
const THEORY_MIRROR_DEG = 60;
const THEORY_INCIDENCE_DEG = 20;

/** Sissetuleva kiire pikkus (m) – ta peab ulatuma üle pöörde lõikepunkti. */
const THEORY_INCIDENT_LENGTH_M = 0.17;
/** Väljuva kiire pikkus pikslites. */
const THEORY_OUTGOING_LENGTH_PX = 150;

/** Peeglite joonisel olev pikkus: mõlemad lõpevad natuke pärast langemispunkti. */
const FIRST_MIRROR_RATIO = 1.35;
const SECOND_MIRROR_RATIO = 1.3;

/** Kaarte ja siltide kaugused: sisemine kaar α, välimine β – kaks arvu ei tohi kokku minna. */
const INNER_ARC = 26;
const INNER_LABEL = 36;
const OUTER_ARC = 42;
const OUTER_LABEL = 56;
const VERTEX_ARC = 42;
const VERTEX_LABEL = 58;
const DEVIATION_ARC = 46;
const DEVIATION_LABEL = 66;

/**
 * Teooriajoonis: kogu mooduli uudis ühel pildil.
 *
 * Mõlemal peeglil on ristsirge ja tema kahel pool kaks võrdset nurka (α = α ja
 * β = β) – peegeldumisseadus kehtib mõlemal peeglil eraldi ja kumbki peegel ei
 * tea teisest midagi. Tipu juures on peeglite nurk θ ja kiirte lõikepunktis
 * pööre, mis on täpselt kaks korda suurem.
 *
 * Pöörde kaar on SISSETULEVA JA VÄLJUVA KIIRE päris lõikepunktis, mitte
 * juurdejoonistatud pikenduse peal: θ = 60° juures need kaks kiirt lõikuvad
 * (lõikepunkt tuleb mudeli suundadest). Nii ei ole joonisel ühtegi joont, mida
 * päris valgus ei käi.
 */
export function TwoMirrorsFigure() {
  const path = traceCornerRay(
    THEORY_MIRROR_DEG,
    THEORY_INCIDENCE_DEG,
    FIRST_HIT_M,
  );
  const mirrors = mirrorDirections(THEORY_MIRROR_DEG);

  const firstHit = toScreen(THEORY_VERTEX, path.firstHitM);
  const secondHit = toScreen(THEORY_VERTEX, path.secondHitM);
  const incident = toScreenDirection(path.incidentDirection);
  const middle = toScreenDirection(path.middleDirection);
  const outgoing = toScreenDirection(path.outgoingDirection);

  const incidentStart = along(
    firstHit,
    opposite(incident),
    THEORY_INCIDENT_LENGTH_M * PX_PER_METRE,
  );
  const outgoingEnd = along(secondHit, outgoing, THEORY_OUTGOING_LENGTH_PX);

  // Ristsirged osutavad kiilu SISSE: peeglil 1 üles, peeglil 2 kiilu poole.
  const firstNormal: Point = { x: 0, y: -1 };
  const secondNormal: Point = { x: -mirrors.second.y, y: mirrors.second.x };

  // Pöörde kaar käib sinna, kus sissetulev ja väljuv kiir teineteist lõikavad.
  const crossing = intersection(firstHit, incident, secondHit, outgoing);

  const firstLabels = {
    incidence: along(
      firstHit,
      bisector(opposite(incident), firstNormal),
      INNER_LABEL,
    ),
    reflection: along(firstHit, bisector(firstNormal, middle), OUTER_LABEL),
  };
  const secondLabels = {
    incidence: along(
      secondHit,
      bisector(opposite(middle), secondNormal),
      INNER_LABEL,
    ),
    reflection: along(secondHit, bisector(secondNormal, outgoing), OUTER_LABEL),
  };
  const vertexLabel = along(
    THEORY_VERTEX,
    bisector(mirrors.first, mirrors.second),
    VERTEX_LABEL,
  );
  const deviationLabel = along(
    crossing,
    bisector(incident, outgoing),
    DEVIATION_LABEL,
  );

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${THEORY_VIEW.width} ${THEORY_VIEW.height}`}
        role="img"
        aria-label="Joonis: kaks tasast peeglit, mis kohtuvad vasakul all tipus. Peegel 1 läheb tipust paremale, peegel 2 tipust nurga all üles; mõlema tagakülg on viirutatud. Tipu juures on kaar sildiga theeta, peeglite nurk. Valguskiir tuleb ülevalt paremalt, langeb peeglile 1 punktis P1, peegeldub sealt üles peeglile 2 punkti P2 ja väljub sealt paremale. Mõlemas langemispunktis on katkendlik ristsirge ja tema kahel pool kaks võrdset nurka: peeglil 1 alfa ja alfa, peeglil 2 beeta ja beeta. Sissetulev ja väljuv kiir lõikuvad joonisel ja nende vahel on kaar sildiga pööre võrdub kaks korda theeta."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />

        {/* Kiil peeglite vahel on heledam – seal liigub valgus. */}
        <path
          d={`M ${THEORY_VERTEX.x} ${THEORY_VERTEX.y} L ${along(THEORY_VERTEX, mirrors.first, FIRST_HIT_M * FIRST_MIRROR_RATIO * PX_PER_METRE).x} ${THEORY_VERTEX.y} L ${along(THEORY_VERTEX, mirrors.second, FIRST_HIT_M * FIRST_MIRROR_RATIO * PX_PER_METRE).x} ${along(THEORY_VERTEX, mirrors.second, FIRST_HIT_M * FIRST_MIRROR_RATIO * PX_PER_METRE).y} Z`}
          className="fill-brand"
          fillOpacity={0.07}
        />

        <Mirror
          from={THEORY_VERTEX}
          direction={mirrors.first}
          length={FIRST_HIT_M * FIRST_MIRROR_RATIO * PX_PER_METRE}
          backSide={{ x: 0, y: 1 }}
        />
        <Mirror
          from={THEORY_VERTEX}
          direction={mirrors.second}
          length={
            Math.hypot(
              secondHit.x - THEORY_VERTEX.x,
              secondHit.y - THEORY_VERTEX.y,
            ) * SECOND_MIRROR_RATIO
          }
          backSide={opposite(secondNormal)}
        />

        {/* Peeglite nurk tipus. */}
        <path
          d={angleArc(THEORY_VERTEX, mirrors.first, mirrors.second, VERTEX_ARC)}
          className="fill-none stroke-ink"
          strokeWidth={1.5}
        />
        <text
          x={vertexLabel.x}
          y={vertexLabel.y}
          textAnchor="middle"
          className="fill-ink"
          fontSize={13}
          fontWeight={600}
        >
          θ
        </text>

        {/* Kolm lõiku: sisse, peeglite vahel, välja. Üks ja sama valgus. */}
        <g
          className="fill-none stroke-brand"
          strokeWidth={2.5}
          markerMid={`url(#${ARROW_LIGHT})`}
        >
          <path d={rayPath(incidentStart, firstHit, 0.45)} />
          <path d={rayPath(firstHit, secondHit, 0.5)} />
          <path d={rayPath(secondHit, outgoingEnd, 0.55)} />
        </g>

        <Normal at={firstHit} direction={firstNormal} length={54} />
        <Normal at={secondHit} direction={secondNormal} length={54} />

        {/* Peeglil 1: langemisnurk ja peegeldumisnurk ristsirge kahel pool. */}
        <g className="fill-none stroke-brand" strokeWidth={1.5}>
          <path
            d={angleArc(firstHit, opposite(incident), firstNormal, INNER_ARC)}
          />
          <path d={angleArc(firstHit, firstNormal, middle, OUTER_ARC)} />
          <path
            d={angleArc(secondHit, opposite(middle), secondNormal, INNER_ARC)}
          />
          <path d={angleArc(secondHit, secondNormal, outgoing, OUTER_ARC)} />
        </g>
        <g className="fill-brand" fontSize={13} fontWeight={600} textAnchor="middle">
          <text x={firstLabels.incidence.x} y={firstLabels.incidence.y}>
            α
          </text>
          <text x={firstLabels.reflection.x} y={firstLabels.reflection.y}>
            α
          </text>
          <text x={secondLabels.incidence.x} y={secondLabels.incidence.y}>
            β
          </text>
          <text x={secondLabels.reflection.x} y={secondLabels.reflection.y}>
            β
          </text>
        </g>

        <HitPoint at={firstHit} label="P₁" />
        <HitPoint at={secondHit} label="P₂" />

        {/* Pööre: sissetuleva ja väljuva kiire vaheline nurk. */}
        <path
          d={angleArc(crossing, incident, outgoing, DEVIATION_ARC)}
          className="fill-none stroke-info"
          strokeWidth={1.5}
        />
        <text
          x={deviationLabel.x}
          y={deviationLabel.y}
          textAnchor="middle"
          className="fill-info"
          fontSize={12}
          fontWeight={600}
        >
          pööre = 2 · θ
        </text>

        {/* Väited on kirjas ka SÕNADEGA – kaared üksi ei kanna infot
            (DISAINIJUHIS: värv ega kuju ei ole ainus info kandja). */}
        <text x={10} y={22} className="fill-ink" fontSize={12} fontWeight={600}>
          α + β = θ
        </text>
        <text x={10} y={40} className="fill-ink-soft" fontSize={11}>
          θ = peeglite nurk
        </text>
        <text
          x={THEORY_VIEW.width - 10}
          y={THEORY_VIEW.height - 10}
          textAnchor="end"
          className="fill-ink-soft"
          fontSize={11}
        >
          viirutatud pool on peegli tagakülg
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Mõlemal peeglil kehtib sama peegeldumisseadus: langemisnurk on võrdne
        peegeldumisnurgaga. Kaks langemisnurka annavad kokku peeglite nurga ja
        kogu pööre tuleb kaks korda suurem.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// np-kaks-peeglit – kaks erijuhtu (θ = 90° ja θ = 0°) lisapaneelina
// ---------------------------------------------------------------------------

const CASE_VIEW = { width: 360, height: 230 };
const CASE_PANEL_WIDTH = 165;
const CASE_PANEL_HEIGHT = 150;
const CASE_PANEL_TOP = 34;
const CASE_PANEL_LEFT = [5, 5 + CASE_PANEL_WIDTH + 20];

/** Täisnurkse juhu geomeetria: sama mudel, mis üldjuhul, ainult θ = 90°. */
const RIGHT_ANGLE_INCIDENCE_DEG = 30;
const RIGHT_ANGLE_FIRST_HIT_M = 0.05;
const RIGHT_ANGLE_SCALE = 500;
const RIGHT_ANGLE_VERTEX: Point = { x: 20, y: 130 };
const RIGHT_ANGLE_INCIDENT_LEN_PX = 45;
const RIGHT_ANGLE_OUTGOING_LEN_PX = 55;
const RIGHT_ANGLE_MIRROR1_RATIO = 1.35;
const RIGHT_ANGLE_MIRROR2_RATIO = 1.3;

/**
 * Täisnurkne erijuht: sama `traceCornerRay`, mis üldjoonisel, ainult θ = 90°
 * ja väiksem mõõtkava, et paneeli sisse mahtuda. Väljuv kiir tuleb geomeetriast
 * täpselt vastassuunaline sissetulevaga – seda ei kirjuta siin keegi käsitsi,
 * see on lihtsalt see, mida δ = 2θ = 180° annab.
 */
function RightAngleCase() {
  const path = traceCornerRay(90, RIGHT_ANGLE_INCIDENCE_DEG, RIGHT_ANGLE_FIRST_HIT_M);
  const mirrors = mirrorDirections(90);
  const vertex = RIGHT_ANGLE_VERTEX;

  const toScreenCase = (point: Vector2): Point => ({
    x: vertex.x + point.x * RIGHT_ANGLE_SCALE,
    y: vertex.y - point.y * RIGHT_ANGLE_SCALE,
  });

  const firstHit = toScreenCase(path.firstHitM);
  const secondHit = toScreenCase(path.secondHitM);
  const incident = toScreenDirection(path.incidentDirection);
  const outgoing = toScreenDirection(path.outgoingDirection);

  const incidentStart = along(
    firstHit,
    opposite(incident),
    RIGHT_ANGLE_INCIDENT_LEN_PX,
  );
  const outgoingEnd = along(secondHit, outgoing, RIGHT_ANGLE_OUTGOING_LEN_PX);

  const mirror1Length =
    RIGHT_ANGLE_FIRST_HIT_M * RIGHT_ANGLE_MIRROR1_RATIO * RIGHT_ANGLE_SCALE;
  const mirror2Length =
    Math.hypot(secondHit.x - vertex.x, secondHit.y - vertex.y) *
    RIGHT_ANGLE_MIRROR2_RATIO;

  return (
    <g>
      <Mirror
        from={vertex}
        direction={mirrors.first}
        length={mirror1Length}
        backSide={{ x: 0, y: 1 }}
      />
      <Mirror
        from={vertex}
        direction={mirrors.second}
        length={mirror2Length}
        backSide={{ x: -1, y: 0 }}
      />
      <path
        d={angleArc(vertex, mirrors.first, mirrors.second, 16)}
        className="fill-none stroke-ink"
        strokeWidth={1.5}
      />
      <g
        className="fill-none stroke-brand"
        strokeWidth={2.5}
        markerMid={`url(#${ARROW_LIGHT})`}
      >
        <path d={rayPath(incidentStart, firstHit, 0.4)} />
        <path d={rayPath(firstHit, secondHit, 0.5)} />
        <path d={rayPath(secondHit, outgoingEnd, 0.6)} />
      </g>
    </g>
  );
}

/** Paralleelse juhu geomeetria: kaks samasuunalist 45°-mudelit, käsitsi. */
const PARALLEL_HIT_TOP: Point = { x: 60, y: 40 };
const PARALLEL_HIT_BOTTOM: Point = { x: 60, y: 110 };
const PARALLEL_MIRROR_DIR: Point = { x: Math.SQRT1_2, y: Math.SQRT1_2 };
const PARALLEL_MIRROR_HALF_LEN = 15;

/**
 * Paralleelne erijuht (periskoop): θ = 0° ei ole nurkpeegli mudelile antav
 * sisend – ilma tiputa ei ole `traceCornerRay`-l midagi arvutada (model.ts
 * kommentaar `deviationDeg` juures). Geomeetria on siin seepärast käsitsi,
 * täpselt nagu hook-joonisel `OverFenceFigure`: peegeldumisseadus (45° peeglid,
 * täpselt sama nurk mõlemal) on ELEMENTAARNE geomeetria, mis ei vaja selle
 * mooduli tipu-põhist valemit. Mõlemad peeglid on TÄPSELT sama suunaga, mitte
 * silma järgi paralleelsed – see ongi θ = 0° päris tähendus.
 */
function ParallelCase() {
  const mirrorTopFrom = along(
    PARALLEL_HIT_TOP,
    opposite(PARALLEL_MIRROR_DIR),
    PARALLEL_MIRROR_HALF_LEN,
  );
  const mirrorBottomFrom = along(
    PARALLEL_HIT_BOTTOM,
    opposite(PARALLEL_MIRROR_DIR),
    PARALLEL_MIRROR_HALF_LEN,
  );
  const incomingStart = { x: 10, y: PARALLEL_HIT_TOP.y };
  const outgoingEnd = { x: 150, y: PARALLEL_HIT_BOTTOM.y };

  return (
    <g>
      <Mirror
        from={mirrorTopFrom}
        direction={PARALLEL_MIRROR_DIR}
        length={PARALLEL_MIRROR_HALF_LEN * 2}
        backSide={{ x: Math.SQRT1_2, y: -Math.SQRT1_2 }}
      />
      <Mirror
        from={mirrorBottomFrom}
        direction={PARALLEL_MIRROR_DIR}
        length={PARALLEL_MIRROR_HALF_LEN * 2}
        backSide={{ x: -Math.SQRT1_2, y: Math.SQRT1_2 }}
      />
      <g
        className="fill-none stroke-brand"
        strokeWidth={2.5}
        markerMid={`url(#${ARROW_LIGHT})`}
      >
        <path d={rayPath(incomingStart, PARALLEL_HIT_TOP, 0.5)} />
        <path d={rayPath(PARALLEL_HIT_TOP, PARALLEL_HIT_BOTTOM, 0.5)} />
        <path d={rayPath(PARALLEL_HIT_BOTTOM, outgoingEnd, 0.6)} />
      </g>
    </g>
  );
}

/** Paneeli raam, pealkiri ja allkiri – kaks ühesugust kasti kõrvuti. */
function CasePanel({
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
  const left = CASE_PANEL_LEFT[index];
  return (
    <g transform={`translate(${left} ${CASE_PANEL_TOP})`}>
      <rect
        x={0}
        y={0}
        width={CASE_PANEL_WIDTH}
        height={CASE_PANEL_HEIGHT}
        rx={10}
        className="fill-white stroke-line"
        strokeWidth={1.5}
      />
      <text
        x={CASE_PANEL_WIDTH / 2}
        y={-12}
        textAnchor="middle"
        className="fill-ink"
        fontSize={13}
        fontWeight={600}
      >
        {title}
      </text>
      {children}
      <text
        x={CASE_PANEL_WIDTH / 2}
        y={CASE_PANEL_HEIGHT + 20}
        textAnchor="middle"
        className="fill-ink-soft"
        fontSize={11}
      >
        {caption}
      </text>
    </g>
  );
}

/**
 * Kaks erijuhtu kõrvuti: täisnurkne nurkpeegel (θ = 90°, helkuri põhimõte) ja
 * paralleelsed peeglid (θ = 0°, periskoop). Teooriatekst ütleb mõlemat
 * sõnadega – see joonis näitab, MIKS: vasakul on sissetulev ja väljuv kiir
 * silmnähtavalt vastassuunalised, paremal silmnähtavalt paralleelsed ja ainult
 * nihkunud.
 */
export function SpecialCasesFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${CASE_VIEW.width} ${CASE_VIEW.height}`}
        role="img"
        aria-label="Joonis: kaks erijuhtu kõrvuti. Vasakul paneelil on peeglite nurk 90 kraadi: kiir tuleb paremalt ülevalt, peegeldub kahelt peeglilt ja väljub täpselt vastassuunas, kust ta tuli. Paremal paneelil on kaks paralleelset 45 kraadi kaldu peeglit üksteise all: kiir tuleb vasakult, peegeldub ülemiselt peeglilt alla, siis alumiselt peeglilt uuesti paremale ja väljub samas suunas, kust ta tuli, ainult allapoole nihkunult."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />
        <CasePanel index={0} title="θ = 90°" caption="pööre 180° – täpselt vastassuunas">
          <RightAngleCase />
        </CasePanel>
        <CasePanel index={1} title="θ = 0°" caption="pööre 0° – ainult nihe (periskoop)">
          <ParallelCase />
        </CasePanel>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Kaks erijuhtu samast valemist: täisnurkne nurkpeegel pöörab kiire alati
        täpselt tagasi, paralleelsed peeglid ei pööra üldse, ainult nihutavad.
      </figcaption>
    </figure>
  );
}

/** Üldjuhu joonis ja kaks erijuhtu koos, teooriasammu `theory-1` küljes. */
export function TwoMirrorsAndSpecialCasesFigure() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <TwoMirrorsFigure />
      <SpecialCasesFigure />
    </div>
  );
}

// ---------------------------------------------------------------------------
// np-loe-nurgad – harjutuse joonis (practice-3)
// ---------------------------------------------------------------------------

const READ_VIEW = { width: 360, height: 250 };
const READ_VERTEX: Point = { x: 40, y: 214 };

/** Harjutuse seis: peeglite nurk 70°, langemisnurk esimesel peeglil 25°. */
const READ_MIRROR_DEG = 70;
const READ_INCIDENCE_DEG = 25;
const READ_INCIDENT_LENGTH_M = 0.11;

/**
 * Harjutuse joonis: kaks nurka on kirjas, kolmas on küsimärgi taga.
 *
 * Väljuvat kiirt siin EI OLE ja see on tahtlik: küsimus käib langemisnurga
 * kohta teisel peeglil, seega tohib teise peegli juures olla täpselt üks kaar.
 * Teine kaar (peegeldumisnurk) tähendaks kaht küsimärki ja õpilane ei teaks,
 * kumba ta lugema peaks.
 *
 * Mõlemad langemispunktid ja kiire suunad tulevad mudelist – nurgad joonisel on
 * täpselt need arvud, mis tekstis on kirjas (70° ja 25°), ja küsimärgi taga on
 * täpselt see, mida mudel `secondIncidenceDeg`-ist annab.
 */
export function ReadAnglesFigure() {
  const path = traceCornerRay(READ_MIRROR_DEG, READ_INCIDENCE_DEG, FIRST_HIT_M);
  const mirrors = mirrorDirections(READ_MIRROR_DEG);

  const firstHit = toScreen(READ_VERTEX, path.firstHitM);
  const secondHit = toScreen(READ_VERTEX, path.secondHitM);
  const incident = toScreenDirection(path.incidentDirection);
  const middle = toScreenDirection(path.middleDirection);

  const incidentStart = along(
    firstHit,
    opposite(incident),
    READ_INCIDENT_LENGTH_M * PX_PER_METRE,
  );

  const firstNormal: Point = { x: 0, y: -1 };
  const secondNormal: Point = { x: -mirrors.second.y, y: mirrors.second.x };

  const incidenceLabel = along(
    firstHit,
    bisector(opposite(incident), firstNormal),
    INNER_LABEL + 8,
  );
  const questionLabel = along(
    secondHit,
    bisector(opposite(middle), secondNormal),
    INNER_LABEL + 6,
  );
  const vertexLabel = along(
    READ_VERTEX,
    bisector(mirrors.first, mirrors.second),
    VERTEX_LABEL + 6,
  );

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${READ_VIEW.width} ${READ_VIEW.height}`}
        role="img"
        aria-label="Joonis: kaks tasast peeglit, mis kohtuvad vasakul all tipus; peeglite nurk on märgitud kaarega ja arvuga 70 kraadi. Valguskiir tuleb ülevalt paremalt ja langeb peeglile 1 punktis P1, kus katkendlik ristsirge ja nurgakaar näitavad langemisnurka 25 kraadi. Sealt läheb kiir üles peeglile 2 punkti P2. Ka punktis P2 on katkendlik ristsirge ja nurgakaar, aga arvu asemel on seal küsimärk."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />

        <Mirror
          from={READ_VERTEX}
          direction={mirrors.first}
          length={FIRST_HIT_M * FIRST_MIRROR_RATIO * PX_PER_METRE}
          backSide={{ x: 0, y: 1 }}
        />
        <Mirror
          from={READ_VERTEX}
          direction={mirrors.second}
          length={
            Math.hypot(
              secondHit.x - READ_VERTEX.x,
              secondHit.y - READ_VERTEX.y,
            ) * SECOND_MIRROR_RATIO
          }
          backSide={opposite(secondNormal)}
        />

        <path
          d={angleArc(READ_VERTEX, mirrors.first, mirrors.second, VERTEX_ARC)}
          className="fill-none stroke-ink"
          strokeWidth={1.5}
        />
        <text
          x={vertexLabel.x}
          y={vertexLabel.y}
          textAnchor="middle"
          className="fill-ink"
          fontSize={13}
          fontWeight={600}
        >
          {READ_MIRROR_DEG}°
        </text>

        <g
          className="fill-none stroke-brand"
          strokeWidth={2.5}
          markerMid={`url(#${ARROW_LIGHT})`}
        >
          <path d={rayPath(incidentStart, firstHit, 0.45)} />
          <path d={rayPath(firstHit, secondHit, 0.5)} />
        </g>

        <Normal at={firstHit} direction={firstNormal} length={54} />
        <Normal at={secondHit} direction={secondNormal} length={54} />

        <g className="fill-none stroke-brand" strokeWidth={1.5}>
          <path
            d={angleArc(firstHit, opposite(incident), firstNormal, INNER_ARC)}
          />
          <path
            d={angleArc(secondHit, opposite(middle), secondNormal, INNER_ARC)}
          />
        </g>
        <text
          x={incidenceLabel.x}
          y={incidenceLabel.y}
          textAnchor="middle"
          className="fill-brand"
          fontSize={13}
          fontWeight={600}
        >
          {READ_INCIDENCE_DEG}°
        </text>
        <text
          x={questionLabel.x}
          y={questionLabel.y}
          textAnchor="middle"
          className="fill-brand"
          fontSize={15}
          fontWeight={700}
        >
          ?
        </text>

        <HitPoint at={firstHit} label="P₁" />
        <HitPoint at={secondHit} label="P₂" />

        <text
          x={READ_VIEW.width - 10}
          y={READ_VIEW.height - 10}
          textAnchor="end"
          className="fill-ink-soft"
          fontSize={11}
        >
          viirutatud pool on peegli tagakülg
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Peeglite nurk ja langemisnurk esimesel peeglil on joonisel kirjas.
        Küsimärgi kohal on langemisnurk teisel peeglil.
      </figcaption>
    </figure>
  );
}
