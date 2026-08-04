-- 001_tables.sql – LoodusLab AI põhitabelid (docs/ANDMEMUDEL.md)
--
-- Selles failis on tabelid, kitsendused ja indeksid.
-- RLS-POLIITIKAD tulevad eraldi failis 002_rls.sql (samm 2.4), AGA RLS ise
-- lülitatakse sisse juba siin, kohe iga tabeli loomise järel. Miks:
-- `enable row level security` ilma ühegi poliitikata tähendab „mitte keegi
-- ei näe midagi" (service role käib RLS-ist mööda) – see on lukk, mitte
-- reegel. Nii ei ole baas kordagi kaitseta, isegi kui 001 ja 002 vahele
-- jääb päevi. `enable` on idempotentne, seega 002 ei lähe sellest katki.
--
-- FK-d õpilase suunas on ON DELETE CASCADE (GDPR: klassi kustutamine viib
-- kõik seotud andmed kaasa). FK-d moodulite suunas on vaikimisi RESTRICT –
-- moodulit ei tohi kustutada, kui tema kohta on vastuseid (arhiveeri:
-- modules.status = 'archived').

-- ---------------------------------------------------------------------------
-- profiles – õpetaja nimi. Konto ise elab auth.users-is (Supabase Auth).
-- ---------------------------------------------------------------------------
create table profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

comment on table profiles is
  'Õpetaja profiil; id = auth.users.id. Õpilastel profiili EI OLE.';

-- ---------------------------------------------------------------------------
-- classes – õpetaja klass. Klassikood hoitakse ainult räsina (kunagi mitte
-- avatekstina) ja aegub 14 päevaga; koodi genereerib Edge Function (2.7).
-- ---------------------------------------------------------------------------
create table classes (
  id              uuid primary key default gen_random_uuid(),
  teacher_id      uuid not null references auth.users (id) on delete cascade,
  name            text not null,
  code_hash       text not null,
  code_expires_at timestamptz not null,
  created_at      timestamptz not null default now()
);

alter table classes enable row level security;

comment on table classes is
  'Klass; code_hash on bcrypt-räsi, avatekstis koodi baasis EI OLE.';

create index classes_teacher_id_idx on classes (teacher_id);

-- ---------------------------------------------------------------------------
-- students – klassiga liitunud õpilane. id = anonüümse auth-kasutaja id
-- (signInAnonymously), nii et õpilase read leiab alati auth.uid() järgi.
-- ---------------------------------------------------------------------------
create table students (
  id           uuid primary key references auth.users (id) on delete cascade,
  class_id     uuid not null references classes (id) on delete cascade,
  display_name text not null,
  created_at   timestamptz not null default now()
);

alter table students enable row level security;

comment on table students is
  'Õpilane klassis; id = anonüümse auth-kasutaja id. Ainult eesnimi.';

create index students_class_id_idx on students (class_id);

-- ---------------------------------------------------------------------------
-- modules – moodulite metaandmed. Siia kirjutab AINULT sync-modules skript
-- (samm 2.5) service-võtmega; rakendus ainult loeb.
-- ---------------------------------------------------------------------------
create table modules (
  id      text primary key,                    -- nt 'physics.vedeliku-rohk'
  slug    text not null unique,                -- URL /m/:slug – globaalselt unikaalne
  title   text not null,
  subject text not null,
  status  text not null default 'active' check (status in ('active', 'archived')),
  version text not null,
  minutes jsonb not null default '{}'::jsonb   -- { demo, lesson, homework }
);

-- NB! modules on ainus tabel, mis peab lõpuks olema AVALIKULT loetav
-- (kataloog töötab ka sisselogimata külalisele). Kuni 002_rls.sql-ini
-- ei tagasta ta kellelegi ridu – see on ootuspärane, mitte viga.
alter table modules enable row level security;

comment on table modules is
  'Moodulite kataloog; kirjutab ainult sync-modules skript. Kursusesse '
  'kuulumist siin EI OLE – järjestus elab kursusefailides.';

comment on column modules.slug is
  'Globaalselt unikaalne üle KÕIGI ainete – marsruudis /m/:slug ainet ei ole.';

