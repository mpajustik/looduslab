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
