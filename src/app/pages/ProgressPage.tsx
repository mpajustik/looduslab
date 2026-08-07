import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { course } from "../../content/fyysika-8";
import { blockModules } from "../../content/schema";
import type { ModuleManifest } from "../../engine/contract";
import {
  courseOverview,
  type BlockProgress,
  type CourseOverview,
  type NextAction,
} from "../../engine/overview";
import { createProgressStore } from "../../engine/progress";
import { createReviewStore } from "../../engine/review";
import { browserStorage } from "../../lib/storage";
import { moduleRegistry } from "../../modules/registry";
import { buttonClasses } from "../../ui/buttonStyles";
import { Card, CardTitle } from "../../ui/Card";
import { PageHeader } from "../../ui/PageHeader";
import { useModuleManifests } from "../moduleManifests";

/**
 * „Minu edenemine" (plaani samm 3.4).
 *
 * Kolm otsust:
 *
 * 1. **Arvutus on engine'is** (src/engine/overview.ts), leht ainult joonistab.
 *    Nii saab „mida järgmisena soovitada" testida ilma brauserita.
 * 2. **Ilma serverita.** Loeme ainult seadme salvestust: edenemisleht peab
 *    avanema ka lennukirežiimis ja ilma sisselogimiseta. Serveris olev seis
 *    jõuab seadmesse sammuga 3.6.
 * 3. **Ei mingit punktisüsteemi ega edetabelit** (plaan). Iga arv siin
 *    vastab küsimusele „mis on tehtud", mitte „kui hea sa oled".
 */
