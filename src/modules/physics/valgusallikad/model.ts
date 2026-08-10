/**
 * Valgusallikad – füüsika (sisu/MOODUL-valgusallikad.md „Füüsika").
 *
 * Ainult puhtad funktsioonid: sama sisend → alati sama väljund, ei Reacti,
 * ei DOM-i, ei juhuslikkust (CLAUDE.md reegel 1). Simulation.tsx ainult kuvab
 * seda, mida siin arvutatakse – ühtki arkustangensit ega piiriga võrdlust ei
 * tohi komponendis uuesti teha.
 *
 * **Mooduli kogu mõte ühes lauses:** punktallikaks olemine EI ole keha
 * omadus, vaid keha ja vaatluskoha SUHTE omadus. Seepärast ei ole siin ühtki
 * funktsiooni, mis võtaks ainult mõõtme ja ütleks „punktallikas" – mõõtme
 * kõrval on alati kaugus. Kui keegi tahab kunagi lisada funktsiooni
 * `isPointSource(sizeM)`, on see märk, et väärarusaam `suurus-ilma-kauguseta`
 * on jõudnud koodi, mitte et mudel on puudulik.
 *
 * SI-ühikud sees: mõõtmed ja kaugused meetrites. Õpilase suurus on ÜHIKUTA
 * suhe `kaugus / mõõde` – nurkmõõde kraadides on ainult simulatsiooni lisanäit
 * ja joonise sisend, ülesannetes teda ei ole (vt `apparentSizeDeg`).
 *
 * Vigane sisend VISKAB vea, ta ei „paranda" ennast vaikselt – vaikne parandus
 * peidaks ära vea kutsuvas koodis (nt liuguri vale alampiir) ja õpilane näeks
 * õiget arvu vale sisendi pealt.
 */

/**
 * Vähim suhe (kaugus jagatud allika mõõduga), mille juures allikas loeb
 * punktvalgusallikaks. **Piir on kaasav:** täpselt 60 korda on veel
 * punktallikas.
 *
 * See on mooduli PÕHISUURUS ja ta on meelega jagamistehe, mitte nurk: 8. klass
 * arkustangensit ei tunne ja põhivara ütleb sama asja täpselt nii – „mõõtmed on
 * väikesed VÕRRELDES KAUGUSEGA vaatluskohast". Õpilane arvutab `kaugus / mõõde`
 * ja võrdleb 60-ga; rohkem matemaatikat siin moodulis ei ole.
 *
 * 60 on projekti KOKKULEPE, mitte loodusseadus. Ta vastab umbes 0,95°
 * nurkmõõdule (`apparentSizeDeg`) – sellest väiksema allika varjul on serv nii
 * terav, et poolvarju praktikas ei märka.
 *
 * Konstant elab siin ühes kohas, mitte laiali sisufailides: piiri muutmine
 * muudaks korraga kõigi ülesannete õigeid vastuseid ja seda ei tohi saada teha
 * kogemata (moodulilepingu versioonireeglite järgi oleks see major-muudatus).
 */
export const POINT_SOURCE_MIN_RATIO = 60;

/**
 * Suhteline ujukomamüra, mille võrra tohib piir „järele anda".
 *
 * Miks üldse: piirjuht on see, kus kaugus on täpselt `pointSourceDistance`.
 * Kümnendmurruga mõõdu juures ei ole korrutamine ja jagamine teineteise
 * täpsed pöördtehted – mõõde 0,06 m (väljumispileti tänavalamp!) annab
 * `(0,06 · 60) / 0,06` = 59,999999999999993 ehk `>= 60` järgi juba laiendatud
 * allikas. Ilma selle lubatud veata sõltuks õpilase ekraanil olev silt
 * viimasest bitist just seal, kus ülesanne teda vaatama paneb.
 *
 * Suurus on valitud MÕÕDETUD vea järgi, mitte lakke: ülalkirjeldatud viga on
 * umbes 2 ulp (~1e-16 suhtena), seega 8 · `Number.EPSILON` (~1,8e-15) katab ta
 * varuga ära ja jääb ikka kümme suurusjärku väiksemaks kui miski, mida ekraanil
 * näidatakse. Varasem 1e-9 oli tarbetult lai – siis oleks ka päris (kui ka
 * mõttetult napp) 59,99999997 lugenud punktallikaks (CodeRabbiti leid
 * 2026-08-10).
 */
