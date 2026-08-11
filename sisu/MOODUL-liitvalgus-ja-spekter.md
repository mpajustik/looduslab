# Mooduli spetsifikatsioon: Liitvalgus ja spekter

Ainekava seos (AINEKAVA-fyysika-8.md): plokk P1; õpitulemused: P1-T1 (osa:
valgusallikate liigitamine **spektraalse koostise** järgi) ja P1-T3 (osa:
spekter – „peegeldunud valguse spektri" seosest esemete värvusega katab see
moodul ainult SPEKTRI poole); mõisted, mida õpetab: valge valgus, liht- ja
liitvalgus, valguse spekter; praktiline töö: –.
Vanus: 8. klass. Kestused: demo 5 min, tund 18 min, iseseisev 14 min.
Tüüp: mikromoodul (üks õpieesmärk, 6 sammu).

slug: `liitvalgus-ja-spekter` · id: `physics.liitvalgus-ja-spekter`

## Ainekava seos (täpsemalt)

- **Plokk:** P1 Valgus ja valguse sirgjooneline levimine. Peegeldumine ja
  neeldumine
- **Õpitulemused:**
  - **P1-T1 osa** – „liigitab valgusallikaid suuruse ja **spektraalse
    koostise** järgi". Suuruse järgi liigitamise (punkt- vs laiendatud
    allikas) tegi ära moodul `valgusallikad`; siin on teine pool ehk
    liigitus liht- ja liitvalguse järgi.
  - **P1-T3 osa** – „seostab peegeldunud valguse spektrit esemete
    värvusega". Siin on ainult EELDUS: mis on spekter ja miks on valges
    valguses kõik värvid olemas. Peegeldumise ja neeldumise pool (miks must
    särk on must) on moodulis `esemete-varvus`.
- **Õppesisu punktid:** „liitvalgus ja spekter"
- **Põhimõisted, mida moodul ÕPETAB:** valge valgus, liht- ja liitvalgus,
  valguse spekter (kõik kolm on ainekava põhimõistete loendis ja kõik kolm
  saavad siin definitsiooni, kasutuse ja kontrolli)
