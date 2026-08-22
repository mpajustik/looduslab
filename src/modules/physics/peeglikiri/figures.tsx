import {
  letterList,
  letters,
  letterSymmetryColour,
  letterSymmetryLabel,
} from "./display";
import {
  ESTONIAN_UPPERCASE_LETTERS,
  SYMMETRIC_LETTERS,
  isVerticallySymmetricLetter,
} from "./model";

/**
 * Mooduli joonised (src/engine/figures.ts, sisu/MOODUL-peeglikiri.md
 * „Sammud").
 *
 * Nagu Simulation.tsx, on ka need VAATED: füüsikat siin ei arvutata. Kas täht
 * jääb peeglis samaks, ütleb MUDEL (`isVerticallySymmetricLetter`); silt ja toon
 * tulevad `display.ts`-ist. Nii ei saa teooria joonis ja simulatsioon kunagi
 * sama tähte eri värvi näidata.
 *
 * **Peegelpilt on joonisel PÄRISELT peegeldatud**, mitte tagurpidi kirjutatud
 * tekst: SVG `scale(-1 1)` pöörab nii tähtede järjekorra kui ka iga tähe kuju –
 * täpselt nii, nagu peegel teeb. Sõna „KIIRABI" tagurpidi tipitult näeks
 * hoopis teistsugune välja ja õpetaks vale asja.
 *
 * **Hooki joonis ei tohi vastust ette öelda.** `pk-kiirabiauto` näitab AINULT
 * auto kahte kirja – ühtki selgitust, silti ega järeldust seal ei ole. Teooria
 * joonis `pk-tahtede-summeetria` TOHIB kõik välja öelda, sest seal on see juba
 * õpitav sisu.
 *
 * **Värv ei ole ainus info kandja** (docs/DISAINIJUHIS.md): rohelise ja punase
 * täherea kohal seisab mõlemal oma SILT ning kogu joonise sisu on `aria-label`-is
 * lausetena kirjas.
 */

const OUTLINE_COLOUR = "#94a3b8";

/** Sõna, mis kiirabiauto peal seisab – sama sõna, mis mooduli tekstides. */
const AMBULANCE_WORD = "KIIRABI";

// ---------------------------------------------------------------------------
// pk-kiirabiauto – hook
// ---------------------------------------------------------------------------

const CAR_VIEW = { width: 380, height: 220 };

/**
 * Peegeldatud tekst: sama sõna, ainult `scale(-1 1)` läbi.
 *
 * Peegeldus käib ümber teksti enda keskkoha (`translate` viib nulli keskele,
 * `scale` pöörab, `textAnchor="middle"` hoiab sõna paigal) – muidu lendaks kiri
 * joonise servast välja.
 */
function MirroredText({
  x,
  y,
  fontSize,
  children,
}: {
  x: number;
  y: number;
  fontSize: number;
  children: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(-1 1)`}>
      <text
        x={0}
        y={0}
        textAnchor="middle"
        className="fill-ink"
        fontSize={fontSize}
        fontWeight={700}
        letterSpacing={1.5}
      >
        {children}
      </text>
    </g>
  );
}

export function AmbulanceFigure() {
  const bodyX = 40;
  const bodyY = 54;
  const bodyWidth = 300;
  const bodyHeight = 116;
  const centreX = bodyX + bodyWidth / 2;

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${CAR_VIEW.width} ${CAR_VIEW.height}`}
        role="img"
        aria-label={`Joonis: kiirabiauto eestvaates. Kapotil on suur kiri „${AMBULANCE_WORD}" peegelpildis – tähtede järjekord on tagurpidi ja iga täht ise on peegeldatud kujuga. Auto uksel on sama sõna „${AMBULANCE_WORD}" tavalises kirjas.`}
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Auto kere eestvaates */}
        <rect
          x={bodyX}
          y={bodyY}
          width={bodyWidth}
          height={bodyHeight}
          rx={14}
          fill="#f8fafc"
          stroke={OUTLINE_COLOUR}
          strokeWidth={2}
        />
        {/* Tuuleklaas */}
        <rect
          x={bodyX + 34}
          y={bodyY + 12}
          width={bodyWidth - 68}
          height={34}
          rx={6}
          fill="#e0f2fe"
          stroke={OUTLINE_COLOUR}
          strokeWidth={1.5}
        />
        {/* Vilkurid katusel */}
        <rect x={centreX - 54} y={bodyY - 14} width={38} height={14} rx={4} fill="#bfdbfe" stroke={OUTLINE_COLOUR} />
        <rect x={centreX + 16} y={bodyY - 14} width={38} height={14} rx={4} fill="#fecaca" stroke={OUTLINE_COLOUR} />
        {/* Tuled */}
        <circle cx={bodyX + 26} cy={bodyY + bodyHeight - 24} r={9} fill="#fef9c3" stroke={OUTLINE_COLOUR} />
        <circle cx={bodyX + bodyWidth - 26} cy={bodyY + bodyHeight - 24} r={9} fill="#fef9c3" stroke={OUTLINE_COLOUR} />
        {/* Rattad */}
        <rect x={bodyX + 22} y={bodyY + bodyHeight} width={40} height={12} rx={4} fill="#475569" />
        <rect x={bodyX + bodyWidth - 62} y={bodyY + bodyHeight} width={40} height={12} rx={4} fill="#475569" />

        {/* Kapoti kiri – PEEGELPILDIS */}
        <MirroredText x={centreX} y={bodyY + 82} fontSize={26}>
          {AMBULANCE_WORD}
        </MirroredText>

        {/* Auto uks kõrvalt – sama sõna tavalises kirjas */}
        <rect
          x={bodyX + 60}
          y={bodyY + bodyHeight + 30}
          width={bodyWidth - 120}
          height={34}
          rx={6}
          fill="#f1f5f9"
          stroke={OUTLINE_COLOUR}
          strokeWidth={1.5}
        />
        <text
          x={centreX}
          y={bodyY + bodyHeight + 53}
          textAnchor="middle"
          className="fill-ink"
          fontSize={18}
          fontWeight={700}
          letterSpacing={1.5}
        >
          {AMBULANCE_WORD}
        </text>
      </svg>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// pk-tahtede-summeetria – teooria
