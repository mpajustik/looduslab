import { formatNumber } from "../../../lib/format";
import { LAMPS } from "./activities";
import { colorTemperatureLabel, lightTint } from "./display";
import { classifyColorTemperature } from "./model";

/**
 * Mooduli joonised (src/engine/figures.ts, sisu/MOODUL-lambivalik.md
 * „Sammud").
 *
 * Nagu Simulation.tsx, on ka need VAATED: füüsikat siin ei arvutata. Millisesse
 * vahemikku värvustemperatuur langeb, ütleb MUDEL (`classifyColorTemperature`);
 * eestikeelne silt ja toon tulevad `display.ts`-ist. Nii ei saa teooria joonis
 * ja simulatsiooni kastike kunagi eri silti näidata.
 *
 * Pakendite arvud tulevad `activities.ts`-i lambitabelist – samast, millest
 * teooria tabel. Kaks tabelit läheksid ühel päeval lahku.
 *
 * **Hooki joonis ei tohi vastust ette öelda.** `lv-poeriiul` näitab AINULT
 * karpidel seisvaid arve – ühtki jagatist, silti ega järeldust seal ei ole.
 * Teooria joonis `lv-kolm-varvust` TOHIB kõik välja öelda, sest seal on see
 * juba õpitav sisu.
 *
 * **Värv ei ole ainus info kandja** (docs/DISAINIJUHIS.md): kolme toa pildil on
 * iga tooni all nii SILT kui ka kelvinite arv, ja kogu joonise sisu on
 * `aria-label`-is lausetena kirjas. Just see moodul oleks muidu värvipimeda
 * õpilase jaoks läbimatu.
 */

const OUTLINE_COLOUR = "#94a3b8";

// ---------------------------------------------------------------------------
// lv-poeriiul – hook
// ---------------------------------------------------------------------------

const SHELF_VIEW = { width: 380, height: 210 };

/** Üks lambikarp riiulil: nimi peal, kolm arvu all. */
function LampBox({
  x,
  y,
  width,
  height,
  lamp,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  lamp: (typeof LAMPS)[number];
}) {
  const centreX = x + width / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        fill="#f8fafc"
        stroke={OUTLINE_COLOUR}
        strokeWidth={1.5}
      />
      {/* Pirni siluett karbi peal – karp on lambikarp, mitte lihtsalt kast. */}
      <circle cx={centreX} cy={y + 26} r={11} fill="#fefce8" stroke={OUTLINE_COLOUR} />
      <rect
        x={centreX - 5}
        y={y + 36}
        width={10}
        height={8}
        rx={2}
        fill="#e2e8f0"
        stroke={OUTLINE_COLOUR}
      />
      <text x={centreX} y={y + 62} textAnchor="middle" className="fill-ink" fontSize={12} fontWeight={600}>
        {formatNumber(lamp.powerW)} W
      </text>
      <text x={centreX} y={y + 78} textAnchor="middle" className="fill-ink" fontSize={12} fontWeight={600}>
        {formatNumber(lamp.lumensLm)} lm
      </text>
      <text x={centreX} y={y + 94} textAnchor="middle" className="fill-ink" fontSize={12} fontWeight={600}>
        {formatNumber(lamp.kelvin)} K
      </text>
    </g>
  );
}

