import { useState } from "react";
import { RotateCcw, Thermometer } from "lucide-react";
import type { SimulationProps } from "../../../engine/simulationFeatures";
import { Button } from "../../../ui/Button";
import {
  CHANNEL_STOPS,
  EMPTY_SLOT_COLOUR,
  FILTER_OPACITY,
  OUTLINE_COLOUR,
  filterColour,
  swatchColour,
  swatchLabelColour,
} from "./display";
import type { ChannelId } from "./model";
import {
  FILTERS,
  LIGHTS,
  blockedChannels,
  blockedShare,
  perceivedColour,
  perceivedColourForChannels,
  transmittedChannels,
} from "./model";

/**
 * Kahe filtripesaga labor – ainult VAADE
 * (sisu/MOODUL-valgusfiltrid.md samm „explore";
 * docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Füüsikat siin ei arvutata (CLAUDE.md reegel 1): mis igast pesast läbi
 * pääseb, ütleb `transmittedChannels`, mis kinni jääb – `blockedChannels`, mis
 * värvi ekraan paistab – `perceivedColour`, ja kui suur osa kinni jääb –
 * `blockedShare`. Värvid tulevad display.ts-ist. See fail arvutab ainult
 * PIKSLEID.
 *
 * **Kus nool lõpeb, otsustab mudel, mitte see fail.** Nool käib pesad läbi
 * järjekorras ja peatub esimeses pesas, kuhu ta enam läbi ei jõua – seda
 * küsitakse mudelilt eraldi kummagi pesa kohta (`transmittedChannels` ühe ja
 * kahe filtriga). Nii ei saa juhtuda, et joonis näitab noolt, mida ekraani
 * värv ei kinnita.
 *
 * **Tühi pesa ei ole takistus.** Tühjast pesast läheb nool katkematult läbi ja
 * pesa ise on ainult katkendlik hall raam sõnaga „tühi" – ta peab olema
 * NÄHTAV (pesa on olemas), aga ei tohi paista klaasina.
 *
 * **Neelduv nool lõpeb punktiga filtri sees, mitte otsikuga:** „siia ta jäigi,
 * temast sai soojus". Filtrid joonistatakse ENNE nooli, muidu katab kile
 * punkti kinni ja kõik nooled lõpevad ekraanil ühte kohta (sama leid mis
 * sammudes 4.1bb ja 4.1ff).
 *
 * **Miks joonis figures.tsx-i oma ei impordi:** siis tiriks explore-samm kaasa
 * kogu selle faili (kontserdilava, ühe filtri joonis, kahe pesa joonis), mida
 * ta ei vaja (CLAUDE.md reegel 13). Ühine on ainult see, mis PEAB ühine olema
 * – vastused mudelist ja värvid display.ts-ist.
 *
 * **Kaks muudetavat suurust korraga** (moodulileping): filter pesas 1 ja
 * filter pesas 2. Lambi valik avaneb alles pärast ülesannet 3
 * (`unlockedFeatures`, vt activities.ts `simulation.unlocks`) – enne seda on
 * lamp valge ja labor uurib ainult filtreid.
 */

// --- Feature-silt ------------------------------------------------------------

/** Silt, mida see fail explore-sammu `unlockedFeatures` seast otsib. */
const LIGHT_CHOICE_FEATURE = "valguse-valik";

// --- Avavaade ----------------------------------------------------------------

/** Valge lamp ja mõlemad pesad tühjad: õpilane näeb kõigepealt, mis on ILMA. */
const DEFAULT_LIGHT_ID: string = "white";

/**
 * „Filtrit ei ole" – see id EI ole mudelis, sest tühjus ei ole filter (vt
 * model.ts: filtril peab olema vähemalt üks läbilastav kanal). Mudelile ta
 * kunagi ei jõua: `filterIds` koostatakse nii, et tühjad pesad jäävad välja.
 */
const EMPTY_SLOT_ID = "none";

