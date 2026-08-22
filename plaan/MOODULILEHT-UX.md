# Mooduli leht – kasutajakogemuse täiendused

**Taust:** 2026-08-22 vaadati läbi mooduli leht (`/m/:slug`):
`src/app/pages/ModulePage.tsx`, `src/ui/StepShell.tsx` ja kõik
`src/ui/steps/` komponendid, kõrvutatuna docs/DISAINIJUHIS.md lubadustega.
Leiti kaks kohta, kus rakendus murrab disainijuhises antud lubadust
(sammud 1 ja 2), ja viis kohta, kus kogemus on lihtsalt konarlik.

**Töövorm:** üks samm = üks commit (reegel 7). Iga sammu järel `/ulevaatus`;
sammul 1 jookseb ka Codex (riskisamm – puudutab vastuste voogu ja checkeri
kuvamist). Kontrolli iga muudatust 360 px laiuses JA projektorivaates
(reegel 10).

**Järjekord:** 1 ja 2 enne kõike muud – need on lubadused, mida rakendus
praegu ei täida. 4 ja 5 alles pärast päris seadmes proovimist: mõlemal on
nähtavaid kõrvalmõjusid, mida koodist ei otsusta.

---

## 1. Vale vastust peab saama parandada — **riskisamm, Opus**

