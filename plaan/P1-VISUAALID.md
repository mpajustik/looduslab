# P1 „Valgus ja peegeldumine" – teooriasammude visuaalide täiendused

**Taust:** 2026-08-22 analüüsiti läbi kõigi 18 P1-mooduli teooriasammud
(20 sammu kokku). 17 sammul on juba joonis, 3-l ei ole ühtegi. Aga peamine
probleem ei ole puuduvad joonised, vaid see, et mitmel moodulil katab
olemasolev joonis ainult ühe teooriateksti kolmest-neljast ideest – ja
katmata jääb just kõige abstraktsem osa.

**Töövorm:** iga joonis = uus komponent moodulis `figures.tsx` + `figure: "…"`
võti vastava teooriasammu külge `activities.ts`-is. See on tavasamm mustri
järgi → **Sonnet** (vt CLAUDE.md „Mudelivalik"). Üks joonis = üks commit.
Kontrolli iga joonist 360 px laiuses ja projektorivaates (reegel 10).

**Eeskuju mustrist:** `helkur/figures.tsx` → `ThreeSurfacesFigure`
(kolm paneeli kõrvuti) ja `nurkpeegel/figures.tsx` → `TwoMirrorsFigure`
(geomeetriline joonis nurgakaartega).

---

## Suured täiendused (kuus kohta, kus visuaal muudab arusaamist oluliselt)

### 1. valgusallikad – teooriasammul pole ühtegi joonist

Ploki suurim auk: tekst kannab nelja eraldi ideed puhta jutuna.

- [x] **Liigitusskeem** – 2×4 ikooniruudustik: soojuslikud (Päike, küünal,
      hõõglamp, tuli) vs külmad (LED, päevavalguslamp, ekraan, jaaniuss).
      (Tehtud: `SourceClassificationFigure`.)
- [x] **Punkt- vs laiendatud allikas** – sama lamp kaugelt ja lähedalt,
      suhtarv `kaugus ÷ mõõde` peale kirjutatud, piir `POINT_SOURCE_MIN_RATIO`
      juures. (Tehtud: `PointVsExtendedFigure`, mõlemad koos
      `SourceKindsFigure` all, võti `va-liigid`, theory-1 küljes – moodul
      jääb 6 sammu juurde, teist theory-sammu ei lisatud.)

### 2. valguse-sirgjooneline-levimine – teooriasammul pole ühtegi joonist

- [x] **Kolm vihutüüpi kõrvuti** – hajuv / paralleelne / koonduv, kolm
      noolekimpu. Odavaim võit kogu plokis; mõiste kordub hiljem nõgus- ja
      kumerpeegli juures. (Tehtud: `ThreeBeamTypesFigure`, nüüd osana
      võtmest `oo-vihk-ja-tuubid`, theory-1 küljes.)
- [x] **Vihk vs kiir** – vasakul päris valgusjuga koonusena, paremal mudel
      ühe noolega joonena. Tekst ütleb „päris elus ühte üksikut kiirt ei ole" –
      see mudeli-ja-tegelikkuse vahe on täpselt see, mida hiljem segi aetakse.
      (Tehtud: `RayVsBeamFigure` + `RayAndBeamTypesFigure`, mis paneb selle
      kokku `ThreeBeamTypesFigure`'iga üheks joonisristikuks – moodul jääb
      6 sammu juurde, teist theory-sammu ei lisatud.)

### 3. peeglikiri – puudu on mehhanism, mitte tulemus

- [x] **Pabeririba pealtvaade** – TAKSO tähed erinevatel sügavustel peeglist,
      peegelpildis järjekord ümber pööratud. `LetterSymmetryFigure` näitab,
      *milliseid* tähti peegeldus muudab, aga *miks järjekord pöördub*, on
      praegu puhas sõnadega mõtteeksperiment. See on mooduli tuum.
      (Tehtud: `MirrorDepthFigure` + `LetterSymmetryAndDepthFigure`, mis
      paneb selle kokku `LetterSymmetryFigure`'iga, võti
      `pk-tahtede-summeetria`, theory-1 küljes.)

### 4. kumerpeegli-rakendused – tagajärjed 2 ja 3 on visualiseerimata

- [x] **Peeglivaate makett** – sama auto tasapeeglis ja kumerpeeglis kõrvuti.
      `ViewFieldFigure` katab vaatevälja (tagajärg 1), aga „esemed paistavad
      väiksemad" ja „kaugus tundub suurem" – millest tuleb kogu autopeegli
      hoiatus – on ainult tekst. (Tehtud: `MirrorSizeIllusionFigure` +
      `ViewFieldAndSizeIllusionFigure`, mis paneb selle kokku
      `ViewFieldFigure`'iga, võti `kr-vaatevali`, theory-1 küljes.)

### 5. noguspeegli-rakendused – kaks kõige raskemat lõiku on tekstis

- [x] **„Allikas ei ole punkt"** – kolm paneeli: ideaalne punktallikas vs
      LED-kiip 2 mm vs hõõgniit 10 mm → sama peegel, laienev kimp, laiused
      mudelist (`beamDiameter`, samad arvud mis explore-1/2).
      (Tehtud: `SourceSizeFigure`.)
- [x] **Peegli suurus vs kontsentratsioon** – tekst ise ütleb, et „just seda
      vahet ajab enamik segi". Kolm peeglit + tihedustulbad
      (`solarConcentration`): suur ja väike peegel sama suhtega
      `läbimõõt : fookuskaugus` (võrdsed tulbad) vs sama suur peegel eri
      suhtega (madalam tulp). Samad arvud mis practice-1/2.
      (Tehtud: `MirrorSizeVsConcentrationFigure`, mis paneb selle kokku
      `TwoDirectionsFigure`'i ja `SourceSizeFigure`'iga võtme
      `nr-kaks-suunda` alla komponendina
      `TwoDirectionsSourceAndConcentrationFigure` – moodul jääb 6 sammu
      juurde, teist theory-sammu ei lisatud.)

### 6. varjutused – „miks mitte iga kuu" on ainult tekst

- [x] **Kaldus Kuu-raja külgvaade** – 5° kalle ja kaks sõlme (lõikekohta)
      märgitud. Mooduli raskeim koht. `TwoEclipsesFigure` näitab kahte
      varjutust, aga mitte seda, miks neid harva juhtub.
      (Tehtud: `MoonOrbitTiltFigure`, mis paneb selle kokku
      `TwoEclipsesFigure`'iga võtme `vj-kaks-varjutust` alla komponendina
      `TwoEclipsesAndOrbitTiltFigure` – moodul jääb 6 sammu juurde, teist
      theory-sammu ei lisatud. Kalle joonisel liialdatud 20°-ni, 5° oleks
      paberil nähtamatu.)

---

## Väiksemad täiendused

Igal neist on joonis juba olemas – lisatav joonis katab teooriateksti selle
osa, mis praegu jääb sõnadeks.

- [x] **liitvalgus-ja-spekter** – liit- vs lihtvalgus kõrvuti: lai riba vs
      üks kitsas joon 650 nm juures. Mooduli definitsioon ise on
      visualiseerimata (olemas: `SpectrumStripFigure`).
      (Tehtud: `SimpleVsCompositeFigure`, mis paneb selle kokku
      `SpectrumStripFigure`'iga võtme `ls-spekter-ja-liht-liit` alla
      komponendina `SpectrumAndCompositeFigure` – moodul jääb 6 sammu
      juurde, teist theory-sammu ei lisatud. Version bumbitud 1.0.2, sest
      MOODULILEPING.md loeb visuaali muutuse patchiks.)
- [ ] **lambivalik** – lambipakendi silt, kus kolm arvu (lm, W, K) peal
      märgitud. Kelvin on kaetud (`ThreeColoursFigure`), lumen ja vatt mitte –
      ja pakend ongi see päris asi, millest moodul räägib.
- [ ] **vari-ja-poolvari** – punktallika juhtum (ainult täisvari, poolvarju
      pole) teise paneelina `UmbraPenumbraFigure` kõrvale. Tekst rõhutab
      kontrasti, joonis näitab ainult laia allika poolt.
- [ ] **esemete-varvus** – liitmisreegel kolme kattuva ringina
      (P+R→kollane, kõik kolm→valge). Olemas: `RedAppleFigure`.
- [ ] **valgusfiltrid** – „filter ≠ prisma" kahe paneelina: filter (valge
      sisse → punane välja, midagi ei lahutata) vs prisma (valge sisse →
      värvilehvik). Levinud segiajamine. Olemas: `SingleFilterFigure`.
- [ ] **tasapeegli-kujutis** – „astud sammu lähemale → vahe väheneb kaks
      sammu" enne/pärast paneelina. Klassikaline eksamiküsimus, praegu
      ainult tekst. Olemas: `VirtualImageFigure`.
- [ ] **helkur** – kuubinurk (kolm peeglit, 3D-vaade). Tekst ütleb, et päris
      helkuris on kolm peeglit, mitte kaks, aga 3D-d on raske ette kujutada.
      Olemas: `ThreeSurfacesFigure` (väga tugev, katab kolme pinna kontrasti).
- [ ] **kumerpeegel** – terve paralleelne kimp hajumas, mitte üks kiir.
      `NormalFigure` näitab mehhanismi (α = β, näiline fookus), aga mitte
      „hajutav peegel" tervikpilti.
- [ ] **noguspeegel** – C ja F koos peateljel, et `f = R/2` oleks nähtav.
      Olemas: `NormalFigure` (näitab C-d, aga mitte suhet).
- [ ] **kuu-faasid** – 29,5 vs 27,3 päeva vahe: kaks Maa asendit orbiidil,
      2-päevane järelejõudmine. Keskmine prioriteet. Olemas: `LitHalfFigure`.

---

## Madal prioriteet (ei pruugi vajalik olla)

- **nurkpeegel** – 90° ja 0° erijuhud. Periskoobi joonis on juba
  `practice-3`-s olemas, `TwoMirrorsFigure` katab α+β=θ ja pöörde 2θ hästi.
- **peegeldumisseadus theory-1** – „kiir = joon + nool". Sisu kordub
  moodulist `valguse-sirgjooneline-levimine`; kui punkt 2 saab tehtud, võib
  siin piisata tekstist. Selle mooduli theory-2 ja theory-3 on kaetud.

---

## Moodulid, kus teooriajoonis on piisav

`vari-ja-poolvari`, `varjutused`, `kuu-faasid`, `liitvalgus-ja-spekter`,
`esemete-varvus`, `valgusfiltrid`, `tasapeegli-kujutis`, `peeglikiri`,
`nurkpeegel`, `helkur`, `kumerpeegel`, `kumerpeegli-rakendused`,
`noguspeegel`, `noguspeegli-rakendused` – kõigil on teooriasammul joonis
olemas; ülal loetletu on täiendus, mitte parandus.

Joonist EI OLE üldse: `peegeldumisseadus/theory-1`.

`valgusallikad` on nüüd teooriasammul kaetud: `SourceClassificationFigure`
(liigitusskeem) ja `PointVsExtendedFigure` (punkt vs laiendatud) koos ühe
joonisena `SourceKindsFigure` kaudu.

`valguse-sirgjooneline-levimine` on nüüd teooriasammul kaetud:
`RayVsBeamFigure` (vihk vs kiir) ja `ThreeBeamTypesFigure` (kolm vihutüüpi)
koos ühe joonisena `RayAndBeamTypesFigure` kaudu.
