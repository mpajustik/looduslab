/**
 * Nurkpeegel – füüsika (sisu/MOODUL-nurkpeegel.md „Füüsika (model.ts jaoks)").
 *
 * Ainult puhtad funktsioonid: sama sisend → alati sama väljund, ei Reacti,
 * ei DOM-i, ei juhuslikkust (CLAUDE.md reegel 1). Simulation.tsx ainult kuvab
 * seda, mida siin arvutatakse – ühtki nurka, kaugust ega suunda ei tohi
 * komponendis uuesti välja arvutada.
 *
 * **Mida see moodul arvutab:** ühe kiire teekonna KAHE tasase peegli vahel.
 * Uut seadust siin ei ole – peegeldumisseadus (β = α, mõõdetuna selle peegli
 * enda ristsirgest) tuli moodulist `peegeldumisseadus` ja siin rakendatakse
 * seda kaks korda järjest. Kogu mooduli sisu on kaks tagajärge:
 *
 * 1. **α + β = θ** – kaks langemisnurka annavad kokku peeglite nurga.
 *    Tipp ja kaks langemispunkti moodustavad kolmnurga nurkadega θ,
 *    (90° − α) ja (90° − β); nurkade summa 180° annab α + β = θ.
 * 2. **δ = 2θ** – kogu pööre sõltub AINULT peeglite nurgast, mitte sellest,
 *    kust kiir tuli. Ühel peeglil pöördub kiir 2α, teisel 2β, kokku
 *    2(α + β) = 2θ.
 *
 * Sellest tuleb ka mooduli tipp: θ = 90° → δ = 180°, ehk väljuv kiir on
 * sissetulevaga vastassuunas ükskõik kui viltu kiir sisse tuli (POHIVARA
 * punkt 18.4, joonis 50). Selle peal töötab helkur – aga see on juba moodul
 * `helkur`, siin seadmeni ei jõuta.
 *
 * ÜHIKUD: kõik nurgad on **kraadides**, kõik pikkused **meetrites**
 * (moodulileping: SI-ühikud sees). Ühikuteisendusi selles failis ei ole –
 * simulatsioon näitab nurki kraadides, nagu nad siin on.
 *
 * Telgistik ja tähised, mida kogu fail kasutab:
 *
 * - Peeglid kohtuvad **tipus**, mis on nullpunkt (0, 0).
 * - **Peegel 1** on x-telg tipust paremale (+x). **Peegel 2** on tipust
 *   lähtuv poolsirge nurga **θ** all vastupäeva. Valgus liigub nendevahelises
 *   kiilus (suunad 0°…θ).
 * - **y kasvab ÜLES** (matemaatiline suund), nagu moodulis
 *   `peegeldumisseadus`. SVG y-telje pööramine on paigutus, mitte füüsika –
 *   see jääb Simulation.tsx-i.
 * - `θ` (`mirrorAngleDeg`) – peeglite vaheline nurk.
 * - `α` (`firstIncidenceDeg`) – langemisnurk peeglil 1, mõõdetuna peegli 1
 *   **ristsirge** suhtes (sama kokkulepe, mis kogu projektis).
 * - `β` – langemisnurk peeglil 2, samuti tema oma ristsirge suhtes: β = θ − α.
 * - `d` (`firstHitDistanceM`) – esimese langemispunkti kaugus tipust.
 * - `e` – teise langemispunkti kaugus tipust.
 * - Kiir liigub alati **tipu poole**: kõigepealt peegel 1, siis peegel 2.
 *   Vastupidine käik on peegelpilt ja annab samad arvud (valguse tee
 *   pööratavus), seda mudel eraldi ei arvuta.
 *
 * **Kaks peegeldust ei ole iseenesestmõistetav.** Mõlemad seosed kehtivad
 * ainult siis, kui kiir peegeldub TÄPSELT kaks korda ja väljub. Kirjeldades
 * kiire liikumissuunda nurgaga ψ (0° = piki peeglit 1 tipust eemale), teeb
 * peegeldus peeglilt 1 ψ → −ψ ja peeglilt 2 ψ → 2θ − ψ. Sissetuleva kiire
 * suund on ψ₀ = −(90° + α), seega ψ₁ = 90° + α ja
 *
 *     ψ₂ = 2θ − 90° − α
 *
 * Kiir väljub kiilust kolmanda peegelduseta täpselt siis, kui 0 < ψ₂ < θ.
 * Siit tulevad kõik selle faili piirid ja need on ARVUTATUD, mitte valitud:
 * `secondIncidenceDeg`, `secondHitDistanceM` ja `traceCornerRay` nõuavad
 * θ > 45° (muidu on 2θ − 90° ≤ 0 ja ükski α ei sobi) ning
 * θ − 90° < α < 2θ − 90°. `deviationDeg` neid piire EI nõua: ta ei joonista
 * teekonda, vaid ütleb ainult, mitu kraadi teeb kaks peegeldust.
 *
 * Väiksema nurga lugu (kiir põrkab peeglite vahel mitu korda) on
 * kaleidoskoop ja jääb sellest moodulist välja – vt spetsi „Piirid".
 *
 * **Idealiseeringud** (UI ega õpetajajuhend ei tohi neid päris füüsikana
 * esitada):
 *
 * 1. **Peeglid on ideaalselt tasased ja lõpmata õhukesed.** Päris peeglil on
 *    klaasi paksus, seega peegeldub natuke valgust ka esipinnalt (topeltpilt
 *    viltu vaadates).
 * 2. **Peegel peegeldab kogu valguse.** Kaks peegeldust tähendavad päris
 *    peeglil kaht korda ~5 % kadu; mudelis intensiivsust ei ole üldse.
 * 3. **Kiir on lõputult peenike joon.** Päris valgusvihul on laius, seega
 *    tuleb päris nurkpeeglist tagasi vihk, mitte joon.
 * 4. **Kõik toimub ühes tasandis.** Kahe peegli nurkpeegel saadab kiire
 *    tagasi ainult siis, kui valgus tuli peeglite ühisservaga – kahe peegli
 *    kokkusaamise joonega – risti. Ainult need kiire osad, mis on
 *    peeglipindadega risti, pannakse kahe peegeldusega vastassuunda; serva
 *    sihis liikuvat osa ei pööra kumbki peegel. Ruumis on täieliku
 *    tagasitulekuni vaja kolme peeglit – seepärast ongi helkur täpitud
 *    pisikeste kuubinurkadega (moodul `helkur`).
 * 5. **Peeglid on parajalt pikad:** piisavalt, et mõlemad langemispunktid
 *    peale mahuksid, aga mitte nii pikad, et nad sissetuleva kiire ette
 *    jääksid. Seda mudel EI kontrolli (peeglid on siin lõpmatud poolsirged),
 *    aga Simulation.tsx peab peegli 2 joonistama ainult natuke üle teise
 *    langemispunkti – muidu näeks joonisel välja, nagu tuleks kiir läbi
 *    peegli.
 *
 * Vigane sisend VISKAB vea, ta ei „paranda" ennast vaikselt – vaikne parandus
 * peidaks ära vea kutsuvas koodis (nt liuguri vale ülempiir) ja õpilane näeks
 * õiget arvu vale sisendi pealt.
 */

