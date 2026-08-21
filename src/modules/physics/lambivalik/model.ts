/**
 * Lambivalik – füüsika
 * (sisu/MOODUL-lambivalik.md „Füüsika (model.ts jaoks)").
 *
 * Ainult puhtad funktsioonid: sama sisend → alati sama väljund, ei Reacti, ei
 * DOM-i, ei juhuslikkust (CLAUDE.md reegel 1). Simulation.tsx ainult kuvab
 * seda, mida siin arvutatakse – ühtki jagatist ega korrutist ei tohi
 * komponendis uuesti välja arvutada.
 *
 * **Mida see moodul arvutab:** ühte asja – kui palju valgust lamp annab ja mis
 * see maksma läheb, mitte rahas, vaid vattides. Miks üks allikas on soojuslik
 * ja teine külm, tuli moodulist `valgusallikad`; siin on selle TAGAJÄRG
 * arvudes. Uut seadust siin ei ole.
 *
 * ÜHIKUD: valgusvoog **luumenites (lm)**, võimsus **vattides (W)**,
 * valgusviljakus **lm/W**, värvustemperatuur **kelvinites (K)**, pindala
 * **ruutmeetrites (m²)**.
 *
 * **Ühikuteisenduse funktsioone selles moodulis EI ole** ja see on sisuline
 * otsus, mitte unustus: kõik suurused on juba täpselt nendes ühikutes, milles
 * nad lambipakendil seisavad, ja just see ongi mooduli mõte – õpilane peab
 * pakendit lugema oskama.
 *
 * Tähised, mida kogu fail kasutab:
 *
 * - `Φ` (`lumensLm`) – **valgusvoog**: kogu valgus, mida lamp igas suunas kokku
 *   välja saadab. Ainus arv pakendil, mis heleduse kohta midagi ütleb.
 * - `P` (`powerW`) – **elektrivõimsus**, mida lamp tarbib. MITTE heledus. Kogu
 *   mooduli peamine väärarusaam ripub selle vahe küljes.
 * - `η` (`efficacyLmPerW`) – **valgusviljakus** Φ / P: mitu luumenit saab lamp
 *   ühest vatist.
 * - `T` (`kelvin`) – **värvustemperatuur**: selle hõõguva keha temperatuur, mis
 *   annaks sama värvi valgust. **Ei ole lambi enda temperatuur** – 6500 K LED
 *   on käega katsudes leige. „Soe" ja „külm" käivad tunde, mitte temperatuuri
 *   kohta, ja on arvuga vastupidi: soe = VÄIKE arv, külm = SUUR arv.
 * - `lumensPerM2` – **valgustustihedus**: soovitatav valgusvoog ruumi ühe
 *   ruutmeetri kohta. Ametlik nimi luks, aga ainekava seda ühikut ei nõua.
 *
 * **Neli seost, millel moodul seisab:**
 *
 * 1. **Valguse hulka mõõdab luumen, mitte vatt:** η = Φ / P. Suhe on
 *    lambitüübi omadus ja erineb kaheksa korda (hõõglamp 12 lm/W, LED
 *    100 lm/W) – seepärast ei tähenda „60 W" ega „8 W" iseenesest midagi.
 * 2. **Sama valgus, teine lamp:** P = Φ / η. Sama jagamistehe teistpidi.
 * 3. **Miks vahe nii suur on:** hõõglamp on soojuslik allikas (valgus tekib
 *    hõõgumisest ja enamik energiast lahkub soojusena), LED on külm allikas.
 *    See lause on moodulist `valgusallikad` ja siin ta ainult SELETAB arvu
 *    12 vs 100 – mudel seda ei arvuta (soojuse osakaal nõuaks kiirgusspektrit).
 * 4. **Kui palju valgust ruumi vaja on:** Φ = S · (lm/m²).
 *
 * **Miks siin EI ole funktsiooni „kas lamp sobib sellesse tuppa"** ega
 * konstanti „soovitatav valgustustihedus": esimene on kaks võrdlusmärki, mis
 * kuuluvad Simulation.tsx kuvamisse, ja soovitus ise („magamistuppa soe
 * valgus") on pedagoogiline kokkulepe, mitte füüsika. Neli tiheduse arvu
 * (100 / 150 / 300 / 500) on stsenaariumi arvud, mitte looduskonstandid – nad
 * tulevad activities.ts-ist ja Simulation.tsx-ist argumendina sisse. Mudelis
 * paistaks kokkulepe loodusseadusena ja teda ei saaks vaidlustada. Sama otsus
 * ja sama põhjendus nagu juhi silmade kaugusel moodulis `helkur`.
 *
 * **Punkt- ja laiendatud allika piir (suhe 60) EI ole siin** – see arv elab
 * moodulis `valgusallikad` ja kaks moodulit ei tohi hoida sama arvu kahes
 * kohas (CLAUDE.md reeglid 11 ja 13). Siin jääb see vahe sõnaliseks.
 *
 * **Idealiseeringud** (UI ega õpetajajuhend ei tohi neid päris füüsikana
 * esitada):
 *
 * 1. **Kogu lambi valgus jõuab ruumi.** Päris valgusti varjund, tolm ja suund
 *    söövad osa ära (kasutustegur on tihti 0,5…0,8) ja tume sisustus neelab
 *    valgust. Mudel korrutab pindala ja tiheduse – seepärast on ekraanil
 *    „ligikaudne soovitus", mitte „vajalik".
 * 2. **Valgus jaotub ruumis ühtlaselt.** Päris ruumis on lambi all heledam ja
 *    nurgas hämaram; just seepärast kasutatakse mitut valgustit. Mudel ei tunne
 *    lambi asukohta.
 * 3. **Lambi valgusvoog on püsiv.** Päris lamp tuhmub aastatega (LED umbes
 *    kolmandiku võrra oma eluea jooksul) ja säästulamp jõuab täisheleduseni
 *    alles minuti pärast. Mudelis on Φ üks arv.
 * 4. **Värvustemperatuur kirjeldab valgust ühe arvuga.** Kaks sama
 *    värvustemperatuuriga lampi võivad värve päris erinevalt näidata
 *    (värvusesitusindeks CRI). Mudel liigitab ainult sooja / neutraalse /
 *    külma järgi.
 * 5. **Lambitüübi valgusviljakus on üks arv.** Päris LED-ide viljakus on
 *    vahemikus 60…160 lm/W ja sõltub värvustemperatuurist, hinnast ja
 *    vanusest. Tabeli 100 lm/W on tänase kodulambi suurusjärk ja tabeli päises
 *    on „umbes".
 * 6. **Valgustustiheduse soovitused on ümarad kokkulepped.** Päris
 *    valgustusnormid annavad vahemikud ja sõltuvad vanusest (vanem silm vajab
 *    rohkem valgust) – neli arvu selles moodulis on õpetatav lihtsustus, mitte
 *    norm.
 *
 * Vigane sisend VISKAB vea, ta ei „paranda" ennast vaikselt – vaikne parandus
 * peidaks ära vea kutsuvas koodis (nt liuguri vale ülempiir) ja õpilane näeks
 * õiget arvu vale sisendi pealt.
 */

