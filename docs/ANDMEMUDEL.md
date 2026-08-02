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
responses     id, attempt_id, step, question_id, payload (jsonb),
              is_correct (null kui pole hinnatav), revised_count, created_at
              -- ÜKS RIDA = ÜKS VASTUS; siin elab sammu tasandi info
              -- unique (attempt_id, question_id)
review_items  id, student_id, module_id, card_id, due_date, interval_days,
              last_result ('again'|'hard'|'good'), updated_at
              -- unique (student_id, module_id, card_id) – mooduli
              -- teistkordne lõpetamine ei tekita topeltkaarte
```

**Miks attempts on moodulikäigu, mitte sammu kohta** (see oli varem
mitmeti mõistetav): `responses` kannab juba `step`-i, seega sammuridade
hoidmine ka `attempts`-is dubleeriks sama info kahes kohas ja need kaks
võiksid omavahel lahku minna. Nüüd on jaotus üheselt selge:

- „mitmes samm on pooleli" (õpetaja elav vaade) = `attempts.current_step`
  – üks veerg, ilma agregeerimiseta
- „mida ta vastas" = `responses` read
- „kaua moodul võttis" = `finished_at - started_at` ühe rea peal
- `revised_count` on vastuse, mitte sammu omadus – seepärast on ta
  `responses`-is (varem oli sama mõte kaudselt `attempts.status`
  väärtuses 'revised', mis tekitas kaks tõe allikat)

## Tugitabelid

```
join_attempts id, code_prefix, ip_hash, created_at
              -- klassikoodi äraarvamise pidurdus (etapp 2.9)
              -- ip_hash = SHA-256(IP + serveri sool), MITTE avatekstis IP
              -- read kustutatakse automaatselt 24 h pärast (cron)
feedback      id, module_id, module_version, student_id (nullable), body,
              created_at   -- „Märkasid viga?" vorm (etapp 4.6)
```

Need EI ole valikulised: reegel 5 („iga tabel vajab RLS-i") kehtib ka
neile. `join_attempts` sisaldab isikuandmeid (IP räsi) – seepärast räsi,
mitte avatekst, ja seepärast 24 h säilitus. Privaatsusleht (etapp 2.15)
peab seda mainima.

Põhimõtted:

- `payload` on jsonb – küsimuste struktuur muutub, tabel mitte
- Ei kunagi: e-post (v.a õpetaja), sünniaeg, fotod, klassikood avatekstina
- `modules` tabelisse kirjutab ainult sync-modules skript, mitte rakendus
- `module_version` + `question_id` vastuse küljes: kui mooduli sisu hiljem
  muutub, jääb vana vastus seotuks versiooniga, mille kohta ta anti.
  Millal versioon muutub ja miks `question_id` EI TOHI muutuda –
  docs/MOODULILEPING.md „Versioonimine". Ilma selle reeglita laguneb
  õpetaja koondvaade (etapp 2.13) vaikselt ja märkamatult
- `assignments` tabelit (sammude valik, tähtajad) MVP-s EI OLE – jagamine
  käib lingiga. Lisandub 4. etapis, kui päris õpetajad seda küsivad
- Kõik FK-d õpilase suunas on ON DELETE CASCADE – klassi kustutamine viib
  kõik seotud andmed kaasa (GDPR)

## Klassikoodi voog

1. Õpetaja loob klassi → Edge Function `create_class_code` genereerib
   6-kohalise koodi, salvestab bcrypt-räsi + aegumisaja (14 päeva), tagastab
   koodi üks kord
2. Õpilane avab `/liitu/:kood` → anonüümne sisselogimine
   (`signInAnonymously`) → Edge Function `join_class` kontrollib koodi räsi
   vastu ja loob `students` rea
3. Koodi EI kontrollita kunagi brauseris

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
   pidurdus (10 vale katset / 10 min IP kohta). See on klassiruumi, mitte
   panga turvatase – ja see on teadlikult nii.
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
