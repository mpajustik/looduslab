# ETAPP 3: Kordamine ja edenemine (u 2–3 nädalat)

**Eesmärk:** lõpetatud moodulid toodavad hajutatud kordamise küsimusi;
õpilane näeb oma edenemist.

**Etapp on valmis, kui:** nädal pärast mooduli lõpetamist saab õpilane
„Tänastes kaartides" sisukaid küsimusi mõlemast moodulist segamini.

---

## 3.1 Kordamiskaardid moodulitest

> **Prompt AI-le:** reviewCards on moodulilepingus ja mõlema pilootmooduli
> activities.ts-is JUBA OLEMAS (kirjutatud etapis 1) – ära lisa neid uuesti,
> vaid võta kasutusele: mooduli lõpetamine loob review_items read (või
> localStorage kirje külalisel), üks rea kaardi kohta, due_date = homme.
> Kordamise kirjutamisloogika elab engine'is (docs/ARHITEKTUUR.md), mitte
> moodulites – moodulite koodi EI muudeta.

- [x] Mooduli lõpetamine tekitab kordamiskaardid
- [x] Preview-režiimis lõpetamine EI tekita review_items ridu
- [ ] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`)

- [x] Klassiga liitunud õpilase kaardid jõuavad `review_items` tabelisse

**Tehtud 2026-08-07.** Kaardid elavad seadmes (`looduslab:review`,
src/engine/review.ts) JA serveris (`review_items`). Kolm otsust, mis
järgmisi samme puudutavad:

1. Kaardil on oma saatmisjärjekord (src/engine/reviewQueue.ts +
   src/lib/reviewSync.ts). Edenemise oma ei sobinud: seal on üks kirje
   mooduli kohta, kaardi võti on `moodul + kaart`. Teele läheb üks päring
   MOODULI kohta – nii ei peata sünkimata mooduli võõrvõtmeviga teiste
   moodulite kaarte.
2. Serverisse kirjutatakse „lisa, kui veel ei ole" (`ignoreDuplicates`).
   Tavaline upsert lükkaks teises seadmes kolme nädala peale kasvanud
   intervalli tagasi homsele. **Hinnangu salvestamine (3.2) on TEINE tehe**
   ja peab rea meelega üle kirjutama.
3. Sessioonikontroll („kelle nimel kirjutame") kolis
   src/lib/remoteSession.ts-i – edenemine ja kordamine kasutavad sama.
   Külalise ja õpetaja seadmes ei teki serverisse ridu.

## 3.2 Ajastusloogika

> **Prompt AI-le:** src/engine/review.ts – lihtne intervalliskeem (MITTE
> täielik SRS-algoritm): uus kaart → 1 → 3 → 7 → 21 päeva. Vastus „ei
> mäletanud" viib tagasi 1 päevale, „raskelt" jätab intervalli samaks,
> „teadsin" liigub edasi. Kirjuta testid ajastusloogikale.

- [x] Testid rohelised; loogika on nii lihtne, et suudad seda peast selgitada
- [x] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`)

**Tehtud 2026-08-07.** Redel `1 → 3 → 7 → 21` on failis src/engine/review.ts
(`nextIntervalDays`, `applyReviewResult`, `isDue`). Kolm otsust:

1. Uus tähtaeg arvutatakse HINDAMISE päevast, mitte vanast tähtajast –
   muidu tuleks kaks nädalat hiljem korratud kaart kohe uuesti ette.
2. Hinnangu salvestamine on serveris TEINE tehe (`RemoteReview.save`,
   ülekirjutav upsert). Saatmisjärjekord hoiab nüüd iga kaardi juures ka
   tehet ja `update` võidab `create`-i.
3. Täis kettaga seadmes jääb hinnang seansi mällu (`unsaved`) ja server on
   ainus püsiv koopia – nii ei tule juba hinnatud kaart kohe uuesti ette.

## 3.3 Tänased kaardid

> **Prompt AI-le:** /kordamine leht: tänased kaardid ükshaaval (max 10
> päevas), vasta → pööra → hinda (Ei mäletanud / Raskelt / Teadsin).
> Arvutuskaardil checker. Kui kaarte pole: sõbralik tühi olek soovitusega
> jätkata kursusega. Sega eri moodulite kaardid.