/* --------------------------------------------------------------------------
 * Konstandid
 * ----------------------------------------------------------------------- */

/**
 * Valgusviljakuse **füüsikaline ülempiir** (lm/W).
 *
 * See ei ole ilutunne ega ümardus: 683 lm/W saaks ainult allikas, mis muudab
 * KOGU sissepandud energia kõige tõhusamaks rohekaskollaseks valguseks (see
 * ongi luumeni definitsiooni arv). Valge valguse praktiline lagi on umbes
 * 350 lm/W. Mudel, mis vastaks rahulikult küsimusele „1000 lm/W", õpetaks
 * valet asja – seepärast valvavad seda piiri MÕLEMAD viljakusega tegelevad
 * funktsioonid: kaks funktsiooni ei tohi lubada eri füüsikat.
 */
export const MAX_EFFICACY_LM_PER_W = 683;

/** Suurim värvustemperatuur, mis loeb veel **soojaks** valguseks (K, välistav). */
export const WARM_MAX_K = 3300;

/** Suurim värvustemperatuur, mis loeb veel **neutraalseks** (K, kaasav). */
export const NEUTRAL_MAX_K = 5300;

/**
 * Värvustemperatuuri lubatud vahemik (K).
 *
 * Piir on sisuline: küünlaleek on ~1900 K ja kõige sinakam müügilamp ~6500 K.
 * 500 K ega 20 000 K ei ole lambivaliku küsimus ja mudel ei vasta küsimusele,
 * mille peale tema sõnastus enam ei kehti.
 */
