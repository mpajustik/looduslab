import {
  CHANNEL_STOPS,
  DARK_LABEL_COLOUR,
  DARK_ROOM_COLOUR,
  OUTLINE_COLOUR,
  channelColour,
  swatchColour,
  swatchLabelColour,
} from "./display";
import {
  CHANNELS,
  perceivedColour,
  perceivedColourForChannels,
  reflectedChannels,
} from "./model";

/**
 * Mooduli joonised (src/engine/figures.ts).
 *
 * Nagu Simulation.tsx, on ka need VAATED: füüsikat siin ei arvutata. Millised
 * nooled esemelt tagasi tulevad ja mis värvi ese seetõttu paistab, ütleb MUDEL
 * (`reflectedChannels`, `perceivedColour`); värvid tulevad display.ts-ist.
 * Joonis ise ei tea ühtegi peegeldusreeglit peast – nii ei saa teooria õun ja
 * simulatsiooni õun kunagi eri värvi olla.
 *
 * **Hooki joonis ei tohi vastust ette öelda.** `ev-must-ja-valge-sark` näitab
 * AINULT seda, ET must särk on kuumem – miks, seda ütlevad teooria ja
 * simulatsioon. Teooria joonis `ev-punane-oun` TOHIB kõik välja öelda, sest
 * seal on see juba õpitav sisu.
 *
 * **Värv ei ole ainus info kandja** (docs/DISAINIJUHIS.md): iga nool kannab
 * kanali nime sõnaga, iga ese oma kirjeldust, ja kogu joonise sisu on
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
  /** Kas nool lõpeb otsikuga. Neelduv nool kaob eseme sisse ilma otsikuta. */
  head?: boolean;
  /**
   * Valge äär noole all – seda vajab nool, mis läheb VÄRVILISE eseme peale.
   * Ilma selleta sulaks roheline nool punase õuna sisse kokku ja kaoks ära
   * juba enne seda, kui ta jõuab „neeldub" öelda.
   */
  halo?: boolean;
};

/**
 * Üks valgusnool.
 *
 * Otsik on arvutatud noole enda nurgast, mitte SVG `marker`-iga: iga värv
 * nõuaks oma markeri definitsiooni ja need kolm defs-plokki oleksid tülikam
 * kordus kui see kaks rida trigonomeetriat.
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
// ev-must-ja-valge-sark – hook
// ---------------------------------------------------------------------------

const SHIRT_VIEW = { width: 380, height: 250 };

/**
 * Mõõdetud kraadid ÜHEST suvisest mõõtmisest.
 *
 * Need EI ole konstandid ja seda ütleb joonis ka ise välja: päris vahe sõltub
 * päikesest, tuulest ja riide materjalist. Sildita jäädes lubaks joonis, et
 * musta särgi pind ONGI 48 °C – ja klassikatse, kus tuleb 39 °C, paistaks
 * õpilasele „ebaõnnestunud" (CodeRabbiti leid samm 4.1z).
 */
const HOT_C = 48;
const COOL_C = 34;

type KidProps = {
  centreX: number;
  /** Särgi värv – mudeli sõna kaudu, mitte heksakood joonises. */
  colourName: string;
  caption: string;
  degrees: number;
  /** Termomeetri toon: soe või jahe. Ta EI ole valgusnool, seega oma värv. */
  meterColour: string;
};

