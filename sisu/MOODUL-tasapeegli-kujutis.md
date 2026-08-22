# Mooduli spetsifikatsioon: Tasapeegli kujutis

Ainekava seos (AINEKAVA-fyysika-8.md): plokk P1; õpitulemused: P1-T2 (osa:
tasapeeglis tekkiv näiline kujutis – asukoht, suurus, joonis); mõisted, mida
õpetab: näiline kujutis (ainekava põhimõiste `tasapeegel` on juba kaetud
moodulis `peegeldumisseadus`); praktiline töö: P1-PT4 (simulatsioon + päris
katse juhend õpetajale).
Vanus: 8. klass. Kestused: demo 6 min, tund 20 min, iseseisev 15 min.
Tüüp: virtuaalne labor (üks õpieesmärk, 6 sammu).

slug: `tasapeegli-kujutis` · id: `physics.tasapeegli-kujutis`

## Ainekava seos (täpsemalt)

- **Plokk:** P1 Valgus ja valguse sirgjooneline levimine. Peegeldumine ja
  neeldumine
- **Õpitulemused:** P1-T2 **osa** – „tunneb valguse sirgjoonelise levimise ja
  peegeldumise seadust, konstrueerib nende põhjal jooniseid ja korraldab
  katsed". Siin on ainult peegeldumisseaduse TAGAJÄRG tasapeeglil: kus on
  kujutis, kui suur ta on ja kui suurt peeglit on vaja. Seadus ise (α = β,
  ristsirge, langemisnurk) on moodulis `peegeldumisseadus` ja seda siin uuesti
  ei õpetata – seda kasutatakse.
- **Õppesisu punktid:** peegeldumine ja neeldumine; **tasapeegel** (kujutise
  osa; peegli mõiste ja seadus tulevad moodulist `peegeldumisseadus`)
- **Põhimõisted, mida moodul ÕPETAB:** näiline kujutis. NB! See EI OLE
  ainekava põhimõistete loendis (loendis on `tasapeegel`, mille katab
  `peegeldumisseadus`), seega katvusraport ei loe seda mõistet – manifestis on
  ta sellepärast, et `manifestSchema` nõuab vähemalt üht mõistet ja see on
  aus vastus küsimusele „mida see moodul päriselt defineerib". Sama lahendus
  nagu moodulis `varjutused`.
- **Praktiline töö:** **P1-PT4** tasapeeglis tekkiva kujutise uurimine –
  MÕLEMAL kujul: simulatsioon sammus 4 (hüpotees → mõõtmine → järeldus) ja
  päris katse juhend õpetajale (teacher.ts, teibitükkidega seinapeeglil)
- **Teema olulisus → hook:** „igapäevased valgusnähtused tehnikas" – riidepoe
  peegel: miks ei aita tagurpidi astumine, kui tahad end täies pikkuses näha
- **Metoodilised soovitused, mida järgin:** ainekava nõuab tasapeegli kujutise
  uurimist **hüpoteesiga** (D+K: hüpotees → katse → järeldus) – ennustus
  lukustub enne simulatsiooni; peegeldumine „mitte ainult teoreetiliselt, vaid
  läbi jooniste eri olukordades" – kujutis konstrueeritakse kiirte ja nende
  pikendustega, mitte reeglina pähe
- **Õpilase tegevused:** (D+K) tasapeegli kujutise uurimine hüpoteesiga –
  (D) simulatsioon siin, (K) päris katse seinapeegli ja teibiga teacher.ts-is;
  (D) loeb ja konstrueerib näilise kujutise joonist

## Piirid (mida see moodul EI tee)

- **peegeldumisseadus ise** (α = β, ristsirge, mattpind) – moodul
  `peegeldumisseadus`, mis käib kursuses SEE mooduli ees
- **vasak-parem „pööramine"** ja peeglikiri – rakendusmoodul `peeglikiri`.
  Siin ainult mainitakse teoorias, et kujutis on päripidine (pea ei ole
  allpool), ja ühtki küsimust selle kohta ei ole
