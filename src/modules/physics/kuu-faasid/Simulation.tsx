import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { SimulationProps } from "../../../engine/simulationFeatures";
import { Button } from "../../../ui/Button";
import { SliderField } from "../../../ui/SliderField";
import { formatNumber } from "../../../lib/format";
import {
  dayFromPhaseAngle,
  earthShadowCentreCovered,
  earthShadowHalfAngleDeg,
  EARTH_UMBRA_WIDTH_AT_MOON_KM,
  illuminatedFraction,
  isWaxing,
  MOON_MEAN_KM,
  type PhaseLabel,
  phaseLabel,
  SLIDERS,
  terminatorFactor,
} from "./model";

/**
 * Kuu faaside simulatsioon – ainult VAADE (sisu/MOODUL-kuu-faasid.md samm
 * „explore"; docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Kogu füüsika tuleb mudelist (CLAUDE.md reegel 1): valgustatud osa, faasi
 * kuju ja Maa varju geomeetria tulevad `model.ts` funktsioonidest. See fail
 * arvutab ainult PIKSLEID.
 *
 * **Eestikeelne faasinimi pannakse peale SIIN, mitte mudelis** (vt model.ts
 * `phaseLabel` kommentaari ja sisu/MOODUL-kuu-faasid.md „Terminoloogia") –
 * nii ei jõua vaidlus sõna „noorkuu" üle kunagi mudelisse.
 *
 * **Nurga ja ekraani kokkulepe** (sisu/MOODUL-kuu-faasid.md „Nurga ja ekraani
 * kokkulepe"): ülaltvaade on vaade ekliptika põhjapoolusest, Päike on
 * ekraani vasakus servas, Kuu tiirleb vastupäeva. θ = 0° Maast vasakul
 * (kuuloomine), 90° all (esimene veerand), 180° paremal (täiskuu), 270°
 * üleval (viimane veerand). See annab Descartes'i valemi
 * `x = -R·cos θ, y = R·sin θ` (SVG y kasvab alla).
 *
 * **„Nii paistab Maalt" ketas on ise LIHTSUSTUS, mitte mudel:** kuju
 * (terminaatori ellips) tuleb `terminatorFactor`-ist, aga SVG kaare
 * konstrueerimine on siin oma otsus (kaks kaart, sisemine raadius
 * `r · |terminatorFactor|`) – standardne viis Kuu faasi joonistamiseks.
 */

const PHASE_LABEL_ET: Record<PhaseLabel, string> = {
  new: "kuuloomine",
  "waxing-crescent": "kasvav sirp",
  "first-quarter": "esimene veerand",
  "waxing-gibbous": "kasvav kumer",
  full: "täiskuu",
  "waning-gibbous": "kahanev kumer",
  "last-quarter": "viimane veerand",
  "waning-crescent": "kahanev sirp",
};

/** Feature-silt, mida see fail explore-sammu `unlockedFeatures` seast otsib. */
const EARTH_SHADOW_FEATURE = "maa-vari";

const DEFAULT_ANGLE_DEG = 0;

/** Tegelik varju poolnurk on ~0,7° – nähtamatult peene. Ekraanil suurendame
 * seda kunstlikult, et õpilane näeks, kus vari ORBIIDIL asub; tegelik arv
 * jääb ainult näidikusse (samm sisu/MOODUL-kuu-faasid.md „explore-3"). */
const SHADOW_VISUAL_HALF_ANGLE_DEG = 9;

function moonScreenPosition(angleDeg: number, radius: number, centre: { x: number; y: number }) {
  const rad = (angleDeg / 180) * Math.PI;
  return {
    x: centre.x - radius * Math.cos(rad),
    y: centre.y + radius * Math.sin(rad),
  };
}

/**
 * SVG path Kuu faasi kettale ("Nii paistab Maalt"): väline kaar on alati
 * poolring valgustatud küljel, sisemine kaar (terminaator) kummub kas
 * sissepoole (sirp) või väljapoole (kumerfaas) sõltuvalt `terminator` märgist.
 */
function moonDiscPath(cx: number, cy: number, r: number, litRight: boolean, terminator: number): string {
  const outerSweep = litRight ? 1 : 0;
  const gibbous = terminator < 0;
  const innerSweep = litRight === gibbous ? 1 : 0;
  const rx = r * Math.abs(terminator);
  return `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${outerSweep} ${cx} ${cy + r} A ${rx} ${r} 0 0 ${innerSweep} ${cx} ${cy - r} Z`;
}

function clampSlider(value: string, limits: { min: number; max: number }, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(limits.max, Math.max(limits.min, parsed));
}

