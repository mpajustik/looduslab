import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import type { ReviewCard } from "../../engine/contract";
import {
  createReviewStore,
  dueReviewItems,
  isDue,
  reviewedToday,
  reviewKey,
  type ReviewItem,
  type ReviewResult,
} from "../../engine/review";
import { appNow } from "../../lib/devClock";
import { sharedReviewSync } from "../../lib/reviewRemote";
import { browserStorage } from "../../lib/storage";
import { moduleRegistry } from "../../modules/registry";
import { Button } from "../../ui/Button";
import { buttonClasses } from "../../ui/buttonStyles";
import { Card } from "../../ui/Card";
import { PageHeader } from "../../ui/PageHeader";

/**
 * Tänased kordamiskaardid (plaani samm 3.3).
 *
 * Kolm otsust, mis siin nähtavad on:
 *
 * 1. **Kaardi TEKST tuleb moodulist, ajastus seadmest.** Seadmes on ainult
 *    `moduleId + cardId + kuupäev` (src/engine/review.ts) – küsimuse sõnastus
 *    laaditakse iga kord uuesti `activities.reviewCards`-ist. Parandatud
 *    moodul parandab seega ka vanad kaardid ja ükski vana sõnastus ei jää
 *    õpilase seadmesse kinni.
 * 2. **Päeva kaardid valitakse ÜKS kord.** Järjekord ja valik pannakse paika
 *    lehe avamisel (`session`) ja hindamine liigutab ainult osutit. Kui
 *    arvutaksime loendi iga hinnangu järel uuesti, tuleks kümne kaardi piiri
 *    tagant kohe uued kaardid järele ja päev ei saaks kunagi otsa.
 * 3. **Hindab õpilane ise, mitte rakendus.** Kaardil on tekstiline vastus
 *    (moodulileping), mitte kontrollitav arv – seega „vaata → pööra → hinda".
 *    See ei riiva CLAUDE.md reeglit 3: siin ei otsusta õigsust ka mitte AI.
 */

/** Ühe mooduli kordamissisu: pealkiri ekraanile ja kaardid id järgi. */
type ModuleCards = {
  title: string;
  cards: Record<string, ReviewCard | undefined>;
};

type Session = {
  /** Tänased kaardid järjekorras – valitakse üks kord (vt otsus 2 ülal). */
  items: ReviewItem[];
  content: Record<string, ModuleCards | undefined>;
  /** Mitu kaarti on täna juba tehtud – eristab „päev tehtud" tühjast päevast. */
  doneToday: number;
  /** Kas mõne mooduli sisu jäi laadimata (kehv võrk). */
  failed: boolean;
};

