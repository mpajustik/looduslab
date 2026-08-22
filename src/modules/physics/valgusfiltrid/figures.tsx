import {
  CHANNEL_STOPS,
  EMPTY_SLOT_COLOUR,
  FILTER_OPACITY,
  OUTLINE_COLOUR,
  SINGLE_FILTER_RAY_Y,
  TWO_SLOT_RAY_Y,
  filterColour,
  swatchColour,
  swatchLabelColour,
} from "./display";
import { perceivedColour, transmittedChannels, type ChannelId } from "./model";

/**
 * Mooduli joonised (src/engine/figures.ts).
 *
 * Nagu Simulation.tsx, on ka need VAATED: füüsikat siin ei arvutata. Millised
 * nooled filtrist läbi pääsevad ja mis värvi ekraan seetõttu on, ütleb MUDEL
 * (`transmittedChannels`, `perceivedColour`); värvid tulevad display.ts-ist.
 * Joonis ise ei tea ühtegi läbilaskereeglit peast – nii ei saa teooria ekraan
 * ja simulatsiooni ekraan kunagi eri värvi olla.
 *
 * **Hooki joonis ei tohi vastust ette öelda.** `vf-lava-prozektor` näitab
 * AINULT seda, ET lava on sinine ja kile soe – miks, seda ütlevad teooria ja
 * simulatsioon. Teooria joonis `vf-uks-filter` TOHIB kõik välja öelda, sest
 * seal on see juba õpitav sisu.
 *
 * **Harjutuse joonis ei tohi samuti vastust ette öelda.** `vf-kaks-pesa` on
 * joonise LUGEMISE ülesanne: küsimus on „mis värvi on ekraan", seega ekraan on
 * joonisel värvitu ja kannab küsimärki. Kui ta oleks juba roheline, ei jääks
 * midagi mõelda.
 *
 * **Värv ei ole ainus info kandja** (docs/DISAINIJUHIS.md): iga nool kannab
 * kanali nime sõnaga, iga filter oma nime, ja kogu joonise sisu on
 * `aria-label`-is lausetena kirjas. Just seepärast töötab moodul ka värvipimeda
 * õpilase jaoks.
 */

// ---------------------------------------------------------------------------
// Ühine nool
// ---------------------------------------------------------------------------

type ArrowProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  colour: string;
  /** Kas nool lõpeb otsikuga. Neelduv nool kaob filtri sisse ilma otsikuta. */
  head?: boolean;
  /**
   * Valge äär noole all – seda vajab nool, mis läheb VÄRVILISE filtri peale.
   * Ilma selleta sulaks roheline nool kollase kile sisse kokku ja kaoks ära
   * juba enne seda, kui ta jõuab „neeldub" öelda (sama leid mis samm 4.1bb).
   */
  halo?: boolean;
};

/**
 * Üks valgusnool.
 *
 * Otsik on arvutatud noole enda nurgast, mitte SVG `marker`-iga: iga värv
 * nõuaks oma markeri definitsiooni ja need plokid oleksid tülikam kordus kui
 * see kaks rida trigonomeetriat.
 */
function Arrow({ x1, y1, x2, y2, colour, head = true, halo = false }: ArrowProps) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 9;
  const tip = (spread: number) =>
    `${x2 - size * Math.cos(angle - spread)},${y2 - size * Math.sin(angle - spread)}`;
  return (
    <g>
      {halo && (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#ffffff"
          strokeWidth={7}
          strokeLinecap="round"
        />
      )}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={colour}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {head && (
        <polygon points={`${x2},${y2} ${tip(0.45)} ${tip(-0.45)}`} fill={colour} />
      )}
    </g>
  );
}

// ---------------------------------------------------------------------------
// vf-lava-prozektor – hook
// ---------------------------------------------------------------------------

const STAGE_VIEW = { width: 380, height: 260 };

