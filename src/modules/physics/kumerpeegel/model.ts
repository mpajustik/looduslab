/**
 * Kumerpeegel – füüsika (sisu/MOODUL-kumerpeegel.md „Füüsika").
 *
 * Ainult puhtad funktsioonid: sama sisend → alati sama väljund, ei Reacti,
 * ei DOM-i, ei juhuslikkust (CLAUDE.md reegel 1). Simulation.tsx ainult kuvab
 * seda, mida siin arvutatakse – ühtki nurka ega teisendust ei tohi komponendis
 * uuesti välja arvutada.
 *
 * **Mida see moodul juurde toob:** peegeldumisseadus (moodul
 * `peegeldumisseadus`) ega kerapinna ristsirge (moodul `noguspeegel`) EI muutu.
 * Muutub ainult see, kummale poole kera keskpunkt jääb: kumerpeeglil on läikiv
 * pind kera VÄLIMISEL küljel, seega läheb ristsirge joon peegli TAHA. Kogu
 * ülejäänud fail on selle ühe lause tagajärg – paralleelne vihk hajub ja
 * kokku saavad ainult peegeldunud kiirte pikendused.
 *
 * **Miks see ei ole nõguspeegli mudeli taaskasutus** (spetsi eraldi peatükk):
 * valemid on peaaegu samad, aga arvude TÄHENDUS on vastupidine. Nõguspeegli
 * `axisCrossM` on koht, kust valgus päriselt läbi käib (fookuses süttib
 * paber); siinne `virtualCrossM` on koht, kus lõikuvad ainult PIKENDUSED
 * peegli taga – seal ei ole valgust ega soojust. Üks ühine funktsioon kaotaks
 * selle vahe just seal, kus ta on kogu mooduli mõte. Kaks eraldi kirjutatud
 * geomeetriat peavad andma sama arvu ja seda kontrollib eraldi ristkontrolli
 * test (tests/kumerpeegel.model.test.ts) – TESTIS, mitte rakenduse koodis.
 *
 * ÜHIKUD: kõik pikkused mudeli sees on **meetrites** (moodulileping:
 * SI-ühikud sees, teisendused eraldi funktsioonides), kõik nurgad kraadides.
 * Õpilasega räägib UI sentimeetrites – cm on 8. klassile õige ühik. Ühik
 * muutub AINULT funktsioonides `metresFromCentimetres` ja
 * `centimetresFromMetres` (sama muster mis `noguspeegel/model.ts` ja
 * `vedeliku-rohk/model.ts`). Kui mõni arvutus vahetab ühikut „möödaminnes",
 * tuleb vaikne 100-kordne viga, mida ei õpilane ega õpetaja ei märka.
 *
 * Telgistik ja tähised, mida kogu fail kasutab:
 *
 * - Peegli **tipp** (peatelje ja peegli lõikepunkt) on nullpunkt. Kumeral
 *   peeglil on tipp valgusele kõige LÄHEM koht – peegel kummub valguse poole.
 * - **Peatelg** on x-telg; kaugusi mõõdetakse tipust ja alati POSITIIVSE
 *   arvuna. Kumb pool („peegli ees" / „peegli taga") on nimes ja UI tekstis,
 *   mitte märgis: selles moodulis ei ole ühtegi negatiivset pikkust.
 * - `R` (`radiusM`) – kõverusraadius ehk selle kera raadius, mille osa peegel
 *   on. Kera keskpunkt C on peegli TAGA peateljel kaugusel R (nõguspeeglil oli
 *   ta peegli ees – see ongi ainus geomeetriline erinevus).
 * - `h` (`heightM`) – kiire kõrgus ehk kaugus peateljest kohas, kus kiir
 *   peegliga kohtub. Negatiivne h on telje all olev kiir.
 *
 * Kõik nurgad on **mittenegatiivsed** ja `+h` ning `−h` annavad sama vastuse:
 * peegel on peatelje suhtes sümmeetriline ja peegeldumise SUUND tuleb
 * joonisel h märgist, mitte mudelist.
 *
 * **Idealiseeringud** (UI ega õpetajajuhend ei tohi neid päris füüsikana
 * esitada):
 *
 * 1. **Peegel on kerapinna osa.** Päris lai turvapeegel ei koonda pikendusi
 *    täpselt ühte punkti; sama põhjus, miks prožektori peegel on parabool
 *    (vt `SAFE_HEIGHT_RATIO`). Väga kumeral peeglil paistab see kohe välja –
 *    just nii tehaksegi lõbustuspargi kõverpeeglid.
 * 2. **Peegel peegeldab kogu valguse.** Neeldumist ja tuhmumist siin ei ole;
 *    päris peegel peegeldab ~90–95 %.
 * 3. **Kiir on lõputult peenike joon.** Päris valgusvihul on laius.
 * 4. **Peegeldumisseadus kehtib kõveral pinnal punkthaaval.** See EI ole
 *    idealiseering, vaid tõsi – aga tõsi ainult siis, kui vaadelda pinna
 *    puutujat selles punktis. Mudel arvutab täpselt nii.
 *
 * Vigane sisend VISKAB vea, ta ei „paranda" ennast vaikselt – vaikne parandus
 * peidaks ära vea kutsuvas koodis (nt liuguri vale ülempiir) ja õpilane näeks
 * õiget arvu vale sisendi pealt.
 */

