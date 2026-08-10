import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { SimulationProps } from "../../../engine/simulationFeatures";
import { Button } from "../../../ui/Button";
import { formatNumber } from "../../../lib/format";
import {
  EARTH_DIAMETER_KM,
  EARTH_RADIUS_KM,
  EARTH_UMBRA_TIP_KM,
  MOON_DIAMETER_KM,
  MOON_MEAN_KM,
  MOON_UMBRA_TIP_KM,
  SLIDERS,
  SUN_DIAMETER_KM,
  SUN_TO_EARTH_KM,
  lunarPenumbraBandKm,
  lunarUmbraToMoonRatio,
  lunarUmbraWidthKm,
  penumbraBandAtDistance,
  solarEclipseKind,
  solarUmbraGapKm,
  solarUmbraSpotKm,
} from "./model";

/**
 * Varjutuste simulatsioon – ainult VAADE (sisu/MOODUL-varjutused.md samm
 * „explore"; docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Kogu füüsika tuleb mudelist (CLAUDE.md reegel 1): koonuse pikkuse, laigu
 * laiuse ja täielik/rõngasjas-otsuse annavad `model.ts` funktsioonid. See
 * fail arvutab ainult PIKSLEID ja valib, milliseid mudeli funktsioone
 * kutsuda – kumb keha varju heidab, otsustab valitud režiim.
 *
 * **Joonis ei ole mõõtkavas** (spetsifikatsioon, sest Päike on Kuust ~400
 * korda suurem ja allikas-keha kaugus on miljoneid kordi suurem kui keha-
 * ekraan kaugus – mõõtkavas oleks Kuu üks piksel). Kaks segmenti kasutavad
 * seepärast KAHTE ERINEVAT skaalat:
 *
 * - allikas → keha (Päikeseni) on joonisel FIKSEERITUD lühike vahemaa, ta ei
 *   muutu kunagi, sest tegelik arv (149,6 miljonit km) ei mahuks kunagi
 *   ekraanile ega liuguriga liikudes millekski loetavaks;
 *   liuguriga koos liigub AINULT
 * - keha → ekraan, ja SEE segment ON õiges suhtes: skaala on valitud nii,
 *   et mõlemad režiimi liuguri äärmused ja koonuse tipp (kus jutt käib
 *   täielik/rõngasjas piirist) mahuvad korraga ekraanile ning nende
 *   OMAVAHELINE suhe on tõsi. Just see suhe ongi explore-3 kogu mõte.
 *
 * Sama otsus mis moodulis `vari-ja-poolvari`: kiirte otsad tulevad sirge
 * pikendamisest, mitte valemist uuesti, seega joonis ei saa arvuga vastuollu
 * minna.
 */

// --- Režiimid -----------------------------------------------------------

type EclipseMode = "solar" | "lunar";

/** Kuu keskpunktist Maa PINNANI (km) – sama lahutamine, mis model.ts-is. */
function moonToEarthSurfaceKm(centreDistanceKm: number): number {
  return centreDistanceKm - EARTH_RADIUS_KM;
}

/**
 * Režiimipõhised sildid ja arvud. `bodyToScreenKm` ja koonuse tipp
 * (`tipKm`) on samas ühikus, sest neid võrreldakse joonisel otse.
 */
const MODES: Record<
  EclipseMode,
  {
    label: string;
    bodyLabel: string;
    screenLabel: string;
    bodyDiameterKm: number;
    tipKm: number;
    /** Liuguri äärmused SELLE režiimi keha → ekraan kauguses (km). */
    screenRangeKm: { min: number; max: number };
    bodyToScreenKm: (moonDistanceKm: number) => number;
    umbraWidthKm: (moonDistanceKm: number) => number;
    penumbraKm: (moonDistanceKm: number) => number;
  }
