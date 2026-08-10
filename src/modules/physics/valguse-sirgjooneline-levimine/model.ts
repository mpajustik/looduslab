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