/**
 * Simulatsiooni liugurite piirid ja sammud SENTIMEETRITES
 * (sisu/MOODUL-kumerpeegel.md „explore").
 *
 * Erandlikult cm, mitte SI: need arvud EI lähe valemitesse, vaid on
 * kasutajaliidese liuguri otsad, ja liugur näitab õpilasele sentimeetreid.
 * Simulation.tsx annab liuguri väärtuse mudelisse `metresFromCentimetres`
 * kaudu – see on ainus tee sisse.
 *
 * Miks MUDELIS, mitte Simulation.tsx-is: need piirid otsustavad, kas
 * ülesannete vastused (näiline fookus 50 cm ja 80 cm) on üldse saavutatavad ja
 * kas h/R püsib turvavööndis (`SAFE_HEIGHT_RATIO`). Mõlemat kontrollib test.
 */
export const SLIDERS = {
  /** Kera raadius R – algväärtus 100 cm (explore-1 vastus 50 cm). */
  radiusCm: { min: 50, max: 200, step: 10 },
  /** Valitud kiire kõrgus h – algväärtus 10 cm. */
  rayHeightCm: { min: 0, max: 10, step: 1 },
} as const satisfies Record<string, { min: number; max: number; step: number }>;

/**
 * Peegli poolkõrgus simulatsioonis (cm): kiired tulevad kõrgustel ±5 ja ±10 cm.
 *
 * Sama arv, mis `SLIDERS.rayHeightCm.max` – peegel ei tohi olla valitud
 * kiirest madalam. Test hoiab neid koos.
 */
export const MIRROR_HALF_HEIGHT_CM = 10;

/**
 * Turvavöönd, mille sees tohib UI-s öelda „kõik pikendused lõikuvad ühes
 * punktis".
 *
 * Kerapind EI koonda paralleelsete kiirte pikendusi täpselt ühte punkti
 * (sfääriline aberratsioon): mida kaugemal peateljest kiir peeglile langeb,
 * seda LÄHEMALE peeglile jääb tema pikenduse lõikepunkt. Kui |h| ≤ 0,2 · R,
 * jääb erinevus näilise fookuse kaugusest R/2 alla 3 % (halvim juht 2,1 %)
 * ehk ekraanil ühte punkti.
 *
 * Simulatsiooni arvud on selle järgi valitud: poolkõrgus 10 cm ja raadius
 * vähemalt 50 cm annavad h/R ≤ 0,2. Kui keegi hiljem lubab suuremat suhet,
 * läheb selle konstandi test punaseks – see on lause „lõikuvad ühes punktis"
 * ainus valve.
 */
export const SAFE_HEIGHT_RATIO = 0.2;

/**
 * Suurim h/R suhe, mille juures `reflectParallelRay` veel vastab: **√3 / 2**
 * ehk θ = 60° (ligikaudu 0,866).
 *
 * Sellest kõrgemal kaldub peegeldunud kiir peateljest üle 120° võrra ja tema
 * pikendus lõikab peatelge hoopis peegli tipust EESPOOL: valem annab θ = 60°
 * juures täpselt 0 ja suurema θ korral negatiivse arvu. Funktsiooni lubadus on
 * „kaugus peegli taga" – seda ta seal enam ei täida, seega on see viga, mitte
 * vastus. Simulatsioon jääb niikuinii vöötsse |h| ≤ 0,2 · R, seega õpilane
 * seda piiri ei näe; ta on seal selleks, et 8. klassi mudel ei hakkaks
 * vastama küsimusele, mille peale tema sõnastus enam ei kehti.
 */
