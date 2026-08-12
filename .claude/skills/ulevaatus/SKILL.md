---
name: ulevaatus
description: Lase CodeRabbit CLI-l (WSL Ubuntus) ja riskisammudel ka Codexil (teine mudel) vaadata üle commit'imata muudatused ning triaaži leiud – päris viga vs stiiliküsimus. Kasuta enne iga commit'i, kui plaani samm on koodis valmis.
---

# Sõltumatu ülevaatus: CodeRabbit + Codex

Sinu ülesanne: lasta ülevaatajatel vaadata üle SELLE sammu muudatused ja
esitada kasutajale triaažitud leiud eesti keeles. Sina ei ole ülevaataja –
sina oled see, kelle tööd vaadatakse. Seepärast ära kaitse oma koodi ega
lükka leide käigupealt kõrvale.

Ülevaatajaid on kaks ja nad näevad eri asju:

| | CodeRabbit | Codex (teine mudel) |
| --- | --- | --- |
| Näeb | stiili, mustreid, ohtlikke idioome | loogikat, piirjuhte, vastuolusid |
| Millal | ALATI, iga sammu juures | ainult riskisammul |

Kui mõlemad osutavad samale reale, tõstab see tõenäosust, et tegu on päris
veaga – aga ei tõesta seda. Kontrolli leid ikka sisendi ja koodi vastu üle;
ka kaks ülevaatajat võivad korraga eksida.

## AJUTINE ERAND: CodeRabbit on katki, Codex jookseb IGAL sammul

Seis alates 2026-08-12: CodeRabbit CLI vastab igale ülevaatusele `403 You
are not a member of the requested organization`. Viga on CodeRabbiti serveri
poolel – CLI, sisselogimine, org ja repo ligipääs on kontrollitud ja korras.

Kuni CodeRabbit uuesti tööle saab (kasutaja otsus 2026-08-12):

- **Codex jookseb igal sammul, ka tavasammul.** Allpool olev riskisammu
  loend otsustab siis ainult selle, kas ülevaatus on KOHUSTUSLIK (riskisamm,
  linnuke plaanifaili) või asendab ta puuduvat CodeRabbitit (tavasamm) –
  jooksutada tuleb ta mõlemal juhul. Ilma selleta läheks samm ilma ühegi
  teise silmapaarita, ja see on halvem kui Codexi kulu.
- Proovi CodeRabbitit siiski iga sammu juures ÜKS kord (`wsl -d Ubuntu --
  coderabbit review --uncommitted --include-untracked --agent`). Nii on kohe
  näha, kui viga on nende poolel ära parandatud.
- `/ulevaatus kiire` tähendab seni „ainult üks ülevaataja" ja see ülevaataja
  on Codex, mitte CodeRabbit.
- Commit-sõnumis ütle mõlemad asjad välja: et CodeRabbit ei jooksnud (koos
  veateatega) ja mida Codex leidis.

**Kui CodeRabbit uuesti töötab, kustuta see peatükk** – siis kehtib jälle
tabel ülal ja Codex jääb riskisammudele. Kaks reeglit korraga ei tohi
kehtida.

## Samm 0: masinkontrollid enne kõike muud

`npm run lint && npm run test && npm run build`. Punane = paranda
kõigepealt see. Ülevaatus katkisel koodil raiskab päringulimiiti ja
mõlema ülevaataja aega.

## Samm 1: otsusta, kas see on riskisamm

Vaata `git status --short --untracked-files=all`, millised failid muutusid.
**`--untracked-files=all` on kohustuslik:** paljas `git status --short`
tõmbab uue kausta üheks reaks kokku (`?? src/modules/demo/`) ja siis EI
klapi ükski failitee allpool – uue mooduli `model.ts` jääks märkamata ja
Codex kutsumata. **Riskisamm on see,
kus vale tulemus või andmeleke jõuaks õpilaseni VAIKSELT** – katkist nuppu
näeb kohe, vale rõhuvalemit ei näe keegi.

Codex kutsutakse appi, kui **kasvõi üks** neist kehtib:

- plaanifailis (`plaan/ETAPP-*.md`) on selle sammu all rida
  „Codexi ülevaatus tehtud – **riskisamm**" – see on lõplik, ka siis, kui
  ükski failitee allpool ei klapi (nt 2.13 klassi koondvaade on tavaline
  UI-kood, aga vale koond on vaikne viga, mida õpetaja usub);
- kasutaja ütleb, et see on riskisamm;
- diff puudutab kasvõi üht neist teedest:

- `src/modules/**/model.ts` – füüsika
- `src/checker/**` – vastuste õigsus
- `src/engine/**` – edenemine, salvestamine, **preview-režiim**
- `supabase/migrations/**` – skeem ja RLS
- `supabase/functions/**` – Edge Functionid (klassikood, pidurdus, saladused)
- `src/lib/supabase.ts` või mis tahes koht, kus käideldakse võtit või
  isikuandmeid

Muudel juhtudel (UI-tekst, stiil, `Simulation.tsx`, `activities.ts`
sõnastused, dokumendid) piisab CodeRabbitist – ära kuluta Codexit ära.

