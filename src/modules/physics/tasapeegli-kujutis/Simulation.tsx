import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { SimulationProps } from "../../../engine/simulationFeatures";
import { Button } from "../../../ui/Button";
import { SliderField } from "../../../ui/SliderField";
import { formatNumber } from "../../../lib/format";
import {
  SLIDERS,
  eyeHeight,
  imageDistance,
  mirrorBottomEdgeHeight,
  mirrorTopEdgeHeight,
  visibleBodyHeight,
  visibleBottomHeight,
} from "./model";

/**
 * Tasapeegli kujutise simulatsioon – ainult VAADE
 * (sisu/MOODUL-tasapeegli-kujutis.md samm „explore";
 * docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Füüsikat siin ei arvutata (CLAUDE.md reegel 1): silmade kõrguse annab
 * `eyeHeight`, kujutise koha `imageDistance`, nähtava osa `visibleBodyHeight`
 * ja `visibleBottomHeight`, peegli servad `mirrorTopEdgeHeight` ja
 * `mirrorBottomEdgeHeight`. Liugurite piirid tulevad mudeli `SLIDERS`-ist,
 * sest nendest sõltub, kas ülesande vastus on üldse seatav. See fail arvutab
 * ainult PIKSLEID.
 *
 * **Joonise kokkulepe: kaugustel ja kõrgustel on ERI skaala.** Kaugusi on vaja
 * kuni 3 m (ja kujutis on veel sama palju taga ehk kokku 6 m), kõrgusi ainult
 * kuni 1,9 m – ühe skaalaga jääks inimene paari piksli kriipsuks. Püstskaala
 * ja vaakuskaala on kumbki omaette PÜSIV, seega tohib joonisel võrrelda
 * kaugusi kaugustega ja kõrgusi kõrgustega, aga mitte kaugust kõrgusega.
 * Joonis ütleb selle ka ise ühe reaga välja.
 *
 * **Inimene seisab paigal ja SEIN liigub.** Nii jääb mõõdulint alati samasse
 * kohta (ja tema kõrvale mahuvad sildid „paistab" / „ei paista"), ning
 * kaugemale astumine paistab joonisel täpselt sellena, mis ta on: peegel läheb
 * kaugemale ja kujutis läheb temaga koos veel sama palju kaugemale.
 *
 * **Kiirte tabamiskohad peeglil arvutatakse sirge lõikamisena, mitte valemist
 * uuesti** (sama otsus mis moodulis `vari-ja-poolvari`): kiir läheb kujutise
 * punktist silma ja seal, kus see sirge seina läbib, ongi tabamiskoht. Nii ei
 * saa joonis ja mudel teineteisele vastu rääkida – pealae kiir tabab peeglit
 * täpselt tema ülaserval (`mirrorTopEdgeHeight`) ja seda näeb joonise pealt.
 *
 * **Kaks muudetavat suurust korraga** (moodulileping): kaugus peeglist ja
 * peegli kõrgus. Inimese pikkuse liugur avaneb alles pärast ülesannet 4
 * (`unlockedFeatures`, vt activities.ts `simulation.unlocks`) – enne seda ei
 * saa õpilane tulemust „kaugus ei muuda midagi" kogemata pikkust muutes ära
 * segada.
 */

// --- Feature-silt ------------------------------------------------------------

/** Silt, mida see fail explore-sammu `unlockedFeatures` seast otsib. */
const PERSON_HEIGHT_FEATURE = "inimese-pikkus";

// --- Avavaade ----------------------------------------------------------------

/** Algväärtused spetsifikatsioonist: 1 m kaugusel, 0,4 m peegel, 1,6 m inimene. */
const DEFAULT_DISTANCE_M = 1;
const DEFAULT_MIRROR_M = 0.4;
const DEFAULT_PERSON_M = 1.6;

// --- Paigutus (SVG kasutajaühikud, y kasvab ALLA) ---------------------------

// Kõrgus 276: joonise alla mahub kaugusnoole rida, tema alla kujutise-poole
// silt (vt allpool, miks eraldi real) ja kõige alla selgitav rida skaalade
// kohta.
const VIEW = { width: 360, height: 276 };
/** Põrand – KÕIKI kõrgusi mõõdetakse siit (model.ts kokkulepe). */
const FLOOR_Y = 208;
/** Inimene seisab alati siin. */
const PERSON_X = 96;
/** Mõõdulint inimesest vasakul; sildid mahuvad temast veel vasakule. */
const TAPE_X = 74;
const TAPE_WIDTH = 12;