export const KELVIN_MIN = 1500;
export const KELVIN_MAX = 10_000;

/**
 * Ruumi pindala lubatud vahemik (m²) – üks tuba, mitte kapp ega ladu.
 *
 * Väljaspool seda ei ole tegemist enam kodutoa valgustamisega ja
 * taskuarvutusreegel „pindala korda tihedus" ei kehti.
 */
export const AREA_MIN_M2 = 1;
export const AREA_MAX_M2 = 100;

/** Valgustustiheduse lubatud vahemik (lm/m²): hämar koridor … peenmontaaži töölaud. */
export const DENSITY_MIN_LM_PER_M2 = 50;
export const DENSITY_MAX_LM_PER_M2 = 1000;

/**
 * Simulatsiooni liugurite piirid ja sammud (sisu/MOODUL-lambivalik.md
 * „explore").
 *
 * Miks MUDELIS, mitte Simulation.tsx-is: need piirid otsustavad, kas ülesannete
 * vastused on liuguriga üldse saavutatavad ja kas kogu võre peal püsib mudel
 * mõistlike arvude juures. Mõlemat kontrollib test, mis käib kogu võre läbi –
 * nii ei saa keegi hiljem liuguri piire muutes vaikselt ekraanile tuua
 * väärtust, mille peale mudel enam ei vasta.
 *
 * Algväärtused (800 lm ja 2700 K) on mõlemad võre peal, seega saab õpilane
 * alguskoha alati liuguriga tagasi – see oli mooduli `varjutused` õppetund.
 */
export const SLIDERS = {
  /** Valgusvoog Φ (lm) – algväärtus 800 lm (tavaline kodulamp). */
  lumensLm: { min: 200, max: 3000, step: 100 },
  /** Värvustemperatuur T (K) – algväärtus 2700 K (soe valge). */
  kelvin: { min: 2200, max: 6500, step: 100 },
} as const satisfies Record<string, { min: number; max: number; step: number }>;

/* --------------------------------------------------------------------------
 * Abifunktsioonid (ei ekspordita)
 * ----------------------------------------------------------------------- */

function assertPositive(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${what} peab olema positiivne arv, aga oli ${value}`);
  }
}

/**
 * Ka lõplikest sisenditest võib tulla lõpmatus või NaN.
 *
 * Sisendikontroll ei päästa siin üksi: `luminousEfficacy(1e308, 1e-308)` saab
 * iga argumendi eraldi võttes korraliku positiivse arvuna läbi, aga jagatis
 * voolab üle `Infinity`-ks. Sama joon on moodulite `valgusallikad`, `helkur`,
 * `nurkpeegel` ja `kuu-faasid` mudelites (Codexi leiud, sammud 4.1ii ja
 * 4.1mm).
 */
function assertFiniteResult(value: number, what: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${what} ei mahu arvu sisse: tuli ${value}`);
  }
}

