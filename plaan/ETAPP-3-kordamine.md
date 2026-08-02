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

- [ ] Mooduli lõpetamine tekitab kordamiskaardid
- [ ] Preview-režiimis lõpetamine EI tekita review_items ridu

## 3.2 Ajastusloogika

> **Prompt AI-le:** src/engine/review.ts – lihtne intervalliskeem (MITTE
> täielik SRS-algoritm): uus kaart → 1 → 3 → 7 → 21 päeva. Vastus „ei
> mäletanud" viib tagasi 1 päevale, „raskelt" jätab intervalli samaks,
> „teadsin" liigub edasi. Kirjuta testid ajastusloogikale.

- [ ] Testid rohelised; loogika on nii lihtne, et suudad seda peast selgitada

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
