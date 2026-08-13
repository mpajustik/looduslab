/**
 * Nõguspeegel meie ümber – füüsika
 * (sisu/MOODUL-noguspeegli-rakendused.md „Füüsika (model.ts jaoks)").
 *
 * Ainult puhtad funktsioonid: sama sisend → alati sama väljund, ei Reacti,
 * ei DOM-i, ei juhuslikkust (CLAUDE.md reegel 1). Simulation.tsx ainult kuvab
 * seda, mida siin arvutatakse – ühtki laiust, plekki ega teisendust ei tohi
 * komponendis uuesti välja arvutada.
 *
 * **Mida see moodul arvutab:** ühte asja kahes suunas – kui laiaks valgusvihk
 * läheb. Miks kiired fookusesse koonduvad, tuli juba moodulist `noguspeegel`;
 * siin on selle TAGAJÄRG arvudes. Uut seadust siin ei ole.
 *
 * **Miks see EI ole mooduli `noguspeegel` mudeli taaskasutus** (spetsi eraldi
 * peatükk): moodulid laaditakse dünaamiliselt ja iga moodul on oma tükk
 * (CLAUDE.md reegel 13) – ristimport tõmbaks ühe mooduli teise bundle'isse ja
 * seoks kaks eraldi arhiveeritavat üksust kokku (reegel 11). Kordus on üks rida
 * (R / 2) ja teda valvab ristkontrolli test failis
 * tests/noguspeegli-rakendused.model.test.ts – TESTIS, mitte rakenduse koodis.
 * Sama otsus ja sama põhjendus nagu paaril
 * `kumerpeegel` / `kumerpeegli-rakendused`.
 *
 * ÜHIKUD: kõik pikkused mudeli sees on **meetrites**, kõik nurgad
 * **kraadides** (sama kokkulepe kui `noguspeegel`, `kumerpeegel` ja
 * `kumerpeegli-rakendused`). UI räägib peegli ja pirni mõõtudest
 * sentimeetrites ja millimeetrites, valgusringi laiusest meetrites. Ühik
 * muutub AINULT neljas teisendusfunktsioonis siinsamas failis – möödaminnes
 * vahetatud ühik annab vaikse 10- või 100-kordse vea, mida ei õpilane ega
 * õpetaja ei märka.
 *
 * Telgistik ja tähised, mida kogu fail kasutab:
 *
 * - Peegli **tipp** on nullpunkt, **peatelg** on peegli sümmeetriatelg. Kera
 *   keskpunkt on peegli EES kaugusel R (nagu moodulis `noguspeegel`).
 * - `R` (`radiusM`) – kera raadius, mille pinnast peegel välja lõigatud on.
 * - `f` (`focalLengthM`) – fookuse kaugus tipust, f = R / 2.
 * - `D` (`mirrorDiameterM`) – peegli **läbimõõt** (mitte poolläbimõõt: siin ei
 *   ole ühtki poolt telge vaja, valgusvihk on kogu peegli laiune).
 * - `s` (`sourceSizeM`) – valgusallika **suurus** ehk hõõgniidi või LED-i kiibi
 *   läbimõõt. Punktallikat päris maailmas ei ole ja just sellest tuleb kogu
 *   selle mooduli „hind".
 * - `L` (`distanceM`) – kaugus peeglist, kus valgusvihu laiust mõõdame.
 * - `α` (`angularSizeDeg`) – kauge allika näiline nurkläbimõõt kraadides.
 *
 * **Kust valem tuleb (suund 1: fookusest välja).** Fookusesse pandud
 * punktallika kiired lähevad peeglilt tagasi peateljega paralleelselt (moodul
 * `noguspeegel`). Päris pirn ei ole punkt: iga pirni punkt, mis on peateljest
 * y kaugusel, annab omaette paralleelse kimbu, mis on peateljest y / f nurga
 * võrra kaldu. Pirni servad on peateljest s / 2 kaugusel, seega on kogu vihu
 * lahtiminek (täisnurk) s / f radiaanides ja kaugusel L on valgusring peegli
 * laiuse võrra pluss lahtimineku jagu laiem:
 *
 *     valgusringi läbimõõt = D + L · s / f
 *
 * Peegli läbimõõt D mõjub ainult liidetavana, mitte lahtiminekus: SUUREM
 * peegel annab kaugel laiema, mitte kitsama valgusringi. Kitsa kiire teeb
 * väike allikas ja pikk fookuskaugus.
 *
 * **Kust valem tuleb (suund 2: paralleelselt sisse).** Sama geomeetria
 * tagurpidi: kaugelt tuleva allika kiired on omavahel paralleelsed, aga
 * allikas ise ei ole punkt – ta paistab nurga α suuruse kettana. Peateljega
 * nurga β võrra kaldu tulev paralleelne kimp koondub fookustasandis punkti,
 * mis on teljest f · tan β kaugusel, seega on fookuses tekkiv valgusplekk
 * ketas läbimõõduga
 *
 *     valgusplekk = 2 · f · tan(α / 2)
 *
 * Väikeste nurkade juures on see praktiliselt f · α (α radiaanides), aga mudel
 * arvutab tangensiga – nii ei pea keegi hiljem mõtlema, kas nurk on
 * „piisavalt väike".
 *
 * **Idealiseeringud** (UI ega õpetajajuhend ei tohi neid päris füüsikana
 * esitada):
 *
 * 1. **Peegel on kerapinna osa.** Päris prožektori, teleskoobi ja päikeseahju
 *    peegel on parabool. Kerapeeglil ei koondu servadelt tulevad kiired
 *    täpselt samasse punkti (sfääriline aberratsioon) ja plekk on tegelikult
 *    suurem, kui valem ütleb. Valem kehtib hästi, kui peegli läbimõõt jääb
 *    fookuskaugusest väiksemaks (D ≤ f) – just see määrab simulatsiooni
 *    liuguri alumise piiri, mitte ilutunne.
 * 2. **Allikas on peegli ees täpselt fookuses** ja tema pind on peatelje
 *    suhtes risti. Nihutatud pirn annab hajuva või koonduva kimbu – seda mudel
 *    EI arvuta (selleks oleks vaja peeglivalemit, mis on gümnaasium).
 * 3. **Kogu peeglile langev valgus peegeldub** ja jõuab plekki või vihku.
 *    Päris peegel peegeldab 85–95 % ja osa valgust läheb allikast otse peeglist
 *    mööda välja (taskulambi „udu" ümber kiire).
 * 4. **Valgus levib takistuseta.** Atmosfääri hajumist, tolmu ja vihma mudel ei
 *    tunne – päris prožektori kiir kaob udus ära palju varem, kui valem ütleb.
 * 5. **Kõik on ühes tasapinnas** (külgvaade). Päris vihk ja päris plekk on
 *    ringid; läbimõõt tuleb sama valemiga, aga mudel ühtki pindala peale
 *    koondumisteguri ei arvuta.
 * 6. **Difraktsiooni ei ole.** Väga väikese allika ja väga suure peegli juures
 *    paneb piiri valguse lainelisus, mitte geomeetria.
 *
 * Vigane sisend VISKAB vea, ta ei „paranda" ennast vaikselt – vaikne parandus
 * peidaks ära vea kutsuvas koodis (nt liuguri vale ülempiir) ja õpilane näeks
 * õiget arvu vale sisendi pealt.
 */

