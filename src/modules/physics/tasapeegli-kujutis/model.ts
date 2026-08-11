/**
 * Tasapeegli kujutis – füüsika
 * (sisu/MOODUL-tasapeegli-kujutis.md „Füüsika").
 *
 * Ainult puhtad funktsioonid: sama sisend → alati sama väljund, ei Reacti,
 * ei DOM-i, ei juhuslikkust (CLAUDE.md reegel 1). Simulation.tsx ainult kuvab
 * seda, mida siin arvutatakse.
 *
 * **Kogu moodul on kahe juba õpitud lause tagajärg:** valgus levib
 * sirgjooneliselt ja peegeldumisnurk võrdub langemisnurgaga (moodul
 * `peegeldumisseadus`). Seadust ennast siin uuesti ei arvutata – siin on
 * ainult tema tagajärjed tasapeeglil:
 *
 * 1. kujutis on peegli taga sama kaugel, kui ese on ees (`imageDistance`)
 * 2. kujutis on esemega ühesuurune (`imageHeight`)
 * 3. täies pikkuses nägemiseks piisab poolest pikkusest peeglist
 *    (`minMirrorHeight`) – ja kaugus ei muuda seda üldse
 *
 * Kolmas rida on mooduli süda ja ka põhjus, miks siin ühtki nurka ei esine.
 * Tuletus: silma jõuab pealae kiir peegli punktist kõrgusel `(e + H)/2` ja
 * jalgade kiir punktist kõrgusel `e/2`. Nende vahe on `H/2` ja kaugus taandub
 * välja, sest MÕLEMAD kiired kalduvad kaugenedes täpselt sama palju. Kui siia
 * ilmub kunagi funktsioon, mis tagastab kraade, on see märk, et keegi lahendab
 * ülesannet, mida see moodul ei küsi (sama otsus mis moodulites
 * `valgusallikad`, `valguse-sirgjooneline-levimine` ja `vari-ja-poolvari`,
 * samm 4.1d).
 *
 * ÜHIKUD: KÕIK pikkused ja kaugused meetrites. Teisendust selles failis ei
 * ole, sest meeter on ainus ühik, milles moodul arve näitab (inimese pikkus,
 * peegli kõrgus ja kaugus peeglist on kõik meetri kandis).
 *
 * Tähised, mida kogu fail kasutab:
 *
 * - `d` (`objectDistanceM`) – ese/inimene → peegel
 * - `H` (`objectHeightM`, `personHeightM`) – eseme/inimese kõrgus
 * - `e` (`eyeHeightM`) – silmade kõrgus põrandast, `0 < e ≤ H`
 * - `M` (`mirrorHeightM`) – peegli enda kõrgus
 *
 * **Kõiki kõrgusi mõõdetakse PÕRANDAST.** Nii inimese oma, silmade oma,
 * peegli servade oma kui ka nähtava osa oma – muidu ei saaks neid omavahel
 * võrrelda ja Simulation.tsx peaks ise nulljoont valima.
 *
 * Vigane sisend VISKAB vea, ta ei „paranda" ennast vaikselt – vaikne parandus
 * peidaks ära vea kutsuvas koodis (nt liuguri vale alampiir) ja õpilane näeks
 * õiget arvu vale sisendi pealt. AINSAD erandid on kaks piiramist –
 * `visibleBodyHeight` piirab tulemuse inimese pikkusega ja
 * `mirrorBottomEdgeHeight` põrandaga – ning mõlemad on õpilase huvides,
 * mitte mugavusest. Vt nende juurest.
 */

/**
 * Kui palju on silmad pealaest allpool (m).
 *
 * Simulatsioonis EI ole silmade kõrguse jaoks eraldi liugurit: `e = H − 0,1`.
 * Nii jääb liugureid kaks (moodulileping: alguses maksimaalselt kaks
 * muudetavat suurust) ja mooduli põhitulemus `H/2` ei sõltu sellest arvust
 * niikuinii – silmade kõrgus mõjutab ainult seda, kus peegel SEINAL ripub.
 *
 * Miks mudelis, mitte Simulation.tsx-is: sellest arvust tuleb
 * `mirrorTopEdgeHeight` ehk peegli asukoht seinal, ja see on füüsika
 * (reegel 1). Komponenti kirjutatuna oleks ta koht, kus keegi ühel päeval
 * paneb 0,15 ja joonis läheb vaikselt mudelist lahku.
 */
