# ETAPP 0: Vundament (u 1 nädal)

**Eesmärk:** tühi, aga päriselt internetis olev rakendus, mida git push
uuendab automaatselt.

**Etapp on valmis, kui:** leht on oma aadressil internetis, seal on avaleht ja
kursuseleht 7 teemaplokiga, ja koodimuudatus jõuab internetti ühe käsuga.

---

## 0.1 Repo ja reeglifailid

- [x] Loo GitHubis privaatne repo `looduslab`, klooni arvutisse
      (repo loodi olemasolevast kaustast: remote lisatud + push)
- [x] Kopeeri CLAUDE.md, docs/, plaan/, sisu/ repo juurde
- [x] Esimene commit (0196266, 2026-08-02)

**Valmis, kui:** repo on GitHubis ja failid sees.

## 0.2 Vite + React + TypeScript + Tailwind

> **Prompt AI-le:** Loo selle repo juurde Vite React-TS rakendus (npm create
> vite), lisa Tailwind CSS v4, ESLint ja Vitest (üks näidistest). Seadista
> shadcn/ui (Button, Card, Tabs, Dialog, Accordion, Progress, Sonner) meie
> värvidega (docs/DISAINIJUHIS.md), lucide-react ja Inter Variable
> (@fontsource, self-hosted). Struktuur CLAUDE.md järgi (src/app, src/ui,
> src/engine, src/checker, src/lib, src/modules). Ära lisa muid sõltuvusi.
> Avaleht kuvab „LoodusLab AI" ja ühe nupu (shadcn Button).

- [ ] `npm run dev` näitab avalehte
- [ ] `npm run build` õnnestub

**Valmis, kui:** mõlemad käsud töötavad ja struktuur vastab CLAUDE.md-le.

## 0.3 Deploy Cloudflare Pagesi

- [ ] Loo Cloudflare'i konto → Pages → ühenda GitHubi repo
- [ ] Build: `npm run build`, output: `dist`
- [ ] Kontrolli, et *.pages.dev aadress avaneb ka telefonis

**Valmis, kui:** muudad avalehe teksti, git push, ja muudatus on ~1 min
pärast internetis.

## 0.4 Marsruudid ja raam

> **Prompt AI-le:** Lisa React Router marsruudid docs/ARHITEKTUUR.md järgi
> (/, /kursus, /m/:slug, /kordamine, /edenemine, /opetaja). Tee ühine raam:
> ülaribal logo + max 4 valikut (Kursus, Kordamine, Minu edenemine,
> Õpetajale), mobiilis alumine riba. Iga leht esialgu pealkirjaga tühi.
> Lisa ka: sõbralik 404-leht ja globaalne error boundary („Midagi läks
> valesti" + „Proovi uuesti" nupp – MITTE valge tühi ekraan). Disain
> docs/DISAINIJUHIS.md järgi.

- [ ] Kõik marsruudid avanevad, navigatsioon töötab telefonis (360 px)
- [ ] Vale aadress näitab 404; visatud viga näitab error boundary lehte

**Valmis, kui:** klõpsid kõik lehed läbi telefonivaates ilma vigadeta.

## 0.5 Kursuseleht (staatiline)

> **Prompt AI-le:** Loo kursusefail src/content/fyysika-8.ts
> docs/SISUHALDUS.md formaadis: 7 teemaplokki (1. Valgus ja peegeldumine,
> 2. Valguse murdumine, 3. Liikumine ja jõud, 4. Jõud looduses, 5. Rõhk ja
> üleslükkejõud, 6. Töö, energia ja võimsus, 7. Võnkumine ja laine),
> moodulite loendid esialgu tühjad. Zod-skeem + Vitest test, mis valideerib
> kursusefaili STRUKTUURI: ploki pealkiri olemas, sügavus max 2 taset, ükski
> mooduli id ei kordu. Viidete olemasolu registris veel MITTE (registrit
> pole – see tuleb sammus 1.1); jäta testi kommentaar, kuhu see kontroll
> hiljem lisatakse. /kursus leht renderdab selle faili põhjal: plokid
> kaartidena, akordion, tühi plokk näitab „Tulekul". Mobiilivaade ennekõike.

- [ ] 7 plokki kuvatakse, akordion töötab, kursusefaili test on roheline
- [ ] Test kontrollib praegu struktuuri, mitte viiteid – kommentaar on sees

**Valmis, kui:** kursuseleht näeb telefonis korralik välja ja plokkide
pealkirjad on õiged (kontrolli ainekava vastu!).

## 0.6 CI: testid igal pushil

> **Prompt AI-le:** Loo .github/workflows/ci.yml: igal pushil `npm ci`,
> `npm run lint`, `npm run test`, `npm run build`. Lisa ka Dependabot
> (.github/dependabot.yml, nädalane npm uuenduste kontroll). Ei midagi muud.

- [ ] Tee sihilikult katkine test → push → GitHub näitab punast → paranda
- [ ] Dependabot on sees – turvapaigad ei jää seisma

**Miks:** Cloudflare ehitab, aga EI käivita teste. Ilma CI-ta märkad katkist
checkerit alles siis, kui õpilane vale tagasiside saab.

## 0.7 (Valikuline) Domeen

- [ ] Osta looduslab.ee (või muu), seo Cloudflare Pagesiga

---

**Etapi lõpukontroll:** näita lehte ühele kolleegile telefonis. Kui ta saab
ilma selgituseta aru, mis leht see on – etapp valmis.
