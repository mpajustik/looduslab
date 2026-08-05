# Edge Functionid

Serveripoolne kood, mis jookseb Supabase'i Deno-käituskeskkonnas. Siia
kuulub see, mida brauser EI TOHI teha: klassikoodi genereerimine ja
kontrollimine, `students` rea loomine.

```text
_shared/            mõlema funktsiooni ühiskood (räsi, CORS)
create_class_code/  õpetaja loob klassi või uuendab koodi (samm 2.7)
join_class/         õpilane liitub klassiga (samm 2.9)
```

**Kaks funktsiooni, kaks eri võtit.** `create_class_code` kirjutab ÕPETAJA
tokeniga, seega kehtib ka seal RLS – koodiviga ei annaks võõrasse klassi
kirjutamist. `join_class` peab kirjutama tabelitesse `students` ja
`join_attempts`, millel EI OLE ühtegi INSERT-poliitikat (002_rls.sql,
tahtlikult), seega kasutab ta service-võtit ja käib RLS-ist MÖÖDA. Seal ei
ole turvavõrku: õpilase id võetakse alati verifitseeritud tokenist, mitte
kunagi päringu kehast.

## Saladus: CLASS_CODE_PEPPER

`code_hash` on `HMAC-SHA256(kood, CLASS_CODE_PEPPER)`. Pipar on juhuslik
vähemalt 32-märgiline string, mis elab AINULT Edge Functionite keskkonnas –
mitte andmebaasis, mitte repos, mitte brauseris (CLAUDE.md reegel 6).

Genereeri ja seadista (üks kord projekti kohta, eraldi dev-is ja prod-is):

```powershell
# Juhuslik pipar. NB! `Get-Random` EI kõlba – see ei ole krüptoturvaline.
# `RandomNumberGenerator::Create()` töötab nii Windows PowerShell 5.1-s
# (.NET Framework) kui ka PowerShell 7-s; meetodit `Fill` 5.1-s EI OLE.
$bytes = [byte[]]::new(48)
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$rng.Dispose()
# Väljund hex-ina, mitte base64-na: base64 sisaldab `+` ja `/`, mis nõuavad
# käsureal jutumärke. 48 baiti = 96 hex-märki (nõue on ≥32).
[System.BitConverter]::ToString($bytes).Replace('-','').ToLower()

npx supabase secrets set CLASS_CODE_PEPPER=<genereeritud-string>
npx supabase secrets list      # kontroll: nimi on nimekirjas, väärtust ei näidata
```

**Pipra vahetamine muudab KÕIK senised klassikoodid kehtetuks** – õpetajad
peavad uued koodid genereerima. Seda ei tehta niisama.

## Saladus: JOIN_IP_SALT (ainult join_class)

Pidurduse logi (`join_attempts`) hoiab IP-d ainult räsina:
`ip_hash = SHA-256(IP + JOIN_IP_SALT)`. IP on isikuandmed – avatekstis me
neid ei salvesta, ka mitte 24 tunniks.

**Miks eraldi saladus, mitte sama pipar.** Kui üks neist kunagi lekib või
tuleb vahetada, ei tohi see teist puudutada. Pipra vahetamine tapaks kõik
kehtivad klassikoodid; soola vahetamine ainult pidurduse ajaloo, mis on
24 h pärast niikuinii kadunud.

Genereeri sama moodi nagu pipar (ülal olev PowerShelli lõik) ja seadista:

```powershell
npx supabase secrets set JOIN_IP_SALT=<genereeritud-string>
```

**Anonüümne sisselogimine peab olema lubatud.** Supabase'i töölaual
Authentication → Sign In / Providers → „Allow anonymous sign-ins". Ilma
selleta ei saa õpilane sessiooni ja `join_class` vastab 401-ga.

Vabatahtlik: `ALLOWED_ORIGINS` (komadega eraldatud loend) piirab, milliselt
domeenilt brauser funktsiooni kutsuda saab. Kui seda ei ole, lubatakse kõik –
see on turvaline, sest autentimine käib `Authorization` päisega, mitte
küpsisega.

## Deploy

```bash
npx supabase functions deploy create_class_code
npx supabase functions deploy join_class
```

Uus migratsioon `003_class_code_unique.sql` peab olema baasis **enne**
deploy'd – funktsioon toetub sellele, et andmebaas keeldub korduvast
`code_hash`-ist (viga 23505 → funktsioon proovib uue koodi).

Sama kehtib `join_class` kohta: **`005_join_throttle.sql` peab olema baasis
enne deploy'd**. Funktsioon kutsub SQL-funktsiooni `register_join_attempt`
ja ilma selleta vastab ta igale liitumisele 503-ga.

