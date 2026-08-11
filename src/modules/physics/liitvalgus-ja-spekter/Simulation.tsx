import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { SimulationProps } from "../../../engine/simulationFeatures";
import { Button } from "../../../ui/Button";
import {
  LIGHT_LABEL_COLOUR,
  SPECTRUM_OFF_COLOUR,
  SPECTRUM_STOPS,
  bandColour,
} from "./display";
import {
  INITIAL_WAVELENGTH_NM,
  LIGHT_SOURCES,
  SLIDERS,
  VISIBLE_MAX_NM,
  VISIBLE_MIN_NM,
  WHITE_LABEL,
  bandCount,
  colourAtWavelength,
  emitsAtWavelength,
  emittedBands,
  emittedSegments,
  isCompositeLight,
  perceivedColour,
} from "./model";

/**
 * Spektroskoobi simulatsioon – ainult VAADE
 * (sisu/MOODUL-liitvalgus-ja-spekter.md samm „explore";
 * docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Füüsikat siin ei arvutata (CLAUDE.md reegel 1): millised lainepikkused on
 * värvilised, ütleb `emitsAtWavelength`, mis värv seal on – `colourAtWavelength`,
 * mitu ribat allikal on – `bandCount`, ja kuidas silm seda näeb –
 * `perceivedColour`. Liuguri piirid tulevad `SLIDERS`-ist, värvid display.ts-ist.
 * See fail arvutab ainult PIKSLEID.
 *
 * **Spektroskoop, mitte prisma.** Moodul EI seleta, miks prisma valguse
 * värvideks lahutab (see on murdumine ehk plokk P2) – seepärast ei ole joonisel
 * ühtki prismat ega murduvat kiirt. Spekter on siin antud: nii ta välja näeb.
 *
 * **Riba on tume alus, mille peale tulevad värvilised tükid** (sama võte mis
 * figures.tsx-is): nii tuleb „auk spektris" iseenesest välja ja ei ole vaja
 * eraldi loogikat, mis arvutaks, kus värvi EI ole. Just see auk ongi mooduli
 * kõige tähtsam „aha" – valge LED paistab valge, aga punane ots on tühi.
 *
 * **Miks joonis figures.tsx-i oma ei impordi:** siis tiriks explore-samm kaasa
 * kogu selle faili (tänavavalgusti stseen, kolm spektrit), mida ta ei vaja
 * (CLAUDE.md reegel 13). Ühine on ainult see, mis PEAB ühine olema – ribade
 * piirid (mudelist) ja värvid (display.ts) –, seega need kaks riba ei saa
 * teineteisele vastu rääkida ka siis, kui joonised eraldi elavad.
 *
 * **Kaks muudetavat suurust korraga** (moodulileping): valgusallika valik ja
 * lainepikkuse liugur. Silma kolme anduri selgitus avaneb alles pärast
 * ülesannet 3 (`unlockedFeatures`, vt activities.ts `simulation.unlocks`) –
 * enne seda peab õpilane spektrist ISE nägema, et punane riba on puudu.
 */

// --- Feature-silt ------------------------------------------------------------

/** Silt, mida see fail explore-sammu `unlockedFeatures` seast otsib. */
const EYE_SENSORS_FEATURE = "silma-andurid";

// --- Avavaade ----------------------------------------------------------------

/**
 * Algallikas on päikesevalgus: õpilane näeb kohe tervet spektrit, sama pilti,
 * mis oli teooria joonisel. Aukudega spektrid (LED, naatriumlamp) mõjuvad alles
 * siis, kui on midagi, millega võrrelda.
 */
const DEFAULT_SOURCE_ID: string = "sun";

// --- Paigutus (SVG kasutajaühikud) ------------------------------------------

const VIEW = { width: 360, height: 158 };
/** Riba vasak ja parem serv. Vasakul on ruumi markeri sildile 380 nm juures. */
const BAR_LEFT = 34;
const BAR_RIGHT = 336;
const BAR_Y = 44;
const BAR_HEIGHT = 56;

/** Lainepikkus (nm) → x riba peal. Ainus kohta arvutav tehe siin. */
function xAt(nm: number): number {
  const ratio = (nm - VISIBLE_MIN_NM) / (VISIBLE_MAX_NM - VISIBLE_MIN_NM);
  return BAR_LEFT + ratio * (BAR_RIGHT - BAR_LEFT);
}

/** Skaalajoone kõrgus – riba alt allapoole, alumise osuti taha. */
const AXIS_Y = BAR_Y + BAR_HEIGHT + 14;

