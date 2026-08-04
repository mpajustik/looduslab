/**
 * Valguse peegeldumine – füüsika (sisu/MOODUL-peegeldumisseadus.md „Füüsika").
 *
 * Ainult puhtad funktsioonid: sama sisend → alati sama väljund, ei Reacti,
 * ei DOM-i, ei juhuslikkust (CLAUDE.md reegel 1). Simulation.tsx (samm 1.8)
 * ainult kuvab seda, mida siin arvutatakse – ühtki nurka ega siinust ei tohi
 * komponendis uuesti välja arvutada.
 *
 * **Nurgad mõõdetakse ALATI pinna ristsirge (normaali) suhtes.** See on
 * mooduli peamine väärarusaamade allikas (`nurk-pinna-suhtes`), seepärast
 * ütleb iga funktsiooni nimi ja parameeter välja, kummast joonest ta mõõdab.
 *
 * Definitsioonipiirkond on 0°…90°. Väljaspool seda VISKAB funktsioon vea –
 * ta ei „paranda" sisendit vaikselt, sest vaikne parandus peidaks ära vea
 * kutsuvas koodis. 90° on lubatud matemaatiline piirjuht (kiir libiseb piki
 * pinda); simulatsiooni liugur lõpeb 85° juures, et õpilasele ei tekiks
 * füüsikaliselt kahtlast pilti.
 */

/**
 * Suund tasandil (ühikvektor). Kokkulepe, mida kogu fail kasutab:
 *
 * - peegel on x-teljel, ristsirge (normaal) osutab **+y** suunas
 * - y kasvab ÜLES (matemaatika, mitte SVG) – SVG y-telje pööramine on
 *   Simulation.tsx-i asi, mitte füüsika oma
 * - kiir tuleb vasakult ülalt ja lahkub paremale ülesse, seega x kasvab
 *   mõlemal kiirel
 */
export type Vector2 = { readonly x: number; readonly y: number };

/**
 * Täisnurk. Kaks rolli korraga ja mõlemad tulevad samast faktist – ristsirge
 * on pinnaga risti: nurga lubatud ülempiir JA pinna/ristsirge nurkade summa.
 */
const RIGHT_ANGLE_DEG = 90;

/** Vigane nurk on programmeerija viga (vt faili päis), seega erind. */
function assertAngleInRange(angleDeg: number, what: string): void {
  if (!Number.isFinite(angleDeg) || angleDeg < 0 || angleDeg > RIGHT_ANGLE_DEG) {
    throw new RangeError(
      `${what} peab olema vahemikus 0…${RIGHT_ANGLE_DEG}°, aga oli ${angleDeg}`,
    );
  }
}

function toRadians(angleDeg: number): number {
  return (angleDeg * Math.PI) / 180;
}

/**
 * Peegeldumisseadus: peegeldumisnurk = langemisnurk.
 *
 * Mõlemad nurgad on mõõdetud pinna ristsirge suhtes.
 */
export function reflectionAngle(incidenceAngleDeg: number): number {
  assertAngleInRange(incidenceAngleDeg, "Langemisnurk");
  return incidenceAngleDeg;
}

/**
 * Ristsirge suhtes mõõdetud nurk → pinna suhtes mõõdetud nurk.
 *
 * Ristsirge on pinnaga risti, seega nurgad täiendavad teineteist 90°-ni.
 */
export function angleFromSurface(angleFromNormalDeg: number): number {
  assertAngleInRange(angleFromNormalDeg, "Nurk ristsirge suhtes");
  return RIGHT_ANGLE_DEG - angleFromNormalDeg;
}

/**
 * Pinna suhtes mõõdetud nurk → ristsirge suhtes mõõdetud nurk.
 *
 * Arvutus on `angleFromSurface`-iga sama (90 − x on iseenda pöördfunktsioon),
 * aga NIMI on siin kogu mõte: harjutus 3 ja kordamiskaart 3 lähevad just
 * seda teed pidi („kiir moodustab pinnaga 35° → peegeldumisnurk 55°"). Ühe
 * nimega kutsuja peaks ise peas ümber pöörama – täpselt see peavigastus,
 * millest väärarusaam `nurk-pinna-suhtes` sünnib.
 */
