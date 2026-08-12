# Mooduli spetsifikatsioon: Kumerpeegel

Ainekava seos (AINEKAVA-fyysika-8.md): plokk P1; õpitulemus: P1-T2 (osa:
kiirte käik kumerpeeglil ja joonise konstrueerimine); mõisted, mida õpetab:
**kumerpeegel**; praktiline töö: – (P1 neli praktilist tööd on juba
kaetud). Vanus: 8. klass. Kestused: demo 5 min, tund 15 min, iseseisev
12 min. Tüüp: mikromoodul (üks õpieesmärk, 6 sammu).

slug: `kumerpeegel` · id: `physics.kumerpeegel`

## Ainekava seos (täpsemalt)

- **Plokk:** P1 Valgus ja valguse sirgjooneline levimine. Peegeldumine ja
  neeldumine
- **Õpitulemused:**
  - **P1-T2 osa** – „tunneb valguse sirgjoonelise levimise ja peegeldumise
    seadust, konstrueerib nende põhjal jooniseid ja korraldab katsed".
    Siin kantakse peegeldumisseadus kera VÄLIMISELE pinnale. Moodul
    `peegeldumisseadus` andis seaduse tasasel pinnal, `noguspeegel` näitas
    kera sisemist pinda ja päris fookust – see moodul on paari teine pool:
    sama seadus, sama kerapind, aga peegeldub väljastpoolt.
- **Õppesisu punktid:** „peegeldumisseadus; tasapeegel, kumer- ja
  nõguspeegel"
- **Põhimõisted, mida moodul ÕPETAB:** **kumerpeegel** (ainekava P1
  põhimõistete reas; katvusraporti järgi P1 viimane katmata põhimõiste).
  Sõnu „kõverpeegel" ja „näiline fookus" moodul kasutab ja seletab, aga
  ainekava põhimõistete loendis neid ei ole, seega manifesti `concepts`
  väljale nad ei lähe. Mõiste **fookus** on juba mooduli `noguspeegel`
  all – siin teda uuesti ei nõuta, vaid kasutatakse.
- **Praktiline töö:** – (moodul ei kata praktilist tööd; P1-PT1…PT4 on kõik
  juba teiste moodulite all)
- **Teema olulisus → hook:** „igapäevased valgusnähtused looduses ja
  tehnikas" – poe laes olev ümar peegel, milles on korraga näha terve
  vahekäik. Tasapeegel sama suure pinnaga näitaks ainult üht riiulit.
- **Metoodilised soovitused, mida järgin:** ainekava nõuab, et
  peegeldumisseadust EI õpetataks ainult teoreetiliselt, vaid „läbi jooniste
  eri olukordades (nurkpeegel, periskoop, matt- ja **kumerpind**)".
  Kumerpind on selles loendis nimeliselt. Seepärast on simulatsiooni keskmes
  ÜKS valitud kiir koos oma ristsirge, langemis- ja peegeldumisnurgaga –
  mitte ainult laialivalguv kimp.
- **Õpilase tegevused:** (D) uurib simulatsiooniga, kuidas paralleelne
  valgusvihk kumerpeeglilt hajub ja kus lõikuvad peegeldunud kiirte
  pikendused; (D) loeb joonisel langemis- ja peegeldumisnurka; (K)
  lusikakatse kumeralt küljelt ja poe turvapeegli vaatamine
  õpetajajuhendis

## Piirid (mida see moodul EI tee)

- **Kujutise konstrueerimine** (kust ja kui suurena kujutis paistab, kuidas
  ta joonisel kolme kiirega üles ehitada) – 8. klassi ainekava käsitleb
  kujutise konstrueerimist LÄÄTSEDE juures (P2), mitte peeglite juures.
  Siin on ainult paralleelne valgusvihk ja näiline fookus. See, et
  kumerpeeglis paistavad esemed **väiksemad ja püstised**, öeldakse välja
  ja seda saab lusikaga vaadata, aga ükski ülesanne ei nõua kujutise
  konstrueerimist, suurenduse arvutamist ega kujutise asukoha leidmist.
- **Nõguspeegel** – moodul `noguspeegel` (juba ehitatud). Siin on ta
  ainult võrdluspaar: üks lause teoorias ja üks valikvastus, mitte uus
  kiirte käigu joonis.
