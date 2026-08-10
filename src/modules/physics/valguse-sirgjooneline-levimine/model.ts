/**
 * Valgus levib sirgjooneliselt – füüsika
 * (sisu/MOODUL-valguse-sirgjooneline-levimine.md „Füüsika").
 *
 * Ainult puhtad funktsioonid: sama sisend → alati sama väljund, ei Reacti,
 * ei DOM-i, ei juhuslikkust (CLAUDE.md reegel 1). Simulation.tsx ainult kuvab
 * seda, mida siin arvutatakse.
 *
 * **Kogu moodul tugineb ühele lausele:** ühtlases läbipaistvas keskkonnas levib
 * valgus mööda sirgjoont. Selle arvuline tagajärg on nõelaugukaamera ja kogu
 * matemaatika siin on kaks tehet – jagamine ja korrutamine. Ühtki nurka ega
 * arkustangensit ei ole (sama otsus mis moodulis `valgusallikad`, samm 4.1d):
 * 8. klassi matemaatika on suhe, mitte trigonomeetria. Kui siia ilmub kunagi
 * funktsioon, mis tagastab kraade, on see märk, et keegi lahendab ülesannet,
 * mida see moodul ei küsi.
 *
 * SI-ühikud sees: KÕIK pikkused meetrites, ka augu läbimõõt. Liugur näitab
 * millimeetreid, aga teisenduse teeb `holeDiameterFromMm` siinsamas – nii on
 * mudelis üksainus pikkusühik ja segamini ajada ei ole midagi.
 *
 * **Kujutis on pea peal ja vasak-parem vahetuses** – see EI ole arv, vaid
 * joonise omadus: eseme tipust lähtuv kiir läheb läbi augu alla. Mudel tagastab
 * ainult positiivseid pikkusi; ümberpööramist ei kodeerita miinusmärgiga, sest
 * siis läheks õpilase ekraanile „−10 cm" ja checker hakkaks miinusmärki
 * nõudma. Ümberpööramine elab joonises.
 *
 * Vigane sisend VISKAB vea, ta ei „paranda" ennast vaikselt – vaikne parandus
 * peidaks ära vea kutsuvas koodis (nt liuguri vale alampiir) ja õpilane näeks
 * õiget arvu vale sisendi pealt.
 */

/**
 * Simulatsiooni nupurea päris näited (meetrites).
 *
 * Ainult arvud – eestikeelsed nimed („küünal") on kasutajaliidese asi ja elavad
 * Simulation.tsx-is. Kambri sügavus siin EI ole: tema jääb liuguri kätte ja
 * ülesanded ütlevad ise, mis peale ta seada.
 *
 * `distanceM` on iga näite juures TÜÜPILINE vaatluskaugus, mitte ainus lubatud
 * – kauguse liugur jääb õpilase käes vabaks.
 */
export const EXAMPLE_OBJECTS = {
  kuunal: { heightM: 0.2, distanceM: 1 },
  inimene: { heightM: 1.8, distanceM: 9 },
  puu: { heightM: 6, distanceM: 12 },
  maja: { heightM: 8, distanceM: 40 },
} as const satisfies Record<string, { heightM: number; distanceM: number }>;

/** Simulatsiooni nupureal valitav näide. */
export type ExampleObjectId = keyof typeof EXAMPLE_OBJECTS;

/**
 * Simulatsiooni liugurite piirid ja sammud
 * (sisu/MOODUL-valguse-sirgjooneline-levimine.md „explore").
 *
 * Miks MUDELIS, mitte Simulation.tsx-is: piirid otsustavad, kas ülesande vastust
 * saab liuguriga üldse SEADA. Kui explore-2 vastus 0,4 m jääks kambri liuguri
 * otsast välja või tolerants 5% jääks sammust väiksemaks, oleks ülesanne
 * lahendamatu – ja seda ei paneks brauseris keegi tähele, sest liugur liigub
 * ilusti edasi. Siin failis saab test neid piire ülesannete arvude vastu
 * kontrollida (CodeRabbiti leid 2026-08-10, samm 4.1g).
 *
 * `holeMm` on MILLIMEETRITES, sest just nii seisab arv liuguri juures; mudelile
 * annab ta edasi `holeDiameterFromMm`.
 */