export function angleFromNormal(angleFromSurfaceDeg: number): number {
  assertAngleInRange(angleFromSurfaceDeg, "Nurk pinna suhtes");
  return RIGHT_ANGLE_DEG - angleFromSurfaceDeg;
}

/**
 * Langeva kiire liikumissuund (ühikvektor, vt `Vector2` kokkulepet).
 *
 * 0° juures langeb kiir risti alla, 90° juures libiseb piki pinda.
 */
export function incidentDirection(incidenceAngleDeg: number): Vector2 {
  assertAngleInRange(incidenceAngleDeg, "Langemisnurk");
  const radians = toRadians(incidenceAngleDeg);
  return { x: Math.sin(radians), y: -Math.cos(radians) };
}

/**
 * Peegeldunud kiire liikumissuund (ühikvektor).
 *
 * Langemiskiir, ristsirge ja peegeldunud kiir on samas tasandis ning
 * ristsirge suhtes sümmeetrilised: x-komponent jääb samaks, y-komponent
 * pöördub. Nurk tuleb `reflectionAngle`-ist, et peegeldumisseadus oleks
 * koodis ühes kohas kirjas ja siit ei saaks ta kogemata lahku minna.
 */
export function reflectedDirection(incidenceAngleDeg: number): Vector2 {
  const radians = toRadians(reflectionAngle(incidenceAngleDeg));
  return { x: Math.sin(radians), y: Math.cos(radians) };
}

// ---------------------------------------------------------------------------
// Kaldu peegel – peegeldumine suvalise suunaga pinnalt
// ---------------------------------------------------------------------------

/**
 * Peegeldunud kiire suund SUVALISE kaldega peeglilt.
 *
 * Ülalpool olevad `incidentDirection` ja `reflectedDirection` eeldavad, et
 * peegel on x-teljel ja ristsirge osutab üles. See funktsioon seda ei eelda:
 * ristsirge antakse ette, seega saab peegel olla ka kaldu (periskoobi peeglid
 * on toru suhtes 45° all).
 *
 * Valem on peegeldumisseadus vektorkujul: `d − 2(d·n)n`. Ta ütleb sama, mida
 * `reflectionAngle`: kiir jääb ristsirgega samasse tasandisse ja lahkub
 * ristsirge suhtes sama nurga all, kui ta tuli. Test kontrollib, et need kaks
 * teed annavad sama vastuse.
 *
 * @param incoming kiire liikumissuund PINNA POOLE (ühikvektor)
 * @param normal pinna ristsirge suund (ühikvektor, kummale poole – ükskõik)
 */
export function reflectDirection(incoming: Vector2, normal: Vector2): Vector2 {
  assertUnitVector(incoming, "Langeva kiire suund");
  assertUnitVector(normal, "Pinna ristsirge suund");

  const projection = incoming.x * normal.x + incoming.y * normal.y;
  return {
    x: incoming.x - 2 * projection * normal.x,
    y: incoming.y - 2 * projection * normal.y,
  };
}

/**
 * Pinna ristsirge suund, kui pind ise on horisontaali suhtes kaldu.
 *
 * Kalde 0 juures osutab ristsirge üles (0, 1) – sama kokkulepe, mis mujal
 * selles failis. Positiivne kalle pöörab pinda (ja koos sellega ristsirget)
 * vastupäeva.
 */
export function surfaceNormal(surfaceTiltDeg: number): Vector2 {
  if (!Number.isFinite(surfaceTiltDeg)) {
    throw new RangeError(`Pinna kalle peab olema arv, aga oli ${surfaceTiltDeg}`);
  }
  const radians = toRadians(surfaceTiltDeg);
  return { x: -Math.sin(radians), y: Math.cos(radians) };
}

/**
 * Ühikvektori nõue on programmeerija asi, mitte õpilase oma (vt faili päis):
 * mitteühikvektor annaks vaikselt vale pikkusega tulemuse.
 */
function assertUnitVector(vector: Vector2, what: string): void {
  const length = Math.hypot(vector.x, vector.y);
  if (!Number.isFinite(length) || Math.abs(length - 1) > 1e-9) {
    throw new RangeError(`${what} peab olema ühikvektor, aga pikkus oli ${length}`);
  }
}

