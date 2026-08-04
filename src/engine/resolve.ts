import { formatNumber } from "../lib/format";
import type { AnswerPayload, Answers } from "./answers";
import type { ChoiceQuestion, NumericQuestion, Question, Step } from "./contract";
import { fillPlaceholders } from "./placeholders";

/**
 * Sama moodul teist korda – teised arvud ja teine järjekord.
 *
 * Katsetus (2026-08-04) näitas, et kordamisel jääb meelde JÄRJEKORD ja ARV,
 * mitte sisu: „õige oli teine variant", „vastus oli 55". Seepärast valib
 * engine enne ekraanile andmist valikvastuste järjekorra ja arvküsimuse
 * variandi. Moodul ise sellest ei tea – ta kirjutab variandid ja saab tagasi
 * ühe neist.
 *
 * Kolm reeglit, mis teevad juhuslikkuse ohutuks:
 *
 * 1. **Ainult nähtav kuju muutub, id-d mitte.** Vastus salvestab variandi id
 *    (`AnswerPayload.choice.optionIds` ja `AnswerPayload.variantId`), seega
 *    õpetaja koondvaade teab alati, MILLELE õpilane vastas (reegel 11).
 * 2. **Sama moodulikäik = sama küsimus.** Seeme tuleb moodulikäigu
 *    algusajast (`ModuleProgress.startedAt`), mis on salvestatud – lehe
 *    värskendamine, sammude vahel liikumine ega järgmisel päeval jätkamine ei
 *    vaheta arve ega variante. Uus loos tuleb ainult „Alusta uuesti" peale,
 *    sest siis algab uus käik uue algusajaga (kasutaja otsus 2026-08-04).
 * 3. **Puhtad funktsioonid.** Ei `Math.random`-i, ei kella: sama seeme annab
 *    alati sama tulemuse, seega on testitav ja korratav (sama kokkulepe mis
 *    model.ts-il, docs/MOODULILEPING.md).
 *
 * Füüsikat siin EI ole: variandi vastus on `activities.ts`-is kirjas, mitte
 * siin arvutatud (CLAUDE.md reegel 1).
 */

/**
 * 32-bitine räsi tekstist (FNV-1a).
 *
 * Miks räsi, mitte lihtsalt arv: seeme peab olema seotud NII moodulikäigu kui
 * ka küsimusega. Ilma küsimuse id-ta saaksid kõik ühe sammu valikküsimused
 * sama „loosi" ja segaksid end ühtemoodi.
 */