export const SLIDERS = {
  /** Kaugus esemest augu tasapinnani (m). */
  distanceM: { min: 0.5, max: 40, step: 0.5 },
  /** Kambri sügavus august ekraanini (m). */
  boxDepthM: { min: 0.05, max: 0.5, step: 0.01 },
  /** Augu läbimõõt (mm) – ainus suurus, mida õpilane näeb muus ühikus. */
  holeMm: { min: 0.5, max: 20, step: 0.5 },
} as const satisfies Record<string, { min: number; max: number; step: number }>;

/**
 * Positiivne pikkus: 0 ega negatiivne ei ole vaadeldav olukord. Kauguse 0
 * juures oleks ese augu sees ja kujutise kõrgus ei oleks „lõpmata suur", vaid
 * määramata; sügavuse 0 juures langeks ekraan augule ja kujutist ei tekiks.
 */
function assertPositive(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${what} peab olema positiivne arv, aga oli ${value}`);
  }
}

/**
 * Ka lõplikest sisenditest võib tulla lõpmatus (sama mure mis
 * valgusallikad/model.ts-is): väga suur ese väga lühikese kauguse juures voolab
 * korrutamisel üle. Mudel ei tohi tagastada arvu, mille taga ta seista ei saa.
 */
function assertFiniteResult(value: number, what: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${what} ei mahu arvu sisse: tuli ${value}`);
  }
}

/**
 * Augu läbimõõt millimeetritest meetriteks.
 *
 * Ainus koht projektis, kus seda teisendust tehakse. Auk on ainus suurus, mida
 * õpilane näeb muus ühikus kui mudel arvutab (liugur 0,5–20 mm, sest „0,002 m"
 * ei ütle kaheksandikule midagi), ja just seepärast on ta ohtlik: paljas
 * `/ 1000` komponendis on koht, kus keegi ühel päeval unustab jagada ja hägu
 * läheb VAIKSELT tuhat korda valeks – arv ekraanil on ju endiselt arv
 * (CodeRabbiti leid 2026-08-10).
 *
 * Teisendus ise ei ole füüsika, aga ta on mudeli sisendi lepingu osa: kes
 * mudelit kutsub, teeb seda alati meetritega ja teisenduse nime kaudu.
 */
export function holeDiameterFromMm(holeMm: number): number {
  assertPositive(holeMm, "Augu läbimõõt");
  return holeMm / 1000;
}

/**
 * Pikkus meetritest sentimeetriteks.
 *
 * Sama põhjendus mis `holeDiameterFromMm`-il, ainult teistpidi: mudel arvutab
 * meetrites, aga kujutis on kooliolukorras sentimeetrite suurune ja
 * simulatsioon näitab teda nii. Paljas `* 100` komponendis või sisufailis on
 * koht, kus keegi ühel päeval unustab korrutada ja ülesande õige vastus läheb
 * VAIKSELT sada korda valeks – arv ekraanil on ju endiselt arv.
 *
 * Teisendus ise ei ole füüsika, aga ta on mudeli väljundi lepingu osa: kes
 * mudeli arvu muus ühikus näitab, teeb seda alati teisenduse nime kaudu.
 */
export function metersToCm(valueM: number): number {
  assertPositive(valueM, "Pikkus");
  return valueM * 100;
}

/**
 * Nõelaugukaamera kujutise kõrgus (m) – mooduli PÕHIVALEM.
 *
 * `h' = h · b / L`, kus `h` on eseme kõrgus, `b` kambri sügavus ja `L` kaugus
 * esemeni. Sõnadega, nii nagu õpilane ta ütleb: kujutis on eseme kõrgus
 * korrutatud sellega, mitu korda on kamber lühem kui kaugus.
 *
 * Valem tuleb ainuüksi sirgjoonelisest levimisest: eseme tipust ja jalalt
 * lähtuvad kiired lähevad läbi ühe ja sama augu, seega kujutise ja eseme
 * kõrguste suhe on sama, mis kambri sügavuse ja kauguse suhe. Läätse siin ei
 * ole – see ongi väärarusaama `pea-peal-vajab-laatse` vastus.
 *
 * Järjekord tehtes on meelega `(h · b) / L`, mitte `h · (b / L)`: kaks
 * lähedast tehet annavad ujukomas veidi erineva viimase biti ja pöördtehe
 * `pinholeBoxDepth` on kirjutatud sama järjekorraga, et edasi-tagasi tee tuleks
 * täpselt algse arvu peale tagasi (vt testi „edasi-tagasi").
 *
 * @param objectHeightM eseme kõrgus (m)
 * @param objectDistanceM kaugus esemest augu tasapinnani (m)
 * @param boxDepthM kambri sügavus, august ekraanini (m)
 */
