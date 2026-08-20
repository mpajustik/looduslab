# Mooduli spetsifikatsioon: Helkur

Ainekava seos (AINEKAVA-fyysika-8.md): plokk P1; õpitulemus: P1-T2 (osa:
nurkpeegli ülekanne päris seadmesse – helkur, jalgratta helkur,
teemärgid); mõisted, mida õpetab: – (rakendusmoodul, kasutab moodulist
`nurkpeegel` tulnud tulemust „kaks täisnurga all peeglit saadavad kiire
tagasi sinna, kust ta tuli"); praktiline töö: –. Vanus: 8. klass.
Kestused: demo 5 min, tund 15 min, iseseisev 12 min. Tüüp: rakendusmoodul
(üks õpieesmärk, 6 sammu).

slug: `helkur` · id: `physics.helkur`

## Ainekava seos (täpsemalt)

- **Plokk:** P1 Valgus ja valguse sirgjooneline levimine. Peegeldumine ja
  neeldumine
- **Õpitulemused:**
  - **P1-T2 osa** – „tunneb valguse sirgjoonelise levimise ja peegeldumise
    seadust, konstrueerib nende põhjal jooniseid ja korraldab katsed".
    Uut seadust siin ei tule: moodul `nurkpeegel` andis pöörde δ = 2·θ ja
    selle erijuhu θ = 90° → δ = 180°. See moodul vastab küsimusele, MIKS
    see erijuht on pimedal maanteel elu ja surma küsimus ja mis on selle
    hind.
- **Õppesisu punktid:** „peegeldumisseadus; tasapeegel, kumer- ja
  nõguspeegel" – tasapeeglite rakenduslik pool
- **Põhimõisted, mida moodul ÕPETAB:** – rakendusmoodul ei oma ühtki
  ainekava põhimõistet. **Tasapeegel**, **valguskiir** ja **mattpind**
  kuuluvad moodulile `peegeldumisseadus`. Manifesti `concepts` väljale
  lähevad kaks asja, mida see moodul PÄRISELT seletab ja mida ainekava
  nimeliselt ei nimeta: **helkur** ja **tagasipeegeldumine**.
  Katvusraport (samm 4.0) loeb tundmatu mõiste `extraConcepts` alla ehk
  märkuseks, mitte ainekava katteks – täpselt nagu moodulites
  `varjutused`, `kumerpeegli-rakendused` ja `noguspeegli-rakendused`.
  **Siia EI tohi kirjutada `tasapeegel` ega `mattpind`** (ainekava P1
  põhimõisted): raport võrdleb mõisteid nime järgi ja siis paistaks üks
  põhimõiste kaetuna kahest kohast.
- **Praktiline töö:** – (P1-PT1…PT4 on kõik juba teiste moodulite all).
  Õpetajajuhendi (K) pimeda klassi katse taskulambiga on demonstratsioon,
  mitte ainekava praktiline töö.
- **Teema olulisus → hook:** „igapäevased valgusnähtused looduses ja
  tehnikas" – helkur maksab 50 senti, ei tee ise valgust ega vaja patareid,
  aga teeb pimedal maanteel jalakäija mitu korda varem nähtavaks. Miks ta
  autotulede käes „süttib", aga pimedas toas ei paista?
- **Metoodilised soovitused, mida järgin:** ainekava nõuab
  peegeldumisseaduse käsitlemist „läbi jooniste eri olukordades" ja seob
  optika igapäevaeluga. Siin on kaks tasast peeglit päris olukorras:
  simulatsioon on maantee pealtvaade, kus mõõdetakse, kas tagasitulev
  valgus jõuab autotuledest juhi silmadeni.
- **Õpilase tegevused:** (D) uurib simulatsioonis, kui lai on tagasituleva
  valguse plekk auto juures ja kas see ulatub tuledest juhi silmadeni;
  (D) arvutab, mitu meetrit möödub tagasitulev kiir sihist, kui helkuri
  nurk on kraadi võrra vale; (K) pimeda klassi katse helkuri, taskulambi
  ja matt paberiga õpetajajuhendis

## Piirid (mida see moodul EI tee)

- **Kiirte käik kahe peegli vahel ja pööre δ = 2·θ** – moodul `nurkpeegel`
  (juba ehitatud). Siin on see EELDUS: teooria kordab tulemuse kahe
  lausega („kaks peeglit täisnurga all pööravad kiirt 180°", „vastus ei
  sõltu sellest, kust kiir tuli") ja edasi kasutab. Ühtegi uut langemis-
  või peegeldumisnurga ülesannet siin ei ole ja mudel ei arvuta ühtki
  langemispunkti.
- **Kolmemõõtmeline kuubinurk** joonisena ja arvutusena. Moodul ÜTLEB
  välja, et päris helkuris on kolm peeglit risti (ainult siis tuleb kiir
  tagasi ka siis, kui valgus ei ole peeglite ühisservaga risti) ja
  näitab seda ühel joonisel, aga ei konstrueeri ruumilist kiirte käiku ega
  arvuta ühtki ruumilist nurka. 360 px ekraanil ei näita seda ausalt ja
  ruumigeomeetria on gümnaasium. Sama piir on kirjas ka failis
  MOODUL-nurkpeegel.md.
- **Optika kvaliteet ja difraktsioon.** Tagasituleva valguse hajuvusnurk ω
  on selles moodulis ANTUD arv (liugur), mitte arvutatud suurus. Päris
  helkuri hajuvus tuleb kolmest asjast korraga – nurgavead, valguse
  lainelisus pisikese ava peal ja kihi materjal –, millest ükski ei ole
  8. klassi teema. Mudel ütleb ainult, mis juhtub ANTUD hajuvuse korral.
- **Fotomeetria** (kandela, luks, helkuri mõõdetud tagasipeegeldusarv).
  Moodul võrdleb ainult SUHET: mitu korda tihedamalt tuleb valgus tagasi
  kui matilt pinnalt. Ühtki valgustugevuse ühikut ekraanil ei ole.
- **Peatumisteekond ja nähtavuskaugus meetrites** („helkuriga näeb juht
  150 m, ilma 30 m") – need arvud sõltuvad tuledest, ilmast ja kiirusest
  ning pidurdusteekond ise on plokk P3 (moodul `peatumisteekond`). Siin on
  nähtavus ainult hooki ja õpetajajuhendi jutt, mitte ülesanne.
- **Valguse murdumine.** Päris autohelkur ja teemärk ei ole peeglid, vaid
  läbipaistvad prismad, kus valgus peegeldub täielikult (P2). Moodul
  ütleb selle ühe lausega õpetajajuhendis ja jätab murdumise ploki P2
  moodulitele – kiirte käik prismas on sama nurkpeegli lugu, aga täieliku
  peegeldumise seletamine on veel ees.
- **Kumer- ja nõguspeegli rakendused** – moodulid
  `kumerpeegli-rakendused` ja `noguspeegli-rakendused`. Siin on nad
  ainult valedeks valikvastusteks kohas, kus õpilane peab valima, MILLINE
  peegel kuhu sobib.

## Allikad

- **Teooria tugi:** `sisu/allikad/POHIVARA-F8-INDEKS.md` punkt 18.4 ja
  joonis 50 (lk 27) – faktikontroll: kaks tasapeeglit täisnurga all
  saadavad kiire välja esialgse kiirega vastassuunas. Sama joonis oli
  aluseks moodulile `nurkpeegel`; siinne rakenduste loend ja KÕIK arvud on
  selle mooduli omad ja tulevad model.ts geomeetriast. Juhi silmade ja
  esitulede vahe 0,5 m on tavalise sõiduauto mõõt (mõõdetav igal
  parkimisplatsil), mitte allikast võetud ülesanne. Sõnasõnalist teksti ei
  kopeerita (vt ALLIKAD.md).
- **Ülesannete näidised:** – (kõik arvud tulevad valemitest
  δkõrval = 2·|θ − 90°|, h = L·tan α ja võimendus = 1/(1 − cos ω))

## Füüsika (model.ts jaoks)

Moodul arvutab ühte asja: **kui täpselt läheb valgus sinna tagasi, kust ta
tuli, ja kellele sellest kasu on.** Miks kaks täisnurga all peeglit valguse
üldse tagasi saadavad, tuli moodulist `nurkpeegel` – siin on selle
TAGAJÄRG arvudes.

Kõik nurgad on **kraadides**, pikkused **meetrites** (moodulileping:
SI-ühikud sees). **Ühikuteisenduse funktsioone selles moodulis EI ole** –
esimene kord selles peeglisarjas. Põhjus on aus: kõik ekraanil olevad
suurused (kaugus 10…150 m, kõrvalekalle 0,3…3,5 m, silmade vahe 0,5 m) on
juba meetrites loetavad arvud ja nurgad kraadides. Kui hiljem tekib
sentimeetreid vajav ülesanne, tuleb teisendusfunktsioon juurde –
möödaminnes ümber arvutatud ühik on selle projekti kõige vaiksem viga
(vt `noguspeegli-rakendused`).

### Kokkulepped

- **Peeglite nurk θ** (`mirrorAngleDeg`) on nurk helkuri kahe peegli
  vahel, kraadides. Ideaalne helkur on täpselt 90°.
- **Kõrvalekaldenurk** (`deviationDeg` argumendina) on nurk tagasituleva
  kiire ja täpse tagasisuuna vahel.
- **Hajuvusnurk ω** (`spreadDeg`) on tagasituleva valguskoonuse
  **pool-avanurk**: nurk koonuse teljest servani. Pool, mitte täisnurk –
  sest just poolnurka võrreldakse silma ja tulede vahelise nurgaga ning
  segamini läinud pool teeks kõik arvud kaks korda valeks (sama lõks kui
  nurkadega moodulis `kumerpeegli-rakendused`). Nimi funktsioonis on
  `spreadDeg` ja kommentaar ütleb „pool-avanurk" välja.
- **Kaugus L** (`distanceM`) on kaugus helkuri ja auto vahel.
- **Kõrvalekalle h** (`offsetM`) on ristsuunaline vahe – kas silmade ja
  tulede vahe või see, kui palju tagasitulev kiir sihist mööda läheb.

### Kolm seost, millel moodul seisab

1. **Vale nurk kahekordistub: kõrvalekalle = 2·|θ − 90°|.**
   *Miks:* moodul `nurkpeegel` andis pöörde δ = 2·θ. Täpne tagasitulek
   tähendab pööret 180°, seega on kõrvalekalle |2·θ − 180°| = 2·|θ − 90°|.
   Poole kraadi suurune nurgaviga peeglites saadab valguse **kraadi**
   võrra valesse suunda. Helkur ei ole seepärast koht, kus „umbes
   täisnurk" kõlbab.
2. **Nurk annab kauguse peal meetrid: h = L · tan α.**
   *Miks:* täisnurkne kolmnurk – see on kogu geomeetria. Kraadi suurune
   viga on 100 m kaugusel **1,7 m** ehk rohkem kui pool autot.
3. **Tagasipeegeldumise võimendus = 1 / (1 − cos ω).**
   *Miks:* matt pind (valge riie, teekate) saadab talle langenud valguse
   laiali üle terve poolkera ehk ruuminurga 2π steradiaani. Helkur saadab
   sama valguse tagasi ainult koonusesse pool-avanurgaga ω, mille
   ruuminurk on 2π·(1 − cos ω). Suhe on 2π : 2π(1 − cos ω) = 1/(1 − cos ω).
   Poole kraadi juures on see **umbes 26 000 korda**.

Kaks tagajärge, mis annavad moodulile mõtte ja mille peale on ehitatud nii
predict kui explore:

- **Liiga täpne helkur oleks kasutu.** Kui hajuvust üldse ei oleks (ω = 0),
  läheks kogu valgus täpselt tagasi esituledesse – ja juhi silmad on
  tuledest umbes 0,5 m kõrval. 100 m kaugusel on see nurk 0,29°, seega
  peab tagasitulev koonus olema VÄHEMALT nii lai. Päris helkur on
  tahtlikult natuke „ebatäpne".
- **Aga ainult natuke.** Kui hajuvus oleks nagu matil pinnal (ω = 90°),
  oleks võimendus 1 ehk helkur oleks lihtsalt valge lapp. Kogu helkuri
  mõte on kitsas koonus – ja just seepärast ei näe teisel pool teed seisev
  inimene helkurit süttimas, kuigi juht näeb.

### Funktsioonid

- `returnDeviationDeg(mirrorAngleDeg)` → **2 · |θ − 90|**. Mitu kraadi
  kaldub tagasitulev kiir täpsest tagasisuunast kõrvale.
  Lubatud vahemik **85° ≤ θ ≤ 95°** ja see piir on sisuline, mitte
  ilutunne: sellest kaugemal ei ole tegemist enam helkuriga, vaid
  nurkpeegliga (moodul `nurkpeegel`, mille `deviationDeg` katab kogu
  vahemiku 0…90°). Juba θ = 95° annab kõrvalekalde 10° ehk 100 m juures
  17 m – kaugelt üle tee laiuse. Mudel, mis ütleks „helkur" ka 60° kohta,
  õpetaks valet asja.
- `offsetAtDistanceM(deviationDeg, distanceM)` → **L · tan α**. Mitu
  meetrit läheb kiir kaugusel L sihist mööda, kui ta on nurga α võrra
  kõrvale kaldu. Sama funktsioon annab ka tagasituleva valgusplekki
  **raadiuse**, kui talle anda hajuvusnurk ω (plekki läbimõõt on siis
  2 × tulemus) – üks geomeetria, kaks kasutust, mitte kaks funktsiooni.
- `angleFromOffsetDeg(offsetM, distanceM)` → **atan(h / L)** kraadides.
  Mis nurga alt paistavad helkuri juurest vaadates kaks asja, mis on
  teineteisest h kaugusel, kui nad ise on L kaugusel. Simulatsioonis on
  see nurk juhi silmade ja esitulede vahel. See on funktsiooni
  `offsetAtDistanceM` pöördfunktsioon ja seda valvab test.
- `retroreflectionGain(spreadDeg)` → **1 / (1 − cos ω)**. Mitu korda
  tihedamalt tuleb valgus tagasi kui matilt pinnalt. Lubatud
  **0° < ω ≤ 90°**; ω = 90° annab täpselt 1 (matt pind ise) ja on mudeli
  mõistlikkuse ankur, ω = 0 viskab vea (ideaalne helkur, lõpmatu
  võimendus – mudel ei vasta küsimusele, mille peale tema sõnastus enam ei
  kehti; sama põhimõte nagu `solarConcentration` piiril moodulis
  `noguspeegli-rakendused`).

**Miks EI ole konstanti „juhi silmade kaugus esituledest 0,5 m"** (nagu on
`SUN_ANGULAR_DEG` moodulis `noguspeegli-rakendused`): Päikese nurk on
looduskonstant, sõiduauto mõõt on stsenaariumi arv. Ta tuleb
`activities.ts`-ist ja Simulation.tsx-ist argumendina sisse – nii saab
õpetajajuhend rääkida ka veokist (2 m) ilma mudelit puutumata.

**Miks EI ole funktsiooni „kas valgus jõuab silma"** (ω ≥ atan(h/L)):
see on ühe võrdlusmärgi jagu loogikat, mis kuulub Simulation.tsx-i
kuvamisse, ja õpilase vastust kontrollib checker fikseeritud arvu vastu.
Kasutajata mudelifunktsioon oleks kood, mida keegi ei kutsu (reegel 7).

### Miks EI ole see mooduli `nurkpeegel` mudeli taaskasutus

`returnDeviationDeg` seisab valemi δ = 2·θ peal, mis on kirjas moodulis
`nurkpeegel`. Teda EI impordita: moodulid laaditakse dünaamiliselt ja iga
moodul on oma tükk (raudne reegel 13) – ristimport tõmbaks ühe mooduli
teise bundle'isse ja seoks kaks eraldi arhiveeritavat üksust kokku
(reegel 11). Kordus on üks rida ja teda valvab **ristkontrolli test**:
iga θ korral vahemikus 85…90 peab `returnDeviationDeg(θ)` võrduma
avaldisega |`nurkpeegel.deviationDeg(θ)` − 180|. See test on TESTIS, mitte
rakenduse koodis – täpselt sama otsus ja sama põhjendus nagu paaridel
`kumerpeegel` / `kumerpeegli-rakendused` ja `noguspeegel` /
`noguspeegli-rakendused`.

### Idealiseeringud (peavad olema model.ts kommentaaris kirjas)

1. **Helkur on üks kahe peegliga nurk.** Päris helkur on väli sadadest
   pisikestest KOLME peegliga kuubinurkadest (või prismadest). Kaks
   peeglit pööravad ümber ainult need kiire osad, mis on nende
   peeglipindadega risti; osa, mis liigub piki peeglite ühisserva, jääb
   muutmata. Seepärast tuleb kiir täpselt tagasi ainult siis, kui ta on
   ühisservaga risti – tänaval tuleb valgus aga ka ülalt ja alt. Kahe
   peegliga mudel annab õige loo ja õiged nurgad, aga kirjeldab ainult
   üht tasandit: seda, mis on ühisservaga risti.
2. **Tagasitulev valgus on terava servaga koonus**, mille sees on valgus
   ühtlane ja väljaspool ei ole midagi. Päris helkuri koonusel on servad
   hajusad ja heledus kahaneb sujuvalt; standardid mõõdavad seda mitme
   nurga juures (umbes 0,2°…1,5°). Mudel arvutab terava servaga – seepärast
   on ka simulatsiooni vastus „jõuab / ei jõua", mitte „kui ere".
3. **Kõik peeglid peegeldavad kogu valguse.** Kolm peegeldust tähendavad
   päris helkuril kolm korda ~5 % kadu, lisaks tolm ja kriimud. Mudelis
   intensiivsust ei ole – ainult ruuminurkade suhe.
4. **Helkur on risti valguse suunas.** Väga viltu (üle umbes 40°) pööratud
   helkurisse jõuab palju vähem valgust, sest tema nähtav pindala kahaneb
   ja osa kiiri ei läbi kõiki kolme peeglit. Mudel seda ei arvuta; see on
   õpetajajuhendi katse (helkuri keeramine käes).
5. **Valgus levib takistuseta.** Udu, vihma ja mustust mudel ei tunne,
   kuigi just need viivad päris helkuri tööulatuse alla.
6. **Matt pind hajutab ühtlaselt üle poolkera** (Lamberti pind). Päris
   valge riie hajutab veidi ebaühtlaselt – võimenduse arv 26 000 on
   suurusjärk, mitte mõõdetud väärtus, ja nii on ta ka ekraanil kirjas
   („umbes 26 000 korda").

**Testiväärtused (teadaolevad):** argumendid koodikujul (kümnendpunkt),
tulemused eestikeelse kümnendkomaga. Nurgad kraadides, pikkused meetrites.

| Kutse | Tulemus |
|---|---|
| `returnDeviationDeg(90)` | **0** (täpne helkur – kiir läheb täpselt tagasi) |
| `returnDeviationDeg(90.5)` | **1** (pool kraadi peeglites → kraad valgusele) |
| `returnDeviationDeg(89.5)` | **1** (vale suund annab sama tulemuse) |
| `returnDeviationDeg(91)` | **2** |
| `returnDeviationDeg(85)` | **10** (lubatud vahemiku ots) |
| `returnDeviationDeg(80)` | **viskab vea** (see ei ole enam helkur, vaid nurkpeegel) |
| `offsetAtDistanceM(1, 100)` | 1,7455065 (kraadi viga 100 m peal – üle poole auto laiusest) |
| `offsetAtDistanceM(2, 100)` | 3,4920769 |
| `offsetAtDistanceM(1, 50)` | 0,87275325 (pool kaugust, pool kõrvalekallet) |
| `offsetAtDistanceM(0.5, 100)` | 0,87268678 (hajuvuskoonuse RAADIUS 100 m peal) |
| `offsetAtDistanceM(0.1, 100)` | 0,17453310 (kõige kitsam liuguri seis: plekk 0,35 m) |
| `offsetAtDistanceM(0, 100)` | **0** (täpne helkur ei möödu millestki) |
| `offsetAtDistanceM(1, 0)` | **0** (auto juures ei ole veel kõrvale mindud) |
| `offsetAtDistanceM(90, 10)` | **viskab vea** (tan 90° ei ole olemas) |
| `angleFromOffsetDeg(0.5, 100)` | 0,28647651 (silmad tulede kõrval, 100 m kaugusel) |
| `angleFromOffsetDeg(0.5, 50)` | 0,5729387 |
| `angleFromOffsetDeg(0.5, 20)` | 1,4320962 (lähedal on nurk suur) |
| `angleFromOffsetDeg(0.5, 150)` | 0,19098522 |
| `angleFromOffsetDeg(0, 100)` | **0** (silm täpselt tule kohal) |
| `angleFromOffsetDeg(0.5, 0)` | **viskab vea** (nullkaugusel ei ole nurka) |
| `retroreflectionGain(0.5)` | 26 262,617 |
| `retroreflectionGain(0.4)` | 41 035,246 |
| `retroreflectionGain(0.25)` | 105 049,97 (kaks korda kitsam kui 0,5° – neli korda suurem) |
| `retroreflectionGain(1)` | 6565,7794 |
| `retroreflectionGain(2)` | 1641,5699 (kõige laiem liuguri seis) |
| `retroreflectionGain(90)` | **1** (matt pind ise – mudeli ankur) |
| `retroreflectionGain(0)` | **viskab vea** (lõpmatu võimendus) |

Piirjuhud ja invariandid (need on testid, mitte üksikread):

- **Täpne helkur on täpne:** `returnDeviationDeg(90)` on täpselt 0 ja
  `offsetAtDistanceM(0, L)` on 0 iga L korral. Kogu mooduli lähtekoht.
- **Nurgaviga kahekordistub ja on sümmeetriline:** test käib üle mitme ε
  korral ja nõuab `returnDeviationDeg(90 + ε)` =
  `returnDeviationDeg(90 − ε)` = 2ε. Sümmeetria on eraldi väide, sest
  õpilase intuitsioon ütleb, et „liiga terav" ja „liiga nüri" nurk on eri
  asjad.
- **Kõrvalekalle on kaugusega võrdeline:** `offsetAtDistanceM(α, 2L)` =
  2 × `offsetAtDistanceM(α, L)` (lubatud viga 1e-12). Kolm kaugust testis.
- **Pöördfunktsioon:** `offsetAtDistanceM(angleFromOffsetDeg(h, L), L)` = h
  iga lubatud h ja L korral (lubatud viga 1e-9) ja sama ka teistpidi. See
  on ainus koht, kus mudeli kaks poolt teineteist ristkontrollivad – ilma
  selleta võiks üks neist vaikselt kraadid ja radiaanid segi ajada ja
  ükski üksikväärtuse test seda ei näitaks.
- **Kitsam koonus = suurem võimendus:** `retroreflectionGain` on ω suhtes
  rangelt kahanev (test käib kogu liuguri võre 0,1…2,0° läbi) ja alati
  ≥ 1. Alumine ots 1 tähendab „mitte parem kui matt pind" – väiksem arv
  oleks mõttetu ja test valvab, et teda kunagi ei tuleks.
- **Poole kitsam koonus = neli korda suurem võimendus:** väikeste nurkade
  juures on 1 − cos ω ≈ ω²/2, seega `retroreflectionGain(ω/2)` ≈ 4 ×
  `retroreflectionGain(ω)`. Test nõuab seda 1 % täpsusega kolme ω korral –
  see on practice-2 vastuse alus ja peab olema mudelis kinni, mitte ainult
  tekstis.
- **Ristkontroll mooduliga `nurkpeegel`:** test võrdleb
  `returnDeviationDeg(θ)` väärtust avaldisega |`deviationDeg(θ)` − 180|
  mooduli `nurkpeegel` mudelist, θ = 85…90. **Ainus koht, kus selle
  mooduli testid teist moodulit puudutavad.**
- **Simulatsiooni turvavöönd:** liuguritega on ω = 0,1…2,0° ja
  L = 10…150 m. Test käib kogu võre läbi ja nõuab, et koonuse läbimõõt
  (2 × `offsetAtDistanceM(ω, L)`) on positiivne, lõplik ja jääb vahemikku
  0,03…11 m (siis mahub ta veel maantee joonisele) ning et võimendus jääb
  vahemikku 1600…660 000. Nii ei saa keegi hiljem liuguri piire muutes
  vaikselt ekraanile tuua arvu, mida joonis enam ei kanna.

Vigased sisendid viskavad vea (`RangeError`):

- mis tahes argument, mis ei ole lõplik arv (NaN, lõpmatus), ja iga
  tulemus, mis lõplikest sisenditest hoolimata üle voolab (sama joon mis
  moodulites `kumerpeegel`, `noguspeegel`, `kumerpeegli-rakendused`,
  `noguspeegli-rakendused` ja `nurkpeegel` – Codexi leiud, sammud 4.1ii ja
  4.1mm)
- `mirrorAngleDeg` < 85 või > 95 – vt funktsiooni juurest
- `deviationDeg` < 0 või ≥ 90 funktsioonis `offsetAtDistanceM`
  (**0 on lubatud**); `distanceM` < 0 (**0 on lubatud**, vastus 0)
- `offsetM` < 0 (**0 on lubatud**, vastus 0); `distanceM` ≤ 0 funktsioonis
  `angleFromOffsetDeg` – nullkaugusel ei ole nurka. **See on tahtlik vahe
  kahe naaberfunktsiooni vahel** ja peab olema kommentaaris kirjas: L = 0
  on `offsetAtDistanceM`-is mõistlik („auto juures ei ole veel kõrvale
  mindud"), `angleFromOffsetDeg`-is aga jagamine nulliga.
- `spreadDeg` ≤ 0 või > 90 funktsioonis `retroreflectionGain`

## Sammud

### 1. hook – häälestus

Joonis (`figures.tsx`, silt `hl-kaks-jalakaijat`): pime maantee
pealtvaates, all auto kahe esitulega ja valgusvihuga. Tee ääres kaks
jalakäijat: vasakul tumedas jopes ilma helkurita (peaaegu nähtamatu, ainult
hall kontuur), paremal sama jope, aga rinnal helkur, millest tuleb auto
poole kitsas hele kimp. Ühtki nurka joonisel ei mõõdeta – see on
häälestus, mitte joonis.

„Helkur maksab 50 senti, ei tarbi voolu ega tee ise ühtki valguskiirt.
Ometi näeb juht helkuriga jalakäijat mitu korda varem kui ilma. Kuidas
teeb üks tükk plastikut sellise vahe – ja miks ei paista ta pimedas toas
üldse?"

Eesmärk õpilase keeles: „Oskan seletada, miks helkur saadab valguse tagasi
just sinna, kust ta tuli – ja miks ta peab olema natuke ebatäpne."

### 2. theory – kaks peeglit nurgas, tagasi sinna, kust tuli (üks ekraan)

- **Meeldetuletus.** Kaks tasast peeglit nurga θ all pööravad kiirt kokku
  2·θ võrra, ükskõik kust kiir tuli (moodul `nurkpeegel`). Täisnurga all
  (θ = 90°) on pööre 180° – kiir läheb täpselt tagasi sinna, kust ta tuli.
  See ongi helkur.
- **Miks helkur ei ole tavaline peegel.** Tasapeegel saadab valguse ühte
  kindlasse suunda: teeäärne peegel viskaks autotulede valguse metsa,
  mitte juhile. Matt valge riie hajutab valguse igasse suunda laiali –
  juhini jõuab sellest tibatilluke osa. Helkur teeb kolmandat asja:
  saadab valguse tagasi ALLIKA poole. Seepärast „süttib" ta ainult selle
  jaoks, kes on valgusallika juures.
- **Miks ta pimedas ei paista.** Helkur ei tee valgust – ta saadab tagasi
  ainult selle, mis talle langeb. Ilma autotuledeta ei ole tal midagi
  tagasi saata.
- **Miks on päris helkuris kolm peeglit.** Kaks peeglit saadavad kiire
  täpselt tagasi ainult siis, kui valgus tuleb nende ühisservaga – kahe
  peegli kokkusaamise joonega – risti. Serva sihis liikuvat osa valgusest
  ei pööra kumbki peegel ümber, seega selline kiir tagasi ei tule.
  Tänaval tuleb valgus ka ülalt ja alt, seepärast on päris helkur täpitud
  pisikestest kuubinurkadest – kolm peeglit risti nagu toa nurk, kus kaks
  seina ja põrand kokku saavad.
- **Hind 1: vale nurk kahekordistub.** Kui peeglid ei ole täpselt 90°,
  vaid poole kraadi võrra viltu, kaldub tagasitulev kiir kraadi võrra
  kõrvale – ja 100 m kaugusel tähendab see 1,7 m ehk üle poole auto
  laiusest.
- **Hind 2: liiga täpne helkur oleks kasutu.** Juhi silmad on esituledest
  umbes 0,5 m kõrval. Täiesti täpne helkur saadaks kogu valguse tagasi
  TULEDESSE ja juht ei näeks midagi. Seepärast on päris helkur tahtlikult
  natuke ebatäpne: tagasitulev valgus läheb kitsa koonusena laiali, nii et
  ta ulatub tuledest silmadeni – aga mitte palju kaugemale.
- Joonis (`hl-kolm-pinda`): kolm kõrvutist skeemi, igal ühesugune
  sissetulev kiirtekimp vasakult. Vasakul tasapeegel (kimp läheb ühte
  suunda kõrvale), keskel mattpind (lühikesed kiired laiali igasse
  suunda), paremal nurkpeegel täisnurgaga (kimp läheb täpselt tagasi).
  Sissetulev ja väljuv kiir on eristatud nii noolte kui ka joonemustriga.

### 3. predict – hüpotees (lukustub!)

„Kolmel jalakäijal on rinnal kolm eri asja: ühel tavaline tasapeegel,
teisel valge matt riidetükk, kolmandal helkur. Kõik kolm on ühesuuruse
pinnaga ja kõik kolm ripuvad rinnal niisama, ilma et keegi neid auto poole
sihiks. Keda juht pimedal maanteel kõige kaugemalt näeb?"

(a) tasapeegliga jalakäijat – peegel peegeldab kõige rohkem valgust
(b) valge riidega jalakäijat – valge paistab pimedas kõige paremini
(c) **helkuriga jalakäijat – tema saadab valguse tagasi just auto poole**

+ „Miks sa nii arvad?" (vabatekst).

Õige on (c). Vastust EI avaldata enne sammu 4.

Vale (a) saab sildi `peegel-on-parem`, vale (b) sildi `valge-on-parem`.

### 4. explore – simulatsioon

SVG **pealtvaade** pimedale maanteele. All auto kahe esitulega ja juhi
silmadega (silmad on tuledest 0,5 m kõrval – see on ekraanil kirjas ja EI
muutu). Üleval tee ääres jalakäija helkuriga. Autolt helkurile läheb hele
kimp; helkurilt tuleb tagasi koonus, mille laius sõltub hajuvusnurgast.
Auto juures on koonuse plekk näha mõõdujoone ja arvuga ning silmade koht
on selle peal märgitud – kas plekk katab silmad või jääb neist ilma.

Ekraanil on korraga kaks asja: **päris koonus** (hajuvusega, laieneb) ja
õhem **ideaalse helkuri kiir** (hajuvuseta, tuleb täpselt tuledesse
tagasi) – eri värvi JA eri joonemustriga, mõlemal oma silt. Vahe nende
kahe vahel ongi mooduli mõte ja ta peab olema NÄHA, mitte ainult arvudes.

Kastikesed:

- „Juhi silmad on esituledest 0,5 m kõrval · helkur on risti"
- „Tagasituleva valguse plekk auto juures: läbimõõt **1,7 m**"
- „Silmad paistavad helkuri juurest tuledest **0,29°** kõrval"
- „Kas valgus jõuab juhi silma? **jah**"
- „Nii ere kui matt riie: **umbes 26 000 korda**"

Juhtnupud (kaks korraga, moodulilepingu järgi):

- **liugur: hajuvusnurk ω** – 0,1…2,0°, samm 0,1° (algväärtus **0,5°**,
  päris helkuri suurusjärk)
- **liugur: kaugus L** – 10…150 m, samm 10 m (algväärtus **100 m**).
  Mõlemad algväärtused on liuguri võre peal, seega saab õpilane alati
  alguskoha tagasi.

Tolerantsid ja ühikud: plekki läbimõõt **m**, tolerants **0,3 m** (ekraanil
on arv ühe kohaga peale koma); nurk **°**, tolerants **0,05°**; suhtarv
ühikuta, tolerants **300** (võimenduse arv on suurusjärk – vt
idealiseering 6). Simulatsioon on ideaalne, seega on need
LUGEMISTOLERANTSID, mitte mõõtemääramatus.

Ülesanded:

1. „Jäta ω = 0,5° ja kaugus 100 m. Kui lai on tagasituleva valguse plekk
   auto juures?" (1,7 m; tolerants 0,3 m; ühik m; vihje 1: „vaata
   mõõdujoont auto juures"; vihje 2: „arv on kastikeses „Tagasituleva
   valguse plekk"")
2. „Sea hajuvus kõige väiksemaks: ω = 0,1°. Kas valgus jõuab nüüd juhi
   silma?" (valik)
   (a) jah, sest kitsam kiir on täpsem
   (b) **ei – plekk on ainult 0,35 m lai ja silmad on tuledest 0,5 m
       kõrval**
   (c) jah, sest helkur saadab valguse alati tagasi
   Selgitus pärast vastamist: liiga täpne helkur saadab valguse tagasi
   TULEDESSE, mitte juhile. Just seepärast on päris helkur tahtlikult
   natuke ebatäpne.
   Vale (a) saab sildi `tapsem-on-parem`, vale (c) sildi
   `tagasi-tahendab-silma`.
3. „Sea ω = 0,5° tagasi ja lohista kaugus 20 m peale. Mitme kraadi kaugusel
   tuledest paistavad juhi silmad nüüd?" (1,43°; tolerants 0,05°; ühik °;
   vihje: „arv on kastikeses „Silmad paistavad …"")
   Selgitus: lähedal on sama 0,5 m suurem nurk – 1,43° asemel 0,29°.
   Seepärast on helkur kõige kasulikum just kaugelt; lähedal näeb juht
   jalakäijat niikuinii, sest tuled valgustavad teda otse.
4. „Jäta kaugus 20 m ja sea ω = 2,0°. Mitu korda eredam on helkur veel
   matist riidest?" (1600; tolerants 300; ühikuta; vihje 1: „arv on
   kastikeses „Nii ere kui matt riie""; vihje 2: „laiem koonus tähendab
   väiksemat arvu")
   Selgitus: kaks kraadi on juba lai koonus ja võimendus kukkus 26 000
   pealt 1600 peale – ikka veel tuhandeid kordi parem kui valge riie.
   Helkuri jõud tuleb sellest, et ta EI saada valgust laiali.

### 5. practice – harjutamine

1. **Näidis (lahendatud):** Tehases läks helkuri vorm veidi paigast ja
   peeglite nurgaks tuli 90,5° täpse 90° asemel. Kui palju möödub
   tagasitulev valgus autost 100 m kaugusel?
   Peeglite nurgaviga on 0,5°, aga kiire kõrvalekalle on kaks korda
   suurem: 2 · 0,5° = **1°** (moodul `nurkpeegel`: pööre on 2·θ, seega
   kahekordistub ka viga). 100 m kaugusel annab kraad
   100 · tan 1° = **1,7 m**. Auto on umbes 1,8 m lai ja juhi silmad on
   tuledest 0,5 m kõrval – 1,7 m kõrvale läinud valgus möödub autost.
   Pool kraadi vormis tähendab, et helkur ei tööta.
2. **Osaline (täida lünk):** Ühe helkuri hajuvusnurk on 0,5° ja tema
   võimendus umbes 26 000 korda. Teise helkuri koonus on kaks korda
   kitsam (0,25°). Mitu korda eredam on teine?
   Kaks korda kitsam koonus tähendab NELI korda väiksemat ruuminurka,
   seega 26 000 · 4 = ___ (vastus 105 000; tolerants 10 000; ühikuta;
   vihje: „ruuminurk sõltub nurga ruudust")
   Selgitus: kitsam koonus koondab sama valguse väiksemasse kohta.
   Aga kitsam ei ole alati parem – 0,25° koonus on 100 m kaugusel ainult
   0,87 m lai ja ulatub napilt juhi silmadeni; kaugemal enam mitte.
3. **Iseseisev (valik):** Miks ei paista helkur pimedas toas, kus ühtki
   valgusallikat ei ole?
   (a) sest ta vajab soojust
   (b) **sest helkur ei tee ise valgust – ta saadab tagasi ainult selle
       valguse, mis talle langeb**
   (c) sest pimedas kaotab plastik oma peegeldusvõime
   Vale (a) ja (c) saavad sildi `helkur-teeb-valgust`.
4. **Iseseisev (valik):** Sina seisad tee ÄÄRES ja vaatad jalakäijat, keda
   mööduva auto tuled valgustavad. Miks ei paista tema helkur sulle nii
   eredalt kui autojuhile?
   (a) sest sa oled kaugemal
   (b) **sest helkur saadab valguse kitsa koonusena tagasi auto poole ja
       sina ei ole selle koonuse sees**
   (c) sest helkur töötab ainult liikuva vaataja jaoks
   Vale (a) saab sildi `kaugus-maarab-koik`, vale (c) sildi
   `helkur-vajab-liikumist`.
   Selgitus: helkuri võimendus tuleb just sellest, et koonus on kitsas.
   Sama omadus, mis teeb ta juhi jaoks eredaks, teeb ta kõrvalseisja
   jaoks tuhmiks.
5. **Ülekanne (valik, mitu õiget):** Kus kasutatakse sama põhimõtet, mis
   helkuris (valgus tagasi sinna, kust tuli)?
   **jalgratta tagahelkur**, **teeäärne teemärk, mis autotulede käes
   helendab**, **jooksja vest, mis paistab autotuledes**,
   poe koridori nurgas olev turvapeegel,
   periskoop, millega vaadatakse üle müüri.
   `shuffle: true`. Vale „turvapeegel" saab sildi `koik-peeglid-on-samad`,
   vale „periskoop" sama sildi.
   Selgitus pärast vastamist: turvapeeglis on KUMER peegel (lai vaateväli)
   ja periskoobis kaks PARALLEELSET peeglit (suund ei muutu, tee nihkub
   kõrvale). Helkuris on peeglid täisnurga all – ainus nurk, mis saadab
   valguse tagasi.

### 6. exit – väljumispilet

1. Miks saadab helkur valguse tagasi just auto poole?
   (a) sest ta on tugevalt läikiv
   (b) **sest tema pisikesed peeglid on omavahel täisnurga all ja kaks
       (ruumis kolm) peegeldust pööravad kiirt kokku 180°**
   (c) sest ta on suunatud tee poole
2. Helkuri peeglite nurgaks tuli tehases 91° täpse 90° asemel. Mitu meetrit
   möödub tagasitulev valgus autost 100 m kaugusel? (3,5 m; tolerants
   0,5 m; ühik m; vihje 1: „kõrvalekalle on kaks korda peeglite nurgaviga";
   vihje 2: „100 · tan 2°")
3. „Sõber ütleb: „Kõige parem helkur oleks selline, mis saadab valguse
   täpselt tagasi, ilma igasuguse hajumiseta." Mis sa talle vastad?"
   (vabatekst, õpetajale nähtav – oodatav mõte: siis läheks kogu valgus
   tagasi esituledesse, aga juhi silmad on tuledest umbes 0,5 m kõrval ja
   ta ei näeks midagi. Päris helkur peab hajutama natuke – täpselt nii
   palju, et koonus ulatuks tuledest silmadeni, aga mitte rohkem, sest lai
   koonus tähendab tuhmi helkurit.)

## Väärarusaamad

| Silt | Väärarusaam | Kuidas moodul selle ümber lükkab |
|---|---|---|
| `peegel-on-parem` | tavaline peegel paistab pimedas paremini kui helkur | predict + teooria: tasapeegel saadab valguse ühte kindlasse suunda, mitte tagasi allika poole |
| `valge-on-parem` | valge matt riie on parim, sest valge paistab pimedas | explore-4: isegi kõige laiema koonuse juures on helkur veel 1600 korda eredam |
| `helkur-teeb-valgust` | helkur helendab ise (nagu fosforvärv või LED) | practice-3 + hook: pimedas toas ei paista helkur üldse |
| `tapsem-on-parem` | mida täpsem helkur, seda parem | explore-2: ω = 0,1° juures ei ulatu plekk enam juhi silmadeni |
| `tagasi-tahendab-silma` | „valgus tuleb tagasi" tähendab automaatselt, et juht seda näeb | explore-2 ja teooria „hind 2": tagasi tuleb TULEDESSE, silmad on 0,5 m kõrval |
| `nurgaviga-ei-loe` | kraadi jagu vale nurk on tühine | practice-1 ja exit-2: 100 m peal on kraad 1,7 m ja kaks kraadi 3,5 m |
| `viga-ei-kahekordistu` | kui peeglid on 0,5° viltu, kaldub kiir samuti 0,5° | teooria + practice-1: pööre on 2·θ, seega kahekordistub ka viga |
| `kaugus-maarab-koik` | kõrvalseisja ei näe helkurit ainult seepärast, et ta on kaugemal | practice-4: asi on koonuse suunas, mitte kauguses |
| `helkur-vajab-liikumist` | helkur töötab ainult siis, kui vaataja või helkur liigub | practice-4: liikumine ei muuda midagi, loeb ainult see, kas oled koonuse sees |
| `koik-peeglid-on-samad` | iga peegel teeb sama asja, olgu ta kumer, tasane või nurgas | practice-5: turvapeegel ja periskoop on valed vastused, sest nende peeglite nurk on teine |

## Õpetajale (teacher.ts)

- **(K) pime klass ja taskulamp (5 min):** pange klassi tagaseinale kolm
  asja kõrvuti – helkur, väike tasapeegel ja valge paberileht. Kustutage
  valgus, minge klassi teise otsa ja hoidke taskulampi **otsaesise
  juures** (silmade kõrval!). Helkur „süttib" ere valgena, paber paistab
  tuhmilt, peegel enamasti üldse mitte. Seejärel andke taskulamp
  kõrvalseisjale ja paluge tal valgustada, samal ajal kui teie vaatate:
  helkur kustub. **See kaks korda tehtud katse ongi kogu moodul** – ta
  näitab, et loeb, kus on VAATAJA valgusallika suhtes.
- **(K) helkuri keeramine (2 min):** hoidke helkurit taskulambi valguses
  ja keerake teda tasapisi viltu. Kuni umbes 40° on ta ikka ere, siis
  kustub kiiresti. Mudel seda ei arvuta (idealiseering 4) – see on koht,
  kus lihtne mudel otsa saab. Sama katse seletab, miks soovitatakse
  RIPPUVAT helkurit: rippuv helkur pöörab ennast kogu aeg ja tabab õige
  nurga.
- **Miks päris helkur on prisma, mitte peegel:** teemärgi ja autohelkuri
  sees ei ole hõbetatud peeglid, vaid läbipaistvad kuubinurga kujulised
  prismad, kus valgus peegeldub täielikult tagasi. Miks see nii saab olla,
  tuleb plokis P2 (täielik peegeldumine) – siin piisab lausest „peegli
  asemel võib sama töö ära teha ka klaasi sisepind".
- **Seos liiklusega:** pimeda ajal või halva nähtavuse korral valgustamata
  teel liikudes peab jalakäija kandma helkurit või valgusallikat
  (liiklusseadus – kontrollige kehtivat sõnastust, kui te seda tunnis
  ette loete). Arvutus practice-1-s annab põhjuse, miks
  mustaks läinud, kriimustatud või murdunud servaga helkur ära visatakse:
  helkur töötab ainult siis, kui nurgad on täpsed ja pind puhas.
- **Aruteluküsimused:** Miks on helkur soovitatavalt rippumas, mitte
  lapiti seljakotil? Miks paistab kassi silm autotuledes samamoodi
  „põlema"? (Sama põhimõte: silmapõhja taga on peegeldav kiht, mis saadab
  valguse allika poole tagasi.) Miks on jalgratta tagahelkur punane ja
  esihelkur valge? Miks jäeti Kuu peale laserreflektor ja mis oleks
  juhtunud, kui tema nurgad oleksid olnud kraadi võrra valed? (Kuu
  kauguse juures oleks kõrvalekalle tuhandeid kilomeetreid.)
- **Millal see moodul tunnis:** kohe PÄRAST moodulit `nurkpeegel` – see on
  sama tunni teine pool. Uut füüsikat siin ei ole, on ainult ülekanne,
  seega sobib ta ka koduseks tööks. Pime klass ja taskulamp on aga parem
  koos klassis teha ja siis on mõistlik moodul tunnis läbida.
- **Tunniplaan (15 min):** 2 min hook + 3 min teooria · 1 min hüpotees ·
  5 min simulatsioon · 3 min harjutamine · 1 min väljumispilet.
  45-minutilises tunnis mahub ette moodul `nurkpeegel` ja lõppu pimeda
  klassi katse.

## Kordamiskaardid (5 tk)

| id | tüüp | küsimus | vastus |
|---|---|---|---|
| rc-1 | transfer | Miks saadab helkur autotulede valguse tagasi just auto poole? | Tema pisikesed peeglid on omavahel täisnurga all. Kaks peegeldust täisnurgas pööravad kiirt kokku 180° – ükskõik kust valgus tuli, läheb ta tagasi sinna, kust tuli |
| rc-2 | explain | Miks ei paista helkur pimedas toas? | Helkur ei tee ise valgust. Ta saadab tagasi ainult selle valguse, mis talle langeb – ilma valgusallikata ei ole tal midagi tagasi saata |
| rc-3 | calc | Helkuri peeglite nurgaks tuli 91° täpse 90° asemel. Mitu kraadi kaldub tagasitulev kiir kõrvale ja mitu meetrit on see 100 m kaugusel? | Kõrvalekalle on kaks korda nurgaviga ehk 2°; 100 · tan 2° ≈ 3,5 m – valgus möödub autost |
| rc-4 | explain | Miks peab helkur olema natuke ebatäpne? | Täiesti täpne helkur saadaks kogu valguse tagasi esituledesse, aga juhi silmad on tuledest umbes 0,5 m kõrval. Tagasitulev valgus peab minema kitsa koonusena nii laiali, et ulatuks tuledest silmadeni |
| rc-5 | transfer | Sina seisad tee ääres ja vaatad helkuriga jalakäijat, keda auto tuled valgustavad. Miks ei paista helkur sulle eredalt? | Helkur saadab valguse kitsa koonusena tagasi auto poole ja sina ei ole selle koonuse sees. Sama kitsus, mis teeb ta juhi jaoks eredaks, teeb ta kõrvalseisjale tuhmiks |
