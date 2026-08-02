# Arhitektuur (lühiviide)

Täispikk põhjendus: `LoodusLab_AI_tehniline_ylesehitus.docx`. See fail on
kokkuvõte, mida AI-assistent vajab igapäevaselt.

## Süsteemi kolm osa

```
Brauser (õpilane/õpetaja)
   │ HTTPS
   ▼
React SPA (Vite, TypeScript, Tailwind)     ← staatilised failid CDN-ist
   │ supabase-js
   ▼
Supabase: Postgres + RLS │ Auth │ Edge Functions
```

- **Ei ole**: oma serverit, Dockerit, mikroteenuseid, SSR-i, Reduxit,
  monorepo pakette. Need lisatakse alles tõestatud vajaduse korral.
- Kogu taustaloogika elab andmebaasis (RLS) ja Edge Functionites.
- Majutus: Cloudflare Pages, git push → automaatne deploy + haru eelvaated.

## Põhikihid rakenduses

| Kiht | Vastutus | Ei tohi |
|---|---|---|
| `app/` | lehed, marsruudid, navigatsioon | sisaldada äriloogikat |
| `ui/` | taaskasutatavad komponendid | teada moodulitest ega andmebaasist |
| `engine/` | sammude järjestus, edenemine, salvestamine, kordamine | sisaldada füüsikat |
| `checker/` | vastuste õigsus (ühikud, tolerants) | kasutada AI-d |
| `content/` | kursusefailid: moodulite järjestus ja rühmitamine | sisaldada õppesisu ennast |
| `modules/registry.ts` | `id → () => import()` kaardistus | sisaldada loogikat |
| `modules/` | õppesisu moodulilepingu järgi | suhelda andmebaasiga otse |
| `lib/` | supabase klient, localStorage, utils | — |

**Moodulite register** on ainus koht, mis teab kõiki mooduleid. Kolm asja
sõltuvad temast ja peavad seetõttu olema kooskõlas:

1. `/m/:slug` laadib mooduli laisalt (`React.lazy` + registri `import()`).
   Slug tuletatakse id-st: id on alati `<subject>.<slug>`
   (docs/MOODULILEPING.md „Slug-konventsioon") – registrit ei pea slug'i
   pärast dubleerima ega manifeste ette laadima
2. kursusefaili test kontrollib, et iga viidatud id on registris olemas
3. `sync-modules` (etapp 2.5) ja `coverage` (etapp 4.0) käivad registrit läbi

Uue mooduli lisamine = kaust + üks rida registris + üks rida kursusefailis.

## Marsruudid

```
/                     avaleht
/kursus               8. klassi füüsika (7 plokki)
/m/:slug              moodul (otselink jagamiseks!)
/kordamine            tänased kaardid
/edenemine            minu edenemine
/opetaja              õpetaja töölaud (kaitstud)
/opetaja/klass/:id    klassi ülevaade
/liitu/:kood          õpilase liitumine klassikoodiga
```

## Salvestamise loogika

- Külaline: kõik localStorage'is (võti `looduslab:progress`)
- Klassikoodiga õpilane: anonüümne Supabase sessioon; iga sammu lõpus upsert
  `attempts`/`responses` tabelisse; localStorage jääb varunduseks
- Võrgukatkestus: vastused kohalikku järjekorda, ühenduse taastudes ära
- Kogu salvestuskood elab `engine/`-is – moodulid ainult teatavad sündmustest

### Kolm salvestusrežiimi (engine teab, moodul mitte)

| Režiim | Kirjutab | Kasutus |
|---|---|---|
| `persist` + sessioon | localStorage + Supabase | klassiga liitunud õpilane |
| `persist` ilma sessioonita | ainult localStorage | külaline |
| `preview` | **mitte kuhugi** | õpetaja „Vaata õpilasena" (2.14), demo-režiim (4.2) |

`preview` peab olema olemas juba siis, kui `engine/progress.ts` esimest korda
sünnib (etapp 1.6) – hiljem külge poogitud „ära salvesta" lipp on täpselt see
koht, kust tekivad vead nagu „õpetaja demo tekitas klassivaatesse fantoom-
õpilase". Vaikeväärtus on `persist`; `preview` tuleb marsruudilt, mitte
moodulist.

## Keskkonnad

- Kaks Supabase projekti: `looduslab-dev` ja `looduslab-prod`
- .env.local (gitignore!): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Cloudflare Pages: production = main haru, eelvaade = iga PR
