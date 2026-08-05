# Edge Functionid

Serveripoolne kood, mis jookseb Supabase'i Deno-käituskeskkonnas. Siia
kuulub see, mida brauser EI TOHI teha: klassikoodi genereerimine ja
kontrollimine, `students` rea loomine.

```text
_shared/            mõlema funktsiooni ühiskood (räsi, CORS)
create_class_code/  õpetaja loob klassi või uuendab koodi (samm 2.7)
join_class/         õpilane liitub klassiga (samm 2.9 – tuleb hiljem)
```

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

Vabatahtlik: `ALLOWED_ORIGINS` (komadega eraldatud loend) piirab, milliselt
domeenilt brauser funktsiooni kutsuda saab. Kui seda ei ole, lubatakse kõik –
see on turvaline, sest autentimine käib `Authorization` päisega, mitte
küpsisega.

## Deploy

```bash
npx supabase functions deploy create_class_code
```

Uus migratsioon `003_class_code_unique.sql` peab olema baasis **enne**
deploy'd – funktsioon toetub sellele, et andmebaas keeldub korduvast
`code_hash`-ist (viga 23505 → funktsioon proovib uue koodi).

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
