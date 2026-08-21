import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { SimulationProps } from "../../../engine/simulationFeatures";
import { Button } from "../../../ui/Button";
import { SliderField } from "../../../ui/SliderField";
import { formatNumber } from "../../../lib/format";
import {
  EXAMPLE_OBJECTS,
  SLIDERS,
  classifyBrightness,
  classifySharpness,
  holeDiameterFromMm,
  metersToCm,
  pinholeBlurWidth,
  pinholeImageHeight,
  pinholeMagnification,
  type ExampleObjectId,
} from "./model";

/**
 * Nõelaugukaamera simulatsioon – ainult VAADE
 * (sisu/MOODUL-valguse-sirgjooneline-levimine.md samm „explore";
 * docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Füüsikat siin ei arvutata: kujutise kõrguse annab `pinholeImageHeight`,
 * suurenduse `pinholeMagnification`, udu `pinholeBlurWidth` ja sõna „terav" /
 * „udune" `classifySharpness` (CLAUDE.md reegel 1). Liugurite piirid tulevad
 * mudeli `SLIDERS`-ist, sest nendest sõltub, kas ülesande vastus on üldse
 * seatav. See fail arvutab ainult PIKSLEID.
 *
 * **Joonise kokkulepe:** kambri sügavus ja kujutise kõrgus on omavahel õiges
 * suhtes (üks ja sama `scale`), KAUGUS mitte – 0,5 m ja 40 m ei mahu ühele
 * skaalale ja ese seisab seepärast alati mugaval kaugusel, päris kaugus on
 * kirjas arvuna. Sama otsus mis moodulis `valgusallikad`, ainult et seal oli
 * päris nurk ja siin on päris suhe.
 *
 * Eseme joonistatud kõrgus tuleb KIIRTEST tagasi, mitte meetritest: kaks kiirt
 * peavad lõikuma täpselt augus, seega eseme poolkõrgus on kujutise poolkõrgus
 * korda „mitu korda on joonisel ese august kaugemal kui ekraan". Nii on joonis
 * iseendaga kooskõlas ka siis, kui kaugus on kokku surutud.
 *
 * **Kaks muudetavat suurust korraga** (moodulileping): kaugus ja kambri
 * sügavus. Augu liugur avaneb alles pärast ülesannet 2 (`unlockedFeatures`, vt
 * activities.ts `simulation.unlocks`) – enne seda peab õpilane nägema, et
 * suurus sõltub AINULT kaugusest ja kambrist. Eseme kõrgus ei ole liugur, vaid
 * nupurea valik: küünal · inimene · puu · maja.
 */

// --- Feature-silt ------------------------------------------------------------

/** Silt, mida see fail explore-sammu `unlockedFeatures` seast otsib. */
const HOLE_FEATURE = "augu-labimoot";

// --- Avavaade ----------------------------------------------------------------

/**
 * Algseis on puu 12 m kauguselt, kamber 0,3 m – MITTE ükski ülesande seis
 * (ülesanded küsivad kambrit 0,2 ja 0,4 m, väljumispilet maja 0,25 m kambriga).
 * Nii ei näe õpilane vastust enne, kui ta selle ise seab.
 *
 * Puu on siin sellepärast, et tema juures on kujutis ja kamber joonisel kõige
 * paremas suhtes: kujutise kõrgus on `h / (2L)` osa kambri sügavusest, seega
 * lähedal olev kõrge ese annab suurima kujutise. Maja 40 m kauguselt jätaks
 * joonisele õhukese kriipsu.
 */
const DEFAULT_OBJECT: ExampleObjectId = "puu";
const DEFAULT_DISTANCE_M = EXAMPLE_OBJECTS.puu.distanceM;
const DEFAULT_DEPTH_M = 0.3;
const DEFAULT_HOLE_MM = 2;

/** Nupurea eestikeelsed nimed. Arvud on mudelis, nimed on kasutajaliidese asi. */
const EXAMPLE_LABELS: Record<ExampleObjectId, string> = {
  kuunal: "küünal",
  inimene: "inimene",
  puu: "puu",
  maja: "maja",
};

