import { incidentDirection, reflectedDirection, type Vector2 } from "./model";

/**
 * Mooduli joonised (src/engine/figures.ts).
 *
 * Need on VAATED, täpselt nagu Simulation.tsx: ühtegi nurgaarvutust siin ei
 * ole – kiirte suunad tulevad `model.ts`-ist (CLAUDE.md reegel 1). Nii ei saa
 * joonis ja simulatsioon kunagi eri füüsikat näidata, ka siis mitte, kui
 * joonisel valitud nurk kunagi muutub.
 *
 * Iga joonis on eraldi komponent ja saab registris (src/modules/registry.ts)
 * oma sildi. Silti teavad ainult see fail ja activities.ts – engine kannab
 * teda edasi teadmata, mida ta joonistab.
 *
 * Paigutus järgib Simulation.tsx kokkuleppeid: SVG y kasvab ALLA, mudeli y
 * ÜLES, ja see pööramine elab ainult `pointAt`-is.
 */

// --- Ühine (kõik joonised) -------------------------------------------------

/** Nooleotsad. Ühed id-d kogu failis: korraga on ekraanil üks joonis. */
const ARROW_INCIDENT = "fig-arrow-incident";
const ARROW_REFLECTED = "fig-arrow-reflected";

/** Pinna ristsirge suund: pind on x-teljel, ristsirge osutab üles (+y). */
const NORMAL_DIRECTION: Vector2 = { x: 0, y: 1 };

/** Viirutuse samm peegli taga – näitab, kummal pool on pinna tagune pool. */
const HATCH_STEP = 9;

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

type Point = { x: number; y: number };

/**
 * Matemaatiline suund (y üles) → SVG punkt (y alla).
 *
 * Ainus koht, kus y-telge pööratakse – nii ei pea ükski teine rida mäletama,
 * kummale poole mudeli y osutab.
 */
function pointAt(origin: Point, direction: Vector2, distance: number): Point {
  return {
    x: origin.x + direction.x * distance,
    y: origin.y - direction.y * distance,
  };
}

function opposite(direction: Vector2): Vector2 {
  return { x: -direction.x, y: -direction.y };
}

/**
 * Kahe suuna vaheline poolitaja – nurgasilt läheb kaare keskele. Puhas
 * geomeetria, mitte füüsika: sisendid tulevad model.ts-ist.
 */
function bisector(a: Vector2, b: Vector2): Vector2 {
  const x = a.x + b.x;
  const y = a.y + b.y;
  const length = Math.hypot(x, y);
  return { x: x / length, y: y / length };
}

