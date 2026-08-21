import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { SimulationProps } from "../../../engine/simulationFeatures";
import { Button } from "../../../ui/Button";
import { SliderField } from "../../../ui/SliderField";
import { formatNumber } from "../../../lib/format";
import { traceCornerRay, type Vector2 } from "./model";

/**
 * Nurkpeegli simulatsioon – ainult VAADE (sisu/MOODUL-nurkpeegel.md, samm
 * „explore"; docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Selles failis ei ole ühtegi nurgaarvutust: mõlemad langemispunktid, kõik kolm
 * kiire suunda, β ja pööre tulevad `model.ts`-i funktsioonist `traceCornerRay`
 * (CLAUDE.md reegel 1). Siin on ainult PAIGUTUS – SVG y-telje pööramine,
 * mõõtkava, kaarte raadiused ja siltide kohad. Sama geomeetria joonistab ka
 * `figures.tsx`, samast mudelifunktsioonist: joonis ja simulatsioon ei saa
 * kunagi eri füüsikat näidata.
 *
 * ÜHIKUD: mudel räägib meetrites ja kraadides, joonis pikslites. Ühik muutub
 * ainult mõõtkavas (`scale`); kõik mudelile antavad arvud on meetrites.
 *
 * MÕÕTKAVA ON MÕLEMAL TELJEL SAMA ja see ei ole ilu, vaid tingimus: ekraanil on
 * kirjas α, β ja pööre, seega peavad joonisel olevad nurgad olema PÄRIS nurgad.
 * Küll aga kohandub mõõtkava liuguritega. Teisiti ei saagi: teise langemispunkti
 * kaugus tipust on e = d · cos α / cos β ja liugurite piirides muutub suhe e/d
 * ligi 0,09-st 11-ni (θ = 90°, α 5°…85°). Püsiva mõõtkavaga jääks kiir ühes
 * otsas ekraanist välja ja teises oleks peegel 2 poole piksli pikkune. Seepärast
 * arvutatakse iga seisu jaoks kõigi joonistatavate punktide ümbermõõt ja
 * mahutatakse ta ühe kordajaga vaatesse.
 *
 * `unlockedFeatures` tuleb explore-sammult (`ExploreStep` →
 * `unlockedSimulationFeatures`): SEE fail on ainus koht, mis teab, mida silt
 * „poorde-lyliti" tähendab (docs/ARHITEKTUUR.md „ui/ ei tohi teada
 * moodulitest").
 */

// --- Liugurite piirid ------------------------------------------------------

/** Peeglite nurk θ. Alumine ots 60°, mitte 45°: vt sisu/MOODUL-nurkpeegel.md „explore". */
const MIN_MIRROR_DEG = 60;
const MAX_MIRROR_DEG = 90;
const DEFAULT_MIRROR_DEG = 60;

/** Langemisnurk α esimesel peeglil. Ülemine ots sõltub θ-st – vt `maxIncidenceDeg`. */
const MIN_INCIDENCE_DEG = 5;
const DEFAULT_INCIDENCE_DEG = 20;

/** Mõlema liuguri samm. Sama arv on ka tolerantsi taga (activities.ts). */
const ANGLE_STEP_DEG = 5;

/**
 * Kui palju jääb langemisnurk mudeli piirist (2θ − 90°) allapoole.
 *
 * Mudel keeldub piiril ja sellest üle: seal peegelduks kiir kolmandat korda ja
 * „pööre = 2θ" oleks vale (model.ts `assertTwoBounceGeometry`). Liuguri ots on
 * seepärast ÜHE SAMMU võrra varem – nii ei satu ka ümardamisjääk kunagi üle
 * piiri ja joonis ei jää kunagi poolele teele seisma.
 */
const INCIDENCE_HEADROOM_DEG = ANGLE_STEP_DEG;

/** Feature-silt, mida see fail explore-sammu `unlockedFeatures` seast otsib. */
const DEVIATION_FEATURE = "poorde-lyliti";

/** Suurim langemisnurk, mille juures kiir veel kahe peegeldusega välja pääseb. */
function maxIncidenceDeg(mirrorAngleDeg: number): number {
  return 2 * mirrorAngleDeg - 90 - INCIDENCE_HEADROOM_DEG;
}

// --- Paigutus (SVG kasutajaühikud, y kasvab ALLA) --------------------------