-- ---------------------------------------------------------------------------
-- attempts – ÜKS RIDA = ÜKS MOODULIKÄIK (mitte üks samm!).
-- Sammu tasandi info elab responses-is; siin on ainult „kus ta pooleli on".
-- module_version on tavaline veerg, MITTE võtme osa: patch/minor uuendus
-- keset moodulit ei tohi tekitada uut rida ega nullida current_step'i.
-- ---------------------------------------------------------------------------
create table attempts (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references students (id) on delete cascade,
  module_id      text not null references modules (id),
  module_version text not null,                -- viimati kasutatud versioon
  status         text not null default 'started' check (status in ('started', 'completed')),
  current_step   text,                         -- sammu ID ('explore-2'), mitte number
  started_at     timestamptz not null default now(),
  finished_at    timestamptz,
  unique (student_id, module_id)
);

alter table attempts enable row level security;

comment on table attempts is
  'Üks rida = üks moodulikäik. Veergu `step` siin EI OLE – see oli varasema, '
  'mitmeti mõistetava skeemi jäänuk.';

comment on column attempts.current_step is
  'Sammu ID, mitte järjekorranumber – number näitaks uues versioonis vale sammu.';

create index attempts_module_id_idx on attempts (module_id);

-- ---------------------------------------------------------------------------
-- responses – ÜKS RIDA = ÜKS VASTUS.
-- module_version ON siin võtme osa ja seda EI tuletata attempts pealt:
-- attempts-is upsertitakse see viimati kasutatud versiooniks ja vana vastus
-- saaks vale sildi. Sama versiooni sees upsert (revised_count++),
-- versioonide vahel tekib eraldi rida.
-- ---------------------------------------------------------------------------
create table responses (
  id             uuid primary key default gen_random_uuid(),
  attempt_id     uuid not null references attempts (id) on delete cascade,
  module_version text not null,                -- muutumatu, vt trigger allpool
  step           text not null,
  question_id    text not null,
  payload        jsonb not null default '{}'::jsonb,  -- sh variantId
  is_correct     boolean,                      -- null = ei ole hinnatav
  revised_count  integer not null default 0,
  created_at     timestamptz not null default now(),
  unique (attempt_id, question_id, module_version)
);

alter table responses enable row level security;

comment on table responses is
  'Üks rida = üks vastus. payload on jsonb: küsimuste struktuur muutub, '
  'tabel mitte. Seal elab ka variantId (milline arvuvariant loositi).';

create index responses_attempt_id_idx on responses (attempt_id);

-- module_version muutumatus: RLS lubab õpilasel oma rida UPDATE-ida
-- (revised_count jaoks), seega peab „ei muutu kunagi" olema andmebaasi
-- kitsendus, mitte kokkulepe. Trigger ärkab ainult päris muutuse peale –
-- upsert, mis saadab sama väärtuse kaasa, läbib takistuseta.
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

-- ---------------------------------------------------------------------------
-- review_items – kordamiskaardid (etapp 3). Mooduli teistkordne lõpetamine
-- ei tohi tekitada topeltkaarte, seepärast unique student+module+card.
-- ---------------------------------------------------------------------------
create table review_items (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references students (id) on delete cascade,
  module_id     text not null references modules (id),
  card_id       text not null,
  due_date      date not null,
  interval_days integer not null default 1,
  last_result   text check (last_result in ('again', 'hard', 'good')),
  updated_at    timestamptz not null default now(),
  unique (student_id, module_id, card_id)
);

alter table review_items enable row level security;

comment on table review_items is
  'Kordamiskaardi seis õpilase kohta (etapp 3).';

create index review_items_due_idx on review_items (student_id, due_date);

-- ---------------------------------------------------------------------------
-- join_attempts – klassikoodi äraarvamise pidurdus (samm 2.9).
-- Sisaldab isikuandmeid (IP räsi), seepärast: ainult SHA-256(IP + serveri
-- sool), mitte avatekstis IP.
-- TÄHELEPANU: 24 h säilitust EI OLE veel kuskil jõustatud – puhastus
-- (pg_cron või delete Edge Functioni alguses) tuleb sammus 2.9 koos
-- join_class funktsiooniga. Kuni selleni kogunevad read siia lõputult.
-- Loeb ja kirjutab AINULT Edge Function service-võtmega.
-- ---------------------------------------------------------------------------
create table join_attempts (
  id          uuid primary key default gen_random_uuid(),
  code_prefix text not null,                   -- koodi algus (silumiseks), mitte kogu kood
  ip_hash     text not null,                   -- SHA-256(IP + sool), MITTE avatekstis IP
  created_at  timestamptz not null default now()
);

alter table join_attempts enable row level security;

comment on table join_attempts is
  'Ebaõnnestunud liitumiskatsete logi pidurduse jaoks; säilitus 24 h '
  'jõustub sammus 2.9.';

create index join_attempts_ip_hash_idx on join_attempts (ip_hash, created_at);
