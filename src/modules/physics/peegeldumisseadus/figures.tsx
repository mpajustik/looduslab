import {
  diffuseDirections,
  incidentDirection,
  reflectDirection,
  reflectedDirection,
  surfaceNormal,
  type Vector2,
} from "./model";

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

/** Sirge pind viirutusega – kordub mõlemal joonisel. */
function FlatSurface({
  left,
  right,
  y,
}: {
  left: number;
  right: number;
  y: number;
}) {
  return (
    <>
      <line
        x1={left}
        y1={y}
        x2={right}
        y2={y}
        className="stroke-ink"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <g className="stroke-ink-soft" strokeWidth={1.5} strokeLinecap="round">
        {hatchXs(left, right).map((x) => (
          <line key={x} x1={x} y1={y} x2={x - HATCH_STEP} y2={y + HATCH_STEP} />
        ))}
      </g>
    </>
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
        <FlatSurface
          left={CONCEPT_MIRROR.left}
          right={CONCEPT_MIRROR.right}
          y={CONCEPT_ORIGIN.y}
        />

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

// --- Joonis: kiir = joon + nool (theory-1) ---------------------------------

const RAY_LABEL_VIEW = { width: 360, height: 150 };
const RAY_LABEL_LEFT = 30;
const RAY_LABEL_RIGHT = 330;
const RAY_LABEL_ROW_1_Y = 42;
const RAY_LABEL_ROW_2_Y = 108;

/**
 * Kiir = joon + nool. Sama pikkusega joon on joonisel KAKS KORDA, ainult
 * nool on erisuunaline – see teebki nähtavaks, et joon üksi valguse suunda ei
 * ütle: sirge joon ise on sümmeetriline, aga valgus liigub ainult ÜHTE poole.
 *
 * Ühtegi mudelisuurust siin ei ole (vt CLAUDE.md reegel 1): rida ei kirjelda
 * ühtki peegeldumist ega nurka, ta on puhas kokkulepe, kuidas joonisel
 * suunda märgitakse. Sama kokkulepe kehtib kõigi selle mooduli ja mooduli
 * `valguse-sirgjooneline-levimine` joonistel edaspidi.
 */
export function RayIsLineAndArrowFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${RAY_LABEL_VIEW.width} ${RAY_LABEL_VIEW.height}`}
        role="img"
        aria-label="Joonis: kaks ühepikkust sirget joont üksteise all. Ülemisel joonel on keskel paremale osutav nool, mis näitab, et valgus liigub paremale. Alumisel on täpselt sama joon, aga keskel vasakule osutav nool, mis näitab, et valgus liigub vasakule."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />

        <path
          d={rayPath(
            { x: RAY_LABEL_LEFT, y: RAY_LABEL_ROW_1_Y },
            { x: RAY_LABEL_RIGHT, y: RAY_LABEL_ROW_1_Y },
            0.5,
          )}
          className="fill-none stroke-brand"
          strokeWidth={3}
          strokeLinecap="round"
          markerMid={`url(#${ARROW_INCIDENT})`}
        />
        <text
          x={(RAY_LABEL_LEFT + RAY_LABEL_RIGHT) / 2}
          y={RAY_LABEL_ROW_1_Y + 26}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={13}
        >
          valgus liigub paremale
        </text>

        <path
          d={rayPath(
            { x: RAY_LABEL_RIGHT, y: RAY_LABEL_ROW_2_Y },
            { x: RAY_LABEL_LEFT, y: RAY_LABEL_ROW_2_Y },
            0.5,
          )}
          className="fill-none stroke-brand"
          strokeWidth={3}
          strokeLinecap="round"
          markerMid={`url(#${ARROW_INCIDENT})`}
        />
        <text
          x={(RAY_LABEL_LEFT + RAY_LABEL_RIGHT) / 2}
          y={RAY_LABEL_ROW_2_Y + 26}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={13}
        >
          sama joon, aga valgus liigub vasakule
        </text>
      </svg>

      <figcaption className="text-base leading-relaxed text-ink-soft">
        Joon üksi ei ütle, kummale poole valgus liigub – seda näitab ainult
        nool.
      </figcaption>
    </figure>
  );
}

// --- Joonis: sile pind ja mattpind -----------------------------------------

/**
 * Langemisnurk mõlemal pinnal. 35° on VALIK: piisavalt kaldu, et kolm kiirt
 * oleksid teineteisest eristatavad, ja piisavalt lame, et kimp mahuks ära.
 */
const SURFACES_ANGLE_DEG = 35;

const SURFACES_VIEW = { minY: 40, width: 360, height: 268 };
const SURFACES_LEFT = 30;
const SURFACES_RIGHT = 310;

/** Sile pind: kolm langemispunkti ühel sirgel. */
const SMOOTH_Y = 130;
const SMOOTH_HITS = [95, 170, 245];
const SMOOTH_RAY = 62;

/** Mattpind: sama kõrgus kui sile, aga sakiline joon. */
const MATTE_BASE_Y = 270;
const MATTE_STEP = 14;
const MATTE_BUMP = 6;
const MATTE_RAY = 58;

/**
 * Seeme on VALITUD, mitte suvaline: selle juures lahkuvad kolm kiirt
 * ristsirge suhtes nurkade −20°, +17° ja +54° all ehk silmaga selgelt eri
 * suundades. Juhuslik seeme andis kimbu, kus kõik kolm olid peaaegu koos, ja
 * siis ei paista jooniselt seda, mille pärast ta üldse on.
 *
 * Fikseeritud nagu Simulation.tsx-is: joonis peab iga kord ühesugune olema
 * (model.ts ei tohi anda samale sisendile kaht tulemust).
 */
const MATTE_SEED = 20261172;

/** Mattpinna sakiline joon. Sakid on KAUNISTUS – füüsika on kiirte suundades. */
function roughSurfacePath(left: number, right: number, baseY: number): string {
  const points: string[] = [];
  for (let index = 0; left + index * MATTE_STEP <= right; index += 1) {
    points.push(`${left + index * MATTE_STEP} ${roughSurfaceY(index, baseY)}`);
  }
  return `M ${points.join(" L ")}`;
}

/** Saki kõrgus ühes punktis – kiired peavad maanduma TÄPSELT joone peale. */
function roughSurfaceY(index: number, baseY: number): number {
  return index % 2 === 0 ? baseY : baseY - MATTE_BUMP;
}

/** Langemispunktid mattpinnal: iga kolmas sakk, et kiired ei jookseks kokku. */
const MATTE_HIT_INDEXES = [5, 10, 15];

/**
 * Kaks pinda kõrvuti: siledalt pinnalt lahkuvad kõrvuti tulnud kiired
 * korrapäraselt, mattpinnalt eri suundades.
 *
 * Mõlemal joonisel on SAMA langemisnurk ja kiired tulevad kõrvuti – ainus
 * vahe on pinnas. Just see teeb nähtavaks, et hajumine ei ole „teistsugune
 * seadus": iga üksik kiir järgib ikka peegeldumisseadust, ainult mattpinna
 * pisikesed tahud on eri kaldega (vt model.ts diffuseDirections).
 */
export function SurfaceComparisonFigure() {
  const incidentUp = opposite(incidentDirection(SURFACES_ANGLE_DEG));
  const reflectedUp = reflectedDirection(SURFACES_ANGLE_DEG);
  // Hajunud suunad tulevad mudelist – siin ei arvutata ühtegi nurka.
  const diffuse = diffuseDirections(
    SURFACES_ANGLE_DEG,
    MATTE_HIT_INDEXES.length,
    MATTE_SEED,
  );

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 ${SURFACES_VIEW.minY} ${SURFACES_VIEW.width} ${SURFACES_VIEW.height}`}
        role="img"
        aria-label="Kaks joonist üksteise all. Ülemisel langeb kolm kõrvuti kiirt siledale peeglile ja lahkub samuti kõrvuti, kõik ühes suunas. Alumisel langeb kolm samasugust kiirt sakilisele mattpinnale ja lahkub eri suundades laiali."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />

        {/* --- Ülemine: sile pind --- */}
        <text x={SURFACES_LEFT} y={58} className="fill-ink" fontSize={15} fontWeight={600}>
          Sile pind (peegel)
        </text>
        <FlatSurface left={SURFACES_LEFT} right={SURFACES_RIGHT} y={SMOOTH_Y} />
        {SMOOTH_HITS.map((hitX) => {
          const hit = { x: hitX, y: SMOOTH_Y };
          const source = pointAt(hit, incidentUp, SMOOTH_RAY);
          const target = pointAt(hit, reflectedUp, SMOOTH_RAY);
          return (
            <g key={hitX}>
              <path
                d={rayPath(source, hit, 0.55)}
                className="fill-none stroke-brand"
                strokeWidth={2.5}
                strokeLinecap="round"
                markerMid={`url(#${ARROW_INCIDENT})`}
              />
              <path
                d={rayPath(hit, target, 0.85)}
                className="fill-none stroke-info"
                strokeWidth={2.5}
                strokeLinecap="round"
                markerMid={`url(#${ARROW_REFLECTED})`}
              />
            </g>
          );
        })}
        <text x={SURFACES_LEFT} y={158} className="fill-ink-soft" fontSize={13}>
          Kiired jäävad ka pärast peegeldumist kõrvuti.
        </text>

        {/* --- Alumine: mattpind --- */}
        <text x={SURFACES_LEFT} y={198} className="fill-ink" fontSize={15} fontWeight={600}>
          Mattpind (paber, sein)
        </text>
        <path
          d={roughSurfacePath(SURFACES_LEFT, SURFACES_RIGHT, MATTE_BASE_Y)}
          className="fill-none stroke-ink"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <g className="stroke-ink-soft" strokeWidth={1.5} strokeLinecap="round">
          {hatchXs(SURFACES_LEFT, SURFACES_RIGHT).map((x) => (
            <line
              key={x}
              x1={x}
              y1={MATTE_BASE_Y + 2}
              x2={x - HATCH_STEP}
              y2={MATTE_BASE_Y + 2 + HATCH_STEP}
            />
          ))}
        </g>
        {MATTE_HIT_INDEXES.map((hitIndex, rayIndex) => {
          const hit = {
            x: SURFACES_LEFT + hitIndex * MATTE_STEP,
            y: roughSurfaceY(hitIndex, MATTE_BASE_Y),
          };
          const source = pointAt(hit, incidentUp, MATTE_RAY);
          // Suund tuleb juba langemispunktist VÄLJA (sama kokkulepe mis
          // reflectedDirection-il), seega siin ei ole opposite()-i vaja.
          const target = pointAt(hit, diffuse[rayIndex], MATTE_RAY);
          return (
            <g key={hitIndex}>
              <path
                d={rayPath(source, hit, 0.55)}
                className="fill-none stroke-brand"
                strokeWidth={2.5}
                strokeLinecap="round"
                markerMid={`url(#${ARROW_INCIDENT})`}
              />
              <path
                d={rayPath(hit, target, 0.85)}
                className="fill-none stroke-info"
                strokeWidth={2.5}
                strokeLinecap="round"
                markerMid={`url(#${ARROW_REFLECTED})`}
              />
            </g>
          );
        })}
        <text x={SURFACES_LEFT} y={298} className="fill-ink-soft" fontSize={13}>
          Kiired lahkuvad eri suundades – pind hajutab valgust.
        </text>
      </svg>

      <figcaption className="text-base leading-relaxed text-ink-soft">
        Mõlemal joonisel on sama langemisnurk ja kiired tulevad kõrvuti. Ainus
        vahe on pind: mattpinna pisikesed tahud on eri kaldega, seega järgib iga
        kiir seadust oma tahu ristsirge suhtes ja lahkub teises suunas.
      </figcaption>
    </figure>
  );
}

