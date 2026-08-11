# Moodulite jaotuskava – füüsika 8. klass

Siin failis elab OTSUS, kuidas ainekava (AINEKAVA-fyysika-8.md) plokid
jagunevad väikesteks moodulikandidaatideks. Iga rida = üks planeeritav
moodul. Jaotusettepaneku teeb skill `/jaga-plokk`, kinnitab kasutaja.
Moodulispetsid (MOODUL-<slug>.md) kirjutatakse alles PÄRAST jaotuse
kinnitamist, üks korraga.

## Reeglid

- Moodul on VÄIKE (MALL-moodul.md suurusreegel): üks õpieesmärk, 5–20 min,
  3–6 sammu. Eesmärk on jagada teemad võimalikult väikesteks osadeks.
- `osa:` tähendab, et moodul katab õpitulemusest ainult nimetatud osa.
  Õpitulemus võib jaguneda mitme mooduli vahel, aga plokk tervikuna peab
  lõpuks kaetud saama (AINEKAVA „Katvuse reeglid").
- Iga põhimõiste on TÄPSELT ühe mooduli „Õpetab" veerus (õpetab =
  defineerib, kasutab ja kontrollib). Teised moodulid võivad mõistet
  kasutada, aga ei „oma" seda.
- Slug on igavene – ära nimeta ümber ega kustuta rida; kasuta staatust
  `arhiveeritud` (raudne reegel 11).
- **Iga teema saab vähemalt ühe rakendusmooduli.** Teooriamooduli kõrvale
  käib moodul, kus sama nähtus on päris elu asjas (helkur, prompter,
  liikluspeegel, teleskoop, lambivalik). Rakendusmoodul ei õpeta uut
  mõistet – ta kannab olemasoleva üle uude olukorda. Päris katsed
  (õpetajajuhendisse) lisanduvad hiljem.

**Staatused:** `plaanis` → `spetsitud` (MOODUL-<slug>.md olemas) →
`ehitatud` (kood src/modules all) → `arhiveeritud`

**Tüübid:** mikromoodul · rakendusmoodul · juhitud avastus · virtuaalne
labor · harjutusmoodul · teooriakonspekt

---

## P1. Valgus ja valguse sirgjooneline levimine. Peegeldumine ja neeldumine

