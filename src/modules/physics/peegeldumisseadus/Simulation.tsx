import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "../../../ui/Button";
import {
  incidentDirection,
  reflectedDirection,
  reflectionAngle,
  type Vector2,
} from "./model";

/**
 * Peegeldumise simulatsioon – ainult VAADE (sisu/MOODUL-peegeldumisseadus.md,
 * samm „explore"; docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Siin ei ole ühtegi `Math.sin`-i ega nurgaarvutust: kõik suunad ja
 * peegeldumisnurga tulevad `model.ts`-ist (CLAUDE.md reegel 1). Selles failis
 * on ainult PAIGUTUS – SVG y-telje pööramine, kaarte raadiused ja sildid.
 *
 * Ülesanded, mattpinna lüliti ja lisavaade „nurk pinna suhtes" tulevad
 * sammus 1.9; siin saab kiirt ainult liigutada.
 */

/** Liuguri piirid. 85°, mitte 90° – vt model.ts päis (piirjuht näeks katki). */
const MIN_ANGLE_DEG = 0;
const MAX_ANGLE_DEG = 85;
/** Nurk, millega joonis avaneb ja mille juurde „Alusta uuesti" tagasi viib. */
const DEFAULT_ANGLE_DEG = 30;

// --- Paigutus (SVG kasutajaühikud, y kasvab ALLA) --------------------------

const VIEW = { width: 360, height: 220 };
/** Langemispunkt: peegli ja mõlema kiire ühine punkt. */
const ORIGIN = { x: 180, y: 168 };
const MIRROR = { left: 24, right: 336 };
const RAY_LENGTH = 130;
const NORMAL_UP = 96;
const NORMAL_DOWN = 18;
const ARC_RADIUS = 52;
const ARC_LABEL_RADIUS = 74;
const HATCH_STEP = 9;

/** Pinna ristsirge suund: peegel on x-teljel, ristsirge osutab üles (+y). */
const NORMAL_DIRECTION: Vector2 = { x: 0, y: 1 };

/**
 * Nurgasildi vähim kaugus ristsirgest. Väikese nurga juures on mõlemad kaared
 * peaaegu koos ja numbrid satuksid kohakuti – see hoiab nad kõrvuti. Suurema
 * nurga juures ei tee ta midagi: silt on siis niikuinii kaugemal.
 */
const MIN_LABEL_OFFSET = 20;

/** Viirutus peegli taga – näitab, kummal pool on „klaasi tagune" pool. */
const HATCH_XS = Array.from(
  { length: Math.floor((MIRROR.right - MIRROR.left) / HATCH_STEP) },
  (_, index) => MIRROR.left + HATCH_STEP * (index + 1),
);

/**
 * Matemaatiline suund (y üles) → SVG punkt (y alla).
 *
 * See on AINUS koht, kus y-telg pööratakse – nii ei pea ükski teine rida
 * mäletama, kummale poole mudeli y osutab.
 */
function pointAt(direction: Vector2, distance: number) {
  return {
    x: ORIGIN.x + direction.x * distance,
    y: ORIGIN.y - direction.y * distance,
  };
}

function opposite(direction: Vector2): Vector2 {
  return { x: -direction.x, y: -direction.y };
}

/**
 * Kahe suuna vaheline poolitaja – nurgasilt läheb kaare keskele.
 *
 * Puhas geomeetria (liitmine ja pikkusega jagamine), mitte füüsika: sisendid
 * tulevad model.ts-ist. Vastassuunaliste vektoritega annaks see nulli, aga
 * siin on nurk alati 0…85°, seega suunad ei saa olla vastassuunalised.
 */
function bisector(a: Vector2, b: Vector2): Vector2 {
  const x = a.x + b.x;
  const y = a.y + b.y;
  const length = Math.hypot(x, y);
  return { x: x / length, y: y / length };
}

/**
 * Nurgasildi koht: kaare keskel ehk ristsirge ja kiire suuna poolitajal,
 * kuid mitte lähemal kui `MIN_LABEL_OFFSET` ristsirgest. `side` ütleb, kummal
 * pool silt on (−1 vasak, +1 parem) – suuna x-märgist seda võtta ei saa, sest
 * 0° juures on ta null.
 *
 * Silt jääb nii kaare SISSE ja kiir ei jookse temast läbi: poolitaja on alati
 * kiire ja ristsirge vahel.
 */
function angleLabelPoint(direction: Vector2, side: -1 | 1) {
  const onBisector = pointAt(bisector(NORMAL_DIRECTION, direction), ARC_LABEL_RADIUS);
  const offset = Math.max(Math.abs(onBisector.x - ORIGIN.x), MIN_LABEL_OFFSET);
  return { x: ORIGIN.x + side * offset, y: onBisector.y };
}

