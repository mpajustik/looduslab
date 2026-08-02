import { z } from "zod";
import { stepQuestions } from "./contract";

/**
 * Moodulilepingu skeem (docs/MOODULILEPING.md).
 *
 * TÄHTIS – sama muster nagu kursusefailil (src/content/courseSchema.ts):
 * seda faili impordib AINULT test ja tüübituletus (src/engine/contract.ts
 * kaudu `import type`). Nii jääb zod toodangu bundle'ist välja, kuigi
 * manifest.ts ja activities.ts laaditakse igas brauseris. Moodulite sisu on
 * staatiline – piisab, kui CI valideerib selle üks kord.
 *
 * Hind: katkine moodul paistab välja testist, mitte brauserist. Seepärast ON
 * test (tests/contract.test.ts, tests/registry.test.ts) kohustuslik valvur.
 */

/** Pealkiri/tekst, mida õpilane näeb: "   " ei ole pealkiri. */
const nonEmpty = (what: string) =>
  z.string().refine((value) => value.trim().length > 0, {
    message: `${what} ei tohi olla tühi ega ainult tühikud`,
  });

/** Tekstiplokk: iga lõik eraldi reana, et vaade saaks nad ise vormistada. */
const bodySchema = z.array(nonEmpty("Lõik")).min(1);

// ---------------------------------------------------------------------------
// manifest.ts
// ---------------------------------------------------------------------------

/**
 * Aine. Loend on lühike meelega: sellest tuleneb id eesliide
 * (`physics.peegeldumisseadus`). Uue aine lisamine = üks kirje siia.
 */
const SUBJECTS = ["physics"] as const;

/** Mooduli id on igavene (CLAUDE.md reegel 11): kuju `physics.miski-nimi`. */
const moduleIdSchema = z
  .string()
  .regex(
    /^[a-z]+\.[a-z0-9]+(-[a-z0-9]+)*$/,
    "Mooduli id kuju peab olema nagu physics.peegeldumisseadus",
  );

/** Slug on URL-i osa (/m/:slug) ja samuti igavene. */
const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Slug tohib sisaldada ainult väiketähti, numbreid ja sidekriipse",
  );

/** Versioon muutub reeglite järgi (docs/MOODULILEPING.md „Versioonimine"). */
const versionSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, "Versiooni kuju on major.minor.patch, nt 1.0.0");

/** Ainekava õpitulemus, nt P1-T2 (sisu/AINEKAVA-fyysika-8.md). */
const outcomeSchema = z
  .string()
  .regex(/^P[1-9][0-9]*-T[1-9][0-9]*$/, "Õpitulemuse kuju on nagu P1-T2");

/** Ainekava praktiline töö, nt P1-PT3. */
const practicalWorkSchema = z
  .string()
  .regex(/^P[1-9][0-9]*-PT[1-9][0-9]*$/, "Praktilise töö kuju on nagu P1-PT3");

export const manifestSchema = z
  .strictObject({
    id: moduleIdSchema,
    slug: slugSchema,
    title: nonEmpty("Mooduli pealkiri"),
    subject: z.enum(SUBJECTS),
    /** Õpieesmärk ÕPILASE keeles: „Oskan ennustada, kuhu kiir peegeldub". */
    goal: nonEmpty("Õpieesmärk"),
    /** Ainekava seosed – ilma nendeta ei saa katvusraport (etapp 4.0) tööd teha. */
    outcomes: z.array(outcomeSchema).min(1),
    concepts: z.array(nonEmpty("Mõiste")).min(1),
    practicalWork: z.array(practicalWorkSchema),
    minutes: z.strictObject({
      demo: z.number().int().positive(),
      lesson: z.number().int().positive(),
      homework: z.number().int().nonnegative(),
    }),
    version: versionSchema,
    status: z.enum(["active", "archived"]),
    /** Ainult arhiveeritud moodulil: kumb moodul ta asendas. */
    replacedBy: moduleIdSchema.optional(),
  })
  // Slug-konventsioon: id = <subject>.<slug>. Tänu sellele tuletab /m/:slug
  // mooduli registrist ilma ühtegi manifesti laadimata.
  .refine((manifest) => manifest.id === `${manifest.subject}.${manifest.slug}`, {
    message: "Mooduli id peab olema täpselt <subject>.<slug>",
  })
  .refine(
    (manifest) => manifest.status === "archived" || !manifest.replacedBy,
    { message: "replacedBy käib ainult arhiveeritud mooduli juurde" },
  );

// ---------------------------------------------------------------------------
// Küsimused
// ---------------------------------------------------------------------------

/**
 * question_id on igavene (CLAUDE.md reegel 11) ja kujul
 * `<sammu-tüüp>-<number>`, nt practice-3. Kokkulangevust sammu tüübiga
 * kontrollib activitiesSchema – siin ainult kuju.
 */
