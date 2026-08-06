// ÄRA KLEEBI SEDA FAILI SUPABASE'I SQL EDITORISSE – see ei ole SQL.
// Ta käib rakenduse brauseriaknasse: F12 → sakk Console.
// (SQL Editor jookseb service-võtmega, kes sõidab RLS-ist üle – seal
//  ütleks see test alati „korras" ega kontrolliks mitte midagi.)
//
// 04-rls-brauseris.js – kas RLS peab PÄRIS brauserist, päris sessiooniga?
//
// 01-skeem.sql küsib „kas poliitikad on olemas". See fail küsib hoopis
// karmimat asja: „kas keegi saab minu andmed KÄTTE, kui ta väga tahab".
// Vahe on oluline – poliitika võib olla olemas ja ikkagi vale.
//
// See EI ole Vitesti test. Kleebi kogu fail brauseri konsooli (F12 →
// Console) sellel lehel, kus rakendus jookseb.
//
// ------------------------------------------------------------------
// SEADISTUS – täida need kaks rida enne kleepimist
// ------------------------------------------------------------------
// Mõlemad väärtused on failis .env.local (VITE_SUPABASE_URL ja
// VITE_SUPABASE_ANON_KEY). Anon-võti on avalik – ta on niikuinii igas
// brauseris, kes lehte laadib. Service-võtit siia EI panda MITTE KUNAGI.
const LL_URL = "";      // nt "https://abcdefgh.supabase.co"  (tühjaks jättes proovib skript ise leida)
const LL_ANON = "";     // nt "eyJhbGciOi..."

// ------------------------------------------------------------------
// KUIDAS KASUTADA
// ------------------------------------------------------------------
// 1. Ava kaks inkognito akent ja logi/liitu neis KAHE ERINEVA kontoga
//    (kaks õpilast eri klassidest VÕI kaks õpetajat).
// 2. Kleebi see fail mõlemas aknas konsooli. Ta trükib kohe:
//      – kes sa oled,
//      – kas ilma sessioonita päring saab midagi kätte (see kontroll ei
//        vaja teist akent, ta jookseb kohe),
//      – rea `LL-JAGA: {...}` – see on sinu ridade ID-de nimekiri.
// 3. Kopeeri aken A rida `LL-JAGA: {...}` (ILMA eesliiteta `LL-JAGA: `)
//    ja jooksuta aknas B:
//      await llKontrolli('{...}')
//    Seejärel sama vastupidi (B token → aken A).
//
// TULEMUSE LUGEMINE
//   Konsooli tuleb tabel, kus igal real on veerg `seis`: OK või VIGA.
//   Üksainus VIGA tähendab, et etapp 2 EI OLE valmis.

