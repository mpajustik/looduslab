import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, BookOpen, CheckCircle2, Circle, Clock, FlaskConical, RotateCcw } from "lucide-react";
import { course } from "../../content/fyysika-8";
import { blockModules } from "../../content/schema";
import type { CourseBlock } from "../../content/schema";
import type { ModuleManifest } from "../../engine/contract";
import type { ModuleStatus } from "../../engine/moduleStatus";
import { blockProgress, type BlockProgress } from "../../engine/overview";
import { createProgressStore, type ModuleProgress } from "../../engine/progress";
import { allModuleIds, useModuleManifests } from "../moduleManifests";
import { useModuleStatuses } from "../moduleStatuses";
import { AccordionItem } from "../../ui/Accordion";
import { Badge } from "../../ui/Badge";
import { PageHeader } from "../../ui/PageHeader";
import { ProgressBar } from "../../ui/ProgressBar";
import { browserStorage } from "../../lib/storage";

const STATUS_LABELS: Record<ModuleStatus, string> = {
  "not-started": "Pole alustatud",
  "in-progress": "Pooleli",
  "needs-review": "Vajab kordamist",
  completed: "Lõpetatud",
};

const STATUS_ICONS: Record<ModuleStatus, typeof Circle> = {
  "not-started": Circle,
  "in-progress": Clock,
  "needs-review": RotateCcw,
  completed: CheckCircle2,
};

const STATUS_TONES: Record<ModuleStatus, "neutral" | "brand" | "info" | "correct"> = {
  "not-started": "neutral",
  "in-progress": "brand",
  "needs-review": "info",
  completed: "correct",
};

export default function CoursePage() {
  const manifests = useModuleManifests();
  const statuses = useModuleStatuses(allModuleIds);
  // Ainult ploki koondarvu jaoks – ei vaja kordamiskaarte, seega loeme
  // otse progressi, mitte tervet `courseOverview()`-t (vt engine/overview.ts
  // `blockProgress` kommentaar). `useState` alglaadur loeb salvestuse üks
  // kord, mitte igal joonistusel (samamoodi nagu ProgressPage.tsx).
  const [progress] = useState<ModuleProgress[]>(() =>
    createProgressStore("persist", browserStorage).list(),
  );
  const progressById = new Map(progress.map((item) => [item.moduleId, item]));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={course.title}
        lead="Seitse teemat. Vali plokk ja vaata, mis sees on."
      />

      <ol className="flex flex-col gap-3">
        {course.blocks.map((block, index) => {
          const progress = blockProgress(
            { title: block.title, moduleIds: blockModules(block) },
            progressById,
          );
          return (
            <li key={block.title}>
              <AccordionItem
                title={`${index + 1}. ${block.title}`}
                meta={blockMeta(progress)}
              >
                <BlockContent block={block} manifests={manifests} statuses={statuses} progress={progress} />
              </AccordionItem>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Olekutekst pealkirja kõrval – nähtav ka ilma plokki avamata. */
function blockMeta(progress: BlockProgress) {
  if (progress.total === 0) return "Tulekul";
  return `${progress.completed}/${progress.total} lõpetatud`;
}

function BlockContent({
  block,
  manifests,
  statuses,
  progress,
}: {
  block: CourseBlock;
  manifests: Record<string, ModuleManifest>;
  statuses: Record<string, ModuleStatus>;
  progress: BlockProgress;
}) {
  return (
    <div className="flex flex-col gap-4">
      {progress.total > 0 ? <ProgressBar percent={(progress.completed / progress.total) * 100} /> : null}

      {block.parts ? (
        block.parts.map((part) => (
          <section key={part.title} className="flex flex-col gap-2">
            <h3 className="font-semibold text-ink">{part.title}</h3>
            <ModuleList modules={part.modules} manifests={manifests} statuses={statuses} />
          </section>
        ))
      ) : (
        <ModuleList modules={block.modules ?? []} manifests={manifests} statuses={statuses} />
      )}
    </div>
  );
}

/**
 * Tühja loendi teade on SIIN, mitte ploki tasemel – nii saab ka üksik tühi
 * alateema oma selgituse, mitte ei jää lihtsalt tühjaks reaks.
 *
 * Kuni manifest on laadimata, näidatakse id-d ise (lühike välgatus enne
 * pealkirja ilmumist) – parem kui tühi rida, mis näeks välja nagu viga.
 */
function ModuleList({
  modules,
  manifests,
  statuses,
}: {
  modules: string[];
  manifests: Record<string, ModuleManifest>;
  statuses: Record<string, ModuleStatus>;
}) {
  if (modules.length === 0) {
    return <p>Tunnid on veel tegemisel.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {modules.map((id) => {
        const manifest = manifests[id];
        const status = statuses[id] ?? "not-started";
        return (
          <li key={id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {manifest ? (
              <>
                <Link
                  to={`/m/${manifest.slug}`}
                  className="flex min-h-11 items-center gap-2 font-medium text-brand underline underline-offset-2 hover:no-underline"
                >
                  {manifest.practicalWork.length > 0 ? (
                    <FlaskConical aria-hidden="true" className="size-4 shrink-0 text-ink-soft" />
                  ) : (
                    <BookOpen aria-hidden="true" className="size-4 shrink-0 text-ink-soft" />
                  )}
                  {manifest.title}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
                <Badge icon={STATUS_ICONS[status]} label={STATUS_LABELS[status]} tone={STATUS_TONES[status]} />
              </>
            ) : (
              <span className="flex min-h-11 items-center text-ink-soft">{id}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
