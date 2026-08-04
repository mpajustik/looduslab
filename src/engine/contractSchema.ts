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

/**
 * Joonise silt, nt `peegeldumise-moisted`.
 *
 * Sama muster mis `featureSchema`-l: sildi tähendust teab ainult sama mooduli
 * figures.tsx – engine kannab teda edasi, aga ei tea, mida ta joonistab
 * (src/engine/figures.ts). Kuju on sama mis slugil, et kirjaviga oleks
 * silmatorkav; kooskõla registriga valvab test.
 *
 * Seisab siin (mitte sammude juures), sest teda kasutavad NII küsimused kui
 * ka sammud – ja `const` ei ole hoisted: allpool defineerituna oleks ta
 * küsimuseskeemide jaoks veel olematu.
 */
const figureIdSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Joonise silt tohib sisaldada ainult väiketähti, numbreid ja sidekriipse",
  );

/**
 * Lubatud viga: kas protsent vastusest või absoluutne samas ühikus.
 * Tolerants elab ALATI küsimuse juures, mitte manifest'is
 * (docs/MOODULILEPING.md) – sama kuju kasutab ka mõõtetabeli rea reegel.
 */
const toleranceSchema = z.strictObject({
  mode: z.enum(["percent", "absolute"]),
  value: z.number().positive(),
});

const numericQuestionSchema = z.strictObject({
  kind: z.literal("numeric"),
  id: questionIdSchema,
  prompt: nonEmpty("Küsimus"),
  hints: hintsSchema.optional(),
  /** Mooduli joonise silt – joonis ilmub küsimuse teksti ja vastuse vahele. */
  figure: figureIdSchema.optional(),
  /** Õige vastus arvuna, ühikus `unit`. */
  answer: z.number(),
  /** Nt "kPa", "°". Puudub, kui suurus on ühikuta. */
  unit: z.string().min(1).optional(),
  tolerance: toleranceSchema,
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
    /** Mooduli joonise silt – joonis ilmub küsimuse teksti ja vastuse vahele. */
    figure: figureIdSchema.optional(),
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
  /** Mooduli joonise silt – joonis ilmub küsimuse teksti ja vastuse vahele. */
  figure: figureIdSchema.optional(),
  /** Nt 15 – vabatekst, mida ei hinnata, aga mille pikkust ootame. */
  minWords: z.number().int().positive().optional(),
});

// ---------------------------------------------------------------------------
// Mõõtetabel
// ---------------------------------------------------------------------------

/** Veeru võti on koodinimi (mitte õpilase tekst) – tema järgi käib rea reegel. */
const columnKeySchema = z
  .string()
  .regex(/^[a-z][a-zA-Z0-9]*$/, "Veeru võti on kujul nagu angleIn");

const columnSchema = z
  .strictObject({
    key: columnKeySchema,
    label: nonEmpty("Veeru pealkiri"),
    /** Nt "°". Ilma selleta on veerg ühikuta arv. */
    unit: z.string().min(1).optional(),
    /**
     * Väärtuste lubatud vahemik – tavaliselt SIMULATSIOONI piirid (liuguri
     * min ja max). Ilma selleta läbiks kontrolli iga kaks võrdset arvu, ka
     * „10000 ja 10000", mida ekraanil kunagi ei olnud (Codexi ülevaatuse
     * leid 2026-08-03). Vahemik käib veeru, mitte veergudevahelise seose
     * kohta: ühes tabelis võib olla kaks eri suurust eri piiridega.
     */
    min: z.number().optional(),
    max: z.number().optional(),
  })
  .refine((column) => column.min === undefined || column.max === undefined || column.min <= column.max, {
    message: "Veeru min ei tohi olla suurem kui max",
  });

