# Mooduli spetsifikatsioon: Nõguspeegel

Ainekava seos (AINEKAVA-fyysika-8.md): plokk P1; õpitulemus: P1-T2 (osa:
kiirte käik nõguspeeglil ja joonise konstrueerimine); mõisted, mida õpetab:
**nõguspeegel, fookus**; praktiline töö: – (P1 neli praktilist tööd on juba
kaetud). Vanus: 8. klass. Kestused: demo 5 min, tund 15 min, iseseisev
12 min. Tüüp: mikromoodul (üks õpieesmärk, 6 sammu).

slug: `noguspeegel` · id: `physics.noguspeegel`

## Ainekava seos (täpsemalt)

- **Plokk:** P1 Valgus ja valguse sirgjooneline levimine. Peegeldumine ja
  neeldumine
- **Õpitulemused:**
  - **P1-T2 osa** – „tunneb valguse sirgjoonelise levimise ja peegeldumise
    seadust, konstrueerib nende põhjal jooniseid ja korraldab katsed".
    Siin kantakse peegeldumisseadus KÕVERALE pinnale: seadus ise ei muutu,
    muutub ainult see, kust ristsirge tuleb. Moodul `peegeldumisseadus` andis
    seaduse tasasel pinnal, `tasapeegli-kujutis` selle tagajärje – see moodul
    näitab, mis juhtub, kui pind ei ole enam tasane.
- **Õppesisu punktid:** „peegeldumisseadus; tasapeegel, kumer- ja
  nõguspeegel"
- **Põhimõisted, mida moodul ÕPETAB:** **nõguspeegel**, **fookus** (mõlemad
  ainekava P1 põhimõistete reas). Sõna „kõverpeegel" moodul kasutab ja
  seletab, aga ainekava põhimõistete loendis teda ei ole, seega manifesti
  `concepts` väljale ta ei lähe.
- **Praktiline töö:** – (moodul ei kata praktilist tööd; P1-PT1…PT4 on kõik
  juba teiste moodulite all)
- **Teema olulisus → hook:** „igapäevased valgusnähtused looduses ja
  tehnikas" – taskulambi pirn valgustab igasse suunda, aga taskulambi kiir
  ulatub kümneid meetreid kaugele. Selle teeb ära peegeldi, mitte pirn.
- **Metoodilised soovitused, mida järgin:** ainekava nõuab, et
  peegeldumisseadust EI õpetataks ainult teoreetiliselt, vaid „läbi jooniste
  eri olukordades (nurkpeegel, periskoop, matt- ja kumerpind)". See moodul on
  üks neist olukordadest: sama seadus, uus pind. Seepärast on simulatsiooni
  keskmes ÜKS valitud kiir koos oma ristsirge, langemis- ja
  peegeldumisnurgaga – mitte ainult ilus koonduv kimp.
- **Õpilase tegevused:** (D) uurib simulatsiooniga, kus paralleelne
  valgusvihk nõguspeeglilt koondub ja kuidas see punkt peegli kumerusest
  sõltub; (D) loeb joonisel langemis- ja peegeldumisnurka; (K) lusikakatse ja
  taskulambi peegeldi vaatamine õpetajajuhendis

## Piirid (mida see moodul EI tee)