const EXAMPLE_IDS = Object.keys(EXAMPLE_LABELS) as ExampleObjectId[];

// --- Paigutus (SVG kasutajaühikud, y kasvab ALLA) ---------------------------

const VIEW = { width: 360, height: 220 };
/** Optiline telg: eseme keskkoht, auk ja kujutise keskkoht on kõik sellel. */
const AXIS_Y = 100;
/** Ekraan seisab alati siin, auk temast kambri sügavuse võrra vasakul. */
const SCREEN_X = 330;
/** Kui lähedale joonise vasakule servale ese tulla tohib. */
const OBJECT_MIN_X = 14;

/** Kambri joonistatud sügavus jääb nende piiride vahele. */
const CHAMBER_MAX_PX = 132;
const CHAMBER_MIN_PX = 30;
/** Kujutise ja eseme suurim joonistatud POOLkõrgus. */
const IMAGE_MAX_HALF_PX = 68;
const OBJECT_MAX_HALF_PX = 74;
/** Eelistatud kaugus esemest augu tasapinnani – kokku surutud, vt päis. */
const PREFERRED_ARM_PX = 150;
/** Alla selle ese enam ei tule: siis ei mahuks tema silt ega nool ära. */
const MIN_ARM_PX = 40;
/** Udu riba joonisel – päris arv on näidikul, riba on ainult märk. */
const MAX_BLUR_BAND_PX = 22;

/**
 * Kujutise ja kambri ühine skaala (pikslit meetri kohta).
 *
 * PAIGUTUS, mitte füüsika. Skaala valitakse nii, et kumbki neist kahest ära
 * mahuks, ja ta on MÕLEMAL sama – just see hoiab suhte ausana. Alumine piir
 * (`CHAMBER_MIN_PX`) on selleks, et väga suure kujutise juures ei kahaneks
 * kamber paari piksli laiuseks paelaks; siis kujutis enam ei mahu ja seda
 * ÜTLEME ka (`clipped`).
 */
function pixelsPerMetre(boxDepthM: number, imageHeightM: number): number {
  const fitting = Math.min(
    CHAMBER_MAX_PX / boxDepthM,
    (2 * IMAGE_MAX_HALF_PX) / imageHeightM,
  );
  return Math.max(fitting, CHAMBER_MIN_PX / boxDepthM);
}

/**
 * Kujutise kõrgus – SAMA arv kahes ühikus, seega kohtade arv peab olema selline,
 * et nad ei saaks teineteisele vastu rääkida.
 *
 * Kambri sügavusel 0,21 m on kujutis 0,105 m. Kui sentimeetrid ümardada
 * täisarvuks („11 cm") ja meetrid kahele kohale („0,10 m"), seisab ekraanil
 * kaks eri arvu ühe ja sama asja kohta – täpselt see mure, mis oli moodulis
 * `valgusallikad` suhte ja kauguse vahel. Seepärast on sentimeetritel alati üks
 * koht ja meetritel alla ühe meetri kolm.
 */
function formatImageCentimetres(valueM: number): string {
  const cm = metersToCm(valueM);
  return `${formatNumber(cm, cm < 100 ? 1 : 0)} cm`;
}

function formatImageMetres(valueM: number): string {
  return `${formatNumber(valueM, valueM < 1 ? 3 : 1)} m`;
}

/** Eseme kõrgus: 0,2 m · 1,8 m · 6,0 m – üks koht on siin täpselt paras. */
function formatObjectHeight(valueM: number): string {
  return `${formatNumber(valueM, 1)} m`;
}

/** Kaugus ja kambri sügavus – täpselt nii peeneks, kui liugur minna saab. */
function formatDistance(distanceM: number): string {
  return `${formatNumber(distanceM, 1)} m`;
}

function formatDepth(depthM: number): string {
  return `${formatNumber(depthM, 2)} m`;
}

function formatHole(holeMm: number): string {
  return `${formatNumber(holeMm, 1)} mm`;
}

/** Udu laius on millimeetrite kandis – meetrites oleks „0,002 m" loetamatu. */
function formatBlur(blurM: number): string {
  return `${formatNumber(blurM * 1000, 1)} mm`;
}

