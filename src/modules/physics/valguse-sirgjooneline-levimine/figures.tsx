/**
 * Mooduli joonised (src/engine/figures.ts).
 *
 * Nagu Simulation.tsx, on ka need VAATED: ühtki arvutust siin ei ole. Mudeli
 * importi siia ei tule – kumbki joonis ei näita ühtki ARVU, ainult olukorda,
 * millest jutt käib. Nii ei saa joonis mudeliga vastuollu minna: tal ei ole
 * midagi väita.
 *
 * **Joonis ei tohi vastust ette öelda.** Hook küsib, MIKS on laigud
 * ümmargused, kuigi lehtede vahed on sakilised – seepärast näitab joonis
 * mõlemat kuju kõrvuti, aga kiiri, auku ega Päikese kujutist ta ei joonista.
 * Selgituse saab õpilane alles simulatsioonist ja harjutusest practice-2.
 */

import type { ReactNode } from "react";

/** Hooki vaade, ühed mõõdud. */
const VIEW = { width: 320, height: 220 };

/** Maapind – laigud on selle all, puu tema peal. */
const GROUND_Y = 170;

/** Päikesevalguse ja laikude värv – üks kokkulepe kogu joonisel. */
const SUNLIT = "fill-teacher";

/** Laigud maapinnal: sama ellips viies kohas, natuke eri suurusega. */
const SPOTS = [
  { cx: 38, rx: 9 },
  { cx: 64, rx: 11 },
  { cx: 93, rx: 8 },
  { cx: 120, rx: 12 },
  { cx: 148, rx: 9 },
];

/**
 * Lehtede vahe suurenduses: sakiline, ilmselgelt mitte ümmargune. Punktid on
 * käsitsi valitud nii, et ükski nurk ei jääks ümaraks – just see vastandub
 * maapinnal olevatele laikudele.
 */
const LEAF_GAP =
  "216,72 238,56 246,74 266,60 262,88 286,102 254,110 242,130 232,102 206,94";

export function SunSpotsUnderTreeFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        aria-label="Joonis: päikesepaisteline päev. Vasakul kasvab lehtedega puu, mille all on maapinnal viis ümmargust heledat laiku. Paremal on suurendus ühest lehtede vahest – see on sakiline ja teravate nurkadega, mitte ümmargune."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Päike ülal vasakul: valgus tuleb ülevalt. */}
        <circle cx={26} cy={26} r={11} className={SUNLIT} />
        <g className="stroke-teacher" strokeWidth={2} strokeLinecap="round">
          <line x1={26} y1={6} x2={26} y2={12} />
          <line x1={46} y1={26} x2={40} y2={26} />
          <line x1={41} y1={11} x2={37} y2={15} />
          <line x1={41} y1={41} x2={37} y2={37} />
        </g>

        {/* Maapind. */}
        <rect
          x={0}
          y={GROUND_Y}
          width={VIEW.width}
          height={VIEW.height - GROUND_Y}
          className="fill-line"
        />

        {/* Puu: tüvi ja lehtedest võra. */}
        <rect x={74} y={112} width={12} height={GROUND_Y - 112} className="fill-ink-soft" />
        <g className="fill-brand">
          <circle cx={80} cy={80} r={36} />
          <circle cx={48} cy={98} r={24} />
          <circle cx={112} cy={96} r={24} />
          <circle cx={80} cy={50} r={22} />
        </g>

        {/* Laigud maas – ümmargused, kuigi vahed on sakilised. */}
        <g className={SUNLIT}>
          {SPOTS.map((spot) => (
            <ellipse key={spot.cx} cx={spot.cx} cy={188} rx={spot.rx} ry={4} />
          ))}
        </g>
        <text x={93} y={210} textAnchor="middle" className="fill-ink-soft" fontSize={13}>
          laigud maas
        </text>

        {/* Viit võrast suurendusse. */}
        <line
          x1={130}
          y1={84}
          x2={188}
          y2={90}
          className="stroke-ink-soft"
          strokeWidth={2}
          strokeDasharray="4 4"
        />

        {/* Suurendus: tume lehemass, mille sees on üks sakiline vahe. */}
        <text x={248} y={32} textAnchor="middle" className="fill-ink-soft" fontSize={13}>
          lehtede vahe
        </text>
        <rect
          x={190}
          y={40}
          width={116}
          height={104}
          rx={10}
          className="fill-ink-soft stroke-line"
          strokeWidth={2}
        />
        <polygon points={LEAF_GAP} className={SUNLIT} />
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Päikesepaisteline päev: lehtede vahed on sakilised, laigud maas
        ümmargused.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// oo-vihutuubid – teooria (theory-1)
