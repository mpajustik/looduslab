# Mooduli spetsifikatsioon: Kumerpeegel meie ümber

Ainekava seos (AINEKAVA-fyysika-8.md): plokk P1; õpitulemus: P1-T2 (osa:
kumerpeegli ülekanne päris seadmetesse – liikluspeegel, turvapeegel, auto
külgpeegel); mõisted, mida õpetab: – (rakendusmoodul, kasutab moodulist
`kumerpeegel` tulnud mõistet **kumerpeegel**); praktiline töö: –.
Vanus: 8. klass. Kestused: demo 5 min, tund 15 min, iseseisev 12 min.
Tüüp: rakendusmoodul (üks õpieesmärk, 6 sammu).

slug: `kumerpeegli-rakendused` · id: `physics.kumerpeegli-rakendused`

## Ainekava seos (täpsemalt)

- **Plokk:** P1 Valgus ja valguse sirgjooneline levimine. Peegeldumine ja
  neeldumine
- **Õpitulemused:**
  - **P1-T2 osa** – „tunneb valguse sirgjoonelise levimise ja peegeldumise
    seadust, konstrueerib nende põhjal jooniseid ja korraldab katsed".
    Siin ei tule uut seadust ega uut joonist: moodul `kumerpeegel` andis
    kiirte käigu ja näilise fookuse, see moodul kannab sama üle kolme päris
    seadmesse ja vastab küsimusele, MIKS need seadmed kumerad on.
- **Õppesisu punktid:** „peegeldumisseadus; tasapeegel, kumer- ja
  nõguspeegel" – kumerpeegli osa rakenduslik pool
- **Põhimõisted, mida moodul ÕPETAB:** – (rakendusmoodul ei oma ühtki
  põhimõistet; **kumerpeegel** kuulub moodulile `kumerpeegel`, **fookus**
  moodulile `noguspeegel`. Sõnu „vaateväli" ja „pimeala" moodul kasutab ja
  seletab, aga ainekava põhimõistete loendis neid ei ole, seega manifesti
  `concepts` väli jääb TÜHJAKS)
- **Praktiline töö:** – (P1-PT1…PT4 on kõik juba teiste moodulite all)
- **Teema olulisus → hook:** „igapäevased valgusnähtused looduses ja
  tehnikas" ning „seos … erialadega" – ristmiku liikluspeegel ja auto
  külgpeegli kiri „esemed on peeglis lähemal kui nad paistavad" on kaks
  asja, mida iga õpilane on näinud, aga mis tunduvad esmapilgul
  vastukäivad: üks peegel näitab ROHKEM, teine PETAB.
- **Metoodilised soovitused, mida järgin:** ainekava nõuab, et
  peegeldumisseadust käsitletaks „läbi jooniste eri olukordades
  (nurkpeegel, periskoop, matt- ja **kumerpind**)". Selles moodulis on
  kumerpind päris olukorras: simulatsioon on ülalt vaade poe vahekäigule,
  kus mõõdetakse, kui lai lõik peeglisse mahub.
- **Õpilase tegevused:** (D) võrdleb simulatsioonis sama suure tasa- ja
  kumerpeegli vaatevälja ning loeb, kui lai ala kummastki paistab;
  (D) loeb joonisel ristmiku vaatevälja ja otsustab, milline auto on
  peeglis näha; (K) päris turvapeegli või liikluspeegli juures mõõtmine ja
  auto külgpeeglite võrdlus õpetajajuhendis

## Piirid (mida see moodul EI tee)

- **Kiirte käik ja näiline fookus** – moodul `kumerpeegel` (juba ehitatud).
  Siin on need EELDUS: teooria kordab tulemuse kahe lausega („kumer pind
  hajutab", „näiline fookus on poole raadiuse kaugusel peegli taga") ja
  edasi kasutab. Ühtegi uut fookuseülesannet siin ei ole – kes fookuse
  arvutamist harjutada tahab, teeb eelmise mooduli uuesti.
- **Kujutise suuruse ARVUTAMINE** (mitu korda väiksemana ese peeglis
  paistab, valem V = f / (f − a) või 1/a + 1/b = −2/R) – gümnaasium.
  See moodul ütleb „esemed paistavad väiksemad" ja seletab TAGAJÄRJE
  (kaugus tundub suurem), aga ei arvuta suurendust ega kujutise kohta.
  Ükski ülesanne ei nõua ühtegi negatiivset pikkust.
- **Nõguspeegli rakendused** (meigipeegel, taskulambi peegeldi,
  peegelteleskoop, päikeseahi) – moodul `noguspeegli-rakendused`. Siin on
  nõguspeegel ainult vale valikvastus kohas, kus õpilane peab valima, KUMB
  peegel kuhu sobib.
- **Liiklusõpetus** (pimeala kontrollimise kord, peeglite reguleerimine,
  ohutu möödasõit) – see ei ole füüsika. Pimeala mainitakse ühe lausega
  seal, kus ta on kumerpeegli otsene tagajärg (lai vaateväli vähendab
  pimeala), ja õpetajajuhend ütleb ohutuse kohta oma sõna. Ülesandeks teda
  ei tehta.
