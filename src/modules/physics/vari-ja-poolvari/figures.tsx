/**
 * Mooduli joonised (src/engine/figures.ts).
 *
 * Nagu Simulation.tsx, on ka need VAATED: füüsikat siin ei arvutata. Mudeli
 * importi siia ei tule – kumbki joonis ei näita ühtki ARVU, ainult olukorda.
 * Nii ei saa joonis mudeliga vastuollu minna: tal ei ole midagi väita.
 *
 * **Hooki joonis ei tohi vastust ette öelda.** `vp-oma-vari` näitab, ET varju
 * serv on jalgade juures terav ja pea juures hägune – aga kiiri, allika laiust
 * ega sõna „poolvari“ seal ei ole. Selgituse saab õpilane alles teooriast ja
 * simulatsioonist. Teooria joonis `vp-taisvari-poolvari` seevastu TOHIB kõik
 * välja öelda: seal on see juba õpitav sisu.
 */

// ---------------------------------------------------------------------------
// vp-oma-vari – hook
// ---------------------------------------------------------------------------

const SHADOW_VIEW = { width: 340, height: 250 };

/** Maapind: asfalt algab siit. */
const GROUND_Y = 150;

/** Suurenduskastid paremas veerus – kaks sama mõõtu akent samast varjust. */
const ZOOM = { x: 244, width: 88, height: 58 };
const ZOOM_FEET_Y = 38;
const ZOOM_HEAD_Y = 150;

/**
 * Hägus serv ilma gradiendita: kuus kitsast riba, iga järgmine heledam.
 *
 * `defs` + `linearGradient` oleks lühem, aga gradiendi id peab olema lehel
 * unikaalne ja sama joonis võib ühel lehel korduda (kordamisvaade) – kaks
 * sama id-ga gradienti tähendaks, et brauser valib neist ühe. Kuus ristkülikut
 * on rumalam ja seepärast kindlam.
 */
const FADE_STEPS = [0.85, 0.68, 0.52, 0.36, 0.22, 0.1];

