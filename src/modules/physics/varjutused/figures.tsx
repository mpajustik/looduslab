/**
 * Mooduli joonised (src/engine/figures.ts).
 *
 * Nagu Simulation.tsx, on ka need VAATED: füüsikat siin ei arvutata. Mudeli
 * importi siia ei tule – ükski joonis ei näita ühtki ARVU, ainult olukorda
 * või ajajoont. Nii ei saa joonis mudeliga vastuollu minna: tal ei ole
 * midagi väita.
 *
 * **Hooki joonis ei tohi vastust ette öelda.** `vj-eesti-varjutus` näitab,
 * ET täieliku varjutuse vahele jääb 165 aastat – aga MIKS, seda ei ütle
 * joonis, vaid teooria ja simulatsioon. Teooria joonis `vj-kaks-varjutust`
 * TOHIB kõik välja öelda, sest seal on see juba õpitav sisu.
 */

// ---------------------------------------------------------------------------
// vj-eesti-varjutus – hook
// ---------------------------------------------------------------------------

const TIMELINE_VIEW = { width: 340, height: 170 };
const TIMELINE_Y = 90;
const TIMELINE_START_X = 40;
const TIMELINE_END_X = 300;

/** 1961 ja 2126 vahel on 165 aastat – see arv on joonise kogu mõte. */
const YEAR_1961_X = TIMELINE_START_X;
const YEAR_2126_X = TIMELINE_END_X;

export function EstoniaEclipseTimelineFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${TIMELINE_VIEW.width} ${TIMELINE_VIEW.height}`}
        role="img"
        aria-label="Joonis: ajajoon aastaarvuga 1961, mil Eestis oli 88% Päikesest kaetud päikesevarjutus, ja aastaarvuga 2126, mil on järgmine täielik päikesevarjutus. Vahele jääb tühi 165-aastane joon."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Ajatelg. */}
        <line
          x1={TIMELINE_START_X}
          y1={TIMELINE_Y}
          x2={TIMELINE_END_X}
          y2={TIMELINE_Y}
          className="stroke-ink-soft"
          strokeWidth={2}
        />
        <line
          x1={YEAR_1961_X}
          y1={TIMELINE_Y - 8}
          x2={YEAR_1961_X}
          y2={TIMELINE_Y + 8}
          className="stroke-ink"
          strokeWidth={3}
        />
        <line
          x1={YEAR_2126_X}
          y1={TIMELINE_Y - 8}
          x2={YEAR_2126_X}
          y2={TIMELINE_Y + 8}
          className="stroke-ink"
          strokeWidth={3}
        />

        {/* 1961: Päike osaliselt kaetud – helendav ketas väikese hammustusega. */}
        <circle cx={YEAR_1961_X} cy={TIMELINE_Y - 40} r={16} className="fill-teacher" />
        <circle cx={YEAR_1961_X + 11} cy={TIMELINE_Y - 46} r={14} className="fill-white" />
        <text
          x={8}
          y={TIMELINE_Y - 62}
          textAnchor="start"
          className="fill-ink"
          fontSize={13}
          fontWeight={600}
        >
          1961
        </text>
        <text x={8} y={TIMELINE_Y + 26} textAnchor="start" className="fill-ink-soft" fontSize={11}>
          88% Päikesest kaetud
        </text>

        {/* 2126: Päike täiesti kaetud – must ketas. */}
        <circle cx={YEAR_2126_X} cy={TIMELINE_Y - 40} r={16} className="fill-ink" />
        <text
          x={TIMELINE_VIEW.width - 8}
          y={TIMELINE_Y - 62}
          textAnchor="end"
          className="fill-ink"
          fontSize={13}
          fontWeight={600}
        >
          2126
        </text>
        <text
          x={TIMELINE_VIEW.width - 8}
          y={TIMELINE_Y + 26}
          textAnchor="end"
          className="fill-ink-soft"
          fontSize={11}
        >
          järgmine täielik
        </text>

        {/* Tühi vahe – see ongi küsimus. */}
        <text
          x={(YEAR_1961_X + YEAR_2126_X) / 2}
          y={TIMELINE_Y + 46}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={12}
        >
          165 aastat vahet – Kuu möödub Maa ja Päikese vahelt iga kuu
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Eesti viimane peaaegu täielik päikesevarjutus oli 1961, järgmine täielik alles 2126.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// vj-kaks-varjutust – teooria
// ---------------------------------------------------------------------------

const ECLIPSE_VIEW = { width: 380, height: 260 };
const ROW1_Y = 62;
const ROW2_Y = 190;
const SUN_X = 30;
const NEAR_X = 150;
const FAR_TIP_X = 300;

export function TwoEclipsesFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${ECLIPSE_VIEW.width} ${ECLIPSE_VIEW.height}`}
        role="img"
        aria-label="Joonis kahe reana. Ülemine rida: Päike, Kuu ja Maa – Kuu tagant lähtub terav täisvarju koonus, mille ots puudutab Maad väikese täpina, ümber on laiem poolvarju ala. Alumine rida: Päike, Maa ja Kuu – Maa tagant lähtub palju jämedam koonus, mille sisse mahub kogu Kuu. Joonis ei ole mõõtkavas."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* --- Rida 1: päikesevarjutus (Kuu heidab varju Maale) --- */}
        <circle cx={SUN_X} cy={ROW1_Y} r={14} className="fill-teacher" />
        <text x={SUN_X} y={ROW1_Y + 30} textAnchor="middle" className="fill-ink-soft" fontSize={11}>
          Päike
        </text>

        <circle cx={NEAR_X} cy={ROW1_Y} r={9} className="fill-ink" />
        <text x={NEAR_X} y={ROW1_Y + 26} textAnchor="middle" className="fill-ink-soft" fontSize={11}>
          Kuu
        </text>

        {/* Poolvarju ala – lai, hall kolmnurk. */}
        <polygon
          points={`${NEAR_X},${ROW1_Y - 9} ${FAR_TIP_X},${ROW1_Y - 34} ${FAR_TIP_X},${ROW1_Y + 34} ${NEAR_X},${ROW1_Y + 9}`}
          className="fill-ink"
          fillOpacity={0.15}
        />
        {/* Täisvarju koonus – terav, tume, lõpeb Maa täpina. */}
        <polygon
          points={`${NEAR_X},${ROW1_Y - 9} ${FAR_TIP_X},${ROW1_Y} ${NEAR_X},${ROW1_Y + 9}`}
          className="fill-ink"
          fillOpacity={0.8}
        />
        <circle cx={FAR_TIP_X} cy={ROW1_Y} r={6} className="fill-teacher" />
        <text x={FAR_TIP_X} y={ROW1_Y + 26} textAnchor="middle" className="fill-ink-soft" fontSize={11}>
          Maa
        </text>
        <text
          x={ECLIPSE_VIEW.width / 2}
          y={ROW1_Y - 48}
          textAnchor="middle"
          className="fill-ink"
          fontSize={12}
          fontWeight={600}
        >
          Päikesevarjutus: Kuu vari langeb Maale
        </text>

        <line x1={0} y1={126} x2={ECLIPSE_VIEW.width} y2={126} className="stroke-line" strokeWidth={1} />

        {/* --- Rida 2: kuuvarjutus (Maa heidab varju Kuule) --- */}
        <circle cx={SUN_X} cy={ROW2_Y} r={14} className="fill-teacher" />
        <text x={SUN_X} y={ROW2_Y + 30} textAnchor="middle" className="fill-ink-soft" fontSize={11}>
          Päike
        </text>

        <circle cx={NEAR_X} cy={ROW2_Y} r={12} className="fill-ink" />
        <text x={NEAR_X} y={ROW2_Y + 30} textAnchor="middle" className="fill-ink-soft" fontSize={11}>
          Maa
        </text>

        {/* Poolvari. */}
        <polygon
          points={`${NEAR_X},${ROW2_Y - 12} ${FAR_TIP_X + 30},${ROW2_Y - 48} ${FAR_TIP_X + 30},${ROW2_Y + 48} ${NEAR_X},${ROW2_Y + 12}`}
          className="fill-ink"
          fillOpacity={0.15}
        />
        {/* Täisvari – palju jämedam koonus, Kuu mahub tervenisti sisse. */}
        <polygon
          points={`${NEAR_X},${ROW2_Y - 12} ${FAR_TIP_X + 60},${ROW2_Y} ${NEAR_X},${ROW2_Y + 12}`}
          className="fill-ink"
          fillOpacity={0.8}
        />
        <circle cx={FAR_TIP_X} cy={ROW2_Y} r={7} className="fill-teacher" />
        <text x={FAR_TIP_X} y={ROW2_Y + 26} textAnchor="middle" className="fill-ink-soft" fontSize={11}>
          Kuu
        </text>
        <text
          x={ECLIPSE_VIEW.width / 2}
          y={ROW2_Y - 62}
          textAnchor="middle"
          className="fill-ink"
          fontSize={12}
          fontWeight={600}
        >
          Kuuvarjutus: Maa vari langeb Kuule
        </text>

        <text x={8} y={ECLIPSE_VIEW.height - 8} className="fill-ink-soft" fontSize={11}>
          joonis ei ole mõõtkavas
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Kumb keha heidab varju ja kellele see langeb, on kahe varjutuse vahel vastupidine.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// vj-varjutuse-rada – harjutus (kaardilugemine)
// ---------------------------------------------------------------------------

