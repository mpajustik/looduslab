# Töövoog: kuidas AI-ga arendada

See fail on sulle endale (mitte AI-le) – meelespea, kuidas iga töösessioon
käib ja kuidas projekt kontrolli all hoida.

## Üks töösessioon (u 1–2 tundi)

1. **Ava plaan.** Vaata plaan/ETAPP-X failist järgmine tegemata samm.
2. **Anna AI-le kontekst.** Alusta sessiooni nii:
   > Loe CLAUDE.md. Teeme plaan/ETAPP-X sammu X.Y. [kleebi sammu tekst]

   Vastuseks ütleb AI esimese asjana, kas see samm nõuab **Opust** (nt
   füüsika, engine, RLS) või piisab **Sonnetist** (nt UI-tekstid, stiilid).
   Täpne loend on CLAUDE.md peatükis „Mudelivalik" – **ära korda seda siia**,
   muidu lähevad kaks nimekirja lahku ja väiksem hakkab valetama.
   Vahetad sina: `/model sonnet` või `/model opus` – AI seda ise teha ei saa.
   **Fable'ile lülitad ainult sina** – AI ei paku seda kunagi ise.
3. **Lase AI-l plaani öelda enne koodi.** „Ütle kõigepealt, mida kavatsed
   muuta ja millistes failides." Kui plaan tundub liiga suur – poolita.
4. **Kood + kohe proovimine.** `npm run dev` jookseb kõrval; proovi iga
   muudatus ise läbi (telefonivaade DevToolsis!). AI saab sama asja teha
   chrome-devtools MCP kaudu (`.mcp.json`) – 360 px vaade, töölauavaade,
   konsooli veateated. See ei asenda sinu enda proovimist (vt reegel allpool
   „Sammu „valmis" otsus"), aga püüab kinni asjad, mida AI muidu ei näe.
5. **Testid ja build.** `npm run test && npm run build` – mõlemad rohelised.
6. **Commit.** Lühike eestikeelne sõnum: mida ja miks.
7. **Märgi samm tehtuks** plaanifailis (`- [x]`).

## Ülevaatus ja testimine (sammude 4–6 täpsustus)

Erapooletut ülevaatust ei tee üks „väga hoolikas" lugemine, vaid mitu
sõltumatut kihti väikese diff'i peal. Iga ülesande juures:

1. **Masinkontrollid enne kõike muud:**
   `npm run lint && npm run test && npm run build` – kõik rohelised enne,
   kui sina midagi loed. Punane = AI parandab kohe.
2. **Testid teadaolevate väärtustega.** SINA arvutad (või võtad õpikust)
   oodatava vastuse ja annad selle AI-le ette – nii kontrollib test AI-d,
   mitte AI iseennast. Näide:
   > „Kirjuta testid: vesi ρ=1000 kg/m³, h=2 m, g=9,8 m/s² → 19 600 Pa.
   > Sügavus 0 → 0 Pa. Negatiivne sügavus → [sinu otsus]."
3. **Diff üle – sina loed, AI vastab.** Paljas `git diff` ei näita uusi
   faile – ja uus moodul ongi peamiselt uued failid, seega näitaks ta sulle
   tühjust. Tee nähtavaks nii:

   ```bash
   git status --short   # millised failid puutusid – ka uued
   git add -N .         # uued failid nähtavaks; sisu EI lavastata
   git diff             # kogu muudatus, ka uutes failides
   ```

   `-N` tähendab „kavatsen lisada": fail muutub `git diff`-ile nähtavaks,
   aga sisu jääb lavastamata. Ülevaatus on lugemine – see ei tohi sinu eest
   otsustada, mis commit'i läheb. (`git add -A` teeks just seda ja järgmine
   `git commit` haaraks kaasa ka failid, mis ülesandesse ei kuulu – vastu
   reeglit 7.) `.gitignore` kehtib, seega `.env` jääb puutumata.

   Vaata kolme asja: kas muudeti AINULT ülesande faile, kas füüsika on
   ainult model.ts-is, kas midagi ei kustunud, mida sa ei palunud.
   Arusaamatu rida? „Selgita lihtsas eesti keeles."