> = {
  solar: {
    label: "Päikesevarjutus",
    bodyLabel: "Kuu",
    screenLabel: "Maa",
    bodyDiameterKm: MOON_DIAMETER_KM,
    tipKm: MOON_UMBRA_TIP_KM,
    screenRangeKm: {
      min: moonToEarthSurfaceKm(SLIDERS.moonDistanceKm.min),
      max: moonToEarthSurfaceKm(SLIDERS.moonDistanceKm.max),
    },
    bodyToScreenKm: (moonDistanceKm) => moonToEarthSurfaceKm(moonDistanceKm),
    umbraWidthKm: (moonDistanceKm) => solarUmbraSpotKm(moonDistanceKm),
    penumbraKm: (moonDistanceKm) =>
      penumbraBandAtDistance(
        SUN_DIAMETER_KM,
        SUN_TO_EARTH_KM,
        moonToEarthSurfaceKm(moonDistanceKm),
      ),
  },
  lunar: {
    label: "Kuuvarjutus",
    bodyLabel: "Maa",
    screenLabel: "Kuu",
    bodyDiameterKm: EARTH_DIAMETER_KM,
    tipKm: EARTH_UMBRA_TIP_KM,
    screenRangeKm: {
      min: SLIDERS.moonDistanceKm.min,
      max: SLIDERS.moonDistanceKm.max,
    },
    // Lihtsustus, mis on ka model.ts-is kirjas: ekraaniks loetakse Kuu
    // KESKPUNKTI kaugus, mitte tema lähem serv (raadius on kaugusest tühine).
    bodyToScreenKm: (moonDistanceKm) => moonDistanceKm,
    umbraWidthKm: (moonDistanceKm) => lunarUmbraWidthKm(moonDistanceKm),
    penumbraKm: (moonDistanceKm) => lunarPenumbraBandKm(moonDistanceKm),
  },
};

// --- Paigutus (SVG kasutajaühikud, y kasvab ALLA) ------------------------

const VIEW = { width: 360, height: 258 };
const AXIS_Y = 104;
/** Päike seisab siin – fikseeritud, mitte kauguse järgi arvutatud (vt üleval). */
const SOURCE_X = 30;
/** Varju heitev keha (Kuu või Maa) seisab siin – samuti fikseeritud. */
const BODY_X = 130;
/** Ekraan (teine keha) liigub selle ja SCREEN_MAX_X vahel. */
const SCREEN_MIN_X = 190;
const SCREEN_MAX_X = 344;

const MAX_HALF_PX = 84;
/**
 * Vertikaalskaala piirid (pikslit KILOMEETRI kohta – mitte meetri, nagu
 * moodulis `vari-ja-poolvari`). Siinsed suurused (Maa täisvari kuni ~9500 km,
 * Kuu täisvari sadades km) on nii palju suuremad kui too moodul, et sobiv
 * skaala on murdosa piksliist kilomeetri kohta, mitte tuhandeid
 * (CodeRabbiti leid samm 4.1p: algsed 3800–26 000 olid 5–6 suurusjärku
 * liiga suured, mistõttu iga ala täitis kogu joonise ega kuvanud tegelikku
 * suhet).
 */
const MAX_SCALE_Y = 0.035;
const MIN_SCALE_Y = 0.008;
const BAND_PX = 12;

function km(valueKm: number, decimals = 0): string {
  return `${formatNumber(valueKm, decimals)} km`;
}

