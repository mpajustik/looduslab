-- 02-pidurdus.sql – kas liitumise pidurdus KÄITUB õigesti?
--
-- 01-skeem.sql küsib „kas funktsioon on olemas ja õigused paigas".
-- See fail küsib „kas ta teeb õiget asja". Kleebi kogu fail SQL
-- Editorisse ja vajuta Run.
--
-- TULEMUSE LUGEMINE
--   „Success. No rows returned"  = kõik kontrollid läbisid
--   punane veateade              = üks kontroll kukkus läbi ja teade ütleb,
--                                  milline ning mis väärtus tuli
--
-- KAS SEE ON OHUTU PROD-BAASIS?
-- Jah. Kõik testiread kasutavad väljamõeldud ip_hash'i, mis päris räsiga
-- kokku ei lange, ja skript kustutab need lõpus ära ka siis, kui ta läbi
-- kukub (exception-haru). Päris õpilaste ridu ta ei puuduta.
--
-- ÜKS KÕRVALMÕJU, MIDA TASUB TEADA
-- Funktsioon kustutab iga kutse juures 24 h vanemad read – seega jooksutab
-- see skript ka päris koristust. See on ootuspärane, mitte kahju.

do $$
declare
  -- 64 märki, nagu päris SHA-256 räsi, aga algab sõnaga `test` – nii ei
  -- lange ta kunagi päris IP räsiga kokku ega riku 01-skeem.sql kontrolli,
  -- kui rida peaks kogemata alles jääma.
  v_ip      text := 'test' || repeat('0', 60);
  v_ip2     text := 'tset' || repeat('0', 60);
  v_user    uuid;
  v_ok      boolean;
  v_id      uuid;
  v_arv     integer;
