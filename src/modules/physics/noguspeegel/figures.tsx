import {
  SAFE_HEIGHT_RATIO,
  focalLength,
  mirrorDepth,
  reflectParallelRay,
} from "./model";

/**
 * Mooduli joonised (src/engine/figures.ts).
 *
 * Need on VAATED, täpselt nagu Simulation.tsx – aga kaks neist teevad
 * GEOMEETRILISE VÄITE („langemisnurk = peegeldumisnurk", „kiired lõikuvad ühes
 * punktis"), seega ei tohi nende kuju tulla käsitsi sobitatud Bézier'st.
 * Peegli kaar, kohtumispunkt ja teljelõige tulevad `model.ts`-ist (CLAUDE.md
 * reegel 1); joonis ise ainult skaleerib meetrid piksliteks. Nii ei saa joonis
 * ja simulatsioon kunagi eri füüsikat näidata.
 *
 * ÜHIKUD: mudel räägib meetrites, joonis pikslites. Ühik muutub ainult
 * skaleerimisel (`PX_PER_METRE`) – kõik mudelile antavad arvud on meetrites.
 * Mõõtkava on MÕLEMAL teljel sama, muidu ei oleks joonisel olevad nurgad enam
 * päris nurgad (ja α = β oleks silmale vale).
 *
 * SUUNAD: siin failis on kõik vektorid SVG-koordinaatides (y kasvab ALLA).
 * Mudel annab ainult arve (sügavus, teljelõige), mitte suundi, seega ei ole
 * siin ühtegi kohta, kus y-telge pööratakse – seda ei pea ükski rida mäletama.
 *
 * Hooki joonis (`np-taskulamp`) ei tohi vastust ette öelda: ta näitab ainult
 * seda, ET peegeldiga tuleb kitsas kiir. MIKS, seda ütlevad teooria ja
 * simulatsioon. Tema peegeldi ongi seepärast lihtne joon, mitte mudeli kaar –
 * ta ei väida ühtegi nurka ega kaugust.
 */

type Point = { x: number; y: number };

/** Nooleotsad. Ühed id-d kogu failis: korraga on ekraanil üks joonis. */
const ARROW_INCIDENT = "np-arrow-incident";
const ARROW_REFLECTED = "np-arrow-reflected";

