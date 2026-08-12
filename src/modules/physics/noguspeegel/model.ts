/**
 * Nõguspeegel – füüsika (sisu/MOODUL-noguspeegel.md „Füüsika").
 *
 * Ainult puhtad funktsioonid: sama sisend → alati sama väljund, ei Reacti,
 * ei DOM-i, ei juhuslikkust (CLAUDE.md reegel 1). Simulation.tsx ainult kuvab
 * seda, mida siin arvutatakse – ühtki nurka ega teisendust ei tohi komponendis
 * uuesti välja arvutada.
 *
 * **Mida see moodul juurde toob:** peegeldumisseadus ise (moodul
 * `peegeldumisseadus`) EI muutu. Muutub ainult see, kust ristsirge tuleb:
 * kerapinnal on iga punkti ristsirge tema RAADIUSE siht ehk joon kera
 * keskpunkti poole. Kogu ülejäänud fail on selle ühe lause tagajärg.
 *
 * Mudel arvutab ÜHE kiire teekonna, mitte ainult ilusat koonduvat kimpu –
 * ainekava (P1-T2) nõuab peegeldumisseaduse kandmist kõverale pinnale, seega
 * peab valitud kiire langemis- ja peegeldumisnurk tulema mudelist.
 *
 * ÜHIKUD: kõik pikkused mudeli sees on **meetrites** (moodulileping:
 * SI-ühikud sees, teisendused eraldi funktsioonides), kõik nurgad kraadides.
 * Õpilasega räägib UI sentimeetrites – cm on 8. klassile õige ühik. Ühik
 * muutub AINULT funktsioonides `metresFromCentimetres` ja
 * `centimetresFromMetres` (sama muster mis `vedeliku-rohk/model.ts`). Kui
 * mõni arvutus vahetab ühikut „möödaminnes", tuleb vaikne 100-kordne viga,
 * mida ei õpilane ega õpetaja ei märka.
 *
 * Telgistik ja tähised, mida kogu fail kasutab:
 *
 * - Peegli **tipp** (peatelje ja peegli lõikepunkt) on nullpunkt.
 * - **Peatelg** on x-telg; kaugusi peeglist mõõdetakse tipust ette,
 *   positiivse arvuna.
 * - `R` (`radiusM`) – kõverusraadius ehk selle kera raadius, mille osa peegel
 *   on. Kera keskpunkt C on peegli ees peateljel kaugusel R.
 * - `h` (`heightM`) – kiire kõrgus ehk kaugus peateljest kohas, kus kiir
 *   peegliga kohtub. Negatiivne h on telje all olev kiir.
 *
 * Kõik nurgad on **mittenegatiivsed** ja `+h` ning `−h` annavad sama vastuse:
 * peegel on peatelje suhtes sümmeetriline ja peegeldumise SUUND tuleb
 * joonisel h märgist, mitte mudelist. Nii ei ole siin ühtegi märgikokkulepet,
 * mida saaks valesti mõista.
 *
 * **Idealiseeringud** (UI ega õpetajajuhend ei tohi neid päris füüsikana
 * esitada):
 *
 * 1. **Peegel on kerapinna osa.** Päris prožektori, autotule ja teleskoobi
 *    peegel on parabool just sellepärast, et parabool koondab KÕIK
 *    peateljega paralleelsed kiired täpselt ühte punkti, kerapind mitte
 *    (vt `SAFE_HEIGHT_RATIO`).
 * 2. **Peegel peegeldab kogu valguse.** Neeldumist ja tuhmumist siin ei ole;
 *    päris peegel peegeldab ~90–95 %.
 * 3. **Kiir on lõputult peenike joon.** Päris valgusvihul on laius ja fookus
 *    on väike laik, mitte matemaatiline punkt.
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
 * (sisu/MOODUL-noguspeegel.md „explore").
 *
 * Erandlikult cm, mitte SI: need arvud EI lähe valemitesse, vaid on
 * kasutajaliidese liuguri otsad, ja liugur näitab õpilasele sentimeetreid.
 * Simulation.tsx annab liuguri väärtuse mudelisse `metresFromCentimetres`
 * kaudu – see on ainus tee sisse.
 *
 * Miks MUDELIS, mitte Simulation.tsx-is: need piirid otsustavad, kas
 * ülesannete vastused (fookus 50 cm ja 80 cm) on üldse saavutatavad ja kas
 * h/R püsib turvavööndis (`SAFE_HEIGHT_RATIO`). Mõlemat kontrollib test.
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
 * Turvavöönd, mille sees tohib UI-s öelda „kõik kiired koonduvad ühte punkti".
 *
 * Kerapind EI koonda paralleelseid kiiri täpselt ühte punkti (sfääriline
 * aberratsioon): mida kaugemal peateljest kiir peeglile langeb, seda LÄHEMALE
 * peeglile ta telje lõikab. Kui |h| ≤ 0,2 · R, jääb erinevus fookuse
 * kaugusest R/2 alla 3 % (halvim juht 2,1 %) ehk ekraanil ühte punkti.
 *
 * Simulatsiooni arvud on selle järgi valitud: poolkõrgus 10 cm ja raadius
 * vähemalt 50 cm annavad h/R ≤ 0,2. Kui keegi hiljem lubab suuremat suhet,
 * läheb selle konstandi test punaseks – see on lause „koonduvad ühte punkti"
 * ainus valve.
 */
