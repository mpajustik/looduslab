-- 005_join_throttle.sql – liitumise pidurdus atomaarseks + 24 h säilitus
--
-- MIKS SEE FAIL OLEMAS ON
-- Samm 2.9 esimene versioon luges katsete arvu ÜHE päringuga ja kirjutas
-- uue rea TEISE päringuga. Kahe päringu vahele mahub kogu rünne: 50
-- korraga saadetud päringut loevad kõik „katseid on 0" enne, kui ükski
-- neist oma rida lisab, ja saavad kõik läbi. Pidurdus, millest saab
-- paralleelsusega mööda, ei ole pidurdus.
--
-- Lahendus on teha KONTROLL JA KIRJUTAMINE ÜHE käsuga andmebaasi sees,
-- nõuandelukk (advisory lock) IP ämbri peal. Lukk hoiab sama IP päringud
-- järjekorras, seega järgmine näeb eelmise rida kindlasti ära. Eri IP-d
-- ei sega teineteist – lukk on räsi peal, mitte tabeli peal.
--
-- KOLM PIIRI, MITTE ÜKS – JA MIKS NII PALJU
-- Ainult IP peale ehitatud piir on koolis katki: NAT-i taga on 24 lapsel
-- üks avalik aadress ja kümme näpuviga sulgeks liitumise kogu klassile.
-- Ainult sessiooni peale ehitatud piir on ka katki: uue anonüümse
-- sessiooni saab sekundiga.
--
-- Lisaks tekib atomaarsusest endast üks lõks. Rida kirjutatakse ENNE, kui
-- koodi õigsust teatakse (muidu ei oleks kontroll ja logimine üks käik),
-- seega on tunni alguses hetk, mil 24 ÕIGE koodiga liitumist on korraga
-- „katsed". Kui neid loetaks sama piiri sisse, saaks osa klassist 429 just
-- siis, kui õpetajal on kõige vähem aega viga siluda.
--
-- Seepärast on ridadel `outcome` ja piire on kolm:
--   * KINNITATUD EBAÕNNESTUMISED sessiooni kohta: 5 / 10 min – äraarvaja
--   * KINNITATUD EBAÕNNESTUMISED IP kohta: 10 / 10 min – sessioonide
--     vahetaja. See on plaani algne arv ja turvalisuse mõttes tähtsaim
--   * POOLELIOLEVAD katsed IP kohta: 40 / 1 min – ainult paralleelse
--     puhangu vastu. Klassitäis mahub ära, 50 päringut korraga mitte
--
-- Õnnestunud liitumine kustutab oma rea, ebaõnnestunu märgitakse
-- `failed`-iks. Pooleliolevat rida loetakse ainult minuti jooksul: kui
-- funktsioon jookseb kokku enne märkimist, ei jää ta kellelegi ette.
--
-- MIDA SIIN EI OLE: RLS-POLIITIKAT
-- `join_attempts` jääb ilma poliitikateta (002_rls.sql, tahtlikult) –
-- teda loeb ja kirjutab ainult Edge Function service-võtmega. Sama kehtib
-- allpool loodava funktsiooni kohta: EXECUTE võetakse ära kõigilt ja
-- antakse ainult service_role'ile. Ilma selleta oleks funktsioon
-- PostgREST-i kaudu igaühele kutsutav ja pidurduse logi ujutataks üle.

-- ---------------------------------------------------------------------------
-- Uus veerg: milline anonüümne sessioon katse tegi.
--
-- See on isikuandmete mõttes sama kaal, mis ip_hash – anonüümse konto id.
-- Seepärast kehtib talle sama 24 h säilitus ja ON DELETE CASCADE: kui konto
-- kustub, kustuvad ka tema katsed.
-- `if not exists` sellepärast, et sammus 2.17 jooksevad migratsioonid
-- prod-baasis uuesti.
-- ---------------------------------------------------------------------------
alter table join_attempts
  add column if not exists student_id uuid references auth.users (id) on delete cascade;

comment on column join_attempts.student_id is
  'Anonüümne konto, kes katse tegi. Isikuandmed – sama 24 h säilitus, mis ip_hash.';