const RATIO_EPSILON = 8 * Number.EPSILON;

/**
 * Simulatsiooni ja ülesannete päris näited (meetrites).
 *
 * Ainult arvud – eestikeelsed nimed („päevavalgustoru") on kasutajaliidese asi
 * ja elavad Simulation.tsx-is. Nii on Päikese läbimõõt ja kaugus ühes kohas
 * kirjas: neid küsib nii simulatsiooni nupurida, harjutus 4 kui ka
 * kordamiskaart rc-5, ja kolm käsitsi kirjutatud koopiat läheksid ühel päeval
 * lahku.
 *
 * `distanceM` on iga näite juures TÜÜPILINE vaatluskaugus, mitte ainus lubatud
 * – kauguse liugur jääb õpilase käes vabaks. Päikesel on see kaugus muidugi
 * püsiv fakt, mitte valik.
 */
export const EXAMPLE_SOURCES = {
  led: { sizeM: 0.005, distanceM: 1 },
  lambipirn: { sizeM: 0.08, distanceM: 4 },
  paevavalgustoru: { sizeM: 1.2, distanceM: 2 },
  aken: { sizeM: 1.5, distanceM: 3 },
  paike: { sizeM: 1_392_000_000, distanceM: 150_000_000_000 },
} as const satisfies Record<string, { sizeM: number; distanceM: number }>;

/** Simulatsiooni nupureal valitav näide. */
export type ExampleSourceId = keyof typeof EXAMPLE_SOURCES;

/** Allika liik näiva suuruse järgi. */
export type SourceSize = "point" | "extended";

/**
 * Positiivne suurus: 0 või negatiivne mõõde ega kaugus ei ole vaadeldav
 * olukord. Kauguse 0 juures oleks vaatleja allika sees – nurkmõõde ei ole
 * seal lihtsalt „suur", vaid määramata.
 */
function assertPositive(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${what} peab olema positiivne arv, aga oli ${value}`);
  }
}

/** Null lubatud, negatiivne ja NaN mitte (vt `classifyBySize`). */
function assertNonNegative(value: number, what: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(
      `${what} ei tohi olla negatiivne arv, aga oli ${value}`,
    );
  }
}

/**
 * Ka lõplikest sisenditest võib tulla lõpmatus (sama mure mis
 * vedeliku-rohk/model.ts-is): `pointSourceDistance(1e308)` jagab suure arvu
 * pisikese arvuga ja tulemus voolab üle. Mudel ei tohi tagastada arvu, mille
 * taga ta seista ei saa.
 */
function assertFiniteResult(value: number, what: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${what} ei mahu arvu sisse: tuli ${value}`);
  }
}

function toDegrees(angleRad: number): number {
  return (angleRad * 180) / Math.PI;
}

/**
 * Mitu korda on kaugus suurem kui allika mõõde – mooduli PÕHISUURUS.
 *
 * `L / d`, kus `d` on allika mõõde ja `L` kaugus. Üks jagamine, ühikuta arv:
 * meetrid taanduvad välja, seega vastus on sama, kas arvutada meetrites või
 * kilomeetrites (just seda Päikese ülesanne kasutab).
 *
 * @param sizeM allika mõõde ehk läbimõõt (m)
 * @param distanceM kaugus vaatluskohast (m)
 */
export function distanceToSizeRatio(sizeM: number, distanceM: number): number {
  assertPositive(sizeM, "Allika mõõde");
  assertPositive(distanceM, "Kaugus");
  const ratio = distanceM / sizeM;
  assertFiniteResult(ratio, "Suhe");
  return ratio;
}

