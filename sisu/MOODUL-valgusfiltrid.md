# Mooduli spetsifikatsioon: Valgusfiltrid

Ainekava seos (AINEKAVA-fyysika-8.md): plokk P1; õpitulemus: P1-T3 (osa:
valgusfilter – valgus, mis läbib eseme; PEEGELDUNUD valguse poole tegid ära
moodulid `liitvalgus-ja-spekter` ja `esemete-varvus`); mõisted, mida õpetab:
– (valgusfilter on ainekavas õppesisus, mitte põhimõistete reas);
praktiline töö: **P1-PT2** (simulatsioonina ja päris katse juhendina).
Vanus: 8. klass. Kestused: demo 5 min, tund 20 min, iseseisev 15 min.
Tüüp: virtuaalne labor (üks õpieesmärk, 6 sammu).

slug: `valgusfiltrid` · id: `physics.valgusfiltrid`

## Ainekava seos (täpsemalt)

- **Plokk:** P1 Valgus ja valguse sirgjooneline levimine. Peegeldumine ja
  neeldumine
- **Õpitulemused:**
  - **P1-T3 osa** – „seostab peegeldunud valguse spektrit esemete
    värvusega". Filter on selle õpitulemuse KOLMAS tahk: siin ei vaadata,
    mis pinnalt tagasi tuleb, vaid mis esemest LÄBI läheb. Seos on sama
    seaduspära teistpidi: ese (filter) ei tee värvi juurde, ta ainult
    valib, mis edasi pääseb – ülejäänu neeldub temas ja soojendab teda.
- **Õppesisu punktid:** „valgusfilter"; toetub punktidele „liitvalgus ja
  spekter" ning „peegeldumine ja neeldumine"
