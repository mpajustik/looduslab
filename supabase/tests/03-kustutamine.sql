-- 03-kustutamine.sql – kas klassi kustutamine viib KÕIK seotud read kaasa?
--
-- Samm 2.15 lubab õpetajale: „kustutan klassi ja kõik selle õpilaste andmed
-- kaovad". See lubadus ei seisa koodil, vaid ON DELETE CASCADE ahelal
-- (001_tables.sql). Kui keegi lisab kunagi tabeli ilma cascade'ita, jäävad
-- kustutatud klassi õpilaste read baasi rippuma – vaikselt, veateateta ja
-- GDPR-i mõttes valesti. See skript püüab täpselt selle kinni.
--
-- Kopeeri TERVE fail Supabase SQL Editorisse ja käivita.
--   „Success. No rows returned" = kõik korras
--   punane veateade                = üks kontroll kukkus läbi (teade ütleb, milline)
--
-- Skript loob oma testiandmed ja VÕTAB NEED LÕPUKS TAGASI (rollback) – ka
-- siis, kui ta läbi kukub. Päris andmeid ta ei puutu, aga jooksuta ta ikkagi
-- eelistatult dev-projektis.

begin;

do $$
declare
  v_teacher uuid := gen_random_uuid();
  v_student uuid := gen_random_uuid();
  v_class   uuid;
  v_attempt uuid;
  v_module  text := '__test.kustutamine';
  v_left    integer;
begin
  -- --- Testiseis: õpetaja, klass, õpilane, katse, vastus, kordamiskaart ---
  -- auth.users read on vaja päriselt olemas (students.id ja classes.teacher_id
  -- viitavad sinna). instance_id ja rollid on Supabase Authi vaikeväärtused.
  insert into auth.users (id, instance_id, aud, role, is_anonymous, created_at, updated_at)
  values
    (v_teacher, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', false, now(), now()),
    (v_student, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', true,  now(), now());

  insert into public.classes (teacher_id, name, code_hash, code_expires_at)
  values (v_teacher, 'Kustutamise test', 'test-hash', now() + interval '14 days')
  returning id into v_class;

  insert into public.students (id, class_id, display_name)
  values (v_student, v_class, 'Testi-Mari');

  insert into public.modules (id, slug, title, subject, version)
  values (v_module, '__test-kustutamine', 'Testmoodul', 'fyysika', '1.0.0');

  insert into public.attempts (student_id, module_id, module_version, current_step)
  values (v_student, v_module, '1.0.0', 'explore-1')
  returning id into v_attempt;

  insert into public.responses (attempt_id, module_version, step, question_id, payload)
  values (v_attempt, '1.0.0', 'explore-1', 'q1', '{"value": 42}'::jsonb);

  insert into public.review_items (student_id, module_id, card_id, due_date)
  values (v_student, v_module, 'card-1', current_date);

  -- --- Tegu: kustutame AINULT klassi rea ---
  delete from public.classes where id = v_class;

  -- --- Kontroll: mitte ükski seotud rida ei tohi alles jääda ---
  select count(*) into v_left from public.students where class_id = v_class;
  if v_left <> 0 then
    raise exception 'VIGA: klassi kustutamine jättis alles % õpilase rida (students.class_id vajab ON DELETE CASCADE)', v_left;
  end if;

  select count(*) into v_left from public.attempts where student_id = v_student;
  if v_left <> 0 then
    raise exception 'VIGA: alles jäi % katset (attempts.student_id vajab ON DELETE CASCADE)', v_left;
  end if;

  select count(*) into v_left from public.responses where attempt_id = v_attempt;
  if v_left <> 0 then
    raise exception 'VIGA: alles jäi % vastust (responses.attempt_id vajab ON DELETE CASCADE)', v_left;
  end if;

  select count(*) into v_left from public.review_items where student_id = v_student;
  if v_left <> 0 then
    raise exception 'VIGA: alles jäi % kordamiskaarti (review_items.student_id vajab ON DELETE CASCADE)', v_left;
  end if;

  -- --- Kontroll: anonüümne auth-konto JÄÄB alles (teadlik kokkulepe) ---
  -- Cascade käib teistpidi: auth.users kustutamine viib students rea kaasa,
  -- mitte vastupidi. Isikuandmeid see rida ei sisalda – ei e-posti, ei nime
  -- (nimi elas students.display_name-is, mis just kustus), ainult id ja
  -- ajatempel. Koristamine nõuaks service-võtmega Edge Functionit.
  -- Kontroll on siin sellepärast, et see oleks KIRJAS, mitte peas: kui keegi
  -- kunagi selle ahela ümber teeb, ütleb test seda kohe.
  select count(*) into v_left from auth.users where id = v_student;
  if v_left <> 1 then
    raise exception 'MUUTUS: anonüümne auth.users rida kadus koos klassiga – kui see on nüüd tahtlik, uuenda seda testi ja plaani 2.15 märkust';
  end if;

  -- --- Kontroll: moodul EI tohi kaasa tulla ---
  -- Moodulid on ühised kõigile klassidele. Kui siia tekiks kunagi cascade,
  -- kustutaks üks õpetaja oma klassi kustutades sisu kõigilt teistelt.
  select count(*) into v_left from public.modules where id = v_module;
  if v_left <> 1 then
    raise exception 'VIGA: moodul kadus koos klassiga – modules ei tohi olla cascade-ahelas';
  end if;

  raise notice 'OK: klassi kustutamine viis kaasa õpilased, katsed, vastused ja kordamiskaardid';
end $$;

-- Testiandmed tagasi. `rollback` (mitte `commit`) on siin tahtlik: skript
-- tohib joosta nii mitu korda kui tahad, ka toodangubaasis, ilma et ta
-- midagi maha jätaks.
rollback;
