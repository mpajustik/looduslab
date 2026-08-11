import { useState } from "react";
import { RotateCcw, Thermometer } from "lucide-react";
import type { SimulationProps } from "../../../engine/simulationFeatures";
import { Button } from "../../../ui/Button";
import {
  CHANNEL_STOPS_ON_DARK,
  DARK_ROOM_COLOUR,
  OUTLINE_COLOUR,
  channelColourOnDark,
  swatchColour,
} from "./display";
import {
  LIGHTS,
  OBJECTS,
  absorbedChannels,
  absorbedShare,
  perceivedColour,
  perceivedColourForChannels,
  reflectedChannels,
  warmsUp,
} from "./model";

/**
 * Pime tuba lambiga – ainult VAADE
 * (sisu/MOODUL-esemete-varvus.md samm „explore";
 * docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Füüsikat siin ei arvutata (CLAUDE.md reegel 1): mis tuleb tagasi, ütleb
 * `reflectedChannels`, mis jääb esemesse – `absorbedChannels`, mis värvi ese
 * paistab – `perceivedColour`, ja kas ta soojeneb – `warmsUp`. Värvid tulevad
 * display.ts-ist. See fail arvutab ainult PIKSLEID.
 *
 * **Tuba on pime.** Musta tausta mõte ei ole ilu: „mis värvi ese paistab" on
 * vastus ainult siis, kui muud valgust peale valitud lambi ei ole. Taust ei ole
 * päris must (vt display.ts) – muidu kaoks must särk ära ja õpilane ei näeks,
 * KAS ese seal üldse on.
 *
 * **Nool ei lähe kunagi esemest läbi.** Langevad nooled tulevad vasakult ja
 * peatuvad eseme pinnal; tagasi tulnud nooled väljuvad eseme PEALT üles paremale
 * silma poole – täpselt nagu teooria joonisel (figures.tsx `ev-punane-oun`).
 * Kui peegeldunud nool jätkaks esemest paremale, õpetaks joonis vaikselt, et
 * valgus läks esemest LÄBI – ja läbipaistvus on hoopis mooduli `valgusfiltrid`
 * teema.
 *
 * **Neelduv nool ei lõpe otsikuga, vaid punktiga eseme sees:** „siia ta jäigi,
 * temast sai soojus". Ese joonistatakse ENNE nooli, muidu katab ta neelduva
 * noole kinni ja kõik nooled lõpevad ekraanil ühte kohta (sama leid mis
 * sammus 4.1bb).
 *
 * **Miks joonis figures.tsx-i oma ei impordi:** siis tiriks explore-samm kaasa
 * kogu selle faili (kaks last päikese käes, kolm eset), mida ta ei vaja
 * (CLAUDE.md reegel 13). Ühine on ainult see, mis PEAB ühine olema – kanalid ja
 * vastused mudelist, värvid display.ts-ist.
 *
 * **Kaks muudetavat suurust** (moodulileping): lambi valgus ja ese. Liugurit
 * siin ei ole, sest ükski suurus ei ole pidev – ja avanevaid lisavõimalusi ka
 * mitte, seepärast `unlockedFeatures` siin rolli ei mängi.
 */

// --- Avavaade ----------------------------------------------------------------

/** Valge lamp ja punane õun: sama pilt, mis oli teooria joonisel. */
const DEFAULT_LIGHT_ID: string = "white";
const DEFAULT_OBJECT_ID: string = "apple";

// --- Paigutus (SVG kasutajaühikud) ------------------------------------------

const VIEW = { width: 360, height: 238 };

/** Lamp vasakul, eseme kõrguse keskel. */
const LAMP = { x: 28, y: 130, r: 16 };
/** Langevad nooled algavad lambi paremalt servalt. */
const RAY_START_X = 50;

const OBJECT = { x: 138, y: 90, width: 78, height: 82 };
const OBJECT_CENTRE_X = OBJECT.x + OBJECT.width / 2;