- **Põhimõisted, mida moodul ÕPETAB:** – (ainekava põhimõistete loendis
  „valgusfiltrit" ei ole; ta on õppesisu real ja praktilise töö nimes, seega
  katvusraportis kajastub see moodul praktilise töö P1-PT2 kaudu; vt
  jaotuskava veerg „Õpetab mõisted": `–`)
- **Praktiline töö:** **P1-PT2** „värvilise valguse uurimine
  valgusfiltritega" – KATAB MÕLEMAD: simulatsioon on virtuaalne labor
  (samm 4) ja `teacher.ts` sisaldab päris katse juhendi vahendite, käigu ja
  hüpoteesiga
- **Teema olulisus → hook:** „igapäevased valgusnähtused looduses ja
  tehnikas" + „seos valgustehniku, fotograafi, ruumidisaini erialadega" –
  teatri- ja kontserdilava värviline valgus tehakse valgest prožektorist
  filtriga, mitte värvilise lambiga
- **Metoodilised soovitused, mida järgin:** ainekava nõuab otsesõnu, et
  „valgusfiltrite tööpõhimõte las õpilane ise avastab" – seepärast on
  teoorias öeldud ainult ÜKS filter („laseb läbi oma värvi, ülejäänu neelab")
  ja KAHE filtri koosmõju (ühisosa, järjekorrast sõltumatu) jääb õpilasele
  simulatsioonis avastada. Ainekava nimetab ka anaglüüfpilti punase ja
  sinise filtriga – see on siin ülekandeülesandes ja õpetajajuhendis, mitte
  mudelis (vt „Piirid").
- **Õpilase tegevused:** (D) uurib simulatsiooniga, mis läheb filtrist läbi
  ja mis jääb kinni, ning avastab, mis juhtub kahe filtriga; (K) päris katse
  värviliste kiledega valge valguse ja valge ekraaniga (P1-PT2);
  (K) anaglüüfpilt ehk 3D-prillid punase ja sinise klaasiga

## Piirid (mida see moodul EI tee)

- **Peegeldumine ja esemete värvus** – moodul `esemete-varvus`. Siin on kõik
  filtrid läbipaistvad ja ekraan on alati valge: küsimus on „mis läheb
  LÄBI", mitte „mis tuleb tagasi". Teooria ütleb selle seose ühe lausega
  välja („eelmises moodulis valis ese, mis tuleb tagasi – filter valib, mis
  läheb edasi"), aga ükski ülesanne ei nõua peegeldumise arvutamist.
- **Värvilise ESEME vaatamine läbi filtri** (punane joon punase klaasi all
  kaob ära) – see nõuaks korraga kaht tabelit, eseme peegeldust JA filtri
  läbilaskvust, ehk kahe mooduli mudelite liitmist. Mudelis seda ei ole:
  anaglüüf on ülekandeülesanne (practice-5), mida õpilane lahendab sõnadega
  kahe mooduli teadmise peale, ja õpetajajuhendi (K) katse. Kui see teema
  väärib hiljem oma moodulit (`anaglyyf-pilt`, rakendusmoodul), lisatakse ta
  jaotuskavva eraldi reana – seda otsust see spetsifikatsioon ei tee.
- **MIKS aine üht värvi neelab ja teist läbi laseb** (molekulide
  energiatasemed, värvaine keemia) – gümnaasium. Siin on läbilaskvus ANTUD
  omadus: nii see kile käitub.
- **Prisma ja valguse lahutamine** – moodul `liitvalguse-lahutamine`
  (plokk P2). Filter EI lahuta valgust osadeks, ta võtab osa ära. See vahe
  on teoorias ühe lausega kirjas, sest just siin läheb pool klassist segamini.
- **Heledus, valgustugevus, protsendid** – mudel loeb värvikanaleid, mitte
  energiat (vt allpool „Miks `blockedShare` on kanalite jagatis"). Ükski
  ülesanne ei küsi, mitu protsenti valgusest läbi läheb.
- **Polarisatsioonifilter ja päikeseprillid** – ei kuulu 8. klassi
  ainekavva. Õpetajajuhend mainib ühe lausega, et päikeseprillide klaas ei
  ole sama asi mis värvifilter, et ükski õpilane ei üldistaks valesti.

## Allikad

- **Teooria tugi:** `sisu/allikad/OPIK-F8-INDEKS.md` ptk 1.5 „Valgusfilter"
  (lk 16–18, sisaldab kokkuvõtet ja probleemülesandeid) – faktikontrolliks.
  `sisu/allikad/POHIVARA-F8-taielik.md` ptk 17 (liitvalgus ja spekter:
  valge valgus koosneb kõigist värvidest) ja ptk 18.1 (neeldumine ehk
  valguse levimine kehasse) – nende peal seisab lause „see, mis läbi ei
  läinud, neeldub filtris ja soojendab teda". Sõnasõnalist teksti ei
  kopeerita: kõik esemed, arvud ja ülesanded on selle mooduli omad
  (vt ALLIKAD.md).
- **Ülesannete näidised:** – (kõik ülesanded on siin esimest korda kokku
  pandud, valgused ja filtrid tulevad model.ts tabelitest)

## Füüsika (model.ts jaoks)

Mudel ei arvuta energiat ega lainepikkusi – ta hoiab **kaht tabelit**
(millistest värvikanalitest valgus koosneb ja millised kanalid filter läbi
laseb) ning vastab nende põhjal hulgatehetega. Kõik on puhtad funktsioonid
(reegel 1).

### Kolm värvikanalit (`CHANNELS`)

| id | label |
|---|---|
| `red` | punane |
| `green` | roheline |
| `blue` | sinine |

**Miks oma koopia, mitte import moodulist `esemete-varvus`.** Moodulid on
iseseisvad (MOODULILEPING) – üks moodul ei impordi kunagi teise model.ts-i,
muidu ei saa kumbagi eraldi muuta ega arhiveerida. Kolm kanalit on siin
sama valik samal põhjusel: silmas on kolme sorti värviandurid ja seitsme
spektriribaga mudel nõuaks igalt filtrilt seitsmekohalist läbilaskekõverat,
mille iga vastus oleks kokkulepe. Teooria ütleb lihtsustuse õpilasele välja
(ta on seda moodulist `esemete-varvus` juba korra kuulnud).

### Valgused (`LIGHTS`)

Iga valgus on `{ id, label, channels }`. `channels` ei tohi olla tühi –
pimedus ei ole tabelis, mudel viskab tühja kirje peale vea juba loomisel.

| id | label | kanalid |
|---|---|---|
| `white` | valge valgus | punane, roheline, sinine |
| `yellow` | kollane valgus | punane, roheline |
| `red` | punane valgus | punane |

Kolm valgust, mitte viis: valge on põhitööriist, kollane näitab, et filter
ei saa läbi lasta seda, mida talle ei antud (kollases valguses sinist ei
ole), ja punane annab kõige teravama juhtumi – punane valgus rohelise
filtri taga ei anna midagi.

### Filtrid (`FILTERS`)

Iga filter on `{ id, label, passes }` – millised kanalid ta läbi laseb.
`passes` ei tohi olla tühi (musta pappi mudelis ei ole – see ei ole filter,
vaid kate).

| id | label | laseb läbi |
|---|---|---|
| `red` | punane filter | punane |
| `green` | roheline filter | roheline |
| `blue` | sinine filter | sinine |
| `yellow` | kollane filter | punane, roheline |

Kollane filter on tabelis meelega: tema abil avastab õpilane, et „kollane +
sinine" ei anna rohelist ega helesinist, vaid pimeduse – kollane laseb läbi
punase ja rohelise, sinine ainult sinise, ühisosa on tühi.

### Funktsioonid

Filtreid antakse ette **loendina** (`filterIds`), sest simulatsioonis on
kaks pesa ja kumbki võib olla tühi. Tühi loend tähendab „filtrit ei ole".

- `transmittedChannels(lightId, filterIds)` → mis kanalid jõuavad ekraanile:
  valguse kanalid ∩ iga filtri `passes` (ühisosa üle kõigi filtrite), alati
  `CHANNELS` järjekorras. Tundmatu id viskab vea.
- `blockedChannels(lightId, filterIds)` → valguse kanalid, mis ekraanile EI
  jõua (valguse kanalid ∖ läbi läinud). Tähtis: kinni jääda saab ainult see,
  mis filtrini jõudis – punane filter ei „neela" kollasest valgusest sinist,
  sest sinist seal ei olnud.
- `perceivedColour(lightId, filterIds)` → mis värvi on ekraan. Vastus tuleb
  läbi läinud kanalite hulgast:

  | läbi läinud kanalid | vastus |
  |---|---|
  | – (tühi) | „pime" |
  | punane | „punane" |
  | roheline | „roheline" |
  | sinine | „sinine" |
  | punane + roheline | „kollane" |
  | punane + sinine | „lilla" |
  | roheline + sinine | „helesinine" |
  | kõik kolm | „valge" |

  Kaheksa juhtu ehk kõik võimalikud hulgad – tabelipõhine, mitte if-ahel, ja
  test käib kõik kaheksa läbi. Tühja vastus on siin **„pime"**, mitte
  „must", nagu moodulis `esemete-varvus`: ekraanile ei jõua valgust ja
  ekraan ei ole must ese, ta on lihtsalt valgustamata. Kaks moodulit
  kirjeldavad kaht eri olukorda ja peavadki eri sõna kasutama.
- `blockedShare(lightId, filterIds)` → kui suur osa filtrini jõudnud
  valgusest jääb kinni: `blockedChannels.length / light.channels.length`,
  arv 0…1. Mudel ei ümarda (vormindus on `display.ts` või UI asi).

**Miks `blockedShare` on kanalite JAGATIS, mitte energia.** Mudel loeb
kanaleid, mitte vatte: „valgest valgusest jääb punase filtri taha 2 kanalit
3-st" on 2/3 ≈ 0,67. See EI ole päris energiaosakaal (päris punane kile
neelab valgest valgusest tublisti üle 80 %, sest ka punases ribas ei lähe
kõik läbi) ja seepärast ei küsi ükski ülesanne „mitu protsenti valgusest" –
küsitakse „mitu värvi kolmest". Sama põhjendus on moodulis
`esemete-varvus`; kui seda vahet mitte hoida, õpetab moodul vaikselt vale
suurusjärku.

**Idealiseeringud, mis peavad olema mudeli kommentaaris kirjas** (ja mida UI
ega õpetajajuhend ei tohi päris füüsikana esitada):

1. **Filter laseb „oma" värvi läbi 100 %.** Päris kile neelab osa ka sellest
   värvist, mille ta läbi laseb – seepärast on filtri taga alati tuntavalt
   hämaram kui ilma filtrita. Mudelis heledust ei ole, ainult kanalid.
2. **Kaks ühesugust filtrit annavad täpselt sama tulemuse mis üks.**
   `transmittedChannels("white", ["red", "red"])` = `["red"]` – hulkade
   ühisosa on idempotentne. Päris katses on kaks punast kilet üksteise peal
   nähtavalt TUMEDAMAD. See on mudeli piir, mitte õpilase mõõteviga, ja
   õpetajajuhendis on ta eraldi hoiatusena kirjas.
3. **Filtri servad ja paksus ei loe** – filter on mudelis pelgalt
   kanalite hulk.
4. **Filtril on mudelis ainult kaks teed: läbi või kinni.** Päris kile
   pinnalt ka PEEGELDUB osa valgusest tagasi (just see annab kilele
   läike) – seepärast ei ole `blockedChannels` päris elus sama asi mis
   „neeldub ja soojendab". Mudelis on kogu kinni jäänud osa neeldunud.
   Teooria ütleb selle õpilasele välja („väike osa peegeldub ka tagasi")
   ja UI ega õpetajajuhend ei tohi öelda „kolmandat teed ei ole" – see
   lause kehtib ainult läbipaistmatu eseme kohta moodulis
   `esemete-varvus` (CodeRabbiti leid samm 4.1dd).

**Testiväärtused (teadaolevad):**

| Kutse | Tulemus |
|---|---|
| `transmittedChannels("white", [])` | punane, roheline, sinine |
| `transmittedChannels("white", ["red"])` | punane |
| `transmittedChannels("white", ["yellow"])` | punane, roheline |
| `transmittedChannels("white", ["yellow", "red"])` | punane |
| `transmittedChannels("white", ["yellow", "green"])` | roheline |
| `transmittedChannels("white", ["red", "blue"])` | – (tühi) |
| `transmittedChannels("white", ["blue", "red"])` | – (tühi) |
| `transmittedChannels("white", ["yellow", "blue"])` | – (tühi) |
| `transmittedChannels("yellow", ["red"])` | punane |
| `transmittedChannels("yellow", ["blue"])` | – (tühi) |
| `transmittedChannels("red", ["green"])` | – (tühi) |
| `transmittedChannels("red", ["red"])` | punane |
| `transmittedChannels("white", ["red", "red"])` | punane (idempotentne, vt idealiseering 2) |
| `blockedChannels("white", ["red"])` | roheline, sinine |
| `blockedChannels("white", [])` | – (tühi) |
| `blockedChannels("red", ["red"])` | – (tühi) |
| `blockedChannels("yellow", ["blue"])` | punane, roheline |
| `blockedShare("white", [])` | 0 |
| `blockedShare("white", ["red"])` | 2/3 |
| `blockedShare("white", ["yellow"])` | 1/3 |
| `blockedShare("white", ["red", "blue"])` | 1 |
| `blockedShare("red", ["green"])` | 1 |
| `perceivedColour("white", [])` | „valge" |
| `perceivedColour("white", ["red"])` | „punane" |
| `perceivedColour("white", ["yellow"])` | „kollane" |
| `perceivedColour("white", ["yellow", "blue"])` | „pime" |
| `perceivedColour("white", ["yellow", "green"])` | „roheline" |
| `perceivedColour("red", ["green"])` | „pime" |
| `perceivedColour("yellow", ["red"])` | „punane" |

Piirjuhud ja vigased sisendid:

- **Järjekord ei muuda tulemust:** iga kahe filtri paari kohta kehtib
  `transmittedChannels(l, [a, b])` = `transmittedChannels(l, [b, a])`. Test
  käib tsükliga läbi KÕIK filtripaarid kõigi valgustega – see on mooduli
  keskne avastus (explore-4) ja ta ei tohi jääda ühe näite peale.
- **Kinni jääda saab ainult see, mis filtrini jõudis:**
  `blockedChannels("red", ["red"])` on tühi, kuigi punane filter jätab
  valgest valgusest kaks kanalit kinni. Teistpidi:
  `blockedShare("red", ["green"])` on 1, mitte 1/3.
- **Filter ei lisa kunagi midagi:** iga valguse ja iga filtrikombinatsiooni
  puhul on `transmittedChannels` valguse kanalite ALAMHULK. Test käib
  tsükliga üle kõigi valguste ja kõigi ühe- ja kahefiltrikombinatsioonide –
  see on mooduli kõige olulisem „filter ei värvi valgust" tõestus.
- **Filtrite lisamine ainult vähendab:** kahe filtriga läbi läinud kanaleid
  ei ole kunagi rohkem kui ühega samast paarist.
- **Ühisosa järjekord ei sõltu sisendi järjekorrast:** tulemus on alati
  `CHANNELS` järjekorras (punane, roheline, sinine), muidu sõltuks
  `perceivedColour` tabeli võti juhusest.
- Vigased sisendid: `transmittedChannels("kuu", ["red"])`,
  `perceivedColour("white", ["lilla"])`, `blockedShare("", [])` → viskavad
  vea.
- **Andmete terviklus (test tabelite peal, mitte funktsioonidel):** iga
  valguse `channels` ja iga filtri `passes` ei ole tühi ega sisalda kordusi;
  kõik kanalite id-d on `CHANNELS`-is olemas. Muidu läheks mudel vaikselt
  katki siis, kui keegi lisab uue filtri trükiveaga.

## Sammud

### 1. hook – häälestus

Joonis (`figures.tsx`, silt `vf-lava-prozektor`): kontserdilava külgvaates.
Lae all prožektor, mille lambist tuleb VALGE valgus; prožektori ees on
sinine kile raamis; laval on sügavsinine valgusplekk ja muusik. Kile juures
väike termomeetri ikoon ja silt „kile on käega katsudes soe". Vasakul
väike kõrvalpilt: sama prožektor ilma kileta – lava on valge.

„Laval on sügavsinine valgus, aga prožektori sees põleb tavaline valge
lamp. Kust see sinine värv tuli – ja miks on kile ees palav?"

Eesmärk õpilase keeles: „Tean, mis juhtub valgusega filtris, ja oskan
ennustada, mis jõuab kahe filtri taha."

### 2. theory – üks filter (üks ekraan)

- **Valgusfilter on läbipaistev kile või klaas, mis laseb läbi ainult osa
  värvidest.** Punane filter laseb läbi punase; rohelise ja sinise ta neelab
  ehk võtab endasse. See, mis läbi ei läinud, jäi peaaegu tervenisti
  filtrisse kinni ja muutus seal soojuseks – **sellepärast on lava kile
  soe.** (Väike osa peegeldub ka kile pinnalt tagasi – seda läiget on
  näha, kui kilet valguse käes keerata –, aga see on nii väike, et meie
  arvestame ainult kaht teed: läbi või kinni.)
- **Filter ei tee värvi juurde.** Ta ainult VÕTAB ÄRA. Valgest valgusest
  saab punase filtriga punase valguse, sest valges valguses oli punane juba
  olemas. Kui talle langeb punane valgus ja ette panna roheline filter, ei
  tule välja rohelist – ei tule mitte midagi.
- **Seos eelmise mooduliga:** punane õun VALIS, mis tuleb tagasi; punane
  filter valib, mis läheb edasi. Sama seaduspära, kaks eri suunda.
- **Filter EI ole prisma.** Prisma lahutab valge valguse värvideks laiali
  (see tuleb 9. klassis); filter ei lahuta midagi, ta lihtsalt ei lase osa
  värve läbi ja need kaovad soojusena ära.
- Vikerkaares on värve palju, aga **silmas on kolme sorti värviandurid:
  punase, rohelise ja sinise jaoks** – sellepärast saab meie mudel kolme
  värviga hakkama (sama lihtsustus, mis moodulis `esemete-varvus`).
- Joonis (`vf-uks-filter`): vasakul valge lamp, sellest kolm noolt (punane,
  roheline, sinine) filtri poole; punane filter; punane nool läheb läbi ja
  jõuab valgele ekraanile, roheline ja sinine lõpevad filtri sees punktiga,
  nende kõrval silt „neeldub → filter soojeneb". Ekraan on punane.

Kahest filtrist teooria EI räägi – see on ainekava soovituse järgi õpilase
enda avastada (samm 4).

### 3. predict – hüpotees (lukustub!)

„Valge valgus läbib kõigepealt KOLLASE filtri ja kohe seejärel SINISE
filtri. Mis paistab valgele ekraanile?"

(a) roheline – kollane ja sinine annavad ju rohelise
(b) helesinine – kaks värvi segunevad
(c) **ei midagi – ekraan jääb pimedaks**

+ „Miks sa nii arvad?" (vabatekst).

Õige on (c). Kollane filter laseb läbi punase ja rohelise, sinist ta ei
lase. Sinine filter laseb läbi ainult sinise – aga sinist enam ei ole,
sest esimene filter võttis selle ära. Läbi ei jõua kumbagi. Vastust EI
avaldata enne sammu 4.

Vale (a) saab sildi `filtrid-segavad-varve` (see on värvipurgi loogika:
kollane + sinine = roheline kehtib värviAINETE, mitte kahe järjestikuse
filtri kohta – kile ei sega, vaid võtab ära), vale (b) sildi
`filter-lisab-varvi`.

### 4. explore – virtuaalne labor (P1-PT2)

SVG külgvaates: vasakul lamp valitud valgusega, keskel kaks filtripesa
üksteise järel (pesa 1 ja pesa 2, kumbki võib olla tühi), paremal valge
ekraan. Lambi ja pesa 1 vahel on kanalinooled (ainult need, mis valitud
valguses olemas on), pesade vahel need, mis esimesest läbi said, ja pesa 2
järel need, mis ekraanile jõuavad. Filtris kinni jäänud nool lõpeb filtri
sees punktiga ja tema kõrval on silt „neeldub". Ekraan on värvitud
`perceivedColour` järgi; kui vastus on „pime", on ekraan tumehall ja tema
peal on sõna „PIME".

**Iga noole juures on kanali NIMI sõnaga** („punane", „roheline", „sinine")
ja kinni jäänud noolel lisaks „→ neeldub"; ekraani juures on nii värvilaik
kui ka värvi NIMI sõnaga. Värv ei tohi olla ainus info kandja
(DISAINIJUHIS) – ülesanne 1 palub nooli lugeda ja just punase ja rohelise
noole eristamine on see, mis värvipimedal õpilasel ebaõnnestub. Kui sildid
ei mahu 360 px laiusele ekraanile noole kõrvale, lähevad nad noole alla
loendiks („jääb kinni: roheline, sinine") – mitte ära.

Paremal kaks kastikest:

- „Ekraanile jõuab: punane + roheline" (või „ei midagi")
- „Ekraan paistab: KOLLANE" (värvilaik + sõna `perceivedColour` järgi)

All riba: „kinni jääb 2 värvi 3-st" (`blockedShare` lugeja ja nimetaja).

Juhtnupud (kaks muudetavat suurust korraga, moodulilepingu järgi – kõik on
valikud, liugurit ei ole, sest ükski suurus ei ole pidev):

- **valik: filter pesas 1** – tühi / punane / roheline / sinine / kollane
  (algväärtus tühi)
- **valik: filter pesas 2** – tühi / punane / roheline / sinine / kollane
  (algväärtus tühi)
- **valik: lambi valgus** – valge / kollane / punane (algväärtus valge);
  AVANEB alles pärast ülesannet 3 (silt `valguse-valik`). Enne seda on lamp
  valge ja labor uurib ainult filtreid – nii jääb korraga muutuma kaks asja,
  mitte kolm.

Tolerantsid ja ühikud: kõik arvulised vastused on täisarvud (värvide arv),
ühikuta, tolerants **0**. Ühtegi mõõdetavat suurust simulatsioonis ei ole,
seega lugemistolerantsi ei ole vaja – sama teadlik valik nagu moodulis
`esemete-varvus`.

Ülesanded:

1. „Pane pessa 1 punane filter ja jäta pesa 2 tühjaks. Mitu värvi kolmest
   jääb filtrisse kinni?" (2; tolerants 0; ühikuta; vihje 1: „loe nooli, mis
   filtri sees ära lõpevad"; vihje 2: „läbi läheb ainult punane – ülejäänud
   kaks jäävad kinni")
2. „Vaheta pesas 1 punane filter kollase vastu. Mis värvi on ekraan?"
   (valik) (a) valge (b) **kollane** (c) punane.
   Selgitus pärast vastamist: kollane filter laseb läbi punase JA rohelise –
   kui need kaks jõuavad korraga ekraanile, näeb silm kollast.
3. „Jäta kollane filter pessa 1 ja pane pessa 2 sinine filter. Mis on
   ekraanil?" (valik) (a) roheline (b) helesinine (c) **ei midagi – ekraan
   on pime**.
   See on ennustuse (samm 3) kontroll: selgitus pärast vastamist ütleb
   otse välja, kas hüpotees pidas, ja miks. Pärast seda ülesannet avaneb
   lambi valik.
4. „Vaheta filtrid pesades ära: pessa 1 sinine, pessa 2 kollane. Mis
   muutub?" (valik) (a) nüüd tuleb ekraanile sinine (b) **ei muutu midagi –
   ekraan on ikka pime** (c) nüüd tuleb ekraanile kollane.
   Selgitus: järjekord ei loe. Läbi pääseb ainult see värv, mille MÕLEMAD
   filtrid läbi lasevad – ja sellist värvi siin ei ole.
5. „Sea lambiks PUNANE valgus ja pane pessa 1 roheline filter (pesa 2
   tühjaks). Mis värvi on ekraan?" (valik) (a) roheline (b) **pime**
   (c) punane. Vihje: „kas rohelisel filtril on üldse midagi läbi lasta?"

### 5. practice – harjutamine

1. **Näidis (lahendatud):** Valge valgus läbib rohelise filtri. Valges
   valguses on kolm värvi: punane, roheline, sinine. Roheline filter laseb
   läbi ainult **rohelise**; punase ja sinise ta **neelab** ja need muutuvad
   filtris soojuseks. Ekraanile jõuab ainult roheline valgus, seega ekraan
   paistab roheline. Filter ei teinud rohelist juurde – see oli valges
   valguses juba olemas.
2. **Osaline (täida lünk):** Valges valguses on 3 värvi. Kollane filter
   laseb neist läbi 2. Mitu värvi jääb filtrisse kinni? 3 − 2 = ___
   (vastus 1; tolerants 0; ühikuta; vihje: „see, mis läbi ei läinud, jäi
   kinni")
3. **Iseseisev (joonise lugemine):** Joonis (`vf-kaks-pesa`): valge lamp,
   pesa 1 kollane filter, pesa 2 roheline filter, ekraan. Küsimus: „Mis
   värvi on ekraan?" (a) kollane (b) **roheline** (c) pime.
   Vihje: „läbi pääseb ainult see, mida lasevad läbi MÕLEMAD filtrid."
4. **Iseseisev (ennustus):** Kollases valguses on punane ja roheline, sinist
   ei ole. Kollase valguse ette pannakse sinine filter. Mis on ekraanil?
   (a) sinine (b) kollane (c) **ei midagi – ekraan on pime**. Vihje: „kas
   filtrini jõuab üldse seda värvi, mida ta läbi lasta oskab?"
5. **Ülekanne (valik, mitu õiget):** 3D-prillidel on üks klaas punane ja
   teine sinine. Paberil on sama pilt joonistatud kaks korda: üks kord
   punase, teine kord sinise pliiatsiga. Millised väited on õiged?
   **punase klaasi läbi jõuab silma ainult punane valgus**,
   **punase klaasi läbi vaadates kaob punane joonis valge paberi taustal
   peaaegu ära**,
   **punase klaasi läbi paistab sinine joonis tumeda joonena**,
   punane klaas muudab sinise joonise punaseks,
   iga silm näeb mõlemat joonist ühtemoodi.
   `shuffle: true`. Vale „muudab siniseks" saab sildi `filter-lisab-varvi`,
   vale „mõlemad silmad näevad ühtemoodi" sildi `filter-ei-vota-midagi`.
   Selgitus pärast vastamist: punase klaasi taga peegeldab valge paber
   punast ja punane joon peegeldab samuti punast – kaks ühesugust punast ei
   erista teineteisest, joon kaob. Sinine joon punast ei peegelda, seega
   temalt ei tule punase klaasi läbi midagi ja ta paistab tumedana. Nii näeb
   kumbki silm ERI pilti ja ajus tekib ruumiline mulje.

### 6. exit – väljumispilet

1. Mis juhtub värvidega, mida filter läbi ei lase? (a) nad põrkavad kõik
   lambi juurde tagasi (b) **nad neelduvad peaaegu tervenisti filtris ja
   muutuvad seal soojuseks – sellepärast filter soojeneb** (c) nad muutuvad
   filtri enda värviks
2. Valges valguses on kolm värvi (punane, roheline, sinine). Valgus läbib
   sinise filtri. Mitu värvi jääb filtrisse kinni? (2; tolerants 0;
   ühikuta; vihje: „üks läheb läbi, ülejäänud jäävad kinni")
3. „Sõber tahab teha koduse diskovalguse ja ütleb: „Panen taskulambi ette
   kõigepealt punase ja siis sinise kile – tuleb ilus lilla valgus." Mis
   tegelikult juhtub ja mida sa tal teha soovitad?" (vabatekst, õpetajale
   nähtav – oodatav mõte: valgust ei tule üldse, sest punane kile võtab
   sinise ära ja sinine kile võtab punase ära; lillat saaks siis, kui
   kasutada ÜHT lillat filtrit või kaht taskulampi eri kiledega kõrvuti,
   mitte kaht kilet üksteise peal)

## Väärarusaamad

| Silt | Väärarusaam | Kuidas moodul selle ümber lükkab |
|---|---|---|
| `filter-lisab-varvi` | filter värvib valguse ära, nagu värv värvib seina – ta lisab midagi juurde | teooria („filter ainult võtab ära") + explore-5: punane valgus rohelise filtriga ei anna rohelist, vaid pimeduse; mudeli test „läbi läinud on alati valguse alamhulk" |
| `filtrid-segavad-varve` | kaks järjestikust filtrit segavad värve nagu guašš (kollane + sinine = roheline) | predict + explore-3: kollane ja sinine filter koos annavad pimeduse, sest läbi pääseb ainult ühisosa |
| `filtrite-jarjekord-loeb` | tulemus sõltub sellest, kumb filter on ees | explore-4 + mudeli test kõigi filtripaaride peal: ühisosa on järjekorrast sõltumatu |
| `filter-ei-vota-midagi` | filtri taga on sama palju valgust, ainult teist värvi | hook (soe kile) + teooria neeldumine + `blockedShare` riba simulatsioonis |
| `filter-teeb-valgust` | filter suudab teha värvi, mida talle langevas valguses ei ole | explore-5 ja practice-4: punane valgus rohelise filtriga ja kollane valgus sinise filtriga → pime |
| `filter-lahutab-nagu-prisma` | filter lahutab valge valguse värvideks, nagu prisma | teooria üks lause: prisma lahutab laiali, filter võtab ära ja ülejäänu kaob soojusena |

## Õpetajale (teacher.ts)

- **(K) P1-PT2 päris katse – vahendid:** värvilised läbipaistvad kiled
  (punane, roheline, sinine, kollane – sobivad kaustakaante kiled,
  tsellofaan või teatrikile näidised; ka värviline klaaspaber), tugev valge
  taskulamp või telefoni taskulamp, valge paber või sein ekraaniks,
  maalriteip kilede kinnitamiseks, pime või pimendatud tuba.
- **(K) käik (hüpoteesiga, nagu ainekava nõuab):** 1) iga rühm kirjutab enne
  katset hüpoteesi: mis tuleb ekraanile, kui valge valgus läbib kollase ja
  siis sinise kile; 2) valgusta valget paberit taskulambiga ja pane ette üks
  kile korraga – kirjuta üles, mis värvi paber paistab; 3) pane kaks kilet
  üksteise peale (kollane + sinine, punane + sinine, kollane + roheline) ja
  kirjuta iga paari tulemus üles; 4) vaheta kilede järjekord ära ja vaata,
  kas tulemus muutub; 5) võrdle hüpoteesiga ja sõnasta järeldus: läbi pääseb
  ainult see värv, mida lasevad läbi mõlemad kiled.
- **Miks päris katse erineb simulatsioonist – ütle see klassile ETTE:**
  1) päris kile neelab osa ka „omast" värvist, seega iga kile lisab hämarust
  ja kahe kile taga on tuntavalt tumedam kui ühe taga (simulatsioonis
  heledust ei ole); 2) päris kile ei ole puhas: punane kile laseb tavaliselt
  natuke ka oranži ja kollast läbi, seega „pime" on klassis pigem väga tume
  punakas kui täiesti must; 3) kaks ühesugust punast kilet üksteise peal
  annavad simulatsioonis täpselt sama tulemuse mis üks, päris elus aga
  nähtavalt tumedama – mudel loeb värve, mitte heledust. Kui see vahe ette
  öelda, ei jää õpilane uskuma, et katse ebaõnnestus.
