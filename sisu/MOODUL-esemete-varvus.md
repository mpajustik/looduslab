# Mooduli spetsifikatsioon: Esemete värvus

Ainekava seos (AINEKAVA-fyysika-8.md): plokk P1; õpitulemus: P1-T3 (osa:
peegeldumine, neeldumine ja esemete värvus – SPEKTRI poole tegi ära moodul
`liitvalgus-ja-spekter`, valgusfiltri pool jääb moodulile `valgusfiltrid`);
mõisted, mida õpetab: valguse neeldumine; praktiline töö: –.
Vanus: 8. klass. Kestused: demo 5 min, tund 18 min, iseseisev 14 min.
Tüüp: mikromoodul (üks õpieesmärk, 6 sammu).

slug: `esemete-varvus` · id: `physics.esemete-varvus`

## Ainekava seos (täpsemalt)

- **Plokk:** P1 Valgus ja valguse sirgjooneline levimine. Peegeldumine ja
  neeldumine
- **Õpitulemused:**
  - **P1-T3 osa** – „seostab peegeldunud valguse spektrit esemete
    värvusega". Siin on selle õpitulemuse SÜDA: ese ei tee värvi ise, vaid
    peegeldab tagasi osa temale langevast valgusest ja neelab ülejäänu.
    Eeldus (mis on spekter, mis on liitvalgus) tuli moodulist
    `liitvalgus-ja-spekter`.
- **Õppesisu punktid:** „peegeldumine ja neeldumine"; „mustad, valged ja
  värvilised esemed"
