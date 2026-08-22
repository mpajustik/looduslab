import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { SimulationProps } from "../../../engine/simulationFeatures";
import { Button } from "../../../ui/Button";
import { SliderField } from "../../../ui/SliderField";
import { formatNumber } from "../../../lib/format";
import { START_DEPTH_M, WORDS } from "./activities";
import {
  changingLettersOf,
  letterList,
  letterSymmetryColour,
  letterSymmetryLabel,
  letters,
  mirrorWordText,
  symmetricLettersOf,
} from "./display";
import {
  SLIDERS,
  alongMirrorPositionM,
  imageDepthM,
  isVerticallySymmetricLetter,
  mirrorLetterIndex,
} from "./model";

/**
 * Peeglikirja simulatsioon – ainult VAADE (sisu/MOODUL-peeglikiri.md, samm
 * „explore"; docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Siin ei otsustata ühtki füüsikafakti: kujutise sügavuse annab `imageDepthM`,
 * asendi piki peeglit `alongMirrorPositionM`, tähe uue koha `mirrorLetterIndex`
 * ja tähe kuju `isVerticallySymmetricLetter` – kõik `model.ts`-ist (CLAUDE.md
 * reegel 1). Sõna kokkupanek ja toonid tulevad `display.ts`-ist, needsamad, mis
 * teooria joonisel. Selles failis on ainult PAIGUTUS.
 *
 * VAADE ON PEALTVAADE (nii ütleb ka explore-sammu tekst): peegel on püstine
 * joon, sellest vasakul lebab laual pabeririba sõnaga, paremal on peegli tagune
 * ruum, kus näiline kujutis paistab. Sõna jookseb peegliga RISTI – just seetõttu
 * on iga täht omaette sügavusel ja just seetõttu pöördub peeglis nende järjekord.
 *
 * KAKS TELGE JA MIKS NAD ON ERI MOODI JOONISTATUD:
 *
 * - **Sügavus** (vasakult paremale) PÖÖRDUB. Paber on peeglist `d` ees, kujutis
 *   `d` taga – mõlemad arvud tulevad mudelist, mitte siit.
 * - **Asend piki peeglit** (üleval-all) EI MUUTU. Pabeririba ei ole meelega
 *   peegli keskkohas, vaid sellest veidi ülalpool, ja kujutis on TÄPSELT samal
 *   katkendjoonel – seda joont saab silmaga jälgida. See on mooduli süda ja
 *   predict-sammu vastus: peegel ei nihuta midagi piki iseennast.
 *
 * PEEGELPILT ON PÄRISELT PEEGELDATUD, mitte tagurpidi kirjutatud tekst: iga täht
 * käib läbi `scale(-1 1)` (sama võte, mis joonistel) ja tema koht tuleb mudeli
 * tehtest `wordLength − 1 − indexFromLeft`. Tagurpidi tipitud sõna näeks
 * teistsugune välja ja õpetaks vale asja.
 *
 * MÕÕTKAVA ON ÜKS JA SAMA MÕLEMAL TELJEL ({@link SCALE_PX_PER_M}) – nii ei valeta
 * pilt kauguste kohta. Arvud on siiski ka sõnadega kastikestes joonise all, sest
 * 13-pikslist silti ei loe projektorilt klassi tagant istuv õpilane.
 *
 * VÄRV EI OLE AINUS INFO KANDJA (docs/DISAINIJUHIS.md): roheline ja punane täht
 * on kastikestes ka NIMEPIDI kirjas („Sümmeetrilised tähed: T, A, O") ning sildid
 * tulevad `display.ts`-ist, samast kohast, kust joonise omad.
 *
 * SIMULATSIOONIL EI OLE LISAVÕIMALUSI (`simulation.unlocks`): mõlemad juhtnupud
 * on algusest peale lahti, sest explore-1 vajab nupurida ja explore-4 liugurit.
 */

// --- Paigutus (SVG kasutajaühikud, y kasvab ALLA) --------------------------

const VIEW = { width: 412, height: 190 };

/** Peegel: püstine joon joonise keskel. */
const MIRROR_X = 206;
const MIRROR_TOP = 34;
const MIRROR_BOTTOM = 134;

