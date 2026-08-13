import type { ReactNode } from "react";
import { formatNumber } from "../../../lib/format";
import {
  AISLE_DISTANCE_CM,
  MIRROR_APERTURE_CM,
  convexViewWidth,
  flatViewWidth,
  metresFromCentimetres,
  mirrorBulge,
  viewAngleDeg,
} from "./model";

/**
 * Mooduli joonised (src/engine/figures.ts).
 *
 * Need on VAATED, täpselt nagu Simulation.tsx – aga kaks neist teevad VÄITE
 * arvude kohta („kumeras peeglis on näha neli korda pikem lõik", „auto C jääb
 * lehvikust välja"), seega ei tohi nende lehvikud olla silma järgi joonistatud.
 * Kõik lehviku laiused ja nurgad tulevad `model.ts`-ist (CLAUDE.md reegel 1);
 * joonis ise ainult skaleerib meetrid piksliteks. Nii ei saa joonis ja
 * simulatsioon kunagi eri arve näidata.
 *
 * ÜHIKUD: mudel räägib meetrites, joonis pikslites. Ühik muutub ainult
 * skaleerimisel (`PX_PER_METRE`). Mõõtkava on MÕLEMAL teljel sama, muidu ei
 * oleks joonisel olev lehvik enam päris nurga all.
 *
 * VAADE: kaks sisujoonist on ÜLALT vaated (nii nagu simulatsioon), sest lehviku
 * laius on horisontaalne asi. Hooki joonis on kolm eri laadi pilti kõrvuti ja
 * ei väida ühtegi arvu – tema peeglid on lihtsad kaared.
 *
 * MIKS EI OLE VÄRV AINUS INFO KANDJA (DISAINIJUHIS): kaks lehvikut on eri värvi
 * JA eri joonemustriga, ja mõlema juures on arv sõnadega välja kirjutatud.
 */

/** Mõõtkava sisujoonistel: peegli ja vahekäigu joonis. */
const PX_PER_METRE = 30;

/** Simulatsiooni vaikeseis – joonis näitab täpselt seda, millest explore algab. */
const FIGURE_RADIUS_M = 1;
const FIGURE_APERTURE_M = metresFromCentimetres(MIRROR_APERTURE_CM);
const FIGURE_EYE_M = 2;
const FIGURE_AISLE_M = metresFromCentimetres(AISLE_DISTANCE_CM);

/** Laius ekraanile: üks koht peale koma, nagu simulatsiooni kastikestes. */
const width = (valueM: number): string => formatNumber(valueM, 1);

/**
 * Ümmargune kaugus jutu sisse: täisarv ilma komakohata, muidu ühe kohaga.
 *
 * Kasutatakse ainult `aria-label`-i lauses, kus „2,0 meetri kaugusel" kõlaks
 * ettelugejas kohmakalt. Arv tuleb sellegipoolest KONSTANDIST, mitte sõnadega
 * kirja pandud – muidu ütleks ettelugeja ühel päeval vaikselt vale kauguse
 * (CodeRabbiti leid, samm 4.1tt).
 */
const metres = (valueM: number): string =>
  formatNumber(valueM, Number.isInteger(valueM) ? 0 : 1);

// ---------------------------------------------------------------------------
// kr-kolm-peeglit – hook
// ---------------------------------------------------------------------------

const HOOK_VIEW = { width: 360, height: 186 };
const HOOK_PANEL = { top: 6, height: 132 };

/** Ühe hookipaneeli raam ja pealkiri – kolm pilti peavad olema eristatavad. */
function HookPanel({
  x,
  panelWidth,
  title,
  children,
}: {
  x: number;
  panelWidth: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect
        x={0}
        y={HOOK_PANEL.top}
        width={panelWidth}
        height={HOOK_PANEL.height}
        rx={10}
        className="fill-white stroke-line"
        strokeWidth={1}
      />
      {children}
      <text
        x={panelWidth / 2}
        y={HOOK_PANEL.top + HOOK_PANEL.height + 16}
        textAnchor="middle"
        className="fill-ink"
        fontSize={11}
        fontWeight={600}
      >
        {title}
      </text>
      <text
        x={panelWidth / 2}
        y={HOOK_PANEL.top + HOOK_PANEL.height + 30}
        textAnchor="middle"
        className="fill-ink-soft"
        fontSize={10}
      >
        kumerpeegel
      </text>
    </g>
  );
}

