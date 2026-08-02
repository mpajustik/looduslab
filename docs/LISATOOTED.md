# Lisatooted ja ristmüük simulatsioonilehel

Kuidas LoodusLab AI tooteperekond (tööfail: põgenemistoad, KatseRajad,
inseneeriapäevad, töötoad, koolitused, koolisüsteemid, projektitugi)
seostub simulatsiooniplatvormiga. Põhimõte: platvorm on müügiredeli
esimene aste ja kõigi teenuste ühine kodu – iga teenus toob platvormile
kasutajaid ja platvorm müüb teenuseid edasi.

## Kaks raudset reeglit

1. **Õpilasele EI turundata MITTE KUNAGI midagi.** Kogu ristmüügi UI elab
   ainult õpetaja-alas (amber). Õpilase vaates ei ole ühtegi pakkumist,
   bännerit ega „telli"-nuppu. See on nii eetika kui usalduse küsimus.
2. **Teenuste info on sisu, mitte kood.** Üks fail
   `src/content/teenused.ts` (teenus: nimi, kirjeldus, seotud plokid,
   kontaktinfo) – teenuste lisamine/muutmine ei puuduta platvormi loogikat.

## Tooteliinide seosed platvormiga

| Toode (tööfail) | Tehniline seos | Ristmüügi mehhanism |
|---|---|---|
| Õppemoodulid | ONGI platvormi tuum | tasuta sissepääs (müügiredeli tase 1) |
| TeadusPõgenemistoad | digiosad (vihjed, ajapiir, ülesanded) = tulevased `game`/`puzzle` sammutüübid samas mootoris | mooduli õpetajapaneelis: „Sellel teemal on olemas põgenemistuba teie koolis läbiviimiseks"; toa järel jääb koolile sama teema moodulikomplekt |
| KatseRajad | rada = kursusefail (järjestatud punktid), punkt = väike moodul; QR-otselingid ja PWA-offline on JUBA olemas – õues töötamine on lahendatud | õuesõppe teemade (P3, P5, P7) juures: „Sama teema KatseRada kooli õue"; V3 (ise punktide loomine) ehitub samale moodulilepingule |
| Inseneeriapäevad, töötoad | teenus toimub klassis; platvormil eel- ja järelmoodulid (ettevalmistus + kinnistamine) ning materjalid, mis koolile alles jäävad | töötoa lõpus QR platvormile (õpetajatele); plokkide juures seotud töötoa viide; „töötuba ei jää ühekordseks" lubadus täitub platvormi kaudu |
| Õpetajakoolitused | demo-režiim ja „Vaata õpilasena" on koolituse tööriistad; koolitus = platvormi kasutuselevõtu kiirendi | uue õpetajakonto esimene e-kiri + töölaua vihje: „Tahad 45-minutilist stardikoolitust oma ainesektsioonile?" |
| Koolisüsteemid | EI ühendata samasse rakendusse (tööfaili enda hoiatus: fookus!); sama Supabase/RLS muster on hiljem taaskasutatav | müük tekib usaldusest, mitte platvormi UI-st – ei mingit tehnilist sidumist praegu |
| Projektitugi | – | teenuste lehel: „Aitame leida rahastust aastapaketi ostuks (KOV, projektid)" – vastab tööfaili vastuväitele „meil ei ole raha" |

## Ristmüügi kohad platvormil (kõik õpetaja-alas)

1. **Mooduli õpetajapaneel:** kui ploki kohta on teenus, üks vaikne rida:
   „Sellel teemal: [põgenemistuba/töötuba] – vaata lähemalt". Mitte popup,
   mitte bänner.
2. **Õpetaja töölaua jalus:** link „Teenused koolidele" → üks leht, mis
   kirjeldab tooteperekonda (tööfaili paketid 1–4) + kontakt.
3. **Klassi kokkuvõttevaade:** pärast mooduli läbimist klassiga: „Järgmine
   samm: sama teema [KatseRada/põgenemistuba] päris tegevusena".
4. **E-post õpetajale** (ainult nõusolekul!): uue ploki moodulite
   valmimisel teavitus + seotud teenus.

## Miks arhitektuur seda juba toetab (kontrollitud)

- Registripõhised sammutüübid → põgenemistoa ja KatseRaja digiosad on
  „ainult juurde" laiendused, mitte ümberehitus
- Kursusefailid → KatseRada ja temaatiline põgenemistuba on lihtsalt uut
  tüüpi kursusefail samade moodulite peal
- QR-otselingid + kontota kasutus → töötoas/õues liitumine on juba olemas
- PWA (4.3) → õuesõpe kehva võrguga on juba plaanis
- Teenuste fail on sisu → müügipoole muutmine ei vaja arendust

## Idee ootel: kontrolltööde generaator (õpetaja-alas)

**Mis see on:** õpetaja leht, mis genereerib ainekava õpitulemuste põhjal
tunnikontrolli või kontrolltöö failina (algul prinditav HTML või .md, mille
õpetaja Wordi kopeerib ja ise täiendab; .docx-eksport alles siis, kui
selleks paketti päriselt vaja on – reegel 4). Õpetaja valib plokid/moodulid,
generaator paneb kokku töö nii, et kõik valitud õpitulemused on kaetud, ja
oskab luua mitu varianti. Hiljem võimalik ka automaatkontrolliga versioon
(checker + tolerantsid on juba olemas; juurde oleks vaja „töö" andmemudelit:
töö eksemplar, variant, õpilase sooritus).

**Miks see EI vaja praegu ettevalmistust:** kogu tooraine tekib moodulite
tootmisel niikuinii –

- iga küsimus `activities.ts`-is: igavene `question_id`, õige vastus,
  tolerants, ühik (moodulilepingu nõue);
- `reviewCards` tüübisiltidega (concept/calc/graph/explain/transfer) on
  sisuliselt valmis küsimustepank;
- manifesti `outcomes`/`concepts` seovad iga mooduli (= ühe õpieesmärgi)
  ainekava ID-dega;
- katvusraport (4.0) annab loogika „kas kõik õpitulemused on kaetud" tasuta.

Generaator on seega puhtalt LUGEV funktsioon olemasoleva sisu peal – teda
saab lisada igal ajal ilma midagi ümber ehitamata. Ainus eeldus: sisu
tootmisel (4.1) peetakse moodulilepingust kinni.

**Millal otsustada:** mitte enne, kui füüsika 8. klassi katvus on piisav,
et genereeritud töö oleks päriselt terviklik (muidu on generaatori väljund
auklik ja jätab kehva mulje). Sobiv hetk on etapi 4.1 keskpaik või hiljem.

## Millal ehitada

- **MITTE enne 2. etapi lõppu** – ristmüük vajab õpetajaid, keda veel pole
- Etapp 4 (uus samm 4.6): teenuste leht + moodulipaneeli teenuseviide +
  klassi kokkuvõtte soovitus. Kokku ~2 sessiooni tööd
- Põgenemistoa/KatseRaja digiversioonid: eraldi otsus PÄRAST seda, kui
  teenusena on neid päriselt müüdud (tööfaili reegel: teenused enne,
  platvormistamine pärast tõestust)

## Mõõda ristmüüki

- mitu õpetajat avas teenuste lehe; mitu päringut tuli platvormi kaudu
- mitu teenuseklienti hakkas kasutama platvormi (teine suund!)
- aastapakettide osakaal (tööfaili tase 4) – lõppeesmärk on korduv tulu