// --- Joonis: Mari taskulambiga (hook) --------------------------------------

/**
 * Langemisnurk Mari joonisel. 55° on VALIK, aga mitte suvaline: selle juures
 * jõuab peegeldunud kiir seinani märklauast tublisti allapoole, nii et
 * „läheb mööda" on jooniselt kohe näha ega vaja seletust.
 *
 * Peab jääma vahemikku 0 < nurk < 90: 0° juures tuleks kiir otse tagasi üles
 * ega jõuaks kunagi seinani (maandumispunkti arvutus jagaks nulliga).
 */
const MARI_ANGLE_DEG = 55;

const MARI_VIEW = { minX: 10, minY: 40, width: 350, height: 230 };
/** Põrand, millel peegel lebab, ja sein, millel on märklaud. */
const MARI_FLOOR_Y = 230;
const MARI_WALL_X = 318;
const MARI_HIT = { x: 170, y: MARI_FLOOR_Y };
const MARI_MIRROR_HALF = 42;
const MARI_INCIDENT_RAY = 115;
const MARI_NORMAL_UP = 80;
const MARI_NORMAL_DOWN = 12;
/** Märklaud seinal – ringid, sest edestvaates on ta äratuntav (õpiku moodi). */
const MARI_TARGET = { x: MARI_WALL_X, y: 88 };