begin
  -- Päris auth-kasutaja sessioonipiiri testiks. Kui baasis pole ühtegi
  -- kasutajat (täiesti tühi projekt), jäävad sessioonikontrollid vahele.
  select id into v_user from auth.users limit 1;

  -- Alusta puhtalt lehelt.
  delete from public.join_attempts where ip_hash in (v_ip, v_ip2);

  begin
    -- =====================================================================
    -- 1. Esimene katse on lubatud ja tagastab rea id.
    -- =====================================================================
    select allowed, attempt_id into v_ok, v_id
    from public.register_join_attempt(v_ip, null, '11', 10, 2, 5, 50, 60);

    if not v_ok then
      raise exception 'KONTROLL 1: esimene katse peaks olema lubatud, aga oli keelatud';
    end if;
    if v_id is null then
      raise exception 'KONTROLL 1: lubatud katse peab tagastama attempt_id, tuli null';
    end if;

    -- =====================================================================
    -- 2. POOLELIOLEVAD KATSED EI LOE TURVAPIIRI.
    --    See on kogu 2.9 kõige tähtsam käitumine: tunni alguses on 24 õiget
    --    liitumist korraga „pooleli". Kui neid loetaks piiri sisse, saaks
    --    pool klassi 429. Piir on siin 2, pooleliolevaid on juba 1 – ja
    --    järgmine peab ikkagi läbi minema.
    -- =====================================================================
    select allowed into v_ok
    from public.register_join_attempt(v_ip, null, '11', 10, 2, 5, 50, 60);

    if not v_ok then
      raise exception
        'KONTROLL 2: pooleliolevad katsed lähevad turvapiiri arvesse – '
        'nii saaks liituv klass ise 429. Vaata register_join_attempt '
        'loendust: peab olema outcome = ''failed''';
    end if;

    -- =====================================================================
    -- 3. KINNITATUD EBAÕNNESTUMISED AGA LOEVAD.
    --    Märgime mõlemad `failed`-iks. Piir on 2, seega kolmas katse
    --    peab olema keelatud.
    -- =====================================================================
    update public.join_attempts set outcome = 'failed' where ip_hash = v_ip;

    select allowed into v_ok
    from public.register_join_attempt(v_ip, null, '11', 10, 2, 5, 50, 60);

    if v_ok then
      raise exception
        'KONTROLL 3: kaks kinnitatud ebaõnnestumist ei sulgenud IP piiri (piir oli 2)';
    end if;

    -- Keelatud katse EI TOHI uut rida lisada – vastasel juhul pikendaks iga
    -- tagasi lükatud päring lukustust ja ründaja hoiaks klassi kinni.
    select count(*) into v_arv from public.join_attempts where ip_hash = v_ip;
    if v_arv <> 2 then
      raise exception
        'KONTROLL 3: keelatud katse lisas ikkagi rea (ridu on %, ootus 2)', v_arv;
    end if;

    delete from public.join_attempts where ip_hash = v_ip;

    -- =====================================================================
    -- 4. PUHANGUPIIR pooleliolevatele. Ainult selle vastu, et keegi ei
    --    saadaks 50 päringut korraga enne, kui ükski jõuab lahendatud saada.
    --    Piir on siin 2 poolelolevat.
    -- =====================================================================
    perform * from public.register_join_attempt(v_ip, null, '11', 10, 99, 99, 2, 60);
    perform * from public.register_join_attempt(v_ip, null, '11', 10, 99, 99, 2, 60);

    select allowed into v_ok
    from public.register_join_attempt(v_ip, null, '11', 10, 99, 99, 2, 60);

    if v_ok then
      raise exception 'KONTROLL 4: puhangupiir ei rakendunud (piir oli 2 poolelolevat)';
    end if;

    -- Vana poolelolev rida ei tohi igavesti ette jääda: kui aken on 0
    -- sekundit, ei loeta ühtegi pooleliolevat ja katse peab läbi minema.
    select allowed into v_ok
    from public.register_join_attempt(v_ip, null, '11', 10, 99, 99, 2, 0);

    if not v_ok then
      raise exception
        'KONTROLL 4: poolelolevaid loetakse ka väljaspool oma akent – '
        'kokku jooksnud päringu rida jääks siis teistele ette';
    end if;

    delete from public.join_attempts where ip_hash = v_ip;

    -- =====================================================================
    -- 5. SESSIOONIPIIR käib eraldi IP-st. Ründaja, kes vahetab IP-d, ei
    --    tohi sama sessiooniga edasi proovida.
    -- =====================================================================
    if v_user is null then
      raise notice 'KONTROLL 5 jäi vahele: auth.users on tühi';
    else
      insert into public.join_attempts (ip_hash, student_id, code_prefix, outcome)
      values (v_ip, v_user, '11', 'failed'), (v_ip, v_user, '11', 'failed');

      -- TEINE IP, sama sessioon. IP piir on lahti (99), sessiooni piir 2.
      select allowed into v_ok
      from public.register_join_attempt(v_ip2, v_user, '11', 10, 99, 2, 50, 60);

      if v_ok then
        raise exception
          'KONTROLL 5: sessioonipiir ei rakendunud teiselt IP-lt – '
          'IP vahetamine annaks piiramatult katseid';
      end if;

      delete from public.join_attempts where ip_hash in (v_ip, v_ip2);
    end if;

    -- =====================================================================
    -- 6. 24 h SÄILITUS. Vana rida peab kaduma juba esimese kutse ajal,
    --    ilma pg_cronita. docs/ANDMEMUDEL.md lubab seda ja privaatsusleht
    --    kordab – see on lubadus kasutajale, mitte optimeerimine.
    -- =====================================================================
    insert into public.join_attempts (ip_hash, student_id, code_prefix, outcome, created_at)
    values (v_ip2, null, '99', 'failed', now() - interval '25 hours');

    perform * from public.register_join_attempt(v_ip, null, '11', 10, 99, 99, 50, 60);

    select count(*) into v_arv
    from public.join_attempts
    where ip_hash = v_ip2 and created_at < now() - interval '24 hours';

    if v_arv <> 0 then
      raise exception
        'KONTROLL 6: üle 24 h vana rida jäi alles (% rida) – IP-räsi säilitus on katki', v_arv;
    end if;

    -- =====================================================================
    -- 7. outcome piirang: kolmandat väärtust ei tohi saada kirjutada.
    -- =====================================================================
    begin
      insert into public.join_attempts (ip_hash, code_prefix, outcome)
      values (v_ip, '11', 'joined');

      raise exception 'KONTROLL 7: outcome piirang puudub – sinna sai kirjutada ''joined''';
    exception
      when check_violation then
        null;  -- ootuspärane: piirang töötab
    end;

    -- Kõik läbitud: koristame testiread.
    delete from public.join_attempts where ip_hash in (v_ip, v_ip2);

  exception
    when others then
      -- Koristus ka läbikukkumise korral, siis alles viga edasi.
      delete from public.join_attempts where ip_hash in (v_ip, v_ip2);
      raise;
  end;
end $$;
