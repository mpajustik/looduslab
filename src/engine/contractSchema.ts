import { z } from "zod";
import { maxDelta } from "../checker/number";
import { stepQuestions } from "./contract";
import { placeholdersIn } from "./placeholders";

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

/**
 * Lõksud: teadaolev VALE vastus, mis reedab kindla väärarusaama
 * (nt nurk mõõdetuna pinna, mitte normaali suhtes). Checker (samm 1.4)
 * annab siis üldise „vale" asemel just selle tagasiside.
 */
const trapsSchema = z
  .array(
    z.strictObject({
      answer: z.number(),
      misconception: nonEmpty("Väärarusaama silt"),
      feedback: nonEmpty("Lõksu tagasiside"),
    }),
  )
  .min(1);

type NumericTraps = z.infer<typeof trapsSchema>;

/**
 * Variandi id on IGAVENE, nagu küsimuse oma: ta salvestub vastuse juurde
 * (`AnswerPayload.variantId`), et õpetaja koondvaade teaks, MILLISELE
 * küsimusele õpilane vastas. Ümber nimetatud variant lõhub vanad vastused.
 */
const variantIdSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Variandi id kuju on nagu v1 või suur-nurk",
  );

const placeholderKeySchema = z
  .string()
  .regex(/^[a-zA-Z][a-zA-Z0-9]*$/, "Kohahoidja nimi on kujul nagu nurk");

/**
 * Üks arvvariant: kohahoidjate väärtused + selle variandi õige vastus.
 *
 * Vastus on siin KIRJAS, mitte arvutatud: valemit `activities.ts`-i ei panda,
 * sest füüsika elab ainult `model.ts`-is (CLAUDE.md reegel 1). Variandi arvud
 * kontrollib üle test (tests/peegeldumisseadus.model.test.ts), mis küsib
 * vastuse mudelilt.
 */
const numericVariantSchema = z.strictObject({
  id: variantIdSchema,
  /** Kohahoidja nimi → arv, mis läheb küsimuse teksti. */
  values: z.record(placeholderKeySchema, z.number()),
  /** Selle variandi õige vastus, ühikus `unit`. */
  answer: z.number(),
  /** Lõks käib variandi juurde: vale vastus sõltub antud arvust. */
  traps: trapsSchema.optional(),
});

