# Mooduli spetsifikatsiooni MALL

Kopeeri see fail nimega `MOODUL-<slug>.md`, täida KÕIK osad ja anna AI-le
ette koos käsuga „loo moodul selle spetsifikatsiooni põhjal moodulilepingu
järgi". Ainekava-osad viitavad failile `AINEKAVA-fyysika-8.md`.

## Suurusreegel (enne kirjutamist!)

Moodul on VÄIKE: üks selge õpieesmärk, 5–20 minutit, tavaliselt 3–6 sammu.
Kontrolli:

- kas moodulil on rohkem kui üks õpitulemus (mitte osa)? → jaga
- kas samme tuleb üle ~7? → jaga
- kas pealkirjas on sõna „ja", mis ühendab kaht eri asja? → ilmselt jaga

Suur teema = MITU väikest moodulit, mis järjestatakse kursusefailis sama
alateema alla. Täispikk juhitud tund (nagu pilootmoodulid) on lubatud
erand, mitte vaikevalik.

---

# Mooduli spetsifikatsioon: <PEALKIRI>

slug: `<slug>` · id: `physics.<slug>` · tüüp: <mikromoodul / juhitud
avastus / virtuaalne labor / harjutusmoodul / teooriakonspekt>

## Ainekava seos (KOHUSTUSLIK)

- **Plokk:** P<n> <ploki nimi>
- **Õpitulemused:** P<n>-T<m> (märgi, kas katab täielikult või osa; mida
  täpselt)
- **Õppesisu punktid:** <millised ainekava õppesisu read see moodul katab>
- **Põhimõisted, mida moodul ÕPETAB:** <loend – need lähevad manifest'i
  concepts väljale; õpetab = defineerib, kasutab ja kontrollib, mitte
  ainult mainib>
- **Praktiline töö:** P<n>-PT<m> või „–" (kui katab: kas simulatsioonina,
  päris katse juhendina õpetajale või mõlemana)
- **Teema olulisus → hook:** <millest ainekava „olulisus" osast tuleb
  häälestav probleem>
- **Metoodilised soovitused, mida järgin:** <ainekava metoodilistest
  rõhkudest need, mis selle mooduli disaini mõjutavad>
- **Õpilase tegevused:** (D) <millised digiteeritavad tegevused moodul
  realiseerib>; (K) <millised lähevad teacher.ts õpetajajuhendisse>

## Allikad (soovituslik)

- **Teooria tugi:** <milline sisu/allikad/ fail toetas teooriat, või „–"
  (õpetaja enda teadmine)>
- **Ülesannete näidised:** <millised practice-ülesanded on millise
  väljavõtte analoogid>

NB! Kasutusreeglid on failis sisu/ALLIKAD.md – teadmata litsentsiga
allikast ainult faktikontroll ja analoogid, mitte kunagi sõnasõnaline tekst.

## Füüsika (model.ts jaoks)

<valemid, seosed, lubatud vahemikud, testiväärtused (vähemalt 3 teadaolevat
+ piirjuhud)>

## Sammud

<iga samm: tüüp, täpne tekst/küsimus, õige vastus + tolerants + ühik,
kuni 2 vihjet, väärarusaama silt vale vastuse juures. Ennustus enne
simulatsiooni. Vähem samme on parem kui rohkem.>

NB! Simulatsioon on ideaalne (mõõtmismüra ei ole – projekti otsus):
collect-sammu tolerants on lugemis-/tippimistolerants, mitte mõõtmisviga.
Päris mõõtmise hajuvus kuulub päris katsesse (teacher.ts). Küsimuste ID-d
(`<tüüp>-<nr>`) on igavesed – kui küsimus muutub sisuliselt, saab uus
küsimus uue ID (versioonireeglid: docs/MOODULILEPING.md).

## Väärarusaamad

| Silt | Väärarusaam | Kuidas moodul selle ümber lükkab |
|---|---|---|

## Õpetajale (teacher.ts)

- (K) tegevused ainekavast, mida ekraanil teha ei saa: vahendid, käik,
  ohutus
- aruteluküsimused; soovitus, kas simulatsioon enne või pärast päris katset
- tunniplaan minutites

## Kordamiskaardid (3–6 tk)

<mõiste / arvutus / graafik / selgitus / ülekanne – iga kaart koos õige
vastusega>

Kaardid lähevad mooduli activities.ts faili (reviewCards eksport) ja
kirjutatakse valmis KOHE mooduli loomisel – ka siis, kui kordamismootor
(etapp 3) pole veel valmis.

Soovituslikult kõik viis tüüpi esindatud (concept/calc/graph/explain/
transfer). Kui mõni tüüp moodulile ei sobi (nt puhtal mõistemoodulil pole
`calc`-i), põhjenda ühe lausega, ära jäta lihtsalt vahele.
