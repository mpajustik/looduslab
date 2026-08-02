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

- [x] `npm run dev` näitab avalehte (180a967 + 2026-08-02)
- [x] `npm run build` õnnestub

**Valmis, kui:** mõlemad käsud töötavad ja struktuur vastab CLAUDE.md-le.

**Otsus (2026-08-02):** shadcn/ui komponente EI seadistatud kõiki korraga.
Praegu on olemas Button ja Card (src/ui/, oma kood, null uut sõltuvust) ning
`cn()` abifunktsioon clsx + tailwind-merge asemel. Dialog, Tabs, Accordion,
Progress ja Sonner toovad kaasa Radixi paketid – need lisatakse siis, kui
esimene ekraan neid päriselt vajab (Accordion tuleb sammuga 0.5). Põhjus:
reegel 13 (väike bundle) ja reegel 4 (uus pakett ainult vajadusel).
Ligipääsetavuse loogikaga komponendid (Dialog, Accordion) VÕETAKSE shadcn'ist,
mitte ei kirjutata ise.

Disainitokenid (bg-brand, text-ink, bg-teacher-soft …) on failis
src/index.css. Komponentides kasuta ALATI semantilist nime, mitte `teal-700` –
siis muudab värvimuutus ühte rida, mitte kahtekümmet faili.

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

- [x] Kõik marsruudid avanevad, navigatsioon töötab telefonis (360 px)
- [x] Vale aadress näitab 404; visatud viga näitab error boundary lehte

**Valmis, kui:** klõpsid kõik lehed läbi telefonivaates ilma vigadeta.

**Otsused (2026-08-02):**

- Navigatsiooni loend elab ühes failis src/app/navigation.ts – ülariba
  (töölaud) ja alumine riba (telefon) loevad sama loendit, nii ei saa need
  lahku minna. Test hoiab piiri: max 4 valikut, aadressid unikaalsed.
- Veapüüdja (src/ui/ErrorBoundary.tsx) on kogu rakenduse ümber, mitte ainult
  lehe sees – ka raami viga näitab „Midagi läks valesti", mitte valget ekraani.
  Arenduses saab seda ise näha aadressil /viga-test (toodangu buildi see ei jõua).
- public/_redirects: Cloudflare Pages peab andma igale aadressile index.html,
  muidu murdub otselink /m/:slug lehe värskendamisel (vajalik sammu 0.3 jaoks).
- Lisatud paketid: react-router (v8) ja lucide-react – mõlemad CLAUDE.md
  eelnevalt kinnitatud pinus.

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

- [x] Tee sihilikult katkine test → push → GitHub näitab punast → paranda
      (b2d6580 punane → 974b5e4 roheline, 2026-08-02). CI peatus enne
      build-sammu – katkise testiga koodi edasi ei ehitata.
- [x] Dependabot on sees – turvapaigad ei jää seisma (.github/dependabot.yml)

**Hilisemaks (etapp 2, kui tekivad päris õpilased):** lülita GitHubis sisse
branch protection, et punase CI-ga ei saaks main-i pushida. Praegu mitte –
soloarendajat, kes töötab otse main-i peal, see ainult takistaks.

**Miks:** Cloudflare ehitab, aga EI käivita teste. Ilma CI-ta märkad katkist
checkerit alles siis, kui õpilane vale tagasiside saab.

## 0.7 (Valikuline) Domeen

- [ ] Osta looduslab.ee (või muu), seo Cloudflare Pagesiga

---

**Etapi lõpukontroll:** näita lehte ühele kolleegile telefonis. Kui ta saab
ilma selgituseta aru, mis leht see on – etapp valmis.
