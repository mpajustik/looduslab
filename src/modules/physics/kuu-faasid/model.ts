/**
 * Kuu faasid – füüsika
 * (sisu/MOODUL-kuu-faasid.md „Füüsika (model.ts jaoks)").
 *
 * Ainult puhtad funktsioonid: sama sisend → alati sama väljund, ei Reacti, ei
 * DOM-i, ei juhuslikkust (CLAUDE.md reegel 1). Simulation.tsx ainult kuvab
 * seda, mida siin arvutatakse – ühtki nurka ega protsenti ei tohi komponendis
 * uuesti välja arvutada.
 *
 * **Kogu moodul seisab ÜHEL geomeetrilisel faktil:** Päike valgustab igal
 * hetkel täpselt poolt Kuust ja see pool on alati Päikese poole. Faas on
 * ainult see, kui suurt osa sellest valgustatud poolkerast me Maalt parajasti
 * küljelt näeme. Uut seadust siin ei ole – on ainult geomeetria.
 *
 * ÜHIKUD: kõik nurgad **kraadides**, kaugused **kilomeetrites**, ajad
 * **ööpäevades** (erand `shadowWindowHours`, mis annab tunnid – nii lühikest
 * akent ööpäevades näidata oleks õpilasele mõttetu).
 *
 * **Murd, mitte protsent.** `illuminatedFraction` annab 0…1. Protsendiks
 * korrutamine (× 100) on Simulation.tsx töö – mudel ei tea, mis ühikus teda
 * ekraanil näidatakse. Sama piir kehtib activities.ts kohta: explore-küsimuste
 * õiged vastused on protsentides (0, 50) ühikuga `%`, sest õpilane loeb
 * ekraanilt just seda arvu.
 *
 * Tähised, mida kogu fail kasutab:
 *
 * - `θ` (`phaseAngleDeg`) – **elongatsioon**: nurk Päike–Maa–Kuu, mõõdetuna
 *   Kuu tiirlemise suunas. θ = 0° tähendab, et Kuu on Maa ja Päikese vahel
 *   (kuuloomine); θ = 180° tähendab, et Maa on vahel (täiskuu).
 * - `dayInCycle` – mitmes ööpäev 29,5-päevases tsüklis, 0 = kuuloomine.
 *
 * **Nurga ja ekraani kokkulepe** (Simulation.tsx jaoks; ilma selleta on
 * simulatsioon müntvise ja pooltel juhtudel tuleks peegelpilt): ülaltvaade on
 * vaade ekliptika põhjapoolusest, Kuu tiirleb selles vaates vastupäeva, Päike
 * on ekraani vasakus servas. Sellest tuleb üksüheselt θ = 0° vasakul
 * (kuuloomine), 90° all (esimene veerand), 180° paremal (täiskuu), 270° üleval
 * (viimane veerand). Kasvav pool tsüklit on ekraani ALUMISES pooles.
 *
 * **Idealiseeringud** (UI ega õpetajajuhend ei tohi neid päris füüsikana
 * esitada):
 *
 * 1. **Orbiit on ring ja Kuu liigub ühtlaselt.** Päris orbiit on ellips, seega
 *    jõuab Kuu faasist faasi kord kiiremini, kord aeglasemalt (kuni umbes
 *    ±0,5 ööpäeva). `phaseAngleFromDay` ja `dayFromPhaseAngle` teisendavad
 *    lineaarselt.
 * 2. **Kõik on ühes tasandis.** Kuu orbiidi ~5° kalle jääb sõnadesse. Just
 *    seepärast on `earthShadowCentreCovered` mudelis: ta ütleb, et Maa vari on
 *    Kuu orbiidil ainult ühes ainsas kohas, ja seda saab tasandil ausalt
 *    näidata. Kalle teeb varjutuse veel HARULDASEMAKS, mitte sagedasemaks,
 *    seega ei muuda ta mooduli järeldust.
 * 3. **Päikesekiired on paralleelsed** – Päike on nii kaugel, et see on parem
 *    lähendus kui joonisel kujutatav lahknev vihk.
 *
 * Vigane sisend VISKAB vea, ta ei „paranda" ennast vaikselt – vaikne parandus
 * peidaks ära vea kutsuvas koodis (nt liuguri vale ülempiir) ja õpilane näeks
 * õiget arvu vale sisendi pealt.
 */