// ---------------------------------------------------------------------------

const LETTERS_VIEW = { width: 380, height: 250 };

/**
 * Tähed, mis peeglis MUUTUVAD.
 *
 * Loend tuletatakse tähestikust mudeli abil, mitte kirjutatud teist korda üles:
 * kaks loendit läheksid ühel päeval lahku ja siis seisaks sama täht joonisel
 * korraga rohelises ja punases reas.
 */
const CHANGING_LETTERS = ESTONIAN_UPPERCASE_LETTERS.filter(
  (letter) => !isVerticallySymmetricLetter(letter),
);

/** Üks tähtede rida: silt kohal, tähed all, kõik ühes toonis. */
function LetterRow({
  y,
  list,
  symmetric,
}: {
  y: number;
  list: readonly string[];
  symmetric: boolean;
}) {
  const colour = letterSymmetryColour(symmetric);
  const cell = (LETTERS_VIEW.width - 24) / CHANGING_LETTERS.length;
  const rowWidth = cell * list.length;
  const startX = (LETTERS_VIEW.width - rowWidth) / 2;

  return (
    <g>
      <text x={LETTERS_VIEW.width / 2} y={y} textAnchor="middle" fill={colour} fontSize={13} fontWeight={700}>
        {letterSymmetryLabel(symmetric)}
      </text>
      {list.map((letter, index) => (
        <g key={letter}>
          <rect
            x={startX + index * cell + 1}
            y={y + 8}
            width={cell - 2}
            height={26}
            rx={4}
            fill="#ffffff"
            stroke={colour}
            strokeWidth={1.5}
          />
          <text
            x={startX + index * cell + cell / 2}
            y={y + 27}
            textAnchor="middle"
            className="fill-ink"
            fontSize={14}
            fontWeight={600}
          >
            {letter}
          </text>
        </g>
      ))}
    </g>
  );
}

/**
 * Näidispaar: täht ja tema peegelpilt kõrvuti, vahel märk = või ≠.
 *
 * Just SEE paar on joonise mõte – tähtede read ütlevad, MILLISED tähed kummas
 * rühmas on, aga alles paar näitab, MIDA „sama peeglis" tähendab.
 */
function MirrorPair({
  x,
  y,
  letter,
  caption,
}: {
  x: number;
  y: number;
  letter: string;
  caption: string;
}) {
  const symmetric = isVerticallySymmetricLetter(letter);
  const colour = letterSymmetryColour(symmetric);

  return (
    <g>
      <text x={x} y={y} textAnchor="middle" className="fill-ink" fontSize={30} fontWeight={700}>
        {letter}
      </text>
      {/* Peegel kahe tähe vahel */}
      <line x1={x + 26} y1={y - 26} x2={x + 26} y2={y + 8} stroke={OUTLINE_COLOUR} strokeWidth={2} />
      <g transform={`translate(${x + 52} ${y}) scale(-1 1)`}>
        <text x={0} y={0} textAnchor="middle" className="fill-ink" fontSize={30} fontWeight={700}>
          {letter}
        </text>
      </g>
      <text x={x + 26} y={y + 28} textAnchor="middle" fill={colour} fontSize={12} fontWeight={600}>
        {caption}
      </text>
    </g>
  );
}