const questionIdSchema = z
  .string()
  .regex(
    /^[a-z]+-[1-9][0-9]*$/,
    "Küsimuse id kuju on <sammu-tüüp>-<number>, nt practice-3",
  );

/** Kuni 2 vihjet (docs/MOODULILEPING.md) – rohkem on juba vastus. */
const hintsSchema = z.array(nonEmpty("Vihje")).min(1).max(2);

const numericQuestionSchema = z.strictObject({
  kind: z.literal("numeric"),
  id: questionIdSchema,
  prompt: nonEmpty("Küsimus"),
  hints: hintsSchema.optional(),
  /** Õige vastus arvuna, ühikus `unit`. */
  answer: z.number(),
  /** Nt "kPa", "°". Puudub, kui suurus on ühikuta. */
  unit: z.string().min(1).optional(),
  /** Lubatud viga: kas protsent vastusest või absoluutne samas ühikus. */
  tolerance: z.strictObject({
    mode: z.enum(["percent", "absolute"]),
    value: z.number().positive(),
  }),
  /**
   * Lõksud: teadaolev VALE vastus, mis reedab kindla väärarusaama
   * (nt nurk mõõdetuna pinna, mitte normaali suhtes). Checker (samm 1.4)
   * annab siis üldise „vale" asemel just selle tagasiside.
   */
  traps: z
    .array(
      z.strictObject({
        answer: z.number(),
        misconception: nonEmpty("Väärarusaama silt"),
        feedback: nonEmpty("Lõksu tagasiside"),
      }),
    )
    .min(1)
    .optional(),
});

const choiceOptionSchema = z.strictObject({
  id: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Variandi id kuju on nagu a või opt-1"),
  text: nonEmpty("Vastusevariant"),
  correct: z.boolean(),
  /** Väärarusaama silt käib VALE variandi juurde. */
  misconception: nonEmpty("Väärarusaama silt").optional(),
});

const choiceQuestionSchema = z
  .strictObject({
    kind: z.literal("choice"),
    id: questionIdSchema,
    prompt: nonEmpty("Küsimus"),
    hints: hintsSchema.optional(),
    options: z.array(choiceOptionSchema).min(2),
    /** true = mitu õiget vastust. Puudu või false = täpselt üks õige. */
    multiple: z.boolean().optional(),
  })
  .refine(
    (question) =>
      new Set(question.options.map((option) => option.id)).size ===
      question.options.length,
    { message: "Kahel vastusevariandil on sama id" },
  )
  .refine((question) => question.options.some((option) => option.correct), {
    message: "Vähemalt üks vastusevariant peab olema õige",
  })
  .refine(
    (question) =>
      question.multiple === true ||
      question.options.filter((option) => option.correct).length === 1,
    { message: "Ilma multiple: true-ta tohib õige olla täpselt üks variant" },
  )
  .refine(
    (question) =>
      question.options.every((option) => !option.correct || !option.misconception),
    { message: "Väärarusaama silt käib vale variandi, mitte õige juurde" },
  );

const textQuestionSchema = z.strictObject({
  kind: z.literal("text"),
  id: questionIdSchema,
  prompt: nonEmpty("Küsimus"),
  hints: hintsSchema.optional(),
  /** Nt 15 – vabatekst, mida ei hinnata, aga mille pikkust ootame. */
  minWords: z.number().int().positive().optional(),
});

export const questionSchema = z.discriminatedUnion("kind", [
  numericQuestionSchema,
  choiceQuestionSchema,
  textQuestionSchema,
]);

// ---------------------------------------------------------------------------
// Sammud
// ---------------------------------------------------------------------------

/** Sammu id kuju on sama mis küsimusel: `<tüüp>-<number>`, nt explore-1. */
const stepIdSchema = z
  .string()
  .regex(/^[a-z]+-[1-9][0-9]*$/, "Sammu id kuju on <tüüp>-<number>, nt explore-1");

/** Iga sammu ühisosa. */
const stepBase = {
  id: stepIdSchema,
  title: nonEmpty("Sammu pealkiri"),
};

const questionsSchema = z.array(questionSchema);

/**
 * Sammutüüpide register.
 *
 * Uue tüübi (video, experiment, game …) lisamine = üks kirje siia + komponent
 * StepShelli registrisse (samm 1.2). Olemasolevaid tüüpe EI kustutata ega
 * nimetata ümber – vanad vastused viitavad neile (docs/MOODULILEPING.md).
 */
