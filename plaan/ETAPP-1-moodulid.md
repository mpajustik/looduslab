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

- [ ] Sulge ja ava leht keset moodulit – jätkub õigest kohast
- [ ] preview-režiimis läbitud moodul EI jäta localStorage'i ühtegi jälge
- [ ] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`)

**Miks preview juba nüüd:** seda vajavad „Vaata õpilasena" (2.14) ja
demo-režiim (4.2). Hiljem külge poogitud „ära salvesta" lipp on täpselt see
koht, kust tekib fantoomõpilane õpetaja klassivaates.

---

## Moodul 1: Peegeldumisseadus (sisu/MOODUL-peegeldumisseadus.md)

## 1.7 Füüsikamudel

> **Prompt AI-le:** Loo modules/physics/peegeldumisseadus/model.ts +
> manifest.ts spetsifikatsiooni „Füüsika" osa järgi. Testid kõigi
> spetsifikatsioonis loetletud väärtustega. Ei mingit UI-d.

- [ ] Testid rohelised; **loe model.ts ise läbi ja kontrolli füüsikat**
- [ ] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`)

## 1.8 Simulatsiooni visuaal

> **Prompt AI-le:** Loo Simulation.tsx: SVG spetsifikatsiooni „explore" osa
> järgi (peegel, kiir, pinna ristsirge, peegeldunud kiir; liugur 0–85°; nurgad
> suurelt). Ainult visuaal + liugur, ülesandeid veel mitte. Kasuta model.ts-i.

- [ ] Liugur liigutab kiirt õigesti; töötab sõrmega telefonis

## 1.9 Simulatsiooni ülesanded ja mattpinna lüliti

> **Prompt AI-le:** Lisa explore-sammu 3 ülesannet ja mattpinna lisalüliti
> spetsifikatsiooni järgi.

- [ ] Ülesanded järjest läbitavad, vastused kontrollitakse

## 1.10 Sammud enne simulatsiooni (hook, precheck, predict)

> **Prompt AI-le:** Loo activities.ts sammud 1–3 täpselt spetsifikatsiooni
> tekstidega. Ennustus lukustub enne explore-sammu avamist.

- [ ] Ennustust ei saa pärast simulatsiooni nägemist muuta

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