export function OwnShadowOnAsphaltFigure() {
  /**
   * Üleminek võtab veerandi akna laiusest, seega jääb tumedale tuumale ka
   * peavarju aknas veerand alles.
   *
   * Enne oli siin `ZOOM.width / 2`, mis tegi tumeda ristküliku laiuseks TÄPSELT
   * null (CodeRabbiti leid 2026-08-10): peavarju aken näitas ainult üleminekut,
   * ilma ühegi päris tumeda kohata. See on füüsiliselt vale – ka pea kohal on
   * täisvari olemas, tal on lihtsalt lai poolvarju serv. Mõlemas aknas on nüüd
   * tume pool sama lai ja erineb ainult serv, mis ongi joonise mõte.
   */
  const fadeWidth = ZOOM.width / 4 / FADE_STEPS.length;
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${SHADOW_VIEW.width} ${SHADOW_VIEW.height}`}
        role="img"
        aria-label="Joonis: päikesepaisteline päev, inimene seisab asfaldil ja tema vari langeb pikalt paremale. Paremal on kaks suurendust samast varjust: jalgade juures läheb tume ühe järsu piiriga heledaks, pea juures läheb tume tasapisi heledamaks ja piiri ei ole."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Päike ülal vasakul – valgus tuleb viltu, seepärast on vari pikk. */}
        <circle cx={26} cy={26} r={11} className="fill-teacher" />
        <g className="stroke-teacher" strokeWidth={2} strokeLinecap="round">
          <line x1={26} y1={6} x2={26} y2={12} />
          <line x1={46} y1={26} x2={40} y2={26} />
          <line x1={41} y1={11} x2={37} y2={15} />
          <line x1={41} y1={41} x2={37} y2={37} />
        </g>

        {/* Asfalt. */}
        <rect
          x={0}
          y={GROUND_Y}
          width={SHADOW_VIEW.width}
          height={SHADOW_VIEW.height - GROUND_Y}
          className="fill-line"
        />

        {/* Vari maas: kere piklik ribana, pea otsas eraldi laiguna. Pea laigu
            ümber on kaks läbipaistvat ellipsit – nemad teevad serva häguseks
            ilma ühtki sõna ütlemata. */}
        <g className="fill-ink">
          <polygon points="52,153 68,153 178,180 166,192" />
        </g>
        <ellipse cx={196} cy={190} rx={19} ry={12} className="fill-ink" fillOpacity={0.2} />
        <ellipse cx={196} cy={190} rx={15} ry={9} className="fill-ink" fillOpacity={0.45} />
        <ellipse cx={196} cy={190} rx={11} ry={7} className="fill-ink" />

        {/* Inimene: pea, keha, jalad, käed. Lihtne meelega – joonise sisu on
            vari, mitte inimene. */}
        <g className="stroke-ink" strokeWidth={3} strokeLinecap="round" fill="none">
          <line x1={60} y1={112} x2={60} y2={132} />
          <line x1={60} y1={132} x2={52} y2={GROUND_Y} />
          <line x1={60} y1={132} x2={68} y2={GROUND_Y} />
          <line x1={48} y1={126} x2={72} y2={122} />
        </g>
        <circle cx={60} cy={104} r={8} className="fill-ink" />

        {/* Viidad varjult suurendustesse. */}
        <g className="stroke-ink-soft" strokeWidth={1.5} strokeDasharray="4 4">
          <line x1={72} y1={158} x2={ZOOM.x} y2={ZOOM_FEET_Y + ZOOM.height / 2} />
          <line x1={206} y1={196} x2={ZOOM.x} y2={ZOOM_HEAD_Y + ZOOM.height / 2} />
        </g>

        {/* Suurendus 1 – jalgade juures: üks järsk piir. */}
        <text x={ZOOM.x + ZOOM.width / 2} y={ZOOM_FEET_Y - 8} textAnchor="middle" className="fill-ink-soft" fontSize={12}>
          jalgade juures
        </text>
        <rect
          x={ZOOM.x}
          y={ZOOM_FEET_Y}
          width={ZOOM.width}
          height={ZOOM.height}
          rx={8}
          className="fill-line stroke-line"
          strokeWidth={2}
        />
        <rect
          x={ZOOM.x}
          y={ZOOM_FEET_Y}
          width={ZOOM.width / 2}
          height={ZOOM.height}
          className="fill-ink"
        />

        {/* Suurendus 2 – pea juures: sama piir laiali määrdunud. */}
        <text x={ZOOM.x + ZOOM.width / 2} y={ZOOM_HEAD_Y - 8} textAnchor="middle" className="fill-ink-soft" fontSize={12}>
          pea juures
        </text>
        <rect
          x={ZOOM.x}
          y={ZOOM_HEAD_Y}
          width={ZOOM.width}
          height={ZOOM.height}
          rx={8}
          className="fill-line stroke-line"
          strokeWidth={2}
        />
        <rect
          x={ZOOM.x}
          y={ZOOM_HEAD_Y}
          width={ZOOM.width / 2 - fadeWidth * FADE_STEPS.length}
          height={ZOOM.height}
          className="fill-ink"
        />
        {FADE_STEPS.map((opacity, index) => (
          <rect
            key={opacity}
            x={ZOOM.x + ZOOM.width / 2 - fadeWidth * FADE_STEPS.length + index * fadeWidth}
            y={ZOOM_HEAD_Y}
            width={fadeWidth + 0.5}
            height={ZOOM.height}
            className="fill-ink"
            fillOpacity={opacity}
          />
        ))}

        <text x={12} y={SHADOW_VIEW.height - 12} className="fill-ink-soft" fontSize={12}>
          sama vari, sama Päike
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Oma vari asfaldil: jalgade juures on serv terav, pea juures hägune.
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// vp-taisvari-poolvari – teooria
// ---------------------------------------------------------------------------

const RAY_VIEW = { width: 380, height: 230 };

/** Optiline telg: allika keskkoht, palli kese ja täisvarju kese on kõik siin. */
const AXIS_Y = 100;
const LAMP_X = 30;
/** Allika POOL-laius pikslites – tema pärast tekibki poolvari. */
const LAMP_HALF = 18;
const BALL_X = 150;
const BALL_R = 22;
const SCREEN_X = 300;

/**
 * Kuhu ekraanil jõuab kiir, mis läheb allika servast `fromY` mööda palli serva
 * `throughY`.
 *
 * Nii tulevad kolme ala piirid ÜHEST kohast ja ei saa üksteisest lahku minna.
 * See on paigutus (pikslid), mitte füüsika: siin ei ole meetreid ega ühtki
 * mudeli suurust – ainult sirge, mis läbib kaht joonisel olevat punkti.
 */
function rayEndY(fromY: number, throughY: number): number {
  const slope = (throughY - fromY) / (BALL_X - LAMP_X);
  return fromY + slope * (SCREEN_X - LAMP_X);
}

const LAMP_TOP = AXIS_Y - LAMP_HALF;
const LAMP_BOTTOM = AXIS_Y + LAMP_HALF;
const BALL_TOP = AXIS_Y - BALL_R;
const BALL_BOTTOM = AXIS_Y + BALL_R;

/** Täisvarju piirid: allika ÜLEMISEST servast üle palli ülemise serva jne. */
const UMBRA_TOP = rayEndY(LAMP_TOP, BALL_TOP);
const UMBRA_BOTTOM = rayEndY(LAMP_BOTTOM, BALL_BOTTOM);
/** Kogu tumeda ala piirid: risti käivad kiired ulatuvad kõige kaugemale. */
const PENUMBRA_TOP = rayEndY(LAMP_BOTTOM, BALL_TOP);
const PENUMBRA_BOTTOM = rayEndY(LAMP_TOP, BALL_BOTTOM);

/** Neli kiirt: allika mõlemast servast mõlema palliserva poole. */
const RAYS = [
  { fromY: LAMP_TOP, throughY: BALL_TOP },
  { fromY: LAMP_TOP, throughY: BALL_BOTTOM },
  { fromY: LAMP_BOTTOM, throughY: BALL_TOP },
  { fromY: LAMP_BOTTOM, throughY: BALL_BOTTOM },
];

export function UmbraPenumbraFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${RAY_VIEW.width} ${RAY_VIEW.height}`}
        role="img"
        aria-label="Joonis: vasakul on laiusega lamp, keskel pall ja paremal ekraan. Neli kiirt lähtuvad lambi ülemisest ja alumisest servast mõlemast palli servast mööda. Ekraanil jagavad nad tumeda ala kolmeks: keskel on täiesti tume täisvari, mõlemal pool seda heledam poolvarju riba ja siis valgustatud osa."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Neli kiirt. Nemad ongi kogu joonise sisu: alad on lihtsalt see, mis
            nende vahele jääb. */}
        <g className="stroke-ink-soft" strokeWidth={1}>
          {RAYS.map((ray) => (
            <line
              key={`${ray.fromY}-${ray.throughY}`}
              x1={LAMP_X}
              y1={ray.fromY}
              x2={SCREEN_X}
              y2={rayEndY(ray.fromY, ray.throughY)}
            />
          ))}
        </g>

        {/* Lamp: helendav riba, mille KÕRGUS on tema laius `s`. */}
        <rect
          x={LAMP_X - 10}
          y={LAMP_TOP}
          width={10}
          height={2 * LAMP_HALF}
          rx={3}
          className="fill-teacher"
        />
        <text x={LAMP_X - 5} y={LAMP_BOTTOM + 18} textAnchor="middle" className="fill-ink-soft" fontSize={12}>
          lamp
        </text>

        {/* Pall – läbipaistmatu, seega joonisel täiesti tume. */}
        <circle cx={BALL_X} cy={AXIS_Y} r={BALL_R} className="fill-ink" />
        <text x={BALL_X} y={BALL_BOTTOM + 20} textAnchor="middle" className="fill-ink-soft" fontSize={12}>
          pall
        </text>

        {/* Ekraan. */}
        <line
          x1={SCREEN_X}
          y1={PENUMBRA_TOP - 14}
          x2={SCREEN_X}
          y2={PENUMBRA_BOTTOM + 14}
          className="stroke-ink-soft"
          strokeWidth={3}
        />
        <text x={SCREEN_X} y={PENUMBRA_BOTTOM + 30} textAnchor="middle" className="fill-ink-soft" fontSize={12}>
          ekraan
        </text>

        {/* Kolm ala ekraanil. Poolvari on läbipaistev, täisvari täis – aga
            infot kannavad SILDID, mitte tumeduse aste. */}
        <rect
          x={SCREEN_X - 4}
          y={PENUMBRA_TOP}
          width={8}
          height={UMBRA_TOP - PENUMBRA_TOP}
          className="fill-ink"
          fillOpacity={0.35}
        />
        <rect
          x={SCREEN_X - 4}
          y={UMBRA_TOP}
          width={8}
          height={UMBRA_BOTTOM - UMBRA_TOP}
          className="fill-ink"
        />
        <rect
          x={SCREEN_X - 4}
          y={UMBRA_BOTTOM}
          width={8}
          height={PENUMBRA_BOTTOM - UMBRA_BOTTOM}
          className="fill-ink"
          fillOpacity={0.35}
        />

        <g className="fill-ink-soft" fontSize={12}>
          <text x={SCREEN_X + 8} y={(PENUMBRA_TOP + UMBRA_TOP) / 2 + 4}>
            poolvari
          </text>
          <text x={SCREEN_X + 8} y={AXIS_Y + 4}>
            täisvari
          </text>
          <text x={SCREEN_X + 8} y={(UMBRA_BOTTOM + PENUMBRA_BOTTOM) / 2 + 4}>
            poolvari
          </text>
        </g>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Laiusega lamp: keskel täisvari, mõlemal pool poolvarju riba.
      </figcaption>
    </figure>
  );
}
