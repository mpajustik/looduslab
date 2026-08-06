# ETAPP 2: Klassikood ja õpetaja vaade (u 4–5 nädalat)

**Eesmärk:** õpetaja loob klassi, jagab koodi/QR-i, õpilased liituvad ilma
kontota ja õpetaja näeb klassi edenemist.

**Etapp on valmis, kui:** kahe seadme test õnnestub (ühes õpilane vastab,
teises õpetaja näeb) JA turvatest kinnitab, et võõraid andmeid kätte ei saa.

Iga samm = üks töösessioon (30–90 min) = üks commit.

---

## 2.1 Supabase projektid ja CLI

- [ ] Loo supabase.com kontole KAKS projekti: looduslab-dev ja looduslab-prod
      – **osaliselt tehtud (2026-08-05):** ainult `looduslab-dev` on loodud,
      kasutaja kinnitas otsuse. `looduslab-prod` jääb tegemata kuni
      tootmisele lähemale (linnuke jääb lahti, kuni prod on olemas)
- [x] Paigalda Supabase CLI, `supabase login`, `supabase link` (dev-projekt)
      (kasutati `npx supabase`, eraldi paigaldust ei vaja; lingitud
      project-ref `ccqofqdyddeltfszzwlk`)
- [x] .env.local dev-võtmetega; kontrolli, et .env* on .gitignore'is
      (`.env.example` lisatud võltsandmetega; `supabase/.temp/` lisatud
      gitignore'i, sest sisaldab CLI vahemälu, mitte saladusi endid)

## 2.2 Supabase klient

> **Prompt AI-le:** Lisa @supabase/supabase-js ja TanStack Query. Loo
> src/lib/supabase.ts klient env-muutujatest. Ära ühenda veel ühtegi vaadet.

- [x] Build õnnestub; ühenduse test töötab
      (2026-08-05: `supabase.auth.getSession()` tagastas vea asemel
      `null`-sessiooni, aga see üksi ei tõesta võrguühendust – getSession
      loeb kohalikust seansist ega tee tingimata päringut serverisse.
      Kinnituseks tehti täiendav otsepäring `GET /auth/v1/settings` koos
      `apikey` päisega vastu looduslab-dev projekti: HTTP 200 ja projekti
      pärisseaded tagasi – URL ja anon key on kinnitatud õiged)

## 2.3 Migratsioon: tabelid

> **Prompt AI-le:** Kirjuta supabase/migrations/001_tables.sql
> docs/ANDMEMUDEL.md järgi: profiles, classes, students, modules, attempts,
> responses, review_items JA tugitabel join_attempts (pidurduse logi, vajalik
> sammus 2.9). Jäta assignments tabel VÄLJA (MVP-s jagamine = link; sammude
> valik tuleb hiljem); feedback tabel tuleb etapis 4.6. attempts on ÜHE
> MOODULIKÄIGU kohta (status, current_step, unique student+module –
> module_version on SEAL tavaline veerg, MITTE võtme osa), mitte sammu kohta –
> sammu tasandi info elab responses-is. responses on VASTUPIDINE: seal ON
> module_version võtme osa (unique attempt_id + question_id + module_version)
> ja seda EI tuletata attempts pealt – vt docs/ANDMEMUDEL.md kommentaari
> responses juures. See veerg on NOT NULL ja saab muutumatuse triggeri –
> SQL on ANDMEMUDEL-i peatükis „responses.module_version muutumatus",
> võta sealt. modules.slug on unique (slug on globaalselt unikaalne).
> review_items unique student+module+card. Kõik FK-d õpilase
> suunas ON DELETE CASCADE. RLS-i veel MITTE. Ära käivita – näita SQL üle
> vaatamiseks, selgita iga tabelit ühe lausega.

- [ ] Lugesid SQL-i ise läbi → käivita dev-projektis → tabelid on olemas
- [ ] Kontrolli, et attempts-is EI OLE veergu `step` (see oli varasema,
      mitmeti mõistetava skeemi jäänuk)
- [ ] Kontrolli, et responses võtmes ON `module_version` ja `modules.slug`
      on unique – need kaks kaovad kõige kergemini ära
- [ ] Proovi ise: `update responses set module_version = '9.9.9'` peab
      andma vea. Kui ei anna, on trigger tegemata
- [ ] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`)

## 2.4 Migratsioon: RLS

> **Prompt AI-le:** Kirjuta 002_rls.sql: loo reeglid docs/ANDMEMUDEL.md
> tabeli järgi. `enable row level security` ise on juba 001-s iga tabeli
> juures (ülevaatuse leid sammus 2.3: 001 ja 002 vahele võib jääda päevi
> ja seni oli baas lukustamata) – siin jäävad ainult poliitikad. Kontrolli
> siiski üle, et ükski tabel ei ole lukustamata, ka join_attempts
> (tema puhul: mitte keegi ei loe, kirjutab ainult service role). Selgita mulle iga
> reeglit ühe lausega. Ära käivita enne minu kinnitust.

- [ ] Lugesid iga reegli läbi ja said aru → käivita dev-projektis
- [ ] Kiirkontroll: anonüümse võtmega päring ilma sessioonita ei tagasta
      ühtegi rida – VÄLJA ARVATUD `modules`, mis on teadlikult avalik
      (kataloog peab töötama ka külalisele). Kui `attempts` tagastab kasvõi
      ühe rea, on RLS katki
- [ ] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`)

