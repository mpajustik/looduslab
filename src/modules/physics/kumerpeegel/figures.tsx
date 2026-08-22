import {
  SAFE_HEIGHT_RATIO,
  focalLength,
  mirrorBulge,
  reflectParallelRay,
} from "./model";

/**
 * Mooduli joonised (src/engine/figures.ts).
 *
 * Need on VAATED, täpselt nagu Simulation.tsx – aga kaks neist teevad
 * GEOMEETRILISE VÄITE („langemisnurk = peegeldumisnurk", „pikendused lõikuvad
 * ühes punktis"), seega ei tohi nende kuju tulla käsitsi sobitatud Bézier'st.
 * Peegli kaar, kohtumispunkt ja pikenduse teljelõige tulevad `model.ts`-ist
 * (CLAUDE.md reegel 1); joonis ise ainult skaleerib meetrid piksliteks. Nii ei
 * saa joonis ja simulatsioon kunagi eri füüsikat näidata.
 *
 * ÜHIKUD: mudel räägib meetrites, joonis pikslites. Ühik muutub ainult
 * skaleerimisel (`PX_PER_METRE`) – kõik mudelile antavad arvud on meetrites.
 * Mõõtkava on MÕLEMAL teljel sama, muidu ei oleks joonisel olevad nurgad enam
 * päris nurgad (ja α = β oleks silmale vale).
 *
 * SUUNAD: siin failis on kõik vektorid SVG-koordinaatides (y kasvab ALLA).
 * Kumerpeeglil on „peegli taga" VASAKUL: tipp kummub valguse poole ehk
 * paremale, kera keskpunkt C ja näiline fookus jäävad temast vasakule. Sama
 * kokkulepe on kõigil kolmel joonisel ja Simulation.tsx-il.
 *
 * PIKENDUSTEL EI OLE NOOLEOTSI. Nooleots tähendab liikuvat valgust; peegli taha
 * ei jõua ükski kiir. See ei ole stiiliküsimus, vaid kogu mooduli mõte
 * (väärarusaam `nailine-fookus-on-paris-fookus`).
 *
 * Hooki joonis (`kp-turvapeegel`) ei tohi vastust ette öelda: ta näitab ainult
 * seda, ET ümar peegel näeb laiemat ala. MIKS, seda ütlevad teooria ja
 * simulatsioon. Tema peegel ongi seepärast lihtne kaar, mitte mudeli kerapind –
 * ta ei väida ühtegi nurka ega kaugust.
 */

type Point = { x: number; y: number };

/** Nooleotsad. Ühed id-d kogu failis: korraga on ekraanil üks joonis. */
const ARROW_INCIDENT = "kp-arrow-incident";
const ARROW_REFLECTED = "kp-arrow-reflected";

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

/** Ühikvektor punktist punkti – nurgakaarte ja pikenduste jaoks. */
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

/**
 * Kui kaugele tohib `origin`-ist `direction` suunas minna, enne kui väljutakse
 * vaateraamist (`margin` px puhvriga) – väiksem kui `desiredDistance`, kui
 * see viiks joonise servast välja, muidu `desiredDistance` ise.
 *
 * Vajalik laiade kimpude jaoks (`WideBeamFigure`): äärmiste kiirte peegeldunud
 * tee lahkub ilma selleta vaateraamist ja nooleots (`markerMid`) jääb
 * nähtamatuks (CodeRabbiti leid).
 */
function clipDistance(
  origin: Point,
  direction: Point,
  desiredDistance: number,
  view: { width: number; height: number },
  margin: number,
): number {
  let maxDistance = desiredDistance;
  if (direction.x > 0) {
    maxDistance = Math.min(maxDistance, (view.width - margin - origin.x) / direction.x);
  } else if (direction.x < 0) {
    maxDistance = Math.min(maxDistance, (margin - origin.x) / direction.x);
  }
  if (direction.y > 0) {
    maxDistance = Math.min(maxDistance, (view.height - margin - origin.y) / direction.y);
  } else if (direction.y < 0) {
    maxDistance = Math.min(maxDistance, (margin - origin.y) / direction.y);
  }
  return Math.max(0, maxDistance);
}

