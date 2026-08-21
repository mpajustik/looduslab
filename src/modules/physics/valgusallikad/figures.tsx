/**
 * Mooduli joonised (src/engine/figures.ts).
 *
 * Nagu Simulation.tsx, on ka need VAATED: ühtki arvutust siin ei ole. Öise
 * tänava joonis ei impordi `model.ts`-i – ta ei näita ühtki ARVU, ainult
 * olukorda, mille kohta hook küsib. Teooriajoonis (`SourceKindsFigure`)
 * IMPORDIB ainult konstandi `POINT_SOURCE_MIN_RATIO`, mitte funktsiooni: piir
 * on tekst joonisel, mitte arvutatud tulemus – nii jääb ka siin kehtima, et
 * ühtki otsust ei tee joonis ise.
 *
 * **Joonis ei tohi vastust ette öelda.** Hook küsib, millised kehad annavad ise
 * valgust ja millised ainult peegeldavad – seepärast on kõik viis keha ühtviisi
 * heledad ja sildid ütlevad ainult, MIS keha see on („Kuu", „helkur"), mitte
 * mida ta valgusega teeb.
 */

import type { ReactNode } from "react";
import { POINT_SOURCE_MIN_RATIO } from "./model";

/** Üks vaade, ühed mõõdud. */
const VIEW = { width: 320, height: 200 };

/** Maapind – kõik kehad seisavad sellel joonel. */
const GROUND_Y = 168;

/** Valgusvihu ja heleduse läbipaistmatus – hele laik, mitte kollane plekk. */
const GLOW_OPACITY = 0.28;

/** Öötaeva tumedus: tekst peab jääma loetavaks ka projektorilt. */
const SKY_OPACITY = 0.92;

/** Öösel heledana paistva pinna värv – üks kokkulepe kogu joonisel. */
const LIT = "fill-teacher";

export function NightStreetFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        aria-label="Joonis: öine tänav. Vasakul põleb tänavalamp, mille valgusvihk langeb teele. Keskel sõidab auto põlevate esituledega. Paremal on maja, milles on kolm valgustatud akent. Taevas kõrgub Kuu. Tee ääres seisab liiklusmärgi post, mille küljes on väike helkur. Kõik need paistavad pimedas heledana."
        className="w-full rounded-2xl border border-line"
      >
        {/* Öötaevas – kogu joonise taust. */}
        <rect
          x={0}
          y={0}
          width={VIEW.width}
          height={VIEW.height}
          className="fill-ink"
          fillOpacity={SKY_OPACITY}
        />

        {/* Kuu koos oma helendusega. */}
        <circle cx={266} cy={36} r={20} className={LIT} fillOpacity={GLOW_OPACITY} />
        <circle cx={266} cy={36} r={12} className={LIT} />
        <text x={266} y={70} textAnchor="middle" className="fill-line" fontSize={12}>
          Kuu
        </text>

        {/* Maapind. */}
        <line
          x1={0}
          y1={GROUND_Y}
          x2={VIEW.width}
          y2={GROUND_Y}
          className="stroke-line"
          strokeWidth={2}
        />

        {/* Tänavalamp: post, valgusti ja allapoole langev valgusvihk. */}
        <rect x={30} y={62} width={4} height={GROUND_Y - 62} className="fill-line" />
        <rect x={22} y={56} width={20} height={8} rx={3} className="fill-line" />
        <polygon
          points={`24,64 40,64 62,${GROUND_Y} 2,${GROUND_Y}`}
          className={LIT}
          fillOpacity={GLOW_OPACITY}
        />
        <ellipse cx={32} cy={64} rx={9} ry={5} className={LIT} />
        <text x={32} y={188} textAnchor="middle" className="fill-line" fontSize={12}>
          tänavalamp
        </text>

        {/* Auto: kere, rattad ja kaks esitulede vihku. */}
        <polygon
          points={`128,${GROUND_Y - 14} 136,${GROUND_Y - 26} 158,${GROUND_Y - 26} 164,${GROUND_Y - 14}`}
          className="fill-ink-soft"
        />
        <rect
          x={112}
          y={GROUND_Y - 14}
          width={56}
          height={12}
          rx={4}
          className="fill-ink-soft"
        />
        <circle cx={124} cy={GROUND_Y} r={5} className="fill-line" />
        <circle cx={158} cy={GROUND_Y} r={5} className="fill-line" />
        <polygon
          points={`112,${GROUND_Y - 10} 78,${GROUND_Y - 18} 78,${GROUND_Y - 2}`}
          className={LIT}
          fillOpacity={GLOW_OPACITY}
        />
        <circle cx={113} cy={GROUND_Y - 9} r={3.5} className={LIT} />
        <text x={140} y={188} textAnchor="middle" className="fill-line" fontSize={12}>
          auto tuled
        </text>

        {/* Maja kolme valgustatud aknaga. */}
        <rect
          x={216}
          y={98}
          width={74}
          height={GROUND_Y - 98}
          className="fill-ink-soft"
        />
        <rect x={228} y={112} width={16} height={16} className={LIT} />
        <rect x={256} y={112} width={16} height={16} className={LIT} />
        <rect x={228} y={140} width={16} height={16} className={LIT} />
        <text x={253} y={188} textAnchor="middle" className="fill-line" fontSize={12}>
          aknad
        </text>

        {/* Liiklusmärgi post helkuriga – väike, aga selgelt hele. */}
        <rect x={191} y={124} width={3} height={GROUND_Y - 124} className="fill-line" />
        <circle
          cx={192.5}
          cy={120}
          r={9}
          className="fill-ink-soft stroke-line"
          strokeWidth={2}
        />
        <circle cx={192.5} cy={148} r={5} className={LIT} fillOpacity={GLOW_OPACITY} />
        <circle cx={192.5} cy={148} r={3} className={LIT} />
        <text x={192} y={188} textAnchor="middle" className="fill-line" fontSize={12}>
          helkur
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Öine tänav: tänavalamp, auto tuled, valgustatud aknad, Kuu ja
        liiklusmärgi helkur paistavad kõik heledana.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// va-liigid – teooria (theory-1)