/** Ümar peegel posti otsas või laes – hookis on ta lihtne kaar, mitte kerapind. */
function RoundMirror({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        className="fill-brand-soft stroke-brand"
        strokeWidth={2}
      />
      <path
        d={`M ${cx - r * 0.6} ${cy + r * 0.3} A ${r} ${r} 0 0 1 ${cx + r * 0.2} ${cy - r * 0.7}`}
        className="fill-none stroke-brand"
        strokeWidth={1.5}
      />
    </>
  );
}

/**
 * Häälestav joonis: kolm kohta, kus kumer peegel on.
 *
 * Joonis ei väida ühtegi arvu ega nurka – hook ei tohi vastust ette öelda. Ta
 * näitab ainult seda, ET sama ümar peegel on korraga kahes aitavas ja ühes
 * petvas kohas. MIKS, seda ütlevad teooria ja simulatsioon.
 */
export function ThreeMirrorsFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${HOOK_VIEW.width} ${HOOK_VIEW.height}`}
        role="img"
        aria-label="Kolm pilti kõrvuti. Vasakul ristmik ülalt vaadatuna: maja nurk varjab juhil vaate ristuvale teele ja teisel pool teed on posti otsas ümar peegel. Keskel poe koridori nurk ülalt: kaks riiulirida ja nurga kohal laes ümar peegel. Paremal auto külgpeegel lähivaates, peeglis paistab väike auto ja peegli alaservas on kiri „Esemed on peeglis lähemal kui nad paistavad“. Kõigi kolme all on silt „kumerpeegel“."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* 1. Ristmik: maja nurk varjab vaate, peegel on teisel pool teed. */}
        <HookPanel x={4} panelWidth={104} title="ristmik">
          <rect
            x={8}
            y={40}
            width={88}
            height={22}
            className="fill-line"
            strokeWidth={0}
          />
          <rect
            x={54}
            y={40}
            width={22}
            height={92}
            className="fill-line"
            strokeWidth={0}
          />
          <rect
            x={10}
            y={70}
            width={38}
            height={40}
            rx={2}
            className="fill-ink-soft"
            opacity={0.35}
          />
          <text x={29} y={95} textAnchor="middle" className="fill-ink" fontSize={9}>
            maja
          </text>
          <line x1={65} y1={128} x2={65} y2={100} className="stroke-ink" strokeWidth={2} />
          <RoundMirror cx={82} cy={28} r={11} />
          <line x1={82} y1={39} x2={82} y2={44} className="stroke-ink" strokeWidth={2} />
        </HookPanel>

        {/* 2. Poe koridor: peegel nurga kohal laes. */}
        <HookPanel x={116} panelWidth={104} title="poe koridor">
          <rect
            x={10}
            y={38}
            width={30}
            height={26}
            rx={2}
            className="fill-ink-soft"
            opacity={0.3}
          />
          <rect
            x={62}
            y={38}
            width={30}
            height={26}
            rx={2}
            className="fill-ink-soft"
            opacity={0.3}
          />
          <rect
            x={10}
            y={92}
            width={30}
            height={26}
            rx={2}
            className="fill-ink-soft"
            opacity={0.3}
          />
          <rect
            x={62}
            y={92}
            width={30}
            height={26}
            rx={2}
            className="fill-ink-soft"
            opacity={0.3}
          />
          <text x={25} y={54} textAnchor="middle" className="fill-ink" fontSize={8}>
            riiul
          </text>
          <text x={77} y={54} textAnchor="middle" className="fill-ink" fontSize={8}>
            riiul
          </text>
          <RoundMirror cx={51} cy={78} r={13} />
        </HookPanel>

        {/* 3. Auto külgpeegel: sama ümar peegel, aga siin ta petab. */}
        <HookPanel x={228} panelWidth={128} title="auto külgpeegel">
          <rect
            x={14}
            y={30}
            width={100}
            height={64}
            rx={14}
            className="fill-brand-soft stroke-ink"
            strokeWidth={2}
          />
          {/* Peeglis paistev auto on MEELEGA pisike – suurust siin ei arvutata. */}
          <g className="fill-ink-soft">
            <rect x={54} y={52} width={20} height={9} rx={2} />
            <rect x={59} y={47} width={10} height={6} rx={2} />
          </g>
          <text x={64} y={80} textAnchor="middle" className="fill-ink" fontSize={7}>
            Esemed on peeglis lähemal
          </text>
          <text x={64} y={89} textAnchor="middle" className="fill-ink" fontSize={7}>
            kui nad paistavad
          </text>
          <text x={64} y={112} textAnchor="middle" className="fill-ink-soft" fontSize={9}>
            siin ta PETAB
          </text>
        </HookPanel>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Kolmes kohas on üks ja sama asi: kumer peegel. Kaks neist aitavad, kolmas
        hoiatab ise, et ta petab.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// kr-vaatevali – teooria
// ---------------------------------------------------------------------------

const FIELD_VIEW = { width: 360, height: 202 };
const FIELD_PANEL = { width: 168, height: 144, top: 16 };
/** Peegli tipp paneeli sees ja peatelje kõrgus. */
const FIELD_MIRROR_X = 8;
const FIELD_AXIS_Y = FIELD_PANEL.top + FIELD_PANEL.height / 2;
const FIELD_AISLE_X = FIELD_MIRROR_X + FIGURE_AISLE_M * PX_PER_METRE;
const FIELD_EYE_X = FIELD_MIRROR_X + FIGURE_EYE_M * PX_PER_METRE;
const FIELD_APERTURE_PX = FIGURE_APERTURE_M * PX_PER_METRE;

/** Peegli serva nihe tipust tahapoole – tuleb mudelist, mitte kaarevalemist. */
const FIELD_BULGE_PX =
  mirrorBulge(FIGURE_RADIUS_M, FIGURE_APERTURE_M) * PX_PER_METRE;

/** Kumerpeeglis ja tasapeeglis nähtava lõigu laius vahekäigu joonel (m). */
const FIELD_CONVEX_M = convexViewWidth(
  FIGURE_RADIUS_M,
  FIGURE_APERTURE_M,
  FIGURE_EYE_M,
  FIGURE_AISLE_M,
);
const FIELD_FLAT_M = flatViewWidth(
  FIGURE_APERTURE_M,
  FIGURE_EYE_M,
  FIGURE_AISLE_M,
);

/**
 * Üks paneel: sama suur peegel, üks tasane ja teine kumer.
 *
 * Lehviku serv EI ole nurgast joonistatud, vaid kahest mudeli arvust: ta algab
 * peegli SERVAST (poolläbimõõt `a`, tipust `bulge` võrra taga) ja lõpeb
 * vahekäigu joonel poole nähtava laiuse kaugusel peateljest. Nii ei arvuta
 * joonis ühtegi nurka ise ja peegli enda laius on lehvikus sees – täpselt nagu
 * mudeli valemis.
 */
function FieldPanel({
  x,
  title,
  widthM,
  convex,
}: {
  x: number;
  title: string;
  widthM: number;
  convex: boolean;
}) {
  const halfPx = (widthM / 2) * PX_PER_METRE;
  const edgeX = convex ? FIELD_MIRROR_X - FIELD_BULGE_PX : FIELD_MIRROR_X;
  const fan = [
    `${edgeX},${FIELD_AXIS_Y - FIELD_APERTURE_PX}`,
    `${FIELD_AISLE_X},${FIELD_AXIS_Y - halfPx}`,
    `${FIELD_AISLE_X},${FIELD_AXIS_Y + halfPx}`,
    `${edgeX},${FIELD_AXIS_Y + FIELD_APERTURE_PX}`,
  ].join(" ");
  // Kaks lehvikut on eristatud NII värvi kui ka joonemustriga (DISAINIJUHIS).
  // Klassinimed on siin TERVIKUNA välja kirjutatud, mitte stringidest kokku
  // pandud: Tailwind loeb lähtekoodi tekstina ja `fill-${tone}` ei jõuaks
  // stiililehte üldse (klass kaoks vaikselt, joonis jääks värvituks).
  const tone = convex
    ? { area: "fill-brand", line: "stroke-brand", dash: "6 4" }
    : { area: "fill-info", line: "stroke-info", dash: "2 3" };

  return (
    <g transform={`translate(${x} 0)`}>
      <text
        x={FIELD_PANEL.width / 2}
        y={10}
        textAnchor="middle"
        className="fill-ink"
        fontSize={12}
        fontWeight={600}
      >
        {title}
      </text>
      <rect
        x={0}
        y={FIELD_PANEL.top}
        width={FIELD_PANEL.width}
        height={FIELD_PANEL.height}
        rx={10}
        className="fill-white stroke-line"
        strokeWidth={1}
      />

      {/* Vaatevälja lehvik: pindala + servad. */}
      <polygon points={fan} className={tone.area} fillOpacity={0.14} />
      <g className={tone.line} strokeWidth={1.5} strokeDasharray={tone.dash}>
        <line
          x1={edgeX}
          y1={FIELD_AXIS_Y - FIELD_APERTURE_PX}
          x2={FIELD_AISLE_X}
          y2={FIELD_AXIS_Y - halfPx}
        />
        <line
          x1={edgeX}
          y1={FIELD_AXIS_Y + FIELD_APERTURE_PX}
          x2={FIELD_AISLE_X}
          y2={FIELD_AXIS_Y + halfPx}
        />
      </g>

      {/* Sein ja peegel. Kumeral peeglil tuleb kummumine mudelist. */}
      <line
        x1={FIELD_MIRROR_X}
        y1={FIELD_PANEL.top + 8}
        x2={FIELD_MIRROR_X}
        y2={FIELD_PANEL.top + FIELD_PANEL.height - 8}
        className="stroke-ink-soft"
        strokeWidth={2}
      />
      {convex ? (
        <path
          d={`M ${edgeX} ${FIELD_AXIS_Y - FIELD_APERTURE_PX} Q ${FIELD_MIRROR_X + FIELD_BULGE_PX} ${FIELD_AXIS_Y} ${edgeX} ${FIELD_AXIS_Y + FIELD_APERTURE_PX}`}
          className="fill-none stroke-ink"
          strokeWidth={4}
          strokeLinecap="round"
        />
      ) : (
        <line
          x1={FIELD_MIRROR_X}
          y1={FIELD_AXIS_Y - FIELD_APERTURE_PX}
          x2={FIELD_MIRROR_X}
          y2={FIELD_AXIS_Y + FIELD_APERTURE_PX}
          className="stroke-ink"
          strokeWidth={4}
          strokeLinecap="round"
        />
      )}

      {/* Peatelg ja müüja. */}
      <line
        x1={FIELD_MIRROR_X}
        y1={FIELD_AXIS_Y}
        x2={FIELD_AISLE_X}
        y2={FIELD_AXIS_Y}
        className="stroke-ink-soft"
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      <circle cx={FIELD_EYE_X} cy={FIELD_AXIS_Y} r={4} className="fill-ink" />
      <text
        x={FIELD_EYE_X}
        y={FIELD_AXIS_Y - 9}
        textAnchor="middle"
        className="fill-ink"
        fontSize={9}
      >
        müüja
      </text>

      {/* Vahekäigu joon ja nähtav lõik tema peal. */}
      <line
        x1={FIELD_AISLE_X}
        y1={FIELD_PANEL.top + 6}
        x2={FIELD_AISLE_X}
        y2={FIELD_PANEL.top + FIELD_PANEL.height - 6}
        className="stroke-ink-soft"
        strokeWidth={1}
      />
      <line
        x1={FIELD_AISLE_X}
        y1={FIELD_AXIS_Y - halfPx}
        x2={FIELD_AISLE_X}
        y2={FIELD_AXIS_Y + halfPx}
        className={tone.line}
        strokeWidth={5}
        strokeLinecap="round"
      />
      {/* Arv käib mõõdujoone kõrvale, mitte tema otsa: kumeral peeglil ulatub
          lõik peaaegu paneeli servani ja otsa pandud silt jääks raami taha. */}
      <text
        x={FIELD_AISLE_X - 6}
        y={FIELD_AXIS_Y - 6}
        textAnchor="end"
        className="fill-ink"
        fontSize={11}
        fontWeight={600}
      >
        {width(widthM)} m
      </text>

      {/* Arv ja peegli suurus ka SÕNADEGA: värv ei ole ainus info kandja. */}
      <text
        x={FIELD_PANEL.width / 2}
        y={FIELD_PANEL.top + FIELD_PANEL.height + 18}
        textAnchor="middle"
        className="fill-ink-soft"
        fontSize={10}
      >
        peegel {formatNumber(MIRROR_APERTURE_CM * 2)} cm · näha {width(widthM)} m
      </text>
    </g>
  );
}

/**
 * Teooriajoonis: sama suur peegel kaks korda, tasane ja kumer.
 *
 * Mõlemad lehvikud on ühes ja samas mõõtkavas ning mõlema laius vahekäigu
 * joonel tuleb mudelist. Kogu mooduli väide on ühel pildil: peegli suurus on
 * sama, erineb ainult kumerus – ja nähtav lõik erineb kordades.
 */
export function ViewFieldFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${FIELD_VIEW.width} ${FIELD_VIEW.height}`}
        role="img"
        aria-label={`Kaks kaadrit kõrvuti, mõlemas vahekäik ülalt vaadatuna ja sama ${formatNumber(MIRROR_APERTURE_CM * 2)} sentimeetri laiune peegel seinal. Vasakul on tasane peegel: tema vaatevälja lehvik on kitsas ja vahekäigu joonel katab ${width(FIELD_FLAT_M)} meetri pikkuse lõigu. Paremal on sama laiusega kumer peegel: tema lehvik on palju laiem ja katab samal joonel ${width(FIELD_CONVEX_M)} meetri pikkuse lõigu. Mõlemas kaadris seisab müüja peateljel ${metres(FIGURE_EYE_M)} meetri kaugusel peeglist ja vahekäik on ${metres(FIGURE_AISLE_M)} meetri kaugusel.`}
        className="w-full rounded-2xl border border-line bg-white"
      >
        <FieldPanel x={8} title="tasapeegel" widthM={FIELD_FLAT_M} convex={false} />
        <FieldPanel
          x={184}
          title="kumerpeegel"
          widthM={FIELD_CONVEX_M}
          convex
        />
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Peegel on mõlemal pool täpselt sama suur ja müüja seisab mõlemal pool
        sama kaugel. Erineb ainult see, et parempoolne peegel on kumer.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// kr-ristmik – practice-3
