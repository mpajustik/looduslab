# Mooduli spetsifikatsioon: Täisvari ja poolvari

Ainekava seos (AINEKAVA-fyysika-8.md): plokk P1; õpitulemused: P1-T2 (osa:
varju joonis ja varju servade seaduspärasus); mõisted, mida õpetab:
täisvari, poolvari; praktiline töö: P1-PT1 (simulatsioon + päris katse
juhend õpetajale).
Vanus: 8. klass. Kestused: demo 7 min, tund 20 min, iseseisev 15 min.
Tüüp: virtuaalne labor (üks õpieesmärk, 6 sammu).

slug: `vari-ja-poolvari` · id: `physics.vari-ja-poolvari`

## Ainekava seos (täpsemalt)

- **Plokk:** P1 Valgus ja valguse sirgjooneline levimine. Peegeldumine ja
  neeldumine
- **Õpitulemused:** P1-T2 **osa** – „tunneb valguse sirgjoonelise levimise ja
  peegeldumise seadust, konstrueerib nende põhjal jooniseid ja korraldab
  katsed". Siin on ainult SIRGJOONELISE LEVIMISE tagajärg: täisvari ja
  poolvari, nende joonis ja mõõtmed. Levimine ise on moodulis
  `valguse-sirgjooneline-levimine`, varju ülekanne taevakehadele moodulis
  `varjutused-ja-kuu-faasid`, peegeldumisseadus moodulis
  `peegeldumisseadus`.
- **Õppesisu punktid:** sirgjooneline levimine; vari ja varjutused (varju
  osa; varjutused ise on eraldi moodul)
- **Põhimõisted, mida moodul ÕPETAB:** täisvari, poolvari
- **Praktiline töö:** **P1-PT1** täis- ja poolvarju uurimine – MÕLEMAL kujul:
  simulatsioon sammus 4 (hüpotees → mõõtmine → järeldus) ja päris katse
  juhend õpetajale (teacher.ts)
- **Teema olulisus → hook:** „igapäevased valgusnähtused looduses" – oma vari
  asfaldil: jalgade juures on serv terav, pea juures hägune
- **Metoodilised soovitused, mida järgin:** ainekava nõuab varju uurimist
  **hüpoteesiga** – ennustus lukustub enne simulatsiooni; joonis eri
  olukordades, mitte ainult teooria (õpilane loeb kiirte jooniselt, kust
  täisvari lõpeb)
- **Õpilase tegevused:** (D+K) täis- ja poolvarju uurimine hüpoteesiga –
  (D) simulatsioon siin, (K) päris katse taskulambi ja palliga teacher.ts-is;
  (D) joonestab/loeb täis- ja poolvarju tekkimise joonist

## Allikad

- **Teooria tugi:** `sisu/allikad/POHIVARA-F8-taielik.md` ptk 17 (täisvari on
  ruumi piirkond, kuhu ei lange ühtki valguskiirt; 17.8 punktallika korral
  tekib läbipaistmatu keha taha koonusekujuline täisvari; 17.9
  mittepunktvalgusallika korral tekib ka osaliselt valgustatud piirkond ehk
  poolvari; joon. 46 ja 47) – kasutatud faktikontrolliks, tekst on oma
  sõnadega
