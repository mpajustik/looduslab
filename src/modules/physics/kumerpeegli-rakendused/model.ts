/**
 * Kumerpeegel meie ümber – füüsika
 * (sisu/MOODUL-kumerpeegli-rakendused.md „Füüsika (model.ts jaoks)").
 *
 * Ainult puhtad funktsioonid: sama sisend → alati sama väljund, ei Reacti,
 * ei DOM-i, ei juhuslikkust (CLAUDE.md reegel 1). Simulation.tsx ainult kuvab
 * seda, mida siin arvutatakse – ühtki nurka, laiust ega teisendust ei tohi
 * komponendis uuesti välja arvutada.
 *
 * **Mida see moodul arvutab:** ühte asja – kui lai ala ühte peeglisse korraga
 * mahub. Miks kiired hajuvad ja kus on näiline fookus, tuli juba moodulist
 * `kumerpeegel`; siin on selle TAGAJÄRG arvudes. Uut seadust siin ei ole.
 *
 * **Miks see EI ole mooduli `kumerpeegel` mudeli taaskasutus** (spetsi eraldi
 * peatükk): moodulid laaditakse dünaamiliselt ja iga moodul on oma tükk
 * (CLAUDE.md reegel 13) – ristimport tõmbaks ühe mooduli teise bundle'isse ja
 * seoks kaks eraldi arhiveeritavat üksust kokku (reegel 11). Kordus on väike
 * (kaks rida geomeetriat) ja teda valvab ristkontrolli test failis
 * tests/kumerpeegli-rakendused.model.test.ts – TESTIS, mitte rakenduse koodis.
 *
 * ÜHIKUD: kõik pikkused mudeli sees on **meetrites**, kõik nurgad
 * **kraadides** (sama kokkulepe kui `kumerpeegel` ja `noguspeegel`). UI räägib
 * peegli ja vaataja mõõtudest sentimeetrites ja vaadeldava ala laiusest
 * meetrites. Ühik muutub AINULT funktsioonides `metresFromCentimetres` ja
 * `centimetresFromMetres` – möödaminnes vahetatud ühik annab vaikse
 * 100-kordse vea, mida ei õpilane ega õpetaja ei märka.
 *
 * Telgistik ja tähised, mida kogu fail kasutab:
 *
 * - Peegel on seinal, **peatelg** on seinaga risti. Peegli **tipp** on
 *   nullpunkt, kera keskpunkt on peegli TAGA kaugusel R (nagu moodulis
 *   `kumerpeegel`).
 * - `R` (`radiusM`) – kera raadius, mille pinnast peegel välja lõigatud on.
 * - `a` (`apertureM`) – peegli **poolläbimõõt** ehk kaugus peatelje ja peegli
 *   serva vahel. 30 cm läbimõõduga turvapeeglil on a = 15 cm.
 * - `d` (`eyeDistanceM`) – vaataja silma kaugus peegli tipust, peateljel.
 * - `L` (`distanceM`) – kaugus peeglist, kus mõõdame nähtava ala laiust
 *   (poes vahekäigu kaugus, ristmikul ristuva tee kaugus).
 *
 * **Kust vaatevälja valem tuleb** (muidu näeb ta välja nagu maagia): vaatevälja
 * serva määrab kiir, mis peegeldub peegli SERVAST vaataja silma. Serval on
 * ristsirge kera raadiuse siht, seega teeb ta peateljega nurga θ = arcsin(a/R)
 * – täpselt sama nurk, mille moodul `kumerpeegel` arvutab funktsiooniga
 * `normalAngleDeg`. Serva punkt on tipust `mirrorBulge` võrra tahapoole
 * nihkunud, seega teeb silma minev kiir peateljega nurga φ = arctan(a/(d+bulge)).
 * Peegeldumisseaduse tõttu tuleb see kiir peeglile suunast, mis on peateljest
 * φ + 2θ võrra kaldu, ja sama kehtib teisel serval teistpidi:
 *
 *     vaatevälja nurk = 2 · (2θ + φ)
 *
 * Tasasel peeglil on kera raadius lõpmatu ehk θ = 0 ja bulge = 0, seega jääb
 * alles ainult 2φ = 2 · arctan(a/d). **Sama valem, üks liige vähem** – see
 * ongi kogu mooduli füüsika ühes reas: kumer pind lisab vaateväljale liikme
 * 4θ, mis ei sõltu üldse sellest, kui kaugel vaataja seisab.
 *
 * **Idealiseeringud** (UI ega õpetajajuhend ei tohi neid päris füüsikana
 * esitada):
 *
 * 1. **Vaataja silm on punkt peateljel.** Päris müüja seisab kõrval ja tema
 *    vaateväli on veidi nihkes; laius jääb sama, suund muutub.
 * 2. **Äärmine kiir väljub peegli servast**, mitte tipust – see EI ole
 *    idealiseering, vaid valemis sees (vt `convexViewWidth`). Idealiseering on
 *    see, et serva punkt võetakse täpselt kõrguselt a: päris peegli serv on
 *    kaarjas ja peeglil on raam.
 * 3. **Peegel on kerapinna osa** ja kogu peegli ulatuses sama kõverusega.
 *    Päris auto külgpeegel on sageli asfääriline (servas kumeram) – siis ei ole
 *    ühte R-i ja see mudel teda ei kirjelda.
 * 4. **Peegel peegeldab kogu valguse** ja peegli enda paksust ei arvestata.
 * 5. **Kõik on ühes tasapinnas** (ülalt vaade). Päris peegel on ümar ja tema
 *    vaateväli on koonus – laius kõrgussuunas tuleb sama valemiga, aga seda
 *    moodul ei kuva.
 *
 * Vigane sisend VISKAB vea, ta ei „paranda" ennast vaikselt – vaikne parandus
 * peidaks ära vea kutsuvas koodis (nt liuguri vale ülempiir) ja õpilane näeks
 * õiget arvu vale sisendi pealt.
 */

