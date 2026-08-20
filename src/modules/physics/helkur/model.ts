/**
 * Helkur – füüsika
 * (sisu/MOODUL-helkur.md „Füüsika (model.ts jaoks)").
 *
 * Ainult puhtad funktsioonid: sama sisend → alati sama väljund, ei Reacti, ei
 * DOM-i, ei juhuslikkust (CLAUDE.md reegel 1). Simulation.tsx ainult kuvab
 * seda, mida siin arvutatakse – ühtki nurka, plekki ega võimendust ei tohi
 * komponendis uuesti välja arvutada.
 *
 * **Mida see moodul arvutab:** ühte asja – kui täpselt läheb valgus sinna
 * tagasi, kust ta tuli, ja kellele sellest kasu on. Miks kaks täisnurga all
 * peeglit valguse üldse tagasi saadavad, tuli moodulist `nurkpeegel`
 * (δ = 2·θ); siin on selle TAGAJÄRG arvudes. Uut seadust siin ei ole.
 *
 * **Miks see EI ole mooduli `nurkpeegel` mudeli taaskasutus** (spetsi eraldi
 * peatükk): moodulid laaditakse dünaamiliselt ja iga moodul on oma tükk
 * (CLAUDE.md reegel 13) – ristimport tõmbaks ühe mooduli teise bundle'isse ja
 * seoks kaks eraldi arhiveeritavat üksust kokku (reegel 11). Kordus on üks
 * rida ja teda valvab ristkontrolli test failis tests/helkur.model.test.ts –
 * TESTIS, mitte rakenduse koodis. Sama otsus ja sama põhjendus nagu paaridel
 * `kumerpeegel` / `kumerpeegli-rakendused` ja `noguspeegel` /
 * `noguspeegli-rakendused`.
 *
 * ÜHIKUD: kõik nurgad **kraadides**, kõik pikkused **meetrites**.
 * **Ühikuteisenduse funktsioone selles moodulis EI ole** – esimene kord selles
 * peeglisarjas. Põhjus on aus: kõik ekraanil olevad suurused (kaugus
 * 10…150 m, kõrvalekalle 0,3…3,5 m, silmade ja tulede vahe 0,5 m) on juba
 * meetrites loetavad arvud ja nurgad kraadides. Kui hiljem tekib sentimeetreid
 * vajav ülesanne, tuleb teisendusfunktsioon juurde – möödaminnes ümber
 * arvutatud ühik on selle projekti kõige vaiksem viga (vt
 * `noguspeegli-rakendused`).
 *
 * Tähised, mida kogu fail kasutab:
 *
 * - `θ` (`mirrorAngleDeg`) – nurk helkuri kahe peegli vahel. Ideaalne helkur
 *   on täpselt 90°.
 * - `α` (`deviationDeg` argumendina) – nurk tagasituleva kiire ja täpse
 *   tagasisuuna vahel.
 * - `ω` (`spreadDeg`) – tagasituleva valguskoonuse **pool-avanurk**: nurk
 *   koonuse teljest servani. Pool, mitte täisnurk – just poolnurka
 *   võrreldakse silma ja tulede vahelise nurgaga ning segamini läinud pool
 *   teeks kõik arvud kaks korda valeks (sama lõks kui nurkadega moodulis
 *   `kumerpeegli-rakendused`).
 * - `L` (`distanceM`) – kaugus helkuri ja auto vahel.
 * - `h` (`offsetM`) – ristsuunaline vahe: kas juhi silmade ja esitulede vahe
 *   või see, kui palju tagasitulev kiir sihist mööda läheb.
 *
 * **Kolm seost, millel moodul seisab:**
 *
 * 1. **Vale nurk kahekordistub:** kõrvalekalle = 2·|θ − 90°|. Moodul
 *    `nurkpeegel` andis pöörde δ = 2·θ; täpne tagasitulek tähendab pööret
 *    180°, seega on kõrvalekalle |2·θ − 180°| = 2·|θ − 90°|.
 * 2. **Nurk annab kauguse peal meetrid:** h = L · tan α. Täisnurkne kolmnurk –
 *    see on kogu geomeetria.
 * 3. **Tagasipeegeldumise võimendus = 1 / (1 − cos ω).** Matt pind saadab
 *    valguse laiali üle terve poolkera (ruuminurk 2π sr), helkur ainult
 *    koonusesse pool-avanurgaga ω (ruuminurk 2π·(1 − cos ω)). Suhe on
 *    2π : 2π(1 − cos ω) = 1/(1 − cos ω).
 *
 * **Idealiseeringud** (UI ega õpetajajuhend ei tohi neid päris füüsikana
 * esitada):
 *
 * 1. **Helkur on üks kahe peegliga nurk.** Päris helkur on väli sadadest
 *    pisikestest KOLME peegliga kuubinurkadest (või prismadest). Kaks peeglit
 *    pööravad ümber ainult need kiire osad, mis on nende peeglipindadega
 *    risti; osa, mis liigub piki peeglite ühisserva, jääb muutmata. Seepärast
 *    tuleb kiir täpselt tagasi ainult siis, kui ta on ühisservaga risti –
 *    tänaval tuleb valgus aga ka ülalt ja alt. Kahe peegliga mudel annab õige
 *    loo ja õiged nurgad, aga kirjeldab ainult üht tasandit: seda, mis on
 *    ühisservaga risti.
 * 2. **Tagasitulev valgus on terava servaga koonus**, mille sees on valgus
 *    ühtlane ja väljaspool ei ole midagi. Päris helkuri koonusel on servad
 *    hajusad ja heledus kahaneb sujuvalt (standardid mõõdavad seda mitme nurga
 *    juures, umbes 0,2°…1,5°). Mudel arvutab terava servaga – seepärast on ka
 *    simulatsiooni vastus „jõuab / ei jõua", mitte „kui ere".
 * 3. **Kõik peeglid peegeldavad kogu valguse.** Kolm peegeldust tähendavad
 *    päris helkuril kolm korda ~5 % kadu, lisaks tolm ja kriimud. Mudelis
 *    intensiivsust ei ole – ainult ruuminurkade suhe.
 * 4. **Helkur on risti valguse suunas.** Väga viltu (üle umbes 40°) pööratud
 *    helkurisse jõuab palju vähem valgust, sest tema nähtav pindala kahaneb ja
 *    osa kiiri ei läbi kõiki kolme peeglit. Mudel seda ei arvuta; see on
 *    õpetajajuhendi katse (helkuri keeramine käes).
 * 5. **Valgus levib takistuseta.** Udu, vihma ja mustust mudel ei tunne, kuigi
 *    just need viivad päris helkuri tööulatuse alla.
 * 6. **Matt pind hajutab ühtlaselt üle poolkera** (Lamberti pind). Päris valge
 *    riie hajutab veidi ebaühtlaselt – võimenduse arv 26 000 on suurusjärk,
 *    mitte mõõdetud väärtus, ja nii on ta ka ekraanil kirjas („umbes 26 000
 *    korda").
 *
 * Vigane sisend VISKAB vea, ta ei „paranda" ennast vaikselt – vaikne parandus
 * peidaks ära vea kutsuvas koodis (nt liuguri vale ülempiir) ja õpilane näeks
 * õiget arvu vale sisendi pealt.
 */

