import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { SimulationProps } from "../../../engine/simulationFeatures";
import { Button } from "../../../ui/Button";
import { formatNumber } from "../../../lib/format";
import {
  BALL_DIAMETER_M,
  SLIDERS,
  hasUmbra,
  metersToCm,
  penumbraBandWidth,
  totalShadowWidth,
  umbraLengthBehindObject,
  umbraWidth,
} from "./model";

/**
 * Täisvarju ja poolvarju simulatsioon – ainult VAADE
 * (sisu/MOODUL-vari-ja-poolvari.md samm „explore";
 * docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Füüsikat siin ei arvutata: täisvarju laiuse annab `umbraWidth`, poolvarju
 * riba `penumbraBandWidth`, kogu varju `totalShadowWidth`, täisvarju otsa
 * `umbraLengthBehindObject` ja VÄITE „täisvarju ei ole" `hasUmbra` (CLAUDE.md
 * reegel 1). Liugurite piirid tulevad mudeli `SLIDERS`-ist, sest nendest
 * sõltub, kas ülesande vastus on üldse seatav, ja veel enam – nemad hoiavad
 * püsti eelduse `b > a`. See fail arvutab ainult PIKSLEID.
 *
 * **Joonise kokkulepe: kaugused on õiges suhtes, laiused mitte.** Vaakuskaala
 * (`PX_PER_M_X`) on püsiv – kogu 0–5 m mahub korraga ekraanile ja liugurit
 * liigutades LIIGUB ekraan päriselt kaugemale. Püstsuunas on oma skaala
 * (`scaleY`), sest kogu vari võib olla 0,16 m või 4,6 m lai ja üks skaala
 * kumbagi otsa ära ei kanna. Erinev püstskaala ei riku joonist: ta venitab
 * ainult y-telge, seega sirge jääb sirgeks ja kiired lõikuvad täpselt seal,
 * kus varju piir on. Joonis ütleb selle ka ise ühe reaga välja.
 *
 * **Kiirte otsad arvutatakse joonisel sirge pikendamisena, mitte valemist
 * uuesti** (sama otsus mis moodulis `valguse-sirgjooneline-levimine`, kus eseme
 * kõrgus tuli kiirtest tagasi): nii ei saa joonis ja arv teineteisele vastu
 * rääkida. Kuna `scaleY` on kõigil püstsuurustel üks ja sama, on kiire ots
 * ekraanil täpselt `scaleY` korda mudeli antud pool-laius – seni kui täisvari
 * on olemas. Pärast selle kadumist lähevad sisemised kiired risti üle telje ja
 * see ongi õige pilt: kogu vari on siis poolvari.
 *
 * **Kaks muudetavat suurust korraga** (moodulileping): allika laius ja ekraani
 * kaugus. Palli kauguse liugur avaneb alles pärast ülesannet 2
 * (`unlockedFeatures`, vt activities.ts `simulation.unlocks`) – enne seda peab
 * õpilane nägema, et täisvarju kitsamaks tegi ALLIKA LAIUS. Palli läbimõõt ei
 * ole liugur üldse (`BALL_DIAMETER_M`).
 */

// --- Feature-silt ------------------------------------------------------------

/** Silt, mida see fail explore-sammu `unlockedFeatures` seast otsib. */
const BALL_DISTANCE_FEATURE = "palli-kaugus";

// --- Avavaade ----------------------------------------------------------------

/**
 * Algseis EI ole ükski ülesande seis (ülesanded küsivad allikat 0, 5 ja 20 cm
 * ning ekraani 3 ja 1,2…2 m) – nii ei näe õpilane vastust enne, kui ta selle
 * ise seab.
 *
 * 10 cm lai allikas 2,5 m peal annab korraga nähtava täisvarju (10 cm) ja
 * nähtava poolvarju riba (15 cm): kohe avanedes on mõlemad mõisted pildil
 * olemas, kumbki ei ole null.
 */
const DEFAULT_SOURCE_M = 0.1;
const DEFAULT_SCREEN_M = 2.5;
/** Spetsifikatsiooni algväärtus: pall 1 m kaugusel allikast. */
const DEFAULT_BALL_M = SLIDERS.objectDistanceM.max;