Disainijuhis: „**Vale vastus ei karista:** alati saab uuesti proovida"
(docs/DISAINIJUHIS.md „Turvatunne") ja „Vihjed avanevad ükshaaval nupuga
„Vihje" (max 2)" (samas, „Tagasiside keel").

Praegu: `ChoiceInput` ja `NumericInput` lukustavad vastuse esimese
esitamisega, `Feedback` näitab kohe nii õiget vastust (`result.expected`)
kui ka kõiki vihjeid korraga. Kogemata vajutatud vale variant lõpetab
mõtlemise ära ja ainus tee tagasi on „Alusta uuesti", mis kustutab terve
mooduli vastused.

Lukustus oli TEADLIK otsus **ennustuse** jaoks (plaan/ETAPP-1-moodulid.md
samm 1.10) ja seal jääb ta alles. Praegu kehtib sama reegel ka `precheck`,
`explore` ja `practice` peal, kus ta töötab õppimise vastu.

- [x] **Otsus: SAMMUTÜÜBIST** (`src/engine/retry.ts` `allowsRetry`). „Kas siia
      tohib uuesti vastata" on terve sammu pedagoogiline omadus – ennustust ei
      parandata sellepärast, et ta ON ennustus, mitte sellepärast, et mooduli
      autor nii otsustas. Lipp `activities.ts`-is tähendaks, et iga uus moodul
      teeb sama otsuse uuesti (ja ühel ununeb). Reegel on `Record<StepType,
      boolean>`, seega uus sammutüüp ei kompileeru ilma otsuseta
- [x] Vale vastuse järel „Proovi veel" – sisestus avaneb uuesti (mustand hoiab
      eelmise vastuse väljal alles), kõrval rida „Sinu eelmine vastus: …"
      juhuks, kui mustand on lehe värskendamisega kadunud. Fookus liigub
      nupult sisestusse
- [x] Vihjed ükshaaval nupuga „Vihje" / „Veel üks vihje"
- [x] Õige vastus (`result.expected`) paistab alles pärast teist katset või
      nupu „Näita vastust" peale
- [x] `predict` jääb lukku (ta ei kasutanudki QuestionCardi); `explain` ja
      `exit` samuti. Lisaks sai parandatavaks `collect` – mõõtmise mahakirjutamine
      on täpselt sama viga mis explore'is ja lukk töötab seal sama moodi vastu
- [x] **Katsed: `revisedCount` KANNAB seda juba** (`src/engine/progress.ts`
      `withAnswer`, `responses.revised_count` andmebaasis, sünkroonib
      `progressRemote.ts`). Iga uus vastus samale küsimusele kasvatab
      loendurit, `createdAt` jääb esimese katse omaks. Mida EI ole: iga katse
      oma vastus (praegu jääb alles ainult viimane) – see nõuaks uut rida
      `responses`-is ehk migratsiooni, seega **eraldi otsus**, mitte selle
      commit'i osa. Õpetaja koondvaade `revisedCount`-i täna ei näita – vt uus
      punkt 8
- [x] Testid: `tests/retry.test.ts` (testikeskkond on node, seega on reegel
      puhta funktsioonina engine'is, mitte komponendis)
- [x] Codexi ülevaatus tehtud (`/ulevaatus`). Codex leidis vea, mida CodeRabbit
      ei näinud: parandamise ajal jääb „Edasi" lahti (ja peabki jääma – samm ON
      vastatud), seega saab õpilane kirjutada uue vastuse ja lahkuda ilma seda
      esitamata, mispeale jääb VAIKSELT kehtima vana vale vastus. Parandus:
      parandamise ajal on sisestuse kohal rida „See kehtib seni, kuni esitad
      uue" – lukku „Edasi" peale ei pandud, sest see karistaks

## 2. „Salvestatud ✓" puudub täiesti — Sonnet

Disainijuhis lubab: iga esitatud vastuse järel lühike „Salvestatud ✓",
võrgukatkestusel „Salvestan, kui võrk taastub" (mitte punane veateade).
Koodis ei ole seda sõna kusagil. Telefonis vastav õpilane ei tea, kas töö
jõuab õpetajani.

- [x] Sammu allservas väike olekurida (`src/ui/SaveNotice.tsx`), mis loeb
      sünkroonijärjekorra seisu (`src/lib/progressSync.ts` `saveState` +
      `subscribe`) – uut olekut juurde ei tekitata, ainult `pending` sisu ja
      viimane `PushResult` saavad nime. Vaade saab seisu engine'ilt
      (`useModuleProgress.saveState`, `useSyncExternalStore`), seega ta ei tea
      endiselt, kuhu ja kas üldse salvestatakse
- [x] Kolm seisu: salvestatud / salvestan / ootab võrku. Veateadet ei ole –
      katkine võrk ei ole õpilase viga ja vastus on seadmes alles
- [x] Külalise ja `preview` režiimis EI näidata „Salvestatud". Preview't ei
      pea eraldi keelama: seal ei ole järjekorda üldse (`sync === null`).
      Külalise tunneb ära `skipped` vastuse järgi – see katab ka klassiga
      liitumata õpilase ja õpetaja oma seadmes, mida `showGuestNotice` ei tea.
      Seis `off` on lõplik, muidu vilguks vahepeal „Salvestan …".
      Codexi ülevaatuse leid: külalise `skipped` tuli algversioonis alles
      Supabase'i sessioonikontrollist, seega enne serveri vastust (ja katkise
      võrguga kuni järgmise online-sündmuseni) võis külaline ikka näha
      „Salvestan …" või „Salvestan, kui võrk taastub" – lubadust, mida ei saa
      kunagi täita. Parandus: `progressRemote.ts` küsib enne võrku
      `readMembership() === "guest"` (seadmepoolne, ilma võrguta – õpilane
      ütles selle ise „jätka külalisena" nupuga)

## 3. Tagasitulek keset moodulit on tumm — Sonnet

Järgmisel päeval tagasi tulles avaneb moodul vaikselt 4. sammul, ilma ühegi
lauseta. Ainus vihje on `Samm 4/6` paremas ülanurgas, mida õpilane lugema ei
satu.

- [x] Rida „Jätkad sealt, kus pooleli jäid" mooduli avamisel, kui
      salvestatud samm ei ole esimene
- [x] Rida kaob esimese sammuvahetusega – ta on tervitus, mitte püsiv silt
- [x] Kokkuvõttel (`isCompleted`) seda rida ei ole – seal on juba „Valmis!"

## 4. Telefonis on „Edasi" kerimise taga — Sonnet, ALLES pärast telefonis proovimist

Navigatsioon on sisu all (`StepShell.tsx`). Pikal explore- või
practice-sammul tähendab see 360 px ekraanil rütmi „vastad → kerid alla →
Edasi → kerid üles".

- [ ] Proovi PÄRIS telefonis, mitte devtoolsis: kas probleem on päriselt olemas
- [ ] Kui on: kleepuv nupuriba (`sticky bottom-0`) ainult mobiilis
- [ ] Kontrolli, et riba ei kata sisu viimast rida ega vastuse tagasisidet
- [ ] Klaviatuuri avanemine telefonis ei tohi riba sisu peale tõsta

## 5. Explore-sammul on näit ja sisestusväli teineteisest kaugel — Sonnet, ALLES pärast proovimist

Sama juur mis sammul 4: õpilane loeb simulatsioonilt arvu, kerib alla,
tipib, kerib üles kontrollima.

- [ ] Küsimuse juures väike kordusnäit („Praegu: 12 cm"), MITTE kogu
      simulatsiooni dubleerimine
- [ ] Näit tuleb simulatsiooni enda väärtusest, mitte teisest arvutusest –
      kaks tõde annaks kaks eri arvu
- [ ] Kui see osutub keeruliseks: alternatiiv on lühem simulatsioon, mitte
      keerulisem kordusnäit

## 6. Kokkuvõte võiks nüüd rohkem lubada — Sonnet

`ModuleSummary.tsx` jättis meelega välja lause „Kordamisküsimused lisatud
sinu kordamisse", sest kordamist ei olnud olemas. Nüüd on (etapp 3).

- [ ] Lause tagasi + link `/kordamine` – aga alles siis, kui kaardid
      päriselt tekivad (kontrolli `src/engine/review.ts`)
- [ ] Järgmise tunni nimi kokkuvõttel, kõrvuti „Tagasi kursuse juurde"
      nupuga. Järjestust teab kursusefail (`src/content/fyysika-8.ts`),
      `ui/` ei tohi seda teada – link läheb `summaryAction` kaudu nagu praegu
- [ ] Viimasel moodulil ploki lõpus ei ole „järgmist" – see haru peab olema

## 7. Väiksemad kohad — Sonnet, ühe commitina või jupiti

- [ ] **„Alusta uuesti" asukoht.** Lehe all keskel (`StepShell.tsx`), aga
      simulatsiooni oma peab juhise järgi olema üleval paremal. Otsusta
      teadlikult: kas ühtlustada või jätta, ja kirjuta põhjus kommentaari
- [ ] **„Laen tundi …"** on paljas pealkiri – aeglase ühendusega telefonis
      näeb välja nagu tühi ekraan. Rahulikum ootetekst või skeleton
- [ ] **Külalise riba** seisab iga sammu kohal terve mooduli vältel.
      Kokkuklapitav pärast esimest lugemist – aga „Liitu klassiga" nupp
      peab jääma leitavaks
- [ ] **Sammude ülevaade** – progressiriba on `aria-hidden` kaunistus,
      klõpsata ei saa. 3–6 sammu juures ilmselt OK; klõpsatavaid punkte
      EI tehta enne, kui keegi on selle puudumise üle päriselt kurtnud

## 8. Õpetaja koondvaade ei näita, mitmenda katsega vastus tuli — Sonnet

Tekkis sammust 1: nüüd saab vale vastust parandada, seega „õige" võib
tähendada ka „õige kolmandal katsel". `revisedCount` on olemas ja jõuab
andmebaasi, aga ükski õpetajavaade ei loe teda (Codex leidis sama sammu 1
ülevaatusel: `ClassResponsesTab.tsx` küsib ainult lõppseisu).

- [ ] Klassi koondvaates märge, kui vastus tuli parandamisega (nt „õige, 2.
      katsel") – mitte punane, mitte hoiatus
- [ ] EI tehta enne, kui sammu 1 vool on päris tunnis läbi käidud: praegu ei
      tea keegi, kui tavaline parandamine üldse on

---

## Mida siin EI tehta

- **Sammude vahelejätmine.** Lukk vastamata sammul on pedagoogiline otsus
  (`StepShell.tsx` `locked`), mitte ebamugavus.
- **Punktid, protsendid, edetabel.** Kokkuvõte jääb arvudeta
  (docs/DISAINIJUHIS.md „Turvatunne").
- **Uus npm-pakett.** Kõik ülalolev on olemasoleva koodiga tehtav (reegel 4).