export const stepSchemas = {
  /** Lühike teooria: max üks ekraan. Vastust ei ole. */
  theory: z.strictObject({ type: z.literal("theory"), ...stepBase, body: bodySchema }),
  /** Häälestav probleem või küsimus. Vastust ei ole. */
  hook: z.strictObject({ type: z.literal("hook"), ...stepBase, body: bodySchema }),
  /** 1–3 eelteadmiste küsimust. */
  precheck: z.strictObject({
    type: z.literal("precheck"),
    ...stepBase,
    questions: questionsSchema.min(1).max(3),
  }),
  /** Ennustus + põhjendus. Salvestatakse, EI hinnata; lukustub enne explore't. */
  predict: z.strictObject({
    type: z.literal("predict"),
    ...stepBase,
    body: bodySchema.optional(),
    questions: questionsSchema.min(1),
  }),
  /**
   * Simulatsioon ülesandega. Simulatsioonikomponendi väli lisandub sammus 1.8
   * (valikulise väljana – vt laiendamise raudreeglid).
   */
  explore: z.strictObject({
    type: z.literal("explore"),
    ...stepBase,
    body: bodySchema.optional(),
    questions: questionsSchema,
  }),
  /** Mõõtetabel: veerud ja ridade arv. Ridade kontroll lisandub sammus 1.11. */
  collect: z.strictObject({
    type: z.literal("collect"),
    ...stepBase,
    body: bodySchema.optional(),
    columns: z
      .array(
        z.strictObject({
          key: z
            .string()
            .regex(/^[a-z][a-zA-Z0-9]*$/, "Veeru võti on kujul nagu angleIn"),
          label: nonEmpty("Veeru pealkiri"),
          unit: z.string().min(1).optional(),
        }),
      )
      .min(2),
    rows: z.number().int().positive(),
  }),
  /** Väide–tõend–põhjendus vabatekstina. Õpetajale nähtav. */
  explain: z.strictObject({
    type: z.literal("explain"),
    ...stepBase,
    body: bodySchema.optional(),
    questions: questionsSchema.min(1),
  }),
  /** Ülesanded: näidis → osaline → iseseisev. */
  practice: z.strictObject({
    type: z.literal("practice"),
    ...stepBase,
    questions: questionsSchema.min(1),
  }),
  /** Väljumispilet: 2–3 küsimust. Õpetajale nähtav. */
  exit: z.strictObject({
    type: z.literal("exit"),
    ...stepBase,
    questions: questionsSchema.min(2).max(3),
  }),
} as const;

/** Sammutüüpide loend – tõe allikas on ülal olev register. */
export const STEP_TYPES = Object.keys(stepSchemas) as (keyof typeof stepSchemas)[];

export const stepSchema = z.discriminatedUnion("type", [
  stepSchemas.theory,
  stepSchemas.hook,
  stepSchemas.precheck,
  stepSchemas.predict,
  stepSchemas.explore,
  stepSchemas.collect,
  stepSchemas.explain,
  stepSchemas.practice,
  stepSchemas.exit,
]);

// ---------------------------------------------------------------------------
// activities.ts
// ---------------------------------------------------------------------------

export const reviewCardSchema = z.strictObject({
  id: z.string().regex(/^rc-[1-9][0-9]*$/, "Kordamiskaardi id kuju on rc-1"),
  type: z.enum(["concept", "calc", "graph", "explain", "transfer"]),
  question: nonEmpty("Kordamiskaardi küsimus"),
  answer: nonEmpty("Kordamiskaardi vastus"),
});

/** Ühe id-loendi kordused – veateade nimetab kordujad, mitte lihtsalt „viga". */
function duplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const twice = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) twice.add(id);
    seen.add(id);
  }
  return [...twice];
}

export const activitiesSchema = z
  .strictObject({
    steps: z.array(stepSchema).min(1),
    /** 3–6 kaarti, pilootmoodulitel kuni 10 (docs/MOODULILEPING.md). */
    reviewCards: z.array(reviewCardSchema).min(3).max(10),
  })
  .superRefine((activities, ctx) => {
    const stepIds = activities.steps.map((step) => step.id);
    for (const id of duplicates(stepIds)) {
      ctx.addIssue({ code: "custom", message: `Sammu id "${id}" kordub` });
    }

    const questionIds: string[] = [];
    for (const step of activities.steps) {
      // Sammu id eesliide peab olema sammu tüüp: explore-2, mitte samm-2.
      if (!step.id.startsWith(`${step.type}-`)) {
        ctx.addIssue({
          code: "custom",
          message: `Sammu "${step.id}" id peab algama tüübiga "${step.type}-"`,
        });
      }
      for (const question of stepQuestions(step)) {
        questionIds.push(question.id);
        // Sama reegel küsimusel – nii on vastuste tabelis kohe näha,
        // millisest sammust vastus tuli (docs/MOODULILEPING.md).
        if (!question.id.startsWith(`${step.type}-`)) {
          ctx.addIssue({
            code: "custom",
            message: `Küsimuse "${question.id}" id peab algama sammu tüübiga "${step.type}-"`,
          });
        }
      }
    }
    for (const id of duplicates(questionIds)) {
      ctx.addIssue({ code: "custom", message: `Küsimuse id "${id}" kordub` });
    }

    for (const id of duplicates(activities.reviewCards.map((card) => card.id))) {
      ctx.addIssue({ code: "custom", message: `Kordamiskaardi id "${id}" kordub` });
    }
  });