export function LetterSymmetryFigure() {
  const sameExample = SYMMETRIC_LETTERS[0];
  const changingExample = CHANGING_LETTERS.find(
    (letter) => letter === "K",
  ) ?? CHANGING_LETTERS[0];

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${LETTERS_VIEW.width} ${LETTERS_VIEW.height}`}
        role="img"
        aria-label={`Joonis: tähestik kahes reas. Ülemises reas on tähed, mis on peeglis samasugused: ${letterList(
          SYMMETRIC_LETTERS,
        )}. Alumises reas on tähed, mis peeglis muutuvad: ${letterList(
          CHANGING_LETTERS,
        )}. All on kaks näidispaari: täht „${sameExample}" ja tema peegelpilt on ühesugused, täht „${changingExample}" ja tema peegelpilt on erineva kujuga.`}
        className="w-full rounded-2xl border border-line bg-white"
      >
        <LetterRow y={22} list={SYMMETRIC_LETTERS} symmetric />
        <LetterRow y={92} list={CHANGING_LETTERS} symmetric={false} />

        <MirrorPair x={90} y={190} letter={sameExample} caption="sama kuju" />
        <MirrorPair x={250} y={190} letter={changingExample} caption="teine kuju" />
      </svg>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// pk-tahtede-summeetria teooria lisand – pabeririba pealtvaade
// ---------------------------------------------------------------------------

const STRIP_VIEW = { width: 420, height: 190 };
const STRIP_MIRROR_X = 200;
const STRIP_ROW_Y = 70;
const STRIP_TILE = 32;
const STRIP_STEP = 38;

/** Sõna, mille peal joonis töötab – sama sõna, mis activities.ts `WORDS[0]`-is. */
const STRIP_WORD = "TAKSO";
const STRIP_LETTERS = letters(STRIP_WORD);
const STRIP_LAST_INDEX = STRIP_LETTERS.length - 1;

/**
 * Mitu „sammu" täht on peeglist kaugel: sõna ESIMENE täht (T, indeks 0) on
 * kõige kaugemal, VIIMANE täht (O) puudutab peeglit – täpselt nii, nagu teooria
 * tekst kirjeldab pabeririba, mille üks ots lebab peegli vastas.
 */
const stripDepthSteps = (index: number): number => STRIP_LAST_INDEX - index;

/** Tähe koht PABERIL (peegli ees): kaugemad tähed vasakul, peegli ääres paremal. */
function stripRealTileX(index: number): number {
  return STRIP_MIRROR_X - STRIP_TILE / 2 - STRIP_STEP * stripDepthSteps(index);
}

/**
 * Tähe koht KUJUTISES: sama kaugus peeglist, aga TEISEL pool – puhas
 * peegeldus (`2 × peegli koht − paberi koht`), sama seos, mis `model.ts`
 * funktsioonis `imageDepthM` (sügavus pöördub, asend piki peeglit mitte).
 */
function stripImageTileX(index: number): number {
  return 2 * STRIP_MIRROR_X - stripRealTileX(index);
}

/** Üks tähetahvel paberiribal või kujutises. */
function DepthTile({
  x,
  letter,
  dashed,
}: {
  x: number;
  letter: string;
  dashed: boolean;
}) {
  const half = STRIP_TILE / 2;
  return (
    <g>
      <rect
        x={x - half}
        y={STRIP_ROW_Y - half}
        width={STRIP_TILE}
        height={STRIP_TILE}
        rx={5}
        fill="#ffffff"
        className={dashed ? "stroke-info" : "stroke-brand"}
        strokeWidth={2}
        strokeDasharray={dashed ? "5 4" : undefined}
      />
      <text
        x={x}
        y={STRIP_ROW_Y + 6}
        textAnchor="middle"
        className="fill-ink"
        fontSize={17}
        fontWeight={700}
      >
        {letter}
      </text>
    </g>
  );
}

export function MirrorDepthFigure() {
  const realCentreX =
    (stripRealTileX(0) + stripRealTileX(STRIP_LAST_INDEX)) / 2;
  const imageCentreX =
    (stripImageTileX(0) + stripImageTileX(STRIP_LAST_INDEX)) / 2;
  const realOrder = STRIP_LETTERS.join(" → ");
  const imageOrder = [...STRIP_LETTERS].reverse().join(" → ");

  return (
    <figure className="flex w-full max-w-md flex-col gap-2">
      <svg
        viewBox={`0 0 ${STRIP_VIEW.width} ${STRIP_VIEW.height}`}
        role="img"
        aria-label={`Joonis: pealtvaade paberiribale peegli ees. Sõna „${STRIP_WORD}" tähed lebavad eri sügavustel – esimene täht T on peeglist kõige kaugemal, viimane täht O puudutab peeglit. Peeglist paremal on katkendjoonega kujutis: iga tähe kujutis on peeglist täpselt sama kaugel, aga teisel pool. Paberil loetakse tähed järjekorras „${realOrder}", kujutises aga vastupidises järjekorras „${imageOrder}" – sest sügavus, mitte tähtede ise, on see, mis peeglis pöördub.`}
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* Peegel: pidev joon, kujutise pool viirutatud (nagu tasapeegli-kujutis). */}
        <line
          x1={STRIP_MIRROR_X}
          y1={16}
          x2={STRIP_MIRROR_X}
          y2={132}
          className="stroke-ink"
          strokeWidth={3}
        />
        <g className="stroke-ink-soft" strokeWidth={1}>
          {[26, 42, 58, 74, 90, 106, 122].map((y) => (
            <line
              key={y}
              x1={STRIP_MIRROR_X + 2}
              y1={y}
              x2={STRIP_MIRROR_X + 10}
              y2={y - 8}
            />
          ))}
        </g>
        <text
          x={STRIP_MIRROR_X}
          y={12}
          textAnchor="middle"
          className="fill-ink"
          fontSize={12}
          fontWeight={600}
        >
          peegel
        </text>

        {/* Lugemisjärjekorrad rea kohal – just see on joonise mõte. */}
        <text
          x={realCentreX}
          y={30}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={13}
          fontWeight={600}
        >
          {realOrder}
        </text>
        <text
          x={imageCentreX}
          y={30}
          textAnchor="middle"
          fill="#0369a1"
          fontSize={13}
          fontWeight={700}
        >
          {imageOrder}
        </text>

        {/* Paber ja tema kujutis: iga täht omaette sügavusel. */}
        {STRIP_LETTERS.map((letter, index) => (
          <DepthTile
            key={`real-${index}`}
            x={stripRealTileX(index)}
            letter={letter}
            dashed={false}
          />
        ))}
        {STRIP_LETTERS.map((letter, index) => (
          <DepthTile
            key={`image-${index}`}
            x={stripImageTileX(index)}
            letter={letter}
            dashed
          />
        ))}

        <text
          x={realCentreX}
          y={STRIP_ROW_Y + 34}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={11}
        >
          paber (päris sõna)
        </text>
        <text
          x={imageCentreX}
          y={STRIP_ROW_Y + 34}
          textAnchor="middle"
          fill="#0369a1"
          fontSize={11}
        >
          kujutis peeglis
        </text>

        {/* Kaugeim ja lähim täht – need kaks otsa näitavad, mis sügavusega juhtub. */}
        <text
          x={stripRealTileX(0)}
          y={STRIP_ROW_Y - 26}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={10}
        >
          kaugel
        </text>
        <text
          x={stripRealTileX(STRIP_LAST_INDEX)}
          y={STRIP_ROW_Y - 26}
          textAnchor="middle"
          className="fill-ink-soft"
          fontSize={10}
        >
          lähedal
        </text>
      </svg>
      <figcaption className="text-base leading-relaxed text-ink-soft">
        Mõtle sõnale paberiribana peegli ees: iga täht on omaette sügavusel.
        Peeglis on sügavus vastupidine – kaugel olnust saab lähedal ja
        vastupidi –, seepärast pöördub kogu tähtede järjekord, kuigi ükski
        täht ise ei liigu vasakule ega paremale.
      </figcaption>
    </figure>
  );
}

/**
 * Theory-1 juurde: kaks joonist üksteise all – kõigepealt MIKS järjekord
 * pöördub (sügavus, `MirrorDepthFigure`), siis MILLISED tähed ise muutuvad
 * (`LetterSymmetryFigure`). Sama järjekord, mis teooriateksti lõikudel.
 * Moodul jääb 6 sammu juurde, teist theory-sammu ei lisata (sama muster mis
 * `valgusallikad/SourceKindsFigure` ja
 * `valguse-sirgjooneline-levimine/RayAndBeamTypesFigure`).
 */
export function LetterSymmetryAndDepthFigure() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <MirrorDepthFigure />
      <LetterSymmetryFigure />
    </div>
  );
}