const numericQuestionSchema = z
  .strictObject({
    kind: z.literal("numeric"),
    id: questionIdSchema,
    prompt: nonEmpty("Küsimus"),
    hints: hintsSchema.optional(),
    /** Mooduli joonise silt – joonis ilmub küsimuse teksti ja vastuse vahele. */
    figure: figureIdSchema.optional(),
    /** Õige vastus arvuna, ühikus `unit`. Variantidega küsimusel on ta variandi sees. */
    answer: z.number().optional(),
    /** Nt "kPa", "°". Puudub, kui suurus on ühikuta. */
    unit: z.string().min(1).optional(),
    tolerance: toleranceSchema,
    traps: trapsSchema.optional(),
    /**
     * Arvuvariandid: sama küsimus eri arvudega (docs/MOODULILEPING.md
     * „Juhuslikkus"). Kui nad on olemas, on `prompt` mall (`{nurk}`) ja
     * õige vastus elab variandi sees – engine valib ühe variandi
     * moodulikäigu alguses (src/engine/resolve.ts).
     */
    variants: z.array(numericVariantSchema).min(2).optional(),
  })
  .superRefine((question, ctx) => {
    const placeholders = placeholdersIn([question.prompt, ...(question.hints ?? [])]);

    // Lõks, mis mahub tolerantsi sisse, ei saa KUNAGI tööle: checker vaatab
    // enne, kas vastus on õige, ja alles siis lõkse (src/checker/numeric.ts).
    // Õpilane saaks „Õige!" ja väärarusaama tagasiside jääks igaveseks
    // andmata – vaikne auk, mida brauseris ei paista (CodeRabbit 2026-08-04).
    const checkTraps = (answer: number, traps: NumericTraps | undefined, where: string) => {
      const delta = maxDelta(answer, question.tolerance);
      for (const trap of traps ?? []) {
        if (Math.abs(trap.answer - answer) <= delta) {
          ctx.addIssue({
            code: "custom",
            message: `${where}: lõks ${trap.answer} mahub õige vastuse ${answer} tolerantsi sisse – checker ei jõuaks temani kunagi`,
          });
        }
      }
    };

    if (!question.variants) {
      if (question.answer !== undefined) {
        checkTraps(question.answer, question.traps, "Küsimus");
      }
    } else {
      for (const variant of question.variants) {
        checkTraps(variant.answer, variant.traps, `Variant "${variant.id}"`);
      }
    }

    if (!question.variants) {
      if (question.answer === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "Arvküsimusel peab olema kas `answer` või `variants`",
        });
      }
      // Kohahoidja ilma variantideta jõuaks õpilase ekraanile TEKSTINA
      // („Sea langemisnurk {nurk}°") – seda ei paneks keegi enne tundi tähele.
      for (const name of placeholders) {
        ctx.addIssue({
          code: "custom",
          message: `Küsimuses on kohahoidja "{${name}}", aga variante ei ole – kohahoidja jõuaks nii õpilase ekraanile`,
        });
      }
      return;
    }

    // Variandid ANNAVAD vastuse. Kaks tõe allikat tähendaks, et keegi peab
    // meeles pidama, kumb võidab – ja ühel päeval peab valesti.
    if (question.answer !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Variantidega küsimusel ei ole oma `answer`-it – vastus on variandi sees",
      });
    }
    if (question.traps) {
      ctx.addIssue({
        code: "custom",
        message: "Variantidega küsimusel käivad lõksud variandi juurde, mitte küsimuse juurde",
      });
    }
    if (placeholders.size === 0) {
      ctx.addIssue({
        code: "custom",
        message:
          "Variantidega küsimuse tekstis peab olema vähemalt üks kohahoidja, nt {nurk} – muidu näeksid kõik variandid ühesugused välja",
      });
    }
    for (const id of duplicates(question.variants.map((variant) => variant.id))) {
      ctx.addIssue({ code: "custom", message: `Variandi id "${id}" kordub` });
    }
    // Iga variant peab katma TÄPSELT need kohahoidjad, mis tekstis on: puuduv
    // väärtus jätaks ekraanile „{nurk}", üleliigne oleks vaikselt kasutamata.
    for (const variant of question.variants) {
      const keys = new Set(Object.keys(variant.values));
      for (const name of placeholders) {
        if (!keys.has(name)) {
          ctx.addIssue({
            code: "custom",
            message: `Variandil "${variant.id}" puudub väärtus kohahoidjale "{${name}}"`,
          });
        }
      }
      for (const key of keys) {
        if (!placeholders.has(key)) {
          ctx.addIssue({
            code: "custom",
            message: `Variandi "${variant.id}" väärtust "${key}" ei kasuta ükski kohahoidja`,
          });
        }
      }
    }
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
    /**
     * false = variandid jäävad autori järjekorda. Puudu või true = engine
     * segab nad iga moodulikäigu alguses (src/engine/resolve.ts).
     *
     * Segamine on VAIKIMISI sees, sest kordamisel jääb meelde järjekord, mitte
     * sisu (katsetus 2026-08-04). Välja lülita seal, kus järjekord ise kannab
     * tähendust: arvud kasvavas reas (15°, 30°, 60°) või „kõik eelnevad",
     * mis peab jääma viimaseks.
     */
    shuffle: z.boolean().optional(),
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
// Märgi joonisele
// ---------------------------------------------------------------------------

/**
 * Koha ja nime id-d on IGAVESED (CLAUDE.md reegel 11): koha id salvestub
 * vastuse võtmena ja nime id vastuse väärtusena
 * (`AnswerPayload.label.picks`). Ümber nimetatud id muudab vana vastuse
 * kontrollimatuks – sama lugu mis valikvastuse variandi id-l.
 */
const labelIdSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Koha või nime id kuju on nagu langev-kiir või s1",
  );

/**
 * Üks koht joonisel.
 *
 * `marker` on number, mille JOONIS ise selle koha juurde joonistab (①, ②).
 * Rakendus koordinaate ei tea: kus number joonisel asub, teab ainult mooduli
 * enda figures.tsx – täpselt nagu joonise sildi puhul (src/engine/figures.ts).
 * Nii ei pea ükski koordinaat elama kahes failis ja joonis mahub 360 px
 * ekraanile nii, nagu autor ta joonistas (kasutaja otsus 2026-08-22).
 */
