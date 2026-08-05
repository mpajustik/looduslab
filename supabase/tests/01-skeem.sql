-- 01-skeem.sql – kas baas on selline, nagu migratsioonid lubasid?
--
-- AINULT LOEB. Ei muuda mitte midagi, seega tohib jooksutada ka prod-baasis
-- keset tundi. Kleebi kogu fail SQL Editorisse ja vajuta Run.
--
-- Tulemus on tabel, kus igal real on veerg `seis`: OK või VIGA.
-- Kui kõik on korras, on kõik read OK.
--
-- Kontrollid käivad kataloogide (pg_class, pg_policies, …) vastu, mitte
-- andmete vastu – seepärast ei sõltu tulemus sellest, kas keegi on juba
-- liitunud.

with kontrollid as (

  -- 1. RLS peab olema sisse lülitatud IGAL public-skeemi tabelil.
  --    Reegel 5: tabel ilma RLS-ita on poolik migratsioon.
  select
    'RLS on kõigil tabelitel'                                   as kontroll,
    'kõik tabelid'                                              as ootus,
    coalesce(string_agg(c.relname, ', '), 'ükski ei puudu')     as tegelik,
    case when count(*) = 0 then 'OK' else 'VIGA' end            as seis
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
    and c.relrowsecurity = false

  union all

  -- 2. join_attempts EI TOHI omada ühtegi poliitikat. See on tahtlik:
  --    tabelit loeb ja kirjutab ainult Edge Function service-võtmega.
  --    Poliitika siin tähendaks, et keegi klient pääseb ligi.
  select
    'join_attempts on ilma poliitikateta',
    '0 poliitikat',
    count(*)::text,
    case when count(*) = 0 then 'OK' else 'VIGA' end
  from pg_policies
  where schemaname = 'public' and tablename = 'join_attempts'

  union all

  -- 3. Pidurdusfunktsioon peab olemas olema (005_join_throttle.sql).
  select
    'register_join_attempt on olemas',
    'olemas',
    case when to_regprocedure(
      'public.register_join_attempt(text,uuid,text,integer,integer,integer,integer,integer)'
    ) is null then 'PUUDUB' else 'olemas' end,
    case when to_regprocedure(
      'public.register_join_attempt(text,uuid,text,integer,integer,integer,integer,integer)'
    ) is null then 'VIGA' else 'OK' end

  union all

  -- 4. Kliendirollid EI TOHI seda funktsiooni kutsuda saada. Kui saaksid,
  --    kirjutaks õpilane pidurduse logi ise täis ja kaitse oleks olematu.
  --    NB! õpilase JWT roll on `authenticated`, mitte `anon`.
  select
    'anon ja authenticated EI SAA pidurdust kutsuda',
    'mõlemal keelatud',
    case
      when to_regprocedure(
        'public.register_join_attempt(text,uuid,text,integer,integer,integer,integer,integer)'
      ) is null then 'funktsioon puudub'
      else
        'anon=' || has_function_privilege('anon',
          'public.register_join_attempt(text,uuid,text,integer,integer,integer,integer,integer)',
          'execute')::text ||
        ', authenticated=' || has_function_privilege('authenticated',
          'public.register_join_attempt(text,uuid,text,integer,integer,integer,integer,integer)',
          'execute')::text
    end,
    case
      when to_regprocedure(
        'public.register_join_attempt(text,uuid,text,integer,integer,integer,integer,integer)'
      ) is null then 'VIGA'
      when has_function_privilege('anon',
             'public.register_join_attempt(text,uuid,text,integer,integer,integer,integer,integer)',
             'execute')
        or has_function_privilege('authenticated',
             'public.register_join_attempt(text,uuid,text,integer,integer,integer,integer,integer)',
             'execute')
      then 'VIGA' else 'OK'
    end

  union all

  -- 5. service_role peab seda SAAMA kutsuda – muidu ei tööta liitumine.
  select
    'service_role SAAB pidurdust kutsuda',
    'lubatud',
    case
      when to_regprocedure(
        'public.register_join_attempt(text,uuid,text,integer,integer,integer,integer,integer)'
      ) is null then 'funktsioon puudub'
      else has_function_privilege('service_role',
        'public.register_join_attempt(text,uuid,text,integer,integer,integer,integer,integer)',
        'execute')::text
    end,
    case
      when to_regprocedure(
        'public.register_join_attempt(text,uuid,text,integer,integer,integer,integer,integer)'
      ) is null then 'VIGA'
      when has_function_privilege('service_role',
        'public.register_join_attempt(text,uuid,text,integer,integer,integer,integer,integer)',
        'execute') then 'OK'
      else 'VIGA'
    end

  union all

  -- 6. outcome piirang: ainult 'pending' või 'failed'. Õnnestunud liitumise
  --    rida kustutatakse, seega kolmandat väärtust ei tohi tekkida.
  select
    'join_attempts.outcome piirang',
    'olemas',
    coalesce((select 'olemas' from pg_constraint
              where conname = 'join_attempts_outcome_check'), 'PUUDUB'),
    case when exists (select 1 from pg_constraint
                      where conname = 'join_attempts_outcome_check')
         then 'OK' else 'VIGA' end

  union all

  -- 7. Indeksid, mida pidurdus ja koristus vajavad. Ilma nendeta töötab
  --    kõik õigesti, aga aeglaselt – ja seda märkab alles klassitäie peal.
  select
    'pidurduse indeksid',
    '3 tükki',
    count(*)::text,
    case when count(*) = 3 then 'OK' else 'VIGA' end
  from pg_indexes
  where schemaname = 'public'
    and indexname in ('join_attempts_ip_hash_idx',
                      'join_attempts_student_id_idx',
                      'join_attempts_created_at_idx')

  union all

  -- 8. Klassikoodi räsi peab olema unikaalne (003_class_code_unique.sql) –
  --    üks kood ei tohi kunagi viidata kahele klassile.
  select
    'classes.code_hash on unikaalne',
    'olemas',
    coalesce((select 'olemas' from pg_indexes
              where schemaname = 'public' and tablename = 'classes'
                and indexdef ilike '%unique%code_hash%' limit 1), 'PUUDUB'),
    case when exists (select 1 from pg_indexes
                      where schemaname = 'public' and tablename = 'classes'
                        and indexdef ilike '%unique%code_hash%')
         then 'OK' else 'VIGA' end

  union all

  -- 9. students peab olema Realtime publikatsioonis (004) – muidu
  --    projektorivaade lihtsalt VAIKIB, ilma ühegi veata.
  select
    'students on Realtime publikatsioonis',
    'jah',
    case when exists (select 1 from pg_publication_tables
                      where pubname = 'supabase_realtime'
                        and schemaname = 'public' and tablename = 'students')
         then 'jah' else 'EI' end,
    case when exists (select 1 from pg_publication_tables
                      where pubname = 'supabase_realtime'
                        and schemaname = 'public' and tablename = 'students')
         then 'OK' else 'VIGA' end

  union all

  -- 10. join_attempts EI TOHI olla Realtime publikatsioonis – seal on
  --     IP-räsid ja neid ei saadeta kellelegi välja.
  select
    'join_attempts EI OLE Realtime publikatsioonis',
    'ei',
    case when exists (select 1 from pg_publication_tables
                      where pubname = 'supabase_realtime'
                        and schemaname = 'public' and tablename = 'join_attempts')
         then 'JAH' else 'ei' end,
    case when exists (select 1 from pg_publication_tables
                      where pubname = 'supabase_realtime'
                        and schemaname = 'public' and tablename = 'join_attempts')
         then 'VIGA' else 'OK' end

  union all

  -- 11. Andmete hügieen: ükski katse ei tohi olla vanem kui 24 h.
  --     docs/ANDMEMUDEL.md lubab seda ja privaatsusleht kordab.
  select
    'ükski katse pole vanem kui 24 h',
    '0 rida',
    count(*)::text,
    case when count(*) = 0 then 'OK' else 'VIGA' end
  from join_attempts
  where created_at < now() - interval '24 hours'

  union all

  -- 12. IP peab olema räsitud, mitte avatekstis. SHA-256 hex = 64 märki;
  --     lühem või pikem väärtus tähendab, et sinna kirjutati midagi muud.
  select
    'ip_hash on räsi (64 märki)',
    '0 valet rida',
    count(*)::text,
    case when count(*) = 0 then 'OK' else 'VIGA' end
  from join_attempts
  where length(ip_hash) <> 64

  union all

  -- 13. Koodist tohib logis olla ainult algus.
  select
    'code_prefix on kuni 2 märki',
    '0 valet rida',
    count(*)::text,
    case when count(*) = 0 then 'OK' else 'VIGA' end
  from join_attempts
  where length(code_prefix) > 2

  union all

  -- 14. Kinni jäänud `pending` read. Üksik värske pending on normaalne
  --     (päring on parajasti pooleli), aga tunni vanune tähendab, et
  --     Edge Function ei jõudnud katset kinnitada – siis on pidurdus
  --     lubatust LEEBEM ja logis peab olema "Katse märkimine ebaõnnestus".
  select
    'kinni jäänud pending-katsed',
    '0 rida',
    count(*)::text,
    case when count(*) = 0 then 'OK' else 'VIGA' end
  from join_attempts
  where outcome = 'pending'
    and created_at < now() - interval '1 hour'
)

select kontroll, ootus, tegelik, seis
from kontrollid
order by (seis = 'OK'), kontroll;   -- VIGA read tulevad ette

-- ---------------------------------------------------------------------------
-- pg_cron kontroll on eraldi, sest kui laiendust EI OLE, siis päring
-- `cron.job` peale annab vea juba enne käivitamist ja lõhuks kogu ülaloleva
-- tabeli. Käivita see rida eraldi:
--
--   select jobname, schedule, active from cron.job;
--
-- Ootus: rida `join_attempts_cleanup`, `17 * * * *`, active = true.
-- Kui tuleb viga "relation cron.job does not exist", ei olnud pg_cron
-- saadaval ja 24 h koristus jääb ainult Edge Functioni kanda.
-- ---------------------------------------------------------------------------
