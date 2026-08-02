# Sisuhaldus: kursused, plokid ja teemade jagamine

Kõige tähtsam põhimõte: **moodul ei tea, kus ta kursuses asub.** Moodulid on
lame raamatukogu (`src/modules/`); järjestuse ja rühmitamise määrab
kursusefail (`src/content/`). Teemade ümberjagamine = ühe kursusefaili
muutmine. Moodulite koodi, andmebaasi ega õpilaste andmeid see ei puuduta –
sellepärast ei saa see midagi lõhkuda.

## Kursusefail

```ts
// src/content/fyysika-8.ts
export const course = defineCourse({
  id: "fyysika-8",            // püsiv
  title: "8. klassi füüsika",
  blocks: [
    {
      title: "Valgus ja peegeldumine",
      // kas otse moodulid ...
      modules: ["physics.peegeldumisseadus", "physics.tais-ja-poolvari"],
      // ... VÕI alateemad (kui plokk kasvab suureks):
      parts: [
        { title: "Peegeldumine", modules: ["physics.peegeldumisseadus"] },
        { title: "Värvused",     modules: ["physics.valgusfiltrid"] },
      ],
    },
    // … ülejäänud plokid
  ],
});
```

- Sügavus max 2 taset (plokk → alateema). Rohkem tasemeid = õpilane eksib ära.
- Sama moodul VÕIB olla mitmes kohas (nt kordamisplokis) – viide, mitte koopia.
- Zod-skeem + Vitest test valideerivad: iga viidatud moodul on olemas
  (src/modules/registry.ts-is), ühtegi id-d pole topelt. Katkine viide =
  punane CI, mitte katkine leht. (Etapis 0, kui registrit veel pole,
  kontrollib test ainult struktuuri – viidete kontroll lisandub sammus 1.1.)

## Mida tohib alati teha (ei lõhu MITTE MIDAGI)

- Moodulite ümberjärjestamine ploki sees või plokkide vahel
- Ploki tükeldamine alateemadeks või alateemade ümbernimetamine
- Suure ploki jagamine kaheks plokiks
- Uue kursuse loomine samadest moodulitest (nt „Kordamine kontrolltööks",
  „7. klassi valikteemad") – uus fail src/content/
- Mooduli lisamine: loo moodul + registreeri src/modules/registry.ts-is +
  lisa id kursusefaili õigesse kohta

## Mida EI TOHI kunagi teha

- Muuta olemasoleva mooduli `id`-d või `slug`-i (vastused, kordamiskaardid
  ja jagatud lingid ripuvad nende küljes)
- Kustutada moodulit, millel on vastuseid – kasuta selle asemel arhiveerimist

## Suure mooduli tükeldamine väiksemateks (retsept)

Näide: „Valguse murdumine" on liiga mahukas, tahad kolme väiksemat.

1. Loo uued väiksemad moodulid UUTE id-dega (nt `physics.murdumine-alused`,
   `physics.laatsed`, `physics.silm`)
2. Vanale moodulile manifest'i: `status: "archived"` ja
   `replacedBy: ["physics.murdumine-alused", …]`
3. Kursusefailis asenda vana id uutega
4. Vana mooduli kaust JÄÄB repossse: vanad jagatud lingid töötavad
   (kataloogist kadunud, lehel viide uutele moodulitele), vanad vastused
   jäävad õpetajale loetavaks, vanad kordamiskaardid töötavad edasi
5. `npm run sync-modules` – andmebaas saab uued moodulid ja arhiivistaatuse

Ükski samm ei muuda andmebaasi skeemi ega õpilaste andmeid.

## Uue kursuse lisamine (nt 9. klass, keemia)

1. Uus kursusefail src/content/ kausta
2. Moodulid samasse raamatukokku (`modules/physics/`, hiljem
   `modules/chemistry/`)
3. Kui kursusi on rohkem kui üks, muutub /kursus kursuste loendiks
   (marsruut /kursus/:id) – see on UI muudatus, mitte struktuuri oma

## Õppekava katvus – sisu tõe allikas

Sisu EI looda suvaliselt, vaid ainekava vastu. Tõe allikas on
`sisu/AINEKAVA-fyysika-8.md` (õpitulemused P*-T*, põhimõisted,
praktilised tööd P*-PT* ID-dega).

- Iga mooduli manifest deklareerib: `outcomes`, `concepts`,
  `practicalWork`
- `npm run coverage` raport näitab: millised õpitulemused, mõisted ja
  praktilised tööd on kaetud, mitme mooduliga, ja MIS ON PUUDU
- Uue mooduli valik algab katvusraportist: kata augud enne, kui lähed
  sügavamale sinna, kus juba on
- Kursus on „valmis" alles siis, kui raportis pole ühtegi katmata
  õpitulemust, mõistet ega praktilist tööd
- Praktilise töö katvus tähendab: simulatsioon/virtuaalne labor katab töö
  sisu JA/VÕI teacher.ts kirjeldab päris katse läbiviimise. Parim: sim
  valmistab päris katse ette
- Õpetajale kuvatakse mooduli juures seotud õpitulemused ja mõisted – see
  on usalduse alus („see pole lisamäng, see ON ainekava")

## Kontroll-loend enne iga sisumuudatust

- [ ] Kas ühegi olemasoleva mooduli id/slug ei muutu?
- [ ] Kas kursusefaili test on roheline (kõik viited olemas)?
- [ ] Kas arhiveeritud moodulite lingid avanevad endiselt?