- **Ülesannete näidised:** – (kõik arvud on selle mooduli omad; kordumine
  mooduliga `valgusallikad` on teadlik: sealt tuleb mõiste
  punktvalgusallikas, siin on ta liuguri väärtus „laius 0")

## Füüsika (model.ts jaoks)

Kogu moodul on ühe lause tagajärg: **valgus levib sirgjooneliselt, seega on
varju piir see koht, kust allikat enam ei paista.** Kolm suurust tulevad
sirgetest joontest, mitte nurkadest (8. klassi matemaatika – jagamine ja
korrutamine, vt sammu 4.1d otsus).

Tähised (kõik meetrites, kõik kaugused mõõdetud ALLIKAST):

- `d` – keha (palli) läbimõõt
- `s` – allika laius; `s = 0` tähendab punktvalgusallikat
- `a` – allikas → keha
- `b` – allikas → ekraan, alati `b > a`

Funktsioonid:

- `umbraWidth(d, s, a, b) = max(0, (d·b − s·(b − a)) / a)` – **täisvarju**
  laius ekraanil. Punktallikaga (`s = 0`) taandub see kujule `d·b/a` ehk
  „vari kasvab sama palju kordi, kui palju kordi on ekraan kaugemal kui
  keha". Iga lisatud sentimeeter allika laiust SÖÖB täisvarju.
- `penumbraBandWidth(s, a, b) = s·(b − a) / a` – **poolvarju** riba laius
  ÜHEL serval (vasakul ja paremal on ta ühesugune). Punktallikaga on ta 0 –
  see ongi põhjus, miks punktallikas annab teravaservalise varju.
- `totalShadowWidth(d, s, a, b) = (d·b + s·(b − a)) / a` – kogu tumeda ala
  laius, täisvari + mõlemad poolvarju ribad. Seos, mida test valvab:
  `totalShadowWidth = umbraWidth + 2 · penumbraBandWidth` **niikaua, kuni
  täisvari on olemas**; pärast täisvarju kadumist annab `umbraWidth` nulli
  ja seos enam ei kehti (see on teadlik – nulliga piiramine on õpilase
  huvides, „−10 cm laiune täisvari" ei tähenda midagi).
- `umbraLengthBehindObject(d, s, a) = a · d / (s − d)`, kui `s > d`; muidu
  `Number.POSITIVE_INFINITY` – **kui kaugele keha taha täisvari ulatub**.
  Laiendatud allika korral lõpeb täisvari teravikuga; kui allikas on kehast
  väiksem või sama lai, ei lõpe täisvari kunagi (`s = d` korral on ta
  silinder – täpselt keha laiune, seda kontrollib eraldi test).
- Definitsioonipiirkond: `d > 0`, `a > 0`, `b > a`, `s ≥ 0` (null on lubatud
  ja tähendab punktallikat). Muu sisend viskab vea – funktsioon ei paranda
  sisendit vaikselt.
- Sim on IDEAALNE: väärtused tulevad mudelist täpselt, mõõtmismüra ei ole.
  Päris mõõtmise hajuvus kuulub päris katsesse (teacher.ts).

**Testiväärtused (teadaolevad):**

| Juht | d | s | a | b | täisvari | poolvari (1 serv) | kokku |
|---|---|---|---|---|---|---|---|
| punktallikas | 0,1 m | 0 | 1 m | 3 m | 0,3 m | 0 | 0,3 m |
| väike lamp | 0,1 m | 0,05 m | 1 m | 3 m | 0,2 m | 0,1 m | 0,4 m |
| lai lamp | 0,1 m | 0,2 m | 1 m | 3 m | **0 m** | 0,4 m | 0,7 m |
| allikas = keha | 0,1 m | 0,1 m | 1 m | 5 m | 0,1 m | 0,4 m | 0,9 m |
| ekraan keha juures | 0,1 m | 0,2 m | 1 m | 1,01 m | 0,099 m | 0,002 m | 0,103 m |

Piirjuhtude mõte lahti kirjutatult:

- **lai lamp:** `(0,1·3 − 0,2·2)/1 = −0,1` → piiratakse nulliga. Täisvari on
  otsa saanud juba enne ekraanit, alles on ainult poolvari. Kogu vari on
  siiski 0,7 m – hägune laik, mille keskel ei ole ühtki päris tumedat kohta.
- **allikas = keha:** täisvari on täpselt keha laiune (0,1 m) ükskõik millisel
  kaugusel – kontrollib, et valem annab silindri, ja
  `umbraLengthBehindObject(0.1, 0.1, 1) = Infinity`.
- **ekraan keha juures:** kui ekraan on peaaegu vastu keha, on vari peaaegu
  keha suurune ja poolvarju riba peaaegu olematu – nii ongi jalgade juures
  asfaldil.

Täisvarju ulatus: `umbraLengthBehindObject(0.1, 0.2, 1) = 1 · 0,1 / 0,1 =
1 m` (allikast mõõtes lõpeb täisvari 2 m peal – sama koht, mille sim annab
`umbraWidth(0.1, 0.2, 1, 2) = 0`; edasi-tagasi test).
`umbraLengthBehindObject(0.1, 0.3, 1) = 0,5 m`.
Vigased sisendid: `d = 0`, `a = 0`, `s = −1`, `b = a`, `b < a` → viga.

## Sammud

### 1. hook – häälestus

Joonis (`figures.tsx`, silt `vp-oma-vari`): päikesepaisteline asfalt, inimese
vari; jalgade juures on varju serv nuga-terav, pea kohal on serv laiaks
määrdunud ja hägune. Kõrval kaks suurendust samast varjust.

„Sama vari, sama Päike – miks on jalgade serv terav ja pea serv hägune?"

Eesmärk õpilase keeles: „Tean, miks varjul on kaks osa, ja oskan välja
arvutada, kui lai on täisvari."

### 2. theory – kaks varju osa (üks ekraan)

- **Täisvari** on see osa varjust, kuhu ei jõua allikast ühtki valguskiirt.
  Kui seisaksid täisvarjus ja vaataksid lambi poole, ei näeks sa lambist
  mitte midagi – keha katab selle täielikult kinni.
- **Poolvari** on osa, kuhu jõuab valgus allika ühest osast, aga mitte
  teisest. Poolvarjus seistes paistaks lambist tükk ära, ülejäänu oleks keha
  taga peidus. Just seepärast on poolvari heledam kui täisvari ja muutub
  ühtlaselt heledamaks, mida kaugemale servast minna.
- **Punktvalgusallikas** (moodulist `valgusallikad`) annab AINULT täisvarju –
  poolvarju pole kellelgi tekitada, sest allikal ei ole „teist serva".
  Poolvari on laiendatud allika tunnus.
- Joonis (`vp-taisvari-poolvari`): lambike laiusega `s`, tee peal pall,
  paremal ekraan. Kaks kiirt allika ülemisest servast ja kaks alumisest –
  näha on, kuidas neli kiirt lõikavad ekraani kolmeks: keskel täisvari,
  mõlemal pool poolvarju riba, siis valgus.

### 3. predict – hüpotees (lukustub!)

„Taskulamp valgustab palli, pall heidab varju seinale. Nüüd vahetame
taskulambi sisselülitatud valge teleriekraani vastu, mis on palju laiem, aga
sama kaugel ja sama ere. Mis juhtub täisvarjuga seinal?"

(a) läheb laiemaks (b) **läheb kitsamaks või kaob hoopis** (c) jääb samaks,
ainult serv läheb hägusaks
+ „Miks sa nii arvad?" (vabatekst).

Õige on (b): laia allika iga serv „paistab" palli tagant natuke mööda, seega
sööb allika laius täisvarju mõlemalt poolt. Vastust EI avaldata enne sammu 4.

Nii (a) kui ka (c) saavad sildi `laiem-allikas-laiem-vari`: mõlema juur on
sama – allika laiust ei seostata täisvarju laiusega – ja lahendus on neil
sama (explore-2 ja explore-3). Õpetajajuhend kirjeldab mõlemat varianti ühe
kirje all.

### 4. explore – virtuaalne labor (P1-PT1)

SVG külgvaates: vasakul allikas (helendav riba, kõrgus muudetav), keskel must
pall, paremal ekraan. Neli kiirt (allika mõlemast servast mõlema palliserva
poole) jagavad ekraani kolmeks alaks: **täisvari** (must), **poolvari**
(halli üleminekuga triibud) ja valgustatud osa. Iga ala kohal on mõõdulint
oma laiusega. **Kaugused on joonisel õiges suhtes** (erinevalt moodulist
`valguse-sirgjooneline-levimine` mahub siin kogu skaala 0,5–5 m korraga
ekraanile).

Liugurid:

- **allika laius** 0–40 cm, samm 1 cm (0 = punktallikas, sildiga)
- **allikas → ekraan** (`b`) 1,2–5 m, samm 0,1 m
- **allikas → pall** (`a`) 0,5–1 m, samm 0,1 m – AVANEB alles pärast
  ülesannet 2 (silt `palli-kaugus`; moodulileping: alguses maksimaalselt kaks
  muudetavat suurust); algväärtus 1 m

**Vahemikud on valitud nii, et `b > a` on alati täidetud** (`a` suurim
väärtus 1 m, `b` vähim 1,2 m) – nii ei pea Simulation.tsx liugureid
teineteise järgi piirama ega mudeli viga kinni püüdma. Kui vahemikke kunagi
muudetakse, tuleb see tingimus üle kontrollida: `model.ts` viskab `b ≤ a`
korral vea, sest ekraan ei saa olla keha ees.

Palli läbimõõt on kogu mooduli vältel **10 cm** ja seda ei saa muuta – nii
jääb ülesannetes muutuma ainult see, mida parajasti uuritakse.

Suurelt kuvatakse **täisvarju laius sentimeetrites**, selle all sama suurelt
poolvarju riba laius. Kui täisvari on kadunud, on suure arvu asemel tekst
„täisvarju ei ole" – arv 0 üksi ei ole piisavalt selge, ja joonisel kaob
must ala päriselt ära (reegel: värv ega üks silt ei kanna infot üksi).

Tolerantsid ja ühikud: laiused `cm`, tolerants 5%; kaugused `m`, tolerants
**absoluutne ±0,1 m**. Põhjus on sama, mis moodulis
`valguse-sirgjooneline-levimine`: liuguri samm on 0,1 m ja 5% kahest meetrist
oleks 0,1 m ehk täpselt üks samm – protsent ei jätaks õpilasele mänguruumi.

Ülesanded:

1. „Sea allika laiuseks 0 (punktvalgusallikas) ja ekraan 3 m kaugusele. Kui
   lai on täisvari?" (30 cm) — kontrollküsimusena on poolvarju riba 0 cm ja
   seda näitab sim ise.
2. „Jäta ekraan 3 m peale ja tee allikas 5 cm laiuseks. Kui lai on nüüd
   täisvari?" (20 cm; vihje 1: „vaata, kas täisvari läks laiemaks või
   kitsamaks kui punktallikaga"; vihje 2: „iga allika serv sööb täisvarju
   omalt poolt")
3. „Sea allika laiuseks 20 cm (allikas on nüüd pallist laiem), **too ekraan
   tagasi 1,2 m peale** ja nihuta seda siis aeglaselt kaugemale. Millisel
   kaugusel täisvari kaob?" (2 m; tolerants ±0,1 m; ühik `m`)
   **NB! Ekraani tagasitoomine on ülesande osa, mitte kaunistus:** pärast
   ülesannet 2 on ekraan 3 m peal ja 20 cm laia allikaga on täisvari seal
   juba kadunud – kaugemale nihutades ei näekski õpilane üleminekut. 1,2 m
   peal on täisvari veel olemas (8 cm) ja kaob teel 2 m juurde.
4. „Jäta allikas 20 cm laiaks ja ekraan 3 m peale. Too nüüd pall allikale
   lähemale (0,5 m). Mis juhtub?" (valik) (a) täisvari tuleb tagasi
   (b) **täisvari jääb kadunuks ja poolvari läheb veel laiemaks** (c) vari
   kaob täiesti ära

### 5. practice – harjutamine

1. **Näidis (lahendatud):** Punktallikas, pall 10 cm, pall 1 m kaugusel
   allikast, ekraan 4 m kaugusel. Ekraan on 4 korda kaugemal kui pall, seega
   on täisvari 4 korda laiem kui pall: 10 · 4 / 1 = 40 cm. Poolvarju ei ole,
   sest allikal ei ole laiust.
2. **Osaline:** Lamp on 6 cm lai. Pall on 10 cm läbimõõduga ja 1 m kaugusel
   lambist, ekraan 3 m kaugusel lambist. Kui lai on täisvari? Täida:
   (0,1 · 3 − 0,06 · 2) / 1 = ___ m
   (vastus 0,18 m ehk 18 cm; tolerants 5%; ühik `m`; vihje 1: „punktallikas
   annaks 0,3 m – kui palju allika laius sellest ära sööb?"; vihje 2: „allika
   laius sööb täisvarjust täpselt ühe poolvarju riba jagu: 0,12 m").
   Vihje 2 arv tuleb `penumbraBandWidth`-ist, mitte sisufailis korrutamisest:
   kaotatud täisvari ON täpselt ühe poolvarju riba laius (`s·(b − a)/a`).
3. **Iseseisev (valik):** Miks on jalgade vari asfaldil terav ja pea vari
   hägune? (a) **pea on maapinnast kaugemal, seega on poolvarju riba seal
   laiem** (b) pea on ümmargune ja jalad teravad (c) Päikese valgus jõuab
   maani tugevamalt kui peani.
4. **Iseseisev (arv):** Lamp on 30 cm lai, pall 10 cm läbimõõduga on 1 m
   kaugusel lambist. Kui kaugele palli taha ulatub täisvari? (0,5 m;
   tolerants 5%; ühik `m`; vihje: „1 · 0,1 / (0,3 − 0,1)").
5. **Ülekanne (valik, mitu õiget):** Millistel juhtudel on varju serv PEAAEGU
   terav (poolvari väga kitsas)? **väike LED-taskulamp pimedas toas**,
   pilvine päev õues, **käsi otse vastu lauda päikesepaistes**, valge lae
   alla peidetud lai valgusriba, **täht öötaevas kui allikas**.
   `shuffle: true`. Mõlemad valed variandid (pilvine päev, lai valgusriba)
   saavad sildi `laiem-allikas-laiem-vari`: õpilane ei seosta allika laiust
   serva laiusega. `punktallikas-annab-poolvarju` siia EI sobi – kes usub, et
   igal varjul on hägune serv, see ei valikski pilvist päeva „teravaks".

### 6. exit – väljumispilet

1. Poolvari on koht, kus… (a) valgust on täpselt pool sellest, mis
   valgustatud alal (b) **allikast paistab osa ja ülejäänu on keha taga
   peidus** (c) vari on poolik, sest keha on läbipaistev
2. Arvuta: punktvalgusallikas, keha läbimõõt 5 cm, keha 0,5 m kaugusel
   allikast, ekraan 2 m kaugusel allikast. Kui lai on täisvari? (0,2 m ehk
   20 cm; tolerants 5%; ühik `m`)
3. „Pilvise ilmaga ei ole inimesel õues peaaegu üldse varju. Selgita, miks."
   (vabatekst, õpetajale nähtav – oodatav mõte: pilvekiht ise on hiiglaslik
   laiendatud allikas, valgus tuleb igast suunast, seega täisvarju ei teki ja
   poolvari on nii lai, et laiali määrdunud)

## Väärarusaamad

| Silt | Väärarusaam | Kuidas moodul selle ümber lükkab |
|---|---|---|
| `vari-on-asi` | vari on midagi, mis kehast välja tuleb või kehal küljes on | teooria: vari on ruumi piirkond, kuhu valgus ei jõua – varju „ei tehta", vaid valgus jääb tulemata |
| `poolvari-on-pool` | poolvari on pool varjust või poolik täisvari | teooria + exit-1: poolvari on ala, kust paistab allika ÜKS OSA; laiust määrab allika laius, mitte „pool millestki" |
| `vari-sama-suur-kui-keha` | vari on alati keha suurune | explore-1: punktallikaga on 10 cm pall 3 m peal juba 30 cm vari |
| `laiem-allikas-laiem-vari` | suurem lamp teeb ka täisvarju suuremaks | predict + explore-2/3: laiem allikas SÖÖB täisvarju, kuni see kaob |
| `hagu-tuleb-silmast` | hägusale servale otsitakse põhjust mujalt kui varju geomeetriast: silma või kaamera viga, „valgus jõuab kaugemale nõrgemini“ | explore: joonisel on poolvari kiirtega välja joonistatud, laius on arvutatav |
| `punktallikas-annab-poolvarju` | igal varjul on hägune serv | explore-1: punktallikaga on poolvari täpselt 0 |

## Õpetajale (teacher.ts)

- **(K) P1-PT1 päris katse – vahendid:** väike LED-taskulamp (punktallikas),
  matt klaasiga öölamp või telefoniekraan valgel taustal (laiendatud
  allikas), pingpongipall või mandariin pulga otsas, valge paber või sein
  ekraaniks, joonlaud, mõõdulint, pime tuba.
- **(K) käik (hüpoteesiga, nagu ainekava nõuab):** 1) kirjuta hüpotees –
  mis juhtub varjuga, kui allikas läheb laiemaks; 2) taskulambiga: jäta pall
  **1 m kaugusele lambist** ja mõõda täisvarju laius, kui ekraan on **2 m ja
  siis 4 m kaugusel LAMBIST** – vari peab minema kaks korda laiemaks.
  **Kõiki kaugusi mõõdetakse lambist, mitte pallist** – see on sama
  kokkulepe, mis simulatsioonis (`a` ja `b`), ja ainult nii tuleb
  kahekordistumine välja (2 m / 1 m = 2 ja 4 m / 1 m = 4); 3) vaheta
  taskulamp telefoniekraani vastu samale kohale ja mõõda uuesti; 4) leia
  serva juurest poolvari ja mõõda selle laius; 5) võrdle hüpoteesiga.