**Teadaolev auk:** `npm run lint` EI kontrolli seda kausta – see on Deno-kood
(`npm:` importid, `Deno` globaal), mida brauseri ESLint ja `tsc` ei mõista,
ja `eslint.config.js` jätab selle teadlikult vahele. Ainus kontroll on seega
deploy (katkine import annab kohe vea) ja allolev curl-test. Tee neid mõlemat
iga muudatuse järel – roheline `npm run lint` ei tähenda siin midagi.

## curl-test (create_class_code)

Testi **WSL Ubuntus või Git Bashis**, mitte PowerShellis: Windows
PowerShellis on `curl` hoopis `Invoke-WebRequest`i hüüdnimi ja `-H`, `-d`,
`-w` ei tähenda seal sama asja.

```bash
cd "/mnt/c/Users/merli/Looduslab AI/arendus"
set -a; source .env.local; set +a     # URL ja anon-võti tulevad failist
```

Vaja on veel ÕPETAJA sisselogitud sessiooni tokenit. Logi rakenduses sisse
(`/opetaja`), ava brauseri konsool (F12) ja loe see localStorage'ist:

```js
// supabase-js hoiab sessiooni võtme all sb-<projekti-ref>-auth-token.
// Osad versioonid salvestavad selle base64-na – siin on mõlemad kaetud.
(() => {
  const key = Object.keys(localStorage).find(
    (k) => k.startsWith("sb-") && k.includes("-auth-token"),
  );
  let raw = localStorage.getItem(key);
  if (raw.startsWith("base64-")) raw = atob(raw.slice(7));
  return JSON.parse(raw).access_token;
})();
```

(`supabase` ISE ei ole konsoolis kättesaadav – see on moodulisisene muutuja,
mitte globaal.)

Token aegub tunni jooksul, aga on siiski võti sinu kontole: **ära kleebi
seda otse käsureale** – shell kirjutab käsu ajalukku. Loe ta muutujasse nii,
et sisestus ei ole näha:

```bash
read -rs TOKEN         # kleebi token, vajuta Enter – ekraanile ei ilmu midagi
```

Seejärel (`-w` näitab iga vastuse lõpus HTTP-koodi, mida testis kontrollida):

```bash
SUPABASE_URL=$VITE_SUPABASE_URL
ANON_KEY=$VITE_SUPABASE_ANON_KEY

# 1. uus klass – ootus: 200 + kood
curl -s -w '\nHTTP %{http_code}\n' -X POST "$SUPABASE_URL/functions/v1/create_class_code" \
  -H "Authorization: Bearer $TOKEN" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"8.a füüsika"}'

# 2. sama klassi koodi uuendamine – ootus: 200 + UUS kood, sama class_id
curl -s -w '\nHTTP %{http_code}\n' -X POST "$SUPABASE_URL/functions/v1/create_class_code" \
  -H "Authorization: Bearer $TOKEN" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"class_id":"<eelmisest vastusest>"}'

# 3. ilma tokenita – ootus: 401
curl -s -w '\nHTTP %{http_code}\n' -X POST "$SUPABASE_URL/functions/v1/create_class_code" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Häkkeri klass"}'

# 4. vigane class_id – ootus: 400, mitte 500
curl -s -w '\nHTTP %{http_code}\n' -X POST "$SUPABASE_URL/functions/v1/create_class_code" \
  -H "Authorization: Bearer $TOKEN" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"class_id":"mitte-uuid"}'
```

Kui oled valmis, kustuta token mälust: `unset TOKEN`.

Kontroll baasis (SQL Editor): `select id, name, code_hash, code_expires_at
from classes;` – `code_hash` peab olema 64 märki hex-i, mitte kood ise, ja
`code_expires_at` umbes 14 päeva tulevikus.

## curl-test (join_class)

Õpilase tokenit ei pea brauserist otsima – anonüümse sessiooni saab otse
Auth API-st (sama, mida `signInAnonymously` teeb):

```bash
cd "/mnt/c/Users/merli/Looduslab AI/arendus"
set -a; source .env.local; set +a
SUPABASE_URL=$VITE_SUPABASE_URL
ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Anonüümne õpilase sessioon. Iga kutse annab UUE õpilase – tee uus token,
# kui tahad testida, mitu last liitub.
# `sed` noppib access_token'i välja ilma jq ja node'ita (kumbagi ei pruugi
# WSL Ubuntus olla).
STUDENT=$(curl -s -X POST "$SUPABASE_URL/auth/v1/signup" \
  -H "apikey: $ANON_KEY" -H "Content-Type: application/json" \
  -d '{}' | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')

# Kontroll: peab tulema pikk kolmes osas string (xxx.yyy.zzz), mitte tühjus.
echo "${STUDENT:0:20}..."
```

Kui `STUDENT` jääb tühjaks, ei ole anonüümne sisselogimine töölaual lubatud –
vaata vastust ilma `sed`-ita, seal on siis `"error_code":"anonymous_provider_disabled"`.

Vaja on ka üht KEHTIVAT klassikoodi – loo klass eelmise jaotise 1. testiga
või rakenduses `/opetaja`.

