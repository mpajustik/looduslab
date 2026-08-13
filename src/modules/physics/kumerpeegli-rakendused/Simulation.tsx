import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { SimulationProps } from "../../../engine/simulationFeatures";
import { Button } from "../../../ui/Button";
import { formatNumber } from "../../../lib/format";
import {
  AISLE_DISTANCE_CM,
  MIRROR_APERTURE_CM,
  SLIDERS,
  convexViewWidth,
  flatViewAngleDeg,
  flatViewWidth,
  metresFromCentimetres,
  mirrorBulge,
  viewAngleDeg,
} from "./model";

/**
 * Kumerpeegli rakenduste simulatsioon – ainult VAADE
 * (sisu/MOODUL-kumerpeegli-rakendused.md, samm „explore";
 * docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Siin ei ole ühtegi füüsikavalemit: mõlema vaatevälja nurk, nähtava lõigu
 * laius ja peegli serva nihe tulevad `model.ts`-ist (CLAUDE.md reegel 1).
 * Selles failis on ainult PAIGUTUS – meetrite skaleerimine piksliteks ja
 * siltide kohad. Sama mudel toidab ka mooduli teooriajoonist
 * (figures.tsx `ViewFieldFigure`), seega ei saa joonis ja simulatsioon kunagi
 * eri asja näidata.
 *
 * VAADE ON ÜLALT, nagu poe plaan: peegel on VASAKUL seinal, vahekäik jookseb
 * temast 5 m kaugusel püstjoonena ja müüja seisab peateljel nende vahel. Sama
 * pidi on mooduli teooriajoonis ja seda ütleb ka explore-sammu tekst
 * („vasakul seinal") – õpilane vaatab neid järjest.
 *
 * MÕLEMA PEEGLI LEHVIK ON KORRAGA EKRAANIL. See ei ole kaunistus: kogu mooduli
 * väide on, et TÄPSELT SAMA SUUR peegel näitab kumerana kordades pikemat lõiku,
 * ja kaks arvu eri ekraanidel seda ei tõesta. Lehvikud on eristatud nii värvi
 * kui ka joonemustriga (DISAINIJUHIS: värv ei ole kunagi ainus info kandja) ja
 * mõlema lõik vahekäigu joonel on oma mõõdujoone ja arvuga.
 *
 * LEHVIKU SERVA EI JOONISTATA NURGAST, vaid kahest mudeli arvust: ta algab
 * peegli SERVAST (poolläbimõõt `a`, tipust `mirrorBulge` võrra taga) ja lõpeb
 * vahekäigu joonel poole nähtava laiuse kaugusel peateljest. Nii ei arvuta see
 * fail ühtegi nurka ise ja peegli enda laius 2a on lehvikus sees – täpselt nagu
 * mudeli valemis (`convexViewWidth`). Sama võte on teooriajoonisel.
 *
 * ÜHIKUD: mudel arvutab meetrites, liugurid ja ekraan räägivad peegli ning
 * müüja mõõtudest sentimeetrites, nähtavast alast meetrites. Ühik muutub
 * AINULT `metresFromCentimetres` sees (liugur → mudel); pikslid tulevad
 * meetritest `PX_PER_METRE` kaudu.
 *
 * MÕÕTKAVA ON PÜSIV ja mõlemal teljel sama (30 px/m, sama arv mis mooduli
 * joonistel). Püsiv seepärast, et liuguri liigutamine PEAB pilti muutma: kui
 * mõõtkava kohanduks lehviku laiusega, jääks lehvik ekraanil alati ühesuurune
 * ja explore-3 („mis juhtub vaateväljaga, kui peegel lamedamaks läheb") ei
 * näitaks midagi. Mõlemal teljel sama seepärast, et lehvikute suhe oleks
 * ekraanil aus. Liugurite kõige laiem seis (R = 80 cm, d = 50 cm) annab
 * vahekäigul 8,1 m ehk 243 px – see mahub kaadrisse ära, seega ükski lehvik
 * ei jää poolikuks.
 *
 * SIMULATSIOONIL EI OLE LISAVÕIMALUSI: muudetavaid suurusi on kaks (peegli
 * raadius ja müüja kaugus) ehk täpselt nii palju, kui moodulileping korraga
 * lubab, seega ei ole explore-sammul `simulation.unlocks` kirjet ega sellel
 * failil `unlockedFeatures`-ist midagi otsida.
 */

// --- Paigutus (SVG kasutajaühikud, y kasvab ALLA) --------------------------

const VIEW = { width: 360, height: 292 };