## 2.5 Moodulite metaandmete sünk

> **Prompt AI-le:** Loo npm skript sync-modules: loeb kõigi moodulite
> manifestid ja upsertib need modules tabelisse service-võtmega. Skript
> jookseb arvutis/CI-s, MITTE rakenduses – rakendus ainult loeb modules
> tabelit. Service-võti .env failist (gitignore!).

- [x] Mõlemad pilootmoodulid on modules tabelis; skripti uuesti käivitamine
      ei tekita duplikaate
      (2026-08-06: käivitatud päriselt esimest korda – `.env.local`-is
      puudusid seni `SUPABASE_URL` ja `SUPABASE_SERVICE_ROLE_KEY` (ainult
      `VITE_`-eesliitega muutujad olid olemas), seega ei olnud skript kunagi
      baasi kirjutanud. Tagajärg: `attempts.module_id` võõrvõti põrkas iga
      õpilase esimese vastuse peal (23503), vastus jäi seadmesse
      järjekorda ega jõudnud kunagi õpetaja vaatesse – vt samm 2.11
      „andmebaasi viga ei tohi vastust ära visata". Nüüd sünkitud 2
      moodulit, orpaneid ei leitud)
- [ ] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`)

**Miks:** attempts viitab module_id-le – ilma selle sammuta pole tabelis
ühtegi moodulit, mille külge vastused siduda.

## 2.6 Õpetaja sisselogimine

> **Prompt AI-le:** /opetaja marsruut: magic-link sisselogimine (Supabase
> Auth). Sisselogimata: selgitus + e-posti väli. Sisselogitud töölaua TÜHI
> OLEK juhatab kahe sammuga: „1. Proovi üht tundi ise õpilasena" (link
> moodulile) ja „2. Loo oma esimene klass" – mitte tühi valge ala.

- [x] Magic link jõuab e-postile ja sisselogimine töötab
      (2026-08-05, commit 1855b28; Supabase URL Configuration'isse lisatud
      lubatud suunamis-URL `http://localhost:5173/**`)
- [x] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`): samm käitleb
      sessiooni ja e-posti aadressi (isikuandmed), seega langeb skilli
      riskiloendi alla. Rida lisati tagantjärele, et plaan ja skill ütleksid
      sama. Leiud: CodeRabbit 1 + Codex 3, kõik päris vead, kõik parandatud

**Teadaolev risk:** Supabase'i vaikimisi e-post võib minna rämpsposti ja
päevalimiit on väike. Kui pilootõpetajatel tekib probleeme, seadista oma
SMTP (nt Resend, tasuta tase) – ära lahenda ette, aga tea, kus lahendus on.

## 2.7 Edge Function: klassi loomine

> **Prompt AI-le:** Edge Function create_class_code (docs/ANDMEMUDEL.md voog:
> kood genereeritakse serveris, salvestatakse räsi + aegumisaeg 14 p, kood
> tagastatakse üks kord). Deploy Supabase CLI-ga. Testi curl-iga enne UI-d.

- [x] curl-test: funktsioon loob klassi rea, tagastab koodi, baasis on räsi
      (2026-08-05: 6 testi rohelised – 200 loomine, 200 koodi uuendus uue
      koodiga, 401 ilma tokenita, 400 vigane class_id, 400 mitte-objekt,
      204 CORS-eelpäring `x-client-info`-ga. Baasis 64 märki hex-i, aegumine
      +14 p, koodi uuendus EI tekitanud teist klassirida)
- [x] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`): CodeRabbit 9 +
      Codex 2 leidu, kaks kattusid (CORS `x-client-info`; `code_hash`
      unikaalsust ei jõustanud andmebaas). Mõlemad parandatud – teine tõi
      kaasa migratsiooni `003_class_code_unique.sql`, mida plaan ette ei
      näinud