function hash32(text: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Moodulikäigu seeme selle algusajast.
 *
 * Miks algusaeg, mitte omaette salvestatud juhuslik arv: algusaeg on juba
 * olemas nii localStorage'is kui ka `attempts.started_at` veerus
 * (docs/ANDMEMUDEL.md) ja ta muutub TÄPSELT siis, kui algab uus käik. Uut
 * välja (ja hiljem uut veergu) ei ole vaja – üks tõe allikas vähem.
 */
export function attemptSeed(startedAt: string): number {
  return hash32(startedAt);
}

/**
 * Korratav juhuslikkus (mulberry32) – sama seeme annab alati sama jada.
 *
 * Sama algoritm on ka `model.ts`-is (mattpinna kiired). Ta on siin uuesti,
 * mitte imporditud: engine ei tohi sõltuda ühestki moodulist
 * (docs/ARHITEKTUUR.md) ja kaheksa rida matemaatikat on odavam kui sõltuvus
 * vales suunas.
 */
function randomFrom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates: iga järjekord on võrdselt tõenäoline. Algset loendit ei muuda. */
function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Valikvastuse variandid segamini – v.a kui moodul ütles `shuffle: false`.
 *
 * Väljalülitamine on mõeldud loogilises reas variantidele (15°, 30°, 60°) ja
 * „kõik eelnevad" tüüpi viimasele variandile: seal teeks segamine küsimuse
 * segasemaks, mitte ausamaks.
 */
function resolveChoice(question: ChoiceQuestion, seed: number): ChoiceQuestion {
  if (question.shuffle === false) return question;
  const random = randomFrom(hash32(`${seed}:${question.id}`));
  return { ...question, options: shuffled(question.options, random) };
}

/**
 * Variandi arvud tekstikujule: 35 → „35", 2.5 → „2,5".
 *
 * Vormistus käib eesti reeglite järgi (koma, mitte punkt) sama funktsiooniga
 * mis mujal ekraanil (src/lib/format.ts). Kümnendkohtade arv tuleb väärtusest
 * endast – `formatNumber` ümardaks vaikimisi täisarvuks ja „2,5 m" muutuks
 * küsimuses „3 m"-iks.
 */
function asText(values: Readonly<Record<string, number>>): Record<string, string> {
  const texts: Record<string, string> = {};
  for (const [name, value] of Object.entries(values)) {
    texts[name] = formatNumber(value, decimalsOf(value));
  }
  return texts;
}

/**
 * Mitu kümnendkohta on arvul PÄRISELT.
 *
 * `String(0.0000005)` annab „5e-7", mitte „0.0000005" – ilma eksponenti
 * lugemata tuleks vastuseks 0 kohta ja valguse lainepikkusest saaks küsimuses
 * ümmargune null (CodeRabbiti ülevaatuse leid 2026-08-04).
 */
function decimalsOf(value: number): number {
  const text = String(value);
  const [mantissa, exponent] = text.split(/e/i);
  const fraction = mantissa.split(".")[1]?.length ?? 0;
  const shift = exponent ? Number(exponent) : 0;
  // Positiivne eksponent (1e21) lühendab kümnendkohti, negatiivne pikendab.
  return Math.max(0, fraction - shift);
}

/**
 * Arvküsimuse variant: üks loos, üks arvupaar.
 *
 * Ilma variantideta küsimus läheb muutmata edasi – enamik küsimusi selline
 * ongi ja variantide lisamine on alati mooduli autori teadlik otsus.
 *
 * **Juba vastatud küsimus ei loosi uuesti.** Loos käib variantide loendi
 * INDEKSI järgi, seega uue variandi lisamine (moodulilepingu järgi
 * minor-muudatus) nihutaks sama seemne teise variandi peale. Õpilase vastus
 * ripuks siis teise arvuga küsimuse küljes ja ekraanile ilmuks punane rist
 * ülesande eest, mida ta ei näinudki (Codexi ülevaatuse leid 2026-08-04).
 * Seepärast võidab salvestatud variant alati loosi.
 */
function resolveNumeric(
  question: NumericQuestion,
  seed: number,
  answeredVariantId?: string,
): { question: NumericQuestion; variantId?: string } {
  const variants = question.variants;
  if (!variants || variants.length === 0) return { question };

  const random = randomFrom(hash32(`${seed}:${question.id}`));
  // Kadunud variant (autor eemaldas ta – major-muudatus) ei ole enam
  // taastatav: siis otsustab loos ja vana vastus jäetakse kõrvale
  // (vt answersForCurrentVariants).
  const variant =
    variants.find((candidate) => candidate.id === answeredVariantId) ??
    variants[Math.floor(random() * variants.length)];
  const values = asText(variant.values);
  return {
    question: {
      ...question,
      prompt: fillPlaceholders(question.prompt, values),
      hints: question.hints?.map((hint) => fillPlaceholders(hint, values)),
      answer: variant.answer,
      traps: variant.traps,
      // Valik on tehtud: edasi ei tohi keegi teine variant valida.
      variants: undefined,
    },
    variantId: variant.id,
  };
}

function resolveQuestion(
  question: Question,
  seed: number,
  answeredVariantId?: string,
): { question: Question; variantId?: string } {
  switch (question.kind) {
    case "choice":
      return { question: resolveChoice(question, seed) };
    case "numeric":
      return resolveNumeric(question, seed, answeredVariantId);
    default:
      return { question };
  }
}

/** Sammud koos infoga, milline variant kuhu loositi. */
export type ResolvedSteps = {
  /** Sammud sellisel kujul, nagu õpilane neid näeb. */
  steps: Step[];
  /**
   * question_id → valitud variandi id. Ainult variantidega küsimustel –
   * teistel ei ole midagi salvestada. Läheb vastuse juurde
   * (`AnswerPayload.variantId`), et õpetaja teaks, MILLISE arvuga küsimusele
   * õpilane vastas.
   */
  variantIds: Record<string, string>;
};

/**
 * Sammud sellisel kujul, nagu õpilane neid näeb.
 *
 * Kutsutakse ÜHES kohas (`useModuleProgress`) ja tulemus läheb edasi nii
 * ekraanile kui ka checkerini – nii ei saa juhtuda, et õpilane vastab ühele
 * küsimusele ja kontrollitakse teist.
 */
export function resolveSteps(
  steps: Step[],
  seed: number,
  /**
   * question_id → variandi id, mille peale õpilane on JUBA vastanud
   * (`answeredVariants`). Neid küsimusi ei loosita uuesti.
   */
  answered: Readonly<Record<string, string | undefined>> = {},
): ResolvedSteps {
  const variantIds: Record<string, string> = {};

  const resolved = steps.map((step) => {
    if (!("questions" in step)) return step;
    const questions = step.questions.map((question) => {
      const result = resolveQuestion(question, seed, answered[question.id]);
      if (result.variantId) variantIds[question.id] = result.variantId;
      return result.question;
    });
    return { ...step, questions };
  });

  return { steps: resolved, variantIds };
}

/** Millise variandi peale on igale küsimusele vastatud (vastuseid lugedes). */
export function answeredVariants(
  answers: Answers,
): Record<string, string | undefined> {
  const variants: Record<string, string | undefined> = {};
  for (const [questionId, answer] of Object.entries(answers)) {
    if (answer?.variantId) variants[questionId] = answer.variantId;
  }
  return variants;
}

/**
 * Vastused, mis käivad PRAEGU ekraanil oleva küsimuse kohta.
 *
 * Peaaegu alati on need kõik vastused – salvestatud variant võidab loosi, nii
 * et küsimus jääb samaks. Erand on variant, mida enam ei ole (autor eemaldas
 * ta – major-muudatus): siis on ekraanil TEINE ülesanne kui see, millele
 * õpilane vastas, ja vana vastus tuleb kõrvale jätta. Muidu näeks õpilane
 * hinnangut vastusele, mida ta sellele küsimusele ei andnud.
 *
 * Salvestusest vastust EI kustutata – ta lihtsalt ei kuulu selle küsimuse
 * juurde. Uus vastus kirjutab ta üle.
 */
export function answersForCurrentVariants(
  answers: Answers,
  variantIds: Readonly<Record<string, string>>,
): Answers {
  const kept: Record<string, AnswerPayload> = {};
  for (const [questionId, answer] of Object.entries(answers)) {
    if (answer && answer.variantId === variantIds[questionId]) kept[questionId] = answer;
  }
  return kept;
}