export default function ProgressPage() {
  const manifests = useModuleManifests();
  // Salvestuse lugemine on SÜNKROONNE, seega ei ole siin efekti ega
  // laadimisolekut: `useState` alglaadur jookseb täpselt üks kord lehe
  // avamisel. Efektiga tehtud `setState` oleks lisaks tarbetu ka ESLintile
  // (react-hooks/set-state-in-effect – sama leid mis kordamislehel).
  const [overview] = useState<CourseOverview>(readOverview);

  return (
    <div className="flex flex-col gap-6">
      {/* Külalise töö EI jõua õpetajani – vana tekst „sinu vastuseid näeb
          ainult sinu õpetaja" lubas talle midagi, mida ei juhtu (Codexi leid). */}
      <PageHeader
        title="Minu edenemine"
        lead="Läbitud tunnid ja edasiminek. Sinu seis on selles seadmes; klassiga liitunult näeb seda ka sinu õpetaja."
      />

      <NextStepCard next={overview.next} manifests={manifests} />

      {/* Nuppu siin EI ole siis, kui soovitus ülal on juba kordamine – kaks
          ühesugust nuppu kõrvuti tekitab küsimuse „kumb neist?". */}
      <ReviewCard overview={overview} withLink={overview.next.kind !== "review"} />

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-ink">Kursuse teemad</h2>
        <p className="text-ink-soft">
          {overview.completedModules === overview.totalModules
            ? "Kõik praegused tunnid tehtud."
            : `Tehtud ${overview.completedModules} ${lessonWord(overview.completedModules)} ${overview.totalModules}-st.`}
        </p>
        <ol className="flex flex-col gap-3">
          {overview.blocks.map((block, index) => (
            <li key={block.title}>
              <BlockRow block={block} number={index + 1} />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

/**
 * Seadme seis kokku üheks arvutuseks.
 *
 * Mõlemad hoidlad saavad `persist`, aga siit lehelt EI KIRJUTATA kuhugi:
 * kutsume ainult `list()`. `sync` jääb `null`-iks – edenemisleht ei tekita
 * serverisse ühtegi päringut ja avaneb ka lennukirežiimis.
 */
function readOverview(): CourseOverview {
  return courseOverview({
    blocks: course.blocks.map((block) => ({
      title: block.title,
      moduleIds: blockModules(block),
    })),
    progress: createProgressStore("persist", browserStorage).list(),
    // Kaardid, mille moodulit registris enam ei ole (arhiveeritud moodul,
    // CLAUDE.md reegel 11), viskab ka kordamisleht välja. Ilma sama filtrita
    // lubaks edenemisleht kaarte, mille peale kordamisleht ütleb „ei ole
    // midagi korrata" (Codexi ülevaatuse leid 2026-08-07).
    //
    // Filter on SIIN, mitte engine'is: register on rakenduse asi, engine ei
    // tea moodulite laadimisest midagi (docs/ARHITEKTUUR.md).
    reviewItems: createReviewStore("persist", browserStorage)
      .list()
      .filter((item) => moduleRegistry[item.moduleId]),
  });
}

/**
 * Üks selge järgmine samm.
 *
 * Kui manifest ei ole veel laadinud (esimene sekund, kehv võrk), näitame
 * mooduli asemel kursuselinki – parem üks töötav nupp kui tühi kast, mis
 * näeb välja nagu viga.
 */
function NextStepCard({
  next,
  manifests,
}: {
  next: NextAction;
  manifests: Record<string, ModuleManifest>;
}) {
  if (next.kind === "done") {
    return (
      <Card className="flex flex-col gap-3">
        <CardTitle>Kõik tehtud!</CardTitle>
        <p className="text-ink">
          Oled kursuse praegused tunnid läbi teinud ja tänased kaardid
          korranud. Uued tunnid lisanduvad kursuse lehele.
        </p>
        <div>
          <Link to="/kursus" className={buttonClasses("secondary")}>
            Vaata kursust
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </Card>
    );
  }

  if (next.kind === "review") {
    return (
      <Card className="flex flex-col gap-3">
        <CardTitle>Järgmiseks: kordamine</CardTitle>
        <p className="text-ink">
          {next.count} {cardWord(next.count)} ootab täna kordamist. See võtab
          paar minutit ja hoiab õpitu meeles.
        </p>
        <div>
          <Link to="/kordamine" className={buttonClasses()}>
            Alusta kordamist
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </Card>
    );
  }

  const manifest = manifests[next.moduleId];
  const heading =
    next.kind === "continue"
      ? "Järgmiseks: lõpeta pooleli tund"
      : "Järgmiseks: uus tund";

  return (
    <Card className="flex flex-col gap-3">
      <CardTitle>{heading}</CardTitle>
      <p className="text-ink">
        {next.kind === "continue"
          ? "Sul on üks tund pooleli. Lõpetatud tund annab ka kordamiskaardid."
          : "Kursuse järgmine tund ootab alustamist."}
      </p>
      <div>
        {manifest ? (
          <Link to={`/m/${manifest.slug}`} className={buttonClasses()}>
            {next.kind === "continue" ? "Jätka" : "Alusta"}: {manifest.title}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        ) : (
          <Link to="/kursus" className={buttonClasses()}>
            Ava kursus
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        )}
      </div>
    </Card>
  );
}

/** Kordamise seis: mis täna ootab ja mis on juba tehtud. */
function ReviewCard({
  overview,
  withLink,
}: {
  overview: CourseOverview;
  withLink: boolean;
}) {
  return (
    <Card className="flex flex-col gap-3">
      <CardTitle>Kordamine</CardTitle>
      {overview.dueCards > 0 ? (
        <p className="text-ink">
          Täna ootab {overview.dueCards} {cardWord(overview.dueCards)}.
        </p>
      ) : (
        <p className="text-ink">
          {overview.reviewedToday > 0
            ? `Tänane kordamine on tehtud – ${overview.reviewedToday} ${cardWord(overview.reviewedToday)} korratud.`
            : "Praegu ei oota ükski kaart. Kaardid tekivad siis, kui tunni lõpuni teed."}
        </p>
      )}
      {overview.dueCards > 0 && withLink ? (
        <div>
          <Link to="/kordamine" className={buttonClasses("secondary")}>
            Ava kordamine
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      ) : null}
    </Card>
  );
}

/**
 * Ühe ploki rida.
 *
 * Riba on ainult kordus sellest, mis on kõrval sõnades kirjas (`aria-hidden`):
 * värv ega pikkus ei ole kunagi ainus info kandja (docs/DISAINIJUHIS.md).
 */
function BlockRow({ block, number }: { block: BlockProgress; number: number }) {
  const percent = block.total === 0 ? 0 : Math.round((block.completed / block.total) * 100);

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-semibold text-ink">
          {number}. {block.title}
        </h3>
        <p className="text-sm text-ink-soft">{blockMeta(block)}</p>
      </div>

      {block.total > 0 ? (
        <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-brand-soft">
          <div className="h-full rounded-full bg-brand" style={{ width: `${percent}%` }} />
        </div>
      ) : null}
    </div>
  );
}

/**
 * Ploki olekutekst. Pooleli tundi mainime AINULT siis, kui neid on – muidu
 * loeks õpilane igal real „0 pooleli" ja lakkaks rida lugemast.
 */
function blockMeta(block: BlockProgress): string {
  if (block.total === 0) return "Tulekul";
  const done = `${block.completed}/${block.total} tehtud`;
  return block.started > 0 ? `${done}, ${block.started} pooleli` : done;
}

/** „1 kaart", aga „2 kaarti" – eesti keeles ei sobi üks vorm mõlemale. */
function cardWord(count: number): string {
  return count === 1 ? "kaart" : "kaarti";
}

/** Sama lugu tunniga: „Tehtud 1 tund 3-st", aga „Tehtud 2 tundi 3-st". */
function lessonWord(count: number): string {
  return count === 1 ? "tund" : "tundi";
}
