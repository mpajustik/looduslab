/**
 * Peeglikiri – füüsika
 * (sisu/MOODUL-peeglikiri.md „Füüsika (model.ts jaoks)").
 *
 * Ainult puhtad funktsioonid: sama sisend → alati sama väljund, ei Reacti, ei
 * DOM-i, ei juhuslikkust (CLAUDE.md reegel 1). Simulation.tsx ainult kuvab
 * seda, mida siin arvutatakse.
 *
 * **Mida see moodul arvutab:** ühte asja – mis juhtub sõnaga, kui ta seisab
 * peegli ees. Miks kujutis on peeglist sama kaugel ja päripidine, tuli
 * moodulist `tasapeegli-kujutis`; siin on selle TAGAJÄRG tähtede peal. Uut
 * peegeldumisseadust siin ei ole.
 *
 * ÜHIKUD: kaugused **meetrites (m)**, tähe koht sõnas **täisarvuline indeks**
 * (ühikuta). Ühikuteisenduse funktsioone ei ole – indeksil ei ole ühikut ja
 * meeter on ainus pikkusühik, milles moodul arve näitab.
 *
 * Tähised, mida kogu fail kasutab:
 *
 * - `objectDepthM` – **sügavus**: kaugus peegli PINNAST risti suunas. Sama
 *   telg, mille kohta moodul `tasapeegli-kujutis` ütles „kujutis on peeglist
 *   sama kaugel kui ese".
 * - `objectAlongM` – **asend piki peeglit**: koht peegli PINNA suunas ehk
 *   telg, mis on peegli pinnaga PARALLEELNE (nt vasak-parem VÕI üleval-all,
 *   olenevalt sellest, kuidas peegel ripub).
 * - `indexFromLeft` – **tähe koht sõnas** vasakult, alates nullist.
 * - `wordLength` – **sõna pikkus** ehk tähtede arv.
 *
 * **Kaks seost, millel moodul seisab:**
 *
 * 1. **Peegel peegeldab ainult ENDAGA RISTI suunas:** `imageDepthM` = −sügavus.
 *    Sama fakt, mis moodulis `tasapeegli-kujutis`, ainult märk on lisatud, et
 *    näidata SUUNDA: ese on peegli ees (positiivne), kujutis peegli taga
 *    (negatiivne). See on ainus telg, mida peegel puudutab.
 * 2. **Peegli PINNAGA paralleelne asend EI MUUTU:** `alongMirrorPositionM` on
 *    identsusfunktsioon. Just see on mooduli süda – peegel ei „pööra" midagi
 *    vasakult paremale ega üleval-alt-alla. Väärarusaam „peegel vahetab vasaku
 *    ja parema ära" tekib alles siis, kui me kujutame kujutist ette meie poole
 *    PÖÖRATUD inimesena; see mõtteline pööramine, mitte peegel, vahetab vasaku
 *    ja parema.
 *
 * Kolmas rida on kahe eelmise tagajärg tähtede peal:
 *
 * 3. **Tähtede JÄRJEKORD pöördub:** `mirrorLetterIndex` = wordLength − 1 −
 *    indexFromLeft. Kujuta sõna paberiribana, mis lebab LAUAL ja mille üks ots
 *    puutub peeglisse – siis on iga täht OMAETI sügavusel. Seos 1 pöörab iga
 *    tähe sügavuse eraldi (kaugel olnust saab peeglis lähedal ja vastupidi),
 *    mistõttu pöördub kogu tähtede järjekord, kuigi ükski üksik täht ei liigu
 *    vasakule ega paremale.
 *
 * **Miks siin EI ole funktsiooni „peegelda terve sõna korraga"** (string
 * sisse, string välja): see kombineeriks `mirrorLetterIndex` ja
 * `isVerticallySymmetricLetter` iga tähe kohta ning lisaks joonistaks tähe
 * kuju ümberpööratult – viimane on SVG kuvamisküsimus, mitte füüsika
 * (reegel 1). Mudel annab kaks puhast fakti (koht ja kuju), Simulation.tsx
 * paneb need kokku.
 *
 * **Miks siin EI ole funktsiooni „kas see sõna loeb peeglist õigesti"**
 * (nt `readsSameInMirror(word)`): see kombineeriks jällegi kaks eelmist
 * funktsiooni terve sõna peale ja teda ei kutsuks keegi peale checkeri, kes
 * võrdleb fikseeritud sõnu („TAAT" jah, „TAKSO" ei) – reegel 7, sama otsus mis
 * mooduli `lambivalik` „kas lamp sobib tuppa" funktsiooni puudumisel.
 *
 * **Idealiseeringud** (UI ega õpetajajuhend ei tohi neid päris füüsikana
 * esitada):
 *
 * 1. **Kiri on lapik ja seisab peegliga paralleelselt.** Päris kiirabiauto
 *    kapott on kaardus ja kaldu, mistõttu peegelkiri paistab autole lähedalt
 *    vaadatuna moondunud. Mudel eeldab tasast tähte tasasel peeglil.
 * 2. **Tähed on ühes lihtsas kirjatüübis.** Käsikiri, kaldkiri ja
 *    dekoratiivsed fondid muudavad seda, millised tähed sümmeetrilised
 *    paistavad (nt kaldkirjas ei ole „T" enam täpselt sümmeetriline).
 *    {@link SYMMETRIC_LETTERS} kehtib ainult lihtsas trükitähestikus.
 * 3. **Ainult suurtähed.** Väiketähtedel on omaette sümmeetriad (nt „o" ja „x"
 *    on sümmeetrilised, aga „b" muutub peeglis „d"-sarnaseks) ja need jäävad
 *    mudelist välja.
 * 4. **Peegel on täiuslik ja tasane.** Kumer või nõgus pind (nt läikiv auto
 *    uks) moonutaks kirja kuju – siin on peegel alati täpne tasapeegel.
 *
 * Vigane sisend VISKAB vea, ta ei „paranda" ennast vaikselt – vaikne parandus
 * peidaks ära vea kutsuvas koodis (nt liuguri vale ülempiir) ja õpilane näeks
 * õiget arvu vale sisendi pealt.
 */

