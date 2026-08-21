# Mooduli spetsifikatsioon: Kuu faasid

Ainekava seos (AINEKAVA-fyysika-8.md): plokk P1; õpitulemused: P1-T2 (osa:
valgustatud poolkera vaatenurk – õppesisu „Kuu faasid"); mõisted, mida
õpetab: – (mikromoodul, kasutab moodulitest `valgusallikad` ja
`vari-ja-poolvari` tulnud mõisteid); praktiline töö: –.
Vanus: 8. klass. Kestused: demo 5 min, tund 15 min, iseseisev 13 min.
Tüüp: mikromoodul (üks õpieesmärk, 6 sammu).

slug: `kuu-faasid` · id: `physics.kuu-faasid`

## Ainekava seos (täpsemalt)

- **Plokk:** P1 Valgus ja valguse sirgjooneline levimine. Peegeldumine ja
  neeldumine
- **Õpitulemused:** P1-T2 **osa** – õppesisu real „vari ja varjutused; Kuu
  faasid" on Kuu faasid ainuke asi, mis EI ole vari. Vari on kaetud
  moodulites `vari-ja-poolvari` ja `varjutused`; siin on faas ehk
  **vaatenurk valgustatud poolkerale**.
- **Õppesisu punktid:** „Kuu faasid"
- **Põhimõisted, mida moodul ÕPETAB:** – (jaotuskava otsus, vt
  sisu/JAOTUS-fyysika-8.md P1 tabel). Ainekava põhimõistete loendis ei ole
  „Kuu faasi", „noorkuud" ega „täiskuud", seega ei võta moodul ühtki
  mõistet omanikuna endale – ta kasutab ja selgitab neid, aga katvusraport
  ei pea neid loendama.
- **Praktiline töö:** –
- **Teema olulisus → hook:** „igapäevased valgusnähtused looduses" – kõige
  sagedamini nähtav taevanähtus üldse. Kuu kuju muutub silmnähtavalt iga
  paari päeva tagant ja seda on näinud iga õpilane.
- **Metoodilised soovitused, mida järgin:** ainekava ütleb otsesõnu **„Kuu
  faasid simulatsiooniga"** ja (D) tegevustes „Kuu faaside uurimine
  simulatsiooniga + selgitus". Seepärast on mooduli süda explore-samm, kus
  õpilane ise Kuud ümber Maa keerab, ja lõpus selgitus vabatekstina.
- **Õpilase tegevused:** (D) Kuu faaside uurimine simulatsiooniga +
  selgitus; (K) Kuu vaatlemine kodus kahe nädala jooksul ja joonistamine
  (teacher.ts)

### Terminoloogia (KOHUSTUSLIK lugeda enne sõnastamist)

Sõna **„noorkuu" on eesti keeles kahes eri tähenduses** ja see on selle
mooduli suurim sõnastuslõks:

1. rahvapärane ja õpikupärane (`sisu/allikad/OPIK-F8-INDEKS.md` ptk 1.8,
   lk 29): faaside tsükkel on „kuu loomine, noorkuu, täiskuu, vanakuu" –
   seal tähendab **noorkuu KASVAVAT Kuud** ja nähtamatut Kuud nimetatakse
   **kuu loomiseks**;
2. astronoomiline ja kalendripärane: noorkuu on just see hetk, kui Kuu on
   Maa ja Päikese vahel ja teda EI paista.

Kaks tähendust on teineteise suhtes nihkes ja õpilane kohtab elus mõlemat.
Reegel selle mooduli jaoks:

- **Ükski kontrollitav küsimus ei tohi rippuda sõna „noorkuu" küljes.**
  Checker ei tohi kunagi otsustada, kumba tähendust õpilane mõtles.
- Rakenduse tekstides kasutatakse kirjeldavaid nimesid: **kuuloomine**
  (Kuud ei paista), **kasvav sirp**, **esimene veerand**, **kasvav kumer**,
  **täiskuu**, **kahanev kumer**, **viimane veerand**, **kahanev sirp**.
- Sõnad „noorkuu" ja „vanakuu" mainitakse teoorias ÜHE lausega koos
  hoiatusega, et neid kasutatakse erinevalt – ja rohkem mitte kuskil.
- `model.ts` funktsioon `phaseLabel` tagastab ingliskeelsed sildid
  (`"new" | "waxing-crescent" | …`); eestikeelse nime paneb peale
  Simulation.tsx. Nii ei jõua vaidlus terminoloogia üle kunagi mudelisse.

### Piirid (mida see moodul EI tee)

- **Varjutused** – moodul `varjutused` (kursusefailis EELNEB). Siin
  puudutatakse Maa varju ainult ühe eesmärgiga: näidata, et ta EI SAA
  faase seletada. Varjutuse geomeetriat, kestust ega kaarte siin ei tule.
- **Miks Kuu pöörab meie poole alati sama külge** (sünkroonne pöörlemine) –
  seletus nõuab loodejõude, mida 8. klassi ainekavas ei ole. Fakt öeldakse
  teoorias ühe lausega ja väärarusaam „Kuu tagumine pool on igavesti pime"
  lükatakse harjutuses ümber, aga PÕHJUST ei seletata.
- **Looded** – ei ole selle ploki ainekavas üldse.
- **Kuu orbiidi 5° kalle** – öeldakse ühe lausega (miks vari faase ei
  seleta), aga simulatsioon on tasandiline ja kallet ei kujuta. Kallet
  kasutas juba moodul `varjutused`.
- **Kuu tõusu- ja loojumisajad** (täiskuu tõuseb päikeseloojangul) – ilus,
  aga nõuaks Maa pöörlemise lisamist simulatsiooni ja lõhuks suurusreegli.
  Läheb ainult teacher.ts aruteluküsimusse.

## Allikad

- **Teooria tugi:** `sisu/allikad/OPIK-F8-INDEKS.md` ptk 1.8 „Vari.
  Varjutused. Kuu faasid" (lk 27–30) – faktikontrolliks: „See, kui suurt
  osa Kuust me valgustatuna näeme, sõltub Kuu, Päikese ja Maa omavahelisest
  paiknemisest"; tsükkel läbitakse **29,5 ööpäevaga**; faaside loend „kuu
  loomine, noorkuu, täiskuu, vanakuu" (vt „Terminoloogia" ülal); Kuud on
  näha seetõttu, et temalt peegeldub meile päikesevalgus. Õpik faaside
  tekkemehhanismi lahti ei kirjuta – see osa on õpetaja enda teadmine ja
  siinsed arvud on mooduli omad. Tekst on oma sõnadega (vt ALLIKAD.md).