/**
 * Mooduli avaküsimus pildis: Mari suunab taskulambi kiire peeglile, aga kiir
 * jõuab seinal märklauast mööda.
 *
 * Kriipsujuku on TAHTLIKULT lihtne: joonise mõte on kiirte tee, mitte Mari.
 * Nimi on siltides, sest ülesande tekst räägib temast.
 *
 * Kuhu kiir seinal jõuab, EI ole siin kõvasti kirjutatud: suund tuleb
 * `model.ts`-ist ja maandumispunkt arvutatakse seina kauguse järgi. Kui nurk
 * kunagi muutub, liigub märk ise õigesse kohta.
 */
export function MariFlashlightFigure() {
  const incidentUp = opposite(incidentDirection(MARI_ANGLE_DEG));
  const reflectedUp = reflectedDirection(MARI_ANGLE_DEG);

  const source = pointAt(MARI_HIT, incidentUp, MARI_INCIDENT_RAY);
  // Kaugus seinani mööda peegeldunud kiirt: nii jõuab kiir täpselt seinale,
  // mitte sellest läbi ega poole peale.
  const landing = pointAt(
    MARI_HIT,
    reflectedUp,
    (MARI_WALL_X - MARI_HIT.x) / reflectedUp.x,
  );
  const normalTop = pointAt(MARI_HIT, NORMAL_DIRECTION, MARI_NORMAL_UP);
  const normalBottom = pointAt(MARI_HIT, opposite(NORMAL_DIRECTION), MARI_NORMAL_DOWN);

  // Kiire kalle EKRAANIL, kraadides – siltide ja taskulambi pööramiseks.
  // `pointAt` pöörab y-telje, seega mudeli suunast (y üles) saab ekraanisuuna
  // y-komponendi märki vahetades. Langev kiir liigub langemispunkti POOLE,
  // seega tema ekraanisuund on (-incidentUp.x, +incidentUp.y).
  const incidentTilt = (Math.atan2(incidentUp.y, -incidentUp.x) * 180) / Math.PI;
  const reflectedTilt = (Math.atan2(-reflectedUp.y, reflectedUp.x) * 180) / Math.PI;

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`${MARI_VIEW.minX} ${MARI_VIEW.minY} ${MARI_VIEW.width} ${MARI_VIEW.height}`}
        role="img"
        aria-label="Joonis: Mari seisab vasakul ja suunab taskulambi kiire põrandal lebavale peeglile. Peeglilt peegeldub kiir üles paremale seina poole, aga jõuab seinal märklauast tükk maad allapoole – möödas."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />

        {/* Põrand ja sein – ruumi raam, õhemad jooned kui peegel */}
        <line
          x1={MARI_VIEW.minX + 6}
          y1={MARI_FLOOR_Y}
          x2={MARI_WALL_X}
          y2={MARI_FLOOR_Y}
          className="stroke-ink-soft"
          strokeWidth={2}
        />
        <line
          x1={MARI_WALL_X}
          y1={MARI_VIEW.minY + 6}
          x2={MARI_WALL_X}
          y2={MARI_FLOOR_Y}
          className="stroke-ink-soft"
          strokeWidth={2}
        />

        {/* Peegel põrandal */}
        <FlatSurface
          left={MARI_HIT.x - MARI_MIRROR_HALF}
          right={MARI_HIT.x + MARI_MIRROR_HALF}
          y={MARI_FLOOR_Y}
        />

        {/* Pinna ristsirge – katkendjoon, sest ta ei ole valguskiir */}
        <line
          x1={normalBottom.x}
          y1={normalBottom.y}
          x2={normalTop.x}
          y2={normalTop.y}
          className="stroke-ink-soft"
          strokeWidth={2}
          strokeDasharray="6 5"
        />

        {/* Märklaud seinal */}
        <g className="fill-none stroke-ink" strokeWidth={2}>
          <circle cx={MARI_TARGET.x} cy={MARI_TARGET.y} r={14} />
          <circle cx={MARI_TARGET.x} cy={MARI_TARGET.y} r={8} />
        </g>
        <circle cx={MARI_TARGET.x} cy={MARI_TARGET.y} r={3} className="fill-ink" />

        {/* Mari: kriipsujuku taskulambiga */}
        <g className="stroke-ink" strokeWidth={2.5} strokeLinecap="round" fill="none">
          <circle cx={46} cy={142} r={11} />
          <line x1={46} y1={153} x2={46} y2={197} />
          <line x1={46} y1={160} x2={57} y2={151} />
          <line x1={46} y1={197} x2={34} y2={MARI_FLOOR_Y} />
          <line x1={46} y1={197} x2={58} y2={MARI_FLOOR_Y} />
        </g>
        {/* Taskulamp osutab piki langevat kiirt – pööre tuleb kiire kaldest */}
        <g transform={`translate(${source.x} ${source.y}) rotate(${incidentTilt})`}>
          <rect x={-24} y={-6} width={24} height={12} rx={2} className="fill-ink-soft" />
          <rect x={-5} y={-5} width={7} height={10} rx={1} className="fill-brand" />
        </g>

        {/* Kiired */}
        <path
          d={rayPath(source, MARI_HIT, 0.6)}
          className="fill-none stroke-brand"
          strokeWidth={3}
          strokeLinecap="round"
          markerMid={`url(#${ARROW_INCIDENT})`}
        />
        <path
          d={rayPath(MARI_HIT, landing, 0.85)}
          className="fill-none stroke-info"
          strokeWidth={3}
          strokeLinecap="round"
          markerMid={`url(#${ARROW_REFLECTED})`}
        />
        <circle cx={MARI_HIT.x} cy={MARI_HIT.y} r={4} className="fill-ink" />
        {/* Koht, kuhu kiir seinal jõuab – märklauast allpool */}
        <circle cx={landing.x} cy={landing.y} r={5} className="fill-info" />

        {/* Sildid viimasena ja valge äärisega, et jooned neist läbi ei jookseks */}
        <g className="stroke-white" strokeWidth={4} paintOrder="stroke">
          <text x={46} y={252} className="fill-ink" fontSize={14} textAnchor="middle" fontWeight={600}>
            Mari
          </text>
          <text x={MARI_HIT.x} y={252} className="fill-ink-soft" fontSize={14} textAnchor="middle">
            peegel
          </text>
          <text x={normalTop.x} y={normalTop.y - 8} className="fill-ink-soft" fontSize={13} textAnchor="middle">
            pinna ristsirge
          </text>
          <text x={MARI_TARGET.x - 22} y={58} className="fill-ink" fontSize={14} textAnchor="end" fontWeight={600}>
            märklaud
          </text>
          {/* Kiirte sildid on pööratud piki kiirt – muidu ei mahuks nad
              kuhugi, kus nad kiirt ise ei lõikaks. */}
          <text
            x={125}
            y={186}
            className="fill-brand"
            fontSize={13}
            fontWeight={600}
            textAnchor="middle"
            transform={`rotate(${incidentTilt} 125 186)`}
          >
            langev kiir
          </text>
          <text
            x={246}
            y={162}
            className="fill-info"
            fontSize={13}
            fontWeight={600}
            textAnchor="middle"
            transform={`rotate(${reflectedTilt} 246 162)`}
          >
            peegeldunud kiir
          </text>
        </g>
      </svg>

      <figcaption className="text-base leading-relaxed text-ink-soft">
        Sinine täpp näitab, kuhu kiir praegu seinal jõuab – märklauast allapoole.
      </figcaption>
    </figure>
  );
}

