/**
 * Vedeliku rõhk – füüsika (sisu/MOODUL-vedeliku-rohk.md „Füüsika").
 *
 * Ainult puhtad funktsioonid: sama sisend → alati sama väljund, ei Reacti,
 * ei DOM-i, ei juhuslikkust (CLAUDE.md reegel 1). Simulation.tsx (samm 1.16)
 * ainult kuvab seda, mida siin arvutatakse – ühtki korrutamist ega ühikute
 * teisendust ei tohi komponendis uuesti teha.
 *
 * **Kogu moodul seisab ühel valemil:** `p = ρ · g · h`. Sügavus `h` mõõdetakse
 * vedeliku PINNAST allapoole, meetrites.
 *
 * **Anuma kuju ei ole siin parameeter ja see on kogu mooduli mõte.** Rõhk
 * sõltub ainult vedeliku tihedusest ja sügavusest – mitte anuma laiusest,
 * kujust ega vedeliku kogusest (hüdrostaatiline paradoks). Väärarusaam
 * `kuju-mojutab-rohku` on täpselt see, et õpilane ootab siia neljandat
 * parameetrit. Kui keegi tahab kunagi anuma kuju mudelisse lisada, on see
 * märk, et füüsika on valesti mõistetud, mitte et mudel on puudulik.
 *
 * Vigane sisend VISKAB vea, ta ei „paranda" ennast vaikselt – vaikne parandus
 * peidaks ära vea kutsuvas koodis (nt liuguri vale alampiir) ja õpilane näeks
 * õiget arvu vale sisendi pealt.
 */

/**
 * Raskuskiirendus, mida moodul kasutab (m/s²).
 *
 * Õpik lubab 8. klassis nii 9,8 kui ka 10. Arvutame 9,8-ga, aga ülesannete
 * tolerants (5%, `activities.ts`) katab ka 10-ga arvutanud õpilase: 2 m
 * sügavusel vees on vahe 19,6 kPa vs 20 kPa ehk 2%. Seda väidet kontrollib
 * test – muidu jääks tolerantsi valik pelgalt lootuseks.
 */
export const GRAVITY_MS2 = 9.8;

/**
 * Simulatsiooni vedelike tihedused (kg/m³, sisu/MOODUL-vedeliku-rohk.md
 * samm 4 „explore").
 *
 * Ainult arvud – eestikeelsed nimed („soolane vesi") on kasutajaliidese asi
 * ja elavad Simulation.tsx-is (samm 1.16). Nii ei satu mudelisse teksti, mida
 * keegi hiljem tõlkima peaks, ja tihedused jäävad üheks tõe allikaks nii
 * simulatsioonile kui ka ülesannetele.
 */
export const LIQUID_DENSITIES = {
  vesi: 1000,
  "soolane-vesi": 1030,
  oli: 900,
  elavhobe: 13600,
} as const satisfies Record<string, number>;

/** Simulatsioonis valitav vedelik. */
export type LiquidId = keyof typeof LIQUID_DENSITIES;

/** Positiivne suurus: tihedus 0 või negatiivne ei ole vedelik. */
function assertPositive(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${what} peab olema positiivne arv, aga oli ${value}`);
  }
}

/**
 * Null on lubatud: vedeliku pinnal (h = 0) on vedelikusamba rõhk 0 ja see on
 * graafiku (samm 1.19) nullpunkt, mitte erijuht.
 */
function assertNonNegative(value: number, what: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(
      `${what} ei tohi olla negatiivne arv, aga oli ${value}`,
    );
  }
}

/**
 * Ka lõplikest sisenditest võib tulla lõpmatus.
 *
 * Sisendikontroll ei päästa siin: `pressure(1e308, 2)` saab iga argumendi
 * eraldi võttes korraliku arvuna läbi, aga korrutis voolab üle `Infinity`-ks.
 * Veel salakavalam on jagamine – kui NIMETAJA voolab üle, kukub jagatis
 * nulli ja vastuseks tuleks „0 m", arv arvu moodi, mida keegi kahtlustama ei
 * hakkaks. Mõlemad ülevaatajad osutasid sellele kohale (2026-08-04).
 *
 * Tänases rakenduses sellist sisendit ei teki (tihedus tuleb
 * `LIQUID_DENSITIES`-ist, sügavus liugurilt), aga mudel ei tohi tagastada
 * arvu, mille taga ta seista ei saa – see on sama joon, mis kogu ülejäänud
 * failil.
 */
function assertFiniteResult(value: number, what: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${what} ei mahu arvu sisse: tuli ${value}`);
  }
}

