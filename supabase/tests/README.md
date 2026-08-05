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
```

## Kuidas kasutada

Supabase → **SQL Editor** → **New query** → kleebi kogu faili sisu → **Run**.

**`01-skeem.sql`** tagastab tabeli, kus igal real on `seis` = `OK` või
`VIGA`. Vaata lihtsalt, kas kuskil on `VIGA`.

**`02-pidurdus.sql`** ei tagasta ridu. Siin on hea uudis vaikus:

- „Success. No rows returned" = kõik kontrollid läbisid;
- punane veateade = üks kontroll kukkus läbi ja teade ütleb, milline.

Skript koristab oma testiread ise ära ka siis, kui ta läbi kukub.

## Millal neid jooksutada

- pärast iga uut migratsiooni;
- kui liitumine käitub imelikult ja tahad teada, kas viga on baasis või
  Edge Functionis;
- enne uut õppeaastat, kui prod-baasis on midagi käsitsi muudetud.

## Mida need EI kata

Edge Functioni koodi ennast (Deno) – seda katavad ainult curl-testid failis
`supabase/functions/README.md`. Siinsed skriptid ütlevad „andmebaas on
korras", mitte „liitumine töötab".