/**
 * Kuidas ÜHTE mõõtetabeli rida kontrollitakse.
 *
 * Diskrimineeriv union, millel on täna üks liige. Nii on uue seose lisamine
 * (moodul 2 vajab `p = ρgh`) LISANDUS, mitte olemasoleva muutmine – sama
 * raudreegel, mis sammutüüpidel ja checkeri registril
 * (docs/MOODULILEPING.md „Raudreeglid laiendamisel").
 *
 * **See ei ole teine füüsikamudel.** Reegel ütleb ainult, milline veerg peab
 * millisega kokku käima – MIKS see nii on, teab `model.ts` (CLAUDE.md reegel
 * 1). Test hoiab neid kahte kooskõlas.
 */
const equalColumnsRuleSchema = z.strictObject({
  kind: z.literal("equal-columns"),
  /** Kontrollitav veerg (õpilase loetud väärtus). */
  column: columnKeySchema,
  /** Veerg, millega ta peab võrduma. */
  equalsColumn: columnKeySchema,
  /**
   * Lugemistolerants, MITTE mõõtmisviga: simulatsioon on ideaalne, aga
   * õpilane loeb liugurilt ja tipib käsitsi (sisu/MOODUL-peegeldumisseadus.md).
   */
  tolerance: toleranceSchema,
});

const tableRuleSchema = z.discriminatedUnion("kind", [equalColumnsRuleSchema]);

const tableQuestionSchema = z
  .strictObject({
    kind: z.literal("table"),
    id: questionIdSchema,
    prompt: nonEmpty("Küsimus"),
    hints: hintsSchema.optional(),
    /** Mooduli joonise silt – joonis ilmub küsimuse teksti ja vastuse vahele. */
    figure: figureIdSchema.optional(),
    columns: z.array(columnSchema).min(2),
    /** Mitu rida õpilane täidab. */
    rows: z.number().int().positive(),
    /**
     * Selle veeru väärtused peavad ridade vahel ERINEMA („kolm eri nurka") –
     * ühest korratud väärtusest ei paista seaduspärasus välja.
     */
    distinctColumn: columnKeySchema.optional(),
    rule: tableRuleSchema,
  })
  .superRefine((question, ctx) => {
    const keys = new Set(question.columns.map((column) => column.key));
    if (keys.size !== question.columns.length) {
      ctx.addIssue({ code: "custom", message: "Kahel veerul on sama võti" });
    }
    // Olematule veerule osutav reegel ei kontrolliks MITTE MIDAGI ja seda ei
    // paneks keegi brauseris tähele – seepärast valvab seda skeem.
    for (const [field, key] of [
      ["rule.column", question.rule.column],
      ["rule.equalsColumn", question.rule.equalsColumn],
      ...(question.distinctColumn ? [["distinctColumn", question.distinctColumn]] : []),
    ] as const) {
      if (!keys.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: `${field} osutab veerule "${key}", mida tabelis ei ole`,
        });
      }
    }
    if (question.rule.column === question.rule.equalsColumn) {
      ctx.addIssue({
        code: "custom",
        message: "Veerg ei saa võrduda iseendaga – siis oleks iga vastus õige",
      });
    }
    // Kaht eri ühikus veergu ei saa omavahel võrrelda: „30 cm = 30 °" ei
    // tähenda midagi. Ühikuteisendus tabeli SEES oleks eraldi reegliliik.
    const unitOf = (key: string) => question.columns.find((column) => column.key === key)?.unit;
    if (
      keys.has(question.rule.column) &&
      keys.has(question.rule.equalsColumn) &&
      unitOf(question.rule.column) !== unitOf(question.rule.equalsColumn)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "equal-columns reegli mõlemal veerul peab olema sama ühik",
      });
    }
  });

export const questionSchema = z.discriminatedUnion("kind", [
  numericQuestionSchema,
  choiceQuestionSchema,
  textQuestionSchema,
  tableQuestionSchema,
]);

// ---------------------------------------------------------------------------
// Sammud
// ---------------------------------------------------------------------------