(() => {
  // --- Ühendus -----------------------------------------------------
  // URL-i oskab skript ise ära arvata: supabase-js hoiab sessiooni
  // localStorage'i võtmes `sb-<projekt>-auth-token`, kus <projekt> on
  // sama, mis URL-i alguses. Ilma sessioonita aknas seda võtit ei ole –
  // siis peab URL-i käsitsi täitma.
  const guessRef = Object.keys(localStorage).find((k) =>
    /^sb-.+-auth-token$/.test(k),
  );
  const url =
    LL_URL ||
    (guessRef
      ? `https://${guessRef.replace(/^sb-/, "").replace(/-auth-token$/, "")}.supabase.co`
      : "");

  if (!url || !LL_ANON) {
    console.error(
      "Täida faili alguses LL_URL ja LL_ANON (.env.local failist) ja kleebi uuesti.",
    );
    return;
  }

  // --- Sessiooni lugemine ------------------------------------------
  // supabase-js on aja jooksul hoidnud sessiooni kahel kujul: puhta
  // JSON-ina ja `base64-` eesliitega. Toetame mõlemat, et skript ei
  // kukuks läbi teegi uuendamise pärast.
  function readToken() {
    if (!guessRef) return null;
    const raw = localStorage.getItem(guessRef);
    if (!raw) return null;
    try {
      const text = raw.startsWith("base64-")
        ? atob(raw.slice("base64-".length))
        : raw;
      const parsed = JSON.parse(text);
      return parsed?.access_token ?? parsed?.currentSession?.access_token ?? null;
    } catch {
      return null;
    }
  }

  const token = readToken();

  // --- Üks päring PostgREST-i --------------------------------------
  // withAuth = false tähendab „nagu oleks brauser, kus keegi pole sisse
  // loginud" – täpselt see olukord, mida punkt 3 nõuab.
  async function q(path, { withAuth = true } = {}) {
    const headers = { apikey: LL_ANON };
    if (withAuth && token) headers.Authorization = `Bearer ${token}`;
    let res;
    try {
      res = await fetch(`${url}/rest/v1/${path}`, { headers });
    } catch (e) {
      // Võrguviga EI ole „0 rida" – siis ei kontrollinud me midagi.
      return { rows: [], status: 0, katki: `võrguviga: ${e.message}` };
    }
    // 401 ja 403 on RLS-i mõttes sama hea vastus kui tühi nimekiri: ridu ei
    // antud. IGA MUU viga (400 vigane filter, 404 vale tabel, 500) tähendab,
    // et päring ei jõudnud kohale – tühja vastust ei tohi siis lugeda
    // „RLS pidas" alla, muidu annab kirjaviga skriptis rohelise tule.
    if (res.status === 401 || res.status === 403) {
      return { rows: [], status: res.status };
    }
    if (!res.ok) {
      const tekst = await res.text().catch(() => "");
      return { rows: [], status: res.status, katki: tekst.slice(0, 160) };
    }
    const rows = await res.json();
    return { rows: Array.isArray(rows) ? rows : [], status: res.status };
  }

  // Ühest päringust üks tabelirida. `katki` võidab alati: kontrollimata
  // päring ei ole OK.
  function rida(kontroll, ootus, vastus, ootusTäidetud) {
    if (vastus.katki !== undefined) {
      return {
        kontroll,
        ootus,
        tegelik: `päring ei õnnestunud (HTTP ${vastus.status}) ${vastus.katki}`,
        seis: "VIGA",
      };
    }
    return {
      kontroll,
      ootus,
      tegelik: `${vastus.rows.length} rida (HTTP ${vastus.status})`,
      seis: ootusTäidetud(vastus.rows) ? "OK" : "VIGA",
    };
  }

  const TABELID = [
    "profiles",
    "classes",
    "students",
    "attempts",
    "responses",
    "review_items",
    "join_attempts",
  ];

  function näita(pealkiri, read) {
    const vigu = read.filter((r) => r.seis === "VIGA").length;
    const vahele = read.filter((r) => r.seis === "—").length;
    // „Kõik OK" tohib öelda ainult siis, kui kõik kontrollid ka JOOKSID.
    // Vahelejäänud kontroll on lahtine ots, mitte hea uudis: kui teisel
    // aknal polnud ühtegi vastust, jäi kõige tähtsam leke proovimata.
    const kokkuvõte =
      vigu > 0
        ? `${vigu} VIGA`
        : vahele > 0
          ? `ükski kontroll ei kukkunud läbi, AGA ${vahele} jäi vahele – test on POOLIK`
          : "kõik OK";
    console.log(`\n=== ${pealkiri} — ${kokkuvõte} ===`);
    console.table(read);
    if (vahele > 0) {
      console.warn(
        "Vahelejäänud kontrolli jaoks tee teises aknas see samm päriselt läbi (liitu klassiga, vasta ühele küsimusele) ja jooksuta llKontrolli uuesti.",
      );
    }
    return vigu;
  }

  // --- 1. Kes ma olen ----------------------------------------------
  async function mina() {
    if (!token) {
      console.log("Selles aknas ei ole sessiooni (keegi pole sisse loginud).");
      return null;
    }
    // JWT keskmine osa on base64 – seal sees on kasutaja id ja roll.
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    const anonümne = payload.is_anonymous === true;
    console.log(
      `Sisse logitud: ${anonümne ? "ANONÜÜMNE (õpilane)" : "E-POSTIGA (õpetaja)"}, id ${payload.sub}`,
    );
    return { user_id: payload.sub, anonümne };
  }

  // --- 2. Ilma sessioonita ------------------------------------------
  async function ilmaSessioonita() {
    const read = [];
    for (const t of TABELID) {
      const vastus = await q(`${t}?select=*&limit=5`, { withAuth: false });
      read.push(rida(`anon loeb ${t}`, "0 rida", vastus, (r) => r.length === 0));
    }
    // modules on TEADLIKULT avalik kataloog – kui ta on tühi, ei tööta
    // avaleht väljalogitud külastajal.
    const m = await q("modules?select=id&limit=5", { withAuth: false });
    read.push(
      rida("anon loeb modules (peabki saama)", "vähemalt 1 rida", m, (r) => r.length > 0),
    );
    return näita("Ilma sessioonita päringud", read);
  }

  // --- 3. Minu ridade ID-d teisele aknale ---------------------------
  async function jaga() {
    const kes = await mina();
    if (!kes) return;
    // profiles on siin sellepärast, et õpetaja nimi ON isikuandmed – kui
    // teine õpetaja saab profiili kätte, on see leke täpselt samamoodi.
    const [pro, cls, stu, att, res, rev] = await Promise.all([
      q("profiles?select=id&limit=5"),
      q("classes?select=id&limit=5"),
      q("students?select=id&limit=5"),
      q("attempts?select=id&limit=5"),
      q("responses?select=id&limit=5"),
      q("review_items?select=id&limit=5"),
    ]);
    const token_ = {
      user_id: kes.user_id,
      profiles: pro.rows.map((r) => r.id),
      classes: cls.rows.map((r) => r.id),
      students: stu.rows.map((r) => r.id),
      attempts: att.rows.map((r) => r.id),
      responses: res.rows.map((r) => r.id),
      review_items: rev.rows.map((r) => r.id),
    };
    // Kui mõni päring siin katki läks, jääb tokenist ID-sid puudu ja teises
    // aknas näeb see välja nagu „pole midagi kontrollida". Ütleme kohe välja.
    const katkised = [pro, cls, stu, att, res, rev].filter((v) => v.katki !== undefined);
    if (katkised.length > 0) {
      console.warn(
        `HOIATUS: ${katkised.length} päringut ei õnnestunud (nt HTTP ${katkised[0].status}) – token on puudulik ja teise akna test jääb poolikuks.`,
      );
    }

    const kokku = Object.values(token_)
      .filter(Array.isArray)
      .reduce((a, b) => a + b.length, 0);
    if (kokku === 0) {
      console.warn(
        "Sinu kontol ei ole ühtegi rida – tee enne mõni samm läbi (liitu klassiga, vasta küsimusele), muidu ei ole teisel aknal midagi varastada.",
      );
    }
    console.log("LL-JAGA: " + JSON.stringify(token_));
    console.log(
      "↑ kopeeri see JSON (ilma eesliiteta) ja jooksuta TEISES aknas:  await llKontrolli('<kleebi siia>')",
    );
  }

  // --- 4. Teise konto ridade proovimine -----------------------------
  window.llKontrolli = async function llKontrolli(teineToken) {
    let t;
    try {
      t = typeof teineToken === "string" ? JSON.parse(teineToken) : teineToken;
    } catch {
      console.error("See ei olnud korrektne JSON. Kopeeri rida `LL-JAGA:` järelt, koos loogeliste sulgudega.");
      return;
    }
    const kes = await mina();
    if (kes && kes.user_id === t.user_id) {
      console.error(
        "VIGA TESTIS: see on sinu enda konto token. Kleebi TEISE akna oma – muidu kontrollid, kas näed iseenda ridu (näed küll).",
      );
      return;
    }

    const read = [];
    for (const tabel of [
      "profiles",
      "classes",
      "students",
      "attempts",
      "responses",
      "review_items",
    ]) {
      const idd = t[tabel] ?? [];
      if (idd.length === 0) {
        read.push({
          kontroll: `teise konto ${tabel}`,
          ootus: "0 rida",
          tegelik: "teisel aknal polnud ühtegi rida – kontroll jäi vahele",
          seis: "—",
        });
        continue;
      }
      const vastus = await q(`${tabel}?select=*&id=in.(${idd.join(",")})`);
      read.push(
        rida(`teise konto ${tabel} (${idd.length} id)`, "0 rida", vastus, (r) => r.length === 0),
      );
    }
    // Eraldi proov: kas saan teise õpilase vastused kätte KÜLGE mööda,
    // st mitte id, vaid attempt_id kaudu? Poliitika võib olla ühel veerul
    // paigas ja teisel puudu.
    if ((t.attempts ?? []).length > 0) {
      const vastus = await q(`responses?select=*&attempt_id=in.(${t.attempts.join(",")})`);
      read.push(
        rida("teise konto responses attempt_id kaudu", "0 rida", vastus, (r) => r.length === 0),
      );
    } else {
      read.push({
        kontroll: "teise konto responses attempt_id kaudu",
        ootus: "0 rida",
        tegelik: "teisel aknal polnud ühtegi katset – kontroll jäi vahele",
        seis: "—",
      });
    }
    if ((t.classes ?? []).length > 0) {
      const vastus = await q(`students?select=*&class_id=in.(${t.classes.join(",")})`);
      read.push(
        rida(
          "teise konto klassi õpilased class_id kaudu",
          "0 rida",
          vastus,
          (r) => r.length === 0,
        ),
      );
    }
    näita("Teise konto ridade proovimine", read);
  };

  // --- Käivitus -----------------------------------------------------
  window.llJaga = jaga;
  window.llIlmaSessioonita = ilmaSessioonita;

  (async () => {
    console.log(`Ühendus: ${url}`);
    await ilmaSessioonita();
    await jaga();
    console.log(
      "\nKäsud, kui tahad üksikut osa korrata:  await llIlmaSessioonita()   await llJaga()   await llKontrolli('{...}')",
    );
  })();
})();