/**
 * Kolme kanali read – ALATI samad, ka siis, kui valguses on ainult üks kanal.
 *
 * Fikseeritud read tähendavad, et lampi vahetades nooled ei hüppa: punane nool
 * on alati ülemine. Nii on näha, mis KADUS, mitte ainult see, mis jäi.
 */
const ROW_Y = [104, 130, 156];

/** Silm ülal paremal – tagasi tulnud valgus läheb sinna. */
const EYE = { x: 316, y: 34, rx: 16, ry: 11 };

/** Tekst pimedas toas – valge oleks liiga karm, see on rahulikum. */
const ROOM_TEXT = "#e2e8f0";
const ROOM_TEXT_SOFT = "#94a3b8";

// --- Abifunktsioonid ---------------------------------------------------------

/** Valgus id järgi. Vigane id on programmeerija viga (nupurida tuleb mudelist). */
function findLight(lightId: string) {
  const light = LIGHTS.find((candidate) => candidate.id === lightId);
  if (!light) throw new RangeError(`Tundmatu valgus: ${lightId}`);
  return light;
}

/** Ese id järgi, samal põhjusel. */
function findObject(objectId: string) {
  const object = OBJECTS.find((candidate) => candidate.id === objectId);
  if (!object) throw new RangeError(`Tundmatu ese: ${objectId}`);
  return object;
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
  /** Kas nool lõpeb otsikuga. Neelduv nool lõpeb punktiga, mitte otsikuga. */
  head?: boolean;
};

/**
 * Üks valgusnool. Sama muster mis figures.tsx-is (otsik arvutatakse noole enda
 * nurgast, mitte SVG `marker`-iga), aga oma koopia – vt faili päist.
 *
 * Noole all on ALATI tumeda toa värvi äär: heledal esemel (valge paber, kollane
 * sidrun) sulaks hele nool muidu pinnaga kokku just siis, kui ta on eseme sees
 * ja õpilane peab teda lugema.
 */
function Arrow({ x1, y1, x2, y2, colour, head = true }: ArrowProps) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 9;
  const tip = (spread: number) =>
    `${x2 - size * Math.cos(angle - spread)},${y2 - size * Math.sin(angle - spread)}`;
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={DARK_ROOM_COLOUR}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={colour}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {head ? (
        <polygon points={`${x2},${y2} ${tip(0.45)} ${tip(-0.45)}`} fill={colour} />
      ) : (
        // Punkt noole otsas: valgus jäi esemesse ja muutus seal soojuseks.
        <circle cx={x2} cy={y2} r={4} fill={colour} />
      )}
    </g>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- ühine signatuur (ModulePage annab prop alati kaasa), moodulil ei ole unlock-i.
