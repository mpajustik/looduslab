# ETAPP 4: Laiendus (jooksev töö)

**Eesmärk:** rohkem mooduleid, esitlusrežiim, töökindlus kehvas võrgus ja
alles siis AI-vihjed.

Selle etapi sammud on iseseisvad tükid – vali järjekord vajaduse järgi, aga
moodulite tootmine (4.1) käib pidevalt.

---

## 4.0 Ainekava katvuse raport

> **Prompt AI-le:** Loo npm skript coverage: loeb sisu/AINEKAVA-fyysika-8.md
> (õpitulemused P*-T*, põhimõisted, praktilised tööd P*-PT*) ja kõigi
> src/modules/registry.ts-is registreeritud AKTIIVSETE moodulite manifestid
> (outcomes, concepts, practicalWork) ning prindib raporti: kaetud / katmata,
> mooduli kaupa. CI-s hoiatus (mitte
> viga), kui katmata asju on. Kuva õpetajale mooduli juures seotud
> õpitulemused ja mõisted.

- [x] Raport näitab ausalt: 2 moodulit katab murdosa – ülejäänu on punane
- [x] Õpetaja näeb mooduli juures ainekava seost

**Tehtud 2026-08-08 (esimene osa, 4.0a: raport).** Käsk on `npm run coverage`
(scripts/coverage.mjs), otsustusreeglid scripts/coverageRules.ts,
testid tests/coverageRules.test.ts. Esimene tulemus: õpitulemused 3/30,
põhimõisted 6/51, praktilised tööd 1/21. Kolm otsust:

1. **Parsimine ja katvus on puhtad funktsioonid eraldi failis**, skript ise
   ainult loeb faile ja trükib. Sama muster mis scripts/syncRules.ts – ainekava
   faili kuju võib muutuda ja siis kaob pool raportist VAIKSELT. Parser on
   seepärast range: tühjaks jäänud plokk viskab vea, mitte ei näita „kaetud".
2. **Tundmatu ID on viga, tundmatu MÕISTE ei ole.** `P9-T1` on trükiviga –
   moodul arvab end midagi katvat, aga raportis on ta nähtamatu, seega
   väljumiskood 1. Mõistetega on teisiti: ainekava põhimõisted on miinimum,
   mitte lubatud sõnade loend („peegeldumisnurk" on hea mõiste ka siis, kui
   ainekava teda ei nimeta) – need lähevad märkusena kirja.
3. **Katmata ainekava EI OLE viga** (väljumiskood 0, ainult hoiatus). Praegu
   on katmata 92 asja ja see on ootuspärane seis, mitte rike – punane CI
   iga päev õpetaks ainult punast CI-d eirama.

CodeRabbit leidis kaks kohta, kus parser oleks VAIKSELT valetanud, mõlemad
parandatud koos testiga: kirje moodi rida vigase ID-ga (`- **P1-T0** …`)
valgus enne eelmise kirje teksti sisse ja õpitulemus kadus raportist; tühi või
vale ainekava fail andis „0/0 (100%)" ehk rohelise raporti olukorras, kus
ainekava on kaotsi läinud. Mõlemad viskavad nüüd vea.

Katvust loevad ainult `status: "active"` moodulid (ainekava katvuse reegel 1)
ja mõisteid võrreldakse nime järgi üle kogu ainekava, mitte ploki sees –
`langemisnurk` on P2 põhimõiste, aga peegeldumisseaduse moodul õpetab teda.