function Kid({ centreX, colourName, caption, degrees, meterColour }: KidProps) {
  const shirt = swatchColour(colourName);
  return (
    <g>
      {/* Pea ja jalad on halli kontuuriga, et valge särk ei kaoks valgel
          taustal ära – ääris ei ole „valgus", vaid piir. */}
      <circle cx={centreX} cy={116} r={13} fill="#e2e8f0" stroke={OUTLINE_COLOUR} />
      <rect
        x={centreX - 25}
        y={132}
        width={50}
        height={54}
        rx={8}
        fill={shirt}
        stroke={OUTLINE_COLOUR}
      />
      <line
        x1={centreX - 12}
        y1={186}
        x2={centreX - 12}
        y2={210}
        stroke={OUTLINE_COLOUR}
        strokeWidth={3}
      />
      <line
        x1={centreX + 12}
        y1={186}
        x2={centreX + 12}
        y2={210}
        stroke={OUTLINE_COLOUR}
        strokeWidth={3}
      />
      {/* Termomeeter särgi kõrval: toru, kuul ja number. */}
      <rect
        x={centreX + 34}
        y={132}
        width={9}
        height={40}
        rx={4}
        fill={meterColour}
      />
      <circle cx={centreX + 38.5} cy={176} r={7} fill={meterColour} />
      <text
        x={centreX + 48}
        y={152}
        textAnchor="start"
        fill={meterColour}
        fontSize={14}
        fontWeight={700}
      >
        {degrees} °C
      </text>
      <text
        x={centreX}
        y={228}
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

export function ShirtsInSunFigure() {
  const sunColour = "#f59e0b";
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${SHIRT_VIEW.width} ${SHIRT_VIEW.height}`}
        role="img"
        aria-label="Joonis: kaks last seisavad kõrvuti päikese käes. Ülal on Päike ja tema kiired jõuavad mõlema lapseni ühtemoodi – mõlemale langeb kaks noolt. Vasakul lapsel on must särk ja tema kõrval on punane termomeeter, mis näitab 48 kraadi. Paremal lapsel on valge särk ja tema kõrval on sinine termomeeter, mis näitab 34 kraadi. Tegemist on ühe mõõtmisega ühel suvepäeval, mitte püsivate arvudega."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <circle cx={190} cy={34} r={19} fill={sunColour} />
        <text
          x={190}
          y={72}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={11}
        >
          sama päike mõlemale
        </text>
        {/* Võrdselt kaks noolt kummalegi – „sama palju valgust" peab olema
            joonisel LOETAV, mitte usutav. */}
        <Arrow x1={172} y1={48} x2={122} y2={104} colour={sunColour} />
        <Arrow x1={186} y1={56} x2={148} y2={104} colour={sunColour} />
        <Arrow x1={208} y1={48} x2={258} y2={104} colour={sunColour} />
        <Arrow x1={194} y1={56} x2={232} y2={104} colour={sunColour} />

        <Kid
          centreX={104}
          colourName="must"
          caption="must särk"
          degrees={HOT_C}
          meterColour="#b91c1c"
        />
        <Kid
          centreX={244}
          colourName="valge"
          caption="valge särk"
          degrees={COOL_C}
          meterColour="#1d4ed8"
        />
        <text
          x={SHIRT_VIEW.width / 2}
          y={246}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={10}
        >
          üks mõõtmine, sama päike ja sama aeg
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Üks mõõtmine suvisel päikesepaistelisel päeval – mõõdetud särgi pinnalt,
        sama päike, sama aeg. Teisel päeval on arvud teised, aga must särk on
        alati soojem.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// ev-punane-oun – teooria
// ---------------------------------------------------------------------------

const APPLE_VIEW = { width: 400, height: 240 };
const APPLE_CENTRE = { x: 226, y: 116 };
const APPLE_R = 46;

/** Langevate noolte kõrgused – üks kanali kohta, `CHANNELS` järjekorras. */
const APPLE_RAY_Y = [76, 116, 156];

export function RedAppleFigure() {
  // Mis tagasi tuleb ja mis värvi õun seetõttu paistab, ütleb MUDEL.
  const reflected = new Set(
    reflectedChannels("white", "apple").map((channel) => channel.id),
  );
  const appleColour = swatchColour(perceivedColour("white", "apple"));
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${APPLE_VIEW.width} ${APPLE_VIEW.height}`}
        role="img"
        aria-label="Joonis: punasele õunale langeb vasakult kolm noolt – punane, roheline ja sinine. Punane nool põrkab õuna pinnalt tagasi ja läheb paremal olevasse silma. Roheline ja sinine nool kaovad õuna sisse ja nende juures on silt: neeldub ja muutub soojuseks. Silma jõuab ainult punane valgus, seepärast paistab õun punane."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <text x={20} y={40} className="fill-ink" fontSize={12} fontWeight={600}>
          valge valgus
        </text>

        {/* Õun joonistatakse ENNE nooli: neelduv nool peab jääma õuna PEALE
            nähtavaks, muidu katab ring ta kinni ja ekraanil lõpevad kõik kolm
            noolt täpselt samas kohas – „kaob eseme sisse" ei tule välja
            (CodeRabbiti leid samm 4.1bb). */}
        <circle
          cx={APPLE_CENTRE.x}
          cy={APPLE_CENTRE.y}
          r={APPLE_R}
          fill={appleColour}
        />
        {/* Vars – ilma selleta on see lihtsalt ring. */}
        <line
          x1={APPLE_CENTRE.x}
          y1={APPLE_CENTRE.y - APPLE_R}
          x2={APPLE_CENTRE.x + 6}
          y2={APPLE_CENTRE.y - APPLE_R - 14}
          stroke="#7c4a12"
          strokeWidth={4}
          strokeLinecap="round"
        />

        {CHANNEL_STOPS.map((channel, index) => {
          const y = APPLE_RAY_Y[index];
          const isReflected = reflected.has(channel.id);
          // Peegelduv nool peatub õuna PINNAL, neelduv läheb sisse ja lõpeb
          // ilma otsikuta – „siia ta jäigi".
          const surfaceX =
            APPLE_CENTRE.x -
            Math.sqrt(Math.max(APPLE_R ** 2 - (y - APPLE_CENTRE.y) ** 2, 0));
          return (
            <g key={channel.id}>
              <Arrow
                x1={24}
                y1={y}
                x2={isReflected ? surfaceX - 4 : APPLE_CENTRE.x + 8}
                y2={y}
                colour={channel.colour}
                head={isReflected}
                halo={!isReflected}
              />
              <text
                x={26}
                y={y - 8}
                className="fill-ink"
                fontSize={11}
                fontWeight={600}
              >
                {channel.label}
              </text>
            </g>
          );
        })}

        {/* Peegeldunud punane nool silma poole. */}
        <Arrow
          x1={APPLE_CENTRE.x + 30}
          y1={APPLE_CENTRE.y - 34}
          x2={APPLE_CENTRE.x + 92}
          y2={APPLE_CENTRE.y - 66}
          colour={channelColour("red")}
        />
        <text
          x={APPLE_CENTRE.x + 34}
          y={APPLE_CENTRE.y - 44}
          className="fill-ink"
          fontSize={11}
          fontWeight={600}
        >
          punane tuleb tagasi
        </text>

        {/* Silm. */}
        <ellipse cx={356} cy={38} rx={16} ry={10} className="fill-white stroke-ink" strokeWidth={2} />
        <circle cx={356} cy={38} r={5} className="fill-ink" />
        <text x={356} y={64} textAnchor="middle" className="fill-ink" fontSize={11}>
          silm
        </text>

        <text
          x={APPLE_CENTRE.x}
          y={APPLE_VIEW.height - 42}
          textAnchor="middle"
          className="fill-ink"
          fontSize={12}
          fontWeight={600}
        >
          roheline ja sinine neelduvad → soojus
        </text>
        <text
          x={APPLE_VIEW.width / 2}
          y={APPLE_VIEW.height - 16}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={11}
        >
          silma jõuab ainult punane – seepärast paistab õun punane
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Punane õun peegeldab tagasi punase ja neelab rohelise ja sinise. Neeldunud
        valgus muutub õunas soojuseks.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// ev-punane-oun – teooria (liitmisreegel)
// ---------------------------------------------------------------------------

const MIX_VIEW = { width: 380, height: 260 };
const MIX_R = 72;
/** Kolme ringi keskpunktid – klassikaline Venni kolmnurk. */
const MIX_CENTRES = {
  red: { x: 150, y: 108 },
  green: { x: 230, y: 108 },
  blue: { x: 190, y: 180 },
} as const;

/**
 * Sildi taust: väike ümarnurgaga plaat teksti taga.
 *
 * Ring ise on `mix-blend-mode: screen` läbi kolme kihi ülekattes ükskõik mis
 * toonis – kollasest lillani. Must tekst ilma taustata kaoks tumedatel
 * kattealadel ära ja valge tekst omakorda helesinisel. Läbipaistev valge plaat
 * annab piisava kontrasti IGA võimaliku alusvärvi peal, ilma et peaks iga
 * ala jaoks eraldi kontrasti arvutama.
 */
function MixLabel({ x, y, text }: { x: number; y: number; text: string }) {
  const width = text.length * 6.4 + 14;
  return (
    <g>
      <rect
        x={x - width / 2}
        y={y - 12}
        width={width}
        height={20}
        rx={10}
        fill="#ffffff"
        opacity={0.88}
      />
      <text
        x={x}
        y={y + 3}
        textAnchor="middle"
        fill={DARK_LABEL_COLOUR}
        fontSize={12}
        fontWeight={700}
      >
        {text}
      </text>
    </g>
  );
}

/**
 * Liitmisreegel: kolm kattuvat valgusringi.
 *
 * Nagu teooriateksti viimane lõik ütleb – „kui tagasi tuleb korraga punane ja
 * roheline, näeb silm kollast; kui kõik kolm, siis valget" –, aga see lõik oli
 * senini puhas jutt ilma pildita. Ringid kasutavad `mix-blend-mode: screen`,
 * sest see JÄLJENDABKI valguste liitumist (mitte värviainete segunemist):
 * punane + roheline ekraanil annabki kollase, mitte pruuni, nagu guaššiga.
 *
 * Taust on tume (nagu simulatsiooni pime tuba), sest valgel taustal ei näita
 * `screen` midagi – valge ekraanil jääbki iga ring nähtamatuks. Ringivärvid
 * tulevad `channelColour`-ist, samad toonid mis nooltel mujal moodulis, nii
 * et õpilane seob need kohe omavahel.
 *
 * Kõik neli ala (kolm üksik-, kolm kahekaupa- ja üks kolmekaupa kattumine)
 * saavad nime `perceivedColourForChannels`-ist – MITTE käsitsi kirjutatud
 * sõnana. Nii ei saa see joonis mudelist lahku minna.
 */
export function AdditiveMixingFigure() {
  const nameOf = (ids: string[]) => perceivedColourForChannels(ids);
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${MIX_VIEW.width} ${MIX_VIEW.height}`}
        role="img"
        aria-label="Joonis: kolm valgusringi kattuvad tumedal taustal. Üksi paistab iga ring oma värvi: punane, roheline, sinine. Punase ja rohelise kattealal on kollane, punase ja sinise kattealal lilla, rohelise ja sinise kattealal helesinine. Kõigi kolme ühisel kattealal keskel on valge."
        className="w-full rounded-2xl border border-line"
        style={{ backgroundColor: DARK_ROOM_COLOUR }}
      >
        <text
          x={MIX_VIEW.width / 2}
          y={26}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={12}
          fontWeight={600}
        >
          valguste liitumine (mitte värviainete segunemine!)
        </text>

        {CHANNELS.map((channel) => {
          const centre = MIX_CENTRES[channel.id as keyof typeof MIX_CENTRES];
          return (
            <circle
              key={channel.id}
              cx={centre.x}
              cy={centre.y}
              r={MIX_R}
              fill={channelColour(channel.id)}
              style={{ mixBlendMode: "screen" }}
            />
          );
        })}

        {/* Üksikalade sildid – väljaspool teisi ringe. */}
        <MixLabel x={112} y={78} text={nameOf(["red"])} />
        <MixLabel x={268} y={78} text={nameOf(["green"])} />
        <MixLabel x={190} y={232} text={nameOf(["blue"])} />

        {/* Kahekaupa kattealade sildid. */}
        <MixLabel x={190} y={92} text={nameOf(["red", "green"])} />
        <MixLabel x={140} y={168} text={nameOf(["red", "blue"])} />
        <MixLabel x={240} y={168} text={nameOf(["green", "blue"])} />

        {/* Kõigi kolme ühine ala. */}
        <MixLabel x={190} y={150} text={nameOf(["red", "green", "blue"])} />
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Kolm valgusringi kattuvad: kahe värvi ühisalal näeb silm nende liitu
        (punane + roheline = kollane), kõigi kolme ühisalal valget. See on
        valguste liitumine – guaššiga segades tuleks teistsugune tulemus.
      </figcaption>
    </figure>
  );
}

/**
 * Theory-1 juurde: õuna näide (miks TEMA on punane) ja selle all liitmisreegel
 * (mis värvi näeb SILM, kui korraga tuleb tagasi mitu kanalit) – kaks eri
 * ideed samast teooriatekstist ühe joonisena, moodul jääb 6 sammu juurde,
 * teist theory-sammu ei lisata (sama muster mis mujal P1-s).
 */
export function ApplePlusMixingFigure() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <RedAppleFigure />
      <AdditiveMixingFigure />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ev-kolm-eset – harjutus
// ---------------------------------------------------------------------------

const THREE_VIEW = { width: 380, height: 230 };
const THREE_TOP = 120;

/**
 * Kolm eset ühe ja sama valge lambi all.
 *
 * Esemed on siin ANONÜÜMSED (A, B, C), mitte „valge paber" ja „must särk":
 * küsimus palub otsustada JOONISE järgi – kumb soojeneb rohkem –, ja tuttav
 * nimi laseks vastata mälu järgi, ilma nooli lugemata. Millised nooled iga
 * eseme juurest tagasi lähevad, ütleb mudel: A on valge paber, B sinine kruus,
 * C must särk, aga seda õpilasele ei öelda.
 */
const THREE_ITEMS = [
  { id: "A", objectId: "paper", centreX: 68 },
  { id: "B", objectId: "mug", centreX: 190 },
  { id: "C", objectId: "shirt", centreX: 312 },
] as const;

export function ThreeObjectsFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${THREE_VIEW.width} ${THREE_VIEW.height}`}
        role="img"
        aria-label="Joonis: kolm eset ühe ja sama valge lambi all. Eseme A juurest lähevad tagasi kolm noolt: punane, roheline ja sinine. Eseme B juurest läheb tagasi üks sinine nool. Eseme C juurest ei lähe tagasi ühtegi noolt. Kõigile kolmele langeb ühepalju valgust."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Lamp ja tema valgusvihk kõigi kolme peale. */}
        <circle cx={THREE_VIEW.width / 2} cy={26} r={13} fill="#fde68a" stroke={OUTLINE_COLOUR} />
        <path
          d={`M ${THREE_VIEW.width / 2 - 10} 38 L 30 ${THREE_TOP + 4} L ${THREE_VIEW.width - 30} ${THREE_TOP + 4} L ${THREE_VIEW.width / 2 + 10} 38 Z`}
          fill="#fde68a"
          opacity={0.35}
        />
        <text
          x={THREE_VIEW.width / 2}
          y={14}
          textAnchor="middle"
          className="fill-ink"
          fontSize={12}
          fontWeight={600}
        >
          üks valge lamp, sama valgus kõigile
        </text>

        {THREE_ITEMS.map((item) => {
          const back = reflectedChannels("white", item.objectId);
          const fill = swatchColour(perceivedColour("white", item.objectId));
          const labelColour = swatchLabelColour(
            perceivedColour("white", item.objectId),
          );
          return (
            <g key={item.id}>
              {back.map((channel, index) => {
                // Nooled lähevad esemelt ülespoole lambi poole – nad on see,
                // mis TAGASI läks, mitte see, mis langes.
                const x = item.centreX + (index - (back.length - 1) / 2) * 18;
                return (
                  <Arrow
                    key={channel.id}
                    x1={x}
                    y1={THREE_TOP + 2}
                    x2={x}
                    y2={THREE_TOP - 40}
                    colour={channelColour(channel.id)}
                  />
                );
              })}
              <rect
                x={item.centreX - 34}
                y={THREE_TOP + 6}
                width={68}
                height={44}
                rx={8}
                fill={fill}
                stroke={OUTLINE_COLOUR}
              />
              <text
                x={item.centreX}
                y={THREE_TOP + 35}
                textAnchor="middle"
                fill={labelColour}
                fontSize={18}
                fontWeight={700}
              >
                {item.id}
              </text>
              <text
                x={item.centreX}
                y={THREE_TOP + 70}
                textAnchor="middle"
                className="fill-ink"
                fontSize={11}
              >
                {back.length === 0
                  ? "tagasi ei tule"
                  : `tagasi ${back.length} värvi`}
              </text>
              <text
                x={item.centreX}
                y={THREE_TOP + 86}
                textAnchor="middle"
                className="fill-ink-soft"
                fontSize={10}
              >
                {back.length === 0
                  ? "mitte midagi"
                  : back.map((channel) => channel.label).join(", ")}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Kolm eset sama lambi all: A saadab tagasi kolm värvi, B ühe, C mitte
        ühtegi.
      </figcaption>
    </figure>
  );
}