const labelSpotSchema = z.strictObject({
  id: labelIdSchema,
  /** Number joonisel. Skeem nõuab, et kohti oleks 1 … n ilma aukudeta. */
  marker: z.number().int().positive(),
  /** Selle koha õige nimi – viide `names`-loendi kirjele. */
  answer: labelIdSchema,
});

/**
 * Üks nimi valikuloendis. Nimesid tohib olla kohtadest ROHKEM – üleliigne nimi
 * on eksitaja (nt „valguse kiirus"), mis ei kuulu ühegi koha juurde.
 */
const labelNameSchema = z.strictObject({
  id: labelIdSchema,
  text: nonEmpty("Nimi"),
});

/**
 * „Märgi joonisele": joonisel on nummerdatud kohad ja õpilane seab igale
 * kohale õige nime (plaan/LUHITOOD.md etapp A).
 *
 * Miks sildistamine, mitte vabakäejoonistus: vabalt joonistatud kiire õigsust
 * ei saa checker deterministlikult otsustada (CLAUDE.md reegel 3). Õpieesmärk
 * – „kas ta tunneb joonise osad ära" – saab sildistamisega täidetud ja on
 * lõpuni kontrollitav.
 *
 * Loosimine sellele liigile EI kehti: sama joonis, samad kohad, sama nimede
 * järjekord ka uuel katsel (plaan/LUHITOOD.md O2). `resolve.ts` laseb tundmatu
 * liigi muutmata läbi – see lause on siin selleks, et keegi ei läheks talle
 * hiljem „ühtluse mõttes" segamist lisama.
 */
