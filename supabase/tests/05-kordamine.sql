-- 05-kordamine.sql – kas kordamishinnangu salvestamine kaitseb uuemat seisu?
--
-- 006_review_save.sql lubab ühte asja: VANEM hinnang ei kirjuta üle uuemat.
-- See fail küsib, kas ta seda päriselt teeb. Kleebi kogu fail SQL
-- Editorisse ja vajuta Run.
--
-- TULEMUSE LUGEMINE
--   „Success. No rows returned"  = kõik kontrollid läbisid
--   punane veateade              = üks kontroll kukkus läbi ja teade ütleb,
--                                  milline ning mis väärtus tuli
--   teade „vahele jäetud"        = baasis ei ole ühtegi õpilast (tühi
--                                  arendusprojekt) – siis ei ole ka kaarte,
--                                  mille peal reeglit proovida
--
-- KAS SEE ON OHUTU PROD-BAASIS?
-- Jah, ja mitte lubaduse, vaid ehituse tõttu: kogu skript on ÜKS tehing,
-- mis lõpeb `rollback`-iga. Mitte ükski siin tehtud kirjutus ei jää alles,
-- ka siis mitte, kui kõik kontrollid õnnestuvad. Skript kasutab esimest
-- ettejuhtuvat õpilast, aga tema päris kaardid saavad tehingu lõpus
-- muutmata kuju tagasi.
--
-- MIKS SIIN ROLLI VAHETATAKSE
-- `save_review_items` on `security invoker` ja võtab õpilase `auth.uid()`
-- pealt. SQL Editor jookseb `postgres`-ina, kellel `auth.uid()` on null ja
-- kellele RLS ei kehti – seega ei ütleks tema all tehtud katse mitte midagi
-- selle kohta, mis brauseris juhtub. Skript paneb end seepärast õpilase
-- nahka (`request.jwt.claims` + roll `authenticated`), täpselt nagu
-- PostgREST seda teeb.

begin;

do $$
declare
  v_student uuid;
  v_module  text;
  v_saved   integer;
  v_row     public.review_items%rowtype;
  -- Kaardi id, mida ühelgi päris moodulil ei ole – nii ei satu skript
  -- kunagi õpilase päris kaardi peale, ka enne rollback'i mitte.
  v_card    text := 'test-05-kordamine';
begin
  select id into v_student from public.students limit 1;
  select id into v_module from public.modules limit 1;

  if v_student is null or v_module is null then
    raise notice 'Vahele jäetud: baasis ei ole õpilast või moodulit.';
    return;
  end if;

  -- Õpilase nahka. `true` = `set local`, kehtib ainult selle tehingu sees.
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', v_student, 'role', 'authenticated')::text,
    true
  );
  perform set_config('role', 'authenticated', true);

  -- =====================================================================
  -- 1. Uus kaart tekib.
  -- =====================================================================
  select public.save_review_items(json_build_array(json_build_object(
    'module_id', v_module,
    'card_id', v_card,
    'due_date', '2026-08-14',
    'interval_days', 7,
    'last_result', 'good',
    'updated_at', '2026-08-07T10:00:00.000Z'
  ))::jsonb) into v_saved;

  if v_saved <> 1 then
    raise exception 'KONTROLL 1: uus kaart oleks pidanud tekkima, tuli % rida', v_saved;
  end if;

  -- =====================================================================
  -- 2. VANEM hinnang ei muuda mitte midagi. See on kogu faili mõte:
  --    teises seadmes kell 09:55 antud hinnang jõuab võrgu tõttu kohale
  --    hiljem kui kell 10:00 antud oma – ja ei tohi teda üle kirjutada.
  -- =====================================================================
  select public.save_review_items(json_build_array(json_build_object(
    'module_id', v_module,
    'card_id', v_card,
    'due_date', '2026-08-08',
    'interval_days', 1,
    'last_result', 'again',
    'updated_at', '2026-08-07T09:55:00.000Z'
  ))::jsonb) into v_saved;

  if v_saved <> 0 then
    raise exception 'KONTROLL 2: vanem hinnang kirjutas rea üle (% rida)', v_saved;
  end if;

  select * into v_row from public.review_items
  where student_id = v_student and module_id = v_module and card_id = v_card;

  if v_row.interval_days <> 7 or v_row.last_result <> 'good' then
    raise exception 'KONTROLL 2: rida muutus ikkagi – intervall %, hinnang %',
      v_row.interval_days, v_row.last_result;
  end if;

  -- =====================================================================
  -- 3. UUEM hinnang kirjutab üle. Ilma selleta oleks kontroll 2 rahuldatud
  --    ka funktsiooniga, mis ei kirjuta kunagi midagi.
  -- =====================================================================
  select public.save_review_items(json_build_array(json_build_object(
    'module_id', v_module,
    'card_id', v_card,
    'due_date', '2026-08-28',
    'interval_days', 21,
    'last_result', 'good',
    'updated_at', '2026-08-07T10:05:00.000Z'
  ))::jsonb) into v_saved;

  if v_saved <> 1 then
    raise exception 'KONTROLL 3: uuem hinnang ei läinud kirja (% rida)', v_saved;
  end if;

  -- =====================================================================
  -- 4. SAMA ajatempel ei kirjuta üle (`>`, mitte `>=`). Sama hetk tähendab
  --    sama hinnangut – tarbetu kirjutamine oleks ainult liiklus.
  -- =====================================================================
  select public.save_review_items(json_build_array(json_build_object(
    'module_id', v_module,
    'card_id', v_card,
    'due_date', '2026-08-09',
    'interval_days', 1,
    'last_result', 'again',
    'updated_at', '2026-08-07T10:05:00.000Z'
  ))::jsonb) into v_saved;

  if v_saved <> 0 then
    raise exception 'KONTROLL 4: sama ajatempliga hinnang kirjutas rea üle';
  end if;

  -- =====================================================================
  -- 5. Sama kaart massiivis KAKS korda ei tohi käsku katki teha („ON
  --    CONFLICT DO UPDATE command cannot affect row a second time").
  --    Peale jääb uuem.
  -- =====================================================================
  select public.save_review_items(json_build_array(
    json_build_object(
      'module_id', v_module, 'card_id', v_card,
      'due_date', '2026-08-10', 'interval_days', 3, 'last_result', 'hard',
      'updated_at', '2026-08-07T10:10:00.000Z'
    ),
    json_build_object(
      'module_id', v_module, 'card_id', v_card,
      'due_date', '2026-08-31', 'interval_days', 21, 'last_result', 'good',
      'updated_at', '2026-08-07T10:20:00.000Z'
    )
  )::jsonb) into v_saved;

  select * into v_row from public.review_items
  where student_id = v_student and module_id = v_module and card_id = v_card;

  if v_row.interval_days <> 21 then
    raise exception 'KONTROLL 5: duplikaadist jäi peale vale kirje (intervall %)',
      v_row.interval_days;
  end if;

  raise notice 'Kõik 5 kontrolli läbisid.';
end $$;

-- Mitte midagi ei jää alles – ka mitte siis, kui kõik õnnestus.
rollback;