/** Kaar ristsirgest kiireni. `sweep` 1 = ekraanil päripäeva (paremale). */
function arcPath(from: Vector2, to: Vector2, sweep: 0 | 1): string {
  const start = pointAt(from, ARC_RADIUS);
  const end = pointAt(to, ARC_RADIUS);
  return `M ${start.x} ${start.y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 ${sweep} ${end.x} ${end.y}`;
}

/**
 * Noole koht kiirel, osa kiire pikkusest ALGUSPUNKTIST lugedes.
 *
 * Kaks põhjust, miks nad ei ole keskel:
 * 1. 0° juures langevad mõlemad kiired ristsirgele kokku (see on õige – kiir
 *    tuleb tagasi sama teed). Ühesuguse kaugusega nooled kataksid teineteist
 *    ja õpilane näeks üht joont ühe noolega.
 * 2. Mõlemad on väljaspool nurgasiltide ringi (`ARC_LABEL_RADIUS`), muidu
 *    satub nool väikese nurga juures otse numbri peale.
 */
const INCIDENT_ARROW_AT = 0.25;
const REFLECTED_ARROW_AT = 0.95;

/** Kiir noolega: kolm punkti, et `marker-mid` saaks kuhugi kinnituda. */
function rayPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  arrowAt: number,
): string {
  const arrow = {
    x: from.x + (to.x - from.x) * arrowAt,
    y: from.y + (to.y - from.y) * arrowAt,
  };
  return `M ${from.x} ${from.y} L ${arrow.x} ${arrow.y} L ${to.x} ${to.y}`;
}