- **(K) anaglüüf ehk 3D-prillid (ainekava soovitus):** joonista valgele
  paberile sama lihtne kujund kaks korda – üks kord punase, teine kord
  sinise viltpliiatsiga, veidi nihkes. Vaata läbi punase klaasi (või punase
  kile): punane joonis kaob valge paberi taustal peaaegu ära, sinine paistab
  tumedana. Sinise klaasiga on vastupidi. Seleta, et 3D-pildis on kummalegi
  silmale mõeldud pilt joonistatud eri värviga ja prillid annavad igale
  silmale ainult tema oma pildi. Vana punase-sinise 3D-pildi leiab
  internetist, kui prille käepärast ei ole – siis piisab kiledest.
- **OHUTUS:** taskulambiga ei valgustata kellelegi silma. Päikest ei vaadata
  ka läbi värvilise kile – **kile EI kaitse silma**, ta võtab ära ainult osa
  nähtavast valgust, mitte ohtlikku kiirgust. Sama põhjusel ei vaadata läbi
  kile ka päikesevarjutust. Päikeseprillide klaas ei ole värvifilter selle
  sõna mõttes ja teda ei kasutata katses.
- **Aruteluküsimused:** Miks on fotograafi stuudios prožektori ees kile,
  mitte värviline lamp? Miks on pimikus punane valgus? Miks paistab
  kollane päästevest tänavavalgustuse all määrdunud oranž? Kui panna
  päikeseprillid taskulambi ette, kas tuleb värviline valgus – ja miks mitte?