// ---------------------------------------------------------------------------

/**
 * Kolm vihutüüpi kõrvuti (eeskuju: `helkur/figures.tsx` → `ThreeSurfacesFigure`).
 *
 * Teooriatekst loetleb hajuva, paralleelse ja koonduva vihu ühe lausega. Sõnad
 * „laienev" ja „koonduv" on siin kuju, mitte omadus – ja kuju on joonisel
 * hetkega näha. Mõiste kordub hiljem nõgus- ja kumerpeegli juures, seega tasub
 * ta siin ühe korra korralikult paika panna.
 *
 * Kõigil kolmel paneelil on SAMA kolm kiirt ja sama laius – ainus vahe on
 * suund. Nii ei jää muljet, et hajuvas vihus on rohkem valgust.
 *
 * VÄRV EI OLE AINUS INFO KANDJA (DISAINIJUHIS): igal paneelil on pealkiri ja
 * allkiri sõnadega, kiired ise on kõik ühte värvi.
 */

const BEAM_VIEW = { width: 360, height: 216 };
/** Allkirja reavahe – kaks rida peavad vaatesse ära mahtuma. */
const CAPTION_LINE_PX = 15;
const BEAM_PANEL = { width: 108, gap: 14, top: 34, height: 132 };
/** Kiirte kimp: kolm kiirt, keskmine rõhtne, ääred sümmeetriliselt. */
const BEAM_SPREAD_PX = 34;
/** Nooleots – üks id, sest korraga on ekraanil üks joonis. */
const BEAM_ARROW = "oo-arrow-beam";

function beamPanelLeft(index: number): number {
  const total = 3 * BEAM_PANEL.width + 2 * BEAM_PANEL.gap;
  return (
    (BEAM_VIEW.width - total) / 2 + index * (BEAM_PANEL.width + BEAM_PANEL.gap)
  );
}

/** Kiir noolega: kolm punkti, et `marker-mid` saaks keskele kinnituda. */
function beamRay(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  return `M ${from.x} ${from.y} L ${mid.x} ${mid.y} L ${to.x} ${to.y}`;
}

