# Toodangukeskkonna juhend (plaan 2.17)

Siin on samm-sammult juhend, kuidas panna püsti PÄRIS keskkond – see,
kuhu esimene päris klass tuleb. Iga sammu juures on kirjas ka **mida sa
pead nägema**. Kui sa seda ei näe, ära mine edasi: mine tagasi ja vaata,
mis läks teisiti.

Kokku kulub umbes **2 tundi**. Sa võid pooleli jätta ja hiljem jätkata –
iga peatükk lõpeb kohaga, kus on ohutu peatuda.

## Kaks sõna enne alustamist

Sul on praegu **üks** Supabase'i projekt: see on dev ehk katsetuste
baas. Nüüd tuleb teine, prod ehk päris baas. Alates sellest hetkest
kehtib üks reegel, mille rikkumine on kõige tavalisem viga:

> **Katsetamine käib alati dev-is. Prod-baasis ei tehta kunagi katseid.**

Nad näevad välja täpselt ühesugused. Ainus vahe on aadressis (projekti
ref) ja selles, et prod-is on päris laste andmed. Sellepärast on selles
juhendis mitu kohta, kus sa kontrollid, kummas sa parasjagu oled.

**Enne alustamist peab olema tehtud:** samm 2.16 (turvatest dev-is) –
see on tehtud 2026-08-06.

---

## 1. peatükk: loo prod-projekt (10 min)

### 1.1 Uus projekt

1. Ava <https://supabase.com/dashboard>
2. Vajuta **New project**
3. Täida:
   - **Name:** `looduslab-prod` (dev-i oma jäta rahule!)
   - **Database Password:** vajuta **Generate a password** ja **kopeeri
     see kohe paroolihaldurisse**. Seda ei näidata teist korda.
   - **Region:** `Central EU (Frankfurt)` – Eestile lähim ja
     andmed jäävad EL-i (GDPR)
   - **Plan:** Free
4. Vajuta **Create new project** ja oota ~2 minutit.

**Mida sa pead nägema:** projekti leht avaneb ja üleval ei ole enam
kirja „Setting up project".

### 1.2 Kirjuta ref üles

Projekti aadress on kujul
`https://supabase.com/dashboard/project/abcdefghijklmnop`. See kirjuklots
`abcdefghijklmnop` on **projekti ref**. Kirjuta ta kuhugi üles – teda
läheb veel mitu korda vaja ja tema järgi sa eristad prod-i dev-ist.

- dev ref: `_________________`
- prod ref: `_________________`

---

## 2. peatükk: võtmed (10 min)

### 2.1 Võta võtmed välja

Prod-projektis: **Project Settings** (hammasratas all vasakul) → **API**.

Sealt on vaja kolme asja:

| Nimi lehel | Kuhu ta läheb | Kas ta on saladus? |
| --- | --- | --- |
| Project URL | `VITE_SUPABASE_URL` | ei, avalik |
| `anon` `public` | `VITE_SUPABASE_ANON_KEY` | ei, avalik |
| `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` | **JAH** |

`service_role` võti on peidus – tuleb vajutada **Reveal**. See võti käib
RLS-ist mööda ja näeb kõike. Ta ei tohi kunagi jõuda ei koodi, ei git'i,
ei brauserisse (CLAUDE.md reegel 6).

### 2.2 Tee fail `.env.prod.local`

Loo projekti juurkausta uus fail `.env.prod.local` ja pane sinna
PROD-i väärtused:

```bash
VITE_SUPABASE_URL=https://<prod-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<prod anon-võti>

SUPABASE_URL=https://<prod-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<prod service_role võti>
```

**Miks eraldi fail:** `.env.local` jääb edasi dev-i peale, nii et
`npm run dev` ei satu kogemata prod-i. Kõik `.env.*` failid on
`.gitignore`-is (v.a `.env.example`), seega git'i nad ei lähe.

