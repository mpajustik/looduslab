# Mooduli spetsifikatsioon: Valguse peegeldumine

Ainekava seos (AINEKAVA-fyysika-8.md): plokk P1; õpitulemused: P1-T2 (osa:
peegeldumisseadus, joonised, katse); mõisted, mida õpetab: valguskiir,
tasapeegel, mattpind, langemisnurk, peegeldumisnurk, pinnanormaal;
praktiline töö: P1-PT3 (sim + päris katse juhend õpetajale).
Vanus: 8. klass. Kestused: demo 10 min, tund 45 min, iseseisev 25 min.
NB: see on täispikk „juhitud tund" tüüpi pilootmoodul – tavamoodulid on
väiksemad (vt MALL-moodul.md suurusreegel).

slug: `peegeldumisseadus` · id: `physics.peegeldumisseadus`

## Füüsika (model.ts jaoks)

- Peegeldumisseadus: peegeldumisnurk = langemisnurk. **Nurgad mõõdetakse
  ALATI pinnanormaali suhtes** (see on ka peamine väärarusaamade allikas).
- `reflectionAngle(incidenceDeg) = incidenceDeg` (0–90°)
- `angleFromSurface(angleFromNormalDeg) = 90 - angleFromNormalDeg`
- Peegeldunud kiire suund tasapinnal: langemiskiir, normaal ja peegeldunud
  kiir on samas tasandis, normaali suhtes sümmeetrilised