4. **AI-ülevaatus puhta pilguga.** Tavaline samm: `/code-review` samas
   sessioonis. Riskantne tükk (RLS, engine, checker, salvestamine):
   UUS vestlus, millele annad ainult:
   > „Loe CLAUDE.md ja docs/MOODULILEPING.md. Vaata `git diff` üle.
   > Eelda, et diff'is on vähemalt üks viga – leia see. Kontrolli eraldi:
   > käsitlemata sisendid, RLS, preview-režiimi lekked."
   Uus vestlus ei tea, miks otsused sündisid – just see teeb ta
   erapooletuks. Kõige suuremad asjad: `/code-review ultra` (tasuline).

   **Riskantsel sammul kutsu appi TEINE mudel – Codex** (vt allpool
   „Teine mudel"). Uus Claude'i vestlus ei tea, miks otsused sündisid, aga
   ta jagab sama mudeli kalduvusi: kui Claude tegi RLS-poliitikas
   loogikavea, teeb sama vea üsna tõenäoliselt ka teine Claude. Teisel
   mudelil on need kalduvused teised – see vähendab riski, aga ei kaota
   seda. Lõpliku otsuse teed ikka sina.
5. **Käsitsi proovimine** – 360 px + töölaud. Küsi AI-lt „mida peaksin
   käsitsi proovima?" ja proovi ka üks asi, mida ta EI nimetanud
   (nt sisend -5 või tühi väli). AI oma brauseri-läbivaatus (chrome-devtools
   MCP) on lisakontroll, mitte asendus – tema ei tea, mis "tundub õige".

**Leidudega käitumine:** ära lase AI-l leide pimesi parandada. Küsi iga
leiu kohta: „Kas päris viga või stiiliküsimus? Näita sisend, millega see
katki läheb." Päris vea puhul: kõigepealt test, mis vea kinni püüab
(punane), siis parandus (roheline) – nii ei tule sama viga tagasi.

**Mis mahus mida teha:**

| Muudatus | Kontroll |
| --- | --- |
| UI-tekst, stiil | lint + build + silmaga üle |
| model.ts, checker | + testid teadaolevate väärtustega (alati!) |
| Tavaline moodulisamm | + `/code-review` samas sessioonis |
| RLS, migratsioonid, engine, salvestamine | + **Codex** (`/ulevaatus` teeb ise) või `/code-review ultra`; SQL loed ise rida-realt |

Kõik kihid on odavad ainult siis, kui diff on väike – seepärast commit
iga sammu järel.

## Teine mudel: Codex erapooletu ülevaatajana

Codex CLI on Windowsis natiivselt (WSL-i pole vaja) ja loeb projektist
faili `AGENTS.md`, kus on kirjas tema roll: **ülevaataja, mitte kirjutaja.**
Ta ei paranda leide ega tee commit'i.

**Sina ei pea seda eraldi meeles pidama.** Skill `/ulevaatus` on nüüd
kaheastmeline: CodeRabbit jookseb alati, Codex lisaks siis, kui samm on
riskisamm. Riskisammud on plaanifailides ette märgitud reaga „Codexi
ülevaatus tehtud – riskisamm". Lisaks kutsutakse Codex alati, kui diff
puudutab kasvõi üht neist:

`src/modules/**/model.ts` · `src/checker/**` · `src/engine/**` ·
`supabase/migrations/**` · `supabase/functions/**` · võtme või
isikuandmetega kohad

Muidu piisab CodeRabbitist. Ütle `/ulevaatus codex`, kui tahad Codexit
kindlasti. `/ulevaatus kiire` jätab ta vahele **ainult tavasammul** –
riskisammul seda ei täideta, muidu jääks kohustuslik kontroll tegemata ja
plaani linnuke valetaks.

**Millal riskisamm:** siis, kui vale tulemus või andmeleke jõuaks õpilaseni
VAIKSELT. Katkist nuppu näed kohe; vale rõhuvalemit ei näe keegi. Sedasama
ütleb ka plaanifailides rida „Codexi ülevaatus tehtud – riskisamm".

**Käsitsi, ilma skillita:**

```bash
npm run review
```

Vaatab commit'imata muudatused (ka uued failid) ja kirjutab leiud faili
`codex-ulevaatus.md` (git ignoreerib seda). Võtab ~5 minutit. Juba
commit'itud sammu või terve haru jaoks ava Codex vestlusena (`codex`) ja
ütle: „Loe AGENTS.md ja tee seal kirjeldatud ülevaatus viimasele
commit'ile" (või „harule main-i suhtes").

**Leiud loed sina.** Claude toob need ette ja liigitab (päris viga vs
stiiliküsimus), aga **mida parandatakse, otsustad sina** – täpselt nagu
CodeRabbiti puhul. Päris vea puhul kõigepealt test, mis vea punaseks teeb,
alles siis parandus.

**Loe leiud failist `codex-ulevaatus.md`, mitte terminalist.** Sinu
PowerShell on ConstrainedLanguage-režiimis, seega terminalis lähevad
täpitähed katki (`tÃ¶Ã¶voo`) ja logisse vilksatab liivakasti vigu
(`CreateProcessWithLogonW failed: 267`).

**Kontrolli aga alati, et fail päriselt tekkis ja ei ole tühi.** Kui käsk
kukkus või fail on tühi, siis ülevaatust EI toimunud – ükskõik mida logi
näitab. Ainult siis, kui käsk läks läbi ja failis on leiud, on ülalmainitud
read müra, mitte rike.

Kaks ülevaatajat ei ole kaks korda rohkem tööd: CodeRabbit näeb stiili ja
mustreid, Codex näeb loogikat ja piirjuhte. Kui mõlemad osutavad samale
reale, tasub sinna eriti hoolikalt vaadata – aga ka kaks ülevaatajat
võivad korraga eksida, seega kontrolli leid ikka üle.

*(Väike detail: valmis alamkäsk `codex exec review` siin ei sobinud – ta ei
võta oma prompti ega järgi `AGENTS.md`-d, vaid annab kolmerealise üldsõnalise
vastuse. Seepärast on skriptis tavaline `codex exec`, mis loeb `AGENTS.md`
ette. `-s read-only` on seal meelega: see keelab Codexil faile muuta
päriselt, mitte ainult palvena.)*

## Kui midagi läheb katki

- `git status` ja `git diff` – vaata, mida AI tegelikult muutis
- Halb seis? `git checkout .` (viskab viimase commit'i järgsed muudatused ära)
  – seepärast ongi commit iga sammu järel kohustuslik
- AI keerutab ringiratast? Alusta uut vestlust, anna väiksem ja täpsem ülesanne
- Sa ei saa koodist aru? Küsi: „Selgita see fail mulle rida-realt lihtsas
  eesti keeles" – see on õppimise, mitte piinlikkuse koht

## Head küsimused AI-le (kasuta tihti)

- „Kas saab lihtsamalt, ilma uue sõltuvuseta?"
- „Millised piirjuhud võivad selle katki teha?"
- „Kirjuta sellele funktsioonile testid teadaolevate väärtustega."
- „Kontrolli see muudatus CLAUDE.md reeglite vastu."
- „Mida ma peaksin käsitsi läbi proovima enne commit'i?"

## Mida AI-le MITTE delegeerida

- **Füüsika õigsus** – sina oled ekspert; testid on sinu kontrollivahend
- **Migratsioonide käivitamine** – loe SQL alati ise läbi (eriti RLS!)
- **Pedagoogilised otsused** – küsimuste sõnastus, vihjete sisu, raskusaste
- **Sammu „valmis" otsus** – valmis on siis, kui SINA oled telefonis läbi
  proovinud, mitte siis, kui AI ütleb, et valmis

## Git-harud (lihtsalt)

- Töötad üksi: commit'i otse main-i, iga samm eraldi commit
- Suurema/riskantsema tüki puhul (nt RLS, sünkroonimine): tee haru + PR
  iseendale – Cloudflare annab eelvaate-URL-i, kus saad enne main-i
  liitmist telefonis testida
- Ära hoia harusid elus üle paari päeva – pikad harud on solo-arendaja lõks

## Rütm ja motivatsioon

- Väike samm iga päev lööb suure sammu kord nädalas
- Iga etapi lõpus on midagi, mida saab päris inimesele näidata – näita!
  (kolleegile, õpilasele, abikaasale) – tagasiside enne järgmist etappi
- Kui mõni samm venib üle kahe sessiooni, on samm liiga suur: poolita ja
  liigu edasi poolikuga
- Pea logi (kasvõi märkmikus): kuupäev, mis valmis, mis üllatas. Kuu pärast
  on see kuld – näed, kui kaugele oled jõudnud