**Miks just nimi `prod`, mitte `production`:** Vite loeb `vite build`
ajal automaatselt faili `.env.production.local` – see tähendaks, et iga
tavaline `npm run build` (mille sa teed enne iga commit'i) hakkaks
vaikselt prod-võtmeid kasutama. Nimi `prod` ei ole Vite'i jaoks miski,
mille ta ise üles korjaks: prod-build tuleb alles siis, kui sa ütled
`--mode prod`. Teadlik valik, mitte kogemata.

**Kontroll (tee see ära, ära jäta vahele):**

```powershell
git status --short
```

**Mida sa pead nägema:** `.env.prod.local` EI ole nimekirjas. Kui ta
seal on, siis `.gitignore` ei tööta – peatu ja küsi.

---

## 3. peatükk: andmebaas (20 min)

Prod-baas on praegu täiesti tühi. Nüüd paneme sinna sama skeemi, mis
dev-is – käsitsi, faili kaupa, õiges järjekorras.

### 3.1 Migratsioonid

Prod-projektis: **SQL Editor** → **New query**.

Ava kaustast `supabase/migrations/` fail, kopeeri **kogu sisu**, kleebi
editorisse, vajuta **Run**. Siis järgmine fail. **Järjekord loeb** –
iga fail toetub eelmisele:

- [ ] `001_tables.sql`
- [ ] `002_rls.sql`
- [ ] `003_class_code_unique.sql`
- [ ] `004_realtime_students.sql`
- [ ] `005_join_throttle.sql`

**Mida sa pead nägema:** iga faili järel roheline `Success`. Punane
veateade tähendab, et miski läks valesti – ära mine järgmise faili
juurde, vaid loe veateade läbi.

**Kontroll:** vasakul **Table Editor** – seal peavad olema tabelid
`profiles`, `classes`, `students`, `modules`, `attempts`, `responses`,
`join_attempts` ja `review_items`.

> **Üks asi, mida see käsitsi viis jätab tegemata.** Kui migratsioon
> käivitada SQL Editoris, ei tea Supabase CLI sellest midagi – tabelisse
> `supabase_migrations.schema_migrations` rida ei teki. Kui sa kunagi
> hakkad kasutama `supabase db push`-i, arvab ta, et ükski migratsioon ei
> ole tehtud, ja proovib kõiki uuesti. See ei ole praegu probleem (kogu
> sinu töövoog on käsitsi ja CLAUDE.md nõuabki, et sa SQL-i ise üle
> loeksid), aga tea seda enne, kui CLI-le üle lähed – siis on vaja
> `supabase migration repair`-i.
>
> Ja tähtsam: **tabelite olemasolu Table Editoris ei tõesta, et
> migratsioon läks lõpuni.** Üks fail võib olla pooleldi läbi jooksnud.
> Selle tõestab alles `01-skeem.sql` allpool.

### 3.2 Luba anonüümne sisselogimine

Õpilane ei loo kontot – ta saab anonüümse sessiooni. Ilma selleta ei saa
ükski laps liituda.

**Authentication** → **Sign In / Providers** → lülita sisse
**Allow anonymous sign-ins** → **Save**.

**Mida sa pead nägema:** lüliti jääb sisselülitatuks ka pärast lehe
värskendamist.

### 3.3 Kontrollskriptid

Kaustast `supabase/tests/`, sama moodi SQL Editorisse:

- [ ] `01-skeem.sql` → **mida sa pead nägema:** tabel, kus veerus `seis`
      on igal real `OK`. Kui kuskil on `VIGA`, siis mõni migratsioon jäi
      käivitamata.
- [ ] `03-kustutamine.sql` → **mida sa pead nägema:** „Success. No rows
      returned". Vaikus on hea uudis.

`02-pidurdus.sql` jäta praegu vahele – ta vajab `auth.users`-is vähemalt
üht kasutajat ja prod on veel tühi. Tuleme tagasi 5. peatükis.

### 3.4 Saada moodulid baasi

Tabel `modules` on praegu tühi. Ilma selleta ei näe rakendus ühtegi
moodulit ja klassivaade ei tea, mille kohta vastuseid näidata.

Käivita PROD-i võtmetega (tavaline `npm run sync-modules` läheks dev-i,
sest ta loeb `.env.local`-i):

```powershell
node --env-file=.env.prod.local scripts/sync-modules.mjs --dry-run
```

**Mida sa pead nägema:** nimekiri moodulitest, mille ta lisaks. Kui
nimekiri on õige, käivita päriselt – sama käsk ilma `--dry-run`-ita:

```powershell
node --env-file=.env.prod.local scripts/sync-modules.mjs
```

**Kontroll:** **Table Editor** → `modules` – seal on read, üks iga
mooduli kohta.

---

## 4. peatükk: Edge Functionid (25 min)

See on peatükk, kus kõige lihtsam on kogemata dev-i pihta lasta. Loe
iga sammu enne käivitamist läbi.

### 4.1 Suuna käsurida prod-i

```powershell
npx supabase link --project-ref <prod-ref>
```

Ta küsib andmebaasi parooli (see, mille sa 1.1-s paroolihaldurisse
panid).

**Kontroll – tee see ära:**

```powershell
npx supabase projects list
```

**Mida sa pead nägema:** rea ees, kus on prod-projekt, on märk `●`
(linked). Kui märk on dev-i real, siis kõik järgmised käsud lähevad
dev-i – lingi uuesti.

### 4.2 Genereeri UUED saladused

Prod vajab oma pipart ja soola. **Ära kopeeri dev-i omi** – kui dev-i
saladus kunagi lekib (ta on sinu arvutis, katsetustes, ekraanipiltidel),
ei tohi see puudutada päris lapsi.

**Saladust ei kirjutata käsureale.** PowerShell salvestab iga käivitatud
käsu ajaloofaili sinu arvutis (`ConsoleHost_history.txt`). Kui sa kirjutad
`secrets set CLASS_CODE_PEPPER=abc123`, jääb prod-i pipar sinna tekstina
lebama – ja seda faili ei kaitse miski. Sellepärast käib see failist.

Genereeri kaks juhuslikku stringi ja kirjuta nad kohe ajutisse faili:

```powershell
function Uus-Saladus {
  $bytes = [byte[]]::new(48)
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  $rng.GetBytes($bytes)
  $rng.Dispose()
  [System.BitConverter]::ToString($bytes).Replace('-','').ToLower()
}

"CLASS_CODE_PEPPER=$(Uus-Saladus)" | Out-File -Encoding utf8 supabase/.env.secrets
"JOIN_IP_SALT=$(Uus-Saladus)"      | Add-Content -Encoding utf8 supabase/.env.secrets
```

Fail `supabase/.env.secrets` on `.gitignore`-i reegli `.env.*` all, seega
git'i ta ei lähe. **Kontrolli seda ikkagi:** `git status --short` – teda ei
tohi nimekirjas olla.

Saada saladused Supabase'i ja kustuta fail:

```powershell
npx supabase secrets set --env-file supabase/.env.secrets
npx supabase secrets list
```

**Mida sa pead nägema:** `secrets list` näitab mõlemat nime. Väärtusi ta
ei näita – nii peabki olema.

Kopeeri mõlemad väärtused paroolihaldurisse (neid ei saa hiljem Supabase'ist
välja lugeda!) ja siis kustuta fail:

```powershell
Remove-Item supabase/.env.secrets
```

> **Pipart ei vahetata hiljem niisama.** Tema vahetamine muudab kõik
> väljastatud klassikoodid kehtetuks.

### 4.3 Saada funktsioonid välja

```powershell
npx supabase functions deploy create_class_code
npx supabase functions deploy join_class
```

**Mida sa pead nägema:** mõlema lõpus `Deployed Functions on project
<prod-ref>`. Kontrolli, et seal seisab **prod**-ref.

**Kontroll töölaual:** **Edge Functions** → mõlemad funktsioonid on
nimekirjas ja staatus on `Active`.

---

## 5. peatükk: kas prod päriselt töötab (20 min)

Nüüd on baas ja funktsioonid olemas, aga tõestamata, et nad koos
töötavad. Selleks on vaja üht päris õpetajakontot.

### 5.1 Tee prod-i õpetajakonto

Käivita rakendus PROD-i võtmetega:

```powershell
npm run build -- --mode prod
npm run preview -- --host
```

`--mode prod` paneb Vite'i lugema `.env.prod.local` faili, seega see
build räägib prod-baasiga. `--host` on vajalik selleks, et **telefon**
lehele ligi pääseks: ilma selleta kuulab preview ainult `localhost`-i ja
telefonist ei tule ühendust. Väljundis on kaks aadressi – võta see, mille
ees on **Network** (kujul `http://192.168.x.x:4173`).

Ava see arvutis, mine `/opetaja` ja registreeru oma e-postiga.

**NB! Pärast seda peatükki tee `npm run build` uuesti ilma `--mode
prod`-ita.** Muidu jääb kaustas `dist/` prod-build ja järgmine
`npm run preview` (või `npm run turvakontroll`) vaatab valet asja.

**Mida sa pead nägema:** Supabase'i töölaual **Authentication** →
**Users** – seal on üks kasutaja. Sinu oma.

### 5.2 Tee üks klass ja liitu ise õpilasena

1. Loo rakenduses klass (nt „Test – kustutan ära")
2. Võta koodi ja liitu telefonist õpilasena
3. Tee üks moodul mõne sammu jagu läbi

**Mida sa pead nägema:** õpetaja klassivaates ilmub sinu õpilane ja tema
vastused. Kui ilmub – töötab kogu ahel: RLS, Edge Functionid, saladused,
Realtime.

### 5.3 Nüüd jookseb ka pidurdustest

`auth.users`-is on nüüd kasutaja, seega SQL Editoris:

- [ ] `02-pidurdus.sql` → **mida sa pead nägema:** „Success. No rows
      returned"

### 5.4 RLS prod-is

- [ ] `04-rls-brauseris.js` prod-i vastu

> **Tähelepanu, siin on lõks.** Fail ise ütleb oma alguses, et `LL_URL` ja
> `LL_ANON` tuleb võtta failist `.env.local` – see on kirjutatud dev-i
> peale mõeldes. **Siin võta nad `.env.prod.local`-ist.** Kui sa täidad
> dev-võtmed, testib skript rõõmsalt dev-baasi ja näitab rohelist tuld,
> ilma et keegi oleks prod-i vaadanud.
>
> Kontrolli enne käivitamist: `LL_URL`-is peab olema **prod**-ref.

**Mida sa pead nägema:** iga rida „RLS pidas". Kui kuskil on POOLIK, ei
ole test läbitud.

### 5.5 Koristus

Kustuta rakenduses testklass ära. **Mida sa pead nägema:** klass kaob ja
õpilane koos temaga.

> **Siin on ohutu peatuda.** Prod on olemas ja tõestatud. Ülejäänu
> (majutus, varundus, seire) võib teha teisel päeval.

---

## 6. peatükk: Cloudflare (20 min)

### 6.1 Ühenda repo

1. <https://dash.cloudflare.com> → **Workers & Pages** → **Create**
2. **Import a repository** → vali oma GitHubi repo
3. Build seaded:
   - **Build command:** `npm run build`
   - **Deploy command:** `npx wrangler deploy`

### 6.2 Keskkonnamuutujad – NB! build-aja, mitte runtime

See on koht, kus otsustatakse, millise baasiga päris leht räägib. Ja see
on koht, kus kõige lihtsam on teha viga, mis ei anna ühtegi veateadet.

Cloudflare'il on **kaks eri kohta** muutujate jaoks:

| Koht | Millal ta kehtib | Kas meile sobib |
| --- | --- | --- |
| Settings → **Build** → build variables | `npm run build` ajal | **JAH** |
| Settings → Variables and Secrets | kui Worker päringut teenindab | ei |

Meie leht on staatiline: Vite **kirjutab** `VITE_`-muutujate väärtused
build'i ajal otse JavaScripti sisse. Kui muutuja on olemas ainult runtime
pool, ei näe `npm run build` teda kunagi ja bundle'isse läheb tühjus.
Tagajärg: deploy õnnestub, leht avaneb, aga sisselogimine ja liitumine ei
tööta – ja veateade ei ütle sulle sõnagi keskkonnamuutujatest.

Seega **Settings → Build → build variables and secrets**. Lisa
**Production** keskkonda:

| Nimi | Väärtus |
| --- | --- |
| `VITE_SUPABASE_URL` | prod URL |
| `VITE_SUPABASE_ANON_KEY` | prod anon-võti |

Ja **Preview** keskkonda (eelvaated, mis tekivad harudest):

| Nimi | Väärtus |
| --- | --- |
| `VITE_SUPABASE_URL` | **dev** URL |
| `VITE_SUPABASE_ANON_KEY` | **dev** anon-võti |

**Miks nii:** eelvaade on koht, kus sa katsetad poolikut asja. Ta ei tohi
kirjutada päris laste baasi. See tabel ongi plaani punkt „dev-katsetused
EI jõua kunagi prod-andmebaasi".

`SUPABASE_SERVICE_ROLE_KEY`-d Cloudflare'i **EI PANDA**. Ta ei ole
brauserirakendusele kunagi vajalik.

### 6.3 Esimene deploy

Vajuta **Save and Deploy** ja oota.

**Mida sa pead nägema:** leht avaneb aadressil
`looduslab.<midagi>.workers.dev`, esileht töötab, `/opetaja` laseb sisse
logida. Proovi ka otselinki (nt `/kursus`) ja vajuta F5 – ei tohi tulla
404 (selle eest hoolitseb `wrangler.jsonc` rida
`not_found_handling`).

### 6.4 Kontroll: kumma baasiga ta räägib?

Ava päris lehel brauseri konsool (F12) → **Network** → värskenda lehte.
Otsi päringut, mis läheb `supabase.co` pihta.

**Mida sa pead nägema:** aadressis on **prod**-ref.

- Kui seal on **dev-ref**, on Cloudflare'is vale väärtus.
- Kui `supabase.co` pihta ei lähe **ühtegi** päringut, siis on muutujad
  tõenäoliselt pandud runtime poolele build-aja asemel (vt 6.2) – bundle'is
  ei ole aadressi, mille poole pöörduda.

---

## 7. peatükk: varundus (15 min)

Enne esimest päris klassi peab olema viis andmed tagasi saada.

Free-plaanis Supabase automaatset varundust ei tee. Seega tee ise, kord
nädalas, kuni tunde on vähe.

**Database** → **Backups** → kui seal on nupp **Download**, kasuta seda.
Kui ei ole, tee käsurealt – aga loe enne kaks hoiatust läbi.

### 7.1 Kaks lõksu, mis teevad varundusest teatri

**Lõks 1: `db dump` ei varunda vaikimisi andmeid.** Ilma lisaliputa
võtab ta kaasa ainult **skeemi** – tabelite kuju, ilma ühegi reata. Fail
tuleb suur ja SQL-i täis, seega ta *näeb välja* nagu korralik varukoopia.
Andmekao päeval avastaksid sa, et sul on tabelite joonised ja mitte ühtegi
lapse vastust. Andmete jaoks on vaja **eraldi käsku** lipuga `--data-only`.

**Lõks 2: `--linked` varundab selle projekti, mille külge sa parasjagu
lingitud oled.** Kuna 8. peatüki kontroll-loend palub sul lingi dev-i
peale tagasi jätta, on tavaline seis just see, et link **ei ole** prod-il.
Sa teeksid kohusetundlikult iganädalase varunduse tühjast dev-baasist.

### 7.2 Varundamine

**Alusta alati kontrollist, kumma projekti külge sa lingitud oled:**

```powershell
npx supabase projects list
```

Kui `●` ei ole prod-projekti real, lingi ümber:

```powershell
npx supabase link --project-ref <prod-ref>
```

Seejärel varunda **mõlemad pooled** eraldi failidesse (kuupäev tuleb
käsust, et sa ei kirjutaks eelmist üle):

```powershell
$kuup = Get-Date -Format 'yyyy-MM-dd'
$kaust = "$env:USERPROFILE\Documents\looduslab-varundus"
New-Item -ItemType Directory -Force $kaust | Out-Null

npx supabase db dump --linked -f "$kaust\skeem-$kuup.sql"
npx supabase db dump --linked --data-only -f "$kaust\andmed-$kuup.sql"
```

Taastamiseks on vaja **mõlemat**, selles järjekorras: kõigepealt skeem,
siis andmed.

**Mida sa pead nägema** – ja siin ei piisa sellest, et fail on olemas:

- `skeem-*.sql` sisaldab ridu `create table` – otsi neid.
- `andmed-*.sql` sisaldab ridu `INSERT INTO` või `COPY` **koos päris
  nimedega**. Kui seal on ainult `create table`-eid või fail on paarsada
  baiti, siis andmeid varukoopias EI OLE, hoolimata sellest, mida käsk
  ütles.
- Ava `andmed-*.sql` tekstiredaktoris ja otsi ühe oma testklassi õpilase
  nime. Kui leiad – varundus töötab. See on ainus kontroll, mida tasub
  uskuda.

**Lõpuks lingi tagasi dev-i peale** (aga alles siis, kui varundus
õnnestus – mitte enne):

```powershell
npx supabase link --project-ref <dev-ref>
```

### 7.3 Kuhu varukoopiat EI panda

Fail sisaldab päris laste nimesid ja vastuseid – see on isikuandmete
kogum sinu arvutis.

- **Mitte projekti kausta.** Üks `git add .` ja ta on avalikus repos.
  Sellepärast kirjutab ülalolev käsk ta `Dokumendid` alla.
- **Mitte pilvekausta, mis end ise sünkroniseerib** (OneDrive, Dropbox,
  Google Drive). Sa ei otsusta siis enam, kus need andmed asuvad.
- **Pane parooliga arhiivi.** 7-Zip → „Add to archive" → „Encrypt file
  names" + parool paroolihaldurisse. Kaotatud sülearvuti ei tohi
  tähendada kaotatud klassi.
- **Kustuta vanemad kui kolm kuud.** Mida vähem koopiaid, seda vähem
  kohti, kust need lekkida saavad.

---

## 8. peatükk: seire ja statistika (15 min)

Kood on olemas (`src/lib/seire.ts` ja `src/lib/statistika.ts`). Puudu on
kaks märgist, mille pead ise võtma – ja need lähevad Cloudflare'i **build
variables** alla, samasse kohta, kus 6.2 muutujad.

> **Mõlemad on vabatahtlikud.** Kui märgist ei ole, ei juhtu midagi
> halba: rakendus töötab, lihtsalt vaikib. Sentry pakki (450 kB) ei panda
> siis buildi üldse – ta läheb kaasa ainult siis, kui DSN on olemas.

### 8.1 Sentry (veaseire)

1. <https://sentry.io> → loo tasuta konto
2. **Create project** → platvorm **React** → nimi `looduslab`
3. **Data region: Europe** – vali see kohe konto loomisel. Hiljem ei saa
   regiooni muuta ja privaatsuslehe lubadus on kirjutatud EL-i peale.
4. **Settings → Projects → looduslab → Client Keys (DSN)** → kopeeri DSN
   (kujul `https://<võti>@o<number>.ingest.de.sentry.io/<number>`)

DSN ei ole saladus – ta on nagunii bundle'is nähtav. Ta lubab ainult
vigu **saata**, mitte lugeda.

### 8.2 Cloudflare Web Analytics (külastused)

<https://dash.cloudflare.com> → **Analytics** → **Web Analytics** →
**Add a site** → vali oma `workers.dev` aadress. Vali **Manual
installation** ja otsi antud JS-lõigust `"token": "…"` – seda 32-märgilist
stringi sul vaja ongi (mitte kogu `<script>` rida, selle paneb kood ise
kokku).

Küpsist ta ei pane ja kasutajat üle lehtede ei jälgi – seepärast ei ole
vaja nõusolekubännerit.

### 8.3 Pane märgised Cloudflare'i

**Settings → Build → build variables and secrets**, **Production**
keskkonda (mitte Preview – katsetuste vead ja külastused ei tohi päris
statistikat rikkuda):

| Nimi | Väärtus |
| --- | --- |
| `VITE_SENTRY_DSN` | Sentry DSN |
| `VITE_CF_ANALYTICS_TOKEN` | Web Analytics token |

Vajuta uus deploy käima (Cloudflare'is **Retry deployment** või tee üks
commit) – ilma uue buildita neid muutujaid kuhugi ei kirjutata.

### 8.4 Kontroll: kas seire päriselt töötab

Seadmata seire on hullem kui seire puudumine – sa arvad, et sind
teavitatakse, ja sind ei teavitata. Seepärast tekita üks viga meelega.

Ava päris leht, ava brauseri konsool (F12) ja kirjuta:

```js
setTimeout(() => { throw new Error("Seire kontroll – see on meelega"); });
```

**Mida sa pead nägema:** Sentry projektis tekib minuti jooksul uus
Issue nimega „Seire kontroll – see on meelega".

Vaata see Issue lahti ja **kontrolli ka privaatsust**:

- **User** sektsiooni ei ole (või on tühi) – me ei saada, kes vea sai
- **URL** ei sisalda klassikoodi ega küsimärgi-osa

Külastusstatistika kohta: Web Analytics näitab esimesi numbreid umbes
poole tunni jooksul – seal ei ole midagi kiiret kontrollida.

**Üks asi jääb statistikas teadlikult lugemata.** Liitumislehte
(`/liitu/:kood`) ja õpetaja klassivaadet loendur EI mõõda. Cloudflare
logib lehe TEE, ja meie teede sees on klassikood – see ei tohi kolmanda
teenuse aruandesse jõuda. Seega on külastuste arv veidi väiksem kui
tegelikkus, ja nii peabki olema. Kui sa kunagi imestad, miks
liitumislehte tabelis ei ole: see ei ole rike.

> **Miks konsoolis, mitte lihtsalt oodates:** kui sa jätad kontrollimata,
> saad tõe teada alles esimeses päris tunnis, kui kellelgi läheb midagi
> katki ja sa ei saa sellest teada.

---

## Kiirkontroll enne esimest päris klassi

- [ ] Prod-baasis on kõik viis migratsiooni (`01-skeem.sql` = kõik OK)
- [ ] Anonüümne sisselogimine lubatud
- [ ] Mõlemad Edge Functionid `Active` prod-is
- [ ] Prod-il on OMA pipar ja sool (mitte dev-i omad)
- [ ] Päris leht räägib prod-baasiga, eelvaated dev-baasiga
      (`VITE_`-muutujad on **build**-aja pool, mitte runtime)
- [ ] Varunduses on KAKS faili ja `andmed-*.sql`-ist leiab päris nime
- [ ] Varukoopia on väljaspool repot, pilvesünkroonist eemal, parooliga
- [ ] Meelega tekitatud viga jõudis Sentrysse ja seal EI ole kasutajat
      ega klassikoodi (8.4)
- [ ] Testklass kustutatud
- [ ] `npx supabase projects list` – **link on tagasi dev-i peal**, et
      järgmine katsetus ei läheks kogemata prod-i