/* --------------------------------------------------------------------------
 * Konstandid
 * ----------------------------------------------------------------------- */

/**
 * Suurim sügavus (m), mille kohta moodul veel vastab.
 *
 * Piir on sisuline, mitte tehniline: viie meetri kaugusel ei ole peeglikirja
 * lugemine enam peegli küsimus, vaid kaugusnägemise oma, ja mooduli sõnastus
 * („loe see sõna peeglist") ei kehti seal enam.
 */
export const MAX_OBJECT_DEPTH_M = 5;

/**
 * Pikim sõna, mille kohta moodul vastab (tähtede arv).
 *
 * Pikem sõna ei mahu simulatsiooni ekraanile tähthaaval välja – ja kui ta ei
 * mahu ekraanile, ei ole ka indeksi arvutamisel kohta, kus tulemust näidata.
 */
export const MAX_WORD_LENGTH = 20;

/**
 * Eesti tähestiku suurtähed (32 tähte) – ainus lubatud sisend funktsioonile
 * {@link isVerticallySymmetricLetter}.
 *
 * Järjekord on eesti tähestiku oma: võõrtähed Š ja Ž seisavad S-i ja Z-i
 * järel, X ja Y aga tähestiku lõpus. Järjekord ise mudelit ei huvita (kasutuses
 * on ta hulgana), aga ta on kirjas nii, nagu õpilane teda koolis on õppinud –
 * seda tähestikku näitab ka teooriajoonis.
 *
 * Tähed on **NFC-kujul** (Ä on üks märk, mitte A + täpid). Sisendi normaliseerib
 * {@link isVerticallySymmetricLetter} ise, nii et lahtikirjutatud kujul „Ä"
 * annab sama vastuse, mitte vea – see on tekstikodeeringu, mitte füüsika
 * küsimus.
 */
export const ESTONIAN_UPPERCASE_LETTERS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
  "P", "Q", "R", "S", "Š", "Z", "Ž", "T", "U", "V", "W", "Õ", "Ä", "Ö", "Ü",
  "X", "Y",
] as const;

/**
 * Peegli-sümmeetrilised tähed: need, mis näevad pärast VERTIKAALSET peegeldust
 * (vasak-parem vahetus TÄHE ENDA sees) välja täpselt samasugused.
 *
 * Loend on lühike ja seda ei tuletata arvutusega – tähe kuju ei ole valem, vaid
 * kirjatüübi omadus (idealiseering 2). Pane tähele, et **Š ja Ž EI ole** siin:
 * katus tähe kohal on ise viltune märk, mis peeglis suunda vahetab. Õ ei ole
 * samal põhjusel ilmne – aga tilde on Õ peal sümmeetriline ainult siis, kui ta
 * on joonistatud sümmeetrilisena, ja selle kirjatüübi puhul ta on. Kui
 * kirjatüüp kunagi vahetub, tuleb see loend üle vaadata; test valvab ainult
 * seda, et loend ja funktsioon omavahel kokku käiksid.
 */
export const SYMMETRIC_LETTERS = [
  "A", "H", "I", "M", "O", "T", "U", "V", "W", "X", "Y", "Ä", "Õ", "Ö", "Ü",
] as const;