// --- Paigutus (SVG kasutajaühikud, y kasvab ALLA) ---------------------------

// Kõrgus on 258, mitte 240: kaks kaugusnoolt ja nende all olev selgitav rida
// vajavad igaüks oma rea, muidu jookseb tekst noolest läbi (leitud brauseris).
const VIEW = { width: 360, height: 258 };
/** Optiline telg: allika, palli ja varju keskkoht on kõik sellel. */
const AXIS_Y = 104;
/** Allikas seisab siin ja tähistab kaugust 0 m. */
const SOURCE_X = 22;
/** Siia jõuab ekraan siis, kui liugur on lõpuni paremal. */
const SCREEN_MAX_X = 344;

/**
 * Vaakuskaala (pikslit meetri kohta) – PÜSIV, mitte sisust sõltuv.
 *
 * Just püsivus teeb joonise ausaks: kui ekraani liugur läheb 1,2 m-lt 5 m-le,
 * nihkub ekraan joonisel sama palju kordi kaugemale. Sellepärast saab siin
 * kaugusi joonise pealt võrrelda, erinevalt nõelaugukaamerast.
 */
const PX_PER_M_X = (SCREEN_MAX_X - SOURCE_X) / SLIDERS.screenDistanceM.max;

/** Suurim püstsuunaline POOLkõrgus: nii varjul kui ka allikal. */
const MAX_HALF_PX = 88;
/**
 * Püstskaala piirid (pikslit meetri kohta).
 *
 * Ülemine piir hoiab ära, et kõige kitsam vari (0,16 m) täidaks kogu joonise;
 * alumine piir hoiab palli nähtavana ka siis, kui vari on meetrite laiune –
 * ilma selleta kahaneks 10 cm pall paari piksli täpiks. Alumise piiri hinnaks
 * on see, et kõige laiem vari joonisele enam ei mahu, ja seda me ÜTLEME
 * (`clipped`), et keegi ei hakkaks joonise pealt arvu mõõtma.
 */
const MAX_SCALE_Y = 420;
const MIN_SCALE_Y = 90;

/** Varju riba laius ekraanil – joonise element, mitte mõõt. */
const BAND_PX = 10;

// --- Vormindus ---------------------------------------------------------------

/**
 * Varju laius – SAMA arv on all real ka meetrites, seega kohtade arv peab olema
 * selline, et nad ei saaks teineteisele vastu rääkida (sama mure ja sama
 * lahendus mis moodulis `valguse-sirgjooneline-levimine`): sentimeetritel üks
 * koht alla meetri, meetritel kolm.
 */
function formatShadowCm(valueM: number): string {
  const cm = metersToCm(valueM);
  return `${formatNumber(cm, cm < 100 ? 1 : 0)} cm`;
}

function formatShadowMetres(valueM: number): string {
  return `${formatNumber(valueM, valueM < 1 ? 3 : 1)} m`;
}

/** Kaugused – täpselt nii peeneks, kui liugur minna saab (samm 0,1 m). */
function formatDistance(valueM: number): string {
  return `${formatNumber(valueM, 1)} m`;
}