export function Simulation() {
  const [angleDeg, setAngleDeg] = useState(DEFAULT_ANGLE_DEG);
  const sliderId = useId();

  // Peegeldumisnurk EI ole `angleDeg` koopia: seaduse ütleb mudel. Kui seadus
  // kunagi muutub (nt murdumine), muutub ta ühes kohas.
  const reflectionDeg = reflectionAngle(angleDeg);

  // Langev kiir liigub alla, aga silt ja kaar tahavad suunda langemispunktist
  // VÄLJA – seepärast vastassuund.
  const incidentUp = opposite(incidentDirection(angleDeg));
  const reflectedUp = reflectedDirection(angleDeg);

  const source = pointAt(incidentUp, RAY_LENGTH);
  const target = pointAt(reflectedUp, RAY_LENGTH);
  const normalTop = pointAt(NORMAL_DIRECTION, NORMAL_UP);
  const normalBottom = pointAt(opposite(NORMAL_DIRECTION), NORMAL_DOWN);
  const incidentLabel = angleLabelPoint(incidentUp, -1);
  const reflectedLabel = angleLabelPoint(reflectedUp, 1);

  return (
    <div className="flex flex-col gap-5">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        // Nurgad ise on siltides joonise all – ekraanilugeja saab nad sealt.
        // Kirjeldus jääb liuguri liigutamisel samaks, muidu loeks ta iga
        // kraadi juures terve lause uuesti ette.
        aria-label="Joonis: valguskiir langeb tasapeeglile, joonisel on ka pinna ristsirge ja peegeldunud kiir."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <defs>
          {/* Nool päri kiire suunda. `fill` on siin otse küljes, sest marker
              ei päri värvi teda kasutavalt joonelt. */}
          <marker
            id="ray-arrow-incident"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-brand" />
          </marker>
          <marker
            id="ray-arrow-reflected"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-info" />
          </marker>
        </defs>

        {/* Peegel: paks joon + viirutus tagumisel poolel */}
        <line
          x1={MIRROR.left}
          y1={ORIGIN.y}
          x2={MIRROR.right}
          y2={ORIGIN.y}
          className="stroke-ink"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <g className="stroke-ink-soft" strokeWidth={1.5} strokeLinecap="round">
          {HATCH_XS.map((x) => (
            <line key={x} x1={x} y1={ORIGIN.y} x2={x - HATCH_STEP} y2={ORIGIN.y + HATCH_STEP} />
          ))}
        </g>
        <text
          x={MIRROR.left}
          y={ORIGIN.y + HATCH_STEP + 18}
          className="fill-ink-soft"
          fontSize={13}
        >
          tasapeegel
        </text>

        {/* Pinna ristsirge – katkendjoon, sest ta ei ole valguskiir */}
        <line
          x1={normalBottom.x}
          y1={normalBottom.y}
          x2={normalTop.x}
          y2={normalTop.y}
          className="stroke-ink-soft"
          strokeWidth={2}
          strokeDasharray="6 5"
        />
        {/* Nurgakaared ristsirgest mõlema kiireni */}
        <path
          d={arcPath(NORMAL_DIRECTION, incidentUp, 0)}
          className="fill-none stroke-brand"
          strokeWidth={2}
        />
        <path
          d={arcPath(NORMAL_DIRECTION, reflectedUp, 1)}
          className="fill-none stroke-info"
          strokeWidth={2}
        />
        {/* Kiired kaarte peal, et kaared ja katkendjoon neid ei lõikaks */}
        <path
          d={rayPath(source, ORIGIN, INCIDENT_ARROW_AT)}
          className="fill-none stroke-brand"
          strokeWidth={3}
          strokeLinecap="round"
          markerMid="url(#ray-arrow-incident)"
        />
        <path
          d={rayPath(ORIGIN, target, REFLECTED_ARROW_AT)}
          className="fill-none stroke-info"
          strokeWidth={3}
          strokeLinecap="round"
          markerMid="url(#ray-arrow-reflected)"
        />
        <circle cx={ORIGIN.x} cy={ORIGIN.y} r={4} className="fill-ink" />

        {/* Sildid kõige viimasena ja valge äärisega (`paint-order: stroke`):
            väikese nurga juures möödub kiir siltidest napilt ja jookseks muidu
            neist läbi. Nii jääb number loetavaks ja kiir näib mööduvat tagant. */}
        <g className="stroke-white" strokeWidth={4} paintOrder="stroke">
          <text x={normalTop.x + 6} y={normalTop.y - 4} className="fill-ink-soft" fontSize={13}>
            ristsirge
          </text>
          <text
            x={incidentLabel.x}
            y={incidentLabel.y}
            className="fill-brand"
            fontSize={17}
            fontWeight={600}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {angleDeg}°
          </text>
          <text
            x={reflectedLabel.x}
            y={reflectedLabel.y}
            className="fill-info"
            fontSize={17}
            fontWeight={600}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {reflectionDeg}°
          </text>
        </g>
      </svg>

      {/* Numbrid suurelt ka joonise all: projektorilt ei loe kaugelt istuv
          õpilane 17-pikslist silti.

          Telefonis (360 px) on kaks veergu liiga kitsad – sõna
          „Peegeldumisnurk" jookseks kaardilt välja ja lühendada teda ei tohi,
          sest just see mõiste on siin õpitav. Seepärast on kitsal ekraanil
          kaks rida (silt vasakul, arv paremal) ja alles sm-ist alates kaks
          veergu. Nurgad jäävad mõlemal juhul kõrvuti võrreldavaks. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <AngleReadout label="Langemisnurk" value={angleDeg} tone="incident" />
        <AngleReadout label="Peegeldumisnurk" value={reflectionDeg} tone="reflected" />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={sliderId} className="text-base font-medium text-ink">
          Langemisnurk (ristsirge suhtes)
        </label>
        <input
          id={sliderId}
          type="range"
          min={MIN_ANGLE_DEG}
          max={MAX_ANGLE_DEG}
          step={1}
          value={angleDeg}
          onChange={(event) => setAngleDeg(clampAngle(event.target.value))}
          // Ekraanilugeja ütleks muidu „30" – kraadid on siin kogu jutt.
          aria-valuetext={`${angleDeg} kraadi`}
          className="h-11 w-full accent-brand"
        />
        <div className="flex justify-between text-sm text-ink-soft">
          <span>{MIN_ANGLE_DEG}°</span>
          <span>{MAX_ANGLE_DEG}°</span>
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="ghost" onClick={() => setAngleDeg(DEFAULT_ANGLE_DEG)}>
          <RotateCcw aria-hidden="true" className="size-4" />
          Alusta uuesti
        </Button>
      </div>
    </div>
  );
}

/**
 * Liuguri väärtus mudelile kõlblikuks.
 *
 * Mudel viskab vahemikust väljas vea (see on tahtlik – vt model.ts), seega
 * vaade ei tohi talle midagi kahtlast anda. `<input type="range">` hoiab
 * piire ise, aga see rida maksab vähem kui valge ekraan.
 */
function clampAngle(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_ANGLE_DEG;
  return Math.min(MAX_ANGLE_DEG, Math.max(MIN_ANGLE_DEG, Math.round(parsed)));
}

/** Üks nurk suurelt. Värv kordab kiire värvi, aga info kannab SILT. */
function AngleReadout({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "incident" | "reflected";
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3 sm:flex-col sm:items-start sm:gap-1">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`h-1 w-5 shrink-0 rounded-full ${
            tone === "incident" ? "bg-brand" : "bg-info"
          }`}
        />
        <span className="text-sm font-medium text-ink-soft">{label}</span>
      </div>
      <p className="text-3xl font-semibold tabular-nums text-ink">{value}°</p>
    </div>
  );
}