- **kumer- ja nõguspeegel, fookus** – omaette moodulid
- **kahe peegli vaheline kiirte käik, periskoop** – moodulid `nurkpeegel` ja
  `helkur`

## Allikad

- **Teooria tugi:** `sisu/allikad/POHIVARA-F8-taielik.md` ptk 18 (18.5:
  tasapeeglis tekib näiline, päripidine, esemega ühesuurune kujutis, mis asub
  peegli taga sellest niisama kaugel kui ese; mõiste „näiline kujutis" =
  kujutis, mida paistab asuvat silma jõudvate kiirte PIKENDUSTE lõikepunktis;
  joon. 49 ja 51) – kasutatud faktikontrolliks, tekst on oma sõnadega
- **Ülesannete näidised:** – (kõik arvud on selle mooduli omad; „pool
  pikkusest" tulemus on üldtuntud kooliülesanne, siin oma sõnastuse ja oma
  arvudega)

## Füüsika (model.ts jaoks)

Kogu moodul tuleb kahest asjast, mida õpilane juba teab: **valgus levib
sirgjooneliselt** ja **β = α**. Nende tagajärg on kolm lauset:

1. Kujutis on peegli taga **sama kaugel**, kui ese on peegli ees.
2. Kujutis on esemega **ühesuurune** (ja päripidine).
3. Kujutis on **näiline** – peegli taga ei ole midagi, mida saaks ekraanile
   püüda; silma jõudvate kiirte PIKENDUSED lõikuvad seal.

Neist kolmest järeldub mooduli kõige üllatavam tulemus: **täies pikkuses
enda nägemiseks piisab peeglist, mis on pool sinu pikkusest – ja kaugus ei
muuda seda üldse. Tingimusel, et peegel ripub õigel kõrgusel: ülaserv peab
olema täpselt pealae ja silmade keskel.** Vale kõrgusel peeglis ei paista
täispikkus ka siis, kui peegel ise on küllalt suur – see on ainus tingimus,
aga see EI ole valikuline. Sim hoiab peegli alati õigel kõrgusel (samm 4),
õpetajajuhend hoiatab, et päris elus see nii ei ole.

Tuletus (see läheb ka teooriasammu joonisele): silma jõuab pealae kiir
peegli punktist, mis on täpselt pealae ja silma keskel (kõrgus
`(silm + pikkus)/2` – siit tulebki nõue ülaservale), ja jalgade kiir peegli
punktist, mis on täpselt silma ja põranda keskel (kõrgus `silm/2`). Nende
vahe on `pikkus/2` – kaugus taandub välja, sest MÕLEMAD kiired kalduvad
kaugenedes täpselt sama palju.

Tähised (kõik meetrites):

- `objectDistance` (`d`) – ese/inimene → peegel
- `objectHeight`, `personHeight` (`H`) – eseme/inimese kõrgus
- `eyeHeight` (`e`) – silmade kõrgus põrandast, `0 < e ≤ H`
- `mirrorHeight` (`M`) – peegli enda kõrgus

Funktsioonid:

- `imageDistance(d) = d` – kujutise kaugus peegli TAGA. Jah, see on
  samasusfunktsioon; ta on olemas selleks, et seadus oleks koodis kirjas ja
  testiga valvatud (ja et Simulation.tsx ei „teaks" füüsikat ise).
- `objectImageSeparation(d) = 2·d` – vahemaa esemest kujutiseni. Just see arv
  seletab, miks peeglis paistab kujutis kaugem, kui õpilane ootab.
- `imageHeight(objectHeight) = objectHeight` – kujutis on ühesuurune.
  Samamoodi valvefunktsioon: väärarusaam „kaugemal läheb kujutis väiksemaks"
  on tabelis ja peab ka koodis vale olema.
- `minMirrorHeight(H) = H / 2` – vähim peegel, milles näed end täies
  pikkuses. **Ei sõltu kaugusest.**
- `visibleBodyHeight(M, H) = min(2·M, H)` – kui suur osa sinust peeglist
  paistab. Piiramine `H`-ga on oluline: kahemeetrine peegel ei näita
  „3,2 m inimest".
- `visibleBottomHeight(M, H) = max(0, H − 2·M)` – kui kõrgelt maast algab see
  osa, mis peeglis paistab (0 = jalad on ka näha). Simulation.tsx joonistab
  selle järgi „paistab / ei paista" tsooni.
- `mirrorTopEdgeHeight(e, H) = (e + H)/2` – peegli ÜLASERVA kõrgus, kui peegel
  ripub õigel kohal. Sim hoiab peegli alati õigel kõrgusel (vt „Sammud",
  samm 4), seega piisab ühest liugurist peegli KÕRGUSE jaoks ja seina peal
  liigutamise liugurit ei ole.
- `mirrorBottomEdgeHeight(e, H, M) = max(0, mirrorTopEdgeHeight(e, H) − M)` –
  alaserv. Kui `M = H/2`, tuleb siit täpselt `e/2` (eraldi test).
- Definitsioonipiirkond: `d > 0`, `H > 0`, `M > 0`, `0 < e ≤ H`. Muu sisend
  viskab vea – funktsioon ei paranda sisendit vaikselt.
- Sim on IDEAALNE: väärtused tulevad mudelist täpselt, mõõtmismüra ei ole.
  Päris mõõtmise hajuvus kuulub päris katsesse (teacher.ts).

**Testiväärtused (teadaolevad):**

| Juht | d | H | e | M | kujutis peegli taga | ese↔kujutis | paistab |
|---|---|---|---|---|---|---|---|
| lähedal | 0,5 m | 1,6 m | 1,5 m | 0,4 m | 0,5 m | 1,0 m | 0,8 m |
| kaugel | 2,5 m | 1,6 m | 1,5 m | 0,4 m | 2,5 m | 5,0 m | **0,8 m** |
| täpselt pool | 1,0 m | 1,6 m | 1,5 m | 0,8 m | 1,0 m | 2,0 m | 1,6 m |
| liiga suur peegel | 1,0 m | 1,6 m | 1,5 m | 1,2 m | 1,0 m | 2,0 m | **1,6 m** |
| pisike peegel | 1,0 m | 1,7 m | 1,6 m | 0,15 m | 1,0 m | 2,0 m | 0,3 m |

Piirjuhtude mõte lahti kirjutatult:

- **lähedal vs kaugel:** ainus erinevus on `d`; „paistab" on mõlemal 0,8 m.
  See ongi mooduli põhitõde ja seda valvab eraldi test („kaugus ei muuda").
- **täpselt pool:** `minMirrorHeight(1.6) = 0,8` ja `visibleBodyHeight(0.8,
  1.6) = 1,6` – peegel näitab täpselt kogu inimese, mitte grammi rohkem.
  Sama juhtumi juures kontrollib test ka servi: ülaserv 1,55 m, alaserv
  0,75 m = `e/2`.
- **liiga suur peegel:** `2·1,2 = 2,4`, aga inimene on 1,6 – piiramine annab
  1,6 ja `visibleBottomHeight` annab 0.
- **pisike peegel:** paistab 0,3 m, alaserva järgi algab nähtav osa 1,4 m
  kõrguselt – peeglist paistab ainult pea.

Vigased sisendid: `d = 0`, `d = −1`, `H = 0`, `M = 0`, `e = 0`, `e > H`
(silmad pealaest kõrgemal) → viga.

## Sammud

### 1. hook – häälestus

Joonis (`figures.tsx`, silt `tp-poe-peegel`): riidepoe proovinurk, seinal
väike peegel. Kaks kaadrit kõrvuti: vasakul seisab inimene peegli lähedal,
paremal on ta astunud kaks sammu tagasi. Mõlemas kaadris on peeglis näha
TÄPSELT sama osa temast (pea ja ülakeha) – jalad ei paista kummaski.

„Uute pükste proovimisel astud peeglist kaugemale, et jalad ka ära näha.
Miks see ei aita?"

Eesmärk õpilase keeles: „Tean, kus ja kui suur on kujutis tasapeeglis, ja
oskan välja arvutada, kui suurt peeglit on vaja."

### 2. theory – näiline kujutis (üks ekraan)

- **Kus kujutis on:** peegli taga, täpselt sama kaugel, kui sina oled peegli
  ees. Astud sammu lähemale – kujutis astub sammu lähemale ka, seega teie
  vahe väheneb KAKS sammu.
- **Kui suur ta on:** täpselt sinuga ühesuurune ja päripidine. Kaugemalt
  paistab ta väiksem täpselt samamoodi, nagu päris inimene kaugemalt väiksem
  paistab – aga ta EI LÄHE väiksemaks.
- **Näiline kujutis:** peegli taga ei ole midagi. Silma jõuavad peeglilt
  peegeldunud kiired ja aju pikendab neid sirgelt tahapoole; seal, kus
  pikendused lõikuvad, paistabki kujutis olevat. Seepärast ei saa seda
  kujutist paberile ega ekraanile kinni püüda.
- Joonis (`tp-nailine-kujutis`): vasakul ese (küünal), keskel peegel, paremal
  katkendjoonega kujutis. Kaks kiirt küünla otsast peeglile ja sealt silma
  (mõlemal langemis- ja peegeldumisnurk märgitud, α = β – seos eelmise
  mooduliga), kiirte katkendlikud pikendused lõikuvad kujutise otsas.
  Kaugused peeglist on märgitud võrdusmärkidega.

### 3. predict – hüpotees (lukustub!)

„Seisad 1 m kaugusel väikesest seinapeeglist ja näed peeglis end vöökohast
ülespoole. Nüüd astud 2 m kaugusele. Kui suur osa sinust nüüd peeglis
paistab?"

(a) rohkem – näen end põlvedeni (b) **täpselt sama palju – vöökohast
ülespoole** (c) vähem – näen ainult pead
+ „Miks sa nii arvad?" (vabatekst).

Õige on (b). Vastust EI avaldata enne sammu 4.

Nii (a) kui ka (c) saavad sildi `kaugus-muudab-vaadet`: mõlema juur on sama –
usutakse, et kaugus muudab seda, kui suur osa endast peeglis paistab – ja
lahendus on neil sama (explore-3 ja explore-4). Õpetajajuhend kirjeldab
mõlemat varianti ühe kirje all.

### 4. explore – virtuaalne labor (P1-PT4)

SVG külgvaates: vasakul inimene (lihtne kujund, silmad märgitud), paremal
sein ja selle peal peegel; peeglist paremal katkendjoonega kujutis. Kaks
kiirt – pealaest ja jalgadest peeglile ja sealt silma – ning nende
katkendlikud pikendused kujutise pealaeni ja jalgadeni. Inimese kõrval on
mõõdulint, millel on ERI VÄRVI ja ERI MUSTRIGA see osa, mis peeglist paistab
(värv ei kanna infot üksi: nähtava osa kõrval on ka silt „paistab" ja
piirjoon).

**Peegel ripub alati õigel kõrgusel** (ülaserv `mirrorTopEdgeHeight`
järgi) – seina peal liigutamise liugurit ei ole. Nii jääb muutuma ainult
see, mida parajasti uuritakse (moodulileping: alguses maksimaalselt kaks
muudetavat suurust), ja peegli VALE riputamine ei saa katset segada. Sellest
tuleb ka mooduli lubadus „nähtav osa algab alati pealaest ja lõpeb altpoolt".
Õpetajajuhendis on eraldi hoiatus, et päris elus see nii ei ole.

Liugurid:

- **kaugus peeglist** (`d`) 0,5–3 m, samm 0,1 m; algväärtus 1 m
- **peegli kõrgus** (`M`) 0,1–1 m, samm 0,05 m; algväärtus 0,4 m
- **inimese pikkus** (`H`) 1,2–1,9 m, samm 0,05 m – AVANEB alles pärast
  ülesannet 4 (silt `inimese-pikkus`); algväärtus 1,6 m. Silmade kõrgus
  arvutatakse pikkusest: `e = H − 0,1 m` (Simulation.tsx konstant, mitte
  liugur – üks liugur vähem ja tulemus `H/2` ei sõltu sellest niikuinii).

Suurelt kuvatakse **kui suur osa sinust paistab** (meetrites), selle all sama
suurelt **kujutise kaugus peeglist**. Kui peeglist paistab kogu inimene, on
suure arvu kõrval lisaks tekst „kogu inimene" – ainult arv 1,6 ei ütle
õpilasele, et lagi on käes.

Tolerantsid ja ühikud: kaugused `m`, tolerants **absoluutne ±0,1 m**
(liuguri samm on 0,1 m, protsent ei jätaks mänguruumi – sama põhjendus, mis
moodulites `valguse-sirgjooneline-levimine` ja `vari-ja-poolvari`); kõrgused
`m`, tolerants **absoluutne ±0,05 m** (liuguri samm on 0,05 m ja 5% 0,8
meetrist oleks 0,04 m ehk vähem kui üks samm).

Ülesanded:

1. „Sea end 1 m kaugusele peeglist. Kui kaugel peegli TAGA on sinu kujutis?"
   (1 m; ±0,1 m; ühik `m`)
2. „Astu 2,5 m kaugusele. Kui pikk on nüüd kogu tee sinust kujutiseni?"
   (5 m; ±0,1 m; ühik `m`; vihje 1: „kujutis on peegli taga sama kaugel, kui
   sina oled ees"; vihje 2: „2,5 m sinust peeglini + 2,5 m peeglist
   kujutiseni")
3. „Tule tagasi 1 m kaugusele ja jäta peegel 0,4 m kõrguseks. Kui suur osa
   sinust peeglis paistab?" (0,8 m; ±0,05 m; ühik `m`)
4. „Jäta peegel 0,4 m kõrguseks ja astu 3 m kaugusele. Mis juhtub sellega,
   kui suur osa sinust paistab?" (valik) (a) paistab rohkem
   (b) **paistab täpselt sama palju – 0,8 m** (c) paistab vähem
5. „Sea oma pikkuseks 1,8 m. Kui kõrge peab peegel VÄHEMALT olema, et näeksid
   end täies pikkuses?" (0,9 m; ±0,05 m; ühik `m`; vihje: „proovi liuguriga
   ja vaata, millal kaob kiri „kogu inimene"")

### 5. practice – harjutamine

1. **Näidis (lahendatud):** Seisad 0,6 m kaugusel peeglist. Kujutis on peegli
   taga 0,6 m, seega on sinu ja kujutise vahe 0,6 + 0,6 = 1,2 m. Kui astud
   0,2 m lähemale, väheneb vahe 0,4 m võrra – kaks korda rohkem, kui sina
   liikusid.
2. **Osaline:** Mari on 1,5 m pikk. Kui kõrge peab olema peegel, milles ta end
   täies pikkuses näeb? Täida: 1,5 / ___ = ___ m
   (vastus 0,75 m; ±0,05 m; ühik `m`; vihje 1: „pealae kiir tabab peeglit
   pealae ja silma keskel, jalgade kiir silma ja põranda keskel"; vihje 2:
   „nende kahe koha vahe on täpselt pool pikkusest")
3. **Iseseisev (valik):** Miks ei näe sa end kaugemale astudes peeglis
   rohkem? (a) **kaugemal kalduvad pealae ja jalgade kiired mõlemad täpselt
   sama palju, seega jääb peeglil nende vahe samaks** (b) sest peegel on
   selleks liiga väike (c) sest kujutis liigub sinuga koos peeglist eemale
4. **Iseseisev (arv):** Peegel on 0,3 m kõrge ja ripub õigel kohal. Kui suur
   osa 1,7 m pikast inimesest sellest paistab? (0,6 m; ±0,05 m; ühik `m`;
   vihje: „peeglist paistab kaks korda rohkem, kui peegel ise kõrge on")
5. **Ülekanne (valik, mitu õiget):** Millised väited tasapeegli kujutise
   kohta on õiged? **kujutis on esemega ühesuurune**, **kujutis on peegli
   taga sama kaugel, kui ese on peegli ees**, kujutis tekib peegli pinnale,
   **kujutist ei saa valgele paberile kinni püüda**, kujutis on pea alaspidi.
   `shuffle: true`. Vale variant „kujutis tekib peegli pinnale" saab sildi
   `kujutis-peegli-pinnal`, „pea alaspidi" sildi `kujutis-tagurpidi`.

### 6. exit – väljumispilet

1. Sõna „näiline" tähendab kujutise puhul, et… (a) kujutis on udune ja
   ebaselge (b) **peegli taga ei ole tegelikult midagi – kujutis paistab
   olevat seal, kus silma jõudvate kiirte pikendused lõikuvad** (c) kujutis
   on esemest väiksem
2. Arvuta: seisad 1,2 m kaugusel tasapeeglist. Kui suur on vahemaa sinu ja su
   kujutise vahel? (2,4 m; ±0,1 m; ühik `m`)
3. „Poes on seinal 1 m kõrgune peegel. Sinu sõber, kes on 1,7 m pikk, ütleb,
   et ta peab kaugemale astuma, et end täies pikkuses näha. Mida sa talle
   vastad?" (vabatekst, õpetajale nähtav – oodatav mõte: 1,7 m inimesele
   piisab 0,85 m peeglist, seega 1 m peegel on juba küllalt suur; kaugusest
   see ei sõltu, tähtis on hoopis, et peegel ripuks õigel kõrgusel)

## Väärarusaamad

| Silt | Väärarusaam | Kuidas moodul selle ümber lükkab |
|---|---|---|
| `kaugus-muudab-vaadet` | kaugemale astudes näen peeglis endast rohkem (või vähem) | predict + explore-3/4: 1 m ja 3 m juures on nähtav osa täpselt sama 0,8 m |
| `taispikk-peegel` | täies pikkuses nägemiseks on vaja enda pikkust peeglit | explore-5 + practice-2: piisab poolest, sest kiired kalduvad mõlemast otsast |
| `kujutis-peegli-pinnal` | kujutis on peegli pinnal, nagu pilt paberil | teooria + joonis: kiirte pikendused lõikuvad peegli TAGA, sama kaugel kui ese ees |
| `kujutis-on-asi` | kujutis on päris asi peegli taga, selle saaks ekraanile püüda | teooria + exit-1: näiline = kiired seal päriselt ei käi, püüda ei saa |
| `kujutis-vaheneb-kaugusega` | kaugemale astudes läheb kujutis väiksemaks | teooria + `imageHeight`: kujutis on alati ühesuurune, ta lihtsalt paistab kaugemalt väiksem – nagu iga asi |
| `kujutis-tagurpidi` | peeglis on kujutis pea alaspidi (nagu veepeegelduses) | teooria: kujutis on päripidine; practice-5 vale variandina |

## Õpetajale (teacher.ts)

- **(K) P1-PT4 päris katse – vahendid:** seinapeegel või suur (vähemalt
  40 cm) käsipeegel, mis saab seina najale kindlalt toetada; maalriteip
  (kleepub nõrgalt ja tuleb peeglilt jäljetult ära – tavalist pakketeipi
  ega kleeplinti EI kasutata, need jätavad liimi); mõõdulint; paarilise abi.
- **(K) käik (hüpoteesiga, nagu ainekava nõuab):** 1) kirjuta hüpotees – kui
  kõrge peegel on sulle täies pikkuses nägemiseks vaja; 2) seisa peegli ette
  1 m kaugusele, paariline kleebib peeglile teibitüki sinna, kus sa NÄED oma
  pealage, ja teise sinna, kus näed oma jalataldu (või kui peegel on väike,
  siis kõige alumist nähtavat kohta); 3) mõõda teipide vahe ja võrdle oma
  pikkusega – kas tuleb pool? 4) **astu 2 m kaugusele ja vaata uuesti:
  pealagi ja jalad paistavad ikka samade teipide juures** – see on katse
  kõige tähtsam hetk; 5) mõõda kujutise kaugus: pane väike ese peegli ette
  ja liiguta teist eset peegli kõrval nii kaua, kuni see paistab kujutisega
  ühel kaugusel; 6) võrdle hüpoteesiga.
