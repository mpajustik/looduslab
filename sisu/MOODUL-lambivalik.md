# Mooduli spetsifikatsioon: Lambivalik

Ainekava seos (AINEKAVA-fyysika-8.md): plokk P1; õpitulemus: P1-T1 (osa:
valgusallikate liigituse RAKENDAMINE – õpilane valib ruumi jaoks lambi ja
põhjendab valikut); mõisted, mida õpetab: – (rakendusmoodul, kasutab
moodulist `valgusallikad` tulnud liigitusi „soojuslik / külm" ja „punkt- /
laiendatud allikas"); praktiline töö: –. Vanus: 8. klass.
Kestused: demo 5 min, tund 15 min, iseseisev 12 min. Tüüp: rakendusmoodul
(üks õpieesmärk, 6 sammu).

slug: `lambivalik` · id: `physics.lambivalik`

## Ainekava seos (täpsemalt)

- **Plokk:** P1 Valgus ja valguse sirgjooneline levimine. Peegeldumine ja
  neeldumine
- **Õpitulemused:**
  - **P1-T1 osa** – „tunneb erinevaid valgusallikaid; liigitab neid suuruse
    ja spektraalse koostise järgi". Uut liigitust siin ei tule: moodul
    `valgusallikad` andis mõlemad teljed (soojuslik/külm, punkt/laiendatud)
    ja moodul `liitvalgus-ja-spekter` andis spektri. See moodul vastab
    küsimusele, MIDA nende liigitustega poes peale hakata – ehk ainekava
    metoodiline rõhk **„lambivalik koos põhjendusega"**.
- **Õppesisu punktid:** „soojuslikud ja külmad valgusallikad" –
  rakenduslik pool (millise lambi valid ja miks)
- **Põhimõisted, mida moodul ÕPETAB:** – rakendusmoodul ei oma ühtki
  ainekava põhimõistet. **Punktvalgusallikas** kuulub moodulile
  `valgusallikad`, **valguse spekter** moodulile `liitvalgus-ja-spekter`.
  Manifesti `concepts` väljale lähevad kolm asja, mida see moodul PÄRISELT
  seletab ja mida ainekava nimeliselt ei nimeta: **valgusvoog**,
  **valgusviljakus** ja **värvustemperatuur**. Katvusraport (samm 4.0)
  loeb tundmatu mõiste `extraConcepts` alla ehk märkuseks, mitte ainekava
  katteks – täpselt nagu moodulites `varjutused`, `helkur` ja
  `kumerpeegli-rakendused`.
  **Siia EI tohi kirjutada `punktvalgusallikas`** (ainekava P1
  põhimõiste): raport võrdleb mõisteid nime järgi ja siis paistaks üks
  põhimõiste kaetuna kahest kohast.
- **Praktiline töö:** – (P1-PT1…PT4 on kõik teiste moodulite all).
  Õpetajajuhendi (K) kodulampide võrdlus on ainekava õpilase tegevus, mitte
  ainekava praktiline töö.
- **Teema olulisus → hook:** „igapäevased valgusnähtused looduses ja
  tehnikas" + „seos valgustehniku, fotograafi, ruumidisaini erialadega" –
  poeriiulil on kaheksa lampi, igal pakendil kolm arvu ja kaks neist ei
  ütle heleduse kohta midagi. Milline neist käib õppelaua kohale?
- **Metoodilised soovitused, mida järgin:** ainekava nimetab otse
  „lambivalik koos põhjendusega" ja õpilase tegevustes „(K) valib
  kodulambid + põhjendab". Digiteeritav pool on siin see, et õpilane
  KATSETAB toas valgusvoo ja valguse värvusega enne, kui otsustab;
  põhjendus küsitakse vabatekstina ja on õpetajale nähtav.
- **Õpilase tegevused:** (D) valib simulatsioonis ruumi jaoks valgusvoo ja
  värvustemperatuuri ning võrdleb neid soovitusega; (D) arvutab
  valgusviljakuse ja selle, mitu vatti kulub sama valguse tegemiseks eri
  lambitüübiga; (K) kodulampide võrdlus päris pakendite järgi läheb
  teacher.ts õpetajajuhendisse

## Piirid (mida see moodul EI tee)

- **Elektriarve, kilovatt-tund ja tasuvusaeg.** Ahvatlev, aga vale koht:
  võimsus, töö ja energia on plokk P6 ja LED vs hõõglamp elektriarvel on
  nimeliselt mooduli `voimsus-elus` sisu. Siin on vatt ainult **lambi
  tarbitav võimsus pakendil** – arv, mida võrreldakse luumenitega. Ühtki
  kilovatt-tundi, hinda ega eurot ekraanil ei ole. Kui see moodul teeks
  elektriarve ära, jääks P6 moodul tühjaks ja õpilane saaks sama asja
  kaks korda.
- **Punkt- ja laiendatud allika ARVUTUS** (suhe kaugus/mõõde, piir 60) –
  moodul `valgusallikad`. Siin on see EELDUS ja jääb sõnaliseks: paljas
  pirn on väike allikas (teravad varjud, pimestab), varjundi või hajutiga
  lamp on laiendatud allikas (pehmed varjud). Ühtki suhet siin ei
  arvutata ja mudelis ei ole selle piiri konstanti – kaks moodulit ei tohi
  hoida sama arvu kahes kohas.
- **Fotomeetria täies mahus.** Kandela, valgustugevus ja ruuminurk jäävad
  välja. Ekraanil on kaks fotomeetrilist suurust: **luumen** (kui palju
  valgust lamp kokku annab) ja **luumenit ruutmeetri kohta** (kui tihedalt
  see valgus ruumi jaotub). Viimase ametlik nimi on **luks** ja see ütleb
  õpetajajuhend välja, aga õpilase ülesannetes kasutame kirjeldust
  „lm ruutmeetri kohta", sest ainekava seda ühikut ei nõua.
- **Värvusesitusindeks (CRI/Ra), virvendus, sinise valguse mõju unele.**
  Päris valgustehnika olulised suurused, aga nad nõuavad spektri
  mõõtmist ja bioloogiat. Õpetajajuhend nimetab CRI-d ühe lausega
  („sama värvustemperatuuri juures võivad kaks lampi värve eri moodi
  näidata"), moodul ei arvuta seda.
- **Kiirgusseadused** (Wieni nihkeseadus, Stefan-Boltzmann, must keha).
  Moodul ütleb, MIDA värvustemperatuuri arv tähendab (millise
  temperatuuriga hõõguv keha annaks sellise valguse), aga ei tuleta seda
  ega arvuta lainepikkust. See on gümnaasium.
- **Valgustusarvutus päris ruumile** (peegeldustegurid, valgusti asukoht,
  kasutustegur). Mudel korrutab pindala ja soovitatava tiheduse – see on
  taskuarvutusreegel, mitte projekteerimine, ja nii on ta ka ekraanil
  kirjas („ligikaudne soovitus").
- **Lampide keskkonnamõju ja jäätmekäitlus** (säästulambi elavhõbe,
  taaskasutus). Kuulub õpetajajuhendisse ja ohutusse, mitte ülesannetesse.

## Allikad

- **Teooria tugi:** `sisu/allikad/POHIVARA-F8-taielik.md` ptk 17 (17.2
  kehad üle 600 °C kiirgavad nähtavat valgust; 17.3 kõrgem temperatuur →
  sinakam valgus; 17.4 külmade allikate kiirgus on luminestsents) –
  faktikontroll värvustemperatuuri lõigule ja lambitüüpide liigitusele.
  Sõnasõnalist teksti ei kopeerita (vt ALLIKAD.md).
- **Ülesannete näidised:** – (kõik arvud on selle mooduli omad).
  Lambitabeli võimsused ja valgusvood on **poepakendite suurusjärgud**,
  mitte ühestki allikast võetud ülesanne, ja nad on tahtlikult valitud
  nii, et jagatis tuleb täisarv: 60 W / 720 lm → 12 lm/W,
  42 W / 630 lm → 15 lm/W, 15 W / 810 lm → 54 lm/W, 8 W / 800 lm →
  100 lm/W. Ümardatud arvud on ausad – tabeli päises on kirjas „umbes".

## Füüsika (model.ts jaoks)

Moodul arvutab ühte asja: **kui palju valgust lamp annab ja mis see
maksma läheb – mitte rahas, vaid vattides.** Miks üks allikas on soojuslik
ja teine külm, tuli moodulist `valgusallikad` – siin on selle TAGAJÄRG
arvudes.

Ühikud: valgusvoog **luumenites (lm)**, võimsus **vattides (W)**,
valgusviljakus **lm/W**, värvustemperatuur **kelvinites (K)**, pindala
**ruutmeetrites (m²)**. **Ühikuteisenduse funktsioone ei ole** – kõik
suurused on juba nendes ühikutes, milles nad lambipakendil seisavad, ja
just see ongi mooduli mõte (õpilane peab pakendit lugema oskama).

### Kokkulepped

- **Valgusvoog Φ** (`lumensLm`) on kogu valgus, mida lamp igas suunas
  kokku välja saadab. See on ainus arv pakendil, mis heleduse kohta midagi
  ütleb.
- **Võimsus P** (`powerW`) on elektrivõimsus, mida lamp tarbib – MITTE
  heledus. Kogu mooduli peamine väärarusaam ripub selle vahe küljes.
- **Valgusviljakus η** (`efficacyLmPerW`) on Φ / P: mitu luumenit saab
  lamp ühest vatist. Sõna „viljakus" on eestikeelses valgustehnikas
  kasutusel ja õpilasele öeldakse ta lahti („kui palju valgust ühe vati
  kohta").
- **Värvustemperatuur T** (`kelvin`) on selle hõõguva keha temperatuur,
  mis annaks sama värvi valgust. **Ei ole lambi enda temperatuur** –
  6500 K LED on käega katsudes leige. Ka „soe" ja „külm" käivad siin
  tunde, mitte temperatuuri kohta, ja on arvuga vastupidi: soe valgus =
  VÄIKE arv (2700 K), külm valgus = SUUR arv (6500 K).
- **Valgustustihedus** (`lumensPerM2`) on soovitatav valgusvoog ruumi
  ühe ruutmeetri kohta. Ametlik nimi luks – vt „Piirid".

### Neli seost, millel moodul seisab

1. **Valguse hulka mõõdab luumen, mitte vatt: η = Φ / P.**
   *Miks:* vatt ütleb, kui palju elektrit lamp sisse võtab; luumen, kui
   palju valgust välja tuleb. Nende suhe on lambitüübi omadus ja erineb
   **kaheksa korda**: hõõglamp 12 lm/W, LED 100 lm/W. Seepärast ei
   tähenda „60 W" ega „8 W" iseenesest mitte midagi – nad tähendavad
   midagi ainult koos lambitüübiga.
2. **Sama valgus, teine lamp: P = Φ / η.**
   *Miks:* sama jagamistehe teistpidi. Kui elutuppa on vaja 2700 lm,
   kulub LED-idega 27 W ja hõõglampidega 225 W. See ongi vastus küsimusele
   „mis vahet seal on".
3. **Miks vahe nii suur on:** hõõglamp on **soojuslik** allikas – ta teeb
   valgust nii, et kuumutab niidi hõõguma, ja enamik energiast lahkub
   soojusena, mitte valgusena. LED on **külm** allikas: ta teeb valgust
   ilma hõõgumata. See lause on moodulist `valgusallikad` ja siin ta
   ainult SELETAB arvu 12 vs 100. Mudel seda ei arvuta (soojuse osakaalu
   arvutamine nõuaks kiirgusspektrit – vt „Piirid").
4. **Kui palju valgust ruumi vaja on: Φ = S · (lm/m²).**
   *Miks:* sama lamp valgustab väikest tuba heledalt ja suurt hämaralt.
   Pindala korda soovitatav tihedus annab luumenite arvu, mida ruumi
   otsida. Tihedus ise sõltub sellest, MIDA seal tehakse: magamistoas
   ~100, elutoas ~150, köögi tööpinnal ~300, õppelaual ~500 lm/m².

### Funktsioonid

- `luminousEfficacy(lumensLm, powerW)` → **Φ / P** ühikus lm/W. Mitu
  luumenit annab lamp ühest vatist.
  Lubatud `lumensLm > 0` ja `powerW > 0`. **Tulemus üle 683 lm/W viskab
  vea** – see ei ole ilutunne, vaid füüsikaline ülempiir: 683 lm/W saaks
  ainult allikas, mis muudab KOGU energia kõige tõhusamaks rohekaskollaseks
  valguseks. Valge valguse praktiline lagi on umbes 350 lm/W. Mudel, mis
  vastaks küsimusele „1000 lm/W", õpetaks valet asja.
- `powerForLumens(lumensLm, efficacyLmPerW)` → **Φ / η** vattides. Mitu
  vatti kulub, kui teed sama valguse selle lambitüübiga.
  Lubatud `lumensLm > 0`, `0 < efficacyLmPerW ≤ 683` (sama piir samal
  põhjusel – kaks funktsiooni ei tohi lubada eri füüsikat).
  Pöördfunktsioon: `powerForLumens(Φ, luminousEfficacy(Φ, P))` = P ja
  seda valvab test.
- `requiredLumens(areaM2, lumensPerM2)` → **S · tihedus** luumenites.
  Lubatud `1 ≤ areaM2 ≤ 100` (üks tuba, mitte kapp ega ladu) ja
  `50 ≤ lumensPerM2 ≤ 1000` (hämar koridor … peenmontaaži töölaud).
  Piirid on sisulised: väljaspool neid ei ole tegemist enam kodutoa
  valgustamisega ja taskuarvutusreegel ei kehti.
- `classifyColorTemperature(kelvin)` → `"soe"`, kui T < **3300**;
  `"neutraalne"`, kui 3300 ≤ T ≤ **5300**; `"kulm"`, kui T > 5300.
  Lubatud **1500 ≤ T ≤ 10 000 K**; väljaspool viskab vea (küünlaleek on
  ~1900 K, kõige sinakam müügilamp ~6500 K – 500 K ega 20 000 K ei ole
  lambivaliku küsimus). Väljundi väärtused on koodinimed (`"kulm"` ilma
  täpitäheta, nagu kõik selle projekti liigitusväljundid); eestikeelsed
  sildid „soe valge", „neutraalne valge", „külm valge" tulevad
  `display.ts`-ist, mitte mudelist – täpselt nagu moodulis
  `kuu-faasid`.

**Miks EI ole funktsiooni „kas lamp sobib sellesse tuppa"**
(`Φ ≥ requiredLumens` + värvusevõrdlus): see on kaks võrdlusmärki, mis
kuuluvad Simulation.tsx kuvamisse, ja õpilase vastust kontrollib checker
fikseeritud arvu vastu. Kasutajata mudelifunktsioon oleks kood, mida keegi
ei kutsu (reegel 7). Soovitus ise („magamistuppa soe valgus") on
pedagoogiline kokkulepe, mitte füüsika – ta elab `activities.ts`-is ja
õpetajajuhendis, kus teda saab vaidlustada, mitte mudelis, kus ta
paistaks loodusseadusena.

**Miks EI ole konstanti „soovitatav valgustustihedus"** mudelis: need neli
arvu (100 / 150 / 300 / 500) on stsenaariumi arvud, mitte
looduskonstandid – nad tulevad `activities.ts`-ist ja Simulation.tsx-ist
argumendina sisse, nii saab õpetaja rääkida ka töökojast ilma mudelit
puutumata. Sama otsus ja sama põhjendus nagu juhi silmade kaugusel
moodulis `helkur`.

### Idealiseeringud (peavad olema model.ts kommentaaris kirjas)

1. **Kogu lambi valgus jõuab ruumi.** Päris valgusti varjund, tolm ja
   suund söövad osa ära (valgusti kasutustegur on tihti 0,5…0,8) ja tume
   sisustus neelab valgust. Mudel korrutab pindala ja tiheduse – seepärast
   on ekraanil kirjas „ligikaudne soovitus", mitte „vajalik".
2. **Valgus jaotub ruumis ühtlaselt.** Päris ruumis on lambi all heledam
   ja nurgas hämaram; just seepärast kasutatakse mitut valgustit. Mudel
   ei tunne lambi asukohta.
3. **Lambi valgusvoog on püsiv.** Päris lamp tuhmub aastatega (LED umbes
   kolmandiku võrra oma eluea jooksul) ja säästulamp jõuab täisheleduseni
   alles minuti pärast. Mudelis on Φ üks arv.
4. **Värvustemperatuur kirjeldab valgust ühe arvuga.** Kaks sama
   värvustemperatuuriga lampi võivad värve päris erinevalt näidata (CRI –
   vt „Piirid"). Mudel liigitab ainult sooja/neutraalse/külma järgi.
5. **Lambitüübi valgusviljakus on üks arv.** Päris LED-ide viljakus on
   vahemikus 60…160 lm/W ja sõltub värvustemperatuurist, hinnast ja
   vanusest. Tabeli arv 100 lm/W on tänase kodulambi suurusjärk ja tabeli
   päises on „umbes".
6. **Valgustustiheduse soovitused on ümarad kokkulepped.** Päris
   valgustusnormid annavad vahemikud ja sõltuvad vanusest (vanem silm
   vajab rohkem valgust) – neli arvu selles moodulis on õpetatav
   lihtsustus, mitte norm.

**Testiväärtused (teadaolevad):** argumendid koodikujul (kümnendpunkt),
tulemused eestikeelse kümnendkomaga.

| Kutse | Tulemus |
|---|---|
| `luminousEfficacy(720, 60)` | **12** (hõõglamp – soojuslik allikas, enamik energiast läheb soojuseks) |
| `luminousEfficacy(630, 42)` | **15** (halogeen – veidi parem hõõglamp) |
| `luminousEfficacy(810, 15)` | **54** (säästulamp) |
| `luminousEfficacy(800, 8)` | **100** (LED – külm allikas) |
| `luminousEfficacy(800, 1)` | **viskab vea** (800 lm/W ületab füüsikalise piiri 683) |
| `luminousEfficacy(800, 0)` | **viskab vea** (lamp ei tarbi nulli) |
| `luminousEfficacy(0, 8)` | **viskab vea** (see ei ole lamp) |
| `powerForLumens(800, 100)` | **8** (LED, mis annab 800 lm) |
| `powerForLumens(800, 12)` | 66,666667 (sama valgus hõõglambiga) |
| `powerForLumens(2700, 100)` | **27** (elutuba LED-idega) |
| `powerForLumens(2700, 12)` | **225** (sama elutuba hõõglampidega – 8,3 korda rohkem) |
| `powerForLumens(800, 683)` | 1,1713031 (piir on kaasav) |
| `powerForLumens(800, 700)` | **viskab vea** (üle füüsikalise piiri) |
| `requiredLumens(12, 100)` | **1200** (magamistuba 12 m²) |
| `requiredLumens(18, 150)` | **2700** (elutuba 18 m²) |
| `requiredLumens(4, 300)` | **1200** (köögi tööpind 4 m² – sama luumenite arv väiksemale pinnale) |
| `requiredLumens(2, 500)` | **1000** (õppelaud 2 m²) |
| `requiredLumens(0.5, 300)` | **viskab vea** (alla 1 m² ei ole tuba) |
| `requiredLumens(12, 20)` | **viskab vea** (alla 50 lm/m² ei ole valgustatud ruum) |
| `classifyColorTemperature(2700)` | **"soe"** (hõõglamp ja „soe valge" LED) |
| `classifyColorTemperature(3299)` | **"soe"** |
| `classifyColorTemperature(3300)` | **"neutraalne"** (alumine piir on kaasav) |
| `classifyColorTemperature(4000)` | **"neutraalne"** (töölaud) |
| `classifyColorTemperature(5300)` | **"neutraalne"** (ülemine piir on kaasav) |
| `classifyColorTemperature(5301)` | **"kulm"** |
| `classifyColorTemperature(6500)` | **"kulm"** (päevavalguslamp) |
| `classifyColorTemperature(1400)` | **viskab vea** (allpool lambivaliku vahemikku) |
| `classifyColorTemperature(12000)` | **viskab vea** |

Piirjuhud ja invariandid (need on testid, mitte üksikread):

- **Kaks funktsiooni on teineteise pöörded:**
  `powerForLumens(Φ, luminousEfficacy(Φ, P))` = P iga lubatud Φ ja P
  korral (lubatud viga 1e-9) ja sama ka teistpidi. See on ainus koht, kus
  mudeli kaks poolt teineteist ristkontrollivad – ilma selleta võiks üks
  neist vaikselt jagatava ja jagaja ära vahetada ja ükski üksikväärtuse
  test seda ei näitaks.
- **Sama lamp, teine kogus:** `luminousEfficacy(k·Φ, k·P)` =
  `luminousEfficacy(Φ, P)` iga k > 0 korral. Viljakus on lambitüübi
  omadus, mitte lampide arvu oma – kaks 8 W LED-i on sama viljakad kui
  üks.
- **Rohkem valgust nõuab rohkem vatte:** `powerForLumens` on Φ suhtes
  rangelt kasvav ja η suhtes rangelt kahanev (test käib võre läbi).
- **Lambitabel on kooskõlas:** test käib läbi kõik neli tabelirida
  (hõõglamp, halogeen, säästulamp, LED) ja nõuab, et
  `luminousEfficacy(Φ, P)` annab täpselt tabelis oleva täisarvu. Tabel on
  ekraanil ja ülesannetes – kui keegi muudab kunagi ühte arvu, peab test
  kukkuma, mitte ekraanile vale jagatis ilmuma.
- **LED on hõõglambist umbes 8 korda viljakam:** test nõuab, et
  100 / 12 jääb vahemikku 8…9. See on teooria ja practice-1 väide ja
  peab olema arvudes kinni, mitte ainult tekstis.
- **Liigituse piirid ei liigu:** test käib üle kõigi nelja piiripunkti
  (3299 / 3300 / 5300 / 5301) ja nõuab, et vahemikud on kaasavad täpselt
  seal, kus tekstis kirjas. Piirid elavad model.ts konstantides
  `WARM_MAX_K` ja `NEUTRAL_MAX_K`, mitte laiali sisufailides.
- **Simulatsiooni turvavöönd:** liuguritega on Φ = 200…3000 lm ja
  T = 2200…6500 K. Test käib kogu võre läbi ja nõuab, et
  `classifyColorTemperature` ei viska ühelgi liuguri väärtusel viga ja et
  `powerForLumens(Φ, 100)` jääb vahemikku 2…30 W (siis mahub arv
  kastikesse). Nii ei saa keegi hiljem liuguri piire muutes vaikselt
  ekraanile tuua väärtust, mille peale mudel enam ei vasta.

Vigased sisendid viskavad vea (`RangeError`):

- mis tahes argument, mis ei ole lõplik arv (NaN, lõpmatus), ja iga
  tulemus, mis lõplikest sisenditest hoolimata üle voolab (sama joon mis
  moodulites `valgusallikad`, `helkur` ja `nurkpeegel` – Codexi leiud,
  sammud 4.1ii ja 4.1mm)
- `lumensLm` ≤ 0 või `powerW` ≤ 0; tulemus > 683 lm/W
- `efficacyLmPerW` ≤ 0 või > 683
- `areaM2` < 1 või > 100; `lumensPerM2` < 50 või > 1000
- `kelvin` < 1500 või > 10 000

## Sammud

### 1. hook – häälestus

Joonis (`figures.tsx`, silt `lv-poeriiul`): poeriiul, sellel neli lambikarpi
kõrvuti. Igal karbil suurelt kolm arvu: „60 W · 720 lm · 2700 K",
„42 W · 630 lm · 2800 K", „15 W · 810 lm · 4000 K", „8 W · 800 lm · 2700 K".
Ühe karbi peal on veel kleeps „vastab 60 W lambile". Ühtki arvu joonisel
ei mõõdeta – see on häälestus.

„Neli lampi, kõigil kolm arvu. Sa tahad õppelaua kohale lampi, mis annab
piisavalt valgust. Millist arvu sa vaatad – ja miks on 8 W lambi peal
kirjas „vastab 60 W lambile", kui 8 ja 60 ei ole ligilähedaseltki sama?"

Eesmärk õpilase keeles: „Oskan lambipakendi arvude järgi valida ruumi
jaoks sobiva lambi ja oma valikut põhjendada."

### 2. theory – kolm arvu pakendil (üks ekraan)

- **Luumen (lm) – kui palju valgust.** See on ainus arv, mis heleduse
  kohta midagi ütleb. 800 lm on tavalise kodulambi valgusvoog.
- **Vatt (W) – kui palju elektrit.** Vatt EI ole heledus. Enne LED-e olid
  poes ainult hõõglambid ja siis tähendas „60 W" ka alati sama heledust –
  sellest jäi harjumus, mis täna eksitab.
- **Valgusviljakus = lm / W – kui palju valgust ühe vati kohta.** Siin
  läheb lambitüüpide vahel lahku:

  | Lamp | võimsus | valgusvoog | viljakus (umbes) | liik |
  |---|---|---|---|---|
  | hõõglamp | 60 W | 720 lm | **12 lm/W** | soojuslik |
  | halogeenlamp | 42 W | 630 lm | **15 lm/W** | soojuslik |
  | säästulamp | 15 W | 810 lm | **54 lm/W** | külm |
  | LED-lamp | 8 W | 800 lm | **100 lm/W** | külm |

  Hõõglamp teeb valgust nii, et kuumutab niidi hõõguma – enamik energiast
  lahkub soojusena. LED teeb valgust ilma hõõgumata (moodul
  `valgusallikad`: külm valgusallikas). Sellest tulebki kaheksakordne vahe.
  „Vastab 60 W lambile" tähendab: annab sama palju LUUMENEID kui vana 60 W
  hõõglamp.
- **Kelvin (K) – mis värvi valgus.** Arv ütleb, millise temperatuuriga
  hõõguv keha annaks sellist valgust. **See ei ole lambi enda
  temperatuur** – 6500 K LED on käega katsudes leige. Alla 3300 K on
  **soe valge** (kollakas, nagu hõõglamp), 3300…5300 K **neutraalne
  valge**, üle 5300 K **külm valge** (sinakas, nagu pilves päev).
  Tähelepanu: nimi ja arv käivad vastupidi – „soe" valgus on VÄIKE arv.
- **Kui palju luumeneid tuppa vaja on:** korruta ruumi pindala sellega,
  kui palju valgust seal tegevuse jaoks vaja on: magamistuba ~100,
  elutuba ~150, köögi tööpind ~300, õppelaud ~500 luumenit ruutmeetri
  kohta.
- **Neljas asi, mida pakend ei ütle: kas lamp on paljas või varjundi
  taga.** Paljas pirn on väike allikas – teravad varjud ja pimestav täpp
  silmas. Varjund või hajuti teeb temast laiendatud allika: varjud pehmed,
  ei pimesta (moodul `valgusallikad`).
- Joonis (`lv-kolm-varvust`): sama tuba kolm korda kõrvuti, valgus
  2700 K / 4000 K / 6500 K. All igal sildid „soe valge · 2700 K" jne.
  Värvus ei ole ainus info kandja – arv ja sõna on iga pildi all kirjas.

### 3. predict – hüpotees (lukustub!)

„Kaks lampi kõrvuti: vasakul vana 60 W hõõglamp, paremal 8 W LED-lamp.
Kumb annab rohkem valgust?"

(a) hõõglamp – 60 W on ju palju rohkem kui 8 W
(b) **LED – tema valgusvoog on 800 lm, hõõglambil 720 lm**
(c) täpselt võrdselt – muidu ei kirjutaks pakendile „vastab 60 W lambile"

+ „Miks sa nii arvad?" (vabatekst).

Õige on (b). Vastust EI avaldata enne sammu 4.

Vale (a) saab sildi `vatt-on-heledus`, vale (c) sildi `vastab-on-tapne`.

### 4. explore – simulatsioon

SVG **toa läbilõige**: põrand, tagasein, laes valgusti, all laud ja tool.
Toa heledus ja valguse toon muutuvad liuguritega. Ruumivalik käib
nupureaga; iga ruum toob kaasa oma pindala ja soovituse.

Ekraanil on korraga kaks asja: **sinu valik** (valgusvoog + värvus) ja
**soovitus** sellele ruumile – eri kastikestes ja mõlemal oma silt. Kui
valgusvoog jääb soovitusest alla, on toa joonisel näha hämarus JA kastikeses
on sõnaline lause („jääb hämaraks") – värv ei ole ainus info kandja.

Nupurida (ruum): **magamistuba 12 m²** · **elutuba 18 m²** ·
**köögi tööpind 4 m²** · **õppelaud 2 m²**.

Juhtnupud (kaks liugurit korraga, moodulilepingu järgi):

- **liugur: valgusvoog Φ** – 200…3000 lm, samm 100 lm (algväärtus **800 lm**)
- **liugur: värvustemperatuur T** – 2200…6500 K, samm 100 K
  (algväärtus **2700 K**). Mõlemad algväärtused on liuguri võre peal,
  seega saab õpilane alati alguskoha tagasi.

Kastikesed:

- „Ruum: **elutuba**, 18 m² · soovitus **150 lm ruutmeetri kohta**"
- „Soovitatav valgusvoog: **2700 lm**"
- „Sinu valik: **800 lm** → jääb hämaraks"
- „Valguse värvus: **2700 K – soe valge**"
- „Kui palju vatte kulub: **8 W** (LED, 100 lm/W)"

Tolerantsid ja ühikud: valgusvoog **lm**, tolerants **50 lm** (liuguri
samm on 100); värvustemperatuur **K**, tolerants **100 K**; võimsus
**W**, tolerants **2 W**. Simulatsioon on ideaalne, seega on need
LUGEMISTOLERANTSID, mitte mõõtemääramatus.

Ülesanded:

1. „Vajuta „elutuba". Mitu luumenit sinna soovitatakse?" (2700 lm;
   tolerants 50; ühik lm; vihje 1: „korruta pindala ja soovitus";
   vihje 2: „arv on kastikeses „Soovitatav valgusvoog"")
2. „Jäta elutuba ja lohista valgusvoog 800 lm peale – see on üks tavaline
   LED-lamp. Mis juhtub?" (valik)
   (a) tuba on hästi valgustatud, 800 lm on palju
   (b) **tuba jääb hämaraks – ühest lambist jääb väheks, vaja oleks nelja**
   (c) tuba on liiga hele
   Selgitus pärast vastamist: 2700 / 800 ≈ 3,4 ehk kolmest 800 lm lambist
   (2400 lm) jääb veel puudu – soovituse täis saab neljaga. Suurt tuba ei
   valgusta üks lamp; seepärast on elutoas tavaliselt mitu valgustit.
   Vale (a) saab sildi `uks-lamp-piisab`.
3. „Vajuta „õppelaud" ja sea värvustemperatuur 2700 K peale. Mis silt
   ilmub? Sea siis 4000 K." (valik)
   (a) 2700 K on „külm valge"
   (b) **2700 K on „soe valge", 4000 K on „neutraalne valge"**
   (c) mõlemad on „neutraalne valge"
   Selgitus: õppimiseks ja tööks soovitatakse neutraalset valget – soe
   kollakas valgus on mõnus, aga uniseks tegev. Magamistuppa sobib just
   see soe valgus.
4. „Jäta õppelaud ja sea valgusvoog soovitusega võrdseks. Mitu vatti
   kulub, kui kasutad LED-lampi?" (10 W; tolerants 2; ühik W; vihje:
   „soovitus on 1000 lm ja LED annab 100 lm ühest vatist")
   Selgitus: sama 1000 lm hõõglambiga oleks 83 W – kaheksa korda rohkem
   elektrit sama valguse eest.

### 5. practice – harjutamine

1. **Näidis (lahendatud):** Hõõglamp: 60 W, 720 lm. LED-lamp: 8 W, 800 lm.
   Kumb teeb elektrist rohkem valgust?
   Hõõglamp: 720 / 60 = **12 lm/W**. LED: 800 / 8 = **100 lm/W**.
   100 / 12 ≈ 8 – LED teeb samast elektrist umbes kaheksa korda rohkem
   valgust. Põhjus: hõõglamp on soojuslik allikas (valgus tekib
   hõõgumisest ja enamik energiast lahkub soojusena), LED on külm allikas.
2. **Osaline (täida lünk):** Säästulamp tarbib 15 W ja annab 810 lm.
   Kui suur on tema valgusviljakus?
   810 / 15 = ___ (vastus 54; tolerants 2; ühik lm/W; vihje: „jaga
   luumenid vattidega")
   Selgitus: säästulamp jääb LED-i (100 lm/W) ja hõõglambi (12 lm/W)
   vahele – ta on külm allikas, aga vanema tehnoloogiaga.
3. **Iseseisev (arv):** Elutuppa on vaja 2700 lm. Mitu vatti kulub, kui
   valid LED-lambid (100 lm/W)? (27 W; tolerants 3; ühik W; vihje 1:
   „jaga luumenid viljakusega"; vihje 2: „2700 / 100")
   Selgitus: sama 2700 lm hõõglampidega oleks 2700 / 12 = 225 W – rohkem
   kui kaheksa korda suurem võimsus täpselt sama valguse eest.
4. **Iseseisev (valik):** Pakendil on kirjas 6500 K. Mida see tähendab?
   (a) lamp läheb tööl 6500 kraadi kuumaks
   (b) **lambi valgus on sinakas – „külm valge", nagu pilves päev**
   (c) lamp annab 6500 luumenit valgust
   Vale (a) saab sildi `kelvin-on-lambi-temperatuur`, vale (c) sildi
   `kelvin-on-heledus`.
   Selgitus: kelvin ütleb ainult valguse VÄRVI. Arv tuleb sellest, millise
   temperatuuriga hõõguv keha annaks sellist valgust – LED ise on leige.
5. **Ülekanne (valik, mitu õiget):** Mis sobib 12 m² magamistoa
   laevalgustiks?
   **umbes 1200 lm kogu toa peale**, **2700 K soe valge valgus**,
   **varjundiga või hajutiga valgusti**,
   6500 K külm valge valgus,
   paljas pirn ilma varjundita,
   3000 lm, sest mida heledam, seda parem.
   `shuffle: true`. Vale „6500 K" saab sildi `iga-valgus-sobib-igale-poole`,
   vale „paljas pirn" sildi `paljas-pirn-sobib`, vale „3000 lm" sildi
   `rohkem-on-alati-parem`.
   Selgitus pärast vastamist: magamistuba on 12 m² ja seal piisab umbes
   100 lm ruutmeetri kohta. Paljas pirn on väike allikas – ta pimestab ja
   annab teravad varjud; varjund teeb temast laiendatud allika (moodul
   `valgusallikad`).

### 6. exit – väljumispilet

1. Millist arvu vaatad pakendil, kui tahad teada, kui palju valgust lamp
   annab?
   (a) vatte
   (b) **luumeneid**
   (c) kelvineid
2. Köögi tööpind on 4 m² ja sinna soovitatakse 300 lm ruutmeetri kohta.
   Mitu luumenit on kokku vaja? (1200 lm; tolerants 50; ühik lm; vihje:
   „korruta pindala soovitusega")
3. „Sõber ütleb: „Ma ei osta 6500 K lampi, see läheb liiga kuumaks."
   Mis sa talle vastad?" (vabatekst, õpetajale nähtav – oodatav mõte:
   kelvin ütleb ainult valguse värvi, mitte lambi temperatuuri. 6500 K
   tähendab sinakat „külma valget" valgust; LED ise jääb leigeks. Kuum
   läheb hoopis hõõglamp, mille valgus on 2700 K ehk „soe".)

## Väärarusaamad

| Silt | Väärarusaam | Kuidas moodul selle ümber lükkab |
|---|---|---|
| `vatt-on-heledus` | vatt ütleb, kui hele lamp on | predict + teooria tabel: 8 W LED annab rohkem valgust kui 60 W hõõglamp |
| `vastab-on-tapne` | „vastab 60 W lambile" tähendab täpselt sama valgusvoogu | predict-selgitus + tabel: 800 lm vs 720 lm – „vastab" on ümar lubadus, luumenid ütlevad täpselt |
| `kelvin-on-lambi-temperatuur` | 6500 K lamp läheb 6500 kraadi kuumaks | teooria + practice-4 + exit-3: kelvin kirjeldab valguse värvi, LED ise on leige |
| `kelvin-on-heledus` | suurem kelvin tähendab heledamat lampi | practice-4: kelvin on värv, heledus on luumenites |
| `soe-tahendab-suurt-arvu` | „külm valge" peaks olema väiksem arv kui „soe valge" | teooria: nimi ja arv käivad vastupidi (soe 2700 K, külm 6500 K) |
| `uks-lamp-piisab` | üks lamp valgustab iga toa ära | explore-2: elutuppa on vaja umbes 2700 lm ehk kolme lambi jagu |
| `rohkem-on-alati-parem` | mida rohkem luumeneid, seda parem | practice-5 + explore: magamistuppa 3000 lm on liig; loeb ruumi tegevus |
| `iga-valgus-sobib-igale-poole` | valguse värv on maitseasi, füüsikaga seost pole | explore-3 + practice-5: sama tuba kolme värvustemperatuuriga; magamistuppa soe, töölauale neutraalne |
| `paljas-pirn-sobib` | varjund on ainult ilu pärast | teooria + practice-5: paljas pirn on väike allikas – pimestab ja annab teravad varjud (moodul `valgusallikad`) |
| `led-on-noruk` | LED on nõrk lamp, sest tal on vähe vatte | predict + practice-1: LED teeb samast elektrist 8 korda rohkem valgust |

## Õpetajale (teacher.ts)

- **(K) kodulampide võrdlus (kodune töö + 10 min tunnis):** ainekava
  õpilase tegevus „valib kodulambid + põhjendab". Iga õpilane leiab kodus
  kolm lampi (või lambikarpi) ja kirjutab üles kolm arvu: võimsus (W),
  valgusvoog (lm), värvustemperatuur (K). Kui pakendit enam ei ole,
  seisavad arvud tihti lambi sokli või klaasi peal väikeses kirjas.
  Tunnis: arvutage viljakus (lm/W), pange lambid tabelisse ja otsustage,
  kas iga lamp on õiges toas. Põhjendus peab nimetama vähemalt kaks arvu.
  **Ohutus:** lampi ei keerata pesast välja enne, kui valgus on lülitist
  välja lülitatud ja lamp on jahtunud; hõõg- ja halogeenlamp on kuum;
  katkist säästulampi ei koristata tolmuimejaga (sees on veidi
  elavhõbedat) – tuulutada tuba ja korjata kokku papiga.
- **(K) paljas pirn vs varjund (3 min):** üks lamp, ilma varjundita ja
  varjundiga, pliiats valge paberi kohal. Palja pirni juures on vari terav
  ja lampi on valus vaadata; varjundiga muutub vari pehmeks. See on
  moodulist `valgusallikad` tuttav punkt- ja laiendatud allika vahe,
  ainult et nüüd on ta ostuotsus.
- **(K) sama tuba, kaks lampi (3 min):** kui klassis või koridoris on
  eri värvustemperatuuriga valgustid, pange üks valge paberileht kordamööda
  mõlema alla ja fotografeerige telefoniga (automaatne valgetasakaal
  tuleb telefonis välja lülitada, muidu ta „parandab" vahe ära).
- **Miks vatt ikka veel pakendil on:** hõõglampide ajal oli vatt hea
  heleduse asendaja, sest kõik lambid olid sama tüüpi. Täna on ta
  ainult tarbimisarv. Poes räägitakse endiselt „60-vatisest lambist" –
  see on harjumus, mitte mõõt.
- **Mida see moodul EI räägi:** kui palju lamp elektriarvel maksab. See
  on plokk P6 (`voimsus-elus`), kus tuleb kilovatt-tund. Kui õpilane
  küsib, on aus vastus „selle arvutame ära, kui jõuame võimsuse ja
  energiani".
- **CRI ehk värvusesitusindeks:** kaks sama värvustemperatuuriga lampi
  võivad värve päris erinevalt näidata – odava lambi all paistavad
  riided ja toit tuhmid. Pakendil on see arv Ra või CRI (hea on üle 90).
  Mainimiseks, mitte arvutamiseks.
- **Aruteluküsimused:** Miks kasutatakse tänavavalgustuses tihti kollakat
  valgust? Miks on operatsioonivalgustil väga suur luumenite arv ja väga
  hea CRI? Miks soovitatakse õhtul telefoniekraani „öörežiimi" (soojem
  toon)? Miks vajab vanem inimene lugemiseks rohkem valgust kui laps?
- **Millal see moodul tunnis:** kohe PÄRAST moodulit `valgusallikad` –
  see on sama tunni teine pool. Uut füüsikat siin ei ole, on ainult
  ülekanne, seega sobib ta ka koduseks tööks; kodulampide võrdlus on
  loomulik kodune ülesanne, mille tulemused vaadatakse järgmises tunnis
  koos üle.
- **Tunniplaan (15 min):** 2 min hook + 3 min teooria · 1 min hüpotees ·
  5 min simulatsioon · 3 min harjutamine · 1 min väljumispilet.
  45-minutilises tunnis mahub ette moodul `valgusallikad` ja lõppu palja
  pirni katse.

## Kordamiskaardid (5 tk)

| id | tüüp | küsimus | vastus |
|---|---|---|---|
| rc-1 | concept | Milline arv lambipakendil ütleb, kui palju valgust lamp annab? | Valgusvoog luumenites (lm). Vatt ütleb ainult, kui palju elektrit lamp tarbib |
| rc-2 | calc | Hõõglamp: 60 W ja 720 lm. LED: 8 W ja 800 lm. Kumb teeb elektrist rohkem valgust ja mitu korda? | Hõõglamp 720/60 = 12 lm/W, LED 800/8 = 100 lm/W – LED umbes 8 korda viljakam |
| rc-3 | explain | Miks on hõõglambi valgusviljakus nii väike? | Hõõglamp on soojuslik valgusallikas: valgus tekib hõõgumisest ja enamik energiast lahkub soojusena. LED on külm allikas – ta teeb valgust ilma hõõgumata |
| rc-4 | concept | Mida ütleb pakendil olev arv 2700 K või 6500 K? | Valguse värvi: alla 3300 K soe valge (kollakas), 3300–5300 K neutraalne, üle 5300 K külm valge (sinakas). See EI ole lambi temperatuur |
| rc-5 | transfer | Kuidas leiad, mitu luumenit on 4 m² köögi tööpinnale vaja, kui soovitus on 300 lm ruutmeetri kohta? | Korruta pindala soovitusega: 4 · 300 = 1200 lm. LED-idega (100 lm/W) kulub selleks 12 W |
