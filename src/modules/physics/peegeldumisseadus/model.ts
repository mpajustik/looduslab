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