// ---------------------------------------------------------------------------

/** Soojade allikate värv (hõõguv) – amber, sama toon mis õpetaja-alal. */
const WARM = "fill-teacher";
/** Külmade allikate värv – sinine, sama toon mis muu info tekstis. */
const COLD = "fill-info";

type GridIcon = { label: string; render: (cx: number, cy: number) => ReactNode };

/** Kiired ringikujulise allika ümber – Päike ja tuli näevad välja hõõguvad. */
function SunburstRays({ cx, cy, r, count, className }: {
  cx: number;
  cy: number;
  r: number;
  count: number;
  className: string;
}) {
  return (
    <g className={className} strokeWidth={2} strokeLinecap="round">
      {Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * 2 * Math.PI;
        const inner = r + 2;
        const outer = r + 8;
        return (
          <line
            key={index}
            x1={cx + Math.cos(angle) * inner}
            y1={cy + Math.sin(angle) * inner}
            x2={cx + Math.cos(angle) * outer}
            y2={cy + Math.sin(angle) * outer}
          />
        );
      })}
    </g>
  );
}

const WARM_ICONS: GridIcon[] = [
  {
    label: "Päike",
    render: (cx, cy) => (
      <g>
        <SunburstRays cx={cx} cy={cy} r={11} count={8} className={`stroke-teacher`} />
        <circle cx={cx} cy={cy} r={11} className={WARM} />
      </g>
    ),
  },
  {
    label: "küünal",
    render: (cx, cy) => (
      <g>
        <rect x={cx - 3} y={cy + 6} width={6} height={12} className="fill-ink-soft" />
        <path
          d={`M ${cx} ${cy - 14} C ${cx + 8} ${cy - 4}, ${cx + 6} ${cy + 4}, ${cx} ${cy + 6} C ${cx - 6} ${cy + 4}, ${cx - 8} ${cy - 4}, ${cx} ${cy - 14} z`}
          className={WARM}
        />
      </g>
    ),
  },
  {
    label: "hõõglamp",
    render: (cx, cy) => (
      <g>
        <circle
          cx={cx}
          cy={cy - 2}
          r={11}
          className={`${WARM} stroke-teacher`}
          fillOpacity={0.35}
          strokeWidth={1.5}
        />
        <path
          d={`M ${cx - 5} ${cy - 6} L ${cx - 2} ${cy + 2} L ${cx + 2} ${cy - 6} L ${cx + 5} ${cy + 2}`}
          className="fill-none stroke-teacher"
          strokeWidth={1.5}
        />
        <rect x={cx - 4} y={cy + 9} width={8} height={5} rx={1} className="fill-ink-soft" />
      </g>
    ),
  },
  {
    label: "lõke",
    render: (cx, cy) => (
      <g>
        <path
          d={`M ${cx} ${cy + 12} C ${cx + 11} ${cy + 6}, ${cx + 7} ${cy - 6}, ${cx} ${cy - 16} C ${cx - 7} ${cy - 6}, ${cx - 11} ${cy + 6}, ${cx} ${cy + 12} z`}
          className={WARM}
        />
        <path
          d={`M ${cx} ${cy + 8} C ${cx + 5} ${cy + 4}, ${cx + 3} ${cy - 3}, ${cx} ${cy - 9} C ${cx - 3} ${cy - 3}, ${cx - 5} ${cy + 4}, ${cx} ${cy + 8} z`}
          className="fill-white"
          fillOpacity={0.6}
        />
      </g>
    ),
  },
];