/** Kaar ristsirgest kiireni. `sweep` 1 = ekraanil päripäeva (paremale). */
function arcPath(
  origin: Point,
  from: Vector2,
  to: Vector2,
  radius: number,
  sweep: 0 | 1,
): string {
  const start = pointAt(origin, from, radius);
  const end = pointAt(origin, to, radius);
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 ${sweep} ${end.x} ${end.y}`;
}

/** Kiir noolega: kolm punkti, et `marker-mid` saaks kuhugi kinnituda. */
function rayPath(from: Point, to: Point, arrowAt: number): string {
  const arrow = {
    x: from.x + (to.x - from.x) * arrowAt,
    y: from.y + (to.y - from.y) * arrowAt,
  };
  return `M ${from.x} ${from.y} L ${arrow.x} ${arrow.y} L ${to.x} ${to.y}`;
}

/** Viirutus pinna all, vasakule kaldu. */
function hatchXs(left: number, right: number): number[] {
  return Array.from(
    { length: Math.floor((right - left) / HATCH_STEP) },
    (_, index) => left + HATCH_STEP * (index + 1),
  );
}

// --- Joonis: peegeldumise mõisted ------------------------------------------

/**
 * Nurk, mille juures mõistejoonis on joonistatud.
 *
 * 40° on VALIK: piisavalt kaldu, et kaks kiirt oleksid selgelt eri suundades,
 * ja piisavalt järsk, et mõlemad sildid mahuksid 360 px laiusele ekraanile.
 */
const CONCEPT_ANGLE_DEG = 40;

/**
 * Vaateaken. `minY` kärbib tühja ruumi siltide kohalt: paigutus on arvutatud
 * langemispunktist (y = 230) ülespoole, seega ülemine sada pikslit jääks
 * muidu tühjaks ja joonis paistaks telefonis pisikesena keset valget kasti.
 */
const CONCEPT_VIEW = { minY: 98, width: 360, height: 160 };
const CONCEPT_ORIGIN: Point = { x: 180, y: 230 };
const CONCEPT_MIRROR = { left: 20, right: 340 };
const CONCEPT_RAY = 130;
const CONCEPT_NORMAL_UP = 100;
const CONCEPT_NORMAL_DOWN = 18;
const CONCEPT_ARC = 46;
const CONCEPT_ARC_LABEL = 70;

/** Nooled ei ole keskel: nii ei kata nad nurgasilte ega teineteist. */
const INCIDENT_ARROW_AT = 0.35;
const REFLECTED_ARROW_AT = 0.9;

/**
 * Kõik mõisted ühel joonisel: peegel, langev kiir, peegeldunud kiir, pinna
 * ristsirge, langemisnurk ja peegeldumisnurk.
 *
 * Nurgad on joonisel tähtedega α ja β, terminid nende all allkirjas. Põhjus on
 * ruum: „langemisnurk" ja „peegeldumisnurk" on nii pikad sõnad, et kaare
 * kõrvale (kiire ja ristsirge VAHELE) nad 360 px laiusel ekraanil ei mahu –
 * kirjutatuna mujale vajaksid nad viitejoont, mis lõikaks kiirt. Tähed kaare
 * juures + terminid kohe joonise all on sama lahendus, mida kasutab õpik.
 */
export function ReflectionConceptFigure() {
  // Kaks kiirt mudelist. Langev kiir liigub ALLA, aga silt ja kaar tahavad
  // suunda langemispunktist VÄLJA – seepärast vastassuund.
  const incidentUp = opposite(incidentDirection(CONCEPT_ANGLE_DEG));
  const reflectedUp = reflectedDirection(CONCEPT_ANGLE_DEG);

  const source = pointAt(CONCEPT_ORIGIN, incidentUp, CONCEPT_RAY);
  const target = pointAt(CONCEPT_ORIGIN, reflectedUp, CONCEPT_RAY);
  const normalTop = pointAt(CONCEPT_ORIGIN, NORMAL_DIRECTION, CONCEPT_NORMAL_UP);
  const normalBottom = pointAt(
    CONCEPT_ORIGIN,
    opposite(NORMAL_DIRECTION),
    CONCEPT_NORMAL_DOWN,
  );
  const incidentAngleLabel = pointAt(
    CONCEPT_ORIGIN,
    bisector(NORMAL_DIRECTION, incidentUp),
    CONCEPT_ARC_LABEL,
  );
  const reflectedAngleLabel = pointAt(
    CONCEPT_ORIGIN,
    bisector(NORMAL_DIRECTION, reflectedUp),
    CONCEPT_ARC_LABEL,
  );

  return (
    // Laius on piiratud: telefonis täidab joonis ekraani, aga töölaual ei tohi
    // ta venida terve tekstiveeru laiuseks – siis kasvaks ka iga silt
    // hiiglaslikuks (viewBox skaleerib kõik ühes).
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 ${CONCEPT_VIEW.minY} ${CONCEPT_VIEW.width} ${CONCEPT_VIEW.height}`}
        role="img"
        aria-label="Joonis: valguskiir langeb tasapeeglile. Joonisel on peegel, sellega ristuv katkendjoon ehk pinna ristsirge, langev kiir ja peegeldunud kiir. Langemisnurk α langeva kiire ja ristsirge vahel on sama suur kui peegeldumisnurk β peegeldunud kiire ja ristsirge vahel."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />

        {/* Peegel: paks joon + viirutus tagumisel poolel */}
        <line
          x1={CONCEPT_MIRROR.left}
          y1={CONCEPT_ORIGIN.y}
          x2={CONCEPT_MIRROR.right}
          y2={CONCEPT_ORIGIN.y}
          className="stroke-ink"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <g className="stroke-ink-soft" strokeWidth={1.5} strokeLinecap="round">
          {hatchXs(CONCEPT_MIRROR.left, CONCEPT_MIRROR.right).map((x) => (
            <line
              key={x}
              x1={x}
              y1={CONCEPT_ORIGIN.y}
              x2={x - HATCH_STEP}
              y2={CONCEPT_ORIGIN.y + HATCH_STEP}
            />
          ))}
        </g>

        {/* Pinna ristsirge – katkendjoon, sest ta EI ole valguskiir */}
        <line
          x1={normalBottom.x}
          y1={normalBottom.y}
          x2={normalTop.x}
          y2={normalTop.y}
          className="stroke-ink-soft"
          strokeWidth={2}
          strokeDasharray="6 5"
        />

        {/* Nurgakaared ristsirgest mõlema kiireni */}
        <path
          d={arcPath(CONCEPT_ORIGIN, NORMAL_DIRECTION, incidentUp, CONCEPT_ARC, 0)}
          className="fill-none stroke-brand"
          strokeWidth={2}
        />
        <path
          d={arcPath(CONCEPT_ORIGIN, NORMAL_DIRECTION, reflectedUp, CONCEPT_ARC, 1)}
          className="fill-none stroke-info"
          strokeWidth={2}
        />

        {/* Kiired kaarte peal, et kaared ja katkendjoon neid ei lõikaks */}
        <path
          d={rayPath(source, CONCEPT_ORIGIN, INCIDENT_ARROW_AT)}
          className="fill-none stroke-brand"
          strokeWidth={3}
          strokeLinecap="round"
          markerMid={`url(#${ARROW_INCIDENT})`}
        />
        <path
          d={rayPath(CONCEPT_ORIGIN, target, REFLECTED_ARROW_AT)}
          className="fill-none stroke-info"
          strokeWidth={3}
          strokeLinecap="round"
          markerMid={`url(#${ARROW_REFLECTED})`}
        />
        <circle cx={CONCEPT_ORIGIN.x} cy={CONCEPT_ORIGIN.y} r={4} className="fill-ink" />

        {/* Sildid viimasena ja valge äärisega (`paint-order: stroke`): nii jääb
            tekst loetavaks ka seal, kus kiir temast napilt möödub. */}
        <g className="stroke-white" strokeWidth={4} paintOrder="stroke">
          <text x={180} y={118} className="fill-ink-soft" fontSize={14} textAnchor="middle">
            pinna ristsirge
          </text>
          <text x={92} y={122} className="fill-brand" fontSize={14} textAnchor="end" fontWeight={600}>
            langev kiir
          </text>
          <text
            x={CONCEPT_VIEW.width - 4}
            y={122}
            className="fill-info"
            fontSize={14}
            textAnchor="end"
            fontWeight={600}
          >
            peegeldunud kiir
          </text>
          <text x={24} y={222} className="fill-ink-soft" fontSize={14}>
            peegel
          </text>
          <text
            x={incidentAngleLabel.x}
            y={incidentAngleLabel.y}
            className="fill-brand"
            fontSize={19}
            fontWeight={600}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            α
          </text>
          <text
            x={reflectedAngleLabel.x}
            y={reflectedAngleLabel.y}
            className="fill-info"
            fontSize={19}
            fontWeight={600}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            β
          </text>
        </g>
      </svg>

      <figcaption className="text-base leading-relaxed text-ink-soft">
        <span className="font-semibold text-brand">α</span> – langemisnurk,{" "}
        <span className="font-semibold text-info">β</span> – peegeldumisnurk.
        Mõlemat mõõdetakse pinna ristsirgest, mitte peegli pinnast.
      </figcaption>
    </figure>
  );
}
