# Andmemudel ja RLS

Seitse põhitabelit katavad kogu esimese aasta õppetöö; lisaks kaks
tugitabelit (turvalogi ja tagasiside), mis ei sisalda õppesisu.
Migratsioonid on SQL-failid kaustas `supabase/migrations/` ja need
käivitatakse ainult pärast kasutaja ülevaatust.

## Põhitabelid

```
teachers      = auth.users (Supabase Auth, magic link) + profiles(nimi)
classes       id, teacher_id, name, code_hash, code_expires_at, created_at
students      id (= anonüümse auth-kasutaja id), class_id, display_name, created_at
modules       id (text, nt 'physics.peegeldumisseadus'), slug, title, subject,
              status, version, minutes (jsonb)  -- kirjutab AINULT sync-modules
              -- unique (slug) – slug on globaalselt unikaalne üle KÕIGI
              -- ainete, sest marsruut on /m/:slug ilma aineta
              -- (docs/MOODULILEPING.md „Slug-konventsioon")
              -- NB: kursusesse kuulumist andmebaasis EI OLE – struktuur elab
              -- kursusefailides (docs/SISUHALDUS.md)
attempts      id, student_id, module_id, module_version,
              status ('started'|'completed'), current_step,
              started_at, finished_at
              -- ÜKS RIDA = ÜKS MOODULIKÄIK (mitte üks samm!)
              -- unique (student_id, module_id) – versioon EI kuulu võtmesse:
              -- patch/minor uuendus keset moodulit ei tohi tekitada uut rida
              -- ega nullida current_step'i. module_version = viimati kasutatud
              -- versioon (upsert uuendab). Major-versioonide eristamine on
              -- koondvaate loogika (docs/MOODULILEPING.md „Versioonimine")
responses     id, attempt_id, module_version, step, question_id, payload (jsonb),
              is_correct (null kui pole hinnatav), revised_count, created_at
              -- ÜKS RIDA = ÜKS VASTUS; siin elab sammu tasandi info
              -- module_version on NOT NULL ja muutumatu: kirjutatakse
              -- sisestamisel, hilisem UPDATE tõstab vea (trigger allpool).
              -- Seda EI TOHI lugeda attempts pealt: seal upsertitakse see
              -- viimati kasutatud versiooniks ja vana vastus saaks vale sildi
              -- unique (attempt_id, question_id, module_version) – sama
              -- versiooni sees upsert (revised_count++), versioonide vahel
              -- tekib eraldi rida ja vana vastus jääb oma versiooni külge
review_items  id, student_id, module_id, card_id, due_date, interval_days,
              last_result ('again'|'hard'|'good'), updated_at
              -- unique (student_id, module_id, card_id) – mooduli
              -- teistkordne lõpetamine ei tekita topeltkaarte
              -- HINNANGUT EI KIRJUTATA otse: vt save_review_items allpool
```

**`review_items` ja kaks seadet** (samm 3.6). Kaardil on kolm eri kirjutust
ja nad EI OLE sama tehe:

| Tehe | Kuidas | Miks nii |
| --- | --- | --- |
| uus kaart | `upsert`, `ignoreDuplicates: true` | olemasoleval real võib teine seade intervalli juba kolme nädala peale kasvatanud olla |
| hinnang | `rpc('save_review_items')` | vt allpool |
| lugemine | `select` oma ridade pealt | teises seadmes lõpetatud moodul peab siia jõudma |

Hinnang ei saa käia tavalise upsertiga, sest see kirjutab rea üle
TINGIMUSETA. Kaks seadet, sama kaart: telefonis kell 10:00 „Teadsin",
arvutis kell 09:55 „Ei mäletanud" – kui arvuti päring viibib võrgus ja
jõuab kohale hiljem, kaob õpilase viimane hinnang. Seadmepoolne liitmine
(`incomingReviewItems`) seda ei päästa, sest konflikt tekib serveris.