/**
 * Suhe → allika liik. Piir on kaasav (vt `POINT_SOURCE_MIN_RATIO`): täpselt
 * 60 korda on punktallikas.
 *
 * Suhe tuleb `distanceToSizeRatio`-st, mitte mõõtmest ja kaugusest – nii on
 * „kumb liik" otsus koodis ühes kohas ja simulatsiooni silt ei saa ülesannete
 * vastustest lahku minna.
 */
export function classifyByRatio(ratio: number): SourceSize {
  // Null on siin LUBATUD, erinevalt mõõtmest ja kaugusest: hiiglaslik allikas
  // päris lähedal annab ujukoma alla kaduva suhte ja 0 on ilmselgelt
  // laiendatud allikas. Vea viskamine tähendaks, et mudel kukub oma enda
  // väljundi peale.
  assertNonNegative(ratio, "Suhe");
  return ratio >= POINT_SOURCE_MIN_RATIO * (1 - RATIO_EPSILON) ? "point" : "extended";
}

/**
 * Näiv nurkmõõde: kui suurena allikas vaatluskohast paistab (kraadides).
 *
 * **Lisanäit, mitte reegel.** Liigi otsustab `classifyByRatio`; see funktsioon
 * on olemas kahel põhjusel: simulatsioon joonistab tema järgi kiirte kimbu ja
 * näitab kraade väikeses kirjas neile, keda huvitab, kuidas asja päris
 * füüsikas mõõdetakse. Ükski ülesanne kraade ei küsi – arkustangens ei ole
 * 8. klassi matemaatika.
 *
 * `2 · atan(d / (2 · L))`, kus `d` on allika mõõde ja `L` kaugus. Kaks korda
 * pool nurka: allika keskkoht on vaatesuunas, servad selle kummalgi pool.
 * Lihtsam `d / L` (radiaanides) annaks väikeste nurkade juures peaaegu sama
 * vastuse, aga läheks päevavalgustoru ja akna juures nähtavalt valeks – ja
 * just need on ülesannetes.
 *
 * @param sizeM allika mõõde ehk läbimõõt (m)
 * @param distanceM kaugus vaatluskohast (m)
 */
export function apparentSizeDeg(sizeM: number, distanceM: number): number {
  assertPositive(sizeM, "Allika mõõde");
  assertPositive(distanceM, "Kaugus");
  // Jagame ENNE kahega läbi, mitte pärast: `2 · distanceM` voolaks väga suure
  // kauguse juures üle Infinity-ks, jagatis kukuks nulli ja vastuseks tuleks
  // 0° – arv arvu moodi, mida keegi kahtlustama ei hakkaks (mõlema ülevaataja
  // leid 2026-08-10). Sellisel kujul jääb suhe `d/L` alati arvu sisse ja alles
  // siis poolitatakse. Ülesannete vastused sellest ei muutu.
  return 2 * toDegrees(Math.atan(sizeM / distanceM / 2));
}

/**
 * Vähim kaugus, millelt antud mõõtmega allikas loeb punktallikaks (m).
 *
 * Sama seos tagurpidi: `L = d · piir`. Ta on mudelis, sest simulatsiooni
 * ülesanne 1 küsib täpselt seda arvu („kaugenda, kuni silt muutub – mis
 * kaugusel see juhtus?", päevavalgustoru puhul 72 m). Ilma selleta arvutaks
 * vastuse kas sisufail või õpetaja peast, mitte mudel.
 *
 * Piir tuleb `POINT_SOURCE_MIN_RATIO`-st, mitte eraldi kirjutatud 60-st –
 * muidu jääks kokkuleppe muutmisel pool koodi vanale piirile.
 */
export function pointSourceDistance(sizeM: number): number {
  assertPositive(sizeM, "Allika mõõde");
  const distanceM = sizeM * POINT_SOURCE_MIN_RATIO;
  assertFiniteResult(distanceM, "Kaugus");
  return distanceM;
}