/** Kahe suuna vaheline poolitaja – nurgasilt läheb kaare keskele. */
function bisector(a: Point, b: Point): Point {
  const x = a.x + b.x;
  const y = a.y + b.y;
  const length = Math.hypot(x, y);
  return { x: x / length, y: y / length };
}

/**
 * Nurgakaar suunast suunani. `sweep` 0 = SVG-s negatiivne suund ehk ekraanil
 * vastupäeva – peatelje KOHAL olev kiir pöördub kumerpeeglil ristsirge poole
 * just nii (nõguspeeglil oli ta vastupidine, sest seal on kera keskpunkt
 * teisel pool peeglit).
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
// Ühine peegligeomeetria (kp-ristsirge ja kp-kolm-kiirt)
// ---------------------------------------------------------------------------

/**
 * Joonise kera raadius (m) ja mõõtkava.
 *
 * Raadius on 1 m ainult sellepärast, et arvud oleksid loetavad: joonis ei näita
 * ühtegi ARVU, ainult kuju. Mudel nõuab meetreid, seega on ta meetrites.
 * Mõõtkava 150 px/m mahutab kera keskpunkti (R) ja näilise fookuse (R/2) mõlemad
 * peeglist vasakule, 360 px laiuse joonise sisse.
 */
const RADIUS_M = 1;
const PX_PER_METRE = 150;

/**
 * Peegli poolkõrgus joonisel: 0,42 · R.
 *
 * Peegel on joonisel MEELEGA laiem kui kiirte kimp. Nii on kaar silmaga
 * nähtavalt kumer (kerapinna kummumine on selle poolkõrguse juures 0,09 · R),
 * aga kiired ise jäävad turvavööndisse (`SAFE_HEIGHT_RATIO`), kus nende
 * pikendused lõikuvad ühes punktis. Kaare võimendamine oleks vale teistpidi:
 * siis paistaks joonisel nurk, mida mudel ei anna.
 */
const MIRROR_HALF_HEIGHT_M = RADIUS_M * 0.42;

/** Kera keskpunkt C – kumerpeeglil peegli TAGA (vasakul) kaugusel R. */
function centrePoint(vertexX: number, axisY: number): Point {
  return { x: vertexX - RADIUS_M * PX_PER_METRE, y: axisY };
}

/**
 * Peegli punkt kõrgusel h: kummumine tuleb mudelist, mitte kaarevalemist.
 *
 * Tipp on valgusele kõige lähem koht, seega nihkub iga teine punkt temast
 * TAHAPOOLE ehk joonisel vasakule.
 */
function mirrorPoint(vertexX: number, axisY: number, heightM: number): Point {
  return {
    x: vertexX - mirrorBulge(RADIUS_M, heightM) * PX_PER_METRE,
    y: axisY - heightM * PX_PER_METRE,
  };
}

/** Kus peegeldunud kiire pikendus peatelge lõikab – peegli taga (vasakul). */
function virtualCrossPoint(
  vertexX: number,
  axisY: number,
  heightM: number,
): Point {
  return {
    x:
      vertexX -
      reflectParallelRay(RADIUS_M, heightM).virtualCrossM * PX_PER_METRE,
    y: axisY,
  };
}

/** Mitmest tükist kaar kokku pannakse – 24 sammu on 360 px juures sujuv. */
const ARC_STEPS = 24;

/**
 * Peegli kaar murdjoonena, iga punkt mudeli `mirrorBulge`-ist.
 *
 * Bézier'ga tehtud kaar näeks välja peaaegu samasugune, aga tema kuju ei tuleks
 * füüsikast – ja siis ei saaks kaare peal olevad nurgad enam õiged olla
 * (sisu/MOODUL-kumerpeegel.md „Füüsika": „kaar EI ole käsitsi kokku pandud
 * Bézier").
 */