**Tehtud 2026-08-08 (teine osa, 4.0b: õpetaja näeb seost).** Õpetaja alas
(„3. Jaga üksikut tundi") on iga tunni juures kokkupandav plokk „Mida see
tund ainekavast katab": õpitulemused ja praktilised tööd koos ainekava
TEKSTIGA, põhimõisted eraldi mooduli enda mõistetest. Kolm otsust:

1. **Ainekava tekst tuleb failist, mitte koopiast.** `sisu/AINEKAVA-fyysika-8.md`
   imporditakse `?raw`-na (src/lib/curriculumSource.ts) ja parsitakse sama
   koodiga, mis raportil. Käsitsi tehtud TS-koopia läheks esimese ainekava
   paranduse järel vaikselt lahku. Parser kolis seepärast
   scripts/coverageRules.ts-ist src/lib/curriculum.ts-i – kaks lugejat, üks
   parser. Fail on ~14 kB ja jõuab ainult laisalt laaditavasse õpetaja
   pakki (reegel 13), õpilase esilehele mitte.
2. **Tundmatu ID jääb õpetaja ekraanile nähtavale** („P9-T1 – seda ID-d ei
   ole ainekava failis"), kuigi raport nimetab teda veaks. Vaikselt ära
   jättes arvaks õpetaja, et moodulil polegi ainekava seost.
3. **Ainekava seos on ÕPETAJA asi.** Õpilase vaates ID-sid ei ole – laps ei
   õpi „P1-T2", tema jaoks on eesmärk manifesti `goal`.

Katki ainekava fail ei tohi õpetaja ala valgeks teha: parsimisviga läheb
Sentrysse ja plokk näitab ID-d ilma tekstita (curriculumSource.ts).

CodeRabbit leidis, et parser ei märka ainekavas korduvat kirjet – kopeeritud
rida ei teeks raportit punaseks, vaid VALEKS („3/30" muutuks vaikselt
„3/31"-ks). Nüüd viskab korduv ID vea. Sama kontroll mõistetel avastas kohe
päris seisu: „optiline keskkond" ON ainekavas kaks korda (P1 ja P2) ja see
on õige – riiklikus ainekavas käib sama mõiste kahe teema alla. Seepärast
nõutakse mõistelt unikaalsust ainult PLOKI SEES.

## 4.1 Moodulite tootmine (pidev, katvusraporti järgi)

Rütm: 1–2 VÄIKEST moodulit nädalas. Iga mooduli kohta:

1. Vaata katvusraportit – vali katmata õpitulemus/mõiste/praktiline töö
2. Leia sisu/JAOTUS-fyysika-8.md-st rida, mis selle augu katab. Kui plokk
   on veel jagamata, jaga see esmalt (`/jaga-plokk sisu/AINEKAVA-fyysika-8.md
   P<n>`) ja kinnita jaotus – alles siis edasi
3. Kopeeri sisu/MALL-moodul.md → täida, ainekava ID-d jaotusrealt
   (suurusreegel!)
4. AI loob mooduli malli peale (vt docs/MOODULILEPING.md protsess)
5. Füüsika kontroll + telefonis läbimine + commit; märgi jaotusreale
   staatus `ehitatud` ja kontrolli, et raport läks paremaks

Moodulid on väikesed (5–20 min, 3–6 sammu) – üks ainekava plokk on
tüüpiliselt 4–8 moodulit, mis järjestatakse kursusefailis alateemade alla.

**MILLISED moodulid ühest plokist tulevad, otsustab ainult
sisu/JAOTUS-fyysika-8.md** – ära dubleeri seda loendit siia plaani, muidu
lähevad kaks nimekirja lahku. Siin on ainult PLOKKIDE järjekord, s.o
kooliaasta rütm:

- [ ] Plokk 1 lõpuni (piloot `peegeldumisseadus` juba olemas)
- [ ] Plokk 2
- [ ] Plokk 5 lõpuni (piloot `vedeliku-rohk` juba olemas)
- [ ] Plokk 3
- [ ] Plokid 4, 6, 7 samas rütmis – alati katvusraporti järgi

## 4.2 Esitlusrežiim (demo)

> **Prompt AI-le:** Lisa moodulile ?mode=demo: suurem tekst ja juhtnupud
> (1,5×), ainult hook + predict + explore sammud, klassi vastuste
> kuvamine (mitmendik valis A/B/C) kui õpetaja on sisse logitud. Demo
> kasutab engine'i preview-režiimi (olemas sammust 1.6) – projektoril
> klõpsimine EI salvesta midagi ega ilmu klassivaatesse.

- [ ] Projektoril loetav klassi tagant; õpetaja saab ennustused ekraanile
- [ ] Demo läbimine ei jäta jälge ei localStorage'i ega andmebaasi
- [ ] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`)

## 4.3 PWA ja kehv võrk

> **Prompt AI-le:** Lisa vite-plugin-pwa: rakenduse kest ja viimati avatud
> moodulid vahemällu; võrguta indikaator; vastuste järjekord (juba engine'is)
> tühjeneb ühenduse taastudes. Testi lennurežiimiga.

- [ ] Lennurežiimis avaneb viimati kasutatud moodul ja vastused säilivad

## 4.4 AI-vihjed (alles kui 4.1–4.3 töötavad!)

Neli eraldi sessiooni:

- [ ] **4.4a Funktsiooni skelett.** Edge Function ai_hint: õiguste kontroll,
      fikseeritud test-vastus (AI-d veel pole). Testi curl-iga.
- [ ] **4.4b AI-kutse.** Lisa AI API kutse + mooduli kontekst (activities.ts
      sisu) + väljundi Zod-valideerimine (vihje, mitte vastus!). Võti ainult
      funktsiooni keskkonnamuutujas.
- [ ] **4.4c Kulupiir.** Max N päringut õpilase kohta päevas; ületamisel
      sõbralik teade. Testi piiri ületamist.
- [ ] **4.4d UI.** „Vihje" nupp kuvatakse alles pärast õpilase enda katset.
      Proovi läbi mõlemal pilootmoodulil – kas vihjed on päriselt sisukad?
- [ ] Codexi ülevaatus tehtud iga alamsammu järel – **riskisamm**
      (`/ulevaatus`): võti, kulupiir ja väljundi valideerimine

Reeglid (CLAUDE.md-st, korda üle):

- AI EI ütle kunagi õiget vastust, kui eesmärk on arutlemine
- AI EI hinda arvulisi vastuseid – see jääb checkerile

## 4.5 Teenuste ristmüük (docs/LISATOOTED.md)

> **Prompt AI-le:** (1) Loo src/content/teenused.ts (teenus: nimi,
> kirjeldus, seotud plokid, kontakt) ja avalik leht „Teenused koolidele".
> (2) Mooduli õpetajapaneelis üks vaikne rida, kui ploki kohta on teenus.
> (3) Klassi kokkuvõttevaates „järgmise sammu" soovitus. KÕIK ainult
> õpetaja-alas – õpilase vaates ei tohi olla ÜHTEGI pakkumist.

- [ ] Teenuste leht + kaks viidet töötavad; õpilase vaates ei ole midagi

## 4.6 Tagasisidekanal

> **Prompt AI-le:** Iga mooduli lõppu väike „Märkasid viga või on
> ettepanek?" vorm (vabatekst, salvestub tabelisse feedback). Tabel tuleb
> uue migratsiooniga docs/ANDMEMUDEL.md „Tugitabelid" järgi – KOOS
> RLS-reeglitega samas migratsioonis (CLAUDE.md reegel 5), ja nagu iga
> migratsioon: enne käivitamist loen SQL-i ise üle. Salvesta kaasa
> module_version (viga käib versiooni, mitte mooduli kohta). Õpetaja
> töölauale nende nimekiri.

- [ ] Tagasiside jõuab sinuni – see on moodulite kvaliteedi mootor
- [ ] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`): uus tabel,
      uus RLS, vabatekst õpilaselt

## 4.7 Klassivaade suurele rühmale (150 õpilast)

**Miks:** praegune klassivaade on üks pikk nimekiri – see töötab 25 õpilasega
ja läheb 150-ga loetamatuks (kasutaja tähelepanek 2026-08-07, katsetamisel).
Sorteerimine ja koondamine ei ole ilustus, vaid see, mis otsustab, kas
õpetaja leiab paari sekundiga selle lapse, kes on kinni jäänud.

> **Prompt AI-le:** Täienda õpetaja klassivaadet (`ClassLivePage.tsx`) suure
> rühma jaoks:
>
> 1. **Sorteerimine ja rühmitamine** – nime järgi (praegune vaikimisi),
>    edenemise järgi (kes on kinni / kes lõpetas) ning tunni ja kursuse
>    järgi. Kursuse järjestus tuleb kursusefailist (`src/content/`), mitte
>    mooduli enda küljest – moodul ei tea oma kohta kursuses (reegel 11).
> 2. **Koondrida tunni kohta** – „Valguse peegeldumine: 12 lõpetanud, 8
>    pooleli, 5 alustamata" – õpetaja näeb klassi seisu ilma 150 rida läbi
>    lugemata.
> 3. **Nimele klikkides ühe õpilase leht** – mida see laps on teinud:
>    millised tunnid läbitud, kus pooleli, tema vastused. Õpetaja näeb
>    ainult oma klassi õpilasi (RLS-i olemasolevad reeglid katavad selle –
>    uut tabelit ega uut poliitikat vaja ei ole).
>
> Andmete pool: 150 õpilast × mitu moodulit tähendab, et kõike ei tohi enam
> iga 10 s järel korraga tõmmata – vaata üle, kas päring vajab koondamist
> (vaade või agregaat baasi poolel) ja kas poll peab jääma nii tihedaks.
> Loogika (sorteerimine, koondamine) `src/lib/`-i puhta funktsioonina koos
> testidega, mitte komponendi sisse.

- [ ] 150 õpilasega klassis leiab õpetaja alla 5 sekundiga selle, kes on
      kinni jäänud
- [ ] Töötab 360 px telefonis (tabel ei tohi horisontaalselt laiali joosta)
- [ ] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`): vale koond on
      vaikne viga, mida õpetaja usub (sama põhjendus mis sammul 2.13)

---

## Mida ENDISELT mitte teha

Punktisüsteemid ja edetabelid; koolide SSO; mikroteenused; oma server;
analüütikaplatvorm; keemia moodulid enne, kui füüsika 8. klass on kaetud.
Iga uue idee juures: kas see aitab luua praktilise, koolis kasutatava
õppelahenduse, mille eest kool maksaks? Kui ei – „hiljem" nimekirja.