/**
 * Simulatsiooni liugurite piirid ja sammud SENTIMEETRITES
 * (sisu/MOODUL-kumerpeegli-rakendused.md „explore").
 *
 * Erandlikult cm, mitte SI: need arvud EI lähe valemitesse, vaid on
 * kasutajaliidese liuguri otsad, ja liugur näitab õpilasele sentimeetreid.
 * Simulation.tsx annab liuguri väärtuse mudelisse `metresFromCentimetres`
 * kaudu – see on ainus tee sisse.
 *
 * Miks MUDELIS, mitte Simulation.tsx-is: need piirid otsustavad, kas
 * ülesannete vastused on saavutatavad ja kas kogu liugurivõres püsib mudel
 * mõistlike arvude juures (poolnurk kaugel 90° piirist). Mõlemat kontrollib
 * test, mis käib kogu võre läbi.
 */
export const SLIDERS = {
  /**
   * Peegli kõverusraadius R – algväärtus 100 cm. Alumine piir 80 cm hoiab
   * a/R ≤ 0,1875 (peegel jääb kera peal tagasihoidlikuks lõiguks).
   */
  radiusCm: { min: 80, max: 300, step: 10 },
  /** Vaataja kaugus peeglist d – algväärtus 200 cm. */
  eyeDistanceCm: { min: 50, max: 500, step: 10 },
} as const satisfies Record<string, { min: number; max: number; step: number }>;

/**
 * Peegli poolläbimõõt simulatsioonis (cm): 15 cm ehk läbimõõt 30 cm.
 *
 * See on ekraanil kirjas ja liuguriga EI muutu – kogu mooduli väide on, et
 * SAMA SUUR peegel näitab kumerana palju laiemat ala. Kui peegli suurus
 * muutuks, kaoks võrdlusest mõte.
 */
export const MIRROR_APERTURE_CM = 15;

/**
 * Vahekäigu kaugus peeglist simulatsioonis (cm): 5 m.
 *
 * Ka see on joonisel kirjas ja liuguriga ei muutu: nähtava lõigu pikkust saab
 * võrrelda ainult siis, kui mõlemat peeglit mõõdetakse samal joonel.
 */
export const AISLE_DISTANCE_CM = 500;

/**
 * Suurim vaatevälja POOLNURK (°), mille juures mudel veel vastab.
 *
 * 2θ + φ ≥ 90° tähendab, et vaatevälja serv ei osutaks enam peeglist ETTE,
 * vaid taha, ja laiusevalemi tangens läheks negatiivseks. Mudel ei vasta
 * küsimusele, mille peale tema sõnastus enam ei kehti – sama põhimõte nagu
 * `reflectParallelRay` piiril moodulis `kumerpeegel`. Simulatsiooni
 * liugurivõres jääb poolnurk alla 38°, seega õpilane seda piiri ei näe.
 */
export const MAX_HALF_ANGLE_DEG = 90;

const DEGREES_PER_RADIAN = 180 / Math.PI;

