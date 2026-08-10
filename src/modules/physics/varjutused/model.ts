/**
 * Päikese- ja kuuvarjutus – füüsika
 * (sisu/MOODUL-varjutused.md „Füüsika").
 *
 * Ainult puhtad funktsioonid: sama sisend → alati sama väljund, ei Reacti,
 * ei DOM-i, ei juhuslikkust (CLAUDE.md reegel 1). Simulation.tsx ainult kuvab
 * seda, mida siin arvutatakse.
 *
 * **See moodul on rakendusmoodul.** Ta ei õpeta ühtki uut valemit – kogu
 * sisu on mooduli `vari-ja-poolvari` varjugeomeetria, millele on ette antud
 * kosmilised arvud. Sama geomeetria, uued arvud; just see ongi mooduli mõte.
 *
 * ÜHIKUD: kõik pikkused ja kaugused KILOMEETRITES. Teisendust siin ei ole,
 * sest kilomeeter on ainus ühik, milles moodul arve näitab.
 *
 * **Kokkulepe, mis läbib kogu faili:** kaugusi mõõdetakse KAHES tükis –
 * `sourceToBody` on allikast varju heitva kehani (mõlemal juhul Päikesest
 * kuni Kuu või Maa keskpunktini) ja `bodyToScreen` on sealt edasi ekraanini.
 * Moodulis `vari-ja-poolvari` mõõdeti mõlemad ALLIKAST; siin ei saaks nii
 * teha, sest 149 600 000 ja 384 400 vahel on nii suur vahe, et allikast
 * mõõdetud „b − a" sööks ujukomas kogu täpsuse ära. Seepärast on siinsed
 * valemid teisel kujul – aga nad on samad valemid ja seda valvab test, mis
 * annab mõlema mooduli funktsioonidele ühed ja samad arvud.
 *
 * Vigane sisend VISKAB vea, ta ei „paranda" ennast vaikselt – vaikne parandus
 * peidaks ära vea kutsuvas koodis ja õpilane näeks õiget arvu vale sisendi
 * pealt. AINUS erand on täisvarju piiramine nulliga
 * (`umbraWidthAtDistance`) ja see on õpilase huvides, mitte mugavusest –
 * vt sealt.
 */

/* --------------------------------------------------------------------------
 * Konstandid
 *
 * Kõik taevakehade arvud elavad SIIN, mitte sisufailides laiali. Sisufail,
 * mis kirjutab endale 3474 käsitsi sisse, läheb mudelist ühel päeval lahku
 * ja seda ei paneks keegi tähele – arv ekraanil on ju endiselt arv.
 * ----------------------------------------------------------------------- */

/** Päikese läbimõõt (km). */
export const SUN_DIAMETER_KM = 1_392_000;

/** Kuu läbimõõt (km). */
export const MOON_DIAMETER_KM = 3_474;

/** Maa läbimõõt (km). */
export const EARTH_DIAMETER_KM = 12_742;

/**
 * Maa raadius (km) – vahe Maa keskpunkti ja Maa PINNA vahel.
 *
 * Kogu päikesevarjutuse osa seisab selle arvu peal: Kuu kaugus antakse
 * keskpunktide vahel, aga vari langeb pinnale, mis on 6371 km lähemal.
 * Ilma selleta tuleks vastus alati „rõngasjas" ja mooduli süda kaoks ära.
 */
export const EARTH_RADIUS_KM = 6_371;

/**
 * Maa keskmine kaugus Päikesest (km), keskpunktist keskpunkti.
 *
 * **Sedasama arvu kasutab moodul ka Päike → KUU kauguse asemel** ja see on
 * teadlik lihtsustus, mitte näpuviga (Codexi leid 2026-08-10). Päris Päike →
 * Kuu kaugus on päikesevarjutuse ajal 149 600 000 − 384 400 ehk 149 215 600 km
 * ja täpne koonus tuleks 374 289 asemel 373 328 km.
 *
 * Miks lihtsustatud kuju siiski jääb, kaks põhjust:
 *
 * 1. **Vale täpsus.** Vahe on 0,26%. Sama mudel jätab juba arvestamata Maa
 *    orbiidi ekstsentrilisuse (147,1–152,1 mln km), mis kõigutab koonust
 *    ±1,7% ehk ±6400 km – kuus korda rohkem. Väiksema paranduse tegemine
 *    suurema kõrval ei tee arvu õigemaks, ainult täpsema välimusega.
 * 2. **Pedagoogiline hind.** Parandusega hakkaks koonuse pikkus Kuu kaugusest
 *    ehk liugurist sõltuma. Explore-1 on aga just kontrollküsimus „see arv EI
 *    sõltu liugurist, sest koonuse pikkus tuleb ainult Päikese ja Kuu
 *    suurusest" – see mõte laguneks ära.
 *
 * Ükski õpilase vastus lihtsustusest ei nihku üle tolerantsi: piir liiguks
 * 380 660 → ~379 700 km (tolerants ±5000 km) ja täielik/rõngasjas otsus jääb
 * kogu orbiidi ulatuses samaks.
 */
