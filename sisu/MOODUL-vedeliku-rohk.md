# Mooduli spetsifikatsioon: Vedeliku rõhk

Ainekava seos (AINEKAVA-fyysika-8.md): plokk P5; õpitulemused: P5-T4 (osa:
vedelikusamba rõhk), P5-T5 (osa: p = ρ·g·h); mõisted, mida õpetab: rõhk,
rõhumisjõud; praktiline töö: – (katab õpilase digitegevuse „vedeliku rõhu
uurimine simulatsiooniga"; üleslükkejõud P5-PT3 on ERALDI moodul). NB: see
on täispikk „juhitud tund" tüüpi pilootmoodul – tavamoodulid on väiksemad. Vanus: 8. klass.
Kestused: demo 10 min, tund 45 min, iseseisev 25 min.

slug: `vedeliku-rohk` · id: `physics.vedeliku-rohk`

## Füüsika (model.ts jaoks)

- Hüdrostaatiline rõhk: `p = ρ · g · h` (ρ – vedeliku tihedus kg/m³,
  g = 9,8 m/s² (kasutame 9,8; ülesannetes lubatud ka 10 – tolerants katab),
  h – sügavus vedeliku PINNAST, m)
- Rõhk EI sõltu anuma kujust ega vedeliku kogusest (hüdrostaatiline paradoks)
- Rõhk mõjub igas suunas võrdselt (mitte ainult alla)
- Kogurõhk sügavusel = õhurõhk + vedelikusamba rõhk (maini, ära süvene)
- `pressure(rho, h, g=9.8)` → Pa; teisendused: kPa, cm↔m
- Testid: vesi (1000, 1 m) → 9800 Pa; vesi 0 m → 0 Pa; elavhõbe vs vesi
  samal sügavusel; lineaarsus: 2× sügavus → 2× rõhk

## Sammud

### 1. hook – häälestus

Foto: tammi rist­lõige – müür on all palju paksem kui üleval. „Miks ehitatakse
tamm alt paksem?" + teine näide: kõrvad „lukus" basseini põhjas.
Eesmärk: „Täna õpid arvutama, kui suur on rõhk vee all."

### 2. precheck – eelteadmised

1. Rõhk = … (a) jõud · pindala (b) **jõud / pindala** (c) mass / ruumala
2. Vee tihedus on umbes … (a) 100 kg/m³ (b) **1000 kg/m³** (c) 10 000 kg/m³
3. Ühik paskal (Pa) tähendab … (a) **1 N/m²** (b) 1 kg/m³ (c) 1 N·m

Vale vastuse korral 2-lauseline meeldetuletus (mitte hinne!).

### 3. predict – ennustus (lukustub!)

Joonis: kolm eri kujuga anumat (kitsas, lai, lehtrikujuline), kõigis vesi
SAMA kõrguseni, põhjas mõõtepunkt. „Millises anumas on rõhk põhjas kõige
suurem?" (a) kitsas (b) lai (c) lehtrikujuline (d) **kõigis võrdne** +
„Miks sa nii arvad?" (vabatekst)

### 4. explore – simulatsioon

SVG: läbipaistev anum vedelikuga, liigutatav rõhuandur (sügavus h),
kuvatakse suurelt: h (m) ja p (kPa). Liugurid: sügavus 0–2 m; vedeliku
valik (vesi 1000, soolane vesi 1030, õli 900, elavhõbe 13 600 kg/m³).

Ülesanded:

1. „Vii andur 0,5 m sügavusele vees. Kirjuta rõhk üles. Nüüd 1,0 m. Mis
   muutus?" (kahekordistus)
2. „Vaheta vesi õli vastu. Kas rõhk samal sügavusel kasvas või kahanes?"
3. „Leia sügavus, kus õlis on sama rõhk kui vees 0,9 m juures." (1,0 m)

Lisavaade (avaneb pärast ül 1): anuma kuju vahetus (kitsas/lai/lehter) –
rõhk samal sügavusel EI muutu. Tekst: „Rõhk sõltub ainult sügavusest ja
vedelikust, mitte anuma kujust."

### 5. collect – graafik

Õpilane kogub simulatsioonist 4 punkti (h; p) vees ja märgib need
graafikule (või täidab tabeli, millest joonistub graafik). Sim on ideaalne –
punktid langevad TÄPSELT sirgele; kontrolli tolerants (±2%) katab ainult
lugemis- ja ümardamisebatäpsuse. Kontroll: 4 eri sügavust, punktid sirgel,
sirge läbib nullpunkti. Küsimus: „Mida ütleb sirge kuju seose
p ja h kohta?" (võrdeline seos)

### 6. explain – selgita

„Selgita oma sõnadega, MIKS rõhk sügavusega kasvab. Kasuta mõtet: mida
sügavamal, seda rohkem vett on sinu kohal." + võrdlus ennustusega sammust 3
(anuma kuju!). Vabatekst min 20 sõna, õpetajale nähtav.

### 7. practice – harjutamine

1. **Näidis (lahendatud):** Kui sügav on bassein, kui põhjas on vee rõhk
   29,4 kPa? Lahenduskäik: h = p/(ρ·g) = 29400/(1000·9,8) = 3,0 m.
2. **Osaline:** Arvuta rõhk 2,0 m sügavusel vees. p = ρ·g·h = 1000 · 9,8 ·
   ___ = ___ kPa (vastus 19,6 kPa; tolerants 5% – katab ka g=10 kasutajad)
3. **Iseseisev:** Sukelduja on meres (ρ = 1030 kg/m³) 12 m sügavusel. Kui
   suur on vee rõhk temale? (121 kPa, tolerants 5%; vihje 1: „p = ρ·g·h";
   vihje 2: „vasta kilopaskalites: 1 kPa = 1000 Pa")
4. **Iseseisev (ühikulõks):** Akvaariumi sügavus on 40 cm. Rõhk põhjas?
   (3,9 kPa, tolerants 5%; vale vastus ~392 kPa → silt `cm-m-teisendus`,
   vihje: „teisenda cm → m")
5. **Ülekanne:** Miks purskab vesi katkisest tünnist kõige kaugemale kõige
   alumisest august? (valikvastus)

### 8. exit – väljumispilet

1. Rõhk vedelikus sõltub: (valik mitu õiget) **sügavusest**, **vedeliku
   tihedusest**, anuma kujust, vee kogusest
2. Arvuta: rõhk 1,5 m sügavusel vees ≈ ___ kPa (14,7; tolerants 5%)
3. „Mida sa täna õppisid ja mis jäi segaseks?" (vabatekst)

## Väärarusaamad

| Silt | Väärarusaam | Kuidas parandada |
|---|---|---|
| `kuju-mojutab-rohku` | laiemas/suuremas anumas on suurem rõhk | hüdrostaatiline paradoks simulatsioonis + selgitus „loeb ainult sammas sinu kohal" |
| `rohk-ainult-alla` | rõhk mõjub ainult allapoole | küljeaugust purskuv vesi; kõrvavalu igas asendis |
| `cm-m-teisendus` | sügavus jäetakse sentimeetritesse | ühikukontroll harjutuses 4 |
| `g-unustatud` | p = ρ·h (g unustatud) | näidislahenduses g esile tõstetud |

## Õpetajale (teacher.ts)

- Päris katse: 1,5 l pudel, 3 auku eri kõrgusel, teip, vesi + vann/õu.
  Simulatsioon ENNE (õpilane ennustab, milline juga ulatub kaugeimale)
- Aruteluküsimused: Miks sukeldujal on piir? Miks tammi alumine osa paksem?
  Kuidas töötab veetorn?
- Seos ainekava praktilise tööga: „üleslükkejõu uurimine" on JÄRGMINE
  moodul – ära ühenda kahte teemat ühte tundi
- 45 min plaan: hook 5 · precheck 4 · predict 4 · explore 10 · collect 6 ·
  explain 6 · practice 8 · exit 2

## Kordamiskaardid (reviewCards)

1. mõiste: Millest sõltub rõhk vedelikus? (sügavus, tihedus, g – MITTE anuma
   kuju)
2. arvutus: Rõhk 3,0 m sügavusel vees? (29,4 kPa, tolerants 5%)
3. graafik: p(h) graafik on sirge läbi nullpunkti – mida see tähendab?
   (võrdeline seos)
4. selgitus: Miks on tamm alt paksem? (rõhk kasvab sügavusega)
5. ühikud: 60 cm = ___ m; 9800 Pa = ___ kPa (0,6; 9,8)
6. ülekanne: Kummas on 1 m sügavusel suurem rõhk – järvevees või merevees?
   Miks? (merevesi, suurem tihedus)