export const EYE_BELOW_TOP_M = 0.1;

/**
 * Simulatsiooni liugurite piirid ja sammud
 * (sisu/MOODUL-tasapeegli-kujutis.md „explore").
 *
 * Miks MUDELIS, mitte Simulation.tsx-is: piirid otsustavad, kas ülesande
 * vastust saab liuguriga üldse SEADA. Testis on iga ülesande seis eraldi
 * kontrollitud – nii kukub vale piir siin, mitte tunnis.
 *
 * `personHeightM` alampiir 1,2 m hoiab ühtlasi püsti eelduse `0 < e ≤ H`:
 * `EYE_BELOW_TOP_M` on 0,1 m, seega jääb silmade kõrgus alati positiivseks.
 * Kui neid vahemikke kunagi muudetakse, tuleb see üle kontrollida – testis on
 * ta kirjas eraldi kontrollina, mitte kommentaarina.
 */
export const SLIDERS = {
  /** Inimene → peegel (m) – suurus `d`. */
  objectDistanceM: { min: 0.5, max: 3, step: 0.1 },
  /** Peegli enda kõrgus (m) – suurus `M`. */
  mirrorHeightM: { min: 0.1, max: 1, step: 0.05 },
  /** Inimese pikkus (m) – suurus `H`; avaneb alles pärast ülesannet 4. */
  personHeightM: { min: 1.2, max: 1.9, step: 0.05 },
} as const satisfies Record<string, { min: number; max: number; step: number }>;

/**
 * Positiivne pikkus: 0 ega negatiivne ei ole vaadeldav olukord. Kauguse 0
 * juures oleks inimene peegli sees, kõrguse 0 juures ei oleks inimest ega
 * peeglit, mille kohta küsida.
 */
function assertPositive(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${what} peab olema positiivne arv, aga oli ${value}`);
  }
}

/**
 * Silmad on kehal olemas ja pealaest mitte kõrgemal: `0 < e ≤ H`.
 *
 * `e > H` ei ole „veidi vale sisend", vaid võimatu inimene – ja just tema
 * annaks `mirrorTopEdgeHeight`-ist peegli ülaserva pealaest kõrgemale, mis
 * lõhuks kogu joonise loogika. `e = H` on lubatud piirjuht (silmad täpselt
 * pealael): siis on peegli ülaserv `H` ja nähtav osa endiselt `2M`.
 */
function assertEyeHeight(eyeHeightM: number, personHeightM: number): void {
  assertPositive(eyeHeightM, "Silmade kõrgus");
  assertPositive(personHeightM, "Inimese pikkus");
  if (eyeHeightM > personHeightM) {
    throw new RangeError(
      `Silmad ei saa olla pealaest kõrgemal: silmad ${eyeHeightM} m, pikkus ${personHeightM} m`,
    );
  }
}

/**
 * Ka lõplikest sisenditest võib tulla lõpmatus (sama mure mis teiste moodulite
 * mudelites): väga suur pikkus voolab liitmisel arvupiirist üle ja tulemuseks
 * jääks `Infinity`, kuigi sisend läbis kõik kontrollid. Mudel ei tohi
 * tagastada arvu, mille taga ta seista ei saa (Codexi leid 2026-08-11).
 *
 * Liugurid sellist seisu ei luba – valvur on siin sellepärast, et mudel on
 * puhas funktsioonide kogu ja teda kutsuvad ka testid, kordamiskaardid ning
 * ühel päeval mõni koht, mida praegu ei ole.
 */
function assertFiniteResult(value: number, what: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${what} ei mahu arvu sisse: tuli ${value}`);
  }
}