- **Ülesannete näidised:** – (kõik ülesanded on siin esimest korda kokku
  pandud, arvud tulevad model.ts konstantidest)

## Füüsika (model.ts jaoks)

Kogu moodul seisab ÜHEL geomeetrilisel faktil: **Päike valgustab igal
hetkel täpselt poolt Kuust ja see pool on alati Päikese poole.** Faas on
ainult see, kui suurt osa sellest valgustatud poolkerast me Maalt
parajasti küljelt näeme.

Tähised:

- `phaseAngleDeg` (θ) – **elongatsioon**: nurk Päike–Maa–Kuu, mõõdetuna
  Kuu tiirlemise suunas. θ = 0° tähendab, et Kuu on Maa ja Päikese vahel
  (kuuloomine); θ = 180° tähendab, et Maa on vahel (täiskuu).
- `dayInCycle` – mitmes ööpäev 29,5-päevases tsüklis, 0 = kuuloomine.

### Nurga ja ekraani kokkulepe (Simulation.tsx jaoks)

Ilma selle kokkuleppeta on simulatsioon **müntvise**: pooltel juhtudel
tuleks peegelpilt, kus kasvav Kuu on valgustatud vasakult. Ülaltvaade on
vaade **ekliptika põhjapoolusest** (Maa põhjapoolus vaataja poole) ja Kuu
tiirleb selles vaates vastupäeva. Päike on ekraani vasakus servas.
Sellest tuleb üksüheselt:

| θ | Kuu asukoht ekraanil | Maalt |
|---|---|---|
| 0° | Maast **vasakul** (Päikese pool) | kuuloomine |
| 90° | Maast **all** | esimene veerand |
| 180° | Maast **paremal** | täiskuu |
| 270° | Maast **üleval** | viimane veerand |

Kasvav pool tsüklit (0° → 180°) on seega ekraani ALUMISES pooles.
**Kontroll, et suund on õige:** θ = 90° juures vaatab Maa peal seisja
Kuu poole ekraanil alla; tema paremale käele jääb siis Päikese suund,
seega on valgustatud serv paremal. See klapib päris maailmaga –
põhjapoolkeral on esimene veerand valgustatud PAREMALT. Kui joonisel
tuleb vasakult, on tiirlemise suund vastupidi ja tuleb ümber pöörata.
Ülekanne „paremal = kasvav" kehtib ainult põhjapoolkeral (vt
`isWaxing`), ja see kitsendus on ka ekraanil kirjas.

### Konstandid (eksporditud model.ts-ist)

| Konstant | Väärtus | Selgitus |
|---|---|---|
| `SIDEREAL_MONTH_DAYS` | 27,32 | Kuu üks tiir ümber Maa (tähtede suhtes) |
| `EARTH_YEAR_DAYS` | 365,25 | Maa üks tiir ümber Päikese |
| `SYNODIC_MONTH_DAYS` | *arvutatud* ≈ 29,5287 | faaside tsükkel |
| `MOON_MEAN_KM` | 384 400 | Kuu keskmine kaugus Maast |
| `EARTH_UMBRA_WIDTH_AT_MOON_KM` | 9198 | Maa täisvarju laius Kuu kaugusel |

`SYNODIC_MONTH_DAYS` on **arvutatud, mitte sisse kirjutatud** – nii ei saa
tekkida seisu, kus mudelis on 29,5 ja teoorias 29,53 ja keegi ei tea, kumb
on tõsi. Õpiku „29,5 ööpäeva" on selle arvu ümardus ja nii ütleb ka
rakendus.

### Funktsioonid

- `synodicMonthDays(siderealDays, yearDays)`
  `= 1 / (1/siderealDays − 1/yearDays)`
  Miks nii: Kuu teeb tiiru 27,32 päevaga, aga Maa on selle ajaga ise
  edasi liikunud, seega peab Kuu Päikese suunale **järele jõudma**.
  Nurkkiirused lahutatakse. Nõuab `yearDays > siderealDays > 0`, muidu
  viga (vastasel juhul tuleks negatiivne või lõpmatu periood).
