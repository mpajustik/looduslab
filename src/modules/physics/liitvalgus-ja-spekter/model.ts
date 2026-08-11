/**
 * Liitvalgus ja spekter – füüsika
 * (sisu/MOODUL-liitvalgus-ja-spekter.md „Füüsika").
 *
 * Ainult puhtad funktsioonid: sama sisend → alati sama väljund, ei Reacti,
 * ei DOM-i, ei juhuslikkust (CLAUDE.md reegel 1). Simulation.tsx ainult kuvab
 * seda, mida siin arvutatakse.
 *
 * **See mudel ei arvuta midagi – ta VAATAB TABELIST.** Tal on kaks tabelit:
 * millised lainepikkused millise värvi nimega käivad (`SPECTRUM_BANDS`) ja
 * milliseid lainepikkusi milline valgusallikas kiirgab (`LIGHT_SOURCES`).
 * Kõik funktsioonid on nende kahe tabeli lugemine. Nii on ka õige, sest
 * mooduli õpieesmärk on spektri LUGEMINE, mitte arvutamine.
 *
 * **Mida mudel meelega EI tea:**
 *
 * - *Miks* prisma valguse värvideks lahutab – see on murdumine ehk plokk P2.
 *   Siin on spekter antud: nii ta välja näeb. Kui siia ilmub kunagi
 *   murdumisnäitaja, on see märk, et keegi lahendab ülesannet, mida see
 *   moodul ei küsi.
 * - Kiirguse TUGEVUST. Mudel ütleb ainult, KAS lainepikkus on olemas või
 *   mitte, mitte kui palju seda on. Seepärast on hõõglambi ja Päikese vahe
 *   („kumb on punakam") selles moodulis sõnadega, mitte arvudega –
 *   tugevuste jaotus nõuaks kiirgusseadusi, mida 8. klass ei õpi.
 *
 * ÜHIKUD: kõik lainepikkused NANOMEETRITES (nm, miljardik meetrit).
 * Teisendust siin ei ole – nanomeeter on ainus ühik, milles moodul
 * lainepikkusi näitab.
 *
 * Sildid (`label`) on eesti keeles, kuigi ülejäänud kood on inglise keeles
 * (reegel 9). Vikerkaarevärvuste nimed EI ole siin kasutajaliidese tekst,
 * vaid füüsika sisu: „kollane" on mudeli vastus ja täpselt sama sõna
 * kontrollib hiljem checker.
 *
 * Vigane sisend VISKAB vea, ta ei „paranda" ennast vaikselt – vaikne parandus
 * peidaks ära vea kutsuvas koodis (nt liuguri vale piiri) ja õpilane näeks
 * õiget vastust vale sisendi pealt.
 */

/** Nähtava valguse lühim lainepikkus (nm). Lühem on ultraviolett. */
export const VISIBLE_MIN_NM = 380;

/** Nähtava valguse pikim lainepikkus (nm). Pikem on infrapunane. */
export const VISIBLE_MAX_NM = 760;

/**
 * Mida mudel vastab lainepikkuse kohta, mida silm ei näe.
 *
 * Ultraviolett ja infrapunane on mudelis olemas ainult selle sildina – neid
 * moodul ei küsi, aga liuguri otsad ei tohi valetada, nagu oleks kogu maailm
 * nähtav valgus.
 */
export const INVISIBLE_LABEL = "nähtamatu";

/** Mida mudel vastab valguse kohta, mis katab silma kõik kolm piirkonda. */
export const WHITE_LABEL = "valge";

/** Mida mudel vastab valguse kohta, mis on mitmest ribast, aga mitte valge. */
export const MIXED_LABEL = "segavärv";

/** Lainepikkuste vahemik (nm). Sama tüüp nii spektri ribal kui ka allikal. */
export interface WavelengthRange {
  readonly minNm: number;
  readonly maxNm: number;
}

/** Üks vikerkaarevärvus koos oma lainepikkuste vahemikuga. */
export interface SpectrumBand extends WavelengthRange {
  readonly id: string;
  /** Värvi nimi eesti keeles – seda sõna mudel vastuseks annab. */
  readonly label: string;
}

