# Töövoog: kuidas AI-ga arendada

See fail on sulle endale (mitte AI-le) – meelespea, kuidas iga töösessioon
käib ja kuidas projekt kontrolli all hoida.

## Üks töösessioon (u 1–2 tundi)

1. **Ava plaan.** Vaata plaan/ETAPP-X failist järgmine tegemata samm.
2. **Anna AI-le kontekst.** Alusta sessiooni nii:
   > Loe CLAUDE.md. Teeme plaan/ETAPP-X sammu X.Y. [kleebi sammu tekst]
3. **Lase AI-l plaani öelda enne koodi.** „Ütle kõigepealt, mida kavatsed
   muuta ja millistes failides." Kui plaan tundub liiga suur – poolita.
4. **Kood + kohe proovimine.** `npm run dev` jookseb kõrval; proovi iga
   muudatus ise läbi (telefonivaade DevToolsis!).
5. **Testid ja build.** `npm run test && npm run build` – mõlemad rohelised.
6. **Commit.** Lühike eestikeelne sõnum: mida ja miks.
7. **Märgi samm tehtuks** plaanifailis (`- [x]`).

## Ülevaatus ja testimine (sammude 4–6 täpsustus)

Erapooletut ülevaatust ei tee üks „väga hoolikas" lugemine, vaid mitu
sõltumatut kihti väikese diff'i peal. Iga ülesande juures:

1. **Masinkontrollid enne kõike muud:**
   `npm run lint && npm run test && npm run build` – kõik rohelised enne,
   kui sina midagi loed. Punane = AI parandab kohe.
2. **Testid teadaolevate väärtustega.** SINA arvutad (või võtad õpikust)
   oodatava vastuse ja annad selle AI-le ette – nii kontrollib test AI-d,
   mitte AI iseennast. Näide:
   > „Kirjuta testid: vesi ρ=1000 kg/m³, h=2 m, g=9,8 m/s² → 19 600 Pa.
   > Sügavus 0 → 0 Pa. Negatiivne sügavus → [sinu otsus]."
3. **Diff üle – sina loed, AI vastab.** Paljas `git diff` ei näita uusi
   faile – ja uus moodul ongi peamiselt uued failid, seega näitaks ta sulle
   tühjust. Tee nähtavaks nii:

   ```bash
   git status --short   # millised failid puutusid – ka uued
   git add -N .         # uued failid nähtavaks; sisu EI lavastata
   git diff             # kogu muudatus, ka uutes failides
   ```

   `-N` tähendab „kavatsen lisada": fail muutub `git diff`-ile nähtavaks,
   aga sisu jääb lavastamata. Ülevaatus on lugemine – see ei tohi sinu eest
   otsustada, mis commit'i läheb. (`git add -A` teeks just seda ja järgmine
   `git commit` haaraks kaasa ka failid, mis ülesandesse ei kuulu – vastu
   reeglit 7.) `.gitignore` kehtib, seega `.env` jääb puutumata.

   Vaata kolme asja: kas muudeti AINULT ülesande faile, kas füüsika on
   ainult model.ts-is, kas midagi ei kustunud, mida sa ei palunud.
   Arusaamatu rida? „Selgita lihtsas eesti keeles."
4. **AI-ülevaatus puhta pilguga.** Tavaline samm: `/code-review` samas
   sessioonis. Riskantne tükk (RLS, engine, checker, salvestamine):
   UUS vestlus, millele annad ainult:
   > „Loe CLAUDE.md ja docs/MOODULILEPING.md. Vaata `git diff` üle.
   > Eelda, et diff'is on vähemalt üks viga – leia see. Kontrolli eraldi:
   > käsitlemata sisendid, RLS, preview-režiimi lekked."
   Uus vestlus ei tea, miks otsused sündisid – just see teeb ta
   erapooletuks. Kõige suuremad asjad: `/code-review ultra` (tasuline).
5. **Käsitsi proovimine** – 360 px + töölaud. Küsi AI-lt „mida peaksin
   käsitsi proovima?" ja proovi ka üks asi, mida ta EI nimetanud
   (nt sisend -5 või tühi väli).

**Leidudega käitumine:** ära lase AI-l leide pimesi parandada. Küsi iga
leiu kohta: „Kas päris viga või stiiliküsimus? Näita sisend, millega see
katki läheb." Päris vea puhul: kõigepealt test, mis vea kinni püüab
(punane), siis parandus (roheline) – nii ei tule sama viga tagasi.

**Mis mahus mida teha:**

| Muudatus | Kontroll |
| --- | --- |
| UI-tekst, stiil | lint + build + silmaga üle |
| model.ts, checker | + testid teadaolevate väärtustega (alati!) |
| Tavaline moodulisamm | + `/code-review` samas sessioonis |
| RLS, migratsioonid, engine, salvestamine | + puhas sessioon või `/code-review ultra`; SQL loed ise rida-realt |

Kõik kihid on odavad ainult siis, kui diff on väike – seepärast commit
iga sammu järel.

## Kui midagi läheb katki

- `git status` ja `git diff` – vaata, mida AI tegelikult muutis
- Halb seis? `git checkout .` (viskab viimase commit'i järgsed muudatused ära)
  – seepärast ongi commit iga sammu järel kohustuslik
- AI keerutab ringiratast? Alusta uut vestlust, anna väiksem ja täpsem ülesanne
- Sa ei saa koodist aru? Küsi: „Selgita see fail mulle rida-realt lihtsas
  eesti keeles" – see on õppimise, mitte piinlikkuse koht

## Head küsimused AI-le (kasuta tihti)

- „Kas saab lihtsamalt, ilma uue sõltuvuseta?"
- „Millised piirjuhud võivad selle katki teha?"
- „Kirjuta sellele funktsioonile testid teadaolevate väärtustega."
- „Kontrolli see muudatus CLAUDE.md reeglite vastu."
- „Mida ma peaksin käsitsi läbi proovima enne commit'i?"

## Mida AI-le MITTE delegeerida

- **Füüsika õigsus** – sina oled ekspert; testid on sinu kontrollivahend
- **Migratsioonide käivitamine** – loe SQL alati ise läbi (eriti RLS!)
- **Pedagoogilised otsused** – küsimuste sõnastus, vihjete sisu, raskusaste
- **Sammu „valmis" otsus** – valmis on siis, kui SINA oled telefonis läbi
  proovinud, mitte siis, kui AI ütleb, et valmis

## Git-harud (lihtsalt)

- Töötad üksi: commit'i otse main-i, iga samm eraldi commit
- Suurema/riskantsema tüki puhul (nt RLS, sünkroonimine): tee haru + PR
  iseendale – Cloudflare annab eelvaate-URL-i, kus saad enne main-i
  liitmist telefonis testida
- Ära hoia harusid elus üle paari päeva – pikad harud on solo-arendaja lõks

## Rütm ja motivatsioon

- Väike samm iga päev lööb suure sammu kord nädalas
- Iga etapi lõpus on midagi, mida saab päris inimesele näidata – näita!
  (kolleegile, õpilasele, abikaasale) – tagasiside enne järgmist etappi
- Kui mõni samm venib üle kahe sessiooni, on samm liiga suur: poolita ja
  liigu edasi poolikuga
- Pea logi (kasvõi märkmikus): kuupäev, mis valmis, mis üllatas. Kuu pärast
  on see kuld – näed, kui kaugele oled jõudnud