/**
 * Simulatsiooni liugurite piirid ja sammud KASUTAJA ÜHIKUTES
 * (sisu/MOODUL-noguspeegli-rakendused.md „explore").
 *
 * Erandlikult cm ja mm, mitte SI: need arvud EI lähe valemitesse, vaid on
 * kasutajaliidese liuguri otsad ja liugur näitab õpilasele sentimeetreid ja
 * millimeetreid. Simulation.tsx annab liuguri väärtuse mudelisse
 * `metresFromCentimetres` või `metresFromMillimetres` kaudu – see on ainus tee
 * sisse.
 *
 * Miks MUDELIS, mitte Simulation.tsx-is: need piirid otsustavad, kas
 * ülesannete vastused on saavutatavad ja kas kogu liugurivõres püsib mudel
 * mõistlike arvude juures (valgusring mahub seina peale). Mõlemat kontrollib
 * test, mis käib kogu võre läbi.
 */
export const SLIDERS = {
  /**
   * Peegli kõverusraadius R – algväärtus 20 cm ehk fookuskaugus 10 cm.
   *
   * Alumine piir 20 cm ei ole ilutunne: seal on fookuskaugus täpselt peegli
   * läbimõõdu jagu (f = D = 10 cm) ja sügavamal peeglil ei kehti enam
   * kerapinna lähendus, mille peale kogu mudel ehitatud on (idealiseering 1).
   */
  radiusCm: { min: 20, max: 60, step: 2 },
  /** Pirni suurus s – algväärtus 2 mm ehk LED-kiip. */
  sourceSizeMm: { min: 1, max: 20, step: 1 },
} as const satisfies Record<string, { min: number; max: number; step: number }>;

/**
 * Peegli läbimõõt simulatsioonis (cm): 10 cm.
 *
 * See on ekraanil kirjas ja liuguriga EI muutu – kogu mooduli väide on, et
 * SAMA peegel annab eri pirniga eri laiuse kiire. Kui peegli suurus muutuks,
 * kaoks võrdlusest mõte.
 */
export const MIRROR_DIAMETER_CM = 10;