// ---------------------------------------------------------------------------
// Mattpind – hajus peegeldumine
// ---------------------------------------------------------------------------

/**
 * Mikrotahu suurim kalle pinna suhtes. Mattpind on lähedalt vaadates konarlik:
 * iga pisike koht on veidi eri suunas. 30° on VALIK, mitte mõõdetud suurus –
 * ta annab õpilasele nähtava laiali lahkuva kiirtekimbu, jäädes samas nii
 * väikeseks, et kiired ei kao pinna sisse.
 */
const MAX_FACET_TILT_DEG = 30;

/**
 * Suurim nurk ristsirge suhtes, mille all hajunud kiir veel pinnalt lahkub.
 *
 * Füüsikaline piir on 90° (kiir libiseb piki pinda); 85° juures on ta pinnast
 * veel eristatav. See EI ole sama otsus mis liuguri ülempiir Simulation.tsx-is
 * – siin ei saa mikrotahk kiirt saata pinna sisse, seega piir kuulub mudelisse.
 */
const MAX_DIFFUSE_ANGLE_DEG = 85;

/**
 * Kordumatu, aga KORRATAV juhuslikkus (mulberry32).
 *
 * Mattpinna konarused on ebakorrapärased – ühtlaselt jaotatud kiired näeksid
 * välja nagu korrapärane lehvik, mitte nagu hajumine. `Math.random` on
 * moodulilepinguga keelatud (model.ts peab andma sama sisendi peal sama
 * väljundi): sama seemnega tuleb alati sama pilt, seega ka test ja
 * ekraanipilt on korratavad.
 */
function pseudoRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hajunud kiirte suunad mattpinnalt (ühikvektorid, sama kokkulepe mis mujal).
 *
 * **Seadus ei muutu.** Iga mikrotahk peegeldab täpselt peegeldumisseaduse
 * järgi, aga tema oma ristsirge on kaldu: kui tahk on pinna suhtes kaldu nurga
 * α võrra, lahkub kiir ristsirge suhtes nurga all `langemisnurk + 2α`. Just
 * seepärast lahkuvad kiired eri suundades, kuigi ükski neist seadust ei riku –
 * see on mooduli väärarusaama `ainult-peegel-peegeldab` vastus.
 *
 * Kalded jäävad vahemikku, kus kiir ka päriselt pinnalt lahkub: suure
 * langemisnurga juures on kimp seepärast asümmeetriline (rohkem ettepoole).
 *
 * @param seed fikseeritav seeme – sama seeme annab alati sama kimbu
 */
export function diffuseDirections(
  incidenceAngleDeg: number,
  rayCount: number,
  seed: number,
): Vector2[] {
  const specularAngleDeg = reflectionAngle(incidenceAngleDeg);
  if (!Number.isInteger(rayCount) || rayCount < 1) {
    throw new RangeError(
      `Kiirte arv peab olema positiivne täisarv, aga oli ${rayCount}`,
    );
  }
  if (!Number.isInteger(seed)) {
    throw new RangeError(`Seeme peab olema täisarv, aga oli ${seed}`);
  }

  // Lubatud kalded: mikrotahk ei tohi saata kiirt pinna sisse.
  const minTiltDeg = Math.max(
    -MAX_FACET_TILT_DEG,
    (-MAX_DIFFUSE_ANGLE_DEG - specularAngleDeg) / 2,
  );
  const maxTiltDeg = Math.min(
    MAX_FACET_TILT_DEG,
    (MAX_DIFFUSE_ANGLE_DEG - specularAngleDeg) / 2,
  );

  const random = pseudoRandom(seed);
  const directions: Vector2[] = [];
  for (let index = 0; index < rayCount; index += 1) {
    const tiltDeg = minTiltDeg + random() * (maxTiltDeg - minTiltDeg);
    // Nurk on siin MÄRGIGA: negatiivne = ristsirgest teisel pool ehk tagasi
    // sinnapoole, kust kiir tuli. Peegelpinnal seda juhtuda ei saa.
    const radians = toRadians(specularAngleDeg + 2 * tiltDeg);
    directions.push({ x: Math.sin(radians), y: Math.cos(radians) });
  }
  return directions;
}