export const SUN_TO_EARTH_KM = 149_600_000;

/** Kuu lähim kaugus Maast (km), keskpunktide vahel. */
export const MOON_PERIGEE_KM = 356_500;

/** Kuu keskmine kaugus Maast (km) – simulatsiooni algväärtus. */
export const MOON_MEAN_KM = 384_400;

/** Kuu kaugeim kaugus Maast (km). */
export const MOON_APOGEE_KM = 406_700;

/**
 * Simulatsiooni liuguri piirid ja samm
 * (sisu/MOODUL-varjutused.md „explore").
 *
 * Miks MUDELIS, mitte Simulation.tsx-is: sama põhjus mis moodulis
 * `vari-ja-poolvari` – piirid otsustavad, kas ülesande vastust saab liuguriga
 * üldse SEADA, ja test saab seda kontrollida ilma brauserita.
 *
 * **Samm on 100 km, mitte 1000 km** (spetsifikatsiooni parandus samm 4.1n):
 * 1000 km sammuga ei satu võre peale Kuu keskmine kaugus 384 400 km
 * ((384 400 − 356 500) / 1000 = 27,9), mis on liuguri algväärtus, ega ka
 * kaugeim punkt 406 700 km. Algväärtus, mida liugur ise seada ei suuda, on
 * lõks: õpilane liigutab liugurit korra ja ei saa enam kunagi tagasi sinna,
 * kust ta alustas. 100 km sammuga on kõik kolm nimetatud kaugust võre peal.
 */
export const SLIDERS = {
  /** Kuu kaugus Maast (km), KESKPUNKTIDE vahel. */
  moonDistanceKm: {
    min: MOON_PERIGEE_KM,
    max: MOON_APOGEE_KM,
    step: 100,
  },
} as const satisfies Record<string, { min: number; max: number; step: number }>;

/**
 * Alla selle laiuse (km) loeb mudel täisvarju olematuks.
 *
 * See EI ole füüsika, vaid arvutamise puhastus – täpselt sama mure ja sama
 * lahendus mis `UMBRA_ZERO_M` moodulis `vari-ja-poolvari` (Codexi leid
 * 2026-08-10). Kui täisvarju tipp lõpeb TÄPSELT ekraani peal, on lahutuse
 * tulemus paberil null, aga ujukomas jääb sinna tolmutera, ja siis väidaks
 * mudel, et täisvari on olemas, kuvades samas suurt „0 km".
 *
 * Miks just millimeeter: siinsed arvud on sadade kuni miljonite kilomeetrite
 * kandis, seega on ujukomajääk kilomeetri murdosa kandis kõige rohkem; samas
 * on millimeeter astronoomias täielik olematus. Lävi ei saa ära süüa ühtki
 * varju, mida õpilane näeks – väikseim, mida see moodul näitab, on
 * kilomeetrite kandis.
 */
const UMBRA_ZERO_KM = 1e-6;

/* --------------------------------------------------------------------------
 * Sisendikontroll
 * ----------------------------------------------------------------------- */

/**
 * Positiivne pikkus: 0 ega negatiivne ei ole vaadeldav olukord. Läbimõõdu 0
 * juures ei ole keha, mis varju heidaks; kauguse 0 juures oleks keha allika
 * sees.
 */