- **Kujutised nõguspeeglis** (millal on kujutis suurendatud, millal pea
  peal, ese fookuse sees või väljas) – 8. klassi ainekava käsitleb kujutise
  konstrueerimist LÄÄTSEDE juures (P2: `kumerlaats`, `laatse-kujutis`), mitte
  peeglite juures. Siin on ainult paralleelne valgusvihk ja fookus.
  Õpetajajuhendi lusikakatses nähtust mainitakse („lähedalt suur ja püstine,
  kaugemalt pea peal"), aga ükski ülesanne ei nõua kujutise konstrueerimist
  ega asukoha arvutamist.
- **Kumerpeegel** – moodul `kumerpeegel`. Siin öeldakse ühe lausega, et
  kõverpeegleid on kahte sorti ja teine sort tuleb järgmisena; kumerpeegli
  kiirte käiku ei joonistata.
- **Rakendused** (taskulamp, autotuli, peegelteleskoop, päikeseahi,
  satelliittaldrik) – moodul `noguspeegli-rakendused`. Siin on taskulamp
  ainult häälestav probleem (hook) ja ülekandeülesandes küsitakse ÜHT
  rakendust, mitte loendit. Kui hook lahendatakse ära, siis lahendatakse ta
  põhimõttega („peegeldi teeb paralleelse kimbu"), mitte seadmete
  tutvustusega.
- **Sõna „fookuskaugus"** – teooria ütleb „fookuse kaugus peeglist on pool
  raadiusest" ja kasutab seda sõna ühe korra, aga manifesti `concepts`
  väljale ta EI lähe: `fookuskaugus` on ainekavas ploki P2 põhimõiste
  (läätsed) ja katvusraport võrdleb mõisteid nime järgi üle kogu ainekava
  (samm 4.0). Kui ta siia kirja panna, näitaks raport P2 mõistet vaikselt
  kaetuna. Sama põhjusel ei ole siin sõnu `optiline tugevus` ega `dioptria`.
- **Valem 1/a + 1/b = 2/R** ja kujutise kaugus – gümnaasium. Mudel seda
  ei arvuta.
- **Paraboolpeegel** – päris prožektori, teleskoobi ja päikeseahju peegel ei
  ole kerapinna osa, vaid parabool. Miks, on kirjas idealiseeringutes ja
  õpetajajuhendis; mudel arvutab kerapinda, sest ainekava räägib kerapinnast
  ja 8. klassi joonis on kerapinnaga.

## Allikad

- **Teooria tugi:** `sisu/allikad/OPIK-F8-INDEKS.md` ptk 1.12 „Kumer- ja
  nõguspeegel" (lk 42–45) – faktikontroll: kõverpeegel kui kera pinna osa
  (nõguspeeglil on läikiv kera SISEMINE pind), peegeldumisseaduse kehtimine
  kõveral pinnal, kerapinna ristsirge = raadiuse pikendus, paralleelse vihu
  koondumine fookusesse, fookus poole raadiuse kaugusel, fookusesse pandud
  valgusallikas annab paralleelse kimbu (taskulamp, auto esituli, teleskoop;
  päikeseahi Odeillos, võimsus 1 MW, temperatuur üle 3500 °C).
  `sisu/allikad/POHIVARA-F8-taielik.md` ptk 20 (läätse fookus ja
  fookuskaugus) – ainult selleks, et fookuse SÕNASTUS ei läheks lahku
  sellest, mida õpilane P2-s läätse juures kuuleb.
  Sõnasõnalist teksti ei kopeerita: kõik arvud, ülesanded ja sõnastused on
  selle mooduli omad (vt ALLIKAD.md).
- **Ülesannete näidised:** – (ülesanded on siin esimest korda kokku pandud;
  kõik arvud tulevad model.ts valemist f = R/2)

## Füüsika (model.ts jaoks)

Mudel arvutab **ühe kiire teekonna kerakujulisel nõguspeeglil** – puhta
geomeetriaga, ilma ühegi tabelita (reegel 1). Kõik pikkused on mudeli sees
**meetrites** (moodulileping: „SI-ühikud sees, teisendused eraldi
funktsioonides"), kõik nurgad kraadides. Õpilasega räägib UI
sentimeetrites – ühik muutub ainult teisendusfunktsioonides (vt allpool),
mitte kusagil mujal. Sama muster on failis
`src/modules/physics/vedeliku-rohk/model.ts`.

### Kokkulepped ja telgistik

- Peegli **tipp** (peatelje ja peegli lõikepunkt) on nullpunkt.
- **Peatelg** on x-telg; kaugusi peeglist mõõdetakse tipust ette, positiivse
  arvuna.
- **Kõverusraadius** `radiusM` (R) on selle kera raadius, mille osa peegel
  on. Kera keskpunkt on peegli ees peateljel kaugusel R.
- **Kiire kõrgus** `heightM` (h) on kaugus peateljest, kus kiir peegliga
  kohtub. Negatiivne h tähendab telje all olevat kiirt.
- Kõik nurgad on **mittenegatiivsed**: `+h` ja `−h` annavad sama vastuse,
  sest peegel on peatelje suhtes sümmeetriline (peegeldumise SUUND tuleb
  joonisel h märgist, mitte mudelist). Nii ei ole mudelis ühtegi
  märgikokkulepet, mida saaks valesti mõista.

### Funktsioonid

- `focalLength(radiusM)` → **R / 2**. Fookuse kaugus peegli tipust.
  Mooduli keskne valem ja ainus, mida õpilane arvutab.
- `mirrorDepth(radiusM, heightM)` → **R − √(R² − h²)**. Kui sügaval
  peegli tipust (piki peatelge) on see peegli punkt, kus kiir peegliga
  kohtub. Simulatsioon joonistab selle järgi peegli kaare ja kiire
  kohtumispunkti – kaar EI ole käsitsi kokku pandud Bézier.
- `normalAngleDeg(radiusM, heightM)` → **arcsin(|h| / R)** kraadides.
  Nurk peatelje ja selle punkti ristsirge (= raadiuse) vahel. Peateljega
  PARALLEELSE kiire jaoks on see ühtlasi langemisnurk – seda seost teooria
  ka ütleb.
- `reflectParallelRay(radiusM, heightM)` → peateljega paralleelse kiire
  saatus, objektina:

  | väli | tähendus | väärtus |
  |---|---|---|
  | `depthM` | kohtumispunkti sügavus | `mirrorDepth` |
  | `incidenceDeg` | langemisnurk α | θ = `normalAngleDeg` |
  | `reflectionDeg` | peegeldumisnurk β | θ (peegeldumisseadus) |
  | `deflectionDeg` | kui palju peegeldunud kiir peateljest kaldub | 2θ |
  | `axisCrossM` | kus peegeldunud kiir peatelge lõikab (tipust) | vt allpool |

  `axisCrossM` = `depthM` + R · cos 2θ / (2 · cos θ).

  Peegeldunud kiir kaldub ALATI peatelje poole – seda mudel eraldi väljana
  ei anna (see on nõguspeegli definitsioonist tulenev, mitte arvutatav).

- `metresFromCentimetres(lengthCm)` → lengthCm / 100 ja
  `centimetresFromMetres(lengthM)` → lengthM · 100. **Ainsad kaks kohta
  mooduli sees, kus pikkuse ühik muutub.** Simulation.tsx võtab liuguri
  cm-väärtuse ja teisendab enne mudelisse andmist; mudeli vastuse teisendab
  tagasi cm-desse enne ekraanile panekut. Ükski arvutus ei tohi ühikut
  „möödaminnes" vahetada – muidu tuleb vaikne 100-kordne viga, mida keegi ei
  märka.

**Kust `axisCrossM` valem tuleb** (kommentaariks model.ts-i, sest muidu
näeb ta välja nagu maagia): kohtumispunktis on ristsirge raadiuse siht,
seega on paralleelse kiire langemisnurk θ. Peegeldumisseaduse tõttu on
peegeldunud kiire nurk peateljega 2θ. Kohtumispunkt on tipust `depthM`
kaugusel ja peateljest h = R·sin θ kaugusel, seega jõuab peegeldunud kiir
teljeni veel h / tan 2θ = R·cos 2θ / (2·cos θ) võrra edasi.

**Miks ei ole eraldi funktsiooni „lamp fookuses"** (kimp läheb tagurpidi
välja): valguse teekond on pööratav – täpselt sama joonis, ainult nooled
teistpidi. Simulatsioon pöörab noolte otsad ümber ja ei küsi mudelilt
midagi uut. Nii ei saa kaks arvutust kunagi lahku minna ja pööratavus on
ühtlasi mooduli avastus (explore-4).

### Fookus on lubadus, mida kerapind päris täpselt ei täida

Piirjuhul h → 0 annab `axisCrossM` täpselt R/2 – see ongi fookus. Mida
kaugemal peateljest kiir peeglile langeb, seda LÄHEMALE peeglile ta telje
lõikab (sfääriline aberratsioon). Arvud meetrites, nagu mudelis:

| R | h | h / R | `axisCrossM` | erinevus R/2-st |
|---|---|---|---|---|
| 1 | 0 | 0 | 0,5 | 0 % |
| 1 | 0,1 | 0,1 | 0,49748 | 0,5 % |
| 0,5 | 0,1 | 0,2 | 0,24484 | 2,1 % |
| 1 | 0,6 | 0,6 | 0,375 | 25 % |

Sellepärast on simulatsioonis peegli poolkõrgus **10 cm** ja raadius
vähemalt **50 cm**: siis on h/R ≤ 0,2 ja kõik kiired lõikavad telge 2 %
sees ehk ekraanil ühes punktis. Lause „kõik kiired koonduvad ühte punkti"
jääb nii ausaks. Model.ts-il on selle kohta oma test (vt allpool) ja
õpetajajuhend ütleb, mis juhtub siis, kui peegel on väga sügav.

**Idealiseeringud, mis peavad olema mudeli kommentaaris kirjas** (ja mida
UI ega õpetajajuhend ei tohi päris füüsikana esitada):

1. **Peegel on kerapinna osa.** Päris prožektori, autotule ja teleskoobi
   peegel on parabool just sellepärast, et parabool koondab KÕIK
   peateljega paralleelsed kiired täpselt ühte punkti, kerapind mitte.
2. **Peegel peegeldab kogu valguse.** Neeldumist ja tuhmumist mudelis ei
   ole; päris peegel peegeldab ~90–95 %.
3. **Kiir on lõputult peenike joon.** Päris valgusvihul on laius ja fookus
   on väike laik, mitte matemaatiline punkt.
4. **Peegeldumisseadus kehtib kõveral pinnal punkthaaval.** See EI ole
   idealiseering, vaid tõsi – aga tõsi ainult siis, kui vaadelda pinna
   puutujat selles punktis. Mudel arvutab nii ja teooria ütleb selle välja.

**Testiväärtused (teadaolevad):** argumendid on koodikujul (kümnendpunkt),
tulemused eestikeelse kümnendkomaga. Pikkused meetrites, nurgad kraadides.

| Kutse | Tulemus |
|---|---|
| `focalLength(0.5)` | 0,25 |
| `focalLength(1)` | 0,5 |
| `focalLength(1.6)` | 0,8 |
| `focalLength(0.04)` | 0,02 |
| `mirrorDepth(1, 0)` | 0 |
| `mirrorDepth(1, 0.6)` | 0,2 (ümmargune arv: 3-4-5 kolmnurk) |
| `mirrorDepth(1, 0.1)` | 0,0050126 |
| `mirrorDepth(0.5, 0.1)` | 0,0101021 |
| `mirrorDepth(0.5, 0.5)` | 0,5 (poolkera) |
| `normalAngleDeg(1, 0.5)` | 30 |
| `normalAngleDeg(0.4, 0.2)` | 30 |
| `normalAngleDeg(1, 0.6)` | 36,870 |
| `normalAngleDeg(1, 0)` | 0 |
| `normalAngleDeg(1, −0.5)` | 30 (sama mis +0,5) |
| `normalAngleDeg(0.5, 0.5)` | 90 (peegli serv – vt piirjuhud) |
| `reflectParallelRay(1, 0.6)` | α = β = 36,870 · kalle 73,740 · lõige **0,375** (täpne arv) |
| `reflectParallelRay(1, 0.1)` | α = β = 5,739 · kalle 11,478 · lõige 0,49748 |
| `reflectParallelRay(0.5, 0.1)` | α = β = 11,537 · kalle 23,074 · lõige 0,24484 |
| `reflectParallelRay(1, 0)` | α = β = 0 · kalle 0 · lõige **0,5** (piirjuht, vt allpool) |
| `reflectParallelRay(0.5, 0.5)` | **viskab vea** (h = R, vt piirjuhud) |
| `centimetresFromMetres(focalLength(0.6))` | 30 (õpilase vastus practice-1-s) |

Piirjuhud ja vigased sisendid:

- **Peegeldumisseadus on invariant, mitte üks testirida:** test käib tsükliga
  üle kümnete R ja h paaride ja nõuab iga kord `incidenceDeg ===
  reflectionDeg` ning `deflectionDeg === 2 × incidenceDeg`. Kui see kunagi
  katki läheb, ei ole moodulil enam mõtet.
- **h = 0 on kokkulepe ja peab olema mudelis kommenteeritud:** peateljel
  levinud kiir tuleb peeglilt sama teed tagasi ega „lõika" telge kusagil.
  `axisCrossM` annab siin piirväärtuse **R/2**, sest see on ainus arv, mis
  hoiab funktsiooni pidevana (ja UI joonistab h = 0 kiire niikuinii tagasi
  sama teed).
- **Sümmeetria:** `reflectParallelRay(R, h)` = `reflectParallelRay(R, −h)`
  iga R ja h korral.
- **Mõõtkava:** `reflectParallelRay(1, 0.2).axisCrossM` = 2 ×
  `reflectParallelRay(0.5, 0.1).axisCrossM`. Peegli kaks korda suuremaks
  tegemine venitab kogu joonise kaks korda suuremaks ja mitte midagi muud.
- **Aberratsioon on ühesuunaline ja monotoonne:** `axisCrossM` ≤ R/2 alati,
  ja |h| kasvades ta ainult kahaneb. Test käib h = 0 kuni 0,99 · R sammuga
  läbi – h = R ise on välistatud (vt vigaseid sisendeid).
- **Simulatsiooni turvavöönd:** kui |h| ≤ 0,2 · R, siis erineb `axisCrossM`
  fookuse kaugusest R/2 vähem kui **3 %** (halvim juht 2,1 %). See test on
  otsene põhjendus sellele,
  miks tohib UI-s öelda „koonduvad ühte punkti" – kui keegi hiljem lubab
  simulatsioonis suuremat h/R suhet, läheb see test punaseks.
- **Vigased sisendid viskavad vea.** Lubatud h-vahemik EI ole kõigil
  funktsioonidel sama – peegli serv (|h| = R) on ühtedele mõistlik sisend ja
  teisele mitte:
  - **kõik funktsioonid:** `radiusM` ≤ 0, NaN või lõpmatus kummaski
    argumendis
  - **`mirrorDepth` ja `normalAngleDeg`:** |`heightM`| > `radiusM` (kiir ei
    saa peeglist mööda minna). |h| = R ON lubatud ja tähendab peegli serva:
    `mirrorDepth` annab R (poolkera) ja `normalAngleDeg` annab 90°.
  - **`reflectParallelRay`:** |`heightM`| **≥** `radiusM` – rangelt väiksem,
    mitte väiksem-võrdne. Serval on θ = 90°, kiir tabab peeglit riivamisi ja
    peegeldub sama teed tagasi: ta ei lõika peatelge kunagi. Valemis
    `R · cos 2θ / (2 · cos θ)` oleks nimetajas cos 90° = 0, mis annaks
    lõpmatuse. Seda ei tohi vaikselt tagastada – see peab olema viga, mille
    test kinni püüab (`reflectParallelRay(0.5, 0.5)`).

## Sammud

### 1. hook – häälestus

Joonis (`figures.tsx`, silt `np-taskulamp`): kaks kõrvutist pilti.
Vasakul paljas väike pirn, millest lähevad nooled igasse suunda laiali ja
valgus kaob juba poole meetri peal ära. Paremal sama pirn taskulambi sees:
tema taga on läikiv nõgus peegeldi ja lambist väljub kitsas paralleelne
kimp, mis ulatub joonise servast välja („40 m"). Peegeldi juures silt
„läikiv nõgus pind".

„Taskulambi pirn saadab valgust igasse suunda – ka tahapoole. Kuidas tekib
sellest kitsas kiir, mis ulatub üle poole jalgpalliväljaku?"

Eesmärk õpilase keeles: „Tean, kuhu nõguspeegel paralleelse valguse
koondab, ja oskan öelda, kui kaugel see punkt peeglist on."

### 2. theory – kõverpeegel ja fookus (üks ekraan)

- **Kõverpeegli pind ei ole tasane.** Kumer- ja nõguspeeglit võib vaadelda
  läikiva kera ühe tükina. **Nõguspeeglil** on läikiv pind kera SEEST poolt
  (nagu lusika süvend), kumerpeeglil väljast poolt. Neid kahte koos
  nimetatakse kõverpeegliteks. Kumerpeegel tuleb järgmises moodulis.
- **Peegeldumisseadus kehtib ka siin – muutub ainult ristsirge.** Tasapeegli
  puhul oli ristsirge kõikjal ühesuguse sihiga. Kerapinnal on ristsirge iga
  punkti oma **raadiuse siht** ehk joon kera keskpunkti poole. Kui see joon
  on olemas, käib kõik nagu enne: **langemisnurk = peegeldumisnurk**. Iga
  väikest tükki kõverast peeglist võib vaadelda kui pisikest tasapeeglit.
- **Paralleelsed kiired koonduvad ühte punkti.** Peateljega paralleelne
  valgusvihk peegeldub nõguspeeglilt nii, et kõik kiired lõikuvad peegli ees
  ühes punktis. Seda punkti nimetatakse peegli **fookuseks**.
- **Fookuse kaugus peeglist on pool kera raadiusest.** Kui peegel on
  välja lõigatud 80 cm raadiusega kerast, on fookus peeglist 40 cm kaugusel.
  Mida lamedam peegel (suurem raadius), seda kaugemal on fookus.
- **Valgus võib sama teed käia mõlemat pidi.** Kui panna väike lamp
  täpselt fookusesse, väljub peeglilt paralleelne kimp – täpselt see, mis
  taskulambis toimub.
- Joonis (`np-ristsirge`): nõguspeegli kaar, kera keskpunkt C peateljel,
  üks paralleelne kiir kohtumispunktis P; P-st C-ni katkendlik joon sildiga
  „ristsirge = raadius"; nurgad α ja β kiire ja ristsirge vahel, mõlemad
  märgitud kaarega ja sildiga „α = β".

### 3. predict – hüpotees (lukustub!)

„Kaks nõguspeeglit on ühesuuruse pinnaga, aga üks on välja lõigatud
väiksemast kerast (sügavam peegel) ja teine suuremast (lamedam peegel).
Kummal on fookus peeglile lähemal?"

(a) **sügavamal peeglil (väiksem raadius)**
(b) lamedamal peeglil (suurem raadius)
(c) mõlemal ühekaugusel – fookus sõltub ainult peegli suurusest

+ „Miks sa nii arvad?" (vabatekst).

Õige on (a): fookus on poole raadiuse kaugusel, seega väiksem raadius =
lähem fookus. Vastust EI avaldata enne sammu 4.

Vale (c) saab sildi `fookus-soltub-peegli-suurusest`, vale (b) sildi
`lamedam-koondab-lahemale`.

### 4. explore – simulatsioon

SVG külgvaates, **ühtne mõõtkava mõlemal teljel** (nurgad on joonisel
päris nurgad – seda ei tohi rikkuda, sest ekraanil on kirjas α ja β).
Vasakul servas peegli kaar (poolkõrgus 10 cm, kaar `mirrorDepth` järgi,
võimenduseta – lamedam peegel PAISTABKI peaaegu sirge), peatelg
katkendliku joonena, kera keskpunkt C märgitud, kui ta joonisele mahub.

Paremalt tuleb neli peateljega paralleelset kiirt kõrgustel −10, −5, +5 ja
+10 cm; nad peegelduvad ja lõikavad telge fookuse lähedal. Lisaks on
**valitud kiir** (liugur „kiire kõrgus") paksu joonega ja tema juures on
kirjas ristsirge (katkendlik joon punktist kera keskpunkti), nurgakaared α
ja β ning nende arvud. Koondumiskoht on tähistatud punkti ja sildiga
„fookus". Nooleotsad näitavad valguse liikumissuunda.

Kastikesed paremal:

- „Raadius R = 100 cm"
- „Fookus on peeglist **50 cm** kaugusel"
- „Valitud kiir: langemisnurk 5,7° · peegeldumisnurk 5,7°"

Iga nurk on ekraanil nii kaarena kui ka ARVUNA, ja fookus on nii punktina
kui ka mõõdujoonena koos arvuga – värv ega joonis ei ole kunagi ainus info
kandja (DISAINIJUHIS). 360 px laiusel ekraanil lähevad kastikesed joonise
alla, mitte kõrvale.

Juhtnupud (kaks korraga, moodulilepingu järgi):

- **liugur: kera raadius R** – 50…200 cm, samm 10 cm (algväärtus 100 cm)
- **liugur: valitud kiire kõrgus h** – 0…10 cm, samm 1 cm (algväärtus 10 cm)
- **lüliti: valguse suund** – „valgus tuleb kaugelt" / „lamp on fookuses" –
  AVANEB alles pärast ülesannet 3 (silt `suuna-lyliti`). Lüliti ainult pöörab
  noolte otsad ümber, joonis ise ei muutu (valguse teekonna pööratavus).
  Enne seda on korraga muudetavaid suurusi kaks, mitte kolm.

Tolerantsid ja ühikud: kauguste ühik on ekraanil ja vastustes **cm**,
tolerants **2 cm** (liuguri samm on 10 cm ja fookus liigub 5 cm kaupa –
2 cm lubab lugemisvea, aga ei lase naaberväärtust õigeks). Model.ts
arvutab meetrites: liuguri väärtus läheb mudelisse
`metresFromCentimetres` kaudu ja vastus tuleb ekraanile
`centimetresFromMetres` kaudu. Nurkade ühik on **°**,
tolerants **0,5°**. Simulatsioon on ideaalne, seega on need
LUGEMISTOLERANTSID, mitte mõõtemääramatus.

Ülesanded:

1. „Jäta raadiuseks 100 cm. Kui kaugel peeglist kiired koonduvad?"
   (50 cm; tolerants 2 cm; ühik cm; vihje 1: „vaata mõõdujoont
   koondumispunkti juures"; vihje 2: „see punkt on fookus")
2. „Sea raadiuseks 160 cm. Kui kaugel on fookus nüüd?" (80 cm; tolerants
   2 cm; ühik cm; vihje: „võrdle raadiuse arvuga – mitu korda väiksem see
   on?")
   Selgitus pärast vastamist: fookus on alati poole raadiuse kaugusel,
   seega 160 : 2 = 80 cm. See on ka ennustuse (samm 3) vastus – lamedamal
   peeglil on fookus KAUGEMAL.
3. „Sea kiire kõrguseks 10 cm ja loe langemisnurk. Kui suur on
   peegeldumisnurk?" (valik) (a) null (b) **täpselt sama suur** (c) kaks
   korda suurem.
   Selgitus: kõveral peeglil kehtib täpselt sama peegeldumisseadus mis
   tasapeeglil – ainult ristsirge tuleb kera keskpunktist. Pärast seda
   ülesannet avaneb suunalüliti.
4. „Lülita valguse suund ümber: lamp on fookuses. Milline kimp peeglilt
   väljub?" (valik) (a) **paralleelne – kiired lähevad kõrvuti kaugusesse**
   (b) kimp koondub uuesti kokku (c) kimp valgub laiali igasse suunda.
   Selgitus: valgus võib sama teed käia mõlemat pidi. Just nii teeb
   taskulamp pirnist kitsa kiire – pirn on peegeldi fookuses.

### 5. practice – harjutamine

1. **Näidis (lahendatud):** Nõguspeegel on välja lõigatud kerast raadiusega
   60 cm. Kus on fookus? Fookus on poole raadiuse kaugusel:
   60 cm : 2 = **30 cm** peegli tipust, peegli EES peateljel. Sinna
   koondub peateljega paralleelne valgusvihk.
2. **Osaline (täida lünk):** Peegli kera raadius on 90 cm. Fookus on
   90 : 2 = ___ cm kaugusel. (vastus 45; tolerants 0; ühik cm; vihje:
   „pool raadiusest")
3. **Iseseisev (pöördülesanne):** Taskulambi peegeldi fookus on 2 cm
   kaugusel – just sinna on pandud pirn. Kui suur on peegeldi kera raadius?
   (vastus 4; tolerants 0; ühik cm; vihje 1: „fookus on pool raadiusest –
   mis on siis raadius?"; vihje 2: „2 cm on pool millest?")
4. **Iseseisev (joonise lugemine):** Joonis (`np-kolm-kiirt`): nõguspeegel,
   peatelg, kolm paralleelset kiirt peegelduvad; peateljele on märgitud
   kolm punkti A (peegli tipu lähedal), B (kus peegeldunud kiired lõikuvad)
   ja C (kaugel peegli ees). Küsimus: „Milline punkt on peegli fookus?"
   (a) A (b) **B** (c) C. Vihje: „fookus on seal, kus kiired kokku saavad."
5. **Ülekanne (valik, mitu õiget):** Auto esitules on pirni taga läikiv
   nõgus peegeldi. Millised väited on õiged?
   **pirn asub peegeldi fookuses**,
   **peegeldilt väljub peaaegu paralleelne valgusvihk**,
   **ilma peegeldita valguks pirni valgus igasse suunda laiali**,
   peegeldi tekitab juurde valgust, mida pirnist ei tulnud,
   peegeldi töötab ainult siis, kui pirn on väga tugev.
   `shuffle: true`. Vale „tekitab juurde valgust" saab sildi
   `peegel-teeb-valgust-juurde`.
   Selgitus pärast vastamist: peegeldi ei tee ühtegi lisavatti – ta korjab
   kokku selle valguse, mis oleks muidu taha ja külgedele laiali läinud, ja
   saadab selle ettepoole. Ettepoole paistab tänu sellele tõesti heledam,
   aga valgust ei tule juurde: see on ümber suunatud, mitte juurde tehtud.

### 6. exit – väljumispilet

1. Mis on nõguspeegli fookus? (a) peegli kõige sügavam koht
   (b) **punkt peegli ees, kuhu koondub peateljega paralleelne valgusvihk**
   (c) peegli kera keskpunkt
2. Nõguspeegel on lõigatud kerast raadiusega 24 cm. Kui kaugel peeglist on
   fookus? (12 cm; tolerants 0; ühik cm; vihje: „pool raadiusest")
3. „Sõber ütleb: „Kõveral peeglil peegeldumisseadus ei kehti – seal
   peegelduvad kiired ju igasse suunda laiali." Mida sa talle vastad?"
   (vabatekst, õpetajale nähtav – oodatav mõte: seadus kehtib igas punktis
   täpselt samamoodi, langemisnurk = peegeldumisnurk; kiired lähevad eri
   suundadesse sellepärast, et igas punktis on ristsirge eri sihiga –
   ristsirge on seal raadius, mitte sellepärast, et seadus katki oleks)

## Väärarusaamad

| Silt | Väärarusaam | Kuidas moodul selle ümber lükkab |
|---|---|---|
| `koveral-seadus-ei-kehti` | kõveral pinnal peegeldumisseadus ei kehti, kiired peegelduvad „kuidas juhtub" | teooria (ristsirge = raadius) + explore-3, kus α ja β on iga kiire juures ekraanil võrdsed |
| `fookus-on-peegli-peal` | fookus on peegli pinnal või peegli kõige sügavamas kohas | simulatsiooni mõõdujoon peegli tipust fookuseni + exit-1 |
| `fookus-soltub-peegli-suurusest` | fookus sõltub sellest, kui SUUR peegel on (kui lai pind) | explore-1 ja 2: pind jääb samaks, muutub ainult raadius, ja fookus liigub |
| `lamedam-koondab-lahemale` | mida lamedam peegel, seda lähemal fookus | predict + explore-2: raadius 160 cm → fookus 80 cm, kaugemal kui 100 cm peeglil |
| `fookus-on-kera-keskpunkt` | fookus on seal, kus on kera keskpunkt | teooria „pool raadiusest" + simulatsioon, kus C ja fookus on korraga näha |
| `peegel-teeb-valgust-juurde` | peegel tekitab valgust juurde, mida pirnist ei tulnud | practice-5 selgitus: peegel suunab olemasoleva valguse ümber – ettepoole paistab heledam, aga vatte juurde ei tule |

## Õpetajale (teacher.ts)

- **(K) lusikakatse (2 min, vahendeid on igas klassis):** vaata läiget
  supilusikat mõlemalt poolt. Süvendipoolne külg on nõguspeegel, kumer külg
  kumerpeegel. Hoia lusikat päris silme lähedal ja siis vii aeglaselt
  kaugemale: nõgusas küljes on nägu esmalt suur ja püstine, teatud kauguselt
  aga PEA PEAL. Kumeras küljes on nägu alati väike ja püstine. Ütle klassile
  ausalt, et kujutise pööramist uurime alles läätsede juures (P2) – siin on
  lusikas selleks, et kõverpeegel oleks päris asi, mitte ainult joonis.
- **(K) taskulambi peegeldi:** võta taskulamp lahti (või vaata otsa
  väljalülitatud auto esituld) ja lase õpilastel peegeldi kuju kirjeldada:
  nõgus, läikiv, pirn on tema keskel õõnsuses. Küsi, mis juhtuks, kui pirn
  nihkuks fookusest välja (kiir läheb laiali või koondub liiga vara – täpselt
  seda teeb halvasti reguleeritud autotuli, mis pimestab vastutulijaid).
- **(K) Päikese koondamine nõguspeegliga – OHUTUS:** nõguspeegel koondab
  Päikese valguse fookuses väga väikesele laigule ja seal läheb paber
  mõne sekundiga põlema. Kui seda üldse teha, siis ainult õues, õpetaja
  käes, kausitäie vee kõrval, ja **mitte kunagi ei suunata koondatud
  valgust kellegi poole ega vaadata fookusesse**. Päikest ennast ei
  vaadata peegli kaudu mitte kunagi. Kõige turvalisem variant on jätta katse
  ära ja näidata selle asemel päikeseahju videot (Odeillo päikeseahi
  Prantsusmaal: võimsus 1 MW, fookuses üle 3500 °C).
- **Miks päris peegel ei ole kerapind:** ütle klassile, et päris prožektori
  ja teleskoobi peegel on parabool. Kerapeegel koondab telje lähedased
  kiired hästi, aga servadelt tulevad kiired lõikavad telge peeglile
  lähemal – simulatsioonis on peegel meelega nii lai, et seda viga on alla
  2 % ja ta ei paista välja. Kui keegi küsib, MIKS kõverpeegel toas nägu
  moonutab, on vastus just see: väga sügav kõverpeegel ei koonda enam ühte
  punkti (nii tehaksegi lõbustuspargi kõverpeeglid).
- **Aruteluküsimused:** Miks on satelliittaldrik nõgus ja miks on tema vastu
  võtja täpselt taldriku ees õhus? Miks on peegelteleskoobi peegel seda
  parem, mida suurem ta on? Miks pannakse kaminasse või radiaatori taha
  vahel läikiv plaat? Kui panna nõguspeegli fookusesse lamp ja peegel
  aeglaselt lamedamaks muuta, mis juhtub kiirega?
- **Millal see moodul tunnis:** PÄRAST mooduleid `peegeldumisseadus`
  (seadus ja ristsirge) ja `tasapeegli-kujutis` (tasane pind kui võrdlus).
  Vahetult sellele järgneb `kumerpeegel` – kaks kõverpeeglit on üks paar ja
  neid on mõistlik õpetada samas tunnis või kõrvuti tundides.
- **Tunniplaan (15 min):** 2 min hook + 3 min teooria · 2 min hüpotees ·
  5 min simulatsioon · 2 min harjutamine · 1 min väljumispilet.
  45-minutilises tunnis mahub kõrvale lusikakatse ja `kumerpeegel`.

## Kordamiskaardid (5 tk)

| id | tüüp | küsimus | vastus |
|---|---|---|---|
| rc-1 | concept | Mis on nõguspeegel? | Kõverpeegel, mille läikiv pind on kera seest poolt (nagu lusika süvend). Peateljega paralleelse valgusvihu ta koondab |
| rc-2 | concept | Mis on peegli fookus? | Punkt peegli ees peateljel, kuhu koonduvad peateljega paralleelsed kiired pärast peegeldumist |
| rc-3 | calc | Nõguspeegel on lõigatud kerast raadiusega 70 cm. Kui kaugel on fookus? | 35 cm (pool raadiusest) |
| rc-4 | selgitus | Kas kõveral peeglil kehtib peegeldumisseadus? | Jah, igas punktis täpselt samamoodi: langemisnurk = peegeldumisnurk. Erinevus on ainult selles, et ristsirge on igas punktis raadiuse siht, seega eri punktides eri suunas |
| rc-5 | transfer | Miks ulatub taskulambi kiir kaugele, kuigi pirn valgustab igasse suunda? | Pirn on nõgusa peegeldi fookuses. Fookusest välja läinud valgus peegeldub paralleelseks kimbuks – valgus ei lähe laiali, vaid liigub kõrvuti ühes suunas. Valgust juurde peegel ei tee |
