# ETAPP 4: Laiendus (jooksev töö)

**Eesmärk:** rohkem mooduleid, esitlusrežiim, töökindlus kehvas võrgus ja
alles siis AI-vihjed.

Selle etapi sammud on iseseisvad tükid – vali järjekord vajaduse järgi, aga
moodulite tootmine (4.1) käib pidevalt.

---

## 4.0 Ainekava katvuse raport

> **Prompt AI-le:** Loo npm skript coverage: loeb sisu/AINEKAVA-fyysika-8.md
> (õpitulemused P*-T*, põhimõisted, praktilised tööd P*-PT*) ja kõigi
> src/modules/registry.ts-is registreeritud AKTIIVSETE moodulite manifestid
> (outcomes, concepts, practicalWork) ning prindib raporti: kaetud / katmata,
> mooduli kaupa. CI-s hoiatus (mitte
> viga), kui katmata asju on. Kuva õpetajale mooduli juures seotud
> õpitulemused ja mõisted.

- [ ] Raport näitab ausalt: 2 moodulit katab murdosa – ülejäänu on punane
- [ ] Õpetaja näeb mooduli juures ainekava seost

## 4.1 Moodulite tootmine (pidev, katvusraporti järgi)

Rütm: 1–2 VÄIKEST moodulit nädalas. Iga mooduli kohta:

1. Vaata katvusraportit – vali katmata õpitulemus/mõiste/praktiline töö
2. Kopeeri sisu/MALL-moodul.md → täida (ainekava ID-d, suurusreegel!)
3. AI loob mooduli malli peale (vt docs/MOODULILEPING.md protsess)
4. Füüsika kontroll + telefonis läbimine + commit + raport paremaks

Moodulid on väikesed (5–20 min, 3–6 sammu) – üks ainekava plokk on
tüüpiliselt 4–8 moodulit, mis järjestatakse kursusefailis alateemade alla.

Soovituslik järjekord (kooliaasta rütmis):

- [ ] Plokk 1 lõpuni: Valgusallikad ja liigitus (P1-T1); Täis- ja poolvari
      + varjutused (P1-PT1); Kuu faasid; Tasapeegli kujutis (P1-PT4);
      Valgusfiltrid ja värvid (P1-T3, P1-PT2)
- [ ] Plokk 2: Murdumine (P2-T1); Täielik peegeldumine; Läätsed ja kiirte
      käik (P2-T3); Kujutise konstrueerimine (P2-PT1); D = 1/f harjutus
      (P2-T6); Silm ja prillid (P2-T5); Luubi suurendus (P2-PT3)
- [ ] Plokk 5 lõpuni: Rõhk ja pindala (P5-T1, P5-PT1); Pascali seadus
      (P5-T2); Õhurõhk ja ilmaandmed (P5-PT2); Üleslükkejõud (P5-T2,
      P5-PT3); Ujumine ja uppumine (P5-T3); Fü = ρgV harjutus (P5-T5)
- [ ] Plokk 3: Liikumisgraafikud (P3-T1); Keskmine kiirus (P3-T4);
      Inerts ja vastastikmõju (P3-T2, T3); Tihedus (P3-T4, P3-PT2)
- [ ] Plokid 4, 6, 7 samas rütmis – alati katvusraporti järgi

## 4.2 Esitlusrežiim (demo)

> **Prompt AI-le:** Lisa moodulile ?mode=demo: suurem tekst ja juhtnupud
> (1,5×), ainult hook + predict + explore sammud, klassi vastuste
> kuvamine (mitmendik valis A/B/C) kui õpetaja on sisse logitud. Demo
> kasutab engine'i preview-režiimi (olemas sammust 1.6) – projektoril
> klõpsimine EI salvesta midagi ega ilmu klassivaatesse.

- [ ] Projektoril loetav klassi tagant; õpetaja saab ennustused ekraanile
- [ ] Demo läbimine ei jäta jälge ei localStorage'i ega andmebaasi

## 4.3 PWA ja kehv võrk

> **Prompt AI-le:** Lisa vite-plugin-pwa: rakenduse kest ja viimati avatud
> moodulid vahemällu; võrguta indikaator; vastuste järjekord (juba engine'is)
> tühjeneb ühenduse taastudes. Testi lennurežiimiga.

- [ ] Lennurežiimis avaneb viimati kasutatud moodul ja vastused säilivad

## 4.4 AI-vihjed (alles kui 4.1–4.3 töötavad!)

Neli eraldi sessiooni:

- [ ] **4.4a Funktsiooni skelett.** Edge Function ai_hint: õiguste kontroll,
      fikseeritud test-vastus (AI-d veel pole). Testi curl-iga.
- [ ] **4.4b AI-kutse.** Lisa AI API kutse + mooduli kontekst (activities.ts
      sisu) + väljundi Zod-valideerimine (vihje, mitte vastus!). Võti ainult
      funktsiooni keskkonnamuutujas.
- [ ] **4.4c Kulupiir.** Max N päringut õpilase kohta päevas; ületamisel
      sõbralik teade. Testi piiri ületamist.
- [ ] **4.4d UI.** „Vihje" nupp kuvatakse alles pärast õpilase enda katset.
      Proovi läbi mõlemal pilootmoodulil – kas vihjed on päriselt sisukad?

Reeglid (CLAUDE.md-st, korda üle):

- AI EI ütle kunagi õiget vastust, kui eesmärk on arutlemine
- AI EI hinda arvulisi vastuseid – see jääb checkerile

## 4.5 Teenuste ristmüük (docs/LISATOOTED.md)

> **Prompt AI-le:** (1) Loo src/content/teenused.ts (teenus: nimi,
> kirjeldus, seotud plokid, kontakt) ja avalik leht „Teenused koolidele".
> (2) Mooduli õpetajapaneelis üks vaikne rida, kui ploki kohta on teenus.
> (3) Klassi kokkuvõttevaates „järgmise sammu" soovitus. KÕIK ainult
> õpetaja-alas – õpilase vaates ei tohi olla ÜHTEGI pakkumist.

- [ ] Teenuste leht + kaks viidet töötavad; õpilase vaates ei ole midagi

## 4.6 Tagasisidekanal

> **Prompt AI-le:** Iga mooduli lõppu väike „Märkasid viga või on
> ettepanek?" vorm (vabatekst, salvestub tabelisse feedback). Tabel tuleb
> uue migratsiooniga docs/ANDMEMUDEL.md „Tugitabelid" järgi – KOOS
> RLS-reeglitega samas migratsioonis (CLAUDE.md reegel 5), ja nagu iga
> migratsioon: enne käivitamist loen SQL-i ise üle. Salvesta kaasa
> module_version (viga käib versiooni, mitte mooduli kohta). Õpetaja
> töölauale nende nimekiri.

- [ ] Tagasiside jõuab sinuni – see on moodulite kvaliteedi mootor

---

## Mida ENDISELT mitte teha

Punktisüsteemid ja edetabelid; koolide SSO; mikroteenused; oma server;
analüütikaplatvorm; keemia moodulid enne, kui füüsika 8. klass on kaetud.
Iga uue idee juures: kas see aitab luua praktilise, koolis kasutatava
õppelahenduse, mille eest kool maksaks? Kui ei – „hiljem" nimekirja.
