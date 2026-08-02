# LoodusLab AI – arendusfailid

See kaust sisaldab kõike, mida on vaja LoodusLab AI simulatsiooniprogrammi ehitamiseks
koos AI-tööriistadega (nt Claude Code). Failid on mõeldud kopeerimiseks tulevasse
koodirepossse.

## Kuhu mis fail läheb

```
looduslab/                  <- sinu tulevane git-repo
  CLAUDE.md                 <- SIIT: CLAUDE.md (repo juurkataloogi!)
  docs/                     <- SIIT: docs/ kaust tervikuna
    ARHITEKTUUR.md
    MOODULILEPING.md
    ANDMEMUDEL.md
    DISAINIJUHIS.md
    TOOVOOG.md
  plaan/                    <- SIIT: plaan/ kaust tervikuna
    ETAPP-0-vundament.md
    ETAPP-1-moodulid.md
    ETAPP-2-klassid.md
    ETAPP-3-kordamine.md
    ETAPP-4-laiendus.md
  sisu/                     <- SIIT: sisu/ kaust tervikuna
    MOODUL-peegeldumisseadus.md
    MOODUL-vedeliku-rohk.md
```

## Kuidas alustada (1. päev)

1. Loo GitHubi konto (kui pole) ja uus privaatne repo nimega `looduslab`.
2. Kopeeri kõik siinsed failid reposse ülaltoodud struktuuri järgi.
3. Ava Claude Code repo kaustas ja ütle:

   > Loe läbi CLAUDE.md ja plaan/ETAPP-0-vundament.md. Alusta sammust 0.1.

4. Tee iga sammu järel `git commit`. Ära liigu järgmise sammu juurde enne,
   kui eelmise „Valmis, kui" punktid on täidetud.

## Tööpõhimõte

- **Üks samm korraga.** Iga etapifaili samm on 30–90 minuti töö. Väike samm =
  väike viga = lihtne parandada.
- **CLAUDE.md on seadus.** Kui AI pakub midagi, mis läheb CLAUDE.md reeglitega
  vastuollu, viita reeglile ja küsi lihtsamat lahendust.
- **Sina oled aineekspert.** AI kirjutab koodi, sina kontrollid füüsikat ja
  pedagoogikat. Testid (model.ts) on sinu kontrollivahend.
- **Deploy esimesest päevast.** Leht on internetis alates sammust 0.3 ja iga
  git push uuendab seda.

## Seotud dokumendid (samas ülemkaustas)

- `LoodusLab_AI_veebistruktuur.docx` – mida ehitame (lehed, kasutajateekonnad)
- `LoodusLab_AI_tehniline_ylesehitus.docx` – miks just selline arhitektuur
- `LoodusLab_AI_toofail.docx` – äriplaan
- `LoodusLab_AI_terviklik_ulevaade_ja_arhitektuur.docx` – pikk käsiraamat
