import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { SimulationProps } from "../../../engine/simulationFeatures";
import { Button } from "../../../ui/Button";
import { formatNumber } from "../../../lib/format";
import {
  MIRROR_HALF_HEIGHT_CM,
  SLIDERS,
  centimetresFromMetres,
  focalLength,
  metresFromCentimetres,
  mirrorBulge,
  reflectParallelRay,
} from "./model";

/**
 * Kumerpeegli simulatsioon – ainult VAADE (sisu/MOODUL-kumerpeegel.md,
 * samm „explore"; docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Siin ei ole ühtegi füüsikavalemit: peegli kaar, kohtumispunktid, pikenduste
 * teljelõiked, näiline fookus ja mõlemad nurgad tulevad `model.ts`-ist
 * (CLAUDE.md reegel 1). Selles failis on ainult PAIGUTUS – meetrite
 * skaleerimine piksliteks, kaarte raadiused ja siltide kohad. Sama füüsika
 * toidab ka mooduli joonised (figures.tsx), seega ei saa joonis ja simulatsioon
 * kunagi eri asja näidata.
 *
 * SUUNAD on samad, mis kõigil kolmel joonisel: valgus tuleb PAREMALT, peegli
 * tipp kummub valguse poole ehk paremale, ja kera keskpunkt C ning näiline
 * fookus jäävad peeglist VASAKULE. Nii on teooriajoonis (`kp-ristsirge`) ja see
 * ekraan sama pidi – õpilane vaatab neid järjest.
 *
 * Nõguspeegli simulatsioonis on peegel joonise vasakus servas ja fookus temast
 * paremal. Siin on vastupidi ja see EI ole tujuküsimus: näiline fookus on
 * peegli TAGA, seega peab peegli taha jääma pool joonist (kuni 100 cm ehk 260
 * px). Mõõtkava on mõlemas moodulis sama (260 px/m), et kaks peeglit oleksid
 * kõrvuti võrreldavad.
 *
 * ÜHIKUD: mudel arvutab meetrites, liugurid ja ekraan räägivad sentimeetrites.
 * Ühik muutub AINULT `metresFromCentimetres` (liugur → mudel) ja
 * `centimetresFromMetres` (mudel → ekraan) sees; pikslid tulevad meetritest
 * `PX_PER_METRE` kaudu. Mõõtkava on MÕLEMAL teljel sama – muidu ei oleks
 * joonisel olevad nurgad enam päris nurgad, ja just neid siin loetakse.
 *
 * MÕÕTKAVA EI MUUTU raadiusega (sama otsus mis nõguspeeglil): ümberskaleerimine
 * jätaks näilise fookuse ekraanil alati samasse kohta ja kaoks kogu mooduli
 * avastus – mida lamedam peegel, seda kaugemal on näiline fookus. Kaugele jääv
 * kera keskpunkt jäetakse seepärast lihtsalt joonistamata
 * (sisu/MOODUL-kumerpeegel.md „explore": „kera keskpunkt C märgitud, kui ta
 * joonisele mahub").
 *
 * PEEGLI KAAR ON VÕIMENDAMATA. Lamedam peegel paistabki peaaegu sirge – see on
 * aus pilt, sest sama joonise pealt loetakse nurki.
 *
 * PIKENDUSTEL EI OLE NOOLEOTSI. Nooleots tähendab liikuvat valgust; peegli taha
 * ei jõua ükski kiir. See ei ole stiiliküsimus, vaid kogu mooduli mõte
 * (väärarusaam `nailine-fookus-on-paris-fookus`).
 *
 * `unlockedFeatures` tuleb explore-sammult (`ExploreStep` →
 * `unlockedSimulationFeatures`): SEE fail on ainus koht, mis teab, mida silt
 * „pikenduste-lyliti" tähendab (docs/ARHITEKTUUR.md „ui/ ei tohi teada
 * moodulitest").
 */

// --- Paigutus (SVG kasutajaühikud, y kasvab ALLA) --------------------------

const VIEW = { width: 400, height: 200 };
/**
 * Peegli tipp: peatelje ja peegli lõikepunkt, kust kõiki kaugusi mõõdetakse.
 *
 * Nii kaugel paremal seepärast, et temast VASAKULE peab mahtuma kõige kaugem
 * näiline fookus (R = 200 cm → 100 cm ehk 260 px) koos sildiga.
 */
