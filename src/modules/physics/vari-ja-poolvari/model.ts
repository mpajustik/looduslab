/**
 * Täisvari ja poolvari – füüsika
 * (sisu/MOODUL-vari-ja-poolvari.md „Füüsika").
 *
 * Ainult puhtad funktsioonid: sama sisend → alati sama väljund, ei Reacti,
 * ei DOM-i, ei juhuslikkust (CLAUDE.md reegel 1). Simulation.tsx ainult kuvab
 * seda, mida siin arvutatakse.
 *
 * **Kogu moodul on ühe lause tagajärg:** valgus levib sirgjooneliselt, seega on
 * varju piir see koht, kust allikat enam ei paista. Kõik siinsed valemid
 * tulevad sirgetest joontest, mitte nurkadest – 8. klassi matemaatika on
 * jagamine ja korrutamine (sama otsus mis moodulites `valgusallikad` ja
 * `valguse-sirgjooneline-levimine`, samm 4.1d). Kui siia ilmub kunagi
 * funktsioon, mis tagastab kraade, on see märk, et keegi lahendab ülesannet,
 * mida see moodul ei küsi.
 *
 * SI-ühikud sees: KÕIK pikkused meetrites. Sentimeetrid on ainult ekraanil ja
 * teisenduse teeb `metersToCm` siinsamas.
 *
 * **Kokkulepe, mis läbib kogu moodulit: kõiki kaugusi mõõdetakse ALLIKAST.**
 * `a` on allikas → keha, `b` on allikas → ekraan, seega alati `b > a`. Sama
 * kokkulepet nõuab teacher.ts päris katses – ainult nii tuleb varju
 * kahekordistumine mõõdetuna välja.
 *
 * Vigane sisend VISKAB vea, ta ei „paranda" ennast vaikselt – vaikne parandus
 * peidaks ära vea kutsuvas koodis (nt liuguri vale alampiir) ja õpilane näeks
 * õiget arvu vale sisendi pealt. AINUS erand on täisvarju piiramine nulliga
 * (`umbraWidth`) ja see on õpilase huvides, mitte mugavusest – vt sealt.
 */

/**
 * Palli läbimõõt (m) – kogu moodulis muutumatu.
 *
 * Konstant, mitte liugur: moodulilepingu järgi tohib alguses muutuda
 * maksimaalselt kaks suurust ja siin on need allika laius ning ekraani kaugus.
 * Kui ka keha suurus liiguks, ei teaks õpilane ülesandes 2, kumb muutus
 * täisvarju kitsamaks tegi.
 */
export const BALL_DIAMETER_M = 0.1;

/**
 * Simulatsiooni liugurite piirid ja sammud
 * (sisu/MOODUL-vari-ja-poolvari.md „explore").
 *
 * Miks MUDELIS, mitte Simulation.tsx-is: piirid otsustavad, kas ülesande
 * vastust saab liuguriga üldse SEADA, ja veel enam – nemad hoiavad püsti
 * eelduse `b > a`. `objectDistanceM` suurim väärtus on 1 m ja
 * `screenDistanceM` vähim 1,2 m, seega ei saa ekraan sattuda keha ette ega
 * peale ükskõik millise liuguriseisu juures. Nii ei pea Simulation.tsx
 * liugureid teineteise järgi piirama ega mudeli viga kinni püüdma.
 *
 * **Kui neid vahemikke kunagi muudetakse, tuleb see tingimus üle kontrollida**
 * – testis on ta kirjas eraldi kontrollina, mitte kommentaarina.
 */
export const SLIDERS = {
  /** Allika laius (m); 0 on lubatud ja tähendab punktvalgusallikat. */
  sourceWidthM: { min: 0, max: 0.4, step: 0.01 },
  /** Allikas → ekraan (m) – suurus `b`. */
  screenDistanceM: { min: 1.2, max: 5, step: 0.1 },
  /** Allikas → pall (m) – suurus `a`; avaneb alles pärast ülesannet 2. */
  objectDistanceM: { min: 0.5, max: 1, step: 0.1 },
} as const satisfies Record<string, { min: number; max: number; step: number }>;

