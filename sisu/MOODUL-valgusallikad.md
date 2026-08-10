# Mooduli spetsifikatsioon: Valgusallikad

Ainekava seos (AINEKAVA-fyysika-8.md): plokk P1; õpitulemused: P1-T1 (osa:
soojuslikud ja külmad valgusallikad; punkt- vs laiendatud allikas);
mõisted, mida õpetab: punktvalgusallikas; praktiline töö: –.
Vanus: 8. klass. Kestused: demo 6 min, tund 15 min, iseseisev 12 min.
Tüüp: mikromoodul (üks õpieesmärk, 6 sammu).

slug: `valgusallikad` · id: `physics.valgusallikad`

## Ainekava seos (täpsemalt)

- **Plokk:** P1 Valgus ja valguse sirgjooneline levimine. Peegeldumine ja
  neeldumine
- **Õpitulemused:** P1-T1 **osa** – „tunneb erinevaid valgusallikaid;
  liigitab neid suuruse ja spektraalse koostise järgi". Kaks liigitust
  (soojuslik/külm ja punkt/laiendatud) katab see moodul; spektraalse
  koostise SISU (valge valgus, liitvalgus, spekter) on eraldi moodul
  `liitvalgus-ja-spekter`, lambi valimine on `lambivalik`.
- **Õppesisu punktid:** valgus kui energia; soojuslikud ja külmad
  valgusallikad; Päike, tähed
- **Põhimõisted, mida moodul ÕPETAB:** punktvalgusallikas
- **Praktiline töö:** – (P1-PT1 täis- ja poolvari on moodulis
  `vari-ja-poolvari`; siin varju servi EI õpetata)
- **Teema olulisus → hook:** „igapäevased valgusnähtused"; öine tänav –
  mis annab ise valgust ja mis ainult paistab
- **Metoodilised soovitused, mida järgin:** liigitamine on õpilase enda
  tegevus, mitte etteantud tabel; Päikese ja Maa energiabilanss (lühi- vs
  pikalaineline kiirgus) ühe teooria lõiguna – Päike kui elu võimaldaja
- **Õpilase tegevused:** (D) võrdleb ja liigitab valgusallikaid; (D) uurib
  simulatsiooniga, millal allikas on punktallikas; (K) kodulampide
  võrdlus jääb moodulisse `lambivalik`, taskulambi vaatlus teacher.ts-i

## Allikad

- **Teooria tugi:** `sisu/allikad/POHIVARA-F8-taielik.md` ptk 17 (17.2 kehad
  üle 600 °C kiirgavad nähtavat valgust; 17.3 kõrgem temperatuur → sinakam
  valgus; 17.4 külmade allikate kiirgus on luminestsents; punktvalgusallika
  definitsioon: mõõtmed väikesed VÕRRELDES KAUGUSEGA vaatluskohast) –
  kasutatud faktikontrolliks, tekst on oma sõnadega
- **Ülesannete näidised:** – (arvud on selle mooduli omad: näiv nurkmõõde
  arvutatakse iga ülesande juures model.ts kaudu läbi)

## Füüsika (model.ts jaoks)

Punktallikaks olemine EI ole keha omadus, vaid keha ja vaatluskoha
**suhte** omadus. Mõõdetav suurus on näiv nurkmõõde:

- `apparentSizeDeg(sizeM, distanceM) = 2 · atan(sizeM / (2 · distanceM))`
  kraadides (`sizeM` – allika mõõde m, `distanceM` – kaugus vaatluskohast m)
- `classifyBySize(angleDeg)` → `"point"`, kui nurkmõõde ≤ **1°**, muidu
  `"extended"`. Piir 1° on projekti KOKKULEPE (õpilasele öeldakse seda ka
  nii): sellest väiksema allika varjul on serv nii terav, et poolvarju
  praktikas ei märka. Piir elab model.ts konstandis `POINT_SOURCE_MAX_DEG`,
  mitte laiali sisufailides.
- `pointSourceDistance(sizeM) = sizeM / (2 · tan(0,5°))` – vähim kaugus,
  millelt antud mõõtmega allikas loeb punktallikaks (pöördülesanne)
- Definitsioonipiirkond: `sizeM > 0`, `distanceM > 0`; null või negatiivne
  viskab vea (funktsioon ei paranda sisendit vaikselt)
- Sim on IDEAALNE: väärtused tulevad mudelist täpselt, mõõtmismüra ei ole

**Testiväärtused (teadaolevad):**

| Allikas | mõõde | kaugus | nurkmõõde | liik |
|---|---|---|---|---|
| LED | 0,005 m | 1 m | 0,29° | punkt |
| hõõgniit | 0,01 m | 3 m | 0,19° | punkt |
| lambipirn | 0,08 m | 4 m | 1,15° | laiendatud |
| päevavalgustoru | 1,2 m | 2 m | 33,4° | laiendatud |
| aken | 1,5 m | 3 m | 28,1° | laiendatud |
| Päike | 1 392 000 km | 150 000 000 km | 0,53° | punkt |