function assertPositive(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${what} peab olema positiivne arv, aga oli ${value}`);
  }
}

/**
 * Ka lõplikest sisenditest võib tulla lõpmatus või NaN (sama mure mis teiste
 * moodulite mudelites). Mudel ei tohi tagastada arvu, mille taga ta seista ei
 * saa. `umbraTipDistance` on erand – seal on lõpmatus PÄRIS vastus ja seda
 * kontrolli seal ei tehta.
 */
function assertFiniteResult(value: number, what: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${what} ei mahu arvu sisse: tuli ${value}`);
  }
}

/**
 * Kuu kaugus Maa KESKPUNKTIST peab olema Maa raadiusest suurem – muidu oleks
 * Kuu Maa sees ja „kaugus Maa pinnani" tuleks null või negatiivne.
 *
 * See ei ole teoreetiline: harjutus 4 annab kauguse 340 000 km, mis on
 * liuguri vahemikust VÄLJAS (allpool lähimat punkti), ja see on lubatud.
 * Piiratud on ainult see, mis ei ole enam olukord, vaid viga.
 */
function assertOutsideEarth(centreDistanceKm: number): void {
  assertPositive(centreDistanceKm, "Kuu kaugus Maa keskpunktist");
  if (centreDistanceKm <= EARTH_RADIUS_KM) {
    throw new RangeError(
      `Kuu peab olema Maast väljaspool: kaugus keskpunktist oli ${centreDistanceKm} km, Maa raadius ${EARTH_RADIUS_KM} km`,
    );
  }
}

/* --------------------------------------------------------------------------
 * Üldine varjugeomeetria (sama, mis moodulis `vari-ja-poolvari`)
 * ----------------------------------------------------------------------- */

/**
 * Kui kaugele keha taha täisvarju koonus ulatub (km, mõõdetuna KEHAST).
 *
 * `sourceToBody · bodyDiameter / (sourceDiameter − bodyDiameter)`, kui allikas
 * on kehast suurem; muidu `Number.POSITIVE_INFINITY`.
 *
 * Sama valem, mis `umbraLengthBehindObject` moodulis `vari-ja-poolvari`.
 * Laiendatud allika korral lõpeb täisvari teravikuga: allika kumbki serv
 * paistab keha tagant mööda ja ühest kohast alates jõuab igasse punkti valgus
 * vähemalt ühest allika servast.
 *
 * **Lõpmatus on siin päris vastus, mitte veakood** – ta ütleb füüsikaväite
 * „täisvari ei lõpe". Astronoomias seda juhtu ei tule (allikas on alati Päike
 * ja seega alati suurem), aga funktsioon peab vastama õigesti, mitte
 * lõpmatusega jagama; muidu rändaks valem ühel päeval valesse konteksti
 * (CodeRabbiti leid mooduli spetsi juures).
 *
 * @param sourceDiameterKm valgusallika läbimõõt (km)
 * @param bodyDiameterKm varju heitva keha läbimõõt (km)
 * @param sourceToBodyKm allikas → keha, keskpunktist keskpunkti (km)
 */
export function umbraTipDistance(
  sourceDiameterKm: number,
  bodyDiameterKm: number,
  sourceToBodyKm: number,
): number {
  assertPositive(sourceDiameterKm, "Allika läbimõõt");
  assertPositive(bodyDiameterKm, "Keha läbimõõt");
  assertPositive(sourceToBodyKm, "Kaugus allikast kehani");

  if (sourceDiameterKm <= bodyDiameterKm) return Number.POSITIVE_INFINITY;

  const tipKm =
    (sourceToBodyKm * bodyDiameterKm) / (sourceDiameterKm - bodyDiameterKm);
  assertFiniteResult(tipKm, "Täisvarju koonuse pikkus");
  return tipKm;
}