/** Paneeli raam, pealkiri ja allkiri – kolm ühesugust kasti kõrvuti. */
function BeamPanel({
  index,
  title,
  caption,
  rays,
  children,
}: {
  index: number;
  title: string;
  /** Allkiri REA KAUPA: 108 px laiusesse paneeli mahub ~13 tähemärki reale. */
  caption: string[];
  rays: { from: { x: number; y: number }; to: { x: number; y: number } }[];
  children?: ReactNode;
}) {
  const left = beamPanelLeft(index);
  const centre = left + BEAM_PANEL.width / 2;
  return (
    <g>
      <rect
        x={left}
        y={BEAM_PANEL.top}
        width={BEAM_PANEL.width}
        height={BEAM_PANEL.height}
        rx={10}
        className="fill-white stroke-line"
        strokeWidth={1.5}
      />
      <text
        x={centre}
        y={BEAM_PANEL.top - 12}
        textAnchor="middle"
        className="fill-ink"
        fontSize={13}
        fontWeight={600}
      >
        {title}
      </text>
      <g
        className="fill-none stroke-brand"
        strokeWidth={2.5}
        strokeLinecap="round"
      >
        {rays.map((ray) => (
          <path
            key={`${ray.from.y}-${ray.to.y}`}
            d={beamRay(ray.from, ray.to)}
            markerMid={`url(#${BEAM_ARROW})`}
          />
        ))}
      </g>
      {children}
      {caption.map((line, row) => (
        <text
          key={line}
          x={centre}
          y={BEAM_PANEL.top + BEAM_PANEL.height + 18 + row * CAPTION_LINE_PX}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={12}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

export function ThreeBeamTypesFigure() {
  /** Kiirte kõrgus paneeli sees: keskjoon ja selle ümber sümmeetriline kimp. */
  const midY = BEAM_PANEL.top + BEAM_PANEL.height / 2;
  /** Kiired algavad ja lõpevad paneeli servast tublisti seespool. */
  const startX = (index: number) => beamPanelLeft(index) + 14;
  const endX = (index: number) => beamPanelLeft(index) + BEAM_PANEL.width - 14;

  // Hajuv: kõik kolm kiirt algavad ÜHEST punktist ja lähevad laiali.
  const diverging = [-BEAM_SPREAD_PX, 0, BEAM_SPREAD_PX].map((offset) => ({
    from: { x: startX(0), y: midY },
    to: { x: endX(0), y: midY + offset },
  }));

  // Paralleelne: sama kimbu laius mõlemas otsas, kiired ei kohtu kunagi.
  const parallel = [-BEAM_SPREAD_PX, 0, BEAM_SPREAD_PX].map((offset) => ({
    from: { x: startX(1), y: midY + offset },
    to: { x: endX(1), y: midY + offset },
  }));

  // Koonduv: hajuva peegelpilt – lai algus, üks lõpp-punkt.
  const converging = [-BEAM_SPREAD_PX, 0, BEAM_SPREAD_PX].map((offset) => ({
    from: { x: startX(2), y: midY + offset },
    to: { x: endX(2), y: midY },
  }));

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${BEAM_VIEW.width} ${BEAM_VIEW.height}`}
        role="img"
        aria-label="Joonis: kolm skeemi kõrvuti, igal kolm valguskiirt, mis levivad vasakult paremale. Vasakul hajuv vihk – kõik kiired algavad ühest punktist ja lähevad laiali. Keskel paralleelne vihk – kiired on kogu tee üksteisega kõrvuti ja ühekaugusel. Paremal koonduv vihk – laiali alanud kiired kogunevad ühte punkti."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <defs>
          {/* `fill` on markeril otse küljes: marker EI päri värvi teda
              kasutavalt jooneLT – tal peab olema oma klass. */}
          <marker
            id={BEAM_ARROW}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-brand" />
          </marker>
        </defs>

        <BeamPanel
          index={0}
          title="hajuv"
          caption={["punktallikast", "laiali"]}
          rays={diverging}
        >
          {/* Allikas: punkt, millest kõik kiired lähtuvad. */}
          <circle cx={startX(0)} cy={midY} r={5} className="fill-teacher stroke-ink" strokeWidth={1.5} />
          <text
            x={startX(0)}
            y={BEAM_PANEL.top + BEAM_PANEL.height - 10}
            textAnchor="start"
            className="fill-ink-soft"
            fontSize={11}
          >
            lamp
          </text>
        </BeamPanel>

        <BeamPanel
          index={1}
          title="paralleelne"
          caption={["väga kaugelt,", "nt Päikeselt"]}
          rays={parallel}
        />

        <BeamPanel
          index={2}
          title="koonduv"
          caption={["kokku ühte", "punkti"]}
          rays={converging}
        >
          {/* Kohtumispunkt: sinna, kus kõik kolm kiirt lõikuvad. */}
          <circle cx={endX(2)} cy={midY} r={4} className="fill-ink" />
        </BeamPanel>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Kolm vihutüüpi. Valgust on kõigis kolmes ühepalju – vahe on ainult
        selles, kas kiired lähevad laiali, jäävad kõrvuti või kogunevad kokku.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// oo-vihk-vs-kiir – teooria (theory-1)
// ---------------------------------------------------------------------------

/**
 * Vihk vs kiir kõrvuti: vasakul päris valgusjuga (koonusena laienev udu
 * sees), paremal sama asi mudelina – üks nooleline joon.
 *
 * Tekst ütleb „päris elus ühte üksikut kiirt ei ole, ta on meie abijoon" –
 * see on täpselt see mudeli-ja-tegelikkuse vahe, mis hiljem väljumispiletil
 * (exit-1 „kiir on abijoon, mitte asi") uuesti küsitakse. Vasak paneel
 * näitab udust valgusjuga (palju hägusaid kihte), parem paneel üht selget
 * noolt – kontrast peab olema silmaga hetkega loetav, mitte ainult
 * pealkirjast.
 */

const RAY_VIEW = { width: 320, height: 190 };
const RAY_PANEL = { width: 130, gap: 30, top: 30, height: 110 };

function rayPanelLeft(index: number): number {
  const total = 2 * RAY_PANEL.width + RAY_PANEL.gap;
  return (RAY_VIEW.width - total) / 2 + index * (RAY_PANEL.width + RAY_PANEL.gap);
}

export function RayVsBeamFigure() {
  const left0 = rayPanelLeft(0);
  const left1 = rayPanelLeft(1);
  const midY = RAY_PANEL.top + RAY_PANEL.height / 2;
  const rayArrowId = "oo-arrow-ray";

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${RAY_VIEW.width} ${RAY_VIEW.height}`}
        role="img"
        aria-label="Joonis: kaks paneeli kõrvuti. Vasakul on päris valgusjuga – taskulambist laieneb koonusena udune valgusvihk. Paremal on sama asi mudelina: üks sirge joon noolega, mis näitab ainult levimise sihti."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <defs>
          <marker
            id={rayArrowId}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-brand" />
          </marker>
        </defs>

        {/* Vasak paneel: päris vihk, udune koonus mitmest kihist. */}
        <rect
          x={left0}
          y={RAY_PANEL.top}
          width={RAY_PANEL.width}
          height={RAY_PANEL.height}
          rx={10}
          className="fill-white stroke-line"
          strokeWidth={1.5}
        />
        <g className="fill-teacher opacity-30">
          <polygon
            points={`${left0 + 14},${midY} ${left0 + RAY_PANEL.width - 10},${midY - 34} ${left0 + RAY_PANEL.width - 10},${midY + 34}`}
          />
        </g>
        <g className="fill-teacher opacity-50">
          <polygon
            points={`${left0 + 14},${midY} ${left0 + RAY_PANEL.width - 10},${midY - 20} ${left0 + RAY_PANEL.width - 10},${midY + 20}`}
          />
        </g>
        <g className="fill-teacher">
          <polygon
            points={`${left0 + 14},${midY} ${left0 + RAY_PANEL.width - 10},${midY - 8} ${left0 + RAY_PANEL.width - 10},${midY + 8}`}
          />
        </g>
        <circle cx={left0 + 14} cy={midY} r={5} className="fill-ink" />
        <text
          x={left0 + RAY_PANEL.width / 2}
          y={RAY_PANEL.top - 10}
          textAnchor="middle"
          className="fill-ink"
          fontSize={13}
          fontWeight={600}
        >
          vihk
        </text>
        <text
          x={left0 + RAY_PANEL.width / 2}
          y={RAY_PANEL.top + RAY_PANEL.height + 18}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={12}
        >
          päris valgusjuga
        </text>

        {/* Parem paneel: mudel, üks selge nooleline joon. */}
        <rect
          x={left1}
          y={RAY_PANEL.top}
          width={RAY_PANEL.width}
          height={RAY_PANEL.height}
          rx={10}
          className="fill-white stroke-line"
          strokeWidth={1.5}
        />
        <path
          d={`M ${left1 + 14} ${midY} L ${left1 + RAY_PANEL.width / 2} ${midY} L ${left1 + RAY_PANEL.width - 14} ${midY}`}
          className="fill-none stroke-brand"
          strokeWidth={2.5}
          strokeLinecap="round"
          markerMid={`url(#${rayArrowId})`}
        />
        <circle cx={left1 + 14} cy={midY} r={4} className="fill-ink" />
        <text
          x={left1 + RAY_PANEL.width / 2}
          y={RAY_PANEL.top - 10}
          textAnchor="middle"
          className="fill-ink"
          fontSize={13}
          fontWeight={600}
        >
          kiir
        </text>
        <text
          x={left1 + RAY_PANEL.width / 2}
          y={RAY_PANEL.top + RAY_PANEL.height + 18}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={12}
        >
          mudel: üks joon
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Valgusvihk on päris valgusjuga. Valguskiir on selle mudel – üks joon,
        mis näitab ainult levimise sihti. Päris elus ühte üksikut kiirt ei
        ole.
      </figcaption>
    </figure>
  );
}

/**
 * Theory-1 juurde: kaks joonist üksteise all, sest tekst kannab korraga kahte
 * abstraktset ideed (mudel vs tegelikkus, kolm vihutüüpi) ja moodul jääb
 * väikeseks (3–6 sammu, sisu/MALL-moodul.md) – teist theory-sammu ei lisata.
 */
export function RayAndBeamTypesFigure() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <RayVsBeamFigure />
      <ThreeBeamTypesFigure />
    </div>
  );
}