- [x] Kaardid tulevad segamini, hindamine muudab järgmist kuupäeva
- [ ] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`)

**Tehtud 2026-08-07.** Leht on src/app/pages/ReviewPage.tsx, päeva kaartide
valik `dueReviewItems` (src/engine/review.ts, `DAILY_CARD_LIMIT = 10`).
Kolm otsust:

1. **Moodulid vahelduvad ringiratast**, mitte ei segune pelgalt juhuslikult.
   Puhas segamine võiks kümne kaardi piiri sisse jätta ainult ühe mooduli –
   etapi eesmärk nõuab just mõlemat.
2. **Päev on seeme** (`hash32("kordamine:2026-08-07")`): lehe värskendamine ei
   sega kaarte ümber ega too juba hinnatud kaarti tagasi. Päevapiiri hoiab
   `reviewedToday` – täna juba hinnatud kaardid söövad kümnest osa ära, nii et
   ka lehe värskendamine ei anna uut kümmet (Codexi ülevaatuse leid). Loendame
   selle kaartide endi pealt (`lastResult` + tänane `updatedAt`), mitte
   omaette päevaloendurist – üks tõe allikas vähem.
3. **Checkerit kaardil EI OLE.** Plaan lubas arvutuskaardile checkeri, aga
   `reviewCardSchema` (src/engine/contractSchema.ts) hoiab vastust ainult
   TEKSTINA („70° (90° − 20°)") – ilma arvu, ühiku ja tolerantsita ei ole
   checkeril midagi kontrollida. Hinnangu annab praegu õpilane ise
   („vaata → pööra → hinda"). Vt allpool 3.7.

Ülevaatuse teine leid: kui mooduli sisu ei laadi (kehv võrk), ütles leht
vaikselt „ei ole midagi korrata". Nüüd on kolm eri tühja päeva – laadimisviga
(oma teade + „Proovi uuesti"), päev tehtud ja päriselt tühi.

## 3.7 Arvutuskaardile checker (otsustamata)

> **Prompt AI-le:** ainult siis, kui kasutaja seda soovib. `reviewCardSchema`
> saaks `calc`-kaardile valikulised väljad (`value`, `unit`, `tolerance`) ja
> kordamisleht arvusisestuse, mida kontrollib olemasolev
> `checkNumericAnswer`. See on moodulilepingu muudatus: skeem, docs/
> MOODULILEPING.md ja mõlema pilootmooduli `activities.ts`.

- [ ] Otsus tehtud: kas kaart jääb pööratavaks või saab arvutuskaart checkeri

## 3.4 Minu edenemine

> **Prompt AI-le:** /edenemine leht: 7 plokki edenemisega (moodulid
> läbitud/pooleli), kordamise seis (kaarte ootel), „järgmine soovitus" (üks
> selge nupp: jätka X). EI mingit punktisüsteemi ega edetabelit.

- [x] Õpilane näeb ühe pilguga, kus ta on ja mida järgmisena teha
- [x] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`)

**Tehtud 2026-08-07.** Arvutus on src/engine/overview.ts (`courseOverview`),
leht src/app/pages/ProgressPage.tsx ainult joonistab. Kolm otsust:

1. **Soovitusi on täpselt üks** ja tähtsusjärjekord on kirjas koodis:
   pooleli tund → tänased kaardid → järgmine alustamata tund → kõik tehtud.
   Pooleli tund on ees, sest lõpetamata moodul ei anna ka kordamiskaarte;
   kordamine on uue tunni ees, sest kordamispäev ei oota, uus tund ootab.
2. **Kursuse järjekord tuleb sisendina** (`OverviewBlock[]`), mitte impordina –
   engine ei tohi teada, et parasjagu on üks kursus nimega fyysika-8.
   `ProgressStore` sai selle jaoks `list()`-i (preview tagastab tühja loendi).
3. **Ei mingit serveripäringut.** Leht loeb ainult seadet, seega avaneb ka
   ilma võrguta. Serveris olev seis jõuab seadmesse sammuga 3.6.

Riskisammu rida oli plaanis puudu, kuigi samm puudutab `src/engine/**` –
lisatud tagantjärele, et failiteede loend ja plaan ei läheks lahku.

## 3.5 Testimiskiirendus

> **Prompt AI-le:** Lisa dev-režiimi (ainult localhost) nupp „Keri aega
> +1 päev", et kordamisintervalle saaks testida ilma nädalat ootamata.

- [ ] Ajakerimisega saab kogu intervalliloogika 10 minutiga läbi testida

## 3.6 Kaardid serverist tagasi seadmesse

> **Prompt AI-le:** praegu liiguvad kaardid ainult ÜHES suunas (seade →
> server). Teises seadmes avatud kordamine peab nägema serveris olevaid
> kaarte: lugemine `review_items`-ist ja liitmine seadmes olevaga (uuem
> `updated_at` võidab). Tee see alles siis, kui 3.2–3.3 on valmis – enne
> seda ei ole teada, mis kujul kaardid päriselt muutuvad.

- [ ] Telefonis lõpetatud moodul annab kaardid ka kooli arvutis
- [ ] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`)

**Siia kuulub ka sammust 3.2 edasi lükatud leid:** hinnangu ülekirjutav
upsert (src/lib/reviewRemote.ts `save`) kirjutab serveris rea üle
TINGIMUSETA. Kaks seadet samal päeval → hilisem päring võidab, ka siis, kui
tema `updated_at` on vanem. Õige lahendus on „võidab uuem `updated_at`", aga
see nõuab SQL-i (PostgREST upsert tingimust ei oska) ja kuulub kokku siinse
liitmisloogikaga (CodeRabbiti ülevaatuse leid 2026-08-07).

**Ja sammust 3.4 edasi lükatud leid:** /edenemine loeb kaartide arvu seadme
pealt, /kordamine viskab lisaks välja kaardid, mille TEKST on kadunud.
Arhiveeritud mooduli kaardid on nüüd mõlemal pool väljas (filter registri
järgi, ProgressPage.tsx `readOverview`), aga kaardi eemaldamine ALLES OLEVA
mooduli `activities.ts`-ist jääb ikka lahku: seda näeb alles siis, kui mooduli
sisu on laaditud. Õige lahendus on üks jagatud „mis kaardid on päriselt
olemas" abifunktsioon mõlemale lehele – tee see koos siinse liitmisloogikaga
(Codexi ülevaatuse leid 2026-08-07).