const VERTEX_X = 300;
const AXIS_Y = 84;
/** Kust paralleelsed kiired joonisele tulevad (paremast servast). */
const RAY_START_X = 392;

/**
 * Mõõtkava: 1 m = 260 px ehk 1 cm = 2,6 px.
 *
 * Sama arv, mis nõguspeegli simulatsioonis – kaks kõverpeeglit on nii ühes
 * mõõdus. Kõige kaugem näiline fookus (R = 200 cm → 100 cm) jääb x = 40 peale
 * ehk mahub koos sildiga ära.
 */
const PX_PER_METRE = 260;

/** Peegli poolkõrgus – mudeli oma arv (turvavöönd, vt model.ts). */
const MIRROR_HALF_HEIGHT_M = MIRROR_HALF_HEIGHT_CM / 100;

/**
 * Nelja püsiva kiire kõrgused (m). Need EI sõltu liugurist: nemad näitavad
 * kimpu, mis hajub, ja jäävad paigale ka siis, kui valitud kiirt liigutada.
 */
const RAY_HEIGHTS_M = [
  MIRROR_HALF_HEIGHT_M,
  MIRROR_HALF_HEIGHT_M / 2,
  -MIRROR_HALF_HEIGHT_M / 2,
  -MIRROR_HALF_HEIGHT_M,
];

/**
 * Peegeldunud kiire pikkus joonisel.
 *
 * Kumerpeeglil lähevad peegeldunud kiired laiali ega kohtu kusagil, seega ei
 * ole neil loomulikku lõpp-punkti – nad lihtsalt lõpevad joonise serva lähedal.
 */
const REFLECTED_LENGTH = 84;

/** Mõõdujoon tipust näilise fookuseni – peegli ja kiirte kimbu ALL. */
const MEASURE_Y = 142;
const MEASURE_TICK = 6;
const MEASURE_LABEL_Y = 160;
const FOCUS_LABEL_Y = 178;
/** Sildi „näiline fookus" vähim keskkoht – vasakust servast välja ta ei lähe. */
const FOCUS_LABEL_MIN_X = 48;

const ARC_RADIUS = 30;
const ARC_LABEL_RADIUS = 46;
/**
 * Nurgasildi vähim kaugus ristsirgest.
 *
 * Selle mooduli nurgad on VÄIKESED (liuguri piirides α ≤ 11,5°), seega jääksid
 * α ja β kaare peal peaaegu kohakuti. Silte lükatakse ristsirgest eemale, aga
 * KAARED jäävad päris nurga peale – nihkub ainult number, mitte väide.
 */
const MIN_LABEL_GAP = 15;

/** Mitmest tükist kaar kokku pannakse (sama arv mis figures.tsx-is). */
const ARC_STEPS = 24;

/** Feature-silt, mida see fail explore-sammu `unlockedFeatures` seast otsib. */
const EXTENSIONS_FEATURE = "pikenduste-lyliti";

/** Nooleotste id-d – oma eesliide, et nad ei põrkaks jooniste omadega. */
const ARROW_INCIDENT = "kp-sim-arrow-incident";
const ARROW_REFLECTED = "kp-sim-arrow-reflected";

const DEFAULT_RADIUS_CM = 100;
// Tüüp `number`, mitte `10`: `SLIDERS` on `as const`, seega oleks liuguri
// algväärtus muidu KONSTANT ja `setHeightCm` ei võtaks vastu ühtegi teist arvu.
const DEFAULT_HEIGHT_CM: number = SLIDERS.rayHeightCm.max;

/** Pikenduste lüliti: kaks nimega olekut, mitte „linnuke" – õpilane loeb mõlemat. */
const EXTENSION_MODES = [
  { id: "kiired", label: "Ainult valguskiired" },
  { id: "pikendused", label: "Näita pikendusi peegli taga" },
] as const;
type ExtensionModeId = (typeof EXTENSION_MODES)[number]["id"];

type Point = { x: number; y: number };

/**
 * Peegli punkt kõrgusel h: kummumine tuleb mudelist, mitte kaarevalemist.
 *
 * Tipp on valgusele kõige lähem koht, seega nihkub iga teine punkt temast
 * TAHAPOOLE ehk joonisel vasakule.
 */
