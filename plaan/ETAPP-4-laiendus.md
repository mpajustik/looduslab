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
2. Leia sisu/JAOTUS-fyysika-8.md-st rida, mis selle augu katab. Kui plokk
   on veel jagamata, jaga see esmalt (`/jaga-plokk sisu/AINEKAVA-fyysika-8.md
   P<n>`) ja kinnita jaotus – alles siis edasi
3. Kopeeri sisu/MALL-moodul.md → täida, ainekava ID-d jaotusrealt
   (suurusreegel!)
4. AI loob mooduli malli peale (vt docs/MOODULILEPING.md protsess)
5. Füüsika kontroll + telefonis läbimine + commit; märgi jaotusreale
   staatus `ehitatud` ja kontrolli, et raport läks paremaks

Moodulid on väikesed (5–20 min, 3–6 sammu) – üks ainekava plokk on
tüüpiliselt 4–8 moodulit, mis järjestatakse kursusefailis alateemade alla.

**MILLISED moodulid ühest plokist tulevad, otsustab ainult
sisu/JAOTUS-fyysika-8.md** – ära dubleeri seda loendit siia plaani, muidu
lähevad kaks nimekirja lahku. Siin on ainult PLOKKIDE järjekord, s.o
kooliaasta rütm:

- [ ] Plokk 1 lõpuni (piloot `peegeldumisseadus` juba olemas)
- [ ] Plokk 2
- [ ] Plokk 5 lõpuni (piloot `vedeliku-rohk` juba olemas)
- [ ] Plokk 3
- [ ] Plokid 4, 6, 7 samas rütmis – alati katvusraporti järgi

## 4.2 Esitlusrežiim (demo)

> **Prompt AI-le:** Lisa moodulile ?mode=demo: suurem tekst ja juhtnupud
> (1,5×), ainult hook + predict + explore sammud, klassi vastuste
> kuvamine (mitmendik valis A/B/C) kui õpetaja on sisse logitud. Demo
> kasutab engine'i preview-režiimi (olemas sammust 1.6) – projektoril
> klõpsimine EI salvesta midagi ega ilmu klassivaatesse.

- [ ] Projektoril loetav klassi tagant; õpetaja saab ennustused ekraanile
- [ ] Demo läbimine ei jäta jälge ei localStorage'i ega andmebaasi
- [ ] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`)

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
- [ ] Codexi ülevaatus tehtud iga alamsammu järel – **riskisamm**
      (`/ulevaatus`): võti, kulupiir ja väljundi valideerimine

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
- [ ] Codexi ülevaatus tehtud – **riskisamm** (`/ulevaatus`): uus tabel,
      uus RLS, vabatekst õpilaselt

---

## Mida ENDISELT mitte teha

Punktisüsteemid ja edetabelid; koolide SSO; mikroteenused; oma server;
analüütikaplatvorm; keemia moodulid enne, kui füüsika 8. klass on kaetud.
Iga uue idee juures: kas see aitab luua praktilise, koolis kasutatava
õppelahenduse, mille eest kool maksaks? Kui ei – „hiljem" nimekirja.