type Point = { x: number; y: number };

const VIEW = { width: 360, height: 300 };

/**
 * Ääris ümber joonise: nurgakaared, sildid ja punktide nimed ulatuvad kiirtest
 * ja peeglitest väljapoole, mahutamine ise vaatab ainult jooni.
 */
const MARGIN = { left: 44, right: 44, top: 42, bottom: 32 };

/**
 * Esimese langemispunkti kaugus tipust (m).
 *
 * Mudel nõuab meetreid, aga see moodul ei näita ühtegi PIKKUST – tähtsad on
 * ainult nurgad ja need ei sõltu mõõtkavast (mudeli invariant: kaks korda
 * kaugem langemispunkt annab täpselt sama teekonna kuju). Sama arv on ka
 * figures.tsx-is.
 */
const FIRST_HIT_M = 0.1;

/** Peeglid lõpevad natuke pärast langemispunkti (model.ts idealiseering 5). */
const FIRST_MIRROR_RATIO = 1.35;
const SECOND_MIRROR_RATIO = 1.3;

/** Kiirte pikkused osana joonise enda suurusest – nii jäävad nad igas seisus proportsioonis. */
const INCIDENT_LENGTH_RATIO = 0.55;
const OUTGOING_LENGTH_RATIO = 0.6;

/** Nooleots kiire peal: osa lõigu pikkusest alguspunktist lugedes. */
const INCIDENT_ARROW_AT = 0.45;
const MIDDLE_ARROW_AT = 0.5;
const OUTGOING_ARROW_AT = 0.55;

/** Ristsirge pikkus mõlemal pool langemispunkti. */
const NORMAL_LENGTH = 52;

/** Viirutus peegli tagaküljel – ühtlane samm mõlemal peeglil (sama mis figures.tsx). */
const HATCH_STEP_PX = 15;
const HATCH_LENGTH_PX = 8;

/** Kaarte põhiraadiused: sisemine kaar (langemisnurk) ja välimine (peegeldumisnurk). */
const INNER_ARC = 26;
const OUTER_ARC = 42;
const VERTEX_ARC = 40;
const DEVIATION_ARC = 46;
/** Silt läheb kaarest nii palju kaugemale. */
const LABEL_GAP = 14;

/**
 * Väikseim kaar, mille joonistame.
 *
 * Kui teine langemispunkt on tipu lähedal (θ = 90°, suur α – siis on e alla
 * kümnendiku d-st), ei mahu 26-piksline kaar sinna ära ja kataks tipu enda.
 * Kaar kahaneb siis ruumi järgi, aga mitte alla selle: nähtamatust kaarest ei
 * ole kellelegi kasu.
 */
const MIN_ARC_RADIUS = 11;

/**
 * Kui kaar on ruumipuudusest põhiraadiusest palju väiksem, jääb ARV joonisele
 * panemata. See ei võta õpilaselt midagi ära: kõik neli nurka on alati suurelt
 * kirjas ka joonise all olevatel kaartidel (DISAINIJUHIS – arv ei tohi olla
 * ainult pisikeses sildis). Kolm numbrit üksteise otsas oleksid loetamatud.
 */
const LABEL_MIN_RATIO = 0.8;

const ARROW_LIGHT = "np-sim-arrow-light";

/** Nurk ekraanile – üks koht, kust kõik selle faili arvud läbi käivad. */
const deg = (value: number): string => formatNumber(value);

/** Mudeli suund (y üles) ekraanisuunaks (y alla). Ainus koht, kus y-telg pöördub. */
function toScreenDirection(direction: Vector2): Point {
  return { x: direction.x, y: -direction.y };
}

function along(origin: Point, direction: Point, distance: number): Point {
  return {
    x: origin.x + direction.x * distance,
    y: origin.y + direction.y * distance,
  };
}

function opposite(direction: Point): Point {
  return { x: -direction.x, y: -direction.y };
}

function normalize(vector: Point): Point {
  const length = Math.hypot(vector.x, vector.y);
  return { x: vector.x / length, y: vector.y / length };
}

/** Ristsirge suund: peegli suund 90° võrra keerates. */
function perpendicular(direction: Point): Point {
  return { x: -direction.y, y: direction.x };
}

