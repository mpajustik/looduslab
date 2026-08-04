/**
 * Mooduli joonised (src/engine/figures.ts).
 *
 * Need on VAATED, nagu Simulation.tsx: ühtki arvutust siin ei ole. Erinevalt
 * peegeldumisseaduse joonistest ei tule siia ka `model.ts`-i importi – need
 * kaks joonist ei näita ühtki ARVU, vaid ainult olukorda, mille kohta küsimus
 * käib. Nii ei saa joonis mudeliga vastuollu minna: tal ei ole midagi väita.
 *
 * **Kumbki joonis ei tohi vastust ette öelda.** Tammi joonis näitab müüri
 * kuju, aga mitte rõhunooli (miks all paksem – see ongi hook'i küsimus).
 * Anumate joonis näitab kolme kuju ja ühte veetaset, aga mitte rõhu väärtusi
 * (millises on rõhk suurim – see on ennustuse küsimus). Sama joon, mis hoiab
 * collect-sammu graafikul sirge joonistamata.
 *
 * Vesi on kõikjal `fill-info` madala läbipaistmatusega – sama värv, mis
 * Simulation.tsx-i anumas, et õpilane tunneks joonisel vee ära.
 */

/** Joonisel on korraga üks vaade, seega ühed mõõdud mõlemale. */
const VIEW = { width: 320, height: 200 };

/** Vee läbipaistmatus – sama kokkulepe mis simulatsioonis. */
const WATER_OPACITY = 0.18;

// --- Tamm (hook) -----------------------------------------------------------

/** Tammi müür: ülal õhuke, all paks. Vesi on müürist vasakul. */
const DAM = {
  /** Müüri ülemine serv (y) ja põhi (y). */
  top: 40,
  bottom: 165,
  /** Vasak (vee poolne) külg: ülal ja all – siit tuleb kogu kalle. */
  faceTopX: 214,
  faceBottomX: 176,
  /** Parem (kuiv) külg on püstine. */
  backX: 232,
  waterSurface: 62,
};

/** Kaldu seina x antud kõrgusel – vee pind lõpeb täpselt müüri vastas. */
function damFaceX(y: number): number {
  const share = (y - DAM.top) / (DAM.bottom - DAM.top);
  return DAM.faceTopX + (DAM.faceBottomX - DAM.faceTopX) * share;
}

export function DamFigure() {
  const waterEdgeX = damFaceX(DAM.waterSurface);

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        aria-label="Joonis: veetammi ristlõige. Vasakul on paisjärve vesi, paremal tammi müür. Müür on veepinna juures õhuke ja muutub põhja poole minnes järjest paksemaks. Müürist paremal vett ei ole."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Vesi: pinnast müüri kaldu seinani. */}
        <polygon
          points={`14,${DAM.waterSurface} ${waterEdgeX},${DAM.waterSurface} ${DAM.faceBottomX},${DAM.bottom} 14,${DAM.bottom}`}
          className="fill-info"
          fillOpacity={WATER_OPACITY}
        />
        {/* Vee pind – katkendjoon, nagu simulatsioonis. */}
        <line
          x1={14}
          y1={DAM.waterSurface}
          x2={waterEdgeX}
          y2={DAM.waterSurface}
          className="stroke-info"
          strokeWidth={2}
          strokeDasharray="6 5"
        />

        {/* Müür: kaldu vee poolne külg, püstine tagakülg. */}
        <polygon
          points={`${DAM.faceTopX},${DAM.top} ${DAM.backX},${DAM.top} ${DAM.backX},${DAM.bottom} ${DAM.faceBottomX},${DAM.bottom}`}
          className="fill-ink-soft stroke-ink"
          fillOpacity={0.25}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Maapind mõlemal pool – ilma selleta hõljub tamm õhus. */}
        <line
          x1={4}
          y1={DAM.bottom}
          x2={VIEW.width - 4}
          y2={DAM.bottom}
          className="stroke-ink"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Paksuse mõõdud: ülal ja all. Need näitavad KUJU, mitte põhjust –
            miks müür all paksem peab olema, on selle sammu küsimus. */}
        <g className="stroke-brand" strokeWidth={2}>
          <line
            x1={DAM.faceTopX}
            y1={DAM.top - 12}
            x2={DAM.backX}
            y2={DAM.top - 12}
            strokeLinecap="round"
          />
          <line
            x1={DAM.faceBottomX}
            y1={DAM.bottom + 14}
            x2={DAM.backX}
            y2={DAM.bottom + 14}
            strokeLinecap="round"
          />
        </g>
        <text
          x={(DAM.faceTopX + DAM.backX) / 2}
          y={DAM.top - 18}
          textAnchor="middle"
          className="fill-brand"
          fontSize={13}
        >
          õhuke
        </text>
        <text
          x={(DAM.faceBottomX + DAM.backX) / 2}
          y={DAM.bottom + 30}
          textAnchor="middle"
          className="fill-brand"
          fontSize={13}
        >
          paks
        </text>

        <text x={22} y={DAM.waterSurface - 10} className="fill-ink-soft" fontSize={13}>
          vesi
        </text>
        <text
          x={DAM.backX + 10}
          y={DAM.top + 26}
          className="fill-ink-soft"
          fontSize={13}
        >
          tamm
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Tammi ristlõige: müür on veepinna juures õhuke ja põhja juures palju
        paksem.
      </figcaption>
    </figure>
  );
}