/**
 * Simulatsiooni liugurite piirid ja sammud (sisu/MOODUL-helkur.md „explore").
 *
 * Miks MUDELIS, mitte Simulation.tsx-is: need piirid otsustavad, kas
 * ülesannete vastused on saavutatavad ja kas kogu liugurivõres püsib mudel
 * mõistlike arvude juures (valgusplekk mahub veel maantee joonisele). Mõlemat
 * kontrollib test, mis käib kogu võre läbi.
 *
 * Ühikuid siin ei teisendata: liugur näitab kraade ja meetreid ning täpselt
 * needsamad arvud lähevad valemitesse.
 */
export const SLIDERS = {
  /**
   * Tagasituleva koonuse pool-avanurk ω (°) – algväärtus 0,5°.
   *
   * Alumine ots 0,1° on „liiga täpne helkur": plekk on 100 m juures ainult
   * 0,35 m lai ega ulatu esituledest juhi silmadeni (0,5 m). Ülemine ots 2,0°
   * on juba nii lai koonus, et võimendus on kukkunud 26 000-lt 1600-le.
   */
  spreadDeg: { min: 0.1, max: 2, step: 0.1 },
  /** Kaugus helkuri ja auto vahel L (m) – algväärtus 100 m. */
  distanceM: { min: 10, max: 150, step: 10 },
} as const satisfies Record<string, { min: number; max: number; step: number }>;

