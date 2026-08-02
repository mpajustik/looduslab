import { course } from "../../content/fyysika-8";
import { blockModules } from "../../content/schema";
import type { CourseBlock } from "../../content/schema";
import { AccordionItem } from "../../ui/Accordion";
import { PageHeader } from "../../ui/PageHeader";

export default function CoursePage() {
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
              <BlockContent block={block} />
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

function BlockContent({ block }: { block: CourseBlock }) {
  if (block.parts) {
    return (
      <div className="flex flex-col gap-4">
        {block.parts.map((part) => (
          <section key={part.title} className="flex flex-col gap-2">
            <h3 className="font-semibold text-ink">{part.title}</h3>
            <ModuleList modules={part.modules} />
          </section>
        ))}
      </div>
    );
  }

  return <ModuleList modules={block.modules ?? []} />;
}

/**
 * Praegu näidatakse mooduli id-d. Sammus 1.1 tuleb registri
 * (src/modules/registry.ts) kaudu pealkiri ja link moodulile.
 *
 * Tühja loendi teade on SIIN, mitte ploki tasemel – nii saab ka üksik tühi
 * alateema oma selgituse, mitte ei jää lihtsalt tühjaks reaks.
 */
function ModuleList({ modules }: { modules: string[] }) {
  if (modules.length === 0) {
    return <p>Tunnid on veel tegemisel.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {modules.map((id) => (
        <li key={id} className="text-ink">
          {id}
        </li>
      ))}
    </ul>
  );
}