/**
 * Seina kaugus simulatsioonis (m): 20 m.
 *
 * Erinevalt liuguritest on see kohe meetrites: seina kaugus on ka ekraanil
 * meetrites („sein 20 m kaugusel") ja läheb valemisse sellisena, nagu ta on.
 * Ühikuteisendust siin ei ole ega tohi olla.
 */
export const WALL_DISTANCE_M = 20;

/**
 * Päikese näiline nurkläbimõõt kraadides.
 *
 * Keskmine väärtus (jaanuaris 0,542°, juulis 0,524°) – üldteada tähtkonstant,
 * mitte allikast võetud ülesanne. Moodul sellest vahest ei sõltu.
 */
export const SUN_ANGULAR_DEG = 0.533;

const DEGREES_PER_RADIAN = 180 / Math.PI;

/** Pikkused, milleta asja ei ole olemas: raadius, fookus, peegli läbimõõt. */
function assertPositive(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${what} peab olema positiivne arv, aga oli ${value}`);
  }
}

/**
 * Null on lubatud, negatiivne ei ole.
 *
 * Kaks kohta, kus null on täiesti mõistlik: mõõtmiskaugus L = 0 („mis on vihu
 * laius peegli juures?" → peegli enda laius) ja allika suurus s = 0 (ideaalne
 * punktallikas, mille peale kogu selle mooduli teooria ehitatud on). Just see
 * on vahe moodulist `kumerpeegli-rakendused`, kus `mirrorBulge`-i null viskab
 * vea: seal on tegemist peegli mõõduga, siin idealiseeringuga.
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
 * Sisendikontroll ei päästa siin: `beamDiameter(0.1, 1e-300, 1e300, 20)` saab
 * iga argumendi eraldi võttes korraliku arvuna läbi, aga korrutis L · s / f
 * voolab üle `Infinity`-ks. Sama joon on `kumerpeegel/model.ts`-is,
 * `noguspeegel/model.ts`-is ja `kumerpeegli-rakendused/model.ts`-is (Codexi
 * leiud, sammud 4.1ii ja 4.1mm).
 */
function assertFiniteResult(value: number, what: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${what} ei mahu arvu sisse: tuli ${value}`);
  }
}

/**
 * Kauge allika näiline nurkläbimõõt: **0° ≤ α < 180°**.
 *
 * α = 0 on lubatud ja tähendab punktallikat (täht) – plekk tuleb siis null.
 * Ketas, mis on suurem kui pool taevast, ei ole enam kauge allikas ja
 * tan(α / 2) läheks 90° juures lõpmatusse.
 */
function assertAngularSize(angularSizeDeg: number): void {
  assertNotNegative(angularSizeDeg, "Näiline nurkläbimõõt");
  if (angularSizeDeg >= 180) {
    throw new RangeError(
      `Kauge allikas ei saa katta pool taevast: ${angularSizeDeg}° >= 180°`,
    );
  }
}

/**
 * Fookuse kaugus peegli tipust (m): **f = R / 2**.
 *
 * Sama valem, mis moodulis `noguspeegel` – ja seda korrust valvab ristkontrolli
 * test, mitte import (vt faili päist).
 */
export function focalLength(radiusM: number): number {
  assertPositive(radiusM, "Kõverusraadius");
  return radiusM / 2;
}

/**
 * Valgusringi läbimõõt (m) kaugusel L: **D + L · s / f**.
 *
 * Kolm asja, mis siit kohe välja loetavad on ja mis ongi mooduli sisu:
 *
 * 1. **s = 0 annab igal kaugusel D** – ideaalse punktallikaga jääks vihk
 *    igavesti peegli laiuseks. Nii täiuslikku taskulampi ei ole olemas.
 * 2. **Väiksem allikas = kitsam vihk.** Viis korda väiksem allikas annab viis
 *    korda väiksema lahtimineku – aga MITTE viis korda kitsama valgusringi,
 *    sest peegli oma läbimõõt D on valemis alati sees. Lahtimineku suhe ja
 *    laiuse suhe on kaks eri arvu.
 * 3. **Pikem fookuskaugus = kitsam vihk.** Lamedam peegel (suurem R) hoiab
 *    kiirt paremini koos – see on vastupidine sellele, mida enamik pakub.
 */
export function beamDiameter(
  mirrorDiameterM: number,
  focalLengthM: number,
  sourceSizeM: number,
  distanceM: number,
): number {
  assertPositive(mirrorDiameterM, "Peegli läbimõõt");
  assertPositive(focalLengthM, "Fookuskaugus");
  assertNotNegative(sourceSizeM, "Valgusallika suurus");
  assertNotNegative(distanceM, "Mõõtmiskaugus peeglist");

  const widthM = mirrorDiameterM + (distanceM * sourceSizeM) / focalLengthM;

  assertFiniteResult(widthM, "Valgusringi läbimõõt");
  return widthM;
}

