# Lühitööd ja kontrolltöö – jaotuskava

**Eesmärk (kasutaja sõnastus 2026-08-22):** iga suurema teema kohta lühitöö
näidis, mis kontrollib õpilase teadmisi ja õpiväljundite saavutamist.
Küsimused muutuvad, kui lühitöö uuesti avada. P1 „Valgus ja peegeldumine"
saab neli lühitööd ja lõppu ühe kontrolltöö.

**Töö jaguneb kaheks:** kõigepealt üks uus küsimusetüüp (märgi joonisele),
mis on eraldiseisev mehhanismitöö, ja alles siis lühitööd ise. Nii ei tule
esimest lühitööd hiljem lahti võtta, kui joonisküsimuse kuju paika loksub.

---

## Otsused (need on plaani vundament – vaidlusta enne, mitte pärast)

### O1. Lühitöö on eraldi MOODUL, mitte uus sammutüüp

Kasutaja otsus. Iga lühitöö saab oma `id`/`slug`
(nt `physics.luhitoo-valgusallikad`), oma kausta ja rea kursusefailis –
täpselt sama muster mis igal muul moodulil. Simulatsiooni tal ei ole,
sammud on `precheck`/`practice`/`exit` tüüpi.

**Miks mitte uus sammutüüp:** register, marsruut `/m/:slug`, jagatav link,
edenemine, õpetaja koondvaade ja kordamiskaardid töötavad mooduli peal juba
täna. Sammutüüp nõuaks kõigi nende jaoks uut rada.

### O2. Uus loos tuleb LÕPETATUD lühitöö taasavamisel, mitte iga avamisega

Kasutaja soov oli „küsimused muutuksid, kui lühitöö uuesti avada". Täht-
tähelt võetuna tähendaks see, et lehe värskendamine keset tööd viskab
õpilase vastused minema – seda me ei taha.

Seepärast täpne reegel: **pooleli töö jätkub, LÄBITUD töö algab uuesti.**
`useModuleProgress` juba oskab `restart()`-i (uus `startedAt` → uus seeme →
uued variandid ja uus valikute järjekord, `src/engine/resolve.ts`). Vaja on
üks tingimus: hindaval moodulil, mille seis on `completed`, kutsutakse
avamisel `restart()` automaatselt.

**MIS täpselt muutub ja mis mitte** (kasutaja otsus 2026-08-22):

| Küsimuse liik | Uuel katsel |
| --- | --- |
| `numeric` | **peab muutuma** – variandid on kohustuslikud, vt B7 |
| `choice` | variantide järjekord muutub (`shuffle` on niikuinii vaikimisi sees) |
| `label` (joonise osad) | **jääb alati samaks** – sama joonis, samad kohad, sama nimede järjekord |

Joonisküsimus jääb meelega paigale: seal on õppimise mõte just see, et
õpilane tunneb SAMA joonise osad ära. `resolve.ts` ei puuduta teda niikuinii
(tundmatu liik läheb muutmata läbi) – see rida on siin selleks, et keegi ei
läheks talle hiljem „ühtluse mõttes" segamist lisama.

### O3. Andmemudelit EI muudeta – alles jääb viimane sooritus

`attempts` tabelil on `unique (student_id, module_id)` (docs/ANDMEMUDEL.md),
localStorage hoiab samamoodi ühte käiku mooduli kohta. Uus katse kirjutab
vana üle.

**Hind, mida tuleb teadlikult maksta:** õpetaja näeb viimast sooritust, mitte
soorituste ajalugu. Kasutaja sõnastas lühitöö „õpilasele näidisena" –
harjutamise jaoks on see õige käitumine. Päris hindeline töö
soorituste ajalooga tähendaks migratsiooni (riskisamm + kasutaja SQL-i
ülevaatus, reegel 5) ja ei kuulu siia kavva.

### O4. Hindav moodul ei tohi ainekava katvusraportit võltsida