const labelQuestionSchema = z
  .strictObject({
    kind: z.literal("label"),
    id: questionIdSchema,
    prompt: nonEmpty("Küsimus"),
    hints: hintsSchema.optional(),
    /**
     * Siin on joonis KOHUSTUSLIK, erinevalt teistest liikidest: ilma jooniseta
     * ei ole numbreid, mille juurde nime panna, ja küsimus oleks mõttetu.
     */
    figure: figureIdSchema,
    spots: z.array(labelSpotSchema).min(2),
    names: z.array(labelNameSchema).min(2),
  })
  .superRefine((question, ctx) => {
    for (const id of duplicates(question.spots.map((spot) => spot.id))) {
      ctx.addIssue({ code: "custom", message: `Koha id "${id}" kordub` });
    }
    for (const id of duplicates(question.names.map((name) => name.id))) {
      ctx.addIssue({ code: "custom", message: `Nime id "${id}" kordub` });
    }
    // Ka NÄHTAV tekst peab olema ainus omataoline. Kaks eri id-ga, aga sama
    // tekstiga nime annaks rippmenüüsse kaks ühesugust rida, millest üks on
    // õige ja teine vale – õpilane ei saaks neid kuidagi eristada ja
    // brauserist see välja ei paista (CodeRabbiti ülevaatuse leid 2026-08-22).
    for (const text of duplicates(question.names.map((name) => name.text.trim()))) {
      ctx.addIssue({ code: "custom", message: `Nimi "${text}" kordub` });
    }

    // Numbrid peavad olema 1 … n. Auk loendis (1, 2, 4) tähendaks, et joonisel
    // on number, mille juurde ei käi ühtegi rippmenüüd – või vastupidi. Seda
    // ei paistaks brauserist välja enne, kui õpilane selle ees istub.
    const markers = [...question.spots.map((spot) => spot.marker)].sort((a, b) => a - b);
    const expected = question.spots.map((_, index) => index + 1);
    if (markers.join(",") !== expected.join(",")) {
      ctx.addIssue({
        code: "custom",
        message: `Kohtade numbrid peavad olema 1 … ${question.spots.length} ilma aukudeta, praegu on ${markers.join(", ")}`,
      });
    }

    const nameIds = new Set(question.names.map((name) => name.id));
    for (const spot of question.spots) {
      // Olematule nimele osutav koht ei oleks KUNAGI õigesti vastatav: nime ei
      // ole loendis, seega õpilane ei saaks teda validagi.
      if (!nameIds.has(spot.answer)) {
        ctx.addIssue({
          code: "custom",
          message: `Koha "${spot.id}" õige nimi "${spot.answer}" puudub nimede loendist`,
        });
      }
    }

    // Üks nimi ei tohi olla õige kahes kohas: siis oleks õigeid vastuseid
    // rohkem kui üks ja checker peaks arvama, kumba autor mõtles.
    for (const id of duplicates(question.spots.map((spot) => spot.answer))) {
      ctx.addIssue({
        code: "custom",
        message: `Nimi "${id}" on õige vastus mitmes kohas – iga koht saab täpselt ühe oma nime`,
      });
    }
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
    /**
     * Simulatsiooni liuguri SAMM – väärtus peab olema selle kordne.
     *
     * Vahemikust üksi ei piisa (Codexi ülevaatuse leid 2026-08-04): vedeliku
     * rõhu liugur liigub 0,1 m kaupa, seega sügavus 0,05 m on vahemikus, on
     * teiste punktidega ilusti ühel sirgel – ja seda ei olnud kunagi ekraanil.
     * Ilma sammuta saab tabeli õigeks väljamõeldud sirgega, mis on täpselt
     * see, mida collect-samm välistama peab.
     */
    step: z.number().positive().finite().optional(),
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

/**
 * Võrdeline seos: üks veerg on teise KORDNE (`p = k · h`).
 *
 * Teine liige unioonis, täpselt nagu ülal lubatud – vana reeglit ei muudetud.
 * `factor` ühik on „column'i ühik perColumn'i ühiku kohta" (vedeliku rõhu
 * moodulis kPa/m). Ka SIIN ei ole füüsikat: skeem ei tea, kust kordaja tuleb.
 * Moodul arvutab ta `model.ts`-ist (CLAUDE.md reegel 1) ja test hoiab neid
 * kooskõlas – kirjutatud arv activities.ts-is läheks mudelist ühel päeval lahku.
 */
const proportionalRuleSchema = z.strictObject({
  kind: z.literal("proportional"),
  /** Kontrollitav veerg (õpilase loetud väärtus, nt rõhk). */
  column: columnKeySchema,
  /** Veerg, MILLEGA ta on võrdeline (nt sügavus). */
  perColumn: columnKeySchema,
  /** Kordaja k seoses `column = k · perColumn`. Positiivne ja lõplik. */
  factor: z.number().positive().finite(),
  /**
   * Lugemistolerants `column`-i ühikus. Vedeliku rõhu moodulis on see näidiku
   * täpsus (0,1 kPa), mitte protsent: protsenttolerants kahaneb väikese
   * sügavuse juures alla ümardusvea ja lükkaks õigesti loetud punkti tagasi.
   */
  tolerance: toleranceSchema,
});

const tableRuleSchema = z.discriminatedUnion("kind", [
  equalColumnsRuleSchema,
  proportionalRuleSchema,
]);

/** Reegli veeruviited koos väljanimega – veaviide peab ütlema, MIS väli katki on. */
function ruleColumnRefs(
  rule: z.infer<typeof tableRuleSchema>,
): readonly (readonly [string, string])[] {
  return rule.kind === "equal-columns"
    ? [
        ["rule.column", rule.column],
        ["rule.equalsColumn", rule.equalsColumn],
      ]
    : [
        ["rule.column", rule.column],
        ["rule.perColumn", rule.perColumn],
      ];
}

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
    /**
     * Kui väike vahe loeb veel „sama väärtuseks" – `distinctColumn`-i ühikus.
     * Vaikimisi kasutab kontroll reegli tolerantsi, aga see kõlbab ainult siis,
     * kui mõlemad on samas ühikus (peegeldumisseadus: kraadid ja kraadid).
     * Vedeliku rõhu tabelis on eristatav veerg meetrites ja reegli tolerants
     * kilopaskalites – 0,1 kPa „meetritena" loeks 0,5 m ja 0,6 m üheks ja samaks
     * mõõtmiseks. Seepärast nõuab skeem eri ühikute korral oma arvu.
     */
    distinctTolerance: toleranceSchema.optional(),
    rule: tableRuleSchema,
    /**
     * Punktdiagramm tabeli all: `x` ja `y` on veergude võtmed. Ilma selleta on
     * tabel ainult arvude loend – vedeliku rõhu moodulis on aga just SIRGE
     * kuju see, mille kohta järgmine küsimus käib. Telgede otsad tulevad
     * veergude `min`/`max`-ist, seepärast on need graafiku puhul kohustuslikud:
     * ise skaleeruv telg venitaks iga tabeli sirgeks ja peidaks vea ära.
     */
    graph: z
      .strictObject({ x: columnKeySchema, y: columnKeySchema })
      .optional(),
  })
  .superRefine((question, ctx) => {
    const keys = new Set(question.columns.map((column) => column.key));
    if (keys.size !== question.columns.length) {
      ctx.addIssue({ code: "custom", message: "Kahel veerul on sama võti" });
    }
    // Olematule veerule osutav reegel ei kontrolliks MITTE MIDAGI ja seda ei
    // paneks keegi brauseris tähele – seepärast valvab seda skeem.
    const refs = ruleColumnRefs(question.rule);
    for (const [field, key] of [
      ...refs,
      ...(question.distinctColumn ? [["distinctColumn", question.distinctColumn] as const] : []),
      ...(question.graph
        ? ([
            ["graph.x", question.graph.x],
            ["graph.y", question.graph.y],
          ] as const)
        : []),
    ]) {
      if (!keys.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: `${field} osutab veerule "${key}", mida tabelis ei ole`,
        });
      }
    }
    const [[, ruleColumn], [, otherColumn]] = refs;
    if (ruleColumn === otherColumn) {
      ctx.addIssue({
        code: "custom",
        message: "Veerg ei saa käia kokku iseendaga – siis oleks iga vastus õige",
      });
    }
    const unitOf = (key: string) => question.columns.find((column) => column.key === key)?.unit;
    // Kaht eri ühikus veergu ei saa omavahel VÕRDSUSTADA: „30 cm = 30 °" ei
    // tähenda midagi. Võrdelisel seosel on ühikute vahe just normaalne (kPa ja
    // m) – seal kannab ühikuvahet kordaja.
    if (
      question.rule.kind === "equal-columns" &&
      keys.has(ruleColumn) &&
      keys.has(otherColumn) &&
      unitOf(ruleColumn) !== unitOf(otherColumn)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "equal-columns reegli mõlemal veerul peab olema sama ühik",
      });
    }
    // Eristatavuse tolerants tuleb vaikimisi reegli omast – see kõlbab ainult
    // sama ühiku korral. Muidu võrreldaks meetreid kilopaskalites lubatud
    // veaga ja kaks eri sügavust loetaks üheks mõõtmiseks.
    if (
      question.distinctColumn &&
      question.distinctTolerance === undefined &&
      keys.has(question.distinctColumn) &&
      keys.has(ruleColumn) &&
      unitOf(question.distinctColumn) !== unitOf(ruleColumn)
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "distinctColumn on reegli veerust eri ühikus – lisa distinctTolerance selle veeru ühikus",
      });
    }
    if (question.graph) {
      if (question.graph.x === question.graph.y) {
        ctx.addIssue({
          code: "custom",
          message: "Graafiku teljed ei saa olla sama veerg",
        });
      }
      // Telje otsad tulevad veeru piiridest: ilma nendeta ei saaks joonis
      // näidata, kus punkt SKAALAL asub (vt graph-välja selgitust ülal).
      for (const [axis, key] of [
        ["graph.x", question.graph.x],
        ["graph.y", question.graph.y],
      ] as const) {
        const column = question.columns.find((candidate) => candidate.key === key);
        if (column && (column.min === undefined || column.max === undefined)) {
          ctx.addIssue({
            code: "custom",
            message: `${axis} veerul "${key}" peab graafiku jaoks olema nii min kui ka max`,
          });
        }
        // Kokku langevad otspunktid läbisid `min <= max` kontrolli, aga
        // joonis kaob brauseris VAIKSELT ära – ja järgmine küsimus palub
        // just tema kuju kohta vastata (Codexi leid 2026-08-04).
        if (column && column.min !== undefined && column.min === column.max) {
          ctx.addIssue({
            code: "custom",
            message: `${axis} veerul "${key}" on min ja max võrdsed – siis ei ole telge, mida joonistada`,
          });
        }
      }
    }
  });

export const questionSchema = z.discriminatedUnion("kind", [
  numericQuestionSchema,
  choiceQuestionSchema,
  textQuestionSchema,
  tableQuestionSchema,
  labelQuestionSchema,
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
