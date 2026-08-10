/**
 * Mooduli joonised (src/engine/figures.ts).
 *
 * Nagu Simulation.tsx, on ka need VAATED: ühtki arvutust siin ei ole. Erinevalt
 * peegeldumisseaduse joonistest ei tule siia ka `model.ts`-i importi – öine
 * tänav ei näita ühtki ARVU, ainult olukorda, mille kohta küsimus käib. Nii ei
 * saa joonis mudeliga vastuollu minna: tal ei ole midagi väita.
 *
 * **Joonis ei tohi vastust ette öelda.** Hook küsib, millised kehad annavad ise
 * valgust ja millised ainult peegeldavad – seepärast on kõik viis keha ühtviisi
 * heledad ja sildid ütlevad ainult, MIS keha see on („Kuu", „helkur"), mitte
 * mida ta valgusega teeb.
 */

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
