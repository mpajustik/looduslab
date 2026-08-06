# LoodusLab AI – reeglid AI-assistendile

LoodusLab AI on eestikeelne füüsika simulatsioonide õppekeskkond 8. klassile
(hiljem 7.–12. klass). Õpilane läbib mooduleid sammhaaval (ennusta → uuri →
selgita → harjuta), õpetaja jagab mooduleid klassikoodiga ja näeb klassi
ülevaadet. Ehitajaks on füüsikaõpetaja, kes õpib arendust töö käigus – selgita
oma otsuseid lühidalt ja eesti keeles.

## Tehnoloogiapinu (FIKSEERITUD – ära paku alternatiive)

- React 19 + TypeScript (strict) + Vite (uusimad stabiilsed versioonid)
- React Router (marsruutimine), Tailwind CSS v4 (stiilid)
- shadcn/ui baaskomponendid (Button, Card, Tabs, Dialog, Accordion,
  Progress, Sonner) – kood kopeeritakse src/ui alla, EI impordita paketina
- lucide-react (ikoonid), Inter Variable font @fontsource kaudu
  (self-hosted – mitte kunagi Google Fonts CDN-ist, GDPR!)
- TanStack Query (serveriandmed), Zod (valideerimine)
- Recharts (andmegraafikud), oma SVG (simulatsioonide visuaalid), KaTeX (valemid)
- Supabase: Postgres + Auth + RLS + Edge Functions
- Vitest (testid), majutus: Cloudflare Workers staatiliste failidena
  (wrangler devDependency'na, seadistus wrangler.jsonc – Cloudflare suunab
  uued projektid Pages'i asemel Workersisse; sama CDN, sama git-põhine deploy)
- qrcode + @types/qrcode (klassikoodi QR, etapp 2 – pakett ise tüüpe kaasa
  ei anna, strict TS ei kompileeriks ilma tüübipaketita),
  vite-plugin-pwa (etapp 4), @sentry/react (veaseire, etapp 2)

Need paketid on eelnevalt heaks kiidetud – reegel 4 (küsi enne uut
sõltuvust) kehtib kõigele, mida siin loendis EI ole. Kui plaanifail
(plaan/ETAPP-*.md) nimetab paketi NIMELISELT, loeb see eelloaks – aga
lisa see samas ka siia loendisse, et loend jääks ainsaks tõe allikaks.

## Käsud

```bash
npm run dev        # arendusserver
npm run test       # Vitest testid
npm run build      # toodangu build (peab alati õnnestuma enne commit'i)
npm run lint       # ESLint + tüübikontroll (tsc --noEmit)
npm run turvakontroll # kas service-võti on lekkinud repo või bundle'i (samm 2.16)
npm run coverage      # ainekava katvuse raport (valmib etapis 4.0)
npm run sync-modules  # manifestid → Supabase modules tabelisse (etapp 2.5)
```

Kaks viimast käsku VALMIVAD hiljem. Kuni need puuduvad, ei kehti ka
moodulilepingu „alusta katvusraportist" samm – etapi 1 kaks pilootmoodulit
on plaaniga ette antud.

## Mudelivalik (iga sammu alguses)

Enne koodi ütlen ühe reaga, mis mudelit see samm nõuab ja miks. **Mudeli
vahetab kasutaja** käsuga `/model sonnet` või `/model opus` – ma ei saa seda
ise teha ja ükski hook ei saa ka (Claude Code hookidel puudub mudeli
määramise väljund).

| Sammu tüüp | Mudel |
| --- | --- |
| Riskisamm: model.ts, checker, engine, migratsioonid, Edge Functionid, saladused | **Opus** |
| Arhitektuur või silumine: tüübilepingud, uue etapi algus, „ei tea, miks katki on" | **Opus** |
| Tavasamm mustri järgi: UI-tekstid, stiilid, komponent olemasoleva eeskujul | **Sonnet** |
| Mehaaniline töö: testid ette antud väärtustega, failide liigutamine, dokumendi täiendus | **Sonnet** |

Riskisammu loend on TÄPSELT sama, mis skillil `/ulevaatus` – üks loend, kaks
kasutust: mis vajab ülevaatuseks teist mudelit, vajab ka kirjutamiseks
tugevamat. Otsuse teen muudetavate failide järgi, mitte tunde järgi.
Kahtluse korral **Opus**: ümber tehtud samm maksab rohkem kui säästetud
Sonneti-sessioon.

Kui jooksev mudel on soovitatust nõrgem, siis **Opust nõudval sammul ootan
kinnitust** enne alustamist – see kehtib mõlema Opuse rea kohta, nii
riskisammu kui ka arhitektuuri/silumise puhul. Sonneti sammul mainin ja
teen edasi.

**Fable'it ei paku ma kunagi ise** – sellele lülitub ainult kasutaja, sest
tema otsustab, millal krediiti kulutada. Sama kehtib alamagentide kohta:
`model: fable` ei tohi sattuda ühessegi agendifaili.

## Ülevaatus enne commit'i

Iga sammu lõpus vaatab muudatused üle CodeRabbit CLI. Windowsis natiivset
klienti ei ole, seega käib see WSL Ubuntu kaudu:

```bash
# projekti juurkaustast – wsl viib töökausta ise kaasa
wsl -d Ubuntu -- coderabbit review --uncommitted --include-untracked --agent
```

Skill `/ulevaatus` teeb selle ära ja triaažib leiud (päris viga vs
stiiliküsimus) – leide EI parandata pimesi. Sisselogimine
(`coderabbit auth login`) käib kasutaja enda terminalis – CodeRabbit
keeldub agendi-terminalis sisse logimast.

**Riskisammul** (model.ts, checker, engine, migratsioonid, Edge Functionid,
saladused) lisab `/ulevaatus` teise mudeli: `npm run review` käivitab
Codexi erapooletu ülevaatajana (juhis failis AGENTS.md, leiud
`codex-ulevaatus.md`-sse). Otsuse teeb muudetud failide järgi, mitte tunde
järgi – täpne loend on skillis. Leiud liigitatakse kasutajale ette; **mida
parandatakse, otsustab kasutaja**. Vt docs/TOOVOOG.md „Teine mudel".

## Kaustastruktuur

```
src/
  app/        # lehed ja marsruudid
  ui/         # ühiskomponendid (nupud, kaardid, StepShell, Graph)
  engine/     # õppemootor: sammude järjestus, edenemine, salvestamine
  checker/    # deterministlik vastuste kontroll
  lib/        # supabase klient, localStorage, abifunktsioonid
  content/    # kursusefailid (fyysika-8.ts) – moodulite järjestus ja rühmitamine
  modules/
    registry.ts               # id → () => import(...) – AINUS koht, mis teab kõiki mooduleid
    physics/<moodul>/         # manifest.ts, model.ts, Simulation.tsx, activities.ts, teacher.ts
supabase/migrations/          # SQL migratsioonid (ainult koos kasutaja ülevaatusega!)
supabase/tests/               # SQL kontrollskriptid – kopeeri SQL Editorisse,
                              # ütlevad ise OK/VIGA (ei ole Vitesti testid)
tests/                        # model.ts ja checker'i testid
```

## Raudsed reeglid

1. **Füüsika ainult failis model.ts** – puhaste funktsioonidena (sisend →
   väljund). Simulation.tsx ainult kuvab. Igal model.ts funktsioonil on test
   teadaolevate väärtustega.
2. **Iga moodul järgib moodulilepingut** (docs/MOODULILEPING.md). Ära loo
   moodulit teistsuguse struktuuriga.
3. **Arvulise vastuse õigsust otsustab checker, mitte kunagi AI.** Checker
   arvestab ühikuid ja lubatud viga (tolerants iga küsimuse juures
   `activities.ts`-is, mitte manifest'is – vt docs/MOODULILEPING.md).
4. **Uus npm-pakett ainult kasutaja loal.** Enne lisamist paku 20-realist oma
   koodi alternatiivi.
5. **Iga tabel vajab RLS-i.** Migratsioon ilma RLS-reegliteta on poolik.
   Migratsioone EI käivitata enne, kui kasutaja on SQL-i ise üle lugenud.
6. **Saladusi ei panda koodi.** Võtmed ainult .env failides (gitignore'is) ja
   Edge Functionite keskkonnamuutujates.
7. **Väikesed sammud.** Üks ülesanne = üks muudatus = üks commit. Ära refaktoori
   asju, mida ülesanne ei puuduta.
8. **Ära kirjuta ise autentimist** – ainult Supabase Auth.
9. **Kasutajaliidese tekstid eesti keeles, kood inglise keeles** (muutujad,
   funktsioonid, commit-sõnumid võivad olla eesti keeles).
10. **Mobile-first.** Iga vaade peab töötama 360 px laiusel telefonil ja
    projektoril (suur tekst). Kontrolli mõlemat.
11. **Mooduli id, slug JA küsimuse question_id on igavesed.** Moodul ei tea
    oma kohta kursuses – järjestus ja rühmitamine elavad kursusefailides
    (docs/SISUHALDUS.md). Mooduli asemel kustutamist kasuta
    status: "archived". Küsimuse ID-d ei tohi ümber nimetada ka siis, kui
    küsimuse tekst muutub – õpetaja koondvaade ja vanad vastused ripuvad
    selle küljes (versioonireeglid: docs/MOODULILEPING.md).
12. **dangerouslySetInnerHTML on keelatud.** Õpilaste vabatekst renderdub
    alati Reacti tavalise escapimisega. Kui kunagi on vaja rikkalikku
    teksti, küsi enne kasutajalt.
13. **Moodulid laaditakse dünaamiliselt** (import() + lazy) src/modules/
    registry.ts kaudu – esilehe bundle jääb väikeseks. Rasked sõltuvused
    (KaTeX, Recharts) impordi ainult sammudes, kus neid päriselt vaja on.
14. **Engine'il on alati kirjutamisvaba režiim.** `mode: "persist"` salvestab,
    `mode: "preview"` ei kirjuta MITTE KUHUGI (ei localStorage'i ega
    Supabase'i). Õpetaja „Vaata õpilasena" ja demo-režiim kasutavad
    preview't – nende kasutamine ei tohi kunagi tekitada klassivaatesse
    andmeid ega rikkuda õpilase enda edenemist.

## Disain (lühidalt – täpsemalt docs/DISAINIJUHIS.md)

- Lihtsus ennekõike: üks ekraan = üks tegevus, maksimaalselt 4 navigatsioonivalikut
- Värvid: teal (#0f766e) põhivärv, sinine info, kollane õpetaja-ala; taust valge
- Nupud ja klikialad vähemalt 44 px; fondid loetavad ka projektorilt
- Värv ei ole kunagi ainus info kandja; kõik juhtnupud töötavad klaviatuuriga

## Definition of done (iga ülesande puhul)

- [ ] `npm run build` ja `npm run test` õnnestuvad
- [ ] Töötab telefonivaates (360 px) ja töölauavaates
- [ ] UI-tekstid eesti keeles, õigekiri kontrollitud
- [ ] Uus loogika model.ts/checker'is on testidega kaetud
- [ ] Ülevaatus tehtud (skill `/ulevaatus`) ja leiud triaažitud –
      riskisammul jookseb CodeRabbiti kõrval ka Codex
- [ ] git commit tehtud selgitava sõnumiga

## Viited

- Arhitektuur: docs/ARHITEKTUUR.md
- Moodulileping: docs/MOODULILEPING.md
- Andmemudel ja RLS: docs/ANDMEMUDEL.md
- Tokenikulu ja töökiirus: docs/TOKENIKULU.md (mõõdetud arvud – üks samm =
  üks sessioon, ekraanipilt on lõppkontroll, brauser ainult visuaali-sammudel,
  kirjuta fail korraga valmis)
- Kursused ja sisu jagamine: docs/SISUHALDUS.md
- Lisatooted ja ristmüük: docs/LISATOOTED.md (ristmüük AINULT õpetaja-alas,
  õpilasele ei turundata kunagi midagi)
- Etappide plaan: plaan/ (ETAPP-0 … ETAPP-4)
- Ainekava (sisu tõe allikas): sisu/AINEKAVA-fyysika-8.md – iga moodul
  viitab õpitulemustele/mõistetele/praktilistele töödele siit
- Uue mooduli spetsi mall: sisu/MALL-moodul.md (sh suurusreegel: moodul on
  väike – 5–20 min, 3–6 sammu, üks õpieesmärk)
- Välised allikad (õpikud, ülesandekogud): sisu/ALLIKAD.md – teadmata
  litsentsiga allikast EI kopeerita sõnasõnalist teksti ega ülesande
  sõnastust rakendusse kunagi; ainult faktikontroll ja analoogid
  (uued arvud, uus kontekst, oma sõnastus)
- Moodulite jaotuskava: sisu/JAOTUS-fyysika-8.md – otsus, kuidas ainekava
  plokid moodulteks jagunevad (täidab skill /jaga-plokk, kinnitab kasutaja)
- Moodulite sisu: sisu/MOODUL-*.md (valmis pedagoogilised spetsifikatsioonid)