/* --------------------------------------------------------------------------
 * Konstandid
 * ----------------------------------------------------------------------- */

/** Kuu üks tiir ümber Maa tähtede suhtes ehk sideeriline kuu (ööpäeva). */
export const SIDEREAL_MONTH_DAYS = 27.32;

/** Maa üks tiir ümber Päikese (ööpäeva). */
export const EARTH_YEAR_DAYS = 365.25;

/** Kuu keskmine kaugus Maast, keskpunktist keskpunkti (km). */
export const MOON_MEAN_KM = 384_400;

/**
 * Maa täisvarju laius Kuu keskmisel kaugusel (km).
 *
 * **Miks see arv on siin uuesti, mitte imporditud moodulist `varjutused`:**
 * moodulid laaditakse dünaamiliselt ja iga moodul on oma tükk (CLAUDE.md
 * reegel 13) – ristimport tõmbaks ühe mooduli teise bundle'isse ja seoks kaks
 * eraldi arhiveeritavat üksust kokku (reegel 11). Sama otsus ja sama põhjendus
 * nagu moodulil `varjutused` mooduli `vari-ja-poolvari` suhtes ja moodulil
 * `helkur` mooduli `nurkpeegel` suhtes.
 *
 * Kordus on teadlik ja teda VALVAB TEST failis tests/kuu-faasid.model.test.ts:
 * see arv peab võrduma sellega, mille annab `varjutused/model.ts` funktsioon
 * `lunarUmbraWidthKm(MOON_MEAN_KM)`. Test tohib mõlemat moodulit importida –
 * testid bundle'isse ei lähe.
 */
export const EARTH_UMBRA_WIDTH_AT_MOON_KM = 9_198;

/**
 * Simulatsiooni liuguri piirid ja samm (sisu/MOODUL-kuu-faasid.md „explore").
 *
 * Miks MUDELIS, mitte Simulation.tsx-is: samm otsustab, kas ülesannete
 * vastused on üldse saavutatavad. Samm 5° on valitud nii, et kõik ülesannete
 * sihtnurgad (0, 60, 90, 120, 180, 270, 300) satuvad võrele ja algväärtus on
 * liuguriga tagasi leitav – see oli mooduli `varjutused` õppetund. Seda
 * valvab test, mis käib kogu võre läbi.
 *
 * Ülemine ots on 360 KAASA ARVATUD (mitte 355): kuuloomine peab olema
 * liuguri mõlemas otsas, sest tsükkel on ring. Just seepärast normaliseerib
 * iga nurka võttev funktsioon oma sisendi – 360° ei satuks muidu ühessegi
 * `phaseLabel` aknasse.
 */
export const SLIDERS = {
  /** Kuu asukoht orbiidil θ (°) – algväärtus 0° (kuuloomine). */
  phaseAngleDeg: { min: 0, max: 360, step: 5 },
} as const satisfies Record<string, { min: number; max: number; step: number }>;

/* --------------------------------------------------------------------------
 * Abifunktsioonid (ei ekspordita)
 * ----------------------------------------------------------------------- */

const DEGREES_PER_RADIAN = 180 / Math.PI;

/**
 * Ka lõplikest sisenditest võib tulla lõpmatus või NaN.
 *
 * Sama joon on moodulite `helkur`, `nurkpeegel`, `kumerpeegel` ja
 * `noguspeegel` mudelites (Codexi leiud, sammud 4.1ii ja 4.1mm).
 */