/**
 * Spektri seitse riba ehk vikerkaarevärvused.
 *
 * **Piirid on KOKKULEPE, mitte loodusseadus.** Värv muutub spektris sujuvalt,
 * mitte hüppega – 569 nm ja 571 nm näevad välja ühesugused, kuigi tabel
 * ütleb ühe kohta „roheline" ja teise kohta „kollane". Nendele arvudele ei
 * tohi anda suuremat täpsust, kui neil on: nad on siin selleks, et õpilane
 * saaks spektrit LUGEDA, mitte selleks, et värvi piiri sajandiku täpsusega
 * määrata.
 *
 * Seitse riba ja nende nimed on samad, mis põhivaras (ptk 17).
 *
 * Järjekord lühemast pikemani on OLULINE: `colourAtWavelength` toetub sellele,
 * et ribad on järjest ja katavad kogu nähtava ala augukohtadeta, ning
 * Simulation.tsx joonistab riba samas järjekorras vasakult paremale.
 */
export const SPECTRUM_BANDS = [
  { id: "violet", label: "violett", minNm: 380, maxNm: 425 },
  { id: "indigo", label: "tumesinine", minNm: 425, maxNm: 450 },
  { id: "blue", label: "sinine", minNm: 450, maxNm: 495 },
  { id: "green", label: "roheline", minNm: 495, maxNm: 570 },
  { id: "yellow", label: "kollane", minNm: 570, maxNm: 590 },
  { id: "orange", label: "oranž", minNm: 590, maxNm: 620 },
  { id: "red", label: "punane", minNm: 620, maxNm: 760 },
] as const satisfies readonly SpectrumBand[];

/** Spektri riba id („violet" … „red"). */
export type SpectrumBandId = (typeof SPECTRUM_BANDS)[number]["id"];

/**
 * Silma kolm värvitundlikku piirkonda (`perceivedColour` punkt 1).
 *
 * See EI ole täpne silmafüsioloogia, vaid lihtsustus: päris silmas kattuvad
 * kolme retseptori tundlikkuskõverad laialt. Lihtsustus on siin selleks, et
 * seletada mooduli kõige olulisemat „aha'd" – valge LED PAISTAB valge, kuigi
 * tema spektris on punane auk (väärarusaam `valge-lamp-on-taielik`).
 *
 * Piirkonnad katavad kõik seitse riba täpselt üks kord – seda valvab test,
 * sest muidu võiks siit kaduda riba, mida keegi hiljem lisab.
 */
export const EYE_REGIONS = {
  /** Punane ala. */
  punane: ["red", "orange"],
  /** Roheline ala. */
  roheline: ["yellow", "green"],
  /** Sinine ala. */
  sinine: ["blue", "indigo", "violet"],
} as const satisfies Record<string, readonly SpectrumBandId[]>;

/** Üks valgusallikas: mida ta kiirgab ja mida õpetaja tema kohta teadma peab. */
export interface LightSource {
  readonly id: string;
  /** Allika nimi eesti keeles (simulatsiooni nupurida). */
  readonly label: string;
  /** Lainepikkuste vahemikud, mida allikas kiirgab. */
  readonly emitted: readonly WavelengthRange[];
  /** Lühike selgitus – Simulation.tsx näitab seda valiku all. */
  readonly note: string;
}

/**
 * Simulatsiooni viis valgusallikat.
 *
 * **Naatriumlambi vahemik 588–590 nm on kitsas MEELEGA.** Päris naatriumlambi
 * kaks kollast joont on 589,0 ja 589,6 nm – mõlemad jäävad kollasesse ribasse
 * (570–590). Kui vahemik ulatuks üle 590, satuks lamp korraga kollasesse ja
 * oranži ribasse, `bandCount("sodium")` annaks 2 ja `isCompositeLight`
 * väärtuse `true` – kogu explore-4 ülesanne („lihtvalgus, sest üks riba")
 * läheks katki.
 *
 * **Valge LED on meelega tükeldatud.** Päris valge LED on sinine kiip +
 * kollakas luminofoor: kiirgus katab sinise, rohelise, kollase ja oranži ala,
 * aga jääb punases otsas nii nõrgaks, et selle mudeli keeles LED-il punast
 * riba EI OLE. See on mooduli kõige olulisem „aha" ja ka sild moodulini
 * `lambivalik`.
 *
 * Hõõglambi ja Päikese vahemikud on ÜHESUGUSED – mudel ei kirjelda tugevusi,
 * seega ei oska ta öelda, et hõõglamp on punakam. See vahe on teoorias ja
 * õpetajajuhendis sõnadega.
 */
