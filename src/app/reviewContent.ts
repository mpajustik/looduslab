import type { ReviewCard } from "../engine/contract";
import { isDue, type ReviewItem } from "../engine/review";
import { moduleRegistry, type ModuleLoader } from "../modules/registry";

/**
 * „Mis kaardid on päriselt olemas" – ÜKS vastus kahele lehele (plaani samm
 * 3.6 viimane punkt).
 *
 * Seadmes on kaardist ainult `moduleId + cardId + kuupäev`
 * (src/engine/review.ts); küsimuse tekst elab mooduli `activities.ts`-is.
 * Seega võib salvestuses seista kaart, millel EI OLE enam teksti:
 *
 * - moodul on registrist kadunud (arhiveeritud, CLAUDE.md reegel 11), või
 * - kaart on elava mooduli `activities.ts`-ist eemaldatud (küsimus osutus
 *   halvaks) – seda näeb alles siis, kui mooduli sisu on laaditud.
 *
 * Enne seda faili teadis kumbki leht neist ainult ühte: /edenemine filtreeris
 * registri järgi ja lubas „3 kaarti ootab", /kordamine luges ka teksti ja
 * ütles sama hetke kohta „ei ole midagi korrata" (Codexi ülevaatuse leid
 * 2026-08-07). Kaks reeglit → üks reegel: `existingReviewItems`.
 *
 * Miks src/app, mitte src/engine: siin loetakse REGISTRIT ja laaditakse
 * mooduleid. Engine ei tea moodulite laadimisest midagi
 * (docs/ARHITEKTUUR.md) – ta saab kaardid sisendina. Naaber
 * src/app/moduleManifests.ts on sama liiki fail samal põhjusel.
 */

/** Ühe mooduli kordamissisu: pealkiri ekraanile ja kaardid id järgi. */
export type ModuleCards = {
  title: string;
  cards: Record<string, ReviewCard | undefined>;
};

export type ReviewContent = {
  /** Moodul → tema kaardid. Puuduv kirje = ei laadinud (võrk või arhiiv). */
  modules: Record<string, ModuleCards | undefined>;
  /**
   * Kas mõne mooduli sisu jäi VÕRGU tõttu laadimata. Registrist puuduv
   * moodul siia EI lähe: see on tavaline vananemine, mitte rike, mille
   * pärast õpilast tüüdata.
   */
  failed: boolean;
};

/**
 * Laadib nende moodulite kordamissisu, mille kaardid on täna ootel.
 *
 * Ainult ootel kaardid, sest ainult neid on vaja näidata ja lugeda – kogu
 * kursuse sisu laadimine tähendaks kümmet tarbetut päringut lehe avamisel
 * (CLAUDE.md reegel 13).
 */
export async function loadReviewContent(args: {
  items: ReviewItem[];
  now: Date;
  /** Ainult testile: päris rakendus kasutab alati päris registrit. */
  registry?: Record<string, ModuleLoader>;
}): Promise<ReviewContent> {
  const registry = args.registry ?? moduleRegistry;
  const moduleIds = [
    ...new Set(
      args.items.filter((item) => isDue(item, args.now)).map((item) => item.moduleId),
    ),
  ];

  const loaded = await Promise.all(
    moduleIds.map((id) => loadModuleCards(id, registry)),
  );

  const modules: Record<string, ModuleCards | undefined> = {};
  for (const entry of loaded) {
    if (entry.value) modules[entry.id] = entry.value;
  }
  return { modules, failed: loaded.some((entry) => entry.failed) };
}

/**
 * Kaardid, mis on päriselt olemas – ainus koht, kus see otsus tehakse.
 *
 * Filtreeritakse ainult OOTEL kaarte. Ülejäänud jäävad loendisse alles, sest
 * `dueReviewItems` ja `reviewedToday` (src/engine/review.ts) vajavad neid
 * päevapiiri arvutamiseks: täna juba hinnatud kaart ei ole enam ootel, aga ta
 * on päevast osa võtnud.
 *
 * Laadimata moodul (kehv võrk) kaotab siin oma kaardid – teksti ei ole, seda
 * kaarti ei saa näidata. Selle eest vastutab `ReviewContent.failed`: kutsuja
 * peab luhtunud laadimise korral kas ÜTLEMA seda õpilasele (kordamisleht) või
 * jätma vana arvu rahule (edenemisleht). Vaikselt vähenev arv oleks siin
 * kõige halvem vastus.
 */