/** Skaala jaotised: paar ümmargust arvu, mitte kõik ribade piirid. */
const AXIS_TICKS = [VISIBLE_MIN_NM, 500, 600, 700, VISIBLE_MAX_NM];

// --- Vormindus ---------------------------------------------------------------

/**
 * Allikas id järgi. Vigane id on programmeerija viga (nupurida tuleb samast
 * loendist), seega viskab funktsioon vea, nagu mudeliski.
 */
function findSource(sourceId: string) {
  const source = LIGHT_SOURCES.find((candidate) => candidate.id === sourceId);
  if (!source) throw new RangeError(`Tundmatu valgusallikas: ${sourceId}`);
  return source;
}

/**
 * Liuguri väärtus mudelile kõlblikuks. Mudel viskab vahemikust väljas vea (see
 * on tahtlik – vt model.ts), seega vaade ei tohi talle midagi kahtlast anda.
 */
function clampWavelength(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return INITIAL_WAVELENGTH_NM;
  return Math.min(
    SLIDERS.wavelengthNm.max,
    Math.max(SLIDERS.wavelengthNm.min, parsed),
  );
}

/**
 * Mis värvi laik käib sõna „valge" / „kollane" / „punane" kõrvale.
 *
 * Otsuse teeb MUDEL (`perceivedColour` ja `emittedBands`), siin on ainult
 * vastus küsimusele „mis pikslivärviga seda näidata". Laik ei ole ainus info
 * kandja – tema kõrval seisab alati sama asi sõnadega (docs/DISAINIJUHIS.md).
 */
function perceivedSwatch(sourceId: string): string {
  if (perceivedColour(sourceId) === WHITE_LABEL) return "#ffffff";
  const bands = emittedBands(sourceId);
  if (bands.length === 1) return bandColour(bands[0].id);
  // „Segavärvi" ühelgi selle mooduli allikal ei ole (vt model.ts), aga laik ei
  // tohi tundmatuks jääda, kui allikaid kunagi juurde tuleb.
  return SPECTRUM_OFF_COLOUR;
}