/**
 * Täisvarju laius sellel kaugusel keha taga (km).
 *
 * `max(0, bodyDiameter − bodyToScreen · (sourceDiameter − bodyDiameter) / sourceToBody)`
 *
 * Sama asi, mis `umbraWidth` moodulis `vari-ja-poolvari`, aga kirjutatud kujul
 * „keha läbimõõt miinus see, mis ära on söödud". Sellest kujust on kohe näha,
 * et **täisvari kahaneb ühtlaselt nullini täpselt tipus:**
 * `= bodyDiameter · (1 − bodyToScreen / umbraTipDistance)`.
 *
 * **See teisendus kehtib ainult siis, kui allikas on kehast SUUREM.** Kui
 * allikas on väiksem või sama suur, siis tippu ei tekigi (`umbraTipDistance`
 * on lõpmatus) ja täisvari hoopis KASVAB kaugusega – siis kehtib ainult
 * ülemine, `max`-iga valem. Test katab mõlemat haru.
 *
 * **Miks nulliga piiramine on lubatud vaikne parandus:** matemaatiline tulemus
 * läheb miinusesse siis, kui koonus on juba enne ekraani teravikuga otsa
 * saanud. „−200 km laiune täisvari" ei tähenda õpilase jaoks midagi ja checker
 * hakkaks miinusmärki nõudma; füüsikas tähendab miinus lihtsalt „täisvarju ei
 * ole". Simulatsioon ütleb selle olukorra välja SÕNADEGA („täisvarju Maal ei
 * ole"), mitte ainult arvuga 0.
 *
 * @param sourceDiameterKm valgusallika läbimõõt (km)
 * @param bodyDiameterKm varju heitva keha läbimõõt (km)
 * @param sourceToBodyKm allikas → keha (km)
 * @param bodyToScreenKm keha → ekraan (km)
 */
export function umbraWidthAtDistance(
  sourceDiameterKm: number,
  bodyDiameterKm: number,
  sourceToBodyKm: number,
  bodyToScreenKm: number,
): number {
  assertPositive(sourceDiameterKm, "Allika läbimõõt");
  assertPositive(bodyDiameterKm, "Keha läbimõõt");
  assertPositive(sourceToBodyKm, "Kaugus allikast kehani");
  assertPositive(bodyToScreenKm, "Kaugus kehast ekraanini");

  const widthKm =
    bodyDiameterKm -
    (bodyToScreenKm * (sourceDiameterKm - bodyDiameterKm)) / sourceToBodyKm;
  assertFiniteResult(widthKm, "Täisvarju laius");
  return widthKm < UMBRA_ZERO_KM ? 0 : widthKm;
}

/**
 * Poolvarju riba laius ÜHEL serval sellel kaugusel keha taga (km).
 *
 * `sourceDiameter · bodyToScreen / sourceToBody`
 *
 * Sama valem, mis `penumbraBandWidth` moodulis `vari-ja-poolvari`. Pane
 * tähele, et keha läbimõõt siin ei esine: poolvarju riba laiust määravad
 * ainult allika suurus ja kaugused. Just seepärast on Kuu ja Maa poolvarjud
 * samal kaugusel ühesuguse servaga, kuigi kehad ise on väga eri suurusega.
 *
 * @param sourceDiameterKm valgusallika läbimõõt (km)
 * @param sourceToBodyKm allikas → keha (km)
 * @param bodyToScreenKm keha → ekraan (km)
 */
export function penumbraBandAtDistance(
  sourceDiameterKm: number,
  sourceToBodyKm: number,
  bodyToScreenKm: number,
): number {
  assertPositive(sourceDiameterKm, "Allika läbimõõt");
  assertPositive(sourceToBodyKm, "Kaugus allikast kehani");
  assertPositive(bodyToScreenKm, "Kaugus kehast ekraanini");

  const widthKm = (sourceDiameterKm * bodyToScreenKm) / sourceToBodyKm;
  assertFiniteResult(widthKm, "Poolvarju riba laius");
  return widthKm;
}

/* --------------------------------------------------------------------------
 * Rakendus: Päike, Kuu ja Maa
 *
 * Siit allpool ei ole enam ühtki uut valemit – ainult ülalolevad funktsioonid
 * konkreetsete taevakehadega. Nii on sisufailidel üks koht, kust arvu küsida,
 * ja Simulation.tsx ei pea ise teadma, et ekraan on Maa PIND, mitte keskpunkt.
 * ----------------------------------------------------------------------- */

/**
 * Kuu täisvarju koonuse pikkus (km) – 374 289 km. Mooduli kõige tähtsam arv.
 *
 * Ta EI sõltu Kuu kaugusest Maast, sest koonuse kuju otsustavad ainult Päikese
 * ja Kuu suurus ning nendevaheline kaugus. Just seda kontrollib explore-1.
 */