// ---------------------------------------------------------------------------

const ROAD_VIEW = { width: 360, height: 250 };

/**
 * Ristmiku mõõtkava: 6 px/m ehk kaader on umbes 60 m lai.
 *
 * Teine mõõtkava kui sisujoonisel ja see on meelega: ristmik on kümneid
 * meetreid, poe vahekäik meetreid. Sama joonise SEES on mõõtkava mõlemal teljel
 * sama, muidu ei oleks lehviku nurk enam päris nurk.
 */
const ROAD_PX_PER_METRE = 6;

/**
 * Liikluspeegel on suurem kui poe oma: läbimõõt 80 cm, kera raadius 2 m.
 *
 * Simulatsiooni 30 cm peegel oleks ristmikul kasutu – ja just see ongi mõte:
 * mudel kehtib igal peeglil, muutuvad ainult arvud. Mõlemad arvud on joonisel
 * kirjas.
 */
const ROAD_MIRROR_RADIUS_M = 2;
const ROAD_MIRROR_APERTURE_M = 0.4;

/** Peegel posti otsas ristmiku vastasnurgas ja juht oma teel. */
const MIRROR_POINT = { x: 60, y: 8 };
const DRIVER_POINT = { x: 188, y: 140 };

/** Juhi kaugus peeglist tuleb JOONISE enda geomeetriast, mitte peast. */
const ROAD_EYE_DISTANCE_M =
  Math.hypot(
    DRIVER_POINT.x - MIRROR_POINT.x,
    DRIVER_POINT.y - MIRROR_POINT.y,
  ) / ROAD_PX_PER_METRE;