| Slug | Tüüp | Katab | Õpetab mõisted | Staatus |
|---|---|---|---|---|
| valgusallikad | mikromoodul | P1-T1 (osa: soojuslikud ja külmad allikad; punkt- vs laiendatud allikas) | punktvalgusallikas | ehitatud |
| lambivalik | rakendusmoodul | P1-T1 (osa: liigituse rakendamine) | – | plaanis |
| valguse-sirgjooneline-levimine | mikromoodul | P1-T2 (osa: sirgjooneline levimine) | valgusvihk, optiline keskkond | ehitatud |
| vari-ja-poolvari | virtuaalne labor | P1-T2 (osa: varju joonised); P1-PT1 (sim + päris katse juhend) | täisvari, poolvari | ehitatud |
| varjutused | rakendusmoodul | P1-T2 (osa: varju ülekanne taevakehadele) | – | ehitatud |
| kuu-faasid | mikromoodul | P1-T2 (osa: valgustatud poolkera vaatenurk – õppesisu „Kuu faasid") | – | plaanis |
| varjutused-ja-kuu-faasid | rakendusmoodul | – (jagatud kaheks: `varjutused` + `kuu-faasid`) | – | arhiveeritud |
| liitvalgus-ja-spekter | mikromoodul | P1-T1 (osa: spektraalne koostis); P1-T3 (osa: spekter) | valge valgus, liht- ja liitvalgus, valguse spekter | ehitatud |
| esemete-varvus | mikromoodul | P1-T3 (osa: peegeldumine, neeldumine ja värvus) | – | ehitatud |
| valgusfiltrid | virtuaalne labor | P1-T3 (osa: valgusfilter); P1-PT2 (sim + päris katse juhend) | – | ehitatud |
| peegeldumisseadus | juhitud tund (piloot) | P1-T2 (osa: peegeldumisseadus, joonised, katse); P1-PT3 | valguskiir, tasapeegel, mattpind, langemisnurk, peegeldumisnurk, pinna ristsirge | spetsitud |
| tasapeegli-kujutis | virtuaalne labor | P1-T2 (osa: näiline kujutis, sümmeetria); P1-PT4 (sim + päris katse juhend) | – | ehitatud |
| peeglikiri | rakendusmoodul | P1-T2 (osa: tasapeegli kujutise ülekanne) | – | plaanis |
| nurkpeegel | mikromoodul | P1-T2 (osa: kiirte käik kahe peegli vahel, periskoop) | – | plaanis |
| helkur | rakendusmoodul | P1-T2 (osa: nurkpeegli ülekanne) | – | plaanis |
| kumerpeegel | mikromoodul | P1-T2 (osa: kumerpeegli kiirte käik) | kumerpeegel | plaanis |
| kumerpeegli-rakendused | rakendusmoodul | P1-T2 (osa: kumerpeegli ülekanne) | – | plaanis |
| noguspeegel | mikromoodul | P1-T2 (osa: nõguspeegli kiirte käik, fookus) | nõguspeegel, fookus | plaanis |
| noguspeegli-rakendused | rakendusmoodul | P1-T2 (osa: nõguspeegli ülekanne) | – | plaanis |

**Sisu lühidalt (uued read):**

- **valgusallikad** – soojuslik (hõõglamp, küünal, Päike, tähed) vs külm
  (LED, luminestsents); punktvalgusallikas vs laiendatud allikas.
  Päike kui elu võimaldaja: Maale jõuab lühilaineline kiirgus (sh UV),
  Maalt lahkub pikalaineline infrapunane – energiabilanss.
- **lambivalik** – (D) valib ruumi jaoks lambi ja põhjendab; (K) kodulampide
  võrdlus. Ainekava metoodiline rõhk „lambivalik koos põhjendusega".
- **valguse-sirgjooneline-levimine** – valgusvihk homogeenses keskkonnas,
  kiire mudel, miks laser on sirge joon.
- **vari-ja-poolvari** – allika suurus → varju servad; sim + (K) katse.
- **varjutused** – päikese- ja kuuvarjutus kui täisvarju ja poolvarju
  ülekanne taevakehadele; varjutuse tekkimise joonis; varjutuse teekonna
  kaardi lugemine; (K) arutelu, miks on varjutuse teekond kaardil kõver,
  mitte sirge; (K) möödunud varjutuste videod.
- **kuu-faasid** – miks näeme Kuust kord sirpi, kord ketast: Päike
  valgustab igal hetkel täpselt poolt Kuust, aga Kuu tiirlemise ajal
  näeme me sellest valgustatud poolest kord rohkem, kord vähem –
  varjuga ei ole siin midagi pistmist; faaside tsükkel 29,5 ööpäeva;
  simulatsiooniga.

  **NB! Miks kaks moodulit, kuigi ainekava õppesisus on „vari ja
  varjutused; Kuu faasid" kõrvuti:** varjutus on VARI (üks keha jääb teise
  varju), Kuu faas EI ole vari (Kuud valgustab kogu aeg pool, muutub
  vaatenurk). Kokku pandult tuleks kaks simulatsiooni ja ~8 sammu ehk üle
  suurusreegli, ja kõige levinum väärarusaam („Kuu faasid on Maa vari")
  vajab oma mooduli, kus teda päriselt ümber lükata. Rida
  `varjutused-ja-kuu-faasid` jääb tabelisse arhiveerituna (slug on igavene).
- **liitvalgus-ja-spekter** – valge valgus koosneb värvidest, spekter.
- **esemete-varvus** – must neelab, valge peegeldab, värviline peegeldab
  valikuliselt; miks must särk päikese käes soojeneb; kuidas silm värve
  näeb (värvuste tajumine).
- **valgusfiltrid** – filter laseb läbi „oma" värvi; sim + (K) katse;
  anaglüüfpilt punase ja sinise filtriga.
- **tasapeegli-kujutis** – kujutis on näiline, esemega ühesuurune ja peegli
  taga sama kaugel; kui suurt peeglit on vaja, et end täies pikkuses näha
  (pool pikkusest, kaugusest sõltumata); sim + (K) katse. Vasak-parem
  „vahetus" läks mooduli `peeglikiri` alla, et see moodul jääks väikeseks –
  vt sisu/MOODUL-tasapeegli-kujutis.md „Piirid".
- **peeglikiri** – prompter (uudistelugeja loeb ekraanilt läbi peegli),
  kiirabiauto peegelkiri, peeglikirja kirjutamine.
- **nurkpeegel** – kaks peeglit nurga all, kiir pöördub; periskoop.
- **helkur** – helkur ja jalgratta helkur kui nurkpeeglite väli
  (valgus tuleb tagasi sinna, kust tuli); miks helkur „süttib" tulede
  valguses ja miks ta pimedas ei paista.
- **kumerpeegel** – hajutav, kujutis väiksem, vaateväli lai.
- **kumerpeegli-rakendused** – liikluspeegel ristmikul, turvapeegel poes,
  auto külgpeegel („esemed on lähemal kui paistavad").
- **noguspeegel** – koondav, paralleelsed kiired lõikuvad fookuses.
- **noguspeegli-rakendused** – meigi-/habemeajamispeegel (suurendus),
  taskulambi ja autotule peegeldi, peegelteleskoop, päikeseahi.

**Katvuse kontroll:** kõik õpitulemused, praktilised tööd ja mõisted kaetud.

- P1-T1 → valgusallikad + liitvalgus-ja-spekter (rakendus: lambivalik)
- P1-T2 → valguse-sirgjooneline-levimine, vari-ja-poolvari,
  peegeldumisseadus, tasapeegli-kujutis, nurkpeegel, kumerpeegel,
  noguspeegel, kuu-faasid (rakendused: varjutused, peeglikiri, helkur,
  kumerpeegli-rakendused, noguspeegli-rakendused)
- P1-T3 → liitvalgus-ja-spekter, esemete-varvus, valgusfiltrid
- P1-PT1 → vari-ja-poolvari · P1-PT2 → valgusfiltrid ·
  P1-PT3 → peegeldumisseadus · P1-PT4 → tasapeegli-kujutis
  (kõik neli: simulatsioon + päris katse juhend õpetajale)
- Mõisted: punktvalgusallikas → valgusallikad; valgusvihk, optiline
  keskkond → valguse-sirgjooneline-levimine; täisvari, poolvari →
  vari-ja-poolvari; valge valgus, liht- ja liitvalgus, valguse spekter →
  liitvalgus-ja-spekter; valguskiir, tasapeegel, mattpind →
  peegeldumisseadus; kumerpeegel → kumerpeegel; nõguspeegel, fookus →
  noguspeegel

---

## P2. Valguse murdumine

| Slug | Tüüp | Katab | Õpetab mõisted | Staatus |
|---|---|---|---|---|
| valguse-murdumine | juhitud avastus | P2-T1 (osa: murdumise seaduspärasus) | valguse murdumine, optiline tihedus, murdumisnurk | plaanis |
| murdumine-elus | rakendusmoodul | P2-T1 (osa: murdumise ülekanne) | – | plaanis |
| taielik-peegeldumine | mikromoodul | P2-T1 (osa: täielik peegeldumine) | – | plaanis |
| valguskaabel | rakendusmoodul | P2-T1 (osa: täieliku peegeldumise ülekanne) | – | plaanis |
| liitvalguse-lahutamine | mikromoodul | P2-T1 (osa: prisma ja spekter) | – | plaanis |
| vikerkaar | rakendusmoodul | P2-T1 (osa: spektri ülekanne) | – | plaanis |
| kumerlaats | mikromoodul | P2-T2 (osa: fookus, fookuskaugus); P2-T3 (osa: kumerläätse omadused) | lääts, fookuskaugus | plaanis |
| noguslaats | mikromoodul | P2-T3 (osa: nõgusläätse omadused) | – | plaanis |
| optiline-tugevus | mikromoodul | P2-T2 (osa: optiline tugevus) | optiline tugevus | plaanis |
| optilise-tugevuse-ulesanded | harjutusmoodul | P2-T6 (D = 1/f) | – | plaanis |
| laatse-kujutis | virtuaalne labor | P2-T3 (osa: kiirte käik, tõeline ja näiline kujutis); P2-PT1 (sim + päris katse juhend) | kujutis | plaanis |
| laatse-fookuskaugus | virtuaalne labor | P2-PT2 (sim + päris katse juhend) | – | plaanis |
| luubi-suurendus | virtuaalne labor | P2-PT3 (sim + päris katse juhend) | – | plaanis |
| silm-ja-nagemine | mikromoodul | P2-T5 (osa: silm kui optiline süsteem) | – | plaanis |
| nagemishaired | rakendusmoodul | P2-T5 (osa: lühi- ja kaugnägelikkus, prillid) | – | plaanis |
| optilised-seadmed | rakendusmoodul | P2-T4 | – | plaanis |

**Sisu lühidalt:**

- **valguse-murdumine** – kiir murdub optilise tiheduse muutudes; kummale
  poole ristsirget; sim: nurga muutmine.
- **murdumine-elus** – pliiats klaasis „murdub", kala paistab mujal kui on,
  bassein paistab madalam, kuumaõhu miraaž teel.
- **taielik-peegeldumine** – piirnurk, millest alates kiir enam välja ei pääse.
- **valguskaabel** – fiiberoptika (internet), endoskoop meditsiinis,
  teemandi sära, valgusjuhtmed dekoratsioonis.
- **liitvalguse-lahutamine** – prisma lahutab valge valguse spektriks.
- **vikerkaar** – vikerkaare teke veepiiskades, kaksikvikerkaar,
  spektroskoop tähtede uurimisel.
- **kumerlaats** – koondav lääts, paralleelsed kiired fookuses,
  fookuskaugus.
- **noguslaats** – hajutav lääts, näiline fookus.
- **optiline-tugevus** – D = 1/f, dioptri tähendus, prilliretsept.
- **optilise-tugevuse-ulesanded** – D = 1/f mõlemas suunas, ühikud.
- **laatse-kujutis** – kolme põhikiire konstruktsioon; kujutis tõeline vs
  näiline, sõltuvus eseme kaugusest; sim + (K) katse.
- **laatse-fookuskaugus** – fookuskauguse ja optilise tugevuse määramine
  mõõtmisest; sim + (K) katse.
- **luubi-suurendus** – suurenduse sõltuvus kaugusest; sim + (K) katse.
- **silm-ja-nagemine** – sarvkest ja lääts kui optiline süsteem, kujutis
  võrkkestal (pea peale pööratud), akommodatsioon.
- **nagemishaired** – lühi- ja kaugnägelikkus: kus kujutis tekib ja kuidas
  kumer- või nõguslääts selle parandab; prillid ja kontaktläätsed.
- **optilised-seadmed** – fotoaparaat/telefonikaamera, mikroskoop,
  teleskoop, projektor: sama lääts, eri ülesanne.

**Katvuse kontroll:** kõik õpitulemused, praktilised tööd ja mõisted kaetud.

- P2-T1 → valguse-murdumine, taielik-peegeldumine, liitvalguse-lahutamine
  (rakendused: murdumine-elus, valguskaabel, vikerkaar)
- P2-T2 → kumerlaats, optiline-tugevus · P2-T3 → kumerlaats, noguslaats,
  laatse-kujutis · P2-T4 → optilised-seadmed ·
  P2-T5 → silm-ja-nagemine, nagemishaired ·
  P2-T6 → optilise-tugevuse-ulesanded
- P2-PT1 → laatse-kujutis · P2-PT2 → laatse-fookuskaugus ·
  P2-PT3 → luubi-suurendus (kõik: sim + päris katse juhend)
- Mõisted: valguse murdumine, optiline tihedus, murdumisnurk →
  valguse-murdumine; lääts, fookuskaugus → kumerlaats; optiline tugevus →
  optiline-tugevus; kujutis → laatse-kujutis
- **Mõisted, mille omanik on P1** (siin ainult kasutuses, ei dubleerita):
  optiline keskkond → `valguse-sirgjooneline-levimine`; langemisnurk →
  `peegeldumisseadus`

---

## P3. Liikumine ja jõud

| Slug | Tüüp | Katab | Õpetab mõisted | Staatus |
|---|---|---|---|---|
| trajektoor-ja-teepikkus | mikromoodul | P3-T1 (osa: liikumise kirjeldamine) | trajektoor, teepikkus | plaanis |
| uhtlane-liikumine | mikromoodul | P3-T1 (osa: ühtlane vs mitteühtlane, v = s/t) | kiirus | plaanis |
| kiiruse-uhikud | harjutusmoodul | P3-T4 (osa: km/h ↔ m/s) | – | plaanis |
| kiiruse-ulesanded | harjutusmoodul | P3-T4 (osa: v = s/t) | – | plaanis |
| keskmine-kiirus | mikromoodul | P3-T1 (osa: hetk- ja keskmine kiirus) | keskmine kiirus | plaanis |
| liikumise-graafikud | mikromoodul | P3-T1 (osa: graafiline analüüs) | – | plaanis |
| kiiruse-maaramine | virtuaalne labor | P3-PT1 (sim + päris katse juhend) | – | plaanis |
| peatumisteekond | rakendusmoodul | P3-T1 (osa: kiiruse ülekanne) | – | plaanis |
| mass-ja-inertsus | mikromoodul | P3-T2 (osa: mass ja inertsus); P3-PT3 (sim + päris katse juhend) | mass | plaanis |
| inertsus-liikluses | rakendusmoodul | P3-T2 (osa: inertsuse ülekanne) | – | plaanis |
| tihedus | mikromoodul | P3-T2 (osa: tihedus, ρ = m/V) | tihedus | plaanis |
| tiheduse-ulesanded | harjutusmoodul | P3-T4 (osa: ρ = m/V) | – | plaanis |
| tiheduse-maaramine | virtuaalne labor | P3-PT2 (sim + päris katse juhend) | – | plaanis |
| tihedus-elus | rakendusmoodul | P3-T2 (osa: tiheduse ülekanne) | – | plaanis |
| vastastikmoju | juhitud avastus | P3-T2 (osa: vastastikmõju, kiiruse muutumine) | – | plaanis |
| joud | mikromoodul | P3-T3; P3-PT4 (sim + päris katse juhend) | jõud | plaanis |

**Sisu lühidalt:**

- **trajektoor-ja-teepikkus** – kus keha liikus (trajektoor) vs kui pika
  tee ta läbis; sirg- ja kõverjooneline liikumine.
- **uhtlane-liikumine** – ühtlane vs mitteühtlane; kiirus kui teepikkuse
  ja aja suhe.
- **kiiruse-uhikud** – km/h ja m/s teisendamine mõlemas suunas.
- **kiiruse-ulesanded** – v = s/t kolmes suunas (v, s, t avaldamine).
- **keskmine-kiirus** – miks keskmine kiirus ei ole kiiruste keskmine.
- **liikumise-graafikud** – s–t ja v–t graafiku lugemine ja koostamine
  katseandmetest.
- **kiiruse-maaramine** – kaudne meetod (tee ja aeg); sim + (K) 60 m jooks.
- **peatumisteekond** – reaktsiooniaeg + pidurdusteekond; miks kiiruse
  kahekordistumine pikendab peatumisteekonna palju enam kui kaks korda;
  kiiruspiirangute mõte.
- **mass-ja-inertsus** – mass kui inertsuse mõõt; sim + (K) katse.
- **inertsus-liikluses** – turvavöö, peatugi, laste turvatool, koorma
  kinnitamine, miks buss ei peatu kohe.
- **tihedus** – ρ = m/V; sama ruumala, eri mass.
- **tiheduse-ulesanded** – ρ = m/V kolmes suunas + ühikud (g/cm³, kg/m³).
- **tiheduse-maaramine** – mass kaaluga, ruumala mõõtesilindriga;
  sim + (K) katse.
- **tihedus-elus** – miks jää ujub vee peal, kuumaõhupall, materjalivalik
  lennukis (alumiinium vs teras), õli vee peal.
- **vastastikmoju** – mõju on alati vastastikune; kiiruse muutus sõltub
  massist ja mõju kestusest (uisutajad, paat ja kai).
- **joud** – jõud kui vastastikmõju tugevuse mõõt, njuuton, jõu suund;
  dünamomeetriga mõõtmine (sim + (K) katse).

**Katvuse kontroll:** kõik õpitulemused, praktilised tööd ja mõisted kaetud.

- P3-T1 → trajektoor-ja-teepikkus, uhtlane-liikumine, keskmine-kiirus,
  liikumise-graafikud (rakendus: peatumisteekond)
- P3-T2 → mass-ja-inertsus, tihedus, vastastikmoju (rakendused:
  inertsus-liikluses, tihedus-elus)
- P3-T3 → joud · P3-T4 → kiiruse-uhikud, kiiruse-ulesanded,
  tiheduse-ulesanded
- P3-PT1 → kiiruse-maaramine · P3-PT2 → tiheduse-maaramine ·
  P3-PT3 → mass-ja-inertsus · P3-PT4 → joud
- Mõisted: trajektoor, teepikkus → trajektoor-ja-teepikkus; kiirus →
  uhtlane-liikumine; keskmine kiirus → keskmine-kiirus; mass →
  mass-ja-inertsus; tihedus → tihedus; jõud → joud

---

## P4. Jõud looduses

| Slug | Tüüp | Katab | Õpetab mõisted | Staatus |
|---|---|---|---|---|
| gravitatsioon | mikromoodul | P4-T1 (osa: gravitatsioon) | gravitatsioon | plaanis |
| raskusjoud | mikromoodul | P4-T1 (osa: F = m·g, sõltuvus massist) | raskusjõud | plaanis |
| raskusjou-ulesanded | harjutusmoodul | P4-T5 (F = m·g) | – | plaanis |
| raskusjoud-planeetidel | rakendusmoodul | P4-T1 (osa: raskusjõu ülekanne) | – | plaanis |
| hoordumine | mikromoodul | P4-T2 (osa: hõõrdejõu mõiste, liug- ja veerehõõre) | hõõrdejõud | plaanis |
| hoordejou-tegurid | virtuaalne labor | P4-T2 (osa: graafiline sõltuvus rõhumisjõust); P4-PT1 (sim + päris katse juhend) | – | plaanis |
| hoordumine-elus | rakendusmoodul | P4-T2 (osa: hõõrdumise ülekanne) | – | plaanis |
| elastsus-ja-plastsus | mikromoodul | P4-T3 (osa: deformeerimine) | – | plaanis |
| elastsusjoud | mikromoodul | P4-T3 (osa: elastsusjõu tekkimine) | elastsusjõud | plaanis |
| elastsusjou-tegurid | virtuaalne labor | P4-PT3 (sim + päris katse juhend) | – | plaanis |
| dunamomeeter | virtuaalne labor | P4-T4; P4-PT2 (sim + päris katse juhend) | – | plaanis |
| elastsus-elus | rakendusmoodul | P4-T3 (osa: elastsusjõu ülekanne) | – | plaanis |
| joudude-tasakaal | mikromoodul | P4-T4 (osa: kehale mõjuvate jõudude tasakaal) | – | plaanis |

**Sisu lühidalt:**

- **gravitatsioon** – kõik kehad tõmbuvad; tõmbe tugevus sõltub massidest
  ja kaugusest; miks Kuu ei kuku Maale.
- **raskusjoud** – F = m·g; g = 9,8 N/kg tähendus; **mass ei ole kaal**.
- **raskusjou-ulesanded** – F = m·g kolmes suunas + ühikud.
- **raskusjoud-planeetidel** – sama keha kaal Kuul, Marsil, Jupiteril;
  kaaluta olek ISS-il; miks astronaut hüppab Kuul kõrgele.
- **hoordumine** – hõõrdejõud on liikumisele vastu; liug-, veere- ja
  seisuhõõre.
- **hoordejou-tegurid** – sõltuvus pinnast ja rõhumisjõust (graafik),
  sõltumatus pindalast; sim + (K) katse.
- **hoordumine-elus** – naastrehvid ja talvine tee, pidurid, määrdeaine
  ja laagrid, jalatsi tald, miks käik libedal ei õnnestu.
- **elastsus-ja-plastsus** – elastne (vedru, kumm) vs plastne (plastiliin)
  deformatsioon.
- **elastsusjoud** – deformeerunud keha „tahab" endise kuju tagasi;
  pikenemise ja jõu seos.
- **elastsusjou-tegurid** – vedru pikenemise sõltuvus jõust ja vedru
  omadustest; sim + (K) katse.
- **dunamomeeter** – vedru pikenemine kui jõu mõõt; raskus-, hõõrde- ja
  elastsusjõu mõõtmine; (K) kumminiidist oma dünamomeeter.
- **elastsus-elus** – batuut, auto vedrustus, poekaal, kiiver ja
  põrkevaigistus, sportvarustus (teivas, vibu).
- **joudude-tasakaal** – kui jõud tasakaalus, keha liikumine ei muutu;
  laual seisev raamat, ühtlaselt liikuv auto, köievedu.

**Katvuse kontroll:** kõik õpitulemused, praktilised tööd ja mõisted kaetud.

- P4-T1 → gravitatsioon, raskusjoud (rakendus: raskusjoud-planeetidel)
- P4-T2 → hoordumine, hoordejou-tegurid (rakendus: hoordumine-elus)
- P4-T3 → elastsus-ja-plastsus, elastsusjoud, elastsusjou-tegurid
  (rakendus: elastsus-elus)
- P4-T4 → dunamomeeter, joudude-tasakaal · P4-T5 → raskusjou-ulesanded
- P4-PT1 → hoordejou-tegurid · P4-PT2 → dunamomeeter ·
  P4-PT3 → elastsusjou-tegurid
- Mõisted: gravitatsioon → gravitatsioon; raskusjõud → raskusjoud;
  hõõrdejõud → hoordumine; elastsusjõud → elastsusjoud

---

## P5. Rõhumisjõud ja rõhk. Rõhk ja üleslükkejõud vedelikes ja gaasides

| Slug | Tüüp | Katab | Õpetab mõisted | Staatus |
|---|---|---|---|---|
| rohk-ja-pindala | juhitud avastus | P5-T1 (osa: p = F/S, keha kaal) | – | plaanis |
| rohu-ulesanded | harjutusmoodul | P5-T5 (osa: p = F/S) | – | plaanis |
| rohu-maaramine | virtuaalne labor | P5-PT1 (sim + päris katse juhend) | – | plaanis |
| rohk-elus | rakendusmoodul | P5-T1 (osa: rõhu ülekanne) | – | plaanis |
| pascali-seadus | mikromoodul | P5-T2 (osa: rõhu edasikandumine) | – | plaanis |
| hudraulika | rakendusmoodul | P5-T2 (osa: Pascali seaduse ülekanne) | – | plaanis |
| vedeliku-rohk | juhitud tund (piloot) | P5-T4 (osa: vedelikusamba rõhk); P5-T5 (osa: p = ρ·g·h) | rõhk, rõhumisjõud | spetsitud |
| uhendatud-anumad | rakendusmoodul | P5-T4 (osa: vedelikusamba rõhu ülekanne) | – | plaanis |
| ohurohk | mikromoodul | P5-T4 (osa: õhurõhk) | õhurõhk, normaalrõhk | plaanis |
| ohurohu-mootmine | virtuaalne labor | P5-PT2 (sim + ilmajaama andmed) | – | plaanis |
| korg-ja-madalrohkkond | rakendusmoodul | P5-T4 (osa: õhurõhu ülekanne ilmale) | – | plaanis |
| ohurohk-elus | rakendusmoodul | P5-T4 (osa: õhurõhu ülekanne) | – | plaanis |
| uleslukkejoud | juhitud avastus | P5-T2 (osa: üleslükkejõu katse); P5-T4 (osa: üleslükkejõud) | üleslükkejõud | plaanis |
| uleslukkejou-ulesanded | harjutusmoodul | P5-T5 (osa: Fü = ρ·g·V) | – | plaanis |
| uleslukkejou-uurimine | virtuaalne labor | P5-PT3 (sim + päris katse juhend) | – | plaanis |
| ujumine-ja-uppumine | mikromoodul | P5-T3 | – | plaanis |
| ujuvus-elus | rakendusmoodul | P5-T3 (osa: ujuvuse ülekanne) | – | plaanis |

**Sisu lühidalt:**

- **rohk-ja-pindala** – sama jõud, eri pindala → eri rõhk; p = F/S;
  keha kaal kui pinnale mõjuv jõud.
- **rohu-ulesanded** – p = F/S kolmes suunas; paskali ja kilopaskali
  teisendamine.
- **rohu-maaramine** – enda rõhk maapinnale (ühel ja kahel jalal);
  sim + (K) katse.
- **rohk-elus** – terav nuga ja nael, suusad ja lumekingad, kaameli käpp,
  traktori laiad rehvid, kontsakingad parketil.
- **pascali-seadus** – vedelikus ja gaasis kandub rõhk edasi igas suunas
  ühtmoodi; Pascali kera.
- **hudraulika** – hüdrauliline press, auto pidurisüsteem, ekskavaatori
  ja tõstuki silindrid: väike jõud → suur jõud.
- **uhendatud-anumad** – vedelik seisab ühtel kõrgusel; veetorn,
  lüüsid, teekann, vesilood, kaevu põhimõte.
- **ohurohk** – õhul on kaal; normaalrõhk 101 325 Pa; sõltuvus kõrgusest.
- **ohurohu-mootmine** – baromeeter; Ilmateenistuse päris andmete graafik
  ja analüüs.
- **korg-ja-madalrohkkond** – ilmakaardi lugemine; miks madalrõhkkonnaga
  sajab; (K) oma ilmateate video.
- **ohurohk-elus** – kõrrega joomine, kummiiminapp, muna pudelisse,
  kõrvad lennukis ja mäel, vererõhk, vaakumpakend.
- **uleslukkejoud** – miks keha vees kergem tundub; Fü = ρ·g·V; sõltuvus
  vedeliku tihedusest ja keha ruumalast (mitte massist!).
- **uleslukkejou-ulesanded** – Fü = ρ·g·V kolmes suunas + ühikud.
- **uleslukkejou-uurimine** – üleslükkejõu mõõtmine dünamomeetriga;
  sim + (K) katse; keha tiheduse määramine üleslükkejõu kaudu.
- **ujumine-ja-uppumine** – ujumise, uppumise ja heljumise tingimused
  tiheduste võrdlusena.
- **ujuvus-elus** – laeva teras ujub, allveelaeva ballastpaagid, päästevest,
  jäämägi (kui palju on vee all), Surnumeri, kalade ujupõis.

**Katvuse kontroll:** kõik õpitulemused, praktilised tööd ja mõisted kaetud.

- P5-T1 → rohk-ja-pindala, rohu-maaramine (rakendus: rohk-elus)
- P5-T2 → pascali-seadus, uleslukkejoud (rakendus: hudraulika)
- P5-T3 → ujumine-ja-uppumine (rakendus: ujuvus-elus)
- P5-T4 → vedeliku-rohk, ohurohk, uleslukkejoud (rakendused:
  uhendatud-anumad, korg-ja-madalrohkkond, ohurohk-elus)
- P5-T5 → rohu-ulesanded, vedeliku-rohk, uleslukkejou-ulesanded
- P5-PT1 → rohu-maaramine · P5-PT2 → ohurohu-mootmine ·
  P5-PT3 → uleslukkejou-uurimine
- Mõisted: rõhk, rõhumisjõud → vedeliku-rohk (piloot); õhurõhk,
  normaalrõhk → ohurohk; üleslükkejõud → uleslukkejoud

---

## P6. Mehaaniline töö, energia ja võimsus

| Slug | Tüüp | Katab | Õpetab mõisted | Staatus |
|---|---|---|---|---|
| mehaaniline-too | mikromoodul | P6-T1 (osa: töö mõiste, A = F·s) | mehaaniline töö | plaanis |
| too-ulesanded | harjutusmoodul | P6-T3 (osa: A = F·s) | – | plaanis |
| voimsus | mikromoodul | P6-T1 (osa: võimsus, N = A/t) | võimsus | plaanis |
| voimsuse-ulesanded | harjutusmoodul | P6-T3 (osa: N = A/t) | – | plaanis |
| too-ja-voimsuse-maaramine | virtuaalne labor | P6-PT1 (sim + päris katse juhend) | – | plaanis |
| voimsus-elus | rakendusmoodul | P6-T1 (osa: võimsuse ülekanne) | – | plaanis |
| potentsiaalne-energia | mikromoodul | P6-T1 (osa: potentsiaalne energia) | potentsiaalne energia | plaanis |
| kineetiline-energia | mikromoodul | P6-T1 (osa: kineetiline energia) | kineetiline energia | plaanis |
| energia-jaavus | juhitud avastus | P6-T1 (osa: mehaanilise energia jäävuse seadus) | – | plaanis |
| energia-elus | rakendusmoodul | P6-T1 (osa: energia jäävuse ülekanne) | – | plaanis |
| lihtmehhanismid | mikromoodul | P6-T2 (osa: lihtmehhanismi otstarve) | lihtmehhanism | plaanis |
| kangi-reegel | virtuaalne labor | P6-T2 (osa: kangi reegel) | – | plaanis |
| mehaanika-kuldreegel | virtuaalne labor | P6-T2 (osa: kuldreegel); P6-PT2 (sim + päris katse juhend) | – | plaanis |
| kasutegur | mikromoodul | P6-T1 (osa: kasutegur) | kasutegur | plaanis |
| lihtmehhanismid-elus | rakendusmoodul | P6-T2 (osa: lihtmehhanismide ülekanne) | – | plaanis |

**Sisu lühidalt:**

- **mehaaniline-too** – tööd tehakse, kui jõud liigutab keha; A = F·s;
  millal tööd EI tehta (kotti käes hoides).
- **too-ulesanded** – A = F·s kolmes suunas; džaul ja kilodžaul.
- **voimsus** – kui kiiresti tööd tehakse; N = A/t; vatt.
- **voimsuse-ulesanded** – N = A/t kolmes suunas; W, kW, hobujõud.
- **too-ja-voimsuse-maaramine** – enda töö ja võimsus trepist üles minnes;
  sim + (K) trepijooks.
- **voimsus-elus** – auto hobujõud, kodumasinate võimsus ja elektriarve,
  inimese võimsus võrdluses, LED vs hõõglamp.
- **potentsiaalne-energia** – kõrgusest ja massist sõltuv energia.
- **kineetiline-energia** – liikumisenergia; miks kiiruse kahekordistumine
  neljakordistab energia (seos peatumisteekonnaga).
- **energia-jaavus** – energia ei kao, muundub; kiik, kelgumägi,
  kukkuv pall; miks igiliikur on võimatu.
- **energia-elus** – hüdroelektrijaam, pumpelektrijaam, mägironija,
  vibu ja nool, elektriauto pidurdusenergia taaskasutus.
- **lihtmehhanismid** – kang, plokk, kaldpind: jõudu võidad, teed kaotad.
- **kangi-reegel** – jõudude ja õlgade tasakaal; sim.
- **mehaanika-kuldreegel** – ükski lihtmehhanism ei võida tööd;
  sim + (K) katse.
- **kasutegur** – kasulik töö vs kogutöö; miks kasutegur on alati alla 100 %.
- **lihtmehhanismid-elus** – käärid ja näpitsad, kruvi ja kruvikeeraja,
  jalgratta käigud, kaldtee ratastoolile, kraana ja plokid, (K) Rube
  Goldbergi masin kokkuvõtteks.

**Katvuse kontroll:** kõik õpitulemused, praktilised tööd ja mõisted kaetud.

- P6-T1 → mehaaniline-too, voimsus, potentsiaalne-energia,
  kineetiline-energia, energia-jaavus, kasutegur (rakendused:
  voimsus-elus, energia-elus)
- P6-T2 → lihtmehhanismid, kangi-reegel, mehaanika-kuldreegel
  (rakendus: lihtmehhanismid-elus)
- P6-T3 → too-ulesanded, voimsuse-ulesanded
- P6-PT1 → too-ja-voimsuse-maaramine · P6-PT2 → mehaanika-kuldreegel
- Mõisted: mehaaniline töö → mehaaniline-too; võimsus → voimsus;
  potentsiaalne energia → potentsiaalne-energia; kineetiline energia →
  kineetiline-energia; kasutegur → kasutegur; lihtmehhanism →
  lihtmehhanismid

---

## P7. Võnkumine ja laine

| Slug | Tüüp | Katab | Õpetab mõisted | Staatus |
|---|---|---|---|---|
| vonkumine | mikromoodul | P7-T1 (osa: võnkumise mudel) | võnkumine | plaanis |
| amplituud-periood-sagedus | mikromoodul | P7-T1 (osa: võnkumise suurused) | amplituud, periood, sagedus | plaanis |
| sageduse-ulesanded | harjutusmoodul | P7-T4 (osa: f = 1/T) | – | plaanis |
| pendli-vonkumine | virtuaalne labor | P7-PT1 (sim + päris katse juhend) | – | plaanis |
| vonkumine-elus | rakendusmoodul | P7-T1 (osa: võnkumise ülekanne) | – | plaanis |
| laine | mikromoodul | P7-T2 (osa: rist- ja pikilaine, lainepikkus) | – | plaanis |
| laine-kiiruse-ulesanded | harjutusmoodul | P7-T4 (osa: v = λ·f) | – | plaanis |
| heli-tekkimine | mikromoodul | P7-T2 (osa: heli teke võnkumisest) | heli | plaanis |
| heli-levimine | mikromoodul | P7-T2 (osa: heli levimine keskkonnas) | – | plaanis |
| heli-korgus | juhitud avastus | P7-T3 (osa: kõrguse ja sageduse seos) | – | plaanis |
| heli-valjus | mikromoodul | P7-T3 (osa: valjus ja amplituud, detsibell) | – | plaanis |
| heli-muusikas | rakendusmoodul | P7-T3 (osa: heli kõrguse ülekanne) | – | plaanis |
| ultraheli-ja-infraheli | mikromoodul | P7-T2 (osa: kuuldeulatusest väljas) | – | plaanis |
| kaja-ja-sonar | rakendusmoodul | P7-T2 (osa: ultraheli ülekanne) | – | plaanis |
| myra | mikromoodul | P7-T3 (osa: müra mõiste ja normid) | müra | plaanis |
| myra-mootmine | virtuaalne labor | P7-PT2 (sim + päris katse juhend) | – | plaanis |
| korv-ja-kuulmine | mikromoodul | P7-T2 (osa: kuulmine) | – | plaanis |
| myrakaitse | rakendusmoodul | P7-T3 (osa: müra ülekanne) | – | plaanis |

**Sisu lühidalt:**

- **vonkumine** – korduv edasi-tagasi liikumine tasakaaluasendi ümber;
  pendel ja vedru kui mudelid.
- **amplituud-periood-sagedus** – kolm suurust ühe võnkumise kirjeldamiseks;
  herts; f = 1/T seos.
- **sageduse-ulesanded** – f = 1/T mõlemas suunas; Hz, kHz.
- **pendli-vonkumine** – kas periood sõltub amplituudist, massist,
  pikkusest? hüpotees → sim → (K) katse.
- **vonkumine-elus** – pendelkell, kiik, kitarrikeel, maavärin ja
  seismograaf, Tacoma silla resonants.
- **laine** – häiritus levib, aine ei liigu kaasa; ristlaine (vesi, nöör)
  vs pikilaine (heli); lainepikkus; v = λ·f.
- **laine-kiiruse-ulesanded** – v = λ·f kolmes suunas.
- **heli-tekkimine** – heli tekib võnkuvast kehast (häälepaelad, keel,
  membraan).
- **heli-levimine** – heli vajab keskkonda (vaakumis ei levi); heli kiirus
  õhus, vees, terases; miks välk enne kõuemürinat.
- **heli-korgus** – suurem sagedus → kõrgem heli; sim + (K) monokord või
  kõrrepill.
- **heli-valjus** – suurem amplituud → valjem heli; detsibelliskaala.
- **heli-muusikas** – keelpill vs puhkpill, häälestamine, keele pikkuse ja
  pinguse mõju, (K) koostöö muusikaõpetajaga.
- **ultraheli-ja-infraheli** – inimese kuuldeulatus 20 Hz – 20 kHz;
  mis jääb sellest välja.
- **kaja-ja-sonar** – kaja ja kauguse mõõtmine, nahkhiire ja delfiini
  kajalokatsioon, laeva sonar, ultraheliuuring meditsiinis,
  parkimisandurid.
- **myra** – millal heli on müra; müranormid Riigi Teatajast; müra mõju
  tervisele.
- **myra-mootmine** – koolimüra mõõtmine (telefoniäpp), võrdlus normidega;
  sim + (K) katse ja arutelu.
- **korv-ja-kuulmine** – kõrva ehitus ja kuulmise teke; kuulmiskahjustus.
- **myrakaitse** – mürasein maantee ääres, akende müraisolatsioon,
  kõrvaklapid ja kõrvatropid, vaikne rehv, lennujaama piirangud.

**Katvuse kontroll:** kõik õpitulemused, praktilised tööd ja mõisted kaetud.

- P7-T1 → vonkumine, amplituud-periood-sagedus, pendli-vonkumine
  (rakendus: vonkumine-elus)
- P7-T2 → laine, heli-tekkimine, heli-levimine, ultraheli-ja-infraheli,
  korv-ja-kuulmine (rakendus: kaja-ja-sonar)
- P7-T3 → heli-korgus, heli-valjus, myra, myra-mootmine (rakendused:
  heli-muusikas, myrakaitse)
- P7-T4 → sageduse-ulesanded, laine-kiiruse-ulesanded
- P7-PT1 → pendli-vonkumine · P7-PT2 → myra-mootmine
- Mõisted: võnkumine → vonkumine; amplituud, periood, sagedus →
  amplituud-periood-sagedus; heli → heli-tekkimine; müra → myra