/**
 * Kauge allika valgusplekk fookuses (m): **2 · f · tan(α / 2)**.
 *
 * Plekk kasvab fookuskaugusega VÕRDELISELT: kaks korda pikem fookus annab kaks
 * korda laiema plekki. Päikese ketas (α = 0,533°) annab 1 m fookuskaugusega
 * peegli fookusesse 9,3 mm laiuse plekki – just seepärast ei saa ükski peegel
 * Päikest punktiks koondada.
 */
export function focalSpotDiameter(
  focalLengthM: number,
  angularSizeDeg: number,
): number {
  assertPositive(focalLengthM, "Fookuskaugus");
  assertAngularSize(angularSizeDeg);

  const halfAngleRad = angularSizeDeg / 2 / DEGREES_PER_RADIAN;
  const spotM = 2 * focalLengthM * Math.tan(halfAngleRad);

  assertFiniteResult(spotM, "Valgusplekk fookuses");
  return spotM;
}

/**
 * Mitu korda tihedamaks Päikese valgus fookuses koondub:
 * **(D / valgusplekk)²**.
 *
 * Ruut tuleb sellest, et võrreldakse PINDALASID: peeglile langeb valgust
 * ringilt läbimõõduga D ja kogu see valgus jõuab plekile läbimõõduga d.
 *
 * Nurka funktsioon argumendina ei võta: ta räägib ainult Päikesest ja tema
 * nurk on konstant.
 *
 * **Kõige tähtsam ja kõige üllatavam tagajärg:** tulemus sõltub ainult suhtest
 * D / f, mitte peegli suurusest. 10 cm peegel fookuskaugusega 10 cm koondab
 * valgust täpselt sama tihedaks (≈ 11 500 korda) kui 1 m peegel
 * fookuskaugusega 1 m. Suurem peegel kogub rohkem valgust kokku (suurem
 * pindala), aga tihedamaks koondab ta ainult siis, kui kasvab suhe D / f.
 * Seda vahet („kui tihe" vs „kui palju") valvab invariandi test.
 */
export function solarConcentration(
  mirrorDiameterM: number,
  focalLengthM: number,
): number {
  assertPositive(mirrorDiameterM, "Peegli läbimõõt");
  assertPositive(focalLengthM, "Fookuskaugus");
  if (mirrorDiameterM > 2 * focalLengthM) {
    // Nii „kiire" peegli juures ei kehti enam ei kerapinna geomeetria ega
    // valemi tulemus: D = 2f juures annab valem 46 222 ja see on juba
    // päikesevalguse füüsikaline ülempiir. Mudel ei vasta küsimusele, mille
    // peale tema sõnastus enam ei kehti – sama põhimõte nagu poolnurga 90°
    // piiril moodulis `kumerpeegli-rakendused`.
    throw new RangeError(
      `Peegel on liiga „kiire": läbimõõt ${mirrorDiameterM} m > 2 × fookuskaugus ${focalLengthM} m`,
    );
  }

  const spotM = focalSpotDiameter(focalLengthM, SUN_ANGULAR_DEG);
  const ratio = mirrorDiameterM / spotM;
  const concentration = ratio * ratio;

  assertFiniteResult(concentration, "Koondumistegur");
  return concentration;
}

/**
 * Sentimeetrid → meetrid. Liuguri cm-väärtus (kõverusraadius, peegli läbimõõt)
 * läheb siit mudeli valemitesse.
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
 * Meetrid → sentimeetrid. Mudeli vastus teisendatakse siin enne ekraanile
 * panemist.
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

/**
 * Millimeetrid → meetrid. Pirni suuruse liugur annab mudelisse siit.
 *
 * Millimeetrid on selles moodulis vaja seepärast, et pirni suurus ja
 * valgusplekk on mõlemad millimeetrites loetavad arvud; sentimeetrites oleks
 * „0,2 cm" ja „0,93 cm" mõlemad loetamatud.
 */
export function metresFromMillimetres(lengthMm: number): number {
  if (!Number.isFinite(lengthMm)) {
    throw new RangeError(`Pikkus peab olema arv, aga oli ${lengthMm}`);
  }
  const lengthM = lengthMm / 1000;
  assertFiniteResult(lengthM, "Pikkus meetrites");
  return lengthM;
}

/**
 * Meetrid → millimeetrid. Valgusplekk jõuab ekraanile siit (9,3 mm, mitte
 * 0,0093 m).
 */
export function millimetresFromMetres(lengthM: number): number {
  if (!Number.isFinite(lengthM)) {
    throw new RangeError(`Pikkus peab olema arv, aga oli ${lengthM}`);
  }
  const lengthMm = lengthM * 1000;
  assertFiniteResult(lengthMm, "Pikkus millimeetrites");
  return lengthMm;
}