/** Vaatevälja täisnurk mudelist – joonis ei arvuta ühtegi nurka ise. */
const ROAD_VIEW_ANGLE_DEG = viewAngleDeg(
  ROAD_MIRROR_RADIUS_M,
  ROAD_MIRROR_APERTURE_M,
  ROAD_EYE_DISTANCE_M,
);

/**
 * Lehviku telje suund (kraadides, SVG-koordinaatides: y kasvab alla).
 *
 * See on PAIGUTUSE otsus, mitte füüsika: päris liikluspeegel on nurga all ja
 * peegli pööramine muudab, KUHU vaateväli osutab, mitte kui LAI ta on
 * (sisu/MOODUL-kumerpeegli-rakendused.md „Piirid"). Laiuse annab mudel.
 */
const ROAD_AXIS_DEG = 35;

const RADIANS_PER_DEGREE = Math.PI / 180;

/** Lehviku serva punkt: piisavalt kaugel, et ta jookseks kaadrist välja. */
function fanEdgePoint(angleDeg: number) {
  const rad = angleDeg * RADIANS_PER_DEGREE;
  return {
    x: MIRROR_POINT.x + Math.cos(rad) * 600,
    y: MIRROR_POINT.y + Math.sin(rad) * 600,
  };
}

const ROAD_FAN_EDGES = [
  fanEdgePoint(ROAD_AXIS_DEG - ROAD_VIEW_ANGLE_DEG / 2),
  fanEdgePoint(ROAD_AXIS_DEG + ROAD_VIEW_ANGLE_DEG / 2),
];

