/**
 * Mooduli joonised (src/engine/figures.ts).
 *
 * Nagu Simulation.tsx, on ka need VAATED: ühtki arvutust siin ei ole. Mudeli
 * importi siia ei tule – hooki joonis ei näita ühtki ARVU, ainult olukorda,
 * mille kohta küsimus käib. Nii ei saa joonis mudeliga vastuollu minna: tal ei
 * ole midagi väita.
 *
 * **Joonis ei tohi vastust ette öelda.** Hook küsib, MIKS on laigud
 * ümmargused, kuigi lehtede vahed on sakilised – seepärast näitab joonis
 * mõlemat kuju kõrvuti, aga kiiri, auku ega Päikese kujutist ta ei joonista.
 * Selgituse saab õpilane alles simulatsioonist ja harjutusest practice-2.
 */

/** Üks vaade, ühed mõõdud. */
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