export const MOON_UMBRA_TIP_KM = umbraTipDistance(
  SUN_DIAMETER_KM,
  MOON_DIAMETER_KM,
  SUN_TO_EARTH_KM,
);

/**
 * Maa täisvarju koonuse pikkus (km) – 1 382 050 km.
 *
 * Peaaegu neli korda pikem kui Kuu kaugus, seega ei ole küsimustki, kas ta
 * Kuuni jõuab. See ongi vastus küsimusele, miks kuuvarjutus ei ole kunagi
 * „rõngasjas".
 */
export const EARTH_UMBRA_TIP_KM = umbraTipDistance(
  SUN_DIAMETER_KM,
  EARTH_DIAMETER_KM,
  SUN_TO_EARTH_KM,
);

/**
 * Piir (km), kus päikesevarjutus muutub täielikust rõngasjaks – 380 660 km
 * KESKPUNKTIDE vahel.
 *
 * `MOON_UMBRA_TIP_KM + EARTH_RADIUS_KM`: koonuse tipp jõuab täpselt Maa
 * pinnale. Kuu keskmine kaugus 384 400 km on sellest suurem – seepärast ongi
 * rõngasjas varjutus veidi sagedasem kui täielik. Explore-3 õige vastus
 * tuleb siit, mitte käsitsi kirjutatuna.
 */
export const SOLAR_ECLIPSE_LIMIT_KM = MOON_UMBRA_TIP_KM + EARTH_RADIUS_KM;

/**
 * Kaugus Kuust Maa PINNANI (km), kui Kuu keskpunkt on antud kaugusel.
 *
 * Ekraan on Maa pind, mitte keskpunkt – Maa raadius tuleb maha lahutada. See
 * üksainus lahutamine on koht, kus kogu moodul kõige kergemini valeks läheb,
 * ja seepärast on ta oma nimega funktsioon, mitte laiali pandud `− 6371`.
 */
function moonToEarthSurfaceKm(moonEarthCentreDistanceKm: number): number {
  assertOutsideEarth(moonEarthCentreDistanceKm);
  return moonEarthCentreDistanceKm - EARTH_RADIUS_KM;
}

/**
 * Täisvarju laigu laius Maa pinnal (km) päikesevarjutuse ajal.
 *
 * Kuu lähimas punktis (356 500 km) on see ~224 km – Eestist Riiani. Kõrval,
 * poolvarjus, on osaline varjutus ja seda näeb tuhandete kilomeetrite
 * laiuselt; siit tuleb vastus küsimusele, miks on „see sama päikesevarjutus"
 * ühele riigile täielik ja teisele osaline.
 *
 * 0 tähendab, et koonus lõppes enne Maad ära – siis on varjutus rõngasjas.
 *
 * @param moonEarthCentreDistanceKm Kuu kaugus Maa KESKPUNKTIST (km)
 */
export function solarUmbraSpotKm(moonEarthCentreDistanceKm: number): number {
  return umbraWidthAtDistance(
    SUN_DIAMETER_KM,
    MOON_DIAMETER_KM,
    SUN_TO_EARTH_KM,
    moonToEarthSurfaceKm(moonEarthCentreDistanceKm),
  );
}

/**
 * Kui palju jääb täisvarju koonusel Maa pinnani PUUDU (km); 0, kui ta jõuab
 * kohale.
 *
 * Seda arvu näitab simulatsioon rõngasja varjutuse juures („täisvari jääb ___
 * km puudu") ja seda küsib väljumispilet 2. Ilma selleta teeks sisufail
 * lahutamise ise ära – see oleks füüsika väljaspool model.ts-i (CLAUDE.md
 * reegel 1) ja täpselt seda viga leidis CodeRabbit moodulis
 * `vari-ja-poolvari`.
 *
 * @param moonEarthCentreDistanceKm Kuu kaugus Maa KESKPUNKTIST (km)
 */
export function solarUmbraGapKm(moonEarthCentreDistanceKm: number): number {
  const gapKm =
    moonToEarthSurfaceKm(moonEarthCentreDistanceKm) - MOON_UMBRA_TIP_KM;
  return gapKm < UMBRA_ZERO_KM ? 0 : gapKm;
}