export const MAX_RAY_HEIGHT_RATIO = Math.sqrt(3) / 2;

/** Peateljega paralleelse kiire saatus kumerpeeglil. */
export interface ParallelRay {
  /**
   * Kohtumispunkti nihe peegli tipust TAHAPOOLE piki peatelge (m). Tipp on
   * valgusele kõige lähem koht, seega on iga teine peegli punkt tipust taga.
   */
  bulgeM: number;
  /** Langemisnurk α ristsirge suhtes (°). */
  incidenceDeg: number;
  /** Peegeldumisnurk β (°) – peegeldumisseaduse tõttu alati võrdne α-ga. */
  reflectionDeg: number;
  /** Kui palju peegeldunud kiir peateljest kaldub (°): 2α. Alati teljest EEMALE. */
  deflectionDeg: number;
  /**
   * Kus peegeldunud kiire PIKENDUS peatelge lõikab, peegli tipust TAHA (m).
   *
   * See EI ole koht, kust valgus läbi käib: peegeldunud kiired lähevad
   * peeglist eemale laiali ja lõikuvad ainult tagurpidi pikendatuna. Piirjuhul
   * h → 0 on see arv täpselt R/2 ehk näilise fookuse kaugus.
   */
  virtualCrossM: number;
}

const DEGREES_PER_RADIAN = 180 / Math.PI;

/** Raadius peab olema päris pikkus: 0 ega negatiivne ei ole kera. */
function assertRadius(radiusM: number): void {
  if (!Number.isFinite(radiusM) || radiusM <= 0) {
    throw new RangeError(
      `Kõverusraadius peab olema positiivne arv, aga oli ${radiusM}`,
    );
  }
}

/**
 * Kiire kõrgus tohib olla ka negatiivne (telje all olev kiir) ja null
 * (peateljel levinud kiir) – aga ta peab olema arv.
 */
function assertHeightIsNumber(heightM: number): void {
  if (!Number.isFinite(heightM)) {
    throw new RangeError(`Kiire kõrgus peab olema arv, aga oli ${heightM}`);
  }
}

/**
 * Ka lõplikest sisenditest võib tulla lõpmatus või NaN.
 *
 * Sisendikontroll ei päästa siin: `mirrorBulge(1e308, 1e307)` saab iga
 * argumendi eraldi võttes korraliku arvuna läbi, aga `R²` ja `h²` voolavad
 * mõlemad üle `Infinity`-ks ja vahe `Infinity − Infinity` annab NaN, kuigi
 * õige vastus oleks lõplik arv.
 *
 * Tänases rakenduses sellist sisendit ei teki (liugur annab 50…200 cm), aga
 * mudel ei tohi tagastada arvu, mille taga ta seista ei saa – sama joon, mis
 * on `noguspeegel/model.ts`-is ja `vedeliku-rohk/model.ts`-is (Codexi leid,
 * sammud 4.1ii ja 0.x).
 */