export const LIGHT_SOURCES = [
  {
    id: "sun",
    label: "päikesevalgus",
    emitted: [{ minNm: VISIBLE_MIN_NM, maxNm: VISIBLE_MAX_NM }],
    note: "Pidev spekter – kõik vikerkaarevärvid on olemas.",
  },
  {
    id: "bulb",
    label: "hõõglamp",
    emitted: [{ minNm: VISIBLE_MIN_NM, maxNm: VISIBLE_MAX_NM }],
    note: "Samuti pidev spekter, aga punases otsas tugevam kui päikesevalgus.",
  },
  {
    id: "led",
    label: "valge LED-lamp",
    emitted: [
      { minNm: 450, maxNm: 495 },
      { minNm: 495, maxNm: 620 },
    ],
    note: "Paistab valge, aga punane ots on peaaegu tühi.",
  },
  {
    id: "sodium",
    label: "naatriumlamp",
    emitted: [{ minNm: 588, maxNm: 590 }],
    note: "Vana kollane tänavavalgusti – üksainus kitsas riba.",
  },
  {
    id: "laser",
    label: "punane laser",
    emitted: [{ minNm: 645, maxNm: 655 }],
    note: "Lihtvalgus: kogu kiirgus mahub ühte kitsasse ribasse.",
  },
] as const satisfies readonly LightSource[];

/** Valgusallika id („sun" … „laser"). */
export type LightSourceId = (typeof LIGHT_SOURCES)[number]["id"];

/**
 * Simulatsiooni liuguri piirid ja samm
 * (sisu/MOODUL-liitvalgus-ja-spekter.md „explore").
 *
 * Miks MUDELIS, mitte Simulation.tsx-is: sama põhjus mis moodulites
 * `vari-ja-poolvari` ja `varjutused` – piirid otsustavad, kas ülesande vastust
 * saab liuguriga üldse SEADA, ja test saab seda kontrollida ilma brauserita.
 *
 * Samm 5 nm on valitud nii, et algväärtus 550 nm satub võre peale
 * ((550 − 380) / 5 = 34): õpilane saab pärast liigutamist alguskohta tagasi.
 * Sama võre peal on ka ülesande 2 vastus 650 nm ((650 − 380) / 5 = 54).
 */
export const SLIDERS = {
  /** Lainepikkus (nm) – spektroskoobi markeri asukoht. */
  wavelengthNm: { min: VISIBLE_MIN_NM, max: VISIBLE_MAX_NM, step: 5 },
} as const satisfies Record<string, { min: number; max: number; step: number }>;

/** Liuguri algväärtus (nm): rohelise riba keskkoht. */
export const INITIAL_WAVELENGTH_NM = 550;

/**
 * Lainepikkus peab olema päris arv ja positiivne.
 *
 * Väljaspool nähtavat ala olemine EI ole viga – 370 nm on ultraviolett ja
 * mudel vastab „nähtamatu". Viga on `NaN`, lõpmatus või negatiivne
 * lainepikkus: neid ei ole olemas, ja kui nad mudelisse jõuavad, on viga
 * kutsuvas koodis.
 */
function assertWavelength(nm: number): void {
  if (!Number.isFinite(nm) || nm <= 0) {
    throw new RangeError(`Lainepikkus peab olema positiivne arv, aga oli ${nm}`);
  }
}