- **Praktiline töö:** – (P1-PT2 „värvilise valguse uurimine
  valgusfiltritega" on mooduli `valgusfiltrid` oma)
- **Teema olulisus → hook:** „igapäevased valgusnähtused looduses ja
  tehnikas" + seos valgustehniku ja fotograafi erialaga – tänavavalgusti
  vahetus: vana kollane naatriumlamp vs uus valge LED, ja miks vanade
  lampide all olid kõik autod ühtemoodi hallikaskollased
- **Metoodilised soovitused, mida järgin:** ainekava täpsustus nõuab
  valguse kirjeldamist ka LAINEPIKKUSE keeles (Päikeselt tuleb
  lühilaineline, Maalt lahkub pikalaineline kiirgus – see täpsustus on
  ainekavas P1 juures). Seepärast on liugur nanomeetrites, aga arv on
  õpilase jaoks „värvi number", mitte laineõpetus – võnkumine ja laine on
  plokk P7.
- **Õpilase tegevused:** (D) uurib eri valgusallikate spektreid
  spektroskoobi-simulatsioonis ja liigitab allikaid liht-/liitvalguse
  järgi; (K) päris spektri vaatamine CD-plaadi või prismaga; (K) Newtoni
  ketas ehk värvide tagasi kokkupanek

## Piirid (mida see moodul EI tee)

- **MIKS prisma valguse värvideks lahutab** (eri lainepikkused murduvad
  erinevalt) – see on murdumine ehk plokk P2, moodul
  `liitvalguse-lahutamine`, ja `vikerkaar`. Siin on spekter ANTUD: nii ta
  välja näeb. Simulatsioon on spektroskoop, mitte prisma – nii ei jää
  õpilasele muljet, et me selgitasime midagi, mida me ei selgitanud.
- **Miks ese on mingit värvi** (neeldumine ja peegeldumine) – moodul
  `esemete-varvus`.
- **Valgusfilter** – moodul `valgusfiltrid` (koos P1-PT2-ga).
- **Värvide segamine maalikunstis** (kollane + sinine = roheline) – see on
  VÄRVIAINETE segamine, hoopis teine nähtus kui valguste liitmine. Teoorias
  on üks lause piiri tõmbamiseks, sest see väärarusaam tuleb tunnis alati
  ette; ühtki küsimust selle kohta ei ole.
- **Infrapunane ja ultraviolett** – mainitakse faktina spektri riba mõlemas
  otsas (aitab hiljem `esemete-varvus` ja energiabilanss), aga ei küsita.

## Allikad

- **Teooria tugi:** `sisu/allikad/POHIVARA-F8-taielik.md` ptk 17
  (definitsioon „valge valgus on liitvalgus – see koosneb värvilistest
  (vikerkaarevärvustega) valgustest" ja punkt 17.10: kui valge valgus
  värvilisteks valgusteks lahutada ja need uuesti kokku viia, saame jällegi
  valge valguse; punkt 17.3: mida kõrgem on keha temperatuur, seda sinakam
  on kiiratav valgus – seda kasutab hõõglambi ja Päikese võrdlus).
  `sisu/allikad/OPIK-F8-INDEKS.md` ptk 1.4 „Nähtav valgus kui liitvalgus"
  (lk 12–15) – faktikontrolliks. Tekst on oma sõnadega, kõik arvud ja
  ülesanded on selle mooduli omad (vt ALLIKAD.md).
- **Ülesannete näidised:** – (kõik ülesanded on siin esimest korda kokku
  pandud, arvud tulevad model.ts konstantidest)

## Füüsika (model.ts jaoks)

Mudel ei arvuta murdumist ega energiat – ta hoiab **ühte tabelit** (mis
lainepikkus on mis värv) ja **ühte allikate loendit** (mis lainepikkusi
milline allikas kiirgab) ning vastab nende põhjal küsimustele. Kogu asi on
puhtad funktsioonid, nagu reegel 1 nõuab.

### Nähtava valguse riba

| Konstant | Väärtus | Selgitus |
|---|---|---|
| `VISIBLE_MIN_NM` | 380 | nähtava valguse lühim lainepikkus |
| `VISIBLE_MAX_NM` | 760 | nähtava valguse pikim lainepikkus |

Alla 380 nm on ultraviolett, üle 760 nm infrapunane – mõlemad on mudelis
olemas ainult sildina „nähtamatu", et liuguri otsad ei valetaks.

### Spektri ribad (`SPECTRUM_BANDS`)

Iga riba on `{ id, label, minNm, maxNm }`. Alumine ots kuulub ribasse,
ülemine mitte (`minNm ≤ nm < maxNm`) – nii ei jää piiri peal kahte vastust.
**Erand on viimane riba:** punase ülemine ots 760 nm KUULUB ribasse
(`minNm ≤ nm ≤ maxNm`), muidu jääks liuguri kõige parempoolsem asend
värvita ja simulatsioon ütleks nähtava valguse otspunktis „nähtamatu".
Nähtav ala on seega kinnine lõik 380–760 nm.

| id | label (eesti k) | minNm | maxNm |
|---|---|---|---|
| `violet` | violett | 380 | 425 |
| `indigo` | tumesinine | 425 | 450 |
| `blue` | sinine | 450 | 495 |
| `green` | roheline | 495 | 570 |
| `yellow` | kollane | 570 | 590 |
| `orange` | oranž | 590 | 620 |
| `red` | punane | 620 | 760 |

Seitse riba = vikerkaarevärvused, sama loend, mis põhivaras. Piirid on
kokkulepe (värv muutub sujuvalt, mitte hüppega) ja see on mudeli
kommentaaris kirjas – arvudele ei tohi anda suuremat täpsust, kui neil on.

### Allikad (`LIGHT_SOURCES`)

Iga allikas on `{ id, label, emitted: [{minNm, maxNm}], note }`.

| id | label | kiirgab (nm) | mitu riba | tajutav värv |
|---|---|---|---|---|
| `sun` | päikesevalgus | 380–760 (pidev) | 7 | valge |
| `bulb` | hõõglamp | 380–760 (pidev, punases otsas tugevam) | 7 | valge |
| `led` | valge LED-lamp | 450–495 ja 495–620 | 4 (sinine, roheline, kollane, oranž) | valge |
| `sodium` | naatriumlamp (vana tänavavalgusti) | 588–590 | 1 (kollane) | kollane |
| `laser` | punane laserikiir | 645–655 | 1 (punane) | punane |

**Naatriumlambi vahemik on meelega 588–590 nm, mitte laiem.** Päris
naatriumlambi kaks kollast joont on 589,0 ja 589,6 nm – mõlemad jäävad
kollasesse ribasse (570–590). Kui vahemik ulatuks üle 590, satuks lamp
korraga kollasesse ja oranži ribasse, `bandCount("sodium")` annaks 2 ja
`isCompositeLight("sodium")` väärtuse `true` – kogu explore-4 ülesanne
läheks katki. Ülemine ots 590 ise ei tee oranžist ribat, sest kattumine
peab olema tõeline lõik, mitte üksik punkt (CodeRabbiti leid samm 4.1u).

Hõõglambi ja Päikese vahe („kumb on punakam") on selles moodulis SÕNADEGA,
mitte arvudega – tugevuste jaotust (spektri intensiivsust) mudel ei kirjelda,
sest see nõuaks kiirgusseadusi. Mudel ütleb ainult, KAS lainepikkus on
olemas või mitte. See lihtsustus on mudeli kommentaaris kirjas.

Valge LED on meelega tükeldatud: päris valge LED on sinine kiip + kollakas
luminofoor, mille kiirgus katab rohelise ja kollase ala ning jääb punases
otsas nõrgaks. Selle mudeli keeles: LED-il **ei ole punast riba**. See on
mooduli kõige olulisem „aha" ja ka sild moodulini `lambivalik`.

### Funktsioonid

- `colourAtWavelength(nm)` → riba `label` või `"nähtamatu"`, kui `nm` on
  väljaspool 380–760. Negatiivne või mittearvuline `nm` viskab vea.
- `emitsAtWavelength(sourceId, nm)` → `boolean`. Tundmatu `sourceId`
  viskab vea.
- `emittedBands(sourceId)` → ribade loend, mille allikas VÄHEMALT osaliselt
  katab (kattumine peab olema tõeline lõik, mitte ainult ühine otspunkt).
- `bandCount(sourceId)` = `emittedBands(sourceId).length`
- `isCompositeLight(sourceId)` → `bandCount > 1`. See ongi liht- ja
  liitvalguse vahe mudeli keeles.
- `perceivedColour(sourceId)` → kuidas silm seda valgust näeb. Reegel
  (kolm juhtu, selles järjekorras):
  1. kui allikas katab kõiki kolme piirkonda – **punane ala** (punane või
     oranž), **roheline ala** (kollane või roheline), **sinine ala**
     (sinine, tumesinine või violett) – siis `"valge"`;
  2. muidu, kui ribasid on täpselt üks, siis selle riba `label`;
  3. muidu `"segavärv"`.
  Punkt 1 on silma kolme retseptori lihtsustus ja seletab, miks valge LED
  paistab valge, kuigi tema spekter on aukudega. Punkt 3 ei tule selles
  moodulis ette (ühelgi allikal ei ole kaht-kolme ribas), aga funktsioon
  peab vastama õigesti ka siis, kui keegi ta kunagi mujale viib – seda
  katab test.
- `bandWidthNm(bandId)` = `maxNm − minNm`.

Sildid on eestikeelsed, sest need on mõisted, mitte UI-tekst: `label` on
sama sõna, mida kontrollib checker (nt „kollane"). Mudel ei tea küll UI-st
midagi, aga vikerkaarevärvuste nimed ON siin füüsika sisu.

**Testiväärtused (teadaolevad):**

| Kutse | Tulemus |
|---|---|
| `colourAtWavelength(700)` | „punane" |
| `colourAtWavelength(589)` | „kollane" |
| `colourAtWavelength(510)` | „roheline" |
| `colourAtWavelength(470)` | „sinine" |
| `colourAtWavelength(400)` | „violett" |
| `colourAtWavelength(620)` | „punane" (alumine ots kuulub ribasse) |
| `colourAtWavelength(619)` | „oranž" (ülemine ots ei kuulu) |
| `colourAtWavelength(760)` | „punane" (viimase riba ülemine ots kuulub ribasse) |
| `colourAtWavelength(370)` / `(800)` / `(761)` | „nähtamatu" |
| `emitsAtWavelength("laser", 650)` | `true` |
| `emitsAtWavelength("laser", 500)` | `false` |
| `emitsAtWavelength("led", 660)` | `false` (LED-il puudub punane) |
| `emitsAtWavelength("sun", 660)` | `true` |
| `bandCount("sun")` | 7 |
| `bandCount("led")` | 4 |
| `bandCount("sodium")` | 1 |
| `isCompositeLight("sun")` | `true` |
| `isCompositeLight("laser")` | `false` |
| `perceivedColour("sun")` | „valge" |
| `perceivedColour("led")` | „valge" |
| `perceivedColour("sodium")` | „kollane" |
| `perceivedColour("laser")` | „punane" |
| `bandWidthNm("green")` | 75 |
| `bandWidthNm("red")` | 140 |

Piirjuhud ja vigased sisendid:

- **Riba ots ei tee ribat:** väljamõeldud allikas, mis kiirgab täpselt
  495–570, annab `bandCount = 1` (ainult roheline), mitte 3 – kattumine
  otspunktis (`nm = 495` sinise ülemine ots) ei lähe arvesse.
- **`perceivedColour` kolmas haru:** väljamõeldud allikas, mis kiirgab
  punast ja sinist, annab „segavärv" (kaks riba, kolmas piirkond puudu).
  Test kasutab siin mudelisse eksporditud abifunktsiooni, mis võtab ribade
  loendi – nii ei pea testi jaoks `LIGHT_SOURCES` loendisse võltsallikat
  lisama.
- Vigased sisendid: `colourAtWavelength(NaN)`, `emitsAtWavelength("kuu",
  500)`, `bandWidthNm("roosa")` → viskavad vea.

## Sammud

### 1. hook – häälestus

Joonis (`figures.tsx`, silt `ls-tanavavalgusti`): sama tänavanurk kaks
korda. Vasakul vana naatriumlamp – kõik on kollakashall, kaks autot on
täpselt sama tooni. Paremal valge LED-valgusti – üks auto on punane, teine
sinine. Pealkirjad „vana lamp" ja „uus lamp".

„Vana tänavavalgusti all nägid kõik autod välja ühtemoodi kollakashallid.
Uue valgusti all on üks punane ja teine sinine. Autod on samad – mis on
siis teistsugune?"

Eesmärk õpilase keeles: „Tean, et valge valgus koosneb paljudest värvidest,
ja oskan spektri järgi öelda, kas valgus on liht- või liitvalgus."

### 2. theory – valge valgus on värvide segu (üks ekraan)

- **Valguse spekter** on see, millistest värvidest (lainepikkustest)
  valgus koosneb. Spektri saab nähtavaks teha prismaga või CD-plaadiga –
  MIKS see nii juhtub, uurime murdumise juures (plokk P2).
- **Liitvalgus** koosneb mitmest värvist, **lihtvalgus** ainult ühest.
  Lihtvalguse spektris on üksainus kitsas riba (nt punase laseri oma
  650 nm ümber), liitvalguse spektris mitu.
- **Valge valgus on liitvalgus:** päikesevalguses on olemas kõik
  vikerkaarevärvused – violett, tumesinine, sinine, roheline, kollane,
  oranž, punane. Kui need uuesti kokku panna, tuleb jälle valge välja.
  Valge ei ole seega „värvitu", vaid „kõik korraga".
- Lainepikkust mõõdetakse **nanomeetrites** (nm, miljardik meetrit).
  Nähtav valgus on 380–760 nm; lühem on ultraviolett, pikem infrapunane –
  neid silm ei näe.
- **Värvide segamine guaššiga on hoopis teine asi.** Seal segatakse
  värviAINEID, mis valgust ära neelavad; siin liidetakse VALGUSI. Sellepärast
  annab kollane + sinine värvipurgis rohelise, aga valgusvihkudena hoopis
  valkja tooni.
- Joonis (`ls-spekter-riba`): pikk riba violetist punaseni, all
  lainepikkuse skaala 380 → 760 nm, ribade nimed peal; mõlemas otsas hall
  ala siltidega „ultraviolett (ei näe)" ja „infrapuna (ei näe)".

### 3. predict – ennustus (lukustub!)

„Vaatame spektroskoobiga (riistaga, mis näitab, millised värvid valguses
olemas on) kahte valgust: päikesevalgust ja punase laseri kiirt. Mida
näitab spektroskoop laseri kohta?"

(a) sama vikerkaare nagu päikesevalgusel, ainult punakama
(b) **ainult ühte kitsast punast riba, mujal on tühjus**
(c) mitte midagi – laser on liiga ere

+ „Miks sa nii arvad?" (vabatekst).

Õige on (b). Laser kiirgab ainult üht värvi – tema kogu kiirgus mahub
ühte kitsasse ribasse 650 nm ümber. See ongi lihtvalgus. Vastust EI avaldata enne sammu 4.

Vale (a) saab sildi `koik-valgus-on-liitvalgus`, vale (c) sildi
`spekter-soltub-eredusest`.

### 4. explore – simulatsioon (spektroskoop)

SVG: ülal valgusallika ikoon, keskel lai spektririba 380–760 nm, millel on
värvilised ainult need kohad, mida valitud allikas kiirgab (ülejäänu on
tume). Riba all lainepikkuse skaala ja liuguri marker. Paremal kaks
kastikest: „mitu vikerkaarevärvi ribas on" ja „kuidas silm seda valgust
näeb" (värvilaik + sõna mudeli `perceivedColour` järgi).

Juhtnupud (kaks muudetavat suurust, moodulilepingu järgi):

- **valik: valgusallikas** – päikesevalgus / hõõglamp / valge LED-lamp /
  naatriumlamp / punane laser (nupurida, mitte liugur)
- **liugur: lainepikkus** 380–760 nm, samm **5 nm**, algväärtus **550 nm**
  (roheline, riba keskel). Liuguri all on tekst: „550 nm – ROHELINE – see
  allikas kiirgab / EI kiirga seda värvi."

Algväärtus 550 satub võrele ((550 − 380) / 5 = 34) – õpilane saab pärast
liigutamist alguskohta tagasi. Sama lõks, mis moodulis `varjutused`.

Tolerantsid ja ühikud: lainepikkused `nm`, tolerants **absoluutne ±10 nm**
(protsent oleks eksitav: 5% kuuesajast on 30 nm ehk poolteist ribat, 5%
neljasajast aga 20 nm – sama vastus oleks eri kohtades eri rangusega);
ribade arv on täisarv, ühikuta, tolerants **0**.

Ülesanded:

1. „Vali päikesevalgus. Mitu vikerkaarevärvi on spektris olemas?"
   (7; tolerants 0; ühikuta)
2. „Vali punane laser ja otsi liuguriga üles koht, kus riba on värviline.
   Mis lainepikkusel laser kiirgab?" (650 nm; tolerants ±10 nm; ühik `nm`;
   vihje 1: „liigu punase otsa poole"; vihje 2: „riba on kitsas – ainult
   paar liuguri sammu lai")
3. „Vali valge LED-lamp. Ta paistab valge, aga vaata spektrit hoolega.
   Milline värv on peaaegu puudu?" (valik) (a) sinine (b) roheline
   (c) **punane**
4. „Vali naatriumlamp. Kumb väide on õige?" (valik)
   (a) naatriumlamp annab liitvalgust, sest kollane on segavärv
   (b) **naatriumlamp annab lihtvalgust – spektris on ainult üks riba**
   (c) naatriumlambil ei ole spektrit

Ülesande 3 juures kuvab simulatsioon pärast vastamist lühikese lause:
„Silm näeb valget, sest sinine, roheline ja kollane katavad silma kolm
värvitundlikku andurit ära. Punast valgust LED-ist peaaegu ei tule – ja
seda on näha siis, kui vaadata punast eset." (Ese ise jääb moodulile
`esemete-varvus`.)

### 5. practice – harjutamine

1. **Näidis (lahendatud):** Mille poolest erineb päikesevalgus laseri
   valgusest? Päikesevalguse spektris on kõik seitse vikerkaarevärvi
   380 nm-st 760 nm-ni – see on **liitvalgus** ja silm näeb seda valgena.
   Laseri spektris on üksainus kitsas riba 650 nm juures – see on
   **lihtvalgus** ja silm näeb seda punasena. Mitte eredus ei tee vahet,
   vaid see, mitu värvi valguses on.
2. **Osaline (täida lünk):** Rohelise riba lainepikkused on 495–570 nm.
   Kui lai see riba on? 570 − 495 = ___ (vastus 75; tolerants 0; ühik `nm`;
   vihje: „lahuta suuremast väiksem")
3. **Iseseisev (spektri lugemine):** Joonis (`ls-kolm-spektrit`): kolm
   spektririba üksteise all – A on värviline algusest lõpuni, B-l on
   üksainus kitsas kollane riba, C-l on kolm eraldi ribat (sinine,
   roheline, punane). Küsimus: „Milline neist on kindlasti LIHTvalgus?"
   (a) A (b) **B** (c) C. Vihje: „lihtvalguse spektris on ainult üks
   kitsas riba."
4. **Iseseisev (arv):** Naatriumlamp kiirgab 589 nm juures. Mis värvi valgus
   see on ja mis vahemikku see riba kuulub? Vastus valikuna: (a) roheline,
   495–570 nm (b) **kollane, 570–590 nm** (c) oranž, 590–620 nm.
   Vihje: „vaata teooria spektririba skaalat – 589 jääb napilt 590-st
   allapoole."
5. **Ülekanne (valik, mitu õiget):** Millised väited on õiged?
   **valge valgus on liitvalgus**,
   **laseri punane valgus on lihtvalgus**,
   valge valgus on värvitu ja värvid tekivad alles prismas,
   **kui spektri värvid uuesti kokku viia, tuleb jälle valge valgus**,
   iga ere valgus on valge valgus.
   `shuffle: true`. Vale „värvid tekivad alles prismas" saab sildi
   `varvid-tekivad-prismas`; vale „iga ere valgus on valge" saab sildi
   `spekter-soltub-eredusest`.

### 6. exit – väljumispilet

1. Valge valgus on… (a) värvitu valgus, milles ühtki värvi ei ole
   (b) **liitvalgus – temas on korraga mitu värvi (päikesevalguses kõik
   vikerkaarevärvid)**
   (c) lihtvalgus, mille lainepikkus on 550 nm

   Sõnastus „mitu värvi, päikesevalguses kõik" on täpne meelega: kui
   vastuses seisaks „koosneb KÕIGIST vikerkaarevärvidest", oleks ta
   vastuolus sammuga explore-3, kus valge LED paistab valge, kuigi punane
   riba tal peaaegu puudub (CodeRabbiti leid samm 4.1u).
2. Arvuta: nähtava valguse ala on 380–760 nm. Kui lai see ala on?
   (380; tolerants 0; ühik `nm`; vihje: „lahuta suuremast väiksem")
3. „Kaks lampi paistavad mõlemad valged, aga ühe spektris on kõik värvid
   ja teise spektris on punane peaaegu puudu. Selgita, mille poolest need
   lambid erinevad ja kummast oleks poes riiete värvi vaadates rohkem
   kasu." (vabatekst, õpetajale nähtav – oodatav mõte: mõlemad paistavad
   valged, sest silma kolm andurit saavad oma osa kätte, aga aukudega
   spektriga lambi valguses ei saa punane ese punast valgust tagasi
   peegeldada; poes on kasu täieliku spektriga lambist)

## Väärarusaamad

| Silt | Väärarusaam | Kuidas moodul selle ümber lükkab |
|---|---|---|
| `valge-on-varvitu` | valge valgus on „ilma värvita" valgus | teooria definitsioon + explore-1: päikesevalguse spektris on kõik seitse riba korraga olemas |
| `varvid-tekivad-prismas` | värvid tekivad prismas või vikerkaares juurde, valguses neid enne ei olnud | teooria (17.10: lahutatud värvid uuesti kokku → jälle valge) ja practice-5; spektroskoop näitab värve ilma et miski neid „tegema" peaks |
| `koik-valgus-on-liitvalgus` | igas valguses on kõik värvid olemas, lihtvalgust ei ole | predict + explore-2 ja -4: laseril ja naatriumlambil on täpselt üks riba |
| `spekter-soltub-eredusest` | mida eredam valgus, seda rohkem värve; hämar valgus on „vähem valge" | explore: laser on kõige eredam, aga tal on üksainus riba; practice-5 |
| `valge-lamp-on-taielik` | kui lamp paistab valge, on tema valguses kõik värvid olemas | explore-3: valge LED paistab valge, aga punane riba on peaaegu puudu; exit-3 |
| `valgus-ja-varviaine-sama` | valgusi liidetakse samamoodi nagu guaššvärve | teooria tõmbab piiri ühe lausega; päriselt lükkab ümber moodul `esemete-varvus` |

## Õpetajale (teacher.ts)

- **(K) spekter oma silmaga, CD-plaadiga (kõige odavam variant):** hoidke
  vana CD või DVD plaati akna poole nii, et selle pinnalt peegelduks
  päikesevalgus (mitte otse Päike!) seinale või lakke – seinal on
  vikerkaareriba. Sama plaadiga saab vaadata klassi lambi ja telefoni
  taskulambi valgust: LED-i „vikerkaares" on selgelt näha, et punane ots
  on nõrk. Kui koolis on prisma, siis prismaga sama katse.
- **(K) Newtoni ketas – värvid tagasi kokku:** lõigake papist ketas,
  jagage seitsmeks sektoriks ja värvige vikerkaarevärvidega, torgake pliiats
  keskele ja keerutage. Ketas läheb hallikasvalgeks. Miks mitte päris
  puhtvalge: värvipliiatsi värvid ei ole spektri puhtad värvid ja osa
  valgust neeldub paberis – seda tasub klassile kohe öelda, muidu jääb
  katse „ebaõnnestunuks".
- **(K) tänavavalgusti vaatlus koduülesandena:** vaadake õhtul, mis värvi
  on teie tänava valgustid, ja proovige öelda, mis värvi on parkivad autod.
  Vanade naatriumlampide all on see peaaegu võimatu.
- **OHUTUS:** laserikiirt EI suunata kunagi silma ega peegeldavale pinnale,
  ka mitte „nõrka" osuti-laserit. Päikesesse ei vaadata palja silmaga ega
  läbi CD-plaadi – CD-ga vaadatakse alati peegelduvat või hajusat valgust,
  mitte allikat ennast.
- **Aruteluküsimused:** Kui laser oleks roheline, kus oleks tema riba
  spektris? Miks paistavad tähed eri värvi (kuum sinakas, jahedam punakas)
  – seos mooduliga `valgusallikad`, punkt „mida kuumem, seda sinakam"?
  Miks on fotograafil vaja teada, mis lambiga pilt tehti?
- **Millal see moodul tunnis:** PÄRAST moodulit `valgusallikad` (sealt tuleb
  liigitus suuruse järgi, siin tuleb liigitus spektri järgi) ja ENNE
  mooduleid `esemete-varvus` ja `valgusfiltrid`, sest mõlemad eeldavad, et
  õpilane teab, mis on spekter. Murdumist (plokk P2) see moodul EI eelda.
- **Tunniplaan (18 min):** 2 min hook + 3 min teooria · 2 min ennustus ·
  5 min simulatsioon · 4 min harjutamine · 2 min väljumispilet.

## Kordamiskaardid (5 tk)

| id | tüüp | küsimus | vastus |
|---|---|---|---|
| rc-1 | concept | Mis on valguse spekter? | Ülevaade sellest, millistest värvidest ehk lainepikkustest valgus koosneb |
| rc-2 | concept | Mis vahe on liht- ja liitvalgusel? Too mõlemast näide. | Lihtvalguses on ainult üks värv ehk spektris üksainus kitsas riba (laser, naatriumlamp), liitvalguses mitu ribat (päikesevalgus, hõõglamp) |
| rc-3 | calc | Mis värvi on 589 nm lainepikkusega valgus, kui kollane riba on 570–590 nm? | Kollane – 589 jääb napilt 590-st allapoole |
| rc-4 | selgitus | Miks öeldakse, et valge valgus ei ole värvitu? | Valges valguses on mitu värvi korraga – päikesevalguses kõik vikerkaarevärvid; kui need lahutada ja uuesti kokku panna, tuleb jälle valge |
| rc-5 | transfer | Kaks lampi paistavad ühtviisi valged. Kuidas saab teada, kumb neist annab täielikuma spektri? | Vaadata nende valgust CD-plaadi või prismaga: täieliku spektriga lambil on riba katkematu, LED-lambil on punane ots nõrk või puudu |
