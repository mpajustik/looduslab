import { useId } from "react";
import type { ReactNode } from "react";

/**
 * Mooduli joonised (src/engine/figures.ts, sisu/MOODUL-kuu-faasid.md
 * „Sammud").
 *
 * Nagu Simulation.tsx, on ka need VAATED: füüsikat siin ei arvutata ega
 * imporditakse model.ts-ist (CLAUDE.md reegel 1). Ükski joonis ei näita ühtki
 * ARVU – ainult olukorda. Faasi KUJU (sirp, poolik, kumer) on siin lihtsustus
 * kahe ringi lõikest, mitte model.ts `terminatorFactor`-i ellips – see on
 * lubatud, sest joonis ei väida ühtki arvu, ainult kuju, ja täpne
 * ellipsikujuline terminaator tuleb alles Simulation.tsx-is, kus see ON
 * mudelist.
 */

type Phase = "new" | "crescent" | "half" | "gibbous" | "full";

/** Üks Kuu ketas: tume alus + hele kate, mis annab faasi kuju. */
function PhaseDisc({
  cx,
  cy,
  r,
  litSide,
  phase,
  clipId,
}: {
  cx: number;
  cy: number;
  r: number;
  litSide: "left" | "right";
  phase: Phase;
  clipId: string;
}) {
  const sign = litSide === "right" ? 1 : -1;
  let overlay: ReactNode = null;

  if (phase === "full") {
    overlay = <circle cx={cx} cy={cy} r={r} className="fill-teacher" />;
  } else if (phase === "half") {
    const x = litSide === "right" ? cx : cx - r;
    overlay = (
      <rect x={x} y={cy - r} width={r} height={2 * r} clipPath={`url(#${clipId})`} className="fill-teacher" />
    );
  } else if (phase === "crescent" || phase === "gibbous") {
    // Kaks lõikuvat ringi (lääts) – lihtsustatud faasikuju, mitte
    // model.ts ellips (vt faili algusekommentaari).
    const shift = phase === "crescent" ? r * 1.55 : r * 0.15;
    overlay = (
      <circle
        cx={cx + sign * shift}
        cy={cy}
        r={r}
        clipPath={`url(#${clipId})`}
        className="fill-teacher"
      />
    );
  }

  return (
    <g>
      <clipPath id={clipId}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
      <circle cx={cx} cy={cy} r={r} className="fill-ink-soft" />
      {overlay}
      <circle cx={cx} cy={cy} r={r} fill="none" className="stroke-ink-soft" strokeWidth={1.5} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// kf-kolm-ohtut – hook
// ---------------------------------------------------------------------------

const THREE_EVENINGS = [
  { date: "3. mai", phase: "crescent" as Phase, litSide: "right" as const },
  { date: "10. mai", phase: "half" as Phase, litSide: "right" as const },
  { date: "17. mai", phase: "gibbous" as Phase, litSide: "right" as const },
];

export function ThreeEveningsFigure() {
  const idBase = useId();
  const view = { width: 320, height: 140 };
  const r = 34;
  const cy = 56;
  const spacing = view.width / THREE_EVENINGS.length;

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${view.width} ${view.height}`}
        role="img"
        aria-label="Joonis: kolm Kuu ketast kõrvuti kolmel õhtul – 3. mai kitsas sirp, 10. mai täpselt poolik, 17. mai peaaegu täis, kõik valgustatud paremalt."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {THREE_EVENINGS.map((moon, index) => {
          const cx = spacing * index + spacing / 2;
          return (
            <g key={moon.date}>
              <PhaseDisc cx={cx} cy={cy} r={r} litSide={moon.litSide} phase={moon.phase} clipId={`${idBase}-${index}`} />
              <text x={cx} y={cy + r + 24} textAnchor="middle" className="fill-ink" fontSize={13} fontWeight={600}>
                {moon.date}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// kf-valgustatud-pool – theory
// ---------------------------------------------------------------------------

/**
 * Neli Kuud ümber Maa (0°, 90°, 180°, 270° – sama nurgakokkulepe, mis
 * model.ts-is ja Simulation.tsx-is). Kõik neli on valgustatud TÄPSELT samast
 * küljest (Päikese poolt, paralleelsed kiired), sest see kordumine on joonise
 * kogu mõte. „Nii paistab Maalt" väike ketas sõltub aga asukohast.
 */
const FOUR_MOONS = [
  { angle: 0, x: -80, y: 0, screenPhase: "new" as Phase, screenLit: "right" as const },
  { angle: 90, x: 0, y: 56, screenPhase: "half" as Phase, screenLit: "right" as const },
  { angle: 180, x: 80, y: 0, screenPhase: "full" as Phase, screenLit: "right" as const },
  { angle: 270, x: 0, y: -56, screenPhase: "half" as Phase, screenLit: "left" as const },
];

export function LitHalfFigure() {
  const idBase = useId();
  const view = { width: 360, height: 220 };
  const centerX = 190;
  const centerY = 110;
  const moonR = 16;
  const earthR = 14;
  const smallR = 9;
  const sunX = 24;

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${view.width} ${view.height}`}
        role="img"
        aria-label="Joonis: ülaltvaade – Päike vasakul, ümber Maa neli Kuud (0°, 90°, 180°, 270°), kõik pooleldi valgustatud Päikese poolt. Iga Kuu kõrval väike ketas näitab, kuidas ta Maalt paistab. Joonis ei ole mõõtkavas."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Päike ja paralleelsed kiired. */}
        <circle cx={sunX} cy={centerY} r={16} className="fill-teacher" />
        <text x={sunX} y={centerY + 32} textAnchor="middle" className="fill-ink-soft" fontSize={11}>
          Päike
        </text>
        {[-70, -20, 20, 70].map((dy) => (
          <line
            key={dy}
            x1={sunX + 18}
            y1={centerY + dy}
            x2={view.width - 4}
            y2={centerY + dy}
            className="stroke-ink-soft"
            strokeWidth={0.75}
            strokeDasharray="3 4"
            opacity={0.5}
          />
        ))}

        {/* Maa keskel + orbiidiring. */}
        <circle cx={centerX} cy={centerY} r={64} fill="none" className="stroke-ink-soft" strokeWidth={1} strokeDasharray="2 3" />
        <circle cx={centerX} cy={centerY} r={earthR} className="fill-brand" />
        <text x={centerX} y={centerY + earthR + 14} textAnchor="middle" className="fill-ink" fontSize={12} fontWeight={600}>
          Maa
        </text>

        {FOUR_MOONS.map((moon, index) => {
          const mx = centerX + moon.x;
          const my = centerY + moon.y;
          const smallX = mx + (moon.x >= 0 ? 30 : -30);
          return (
            <g key={moon.angle}>
              <PhaseDisc cx={mx} cy={my} r={moonR} litSide="left" phase="half" clipId={`${idBase}-moon-${index}`} />
              <text x={mx} y={my - moonR - 6} textAnchor="middle" className="fill-ink-soft" fontSize={10}>
                {moon.angle}°
              </text>
              <PhaseDisc
                cx={smallX}
                cy={my}
                r={smallR}
                litSide={moon.screenLit}
                phase={moon.screenPhase}
                clipId={`${idBase}-view-${index}`}
              />
            </g>
          );
        })}

        <text x={centerX} y={view.height - 6} textAnchor="middle" className="fill-ink-soft" fontSize={11}>
          suur ketas: Kuu ise (alati pooleldi valgustatud) · väike ketas: „nii paistab Maalt" · ei ole mõõtkavas
        </text>
      </svg>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// kf-kaks-sirpi – practice
// ---------------------------------------------------------------------------

export function TwoCrescentsFigure() {
  const idBase = useId();
  const view = { width: 260, height: 140 };
  const r = 40;
  const cy = 56;

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${view.width} ${view.height}`}
        role="img"
        aria-label="Joonis: kaks ühesugust Kuu sirpi kõrvuti – vasakpoolne valgustatud paremalt, parempoolne valgustatud vasakult."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <PhaseDisc cx={70} cy={cy} r={r} litSide="right" phase="crescent" clipId={`${idBase}-left`} />
        <PhaseDisc cx={190} cy={cy} r={r} litSide="left" phase="crescent" clipId={`${idBase}-right`} />
        <text x={70} y={cy + r + 24} textAnchor="middle" className="fill-ink" fontSize={13} fontWeight={600}>
          A
        </text>
        <text x={190} y={cy + r + 24} textAnchor="middle" className="fill-ink" fontSize={13} fontWeight={600}>
          B
        </text>
      </svg>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// kf-valgustatud-pool – theory (27,3 vs 29,5 päeva)
// ---------------------------------------------------------------------------

/**
 * Kaks Maa asendit orbiidil, 27° vahega – SEE, mitte kuupäev, on joonise
 * ainus vabalt valitud arv. 27° pole juhuslik: kui Kuu teeb 27,3 päevaga täpselt
 * ühe tiiru (tähtede suhtes), on Maa selle ajaga liikunud ümber Päikese
 * ligikaudu (27,3 / 365,25) · 360° ≈ 27° oma orbiidil edasi – ja täpselt selle
 * 27° võrra peab Kuu veel lisaks liikuma, et jõuda uuesti Päikese joonele.
 * Kuu liigub oma orbiidil ligikaudu 360° / 27,3 ≈ 13,2° ööpäevas, seega kulub
 * 27° jaoks umbes 2 ööpäeva – täpselt see vahe, mida teooriatekst väidab
 * (`SYNODIC_MONTH_DAYS − SIDEREAL_MONTH_DAYS ≈ 2,2`). Joonis ei impordi neid
 * konstante model.ts-ist (fail ei impordi kunagi mudelit, vt faili päist), aga
 * geomeetria ise on seepärast KOOSKÕLAS mudeliga, mitte juhuslikult sarnane.
 */
const SYNODIC_EARTH_STEP_DEG = 27;

/** Punkt ringjoonel: `centre + r · (cos θ, sin θ)`, θ kraadides. */
function onCircle(centre: { x: number; y: number }, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: centre.x + r * Math.cos(rad), y: centre.y + r * Math.sin(rad) };
}

/**
 * Silt punktist eemal, õhukese viiteliiniga – kaks Kuu 2 juures olevat punkti
 * (`moonAfterOneOrbit` ja `moon2`) on teineteisele nii lähedal (27° kaar 30 px
 * raadiusega ringil), et tekst nende KÕRVAL kattuks paratamatult. Viiteliin
 * lubab sildil elada avaras kohas, punkt ise jääb siiski täpseks.
 */
function Callout({
  from,
  labelX,
  labelY,
  anchor,
  lines,
}: {
  from: { x: number; y: number };
  labelX: number;
  labelY: number;
  anchor: "start" | "end";
  lines: string[];
}) {
  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={labelX + (anchor === "start" ? -6 : 6)}
        y2={labelY - 4}
        className="stroke-ink-soft"
        strokeWidth={1}
      />
      {lines.map((line, index) => (
        <text
          key={line}
          x={labelX}
          y={labelY + index * 12}
          textAnchor={anchor}
          className={index === 0 ? "fill-ink" : "fill-ink-soft"}
          fontSize={10}
          fontWeight={index === 0 ? 600 : 400}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

export function SynodicVsSiderealFigure() {
  const idArrow = useId();
  const view = { width: 360, height: 250 };
  const sun = { x: 34, y: 150 };
  const orbitR = 175;
  const moonOrbitR = 30;
  const earthR = 9;
  const moonR = 6;

  // Kaks Maa asendit Päikese ümber, 27° vahega (vt konstandi kommentaari).
  const angle1 = -20;
  const angle2 = angle1 + SYNODIC_EARTH_STEP_DEG;
  const earth1 = onCircle(sun, orbitR, angle1);
  const earth2 = onCircle(sun, orbitR, angle2);

  // Noorkuu = Kuu Päikese SUUNAS Maast vaadatuna, seega ringil täpselt Maa ja
  // Päikese vahelisel sirgel – mõlemad punktid tulevad SAMAST valemist, ainult
  // Maa asend ja nurk on erinevad.
  const moon1 = onCircle(earth1, moonOrbitR, angle1 + 180);
  // Sama ABSOLUUTNE nurk, aga ümber earth2: nii näeb Kuu, kes on teinud
  // täpselt ühe tiiru TÄHTEDE suhtes, ilma et oleks veel Päikese joonel.
  const moonAfterOneOrbit = onCircle(earth2, moonOrbitR, angle1 + 180);
  const moon2 = onCircle(earth2, moonOrbitR, angle2 + 180);

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${view.width} ${view.height}`}
        role="img"
        aria-label="Joonis ülalt: Päike vasakul, Maa kaks asendit oma orbiidil Päikese ümber, 27 kraadi vahega. Mõlemas Maa asendis on väike ring Kuu orbiidiks. Esimese Maa juures on Kuu täpselt Päikese suunas – noorkuu. Kui Kuu on teinud täpselt ühe täisringi, on ta teise Maa juures sama suunaga nagu enne, aga see EI ole enam Päikese suund, sest Maa on ise liikunud. Lühike lisakaar näitab, kuidas Kuu liigub veel natuke edasi, kuni jõuab uuesti Päikese joonele."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <defs>
          <marker id={idArrow} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-teacher" />
          </marker>
        </defs>

        {/* Päike ja Maa orbiidi kaar kahe asendi vahel. */}
        <circle cx={sun.x} cy={sun.y} r={16} className="fill-teacher" />
        <text x={sun.x} y={sun.y + 32} textAnchor="middle" className="fill-ink-soft" fontSize={11}>
          Päike
        </text>
        <path
          d={`M ${earth1.x} ${earth1.y} A ${orbitR} ${orbitR} 0 0 1 ${earth2.x} ${earth2.y}`}
          className="fill-none stroke-ink-soft"
          strokeWidth={1}
          strokeDasharray="2 3"
        />

        {/* Päikese suund mõlemast Maa asendist – Kuu asub ALATI sellel joonel,
            kui ta on noorkuu faasis. */}
        <line x1={sun.x} y1={sun.y} x2={earth1.x} y2={earth1.y} className="stroke-ink-soft" strokeWidth={1} strokeDasharray="4 4" />
        <line x1={sun.x} y1={sun.y} x2={earth2.x} y2={earth2.y} className="stroke-ink-soft" strokeWidth={1} strokeDasharray="4 4" />

        {/* Maa 1: praegu, Kuu noorkuu faasis. */}
        <circle cx={earth1.x} cy={earth1.y} r={moonOrbitR} className="fill-none stroke-ink-soft" strokeWidth={1} strokeDasharray="3 3" />
        <circle cx={earth1.x} cy={earth1.y} r={earthR} className="fill-brand" />
        <text x={earth1.x - 10} y={earth1.y - earthR - 8} textAnchor="end" className="fill-ink" fontSize={11} fontWeight={600}>
          Maa: praegu
        </text>
        <circle cx={moon1.x} cy={moon1.y} r={moonR} className="fill-ink" />
        <text x={moon1.x - 10} y={moon1.y + 4} textAnchor="end" className="fill-ink" fontSize={10}>
          noorkuu
        </text>

        {/* Maa 2: 27,3 päeva pärast – orbiit on edasi liikunud 27°. Lühike
            silt otse Maa dubleri kõrval, PIKK selgitus käib Callout'iga
            avarasse kohta (vt allpool), et need kaks lähestikku punkti ei
            jääks kahe kattuva teksti taha. */}
        <circle cx={earth2.x} cy={earth2.y} r={moonOrbitR} className="fill-none stroke-ink-soft" strokeWidth={1} strokeDasharray="3 3" />
        <circle cx={earth2.x} cy={earth2.y} r={earthR} className="fill-brand" />
        <text x={earth2.x + moonOrbitR + 8} y={earth2.y - 4} textAnchor="start" className="fill-ink" fontSize={11} fontWeight={600}>
          Maa:
        </text>
        <text x={earth2.x + moonOrbitR + 8} y={earth2.y + 9} textAnchor="start" className="fill-ink" fontSize={11} fontWeight={600}>
          27,3 p pärast
        </text>

        {/* Kuu on teinud täisringi (sama SUUND mis moon1 juures), aga see EI
            ole enam Päikese joonel – näitab, miks 27,3 päeva ei piisa. Silt
            läheb viiteliiniga vasakule avarasse kohta. */}
        <circle cx={moonAfterOneOrbit.x} cy={moonAfterOneOrbit.y} r={moonR} fill="none" className="stroke-ink" strokeWidth={2} strokeDasharray="2 2" />
        <Callout
          from={moonAfterOneOrbit}
          labelX={156}
          labelY={198}
          anchor="end"
          lines={["täisring tehtud,", "aga mitte Päikese joonel"]}
        />

        {/* Lisakaar: Kuu liigub veel natuke, kuni jõuab uuesti Päikese
            joonele – see ongi need „paar päeva" teooriatekstist. Silt läheb
            viiteliiniga paremale avarasse kohta. */}
        <path
          d={`M ${moonAfterOneOrbit.x} ${moonAfterOneOrbit.y} A ${moonOrbitR} ${moonOrbitR} 0 0 1 ${moon2.x} ${moon2.y}`}
          className="fill-none stroke-teacher"
          strokeWidth={2.5}
          markerEnd={`url(#${idArrow})`}
        />
        <circle cx={moon2.x} cy={moon2.y} r={moonR} className="fill-ink" />
        <Callout
          from={moon2}
          labelX={252}
          labelY={198}
          anchor="start"
          lines={["uus noorkuu:", "+ umbes 2 päeva"]}
        />

        <text
          x={view.width / 2}
          y={view.height - 8}
          textAnchor="middle"
          className="fill-ink"
          fontSize={11}
          fontWeight={600}
        >
          27,3 päeva (tiir) + umbes 2 päeva (järelejõudmine) ≈ 29,5 päeva
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Kuu tiirleb ümber Maa 27,3 päevaga, aga Maa on selle ajaga ise Päikese
        ümber edasi liikunud – Kuu peab Päikese suunale järele jõudma ja selleks
        kulub veel paar päeva.
      </figcaption>
    </figure>
  );
}

/**
 * Theory-1 juurde: neli Kuud korraga (`LitHalfFigure`, faas = vaatenurk) ja
 * selle all 27,3 vs 29,5 päeva joonis (`SynodicVsSiderealFigure`) – kaks eri
 * ideed samast teooriatekstist ühe joonisena, moodul jääb 6 sammu juurde,
 * teist theory-sammu ei lisata (sama muster mis mujal P1-s).
 */
export function LitHalfAndSynodicFigure() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <LitHalfFigure />
      <SynodicVsSiderealFigure />
    </div>
  );
}
