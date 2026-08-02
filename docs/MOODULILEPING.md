# Moodulileping

Iga õppemoodul on kaust `src/modules/physics/<slug>/` täpselt viie failiga.
See on projekti kõige tähtsam muster – ära kaldu sellest kõrvale.

## Failid

```
peegeldumisseadus/
  manifest.ts      # metaandmed – mida moodul endast kujutab
  model.ts         # füüsika puhaste funktsioonidena (+ testid tests/ all)
  Simulation.tsx   # visuaal (SVG) – ainult kuvamine ja interaktsioon
  activities.ts    # sammud, küsimused, õiged vastused, vihjed + reviewCards
  teacher.ts       # õpetajajuhend, väärarusaamad, aruteluküsimused
```

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

## Versioonimine (millal `version` muutub)

Iga vastus salvestatakse koos `module_version`-iga. Et see number midagi
tähendaks, on reegel:

| Muudatus | Versioon | Miks |
|---|---|---|
| trükiviga, sõnastus, vihje täpsustus, visuaal | **patch** (1.0.0 → 1.0.1) | vana vastus jääb võrreldavaks – sama küsimus, sama õige vastus |
| uus samm või uus küsimus juurde | **minor** (1.0.0 → 1.1.0) | vanadel vastustel lihtsalt puudub uus küsimus |
| õige vastus, tolerants või ühik muutub; küsimus eemaldatakse | **major** (1.0.0 → 2.0.0) | vana `is_correct` EI ole enam uuega võrreldav |

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

## activities.ts – kordamiskaardid

Sama fail ekspordib ka `reviewCards` (3–6 kaarti, pilootmoodulitel kuni 10):

```ts
export const reviewCards = [
  { id: "rc-1", type: "concept",     // concept | calc | graph | explain | transfer
    question: "Millise joone suhtes mõõdetakse langemis- ja peegeldumisnurka?",
    answer: "Pinnanormaali suhtes" },
  // …
];
```

Kaardid elavad `activities.ts`-is (mitte manifest'is ega kuuendas failis),
sest nad on sama sorti sisu mis küsimused: tekst + õige vastus + kontroll.
Nii jääb viie faili reegel kehtima.

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
2. Kopeeri sisu/MALL-moodul.md → `sisu/MOODUL-<slug>.md` ja täida (sh
   ainekava seosed ID-dega failist sisu/AINEKAVA-fyysika-8.md)
3. Ütle AI-le: „Loo moodul sisu/MOODUL-<slug>.md põhjal moodulilepingu järgi"
4. Kontrolli füüsikat: loe model.ts läbi, käivita testid, proovi piirväärtusi
5. Proovi moodul telefonis läbi õpilase pilguga
6. Commit; kontrolli, et katvusraport läks paremaks
