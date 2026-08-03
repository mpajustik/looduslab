# ETAPP 1: Mooduli mall ja kaks pilootmoodulit (u 3–5 nädalat)

**Eesmärk:** õpilane läbib telefonis terve mooduli (ennusta → uuri → selgita
→ harjuta → väljumispilet) ja tema edenemine säilib seadmes.

**Etapp on valmis, kui:** kaks moodulit („Peegeldumisseadus" ja „Vedeliku
rõhk") töötavad sama malli peal ja vähemalt üks päris õpilane on ühe läbinud.

Iga samm = üks töösessioon (30–90 min) = üks commit.

---

## 1.1 Moodulilepingu tüübid ja moodulite register

> **Prompt AI-le:** Loo src/engine/contract.ts docs/MOODULILEPING.md järgi:
> defineModule (sh ainekavaväljad outcomes, concepts, practicalWork),
> sammutüübid (theory, hook, precheck, predict, explore, collect, explain,
> practice, exit), küsimuse tüüp (id, õige vastus, tolerants, ühik, vihjed,
> väärarusaama silt) ja reviewCards tüüp (id, type, question, answer).
> Sammutüübid registripõhiselt (stepRegistry), et uusi tüüpe saaks hiljem
> LISADA ilma olemasolevaid muutmata. Zod-skeemid valideerimiseks.
> Loo ka src/modules/registry.ts: `id → () => import(...)` kaardistus
> (esialgu tühi) – see on ainus koht, mis teab kõiki mooduleid. Sinna kõrvale
> slug → id indeks, mis ehitatakse üks kord ja VISKAB VEA, kui kaks moodulit
> jagavad slugi (docs/MOODULILEPING.md „Slug-konventsioon") – vaikne vale
> moodul on hullem kui krahh. Ei mingit UI-d.

- [x] Tüübid + Zod skeemid olemas, `npm run build` õnnestub
      (src/engine/contract.ts + contractSchema.ts, 2026-08-02)
- [x] Register on olemas; kursusefaili test (0.5) kontrollib nüüd ka, et iga
      viidatud id on registris – ajutine kommentaar eemaldatud
- [x] Test: kaks sama slugiga moodulit registris → indeksi ehitamine viskab
      vea (mitte ei vali vaikselt üht) (tests/registry.test.ts)

**Miks register kohe:** temast sõltuvad kolm asja (laisk laadimine `/m/:slug`,
kursusefaili viidete test, hilisem sync-modules ja coverage). Kui teda ei ole,
tekib ta kogemata kolme eri kohta.

**Otsused (2026-08-02):**

- **Zod ei jõua toodangu bundle'isse** – sama muster mis kursusefailil
  (samm 0.5). `contractSchema.ts` (zod) impordib ainult test;
  `contract.ts` võtab tüübid `import type` kaudu ja pakub `defineModule` /
  `defineActivities`, mis AINULT annavad objektile tüübi. See on siin
  tähtsam kui kursusefaili juures: manifest.ts ja activities.ts laaditakse
  igas brauseris, seega runtime-valideerimine tähendaks zodi igal lehel.
  Hind: katkine moodul paistab välja testist, mitte brauserist – seepärast
  ON tests/contract.test.ts ja tests/registry.test.ts kohustuslikud valvurid,
  mitte lisa.
- **Sammutüübid on register (`stepSchemas`), mitte käsitsi kirjutatud
  union.** Uue tüübi lisamine = üks kirje. Test hoiab piiri: iga registri
  tüüp peab jõudma ka valideerimisse, muidu tekiks tüüp, mida keegi ei
  kontrolli.
- **Küsimuse ja sammu id eesliide peab olema sammu tüüp** (`practice-3`
  practice-sammus). Ilma selleta näiks õpetaja koondvaates vastus tulevat
  vales sammust – ja `question_id` on igavene, seda hiljem ei paranda.
- **Registri kirje laadib mooduli mõlemad pooled** (`manifest` +
  `activities`) ühe funktsiooniga. CodeRabbit soovitas juba nüüd eraldada
  ka komponendi laadija (`React.lazy`) – jäi tegemata, sest ühtegi moodulit
  ega moodulilehte veel ei ole (reegel 7). **Vaata see uuesti üle sammus
  1.13:** kui kursuseleht hakkab vajama ainult mooduli pealkirja, ei tohi
  see kaasa tirida Simulation.tsx-i; siis tuleb laadija pooleks lõigata.

## 1.2 StepShell: raam ja liikumine

> **Prompt AI-le:** Loo src/ui/StepShell.tsx: kuvab ühe sammu korraga,
> edenemisriba üleval (samm X/Y), nupud Edasi/Tagasi. Sammu sisu renderdub
> stepRegistry kaudu (MITTE switch-lausega) – alusta ainult theory-tüübi
> komponendiga. Demo-marsruut /m/test kolme theory-sammuga.

- [x] Sammude vahel liikumine töötab telefonis (360 px) (src/ui/StepShell.tsx
      + src/ui/steps/, demo /m/test, 2026-08-02)

## 1.3 StepShell: vastuse lukk

> **Prompt AI-le:** Täienda StepShelli: kui sammul on vastus, on „Edasi"
> lukus kuni vastuse esitamiseni. Esitatud sammule tagasi minnes on vastus
> nähtav. Demo-marsruudile üks valikvastusega samm.

- [x] Lukk töötab; tagasi/edasi ei kaota vastust (2026-08-03)
- [x] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`). See rida
      puudus algses plaanis, aga samm lisas `src/engine/answers.ts` –
      failiteed ja plaan ei tohi lahku minna, seepärast on ta nüüd siin.

**Otsused (2026-08-03):**

- **Vastuse kuju (`AnswerPayload`) elab engine'is, mitte UI-s** –
  `src/engine/answers.ts`. Kuju on juba täpselt see, mis läheb sammus 1.6
  localStorage'i ja etapis 2 `responses.payload` jsonb-veergu
  (docs/ANDMEMUDEL.md). `numeric.raw` on TEKST, mitte arv: „2,5 m" peab
  jõudma checkerini muutmata, sest ühiku ja koma lugemine on checkeri töö
  (reegel 3).
- **Esitamine on küsimuse, mitte sammu kaupa.** Nii saab checker sammus
  1.4–1.5 anda tagasisidet ühe küsimuse kohta ja andmebaasi läheb üks rida
  küsimuse kohta. Pooleli valik elab sisestuskomponendi mustandiolekus ega
  jõua kunagi ülespoole – muidu avaks poolik klõps luku.
- **Lukk hoiab kinni vastamata, mitte valesti vastatud sammu.** Vale
  vastusega saab edasi. Kinni jäämine karistaks eksimise eest.
- **Esitatud vastust ei saa praegu muuta.** „Muuda vastust" tuleb koos
  checkeriga (1.4–1.5): ilma tagasisideta ei ole muutmiseks põhjust, ja
  koos muutmisega tuleb ka `revised_count`.
- **StepShell võtab `moduleId` propsi ja lähtestab selle muutumisel
  sammu + vastused.** Küsimuste id-d (`precheck-1`) korduvad moodulite
  vahel ja `/m/:slug` renderdab kõigil moodulitel SAMA komponenti – ilma
  lähtestamiseta kanduks eelmise mooduli vastus üle.
- **Lukus „Edasi" kõrval on alati nähtav põhjus** („Vasta küsimusele, siis
  saad edasi") – lukus nupp ilma põhjenduseta on õpilase jaoks lihtsalt
  katkine nupp.

**Ülevaatuse leiud (CodeRabbit + Codex, 2026-08-03).** Kolm parandatud:

- *Codex:* sammukomponendi POOLELI olek (tehtud, aga esitamata valik)
  kandus üle moodulivahetusel – React taaskasutas instantsi, sest
  küsimuste id-d korduvad moodulite vahel. Parandus: `key` StepContentil.
  Lukk oleks muidu avanenud vastusega, mida õpilane ei andnud.
- *CodeRabbit:* tundmatu sammutüüp andis korraga teate „ei oska näidata"
  JA lukus „Edasi" – umbtee. Parandus: kui sammu ei osata näidata, ei
  nõuta ka vastust.
- *CodeRabbit:* fookus ei liikunud moodulit vahetades, sest `index` jäi
  nulli. Parandus: `moduleId` efekti sõltuvustesse.

**Lahtine ots sammule 1.4 – SULETUD sammus 1.5.** Toona oskas `QuestionCard`
ainult valikvastust ja arvküsimus oleks jätnud õpilase sammule lukku,
seepärast tohtis ainus küsimustega sisu olla arendusdemo `/m/test`. Sammus
1.5 lisandus arvvastuse sisestus; vabatekst ootab endiselt sammu 1.11 ja
kuni selleni kehtib sama piirang vabatekstiga küsimustele. CodeRabbit
pakkus toona lahenduseks skeemi piiramist valikvastusega – seda EI tehtud,
sest see oleks rikkunud moodulilepingut ja tulnud tagasi keerata.

## 1.4 Checker: arvvastus

> **Prompt AI-le:** Loo src/checker/numeric.ts: arvvastuse kontroll
> (tolerants % või absoluut, koma JA punkt lubatud, ühikuteisendus
> mm/cm/m ja Pa/kPa). Tagastab {correct, feedback}. Vitest testid: õiged,
> valed, piiripealsed, ühikuvahetusega, koma-vastused.

- [x] Testid rohelised; proovi ise 5 imelikku sisendit (tühik, „2,5m", …)
      (src/checker/numeric.ts, tests/numeric.test.ts, 2026-08-03)
- [x] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`, 2026-08-03,
      CodeRabbit 2 leidu parandatud + Codex 1 lahtine küsimus
      contractSchema nulltolerantsi kohta, vt allpool)

**Lahtine küsimus (Codex, 2026-08-03):** `contractSchema.ts` nõuab
`tolerance.value` positiivsust, seega täpset vastet (nulltolerants) ei saa
praegu ükski moodul kirja panna. Kui mõni küsimus (nt "peegeldumisnurk =
langemisnurk") vajab tulevikus täpset vastet, tuleb see otsustada eraldi –
ei ole selle sammu ulatuses.

## 1.5 Checker: valikvastused

> **Prompt AI-le:** Loo src/checker/choice.ts: üks õige, mitu õiget,
> väärarusaama silt vale valiku küljes. Testid. Ühenda mõlemad checkerid
> StepShelli demo-sammudega.

- [x] Demo-moodulis saab vastata arv- ja valikküsimusele ning saab tagasisidet
      (src/checker/choice.ts + index.ts, src/ui/steps/NumericInput.tsx +
      Feedback.tsx, demo /m/test kolme küsimusega, 2026-08-03)
- [x] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`, 2026-08-03:
      CodeRabbit 0 leidu koodis, Codex 1 päris viga + 1 stiilileid,
      mõlemad parandatud – vt allpool)

**Otsused (2026-08-03):**

- **Checkeri tulemus on üks kuju kõigile küsimuseliikidele**
  (`src/checker/types.ts` `CheckResult`) ja `correct` on
  `true | false | null`. `null` = ei hinnata – vabatekst (reegel 3: AI ei
  hinda) või vastus, mida ei saa küsimusega kokku viia. See on TÄPSELT
  `responses.is_correct` veerg (docs/ANDMEMUDEL.md), seega sammus 1.6 ei
  pea kuju ümber tegema. Hind: `!result.correct` on nüüd viga – kontrolli
  alati `=== true` / `=== false`.
- **Küsimuseliigid on checkeris REGISTER** (`questionCheckers`,
  src/checker/index.ts), mitte switch – nii nõuab moodulileping
  („Raudreeglid laiendamisel"). Test võrdleb registrit skeemi liikidega:
  uus liik ilma checkerita kukutab testi, mitte ei jää vaikselt
  kontrollimata.
- **Katkine vastus ei ole vale vastus.** Kui vastuse liik ei klapi
  küsimusega või valik viitab olematule variandile, tuleb `null`, mitte
  `false`: see on meie, mitte õpilase viga. Tundmatut varianti EI jäeta
  vaikselt kõrvale – muidu muutuks „õige + prügi" õigeks vastuseks.
- **Õiget vastust me pärast valet vastust välja ei anna** – õpilane näeb
  ainult oma valikut, checkeri lauset ja vihjeid. Nii jääb „Muuda vastust"
  (1.6) mõttekaks.
- **Vihjed näidatakse ainult vale vastuse juures.** Õige vastuse kõrval on
  nad müra, hindamata vastuse juures eksitavad (seal ei ole „õiget").
- **Arvvastuse väli on `type="text"` + `inputMode="decimal"`**, mitte
  `type="number"`: number-väli keeldub Eesti komast ja kerimine muudaks
  vastust kogemata. Tipitud tekst läheb checkerini muutmata (reegel 3).
- **„Muuda vastust" ja `revised_count` lükkuvad sammu 1.6-sse** (sammu 1.3
  märkus lubas neid siia). Põhjus: `revised_count` on salvestatud väli
  (docs/ANDMEMUDEL.md) – ilma salvestuseta ehitaks ta kaks korda. Vihjed on
  seni „mõtle veel", mitte „proovi uuesti".
- **Demo `/m/test` sai kolm küsimust ÜHTE precheck-sammu** (valik, arv
  lõksuga, mitu õiget). Uut sammutüüpi (practice) EI lisatud – see nõuaks
  sammukomponenti, mis on 1.12 töö (reegel 7).

**Ülevaatuse leiud (CodeRabbit + Codex, 2026-08-03).** Üks päris viga:

- *Codex:* vale vastuse tagasiside käskis „Proovi uuesti", aga esitatud
  vastust ei saa muuta (see tuleb alles 1.6) – õpilane näeb käsku, mida
  ekraanil täita ei saa, ja arvab, et rakendus on katki. Sama viga oli
  kahes teises lauses („Kirjuta nt 2,5", „Vasta ühikus m"). Parandus:
  kõik kolm lauset kirjeldavad nüüd olukorda, mitte ei anna käsku
  (`src/checker/numeric.ts`), ja test hoiab piiri – kui 1.6 lisab vastuse
  muutmise, TOHIB selle testi kaotada, aga teadlikult.
- *Codex (stiil):* selle plaanifaili „lahtine ots" lõik ütles korraga, et
  arvvastus on tehtud ja et seda ei ole. Parandatud.
- *CodeRabbit:* ainus leid puudutas `sisu/ALLIKAD.md` rida, mis on
  eelmisest sessioonist commit'imata ega kuulu selle sammu juurde – jäi
  teadlikult puutumata (reegel 7).

## 1.6 Edenemise salvestus seadmesse (+ preview-režiim)

> **Prompt AI-le:** Loo src/engine/progress.ts: localStorage
> (looduslab:progress), iga sammu olek ja vastus mooduli + sammu kaupa.
> Lehe uuesti avamisel jätkub moodul õigest sammust. „Alusta uuesti" nupp.
> Andmekuju peab vastama docs/ANDMEMUDEL.md-le: ÜKS moodulikäik (staatus,
> current_step, algus/lõpp) + selle all vastused (samm, question_id,
> is_correct, revised_count) – nii ei pea etapis 2.11 kuju ümber tegema.
> Lisa KOHE `mode: "persist" | "preview"`: preview ei kirjuta mitte kuhugi
> (ka mitte localStorage'i) ja tuleb marsruudilt, mitte moodulist
> (docs/ARHITEKTUUR.md „Kolm salvestusrežiimi", CLAUDE.md reegel 14).

- [x] Sulge ja ava leht keset moodulit – jätkub õigest kohast
      (src/engine/progress.ts + useModuleProgress.ts, src/lib/storage.ts,
      brauseris üle kontrollitud 2026-08-03)
- [x] preview-režiimis läbitud moodul EI jäta localStorage'i ühtegi jälge
      (`/m/test?eelvaade=1` – localStorage jäi sõna-sõnalt samaks)
- [x] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`, 2026-08-03:
      CodeRabbit 7 leidu + Codex 2 leidu, kattusid ühes kohas – vt allpool)

**Miks preview juba nüüd:** seda vajavad „Vaata õpilasena" (2.14) ja
demo-režiim (4.2). Hiljem külge poogitud „ära salvesta" lipp on täpselt see
koht, kust tekib fantoomõpilane õpetaja klassivaates.

**Otsused (2026-08-03):**

- **`preview` ei ole lipp, vaid teine salvestuskiht.** `createProgressStore`
  tagastab preview'le poe, mille `read`/`write`/`clear` ei tee midagi –
  seega ei pea ükski kutsuja „ära salvesta" meeles pidama. Preview ka EI
  LOE: õpetaja „Vaata õpilasena" peab algama puhtalt lehelt, mitte tema enda
  seadmesse jäänud poolikust käigust. Sama poe saab seade, kus
  localStorage'i ei saa kasutada (Safari privaatrežiim) – siis edenemine ei
  salvestu, aga rakendus ei kuku kokku.
- **`currentStep` on sammu ID, mitte järjekorranumber.** Number näitaks uues
  versioonis vale sammu peale (üks samm juurde ja kõik nihkuvad); id on
  igavene (CLAUDE.md reegel 11). Kadunud sammu puhul algab moodul otsast –
  nähtav tagasilangus on parem kui vaikselt vale samm. Kõrvalkasu: StepShelli
  `safeIndex`-i kaitse enam vaja ei ole, sest indeks tuletatakse iga kord
  olemasolevate sammude seast.
- **`is_correct` tuleb ALATI checkerilt** – `withAnswer` kutsub ise
  `checkAnswer`i, seega ükski ekraan ei saa salvestada oma arvamust õigsusest
  (CLAUDE.md reegel 3). Kui küsimust sammust ei leita, on tulemus `null`
  (hindamata), vastus ise jääb alles: see on meie, mitte õpilase viga.
- **`revisedCount` loeb kordusi ainult SAMA versiooni sees** ja vastuse
  `createdAt` ei muutu muutmisel. Andmebaasis on unikaalne võti
  (attempt_id, question_id, module_version) – teise versiooni vastus ei ole
  sama vastuse uus kuju, vaid teine vastus. Muutmisliides („Muuda vastust")
  tuleb hiljem; loogika on nüüd olemas ja testitud, seega ei ehita teda
  kaks korda.
- **localStorage'i sisu ei usuta.** `parseProgressFile` kontrollib kuju
  käsitsi (zod ei tohi brauseri bundle'isse – reegel 13) ja viskab katkise
  kirje kõrvale ÜKSHAAVAL: ühe mooduli rikutud andmed ei tohi kustutada
  teiste moodulite edenemist. Failil on `version: 1`, et kuju muutudes saaks
  vana ära tunda.
- **„Alusta uuesti" küsib üle** (nupp → „Alustame otsast? Senised vastused
  kustuvad."). Üks eksikombel tabatud nupp ei tohi tunnitööd ära pühkida.
- **Teadlik piirang: localStorage hoiab question_id kohta ÜHTE vastust, mitte
  ühte vastust versiooni kohta** (Codexi ülevaatuse leid, 2026-08-03).
  Supabase'is on `responses` unikaalne võti (attempt_id, question_id,
  module_version) – uus major-versioon saab oma rea, vana jääb alles. Seade
  peal on kuju lihtsam: `responses[questionId]` kirjutatakse üle ka siis, kui
  vana vastus oli teise versiooni oma. Otsustasime seda MITTE parandada
  sammus 1.6, sest külalise seadmes olev edenemine ei jõua täna niikuinii
  Supabase'i (docs/ANDMEMUDEL.md „teadaolevad piirangud" p 3) ja etapis 2
  kirjutatakse `responses` rida vastamise HETKEL, mitte localStorage'ist
  hiljem üle kandes – seega see kitsendus ei jõua kunagi andmebaasi
  rikkuma. Kui etapp 2 peaks kunagi nõudma külalise varasema versiooni
  vastuste taastamist, tuleb kuju siin ümber teha (question_id +
  moduleVersion liitvõtmeks) – teadlik võlg, mitte unustus.
- **`status: "completed"` ja `finishedAt` jäävad praegu täitmata** – need
  seab mooduli kokkuvõtteekraan sammus 1.12. Väljad on kujus olemas, et
  andmemudelit hiljem ümber ei tehtaks.
- **Demol on `?eelvaade=1`** (`/m/test?eelvaade=1`), et preview'd saaks käega
  katsuda juba enne marsruuti 2.14. Toodangusse see leht ei jõua.

**Ülevaatuse leiud (CodeRabbit + Codex, 2026-08-03).** Kolm parandatud, üks
teadlikult lahtiseks jäetud (vt eelmine punkt), kolm vale leidu:

- *Mõlemad ülevaatajad, sama koht:* `createProgressStore("preview")` kutsus
  siiski `browserStorage()` (vaikeparameeter arvutati enne `mode`-kontrolli),
  mis tegi proovikirjutuse `setItem`+`removeItem`. Jälge ei jäänud, aga
  kirjutamine ISE toimus – vastuolu reegliga 14. Parandus: teine parameeter
  on nüüd funktsioon (`resolveStorage`), mida preview EI KUTSU üldse; test
  nõuab, et preview'l antud funktsioon ei lähe kordagi käiku.
- *CodeRabbit:* kaks `commit`-kutset sama sündmuse sees oleksid lugenud
  suletuse kaudu vana `progress`-i ja kaotanud esimese muudatuse (täna
  saavutamatu, aga samm 1.9 „vasta ja liigu automaatselt edasi" muudaks
  selle päriseks). Esimene katse (ref, mida uuendatakse renderdamise ajal)
  ei läbinud lint'i (`react-hooks/refs`) – React Compiler ei luba ref'i
  muuta renderduse sees. Lõplik lahendus: `commit` kasutab `setProgress`
  FUNKTSIONAALSET vormi, mis saab React'ilt alati värske oleku, ilma
  ref'ideta.
- *CodeRabbit:* lahtine „Alusta uuesti" kinnitus kandunuks moodulivahetusel
  kaasa (saavutamatu enne sammu 1.13, aga kaks rida maksis vähem kui hilisem
  meenutamine). Parandus: kinnitus nullitakse renderdamise ajal, kui
  `moduleId` muutub – sama muster mis mujal failis.
- *Vale leid (3×):* CodeRabbit ütles, et `plaan/`- ja `docs/`-faile ei tohiks
  selle ülesande käigus muuta. See ON projekti töövoog (iga samm
  dokumenteerib oma otsused plaanis, CLAUDE.md ja see fail ise) – ülevaataja
  ei tea seda konteksti.

---

## Moodul 1: Peegeldumisseadus (sisu/MOODUL-peegeldumisseadus.md)

## 1.7 Füüsikamudel

> **Prompt AI-le:** Loo modules/physics/peegeldumisseadus/model.ts +
> manifest.ts spetsifikatsiooni „Füüsika" osa järgi. Testid kõigi
> spetsifikatsioonis loetletud väärtustega. Ei mingit UI-d.

- [x] Testid rohelised (160 testi, 2026-08-03); **kasutaja luges model.ts ise
      läbi ja kinnitas füüsika** (2026-08-03): nurgad ristsirge suhtes, kaks
      teisendusfunktsiooni, suunavektorid, 0…90° piirid erindiga, hajus
      peegeldumine ja ±1° lugemistolerants jäävad hilisematesse sammudesse
- [x] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`, 2026-08-03:
      CodeRabbit 1 leid + Codex 2 leidu, model.ts ise sai puhta lehe)

**Otsused (2026-08-03):**

- **Nurgafunktsioone on kaks, kuigi arvutus on üks.** `angleFromSurface`
  (ristsirge → pind) ja `angleFromNormal` (pind → ristsirge) teevad mõlemad
  `90 − x`, sest see on iseenda pöördfunktsioon. Kaks nime on TAHTLIK: kogu
  mooduli väärarusaam (`nurk-pinna-suhtes`) on just see, et õpilane ei tea,
  kummast joonest mõõdetakse. Harjutus 3 ja kordamiskaart 3 lähevad pinna
  poolt ristsirge poole – ühe nimega peaks kutsuja peas ümber pöörama ja
  täpselt seal tekiks vaikne viga. Ülevaataja näeb siin duplikaati; see on
  vastus.
- **Suunad tulevad ühikvektoritena, mitte joonise punktidena.** Model.ts
  annab `incidentDirection`/`reflectedDirection` matemaatilistes
  koordinaatides (peegel x-teljel, ristsirge +y, y kasvab ÜLES). Kiire
  algus- ja lõpp-punkt ning SVG y-telje pööramine on paigutus, mitte
  füüsika – need jäävad sammu 1.8 komponendile. Nii ei satu ükski `Math.sin`
  Simulation.tsx-i (reegel 1) ega ükski SVG-koordinaat mudelisse.
- **Väljaspool 0…90° visatakse `RangeError`, mitte ei klammerdata.** Vaikne
  parandus peidaks vea kutsuvas koodis (nt liuguri vale ülempiir) ja
  õpilane näeks õiget arvu vale sisendi pealt. Kontrollitakse ka `NaN`-i ja
  `Infinity`-t – tühjast sisendiväljast tuleb `NaN`, mis muidu lipsaks
  igast võrdlusest läbi.
- **90° on mudelis lubatud, liuguril mitte.** Matemaatiliselt on piirjuht
  korrektne (kiir libiseb piki pinda) ja tema väljajätmine teeks mudelisse
  seletamatu augu. Liugur lõpeb 85° juures (samm 1.8), sest ekraanil näeks
  90° välja nagu viga.
- **Mattpinna hajus peegeldumine EI ole veel mudelis.** Spetsifikatsiooni
  „Füüsika" osa teda ei nimeta ja lüliti ise tuleb sammus 1.9 – siis lisandub
  ka tema füüsika (fikseeritava seemnega, ilma `Math.random`-ita).
- **Manifesti valvab test.** `manifestSchema.parse(manifest)` jookseb
  tests/peegeldumisseadus.model.test.ts-is, sest rakendus ise zod-i ei
  jooksuta (contract.ts kommentaar) – katkine manifest paistaks muidu välja
  alles brauseris.
- **Registrisse moodulit veel EI panda** – see on sammu 1.13 rida. Seni ei
  kasva ka esilehe bundle (reegel 13).

**Ülevaatuse leiud (CodeRabbit + Codex, 2026-08-03).** Kolm leidu, ükski
mitte `model.ts`-i kohta – Codex ütles otse, et valemid ja piirjuhud on
spetsiga kooskõlas. Leiud ei kattunud: ülevaatajad vaatasid eri faile.

- *CodeRabbit, vale leid, aga õige põhjus:* nõudis manifestile
  tolerantsivälja. `manifestSchema` on `strictObject` ilma selleta ja
  tolerants elab küsimuse juures (`activities.ts`), kust checker ta ka
  loeb. Ülevaataja luges siiski õigesti CLAUDE.md reeglit 3, mis väitis
  „tolerants manifest'is" – see rida oli docs/MOODULILEPING.md-ga vastuolus
  ja sai parandatud omaette commit'iga. Vale leid võib osutada päris veale
  hoopis dokumendis.
- *Codex, päris viga (töövoog):* `sisu/ALLIKAD.md` oli teist sammu järjest
  commit'imata ja oleks läinud füüsikamudeli commit'i kaasa. Sai omaette
  commit'i, nagu reegel 7 nõuab. Sama fail oli sammu 1.5 leidudes juba
  kirjas – lahtine ots ei kao sellest, et ta on plaani üles märgitud.
- *Codex, stiil, aga faktiliselt õige:* ALLIKAD.md koondkirje viitas
  „Erkki Tempeli oma allpool", kuigi see rida on tabelis ülalpool.
  Parandatud sama commit'iga.

## 1.8 Simulatsiooni visuaal

> **Prompt AI-le:** Loo Simulation.tsx: SVG spetsifikatsiooni „explore" osa
> järgi (peegel, kiir, pinna ristsirge, peegeldunud kiir; liugur 0–85°; nurgad
> suurelt). Ainult visuaal + liugur, ülesandeid veel mitte. Kasuta model.ts-i.

- [x] Liugur liigutab kiirt õigesti; töötab sõrmega telefonis
      (src/modules/physics/peegeldumisseadus/Simulation.tsx, arendusleht
      `/sim-test`; brauseris üle vaadatud 360 px ja 1280 px juures:
      0°, 8°, 60°, 85°, klaviatuur, „Alusta uuesti" – 2026-08-03)

**Otsused (2026-08-03):**

- **Simulatsioon ei ole veel ühegi sammu sees.** Teda näeb ainult
  arenduslehelt `/sim-test` (marsruut `import.meta.env.DEV` taga, nagu
  `/m/test`). Explore-sammu külge ühendav väli tuleb sammus 1.9 KOOS
  ülesannetega – siis on näha, mida samm simulatsioonilt päriselt küsib
  (nt „sea 30°"), ja liides ei sünni oletuse peale. `contractSchema.ts`
  kommentaar lubas seda välja juba sammus 1.8 – rida on parandatud, sest
  plaan ja kood ei tohi lahku minna. Arendusleht kaob sammus 1.9.
- **Komponendis ei ole ühtegi `Math.sin`-i** (CLAUDE.md reegel 1, sammu 1.7
  otsus). Kõik suunad tulevad `model.ts`-ist ühikvektoritena; `pointAt` on
  AINUS koht, kus matemaatiline y (üles) muutub SVG y-ks (alla). Ka
  nurgasildi koht tuleb vektorite poolitajast (liitmine + pikkusega
  jagamine), mitte poolnurga siinusest – nii ei teki komponenti teist
  füüsikaarvutust.
- **Peegeldumisnurk tuleb `reflectionAngle`-ist, mitte muutuja koopiast.**
  Täna on nad võrdsed; seadus peab elama ühes kohas.
- **Nooled ei ole kiirte keskel, vaid eri kaugusel ja väljaspool siltide
  ringi.** 0° juures langevad mõlemad kiired ristsirgele kokku (see ON õige –
  kiir tuleb tagasi sama teed) ja keskel olevad nooled kataksid teineteist:
  õpilane näeks üht joont ühe noolega. Sama koht on sammu 1.9 ülesanne 2
  („leia nurk, mille korral kiir peegeldub otse tagasi"), seega pidi see kohe
  töötama. Sildiringist väljas on nad seepärast, et 20° juures sattus nool
  muidu otse numbri peale.
- **Nurgasilt on kaare keskel (suundade poolitajal), aga mitte lähemal kui
  20 px ristsirgest.** Poolitaja hoiab sildi kaare sisse, seega kiir ei jookse
  temast läbi; miinimumkaugus hoiab kaks numbrit väikese nurga juures kõrvuti.
  Kaks vahepealset katset olid halvemad ja on siia kirja pandud, et neid ei
  proovitaks uuesti: (a) siltide peitmine alla 6° – 8° juures olid numbrid
  ikka koos ja peitmine jättis õpilase infota; (b) siltide lükkamine ristsirge
  eri pooltele – siis jooksis kiir 30° juures sildist läbi.
- **Tekstid joonistatakse kõige viimasena, valge äärisega**
  (`paint-order: stroke`). Väikese nurga juures möödub kiir siltidest napilt;
  ilma selleta jooksis sinine kiir sõnast „ristsirge" läbi. Nüüd näib kiir
  mööduvat teksti tagant.
- **Numbrid on ka joonise all suurelt** – 17 px SVG-silti ei loe projektori
  tagumisest reast keegi. Telefonis on need kaks rida, sm-ist alates kaks
  veergu: sõna „Peegeldumisnurk" ei mahu 360 px juures kahte veergu ja
  lühendada teda ei tohi, sest just see mõiste on siin õpitav.
- **Liugur on natiivne `<input type="range">`** – 44 px kõrge, töötab sõrme,
  klaviatuuri ja ekraanilugejaga (`aria-valuetext` ütleb „kraadi", muidu
  loeks ta paljast arvu). Oma lohistusloogikat ei kirjutatud.
- **Vaade ei anna mudelile kahtlast väärtust.** `clampAngle` kärbib liuguri
  väärtuse 0…85° vahele, sest mudel viskab vahemikust väljas vea (tahtlik,
  vt model.ts). Liugur ise juba hoiab piire – see on odav turvaklapp valge
  ekraani vastu.
- **SVG-l on `role="img"` ja püsiv kirjeldus** – nurgad ise loeb ekraanilugeja
  siltidelt joonise all. Liuguri liigutamisel muutuv kirjeldus loeks iga
  kraadi juures terve lause uuesti ette.
- **`mode` ja `onEvent` propse (moodulileping) veel EI ole.** Sündmustel ei
  ole enne sammu 1.9 ühtegi tarbijat; kasutamata prop on kood, mida keegi ei
  kontrolli (reegel 7). Nad tulevad koos ülesannetega.
- **Mattpinna lüliti ja lisavaade „nurk pinna suhtes" jäävad sammu 1.9-sse**,
  nagu spetsifikatsioon ette näeb.

**Ülevaatuse leiud (CodeRabbit + Codex, 2026-08-03).** See EI ole riskisamm,
aga Codex jooksis siiski: `/ulevaatus` otsustab failiteede järgi ja diff
puudutas `src/engine/contractSchema.ts` (ainult kommentaari parandus). Reegel
on failipõhine meelega – „see on ju ainult kommentaar" on täpselt see hinnang,
mille pealt ülevaatus märkamatult ära jääb.

- *Codex, päris viga:* 360 px juures ei mahtunud sõna „Peegeldumisnurk" oma
  kaardile (117 px teksti, 85 px ruumi) ja jooksis üle serva. Mõõtsin
  brauseris järele – leid pidas paika. **Ühtlasi tuli välja, et mu enda
  varasem „360 px" kontroll oli tegelikult 485 px:** Windowsi aken ei lähe
  alla ~500 px, seega tuleb kasutada seadme emuleerimist
  (`emulate viewport 360x740x2,mobile,touch`), mitte akna suurust. Parandus:
  kitsal ekraanil kaks rida, sm-ist alates kaks veergu.
- *Codex, mitte päris viga, vaid teadlik otsus:* komponent ei võta veel
  moodulilepingu propse `mode` ja `onEvent`. Täna ei ole neil ühtegi kutsujat
  ega tarbijat ning `onEvent` kuju selgub alles siis, kui sammus 1.9 on teada,
  mida ülesanne simulatsioonilt küsib. Kasutamata prop oleks kood, mida ükski
  test ei kontrolli (reegel 7). Lisandub sammus 1.9.
- *CodeRabbit, stiiliküsimus:* soovitas lisada sammu alla eraldi linnukesed
  „build ja test rohelised" ning „CodeRabbiti ülevaatus tehtud". Ei võtnud:
  mõlemad kehtivad CLAUDE.md „Definition of done" kaudu igal sammul ja plaanis
  on eraldi rida ainult erandi kohta (Codexi ülevaatus riskisammul).
- *Codex, kõrvaline muudatus:* märkis, et plaanifail on muudetud. See ON
  projekti töövoog (iga samm dokumenteerib oma otsused siia) – sama leid tuli
  ka sammus 1.6.

## 1.9 Simulatsiooni ülesanded ja mattpinna lüliti

> **Prompt AI-le:** Lisa explore-sammu 3 ülesannet ja mattpinna lisalüliti
> spetsifikatsiooni järgi.

- [x] Ülesanded järjest läbitavad, vastused kontrollitakse
      (brauseris üle kontrollitud 360 px ja 1280 px juures, kõik kolm
      ülesannet + mõlemad lülitid, 2026-08-03)
- [x] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`, 2026-08-03):
      model.ts sai uue füüsika (diffuseDirections)

**Otsused (2026-08-03):**

- **`ui/steps/ExploreStep` ei impordi Simulation.tsx-i otse.** ExploreStep
  elab `ui/`-s, mis ei tohi teada moodulitest (docs/ARHITEKTUUR.md). Mooduli
  Simulation-komponent tuleb propsina läbi `StepShell`-i (uus valikuline
  prop `Simulation`), mille annab kaasa app-kiht, kes registrist mooduli
  laadis (StepDemoPage täna, ModulePage sammus 1.13). Teised sammutüübid
  jätavad selle propsi lihtsalt kasutamata.
- **Simulatsiooni lisavõimalused (`mattpind`) on läbipaistmatu string, mitte
  enum.** `contractSchema.ts` `explore.simulation.unlocks` kirjeldab ainult
  "milline silt avaneb millise küsimuse järel" ja uus
  `engine/simulationFeatures.ts` (`unlockedSimulationFeatures`) arvutab
  avatud siltide hulga vastustest – KUMBKI ei tea, mida silt „mattpind"
  tähendab. Ainult mooduli enda Simulation.tsx tõlgendab silti. Nii saab
  iga tulevane moodul oma lisavõimalusi ilma engine'i muutmata.
- **Explore-sammu 3 ülesannet on tavalised numbrivastusega küsimused**
  (checker, nagu precheck'is), mitte simulatsiooni „sündmused". Õpilane
  loeb liugurilt väärtuse ja tipib selle – see on lihtsam ja taaskasutab
  1.4–1.5 checkerit, mitte ei ehita eraldi sündmuste-põhist kontrolli.
  Ülesanne 2 („leia nurk, mille korral kiir peegeldub otse tagasi") on
  samamoodi tüübitud vastus (0°), mitte automaattuvastus.
- **Mattpinna lüliti avaneb `simulation.unlocks` andmete järgi
  (`afterQuestion: "explore-2"`), mitte kõvasti koodis.** Skeem valvab, et
  `afterQuestion` osutab sama sammu olemasolevale küsimusele – ümbernimetatud
  või kustutatud küsimus ei jätaks lülitit vaikselt igaveseks kinni, vaid
  test punaseks.
- **Mattpinna hajumine on model.ts-is `diffuseDirections`** (mulberry32
  fikseeritud seemnega, MITTE `Math.random` – CLAUDE.md reegel 1). Iga
  mikrotahk peegeldab ikka täpselt peegeldumisseaduse järgi, ainult natuke
  kaldu ristsirge suhtes (`langemisnurk + 2×kalle`) – see ON vastus
  väärarusaamale `ainult-peegel-peegeldab`: matt pind ei riku seadust, ta
  lihtsalt koosneb paljudest mikroskoopilistest peeglitest.
- **Mattpinna kiirte arv (9) ja seeme on kunstlikud konstandid
  Simulation.tsx-is, mitte füüsika.** Sama seeme igal renderdusel → sama
  kimp sama nurga juures, muidu näeks liugurit liigutades kiired kaootiliselt
  ringi hüppavat.
- **„Mattpind" toggle PEIDAB, mitte ei keela**, kui lukus (enne ülesannet 2
  vastamist) – lülitit pole üldse näha, mitte disabled checkbox. Nii ei pea
  õpilane mõistma, MIKS miski on halli värvi.
- **„Nurk pinna suhtes" lisavaade ei ole gate'itud** – erinevalt mattpinnast
  ei nõua spetsifikatsioon talle kindlat avanemishetke, seega on ta lihtne
  märkeruut algusest peale.
- **`/sim-test` arendusleht kaotati** (lubati juba sammus 1.8): simulatsiooni
  saab nüüd katsuda otse `/m/test` explore-sammu sees, koos päris
  ülesannetega.

**Ülevaatuse leiud (CodeRabbit + Codex, 2026-08-03).** Mõlemad ülevaatajad
leidsid SAMA päris vea eri kohast koodis – see tõstis kindlust, et tegu on
päris veaga, mitte ühe ülevaataja maitsega:

- *CodeRabbit (major) + Codex, sama viga:* kõik 3 ülesannet renderdusid
  korraga, seega sai ülesande 1 vahele jätta ja vastata kohe ülesandele 2 –
  „Mattpind" (mis peab avanema alles ülesande 2 järel) ilmus liiga vara.
  Spetsifikatsioon ütleb otse „(järjest)". Parandus: `ExploreStep` näitab
  küsimusi järjest – järgmine ilmub alles pärast eelmisele vastamist.
- *CodeRabbit (minor):* SVG `aria-label` kirjeldas alati „peegeldunud kiir",
  ka siis, kui mattpind on sees ja ekraanil on hajunud kiirte kimp –
  ekraanilugeja kasutaja sai vale kirjelduse. Parandus: kirjeldus muutub
  mattpinna sisse-välja lülitamisel (harv, diskreetne sündmus, mitte
  liuguri-sarnane pidev muutus – vt olemasolev kommentaar samas kohas).
- *Codex (stiil):* selle plokis oli platvormisõna `TODO_REVIEW_FINDINGS`,
  kuni ülevaatus valmis – nüüd täidetud päris sisuga.
- Kõrvalist ei leitud: uut npm-paketti, migratsiooni, `dangerouslySetInnerHTML`
  kasutust ega id/slug/question_id muutust kumbki ei tuvastanud.

## 1.10 Sammud enne simulatsiooni (hook, precheck, predict)

> **Prompt AI-le:** Loo activities.ts sammud 1–3 täpselt spetsifikatsiooni
> tekstidega. Ennustus lukustub enne explore-sammu avamist.

- [x] Ennustust ei saa pärast simulatsiooni nägemist muuta
      (brauseris üle kontrollitud 360 px ja 1280 px juures: predict-1
      lukustub kohe esitamise järel ja jääb lukku ka explore-sammu
      külastades ja tagasi tulles, 2026-08-03)

**Otsused (2026-08-03):**

- **Precheck oli juba varasemast sammust demos olemas** – 1.10 uus sisu on
  ainult `hook-1` ja `predict-1`. `activities.ts` ei teki veel: sisu elab
  endiselt `StepDemoPage.tsx` `DEMO_STEPS`-is (samm 1.9 otsus – moodul
  läheb registrisse alles sammus 1.13, siis koondub kogu sisu
  activities.ts-i).
- **Ennustus EI kasuta QuestionCardi/checkerit.** `PredictStep` kutsub
  `ChoiceInput` otse, ilma `checkAnswer` + `Feedback`-ita – muidu näeks
  õpilane kohe „Õige!"/„Vale", mis on vastuolus contractSchema.ts kommentaariga
  „Salvestatakse, EI hinnata". `ChoiceInput` iseenesest ei näita õigsust
  (ainult õpilase enda valikut), seega sobis otse kasutada.
- **Lukustumine tuleb tasuta olemasolevast mustrist, mitte uuest koodist.**
  `StepShell` lukustab „Edasi" vastamata sammu peal (samm 1.3) ja ükski
  sisestuskomponent (`ChoiceInput`, `NumericInput`) ei luba esitatud
  vastust muuta – seega täitis „ennustus lukustub enne explore't ja jääb
  lukku" nõude juba olemasolev arhitektuur, ilma et predict oleks pidanud
  midagi erilist tegema.
- **Vabatekst „Miks sa nii arvad?" jääb välja**, nagu QuestionCardi kommentaar
  juba ütleb: `text`-liiki küsimus jääks alati vastamata (sisend puudub kuni
  sammuni 1.11) ja lukustaks sammu igaveseks. Sama koht, kuhu explain-samm
  (1.11) hiljem oma vabateksti lisab.
- **Hook ja predict kirjeldavad stseeni tekstiga, mitte joonisega.** Ka
  precheck ja varasemad teooriasammud on siiani puhtalt tekstilised – ühtegi
  foto/diagrammi tugisüsteemi rakenduses veel ei ole (ainus visuaal on
  explore-sammu enda SVG simulatsioon). Uue diagrammikomponendi ehitamine
  jäigi selle sammu mahust välja.

## 1.11 Sammud pärast simulatsiooni (collect, explain)

> **Prompt AI-le:** Lisa mõõtetabeli samm (3 rida) ja selgituse samm
> (vabatekst min 15 sõna, kõrval õpilase enda ennustus). Simulatsioon on
> IDEAALNE (müra ei ole) – seega ±1° on LUGEMISTOLERANTS (õpilane loeb
> liugurit ja tipib käsitsi), mitte mõõtmisviga. Kontroll: iga rida vastab
> mudelile ±1° piires. Ära lisa juhuslikkust model.ts-i.

- [ ] Tabel kontrollib täidetust; selgituse juures on ennustus nähtav
- [ ] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`): ±1°
      lugemistolerants on checkeri loogika, mitte kuvamine

## 1.12 Harjutamine ja väljumispilet

> **Prompt AI-le:** Lisa practice-samm (4 ülesannet: näidis → osaline →
> 2 iseseisvat, vihjed ja väärarusaamade sildid spetsist) ja exit-samm.
> Lisa engine'i mooduli kokkuvõtteekraan (pärast exit'i): „Valmis! Täna
> õppisid: [õpieesmärk manifest'ist]" + edasiviiv nupp. Kontrolli, et
> ennustuse sammul on „see ei ole hinne" lause ja explain/exit sammudel
> „Sinu vastust näeb õpetaja" märge (docs/DISAINIJUHIS.md „Turvatunne").

- [ ] Lõksülesanne (35° pinna suhtes) annab vale vastuse korral õige vihje
- [ ] Kokkuvõtteekraan kuvatakse; usalduslaused on õigetel sammudel

## 1.13 Õpetajafail ja kursuselehe link

> **Prompt AI-le:** Loo teacher.ts (juhend, väärarusaamad, 45 min plaan
> spetsist). Lisa activities.ts lõppu reviewCards spetsifikatsiooni
> „Kordamiskaardid" osast (kordamismootor tuleb etapis 3, aga kaardid
> kirjutatakse valmis kohe – vt docs/MOODULILEPING.md). Registreeri moodul
> src/modules/registry.ts-is ja lisa id kursusefaili
> (src/content/fyysika-8.ts) plokki 1 – kursuseleht hakkab moodulit näitama;
> /m/peegeldumisseadus avaneb laisalt laaditult.

- [ ] Moodul on kursuselehelt leitav ja algusest lõpuni läbitav
- [ ] reviewCards on failis olemas (keegi ei loe neid veel – see on ootuspärane)
- [ ] Võrgusakis on näha, et mooduli kood laaditakse eraldi failina

## 1.14 Katsetus päris kasutajaga

- [ ] Lase 1–2 õpilasel (või kolleegil) moodul telefonis läbida, ise vaikselt
      kõrvalt vaadates. Märgi üles IGA koht, kus tekkis küsimus või seisak
- [ ] Paranda kolm kõige suuremat konarust (igaüks eraldi commit)

**Valmis, kui:** järgmine katsetaja läbib mooduli ilma sinu abita.

---

## Moodul 2: Vedeliku rõhk (sisu/MOODUL-vedeliku-rohk.md)

Sama jaotus nagu moodulil 1 – iga rida üks sessioon:

- [ ] 1.15 model.ts + manifest + testid (kontrolli füüsika!)
- [ ] 1.16 Simulation.tsx visuaal (andur, liugurid, vedelike valik)
- [ ] 1.17 explore ülesanded + anuma kuju lisavaade
- [ ] 1.18 hook + precheck + predict
- [ ] 1.19 collect (graafik – punktid langevad TÄPSELT sirgele, sim on
      ideaalne) + explain
- [ ] 1.20 practice + exit
- [ ] 1.21 teacher.ts + reviewCards + registry.ts + kursusefaili plokk 5 +
      telefonis läbimine

**Riskisammud selles loendis:** 1.15 (füüsika `model.ts`-is) ja 1.19
(graafiku ja tolerantsi loogika) – nende juures jookseb `/ulevaatus`-es ka
Codex, nagu moodulil 1.

Kui mall vajas mooduli 2 juures muutmist: rakenda muudatus tagasi ka
moodulile 1 (eraldi sessioon).

## 1.22 Etapi lõpukontroll

- [ ] Mõlemad moodulid läbitavad telefonis algusest lõpuni
- [ ] Hinda ausalt: kas kolmas moodul valmiks selle malli peal ~1 päevaga?
      Kui ei – lihtsusta malli enne 2. etappi