const DEGREES_PER_RADIAN = 180 / Math.PI;

function toRadians(angleDeg: number): number {
  return angleDeg / DEGREES_PER_RADIAN;
}

/**
 * Null on lubatud, negatiivne ei ole.
 *
 * Kaks kohta, kus null on sisuliselt mõistlik vastus: kõrvalekaldenurk α = 0
 * (täpne helkur ei möödu millestki) ja kõrvalekalle h = 0 (silm on täpselt
 * tule kohal).
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
 * Sisendikontroll ei päästa siin üksi: `offsetAtDistanceM(89.999, 1e300)` saab
 * iga argumendi eraldi võttes korraliku arvuna läbi, aga korrutis voolab üle
 * `Infinity`-ks. Sama joon on moodulite `kumerpeegel`, `noguspeegel`,
 * `kumerpeegli-rakendused`, `noguspeegli-rakendused` ja `nurkpeegel` mudelites
 * (Codexi leiud, sammud 4.1ii ja 4.1mm).
 */
function assertFiniteResult(value: number, what: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${what} ei mahu arvu sisse: tuli ${value}`);
  }
}

/**
 * Tagasituleva kiire kõrvalekalle täpsest tagasisuunast (°):
 * **α = 2 · |θ − 90°|**.
 *
 * Mooduli keskne valem. Pool kraadi viga peeglites saadab valguse KRAADI võrra
 * valesse suunda – helkur ei ole koht, kus „umbes täisnurk" kõlbab. Vastus on
 * sümmeetriline: liiga terav ja liiga nüri nurk annavad sama kõrvalekalde.
 *
 * Lubatud vahemik **85° ≤ θ ≤ 95°** ja see piir on sisuline, mitte ilutunne:
 * sellest kaugemal ei ole tegemist enam helkuriga, vaid nurkpeegliga (moodul
 * `nurkpeegel`, mille `deviationDeg` katab kogu vahemiku 0…90°). Juba θ = 95°
 * annab kõrvalekalde 10° ehk 100 m juures 17 m – kaugelt üle tee laiuse.
 * Mudel, mis ütleks „helkur" ka 60° kohta, õpetaks valet asja.
 */
export function returnDeviationDeg(mirrorAngleDeg: number): number {
  if (
    !Number.isFinite(mirrorAngleDeg) ||
    mirrorAngleDeg < 85 ||
    mirrorAngleDeg > 95
  ) {
    throw new RangeError(
      `Helkuri peeglite nurk peab olema 85…95°, aga oli ${mirrorAngleDeg}° – kaugemal ei ole see enam helkur, vaid nurkpeegel`,
    );
  }
  return 2 * Math.abs(mirrorAngleDeg - 90);
}

/**
 * Ristsuunaline kõrvalekalle kaugusel L (m): **h = L · tan α**.
 *
 * Kraadi suurune viga on 100 m kaugusel 1,7 m ehk rohkem kui pool autot.
 *
 * Sama funktsioon annab ka tagasituleva valgusplekki **raadiuse**, kui talle
 * anda hajuvusnurk ω (plekki läbimõõt on siis 2 × tulemus) – üks geomeetria,
 * kaks kasutust, mitte kaks funktsiooni.
 *
 * **L = 0 on lubatud** ja annab 0: auto juures ei ole veel kõrvale mindud. See
 * on tahtlik vahe naaberfunktsioonist `angleFromOffsetDeg`, kus L = 0 viskab
 * vea – seal oleks see jagamine nulliga.
 *
 * α = 90° ei ole lubatud: tan 90° ei ole olemas.
 */
export function offsetAtDistanceM(
  deviationDeg: number,
  distanceM: number,
): number {
  assertNotNegative(deviationDeg, "Kõrvalekaldenurk");
  if (deviationDeg >= 90) {
    throw new RangeError(
      `Kõrvalekaldenurk peab jääma alla 90°, aga oli ${deviationDeg}° – tan 90° ei ole olemas`,
    );
  }
  assertNotNegative(distanceM, "Kaugus");

  const offsetM = distanceM * Math.tan(toRadians(deviationDeg));

  assertFiniteResult(offsetM, "Kõrvalekalle");
  return offsetM;
}

/**
 * Mis nurga alt paistavad helkuri juurest vaadates kaks asja, mis on
 * teineteisest h kaugusel ja ise kaugusel L (°): **α = atan(h / L)**.
 *
 * Simulatsioonis on see nurk juhi silmade ja esitulede vahel: 0,5 m 100 m
 * kaugusel on ainult 0,29°, aga just nii lai peab tagasitulev koonus vähemalt
 * olema, et juht helkurit üldse näeks.
 *
 * See on funktsiooni `offsetAtDistanceM` pöördfunktsioon ja seda valvab test.
 *
 * **L = 0 viskab siin vea**, kuigi `offsetAtDistanceM`-is on ta lubatud:
 * nullkaugusel ei ole nurka, see oleks jagamine nulliga.
 */
export function angleFromOffsetDeg(offsetM: number, distanceM: number): number {
  assertNotNegative(offsetM, "Kõrvalekalle");
  if (!Number.isFinite(distanceM) || distanceM <= 0) {
    throw new RangeError(
      `Kaugus peab olema positiivne arv, aga oli ${distanceM} – nullkaugusel ei ole nurka`,
    );
  }

  const angleDeg = Math.atan(offsetM / distanceM) * DEGREES_PER_RADIAN;

  assertFiniteResult(angleDeg, "Nurk");
  return angleDeg;
}

/**
 * Tagasipeegeldumise võimendus: **1 / (1 − cos ω)**.
 *
 * Mitu korda tihedamalt tuleb valgus tagasi kui matilt pinnalt. Kaks asja, mis
 * siit välja loetavad on ja mis ongi mooduli mõte:
 *
 * - **Kitsam koonus = palju suurem võimendus.** Väikeste nurkade juures on
 *   1 − cos ω ≈ ω²/2, seega poole kitsam koonus annab NELI korda suurema
 *   võimenduse. Pool kraadi annab umbes 26 000 korda.
 * - **ω = 90° annab täpselt 1** ehk matt pind ise – mudeli mõistlikkuse ankur.
 *   Väiksem arv kui 1 tähendaks „halvem kui valge lapp" ja on võimatu.
 *
 * ω = 0 viskab vea: ideaalne helkur annaks lõpmatu võimenduse ja mudel ei
 * vasta küsimusele, mille peale tema sõnastus enam ei kehti (sama põhimõte
 * nagu `solarConcentration` piiril moodulis `noguspeegli-rakendused`). Pealegi
 * on just see mooduli teine pool: täiesti täpne helkur saadaks kogu valguse
 * esituledesse tagasi ja juht ei näeks midagi.
 *
 * **Miks arvutuses ei ole `1 − cos ω`, kuigi valem on selline.** Väga väikese
 * nurga juures on `cos ω` topelttäpsuses juba täpselt 1 ja lahutamisel kaob
 * kogu info: ω = 1e-6° juures annaks otsekuju 37 % vale vastuse ja ω = 1e-7°
 * juures lõpmatuse, kuigi õige võimendus (≈ 6,6e17) mahub arvu sisse
 * suurepäraselt. Samaväärsus 1 − cos ω = 2·sin²(ω/2) annab sama arvu, aga ei
 * lahuta kunagi kahte peaaegu võrdset arvu. Liuguri vahemikus (0,1…2°) on vahe
 * olematu – see valik hoiab ausana funktsiooni LEPINGUT `0 < ω ≤ 90`
 * (CodeRabbiti ja Codexi ühine leid, samm 4.1fff).
 */
export function retroreflectionGain(spreadDeg: number): number {
  if (!Number.isFinite(spreadDeg) || spreadDeg <= 0 || spreadDeg > 90) {
    throw new RangeError(
      `Hajuvusnurk peab olema 0° < ω ≤ 90°, aga oli ${spreadDeg}° – null tähendaks lõpmatut võimendust`,
    );
  }

  const halfAngleSin = Math.sin(toRadians(spreadDeg) / 2);
  const gain = 1 / (2 * halfAngleSin * halfAngleSin);

  assertFiniteResult(gain, "Tagasipeegeldumise võimendus");
  return gain;
}
