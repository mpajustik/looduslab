/**
 * Mooduli joonised (src/engine/figures.ts).
 *
 * Nagu Simulation.tsx, on ka need VAATED: füüsikat siin ei arvutata. Mudeli
 * importi siia ei tule – kumbki joonis ei näita ühtki ARVU, ainult olukorda.
 * Nii ei saa joonis mudeliga vastuollu minna: tal ei ole midagi väita.
 *
 * **Hooki joonis ei tohi vastust ette öelda.** `tp-poe-peegel` näitab, ET
 * kaugemale astudes paistab peeglist täpselt sama palju – aga MIKS, seda ei
 * ütle joonis, vaid teooria ja simulatsioon. Teooria joonis
 * `tp-nailine-kujutis` TOHIB kõik välja öelda, sest seal on see juba õpitav
 * sisu.
 *
 * Mõlemal joonisel on kujutis ja kiirte pikendused KATKENDJOONEGA ning päris
 * kiired pidevana – sama kokkulepe, mis simulatsioonis. Katkendlik joon ei
 * ole ainus vahe: kujutis on ka sildiga „kujutis (näiline)" märgitud, sest
 * joone muster ei kanna infot üksi.
 */

// ---------------------------------------------------------------------------
// tp-poe-peegel – hook
// ---------------------------------------------------------------------------

const SHOP_VIEW = { width: 360, height: 230 };

/** Ühe kaadri sisemine paigutus (koordinaadid kaadri vasakust servast). */
const FRAME_WIDTH = 170;
const FLOOR_Y = 180;
const WALL_X = 156;
/** Peegel seinal: väike, umbes õlgade kõrgusel. */
const MIRROR_TOP_Y = 58;
const MIRROR_BOTTOM_Y = 96;
/** Inimese pealagi ja jalad kaadris – mõlemas kaadris ühesugused. */
const HEAD_Y = 46;
const BODY_TOP_Y = 62;
/** Nähtav osa lõpeb mõlemas kaadris TÄPSELT samal kõrgusel – see ongi mõte. */
const VISIBLE_BOTTOM_Y = 116;

type ShopFrameProps = {
  /** Kaadri nihe suures SVG-s. */
  offsetX: number;
  /** Inimese kaugus seinast selles kaadris. */
  personX: number;
  caption: string;
};

function ShopFrame({ offsetX, personX, caption }: ShopFrameProps) {
  const x = (value: number) => offsetX + value;
  return (
    <g>
      {/* Kaadri raam – kaks olukorda peavad olema silmaga eristatavad. */}
      <rect
        x={x(6)}
        y={16}
        width={FRAME_WIDTH - 12}
        height={186}
        rx={10}
        className="fill-white stroke-line"
        strokeWidth={1}
      />
      {/* Põrand ja sein. */}
      <line
        x1={x(14)}
        y1={FLOOR_Y}
        x2={x(FRAME_WIDTH - 14)}
        y2={FLOOR_Y}
        className="stroke-ink-soft"
        strokeWidth={2}
      />
      <line
        x1={x(WALL_X)}
        y1={28}
        x2={x(WALL_X)}
        y2={FLOOR_Y}
        className="stroke-ink-soft"
        strokeWidth={2}
      />
      {/* Peegel seinal – väike ja mõlemas kaadris täpselt ühesugune. */}
      <rect
        x={x(WALL_X - 7)}
        y={MIRROR_TOP_Y}
        width={7}
        height={MIRROR_BOTTOM_Y - MIRROR_TOP_Y}
        className="fill-brand"
      />
      <text x={x(WALL_X - 12)} y={MIRROR_TOP_Y - 6} textAnchor="end" className="fill-ink-soft" fontSize={11}>
        peegel
      </text>

      {/* Inimene: pea + keha. Nähtav osa on paksem ja tumedam JA sildiga. */}
      <circle cx={x(personX)} cy={HEAD_Y} r={9} className="fill-ink" />
      <line
        x1={x(personX)}
        y1={VISIBLE_BOTTOM_Y}
        x2={x(personX)}
        y2={FLOOR_Y}
        className="stroke-ink-soft"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <line
        x1={x(personX)}
        y1={BODY_TOP_Y}
        x2={x(personX)}
        y2={VISIBLE_BOTTOM_Y}
        className="stroke-ink"
        strokeWidth={9}
        strokeLinecap="round"
      />
      {/* Piirjoon „siit allpool ei paista" – värv ei ole ainus info kandja. */}
      <line
        x1={x(personX) - 22}
        y1={VISIBLE_BOTTOM_Y}
        x2={x(personX) + 16}
        y2={VISIBLE_BOTTOM_Y}
        className="stroke-ink"
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <text x={x(personX) - 24} y={HEAD_Y + 24} textAnchor="end" className="fill-ink" fontSize={11}>
        paistab
      </text>
      <text x={x(personX) - 24} y={VISIBLE_BOTTOM_Y + 26} textAnchor="end" className="fill-ink-soft" fontSize={11}>
        ei paista
      </text>

      <text
        x={x(FRAME_WIDTH / 2)}
        y={FLOOR_Y + 22}
        textAnchor="middle"
        className="fill-ink"
        fontSize={12}
        fontWeight={600}
      >
        {caption}
      </text>
    </g>
  );
}

