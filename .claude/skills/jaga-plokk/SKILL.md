---
name: jaga-plokk
description: Jaga ette antud ainekava failist üks plokk (nt P3) võimalikult väikesteks moodulikandidaatideks ja kirjuta jaotus vastavasse JAOTUS-faili. Kasuta, kui kasutaja tahab ainekava plokki moodulteks jagada või jaotuskava täiendada.
argument-hint: <ainekava-fail> <plokk> – nt sisu/AINEKAVA-fyysika-8.md P3
---

# Ainekava ploki jagamine moodulteks

Sinu ülesanne: teha ÜHE ploki kohta jaotusettepanek – mitte kirjutada
moodulispetse ega koodi. Väljund on read JAOTUS-failis staatusega
`plaanis` + katvuse kontroll. MOODUL-<slug>.md failid kirjutatakse alles
pärast seda, kui kasutaja on jaotuse kinnitanud, ja üks moodul korraga
(raudne reegel 7: väikesed sammud).

## Sammud

1. **Argumendid: `<ainekava-fail> <plokk>`.** Esimene argument on tee
   ainekava failini (suvaline nimi, nt `sisu/AINEKAVA-fyysika-8.md` või
   `sisu/AINEKAVA-fyysika-9.md`), teine ploki id (nt `P3`).
   - Kui failiteed pole antud, ütle seda ja küsi see kasutajalt – ÄRA
     oleta 8. klassi faili.
   - Kui fail puudub, ütle seda ja peatu.
   - Kui plokki pole antud, loe failist plokkide loend ja küsi, millist
     jagada.

2. **Kontrolli sisendi struktuuri ENNE jagamist.** Ainekava fail peab
   sisaldama ID-skeemi `P<n>-T<m>` (õpitulemused) ja `P<n>-PT<m>`
   (praktilised tööd) ning sektsioone „Põhimõisted" ja „Praktilised tööd".
   Kui neid ei leidu, **peatu ja ütle kasutajale**, et fail tuleb esmalt
   viia struktureeritud kujule (eeskuju: `sisu/AINEKAVA-fyysika-8.md`).
   ÄRA mõtle ID-sid ise välja – ID-d on igavesed (raudne reegel 11) ja
   need peavad sündima ainekava faili, mitte jaotuse käigus.

3. **Leia väljundfail.**
   - Kui sisendi nimi on kujul `AINEKAVA-<midagi>.md`, siis väljund on
     samas kaustas `JAOTUS-<midagi>.md`.
   - Muu nime korral küsi kasutajalt väljundfaili nimi.
   - Kui väljundfaili pole veel olemas, loo see, võttes päise ja
     tabelistruktuuri eeskujuks `sisu/JAOTUS-fyysika-8.md` (samad veerud,
     samad reeglid, sama staatuste loend) ja lisa kõigi sisendfailis
     leiduvate plokkide tühjad sektsioonid.

4. **Loe sisendid** (kõik kolm, alati):
   - ainekava fail – antud plokk TERVIKUNA ja faili lõpus olevad
     „Katvuse reeglid";
   - `sisu/MALL-moodul.md` – suurusreegel;
   - väljundfail – ploki olemasolevad read (nt pilootmoodulid).
     Olemasolevaid ridu EI muudeta ega dubleerita: nende kaetud osad
     arvatakse jäägist maha.

5. **Jaga plokk.** Jaotusreeglid tähtsuse järjekorras:
   - **Võimalikult väike on eesmärk.** Vaikimisi mikromoodul: üks selge
     õpieesmärk, 5–20 min, 3–6 sammu. „Juhitud tund" on lubatud erand,
     mitte vaikevalik. Kui kandidaadi pealkirjas on „ja", mis ühendab
     kaht eri asja – jaga veel.
   - **Loomulik tükeldusühik on üks mõiste, üks seos või üks katse** –
     mitte üks õpitulemus. Õpitulemus jaguneb tavaliselt mitme mooduli
     vahel (`osa:` märkega).
   - **Iga arvutusseos (valem) saab oma harjutusmooduli** (katvuse
     reegel 1). Harjutusmoodul on eraldi moodul, mitte teooriamooduli
     lisasamm.
   - **Iga praktiline töö (P*-PT*) peab olema kaetud**: simulatsioonina,
     õpetajajuhendi päris katsena või mõlemana (katvuse reegel 3).
     Märgi, kummal kujul.
   - **Iga ploki põhimõiste läheb täpselt ühe mooduli „Õpetab" veergu.**
     Õpetab = defineerib, kasutab ja kontrollib – mitte ainult mainib.
   - **(D)-tegevused** ainekavast jaotuvad moodulite vahel; **(K)-tegevused**
     märgi selle mooduli juurde, mille teacher.ts-i need kuuluvad.
   - **Olulisus → hook, metoodilised rõhud → disainisisend.** Kontrolli, et
     iga metoodiline rõhk on vähemalt ühe mooduli juures arvesse võetud.
   - **Järjesta moodulid õppimise loogikas** (mõiste enne seost, seos enne
     harjutust, simulatsioon enne/koos päris katsega). Järjekord tabelis =
     soovituslik järjekord kursusefailis.

6. **Slugid.** kebab-case, eesti keel ilma täpitähtedeta (õ→o, ä→a, ö→o,
   ü→u), lühike ja igavene – vali nimi, mis jääb õigeks ka siis, kui
   mooduli sisu hiljem täpsustub. id = `physics.<slug>`. Kontrolli, et
   slug ei kordu üheski väljundfaili plokis.

7. **Kirjuta tulemus väljundfaili:** uued read ploki tabelisse
   (staatus `plaanis`, tüüp: mikromoodul / juhitud avastus / virtuaalne
   labor / harjutusmoodul / teooriakonspekt) ja uuenda ploki „Katvuse
   kontroll" rida. Kui kõik on kaetud, kirjuta: „Kõik õpitulemused,
   praktilised tööd ja mõisted kaetud." Kui midagi jäi teadlikult katmata
   (nt puhtalt (K)-tegevus), nimeta see ja põhjenda ühe lausega.

8. **Raporteeri kasutajale** lõpusõnumis:
   - milline fail ja plokk töösse läks;
   - mitu moodulit ja lühiloend (slug + üks rida sisu kohta);
   - katvuse kokkuvõte: iga T, PT ja mõiste → millise mooduli all;
   - kahtluskohad: kus jäi kaalumine kahe jaotuse vahel ja miks valisid
     nii (kasutaja tahab jaotust ise hinnata – tee otsustuskohad
     nähtavaks);
   - lõpetuseks: paku, et kasutaja vaatab jaotuse üle ja ütle, et
     järgmine samm on kinnitatud jaotusest ÜHE mooduli spetsi loomine
     MALL-moodul.md järgi.

## Mida MITTE teha

- Ära loo ega muuda MOODUL-*.md, manifest'e ega koodi – see skill teeb
  ainult jaotuse.
- Ära muuda sisendiks olevat ainekava faili – see on tõe allikas.
- Ära muuda olemasolevate ridade sluge ega kaetud osi (raudne reegel 11).
- Ära jaga korraga mitut plokki, isegi kui kasutaja mainib mitut – tee
  üks valmis, siis küsi järgmise kohta.
- Ära commit'i automaatselt – paku commit'i sõnum (nt
  „Jaotuskava: plokk P3 jagatud moodulteks") ja jäta otsus kasutajale.