/** Autode rida ristuva tee peal. */
const CAR_Y = 58;
const CAR_LENGTH = 27;
const CAR_WIDTH = 12;

/**
 * Kus lehviku serv autode rea läbib – siit tulevad autode kohad.
 *
 * Serv peab autode reani ALLA jõudma. Kui keegi kunagi telge nii palju pöörab,
 * et üks serv jääb reaga paralleelseks või läheb temast ülespoole, ei ole
 * lõikepunkti olemas – siis viskab joonis vea, mitte ei paiguta autosid
 * lõpmatusse. Vaikselt vale koht oleks siin ülesande vale vastus.
 */
function fanEdgeXOnRoad(angleDeg: number): number {
  const rad = angleDeg * RADIANS_PER_DEGREE;
  const downwards = Math.sin(rad);
  if (downwards <= 0) {
    throw new RangeError(
      `Lehviku serv ${angleDeg}° ei jõua autode reani – vaata ROAD_AXIS_DEG üle`,
    );
  }
  return MIRROR_POINT.x + ((CAR_Y - MIRROR_POINT.y) / downwards) * Math.cos(rad);
}

/**
 * Lehviku lõik autode real: serv → serv.
 *
 * Järjekord tuleb suurusest, mitte sellest, kumb serv esimesena kirja sai –
 * telje pööramine (`ROAD_AXIS_DEG`) vahetaks nad muidu vaikselt ära.
 */