- **Ohutus:** käsipeegli servad teibiga üle; peeglit ei kanta lahtiselt ega
  panda põrandale, kuhu peale astutakse; pragunenud peegliga katset ei tehta.
- **Simulatsioon ENNE päris katset** – õpilane ennustab, mis kaugemale
  astudes juhtub, ja kontrollib seda siis teibiga päris peeglil.
- **Kus sim ja päris elu lahku lähevad:** simulatsioonis ripub peegel ALATI
  õigel kõrgusel, seega paistab alati pealagi. Päris elus ripub peegel seal,
  kuhu keegi ta pani – seepärast on paljudes kohtades peeglist jalad näha,
  aga pealagi mitte. Reegel „pool pikkusest piisab" kehtib ainult siis, kui
  peegli ülaserv on pealae ja silmade keskel. Laske klassil arvutada, kui
  kõrgele tuleks nende oma peegel riputada.
- **Aruteluküsimused:** Miks on tantsusaali ja riidepoe peeglid ikkagi
  põrandast laeni, kui pool piisaks? (siis näeb ka kõrvalseisjaid ja see
  töötab igal pikkusel inimesel, ka siis, kui liigud kõrvale.) Miks paistab
  peeglist rohkem tuba, kui kaugemale astud, kuigi endast paistab sama palju?
  Miks kirjutatakse kiirabiautole kiri peegelpidi? (juhatab mooduli
  `peeglikiri` juurde.) Kui kujutis on peegli taga 2 m kaugusel, kuhu peab
  fotoaparaat teravustama, et kujutis oleks terav?