- **Ohutus:** taskulambiga ei valgustata kellelegi silma; lasereid selles
  katses EI kasutata (isegi mitte osutamiseks).
- **Miks päris mõõtmine erineb simulatsioonist:** simulatsioonis on servad
  matemaatiliselt täpsed, päris katses on poolvarju piir sujuv ja iga õpilane
  loeb selle natuke erinevalt. See ei ole viga – arutage, kust täpselt
  „poolvari lõpeb", ja kuidas rühmade tulemused erinevad.
- **Aruteluküsimused:** Miks on operatsioonilampides palju väikseid
  valgusteid? Miks päevavalguslambiga ruumis on varjud pehmed? Miks
  fotograafid panevad välklambi ette valge riide? Kui Päike on nii tohutult
  suur, miks on meil siis üldse teravat varju?
- **Simulatsioon ENNE päris katset** – õpilane ennustab, mis laia allikaga
  juhtub, ja kontrollib siis taskulambi ja telefoniekraaniga.
- **Tunniplaan (20 min):** 2 min hook + teooria · 3 min hüpotees ·
  7 min simulatsioon (labor) · 5 min harjutamine · 3 min väljumispilet.
  45-minutilises tunnis eelneb sellele `valguse-sirgjooneline-levimine` ja
  järgneb päris katse.

