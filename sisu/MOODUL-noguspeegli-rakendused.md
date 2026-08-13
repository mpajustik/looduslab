# Mooduli spetsifikatsioon: Nõguspeegel meie ümber

Ainekava seos (AINEKAVA-fyysika-8.md): plokk P1; õpitulemus: P1-T2 (osa:
nõguspeegli ülekanne päris seadmetesse – taskulamp, peegelteleskoop,
päikeseahi); mõisted, mida õpetab: – (rakendusmoodul, kasutab moodulist
`noguspeegel` tulnud mõisteid **nõguspeegel** ja **fookus**); praktiline
töö: –. Vanus: 8. klass. Kestused: demo 5 min, tund 15 min, iseseisev
12 min. Tüüp: rakendusmoodul (üks õpieesmärk, 6 sammu).

slug: `noguspeegli-rakendused` · id: `physics.noguspeegli-rakendused`

## Ainekava seos (täpsemalt)

- **Plokk:** P1 Valgus ja valguse sirgjooneline levimine. Peegeldumine ja
  neeldumine
- **Õpitulemused:**
  - **P1-T2 osa** – „tunneb valguse sirgjoonelise levimise ja peegeldumise
    seadust, konstrueerib nende põhjal jooniseid ja korraldab katsed".
    Uut seadust ega uut joonist siin ei tule: moodul `noguspeegel` andis
    kiirte käigu ja fookuse, see moodul kannab sama üle kolme päris
    seadmesse ja vastab küsimusele, MIKS neis on nõgus peegel ja mis on
    selle hind.
- **Õppesisu punktid:** „peegeldumisseadus; tasapeegel, kumer- ja
  nõguspeegel" – nõguspeegli osa rakenduslik pool
- **Põhimõisted, mida moodul ÕPETAB:** – rakendusmoodul ei oma ühtki
  ainekava põhimõistet. **Nõguspeegel** ja **fookus** kuuluvad moodulile
  `noguspeegel`, **valgusvihk** moodulile `valguse-sirgjooneline-levimine`.
  Manifesti `concepts` väljale lähevad seepärast kaks asja, mida see moodul
  PÄRISELT seletab ja mida ainekava nimeliselt ei nimeta: **paralleelne
  valgusvihk** ja **valguse koondamine**. Katvusraport (samm 4.0) loeb
  tundmatu mõiste `extraConcepts` alla ehk märkuseks, mitte ainekava
  katteks – täpselt nagu moodulites `varjutused` ja
  `kumerpeegli-rakendused`.
  **Siia EI tohi kirjutada `valgusvihk`** (ainekava P1 põhimõiste): raport
  võrdleb mõisteid nime järgi ja siis paistaks üks põhimõiste kaetuna
  kahest kohast. Sõna „paralleelne valgusvihk" on teine nimi ja läheb
  õigesti märkuseks.
- **Praktiline töö:** – (P1-PT1…PT4 on kõik juba teiste moodulite all).
  Õpetajajuhendi kaks (K) klassikatset (taskulambi peegeldi lahtivõtmine,
  päikese koondamine paberile õues) on demonstratsioonid, mitte ainekava
  praktilised tööd.
- **Teema olulisus → hook:** „igapäevased valgusnähtused looduses ja
  tehnikas" ning „seos … erialadega" – taskulamp taskus, teleskoop
  observatooriumis ja päikeseahi, mis sulatab terast, näevad välja nagu
  kolm eri asja. Kõigi kolme sees on täpselt sama peegel.
- **Metoodilised soovitused, mida järgin:** ainekava nõuab
  peegeldumisseaduse käsitlemist „läbi jooniste eri olukordades". Selles
  moodulis on nõgus pind päris olukorras: simulatsioon on prožektori
  külgvaade, kus mõõdetakse, kui lai valgusring 20 m kaugusel seinal on.
- **Õpilase tegevused:** (D) uurib simulatsioonis, kuidas pirni suurus ja
  peegli kõverus muudavad valgusvihu laiust kaugel seinal; (D) arvutab
  päikeseahju valgusplekist, mitu korda tihedamaks valgus koondub;
  (K) taskulambi peegeldi lahtivõtmine ja päikese koondamine paberile
  õpetajajuhendis

## Piirid (mida see moodul EI tee)