/** Prožektori korpus – sama kuju mõlemas pildis, et vahe oleks AINULT kile. */
function Spotlight({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect
        x={x - 16}
        y={y - 12}
        width={32}
        height={24}
        rx={4}
        fill="#334155"
        stroke={OUTLINE_COLOUR}
      />
      {/* Lambi klaas on VALGE – prožektoris põleb tavaline valge lamp. */}
      <circle cx={x} cy={y + 14} r={7} fill="#fefce8" stroke={OUTLINE_COLOUR} />
    </g>
  );
}

export function StageSpotlightFigure() {
  // Kile värv tuleb mudelist läbi display.ts – sinine filter paistab sinine.
  const filmColour = filterColour("blue");
  // Ja lavalaigu värv on see, mis valgest valgusest läbi jääb.
  const stageColour = swatchColour(perceivedColour("white", ["blue"]));
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${STAGE_VIEW.width} ${STAGE_VIEW.height}`}
        role="img"
        aria-label="Joonis: kontserdilava külgvaates. Lae all on prožektor, mille sees põleb valge lamp. Prožektori ees on raamis sinine kile ja tema kõrval on termomeeter sildiga, et kile on käega katsudes soe. Prožektori valgus langeb lavale ja lava on sügavsinine; laval seisab muusik. Vasakul on väike kõrvalpilt: sama prožektor ilma kileta, ja siis on lavalaik valge."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* --- Kõrvalpilt: sama prožektor ILMA kileta ------------------- */}
        <rect
          x={8}
          y={40}
          width={104}
          height={188}
          rx={12}
          fill="#f8fafc"
          stroke={OUTLINE_COLOUR}
          strokeDasharray="4 3"
        />
        <text x={60} y={58} textAnchor="middle" className="fill-ink" fontSize={11} fontWeight={600}>
          ilma kileta
        </text>
        <Spotlight x={60} y={78} />
        <path
          d="M 48 96 L 26 186 L 94 186 L 72 96 Z"
          fill="#fde68a"
          opacity={0.5}
        />
        <rect
          x={22}
          y={186}
          width={76}
          height={12}
          rx={3}
          fill={swatchColour("valge")}
          stroke={OUTLINE_COLOUR}
        />
        <text x={60} y={214} textAnchor="middle" className="fill-ink-soft" fontSize={10}>
          lava on valge
        </text>

        {/* --- Põhipilt: prožektor koos sinise kilega -------------------- */}
        <text x={250} y={26} textAnchor="middle" className="fill-ink" fontSize={12} fontWeight={600}>
          prožektoris põleb valge lamp
        </text>
        {/* Lae latt, mille küljes prožektor ripub. */}
        <rect x={140} y={32} width={220} height={6} rx={3} fill="#94a3b8" />
        <Spotlight x={250} y={54} />

        {/* Valgusvihk kile ja lava vahel – juba sinine. */}
        <path
          d={`M 236 92 L 176 206 L 324 206 L 264 92 Z`}
          fill={stageColour}
          opacity={0.45}
        />
        {/* Sinine kile raamis, otse lambi ees. */}
        <rect
          x={228}
          y={82}
          width={44}
          height={10}
          rx={2}
          fill={filmColour}
          opacity={FILTER_OPACITY}
          stroke={OUTLINE_COLOUR}
        />
        <text x={222} y={90} textAnchor="end" className="fill-ink" fontSize={11} fontWeight={600}>
          sinine kile
        </text>
        {/* Termomeeter kile kõrval: kile on soe. */}
        <g>
          <rect x={288} y={70} width={7} height={22} rx={3} fill="#b91c1c" />
          <circle cx={291.5} cy={96} r={6} fill="#b91c1c" />
          <text x={302} y={82} className="fill-ink" fontSize={10} fontWeight={600}>
            kile on soe
          </text>
        </g>

        {/* Lava põrand ja sinine valgusplekk. */}
        <rect
          x={168}
          y={206}
          width={164}
          height={14}
          rx={3}
          fill={stageColour}
          stroke={OUTLINE_COLOUR}
        />
        <text
          x={250}
          y={216}
          textAnchor="middle"
          fill={swatchLabelColour(perceivedColour("white", ["blue"]))}
          fontSize={10}
          fontWeight={700}
        >
          lava on sinine
        </text>

        {/* Muusik – ilma temata on see lihtsalt värviline ristkülik. */}
        <circle cx={250} cy={172} r={9} fill="#e2e8f0" stroke={OUTLINE_COLOUR} />
        <rect
          x={241}
          y={184}
          width={18}
          height={22}
          rx={4}
          fill="#e2e8f0"
          stroke={OUTLINE_COLOUR}
        />

        <text
          x={250}
          y={240}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={11}
        >
          sama lamp, ainus vahe on kile
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Lava sinine valgus tuleb valgest lambist. Ainus vahe kahe pildi vahel on
        kile prožektori ees – ja see kile on pärast kontserti soe.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// vf-uks-filter – teooria
// ---------------------------------------------------------------------------

const SINGLE_VIEW = { width: 400, height: 240 };
const SINGLE_FILTER_X = 196;
const SINGLE_FILTER_W = 16;
const SINGLE_SCREEN_X = 336;

// Noolte kõrgused elavad display.ts-is (`SINGLE_FILTER_RAY_Y`,
// `TWO_SLOT_RAY_Y`) – nii saab test neid näha, mida .tsx-failist eksportides
// ei saaks (ESLint lubab siit ainult komponente).

export function SingleFilterFigure() {
  // Mis läbi pääseb ja mis värvi ekraan seetõttu on, ütleb MUDEL.
  const through = new Set(
    transmittedChannels("white", ["red"]).map((channel) => channel.id),
  );
  const screenColourName = perceivedColour("white", ["red"]);
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${SINGLE_VIEW.width} ${SINGLE_VIEW.height}`}
        role="img"
        aria-label="Joonis: vasakul on valge lamp, millest lähtub kolm noolt – punane, roheline ja sinine. Nooled lähevad punase filtri poole. Punane nool läheb filtrist läbi ja jõuab paremal olevale ekraanile, mis on punane. Roheline ja sinine nool lõpevad filtri sees punktiga ja nende juures on silt: neeldub ja filter soojeneb."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <text x={16} y={40} className="fill-ink" fontSize={12} fontWeight={600}>
          valge lamp
        </text>
        {/* Lamp. */}
        <circle cx={34} cy={116} r={14} fill="#fefce8" stroke={OUTLINE_COLOUR} />

        {/* Filter joonistatakse ENNE nooli, et neeldunud nool jääks tema PEALE
            nähtavaks – muidu lõpevad kõik kolm noolt ekraanil täpselt samas
            kohas ja „kaob filtri sisse" ei tule välja (leid samm 4.1bb). */}
        <rect
          x={SINGLE_FILTER_X}
          y={44}
          width={SINGLE_FILTER_W}
          height={152}
          rx={3}
          fill={filterColour("red")}
          opacity={FILTER_OPACITY}
          stroke={OUTLINE_COLOUR}
        />
        <text
          x={SINGLE_FILTER_X + SINGLE_FILTER_W / 2}
          y={36}
          textAnchor="middle"
          className="fill-ink"
          fontSize={12}
          fontWeight={600}
        >
          punane filter
        </text>

        {CHANNEL_STOPS.map((channel) => {
          const y = SINGLE_FILTER_RAY_Y[channel.id];
          const passes = through.has(channel.id);
          return (
            <g key={channel.id}>
              {/* Lambist filtrini – see osa on igal kanalil ühesugune. */}
              <Arrow
                x1={52}
                y1={y}
                x2={passes ? SINGLE_FILTER_X - 4 : SINGLE_FILTER_X + 9}
                y2={y}
                colour={channel.colour}
                head={false}
                halo={!passes}
              />
              {/* Neeldunud nool lõpeb punktiga filtri sees: „siia ta jäigi". */}
              {!passes && (
                <circle
                  cx={SINGLE_FILTER_X + 9}
                  cy={y}
                  r={4}
                  fill={channel.colour}
                  stroke="#ffffff"
                />
              )}
              {/* Läbi läinud nool jätkab ekraanini, nüüd otsikuga. */}
              {passes && (
                <Arrow
                  x1={SINGLE_FILTER_X + SINGLE_FILTER_W + 4}
                  y1={y}
                  x2={SINGLE_SCREEN_X - 6}
                  y2={y}
                  colour={channel.colour}
                />
              )}
              <text x={56} y={y - 8} className="fill-ink" fontSize={11} fontWeight={600}>
                {channel.label}
              </text>
              {!passes && (
                <text
                  x={SINGLE_FILTER_X + 22}
                  y={y + 4}
                  className="fill-ink"
                  fontSize={10}
                >
                  neeldub
                </text>
              )}
            </g>
          );
        })}

        {/* Ekraan – tema värvi ütleb mudel. */}
        <rect
          x={SINGLE_SCREEN_X}
          y={56}
          width={20}
          height={128}
          rx={3}
          fill={swatchColour(screenColourName)}
          stroke={OUTLINE_COLOUR}
        />
        <text
          x={SINGLE_SCREEN_X + 10}
          y={202}
          textAnchor="middle"
          className="fill-ink"
          fontSize={11}
          fontWeight={600}
        >
          ekraan
        </text>

        <text
          x={SINGLE_VIEW.width / 2}
          y={222}
          textAnchor="middle"
          className="fill-ink"
          fontSize={12}
          fontWeight={600}
        >
          neeldunud värvid muutuvad filtris soojuseks → filter soojeneb
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Punane filter laseb läbi punase ja neelab rohelise ja sinise. Ekraanile
        jõuab ainult punane valgus, seepärast paistab ekraan {screenColourName}.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// vf-uks-filter – teooria (filter ≠ prisma)