- **Põhimõisted, mida moodul ÕPETAB:** valguse neeldumine (ainekava
  põhimõistete loendis seda nimeliselt EI OLE – ainekava nimetab neeldumist
  õppesisus, mitte mõistete reas –, seega tuleb katvusraportisse märkusena;
  vt jaotuskava veerg „Õpetab mõisted": `–`)
- **Praktiline töö:** – (P1-PT2 „värvilise valguse uurimine
  valgusfiltritega" on mooduli `valgusfiltrid` oma)
- **Teema olulisus → hook:** „igapäevased valgusnähtused looduses ja
  tehnikas" + seos ruumidisaini ja rõivastuse valikuga – must särk päikese
  käes; miks poes valitud värv näeb kodus teistsugune välja
- **Metoodilised soovitused, mida järgin:** ainekava täpsustus nõuab, et
  värvuste TAJUMINE oleks eraldi vaatenurk kõrvuti sellega, miks ese ise
  mingit värvi paistab, ja et tajumist uuritaks simulatsiooniga. Seepärast
  on simulatsioonis kaks kastikest: mis valgus esemelt TAGASI tuleb ja mida
  SILM sellest näeb. Teine metoodiline rõhk – Päikese ja Maa energiabilanss
  – jääb moodulile `valgusallikad`; siin on neeldumise soojusmõju ainult
  ühe eseme mõõtkavas (must särk).
- **Õpilase tegevused:** (D) uurib simulatsiooniga, mis värvi paistab ese
  eri värvi valgustuses, ja selgitab, kuidas silm värve näeb; (K) katse
  värvilise taskulambi või telefoniekraani valgusega pimedas klassis;
  (K) must ja valge paber päikese käes – kumb soojeneb

## Piirid (mida see moodul EI tee)

- **Valgusfilter** (valgus, mis läbib eseme) – moodul `valgusfiltrid` koos
  praktilise tööga P1-PT2. Siin on kõik esemed läbipaistmatud: valgus kas
  peegeldub tagasi või neeldub, kolmandat teed ei ole. See piir on ka
  teoorias ühe lausega välja öeldud.
- **MIKS aine üht värvi neelab ja teist ei neela** (aatomite ja molekulide
  energiatasemed) – see on gümnaasiumi keemia ja füüsika. Siin on
  neeldumine ANTUD omadus: nii see aine käitub.
- **Peegeldumisseadus, langemis- ja peegeldumisnurk** – moodul
  `peegeldumisseadus`. Siin ei ole ühtegi nurka ega kiirte konstruktsiooni:
  vaadeldakse ainult seda, MIS värvid tagasi tulevad, mitte KUHU.
- **Peegel vs mattpind** – samuti moodul `peegeldumisseadus` (mõiste
  `mattpind` on tema oma). Siin on kõik pinnad matid ehk hajutavad, sest
  ainult nii on esemel „oma värv" igast vaatenurgast sama.
- **Värviaine ja värvide segamine maalikunstis** – jääb üheks lauseks
  teoorias (miks kollane + sinine annab purgis rohelise): siin lükatakse
  ümber ainult see väärarusaam, et VALGUSTE liitmine käib samamoodi. Oma
  moodulit see teema 8. klassis ei saa.
- **Silma ehitus** (võrkkest, kolvikesed ja kepikesed) – nimetatakse
  faktina „silmas on kolme sorti värviandurid", aga ei küsita. Silma kui
  optilise süsteemi käsitleb `silm-ja-nagemine` (plokk P2).

## Allikad

- **Teooria tugi:** `sisu/allikad/POHIVARA-F8-taielik.md` ptk 18 (punkt
  18.1: valguse langemisel keha pinnale toimub kaks nähtust – peegeldumine
  ja valguse levimine kehasse ehk neeldumine; definitsioon „peegeldumine on
  valgusenergia tagasipöördumine pinnalt esialgsesse levimiskeskkonda") ja
  ptk 17 punkt 17.10 (lahutatud värvid uuesti kokku → jälle valge – seda
  kasutab teooria „valge peegeldab kõik tagasi" juures).
  `sisu/allikad/OPIK-F8-INDEKS.md` ptk 1.10 „Esemete nägemine. Värviline
  pind" (lk 34–37) – faktikontrolliks. Tekst on oma sõnadega, kõik esemed,
  arvud ja ülesanded on selle mooduli omad (vt ALLIKAD.md).
- **Ülesannete näidised:** – (kõik ülesanded on siin esimest korda kokku
  pandud, esemed ja valgused tulevad model.ts tabelitest)

## Füüsika (model.ts jaoks)

Mudel ei arvuta energiat ega lainepikkusi – ta hoiab **kaht tabelit**
(millistest värvikanalitest valgus koosneb ja millised kanalid ese tagasi
peegeldab) ning vastab nende põhjal küsimustele hulgatehetega. Kõik on
puhtad funktsioonid (reegel 1).

### Kolm värvikanalit (`CHANNELS`)

| id | label |
|---|---|
| `red` | punane |
| `green` | roheline |
| `blue` | sinine |

**Miks kolm kanalit, mitte eelmise mooduli seitse spektririba.** Moodulis
`liitvalgus-ja-spekter` on spekter riba, mille lahutus on nanomeeter – seal
oli küsimus „mis värv on 589 nm". Siin on küsimus hoopis „mis tuleb tagasi",
ja sellele vastab kolme kanali mudel täpselt nii hästi, kui 8. klassis vaja,
sest ka silmas on kolme sorti värviandurid. Seitsme ribaga mudel nõuaks
igalt esemelt seitsme arvuga peegeldusspektrit ja iga vastus („mis värvi see
paistab") oleks kokkulepe – õpilase jaoks tekiks täpsuse vale mulje. Kaks
moodulit on seepärast meelega KAKS eri mudelit ja kumbki ei impordi teist
(moodulid on iseseisvad, vt MOODULILEPING).

Teooria ütleb selle lihtsustuse õpilasele välja: „vikerkaares on värve
palju rohkem, aga silm mõõdab neid kolme anduriga – sellepärast saab ka
meie mudel kolmega hakkama."

### Valgused (`LIGHTS`)

Iga valgus on `{ id, label, channels }`. Valgus, milles ei ole ühtegi
kanalit, on pimedus – teda ei ole tabelis ja `channels` ei tohi olla tühi
(mudel viskab sellise kirje peale vea juba loomisel).

| id | label | kanalid |
|---|---|---|
| `white` | valge valgus | punane, roheline, sinine |
| `red` | punane valgus | punane |
| `green` | roheline valgus | roheline |
| `blue` | sinine valgus | sinine |
| `yellow` | kollane valgus | punane, roheline |

Kollane valgus on tabelis meelega: tema abil saab explore-sammus näidata,
et kollane sidrun paistab kollane ka siis, kui sinist valgust üldse ei ole
– „ese peegeldab seda, mida ta saab".

### Esemed (`OBJECTS`)

Iga ese on `{ id, label, reflects }` – millised kanalid see pind tagasi
peegeldab. Kõik pinnad on matid ja läbipaistmatud.

| id | label | peegeldab |
|---|---|---|
| `paper` | valge paber | punane, roheline, sinine |
| `shirt` | must särk | – (mitte ühtegi) |
| `apple` | punane õun | punane |
| `leaf` | roheline leht | roheline |
| `mug` | sinine kruus | sinine |
| `lemon` | kollane sidrun | punane, roheline |

Must ese on ainus, mille `reflects` on tühi – ja see ongi mustuse
definitsioon selle mudeli keeles. Tühja loendi keeld kehtib ainult
valgustele, mitte esemetele.

### Funktsioonid

- `reflectedChannels(lightId, objectId)` → kanalite ühisosa (valguse
  kanalid ∩ eseme peegeldatavad kanalid), alati `CHANNELS` järjekorras.
  Tundmatu id viskab vea.
- `absorbedChannels(lightId, objectId)` → valguse kanalid, mis EI peegeldu
  (valguse kanalid ∖ eseme kanalid). Tähtis: neelduda saab ainult see, mis
  esemele langes – sinine kruus ei „neela" punases valguses rohelist, sest
  rohelist seal ei olnud.
- `perceivedColour(lightId, objectId)` → mis värvi ese paistab. Vastus
  tuleb peegeldunud kanalite hulgast:

  | peegeldunud kanalid | vastus |
  |---|---|
  | – (tühi) | „must" |
  | punane | „punane" |
  | roheline | „roheline" |
  | sinine | „sinine" |
  | punane + roheline | „kollane" |
  | punane + sinine | „lilla" |
  | roheline + sinine | „helesinine" |
  | kõik kolm | „valge" |

  Kaheksa juhtu ehk kõik võimalikud hulgad – tabelipõhine, mitte if-ahel,
  ja test käib kõik kaheksa läbi. Kolm viimast segavärvi ei tule selle
  mooduli ülesannetes ette (ükski ese ei peegelda punast+sinist), aga
  funktsioon peab vastama õigesti ka siis, kui keegi lisab uue eseme.
- `absorbedShare(lightId, objectId)` → kui suur osa langenud valgusest
  neeldub: `absorbedChannels.length / light.channels.length`, arv 0…1.
  Ühtegi ümardamist mudel ei tee (vormindus on `display.ts` või UI asi).
- `warmsUp(lightId, objectId)` → `absorbedShare > 0.5`. See on JÄME
  lihtsustus („kumb soojeneb rohkem" asemel „kas soojeneb tuntavalt") ja
  see peab olema mudeli kommentaaris kirjas: päris soojenemine sõltub ka
  valguse võimsusest, eseme massist ja tuulest.

**Miks `absorbedShare` on kanalite JAGATIS, mitte energia.** Mudel loeb
kanaleid, mitte vatte: „valgest valgusest neeldub 2 kanalit 3-st" on
2/3 ≈ 0,67. See EI ole päris energiaosakaal (päris punane õun neelab
valgest valgusest umbes 90 %, sest ka punases ribas ei peegeldu kõik) ja
seepärast ei küsi ükski ülesanne „mitu protsenti energiast" – küsitakse
„mitu kolmest värvist neeldub". Kui seda vahet mitte hoida, õpetab moodul
vaikselt vale suurusjärku.

**Testiväärtused (teadaolevad):**

| Kutse | Tulemus |
|---|---|
| `perceivedColour("white", "paper")` | „valge" |
| `perceivedColour("white", "shirt")` | „must" |
| `perceivedColour("white", "apple")` | „punane" |
| `perceivedColour("white", "lemon")` | „kollane" |
| `perceivedColour("red", "apple")` | „punane" |
| `perceivedColour("green", "apple")` | „must" |
| `perceivedColour("red", "paper")` | „punane" |
| `perceivedColour("blue", "leaf")` | „must" |
| `perceivedColour("yellow", "lemon")` | „kollane" |
| `perceivedColour("yellow", "mug")` | „must" |
| `perceivedColour("red", "shirt")` | „must" |
| `reflectedChannels("white", "lemon")` | punane, roheline (selles järjekorras) |
| `reflectedChannels("blue", "lemon")` | – (tühi) |
| `absorbedChannels("white", "apple")` | roheline, sinine |
| `absorbedChannels("red", "mug")` | punane |
| `absorbedChannels("red", "apple")` | – (tühi) |
| `absorbedShare("white", "shirt")` | 1 |
| `absorbedShare("white", "paper")` | 0 |
| `absorbedShare("white", "apple")` | 2/3 |
| `absorbedShare("yellow", "lemon")` | 0 |
| `absorbedShare("red", "leaf")` | 1 |
| `warmsUp("white", "shirt")` | `true` |
| `warmsUp("white", "paper")` | `false` |
| `warmsUp("white", "apple")` | `true` (2/3 > 0,5) |

Piirjuhud ja vigased sisendid:

- **Neelduda saab ainult langenu:** `absorbedChannels("red", "apple")` on
  tühi, kuigi õun neelab valges valguses kaks kanalit. Sama loogika teistpidi:
  `absorbedShare("red", "leaf")` on 1, mitte 1/3 – punases valguses neeldub
  rohelisel lehel KOGU temale langenud valgus ja leht paistab must.
- **Must ese neelab alati kõik:** `absorbedShare(<mis tahes valgus>,
  "shirt")` = 1. Test käib kõik viis valgust läbi tsükliga.
- **Valge paber ei neela selles mudelis kunagi midagi:**
  `absorbedShare(<mis tahes valgus>, "paper")` = 0, ja `perceivedColour`
  annab alati valguse enda värvi. Ka seda katab tsükkel üle kõigi valguste –
  see on mudeli kõige olulisem „ese ei tee värvi ise" tõestus.
  **NB! 0 on idealiseering, mitte päris füüsika:** päris valge paber või
  valge särk neelab siiski umbes kümnendiku talle langevast valgusest ja
  soojeneb päikese käes veidi (hooki joonisel 34 °C). Mudel loeb kanaleid
  („kas seda värvi tuleb tagasi"), mitte energiat, ja kanali kaupa ON valge
  paberi vastus „tuleb tagasi" kõigi kolme puhul. See lihtsustus peab olema
  mudeli kommentaaris kirjas ja UI ei tohi kunagi öelda „ei neela midagi",
  vaid „peaaegu ei neela" (CodeRabbiti leid samm 4.1z).
- **Ühisosa järjekord ei sõltu sisendi järjekorrast:** tulemus on alati
  `CHANNELS` järjekorras (punane, roheline, sinine), muidu sõltuks
  `perceivedColour` tabeli võti juhusest.
- Vigased sisendid: `perceivedColour("kuu", "apple")`,
  `reflectedChannels("white", "kass")`, `absorbedShare("", "paper")` →
  viskavad vea.
- **Andmete terviklus (test tabelite peal, mitte funktsioonidel):** iga
  valguse `channels` ei ole tühi ja ei sisalda kordusi; iga eseme
  `reflects` ei sisalda kordusi; kõik kanalite id-d on `CHANNELS`-is
  olemas. Muidu läheks mudel vaikselt katki siis, kui keegi lisab uue eseme
  trükiveaga.

## Sammud

### 1. hook – häälestus

Joonis (`figures.tsx`, silt `ev-must-ja-valge-sark`): kaks last päikese
käes kõrvuti, üks musta, teine valge särgiga. Musta särgi kohal punane
termomeeter ja number 48 °C, valge särgi kohal sinine termomeeter ja 34 °C.
Ülal Päike, mille kiired jõuavad mõlemani ühtemoodi (sama palju nooli).
All silt: „üks mõõtmine suvisel päikesepaistelisel päeval – mõõdetud särgi
pinnalt, sama päike, sama aeg".

Arvud 48 ja 34 on ÜHE mõõtmise näide, mitte konstandid: päris vahe sõltub
päikesest, tuulest ja riide materjalist. Sildita jäädes hakkaks joonis
lubama, et musta särgi pind ongi 48 °C – ja klassikatse, kus tuleb 39 °C,
paistaks õpilasele „ebaõnnestunud" (CodeRabbiti leid samm 4.1z). Suund –
must on soojem – on seevastu alati sama, ja seda küsitaksegi.

„Mõlemale särgile langeb täpselt sama palju päikesevalgust, aga must särk on
14 kraadi kuumem. Kuhu see valgus valge särgi pealt kadus?"

Eesmärk õpilase keeles: „Oskan selgitada, miks ese on mingit värvi, ja
ennustada, mis värvi ta paistab teistsuguses valguses."

### 2. theory – peegeldumine ja neeldumine (üks ekraan)

- Kui valgus langeb läbipaistmatule esemele, juhtub kaks asja: osa valgusest
  **peegeldub tagasi**, osa **neeldub** ehk läheb esemesse ja muutub seal
  soojuseks. Kolmandat teed ei ole – see, mis ei peegeldunud, on neeldunud.
  (Läbipaistvast esemest võib valgus ka läbi minna – see on juba
  valgusfiltri teema.)
- **Me näeme eset selle valguse järgi, mis temalt tagasi tuleb.** Ese ise
  valgust ei tee – ta on ainult see, kes valib, mida tagasi saata.
- **Valge ese** peegeldab tagasi kõik värvid (natuke neelab temagi),
  **must ese** ei peegelda peaaegu midagi ja neelab peaaegu kõik –
  sellepärast must särk soojeneb.
  **Värviline ese** peegeldab tagasi „oma" värvi ja neelab teised: punane
  õun peegeldab punase ja neelab rohelise ja sinise.
- Vikerkaares on värve palju, aga **silmas on kolme sorti värviandurid:
  punase, rohelise ja sinise jaoks**. Sellepärast saab meie mudel kolme
  värviga hakkama. Kui tagasi tuleb korraga punane ja roheline, näeb silm
  kollast; kui kõik kolm, siis valget; kui mitte midagi, siis musta.
- **Ese saab peegeldada ainult seda, mis talle langeb.** Punane õun rohelise
  valguse all paistab must – peegeldada oleks tal punast, aga punast valgust
  seal ei ole. Sellepärast ei tasu riiete värvi valida poe valguses.
- Joonis (`ev-punane-oun`): punane õun, sellele langeb kolm noolt (punane,
  roheline, sinine); punane nool põrkab tagasi silma poole, roheline ja
  sinine kaovad õuna sisse ja nende kõrval on silt „neeldub → soojus".

### 3. predict – ennustus (lukustub!)

„Paneme pimedasse tuppa punase õuna ja valgustame teda ROHELISE lambiga.
Mis värvi õun paistab?"

(a) punane – ta on ju punane õun
(b) roheline – ta peegeldab lambi valgust
(c) **must – ta ei saa peegeldada värvi, mida talle ei langenudki**

+ „Miks sa nii arvad?" (vabatekst).

Õige on (c). Õun oskab tagasi saata ainult punast, aga punast valgust
rohelises lambis ei ole – rohelise ta neelab ära, tagasi ei tule midagi.
Vastust EI avaldata enne sammu 4.

Vale (a) saab sildi `varv-on-esemes`, vale (b) sildi
`ese-peegeldab-koike-mis-langeb`.

### 4. explore – simulatsioon (pime tuba lambiga)

SVG: pime tuba, ülal vasakul lamp valitud värvi valgusvihuga, keskel valitud
ese, paremal silm. Lambi ja eseme vahel kolm noolt (punane, roheline,
sinine) – ainult need, mis valitud valguses olemas on. Eseme ja silma vahel
peegeldunud nooled (`reflectedChannels`), eseme sees kaduvad neeldunud
nooled (`absorbedChannels`) sildiga „neeldub". Ese ise on joonistatud
värviga, mille annab `perceivedColour`.

**Iga noole juures on kanali NIMI sõnaga** („punane", „roheline", „sinine")
ja neeldunud noolel lisaks „→ neeldub". Värv ei tohi olla ainus info kandja
(DISAINIJUHIS) – ja siin oleks ta seda kõige valusamas kohas: ülesanne 1
palub lugeda, mitu noolt eseme sisse kaob, ning punase ja rohelise noole
eristamine on just see, mis värvipimedal õpilasel ebaõnnestub. Kui sildid
ei mahu 360 px laiusele ekraanile noole kõrvale, lähevad nad noole alla
loendiks („neeldub: roheline, sinine") – mitte ära (CodeRabbiti leid
samm 4.1z).

Paremal kaks kastikest:

- „Tagasi tuleb: punane + roheline" (või „ei midagi")
- „Silm näeb: KOLLANE" (värvilaik + sõna `perceivedColour` järgi)

All riba: „neeldub 2 kanalit 3-st" + termomeetri ikoon, kui `warmsUp` on
tõene.

Juhtnupud (kaks muudetavat suurust, moodulilepingu järgi – mõlemad valikud,
liugurit siin ei ole, sest ükski suurus ei ole pidev):

- **valik: lambi valgus** – valge / punane / roheline / sinine / kollane
  (algväärtus valge)
- **valik: ese** – valge paber / must särk / punane õun / roheline leht /
  sinine kruus / kollane sidrun (algväärtus punane õun)

Tolerantsid ja ühikud: kõik arvulised vastused on siin täisarvud (kanalite
arv), ühikuta, tolerants **0**. Ühtegi mõõdetavat suurust simulatsioonis ei
ole, seega lugemistolerantsi ei ole vaja – see on selle mooduli teadlik
erinevus näiteks moodulist `liitvalgus-ja-spekter`.

Ülesanded:

1. „Vali valge valgus ja punane õun. Mitu värvi kolmest neeldub õunas?"
   (2; tolerants 0; ühikuta; vihje 1: „loe nooli, mis õuna sisse kaovad";
   vihje 2: „tagasi tuleb ainult punane – ülejäänud kaks jäävad sisse")
2. „Jäta punane õun ja vaheta lamp roheliseks. Mis värvi õun nüüd paistab?"
   (valik) (a) punane (b) roheline (c) **must**
3. „Vali kollane sidrun ja punane lamp. Mis värvi sidrun paistab?" (valik)
   (a) kollane (b) **punane** (c) must.
   Selgitus pärast vastamist: sidrun peegeldab punast JA rohelist, aga
   punases lambis on tagasi saata ainult punane – seepärast paistab ta
   punane, mitte kollane.
4. „Proovi valget paberit kõigi viie lambiga läbi. Mille järgi paberi värv
   käib?" (valik)
   (a) paber on alati valge, sest ta ongi valge
   (b) **paber paistab alati sama värvi, mis lamp – ta peegeldab kõik
   tagasi**
   (c) paber muudab valguse alati valgeks

Ülesande 4 juures kuvab simulatsioon pärast vastamist lause: „Valge paber
peegeldab peaaegu kõik tagasi ja neelab väga vähe – sellepärast ta ka
päikese käes ei soojene nii palju kui must särk." (Sild hooki tagasi.)
Sõna „peaaegu" on siin kohustuslik: hooki joonisel on valge särk 34 °C ehk
ta ON pisut soojenenud, ja „ei neela midagi" oleks selle enda mooduliga
vastuolus (CodeRabbiti leid samm 4.1z).

### 5. practice – harjutamine

1. **Näidis (lahendatud):** Miks paistab roheline leht valges päikesevalguses
   roheline? Päikesevalguses on kõik kolm värvi: punane, roheline, sinine.
   Lehe pind peegeldab tagasi **rohelise** ja neelab **punase ja sinise**.
   Silma jõuab ainult roheline valgus – seepärast näeme rohelist lehte. Leht
   ise valgust ei tee, ta ainult valib, mis tagasi läheb.
2. **Osaline (täida lünk):** Sinist kruusi valgustatakse valge valgusega.
   Kruus peegeldab 1 värvi kolmest. Mitu värvi neeldub? 3 − 1 = ___
   (vastus 2; tolerants 0; ühikuta; vihje: „see, mis ei peegeldunud, on
   neeldunud")
3. **Iseseisev (joonise lugemine):** Joonis (`ev-kolm-eset`): kolm eset ühe
   valge lambi all – A peegeldab kolm noolt (punane, roheline, sinine),
   B peegeldab ühe sinise noole, C ei peegelda ühtegi. Küsimus: „Milline
   ese soojeneb päikese käes kõige rohkem?" (a) A (b) B (c) **C**.
   Vihje: „soojust annab see valgus, mis EI tule tagasi."
4. **Iseseisev (ennustus):** Sinine kruus pannakse kollase lambi alla
   (kollases valguses on punane ja roheline, sinist ei ole). Mis värvi kruus
   paistab? (a) sinine (b) kollane (c) **must**. Vihje: „kas kruusile langeb
   üldse seda värvi, mida ta peegeldada oskab?"
5. **Ülekanne (valik, mitu õiget):** Millised väited on õiged?
   **must ese neelab peaaegu kogu temale langeva valguse**,
   **valge ese peegeldab kõik värvid tagasi**,
   ese kiirgab ise oma värvi valgust,
   **sama ese võib eri valgustes paista eri värvi**,
   pimedas toas on punane õun ikka punane.
   `shuffle: true`. Vale „ese kiirgab ise" saab sildi `ese-kiirgab-ise`;
   vale „pimedas ikka punane" saab sildi `varv-on-esemes`.

### 6. exit – väljumispilet

1. Miks paistab must särk must? (a) sest ta kiirgab musta valgust
   (b) **sest ta neelab peaaegu kogu temale langeva valguse ja tagasi ei
   tule peaaegu midagi**
   (c) sest tema pind on liiga sile, et valgust peegeldada
2. Punast õuna valgustatakse valge valgusega, milles on kolm värvi (punane,
   roheline, sinine). Mitu neist neeldub õunas? (2; tolerants 0; ühikuta;
   vihje: „üks tuleb tagasi, ülejäänud jäävad sisse")
3. „Sõber ütleb: „Poes paistis see jope tumesinine, aga õues on ta must."
   Selgita, kuidas see võimalik on ja mida sa soovitaksid tal järgmine kord
   poes teha." (vabatekst, õpetajale nähtav – oodatav mõte: jope peegeldab
   ainult sinist; kui poe lambi valguses on sinist vähe – nagu vanas kollases
   valgustis –, ei ole jopel midagi tagasi saata ja ta paistab peaaegu must;
   soovitus: vaadata riiet päevavalguses akna juures või poest väljas)

## Väärarusaamad

| Silt | Väärarusaam | Kuidas moodul selle ümber lükkab |
|---|---|---|
| `varv-on-esemes` | värv on eseme enda omadus, mis ei sõltu valgusest (ka pimedas on õun punane) | predict + explore-2 ja -3: sama õun paistab rohelises lambis must; practice-5 |
| `ese-kiirgab-ise` | värviline ese kiirgab ise oma värvi valgust | teooria („ese ainult valib, mida tagasi saata") ja simulatsiooni nooled: eseme juurest ei lähtu ühtegi noolt, mida enne ei langenud; practice-5 |
| `ese-peegeldab-koike-mis-langeb` | ese peegeldab tagasi kogu talle langeva valguse, olgu mis värvi tahes | predict-vastus (b) ja explore-2: roheline valgus punasel õunal ei peegeldu, vaid neeldub |
| `must-varv-on-varv` | musta valgust on olemas ja must ese saadab seda tagasi | exit-1; simulatsioonis on musta eseme juures null tagasitulevat noolt |
| `valge-neelab-koige-rohkem` | valge ese soojeneb päikese käes rohkem, sest „valge tõmbab valgust ligi" | hook (mõõdetud kraadid) + explore-4 lause + practice-3 |
| `valgus-ja-varviaine-sama` | valguste liitmine käib nagu guaššvärvide segamine (kollane + sinine = roheline) | teooria üks lause: purgis segatakse värviAINEID, mis neelavad; siin liidetakse VALGUSI, ja kollane valgus ongi punane + roheline |

## Õpetajale (teacher.ts)

- **(K) värviline valgus pimedas klassis (kõige mõjuvam katse):** pange
  lauale punane õun või tomat, roheline leht, sinine ese ja valge paber.
  Pimendage klass ja valgustage neid ühevärvilise valgusega – kõige lihtsam
  on telefoni ekraanile avatud ühevärviline pilt (täisekraanil punane, siis
  roheline, siis sinine) või värvilise kilega kaetud taskulamp. Lapsed
  ütlevad ennustuse ette ja alles siis vaadatakse. Kõige tugevam hetk on
  punane ese rohelises valguses – ta läheb tumehalliks või peaaegu mustaks.
  **Päris mustaks ta ilmselt ei lähe** ja seda tasub klassile ette öelda:
  telefoni „roheline" ekraan kiirgab natuke ka teisi värve, tuppa jääb alati
  veidi kõrvalvalgust ja päris õun ei ole nii puhtalt punane kui mudeli
  õun. Ekraanil (simulatsioonis) on ese päris must, klassis tumehall –
  õpilane peab teadma, et see vahe on ootuspärane, mitte katse ebaõnnestumine.
- **(K) must ja valge paber päikese käes:** kleepige valge papi peale must
  paberitükk, jätke aknalauale päikese kätte 10 minutiks ja katsuge sõrmega
  (või mõõtke infrapunatermomeetriga, kui on). Vahe on käega tuntav. Sama
  katse talvel: lumel olev must täpp vajub aukusse.
- **(K) värvipurgi ja valguse vahe:** segage guašiga kollane ja sinine –
  tuleb roheline. Öelge kohe välja, et VALGUSTEGA see nii ei käi (punane +
  roheline valgus annab kollase), ja et 8. klassis me värviainete keemiat ei
  ava. Ilma selle lauseta läheb pool klassist segadusse.
- **OHUTUS:** midagi ohtlikku selles moodulis ei ole. Kui kasutate
  taskulampi, ärge suunake seda silma; päikest ei vaadata palja silmaga (ka
  mitte „ainult korraks", et võrrelda).
- **Aruteluküsimused:** Miks on kõrbes ja lõunamaades majad valgeks
  värvitud? Miks on päästjate ja teetööliste vestid ere kollakasroheline –
  mis värvi see silmale tagasi saadab? Mis värvi on lehed sügisel ja mis
  jäi neis siis peegeldamata? Miks tundub sama seinavärv poes ja kodus eri
  tooni?
- **Millal see moodul tunnis:** PÄRAST moodulit `liitvalgus-ja-spekter`
  (õpilane peab teadma, et valges valguses on mitu värvi korraga) ja
  soovitatavalt ENNE moodulit `valgusfiltrid` – filter on „sama lugu, aga
  läbi eseme". Peegeldumisseadust see moodul EI eelda: siin ei ole ühtegi
  nurka.
- **Simulatsioon enne või pärast päris katset:** siin soovitan
  SIMULATSIOONI ENNE. Päris katse õnnestub ainult päris pimedas ja päris
  ühevärvilise valgusega; kui see ei õnnestu (aknast tuleb valgust), näeb
  laps „poolikut" tulemust ja jääb uskuma, et õun on ikka natuke punane.
  Simulatsioon annab puhta pildi, päris katse kinnitab.
- **Tunniplaan (18 min):** 2 min hook + 3 min teooria · 2 min ennustus ·
  5 min simulatsioon · 4 min harjutamine · 2 min väljumispilet.

## Kordamiskaardid (5 tk)

| id | tüüp | küsimus | vastus |
|---|---|---|---|
| rc-1 | concept | Mis juhtub valgusega, kui ta langeb läbipaistmatule esemele? | Osa peegeldub tagasi, ülejäänu neeldub ehk läheb esemesse ja muutub soojuseks – kolmandat teed ei ole |
| rc-2 | concept | Miks on üks ese valge ja teine must? | Valge peegeldab tagasi kõik värvid, must ei peegelda peaaegu midagi ja neelab kõik |
| rc-3 | selgitus | Miks paistab punane õun rohelises valguses must? | Õun oskab tagasi saata ainult punast, aga punast valgust talle ei lange; rohelise ta neelab, seega silma ei jõua midagi |
| rc-4 | calc | Valge valguses on kolm värvi. Sinine kruus peegeldab neist ühe. Mitu neeldub? | 2 (3 − 1); see, mis ei peegeldunud, neeldub ja soojendab kruusi |
| rc-5 | transfer | Miks värvitakse kuumas kliimas majad valgeks ja miks on must särk päikese käes palav? | Valge pind peegeldab valguse tagasi ega neela seda soojuseks; must pind neelab peaaegu kogu langeva valguse ja soojeneb