**Otsus, mis plaanist erineb:** klassikoodi räsi on HMAC-SHA256 + serveri
pipar, mitte bcrypt (docs/ANDMEMUDEL.md „Klassikoodi voog"). Bcrypti sool
teeb koodi järgi otsimise võimatuks – samm 2.9 peaks kõik aegumata klassid
ükshaaval läbi käima. Funktsioon võtab ka `{ class_id }` ja uuendab
olemasoleva klassi koodi, nii et samm 2.8 ei vaja teist Edge Functionit.

**Teadaolev auk:** `npm run lint` ei kontrolli `supabase/functions` kausta
(Deno-kood). Ainus kontroll on deploy + curl-test – vt
supabase/functions/README.md.

## 2.8 Klassi loomise UI + QR

> **Prompt AI-le:** Õpetaja töölaud: „Loo klass" → nimi → kuvatakse kood ja
> QR. QR-i jaoks kasuta väikest qrcode npm-paketti (luba antud – oma QR-
> kodeerija kirjutamine oleks lihtsuse reegli rikkumine teistpidi). Klasside
> nimekiri koos koodi uuendamise nupuga. Lisa nupp „Näita klassile":
> täisekraani projektorivaade – HIIGELSUUR QR + kood + liitunud õpilaste
> nimed reaalajas. See on tunni alguse kriitiline hetk: 24 last peavad
> liituma 2 minutiga.

- [x] Klass tekib, kood + QR kuvatakse, kood on kopeeritav
      (2026-08-05, commit f7101e2; kood elab ainult komponendi mälus –
      lehe värskendamise järel tuleb genereerida uus)
- [x] Projektorivaade on klassi tagant loetav; liitujad ilmuvad ekraanile
      (Supabase Realtime `postgres_changes` tabelil `students`)
- [x] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`): CodeRabbit 5 +
      Codex 2 leidu, neli parandatud (algseisu päring `SUBSCRIBED` sisse,
      päringu vea kuvamine, migratsiooni vale kommentaar DELETE + RLS kohta,
      projektorivaade päris modaaliks), kaks teadlikult jäetud

**Riskisamm, mida plaan ette ei näinud:** projektorivaate „liitujad ilmuvad
ekraanile" nõuab, et `students` oleks Supabase Realtime publikatsioonis –
seega tekkis migratsioon `004_realtime_students.sql`. Migratsioon =
riskisamm, seepärast on ülalpool nüüd ka Codexi rida.

**Auk suletud sammus 2.10:** QR ja projektorivaate aadress viitavad
marsruudile `/liitu/:kood`, mis nüüd on olemas – skannimine viib
liitumislehele, mitte enam 404-le.

## 2.9 Edge Function: liitumine

> **Prompt AI-le:** Edge Function join_class: kontrollib koodi räsi ja
> aegumist, loob students rea. Pidurdus koodi äraarvamise vastu: logi
> ebaõnnestunud katsed tabelisse join_attempts (loodud sammus 2.3) ja pärast
> 10 valet katset 10 minuti jooksul lükka tagasi. IP salvestatakse RÄSITUNA
> (SHA-256 + serveri sool keskkonnamuutujast), MITTE avatekstis – see on
> isikuandmed. Lisa read vanemad kui 24 h kustutav puhastus (pg_cron või
> funktsiooni alguses lihtne delete). Testi curl-iga: õige, vale, aegunud
> kood ja pidurduse rakendumine.

- [ ] Neli curl-testi annavad õiged tulemused
      (2026-08-05 tehtud ja rohelised: õige kood 200, kordusliitumine 200
      sama class_id-ga, vale kood 404, sessioonipiir 5 → 6. katse 429,
      IP piir 10 → värske sessioon saab samuti 429, tühi nimi 400.
      **Puudu:** aegunud kood ja õpetaja token 403 – vajavad SQL Editorit
      ja brauseri tokenit)
- [x] Baasis on ip_hash, mitte loetav IP; üle 24 h vanad read kaovad
      (2026-08-05: `supabase/tests/01-skeem.sql` 14 kontrolli ja
      `02-pidurdus.sql` 7 kontrolli rohelised – sh et pooleliolevad katsed
      EI lähe turvapiiri arvesse ja et üle 24 h vana rida kaob juba
      esimese kutse ajal, ilma pg_cronita)
- [x] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`), kaks ringi:
      esimene CodeRabbit 7 + Codex 3 (võidujooks pidurduses ja 24 h
      säilitus kattusid), teine CodeRabbit 4 + Codex 3. Kokku 8 päris viga
      parandatud, sh üks, mille tõi sisse alles esimese ringi parandus:
      rida kirjutatakse enne koodi kontrolli, seega oleks 24 õiget
      liitumist korraga IP piiri täis lugenud