/**
 * Mõõtkava: 1 m = 30 px.
 *
 * Sama arv, mis mooduli joonistel (figures.tsx `PX_PER_METRE`) – õpilane näeb
 * teoorias ja simulatsioonis ühesuuruseid lehvikuid. Kõige laiem lehvik
 * (8,1 m) jääb peateljest 122 px kaugusele ehk mahub kaadri kõrgusesse.
 */
const PX_PER_METRE = 30;

/** Sein peegliga on vasakul, vahekäik temast 5 m paremal. */
const MIRROR_X = 40;
const AXIS_Y = 146;

const AISLE_M = metresFromCentimetres(AISLE_DISTANCE_CM);
const AISLE_X = MIRROR_X + AISLE_M * PX_PER_METRE;

/** Peegli poolläbimõõt – mudeli oma arv, liuguriga ta ei muutu. */
const APERTURE_M = metresFromCentimetres(MIRROR_APERTURE_CM);
const APERTURE_PX = APERTURE_M * PX_PER_METRE;

/** Peegli läbimõõt õpilase keeles: poolläbimõõt on mudeli asi. */
const MIRROR_DIAMETER_CM = MIRROR_APERTURE_CM * 2;

/** Mõõdujooned käivad vahekäigust PAREMALE – seal ei ole kummagi lehviku ees. */
const CONVEX_MEASURE_X = AISLE_X + 10;
const FLAT_MEASURE_X = AISLE_X + 24;
const MEASURE_TICK = 5;
const LABEL_X = AISLE_X + 36;

/**
 * Mõõtkava riba kaadri ülemises vasakus nurgas: üks meeter joonisel.
 *
 * Ülal, mitte all: kaadri alumine serv on „vahekäik 5 m kaugusel" sildi oma ja
 * kaks silti satuksid seal kohakuti. Peegli lähedal on kummagi lehviku laius
 * alles paar pikslit, seega ülemine vasak nurk jääb alati tühjaks.
 */
const SCALE_BAR = { y: 24, length: PX_PER_METRE };

/**
 * Meetrijaotus vahekäigu joonel, peateljest mõlemale poole.
 *
 * Neli meetrit kummalegi poole ehk 120 px – rohkem kaadrisse ei mahu (peatelg
 * on 146 px kõrgusel). Jaotus ei sõltu liugurist, sest mõõtkava on püsiv.
 */
const AISLE_TICKS: number[] = [1, 2, 3, 4].flatMap((metres) => [
  -metres * PX_PER_METRE,
  metres * PX_PER_METRE,
]);

const DEFAULT_RADIUS_CM = 100;
const DEFAULT_EYE_CM = 200;

type Point = { x: number; y: number };

/**
 * Ühe lehviku neli nurgapunkti: peegli kaks serva ja lõigu kaks otsa
 * vahekäigul.
 *
 * `edgeX` on kumeral peeglil tipust `mirrorBulge` võrra TAGA (serv on seina
 * sees), tasasel peeglil tipuga ühel joonel. Just see nihe on põhjus, miks
 * kumera lehviku laius L = 0 juures on veidi rohkem kui peegli enda laius.
 */
function fanPoints(edgeX: number, halfWidthM: number): Point[] {
  const halfPx = halfWidthM * PX_PER_METRE;
  return [
    { x: edgeX, y: AXIS_Y - APERTURE_PX },
    { x: AISLE_X, y: AXIS_Y - halfPx },
    { x: AISLE_X, y: AXIS_Y + halfPx },
    { x: edgeX, y: AXIS_Y + APERTURE_PX },
  ];
}

const pointsAttribute = (points: Point[]): string =>
  points.map((point) => `${point.x},${point.y}`).join(" ");

/** Laius ekraanile: üks koht peale koma, nagu ülesannete tekstides. */
const width = (valueM: number): string => formatNumber(valueM, 1);