const [FAN_NEAR_X, FAN_FAR_X] = [
  fanEdgeXOnRoad(ROAD_AXIS_DEG - ROAD_VIEW_ANGLE_DEG / 2),
  fanEdgeXOnRoad(ROAD_AXIS_DEG + ROAD_VIEW_ANGLE_DEG / 2),
].sort((left, right) => left - right);

/**
 * Kolm autot: A ja B lehviku SEES, C temast väljas.
 *
 * Kohad on arvutatud lehviku servadest, mitte silma järgi valitud – see on
 * ülesande vastus ja ta ei tohi vaikselt valeks minna, kui mudeli nurk või
 * peegli mõõt kunagi muutub. C on servast tervelt auto pikkuse jagu väljas,
 * seega ei jää ta piiri peale ka siis, kui lehvik veidi laieneb.
 */
const CARS = [
  { id: "A", x: FAN_NEAR_X + (FAN_FAR_X - FAN_NEAR_X) * 0.2 },
  { id: "B", x: FAN_NEAR_X + (FAN_FAR_X - FAN_NEAR_X) * 0.7 },
  { id: "C", x: FAN_NEAR_X - CAR_LENGTH - 13 },
];

function Car({ x, label }: { x: number; label: string }) {
  return (
    <g>
      <rect
        x={x - CAR_LENGTH / 2}
        y={CAR_Y - CAR_WIDTH / 2}
        width={CAR_LENGTH}
        height={CAR_WIDTH}
        rx={3}
        className="fill-white stroke-ink"
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={CAR_Y + 4}
        textAnchor="middle"
        className="fill-ink"
        fontSize={10}
        fontWeight={700}
      >
        {label}
      </text>
    </g>
  );
}

