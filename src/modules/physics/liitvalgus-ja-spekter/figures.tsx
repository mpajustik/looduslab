import { SPECTRUM_OFF_COLOUR, SPECTRUM_STOPS, bandColour } from "./display";
import { VISIBLE_MAX_NM, VISIBLE_MIN_NM } from "./model";

/**
 * Mooduli joonised (src/engine/figures.ts).
 *
 * Nagu Simulation.tsx, on ka need VAATED: füüsikat siin ei arvutata. Ribade
 * piirid ja nimed tulevad mudelist (`SPECTRUM_STOPS` display.ts kaudu), värvid
 * display.ts-ist – joonis ise ei tea ühtki lainepikkust peast. Nii ei saa
 * teooria spektririba ja simulatsiooni spektririba lahku minna.
 *
 * **Hooki joonis ei tohi vastust ette öelda.** `ls-tanavavalgusti` näitab
 * AINULT seda, ET vana lambi all paistavad kaks eri värvi autot ühesugused –
 * miks, seda ütlevad teooria ja simulatsioon. Teooria joonis
 * `ls-spekter-riba` TOHIB kõik välja öelda, sest seal on see juba õpitav sisu.
 *
 * **Värv ei ole ainus info kandja** (docs/DISAINIJUHIS.md): igal ribal on nimi
 * peal, lainepikkuse skaala all ja iga joonise sisu on `aria-label`-is sõnadega
 * kirjas. Just seepärast töötab moodul ka värvipimeda õpilase jaoks.
 */

// ---------------------------------------------------------------------------
// Ühine spektririba – kasutavad nii teooria kui ka harjutuse joonis
// ---------------------------------------------------------------------------

/** Riba vasak ja parem serv joonise koordinaatides. */
const BAR_LEFT = 56;
const BAR_RIGHT = 336;

/** Lainepikkus (nm) → x-koordinaat riba peal. Ainus kohta arvutav tehe siin. */
function xAt(nm: number): number {
  const ratio = (nm - VISIBLE_MIN_NM) / (VISIBLE_MAX_NM - VISIBLE_MIN_NM);
  return BAR_LEFT + ratio * (BAR_RIGHT - BAR_LEFT);
}

type BarProps = {
  y: number;
  height: number;
  /** Millised lainepikkuste vahemikud on värvilised. Ülejäänu on tume. */
  lit: readonly { minNm: number; maxNm: number }[];
  /** Kas ribade nimed kirjutatakse riba sisse (ainult teooria joonisel). */
  withLabels?: boolean;
};

/**
 * Spektririba: tume alus, mille peale tulevad värvilised tükid.
 *
 * Tume alus on all ja värv peal, sest nii tuleb „auk spektris" iseenesest
 * välja – ei ole vaja eraldi loogikat, mis arvutaks, kus värvi EI ole.
 */
function SpectrumBar({ y, height, lit, withLabels = false }: BarProps) {
  return (
    <g>
      <rect
        x={BAR_LEFT}
        y={y}
        width={BAR_RIGHT - BAR_LEFT}
        height={height}
        fill={SPECTRUM_OFF_COLOUR}
        rx={3}
      />
      {/* `flatMap`, mitte pesastatud `map`: pesastatud massiiv jõuaks Reactini
          massiivina massiivi sees ja tekitaks võtmehoiatuse ka siis, kui igal
          ristkülikul on võti olemas. */}
      {SPECTRUM_STOPS.flatMap((band) =>
        lit.map((range) => {
          const from = Math.max(band.minNm, range.minNm);
          const to = Math.min(band.maxNm, range.maxNm);
          if (to <= from) return null;
          return (
            <rect
              key={`${band.id}-${range.minNm}`}
              x={xAt(from)}
              y={y}
              width={xAt(to) - xAt(from)}
              height={height}
              fill={bandColour(band.id)}
            />
          );
        }),
      )}
      {withLabels &&
        SPECTRUM_STOPS.map((band) => (
          <text
            key={band.id}
            x={(xAt(band.minNm) + xAt(band.maxNm)) / 2}
            y={y + height / 2}
            textAnchor="middle"
            fill={band.labelColour}
            fontSize={10}
            transform={`rotate(-90 ${(xAt(band.minNm) + xAt(band.maxNm)) / 2} ${y + height / 2})`}
          >
            {band.label}
          </text>
        ))}
    </g>
  );
}