function clampSlider(value: string, limits: { min: number; max: number }, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(limits.max, Math.max(limits.min, parsed));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- ühine signatuur (ModulePage annab prop alati kaasa), moodulil ei ole unlock-i.
export function Simulation(_props: Partial<SimulationProps> = {}) {
  const [mode, setMode] = useState<EclipseMode>("solar");
  const [moonDistanceKm, setMoonDistanceKm] = useState<number>(MOON_MEAN_KM);
  const distanceHintId = useId();
  const distanceSliderId = useId();
  const gradientId = useId();

  const config = MODES[mode];

  // --- Füüsika (kõik mudelist) --------------------------------------------
  const bodyToScreenKm = config.bodyToScreenKm(moonDistanceKm);
  const umbraKm = config.umbraWidthKm(moonDistanceKm);
  const penumbraKm = config.penumbraKm(moonDistanceKm);
  const umbraVisible = umbraKm > 0;

  // --- Joonise skaala: sama põhimõte, mis vari-ja-poolvari moodulis – üks
  // vertikaalskaala kõigile suurustele (keha, koonuse laiused), üks
  // horisontaalskaala keha→ekraan segmendile. --------------------------------
  const screenRangePaddedMaxKm = Math.max(
    config.screenRangeKm.max,
    config.tipKm * 1.05,
  );
  const pxPerKmX = (SCREEN_MAX_X - SCREEN_MIN_X) / (screenRangePaddedMaxKm - config.screenRangeKm.min);
  const screenX = SCREEN_MIN_X + (bodyToScreenKm - config.screenRangeKm.min) * pxPerKmX;
  const tipX = SCREEN_MIN_X + (config.tipKm - config.screenRangeKm.min) * pxPerKmX;

  const fittingScaleY = (2 * MAX_HALF_PX) / Math.max(umbraKm + 2 * penumbraKm, config.bodyDiameterKm);
  const scaleY = Math.min(MAX_SCALE_Y, Math.max(MIN_SCALE_Y, fittingScaleY));

  const bodyHalfPx = Math.min(40, (config.bodyDiameterKm * scaleY) / 2);
  const umbraHalfPx = (umbraKm * scaleY) / 2;
  /** Poolvarju riba PAKSUS ekraanil (mitte pool, terve riba – vt penumbraKm). */
  const penumbraPx = penumbraKm * scaleY;
  const totalHalfPx = umbraHalfPx + penumbraPx;

  const bodyTopY = AXIS_Y - bodyHalfPx;
  const bodyBottomY = AXIS_Y + bodyHalfPx;

  // Ekraanil olevate alade servad tulevad OTSE mudeli laiustest (umbraHalfPx,
  // totalHalfPx), mitte allikast keha kaudu ekraanini sirge pikendamisest –
  // see viimane läheks katki, sest allikas → keha segment on joonisel
  // FIKSEERITUD (fiktiivne), mitte õiges suhtes (vt faili algusekommentaari).
  // Nii ei saa joonis ka siin arvuga vastuollu minna, ainult teist teed pidi.
  const upperInnerY = AXIS_Y - umbraHalfPx;
  const upperOuterY = AXIS_Y - totalHalfPx;
  const lowerInnerY = AXIS_Y + umbraHalfPx;
  const lowerOuterY = AXIS_Y + totalHalfPx;

  const tipBeforeScreen = config.tipKm < bodyToScreenKm;
  const umbraPoints = tipBeforeScreen
    ? `${BODY_X},${bodyTopY} ${tipX},${AXIS_Y} ${BODY_X},${bodyBottomY}`
    : `${BODY_X},${bodyTopY} ${screenX},${AXIS_Y - umbraHalfPx} ${screenX},${AXIS_Y + umbraHalfPx} ${BODY_X},${bodyBottomY}`;

  const reset = () => {
    setMoonDistanceKm(MOON_MEAN_KM);
  };

  // --- Lisanäidikud (režiimispetsiifilised) -------------------------------
  const eclipseKind = mode === "solar" ? solarEclipseKind(moonDistanceKm) : null;
  const gapKm = mode === "solar" ? solarUmbraGapKm(moonDistanceKm) : 0;
  const lunarRatio = mode === "lunar" ? lunarUmbraToMoonRatio(moonDistanceKm) : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2" role="group" aria-label="Vali varjutuse liik">
        {(Object.keys(MODES) as EclipseMode[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={mode === key}
            onClick={() => setMode(key)}
            className={`flex min-h-11 items-center rounded-full border px-4 text-base focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 ${
              mode === key ? "border-brand bg-brand-soft font-semibold text-ink" : "border-line text-ink"
            }`}
          >
            {MODES[key].label}
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        aria-label={`Joonis: vasakul Päike, keskel ${config.bodyLabel.toLowerCase()}, paremal ${config.screenLabel.toLowerCase()}. Must täisvarju koonus keha taga, hallid poolvarju alad selle ümber. Joonis ei ole mõõtkavas.`}
        className="w-full rounded-2xl border border-line bg-white"
      >
        <defs>
          <linearGradient id={`${gradientId}-top`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-ink)" stopOpacity={0.08} />
            <stop offset="100%" stopColor="var(--color-ink)" stopOpacity={0.55} />
          </linearGradient>
          <linearGradient id={`${gradientId}-bottom`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-ink)" stopOpacity={0.55} />
            <stop offset="100%" stopColor="var(--color-ink)" stopOpacity={0.08} />
          </linearGradient>
        </defs>

        <line
          x1={SOURCE_X}
          y1={AXIS_Y}
          x2={SCREEN_MAX_X}
          y2={AXIS_Y}
          className="stroke-ink-soft"
          strokeWidth={1}
          strokeDasharray="4 4"
        />

        <polygon
          points={`${BODY_X},${bodyTopY} ${screenX},${upperInnerY} ${screenX},${upperOuterY}`}
          className="fill-ink"
          fillOpacity={0.18}
        />
        <polygon
          points={`${BODY_X},${bodyBottomY} ${screenX},${lowerInnerY} ${screenX},${lowerOuterY}`}
          className="fill-ink"
          fillOpacity={0.18}
        />

        <polygon points={umbraPoints} className="fill-ink" fillOpacity={0.75} />

        <g className="stroke-ink" strokeWidth={1} strokeOpacity={0.6}>
          <line x1={BODY_X} y1={bodyTopY} x2={screenX} y2={upperInnerY} />
          <line x1={BODY_X} y1={bodyTopY} x2={screenX} y2={upperOuterY} />
          <line x1={BODY_X} y1={bodyBottomY} x2={screenX} y2={lowerInnerY} />
          <line x1={BODY_X} y1={bodyBottomY} x2={screenX} y2={lowerOuterY} />
        </g>

        {/* Päike: osa kettast servast, kiired lähtuvad Sinu poole keha suunas
            (dekoratiivne – allikas → keha vahemaa on fikseeritud, mitte
            mõõtkavas, vt faili algusekommentaari). */}
        <g className="stroke-ink-soft" strokeWidth={1} strokeOpacity={0.5}>
          <line x1={SOURCE_X + 2} y1={AXIS_Y - 12} x2={BODY_X} y2={bodyTopY} />
          <line x1={SOURCE_X + 2} y1={AXIS_Y + 12} x2={BODY_X} y2={bodyBottomY} />
        </g>
        <circle cx={SOURCE_X - 14} cy={AXIS_Y} r={16} className="fill-teacher" />
        <text
          x={SOURCE_X - 2}
          y={AXIS_Y - 20}
          className="fill-ink-soft"
          fontSize={12}
          stroke="white"
          strokeWidth={4}
          paintOrder="stroke"
        >
          Päike
        </text>

        <circle cx={BODY_X} cy={AXIS_Y} r={bodyHalfPx} className="fill-ink" />
        <text
          x={BODY_X}
          y={bodyTopY - 8}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={12}
          stroke="white"
          strokeWidth={4}
          paintOrder="stroke"
        >
          {config.bodyLabel}
        </text>

        <line
          x1={screenX}
          y1={AXIS_Y - MAX_HALF_PX - 8}
          x2={screenX}
          y2={AXIS_Y + MAX_HALF_PX + 8}
          className="stroke-ink-soft"
          strokeWidth={3}
        />
        <rect
          x={screenX - BAND_PX / 2}
          y={upperOuterY}
          width={BAND_PX}
          height={Math.max(0, AXIS_Y - umbraHalfPx - upperOuterY)}
          fill={`url(#${gradientId}-top)`}
        />
        <rect
          x={screenX - BAND_PX / 2}
          y={AXIS_Y + umbraHalfPx}
          width={BAND_PX}
          height={Math.max(0, lowerOuterY - AXIS_Y - umbraHalfPx)}
          fill={`url(#${gradientId}-bottom)`}
        />
        {umbraVisible ? (
          <rect
            x={screenX - BAND_PX / 2}
            y={AXIS_Y - umbraHalfPx}
            width={BAND_PX}
            height={2 * umbraHalfPx}
            className="fill-ink"
          />
        ) : mode === "solar" ? (
          // Täisvari jääb Maast lühemaks: siin paistab Päike rõngana, mitte
          // musta ega hallina (spetsifikatsiooni täpsustus) – oma värv ja silt.
          <rect
            x={screenX - BAND_PX / 2}
            y={AXIS_Y - 6}
            width={BAND_PX}
            height={12}
            rx={2}
            className="fill-brand"
          />
        ) : null}
        <text
          x={SCREEN_MAX_X}
          y={14}
          textAnchor="end"
          className="fill-ink-soft"
          fontSize={12}
          stroke="white"
          strokeWidth={4}
          paintOrder="stroke"
        >
          {config.screenLabel}
        </text>
        {mode === "solar" && !umbraVisible ? (
          <text
            x={screenX}
            y={AXIS_Y + MAX_HALF_PX + 24}
            textAnchor="middle"
            className="fill-brand"
            fontSize={11}
          >
            Päike paistab rõngana
          </text>
        ) : null}

        <text x={8} y={VIEW.height - 6} className="fill-ink-soft" fontSize={11}>
          joonis ei ole mõõtkavas
        </text>
      </svg>

      <div className="grid gap-3 sm:grid-cols-2">
        <Readout label="Täisvarju koonuse pikkus" value={km(config.tipKm)} tone="umbra" />
        {mode === "solar" ? (
          <Readout
            label="Varjutus"
            value={
              eclipseKind === "total"
                ? `täielik – täisvarju laik ${km(umbraKm)}`
                : `rõngasjas – täisvari jääb ${km(gapKm)} puudu`
            }
            tone="penumbra"
          />
        ) : (
          <Readout
            label="Maa täisvari Kuu kaugusel"
            value={`${km(umbraKm)} (Kuu ise ${km(MOON_DIAMETER_KM)}, ${formatNumber(lunarRatio, 1)}× laiem)`}
            tone="penumbra"
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={distanceSliderId} className="text-base font-medium text-ink">
          Kuu kaugus Maa keskpunktist: {km(moonDistanceKm)}
        </label>
        <input
          id={distanceSliderId}
          type="range"
          min={SLIDERS.moonDistanceKm.min}
          max={SLIDERS.moonDistanceKm.max}
          step={SLIDERS.moonDistanceKm.step}
          value={moonDistanceKm}
          onChange={(event) =>
            setMoonDistanceKm(clampSlider(event.target.value, SLIDERS.moonDistanceKm, MOON_MEAN_KM))
          }
          aria-valuetext={`${formatNumber(moonDistanceKm, 0)} kilomeetrit`}
          aria-describedby={distanceHintId}
          className="h-11 w-full accent-brand"
        />
        <div className="flex justify-between text-sm text-ink-soft">
          <span>{km(SLIDERS.moonDistanceKm.min)}</span>
          <span>{km(SLIDERS.moonDistanceKm.max)}</span>
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="ghost" onClick={reset}>
          <RotateCcw aria-hidden="true" className="size-4" />
          Alusta uuesti
        </Button>
      </div>

      <span id={distanceHintId} className="sr-only">
        Kuu kaugus mõjutab nii täisvarju laiust kui ka seda, kas varjutus on täielik või rõngasjas.
      </span>
    </div>
  );
}

function Readout({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "umbra" | "penumbra";
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3 sm:flex-col sm:items-start sm:gap-1">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`h-3 w-5 shrink-0 rounded-sm bg-ink ${tone === "umbra" ? "opacity-75" : "opacity-25"}`}
        />
        <span className="text-sm font-medium text-ink-soft">{label}</span>
      </div>
      <p className="text-xl font-semibold tabular-nums text-ink sm:text-2xl">{value}</p>
    </div>
  );
}