/**
 * Üks mõõtkava mõlemale teljele: nii on nii sügavus kui ka asend piki peeglit
 * samas suurusjärgus ja pilt ei valeta kauguste kohta.
 *
 * Arv on valitud nii, et pikim sõna (KIIRABI, 7 tähte) mahub koos suurima
 * kaugusega (2 m) veel joonise servade vahele.
 */
const SCALE_PX_PER_M = 30;

/** Ühe tähe kast paberil ja peeglis. */
const CELL_WIDTH = 18;
const CELL_HEIGHT = 26;

/** Peegli keskkoht (joonistatud peegli keskpunkt) – siit mõõdetakse asendit piki peeglit. */
const AXIS_Y = (MIRROR_TOP + MIRROR_BOTTOM) / 2;

/**
 * Pabeririba asend piki peeglit (m), peegli keskkohast ÜLESPOOL.
 *
 * Nullist erinev meelega: kui riba oleks täpselt peegli keskkohas, ei näeks
 * õpilane, et kujutis jääb TÄPSELT samale joonele – ta oleks seal nagunii.
 */
const PAPER_ALONG_M = 0.6;

/** Meetrid ekraanipiksliteks. */
const px = (metres: number): number => metres * SCALE_PX_PER_M;

/** Kaugus ekraanile: üks koht pärast koma, nagu liuguri sammgi. */
const metres = (value: number): string => formatNumber(value, 1);

