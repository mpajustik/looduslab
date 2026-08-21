import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { SimulationProps } from "../../../engine/simulationFeatures";
import { Button } from "../../../ui/Button";
import { formatNumber } from "../../../lib/format";
import {
  LED_EFFICACY,
  ROOMS,
  START_KELVIN,
  START_LUMENS,
} from "./activities";
import { colorTemperatureLabel, lightTint } from "./display";
import {
  SLIDERS,
  classifyColorTemperature,
  powerForLumens,
  requiredLumens,
} from "./model";

/**
 * Lambivaliku simulatsioon – ainult VAADE (sisu/MOODUL-lambivalik.md, samm
 * „explore"; docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Siin ei ole ühtki valemit: soovitatav valgusvoog (Φ = S · tihedus), võimsus
 * (P = Φ / η) ja värvuse liigitus tulevad `model.ts`-ist (CLAUDE.md reegel 1).
 * Selles failis on ainult PAIGUTUS ja see, kuidas arvud pildiks muutuvad.
 *
 * VAADE ON TOA LÄBILÕIGE: laes valgusti, all põrand, laud ja tool.
 *
 * KOLM JUHTNUPPU JA MOODULILEPING. Moodulileping lubab korraga kaks muudetavat
 * SUURUST ja neid ongi kaks: valgusvoog ja värvustemperatuur. Nupurida ei ole
 * kolmas suurus, vaid STSENAARIUMI valik – ta ei muuda lambi omadusi, vaid
 * seda, millisesse tuppa see lamp läheb. Nii on see ka spetsifikatsioonis ette
 * antud.
 *
 * KAKS ARVU KORRAGA JA MIKS. Ekraanil seisavad kõrvuti „Sinu valik" ja
 * „Soovitatav valgusvoog". Kogu samm ongi nende kahe võrdlus – üks arv üksi ei
 * ütle midagi, sest 800 lm on magamistoas vähe ja õppelaual peaaegu piisav.
 *
 * PILDI HELEDUS EI OLE FÜÜSIKA. Toa tumedus ekraanil on kuvamisotsus (vt
 * {@link dimOpacity}): mudel ei arvuta valgustatust ega valguse jaotust ruumis
 * (model.ts idealiseering 2). Seepärast ei palu ükski ülesanne pildi heledust
 * lugeda – hämarus on OSUTI, arvud on kastikestes. Ja hämarus ei ole ainus
 * märk: sama asi on kastikeses sõnadega kirjas (docs/DISAINIJUHIS.md – värv ei
 * ole kunagi ainus info kandja, ja just selles moodulis oleks värv muidu kogu
 * jutt).
 *
 * MIKS RUUMI SUURUS EKRAANIL EI MUUTU. Nupurida vahetab pindala 2 m²-st
 * 18 m²-ni, aga toa läbilõige jääb ekraanil ühesuurune – pilt näitab, KUI HELE
 * seal on, mitte kui suur ruum on. Pindala on kastikeses arvuga kirjas.
 *
 * SIMULATSIOONIL EI OLE LISAVÕIMALUSI (`simulation.unlocks`): kõik kolm
 * juhtnuppu on algusest peale lahti, sest explore-1 vajab nupurida ja
 * explore-2 kohe ka liugurit.
 */

// --- Paigutus (SVG kasutajaühikud, y kasvab ALLA) --------------------------

const VIEW = { width: 360, height: 250 };

/** Toa läbilõige: seinte, lae ja põranda vaheline ala. */
const ROOM = { left: 16, right: 344, ceiling: 16, floor: 206 };

/** Valgusti ripub lae keskel – tema all on toa kõige heledam koht. */
const LAMP_X = (ROOM.left + ROOM.right) / 2;
/** Varjundi alumine serv: siit algab valguse koonus. */
const SHADE = { y: 58, halfWidth: 26, topHalfWidth: 12, rodTop: ROOM.ceiling };

/** Kui laiaks valgus põranda juures läheb (pool laiust). */
const FLOOR_HALF_WIDTH = 122;

// --- Heledus ekraanil (kuvamisotsus, mitte füüsika) ------------------------

/**
 * Kui tume on tuba, kui valgust jääb soovitusest väheks.
 *
 * `0` = soovitus täis või ületatud, `MAX_DIM` = liuguri kõige väiksem
 * valgusvoog kõige nõudlikumas ruumis. Suhe on LINEAARNE ja see on
 * kuvamisotsus, mitte silma tundlikkuse mudel (päris silm näeb heleduse
 * kahekordistumist palju väiksema vahena) – pilt on osuti, mitte mõõteriist.
 */