export function pinholeImageHeight(
  objectHeightM: number,
  objectDistanceM: number,
  boxDepthM: number,
): number {
  assertPositive(objectHeightM, "Eseme kõrgus");
  assertPositive(objectDistanceM, "Kaugus esemeni");
  assertPositive(boxDepthM, "Kambri sügavus");
  const imageHeightM = (objectHeightM * boxDepthM) / objectDistanceM;
  assertFiniteResult(imageHeightM, "Kujutise kõrgus");
  return imageHeightM;
}

/**
 * Suurendus: kui suur osa eseme kõrgusest kujutisse jõuab (ühikuta arv).
 *
 * `b / L`. Kooliolukorras on ta alla 1, sest kamber on kaugusest lühem – aga
 * funktsioon ei piira väärtust, ta ainult jagab: liuguritega saab seada
 * `b = L` (siis on ta täpselt 1) ja lühikese kauguse juures ka üle 1. Piiri
 * lisamine tähendaks, et mudel keeldub olukorrast, mille simulatsioon ise
 * võimaldab.
 *
 * Eraldi funktsioon on ta seepärast, et simulatsioon näitab seda arvu ka siis,
 * kui esemena ei ole midagi valitud – suurendus sõltub ainult kambrist ja
 * kaugusest, mitte esemest.
 *
 * @param objectDistanceM kaugus esemest augu tasapinnani (m)
 * @param boxDepthM kambri sügavus (m)
 */
export function pinholeMagnification(
  objectDistanceM: number,
  boxDepthM: number,
): number {
  assertPositive(objectDistanceM, "Kaugus esemeni");
  assertPositive(boxDepthM, "Kambri sügavus");
  const magnification = boxDepthM / objectDistanceM;
  assertFiniteResult(magnification, "Suurendus");
  return magnification;
}

/**
 * Pöördülesanne: kui sügav peab kamber olema, et kujutis tuleks soovitud
 * kõrgusega (m).
 *
 * `b = h' · L / h`. Simulatsiooni ülesanne 2 küsib täpselt seda arvu („tee
 * kujutis 20 cm kõrguseks – kui sügav peab kamber olema?", vastus 0,4 m).
 * Ilma selleta arvutaks vastuse kas sisufail või õpetaja peast, mitte mudel.
 *
 * @param objectHeightM eseme kõrgus (m)
 * @param imageHeightM soovitud kujutise kõrgus (m)
 * @param objectDistanceM kaugus esemeni (m)
 */
export function pinholeBoxDepth(
  objectHeightM: number,
  imageHeightM: number,
  objectDistanceM: number,
): number {
  assertPositive(objectHeightM, "Eseme kõrgus");
  assertPositive(imageHeightM, "Kujutise kõrgus");
  assertPositive(objectDistanceM, "Kaugus esemeni");
  const boxDepthM = (imageHeightM * objectDistanceM) / objectHeightM;
  assertFiniteResult(boxDepthM, "Kambri sügavus");
  return boxDepthM;
}

/**
 * Kui laiaks määrib auk kujutise serva (m).
 *
 * `d · (L + b) / L`, kus `d` on augu läbimõõt. Iga eseme punkt joonistab
 * ekraanile augu suuruse laigu, mistõttu kujutise serv ei ole joon, vaid riba.
 *
 * **Lisanäit, mitte reegel.** Simulatsioon joonistab tema järgi servade uduse
 * riba ja näitab arvu väikeses kirjas; ÜKSKI ülesanne seda ei küsi ja seda
 * valvab test. Augu mõju on selles moodulis kvalitatiivne: mida väiksem auk,
 * seda teravam ja tumedam. Poolvarju MÕISTET siin ei nimetata – ta kuulub
 * moodulisse `vari-ja-poolvari`.
 *
 * Pane tähele, et hägu ei sõltu eseme kõrgusest: sama auk määrib nii suure kui
 * väikese kujutise serva ühepalju. Just seepärast on suur kujutis suhteliselt
 * teravam kui väike – seda võrdlust simulatsioon näitabki.
 *
 * @param holeM augu läbimõõt MEETRITES (liugur näitab mm, teisendab sim)
 * @param objectDistanceM kaugus esemeni (m)
 * @param boxDepthM kambri sügavus (m)
 */