function assertFiniteResult(value: number, what: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${what} ei mahu arvu sisse: tuli ${value}`);
  }
}

function assertPositive(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(
      `${what} peab olema positiivne arv, aga oli ${value}`,
    );
  }
}

/**
 * Kraadide koosinus, mis on veerandpunktides TÄPNE.
 *
 * `Math.cos(Math.PI / 2)` ei ole null, vaid 6,1·10⁻¹⁷ – ujukomaarv ei mahuta
 * π/2 täpselt. Enamasti ei loeks see midagi, aga siin loeb kaks korda:
 *
 * - `illuminatedFraction(0)` peab andma **täpselt 0** ja `(180)` **täpselt 1**
 *   – 0 % ja 100 % on mooduli kaks otsapunkti ning „−0,000000000000001 %"
 *   ekraanil oleks lihtsalt katki;
 * - `terminatorFactor` MÄRK otsustab, kas Simulation.tsx joonistab sirbi või
 *   kumerfaasi. Täpselt veerandi juures peab piir olema sirge (0), mitte
 *   „tibake kumer" – muidu ripub joonis ujukomavea märgi küljes.
 *
 * Mujal (θ = 60°, 120°, …) on tavaline koosinus täiesti korras.
 */
function cosDeg(angleDeg: number): number {
  const quarters = angleDeg / 90;
  if (Number.isInteger(quarters)) {
    // 0° → 1, 90° → 0, 180° → −1, 270° → 0
    return [1, 0, -1, 0][((quarters % 4) + 4) % 4];
  }
  return Math.cos((angleDeg / 180) * Math.PI);
}

/* --------------------------------------------------------------------------
 * Nurgad ja aeg
 * ----------------------------------------------------------------------- */

/**
 * Toob nurga vahemikku **[0, 360)**: `((deg % 360) + 360) % 360`.
 *
 * **Iga nurka võttev funktsioon selles failis kutsub selle KÕIGEPEALT välja.**
 * Kui normaliseerimine jääks ainult `phaseAngleFromDay` sisse, tekiks kohe
 * päris viga: liugur ulatub 0–360 KAASA ARVATUD, aga `phaseLabel` viimane
 * aken lõpeb 360° juures – täpselt 360° ei satuks ühessegi aknasse. Tsükkel on
 * perioodiline, seega peab ka negatiivne nurk või ülipikk päev andma õige
 * faasi („40 päeva pärast" peab töötama).
 */
export function normalizeAngleDeg(deg: number): number {
  if (!Number.isFinite(deg)) {
    throw new RangeError(`Nurk peab olema lõplik arv, aga oli ${deg}`);
  }
  return ((deg % 360) + 360) % 360;
}

/**
 * Faaside tsükli ehk **sünoodilise kuu** pikkus (ööpäeva):
 * **1 / (1/sideeriline − 1/aasta)**.
 *
 * Miks nii: Kuu teeb tiiru ümber Maa 27,32 päevaga, aga Maa on selle ajaga ise
 * Päikese ümber edasi liikunud, seega peab Kuu Päikese suunale **järele
 * jõudma**. Nurkkiirused lahutatakse.
 *
 * Nõuab `yearDays > siderealDays > 0`. Vastasel juhul tuleks negatiivne või
 * lõpmatu periood – ja „faaside tsükkel kestab −40 päeva" on vale vastus, mida
 * keegi ekraanilt ei kahtlustaks.
 */
export function synodicMonthDays(
  siderealDays: number,
  yearDays: number,
): number {
  assertPositive(siderealDays, "Sideerilise kuu pikkus");
  assertPositive(yearDays, "Aasta pikkus");
  if (yearDays <= siderealDays) {
    throw new RangeError(
      `Aasta peab olema sideerilisest kuust pikem, aga oli ${yearDays} ja ${siderealDays} – Kuu jõuaks Päikese suunale järele valepidi`,
    );
  }

  const synodicDays = 1 / (1 / siderealDays - 1 / yearDays);

  assertFiniteResult(synodicDays, "Sünoodilise kuu pikkus");
  return synodicDays;
}

/**
 * Faaside tsükli pikkus (ööpäeva) ≈ 29,5287 – **arvutatud, mitte sisse
 * kirjutatud**.
 *
 * Nii ei saa tekkida seisu, kus mudelis on 29,5 ja teoorias 29,53 ja keegi ei
 * tea, kumb on tõsi. Õpiku „29,5 ööpäeva" on selle arvu ümardus ja nii ütleb
 * ka rakendus. Väärarusaam `faas-ja-tiirlemisaeg` („tsükkel kestab 27,3
 * päeva") ei saa nii kunagi mudelist tuge saada.
 */
export const SYNODIC_MONTH_DAYS = synodicMonthDays(
  SIDEREAL_MONTH_DAYS,
  EARTH_YEAR_DAYS,
);

/** Mitmenda ööpäeva juures tsüklis on Kuu nurga θ juures: **θ = 360 · päev / tsükkel**. */
export function phaseAngleFromDay(
  dayInCycle: number,
  synodicDays: number = SYNODIC_MONTH_DAYS,
): number {
  if (!Number.isFinite(dayInCycle)) {
    throw new RangeError(
      `Päev tsüklis peab olema lõplik arv, aga oli ${dayInCycle}`,
    );
  }
  assertPositive(synodicDays, "Tsükli pikkus");

  return normalizeAngleDeg((360 * dayInCycle) / synodicDays);
}

/**
 * Mitmes ööpäev tsüklis vastab nurgale θ: **päev = tsükkel · θ / 360**.
 *
 * Funktsiooni `phaseAngleFromDay` pöördfunktsioon ühe tsükli piires (sisend
 * normaliseeritakse, seega „päev 40" tuleb tagasi päevana 10,5). Seda valvab
 * test.
 */
export function dayFromPhaseAngle(
  phaseAngleDeg: number,
  synodicDays: number = SYNODIC_MONTH_DAYS,
): number {
  const angleDeg = normalizeAngleDeg(phaseAngleDeg);
  assertPositive(synodicDays, "Tsükli pikkus");

  return (synodicDays * angleDeg) / 360;
}

/* --------------------------------------------------------------------------
 * Faas
 * ----------------------------------------------------------------------- */

/**
 * Kui suur osa Maalt nähtavast Kuu kettast on valgustatud (**murd 0…1**):
 * **(1 − cos θ) / 2**.
 *
 * See on ainuke „valem", mille peale kogu moodul toetub, ja seda õpilasele EI
 * näidata – tema jaoks on see simulatsiooni näit protsentides.
 *
 * Kaks otsa on sama geomeetria kaks otsa: kuuloomise ajal (θ = 0°) on Kuu ikka
 * poolenisti valgustatud, see pool on lihtsalt meist ära pööratud.
 */
export function illuminatedFraction(phaseAngleDeg: number): number {
  const angleDeg = normalizeAngleDeg(phaseAngleDeg);
  return (1 - cosDeg(angleDeg)) / 2;
}

/**
 * Faasi **KUJU**: **cos θ**.
 *
 * Ütleb, kui „lame" on valguse ja varju piir (terminaator) Kuu kettal ja
 * kummale poole see piir kummub. Simulation.tsx joonistab selle järgi
 * poolellipsi: poolväiketelg = kettaraadius × |cos θ|, märk otsustab, kas piir
 * on nõgus (sirp) või kumer (kumerfaas). **See kuulub reegli 1 järgi
 * mudelisse:** see on geomeetria, mitte kujundus.
 *
 * **NB! See EI ütle, kumb külg on valgustatud.** Koosinus on sümmeetriline:
 * cos 60° = cos 300° = +0,5 ja cos 90° = cos 270° = 0 – kasvaval ja kahaneval
 * Kuul on faasi kuju TÄPSELT sama. Külje otsustab `isWaxing` ja Simulation.tsx
 * peab kasutama **mõlemat**: siit tuleb kuju, sealt õige pool. Ainult ühega
 * joonistades tuleks pool tsüklit peegelpildis.
 */
export function terminatorFactor(phaseAngleDeg: number): number {
  const angleDeg = normalizeAngleDeg(phaseAngleDeg);
  return cosDeg(angleDeg);
}

/**
 * Kas Kuu kasvab (liigub täiskuu poole): **0° < θ < 180°**.
 *
 * Täpselt 0° ja 180° juures `false` – need on pöördepunktid, mitte kasvamine.
 *
 * **Simulation.tsx ei tohi sellest teha „valgustatud paremalt" universaalset
 * reeglit:** parem külg kehtib ainult PÕHJApoolkeral ja ekraanil peab see
 * kitsendus kirjas olema.
 */
export function isWaxing(phaseAngleDeg: number): boolean {
  const angleDeg = normalizeAngleDeg(phaseAngleDeg);
  return angleDeg > 0 && angleDeg < 180;
}

/**
 * Faasi silt – kaheksa ±22,5° laiust akent.
 *
 * **Sildid on ingliskeelsed ja eestikeelse nime paneb peale Simulation.tsx.**
 * Nii ei jõua vaidlus terminoloogia üle kunagi mudelisse: sõna „noorkuu"
 * tähendab õpikus KASVAVAT Kuud ja kalendris nähtamatut Kuud (vt
 * sisu/MOODUL-kuu-faasid.md „Terminoloogia") ning ükski kontrollitav küsimus
 * ei tohi selle sõna küljes rippuda.
 */
export type PhaseLabel =
  | "new"
  | "waxing-crescent"
  | "first-quarter"
  | "waxing-gibbous"
  | "full"
  | "waning-gibbous"
  | "last-quarter"
  | "waning-crescent";

export function phaseLabel(phaseAngleDeg: number): PhaseLabel {
  const angleDeg = normalizeAngleDeg(phaseAngleDeg);

  if (angleDeg < 22.5) return "new";
  if (angleDeg < 67.5) return "waxing-crescent";
  if (angleDeg < 112.5) return "first-quarter";
  if (angleDeg < 157.5) return "waxing-gibbous";
  if (angleDeg < 202.5) return "full";
  if (angleDeg < 247.5) return "waning-gibbous";
  if (angleDeg < 292.5) return "last-quarter";
  if (angleDeg < 337.5) return "waning-crescent";
  return "new"; // [337,5–360) – tsükkel jõuab tagasi kuuloomise juurde
}

/* --------------------------------------------------------------------------
 * Maa vari – mooduli vastuargument
 *
 * Väärarusaam `kuu-faas-on-vari` on selle teema kõige sitkem. Seda ei lükka
 * ümber sõnad, vaid arv: vari hõivab kogu 360° orbiidist ainult 1,4°.
 * ----------------------------------------------------------------------- */

/**
 * Kui laia nurga Kuu orbiidist Maa täisvari üldse hõivab – **poolnurk**
 * varju keskmest servani (°): **atan((laius / 2) / kaugus)**.
 */
export function earthShadowHalfAngleDeg(
  umbraWidthKm: number,
  distanceKm: number,
): number {
  assertPositive(umbraWidthKm, "Täisvarju laius");
  assertPositive(distanceKm, "Kaugus");

  const halfAngleDeg =
    Math.atan(umbraWidthKm / 2 / distanceKm) * DEGREES_PER_RADIAN;

  assertFiniteResult(halfAngleDeg, "Varju poolnurk");
  return halfAngleDeg;
}

/**
 * Kas Maa täisvari katab Kuu KESKPUNKTI:
 * **|θ − 180°| ≤ varju poolnurk**.
 *
 * **Nimi ütleb tahtlikult „centre":** funktsioon vaatab ainult Kuu keskpunkti
 * ja jätab Kuu enda läbimõõdu arvestamata. See ei ole väike lihtsustus – Kuu
 * ketas ise on orbiidil 0,52° lai ehk juba kolmandik varju 1,37°-st, seega
 * algab päris osaline kuuvarjutus tublisti varem ja kestab kauem, kui see
 * funktsioon ütleb.
 *
 * Mooduli väide („vari on orbiidil ühesainsas kohas") kannab selle lihtsustuse
 * kenasti välja: 0,52° juurdearvestamine teeks aknast 1,9° ehk ikka alla 0,6 %
 * tsüklist. Varjutuse päris kestus ja geomeetria on mooduli `varjutused` asi,
 * mitte selle oma – siin on vari ainult vastuargument.
 */
export function earthShadowCentreCovered(phaseAngleDeg: number): boolean {
  const angleDeg = normalizeAngleDeg(phaseAngleDeg);
  const halfAngleDeg = earthShadowHalfAngleDeg(
    EARTH_UMBRA_WIDTH_AT_MOON_KM,
    MOON_MEAN_KM,
  );

  return Math.abs(angleDeg - 180) <= halfAngleDeg;
}

/**
 * Mitu **tundi** kogu tsüklist saab Maa vari Kuud üldse katta:
 * **2 · poolnurk / 360 · tsükkel · 24**.
 *
 * Umbes 2,7 tundi 29,5 ööpäevast ehk 0,4 % tsüklist – ja needki tunnid jäävad
 * kalde tõttu enamasti vahele. Vari EI SAA seletada kuju muutumist, mis kestab
 * terve kuu.
 */
export function shadowWindowHours(
  synodicDays: number = SYNODIC_MONTH_DAYS,
): number {
  assertPositive(synodicDays, "Tsükli pikkus");

  const halfAngleDeg = earthShadowHalfAngleDeg(
    EARTH_UMBRA_WIDTH_AT_MOON_KM,
    MOON_MEAN_KM,
  );
  const hours = ((2 * halfAngleDeg) / 360) * synodicDays * 24;

  assertFiniteResult(hours, "Varju aken");
  return hours;
}