Seepärast on funktsioon `public.save_review_items(jsonb)`
(`supabase/migrations/006_review_save.sql`): `on conflict … do update …
where excluded.updated_at > review_items.updated_at`. PostgREST-i upsertile
sellist tingimust anda ei saa – see on puhas SQL. Funktsioon on
**`security invoker`**, seega RLS kehtib täpselt nagu otsepäringul, ja
`student_id` võetakse `auth.uid()` pealt, mitte kliendi saadetud väljast.

**Miks attempts on moodulikäigu, mitte sammu kohta** (see oli varem
mitmeti mõistetav): `responses` kannab juba `step`-i, seega sammuridade
hoidmine ka `attempts`-is dubleeriks sama info kahes kohas ja need kaks
võiksid omavahel lahku minna. Nüüd on jaotus üheselt selge:

- „mitmes samm on pooleli" (õpetaja elav vaade) = `attempts.current_step`
  – üks veerg, ilma agregeerimiseta. Väärtus on sammu **ID** (`explore-2`),
  mitte järjekorranumber: number näitaks uues versioonis vale sammu peale,
  id on igavene (CLAUDE.md reegel 11). Õpetaja vaade tõlgib id numbriks
  mooduli sammude järgi
- „mida ta vastas" = `responses` read
- „kaua moodul võttis" = `finished_at - started_at` ühe rea peal
- `revised_count` on vastuse, mitte sammu omadus – seepärast on ta
  `responses`-is (varem oli sama mõte kaudselt `attempts.status`
  väärtuses 'revised', mis tekitas kaks tõe allikat)

## Tugitabelid

```
join_attempts id, code_prefix, ip_hash, student_id, created_at
              -- klassikoodi äraarvamise pidurdus (etapp 2.9)
              -- ip_hash = SHA-256(IP + JOIN_IP_SALT), MITTE avatekstis IP
              -- student_id = anonüümne konto, kes katse tegi
              -- outcome = 'pending' | 'failed' (õnnestunud liitumise rida
              -- kustutatakse) – piirid loevad KINNITATUD ebaõnnestumisi:
              -- 5 sessiooni ja 10 IP kohta 10 minutis, lisaks 40 poolelolevat
              -- IP kohta 1 minutis (puhangupiir). Ainult IP peale ehitatud
              -- piir sulgeks kooli NAT-i taga kogu klassi korraga; kõiki
              -- päringuid lugev piir sööks 24 lapse liitumisega ise täis
              -- kirjutab AINULT SQL-funktsioon register_join_attempt
              -- (005_join_throttle.sql): kontroll ja logimine peavad olema
              -- ÜKS atomaarne käik, muidu saab paralleelsusega piirist mööda
              -- read kustutatakse 24 h pärast: pg_cron kord tunnis + sama
              -- funktsioon iga katse juures
feedback      id, module_id, module_version, student_id (nullable), body,
              created_at   -- „Märkasid viga?" vorm (etapp 4.6)
```

