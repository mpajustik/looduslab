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

- [ ] Sammude vahel liikumine töötab telefonis (360 px)

## 1.3 StepShell: vastuse lukk

> **Prompt AI-le:** Täienda StepShelli: kui sammul on vastus, on „Edasi"
> lukus kuni vastuse esitamiseni. Esitatud sammule tagasi minnes on vastus
> nähtav. Demo-marsruudile üks valikvastusega samm.

- [ ] Lukk töötab; tagasi/edasi ei kaota vastust

## 1.4 Checker: arvvastus

> **Prompt AI-le:** Loo src/checker/numeric.ts: arvvastuse kontroll
> (tolerants % või absoluut, koma JA punkt lubatud, ühikuteisendus
> mm/cm/m ja Pa/kPa). Tagastab {correct, feedback}. Vitest testid: õiged,
> valed, piiripealsed, ühikuvahetusega, koma-vastused.

- [ ] Testid rohelised; proovi ise 5 imelikku sisendit (tühik, „2,5m", …)

## 1.5 Checker: valikvastused

> **Prompt AI-le:** Loo src/checker/choice.ts: üks õige, mitu õiget,
> väärarusaama silt vale valiku küljes. Testid. Ühenda mõlemad checkerid
> StepShelli demo-sammudega.

- [ ] Demo-moodulis saab vastata arv- ja valikküsimusele ning saab tagasisidet

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

## 1.8 Simulatsiooni visuaal

> **Prompt AI-le:** Loo Simulation.tsx: SVG spetsifikatsiooni „explore" osa
> järgi (peegel, kiir, normaal, peegeldunud kiir; liugur 0–85°; nurgad
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

Kui mall vajas mooduli 2 juures muutmist: rakenda muudatus tagasi ka
moodulile 1 (eraldi sessioon).

## 1.22 Etapi lõpukontroll

- [ ] Mõlemad moodulid läbitavad telefonis algusest lõpuni
- [ ] Hinda ausalt: kas kolmas moodul valmiks selle malli peal ~1 päevaga?
      Kui ei – lihtsusta malli enne 2. etappi
