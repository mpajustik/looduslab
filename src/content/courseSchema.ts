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

/**
 * Pealkiri, mida õpilane näeb: tühikutest koosnev pealkiri EI kõlba.
 * `min(1)` üksi laseks läbi ka stringi "   ", mis lehel paistaks tühja
 * reana. Trimmimise asemel LÜKKAME tagasi – skeem jookseb ainult testis,
 * seega parandus peab jõudma faili, mitte kaduma mälus.
 */
const titleSchema = (what: string) =>
  z.string().refine((value) => value.trim().length > 0, {
    message: `${what} peab olema pealkiri (mitte tühi ega ainult tühikud)`,
  });

/**
 * Alateema = teine ja ÜHTLASI viimane tase.
 * `strictObject` = tundmatu võti on VIGA, mitte vaikimisi äravisatud. Nii
 * annab kolmas tase (`parts` alateema sees) või kirjaviga võtmenimes
 * punase testi, mitte vaikselt kaduma läinud sisu.
 */
export const partSchema = z.strictObject({
  title: titleSchema("Alateemal"),
  modules: moduleListSchema,
});

export const blockSchema = z
  .strictObject({
    title: titleSchema("Plokil"),
    /** Kas otse moodulid ... */
    modules: moduleListSchema.optional(),
    /** ... VÕI alateemad, kui plokk kasvab suureks. Mitte mõlemat. */
    parts: z.array(partSchema).min(1).optional(),
  })
  // Täpselt üks neist peab olemas olema. Ilma selleta oleks plokk, millel
  // on ainult pealkiri, "korras" – aga leht ei teaks, mida seal näidata.
  // Tühi plokk kirjuta `modules: []`, siis on kavatsus näha.
  .refine((block) => Boolean(block.modules) !== Boolean(block.parts), {
    message: "Plokil peab olema kas modules VÕI parts, täpselt üks neist",
  });

export const courseSchema = z.strictObject({
  /** Püsiv id – ära muuda (jagatud lingid ja andmebaas ripuvad selle küljes) */
  id: z.string().min(1),
  title: titleSchema("Kursusel"),
  blocks: z
    .array(blockSchema)
    .min(1)
    .refine(
      (blocks) => new Set(blocks.map((b) => b.title)).size === blocks.length,
      { message: "Kahel plokil on sama pealkiri" },
    ),
});