/** Kiire otsing – hulgana, et funktsioon ei käiks massiivi iga kutse peal läbi. */
const ESTONIAN_UPPERCASE_SET: ReadonlySet<string> = new Set(
  ESTONIAN_UPPERCASE_LETTERS,
);
const SYMMETRIC_SET: ReadonlySet<string> = new Set(SYMMETRIC_LETTERS);

/**
 * Simulatsiooni liuguri piirid ja samm (sisu/MOODUL-peeglikiri.md „explore").
 *
 * Miks MUDELIS, mitte Simulation.tsx-is: piirid otsustavad, kas ülesande vastust
 * saab liuguriga üldse seada, ja kas kogu võre peal jääb mudel oma lubatud
 * vahemikku. Mõlemat kontrollib test – nii kukub vale piir siin, mitte tunnis.
 *
 * Ülempiir 2 m on väiksem kui {@link MAX_OBJECT_DEPTH_M}: laual tehtava katse
 * kaugused on kümnetes sentimeetrites ja liugur ei pea pakkuma kaugust, mida
 * ükski ülesanne ei küsi.
 */
export const SLIDERS = {
  /** Paberi kaugus peeglist (m) – algväärtus 0,5 m. */
  objectDepthM: { min: 0.1, max: 2, step: 0.1 },
} as const satisfies Record<string, { min: number; max: number; step: number }>;

/* --------------------------------------------------------------------------
 * Abifunktsioonid (ei ekspordita)
 * ----------------------------------------------------------------------- */

/**
 * Lõplik arv – NaN ega lõpmatus ei ole vaadeldav olukord.
 *
 * Sama joon on moodulite `valgusallikad`, `helkur` ja `nurkpeegel` mudelites
 * (Codexi leiud, sammud 4.1ii ja 4.1mm): mudel ei tohi tagastada arvu, mille
 * taga ta seista ei saa, ka siis mitte, kui vigane sisend tuli mitte liugurist,
 * vaid testist või mõnest kohast, mida praegu veel ei ole.
 */