-- `pending` = rida on kirjutatud, aga koodi õigsus pole veel teada.
-- `failed`  = kood oli vale või aegunud. Õnnestunud liitumise rida
--             KUSTUTATAKSE, seega väärtust 'joined' ei ole olemas.
-- Vaikimisi 'pending', et vana rida (kui neid veel on) ei loeks kohe
-- kellegi piiri täis.
alter table join_attempts
  add column if not exists outcome text not null default 'pending';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'join_attempts_outcome_check'
  ) then
    alter table join_attempts
      add constraint join_attempts_outcome_check
      check (outcome in ('pending', 'failed'));
  end if;
end $$;

comment on column join_attempts.outcome is
  'pending = tulemus veel teadmata, failed = vale või aegunud kood. '
  'Õnnestunud liitumise rida kustutatakse.';

create index if not exists join_attempts_student_id_idx
  on join_attempts (student_id, created_at);

-- Koristus käib ainult created_at järgi – ilma selle indeksita loeks ta
-- iga kord terve tabeli läbi.
create index if not exists join_attempts_created_at_idx
  on join_attempts (created_at);

-- ---------------------------------------------------------------------------
-- register_join_attempt – kontrolli ja logi ÜHE käiguga.
--
-- Tagastab:
--   allowed    = kas see katse mahub piiridesse (false → Edge Function 429)
--   attempt_id = lisatud rea id. Edge Function KUSTUTAB selle, kui liitumine
--                õnnestus: õige koodiga liituja ei tohi kulutada kellegi
--                pidurduse eelarvet (24 last liitub korraga ja igaüks neist
--                oleks muidu üks „katse").
--
-- Piirid tulevad PARAMEETRITENA, mitte SQL-i kirjutatuna: tõe allikaks
-- jäävad Edge Functioni konstandid, et kaks kohta ei saaks lahku minna.
--
-- `security invoker` (vaikimisi) on siin õige: kutsuja ON service_role,
-- kes käib RLS-ist niikuinii mööda. `security definer` annaks õigused
-- juurde ilma vajaduseta.
-- `set search_path = ''` on kohustuslik – ilma selleta saaks keegi
-- otsinguteed muutes panna `join_attempts` asemele oma tabeli.
-- ---------------------------------------------------------------------------
create or replace function public.register_join_attempt(
  p_ip_hash         text,
  p_student_id      uuid,
  p_code_prefix     text,
  p_window_minutes  integer,
  p_max_ip          integer,
  p_max_session     integer,
  p_max_ip_pending  integer,
  p_pending_seconds integer
)
returns table (allowed boolean, attempt_id uuid)
language plpgsql
volatile
set search_path = ''
as $$
declare
  v_window_start timestamptz := now() - make_interval(mins => p_window_minutes);
  v_ip_count      bigint;
  v_session_count bigint;
  v_pending_count bigint;
  v_id            uuid;
begin
  -- Nõuandelukud MÕLEMA ämbri peal. `xact` = vabaneb tehingu lõpus ise,
  -- seega ka siis, kui funktsioon viskab vea. Üks lause = üks tehing, seega
  -- lukk elab täpselt selle kutse aja.
  --
  -- Miks kaks lukku: ainult IP lukk jätaks sessioonipiirile augu, kui sama
  -- sessioon tuleb korraga KAHELT aadressilt (proksi, telefon vahetab wifi
  -- ja mobiilse vahel) – siis läheksid päringud eri lukkudele ja
  -- sessiooniloendus jookseks võidu.
  --
  -- Kaheargumendiline kuju annab lukule nimeruumi (1 = IP, 2 = sessioon),
  -- nii ei satu kaks eri asja kogemata sama luku peale. Järjekord on siin
  -- alati sama ja mujal neid lukke ei võeta – ummikseisu tekkida ei saa.
  perform pg_advisory_xact_lock(1, hashtext(p_ip_hash));
  perform pg_advisory_xact_lock(2, hashtext(p_student_id::text));

  -- Vanad read välja ENNE loendamist – muidu loeks aegunud read piiri
  -- täis. Tabel on väike (24 h katseid), seega see on odav; pg_cron allpool
  -- katab ainult vaikse perioodi, kus keegi ei liitu.
  delete from public.join_attempts
  where created_at < now() - interval '24 hours';

  -- Kinnitatud ebaõnnestumised – need on turvapiir. Pooleliolevaid ridu
  -- SIIN EI LOETA: tunni alguses on 24 õiget liitumist korraga pooleli ja
  -- nemad ei ole katsed.
  select count(*) into v_ip_count
  from public.join_attempts
  where ip_hash = p_ip_hash
    and outcome = 'failed'
    and created_at > v_window_start;

  select count(*) into v_session_count
  from public.join_attempts
  where student_id = p_student_id
    and outcome = 'failed'
    and created_at > v_window_start;

  -- Pooleliolevad – ainult puhangupiir, lühikese aknaga. Kokku jooksnud
  -- funktsiooni jäetud rida ei jää seetõttu kellelegi ette.
  select count(*) into v_pending_count
  from public.join_attempts
  where ip_hash = p_ip_hash
    and outcome = 'pending'
    and created_at > now() - make_interval(secs => p_pending_seconds);

  -- Üle piiri: rida EI lisata. Vastasel juhul pikendaks iga tagasi lükatud
  -- päring lukustust ja ründaja saaks klassi omadega kinni hoida.
  if v_ip_count >= p_max_ip
     or v_session_count >= p_max_session
     or v_pending_count >= p_max_ip_pending then
    return query select false, null::uuid;
    return;
  end if;

  insert into public.join_attempts (ip_hash, student_id, code_prefix, outcome)
  values (p_ip_hash, p_student_id, left(coalesce(p_code_prefix, ''), 2), 'pending')
  returning id into v_id;

  return query select true, v_id;
end $$;

comment on function public.register_join_attempt is
  'Liitumiskatse pidurdus: kontroll + logimine ühe atomaarse käiguga. '
  'Kutsub AINULT Edge Function join_class service-võtmega.';

-- ---------------------------------------------------------------------------
-- Õigused. Postgres annab uuele funktsioonile vaikimisi EXECUTE KÕIGILE –
-- see tuleb ära võtta, muidu saaks iga õpilane (roll `authenticated`) seda
-- PostgREST-i kaudu ise kutsuda ja pidurduse logi täis kirjutada.
-- ---------------------------------------------------------------------------
revoke all on function
  public.register_join_attempt(text, uuid, text, integer, integer, integer, integer, integer)
  from public, anon, authenticated;

grant execute on function
  public.register_join_attempt(text, uuid, text, integer, integer, integer, integer, integer)
  to service_role;

-- `create or replace` EI asenda funktsiooni, mille parameetrite loend on
-- teistsugune – ta teeb uue ülekoormuse ja vana jääb alles KOOS oma
-- vaikimisi „EXECUTE kõigile" õigusega. Arenduse käigus jõudis olemas olla
-- kuue parameetriga versioon, seega viskame ta kindluse mõttes minema.
drop function if exists
  public.register_join_attempt(text, uuid, text, integer, integer, integer);

-- ---------------------------------------------------------------------------
-- 24 h säilitus ka vaiksel ajal.
--
-- Ülalolev koristus käib ainult siis, kui KEEGI liitub. Kui koolivaheajal
-- nädal aega ühtegi katset ei ole, seisaks reedene IP-räsi baasis
-- esmaspäevani – docs/ANDMEMUDEL.md lubab 24 h, seega peab see olema
-- tagatis, mitte kõrvalmõju.
--
-- pg_cron ei pruugi igas keskkonnas olemas olla (kohalik Postgres,
-- testibaas), seepärast on kogu plokk tingimuslik. Kui laiendust ei ole,
-- jääb alles funktsioonisisene koristus ja migratsioon ei kuku läbi.
-- `cron.schedule` sama nimega ASENDAB olemasoleva töö, seega migratsiooni
-- teistkordne jooksutamine (samm 2.17) ei tekita teist tööd.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;

    perform cron.schedule(
      'join_attempts_cleanup',
      '17 * * * *',                       -- kord tunnis, mitte täistunnil
      $cron$
        delete from public.join_attempts
        where created_at < now() - interval '24 hours';
      $cron$
    );
  else
    raise notice
      'pg_cron puudub – join_attempts koristus jääb ainult join_class funktsiooni kanda.';
  end if;
end $$;