/**
 * Jagatis, mis peab jääma nullist suuremaks.
 *
 * Lõpmatusel on vaikne vend: `luminousEfficacy(Number.MIN_VALUE, 2)` saab iga
 * argumendi eraldi võttes korraliku positiivse arvuna läbi, aga jagatis voolab
 * ALLA nulliks. `Number.isFinite(0)` on `true`, seega laseks üksi jäetud
 * lõplikkuse kontroll läbi vastuse „0 lm/W" lambi kohta, mis annab valgust.
 *
 * Erinevalt lõpmatusest ei paista null ekraanil kahtlane – seepärast on see
 * halvem viga kui ülevoolamine, mitte kergem (Codexi leid, samm 4.1nnn).
 */
function assertPositiveResult(value: number, what: string): void {
  assertFiniteResult(value, what);
  if (value <= 0) {
    throw new RangeError(
      `${what} peab jääma nullist suuremaks, aga tuli ${value} – arv voolas alla`,
    );
  }
}

function assertInRange(
  value: number,
  min: number,
  max: number,
  what: string,
  why: string,
): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(
      `${what} peab olema ${min}…${max}, aga oli ${value} – ${why}`,
    );
  }
}

/* --------------------------------------------------------------------------
 * Valgusviljakus – mooduli kaks poolt
 * ----------------------------------------------------------------------- */

/**
 * Valgusviljakus: **η = Φ / P** ühikus lm/W. Mitu luumenit annab lamp ühest
 * vatist.
 *
 * Mooduli keskne tehe. Just siin läheb lambitüüpide vahel lahku: hõõglamp
 * 720 / 60 = 12 lm/W, LED 800 / 8 = 100 lm/W ehk kaheksa korda rohkem valgust
 * täpselt samast elektrist.
 *
 * Lubatud `lumensLm > 0` ja `powerW > 0` – lamp, mis ei tarbi midagi või ei
 * anna midagi, ei ole lamp. Tulemus üle {@link MAX_EFFICACY_LM_PER_W} viskab
 * vea.
 */
export function luminousEfficacy(lumensLm: number, powerW: number): number {
  assertPositive(lumensLm, "Valgusvoog");
  assertPositive(powerW, "Võimsus");

  const efficacyLmPerW = lumensLm / powerW;

  assertPositiveResult(efficacyLmPerW, "Valgusviljakus");
  if (efficacyLmPerW > MAX_EFFICACY_LM_PER_W) {
    throw new RangeError(
      `Valgusviljakus ${efficacyLmPerW} lm/W ületab füüsikalise piiri ${MAX_EFFICACY_LM_PER_W} lm/W – sellist lampi ei ole olemas`,
    );
  }
  return efficacyLmPerW;
}

/**
 * Mitu vatti kulub, kui teed sama valguse selle lambitüübiga:
 * **P = Φ / η** vattides.
 *
 * Sama jagamistehe teistpidi ja ühtlasi vastus küsimusele „mis vahet seal on":
 * elutoa 2700 lm tuleb LED-idega 27 W-ga, hõõglampidega 225 W-ga.
 *
 * Funktsiooni {@link luminousEfficacy} pöördfunktsioon –
 * `powerForLumens(Φ, luminousEfficacy(Φ, P))` = P – ja seda valvab test. See on
 * ainus koht, kus mudeli kaks poolt teineteist ristkontrollivad: ilma selleta
 * võiks üks neist vaikselt jagatava ja jagaja ära vahetada ja ükski
 * üksikväärtuse test seda ei näitaks.
 *
 * Lubatud `lumensLm > 0` ja `0 < efficacyLmPerW ≤` {@link MAX_EFFICACY_LM_PER_W}.
 */
export function powerForLumens(
  lumensLm: number,
  efficacyLmPerW: number,
): number {
  assertPositive(lumensLm, "Valgusvoog");
  assertPositive(efficacyLmPerW, "Valgusviljakus");
  if (efficacyLmPerW > MAX_EFFICACY_LM_PER_W) {
    throw new RangeError(
      `Valgusviljakus ${efficacyLmPerW} lm/W ületab füüsikalise piiri ${MAX_EFFICACY_LM_PER_W} lm/W – sellist lampi ei ole olemas`,
    );
  }

  const powerW = lumensLm / efficacyLmPerW;

  assertPositiveResult(powerW, "Võimsus");
  return powerW;
}