export function Simulation({ unlockedFeatures = new Set() }: Partial<SimulationProps> = {}) {
  const [sourceId, setSourceId] = useState<string>(DEFAULT_SOURCE_ID);
  const [wavelengthNm, setWavelengthNm] = useState<number>(INITIAL_WAVELENGTH_NM);
  const sliderId = useId();

  // Silma kolme anduri selgitus ilmub alles pärast ülesannet 3.
  const eyeSensorsAvailable = unlockedFeatures.has(EYE_SENSORS_FEATURE);

  // --- Füüsika (kõik mudelist) ----------------------------------------------
  const source = findSource(sourceId);
  const litParts = emittedSegments(sourceId);
  const bands = bandCount(sourceId);
  const composite = isCompositeLight(sourceId);
  const seenColour = perceivedColour(sourceId);
  const markerColourName = colourAtWavelength(wavelengthNm);
  const markerLit = emitsAtWavelength(sourceId, wavelengthNm);

  // --- Joonise pikslid ------------------------------------------------------
  const markerX = xAt(wavelengthNm);

  const reset = () => {
    setSourceId(DEFAULT_SOURCE_ID);
    setWavelengthNm(INITIAL_WAVELENGTH_NM);
  };

  return (
    <div className="flex flex-col gap-5">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        // Arvud ja sõnad on näidikutel joonise all – ekraanilugeja saab need
        // sealt. Kirjeldus ei muutu iga liuguri sammuga, muidu loeks
        // ekraanilugeja terve lause iga kord uuesti ette.
        aria-label="Spektroskoobi vaade: lai riba violetist punaseni, mille peal on iga vikerkaarevärvi nimi. Riba on värviline ainult seal, kus valitud valgusallikas kiirgab, ülejäänud osa on tume. Riba all on lainepikkuse skaala 380 nanomeetrist 760 nanomeetrini ja riba peal on marker, mille koha valid liuguriga."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <text x={BAR_LEFT} y={22} className="fill-ink" fontSize={12} fontWeight={600}>
          {source.label}
        </text>

        {/* Tume alus: siia jääb see, mida allikas EI kiirga. */}
        <rect
          x={BAR_LEFT}
          y={BAR_Y}
          width={BAR_RIGHT - BAR_LEFT}
          height={BAR_HEIGHT}
          fill={SPECTRUM_OFF_COLOUR}
          rx={3}
        />
        {/* Värvilised tükid peale. Millised kohad värviliseks lähevad, ütleb
            MUDEL (`emittedSegments`) – siin on ainult koordinaadid ja värvid
            (CLAUDE.md reegel 1, CodeRabbiti leid samm 4.1x). Sama funktsioon
            annab ka ribade arvu, seega näidik „4 riba" ja joonis ei saa
            teineteisele vastu rääkida. */}
        {litParts.map((segment) => (
          <rect
            key={`${segment.bandId}-${segment.minNm}`}
            x={xAt(segment.minNm)}
            y={BAR_Y}
            width={xAt(segment.maxNm) - xAt(segment.minNm)}
            height={BAR_HEIGHT}
            fill={bandColour(segment.bandId)}
          />
        ))}
        {/* Ribade nimed riba sisse: värv ei ole kunagi ainus info kandja, ja
            ülesanne 3 („milline värv on peaaegu puudu?") eeldab, et õpilane
            oskab puuduvale kohale NIME anda.

            Sildi värvi otsustab see, mis on sildi ALL: silt seisab riba
            keskkohas, seega küsimegi mudelilt, kas allikas seal keskkohas
            kiirgab. Tumedal alusel on valge silt loetav, värvilisel ribal
            läheb kollane ja oranž tumeda sildiga (display.ts). */}
        {SPECTRUM_STOPS.map((band) => {
          const midNm = (band.minNm + band.maxNm) / 2;
          const labelX = xAt(midNm);
          const labelY = BAR_Y + BAR_HEIGHT / 2;
          return (
            <text
              key={band.id}
              x={labelX}
              y={labelY}
              textAnchor="middle"
              fill={
                emitsAtWavelength(sourceId, midNm) ? band.labelColour : LIGHT_LABEL_COLOUR
              }
              fontSize={10}
              transform={`rotate(-90 ${labelX} ${labelY})`}
            >
              {band.label}
            </text>
          );
        })}

        {/* Marker: kaks vastakuti osutit, üks riba kohal ja teine all.

            **Riba ENDA peale marker ei ulatu.** Läbi riba tõmmatud joon
            kataks ära just selle, mida õpilane parajasti uurib – laseri riba
            on ainult 10 nm lai ja markeri joon lõikas ta pooleks (leitud
            brauseris). Kaks osutit näitavad koha sama täpselt ja jätavad
            spektri puutumata; täpse arvu ja värvi nime ütlevad joonise ülemine
            silt ja liuguri all olev rida. */}
        <g className="fill-ink">
          <path
            d={`M ${markerX - 5} ${BAR_Y - 9} L ${markerX + 5} ${BAR_Y - 9} L ${markerX} ${BAR_Y - 1} Z`}
          />
          <path
            d={`M ${markerX - 5} ${BAR_Y + BAR_HEIGHT + 9} L ${markerX + 5} ${BAR_Y + BAR_HEIGHT + 9} L ${markerX} ${BAR_Y + BAR_HEIGHT + 1} Z`}
          />
        </g>
        <text
          // Riba otstes jookseks keskele seatud silt joonisest välja.
          x={Math.min(Math.max(markerX, BAR_LEFT + 18), BAR_RIGHT - 18)}
          y={BAR_Y - 16}
          textAnchor="middle"
          className="fill-ink"
          fontSize={12}
          fontWeight={600}
          stroke="white"
          strokeWidth={4}
          paintOrder="stroke"
        >
          {wavelengthNm} nm
        </text>

        {/* Lainepikkuse skaala. Ta algab 14 pikslit riba alt, sest alumine
            osuti ulatub 9 pikslit allapoole ja jookseks muidu skaalajoonest
            läbi. */}
        <g>
          <line
            x1={BAR_LEFT}
            y1={AXIS_Y}
            x2={BAR_RIGHT}
            y2={AXIS_Y}
            className="stroke-ink-soft"
            strokeWidth={1}
          />
          {AXIS_TICKS.map((nm) => (
            <g key={nm}>
              <line
                x1={xAt(nm)}
                y1={AXIS_Y}
                x2={xAt(nm)}
                y2={AXIS_Y + 5}
                className="stroke-ink-soft"
                strokeWidth={1}
              />
              <text
                x={xAt(nm)}
                y={AXIS_Y + 17}
                textAnchor="middle"
                className="fill-ink-soft"
                fontSize={10}
              >
                {nm}
              </text>
            </g>
          ))}
          <text
            x={BAR_RIGHT}
            y={AXIS_Y + 31}
            textAnchor="end"
            className="fill-ink-soft"
            fontSize={10}
          >
            lainepikkus (nm)
          </text>
        </g>
      </svg>

      {/* Numbrid ja sõnad suurelt joonise all: projektorilt ei loe kaugelt
          istuv õpilane 10-pikslist silti (sama põhjendus mis teistel
          moodulitel). */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Readout
          label="Vikerkaarevärve ribas"
          value={String(bands)}
          // Ainult arv „4" ei ütle õpilasele, mis liiki valgus see on – ja
          // just see liigitus ongi mooduli õpieesmärk.
          note={composite ? "liitvalgus" : "lihtvalgus"}
        />
        <Readout label="Silm näeb" value={seenColour} swatch={perceivedSwatch(sourceId)} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-base font-medium text-ink">Vali valgusallikas</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Valgusallika valik">
          {LIGHT_SOURCES.map((candidate) => {
            const selected = candidate.id === sourceId;
            return (
              <button
                key={candidate.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setSourceId(candidate.id)}
                className={`flex min-h-11 items-center rounded-full border px-4 text-base focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 ${
                  selected
                    ? "border-brand bg-brand-soft font-semibold text-ink"
                    : "border-line text-ink"
                }`}
              >
                {candidate.label}
              </button>
            );
          })}
        </div>
        {/* Allika lühike selgitus tuleb mudelist (`note`) – nii ei saa nupurida
            ja mudeli tabel lahku minna. */}
        <p className="text-base leading-relaxed text-ink-soft">{source.note}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={sliderId} className="text-base font-medium text-ink">
          Lainepikkus: {wavelengthNm} nm
        </label>
        <input
          id={sliderId}
          type="range"
          min={SLIDERS.wavelengthNm.min}
          max={SLIDERS.wavelengthNm.max}
          step={SLIDERS.wavelengthNm.step}
          value={wavelengthNm}
          onChange={(event) => setWavelengthNm(clampWavelength(event.target.value))}
          aria-valuetext={`${wavelengthNm} nanomeetrit, ${markerColourName}`}
          className="h-11 w-full accent-brand"
        />
        <div className="flex justify-between text-sm text-ink-soft">
          <span>{SLIDERS.wavelengthNm.min} nm</span>
          <span>{SLIDERS.wavelengthNm.max} nm</span>
        </div>
        {/* Liuguri all seisab kolm asja korraga: koht, värvi NIMI ja kas
            valitud allikas seda värvi kiirgab. Just see viimane lause on
            ülesande 2 vastus – ja seepärast tuleb ta mudelist, mitte
            joonise pikslitest. */}
        <p className="text-base leading-relaxed text-ink">
          <span className="font-semibold">
            {wavelengthNm} nm – {markerColourName.toUpperCase()}
          </span>{" "}
          – see allikas {markerLit ? "kiirgab" : "EI kiirga"} seda värvi.
        </p>
      </div>

      {/* Silma kolme anduri selgitus avaneb pärast ülesannet 3 – enne seda
          peab õpilane spektrist ise nägema, et punane riba on puudu. Ese ise
          („miks punane särk paistab must") jääb moodulile `esemete-varvus`. */}
      {eyeSensorsAvailable ? (
        <p className="rounded-2xl border border-info/40 bg-info/10 p-3 text-base leading-relaxed text-ink">
          Silm näeb valget, sest sinine, roheline ja kollane katavad silma kolm
          värvitundlikku andurit ära. Punast valgust LED-ist peaaegu ei tule – ja
          seda on näha siis, kui vaadata punast eset.
        </p>
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

/** Üks suurus suurelt. Värvilaigu kõrval seisab alati sama asi sõnadega. */
function Readout({
  label,
  value,
  note,
  swatch,
}: {
  label: string;
  value: string;
  note?: string;
  swatch?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3 sm:flex-col sm:items-start sm:gap-1">
      <div className="flex items-center gap-2">
        {swatch ? (
          <span
            aria-hidden="true"
            className="h-3 w-5 shrink-0 rounded-sm border border-line"
            style={{ backgroundColor: swatch }}
          />
        ) : null}
        <span className="text-sm font-medium text-ink-soft">{label}</span>
      </div>
      <p className="text-2xl font-semibold tabular-nums text-ink sm:text-3xl">
        {value}
        {note ? <span className="ml-2 text-base font-medium text-brand">{note}</span> : null}
      </p>
    </div>
  );
}