/** Lainepikkuse skaala riba all: paar ümmargust arvu, mitte kõik piirid. */
function WavelengthAxis({ y }: { y: number }) {
  const ticks = [VISIBLE_MIN_NM, 500, 600, 700, VISIBLE_MAX_NM];
  return (
    <g>
      <line
        x1={BAR_LEFT}
        y1={y}
        x2={BAR_RIGHT}
        y2={y}
        className="stroke-ink-soft"
        strokeWidth={1}
      />
      {ticks.map((nm) => (
        <g key={nm}>
          <line
            x1={xAt(nm)}
            y1={y}
            x2={xAt(nm)}
            y2={y + 5}
            className="stroke-ink-soft"
            strokeWidth={1}
          />
          <text
            x={xAt(nm)}
            y={y + 17}
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
        y={y + 31}
        textAnchor="end"
        className="fill-ink-soft"
        fontSize={10}
      >
        lainepikkus (nm)
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------
// ls-tanavavalgusti – hook
// ---------------------------------------------------------------------------

const STREET_VIEW = { width: 360, height: 220 };
const STREET_FRAME_WIDTH = 172;

/**
 * Autode värvid vana ja uue lambi all.
 *
 * Need EI tule display.ts-ist: need ei ole spektri ribad, vaid see, mis värvi
 * auto SILMA paistab. Vana lambi all on mõlemad autod täpselt sama tooni –
 * sellepärast on siin üksainus konstant, mitte kaks ühesugust.
 */
const SODIUM_CAR = "#8a7f4e";
const RED_CAR = "#b91c1c";
const BLUE_CAR = "#1d4ed8";

type StreetFrameProps = {
  offsetX: number;
  caption: string;
  /** Lambi valguskoonuse värv. */
  lampColour: string;
  cars: readonly { colour: string; label: string }[];
};

function StreetFrame({ offsetX, caption, lampColour, cars }: StreetFrameProps) {
  const x = (value: number) => offsetX + value;
  return (
    <g>
      <rect
        x={x(6)}
        y={14}
        width={STREET_FRAME_WIDTH - 12}
        height={176}
        rx={10}
        className="fill-white stroke-line"
        strokeWidth={1}
      />
      {/* Öine taust – ilma selleta ei ole tänavavalgusti stseen äratuntav. */}
      <rect
        x={x(7)}
        y={15}
        width={STREET_FRAME_WIDTH - 14}
        height={132}
        rx={9}
        fill="#0f172a"
      />
      {/* Valgusti post ja valguskoonus. */}
      <line
        x1={x(30)}
        y1={40}
        x2={x(30)}
        y2={146}
        className="stroke-ink-soft"
        strokeWidth={3}
      />
      <circle cx={x(42)} cy={40} r={7} fill={lampColour} />
      <path
        d={`M ${x(42)} ${46} L ${x(14)} ${146} L ${x(150)} ${146} Z`}
        fill={lampColour}
        opacity={0.22}
      />
      {/* Tänav. */}
      <line
        x1={x(12)}
        y1={146}
        x2={x(STREET_FRAME_WIDTH - 12)}
        y2={146}
        className="stroke-ink-soft"
        strokeWidth={2}
      />
      {cars.map((car, index) => {
        const carX = x(56 + index * 56);
        return (
          <g key={car.label}>
            <rect x={carX} y={116} width={46} height={18} rx={5} fill={car.colour} />
            <rect x={carX + 10} y={106} width={26} height={12} rx={4} fill={car.colour} />
            <circle cx={carX + 12} cy={136} r={5} className="fill-ink-soft" />
            <circle cx={carX + 34} cy={136} r={5} className="fill-ink-soft" />
            <text
              x={carX + 23}
              y={162}
              textAnchor="middle"
              className="fill-ink"
              fontSize={11}
            >
              {car.label}
            </text>
          </g>
        );
      })}
      <text
        x={x(STREET_FRAME_WIDTH / 2)}
        y={183}
        textAnchor="middle"
        className="fill-ink"
        fontSize={12}
        fontWeight={600}
      >
        {caption}
      </text>
    </g>
  );
}

export function StreetLampFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${STREET_VIEW.width} ${STREET_VIEW.height}`}
        role="img"
        aria-label="Joonis kahest kaadrist. Vasakul valgustab tänavat vana kollane naatriumlamp ja mõlemad pargitud autod paistavad täpselt ühte ja sama kollakashalli tooni. Paremal valgustab sama tänavat uus valge LED-valgusti ja seal on näha, et üks auto on punane ja teine sinine."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <StreetFrame
          offsetX={0}
          caption="vana lamp"
          lampColour="#d9a441"
          cars={[
            { colour: SODIUM_CAR, label: "sama toon" },
            { colour: SODIUM_CAR, label: "sama toon" },
          ]}
        />
        <StreetFrame
          offsetX={STREET_VIEW.width - STREET_FRAME_WIDTH}
          caption="uus lamp"
          lampColour="#f8fafc"
          cars={[
            { colour: RED_CAR, label: "punane" },
            { colour: BLUE_CAR, label: "sinine" },
          ]}
        />
        <text
          x={STREET_VIEW.width / 2}
          y={STREET_VIEW.height - 6}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={11}
        >
          autod on mõlemas kaadris samad
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Vana lambi all on mõlemad autod ühte tooni, uue all on üks punane ja teine sinine.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// ls-spekter-riba – teooria
// ---------------------------------------------------------------------------

const SPECTRUM_VIEW = { width: 380, height: 168 };
const SPECTRUM_BAR_Y = 40;
const SPECTRUM_BAR_HEIGHT = 66;

/** Nähtamatute alade laius joonisel – nad on ainult vihje, mitte skaala osa. */
const INVISIBLE_WIDTH = 36;

export function SpectrumStripFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${SPECTRUM_VIEW.width} ${SPECTRUM_VIEW.height}`}
        role="img"
        aria-label="Joonis: pikk spektririba violetist punaseni. Ribas on järjest violett, tumesinine, sinine, roheline, kollane, oranž ja punane. Riba all on lainepikkuse skaala 380 nanomeetrist 760 nanomeetrini. Riba vasakus otsas on hall ala sildiga ultraviolett ja paremas otsas hall ala sildiga infrapuna – kumbagi silm ei näe."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Nähtamatud otsad. Hall, mitte must: nad ei ole „pimedus", vaid
            kiirgus, mida silm lihtsalt ei püüa. */}
        <rect
          x={BAR_LEFT - INVISIBLE_WIDTH}
          y={SPECTRUM_BAR_Y}
          width={INVISIBLE_WIDTH}
          height={SPECTRUM_BAR_HEIGHT}
          className="fill-line"
          rx={3}
        />
        <rect
          x={BAR_RIGHT}
          y={SPECTRUM_BAR_Y}
          width={INVISIBLE_WIDTH}
          height={SPECTRUM_BAR_HEIGHT}
          className="fill-line"
          rx={3}
        />
        <text
          x={BAR_LEFT - INVISIBLE_WIDTH}
          y={30}
          textAnchor="start"
          className="fill-ink-soft"
          fontSize={11}
        >
          ultraviolett
        </text>
        <text
          x={BAR_RIGHT + INVISIBLE_WIDTH}
          y={30}
          textAnchor="end"
          className="fill-ink-soft"
          fontSize={11}
        >
          infrapuna
        </text>
        <text
          x={(BAR_LEFT + BAR_RIGHT) / 2}
          y={30}
          textAnchor="middle"
          className="fill-ink"
          fontSize={12}
          fontWeight={600}
        >
          nähtav valgus
        </text>

        <SpectrumBar
          y={SPECTRUM_BAR_Y}
          height={SPECTRUM_BAR_HEIGHT}
          lit={[{ minNm: VISIBLE_MIN_NM, maxNm: VISIBLE_MAX_NM }]}
          withLabels
        />
        <WavelengthAxis y={SPECTRUM_BAR_Y + SPECTRUM_BAR_HEIGHT + 8} />

        <text
          x={BAR_LEFT - INVISIBLE_WIDTH}
          y={SPECTRUM_VIEW.height - 6}
          textAnchor="start"
          className="fill-ink-soft"
          fontSize={11}
        >
          halli osa silm ei näe
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Päikesevalguse spekter: kõik seitse vikerkaarevärvi järjest, 380 nm-st 760 nm-ni.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// ls-kolm-spektrit – harjutus
// ---------------------------------------------------------------------------

const THREE_VIEW = { width: 380, height: 200 };
const THREE_BAR_HEIGHT = 30;
const THREE_ROWS = [
  {
    id: "A",
    y: 20,
    lit: [{ minNm: VISIBLE_MIN_NM, maxNm: VISIBLE_MAX_NM }],
  },
  {
    id: "B",
    y: 74,
    lit: [{ minNm: 578, maxNm: 588 }],
  },
  {
    id: "C",
    y: 128,
    lit: [
      { minNm: 450, maxNm: 480 },
      { minNm: 515, maxNm: 545 },
      { minNm: 640, maxNm: 675 },
    ],
  },
] as const;

export function ThreeSpectraFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${THREE_VIEW.width} ${THREE_VIEW.height}`}
        role="img"
        aria-label="Joonis kolmest spektriribast üksteise all. Riba A on värviline algusest lõpuni, kõik vikerkaarevärvid on olemas. Riba B on tume ja selles on üksainus kitsas kollane riba. Riba C on tume ja selles on kolm eraldi ribat: sinine, roheline ja punane. Kõigi all on üks ühine lainepikkuse skaala 380 nanomeetrist 760 nanomeetrini."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {THREE_ROWS.map((row) => (
          <g key={row.id}>
            <text
              x={BAR_LEFT - 14}
              y={row.y + THREE_BAR_HEIGHT / 2 + 5}
              textAnchor="end"
              className="fill-ink"
              fontSize={14}
              fontWeight={600}
            >
              {row.id}
            </text>
            <SpectrumBar y={row.y} height={THREE_BAR_HEIGHT} lit={row.lit} />
          </g>
        ))}
        <WavelengthAxis y={THREE_ROWS[2].y + THREE_BAR_HEIGHT + 8} />
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Kolm spektrit: A on värviline algusest lõpuni, B-l on üks kitsas riba, C-l kolm eraldi ribat.
      </figcaption>
    </figure>
  );
}