const MAP_VIEW = { width: 360, height: 200 };

export function EclipsePathMapFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${MAP_VIEW.width} ${MAP_VIEW.height}`}
        role="img"
        aria-label="Joonis: skemaatiline maailmakaart, millel kulgeb kitsas tume riba üle mandrite ja selle ümber palju laiem hall ala. Kolm punkti on tähistatud: A tumeda riba peal, B halli ala peal, C väljaspool mõlemat ala."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Maailma taust – lihtsustatud mandrid, ainult kontekstiks. */}
        <rect x={10} y={10} width={340} height={180} rx={12} className="fill-line" fillOpacity={0.35} />
        <ellipse cx={90} cy={70} rx={55} ry={30} className="fill-line" />
        <ellipse cx={230} cy={130} rx={70} ry={35} className="fill-line" />
        <ellipse cx={300} cy={55} rx={35} ry={22} className="fill-line" />

        {/* Poolvarju laiem hall ala – kaartel kõver rada, mitte sirge. */}
        <path
          d="M 20 150 Q 140 40 340 90"
          className="stroke-ink"
          strokeOpacity={0.2}
          strokeWidth={46}
          fill="none"
          strokeLinecap="round"
        />
        {/* Täisvarju kitsas riba rajal keskel. */}
        <path
          d="M 20 150 Q 140 40 340 90"
          className="stroke-ink"
          strokeOpacity={0.85}
          strokeWidth={12}
          fill="none"
          strokeLinecap="round"
        />

        {/* Punkt A – tumedal ribal. */}
        <circle cx={150} cy={62} r={6} className="fill-teacher" stroke="white" strokeWidth={2} />
        <text x={150} y={46} textAnchor="middle" className="fill-ink" fontSize={13} fontWeight={700}>
          A
        </text>

        {/* Punkt B – hallis alas, riba servast eemal. */}
        <circle cx={205} cy={95} r={6} className="fill-teacher" stroke="white" strokeWidth={2} />
        <text x={205} y={112} textAnchor="middle" className="fill-ink" fontSize={13} fontWeight={700}>
          B
        </text>

        {/* Punkt C – väljaspool mõlemat ala. */}
        <circle cx={60} cy={40} r={6} className="fill-teacher" stroke="white" strokeWidth={2} />
        <text x={60} y={28} textAnchor="middle" className="fill-ink" fontSize={13} fontWeight={700}>
          C
        </text>

        <text x={10} y={MAP_VIEW.height - 8} className="fill-ink-soft" fontSize={11}>
          tume riba = täisvari, hall ala = poolvari
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Varjutuse rada kaardil: A täisvarjus, B poolvarjus, C väljaspool.
      </figcaption>
    </figure>
  );
}