/**
 * Vahemik peab olema päris vahemik: mõlemad otsad positiivsed arvud ja ülemine
 * ots rangelt alumisest suurem.
 *
 * Miks eraldi valvur: `bandsForRanges` on ainus koht, kuhu saab MUDELISSE
 * väljastpoolt toorest andmeid anda (`LIGHT_SOURCES` on siinsamas kirjas ja
 * testiga valvatud). Ilma valvurita tagastaks tagurpidi vahemik `{600, 500}`
 * vaikselt tühja ribade loendi ja `bandCount` ütleks `0` – „sellel valgusel ei
 * ole ühtki värvi". See on vale vastus vale sisendi pealt, täpselt see, mida
 * kogu mudeli valvurite loogika vältida püüab (CodeRabbiti leid samm 4.1v).
 *
 * Nullpikkune vahemik `{500, 500}` on samuti viga, mitte tühi vastus: valgus,
 * mis kiirgab „täpselt ühel punktil ja mitte kusagil mujal", ei ole olukord,
 * mille kohta see mudel midagi öelda oskab – päris kitsas joon on ikka mingi
 * laiusega lõik (vt naatriumlambi 588–590 nm).
 */
function assertRange(range: WavelengthRange): void {
  if (!Number.isFinite(range.minNm) || range.minNm <= 0) {
    throw new RangeError(
      `Vahemiku alumine ots peab olema positiivne arv, aga oli ${range.minNm}`,
    );
  }
  if (!Number.isFinite(range.maxNm) || range.maxNm <= range.minNm) {
    throw new RangeError(
      `Vahemiku ülemine ots peab olema alumisest suurem, aga oli ${range.minNm}…${range.maxNm}`,
    );
  }
}

/**
 * Kas lainepikkus jääb vahemikku: `minNm ≤ nm < maxNm`.
 *
 * Ülemine ots EI kuulu vahemikku – nii ei jää piiri peal kahte vastust
 * (620 nm on punane, mitte korraga oranž ja punane).
 *
 * **Erand on nähtava ala kõige ülemine ots 760 nm**, mis kuulub vahemikku
 * küll. Ilma selleta jääks liuguri kõige parempoolsem asend värvita ja
 * simulatsioon ütleks nähtava valguse otspunktis „nähtamatu" – nähtav ala on
 * kinnine lõik 380–760 nm. Sama erand kehtib nii spektri ribale (punane
 * 620–760) kui ka allika vahemikule (päikesevalgus 380–760), sest muidu
 * väidaks mudel, et Päike 760 nm juures ei kiirga, kuigi seal on punane.
 */
function rangeContains(range: WavelengthRange, nm: number): boolean {
  if (nm < range.minNm) return false;
  if (nm < range.maxNm) return true;
  return nm === range.maxNm && range.maxNm === VISIBLE_MAX_NM;
}

/**
 * Kahe vahemiku ühisosa, kui see on TÕELINE lõik – muidu `null`.
 *
 * See on kogu mooduli kattumisreegel ja ta on siin ÜHES kohas: temast
 * sõltuvad nii `bandCount` (mitu ribat allikal on) kui ka `litSegments` (mis
 * kohad ribal on värvilised). Kui reegel oleks kirjas kaks korda, võiks ühel
 * päeval juhtuda, et näidik ütleb „1 riba", aga joonis värvib kaks.
 *
 * Ühine otspunkt ei tee ribat: naatriumlamp (588–590) puudutab oranži riba
 * (590–620) täpselt punktis 590, aga oranži valgust temast ei tule – ta jääb
 * ühe ribaga lihtvalguseks.
 */
function rangeIntersection(
  a: WavelengthRange,
  b: WavelengthRange,
): WavelengthRange | null {
  const minNm = Math.max(a.minNm, b.minNm);
  const maxNm = Math.min(a.maxNm, b.maxNm);
  return maxNm > minNm ? { minNm, maxNm } : null;
}

/**
 * Spektri riba id järgi. Tundmatu id on viga, mitte tühi vastus – tühja
 * vastuse peale joonistaks Simulation.tsx vaikselt tühja koha.
 */
function findBand(bandId: string): SpectrumBand {
  const band = SPECTRUM_BANDS.find((candidate) => candidate.id === bandId);
  if (!band) {
    throw new RangeError(`Tundmatu spektri riba: ${bandId}`);
  }
  return band;
}