/* --------------------------------------------------------------------------
 * Ruum
 * ----------------------------------------------------------------------- */

/**
 * Kui palju valgust ruumi vaja on: **Φ = S · tihedus** luumenites.
 *
 * Sama lamp valgustab väikest tuba heledalt ja suurt hämaralt – pindala korda
 * soovitatav tihedus annab luumenite arvu, mida poest otsida. Tihedus ise
 * sõltub sellest, MIDA seal tehakse, ja tuleb argumendina sisse (vt faili
 * päist): magamistoas ~100, elutoas ~150, köögi tööpinnal ~300, õppelaual
 * ~500 lm/m².
 *
 * See on taskuarvutusreegel, mitte valgustusprojekt – ekraanil on ta ka nii
 * kirjas („ligikaudne soovitus"). Vt idealiseeringud 1, 2 ja 6.
 */
export function requiredLumens(areaM2: number, lumensPerM2: number): number {
  assertInRange(
    areaM2,
    AREA_MIN_M2,
    AREA_MAX_M2,
    "Ruumi pindala (m²)",
    "väljaspool seda ei ole tegemist enam toa valgustamisega",
  );
  assertInRange(
    lumensPerM2,
    DENSITY_MIN_LM_PER_M2,
    DENSITY_MAX_LM_PER_M2,
    "Valgustustihedus (lm/m²)",
    "väljaspool seda ei kehti taskuarvutusreegel",
  );

  const lumensLm = areaM2 * lumensPerM2;

  assertFiniteResult(lumensLm, "Soovitatav valgusvoog");
  return lumensLm;
}

/* --------------------------------------------------------------------------
 * Valguse värvus
 * ----------------------------------------------------------------------- */

/**
 * Värvustemperatuuri liigitus – **koodinimed, mitte ekraanitekst**.
 *
 * Eestikeelsed sildid „soe valge", „neutraalne valge", „külm valge" tulevad
 * failist display.ts, mitte mudelist – täpselt nagu moodulis `kuu-faasid`. Nii
 * ei jõua vaidlus sõnastuse üle kunagi mudelisse ega ühegi kontrollitava
 * küsimuse õige vastuse sisse.
 *
 * `"kulm"` on tahtlikult ilma täpitäheta, nagu kõik selle projekti
 * liigitusväljundid.
 */
export type ColorTemperatureClass = "soe" | "neutraalne" | "kulm";

/**
 * Liigitab valguse värvustemperatuuri järgi: **soe** alla
 * {@link WARM_MAX_K} K, **neutraalne** {@link WARM_MAX_K}…{@link NEUTRAL_MAX_K} K
 * (mõlemad otsad kaasavad), **külm** üle selle.
 *
 * Piirid elavad siin konstantides, mitte laiali sisufailides – vahemikud on
 * kaasavad täpselt seal, kus spetsifikatsioonis kirjas, ja seda valvab test
 * kõigi nelja piiripunktiga (3299 / 3300 / 5300 / 5301).
 *
 * **Nimi ja arv käivad vastupidi:** „soe" valgus on VÄIKE arv (2700 K,
 * hõõglamp), „külm" valgus SUUR arv (6500 K, pilves päev). Arv ütleb, millise
 * temperatuuriga hõõguv keha annaks sellist valgust – see EI ole lambi enda
 * temperatuur.
 */
export function classifyColorTemperature(kelvin: number): ColorTemperatureClass {
  assertInRange(
    kelvin,
    KELVIN_MIN,
    KELVIN_MAX,
    "Värvustemperatuur (K)",
    "väljaspool seda ei ole tegemist enam lambivalikuga",
  );

  if (kelvin < WARM_MAX_K) return "soe";
  if (kelvin <= NEUTRAL_MAX_K) return "neutraalne";
  return "kulm";
}