/**
 * Suund tasandil (ühikvektor). Sama kokkulepe, mis moodulis
 * `peegeldumisseadus`: y kasvab ÜLES (matemaatika, mitte SVG).
 */
export type Vector2 = { readonly x: number; readonly y: number };

/**
 * Kiire kogu teekond kahe peegli vahel – üks arvutuskett, kaks väljundikuju
 * (nurgad JA vektorid). Nurki vektoritest tagasi ei arvutata ega vektoreid
 * nurkadest eraldi ei tuletata: nii ei saa need kaks kuju teineteisest lahku
 * minna.
 */
export type CornerRayPath = {
  /** Esimene langemispunkt peeglil 1 (meetrites). */
  readonly firstHitM: Vector2;
  /** Teine langemispunkt peeglil 2 (meetrites). */
  readonly secondHitM: Vector2;
  /** Sissetuleva kiire liikumissuund (ühikvektor). */
  readonly incidentDirection: Vector2;
  /** Suund esimeselt peeglilt teisele (ühikvektor). */
  readonly middleDirection: Vector2;
  /** Väljuva kiire liikumissuund (ühikvektor). */
  readonly outgoingDirection: Vector2;
  /** α – langemisnurk peeglil 1 (= peegeldumisnurk seal). */
  readonly firstIncidenceDeg: number;
  /** β – langemisnurk peeglil 2 (= peegeldumisnurk seal). */
  readonly secondIncidenceDeg: number;
  /** δ – kogu pööre kahe peegelduse peale. */
  readonly deviationDeg: number;
};