/** Valikurida ühe pesa jaoks: tühi + kõik mudeli filtrid. */
const SLOT_OPTIONS = [
  { id: EMPTY_SLOT_ID, label: "tühi" },
  ...FILTERS.map((filter) => ({ id: filter.id, label: filter.label })),
];

// --- Paigutus (SVG kasutajaühikud) ------------------------------------------

const VIEW = { width: 360, height: 226 };

/** Lamp vasakul, keskmise noole kõrgusel. */
const LAMP = { x: 26, y: 116, r: 14 };
/** Nooled algavad lambi paremalt servalt. */
const RAY_START_X = 44;

const SLOT_W = 16;
const SLOT_TOP = 56;
const SLOT_HEIGHT = 124;
/** Kaks pesa üksteise järel – vahe on nii suur, et „neeldub" mahub kõrvale. */
const SLOT_X = [112, 200];

const SCREEN = { x: 306, y: 66, width: 26, height: 104 };

/**
 * Kolme kanali read – ALATI samad, ka siis, kui valguses on ainult üks kanal.
 *
 * Fikseeritud read tähendavad, et lampi vahetades nooled ei hüppa: punane nool
 * on alati ülemine. Nii on näha, mis KADUS, mitte ainult see, mis jäi.
 *
 * `Record<ChannelId, number>` samal põhjusel mis display.ts-i noolekõrgustel:
 * neljas kanal ei tohi vaikselt koordinaadita jääda ja `NaN`-iga joonistatud
 * nool kaoks jooniselt ära ilma ühegi veateateta.
 */
const ROW_Y: Record<ChannelId, number> = { red: 84, green: 116, blue: 148 };

// --- Abifunktsioonid ---------------------------------------------------------

/** Valgus id järgi. Vigane id on programmeerija viga (nupurida tuleb mudelist). */
function findLight(lightId: string) {
  const light = LIGHTS.find((candidate) => candidate.id === lightId);
  if (!light) throw new RangeError(`Tundmatu valgus: ${lightId}`);
  return light;
}

/** Kanalite nimed loeteluna („punane, roheline") või mõttekriips. */
function channelList(channels: readonly { label: string }[]): string {
  if (channels.length === 0) return "–";
  return channels.map((channel) => channel.label).join(", ");
}

type ArrowProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  colour: string;
  /** Kas nool lõpeb otsikuga. Ainult ekraanile jõudev nool lõpeb otsikuga. */
  head?: boolean;
  /**
   * Valge äär noole all – seda vajab nool, mis läheb VÄRVILISE kile peale.
   * Ilma selleta sulaks roheline nool kollase kile sisse kokku ja kaoks ära
   * juba enne seda, kui ta jõuab „neeldub" öelda (sama võte mis figures.tsx-is).
   */
  halo?: boolean;
};

/** Üks valgusnool. Otsik tuleb noole enda nurgast, mitte SVG `marker`-ist. */
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

/** Üks noole lõik joonisel. */
type Segment = { x1: number; x2: number; head: boolean; halo: boolean };

/**
 * Ühe kanali tee lambist edasi: lõigud ja koht, kus ta kinni jäi.
 *
 * Otsust „kas see kanal pääseb sellest pesast läbi" siin ei tehta – see tuleb
 * ette antud loendina `reachesSlot` (mudelilt). Siin on ainult koordinaadid.
 */
function raySegments(
  /** Täidetud pesade x-koordinaadid järjekorras. */
  filledSlots: readonly number[],
  /** Kas kanal jõuab iga täidetud pesa TAHA (sama järjekord). */
  reachesSlot: readonly boolean[],
): { segments: Segment[]; blockedAtX: number | null } {
  const segments: Segment[] = [];
  let x = RAY_START_X;
  for (let index = 0; index < filledSlots.length; index += 1) {
    const slotX = filledSlots[index];
    if (!reachesSlot[index]) {
      // Nool läheb kile sisse ja lõpeb seal punktiga.
      const stopX = slotX + 9;
      segments.push({ x1: x, x2: stopX, head: false, halo: true });
      return { segments, blockedAtX: stopX };
    }
    segments.push({ x1: x, x2: slotX - 4, head: false, halo: false });
    x = slotX + SLOT_W + 4;
  }
  segments.push({ x1: x, x2: SCREEN.x - 6, head: true, halo: false });
  return { segments, blockedAtX: null };
}