Need EI ole valikulised: reegel 5 („iga tabel vajab RLS-i") kehtib ka
neile. `join_attempts` sisaldab isikuandmeid (IP räsi) – seepärast räsi,
mitte avatekst, ja seepärast 24 h säilitus. Privaatsusleht (etapp 2.15)
peab seda mainima.

Põhimõtted:

- `payload` on jsonb – küsimuste struktuur muutub, tabel mitte. Siin elab ka
  `variantId`: MILLISE arvuvariandiga küsimusele vastus anti
  (docs/MOODULILEPING.md „Juhuslikkus"). Ilma selleta ei tähenda „55"
  koondvaates midagi – ta on õige ühe variandi ja vale teise juures. Variant
  ise loositakse `attempts.started_at` põhjal, seega uut veergu vaja ei ole:
  sama käik = sama variant, „Alusta uuesti" = uus käik = uus loos
- Ei kunagi: e-post (v.a õpetaja), sünniaeg, fotod, klassikood avatekstina
- `modules` tabelisse kirjutab ainult sync-modules skript, mitte rakendus
- `module_version` + `question_id` **`responses` rea enda küljes** (mitte
  `attempts` kaudu!): kui mooduli sisu hiljem muutub, jääb vana vastus
  seotuks versiooniga, mille kohta ta anti. `attempts.module_version`
  näitab ainult viimati kasutatud versiooni – kui koondvaade loeks
  versiooni sealt, saaks eile antud vastus täna avaldatud versiooni sildi.
  Millal versioon muutub ja miks `question_id` EI TOHI muutuda –
  docs/MOODULILEPING.md „Versioonimine". Ilma selle reeglita laguneb
  õpetaja koondvaade (etapp 2.13) vaikselt ja märkamatult
- `assignments` tabelit (sammude valik, tähtajad) MVP-s EI OLE – jagamine
  käib lingiga. Lisandub 4. etapis, kui päris õpetajad seda küsivad
- Kõik FK-d õpilase suunas on ON DELETE CASCADE – klassi kustutamine viib
  kõik seotud andmed kaasa (GDPR)

## Klassikoodi voog

1. Õpetaja loob klassi → Edge Function `create_class_code` genereerib
   6-kohalise numbrikoodi, salvestab räsi + aegumisaja (14 päeva), tagastab
   koodi üks kord
2. Õpilane avab `/liitu/:kood` → anonüümne sisselogimine
   (`signInAnonymously`) → Edge Function `join_class` kontrollib koodi räsi
   vastu ja loob `students` rea
3. Koodi EI kontrollita kunagi brauseris

**Räsi on HMAC-SHA256, mitte bcrypt.** Bcrypt-räsi sisaldab juhuslikku
soola, seega sama kood annab iga kord erineva räsi ja koodi järgi EI SAA rida
üles otsida – `join_class` peaks kõik aegumata klassid ükshaaval läbi käima
(~100 ms räsi kohta). Liitumine peab mahtuma tunni algusesse, seega valisime
determinstliku räsi: `code_hash = HMAC-SHA256(kood, CLASS_CODE_PEPPER)` →
liitumine on üks indekseeritud päring.

Kiire räsi on ka ründajale kiire, seepärast on selle turvalisus **pipras**:
`CLASS_CODE_PEPPER` on juhuslik ≥32-märgiline saladus, mis elab AINULT Edge
Functionite keskkonnas (`supabase secrets set`), mitte andmebaasis ega koodis.
Ainuüksi andmebaasi leke ei anna seega ühtegi koodi kätte. Pipra vahetamine
muudab kõik senised koodid kehtetuks – seda ei tehta niisama.

**Pipar kaitseb AINULT andmebaasi lekke vastu.** Ta ei vähenda kuidagi seda,
et kuuekohalisi koode on miljon ja neid saab võrgu kaudu ükshaaval proovida –
seal on kaitseks hoopis `join_class` pidurdus (10 minuti aknas 5 vale
katset sessiooni ja 10 IP kohta, `join_attempts` tabel), ühesugune veateade
iga ebaõnnestumise puhul
(„vale või aegunud kood", mitte „selline kood on olemas, aga aegunud") ja
14 päeva aegumine. Need kaks kaitset on eri asjade vastu ja kumbki ei asenda
teist.

`classes.code_hash` on unikaalne indeks (`003_class_code_unique.sql`) – üks
kood ei tohi kunagi viidata kahele klassile. Unikaalsust ei jõusta
rakenduskood, vaid andmebaas: „kontrolli, siis kirjuta" jätaks kahe
samaaegse päringu vahele augu.

## RLS-reeglid (iga tabel, enne esimest päris kasutajat!)

| Tabel | SELECT | INSERT/UPDATE |
|---|---|---|
| profiles | õpetaja: enda rida | õpetaja: enda rida |
| classes | õpetaja: enda klassid | õpetaja: enda klassid |
| students | õpilane: enda rida; õpetaja: oma klasside read | ainult Edge Function (service role) |
| modules | kõik (avalik lugemine) | mitte keegi (ainult service role) |
| attempts | õpilane: enda omad; õpetaja: oma klasside omad | õpilane: ainult enda omad |
| responses | sama mis attempts | õpilane: ainult enda omad |
| review_items | õpilane: enda omad | õpilane: enda omad |
| join_attempts | mitte keegi | ainult Edge Function (service role) |
| feedback | õpetaja: oma klasside moodulite kohta | õpilane ja õpetaja: enda oma |

Malli näide (attempts):

```sql
alter table attempts enable row level security;

create policy "student_own" on attempts
  for all using (student_id = auth.uid());

create policy "teacher_read" on attempts
  for select using (
    exists (select 1 from students s
            join classes c on c.id = s.class_id
            where s.id = attempts.student_id
              and c.teacher_id = auth.uid()));
```

## `responses.module_version` muutumatus (trigger)

RLS lubab õpilasel oma `responses` rida UPDATE-ida – see on `revised_count`
jaoks vajalik. Seega ei takista miski sama päringut versiooni üle
kirjutamast: üks viga `progress.ts`-is, mis paneb payloadi jooksva
versiooni, ja vana vastus saab uue sildi. „Ei muutu kunagi" peab olema
andmebaasi kitsendus, mitte kokkulepe:

```sql
-- veerg ise: create table responses (...) sees, mitte eraldi
--   module_version text not null,

-- muutumatus
create or replace function responses_version_immutable()
returns trigger language plpgsql as $$
begin
  if new.module_version is distinct from old.module_version then
    raise exception 'responses.module_version on muutumatu (vana=%, uus=%)',
      old.module_version, new.module_version;
  end if;
  return new;
end $$;

create trigger responses_version_immutable
  before update on responses
  for each row execute function responses_version_immutable();
```

**Miks trigger, mitte `revoke update (module_version)`:** rakendus salvestab
upsert'iga (`insert … on conflict do update`) ja saadab selle veeru kaasa ka
siis, kui väärtus ei muutu. Õiguse äravõtmine katkestaks tavalise
salvestamise; trigger ärkab ainult päris muutuse peale.

## Teadlikud otsused ja teadaolevad piirangud

Need on kompromissid, mis on tehtud lihtsuse kasuks. Ära lase AI-l neid
„ära parandada" ilma sinu otsuseta.

1. **Anonüümne konto on seadmepõhine.** Kui õpilane vahetab seadet või
   kustutab brauseriandmed, tekib uuel liitumisel uus õpilase rida.
   Leevendus: liitumine on 20 sekundi töö; õpetaja näeb topeltnime ja MVP-s
   me lihtsalt aktsepteerime seda. Ridade liitmise tööriist – alles siis,
   kui päris kasutus näitab vajadust.
2. **Safari/iOS võib ~7 päeva mitteaktiivsuse järel seadme andmed
   kustutada** (localStorage + sessioon). Tähendus: iPhone'i õpilane võib
   nädalase pausi järel vajada uuesti liitumist. Sama leevendus kui p 1 –
   ja veel üks põhjus, miks liitumine PEAB olema kiire.
3. **Külalise edenemise hilisem serverisse tõstmine** (kui ta liitub
   klassiga pärast moodulite läbimist) EI OLE MVP-s. Külalise edenemine jääb
   seadmesse. Lisandub hiljem, kui vajadus on päriselt olemas.
4. **Klassikoodi turvamudel:** 6-kohaline kood + räsi + 14 p aegumine +
   pidurdus (10 minutis 5 valet katset sessiooni ja 10 IP kohta). See on
   klassiruumi, mitte panga turvatase – ja see on teadlikult nii.
5. **Realtime asemel 10 s intervall** õpetaja vaates – lihtsam, piisav.

## Kohustuslik turvatest (ENNE toodangukeskkonna loomist!)

Kahe erineva anonüümse kasutajaga: kasutaja A EI TOHI näha kasutaja B
`attempts`/`responses` ridu ühegi päringuga. Õpetaja X EI TOHI näha õpetaja Y
klassi. Testi supabase-js päringutega, mitte ainult UI kaudu.

NB! `modules` on TEADLIKULT avalik lugemiseks (kataloog peab töötama ka
sisselogimata külalisele) – seega „ilma sessioonita päring ei tagasta
ühtegi rida" kehtib kõigi tabelite kohta PEALE `modules`. Ära lase sellel
end eksitada: kui `modules` tagastab ridu, on kõik korras; kui `attempts`
tagastab kasvõi ühe rea, on RLS katki.