/** Sammu id kuju on sama mis küsimusel: `<tüüp>-<number>`, nt explore-1. */
const stepIdSchema = z
  .string()
  .regex(/^[a-z]+-[1-9][0-9]*$/, "Sammu id kuju on <tüüp>-<number>, nt explore-1");

/**
 * Simulatsiooni lisavõimaluse silt, nt `mattpind`.
 *
 * Sildi tähendust teab ainult sama mooduli Simulation.tsx – engine kannab teda
 * edasi, aga ei tõlgenda. Kuju on sama mis slugil, et ta oleks loetav ja
 * kirjavea korral silmatorkav.
 */
const featureSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Lisavõimaluse silt tohib sisaldada ainult väiketähti, numbreid ja sidekriipse",
  );

/**
 * Lahendatud näidis (practice-sammu ees).
 *
 * Vastus on omaette väli, mitte lahenduskäigu viimane rida: ekraanil peab
 * kohe paistma, KUS lahendus lõpeb. Näidisel ei ole id-d ega tolerantsi –
 * teda ei kontrollita kunagi, sest õpilane talle ei vasta.
 */
const workedExampleSchema = z.strictObject({
  prompt: nonEmpty("Näidisülesande tekst"),
  /** Lahenduskäik: üks mõttesamm rea kohta. */
  solution: bodySchema,
  answer: nonEmpty("Näidisülesande vastus"),
});

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
  /**
   * Lühike teooria: max üks ekraan. Vastust ei ole.
   *
   * `figure` on mooduli enda joonise silt (src/engine/figures.ts) – joonis
   * ilmub teksti järele. Mõistet on lihtsam näidata kui sõnadega ümber
   * jutustada, aga joonis EI ASENDA teksti: ekraanilugejaga õpilane peab
   * sammu ka ilma pildita läbima, seega `body` jääb kohustuslikuks.
   */
  theory: z.strictObject({
    type: z.literal("theory"),
    ...stepBase,
    body: bodySchema,
    figure: figureIdSchema.optional(),
  }),
  /** Häälestav probleem või küsimus. Vastust ei ole. */
  hook: z.strictObject({
    type: z.literal("hook"),
    ...stepBase,
    body: bodySchema,
    figure: figureIdSchema.optional(),
  }),
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
   * Simulatsioon ülesandega.
   *
   * Simulatsioonikomponent ise EI ole siin: moodulil on täpselt üks
   * `Simulation.tsx` (moodulileping) ja ta jõuab sammuni mooduli, mitte
   * sammuandmete kaudu – nii jääb activities.ts puhtaks andmeks, mida saab
   * zod-iga valideerida ja hiljem andmebaasi kanda. Siin on ainult see, mida
   * SAMM simulatsioonilt tahab: mis lisavõimalus millise ülesande järel avaneb.
   */
  explore: z.strictObject({
    type: z.literal("explore"),
    ...stepBase,
    body: bodySchema.optional(),
    questions: questionsSchema.min(1),
    simulation: z
      .strictObject({
        /**
         * Lisavõimalus avaneb alles siis, kui nimetatud küsimus on vastatud
         * (sisu/MOODUL-peegeldumisseadus.md: mattpinna lüliti avaneb pärast
         * ülesannet 2). Nii ei pea Simulation.tsx teadma ülesannetest midagi
         * ja samm ei pea teadma, mida lüliti teeb.
         */
        unlocks: z
          .array(
            z.strictObject({
              /** Sildi tunneb ära mooduli enda Simulation.tsx, nt "mattpind". */
              feature: featureSchema,
              afterQuestion: questionIdSchema,
            }),
          )
          .min(1),
      })
      .optional(),
  }),
  /**
   * Andmete kogumine simulatsioonist.
   *
   * Tabel ise on KÜSIMUS (`kind: "table"`), mitte sammu eriväli: nii jõuab ta
   * salvestusse, checkerini ja luku alla täpselt samu radu pidi mis iga teine
   * vastus – collect ei pea endale eraldi rada ehitama.
   */
  collect: z.strictObject({
    type: z.literal("collect"),
    ...stepBase,
    body: bodySchema.optional(),
    questions: questionsSchema.min(1),
  }),
  /** Väide–tõend–põhjendus vabatekstina. Õpetajale nähtav. */
  explain: z.strictObject({
    type: z.literal("explain"),
    ...stepBase,
    body: bodySchema.optional(),
    questions: questionsSchema.min(1),
    /**
     * Varasema küsimuse id, mille vastust õpilasele kõrval meelde tuletatakse
     * (sisu/MOODUL-peegeldumisseadus.md: „Võrdle oma ennustusega 3. sammust").
     * Peab osutama VAREM tulnud sammu küsimusele – seda valvab activitiesSchema.
     */
    recallQuestion: questionIdSchema.optional(),
  }),
  /** Ülesanded: näidis → osaline → iseseisev. */
  practice: z.strictObject({
    type: z.literal("practice"),
    ...stepBase,
    body: bodySchema.optional(),
    /**
     * Lahendatud näidis harjutamise ees (sisu/MOODUL-peegeldumisseadus.md
     * „practice" p 1). Ta EI ole küsimus: õpilane ei vasta talle, seega ta ei
     * lähe checkerini ega salvestusse. Kui näidis oleks lihtsalt `body`, ei
     * saaks ekraan teda ülesandest eristada – ja terve mustri mõte on, et
     * õpilane näeb enne oma katset ÜHT lahenduskäiku lõpuni.
     */
    worked: workedExampleSchema.optional(),
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
    /** Küsimused, mis on juba MÖÖDAS – meelde saab tuletada ainult neid. */
    const earlierQuestionIds = new Set<string>();
    for (const step of activities.steps) {
      // Sammu id eesliide peab olema sammu tüüp: explore-2, mitte samm-2.
      if (!step.id.startsWith(`${step.type}-`)) {
        ctx.addIssue({
          code: "custom",
          message: `Sammu "${step.id}" id peab algama tüübiga "${step.type}-"`,
        });
      }
      // Simulatsiooni lisavõimalus avaneb küsimuse järel – kui see küsimus on
      // ümber nimetatud või kustutatud, ei avaneks lüliti KUNAGI ja seda ei
      // paneks keegi brauseris tähele. Seepärast valvab seda skeem.
      if (step.type === "explore" && step.simulation) {
        const ownQuestionIds = new Set(step.questions.map((question) => question.id));
        const features: string[] = [];
        for (const unlock of step.simulation.unlocks) {
          features.push(unlock.feature);
          if (!ownQuestionIds.has(unlock.afterQuestion)) {
            ctx.addIssue({
              code: "custom",
              message: `Sammus "${step.id}" avaneb "${unlock.feature}" küsimuse "${unlock.afterQuestion}" järel, aga sellist küsimust selles sammus ei ole`,
            });
          }
        }
        for (const feature of duplicates(features)) {
          ctx.addIssue({
            code: "custom",
            message: `Sammus "${step.id}" on lisavõimalus "${feature}" kaks korda`,
          });
        }
      }

      // Meeldetuletus tagurpidi (tulevase sammu vastusele) jääks igaveseks
      // tühjaks – õpilane ei ole sellele veel vastanud. Vaikselt puuduv
      // ennustus on hullem kui punane test.
      if (step.type === "explain" && step.recallQuestion) {
        if (!earlierQuestionIds.has(step.recallQuestion)) {
          ctx.addIssue({
            code: "custom",
            message: `Samm "${step.id}" tuletab meelde küsimust "${step.recallQuestion}", aga sellele ei ole selleks hetkeks veel vastatud`,
          });
        }
      }

      for (const question of stepQuestions(step)) {
        questionIds.push(question.id);
        earlierQuestionIds.add(question.id);
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
