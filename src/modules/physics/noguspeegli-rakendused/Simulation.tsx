import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { SimulationProps } from "../../../engine/simulationFeatures";
import { Button } from "../../../ui/Button";
import { SliderField } from "../../../ui/SliderField";
import { formatNumber } from "../../../lib/format";
import {
  MIRROR_DIAMETER_CM,
  SLIDERS,
  WALL_DISTANCE_M,
  beamDiameter,
  centimetresFromMetres,
  focalLength,
  metresFromCentimetres,
  metresFromMillimetres,
} from "./model";

/**
 * Nõguspeegli rakenduste simulatsioon – ainult VAADE
 * (sisu/MOODUL-noguspeegli-rakendused.md, samm „explore";
 * docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Siin ei ole ühtegi füüsikavalemit: fookuskaugus ja mõlema vihu laius tulevad
 * `model.ts`-ist (CLAUDE.md reegel 1). Selles failis on ainult PAIGUTUS –
 * meetrite skaleerimine piksliteks, peegli kaare kuju ja siltide kohad.
 *
 * VAADE ON KÜLJELT prožektorile, nagu ütleb ka explore-sammu tekst („vaade on
 * KÜLJELT"): peegel vasakul, sein paremal.
 *
 * KAKS MÕÕTKAVA, KAKS VÖÖNDIT – ja see on selle simulatsiooni ainus tõsine
 * otsus. Moodulis on korraga kolm suurusjärku: sein on 20 m kaugusel, peegel on
 * 10 cm lai ja pirn 2 mm suur. Ühe mõõtkavaga pilti neist teha EI SAA: kui
 * 20 m mahub ekraanile, on peegel poole piksli laiune täpp, ja kui peegel on
 * nähtav, jääb sein kilomeetri kaugusele. Seepärast on joonisel kaks vööndit,
 * mõlemal oma mõõtkava ja mõlemal see mõõtkava ka VÄLJA ÖELDUD (mõõtkava riba
 * „10 cm" ülal ja „1 m" all):
 *
 * 1. ÜLEMINE („prožektor lähedalt", 1 cm = 3 px) – peegel, peatelg, fookus ja
 *    pirn. Siin on näha, mida teeb raadiuse liugur: fookus liigub peeglist
 *    kaugemale ja pirn liigub temaga kaasa.
 * 2. ALUMINE („peeglist seinani") – kaks vihku peeglist seinani. Siin on näha,
 *    mida teeb pirni liugur. Pikkus ja laius on siin vööndis MEELEGA eri
 *    mõõtkavas (20 m pikkuses on kokku surutud, meetrid laiuses lahti
 *    venitatud), muidu ei näeks 0,5 m laiust vihku 20 m pikkuse kõrval üldse.
 *
 * MÕLEMA VÖÖNDI MÕÕTKAVA ON PÜSIV. Kiusatus oleks laiuse mõõtkava vihu järgi
 * kohandada, aga siis jääks vihk ekraanil iga liuguriseisu juures ühesuurune ja
 * kaoks kogu explore-sammu avastus (sama otsus ja sama põhjus mis moodulites
 * `noguspeegel` ja `kumerpeegli-rakendused`). Laiuse mõõtkava on valitud kõige
 * laiema vihu järgi, mis liuguritega saavutatav on: R = 20 cm ja pirn 20 mm
 * annavad seinal 4,1 m ehk 82 px peateljest – see mahub kaadrisse ära, seega
 * ükski vihk ei jää poolikuks.
 *
 * PEEGLI KAAR ON VÕIMENDAMATA ja tuleb kera enda parametriseeringust (punkt
 * nurga θ juures on kera keskpunktist R kaugusel), mitte käsitsi sobitatud
 * Bézier'st – täpselt nagu mooduli teooriajoonisel (figures.tsx). Lamedam
 * peegel paistabki peaaegu sirge: see on aus pilt, sest just seda mooduli
 * kolmas ülesanne küsib.
 *
 * PIRN ON JOONISEL SUURENDATUD ja see on ekraanil kirjas. 2 mm oleks ülemises
 * vööndis 0,6 px ehk õhem kui joon, millega ta joonistatakse. Tema suurus on
 * seepärast ARVUNA – nii liuguri juures kui ka pirni enda sildis – ja tema
 * tagajärg on näha alumises vööndis vihu laiusena. Kasvava täpi joonistamine
 * väidaks mõõtkava, mida siin ei ole.
 *
 * ÜHIKUD: mudel arvutab meetrites, liugurid ja ekraan räägivad peegli mõõtudest
 * sentimeetrites, pirni suurusest millimeetrites ja vihu laiusest meetrites.
 * Ühik muutub AINULT mudeli teisendusfunktsioonides (`metresFromCentimetres`,
 * `metresFromMillimetres`, `centimetresFromMetres`); pikslid tulevad meetritest
 * kummagi vööndi oma teguri kaudu.
 *
 * SIMULATSIOONIL EI OLE LISAVÕIMALUSI: muudetavaid suurusi on kaks (peegli
 * kõverusraadius ja pirni suurus) ehk täpselt nii palju, kui moodulileping
 * korraga lubab, seega ei ole explore-sammul `simulation.unlocks` kirjet ega
 * sellel failil `unlockedFeatures`-ist midagi otsida.
 */