/**
 * Vaakuskaala (pikslit meetri kohta) – PÜSIV.
 *
 * Suurim kaugus on 3 m ja kujutis on siis veel 3 m sein tagapool, seega peab
 * mahtuma 6 m: `PERSON_X + 6 · 42 = 348`, mis jääb joonise sisse.
 */
const PX_PER_M_X = 42;
/**
 * Püstskaala (pikslit meetri kohta) – samuti püsiv, aga TEINE arv kui
 * vaakuskaala. Pikim inimene (1,9 m) tuleb 160 pikslit kõrge ja mahub
 * põrandajoone kohale ära.
 */
const PX_PER_M_Y = 84;

/** Pea raadius joonisel – kaunistus, mitte mõõt. */
const HEAD_R = 9;

// --- Vormindus ---------------------------------------------------------------

/**
 * Meetrid õpilase kujul: eesti koma ja ainult vajalikud kümnendkohad
 * („3 m", „2,5 m", „0,85 m"). Sama reegel mis ülesannete tekstis
 * (activities.ts) – muidu ütleks sama arv näidikul ja ülesandes eri moodi.
 * Kolm kohta ei teki: kõik liugurid liiguvad 0,05 m kordsete kaupa.
 */
function formatMetres(valueM: number): string {
  const tenths = Math.abs(valueM * 10 - Math.round(valueM * 10));
  const decimals = Number.isInteger(valueM) ? 0 : tenths < 1e-9 ? 1 : 2;
  return `${formatNumber(valueM, decimals)} m`;
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
  const [objectDistanceM, setObjectDistanceM] = useState<number>(DEFAULT_DISTANCE_M);
  const [mirrorHeightM, setMirrorHeightM] = useState<number>(DEFAULT_MIRROR_M);
  const [personHeightM, setPersonHeightM] = useState<number>(DEFAULT_PERSON_M);
  const distanceSliderId = useId();
  const mirrorSliderId = useId();
  const personSliderId = useId();
  const patternId = useId();

  // Pikkuse liugur ilmub alles pärast ülesannet 4.
  const personHeightAvailable = unlockedFeatures.has(PERSON_HEIGHT_FEATURE);

  // --- Füüsika (kõik mudelist) ----------------------------------------------
  const eyeHeightM = eyeHeight(personHeightM);
  const imageDistanceM = imageDistance(objectDistanceM);
  const visibleM = visibleBodyHeight(mirrorHeightM, personHeightM);
  const visibleBottomM = visibleBottomHeight(mirrorHeightM, personHeightM);
  const mirrorTopM = mirrorTopEdgeHeight(eyeHeightM, personHeightM);
  const mirrorBottomM = mirrorBottomEdgeHeight(eyeHeightM, personHeightM, mirrorHeightM);
  /**
   * Kas peeglist paistab kogu inimene. Otsuse teeb mudel: `visibleBodyHeight`
   * piirab tulemuse pikkusega `H` ja tagastab siis TÄPSELT sama arvu, seega ei
   * ole see võrdlus ujukoma peal libe.
   */
  const wholePersonVisible = visibleM >= personHeightM;

  // --- Joonise pikslid ------------------------------------------------------
  /** Kõrgus (m, põrandast) → y joonisel. */
  const y = (heightM: number) => FLOOR_Y - heightM * PX_PER_M_Y;
  const wallX = PERSON_X + objectDistanceM * PX_PER_M_X;
  const imageX = wallX + imageDistanceM * PX_PER_M_X;

  const headY = y(personHeightM);
  const eyeY = y(eyeHeightM);
  const visibleBottomY = y(visibleBottomM);

  /**
   * Kiir kujutise punktist silma: kus ta seina läbib, seal on tabamiskoht
   * peeglil. Ainult sirge lõikamine – ühtki füüsikavalemit siin ei ole, ja
   * just seepärast on pealae kiire tabamiskoht sama, mis mudeli antud peegli
   * ülaserv. Kui need kunagi lahku lähevad, on joonisel kohe näha, et midagi
   * on katki.
   */
  const hitOnMirror = (imageY: number) =>
    eyeY + ((imageY - eyeY) * (wallX - PERSON_X)) / (imageX - PERSON_X);

  const headHitY = hitOnMirror(headY);
  const bottomHitY = hitOnMirror(visibleBottomY);

  const reset = () => {
    setObjectDistanceM(DEFAULT_DISTANCE_M);
    setMirrorHeightM(DEFAULT_MIRROR_M);
    setPersonHeightM(DEFAULT_PERSON_M);
  };

  return (
    <div className="flex flex-col gap-5">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        // Arvud on näidikutel joonise all – ekraanilugeja saab need sealt.
        // Kirjeldus ei muutu iga liuguri sammuga, muidu loeks ekraanilugeja
        // terve lause iga kord uuesti ette.
        aria-label="Külgvaade: vasakul seisad sina, sinust vasakul on mõõdulint, millel on eraldi märgitud see osa sinust, mis peeglist paistab. Paremal on sein ja selle peal peegel, seinast paremal katkendjoonega sinu kujutis. Kaks kiirt – pealaest ja nähtava osa alumisest servast – lähevad peeglile ja sealt sinu silma; nende katkendlikud pikendused viivad kujutise juurde."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <defs>
          {/* Nähtaval osal on eri VÄRV ja eri MUSTER (disainijuhis: värv ei ole
              kunagi ainus info kandja) – lisaks on tal veel silt ja piirjoon. */}
          <pattern
            id={`${patternId}-visible`}
            width={6}
            height={6}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width={6} height={6} className="fill-brand" fillOpacity={0.18} />
            <line x1={0} y1={0} x2={0} y2={6} className="stroke-brand" strokeWidth={2} />
          </pattern>
        </defs>

        {/* Põrand. */}
        <line
          x1={8}
          y1={FLOOR_Y}
          x2={VIEW.width - 8}
          y2={FLOOR_Y}
          className="stroke-ink-soft"
          strokeWidth={2}
        />

        {/* Sein: peegel on tema peal, kujutis tema taga. */}
        <line
          x1={wallX}
          y1={y(SLIDERS.personHeightM.max) - 14}
          x2={wallX}
          y2={FLOOR_Y}
          className="stroke-ink-soft"
          strokeWidth={2}
        />
        {/* Sein on viirutatud tagantpoolt – nii on näha, kummal pool on tuba. */}
        <g className="stroke-ink-soft" strokeWidth={1} strokeOpacity={0.5}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
            const lineY = FLOOR_Y - 8 - index * 22;
            return (
              <line key={index} x1={wallX + 1} y1={lineY} x2={wallX + 9} y2={lineY - 8} />
            );
          })}
        </g>

        {/* Peegel seinal – ripub ALATI õigel kõrgusel (model.ts), seega ei ole
            tema kohta liugurit ja tema servad tulevad mudelist. */}
        <rect
          x={wallX - 5}
          y={y(mirrorTopM)}
          width={5}
          height={Math.max(0, y(mirrorBottomM) - y(mirrorTopM))}
          className="fill-brand"
        />
        {/* Silt käib seina ÜLAOTSA juurde, mitte peegli kõrvale: kui inimene
            seisab peeglile lähedal, on kujutis seinast ainult 20 pikslit
            paremal ja peegli kõrvale pandud silt jookseks temast läbi
            (leitud brauseris). */}
        <text
          x={wallX}
          y={y(SLIDERS.personHeightM.max) - 18}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={12}
          stroke="white"
          strokeWidth={4}
          paintOrder="stroke"
        >
          peegel
        </text>

        {/* Kiired: pealaest ja nähtava osa alumisest servast peeglile ja sealt
            silma. Pidev joon = päris kiir. */}
        <g className="fill-none stroke-brand" strokeWidth={2}>
          <path d={`M ${PERSON_X} ${headY} L ${wallX} ${headHitY}`} />
          <path d={`M ${PERSON_X} ${visibleBottomY} L ${wallX} ${bottomHitY}`} />
        </g>
        <g className="fill-none stroke-info" strokeWidth={2}>
          <path d={`M ${wallX} ${headHitY} L ${PERSON_X} ${eyeY}`} />
          <path d={`M ${wallX} ${bottomHitY} L ${PERSON_X} ${eyeY}`} />
        </g>
        {/* Pikendused – need ei ole päris kiired, seepärast katkendjoon. */}
        <g className="fill-none stroke-info" strokeWidth={1.5} strokeDasharray="6 5">
          <path d={`M ${wallX} ${headHitY} L ${imageX} ${headY}`} />
          <path d={`M ${wallX} ${bottomHitY} L ${imageX} ${visibleBottomY}`} />
        </g>

        {/* Kujutis: katkendjoonega ja sildiga – esemega ühesuurune ning peegli
            taga sama kaugel, kui inimene on ees. */}
        <g className="fill-none stroke-brand" strokeWidth={2} strokeDasharray="6 4">
          <circle cx={imageX} cy={headY + HEAD_R} r={HEAD_R} />
          <line x1={imageX} y1={headY + 2 * HEAD_R} x2={imageX} y2={FLOOR_Y} />
        </g>
        {/* Silt käib kujutise PEA kohale, mitte tema jalge alla: all on juba
            kaugusnool ja kaks silti jooksid teineteisest läbi (leitud
            brauseris). */}
        <text
          // Kõige kaugemal (3 m) on kujutis joonise paremas servas ja keskele
          // seatud silt jookseks servast välja – seepärast piir (leitud
          // brauseris).
          x={Math.min(imageX, VIEW.width - 26)}
          y={headY - 8}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={11}
          stroke="white"
          strokeWidth={4}
          paintOrder="stroke"
        >
          kujutis
        </text>

        {/* Inimene: keha + pea + silm. Silm on märgitud, sest just tema juurde
            kiired jõuavad. */}
        <line
          x1={PERSON_X}
          y1={headY + 2 * HEAD_R}
          x2={PERSON_X}
          y2={FLOOR_Y}
          className="stroke-ink"
          strokeWidth={7}
          strokeLinecap="round"
        />
        <circle cx={PERSON_X} cy={headY + HEAD_R} r={HEAD_R} className="fill-ink" />
        <circle cx={PERSON_X + 4} cy={eyeY} r={2} className="fill-white" />

        {/* Mõõdulint inimese kõrval: kogu pikkus ja selle sees nähtav osa. */}
        <rect
          x={TAPE_X}
          y={headY}
          width={TAPE_WIDTH}
          height={FLOOR_Y - headY}
          className="fill-white stroke-line"
          strokeWidth={1}
        />
        <rect
          x={TAPE_X}
          y={headY}
          width={TAPE_WIDTH}
          height={Math.max(0, visibleBottomY - headY)}
          fill={`url(#${patternId}-visible)`}
          className="stroke-brand"
          strokeWidth={1}
        />
        {/* Piirjoon „siit allpool ei paista" ulatub üle inimese – nii on näha,
            kus see piir tema peal on. */}
        <line
          x1={TAPE_X - 6}
          y1={visibleBottomY}
          x2={PERSON_X + 14}
          y2={visibleBottomY}
          className="stroke-ink"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <text
          x={TAPE_X - 8}
          y={(headY + visibleBottomY) / 2 + 4}
          textAnchor="end"
          className="fill-brand"
          fontSize={12}
          fontWeight={600}
        >
          paistab
        </text>
        {/* „ei paista" ilmub ainult siis, kui midagi päriselt ei paista –
            muidu seisaks joonisel silt nulli kõrguse riba kõrval. */}
        {visibleBottomM > 0 ? (
          <text
            x={TAPE_X - 8}
            y={(visibleBottomY + FLOOR_Y) / 2 + 4}
            textAnchor="end"
            className="fill-ink-soft"
            fontSize={12}
          >
            ei paista
          </text>
        ) : null}

        {/* Kaugusnooled: sina → peegel ja peegel → kujutis. Nad on ÜHES ja samas
            vaakuskaalas, seega tohib neid joonisel omavahel võrrelda – ja nad
            tulevadki alati ühepikkused. */}
        <g className="stroke-ink-soft" strokeWidth={1.5}>
          <line x1={PERSON_X} y1={234} x2={wallX} y2={234} />
          <line x1={PERSON_X} y1={229} x2={PERSON_X} y2={239} />
          <line x1={wallX} y1={229} x2={wallX} y2={239} />
          <line x1={wallX} y1={234} x2={imageX} y2={234} />
          <line x1={imageX} y1={229} x2={imageX} y2={239} />
        </g>
        <text
          x={(PERSON_X + wallX) / 2}
          y={230}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={12}
          stroke="white"
          strokeWidth={4}
          paintOrder="stroke"
        >
          {formatMetres(objectDistanceM)}
        </text>
        {/* Kujutise pool kirjutatakse noole ALLA. Kõige lähemal (0,5 m) on
            mõlemad nooled ainult 21 pikslit pikad ja kaks silti ühel real
            jooksid teineteisest läbi (leitud brauseris). */}
        <text
          x={(wallX + imageX) / 2}
          y={250}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={12}
          stroke="white"
          strokeWidth={4}
          paintOrder="stroke"
        >
          {formatMetres(imageDistanceM)}
        </text>
        <text x={8} y={VIEW.height - 6} className="fill-ink-soft" fontSize={11}>
          kaugustel ja kõrgustel on joonisel eri skaala
        </text>
      </svg>

      {/* Numbrid suurelt joonise all: projektorilt ei loe kaugelt istuv õpilane
          12-pikslist silti (sama põhjendus mis teistel moodulitel). */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Readout
          label="Sinust paistab"
          value={formatMetres(visibleM)}
          // Ainult arv „1,6 m" ei ütle õpilasele, et lagi on käes – suurem
          // peegel siit enam midagi juurde ei näita.
          note={wholePersonVisible ? "kogu inimene" : undefined}
          patterned
        />
        <Readout label="Kujutis on peegli taga" value={formatMetres(imageDistanceM)} />
      </div>

      <SliderField
        id={distanceSliderId}
        label="Sina → peegel"
        value={objectDistanceM}
        min={SLIDERS.objectDistanceM.min}
        max={SLIDERS.objectDistanceM.max}
        step={SLIDERS.objectDistanceM.step}
        onChange={(event) =>
          setObjectDistanceM(
            clampSlider(event.target.value, SLIDERS.objectDistanceM, DEFAULT_DISTANCE_M),
          )
        }
        valueText={formatMetres(objectDistanceM)}
        ariaValueText={`${formatNumber(objectDistanceM, 1)} meetrit`}
        minLabel={formatMetres(SLIDERS.objectDistanceM.min)}
        maxLabel={formatMetres(SLIDERS.objectDistanceM.max)}
      />

      <SliderField
        id={mirrorSliderId}
        label="Peegli kõrgus"
        value={mirrorHeightM}
        min={SLIDERS.mirrorHeightM.min}
        max={SLIDERS.mirrorHeightM.max}
        step={SLIDERS.mirrorHeightM.step}
        onChange={(event) =>
          setMirrorHeightM(
            clampSlider(event.target.value, SLIDERS.mirrorHeightM, DEFAULT_MIRROR_M),
          )
        }
        valueText={formatMetres(mirrorHeightM)}
        ariaValueText={`${formatNumber(mirrorHeightM, 2)} meetrit`}
        minLabel={formatMetres(SLIDERS.mirrorHeightM.min)}
        maxLabel={formatMetres(SLIDERS.mirrorHeightM.max)}
      />

      {/* Pikkuse liugur avaneb pärast ülesannet 4 – enne seda on nähtaval kaks
          muudetavat suurust, nii nagu moodulileping nõuab. Silmade kõrgus tuleb
          pikkusest (`eyeHeight`), seega eraldi liugurit tema jaoks ei ole. */}
      {personHeightAvailable ? (
        <SliderField
          id={personSliderId}
          label="Sinu pikkus"
          value={personHeightM}
          min={SLIDERS.personHeightM.min}
          max={SLIDERS.personHeightM.max}
          step={SLIDERS.personHeightM.step}
          onChange={(event) =>
            setPersonHeightM(
              clampSlider(event.target.value, SLIDERS.personHeightM, DEFAULT_PERSON_M),
            )
          }
          valueText={formatMetres(personHeightM)}
          ariaValueText={`${formatNumber(personHeightM, 2)} meetrit`}
          minLabel={formatMetres(SLIDERS.personHeightM.min)}
          maxLabel={formatMetres(SLIDERS.personHeightM.max)}
        />
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

/** Üks suurus suurelt. Muster kordab joonise mustrit, aga info kannab SILT. */
function Readout({
  label,
  value,
  note,
  patterned = false,
}: {
  label: string;
  value: string;
  note?: string;
  patterned?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3 sm:flex-col sm:items-start sm:gap-1">
      <div className="flex items-center gap-2">
        {patterned ? (
          <span
            aria-hidden="true"
            className="h-3 w-5 shrink-0 rounded-sm border border-brand bg-brand/20"
          />
        ) : null}
        <span className="text-sm font-medium text-ink-soft">{label}</span>
      </div>
      <p className="text-2xl font-semibold tabular-nums text-ink sm:text-3xl">
        {value}
        {note ? (
          <span className="ml-2 text-base font-medium text-brand">{note}</span>
        ) : null}
      </p>
    </div>
  );
}