export function existingReviewItems(args: {
  items: ReviewItem[];
  content: ReviewContent;
  now: Date;
}): ReviewItem[] {
  return args.items.filter(
    (item) => !isDue(item, args.now) || reviewCardOf(args.content, item) !== null,
  );
}

/**
 * Ühe kaardi tekst sisust – sama otsing, mille peal `existingReviewItems`
 * filtreerib. Kordamisleht kasutab teda näitamiseks: kui filter ja näitamine
 * otsiksid eri moodi, jõuaks ekraanile kaart, mida seal olla ei tohiks.
 *
 * `Object.hasOwn`, mitte tavaline indeks: kaardid tulevad localStorage'ist,
 * kus id võib olla ükskõik mis („toString") – prototüübilt leitud funktsioon
 * teeks olematust kaardist olemasoleva.
 */
export function reviewCardOf(
  content: ReviewContent,
  item: Pick<ReviewItem, "moduleId" | "cardId">,
): { moduleTitle: string; card: ReviewCard } | null {
  if (!Object.hasOwn(content.modules, item.moduleId)) return null;
  const module = content.modules[item.moduleId];
  if (!module || !Object.hasOwn(module.cards, item.cardId)) return null;

  const card = module.cards[item.cardId];
  return card ? { moduleTitle: module.title, card } : null;
}

/**
 * ESIMENE, optimistlik vastus samale küsimusele: moodul on registris olemas,
 * kaartide tekst on alles laadimata.
 *
 * Kordamisleht seda ei vaja – tema ootab sisu ära ja näitab seni
 * „Laen tänaseid kaarte …". Edenemisleht vajab: ta peab avanema kohe ja ka
 * lennukirežiimis, seega joonistab ta esmalt selle arvu ja parandab pärast
 * `existingReviewItems`-iga. Mõlemad reeglid on SIIN, ühes failis, sest nad
 * on ühe ja sama küsimuse kaks hetke – lahku aetuna nad lähevad lahku.
 */
export function possibleReviewItems(
  items: ReviewItem[],
  registry: Record<string, ModuleLoader> = moduleRegistry,
): ReviewItem[] {
  return items.filter((item) => Object.hasOwn(registry, item.moduleId));
}

/**
 * Kaardid LUGEMISEKS (edenemisleht) – täpne reegel siis, kui sisu on käes,
 * muidu optimistlik.
 *
 * Miks see valik on siin, mitte lehe sees ühe `if`-ina: luhtunud laadimise
 * korral ei tohi arv teha KAHTE eri viga ja ainult üks neist on ilmne.
 * „Ei saanud kätte" ei tohi kaarti kaotada (arv väheneks vaikselt), AGA ka
 * mitte varjata: kui leht jätaks siis vaate lihtsalt värskendamata, jääks
 * ekraanile serverist tõmbamise EELNE arv ja äsja seadmesse jõudnud kaart
 * oleks nähtamatu (Codexi ülevaatuse leid 2026-08-08). Tagasilangus
 * optimistlikule reeglile lahendab mõlemad korraga.
 *
 * Kordamisleht seda EI kasuta: tema peab kaardi ka näitama, seega luhtunud
 * mooduli kaart kaob tal loendist ja asemele tuleb aus teade
 * („Osa kaarte jäi laadimata"). Lugemine ja näitamine taluvad eri asju.
 */
export function countableReviewItems(args: {
  items: ReviewItem[];
  content: ReviewContent;
  now: Date;
  /** Ainult testile: päris rakendus kasutab alati päris registrit. */
  registry?: Record<string, ModuleLoader>;
}): ReviewItem[] {
  return args.content.failed
    ? possibleReviewItems(args.items, args.registry)
    : existingReviewItems(args);
}

/**
 * Ühe mooduli kaardid registrist.
 *
 * `failed` eristab kahte täiesti erinevat „ei saanud kaarte": PUUDUV moodul
 * (arhiveeritud – õpilasele ei kaeba) ja LAADIMATA moodul (kehv võrk – seda
 * peab õpilane teada saama, muidu ütleb leht vaikselt „ei ole midagi
 * korrata").
 */
async function loadModuleCards(
  id: string,
  registry: Record<string, ModuleLoader>,
): Promise<{ id: string; value: ModuleCards | null; failed: boolean }> {
  // `Object.hasOwn`, mitte `registry[id]`: id tuleb localStorage'ist ja
  // „toString" leiaks prototüübilt funktsiooni, mille kutsumine annaks siis
  // vale „laadimisvea".
  if (!Object.hasOwn(registry, id)) return { id, value: null, failed: false };
  const loader = registry[id];

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