/**
 * Silmade kõrgus põrandast (m) inimese pikkusest.
 *
 * Simulatsioon kutsub seda iga kord, kui pikkuse liugur liigub – nii ei teki
 * komponenti oma `H − 0,1` arvutust. Vahemikus, mille liugur lubab
 * (1,2…1,9 m), jääb tulemus alati vahemikku `0 < e < H`.
 */
export function eyeHeight(personHeightM: number): number {
  assertPositive(personHeightM, "Inimese pikkus");
  const eyeHeightM = personHeightM - EYE_BELOW_TOP_M;
  if (eyeHeightM <= 0) {
    throw new RangeError(
      `Inimene peab olema pikem kui ${EYE_BELOW_TOP_M} m, aga oli ${personHeightM} m`,
    );
  }
  return eyeHeightM;
}

/**
 * Kujutise kaugus peegli TAGA (m): `d`.
 *
 * Jah, see on samasusfunktsioon. Ta on olemas selleks, et seadus oleks koodis
 * kirjas ja testiga valvatud – ja et Simulation.tsx ei „teaks" füüsikat ise.
 * Kui kunagi lisandub kumerpeegel, on see ainus koht, mida muuta.
 */
export function imageDistance(objectDistanceM: number): number {
  assertPositive(objectDistanceM, "Kaugus peeglist");
  return objectDistanceM;
}

/**
 * Vahemaa esemest kujutiseni (m): `2 · d`.
 *
 * Just see arv seletab, miks peeglis paistab kujutis kaugem, kui õpilane
 * ootab: sammu lähemale astudes väheneb teie vahe KAKS sammu, sest ka
 * kujutis astub sammu lähemale.
 */
export function objectImageSeparation(objectDistanceM: number): number {
  const separationM = objectDistanceM + imageDistance(objectDistanceM);
  assertFiniteResult(separationM, "Vahemaa kujutiseni");
  return separationM;
}

/**
 * Kujutise kõrgus (m): täpselt eseme oma.
 *
 * Samuti valvefunktsioon: väärarusaam `kujutis-vaheneb-kaugusega` („kaugemal
 * läheb kujutis väiksemaks") peab olema vale ka koodis, mitte ainult
 * teooriatekstis. Pane tähele, et kaugust see funktsioon ei võtagi – see ongi
 * väide.
 */
export function imageHeight(objectHeightM: number): number {
  assertPositive(objectHeightM, "Eseme kõrgus");
  return objectHeightM;
}

/**
 * Vähim peegel (m), milles näed end täies pikkuses: `H / 2`.
 *
 * **Ei sõltu kaugusest** – ja see ongi mooduli kõige üllatavam tulemus
 * (väärarusaam `taispikk-peegel`). Kaugus ei esine valemis, seega ei saa teda
 * ka kogemata sisse tuua.
 *
 * Tingimus, mida valem ise ei ütle: peegel peab rippuma õigel kõrgusel
 * (ülaserv `mirrorTopEdgeHeight` järgi). Simulatsioon hoiab peeglit alati
 * seal, päris elus mitte – õpetajajuhendis on selle kohta eraldi hoiatus.
 */
export function minMirrorHeight(personHeightM: number): number {
  assertPositive(personHeightM, "Inimese pikkus");
  return personHeightM / 2;
}

/**
 * Kui suur osa inimesest peeglist paistab (m): `min(2 · M, H)`.
 *
 * Peeglist paistab alati kaks korda rohkem, kui peegel ise kõrge on – iga
 * sentimeeter peeglit „katab" kaks sentimeetrit inimest, sest kiir käib seda
 * teed kaks korda. Kaugus valemis ei esine: **see on mooduli põhitõde** ja
 * seda valvab eraldi test.
 *
 * **Piiramine `H`-ga ei ole vaikne parandus, vaid füüsika:** kahemeetrine
 * peegel ei näita „3,2 m inimest" – inimest ei ole rohkem kui `H`. Ülejääv
 * peegliosa näitab lakke ja põrandale, mitte inimesele.
 *
 * @param mirrorHeightM peegli enda kõrgus `M` (m)
 * @param personHeightM inimese pikkus `H` (m)
 */