export function ShelfFigure() {
  const boxWidth = 82;
  const boxHeight = 110;
  const gap = (SHELF_VIEW.width - LAMPS.length * boxWidth) / (LAMPS.length + 1);
  const boxY = 34;
  const shelfY = boxY + boxHeight;
  /** Kleeps käib LED-karbi peale – tema on see, kelle arvud üksteisele vastu räägivad. */
  const stickerIndex = LAMPS.length - 1;
  const incandescent = LAMPS[0];

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${SHELF_VIEW.width} ${SHELF_VIEW.height}`}
        role="img"
        aria-label={`Joonis: poeriiul, sellel neli lambikarpi kõrvuti. Karpidel on kirjas ${LAMPS.map(
          (lamp) =>
            `${formatNumber(lamp.powerW)} vatti, ${formatNumber(
              lamp.lumensLm,
            )} luumenit ja ${formatNumber(lamp.kelvin)} kelvinit`,
        ).join("; ")}. Kõige parempoolsema karbi peal on veel kleeps „vastab ${formatNumber(
          incandescent.powerW,
        )} W lambile".`}
        className="w-full rounded-2xl border border-line bg-white"
      >
        {LAMPS.map((lamp, index) => {
          const x = gap + index * (boxWidth + gap);
          return (
            <g key={lamp.name}>
              <LampBox x={x} y={boxY} width={boxWidth} height={boxHeight} lamp={lamp} />
              {index === stickerIndex && (
                <g>
                  <rect
                    x={x - 6}
                    y={boxY - 22}
                    width={boxWidth + 12}
                    height={26}
                    rx={4}
                    className="fill-teacher-soft stroke-teacher"
                    strokeWidth={1.5}
                  />
                  <text
                    x={x + boxWidth / 2}
                    y={boxY - 5}
                    textAnchor="middle"
                    className="fill-ink"
                    fontSize={10}
                    fontWeight={600}
                  >
                    vastab {formatNumber(incandescent.powerW)} W lambile
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Riiuliplaat karpide all. */}
        <rect x={8} y={shelfY} width={SHELF_VIEW.width - 16} height={8} rx={3} fill="#cbd5e1" />
        <text
          x={SHELF_VIEW.width / 2}
          y={shelfY + 32}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={12}
        >
          Neli lampi, igal kolm arvu
        </text>
      </svg>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// lv-kolm-varvust – teooria
// ---------------------------------------------------------------------------

const ROOMS_VIEW = { width: 380, height: 200 };

/** Kolm värvustemperatuuri, mille vahel õpilane poes päriselt valib. */
const SHOWN_KELVINS = [2700, 4000, 6500] as const;

/** Üks tuba: sein, laevalgusti, laud – kõigil kolmel täpselt sama kuju. */
function RoomPanel({
  x,
  y,
  width,
  height,
  tint,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  tint: string;
}) {
  const floorY = y + height - 22;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={6} fill={tint} stroke={OUTLINE_COLOUR} strokeWidth={1.5} />
      {/* Põrand */}
      <line x1={x} y1={floorY} x2={x + width} y2={floorY} stroke={OUTLINE_COLOUR} strokeWidth={1.5} />
      {/* Laevalgusti: juhe ja varjund */}
      <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + 16} stroke={OUTLINE_COLOUR} strokeWidth={1.5} />
      <path
        d={`M ${x + width / 2 - 14} ${y + 30} L ${x + width / 2 - 7} ${y + 16} L ${
          x + width / 2 + 7
        } ${y + 16} L ${x + width / 2 + 14} ${y + 30} Z`}
        fill="#e2e8f0"
        stroke={OUTLINE_COLOUR}
      />
      {/* Laud põrandal */}
      <rect x={x + width / 2 - 22} y={floorY - 16} width={44} height={4} fill="#cbd5e1" />
      <rect x={x + width / 2 - 20} y={floorY - 12} width={3} height={12} fill="#cbd5e1" />
      <rect x={x + width / 2 + 17} y={floorY - 12} width={3} height={12} fill="#cbd5e1" />
    </g>
  );
}

// ---------------------------------------------------------------------------
// theory-1 lisajoonis: üks pakend, kolm silti selle kohta, mida arv EI ütle
// ---------------------------------------------------------------------------

const LABEL_VIEW = { width: 380, height: 210 };

/** Näidispakend on LED-lamp – sama, mille kohta hook-joonisel seisab „vastab 60 W lambile". */
const LABEL_LAMP = LAMPS[LAMPS.length - 1];

/** Kolm välja tõmmatud silti: iga arv saab oma noole ja kaks lauset – mida ta ÜTLEB ja mida ta EI ÜTLE. */
type Callout = {
  side: "left" | "right";
  labelX: number;
  labelY: number;
  packageAnchorY: number;
  heading: string;
  lines: [string, string];
};

/**
 * Ühel pakendil on kolm arvu; teooriatekst käsitleb neid kolme eraldi
 * lõiguna. Siin on kõik kolm koos, samal pakendil, kust õpilane neid poes
 * päriselt loeb – ja kohe kõrval, mida iga arv EI tähenda.
 */
export function PackageLabelFigure() {
  const packageX = 148;
  const packageY = 44;
  const packageWidth = 84;
  const packageHeight = 130;
  const lamp = LABEL_LAMP;

  const callouts: Callout[] = [
    {
      side: "right",
      labelX: 372,
      labelY: 34,
      packageAnchorY: packageY + 74,
      heading: `${formatNumber(lamp.lumensLm)} lm`,
      lines: ["Kui palju VALGUST annab.", "See on heledus."],
    },
    {
      side: "left",
      labelX: 8,
      labelY: 100,
      packageAnchorY: packageY + 90,
      heading: `${formatNumber(lamp.powerW)} W`,
      lines: ["Kui palju ELEKTRIT kulub.", "EI ole heledus."],
    },
    {
      side: "right",
      labelX: 372,
      labelY: 166,
      packageAnchorY: packageY + 106,
      heading: `${formatNumber(lamp.kelvin)} K`,
      lines: ["Mis VÄRVI valgus on.", "EI ole lambi temperatuur ega heledus."],
    },
  ];

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${LABEL_VIEW.width} ${LABEL_VIEW.height}`}
        role="img"
        aria-label={`Joonis: üks lambipakend keskel, kolm silti selle ümber. ${formatNumber(
          lamp.lumensLm,
        )} luumenit ütleb, kui palju valgust lamp annab – see on heledus. ${formatNumber(
          lamp.powerW,
        )} vatti ütleb, kui palju elektrit lamp kulutab – see EI ole heledus. ${formatNumber(
          lamp.kelvin,
        )} kelvinit ütleb, mis värvi valgus on – see EI ole lambi temperatuur ega heledus.`}
        className="w-full rounded-2xl border border-line bg-white"
      >
        {callouts.map((callout) => {
          const packageAnchorX = callout.side === "left" ? packageX : packageX + packageWidth;
          return (
            <path
              key={callout.heading}
              d={`M ${packageAnchorX} ${callout.packageAnchorY} L ${callout.labelX} ${callout.labelY - 8}`}
              fill="none"
              stroke={OUTLINE_COLOUR}
              strokeWidth={1.25}
              strokeDasharray="3 3"
            />
          );
        })}

        <LampBox x={packageX} y={packageY} width={packageWidth} height={packageHeight} lamp={lamp} />

        {callouts.map((callout) => {
          const textAnchor = callout.side === "left" ? "start" : "end";
          return (
            <g key={`text-${callout.heading}`}>
              <text x={callout.labelX} y={callout.labelY} textAnchor={textAnchor} className="fill-ink" fontSize={13} fontWeight={700}>
                {callout.heading}
              </text>
              <text x={callout.labelX} y={callout.labelY + 16} textAnchor={textAnchor} className="fill-ink-soft" fontSize={11}>
                {callout.lines[0]}
              </text>
              <text x={callout.labelX} y={callout.labelY + 31} textAnchor={textAnchor} className="fill-ink-soft" fontSize={11}>
                {callout.lines[1]}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Kolm arvu samal pakendil – ainult üks neist ütleb, kui palju valgust lamp annab.
      </figcaption>
    </figure>
  );
}

/**
 * Theory-1 juurde: pakendisilt (lm ja W selgitus, mida `ThreeColoursFigure`
 * ei kata) ja selle all kolm tuba (K selgitus) – moodul jääb 6 sammu juurde,
 * teist theory-sammu ei lisata (sama muster mis
 * `liitvalgus-ja-spekter/SpectrumAndCompositeFigure`).
 */
export function PackageLabelAndThreeColoursFigure() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <PackageLabelFigure />
      <ThreeColoursFigure />
    </div>
  );
}

export function ThreeColoursFigure() {
  const panelWidth = 108;
  const panelHeight = 108;
  const gap = (ROOMS_VIEW.width - SHOWN_KELVINS.length * panelWidth) / (SHOWN_KELVINS.length + 1);
  const panelY = 16;
  const rooms = SHOWN_KELVINS.map((kelvin) => {
    // Liigituse teeb MUDEL, sildi ja tooni display.ts – joonis ei tea ühtki
    // piiri peast (CLAUDE.md reegel 1).
    const kind = classifyColorTemperature(kelvin);
    return { kelvin, kind, label: colorTemperatureLabel(kind), tint: lightTint(kind) };
  });

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${ROOMS_VIEW.width} ${ROOMS_VIEW.height}`}
        role="img"
        aria-label={`Joonis: sama tuba kolm korda kõrvuti, igas laevalgusti ja laud. ${rooms
          .map(
            (room) =>
              `${formatNumber(room.kelvin)} kelvinit on ${room.label}${
                room.kind === "soe" ? " ehk kollakas" : ""
              }`,
          )
          .join("; ")}. Iga pildi all on nii silt kui ka kelvinite arv.`}
        className="w-full rounded-2xl border border-line bg-white"
      >
        {rooms.map((room, index) => {
          const x = gap + index * (panelWidth + gap);
          return (
            <g key={room.kelvin}>
              <RoomPanel x={x} y={panelY} width={panelWidth} height={panelHeight} tint={room.tint} />
              <text
                x={x + panelWidth / 2}
                y={panelY + panelHeight + 22}
                textAnchor="middle"
                className="fill-ink"
                fontSize={12}
                fontWeight={600}
              >
                {room.label}
              </text>
              <text
                x={x + panelWidth / 2}
                y={panelY + panelHeight + 40}
                textAnchor="middle"
                className="fill-ink-soft"
                fontSize={12}
              >
                {formatNumber(room.kelvin)} K
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