**Kontrollitud päris keskkonnas (mitte ainult koodi lugedes):**
`anon` roll saab `register_join_attempt` kutsumisel `42501 permission
denied` – EXECUTE äravõtmine töötab. Võltsitud `x-forwarded-for` päisega
EI SAA pidurdusest mööda (värske sessioon + võltsitud päis → ikka 429),
seega IP tuleb usaldusväärsest allikast.

**Uus saladus:** `JOIN_IP_SALT` (≥32 märki), eraldi `CLASS_CODE_PEPPER`-ist –
kui üks lekib, ei tohi see teist puudutada. Seadistus:
supabase/functions/README.md. Samas failis on ka nõue lubada Supabase'i
töölaual anonüümne sisselogimine.

**Erinevus sammust 2.7:** `join_class` kasutab SERVICE-võtit, sest
tabelitel `students` ja `join_attempts` ei ole INSERT-poliitikat (see on
002_rls.sql-is tahtlik). Service-võti käib RLS-ist mööda, seega
turvavõrku selles failis ei ole: õpilase id võetakse alati tokenist.

**Plaanist erinev, ülevaatuse tulemus – migratsioon `005_join_throttle.sql`:**
plaan nägi ette lihtsa loenduse IP kaupa. Ülevaatus näitas, et see ei pea
kolmes kohas vett, seega kolib pidurdus andmebaasi:

1. *Võidujooks.* „Loe arv, siis kirjuta rida" on kaks päringut ja nende
   vahele mahub kogu rünne – 50 korraga saadetud päringut lugesid kõik
   „katseid on 0". Nüüd teeb kontrolli ja logimise üks SQL-funktsioon
   (`register_join_attempt`) nõuandeluku all.
2. *Kooli NAT.* Ainult IP peale ehitatud piir sulgeks 10 näpuvea järel
   liitumise kogu klassile. Nüüd on piir ka **sessiooni kohta: 5 katset**
   (tabab äraarvajat), ja IP piir loeb ainult **kinnitatud
   ebaõnnestumisi**, mitte kõiki päringuid.
3. *Säilitus.* Koristus ainult ebaõnnestumise hetkel jättis vaiksel
   perioodil IP-räsid baasi seisma. Nüüd lisaks pg_cron kord tunnis –
   24 h on tagatis, mitte kõrvalmõju.

**Kolmas piir, mille tõi kaasa atomaarsus ise:** rida kirjutatakse enne,
kui koodi õigsust teatakse, seega on tunni alguses hetk, kus 24 ÕIGET
liitumist on korraga „katsed". Kui neid loetaks turvapiiri sisse, saaks
osa klassist 429 just siis, kui õpetajal on kõige vähem aega viga siluda.
Seepärast on real `outcome`: õnnestunud liitumine kustutab oma rea,
ebaõnnestunu märgitakse `failed`-iks, ja piirid on

| piir | arv | mille vastu |
| --- | --- | --- |
| kinnitatud ebaõnnestumised sessiooni kohta | 5 / 10 min | äraarvaja |
| kinnitatud ebaõnnestumised IP kohta | 10 / 10 min | sessioonide vahetaja |
| pooleliolevad katsed IP kohta | 40 / 1 min | paralleelne puhang |

**Klassivahetus:** sama seade tohib liikuda teise klassi ainult siis, kui
sellega ei ole veel ühtegi moodulikäiku alustatud (409 vastasel juhul).
Ilma selleta kaotaks vana õpetaja õpilase vastused oma vaatest ja uus
õpetaja näeks vastuseid, mis anti hoopis teises klassis.