Kui failiteed ütlevad „riskisamm", aga plaanis sellist rida ei ole, tee
ülevaatus ikka ära JA ütle kasutajale, et plaanis võiks see rida olla –
kaks nimekirja ei tohi lahku minna.

Kasutaja saab otsuse alistada, aga ainult ühes suunas: `/ulevaatus codex`
sunnib Codexi peale ka tavalisel sammul. `/ulevaatus kiire` jätab Codexi
vahele **ainult tavasammul** – riskisammul seda ei täideta, sest siis jääks
kohustuslik kontroll tegemata ja plaani linnuke „Codexi ülevaatus tehtud"
oleks vale. Kui kasutaja ütleb riskisammul `kiire`, ütle talle, miks sa
seda ei tee, ja jooksuta mõlemad. Ütle alati, kumba teed lähed ja miks.

## Samm 2: käivita ülevaatajad

Mõlemad võtavad minuteid, seega käivita **taustal** (`run_in_background`)
ja riskisammul **korraga** – nad ei sega teineteist.

**CodeRabbit** (elab WSL Ubuntus, Windowsis natiivset klienti ei ole;
`wsl` pärib jooksva töökausta ise – ära kirjuta kõva teed ega `-u root`):

```
wsl -d Ubuntu -- coderabbit review --uncommitted --include-untracked --agent
```

Kontrolli sisselogitust: `wsl -d Ubuntu -- coderabbit auth status`. Kui
vastus on `signed out`, proovi
`wsl -d Ubuntu -- coderabbit auth login --agent` – **eesliide `wsl -d
Ubuntu --` on igal `coderabbit`-käsul kohustuslik**, Windowsis seda käsku
ei ole. Kui vastus on `environment_unsupported`, siis **peatu** ja palu
kasutajal enda terminalis: `wsl -d Ubuntu` ja siis `coderabbit auth login`.

**Codex** (natiivselt Windowsis, juhis failis `AGENTS.md`):

```
npm run review
```

Leiud kirjutatakse faili `codex-ulevaatus.md` – **loe leiud sealt**, mitte
terminalist.

**Kontrolli ENNE leidude ettekandmist, et ülevaatus päriselt toimus:**
väljumiskood on 0 JA `codex-ulevaatus.md` on olemas ja mittetühi. Kui
kumbki ei kehti – või tuleb päringulimiidi teade – **ütle kasutajale
ausalt, et ülevaatus ebaõnnestus**, ja ära teeskle, et see toimus.
Vaikselt tegemata jäänud ülevaatus on halvem kui tegemata jätmine, sest
plaani linnuke saaks vale sisu.

Kui käsk läks läbi ja fail on olemas, siis need kaks asja logis ON müra,
mitte rike – ära kanna neid kasutajale ette:

- katkised täpitähed (`tÃ¶Ã¶voo`) – kasutaja PowerShell on
  ConstrainedLanguage-režiimis; failis on tekst korras;
- üksikud `CreateProcessWithLogonW failed: 267` read – Codexi liivakast
  kogeleb, aga taastub.

## Samm 3: triaaži iga leid ise, enne kui midagi parandad

Iga leiu kohta ütle kasutajale:

- **päris viga** – näita sisend või olukord, millega kood katki läheb;
- **stiiliküsimus** – ütle, et see on maitse, ja soovita, kas võtta või jätta;
- **vale leid** – põhjenda, miks ülevaataja siin eksib.

Kontrolli leide ka projekti reeglite vastu (CLAUDE.md): füüsika ainult
`model.ts`-is, `dangerouslySetInnerHTML` keelatud, preview-režiim ei
kirjuta kuhugi, id/slug/question_id igavesed.

Kui kaks ülevaatajat leiavad sama asja, ütle seda – see tõstab tõenäosust,
et tegu on päris veaga, mitte maitseküsimusega.

## Samm 4: parandamine

Päris vea puhul KÕIGEPEALT test, mis vea punaseks teeb, alles siis
parandus (docs/TOOVOOG.md). Stiilileide paranda ainult siis, kui kasutaja
ütleb. **Kasutaja otsustab, mis parandatakse – mitte sina ja mitte
ülevaataja.**

## Samm 5: kokkuvõte kasutajale

Eesti keeles: kumb ülevaataja jooksis, mitu leidu, mitu päris viga, mida
parandasid, mis jäi teadlikult parandamata ja miks. Lõpetuseks ütle, mida
kasutaja peaks ISE käsitsi läbi proovima (360 px + töölaud).

Riskisammul lisa: kas Codexi leiud kattusid CodeRabbiti omadega või tõi
kumbki midagi oma.

## Mida MITTE teha

- Ära paranda kõiki leide järjest ilma triaažita – see asendab ühe
  kontrollimata AI teisega.
- Ära muuda faile, mida see samm ei puuduta (raudne reegel 7).
- Ära commit'i ise, kui kasutaja pole öelnud – ülevaatus on lugemine.
- Ära jäta Codexit vahele riskisammul sellepärast, et see on aeglane
  (~5 min) või et diff „tundub lihtne". Just seal ta end ära tasub.