function mirrorArcPath(vertexX: number, axisY: number): string {
  const points = Array.from({ length: ARC_STEPS * 2 + 1 }, (_, index) =>
    mirrorPoint(vertexX, axisY, MIRROR_HALF_HEIGHT_M * (index / ARC_STEPS - 1)),
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
          // Kumerpeeglil on läikiv pind kera VÄLIMISEL küljel, seega jääb
          // tagumine pool kera keskpunkti poole. Iga kriips kaldub sinnapoole.
          const inward = unitVector(point, centre);
          const end = along(point, inward, 9);
          return (
            <line key={heightM} x1={point.x} y1={point.y} x2={end.x} y2={end.y} />
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
// kp-turvapeegel – hook
// ---------------------------------------------------------------------------

const SHOP_VIEW = { width: 360, height: 210 };
const SHOP_FRAME = { width: 172, top: 12, height: 186 };

/** Kaks kaadrit: sama laiusega peegel, kaks eri vaatevälja. */
const FLAT_CENTRE_X = 90;
const CONVEX_CENTRE_X = 270;
const MIRROR_Y = 46;
const MIRROR_HALF_WIDTH = 22;
const FLOOR_Y = 168;

/** Riiulid vahekäigu ääres – kolm ühesugust kasti mõlemas kaadris. */
const SHELF_OFFSETS = [-74, 0, 74];
const SHELF = { width: 46, height: 18 };

/** Vaatevälja lehviku poollaius põrandal: kitsas vs. lai. */
const FLAT_FAN_HALF_WIDTH = 26;
const CONVEX_FAN_HALF_WIDTH = 84;

function ShelfRow({ centreX }: { centreX: number }) {
  return (
    <g className="fill-line stroke-ink-soft" strokeWidth={1}>
      {SHELF_OFFSETS.map((offset) => (
        <rect
          key={offset}
          x={centreX + offset - SHELF.width / 2}
          y={FLOOR_Y}
          width={SHELF.width}
          height={SHELF.height}
          rx={3}
        />
      ))}
    </g>
  );
}

/** Vaateväli lehvikuna peeglist põrandani. */
function ViewFan({ centreX, halfWidth }: { centreX: number; halfWidth: number }) {
  return (
    <>
      <path
        d={`M ${centreX} ${MIRROR_Y} L ${centreX - halfWidth} ${FLOOR_Y + SHELF.height} L ${centreX + halfWidth} ${FLOOR_Y + SHELF.height} Z`}
        className="fill-brand"
        fillOpacity={0.12}
      />
      <g className="stroke-brand" strokeWidth={1.5} strokeDasharray="6 4">
        <line
          x1={centreX}
          y1={MIRROR_Y}
          x2={centreX - halfWidth}
          y2={FLOOR_Y + SHELF.height}
        />
        <line
          x1={centreX}
          y1={MIRROR_Y}
          x2={centreX + halfWidth}
          y2={FLOOR_Y + SHELF.height}
        />
      </g>
    </>
  );
}

/**
 * Häälestav joonis: sama laiusega peegel kaks korda – tasane ja kumer.
 *
 * Joonis näitab ainult ERINEVUST (kitsas vs. lai vaateväli). Peegli kuju on
 * siin lihtne kaar, mitte mudeli kerapind: hook ei tohi ühtegi nurka ega
 * kaugust väita, muidu ütleks ta teooria vastuse ette.
 */
export function ShopMirrorFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${SHOP_VIEW.width} ${SHOP_VIEW.height}`}
        role="img"
        aria-label="Joonis kahest kaadrist, vahekäik ülalt vaadatuna. Mõlemas kaadris on kolm ühesugust riiulit ja ülal sama laiusega peegel. Vasakul on tasane peegel: katkendlikud jooned piiravad kitsa ala, kuhu peegel näeb, ja sinna jääb ainult keskmine riiul. Paremal on sama laiusega kumer peegel: tema vaatevälja lehvik on palju laiem ja katab kõik kolm riiulit ehk terve vahekäigu."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Kaks kaadrit – kaks olukorda peavad olema silmaga eristatavad. */}
        <g className="fill-white stroke-line" strokeWidth={1}>
          <rect
            x={4}
            y={SHOP_FRAME.top}
            width={SHOP_FRAME.width}
            height={SHOP_FRAME.height}
            rx={10}
          />
          <rect
            x={SHOP_VIEW.width - SHOP_FRAME.width - 4}
            y={SHOP_FRAME.top}
            width={SHOP_FRAME.width}
            height={SHOP_FRAME.height}
            rx={10}
          />
        </g>

        {/* Vasak kaader: tasapeegel, kitsas vaateväli. */}
        <ViewFan centreX={FLAT_CENTRE_X} halfWidth={FLAT_FAN_HALF_WIDTH} />
        <ShelfRow centreX={FLAT_CENTRE_X} />
        <line
          x1={FLAT_CENTRE_X - MIRROR_HALF_WIDTH}
          y1={MIRROR_Y}
          x2={FLAT_CENTRE_X + MIRROR_HALF_WIDTH}
          y2={MIRROR_Y}
          className="stroke-ink"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <text
          x={FLAT_CENTRE_X}
          y={36}
          textAnchor="middle"
          className="fill-ink"
          fontSize={12}
          fontWeight={600}
        >
          tasapeegel
        </text>
        <text
          x={FLAT_CENTRE_X}
          y={SHOP_VIEW.height - 8}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={11}
        >
          sama suur peegel
        </text>

        {/* Parem kaader: kumerpeegel, lai vaateväli. */}
        <ViewFan centreX={CONVEX_CENTRE_X} halfWidth={CONVEX_FAN_HALF_WIDTH} />
        <ShelfRow centreX={CONVEX_CENTRE_X} />
        <path
          d={`M ${CONVEX_CENTRE_X - MIRROR_HALF_WIDTH} ${MIRROR_Y - 5} Q ${CONVEX_CENTRE_X} ${MIRROR_Y + 9} ${CONVEX_CENTRE_X + MIRROR_HALF_WIDTH} ${MIRROR_Y - 5}`}
          className="fill-none stroke-ink"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <text
          x={CONVEX_CENTRE_X}
          y={32}
          textAnchor="middle"
          className="fill-ink"
          fontSize={12}
          fontWeight={600}
        >
          kumerpeegel
        </text>
        <text
          x={CONVEX_CENTRE_X}
          y={SHOP_VIEW.height - 8}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={11}
        >
          sama suur peegel
        </text>

        {/* Väide on kirjas ka SÕNADEGA: lehvik üksi ei kanna infot
            (DISAINIJUHIS: värv ega kuju ei ole ainus info kandja). */}
        <text
          x={FLAT_CENTRE_X}
          y={FLOOR_Y - 8}
          textAnchor="middle"
          className="fill-ink"
          fontSize={11}
        >
          näeb üht riiulit
        </text>
        <text
          x={CONVEX_CENTRE_X}
          y={FLOOR_Y - 8}
          textAnchor="middle"
          className="fill-ink"
          fontSize={11}
        >
          näeb tervet vahekäiku
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Peegel on mõlemal pool sama lai. Erinevust teeb ainult see, et parempoolne
        on kumer.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// kp-ristsirge – teooria
// ---------------------------------------------------------------------------

const NORMAL_VIEW = { width: 360, height: 230 };
const NORMAL_VERTEX_X = 212;
const NORMAL_AXIS_Y = 146;

/**
 * Valitud kiire kõrgus TEOORIA joonisel: 0,3 · R.
 *
 * Rohkem kui turvavöönd (`SAFE_HEIGHT_RATIO`) lubab – ja see on siin õige, sest
 * see joonis ei väida, et pikendused lõikuvad ühes punktis. Ta väidab ainult
 * α = β ja seda, et ristsirge on raadiuse siht. Suurem nurk teeb mõlemad kaared
 * 360 px laiusel ekraanil loetavaks; lõikumise väidab joonis `kp-kolm-kiirt`,
 * kus kiired on turvavööndis.
 */
const NORMAL_RAY_HEIGHT_M = RADIUS_M * 0.3;

/** Peegeldunud kiire pikkus joonisel – ta jookseks muidu kaadrist välja. */
const REFLECTED_LENGTH = 118;

/** Kaare ja sildi kaugused langemispunktist: α seesmisel, β välimisel ringil. */
const INCIDENCE_ARC = 30;
const INCIDENCE_LABEL = 43;
const REFLECTION_ARC = 52;
const REFLECTION_LABEL = 67;

/**
 * Teooriajoonis: kogu mooduli uudis ühel pildil.
 *
 * Ristsirge on raadiuse siht ja läheb peegli TAHA kera keskpunkti; tänu sellele
 * kehtib kumeral peeglil täpselt seesama peegeldumisseadus mis tasapeeglil.
 * Peegeldunud kiir läheb teljest eemale ja ainult tema katkendlik pikendus
 * jõuab peatelje juurde tagasi – näilisse fookusesse. Teooriajoonis TOHIB kõik
 * välja öelda, seal on see juba õpitav sisu.
 */
export function NormalFigure() {
  const centre = centrePoint(NORMAL_VERTEX_X, NORMAL_AXIS_Y);
  const hit = mirrorPoint(NORMAL_VERTEX_X, NORMAL_AXIS_Y, NORMAL_RAY_HEIGHT_M);
  const cross = virtualCrossPoint(
    NORMAL_VERTEX_X,
    NORMAL_AXIS_Y,
    NORMAL_RAY_HEIGHT_M,
  );

  // Kolm suunda langemispunktist VÄLJA: sinnapoole, kust kiir tuli (peatelje
  // siht), ristsirge peeglist EEMALE (kera keskpunktist eemale, sest läikiv
  // pind on kera välimisel küljel) ja peegeldunud kiir. Peegeldunud kiire suund
  // tuleb pikenduse teljelõikest – nii ei arvuta joonis ühtegi nurka ise.
  const backAlongRay: Point = { x: 1, y: 0 };
  const normal = unitVector(centre, hit);
  const reflected = unitVector(cross, hit);
  const reflectedEnd = along(hit, reflected, REFLECTED_LENGTH);

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
        aria-label="Joonis: kumerpeegli kaar, katkendjoonega peatelg ja peateljel peegli taga kera keskpunkt C. Peateljega paralleelne kiir tuleb paremalt ja kohtub peegliga punktis P. Punktist P läheb katkendjoon läbi peegli kera keskpunkti – see on selle punkti ristsirge ehk raadiuse siht. Langemisnurk α kiire ja ristsirge vahel on sama suur kui peegeldumisnurk β ristsirge ja peegeldunud kiire vahel. Peegeldunud kiir läheb peateljest eemale; ainult tema katkendlik pikendus jõuab peegli taga peateljeni, näilisse fookusesse."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />

        <PrincipalAxis
          axisY={NORMAL_AXIS_Y}
          left={8}
          right={NORMAL_VIEW.width - 8}
        />
        <MirrorArc vertexX={NORMAL_VERTEX_X} axisY={NORMAL_AXIS_Y} />

        {/* Ristsirge: kohtumispunktist läbi peegli kera keskpunkti.
            Katkendjoon, sest see ei ole valguskiir, vaid abijoon. */}
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
        <text
          x={centre.x}
          y={centre.y - 10}
          textAnchor="middle"
          className="fill-ink"
          fontSize={12}
          fontWeight={600}
        >
          C
        </text>
        <text
          x={centre.x - 6}
          y={centre.y + 20}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={11}
        >
          kera keskpunkt
        </text>
        <text x={122} y={104} className="fill-ink" fontSize={11}>
          ristsirge = raadius
        </text>

        {/* Langev kiir: paremalt, peateljega paralleelselt. */}
        <path
          d={rayPath({ x: NORMAL_VIEW.width - 8, y: hit.y }, hit, 0.45)}
          className="fill-none stroke-brand"
          strokeWidth={2.5}
          markerMid={`url(#${ARROW_INCIDENT})`}
        />
        {/* Peegeldunud kiir: kohtumispunktist teljest EEMALE. */}
        <path
          d={rayPath(hit, reflectedEnd, 0.6)}
          className="fill-none stroke-info"
          strokeWidth={2.5}
          markerMid={`url(#${ARROW_REFLECTED})`}
        />
        {/* Pikendus: sama kiir tagurpidi, peegli taha. NOOLEOTSA EI OLE –
            valgus siia ei liigu. */}
        <line
          x1={hit.x}
          y1={hit.y}
          x2={cross.x}
          y2={cross.y}
          className="stroke-info"
          strokeWidth={1.5}
          strokeDasharray="6 5"
        />
        <circle cx={cross.x} cy={cross.y} r={4} className="fill-info" />
        <text
          x={cross.x}
          y={cross.y + 20}
          textAnchor="middle"
          className="fill-info"
          fontSize={11}
          fontWeight={600}
        >
          näiline fookus
        </text>
        <circle cx={hit.x} cy={hit.y} r={3.5} className="fill-ink" />
        <text
          x={hit.x + 2}
          y={hit.y - 10}
          className="fill-ink"
          fontSize={12}
          fontWeight={600}
        >
          P
        </text>

        {/* Nurgakaared: α kiire ja ristsirge vahel, β ristsirge ja peegeldunud
            kiire vahel. Peatelje kohal käivad mõlemad vastupäeva. */}
        <path
          d={angleArc(hit, backAlongRay, normal, INCIDENCE_ARC, 0)}
          className="fill-none stroke-brand"
          strokeWidth={1.5}
        />
        <path
          d={angleArc(hit, normal, reflected, REFLECTION_ARC, 0)}
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
        <text
          x={NORMAL_VIEW.width - 8}
          y={64}
          textAnchor="end"
          className="fill-ink"
          fontSize={13}
          fontWeight={600}
        >
          α = β
        </text>
        <text
          x={NORMAL_VIEW.width - 8}
          y={NORMAL_AXIS_Y + 18}
          textAnchor="end"
          className="fill-ink-soft"
          fontSize={11}
        >
          peatelg
        </text>
        <text x={10} y={NORMAL_VIEW.height - 10} className="fill-ink-soft" fontSize={11}>
          peegli tagune – siin valgust ei ole
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Ristsirge on kerapinnal iga punkti oma raadiuse siht – kumerpeeglil läheb
        ta peegli taha. Tema suhtes on langemisnurk α sama suur kui
        peegeldumisnurk β.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// kp-ristsirge – teooria (terve kimp, mitte üks kiir)
// ---------------------------------------------------------------------------

const WIDE_VIEW = { width: 360, height: 210 };
const WIDE_VERTEX_X = 236;
const WIDE_AXIS_Y = 108;
const WIDE_REFLECTED_LENGTH = 150;
/** Kiirte arv üle kogu peegli laiuse – paaritu, et üks kiir jääks peateljele. */
const WIDE_RAY_COUNT = 7;

/**
 * Kimbu kõrgused peaaegu kogu peegli poolkõrguse ulatuses (0,85 · poolkõrgus).
 *
 * `NormalFigure` ja `ThreeRaysFigure` hoiavad kiired teadlikult turvavööndis
 * (`SAFE_HEIGHT_RATIO`), et pikenduste lõikepunkt näeks välja ÜKS punkt. Siin
 * ei joonistata pikendusi ega väideta lõikumist – ainult SEDA, et kogu kimp
 * peegeldub laiali, mitte üks kiir –, seega tohib kõrgus ulatuda üle
 * turvavööndi, ikka mudeli enda lubatud vahemikku (`MAX_RAY_HEIGHT_RATIO`).
 */
const WIDE_RAY_HEIGHTS_M = Array.from({ length: WIDE_RAY_COUNT }, (_, index) => {
  const t = index / (WIDE_RAY_COUNT - 1) - 0.5;
  return t * 2 * MIRROR_HALF_HEIGHT_M * 0.85;
});

/**
 * „Kogu peegel, mitte üks kiir": lai paralleelne kimp hajumas.
 *
 * `NormalFigure` seletab MEHHANISMI (üks kiir, α = β, näiline fookus) – aga
 * kumerpeegli enda IDEE on, et see kehtib KOGU peegli kohta korraga ja tulemus
 * on kimp, mis läheb laiali, mitte koondub. Ilma selle joonise TERVIKPILDITA
 * jääb „hajutav peegel" ainult sõnaks.
 *
 * Pikendusi siin TEADLIKULT ei ole (erinevalt `NormalFigure`-ist ja
 * `ThreeRaysFigure`-ist): see joonis ei väida midagi näilise fookuse kohta,
 * ainult seda, et kiired lähevad üksteisest eemale.
 */
export function WideBeamFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${WIDE_VIEW.width} ${WIDE_VIEW.height}`}
        role="img"
        aria-label="Joonis: kumerpeegli kaar üle kogu oma laiuse ja katkendjoonega peatelg. Seitse paralleelset kiirt tuleb paremalt üle kogu peegli kõrguse ja peegelduvad kõik laiali – iga kiir läheb pärast peegeldumist üksteisest eemale, mitte kokku."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />

        <PrincipalAxis axisY={WIDE_AXIS_Y} left={8} right={WIDE_VIEW.width - 8} />
        <MirrorArc vertexX={WIDE_VERTEX_X} axisY={WIDE_AXIS_Y} />

        {WIDE_RAY_HEIGHTS_M.map((heightM) => {
          const hit = mirrorPoint(WIDE_VERTEX_X, WIDE_AXIS_Y, heightM);
          const cross = virtualCrossPoint(WIDE_VERTEX_X, WIDE_AXIS_Y, heightM);
          const reflectedDirection = unitVector(cross, hit);
          const reflectedEnd = along(
            hit,
            reflectedDirection,
            clipDistance(hit, reflectedDirection, WIDE_REFLECTED_LENGTH, WIDE_VIEW, 8),
          );
          return (
            <g key={heightM}>
              <path
                d={rayPath({ x: WIDE_VIEW.width - 8, y: hit.y }, hit, 0.4)}
                className="fill-none stroke-brand"
                strokeWidth={2}
                markerMid={`url(#${ARROW_INCIDENT})`}
              />
              <path
                d={rayPath(hit, reflectedEnd, 0.55)}
                className="fill-none stroke-info"
                strokeWidth={2}
                markerMid={`url(#${ARROW_REFLECTED})`}
              />
            </g>
          );
        })}

        <text
          x={WIDE_VIEW.width - 8}
          y={WIDE_AXIS_Y - 10}
          textAnchor="end"
          className="fill-ink-soft"
          fontSize={11}
        >
          peatelg
        </text>
        <text
          x={WIDE_VIEW.width / 2}
          y={WIDE_VIEW.height - 8}
          textAnchor="middle"
          className="fill-ink"
          fontSize={11}
          fontWeight={600}
        >
          terve kimp läheb laiali – hajutav peegel
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Iga kiir peegeldub omal kohal sama seaduse järgi, aga koos moodustavad
        nad laiali mineva kimbu – seepärast on kumerpeegel HAJUTAV peegel.
      </figcaption>
    </figure>
  );
}