/**
 * Valgusallikas id järgi. Tundmatu id on viga samal põhjusel mis riba puhul.
 */
function findSource(sourceId: string): LightSource {
  const source = LIGHT_SOURCES.find((candidate) => candidate.id === sourceId);
  if (!source) {
    throw new RangeError(`Tundmatu valgusallikas: ${sourceId}`);
  }
  return source;
}

/**
 * Mis värvi on selle lainepikkusega valgus.
 *
 * Väljaspool nähtavat ala (380–760 nm) tuleb `INVISIBLE_LABEL` – ultravioleti
 * ja infrapuna vahet mudel ei tee, sest moodul neid ei küsi.
 *
 * @param nm lainepikkus nanomeetrites
 * @returns riba nimi eesti keeles või „nähtamatu"
 */
export function colourAtWavelength(nm: number): string {
  assertWavelength(nm);
  const band = SPECTRUM_BANDS.find((candidate) => rangeContains(candidate, nm));
  return band ? band.label : INVISIBLE_LABEL;
}

/**
 * Kas see allikas kiirgab seda lainepikkust.
 *
 * Just see funktsioon otsustab, kas spektroskoobi riba on selles kohas
 * värviline või tume – ja seega ka ülesande 2 („kus laser kiirgab?") ja
 * ülesande 3 („milline värv on peaaegu puudu?") vastuse.
 */
export function emitsAtWavelength(sourceId: string, nm: number): boolean {
  const source = findSource(sourceId);
  assertWavelength(nm);
  return source.emitted.some((range) => rangeContains(range, nm));
}

/**
 * Üks värviline tükk spektriribal: see osa ühest vikerkaarevärvist, mida
 * antud vahemikud päriselt katavad.
 *
 * `bandId` ja `label` on kaasas selleks, et joonis teaks, mis värvi ja mis
 * nimega tükk see on, ilma et ta peaks ribade tabelit ise uuesti läbi otsima.
 */
export interface SpectrumSegment extends WavelengthRange {
  readonly bandId: SpectrumBandId;
  readonly label: string;
}

/**
 * Millised KOHAD spektriribal need vahemikud värviliseks teevad.
 *
 * Miks mudelis, mitte joonisel: see on sama kattumisküsimus, mis otsustab ka
 * ribade arvu (`bandCount`) – ainult vastus on täpsem („kollasest 588-st
 * 590-ni" vs „kollane on olemas"). Kui lõikamine elaks joonisel, oleks sama
 * reegel kirjas kahes kohas ja kolmandas (`figures.tsx`) veel kord
 * (CodeRabbiti leid samm 4.1x). Nanomeetrid on füüsika, pikslid mitte –
 * joonisele jäävad ainult koordinaadid ja värvid (CLAUDE.md reegel 1).
 *
 * Tulemus on spektri järjekorras. Ühel ribal VÕIB olla mitu tükki, kui
 * vahemikud katavad temast eri osi – seepärast on see loend, mitte üks tükk
 * riba kohta.
 *
 * Ühine otspunkt tükki ei tee (vt `rangeIntersection`): naatriumlamp
 * (588–590) ei värvi oranži riba (590–620) ühtki punkti.
 */
export function litSegments(
  ranges: readonly WavelengthRange[],
): readonly SpectrumSegment[] {
  ranges.forEach(assertRange);
  return SPECTRUM_BANDS.flatMap((band) =>
    ranges.flatMap((range) => {
      const lit = rangeIntersection(band, range);
      return lit ? [{ bandId: band.id, label: band.label, ...lit }] : [];
    }),
  );
}

/** Millised kohad spektriribal see allikas värviliseks teeb. */
export function emittedSegments(sourceId: string): readonly SpectrumSegment[] {
  return litSegments(findSource(sourceId).emitted);
}

