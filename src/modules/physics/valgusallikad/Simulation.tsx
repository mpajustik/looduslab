import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { SimulationProps } from "../../../engine/simulationFeatures";
import { Button } from "../../../ui/Button";
import { formatNumber } from "../../../lib/format";
import {
  EXAMPLE_SOURCES,
  POINT_SOURCE_MAX_DEG,
  apparentSizeDeg,
  classifyBySize,
  type ExampleSourceId,
} from "./model";

/**
 * Valgusallikate simulatsioon – ainult VAADE (sisu/MOODUL-valgusallikad.md
 * samm „explore"; docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Füüsikat siin ei arvutata: näiva suuruse annab `apparentSizeDeg` ja liigi
 * `classifyBySize` (CLAUDE.md reegel 1). Ainus koht, kus see fail nurgaga
 * arvutab, on `coneHalfHeight` – see teeb valmis nurgast PIKSLID ega otsusta
 * midagi. Piiri 1° siin failis ei ole: võrdluse teeb mudel.
 *
 * **Joonise kokkulepe:** NURK on joonisel päris (nii nagu mudel ütleb), KAUGUS
 * mitte – allikas seisab alati sama kaugel ekraani servast ja päris kaugus on
 * kirjas arvuna. Teisiti ei saagi: 0,5 m ja 150 000 000 km ei mahu ühele
 * skaalale. Ja just nurk ongi see, mida moodul õpetab – kaugus muudab teda,
 * aga vaadata tuleb nurka.
 *
 * Kaks muudetavat suurust (DISAINIJUHIS): allika mõõde ja kaugus. Nupurida on
 * nende kiirvalik, mitte kolmas suurus – iga nupp paneb paika sama kaks
 * liugurit. Erand on „Päike": tema mõõde ja kaugus jäävad liuguritest miljoneid
 * kordi välja, seega ta lülitab kosmoseskaalale ja avaneb alles pärast maiseid
 * ülesandeid (`unlockedFeatures`, vt activities.ts `simulation.unlocks`).
 */

// --- Liugurite piirid (sisu/MOODUL-valgusallikad.md „explore") --------------

const MIN_SIZE_M = 0.005;
const MAX_SIZE_M = 2;
/**
 * Mõõdu liugur on LOGARITMILINE: 5 mm ja 2 m vahele jääb 400-kordne vahe ja
 * lineaarsel liuguril mahuks kogu LED-i piirkond ühe piksli sisse. Liugur
 * annab sammu numbri 0…`SIZE_SLIDER_STEPS`, mõõdu meetrites arvutab
 * `sizeFromSlider` – üks samm on umbes 3%, seega ülesannete 5% tolerants ei
 * sõltu sellest, kas õpilane tabas naabersammu.
 */
const SIZE_SLIDER_STEPS = 200;

const MIN_DISTANCE_M = 0.5;
/** Ülemine ots peab ulatuma üle 69 m, muidu ei ole ülesanne 1 lahendatav. */
const MAX_DISTANCE_M = 80;
const DISTANCE_STEP_M = 0.5;

/** Avavaade: aken 3 m kauguselt – lai nurk, mida on kohe näha, ja mitte ükski
 *  ülesande seis (ülesanded algavad päevavalgustorust ja LED-ist). */
const DEFAULT_SIZE_M = EXAMPLE_SOURCES.aken.sizeM;
const DEFAULT_DISTANCE_M = EXAMPLE_SOURCES.aken.distanceM;

/** Feature-silt, mida see fail explore-sammu `unlockedFeatures` seast otsib. */
const COSMIC_FEATURE = "kosmoseskaala";

/** Nupurea eestikeelsed nimed. Arvud tulevad `EXAMPLE_SOURCES`-ist, nimed on
 *  kasutajaliidese asi ja elavad seepärast siin (sama otsus mis vedelikel). */
const EXAMPLE_LABELS: Record<ExampleSourceId, string> = {
  led: "LED",
  lambipirn: "lambipirn",
  paevavalgustoru: "päevavalgustoru",
  aken: "aken",
  paike: "Päike",
};

/** Maised näited – Päike on eraldi, sest ta lülitab kosmoseskaalale. */
const EARTH_EXAMPLE_IDS: ExampleSourceId[] = [
  "led",
  "lambipirn",
  "paevavalgustoru",
  "aken",
];

// --- Paigutus (SVG kasutajaühikud, y kasvab ALLA) ---------------------------

