# Baasi kontrollskriptid

Need EI OLE Vitesti testid (`npm run test`) – need on SQL-failid, mille
kopeerid **tervikuna** Supabase'i SQL Editorisse ja käivitad. Nad
kontrollivad, kas andmebaas on päriselt selline, nagu migratsioonid
lubasid.

Miks eraldi kaustas ja mitte `migrations/` all: kaustas `migrations/` olev
fail MUUDAB baasi ja jookseb täpselt üks kord. Siinsed failid ei muuda
midagi püsivalt ja neid tohib jooksutada nii mitu korda kui tahad.

```text
01-skeem.sql       kas tabelid, õigused ja indeksid on paigas (ainult loeb)
02-pidurdus.sql    kas liitumise pidurdus KÄITUB õigesti (kirjutab ja koristab)
03-kustutamine.sql kas klassi kustutamine viib kõik seotud read kaasa
                   (kirjutab, aga võtab kõik lõpuks tagasi – rollback)
04-rls-brauseris.js  kas RLS peab PÄRIS brauserist, päris sessiooniga
                   (ainult loeb; EI OLE SQL – käib brauseri konsooli,
                    F12 → Console, mitte SQL Editorisse)
05-kordamine.sql   kas vanem kordamishinnang jätab uuema rahule
                   (kirjutab, aga võtab kõik lõpuks tagasi – rollback)
```

## Kuidas kasutada

Supabase → **SQL Editor** → **New query** → kleebi kogu faili sisu → **Run**.

**`01-skeem.sql`** tagastab tabeli, kus igal real on `seis` = `OK` või
`VIGA`. Vaata lihtsalt, kas kuskil on `VIGA`.

**`02-pidurdus.sql`** ei tagasta ridu. Siin on hea uudis vaikus:

- „Success. No rows returned" = kõik kontrollid läbisid;
- punane veateade = üks kontroll kukkus läbi ja teade ütleb, milline.

Skript koristab oma testiread ise ära ka siis, kui ta läbi kukub.

**`03-kustutamine.sql`** töötab samamoodi: vaikus on hea uudis. Kogu skript
on ühe transaktsiooni sees ja lõpeb `rollback`-iga, seega testiklassi ega
-õpilast baasi ei jää ka õnnestumise korral.

**`04-rls-brauseris.js`** ei ole SQL. Ta käib brauseri konsooli (F12 →
Console) sellel lehel, kus rakendus jookseb, ja küsib hoopis teist küsimust
kui SQL-failid: mitte „kas poliitika on olemas", vaid „kas keegi saab minu
andmed kätte, kui ta väga tahab". Faili alguses on kaks rida, mis tuleb
`.env.local` failist täita (URL ja anon-võti – anon-võti on avalik, ta on
niikuinii igas brauseris). Kasutusjuhend on faili enda alguses.

**`05-kordamine.sql`** töötab nagu `03`: kogu skript on ühe transaktsiooni
sees ja lõpeb `rollback`-iga, seega prod-baasi ei jää sellest midagi. Erinevalt
teistest SQL-failidest paneb ta end tehingu sees ÕPILASE nahka
(`request.jwt.claims` + roll `authenticated`) – muidu jookseks ta
`postgres`-ina, kellele RLS ei kehti ja kelle `auth.uid()` on null, ega
ütleks brauseris toimuva kohta midagi. Kui baasis ei ole ühtegi õpilast ega
moodulit, ütleb ta „Vahele jäetud".

Miks konsool ja mitte SQL: SQL Editor jookseb service-võtmega, kes RLS-ist
üle sõidab. Poliitikat saab ainult sealt kontrollida, kust õpilane päriselt
tuleb – brauserist, oma sessiooniga.

## Turvatest (plaan 2.16) – kust iga punkt kontrolli saab

| Plaani punkt | Kust |
| --- | --- |
| Kaks anonüümset õpilast ei näe teineteise ridu | `04-rls-brauseris.js`, `llKontrolli` |
| Teine õpetaja ei näe esimese klasse | `04-rls-brauseris.js`, `llKontrolli` |
| Ilma sessioonita päring ei anna ridu (v.a `modules`) | `04-rls-brauseris.js`, jookseb kohe kleepimisel |
| Kood ja IP on baasis räsina | `01-skeem.sql` kontrollid „code_hash on räsi" ja „ip_hash on räsi" |
| Aegunud koodiga ei saa liituda; pidurdus rakendub | `supabase/functions/README.md` curl-testid 4 ja 5; `02-pidurdus.sql` |
| Service-võti ei ole repos ega brauseris | `npm run turvakontroll` |

## Millal neid jooksutada

- pärast iga uut migratsiooni;
- kui liitumine käitub imelikult ja tahad teada, kas viga on baasis või
  Edge Functionis;
- enne uut õppeaastat, kui prod-baasis on midagi käsitsi muudetud.

## Mida need EI kata

Edge Functioni koodi ennast (Deno) – seda katavad ainult curl-testid failis
`supabase/functions/README.md`. Siinsed skriptid ütlevad „andmebaas on
korras", mitte „liitumine töötab".
