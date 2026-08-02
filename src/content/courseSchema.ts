import { z } from "zod";

/**
 * Kursusefaili skeem (docs/SISUHALDUS.md).
 *
 * Miks skeem, kui TypeScript juba tüüpe kontrollib? TypeScript vaatab
 * KUJU (kas väli on string), skeem vaatab REEGLEID: pealkiri ei ole tühi,
 * sügavus jääb kahte tasemesse, sama moodulit ei ole ühes loendis kaks
 * korda. Need on vead, mida tüüp ei näe, aga õpilane näeks.
 *
 * TÄHTIS: seda faili impordib AINULT test (tests/course.test.ts) ja
 * tüübituletus (src/content/schema.ts kaudu `import type`). Nii jääb zod
 * toodangu bundle'ist täiesti välja – mõõtmine näitas 60 kB (16 kB
 * pakituna) ehk viiendiku kogu bundle'ist, ja seda staatilise faili
 * kontrollimiseks, mille CI on juba läbi lugenud (CLAUDE.md reegel 13).
 * Katkine kursusefail = punane CI, mitte suurem leht igale õpilasele.
 */

/** Mooduli id on igavene (CLAUDE.md reegel 11): kuju `physics.miski-nimi`. */
const moduleIdSchema = z
  .string()
  .regex(
    /^[a-z]+\.[a-z0-9-]+$/,
    "Mooduli id kuju peab olema nagu physics.peegeldumisseadus",
  );

/** Sama moodulit ei tohi ühes loendis kaks korda olla (kopeerimisviga). */
const moduleListSchema = z
  .array(moduleIdSchema)
  .refine((ids) => new Set(ids).size === ids.length, {
    message: "Sama mooduli id kordub ühes loendis",
  });

/** Alateema = teine ja ÜHTLASI viimane tase (sügavamale minna ei saa). */
export const partSchema = z.object({
  title: z.string().min(1, "Alateemal peab olema pealkiri"),
  modules: moduleListSchema,
});

export const blockSchema = z
  .object({
    title: z.string().min(1, "Plokil peab olema pealkiri"),
    /** Kas otse moodulid ... */
    modules: moduleListSchema.optional(),
    /** ... VÕI alateemad, kui plokk kasvab suureks. Mitte mõlemat. */
    parts: z.array(partSchema).optional(),
  })
  .refine((block) => !(block.modules && block.parts), {
    message: "Plokil on kas modules VÕI parts, mitte mõlemad",
  });

export const courseSchema = z.object({
  /** Püsiv id – ära muuda (jagatud lingid ja andmebaas ripuvad selle küljes) */
  id: z.string().min(1),
  title: z.string().min(1),
  blocks: z
    .array(blockSchema)
    .min(1)
    .refine(
      (blocks) => new Set(blocks.map((b) => b.title)).size === blocks.length,
      { message: "Kahel plokil on sama pealkiri" },
    ),
});