const VIEW = { width: 360, height: 220 };
/** Vaatluskoht (silm) paremal, allikas vasakul – nende vahe on joonise „kaugus". */
const EYE = { x: 322, y: 84 };
const SOURCE_X = 84;
const CONE_LENGTH = EYE.x - SOURCE_X;
/** Nurgakaar silma juures. */
const ARC_RADIUS = 40;
/** Kaugusnool joonise all – tema pikkus EI muutu (vt päis). */
const DISTANCE_LINE_Y = 182;
/**
 * Kui kõrgele joonis venida tohib. Väga suure nurga (suur allikas päris lähedal)
 * juures jookseks kiirte kimp joonisest välja – siis kärbime ja ÜTLEME seda ka
 * (`clipped`), et keegi ei mõõdaks joonise pealt vale nurka.
 *
 * Arv on seotud paigutusega: allikas on sama poolkõrgusega, seega
 * `MAX_CONE_HALF` peab jääma alla `SOURCE_X`-i (muidu jookseks allikas joonise
 * vasakust servast välja) ja alla kaugusnoole vahe (muidu kataks ta noole).
 *
 * Alumine piir tuleb aga SISUST: päevavalgustoru 2 m kauguselt on 33,4° ja see
 * on ülesande 1 seis – tema kimp PEAB ära mahtuma, muidu näeks õpilane
 * kärpimise hoiatust kohe ülesande alguses. 78 px annab siia varu (kärpimine
 * algab alles umbes 36° juures).
 */
const MAX_CONE_HALF = 78;
/** Väikseim allika raadius, et punktallikas jääks täpina nähtavaks. */
const MIN_SOURCE_RADIUS = 3;

/**
 * Näiv nurkmõõde → kiirte kimbu poolkõrgus pikslites.
 *
 * PAIGUTUS, mitte füüsika: nurga on juba arvutanud `apparentSizeDeg` ja see
 * funktsioon ainult joonistab ta välja. Ükski ülesande vastus siit ei sõltu –
 * arvu loeb õpilane näidikult, mitte joonise pealt.
 */
function coneHalfHeight(angleDeg: number): number {
  const halfAngleRad = ((angleDeg / 2) * Math.PI) / 180;
  return CONE_LENGTH * Math.tan(halfAngleRad);
}

/** Punkt kiirel kaugusel `radius` silmast. `side` −1 on üleval, +1 all. */
function pointOnRay(halfHeight: number, side: -1 | 1, radius: number) {
  const dx = SOURCE_X - EYE.x;
  const dy = side * halfHeight;
  const length = Math.hypot(dx, dy);
  return {
    x: EYE.x + (dx / length) * radius,
    y: EYE.y + (dy / length) * radius,
  };
}

/** Nurkmõõt: alla 10° on kaks kohta (0,29°), suuremal ühest piisab (33,4°). */
function formatAngle(angleDeg: number): string {
  return formatNumber(angleDeg, angleDeg < 10 ? 2 : 1);
}

/** Mõõt meetrites: 0,005 m · 0,08 m · 1,2 m – nii palju kohti, kui vaja. */
function formatSize(sizeM: number): string {
  const decimals = sizeM < 0.01 ? 3 : sizeM < 1 ? 2 : 1;
  return `${formatNumber(sizeM, decimals)} m`;
}

function formatDistance(distanceM: number): string {
  return `${formatNumber(distanceM, distanceM < 10 ? 1 : 0)} m`;
}

/** Kosmoseskaala arvud kilomeetrites – ainult VORMINDUS, arvud on mudelist. */
function formatKilometres(metres: number): string {
  return `${formatNumber(metres / 1000, 0)} km`;
}

function sizeFromSlider(index: number): number {
  const size = MIN_SIZE_M * (MAX_SIZE_M / MIN_SIZE_M) ** (index / SIZE_SLIDER_STEPS);
  return Math.min(MAX_SIZE_M, Math.max(MIN_SIZE_M, size));
}

function sliderFromSize(sizeM: number): number {
  const share = Math.log(sizeM / MIN_SIZE_M) / Math.log(MAX_SIZE_M / MIN_SIZE_M);
  return Math.round(Math.min(1, Math.max(0, share)) * SIZE_SLIDER_STEPS);
}

/**
 * Liuguri väärtus mudelile kõlblikuks. Mudel viskab vahemikust väljas vea (see
 * on tahtlik – vt model.ts), seega vaade ei tohi talle midagi kahtlast anda.
 */
function clampSliderIndex(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return sliderFromSize(DEFAULT_SIZE_M);
  return Math.min(SIZE_SLIDER_STEPS, Math.max(0, Math.round(parsed)));
}

