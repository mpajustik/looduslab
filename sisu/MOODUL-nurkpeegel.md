# Mooduli spetsifikatsioon: Nurkpeegel

Ainekava seos (AINEKAVA-fyysika-8.md): plokk P1; õpitulemus: P1-T2 (osa:
kiirte käik kahe peegli vahel, periskoop); mõisted, mida õpetab: – (kõik
selle mooduli mõisted – valguskiir, tasapeegel, langemisnurk,
peegeldumisnurk, pinna ristsirge – kuuluvad moodulile `peegeldumisseadus`
ja siin neid ainult kasutatakse); praktiline töö: – (P1 neli praktilist
tööd on juba kaetud). Vanus: 8. klass. Kestused: demo 5 min, tund 15 min,
iseseisev 12 min. Tüüp: mikromoodul (üks õpieesmärk, 6 sammu).

slug: `nurkpeegel` · id: `physics.nurkpeegel`

## Ainekava seos (täpsemalt)

- **Plokk:** P1 Valgus ja valguse sirgjooneline levimine. Peegeldumine ja
  neeldumine
- **Õpitulemused:**
  - **P1-T2 osa** – „tunneb valguse sirgjoonelise levimise ja peegeldumise
    seadust, konstrueerib nende põhjal jooniseid ja korraldab katsed".
    Siin rakendatakse peegeldumisseadust KAHEL tasasel peeglil järjest.
    Moodul `peegeldumisseadus` andis seaduse ühel peeglil,
    `tasapeegli-kujutis` kujutise, `kumerpeegel` ja `noguspeegel` kõvera
    pinna – see moodul on neljas olukord: pind jääb tasaseks, aga peegleid
    on kaks.
- **Õppesisu punktid:** „peegeldumisseadus; tasapeegel, kumer- ja
  nõguspeegel"
- **Põhimõisted, mida moodul ÕPETAB:** – (jaotuskava rida ütleb sama).
  Sõnu „nurkpeegel", „pööre" ja „periskoop" moodul kasutab ja seletab, aga
  ainekava põhimõistete loendis neid ei ole, seega manifesti `concepts`
  väljale nad EI lähe. Katvusraport võrdleb mõisteid nime järgi üle kogu
  ainekava (samm 4.0) – tühi `concepts` on siin õige vastus, mitte unustus.
- **Praktiline töö:** – (moodul ei kata praktilist tööd; P1-PT1…PT4 on
  kõik juba teiste moodulite all)
- **Teema olulisus → hook:** „igapäevased valgusnähtused looduses ja
  tehnikas" – kuidas näha üle kõrge aia või ümber nurga, ise nurga tagant
  välja astumata.
- **Metoodilised soovitused, mida järgin:** ainekava nõuab, et
  peegeldumisseadust EI õpetataks ainult teoreetiliselt, vaid „läbi
  jooniste eri olukordades (**nurkpeegel**, **periskoop**, matt- ja
  kumerpind)". Mõlemad selle mooduli sõnad on selles loendis NIMELISELT,
  ja õpilase tegevuste real seisab „(D) joonestab/uurib kiirte käiku
  periskoobis, nurkpeeglis". See moodul on selle rea otsene täitmine.
- **Õpilase tegevused:** (D) uurib simulatsiooniga, kuidas kiir kahe
  peegli vahel pöördub, ja loeb mõlemalt peeglilt langemis- ja
  peegeldumisnurga; (D) avastab, et pööre sõltub ainult peeglite nurgast,
  mitte sellest, kust kiir tuli; (K) ehitab kahest taskupeeglist
  nurkpeegli ja papitorust periskoobi õpetajajuhendi järgi

## Piirid (mida see moodul EI tee)

- **Kujutiste arv nurkpeeglis** (kaleidoskoop, valem 360° / nurk − 1) –
  see on TEINE õpieesmärk (kujutis, mitte kiire tee) ja tooks mooduli üle
  suurusreegli. Kaks peeglit teineteise vastas annavad hulga kujutisi –
  see on õpetajajuhendis (K) katsena, kus seda saab käega katsuda, aga
  ükski ülesanne seda ei küsi ega ükski funktsioon seda ei arvuta.