/**
 * Millised spektri ribad need vahemikud vähemalt osaliselt katavad.
 *
 * Eraldi (allikast sõltumatu) funktsioon selleks, et testida saaks ka
 * vahemikke, mida `LIGHT_SOURCES`-is ei ole – võltsallika lisamine päris
 * loendisse tooks ta ka õpilase nupuritta.
 *
 * Tulemus on alati spektri järjekorras ja iga riba ainult üks kord, ka siis,
 * kui mitu vahemikku sama riba katavad (valge LED kaks vahemikku katavad
 * mõlemad rohelist).
 */
export function bandsForRanges(
  ranges: readonly WavelengthRange[],
): readonly SpectrumBand[] {
  // Tuletatud `litSegments`-ist, mitte arvutatud teist korda: nii ei saa
  // „mitu ribat" ja „mis kohad on värvilised" kunagi lahku minna.
  const litBandIds = new Set<string>(
    litSegments(ranges).map((segment) => segment.bandId),
  );
  return SPECTRUM_BANDS.filter((band) => litBandIds.has(band.id));
}

/** Millised spektri ribad see allikas vähemalt osaliselt katab. */
export function emittedBands(sourceId: string): readonly SpectrumBand[] {
  return bandsForRanges(findSource(sourceId).emitted);
}

/** Mitu vikerkaarevärvi on selle allika spektris. */
export function bandCount(sourceId: string): number {
  return emittedBands(sourceId).length;
}

/**
 * Kas tegemist on liitvalgusega.
 *
 * See ongi liht- ja liitvalguse vahe mudeli keeles: rohkem kui üks riba →
 * liitvalgus. Eredus siin ei esine (väärarusaam `spekter-soltub-eredusest`) –
 * laser on kõige eredam ja ikka lihtvalgus.
 */
export function isCompositeLight(sourceId: string): boolean {
  return bandCount(sourceId) > 1;
}

/**
 * Kuidas silm neid ribasid näeb. Kolm juhtu, TÄPSELT selles järjekorras:
 *
 * 1. kui kaetud on kõik kolm silma piirkonda (`EYE_REGIONS`) → „valge";
 * 2. muidu, kui ribasid on täpselt üks → selle riba nimi;
 * 3. muidu → „segavärv".
 *
 * Järjekord on oluline: valge LED katab neli riba ja kõik kolm piirkonda,
 * seega peab punkt 1 jõudma enne punkti 3 – muidu ütleks mudel „segavärv" ja
 * kogu explore-3 mõte kaoks.
 *
 * Kolmas haru ei tule selles moodulis ette (ühelgi viiest allikast ei ole
 * kaht-kolme ribat nii, et mõni piirkond puudu jääks), aga funktsioon peab
 * vastama õigesti ka siis, kui ta kunagi mujale viiakse – seda katab test.
 */
export function perceivedColourForBands(
  bands: readonly SpectrumBand[],
): string {
  const ids = new Set<string>(bands.map((band) => band.id));
  const coversAllRegions = Object.values(EYE_REGIONS).every((region) =>
    region.some((bandId) => ids.has(bandId)),
  );
  if (coversAllRegions) return WHITE_LABEL;
  if (bands.length === 1) return bands[0].label;
  return MIXED_LABEL;
}

/** Kuidas silm selle allika valgust näeb. */
export function perceivedColour(sourceId: string): string {
  return perceivedColourForBands(emittedBands(sourceId));
}

/**
 * Kui lai on spektri riba (nm): `maxNm − minNm`.
 *
 * Väike tehe, aga ta on mudelis, mitte sisufailis, sest harjutus 2 ja
 * väljumispilet küsivad täpselt seda arvu – nii ei saa riba piiride muutmine
 * jätta sisufaili vana vastust seisma.
 */
export function bandWidthNm(bandId: string): number {
  const band = findBand(bandId);
  return band.maxNm - band.minNm;
}

/**
 * Kui lai on kogu nähtava valguse ala (nm): 380.
 *
 * Väljumispileti ülesanne 2 küsib täpselt seda – ja samal põhjusel mis
 * `bandWidthNm` on ta siin, mitte sisufailis käsitsi arvutatud.
 */
export function visibleRangeWidthNm(): number {
  return VISIBLE_MAX_NM - VISIBLE_MIN_NM;
}