/** Nurk ekraanile: üks koht peale koma – 8,6° ilma komakohata oleks 9°. */
const angle = (valueDeg: number): string => formatNumber(valueDeg, 1);

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- ühine signatuur (ModulePage annab prop alati kaasa), moodulil ei ole unlock-i.
export function Simulation(_props: Partial<SimulationProps> = {}) {
  const [radiusCm, setRadiusCm] = useState(DEFAULT_RADIUS_CM);
  const [eyeDistanceCm, setEyeDistanceCm] = useState(DEFAULT_EYE_CM);
  const radiusSliderId = useId();
  const eyeSliderId = useId();

  // Ainus tee mudelisse: liuguri cm → m. Ükski allpool olev rida ei tohi
  // sentimeetreid valemisse anda.
  const radiusM = metresFromCentimetres(radiusCm);
  const eyeDistanceM = metresFromCentimetres(eyeDistanceCm);

  const convexWidthM = convexViewWidth(
    radiusM,
    APERTURE_M,
    eyeDistanceM,
    AISLE_M,
  );
  const flatWidthM = flatViewWidth(APERTURE_M, eyeDistanceM, AISLE_M);
  const convexAngleDeg = viewAngleDeg(radiusM, APERTURE_M, eyeDistanceM);
  const flatAngleDeg = flatViewAngleDeg(APERTURE_M, eyeDistanceM);

  const convexHalfPx = (convexWidthM / 2) * PX_PER_METRE;
  const flatHalfPx = (flatWidthM / 2) * PX_PER_METRE;

  // Peegli serva nihe tuleb mudelist, mitte kaarevalemist – kumeruse ainus
  // allikas kogu joonisel.
  const bulgePx = mirrorBulge(radiusM, APERTURE_M) * PX_PER_METRE;
  const convexEdgeX = MIRROR_X - bulgePx;

  const eyeX = MIRROR_X + eyeDistanceM * PX_PER_METRE;

  const reset = () => {
    setRadiusCm(DEFAULT_RADIUS_CM);
    setEyeDistanceCm(DEFAULT_EYE_CM);
  };

  return (
    <div className="flex flex-col gap-5">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        // Kirjeldus ei korda liugurite arve (siis loeks ekraanilugeja iga
        // sentimeetri juures terve lause uuesti ette) – arvud on kastikestes
        // joonise all. Ta ütleb, MIS pildil on ja kumb lehvik on laiem, sest
        // just see vahe on kogu samm.
        aria-label={`Vaade ülalt poe vahekäigule. Vasakul seinal on ${formatNumber(MIRROR_DIAMETER_CM)} sentimeetri laiune peegel, temast ${formatNumber(AISLE_M)} meetrit paremal jookseb vahekäigu joon ja nende vahel seisab peateljel müüja. Peeglist lähtub kaks vaatevälja lehvikut: kumerpeegli lai lehvik ja sama suure tasapeegli kitsas lehvik. Kumerpeegli lehvik katab vahekäigu joonel palju pikema lõigu; mõlema lõigu pikkus on kirjas joonise paremas servas ja kastikestes joonise all.`}
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Sein: peeglist vasakule jääv riba ei ole ruum, vaid seina sisu. */}
        <rect
          x={0}
          y={0}
          width={MIRROR_X}
          height={VIEW.height}
          className="fill-line"
          fillOpacity={0.45}
        />
        <line
          x1={MIRROR_X}
          y1={8}
          x2={MIRROR_X}
          y2={VIEW.height - 8}
          className="stroke-ink-soft"
          strokeWidth={2}
        />

        {/* Kumerpeegli lehvik on laiem, seega tema alla; tasapeegli oma peale.
            Mõlemad on eristatud NII värvi kui ka joonemustriga. Klassinimed on
            tervikuna välja kirjutatud, mitte stringidest kokku pandud:
            Tailwind loeb lähtekoodi tekstina ja `stroke-${tone}` kaoks
            stiililehelt vaikselt ära. */}
        <polygon
          points={pointsAttribute(fanPoints(convexEdgeX, convexWidthM / 2))}
          className="fill-brand"
          fillOpacity={0.14}
        />
        <g className="stroke-brand" strokeWidth={1.5} strokeDasharray="6 4">
          <line
            x1={convexEdgeX}
            y1={AXIS_Y - APERTURE_PX}
            x2={AISLE_X}
            y2={AXIS_Y - convexHalfPx}
          />
          <line
            x1={convexEdgeX}
            y1={AXIS_Y + APERTURE_PX}
            x2={AISLE_X}
            y2={AXIS_Y + convexHalfPx}
          />
        </g>
        <polygon
          points={pointsAttribute(fanPoints(MIRROR_X, flatWidthM / 2))}
          className="fill-info"
          fillOpacity={0.16}
        />
        <g className="stroke-info" strokeWidth={1.5} strokeDasharray="2 3">
          <line
            x1={MIRROR_X}
            y1={AXIS_Y - APERTURE_PX}
            x2={AISLE_X}
            y2={AXIS_Y - flatHalfPx}
          />
          <line
            x1={MIRROR_X}
            y1={AXIS_Y + APERTURE_PX}
            x2={AISLE_X}
            y2={AXIS_Y + flatHalfPx}
          />
        </g>

        {/* Peatelg – katkendjoon, sest ta ei ole valguskiir, vaid abijoon */}
        <line
          x1={MIRROR_X}
          y1={AXIS_Y}
          x2={AISLE_X}
          y2={AXIS_Y}
          className="stroke-ink-soft"
          strokeWidth={1}
          strokeDasharray="4 4"
        />

        {/* Peegel: kumerus tuleb mudeli servanihkest. Tipp on seina joonel ja
            servad temast `mirrorBulge` võrra taga – seina sees. */}
        <path
          d={`M ${convexEdgeX} ${AXIS_Y - APERTURE_PX} Q ${MIRROR_X + bulgePx} ${AXIS_Y} ${convexEdgeX} ${AXIS_Y + APERTURE_PX}`}
          className="fill-none stroke-ink"
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Müüja peateljel – tema kaugus on teine liugur. */}
        <circle cx={eyeX} cy={AXIS_Y} r={4} className="fill-ink" />

        {/* Vahekäigu joon ja tema peal meetrijaotus: mõõdujoone arvu saab
            lugeda ka jaotust lugedes, mitte ainult kastikesest. Riiuleid siia
            ei joonistata – nad jääksid lehvikute peale ja jaotus ütleb sama
            asja segamata. */}
        <line
          x1={AISLE_X}
          y1={10}
          x2={AISLE_X}
          y2={VIEW.height - 22}
          className="stroke-ink-soft"
          strokeWidth={1.5}
        />
        <g className="stroke-ink-soft" strokeWidth={1}>
          {AISLE_TICKS.map((offsetPx) => (
            <line
              key={offsetPx}
              x1={AISLE_X - 4}
              y1={AXIS_Y + offsetPx}
              x2={AISLE_X + 4}
              y2={AXIS_Y + offsetPx}
            />
          ))}
        </g>

        {/* Mõõdujooned vahekäigust paremal: kumeral oma, tasasel oma. */}
        <MeasureLine
          x={CONVEX_MEASURE_X}
          halfPx={convexHalfPx}
          className="stroke-brand"
        />
        <MeasureLine
          x={FLAT_MEASURE_X}
          halfPx={flatHalfPx}
          className="stroke-info"
        />

        {/* Mõõtkava riba: üks meeter joonisel. Kaadri alumine vasak nurk on
            ainus koht, kuhu ükski lehvik kunagi ei ulatu. */}
        <g className="stroke-ink-soft" strokeWidth={1.5}>
          <line
            x1={MIRROR_X}
            y1={SCALE_BAR.y}
            x2={MIRROR_X + SCALE_BAR.length}
            y2={SCALE_BAR.y}
          />
          <line
            x1={MIRROR_X}
            y1={SCALE_BAR.y - 4}
            x2={MIRROR_X}
            y2={SCALE_BAR.y + 4}
          />
          <line
            x1={MIRROR_X + SCALE_BAR.length}
            y1={SCALE_BAR.y - 4}
            x2={MIRROR_X + SCALE_BAR.length}
            y2={SCALE_BAR.y + 4}
          />
        </g>

        {/* Sildid kõige viimasena ja valge äärisega: lehvikute servad mööduvad
            neist napilt ja jookseksid muidu neist läbi. */}
        <g className="stroke-white" strokeWidth={4} paintOrder="stroke">
          <text x={6} y={18} className="fill-ink-soft" fontSize={11}>
            sein
          </text>
          <text
            x={MIRROR_X + 8}
            y={AXIS_Y - 28}
            className="fill-ink"
            fontSize={12}
            fontWeight={600}
          >
            peegel {formatNumber(MIRROR_DIAMETER_CM)} cm
          </text>
          <text
            x={eyeX}
            y={AXIS_Y - 10}
            textAnchor="middle"
            className="fill-ink"
            fontSize={12}
          >
            müüja
          </text>
          <text
            x={AISLE_X - 6}
            y={VIEW.height - 8}
            textAnchor="end"
            className="fill-ink-soft"
            fontSize={11}
          >
            vahekäik {formatNumber(AISLE_M)} m kaugusel
          </text>
          <text
            x={MIRROR_X + SCALE_BAR.length + 8}
            y={SCALE_BAR.y + 4}
            className="fill-ink-soft"
            fontSize={11}
          >
            1 m
          </text>

          {/* Kumera lõigu arv käib tema mõõdujoone ÜLEMISE otsa juurde ja tasase
              oma ALUMISE otsa juurde: kumer lehvik on alati laiem (valemis on
              tal liige 4θ juures), seega ei saa kaks silti kunagi kokku sattuda. */}
          <text
            x={LABEL_X}
            y={AXIS_Y - convexHalfPx + 2}
            className="fill-ink-soft"
            fontSize={11}
          >
            kumerpeegel
          </text>
          <text
            x={LABEL_X}
            y={AXIS_Y - convexHalfPx + 18}
            className="fill-ink"
            fontSize={15}
            fontWeight={600}
          >
            {width(convexWidthM)} m
          </text>
          <text
            x={LABEL_X}
            y={AXIS_Y + flatHalfPx + 4}
            className="fill-ink-soft"
            fontSize={11}
          >
            sama suur tasapeegel
          </text>
          <text
            x={LABEL_X}
            y={AXIS_Y + flatHalfPx + 20}
            className="fill-ink"
            fontSize={15}
            fontWeight={600}
          >
            {width(flatWidthM)} m
          </text>
        </g>
      </svg>

      <p className="text-base leading-relaxed text-ink-soft">
        Peegel on siin otse seina peal. Päris poes on ta nurga all – see muudab,
        KUHU vaateväli osutab, mitte kui LAI ta on.
      </p>

      {/* Numbrid suurelt ka joonise all: 15-pikslist silti ei loe projektorilt
          klassi tagant istuv õpilane. 360 px ekraanil lähevad kastid üksteise
          alla, mitte kõrvale. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Readout
          label="Kumerpeegel: vaateväli"
          value={`${angle(convexAngleDeg)}°`}
          tone="convex"
        />
        <Readout
          label="Kumerpeegel: näha vahekäigust"
          value={`${width(convexWidthM)} m`}
          tone="convex"
        />
        <Readout
          label="Sama suur tasapeegel: vaateväli"
          value={`${angle(flatAngleDeg)}°`}
          tone="flat"
        />
        <Readout
          label="Sama suur tasapeegel: näha vahekäigust"
          value={`${width(flatWidthM)} m`}
          tone="flat"
        />
      </div>

      <p className="text-base leading-relaxed text-ink-soft">
        Peegli läbimõõt on kogu aeg {formatNumber(MIRROR_DIAMETER_CM)} cm ja
        vahekäik {formatNumber(AISLE_M)} m kaugusel – kumbki liuguriga ei muutu.
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor={radiusSliderId} className="text-base font-medium text-ink">
          Peegli kõverusraadius R
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
          <span>{SLIDERS.radiusCm.min} cm (kumeram)</span>
          <span>{SLIDERS.radiusCm.max} cm (lamedam)</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={eyeSliderId} className="text-base font-medium text-ink">
          Müüja kaugus peeglist d
        </label>
        <input
          id={eyeSliderId}
          type="range"
          min={SLIDERS.eyeDistanceCm.min}
          max={SLIDERS.eyeDistanceCm.max}
          step={SLIDERS.eyeDistanceCm.step}
          value={eyeDistanceCm}
          onChange={(event) =>
            setEyeDistanceCm(
              clamp(event.target.value, SLIDERS.eyeDistanceCm, DEFAULT_EYE_CM),
            )
          }
          aria-valuetext={`${eyeDistanceCm} sentimeetrit peeglist`}
          className="h-11 w-full accent-brand"
        />
        <div className="flex justify-between text-sm text-ink-soft">
          <span>{SLIDERS.eyeDistanceCm.min} cm</span>
          <span>{SLIDERS.eyeDistanceCm.max} cm</span>
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="ghost" onClick={reset}>
          <RotateCcw aria-hidden="true" className="size-4" />
          Alusta uuesti
        </Button>
      </div>
    </div>
  );
}

/** Mõõdujoon otsatähistega – kaks korda sama kuju, kaks eri värvi. */
function MeasureLine({
  x,
  halfPx,
  className,
}: {
  x: number;
  halfPx: number;
  className: string;
}) {
  return (
    <g className={className} strokeWidth={2.5} strokeLinecap="round">
      <line x1={x} y1={AXIS_Y - halfPx} x2={x} y2={AXIS_Y + halfPx} />
      <line
        x1={x - MEASURE_TICK}
        y1={AXIS_Y - halfPx}
        x2={x + MEASURE_TICK}
        y2={AXIS_Y - halfPx}
      />
      <line
        x1={x - MEASURE_TICK}
        y1={AXIS_Y + halfPx}
        x2={x + MEASURE_TICK}
        y2={AXIS_Y + halfPx}
      />
    </g>
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
  tone: "convex" | "flat";
}) {
  const stripe = tone === "convex" ? "bg-brand" : "bg-info";
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