function assertFiniteNumber(value: number, what: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${what} peab olema lõplik arv, aga oli ${value}`);
  }
}

/* --------------------------------------------------------------------------
 * Kaks telge: sügavus pöördub, paralleelne asend ei muutu
 * ----------------------------------------------------------------------- */

/**
 * Kujutise sügavus (m, märgiga) võrreldes peegli pinnaga: **−objectDepthM**.
 *
 * Miinusmärk ei ole „kujutis on väiksem" ega mingi kadu – ta näitab SUUNDA:
 * ese on peegli EES (positiivne sügavus), kujutis peegli TAGA (negatiivne).
 * Suurus ise on sama, mis moodulis `tasapeegli-kujutis`: kujutis on peegli taga
 * täpselt sama kaugel, kui ese on ees. Seda kooskõla valvab eraldi test, mis
 * võrdleb `Math.abs(imageDepthM(d))` selle mooduli funktsiooniga
 * `imageDistance(d)` – kaks moodulit ei tohi hoida sama fakti kahes eri arvus.
 *
 * See on **ainus telg, mida peegel puudutab** – vt {@link alongMirrorPositionM}.
 *
 * Lubatud `0 < objectDepthM ≤` {@link MAX_OBJECT_DEPTH_M}. Sügavus 0 tähendaks
 * kirja peegli SEES, negatiivne sügavus kirja peegli taga – kumbki ei ole
 * olukord, mille kohta see moodul midagi ütleb.
 */
export function imageDepthM(objectDepthM: number): number {
  assertFiniteNumber(objectDepthM, "Sügavus (kaugus peeglist)");
  if (objectDepthM <= 0 || objectDepthM > MAX_OBJECT_DEPTH_M) {
    throw new RangeError(
      `Sügavus peab olema 0…${MAX_OBJECT_DEPTH_M} m (null välja arvatud), aga oli ${objectDepthM} m – peegli sees ega üle viie meetri ei ole peeglikirja küsimust`,
    );
  }
  return -objectDepthM;
}

/**
 * Asend piki peeglit (m): **täpselt seesama arv, mis sisse tuli**.
 *
 * Jah, see on identsusfunktsioon – ja just see ongi mooduli kõige tähtsam
 * üksikväide: peegel EI liiguta midagi peegli pinnaga paralleelses suunas.
 * Vasak-parem ja üleval-all jäävad täpselt paigale, pöördub ainult sügavus
 * ({@link imageDepthM}).
 *
 * Ta ei ole dekoratiivne: Simulation.tsx kutsub teda, et joonistada kujutise
 * asend peegli taha, ja test lukustab, et väärtus KUNAGI ei muutu. Kui keegi
 * selle ühel päeval „ära parandab" (paneb miinusmärgi ette), hakkab mudel
 * õpetama täpselt seda väärarusaama, mille ümberlükkamiseks moodul olemas on –
 * ja siis kukub test, mitte tund.
 *
 * Lubatud on iga lõplik arv: erinevalt sügavusest ei ole sellel teljel ei
 * nulli ega negatiivse poolega midagi viga (peegli keskkoht on 0, üks pool
 * positiivne, teine negatiivne).
 */
export function alongMirrorPositionM(objectAlongM: number): number {
  assertFiniteNumber(objectAlongM, "Asend piki peeglit");
  return objectAlongM;
}

/* --------------------------------------------------------------------------
 * Tähed: koht sõnas ja tähe enda kuju
 * ----------------------------------------------------------------------- */

/**
 * Mitmes koht (vasakult, nullist alates) peab täht PABERIL olema, et ta
 * peeglis paistaks sõna kohal `indexFromLeft`:
 * **wordLength − 1 − indexFromLeft**.
 *
 * Sama tehe kehtib ka teistpidi (paberilt peeglisse) – funktsioon on
 * **involutsioon**: kaks korda rakendatuna annab algse indeksi tagasi. Just
 * seepärast piisab ühest funktsioonist kahe küsimuse jaoks ja seda valvab test
 * kõigi lubatud sõnapikkuste peal.
 *
 * Paaritu pikkusega sõna KESKMINE täht jääb paigale (`mirrorLetterIndex(2, 5)`
 * = 2) – seegi on eraldi testitud, sest ta on practice-ülesande alus.
 *
 * Lubatud: `wordLength` on täisarv 1…{@link MAX_WORD_LENGTH} ja
 * `0 ≤ indexFromLeft < wordLength`. Indeks, mis võrdub pikkusega, on juba
 * sõnast väljas – tühjal sõnal ei ole ühtki kohta, mille kohta küsida.
 */
export function mirrorLetterIndex(
  indexFromLeft: number,
  wordLength: number,
): number {
  if (!Number.isInteger(wordLength)) {
    throw new RangeError(
      `Sõna pikkus peab olema täisarv, aga oli ${wordLength}`,
    );
  }
  if (wordLength < 1 || wordLength > MAX_WORD_LENGTH) {
    throw new RangeError(
      `Sõna pikkus peab olema 1…${MAX_WORD_LENGTH} tähte, aga oli ${wordLength}`,
    );
  }
  if (!Number.isInteger(indexFromLeft)) {
    throw new RangeError(
      `Tähe koht peab olema täisarv, aga oli ${indexFromLeft}`,
    );
  }
  if (indexFromLeft < 0 || indexFromLeft >= wordLength) {
    throw new RangeError(
      `Tähe koht peab olema 0…${wordLength - 1} (sõnas on ${wordLength} tähte), aga oli ${indexFromLeft}`,
    );
  }
  return wordLength - 1 - indexFromLeft;
}

/**
 * Kas TÄHT ISE näeb pärast vertikaalset peegeldust välja täpselt samasugune.
 *
 * See on mooduli teine pool: sõna loetavus peeglis nõuab KAHTE asja korraga –
 * tähed peavad paberil olema vastupidises järjekorras ({@link mirrorLetterIndex})
 * JA iga täht ise peab olema peegeldatud kujuga. Sümmeetrilise tähe puhul (A,
 * H, I, M, O, T, U, V, W, X, Y, Ä, Õ, Ö, Ü) ei ole tähe kuju pärast midagi
 * teha – ta näeb mõlemat pidi ühesugune välja.
 *
 * Vastus tuleb otse loendist {@link SYMMETRIC_LETTERS}; test käib läbi kõik 32
 * eesti tähestiku suurtähte ja nõuab, et loend ja funktsioon ei saaks kunagi
 * lahku minna.
 *
 * Lubatud on **täpselt üks eesti tähestiku suurtäht**. Väiketäht, number, tühik,
 * kaks tähte korraga või tühi sõne viskavad vea (idealiseering 3): väiketähtedel
 * on omaette sümmeetriad ja mudel ei vasta küsimusele, mille peale ta sõnastus
 * enam ei kehti.
 */
export function isVerticallySymmetricLetter(letter: string): boolean {
  // NFC: lahtikirjutatud „Ä" (A + täpid) on sama täht, mitte viga.
  const normalized = letter.normalize("NFC");
  if (!ESTONIAN_UPPERCASE_SET.has(normalized)) {
    throw new RangeError(
      `Lubatud on täpselt üks eesti tähestiku SUURTÄHT (A…Y, k.a Š, Ž, Õ, Ä, Ö, Ü), aga oli „${letter}"`,
    );
  }
  return SYMMETRIC_SET.has(normalized);
}
