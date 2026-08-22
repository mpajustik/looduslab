import type { AnswerPayload, LabelPicks } from "../../engine/answers";
import type { LabelQuestion } from "../../engine/contract";
import { Button } from "../Button";
import { useDraft } from "./drafts";

function isPicks(saved: unknown): saved is Record<string, string> {
  return (
    typeof saved === "object" &&
    saved !== null &&
    !Array.isArray(saved) &&
    Object.values(saved).every((value) => typeof value === "string")
  );
}

/** Ühe koha rea ühine kuju – klikiala on kogu rida, vähemalt 44 px kõrge. */
const SPOT_ROW =
  "flex min-h-11 items-center gap-3 rounded-lg border border-line bg-white px-3 py-2";

/**
 * „Märgi joonisele": joonisel on nummerdatud kohad, õpilane valib igale kohale
 * nime (plaan/LUHITOOD.md etapp A).
 *
 * Numbrid joonistab JOONIS ise (mooduli figures.tsx) – see komponent ei tea
 * ühestki koordinaadist ja ei joonista joonise peale midagi. Nii mahub joonis
 * 360 px ekraanile täpselt nii, nagu autor ta tegi, ja `ui/` ei pea teadma
 * moodulitest midagi (docs/ARHITEKTUUR.md).
 *
 * Valik käib rippmenüüst, mitte lohistamisest: lohistamine ei tööta
 * puuteekraanil usaldusväärselt ja ekraanilugejaga ei tööta üldse
 * (CLAUDE.md reegel 10).
 *
 * Õigsust siin EI hinnata (reegel 3): `spot.answer` on olemas, aga teda loeb
 * ainult checker (src/checker/label.ts). Sama nime tohib panna kahte kohta –
 * see on õpilase viga, mitte vormiviga, ja tema parandamine on checkeri töö.
 */
export function LabelInput({
  question,
  answer,
  onAnswer,
  labelledBy,
}: {
  question: LabelQuestion;
  /** Esitatud vastus või `undefined`, kui õpilane pole veel vastanud. */
  answer: AnswerPayload | undefined;
  onAnswer: (payload: AnswerPayload) => void;
  /** Küsimuse teksti id – kohtade loend viitab sellele oma nimena. */
  labelledBy: string;
}) {
  // Pooleli valik elab mustandihoidlas: õpilane käib joonist ja loendit vahet
  // ning sammu vahetus ei tohi tehtud valikuid kaotada (vt drafts.ts).
  const [draft, setDraft] = useDraft<Record<string, string>>(question.id, (saved) =>
    isPicks(saved) ? saved : {},
  );

  // Vale kujuga vastus tähendab katkist moodulit (küsimus label, vastus
  // numeric) – siis käitume nii, nagu vastust ei oleks.
  const submitted = answer?.kind === "label" ? answer.picks : undefined;
  const picks: LabelPicks = submitted ?? draft;

  // Järjekord tuleb NUMBRIST, mitte loendi järjekorrast: ekraanil peavad read
  // olema samas järjekorras, mis joonisel olevad numbrid.
  const spots = [...question.spots].sort((a, b) => a.marker - b.marker);
  const nameText = new Map(question.names.map((name) => [name.id, name.text]));

  const complete = spots.every((spot) => draft[spot.id] !== undefined);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        // Esitatud vastust ei esitata uuesti – sama reegel mis mujal.
        if (submitted || !complete) return;
        onAnswer({ kind: "label", picks: draft });
      }}
      className="flex max-w-md flex-col gap-4"
    >
      <ul aria-labelledby={labelledBy} className="flex flex-col gap-2">
        {spots.map((spot) => {
          const picked = picks[spot.id];
          return (
            <li key={spot.id} className={SPOT_ROW}>
              {/* Number on TEKST, mitte ainult kujund – ekraanilugeja loeb ta
                  ette ja ta on sama number, mis joonisel. */}
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-lg font-semibold text-brand"
              >
                {spot.marker}
              </span>
              {submitted ? (
                <p className="text-lg text-ink">
                  <span className="sr-only">Koht {spot.marker}: </span>
                  {picked === undefined ? (
                    <span className="text-ink-soft">nimetamata</span>
                  ) : (
                    // Tundmatu nimi (moodul muutus vahepeal) jääb id-na
                    // ekraanile – vaikselt tühi rida oleks halvem.
                    (nameText.get(picked) ?? picked)
                  )}
                </p>
              ) : (
                <select
                  value={picked ?? ""}
                  onChange={(event) =>
                    setDraft({ ...draft, [spot.id]: event.target.value })
                  }
                  aria-label={`Koht ${spot.marker} joonisel`}
                  className="min-h-11 w-full rounded-lg border border-line bg-white px-2 text-lg text-ink"
                >
                  {/* Tühi valik on ainult ALGUSES: kui õpilane on nime juba
                      valinud, ei ole „vali nimi" enam kuhugi tagasi minna. */}
                  {picked === undefined ? <option value="">Vali nimi …</option> : null}
                  {question.names.map((name) => (
                    <option key={name.id} value={name.id}>
                      {name.text}
                    </option>
                  ))}
                </select>
              )}
            </li>
          );
        })}
      </ul>

      {submitted ? null : (
        <div>
          <Button type="submit" disabled={!complete}>
            Esita vastus
          </Button>
        </div>
      )}
    </form>
  );
}