// --- Kolm anumat (predict) -------------------------------------------------

/** Kõigi anumate ühine veetase ja põhi – ennustuse mõte on just selles. */
const VESSELS = { surface: 74, floor: 158, top: 44 };

/**
 * Üks anum: avatud ülaosaga (pealt joont ei ole) ja veega ühise tasemeni.
 *
 * `topLeft`/`topRight` ja `bottomLeft`/`bottomRight` lubavad kolme eri kuju
 * ühe komponendiga: kitsas ja lai on püstised, lehter läheb allapoole ahtamaks.
 */
function Vessel({
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  label,
}: {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
  label: string;
}) {
  /** Seina x veetaseme kõrgusel – kaldseina puhul kitsam kui ülal. */
  const share = (VESSELS.surface - VESSELS.top) / (VESSELS.floor - VESSELS.top);
  const waterLeft = topLeft + (bottomLeft - topLeft) * share;
  const waterRight = topRight + (bottomRight - topRight) * share;
  const centre = (bottomLeft + bottomRight) / 2;

  return (
    <g>
      <polygon
        points={`${waterLeft},${VESSELS.surface} ${waterRight},${VESSELS.surface} ${bottomRight},${VESSELS.floor} ${bottomLeft},${VESSELS.floor}`}
        className="fill-info"
        fillOpacity={WATER_OPACITY}
      />
      {/* Seinad ja põhi ühe murdjoonena: pealt jääb anum lahti. */}
      <path
        d={`M ${topLeft} ${VESSELS.top} L ${bottomLeft} ${VESSELS.floor} L ${bottomRight} ${VESSELS.floor} L ${topRight} ${VESSELS.top}`}
        fill="none"
        className="stroke-ink"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Mõõtepunkt põhjas – kõigil kolmel ühesugune, arvu juures ei ole. */}
      <circle cx={centre} cy={VESSELS.floor} r={5} className="fill-brand" />
      <text
        x={centre}
        y={VESSELS.floor + 24}
        textAnchor="middle"
        className="fill-ink"
        fontSize={13}
      >
        {label}
      </text>
    </g>
  );
}

export function ThreeVesselsFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        aria-label="Joonis: kolm eri kujuga anumat kõrvuti – kitsas, lai ja lehtrikujuline, mis on ülalt laiem kui alt. Kõigis kolmes on vesi täpselt sama kõrguseni, mida näitab läbiv katkendjoon. Iga anuma põhja keskel on ühesugune mõõtepunkt."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Ühine veetase LÄBI kõigi kolme – see on ennustuse eeldus ja peab
            olema näha ühe pilguga, mitte kolme kõrgust võrreldes. */}
        <line
          x1={8}
          y1={VESSELS.surface}
          x2={VIEW.width - 8}
          y2={VESSELS.surface}
          className="stroke-info"
          strokeWidth={2}
          strokeDasharray="6 5"
        />
        {/* Silt anumate KOHAL, mitte veetaseme kõrval – lehtri ülemine serv
            ulatub veepinnast kõrgemale ja kattus sildiga (CodeRabbiti leid
            2026-08-04). */}
        <text
          x={VIEW.width - 8}
          y={VESSELS.top - 10}
          textAnchor="end"
          className="fill-info"
          fontSize={13}
        >
          sama veetase
        </text>

        <Vessel topLeft={20} topRight={56} bottomLeft={20} bottomRight={56} label="kitsas" />
        <Vessel topLeft={92} topRight={178} bottomLeft={92} bottomRight={178} label="lai" />
        <Vessel topLeft={210} topRight={306} bottomLeft={240} bottomRight={276} label="lehter" />
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Kolm anumat, kõigis vesi sama kõrguseni. Roheline täpp näitab kohta,
        kus rõhku mõõdetakse.
      </figcaption>
    </figure>
  );
}

