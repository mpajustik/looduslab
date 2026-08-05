-- 002_rls.sql – RLS-poliitikad (docs/ANDMEMUDEL.md „RLS-reeglid")
--
-- `enable row level security` on juba 001-s iga tabeli juures – siin on
-- ainult poliitikad ehk erandid vaikimisi keelust.
--
-- KAKS ASJA, MIDA SIIN LUGEDES TEADA:
--
-- 1. Service role (Edge Functionid, sync-modules skript) käib RLS-ist
--    MÖÖDA – see on Postgresi `bypassrls` õigus, mitte poliitika. Seepärast
--    „ainult Edge Function" tähendab siin: EI LOO ÜHTEGI POLIITIKAT.
--    Tabelid students ja join_attempts on täpselt sellised.
--
-- 2. Poliitika sees kirjutame `(select auth.uid())`, mitte `auth.uid()`.
--    Sulgudes päringu arvutab Postgres ÜKS KORD päringu kohta; ilma
--    sulgudeta kutsutakse funktsiooni iga rea kohta uuesti. Sama tulemus,
--    aga suurel tabelil kordades kiirem.
--
-- Õpilane on anonüümne auth-kasutaja – tema JWT roll on samuti
-- `authenticated` (mitte `anon`), seega `to authenticated` katab mõlemad.
-- Just seepärast EI PIISA õpetaja tabelite juures rollist: ilma lisakontrollita
-- saaks iga õpilane luua `classes` rea, kus teacher_id on tema ise. Õpetaja
-- ja õpilase eristab ainult see, kas konto on anonüümne.

-- ---------------------------------------------------------------------------
-- Õpetaja = päris konto (magic link), mitte anonüümne õpilase sessioon.
-- Supabase paneb anonüümse sisselogimise puhul JWT-sse `is_anonymous: true`.
-- Vana või võõra kujuga token, kus claimi ei ole, loetakse anonüümseks –
-- kahtluse korral keelame, mitte ei luba.
-- `search_path = ''` on kohustuslik: ilma selleta saaks keegi funktsiooni
-- otsinguteed muutes panna `auth.jwt()` asemele oma funktsiooni.
-- ---------------------------------------------------------------------------
create or replace function public.is_teacher_account()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, true) = false
$$;

-- ---------------------------------------------------------------------------
-- profiles – õpetaja näeb ja muudab AINULT oma profiili.
-- ---------------------------------------------------------------------------
create policy "profiles_own" on profiles
  for all to authenticated
  using (id = (select auth.uid()) and (select public.is_teacher_account()))
  with check (id = (select auth.uid()) and (select public.is_teacher_account()));

-- ---------------------------------------------------------------------------
-- classes – õpetaja näeb ja haldab AINULT oma klasse.
-- `for all` katab ka DELETE: klassi kustutamine (samm 2.15) viib
-- ON DELETE CASCADE kaudu kaasa õpilased, katsed ja vastused.
-- ---------------------------------------------------------------------------
create policy "classes_own" on classes
  for all to authenticated
  using (teacher_id = (select auth.uid()) and (select public.is_teacher_account()))
  with check (teacher_id = (select auth.uid()) and (select public.is_teacher_account()));

-- ---------------------------------------------------------------------------
-- students – LUGEMINE kahele poolele, KIRJUTAMINE mitte kellelegi.
-- Rea loob ainult Edge Function join_class (samm 2.9), sest ainult tema
-- teab, kas klassikood oli õige. Kui õpilane saaks ise students rea luua,
-- saaks ta liituda suvalise klassiga ilma koodita.
-- ---------------------------------------------------------------------------
create policy "students_read_own" on students
  for select to authenticated
  using (id = (select auth.uid()));

create policy "students_read_teacher" on students
  for select to authenticated
  using (exists (
    select 1 from classes c
    where c.id = students.class_id
      and c.teacher_id = (select auth.uid())
  ));

-- ---------------------------------------------------------------------------
-- modules – AINUS avalikult loetav tabel: kataloog peab töötama ka
-- sisselogimata külalisele. Kirjutab ainult sync-modules service-võtmega.
-- ---------------------------------------------------------------------------
create policy "modules_read_all" on modules
  for select to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- attempts – õpilane haldab enda omi, õpetaja LOEB oma klasside omi.
-- Õpetajal on teadlikult ainult SELECT: õpetaja ei tohi õpilase vastust
-- ega edenemist muuta, ka mitte kogemata.
-- ---------------------------------------------------------------------------
create policy "attempts_own" on attempts
  for all to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));

create policy "attempts_read_teacher" on attempts
  for select to authenticated
  using (exists (
    select 1 from students s
    join classes c on c.id = s.class_id
    where s.id = attempts.student_id
      and c.teacher_id = (select auth.uid())
  ));

-- ---------------------------------------------------------------------------
-- responses – sama loogika mis attempts, aga omanik selgub ÜHE SAMMU KAUDU:
-- responses -> attempts -> student_id. Vastuse ridadel endal ei ole
-- student_id veergu (see oleks sama info kahes kohas).
-- ---------------------------------------------------------------------------
create policy "responses_own" on responses
  for all to authenticated
  using (exists (
    select 1 from attempts a
    where a.id = responses.attempt_id
      and a.student_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from attempts a
    where a.id = responses.attempt_id
      and a.student_id = (select auth.uid())
  ));

create policy "responses_read_teacher" on responses
  for select to authenticated
  using (exists (
    select 1 from attempts a
    join students s on s.id = a.student_id
    join classes c on c.id = s.class_id
    where a.id = responses.attempt_id
      and c.teacher_id = (select auth.uid())
  ));

-- ---------------------------------------------------------------------------
-- review_items – kordamiskaardid on õpilase isiklikud (etapp 3).
-- Õpetajale neid EI näidata: kordamine on õpilase oma töövahend, mitte
-- hindamise alus.
-- ---------------------------------------------------------------------------
create policy "review_items_own" on review_items
  for all to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- join_attempts – MITTE ÜHTEGI POLIITIKAT. See on tahtlik, mitte unustus:
-- pidurduse logi loeb ja kirjutab ainult Edge Function service-võtmega.
-- Kui klient saaks seda lugeda, näeks ta, milliseid koode on proovitud;
-- kui kirjutada, saaks ta logi üle ujutada ja pidurduse kasutuks teha.
-- ---------------------------------------------------------------------------
