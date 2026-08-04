# Moodulileping

Iga õppemoodul on kaust `src/modules/physics/<slug>/` viie kohustusliku
failiga. See on projekti kõige tähtsam muster – ära kaldu sellest kõrvale.

## Failid

```
peegeldumisseadus/
  manifest.ts      # metaandmed – mida moodul endast kujutab
  model.ts         # füüsika puhaste funktsioonidena (+ testid tests/ all)
  Simulation.tsx   # visuaal (SVG) – ainult kuvamine ja interaktsioon
  activities.ts    # sammud, küsimused, õiged vastused, vihjed + reviewCards
  teacher.ts       # õpetajajuhend, väärarusaamad, aruteluküsimused
  figures.tsx      # VALIKULINE: teooria- ja hook-sammu staatilised joonised
```

`figures.tsx` on ainus lubatud kuues fail ja ainult siis, kui moodulil on
staatilisi jooniseid (sammu `figure` väli). Miks eraldi failis, mitte
`Simulation.tsx`-is: teooriasamm tuleb enne simulatsiooni ja ei tohi tirida
kaasa kogu simulatsiooni koodi (reegel 13). Miks mitte `activities.ts`-is:
see fail peab jääma puhtaks ANDMEKS, mida zod valideerib ja mis läheb
hiljem andmebaasi – komponent seal ei tohi olla. Kehtivad samad reeglid mis
`Simulation.tsx`-il: ainult kuvamine, füüsika tuleb `model.ts`-ist.

Joonised registreeritakse `src/modules/registry.ts`-is (`moduleFigures`)
laiskade komponentidena, sildi kaupa. Silt peab klappima `activities.ts`
`figure` väljaga – seda valvab test, sest puuduv joonis ei tee ekraani
katki, ta lihtsalt EI ILMU.

Moodul registreeritakse `src/modules/registry.ts`-is (`id → () => import()`).
See on AINUS koht, mis teab kõiki mooduleid – nii jääb dünaamiline laadimine
(reegel 13) ja kursusefaili viidete valideerimine ühe fakti otsa.

## manifest.ts

```ts
import { defineModule } from "../../engine/contract";

export const manifest = defineModule({
  id: "physics.peegeldumisseadus",   // püsiv, EI MUUTU KUNAGI
  slug: "peegeldumisseadus",         // URL: /m/peegeldumisseadus – samuti püsiv
  title: "Valguse peegeldumine",
  subject: "physics",
  goal: "Oskan ennustada, kuhu valguskiir peegeldub", // õpilase keeles
  outcomes: ["P1-T2"],               // ainekava õpitulemuste ID-d
  concepts: ["valguskiir", "tasapeegel", "mattpind"], // mõisted, mida ÕPETAB
  practicalWork: ["P1-PT3"],         // kaetud praktilised tööd (või [])
  minutes: { demo: 10, lesson: 45, homework: 25 },
  version: "1.0.0",
  status: "active",                  // "active" | "archived" (+ replacedBy)
});
```

Väljad `outcomes`, `concepts` ja `practicalWork` viitavad failile
sisu/AINEKAVA-fyysika-8.md – nende põhjal arvutab `npm run coverage`
õppekava katvuse. Moodul ilma ainekavaseoseta ei läbi kvaliteediväravat.

NB! Moodul EI tea, millises kursuses või plokis ta asub – järjestuse määrab
kursusefail (vt docs/SISUHALDUS.md). Nii saab teemasid vabalt ümber jagada
ilma mooduleid muutmata.

**Slug-konventsioon:** id on alati kujul `<subject>.<slug>`
(nt `physics.peegeldumisseadus` → slug `peegeldumisseadus`). Nii saab
`/m/:slug` marsruut mooduli registrist tuletada ilma ühtegi manifesti
laadimata. Kursusefaili test kontrollib, et see kokkulepe kehtib.

**Slug on globaalselt unikaalne – üle KÕIGI ainete, mitte ainult aine sees.**
Marsruudis `/m/:slug` ainet ei ole, seega `physics.rohk` ja `chemistry.rohk`
annaksid mõlemad `/m/rohk` ja register peaks kahe vahel loosima. Kaks kohta,
kus seda hoitakse: registri test (kaks moodulit ei tohi jagada slugi) ja
`unique (slug)` kitsendus `modules` tabelis (docs/ANDMEMUDEL.md). Slug on
reegli 11 järgi igavene – seda kokkulepet hiljem tagantjärele kehtestada
ei saa, seepärast kehtib ta juba enne teise aine olemasolu.