Piirjuhud: mõõde = `2 · tan(0,5°) · kaugus` annab TÄPSELT 1° → `"point"`
(piir on kaasav); 2 m kaugusel on see 0,0349 m. `pointSourceDistance(1,2)`
= 68,8 m ja see kaugus peab `apparentSizeDeg`-i kaudu tagasi andma 1,0°
(edasi-tagasi test). Sisend 0 või −1 → viga.

## Sammud

### 1. hook – häälestus

Joonis (`figures.tsx`, silt `oo-linn`): öine tänav – tänavalamp, autotuled,
valgustatud aknad, Kuu, liiklusmärgi helkur.

„Öösel paistavad need kõik heledana. Aga ainult osa neist annab ise
valgust – ülejäänud ainult peegeldavad võõrast valgust. Kumb on Kuu?"

Eesmärk õpilase keeles: „Oskan öelda, mis liiki valgusallikaga on tegu."

### 2. theory – kaks liigitust (üks ekraan)

- **Valgusallikas** on keha, mis ise kiirgab valgust. Kuu, helkur ja
  peegel EI ole valgusallikad – nad peegeldavad Päikese või lambi valgust.
- **Spektraalse koostise järgi:**
  **soojuslikud** allikad kiirgavad, sest nad on kuumad (üle ~600 °C):
  Päike, tähed, küünlaleek, hõõglamp, tuli. Mida kuumem, seda sinakam
  valgus. **Külmad** allikad kiirgavad ilma kuumenemata (luminestsents):
  LED, päevavalguslamp, telefoniekraan, jaaniuss.
- **Suuruse järgi:** loeb näiv suurus, mitte päris mõõde. Kui allikas
  paistab meile kuni 1° suurusena, nimetame teda **punktvalgusallikaks**;
  muidu on ta laiendatud allikas. Sama lamp on kaugelt punktallikas ja
  lähedalt laiendatud allikas.
- **Päike kui elu võimaldaja** (2 lauset): Päikeselt jõuab Maale
  peamiselt lühilaineline kiirgus (sh nähtav valgus ja ultraviolett),
  Maalt lahkub tagasi pikalaineline soojuskiirgus. See sisse-välja
  tasakaal hoiab Maa temperatuuri elule sobivana.

### 3. predict – ennustus (lukustub!)

„Päike on Maast umbes 100 korda suurema läbimõõduga. Kumb ta meie jaoks
on?" (a) punktvalgusallikas (b) **laiendatud allikas** – nii arvab enamik
(c) ei kumbki + „Miks sa nii arvad?" (vabatekst).

Õige on (a): Päike on tohutu, aga ta on ka tohutult kaugel – näiv suurus
on ainult 0,53°. Vastust EI avaldata enne sammu 4.

### 4. explore – simulatsioon

SVG: vasakul valgusallikas (kollane ketas), paremal silm/vaatluskoht,
nende vahel kaugusnool. Kaks liugurit: **allika mõõde** 0,005–2 m
(logaritmiline) ja **kaugus** 0,5–80 m (ülemine ots peab ulatuma üle 69 m,
muidu ei ole ülesanne 1 lahendatav). Suurelt kuvatakse näiv suurus
kraadides ja silt „punktvalgusallikas" / „laiendatud allikas" (silt ei ole
ainus märk – kõrval on ka sõnaline lause, reegel: värv ei kanna infot
üksi). Nupurida päris näidetega: LED · lambipirn · päevavalgustoru ·
aken · Päike (Päike lülitab skaala kosmoseskaalale ja näitab 0,53°).

Ülesanded:

1. „Pane päevavalgustoru (1,2 m) 2 m kaugusele. Kas ta on punktallikas?"
   (ei, 33°) „Kaugenda, kuni silt muutub. Mis kaugusel see juhtus?"
   (≈ 69 m)
2. „Vali LED (5 mm) ja too ta 0,5 m kaugusele. Kas ta jääb punktallikaks?"
   (jääb: 0,57°)
3. „Vajuta nupule „Päike". Võrdle oma ennustusega sammust 3."

### 5. practice – harjutamine

1. **Näidis (lahendatud):** LED läbimõõt 5 mm = 0,005 m, kaugus 1 m.
   Näiv suurus = 2 · atan(0,005 / (2 · 1)) = 0,29° → kuni 1° →
   punktvalgusallikas.
2. **Osaline:** Lambipirn läbimõõt 0,08 m, kaugus 4 m. Näiv suurus =
   2 · atan(0,08 / (2 · ___)) = ___° (vastus 1,15°; tolerants 5%;
   järeldus: laiendatud allikas).
3. **Iseseisev (valik, mitu õiget):** Millised on külmad valgusallikad?
   **LED-lamp**, küünlaleek, **telefoniekraan**, hõõglamp, **jaaniuss**,
   Päike. `shuffle: true`.