/**
 * Theory-1 juurde: mehhanismi joonis (`NormalFigure`, üks kiir) ja selle all
 * tervikpilt (`WideBeamFigure`, terve kimp) – kaks eri suurusjärku samast
 * teooriatekstist ühe joonisena, moodul jääb 6 sammu juurde, teist
 * theory-sammu ei lisata (sama muster mis mujal P1-s).
 */
export function NormalAndWideBeamFigure() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <NormalFigure />
      <WideBeamFigure />
    </div>
  );
}

// ---------------------------------------------------------------------------
// kp-kolm-kiirt – harjutuse joonis (practice-3)
// ---------------------------------------------------------------------------

const THREE_VIEW = { width: 360, height: 210 };
const THREE_VERTEX_X = 236;
const THREE_AXIS_Y = 108;

/** Peegeldunud kiire pikkus joonisel – kaadri sisse jääv tükk. */
const THREE_REFLECTED_LENGTH = 106;

/**
 * Kolme kiire kõrgused – tuletatud turvavööndist, mitte valitud silma järgi.
 *
 * See joonis VÄIDAB, et pikendused lõikuvad ühes punktis, seega peavad kiired
 * jääma sinna, kus see väide kehtib: |h| ≤ `SAFE_HEIGHT_RATIO` · R hoiab kõik
 * kolm teljelõiget näilisest fookusest alla 3 % kaugusel ehk selle joonise
 * mõõtkavas paari piksli sees. Kui keegi tõstab siin kõrgusi käsitsi, ei jää
 * väide enam ausaks – seepärast tuleb arv mudeli konstandist.
 */
