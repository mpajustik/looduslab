# Kordamismaterjal – jaotuskava

**Taust:** 2026-08-22 vaadati läbi kõik 19 füüsikamoodulit
(`src/modules/physics/*/activities.ts` + `manifest.ts`) selle mõttes, kui
palju kordamis- ja harjutusmaterjali igaüks pakub. Kaks auku, mis kordusid
peaaegu igal pool:

1. **`variants`-mehhanism (arvuvariandid harjutusküsimuses) on kasutuses
   ainult 1 moodulis 19-st** (`peegeldumisseadus`, 2 küsimust 3-st). Kõik
   ülejäänud annavad harjutuse juures ühe fikseeritud vastuse – uuesti
   proovides näeb õpilane samu arve.
2. **`graph`-tüüpi kordamiskaart puudub 17 moodulis 19-st.** Ainuke moodul
   kõigi viie tüübiga (concept/calc/graph/explain/transfer) on
   `vedeliku-rohk` – etapi 1 pilootmoodul, mitte muster, mida ülejäänud
   järgisid.

Kolm moodulit on nõrgemad kui ülejäänud 16: `helkur`, `valgusallikad`,
`tasapeegli-kujutis` – neil puudub lisaks graafile veel üks kaarditüüp.

**Töövorm:** üks moodul = üks commit (reegel 7), kõik Sonnet-tasemel
mehaaniline töö olemasoleva mustri järgi (mudelivalik CLAUDE.md tabeli
järgi – ei puuduta model.ts/checker/engine'i). Ülevaatus koondatakse:
mitu moodulit valmis, siis üks `/ulevaatus` (Free-plaani ~3 review/päev
piirang). Riskisammu Codex-ülevaatust EI ole vaja, kuna `variants` ja
`reviewCards` skeem juba olemas – see on andmete lisamine, mitte uus
mehhanism.

**Enne sisu kirjutamist – SINU otsus, mitte AI oma:** kordamiskaardi
küsimused ja arvuvariandid on ainesisu, mille pedagoogilise täpsuse pead
sina üle vaatama (nagu praegustegi moodulite kaardid on sinu loodud/
kinnitatud). AI paneb kokku mustandi olemasoleva kaardi struktuuri ja
mooduli `model.ts` valemite järgi, aga iga uus kaart ja iga variant käib
sinu heakskiidust läbi enne commit'i – see ei ole nähtusi, mida saab
pimesi 18 mooduli peale joosta lasta.

**NB versioneerimine:** kui harjutusküsimus saab ESIMEST korda
`variants`-e (`answer` → `variants`), on see moodulilepingu järgi
**major**-versioon (vana `is_correct` ei ole enam otse võrreldav). Iga
mooduli juures, kus juba on õpilasvastuseid kogunenud, tuleb see teadlikult
otsustada – vt samm 2 all.

---

## 0. Moodulilepingu baasnõue üles tõsta — Sonnet

Praegune tekst (`docs/MOODULILEPING.md` „activities.ts – kordamiskaardid")
ütleb ainult „3–6 kaarti" ega nõua tüübikatvust ega variante. Kui seda ei
muudeta, kordub sama auk iga UUE mooduli juures (`/jaga-plokk` +
`sisu/MALL-moodul.md` annavad praegu malli, mis lubab kõik 5 kaarti vahele
jätta).

- [x] `sisu/MALL-moodul.md` „Kordamiskaardid (3–6 tk)" saab lisamärkuse:
      soovituslikult kõik 5 tüüpi esindatud (concept/calc/graph/explain/
      transfer); kui mõni tüüp moodulile ei sobi (nt puhtal mõistemoodulil
      pole `calc`-i), põhjenda ühe lausega, ära jäta lihtsalt vahele
- [x] `docs/MOODULILEPING.md` „activities.ts – kordamiskaardid" saab sama
      märkuse + soovituse, et vähemalt pooltel harjutusküsimustel oleks
      `variants` (≥3), kui küsimusel on üldse arvuline vastus
- [x] Uue mooduli protsessi (moodulilepingu „Uue mooduli loomine") checklisti
      ei muudeta – see on juba katvusraporti-põhine ja ainekava-katvus on
      eraldi asi kordamiskatvusest

## 1. Kolm kõige nõrgemat moodulit — Sonnet

`helkur`, `valgusallikad`, `tasapeegli-kujutis` – kummalgi puudub kaks
kaarditüüpi VÕI vahele jäänud tüüp on nii `graph` kui midagi lisaks, ja
ühelgi pole ühtki varianti.

- [x] `helkur`: lisa `concept`- ja `graph`-kaart (`sisu/MOODUL-helkur.md`
      RIDA 604 tabelisse + `activities.ts` `reviewCards`); vaata, kas mõni
      4 harjutusküsimusest sobib arvuvariandiga (nurgaviga practice-1
      mõjub heaks kandidaadiks – sama valem, teine kraadiarv)
- [x] `valgusallikad`: lisa `graph`- ja `explain`-kaart; kontrolli
      variandikandidaate (näidiku ümardamispiir on juba `display.ts`-is
      testitud – ETTEVAATUST variandi valikuga selle piiri lähedal, vt
      moodulilepingu display.ts selgitust)
- [x] `tasapeegli-kujutis`: lisa `graph`- ja `transfer`-kaart; variandi
      kandidaat on peegli kaugus/kujutise kaugus arvutus
- [x] Iga mooduli juures otsusta versiooninumber (moodulileping –
      esimene kord `variants` = major); kolme mooduli `version` väli
      manifest.ts-is tõuseb vastavalt
- [x] Pärast kõiki kolme: `/ulevaatus` (koond, ei ole riskisamm)

## 2. Ülejäänud 15 tavamoodulit + peegeldumisseaduse 3. küsimus — Sonnet

Kõigil puudub ainult `graph`-kaart ja variandid on nullis. Jaotan kolme
väiksemasse tegevusjärku, et ülevaatus ei koguks korraga liiga palju
muudatust (reegel 7 vaimus):

**Järk 2a** (peeglid): `nurkpeegel`, `noguspeegel`, `kumerpeegel`,
`noguspeegli-rakendused`, `kumerpeegli-rakendused`, `peeglikiri`

**Järk 2b** (valgus/varjud): `vari-ja-poolvari`, `varjutused`,
`kuu-faasid`, `valguse-sirgjooneline-levimine`, `liitvalgus-ja-spekter`

**Järk 2c** (värvus/valik): `esemete-varvus`, `valgusfiltrid`,
`lambivalik`, `peegeldumisseadus` (ainult 3. harjutusküsimusele variandid
juurde – kaardid on juba täielikud)

Iga mooduli kohta:
- [ ] Lisa `graph`-tüüpi kordamiskaart (küsimus, mis eeldab joonise/
      graafiku lugemist või kirjeldamist – enamikul moodulitel on
      `figures.tsx` või simulatsiooni SVG, millele kaart saab viidata)
- [ ] Vaata harjutusküsimused üle: kui vähemalt üks toetub lihtsale
      valemile (nurk, kaugus, suurendus), lisa `variants` (3–4 tk) samas
      vormis nagu `peegeldumisseadus/activities.ts`
- [ ] Kui küsimusel juba on õpilasvastuseid – otsusta versioon (samm 1
      märkus kehtib siingi)
- [ ] `sisu/MOODUL-*.md` kordamiskaartide tabel uuendatakse SAMAS commit'is
      (source of truth, moodulileping „Kaardid kirjutatakse valmis KOHE")

- [ ] Pärast iga järku (2a/2b/2c) üks `/ulevaatus`

---

## Mida siin EI tehta

- **Uut kaarditüüpi ei looda.** Viis tüüpi (concept/calc/graph/explain/
  transfer) on olemasolev skeem – see jaotuskava täidab lünki, mitte ei
  laienda mehhanismi.
- **Arvutuskaardi checker (moodulilepingu punkt 3.7) ei kuulu siia.**
  See on eraldi otsustamata küsimus ETAPP-3-kordamine.md-s – kui see
  otsustatakse, mõjutab see kõiki mooduleid korraga, mitte ükshaaval.
- **`vedeliku-rohk` ei puuduta.** Ainuke moodul, kus kõik on juba olemas –
  ei ole vaja millegagi täiendada.
- **Uut npm-paketti ei lisata.** Kõik olemasoleva `variants`- ja
  `reviewCards`-skeemiga tehtav (reegel 4).
