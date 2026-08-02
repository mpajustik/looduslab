# Allikate register

Siin failis on kirjas kõik välised allikad, mida moodulite teooria ja
harjutusülesannete loomisel kasutatakse, koos igaühe litsentsistaatuse ja
kasutusreegliga. Väljavõtted allikatest elavad kaustas `sisu/allikad/`
(mall: `allikad/MALL-valjavote.md`).

## Raudne reegel

**Litsentsita või teadmata litsentsiga allikast ei kopeerita sõnasõnalist
teksti ega ülesande täpset sõnastust rakendusse MITTE KUNAGI.** Sellist
allikat kasutatakse ainult kahel viisil:

1. **Faktikontroll** – teooria kirjutatakse oma sõnadega, allikas kinnitab
   füüsikaliste väidete õigsust ja 8. klassile sobivat sõnavara taset.
2. **Analoogid** – ülesande näidise põhjal luuakse uus samatüübiline
   ülesanne: teised arvud, teine kontekst, oma sõnastus. Iga arvvastus
   arvutatakse model.ts kaudu läbi ja kontrollitakse checker'i testiga.

Füüsikafaktid, valemid ja seadused ei ole autoriõigusega kaitstud –
kaitstud on teksti ja ülesannete konkreetne sõnastus.

Kui allika litsents lubab kohandamist (nt CC BY-SA), tohib sisu kohandada
litsentsi tingimuste järgi (viitamine kohustuslik; SA = tuletis sama
litsentsi all – enne sellist kasutust arutada kasutajaga).

Vastuolu korral allika ja ainekava vahel jääb peale
`AINEKAVA-fyysika-8.md` (sisu tõe allikas).

## PDF-allikad

PDF-failid käivad samuti kausta `sisu/allikad/` ja saavad ENNE lisamist
rea registritabelisse. Konventsioon:

- **Failinimi:** sama loogika mis väljavõtetel, nt `OPIK-F8-taielik.pdf`,
  `TV-keemia-8.pdf`.
- **Git:** `sisu/allikad/*.pdf` on gitignore'is – teadmata litsentsiga
  PDF-e EI commit'ita kunagi (repo avalikuks minek = levitamine). Failid
  elavad ainult selles arvutis; AI loeb neid kohapealt. Selge vaba
  litsentsiga (nt CC) PDF-i tohib erandina lisada käsuga `git add -f`.
- **Kasutus:** PDF on tooresallikas. Teema kohta, millest moodulit
  tehakse, tõmmatakse vajalikud lõigud MALL-valjavote.md järgi
  tekstifaili koos leheküljeviitega (nt „lk 34–37") – nii on sisu
  otsitav ja PDF-i ei pea iga kord uuesti läbi lappama.

## Register

| Allikas | URL / fail | Litsents | Kasutusreegel |
|---|---|---|---|
| Erkki Tempel, „Füüsika 8. klassile" (rets. J. Paaver, H. Voolaid; toim. K. Reivelt), Opik/fyysika.ee | https://opik.fyysika.ee/index.php/book/view/36 · PDF: `allikad/OPIK-F8-taielik.pdf` (162 lk, gitignore'is) · indeks: `allikad/OPIK-F8-INDEKS.md` | teadmata (lehel ei ole märgitud) | ainult faktikontroll ja analoogid; sõnasõnaline kopeerimine keelatud, kuni EFS-ilt pole luba küsitud |
| e-Koolikott (HARNO õppevaraportaal) | https://e-koolikott.ee | materjalipõhine – kontrolli IGA materjali litsentsi eraldi | CC-litsentsiga materjali tohib kohandada litsentsi tingimuste järgi (viide kirja väljavõttefaili) |

Uue allika lisamisel: lisa rida siia tabelisse ENNE, kui allikast
väljavõtteid tegema hakkad. Kui litsentsi ei leia, märgi „teadmata" –
siis kehtib automaatselt rangeim reegel (ainult faktikontroll ja analoogid).
