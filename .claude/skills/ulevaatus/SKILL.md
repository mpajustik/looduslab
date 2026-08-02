---
name: ulevaatus
description: Lase CodeRabbit CLI-l (WSL Ubuntus) vaadata üle commit'imata muudatused ja triaaži leiud – päris viga vs stiiliküsimus. Kasuta enne iga commit'i, kui plaani samm on koodis valmis.
---

# Sõltumatu ülevaatus CodeRabbit CLI-ga

Sinu ülesanne: lasta CodeRabbitil vaadata üle SELLE sammu muudatused ja
esitada kasutajale triaažitud leiud eesti keeles. Sina ei ole ülevaataja –
sina oled see, kelle tööd vaadatakse. Seepärast ära kaitse oma koodi ega
lükka leide käigupealt kõrvale.

## Eeldused

CodeRabbit CLI elab WSL Ubuntus (Windowsis natiivset versiooni ei ole).
Käsk käib alati `wsl` kaudu. `wsl` pärib jooksva töökausta ise, seega ära
kirjuta käsku kõva teed (`/mnt/c/...`) ega kasutajat (`-u root`) – siis
kasutavad sisselogimine ja ülevaatus kindlasti sama kasutajat.

Kontrolli sisselogitust: `wsl -d Ubuntu -- coderabbit auth status`.
Kui vastus on `signed out`, proovi kõigepealt
`coderabbit auth login --agent`. Kui see vastab
`environment_unsupported` („Agent login requires a localhost browser
callback"), siis **peatu** ja ütle kasutajale, et ta jooksutaks oma
terminalis:

```
wsl -d Ubuntu
coderabbit auth login
```

## Sammud

1. **Masinkontrollid enne ülevaatust.** `npm run lint && npm run test &&
   npm run build`. Punane = paranda kõigepealt see. Ülevaatus katkisel
   koodil raiskab päringulimiiti.

2. **Käivita ülevaatus.** Vaikimisi vaadatakse commit'imata tööd (nii
   muudetud kui uued failid – uus moodul ongi peamiselt uued failid):

   ```
   wsl -d Ubuntu -- coderabbit review --uncommitted --include-untracked --agent
   ```

   - Käivita see projekti juurkaustast – `wsl` viib töökausta ise kaasa.
   - Kui samm on juba commit'itud: `--committed` või `--base main`.
   - Käivita see taustal (`run_in_background`) – ülevaatus võtab minuteid.
   - `--agent` annab struktureeritud väljundi. Kui vastuseks tuleb
     päringulimiidi teade, ütle seda kasutajale ausalt ja ära teeskle,
     et ülevaatus toimus.

3. **Triaaži iga leid ise, enne kui midagi parandad.** Iga leiu kohta
   ütle kasutajale:
   - **päris viga** – näita sisend või olukord, millega kood katki läheb;
   - **stiiliküsimus** – ütle, et see on maitse, ja soovita, kas võtta või
     jätta;
   - **vale leid** – põhjenda, miks CodeRabbit siin eksib.

   Kontrolli leide ka projekti reeglite vastu (CLAUDE.md): füüsika ainult
   `model.ts`-is, `dangerouslySetInnerHTML` keelatud, preview-režiim ei
   kirjuta kuhugi, id/slug/question_id igavesed.

4. **Parandamise järjekord.** Päris vea puhul KÕIGEPEALT test, mis vea
   punaseks teeb, alles siis parandus (docs/TOOVOOG.md). Stiilileide
   paranda ainult siis, kui kasutaja ütleb.

5. **Kokkuvõte kasutajale** eesti keeles: mitu leidu, mitu päris viga,
   mida parandasid, mis jäi teadlikult parandamata ja miks. Lõpetuseks
   ütle, mida kasutaja peaks ISE käsitsi läbi proovima (360 px + töölaud).

## Mida MITTE teha

- Ära paranda kõiki leide järjest ilma triaažita – see asendab ühe
  kontrollimata AI teisega.
- Ära muuda faile, mida see samm ei puuduta (raudne reegel 7).
- Ära commit'i ise, kui kasutaja pole öelnud – ülevaatus on lugemine.