**Kliendi IP tuleb usaldusväärsest päisest:** `x-forwarded-for` esimene
kirje on see, mille klient ISE saatis (puhverserverid lisavad enda nähtud
aadressi lõppu) – sealt lugemine oleks teinud pidurduse olematuks.
Järjekord: `cf-connecting-ip` → `x-real-ip` → `x-forwarded-for` VIIMANE
kirje. Logisse läheb ainult päise nimi, et saaks pärast deploy'd
kontrollida, milline neist päriselt kohale jõuab.

## 2.10 Õpilase liitumise UI

> **Prompt AI-le:** /liitu/:kood leht: eesnime väli + „Liitu" →
> signInAnonymously → join_class. Veateated eesti keeles (vale kood, aegunud
> kood, proovi hiljem). Pärast liitumist suunatakse kursuselehele; nimi
> kuvatakse ülaribal.

- [x] Liitumine töötab telefonis; vale kood annab arusaadava teate
      (2026-08-05: kontrollitud dev-keskkonnas 360 px ja töölaual;
      anonüümne sisselogimine + join_class töötavad, päris kood viib
      kursuselehele, vale kood annab „Vale või aegunud kood"; CodeRabbiti
      ülevaatus 0 leidu – tavasamm, Codexit plaan ette ei näe)

## 2.11 Vastuste sünkroonimine

> **Prompt AI-le:** Laienda src/engine/progress.ts: kui on Supabase sessioon,
> upsert iga sammu lõpus attempts (üks rida moodulikäigu kohta – uuenda
> current_step ja status) + responses (üks rida vastuse kohta). Salvesta
> kaasa module_version ja question_id. Andmekuju on sama, mis sammus 1.6 –
> muutub ainult sihtkoht. Võrguvea korral järjekorda, hiljem uuesti.
> `mode: "preview"` ei kirjuta ka siin MITTE MIDAGI. Moodulite koodi EI
> muudeta.

- [x] Õpilase vastused ilmuvad dev-projekti tabelitesse koos versiooniga
      (2026-08-05, commit 182ec64; src/lib/progressRemote.ts + progressSync.ts,
      järjekord võrguvea puhuks src/engine/syncQueue.ts, testid
      tests/progressSync.test.ts)
- [x] Ühe mooduli läbimine tekitab TÄPSELT ÜHE attempts rea (mitte ühe
      sammu kohta) ja mitu responses rida
      (upsert saadab iga kord kogu käigu hetkeseisu, mitte muudatust –
      kordussaatmine on kahjutu)