/**
 * Alla selle laiuse (m) loeb mudel täisvarju olematuks.
 *
 * See EI ole füüsika, vaid arvutamise puhastus. Kui täisvari lõpeb TÄPSELT
 * ekraani peal, on lahutuse tulemus paberil null, aga ujukomas jääb sinna
 * tolmutera: `(0,1 · 1,5 − 0,3 · 0,5)` annab JavaScriptis `2,8e-17`. Ilma
 * läveta väidaks `hasUmbra` sellises seisus, et täisvari on olemas, ja õpilane
 * näeks suurt „0 cm" seal, kus peab seisma „täisvarju ei ole" – ja need kolm
 * väärtust on liuguritega päriselt seatavad (Codexi leid 2026-08-10).
 *
 * Miks just nanomeeter: jääk on 1e-17 kandis ehk sada miljonit korda väiksem,
 * seega lävi katab ta kindlalt; samas on nanomeeter kooli mõõdulindi jaoks
 * täielik olematus – väikseim täisvari, mida see moodul kunagi näitab, on
 * sentimeetrite kandis. Lävi ei saa seega ära süüa ühtki varju, mida õpilane
 * näeks.
 */
const UMBRA_ZERO_M = 1e-9;

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
 * Mittenegatiivne pikkus: allika laius 0 EI ole viga, vaid punktvalgusallikas
 * – mooduli kõige olulisem piirjuht (ainult täisvari, poolvari täpselt 0).
 * Negatiivne laius on endiselt viga.
 */
function assertNonNegative(value: number, what: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(
      `${what} ei tohi olla negatiivne, aga oli ${value}`,
    );
  }
}

/**
 * Ekraan on alati kehast KAUGEMAL – muidu ei ole varju, mida vaadata.
 * `b = a` tähendaks ekraani täpselt keha peal, `b < a` ekraani keha ees.
 * Kumbki ei ole „veidi vale sisend", vaid teine ülesanne.
 */
function assertScreenBehindObject(
  objectDistanceM: number,
  screenDistanceM: number,
): void {
  if (screenDistanceM <= objectDistanceM) {
    throw new RangeError(
      `Ekraan peab olema kehast kaugemal: allikas → ekraan oli ${screenDistanceM} m, allikas → keha ${objectDistanceM} m`,
    );
  }
}

/**
 * Ka lõplikest sisenditest võib tulla lõpmatus (sama mure mis teiste moodulite
 * mudelites): väga suur keha väga väikese kauguse juures voolab jagamisel üle.
 * Mudel ei tohi tagastada arvu, mille taga ta seista ei saa.
 */