- **Millal see moodul tunnis:** PÄRAST mooduleid `liitvalgus-ja-spekter`
  (valges valguses on mitu värvi korraga) ja `esemete-varvus` (peegeldumine
  ja neeldumine) – filter on „sama lugu, aga läbi eseme" ja ülekandeülesanne
  (anaglüüf) eeldab mõlemat.
- **Simulatsioon ENNE päris katset:** simulatsioonis on tulemus puhas
  (pime on päriselt pime), päris kiledega jääb alati veidi valgust läbi.
  Õpilane ennustab simulatsiooniga, kiledega kontrollib.
- **Tunniplaan (20 min):** 2 min hook + 3 min teooria · 2 min hüpotees ·
  6 min simulatsioon (labor) · 4 min harjutamine · 3 min väljumispilet.
  45-minutilises tunnis järgneb sellele päris katse kiledega.

## Kordamiskaardid (5 tk)

| id | tüüp | küsimus | vastus |
|---|---|---|---|
| rc-1 | concept | Mida teeb valgusfilter talle langeva valgusega? | Laseb läbi ainult osa värvidest, ülejäänud neelab – need muutuvad filtris soojuseks. Juurde ta midagi ei tee |
| rc-2 | selgitus | Miks paistab valge lamp punase filtri taga punane? | Valges valguses on kõik kolm värvi; punane filter laseb läbi punase ja neelab rohelise ja sinise, seega edasi jõuab ainult punane |
| rc-3 | calc | Valges valguses on 3 värvi. Kollane filter laseb läbi 2. Mitu jääb kinni? | 1 (3 − 2); see värv neeldub filtris ja soojendab teda |
| rc-4 | concept | Mis jõuab ekraanile, kui valge valgus läbib kollase ja siis sinise filtri? | Mitte midagi – ekraan on pime. Läbi pääseb ainult see värv, mida lasevad läbi mõlemad filtrid, ja ühist värvi neil ei ole. Järjekord ei muuda tulemust |
| rc-5 | transfer | Miks kaob punase kile läbi vaadates punase pliiatsiga joonistatud pilt valgelt paberilt ära? | Punase kile taga jõuab silma ainult punane valgus; nii valge paber kui ka punane joon saadavad punast tagasi, seega neid ei saa eristada. Sinine joon punast ei peegelda ja paistab tumedana – nii töötavad 3D-prillid |
