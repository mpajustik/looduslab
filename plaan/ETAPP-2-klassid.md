# ETAPP 2: Klassikood ja õpetaja vaade (u 4–5 nädalat)

**Eesmärk:** õpetaja loob klassi, jagab koodi/QR-i, õpilased liituvad ilma
kontota ja õpetaja näeb klassi edenemist.

**Etapp on valmis, kui:** kahe seadme test õnnestub (ühes õpilane vastab,
teises õpetaja näeb) JA turvatest kinnitab, et võõraid andmeid kätte ei saa.

Iga samm = üks töösessioon (30–90 min) = üks commit.

---

## 2.1 Supabase projektid ja CLI

- [ ] Loo supabase.com kontole KAKS projekti: looduslab-dev ja looduslab-prod
- [ ] Paigalda Supabase CLI, `supabase login`, `supabase link` (dev-projekt)
- [ ] .env.local dev-võtmetega; kontrolli, et .env* on .gitignore'is

## 2.2 Supabase klient

> **Prompt AI-le:** Lisa @supabase/supabase-js ja TanStack Query. Loo
> src/lib/supabase.ts klient env-muutujatest. Ära ühenda veel ühtegi vaadet.

- [ ] Build õnnestub; ühenduse test (nt supabase.auth.getSession) töötab

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

## 2.4 Migratsioon: RLS

> **Prompt AI-le:** Kirjuta 002_rls.sql: luba RLS IGAL tabelil (ka
> join_attempts – tema puhul: mitte keegi ei loe, kirjutab ainult service
> role) ja loo reeglid docs/ANDMEMUDEL.md tabeli järgi. Selgita mulle iga
> reeglit ühe lausega. Ära käivita enne minu kinnitust.

- [ ] Lugesid iga reegli läbi ja said aru → käivita dev-projektis
- [ ] Kiirkontroll: anonüümse võtmega päring ilma sessioonita ei tagasta
      ühtegi rida – VÄLJA ARVATUD `modules`, mis on teadlikult avalik
      (kataloog peab töötama ka külalisele). Kui `attempts` tagastab kasvõi
      ühe rea, on RLS katki

## 2.5 Moodulite metaandmete sünk

> **Prompt AI-le:** Loo npm skript sync-modules: loeb kõigi moodulite
> manifestid ja upsertib need modules tabelisse service-võtmega. Skript
> jookseb arvutis/CI-s, MITTE rakenduses – rakendus ainult loeb modules
> tabelit. Service-võti .env failist (gitignore!).

- [ ] Mõlemad pilootmoodulid on modules tabelis; skripti uuesti käivitamine
      ei tekita duplikaate

**Miks:** attempts viitab module_id-le – ilma selle sammuta pole tabelis
ühtegi moodulit, mille külge vastused siduda.

## 2.6 Õpetaja sisselogimine

> **Prompt AI-le:** /opetaja marsruut: magic-link sisselogimine (Supabase
> Auth). Sisselogimata: selgitus + e-posti väli. Sisselogitud töölaua TÜHI
> OLEK juhatab kahe sammuga: „1. Proovi üht tundi ise õpilasena" (link
> moodulile) ja „2. Loo oma esimene klass" – mitte tühi valge ala.

- [ ] Magic link jõuab e-postile ja sisselogimine töötab

**Teadaolev risk:** Supabase'i vaikimisi e-post võib minna rämpsposti ja
päevalimiit on väike. Kui pilootõpetajatel tekib probleeme, seadista oma
SMTP (nt Resend, tasuta tase) – ära lahenda ette, aga tea, kus lahendus on.

## 2.7 Edge Function: klassi loomine

> **Prompt AI-le:** Edge Function create_class_code (docs/ANDMEMUDEL.md voog:
> kood genereeritakse serveris, salvestatakse räsi + aegumisaeg 14 p, kood
> tagastatakse üks kord). Deploy Supabase CLI-ga. Testi curl-iga enne UI-d.

- [ ] curl-test: funktsioon loob klassi rea, tagastab koodi, baasis on räsi

## 2.8 Klassi loomise UI + QR

> **Prompt AI-le:** Õpetaja töölaud: „Loo klass" → nimi → kuvatakse kood ja
> QR. QR-i jaoks kasuta väikest qrcode npm-paketti (luba antud – oma QR-
> kodeerija kirjutamine oleks lihtsuse reegli rikkumine teistpidi). Klasside
> nimekiri koos koodi uuendamise nupuga. Lisa nupp „Näita klassile":
> täisekraani projektorivaade – HIIGELSUUR QR + kood + liitunud õpilaste
> nimed reaalajas. See on tunni alguse kriitiline hetk: 24 last peavad
> liituma 2 minutiga.