- `illuminatedFraction(phaseAngleDeg)` `= (1 − cos θ) / 2`
  Tulemus **0…1** (murd, mitte protsent): kui suur osa Maalt nähtavast Kuu
  kettast on valgustatud. See on ainuke „valem", mille peale kogu moodul
  toetub, ja seda õpilasele EI näidata – tema jaoks on see simulatsiooni
  näit protsentides.
  **Ühikute piir:** murru protsendiks korrutamine (× 100) on
  Simulation.tsx töö, mitte mudeli oma – mudel ei tea, mis ühikus teda
  ekraanil näidatakse. Explore-ülesannete õiged vastused on kirjas
  protsentides (0, 50) ühikuga `%`, sest õpilane loeb ekraanilt just seda
  arvu; activities.ts EI tohi sinna panna murdu 0,5.
- `terminatorFactor(phaseAngleDeg)` `= cos θ`
  Ütleb ainult, kui „lame" on valguse ja varju piir Kuu kettal ja kummale
  poole see piir kummub – ehk **faasi KUJU**. Simulation.tsx joonistab
  selle järgi poolellipsi: poolväiketelg = kettaraadius × |cos θ|, märk
  otsustab, kas piir on nõgus (sirp) või kumer (kumerfaas). **See kuulub
  reegli 1 järgi mudelisse:** see on geomeetria, mitte kujundus.
  **NB! `terminatorFactor` EI ütle, kumb külg on valgustatud.** cos on
  sümmeetriline: cos 60° ja cos 300° on mõlemad +0,5, cos 90° ja cos 270°
  mõlemad 0 – kasvaval ja kahaneval Kuul on faasi kuju TÄPSELT sama.
  Külje otsustab `isWaxing` ja Simulation.tsx peab kasutama **mõlemat**:
  `terminatorFactor` annab kuju, `isWaxing` peegeldab selle õigele
  poolele. Ainult ühega joonistades tuleks pool tsüklit peegelpildis.