- [x] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`): CodeRabbit 2 +
      Codex 1 leidu, kattuv leid 23503 kohta (andmebaasi viga ei tohi
      vastust ära visata, kuna veakoodi järgi ei saa eristada „ei kuulu
      siia" ja „ei kuulu siia VEEL"). Parandatud

## 2.12 Klassivaade: elav vaade

> **Prompt AI-le:** /opetaja/klass/:id: õpilaste nimekiri, mitmes samm
> igaühel pooleli, uuendus iga 10 s. Amber-märgistus (õpetaja-ala).

- [x] Kood valmis (2026-08-05, /opetaja/klass/:id): õpilaste nimekiri +
      `current_step` tõlgitud sammu numbriks mooduli activities.steps
      järgi, poll iga 10 s. CodeRabbiti ülevaatus – tavasamm: 3 leidu,
      kõik päris vead, kõik parandatud (poll-vastuste võidujooks vale
      järjekorra korral, ebaõnnestunud mooduli laadimine jäi vahemällu
      igaveseks ega proovinud kunagi uuesti, tagasilingi klikiala alla 44 px)
- [ ] **Puudu, vajab kasutaja kätt:** kahe seadme test dev-keskkonnas –
      telefonis vastad, arvutis näed muutust 10 s jooksul

## 2.13 Klassivaade: vastused

> **Prompt AI-le:** Sama lehe teine sakk „Vastused": ennustused kõrvuti
> lõppselgitustega, väljumispiletid, valede vastuste koond küsimuste kaupa
> (väärarusaamade siltidega). Koondi tohib liita ainult sama MAJOR-versiooni
> vastustest (docs/MOODULILEPING.md „Versioonimine") – kui klassis on kahe
> eri major-versiooni vastuseid, näita neid eraldi ja märgi see ära. Grupeeri
> question_id järgi, mitte küsimuse teksti järgi.

- [x] Õpetaja näeb ühe pilguga, mis küsimus valmistas raskusi
      (2026-08-05: /opetaja/klass/:id sai teise saki „Vastused" –
      ennustus↔selgitus paarid, väljumispiletid, valede vastuste koond
      väärarusaama siltide kaupa. Väärarusaama silt ja arvvariandi lahendus
      tulevad taaskasutatud checker/resolve funktsioonidest (src/checker,
      src/engine/resolve.ts), mitte uuest loogikast – õigsus ise loetakse
      salvestatud `responses.is_correct`-ist, mitte arvutatud uuesti (reegel 3))
- [x] Kahe eri major-versiooni vastused ei ole ühte tulpa liidetud
      (rühmitus on module_id + major-versioon; kui klassis on rohkem kui
      üks major, näidatakse seda ka õpetajale tekstina)
- [x] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`): vale koond
      on vaikne viga, õpetaja usub seda
      (2026-08-05: CodeRabbit 3 + Codex 4 leidu, üks kattus (mooduli
      tõlgendus laeb alati praeguse koodi, mitte salvestatud
      `module_version`-i – vt „Teadaolev auk" allpool). Kokku 6 päris viga
      parandatud: pikk vabatekst ei murdnud kaardis (`wrap-break-word`),
      klassi vahetus võis hetkeks näidata eelmise klassi vastuseid
      (`key={id}` sunnib ümbermontaaži), sama õpilase kaks vastust samale
      küsimusele (patch/minor vahepeal) luges koondis kaheks vastanuks
      (dedup värskeima järgi), arvvastuse ühik kuvati topelt kui õpilane
      tippis selle ise kaasa, ennustuse sammu teine küsimus („Miks sa nii
      arvad?") jäi vaatest täiesti välja, kui `recallQuestion` viitas ainult
      esimesele)

**Teadaolev auk:** küsimuse tõlgendus (vastuse õigsuse põhjendus,
väärarusaama silt, arvvariandi tekst) laeb ALATI praeguse mooduli koodi,
mitte seda versiooni, mis oli elus vastuse andmise hetkel. Kuni major ei
muutu, on see docs/MOODULILEPING.md „Versioonimine" reegli järgi tahtlik
(vana vastus PEAB jääma sama koodiga võrreldavaks). Vahetult MAJOR-piiri
ületanud küsimuse puhul ei ole see aga enam õige – vastus visatakse kas
välja (kui küsimus kadus) või tõlgendatakse UUE (mitte päris-vastamis-
hetke) definitsiooni järgi. Täislahendus vajaks küsimuste definitsioonide
versioonipõhist hetktõmmist (nt `modules` tabelisse), mida praegu ei ole –
eraldi samm, kui see reaalselt probleemiks osutub.

## 2.14 Jagamislink

> **Prompt AI-le:** Mooduli juurest kopeeritav link + QR, mis viib õpilase
> OTSE moodulisse (/m/slug). Kui õpilane pole klassiga liitunud, küsitakse
> enne koodi (või „jätka külalisena"). Lisa õpetajale nupp „Vaata õpilasena":
> avab mooduli engine'i preview-režiimis (valmis juba sammust 1.6) – TÄPSELT
> sama vaade, mida õpilane näeb, aga mitte midagi ei salvestata kuhugi.

- [x] Kood valmis (2026-08-06): õpetaja alas uus sektsioon „3. Jaga üksikut
      tundi" – iga mooduli otselink, „Kopeeri link", QR nõudmisel ja „Vaata
      õpilasena" (`?eelvaade=1`). Jagatud lingi avanemisel küsib `/m/:slug`
      klassiga liitumata õpilaselt koodi (`JoinGate`) või laseb edasi
      külalisena; liitumine viib `?edasi=` kaudu TAGASI samasse tundi.
      Liitumise olek loetakse SEADMEST, mitte serverist – jagatud link ei
      tohi enne avanemist supabase-js't (207 kB) alla laadida (reegel 13).
      Aadressid on ühes failis: src/lib/shareLinks.ts.
- [ ] **Puudu, vajab kasutaja kätt:** link telefonis (360 px) → moodul
      avaneb ilma navigeerimiseta; „Vaata õpilasena" ei tekita klassivaatesse
      ridu (kontrolli klassivaatest pärast läbimängu)
- [x] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`)
      (2026-08-06: CodeRabbit 1 + Codex 1 leid, EI kattunud, mõlemad päris
      vead, mõlemad parandatud. (1) Codex: „Jätka külalisena" oli IGAVENE
      otsus – õpilane, kes ühe korra külalist valis, ei näinud enam kunagi
      koodiküsimist ja kogu ta töö kadus õpetaja klassivaatest vaikselt.
      Nüüd on külalise olek nähtav riba peal ja tagasipööratav („Liitu
      klassiga" → `clearGuest`). (2) CodeRabbit: `key` ei sisaldanud
      režiimi, seega `?eelvaade=1` lisamine sama tee peal jättis vana
      `membership`-i alles ja preview-vaates avanenud värav oleks
      localStorage'i kirjutanud – vastuolus reegliga 14.)

**Avatud ümbersuunamine:** `?edasi=` tuleb aadressiribalt ehk võõrast
kohast ja läheb otse `navigate()`-ile. `safeNextPath` (src/lib/shareLinks.ts)
lubab ainult rakenduse sisese tee – `//vale-sait.ee`, `/\vale-sait.ee`,
skeemid ja juhtsümbolid kukuvad välja ning kutsuja läheb `/kursus`-le.
Testid katavad iga piirjuhu (tests/shareLinks.test.ts).

## 2.15 Privaatsus ja kustutamine

> **Prompt AI-le:** (1) /privaatsus leht: mida salvestame (eesnimi,
> vastused; liitumiskatsete IP räsituna 24 tunniks – väärkasutuse tõkkeks),
> mida MITTE (e-post, sünniaeg), kaua ja miks – lihtsas eesti keeles, ka
> lapsevanemale arusaadav. Link jaluses ja liitumislehel.
> (2) Õpetaja saab klassi kustutada: kustutab õpilased, attempts, responses,
> review_items (kinnitusdialoogiga). Kontrolli, et FK-d on ON DELETE CASCADE.

- [x] Kood valmis (2026-08-06): `/privaatsus` (src/app/pages/PrivacyPage.tsx)
      on puhas tekstileht ILMA `lazy`-ta – ta avaneb sageli esimesena
      (link liitumislehelt) ja peab tulema kohe. Link on jaluses (AppLayout,
      igal lehel) ja liitumisvormi all, kus laps oma nime just ära annab.
      Kustutamine on üks päring `classes` tabelisse: RLS `classes_own` lubab
      ainult oma klassi ja ON DELETE CASCADE viib kaasa students → attempts
      → responses ja review_items. Uut migratsiooni EI olnud vaja – cascade
      oli 001_tables.sql-is juba paigas; `supabase/tests/03-kustutamine.sql`
      tõestab selle ära (loob testiklassi, kustutab, kontrollib orbe,
      lõpetab `rollback`-iga).
- [x] `supabase/tests/03-kustutamine.sql` jooksutatud dev-projektis
      (2026-08-06, kasutaja): kõik kontrollid läbisid ehk cascade-ahel on
      päriselt baasis, mitte ainult migratsiooni kavatsuses.
- [ ] **Puudu, vajab kasutaja kätt:** kustuta päris testklass rakendusest
      (kontrolli, et õpilaste arv dialoogis klapib ja et pärast kustutamist
      ei ava klassivaade enam ridu); kustutusdialoog 360 px vaates;
      privaatsuslehe kontaktaadress üle vaadata (praegu isiklik gmail)
- [x] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`): kustutamine
      on pöördumatu, orvuks jäänud read jäävad märkamata
      (2026-08-06: CodeRabbit 3 + Codex 4 leidu, EI kattunud üheski punktis,
      kuus parandatud. Olulisemad kaks: (1) Codex – „Jäta katki" ja Esc
      sulgesid dialoogi ka siis, kui DELETE oli juba teele läinud; klass kadus
      ikka, aga õpetaja uskus, et ta peatas selle. Nüüd on kustutamise ajal
      mõlemad kinni ja ekraanil on seda ka öeldud. (2) Codex – kustutusnupu
      punane tuli `className` kaudu, aga `cn` EI lahenda vastuolulisi
      Tailwindi klasse (src/ui/cn.ts ütleb seda ise): `bg-brand` + `bg-retry`
      võitja otsustanuks stiililehe järjekord ja hävitav nupp võinuks
      renderduda tealina. Nüüd on `danger`/`dangerGhost` variandid
      buttonStyles.ts-is. Ülejäänud neli: privaatsuslehe lubadus ei katnud
      seadmesse jäävat koopiat ega tehnilist ID-d (kaks eraldi leidu),
      klassinime kinnitus ei normaliseerinud täpitähti NFC-sse – iPadi
      klaviatuurilt ei saanuks õpetaja oma klassi üldse kustutada –, ja
      fookus läks pärast kustutamist kadunud nupule. CodeRabbiti „major"
      leid (SQL-test peaks kontrollima auth.users rea kadumist) EI olnud viga:
      rida jääb tahtlikult alles, kontroll ütleb seda nüüd testis välja.)

**Miks nime trükkimine, mitte üks „Kas oled kindel?":** kustutamine võtab
kaasa TEISTE inimeste (õpilaste) töö ja tagasivõtmise nuppu ei ole. Kaks
sarnast nime nimekirjas kõrvuti („8.a füüsika" / „8.b füüsika") on tavaline,
seega peab kinnitus sundima vaatama, MILLIST klassi kustutatakse. Dialoog
näitab ka õpilaste arvu – „kustutan 24 õpilase töö" on hoopis teine lause
kui „kustutan tühja klassi".

**Teadlikult alles:** anonüümsed `auth.users` read jäävad pärast klassi
kustutamist alles (students rea kustutamine ei kustuta auth-kasutajat –
cascade käib teistpidi). Isikuandmeid nad ei sisalda: ei e-posti, ei nime,
ainult id ja ajatempel – nimi elas `students.display_name`-is, mis kustus.
Nende koristamine nõuaks service-võtmega Edge Functionit; teeme selle siis,
kui kontode arv reaalselt segama hakkab.

## 2.16 TURVATEST dev-keskkonnas (kohustuslik – ENNE prod-i loomist!)

Turvatest käib ENNE toodangukeskkonda: prod luuakse alles siis, kui on
tõestatud, et RLS peab. Vastupidine järjekord tähendaks, et internetis on
(kasvõi tühi) andmebaas, mille turvalisust pole keegi kontrollinud.

- [ ] Kaks anonüümset kasutajat (2 inkognito akent): kumbki EI näe teise
      attempts/responses ridu otse supabase-js päringuga (testi konsoolist!)
- [ ] Teine õpetajakonto EI näe esimese klasse ega andmeid
- [ ] Ilma sessioonita päring ei tagasta ridu ühestki tabelist peale
      `modules` (see on teadlikult avalik kataloog)
- [ ] Klassikood andmebaasis on räsi, mitte avatekst; join_attempts-is on
      IP räsi, mitte avatekst
- [ ] Aegunud koodiga ei saa liituda; pidurdus rakendub
- [ ] Service-võti EI ole repos ega brauseris (otsi koodist läbi!)

**Kui üksainus punkt ebaõnnestub, siis etapp EI OLE valmis.**

## 2.17 Toodangukeskkond, varundus ja seire

- [ ] Käivita mõlemad migratsioonid prod-projektis; sync-modules prod-i
- [ ] Korda turvatesti punktid 1–3 prod-is (kiirversioon: 15 min – RLS on
      sama SQL, aga kontrolli, et see ka päriselt käivitatud sai)
- [ ] Cloudflare Workers: production saab prod-võtmed, eelvaated dev-võtmed
- [ ] Varundus: pg_dump skript + juhend (või kontrolli Supabase varunduse
      olemasolu oma plaanil) – enne esimest päris klassi peab olema viis
      andmeid taastada
- [ ] **Veaseire:** Sentry (tasuta tase) – brauseri vead jõuavad sinuni.
      Ilma selleta ei saa sa KUNAGI teada, et õpilasel läks midagi katki –
      õpilane ei kirjuta sulle, ta lihtsalt loobub. Isikuandmeid vearaportisse
      ei saadeta (maski vabatekstid)
- [ ] **Kasutusstatistika:** Cloudflare Web Analytics (küpsisevaba, tasuta) –
      näed lehtede külastusi ilma nõusolekubännerita
- [ ] Kontroll: dev-katsetused EI jõua kunagi prod-andmebaasi

## 2.18 Kasutajatest päris õpetajaga

- [ ] Lase ühel MITTE-tehnilisel kolleegil kogu voog iseseisvalt läbi teha:
      logi sisse → loo klass → näita klassile → (sina liitud õpilasena
      telefonist) → vaata elavat vaadet ja vastuseid. Sina EI ütle midagi,
      ainult vaatled ja märgid üles iga takerdumise
- [ ] Paranda kolm suurimat takerdumist enne, kui pakud süsteemi ühelegi
      päris klassile

**Mõõdupuu:** kui kolleeg küsib kasvõi korra „mida ma nüüd tegema pean?",
on see UI viga, mitte kolleegi viga.
