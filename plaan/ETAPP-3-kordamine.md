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

- [ ] Testid rohelised; loogika on nii lihtne, et suudad seda peast selgitada
- [ ] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`)

## 3.3 Tänased kaardid

> **Prompt AI-le:** /kordamine leht: tänased kaardid ükshaaval (max 10
> päevas), vasta → pööra → hinda (Ei mäletanud / Raskelt / Teadsin).
> Arvutuskaardil checker. Kui kaarte pole: sõbralik tühi olek soovitusega
> jätkata kursusega. Sega eri moodulite kaardid.

- [ ] Kaardid tulevad segamini, hindamine muudab järgmist kuupäeva

## 3.4 Minu edenemine

> **Prompt AI-le:** /edenemine leht: 7 plokki edenemisega (moodulid
> läbitud/pooleli), kordamise seis (kaarte ootel), „järgmine soovitus" (üks
> selge nupp: jätka X). EI mingit punktisüsteemi ega edetabelit.

- [ ] Õpilane näeb ühe pilguga, kus ta on ja mida järgmisena teha

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