/**
 * Täisnurk. Kolm rolli korraga ja kõik kolm tulevad samast faktist – ristsirge
 * on pinnaga risti: peeglite nurga ülempiir, ristsirge ja pinna nurkade summa
 * ning kahe peegelduse piiritingimuse liige (ψ₂ = 2θ − 90° − α).
 */
const RIGHT_ANGLE_DEG = 90;

/**
 * Väikseim peeglite nurk, mille juures kahe peegeldusega tee üldse OLEMAS on.
 *
 * See ei ole valitud arv: 2θ − 90° ≤ 0 tähendab, et ükski langemisnurk ei
 * mahu tingimusse α < 2θ − 90°. Kitsamas kiilus põrkab kiir peeglite vahel
 * kolm või enam korda ja siis EI ole pööre 2θ.
 */
const MIN_TWO_BOUNCE_MIRROR_ANGLE_DEG = 45;

function toRadians(angleDeg: number): number {
  return (angleDeg * Math.PI) / 180;
}

/**
 * Peeglite nurk: **0° ≤ θ ≤ 90°**.
 *
 * Null on lubatud ja tähendab paralleelseid peegleid (periskoop). Nürinurk ei
 * ole: siis tuleks pööre lugeda üle 180° ehk „teistpidi ringi" ja see on 8.
 * klassis rohkem kokkuleppe õpetamist kui füüsikat (spetsi „Piirid").
 */
function assertMirrorAngle(mirrorAngleDeg: number): void {
  if (
    !Number.isFinite(mirrorAngleDeg) ||
    mirrorAngleDeg < 0 ||
    mirrorAngleDeg > RIGHT_ANGLE_DEG
  ) {
    throw new RangeError(
      `Peeglite nurk peab olema vahemikus 0…${RIGHT_ANGLE_DEG}°, aga oli ${mirrorAngleDeg}`,
    );
  }
}

/**
 * Kahe peegeldusega teekonna eeldused: θ > 45° ja θ − 90° < α < 2θ − 90°.
 *
 * Mõlemad ots tulevad tingimusest 0 < ψ₂ < θ (vt faili päist), mitte
 * ilutundest:
 *
 * - **α ≥ 2θ − 90°** (ψ₂ ≤ 0) – väljuv kiir oleks suunatud tagasi peegli 1
 *   poole ehk tuleks kolmas peegeldus. Vastus „pööre = 2θ" oleks vale.
 * - **α ≤ θ − 90°** (ψ₂ ≥ θ) – peeglilt 1 peegeldunud kiir jääks peegliga 2
 *   paralleelseks ega tabaks teda kunagi. Ainus selline juht on θ = 90°,
 *   α = 0.
 *
 * α = 0 ise ei ole keelatud: kui θ < 90°, langeb kiir esimesele peeglile
 * risti, tuleb sama teed tagasi üles ja tabab teist peeglit ikka, sest peegel
 * 2 on kiilu kohal viltu. Piir peab tulema geomeetriast, mitte liuguri
 * sammust – simulatsioonis seda juhtu ei ole.
 */