function assertFiniteResult(value: number, what: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${what} ei mahu arvu sisse: tuli ${value}`);
  }
}

/**
 * Pikkus meetritest sentimeetriteks.
 *
 * Mudel arvutab meetrites, aga vari on kooliolukorras sentimeetrite suurune ja
 * simulatsioon näitab teda nii. Paljas `* 100` komponendis või sisufailis on
 * koht, kus keegi ühel päeval unustab korrutada ja ülesande õige vastus läheb
 * VAIKSELT sada korda valeks – arv ekraanil on ju endiselt arv.
 *
 * Erinevalt teiste moodulite samanimelisest funktsioonist lubab see NULLI:
 * „täisvari 0 cm" ja „poolvari 0 cm" on siin päris tulemused, mitte vead.
 */
export function metersToCm(valueM: number): number {
  assertNonNegative(valueM, "Pikkus");
  return valueM * 100;
}

/**
 * Täisvarju laius ekraanil (m) – mooduli PÕHIVALEM.
 *
 * `(d·b − s·(b − a)) / a`, nulliga piiratud.
 *
 * Punktallikaga (`s = 0`) taandub ta kujule `d·b/a` ehk sõnadega, nii nagu
 * õpilane ta ütleb: vari on sama palju kordi laiem kui keha, kui palju kordi
 * on ekraan kaugemal kui keha. Iga lisatud sentimeeter allika laiust SÖÖB
 * täisvarju – seda söömist mõõdab lahutatav `s·(b − a)/a`, mis on täpselt kaks
 * poolvarju riba.
 *
 * **Miks nulliga piiramine on siin lubatud vaikne parandus:** matemaatiline
 * tulemus läheb miinusesse siis, kui täisvari on juba enne ekraanit teravikuga
 * otsa saanud (vt `umbraLengthBehindObject`). „−10 cm laiune täisvari" ei
 * tähenda õpilase jaoks midagi ja checker hakkaks miinusmärki nõudma; füüsikas
 * tähendab miinus lihtsalt „täisvarju ei ole". Simulatsioon ütleb selle
 * olukorra välja SÕNADEGA („täisvarju ei ole"), mitte ainult arvuga 0 –
 * vt `hasUmbra`. Nulli loetakse `UMBRA_ZERO_M` täpsusega, sest täpselt ekraani
 * peal lõppev täisvari jätab ujukomasse tolmutera.
 *
 * @param objectDiameterM keha läbimõõt `d` (m)
 * @param sourceWidthM allika laius `s` (m); 0 = punktvalgusallikas
 * @param objectDistanceM allikas → keha `a` (m)
 * @param screenDistanceM allikas → ekraan `b` (m), alati suurem kui `a`
 */
export function umbraWidth(
  objectDiameterM: number,
  sourceWidthM: number,
  objectDistanceM: number,
  screenDistanceM: number,
): number {
  assertPositive(objectDiameterM, "Keha läbimõõt");
  assertNonNegative(sourceWidthM, "Allika laius");
  assertPositive(objectDistanceM, "Kaugus allikast kehani");
  assertPositive(screenDistanceM, "Kaugus allikast ekraanini");
  assertScreenBehindObject(objectDistanceM, screenDistanceM);

  const widthM =
    (objectDiameterM * screenDistanceM -
      sourceWidthM * (screenDistanceM - objectDistanceM)) /
    objectDistanceM;
  assertFiniteResult(widthM, "Täisvarju laius");
  return widthM < UMBRA_ZERO_M ? 0 : widthM;
}

/**
 * Poolvarju riba laius ÜHEL serval (m).
 *
 * `s·(b − a) / a`. Vasakul ja paremal on riba ühesugune, seega kogu tumeda ala
 * juurde annab ta kaks korda oma laiuse.
 *
 * Punktallikaga on ta täpselt 0 – **see ongi põhjus, miks punktallikas annab
 * teravaservalise varju** ja miks poolvari on laiendatud allika tunnus
 * (väärarusaam `punktallikas-annab-poolvarju`).
 *
 * Pane tähele, et keha läbimõõt siin ei esine: poolvarju riba laiust määravad
 * ainult allika laius ja kaugused. Suur ja väike pall annavad samas seisus
 * ühesuguse serva – nii ongi asfaldil oma varju juures.
 *
 * @param sourceWidthM allika laius `s` (m); 0 = punktvalgusallikas
 * @param objectDistanceM allikas → keha `a` (m)
 * @param screenDistanceM allikas → ekraan `b` (m)
 */
export function penumbraBandWidth(
  sourceWidthM: number,
  objectDistanceM: number,
  screenDistanceM: number,
): number {
  assertNonNegative(sourceWidthM, "Allika laius");
  assertPositive(objectDistanceM, "Kaugus allikast kehani");
  assertPositive(screenDistanceM, "Kaugus allikast ekraanini");
  assertScreenBehindObject(objectDistanceM, screenDistanceM);

  const widthM =
    (sourceWidthM * (screenDistanceM - objectDistanceM)) / objectDistanceM;
  assertFiniteResult(widthM, "Poolvarju riba laius");
  return widthM;
}

/**
 * Kogu tumeda ala laius ekraanil (m): täisvari + mõlemad poolvarju ribad.
 *
 * `(d·b + s·(b − a)) / a`. Sama valem mis täisvarjul, ainult plussmärgiga:
 * allika laius sööb täisvarju servadest sisse, aga lükkab kogu varju piiri
 * väljapoole.
 *
 * **Seos, mida test valvab:** `totalShadowWidth = umbraWidth +
 * 2 · penumbraBandWidth` niikaua, kuni täisvari on olemas. Pärast täisvarju
 * kadumist annab `umbraWidth` nulli ja seos enam ei kehti – see on teadlik
 * tagajärg nulliga piiramisest ja mitte viga. Kogu vari on ka siis olemas
 * (hägune laik), tal lihtsalt ei ole enam päris tumedat keset.
 */
export function totalShadowWidth(
  objectDiameterM: number,
  sourceWidthM: number,
  objectDistanceM: number,
  screenDistanceM: number,
): number {
  assertPositive(objectDiameterM, "Keha läbimõõt");
  assertNonNegative(sourceWidthM, "Allika laius");
  assertPositive(objectDistanceM, "Kaugus allikast kehani");
  assertPositive(screenDistanceM, "Kaugus allikast ekraanini");
  assertScreenBehindObject(objectDistanceM, screenDistanceM);

  const widthM =
    (objectDiameterM * screenDistanceM +
      sourceWidthM * (screenDistanceM - objectDistanceM)) /
    objectDistanceM;
  assertFiniteResult(widthM, "Kogu varju laius");
  return widthM;
}

/**
 * Kui kaugele keha taha täisvari ulatub (m, mõõdetuna KEHAST).
 *
 * `a · d / (s − d)`, kui allikas on kehast laiem; muidu
 * `Number.POSITIVE_INFINITY`.
 *
 * Laiendatud allika korral lõpeb täisvari teravikuga: allika kumbki serv
 * paistab keha tagant mööda ja ühest kohast alates jõuab igasse punkti valgus
 * vähemalt ühest allika servast. Kui allikas on kehast väiksem, ei lõpe
 * täisvari kunagi (koonus läheb aina laiemaks); kui allikas on kehaga täpselt
 * sama lai, on täisvari silinder – täpselt keha laiune ükskõik kui kaugel.
 *
 * **Lõpmatus on siin päris vastus, mitte veakood.** Ta ütleb füüsikaväite
 * „täisvari ei lõpe" ja seda peab simulatsioon ka nii kuvama; `null`
 * tagastamine sunniks kutsuja kohta tegema eristust, mille tähendus läheks
 * kohe segi „arvutamine ebaõnnestus" tähendusega.
 *
 * Kontroll, mida test teeb edasi-tagasi: 20 cm laia allikaga lõpeb 10 cm palli
 * täisvari 1 m palli taga ehk 2 m allikast – täpselt seal annab `umbraWidth`
 * nulli.
 *
 * @param objectDiameterM keha läbimõõt `d` (m)
 * @param sourceWidthM allika laius `s` (m)
 * @param objectDistanceM allikas → keha `a` (m)
 */
export function umbraLengthBehindObject(
  objectDiameterM: number,
  sourceWidthM: number,
  objectDistanceM: number,
): number {
  assertPositive(objectDiameterM, "Keha läbimõõt");
  assertNonNegative(sourceWidthM, "Allika laius");
  assertPositive(objectDistanceM, "Kaugus allikast kehani");

  if (sourceWidthM <= objectDiameterM) return Number.POSITIVE_INFINITY;

  const lengthM = (objectDistanceM * objectDiameterM) / (sourceWidthM - objectDiameterM);
  assertFiniteResult(lengthM, "Täisvarju ulatus");
  return lengthM;
}

/**
 * Kas ekraanil on üldse täisvarju.
 *
 * Võrdluse teeb MUDEL, komponent ainult kuvab tulemuse – sama põhjendus mis
 * `classifySharpness`-il moodulis `valguse-sirgjooneline-levimine`. Ilma
 * selleta tekiks Simulation.tsx-i oma `> 0` kontroll ja joonis ning suur arv
 * võiksid ühel päeval eri asja väita.
 *
 * Simulatsioon näitab `false` korral suure arvu asemel teksti „täisvarju ei
 * ole": arv 0 üksi ei ole piisavalt selge ja joonisel kaob must ala päriselt
 * ära (CLAUDE.md disainireegel – värv ega üks silt ei kanna infot üksi).
 */
export function hasUmbra(
  objectDiameterM: number,
  sourceWidthM: number,
  objectDistanceM: number,
  screenDistanceM: number,
): boolean {
  return (
    umbraWidth(
      objectDiameterM,
      sourceWidthM,
      objectDistanceM,
      screenDistanceM,
    ) > 0
  );
}