/**
 * Vedelikusamba rõhk sügavusel h (Pa).
 *
 * `p = ρ · g · h`. Tulemus on AINULT vedeliku enda rõhk – õhurõhku (~101 kPa)
 * siia ei liideta. Spetsifikatsioon ütleb õhurõhu kohta „maini, ära süvene",
 * seega jääb ta jutuks sammudes ja mudelisse teda meelega ei tooda: kogurõhk
 * teeks iga õpilase arvutuse 101 kPa võrra suuremaks kui see, mille ta ise
 * valemist saab.
 *
 * @param densityKgM3 vedeliku tihedus ρ (kg/m³)
 * @param depthM sügavus vedeliku PINNAST (m)
 * @param gravityMS2 raskuskiirendus g (m/s²) – vaikimisi 9,8
 */
export function pressure(
  densityKgM3: number,
  depthM: number,
  gravityMS2: number = GRAVITY_MS2,
): number {
  assertPositive(densityKgM3, "Tihedus");
  assertNonNegative(depthM, "Sügavus");
  assertPositive(gravityMS2, "Raskuskiirendus");
  const pressurePa = densityKgM3 * gravityMS2 * depthM;
  assertFiniteResult(pressurePa, "Rõhk");
  return pressurePa;
}

/**
 * Sügavus, kus vedeliku rõhk on täpselt p (m). `h = p / (ρ · g)`.
 *
 * Sama valem tagurpidi. Ta on mudelis kahel põhjusel: harjutuse 1 lahendatud
 * näidis läheb just seda teed (29,4 kPa → 3,0 m) ja simulatsiooni ülesanne 3
 * küsib sügavust, kus õlis on sama rõhk mis vees 0,9 m juures. Tuletagu need
 * kaks kohta vastuse mudelist, mitte kumbki omaette.
 */
export function depthFromPressure(
  pressurePa: number,
  densityKgM3: number,
  gravityMS2: number = GRAVITY_MS2,
): number {
  assertNonNegative(pressurePa, "Rõhk");
  assertPositive(densityKgM3, "Tihedus");
  assertPositive(gravityMS2, "Raskuskiirendus");
  // Nimetajat kontrollitakse ERALDI: kui tema üle voolab, on jagatis lõplik
  // null ja tulemuse kontroll laseks selle läbi.
  const denominator = densityKgM3 * gravityMS2;
  assertFiniteResult(denominator, "Tiheduse ja raskuskiirenduse korrutis");
  const depthM = pressurePa / denominator;
  assertFiniteResult(depthM, "Sügavus");
  return depthM;
}

/**
 * Paskalid → kilopaskalid.
 *
 * Ülesannete vastused on kilopaskalites (õpilase arv jääb nii kahekohaliseks),
 * arvutus käib paskalites. Negatiivne sisend on siin lubatud, sest see on
 * puhas ühikuteisendus – ta võib teisendada ka kahe rõhu VAHET, mis on
 * vabalt negatiivne.
 *
 * Tulemuse kontroll on siin sama, mis mujal failis, kuigi JAGAMINE üle voolata
 * ei saa: lõplikust arvust tuleb jagades alati lõplik arv. Ühikuteisendus on
 * viimane koht enne ekraanile jõudmist ja kõik kolm seda mustrit kasutavat
 * moodulit (`kumerpeegel`, `noguspeegel` ja see fail) valvavad oma teisendusi
 * ühtemoodi – nii ei pea keegi funktsiooni kohal mõtlema, KUMMAS suunas see
 * teisendus käib (Codexi leid, sammud 4.1mm ja 4.1qq).
 */
export function toKilopascals(pressurePa: number): number {
  if (!Number.isFinite(pressurePa)) {
    throw new RangeError(`Rõhk peab olema arv, aga oli ${pressurePa}`);
  }
  const pressureKPa = pressurePa / 1000;
  assertFiniteResult(pressureKPa, "Rõhk kilopaskalites");
  return pressureKPa;
}

/**
 * Sentimeetrid → meetrid.
 *
 * Valem nõuab sügavust meetrites; ülesanne 4 annab akvaariumi sügavuse
 * sentimeetrites just selleks, et väärarusaam `cm-m-teisendus` (40 cm jäetakse
 * teisendamata ja vastuseks tuleb 392 kPa) tuleks nähtavale.
 */
export function metresFromCentimetres(lengthCm: number): number {
  if (!Number.isFinite(lengthCm)) {
    throw new RangeError(`Pikkus peab olema arv, aga oli ${lengthCm}`);
  }
  const lengthM = lengthCm / 100;
  assertFiniteResult(lengthM, "Pikkus meetrites");
  return lengthM;
}