/**
 * Kumba pidi kaar käib. Ristkorrutis, mitte silm: langemispunktid on joonisel
 * eri pidi (peegel 1 all, peegel 2 kaldu) ja käsitsi valitud lipp läheks ühes
 * neist vale ringi ümber. `1` = SVG positiivne suund ehk ekraanil päripäeva.
 */
function sweepFlag(from: Point, to: Point): 0 | 1 {
  return from.x * to.y - from.y * to.x > 0 ? 1 : 0;
}

/** Nurgakaar suunast suunani, alati LÜHEMAT teed. Sama funktsioon on figures.tsx-is. */
function angleArc(origin: Point, from: Point, to: Point, radius: number): string {
  const start = along(origin, from, radius);
  const end = along(origin, to, radius);
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 ${sweepFlag(from, to)} ${end.x} ${end.y}`;
}

/**
 * Sildi suund kaare keskel ehk kahe suuna poolitajal.
 *
 * 90° nurkpeeglis on pööre täpselt 180° ja siis on kaare kaks otsa
 * VASTASSUUNAS – poolitaja tuleks null vektor ja silt satuks 0/0 peale. Sellel
 * ühel juhul läheb silt risti. Kumba poole, seda EI tohi valida käsitsi: 180°
 * kaar katab pool ringjoont ja teine pool on tühi, seega peab silt minema
 * täpselt sinnapoole, kuhu `angleArc` kaare joonistab. Ristkorrutis on seal
 * null ja tema märk (ehk sweep-lipp) sõltub ujukoma jäägist – seepärast küsime
 * lipu sama funktsiooni käest, mitte ei arva teda uuesti.
 */
function labelDirection(from: Point, to: Point): Point {
  const x = from.x + to.x;
  const y = from.y + to.y;
  const length = Math.hypot(x, y);
  if (length < 1e-9) {
    return sweepFlag(from, to) === 1
      ? { x: -from.y, y: from.x }
      : { x: from.y, y: -from.x };
  }
  return { x: x / length, y: y / length };
}

/**
 * Kaare raadius, mis mahub olemasolevasse ruumi.
 *
 * `roomPx` on kaugus lähima naaberpunktini (tipp, teine langemispunkt): kaar,
 * mis on temast pikem, jookseks naabrist üle.
 */
function arcRadius(base: number, roomPx: number): number {
  return Math.max(MIN_ARC_RADIUS, Math.min(base, roomPx * 0.55));
}

/** Kiir noolega: kolm punkti, et `marker-mid` saaks kuhugi kinnituda. */
function rayPath(from: Point, to: Point, arrowAt: number): string {
  const arrow = {
    x: from.x + (to.x - from.x) * arrowAt,
    y: from.y + (to.y - from.y) * arrowAt,
  };
  return `M ${from.x} ${from.y} L ${arrow.x} ${arrow.y} L ${to.x} ${to.y}`;
}

/**
 * Kogu joonise geomeetria ühes kohas: mudelist tulnud punktid ja suunad,
 * mõõtkava ja kõik ekraanipunktid.
 *
 * Mõõtkava tuleb punktidest endist (vt faili päis). Pöörde katkendlik pikendus
 * on ümbermõõdus SEES ka siis, kui lüliti on välja lülitatud – muidu hüppaks
 * kogu joonis lüliti vajutamise peale teise suurusesse ja õpilane kaotaks
 * silmist selle, mida ta parasjagu vaatas.
 */
function buildScene(mirrorAngleDeg: number, incidenceDeg: number) {
  const path = traceCornerRay(mirrorAngleDeg, incidenceDeg, FIRST_HIT_M);

  // Punktid ja suunad ekraani suunas (y alla), aga veel meetrites.
  const firstHitM: Point = { x: path.firstHitM.x, y: -path.firstHitM.y };
  const secondHitM: Point = { x: path.secondHitM.x, y: -path.secondHitM.y };
  const incident = toScreenDirection(path.incidentDirection);
  const middle = toScreenDirection(path.middleDirection);
  const outgoing = toScreenDirection(path.outgoingDirection);

  // Peegel 1 on mudelis x-telg; peegel 2 läbib teist langemispunkti, seega ei
  // ole tema suunda vaja nurgast eraldi arvutada – ta tuleb mudeli punktist.
  const firstMirror: Point = { x: 1, y: 0 };
  const secondMirror = normalize(secondHitM);
  const firstNormal: Point = { x: 0, y: -1 };
  const secondNormal = perpendicular(secondMirror);

  const firstDistanceM = FIRST_HIT_M;
  const secondDistanceM = Math.hypot(secondHitM.x, secondHitM.y);
  const spanM = Math.max(firstDistanceM, secondDistanceM);

  const incidentStartM = along(firstHitM, opposite(incident), spanM * INCIDENT_LENGTH_RATIO);
  const outgoingEndM = along(secondHitM, outgoing, spanM * OUTGOING_LENGTH_RATIO);
  const straightOnEndM = along(secondHitM, incident, spanM * OUTGOING_LENGTH_RATIO);
  const firstMirrorEndM = along(
    { x: 0, y: 0 },
    firstMirror,
    firstDistanceM * FIRST_MIRROR_RATIO,
  );
  const secondMirrorEndM = along(
    { x: 0, y: 0 },
    secondMirror,
    secondDistanceM * SECOND_MIRROR_RATIO,
  );

  const corners: Point[] = [
    { x: 0, y: 0 },
    firstHitM,
    secondHitM,
    incidentStartM,
    outgoingEndM,
    straightOnEndM,
    firstMirrorEndM,
    secondMirrorEndM,
  ];
  const minX = Math.min(...corners.map((point) => point.x));
  const maxX = Math.max(...corners.map((point) => point.x));
  const minY = Math.min(...corners.map((point) => point.y));
  const maxY = Math.max(...corners.map((point) => point.y));

  const availableWidth = VIEW.width - MARGIN.left - MARGIN.right;
  const availableHeight = VIEW.height - MARGIN.top - MARGIN.bottom;
  const scale = Math.min(
    availableWidth / (maxX - minX),
    availableHeight / (maxY - minY),
  );

  // Tipu koht ekraanil: nii, et kogu ümbermõõt jääb äärise sisse ja keskele.
  const vertex: Point = {
    x: MARGIN.left - minX * scale + (availableWidth - (maxX - minX) * scale) / 2,
    y: MARGIN.top - minY * scale + (availableHeight - (maxY - minY) * scale) / 2,
  };
  const place = (point: Point): Point => ({
    x: vertex.x + point.x * scale,
    y: vertex.y + point.y * scale,
  });

  const firstHit = place(firstHitM);
  const secondHit = place(secondHitM);
  const firstDistancePx = firstDistanceM * scale;
  const secondDistancePx = secondDistanceM * scale;
  const middleLengthPx = Math.hypot(
    secondHit.x - firstHit.x,
    secondHit.y - firstHit.y,
  );

  return {
    path,
    vertex,
    firstHit,
    secondHit,
    incidentStart: place(incidentStartM),
    outgoingEnd: place(outgoingEndM),
    straightOnEnd: place(straightOnEndM),
    firstMirrorEnd: place(firstMirrorEndM),
    secondMirrorEnd: place(secondMirrorEndM),
    incident,
    middle,
    outgoing,
    firstMirror,
    secondMirror,
    firstNormal,
    secondNormal,
    // Ruum kaarte jaoks: kaugus lähima naaberpunktini.
    vertexRoomPx: Math.min(firstDistancePx, secondDistancePx),
    firstRoomPx: Math.min(firstDistancePx, middleLengthPx),
    secondRoomPx: Math.min(secondDistancePx, middleLengthPx),
  };
}

export function Simulation({
  unlockedFeatures = new Set(),
}: Partial<SimulationProps> = {}) {
  const [mirrorAngleDeg, setMirrorAngleDeg] = useState(DEFAULT_MIRROR_DEG);
  const [incidenceDeg, setIncidenceDeg] = useState(DEFAULT_INCIDENCE_DEG);
  const [showDeviation, setShowDeviation] = useState(false);
  const mirrorSliderId = useId();
  const incidenceSliderId = useId();
  const deviationToggleId = useId();

  // Pöörde lüliti avaneb pärast ülesannet 1 (sisu/MOODUL-nurkpeegel.md) –
  // ExploreStep otsustab, millal küsimusele on vastatud; see fail ainult otsib
  // oma sildi selle hulgast.
  const deviationAvailable = unlockedFeatures.has(DEVIATION_FEATURE);
  const deviationVisible = deviationAvailable && showDeviation;

  // Liuguri ülemine ots liigub θ-ga kaasa. Kärbime ka siin, mitte ainult
  // muutuse hetkel: mudel viskab piirist väljas vea (see on tahtlik) ja vaade
  // ei tohi talle midagi kahtlast anda.
  const maxIncidence = maxIncidenceDeg(mirrorAngleDeg);
  const incidence = Math.min(incidenceDeg, maxIncidence);

  const scene = buildScene(mirrorAngleDeg, incidence);
  const { path } = scene;

  // Peegeldumisnurk EI ole eraldi arv: mõlemal peeglil kehtib peegeldumisseadus
  // (langemisnurk = peegeldumisnurk, moodul `peegeldumisseadus`), seega on
  // kaardil ja joonisel sama α ja sama β kaks korda.
  const firstDeg = path.firstIncidenceDeg;
  const secondDeg = path.secondIncidenceDeg;

  const vertexArcRadius = arcRadius(VERTEX_ARC, scene.vertexRoomPx);
  const firstInnerRadius = arcRadius(INNER_ARC, scene.firstRoomPx);
  const firstOuterRadius = arcRadius(OUTER_ARC, scene.firstRoomPx);
  const secondInnerRadius = arcRadius(INNER_ARC, scene.secondRoomPx);
  const secondOuterRadius = arcRadius(OUTER_ARC, scene.secondRoomPx);

  const showVertexLabel = vertexArcRadius >= VERTEX_ARC * LABEL_MIN_RATIO;
  const showFirstLabels = firstOuterRadius >= OUTER_ARC * LABEL_MIN_RATIO;
  const showSecondLabels = secondOuterRadius >= OUTER_ARC * LABEL_MIN_RATIO;

  const vertexLabel = along(
    scene.vertex,
    labelDirection(scene.firstMirror, scene.secondMirror),
    vertexArcRadius + LABEL_GAP,
  );
  const firstIncidenceLabel = along(
    scene.firstHit,
    labelDirection(opposite(scene.incident), scene.firstNormal),
    firstInnerRadius + LABEL_GAP,
  );
  const firstReflectionLabel = along(
    scene.firstHit,
    labelDirection(scene.firstNormal, scene.middle),
    firstOuterRadius + LABEL_GAP,
  );
  const secondIncidenceLabel = along(
    scene.secondHit,
    labelDirection(opposite(scene.middle), scene.secondNormal),
    secondInnerRadius + LABEL_GAP,
  );
  const secondReflectionLabel = along(
    scene.secondHit,
    labelDirection(scene.secondNormal, scene.outgoing),
    secondOuterRadius + LABEL_GAP,
  );
  const deviationLabel = along(
    scene.secondHit,
    labelDirection(scene.incident, scene.outgoing),
    DEVIATION_ARC + LABEL_GAP,
  );

  return (
    <div className="flex flex-col gap-5">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        // Kirjeldus ei muutu liuguri liigutamisel – muidu loeks ekraanilugeja
        // iga kraadi juures terve lause uuesti ette. Kõik neli nurka on ka
        // tekstina joonise all olevatel kaartidel. Pöörde lüliti (harv sündmus,
        // mitte liuguri-sarnane) LISAB joonisele uue joone, seega tema puhul
        // peab kirjeldus muutuma.
        aria-label={
          deviationVisible
            ? "Joonis: kaks tasast peeglit kohtuvad vasakul all tipus, nendevaheline nurk on märgitud kaarega. Valguskiir langeb peeglile 1 punktis P1, peegeldub sealt peeglile 2 punkti P2 ja väljub. Mõlemas langemispunktis on katkendlik ristsirge ja tema kahel pool kaks võrdset nurgakaart. Punktist P2 läheb ka katkendlik joon, mis näitab kiire endist suunda, ja tema ning väljuva kiire vahel on pöörde kaar."
            : "Joonis: kaks tasast peeglit kohtuvad vasakul all tipus, nendevaheline nurk on märgitud kaarega. Valguskiir langeb peeglile 1 punktis P1, peegeldub sealt peeglile 2 punkti P2 ja väljub. Mõlemas langemispunktis on katkendlik ristsirge ja tema kahel pool kaks võrdset nurgakaart."
        }
        className="w-full rounded-2xl border border-line bg-white"
      >
        <defs>
          {/* `fill` on markeril otse küljes: marker ei päri värvi teda
              kasutavalt joonelt. */}
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

        {/* Kiil peeglite vahel on heledam – seal liigub valgus. */}
        <path
          d={`M ${scene.vertex.x} ${scene.vertex.y} L ${scene.firstMirrorEnd.x} ${scene.firstMirrorEnd.y} L ${scene.secondMirrorEnd.x} ${scene.secondMirrorEnd.y} Z`}
          className="fill-brand"
          fillOpacity={0.07}
        />

        <Mirror
          from={scene.vertex}
          to={scene.firstMirrorEnd}
          backSide={{ x: 0, y: 1 }}
        />
        <Mirror
          from={scene.vertex}
          to={scene.secondMirrorEnd}
          backSide={opposite(scene.secondNormal)}
        />

        {/* Peeglite nurk tipus. */}
        <path
          d={angleArc(
            scene.vertex,
            scene.firstMirror,
            scene.secondMirror,
            vertexArcRadius,
          )}
          className="fill-none stroke-ink"
          strokeWidth={1.5}
        />

        {/* Pöörde katkendlik pikendus: kuhu kiir oleks läinud, kui peegleid ei
            oleks olnud. Ta algab TEISEST langemispunktist, mitte esimesest –
            nii on pöörde kaare mõlemad otsad ühes ja samas punktis ka siis, kui
            peeglite nurk on 90° ja kiired jäävad omavahel paralleelseks. */}
        {deviationVisible ? (
          <>
            <line
              x1={scene.secondHit.x}
              y1={scene.secondHit.y}
              x2={scene.straightOnEnd.x}
              y2={scene.straightOnEnd.y}
              className="stroke-info"
              strokeWidth={1.5}
              strokeDasharray="6 5"
            />
            <path
              d={angleArc(
                scene.secondHit,
                scene.incident,
                scene.outgoing,
                DEVIATION_ARC,
              )}
              className="fill-none stroke-info"
              strokeWidth={1.5}
            />
          </>
        ) : null}

        {/* Kolm lõiku: sisse, peeglite vahel, välja. Üks ja sama valgus. */}
        <g
          className="fill-none stroke-brand"
          strokeWidth={2.5}
          markerMid={`url(#${ARROW_LIGHT})`}
        >
          <path d={rayPath(scene.incidentStart, scene.firstHit, INCIDENT_ARROW_AT)} />
          <path d={rayPath(scene.firstHit, scene.secondHit, MIDDLE_ARROW_AT)} />
          <path d={rayPath(scene.secondHit, scene.outgoingEnd, OUTGOING_ARROW_AT)} />
        </g>

        {/* Ristsirged mõlemas langemispunktis: katkendjoon, sest see ei ole
            valguskiir, vaid abijoon. Kumbki ulatub peegli mõlemale poole. */}
        <Normal at={scene.firstHit} direction={scene.firstNormal} />
        <Normal at={scene.secondHit} direction={scene.secondNormal} />

        {/* Nurgakaared: mõlemal peeglil langemisnurk ja peegeldumisnurk
            ristsirge kahel pool. */}
        <g className="fill-none stroke-brand" strokeWidth={1.5}>
          <path
            d={angleArc(
              scene.firstHit,
              opposite(scene.incident),
              scene.firstNormal,
              firstInnerRadius,
            )}
          />
          <path
            d={angleArc(
              scene.firstHit,
              scene.firstNormal,
              scene.middle,
              firstOuterRadius,
            )}
          />
          <path
            d={angleArc(
              scene.secondHit,
              opposite(scene.middle),
              scene.secondNormal,
              secondInnerRadius,
            )}
          />
          <path
            d={angleArc(
              scene.secondHit,
              scene.secondNormal,
              scene.outgoing,
              secondOuterRadius,
            )}
          />
        </g>

        <HitPoint at={scene.firstHit} label="P₁" />
        <HitPoint at={scene.secondHit} label="P₂" />

        {/* Sildid kõige viimasena ja valge äärisega (`paint-order: stroke`):
            kiir möödub neist mõne seisu juures napilt ja jookseks muidu neist
            läbi. Nii jääb number loetavaks ja kiir näib mööduvat tagant. */}
        <g className="stroke-white" strokeWidth={4} paintOrder="stroke">
          {showVertexLabel ? (
            <text
              x={vertexLabel.x}
              y={vertexLabel.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-ink"
              fontSize={14}
              fontWeight={600}
            >
              {deg(mirrorAngleDeg)}°
            </text>
          ) : null}
          {showFirstLabels ? (
            <g
              className="fill-brand"
              fontSize={13}
              fontWeight={600}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              <text x={firstIncidenceLabel.x} y={firstIncidenceLabel.y}>
                {deg(firstDeg)}°
              </text>
              <text x={firstReflectionLabel.x} y={firstReflectionLabel.y}>
                {deg(firstDeg)}°
              </text>
            </g>
          ) : null}
          {showSecondLabels ? (
            <g
              className="fill-brand"
              fontSize={13}
              fontWeight={600}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              <text x={secondIncidenceLabel.x} y={secondIncidenceLabel.y}>
                {deg(secondDeg)}°
              </text>
              <text x={secondReflectionLabel.x} y={secondReflectionLabel.y}>
                {deg(secondDeg)}°
              </text>
            </g>
          ) : null}
          {deviationVisible ? (
            <text
              x={deviationLabel.x}
              y={deviationLabel.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-info"
              fontSize={13}
              fontWeight={600}
            >
              {deg(path.deviationDeg)}°
            </text>
          ) : null}
          <text
            x={VIEW.width - 8}
            y={VIEW.height - 8}
            textAnchor="end"
            className="fill-ink-soft"
            fontSize={11}
          >
            viirutatud pool on peegli tagakülg
          </text>
        </g>
      </svg>

      {/* Samad arvud sõnadega ka joonise all: projektorilt ei loe kaugelt istuv
          õpilane 13-pikslist silti ja kitsas seisus jääb mõni silt jooniselt
          hoopis välja. Telefonis (360 px) on kaardid üksteise all, sm-ist
          alates kahes veerus. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Readout label="Peeglite nurk θ" value={`${deg(mirrorAngleDeg)}°`} />
        <Readout
          label="Peeglil 1: langemisnurk · peegeldumisnurk"
          value={`${deg(firstDeg)}° · ${deg(firstDeg)}°`}
          tone="ray"
        />
        <Readout
          label="Peeglil 2: langemisnurk · peegeldumisnurk"
          value={`${deg(secondDeg)}° · ${deg(secondDeg)}°`}
          tone="ray"
        />
        <Readout
          label="Kokku"
          value={`${deg(firstDeg)}° + ${deg(secondDeg)}° = ${deg(mirrorAngleDeg)}°`}
          note="täpselt peeglite nurk"
        />
        {deviationVisible ? (
          <Readout
            label="Pööre"
            value={`2 · ${deg(mirrorAngleDeg)}° = ${deg(path.deviationDeg)}°`}
            tone="deviation"
          />
        ) : null}
      </div>

      <SliderField
        id={mirrorSliderId}
        label="Peeglite nurk θ"
        value={mirrorAngleDeg}
        min={MIN_MIRROR_DEG}
        max={MAX_MIRROR_DEG}
        step={ANGLE_STEP_DEG}
        onChange={(event) => {
          const next = clampAngle(
            event.target.value,
            MIN_MIRROR_DEG,
            MAX_MIRROR_DEG,
            DEFAULT_MIRROR_DEG,
          );
          setMirrorAngleDeg(next);
          // Kitsam kiil jätab langemisnurgale vähem ruumi – liuguri ülemine
          // ots liigub kaasa, seega peab ka väärtus kaasa tulema.
          setIncidenceDeg((current) => Math.min(current, maxIncidenceDeg(next)));
        }}
        valueText={`${mirrorAngleDeg}°`}
        ariaValueText={`${mirrorAngleDeg} kraadi`}
        minLabel={`${MIN_MIRROR_DEG}°`}
        maxLabel={`${MAX_MIRROR_DEG}°`}
      />

      <div className="flex flex-col gap-2">
        <SliderField
          id={incidenceSliderId}
          label="Langemisnurk esimesel peeglil α"
          value={incidence}
          min={MIN_INCIDENCE_DEG}
          max={maxIncidence}
          step={ANGLE_STEP_DEG}
          onChange={(event) =>
            setIncidenceDeg(
              clampAngle(
                event.target.value,
                MIN_INCIDENCE_DEG,
                maxIncidence,
                DEFAULT_INCIDENCE_DEG,
              ),
            )
          }
          valueText={`${incidence}°`}
          ariaValueText={`${incidence} kraadi`}
          minLabel={`${MIN_INCIDENCE_DEG}°`}
          maxLabel={`${deg(maxIncidence)}°`}
        />
        <p className="text-base leading-relaxed text-ink-soft">
          Kui langemisnurk läheb liiga suureks, ei jõua kiir kahe peegeldusega
          välja – ta põrkaks peeglite vahel edasi. Seepärast liugur nii kaugele
          ei ulatugi ja tema ots liigub peeglite nurgaga kaasa.
        </p>
      </div>

      {deviationAvailable ? (
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base text-ink">
            <input
              id={deviationToggleId}
              type="checkbox"
              checked={showDeviation}
              onChange={(event) => setShowDeviation(event.target.checked)}
              className="size-5 shrink-0 accent-[var(--color-brand)]"
            />
            Näita pöörde nurka
          </label>
          {deviationVisible ? (
            <p className="text-base leading-relaxed text-ink-soft">
              Katkendlik joon näitab, kuhu kiir oleks läinud, kui peegleid ees ei
              oleks olnud. Tema ja väljuva kiire vaheline nurk ongi pööre.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => {
            setMirrorAngleDeg(DEFAULT_MIRROR_DEG);
            setIncidenceDeg(DEFAULT_INCIDENCE_DEG);
            setShowDeviation(false);
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
 * vaade ei tohi talle midagi kahtlast anda. `<input type="range">` hoiab piire
 * ise, aga see rida maksab vähem kui valge ekraan.
 */
function clampAngle(value: string, min: number, max: number, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

/**
 * Peegel: paks joon ja viirutus TAGUMISEL küljel.
 *
 * Kumb pool peegeldab, on joonisel nähtav ilma värvita – viirutus on kuju, mitte
 * toon (DISAINIJUHIS: värv ei ole kunagi ainus info kandja). Sama komponent on
 * figures.tsx-is, ainult et seal on peegli pikkus ette antud ja siin lõpp-punkt:
 * mõõtkava muutub liuguritega, seega on lõpp-punkt juba välja arvutatud.
 */
function Mirror({ from, to, backSide }: { from: Point; to: Point; backSide: Point }) {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  const direction = normalize({ x: to.x - from.x, y: to.y - from.y });
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
          const foot = along(from, direction, distance);
          // Kriips kaldub tahapoole ja natuke edasi – nii on ta tavaline
          // tehnilise joonise viirutus, mitte peegliga risti olev ripsmerida.
          const tip = along(
            along(foot, backSide, HATCH_LENGTH_PX),
            direction,
            HATCH_LENGTH_PX * 0.6,
          );
          return <line key={distance} x1={foot.x} y1={foot.y} x2={tip.x} y2={tip.y} />;
        })}
      </g>
    </>
  );
}

/** Ristsirge: katkendjoon peegli mõlemal pool, sest see ei ole valguskiir. */
function Normal({ at, direction }: { at: Point; direction: Point }) {
  const front = along(at, direction, NORMAL_LENGTH);
  const back = along(at, opposite(direction), NORMAL_LENGTH * 0.25);
  return (
    <line
      x1={back.x}
      y1={back.y}
      x2={front.x}
      y2={front.y}
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
        y={at.y + 15}
        className="fill-ink"
        fontSize={12}
        fontWeight={600}
        stroke="none"
      >
        {label}
      </text>
    </>
  );
}

/** Üks näit suurelt. Värv kordab joonise värvi, aga info kannab SILT. */
function Readout({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "ray" | "deviation";
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-line p-3">
      <div className="flex items-center gap-2">
        {tone ? (
          <span
            aria-hidden="true"
            className={`h-1 w-5 shrink-0 rounded-full ${
              tone === "ray" ? "bg-brand" : "bg-info"
            }`}
          />
        ) : null}
        <span className="text-sm font-medium text-ink-soft">{label}</span>
      </div>
      <p className="text-2xl font-semibold tabular-nums text-ink">{value}</p>
      {note ? <p className="text-sm text-ink-soft">{note}</p> : null}
    </div>
  );
}