const MAX_DIM = 0.55;

function dimOpacity(ratio: number): number {
  if (ratio >= 1) return 0;
  return MAX_DIM * (1 - ratio);
}

/**
 * Kui tugevalt valguse koonus paistab.
 *
 * Ka üle soovituse läheb koonus veidi tugevamaks, aga mitte lõputult – muidu
 * kaoks pilt valgesse ja „rohkem on alati parem" saaks ekraanilt tuge.
 */
function beamOpacity(ratio: number): number {
  return 0.18 + 0.42 * Math.min(ratio, 1.5);
}

// --- Ekraanitekst ----------------------------------------------------------

/** Valgusvoog ekraanile: täisarv luumeneid, nagu pakendil. */
const lumens = (value: number): string => formatNumber(value);
/** Võimsus ekraanile: täisarv vatte, nagu pakendil. */
const watts = (value: number): string => formatNumber(value);
/** Pindala ekraanile: ruumide pindalad on täisarvud. */
const squareMetres = (value: number): string => formatNumber(value);

export function Simulation(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- ühine signatuur (ModulePage annab prop alati kaasa), moodulil ei ole unlock-i.
  _props: Partial<SimulationProps> = {},
) {
  const [roomName, setRoomName] = useState<string>(ROOMS[1].name);
  const [lumensLm, setLumensLm] = useState<number>(START_LUMENS);
  const [kelvin, setKelvin] = useState<number>(START_KELVIN);
  const lumensSliderId = useId();
  const kelvinSliderId = useId();

  // Nupurida hoiab NIME, mitte objekti: nii jääb valik õigeks ka siis, kui
  // ruumide loend kunagi ümber järjestatakse.
  const room = ROOMS.find((candidate) => candidate.name === roomName) ?? ROOMS[1];

  // Ainus koht, kus füüsika sisse tuleb – kõik kolm arvu on mudelist.
  const recommendedLm = requiredLumens(room.areaM2, room.lumensPerM2);
  const powerW = powerForLumens(lumensLm, LED_EFFICACY);
  const colourClass = classifyColorTemperature(kelvin);

  const colourLabel = colorTemperatureLabel(colourClass);
  const tint = lightTint(colourClass);
  const ratio = lumensLm / recommendedLm;
  const tooDim = lumensLm < recommendedLm;

  const reset = () => {
    setRoomName(ROOMS[1].name);
    setLumensLm(START_LUMENS);
    setKelvin(START_KELVIN);
  };

  return (
    <div className="flex flex-col gap-5">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        // Kirjeldus ei korda liugurite arve (ekraanilugeja loeks siis iga
        // liuguriliigutuse peale terve lause uuesti ette) – arvud on
        // kastikestes joonise all. Ta ütleb, MIS pildil on.
        aria-label="Toa läbilõige: laes ripub varjundiga valgusti, tema alt laieneb valguse koonus põrandani, all on laud ja tool. Kui valgusvoogu on soovitusest vähem, on tuba pildil hämaram; sama on sõnadega kirjas kastikestes joonise all."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* ---- Toa seinad, lagi ja põrand ---- */}
        <rect
          x={ROOM.left}
          y={ROOM.ceiling}
          width={ROOM.right - ROOM.left}
          height={ROOM.floor - ROOM.ceiling}
          className="fill-white stroke-ink"
          strokeWidth={2}
        />

        {/* ---- Valguse koonus ----
            Toon tuleb display.ts-ist (sama silt ja sama toon, mis teooria
            joonisel), tugevus valgusvoo ja soovituse suhtest. */}
        <polygon
          points={`${LAMP_X - SHADE.halfWidth},${SHADE.y} ${LAMP_X + SHADE.halfWidth},${SHADE.y} ${LAMP_X + FLOOR_HALF_WIDTH},${ROOM.floor} ${LAMP_X - FLOOR_HALF_WIDTH},${ROOM.floor}`}
          fill={tint}
          fillOpacity={beamOpacity(ratio)}
        />

        {/* ---- Põrandajoon ---- */}
        <line
          x1={ROOM.left}
          y1={ROOM.floor}
          x2={ROOM.right}
          y2={ROOM.floor}
          className="stroke-ink"
          strokeWidth={2}
        />

        {/* ---- Laud ja tool: mõõtkava, mille järgi tuba toaks saab ---- */}
        <g className="fill-white stroke-ink" strokeWidth={2}>
          {/* Laud */}
          <rect x={214} y={164} width={96} height={7} rx={2} />
          <rect x={220} y={171} width={6} height={35} />
          <rect x={298} y={171} width={6} height={35} />
          {/* Tool: iste ja seljatugi */}
          <rect x={140} y={172} width={54} height={7} rx={2} />
          <rect x={140} y={148} width={7} height={24} rx={2} />
          <rect x={144} y={179} width={6} height={27} />
          <rect x={184} y={179} width={6} height={27} />
        </g>

        {/* ---- Hämarus ----
            Tume kate KOGU toa peal, koonuse ja mööbli peal ka: hämaras toas
            on hämar ka laud ja tool, ka lambi all. Kate on nende JÄREL,
            sest muidu jääks valge mööbel hämaras toas teravaks ja pilt
            räägiks iseendale vastu (CodeRabbiti leid, samm 4.1ppp).
            Valgusti ja sildid tulevad tema JÄREL: põlev lamp on hämaras
            toas kõige heledam asi ja sildid peavad jääma loetavaks. */}
        {tooDim ? (
          <rect
            x={ROOM.left}
            y={ROOM.ceiling}
            width={ROOM.right - ROOM.left}
            height={ROOM.floor - ROOM.ceiling}
            className="fill-ink"
            fillOpacity={dimOpacity(ratio)}
          />
        ) : null}

        {/* ---- Valgusti: ripplatt, varjund ja pirn ---- */}
        <line
          x1={LAMP_X}
          y1={SHADE.rodTop}
          x2={LAMP_X}
          y2={SHADE.y - 18}
          className="stroke-ink"
          strokeWidth={2}
        />
        <polygon
          points={`${LAMP_X - SHADE.topHalfWidth},${SHADE.y - 18} ${LAMP_X + SHADE.topHalfWidth},${SHADE.y - 18} ${LAMP_X + SHADE.halfWidth},${SHADE.y} ${LAMP_X - SHADE.halfWidth},${SHADE.y}`}
          className="fill-white stroke-ink"
          strokeWidth={2}
        />
        <circle
          cx={LAMP_X}
          cy={SHADE.y + 4}
          r={6}
          fill={tint}
          className="stroke-ink"
          strokeWidth={1.5}
        />

        {/* Sildid kõige viimasena ja valge äärisega: koonuse serv möödub
            neist napilt ja jookseks muidu neist läbi. */}
        <g className="stroke-white" strokeWidth={4} paintOrder="stroke">
          <text x={ROOM.left + 10} y={ROOM.ceiling + 20} className="fill-ink-soft" fontSize={11}>
            {room.name}
          </text>
          <text
            x={ROOM.left + 10}
            y={ROOM.ceiling + 36}
            className="fill-ink"
            fontSize={13}
            fontWeight={600}
          >
            {squareMetres(room.areaM2)} m²
          </text>
          <text
            x={ROOM.right - 10}
            y={ROOM.ceiling + 20}
            textAnchor="end"
            className="fill-ink-soft"
            fontSize={11}
          >
            {formatNumber(kelvin)} K · {colourLabel}
          </text>
          <text
            x={LAMP_X}
            y={ROOM.floor + 26}
            textAnchor="middle"
            className="fill-ink"
            fontSize={13}
            fontWeight={600}
          >
            {tooDim ? "jääb hämaraks" : "valgust on piisavalt"}
          </text>
        </g>
      </svg>

      {/* Numbrid suurelt ka joonise all: 13-pikslist silti ei loe projektorilt
          klassi tagant istuv õpilane. 360 px ekraanil lähevad kastid üksteise
          alla, mitte kõrvale. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Readout
          label="Ruum"
          value={`${room.name}, ${squareMetres(room.areaM2)} m²`}
          note={`soovitus ${lumens(room.lumensPerM2)} lm ruutmeetri kohta`}
          tone="neutral"
        />
        <Readout
          label="Soovitatav valgusvoog"
          value={`${lumens(recommendedLm)} lm`}
          note={`${squareMetres(room.areaM2)} · ${lumens(room.lumensPerM2)} – ligikaudne soovitus, mitte norm`}
          tone="neutral"
        />
        <Readout
          label="Sinu valik"
          value={`${lumens(lumensLm)} lm`}
          note={
            tooDim
              ? `soovitusest jääb puudu ${lumens(recommendedLm - lumensLm)} lm – tuba jääb hämaraks`
              : ratio >= 2
                ? "soovitus on täis – valgust on üle kahe korra rohkem, kui siia vaja"
                : "soovitus on täis"
          }
          tone={tooDim ? "no" : "yes"}
        />
        <Readout
          label="Valguse värvus"
          value={`${formatNumber(kelvin)} K – ${colourLabel}`}
          tone="colour"
        />
        <Readout
          label="Kui palju vatte kulub"
          value={`${watts(powerW)} W`}
          note={`LED-lambiga, ${formatNumber(LED_EFFICACY)} lm/W`}
          tone="real"
        />
      </div>

      <Chooser
        label="Ruum"
        options={ROOMS.map((option) => ({
          id: option.name,
          label: `${option.name} (${squareMetres(option.areaM2)} m²)`,
        }))}
        selectedId={room.name}
        onSelect={setRoomName}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor={lumensSliderId} className="text-base font-medium text-ink">
          Valgusvoog Φ (kui palju valgust lamp annab)
        </label>
        <input
          id={lumensSliderId}
          type="range"
          min={SLIDERS.lumensLm.min}
          max={SLIDERS.lumensLm.max}
          step={SLIDERS.lumensLm.step}
          value={lumensLm}
          onChange={(event) =>
            setLumensLm(clamp(event.target.value, SLIDERS.lumensLm, START_LUMENS))
          }
          // Ekraanilugeja ütleks muidu paljast arvu – ühik on siin kogu jutt.
          aria-valuetext={`${lumens(lumensLm)} luumenit`}
          className="h-11 w-full accent-brand"
        />
        <div className="flex justify-between text-sm text-ink-soft">
          <span>{lumens(SLIDERS.lumensLm.min)} lm (öölamp)</span>
          <span>{lumens(SLIDERS.lumensLm.max)} lm (väga hele)</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={kelvinSliderId} className="text-base font-medium text-ink">
          Värvustemperatuur T (mis värvi valgus on)
        </label>
        <input
          id={kelvinSliderId}
          type="range"
          min={SLIDERS.kelvin.min}
          max={SLIDERS.kelvin.max}
          step={SLIDERS.kelvin.step}
          value={kelvin}
          onChange={(event) =>
            setKelvin(clamp(event.target.value, SLIDERS.kelvin, START_KELVIN))
          }
          aria-valuetext={`${formatNumber(kelvin)} kelvinit, ${colourLabel}`}
          className="h-11 w-full accent-brand"
        />
        <div className="flex justify-between text-sm text-ink-soft">
          {/* Sildid ütlevad välja selle, mis on kogu liuguri konks: nimi ja arv
              käivad vastupidi – soe valgus on VÄIKE arv. */}
          <span>{formatNumber(SLIDERS.kelvin.min)} K (soe, kollakas)</span>
          <span>{formatNumber(SLIDERS.kelvin.max)} K (külm, sinakas)</span>
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
  return Math.min(bounds.max, Math.max(bounds.min, parsed));
}