function assertFiniteResult(value: number, what: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${what} ei mahu arvu sisse: tuli ${value}`);
  }
}

/**
 * Kiir peab peeglile ära mahtuma: |h| ≤ R.
 *
 * |h| = R ON lubatud ja tähendab peegli serva (poolkera): `mirrorBulge` annab
 * seal R ja `normalAngleDeg` 90°. Mõlemad on ausad vastused ja simulatsioon
 * joonistab nende abil kogu peegli kaare.
 */
function assertHeightFitsMirror(radiusM: number, heightM: number): void {
  if (Math.abs(heightM) > radiusM) {
    throw new RangeError(
      `Kiire kõrgus ei mahu peeglile: |${heightM}| > ${radiusM}`,
    );
  }
}

/**
 * Peegeldunud kiire lõikepunkti jaoks on lubatud vahemik KITSAM kui peegel
 * ise: |h| < R · √3 / 2 (vt `MAX_RAY_HEIGHT_RATIO`).
 *
 * Kaks põhjust, üks piir:
 *
 * - **θ = 60° (|h| = R·√3/2):** pikendus lõikab peatelge täpselt peegli tipus
 *   ja edasi juba tipust EESPOOL, seega annaks valem nulli ja siis negatiivse
 *   arvu. Funktsiooni lubadus „kaugus peegli taga" ei kehtiks enam.
 * - **θ = 90° (|h| = R, peegli serv):** kiir tabab peeglit riivamisi ja
 *   peegeldub sama teed tagasi; valemis `R · cos 2θ / (2 · cos θ)` oleks
 *   nimetajas cos 90° = 0 ehk lõpmatus. Selle püüab kinni sama piir, sest
 *   R > R·√3/2.
 *
 * Piir on RANGE (`>=`, mitte `>`): täpselt 60° juures on vastus null ja null
 * ei ole „kaugus peegli taga".
 */
function assertHeightHasVirtualCross(radiusM: number, heightM: number): void {
  if (Math.abs(heightM) >= radiusM * MAX_RAY_HEIGHT_RATIO) {
    throw new RangeError(
      `Peegeldunud kiire pikendus ei lõika peatelge peegli taga, kui kiir langeb liiga kõrgelt: |${heightM}| >= ${radiusM} · √3/2`,
    );
  }
}

/**
 * Näilise fookuse kaugus peegli tipust (m): **f = R / 2**.
 *
 * Mooduli keskne valem ja ainus, mida õpilane ise arvutab. Näiline fookus on
 * peegli TAGA peateljel – sinna lõikuvad peegeldunud kiirte pikendused, aga
 * mitte ükski kiir ise.
 *
 * Mida lamedam peegel (suurem R), seda kaugemal on näiline fookus ja seda
 * vähem peegel hajutab. Just seda küsivad explore-1 ja explore-2 ning selle
 * ümber käib väärarusaam `lamedam-hajutab-rohkem`.
 */
export function focalLength(radiusM: number): number {
  assertRadius(radiusM);
  return radiusM / 2;
}

/**
 * Peegli kummumine kohtumispunktis (m): **R − √(R² − h²)**.
 *
 * Kui palju on see peegli punkt, kus kõrgusel h liikuv kiir peegliga kohtub,
 * tipust TAHAPOOLE nihkunud. Tipp kummub valguse poole kõige rohkem, seega on
 * iga teine punkt temast tagapool.
 *
 * Simulatsioon joonistab selle järgi peegli kaare ja kiire kohtumispunkti –
 * kaar EI ole käsitsi kokku pandud Bézier, vaid seesama füüsika, mis nurgad
 * annab.
 *
 * |h| = R on lubatud ja tähendab poolkera: kummumine on siis täpselt R.
 */
export function mirrorBulge(radiusM: number, heightM: number): number {
  assertRadius(radiusM);
  assertHeightIsNumber(heightM);
  assertHeightFitsMirror(radiusM, heightM);
  const bulgeM = radiusM - Math.sqrt(radiusM * radiusM - heightM * heightM);
  assertFiniteResult(bulgeM, "Peegli kummumine");
  return bulgeM;
}

/**
 * Ristsirge nurk peateljega (°): **arcsin(|h| / R)**.
 *
 * Kerapinnal on ristsirge iga punkti oma raadiuse siht – kumerpeeglil läheb
 * see joon peegli TAHA kera keskpunkti. Peateljega PARALLEELSE kiire jaoks on
 * see sama arv, mis langemisnurk; see seos ongi kogu mooduli uudis ja teooria
 * ütleb selle välja.
 *
 * |h| = R on lubatud ja annab 90° (peegli serv).
 */
export function normalAngleDeg(radiusM: number, heightM: number): number {
  assertRadius(radiusM);
  assertHeightIsNumber(heightM);
  assertHeightFitsMirror(radiusM, heightM);
  // Math.min kaitseb ainult ujukoma ümardusvea eest (|h| = R korral võib
  // jagatis tulla 1 + 1e-16 ja asin annaks NaN) – päris liiga suur h on juba
  // ülal veaks visatud.
  const angleDeg =
    Math.asin(Math.min(1, Math.abs(heightM) / radiusM)) * DEGREES_PER_RADIAN;
  assertFiniteResult(angleDeg, "Ristsirge nurk");
  return angleDeg;
}

/**
 * Peateljega paralleelse kiire saatus kumerpeeglil.
 *
 * **Kust `virtualCrossM` valem tuleb** (muidu näeb ta välja nagu maagia):
 * kohtumispunktis on ristsirge raadiuse siht (kera keskpunkt on peegli taga),
 * seega on paralleelse kiire langemisnurk θ = `normalAngleDeg`.
 * Peegeldumisseaduse tõttu on peegeldunud kiire nurk peateljega 2θ, aga
 * teljest EEMALE. Kohtumispunkt on tipust `bulgeM` võrra taga ja peateljest
 * h = R·sin θ kaugusel, seega jõuab peegeldunud kiire tagurpidi pikendus
 * teljeni veel h / tan 2θ = R·cos 2θ / (2·cos θ) võrra tahapoole:
 *
 *     virtualCrossM = bulgeM + R · cos 2θ / (2 · cos θ)
 *
 * Sama avaldis mis nõguspeeglil, sest geomeetria on peegelpilt – ainult
 * tulemus loetakse peegli TAGANT, mitte eest. Arvutus käib siinuse ja
 * koosinuse kaudu, MITTE kraadide kaudu tagasi radiaanidesse: nii ei lisandu
 * valemisse edasi-tagasi teisenduse ümardusviga. Kraadid on ainult see, mida
 * ekraanile pannakse.
 *
 * **h = 0 on kokkulepe:** peateljel levinud kiir tuleb peeglilt sama teed
 * tagasi ega „lõika" telge kusagil. Valem annab siin piirväärtuse R/2, sest
 * see on ainus arv, mis hoiab funktsiooni pidevana (ja UI joonistab h = 0
 * kiire niikuinii sama teed tagasi).
 *
 * Peegeldunud kiir kaldub ALATI peateljest EEMALE (hajub) – seda eraldi
 * väljana ei anta, sest see tuleb kumerpeegli definitsioonist, mitte
 * arvutusest.
 */
export function reflectParallelRay(
  radiusM: number,
  heightM: number,
): ParallelRay {
  assertRadius(radiusM);
  assertHeightIsNumber(heightM);
  assertHeightHasVirtualCross(radiusM, heightM);

  const sinTheta = Math.abs(heightM) / radiusM;
  const cosTheta = Math.sqrt(1 - sinTheta * sinTheta);
  const cosDoubleTheta = 1 - 2 * sinTheta * sinTheta;

  const bulgeM = radiusM - radiusM * cosTheta;
  const incidenceDeg = Math.asin(sinTheta) * DEGREES_PER_RADIAN;
  const virtualCrossM = bulgeM + (radiusM * cosDoubleTheta) / (2 * cosTheta);

  // Ülempiir hoiab cos θ ≥ 0,5, seega siin lõpmatust tekkida ei saa – aga
  // kontroll jääb: kui keegi kunagi piiri lõdvendab, peab see katkema siin,
  // mitte ekraanil oleva vaikselt vale arvuna.
  assertFiniteResult(bulgeM, "Kohtumispunkti kummumine");
  assertFiniteResult(virtualCrossM, "Pikenduse teljelõike kaugus");

  return {
    bulgeM,
    incidenceDeg,
    // Peegeldumisseadus: β = α. Sama arv, mitte teine arvutus – kaks arvutust
    // saaksid ühel päeval lahku minna ja siis ei õpetaks moodul enam seadust.
    reflectionDeg: incidenceDeg,
    deflectionDeg: 2 * incidenceDeg,
    virtualCrossM,
  };
}

/**
 * Sentimeetrid → meetrid. Üks kahest kohast mooduli sees, kus pikkuse ühik
 * muutub: liuguri cm-väärtus läheb siit mudeli valemitesse.
 *
 * Negatiivne on lubatud – see on puhas ühikuteisendus ja kiire kõrgus võib
 * olla ka telje all.
 */
export function metresFromCentimetres(lengthCm: number): number {
  if (!Number.isFinite(lengthCm)) {
    throw new RangeError(`Pikkus peab olema arv, aga oli ${lengthCm}`);
  }
  const lengthM = lengthCm / 100;
  assertFiniteResult(lengthM, "Pikkus meetrites");
  return lengthM;
}

/**
 * Meetrid → sentimeetrid. Teine kahest kohast: mudeli vastus teisendatakse
 * siin enne ekraanile ja ülesande vastuseks panemist.
 *
 * Sisendikontroll ei päästa siin üksi: `centimetresFromMetres(1e308)` on
 * lõpliku arvuna korralik sisend, aga korrutis voolab üle `Infinity`-ks
 * (Codexi leid, samm 4.1mm). Liuguri piirides (50…200 cm) sellist arvu ei
 * teki, aga teisendus on viimane koht enne ekraanile jõudmist – siit ei tohi
 * välja tulla arvu moodi väärtust, mille taga mudel seista ei saa.
 */
export function centimetresFromMetres(lengthM: number): number {
  if (!Number.isFinite(lengthM)) {
    throw new RangeError(`Pikkus peab olema arv, aga oli ${lengthM}`);
  }
  const lengthCm = lengthM * 100;
  assertFiniteResult(lengthCm, "Pikkus sentimeetrites");
  return lengthCm;
}
