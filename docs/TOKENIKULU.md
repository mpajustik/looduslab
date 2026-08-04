# Tokenikulu: kust see tuleb ja kuidas seda vähendada

See fail on sulle endale (nagu TOOVOOG.md) – meelespea, miks mõni samm
maksab kümme korda rohkem kui teine. Kõik arvud allpool on **mõõdetud**
selle projekti enda sessioonifailidest (2026-08-03/04), mitte oletatud.

## Kaks numbrit, mis kogu kulu määravad

AI ei maksa „koodirea" ega „tunni" eest. Ta maksab selle eest, et **iga
tööriistakutse loeb terve senise vestluse uuesti läbi**. Seega:

> **kulu ≈ tööriistakutsete arv × konteksti suurus**

Need kaks **korrutuvad**, ei liitu. Kaks korda rohkem kutseid ja kaks korda
suurem kontekst ei tähenda kaks korda kallimat sammu, vaid neli korda.

## Mõõdetud võrdlus: samm 1.14 vs sammud 1.15+1.16

| Näitaja | Samm 1.14 (joonised) | Sammud 1.15+1.16 (vedeliku rõhk) |
| --- | --- | --- |
| Kestus | ~4 h | ~57 min |
| API-kutseid | 872 | **250** |
| Cache-read tokeneid | **200 M** | **24 M** |
| Väljundtokeneid | 696 k | 156 k |
| Konteksti mediaan | 213 k | **100 k** |
| Konteksti maksimum | 459 k | 139 k |
| Edit-kutseid | 160 | 24 |
| Ekraanipilte | 15 (1716 KB) | 5 (398 KB) |
| Brauserikutseid | ~120 | 12 |

**1.15+1.16 oli 8,3× odavam.** 3,5× vähem kutseid × 2,1× väiksem kontekst.

Samm 1.14 ei olnud „halvasti tehtud" – seal ehitati esimest korda jooniste
mehhanismi ja katsetati päris kasutajaga. Aga see näitab täpselt, mis
juhtub, kui mõlemad tegurid korraga paisuvad.

## Mis konteksti tegelikult täidab

Sammu 1.14 tööriistade vastuste mahud:

| Tööriist | Kokku | Kutseid | Keskmine kutse |
| --- | --- | --- | --- |
| ekraanipilt (take_screenshot) | 1716 KB | 15 | **114 KB** |
| Read | 576 KB | 77 | 7 KB |
| Bash | 91 KB | 124 | ~0 |
| take_snapshot | 62 KB | 22 | 2 KB |
| Edit | 28 KB | 160 | ~0 |

Loe seda tabelit kahes suunas:

- **Ekraanipilt on ainus asi, mis üksiku kutsena on tõesti suur.** Ja ta ei
  maksa ainult korra: pilt jääb konteksti ja iga järgnev kutse kannab teda
  kaasas. Üks pilt vestluse alguses, millele järgneb 800 kutset, maksab
  800 korda.
- **Edit on üksikuna tühine (~180 baiti), aga neid oli 160.** Iga Edit
  käivitab 213 k tokeni uuestilugemise. Kulu ei ole Edit'i sisus, vaid
  selles, et ta on **üks kutse rohkem**.

## Täpsed sammud (tähtsuse järjekorras)

### 1. Üks samm = üks sessioon. Kui kontekst läheb üle ~150 k, tee `/clear`

**Suurim üksik hoob.** Kui kontekst on 400 k, on iga järgnev kutse kaks
korda kallim kui 200 k juures – ja seda maksad kuni sessiooni lõpuni.
Sammud 1.15 ja 1.16 tehti kahes eraldi sessioonis (füüsikamudel eraldi,
visuaal eraldi) ja mõlema kontekst püsis 100 k juures.

Praktikas: kui samm on commititud, tee `/clear` ja alusta järgmist puhtalt.
Ära karda, et AI „unustab" – plaanifail ja CLAUDE.md annavad konteksti
tagasi 5 k tokeniga, mitte 400 k-ga.

**Märk, et on aeg puhastada:** sama faili on juba mitu korda edasi-tagasi
loetud, või oled samas sessioonis alustanud uut teemat.

### 2. Ekraanipilt on lõppkontroll, mitte töövahend

Üks pilt = ~114 KB, mis jääb konteksti püsivalt. Reegel:

- **Ära** pildista iga vaheversiooni („kas nüüd on parem?").
- **Pildista** siis, kui muudatus on sinu arvates valmis – 360 px ja
  töölauavaade, kaks pilti, mitte viisteist.
- Joonise **loogikat** (kas nurk on õige, kas koordinaat klapib) kontrolli
  arvuga: test model.ts-i vastu või `evaluate_script`, mis tagastab arvu.
  Arv maksab 200 baiti, pilt 114 000.

### 3. Brauser on ainult visuaali-sammudel

Claude Code'i enda kasutusraport näitas, et **42% ühe ööpäeva kulust tuli
chrome-devtools MCP serverist**. See on rohkem, kui pildid üksi seletavad,
ja põhjuseid on kaks:

- **Server maksab ka siis, kui sa teda ei kasuta.** Kõigi tema tööriistade
  kirjeldused laaditakse konteksti sessiooni alguses – ka mudeli- või
  ülesandesammul, kus brauserit kordagi ei avata.
- **Iga brauserikutse vastus jääb konteksti.** `take_snapshot` on 2 KB
  kutse kohta (sammus 1.14 kokku 62 KB) ja neid koguneb märkamatult
  kiiremini kui ekraanipilte.

Reegel: brauser käib kaasa **ainult siis, kui samm puudutab visuaali**
(Simulation.tsx, joonised, stiilid). Sammudel, mis muudavad model.ts-i,
manifesti, activities.ts-i või dokumente, jäta ta välja.

Väljajätmiseks lisa `.claude/settings.json`-i väli
`disabledMcpjsonServers` – olemasolev `hooks` jääb alles:

```json
{
  "hooks": { "PreToolUse": [ "...siin olev sisu jääb muutmata..." ] },
  "disabledMcpjsonServers": ["chrome-devtools"]
}
```

**Ära kopeeri seda plokki faili peale** – `hooks` sisu on siin lühendatud.
Lisa failis olemasoleva `hooks`-i kõrvale ainult uus `disabledMcpjsonServers`
rida ja pane eelmise rea lõppu koma.

Visuaali-sammu alguses **kustuta see väli päriselt ära** – JSON ei luba
kommentaare, seega väljakommenteeritud rida teeb kogu faili katki ja koos
sellega ka ülevaatuse-hooki. Seejärel käivita Claude uuesti.

`.mcp.json` ise jääb puutumata – see on ainsana serveri seadistuse allikas,
`settings.json` ütleb ainult, kas server sellel sessioonil käivitatakse.

Ja kui brauser on lahti: **eelista `evaluate_script`-i, mis tagastab arvu,
`take_snapshot`-ile.** Kas nurk on õige või koordinaat klapib – seda ütleb
arv 200 baidiga, hetktõmmis 2000-ga ja pilt 114 000-ga.

### 4. Kirjuta fail valmis, siis paranda

160 pisi-Edit'i ja 20 suuremat annavad sama lõpptulemuse, aga esimene
maksab 8× rohkem. Ütle AI-le:

> Kirjuta kogu fail korraga valmis, ära paranda rida-realt.

Uue faili puhul on Write (üks kutse) alati odavam kui Write + 20 Edit'i.

### 5. Ütle „ütle plaan enne koodi" – aga ainult üks kord

TOOVOOG.md samm 3 („lase AI-l plaan öelda") on hea ja jääb. Aga kui plaan
on kinnitatud, lase tal terve samm ära teha ilma vahepeal küsimata.
Iga „kas ma jätkan?" küsimus on üks täiskonteksti kutse.

### 6. Hoia plaanifail kärbituna

`plaan/ETAPP-1-moodulid.md` on 1054 rida ja kasvab. Kui moodul on valmis,
tõsta selle sammude detailid arhiivi (`plaan/ARHIIV-moodul-N.md`) ja jäta
elavasse faili pealkiri + link. Elav plaanifail peaks kirjeldama ainult
käimasolevat ja tulevast tööd.

### 7. Jaga suured failid väiksemaks

`figures.tsx` on 860 rida. Iga muudatus selles nõuab enne kogu faili
lugemist. Kui üks moodul vajab mitut joonist, jaga need eraldi failidesse
(`figures/mattpind.tsx`, `figures/periskoop.tsx`) – siis loeb iga muudatus
150 rida, mitte 860.

## Mida MITTE kärpida

Need maksavad vähe ja hoiavad ära kallimaid vigu:

- **Testid model.ts-i jaoks.** Test on lühike tekst ja säästab tunde
  silumist – silumine on kõige kallim tegevus üldse.
- **CodeRabbit ja Codex.** Nad jooksevad väliste protsessidena; sinu
  sessiooni läheb tagasi ainult lühike leidude nimekiri.
- **CLAUDE.md ja moodulileping.** ~10 k tokenit sessiooni kohta on odav
  võrreldes ühe valesti ehitatud mooduli ümbertegemisega.

## Mille poole püüelda

Terve moodul (füüsikamudel + manifest + simulatsioon + ülesanded):

- **~250 tööriistakutset**
- **kontekst püsib alla 150 k**
- **2–4 ekraanipilti kokku**

Sammud 1.15+1.16 saavutasid selle. Kui järgmine moodul püsib samas
suurusjärgus, on protsess korras.