`npm run coverage` loeb katvuse manifestidest. Kui lühitöö deklareeriks
`outcomes: ["P1-T1"]`, näitaks raport õpitulemust kaks korda kaetuna, kuigi
õpetatud on ta ühe korra. Manifesti tuleb seepärast uus väli (nt
`kind: "lesson" | "assessment"`, vaikimisi `lesson`) ja
`scripts/coverage.mjs` jätab hindavad moodulid arvestusest välja – aga
loetleb nad eraldi reana („P1-T1 kohta on lühitöö olemas").

Sama väli kannab ka O2 käitumist. Üks väli, kaks kasutust: moodul ütleb,
MIS ta on, ja engine ning raport järeldavad sellest ise.

### O5. Tagasiside tuleb alles töö LÕPUS, mitte küsimuse kaupa

Kasutaja otsus. Täna arvutab `QuestionCard` (src/ui/steps/QuestionCard.tsx)
tagasiside kohe, kui vastus on olemas, ja sisestus lukustub. Lühitööl peab
olema teine režiim: vastus salvestub, aga õigsust ei näidata enne, kui
õpilane töö esitab.

Mida see kaasa toob (need on tagajärjed, mitte lisasoovid):

- **Sisestus jääb lahti.** Kui tagasisidet ei ole, ei ole ka mõtet lukustada –
  õpilane peab saama enne esitamist vastust muuta, nagu päris töös
- **Vihjeid ja „Näita vastust" nuppu lühitööl ei ole.** Praegune
  parandamisloogika (`src/engine/retry.ts`) toetub tagasisidele ja jääb
  hindaval moodulil kasutamata. Lühitöö küsimused kirjutatakse ILMA
  `hints`-ita – vihjega töö ei mõõda enam sedasama asja
- **Vaja on uus lõpuekraan:** kõik küsimused loendina, iga juures õige/vale
  ja õige vastus. Mooduli kokkuvõtteekraan on olemas (engine lisab ta ise),
  aga ta ei näita täna vastuseid – see osa on uus
- **Esitamine on pöördumatu.** Pärast esitamist vastuseid muuta ei saa,
  muidu oleks „lõpus näitamine" mõttetu. Seda tuleb õpilasele enne öelda

### O6. Küsimused kopeeritakse koos päritoluviitega, mitte ei laadita jooksvalt

Kasutaja soovis, et osa küsimusi tuleks olemasolevatest moodulitest.
Jooksev viide (lühitöö impordib teise mooduli `activities.ts`-i) kukub
kolme koha peale: küsimuse id peab skeemi järgi algama SAMMU tüübiga
(`practice-1` ei sobi `exit`-sammu), teise mooduli sisu tuleks bundle'isse
kaasa (reegel 13), ja kahe mooduli versioonid liiguksid eraldi.

Seepärast: lühitöö küsimusel on oma igavene id ja oma arvud, aga
valikuline väli `source: { module, question }` – **dokumentatsioon, mitte
kood**. Kasu on kaks: test kontrollib, et viidatud küsimus on päriselt
olemas (ei jää rippuma), ja õpetaja näeb, kust küsimus pärineb.

Viide on ka koht, kust hiljem näeb, MILLIST mooduli küsimust lühitöö
kordab – kui mooduli küsimus muutub, ütleb viide, kus lühitöös sama asi
kirjas on. Kooskõla hoiab inimene, mitte kood: kaks eraldi versiooninumbrit
ongi siin õige, sest lühitöö arvud peavadki mooduli omadest erinema.

---

## Etapp A. Küsimusetüüp „märgi joonisele" — Opus

Riskisamm CLAUDE.md tabeli järgi: puudutab `contractSchema.ts`-i, checkerit
ja engine'i. See on plaani kõige raskem osa – kõik muu on selle peal
andmete kirjutamine.

**Mida see tüüp teeb:** joonisel on ette antud kohad (peegel, langev kiir,
peegeldunud kiir, pinna ristsirge, langemisnurk, peegeldumisnurk) ja
õpilane seab igale kohale õige nime. Klõpsuga valimine, mitte lohistamine –
lohistamine ei tööta usaldusväärselt puuteekraanil 360 px laiuses
(reegel 10).

**Miks mitte vabakäejoonistus:** kiire vabalt joonistamise õigsust ei saa
checker deterministlikult otsustada (reegel 3). Sildistamine annab sama
õpieesmärgi – „kas ta tunneb joonise osad ära" – ja on lõpuni kontrollitav.

**Kohtade asukoht: joonis joonistab numbrid ise** (kasutaja otsus
2026-08-22). `activities.ts` ütleb, MIS number millise nime saab; KUS see
number joonisel asub, teab ainult mooduli `figures.tsx`. Nii ei ela ükski
koordinaat kahes failis, joonis mahub 360 px ekraanile täpselt nii, nagu
autor ta tegi, ja `ui/` ei pea teadma moodulitest midagi. Nime valib õpilane
joonise all olevast rippmenüüst – üks rida numbri kohta.

- [x] A1. `contractSchema.ts`: uus küsimusetüüp `label` – joonise silt +
      loend kohti (`id`, `marker`, õige nimi) + nimede loend. Skeem valvab:
      iga koht saab täpselt ühe õige nime, üks nimi ei ole õige kahes kohas,
      numbrid on 1 … n ilma aukudeta, joonis on kohustuslik (registris
      olemasolu valvab `tests/registry.test.ts`)
- [x] A2. `answers.ts`: vastuse kuju (`kind: "label"`, koht → valitud nimi)
      + `isAnswerPayload` kontroll (localStorage on võõras andmed)
- [x] A3. `checker/label.ts` + rida `questionCheckers` registrisse. Osaliselt
      õige vastus loeb valeks, aga tagasiside ütleb, MITU kohta oli õigesti –
      muidu ei tea õpilane, kas ta eksis ühes või kõigis. Nimetamata koht saab
      oma lause, et „vale" ja „veel tegemata" ei näeks ühte moodi välja
- [x] A4. `ui/steps/LabelInput.tsx` + rida `QuestionCard`-i: number joonise
      järgi, rippmenüü nimedega, rea kõrgus ≥ 44 px, number on TEKST (värv ei
      ole ainus info kandja). Sama nime tohib panna kahte kohta – see on
      õpilase viga, mille parandab checker, mitte vorm
- [x] A5. Testid: `tests/label.test.ts` – checker teadaolevate vastustega,
      skeemi piirjuhud, `readableAnswerText`. `tests/steps.test.ts` jäi
      puutumata: lisandus oli küsimuseLIIK, mitte sammutüüp
- [x] A6. Prototüüp päris sisuga: peegeldumisseadus sai küsimuse `practice-4`
      ja joonise `peegeldumise-osad` (viis kohta, kaks eksitajat). Versioon
      2.0.2 → **2.1.0** (minor). Telefonivaates (360 px) läbi proovitud
- [x] A7. `/ulevaatus` – riskisamm, seega ka `npm run review` (Codex).
      **Codexi ülevaatus tehtud – riskisamm.** CodeRabbit 2 leidu (1 vale,
      1 päris), Codex 2 leidu (mõlemad päris, kummalgi ülevaatajal oma).
      Kõik neli päris viga parandatud: nimede tekstikordus skeemi, fookus
      rippmenüüle „Proovi veel" järel, õpetajavaate vastuse vormistus ja
      hinnatavate liikide loend

**Otsustuspunkt A järel:** kujutise konstrueerimine (õpilane märgib, KUHU
kujutis tekib) on TEINE tüüp – klõps koordinaadistikku, checker võrdleb
mudeli arvutatud punktiga tolerantsi piires. Ta on eraldi samm ja teda ei
alustata enne, kui `label` on läbi proovitud. Enne otsustamist vaata, kas
`label` kannatas telefonivaadet välja.

## Etapp B. Lühitöö mehhanism — Opus

- [ ] B1. `manifestSchema`: väli `kind` (`lesson` vaikimisi | `assessment`).
      Olemasolevad 19 manifesti jäävad puutumata (valikuline väli)
- [ ] B2. `useModuleProgress`: lõpetatud hindav moodul alustab avamisel uue
      käigu (O2). Test: pooleli töö EI alusta uuesti; `preview`-režiim ei
      kirjuta ka siis mitte kuhugi (reegel 14)
- [ ] B3. `scripts/coverage.mjs`: hindavad moodulid katvusarvestusest välja,
      eraldi loendina sisse (O4) + `coverageRules.test.ts` täiendus
- [ ] B4. **Hilistatud tagasiside** (O5): `QuestionCard` saab prop'i, mis
      keelab tagasiside, vihjed ja parandamisnupud; sisestus jääb lahti ja
      vastust saab enne esitamist muuta. Test: hindaval moodulil EI jõua
      checkeri otsus ekraanile enne esitamist
- [ ] B5. **Töö lõpuekraan** (O5): kõik küsimused loendina – õpilase vastus,
      õige/vale, õige vastus (`CheckResult.expected` on juba olemas) ja
      kokkuvõte „õigesti N küsimust M-st". Esitamine küsib kinnitust, sest
      pärast seda muuta ei saa
- [ ] B6. Küsimuse valikuline `source` väli + test, et viide osutab
      olemasolevale moodulile ja küsimusele (O6)
- [ ] B7. **Test, mis valvab arvuvariante** (O2): hindava mooduli igal
      `numeric`-küsimusel peavad olema `variants` (≥3). Ilma selle valvurita
      libiseb ühe fikseeritud arvuga küsimus lühitöösse sisse ja õpilane näeb
      teisel katsel sama ülesannet – täpselt see, mida vältida tahame
- [ ] B8. `docs/MOODULILEPING.md`: uus jaotis „Hindav moodul (lühitöö)" –
      mille poolest ta erineb, mida ta EI tee (ei anna hinnet, ei hoia
      ajalugu, ei anna vihjeid). Ilma selleta jääb kokkulepe ainult siia plaani
- [ ] B9. `/ulevaatus` + Codex

## Etapp C. Sisu: neli lühitööd + kontrolltöö — Sonnet

Mehaaniline töö olemasoleva mustri järgi, aga **iga küsimus ja iga variant
käib kasutaja heakskiidust läbi** – sama reegel mis kordamismaterjali kaval
(plaan/KORDAMISMATERJAL.md): ainesisu pedagoogilist täpsust ei otsusta AI.

Iga lühitöö: 6–10 küsimust, 10–15 min, **igal** arvküsimusel `variants`
(≥3, vt B7), vähemalt üks `label`-küsimus, ühelgi küsimusel `hints`-e
(O5). Üks lühitöö = üks commit.

- [ ] C1. `sisu/MALL-luhitoo.md` – mall, mis ütleb, mitu küsimust, mis
      tüüpe ja kuidas õpitulemustega seotakse (üks kord kirja, siis neli
      korda kasutada)
- [ ] C2. **Lühitöö 1 – Valgusallikad** (`valgusallikad`, `lambivalik`,
      `liitvalgus-ja-spekter`) → P1-T1
- [ ] C3. **Lühitöö 2 – Valguse levimine ja varjud**
      (`valguse-sirgjooneline-levimine`, `vari-ja-poolvari`, `varjutused`,
      `kuu-faasid`) → P1-T2 esimene pool
- [ ] C4. **Lühitöö 3 – Peegeldumine ja peeglid** (`peegeldumisseadus`,
      `tasapeegli-kujutis`, `peeglikiri`, `nurkpeegel`, `helkur`,
      `noguspeegel`, `kumerpeegel`) → P1-T2 teine pool. Siia kuulub
      `label`-küsimus peegeldumise joonisega
- [ ] C5. **Lühitöö 4 – Värvus ja filtrid** (`esemete-varvus`,
      `valgusfiltrid`) → P1-T3
- [ ] C6. **Kontrolltöö P1** – 12–16 küsimust läbi kõigi kolme
      õpitulemuse; küsimused EI ole lühitööde koopiad, vaid samade
      õpieesmärkide teised variandid
- [ ] C7. Kursusefail: iga lühitöö oma alagrupi lõppu, kontrolltöö ploki
      lõppu omaette alagruppi „Kontrolltöö"
- [ ] C8. Koond-`/ulevaatus` (Free-plaani piirang – vt mälu:
      coderabbit-batch-review)

---

## Mida siin EI tehta

- **Õpetaja ei saa veel ise küsimusi juurde lisada.** Kasutaja soovis seda,
  aga see on omaette toode: vaja on küsimuste tabelit, RLS-i, õpetaja
  toimetusvaadet ja moderatsiooni. Praegu tähendab „küsimus juurde"
  rea lisamist lühitöö `activities.ts`-i. Kui see nurk on tähtis, tuleb ta
  eraldi kavana ETAPP-2 või ETAPP-4 alla
- **Hinnet ega punktisummat ei arvutata.** Checker ütleb õige/vale küsimuse
  kaupa; „14 punkti 20-st" on õpetaja koondvaate teema, mitte mooduli oma
- **Soorituste ajalugu ei säilitata** (O3)
- **Vabakäejoonistust ei tule** (etapp A põhjendus)
- **Uut npm-paketti ei lisata** – SVG ja klikialad on oma koodiga (reegel 4)

## Lahtised küsimused kasutajale

1. Lühitöö 3 loendis ei olnud `kumerpeegli-rakendused` ega
   `noguspeegli-rakendused` (peeglite kasutuskohad). Kas need kuuluvad
   lühitöösse 3 või jäävad ainult kontrolltöösse?
2. Kas kontrolltöö võiks olla ka omaette kursusefail („Kordamine
   kontrolltööks", docs/SISUHALDUS.md lubab), et sinna saaks hiljem P2, P3
   … kontrolltööd kõrvale?