const COLD_ICONS: GridIcon[] = [
  {
    label: "LED",
    render: (cx, cy) => (
      <g>
        <SunburstRays cx={cx} cy={cy} r={5} count={4} className="stroke-info" />
        <rect x={cx - 5} y={cy - 5} width={10} height={10} rx={2} className={COLD} />
      </g>
    ),
  },
  {
    label: "päevavalguslamp",
    render: (cx, cy) => (
      <rect
        x={cx - 16}
        y={cy - 4}
        width={32}
        height={8}
        rx={4}
        className={`${COLD} stroke-info`}
        strokeWidth={1.5}
      />
    ),
  },
  {
    label: "ekraan",
    render: (cx, cy) => (
      <g>
        <rect
          x={cx - 13}
          y={cy - 10}
          width={26}
          height={18}
          rx={2}
          className="fill-ink-soft stroke-line"
          strokeWidth={1.5}
        />
        <rect x={cx - 9} y={cy - 6} width={18} height={10} className={COLD} />
      </g>
    ),
  },
  {
    label: "jaaniuss",
    render: (cx, cy) => (
      <g>
        <ellipse cx={cx - 1} cy={cy} rx={10} ry={5} className="fill-ink-soft" />
        <circle cx={cx + 8} cy={cy} r={4} className={COLD} />
      </g>
    ),
  },
];

const GRID_VIEW = { width: 360, height: 232 };
const GRID_COL_XS = [58, 148, 238, 328];
const WARM_ROW = { label: 26, icon: 66, caption: 92 };
const COLD_ROW = { label: 132, icon: 172, caption: 198 };

/** Iga sildi jaoks sobiva reavahega tekst – pikad sõnad murtakse kahele reale. */
function IconCaption({ x, y, text }: { x: number; y: number; text: string }) {
  const words = text.split("-");
  if (words.length === 1 && text.length <= 10) {
    return (
      <text x={x} y={y} textAnchor="middle" className="fill-ink-soft" fontSize={10.5}>
        {text}
      </text>
    );
  }
  return (
    <text x={x} y={y} textAnchor="middle" className="fill-ink-soft" fontSize={10.5}>
      <tspan x={x} dy={0}>
        {words[0]}
      </tspan>
      {words[1] && (
        <tspan x={x} dy={12}>
          {words[1]}
        </tspan>
      )}
    </text>
  );
}