export function Simulation({ unlockedFeatures = new Set() }: Partial<SimulationProps> = {}) {
  const [lightId, setLightId] = useState<string>(DEFAULT_LIGHT_ID);
  const [slot1Id, setSlot1Id] = useState<string>(EMPTY_SLOT_ID);
  const [slot2Id, setSlot2Id] = useState<string>(EMPTY_SLOT_ID);

  // Lambi valik ilmub alles pärast ülesannet 3 – enne seda on lamp valge.
  const lightChoiceAvailable = unlockedFeatures.has(LIGHT_CHOICE_FEATURE);

  const light = findLight(lightId);
  const slotIds = [slot1Id, slot2Id];

  // --- Füüsika (kõik mudelist) ----------------------------------------------
  /** Tühi pesa jääb mudelile antavast loendist välja – tühjus ei ole filter. */
  const filterIds = slotIds.filter((id) => id !== EMPTY_SLOT_ID);
  const transmitted = transmittedChannels(lightId, filterIds);
  const blocked = blockedChannels(lightId, filterIds);
  const seenColour = perceivedColour(lightId, filterIds);
  const share = blockedShare(lightId, filterIds);
  const blockedCount = blocked.length;
  const incomingCount = light.channels.length;

  /**
   * Mis jõuab iga pesa TAHA – küsitakse mudelilt pesade kaupa, et joonis
   * teaks, KUS nool lõpeb. Esimene pesa saab loendi `[filter1]`, teine
   * `[filter1, filter2]`; tühi pesa loendisse ei lisandu.
   */
  const filledSlotX: number[] = [];
  const behindSlot: Set<string>[] = [];
  const soFar: string[] = [];
  slotIds.forEach((id, index) => {
    if (id === EMPTY_SLOT_ID) return;
    soFar.push(id);
    const behind = new Set(
      transmittedChannels(lightId, [...soFar]).map((channel) => channel.id),
    );
    filledSlotX.push(SLOT_X[index]);
    behindSlot.push(behind);
  });

  // --- Joonise pikslid ------------------------------------------------------
  const lampColour = swatchColour(perceivedColourForChannels(light.channels));
  const screenColour = swatchColour(seenColour);
  const inLight = new Set<string>(light.channels);

  const reset = () => {
    setLightId(DEFAULT_LIGHT_ID);
    setSlot1Id(EMPTY_SLOT_ID);
    setSlot2Id(EMPTY_SLOT_ID);
  };

  return (
    <div className="flex flex-col gap-5">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        // Arvud ja sõnad on näidikutel joonise all – ekraanilugeja saab need
        // sealt. Kirjeldus ise ei muutu iga valikuga, muidu loeks ekraanilugeja
        // terve lause iga nupuvajutuse peale uuesti ette.
        aria-label="Külgvaade: vasakul lamp, keskel kaks filtripesa üksteise järel ja paremal ekraan. Lambist tulevad paremale nooled – ainult need värvid, mis valitud valguses olemas on, ja iga noole juures on tema värvi nimi. Nool, mida filter läbi ei lase, lõpeb punktiga filtri sees ja tema kõrval seisab sõna neeldub; ülejäänud nooled jätkavad ekraanini. Ekraan on joonistatud selle värviga, mis värvi ta paistab, ja tema peal on sama värvi nimi sõnaga."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <text x={14} y={22} className="fill-ink" fontSize={12} fontWeight={600}>
          {light.label}
        </text>

        {/* Lamp: klaas valguse enda värvi, ümber hall kontuur. */}
        <circle
          cx={LAMP.x}
          cy={LAMP.y}
          r={LAMP.r}
          fill={lampColour}
          stroke={OUTLINE_COLOUR}
        />

        {/* Pesad joonistatakse ENNE nooli – vt faili päist. Tühi pesa on ainult
            katkendlik raam, täidetud pesa poolläbipaistev kile. */}
        {slotIds.map((id, index) => {
          const x = SLOT_X[index];
          const empty = id === EMPTY_SLOT_ID;
          const option = SLOT_OPTIONS.find((candidate) => candidate.id === id);
          return (
            <g key={`slot-${index}`}>
              <rect
                x={x}
                y={SLOT_TOP}
                width={SLOT_W}
                height={SLOT_HEIGHT}
                rx={3}
                fill={empty ? "none" : filterColour(id)}
                opacity={empty ? 1 : FILTER_OPACITY}
                stroke={empty ? EMPTY_SLOT_COLOUR : OUTLINE_COLOUR}
                strokeWidth={empty ? 2 : 1}
                strokeDasharray={empty ? "5 4" : undefined}
              />
              <text
                x={x + SLOT_W / 2}
                y={48}
                textAnchor="middle"
                className="fill-ink"
                fontSize={11}
                fontWeight={600}
              >
                pesa {index + 1}
              </text>
              {/* Nimi kahel real: „punane" + „filter" mahub 360 px laiusel
                  ekraanil pesa alla ilma naabrit puutumata. */}
              <text
                x={x + SLOT_W / 2}
                y={SLOT_TOP + SLOT_HEIGHT + 18}
                textAnchor="middle"
                className="fill-ink"
                fontSize={11}
                fontWeight={600}
              >
                {empty ? "tühi" : (option?.label.split(" ")[0] ?? id)}
              </text>
              {!empty && (
                <text
                  x={x + SLOT_W / 2}
                  y={SLOT_TOP + SLOT_HEIGHT + 31}
                  textAnchor="middle"
                  className="fill-ink-soft"
                  fontSize={10}
                >
                  filter
                </text>
              )}
            </g>
          );
        })}

        {/* Nooled: üks rida kanali kohta, alati samas kohas. */}
        {CHANNEL_STOPS.map((channel) => {
          if (!inLight.has(channel.id)) return null;
          const y = ROW_Y[channel.id];
          const reaches = behindSlot.map((behind) => behind.has(channel.id));
          const { segments, blockedAtX } = raySegments(filledSlotX, reaches);
          return (
            <g key={channel.id}>
              {segments.map((segment) => (
                <Arrow
                  key={segment.x1}
                  x1={segment.x1}
                  y1={y}
                  x2={segment.x2}
                  y2={y}
                  colour={channel.colour}
                  head={segment.head}
                  halo={segment.halo}
                />
              ))}
              {blockedAtX !== null && (
                <>
                  {/* Punkt kile sees: „siia ta jäigi, temast sai soojus". */}
                  <circle
                    cx={blockedAtX}
                    cy={y}
                    r={4}
                    fill={channel.colour}
                    stroke="#ffffff"
                  />
                  <text
                    x={blockedAtX + 12}
                    y={y + 4}
                    className="fill-ink"
                    fontSize={10}
                  >
                    neeldub
                  </text>
                </>
              )}
              {/* Värv ei ole kunagi ainus info kandja: iga noole juures seisab
                  kanali nimi sõnaga (docs/DISAINIJUHIS.md). */}
              <text
                x={RAY_START_X + 4}
                y={y - 8}
                fill={channel.colour}
                fontSize={11}
                fontWeight={600}
              >
                {channel.label}
              </text>
            </g>
          );
        })}

        {/* Ekraan – tema värvi ütleb mudel. Värvi NIMI on ekraani peal püsti,
            sest 26 px laiune riba ei võta rõhtsat sõna vastu; „pime" ekraanil
            seisab nii ka sõna PIME. */}
        <rect
          x={SCREEN.x}
          y={SCREEN.y}
          width={SCREEN.width}
          height={SCREEN.height}
          rx={3}
          fill={screenColour}
          stroke={OUTLINE_COLOUR}
        />
        <text
          x={SCREEN.x + SCREEN.width / 2}
          y={SCREEN.y + SCREEN.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 ${SCREEN.x + SCREEN.width / 2} ${SCREEN.y + SCREEN.height / 2})`}
          fill={swatchLabelColour(seenColour)}
          fontSize={12}
          fontWeight={700}
        >
          {seenColour.toUpperCase()}
        </text>
        <text
          x={SCREEN.x + SCREEN.width / 2}
          y={SCREEN.y + SCREEN.height + 20}
          textAnchor="middle"
          className="fill-ink"
          fontSize={11}
          fontWeight={600}
        >
          ekraan
        </text>
      </svg>

      {/* Numbrid ja sõnad suurelt joonise all: 10-pikslist silti ei loe
          projektorilt klassi tagant istuv õpilane. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Readout
          label="Ekraanile jõuab"
          value={channelList(transmitted)}
          note={transmitted.length === 0 ? "ei midagi" : undefined}
        />
        <Readout
          label="Ekraan paistab"
          value={seenColour.toUpperCase()}
          swatch={screenColour}
        />
      </div>

      {/* Kinni jäänud osa: murd („2 / 3"), mitte protsent – mudel loeb
          KANALEID, mitte vatte (model.ts `blockedShare`). */}
      <p className="flex flex-wrap items-center gap-2 rounded-2xl border border-line p-3 text-base leading-relaxed text-ink">
        {/* „1 värv", aga „0 värvi" ja „2 värvi" – eesti keeles käib ainsuse
            nimetav ainult ühe juurde. */}
        <span className="font-semibold">
          Kinni jääb {blockedCount} {blockedCount === 1 ? "värv" : "värvi"}{" "}
          {incomingCount}-st
        </span>
        <span className="tabular-nums text-ink-soft">
          ({blockedCount} / {incomingCount})
        </span>
        {share > 0 ? (
          <span className="flex items-center gap-1 font-medium text-brand">
            <Thermometer aria-hidden="true" className="size-4" />
            filter soojeneb
          </span>
        ) : (
          <span className="text-ink-soft">filtrid ei võta midagi ära</span>
        )}
      </p>

      <Chooser
        label="Filter pesas 1"
        options={SLOT_OPTIONS}
        selectedId={slot1Id}
        onSelect={setSlot1Id}
      />
      <Chooser
        label="Filter pesas 2"
        options={SLOT_OPTIONS}
        selectedId={slot2Id}
        onSelect={setSlot2Id}
      />
      {lightChoiceAvailable ? (
        <Chooser
          label="Lambi valgus"
          options={LIGHTS}
          selectedId={lightId}
          onSelect={setLightId}
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

/**
 * Üks valikurida. Valikud tulevad mudeli tabelist (pesal lisaks „tühi").
 *
 * Nupud on LÜLITUSNUPUD (`aria-pressed`), mitte `role="radio"` – sama muster
 * mis mujal projektis. Põhjus on CodeRabbiti leid sammust 4.1cc:
 * `role="radio"` LUBAB ekraanilugeja kasutajale, et valikute vahel saab
 * liikuda nooleklahvidega (WAI-ARIA radiogroup), ja see lubadus jääks siin
 * täitmata. Lülitusnupp lubab täpselt seda, mis tal on: Tab kohale, Enter või
 * tühik valimiseks.
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
      <p className="text-xl font-semibold text-ink sm:text-2xl">
        {value}
        {note ? <span className="ml-2 text-base font-medium text-brand">{note}</span> : null}
      </p>
    </div>
  );
}