4. **Iseseisev (arv):** Päikese läbimõõt on 1 392 000 km ja kaugus Maast
   150 000 000 km. Kui suur on tema näiv suurus? (0,53°; tolerants 5%;
   vihje 1: „mõlemad arvud on samades ühikutes – teisendama ei pea";
   vihje 2: „2 · atan(läbimõõt / (2 · kaugus))")
5. **Ülekanne (valik):** Selge ilmaga on inimese vari maapinnal terava
   servaga, pilvise ilmaga varju peaaegu ei olegi. Miks? (a) **pilvine
   taevas on hiiglaslik laiendatud allikas, Päike aga punktallikas**
   (b) pilved neelavad kogu valguse (c) pilvedes valgus ei levi sirgelt.

### 6. exit – väljumispilet

1. Punktvalgusallikas on allikas, mis… (a) **paistab vaatluskohast
   kuni 1° suurusena** (b) on väiksem kui 1 cm (c) annab ainult ühe kiire
2. Arvuta: lambipirn läbimõõduga 0,06 m tänavalambis 12 m kõrgusel. Näiv
   suurus ___° (0,29; tolerants 5%) – ja mis liiki allikaga on tegu?
3. „Nimeta üks valgusallikas oma kodust ja ütle, kas ta on soojuslik või
   külm." (vabatekst, õpetajale nähtav)

## Väärarusaamad

| Silt | Väärarusaam | Kuidas moodul selle ümber lükkab |
|---|---|---|
| `kuu-on-valgusallikas` | Kuu, helkur ja peegel annavad ise valgust | hook'i küsimus + teooria esimene lause (valgusallikas kiirgab ISE) |
| `suurus-ilma-kauguseta` | punktallikas tähendab lihtsalt väikest keha; Päike on suur, seega laiendatud | predict-samm Päikesega + simulatsioon: sama allikas muudab kaugusega liiki |
| `kulm-valgus-varvus` | „külm valgusallikas" tähendab sinakat valgust | teooria: külm = kiirgab kuumenemata (luminestsents); sinakas valgus tuleb hoopis KÕRGEST temperatuurist |
| `led-ei-soojene-uldse` | külm allikas ei soojene üldse | teooria sõnastus: külm allikas kiirgab valgust ilma hõõgumata, aga natuke soojust tekib igal lambil |

## Õpetajale (teacher.ts)

- **(K) vahendid:** taskulamp või telefonituli, hajuti (küpsetuspaberi leht
  või matt kilekott), pliiats, valge paberileht. Käik: hoia pliiatsit paberi
  kohal ja valgusta esmalt palja LED-iga (terav vari), siis hoia hajutit
  lambi EES õhus ja valgusta uuesti (udune vari). Küsi, kumb allikas oli
  punktallikale lähemal. Ohutus: **ei vaadata Päikesesse ega taskulambi
  LED-i otse**; hajutit **ei mähita lambi ümber ega kaeta lampi kinni**
  (kuum lamp + plast on tuleoht – CodeRabbiti leid 2026-08-10); laserit
  selles tunnis ei kasutata.
- **Aruteluküsimused:** Miks öeldakse, et Kuu „paistab"? Miks on
  operatsioonilambil palju väikeseid LED-e (varje ei teki)? Mis juhtuks,
  kui Maalt lahkuv soojuskiirgus jääks kinni?
- **Simulatsioon ENNE päris katset** – õpilane ennustab, kumb vari on
  teravam, ja kontrollib siis paberil.
- **Tunniplaan (15 min):** 2 min hook + teooria · 2 min ennustus ·
  4 min simulatsioon · 4 min harjutamine · 3 min väljumispilet.
  45-minutilises tunnis järgneb sellele `lambivalik` või
  `vari-ja-poolvari`.

## Kordamiskaardid (5 tk)

| id | tüüp | küsimus | vastus |
|---|---|---|---|
| rc-1 | concept | Mis on valgusallikas? | Keha, mis ise kiirgab valgust (Kuu ja helkur ei ole – nad peegeldavad) |
| rc-2 | concept | Millal nimetatakse allikat punktvalgusallikaks? | Kui tema mõõtmed on väikesed võrreldes kaugusega – näiv suurus kuni 1° |
| rc-3 | concept | Too näide soojuslikust ja külmast valgusallikast | Soojuslik: Päike, küünal, hõõglamp. Külm: LED, päevavalguslamp, jaaniuss |
| rc-4 | calc | LED läbimõõduga 5 mm on 1 m kaugusel. Näiv suurus ja liik? | 0,29° – punktvalgusallikas |
| rc-5 | transfer | Päike on hiiglaslik. Miks ta on meie jaoks ikkagi punktvalgusallikas? | Ta on väga kaugel: näiv suurus on ainult 0,53°, alla 1° piiri (piir on kaasav: ka täpselt 1° loeb punktallikaks) |