- `normalizeAngleDeg(deg)` `= ((deg % 360) + 360) % 360` → [0, 360).
  **Iga nurka võttev funktsioon kutsub selle KÕIGEPEALT välja** –
  `illuminatedFraction`, `terminatorFactor`, `isWaxing`, `phaseLabel`,
  `dayFromPhaseAngle` ja `earthShadowCentreCovered`. Kui normaliseerimine
  jääks ainult `phaseAngleFromDay` sisse, tekiks kohe päris viga:
  **liugur ulatub 0–360 KAASA ARVATUD**, aga `phaseLabel` aknad lõpevad
  `[337,5–360)` – täpselt 360° ei satuks ühessegi aknasse. Tsükkel on
  perioodiline, seega peab ka negatiivne nurk või ülipikk päev andma õige
  faasi („40 päeva pärast" peab töötama).
- `phaseAngleFromDay(dayInCycle, synodicDays)`
  `= normalizeAngleDeg(360 · day / synodic)`. `synodicDays > 0`, muidu viga.
- `dayFromPhaseAngle(phaseAngleDeg, synodicDays)`
  `= synodic · normalizeAngleDeg(θ) / 360`.
- `isWaxing(phaseAngleDeg)` → `true`, kui `0 < θ < 180` (Kuu kasvab).
  Täpselt 0° ja 180° juures `false` – need on pöördepunktid, mitte
  kasvamine. **Simulation.tsx ei tohi sellest teha „valgustatud paremalt"
  universaalset reeglit:** parem külg kehtib ainult PÕHJApoolkeral ja
  ekraanil peab see kitsendus kirjas olema.
- `phaseLabel(phaseAngleDeg)` → üks kaheksast sildist, ±22,5° aknad:
  `[337,5–360) ∪ [0–22,5)` → `"new"`; `[22,5–67,5)` →
  `"waxing-crescent"`; `[67,5–112,5)` → `"first-quarter"`;
  `[112,5–157,5)` → `"waxing-gibbous"`; `[157,5–202,5)` → `"full"`;
  `[202,5–247,5)` → `"waning-gibbous"`; `[247,5–292,5)` →
  `"last-quarter"`; `[292,5–337,5)` → `"waning-crescent"`.
- `earthShadowHalfAngleDeg(umbraWidthKm, distanceKm)`
  `= atan((umbraWidthKm / 2) / distanceKm)` kraadides – kui laia nurga Kuu
  orbiidist Maa täisvari üldse hõivab.
- `earthShadowCentreCovered(phaseAngleDeg)` → `true`, kui
  `|normalizeAngleDeg(θ) − 180| ≤ earthShadowHalfAngleDeg(EARTH_UMBRA_WIDTH_AT_MOON_KM, MOON_MEAN_KM)`.
  **Nimi ütleb tahtlikult „centre":** funktsioon vaatab ainult Kuu
  KESKPUNKTI ja jätab Kuu enda läbimõõdu arvestamata. See ei ole väike
  lihtsustus – Kuu ketas ise on orbiidil 0,52° lai ehk juba kolmandik
  varju 1,37°-st, seega algab päris osaline kuuvarjutus tublisti varem ja
  kestab kauem, kui see funktsioon ütleb. Mooduli väide („vari on
  orbiidil ühesainsas kohas") kannab selle lihtsustuse kenasti välja:
  0,52° juurdearvestamine teeks aknast 1,9° ehk ikka **alla 0,6 %
  tsüklist**. Varjutuse päris kestus ja geomeetria on mooduli
  `varjutused` asi, mitte selle oma – siin on vari ainult vastuargument.
- `shadowWindowHours(synodicDays)` – mitu tundi kogu tsüklist saab Maa
  vari Kuud üldse katta: `2 · poolnurk / 360 · synodicDays · 24`.
- Definitsioonipiirkond: kõik sisendid lõplikud arvud; `synodicDays > 0`,
  `distanceKm > 0`, `umbraWidthKm > 0`. Muu viskab vea.

**Miks `EARTH_UMBRA_WIDTH_AT_MOON_KM` on siin uuesti, mitte imporditud
moodulist `varjutused`:** sama põhjus, mis oli moodulil `varjutused`
mooduli `vari-ja-poolvari` suhtes – moodulid laaditakse dünaamiliselt ja
ristimport tõmbaks ühe mooduli teise bundle'isse (raudne reegel 13).
Kordus on teadlik ja seda **valvab test**: `kuu-faasid` konstant peab
võrduma sellega, mille annab `varjutused/model.ts` funktsioon
`lunarUmbraWidthKm()`. Test tohib mõlemat moodulit importida – testid
bundle'isse ei lähe.

### Mudeli teadlikud lihtsustused

- **Orbiit on ring ja Kuu liigub ühtlaselt.** Päris orbiit on ellips,
  seega jõuab Kuu faasist faasi kord kiiremini, kord aeglasemalt (kuni
  umbes ±0,5 ööpäeva). Rakendus arvutab päeva kraadidest lineaarselt.
- **Simulatsioon on tasandiline** – 5° kalle jääb sõnadesse (vt „Piirid").
  Just seepärast on `earthShadowCentreCovered` mudelis: ta ütleb, et vari on
  Kuu lähedal ainult ühes ainsas kohas, ja seda saab tasandil ausalt
  näidata. Kalle teeb varjutuse veel HARULDASEMAKS, mitte sagedasemaks,
  seega ei muuda ta järeldust – ja see on ekraanil kirjas.
- **Joonis ei ole mõõtkavas** (Kuu kaugus on 30 Maa läbimõõtu, Päike on
  400 korda kaugemal kui Kuu) – kirjas otse joonisel, nagu moodulis
  `varjutused`.
- **Päikesekiired on paralleelsed** – Päike on nii kaugel, et see on parem
  lähendus kui joonisel kujutatav lahknev vihk.

### Testiväärtused (teadaolevad)

| Juht | sisend | tulemus |
|---|---|---|
| kuuloomine | θ = 0° | `illuminatedFraction` = 0,000 · `phaseLabel` = `"new"` |
| kasvav sirp | θ = 60° | 0,250 · `"waxing-crescent"` · `isWaxing` = true |
| esimene veerand | θ = 90° | 0,500 · `"first-quarter"` |
| kasvav kumer | θ = 120° | 0,750 · `"waxing-gibbous"` |
| täiskuu | θ = 180° | 1,000 · `"full"` · `isWaxing` = false |
| kahanev kumer | θ = 240° | 0,750 · `"waning-gibbous"` |
| viimane veerand | θ = 270° | 0,500 · `"last-quarter"` · `isWaxing` = false |
| kahanev sirp | θ = 300° | 0,250 · `"waning-crescent"` |
| sünoodiline kuu | 27,32 ja 365,25 | 29,5287 ööpäeva |
| päev → nurk | päev 22, 29,5287 | 268,2° → `"last-quarter"` |
| nurk → päev | θ = 90° | 7,382 ööpäeva |
| varju poolnurk | 9198 km, 384 400 km | 0,6855° |
| varju aken | 29,5287 | 2,70 tundi |

Piirjuhud ja nende mõte lahti kirjutatult:

- **0 % ja 100 % on sama geomeetria kaks otsa.** Kuuloomise ajal on Kuu
  ikka poolenisti valgustatud – see valgustatud pool on lihtsalt meist ära
  pööratud. Test kontrollib, et `illuminatedFraction(0)` on **täpselt 0**
  (mitte ümardusvea tõttu veidi negatiivne) ja `illuminatedFraction(180)`
  **täpselt 1**.
- **60° ja 300° annavad mõlemad 0,250; 90° ja 270° mõlemad 0,500 – ja
  `terminatorFactor` on neil paaridel SAMA, mitte vastandmärgiga**
  (cos 60° = cos 300° = +0,5; cos 90° = cos 270° = 0). Faasi kuju on
  kasvaval ja kahaneval Kuul täpselt ühesugune; erineb ainult `isWaxing`
  ehk see, **kumb külg** on valgustatud. Just see paar on explore-sammu
  süda ja peab testis kirjas olema kahel põhjusel: et keegi ei
  „lihtsustaks" mudelit vahemikku 0–180, ja et keegi ei arvaks, et külje
  saab cos-i märgist välja lugeda.
- **`terminatorFactor` märgid tulevad kujust, mitte küljest:** θ = 60° →
  +0,5 (sirp, piir nõgus); θ = 90° → 0 (piir on sirge – täpselt poolik);
  θ = 120° → −0,5 (kumerfaas, piir kumer); θ = 240° → −0,5 ja θ = 300° →
  +0,5, sest kahanev pool on peegelpilt. Test kontrollib kõiki viit:
  märgivahetus 90° ja 270° juures on ainus koht, kus Simulation.tsx
  joonistus võib vaikselt sirbi ja kumerfaasi vahetusse ajada.
- **Perioodilisus:** `phaseAngleFromDay(0)`, `(29,5287)` ja `(59,0574)`
  annavad kõik 0°; `phaseAngleFromDay(−7,382)` annab 270°, mitte
  negatiivse nurga.
- **Varju aken:** 1,371° kogu 360°-st ehk **0,4 % tsüklist** – umbes
  2,7 tundi 29,5 ööpäevast. See on ainus koht, kus Maa vari Kuud üldse
  katta saab, ja needki tunnid jäävad kalde tõttu enamasti vahele. Vari EI
  SAA seega seletada kuju muutumist, mis kestab terve kuu. Test kontrollib
  nii poolnurka kui ka seda, et `earthShadowCentreCovered(90)` ja `(270)` on
  `false`, aga `(180)` on `true`.
- **Kontroll `varjutused` vastu:** test nõuab, et
  `EARTH_UMBRA_WIDTH_AT_MOON_KM` võrduks 1 km täpsusega sellega, mille
  annab `varjutused/model.ts` funktsioon `lunarUmbraWidthKm()`.
- Vigased sisendid: `synodicMonthDays(365,25; 27,32)` (argumendid
  vahetuses) → viga; `synodicDays = 0` või negatiivne → viga;
  `distanceKm = 0` → viga; `NaN` või `Infinity` ükskõik kus → viga.

## Sammud

### 1. hook – häälestus

Joonis (`figures.tsx`, silt `kf-kolm-ohtut`): kolm Kuu ketast kõrvuti, iga
all kuupäev – 3. mai (kitsas sirp, valgustatud paremalt), 10. mai (täpselt
poolik), 17. mai (peaaegu täis). Sama taevas, sama koht.

„Kaks nädalat, kolm õhtut, kolm eri kuju. Kas Kuu ise muutus, jäi midagi
tema ette, või muutus hoopis midagi muud?"

Eesmärk õpilase keeles: „Oskan selgitada, miks Kuu kuju muutub – ja miks
see EI ole vari."

### 2. theory – Kuud valgustab alati pool (üks ekraan)

- **Kuu ei helenda ise.** Ta paistab ainult sellepärast, et temalt
  peegeldub päikesevalgus – täpselt nagu igalt teiselt esemelt toas
  (moodul `valgusallikad`: Kuu on valgustatud keha, mitte valgusallikas).
- **Päike valgustab igal hetkel täpselt poolt Kuust.** See ei muutu
  kunagi. Teine pool on parajasti pime – seal on Kuu öö.
- **Muutub see, kust meie vaatame.** Kuu tiirleb ümber Maa, seega näeme me
  seda valgustatud poolt iga päev veidi teise nurga alt: kord tagant (Kuud
  ei paista), kord küljelt (pool ketast), kord otse eest (täiskuu).
  **Faas ongi vaatenurk, mitte vari.**
- **Tsükkel kestab 29,5 ööpäeva.** Kuu teeb tiiru ümber Maa 27,3 päevaga,
  aga Maa ise on selle ajaga Päikese ümber edasi liikunud – Kuu peab
  Päikese suunale järele jõudma ja selleks kulub veel paar päeva.
- **Kuu pöörab meie poole alati sama külge.** Seepärast näeme me alati sama
  Kuu nägu. See EI tähenda, et teine pool oleks pime – ka seal vahelduvad
  päev ja öö, me lihtsalt ei näe seda kunagi.
- **Sõnad „noorkuu" ja „vanakuu"** tähendavad eri inimeste suus eri asju
  (kord nähtamatut Kuud, kord kasvavat või kahanevat). Selles moodulis
  ütleme selguse mõttes: **kuuloomine** (ei paista), **kasvav sirp**,
  **esimene veerand**, **kasvav kumer**, **täiskuu**, **kahanev kumer**,
  **viimane veerand**, **kahanev sirp**.
- Joonis (`kf-valgustatud-pool`): ülaltvaade – Päike vasakul (paralleelsed
  kiired), Maa keskel, ümber Maa neli Kuud (0°, 90°, 180°, 270°). **Iga
  Kuu on joonistatud pooleldi valgustatuna ja valgustatud pool on kõigil
  neljal Päikese poole** – see kordumine on joonise mõte. Iga Kuu kõrval
  väike ketas „nii paistab Maalt". Joonisel on kirjas „ei ole mõõtkavas".

### 3. predict – ennustus (lukustub!)

„Täna on Kuu täpselt poolik: pool ketast helendab, pool on tume. Mis on
juhtunud selle Kuu poolega, mida Päike valgustab?"

(a) Päike valgustab praegu Kuust ainult poolt sellest, mida tavaliselt
(b) pool valgustatud poolest on Maa varjus
(c) **valgustatud pool on endiselt terve – meie näeme seda parajasti
    küljelt ja seepärast paistab meile sellest ainult pool**

+ „Miks sa nii arvad?" (vabatekst).

Õige on (c). Vastust EI avaldata enne sammu 4 – simulatsiooni ülaltvaates
on kohe näha, et valgustatud pool on igas asendis sama suur.

Vale (a) saab sildi `paike-valgustab-vahem`, vale (b) sildi
`kuu-faas-on-vari`.

### 4. explore – simulatsioon

**SVG, kaks paneeli** (kõrvuti töölaual, üksteise all 360 px telefonil):

- **Ülaltvaade:** Päike vasakul servas, sealt paralleelsed kiired paremale.
  Keskel Maa, ümber tema õhuke orbiidiring. Kuu ringil, asend liuguri
  järgi. Nii Maa kui Kuu on joonistatud **pooleldi valgustatuna,
  valgustatud pool alati vasakule** (Päikese poole). Joonisel kiri „ei ole
  mõõtkavas".
- **„Nii paistab Maalt":** suur Kuu ketas, millel valguse ja varju piir on
  poolellips (`terminatorFactor`). Kirje juures „põhjapoolkeralt vaadates".

Juhtnupud (moodulilepingu järgi alguses max 2 muudetavat suurust – siin on
alguses **üks**):

- **liugur: Kuu asukoht orbiidil** 0–360°, samm **5°**, algväärtus **0°**
  (kuuloomine). Samm 5 on valitud nii, et kõik ülesannete sihtnurgad
  (0, 60, 90, 120, 180, 270, 300) satuvad võrele ja algväärtus on liuguriga
  tagasi leitav – see oli mooduli `varjutused` õppetund.
- **(avaneb) lüliti „Maa vari"** – joonistab ülaltvaatesse Maa täisvarju
  koonuse (Päikesest eemale suunatud). Avaneb pärast explore-2.

Kuvatakse suurelt:

- **valgustatud osa Maalt** (%), mudelist `illuminatedFraction`
- **faasi nimi** (eestikeelne, `phaseLabel` järgi)
- **päev tsüklis** (0–29,5), mudelist `dayFromPhaseAngle`
- alaline kõrvaltekst: **„Päike valgustab Kuust alati täpselt poolt"** –
  see lause on ekraanil kogu aeg, sest ta on kogu mooduli mõte.

Tolerantsid ja ühikud: protsendid ühikuga `%` ja **absoluutse tolerantsiga
±3 protsendipunkti** (protsenttolerants oleks 0 % juures kasutu – null
korda ükskõik mis on null); loendamise vastus ühikuta, tolerants 0
(täisarv).

Ülesanded:

1. „Liugur on alguses 0° peal – Kuu on Maa ja Päikese vahel. Kui suur osa
   Kuu kettast on Maalt vaadates valgustatud?" (0 %; tolerants ±3 pp;
   ühik `%`)
   Vihje 1: „vaata ÜLALTVAADET – kas Päike valgustab Kuud ka praegu?"
   Vihje 2: „valgustatud pool on olemas, aga kummale poole ta jääb?"
2. „Keri 90° juurde ja siis 270° juurde. Kui suur osa on valgustatud
   mõlemal juhul?" (50 %; tolerants ±3 pp; ühik `%`)
   Küsimuse all lisalause (vastuse järel nähtav): „Osa on sama, aga vaata
   hoolega – valgustatud on **teine külg**. Just sellest saab öelda, kas
   Kuu kasvab või kahaneb."
   → **avab lisavõimaluse `maa-vari`.**
3. „Lülita sisse Maa vari ja keri kogu orbiit läbi. Kus on Maa vari Kuu
   lähedal?" (valik)
   (a) kogu selles pooles, kus Kuu on Päikesest eemal
   (b) **ainult ühes ainsas kohas – täiskuu juures (180°)**
   (c) igal pool peale täiskuu
   Vastuse järel: „Maa vari hõivab kogu 360° orbiidist ainult **1,4°** ehk
   0,4 % tsüklist – umbes 2,7 tundi 29,5 ööpäevast. Ja needki jäävad
   enamasti vahele, sest Kuu rada on Maa raja suhtes ~5° viltu. Vari ei saa
   seletada kuju muutumist, mis kestab terve kuu. Kui Kuu sinna varju
   siiski satub, siis on see **kuuvarjutus** – eelmine moodul."
4. „Keri aeglaselt 0°-st 360°-ni. Mitu korda on Kuu Maalt vaadates täpselt
   pooleldi valgustatud?" (2; ühikuta; tolerants 0)
   Vihje: „vaata näitu „valgustatud osa" – mitu korda ta läbib 50 %?"

### 5. practice – harjutamine

1. **Näidis (lahendatud):** Miks on vale öelda, et sirbikujuline Kuu on Maa
   varjus? Maa vari on Päikesest eemale suunatud koonus ja ta ulatub Kuu
   orbiidile ainult ühes kohas – täpselt täiskuu juures, 1,4° ulatuses kogu
   360°-st. Sirp on aga täiesti mujal: siis on Kuu peaaegu Päikese suunas,
   varjust nii kaugel kui üldse olla saab. Sirp tekib sellest, et me näeme
   valgustatud poolkerast serva.
2. **Osaline:** Tsükkel kestab 29,5 ööpäeva. Kuuloomisest täiskuuni on pool
   tsüklit. Täida: 29,5 / 2 = ___ (vastus **14,8**; tolerants 5 %; ühik
   `päeva`; vihje: „pool tsüklit").
3. **Iseseisev (joonis):** Joonis (`kf-kaks-sirpi`): kaks ühesugust Kuu
   sirpi kõrvuti, vasakpoolsel helendab **parem** serv, parempoolsel
   **vasak** serv. „Sa vaatad taevast Eestis. Kumb neist on kasvav Kuu
   (liigub täiskuu poole)?" (a) **vasakpoolne – valgustatud paremalt**
   (b) parempoolne – valgustatud vasakult (c) mõlemad on ühesugused, kuju
   on sama.
   Vihje 1: „kasvav Kuu on Päikesele järele jõudmas – Päike loojub läänes
   ja kasvav Kuu on temast idas"; vihje 2: „keri simulatsioonis 60° juurde
   ja vaata, kummal serval valgus on".
   Vale (c) saab sildi `kasvav-kahanev-segamini`.
4. **Iseseisev (ülekanne):** „Täna on kuuloomine (päev 0). Milline on Kuu
   22 ööpäeva pärast?" (valik)
   (a) täiskuu (b) **kahanev poolik ehk viimane veerand** (c) kasvav sirp
   Vihje: „22 päeva on kolmveerand 29,5-päevasest tsüklist – keri
   simulatsioonis päevani 22".
5. **Ülekanne (valik, mitu õiget):** Millised väited on õiged?
   **Päike valgustab Kuust alati täpselt poolt**,
   Kuu sirp tekib siis, kui Maa vari katab osa Kuust,
   **Kuu paistab ainult peegeldunud päikesevalguse tõttu**,
   Kuu tagumine pool on igavesti pime,
   **faaside tsükkel kestab umbes 29,5 ööpäeva**.
   `shuffle: true`.
   Vale „Maa vari katab osa Kuust" saab sildi `kuu-faas-on-vari`; vale
   „tagumine pool on igavesti pime" saab sildi `kuu-tume-pool`.

### 6. exit – väljumispilet

1. Miks me kuuloomise ajal Kuud ei näe? (a) Maa vari katab ta ära
   (b) **tema valgustatud pool on parajasti meist ära pööratud**
   (c) Päike ei valgusta teda sel ajal
2. Arvuta: faaside tsükkel kestab 29,5 ööpäeva. Täna on esimene veerand
   (poolik, kasvav). Mitme ööpäeva pärast on täiskuu? (**7,4**;
   tolerants 5 %; ühik `päeva`; vihje: „esimesest veerandist täiskuuni on
   veerand tsüklit")
3. „Sinu sõber ütleb: „Poolik Kuu on selline sellepärast, et Maa vari katab
   teise poole ära." Kirjuta talle vastus." (vabatekst, õpetajale nähtav –
   oodatav mõte: Päike valgustab Kuust alati poolt; meie näeme seda poolt
   küljelt ja seepärast paistab meile sellest ainult pool. Maa vari on
   hoopis teises kohas – Päikesest eemal – ja saab Kuuni ulatuda ainult
   täiskuu ajal, mil ta annaks kuuvarjutuse.)

## Väärarusaamad

| Silt | Väärarusaam | Kuidas moodul selle ümber lükkab |
|---|---|---|
| `kuu-faas-on-vari` | Kuu kuju muutub, sest Maa vari katab osa Kuust | explore-3: lisavõimalus „Maa vari" näitab, et vari on orbiidil ühesainsas kohas (1,4° kogu 360°-st) ja sedagi täiskuu juures, kus Kuu on kõige TÄIEM; practice-1 näidis ja practice-5; exit-3 laseb selle oma sõnadega ümber lükata. Sama silt on kasutusel moodulis `varjutused` – seal tõmmatakse piir, siin lükatakse ümber |
| `paike-valgustab-vahem` | Päike valgustab Kuust eri aegadel eri suurt osa | teooria ja joonis `kf-valgustatud-pool`: valgustatud pool on kõigis neljas asendis sama suur; explore ülaltvaade näitab seda liuguri iga asendi juures ja alaline lause „Päike valgustab Kuust alati täpselt poolt" on ekraanil kogu aeg; predict-(a) |
| `kuu-ise-muutub` | Kuu ise muudab kuju või „kasvab" | hook küsib otse; teooria: muutub ainult vaatenurk, Kuu on kogu aeg sama kera – ülaltvaates on ta iga liuguri asendi juures ühesugune ketas |
| `kasvav-kahanev-segamini` | kasvavat ja kahanevat Kuud ei saa vaadates eristada, sest kuju on sama | explore-2: 90° ja 270° annavad mõlemad 50 %, aga valgustatud on eri külg; practice-3 küsib seda joonisel; `terminatorFactor` märgivahetus on mudelis testitud |
| `kuu-tume-pool` | Kuu tagumine pool on igavesti pime | teooria: Kuu pöörab meie poole sama külge, aga ka teisel pool vahelduvad päev ja öö – ta on KAUGEM pool, mitte pime pool; practice-5 kontrollib |
| `faas-ja-tiirlemisaeg` | faaside tsükkel kestab 27,3 päeva (nagu tiir ümber Maa) | teooria seletab, miks 29,5 ja mitte 27,3 (Maa liigub ise edasi, Kuu peab järele jõudma); `SYNODIC_MONTH_DAYS` on mudelis ARVUTATUD, mitte kirjutatud, seega ei saa rakenduses kuskil vale arv olla; practice-2 ja exit-2 kasutavad 29,5 |

## Õpetajale (teacher.ts)

- **(K) Kuu vaatlemine kahe nädala jooksul** – kõige väärtuslikum kodutöö
  selle teema juures ja ainus asi, mida ekraan ei asenda. Iga õpilane
  joonistab paberile umbes iga teine õhtu Kuu kuju ja kirjutab kuupäeva
  ning kellaaja. Kahe nädala pärast on klassis 8–10 joonist, mille saab
  ritta panna. Vihje õpilasele: Kuu on nähtav ka päeval – kasvavat Kuud
  otsi pärastlõunal idataevast, kahanevat hommikul läänest.
- **(K) apelsin ja lambike** – kogu simulatsioon päris asjadena: pime
  klass, üks lamp (Päike), õpilane hoiab apelsini (Kuu) käes ja keerab end
  aeglaselt ringi, apelsin kogu aeg peast veidi kõrgemal. Tema pea on Maa.
  Apelsin läbib ise kõik faasid ja iga õpilane näeb seda oma silmaga – see
  katse veenab paremini kui ükski joonis. Kui apelsin juhtub täpselt varju
  sattuma (õpilase enda pea vari), on see just kuuvarjutus – ja see näitab,
  miks apelsinit tuleb hoida veidi kõrgemal: päris Kuu rada on samamoodi
  viltu.
- **Millal see moodul tunnis:** PÄRAST moodulit `varjutused`. Faasi ja
  varjutuse eristamine on lihtsam, kui varjutus on äsja läbi võetud – siis
  on „Maa vari" konkreetne asi, millele saab osutada, mitte ähmane
  mälestus.
- **Terminoloogia hoiatus õpetajale:** õpikus (ptk 1.8) on faaside loend
  „kuu loomine, noorkuu, täiskuu, vanakuu" – seal tähendab **noorkuu
  KASVAVAT Kuud**, mitte nähtamatut. Kalendrites ja astronoomias tähendab
  noorkuu enamasti just nähtamatut Kuud. Rakendus kasutab meelega
  kirjeldavaid nimesid (kuuloomine, kasvav sirp, esimene veerand jne) ja
  ükski hinnatav küsimus ei rippu sõna „noorkuu" küljes. Kui õpilane seda
  sõna kasutab, küsi üle, kumba ta mõtles – see ise on hea arutelu.
- **Aruteluküsimused:**
  - Mis kellaajal on täiskuu taevas kõige kõrgemal? (Keskööl – täiskuu on
    Päikesele vastaspoolel, seega ta tõuseb päikeseloojangul ja loojub
    päikesetõusul. **Simulatsioonist seda välja lugeda EI saa** – kellaaeg
    nõuab Maa pöörlemist ja vaatleja horisonti, mida ülaltvaade ei kujuta.
    Ülaltvaade näitab ainult seda, et täiskuu ajal on Kuu Päikesest
    vastaspidises suunas; kellaajani jõuab arutelu õpetaja juhtimisel.)
  - Mida näeb Kuu peal seisev astronaut siis, kui Maal on täiskuu? (Pimedat
    Maad – Maa on tema jaoks Päikese ja tema vahel, valgustatud pool ära
    pööratud. Faasid on täpselt vastupidised.)
  - Kui Kuu tiirleks ümber Maa kaks korda kiiremini, kui pikk oleks faaside
    tsükkel? (Ligi kaks korda lühem – aga mitte täpselt, sest Maa liigub
    ikka edasi.)
  - Miks paistab sirbikujuline Kuu tavaliselt madalal horisondi lähedal ja
    alati Päikese suunas? (Sirp tähendab, et Kuu on taevas Päikese lähedal
    – sellepärast ongi teda näha ainult vahetult pärast päikeseloojangut
    või enne tõusu.)
- **Simulatsioon enne või pärast?** Simulatsioon ENNE ja apelsinikatse
  PÄRAST. Vastupidi ei tööta: apelsinikatses ei ole ülaltvaadet ja õpilane
  ei näe, et valgustatud pool on kogu aeg sama suur – seda näitab ainult
  ekraan. Ekraan annab ülaltvaate, apelsin annab kehalise kogemuse.
- **Tunniplaan (15 min):** 2 min hook + teooria · 2 min ennustus ·
  5 min simulatsioon · 4 min harjutamine · 2 min väljumispilet.

## Kordamiskaardid (5 tk)

| id | tüüp | küsimus | vastus |
|---|---|---|---|
| rc-1 | concept | Kui suurt osa Kuust valgustab Päike? | Alati täpselt poolt – see ei muutu kunagi. Muutub ainult see, kui suurt osa sellest valgustatud poolest me Maalt näeme |
| rc-2 | selgitus | Miks me kuuloomise ajal Kuud ei näe? | Kuu on siis Maa ja Päikese vahel – tema valgustatud pool on Päikese poole ehk meist ära pööratud, meie poole jääb pime pool |
| rc-3 | calc | Faaside tsükkel kestab 29,5 ööpäeva. Mitme päeva pärast on esimesest veerandist täiskuu? | Veerand tsüklit: 29,5 / 4 ≈ 7,4 ööpäeva |
| rc-4 | transfer | Sõber ütleb, et poolik Kuu on Maa varjus. Mis on vale? | Maa vari on Päikesest eemal ja ulatub Kuu orbiidile ainult täiskuu kohal, 1,4° ulatuses kogu 360°-st. Poolik Kuu on hoopis mujal – me lihtsalt näeme valgustatud poolt küljelt. Kui Kuu sinna varju satub, tekib kuuvarjutus |
| rc-5 | concept | Miks kestab faaside tsükkel 29,5 päeva, kui Kuu teeb tiiru ümber Maa 27,3 päevaga? | Maa on selle aja jooksul ise ümber Päikese edasi liikunud, seega peab Kuu Päikese suunale järele jõudma – selleks kulub veel umbes kaks päeva |
