# Mooduli spetsifikatsioon: Valgus levib sirgjooneliselt

Ainekava seos (AINEKAVA-fyysika-8.md): plokk P1; õpitulemused: P1-T2 (osa:
sirgjooneline levimine ja selle põhjal joonis); mõisted, mida õpetab:
valgusvihk, optiline keskkond; praktiline töö: –.
Vanus: 8. klass. Kestused: demo 6 min, tund 15 min, iseseisev 12 min.
Tüüp: mikromoodul (üks õpieesmärk, 6 sammu).

slug: `valguse-sirgjooneline-levimine` · id:
`physics.valguse-sirgjooneline-levimine`

## Ainekava seos (täpsemalt)

- **Plokk:** P1 Valgus ja valguse sirgjooneline levimine. Peegeldumine ja
  neeldumine
- **Õpitulemused:** P1-T2 **osa** – „tunneb valguse sirgjoonelise levimise
  ja peegeldumise seadust, konstrueerib nende põhjal jooniseid ja korraldab
  katsed". Siin on ainult SIRGJOONELINE LEVIMINE (valgusvihk ühtlases
  keskkonnas, kiirte joonis läbi augu). Peegeldumisseadus on moodulis
  `peegeldumisseadus`, varju servad moodulis `vari-ja-poolvari`.
- **Õppesisu punktid:** sirgjooneline levimine; valgusvihk
- **Põhimõisted, mida moodul ÕPETAB:** valgusvihk, optiline keskkond
- **Praktiline töö:** – (P1-PT1 täis- ja poolvari on eraldi moodulis;
  nõelaugukaamera meisterdamine läheb siin õpetajajuhendisse, sest ainekava
  seda praktilise tööna ei nõua)
- **Teema olulisus → hook:** „igapäevased valgusnähtused looduses" – puu all
  maapinnal on ümmargused päikeselaigud ka siis, kui lehtede vahed ei ole
  ümmargused
- **Metoodilised soovitused, mida järgin:** joonis eri olukordades, mitte
  ainult teooria (ainekava metoodiline rõhk); kujutis ENNE selgitust –
  õpilane ennustab, mida ekraanil näeb, ja alles siis joonistatakse kiired
- **Õpilase tegevused:** (D) uurib simulatsiooniga kiirte käiku läbi augu ja
  arvutab kujutise suuruse; (D) loeb ja täiendab kiirte joonist; (K)
  nõelaugukaamera kingakarbist ja päikeselaikude vaatlus jäävad teacher.ts-i

## Allikad

- **Teooria tugi:** `sisu/allikad/POHIVARA-F8-taielik.md` ptk 17 (17.5
  ühtlases läbipaistvas keskkonnas levib valgus mööda sirgjoont; 17.6 kiirus
  vaakumis 300 000 km/s; 17.7 keskkonnas on kiirus väiksem – optiliselt
  tihedam keskkond; valguskiire definitsioon: joon, mille sihis valgus
  levib) – kasutatud faktikontrolliks, tekst on oma sõnadega
- **Ülesannete näidised:** – (kõik arvud on selle mooduli omad; Päikese
  laigu ülesanne kasutab teadlikult sama suhet 108, mis on moodulis
  `valgusallikad`)

## Füüsika (model.ts jaoks)

Kogu moodul tugineb ühele lausele: **ühtlases läbipaistvas keskkonnas levib
valgus mööda sirgjoont.** Selle arvuline tagajärg on nõelaugukaamera –
kujutise suurus tuleb SUHTEST, mitte nurgast (sama otsus mis sammul 4.1d:
8. klassi matemaatika on jagamine ja korrutamine, mitte trigonomeetria).

- `pinholeImageHeight(objectHeightM, objectDistanceM, boxDepthM) =
  objectHeightM · boxDepthM / objectDistanceM` – kujutise kõrgus meetrites.
  Sõnadega: kujutis on eseme kõrgus korrutatud sellega, mitu korda on kamber
  lühem kui kaugus.