function assertTwoBounceGeometry(
  mirrorAngleDeg: number,
  firstIncidenceDeg: number,
): void {
  assertMirrorAngle(mirrorAngleDeg);
  if (mirrorAngleDeg <= MIN_TWO_BOUNCE_MIRROR_ANGLE_DEG) {
    throw new RangeError(
      `Peeglite nurga ${mirrorAngleDeg}° juures ei ole kahe peegeldusega teed olemas: ` +
        `nurk peab olema suurem kui ${MIN_TWO_BOUNCE_MIRROR_ANGLE_DEG}°`,
    );
  }
  if (!Number.isFinite(firstIncidenceDeg) || firstIncidenceDeg < 0) {
    throw new RangeError(
      `Langemisnurk ei tohi olla negatiivne arv, aga oli ${firstIncidenceDeg}`,
    );
  }

  const maxExclusiveDeg = 2 * mirrorAngleDeg - RIGHT_ANGLE_DEG;
  if (firstIncidenceDeg >= maxExclusiveDeg) {
    throw new RangeError(
      `Langemisnurk ${firstIncidenceDeg}° on liiga suur: peeglite nurga ${mirrorAngleDeg}° ` +
        `juures peegelduks kiir kolmandat korda (piir ${maxExclusiveDeg}°)`,
    );
  }

  const minExclusiveDeg = mirrorAngleDeg - RIGHT_ANGLE_DEG;
  if (firstIncidenceDeg <= minExclusiveDeg) {
    throw new RangeError(
      `Langemisnurk ${firstIncidenceDeg}° on liiga väike: peeglilt 1 peegeldunud kiir ` +
        `jääks peegliga 2 paralleelseks (piir ${minExclusiveDeg}°)`,
    );
  }
}

/** Kaugus tipust, milleta langemispunkti ei ole olemas. */
function assertHitDistance(firstHitDistanceM: number): void {
  if (!Number.isFinite(firstHitDistanceM) || firstHitDistanceM <= 0) {
    throw new RangeError(
      `Esimese langemispunkti kaugus tipust peab olema positiivne arv, aga oli ${firstHitDistanceM}`,
    );
  }
}

/**
 * Ka lõplikest sisenditest võib tulla lõpmatus.
 *
 * `secondHitDistanceM(90, 89.999…, 1e308)` saab iga argumendi eraldi võttes
 * korraliku arvuna läbi, aga jagatis voolab üle `Infinity`-ks. Sama joon on
 * moodulite `kumerpeegel`, `noguspeegel`, `kumerpeegli-rakendused` ja
 * `noguspeegli-rakendused` mudelites (Codexi leiud, sammud 4.1ii ja 4.1mm).
 */