/**
 * Liigitusskeem: 2×4 ikooniruudustik, soojuslikud allikad üleval, külmad all.
 *
 * Kaheksa näidet on tekstis juba olemas – siin on nad korraga silme ees, kaks
 * puhtalt eristatavat rida. Värv EI ole ainus vahe (disainijuhis): read on
 * eraldi ka asukoha ja pealdise poolt.
 */
export function SourceClassificationFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${GRID_VIEW.width} ${GRID_VIEW.height}`}
        role="img"
        aria-label="Joonis: kaheksa valgusallikat kahes reas. Ülemine rida, sildiga soojuslikud allikad: Päike, küünal, hõõglamp ja lõke. Alumine rida, sildiga külmad allikad: LED, päevavalguslamp, ekraan ja jaaniuss."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <text
          x={12}
          y={WARM_ROW.label}
          className="fill-teacher"
          fontSize={12}
          fontWeight={600}
        >
          soojuslikud allikad (üle ~600 °C)
        </text>
        {WARM_ICONS.map((icon, index) => (
          <g key={icon.label}>
            {icon.render(GRID_COL_XS[index], WARM_ROW.icon)}
            <IconCaption x={GRID_COL_XS[index]} y={WARM_ROW.caption} text={icon.label} />
          </g>
        ))}

        <line
          x1={8}
          y1={112}
          x2={GRID_VIEW.width - 8}
          y2={112}
          className="stroke-line"
          strokeWidth={1}
        />

        <text
          x={12}
          y={COLD_ROW.label}
          className="fill-info"
          fontSize={12}
          fontWeight={600}
        >
          külmad allikad
        </text>
        {COLD_ICONS.map((icon, index) => (
          <g key={icon.label}>
            {icon.render(GRID_COL_XS[index], COLD_ROW.icon)}
            <IconCaption x={GRID_COL_XS[index]} y={COLD_ROW.caption} text={icon.label} />
          </g>
        ))}
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Soojuslikud allikad hõõguvad kuumusest. Külmad allikad kiirgavad
        valgust ilma selleta – „külm" räägib SIIN tekkeviisist, mitte sellest,
        kui tuhm valgus on.
      </figcaption>
    </figure>
  );
}

// Laius on 376, mitte 360: 8px vasak marginaal + kaks 172px paneeli + 16px
// vahe + 8px parem marginaal = 376. 360-ga oleks parema paneeli serv SVG
// viewBox'ist väljas ja vaikimisi lõigatud (CodeRabbiti leid 2026-08-22).
const PAIR_VIEW = { width: 376, height: 168 };
const PANEL_WIDTH = 172;
const PANEL_GAP = 16;
const EYE_Y = 92;

/** Silm: ellips + pupill, samas kohas mõlemal paneelil. */
function Eye({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <ellipse
        cx={x}
        cy={y}
        rx={13}
        ry={8}
        className="fill-white stroke-ink"
        strokeWidth={1.5}
      />
      <circle cx={x} cy={y} r={4} className="fill-ink" />
    </g>
  );
}

/**
 * Üks paneel: silm vasakul, lamp paremal, vaatenurga kiil nende vahel.
 *
 * `lampHalfHeight` ongi kogu joonise mõte: sama lamp paistab kaugelt kitsa
 * kiiluna (peaaegu punkt) ja lähedalt laia kiiluna (selgelt laiendatud). Kumbki
 * arv ei tule mudelist – see on skeem, mitte mõõtejoonis, ja mudel ise ei
 * väida siin midagi (vt faili päis).
 */
function SourceAnglePanel({
  left,
  lampX,
  lampHalfHeight,
  kind,
  ratioLabel,
}: {
  left: number;
  lampX: number;
  lampHalfHeight: number;
  kind: "punktallikas" | "laiendatud allikas";
  ratioLabel: string;
}) {
  const eyeX = left + 26;
  const lampTop = { x: left + lampX, y: EYE_Y - lampHalfHeight };
  const lampBottom = { x: left + lampX, y: EYE_Y + lampHalfHeight };

  return (
    <g>
      <rect
        x={left}
        y={8}
        width={PANEL_WIDTH}
        height={PAIR_VIEW.height - 16}
        rx={10}
        className="fill-white stroke-line"
        strokeWidth={1.5}
      />
      <path
        d={`M ${eyeX} ${EYE_Y} L ${lampTop.x} ${lampTop.y} L ${lampBottom.x} ${lampBottom.y} z`}
        className="fill-brand-soft"
      />
      <Eye x={eyeX} y={EYE_Y} />

      {/* Lamp: pirn ja alus, samas kujus mõlemal paneelil, ainult mõõt erineb. */}
      <ellipse
        cx={left + lampX}
        cy={EYE_Y}
        rx={Math.max(6, lampHalfHeight * 0.6)}
        ry={lampHalfHeight}
        className="fill-teacher"
        fillOpacity={0.85}
      />
      <SunburstRays
        cx={left + lampX}
        cy={EYE_Y}
        r={lampHalfHeight}
        count={6}
        className="stroke-teacher"
      />

      <text
        x={left + PANEL_WIDTH / 2}
        y={28}
        textAnchor="middle"
        className="fill-ink"
        fontSize={12}
        fontWeight={600}
      >
        {kind === "punktallikas" ? "kaugelt" : "lähedalt"}
      </text>
      <text
        x={left + PANEL_WIDTH / 2}
        y={PAIR_VIEW.height - 20}
        textAnchor="middle"
        className="fill-ink-soft"
        fontSize={11}
      >
        {ratioLabel}
      </text>
      <text
        x={left + PANEL_WIDTH / 2}
        y={PAIR_VIEW.height - 8}
        textAnchor="middle"
        className="fill-ink"
        fontSize={11}
        fontWeight={600}
      >
        {kind}
      </text>
    </g>
  );
}

/**
 * Sama lamp kaugelt ja lähedalt: vaatenurga kiil kitseneb kaugusega.
 *
 * See on ploki kõige abstraktsem mõte – liik ei ole lambi omadus, vaid lambi
 * JA kauguse suhte omadus –, seepärast on mõlemal paneelil täpselt sama lamp,
 * ainult vaatenurk erineb.
 */
export function PointVsExtendedFigure() {
  const leftPanel = 8;
  const rightPanel = leftPanel + PANEL_WIDTH + PANEL_GAP;

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${PAIR_VIEW.width} ${PAIR_VIEW.height}`}
        role="img"
        aria-label="Joonis: kaks paneeli kõrvuti, kummalgi silm vasakul ja lamp paremal. Vasakul paneelil, sildiga kaugelt, on vaatenurk lambi kahe serva vahel kitsas – lamp on punktallikas. Paremal paneelil, sildiga lähedalt, on sama lamp suuremana joonistatud ja vaatenurk lai – lamp on laiendatud allikas."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <SourceAnglePanel
          left={leftPanel}
          lampX={134}
          lampHalfHeight={7}
          kind="punktallikas"
          ratioLabel={`kaugus ÷ mõõde ≥ ${POINT_SOURCE_MIN_RATIO}`}
        />
        <SourceAnglePanel
          left={rightPanel}
          lampX={96}
          lampHalfHeight={34}
          kind="laiendatud allikas"
          ratioLabel={`kaugus ÷ mõõde < ${POINT_SOURCE_MIN_RATIO}`}
        />
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Täpselt sama lamp: kaugelt paistab ta silmale nagu punkt, lähedalt
        selgelt laiendatuna. Liik sõltub vaatluskohast, mitte lambist endast.
      </figcaption>
    </figure>
  );
}

/**
 * Theory-1 juurde: kaks joonist üksteise all, sest tekst kannab korraga kahte
 * eraldi ideed (liigitus spektri järgi, liigitus suuruse järgi) ja moodul
 * jääb väikeseks – teist theory-sammu ei lisata (sama muster mis
 * `valguse-sirgjooneline-levimine/RayAndBeamTypesFigure`).
 */
export function SourceKindsFigure() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <SourceClassificationFigure />
      <PointVsExtendedFigure />
    </div>
  );
}