export const SAFE_HEIGHT_RATIO = 0.2;

/** Peateljega paralleelse kiire saatus nõguspeeglil. */
export interface ParallelRay {
  /** Kohtumispunkti sügavus peegli tipust piki peatelge (m). */
  depthM: number;
  /** Langemisnurk α ristsirge suhtes (°). */
  incidenceDeg: number;
  /** Peegeldumisnurk β (°) – peegeldumisseaduse tõttu alati võrdne α-ga. */
  reflectionDeg: number;
  /** Kui palju peegeldunud kiir peateljest kaldub (°): 2α. */
  deflectionDeg: number;
  /** Kus peegeldunud kiir peatelge lõikab, peegli tipust (m). */
  axisCrossM: number;
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
 * Sisendikontroll ei päästa siin: `mirrorDepth(1e308, 1e307)` saab iga
 * argumendi eraldi võttes korraliku arvuna läbi, aga `R²` ja `h²` voolavad
 * mõlemad üle `Infinity`-ks ja vahe `Infinity − Infinity` annab NaN, kuigi
 * õige vastus oleks lõplik arv. Sama oht on jagamisel, kus nimetaja üle
 * voolab – siis kukub jagatis nulli ja vastuseks tuleks arvu moodi arv,
 * mida keegi kahtlustama ei hakkaks.
 *
 * Tänases rakenduses sellist sisendit ei teki (liugur annab 50…200 cm), aga
 * mudel ei tohi tagastada arvu, mille taga ta seista ei saa – see on sama
 * joon, mis kogu ülejäänud failil (Codexi leid, samm 4.1ii; sama parandus on
 * `vedeliku-rohk/model.ts`-is).
 */
function assertFiniteResult(value: number, what: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${what} ei mahu arvu sisse: tuli ${value}`);
  }
}

/**
 * Miks lubatud h-vahemik EI ole kõigil funktsioonidel sama.
 *
 * Peegli serv (|h| = R) on ühtedele mõistlik sisend ja teisele mitte:
 * `mirrorDepth` ja `normalAngleDeg` annavad seal ausad arvud (poolkera
 * sügavus R ja ristsirge nurk 90°), aga `reflectParallelRay` valemis oleks
 * nimetajas cos 90° = 0. Servale langev kiir tabab peeglit riivamisi ja
 * peegeldub sama teed tagasi – ta ei lõika peatelge KUNAGI. Lõpmatust ei
 * tohi vaikselt tagastada, seega on see seal viga.
 *
 * @param edgeAllowed kas |h| = R on lubatud
 */
function assertHeightFits(
  radiusM: number,
  heightM: number,
  edgeAllowed: boolean,
): void {
  const height = Math.abs(heightM);
  if (edgeAllowed ? height > radiusM : height >= radiusM) {
    throw new RangeError(
      edgeAllowed
        ? `Kiire kõrgus ei mahu peeglile: |${heightM}| > ${radiusM}`
        : `Peegeldunud kiir ei lõika peatelge, kui kiir tabab peegli serva: |${heightM}| >= ${radiusM}`,
    );
  }
}

/**
 * Fookuse kaugus peegli tipust (m): **f = R / 2**.
 *
 * Mooduli keskne valem ja ainus, mida õpilane ise arvutab. Fookus on peegli
 * EES peateljel – sinna koondub peateljega paralleelne valgusvihk.
 *
 * Mida lamedam peegel (suurem R), seda kaugemal on fookus. Just seda küsib
 * ennustus (samm 3) ja väärarusaam `lamedam-koondab-lahemale`.
 */
export function focalLength(radiusM: number): number {
  assertRadius(radiusM);
  return radiusM / 2;
}

/**
 * Peegli sügavus kohtumispunktis (m): **R − √(R² − h²)**.
 *
 * Kui sügaval peegli tipust (piki peatelge) on see peegli punkt, kus kõrgusel
 * h liikuv kiir peegliga kohtub. Simulatsioon joonistab selle järgi peegli
 * kaare ja kiire kohtumispunkti – kaar EI ole käsitsi kokku pandud Bézier,
 * vaid seesama füüsika, mis nurgad annab.
 *
 * |h| = R on lubatud ja tähendab poolkera: sügavus on siis täpselt R.
 */
export function mirrorDepth(radiusM: number, heightM: number): number {
  assertRadius(radiusM);
  assertHeightIsNumber(heightM);
  assertHeightFits(radiusM, heightM, true);
  const depthM = radiusM - Math.sqrt(radiusM * radiusM - heightM * heightM);
  assertFiniteResult(depthM, "Peegli sügavus");
  return depthM;
}

/**
 * Ristsirge nurk peateljega (°): **arcsin(|h| / R)**.
 *
 * Kerapinnal on ristsirge iga punkti oma raadiuse siht, seega on see ühtlasi
 * nurk peatelje ja kera keskpunkti suunas mineva joone vahel. Peateljega
 * PARALLEELSE kiire jaoks on see sama arv, mis langemisnurk – see seos ongi
 * kogu mooduli uudis ja teooria ütleb selle välja.
 *
 * |h| = R on lubatud ja annab 90° (peegli serv).
 */
export function normalAngleDeg(radiusM: number, heightM: number): number {
  assertRadius(radiusM);
  assertHeightIsNumber(heightM);
  assertHeightFits(radiusM, heightM, true);
  // Math.min kaitseb ainult ujukoma ümardusvea eest (|h| = R korral võib
  // jagatis tulla 1 + 1e-16 ja asin annaks NaN) – päris liiga suur h on juba
  // ülal veaks visatud.
  const angleDeg =
    Math.asin(Math.min(1, Math.abs(heightM) / radiusM)) * DEGREES_PER_RADIAN;
  assertFiniteResult(angleDeg, "Ristsirge nurk");
  return angleDeg;
}

/**
 * Peateljega paralleelse kiire saatus nõguspeeglil.
 *
 * **Kust `axisCrossM` valem tuleb** (muidu näeb ta välja nagu maagia):
 * kohtumispunktis on ristsirge raadiuse siht, seega on paralleelse kiire
 * langemisnurk θ = `normalAngleDeg`. Peegeldumisseaduse tõttu on peegeldunud
 * kiire nurk peateljega 2θ. Kohtumispunkt on tipust `depthM` kaugusel ja
 * peateljest h = R·sin θ kaugusel, seega jõuab peegeldunud kiir teljeni veel
 * h / tan 2θ = R·cos 2θ / (2·cos θ) võrra edasi:
 *
 *     axisCrossM = depthM + R · cos 2θ / (2 · cos θ)
 *
 * Arvutus käib siin siinuse ja koosinuse kaudu, MITTE kraadide kaudu tagasi
 * radiaanidesse – nii ei lisandu valemisse edasi-tagasi teisenduse
 * ümardusviga. Kraadid on ainult see, mida ekraanile pannakse.
 *
 * **h = 0 on kokkulepe:** peateljel levinud kiir tuleb peeglilt sama teed
 * tagasi ega „lõika" telge kusagil. Valem annab siin piirväärtuse R/2, sest
 * see on ainus arv, mis hoiab funktsiooni pidevana (ja UI joonistab h = 0
 * kiire niikuinii sama teed tagasi).
 *
 * Peegeldunud kiir kaldub ALATI peatelje poole – seda eraldi väljana ei
 * anta, sest see tuleb nõguspeegli definitsioonist, mitte arvutusest.
 */
export function reflectParallelRay(
  radiusM: number,
  heightM: number,
): ParallelRay {
  assertRadius(radiusM);
  assertHeightIsNumber(heightM);
  assertHeightFits(radiusM, heightM, false);

  const sinTheta = Math.abs(heightM) / radiusM;
  const cosTheta = Math.sqrt(1 - sinTheta * sinTheta);
  const cosDoubleTheta = 1 - 2 * sinTheta * sinTheta;

  const depthM = radiusM - radiusM * cosTheta;
  const incidenceDeg = Math.asin(sinTheta) * DEGREES_PER_RADIAN;
  const axisCrossM = depthM + (radiusM * cosDoubleTheta) / (2 * cosTheta);

  // Sügavus siin ei saa üle voolata (ruutu ei võeta), aga teljelõige saab:
  // peegli serva lähedal on cos θ pisike ja hiiglasliku R korral kasvab
  // jagatis lõpmatuseks.
  assertFiniteResult(depthM, "Kohtumispunkti sügavus");
  assertFiniteResult(axisCrossM, "Teljelõike kaugus");

  return {
    depthM,
    incidenceDeg,
    // Peegeldumisseadus: β = α. Sama arv, mitte teine arvutus – kaks arvutust
    // saaksid ühel päeval lahku minna ja siis ei õpetaks moodul enam seadust.
    reflectionDeg: incidenceDeg,
    deflectionDeg: 2 * incidenceDeg,
    axisCrossM,
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
  return lengthCm / 100;
}

/**
 * Meetrid → sentimeetrid. Teine kahest kohast: mudeli vastus teisendatakse
 * siin enne ekraanile ja ülesande vastuseks panemist.
 */
export function centimetresFromMetres(lengthM: number): number {
  if (!Number.isFinite(lengthM)) {
    throw new RangeError(`Pikkus peab olema arv, aga oli ${lengthM}`);
  }
  return lengthM * 100;
}