/**
 * Mitu korda kujutis esemest väiksem (või suurem) on.
 *
 * Suurenduse annab mudel; siin pööratakse ta ainult kujule, mida õpilane
 * ülesannetes kasutab („60 korda väiksem"). Täpselt 1 juures ei ole kumbagi.
 */
function describeMagnification(magnification: number): string {
  if (magnification > 1) return `${formatNumber(magnification, 1)} korda suurem`;
  if (magnification === 1) return "sama suur";
  return `${formatNumber(1 / magnification, 1)} korda väiksem`;
}

/**
 * Liuguri väärtus mudelile kõlblikuks. Mudel viskab vahemikust väljas vea (see
 * on tahtlik – vt model.ts), seega vaade ei tohi talle midagi kahtlast anda.
 */
function clampSlider(
  value: string,
  limits: { min: number; max: number },
  fallback: number,
): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(limits.max, Math.max(limits.min, parsed));
}

export function Simulation({ unlockedFeatures = new Set() }: Partial<SimulationProps> = {}) {
  const [objectId, setObjectId] = useState<ExampleObjectId>(DEFAULT_OBJECT);
  // `<number>` on vajalik: `EXAMPLE_OBJECTS` on `as const`, seega vaikimisi
  // järeldaks TypeScript olekuks kitsa literaali (40) ja liuguri väärtust ei
  // saaks enam sinna panna.
  const [distanceM, setDistanceM] = useState<number>(DEFAULT_DISTANCE_M);
  const [depthM, setDepthM] = useState<number>(DEFAULT_DEPTH_M);
  const [holeMm, setHoleMm] = useState<number>(DEFAULT_HOLE_MM);
  const distanceSliderId = useId();
  const depthSliderId = useId();
  const holeSliderId = useId();

  // Augu liugur ilmub alles pärast ülesannet 2; seni jääb auk avavaate peale.
  const holeAvailable = unlockedFeatures.has(HOLE_FEATURE);

  const objectHeightM = EXAMPLE_OBJECTS[objectId].heightM;
  const imageHeightM = pinholeImageHeight(objectHeightM, distanceM, depthM);
  const magnification = pinholeMagnification(distanceM, depthM);
  const holeM = holeDiameterFromMm(holeMm);
  const blurM = pinholeBlurWidth(holeM, distanceM, depthM);
  // Kaks sõltumatut otsust, mõlemad mudelist: teravus tuleb udu ja kujutise
  // kõrguse suhtest, heledus ainult augu suurusest.
  const sharpness = classifySharpness(blurM, imageHeightM);
  const brightness = classifyBrightness(holeM);

  // --- Joonise pikslid ------------------------------------------------------
  const scale = pixelsPerMetre(depthM, imageHeightM);
  const depthPx = depthM * scale;
  const wallX = SCREEN_X - depthPx;
  const wantedImageHalf = (imageHeightM * scale) / 2;
  const imageHalf = Math.min(wantedImageHalf, IMAGE_MAX_HALF_PX);
  // Kiire tõus august ekraanini – ese joonistatakse sellesama tõusuga tagasi.
  const slope = imageHalf / depthPx;
  const armPx = Math.max(
    MIN_ARM_PX,
    Math.min(PREFERRED_ARM_PX, wallX - OBJECT_MIN_X, OBJECT_MAX_HALF_PX / slope),
  );
  const objectHalf = Math.min(slope * armPx, OBJECT_MAX_HALF_PX);
  const objectX = wallX - armPx;
  // Kui kujutis või ese joonisele ära ei mahu, on kiirte murdepunkt augu kohal
  // natuke paigast – siis ÜTLEME seda, et keegi ei mõõdaks joonise pealt.
  const clipped =
    wantedImageHalf > IMAGE_MAX_HALF_PX || slope * armPx > OBJECT_MAX_HALF_PX + 0.5;
  const blurBandPx = Math.min(blurM * scale, MAX_BLUR_BAND_PX);
  /**
   * Suurem auk laseb rohkem valgust läbi, seega kujutis on heledam.
   *
   * Läbipaistvus on SUJUV, sõna `brightness` järsk – ja see on meelega: joonis
   * tohib heledust näidata pidevalt (silm loeb seda hästi), aga VÄIDE ekraanil
   * peab tulema mudeli piirilt, mitte selle astmiku pealt. Sellepärast ei ole
   * siin oma piiri, ainult otspunktid.
   *
   * Alumine ots on 0,5, mitte 0: kõige väiksema augu juures on kujutis hämar,
   * aga ta peab joonisel ikka NÄHTAV olema.
   */
  const holeShare =
    (holeMm - SLIDERS.holeMm.min) / (SLIDERS.holeMm.max - SLIDERS.holeMm.min);
  const imageOpacity = 0.5 + 0.45 * holeShare;

  const reset = () => {
    setObjectId(DEFAULT_OBJECT);
    setDistanceM(DEFAULT_DISTANCE_M);
    setDepthM(DEFAULT_DEPTH_M);
    setHoleMm(DEFAULT_HOLE_MM);
  };

  return (
    <div className="flex flex-col gap-5">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        // Arvud on siltides joonise all – ekraanilugeja saab need sealt.
        // Kirjeldus ei muutu iga liuguri sammuga, muidu loeks ekraanilugeja
        // terve lause iga kord uuesti ette.
        aria-label="Joonis: vasakul seisab ese, keskel auguga sein ja paremal ekraan. Kaks kiiret eseme ülemisest ja alumisest otsast lähevad läbi augu ja lõikuvad seal, seega ekraanil on kujutis pea peal."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Kamber: august ekraanini. Hele täidis näitab, et see on karbi sisu. */}
        <rect
          x={wallX}
          y={AXIS_Y - IMAGE_MAX_HALF_PX - 12}
          width={depthPx}
          height={2 * (IMAGE_MAX_HALF_PX + 12)}
          className="fill-info"
          fillOpacity={0.07}
        />

        {/* Optiline telg – abijoon, seega katkendlik ja vaikne. */}
        <line
          x1={objectX}
          y1={AXIS_Y}
          x2={SCREEN_X}
          y2={AXIS_Y}
          className="stroke-ink-soft"
          strokeWidth={1}
          strokeDasharray="4 4"
        />

        {/* Kaks kiirt: ülemisest otsast läbi augu ALLA, alumisest ÜLES. Just
            need kaks joont ongi kogu mooduli vastus – kujutis on pea peal
            ainuüksi sellepärast, et valgus levib sirgelt. */}
        <g className="stroke-ink" strokeWidth={1.5}>
          <polyline
            points={`${objectX},${AXIS_Y - objectHalf} ${wallX},${AXIS_Y} ${SCREEN_X},${AXIS_Y + imageHalf}`}
            className="fill-none"
          />
          <polyline
            points={`${objectX},${AXIS_Y + objectHalf} ${wallX},${AXIS_Y} ${SCREEN_X},${AXIS_Y - imageHalf}`}
            className="fill-none"
          />
        </g>

        {/* Sein augusega: kaks tükki, nende vahele jääb auk. Auk on joonisel
            MEELEGA suurendatud – 2 mm oleks selle skaalal nähtamatu ja siis ei
            saaks aru, kust kiired läbi lähevad. Augu päris mõju näitab udu
            riba kujutise otstes, mitte augu enda suurus. */}
        <g className="fill-ink">
          <rect x={wallX - 2} y={4} width={4} height={AXIS_Y - 4 - 7} />
          <rect x={wallX - 2} y={AXIS_Y + 7} width={4} height={VIEW.height - AXIS_Y - 7 - 26} />
        </g>
        <text x={wallX} y={VIEW.height - 12} textAnchor="middle" className="fill-ink-soft" fontSize={12}>
          auk
        </text>

        {/* Ese: paks joon, tipus märk. Märk on selleks, et kujutise juures
            oleks näha, et TIPP on all – ümberpööramine on joonise omadus,
            mitte arv (model.ts tagastab ainult positiivseid pikkusi). */}
        <g className="stroke-ink" strokeWidth={3}>
          <line x1={objectX} y1={AXIS_Y - objectHalf} x2={objectX} y2={AXIS_Y + objectHalf} />
        </g>
        <circle cx={objectX} cy={AXIS_Y - objectHalf} r={4} className="fill-brand" />
        <text
          x={objectX}
          y={AXIS_Y - objectHalf - 10}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={12}
          stroke="white"
          strokeWidth={4}
          paintOrder="stroke"
        >
          {EXAMPLE_LABELS[objectId]}
        </text>

        {/* Ekraan */}
        <line
          x1={SCREEN_X}
          y1={AXIS_Y - IMAGE_MAX_HALF_PX - 12}
          x2={SCREEN_X}
          y2={AXIS_Y + IMAGE_MAX_HALF_PX + 12}
          className="stroke-ink-soft"
          strokeWidth={3}
        />

        {/* Kujutis: sama paks joon, aga märk ALL – pea peal. Läbipaistvus
            muutub augu suurusega (suurem auk = rohkem valgust = heledam
            kujutis), otstes olev udu riba augu tekitatud määrdumisega. */}
        <g className="stroke-brand" strokeWidth={5} strokeOpacity={imageOpacity}>
          <line x1={SCREEN_X} y1={AXIS_Y - imageHalf} x2={SCREEN_X} y2={AXIS_Y + imageHalf} />
        </g>
        <circle
          cx={SCREEN_X}
          cy={AXIS_Y + imageHalf}
          r={4}
          className="fill-brand"
          fillOpacity={imageOpacity}
        />
        {[AXIS_Y - imageHalf, AXIS_Y + imageHalf].map((y) => (
          <rect
            key={y}
            x={SCREEN_X - 4}
            y={y - blurBandPx / 2}
            width={8}
            height={blurBandPx}
            className="fill-brand"
            fillOpacity={0.3}
          />
        ))}
        <text
          x={SCREEN_X}
          y={AXIS_Y + IMAGE_MAX_HALF_PX + 26}
          textAnchor="end"
          className="fill-ink-soft"
          fontSize={12}
        >
          kujutis ekraanil
        </text>

        {/* Kaugusnool: arv kannab info, joone PIKKUS mitte (vt päis). */}
        <g className="stroke-ink-soft" strokeWidth={1.5}>
          <line x1={objectX} y1={26} x2={wallX} y2={26} />
          <line x1={objectX} y1={21} x2={objectX} y2={31} />
          <line x1={wallX} y1={21} x2={wallX} y2={31} />
        </g>
        {/* Number keskele noole kohale ja lühidalt – pikk silt jookseks seinast
            läbi. Selgitus, MIKS nool päris pikkust ei näita, on eraldi real
            noole all, kus on niikuinii tühja ruumi. */}
        <text
          x={(objectX + wallX) / 2}
          y={18}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={12}
          stroke="white"
          strokeWidth={4}
          paintOrder="stroke"
        >
          {formatDistance(distanceM)}
        </text>
        {/* Selgitus vasakusse alanurka: seal on tühja ruumi ega ole eseme silti
            ega „auk"-silti, mis jääb seina juurde. */}
        <text x={8} y={VIEW.height - 12} className="fill-ink-soft" fontSize={11}>
          joonisel on kaugus lühendatud
        </text>
      </svg>

      {clipped ? (
        <p className="text-sm text-ink-soft">
          Nii suur kujutis ei mahu joonisele ära – päris arv on näidikul. Vii ese kaugemale või tee
          kamber lühemaks, siis on joonis jälle täpne.
        </p>
      ) : null}

      {/* Numbrid suurelt joonise all: projektorilt ei loe kaugelt istuv õpilane
          12-pikslist silti (sama põhjendus mis teistel moodulitel). */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Readout label="Kujutise kõrgus" value={formatImageCentimetres(imageHeightM)} tone="image" />
        <Readout
          label="Kujutis on esemest"
          value={describeMagnification(magnification)}
          tone="magnification"
        />
      </div>

      {/* Sõna üksi ei ole info kandja (DISAINIJUHIS): joonisel muutub koos
          sellega kujutise serv ja heledus. Piiri arvu ütleb mudel. */}
      <p className="text-sm text-ink-soft">
        Serva udu on {formatBlur(blurM)} – kujutis on{" "}
        {sharpness === "sharp" ? "terav" : "udune"} ja{" "}
        {brightness === "bright" ? "hele" : "hämar"}. Kujutise kõrgus meetrites:{" "}
        {formatImageMetres(imageHeightM)}.
      </p>

      <SliderField
        id={distanceSliderId}
        label="Kaugus esemeni"
        value={distanceM}
        min={SLIDERS.distanceM.min}
        max={SLIDERS.distanceM.max}
        step={SLIDERS.distanceM.step}
        onChange={(event) =>
          setDistanceM(clampSlider(event.target.value, SLIDERS.distanceM, DEFAULT_DISTANCE_M))
        }
        valueText={formatDistance(distanceM)}
        ariaValueText={`${formatNumber(distanceM, 1)} meetrit`}
        minLabel={formatDistance(SLIDERS.distanceM.min)}
        maxLabel={formatDistance(SLIDERS.distanceM.max)}
      />

      <SliderField
        id={depthSliderId}
        label="Kambri sügavus"
        value={depthM}
        min={SLIDERS.boxDepthM.min}
        max={SLIDERS.boxDepthM.max}
        step={SLIDERS.boxDepthM.step}
        onChange={(event) =>
          setDepthM(clampSlider(event.target.value, SLIDERS.boxDepthM, DEFAULT_DEPTH_M))
        }
        valueText={formatDepth(depthM)}
        ariaValueText={`${formatNumber(depthM, 2)} meetrit`}
        minLabel={formatDepth(SLIDERS.boxDepthM.min)}
        maxLabel={formatDepth(SLIDERS.boxDepthM.max)}
      />

      {/* Augu liugur avaneb pärast ülesannet 2 – enne seda on nähtaval kaks
          muudetavat suurust, nii nagu moodulileping nõuab. */}
      {holeAvailable ? (
        <SliderField
          id={holeSliderId}
          label="Augu läbimõõt"
          value={holeMm}
          min={SLIDERS.holeMm.min}
          max={SLIDERS.holeMm.max}
          step={SLIDERS.holeMm.step}
          onChange={(event) =>
            setHoleMm(clampSlider(event.target.value, SLIDERS.holeMm, DEFAULT_HOLE_MM))
          }
          valueText={formatHole(holeMm)}
          ariaValueText={`${formatNumber(holeMm, 1)} millimeetrit`}
          minLabel={formatHole(SLIDERS.holeMm.min)}
          maxLabel={formatHole(SLIDERS.holeMm.max)}
        />
      ) : null}

      {/* Näited: kiirvalik, mis paneb paika eseme kõrguse ja tema tüüpilise
          kauguse. Kambri sügavus jääb puutumata – tema on ülesande enda asi. */}
      <div className="flex flex-col gap-2 border-t border-line pt-4">
        <span className="text-base font-medium text-ink">Päris näited</span>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_IDS.map((id) => {
            const selected = objectId === id && distanceM === EXAMPLE_OBJECTS[id].distanceM;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setObjectId(id);
                  setDistanceM(EXAMPLE_OBJECTS[id].distanceM);
                }}
                className={`flex min-h-11 items-center rounded-full border px-4 text-base focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 ${
                  selected ? "border-brand bg-brand-soft font-semibold text-ink" : "border-line text-ink"
                }`}
              >
                {EXAMPLE_LABELS[id]}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-ink-soft">
          Ese on {formatObjectHeight(objectHeightM)} kõrge. Kauguse saad pärast nupuvajutust
          liuguriga muuta.
        </p>
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

/** Üks suurus suurelt. Värv kordab joonise värvi, aga info kannab SILT. */
function Readout({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "image" | "magnification";
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3 sm:flex-col sm:items-start sm:gap-1">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`h-1 w-5 shrink-0 rounded-full ${tone === "image" ? "bg-brand" : "bg-info"}`}
        />
        <span className="text-sm font-medium text-ink-soft">{label}</span>
      </div>
      {/* „10 cm" mahub suurimas astmes ka telefoni, „60 korda väiksem" mitte –
          seepärast on tema aste väiksem ja tohib murduda. */}
      <p
        className={`font-semibold tabular-nums text-ink ${
          tone === "image" ? "whitespace-nowrap text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