export function Simulation(_props: Partial<SimulationProps> = {}) {
  const [lightId, setLightId] = useState<string>(DEFAULT_LIGHT_ID);
  const [objectId, setObjectId] = useState<string>(DEFAULT_OBJECT_ID);

  const light = findLight(lightId);
  const object = findObject(objectId);

  // --- Füüsika (kõik mudelist) ----------------------------------------------
  const reflected = reflectedChannels(lightId, objectId);
  const absorbed = absorbedChannels(lightId, objectId);
  const seenColour = perceivedColour(lightId, objectId);
  const absorbedCount = absorbed.length;
  const incomingCount = light.channels.length;
  const heats = warmsUp(lightId, objectId);
  // Osa on mudeli arv 0…1; ekraanile läheb sama asi murruna „2 / 3", sest just
  // kanalite LOENDAMIST ülesanded küsivad (vt model.ts idealiseering 2).
  const share = absorbedShare(lightId, objectId);

  // --- Joonise pikslid ------------------------------------------------------
  const lampColour = swatchColour(perceivedColourForChannels(light.channels));
  const objectColour = swatchColour(seenColour);
  const reflectedIds = new Set(reflected.map((channel) => channel.id));
  const inLight = new Set<string>(light.channels);

  const reset = () => {
    setLightId(DEFAULT_LIGHT_ID);
    setObjectId(DEFAULT_OBJECT_ID);
  };

  return (
    <div className="flex flex-col gap-5">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        // Arvud ja sõnad on näidikutel joonise all – ekraanilugeja saab need
        // sealt. Kirjeldus ise ei muutu iga valikuga, muidu loeks ekraanilugeja
        // terve lause iga nupuvajutuse peale uuesti ette.
        aria-label="Pime tuba: vasakul lamp, keskel ese ja ülal paremal silm. Lambist tulevad eseme poole nooled – ainult need värvid, mis valitud valguses olemas on. Nooled, mida ese peegeldab, väljuvad eseme pealt üles silma poole; ülejäänud lõpevad punktiga eseme sees ja nende nimed on kirjas eseme all. Ese ise on joonistatud selle värviga, mis värvi ta paistab."
        className="w-full rounded-2xl border border-line"
        style={{ backgroundColor: DARK_ROOM_COLOUR }}
      >
        <text x={14} y={22} fill={ROOM_TEXT} fontSize={12} fontWeight={600}>
          {light.label}
        </text>

        {/* Lamp: klaas valguse enda värvi, ümber hall kontuur – ka valge lamp
            peab pimedas toas olema piiritletud ese, mitte laik. */}
        <circle
          cx={LAMP.x}
          cy={LAMP.y}
          r={LAMP.r}
          fill={lampColour}
          stroke={OUTLINE_COLOUR}
        />

        {/* Ese joonistatakse ENNE nooli – vt faili päist. */}
        <rect
          x={OBJECT.x}
          y={OBJECT.y}
          width={OBJECT.width}
          height={OBJECT.height}
          rx={10}
          fill={objectColour}
          stroke={OUTLINE_COLOUR}
        />

        {/* Langevad nooled: üks rida kanali kohta, alati samas kohas.
            Peegelduv nool peatub eseme PINNAL, neelduv läheb sisse ja lõpeb
            punktiga. */}
        {CHANNEL_STOPS_ON_DARK.map((channel, index) => {
          if (!inLight.has(channel.id)) return null;
          const y = ROW_Y[index];
          const isReflected = reflectedIds.has(channel.id);
          return (
            <g key={channel.id}>
              <Arrow
                x1={RAY_START_X}
                y1={y}
                x2={isReflected ? OBJECT.x - 4 : OBJECT_CENTRE_X}
                y2={y}
                colour={channel.colour}
                head={isReflected}
              />
              {/* Värv ei ole kunagi ainus info kandja: iga noole juures seisab
                  kanali nimi sõnaga (docs/DISAINIJUHIS.md). */}
              <text x={RAY_START_X} y={y - 8} fill={channel.colour} fontSize={11} fontWeight={600}>
                {channel.label}
              </text>
            </g>
          );
        })}

        {/* Tagasi tulnud nooled väljuvad eseme PEALT üles silma poole. */}
        {reflected.map((channel, index) => {
          const startX =
            OBJECT_CENTRE_X + (index - (reflected.length - 1) / 2) * 20;
          return (
            <Arrow
              key={channel.id}
              x1={startX}
              y1={OBJECT.y - 2}
              x2={292}
              y2={22 + index * 13}
              colour={channelColourOnDark(channel.id)}
            />
          );
        })}

        {/* Silm. */}
        <ellipse
          cx={EYE.x}
          cy={EYE.y}
          rx={EYE.rx}
          ry={EYE.ry}
          fill="#f8fafc"
          stroke={OUTLINE_COLOUR}
          strokeWidth={2}
        />
        <circle cx={EYE.x} cy={EYE.y} r={5} fill={DARK_ROOM_COLOUR} />
        <text x={EYE.x} y={EYE.y + 26} textAnchor="middle" fill={ROOM_TEXT} fontSize={11}>
          silm
        </text>

        {/* Eseme nimi eseme ALLA, mitte peale: eseme sees lõpevad neelduvad
            nooled ja silt kataks just selle koha kinni, kus valgus „ära kaob"
            (leitud brauseris). Nimi on siin tähtis – „punane õun", mis paistab
            must, on kogu mooduli mõte. */}
        <text
          x={OBJECT_CENTRE_X}
          y={OBJECT.y + OBJECT.height + 20}
          textAnchor="middle"
          fill={ROOM_TEXT}
          fontSize={12}
          fontWeight={600}
        >
          {object.label}
        </text>

        {/* Neeldunud kanalite nimed loendina eseme all: noole KÕRVALE nad 360 px
            laiusel ekraanil ei mahu (sisu/MOODUL-esemete-varvus.md). */}
        <text
          x={OBJECT_CENTRE_X}
          y={OBJECT.y + OBJECT.height + 38}
          textAnchor="middle"
          fill={ROOM_TEXT}
          fontSize={11}
        >
          neeldub: {channelList(absorbed)}
        </text>
        <text
          x={OBJECT_CENTRE_X}
          y={OBJECT.y + OBJECT.height + 54}
          textAnchor="middle"
          fill={ROOM_TEXT_SOFT}
          fontSize={10}
        >
          {absorbedCount === 0
            ? "kõik tuleb tagasi"
            : `${absorbedCount} ${absorbedCount === 1 ? "värv jääb" : "värvi jäävad"} esemesse`}
        </text>
      </svg>

      {/* Numbrid ja sõnad suurelt joonise all: 10-pikslist silti ei loe
          projektorilt klassi tagant istuv õpilane. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Readout
          label="Tagasi tuleb"
          value={channelList(reflected)}
          note={reflected.length === 0 ? "ei midagi" : undefined}
        />
        <Readout
          label="Silm näeb"
          value={seenColour.toUpperCase()}
          swatch={objectColour}
        />
      </div>

      {/* Neeldumise riba: murd („2 / 3"), mitte protsent – mudel loeb KANALEID,
          mitte energiat (model.ts idealiseering 2). Termomeeter ilmub siis, kui
          mudel ütleb `warmsUp`. */}
      <p className="flex flex-wrap items-center gap-2 rounded-2xl border border-line p-3 text-base leading-relaxed text-ink">
        {/* „1 kanal", aga „0 kanalit" ja „2 kanalit" – eesti keeles käib ainsuse
            nimetav ainult ühe juurde. */}
        <span className="font-semibold">
          Neeldub {absorbedCount} {absorbedCount === 1 ? "kanal" : "kanalit"}{" "}
          {incomingCount}-st
        </span>
        <span className="tabular-nums text-ink-soft">
          ({absorbedCount} / {incomingCount})
        </span>
        {heats ? (
          <span className="flex items-center gap-1 font-medium text-brand">
            <Thermometer aria-hidden="true" className="size-4" />
            ese soojeneb
          </span>
        ) : (
          <span className="text-ink-soft">
            {share === 0 ? "ese peaaegu ei soojene" : "ese soojeneb vähe"}
          </span>
        )}
      </p>

      <Chooser
        label="Vali lambi valgus"
        options={LIGHTS}
        selectedId={lightId}
        onSelect={setLightId}
      />
      <Chooser
        label="Vali ese"
        options={OBJECTS}
        selectedId={objectId}
        onSelect={setObjectId}
      />

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
 * Üks valikurida. Valikud tulevad alati mudeli tabelist.
 *
 * Nupud on LÜLITUSNUPUD (`aria-pressed`), mitte `role="radio"` – sama muster
 * mis moodulites `valgusallikad`, `valguse-sirgjooneline-levimine` ja
 * `varjutused`. Põhjus on CodeRabbiti leid sammust 4.1cc: `role="radio"`
 * LUBAB ekraanilugeja kasutajale, et valikute vahel saab liikuda nooleklahvidega
 * (WAI-ARIA radiogroup), ja see lubadus jääks siin täitmata. Lülitusnupp lubab
 * täpselt seda, mis tal on: Tab kohale, Enter või tühik valimiseks.
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