- **Kiirte käik ja fookuse arvutamine** – moodul `noguspeegel` (juba
  ehitatud). Siin on need EELDUS: teooria kordab tulemuse kahe lausega
  („peateljega paralleelsed kiired koonduvad fookusesse", „fookus on poole
  raadiuse kaugusel") ja edasi kasutab. Ühtegi uut langemis- või
  peegeldumisnurga ülesannet siin ei ole.
- **Kujutise konstrueerimine ja suurenduse ARVUTAMINE** (millal on kujutis
  suurendatud, millal pea peal, valem 1/a + 1/b = 2/R) – gümnaasium ja
  8. klassis läätsede teema (P2). Meigipeegel ja hambaarsti peegel on
  moodulis olemas ainult ülekandeülesandes ühe sõnaga („lähedalt vaadates
  suurendab"); ükski ülesanne ei nõua kujutise kohta ega suurendust ja
  mudel neid ei arvuta. **See on ka põhjus, miks simulatsioon näitab
  taskulampi, mitte meigipeeglit:** meigipeegli seletamiseks oleks vaja
  just seda, mida see moodul ei tee.
- **Kumerpeegli rakendused** (liikluspeegel, poe turvapeegel, auto
  külgpeegel) – moodul `kumerpeegli-rakendused`. Siin on kumerpeegel
  ainult vale valikvastus kohas, kus õpilane peab valima, KUMB peegel kuhu
  sobib. Kaks moodulit on teineteise peegelpildid ja seda võib
  õpetajajuhend välja öelda, aga rakendusi ei korrata.
- **Optika kvaliteet** (sfääriline aberratsioon, difraktsioon, peegli
  pinna täpsus, valguse hajumine atmosfääris) – ei õpilase pooles ega
  mudelis. Mudel arvutab ideaalse kerapinnaga, aberratsioonita; kus see
  mudel otsa saab, on kirjas idealiseeringutes ja õpetajajuhendis.
- **Soojusõpetus** (mitu kraadi päikeseahjus tekib, energia, võimsus
  vattides) – plokk P6 ja osalt gümnaasium. Moodul ütleb, mitu korda
  TIHEDAMAKS valgus koondub (paljas arv), ja jätab kraadid mainimise
  tasemele õpetajajuhendisse.
- **Paraboolpeegel.** Päris prožektori, teleskoobi ja päikeseahju peegel ei
  ole kerapinna osa, vaid parabool. Mudel arvutab kerapinnaga, sest
  ainekava räägib kerapinnast ja 8. klassi joonis on kerapinnaga – sama
  otsus ja sama põhjendus on failis MOODUL-noguspeegel.md. Õpetajajuhend
  ütleb selle välja.
- **Valguse tee pööratavuse ÜLDINE seadus** (Helmholtzi vastastikkus) –
  moodul näitab seda ühel juhtumil kahes suunas ja nimetab teda „valguse
  tee on pööratav", aga ei sõnasta üldise seadusena ega kanna teda üle
  murdumisele (P2).

## Allikad

- **Teooria tugi:** `sisu/allikad/OPIK-F8-INDEKS.md` ptk 1.12 „Kumer- ja
  nõguspeegel" (lk 42–45) – faktikontroll: fookusesse pandud valgusallikas
  annab paralleelse kimbu (taskulamp, auto esituli), paralleelne vihk
  koondub fookusesse (peegelteleskoop, päikeseahi). Sama peatükk oli
  aluseks moodulile `noguspeegel`; siinne rakenduste loend ja KÕIK arvud on
  selle mooduli omad. Päikese näiline nurkläbimõõt 0,533° on üldteada
  tähtkonstant (astronoomia käsiraamatud, sama arv igal pool), mitte
  allikast võetud ülesanne. Sõnasõnalist teksti ei kopeerita
  (vt ALLIKAD.md).
- **Ülesannete näidised:** – (kõik arvud tulevad model.ts geomeetriast)

## Füüsika (model.ts jaoks)

Moodul arvutab ühte asja kahes suunas: **kui laiaks valgusvihk läheb**.
Miks kiired fookusesse koonduvad, tuli juba moodulist `noguspeegel` – siin
on selle TAGAJÄRG arvudes.

Kõik pikkused mudeli sees on **meetrites**, nurgad **kraadides** (sama
kokkulepe kui `noguspeegel`, `kumerpeegel` ja `kumerpeegli-rakendused`).
UI räägib peegli ja pirni mõõtudest sentimeetrites ja millimeetrites,
valgusringi laiusest meetrites – ühik muutub ainult
teisendusfunktsioonides.

### Telgistik ja tähised

- Peegli **tipp** on nullpunkt, **peatelg** on peegli sümmeetriatelg. Kera
  keskpunkt on peegli EES kaugusel R (nagu moodulis `noguspeegel`).
- `radiusM` (R) – kera raadius, mille pinnast peegel välja lõigatud on.
- `focalLengthM` (f) – fookuse kaugus tipust, **f = R / 2** (moodul
  `noguspeegel`).
- `mirrorDiameterM` (D) – peegli **läbimõõt** (mitte poolläbimõõt: siin ei
  ole ühtki poolt telge vaja, valgusvihk on kogu peegli laiune).
- `sourceSizeM` (s) – valgusallika **suurus** ehk hõõgniidi või LED-i kiibi
  läbimõõt. Punktallikat päris maailmas ei ole ja just sellest tuleb kogu
  selle mooduli „hind".
- `distanceM` (L) – kaugus peeglist, kus valgusvihu laiust mõõdame (seinal,
  teel, metsas).
- `angularSizeDeg` (α) – kauge allika näiline **nurkläbimõõt** kraadides.
  Päikesel on ta 0,533°.

### Kust valem tuleb (suund 1: fookusest välja)

Fookusesse pandud punktallika kiired lähevad peeglilt tagasi peateljega
paralleelselt (moodul `noguspeegel`). **Päris pirn ei ole punkt.** Iga
pirni punkt, mis on peateljest y kaugusel, annab omaette paralleelse kimbu,
mis on peateljest y / f nurga võrra kaldu – seda ütleb sama geomeetria,
mis fookuse enda: fookustasandi ja suuna vahetus käib teguriga f.

Pirni servad on peateljest s / 2 kaugusel, seega on kogu vihu **lahtiminek**
(täisnurk) s / f radiaanides. Kaugusel L on valgusring seega peegli laiuse
võrra pluss lahtimineku jagu laiem:

> **valgusringi läbimõõt = D + L · s / f**

Kolm asja, mis sellest kohe välja loetavad on ja mis ongi mooduli sisu:

1. **s = 0 (ideaalne punktallikas) annab igal kaugusel D** – vihk jääks
   igavesti peegli laiuseks. Nii täiuslikku taskulampi ei ole olemas.
2. **Väiksem allikas = kitsam vihk.** Viis korda väiksem allikas annab viis
   korda väiksema lahtimineku – aga MITTE viis korda kitsama valgusringi,
   sest peegli oma läbimõõt D on valemis alati sees. 2 mm LED annab 20 m
   kaugusel 0,5 m ringi ja 10 mm hõõgniit 2,1 m ringi ehk 4,2 korda laiema.
   **Lahtimineku suhe ja laiuse suhe on kaks eri arvu** – ülesanne, mis
   jagab lahtiminekuid, ja ülesanne, mis jagab laiusi, ei tohi sattuda
   kõrvuti (sama lõks kui moodulis `kumerpeegli-rakendused` nurkade ja
   laiustega).
3. **Pikem fookuskaugus = kitsam vihk.** Lamedam peegel (suurem R) hoiab
   kiirt paremini koos – see on vastupidine sellele, mida enamik pakub.

Peegli läbimõõt D mõjub ainult liikmes D, mitte lahtiminekus: SUUREM peegel
annab kaugel laiema, mitte kitsama valgusringi. Väikest peeglit ei tee
kitsas kiir suureks – kitsa kiire teeb väike allikas ja pikk fookuskaugus.

### Kust valem tuleb (suund 2: paralleelselt sisse)

Sama geomeetria tagurpidi: kaugelt tuleva allika (Päike, täht) kiired on
omavahel paralleelsed, aga allikas ise ei ole punkt – ta paistab nurga α
suuruse kettana. Peateljega nurga β võrra kaldu tulev paralleelne kimp
koondub fookustasandis punkti, mis on teljest f · tan β kaugusel, seega on
fookuses tekkiv **valgusplekk** ketas läbimõõduga

> **valgusplekk = 2 · f · tan(α / 2)**

Väikeste nurkade juures on see praktiliselt f · α (α radiaanides), aga
mudel arvutab tangensiga – nii ei pea keegi hiljem mõtlema, kas nurk on
„piisavalt väike".

Päikese ketas (α = 0,533°) annab 1 m fookuskaugusega peegli fookusesse
**9,3 mm** laiuse plekki. Just seepärast ei saa ükski peegel Päikest
punktiks koondada ja just see 9,3 mm otsustab, kui tihedaks valgus koondub:

> **koondumistegur = (D / valgusplekk)²**

Ruut tuleb sellest, et võrreldakse PINDALASID: peeglile langeb valgust
ringilt läbimõõduga D, kogu see valgus jõuab plekile läbimõõduga d.

**Kõige tähtsam ja kõige üllatavam tagajärg:** koondumistegur sõltub ainult
suhtest D / f, mitte peegli suurusest. 10 cm peegel fookuskaugusega 10 cm
koondab valgust täpselt sama tihedaks (≈ 11 500 korda) kui 1 m peegel
fookuskaugusega 1 m. **Suurem peegel ei koonda seepärast tihedamalt, et ta
on suurem** – ta kogub rohkem valgust kokku, sest tema pindala on suurem.
Tihedamaks koondab ta ainult siis, kui koos suurusega kasvab ka suhe D / f
ehk kui peegel läheb sama fookuskauguse juures „sügavamaks". Seda vahet
(„kui tihe" vs „kui palju") ajab segi enamik inimesi ja moodul lööb ta
lahku – seda valvab ka invariant `solarConcentration(k·D, k·f)` =
`solarConcentration(D, f)`.

### Funktsioonid

- `focalLength(radiusM)` → **R / 2**. Sama valem, mis moodulis
  `noguspeegel` – ja sama põhjus, miks teda ei impordita (vt allpool).
- `beamDiameter(mirrorDiameterM, focalLengthM, sourceSizeM, distanceM)` →
  **D + L · s / f**, valgusringi läbimõõt meetrites kaugusel L.
- `focalSpotDiameter(focalLengthM, angularSizeDeg)` →
  **2 · f · tan(α / 2)**, kauge allika valgusplekk fookuses, meetrites.
- `solarConcentration(mirrorDiameterM, focalLengthM)` →
  **(D / focalSpotDiameter(f, SUN_ANGULAR_DEG))²**, mitu korda tihedamaks
  Päikese valgus koondub. Nurka ta argumendina ei võta: see funktsioon
  räägib ainult Päikesest ja tema nurk on konstant.
- `SUN_ANGULAR_DEG = 0.533` – Päikese näiline nurkläbimõõt kraadides
  (keskmine; jaanuaris 0,542°, juulis 0,524°, aga moodul ei sõltu sellest
  vahest).
- `metresFromCentimetres`, `centimetresFromMetres`,
  `metresFromMillimetres`, `millimetresFromMetres` – **ainsad neli kohta
  mooduli sees, kus pikkuse ühik muutub.** Millimeetrid on siin vaja
  seepärast, et pirni suurus ja valgusplekk on mõlemad millimeetrites
  loetavad arvud; sentimeetrites oleks „0,2 cm" ja „0,93 cm" mõlemad
  loetamatud. Sama reegel ja sama põhjus mis teistes moodulites:
  möödaminnes vahetatud ühik annab vaikse 10- või 100-kordse vea.

### Miks EI ole see mooduli `noguspeegel` mudeli taaskasutus

`focalLength` on kirjas juba moodulis `noguspeegel`. Teda EI impordita:
moodulid laaditakse dünaamiliselt ja iga moodul on oma tükk (raudne
reegel 13) – ristimport tõmbaks ühe mooduli teise bundle'isse ja seoks kaks
eraldi arhiveeritavat üksust kokku (reegel 11). Kordus on üks rida (R / 2)
ja teda valvab **ristkontrolli test**: mõlema mooduli `focalLength` peab
samadel sisenditel andma sama arvu. See test on TESTIS, mitte rakenduse
koodis – täpselt sama otsus ja sama põhjendus nagu paaril
`kumerpeegel` / `kumerpeegli-rakendused`.

### Idealiseeringud (peavad olema model.ts kommentaaris kirjas)

1. **Peegel on kerapinna osa.** Päris prožektori, teleskoobi ja päikeseahju
   peegel on parabool. Kerapeeglil ei koondu servadelt tulevad kiired
   täpselt samasse punkti (sfääriline aberratsioon) ja plekk on tegelikult
   suurem kui valem ütleb. Valem kehtib hästi, kui peegli läbimõõt jääb
   fookuskaugusest väiksemaks (D ≤ f) – **just see määrab simulatsiooni
   liuguri alumise piiri**, mitte ilutunne.
2. **Allikas on peegli ees täpselt fookuses** ja tema pind on peatelje
   suhtes risti. Nihutatud pirn annab hajuva või koonduva kimbu – seda
   mudel EI arvuta (selleks oleks vaja peeglivalemit, mis on gümnaasium).
   Simulatsioon hoiab pirni alati fookuses ja ütleb selle ekraanil välja.
3. **Kogu peeglile langev valgus peegeldub** ja jõuab plekki või vihku.
   Päris peegel peegeldab 85–95 % ja osa valgust läheb allikast otse
   mööda peeglit välja (taskulambi „udu" ümber kiire).
4. **Valgus levib takistuseta.** Atmosfääri hajumist, tolmu ja vihma
   mudel ei tunne – päris prožektori kiir kaob udus ära palju varem, kui
   valem ütleb.
5. **Kõik on ühes tasapinnas** (külgvaade). Päris vihk ja päris plekk on
   ringid; läbimõõt tuleb sama valemiga, aga mudel ühtki pindala peale
   koondumisteguri ei arvuta.
6. **Difraktsiooni ei ole.** Väga väikese allika ja väga suure peegli
   juures paneb piiri valguse lainelisus, mitte geomeetria. 8. klassi
   moodulis on see ainult õpetajajuhendi lause.

**Testiväärtused (teadaolevad):** argumendid koodikujul (kümnendpunkt),
tulemused eestikeelse kümnendkomaga. Pikkused meetrites, nurgad kraadides.

| Kutse | Tulemus |
|---|---|
| `focalLength(0.2)` | 0,1 (simulatsiooni algseis: R = 20 cm) |
| `focalLength(1)` | 0,5 |
| `focalLength(0)` | **viskab vea** |
| `beamDiameter(0.1, 0.1, 0.002, 20)` | **0,5** (täpne arv – simulatsiooni algseis) |
| `beamDiameter(0.1, 0.1, 0.01, 20)` | **2,1** (täpne arv – hõõgpirn LED-i asemel) |
| `beamDiameter(0.1, 0.3, 0.002, 20)` | 0,233333 (lamedam peegel – kitsam vihk) |
| `beamDiameter(0.1, 0.3, 0.001, 20)` | 0,166667 (parim seis liuguritel) |
| `beamDiameter(0.1, 0.2, 0.001, 20)` | **0,2** (täpne arv) |
| `beamDiameter(0.1, 0.1, 0, 20)` | **0,1** (ideaalne punktallikas: vihk jääb peegli laiuseks) |
| `beamDiameter(0.1, 0.1, 0.002, 0)` | **0,1** (peegli enda laius) |
| `beamDiameter(0.1, 0.1, 0.005, 50)` | **2,6** (täpne arv – päris taskulamp 50 m kaugusel) |
| `focalSpotDiameter(1, 0.533)` | 0,00930267 (9,3 mm) |
| `focalSpotDiameter(0.1, 0.533)` | 0,000930267 (0,93 mm) |
| `focalSpotDiameter(10, 0.533)` | 0,0930267 (9,3 cm – pika fookusega teleskoop) |
| `focalSpotDiameter(1, 0)` | **0** (punktallikas ehk täht annab punkti) |
| `solarConcentration(1, 1)` | 11 555,4 |
| `solarConcentration(0.1, 0.1)` | 11 555,4 (**sama arv** – sõltub ainult suhtest D / f) |
| `solarConcentration(1, 2)` | 2888,85 (kaks korda pikem fookus – neli korda vähem) |
| `solarConcentration(1, 0.5)` | 46 221,7 (piiril: D = 2f) |
| `solarConcentration(1, 0.4)` | **viskab vea** (D > 2f) |
| `metresFromMillimetres(2)` | 0,002 |
| `millimetresFromMetres(focalSpotDiameter(1, 0.533))` | 9,30267 |

Piirjuhud ja invariandid:

- **Punktallikas hoiab vihu koos:** `beamDiameter(D, f, 0, L)` = D iga L
  korral. See on kogu mooduli lähtekoht ja peab olema testis, mitte ainult
  tekstis.
- **Vihk läheb kaugusega ühtlaselt laiemaks:** `beamDiameter` on L suhtes
  lineaarne – kahekordne kaugus annab kahekordse LISA (mitte kahekordse
  laiuse, sest peegli oma laius on sees). Test võrdleb kolme kaugust.
- **Väiksem allikas = kitsam vihk:** s kasvades `beamDiameter` kasvab
  rangelt monotoonselt (test käib kogu liuguri võre läbi).
- **Pikem fookus = kitsam vihk:** f kasvades `beamDiameter` kahaneb
  rangelt monotoonselt. Need kaks invarianti ongi explore-sammu kaks
  avastust.
- **Suurem peegel EI anna kitsamat vihku:** `beamDiameter(2D, f, s, L)` >
  `beamDiameter(D, f, s, L)` samade ülejäänud arvudega. Väärarusaam
  `suurem-peegel-kitsam-kiir` on sellega testiga kinni löödud.
- **Plekk kasvab fookuskaugusega võrdeliselt:**
  `focalSpotDiameter(2f, α)` = 2 · `focalSpotDiameter(f, α)`.
- **Koondumistegur sõltub ainult suhtest D / f:**
  `solarConcentration(k·D, k·f)` = `solarConcentration(D, f)` iga k > 0
  korral. Test käib mitme k-ga – see on mooduli kõige üllatavam väide ja
  ainus koht, kus õpilase intuitsioon („suurem peegel koondab tihedamalt")
  päriselt ümber lükatakse.
- **Ristkontroll mooduliga `noguspeegel`:** test võrdleb `focalLength`
  väärtusi mooduli `noguspeegel` sama nimega funktsiooniga ja nõuab
  võrdust. **Ainus koht, kus selle mooduli testid teist moodulit
  puudutavad.**
- **Simulatsiooni turvavöönd:** liuguritega on R = 20…60 cm (ehk
  f = 10…30 cm) ja s = 1…20 mm, peegli läbimõõt D = 10 cm ja sein
  L = 20 m kaugusel. Selles vöötsis jääb peegli läbimõõt alati
  fookuskaugusest väiksemaks või sellega võrdseks (D ≤ f) ja valgusringi
  läbimõõt vahemikku **0,17 m** (f = 30 cm, s = 1 mm) kuni **4,1 m**
  (f = 10 cm, s = 20 mm).
  Test käib kogu võre läbi ja nõuab, et tulemus on positiivne, lõplik ja
  jääb alla 10 m – nii ei saa keegi hiljem liuguri piire muutes vaikselt
  seinast välja ulatuvat arvu ekraanile tuua.

Vigased sisendid viskavad vea (`RangeError`):

- mis tahes argument, mis ei ole lõplik arv (NaN, lõpmatus), ja iga
  tulemus, mis lõplikest sisenditest hoolimata üle voolab (sama joon mis
  moodulites `kumerpeegel`, `noguspeegel` ja `kumerpeegli-rakendused` –
  Codexi leiud, sammud 4.1ii ja 4.1mm)
- `radiusM` ≤ 0, `focalLengthM` ≤ 0, `mirrorDiameterM` ≤ 0 – ilma
  suuruseta peeglit ega fookust ei ole olemas
- `distanceM` < 0; **`distanceM` = 0 on lubatud** ja annab peegli enda
  läbimõõdu (vihk on peegli juures täpselt peegli laiune)
- `sourceSizeM` < 0; **`sourceSizeM` = 0 on lubatud** ja tähendab ideaalset
  punktallikat. See on vahe, mis peab olema kommentaaris kirjas: mooduli
  `kumerpeegli-rakendused` `mirrorBulge`-is viskab null vea (laiuseta
  peeglit ei ole), siin on null täiesti mõistlik idealiseering, mille peale
  kogu teooria ehitatud on.
- `angularSizeDeg` < 0 või ≥ 180° – ketas, mis on suurem kui pool taevast,
  ei ole kauge allikas. **α = 0 on lubatud** (täht ongi punkt) ja annab
  plekiks 0.
- **`mirrorDiameterM` > 2 · `focalLengthM`** funktsioonis
  `solarConcentration` – nii „kiire" peegli juures ei kehti enam ei
  kerapinna geomeetria ega valemi tulemus: D = 2f juures annab valem
  46 222 ja see on juba päikesevalguse füüsikaline ülempiir (≈ 46 000
  korda, tuleb Päikese nurksuurusest). Mudel ei vasta küsimusele, mille
  peale tema sõnastus enam ei kehti – sama põhimõte nagu poolnurga 90°
  piiril moodulis `kumerpeegli-rakendused`.

## Sammud

### 1. hook – häälestus

Joonis (`figures.tsx`, silt `nr-kolm-seadet`): kolm kõrvutist skeemi.
Vasakul taskulamp külgvaates lahti lõigatuna, sees läikiv nõgus peegeldi ja
pirn selle keskel. Keskel peegelteleskoop: toru, mille põhjas suur nõgus
peegel, ülalt tulevad paralleelsed kiired. Paremal päikeseahi: suur nõgus
peegel, päikesekiired paralleelselt sisse, ees väike ere plekk. Kõigi kolme
all silt „nõguspeegel".

„Taskulamp mahub taskusse, teleskoop kaalub tonne ja päikeseahi sulatab
terast. Ometi on kõigis kolmes täpselt sama asi: nõgus peegel. Kuidas saab
üks ja sama peegel korraga valgust välja saata ja kokku koguda?"

Eesmärk õpilase keeles: „Oskan seletada, miks taskulambis, teleskoobis ja
päikeseahjus on nõgus peegel – ja miks kiir ikkagi laiali läheb."

### 2. theory – üks peegel, kaks suunda (üks ekraan)

- **Meeldetuletus.** Nõguspeegel on kera SISEMINE pind. Peateljega
  paralleelsed kiired koonduvad peale peegeldumist ühte punkti – fookusesse
  –, mis on poole raadiuse kaugusel peegli tipust (moodul `noguspeegel`).
- **Suund 1: fookusest välja.** Pane valgusallikas fookusesse ja käi
  sama teed tagurpidi: peeglilt lähevad kiired välja peateljega
  PARALLEELSELT. Valgus, mis oleks muidu igasse suunda laiali läinud, läheb
  nüüd ühte suunda. Nii teevad taskulamp, auto esituli ja prožektor.
- **Suund 2: paralleelselt sisse.** Väga kaugelt (Päikeselt, tähelt) tulev
  valgus on peaaegu paralleelne ja koondub peeglilt fookusesse. Kogu suure
  peegli püütud valgus tuleb kokku ühte väikesesse kohta. Nii teevad
  peegelteleskoop, satelliittaldrik ja päikeseahi.
- **Üks lause, mis need kaks kokku seob:** valguse tee on pööratav. Sama
  peegel, sama fookus – vahe on ainult selles, kummast otsast valgus tuleb.
- **Hind: allikas ei ole punkt.** Päris pirnil on suurus (LED-i kiip 2 mm,
  hõõgniit 10 mm) ja Päike paistab taevas kettana. Seepärast ei ole ükski
  vihk päriselt paralleelne ja ükski plekk ei ole päriselt punkt.
  **Mida väiksem allikas ja mida pikem fookuskaugus, seda kitsam kiir.**
- **Mida peegli suurus teeb ja mida ei tee.** Suurem peegel püüab rohkem
  valgust kinni – teleskoop näeb hämaramaid tähti, päikeseahi saab rohkem
  energiat. Kaugele minevat kiirt ta kitsamaks EI tee: peegli läbimõõt
  liidetakse valgusringile juurde, ta ei vähenda lahtiminekut.
  Koondumisega on peenem lugu ja seda ei tohi ühe lausega ära lõigata:
  **tihedus sõltub ainult suhtest läbimõõt : fookuskaugus.** Kui peeglit
  suurendada nii, et fookuskaugus jääb samaks, koondub valgus KÜLL
  tihedamaks (peegel läheb „sügavamaks"). Kui aga suurendada mõlemat
  ühepalju – nagu käib väikese ja suure päikeseahju võrdlus –, jääb tihedus
  täpselt samaks ja kasvab ainult püütud valguse hulk. Just seda vahet
  („kui tihe" vs „kui palju") ajab enamik segi.
- Joonis (`nr-kaks-suunda`): kaks korrust kõrvuti, mõlemal sama nõgus
  peegel. Ülemisel on fookuses pirn ja kiired lähevad paralleelselt paremale
  (nooled väljapoole); alumisel tulevad paralleelsed kiired paremalt
  (nooled sissepoole) ja koonduvad fookusesse. Fookus on mõlemal märgitud
  sama sildiga; noolte suund on ainus vahe. Kiirte suund on eristatud nii
  noolte kui ka joonemustriga.

### 3. predict – hüpotees (lukustub!)

„Kaks taskulampi on täpselt ühesugused: sama peegel, sama fookuskaugus.
Ainus vahe on pirnis – ühes on 2 mm LED-kiip, teises 10 mm hõõgniit.
Kumma valgusring on 20 m kaugusel seinal kitsam?"

(a) **LED-lambi oma – väiksem allikas annab kitsama kiire**
(b) hõõgpirni oma – suurem pirn annab tugevama ja seega kitsama kiire
(c) mõlemad on ühesugused, sest peegel on sama

+ „Miks sa nii arvad?" (vabatekst).

Õige on (a). Vastust EI avaldata enne sammu 4.

Vale (b) saab sildi `suurem-allikas-kitsam-kiir`, vale (c) sildi
`peegel-maarab-koik`.

### 4. explore – simulatsioon

SVG **külgvaade** prožektorile. Vasakul nõgus peegel (läbimõõt 10 cm – see
on ekraanil kirjas ja EI muutu), peatelg katkendliku joonena. Fookuses on
pirn, mille suurus on liuguriga muudetav; fookuse koht on märgitud ja liigub
raadiuse muutmisel koos pirniga (pirn on ALATI fookuses – see on ekraanil
kirjas). Paremal 20 m kaugusel sein, mille peal on valgusring mõõdujoone ja
arvuga.

Ekraanil on korraga kaks asja: **päris vihk** (allika suurusega, laieneb) ja
õhem **ideaalne vihk** (punktallikas, jääb peegli laiuseks) – eri värvi JA
eri joonemustriga, mõlemal oma silt. Vahe nende kahe vahel ongi mooduli
„hind" ja ta peab olema näha, mitte ainult arvudes.

Kastikesed:

- „Peegli läbimõõt 10 cm · sein 20 m kaugusel · pirn on alati fookuses"
- „Fookuskaugus **10 cm**"
- „Valgusring seinal: **0,5 m**"
- „Ideaalse punktallikaga oleks: **0,1 m**"

Juhtnupud (kaks korraga, moodulilepingu järgi):

- **liugur: peegli kõverusraadius R** – 20…60 cm, samm 2 cm (algväärtus
  20 cm ehk fookuskaugus 10 cm). Alumine piir 20 cm ei ole ilutunne:
  seal on fookuskaugus täpselt peegli läbimõõdu jagu (f = D = 10 cm) ja
  sügavamal peeglil ei kehti enam kerapinna lähendus, mille peale kogu
  mudel ehitatud on (vt idealiseering 1). Algväärtus on seega liuguri
  alumises otsas – ainus suund, kuhu liikuda, teeb peegli lamedamaks.
- **liugur: pirni suurus s** – 1…20 mm, samm 1 mm (algväärtus 2 mm ehk
  LED-kiip). Mõlemad algväärtused on liuguri võre peal, seega saab õpilane
  alati alguskoha tagasi.

Tolerantsid ja ühikud: valgusringi läbimõõt **m**, tolerants **0,2 m**
(ekraanil on arv ühe kohaga peale koma); suhtarv ühikuta, tolerants **1**;
valgusplekk **mm**, tolerants **0,5 mm**. Simulatsioon on ideaalne, seega on
need LUGEMISTOLERANTSID, mitte mõõtemääramatus.

Ülesanded:

1. „Jäta R = 20 cm ja pirni suurus 2 mm. Kui lai on valgusring 20 m
   kaugusel seinal?" (0,5 m; tolerants 0,2 m; ühik m; vihje 1: „vaata
   mõõdujoont seina peal"; vihje 2: „arv on kastikeses „Valgusring
   seinal"")
2. „Vaheta pirn suuremaks: sea suuruseks 10 mm (hõõgniit). Kui lai on
   valgusring nüüd?" (2,1 m; tolerants 0,2 m; ühik m)
   Selgitus pärast vastamist: 2,1 m : 0,5 m ≈ **4 korda** laiem – ja peegel
   on täpselt sama. Kiirt ei tee kitsaks peegel, vaid väike allikas.
3. „Sea pirn 2 mm peale tagasi ja lohista raadius 60 cm peale – peegel
   läheb lamedamaks ja fookus kaugemale. Mis juhtub valgusringiga?"
   (valik) (a) läheb laiemaks, sest lamedam peegel koondab vähem
   (b) **läheb kitsamaks: 0,5 m pealt 0,23 m peale** (c) ei muutu, sest
   pirn on ikka fookuses.
   Selgitus: mida kaugemal fookus on, seda väiksema nurga alt sama suur
   pirn peeglilt paistab – ja seda vähem läheb vihk laiali. Kitsast kiirt
   tahtev prožektor tehakse seepärast pikk, mitte sügav.
   Vale (a) saab sildi `lamedam-peegel-laiem-kiir`.
4. „Jäta raadius 60 cm ja sea pirni suurus 1 mm. Mitu korda kitsam on
   valgusring kui esimeses ülesandes (0,5 m)?" (3; tolerants 1; ühikuta;
   vihje 1: „jaga esimese ülesande arv uue arvuga"; vihje 2: „0,5 m ja
   0,17 m")
   Selgitus: väikseim pirn ja pikim fookus koos annavad kõige kitsama
   kiire – ja isegi siis on valgusring 20 m kaugusel umbes poolteist korda
   laiem kui peegel ise. Päriselt paralleelset kiirt ei ole olemas.

### 5. practice – harjutamine

1. **Näidis (lahendatud):** Päikeseahju peegli läbimõõt on 1 m ja
   fookuskaugus 1 m. Miks tekib fookuses nii kuum koht?
   Päike ei ole punkt: ta paistab taevas 0,533° laiuse kettana, seega
   koondub tema valgus mitte punkti, vaid **9,3 mm** laiusesse plekki.
   Peeglile langeb valgust 1 m laiuselt ringilt ja kogu see valgus surutakse
   sellesse plekki: 1 m : 0,0093 m = 108 korda väiksem läbimõõt, seega
   pindala 108² ehk umbes **11 500 korda** väiksem. Sama palju kordi
   tihedamaks valgus koondub – ja nii tuleb temperatuur, mis sulatab metalli.
2. **Osaline (täida lünk):** Sama peegli asemel võetakse kaks korda pikema
   fookuskaugusega peegel (D = 1 m, f = 2 m). Valgusplekk on nüüd kaks
   korda laiem ehk 18,6 mm. Mitu korda tihedamaks valgus koondub?
   1 : 0,0186 = 54 ja 54² = ___ (vastus 2889; tolerants 200; ühikuta;
   vihje: „korruta 54 iseendaga")
   Selgitus: kaks korda pikem fookus tähendab kaks korda laiema plekki ja
   NELI korda väiksemat tihedust. Sellepärast on päikeseahju peegel sügav,
   mitte lame.
3. **Iseseisev (valik):** Kaks päikeseahju: ühe peegel on 1 m lai ja
   fookuskaugus 1 m, teise peegel 10 cm lai ja fookuskaugus 10 cm. Kummas
   koondub valgus TIHEDAMAKS?
   (a) suures – suurem peegel koondab alati tihedamalt
   (b) **kummaski ei ole tihedam: mõlemal on sama suhe D : f, seega sama
       koondumistegur ≈ 11 500 korda. Suur peegel püüab lihtsalt palju
       rohkem valgust kinni, seega on tema plekk võimsam, mitte tihedam**
   (c) väikeses, sest väiksem plekk on alati tihedam.
   Vale (a) saab sildi `suurem-peegel-koondab-tihedamalt`, vale (c) sildi
   `vaiksem-plekk-tihedam`.
   Selgitus: tihedus tuleb suhtest D : f, võimsus peegli PINDALAST. Kaks eri
   asja, mida sageli segi aetakse.
4. **Iseseisev (valik):** Miks ei ole ühegi taskulambi kiir päriselt
   paralleelne, isegi kui pirn on täpselt fookuses?
   (a) sest peegel ei ole kunagi päris puhas
   (b) **sest pirnil on suurus – ta ei ole punkt, ja iga tema punkt annab
       veidi eri suunda mineva kimbu**
   (c) sest valgus väsib pika tee peal ära.
   Vale (c) saab sildi `valgus-vasib`.
5. **Ülekanne (valik, mitu õiget):** Kuhu sobib **nõgus** peegel?
   **taskulambi peegeldiks, mis peab valgust ühte suunda saatma**,
   **peegelteleskoobi peapeegliks, mis kogub tähe valgust kokku**,
   **hambaarsti peeglisse, mis näitab hammast suuremana**,
   poe koridori nurka, kus müüja tahab tervet vahekäiku korraga näha,
   auto külgpeegliks, mis peab näitama tervet kõrvalrida.
   `shuffle: true`. Vale „poe koridor" saab sildi `nogus-annab-laia-vaate`,
   vale „auto külgpeegel" sama sildi.
   Selgitus pärast vastamist: nõguspeegel koondab – ta saadab valgust ühte
   suunda, kogub seda kokku ja suurendab lähedalt vaadates. Kus on vaja
   LAIA VAATEVÄLJA, seal on vaja kumerpeeglit; seda vaatasime eraldi
   moodulis.

### 6. exit – väljumispilet

1. Miks on taskulambis nõgus peegel?
   (a) et pirn oleks kaitstud
   (b) **et pirni valgus, mis muidu läheks igasse suunda, läheks peeglilt
       tagasi ühte suunda – pirn on peegli fookuses**
   (c) et pirn paistaks suurem
2. Peegli fookuskaugus on 50 cm. Päikese valgusplekk on tema fookuses
   4,7 mm lai. Kui lai oleks plekk kaks korda pikema fookuskaugusega
   peeglil? (9,3 mm; tolerants 0,5 mm; ühik mm; vihje: „plekk kasvab
   fookuskaugusega võrdeliselt")
3. „Sõber ütleb: „Ostan endale suurema taskulambi, siis ulatub kiir
   kaugemale ja jääb kitsam." Mis sa talle vastad?" (vabatekst, õpetajale
   nähtav – oodatav mõte: suurem peegel püüab rohkem valgust kokku, seega
   kiir on eredam, aga kitsamaks ta sellest ei lähe. Kiire laiuse otsustab
   pirni suurus ja fookuskaugus: väike LED ja pikk fookus annavad kitsa
   kiire, suur peegel annab lihtsalt laiema ja eredama vihu.)

## Väärarusaamad

| Silt | Väärarusaam | Kuidas moodul selle ümber lükkab |
|---|---|---|
| `suurem-allikas-kitsam-kiir` | suurem või võimsam pirn annab kitsama kiire | predict + explore-2: sama peegliga annab 10 mm niit neli korda laiema ringi kui 2 mm LED |
| `peegel-maarab-koik` | kiire laius sõltub ainult peeglist, allikas ei loe | explore-1 ja -2: peegel on kogu aeg sama, ainus muutus on pirn |
| `lamedam-peegel-laiem-kiir` | mida lamedam peegel, seda laiem kiir („koondab vähem") | explore-3: R = 60 cm juures kahaneb ring 0,5 m pealt 0,23 m peale – pikem fookus hoiab kiirt paremini koos |
| `suurem-peegel-kitsam-kiir` | suurem peegel annab kaugel kitsama valgusringi | teooria „mida peegli suurus teeb" + exit-3; mudelis on D valemis liidetavana, mitte lahtimineku sees |
| `suurem-peegel-koondab-tihedamalt` | suurem peegel koondab valgust alati tihedamalt | practice-3: 10 cm ja 1 m peegel sama suhtega annavad sama koondumisteguri |
| `vaiksem-plekk-tihedam` | väiksem plekk tähendab alati tihedamat valgust | practice-3: võrrelda tuleb plekki PEEGLIGA, mitte teise plekiga |
| `paike-on-punkt` | Päikese valgus koondub ühte punkti | practice-1: 0,533° ketas annab 1 m fookusega peeglil 9,3 mm plekki |
| `nogus-annab-laia-vaate` | nõguspeegel annab laia vaatevälja (segi kumerpeegliga) | practice-5, kus poe turvapeegel ja auto külgpeegel on valed vastused |
| `valgus-vasib` | valgus „väsib" või aeglustub pika tee peal ja seepärast vihk hajub | practice-4: hajumise põhjus on allika suurus, mitte tee pikkus |
| `peegel-teeb-valgust-juurde` | peegel lisab valgust juurde | teooria „suund 1": peegel ainult suunab ümber selle valguse, mis pirnist niikuinii välja tuleb |

## Õpetajale (teacher.ts)

- **(K) taskulambi peegeldi lahtivõtmine (5 min):** võtke odav taskulamp
  lahti ja laske õpilastel peegeldit käes hoida. Küsige, kus pirn peegli
  suhtes asub (fookuses) ja mis juhtuks, kui ta oleks kaugemal või lähemal.
  Mõnel taskulambil saab pea keerates pirni nihutada – see ongi „zoom":
  fookusest välja nihkunud pirn annab laia hajuva laigu. **Mudel seda ei
  arvuta** (nihutatud allikas nõuab peeglivalemit, mis on gümnaasium),
  seega jääb see katse teadlikult klassi, mitte ekraanile.
- **(K) päikese koondamine (õues, 10 min):** nõguspeegli või suure luubiga
  koondage päikesevalgus paberile ja mõõtke tekkiva heleda plekki läbimõõt.
  Võrrelge simulatsiooni valemiga: plekk ≈ fookuskaugus · 0,0093.
  **OHUTUS on siin kohustuslik osa, mitte lisa:** ei kunagi silma ega
  teise inimese poole; ainult täiskasvanu juuresolekul; põleva paberi jaoks
  ämber vett või liiva kõrvale; katse käib õues, mitte klassis; peegel
  pannakse pärast katset kohe varju või kaetakse, sest unustatud peegel
  süütab edasi. Alla 10-aastaste või rahutu rühmaga tehke seda ainult
  demonstratsioonina.
- **Miks päris peegel on parabool:** kerapeeglil ei koondu servadelt
  tulevad kiired täpselt samasse punkti. Mida sügavam peegel, seda rohkem
  see paistab. Prožektori, teleskoobi ja päikeseahju peeglid on seepärast
  paraboolid. 8. klassi joonis ja selle mooduli mudel on kerapinnaga –
  näidake seda õpilastele kui kohta, kus lihtne mudel otsa saab, mitte kui
  viga.
- **Seos kumerpeegliga:** see moodul ja `kumerpeegli-rakendused` on
  teineteise peegelpildid. Kumer hajutab: lai vaateväli, väike kujutis.
  Nõgus koondab: kitsas kiir või ere plekk, aga peegel peab olema täpselt
  suunatud. Kui mõlemad moodulid on tehtud, sobib tunni lõppu üks küsimus:
  „Kumb peegel kuhu ja miks?"
- **Aruteluküsimused:** Miks on autotulel lisaks peeglile ka klaas
  triipudega? (Peegel annab kitsa kiire, klaas jaotab valguse teele laiali
  ja hoiab ta vastutulija silmist eemal.) Miks on suurte teleskoopide
  peeglid nii suured, kui koondumistegur suurusest ei sõltu? (Et kokku
  koguda ROHKEM valgust – hämarad tähed.) Miks satelliittaldrik ja
  päikeseahi peavad olema täpselt suunatud? (Fookusesse jõuab ainult see
  valgus, mis tuleb peateljega paralleelselt.) Mis juhtuks, kui prožektori
  pirn läheks fookusest välja?
- **Millal see moodul tunnis:** kohe PÄRAST moodulit `noguspeegel` – see on
  sama tunni teine pool. Kui aega on vähe, sobib ta ka koduseks tööks: uut
  füüsikat siin ei ole, on ainult ülekanne. Mooduli
  `kumerpeegli-rakendused` läbimine ei ole eelduseks, aga practice-5
  viimased kaks valikut on lihtsamad, kui ta on tehtud.
- **Tunniplaan (15 min):** 2 min hook + 3 min teooria · 1 min hüpotees ·
  5 min simulatsioon · 3 min harjutamine · 1 min väljumispilet.
  45-minutilises tunnis mahub ette moodul `noguspeegel` ja lõppu päikese
  koondamise katse õues.

## Kordamiskaardid (5 tk)

| id | tüüp | küsimus | vastus |
|---|---|---|---|
| rc-1 | transfer | Miks on taskulambis ja auto esitules nõgus peegel? | Pirn on peegli fookuses, seega läheb tema valgus peeglilt tagasi peateljega paralleelselt – valgus, mis oleks muidu igasse suunda laiali läinud, läheb ühte suunda |
| rc-2 | concept | Mis juhtub nõguspeeglile langeva paralleelse valgusvihuga? | Ta koondub fookusesse, mis on poole kõverusraadiuse kaugusel peegli tipust. Nii töötavad peegelteleskoop, satelliittaldrik ja päikeseahi |
| rc-3 | explain | Miks ei ole ükski taskulambi kiir päriselt paralleelne? | Sest pirn ei ole punkt. Igast pirni punktist tuleb veidi eri suunda minev kimp, seega läheb vihk kaugusega laiali. Mida väiksem pirn ja mida pikem fookuskaugus, seda kitsam kiir |
| rc-4 | calc | Peegli fookuskaugus on 1 m. Kui lai on Päikese valgusplekk tema fookuses? | Umbes 9,3 mm (Päike paistab 0,533° laiuse kettana, mitte punktina) |
| rc-5 | transfer | Kumb peegel sobib taskulampi ja kumb poe koridori nurka? | Taskulampi nõguspeegel (koondab valguse ühte suunda), koridori nurka kumerpeegel (lai vaateväli, aga kõik paistab väiksemana) |