export function visibleBodyHeight(
  mirrorHeightM: number,
  personHeightM: number,
): number {
  assertPositive(mirrorHeightM, "Peegli kõrgus");
  assertPositive(personHeightM, "Inimese pikkus");
  return Math.min(2 * mirrorHeightM, personHeightM);
}

/**
 * Millisest kõrgusest (m, põrandast) nähtav osa algab: `max(0, H − 2 · M)`.
 *
 * 0 tähendab, et ka jalad paistavad. Simulation.tsx joonistab selle järgi
 * mõõdulindile piirjoone „paistab / ei paista".
 *
 * Nähtav osa algab alati ÜLEVALT – pealagi on alati näha, sest simulatsioonis
 * ripub peegel alati õigel kõrgusel. Seepärast piisab ühest arvust: nähtav osa
 * on `visibleBottomHeight` … `H`.
 *
 * Tulemus arvutatakse `visibleBodyHeight`-ist lahutamise teel, mitte
 * valemist `max(0, H − 2M)`. Kaks põhjust: nii ei saa kaks funktsiooni
 * kunagi eri asja väita (seos `visibleBottomHeight + visibleBodyHeight = H`
 * kehtib siis definitsiooni järgi ja on lisaks testiga valvatud) ning
 * nulliga piiramine tuleb kaasa juba `visibleBodyHeight` piirangust – eraldi
 * `max(0, …)` oleks sama otsus teist korda kirja pandud.
 */
export function visibleBottomHeight(
  mirrorHeightM: number,
  personHeightM: number,
): number {
  return personHeightM - visibleBodyHeight(mirrorHeightM, personHeightM);
}

/**
 * Peegli ÜLASERVA kõrgus põrandast (m), kui peegel ripub õigel kohal:
 * `(e + H) / 2` ehk täpselt pealae ja silmade KESKEL.
 *
 * Siit tuleb tingimus, mille peal seisab kogu „pool pikkusest piisab" reegel:
 * pealae kiir tabab peeglit just selles punktis. Kui peegel ripub madalamal,
 * ei paista pealagi ka siis, kui peegel ise on küllalt suur.
 *
 * Simulatsioon hoiab peeglit alati siin – seina peal liigutamise liugurit ei
 * ole. Nii jääb muutuma ainult see, mida parajasti uuritakse, ja peegli VALE
 * riputamine ei saa katset segada.
 */
export function mirrorTopEdgeHeight(
  eyeHeightM: number,
  personHeightM: number,
): number {
  assertEyeHeight(eyeHeightM, personHeightM);
  const topM = (eyeHeightM + personHeightM) / 2;
  assertFiniteResult(topM, "Peegli ülaserva kõrgus");
  return topM;
}

/**
 * Peegli ALASERVA kõrgus põrandast (m): ülaserv miinus peegli kõrgus,
 * nulliga piiratud.
 *
 * Kui `M = H/2` ehk peegel on täpselt vähim vajalik, tuleb siit täpselt `e/2`
 * – see on jalgade kiire tabamiskoht ja seda kontrollib eraldi test.
 *
 * **Nulliga piiramine on siin ainus vaikne parandus ja ta on lubatud:**
 * põrandast allapoole peeglit ei riputata. Seis tekib ainult siis, kui peegel
 * on inimese jaoks juba niigi üleliia suur (`M > (e + H)/2`), ja siis on ka
 * `visibleBottomHeight` juba 0 – rohkem inimest ta nagunii ei näita. Ilma
 * piiramiseta joonistaks Simulation.tsx peegli seinast läbi põranda.
 */
export function mirrorBottomEdgeHeight(
  eyeHeightM: number,
  personHeightM: number,
  mirrorHeightM: number,
): number {
  assertPositive(mirrorHeightM, "Peegli kõrgus");
  return Math.max(0, mirrorTopEdgeHeight(eyeHeightM, personHeightM) - mirrorHeightM);
}