// ---------------------------------------------------------------------------

const CONTRAST_VIEW = { width: 400, height: 200 };
const CONTRAST_DIVIDER_X = 200;

/**
 * Prisma väljuvad kiired – KUUS värvi, mitte kolm.
 *
 * See on ainus koht kogu moodulis, kus värv EI tule mudelist ega `display.ts`
 * kanalitabelist – ja seda meelega. Teooriatekst ütleb ise, et prisma on
 * 9. klassi teema: siin ei ole vaja vastata, mitu KANALIT läbi läheb, vaid
 * ainult näidata, et valge valgus koosneb PALJUST värvist, mitte kolmest, ja
 * et need kõik jäävad ALLES – ainult laiali aetuna. Kolme kanaliga fänn
 * näeks välja nagu RGB-mudel, mitte vikerkaar, ja jätaks vale mulje.
 */
const PRISM_FAN_COLOURS = [
  "#dc2626",
  "#f97316",
  "#eab308",
  "#16a34a",
  "#2563eb",
  "#7c3aed",
] as const;

/** Kolme kanali nooled `FilterVsPrismFigure` vasakul paneelil (rect y 56–128). */
const FILTER_PANEL_RAY_Y: Record<ChannelId, number> = {
  red: 72,
  green: 92,
  blue: 112,
};