- `pinholeMagnification(objectDistanceM, boxDepthM) = boxDepthM /
  objectDistanceM` – kui suur osa eseme kõrgusest kujutisse jõuab (ühikuta
  arv). Kooliolukorras on ta alla 1, sest kamber on kaugusest lühem; kui
  `boxDepthM = objectDistanceM`, on ta täpselt 1 (liuguritega saab nii
  seada) ja pikema kambri korral üle 1. Funktsioon ei piira väärtust –
  ta ainult jagab. Sama tehe eraldi funktsioonina, sest sim näitab seda ka
  ilma esemeta.
- `pinholeBoxDepth(objectHeightM, imageHeightM, objectDistanceM) =
  imageHeightM · objectDistanceM / objectHeightM` – pöördülesanne: kui sügav
  peab kamber olema, et kujutis oleks soovitud suurusega.
- `pinholeBlurWidth(holeM, objectDistanceM, boxDepthM) =
  holeM · (objectDistanceM + boxDepthM) / objectDistanceM` – kui laiaks
  määrib auk kujutise serva. **Lisanäit, mitte reegel:** simulatsioon
  joonistab tema järgi servade uduse riba ja näitab arvu väikeses kirjas.
  Ükski ülesanne seda ei küsi (seda valvab test) – augu mõju on selles
  moodulis kvalitatiivne („mida väiksem auk, seda teravam ja tumedam").
  Poolvarju MÕISTET siin ei nimetata, see kuulub moodulisse
  `vari-ja-poolvari`.
- Definitsioonipiirkond: kõik pikkused > 0; null või negatiivne viskab vea
  (funktsioon ei paranda sisendit vaikselt)
- Kujutis on **pea peal ja vasak-parem vahetuses** – see ei ole arv, vaid
  joonise omadus: ülemisest servast lähtuv kiir läheb läbi augu alla. Seda
  EI kodeerita miinusmärgiga – model.ts tagastab ainult positiivseid
  pikkusi ja ümberpööramine elab Simulation.tsx joonises.
- Sim on IDEAALNE: väärtused tulevad mudelist täpselt, mõõtmismüra ei ole

**Testiväärtused (teadaolevad):**

| Ese | kõrgus | kaugus | kambri sügavus | kujutis |
|---|---|---|---|---|
| küünal | 0,2 m | 1 m | 0,1 m | 0,02 m (2 cm) |
| inimene | 1,8 m | 9 m | 0,15 m | 0,03 m (3 cm) |
| puu | 6 m | 12 m | 0,2 m | 0,1 m (10 cm) |
| maja | 8 m | 40 m | 0,25 m | 0,05 m (5 cm) |
| Päike (laik puu all) | 1 392 000 km | 150 000 000 km | 5 m | 0,046 m (4,6 cm) |

Suurendus: `pinholeMagnification(12, 0.2)` = 0,0166… (kujutis 60 korda
väiksem). Pöördülesanne: `pinholeBoxDepth(1.8, 0.05, 9)` = 0,25 m, ja see
peab `pinholeImageHeight`-i kaudu tagasi andma täpselt 0,05 m (edasi-tagasi
test). Hägu: `pinholeBlurWidth(0.002, 12, 0.2)` = 0,0020333… m (2 mm auk
määrib 10 cm kujutise serva 2 mm ulatuses – terav); `pinholeBlurWidth(0.02,
12, 0.2)` = 0,020333… m (2 cm auk määrib sama kujutise 2 cm ulatuses –
udune). Sisend 0 või −1 → viga.

Päikeselaigu rida on ühtlasi kontroll, et valem kannatab kosmoseskaalat:
1 392 000 km / 150 000 000 km ≈ 1/108 (täpsemalt 1/107,8), seega laik on
umbes `kaugus / 108` – sama ümardatud suhe 108, mis on moodulis
`valgusallikad`. Õpilase ülesandes (practice-4) antakse see suhe ette
ümardatuna ja tolerants 5% katab ümardamise vahe kuhjaga.

## Sammud

### 1. hook – häälestus

Joonis (`figures.tsx`, silt `oo-puulaigud`): päikesepaisteline puu, all
maapinnal ümmargused heledad laigud; kõrval suurendus lehtede vahest, mis on
ilmselgelt kolmnurkne ja sakiline.

„Vaata, mis kuju on lehtede vahed – ja mis kuju on laigud maas. Miks ei ole
laigud sakilised?"

Eesmärk õpilase keeles: „Oskan joonistada, kuidas valgus läbi augu levib, ja
arvutada, kui suur kujutis tekib."

### 2. theory – kolm mõistet (üks ekraan)

- **Valgusvihk** on valguse joa see osa, mis kuhugi levib – taskulambi koonus
  udus, päikesekiirte kimp pilvede vahelt. **Valguskiir** on selle joonise
  MUDEL: joon, mille sihis valgus levib. Päris elus ühte üksikut kiirt ei
  ole, ta on meie abijoon.
- Vihk võib olla **hajuv** (lambist eemale laienev), **paralleelne** (väga
  kauge allikas, nt Päike) või **koonduv**. Punktallikast lähtub alati hajuv
  vihk.
- **Optiline keskkond** on aine, milles valgus levib: õhk, vesi, klaas,
  vaakum. **Ühtlases läbipaistvas keskkonnas levib valgus mööda sirgjoont.**
  Ühtlane tähendab, et keskkond on kõikjal ühesugune.
- Kui keskkond EI ole ühtlane, võib tee kõverduda: kuuma asfaldi kohal õhk
  vireleb ja kaugem pilt „ujub", sest soe ja külm õhk juhivad valgust
  erinevalt. Sirgjoonelisus on seega tingimusega reegel, mitte igavene tõde.

### 3. predict – ennustus (lukustub!)

„Papist karbi ühel seinal on nööpnõelaga tehtud auk, vastasseinal
küpsetuspaber. Karp on suunatud põleva küünla poole. Mida on paberil näha?"
(a) ainult ümmargune valgusplekk (b) küünla kujutis püstiselt
(c) **küünla kujutis pea peal** + „Miks sa nii arvad?" (vabatekst).

Õige on (c): küünla tipust tulnud kiir läheb läbi augu ALLA, jalast tulnud
kiir ÜLES. Läätse pole vaja – piisab sellest, et valgus levib sirgelt.
Vastust EI avaldata enne sammu 4.

### 4. explore – simulatsioon

SVG külgvaates: vasakul ese (küünal / inimene / puu / maja), keskel must sein
augusega, paremal ekraan. Kaks kiirt – eseme tipust ja jalalt – lähevad läbi
augu ja lõikuvad, ekraanil on kujutis TAGURPIDI. **Joonisel on suhted päris,
kaugus mitte:** ese seisab alati sama kaugel ekraani servast ja päris kaugus
on kirjas arvuna (1 m ja 40 m ei mahu ühele skaalale). Kambri sügavus ja
kujutise kõrgus on omavahel õiges suhtes.

Kolm liugurit: **kaugus esemeni** 0,5–40 m, **kambri sügavus** 0,05–0,5 m ja
**augu läbimõõt** 0,5–20 mm. Suurelt kuvatakse **kujutise kõrgus
sentimeetrites**; väikeses kirjas hägu laius ja sõnaline hinnang („terav" /
„udune") – hinnang ei ole ainus märk, kujutise serv joonisel muutub koos
sellega (reegel: värv ega üks silt ei kanna infot üksi). Nupurida näidetega:
küünal · inimene · puu · maja.

Tolerantsid: kujutise kõrgus 5%; explore-2 (kambri sügavus) samuti 5%.
Ühikud: kõrgused `cm`, kaugused ja sügavused `m`. **Iga kambri sügavuse
küsimuse juures kontrolli tolerantsi liuguri sammu vastu:** samm on 0,01 m
ja 5% katab selle alles alates 0,2 m sügavusest (5% × 0,05 m = 0,0025 m ehk
neljandik sammust – õpilane ei saakski õigesse vahemikku). Explore-2 vastus
0,4 m on ohutu (5% = 0,02 m = kaks sammu); kui mõni tulevane küsimus küsib
lühemat kambrit, tuleb talle anda ABSOLUUTNE tolerants ±0,01 m – sama otsus
mis moodulis `valgusallikad` explore-2 juures.

Ülesanded:

1. „Vali „puu" (6 m, 12 m kaugusel) ja sea kambri sügavuseks 0,2 m. Kui
   kõrge on kujutis?" (10 cm)
2. „Jäta puu paika ja tee kujutis 20 cm kõrguseks. Kui sügav peab kamber
   olema?" (0,4 m)
3. „Jäta kamber 0,4 m peale ja keera augu läbimõõt 0,5 mm-lt 20 mm-ni. Mis
   kujutisega juhtub?" (valik) (a) läheb suuremaks (b) **läheb heledamaks,
   aga uduseks** (c) läheb pea peale tagasi

### 5. practice – harjutamine

1. **Näidis (lahendatud):** Küünal 0,2 m, kaugus 1 m, kamber 0,1 m.
   0,2 · 0,1 / 1 = 0,02 m = 2 cm. Kamber on 10 korda lühem kui kaugus,
   seega kujutis on 10 korda väiksem kui küünal.
2. **Osaline:** Inimene 1,8 m seisab 9 m kaugusel, kamber 0,15 m.
   1,8 · 0,15 / 9 = ___ m (vastus 0,03 m; tolerants 5%; vihje 1: „mitu korda
   on kaugus kambrist pikem?"; vihje 2: „9 / 0,15 = 60, seega kujutis on
   60 korda väiksem").
3. **Iseseisev (valik):** Miks on puu all päikeselaigud ümmargused, kuigi
   lehtede vahed on sakilised? (a) **iga vahe on nõelauk ja laik on Päikese
   ümmargune kujutis** (b) valgus painutab servades ümarnurgad (c) lehed
   varjavad nurgad ära.
4. **Iseseisev (arv):** Sama puu all on laigud maapinnast 5 m kõrguste okste
   alt. Päikese kujutis on 108 korda väiksem kui kaugus august. Kui suure
   läbimõõduga on laik? (0,046 m ehk umbes 4,6 cm; tolerants 5%; ühik `m`;
   vihje: „5 / 108").
5. **Ülekanne (valik, mitu õiget):** Millistel juhtudel EI levi valgus
   sirgjooneliselt? **kuuma asfaldi kohal vireleva õhu sees**, puhtas
   klaasis, **soolase ja mageda vee segunemispiiril**, vaakumis, ühtlases
   õhus. `shuffle: true`.

### 6. exit – väljumispilet

1. Valguskiir on… (a) **abijoon, mis näitab, mis sihis valgus levib**
   (b) valguse kõige väiksem osake (c) sama mis valgusvihk
2. Arvuta: 8 m kõrge maja on 40 m kaugusel, kamber on 0,25 m sügav. Kui
   kõrge on kujutis? (0,05 m ehk 5 cm; tolerants 5%; ühik `m`)
3. „Osaline päikesevarjutuse ajal on puu all olevad laigud poolkuu kujulised.
   Selgita, miks." (vabatekst, õpetajale nähtav – oodatav mõte: laik on
   Päikese kujutis, varjutuse ajal ongi Päike poolkuu kujuline)

## Väärarusaamad

| Silt | Väärarusaam | Kuidas moodul selle ümber lükkab |
|---|---|---|
| `kiir-on-asi` | valguskiir on päriselt olemas, õhuke valguse niit | teooria: kiir on joonise mudel, vihk on see, mis päriselt levib |
| `pea-peal-vajab-laatse` | tagurpidi kujutise saab ainult läätsega | predict + simulatsioon: kujutise pöörab ümber ainuüksi sirgjooneline levimine läbi augu |
| `auk-annab-augu-kuju` | laigu kuju maas tuleb augu kujust | hook + practice-3: sakilise vahe alt tuleb ümmargune laik, sest laik on ALLIKA kujutis |
| `suurem-auk-suurem-kujutis` | suurem auk teeb kujutise suuremaks | explore-3: suurus sõltub ainult kaugusest ja kambri sügavusest, auk muudab ainult teravust ja heledust |
| `valgus-alati-sirge` | valgus levib alati ja igal pool sirgelt | teooria viimane lõik + practice-5: reegel kehtib ÜHTLASES keskkonnas |

## Õpetajale (teacher.ts)

- **(K) vahendid:** kingakarp või papptoru, alumiiniumfoolium, nööpnõel,
  küpsetuspaber, must teip. Käik: lõika karbi ühte otsa auk, katta
  fooliumiga, torka nööpnõelaga auk; teise otsa küpsetuspaber; vaata pimedas
  toas põleva küünla või akna poole. Ohutus: **läbi augu ei vaadata kunagi
  Päikese poole.** Karbi tohib Päikese poole suunata – nii ongi mõeldud
  päikesekujutist tegema –, aga vaadata tohib ainult küpsetuspaberile
  langevat kujutist, silm jääb alati augu ja Päikese sihist eemale.
  Küünlaga töötades pikad juuksed kinni.
- **(K) päikeselaigud:** viie minutiga õue puu alla – pildistage laike
  telefoniga ja võrrelge lehtede vahede kujuga. Osalise päikesevarjutuse
  päeval on see sama katse kogu kooli jaoks.
- **Aruteluküsimused:** Miks on nõelaugukaamera pilt hämar? Mis juhtub
  kujutisega, kui teha fooliumisse teine auk? Miks tehakse aknaluukide
  praost tuppa paistev päikeselaik akna kujutiseks alles siis, kui sein on
  kaugel?
- **Simulatsioon ENNE päris katset** – õpilane ennustab, kas kujutis on pea
  peal, ja kontrollib siis karbiga.
- **Tunniplaan (15 min):** 2 min hook + teooria · 2 min ennustus ·
  4 min simulatsioon · 4 min harjutamine · 3 min väljumispilet.
  45-minutilises tunnis järgneb sellele `vari-ja-poolvari`.

## Kordamiskaardid (5 tk)

| id | tüüp | küsimus | vastus |
|---|---|---|---|
| rc-1 | concept | Mis vahe on valgusvihul ja valguskiirel? | Vihk on see osa valgusest, mis kuhugi levib (taskulambi koonus); kiir on joonise abijoon, mis näitab levimise sihti |
| rc-2 | concept | Millises keskkonnas levib valgus sirgjooneliselt? | Ühtlases läbipaistvas optilises keskkonnas – kui keskkond ei ole ühtlane (vireleb kuum õhk), siis tee kõverdub |
| rc-3 | calc | Puu 6 m kõrgusel 12 m kaugusel, kamber 0,2 m sügav. Kui kõrge on kujutis? | 6 · 0,2 / 12 = 0,1 m ehk 10 cm |
| rc-4 | selgitus | Miks on nõelaugukaamera kujutis pea peal? | Tipust tulev kiir läheb läbi augu alla ja jalast tulev üles – kiired lõikuvad augus |
| rc-5 | transfer | Miks on puu all päikeselaigud ümmargused ja osalise varjutuse ajal poolkuu kujulised? | Iga lehtede vahe on nõelauk ja laik on Päikese kujutis – laigu kuju on allika, mitte augu kuju |