function clampDistance(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_DISTANCE_M;
  return Math.min(MAX_DISTANCE_M, Math.max(MIN_DISTANCE_M, parsed));
}

export function Simulation({ unlockedFeatures = new Set() }: Partial<SimulationProps> = {}) {
  // `<number>` on siin vajalik: `EXAMPLE_SOURCES` on `as const`, seega vaikimisi
  // järeldaks TypeScript olekuks kitsa literaali (1.5) ja liuguri väärtust ei
  // saaks enam sinna panna.
  const [sizeM, setSizeM] = useState<number>(DEFAULT_SIZE_M);
  const [distanceM, setDistanceM] = useState<number>(DEFAULT_DISTANCE_M);
  const [cosmic, setCosmic] = useState(false);
  const sizeSliderId = useId();
  const distanceSliderId = useId();

  // Kosmoseskaala (Päikese nupp) avaneb pärast ülesannet 2 – enne seda ei ole
  // nuppu ekraanil ega saa `cosmic` tõeseks minna.
  const cosmicAvailable = unlockedFeatures.has(COSMIC_FEATURE);
  const cosmicActive = cosmicAvailable && cosmic;

  // Mida praegu vaadatakse. Kosmoseskaalal tulevad mõlemad arvud mudeli
  // näidetest, mitte liuguritelt – liugurid jäävad seni puutumata.
  const source = cosmicActive ? EXAMPLE_SOURCES.paike : { sizeM, distanceM };

  const angleDeg = apparentSizeDeg(source.sizeM, source.distanceM);
  const kind = classifyBySize(angleDeg);
  const kindLabel = kind === "point" ? "punktvalgusallikas" : "laiendatud allikas";

  const rawHalfHeight = coneHalfHeight(angleDeg);
  const clipped = rawHalfHeight > MAX_CONE_HALF;
  const halfHeight = Math.min(rawHalfHeight, MAX_CONE_HALF);
  const sourceRadius = Math.max(halfHeight, MIN_SOURCE_RADIUS);
  const coneTop = { x: SOURCE_X, y: EYE.y - halfHeight };
  const coneBottom = { x: SOURCE_X, y: EYE.y + halfHeight };
  const arcStart = pointOnRay(halfHeight, -1, ARC_RADIUS);
  const arcEnd = pointOnRay(halfHeight, 1, ARC_RADIUS);

  const selectEarthExample = (id: ExampleSourceId) => {
    setSizeM(EXAMPLE_SOURCES[id].sizeM);
    setDistanceM(EXAMPLE_SOURCES[id].distanceM);
    setCosmic(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        // Nurk ise on siltides joonise all – ekraanilugeja saab arvu sealt.
        // Kirjeldus muutub ainult LIIGIGA, mitte iga liuguri sammuga: muidu
        // loeks ekraanilugeja terve lause iga kraadi juures uuesti ette.
        aria-label={
          kind === "point"
            ? "Joonis: valgusallikas vasakul, vaatluskoht paremal ja nende vahel kitsas kiirte kimp – allikas paistab peaaegu punktina."
            : "Joonis: valgusallikas vasakul, vaatluskoht paremal ja nende vahel lai kiirte kimp – allikas paistab laiali."
        }
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Kiirte kimp allika servadest silma – see ongi näiv suurus.
            Täidis on hele, servajooned tugevamad: nurka loetakse servadelt. */}
        <polygon
          points={`${EYE.x},${EYE.y} ${coneTop.x},${coneTop.y} ${coneBottom.x},${coneBottom.y}`}
          className="fill-info"
          fillOpacity={0.18}
        />
        <g className="stroke-ink-soft" strokeWidth={1.5}>
          <line x1={EYE.x} y1={EYE.y} x2={coneTop.x} y2={coneTop.y} />
          <line x1={EYE.x} y1={EYE.y} x2={coneBottom.x} y2={coneBottom.y} />
        </g>

        {/* Nurgakaar silma juures + arv. Kaar on kimbu sees, seega ta ei jookse
            väikese nurga juures kiirtest välja. */}
        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${arcEnd.x} ${arcEnd.y}`}
          className="fill-none stroke-brand"
          strokeWidth={2}
        />
        <text
          x={EYE.x - ARC_RADIUS - 6}
          y={EYE.y - 12}
          textAnchor="end"
          className="fill-brand"
          fontSize={15}
          fontWeight={600}
          stroke="white"
          strokeWidth={4}
          paintOrder="stroke"
        >
          {formatAngle(angleDeg)}°
        </text>

        {/* Allikas: kollane ketas. Raadius järgib kiirte kimpu, aga ei kao
            päris ära – punktallikas peab jääma täpina nähtavaks. */}
        {/* Allikas on ELLIPS, mitte ring: teda nähakse servast ja loeb ainult
            see mõõde, mis on risti vaatesuunaga – täpselt see, mille otstesse
            kiired puutuvad. Ümmargune ketas ulatuks pealegi kimbu sisse ja
            joonisele tekiks kaks eri tumedusega ala. */}
        <ellipse
          cx={SOURCE_X}
          cy={EYE.y}
          rx={Math.min(9, sourceRadius)}
          ry={sourceRadius}
          className="fill-info stroke-ink"
          fillOpacity={0.35}
          strokeWidth={1.5}
        />
        {/* Sildid on FIKSEERITUD kohtades, mitte ketta all: ketta raadius
            muutub nurgaga ja liikuv silt satuks kord noole, kord kiire peale. */}
        {/* Valge ääris: väga suure nurga juures möödub ülemine kiir sildist
            napilt ja jookseks muidu temast läbi (sama võte mis mujal). */}
        <text
          x={8}
          y={16}
          className="fill-ink-soft"
          fontSize={13}
          stroke="white"
          strokeWidth={4}
          paintOrder="stroke"
        >
          valgusallikas
        </text>

        {/* Vaatluskoht */}
        <circle cx={EYE.x} cy={EYE.y} r={5} className="fill-ink" />
        <text x={VIEW.width - 6} y={EYE.y + 26} textAnchor="end" className="fill-ink-soft" fontSize={13}>
          vaatluskoht
        </text>

        {/* Kaugusnool: arv kannab info, joone PIKKUS mitte (vt päis). */}
        <g className="stroke-ink-soft" strokeWidth={1.5}>
          <line x1={SOURCE_X} y1={DISTANCE_LINE_Y} x2={EYE.x} y2={DISTANCE_LINE_Y} />
          <line x1={SOURCE_X} y1={DISTANCE_LINE_Y - 5} x2={SOURCE_X} y2={DISTANCE_LINE_Y + 5} />
          <line x1={EYE.x} y1={DISTANCE_LINE_Y - 5} x2={EYE.x} y2={DISTANCE_LINE_Y + 5} />
        </g>
        <text
          x={(SOURCE_X + EYE.x) / 2}
          y={DISTANCE_LINE_Y - 8}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={13}
          stroke="white"
          strokeWidth={4}
          paintOrder="stroke"
        >
          {cosmicActive ? formatKilometres(source.distanceM) : formatDistance(source.distanceM)}
        </text>
        <text
          x={(SOURCE_X + EYE.x) / 2}
          y={DISTANCE_LINE_Y + 22}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={11}
        >
          joonisel on kaugus alati ühepikkune – muutub nurk
        </text>
      </svg>

      {clipped ? (
        <p className="text-sm text-ink-soft">
          Nii lähedal ei mahu kiirte kimp joonisele ära – päris nurk on veel suurem, kui joonis näitab. Täpne arv on näidikul.
        </p>
      ) : null}

      {/* Numbrid suurelt joonise all: projektorilt ei loe kaugelt istuv õpilane
          15-pikslist silti (sama põhjendus mis teistel moodulitel). */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Readout label="Näiv suurus" value={`${formatAngle(angleDeg)}°`} tone="angle" />
        <Readout label="Allika liik" value={kindLabel} tone="kind" />
      </div>

      {/* Silt üksi ei ole info kandja (DISAINIJUHIS): sama asi ka lausega, koos
          võrdlusega piiriga. Piiri arvu ütleb mudeli konstant, mitte see fail. */}
      <p className="text-base leading-relaxed text-ink-soft">
        {kind === "point"
          ? `${formatAngle(angleDeg)}° on kuni ${POINT_SOURCE_MAX_DEG}° – allikas paistab meile punktina, seega on ta punktvalgusallikas.`
          : `${formatAngle(angleDeg)}° on üle ${POINT_SOURCE_MAX_DEG}° – allikas paistab meile laiali, seega on ta laiendatud allikas.`}
      </p>

      {cosmicActive ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-line bg-brand-soft p-3">
          <p className="text-base leading-relaxed text-ink">
            Kosmoseskaala: Päikese läbimõõt on {formatKilometres(EXAMPLE_SOURCES.paike.sizeM)} ja kaugus{" "}
            {formatKilometres(EXAMPLE_SOURCES.paike.distanceM)}. Need arvud jäävad liuguritest miljoneid kordi välja, seega liugurid puhkavad.
          </p>
          <p className="text-sm text-ink-soft">Vali mõni maine näide, et liuguritega edasi katsetada.</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor={sizeSliderId} className="text-base font-medium text-ink">
          Allika mõõde: {cosmicActive ? formatKilometres(EXAMPLE_SOURCES.paike.sizeM) : formatSize(sizeM)}
        </label>
        <input
          id={sizeSliderId}
          type="range"
          min={0}
          max={SIZE_SLIDER_STEPS}
          step={1}
          value={sliderFromSize(sizeM)}
          disabled={cosmicActive}
          onChange={(event) => setSizeM(sizeFromSlider(clampSliderIndex(event.target.value)))}
          // Ekraanilugeja ütleks muidu liuguri sammu numbri („137"), mis ei
          // tähenda midagi – mõõt meetrites on see, mida õpilane muudab.
          aria-valuetext={formatSize(sizeM)}
          className="h-11 w-full accent-brand disabled:opacity-40"
        />
        <div className="flex justify-between text-sm text-ink-soft">
          <span>{formatSize(MIN_SIZE_M)}</span>
          <span>{formatSize(MAX_SIZE_M)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={distanceSliderId} className="text-base font-medium text-ink">
          Kaugus vaatluskohast:{" "}
          {cosmicActive ? formatKilometres(EXAMPLE_SOURCES.paike.distanceM) : formatDistance(distanceM)}
        </label>
        <input
          id={distanceSliderId}
          type="range"
          min={MIN_DISTANCE_M}
          max={MAX_DISTANCE_M}
          step={DISTANCE_STEP_M}
          value={distanceM}
          disabled={cosmicActive}
          onChange={(event) => setDistanceM(clampDistance(event.target.value))}
          aria-valuetext={`${formatNumber(distanceM, 1)} meetrit`}
          className="h-11 w-full accent-brand disabled:opacity-40"
        />
        <div className="flex justify-between text-sm text-ink-soft">
          <span>{formatDistance(MIN_DISTANCE_M)}</span>
          <span>{formatDistance(MAX_DISTANCE_M)}</span>
        </div>
      </div>

      {/* Näited: kiirvalik, mis paneb paika needsamad kaks liugurit. Päikese
          nupp lülitab kosmoseskaalale ja ilmub alles pärast ülesannet 2. */}
      <div className="flex flex-col gap-2 border-t border-line pt-4">
        <span className="text-base font-medium text-ink">Päris näited</span>
        <div className="flex flex-wrap gap-2">
          {EARTH_EXAMPLE_IDS.map((id) => {
            const selected =
              !cosmicActive &&
              sizeM === EXAMPLE_SOURCES[id].sizeM &&
              distanceM === EXAMPLE_SOURCES[id].distanceM;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => selectEarthExample(id)}
                className={`flex min-h-11 items-center rounded-full border px-4 text-base focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 ${
                  selected ? "border-brand bg-brand-soft font-semibold text-ink" : "border-line text-ink"
                }`}
              >
                {EXAMPLE_LABELS[id]}
              </button>
            );
          })}
          {cosmicAvailable ? (
            <button
              type="button"
              aria-pressed={cosmicActive}
              onClick={() => setCosmic(true)}
              className={`flex min-h-11 items-center rounded-full border px-4 text-base focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 ${
                cosmicActive ? "border-brand bg-brand-soft font-semibold text-ink" : "border-line text-ink"
              }`}
            >
              {EXAMPLE_LABELS.paike}
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => {
            setSizeM(DEFAULT_SIZE_M);
            setDistanceM(DEFAULT_DISTANCE_M);
            setCosmic(false);
          }}
        >
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
  tone: "angle" | "kind";
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3 sm:flex-col sm:items-start sm:gap-1">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`h-1 w-5 shrink-0 rounded-full ${tone === "angle" ? "bg-brand" : "bg-info"}`}
        />
        <span className="text-sm font-medium text-ink-soft">{label}</span>
      </div>
      {/* Liigi nimi on pikk sõna – 360 px ekraanil peab ta murduma, mitte
          kaardilt välja jooksma, seega väiksem aste kui nurgal. */}
      <p
        className={`font-semibold tabular-nums text-ink ${
          tone === "angle" ? "text-3xl" : "text-xl sm:text-2xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