export function ShopMirrorFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${SHOP_VIEW.width} ${SHOP_VIEW.height}`}
        role="img"
        aria-label="Joonis kahest kaadrist. Vasakul seisab inimene väikese seinapeegli lähedal, paremal on ta astunud kaks sammu tagasi. Mõlemas kaadris on peeglist näha täpselt sama osa temast – pea ja ülakeha; jalad ei paista kummaski."
        className="w-full rounded-2xl border border-line bg-white"
      >
        <ShopFrame offsetX={0} personX={96} caption="peegli lähedal" />
        <ShopFrame offsetX={SHOP_VIEW.width - FRAME_WIDTH} personX={54} caption="kaks sammu tagasi" />
        <text
          x={SHOP_VIEW.width / 2}
          y={SHOP_VIEW.height - 6}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={11}
        >
          peegel on mõlemas kaadris sama
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Kaks sammu tagasi – ja peeglist paistab täpselt sama osa sinust.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// tp-nailine-kujutis – teooria
// ---------------------------------------------------------------------------

const IMAGE_VIEW = { width: 380, height: 250 };

/** Peegel on püstine joon; ristsirge on seega vaatajale horisontaalne. */
const MIRROR_X = 200;
/**
 * Ese ja kujutis on peeglist TÄPSELT sama kaugel (110 ühikut kummalgi pool) –
 * see on joonise põhiväide ja seepärast tuleb kujutise koht ühest arvust.
 */
const OBJECT_TO_MIRROR = 110;
const OBJECT_X = MIRROR_X - OBJECT_TO_MIRROR;
const IMAGE_X = MIRROR_X + OBJECT_TO_MIRROR;

/** Küünla leegi tipp – siit lähtuvad mõlemad kiired. */
const FLAME_TIP_Y = 110;
const CANDLE_TOP_Y = 126;
const CANDLE_BASE_Y = 182;

/** Silm ja tema kaks serva: sinna jõuavad kaks peegeldunud kiirt. */
const EYE = { x: 108, y: 71 };
const EYE_TARGET_TOP = { x: 122, y: 66 };
const EYE_TARGET_BOTTOM = { x: 122, y: 77 };

/**
 * Peegli tabamiskohad. Need EI ole vabalt valitud: mõlemad on punktid, kus
 * sirge kujutise tipust silma servani läbib peeglit – just nii tuleb α = β
 * joonisel iseenesest välja.
 */
const HIT_TOP = { x: MIRROR_X, y: 84 };
const HIT_BOTTOM = { x: MIRROR_X, y: 91 };

type Point = { x: number; y: number };

const line = (from: Point, to: Point) => `M ${from.x} ${from.y} L ${to.x} ${to.y}`;

/** Küünal: keha + leek. `dashed` = kujutis, mida päriselt ei ole. */
function Candle({ x, dashed }: { x: number; dashed: boolean }) {
  const stroke = dashed ? { strokeDasharray: "6 4" } : {};
  return (
    <g className={dashed ? "fill-none stroke-brand" : "fill-brand stroke-brand"} strokeWidth={2}>
      <rect
        x={x - 9}
        y={CANDLE_TOP_Y}
        width={18}
        height={CANDLE_BASE_Y - CANDLE_TOP_Y}
        rx={3}
        {...stroke}
      />
      <path
        d={`M ${x} ${FLAME_TIP_Y} Q ${x + 8} ${CANDLE_TOP_Y - 4} ${x} ${CANDLE_TOP_Y - 2} Q ${x - 8} ${CANDLE_TOP_Y - 4} ${x} ${FLAME_TIP_Y} z`}
        className={dashed ? "fill-none stroke-teacher" : "fill-teacher stroke-teacher"}
        {...stroke}
      />
    </g>
  );
}

export function VirtualImageFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${IMAGE_VIEW.width} ${IMAGE_VIEW.height}`}
        role="img"
        aria-label="Joonis: vasakul põlev küünal, keskel püstine peegel, paremal katkendjoonega sama suur küünal peegli taga. Küünla leegi tipust lähtub kaks kiirt peeglile, mõlemad peegelduvad silma; langemis- ja peegeldumisnurk on tähistatud võrdsetena. Peegeldunud kiirte katkendlikud pikendused lõikuvad katkendjoonega küünla leegi tipus. Kaugus küünlast peeglini ja peeglist kujutiseni on tähistatud võrdsetena."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Peegel: pidev joon, tagumine pool viirutatud. */}
        <line
          x1={MIRROR_X}
          y1={30}
          x2={MIRROR_X}
          y2={196}
          className="stroke-ink"
          strokeWidth={3}
        />
        <g className="stroke-ink-soft" strokeWidth={1}>
          {[40, 56, 72, 88, 104, 120, 136, 152, 168, 184].map((y) => (
            <line key={y} x1={MIRROR_X + 2} y1={y} x2={MIRROR_X + 10} y2={y - 8} />
          ))}
        </g>
        <text x={MIRROR_X - 6} y={26} textAnchor="end" className="fill-ink" fontSize={12} fontWeight={600}>
          peegel
        </text>

        {/* Ese ja tema kujutis – ühesuurused, sama kaugel. */}
        <Candle x={OBJECT_X} dashed={false} />
        <Candle x={IMAGE_X} dashed />
        <text x={OBJECT_X} y={CANDLE_BASE_Y + 18} textAnchor="middle" className="fill-ink-soft" fontSize={11}>
          küünal
        </text>
        <text x={IMAGE_X} y={CANDLE_BASE_Y + 18} textAnchor="middle" className="fill-ink-soft" fontSize={11}>
          kujutis (näiline)
        </text>

        {/* Kiired: leegi tipust peeglile ja sealt silma. */}
        <g className="fill-none stroke-brand" strokeWidth={2}>
          <path d={line({ x: OBJECT_X, y: FLAME_TIP_Y }, HIT_TOP)} />
          <path d={line({ x: OBJECT_X, y: FLAME_TIP_Y }, HIT_BOTTOM)} />
        </g>
        <g className="fill-none stroke-info" strokeWidth={2}>
          <path d={line(HIT_TOP, EYE_TARGET_TOP)} />
          <path d={line(HIT_BOTTOM, EYE_TARGET_BOTTOM)} />
        </g>
        {/* Pikendused – need ei ole päris kiired, seepärast katkendjoon. */}
        <g className="fill-none stroke-info" strokeWidth={1.5} strokeDasharray="6 5">
          <path d={line(HIT_TOP, { x: IMAGE_X, y: FLAME_TIP_Y })} />
          <path d={line(HIT_BOTTOM, { x: IMAGE_X, y: FLAME_TIP_Y })} />
        </g>
        <circle cx={IMAGE_X} cy={FLAME_TIP_Y} r={3} className="fill-info" />

        {/* Ristsirge ja võrdsed nurgad ülemise kiire juures. */}
        <line
          x1={MIRROR_X - 34}
          y1={HIT_TOP.y}
          x2={MIRROR_X + 12}
          y2={HIT_TOP.y}
          className="stroke-ink-soft"
          strokeWidth={1}
          strokeDasharray="5 4"
        />
        <text x={MIRROR_X - 22} y={HIT_TOP.y + 14} textAnchor="middle" className="fill-brand" fontSize={12} fontWeight={600}>
          α
        </text>
        <text x={MIRROR_X - 22} y={HIT_TOP.y - 6} textAnchor="middle" className="fill-info" fontSize={12} fontWeight={600}>
          β
        </text>
        <text x={MIRROR_X - 40} y={HIT_TOP.y - 18} textAnchor="end" className="fill-ink-soft" fontSize={11}>
          α = β
        </text>

        {/* Silm. */}
        <path
          d={`M ${EYE.x - 15} ${EYE.y} Q ${EYE.x} ${EYE.y - 12} ${EYE.x + 15} ${EYE.y} Q ${EYE.x} ${EYE.y + 12} ${EYE.x - 15} ${EYE.y} z`}
          className="fill-white stroke-ink"
          strokeWidth={1.5}
        />
        <circle cx={EYE.x} cy={EYE.y} r={4} className="fill-ink" />
        <text x={EYE.x} y={EYE.y - 16} textAnchor="middle" className="fill-ink-soft" fontSize={11}>
          silm
        </text>

        {/* Võrdsed kaugused peeglist – joonise teine põhiväide. */}
        <g className="stroke-ink-soft" strokeWidth={1}>
          <line x1={OBJECT_X} y1={200} x2={OBJECT_X} y2={218} />
          <line x1={MIRROR_X} y1={200} x2={MIRROR_X} y2={218} />
          <line x1={IMAGE_X} y1={200} x2={IMAGE_X} y2={218} />
          <line x1={OBJECT_X} y1={212} x2={MIRROR_X} y2={212} />
          <line x1={MIRROR_X} y1={212} x2={IMAGE_X} y2={212} />
        </g>
        <text x={(OBJECT_X + MIRROR_X) / 2} y={234} textAnchor="middle" className="fill-ink" fontSize={12}>
          kaugus peeglist
        </text>
        <text x={(MIRROR_X + IMAGE_X) / 2} y={234} textAnchor="middle" className="fill-ink" fontSize={12}>
          sama kaugus
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Silma jõuavad peegeldunud kiired; nende pikendused lõikuvad peegli taga – seal paistab kujutis olevat.
      </figcaption>
    </figure>
  );
}