export function Simulation({ unlockedFeatures = new Set() }: Partial<SimulationProps> = {}) {
  const [angleDeg, setAngleDeg] = useState(DEFAULT_ANGLE_DEG);
  const [showEarthShadow, setShowEarthShadow] = useState(false);
  const sliderId = useId();
  const sliderHintId = useId();
  const shadowToggleId = useId();

  const shadowAvailable = unlockedFeatures.has(EARTH_SHADOW_FEATURE);
  const shadowVisible = shadowAvailable && showEarthShadow;

  // --- Füüsika (kõik mudelist) --------------------------------------------
  const fraction = illuminatedFraction(angleDeg);
  const percentLit = Math.round(fraction * 100);
  const label = phaseLabel(angleDeg);
  const waxing = isWaxing(angleDeg);
  const dayInCycle = dayFromPhaseAngle(angleDeg);
  const term = terminatorFactor(angleDeg);
  const shadowHalfAngleDeg = earthShadowHalfAngleDeg(EARTH_UMBRA_WIDTH_AT_MOON_KM, MOON_MEAN_KM);
  const inShadow = earthShadowCentreCovered(angleDeg);

  const reset = () => {
    setAngleDeg(DEFAULT_ANGLE_DEG);
    setShowEarthShadow(false);
  };

  // --- Ülaltvaate paigutus --------------------------------------------------
  const topView = { width: 240, height: 220 };
  const topCentre = { x: 150, y: 110 };
  const orbitR = 68;
  const earthR = 15;
  const moonTopR = 9;
  const sunX = 18;

  const moonPos = moonScreenPosition(angleDeg, orbitR, topCentre);

  // --- „Nii paistab Maalt" paigutus -----------------------------------------
  const bigView = { width: 200, height: 220 };
  const bigCentre = { x: 100, y: 110 };
  const bigR = 74;
  // Kuuloomisel ja täiskuul ei sõltu tulemus küljest (fraction 0 või 1), aga
  // `litRight` peab olema mingi väärtus – `isWaxing` on false täpselt 0° ja
  // 180° juures (vt model.ts kommentaari), seega valime täiskuu jaoks paremale.
  const bigPathLitRight = angleDeg === 180 ? true : waxing;
  const bigPath = moonDiscPath(bigCentre.x, bigCentre.y, bigR, bigPathLitRight, term);

  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-2xl border border-line bg-brand-soft px-4 py-3 text-base font-medium text-ink">
        Päike valgustab Kuust alati täpselt poolt
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <svg
          viewBox={`0 0 ${topView.width} ${topView.height}`}
          role="img"
          aria-label={`Joonis: ülaltvaade – Päike vasakul, Maa keskel, Kuu orbiidil ${formatNumber(angleDeg, 0)} kraadi juures. Nii Maa kui Kuu on pooleldi valgustatud, valgustatud pool alati Päikese poole. Joonis ei ole mõõtkavas.`}
          className="w-full flex-1 rounded-2xl border border-line bg-white"
        >
          <circle cx={sunX} cy={topCentre.y} r={13} className="fill-teacher" />
          {[-30, 0, 30].map((dy) => (
            <line
              key={dy}
              x1={sunX + 14}
              y1={topCentre.y + dy}
              x2={topView.width}
              y2={topCentre.y + dy}
              className="stroke-ink-soft"
              strokeWidth={0.75}
              strokeDasharray="3 4"
              opacity={0.5}
            />
          ))}

          <circle
            cx={topCentre.x}
            cy={topCentre.y}
            r={orbitR}
            fill="none"
            className="stroke-ink-soft"
            strokeWidth={1}
            strokeDasharray="2 3"
          />

          {shadowVisible ? (
            <path
              d={describeArc(topCentre, orbitR, 180 - SHADOW_VISUAL_HALF_ANGLE_DEG, 180 + SHADOW_VISUAL_HALF_ANGLE_DEG)}
              fill="none"
              className="stroke-ink"
              strokeWidth={6}
              strokeOpacity={0.35}
              strokeLinecap="round"
            />
          ) : null}

          {/* Maa: vasak pool valgustatud (Päikese poole). */}
          <g clipPath="url(#kf-earth-clip)">
            <clipPath id="kf-earth-clip">
              <circle cx={topCentre.x} cy={topCentre.y} r={earthR} />
            </clipPath>
            <circle cx={topCentre.x} cy={topCentre.y} r={earthR} className="fill-ink-soft" />
            <rect
              x={topCentre.x - earthR}
              y={topCentre.y - earthR}
              width={earthR}
              height={2 * earthR}
              className="fill-brand"
            />
          </g>

          {/* Kuu: vasak pool valgustatud, va kui ta on Maa varjus. */}
          <g clipPath="url(#kf-moon-clip)">
            <clipPath id="kf-moon-clip">
              <circle cx={moonPos.x} cy={moonPos.y} r={moonTopR} />
            </clipPath>
            <circle cx={moonPos.x} cy={moonPos.y} r={moonTopR} className="fill-ink-soft" />
            {shadowVisible && inShadow ? null : (
              <rect
                x={moonPos.x - moonTopR}
                y={moonPos.y - moonTopR}
                width={moonTopR}
                height={2 * moonTopR}
                className="fill-teacher"
              />
            )}
          </g>

          <text x={topCentre.x} y={topView.height - 6} textAnchor="middle" className="fill-ink-soft" fontSize={10}>
            ülaltvaade · ei ole mõõtkavas
          </text>
        </svg>

        <svg
          viewBox={`0 0 ${bigView.width} ${bigView.height}`}
          role="img"
          aria-label={`Joonis: „Nii paistab Maalt" – Kuu ketas, ${percentLit} protsenti valgustatud, ${PHASE_LABEL_ET[label]}. Vaade põhjapoolkeralt.`}
          className="w-full flex-1 rounded-2xl border border-line bg-white"
        >
          <circle cx={bigCentre.x} cy={bigCentre.y} r={bigR} className="fill-ink-soft" />
          <path d={bigPath} className="fill-teacher" />
          <circle
            cx={bigCentre.x}
            cy={bigCentre.y}
            r={bigR}
            fill="none"
            className="stroke-ink-soft"
            strokeWidth={1.5}
          />
          <text x={bigCentre.x} y={bigView.height - 6} textAnchor="middle" className="fill-ink-soft" fontSize={10}>
            põhjapoolkeralt vaadates
          </text>
        </svg>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Readout label="Valgustatud osa Maalt" value={`${percentLit} %`} />
        <Readout label="Faasi nimi" value={PHASE_LABEL_ET[label]} />
        <Readout label="Päev tsüklis" value={`${formatNumber(dayInCycle, 1)} / 29,5`} />
      </div>

      <SliderField
        id={sliderId}
        label="Kuu asukoht orbiidil"
        value={angleDeg}
        min={SLIDERS.phaseAngleDeg.min}
        max={SLIDERS.phaseAngleDeg.max}
        step={SLIDERS.phaseAngleDeg.step}
        onChange={(event) =>
          setAngleDeg(clampSlider(event.target.value, SLIDERS.phaseAngleDeg, DEFAULT_ANGLE_DEG))
        }
        valueText={`${formatNumber(angleDeg, 0)}°`}
        ariaValueText={`${formatNumber(angleDeg, 0)} kraadi`}
        minLabel="0° (kuuloomine)"
        maxLabel="360° (kuuloomine)"
        describedBy={sliderHintId}
      />

      {shadowAvailable ? (
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base text-ink">
            <input
              id={shadowToggleId}
              type="checkbox"
              checked={showEarthShadow}
              onChange={(event) => setShowEarthShadow(event.target.checked)}
              className="size-5 shrink-0 accent-[var(--color-brand)]"
            />
            Näita Maa varju
          </label>
          {shadowVisible ? (
            <p className="text-base leading-relaxed text-ink-soft">
              Maa täisvari hõivab orbiidist ainult {formatNumber(2 * shadowHalfAngleDeg, 1)}° (poolnurk{" "}
              {formatNumber(shadowHalfAngleDeg, 2)}°) – joonisel on see kunstlikult suurendatud, et seda üldse
              näeks. {inShadow ? "Kuu on praegu selles kitsas vööndis." : "Kuu on praegu sellest väljas."}
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

      <span id={sliderHintId} className="sr-only">
        Liuguri asend mõjutab, kui suur osa Kuust on Maalt vaadates valgustatud.
      </span>
    </div>
  );
}

/** SVG kaar (kraadides) orbiidiringi peal – Maa varju vööndi visuaal. */
function describeArc(centre: { x: number; y: number }, radius: number, startDeg: number, endDeg: number): string {
  const point = (deg: number) => moonScreenPosition(deg, radius, centre);
  const start = point(startDeg);
  const end = point(endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3 sm:flex-col sm:items-start sm:gap-1">
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      <p className="text-xl font-semibold tabular-nums text-ink sm:text-2xl">{value}</p>
    </div>
  );
}
