import { Check, Info, X } from "lucide-react";
import type { CheckResult } from "../../checker";
import { cn } from "../cn";

/**
 * Checkeri vastus õpilase keeles.
 *
 * Siin ei otsustata midagi – lause tuleb checkerist (CLAUDE.md reegel 3),
 * see komponent valib ainult värvi ja ikooni. Värv EGA ikoon ei ole ainus info
 * kandja: sõnum ise ütleb tekstina, mis juhtus, ja ekraanilugeja saab
 * lisaks sildi („Õige vastus", „Vale vastus").
 *
 * `role="status"` teatab tulemuse ekraanilugejale ka siis, kui fookus jäi
 * nupule – ilma selleta jääks vastuse esitamine sõnaliselt märkamata.
 */
export function Feedback({ result, hints }: { result: CheckResult; hints?: string[] }) {
  const state = FEEDBACK_STATES[String(result.correct) as "true" | "false" | "null"];
  const Icon = state.icon;

  // Vihjeid näitame ainult vale vastuse juures: õige vastuse kõrval on nad
  // müra ja hindamata vastuse juures oleks vihje eksitav (seal ei ole „õiget").
  const showHints = result.correct === false && hints && hints.length > 0;

  // Õige vastus tuleb vihjete ETTE: vastust muuta enam ei saa, seega on vihje
  // siin mõtlemise tugi („miks see nii on"), mitte uus katse – ja tähtsaim
  // asi ekraanil peab olema esimene.
  const showExpected = result.correct === false && result.expected !== undefined;

  return (
    <div role="status" className={cn("flex flex-col gap-2 rounded-lg border p-4", state.box)}>
      <p className="flex items-start gap-3 text-lg leading-relaxed">
        <Icon aria-hidden="true" className={cn("mt-1 size-5 shrink-0", state.icons)} />
        <span>
          <span className="sr-only">{state.label}: </span>
          {result.feedback}
        </span>
      </p>

      {showExpected ? (
        <p className="pl-8 text-lg font-medium leading-relaxed text-ink">{result.expected}</p>
      ) : null}

      {showHints ? (
        <div className="pl-8">
          <p className="text-base font-medium text-ink">
            {hints.length > 1 ? "Vihjed:" : "Vihje:"}
          </p>
          <ul className="list-disc pl-5 text-base leading-relaxed text-ink">
            {hints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Kolm olekut vastavad `CheckResult.correct` kolmele väärtusele. Võti on
 * sõnena, sest `null` ei kõlba objekti võtmeks – kaardistus hoiab ära
 * `!result.correct` tüüpi vea, mis loeks hindamata vastuse valeks.
 */
const FEEDBACK_STATES = {
  true: {
    label: "Õige vastus",
    icon: Check,
    box: "border-correct bg-correct-soft text-ink",
    icons: "text-correct",
  },
  false: {
    label: "Vale vastus",
    icon: X,
    box: "border-retry bg-retry-soft text-ink",
    icons: "text-retry",
  },
  null: {
    label: "Märkus",
    icon: Info,
    box: "border-line bg-white text-ink",
    icons: "text-ink-soft",
  },
} as const;