// --- Joonis: periskoop -----------------------------------------------------

/**
 * Periskoobi skeem (practice-3 küsimuse juurde).
 *
 * Kiire tee EI ole siin kõvasti kirjutatud, kuigi ta on telgedega kohakuti:
 * mõlemad pöörded arvutab `model.ts` (`reflectDirection` kaldu peeglilt).
 * Ainus sisend on peeglite kalle – kui see kunagi muutub, muutub joonis
 * kaasa. Nii ei saa joonis väita füüsikat, mida ükski test ei valva
 * (Codexi ülevaatuse leid 2026-08-04, CLAUDE.md reegel 1).
 *
 * MIKS kiir samas suunas väljub, joonis ei ütle – just seda küsib küsimus.
 */
const PERISCOPE_VIEW = { minX: 30, minY: 50, width: 300, height: 220 };
/** Peeglite kalle toru suhtes. Miinus = ekraanil „\" (ülalt vasakult alla). */
const PERISCOPE_MIRROR_TILT_DEG = -45;
/** Ülemine peegel; alumise koha annab kiire enda tee. */
const PERISCOPE_TOP_MIRROR: Point = { x: 180, y: 100 };
/** Kiire tee ülemiselt peeglilt alumiseni ehk toru pikkus. */
const PERISCOPE_TUBE_RUN = 110;
const PERISCOPE_ENTRY = 120;
/** Toru pool-laius ja otsad kiirte ümber. */
const PERISCOPE_TUBE_HALF = 30;
const PERISCOPE_TUBE_END = 30;
/** Peegli poolpikkus MÖÖDA peeglit – 45° all katab ta toru servast servani. */
const PERISCOPE_MIRROR_HALF = 42;
/** Ava toru seinas, kust kiir sisse ja välja käib. */
const PERISCOPE_GAP = 12;