/** Peatelje-suunalised pikkused peavad olema päris pikkused. */
function assertPositive(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${what} peab olema positiivne arv, aga oli ${value}`);
  }
}

/**
 * Mõõtmiskaugus L tohib olla ka null: „peeglil ninapidi kinni" on aus küsimus
 * ja vastus on peegli enda laius. Negatiivne kaugus ei ole.
 */
function assertNotNegative(value: number, what: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(
      `${what} ei tohi olla negatiivne arv, aga oli ${value}`,
    );
  }
}

/**
 * Ka lõplikest sisenditest võib tulla lõpmatus või NaN.
 *
 * Sisendikontroll ei päästa siin: `mirrorBulge(1e308, 1e307)` saab iga
 * argumendi eraldi võttes korraliku arvuna läbi, aga `R²` ja `a²` voolavad
 * mõlemad üle `Infinity`-ks ja vahe `Infinity − Infinity` annab NaN, kuigi
 * õige vastus oleks lõplik arv. Sama joon on `kumerpeegel/model.ts`-is,
 * `noguspeegel/model.ts`-is ja `vedeliku-rohk/model.ts`-is (Codexi leiud,
 * sammud 4.1ii ja 4.1mm).
 */
function assertFiniteResult(value: number, what: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${what} ei mahu arvu sisse: tuli ${value}`);
  }
}

/**
 * Peegel peab kera peal olema päris lõik: **0 < a < R**.
 *
 * a = R oleks poolkera, mille serval on ristsirge peateljega risti ja
 * vaateväli kaotab mõtte; a > R ei ole üldse kera peal.
 */
function assertApertureFitsSphere(radiusM: number, apertureM: number): void {
  assertPositive(radiusM, "Kõverusraadius");
  assertPositive(apertureM, "Peegli poolläbimõõt");
  if (apertureM >= radiusM) {
    throw new RangeError(
      `Peegel ei saa olla oma kerast suurem: ${apertureM} >= ${radiusM}`,
    );
  }
}

/**
 * Vaatevälja **poolnurk** radiaanides: **2θ + φ**.
 *
 * Sisemine abifunktsioon – väljapoole läheb alati täisnurk (`viewAngleDeg`),
 * sest just seda õpilane ekraanil näeb. Nii ei saa keegi kogemata poolnurka
 * täisnurga pähe kuvada.
 *
 * Arvutus käib radiaanides ja kraadid tehakse alles lõpus: nii ei lisandu
 * valemisse edasi-tagasi teisenduse ümardusviga (sama muster mis
 * `kumerpeegel/model.ts` funktsioonis `reflectParallelRay`).
 */
function halfViewAngleRad(
  radiusM: number,
  apertureM: number,
  eyeDistanceM: number,
): number {
  assertApertureFitsSphere(radiusM, apertureM);
  assertPositive(eyeDistanceM, "Vaataja kaugus peeglist");

  const normalRad = Math.asin(apertureM / radiusM);
  const bulgeM = mirrorBulge(radiusM, apertureM);
  const eyeRad = Math.atan(apertureM / (eyeDistanceM + bulgeM));
  const halfRad = 2 * normalRad + eyeRad;

  assertFiniteResult(halfRad, "Vaatevälja poolnurk");
  if (halfRad * DEGREES_PER_RADIAN >= MAX_HALF_ANGLE_DEG) {
    // Nii kumer peegel ja nii lähedal seisev vaataja, et vaatevälja serv ei
    // osutaks enam peeglist ette. Mudel ei paranda seda vaikselt ära.
    throw new RangeError(
      `Vaateväli ei osuta enam peeglist ette: poolnurk ${(halfRad * DEGREES_PER_RADIAN).toFixed(1)}° >= ${MAX_HALF_ANGLE_DEG}°`,
    );
  }
  return halfRad;
}

/**
 * Peegli serva nihe tipust tahapoole (m): **R − √(R² − a²)**.
 *
 * Sama valem, mis moodulis `kumerpeegel` – aga **argumendi tähendus on teine**
 * ja seepärast on ka lubatud vahemik teine. Seal on teine argument ühe KIIRE
 * kõrgus ja h = 0 (peateljel levinud kiir) on täiesti mõistlik sisend; siin on
 * ta PEEGLI poolläbimõõt ja laiuseta peeglit ei ole olemas, seega a = 0 viskab
 * vea. Kui keegi need kaks funktsiooni kunagi kokku paneb, kaob just see vahe.
 */
export function mirrorBulge(radiusM: number, apertureM: number): number {
  assertApertureFitsSphere(radiusM, apertureM);
  const bulgeM = radiusM - Math.sqrt(radiusM * radiusM - apertureM * apertureM);
  assertFiniteResult(bulgeM, "Peegli serva nihe");
  return bulgeM;
}

/**
 * Kumerpeegli vaatevälja **täisnurk** (°): **2 · (2θ + φ)**.
 *
 * Vaateväli on see ala, mida peeglis korraga näha on. Mida kumeram peegel
 * (väiksem R), seda laiem vaateväli; vaataja kaugus mõjub ainult liikmele φ,
 * seega eemale minnes vaateväli kitseneb, aga liige 4θ jääb alles. Just see
 * teebki kumerpeegli kasulikuks seal, kus vaataja on kaugel.
 */
