-- 004_realtime_students.sql – liitunud õpilased ilmuvad projektorile ise
--
-- MIKS SEE FAIL OLEMAS ON
-- Samm 2.8 projektorivaade näitab tunni alguses HIIGELSUURT QR-i ja koodi
-- ning nimekirja neist, kes on juba liitunud. See nimekiri peab täienema
-- ISE – 24 last liituvad kahe minuti jooksul ja õpetaja seisab klassi ees,
-- mitte F5 kohal. Klient kuulab selleks `postgres_changes` sündmusi tabelil
-- `students`, aga Postgres saadab muudatusi VÄLJA ainult nende tabelite
-- kohta, mis on loogilise replikatsiooni publikatsioonis. Ilma selle failita
-- kanal ei anna ühtegi viga – ta lihtsalt vaikib, mis on halvim vea liik.
--
-- MIDA SEE EI TEE: SEE EI AVA ANDMEID
-- Realtime kontrollib iga tellija puhul RLS-poliitikaid – rida saadetakse
-- ainult sellele, kes tohiks seda ka tavalise SELECT-iga näha. Meil on see
-- poliitika 002_rls.sql-is olemas (`students_read_teacher`: ainult selle
-- klassi õpetaja). Publikatsioon ütleb „seda tabelit tohib üldse jälgida",
-- mitte „seda tabelit näeb igaüks". Kui `students_read_teacher` kunagi
-- kustutatakse, lõpeb ka voog – lukk jääb RLS-i, mitte siia.
--
-- AINULT students, MITTE kõik tabelid
-- `responses` ja `attempts` on samuti „elavad" andmed, aga elav klassivaade
-- (samm 2.12) ei ole veel olemas ja tema andmemaht on hoopis teine. Iga
-- publikatsioonis olev tabel maksab WAL-i ja Realtime'i kvoodis, seega
-- lisame tabeleid ÜKSHAAVAL siis, kui neid päriselt kuulatakse.

-- ---------------------------------------------------------------------------
-- Publikatsioon ise. Supabase loob `supabase_realtime` uude projekti kaasa,
-- aga mitte iga keskkond ei ole Supabase (kohalik Postgres, testibaas) –
-- seepärast loome ta puudumisel ise. `for all tables` siin EI SOBI: see
-- tõmbaks kaasa ka `join_attempts` (IP-räsid) ja iga tulevase tabeli.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Tabeli lisamine. `alter publication ... add table` ANNAB VEA, kui tabel on
-- juba liige – `if not exists` varianti sellel käsul ei ole. Sammus 2.17
-- jooksevad kõik migratsioonid prod-baasis uuesti, seega kontrollime ise.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'students'
  ) then
    alter publication supabase_realtime add table public.students;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Replica identity jääb VAIKIMISI (primaarvõti).
--
-- Projektorivaade kuulab ainult INSERT-i ja INSERT-i puhul on kogu uus rida
-- WAL-is niikuinii olemas. `replica identity full` oleks vaja alles siis,
-- kui keegi tahab UPDATE/DELETE puhul näha VANU väärtusi – see kirjutaks iga
-- muudatuse juures terve rea WAL-i ja seda me praegu ei osta.
--
-- NB! KUI KUNAGI TAHAD KUULATA ÕPILASE LAHKUMIST (DELETE), LOE SEE LÄBI:
-- Postgres Changes EI RAKENDA RLS-poliitikaid DELETE-sündmustele. Erinevalt
-- INSERT-ist ja UPDATE-ist läheb kustutamise teade KÕIGILE selle tabeli
-- tellijatele, sõltumata `students_read_teacher` poliitikast. Seepärast ei
-- tohi students DELETE-voogu kunagi kasutada millegi autoriseerimiseks ega
-- klassipiiride tõmbamiseks – ainus, mida sealt tohib uskuda, on „mingi rida
-- kadus". Vaikimisi replica identity juures on selles teates ainult
-- primaarvõti (`replica identity full` annaks kõik veerud, aga see tähendaks
-- ka, et iga kustutatud õpilase nimi läheb laiali – seda me kindlasti ei
-- taha).
-- ---------------------------------------------------------------------------