export function pinholeBlurWidth(
  holeM: number,
  objectDistanceM: number,
  boxDepthM: number,
): number {
  assertPositive(holeM, "Augu läbimõõt");
  assertPositive(objectDistanceM, "Kaugus esemeni");
  assertPositive(boxDepthM, "Kambri sügavus");
  const blurM = (holeM * (objectDistanceM + boxDepthM)) / objectDistanceM;
  assertFiniteResult(blurM, "Hägu laius");
  return blurM;
}

/**
 * Kui suur osa kujutise kõrgusest tohib udu olla, et kujutist veel „teravaks"
 * nimetada.
 *
 * Kokkulepe, mitte loodusseadus – aga kooliolukorras tabav: kui serva udu on
 * alla kahekümnendiku kujutise kõrgusest, ei pane silm seda tähele. 20 mm auk
 * annab explore-3 seisus (kamber 0,4 m, kujutis 20 cm) udu 2 cm ehk 10% ja on
 * seega selgelt „udune"; 0,5 mm auk annab samas seisus umbes 0,26% ja on „terav".
 */
export const SHARP_MAX_BLUR_SHARE = 0.05;

/** Kas kujutis paistab terav või udune – sõnaline hinnang simulatsiooni näidikule. */
export type Sharpness = "sharp" | "blurry";

/**
 * Serva udu → sõnaline hinnang.
 *
 * Mudelis samal põhjusel, mis `classifyByRatio` moodulis `valgusallikad`:
 * VÕRDLUSE teeb mudel, komponent ainult kuvab tulemuse. Ükski ülesanne seda
 * sõna ei küsi (explore-3 on valikküsimus), aga näidik ja joonis peavad ütlema
 * sama asja – kaks eri piiri kahes failis läheksid ühel päeval lahku.
 *
 * Suhe on udu ja KUJUTISE KÕRGUSE oma, mitte augu ja kujutise: sama auk määrib
 * suure ja väikese kujutise serva ühepalju, seega suur kujutis on suhteliselt
 * teravam.
 */
export function classifySharpness(blurM: number, imageHeightM: number): Sharpness {
  assertPositive(blurM, "Hägu laius");
  assertPositive(imageHeightM, "Kujutise kõrgus");
  return blurM / imageHeightM <= SHARP_MAX_BLUR_SHARE ? "sharp" : "blurry";
}

/**
 * Kust alates on kujutis piisavalt hele, et teda „heledaks" nimetada (m).
 *
 * Sama laadi kokkulepe mis `SHARP_MAX_BLUR_SHARE`: 5 mm on umbes see auk, mille
 * juures nõelaugukaamera pilt läheb pimedas toas vaadatavast heledaks.
 * Nõelaugukaamera pilt on üldse hämar, sest auku läbib vähe valgust – see ongi
 * augu teine pool ja seda ütleb simulatsioon välja.
 */
export const BRIGHT_MIN_HOLE_M = 0.005;

/** Kas kujutis paistab hele või hämar. */
export type Brightness = "bright" | "dim";

/**
 * Augu läbimõõt → heledus.
 *
 * Mudelis samal põhjusel mis `classifySharpness`: see on õpilasele nähtav
 * füüsikaväide („kujutis on hele"), seega peab võrdlus olema testitav ja ühes
 * kohas (CLAUDE.md reegel 1; CodeRabbit ja Codex leidsid mõlemad sama asja
 * 2026-08-10).
 *
 * **Heledus ja teravus on kaks eri asja ja käivad eri suundades:** heledus
 * sõltub AINULT augu suurusest (lai auk laseb rohkem valgust läbi), teravus udu
 * ja kujutise kõrguse suhtest. Suur kujutis laia augu juures on ühtaegu terav ja
 * hele – kui need kaks sõna ühte lauset kokku liita, tuleb ekraanile vale väide.
 *
 * @param holeM augu läbimõõt MEETRITES (liugur näitab mm, teisendab
 *   `holeDiameterFromMm`)
 */
export function classifyBrightness(holeM: number): Brightness {
  assertPositive(holeM, "Augu läbimõõt");
  return holeM >= BRIGHT_MIN_HOLE_M ? "bright" : "dim";
}
