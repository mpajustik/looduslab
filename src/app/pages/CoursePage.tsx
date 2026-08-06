import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { course } from "../../content/fyysika-8";
import { blockModules } from "../../content/schema";
import type { CourseBlock } from "../../content/schema";
import type { ModuleManifest } from "../../engine/contract";
import { useModuleManifests } from "../moduleManifests";
import { AccordionItem } from "../../ui/Accordion";
import { PageHeader } from "../../ui/PageHeader";

export default function CoursePage() {
  const manifests = useModuleManifests();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={course.title}
        lead="Seitse teemat. Vali plokk ja vaata, mis sees on."
      />

      <ol className="flex flex-col gap-3">
        {course.blocks.map((block, index) => (
          <li key={block.title}>
            <AccordionItem
              title={`${index + 1}. ${block.title}`}
              meta={blockMeta(block)}
            >
              <BlockContent block={block} manifests={manifests} />
            </AccordionItem>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Olekutekst pealkirja kõrval – nähtav ka ilma plokki avamata. */
function blockMeta(block: CourseBlock) {
  const count = blockModules(block).length;
  if (count === 0) return "Tulekul";
  return count === 1 ? "1 tund" : `${count} tundi`;
}

function BlockContent({
  block,
  manifests,
}: {
  block: CourseBlock;
  manifests: Record<string, ModuleManifest>;
}) {
  if (block.parts) {
    return (
      <div className="flex flex-col gap-4">
        {block.parts.map((part) => (
          <section key={part.title} className="flex flex-col gap-2">
            <h3 className="font-semibold text-ink">{part.title}</h3>
            <ModuleList modules={part.modules} manifests={manifests} />
          </section>
        ))}
      </div>
    );
  }

  return <ModuleList modules={block.modules ?? []} manifests={manifests} />;
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
}: {
  modules: string[];
  manifests: Record<string, ModuleManifest>;
}) {
  if (modules.length === 0) {
    return <p>Tunnid on veel tegemisel.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {modules.map((id) => {
        const manifest = manifests[id];
        return (
          <li key={id}>
            {manifest ? (
              <Link
                to={`/m/${manifest.slug}`}
                className="flex min-h-11 items-center gap-2 font-medium text-brand underline underline-offset-2 hover:no-underline"
              >
                {manifest.title}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            ) : (
              <span className="flex min-h-11 items-center text-ink-soft">
                {id}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
