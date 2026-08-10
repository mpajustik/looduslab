# Mooduli spetsifikatsioon: Päikese- ja kuuvarjutus

Ainekava seos (AINEKAVA-fyysika-8.md): plokk P1; õpitulemused: P1-T2 (osa:
varju ülekanne taevakehadele – varjutuse tekkimise joonis); mõisted, mida
õpetab: – (rakendusmoodul, kasutab moodulist `vari-ja-poolvari` tulnud
mõisteid täisvari ja poolvari); praktiline töö: –.
Vanus: 8. klass. Kestused: demo 6 min, tund 18 min, iseseisev 15 min.
Tüüp: rakendusmoodul (üks õpieesmärk, 6 sammu).

slug: `varjutused` · id: `physics.varjutused`

## Ainekava seos (täpsemalt)

- **Plokk:** P1 Valgus ja valguse sirgjooneline levimine. Peegeldumine ja
  neeldumine
- **Õpitulemused:** P1-T2 **osa** – „konstrueerib jooniseid" osa, mis puudutab
  Päikese-, Kuu- ja Maa varju joonist. Varjugeomeetria ise on moodulis
  `vari-ja-poolvari`; siin on ainult ÜLEKANNE taevakehadele. Kuu faasid on
  eraldi moodulis `kuu-faasid` – need EI ole vari (vt „Piirid" allpool).
- **Õppesisu punktid:** „vari ja varjutused" – varjutuste osa
- **Põhimõisted, mida moodul ÕPETAB:** – (rakendusmoodul ei oma ühtki
  põhimõistet; täisvari ja poolvari kuuluvad moodulile `vari-ja-poolvari`,
  ainekavas ei ole „päikesevarjutust" ega „kuuvarjutust" põhimõistete
  loendis)
- **Praktiline töö:** – (P1-PT1 on kaetud moodulis `vari-ja-poolvari`)
- **Teema olulisus → hook:** „igapäevased valgusnähtused looduses" kõige
  suuremas mõõtkavas – Eestis oli viimane peaaegu täielik päikesevarjutus
  1961 (88% Päikesest kaetud) ja järgmine täielik alles 2126. aastal.
- **Metoodilised soovitused, mida järgin:** ainekava nõuab varjutusi
  **kaartidega JA möödunud varjutuste videotega**. (D) kaardi lugemine on
  sammus 5 oma joonisel; (K) videod ja arutelu „miks on teekond kõver"
  lähevad teacher.ts-i.
- **Õpilase tegevused:** (D) joonestab/loeb Kuu- ja Päikesevarjutuse
  tekkimise joonist; (D) varjutuse teekonna kaardi lugemine; (K) arutelu,
  MIKS on varjutuse teekond kaardil kõver, mitte sirge; (K) möödunud
  varjutuste videod

### Piirid (mida see moodul EI tee)

- **Kuu faasid** – moodul `kuu-faasid`. Siin ainult üks lause piiri
  tõmbamiseks (samm 2), sest õpilane, kes varjutust õpib, paneb faasi ja
  varjutuse peaaegu alati kokku.
- **Täisvarju ja poolvarju geomeetria** – moodul `vari-ja-poolvari`. Siin
  eeldatakse, et need on läbitud (kursusefailis eelneb).
- **Miks Kuu paistab varjutuses punane** – nõuab murdumist ja hajumist
  (plokk P2). Mainin ühe lausega kui fakti, ei küsi ega kontrolli.

## Allikad

- **Teooria tugi:** `sisu/allikad/OPIK-F8-INDEKS.md` ptk 1.8 „Vari.
  Varjutused. Kuu faasid" (lk 27–30) – faktikontrolliks: päikesevarjutus
  tekib, kui Kuu jääb Maa ja Päikese vahele ning Maale langeb Kuu vari;
  täisvari tekib ainult väga väikeses piirkonnas, ümberringi on osaline
  varjutus; täielik päikesevarjutus kestab vaid mõni minut; kuuvarjutus
  tekib, kui Kuu jääb Maa varju, on nähtav umbes poolelt maakeralt ja võib
  kesta tunde; Eesti aastaarvud 1961 ja 2126. Tekst on oma sõnadega,
  ülesannete arvud on selle mooduli omad (vt ALLIKAD.md).
- **Ülesannete näidised:** – (kõik arvud tulevad model.ts konstantidest ja
  on siin esimest korda kokku pandud)

## Füüsika (model.ts jaoks)

Kogu moodul on mooduli `vari-ja-poolvari` valemite ülekanne kosmilistesse
mõõtudesse. **Sama geomeetria, uued arvud** – see ongi rakendusmooduli mõte.

Tähised (kõik kilomeetrites):

- `sourceDiameter` – valgusallika (Päikese) läbimõõt
- `bodyDiameter` – varju heitva keha (Kuu või Maa) läbimõõt
- `sourceToBody` – allikas → keha, keskpunktist keskpunkti
- `bodyToScreen` – keha → „ekraan" (Maa või Kuu pind), keskpunktist pinnani

Konstandid (eksporditud model.ts-ist, mitte laiali sisufailides):

| Konstant | Väärtus | Selgitus |
|---|---|---|
| `SUN_DIAMETER_KM` | 1 392 000 | Päikese läbimõõt |
| `MOON_DIAMETER_KM` | 3 474 | Kuu läbimõõt |
| `EARTH_DIAMETER_KM` | 12 742 | Maa läbimõõt |
| `EARTH_RADIUS_KM` | 6 371 | Maa raadius (pinna ja keskpunkti vahe) |
| `SUN_TO_EARTH_KM` | 149 600 000 | Maa keskmine kaugus Päikesest |
| `MOON_PERIGEE_KM` | 356 500 | Kuu lähim kaugus Maast (keskpunktide vahel) |
| `MOON_MEAN_KM` | 384 400 | Kuu keskmine kaugus |
| `MOON_APOGEE_KM` | 406 700 | Kuu kaugeim kaugus |

Funktsioonid:

- `umbraTipDistance(sourceDiameter, bodyDiameter, sourceToBody)`
  `= sourceToBody · bodyDiameter / (sourceDiameter − bodyDiameter)`, kui
  `sourceDiameter > bodyDiameter`; muidu `Number.POSITIVE_INFINITY`.
  See on **sama valem**, mis `umbraLengthBehindObject` moodulis
  `vari-ja-poolvari` – kui kaugele keha taha täisvarju koonus ulatub.
- `umbraWidthAtDistance(sourceDiameter, bodyDiameter, sourceToBody, bodyToScreen)`
  `= max(0, bodyDiameter − bodyToScreen · (sourceDiameter − bodyDiameter) / sourceToBody)`
  – täisvarju laius sellel kaugusel. Sama asi, mis `umbraWidth`
  moodulis `vari-ja-poolvari`, aga kirjutatud kujul „keha läbimõõt miinus
  see, mis ära on söödud". Sellest kujust on kohe näha, et **täisvari
  kahaneb ühtlaselt nullini täpselt tipus:**
  `= bodyDiameter · (1 − bodyToScreen / umbraTipDistance)`.
  **See teisendus kehtib ainult siis, kui `sourceDiameter > bodyDiameter`.**
  Kui allikas on kehast väiksem või sama suur, siis tippu ei tekigi
  (`umbraTipDistance` on lõpmatus) ja täisvari hoopis KASVAB kaugusega –
  siis kehtib ainult ülemine, `max`-iga valem. Selles moodulis on allikas
  alati Päike ja seega alati suurem, aga test peab mõlemat haru katma,
  et valem ei rändaks kunagi valesse konteksti (leidis CodeRabbit).
- `penumbraBandAtDistance(sourceDiameter, sourceToBody, bodyToScreen)`
  `= sourceDiameter · bodyToScreen / sourceToBody` – poolvarju riba laius
  ühel serval.
- `solarEclipseKind(moonEarthCentreDistance)` → `"total" | "annular"`.
  Täielik siis, kui täisvarju tipp jõuab Maa pinnani, s.t
  `umbraTipDistance(Päike, Kuu, SUN_TO_EARTH_KM) ≥ moonEarthCentreDistance − EARTH_RADIUS_KM`.
  Tagastab ingliskeelse sildi, eestikeelse teksti („täielik" /
  „rõngasjas") paneb peale Simulation.tsx – model.ts ei tea UI keelest
  midagi.
- Definitsioonipiirkond: kõik läbimõõdud ja kaugused `> 0`,
  `bodyToScreen > 0`. Muu sisend viskab vea.

**Miks valemid on siin uuesti, mitte imporditud moodulist
`vari-ja-poolvari`:** moodulid laaditakse dünaamiliselt ja iga moodul on
oma tükk (raudne reegel 13) – ristimport tõmbaks ühe mooduli teise
bundle'isse. Ühine `src/lib/optika.ts` oleks omaette arhitektuurisamm,
mida see ülesanne ei puuduta (raudne reegel 7). Kordus on teadlik ja seda
valvab test: mõlema mooduli valemid peavad samadel sisenditel andma sama
tulemuse (vt testiväärtus „kontroll vari-ja-poolvari vastu" allpool).

**Mudeli teadlikud lihtsustused** (need ütleb ka rakendus sammus 4 välja):

- Kiired langevad **risti** – Maa kumerust ja varjutuse kaldu langemist ei
  arvestata. Seepärast tuleb täisvarju laik mudelist veidi kitsam kui
  päris varjutuse laiim laik (~270 km); suurusjärk on õige.
- **Kuu orbiit ei ole Maa orbiidi tasandis** (kalle ~5°) – seda mudel ei
  kirjelda, sest liuguriga oleks see kolmemõõtmeline. Just seepärast
  räägib moodul kaldest SÕNADEGA (samm 2 ja väärarusaam
  `varjutus-igal-kuul`), mitte simulatsioonis.
- Orbiidid on ringid, varjutuse kestus arvutamata (fakt tuleb allikast).

**Testiväärtused (teadaolevad):**

| Juht | allikas | keha | allikas → keha | keha → ekraan | tulemus |
|---|---|---|---|---|---|
| Kuu täisvarju koonus | Päike | Kuu | 149 600 000 | – | `umbraTipDistance` = 374 289 km |
| Maa täisvarju koonus | Päike | Maa | 149 600 000 | – | `umbraTipDistance` = 1 382 050 km |
| täisvari Maa pinnal (Kuu lähimal) | Päike | Kuu | 149 600 000 | 350 129 | laius 224 km |
| täisvari Maa pinnal (Kuu kaugeimal) | Päike | Kuu | 149 600 000 | 400 329 | laius **0 km** (tipp jääb puudu) |
| Maa täisvari Kuu kaugusel | Päike | Maa | 149 600 000 | 384 400 | laius 9198 km |
| Maa poolvarju riba Kuu kaugusel | Päike | – | 149 600 000 | 384 400 | 3577 km |

`bodyToScreen` päikesevarjutuse juures on `MOON_* − EARTH_RADIUS_KM`
(356 500 − 6371 = 350 129 ja 406 700 − 6371 = 400 329) – ekraan on Maa
PIND, mitte keskpunkt. Kuuvarjutuse juures on ekraan Kuu ise, seega
keskpunktide vahe 384 400 (Kuu raadius on Maa varju laiuse kõrval
tühine – lihtsustus, mis on spetsis kirjas, et ta ei paistaks veaks).

Piirjuhtude ja tulemuste mõte lahti kirjutatult:

- **374 289 km vs Kuu kaugus:** Kuu täisvarju koonus lõpeb 374 289 km
  kaugusel. Kuu kaugus Maa pinnast kõigub 350 129 ja 400 329 km vahel –
  koonuse tipp jääb seega kord Maa SISSE (täielik varjutus, must laik
  liigub üle Maa), kord Maast puudu (rõngasjas varjutus – Kuu ei kata
  Päikest ära, servale jääb helendav rõngas). Piir on täpselt
  374 289 + 6371 = **380 660 km** keskpunktide vahel. Kuu keskmine kaugus
  384 400 km on sellest suurem – seepärast ongi rõngasjas varjutus veidi
  sagedasem kui täielik. See üksainus arv on kogu mooduli süda.
- **224 km:** kui koonus jõuab kohale, on tema jälg Maal ainult paarsada
  kilomeetrit lai – Eestist Riiani. Kõrval, poolvarjus, on osaline
  varjutus, ja seda näeb tuhandete kilomeetrite laiuselt. Siit tuleb
  vastus küsimusele, miks „päikesevarjutus" on korraga ühele riigile
  täielik ja teisele osaline.
- **1 382 050 km vs 9198 km:** Maa täisvarju koonus on peaaegu neli korda
  pikem kui Kuu kaugus, seega ei ole küsimustki, kas ta Kuuni jõuab. Kuu
  kaugusel on ta veel 9198 km lai ehk **2,6 korda laiem kui Kuu ise**
  (9198 / 3474 = 2,65). Kuu mahub tervenisti sisse ja jääb sinna tundideks
  – vastupidiselt paarile minutile päikesevarjutuse ajal.
- **Kontroll `vari-ja-poolvari` vastu:** test annab mõlema mooduli
  valemitele ühed ja samad väikesed arvud (`d = 0,1`, `s = 0,2`, `a = 1`)
  ja nõuab sama vastust. Nii ei saa üks moodul teisest märkamatult lahku
  minna. Ühikuid mudel ei tea – need on lihtsalt arvud.
- **Allikas kehast väiksem:** `umbraTipDistance(0,1; 0,2; 1)` = lõpmatus ja
  `umbraWidthAtDistance(0,1; 0,2; 1; 1)` = 0,3 (vari on kaugusega KASVANUD,
  mitte kahanenud). Astronoomias seda juhtu ei tule, aga funktsioon peab
  vastama õigesti, mitte lõpmatusega jagama.
- Vigased sisendid: läbimõõt `0` või negatiivne, `sourceToBody = 0`,
  `bodyToScreen ≤ 0` → viga.

## Sammud

### 1. hook – häälestus

Joonis (`figures.tsx`, silt `vj-eesti-varjutus`): Eesti kaardi kohal kaks
kuupäeva – 15.02.1961 „88% Päikesest kaetud" ja 2126 „järgmine täielik".
Vahel tühi 165-aastane joon.

„Kuu tiirleb ümber Maa iga 27 päeva tagant ja möödub iga kuu korra Maa ja
Päikese vahelt. Miks tuleb Eestisse täielik päikesevarjutus siis alles
2126. aastal?"

(Sõnastus on täpne meelega: Kuu EI ole kogu aeg vahel, vaid läheb vahelt
läbi korra kuus – uue kuu ajal. Kogu küsimus ongi selles, miks ei anna
see igakuine möödumine igakuist varjutust.)

Eesmärk õpilase keeles: „Oskan joonisega selgitada, kuidas tekivad Päikese-
ja kuuvarjutus, ja miks üks neist on haruldane ja teine tavaline."

### 2. theory – kes kelle varju jääb (üks ekraan)

- **Päikesevarjutus:** Kuu on Maa ja Päikese vahel. Varju heidab **Kuu**,
  vari langeb **Maale**. Kes on Kuu täisvarjus, sellele on Päike täiesti
  kadunud (täielik varjutus); kes on poolvarjus, sellele on Päikesest
  tükk ära söödud (osaline varjutus).
- **Kuuvarjutus:** Maa on Päikese ja Kuu vahel. Varju heidab **Maa**, vari
  langeb **Kuule**. Kuu ei kao ära, vaid tumeneb ja läheb punakaks (miks
  punakaks, seda uurime murdumise juures – plokk P2).
- **Miks siis mitte iga kuu?** Kuu rada on Maa raja suhtes viltu (umbes
  5°). Enamasti möödub Kuu vari Maast ülevalt või alt ja Kuu ise möödub
  Maa varjust – varjutus tuleb ainult siis, kui Kuu juhtub olema parajasti
  tasandite lõikekohas. Seepärast on varjutus haruldane, mitte igakuine.
- **Kuu faas ei ole varjutus.** Kahanev Kuu ei ole Maa vari Kuu peal –
  Kuud valgustab alati pool ja meie näeme sellest poolest kord rohkem,
  kord vähem. Sellega tegeleb moodul `kuu-faasid`.
- Joonis (`vj-kaks-varjutust`): kaks rida ühel joonisel. Ülemine –
  Päike, Kuu, Maa: Kuu tagant lähtub täisvarju koonus, mille terav ots
  puudutab Maad väikese täpina, ümber selle laiem poolvarju ala.
  Alumine – Päike, Maa, Kuu: Maa tagant lähtub palju jämedam koonus ja
  Kuu on selle sees tervenisti. **Joonis ei ole mõõtkavas** – see on
  joonisel kirjas.

### 3. predict – ennustus (lukustub!)

„Kuu kaugus Maast ei ole alati sama: ta kõigub 356 500 ja 406 700 km
vahel. Mis juhtub päikesevarjutusega siis, kui Kuu on parajasti oma
kaugeimas punktis?"

(a) varjutus on samasugune, ainult vari on väiksem
(b) **täisvari ei jõua Maani – Päike jääb Kuu ümber helendava rõngana
paistma**
(c) varjutust ei tule üldse, Kuu on liiga kaugel

+ „Miks sa nii arvad?" (vabatekst).

Õige on (b). Kuu täisvarju koonus on ~374 000 km pikk ja lõpeb siis enne
Maad ära. Koonuse teravik jääb õhku rippuma ja Maale tabab teda see osa,
kus koonus on juba läbi – seal on Kuu Päikesest väiksem paistma jäänud ja
tema serva ümbert paistab helendav rõngas. Vastust EI avaldata enne
sammu 4.

**Täpsustus sõnastuses (CodeRabbiti leid):** rõngast nähakse koonuse tipust
EDASI jäävas alas, mitte poolvarjus – see on eraldi piirkond (füüsikas
jätkuvari ehk *antumbra*). Terminit rakendusse EI tooda: ainekava
põhimõistetes teda ei ole ja neljas nimi ajaks 8. klassi õpilase segadusse.
Küll aga ei tohi kuskil öelda „täisvarju asemel jõuab Maale poolvari" –
see oleks vale. Õige sõnastus on „täisvari lõpeb enne Maad ära" +
„sealt, kus ta otsa sai, paistab Päike rõngana".

Vale (a) saab sildi `taisvari-ei-loppe` (täisvari lihtsalt kahaneb, aga on
alati olemas), vale (c) sildi `varjutus-koik-voi-mitte-midagi`.

### 4. explore – simulatsioon

SVG külgvaade: vasakul Päike (osa kettast, servast lähtuvad kiired),
keskel varju heitev keha, paremal teine keha. Täisvarju koonus on must,
poolvarju alad hallid. **Joonis ei ole mõõtkavas** – see on kirjas otse
joonisel, sest Päike on tegelikult 400 korda Kuust suurem ja
kaugused miljoneid kordi suuremad. Mõõtkavas oleks Kuu üks piksel.
Mudelist tulevad ARVUD, joonis on skeem.

Juhtnupud (kaks muudetavat suurust, moodulilepingu järgi):

- **valik: Päikesevarjutus / Kuuvarjutus** (kaks nuppu, mitte liugur) –
  vahetab, kumb keha varju heidab
- **liugur: Kuu kaugus Maast** 356 500–406 700 km, samm 1000 km,
  algväärtus 384 400 km (keskmine)

Kuvatakse suurelt:

- täisvarju koonuse pikkus (km)
- päikesevarjutuse režiimis: kas koonus **jõuab Maani** – tekstiga
  „täielik varjutus" või „rõngasjas varjutus: täisvari jääb ___ km
  puudu", ning täisvarju laik Maal (km). Kui täisvarju ei ole, on suure
  arvu asemel tekst „täisvarju Maal ei ole" – arv 0 üksi ei ole selge
  (sama reegel, mis moodulis `vari-ja-poolvari`). **Joonisel jääb sel
  juhul must koonus Maast lühemaks ja Maa pinnal on tema kohal oma
  tähistusega ala sildiga „Päike paistab rõngana"** – seda ala EI tohi
  värvida ega sildistada poolvarjuks (vt sammu 3 täpsustust).
- kuuvarjutuse režiimis: Maa täisvarju laius Kuu kaugusel (km) ja selle
  kõrval Kuu läbimõõt võrdluseks.

Tolerantsid ja ühikud: pikkused ja laiused `km`; koonuse pikkus ja Maa
varju laius tolerantsiga 5%; täisvarju laik Maal tolerantsiga **10%**,
sest ta on kahe suure arvu vahe ja liuguri samm 1000 km liigutab teda
kohe mitu protsenti; kaugused `km` tolerantsiga **absoluutne ±5000 km**
(liuguri samm on 1000 km, protsent oleks siin kasutu).

Ülesanded:

1. „Vaata päikesevarjutust. Kui pikk on Kuu täisvarju koonus?"
   (374 289 km; tolerants 5%; ühik `km`) — kontrollküsimus: see arv EI
   sõltu liugurist, sest koonuse pikkus tuleb ainult Päikese ja Kuu
   suurusest.
2. „Lohista Kuu lähimasse punkti (356 500 km). Kui lai on täisvarju laik
   Maal?" (224 km; tolerants 10%; ühik `km`; vihje 1: „koonuse ots on
   terav – kui sügavale ta Maa pinnast sisse jõuab?"; vihje 2: „Maa pind
   on 6371 km lähemal kui Maa keskpunkt")
3. „Lohista Kuu aeglaselt kaugemale. Millisel kaugusel muutub varjutus
   täielikust rõngasjaks?" (380 660 km; tolerants ±5000 km; ühik `km`;
   vihje: „see on koht, kus täisvarju laik jääb nulli")
4. „Vaheta kuuvarjutusele. Kumb väide on õige?" (valik)
   (a) Maa täisvari on Kuu kaugusel umbes sama lai kui Kuu
   (b) **Maa täisvari on Kuu kaugusel üle kahe korra laiem kui Kuu**
   (c) Maa täisvari lõpeb enne Kuud ära, nagu Kuu oma enne Maad

### 5. practice – harjutamine

1. **Näidis (lahendatud):** Miks kestab täielik päikesevarjutus ainult
   mõne minuti, kuuvarjutus aga tunde? Täisvarju laik Maal on ~200 km lai
   ja Kuu vari libiseb üle Maa tuhande kilomeetriga tunnis – ühest kohast
   käib ta mõne minutiga läbi. Maa täisvari on Kuu kaugusel 9198 km lai,
   Kuu ise ainult 3474 km – Kuul kulub sellest läbiminekuks tunde.
2. **Osaline:** Kui palju kordi on Maa täisvari Kuu kaugusel laiem kui Kuu
   ise? Täida: 9198 / 3474 = ___ (vastus 2,6; tolerants 5%; ühikuta;
   vihje 1: „jaga varju laius Kuu läbimõõduga"; vihje 2: „vastus on veidi
   üle kahe")
3. **Iseseisev (kaardilugemine):** Joonis (`vj-varjutuse-rada`): oma
   skemaatiline maailmakaart, millel kulgeb kitsas tume riba üle
   mandrite ja selle ümber palju laiem hall ala; kolm punkti on
   tähistatud – A tumeda riba peal, B halli ala peal, C väljaspool.
   Küsimus: „Mida näeb inimene punktis B?" (a) täielikku varjutust
   (b) **osalist varjutust – Päikesest on tükk kaetud** (c) mitte midagi
   erilist. Vihje: „tume riba on täisvari, hall ala poolvari".
4. **Iseseisev (arv):** Kui Kuu oleks 340 000 km kaugusel Maa
   keskpunktist, kas varjutus oleks täielik või rõngasjas? Kui suur on
   täisvarju laik? (täielik; laik 377 km; tolerants 10%; ühik `km`;
   vihje: „Maa pind on 340 000 − 6371 = 333 629 km kaugusel, koonus on
   374 289 km pikk").
5. **Ülekanne (valik, mitu õiget):** Millised väited on õiged?
   **täieliku päikesevarjutuse ajal on Kuu Maa ja Päikese vahel**,
   kuuvarjutuse ajal on Kuu Maa ja Päikese vahel,
   **kuuvarjutust näeb korraga umbes pool maakera**,
   täielikku päikesevarjutust näeb korraga umbes pool maakera,
   **varjutust ei tule iga kuu, sest Kuu rada on viltu**.
   `shuffle: true`. Vale „kuuvarjutuse ajal on Kuu vahel" saab sildi
   `varjutused-segamini`; vale „täielikku päikesevarjutust näeb pool
   maakera" saab sildi `taisvari-on-suur`.

### 6. exit – väljumispilet

1. Päikesevarjutuse ajal langeb… (a) Maa vari Kuule (b) **Kuu vari
   Maale** (c) Kuu vari Päikesele
2. Arvuta: Kuu täisvarju koonus on 374 289 km pikk. Kuu keskpunkt on
   Maa keskpunktist 395 000 km kaugusel. Kui palju jääb täisvarjul Maa
   pinnani puudu? (14 340 km; tolerants 5%; ühik `km`; vihje: „Maa pind
   on 6371 km lähemal kui keskpunkt")
3. „Kuu tiirleb ümber Maa iga 27 päeva tagant. Selgita, miks ei ole siis
   iga kuu ühte päikesevarjutust ja ühte kuuvarjutust." (vabatekst,
   õpetajale nähtav – oodatav mõte: Kuu rada on Maa raja tasandi suhtes
   viltu, seega möödub Kuu vari enamasti Maast mööda ja Kuu möödub Maa
   varjust; varjutus tuleb ainult siis, kui Kuu on parajasti tasandite
   lõikejoonel)

## Väärarusaamad

| Silt | Väärarusaam | Kuidas moodul selle ümber lükkab |
|---|---|---|
| `varjutused-segamini` | päikesevarjutuse ajal langeb Maa vari Kuule (või vastupidi) | teooria ja joonis `vj-kaks-varjutust` nimetavad iga kord eraldi, KES heidab varju ja KELLELE see langeb; exit-1 ja practice-5 kontrollivad |
| `varjutus-igal-kuul` | kuna Kuu tiirleb ümber Maa iga kuu, peaks ka varjutus olema igakuine | teooria: Kuu rada on ~5° viltu, vari möödub enamasti Maast; hook ja exit-3 küsivad seda otse |
| `taisvari-ei-loppe` | täisvari ulatub lõpmatuseni, kaugusega läheb ainult väiksemaks | explore-1 ja -3: koonusel on tipp 374 289 km peal, pärast seda ei ole täisvarju ÜLDSE (sama tulemus tuli juba moodulis `vari-ja-poolvari` laia lambiga) |
| `taisvari-on-suur` | täielikku päikesevarjutust näeb korraga terve maakera või vähemalt pool | explore-2: laik on ~200 km lai; practice-3 kaardil on riba kitsas ja poolvari lai |
| `varjutus-koik-voi-mitte-midagi` | varjutus kas on või ei ole, vahepealseid ei ole | explore: kolm ala (täisvari, poolvari, valgus) → täielik, osaline, rõngasjas varjutus |
| `kuu-faas-on-vari` | kahanev Kuu on Maa vari Kuu peal | teooria tõmbab piiri ühe lausega; päriselt lükkab ümber moodul `kuu-faasid` (kus on ka simulatsioon) |

## Õpetajale (teacher.ts)

- **(K) möödunud varjutuste videod** (ainekava metoodiline rõhk): näidake
  klassile täieliku päikesevarjutuse videot, kus on kuulda inimeste
  reaktsiooni ja näha, kuidas päev muutub hämarikuks paari sekundiga.
  Kõrvale kuuvarjutuse timelapse. Küsimus enne vaatamist: „jälgi, kui
  kaua täielik faas kestab" – päikesevarjutusel minutid, kuuvarjutusel
  tunnid.
- **(K) arutelu: miks on varjutuse teekond kaardil kõver, mitte sirge?**
  Kuu vari liigub sirgjooneliselt, aga ta joonistab jälje **kerale**, mis
  ise samal ajal pöörleb. Sirge tee kera pinnal näeb lamedal kaardil välja
  kõverana – samamoodi nagu lennuki lühim tee Tallinnast New Yorki
  kaardil kaarena. Hea kõrvutus: näidake sama teekonda maakeral ja
  kaardil.
- **(K) varjutuste kaardi otsimine:** otsige klassiga, millal on järgmine
  varjutus Eestist nähtav, ja kui suur osa Päikesest siis kaetud on.
  Rakenduse samm 5 harjutab kaardi lugemist skemaatilisel joonisel; päris
  kaart on internetis ja muutub, seepärast ei ole ta rakendusse sisse
  kirjutatud.
- **OHUTUS (kõige tähtsam selle teema juures):** Päikesesse EI vaadata
  palja silmaga, päikeseprillidega, suitsuklaasiga, röntgenfilmiga ega
  läbi teleskoobi/binokli. Ainus lubatud vahend on varjutusprillid
  standardiga ISO 12312-2 või kaudne vaatlus (auguga papp, mis projitseerib
  Päikese kujutise teisele papile). Osalise varjutuse ajal on Päike sama
  ohtlik kui tavaliselt – hämaram taevas petab silma, aga kiirgus ei kao.
  Kuuvarjutust võib vaadata täiesti vabalt, ka binokliga.
- **Kaudne vaatlus klassis (K, kui varjutus juhtub):** tehke papitükki
  nõelaga auk ja laske Päikese kujutis langeda valgele paberile. Sama
  nähtus, mis moodulis `valguse-sirgjooneline-levimine` – ja varjutuse
  ajal on kujutis poolkuu kujuline. Puu lehtede vahelt langeb varjutuse
  ajal maha sadu poolkuukujulisi laike, iga leheauk on üks auguga papp.
- **Aruteluküsimused:** Kui Kuu oleks kaks korda kaugemal, kas täielikku
  päikesevarjutust saaks üldse olla? Miks on suur õnn, et Kuu paistab
  taevas peaaegu täpselt sama suur kui Päike? Mida näeb Kuu peal seisev
  astronaut siis, kui Maal on kuuvarjutus? (Vastus: päikesevarjutust –
  Maa katab tema jaoks Päikese ära.)
- **Millal see moodul tunnis:** PÄRAST moodulit `vari-ja-poolvari` –
  kogu arvutus on selle ülekanne. Enne moodulit `kuu-faasid`, sest faasi
  ja varjutuse eristamine on lihtsam siis, kui varjutus on värskelt läbi
  võetud.
- **Tunniplaan (18 min):** 2 min hook + teooria · 2 min ennustus ·
  6 min simulatsioon · 5 min harjutamine (sh kaardilugemine) ·
  3 min väljumispilet.

## Kordamiskaardid (5 tk)

| id | tüüp | küsimus | vastus |
|---|---|---|---|
| rc-1 | concept | Kes heidab varju ja kellele see langeb päikesevarjutuse ajal? | Kuu heidab varju, vari langeb Maale (Kuu on Maa ja Päikese vahel) |
| rc-2 | concept | Mis vahe on täielikul ja rõngasjal päikesevarjutusel? | Täieliku ajal jõuab Kuu täisvarju koonuse tipp Maani; rõngasja ajal jääb koonus lühikeseks, sest Kuu on kaugemal, ja Päike paistab Kuu ümber rõngana |
| rc-3 | calc | Kuu täisvarju koonus on 374 289 km pikk. Kuu keskpunkt on 384 400 km kaugusel Maa keskpunktist. Kas varjutus on täielik? | Maa pind on 384 400 − 6371 = 378 029 km kaugusel, koonus 374 289 km – jääb ~3700 km puudu, seega rõngasjas |
| rc-4 | selgitus | Miks näeb kuuvarjutust korraga pool maakera, päikesevarjutust aga ainult kitsas riba? | Maa täisvari on Kuu kaugusel 9198 km lai ja katab Kuu tervenisti (Kuu on 3474 km); Kuu täisvari on Maal ainult ~200 km lai laik |
| rc-5 | transfer | Miks ei ole varjutust iga kuu, kuigi Kuu tiirleb ümber Maa iga 27 päeva tagant? | Kuu rada on Maa raja tasandi suhtes ~5° viltu – enamasti möödub vari Maast ülevalt või alt; varjutus tuleb ainult tasandite lõikekohas |