function RayArrowDefs() {
  return (
    <defs>
      {/* `fill` on markeril otse küljes: marker ei päri värvi teda kasutavalt
          joonelt. */}
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

/** Ühikvektor punktist punkti – nurgakaarte ja viirutuse jaoks. */
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
 * Nurgakaar suunast suunani. `sweep` 1 = SVG-s positiivne suund ehk ekraanil
 * päripäeva – peatelje KOHAL olev kiir läheb ristsirge poole just nii.
 */
function angleArc(
  origin: Point,
  from: Point,
  to: Point,
  radius: number,
  sweep: 0 | 1,
): string {
  const start = along(origin, from, radius);
  const end = along(origin, to, radius);
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 ${sweep} ${end.x} ${end.y}`;
}

// ---------------------------------------------------------------------------
// Ühine peegligeomeetria (np-ristsirge ja np-kolm-kiirt)
// ---------------------------------------------------------------------------

/**
 * Joonise kera raadius (m) ja mõõtkava.
 *
 * Raadius on 1 m ainult sellepärast, et arvud oleksid loetavad: joonis ei
 * näita ühtegi ARVU, ainult kuju. Mudel nõuab meetreid, seega on ta meetrites.
 */
const RADIUS_M = 1;
const PX_PER_METRE = 200;

/**
 * Peegli poolkõrgus joonisel: 0,42 · R.
 *
 * Peegel on joonisel MEELEGA laiem kui kiirte kimp. Nii on kaar silmaga
 * nähtavalt nõgus (kerapinna sügavus on selle poolkõrguse juures 0,09 · R),
 * aga kiired ise jäävad turvavööndisse (`SAFE_HEIGHT_RATIO`), kus nad
 * koonduvad ühte punkti. Kaare võimendamine oleks vale teistpidi: siis
 * paistaks joonisel nurk, mida mudel ei anna.
 */
const MIRROR_HALF_HEIGHT_M = RADIUS_M * 0.42;

/** Kera keskpunkt C – peegli ees peateljel kaugusel R. */
function centrePoint(vertexX: number, axisY: number): Point {
  return { x: vertexX + RADIUS_M * PX_PER_METRE, y: axisY };
}

/** Peegli punkt kõrgusel h: sügavus tuleb mudelist, mitte kaarevalemist. */
function mirrorPoint(vertexX: number, axisY: number, heightM: number): Point {
  return {
    x: vertexX + mirrorDepth(RADIUS_M, heightM) * PX_PER_METRE,
    y: axisY - heightM * PX_PER_METRE,
  };
}

/** Mitmest tükist kaar kokku pannakse – 24 sammu on 360 px juures sujuv. */
const ARC_STEPS = 24;

/**
 * Peegli kaar murdjoonena, iga punkt mudeli `mirrorDepth`-ist.
 *
 * Bézier'ga tehtud kaar näeks välja peaaegu samasugune, aga tema kuju ei
 * tuleks füüsikast – ja siis ei saaks kaare peal olevad nurgad enam õiged
 * olla (sisu/MOODUL-noguspeegel.md „Füüsika": „kaar EI ole käsitsi kokku
 * pandud Bézier").
 */
function mirrorArcPath(vertexX: number, axisY: number): string {
  const points = Array.from({ length: ARC_STEPS * 2 + 1 }, (_, index) =>
    mirrorPoint(
      vertexX,
      axisY,
      MIRROR_HALF_HEIGHT_M * (index / ARC_STEPS - 1),
    ),
  );
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

/** Viirutus peegli TAGUMISEL poolel – kummal pool on läikiv pind. */
function MirrorArc({ vertexX, axisY }: { vertexX: number; axisY: number }) {
  const centre = centrePoint(vertexX, axisY);
  const hatchHeights = Array.from(
    { length: 11 },
    (_, index) => MIRROR_HALF_HEIGHT_M * (index / 5 - 1),
  );
  return (
    <>
      <path
        d={mirrorArcPath(vertexX, axisY)}
        className="fill-none stroke-ink"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <g className="stroke-ink-soft" strokeWidth={1.5} strokeLinecap="round">
        {hatchHeights.map((heightM) => {
          const point = mirrorPoint(vertexX, axisY, heightM);
          // Väljapoole = kera keskpunktist EEMALE. Nii kaldub iga kriips
          // täpselt sinna, kuhu peegli tagumine pool jääb.
          const outward = unitVector(centre, point);
          const end = along(point, outward, 9);
          return (
            <line
              key={heightM}
              x1={point.x}
              y1={point.y}
              x2={end.x}
              y2={end.y}
            />
          );
        })}
      </g>
    </>
  );
}

/** Peatelg katkendjoonena – ta ei ole kiir, vaid abijoon. */
function PrincipalAxis({
  axisY,
  left,
  right,
}: {
  axisY: number;
  left: number;
  right: number;
}) {
  return (
    <line
      x1={left}
      y1={axisY}
      x2={right}
      y2={axisY}
      className="stroke-ink-soft"
      strokeWidth={1.5}
      strokeDasharray="7 5"
    />
  );
}

// ---------------------------------------------------------------------------
// np-taskulamp – hook
// ---------------------------------------------------------------------------

const TORCH_VIEW = { width: 360, height: 200 };
const TORCH_FRAME = { width: 172, top: 14, height: 172 };

/** Paljas pirn: nooled igasse suunda, kõik lühikesed. */
const BARE_BULB: Point = { x: 90, y: 92 };
const BARE_RAY_COUNT = 12;
const BARE_RAY_LENGTH = 34;

/** Taskulamp: keha, nõgus peegeldi, pirn ja paralleelne kimp. */
const TORCH_BODY = { left: 206, right: 262, top: 62, bottom: 122 };
const TORCH_BULB: Point = { x: 238, y: 92 };
const TORCH_BEAM_YS = [70, 84, 100, 114];

/**
 * Häälestav joonis: sama pirn kaks korda – paljalt ja peegeldi sees.
 *
 * Joonis näitab ainult ERINEVUST (laiali vs. kitsas kiir). Peegeldi kuju on
 * siin lihtne kaar, mitte mudeli kerapind: hook ei tohi ühtegi nurka ega
 * kaugust väita, muidu ütleks ta teooria vastuse ette.
 */
export function TorchFigure() {
  const bareRays = Array.from({ length: BARE_RAY_COUNT }, (_, index) => {
    const angle = (index / BARE_RAY_COUNT) * 2 * Math.PI;
    return {
      key: index,
      x2: BARE_BULB.x + Math.cos(angle) * BARE_RAY_LENGTH,
      y2: BARE_BULB.y + Math.sin(angle) * BARE_RAY_LENGTH,
    };
  });

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${TORCH_VIEW.width} ${TORCH_VIEW.height}`}
        role="img"
        aria-label="Joonis kahest kaadrist. Vasakul on paljas pirn, millest lähevad lühikesed valgusnooled igasse suunda laiali. Paremal on sama pirn taskulambi sees: tema taga on läikiv nõgus peegeldi ja lambist väljub kitsas paralleelne kiirtekimp, mis ulatub joonise servast välja kümneid meetreid kaugele."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />

        {/* Kaks kaadrit – kaks olukorda peavad olema silmaga eristatavad. */}
        <g className="fill-white stroke-line" strokeWidth={1}>
          <rect
            x={4}
            y={TORCH_FRAME.top}
            width={TORCH_FRAME.width}
            height={TORCH_FRAME.height}
            rx={10}
          />
          <rect
            x={TORCH_VIEW.width - TORCH_FRAME.width - 4}
            y={TORCH_FRAME.top}
            width={TORCH_FRAME.width}
            height={TORCH_FRAME.height}
            rx={10}
          />
        </g>

        {/* Vasak kaader: paljas pirn. */}
        <g className="stroke-brand" strokeWidth={2} strokeLinecap="round">
          {bareRays.map((ray) => (
            <line
              key={ray.key}
              x1={BARE_BULB.x}
              y1={BARE_BULB.y}
              x2={ray.x2}
              y2={ray.y2}
            />
          ))}
        </g>
        <circle
          cx={BARE_BULB.x}
          cy={BARE_BULB.y}
          r={9}
          className="fill-teacher stroke-ink"
          strokeWidth={1.5}
        />
        <text
          x={90}
          y={158}
          textAnchor="middle"
          className="fill-ink"
          fontSize={12}
          fontWeight={600}
        >
          paljas pirn
        </text>
        <text x={90} y={176} textAnchor="middle" className="fill-ink-soft" fontSize={11}>
          valgus läheb igasse suunda
        </text>

        {/* Parem kaader: sama pirn peegeldi sees. */}
        <path
          d={`M ${TORCH_BODY.left + 16} ${TORCH_BODY.top + 6} Q ${TORCH_BODY.left - 2} ${TORCH_BULB.y} ${TORCH_BODY.left + 16} ${TORCH_BODY.bottom - 6}`}
          className="fill-none stroke-ink"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <rect
          x={TORCH_BODY.left}
          y={TORCH_BODY.top}
          width={TORCH_BODY.right - TORCH_BODY.left}
          height={TORCH_BODY.bottom - TORCH_BODY.top}
          rx={6}
          className="fill-none stroke-ink-soft"
          strokeWidth={1.5}
        />
        <circle
          cx={TORCH_BULB.x}
          cy={TORCH_BULB.y}
          r={7}
          className="fill-teacher stroke-ink"
          strokeWidth={1.5}
        />
        {/* Kitsas paralleelne kimp – jookseb kaadri servast välja. */}
        <g
          className="fill-none stroke-brand"
          strokeWidth={2}
          markerMid={`url(#${ARROW_INCIDENT})`}
        >
          {TORCH_BEAM_YS.map((y) => (
            <path
              key={y}
              d={rayPath(
                { x: TORCH_BODY.right - 4, y },
                { x: TORCH_VIEW.width - 6, y },
                0.55,
              )}
            />
          ))}
        </g>
        <text x={214} y={44} className="fill-ink" fontSize={11}>
          läikiv nõgus pind
        </text>
        <line
          x1={216}
          y1={48}
          x2={TORCH_BODY.left + 8}
          y2={TORCH_BODY.top + 22}
          className="stroke-ink-soft"
          strokeWidth={1}
        />
        <text
          x={TORCH_VIEW.width - 10}
          y={140}
          textAnchor="end"
          className="fill-ink"
          fontSize={12}
          fontWeight={600}
        >
          40 m kaugele
        </text>
        <text x={270} y={176} textAnchor="middle" className="fill-ink-soft" fontSize={11}>
          sama pirn, kitsas kiir
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Pirn on mõlemal pool sama. Erinevust teeb ainult läikiv nõgus peegeldi
        tema taga.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// np-ristsirge – teooria
// ---------------------------------------------------------------------------

const NORMAL_VIEW = { width: 360, height: 240 };
const NORMAL_VERTEX_X = 34;
const NORMAL_AXIS_Y = 116;

/**
 * Valitud kiire kõrgus TEOORIA joonisel: 0,36 · R.
 *
 * Rohkem kui turvavöönd (`SAFE_HEIGHT_RATIO`) lubab – ja see on siin õige,
 * sest see joonis ei väida, et kiired koonduvad ühte punkti. Ta väidab ainult
 * α = β ja seda, et ristsirge on raadiuse siht. Suurem nurk teeb mõlemad
 * kaared 360 px laiusel ekraanil loetavaks; koondumise väidab joonis
 * `np-kolm-kiirt`, kus kiired on turvavööndis.
 */
const NORMAL_RAY_HEIGHT_M = RADIUS_M * 0.36;

/** Kaare ja sildi kaugused langemispunktist: α seesmisel, β välimisel ringil. */
const INCIDENCE_ARC = 32;
const INCIDENCE_LABEL = 44;
const REFLECTION_ARC = 56;
const REFLECTION_LABEL = 70;

/**
 * Teooriajoonis: kogu mooduli uudis ühel pildil.
 *
 * Ristsirge = raadiuse siht, ja tänu sellele kehtib kõveral peeglil täpselt
 * seesama peegeldumisseadus mis tasapeeglil. Teooriajoonis TOHIB kõik välja
 * öelda – seal on see juba õpitav sisu.
 */
export function NormalFigure() {
  const centre = centrePoint(NORMAL_VERTEX_X, NORMAL_AXIS_Y);
  const hit = mirrorPoint(NORMAL_VERTEX_X, NORMAL_AXIS_Y, NORMAL_RAY_HEIGHT_M);
  const ray = reflectParallelRay(RADIUS_M, NORMAL_RAY_HEIGHT_M);
  const axisCross: Point = {
    x: NORMAL_VERTEX_X + ray.axisCrossM * PX_PER_METRE,
    y: NORMAL_AXIS_Y,
  };

  // Kolm suunda langemispunktist VÄLJA: sinnapoole, kust kiir tuli (peatelje
  // siht), ristsirge (= kera keskpunkti poole) ja peegeldunud kiir.
  const backAlongRay: Point = { x: 1, y: 0 };
  const normal = unitVector(hit, centre);
  const reflected = unitVector(hit, axisCross);

  const incidenceLabel = along(
    hit,
    bisector(backAlongRay, normal),
    INCIDENCE_LABEL,
  );
  const reflectionLabel = along(
    hit,
    bisector(normal, reflected),
    REFLECTION_LABEL,
  );

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${NORMAL_VIEW.width} ${NORMAL_VIEW.height}`}
        role="img"
        aria-label="Joonis: nõguspeegli kaar, katkendjoonega peatelg ja peateljel kera keskpunkt C. Peateljega paralleelne kiir kohtub peegliga punktis P. Punktist P läheb katkendjoon kera keskpunkti – see on selle punkti ristsirge ehk raadiuse siht. Langemisnurk α kiire ja ristsirge vahel on sama suur kui peegeldumisnurk β ristsirge ja peegeldunud kiire vahel. Peegeldunud kiir lõikab peatelge peegli ees."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />

        <PrincipalAxis
          axisY={NORMAL_AXIS_Y}
          left={NORMAL_VERTEX_X}
          right={NORMAL_VIEW.width - 8}
        />
        <MirrorArc vertexX={NORMAL_VERTEX_X} axisY={NORMAL_AXIS_Y} />

        {/* Ristsirge: kohtumispunktist kera keskpunkti. Katkendjoon, sest see
            ei ole valguskiir, vaid abijoon. */}
        <line
          x1={hit.x}
          y1={hit.y}
          x2={centre.x}
          y2={centre.y}
          className="stroke-ink"
          strokeWidth={1.5}
          strokeDasharray="6 5"
        />
        <circle cx={centre.x} cy={centre.y} r={4} className="fill-ink" />
        <text x={centre.x + 8} y={centre.y - 8} className="fill-ink" fontSize={12} fontWeight={600}>
          C
        </text>
        <text x={centre.x + 8} y={centre.y + 18} className="fill-ink-soft" fontSize={11}>
          kera keskpunkt
        </text>
        <text x={206} y={96} textAnchor="middle" className="fill-ink" fontSize={11}>
          ristsirge = raadius
        </text>

        {/* Langev kiir: paremalt, peateljega paralleelselt. */}
        <path
          d={rayPath({ x: NORMAL_VIEW.width - 8, y: hit.y }, hit, 0.45)}
          className="fill-none stroke-brand"
          strokeWidth={2.5}
          markerMid={`url(#${ARROW_INCIDENT})`}
        />
        {/* Peegeldunud kiir: kohtumispunktist peateljeni. */}
        <path
          d={rayPath(hit, axisCross, 0.6)}
          className="fill-none stroke-info"
          strokeWidth={2.5}
          markerMid={`url(#${ARROW_REFLECTED})`}
        />
        <circle cx={hit.x} cy={hit.y} r={3.5} className="fill-ink" />
        <text x={hit.x - 6} y={hit.y - 10} textAnchor="end" className="fill-ink" fontSize={12} fontWeight={600}>
          P
        </text>

        {/* Nurgakaared: α kiire ja ristsirge vahel, β ristsirge ja peegeldunud
            kiire vahel. Peatelje kohal käib mõlemad päripäeva. */}
        <path
          d={angleArc(hit, backAlongRay, normal, INCIDENCE_ARC, 1)}
          className="fill-none stroke-brand"
          strokeWidth={1.5}
        />
        <path
          d={angleArc(hit, normal, reflected, REFLECTION_ARC, 1)}
          className="fill-none stroke-info"
          strokeWidth={1.5}
        />
        <text
          x={incidenceLabel.x}
          y={incidenceLabel.y}
          textAnchor="middle"
          className="fill-brand"
          fontSize={13}
          fontWeight={600}
        >
          α
        </text>
        <text
          x={reflectionLabel.x}
          y={reflectionLabel.y}
          textAnchor="middle"
          className="fill-info"
          fontSize={13}
          fontWeight={600}
        >
          β
        </text>
        {/* Võrdus on kirjas SÕNADEGA ka joonisel – kaks kaart üksi ei kanna
            infot (DISAINIJUHIS: värv ega kuju ei ole ainus info kandja). */}
        <text x={150} y={150} className="fill-ink" fontSize={13} fontWeight={600}>
          α = β
        </text>
        <text
          x={NORMAL_VIEW.width - 8}
          y={NORMAL_AXIS_Y + 20}
          textAnchor="end"
          className="fill-ink-soft"
          fontSize={11}
        >
          peatelg
        </text>
        <text x={NORMAL_VERTEX_X + 6} y={NORMAL_VIEW.height - 8} className="fill-ink-soft" fontSize={11}>
          läikiv pind on kera seest poolt
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Ristsirge on kerapinnal iga punkti oma raadiuse siht – ja tema suhtes on
        langemisnurk α sama suur kui peegeldumisnurk β.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// np-kolm-kiirt – harjutuse joonis (practice-3)
// ---------------------------------------------------------------------------

const THREE_VIEW = { width: 360, height: 210 };
const THREE_VERTEX_X = 34;
const THREE_AXIS_Y = 108;

/**
 * Kolme kiire kõrgused – tuletatud turvavööndist, mitte valitud silma järgi.
 *
 * See joonis VÄIDAB, et kiired lõikuvad ühes punktis, seega peavad nad jääma
 * sinna, kus see väide kehtib: |h| ≤ `SAFE_HEIGHT_RATIO` · R hoiab kõik kolm
 * teljelõiget fookusest alla 3 % kaugusel ehk selle joonise mõõtkavas paari
 * piksli sees. Kui keegi tõstab siin kõrgusi käsitsi, ei jää väide enam ausaks
 * – seepärast tuleb arv mudeli konstandist.
 */
const THREE_RAY_HEIGHTS_M = [
  RADIUS_M * SAFE_HEIGHT_RATIO,
  RADIUS_M * SAFE_HEIGHT_RATIO * 0.5,
  -RADIUS_M * SAFE_HEIGHT_RATIO,
];

/** Peateljel märgitud punktid – kaugus peegli tipust, osa raadiusest. */
const POINT_A_RATIO = 0.12;
const POINT_C_RATIO = 0.8;

/**
 * Harjutuse joonis: kolm paralleelset kiirt ja kolm punkti peateljel.
 *
 * Küsimus on „milline punkt on fookus", seega EI OLE ükski punkt sildiga
 * „fookus" ega teistmoodi märgitud – kolm punkti on täpselt ühesugused ja
 * ainus vahe on nende asukoht. Silti või paksemat täppi tähendaks, et ülesanne
 * saab lahendatud joonist lugemata.
 */
export function ThreeRaysFigure() {
  // Punkt B on FOOKUS ehk R/2 – mudeli oma valem, mitte kolme teljelõike
  // keskmine. Kiirte lõiked jäävad temast selle mõõtkavas paari piksli sisse
  // (turvavöönd, vt THREE_RAY_HEIGHTS_M).
  const focusX = THREE_VERTEX_X + focalLength(RADIUS_M) * PX_PER_METRE;
  const points = [
    { id: "A", x: THREE_VERTEX_X + POINT_A_RATIO * RADIUS_M * PX_PER_METRE },
    { id: "B", x: focusX },
    { id: "C", x: THREE_VERTEX_X + POINT_C_RATIO * RADIUS_M * PX_PER_METRE },
  ];

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${THREE_VIEW.width} ${THREE_VIEW.height}`}
        role="img"
        aria-label="Joonis: nõguspeegli kaar ja katkendjoonega peatelg. Paremalt tuleb kolm peateljega paralleelset kiirt, mis peegelduvad peeglilt ja lõikuvad kõik peateljel ühes punktis. Peateljel on kolm ühesugust punkti: A peegli tipu lähedal, B seal, kus peegeldunud kiired lõikuvad, ja C kaugel peegli ees."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />

        <PrincipalAxis
          axisY={THREE_AXIS_Y}
          left={THREE_VERTEX_X}
          right={THREE_VIEW.width - 8}
        />
        <MirrorArc vertexX={THREE_VERTEX_X} axisY={THREE_AXIS_Y} />

        {THREE_RAY_HEIGHTS_M.map((heightM) => {
          const hit = mirrorPoint(THREE_VERTEX_X, THREE_AXIS_Y, heightM);
          const cross: Point = {
            x:
              THREE_VERTEX_X +
              reflectParallelRay(RADIUS_M, heightM).axisCrossM * PX_PER_METRE,
            y: THREE_AXIS_Y,
          };
          return (
            <g key={heightM}>
              <path
                d={rayPath({ x: THREE_VIEW.width - 8, y: hit.y }, hit, 0.4)}
                className="fill-none stroke-brand"
                strokeWidth={2}
                markerMid={`url(#${ARROW_INCIDENT})`}
              />
              <path
                d={rayPath(hit, cross, 0.6)}
                className="fill-none stroke-info"
                strokeWidth={2}
                markerMid={`url(#${ARROW_REFLECTED})`}
              />
            </g>
          );
        })}

        {/* Kolm punkti: ühesugune täpp, ühesugune silt, ainult koht erineb. */}
        {points.map((point) => (
          <g key={point.id}>
            <circle cx={point.x} cy={THREE_AXIS_Y} r={4} className="fill-ink" />
            <text
              x={point.x}
              y={THREE_AXIS_Y + 22}
              textAnchor="middle"
              className="fill-ink"
              fontSize={13}
              fontWeight={600}
            >
              {point.id}
            </text>
          </g>
        ))}

        <text
          x={THREE_VIEW.width - 8}
          y={THREE_AXIS_Y - 8}
          textAnchor="end"
          className="fill-ink-soft"
          fontSize={11}
        >
          peatelg
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Kolm peateljega paralleelset kiirt peegelduvad nõguspeeglilt. Peateljel
        on kolm punkti: A, B ja C.
      </figcaption>
    </figure>
  );
}