**Kolmas valvur on käitusajal – ja teda on päriselt vaja.** Test jookseb
CI-s, `unique (slug)` alles sync-modules ajal; kumbki ei ole brauseris
kohal. `registry.ts` võtmed on id-d, seega kaks sama slugiga moodulit EI
tekita duplikaatvõtit – objekt on täiesti korrektne ja `/m/rohk` lahendub
lihtsalt selleks, kumb otsingus ees on. Vaikne vale moodul, mitte
veateade. Seepärast: slug → id indeks ehitatakse registrist üks kord ja see
VISKAB VEA, kui kaks moodulit jagavad slugi. Arenduses krahh on parem kui
toodangus vale moodul.

## Versioonimine (millal `version` muutub)

Iga vastus salvestatakse koos `module_version`-iga. Et see number midagi
tähendaks, on reegel:

| Muudatus | Versioon | Miks |
|---|---|---|
| trükiviga, sõnastus, vihje täpsustus, visuaal | **patch** (1.0.0 → 1.0.1) | vana vastus jääb võrreldavaks – sama küsimus, sama õige vastus |
| uus samm, uus küsimus või uus arvuvariant olemasolevate kõrvale | **minor** (1.0.0 → 1.1.0) | vanadel vastustel lihtsalt puudub uus küsimus või variant; vana variant jääb alles |
| õige vastus, tolerants või ühik muutub; küsimus eemaldatakse; küsimus saab ESIMEST korda variandid; variant eemaldatakse | **major** (1.0.0 → 2.0.0) | vana `is_correct` EI ole enam uuega võrreldav |

Õpetaja koondvaade (etapp 2.13) tohib liita kokku ainult sama major-versiooni
vastuseid. Patch- ja minor-muudatus ei lõhu koondit.

**`question_id` on igavene** (CLAUDE.md reegel 11). Ka siis, kui küsimuse tekst
muutub täielikult. Kui küsimus asendatakse sisuliselt teisega, saab UUS küsimus
UUE id ja vana eemaldatakse (= major). Nii ei liideta kunagi kahe eri küsimuse
vastuseid ühte tulpa.

Vorm: `<sammu-tüüp>-<järjekorranumber>`, nt `practice-3`, `exit-1`. Number ei
muutu ka siis, kui sammu sees küsimuste järjekord muutub.

## model.ts – reeglid

- Ainult puhtad funktsioonid: sama sisend → alati sama väljund
- Ei mingit Reacti, DOM-i ega juhuslikkust (juhuslikkus fikseeritava seemnega)
- SI-ühikud sees, teisendused eraldi funktsioonides
- Iga funktsiooni kohta test teadaolevate väärtustega + piirjuhud

```ts
// Näide
export function reflectionAngle(incidenceAngleDeg: number): number {
  return incidenceAngleDeg; // peegeldumisnurk = langemisnurk
}
```

## Simulation.tsx – reeglid

- Saab kõik propsidena: `mode` ("learn" | "explore" | "demo"), `onEvent`
- Loogika tuleb model.ts-ist; komponent ainult renderdab SVG ja liugurid
- Alguses nähtaval max 2 muudetavat suurust; „Alusta uuesti" nupp alati olemas
- Töötab puutetundlikul ekraanil (liugurid, mitte ainult lohistamine)

## activities.ts – sammude tüübid

Moodul koosneb sammudest (üks ekraan = üks samm). Moodul valib ise, milliseid
samme, mitu ja mis järjekorras – täistsükkel EI ole kohustuslik. Lubatud on
ka nt ainult `theory` + `precheck` (teooriakonspekt) või kaks `explore`
sammu järjest.

Baastüübid:

| Tüüp | Kirjeldus | Kontroll |
|---|---|---|
| `theory` | lühike teooria: tekst, joonis, valem (max 1 ekraan) | puudub |
| `hook` | häälestav probleem/foto/küsimus | puudub |
| `precheck` | 1–3 eelteadmiste küsimust | valikvastus |
| `predict` | ennustus + põhjendus; LUKUSTUB enne simulatsiooni | salvestatakse, ei hinnata |
| `explore` | simulatsioon ülesandega | sündmused |
| `collect` | mõõtetabel või graafik | täidetud read |
| `explain` | väide–tõend–põhjendus vabatekst | salvestatakse; õpetajale nähtav |
| `practice` | ülesanded: näidis → osaline → iseseisev | checker |
| `exit` | väljumispilet 2–3 küsimust | checker + vabatekst |

## Laiendatavus: uue sammutüübi lisamine

StepShell EI tohi olla suur switch-lause – ta renderdab sammu registri
kaudu: `stepRegistry[type] → komponent`. Uue tüübi (nt `video`,
`experiment` katsejuhend protokollivormiga, `game`) lisamine tähendab:

1. lisa tüüp contract.ts-i (Zod-skeem sammu andmetele)
2. loo komponent ja registreeri stepRegistry-s
3. kui sammul on hinnatav vastus, registreeri kontroll checkeri registris