// --- Paigutus (SVG kasutajaühikud, y kasvab ALLA) --------------------------

const VIEW = { width: 360, height: 344 };

/** Peegli tipp: peatelje ja peegli lõikepunkt, kust kõiki kaugusi mõõdetakse. */
const VERTEX_X = 34;

// --- Ülemine vöönd: prožektor lähedalt --------------------------------------

/**
 * Lähivaate mõõtkava: 1 m = 300 px ehk 1 cm = 3 px.
 *
 * Valitud kõige kaugema fookuse järgi, mis liuguriga saavutatav on: R = 60 cm
 * annab fookuse 30 cm ehk 90 px kaugusele tipust (x = 124), mille juurde mahub
 * silt „pirn … on alati fookuses" veel kaadrisse ära.
 */
const CLOSEUP_PX_PER_METRE = 300;

const CLOSEUP_AXIS_Y = 62;
/** Fookuse mõõdujoon peegli ALL – kiirte ega peegli ees ta ei ole. */
const CLOSEUP_MEASURE_Y = 92;
const CLOSEUP_SCALE_Y = 108;
const MEASURE_TICK = 5;

/** Vööndite vaheline joon: kaks mõõtkava ei tohi kokku sulada. */
const DIVIDER_Y = 124;

// --- Alumine vöönd: peeglist seinani ----------------------------------------

const BEAM_AXIS_Y = 240;
const WALL_X = 296;
/** Mõõdujoon käib seinast PAREMALE – seal ei ole vihkude ees. */
const BEAM_MEASURE_X = 304;
const BEAM_LABEL_X = 310;

/**
 * Laiuse mõõtkava alumises vööndis: 1 m = 40 px.
 *
 * Kõige laiem vihk (R = 20 cm, pirn 20 mm) on seinal 4,1 m ehk peateljest
 * 82 px – kaadri ülemine serv on 86 px kaugusel, seega ta mahub ära.
 */
const BEAM_PX_PER_METRE = 40;

/** Pikkuse mõõtkava alumises vööndis: 20 m peeglist seinani. */
const BEAM_PX_PER_METRE_X = (WALL_X - VERTEX_X) / WALL_DISTANCE_M;

/** Kaugusejaotus peateljel: iga viies meeter. */
const DISTANCE_TICKS_M = [5, 10, 15];

/** Laiuse mõõtkava riba: üks meeter, peeglist vasakul, kus vihke ei ole. */
const BEAM_SCALE_X = 16;

// --- Mudeli püsivad suurused ------------------------------------------------

const MIRROR_DIAMETER_M = metresFromCentimetres(MIRROR_DIAMETER_CM);
/** Peegli poolläbimõõt – ainult joonise asi, mudel poolt ei tunne. */
const MIRROR_HALF_M = MIRROR_DIAMETER_M / 2;

const DEFAULT_RADIUS_CM: number = SLIDERS.radiusCm.min;
const DEFAULT_SOURCE_MM = 2;

/** Mitmest tükist peegli kaar kokku pannakse (sama arv mis figures.tsx-is). */
const ARC_STEPS = 24;

type Point = { x: number; y: number };

/**
 * Peegli punkt nurga θ juures: kera keskpunkt on peegli EES kaugusel R, seega
 * on pinnapunkt temast R kaugusel suunas, mis moodustab peateljega nurga θ.
 *
 * Siin ei ole ühtegi kaarevalemit – on kera enda definitsioon, sama mis mooduli
 * teooriajoonisel.
 */
