import { describe, expect, it } from "vitest";
import {
  countableReviewItems,
  existingReviewItems,
  loadReviewContent,
  possibleReviewItems,
  type ReviewContent,
} from "../src/app/reviewContent";
import type { Activities, ModuleManifest } from "../src/engine/contract";
import type { ReviewItem } from "../src/engine/review";
import type { ModuleLoader } from "../src/modules/registry";

/**
 * „Mis kaardid on päriselt olemas" (plaani samm 3.6 viimane punkt).
 *
 * Testitav asi on ainult FILTER: ekraanile jõudmine on kahe lehe töö. Register
 * on siin võlts, sest päris moodulid muutuvad – test, mis eeldab, et
 * `physics.vedeliku-rohk`-il on kaart `rc-2`, läheb katki esimese sisumuudatuse
 * peale ega ütleks meile siis mitte midagi filtri kohta.
 */

const NOW = new Date("2026-08-08T10:00:00");

function item(partial: Partial<ReviewItem> & Pick<ReviewItem, "moduleId" | "cardId">): ReviewItem {
  return {
    dueDate: "2026-08-08",
    intervalDays: 3,
    lastResult: "good",
    updatedAt: "2026-08-07T10:00:00.000Z",
    ...partial,
  };
}

/** Nii vähe moodulit, kui `loadReviewContent` päriselt kasutab. */
function fakeModule(title: string, cardIds: string[]): ModuleLoader {
  return async () => ({
    manifest: { title } as ModuleManifest,
    activities: {
      reviewCards: cardIds.map((id) => ({
        id,
        type: "concept" as const,
        question: `Küsimus ${id}`,
        answer: `Vastus ${id}`,
      })),
    } as Activities,
  });
}

const registry: Record<string, ModuleLoader> = {
  "physics.olemas": fakeModule("Olemasolev moodul", ["rc-1", "rc-2"]),
  "physics.katki": async () => {
    throw new Error("võrk katki");
  },
};

describe("possibleReviewItems", () => {
  it("jätab alles registris oleva mooduli kaardid", () => {
    const kept = item({ moduleId: "physics.olemas", cardId: "rc-1" });
    expect(possibleReviewItems([kept], registry)).toEqual([kept]);
  });

  it("viskab välja arhiveeritud mooduli kaardid", () => {
    const gone = item({ moduleId: "physics.arhiveeritud", cardId: "rc-1" });
    expect(possibleReviewItems([gone], registry)).toEqual([]);
  });

  it("ei lase moodulil nimega toString registrist läbi", () => {
    // `registry[id]` leiaks Object.prototype pealt funktsiooni ja peaks
    // moodulit olemasolevaks – seepärast `Object.hasOwn`.
    const fake = item({ moduleId: "toString", cardId: "rc-1" });
    expect(possibleReviewItems([fake], registry)).toEqual([]);
  });
});

describe("loadReviewContent", () => {
  it("laadib ainult ootel kaartide moodulid", async () => {
    const content = await loadReviewContent({
      items: [
        item({ moduleId: "physics.olemas", cardId: "rc-1" }),
        // Tulevikus – tema moodulit ei ole vaja laadida.
        item({ moduleId: "physics.katki", cardId: "rc-9", dueDate: "2026-09-01" }),
      ],
      now: NOW,
      registry,
    });

    expect(Object.keys(content.modules)).toEqual(["physics.olemas"]);
    // Katkine moodul jäi laadimata, aga teda EI OLNUD vaja – seega ei ole viga.
    expect(content.failed).toBe(false);
  });

  it("märgib laadimisvea, aga mitte puuduvat moodulit", async () => {
    const broken = await loadReviewContent({
      items: [item({ moduleId: "physics.katki", cardId: "rc-1" })],
      now: NOW,
      registry,
    });
    expect(broken.failed).toBe(true);

    const archived = await loadReviewContent({
      items: [item({ moduleId: "physics.arhiveeritud", cardId: "rc-1" })],
      now: NOW,
      registry,
    });
    expect(archived.failed).toBe(false);
  });
});

describe("existingReviewItems", () => {
  it("viskab välja kaardi, mille küsimus on moodulist eemaldatud", async () => {
    const content = await loadReviewContent({
      items: [item({ moduleId: "physics.olemas", cardId: "rc-1" })],
      now: NOW,
      registry,
    });

    const kept = item({ moduleId: "physics.olemas", cardId: "rc-1" });
    const removed = item({ moduleId: "physics.olemas", cardId: "rc-7" });

    expect(
      existingReviewItems({ items: [kept, removed], content, now: NOW }),
    ).toEqual([kept]);
  });

  it("viskab luhtunud laadimise korral kaardid välja", async () => {
    // Kordamisleht TAHAB seda: teksti ei ole, kaarti ei saa näidata. Ta ütleb
    // selle eest õpilasele „osa kaarte jäi laadimata".
    const content = await loadReviewContent({
      items: [item({ moduleId: "physics.katki", cardId: "rc-1" })],
      now: NOW,
      registry,
    });

    const card = item({ moduleId: "physics.katki", cardId: "rc-1" });
    expect(existingReviewItems({ items: [card], content, now: NOW })).toEqual([]);
  });

  it("hoiab alles kaardid, mis ei ole täna ootel", () => {
    // Täna juba hinnatud kaart ei ole ootel, aga `reviewedToday` loeb teda –
    // filter ei tohi teda päevaarvestusest välja visata.
    const later = item({ moduleId: "physics.arhiveeritud", cardId: "rc-1", dueDate: "2026-09-01" });
    const content: ReviewContent = { modules: {}, failed: false };

    expect(existingReviewItems({ items: [later], content, now: NOW })).toEqual([later]);
  });
});

describe("countableReviewItems", () => {
  it("langeb luhtunud laadimise korral tagasi optimistlikule reeglile", async () => {
    // Codexi ülevaatuse leid 2026-08-08: edenemisleht kutsus filtrit alles
    // pärast serverist tõmbamist. Kui laadimine luhtus, jäi arv PULL-EELSEKS
    // ja leht ütles „ei oota ükski kaart", kuigi kaart oli just seadmesse
    // lisatud. Luhtunud laadimine ei tohi kaarti ei kaotada ega varjata.
    const content = await loadReviewContent({
      items: [item({ moduleId: "physics.katki", cardId: "rc-1" })],
      now: NOW,
      registry,
    });
    expect(content.failed).toBe(true);

    const card = item({ moduleId: "physics.katki", cardId: "rc-1" });
    expect(
      countableReviewItems({ items: [card], content, now: NOW, registry }),
    ).toEqual([card]);
  });

  it("kasutab õnnestunud laadimise korral täpset reeglit", async () => {
    const content = await loadReviewContent({
      items: [item({ moduleId: "physics.olemas", cardId: "rc-1" })],
      now: NOW,
      registry,
    });

    const kept = item({ moduleId: "physics.olemas", cardId: "rc-1" });
    const removed = item({ moduleId: "physics.olemas", cardId: "rc-7" });

    expect(
      countableReviewItems({ items: [kept, removed], content, now: NOW, registry }),
    ).toEqual([kept]);
  });
});