## Kordamiskaardid (5 tk)

| id | tüüp | küsimus | vastus |
|---|---|---|---|
| rc-1 | concept | Mis vahe on täisvarjul ja poolvarjul? | Täisvarjus ei paista allikast midagi, poolvarjus paistab allika üks osa – seepärast on poolvari heledam |
| rc-2 | concept | Millise allikaga tekib ainult täisvari, ilma poolvarjuta? | Punktvalgusallikaga – allikal ei ole laiust, seega ei ole kohta, kust „pool valgust" paistaks |
| rc-3 | calc | Punktallikas, pall 10 cm, pall 1 m ja ekraan 3 m kaugusel allikast. Kui lai on täisvari? | 10 · 3 / 1 = 30 cm (ekraan on 3 korda kaugemal, vari 3 korda laiem) |
| rc-4 | selgitus | Miks kaob täisvari ära, kui allikas on kehast laiem ja ekraan piisavalt kaugel? | Allika kumbki serv paistab keha tagant mööda; ühest hetkest alates jõuab igasse punkti valgus vähemalt ühest allika servast |
| rc-5 | transfer | Miks on pilvise ilmaga õues peaaegu varjutu ja päikesepaistes terav vari? | Pilvekiht on hiiglaslik laiendatud allikas (ainult poolvari, laialivalgunud); Päike on kaugusega võrreldes väike, seega annab peaaegu punktallika terava täisvarju |