const THREE_RAY_HEIGHTS_M = [
  RADIUS_M * SAFE_HEIGHT_RATIO,
  RADIUS_M * SAFE_HEIGHT_RATIO * 0.5,
  -RADIUS_M * SAFE_HEIGHT_RATIO,
];

/** Punkt A on peegli EES – seal, kus paralleelsed kiired peeglile jõuavad. */
const POINT_A_RATIO = 0.14;

/**
 * Harjutuse joonis: kolm paralleelset kiirt ja kolm punkti peateljel.
 *
 * Küsimus on „milline punkt on näiline fookus", seega EI OLE ükski punkt sildiga
 * „fookus" ega teistmoodi märgitud – kolm punkti on täpselt ühesugused ja ainus
 * vahe on nende asukoht. Silt või paksem täpp tähendaks, et ülesanne saab
 * lahendatud joonist lugemata.
 */
export function ThreeRaysFigure() {
  // Punkt B on NÄILINE FOOKUS ehk R/2 – mudeli oma valem, mitte kolme
  // teljelõike keskmine. Pikenduste lõiked jäävad temast selle mõõtkavas paari
  // piksli sisse (turvavöönd, vt THREE_RAY_HEIGHTS_M).
  const points = [
    { id: "A", x: THREE_VERTEX_X + POINT_A_RATIO * RADIUS_M * PX_PER_METRE },
    { id: "B", x: THREE_VERTEX_X - focalLength(RADIUS_M) * PX_PER_METRE },
    { id: "C", x: centrePoint(THREE_VERTEX_X, THREE_AXIS_Y).x },
  ];

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${THREE_VIEW.width} ${THREE_VIEW.height}`}
        role="img"
        aria-label="Joonis: kumerpeegli kaar ja katkendjoonega peatelg. Paremalt tuleb kolm peateljega paralleelset kiirt, mis peegelduvad peeglilt laiali – nad lähevad üksteisest eemale. Nende katkendlikud pikendused jätkuvad peegli taha ja lõikuvad seal kõik ühes punktis peateljel. Peateljel on kolm ühesugust punkti: A peegli ees, B peegli taga seal, kus pikendused lõikuvad, ja C peegli taga kaugemal."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />

        <PrincipalAxis
          axisY={THREE_AXIS_Y}
          left={8}
          right={THREE_VIEW.width - 8}
        />
        <MirrorArc vertexX={THREE_VERTEX_X} axisY={THREE_AXIS_Y} />

        {THREE_RAY_HEIGHTS_M.map((heightM) => {
          const hit = mirrorPoint(THREE_VERTEX_X, THREE_AXIS_Y, heightM);
          const cross = virtualCrossPoint(THREE_VERTEX_X, THREE_AXIS_Y, heightM);
          const reflectedEnd = along(
            hit,
            unitVector(cross, hit),
            THREE_REFLECTED_LENGTH,
          );
          return (
            <g key={heightM}>
              <path
                d={rayPath({ x: THREE_VIEW.width - 8, y: hit.y }, hit, 0.4)}
                className="fill-none stroke-brand"
                strokeWidth={2}
                markerMid={`url(#${ARROW_INCIDENT})`}
              />
              <path
                d={rayPath(hit, reflectedEnd, 0.6)}
                className="fill-none stroke-info"
                strokeWidth={2}
                markerMid={`url(#${ARROW_REFLECTED})`}
              />
              {/* Pikendus peegli taha – katkendlik ja ilma nooleotsata. */}
              <line
                x1={hit.x}
                y1={hit.y}
                x2={cross.x}
                y2={cross.y}
                className="stroke-info"
                strokeWidth={1.5}
                strokeDasharray="6 5"
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
          y={THREE_AXIS_Y - 10}
          textAnchor="end"
          className="fill-ink-soft"
          fontSize={11}
        >
          peatelg
        </text>
        <text x={10} y={THREE_VIEW.height - 10} className="fill-ink-soft" fontSize={11}>
          peegli tagune – siin valgust ei ole
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Kolm peateljega paralleelset kiirt peegelduvad kumerpeeglilt. Peateljel on
        kolm punkti: A, B ja C.
      </figcaption>
    </figure>
  );
}