export function viewAngleDeg(
  radiusM: number,
  apertureM: number,
  eyeDistanceM: number,
): number {
  const angleDeg =
    2 * halfViewAngleRad(radiusM, apertureM, eyeDistanceM) * DEGREES_PER_RADIAN;
  assertFiniteResult(angleDeg, "Vaatevälja nurk");
  return angleDeg;
}

/**
 * Sama suure TASASE peegli vaatevälja täisnurk (°): **2 · arctan(a / d)**.
 *
 * Võrdlusarv, ilma milleta ei ole kumerpeegli number midagi väärt. Raadiust ta
 * ei võta, sest tasasel peeglil seda ei ole – see ongi valemis nähtav vahe:
 * sama avaldis, aga liikmeta 4θ.
 */
export function flatViewAngleDeg(
  apertureM: number,
  eyeDistanceM: number,
): number {
  assertPositive(apertureM, "Peegli poolläbimõõt");
  assertPositive(eyeDistanceM, "Vaataja kaugus peeglist");
  const angleDeg =
    2 * Math.atan(apertureM / eyeDistanceM) * DEGREES_PER_RADIAN;
  assertFiniteResult(angleDeg, "Tasapeegli vaatevälja nurk");
  return angleDeg;
}

/**
 * Kumerpeeglis nähtava ala laius (m) kaugusel L:
 * **2 · (a + (L + bulge) · tan(2θ + φ))**.
 *
 * **Siin on kerge eksida:** vaatevälja koonus EI alga peegli tipust, vaid
 * peegli SERVADEST – peegel ise on 2a lai ja äärmine kiir väljub serva
 * punktist, mis on peateljest a kaugusel ja tipust `mirrorBulge` võrra taga.
 * Seepärast on peegli oma laius 2a valemis alati sees. Kontroll: L = 0 annab
 * peegli enda laiuse (kumeral veidi rohkem kui 2a, sest serva punkt on tipust
 * `bulge` võrra taga) – tipust arvutav valem annaks siin nulli.
 *
 * Nurgast üksi laiust välja ei tule, seepärast on `flatViewWidth` eraldi
 * funktsioon, mitte sama funktsioon teise nurgaga.
 */
export function convexViewWidth(
  radiusM: number,
  apertureM: number,
  eyeDistanceM: number,
  distanceM: number,
): number {
  const halfRad = halfViewAngleRad(radiusM, apertureM, eyeDistanceM);
  assertNotNegative(distanceM, "Mõõtmiskaugus peeglist");

  const bulgeM = mirrorBulge(radiusM, apertureM);
  const widthM =
    2 * (apertureM + (distanceM + bulgeM) * Math.tan(halfRad));

  assertFiniteResult(widthM, "Nähtava ala laius");
  return widthM;
}

/**
 * Sama suures TASAPEEGLIS nähtava ala laius (m) kaugusel L:
 * **2 · a · (d + L) / d**.
 *
 * Tasapeeglil on bulge = 0 ja tan(nurk/2) = a/d, seega taandub üldine valem
 * ühte murdu. Raadiust ta ei võta. L = 0 annab täpselt peegli laiuse 2a.
 */
export function flatViewWidth(
  apertureM: number,
  eyeDistanceM: number,
  distanceM: number,
): number {
  assertPositive(apertureM, "Peegli poolläbimõõt");
  assertPositive(eyeDistanceM, "Vaataja kaugus peeglist");
  assertNotNegative(distanceM, "Mõõtmiskaugus peeglist");

  const widthM = (2 * apertureM * (eyeDistanceM + distanceM)) / eyeDistanceM;
  assertFiniteResult(widthM, "Tasapeegli nähtava ala laius");
  return widthM;
}

/**
 * Sentimeetrid → meetrid. Üks kahest kohast mooduli sees, kus pikkuse ühik
 * muutub: liuguri cm-väärtus läheb siit mudeli valemitesse.
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
 * siin enne ekraanile panemist (peegli serva nihe on cm-des loetav arv).
 *
 * Sisendikontroll ei päästa siin üksi: `centimetresFromMetres(1e308)` on
 * lõpliku arvuna korralik sisend, aga korrutis voolab üle `Infinity`-ks
 * (Codexi leid, samm 4.1mm). Teisendus on viimane koht enne ekraanile
 * jõudmist – siit ei tohi välja tulla arvu moodi väärtust, mille taga mudel
 * seista ei saa.
 */
export function centimetresFromMetres(lengthM: number): number {
  if (!Number.isFinite(lengthM)) {
    throw new RangeError(`Pikkus peab olema arv, aga oli ${lengthM}`);
  }
  const lengthCm = lengthM * 100;
  assertFiniteResult(lengthCm, "Pikkus sentimeetrites");
  return lengthCm;
}