/**
 * Kas päikesevarjutus on täielik või rõngasjas.
 *
 * Tagastab INGLISKEELSE sildi; eestikeelse teksti („täielik" / „rõngasjas")
 * paneb peale Simulation.tsx – model.ts ei tea UI keelest midagi.
 *
 * **Otsuse teeb täisvarju laik, mitte eraldi võrdlus** (spetsifikatsiooni
 * täpsustus samm 4.1n). Spetsifikatsioon ütles tingimuse kujul „koonuse pikkus
 * ≥ kaugus pinnani"; sisuliselt on see sama asi, aga eraldi kirjutatud
 * võrdlusest saaks ühel päeval seis, kus silt ütleb „täielik" ja suur arv
 * kõrval „täisvarju Maal ei ole". Nüüd ei saa nad põhimõtteliselt lahku minna.
 * Vahe on ainult täpselt piiri peal (380 660,2 km), mida liuguri 100 km võre
 * niikuinii ei taba: seal loeb mudel varjutuse rõngasjaks, sest laiuseta
 * täisvarjust ei näeks maapinnal seisja mitte midagi.
 *
 * Sama põhjendus mis `hasUmbra`-l moodulis `vari-ja-poolvari`: võrdluse teeb
 * MUDEL, komponent ainult kuvab tulemuse.
 *
 * @param moonEarthCentreDistanceKm Kuu kaugus Maa KESKPUNKTIST (km)
 */
export function solarEclipseKind(
  moonEarthCentreDistanceKm: number,
): "total" | "annular" {
  return solarUmbraSpotKm(moonEarthCentreDistanceKm) > 0 ? "total" : "annular";
}

/**
 * Maa täisvarju laius Kuu kaugusel (km) – kuuvarjutus.
 *
 * Keskmisel kaugusel 9198 km ehk 2,6 korda laiem kui Kuu ise (3474 km). Kuu
 * mahub tervenisti sisse ja jääb sinna tundideks – vastupidiselt paarile
 * minutile päikesevarjutuse ajal.
 *
 * **Lihtsustus, mis on ka spetsifikatsioonis kirjas:** ekraaniks loetakse Kuu
 * keskpunkti kaugus, mitte tema lähem serv. Kuu raadius 1737 km on Maa varju
 * laiuse kõrval tühine ja lahutamine ei muudaks ühtki vastust, küll aga
 * teeks selgituse õpilase jaoks segaseks.
 *
 * @param moonEarthCentreDistanceKm Kuu kaugus Maa KESKPUNKTIST (km)
 */
export function lunarUmbraWidthKm(moonEarthCentreDistanceKm: number): number {
  assertOutsideEarth(moonEarthCentreDistanceKm);
  return umbraWidthAtDistance(
    SUN_DIAMETER_KM,
    EARTH_DIAMETER_KM,
    SUN_TO_EARTH_KM,
    moonEarthCentreDistanceKm,
  );
}

/**
 * Maa poolvarju riba laius ühel serval Kuu kaugusel (km) – keskmisel kaugusel
 * 3577 km.
 *
 * @param moonEarthCentreDistanceKm Kuu kaugus Maa KESKPUNKTIST (km)
 */
export function lunarPenumbraBandKm(
  moonEarthCentreDistanceKm: number,
): number {
  assertOutsideEarth(moonEarthCentreDistanceKm);
  return penumbraBandAtDistance(
    SUN_DIAMETER_KM,
    SUN_TO_EARTH_KM,
    moonEarthCentreDistanceKm,
  );
}

/**
 * Mitu korda on Maa täisvari Kuu kaugusel laiem kui Kuu ise – harjutus 2
 * (vastus 2,6).
 *
 * Ühikuta suhe. Ta on siin, mitte sisufailis, sest ka jagamine on füüsika:
 * sisufaili kirjutatud „9198 / 3474" jääks paigale ka siis, kui mõni konstant
 * muutub.
 *
 * @param moonEarthCentreDistanceKm Kuu kaugus Maa KESKPUNKTIST (km)
 */
export function lunarUmbraToMoonRatio(
  moonEarthCentreDistanceKm: number,
): number {
  const ratio =
    lunarUmbraWidthKm(moonEarthCentreDistanceKm) / MOON_DIAMETER_KM;
  assertFiniteResult(ratio, "Maa varju ja Kuu suhe");
  return ratio;
}