/**
 * Üks valikurida. Nupud on LÜLITUSNUPUD (`aria-pressed`), mitte `role="radio"`
 * – sama muster mis mujal projektis (CodeRabbiti leid, samm 4.1cc):
 * `role="radio"` lubaks ekraanilugeja kasutajale nooleklahvidega liikumise ja
 * see lubadus jääks siin täitmata.
 */
function Chooser({
  label,
  options,
  selectedId,
  onSelect,
}: {
  label: string;
  options: readonly { readonly id: string; readonly label: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-base font-medium text-ink">{label}</span>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((option) => {
          const selected = option.id === selectedId;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(option.id)}
              className={`flex min-h-11 items-center rounded-full border px-4 text-base focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 ${
                selected
                  ? "border-brand bg-brand-soft font-semibold text-ink"
                  : "border-line text-ink"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Üks suurus suurelt. Värvitriip kordab joonise värvi, info kannab SILT. */
function Readout({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  tone: "real" | "neutral" | "yes" | "no" | "colour";
}) {
  // Klassinimed on tervikuna välja kirjutatud, mitte stringidest kokku pandud:
  // Tailwind loeb lähtekoodi tekstina ja `bg-${tone}` kaoks stiililehelt
  // vaikselt ära.
  const stripe =
    tone === "real"
      ? "bg-brand"
      : tone === "yes"
        ? "bg-correct"
        : tone === "no"
          ? "bg-retry"
          : tone === "colour"
            ? "bg-info"
            : "bg-ink-soft";
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-line p-3">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className={`h-1 w-5 shrink-0 rounded-full ${stripe}`} />
        <span className="text-sm font-medium text-ink-soft">{label}</span>
      </div>
      <p className="text-xl font-semibold tabular-nums text-ink sm:text-2xl">{value}</p>
      {/* „Jääb hämaraks" on SÕNA, mitte pildi tumedus – triip ja pilt ainult
          kordavad teda (DISAINIJUHIS: värv ei ole kunagi ainus info kandja). */}
      {note ? <p className="text-sm text-ink-soft">{note}</p> : null}
    </div>
  );
}