/**
 * Filter ≠ prisma: kaks paneeli kõrvuti sama valge lambiga.
 *
 * Teooriateksti kolmas lõik – „Filter ei ole prisma… prisma ei lahuta
 * midagi, ta lihtsalt ei lase osa värve läbi" – oli seni ainult sõnadena
 * kirjas. See on kogu mooduli kõige levinum segiajamine (õpilane arvab, et
 * FILTER lahutab värvid nagu prisma), seepärast saab see oma joonise, mitte
 * lihtsalt lause `SingleFilterFigure` kõrval.
 *
 * Vasak paneel kordab `SingleFilterFigure` IDEED (üks kanal läbi, kaks kaob
 * soojusena) miniatuuris; parem paneel näitab, et prismast tuleb sama
 * valgusest välja KÕIK, mis sisse läks, ainult laiali kantuna – ükski värv ei
 * kadunud ega tulnud juurde.
 */
export function FilterVsPrismFigure() {
  const filterThrough = new Set(
    transmittedChannels("white", ["red"]).map((channel) => channel.id),
  );
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${CONTRAST_VIEW.width} ${CONTRAST_VIEW.height}`}
        role="img"
        aria-label="Joonis kahest paneelist kõrvuti. Vasakul paneelil, pealkirjaga filter, läbib valge lamp punase filtri ja väljub ainult üks punane nool – roheline ja sinine jäävad filtrisse kinni. Paremal paneelil, pealkirjaga prisma, läbib sama valge lamp kolmnurkse prisma ja väljub kuus värvilist noolt lehvikuna: punane, oranž, kollane, roheline, sinine, lilla. Paneelide all seisab: filter võtab värve ära, prisma ei võta midagi ära, ainult laotab need laiali."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <line
          x1={CONTRAST_DIVIDER_X}
          y1={12}
          x2={CONTRAST_DIVIDER_X}
          y2={168}
          stroke={OUTLINE_COLOUR}
          strokeDasharray="4 4"
        />

        {/* --- Vasak paneel: filter --- */}
        <text x={100} y={20} textAnchor="middle" className="fill-ink" fontSize={12} fontWeight={700}>
          FILTER
        </text>
        <circle cx={30} cy={92} r={11} fill="#fefce8" stroke={OUTLINE_COLOUR} />
        <rect
          x={78}
          y={56}
          width={13}
          height={72}
          rx={2}
          fill={filterColour("red")}
          opacity={FILTER_OPACITY}
          stroke={OUTLINE_COLOUR}
        />
        {CHANNEL_STOPS.map((channel) => {
          const passes = filterThrough.has(channel.id);
          const y = FILTER_PANEL_RAY_Y[channel.id];
          return (
            <Arrow
              key={channel.id}
              x1={44}
              y1={y}
              x2={passes ? 160 : 84}
              y2={y}
              colour={channel.colour}
              head={passes}
              halo={!passes}
            />
          );
        })}
        <text x={100} y={150} textAnchor="middle" className="fill-ink" fontSize={10}>
          üks värv läbi, kaks kaob soojusena
        </text>

        {/* --- Parem paneel: prisma --- */}
        <text x={300} y={20} textAnchor="middle" className="fill-ink" fontSize={12} fontWeight={700}>
          PRISMA
        </text>
        <circle cx={222} cy={92} r={11} fill="#fefce8" stroke={OUTLINE_COLOUR} />
        <Arrow x1={236} y1={92} x2={266} y2={92} colour="#94a3b8" />
        <polygon
          points="266,68 266,116 296,92"
          fill="#e2e8f0"
          stroke={OUTLINE_COLOUR}
          opacity={0.7}
        />
        {PRISM_FAN_COLOURS.map((colour, index) => {
          const spread = (index - (PRISM_FAN_COLOURS.length - 1) / 2) * 12;
          return (
            <Arrow
              key={colour}
              x1={296}
              y1={92}
              x2={370}
              y2={92 + spread}
              colour={colour}
            />
          );
        })}
        <text x={300} y={150} textAnchor="middle" className="fill-ink" fontSize={10}>
          kõik värvid alles, ainult laiali aetud
        </text>

        <text
          x={CONTRAST_VIEW.width / 2}
          y={188}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={11}
        >
          filter VÕTAB ÄRA, prisma ainult LAOTAB LAIALI
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Filter neelab osa valgusest ja see kaob soojusena. Prisma ei neela
        midagi – ta lihtsalt aetab kõik värvid, mis valges valguses juba
        olid, üksteisest lahku.
      </figcaption>
    </figure>
  );
}

/**
 * Theory-1 juurde: mehhanismi joonis (`SingleFilterFigure`) ja selle all
 * levinud segiajamise joonis (`FilterVsPrismFigure`) – kaks eri ideed samast
 * teooriatekstist ühe joonisena, moodul jääb 6 sammu juurde, teist
 * theory-sammu ei lisata (sama muster mis mujal P1-s).
 */
export function SingleFilterAndPrismFigure() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <SingleFilterFigure />
      <FilterVsPrismFigure />
    </div>
  );
}

// ---------------------------------------------------------------------------
// vf-kaks-pesa – harjutus
// ---------------------------------------------------------------------------

const TWO_VIEW = { width: 400, height: 220 };
const TWO_SLOT_W = 16;

/**
 * Kaks pesa ühe ja sama valge lambi all.
 *
 * Ekraan on siin TÜHI (küsimärgiga), mitte värvitud: küsimus palub just tema
 * värvi ennustada. Ka pesade vaheline valgus jääb joonisel näitamata – kui
 * seal seisaks „läbi läks punane ja roheline", oleks ülesanne lahendatud juba
 * enne lugemist. Nooled tulevad ainult lambist, ja nende NIMED on kirjas.
 */
const TWO_SLOTS = [
  { id: "yellow", label: "kollane filter", x: 158 },
  { id: "green", label: "roheline filter", x: 240 },
] as const;

// Kõrgused: display.ts `TWO_SLOT_RAY_Y`.

export function TwoSlotsFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${TWO_VIEW.width} ${TWO_VIEW.height}`}
        role="img"
        aria-label="Joonis: vasakul on valge lamp, millest lähtub kolm noolt – punane, roheline ja sinine. Nooled lähevad kahe filtri poole, mis on üksteise järel: pesas 1 on kollane filter ja pesas 2 roheline filter. Paremal on ekraan, mille peal on küsimärk – tema värv tuleb ise välja mõelda."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <text x={16} y={36} className="fill-ink" fontSize={12} fontWeight={600}>
          valge lamp
        </text>
        <circle cx={32} cy={106} r={14} fill="#fefce8" stroke={OUTLINE_COLOUR} />

        {TWO_SLOTS.map((slot, index) => (
          <g key={slot.id}>
            <rect
              x={slot.x}
              y={40}
              width={TWO_SLOT_W}
              height={132}
              rx={3}
              fill={filterColour(slot.id)}
              opacity={FILTER_OPACITY}
              stroke={OUTLINE_COLOUR}
            />
            <text
              x={slot.x + TWO_SLOT_W / 2}
              y={32}
              textAnchor="middle"
              className="fill-ink"
              fontSize={11}
              fontWeight={600}
            >
              pesa {index + 1}
            </text>
            <text
              x={slot.x + TWO_SLOT_W / 2}
              y={188}
              textAnchor="middle"
              className="fill-ink"
              fontSize={11}
            >
              {slot.label}
            </text>
          </g>
        ))}

        {/* Nooled AINULT lambist esimese pesani – edasi peab õpilane ise
            mõtlema. */}
        {CHANNEL_STOPS.map((channel) => {
          const y = TWO_SLOT_RAY_Y[channel.id];
          return (
            <g key={channel.id}>
              <Arrow
                x1={50}
                y1={y}
                x2={TWO_SLOTS[0].x - 6}
                y2={y}
                colour={channel.colour}
              />
              <text x={54} y={y - 8} className="fill-ink" fontSize={11} fontWeight={600}>
                {channel.label}
              </text>
            </g>
          );
        })}

        {/* Ekraan on tühi: tema värv ONGI küsimus. */}
        <rect
          x={330}
          y={52}
          width={22}
          height={112}
          rx={3}
          fill="#ffffff"
          stroke={EMPTY_SLOT_COLOUR}
          strokeWidth={2}
          strokeDasharray="5 4"
        />
        <text
          x={341}
          y={116}
          textAnchor="middle"
          className="fill-ink"
          fontSize={20}
          fontWeight={700}
        >
          ?
        </text>
        <text
          x={341}
          y={188}
          textAnchor="middle"
          className="fill-ink"
          fontSize={11}
          fontWeight={600}
        >
          ekraan
        </text>
        <text
          x={TWO_VIEW.width / 2}
          y={210}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={11}
        >
          mis värvi on ekraan?
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Valge lambi valgus läbib kaks filtrit üksteise järel. Mõtle välja, mis
        jõuab ekraanini.
      </figcaption>
    </figure>
  );
}