- Definitsioonipiirkond: 0–90°. Väljaspool seda visatakse viga (funktsioon
  ei „paranda" sisendit vaikselt). 90° on lubatud matemaatiline piirjuht
  (kiir libiseb piki pinda, tagastab 90°) – SIMULATSIOONI liugur lõpeb
  85° juures, et seda füüsikaliselt kraadi visuaali ei tekiks
- Sim on IDEAALNE: väärtused tulevad mudelist täpselt, mõõtmismüra ei ole
  (mõõtmise hajuvus jääb päris katsele, vt teacher.ts)
- Testid: 0° → 0° (risti pinnaga, kiir tagasi); 30° → 30°; 45° → 45°;
  90° → 90° (piirjuht); −5° ja 95° → viga; pinna suhtes 30° = normaali
  suhtes 60°

## Sammud

### 1. hook – häälestus

Foto/joonis: laserikiir tabab peeglit pimedas ruumis. Küsimus: „Kuhu peab
Mari peegli keerama, et laserikiir tabaks märklauda seina peal?" + eesmärk:
„Täna õpid ennustama, kuhu valguskiir peegeldub."

### 2. precheck – eelteadmised (valikvastused)

1. Valgus levib ühtlases keskkonnas … (a) kõverjooneliselt (b) **sirgjooneliselt**
   (c) suvaliselt. — Vale vastuse tugi: tuletame meelde: valgusvihk taskulambist.
2. Millised kehad peegeldavad valgust? (a) ainult peeglid (b) ainult läikivad
   kehad (c) **kõik kehad, ka matid** — silt: `ainult-peegel-peegeldab`

### 3. predict – ennustus (lukustub!)

Joonis: kiir langeb tasapeeglile 30° nurga all normaali suhtes. Normaal on
joonisel näidatud ja nimetatud. „Kui suure nurga all normaali suhtes lahkub
peegeldunud kiir?" Valikud: (a) 15° (b) 30° (c) 60° (d) sõltub peegli
materjalist. + vabatekst „Miks sa nii arvad?"

### 4. explore – simulatsioon

SVG: tasapeegel horisontaalselt, punktvalgusallikas, langemiskiir, normaal
(kriipsjoon), peegeldunud kiir. Liugur: langemisnurk 0–85° (normaali
suhtes). Kuvatakse suurelt: langemisnurk ja peegeldumisnurk väärtustena.

Ülesanded simulatsioonis (järjest):

1. „Sea langemisnurk 30°. Mis on peegeldumisnurk?"
2. „Leia nurk, mille korral kiir peegeldub otse tagasi." (vastus: 0°)
3. „Lülita sisse nurk pinna suhtes (lisavaade). Sea langemisnurk normaali
   suhtes 60°. Mitu kraadi on see pinna suhtes?" (30°)

Lisalüliti (avaneb pärast ülesannet 2): „mattpind" – sama kiir mattpinnal
hajub eri suundades (hajus peegeldumine), selgitustekst 2 lauset.

### 5. collect – andmete kogumine

Tabel: 3 mõõtmist simulatsioonist (langemisnurk / peegeldumisnurk).
Õpilane valib ise kolm eri nurka ja kirjutab tulemused. Kontroll: read
täidetud, kolm ERI nurka ja iga rida vastab mudelile ±1° piires.
NB: sim on ideaalne, seega ±1° on lugemis-/tippimistolerants (õpilane loeb
ekraanilt ja tipib käsitsi), mitte mõõtmisviga – päris mõõtehajuvusega
tegeleb päris katse (teacher.ts).

### 6. explain – selgita

Väide–tõend–põhjendus mall: „Sõnasta oma mõõtmiste põhjal seaduspärasus.
Võrdle oma ennustusega 3. sammust – kas pidid midagi ümber mõtlema?"
(vabatekst, min 15 sõna; õpetajale nähtav koos ennustusega)

### 7. practice – harjutamine

1. **Näidis (lahendatud):** kiir langeb 40° normaali suhtes → peegeldub 40°;
   joonisel kõik nurgad tähistatud.
2. **Osaline:** kiir langeb 25° normaali suhtes. Peegeldumisnurk = ___°
   (vastus 25, tolerants 0).
3. **Iseseisev (lõks!):** kiir langeb tasapeeglile nii, et moodustab PINNAGA
   35° nurga. Kui suur on peegeldumisnurk (normaali suhtes)? (vastus 55°,
   tolerants 0; vihje 1: „Kummast joonest mõõdetakse peegeldumisseaduse
   nurki?"; vihje 2: „Normaali ja pinna vahel on 90°."; vale vastus 35 →
   silt `nurk-pinna-suhtes`)
4. **Iseseisev:** periskoobis on kaks peeglit 45° nurga all. Miks väljub kiir
   liikumissuunaga paralleelselt? (valikvastus kolme selgitusega)

### 8. exit – väljumispilet

1. Peegeldumisnurka mõõdetakse … (a) peegli pinnast (b) **pinnanormaalist**
   (c) langemiskiirest
2. Langemisnurk on 50° normaali suhtes. Peegeldumisnurk = ___° (50)
3. „Ütle ühe lausega, mida sa täna õppisid ja mis jäi segaseks." (vabatekst)

## Väärarusaamad (teacher.ts + siltide selgitused)

| Silt | Väärarusaam | Kuidas parandada |
|---|---|---|
| `nurk-pinna-suhtes` | nurki mõõdetakse peegli pinnast | normaali roll: joonista mõlemad nurgad ühele joonisele |
| `ainult-peegel-peegeldab` | ainult läikivad kehad peegeldavad | mattpinna hajus peegeldumine: miks me üldse esemeid näeme |
| `kujutis-peegli-pinnal` | kujutis asub peegli pinnal | tasapeegli kujutis on peegli TAGA sama kaugel (järgmine moodul) |

## Õpetajale (teacher.ts)

- Vahendid päris katseks: laser/taskulamp, tasapeegel, mall nurkade
  mõõtmiseks, valge paber. Ohutus: laserit mitte silma ega peeglilt silma!
- Aruteluküsimused: Miks näed ennast peeglis, aga mitte seinas? Kus kasutab
  juuksur kahte peeglit? Kuidas töötab jalgratta helkur?
- Soovitus: simulatsioon ENNE päris katset (õpilane teab, mida mõõta läheb)
- 45 min plaan: hook 5 · precheck 3 · predict 5 · explore 10 · collect 5 ·
  explain 7 · practice 7 · exit 3

## Kordamiskaardid (reviewCards)

1. mõiste: Millise joone suhtes mõõdetakse langemis- ja peegeldumisnurka?
   (pinnanormaali suhtes)
2. arvutus: Langemisnurk 35° normaali suhtes → peegeldumisnurk? (35°)
3. arvutus-lõks: Kiir moodustab pinnaga 20° → peegeldumisnurk normaali
   suhtes? (70°)
4. selgitus: Miks näeme matti seina igast suunast, aga peeglist ainult
   kindla nurga alt? (hajus vs peegelpeegeldus)
5. ülekanne: Miks helkur saadab valguse tagasi auto suunas? (nurkpeegli
   põhimõte)