export function PeriscopeFigure() {
  // Mõlemad pöörded tulevad mudelist. Kiir siseneb paremale liikudes.
  const normal = surfaceNormal(PERISCOPE_MIRROR_TILT_DEG);
  const enterDirection: Vector2 = { x: 1, y: 0 };
  // Ainult ESIMENE pööre: teine on see, mille õpilane ise välja mõtleb.
  const downDirection = reflectDirection(enterDirection, normal);
  /** Peegli enda siht: risti ristsirgega. */
  const along: Vector2 = { x: normal.y, y: -normal.x };

  const top = PERISCOPE_TOP_MIRROR;
  const bottom = pointAt(top, downDirection, PERISCOPE_TUBE_RUN);
  const entryStart = pointAt(top, opposite(enterDirection), PERISCOPE_ENTRY);
  const tube = {
    left: top.x - PERISCOPE_TUBE_HALF,
    right: top.x + PERISCOPE_TUBE_HALF,
    top: top.y - PERISCOPE_TUBE_END,
    bottom: bottom.y + PERISCOPE_TUBE_END,
  };
  const mirrorEnds = (center: Point) => ({
    from: pointAt(center, opposite(along), PERISCOPE_MIRROR_HALF),
    to: pointAt(center, along, PERISCOPE_MIRROR_HALF),
  });
  const topMirror = mirrorEnds(top);
  const bottomMirror = mirrorEnds(bottom);

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`${PERISCOPE_VIEW.minX} ${PERISCOPE_VIEW.minY} ${PERISCOPE_VIEW.width} ${PERISCOPE_VIEW.height}`}
        role="img"
        aria-label="Skeem: periskoop on püstine toru, mille mõlemas otsas on peegel 45 kraadi nurga all. Ülemine peegel on toru ülemises otsas, alumine alumises otsas ja nad on teineteisega paralleelsed. Valgus siseneb vasakult toru ülaossa ja jõuab ülemise peeglini. Kuhu ta sealt edasi läheb, on selle ülesande küsimus."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <RayArrowDefs />

        {/* Toru seinad, avadega kiire sisse- ja väljapääsuks */}
        <g className="stroke-ink-soft" strokeWidth={2.5} strokeLinecap="round">
          <line x1={tube.left} y1={tube.top} x2={tube.left} y2={top.y - PERISCOPE_GAP} />
          <line x1={tube.left} y1={top.y + PERISCOPE_GAP} x2={tube.left} y2={tube.bottom} />
          <line x1={tube.right} y1={tube.top} x2={tube.right} y2={bottom.y - PERISCOPE_GAP} />
          <line
            x1={tube.right}
            y1={bottom.y + PERISCOPE_GAP}
            x2={tube.right}
            y2={tube.bottom}
          />
          <line x1={tube.left} y1={tube.top} x2={tube.right} y2={tube.top} />
          <line x1={tube.left} y1={tube.bottom} x2={tube.right} y2={tube.bottom} />
        </g>

        {/* Kaks peeglit, mõlemad toru suhtes 45° all ja teineteisega paralleelsed */}
        <g className="stroke-ink" strokeWidth={4} strokeLinecap="round">
          <line
            x1={topMirror.from.x}
            y1={topMirror.from.y}
            x2={topMirror.to.x}
            y2={topMirror.to.y}
          />
          <line
            x1={bottomMirror.from.x}
            y1={bottomMirror.from.y}
            x2={bottomMirror.to.x}
            y2={bottomMirror.to.y}
          />
        </g>

        {/* AINULT sisenev kiir. Ülejäänud tee peab õpilane ise välja mõtlema –
            see ongi küsimuse mõte (vihje: „mitu korda kiir pöördub"). Terve
            tee joonisel välistaks silmaga kaks valevastust ja ülesandest jääks
            järele lugemisharjutus (ülevaatuse leid 2026-08-04, CodeRabbit;
            kasutaja otsustas). Suund tuleb ikka mudelist. */}
        <path
          d={rayPath(entryStart, top, 0.6)}
          className="fill-none stroke-brand"
          strokeWidth={3}
          strokeLinecap="round"
          markerMid={`url(#${ARROW_INCIDENT})`}
        />

        <g className="stroke-white" strokeWidth={4} paintOrder="stroke">
          <text x={entryStart.x - 2} y={top.y - 12} className="fill-brand" fontSize={13} fontWeight={600}>
            valgus siseneb
          </text>
          {/* Väljumiskoha juures on ainult küsimärk: ava on olemas, aga kuhu
              kiir läheb, ei ütle joonis ette. */}
          <text
            x={tube.right + 14}
            y={bottom.y + 5}
            className="fill-ink-soft"
            fontSize={20}
            fontWeight={600}
          >
            ?
          </text>
          <text x={tube.right + 8} y={top.y - 4} className="fill-ink" fontSize={13} fontWeight={600}>
            peegel 45°
          </text>
          <text
            x={tube.left - 10}
            y={bottom.y + 26}
            className="fill-ink"
            fontSize={13}
            fontWeight={600}
            textAnchor="end"
          >
            peegel 45°
          </text>
          {/* „toru" käib toru alla keskele: vasakul on juba alumise peegli
              silt ja kaks silti kohakuti ei ütle kummastki midagi. */}
          <text
            x={top.x}
            y={tube.bottom + 20}
            className="fill-ink-soft"
            fontSize={13}
            textAnchor="middle"
          >
            toru
          </text>
        </g>
      </svg>

      <figcaption className="text-base leading-relaxed text-ink-soft">
        Periskoop on toru kahe peegliga. Sellega saab vaadata üle takistuse –
        näiteks allveelaevast veepinna kohale või rahvamurrust ette.
      </figcaption>
    </figure>
  );
}