- **Asfäärilised ja kombineeritud peeglid** (auto külgpeegel, mille
  sisemine osa on tasane ja välimine kumer; „aspherical" kiri peeglil) –
  õpetajajuhendis üks lõik, rakenduses mitte. Mudel oskab ainult kerapinda
  ja peegel, mille kõverus muutub, ei ole enam üks R.
- **Vaatevälja arvutamine peast** – vaatevälja nurga valem sisaldab
  arkussiinust ja arkustangensit, mida 8. klassis ei ole. Arvud tulevad
  ekraanilt (simulatsioon arvutab); õpilase enda arvutused on ainult
  JAGAMINE („mitu korda laiem") ja KORRUTAMINE. See on teadlik otsus, mitte
  mugavus: mooduli õpieesmärk on ülekanne, mitte trigonomeetria.
- **Peegli nurk seinaga.** Päris poes on turvapeegel nurga all. Simulatsioon
  vaatab peeglit otse ja see EI ole vaikne lihtsustus: peegli pööramine
  muudab seda, KUHU vaateväli osutab, mitte seda, kui LAI ta on. Nii on ka
  simulatsioonis kirjas.

## Allikad

- **Teooria tugi:** `sisu/allikad/OPIK-F8-INDEKS.md` ptk 1.12 „Kumer- ja
  nõguspeegel" (lk 42–45) – faktikontroll: kumerpeegli lai vaateväli ja
  väiksem kujutis. Sama peatükk oli aluseks moodulile `kumerpeegel`;
  siinne rakenduste loend (liikluspeegel, poe turvapeegel, auto
  külgpeegel, bussipeegel) ja kõik arvud on selle mooduli omad.
  Sõnasõnalist teksti ei kopeerita (vt ALLIKAD.md).
- **Ülesannete näidised:** – (kõik arvud tulevad model.ts geomeetriast;
  auto külgpeegli hoiatuskiri on üldteada tekst, mitte allikast võetud
  ülesanne)

## Füüsika (model.ts jaoks)

Moodul arvutab ühte asja: **kui lai ala ühte peeglisse korraga mahub**.
Kogu ülejäänu (miks kiired hajuvad, kus on näiline fookus) tuli juba
moodulist `kumerpeegel` – siin on selle TAGAJÄRG arvudes.

Kõik pikkused mudeli sees on **meetrites**, nurgad **kraadides** (sama
kokkulepe kui `kumerpeegel` ja `noguspeegel`). UI räägib peegli ja vaataja
mõõtudest sentimeetrites ja vaadeldava ala laiusest meetrites – ühik muutub
ainult teisendusfunktsioonides.

### Telgistik ja tähised

- Peegel on seinal, **peatelg** on seinaga risti. Peegli tipp on nullpunkt,
  kera keskpunkt on peegli TAGA kaugusel R (nagu moodulis `kumerpeegel`).
- `radiusM` (R) – kera raadius, mille pinnast peegel välja lõigatud on.
- `apertureM` (a) – peegli **poolläbimõõt** ehk kaugus peatelje ja peegli
  serva vahel. 30 cm läbimõõduga turvapeeglil on a = 15 cm.
- `eyeDistanceM` (d) – vaataja silma kaugus peegli tipust, peateljel.
- `distanceM` (L) – kaugus peeglist, kus mõõdame nähtava ala laiust
  (poes: vahekäigu kaugus; ristmikul: ristuva tee kaugus).

### Kust vaatevälja valem tuleb

Vaatevälja serva määrab kiir, mis peegeldub peegli SERVAST vaataja silma.
Serval on ristsirge kera raadiuse siht, seega teeb ta peateljega nurga

- **θ = arcsin(a / R)** – täpselt sama nurk, mille moodul `kumerpeegel`
  arvutab funktsiooniga `normalAngleDeg`.

Serva punkt on tipust `bulge = R − √(R² − a²)` võrra tahapoole nihkunud
(sama valem, mis `mirrorBulge`), seega teeb silma minev kiir peateljega
nurga

- **φ = arctan(a / (d + bulge))**.

Peegeldumisseaduse tõttu (langemisnurk = peegeldumisnurk, mõlemad ristsirge
suhtes) tuleb see kiir peeglile suunast, mis on peateljest **φ + 2θ** võrra
kaldu. Sama kehtib teisel serval teistpidi, seega on kogu vaatevälja nurk

> **vaatevälja nurk = 2 · (2θ + φ)**

Tasasel peeglil on kera raadius lõpmatu ehk θ = 0 ja bulge = 0, seega jääb
alles ainult **2φ = 2 · arctan(a / d)**. **Sama valem, üks liige vähem** –
see ongi kogu mooduli füüsika ühes reas: kumer pind lisab vaateväljale
liikme 4θ, mis ei sõltu üldse sellest, kui kaugel vaataja seisab.

Nähtava ala laius kaugusel L. **Siin on kerge eksida** (ja seda tehti selle
spetsi esimeses versioonis): vaatevälja koonus EI alga peegli tipust, vaid
peegli **servadest** – peegel ise on 2a lai ja äärmine kiir väljub serva
punktist, mis on peateljest a kaugusel ja tipust `bulge` võrra taga. Seega:

> **laius = 2 · (a + (L + bulge) · tan(vaatevälja nurk / 2))**

Peegli oma laius 2a on selles alati sees. Kontroll: kaugusel L = 0 annab
valem peegli enda laiuse – peeglisse ninapidi kinni vajutades näedki
täpselt peegli suurust. **Tasapeeglil tuleb see täpselt 2a = 30 cm;
kumeral veidi rohkem (0,309 m), sest äärmine kiir väljub serva punktist,
mis on tipust `bulge` võrra taga, ja teeb selle nihke jooksul juba veidi
laiemaks.** Ümmargune 2a kehtib ainult tasapeeglil – seda ei tohi kumera
peegli kohta ümber kirjutada.

Tasapeeglil on bulge = 0 ja tan(nurk / 2) = a / d, seega taandub see ühte
murdu:

> **tasapeegli laius = 2 · a · (d + L) / d**

Näiteks 30 cm peegel, vaataja 2 m kaugusel, vahekäik 5 m kaugusel:
2 · 0,15 · 7 / 2 = **1,05 m**. Tipust arvutades tuleks 0,75 m ehk peegli
enda laiuse võrra liiga vähe – see ongi see viga, mida CodeRabbit
sammus 4.1rr püüdis.

### Funktsioonid

- `mirrorBulge(radiusM, apertureM)` → **R − √(R² − a²)**. Peegli serva nihe
  tipust tahapoole.
- `viewAngleDeg(radiusM, apertureM, eyeDistanceM)` → **2 · (2θ + φ)**
  kraadides, kumerpeegli vaatevälja täisnurk.
- `flatViewAngleDeg(apertureM, eyeDistanceM)` → **2 · arctan(a / d)**
  kraadides. Sama suure TASASE peegli vaatevälja täisnurk – võrdlusarv,
  ilma milleta ei ole kumerpeegli number midagi väärt. Raadiust ta ei võta,
  sest tasasel peeglil seda ei ole.
- `convexViewWidth(radiusM, apertureM, eyeDistanceM, distanceM)` →
  **2 · (a + (L + bulge) · tan(2θ + φ))**, kumerpeeglis nähtava ala laius
  meetrites kaugusel L.
- `flatViewWidth(apertureM, eyeDistanceM, distanceM)` →
  **2 · a · (d + L) / d**, sama suure tasapeegli oma. Raadiust ta ei võta.
  Kaks eraldi laiusefunktsiooni (mitte üks, mis võtab nurga) just
  sellepärast, et nurgast üksi laiust välja ei tule – peegli enda laius
  peab olema sees ja tema kohta nurk midagi ei ütle.
- `metresFromCentimetres(lengthCm)` → lengthCm / 100 ja
  `centimetresFromMetres(lengthM)` → lengthM · 100. **Ainsad kaks kohta
  mooduli sees, kus pikkuse ühik muutub** (sama reegel ja sama põhjus mis
  moodulites `kumerpeegel`, `noguspeegel` ja `vedeliku-rohk`: möödaminnes
  vahetatud ühik annab vaikse 100-kordse vea).

### Miks EI ole see mooduli `kumerpeegel` mudeli taaskasutus

`mirrorBulge` ja nurk θ on kirjas juba moodulis `kumerpeegel`. Neid EI
impordita: moodulid laaditakse dünaamiliselt ja iga moodul on oma tükk
(raudne reegel 13) – ristimport tõmbaks ühe mooduli teise bundle'isse ja
seoks kaks arhiveeritavat üksust kokku (reegel 11). Sama otsus ja sama
põhjendus on failis MOODUL-varjutused.md mooduli `vari-ja-poolvari` suhtes.

Kordus on väike (kaks rida geomeetriat) ja teda valvab **ristkontrolli
test**: mõlema mooduli funktsioonid peavad samadel sisenditel andma sama
arvu. See test on TESTIS, mitte rakenduse koodis.

### Idealiseeringud (peavad olema model.ts kommentaaris kirjas)

1. **Vaataja silm on punkt peateljel.** Päris müüja seisab kõrval ja tema
   vaateväli on veidi nihkes; laius jääb sama, suund muutub.
2. **Äärmine kiir väljub peegli servast**, mitte tipust – see EI ole
   idealiseering, vaid valemis sees (vt laiuse tuletust). Idealiseering on
   see, et serva punkt võetakse täpselt kõrguselt a: päris peegli serv on
   kaarjas ja peeglil on raam.
3. **Peegel on kerapinna osa** ja kogu peegli ulatuses sama kõverusega.
   Päris auto külgpeegel on sageli asfääriline (servas kumeram) – siis ei
   ole ühte R-i ja see mudel teda ei kirjelda.
4. **Peegel peegeldab kogu valguse** ja peegli enda paksust ei arvestata.
5. **Kõik on ühes tasapinnas** (ülalt vaade). Päris peegel on ümar ja tema
   vaateväli on koonus – laius kõrgussuunas tuleb sama valemiga, aga seda
   moodul ei kuva.

**Testiväärtused (teadaolevad):** argumendid koodikujul (kümnendpunkt),
tulemused eestikeelse kümnendkomaga. Pikkused meetrites, nurgad kraadides.
Enamik ridu kasutab poolläbimõõtu a = 0,15 m ehk 30 cm läbimõõduga peeglit –
see on **simulatsiooni vaikeväärtus**, mitte mudeli piirang. Osa ridu
kasutab meelega teisi mõõte (a = 0,5 m, a = 0,6 m, a = 0,9 m): mudel peab
vastama õigesti ka väljaspool liuguri vahemikku ja just seal on piirid.

| Kutse | Tulemus |
|---|---|
| `mirrorBulge(1, 0.15)` | 0,011314 |
| `mirrorBulge(1, 0.6)` | 0,2 (ümmargune arv: 3-4-5 kolmnurk) |
| `mirrorBulge(1, 0)` | **viskab vea** (peeglil peab olema laius) |
| `viewAngleDeg(1, 0.15, 2)` | 43,038 |
| `viewAngleDeg(2, 0.15, 2)` | 25,759 (lamedam peegel – kitsam vaateväli) |
| `viewAngleDeg(1, 0.15, 1)` | 51,381 (vaataja lähemal – laiem vaateväli) |
| `viewAngleDeg(1, 0.15, 5)` | 37,937 |
| `viewAngleDeg(3, 0.15, 5)` | 14,898 |
| `flatViewAngleDeg(0.15, 2)` | 8,578 |
| `flatViewAngleDeg(0.15, 5)` | 3,437 |
| `flatViewAngleDeg(0.15, 1)` | 17,062 |
| `flatViewAngleDeg(0.5, 0.5)` | 90 (silm täpselt peegli serva sihis) |
| `flatViewWidth(0.15, 2, 5)` | **1,05** (täpne arv) |
| `flatViewWidth(0.15, 5, 5)` | **0,6** (täpne arv) |
| `flatViewWidth(0.15, 2, 0)` | **0,3** (peegli enda laius) |
| `flatViewWidth(0.5, 1, 3)` | **4** (täpne arv) |
| `convexViewWidth(1, 0.15, 2, 5)` | **4,252** |
| `convexViewWidth(1, 0.15, 5, 5)` | 3,745 |
| `convexViewWidth(3, 0.15, 2, 5)` | 2,067 (lamedam peegel – kitsam ala) |
| `convexViewWidth(0.8, 0.15, 0.5, 5)` | 8,100 (liuguri kõige laiem seis) |
| `convexViewWidth(1, 0.15, 2, 0)` | 0,309 (peeglil ninapidi kinni) |
| `centimetresFromMetres(mirrorBulge(1, 0.15))` | 1,1314 |

Piirjuhud ja invariandid:

- **Kumer võidab alati:** `viewAngleDeg(R, a, d)` >
  `flatViewAngleDeg(a, d)` iga lubatud R, a, d korral. Test käib tsükliga
  üle kümnete kolmikute. See on kogu mooduli väide ja peab olema testis,
  mitte ainult tekstis.
- **Lamedam peegel = kitsam vaateväli:** R kasvades `viewAngleDeg` kahaneb
  ja läheneb `flatViewAngleDeg` väärtusele. Test: R = 10 000 m juures
  erinevad kaks arvu vähem kui 0,01°.
- **Kumer võidab ka laiuses:** `convexViewWidth(R, a, d, L)` >
  `flatViewWidth(a, d, L)` iga lubatud nelikuga (sama tsükkel kui nurkadel).
- **Peegli enda laius on alati sees:** mõlemad laiusefunktsioonid annavad
  L = 0 juures peegli laiuse. Tasapeeglil täpselt 2a; kumeral veidi rohkem
  (0,309 m 0,3 m asemel), sest äärmine kiir väljub serva punktist, mis on
  tipust `bulge` võrra taga. **See test ongi selle mooduli päris vea vastu
  pandud lõks** – tipust arvutav valem annaks siin nulli.
- **Suur R viib kumera laiuse tasapeegli omale:**
  `convexViewWidth(10000, 0.15, 2, 5)` = 1,0503 ehk erineb
  `flatViewWidth(0.15, 2, 5)` = 1,05 väärtusest alla 0,1 %.
- **Ristkontroll mooduliga `kumerpeegel`:** test võrdleb `mirrorBulge` ja
  nurga θ mõne R ja a paari juures mooduli `kumerpeegel` funktsioonidega
  `mirrorBulge` ja `normalAngleDeg` ning nõuab võrdust. **Ainus koht, kus
  selle mooduli testid teist moodulit puudutavad.**
- **Vaataja kaugus mõjub ainult φ liikmele:** kui d → väga suur, läheneb
  `viewAngleDeg` väärtusele 4θ (`viewAngleDeg(1, 0.15, 100000)` ≈ 34,508)
  ja `flatViewAngleDeg` läheneb nullile.
- **Kumera eelis kasvab kaugusega (explore-4 tulemus):** suhe
  `convexViewWidth / flatViewWidth` (R = 1 m, a = 0,15 m, L = 5 m) on
  d = 0,5 m juures 2,1 · d = 1 m juures 2,8 · d = 2 m juures 4,0 ·
  d = 5 m juures 6,2. Test nõuab, et suhe kasvab d kasvades monotoonselt –
  see on lause „mida kaugemal vaataja, seda rohkem kumerpeegel võidab"
  ainus tõestus ja ta peab olema testis, mitte ainult tekstis.
- **Simulatsiooni turvavöönd:** liuguritega on a / R ≤ 0,1875 (a = 15 cm,
  R = 80…300 cm) ja d = 50…500 cm. Selles vöötsis on
  - peegli serva nihe kõige rohkem **1,42 cm** (R = 80 cm) – mitte 1,1 cm,
    mis kehtib ainult algväärtusel R = 100 cm;
  - vaatevälja täisnurk vahemikus **14,9°** (R = 300 cm, d = 500 cm) kuni
    **75,8°** (R = 80 cm, d = 50 cm), poolnurk seega alati alla 38° ehk
    kaugel valemi 90° piirist.

  Test käib kogu liugurivõre läbi ja nõuab, et `viewAngleDeg` jääb
  vahemikku 0…90° ja `convexViewWidth` on positiivne ja lõplik – nii ei saa
  keegi hiljem liuguri piire muutes vaikselt mõttetut arvu ekraanile tuua.
  (Esimeses versioonis olid siin arvud „alla 60°" ja „alla 1,2 cm", mis
  kehtisid ainult liuguri keskkohas – CodeRabbiti leid, samm 4.1rr.)

Vigased sisendid viskavad vea (`RangeError`):

- mis tahes argument, mis ei ole lõplik arv (NaN, lõpmatus)
- `radiusM` ≤ 0, `apertureM` ≤ 0, `eyeDistanceM` ≤ 0, `distanceM` < 0
- **`apertureM` = 0 viskab vea ka `mirrorBulge`-is** – erinevalt mooduli
  `kumerpeegel` samanimelisest funktsioonist, kus `heightM` = 0 ON lubatud.
  Vahe on tähenduses, mitte valemis: seal on argument ühe KIIRE kõrgus
  (peateljel levinud kiir on täiesti mõistlik), siin on ta PEEGLI
  poolläbimõõt ja laiuseta peeglit ei ole olemas. Ristkontrolli test käib
  seetõttu ainult positiivsete väärtustega. See vahe peab olema mõlema
  funktsiooni kommentaaris kirjas, muidu paneb keegi need kunagi kokku.
- `apertureM` ≥ `radiusM` – peegel ei saa olla oma kerast suurem; a = R
  oleks poolkera, mille serval on ristsirge peateljega risti ja vaateväli
  kaotab mõtte (`viewAngleDeg(1, 1, 2)` viskab vea)
- **tulemuseks tulev poolnurk 2θ + φ ≥ 90°** – siis ei osutaks vaatevälja
  serv enam peeglist ETTE, vaid taha, ja laiusevalemi tangens läheks
  negatiivseks. Näide: `viewAngleDeg(1, 0.9, 0.1)` (θ = 64,2°) viskab vea.
  Mudel ei vasta küsimusele, mille peale tema sõnastus enam ei kehti – sama
  põhimõte nagu `reflectParallelRay` piiril moodulis `kumerpeegel`.
  Sama kontroll kehtib `convexViewWidth` sees, sest ta arvutab sama nurga.
- `distanceM` = 0 on **lubatud** (annab peegli enda laiuse); vea viskab
  ainult negatiivne `distanceM`. Ülejäänud kolm pikkust peavad olema
  rangelt positiivsed.

## Sammud

### 1. hook – häälestus

Joonis (`figures.tsx`, silt `kr-kolm-peeglit`): kolm kõrvutist skeemi.
Vasakul ristmik ülalt vaadatuna, maja nurk varjab vaadet, teisel pool teed
posti otsas ümar peegel. Keskel poe koridori nurk, laes ümar turvapeegel.
Paremal auto külgpeegel lähivaates, peeglil alaservas kiri „Esemed on
peeglis lähemal kui nad paistavad". Kõigi kolme all silt „kumerpeegel".

„Ristmikul aitab ümar peegel juhil näha tervet ristuvat teed. Sama ümar
peegel auto küljel aga PETAB – seal on isegi hoiatus peale kirjutatud. Kuidas
saab üks ja sama peegel korraga nii palju aidata kui ka petta?"

Eesmärk õpilase keeles: „Oskan seletada, miks mingisse kohta pandi kumer
peegel ja mis on selle hinnaks."

### 2. theory – kolm tagajärge ühest asjast (üks ekraan)

- **Meeldetuletus.** Kumerpeegel on kera välimine pind. Peateljega
  paralleelsed kiired **hajuvad** temalt laiali ja lõikuvad ainult
  pikendustena näilises fookuses peegli taga, poole raadiuse kaugusel
  (moodul `kumerpeegel`). Sellest ainsast asjast tuleb kõik, mis järgneb.
- **Tagajärg 1: lai vaateväli.** Kui peeglilt lähevad kiired laiali, siis
  vastupidi vaadates jõuab peeglisse valgust palju laiemast alast kui sama
  suurde tasapeeglisse. **Vaateväli** on see ala, mida sa peeglis korraga
  näed. Kumeral peeglil on ta lai ka siis, kui peegel ise on väike.
- **Kui lai, sõltub kahest asjast.** Mida **kumeram** peegel (väiksem
  raadius), seda laiem vaateväli. Vaataja kaugus mõjutab ka: eemale
  minnes vaateväli kitseneb, aga kumeral peeglil palju vähem kui tasasel.
  Just seepärast ongi kumer peegel kasulik seal, kus vaataja on kaugel:
  ristmikul teisel pool teed, poe koridori teises otsas.
- **Tagajärg 2: esemed paistavad väiksemad.** Laiem ala mahub samale
  peeglipinnale ära ainult nii, et kõik selles on väiksem. Peegel EI muuda
  ühtegi eset – muutub ainult see, kui suurena me teda peeglis näeme.
- **Tagajärg 3: kaugus tundub suurem.** Aju hindab kaugust suuruse järgi:
  mida väiksem asi paistab, seda kaugemal ta meie arvates on. Kumerpeeglis
  paistab tagant tulev auto väike, seega tundub ta kaugemal olevat, kui ta
  päriselt on. Sellepärast ongi külgpeeglile kirjutatud **„esemed on
  peeglis lähemal kui nad paistavad"** – hoiatus, et sellele hinnangule
  ei tohi mööda sõites kindel olla.
- **Kokkuvõte ühe lausega:** kumerpeegel vahetab **suuruse vaatevälja
  vastu**. Kus on tähtis kõike korraga näha, seal ta sobib; kus on tähtis
  kaugust täpselt hinnata, seal ta petab.
- Joonis (`kr-vaatevali`): ülalt vaade, kaks korrust kõrvuti. Ülemisel sama
  suur TASANE peegel seinal, vaataja peatelje peal, vaatevälja kitsas
  lehvik ulatub 5 m kaugusel oleva vahekäigu joonel ainult ühe riiuli
  jagu; alumisel sama suur KUMER peegel, lai lehvik katab terve
  vahekäigu. Mõlema juures on kirjas peegli läbimõõt (sama!) ja nähtava
  lõigu pikkus. Lehvikud on eristatud nii värvi kui ka joonemustriga.

### 3. predict – hüpotees (lukustub!)

„Ristmikul on 30 cm läbimõõduga kumer peegel. Keegi vahetab selle sama suure
TASASE peegli vastu. Mida juht nüüd näeb?"

(a) sama palju teed kui enne, ainult teravamalt
(b) **palju kitsamat lõiku teest**
(c) laiemat lõiku teest, aga kõike väiksemana

+ „Miks sa nii arvad?" (vabatekst).

Õige on (b). Vastust EI avaldata enne sammu 4.

Vale (a) saab sildi `peegli-suurus-maarab-vaatevalja`, vale (c) sildi
`tasapeegel-naitab-rohkem`.

### 4. explore – simulatsioon

SVG **ülalt vaade** poe vahekäigule. Vasakul seinal peegel (poolläbimõõt
15 cm ehk läbimõõt 30 cm – see on ekraanil kirjas ja EI muutu), peatelg
katkendliku joonena seinaga risti. Peateljel seisab vaataja (müüja) ja
5 m kaugusel jookseb peateljega risti **vahekäigu joon**, mille peal on
mõõdujoon ja riiulite tähised. Vahekäigu kaugus 5 m on joonisel kirjas ja
liuguriga ei muutu.

Ekraanil on korraga MÕLEMA peegli vaateväli: kumerpeegli lai lehvik ja sama
suure tasapeegli kitsas lehvik, eri värvi JA eri joonemustriga, mõlemal oma
silt. Vahekäigu joonel on mõlema lehviku lõik eraldi mõõdujoonega ja arvuga.

Kastikesed:

- „Peegli läbimõõt 30 cm · vahekäik 5 m kaugusel"
- „Kumerpeegel: vaateväli **43°** · näha **4,3 m** vahekäigust"
- „Sama suur tasapeegel: vaateväli **8,6°** · näha **1,05 m**"

Joonisel on ka lause „Peegel on siin otse seina peal. Päris poes on ta
nurga all – see muudab, KUHU vaateväli osutab, mitte kui LAI ta on."
Iga arv on ekraanil nii mõõdujoonena kui ka numbrina; värv ei ole kunagi
ainus info kandja (DISAINIJUHIS).

Juhtnupud (kaks korraga, moodulilepingu järgi):

- **liugur: peegli kõverusraadius R** – 80…300 cm, samm 10 cm (algväärtus
  100 cm). Alumine piir 80 cm hoiab a / R ≤ 0,1875 (vt turvavöönd).
- **liugur: vaataja kaugus peeglist d** – 50…500 cm, samm 10 cm
  (algväärtus 200 cm). Mõlemad algväärtused on liuguri võre peal, seega
  saab õpilane alati alguskoha tagasi.

Tolerantsid ja ühikud: nähtava ala laius **m**, tolerants **0,2 m**
(ekraanil on arv ühe kohaga peale koma); nurgad **°**, tolerants **0,5°**;
suhtarv ühikuta, tolerants **1**. Simulatsioon on ideaalne, seega on need
LUGEMISTOLERANTSID, mitte mõõtemääramatus. Model.ts arvutab meetrites:
liuguri cm-väärtused lähevad mudelisse `metresFromCentimetres` kaudu.

Ülesanded:

1. „Jäta R = 100 cm ja vaataja kaugus 200 cm. Kui pika lõigu vahekäigust
   näeb müüja **kumerpeeglis**?" (4,3 m; tolerants 0,2 m; ühik m;
   vihje 1: „vaata laia lehviku mõõdujoont vahekäigu peal"; vihje 2:
   „arv on kastikeses „Kumerpeegel"")
2. „Sama seis, aga vaata **tasapeegli** lehvikut. Kui pika lõigu näeks
   müüja sama suures tasases peeglis?" (1,05 m; tolerants 0,2 m; ühik m)
   Selgitus pärast vastamist: 4,3 m : 1,05 m ≈ **4 korda** rohkem – ja
   peegel on täpselt sama suur. Vaatevälja ei tee laiaks peegli suurus,
   vaid tema **kumerus**.
3. „Lohista raadius 300 cm peale – peegel läheb lamedamaks. Mis juhtub
   kumerpeegli vaateväljaga?" (valik) (a) läheb laiemaks (b) **läheb
   kitsamaks ja liigub tasapeegli oma poole** (c) ei muutu, sest peegli
   suurus jäi samaks.
   Selgitus: lamedam peegel hajutab vähem (tema näiline fookus on
   kaugemal), seega mahub temasse vähem. Kõige lamedam peegel ongi tasane.
4. „Sea R tagasi 100 cm peale ja vii vaataja 500 cm kaugusele. Mitu korda
   pikema lõigu näeb müüja nüüd kumerpeeglis kui tasapeeglis?"
   (6; tolerants 1; ühikuta; vihje 1: „jaga kumerpeegli arv tasapeegli
   arvuga"; vihje 2: „3,7 m ja 0,6 m")
   Selgitus: 2 m kauguselt oli vahe 4-kordne, 5 m kauguselt juba
   6-kordne. Mida kaugemal vaataja, seda vähem tasapeeglist kasu on –
   ja just seepärast pannaksegi ristmikule ja poekoridori kumer peegel.
   **NB!** Kõik õpilase jagamised käivad LAIUSTE, mitte nurkadega. Nurgad
   on ekraanil olemas (nad seletavad, MIKS lehvik lai on), aga nende suhe
   on teine arv kui laiuste suhe – peegli enda laius on laiuses sees.
   Ülesanne, mis jagab nurki, ja ülesanne, mis jagab laiusi, ei tohi
   sattuda kõrvuti.

### 5. practice – harjutamine

1. **Näidis (lahendatud):** Miks pannakse ristmiku vastasnurka just kumer
   peegel? Juht on peeglist kaugel (10–20 m) ja tahab näha tervet ristuvat
   teed. Sama suur tasapeegel näitaks talt kauguselt vaid umbes poole
   meetri laiust lõiku – täpselt seda kohta, kuhu peegel suunatud on.
   Kumer pind hajutab valgust, seega jõuab peeglisse valgust laiemast alast
   ja kogu ristmik mahub korraga ära. Hind: autod paistavad peeglis
   väikesed ja kaugemal, kui nad on.
2. **Osaline (täida lünk):** Ristmikul mõõdeti: kumerpeeglis on näha
   12 m pikkune lõik ristuvast teest, sama suures tasapeeglis 3 m.
   Mitu korda pikem lõik on kumerpeeglis? 12 : 3 = ___ (vastus 4;
   tolerants 0,5; ühikuta; vihje: „jaga suurem arv väiksemaga")
3. **Iseseisev (valik):** Auto külgpeeglis paistab tagant tulev jalgrattur
   väiksem, kui ta päriselt on. Miks teeb see kauguse hindamise petlikuks?
   (a) peegel viib jalgratturi päriselt kaugemale
   (b) **aju arvab, et väike asi on kaugel – seega tundub jalgrattur
       kaugemal olevat, kui ta on**
   (c) peegel aeglustab valgust, seega jõuab pilt hiljem kohale.
   Vale (a) saab sildi `peegel-muudab-kaugust`, vale (c) sildi
   `peegel-aeglustab-valgust`.
   Selgitus: peegel ei liiguta midagi ega aeglusta midagi – ta ainult
   näitab kõike väiksemana. Eksitab meie enda kauguse hindamine, ja
   sellepärast ongi hoiatus peeglile kirjutatud.
4. **Iseseisev (joonise lugemine):** Joonis (`kr-ristmik`): ristmik ülalt,
   maja nurk varjab juhil vaate paremale, vastasnurgas post ümara peegliga.
   Peegli vaateväli on lai lehvik üle ristuva tee; ristuval teel on kolm
   autot – **A** lehviku sees, **B** lehviku sees teises servas, **C**
   lehvikust väljas maja taga. Küsimus: „Milliseid autosid juht peeglis
   näeb?" (a) ainult A (b) **A ja B** (c) kõiki kolme.
   Vihje: „peeglis on näha see, mis jääb vaatevälja lehviku sisse".
   Vale (c) saab sildi `kumerpeegel-naitab-koike`.
   Selgitus: ka kumerpeegli vaateväli on lai, aga mitte lõputu. Auto C
   jääb maja taha ja teda ei näita ükski peegel – selle koha nimi on
   **pimeala**.
5. **Ülekanne (valik, mitu õiget):** Kuhu sobib **kumer** peegel?
   **poe koridori nurka, kus müüja tahab tervet vahekäiku korraga näha**,
   **parkla väljasõidule, kus vaade mõlemale poole on kinni**,
   **bussi juhi peeglisse, mis näitab tervet tagumist ust**,
   meigipeegliks, kus nägu peab paistma suurena,
   teleskoobi peapeegliks, mis peab tähe valguse kokku koguma.
   `shuffle: true`. Vale „meigipeegel" saab sildi `kumer-suurendab`, vale
   „teleskoop" sildi `kumer-koondab`.
   Selgitus pärast vastamist: kumerpeegel hajutab – ta annab laia
   vaatevälja, aga väikese kujutise. Kus on vaja SUURENDADA (meigipeegel)
   või valgust KOKKU KOGUDA (teleskoop, taskulamp), seal on vaja
   nõguspeeglit. Neid vaatame eraldi moodulis.

### 6. exit – väljumispilet

1. Miks pannakse poe koridori nurka kumer, mitte tasane peegel?
   (a) kumer peegel on odavam ja vastupidavam
   (b) **kumer peegel hajutab valgust, seega mahub temasse korraga laiem
       ala**
   (c) kumer peegel suurendab, seega on varas paremini näha
2. Ühes kohas näitab tasapeegel teest 0,8 m laiust lõiku. Sama suur
   kumerpeegel näitab neli korda laiemat lõiku. Kui lai see on?
   (3,2 m; tolerants 0,2 m; ühik m; vihje: „neli korda laiem kui 0,8 m")
3. „Sõber küsib: „Miks on auto külgpeeglile kirjutatud, et esemed on
   lähemal kui paistavad? Kas peegel valetab?" Mida sa talle vastad?"
   (vabatekst, õpetajale nähtav – oodatav mõte: peegel on kumer ja hajutab
   valgust, seega mahub temasse lai ala ja kõik selles paistab väiksemana;
   aju arvab, et väiksem asi on kaugemal, seega tundub tagant tulev auto
   kaugemal olevat, kui ta päriselt on. Peegel ise midagi ei muuda ega
   valeta – eksib meie kauguse hindamine)

## Väärarusaamad

| Silt | Väärarusaam | Kuidas moodul selle ümber lükkab |
|---|---|---|
| `peegli-suurus-maarab-vaatevalja` | vaateväli sõltub ainult peegli suurusest, kuju ei loe | explore-1 ja -2: peegli läbimõõt on kogu aeg sama 30 cm, aga nähtav lõik erineb neli korda; explore-3 muudab ainult kõverust |
| `tasapeegel-naitab-rohkem` | tasapeegel näitab rohkem, sest ta ei „moonuta" | predict + explore-2: tasapeegli lehvik on ekraanil nähtavalt kitsam ja tema arv väiksem |
| `kumer-suurendab` | kumerpeegel suurendab (segi nõguspeegliga) | teooria „tagajärg 2" + practice-5, kus meigipeegel on vale vastus |
| `kumer-koondab` | kumerpeegel koondab valgust nagu taskulambi peegeldi | practice-5 (teleskoop on vale vastus) + eelmise mooduli näiline fookus |
| `peegel-muudab-kaugust` | peegel viib eseme päriselt kaugemale või lähemale | practice-3 ja exit-3: muutub ainult see, kui suurena me eset näeme |
| `peegel-aeglustab-valgust` | peeglis on pilt „hilisem" | practice-3 selgitus |
| `kumerpeegel-naitab-koike` | kumerpeegel näitab kogu ümbrust, pimeala ei jää | practice-4: auto C jääb maja taha ja lehvikust välja |
| `lamedam-vaatevali-laiem` | mida lamedam peegel, seda laiem vaateväli | explore-3: R = 300 cm juures vaateväli kitseneb ja liigub tasapeegli oma poole |

## Õpetajale (teacher.ts)

- **(K) päris turvapeegel, mõõdulint (5 min):** kui koolis või kooli
  lähedal on ümar peegel (koridori nurgas, parklas, ristmikul), minge
  klassiga kohale. Üks õpilane seisab peegli ees ja ütleb, kust kohani ta
  peeglis veel midagi näeb; teised märgivad need kaks kohta ja mõõdavad
  vahemaa. Võrrelge simulatsiooni arvuga. Seejärel astuge kaks sammu
  kaugemale ja korrake – vaateväli kitseneb, aga vähe.
- **(K) auto külgpeeglite võrdlus (parklas, seisva auto juures):**
  Euroopas on juhipoolne külgpeegel tavaliselt tasane või väga vähe kumer,
  kõrvalistuja poolne aga selgelt kumer – ja hoiatuskiri on just sellel.
  Laske õpilastel mõlemasse vaadata ja öelda, kummas paistab sama auto
  väiksem ja kummas on rohkem ümbrust näha. **Ohutus:** ainult seisva auto
  juures, parkla ääres, mitte sõidutee ääres.
- **(K) asfäärilised peeglid:** mõnel autol on külgpeegli välimine osa
  kumeram kui sisemine (peeglil võib olla kiri „aspherical") ja peeglis on
  näha peenike jaotusjoon. Selle mooduli mudel oskab ainult ühe kõverusega
  kerapinda – näidake seda õpilastele kui kohta, kus lihtne mudel otsa
  saab, mitte kui viga.
- **Ohutus ja piirid:** kumerpeegel valgust kokku ei koonda, seega
  põletusohtu temaga ei ole (erinevalt nõguspeeglist). Küll aga ei asenda
  ükski peegel pea pööramist: pimeala jääb alati alles, mida ka
  practice-4 näitab. Liikluses ei mängi peeglitega ega suunata
  peegeldunud päikest kellelegi silma.
- **Aruteluküsimused:** Miks ei tehta ristmikupeeglit lihtsalt suureks ja
  tasaseks? (Sama vaatevälja saamiseks peaks ta olema meetreid lai ja
  kallis; kumer 30 cm peegel teeb sama töö ära.) Mida kaotaks poemüüja,
  kui ta paneks koridori väga kumera peegli? (Kõik oleks nii väike, et
  nägusid ei tunneks ära.) Miks ei ole hoiatuskirja tasasel juhipoolsel
  peeglil? Kus koolis oleks kumerast peeglist kasu?
- **Millal see moodul tunnis:** kohe PÄRAST moodulit `kumerpeegel` – see on
  sama tunni teine pool. Kui aega on vähe, sobib ta ka koduseks tööks:
  uut füüsikat siin ei ole, on ainult ülekanne. Mooduli `noguspeegel`
  läbimine ei ole eelduseks, aga practice-5 viimased kaks valikut on
  lihtsamad, kui ta on tehtud.
- **Tunniplaan (15 min):** 2 min hook + 3 min teooria · 1 min hüpotees ·
  5 min simulatsioon · 3 min harjutamine · 1 min väljumispilet.
  45-minutilises tunnis mahub ette moodul `kumerpeegel` ja lõppu päris
  turvapeegli juurde minek.

## Kordamiskaardid (5 tk)

| id | tüüp | küsimus | vastus |
|---|---|---|---|
| rc-1 | transfer | Miks on poe turvapeegel ja ristmikupeegel kumerad? | Kumer pind hajutab valgust, seega jõuab peeglisse valgust palju laiemast alast ja terve vahekäik või ristmik mahub väikesesse peeglisse korraga ära |
| rc-2 | concept | Mis on peegli vaateväli? | Ala, mida peeglis korraga näha on. Sama suurel peeglil on ta seda laiem, mida kumeram peegel on |
| rc-3 | calc | Tasapeegel näitab teest 0,8 m laiust lõiku, kumerpeegel neli korda laiemat. Kui lai lõik on kumerpeeglis? | 0,8 · 4 = 3,2 m |
| rc-4 | explain | Miks on auto külgpeeglil kiri „esemed on peeglis lähemal kui nad paistavad"? | Kumer peegel näitab kõike väiksemana; aju arvab, et väike asi on kaugel, seega tundub tagant tulev auto kaugemal olevat, kui ta on. Peegel ise midagi ei muuda |
| rc-5 | transfer | Kumb peegel sobib meigipeegliks ja kumb poe koridori nurka? | Meigipeegliks nõguspeegel (suurendab), koridori nurka kumerpeegel (lai vaateväli, väike kujutis) |