function mirrorPoint(radiusM: number, angleRad: number): Point {
  const radiusPx = radiusM * CLOSEUP_PX_PER_METRE;
  return {
    x: VERTEX_X + radiusPx * (1 - Math.cos(angleRad)),
    y: CLOSEUP_AXIS_Y - radiusPx * Math.sin(angleRad),
  };
}

/**
 * Peegli kaar murdjoonena.
 *
 * Poolnurk tuleb peegli ENDA läbimõõdust (sin θ = a / R), mitte ilusast
 * ümmargusest arvust: peegli läbimõõt on kogu aeg 10 cm ja ainult nii jääb ta
 * ekraanil iga raadiuse juures täpselt sama kõrgeks. Muutub ainult sügavus –
 * see ongi see, mida raadiuse liugur teeb.
 */
function mirrorArcPath(radiusM: number): string {
  const halfAngle = Math.asin(MIRROR_HALF_M / radiusM);
  return Array.from({ length: ARC_STEPS + 1 }, (_, index) =>
    mirrorPoint(radiusM, halfAngle * (1 - (2 * index) / ARC_STEPS)),
  )
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

/** Vihu poollaius pikslites kaugusel `distanceM` – lineaarne lehvik. */
function halfWidthPx(wallWidthM: number, distanceM: number): number {
  const shareOfWay = distanceM / WALL_DISTANCE_M;
  const halfM =
    MIRROR_HALF_M + (wallWidthM / 2 - MIRROR_HALF_M) * shareOfWay;
  return halfM * BEAM_PX_PER_METRE;
}

/** Ühe vihu neli nurgapunkti: peegli servad ja valgusringi servad seinal. */
function beamPoints(wallWidthM: number): string {
  const startPx = halfWidthPx(wallWidthM, 0);
  const endPx = halfWidthPx(wallWidthM, WALL_DISTANCE_M);
  return [
    { x: VERTEX_X, y: BEAM_AXIS_Y - startPx },
    { x: WALL_X, y: BEAM_AXIS_Y - endPx },
    { x: WALL_X, y: BEAM_AXIS_Y + endPx },
    { x: VERTEX_X, y: BEAM_AXIS_Y + startPx },
  ]
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
}

/**
 * Laius ekraanile: KAKS kohta peale koma.
 *
 * Sama otsus ja sama põhjus mis activities.ts-is: explore-3 lõpeb 0,23 m juures
 * ja explore-4 0,17 m juures ning ühe kohaga oleksid mõlemad ekraanil „0,2 m".
 * Siis ei saaks õpilane kolmandat ülesannet neljandast eristada ega neljandat
 * üldse lahendada.
 */
const width = (valueM: number): string => formatNumber(valueM, 2);

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- ühine signatuur (ModulePage annab prop alati kaasa), moodulil ei ole unlock-i.
export function Simulation(_props: Partial<SimulationProps> = {}) {
  const [radiusCm, setRadiusCm] = useState(DEFAULT_RADIUS_CM);
  const [sourceSizeMm, setSourceSizeMm] = useState(DEFAULT_SOURCE_MM);
  const radiusSliderId = useId();
  const sourceSliderId = useId();

  // Ainus tee mudelisse: liuguri cm ja mm → m. Ükski allpool olev rida ei tohi
  // anda valemisse sentimeetreid ega millimeetreid.
  const radiusM = metresFromCentimetres(radiusCm);
  const sourceSizeM = metresFromMillimetres(sourceSizeMm);

  const focalLengthM = focalLength(radiusM);
  const beamWidthM = beamDiameter(
    MIRROR_DIAMETER_M,
    focalLengthM,
    sourceSizeM,
    WALL_DISTANCE_M,
  );
  // Ideaalne punktallikas: sama seis, aga s = 0. Mudel lubab nulli meelega –
  // vihk jääb siis igal kaugusel peegli laiuseks ja just see vahe ongi mooduli
  // „hind". Peegli läbimõõtu siia EI kirjutata käsitsi: ka see arv tuleb
  // valemist.
  const idealWidthM = beamDiameter(
    MIRROR_DIAMETER_M,
    focalLengthM,
    0,
    WALL_DISTANCE_M,
  );

  const focusX = VERTEX_X + focalLengthM * CLOSEUP_PX_PER_METRE;
  const mirrorHalfPx = MIRROR_HALF_M * CLOSEUP_PX_PER_METRE;
  const beamHalfPx = halfWidthPx(beamWidthM, WALL_DISTANCE_M);
  const idealHalfPx = halfWidthPx(idealWidthM, WALL_DISTANCE_M);

  const reset = () => {
    setRadiusCm(DEFAULT_RADIUS_CM);
    setSourceSizeMm(DEFAULT_SOURCE_MM);
  };

  return (
    <div className="flex flex-col gap-5">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        // Kirjeldus ei korda liugurite arve (siis loeks ekraanilugeja iga
        // millimeetri juures terve lause uuesti ette) – arvud on kastikestes
        // joonise all. Ta ütleb, MIS pildil on ja mis on kahe vihu vahe, sest
        // just see vahe on kogu samm.
        aria-label={`Külgvaade prožektorile, kahes vööndis. Ülemine vöönd näitab prožektorit lähedalt: vasakul on nõgus peegel läbimõõduga ${formatNumber(MIRROR_DIAMETER_CM)} sentimeetrit, temast paremale jookseb katkendlik peatelg ning peatelje peal on märgitud fookus ja seal asuv pirn. Mõõdujoon peegli tipust fookuseni näitab fookuskaugust. Alumine vöönd näitab teed peeglist seinani ${formatNumber(WALL_DISTANCE_M)} meetri kaugusel. Peeglilt lähtub kaks vihku: päris vihk, mis läheb kaugusega laiemaks, ja õhem ideaalne vihk, mis jääb kogu tee peegli laiuseks. Seinal on valgusring, mille laius on kirjas mõõdujoone juures ja kastikestes joonise all.`}
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* ---- Ülemine vöönd: prožektor lähedalt ---- */}
        <text x={8} y={16} className="fill-ink" fontSize={12} fontWeight={600}>
          prožektor lähedalt
        </text>

        {/* Peatelg – katkendjoon, sest ta ei ole valguskiir, vaid abijoon */}
        <line
          x1={VERTEX_X}
          y1={CLOSEUP_AXIS_Y}
          x2={VIEW.width - 8}
          y2={CLOSEUP_AXIS_Y}
          className="stroke-ink-soft"
          strokeWidth={1}
          strokeDasharray="4 4"
        />

        {/* Peegel: kaare kuju tuleb kera parametriseeringust, mitte Bézier'st.
            Tipp on x = VERTEX_X ja servad temast paremal – nii on nõgus peegel
            küljelt vaadates, kui ta valgust paremale saadab. */}
        <path
          d={mirrorArcPath(radiusM)}
          className="fill-none stroke-ink"
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Pirn fookuses. Ta on joonisel SUURENDATUD (vt faili päist), seega on
            tema suurus arvuna sildis, mitte täpi läbimõõdus. */}
        <circle
          cx={focusX}
          cy={CLOSEUP_AXIS_Y}
          r={5}
          className="fill-teacher stroke-ink"
          strokeWidth={1.5}
        />

        {/* Fookuse mõõdujoon tipust fookuseni, peegli all. */}
        <g className="stroke-ink-soft" strokeWidth={1.5}>
          <line
            x1={VERTEX_X}
            y1={CLOSEUP_MEASURE_Y}
            x2={focusX}
            y2={CLOSEUP_MEASURE_Y}
          />
          <line
            x1={VERTEX_X}
            y1={CLOSEUP_MEASURE_Y - MEASURE_TICK}
            x2={VERTEX_X}
            y2={CLOSEUP_MEASURE_Y + MEASURE_TICK}
          />
          <line
            x1={focusX}
            y1={CLOSEUP_MEASURE_Y - MEASURE_TICK}
            x2={focusX}
            y2={CLOSEUP_MEASURE_Y + MEASURE_TICK}
          />
        </g>

        {/* Mõõtkava riba: 10 cm ehk täpselt peegli läbimõõt. Ta on paremal, kus
            ei peegel ega fookus kunagi ei käi. */}
        <g className="stroke-ink-soft" strokeWidth={1.5}>
          <line
            x1={VIEW.width - 40 - MIRROR_DIAMETER_M * CLOSEUP_PX_PER_METRE}
            y1={CLOSEUP_SCALE_Y}
            x2={VIEW.width - 40}
            y2={CLOSEUP_SCALE_Y}
          />
          <line
            x1={VIEW.width - 40 - MIRROR_DIAMETER_M * CLOSEUP_PX_PER_METRE}
            y1={CLOSEUP_SCALE_Y - 4}
            x2={VIEW.width - 40 - MIRROR_DIAMETER_M * CLOSEUP_PX_PER_METRE}
            y2={CLOSEUP_SCALE_Y + 4}
          />
          <line
            x1={VIEW.width - 40}
            y1={CLOSEUP_SCALE_Y - 4}
            x2={VIEW.width - 40}
            y2={CLOSEUP_SCALE_Y + 4}
          />
        </g>

        {/* Vööndite vaheline joon: siit edasi on teine mõõtkava. */}
        <line
          x1={8}
          y1={DIVIDER_Y}
          x2={VIEW.width - 8}
          y2={DIVIDER_Y}
          className="stroke-line"
          strokeWidth={1}
        />

        {/* ---- Alumine vöönd: peeglist seinani ---- */}
        <text x={8} y={142} className="fill-ink" fontSize={12} fontWeight={600}>
          peeglist seinani
        </text>

        {/* Päris vihk on laiem, seega tema alla; ideaalne peale. Mõlemad on
            eristatud NII värvi kui ka joonemustriga (DISAINIJUHIS: värv ei ole
            kunagi ainus info kandja). Klassinimed on tervikuna välja
            kirjutatud, mitte stringidest kokku pandud: Tailwind loeb lähtekoodi
            tekstina ja `stroke-${tone}` kaoks stiililehelt vaikselt ära. */}
        <polygon
          points={beamPoints(beamWidthM)}
          className="fill-brand"
          fillOpacity={0.14}
        />
        <g className="stroke-brand" strokeWidth={1.5} strokeDasharray="6 4">
          <line
            x1={VERTEX_X}
            y1={BEAM_AXIS_Y - halfWidthPx(beamWidthM, 0)}
            x2={WALL_X}
            y2={BEAM_AXIS_Y - beamHalfPx}
          />
          <line
            x1={VERTEX_X}
            y1={BEAM_AXIS_Y + halfWidthPx(beamWidthM, 0)}
            x2={WALL_X}
            y2={BEAM_AXIS_Y + beamHalfPx}
          />
        </g>
        <polygon
          points={beamPoints(idealWidthM)}
          className="fill-info"
          fillOpacity={0.16}
        />
        <g className="stroke-info" strokeWidth={1.5} strokeDasharray="2 3">
          <line
            x1={VERTEX_X}
            y1={BEAM_AXIS_Y - idealHalfPx}
            x2={WALL_X}
            y2={BEAM_AXIS_Y - idealHalfPx}
          />
          <line
            x1={VERTEX_X}
            y1={BEAM_AXIS_Y + idealHalfPx}
            x2={WALL_X}
            y2={BEAM_AXIS_Y + idealHalfPx}
          />
        </g>

        {/* Peatelg ja kaugusejaotus: iga viies meeter. Jaotus ei sõltu
            liugurist, sest mõõtkava on püsiv. */}
        <line
          x1={VERTEX_X}
          y1={BEAM_AXIS_Y}
          x2={WALL_X}
          y2={BEAM_AXIS_Y}
          className="stroke-ink-soft"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <g className="stroke-ink-soft" strokeWidth={1}>
          {DISTANCE_TICKS_M.map((metres) => {
            const x = VERTEX_X + metres * BEAM_PX_PER_METRE_X;
            return (
              <line
                key={metres}
                x1={x}
                y1={BEAM_AXIS_Y - 4}
                x2={x}
                y2={BEAM_AXIS_Y + 4}
              />
            );
          })}
        </g>

        {/* Peegel alumises vööndis: siin on ta ainult vihkude lähtekoht, seega
            lühike jäme joon, mitte kaar – tema kuju on ülemise vööndi asi. */}
        <line
          x1={VERTEX_X}
          y1={BEAM_AXIS_Y - MIRROR_HALF_M * BEAM_PX_PER_METRE}
          x2={VERTEX_X}
          y2={BEAM_AXIS_Y + MIRROR_HALF_M * BEAM_PX_PER_METRE}
          className="stroke-ink"
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Sein ja tema peal olev valgusring. */}
        <line
          x1={WALL_X}
          y1={DIVIDER_Y + 24}
          x2={WALL_X}
          y2={VIEW.height - 12}
          className="stroke-ink-soft"
          strokeWidth={2}
        />
        <ellipse
          cx={WALL_X}
          cy={BEAM_AXIS_Y}
          rx={3}
          ry={beamHalfPx}
          className="fill-brand"
          fillOpacity={0.5}
        />

        {/* Valgusringi mõõdujoon seinast paremal. */}
        <g className="stroke-brand" strokeWidth={2.5} strokeLinecap="round">
          <line
            x1={BEAM_MEASURE_X}
            y1={BEAM_AXIS_Y - beamHalfPx}
            x2={BEAM_MEASURE_X}
            y2={BEAM_AXIS_Y + beamHalfPx}
          />
          <line
            x1={BEAM_MEASURE_X - MEASURE_TICK}
            y1={BEAM_AXIS_Y - beamHalfPx}
            x2={BEAM_MEASURE_X + MEASURE_TICK}
            y2={BEAM_AXIS_Y - beamHalfPx}
          />
          <line
            x1={BEAM_MEASURE_X - MEASURE_TICK}
            y1={BEAM_AXIS_Y + beamHalfPx}
            x2={BEAM_MEASURE_X + MEASURE_TICK}
            y2={BEAM_AXIS_Y + beamHalfPx}
          />
        </g>

        {/* Laiuse mõõtkava riba: üks meeter. Peeglist vasakul, kus vihke ei
            ole – nii on kohe näha, et laius on teises mõõtkavas kui pikkus. */}
        <g className="stroke-ink-soft" strokeWidth={1.5}>
          <line
            x1={BEAM_SCALE_X}
            y1={BEAM_AXIS_Y - BEAM_PX_PER_METRE}
            x2={BEAM_SCALE_X}
            y2={BEAM_AXIS_Y}
          />
          <line
            x1={BEAM_SCALE_X - 4}
            y1={BEAM_AXIS_Y - BEAM_PX_PER_METRE}
            x2={BEAM_SCALE_X + 4}
            y2={BEAM_AXIS_Y - BEAM_PX_PER_METRE}
          />
          <line
            x1={BEAM_SCALE_X - 4}
            y1={BEAM_AXIS_Y}
            x2={BEAM_SCALE_X + 4}
            y2={BEAM_AXIS_Y}
          />
        </g>

        {/* Sildid kõige viimasena ja valge äärisega: vihkude servad mööduvad
            neist napilt ja jookseksid muidu neist läbi. */}
        <g className="stroke-white" strokeWidth={4} paintOrder="stroke">
          <text x={8} y={38} className="fill-ink-soft" fontSize={10}>
            peegel {formatNumber(MIRROR_DIAMETER_CM)} cm
          </text>
          <text
            x={focusX}
            y={CLOSEUP_AXIS_Y - mirrorHalfPx - 6}
            textAnchor="middle"
            className="fill-ink"
            fontSize={12}
            fontWeight={600}
          >
            F
          </text>
          <text
            x={focusX + 10}
            y={CLOSEUP_AXIS_Y - 12}
            className="fill-ink-soft"
            fontSize={10}
          >
            pirn {formatNumber(sourceSizeMm)} mm on alati fookuses
          </text>
          <text
            x={(VERTEX_X + focusX) / 2}
            y={CLOSEUP_MEASURE_Y + 16}
            textAnchor="middle"
            className="fill-ink"
            fontSize={11}
          >
            fookuskaugus {formatNumber(centimetresFromMetres(focalLengthM))} cm
          </text>
          <text
            x={VIEW.width - 36}
            y={CLOSEUP_SCALE_Y + 4}
            className="fill-ink-soft"
            fontSize={10}
          >
            10 cm
          </text>

          <text x={8} y={158} className="fill-ink-soft" fontSize={10}>
            pirn on joonisel suurendatud
          </text>
          <text
            x={BEAM_SCALE_X + 8}
            y={BEAM_AXIS_Y - BEAM_PX_PER_METRE + 10}
            className="fill-ink-soft"
            fontSize={10}
          >
            1 m
          </text>
          <text
            x={WALL_X - 6}
            y={VIEW.height - 12}
            textAnchor="end"
            className="fill-ink-soft"
            fontSize={11}
          >
            sein {formatNumber(WALL_DISTANCE_M)} m kaugusel
          </text>
          {/* Päris vihu arv käib mõõdujoonest ÜLESPOOLE ja ideaalse oma
              ALLAPOOLE. Kaks silti ei tohi kokku sattuda ka siis, kui vihud on
              peaaegu ühelaiused: kõige kitsam päris vihk (0,17 m) on ideaalsest
              (0,10 m) ekraanil ainult poolteist pikslit laiem, seega jäävad
              nad eri poolele peatelge, mitte üksteise kõrvale. */}
          <text
            x={BEAM_LABEL_X}
            y={BEAM_AXIS_Y - beamHalfPx - 20}
            className="fill-ink-soft"
            fontSize={10}
          >
            päris vihk
          </text>
          <text
            x={BEAM_LABEL_X}
            y={BEAM_AXIS_Y - beamHalfPx - 6}
            className="fill-ink"
            fontSize={13}
            fontWeight={600}
          >
            {width(beamWidthM)} m
          </text>
          <text
            x={BEAM_LABEL_X}
            y={BEAM_AXIS_Y + idealHalfPx + 16}
            className="fill-ink-soft"
            fontSize={10}
          >
            ideaalne
          </text>
          <text
            x={BEAM_LABEL_X}
            y={BEAM_AXIS_Y + idealHalfPx + 30}
            className="fill-ink-soft"
            fontSize={12}
          >
            {width(idealWidthM)} m
          </text>
        </g>
      </svg>

      <p className="text-base leading-relaxed text-ink-soft">
        Ülemine ja alumine vöönd on eri mõõtkavas: peegel on 10 cm, sein 20 m
        kaugusel. Ühe mõõtkavaga pildile need kaks korraga ei mahu.
      </p>

      {/* Numbrid suurelt ka joonise all: 13-pikslist silti ei loe projektorilt
          klassi tagant istuv õpilane. 360 px ekraanil lähevad kastid üksteise
          alla, mitte kõrvale. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Readout
          label="Fookuskaugus"
          value={`${formatNumber(centimetresFromMetres(focalLengthM))} cm`}
          tone="neutral"
        />
        <Readout
          label="Valgusring seinal"
          value={`${width(beamWidthM)} m`}
          tone="real"
        />
        <Readout
          label="Ideaalse punktallikaga oleks"
          value={`${width(idealWidthM)} m`}
          tone="ideal"
        />
      </div>

      <p className="text-base leading-relaxed text-ink-soft">
        Peegli läbimõõt on kogu aeg {formatNumber(MIRROR_DIAMETER_CM)} cm ja sein{" "}
        {formatNumber(WALL_DISTANCE_M)} m kaugusel – kumbki liuguriga ei muutu.
        Pirn on alati fookuses.
      </p>

      <SliderField
        id={radiusSliderId}
        label="Peegli kõverusraadius R"
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
        minLabel={`${SLIDERS.radiusCm.min} cm (sügavam)`}
        maxLabel={`${SLIDERS.radiusCm.max} cm (lamedam)`}
      />

      <SliderField
        id={sourceSliderId}
        label="Pirni suurus s"
        value={sourceSizeMm}
        min={SLIDERS.sourceSizeMm.min}
        max={SLIDERS.sourceSizeMm.max}
        step={SLIDERS.sourceSizeMm.step}
        onChange={(event) =>
          setSourceSizeMm(clamp(event.target.value, SLIDERS.sourceSizeMm, DEFAULT_SOURCE_MM))
        }
        valueText={`${sourceSizeMm} mm`}
        ariaValueText={`${sourceSizeMm} millimeetrit`}
        minLabel={`${SLIDERS.sourceSizeMm.min} mm (LED-kiip)`}
        maxLabel={`${SLIDERS.sourceSizeMm.max} mm (suur hõõgniit)`}
      />

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
  tone: "real" | "ideal" | "neutral";
}) {
  const stripe =
    tone === "real" ? "bg-brand" : tone === "ideal" ? "bg-info" : "bg-ink-soft";
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3 sm:flex-col sm:items-start sm:gap-1">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className={`h-1 w-5 shrink-0 rounded-full ${stripe}`} />
        <span className="text-sm font-medium text-ink-soft">{label}</span>
      </div>
      <p className="text-xl font-semibold tabular-nums text-ink sm:text-2xl">{value}</p>
    </div>
  );
}