- **Tunniplaan (20 min):** 2 min hook + teooria · 3 min hüpotees ·
  7 min simulatsioon (labor) · 5 min harjutamine · 3 min väljumispilet.
  45-minutilises tunnis eelneb sellele `peegeldumisseadus` ja järgneb päris
  katse teibiga.

## Kordamiskaardid (7 tk)

| id | tüüp | küsimus | vastus |
|---|---|---|---|
| rc-1 | concept | Kus asub tasapeeglis tekkiv kujutis ja kui suur ta on? | Peegli taga täpselt sama kaugel, kui ese on peegli ees; esemega ühesuurune ja päripidine |
| rc-2 | concept | Mida tähendab, et tasapeegli kujutis on NÄILINE? | Peegli taga ei ole midagi – kujutis paistab olevat seal, kus silma jõudvate kiirte pikendused lõikuvad; ekraanile teda püüda ei saa |
| rc-3 | calc | Seisad 1,5 m kaugusel peeglist. Kui suur on vahemaa sinu ja su kujutise vahel? | 1,5 + 1,5 = 3 m |
| rc-4 | calc | Kui kõrge peegel on vaja 1,8 m pikale inimesele, et ta end täies pikkuses näeks? | 1,8 / 2 = 0,9 m |
| rc-5 | selgitus | Miks ei aita kaugemale astumine, kui tahad peeglis rohkem endast näha? | Kaugenedes kalduvad pealae ja jalgade kiired täpselt sama palju, seega jääb nende tabamiskohtade vahe peeglil samaks – nähtav osa on alati kaks korda peegli kõrgus |
| rc-6 | graph | Kui joonistaksid graafiku „sinu kaugus peeglist" (x) vs „vahemaa sinu ja kujutise vahel" (y), mis kuju see saab? | Sirge läbi nullpunkti tõusuga 2 – vahemaa on kaugusega võrdeline (vahemaa = 2 · kaugus) |
| rc-7 | transfer | Miks on riietepoodides alati suur, täispikkuses peegel, kuigi klient seisab sellest tavaliselt eemal? | Vajaliku peegli kõrgus (pool inimese pikkusest) ei sõltu kaugusest – kaugemale astumine ei tee vajalikku peeglit väiksemaks |

**exit-2 sai arvuvariandid** (moodulileping „Juhuslikkus"): neli kaugust
liugurite vahemikust `SLIDERS.objectDistanceM` (1,2/0,8/2,0/1,5 m), sama
valem (vahemaa = 2 · kaugus). Uusi õpilasvastuseid sellel küsimusel veel ei
ole, seega versioon tõuseb ainult skeemimuutuse pärast (moodulileping
„Versioneerimine").