function assertFiniteResult(value: number, what: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${what} ei mahu arvu sisse: tuli ${value}`);
  }
}

/**
 * Kogu pööre kahe peegelduse peale (°): **δ = 2 · θ**.
 *
 * Mooduli keskne valem ja ainus, mida õpilane ise arvutab. Kaks tagajärge,
 * mis annavad moodulile mõtte:
 *
 * - **θ = 90° → δ = 180°:** väljuv kiir on sissetulevaga paralleelne ja
 *   vastassuunas, ükskõik kui viltu kiir tuli. Selle peal töötab helkur.
 * - **θ = 0° → δ = 0°:** paralleelsed peeglid ei muuda suunda üldse, ainult
 *   nihutavad valguse teed kõrvale. See on periskoop. Vastus käib AINULT
 *   suuna kohta: kõrvalenihet see funktsioon ei arvuta ega saagi arvutada,
 *   sest paralleelsetel peeglitel ei ole tippu ega ühtki kaugust, mille
 *   suhtes nihet mõõta – seepärast viskavad ülejäänud kolm funktsiooni θ = 0
 *   juures vea.
 *
 * Lubatud vahemik on siin LAIEM kui ülejäänud kolmel funktsioonil
 * (0° ≤ θ ≤ 90°, sh θ ≤ 45°) ja see on tahtlik: see funktsioon ei joonista
 * teekonda, vaid ütleb ainult, mitu kraadi teeb kaks peegeldust. Kas selline
 * tee ka olemas on, otsustavad ülejäänud kolm.
 */
export function deviationDeg(mirrorAngleDeg: number): number {
  assertMirrorAngle(mirrorAngleDeg);
  return 2 * mirrorAngleDeg;
}

/**
 * Langemisnurk teisel peeglil (°): **β = θ − α**.
 *
 * See on seos α + β = θ ümber tõstetuna – kogu mooduli teine tugisammas. Kui
 * esimene nurk kasvab, kahaneb teine täpselt sama palju, ja just seepärast on
 * summa 2α + 2β = 2θ igal juhul sama.
 */
export function secondIncidenceDeg(
  mirrorAngleDeg: number,
  firstIncidenceDeg: number,
): number {
  assertTwoBounceGeometry(mirrorAngleDeg, firstIncidenceDeg);
  return mirrorAngleDeg - firstIncidenceDeg;
}

/**
 * Teise langemispunkti kaugus tipust (m): **e = d · cos α / cos β**.
 *
 * Siinusteoreem kolmnurgas tipp–P₁–P₂, mille nurgad on θ, (90° − α) ja
 * (90° − β): e / sin(90° − α) = d / sin(90° − β) ehk e / cos α = d / cos β.
 *
 * cos β ei saa siin nulliks minna: piir α > θ − 90° tähendab täpselt
 * β = θ − α < 90°.
 */
export function secondHitDistanceM(
  mirrorAngleDeg: number,
  firstIncidenceDeg: number,
  firstHitDistanceM: number,
): number {
  assertTwoBounceGeometry(mirrorAngleDeg, firstIncidenceDeg);
  assertHitDistance(firstHitDistanceM);

  const secondAngleDeg = mirrorAngleDeg - firstIncidenceDeg;
  const distanceM =
    (firstHitDistanceM * Math.cos(toRadians(firstIncidenceDeg))) /
    Math.cos(toRadians(secondAngleDeg));

  assertFiniteResult(distanceM, "Teise langemispunkti kaugus tipust");
  return distanceM;
}

/**
 * Kiire kogu teekond kahe peegli vahel – punktid, suunad ja nurgad korraga.
 *
 * Suunad tulevad ühest ja samast keskmisest lõigust, mitte nurkadest eraldi:
 *
 * - `middleDirection` on lõik P₁ → P₂ normeerituna;
 * - `incidentDirection` on see peegeldatuna peegli 1 (x-telje) suhtes ehk
 *   **(mx, −my)** – valguse tee pööratavus tagurpidi. Kiir, mis peeglilt 1
 *   lahkub suunas m, pidi sinna tulema suunas, mis annab peegeldusel m.
 * - `outgoingDirection` on see peegeldatuna peegli 2 suhtes:
 *   **(cos2θ · mx + sin2θ · my, sin2θ · mx − cos2θ · my)**. See on
 *   peegeldusmaatriks sirge kohta, mis on x-teljega nurga θ all.
 */
export function traceCornerRay(
  mirrorAngleDeg: number,
  firstIncidenceDeg: number,
  firstHitDistanceM: number,
): CornerRayPath {
  const secondAngleDeg = secondIncidenceDeg(mirrorAngleDeg, firstIncidenceDeg);
  const secondDistanceM = secondHitDistanceM(
    mirrorAngleDeg,
    firstIncidenceDeg,
    firstHitDistanceM,
  );

  const mirrorRad = toRadians(mirrorAngleDeg);
  const firstHitM: Vector2 = { x: firstHitDistanceM, y: 0 };
  const secondHitM: Vector2 = {
    x: secondDistanceM * Math.cos(mirrorRad),
    y: secondDistanceM * Math.sin(mirrorRad),
  };

  const stepX = secondHitM.x - firstHitM.x;
  const stepY = secondHitM.y - firstHitM.y;
  const stepLength = Math.hypot(stepX, stepY);
  if (!Number.isFinite(stepLength) || stepLength <= 0) {
    throw new RangeError(
      `Langemispunktid langevad kokku või ei mahu arvu sisse: lõigu pikkus oli ${stepLength}`,
    );
  }
  const middleDirection: Vector2 = {
    x: stepX / stepLength,
    y: stepY / stepLength,
  };

  const doubleRad = toRadians(2 * mirrorAngleDeg);
  const cosDouble = Math.cos(doubleRad);
  const sinDouble = Math.sin(doubleRad);

  return {
    firstHitM,
    secondHitM,
    incidentDirection: { x: middleDirection.x, y: -middleDirection.y },
    middleDirection,
    outgoingDirection: {
      x: cosDouble * middleDirection.x + sinDouble * middleDirection.y,
      y: sinDouble * middleDirection.x - cosDouble * middleDirection.y,
    },
    firstIncidenceDeg,
    secondIncidenceDeg: secondAngleDeg,
    deviationDeg: deviationDeg(mirrorAngleDeg),
  };
}