export default function ReviewPage() {
  // Sama hoidla, mis mooduli lõpetamisel (src/engine/useModuleProgress.ts):
  // `persist`, sest kordamine ON õpilase päris töö. Preview't siia ei tule –
  // õpetaja „Vaata õpilasena" käib mooduli, mitte kordamise kaudu.
  const store = useMemo(
    () => createReviewStore("persist", browserStorage, sharedReviewSync()),
    [],
  );

  const [session, setSession] = useState<Session | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  /** Kasvab „Proovi uuesti" peale ja käivitab laadimise otsast peale. */
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // `appNow`, mitte `new Date()`: arenduses saab aega edasi kerida
    // (src/lib/devClock.ts), toodangus on see täpselt praegune hetk.
    const now = appNow();
    const all = store.list();
    const due = all.filter((item) => isDue(item, now));
    const moduleIds = [...new Set(due.map((item) => item.moduleId))];

    void Promise.all(moduleIds.map(loadModuleCards)).then((loaded) => {
      if (cancelled) return;

      const content: Record<string, ModuleCards | undefined> = {};
      for (const entry of loaded) {
        if (entry.value) content[entry.id] = entry.value;
      }

      // Kaart, mille tekst on kadunud (moodul kustutas ta või moodulit enam
      // registris ei ole), jäetakse vaikselt vahele: tühja küsimusega kaarti
      // ei saa korrata ja krahh oleks siin selgelt üle reageeritud.
      //
      // Ootel MITTE olevad kaardid jäävad loendisse alles: `dueReviewItems`
      // vajab neid päevapiiri arvutamiseks (täna juba hinnatud kaart ei ole
      // enam ootel, aga ta on päevast osa võtnud).
      const usable = all.filter(
        (item) => !isDue(item, now) || content[item.moduleId]?.cards[item.cardId],
      );
      setSession({
        items: dueReviewItems({ items: usable, now }),
        content,
        doneToday: reviewedToday(all, now),
        // Ainult võrgu- või laadimisviga. Puuduv moodul registris (arhiveeritud)
        // on tavaline vananemine, mitte rike, mille pärast õpilast tüüdata.
        failed: loaded.some((entry) => entry.failed),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [store, attempt]);

  if (session === null) {
    return <PageHeader title="Kordamine" lead="Laen tänaseid kaarte …" />;
  }

  if (session.items.length === 0) {
    // Kolm eri tühja päeva, kolm eri lauset. Kõige tähtsam on VIGA: ilma
    // selleta ütleks leht kehva võrgu korral vaikselt „ei ole midagi
    // korrata", kuigi kaardid on olemas (Codexi ülevaatuse leid 2026-08-07).
    if (session.failed) {
      return (
        <LoadFailedState
          // `null` toob laadimisteate tagasi. Lähtestamine käib SIIN, mitte
          // efekti sees: efektis olev setState tekitaks kaskaadi (ESLint
          // react-hooks/set-state-in-effect).
          onRetry={() => {
            setSession(null);
            setAttempt((current) => current + 1);
          }}
        />
      );
    }
    if (session.doneToday > 0) return <DoneState total={session.doneToday} />;
    return <EmptyState />;
  }

  const total = session.items.length;
  const item = session.items[index];
  // Päeva kokku: enne lehe avamist tehtud + selles seansis läbitud.
  const doneToday = session.doneToday + index;

  if (item === undefined) {
    return <DoneState total={doneToday} />;
  }

  const moduleCards = session.content[item.moduleId];
  const card = moduleCards?.cards[item.cardId];
  // Kaardid on eespool juba sisu järgi filtreeritud – siia jõuab ainult
  // olemasolev kaart. TypeScript seda ei tea, seega üks vaikne vahelejätt.
  if (!moduleCards || !card) {
    return <DoneState total={doneToday} />;
  }

  const grade = (result: ReviewResult) => {
    // Ka hindamine käib nihutatud kella järgi – muidu arvutaks „+7 päeva"
    // režiimis antud hinnang uue tähtaja päris tänasest ja kaart kaoks
    // nädalaks ära.
    store.grade(item.moduleId, item.cardId, result, appNow());
    setFlipped(false);
    setIndex((current) => current + 1);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Kordamine"
        lead="Mõtle vastus ise välja, alles siis pööra kaart ümber."
      />

      <p className="text-ink-soft" aria-live="polite">
        Kaart {index + 1} / {total}
      </p>

      {/* Osa kaarte jäi laadimata, aga midagi on ikka näidata: ütleme selle
          välja, mitte ei vaiki maha. */}
      {session.failed ? (
        <p className="rounded-xl bg-retry-soft p-3 text-ink">
          Osa kaarte jäi laadimata (ilmselt katkes internetiühendus). Nad
          ootavad edasi ja tulevad ette järgmisel korral.
        </p>
      ) : null}

      {/* Võti sunnib uue kaardi peale uue DOM-i: ilma selleta jääks pööratud
          kaardi kõrgus ja fookus eelmise oma. */}
      <Card key={reviewKey(item.moduleId, item.cardId)} className="flex flex-col gap-4">
        <p className="text-sm font-medium text-ink-soft">{moduleCards.title}</p>
        <p className="text-xl text-ink sm:text-2xl">{card.question}</p>

        {flipped ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl bg-brand-soft p-4">
              <h2 className="text-sm font-semibold text-ink-soft">Vastus</h2>
              <p className="mt-1 text-lg text-ink">{card.answer}</p>
            </div>

            <fieldset className="flex flex-col gap-3">
              <legend className="mb-2 font-medium text-ink">Kui hästi meenus?</legend>
              {/* Kolm nuppu, kolm eri sõna – värv ei ole ainus info kandja
                  (docs/DISAINIJUHIS.md). Telefonis üksteise all, laiemal
                  ekraanil kõrvuti. */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="danger" onClick={() => grade("again")}>
                  Ei mäletanud
                </Button>
                <Button variant="secondary" onClick={() => grade("hard")}>
                  Raskelt
                </Button>
                <Button onClick={() => grade("good")}>Teadsin</Button>
              </div>
            </fieldset>
          </div>
        ) : (
          <div>
            <Button size="lg" onClick={() => setFlipped(true)}>
              Näita vastust
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

/**
 * Ühe mooduli kaardid registrist.
 *
 * `failed` eristab kahte täiesti erinevat „ei saanud kaarte": PUUDUV moodul
 * (arhiveeritud, CLAUDE.md reegel 11 – tavaline vananemine, õpilasele ei
 * kaeba) ja LAADIMATA moodul (kehv võrk – seda peab õpilane teada saama,
 * muidu ütleb leht vaikselt „ei ole midagi korrata").
 */
async function loadModuleCards(
  id: string,
): Promise<{ id: string; value: ModuleCards | null; failed: boolean }> {
  const loader = moduleRegistry[id];
  if (!loader) return { id, value: null, failed: false };

  try {
    const { manifest, activities } = await loader();
    const cards: Record<string, ReviewCard | undefined> = {};
    for (const card of activities.reviewCards) cards[card.id] = card;
    return { id, value: { title: manifest.title, cards }, failed: false };
  } catch {
    // Kuupäevi see ei puuduta – kaardid jäävad ootele ja tulevad ette siis,
    // kui võrk töötab.
    return { id, value: null, failed: true };
  }
}

function LoadFailedState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Kordamine"
        lead="Kaardid on olemas, aga nende teksti ei õnnestunud laadida."
      />
      <Card className="flex flex-col gap-3">
        <p className="text-ink">
          Tavaliselt on põhjus katkenud internetiühendus. Kaardid ise on alles
          ja ootavad edasi – proovi natukese aja pärast uuesti.
        </p>
        <div>
          <Button onClick={onRetry}>Proovi uuesti</Button>
        </div>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Kordamine"
        lead="Praegu ei ole midagi korrata – kõik kaardid on tehtud või ootavad veel."
      />
      <Card className="flex flex-col gap-3">
        <p className="text-ink">
          Kordamiskaardid tekivad siia siis, kui oled mooduli lõpuni teinud.
          Esimesed kaardid ootavad juba järgmisel päeval.
        </p>
        <div>
          <Link to="/kursus" className={buttonClasses()}>
            Jätka kursusega
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </Card>
    </div>
  );
}

function DoneState({ total }: { total: number }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tänane kordamine on tehtud"
        lead={`${total} ${total === 1 ? "kaart" : "kaarti"} korratud. Järgmised kaardid ootavad juba uuel päeval.`}
      />
      <Card className="flex flex-col gap-3">
        <p className="text-ink">
          Hästi meelde jäänud kaardid tulevad harvemini, raskemad varsti uuesti.
        </p>
        <div>
          <Link to="/kursus" className={buttonClasses()}>
            Jätka kursusega
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
