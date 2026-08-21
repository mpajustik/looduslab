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