- **Helkur ja jalgratta helkur** – moodul `helkur`. Siin on 90° nurkpeegli
  omadus („kiir tuleb tagasi täpselt sinna, kust tuli") mooduli TIPP, aga
  seadmeni me ei jõua: rakendusmoodul kannab selle üle. Kui hook või
  ülekandeülesanne helkurit mainib, siis ainult ühe lausega ja ilma
  seletuseta, mis on selle mooduli oma.
- **Kolmemõõtmeline nurgapeegel** (kuubi nurk, kolm peeglit risti, Kuu
  peale jäetud laserreflektor) – ainult õpetajajuhendi arutelus. Kahest
  peeglist kolmele minek nõuab ruumilist joonist, mida 360 px ekraanil
  ausalt ei näita.
- **Vasak-parem „vahetus"** ja peeglikiri – moodul `peeglikiri`
  (vt MOODUL-tasapeegli-kujutis.md „Piirid"). Nurkpeeglis on see hea
  küsimus (kaks peegeldust panevad kirja jälle õigetpidi), aga
  siin ei küsi seda ükski ülesanne.
- **Rohkem kui kaks peegeldust.** Kui peeglite nurk on väike (või
  langemisnurk suur), käib kiir peeglite vahel mitu korda edasi-tagasi ja
  pöördub kokku rohkem kui 2θ. Mudel arvutab TÄPSELT kaks peegeldust ja
  viskab vea kõikjal, kus kolmas tuleks – piir on arvutatud, mitte
  valitud (vt „Kaks peegeldust ei ole iseenesestmõistetav"). Praktikas
  tähendab see, et see moodul räägib ainult nurkadest **üle 45°** ja
  simulatsiooni liugur algab 60° juurest. Mitmekordne käik on
  õpetajajuhendi arutelus ja kaleidoskoobi juures.
- **Peeglite nurk üle 90°.** Nürinurga korral tuleks pööre lugeda üle
  180° ehk „teistpidi ringi" – 8. klassis on see rohkem kokkuleppe
  õpetamist kui füüsikat. Mudel viskab üle 90° vea, simulatsiooni liugur
  sinna ei ulatu.
- **Valguse kadu peeglil.** Kaks peegeldust tähendavad päris peeglil kaht
  korda ~5 % kaotust. Öeldakse ühe lausega õpetajajuhendis, mudelis ei ole
  intensiivsust üldse.

## Allikad

- **Teooria tugi:** `sisu/allikad/POHIVARA-F8-INDEKS.md` punkt 18.4 ja
  joonis 50 (lk 27) – faktikontroll: kaks tasapeeglit täisnurga all,
  kiir peegeldub α₁/β₁ esimeselt ja β₂/α₂ teiselt peeglilt ning väljub
  esialgse kiirega **vastassuunas**. Sama allikas kinnitab punktis 18.3
  seaduse β = α, mille peal kogu moodul seisab.
  `sisu/allikad/OPIK-F8-INDEKS.md` ptk 1.9 „Peegeldumine.
  Peegeldumisseadus" (lk 31–33) – üldine taust; nurkpeeglit ja periskoopi
  õpik eraldi peatükina ei käsitle, seega on selle mooduli geomeetria
  (pööre = kaks korda peeglite nurk) tuletatud ise ja kontrollitud
  mudeli testidega. Sõnasõnalist teksti ei kopeerita (vt ALLIKAD.md).
- **Ülesannete näidised:** – (kõik arvud tulevad model.ts valemitest
  δ = 2·θ ja α + β = θ)

## Füüsika (model.ts jaoks)

Mudel arvutab **ühe kiire teekonna kahe tasase peegli vahel** – puhta
geomeetriaga, ilma ühegi tabelita (reegel 1). Kõik nurgad on **kraadides**,
pikkused **meetrites** (moodulileping: SI-ühikud sees).

### Kokkulepped ja telgistik

- Peeglid kohtuvad **tipus**, mis on nullpunkt (0, 0).
- **Peegel 1** on x-telg, tipust paremale (+x). **Peegel 2** on tipust
  lähtuv **poolsirge** nurga **θ** all vastupäeva. (Sõna „kiir" tähendab
  selles projektis alati valguskiirt – peegel on poolsirge.) Valgus liigub
  nende vahelises kiilus (nurgad 0° kuni θ).
- **y kasvab ÜLES** (matemaatiline suund), nagu moodulis
  `peegeldumisseadus`. SVG y-telje pööramine on paigutus, mitte füüsika –
  see jääb Simulation.tsx-i.
- **Peeglite nurk θ** (`mirrorAngleDeg`) on nurk peeglite vahel.
  Lubatud vahemik EI ole kõigil funktsioonidel sama ja see on tahtlik:
  `deviationDeg` lubab **0° ≤ θ ≤ 90°** (0° = paralleelsed peeglid ehk
  periskoop, vastus 0°), ülejäänud kolm funktsiooni nõuavad
  **45° < θ ≤ 90°**, sest ainult seal on olemas täpselt kahe peegeldusega
  tee ja ainult siis on tipp olemas (vt „Kaks peegeldust ei ole
  iseenesestmõistetav").
- **Langemisnurk α** (`firstIncidenceDeg`) mõõdetakse esimese peegli
  **ristsirge** suhtes, nagu kogu ülejäänud projektis (`peegeldumisseadus`
  otsustas selle sammus 1.7 ja seal on selle jaoks isegi kaks nime).
- **Kiir liigub alati tipu POOLE:** ta tabab kõigepealt peeglit 1, siis
  peeglit 2. Vastupidine käik on peegelpilt ja annab samad arvud
  (valguse tee pööratavus, POHIVARA 18.4) – seda mudel eraldi ei arvuta.

### Kaks seost, millel moodul seisab

1. **α + β = θ.** Langemisnurk esimesel peeglil pluss langemisnurk teisel
   peeglil on võrdne peeglite vahelise nurgaga.
   *Miks:* tipp, esimene ja teine langemispunkt moodustavad kolmnurga,
   mille nurgad on θ, (90° − α) ja (90° − β). Kolmnurga nurkade summa on
   180°, seega θ + 180° − α − β = 180° ehk α + β = θ.
2. **Pööre δ = 2·θ.** Kogu pööre, mille kiir kahe peegeldusega teeb,
   sõltub AINULT peeglite nurgast – mitte sellest, kust kiir tuli.
   *Miks:* ühel peeglil pöördub kiir 180° − 2·(nurk pinna suhtes) ehk
   2α võrra ja teisel 2β võrra; kokku 2α + 2β = 2(α + β) = 2θ.

Teine seos on mooduli õpieesmärk ja esimene on tee sinna. Kaks tagajärge,
mis annavad moodulile mõtte:

- **θ = 90° → δ = 180°:** väljuv kiir on sissetulevaga paralleelne ja
  vastassuunas, ükskõik kui viltu kiir tuli. See on POHIVARA joonis 50 ja
  see on põhjus, miks helkur üldse töötab (moodul `helkur`).
- **θ = 0° → δ = 0°:** paralleelsed peeglid ei muuda suunda üldse, ainult
  nihutavad valguse teed kõrvale. See on periskoop.

### Kaks peegeldust ei ole iseenesestmõistetav

Mõlemad seosed kehtivad ainult siis, kui kiir peegeldub **täpselt kaks
korda** ja väljub. Kitsas kiilus ta seda ei tee: pärast teist peegeldust
langeb ta tagasi esimesele peeglile ja peegeldub kolmandat korda, siis
neljandat. Kogupööre ei ole siis enam 2θ ja seost α + β = θ ei ole samuti
enam kellegi kohta öelda.

Piiri saab välja arvutada, mitte tunde järgi valida. Kui kirjeldada kiire
liikumissuunda nurgaga ψ (0° = piki peeglit 1 tipust eemale), siis
peegeldus peeglilt 1 teeb ψ → −ψ ja peeglilt 2 teeb ψ → 2θ − ψ.
Sissetuleva kiire suund on ψ₀ = −(90° + α), seega:

- pärast esimest peegeldust: ψ₁ = 90° + α
- pärast teist peegeldust: **ψ₂ = 2θ − 90° − α**

Kiir väljub kiilust ilma kolmanda peegelduseta täpselt siis, kui
**0 < ψ₂ < θ**. Sellest tulevad mõlemad piirid:

- **ψ₂ > 0 ehk α < 2θ − 90°.** Muidu on väljuv kiir suunatud tagasi
  peegli 1 poole – kolmas peegeldus. Näiteks θ = 60°, α = 40° annab
  ψ₂ = −10°: mudel „arvutaks" pöördeks 120°, aga päris kiir pöördub
  hoopis rohkem, sest ta pole veel valmis.
- **ψ₂ < θ ehk α > θ − 90°.** See puudutab ainult juhtu θ = 90°, α = 0:
  siis on peeglilt 1 peegeldunud kiir peegliga 2 **paralleelne** ega taba
  teda kunagi.

Kaks tagajärge, mis tuleb mudelisse ja simulatsiooni kirja panna:

1. **Kahe peegeldusega teed ei ole olemas, kui θ ≤ 45°** (siis on
   2θ − 90° ≤ 0 ja ükski α ei sobi). Seepärast nõuavad `traceCornerRay`,
   `secondIncidenceDeg` ja `secondHitDistanceM` **θ > 45°**.
   Väike nurk on kaleidoskoobi lugu (moodul „Piirid").
2. **Simulatsiooni liugurid peavad seda piiri austama:** peeglite nurk
   algab 60° juurest ja langemisnurk kärbitakse alla 2θ − 90°. Vastasel
   juhul joonistaks simulatsioon kiire, mis läheb peeglist LÄBI – ja see
   on täpselt see vaikne viga, mille peale õpilane oma seaduspära ehitab.

**α = 0 EI ole keelatud** (kui θ < 90°): kiir langeb esimesele peeglile
risti, tuleb sama teed tagasi üles ja tabab teist peeglit ikka, sest
peegel 2 on kiilu kohal viltu. Seda juhtu simulatsioonis ei ole (liugur
algab 5° juurest), aga mudel arvutab ta ausalt ära – funktsiooni piir
peab tulema geomeetriast, mitte liuguri sammust.

### Funktsioonid

- `deviationDeg(mirrorAngleDeg)` → **2 · θ**. Kogu pööre kahe peegelduse
  peale. Mooduli keskne valem ja ainus, mida õpilane arvutab.
  Lubatud vahemik siin on **0° ≤ θ ≤ 90°** – null on lubatud, sest
  paralleelsed peeglid (periskoop) on päris juhtum ja vastus 0° on aus.
- `secondIncidenceDeg(mirrorAngleDeg, firstIncidenceDeg)` → **θ − α**.
  Langemisnurk teisel peeglil. Nõuab θ > 45° ja α piire (vt eelmine osa).
- `secondHitDistanceM(mirrorAngleDeg, firstIncidenceDeg, firstHitDistanceM)`
  → **d · cos α / cos β**. Kui kaugel tipust tabab kiir teist peeglit, kui
  ta tabas esimest kaugusel d.
  *Miks:* siinusteoreem samas kolmnurgas –
  e / sin(90° − α) = d / sin(90° − β).
- `traceCornerRay(mirrorAngleDeg, firstIncidenceDeg, firstHitDistanceM)` →
  kogu teekond objektina:

  | väli | tähendus | väärtus |
  |---|---|---|
  | `firstHitM` | esimene langemispunkt | `{ x: d, y: 0 }` |
  | `secondHitM` | teine langemispunkt | `e · { cos θ, sin θ }` |
  | `incidentDirection` | sissetuleva kiire suund (ühikvektor) | vt allpool |
  | `middleDirection` | suund esimeselt peeglilt teisele | `secondHitM − firstHitM`, normeeritud |
  | `outgoingDirection` | väljuva kiire suund (ühikvektor) | vt allpool |
  | `firstIncidenceDeg` | α (= peegeldumisnurk peeglil 1) | sisend |
  | `secondIncidenceDeg` | β (= peegeldumisnurk peeglil 2) | θ − α |
  | `deviationDeg` | kogu pööre | 2θ |

  `incidentDirection` = `middleDirection` peegeldatuna peegli 1 (x-telje)
  suhtes ehk **(mx, −my)** – valguse tee pööratavus tagurpidi.
  `outgoingDirection` = `middleDirection` peegeldatuna peegli 2 suhtes:
  **(cos2θ · mx + sin2θ · my, sin2θ · mx − cos2θ · my)**.

  Nurki mudel vektoritest tagasi ei arvuta ja vektoreid nurkadest eraldi
  ei tuleta – üks arvutuskett, kaks väljundikuju.

**Miks EI ole funktsiooni „mis nurga all peavad peeglid olema, et kiir
pöörduks δ võrra"** (θ = δ / 2): seda arvutab practice-3-s õpilane ise ja
vastust kontrollib checker fikseeritud arvu vastu, mitte mudel. Kasutajata
funktsioon oleks kood, mida keegi ei kutsu (reegel 7).

**Idealiseeringud, mis peavad olema mudeli kommentaaris kirjas** (ja mida
UI ega õpetajajuhend ei tohi päris füüsikana esitada):

1. **Peeglid on ideaalselt tasased ja lõpmata õhukesed.** Päris peeglil on
   klaasi paksus, seega peegeldub natuke valgust ka esipinnalt (topeltpilt
   viltu vaadates).
2. **Peegel peegeldab kogu valguse.** Kaks peegeldust tähendavad päris
   peeglil kaht korda ~5 % kadu; mudelis intensiivsust ei ole.
3. **Kiir on lõputult peenike joon.** Päris valgusvihul on laius, seega
   päris nurkpeeglist tuleb tagasi vihk, mitte joon.
4. **Kõik toimub ühes tasandis.** Kahe peegli nurkpeegel saadab kiire
   tagasi ainult siis, kui valgus tuli peeglite tasandiga paralleelselt.
   Ruumis on selleks vaja kolme peeglit – seepärast ongi helkur täpitud
   pisikeste kuubinurkadega (moodul `helkur`).
5. **Peeglid on parajalt pikad: piisavalt, et mõlemad langemispunktid
   peale mahuksid, aga mitte nii pikad, et nad sissetuleva kiire ette
   jääksid.** Lõpmata pika peegli 2 korral lõikaks sissetulev kiir teda
   juba ENNE esimest peeglit (θ = 60°, α = 20°, d = 0,1 m korral 0,54 m
   kaugusel tipust) ja päris valgus ei jõuakski peeglini 1. Päris
   nurkpeeglil on peeglid lühikesed ja valgus tuleb sisse nende otste
   vahelt – seda mudel ei kontrolli, aga **Simulation.tsx peab peegli 2
   joonistama ainult natuke üle teise langemispunkti** (nt 1,3 ×
   `secondHitDistanceM`). Muidu näeks joonisel välja, nagu tuleks kiir
   läbi peegli.

**Testiväärtused (teadaolevad):** argumendid koodikujul (kümnendpunkt),
tulemused eestikeelse kümnendkomaga. Nurgad kraadides, pikkused meetrites.

| Kutse | Tulemus |
|---|---|
| `deviationDeg(90)` | 180 (nurkpeegli erijuht) |
| `deviationDeg(80)` | 160 |
| `deviationDeg(65)` | 130 |
| `deviationDeg(45)` | 90 (arv on õige, aga sellise nurga juures ei ole kahe peegeldusega teed – vt allpool) |
| `deviationDeg(0)` | 0 (paralleelsed peeglid – periskoop) |
| `secondIncidenceDeg(90, 30)` | 60 |
| `secondIncidenceDeg(90, 60)` | 30 |
| `secondIncidenceDeg(60, 20)` | 40 |
| `secondIncidenceDeg(70, 25)` | 45 |
| `secondIncidenceDeg(80, 30)` | 50 |
| `secondIncidenceDeg(60, 0)` | 60 (α = 0 on lubatud, kui θ < 90°) |
| `secondHitDistanceM(90, 45, 0.1)` | 0,1 (sümmeetriline juht: α = β) |
| `secondHitDistanceM(90, 30, 0.1)` | 0,17321 |
| `secondHitDistanceM(60, 20, 0.1)` | 0,12267 |
| `secondHitDistanceM(80, 20, 0.2)` | 0,37588 |
| `secondHitDistanceM(60, 0, 0.1)` | 0,2 (risti langenud kiir: e = d / cos θ) |
| `traceCornerRay(90, 30, 0.2).secondHitM` | `{ x: 0, y: 0,34641 }` |
| `traceCornerRay(90, 30, 0.2).middleDirection` | `{ x: −0,5, y: 0,86603 }` |
| `traceCornerRay(90, 30, 0.2).incidentDirection` | `{ x: −0,5, y: −0,86603 }` |
| `traceCornerRay(90, 30, 0.2).outgoingDirection` | `{ x: 0,5, y: 0,86603 }` (täpselt vastupidine sissetulevale) |
| `traceCornerRay(60, 20, 0.1).secondIncidenceDeg` | 40 |
| `traceCornerRay(60, 20, 0.1).deviationDeg` | 120 |

Piirjuhud ja invariandid (need on testid, mitte üksikread):

- **Peegeldumisseadus on invariant:** test käib tsükliga üle kümnete θ ja α
  paaride ja nõuab iga kord `firstIncidenceDeg + secondIncidenceDeg ===
  mirrorAngleDeg` ning `deviationDeg === 2 × mirrorAngleDeg`.
- **90° nurkpeegli lubadus on eraldi invariant:** iga lubatud α korral on
  `outgoingDirection` täpselt `−incidentDirection` (mõlemad komponendid,
  lubatud arvutusviga 1e-12). See on mooduli kõige tähtsam test – kui ta
  kunagi punaseks läheb, on katki see, mille peal helkur seisab.
- **Pööre ei sõltu langemisnurgast:** sama θ ja eri α korral on
  `deviationDeg` sama arv.
- **Mõõtkava:** `traceCornerRay(θ, α, 2d)` punktid on täpselt kaks korda
  kaugemal kui `traceCornerRay(θ, α, d)` omad; nurgad ja suunad on
  identsed.
- **Ühikvektorid on ühikvektorid:** kõigi kolme suuna pikkus on 1
  (lubatud viga 1e-12).
- **Teine langemispunkt on peeglil 2:** `secondHitM` nurk x-teljega on θ
  (lubatud viga 1e-9) ja tema kaugus tipust on `secondHitDistanceM`.
- **Kahe peegelduse piir on eraldi test:** iga lubatud (θ, α) korral peab
  väljuva kiire suunanurk ψ₂ = 2θ − 90° − α olema vahemikus 0…θ. Test
  arvutab selle `outgoingDirection`-ist (`atan2`) ja võrdleb valemiga –
  nii on valem ja vektorarvutus teineteise ristkontroll.
- **Vigased sisendid viskavad vea.** Vahemikud ei ole kõigil funktsioonidel
  samad:
  - **kõik funktsioonid:** NaN või lõpmatus ükskõik millises argumendis;
    `mirrorAngleDeg` < 0 või > 90; `firstHitDistanceM` ≤ 0.
  - **`deviationDeg`:** θ = 0 ON lubatud (paralleelsed peeglid, vastus 0)
    ja ka θ ≤ 45° on lubatud – see funktsioon ei joonista teekonda, vaid
    ütleb ainult, mitu kraadi teeb kaks peegeldust. Kas selline tee ka
    olemas on, otsustavad ülejäänud kolm funktsiooni.
  - **`secondIncidenceDeg`, `secondHitDistanceM`, `traceCornerRay`:**
    - **θ ≤ 45°** viskab vea: kahe peegeldusega teed ei ole olemas
      (2θ − 90° ≤ 0). Näited: `secondIncidenceDeg(45, 10)`,
      `traceCornerRay(30, 10, 0.1)`.
    - **θ = 0** langeb sama reegli alla ja lisaks ei ole paralleelsetel
      peeglitel tippu, seega ei ole ka „kaugust tipust" – periskoobi
      geomeetria on teine ülesanne, mida see moodul ei joonista.
    - **α < 0** viskab vea: langemisnurk ei saa olla negatiivne.
    - **α ≥ 2θ − 90°** viskab vea: kiir peegelduks kolmandat korda ja
      vastus „pööre = 2θ" oleks vale. Näited: `traceCornerRay(60, 30, 0.1)`
      (täpselt piiril, ψ₂ = 0 – kiir libiseks piki peeglit 1),
      `traceCornerRay(60, 40, 0.1)` (ψ₂ = −10°).
    - **α ≤ θ − 90°** viskab vea: peeglilt 1 peegeldunud kiir jääb
      peegliga 2 paralleelseks. Ainus juht selles vahemikus on
      `traceCornerRay(90, 0, 0.1)`.
    - Ülemine ots (α < 90°) tuleb tasuta: α < 2θ − 90° ≤ θ ≤ 90°.

## Sammud

### 1. hook – häälestus

Joonis (`figures.tsx`, silt `np-ule-aia`): laps kõrge plankaia taga, käes
papitoru, mille mõlemas otsas on viltune peegel. Katkendlik valgusjoon
tuleb aia tagant vasakult, langeb ülemisele peeglile, läheb toru mööda
alla, langeb alumisele peeglile ja jõuab silma. Sildid „ülemine peegel",
„alumine peegel", „valguse tee".

„Kuidas näha üle kõrge aia, ilma et ise varvastele tõuseksid? Kaks
peeglit torus – ja valgus toob pildi sulle alla. Kuidas nad seda teevad?"

Eesmärk õpilase keeles: „Oskan öelda, kui palju kiir kahe peegli vahel
pöördub, ja tean, mis on 90° nurkpeegli juures erilist."

### 2. theory – kaks peeglit järjest (üks ekraan)

- **Nurkpeegel on kaks tasast peeglit, mis on servapidi koos.** Nende
  vahelist nurka nimetame **peeglite nurgaks**. Valgus, mis kiilu sisse
  satub, peegeldub esmalt ühelt ja siis teiselt peeglilt.
- **Uut seadust siin ei ole.** Mõlemal peeglil kehtib täpselt seesama
  peegeldumisseadus mis üksikul tasapeeglil: **langemisnurk =
  peegeldumisnurk**, mõõdetuna selle peegli enda ristsirgest. Iga peegel
  ei tea teisest midagi.
- **Kaks langemisnurka annavad kokku peeglite nurga.** Kui kiir langeb
  esimesele peeglile nurga α all, siis teisele langeb ta nurga β all, ja
  alati kehtib **α + β = peeglite nurk**. Kui esimene nurk kasvab, kahaneb
  teine täpselt sama palju.
- **Kokku pöördub kiir kaks korda rohkem, kui on peeglite nurk.**
  Peeglite nurk 65° → kiir pöördub 130°. Peeglite nurk 80° → 160°. See
  **ei sõltu sellest, kust kiir tuli** – ainult peeglitest endist.
- **See kehtib nii kaua, kui peegeldusi on täpselt kaks.** Kui peeglid on
  teineteise vastu liiga kitsa nurga all, ei pääse kiir kahe peegeldusega
  välja: ta põrkab nende vahel edasi-tagasi mitu korda ja pöördub kokku
  rohkem. Seepärast on selle mooduli peeglid alati laiema nurga all.
- **Täisnurkne nurkpeegel saadab valguse tagasi sinna, kust ta tuli.**
  Kui peeglite nurk on 90°, on pööre 2 · 90° = 180°. Kiir väljub täpselt
  vastassuunas, ükskõik kui viltu ta sisse tuli. Just seepärast
  „süttivad" helkurid autotulede valguses – aga sellest räägime eraldi.
- **Kaks paralleelset peeglit ei pööra midagi.** Kui peeglite nurk on 0°,
  on ka pööre 0°: valgus väljub täpselt samas suunas, ainult natuke
  kõrvale nihkunult. Nii on tehtud **periskoop** – kaks peeglit toru
  otstes, mõlemad 45° kaldu, teineteisega paralleelsed. Sa vaatad otse
  edasi ja näed otse edasi, ainult meetri võrra kõrgemalt.
- Joonis (`np-kaks-peeglit`): kaks peeglit nurga θ all, tipp vasakul all;
  kiir tuleb paremalt, tabab alumist peeglit punktis P₁ (ristsirge
  katkendlikult, nurgad α ja α sildiga „α = α"), läheb üles teisele
  peeglile punkti P₂ (ristsirge katkendlikult, nurgad β ja β sildiga
  „β = β"), väljub paremale. Tipu juures kaar sildiga „peeglite nurk θ";
  sissetuleva kiire pikendus katkendlikult ja tema ning väljuva kiire
  vahel kaar sildiga „pööre = 2θ".

### 3. predict – hüpotees (lukustub!)

„Kaks peeglit on **täisnurga all** (90°). Kiir langeb esimesele peeglile
viltu. Kus ta pärast teist peeglit välja tuleb?"

(a) ta jätkab teed edasi, nagu poleks midagi juhtunud
(b) **ta läheb täpselt tagasi sinna, kust ta tuli**
(c) ta väljub 90° nurga all, sama palju kui on peeglite nurk

+ „Miks sa nii arvad?" (vabatekst).

Õige on (b). Vastust EI avaldata enne sammu 4.

Vale (a) saab sildi `kaks-peeglit-tuhistavad`, vale (c) sildi
`peeglite-nurk-on-poorde-nurk`.

### 4. explore – simulatsioon

SVG pealtvaates, **ühtne mõõtkava mõlemal teljel** (nurgad on joonisel
päris nurgad – seda ei tohi rikkuda, sest ekraanil on kirjas α, β ja
pööre). Tipp on vasakul all, peegel 1 läheb sealt paremale, peegel 2
nurga θ all üles; mõlemad paksu joonega ja viirutatud tagaküljega, et
oleks näha, kumb pool peegeldab. Kiil peeglite vahel on heledam.

Kiir tuleb paremalt, tabab peeglit 1 punktis P₁, läheb peeglile 2 punkti
P₂ ja väljub. Mõlemas langemispunktis on **ristsirge** katkendliku
joonega ning nurgakaared koos arvudega (α ja α; β ja β). Nooleotsad
näitavad valguse liikumissuunda kõigil kolmel lõigul.

Kastikesed paremal:

- „Peeglite nurk θ = 60°"
- „Peeglil 1: langemisnurk 20° · peegeldumisnurk 20°"
- „Peeglil 2: langemisnurk 40° · peegeldumisnurk 40°"
- „Kokku: 20° + 40° = 60° – täpselt peeglite nurk"

Iga nurk on ekraanil nii kaarena kui ka ARVUNA – värv ega joonis ei ole
kunagi ainus info kandja (DISAINIJUHIS). 360 px laiusel ekraanil lähevad
kastikesed joonise alla, mitte kõrvale.

Juhtnupud (kaks korraga, moodulilepingu järgi):

- **liugur: peeglite nurk θ** – **60…90°**, samm 5° (algväärtus 60°).
  Alumine ots ei ole maitseküsimus: alla 60° jääks langemisnurga jaoks
  vähem kui 30° ruumi ja alla 45° ei ole kahe peegeldusega teed üldse
  olemas (vt „Kaks peegeldust ei ole iseenesestmõistetav").
- **liugur: langemisnurk esimesel peeglil α** – 5…85°, samm 5°
  (algväärtus 20°). Väärtust **kärbitakse alati vahemikku
  5° … 2θ − 95°** (ehk rangelt alla mudeli piiri 2θ − 90°): suurema α
  korral peegelduks kiir kolmandat korda ja „pööre = 2θ" oleks vale.
  θ = 60° juures on ülemine ots seega 25°, θ = 90° juures 85°.
  Kärpimine juhtub ka siis, kui õpilane vähendab θ – liuguri ülemine ots
  liigub kaasa ja liuguri all on lause „Kui langemisnurk läheb liiga
  suureks, ei jõua kiir kahe peegeldusega välja – ta põrkaks peeglite
  vahel edasi."
- **lüliti: näita pöörde nurka** – lisab joonisele sissetuleva kiire
  katkendliku pikenduse ja tema ning väljuva kiire vahele kaare koos
  arvuga. AVANEB alles pärast ülesannet 1 (silt `poorde-lyliti`).
  Enne seda näeb õpilane ainult kaht peegeldust eraldi – nii jõuab ta
  seoseni α + β = θ ise, ilma et vastus („2θ") oleks kohe ekraanil.

Tolerantsid ja ühikud: nurkade ühik on **°**, tolerants **0,5°**.
Simulatsioon on ideaalne, seega on see LUGEMISTOLERANTS, mitte
mõõtemääramatus.

Ülesanded:

1. „Jäta peeglite nurgaks 60° ja langemisnurgaks esimesel peeglil 20°.
   Kui suur on langemisnurk TEISEL peeglil?" (40°; tolerants 0,5°; ühik °;
   vihje 1: „vaata teise peegli ristsirget ja tema juures olevat arvu";
   vihje 2: „liida kaks langemisnurka kokku ja võrdle peeglite nurgaga")
   Selgitus pärast vastamist: kaks langemisnurka annavad alati kokku
   peeglite nurga: 20° + 40° = 60°. Pärast seda ülesannet avaneb pöörde
   lüliti.
2. „Lülita sisse „näita pöörde nurka". Kui palju kiir kahe peegeldusega
   kokku pöördus?" (120°; tolerants 0,5°; ühik °; vihje: „võrdle
   peeglite nurgaga – mitu korda suurem?")
3. „Sea peeglite nurgaks 75°. Kui palju kiir nüüd pöördub?" (150°;
   tolerants 0,5°; ühik °; vihje: „pööre on alati kaks korda peeglite
   nurk")
   Selgitus: pööre = 2 × peeglite nurk, seega 2 · 75° = 150°. Peeglite
   nurk kasvas 15° võrra ja pööre 30° võrra – alati kaks korda rohkem.
4. „Sea peeglite nurgaks 90°. Muuda nüüd AINULT langemisnurka. Mis
   juhtub väljuva kiirega?" (valik)
   (a) ta muudab suunda koos langemisnurgaga
   (b) **ta jääb alati sissetulevaga paralleelseks ja liigub vastassuunas**
   (c) ta väljub ainult siis vastassuunas, kui langemisnurk on 45°
   Selgitus: 90° juures on pööre 2 · 90° = 180° ehk täispööre tagasi –
   ja pööre ei sõltu langemisnurgast. Ükskõik kust kiir tuli, sinna ta ka
   tagasi läheb. See on ka ennustuse (samm 3) vastus.

### 5. practice – harjutamine

1. **Näidis (lahendatud):** Kaks peeglit on 65° nurga all. Kui palju
   pöördub nende vahelt läbi käiv kiir? Pööre on kaks korda peeglite
   nurk: 2 · 65° = **130°**. Peale selle ei ole vaja midagi teada – ka
   seda mitte, kust kiir tuli.
2. **Osaline (täida lünk):** Peeglite nurk on 80°. Kiir pöördub
   2 · 80° = ___ °. (vastus 160; tolerants 0,5°; ühik °; vihje: „kaks
   korda peeglite nurk")
3. **Iseseisev (pöördülesanne):** Tahad suunata laseri valguse täpselt
   160° võrra tagasi ja kasutad selleks nurkpeeglit. Mis nurga alla pead
   peeglid seadma? (vastus 80; tolerants 0,5°; ühik °; vihje 1: „pööre on
   kaks korda peeglite nurk – mis on siis peeglite nurk?"; vihje 2:
   „160° on kaks korda mis?")
   Selgitus pärast vastamist: peeglite nurk on POOL pöördest, seega 80°.
   Vale vastus 160 saab sildi `peeglite-nurk-on-poorde-nurk`.
4. **Iseseisev (joonise lugemine):** Joonis (`np-loe-nurgad`): nurkpeegel,
   peeglite nurk märgitud kaarega ja arvuga **70°**; kiir langeb
   esimesele peeglile, ristsirge katkendlikult ja langemisnurk märgitud
   arvuga **25°**; teise peegli juures on ristsirge ja nurgakaar, aga
   arvu asemel küsimärk. Küsimus: „Kui suur on langemisnurk teisel
   peeglil?" (vastus 45; tolerants 0,5°; ühik °; vihje: „kaks
   langemisnurka annavad kokku peeglite nurga")
   Selgitus: 70° − 25° = 45°.
5. **Ülekanne (valik, mitu õiget):** Periskoobis on kaks peeglit
   teineteisega paralleelselt (peeglite nurk 0°), mõlemad 45° kaldu toru
   suhtes. Millised väited on õiged?
   **valguse suund ei muutu – vaatad otse edasi ja näed otse edasi**,
   **valguse tee nihkub kõrvale, umbes toru pikkuse võrra**,
   **mõlemal peeglil kehtib peegeldumisseadus**,
   periskoop pöörab pilti 90° võrra,
   periskoop suurendab pilti, sest valgus käib pikema tee.
   `shuffle: true`. Vale „pöörab pilti 90°" saab sildi
   `periskoop-poorab-pilti`, vale „suurendab" sildi
   `pikem-tee-suurendab`.
   Selgitus pärast vastamist: kaks peegeldust pöörasid kiirt 90° ühes ja
   90° teises suunas – kokku null. Pikk tee ei suurenda midagi: peegel ei
   muuda eseme suurust, ta muudab ainult seda, kust me teda vaatame.

### 6. exit – väljumispilet

1. Kaks peeglit on 70° nurga all. Kui palju pöördub kiir kokku? (140°;
   tolerants 0,5°; ühik °; vihje: „kaks korda peeglite nurk")
2. Mis on täisnurkse (90°) nurkpeegli juures erilist? (valik)
   (a) valgus jääb peeglite vahele kinni
   (b) **valgus tuleb tagasi täpselt sinna, kust ta tuli, ükskõik kust ta
   tuli**
   (c) valgus väljub 90° nurga all sissetuleva kiire suhtes
3. „Sõber ütleb: „Periskoobis peegeldub valgus kaks korda, seega peab
   pilt olema kaks korda pööratud – ma ei saa sealt midagi aru." Mida sa
   talle vastad?" (vabatekst, õpetajale nähtav – oodatav mõte:
   periskoobi peeglid on teineteisega paralleelsed ehk peeglite nurk on
   0°, seega on ka pööre 0°. Esimene peegel keerab valgust ühele poole,
   teine täpselt sama palju tagasi – suund jääb samaks, muutub ainult
   see, kust kohast me vaatame)

## Väärarusaamad

| Silt | Väärarusaam | Kuidas moodul selle ümber lükkab |
|---|---|---|
| `peeglite-nurk-on-poorde-nurk` | kiir pöördub sama palju, kui suur on peeglite nurk | explore-2 ja 3: pöörde arv on ekraanil ja on iga kord täpselt kaks korda suurem; practice-3 nõuab jagamist, mitte kopeerimist |
| `kaks-peeglit-tuhistavad` | kaks peegeldust tühistavad teineteist, kiir läheb lihtsalt edasi | explore-2: pöörde kaar ja arv on ekraanil; teooria ütleb, et see kehtib AINULT paralleelsete peeglite korral |
| `poore-soltub-langemisnurgast` | kui kiir tuleb teise nurga alt, siis pöördub ta teisiti | explore-4: langemisnurga muutmine ei liiguta pöörde arvu; mudelil on selle kohta eraldi invariant-test |
| `tagasitulek-soltub-langemisnurgast` | 90° nurkpeegel saadab valguse tagasi ainult siis, kui kiir tuli „õige" nurga alt (nt 45°) | explore-4 valik (c) on täpselt see; simulatsioonis saab liugurit liigutada ja väljuv kiir jääb paralleelseks |
| `periskoop-poorab-pilti` | periskoop pöörab vaatesuunda 90° võrra | teooria (peeglite nurk 0° → pööre 0°) + practice-5 selgitus |
| `teine-peegel-ei-jargi-seadust` | teisel peeglil käib asi „kuidagi teisiti", sest kiir tuleb sinna juba peegeldununa | explore: mõlema peegli juures on ristsirge ja kaks võrdset nurka ekraanil; teooria ütleb, et peegel ei tea teisest midagi |
| `pikem-tee-suurendab` | pikem valguse tee (kaks peeglit, pikk toru) suurendab pilti | practice-5 selgitus: peegel ei muuda eseme suurust |
| `nurkpeegel-vajab-taisnurka` | nurkpeegel „töötab" ainult 90° juures, muu nurk ei anna midagi | explore-1…4 käivad läbi 60°, 75° ja 90°; igal juhul on pööre olemas ja arvutatav |

## Õpetajale (teacher.ts)

- **(K) kaks taskupeeglit lauale (5 min, vahendid: 2 väikest peeglit,
  laserosuti VÕI päikesekiir, valge paber):** pane peeglid servapidi kokku
  nurga alla ja saada kiir kiilu sisse. Märgi paberile sisse- ja väljuva
  kiire tee, mõõda malliga pööre ja võrdle peeglite nurgaga. Sea seejärel
  peeglid täisnurga alla ja liiguta laserit – kiir tuleb iga kord tagasi
  osuti juurde. **Ohutus: laserosutit ei suunata kunagi kellegi silma ega
  peeglisse nii, et peegeldunud kiir kellelegi näkku läheb.** Enne katset
  lepitakse kokku, et laser jääb lauapinna kõrgusele ja kõik seisavad.
  Odavam ja ohutum variant: taskulamp koos papist pilu abil tehtud kitsa
  vihuga.
  **Hoia peeglite nurk laia (60°…90°).** Kitsama nurga korral ei pääse
  kiir kahe peegeldusega välja – ta põrkab peeglite vahel mitu korda ja
  siis EI ole pööre 2θ. See ei ole katse äpardus, vaid reegli piir; kui
  keegi juhtub seda leidma, on see hea koht öelda, et sealt algab
  kaleidoskoobi lugu.
- **(K) mitu kujutist nurkpeeglis (3 min, sama kaks peeglit):** pane
  peeglite vahele nööbike ja vähenda nurka. Kujutisi tuleb aina rohkem
  (90° → 3, 60° → 5). Miks – see on juba KUJUTISTE lugu ja jääb sellest
  moodulist välja; siin on ta hea „ahaa" ja kaleidoskoobi seletus.
- **(K) papitorust periskoop (10 min, vahendid: piimapakk või papitoru,
  2 taskupeeglit, teip, nuga):** lõika toru otstesse vastaspooltele avad
  ja teibi peeglid 45° kaldu, teineteisega paralleelselt. Lase õpilastel
  vaadata üle laua serva või ukse tagant. Küsi enne vaatamist, kas pilt
  tuleb pea peale.
- **Soovitus:** simulatsioon ENNE päris katset. Peeglite nurga täpne
  seadmine laual on tüütu ja hajub – ekraanil näeb seaduspära viie
  sekundiga ja laual otsib õpilane siis juba kinnitust, mitte mustrit.
- **Miks päris katses arvud natuke lohisevad:** peegli klaas on paks
  (peegeldav kiht on TAGA), peeglid ei ole päris servapidi koos ja
  laserikiir on lai. Pööre tuleb ikka 2θ, aga paberil mõõdetuna paar
  kraadi kõrvale – see on hea koht rääkida mõõtmisveast, mida
  simulatsioonis meelega ei ole.
- **Aruteluküsimused:** Miks on helkur täpitud pisikeste nurkadega, mitte
  lihtsalt tasane läikiv plaat? (Vastus tuleb järgmises moodulis, aga
  arvata võib juba nüüd.) Mis juhtub, kui nurkpeegli peeglid on täpselt
  paralleelsed ja panna nende vahele küünal? Kolm peeglit kuubi nurgana –
  miks saadab see valguse tagasi ka siis, kui valgus ei tule peeglite
  tasandis? (Kuu peale on jäetud just sellised reflektorid.)
- **Millal see moodul tunnis:** pärast moodulit `peegeldumisseadus` ja
  `tasapeegli-kujutis`, enne moodulit `helkur`. Kõverpeeglitega
  (`kumerpeegel`, `noguspeegel`) ta seotud ei ole – siin on mõlemad
  pinnad tasased ja uus on ainult see, et neid on kaks.
- **Tunniplaan (15 min):** 2 min hook + 3 min teooria · 2 min hüpotees ·
  5 min simulatsioon · 2 min harjutamine · 1 min väljumispilet.
  45-minutilises tunnis mahub kõrvale kahe peegli katse ja periskoobi
  ehitamine.

## Kordamiskaardid (5 tk)

| id | tüüp | küsimus | vastus |
|---|---|---|---|
| rc-1 | concept | Mis on nurkpeegel? | Kaks tasast peeglit, mis on servapidi nurga all koos. Nende vahelt läbi käiv kiir peegeldub kaks korda ja pöördub kokku kaks korda rohkem, kui on peeglite vaheline nurk |
| rc-2 | calc | Kaks peeglit on 70° nurga all. Kui palju pöördub kiir? | 140° (2 · 70°) |
| rc-3 | calc | Kiir langeb esimesele peeglile 30° nurga all. Peeglite nurk on 80°. Kui suur on langemisnurk teisel peeglil? | 50°, sest kaks langemisnurka annavad kokku peeglite nurga: 80° − 30° = 50° |
| rc-4 | explain | Mis on täisnurkse nurkpeegli juures erilist? | Pööre on 2 · 90° = 180°, seega väljub kiir alati sissetulevaga vastassuunas – ükskõik kui viltu ta sisse tuli. Sellel omadusel töötab helkur |
| rc-5 | transfer | Periskoobi peeglid on teineteisega paralleelsed. Miks ei ole pilt sealt pea peale pööratud? | Peeglite nurk on 0°, seega on pööre 2 · 0° = 0°. Esimene peegel keerab valgust ühele poole, teine sama palju tagasi – suund jääb samaks, muutub ainult koht, kust vaatame |