export function Simulation(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- ühine signatuur (ModulePage annab prop alati kaasa), moodulil ei ole unlock-i.
  _props: Partial<SimulationProps> = {},
) {
  const [word, setWord] = useState<string>(WORDS[0]);
  const [depthM, setDepthM] = useState<number>(START_DEPTH_M);
  const depthSliderId = useId();

  const source = letters(word);
  const wordLength = source.length;

  // Ainus koht, kus füüsika sisse tuleb – kõik neli fakti on mudelist.
  const imageDepth = imageDepthM(depthM);
  const imageAlongM = alongMirrorPositionM(PAPER_ALONG_M);

  const stripWidth = wordLength * CELL_WIDTH;
  const paperRight = MIRROR_X - px(depthM);
  const paperLeft = paperRight - stripWidth;
  // Kujutis on peegli TAGA – ekraanil paremal, seega märgita kaugus.
  const imageLeft = MIRROR_X + px(Math.abs(imageDepth));

  const paperTop = AXIS_Y - px(PAPER_ALONG_M) - CELL_HEIGHT / 2;
  const imageTop = AXIS_Y - px(imageAlongM) - CELL_HEIGHT / 2;

  const mirroredWord = mirrorWordText(word);
  const symmetric = symmetricLettersOf(word);
  const changing = changingLettersOf(word);

  const reset = () => {
    setWord(WORDS[0]);
    setDepthM(START_DEPTH_M);
  };

  return (
    <div className="flex flex-col gap-5">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        // Kirjeldus ei korda liuguri arvu (ekraanilugeja loeks selle iga
        // liigutuse peale uuesti ette) – arvud on kastikestes joonise all.
        // Ta ütleb, MIS pildil on.
        aria-label="Pealtvaade: keskel on peegel püstise joonena, sellest vasakul lebab laual pabeririba sõnaga, paremal peegli taga paistab sama sõna kujutis. Kujutises on tähed vastupidises järjekorras ja iga täht on peegeldatud kujuga. Paber ja kujutis on täpselt samal katkendjoonel, mis jookseb peegliga risti. Sama on sõnadega kirjas kastikestes joonise all."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* ---- Peegli tagune ruum: siin ei ole midagi päriselt ---- */}
        <rect
          x={MIRROR_X}
          y={MIRROR_TOP}
          width={VIEW.width - MIRROR_X - 6}
          height={MIRROR_BOTTOM - MIRROR_TOP}
          fill="#f8fafc"
        />

        {/* ---- Katkendjoon: asend piki peeglit, sama mõlemal pool ----
            Ta on tähtede ALL, sest ta on abijoon, mitte sisu. */}
        <line
          x1={6}
          y1={AXIS_Y - px(PAPER_ALONG_M)}
          x2={VIEW.width - 6}
          y2={AXIS_Y - px(imageAlongM)}
          className="stroke-ink-soft"
          strokeWidth={1.5}
          strokeDasharray="5 5"
        />

        {/* ---- Paber ja kujutis ---- */}
        <LetterStrip
          x={paperLeft}
          y={paperTop}
          source={source}
          mirrored={false}
        />
        <LetterStrip x={imageLeft} y={imageTop} source={source} mirrored />

        {/* ---- Peegel ise: kõige tugevam joon pildil ---- */}
        <line
          x1={MIRROR_X}
          y1={MIRROR_TOP}
          x2={MIRROR_X}
          y2={MIRROR_BOTTOM}
          className="stroke-ink"
          strokeWidth={4}
        />

        {/* ---- Kaugusjooned peeglini ----
            Ilma arvudeta: kõige väiksema kauguse juures oleks vahe paar pikslit
            ja kaks arvu jookseksid teineteisest läbi. Arvud on all real ja
            kastikestes. */}
        <g className="stroke-ink-soft" strokeWidth={1.5}>
          <line x1={paperRight} y1={112} x2={MIRROR_X} y2={112} />
          <line x1={MIRROR_X} y1={112} x2={imageLeft} y2={112} />
        </g>

        {/* ---- Sildid ---- */}
        <g className="stroke-white" strokeWidth={4} paintOrder="stroke">
          <text
            x={6}
            y={26}
            className="fill-ink-soft"
            fontSize={12}
            fontWeight={600}
          >
            Paber laual
          </text>
          <text
            x={VIEW.width - 12}
            y={26}
            textAnchor="end"
            className="fill-ink-soft"
            fontSize={12}
            fontWeight={600}
          >
            Kujutis peeglis
          </text>
          <text
            x={MIRROR_X + 10}
            y={MIRROR_TOP + 14}
            className="fill-ink"
            fontSize={13}
            fontWeight={600}
          >
            peegel
          </text>
          <text
            x={MIRROR_X}
            y={154}
            textAnchor="middle"
            className="fill-ink"
            fontSize={12}
          >
            paber {metres(depthM)} m ees · kujutis {metres(Math.abs(imageDepth))} m taga
          </text>
          {/* Katkendjoon üksi ei ütle, MIDA ta näitab – see lause ütleb.
              Ta on joonise all, mitte joone kõrval: joone kõrval jookseks ta
              lühima sõna („TAAT") juures tähtedest läbi. */}
          <text
            x={MIRROR_X}
            y={172}
            textAnchor="middle"
            className="fill-ink-soft"
            fontSize={11}
          >
            paber ja kujutis on samal katkendjoonel piki peeglit
          </text>
        </g>
      </svg>

      {/* Sõnad ja arvud suurelt ka joonise all: 13-pikslist tähte ei loe
          projektorilt klassi tagant istuv õpilane. 360 px ekraanil lähevad
          kastid üksteise alla, mitte kõrvale. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Readout label="Sõna paberil" value={word} tone="neutral" />
        <Readout
          label="Sõna peeglis"
          value={mirroredWord}
          note={
            mirroredWord === word
              ? "tähtede järjekord pöördus, aga sõna on tagant ette sama"
              : "tähtede järjekord on pöördunud"
          }
          tone="real"
        />
        <Readout
          label="Paberi kaugus peeglist"
          value={`${metres(depthM)} m`}
          tone="neutral"
        />
        <Readout
          label="Kujutis peegli taga"
          value={`${metres(Math.abs(imageDepth))} m`}
          note="sama, mis paberi kaugus – ainult teisel pool peeglit"
          tone="neutral"
        />
        <Readout
          label={`Sümmeetrilised tähed (${letterSymmetryLabel(true)})`}
          value={symmetric.length > 0 ? letterList(symmetric) : "–"}
          note="rohelised: peeglis täpselt samasugused"
          tone="yes"
        />
        <Readout
          label={`Muutuvad tähed (${letterSymmetryLabel(false)})`}
          value={changing.length > 0 ? letterList(changing) : "–"}
          note="punased: peeglis teise kujuga"
          tone="no"
        />
      </div>

      <Chooser
        label="Sõna paberil"
        options={WORDS.map((option) => ({ id: option, label: option }))}
        selectedId={word}
        onSelect={setWord}
      />

      <SliderField
        id={depthSliderId}
        label="Paberi kaugus peeglist"
        value={depthM}
        min={SLIDERS.objectDepthM.min}
        max={SLIDERS.objectDepthM.max}
        step={SLIDERS.objectDepthM.step}
        onChange={(event) =>
          setDepthM(clamp(event.target.value, SLIDERS.objectDepthM, START_DEPTH_M))
        }
        valueText={`${metres(depthM)} m`}
        // Ekraanilugeja ütleks muidu paljast arvu – ühik on siin kogu jutt.
        ariaValueText={`${metres(depthM)} meetrit`}
        minLabel={`${metres(SLIDERS.objectDepthM.min)} m (peegli lähedal)`}
        maxLabel={`${metres(SLIDERS.objectDepthM.max)} m (käeulatusest kaugemal)`}
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
 * Üks täherida: kas paber või tema kujutis peeglis.
 *
 * Kujutise puhul tuleb iga tähe koht MUDELI tehtest (`mirrorLetterIndex`) ja
 * tähe kuju pöörab `scale(-1 1)` – täpselt nii, nagu peegel teeb. Paberil on
 * mõlemad muutmata.
 */
function LetterStrip({
  x,
  y,
  source,
  mirrored,
}: {
  x: number;
  y: number;
  source: readonly string[];
  mirrored: boolean;
}) {
  return (
    <g>
      {source.map((_, slot) => {
        // Peeglis paistab kohal `slot` see täht, mis on paberil kohal
        // `wordLength − 1 − slot`. Paberil on koht seesama, mis indeks.
        const paperIndex = mirrored
          ? mirrorLetterIndex(slot, source.length)
          : slot;
        const letter = source[paperIndex];
        const colour = letterSymmetryColour(isVerticallySymmetricLetter(letter));
        const boxX = x + slot * CELL_WIDTH;
        const centreX = boxX + CELL_WIDTH / 2;
        const baseline = y + 19;

        return (
          <g key={`${slot}-${letter}`}>
            <rect
              x={boxX + 1}
              y={y}
              width={CELL_WIDTH - 2}
              height={CELL_HEIGHT}
              rx={4}
              fill="#ffffff"
              stroke={colour}
              strokeWidth={1.5}
            />
            <g
              transform={
                mirrored ? `translate(${2 * centreX} 0) scale(-1 1)` : undefined
              }
            >
              <text
                x={centreX}
                y={baseline}
                textAnchor="middle"
                className="fill-ink"
                fontSize={15}
                fontWeight={700}
              >
                {letter}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
}

/**
 * Liuguri väärtus mudelile kõlblikuks.
 *
 * Mudel viskab vahemikust väljas vea (see on tahtlik – vt model.ts), seega vaade
 * ei tohi talle midagi kahtlast anda. `<input type="range">` hoiab piire ise, aga
 * see rida maksab vähem kui valge ekraan.
 */
function clamp(
  value: string,
  bounds: { min: number; max: number },
  fallback: number,
): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(bounds.max, Math.max(bounds.min, parsed));
}

/**
 * Üks valikurida. Nupud on LÜLITUSNUPUD (`aria-pressed`), mitte `role="radio"` –
 * sama muster mis mujal projektis (CodeRabbiti leid, samm 4.1cc):
 * `role="radio"` lubaks ekraanilugeja kasutajale nooleklahvidega liikumise ja see
 * lubadus jääks siin täitmata.
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

/** Üks suurus suurelt. Värvitriip kordab joonise värvi, info kannab SILT. */
function Readout({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  tone: "real" | "neutral" | "yes" | "no";
}) {
  // Klassinimed on tervikuna välja kirjutatud, mitte stringidest kokku pandud:
  // Tailwind loeb lähtekoodi tekstina ja `bg-${tone}` kaoks stiililehelt vaikselt
  // ära.
  const stripe =
    tone === "real"
      ? "bg-brand"
      : tone === "yes"
        ? "bg-correct"
        : tone === "no"
          ? "bg-retry"
          : "bg-ink-soft";
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-line p-3">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className={`h-1 w-5 shrink-0 rounded-full ${stripe}`} />
        <span className="text-sm font-medium text-ink-soft">{label}</span>
      </div>
      <p className="text-xl font-semibold tracking-wide text-ink sm:text-2xl">{value}</p>
      {note ? <p className="text-sm text-ink-soft">{note}</p> : null}
    </div>
  );
}