- [ ] Klass tekib, kood + QR kuvatakse, kood on kopeeritav
- [ ] Projektorivaade on klassi tagant loetav; liitujad ilmuvad ekraanile

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
- [ ] Baasis on ip_hash, mitte loetav IP; üle 24 h vanad read kaovad

## 2.10 Õpilase liitumise UI

> **Prompt AI-le:** /liitu/:kood leht: eesnime väli + „Liitu" →
> signInAnonymously → join_class. Veateated eesti keeles (vale kood, aegunud
> kood, proovi hiljem). Pärast liitumist suunatakse kursuselehele; nimi
> kuvatakse ülaribal.

- [ ] Liitumine töötab telefonis; vale kood annab arusaadava teate

## 2.11 Vastuste sünkroonimine

> **Prompt AI-le:** Laienda src/engine/progress.ts: kui on Supabase sessioon,
> upsert iga sammu lõpus attempts (üks rida moodulikäigu kohta – uuenda
> current_step ja status) + responses (üks rida vastuse kohta). Salvesta
> kaasa module_version ja question_id. Andmekuju on sama, mis sammus 1.6 –
> muutub ainult sihtkoht. Võrguvea korral järjekorda, hiljem uuesti.
> `mode: "preview"` ei kirjuta ka siin MITTE MIDAGI. Moodulite koodi EI
> muudeta.

- [ ] Õpilase vastused ilmuvad dev-projekti tabelitesse koos versiooniga
- [ ] Ühe mooduli läbimine tekitab TÄPSELT ÜHE attempts rea (mitte ühe
      sammu kohta) ja mitu responses rida

## 2.12 Klassivaade: elav vaade

> **Prompt AI-le:** /opetaja/klass/:id: õpilaste nimekiri, mitmes samm
> igaühel pooleli, uuendus iga 10 s. Amber-märgistus (õpetaja-ala).

- [ ] Kahe seadme test: telefonis vastad, arvutis näed 10 s jooksul

## 2.13 Klassivaade: vastused

> **Prompt AI-le:** Sama lehe teine sakk „Vastused": ennustused kõrvuti
> lõppselgitustega, väljumispiletid, valede vastuste koond küsimuste kaupa
> (väärarusaamade siltidega). Koondi tohib liita ainult sama MAJOR-versiooni
> vastustest (docs/MOODULILEPING.md „Versioonimine") – kui klassis on kahe
> eri major-versiooni vastuseid, näita neid eraldi ja märgi see ära. Grupeeri
> question_id järgi, mitte küsimuse teksti järgi.

- [ ] Õpetaja näeb ühe pilguga, mis küsimus valmistas raskusi
- [ ] Kahe eri major-versiooni vastused ei ole ühte tulpa liidetud

## 2.14 Jagamislink

> **Prompt AI-le:** Mooduli juurest kopeeritav link + QR, mis viib õpilase
> OTSE moodulisse (/m/slug). Kui õpilane pole klassiga liitunud, küsitakse
> enne koodi (või „jätka külalisena"). Lisa õpetajale nupp „Vaata õpilasena":
> avab mooduli engine'i preview-režiimis (valmis juba sammust 1.6) – TÄPSELT
> sama vaade, mida õpilane näeb, aga mitte midagi ei salvestata kuhugi.

- [ ] Link telefonis → moodul avaneb ilma navigeerimiseta
- [ ] „Vaata õpilasena" töötab ja EI tekita andmeid klassivaatesse

## 2.15 Privaatsus ja kustutamine

> **Prompt AI-le:** (1) /privaatsus leht: mida salvestame (eesnimi,
> vastused; liitumiskatsete IP räsituna 24 tunniks – väärkasutuse tõkkeks),
> mida MITTE (e-post, sünniaeg), kaua ja miks – lihtsas eesti keeles, ka
> lapsevanemale arusaadav. Link jaluses ja liitumislehel.
> (2) Õpetaja saab klassi kustutada: kustutab õpilased, attempts, responses,
> review_items (kinnitusdialoogiga). Kontrolli, et FK-d on ON DELETE CASCADE.

- [ ] Privaatsusleht olemas; klassi kustutamine viib kõik seotud read kaasa

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
