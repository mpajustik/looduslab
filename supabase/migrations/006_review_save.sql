-- 006_review_save.sql – kordamishinnangu salvestamine nii, et VANEM seis ei
-- kirjutaks üle uuemat (plaani samm 3.6b).
--
-- MIKS SEE FAIL OLEMAS ON
-- Kaardi hinnang läks seni serverisse tavalise upsertiga (src/lib/
-- reviewRemote.ts `save`, `ignoreDuplicates: false`). See kirjutab
-- olemasoleva rea üle TINGIMUSETA – ja just seal on viga:
--
--   kell 09:55  arvutis  „Ei mäletanud"  → intervall 1 päev
--   kell 10:00  telefonis „Teadsin"      → intervall 7 päeva
--
-- Kui arvuti päring viibib võrgus (tund läbi, kaas kinni, wifi tuleb tagasi
-- alles pärast lõunat) ja jõuab Supabase'i HILJEM, kirjutab ta telefoni
-- uuema hinnangu üle. Õpilase viimane hinnang kaob ja kaart tuleb vale
-- intervalliga ette.
--
-- Seadmepoolne liitmine (samm 3.6a, `incomingReviewItems`) seda ei päästa:
-- seal võrreldakse kahte seisu ÜHES seadmes, aga konflikt tekib serveris,
-- kus kaks päringut saabuvad eri järjekorras. Kohtunik peab olema seal, kus
-- konflikt tekib.
--
-- MIKS FUNKTSIOON, MITTE PARAM PÄRINGUS
-- PostgREST-i upsertile EI SAA anda `on conflict … where` tingimust – see on
-- puhas SQL, mida REST-liides ei väljenda. Seega läheb tingimus andmebaasi
-- funktsiooni sisse ja klient kutsub teda `rpc`-ga.
--
-- MIKS KOHTUNIK ON SEADME KELL, MITTE SERVERI SAABUMISJÄRJEKORD
-- Kiusatus on kirjutada „viimasena kohale jõudnud võidab" – see oleks
-- serveripoolne ja kellanihkest sõltumatu. Aga just see ONGI ülalkirjeldatud
-- viga: arvuti päring jõuab kohale hiljem ja võidaks, kuigi õpilane andis
-- selle hinnangu VAREM. Kohalejõudmise järjekord ei ütle midagi selle kohta,
-- millise hinnangu õpilane viimasena andis – ainus signaal selle kohta on
-- seadme kell hindamise hetkel.
--
-- Hind, mida see valik maksab (CodeRabbiti ülevaatuse leid 2026-08-08):
-- kui õpilase ühe seadme kell on päevi taga, ei suuda see seade kunagi teise
-- seadme rida üle kirjutada. Kaks asja teevad selle talutavaks:
--
--   1. Nihe loeb ainult KAHE seadme vahel. Ühe seadme puhul võrreldakse tema
--      enda varasema kirjaga ja nihe taandub välja.
--   2. Kogu kordamine sõltub niikuinii seadme kellast: `due_date`, `isDue` ja
--      „tänased kaardid" arvutatakse kohalikust ajast (src/engine/review.ts).
--      Serveripoolne kell ei parandaks katkist kella, ainult peidaks ta ära –
--      õpilane näeks kaarte vales järjekorras ja server ütleks, et kõik on
--      korras.
--
-- MIDA SEE FAIL EI MUUDA
-- * UUE kaardi lisamine (`create`, „lisa kui veel ei ole") jääb tavaliseks
--   upsertiks – seal on `ignoreDuplicates` juba õige käitumine.
-- * Tabel `review_items` ise ja tema RLS-poliitika `review_items_own`
--   (002_rls.sql) jäävad muutmata. Funktsioon on `security invoker`, seega
--   RLS kehtib täpselt nagu otsepäringul: õpilane puutub ainult oma ridu.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- save_review_items – hinnatud kaardid serverisse, „uuem võidab".
--
-- Sisend on jsonb massiiv, sest üks lõpetamine annab 3–10 kaarti ja kaardi
-- kaupa kutsumine tähendaks 10 päringut. Kuju on täpselt sama, mis tabelis:
--
--   [{ "module_id": "...", "card_id": "rc-1", "due_date": "2026-08-14",
--      "interval_days": 7, "last_result": "good",
--      "updated_at": "2026-08-07T10:00:00.000Z" }]
--
-- `student_id` VÕETAKSE SESSIOONIST, mitte kliendi saadetud väljast. Nii ei
-- ole kliendil võimalustki kirjutada kellegi teise nimel – RLS keelaks selle
-- niikuinii ära, aga kaks lukku on siin odavad ja üks neist ei sõltu sellest,
-- et keegi poliitikat kunagi lõdvemaks ei tee.
--
-- `security invoker` (vaikimisi) on TAHTLIK. `security definer` käiks RLS-ist
-- mööda ja siis oleks ülemine lause ainus, mis õpilasi teineteisest lahus
-- hoiab – funktsioon, mis kirjutab õpilaste andmeid, ei tohi seda üksi
-- kanda.
-- `set search_path = ''` on kohustuslik: ilma selleta saaks keegi
-- otsinguteed muutes panna `public.review_items` asemele oma tabeli.
--
-- Tagastab, mitu rida päriselt muutus. Klient seda praegu ei vaata (0 on
-- täiesti normaalne vastus – tähendab „minu seis oli vanem"), aga silumisel
-- ja SQL-i kontrollskriptis on ta hädavajalik.
-- ---------------------------------------------------------------------------
create or replace function public.save_review_items(p_items jsonb)
returns integer
language plpgsql
volatile
set search_path = ''
as $$
declare
  v_student uuid := (select auth.uid());
  v_saved   integer;
begin
  -- Ilma sessioonita ei ole kellegi kaarte salvestada. Viskame vea, mitte ei
  -- tagasta vaikselt 0: klient loeb vea „proovi hiljem uuesti" tähenduses ja
  -- kaart jääb saatmisjärjekorda alles.
  if v_student is null then
    raise exception 'save_review_items: sessioon puudub'
      using errcode = '28000';
  end if;

  insert into public.review_items as ri
    (student_id, module_id, card_id, due_date, interval_days, last_result, updated_at)
  select
    v_student, i.module_id, i.card_id, i.due_date,
    i.interval_days, i.last_result, i.updated_at
  from (
    -- `distinct on` ei ole ilustus: kui samas massiivis oleks sama kaart
    -- kaks korda, katkestaks Postgres kogu käsu veaga „ON CONFLICT DO UPDATE
    -- command cannot affect row a second time". Klient hoiab järjekorda
    -- võtme `moodul:kaart` all ja duplikaati tekkida ei tohiks – aga vigane
    -- klient ei tohi ühtegi teist kaarti kaasa võtta.
    select distinct on (r.module_id, r.card_id) r.*
    from jsonb_to_recordset(p_items) as r(
      module_id     text,
      card_id       text,
      due_date      date,
      interval_days integer,
      last_result   text,
      updated_at    timestamptz
    )
    order by r.module_id, r.card_id, r.updated_at desc
  ) as i
  on conflict (student_id, module_id, card_id) do update
    set due_date      = excluded.due_date,
        interval_days = excluded.interval_days,
        last_result   = excluded.last_result,
        updated_at    = excluded.updated_at
    -- SIIN ON KOGU SELLE FAILI MÕTE. Vanem seis ei tee mitte midagi: rida
    -- jääb rahule ja `insert` ütleb lihtsalt „0 rida". See EI OLE viga –
    -- „minu koopia oli vanem" on kahe seadme puhul tavaline vastus.
    --
    -- `>` mitte `>=`: sama ajatempel tähendab sama hinnangut, tarbetu
    -- kirjutamine ainult vahetaks `updated_at`-i iseenda vastu välja.
    where excluded.updated_at > ri.updated_at;

  get diagnostics v_saved = row_count;
  return v_saved;
end $$;

comment on function public.save_review_items is
  'Kordamishinnangud serverisse nii, et vanem seis ei kirjuta üle uuemat '
  '(samm 3.6b). Kutsub õpilase brauser rpc-ga; RLS kehtib.';

-- ---------------------------------------------------------------------------
-- Õigused. Postgres annab uuele funktsioonile vaikimisi EXECUTE KÕIGILE,
-- seega võtame ära ja anname sihilikult tagasi.
--
-- `authenticated` ON siin õige roll: õpilane on anonüümne auth-kasutaja ja
-- tema roll on samuti `authenticated` (samm 2.10). Kaitse ei tule rollist,
-- vaid RLS-ist ja ülalt võetud `auth.uid()`-st.
--
-- `anon` ei saa: ilma sessioonita ei ole `auth.uid()`-d ja funktsioon viskaks
-- niikuinii vea – parem, kui ta ei jõuagi kohale.
-- ---------------------------------------------------------------------------
revoke all on function public.save_review_items(jsonb) from public, anon;

grant execute on function public.save_review_items(jsonb) to authenticated;