function mirrorPoint(radiusM: number, heightM: number): Point {
  return {
    x: VERTEX_X - mirrorBulge(radiusM, heightM) * PX_PER_METRE,
    y: AXIS_Y - heightM * PX_PER_METRE,
  };
}

/** Kus peegeldunud kiire pikendus peatelge lõikab – peegli taga (vasakul). */
function virtualCrossPoint(radiusM: number, heightM: number): Point {
  return {
    x: VERTEX_X - reflectParallelRay(radiusM, heightM).virtualCrossM * PX_PER_METRE,
    y: AXIS_Y,
  };
}

/**
 * Peegli kaar murdjoonena, iga punkt mudeli `mirrorBulge`-ist.
 *
 * Bézier'ga tehtud kaar näeks välja peaaegu samasugune, aga tema kuju ei
 * tuleks füüsikast – ja siis ei saaks kaare peal loetavad nurgad enam õiged
 * olla.
 */
function mirrorArcPath(radiusM: number): string {
  return Array.from({ length: ARC_STEPS * 2 + 1 }, (_, index) =>
    mirrorPoint(radiusM, MIRROR_HALF_HEIGHT_M * (index / ARC_STEPS - 1)),
  )
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

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
 * Kiir noolega: kolm punkti, et `marker-mid` saaks kuhugi kinnituda.
 *
 * Suunda siin ümber ei pöörata (nõguspeeglil oli suunalüliti, siin on
 * pikenduste lüliti) – kumerpeeglil käib valgus alati paremalt peeglile ja
 * sealt laiali tagasi.
 */
function rayPath(from: Point, to: Point, arrowAt: number): string {
  const arrow = {
    x: from.x + (to.x - from.x) * arrowAt,
    y: from.y + (to.y - from.y) * arrowAt,
  };
  return `M ${from.x} ${from.y} L ${arrow.x} ${arrow.y} L ${to.x} ${to.y}`;
}

/**
 * Nurgakaar suunast suunani. `sweep` 0 = ekraanil vastupäeva – peatelje KOHAL
 * olev kiir pöördub kumerpeeglil ristsirge poole just nii (nõguspeeglil oli ta
 * vastupidine, sest seal on kera keskpunkt teisel pool peeglit). Valitud kiire
 * kõrgus on liuguri järgi alati ≥ 0, seega teist suunda siin vaja ei ole.
 */
function angleArc(origin: Point, from: Point, to: Point): string {
  const start = along(origin, from, ARC_RADIUS);
  const end = along(origin, to, ARC_RADIUS);
  return `M ${start.x} ${start.y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 0 ${end.x} ${end.y}`;
}

/**
 * Nurgasildi koht: kaare keskel, aga vähemalt `MIN_LABEL_GAP` kaugusel
 * ristsirgest.
 *
 * `side` +1 on ristsirgest allpool (langemisnurk, sest langev kiir tuleb siin
 * peatelje poolt) ja −1 ülalpool (peegeldumisnurk, sest peegeldunud kiir läheb
 * teljest EEMALE). Nõguspeeglil on need pooled vastupidi – seal koondub
 * peegeldunud kiir telje poole. Väikeste nurkade juures satuksid sildid muidu
 * kohakuti.
 */
function angleLabelPoint(
  hit: Point,
  normal: Point,
  direction: Point,
  side: -1 | 1,
): Point {
  const point = along(hit, bisector(normal, direction), ARC_LABEL_RADIUS);
  // Ristsirge ristsuund ekraanil: n = (x, y) → (−y, x) osutab „allapoole".
  const across = { x: -normal.y, y: normal.x };
  const distance = (point.x - hit.x) * across.x + (point.y - hit.y) * across.y;
  const wanted = side * MIN_LABEL_GAP;
  const missing =
    side < 0 ? Math.min(0, wanted - distance) : Math.max(0, wanted - distance);
  return along(point, across, missing);
}

export function Simulation({
  unlockedFeatures = new Set(),
}: Partial<SimulationProps> = {}) {
  const [radiusCm, setRadiusCm] = useState(DEFAULT_RADIUS_CM);
  const [heightCm, setHeightCm] = useState(DEFAULT_HEIGHT_CM);
  const [modeId, setModeId] = useState<ExtensionModeId>("kiired");
  const radiusSliderId = useId();
  const heightSliderId = useId();

  // Pikenduste lüliti avaneb pärast ülesannet 3 – enne seda on korraga
  // muudetavaid suurusi kaks, mitte kolm (moodulileping), ja mis tähtsam:
  // pikendused tulevad ekraanile alles siis, kui õpilane on juba näinud, et
  // valgus läheb peeglilt laiali.
  const extensionsAvailable = unlockedFeatures.has(EXTENSIONS_FEATURE);
  const showExtensions = extensionsAvailable && modeId === "pikendused";

  // Ainus tee mudelisse: liuguri cm → m. Ükski allpool olev rida ei tohi
  // sentimeetreid valemisse anda.
  const radiusM = metresFromCentimetres(radiusCm);
  const heightM = metresFromCentimetres(heightCm);

  const focusM = focalLength(radiusM);
  const focusCm = centimetresFromMetres(focusM);
  const focusX = VERTEX_X - focusM * PX_PER_METRE;

  const selected = reflectParallelRay(radiusM, heightM);
  const hit = mirrorPoint(radiusM, heightM);
  const centre = { x: VERTEX_X - radiusM * PX_PER_METRE, y: AXIS_Y };
  const centreVisible = centre.x >= 16;

  // Ristsirge on kerapinnal RAADIUSE siht – kohtumispunktist kera keskpunkti,
  // mis on kumerpeeglil peegli TAGA. See on puhas geomeetria pikslites; ühtegi
  // nurka siin ei arvutata.
  const inward = unitVector(hit, centre);
  const normal = unitVector(centre, hit);
  const normalEnd = along(
    hit,
    inward,
    Math.min(Math.hypot(centre.x - hit.x, centre.y - hit.y), (hit.x - 8) / -inward.x),
  );

  const selectedCross = virtualCrossPoint(radiusM, heightM);

  // Peateljel levinud kiir (h = 0) tuleb peeglilt sama teed tagasi. Mudel annab
  // talle piirväärtuse R/2, aga joonis ei tohi väita PIKENDUST, mida seal ei
  // ole: peegeldunud kiir ise on peateljel ja tema „pikendus" langeks peateljega
  // kokku (vt model.ts `reflectParallelRay`). Nurgakaared kaovad samal põhjusel:
  // nurk ON null ja kaar oleks punkt. Arvud jäävad kastikestesse alles, seega
  // info ekraanilt ei kao.
  const straightBack = heightCm === 0;
  const incidentOut: Point = { x: 1, y: 0 };
  const reflectedOut = straightBack ? incidentOut : unitVector(selectedCross, hit);
  const reflectedEnd = along(hit, reflectedOut, REFLECTED_LENGTH);

  const reset = () => {
    setRadiusCm(DEFAULT_RADIUS_CM);
    setHeightCm(DEFAULT_HEIGHT_CM);
    setModeId("kiired");
  };

  return (
    <div className="flex flex-col gap-5">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        // Kirjeldus ei korda liuguri arve (siis loeks ekraanilugeja iga
        // sentimeetri juures terve lause uuesti ette) – arvud on kastikestes
        // joonise all. Pikendused aga muudavad pildi sisu, seega nad on siin.
        aria-label={
          showExtensions
            ? "Joonis: kumerpeegel külgvaates, tipp kummub paremale valguse poole, peatelg katkendjoonena. Paremalt tulevad peateljega paralleelsed kiired ja peegelduvad laiali. Nende katkendlikud pikendused jätkuvad peegli taha ja lõikuvad seal ühes punktis peateljel – näilises fookuses."
            : "Joonis: kumerpeegel külgvaates, tipp kummub paremale valguse poole, peatelg katkendjoonena. Paremalt tulevad peateljega paralleelsed kiired, peegelduvad peeglilt ja lähevad üksteisest eemale. Peegli taha ei jõua ükski kiir."
        }
        className="w-full rounded-2xl border border-line bg-white"
      >
        <defs>
          {/* `fill` on markeril otse küljes: marker ei päri värvi teda
              kasutavalt joonelt. */}
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

        {/* Peegli tagune ala heledama taustaga – kogu mooduli mõte on see vahe.
            Piir on tipu juures: peegli kaar jääb temast kuni 3 px võrra sisse
            (kummumine on liuguri piirides alla 1 cm). */}
        <rect
          x={0}
          y={0}
          width={VERTEX_X}
          height={VIEW.height}
          className="fill-line"
          fillOpacity={0.45}
        />

        {/* Peatelg – katkendjoon, sest ta ei ole valguskiir, vaid abijoon */}
        <line
          x1={8}
          y1={AXIS_Y}
          x2={VIEW.width - 8}
          y2={AXIS_Y}
          className="stroke-ink-soft"
          strokeWidth={1.5}
          strokeDasharray="7 5"
        />

        {/* Peegel: kaar mudeli järgi + viirutus tagumisel (läikimatul) poolel */}
        <path
          d={mirrorArcPath(radiusM)}
          className="fill-none stroke-ink"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <g className="stroke-ink-soft" strokeWidth={1.5} strokeLinecap="round">
          {Array.from({ length: 11 }, (_, index) =>
            mirrorPoint(radiusM, MIRROR_HALF_HEIGHT_M * (index / 5 - 1)),
          ).map((point) => {
            // Kumerpeeglil on läikiv pind kera VÄLIMISEL küljel, seega jääb
            // tagumine pool kera keskpunkti poole. Iga kriips kaldub sinnapoole.
            const end = along(point, unitVector(point, centre), 9);
            return (
              <line key={point.y} x1={point.x} y1={point.y} x2={end.x} y2={end.y} />
            );
          })}
        </g>

        {/* Neli püsivat kiirt: nemad näitavad, et kimp läheb laiali ja et kokku
            saavad ainult pikendused */}
        {RAY_HEIGHTS_M.map((rayHeightM) => {
          const rayHit = mirrorPoint(radiusM, rayHeightM);
          const cross = virtualCrossPoint(radiusM, rayHeightM);
          const rayEnd = along(rayHit, unitVector(cross, rayHit), REFLECTED_LENGTH);
          return (
            <g key={rayHeightM}>
              <path
                d={rayPath({ x: RAY_START_X, y: rayHit.y }, rayHit, 0.35)}
                className="fill-none stroke-brand/60"
                strokeWidth={2}
                markerMid={`url(#${ARROW_INCIDENT})`}
              />
              <path
                d={rayPath(rayHit, rayEnd, 0.6)}
                className="fill-none stroke-info/60"
                strokeWidth={2}
                markerMid={`url(#${ARROW_REFLECTED})`}
              />
              {showExtensions ? (
                <line
                  x1={rayHit.x}
                  y1={rayHit.y}
                  x2={cross.x}
                  y2={cross.y}
                  className="stroke-info/60"
                  strokeWidth={1.5}
                  strokeDasharray="6 5"
                />
              ) : null}
            </g>
          );
        })}

        {/* Ristsirge: katkendlik joon kohtumispunktist kera keskpunkti poole */}
        <line
          x1={hit.x}
          y1={hit.y}
          x2={normalEnd.x}
          y2={normalEnd.y}
          className="stroke-ink"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        {centreVisible ? (
          <>
            <circle cx={centre.x} cy={centre.y} r={3.5} className="fill-ink" />
            <text
              x={centre.x}
              y={AXIS_Y - MIRROR_HALF_HEIGHT_M * PX_PER_METRE - 10}
              // Kera keskpunkt jõuab suure raadiuse juures joonise vasaku
              // servani – seal algab silt punktist, mitte ei jää tema keskele.
              textAnchor={centre.x < 60 ? "start" : "middle"}
              className="fill-ink-soft"
              fontSize={12}
            >
              kera keskpunkt
            </text>
          </>
        ) : null}

        {/* Nurgakaared ristsirgest mõlema kiireni – päris nurga peal */}
        {straightBack ? null : (
          <>
            <path
              d={angleArc(hit, incidentOut, normal)}
              className="fill-none stroke-brand"
              strokeWidth={2}
            />
            <path
              d={angleArc(hit, normal, reflectedOut)}
              className="fill-none stroke-info"
              strokeWidth={2}
            />
          </>
        )}

        {/* Valitud kiir paksu joonega, kaarte peal */}
        <path
          d={rayPath({ x: RAY_START_X, y: hit.y }, hit, 0.2)}
          className="fill-none stroke-brand"
          strokeWidth={3.5}
          strokeLinecap="round"
          markerMid={`url(#${ARROW_INCIDENT})`}
        />
        <path
          d={rayPath(hit, reflectedEnd, 0.75)}
          className="fill-none stroke-info"
          strokeWidth={3.5}
          strokeLinecap="round"
          markerMid={`url(#${ARROW_REFLECTED})`}
        />
        {showExtensions && !straightBack ? (
          <line
            x1={hit.x}
            y1={hit.y}
            x2={selectedCross.x}
            y2={selectedCross.y}
            className="stroke-info"
            strokeWidth={2}
            strokeDasharray="6 5"
          />
        ) : null}
        <circle cx={hit.x} cy={hit.y} r={3.5} className="fill-ink" />

        {/* Näiline fookus: punkt teljel + mõõdujoon tipust temani + sõnad.
            Kolm eri kandjat sama info jaoks (DISAINIJUHIS: värv ega joonis ei
            ole kunagi ainus info kandja). Punkt ja mõõdujoon on nähtaval ka
            enne pikenduste lülitit – ülesanded 1 ja 2 loevad seda mõõdujoont
            (sisu/MOODUL-kumerpeegel.md „explore", NB!). */}
        <circle cx={focusX} cy={AXIS_Y} r={4.5} className="fill-info" />
        <line
          x1={focusX}
          y1={AXIS_Y + 6}
          x2={focusX}
          y2={MEASURE_Y - MEASURE_TICK}
          className="stroke-ink-soft"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <g className="stroke-ink-soft" strokeWidth={1.5}>
          <line x1={focusX} y1={MEASURE_Y} x2={VERTEX_X} y2={MEASURE_Y} />
          <line
            x1={focusX}
            y1={MEASURE_Y - MEASURE_TICK}
            x2={focusX}
            y2={MEASURE_Y + MEASURE_TICK}
          />
          <line
            x1={VERTEX_X}
            y1={MEASURE_Y - MEASURE_TICK}
            x2={VERTEX_X}
            y2={MEASURE_Y + MEASURE_TICK}
          />
        </g>

        {/* Sildid kõige viimasena ja valge äärisega: kiired mööduvad neist
            napilt ja jookseksid muidu neist läbi. */}
        <g className="stroke-white" strokeWidth={4} paintOrder="stroke">
          <text x={10} y={22} className="fill-ink-soft" fontSize={12}>
            peegli tagune – siin valgust ei ole
          </text>
          <text
            x={VERTEX_X - 6}
            y={AXIS_Y - MIRROR_HALF_HEIGHT_M * PX_PER_METRE - 10}
            textAnchor="end"
            className="fill-ink"
            fontSize={12}
          >
            kumerpeegel
          </text>
          <text
            x={VIEW.width - 8}
            y={AXIS_Y - 8}
            textAnchor="end"
            className="fill-ink-soft"
            fontSize={12}
          >
            peatelg
          </text>
          <text
            x={(VERTEX_X + focusX) / 2}
            y={MEASURE_LABEL_Y}
            textAnchor="middle"
            className="fill-ink"
            fontSize={15}
            fontWeight={600}
          >
            {formatNumber(focusCm)} cm
          </text>
          <text
            // Kõige kaugem näiline fookus (R = 200 cm) on x = 40 peal ja silt
            // on temast laiem – siin nihkub SILT, mitte punkt ega mõõdujoon.
            x={Math.max(FOCUS_LABEL_MIN_X, focusX)}
            y={FOCUS_LABEL_Y}
            textAnchor="middle"
            className="fill-info"
            fontSize={13}
            fontWeight={600}
          >
            näiline fookus
          </text>
          {straightBack ? null : (
            <>
              <text
                {...angleLabelPoint(hit, normal, incidentOut, 1)}
                className="fill-brand"
                fontSize={15}
                fontWeight={600}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {formatNumber(selected.incidenceDeg, 1)}°
              </text>
              <text
                {...angleLabelPoint(hit, normal, reflectedOut, -1)}
                className="fill-info"
                fontSize={15}
                fontWeight={600}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {formatNumber(selected.reflectionDeg, 1)}°
              </text>
            </>
          )}
        </g>
      </svg>

      {/* Numbrid suurelt ka joonise all: 13-pikslist silti ei loe projektorilt
          klassi tagant istuv õpilane. 360 px ekraanil lähevad kastid üksteise
          alla, mitte kõrvale. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Readout label="Kera raadius R" value={`${formatNumber(radiusCm)} cm`} />
        <Readout
          label="Näiline fookus on peegli taga"
          value={`${formatNumber(focusCm)} cm`}
          tone="focus"
        />
        <Readout
          label="Valitud kiir: langemisnurk"
          value={`${formatNumber(selected.incidenceDeg, 1)}°`}
          tone="incident"
        />
        <Readout
          label="Valitud kiir: peegeldumisnurk"
          value={`${formatNumber(selected.reflectionDeg, 1)}°`}
          tone="reflected"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={radiusSliderId} className="text-base font-medium text-ink">
          Kera raadius R
        </label>
        <input
          id={radiusSliderId}
          type="range"
          min={SLIDERS.radiusCm.min}
          max={SLIDERS.radiusCm.max}
          step={SLIDERS.radiusCm.step}
          value={radiusCm}
          onChange={(event) =>
            setRadiusCm(clamp(event.target.value, SLIDERS.radiusCm, DEFAULT_RADIUS_CM))
          }
          // Ekraanilugeja ütleks muidu paljast arvu – ühik on siin kogu jutt.
          aria-valuetext={`${radiusCm} sentimeetrit`}
          className="h-11 w-full accent-brand"
        />
        <div className="flex justify-between text-sm text-ink-soft">
          <span>{SLIDERS.radiusCm.min} cm</span>
          <span>{SLIDERS.radiusCm.max} cm</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={heightSliderId} className="text-base font-medium text-ink">
          Valitud kiire kõrgus h
        </label>
        <input
          id={heightSliderId}
          type="range"
          min={SLIDERS.rayHeightCm.min}
          max={SLIDERS.rayHeightCm.max}
          step={SLIDERS.rayHeightCm.step}
          value={heightCm}
          onChange={(event) =>
            setHeightCm(clamp(event.target.value, SLIDERS.rayHeightCm, DEFAULT_HEIGHT_CM))
          }
          aria-valuetext={`${heightCm} sentimeetrit peateljest`}
          className="h-11 w-full accent-brand"
        />
        <div className="flex justify-between text-sm text-ink-soft">
          <span>{SLIDERS.rayHeightCm.min} cm</span>
          <span>{SLIDERS.rayHeightCm.max} cm</span>
        </div>
      </div>

      {extensionsAvailable ? (
        <div className="flex flex-col gap-2 border-t border-line pt-4">
          <span className="text-base font-medium text-ink">Peegli tagune ala</span>
          {/* Lülitusnupud (`aria-pressed`), mitte `role="radio"` – sama muster
              mis mujal projektis: nooleklahvidega liikumist me ei paku, seega
              ei tohi ekraanilugejale seda ka lubada. */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Peegli tagune ala">
            {EXTENSION_MODES.map((option) => {
              const active = option.id === modeId;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setModeId(option.id)}
                  className={`flex min-h-11 items-center rounded-full border px-4 text-base focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 ${
                    active ? "border-brand bg-brand-soft font-semibold text-ink" : "border-line text-ink"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {showExtensions ? (
            <p className="text-base leading-relaxed text-ink-soft">
              Katkendlikud jooned EI ole valguskiired: nooleotsi neil ei ole,
              sest peegli taha ei jõua ükski kiir. Nad on peegeldunud kiired
              tagurpidi pikendatuna – ja just nende lõikepunkt on näiline
              fookus.
            </p>
          ) : null}
        </div>
      ) : null}

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
  tone?: "focus" | "incident" | "reflected";
}) {
  const stripe = tone === "incident" ? "bg-brand" : "bg-info";
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3 sm:flex-col sm:items-start sm:gap-1">
      <div className="flex items-center gap-2">
        {tone ? (
          <span aria-hidden="true" className={`h-1 w-5 shrink-0 rounded-full ${stripe}`} />
        ) : null}
        <span className="text-sm font-medium text-ink-soft">{label}</span>
      </div>
      <p className="text-xl font-semibold tabular-nums text-ink sm:text-2xl">{value}</p>
    </div>
  );
}