- **Rakendused** (liikluspeegel ristmikul, poe turvapeegel, auto
  külgpeegel ja hoiatus „esemed on lähemal kui paistavad") – moodul
  `kumerpeegli-rakendused`. Siin on poe peegel ainult häälestav probleem
  (hook) ja ülekandeülesandes küsitakse ÜHE peegli kohta, mitte loendit.
  Kui hook lahendatakse ära, siis lahendatakse ta põhimõttega („kumer pind
  hajutab, seega mahub vaatevälja rohkem"), mitte seadmete tutvustusega.
- **Vaatevälja NURGA arvutamine** (mitme kraadi laiune ala peeglisse mahub)
  – see nõuab kujutise ja silma asukoha geomeetriat ja käib
  `kumerpeegli-rakendused` alla, kui üldse. Siin on lai vaateväli
  KVALITATIIVNE tagajärg: kiired hajuvad, seega tuleb peeglisse valgust
  laiemast alast.
- **Sõna „fookuskaugus"** – teooria ütleb „näiline fookus on peegli taga
  poole raadiuse kaugusel" ja kasutab seda sõna ühe korra, aga manifesti
  `concepts` väljale ta EI lähe: `fookuskaugus` on ainekavas ploki P2
  põhimõiste (läätsed) ja katvusraport võrdleb mõisteid nime järgi üle kogu
  ainekava (samm 4.0). Kui ta siia kirja panna, näitaks raport P2 mõistet
  vaikselt kaetuna. Sama põhjusel ei ole siin sõnu `optiline tugevus` ega
  `dioptria`. Sama otsus on failis MOODUL-noguspeegel.md.
- **Valem 1/a + 1/b = −2/R ja märgikokkulepped** (fookus on „negatiivne")
  – gümnaasium. Selles moodulis ei ole ühtegi negatiivset pikkust: suund
  („peegli taga") öeldakse SÕNADEGA, mitte miinusmärgiga.
- **Paraboolpeegel** – nagu nõguspeegli moodulis: päris lai kumerpeegel ei
  koonda pikendusi täpselt ühte punkti. Miks, on kirjas idealiseeringutes.

## Allikad

- **Teooria tugi:** `sisu/allikad/OPIK-F8-INDEKS.md` ptk 1.12 „Kumer- ja
  nõguspeegel" (lk 42–45) – faktikontroll: kõverpeegel kui kera pinna osa
  (kumerpeeglil on läikiv kera VÄLIMINE pind), peegeldumisseaduse kehtimine
  kõveral pinnal, kerapinna ristsirge = raadiuse pikendus (kumerpeeglil
  läheb see peegli TAHA kera keskpunkti), paralleelse vihu hajumine,
  peegeldunud kiirte pikenduste lõikumine näilises fookuses poole raadiuse
  kaugusel peegli taga, kumerpeegli lai vaateväli.
  Sõnasõnalist teksti ei kopeerita: kõik arvud, ülesanded ja sõnastused on
  selle mooduli omad (vt ALLIKAD.md).
- **Ülesannete näidised:** – (ülesanded on siin esimest korda kokku pandud;
  kõik arvud tulevad model.ts valemist f = R/2)

## Füüsika (model.ts jaoks)

Mudel arvutab **ühe kiire teekonna kerakujulisel kumerpeeglil** – puhta
geomeetriaga, ilma ühegi tabelita (reegel 1). Kõik pikkused on mudeli sees
**meetrites** (moodulileping: „SI-ühikud sees, teisendused eraldi
funktsioonides"), kõik nurgad kraadides. Õpilasega räägib UI
sentimeetrites – ühik muutub ainult teisendusfunktsioonides, mitte kusagil
mujal. Sama muster on failides
`src/modules/physics/noguspeegel/model.ts` ja
`src/modules/physics/vedeliku-rohk/model.ts`.

### Miks EI ole see nõguspeegli mudeli taaskasutus

Valemid on nõguspeegli omadega peaaegu samad ja kiusatus on suur teha üks
ühine „kõverpeegli" moodul. Seda me ei tee, kolmel põhjusel:

1. **Arvud on samad, tähendus mitte.** Nõguspeeglil on `axisCrossM` koht,
   kus valgus päriselt läbi läheb (fookuses süttib paber). Kumerpeeglil on
   sama arv koht, kus lõikuvad ainult PIKENDUSED peegli taga – seal ei ole
   valgust ega soojust. Kui neil oleks üks funktsioon, kaoks see vahe ära
   just seal, kus ta on kogu mooduli mõte.
2. **Moodul on iseseisev üksus** (moodulileping): oma manifest, oma
   model.ts, oma testid, laetakse laisalt (reegel 13) ja teda peab saama
   arhiveerida teisi katki tegemata (reegel 11). Jagatud füüsikafail kahe
   mooduli vahel teeks kummagi muutmise teise jaoks riskiks.
3. **Kordus on väike ja valve on olemas:** ~60 rida geomeetriat, mille iga
   valem on testiga kaetud. Kaks eraldi testikomplekti annavad samad arvud
   – see ongi ristkontroll, mitte kaotus.

Ühine on ainult see, mida moodul EI kirjuta: jagatud on
`src/ui`, `src/checker` ja `src/engine`, nagu igal moodulil.

### Kokkulepped ja telgistik

- Peegli **tipp** (peatelje ja peegli lõikepunkt) on nullpunkt. Kumeral
  peeglil on tipp valgusele kõige LÄHEM koht (peegel kummub valguse poole).
- **Peatelg** on x-telg. Kaugusi mõõdetakse tipust ja alati positiivse
  arvuna; kumb pool („peegli ees" / „peegli taga") on nimes ja UI tekstis,
  mitte märgis.
- **Kõverusraadius** `radiusM` (R) on selle kera raadius, mille osa peegel
  on. Kera keskpunkt on peegli TAGA peateljel kaugusel R (nõguspeeglil oli
  ta peegli ees – see ongi ainus geomeetriline erinevus).
- **Kiire kõrgus** `heightM` (h) on kaugus peateljest, kus kiir peegliga
  kohtub. Negatiivne h tähendab telje all olevat kiirt.
- Kõik nurgad on **mittenegatiivsed**: `+h` ja `−h` annavad sama vastuse,
  sest peegel on peatelje suhtes sümmeetriline (peegeldumise SUUND tuleb
  joonisel h märgist, mitte mudelist).

### Funktsioonid

- `focalLength(radiusM)` → **R / 2**. Näilise fookuse kaugus peegli tipust,
  **peegli taga**. Mooduli keskne valem ja ainus, mida õpilane arvutab.
- `mirrorBulge(radiusM, heightM)` → **R − √(R² − h²)**. Kui palju on see
  peegli punkt, kus kiir peegliga kohtub, tipust TAHAPOOLE nihkunud (tipp
  kummub kõige rohkem ette). Simulatsioon joonistab selle järgi peegli
  kaare ja kiire kohtumispunkti – kaar EI ole käsitsi kokku pandud Bézier.
- `normalAngleDeg(radiusM, heightM)` → **arcsin(|h| / R)** kraadides.
  Nurk peatelje ja selle punkti ristsirge (= raadiuse, mis läheb peegli
  taha kera keskpunkti) vahel. Peateljega PARALLEELSE kiire jaoks on see
  ühtlasi langemisnurk.
- `reflectParallelRay(radiusM, heightM)` → peateljega paralleelse kiire
  saatus, objektina:

  | väli | tähendus | väärtus |
  |---|---|---|
  | `bulgeM` | kohtumispunkti nihe tipust tahapoole | `mirrorBulge` |
  | `incidenceDeg` | langemisnurk α | θ = `normalAngleDeg` |
  | `reflectionDeg` | peegeldumisnurk β | θ (peegeldumisseadus) |
  | `deflectionDeg` | kui palju peegeldunud kiir peateljest kaldub | 2θ |
  | `virtualCrossM` | kus peegeldunud kiire PIKENDUS peatelge lõikab, peegli taga (tipust) | vt allpool |

  `virtualCrossM` = `bulgeM` + R · cos 2θ / (2 · cos θ).

  Peegeldunud kiir kaldub ALATI peateljest eemale (hajub) – seda mudel
  eraldi väljana ei anna, see on kumerpeegli definitsioonist tulenev.
  `virtualCrossM` EI ole koht, kust valgus läbi käib: peegeldunud kiired
  lähevad peeglist eemale laiali ja lõikuvad ainult tagurpidi pikendatuna.
  Nimi ütleb selle välja ja mudeli kommentaar kordab seda üle.

  **`virtualCrossM` on alati kaugus peegli TAGA – ja see kehtib ainult
  siis, kui θ < 60°.** Kui kiir langeb peeglile väga kõrgelt, kaldub
  peegeldunud kiir teljest 2θ võrra ehk üle 120° ja tema pikendus lõikab
  peatelge hoopis peegli tipust EESPOOL: valem annab θ = 60° juures täpselt
  0 ja suurema θ korral negatiivse arvu (θ = 70°, R = 1 → −0,462 m).
  Selles moodulis ei ole ühtegi negatiivset pikkust (kokkulepe ülal), seega
  ei tohi mudel seda arvu vaikselt tagastada – `reflectParallelRay` nõuab
  **|h| < R · sin 60° = R · √3 / 2 ≈ 0,866 · R** ja viskab muidu vea.
  Simulatsioon jääb niikuinii vöötsse |h| ≤ 0,2 · R, seega õpilane seda
  piiri ei näe; ta on seal selleks, et 8. klassi mudel ei hakkaks vastama
  küsimusele, mille peale tema sõnastus enam ei kehti.

- `metresFromCentimetres(lengthCm)` → lengthCm / 100 ja
  `centimetresFromMetres(lengthM)` → lengthM · 100. **Ainsad kaks kohta
  mooduli sees, kus pikkuse ühik muutub.** Simulation.tsx võtab liuguri
  cm-väärtuse ja teisendab enne mudelisse andmist; mudeli vastuse teisendab
  tagasi cm-desse enne ekraanile panekut. Ükski arvutus ei tohi ühikut
  „möödaminnes" vahetada – muidu tuleb vaikne 100-kordne viga.

**Kust `virtualCrossM` valem tuleb** (kommentaariks model.ts-i):
kohtumispunktis on ristsirge raadiuse siht (kera keskpunkt on peegli taga),
seega on paralleelse kiire langemisnurk θ. Peegeldumisseaduse tõttu on
peegeldunud kiire nurk peateljega 2θ, aga teljest EEMALE. Kohtumispunkt on
tipust `bulgeM` võrra taga ja peateljest h = R·sin θ kaugusel, seega jõuab
peegeldunud kiire tagurpidi pikendus teljeni veel h / tan 2θ =
R·cos 2θ / (2·cos θ) võrra tahapoole. Sama avaldis mis nõguspeeglil,
sest geomeetria on peegelpilt – ainult tulemus loetakse peegli TAGANT.

**Miks ei ole eraldi funktsiooni „lamp näilises fookuses"**: kumerpeeglil
seda katset teha ei saa – näilise fookuse koht on peegli TAGA, seal ei ole
valgust. Nõguspeeglis oli see explore-4 avastus (valguse teekonna
pööratavus); siin on selle koha peal küsimus, kas kiired kusagil päriselt
kokku saavad (ei saa). Vastavat sammu vt allpool.

### Näiline fookus on lubadus, mida kerapind päris täpselt ei täida

Piirjuhul h → 0 annab `virtualCrossM` täpselt R/2 – see ongi näiline
fookus. Mida kaugemal peateljest kiir peeglile langeb, seda LÄHEMALE
peeglile jääb tema pikenduse lõikepunkt (sfääriline aberratsioon). Arvud
meetrites, nagu mudelis:

| R | h | h / R | `virtualCrossM` | erinevus R/2-st |
|---|---|---|---|---|
| 1 | 0 | 0 | 0,5 | 0 % |
| 1 | 0,1 | 0,1 | 0,49748 | 0,5 % |
| 0,5 | 0,1 | 0,2 | 0,24484 | 2,1 % |
| 1 | 0,6 | 0,6 | 0,375 | 25 % |

Sellepärast on simulatsioonis peegli poolkõrgus **10 cm** ja raadius
vähemalt **50 cm**: siis on h/R ≤ 0,2 ja kõik pikendused lõikavad telge
2 % sees ehk ekraanil ühes punktis. Lause „pikendused lõikuvad ühes
punktis" jääb nii ausaks. Model.ts-il on selle kohta oma test ja
õpetajajuhend ütleb, mis juhtub siis, kui peegel on väga kumer (see ongi
lõbustuspargi kõverpeegel).

**Idealiseeringud, mis peavad olema mudeli kommentaaris kirjas** (ja mida
UI ega õpetajajuhend ei tohi päris füüsikana esitada):

1. **Peegel on kerapinna osa.** Päris lai turvapeegel ei koonda pikendusi
   täpselt ühte punkti; sama põhjus, miks prožektori peegel on parabool.
2. **Peegel peegeldab kogu valguse.** Neeldumist ja tuhmumist mudelis ei
   ole; päris peegel peegeldab ~90–95 %.
3. **Kiir on lõputult peenike joon.** Päris valgusvihul on laius.
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
| `focalLength(0.14)` | 0,07 |
| `mirrorBulge(1, 0)` | 0 |
| `mirrorBulge(1, 0.6)` | 0,2 (ümmargune arv: 3-4-5 kolmnurk) |
| `mirrorBulge(1, 0.1)` | 0,0050126 |
| `mirrorBulge(0.5, 0.1)` | 0,0101021 |
| `mirrorBulge(0.5, 0.5)` | 0,5 (poolkera) |
| `normalAngleDeg(1, 0.5)` | 30 |
| `normalAngleDeg(0.4, 0.2)` | 30 |
| `normalAngleDeg(1, 0.6)` | 36,870 |
| `normalAngleDeg(1, 0)` | 0 |
| `normalAngleDeg(1, −0.5)` | 30 (sama mis +0,5) |
| `normalAngleDeg(0.5, 0.5)` | 90 (peegli serv – vt piirjuhud) |
| `reflectParallelRay(1, 0.6)` | α = β = 36,870 · kalle 73,740 · pikenduse lõige **0,375** (täpne arv) |
| `reflectParallelRay(1, 0.1)` | α = β = 5,739 · kalle 11,478 · lõige 0,49748 |
| `reflectParallelRay(0.5, 0.1)` | α = β = 11,537 · kalle 23,074 · lõige 0,24484 |
| `reflectParallelRay(1, 0)` | α = β = 0 · kalle 0 · lõige **0,5** (piirjuht, vt allpool) |
| `reflectParallelRay(0.5, 0.5)` | **viskab vea** (h = R, vt piirjuhud) |
| `reflectParallelRay(1, 0.9)` | **viskab vea** (h > R·√3/2, lõige tuleks negatiivne) |
| `reflectParallelRay(1, Math.sqrt(3) / 2)` | **viskab vea** (θ = 60° täpselt, lõige oleks 0) |
| `reflectParallelRay(1, 0.86)` | lubatud, α = β = 59,317 · lõige 0,0202 (väärtus vahetult enne piiri – arv on väike, aga positiivne) |
| `centimetresFromMetres(focalLength(0.6))` | 30 (õpilase vastus practice-1-s) |

Piirjuhud ja vigased sisendid:

- **Peegeldumisseadus on invariant, mitte üks testirida:** test käib tsükliga
  üle kümnete R ja h paaride ja nõuab iga kord `incidenceDeg ===
  reflectionDeg` ning `deflectionDeg === 2 × incidenceDeg`.
- **h = 0 on kokkulepe ja peab olema mudelis kommenteeritud:** peateljel
  levinud kiir tuleb peeglilt sama teed tagasi ega „lõika" telge kusagil.
  `virtualCrossM` annab siin piirväärtuse **R/2**, sest see on ainus arv,
  mis hoiab funktsiooni pidevana (ja UI joonistab h = 0 kiire niikuinii
  tagasi sama teed).
- **Sümmeetria:** `reflectParallelRay(R, h)` = `reflectParallelRay(R, −h)`
  iga R ja h korral.
- **Mõõtkava:** `reflectParallelRay(1, 0.2).virtualCrossM` = 2 ×
  `reflectParallelRay(0.5, 0.1).virtualCrossM`.
- **Aberratsioon on ühesuunaline ja monotoonne:** `virtualCrossM` ≤ R/2
  alati, ja |h| kasvades ta ainult kahaneb. Test käib h = 0 kuni 0,86 · R
  sammuga läbi ja nõuab lisaks, et iga tulemus on **positiivne** – see on
  ainus koht, mis hoiab kinni lubadusest „kaugus peegli taga". Suuremad h
  on välistatud (vt vigaseid sisendeid).
- **Simulatsiooni turvavöönd:** kui |h| ≤ 0,2 · R, siis erineb
  `virtualCrossM` näilise fookuse kaugusest R/2 vähem kui **3 %** (halvim
  juht 2,1 %). See test on otsene põhjendus sellele, miks tohib UI-s öelda
  „pikendused lõikuvad ühes punktis" – kui keegi hiljem lubab
  simulatsioonis suuremat h/R suhet, läheb see test punaseks.
- **Ristkontroll nõguspeegliga (eraldi test, mitte jagatud kood):** test
  võrdleb mõne R ja h paari juures `virtualCrossM`-i sama sisendiga
  arvutatud nõguspeegli `axisCrossM`-iga ja nõuab võrdust. Kaks eraldi
  kirjutatud geomeetriat peavad andma sama arvu; kui üks kunagi lahku
  läheb, on üks neist katki. **See on ainus koht, kus kumerpeegli testid
  teist moodulit üldse puudutavad** – ja test on TESTIS, mitte
  rakenduse koodis.
- **Vigased sisendid viskavad vea.** Lubatud h-vahemik EI ole kõigil
  funktsioonidel sama:
  - **kõik funktsioonid:** `radiusM` ≤ 0, NaN või lõpmatus kummaski
    argumendis
  - **`mirrorBulge` ja `normalAngleDeg`:** |`heightM`| > `radiusM`. |h| = R
    ON lubatud ja tähendab peegli serva: `mirrorBulge` annab R (poolkera)
    ja `normalAngleDeg` annab 90°.
  - **`reflectParallelRay`:** |`heightM`| **≥** `radiusM · √3 / 2`
    (≈ 0,866 · R) – rangelt väiksem, mitte väiksem-võrdne. Kaks põhjust,
    üks piir:
    - **θ = 60° (|h| = R·√3/2):** pikendus lõikab peatelge täpselt peegli
      tipus ja edasi juba tipust EESPOOL, seega annaks valem nulli ja siis
      negatiivse arvu. Funktsiooni lubadus on „kaugus peegli taga" – seda
      ta seal enam ei täida (`reflectParallelRay(1, 0.9)`,
      `reflectParallelRay(1, Math.sqrt(3) / 2)`).
    - **θ = 90° (|h| = R, peegli serv):** kiir tabab peeglit riivamisi ja
      peegeldub sama teed tagasi; valemis `R · cos 2θ / (2 · cos θ)` oleks
      nimetajas cos 90° = 0 ehk lõpmatus. Selle püüab kinni sama piir, sest
      R > R·√3/2 (`reflectParallelRay(0.5, 0.5)`).

    `mirrorBulge` ja `normalAngleDeg` jäävad laiema vahemiku juurde
    (|h| ≤ R): peegli serv on nende jaoks mõistlik sisend ja simulatsioon
    joonistab nende abil kogu kaare. Ainult peegeldunud kiire lõikepunkt
    kaotab mõtte varem.

## Sammud

### 1. hook – häälestus

Joonis (`figures.tsx`, silt `kp-turvapeegel`): kaks kõrvutist pilti poe
vahekäigust ülalt vaadatuna. Vasakul sama suur TASANE peegel seina peal:
katkendlikud jooned näitavad kitsast ala, mis peeglisse mahub – üks riiul.
Paremal sama suur ümar kumer peegel: vaateväli on lai lehvik, mis katab
terve vahekäigu koos mõlema otsaga. Sildid „tasapeegel" ja „kumerpeegel",
mõlema juures „sama suur peegel".

„Poe laes on ümar peegel, milles müüja näeb korraga tervet vahekäiku.
Miks ei piisa sama suurest tasasest peeglist?"

Eesmärk õpilase keeles: „Tean, mis juhtub valgusega kumerpeeglil, ja
oskan öelda, kus on tema näiline fookus."

### 2. theory – kumerpeegel ja näiline fookus (üks ekraan)

- **Kõverpeegleid on kahte sorti.** Mõlemat võib vaadelda läikiva kera ühe
  tükina. **Nõguspeeglil** (eelmine moodul) on läikiv pind kera SEEST
  poolt, **kumerpeeglil** VÄLJAST poolt – nagu lusika tagakülg või
  jõulukuul. Kumerpeegli kera keskpunkt jääb peegli TAHA.
- **Peegeldumisseadus kehtib ka siin – muutub ainult ristsirge.**
  Kerapinnal on ristsirge iga punkti oma **raadiuse siht** ehk joon kera
  keskpunkti poole; kumerpeeglil läheb see joon peegli taha. Kui see joon
  on olemas, käib kõik nagu enne: **langemisnurk = peegeldumisnurk**. Iga
  väikest tükki kõverast peeglist võib vaadelda kui pisikest tasapeeglit.
- **Paralleelsed kiired hajuvad laiali.** Peateljega paralleelne
  valgusvihk peegeldub kumerpeeglilt nii, et kiired lähevad üksteisest
  eemale. Peegli ees ei koondu nad kunagi ühte punkti – kumerpeegel on
  **hajutav** peegel.
- **Pikendused lõikuvad peegli taga.** Kui peegeldunud kiired tagurpidi
  pikendada (katkendliku joonega, peegli taha), lõikuvad kõik pikendused
  ühes punktis. Seda punkti nimetatakse **näiliseks fookuseks**. Näiline
  ta on sellepärast, et seal ei ole ühtegi valguskiirt: valgus läks
  peeglilt hoopis laiali. Sinna pandud paber ei süttiks kunagi.
- **Näiline fookus on peegli taga poole kera raadiuse kaugusel.** Kui
  peegel on välja lõigatud 80 cm raadiusega kerast, on näiline fookus
  peegli taga 40 cm kaugusel. Mida lamedam peegel (suurem raadius), seda
  kaugemal ta on ja seda vähem peegel hajutab.
- **Sellepärast on kumerpeegli vaateväli lai.** Peeglisse jõuab valgust
  palju laiemast alast kui sama suurde tasapeeglisse, ja kõik see mahub
  peeglisse korraga ära. Hinnaks on see, et esemed paistavad **väiksemad**
  – peeglis on ju rohkem asju sama pinna peal.
- Joonis (`kp-ristsirge`): kumerpeegli kaar, kera keskpunkt C peatelje peal
  peegli TAGA, üks paralleelne kiir kohtumispunktis P; P-st läbi peegli C-ni
  katkendlik joon sildiga „ristsirge = raadius"; nurgad α ja β kiire ja
  ristsirge vahel, mõlemad kaarega ja sildiga „α = β"; peegeldunud kiire
  katkendlik pikendus peegli taha kuni peateljeni, silt „näiline fookus".

### 3. predict – hüpotees (lukustub!)

„Kumerpeegli poole saadetakse peateljega paralleelne valgusvihk. Mis
peegeldunud kiirtest saab?"

(a) nad koonduvad peegli ees ühte punkti, nagu nõguspeeglil
(b) **nad hajuvad laiali; ühte punkti lõikuvad ainult nende pikendused
    peegli taga**
(c) nad tulevad täpselt sama teed tagasi, kust tulid

+ „Miks sa nii arvad?" (vabatekst).

Õige on (b). Vastust EI avaldata enne sammu 4.

Vale (a) saab sildi `koverpeegel-alati-koondab`, vale (c) sildi
`kumer-peegeldab-tagasi`.

### 4. explore – simulatsioon

SVG külgvaates, **ühtne mõõtkava mõlemal teljel** (nurgad on joonisel
päris nurgad – seda ei tohi rikkuda, sest ekraanil on kirjas α ja β).
Vasakul servas peegli kaar (poolkõrgus 10 cm, kaar `mirrorBulge` järgi,
võimenduseta – lamedam peegel PAISTABKI peaaegu sirge), tipp paremale
ehk valguse poole kummis; peatelg katkendliku joonena; kera keskpunkt C
peegli taga märgitud, kui ta joonisele mahub. Peegli tagune ala on
selgelt eristatud (heledam taust + silt „peegli tagune – siin valgust ei
ole"), sest kogu mooduli mõte on see vahe.

Paremalt tuleb neli peateljega paralleelset kiirt kõrgustel −10, −5, +5 ja
+10 cm; nad peegelduvad tagasi paremale ja lähevad teineteisest eemale.
Lisaks on **valitud kiir** (liugur „kiire kõrgus") paksu joonega ja tema
juures on kirjas ristsirge (katkendlik joon punktist läbi peegli kera
keskpunkti), nurgakaared α ja β ning nende arvud. Nooleotsad näitavad
valguse liikumissuunda; pikendustel nooleotsi EI OLE (valgus sinna ei
liigu).

Kastikesed paremal:

- „Raadius R = 100 cm"
- „Näiline fookus on **50 cm** peegli taga"
- „Valitud kiir: langemisnurk 5,7° · peegeldumisnurk 5,7°"

Iga nurk on ekraanil nii kaarena kui ka ARVUNA, ja näiline fookus nii
punktina kui ka mõõdujoonena koos arvuga – värv ega joonis ei ole kunagi
ainus info kandja (DISAINIJUHIS). 360 px laiusel ekraanil lähevad
kastikesed joonise alla, mitte kõrvale.

Juhtnupud (kaks korraga, moodulilepingu järgi):

- **liugur: kera raadius R** – 50…200 cm, samm 10 cm (algväärtus 100 cm)
- **liugur: valitud kiire kõrgus h** – 0…10 cm, samm 1 cm (algväärtus 10 cm)
- **lüliti: näita pikendusi** – „ainult valguskiired" / „näita pikendusi
  peegli taga" – AVANEB alles pärast ülesannet 3 (silt `pikenduste-lyliti`).
  Enne seda on peegli tagune ala tühi ja õpilane näeb ainult seda, mis
  päriselt juhtub: kiired lähevad laiali. Nii ei ole korraga muudetavaid
  suurusi kolm, ja mis veelgi tähtsam – näiline fookus tuleb ekraanile
  alles siis, kui õpilane on juba näinud, et valgus sinna ei lähe.

  **NB!** Ülesanded 1 ja 2 küsivad näilise fookuse kaugust, seega peab
  mõõdujoon „näiline fookus 50 cm peegli taga" ja punkt olema nähtaval
  algusest peale. Lüliti puudutab ainult KIIRTE PIKENDUSI (katkendlikud
  jooned peegeldunud kiirtest tagasi näilise fookuseni), mitte fookuse
  punkti ennast.

Tolerantsid ja ühikud: kauguste ühik on ekraanil ja vastustes **cm**,
tolerants **2 cm** (liuguri samm on 10 cm ja fookus liigub 5 cm kaupa –
2 cm lubab lugemisvea, aga ei lase naaberväärtust õigeks). Model.ts
arvutab meetrites: liuguri väärtus läheb mudelisse
`metresFromCentimetres` kaudu ja vastus tuleb ekraanile
`centimetresFromMetres` kaudu. Nurkade ühik on **°**, tolerants **0,5°**.
Simulatsioon on ideaalne, seega on need LUGEMISTOLERANTSID, mitte
mõõtemääramatus.

Ülesanded:

1. „Jäta raadiuseks 100 cm. Kui kaugel peegli taga on näiline fookus?"
   (50 cm; tolerants 2 cm; ühik cm; vihje 1: „vaata mõõdujoont peegli
   taga"; vihje 2: „võrdle raadiuse arvuga")
2. „Sea raadiuseks 160 cm. Kui kaugel on näiline fookus nüüd?" (80 cm;
   tolerants 2 cm; ühik cm; vihje: „mitu korda väiksem on see raadiusest?")
   Selgitus pärast vastamist: näiline fookus on alati poole raadiuse
   kaugusel, seega 160 : 2 = 80 cm. Lamedam peegel (suurem raadius) hajutab
   vähem ja tema näiline fookus on kaugemal.
3. „Sea kiire kõrguseks 10 cm ja loe langemisnurk. Kui suur on
   peegeldumisnurk?" (valik) (a) null (b) **täpselt sama suur** (c) kaks
   korda suurem.
   Selgitus: kumeral peeglil kehtib täpselt sama peegeldumisseadus mis
   tasapeeglil – ainult ristsirge tuleb kera keskpunktist, mis on siin
   peegli taga. Pärast seda ülesannet avaneb pikenduste lüliti.
4. „Lülita pikendused sisse. Kus peegeldunud kiired päriselt kokku
   saavad?" (valik) (a) näilises fookuses peegli taga (b) **mitte kusagil –
   peegli ees nad hajuvad ja peegli taha ei jõua ükski kiir** (c) peegli
   pinnal.
   Selgitus: näilises fookuses lõikuvad ainult katkendlikud pikendused.
   Valgust seal ei ole – sellepärast ongi ta NÄILINE. See on ka ennustuse
   (samm 3) vastus.

### 5. practice – harjutamine

1. **Näidis (lahendatud):** Kumerpeegel on välja lõigatud kerast raadiusega
   60 cm. Kus on tema näiline fookus? Näiline fookus on poole raadiuse
   kaugusel: 60 cm : 2 = **30 cm**, peegli TAGA peateljel. Sinna lõikuvad
   peegeldunud kiirte pikendused.
2. **Osaline (täida lünk):** Peegli kera raadius on 90 cm. Näiline fookus
   on peegli taga 90 : 2 = ___ cm kaugusel. (vastus 45; tolerants 0,5 cm; ühik
   cm; vihje: „pool raadiusest")
3. **Iseseisev (pöördülesanne):** Läikiva jõulukuuli näiline fookus on
   2,5 cm kuuli pinna taga. Kui suur on kuuli raadius? (vastus 5;
   tolerants 0,5 cm; ühik cm; vihje 1: „näiline fookus on pool raadiusest –
   mis on siis raadius?"; vihje 2: „2,5 cm on pool millest?")
4. **Iseseisev (joonise lugemine):** Joonis (`kp-kolm-kiirt`): kumerpeegel,
   peatelg, kolm paralleelset kiirt peegelduvad laiali; nende pikendused on
   katkendliku joonega peegli taga; peateljele on märgitud kolm punkti:
   A (peegli ees, seal kus paralleelsed kiired peeglile jõuavad),
   B (peegli taga, kus pikendused lõikuvad) ja C (peegli taga kaugemal,
   kera keskpunktis). Küsimus: „Milline punkt on peegli näiline fookus?"
   (a) A (b) **B** (c) C. Vihje: „fookus on seal, kus jooned kokku saavad
   – ja kumerpeeglil saavad kokku ainult pikendused."
   Vale (c) saab sildi `fookus-on-kera-keskpunkt`.
5. **Ülekanne (valik, mitu õiget):** Poe laes on ümar kumerpeegel.
   Millised väited on õiged?
   **peeglilt tulevad kiired hajuvad laiali**,
   **peeglisse mahub korraga laiem ala kui sama suurde tasapeeglisse**,
   **peeglis paistavad inimesed väiksemad kui nad on**,
   kumerpeegel teeb esemed päriselt väiksemaks,
   peegli taga näilises fookuses on koht, kuhu koondub valgus.
   `shuffle: true`. Vale „teeb esemed päriselt väiksemaks" saab sildi
   `kumer-teeb-esemed-vaiksemaks`, vale „näilises fookuses koondub valgus"
   sildi `nailine-fookus-on-paris-fookus`.
   Selgitus pärast vastamist: peegel ei muuda ühtegi eset – muutub ainult
   see, kui suurena me teda peeglis NÄEME. Ja näiline fookus on koht, kus
   lõikuvad ainult pikendused: valgus sinna ei jõua, seepärast ei saa sinna
   ka midagi põlema panna (nõguspeegli päris fookusega saaks).

### 6. exit – väljumispilet

1. Mis on kumerpeegel? (a) peegel, mille läikiv pind on kera seest poolt
   (b) **peegel, mille läikiv pind on kera väljast poolt**
   (c) peegel, mis on lihtsalt suurem kui tasapeegel
2. Kumerpeegel on lõigatud kerast raadiusega 24 cm. Kui kaugel peegli taga
   on näiline fookus? (12 cm; tolerants 0,5 cm; ühik cm; vihje: „pool
   raadiusest")
3. „Sõber ütleb: „Paneme kumerpeegli näilisesse fookusesse paberi – küll
   ta seal põlema läheb, fookus on ju fookus." Mida sa talle vastad?"
   (vabatekst, õpetajale nähtav – oodatav mõte: kumerpeeglilt peegeldunud
   kiired lähevad laiali ja peegli taha ei jõua ükski kiir; näilises
   fookuses lõikuvad ainult kiirte pikendused ehk mõttelised jooned, seal
   ei ole valgust ega soojust. Põlema paneks nõguspeegel, mille fookuses
   valgus päriselt koondub)

## Väärarusaamad

| Silt | Väärarusaam | Kuidas moodul selle ümber lükkab |
|---|---|---|
| `koverpeegel-alati-koondab` | iga kõverpeegel koondab valguse fookusesse (nõguspeegli üldistus) | predict + explore: kiired lähevad ekraanil nähtavalt laiali, peegli ees ei ole ühtegi lõikepunkti |
| `kumer-peegeldab-tagasi` | kumeralt peeglilt tuleb valgus sama teed tagasi | explore: valitud kiire α ja β on ekraanil ja peegeldunud kiir kaldub teljest 2α võrra eemale |
| `nailine-fookus-on-paris-fookus` | näilises fookuses koondub valgus (saab paberi põlema panna) | explore-4 + pikenduste lüliti (pikendustel ei ole nooleotsi) + practice-5 ja exit-3 |
| `nailine-fookus-on-peegli-ees` | fookus on peegli ees, nagu nõguspeeglil | simulatsiooni mõõdujoon läheb tipust TAHAPOOLE, peegli tagune ala on eraldi märgitud |
| `kumeral-seadus-ei-kehti` | kõveral pinnal peegeldumisseadus ei kehti, kiired peegelduvad „kuidas juhtub" | teooria (ristsirge = raadius) + explore-3, kus α ja β on iga kiire juures ekraanil võrdsed |
| `fookus-on-kera-keskpunkt` | näiline fookus on kera keskpunktis | teooria „pool raadiusest" + practice-4, kus C on joonisel eraldi punkt |
| `kumer-teeb-esemed-vaiksemaks` | kumerpeegel vähendab esemeid päriselt | practice-5 selgitus: muutub ainult see, kui suurena me eset peeglis näeme |
| `lamedam-hajutab-rohkem` | mida lamedam peegel, seda rohkem ta hajutab | explore-1 ja 2: pind jääb samaks, raadius kasvab, näiline fookus läheb kaugemale ja kiired lahknevad vähem |

## Õpetajale (teacher.ts)

- **(K) lusikakatse, kumer külg (2 min, vahendeid on igas klassis):** vaata
  läiget supilusikat tagant poolt. See on kumerpeegel: nägu on alati väike
  ja püstine, ükskõik kui kaugelt vaadata – erinevalt nõgusast küljest, kus
  nägu teatud kauguselt pea peale pöördus. Sama katse tegite nõguspeegli
  moodulis; nüüd tehke kõrvutine võrdlus mõlema küljega. Kui klassis on
  jõulukuul või ratta kroomitud kell, sobivad needki.
- **(K) poe turvapeegel või liikluspeegel:** kui koolis või kooli lähedal on
  ümar peegel (koridori nurgas, parklas, ristmikul), mine sinna klassiga
  või näita fotot. Lase õpilastel kirjeldada, kui suur ala peeglis paistab
  ja kui suurena inimesed paistavad. Küsi, miks ei ole seal tasast peeglit.
  Rakendusi (auto külgpeegel, hoiatus „esemed on lähemal kui paistavad")
  vaatame eraldi moodulis – siin piisab põhimõttest.
- **Ohutus:** kumerpeegel valgust kokku ei koonda, seega ei sütita ta
  midagi põlema – see on hea koht öelda välja vahe nõguspeegliga, mille
  fookusesse pandud paber päikese käes süttib. Aga ohutu ei tähenda „tee
  mida tahad": ka hajutatud päikesevalgus on peeglilt ere ja **peegeldunud
  päikest ei suunata kellelegi silma ega vaadata peeglist Päikest
  ennast** – pimestada ja silma kahjustada saab ka koondamata valgusega.
  Kui keegi soovib koondamiskatset teha, kehtib nõguspeegli mooduli
  ohutusjuhend, mitte selle oma.
- **Miks päris lai kumerpeegel „venitab" pilti:** kerapeegel koondab
  telje lähedaste kiirte pikendused hästi, servadelt tulevate omad
  lõikuvad peeglile lähemal – simulatsioonis on peegel meelega nii kitsas
  (|h| ≤ 0,2 · R), et seda viga jääb alla 3 % (halvimal juhul 2,1 %). Väga kumeral peeglil paistab see kohe välja ja
  just nii tehaksegi lõbustuspargi kõverpeeglid.
- **Aruteluküsimused:** Miks paistab jõulukuulis terve tuba korraga? Kumb
  peegel sobib poe nurka ja miks – kumer või nõgus? Mis juhtuks
  turvapeegliga, mida hakataks aina lamedamaks tegema? Kui kumerpeegel
  näitab kõike väiksemana, siis miks ta üldse abiks on?
- **Millal see moodul tunnis:** kohe PÄRAST moodulit `noguspeegel` – kaks
  kõverpeeglit on üks paar. Sama tunnis või kõrvuti tundides; kumbagi
  eraldi õpetada saab, aga vahe (koondav / hajutav, päris / näiline
  fookus) jääb nõrgaks, kui nad on kaugel teineteisest.
- **Tunniplaan (15 min):** 2 min hook + 3 min teooria · 2 min hüpotees ·
  5 min simulatsioon · 2 min harjutamine · 1 min väljumispilet.
  45-minutilises tunnis mahub kõrvale lusikakatse ja `noguspeegel`.

## Kordamiskaardid (5 tk)

| id | tüüp | küsimus | vastus |
|---|---|---|---|
| rc-1 | concept | Mis on kumerpeegel? | Kõverpeegel, mille läikiv pind on kera väljast poolt (nagu lusika tagakülg või jõulukuul). Peateljega paralleelse valgusvihu ta hajutab laiali |
| rc-2 | concept | Mis on kumerpeegli näiline fookus? | Punkt peegli taga peateljel, kus lõikuvad peegeldunud kiirte pikendused. Näiline sellepärast, et valgust seal ei ole – peegli taha ei jõua ükski kiir |
| rc-3 | calc | Kumerpeegel on lõigatud kerast raadiusega 70 cm. Kui kaugel on näiline fookus? | 35 cm peegli taga (pool raadiusest) |
| rc-4 | explain | Kas kõveral peeglil kehtib peegeldumisseadus? | Jah, igas punktis täpselt samamoodi: langemisnurk = peegeldumisnurk. Erinevus on ainult selles, et ristsirge on igas punktis raadiuse siht – kumerpeeglil läheb see joon peegli taha kera keskpunkti |
| rc-5 | transfer | Miks on poe turvapeegel kumer, mitte tasane? | Kumer pind hajutab valgust, seega jõuab peeglisse valgust palju laiemast alast ja terve vahekäik mahub korraga ära. Hinnaks on see, et esemed paistavad väiksemad |