/**
 * Ülesande joonis: mida juht ristmikupeeglis näeb.
 *
 * Lehviku LAIUS tuleb mudelist (`viewAngleDeg` juhi enda kaugusega, mis
 * omakorda tuleb joonise geomeetriast), tema SUUND on paigutuse otsus – päris
 * peegel on nurga all. Autod A ja B jäävad lehviku sisse, auto C mitte: see on
 * kogu ülesande vastus ja seepärast ei ole ükski neist kolmest silma järgi
 * paigutatud – nende kohad ARVUTATAKSE lehviku servadest, seega ei saa vastus
 * ja pilt lahku minna ka siis, kui mudeli nurk kunagi muutub.
 */
export function CrossroadsFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${ROAD_VIEW.width} ${ROAD_VIEW.height}`}
        role="img"
        aria-label={`Ristmik ülalt vaadatuna. Alt tuleb juhi tee ja ristub ülal horisontaalse teega. Juhist vasakul on maja, mis varjab tal vaate ristuvale teele. Ristuva tee taga vasakus nurgas on posti otsas ümar kumerpeegel; tema vaateväli on lai lehvik, mis katab ristuvast teest keskmise osa. Ristuval teel on kolm autot: auto A ja auto B jäävad lehviku sisse, auto C jääb lehvikust välja maja poolsesse otsa. Peegli vaatevälja nurk on ${formatNumber(ROAD_VIEW_ANGLE_DEG)} kraadi.`}
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Teed. */}
        <rect x={0} y={40} width={ROAD_VIEW.width} height={36} className="fill-line" />
        <rect x={170} y={76} width={36} height={ROAD_VIEW.height - 76} className="fill-line" />

        {/* Vaatevälja lehvik – laius mudelist, suund paigutusest. */}
        <polygon
          points={`${MIRROR_POINT.x},${MIRROR_POINT.y} ${ROAD_FAN_EDGES[0].x},${ROAD_FAN_EDGES[0].y} ${ROAD_FAN_EDGES[1].x},${ROAD_FAN_EDGES[1].y}`}
          className="fill-brand"
          fillOpacity={0.16}
        />
        <g className="stroke-brand" strokeWidth={1.5} strokeDasharray="6 4">
          {ROAD_FAN_EDGES.map((edge) => (
            <line
              key={`${edge.x}-${edge.y}`}
              x1={MIRROR_POINT.x}
              y1={MIRROR_POINT.y}
              x2={edge.x}
              y2={edge.y}
            />
          ))}
        </g>

        {/* Maja: tema pärast on peeglit üldse vaja. */}
        <rect
          x={0}
          y={78}
          width={145}
          height={112}
          rx={4}
          className="fill-ink-soft"
          opacity={0.35}
        />
        <text x={72} y={140} textAnchor="middle" className="fill-ink" fontSize={12}>
          maja
        </text>

        {/* Peegel posti otsas. */}
        <RoundMirror cx={MIRROR_POINT.x} cy={MIRROR_POINT.y + 4} r={9} />
        <text x={MIRROR_POINT.x + 16} y={MIRROR_POINT.y + 8} className="fill-ink" fontSize={10}>
          peegel {formatNumber(ROAD_MIRROR_APERTURE_M * 200)} cm · vaateväli{" "}
          {formatNumber(ROAD_VIEW_ANGLE_DEG)}°
        </text>

        {/* Autod ristuval teel. */}
        {CARS.map((car) => (
          <Car key={car.id} x={car.x} label={car.id} />
        ))}
        <text x={CARS[2].x} y={34} textAnchor="middle" className="fill-ink" fontSize={10}>
          lehvikust väljas
        </text>

        {/* Juht oma teel. */}
        <g>
          <rect
            x={DRIVER_POINT.x - CAR_WIDTH / 2}
            y={DRIVER_POINT.y - CAR_LENGTH / 2}
            width={CAR_WIDTH}
            height={CAR_LENGTH}
            rx={3}
            className="fill-white stroke-ink"
            strokeWidth={1.5}
          />
          <text
            x={DRIVER_POINT.x + 14}
            y={DRIVER_POINT.y + 4}
            className="fill-ink"
            fontSize={10}
          >
            sina
          </text>
        </g>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Maja varjab juhil vaate ristuvale teele. Peegli vaateväli on lai, aga ta
        ei ulatu lõputult – kuhu ta ei ulatu, sinna ei näe ka peegel.
      </figcaption>
    </figure>
  );
}