Kõik olemasolevad moodulid jäävad puutumata – nemad uut tüüpi ei kasuta.

Raudreeglid laiendamisel:

- Sammutüüpe ainult LISATAKSE. Olemasolevat tüüpi ei kustutata ega
  nimetata ümber – vanad vastused (responses.payload) viitavad neile.
- Kui olemasolev tüüp vajab uut käitumist, lisa valikuline väli (vana sisu
  töötab edasi) või loo uus tüüp.
- Sama kehtib küsimusetüüpidele checkeris: registrisse juurde, mitte
  olemasolevat ümber.

Iga küsimuse juures: `id` (igavene, vt „Versioonimine"), õige vastus, lubatud
viga (tolerants), ühik, kuni 2 vihjet ja väärarusaama silt (misconception id),
kui vale vastus sellele viitab.

## Juhuslikkus: valikvastuste järjekord ja arvuvariandid

Kordamisel jääb meelde JÄRJEKORD ja ARV, mitte sisu („õige oli teine
variant", „vastus oli 55"). Seepärast valib engine enne ekraanile andmist
valikvastuste järjekorra ja arvküsimuse variandi (`src/engine/resolve.ts`).
Moodul kirjutab võimalused, engine loosib ühe.

**Ühine seeme:** moodulikäigu algusaeg (`attempts.started_at`). Seega on kogu
käigu vältel kõik püsiv ja uus loos tuleb ainult „Alusta uuesti" peale.

### Valikvastuste järjekord

Moodul kirjutab variandid ühes järjekorras ja saab need ekraanile teises.

- **Vaikimisi sees.** Autor ei pea midagi meeles pidama.
- **Välja lülitab `shuffle: false`** seal, kus järjekord ise kannab tähendust:
  arvud kasvavas reas (15°, 30°, 60°) või „kõik eelnevad" viimasel real.
- **Variandi `id` ei muutu kunagi** – vastus salvestab id, mitte positsiooni,
  seega checker ja õpetaja koondvaade segamist ei näegi (CLAUDE.md reegel 11).

Segamine on **patch-muudatus**: küsimus, õige vastus ega id ei muutu.

### Arvuvariandid

Arvküsimus võib olla MALL: tekstis on kohahoidja `{nurk}` ja iga variant annab
sellele väärtuse koos oma õige vastusega.

```ts
{
  kind: "numeric",
  id: "practice-2",                       // igavene, üks kõigi variantide peale
  prompt: "Kiir moodustab pinnaga {pinnanurk}° nurga. Kui suur on peegeldumisnurk?",
  unit: "°",
  tolerance: { mode: "absolute", value: 0.5 },
  variants: [                             // vähemalt 2
    { id: "p25", values: { pinnanurk: 25 }, answer: 65,
      traps: [{ answer: 25, misconception: "nurk-pinna-suhtes", feedback: "…" }] },
    { id: "p40", values: { pinnanurk: 40 }, answer: 50, traps: [/* … */] },
  ],
}
```

- **Vastus on kirjas, mitte arvutatud.** Valemit sisufaili ei panda – füüsika
  elab `model.ts`-is (CLAUDE.md reegel 1). Iga variandi arvud loeb üle test,
  kes küsib vastuse mudelilt (`tests/<moodul>.model.test.ts`).
- **`answer` ja `variants` on teineteist välistavad.** Küsimusel on kas oma
  vastus või variandid – kaks tõe allikat läheksid ühel päeval lahku.
- **Lõksud käivad variandi juurde**, sest lõksuvastus sõltub antud arvust.
- **Kohahoidjad peavad klappima.** Skeem nõuab, et iga variant katab täpselt
  need nimed, mis tekstis (ka vihjetes) on – ja et kohahoidjaga küsimusel on
  variandid olemas. Muidu jõuaks õpilase ekraanile tekst „{pinnanurk}°".
- **Variandi `id` on igavene** (CLAUDE.md reegel 11): ta salvestub vastuse
  juurde (`payload.variantId`), sest „55" on õige ühe variandi ja vale teise
  juures. Õpetaja koondvaade loeb variandi sealt.
- **Vastatud küsimus ei loosi uuesti.** Loos käib loendi indeksi järgi, seega
  uus variant nihutaks sama seemne mujale. Engine annab salvestatud variandile
  eesõiguse: kui õpilane on juba vastanud, jääb ekraanile TEMA ülesanne, ka
  siis kui moodul vahepeal uueneb. Eemaldatud variandi puhul ei ole midagi
  taastada – siis loetakse vana vastus selle küsimuse jaoks olematuks.
- **Lõks ei tohi mahtuda õige vastuse tolerantsi sisse.** Checker vaatab enne
  õigsust ja alles siis lõkse – nii lähedane lõks ei jõuaks kunagi tööle.
- **Versioon kolme sammuna** (vt „Versioonimine"):

| Mida sa teed | Versioon |
|---|---|
| küsimus saab ESIMEST korda variandid (`answer` → `variants`) | **major** – õige vastus sõltub nüüd loosist |
| uus variant olemasolevate kõrvale | **minor** – vanad vastused jäävad kehtima, nende variant on salvestatud |
| olemasoleva variandi arv või vastus muutub; variant eemaldatakse | **major** – vana `is_correct` ei ole enam võrreldav |

## activities.ts – kordamiskaardid

Sama fail ekspordib ka `reviewCards` (3–6 kaarti, pilootmoodulitel kuni 10):

```ts
export const reviewCards = [
  { id: "rc-1", type: "concept",     // concept | calc | graph | explain | transfer
    question: "Millise joone suhtes mõõdetakse langemis- ja peegeldumisnurka?",
    answer: "Pinna ristsirge suhtes" },
  // …
];
```

Kaardid elavad `activities.ts`-is (mitte manifest'is ega omaette failis),
sest nad on sama sorti sisu mis küsimused: tekst + õige vastus + kontroll.
Kaardi jaoks eraldi faili ei tehta – vt failide loend ülal.

**Kaardid kirjutatakse valmis KOHE mooduli loomisel**, ka enne etappi 3, kus
kordamismootor valmib. Spetsifikatsioonifailis (sisu/MOODUL-*.md) on nad
niikuinii olemas – nende hilisem juurde kirjutamine tähendaks kõigi
moodulite uuesti lahtivõtmist. Kuni etapini 3 on `reviewCards` lihtsalt
andmed, mida keegi ei loe.

## Sammu leping (engine ↔ moodul)

- Engine renderdab sammud järjekorras, salvestab iga sammu oleku
  (alustatud/esitatud/parandatud) ja otsustab, kuhu (localStorage/Supabase)
- Moodul EI tea, kes on kasutaja ega kust ta tuli
- Õpetaja jagamisel saab samme välja lülitada (nt ainult demo: hook+predict+explore)
- Engine lisab automaatselt (mooduli autor ei pea meeles pidama):
  ennustuse sammule „see ei ole hinne" lause; õpetajale nähtavatele
  sammudele (explain, exit) märke „Sinu vastust näeb õpetaja";
  „Salvestatud ✓" kinnituse; mooduli lõppu kokkuvõtteekraani
  (õpieesmärk + kordamiskaardid lisatud + edasiviiv nupp)

## Mooduli suurus

Moodul on VÄIKE: üks selge õpieesmärk, 5–20 minutit, tavaliselt 3–6 sammu.
Kui moodulil on üle ühe täieliku õpitulemuse, üle ~7 sammu või pealkirjas
kahte asja ühendav „ja" – jaga mitmeks. Suur teema = mitu väikest moodulit
kursusefaili sama alateema all. Täispikk juhitud tund (pilootmoodulid) on
lubatud tüüp, mitte vaikevalik.

## Uue mooduli loomine (korratav protsess)

1. Vaata katvusraportit (`npm run coverage`) – mis õpitulemus/mõiste/
   praktiline töö on katmata? Alusta sellest, mitte lemmikteemast.
   **NB:** raport valmib alles etapis 4.0. Etapi 1 kaks pilootmoodulit on
   plaaniga ette antud – nende juures seda sammu ei ole ja see on ootuspärane
2. Vaata jaotuskava (`sisu/JAOTUS-fyysika-8.md`) – milline planeeritud
   moodul selle augu katab? Kui plokk on veel jagamata, jaga see esmalt
   (skill `/jaga-plokk`) ja kinnita jaotus. Ainekava seoseid EI tuleta iga
   mooduli juures uuesti nullist – muidu õpetavad kaks moodulit sama
   mõistet ja kolmas jääb tegemata
3. Kopeeri sisu/MALL-moodul.md → `sisu/MOODUL-<slug>.md` ja täida; ainekava
   seosed (õpitulemused, mõisted, praktiline töö) võta jaotusrealt
4. Ütle AI-le: „Loo moodul sisu/MOODUL-<slug>.md põhjal moodulilepingu järgi"
5. Kontrolli füüsikat: loe model.ts läbi, käivita testid, proovi piirväärtusi
6. Proovi moodul telefonis läbi õpilase pilguga
7. Commit; märgi jaotusreale staatus `ehitatud` ja kontrolli, et
   katvusraport läks paremaks

Katvuse tõde tuleb ALATI manifestidest, mitte jaotuskavast: jaotus on plaan,
manifest on tehtud töö. Raport ei tohi näidata rohelist selle eest, mis on
alles planeeritud.