/** Allika laius liuguril: samm on 1 cm, seega täisarv sentimeetreid. */
function formatSourceWidth(valueM: number): string {
  return `${formatNumber(metersToCm(valueM), 0)} cm`;
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
  const [sourceWidthM, setSourceWidthM] = useState<number>(DEFAULT_SOURCE_M);
  const [screenDistanceM, setScreenDistanceM] = useState<number>(DEFAULT_SCREEN_M);
  const [objectDistanceM, setObjectDistanceM] = useState<number>(DEFAULT_BALL_M);
  const sourceSliderId = useId();
  const screenSliderId = useId();
  const ballSliderId = useId();
  const gradientId = useId();

  // Palli kauguse liugur ilmub alles pärast ülesannet 2.
  const ballDistanceAvailable = unlockedFeatures.has(BALL_DISTANCE_FEATURE);

  // --- Füüsika (kõik mudelist) ----------------------------------------------
  const umbraM = umbraWidth(BALL_DIAMETER_M, sourceWidthM, objectDistanceM, screenDistanceM);
  const penumbraM = penumbraBandWidth(sourceWidthM, objectDistanceM, screenDistanceM);
  const totalM = totalShadowWidth(
    BALL_DIAMETER_M,
    sourceWidthM,
    objectDistanceM,
    screenDistanceM,
  );
  const umbraVisible = hasUmbra(
    BALL_DIAMETER_M,
    sourceWidthM,
    objectDistanceM,
    screenDistanceM,
  );
  /** Kaugus ALLIKAST, kus täisvari teravikuga lõpeb; lõpmatus = ei lõpegi. */
  const umbraEndsM =
    objectDistanceM +
    umbraLengthBehindObject(BALL_DIAMETER_M, sourceWidthM, objectDistanceM);

  // --- Joonise pikslid ------------------------------------------------------
  // Püstskaala valitakse nii, et kõik kolm püstsuurust ära mahuksid, ja ta on
  // neil KÕIGIL sama – just see hoiab kiired sirgena ja varju piirid õiges
  // kohas.
  const fittingScaleY =
    (2 * MAX_HALF_PX) / Math.max(totalM, sourceWidthM, BALL_DIAMETER_M);
  const scaleY = Math.min(MAX_SCALE_Y, Math.max(MIN_SCALE_Y, fittingScaleY));
  const clipped = fittingScaleY < MIN_SCALE_Y;

  const sourceHalfPx = (sourceWidthM * scaleY) / 2;
  const ballHalfPx = (BALL_DIAMETER_M * scaleY) / 2;
  const umbraHalfPx = (umbraM * scaleY) / 2;
  const ballX = SOURCE_X + objectDistanceM * PX_PER_M_X;
  const screenX = SOURCE_X + screenDistanceM * PX_PER_M_X;

  /**
   * Kiir allika servast üle palli serva ekraanini: sirge pikendamine, ei muud.
   * Palli serv on kiire murdepunkt, seega ülemise ala mõlemad piirid lähtuvad
   * ühest ja samast punktist – palli ülemisest servast.
   */
  const projectToScreen = (sourceEdgeY: number, ballEdgeY: number) =>
    sourceEdgeY +
    ((ballEdgeY - sourceEdgeY) * (screenX - SOURCE_X)) / (ballX - SOURCE_X);

  const ballTopY = AXIS_Y - ballHalfPx;
  const ballBottomY = AXIS_Y + ballHalfPx;
  // Sisemine kiir = täisvarju piir (allika SAMA serv), välimine = kogu varju
  // piir (allika VASTASserv, mis paistab palli tagant kõige rohkem mööda).
  const upperInnerY = projectToScreen(AXIS_Y - sourceHalfPx, ballTopY);
  const upperOuterY = projectToScreen(AXIS_Y + sourceHalfPx, ballTopY);
  const lowerInnerY = 2 * AXIS_Y - upperInnerY;
  const lowerOuterY = 2 * AXIS_Y - upperOuterY;

  // Täisvarju koonus: kas jõuab ekraanini või lõpeb enne seda teravikuga. See
  // teravik ongi ülesande 3 vastus – aga ARVUNA teda kuskil ei näidata, sest
  // just selle peab õpilane liuguriga ise üles otsima.
  const umbraTipBeforeScreen = umbraEndsM < screenDistanceM;
  const umbraTipX = SOURCE_X + umbraEndsM * PX_PER_M_X;
  const umbraPoints = umbraTipBeforeScreen
    ? `${ballX},${ballTopY} ${umbraTipX},${AXIS_Y} ${ballX},${ballBottomY}`
    : `${ballX},${ballTopY} ${screenX},${AXIS_Y - umbraHalfPx} ${screenX},${AXIS_Y + umbraHalfPx} ${ballX},${ballBottomY}`;

  const reset = () => {
    setSourceWidthM(DEFAULT_SOURCE_M);
    setScreenDistanceM(DEFAULT_SCREEN_M);
    setObjectDistanceM(DEFAULT_BALL_M);
  };

  return (
    <div className="flex flex-col gap-5">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        // Arvud on siltides joonise all – ekraanilugeja saab need sealt.
        // Kirjeldus ei muutu iga liuguri sammuga, muidu loeks ekraanilugeja
        // terve lause iga kord uuesti ette.
        aria-label="Joonis: vasakul on valgusallikas, keskel pall ja paremal ekraan. Neli kiirt allika mõlemast servast mõlema palliserva poole jagavad varju ekraanil kolmeks: must täisvari keskel ja hallid poolvarju ribad selle mõlemal pool."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <defs>
          {/* Poolvari ei ole ühtlaselt hall: allika serv paistab välja tasapisi,
              seega läheb ta täisvarju poolt heleda poole sujuvalt. Üleminek on
              SUJUV, aga VÄITED („täisvarju ei ole") tulevad mudelilt – joonis
              ei otsusta siin midagi. */}
          <linearGradient id={`${gradientId}-top`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-ink)" stopOpacity={0.08} />
            <stop offset="100%" stopColor="var(--color-ink)" stopOpacity={0.55} />
          </linearGradient>
          <linearGradient id={`${gradientId}-bottom`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-ink)" stopOpacity={0.55} />
            <stop offset="100%" stopColor="var(--color-ink)" stopOpacity={0.08} />
          </linearGradient>
        </defs>

        {/* Optiline telg – abijoon, seega katkendlik ja vaikne. */}
        <line
          x1={SOURCE_X}
          y1={AXIS_Y}
          x2={SCREEN_MAX_X}
          y2={AXIS_Y}
          className="stroke-ink-soft"
          strokeWidth={1}
          strokeDasharray="4 4"
        />

        {/* Poolvarju alad: mõlemad KOLMNURGAD, mille tipp on palli serval –
            sisemise ja välimise kiire vahel. Kui täisvari on juba enne ekraani
            otsa saanud, lähevad sisemised kiired risti üle telje ja need kaks
            kolmnurka katavad kogu varju. Nii peabki: siis ongi kõik poolvari. */}
        <polygon
          points={`${ballX},${ballTopY} ${screenX},${upperInnerY} ${screenX},${upperOuterY}`}
          className="fill-ink"
          fillOpacity={0.18}
        />
        <polygon
          points={`${ballX},${ballBottomY} ${screenX},${lowerInnerY} ${screenX},${lowerOuterY}`}
          className="fill-ink"
          fillOpacity={0.18}
        />

        {/* Täisvarju koonus: sinna ei jõua allikast ühtki kiirt. */}
        <polygon points={umbraPoints} className="fill-ink" fillOpacity={0.75} />

        {/* Neli kiirt. Nemad ongi kogu mooduli vastus: varju piir on täpselt
            seal, kuhu allika serva juurest tõmmatud sirge jõuab. */}
        <g className="stroke-ink" strokeWidth={1} strokeOpacity={0.6}>
          <line x1={SOURCE_X} y1={AXIS_Y - sourceHalfPx} x2={screenX} y2={upperInnerY} />
          <line x1={SOURCE_X} y1={AXIS_Y + sourceHalfPx} x2={screenX} y2={upperOuterY} />
          <line x1={SOURCE_X} y1={AXIS_Y + sourceHalfPx} x2={screenX} y2={lowerInnerY} />
          <line x1={SOURCE_X} y1={AXIS_Y - sourceHalfPx} x2={screenX} y2={lowerOuterY} />
        </g>

        {/* Allikas: laiusega riba või punktvalgusallika korral täpp. Täpp EI ole
            kaunistus – ta on selle mooduli piirjuht ja peab olema nähtav. */}
        {sourceWidthM > 0 ? (
          <rect
            x={SOURCE_X - 5}
            y={AXIS_Y - sourceHalfPx}
            width={10}
            height={2 * sourceHalfPx}
            rx={3}
            className="fill-teacher"
          />
        ) : (
          <circle cx={SOURCE_X} cy={AXIS_Y} r={5} className="fill-teacher" />
        )}
        {/* Valge ääris siltide taga: laia varju korral ulatub vari joonise
            ülaserva ja must tekst halli peal ei loeks projektorilt välja. */}
        <text
          x={SOURCE_X - 6}
          y={14}
          className="fill-ink-soft"
          fontSize={12}
          stroke="white"
          strokeWidth={4}
          paintOrder="stroke"
        >
          {sourceWidthM > 0 ? "allikas" : "punktallikas"}
        </text>

        {/* Pall: läbimõõt on kogu moodulis muutumatu, seega kõik, mis temaga
            joonisel juhtub, tuleb püstskaalast. */}
        <circle cx={ballX} cy={AXIS_Y} r={ballHalfPx} className="fill-ink" />
        <text
          x={ballX}
          y={ballTopY - 8}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={12}
          stroke="white"
          strokeWidth={4}
          paintOrder="stroke"
        >
          pall
        </text>

        {/* Ekraan ja tema peal olevad ribad. Riba on see, mida õpilane päris
            katses mõõdulindiga mõõdaks. */}
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
          ekraan
        </text>

        {/* Kaugusnooled: mõlemad ALLIKAST, nii nagu kogu moodulis kokku
            lepitud. Nende pikkus on päris suhtes, seega tohib neid võrrelda. */}
        <g className="stroke-ink-soft" strokeWidth={1.5}>
          <line x1={SOURCE_X} y1={206} x2={ballX} y2={206} />
          <line x1={SOURCE_X} y1={201} x2={SOURCE_X} y2={211} />
          <line x1={ballX} y1={201} x2={ballX} y2={211} />
          <line x1={SOURCE_X} y1={228} x2={screenX} y2={228} />
          <line x1={SOURCE_X} y1={223} x2={SOURCE_X} y2={233} />
          <line x1={screenX} y1={223} x2={screenX} y2={233} />
        </g>
        <text
          x={(SOURCE_X + ballX) / 2}
          y={202}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={12}
          stroke="white"
          strokeWidth={4}
          paintOrder="stroke"
        >
          {formatDistance(objectDistanceM)}
        </text>
        <text
          x={(SOURCE_X + screenX) / 2}
          y={224}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={12}
          stroke="white"
          strokeWidth={4}
          paintOrder="stroke"
        >
          {formatDistance(screenDistanceM)}
        </text>
        <text x={8} y={VIEW.height - 6} className="fill-ink-soft" fontSize={11}>
          kaugused on joonisel õiges suhtes, laiused on kokku surutud
        </text>
      </svg>

      {clipped ? (
        <p className="text-sm text-ink-soft">
          Nii lai vari ei mahu joonisele ära – päris arvud on näidikutel. Too ekraan lähemale või
          tee allikas kitsamaks, siis on joonis jälle terve.
        </p>
      ) : null}

      {/* Numbrid suurelt joonise all: projektorilt ei loe kaugelt istuv õpilane
          12-pikslist silti (sama põhjendus mis teistel moodulitel). */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Readout
          label="Täisvarju laius"
          // Arv 0 üksi ei ole piisavalt selge – otsuse teeb mudel (`hasUmbra`),
          // mitte siinne võrdlus, ja joonisel kaob must ala samal hetkel ära.
          value={umbraVisible ? formatShadowCm(umbraM) : "täisvarju ei ole"}
          tone="umbra"
        />
        <Readout label="Poolvarju riba" value={formatShadowCm(penumbraM)} tone="penumbra" />
      </div>

      {/* Liitmine „täisvari + kaks riba" kehtib AINULT seni, kuni täisvari on
          olemas (model.ts `totalShadowWidth`). Pärast selle kadumist annaks
          sama lause arvud, mis kokku ei lähe (26 + 26 ≠ 49) – ja õpilane
          kontrollibki seda peast. Seepärast kaks eri lauset, mitte üks. */}
      {umbraVisible ? (
        <p className="text-sm text-ink-soft">
          Kogu vari on {formatShadowCm(totalM)} lai: täisvari ja mõlemal pool üks poolvarju riba.
          Täisvari meetrites: {formatShadowMetres(umbraM)}.
        </p>
      ) : (
        <p className="text-sm text-ink-soft">
          Kogu vari on {formatShadowCm(totalM)} lai, aga päris tumedat keset temas enam ei ole –
          kogu laik on poolvari.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor={sourceSliderId} className="text-base font-medium text-ink">
          Allika laius: {formatSourceWidth(sourceWidthM)}
          {sourceWidthM === 0 ? " (punktvalgusallikas)" : ""}
        </label>
        <input
          id={sourceSliderId}
          type="range"
          min={SLIDERS.sourceWidthM.min}
          max={SLIDERS.sourceWidthM.max}
          step={SLIDERS.sourceWidthM.step}
          value={sourceWidthM}
          onChange={(event) =>
            setSourceWidthM(
              clampSlider(event.target.value, SLIDERS.sourceWidthM, DEFAULT_SOURCE_M),
            )
          }
          aria-valuetext={
            sourceWidthM === 0
              ? "0 sentimeetrit, punktvalgusallikas"
              : `${formatNumber(metersToCm(sourceWidthM), 0)} sentimeetrit`
          }
          className="h-11 w-full accent-brand"
        />
        <div className="flex justify-between text-sm text-ink-soft">
          <span>{formatSourceWidth(SLIDERS.sourceWidthM.min)}</span>
          <span>{formatSourceWidth(SLIDERS.sourceWidthM.max)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={screenSliderId} className="text-base font-medium text-ink">
          Allikas → ekraan: {formatDistance(screenDistanceM)}
        </label>
        <input
          id={screenSliderId}
          type="range"
          min={SLIDERS.screenDistanceM.min}
          max={SLIDERS.screenDistanceM.max}
          step={SLIDERS.screenDistanceM.step}
          value={screenDistanceM}
          onChange={(event) =>
            setScreenDistanceM(
              clampSlider(event.target.value, SLIDERS.screenDistanceM, DEFAULT_SCREEN_M),
            )
          }
          aria-valuetext={`${formatNumber(screenDistanceM, 1)} meetrit`}
          className="h-11 w-full accent-brand"
        />
        <div className="flex justify-between text-sm text-ink-soft">
          <span>{formatDistance(SLIDERS.screenDistanceM.min)}</span>
          <span>{formatDistance(SLIDERS.screenDistanceM.max)}</span>
        </div>
      </div>

      {/* Palli kauguse liugur avaneb pärast ülesannet 2 – enne seda on nähtaval
          kaks muudetavat suurust, nii nagu moodulileping nõuab. Liuguri suurim
          väärtus (1 m) on väiksem kui ekraani liuguri vähim (1,2 m), seega ei
          saa pall sattuda ekraani taha ükskõik millise seisu juures. */}
      {ballDistanceAvailable ? (
        <div className="flex flex-col gap-2">
          <label htmlFor={ballSliderId} className="text-base font-medium text-ink">
            Allikas → pall: {formatDistance(objectDistanceM)}
          </label>
          <input
            id={ballSliderId}
            type="range"
            min={SLIDERS.objectDistanceM.min}
            max={SLIDERS.objectDistanceM.max}
            step={SLIDERS.objectDistanceM.step}
            value={objectDistanceM}
            onChange={(event) =>
              setObjectDistanceM(
                clampSlider(event.target.value, SLIDERS.objectDistanceM, DEFAULT_BALL_M),
              )
            }
            aria-valuetext={`${formatNumber(objectDistanceM, 1)} meetrit`}
            className="h-11 w-full accent-brand"
          />
          <div className="flex justify-between text-sm text-ink-soft">
            <span>{formatDistance(SLIDERS.objectDistanceM.min)}</span>
            <span>{formatDistance(SLIDERS.objectDistanceM.max)}</span>
          </div>
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

/** Üks suurus suurelt. Värv kordab joonise värvi, aga info kannab SILT. */
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
          className={`h-3 w-5 shrink-0 rounded-sm bg-ink ${
            tone === "umbra" ? "opacity-75" : "opacity-25"
          }`}
        />
        <span className="text-sm font-medium text-ink-soft">{label}</span>
      </div>
      {/* „täisvarju ei ole" on pikk ja tohib murduda, arv mitte – seepärast on
          aste sama, aga murdmine erinev. */}
      <p className="text-2xl font-semibold tabular-nums text-ink sm:text-3xl">{value}</p>
    </div>
  );
}