```bash
# 1. õige kood – ootus: 200 + class_id, class_name, display_name
curl -s -w '\nHTTP %{http_code}\n' -X POST "$SUPABASE_URL/functions/v1/join_class" \
  -H "Authorization: Bearer $STUDENT" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"code":"<kehtiv kood>","display_name":"Mari"}'

# 2. sama päring uuesti – ootus: 200, baasis ENDISELT ÜKS students rida
#    (upsert; F5 ja topeltklikk ei tohi anda viga)

# 3. vale kood – ootus: 404 „Vale või aegunud kood"
curl -s -w '\nHTTP %{http_code}\n' -X POST "$SUPABASE_URL/functions/v1/join_class" \
  -H "Authorization: Bearer $STUDENT" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"code":"000000","display_name":"Mari"}'

# 4. aegunud kood – ootus: TÄPSELT SAMA vastus, mis testis 3.
#    Aegumise saab SQL Editoris teha:
#    update classes set code_expires_at = now() - interval '1 day' where id = '<uuid>';
#    (pärast testi tee uus kood nupuga „Uuenda koodi")

# 5. pidurdus SESSIOONI kohta – ootus: 5 valet katset 404, 6. katse 429
#    ENNE seda nulli loendur SQL Editoris, muidu on testide 3 ja 4 katsed
#    juba arvel ja piir saab täis varem: delete from join_attempts;
for i in $(seq 1 6); do
  curl -s -o /dev/null -w "$i: HTTP %{http_code}\n" -X POST "$SUPABASE_URL/functions/v1/join_class" \
    -H "Authorization: Bearer $STUDENT" \
    -H "apikey: $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d '{"code":"111111","display_name":"Mari"}'
done

# 6. õpetaja token – ootus: 403 (õpetaja ei liitu õpilasena)
curl -s -w '\nHTTP %{http_code}\n' -X POST "$SUPABASE_URL/functions/v1/join_class" \
  -H "Authorization: Bearer $TOKEN" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"code":"<kehtiv kood>","display_name":"Õpetaja"}'

# 7. klassivahetus – ootus: 409, kui seadmega on juba töid tehtud.
#    Tee test 1 läbi, siis SQL Editoris teeskle tehtud tööd:
#    insert into attempts (student_id, module_id, module_version)
#    values ('<students.id>', '<mõni modules.id>', '1.0.0');
#    ja proovi liituda TEISE klassi koodiga:
curl -s -w '\nHTTP %{http_code}\n' -X POST "$SUPABASE_URL/functions/v1/join_class" \
  -H "Authorization: Bearer $STUDENT" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"code":"<teise klassi kood>","display_name":"Mari"}'
#    Ilma tehtud töödeta peab sama päring andma 200 – tühi seade tohib liikuda.
```

NB! Õnnestunud liitumine (200) ei kuluta pidurduse eelarvet – funktsioon
kustutab oma katserea ära. Kontrolli seda: pärast testi 1 peab
`join_attempts` olema selle sessiooni osas tühi.

Pärast testi 5 on see sessioon 10 minutiks kinni. Uue tokeni saab
`STUDENT=$(...)` käsuga – aga sama IP-lt lubab pidurdus kokku 10 kinnitatud
ebaõnnestumist 10 minutis, seega jätkub neid umbes kahe sessiooni jagu.

Kontroll baasis (SQL Editor):

```sql
select code_prefix, ip_hash, student_id, outcome, created_at from join_attempts;
-- ip_hash peab olema 64 märki hex-i, MITTE loetav IP
-- code_prefix ainult 2 märki, mitte terve kood
-- outcome peab vale koodi järel olema 'failed'. Kui sinna jääb 'pending',
-- ei jõudnud funktsioon katset kinnitada – siis on pidurdus LEEBEM kui
-- lubatud ja logis peab olema "Katse märkimine ebaõnnestus"

select id, class_id, display_name from students;
-- id = anonüümse auth-kasutaja id (auth.users-is olemas)
```

24 h säilitust ei pea kella taga ootama: sisesta vana rida käsitsi ja tee
üks liitumiskatse – rida peab kaduma.

```sql
insert into join_attempts (code_prefix, ip_hash, created_at)
values ('99', 'test', now() - interval '25 hours');
```

Vaikse perioodi katab pg_cron (töö `join_attempts_cleanup`, kord tunnis).
Kontrolli, et töö on olemas ja jookseb:

```sql
select jobname, schedule, active from cron.job;
select status, start_time from cron.job_run_details
 where jobname = 'join_attempts_cleanup' order by start_time desc limit 5;
```

Kui `cron.job` on tühi, ei olnud pg_cron laiendust saadaval – migratsioon
ütles siis `notice`-ina välja ja koristus jääb ainult funktsiooni kanda.

Lõpetuseks: `unset STUDENT TOKEN`.