// --- Tünn kolme auguga (practice) -------------------------------------------

/** Tünni sein ja veepind – augud ja joad joonistuvad selle peale. */
const BARREL = { left: 60, right: 160, top: 30, bottom: 176, waterSurface: 42 };

/** Kolme augu kõrgus (y) tünni seinal, ülalt alla. */
const HOLES = { ylemine: 78, keskmine: 122, alumine: 164 };

/**
 * Üks auk + juga. Joa PIKKUS peegeldab spetsi antud eeldust (alumine auk
 * purskab kõige kaugemale ja kõige sirgemalt) – see ON küsimuse eeldus,
 * ANTUD olukorrana, mitte tõestus ega vastus. Joonis EI TOHI väita, MIKS see
 * nii on (nt „see näitab kiirust") – see oleks vastuse ette ütlemine, sama
 * piir mis tammi joonisel: kuju paistab, põhjus mitte (CodeRabbiti
 * ülevaatuse leid 2026-08-05).
 */
function Jet({ y, length, droop }: { y: number; length: number; droop: number }) {
  const startX = BARREL.right;
  const endX = startX + length;
  return (
    <g>
      <circle cx={startX} cy={y} r={4} className="fill-ink" />
      <path
        d={`M ${startX} ${y} Q ${startX + length * 0.6} ${y + droop * 0.3} ${endX} ${y + droop}`}
        fill="none"
        className="stroke-info"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  );
}

export function BarrelHolesFigure() {
  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        aria-label="Joonis: küljelt vaadatud tünn kolme auguga selle seinas – üleval, keskel ja all. Igast august purskab veejuga küljele. Alumise augu juga ulatub kõige kaugemale ja kõige sirgemalt, keskmise oma vähem, ülemise oma kõige vähem."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Vesi tünni sees, pinnast põhjani. */}
        <rect
          x={BARREL.left}
          y={BARREL.waterSurface}
          width={BARREL.right - BARREL.left}
          height={BARREL.bottom - BARREL.waterSurface}
          className="fill-info"
          fillOpacity={WATER_OPACITY}
        />
        {/* Vee pind – katkendjoon, sama kokkulepe mis mujal moodulis. */}
        <line
          x1={BARREL.left}
          y1={BARREL.waterSurface}
          x2={BARREL.right}
          y2={BARREL.waterSurface}
          className="stroke-info"
          strokeWidth={2}
          strokeDasharray="6 5"
        />

        {/* Tünni sein ja põhi. */}
        <path
          d={`M ${BARREL.left} ${BARREL.top} L ${BARREL.left} ${BARREL.bottom} L ${BARREL.right} ${BARREL.bottom} L ${BARREL.right} ${BARREL.top}`}
          fill="none"
          className="stroke-ink"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Kolm auku + juga, ülalt alla – pikkus kasvab, sest see on antud. */}
        <Jet y={HOLES.ylemine} length={28} droop={10} />
        <Jet y={HOLES.keskmine} length={54} droop={16} />
        <Jet y={HOLES.alumine} length={86} droop={20} />

        <text x={BARREL.left - 10} y={HOLES.ylemine + 4} textAnchor="end" className="fill-ink-soft" fontSize={12}>
          ülal
        </text>
        <text x={BARREL.left - 10} y={HOLES.keskmine + 4} textAnchor="end" className="fill-ink-soft" fontSize={12}>
          keskel
        </text>
        <text x={BARREL.left - 10} y={HOLES.alumine + 4} textAnchor="end" className="fill-ink-soft" fontSize={12}>
          all
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Tünn kolme auguga. Alumine juga ulatub kõige kaugemale seinast ja on
        kõige sirgem.
      </figcaption>
    </figure>
  );
}
