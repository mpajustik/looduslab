# Disainijuhis

Eesmärk: leht, mida 14-aastane avab telefonis ja saab kohe aru, mida teha –
ja mida õpetaja julgeb keset tundi ekraanile panna.

## Põhimõtted

1. **Üks ekraan = üks tegevus.** Mooduli samm täidab ekraani; edenemine on
   näha ribana üleval. Mitte kunagi pikka keritavat lehte õppetsükli sees.
2. **Maksimaalselt 4 navigatsioonivalikut**: Kursus, Kordamine, Minu
   edenemine, Õpetajale.
3. **Suur ja selge.** Põhitekst min 16 px, nupud min 44 px kõrged.
   Demo-režiimis (projektor) kõik 1,5× suurem.
4. **Vähem on rohkem.** Kui element ei aita õppida ega navigeerida, siis
   seda pole. Ei mingeid dekoratiivseid animatsioone, punkte ega märke (MVP-s).

## Värvid (Tailwindi seadistus)

| Roll | Värv | Kasutus |
|---|---|---|
| Põhivärv | teal-700 `#0f766e` | nupud, aktiivne samm, lingid |
| Heletaust | teal-50 | esiletõstetud kastid |
| Info | blue-700 / blue-50 | õpilase infokastid |
| Õpetaja-ala | amber-600 / amber-50 | kõik õpetajale mõeldud elemendid |
| Õige | green-600 | õige vastuse tagasiside |
| Paranda | red-600 | vale vastus (alati koos tekstiga, mitte ainult värv) |
| Tekst | slate-900 / slate-600 | põhi- ja teisene tekst |

Õpetaja-ala on ALATI kollase märgistusega – õpilane ei tohi kunagi kahelda,
kas ta näeb õpetaja materjali.

## Tüpograafia

- **Inter Variable** (@fontsource kaudu, self-hosted – mitte Google Fonts
  CDN-ist). Toetab täielikult õäöüšž. Pealkirjad font-semibold, kerge
  negatiivne letter-spacing (tracking-tight) suurtel pealkirjadel
- Pealkirjad lühikesed; laused max ~15 sõna; ei mingit kantseliiti
- Valemid KaTeX-iga, mitte piltidena; ühikud alati suuruse juures (nt 25 cm)

## Komponendid ja moodsa ilme reeglid

- **Baaskomponendid shadcn/ui-st** (Button, Card, Tabs, Dialog, Accordion,
  Progress, Sonner teated) – kohandatud meie värvidele. MITTE ehitada oma
  akordioni/dialoogi/tabsi nullist: shadcn omad on ligipääsetavad ja
  viimistletud
- **Ikoonid ainult lucide-react** – ühtlane joon, mitte kunagi emojid UI
  elementidena
- **Tokenid** (Tailwindi teemas, mitte suvalised väärtused igas failis):
  kaardid rounded-2xl, sisendid/nupud rounded-lg; varjud pehmed ja
  minimaalsed (shadow-sm, hover shadow-md); tühikud 4 px võrgustikul,
  ekraaniservad px-4 mobiilis
- **Õhk on disain**: pigem rohkem tühja ruumi kui rohkem elemente ühel
  ekraanil. Kaartide vahel min gap-4, sektsioonide vahel min gap-8
- **Mikroliikumised**: CSS-transitionid 150–200 ms (hover, fookus, sammu
  vahetus); edenemisriba täitub sujuvalt. MITTE animatsiooniteeke MVP-s;
  prefers-reduced-motion lülitab kõik välja
- **Laadimisolekud**: skeleton-kastid (mitte spinnerid) andmete kohale;
  nupp näitab laadimist (disabled + tekst „Salvestan …")
- **Tühiolekud**: iga tühi vaade (pole veel kaarte, pole klasse) saab ühe
  lause selgitust + ühe selge tegevusnupu – mitte kunagi tühja valget ala
- **Õige/vale tagasiside**: värv + ikoon + tekst koos, kerge taustatoon
  (green-50/red-50), mitte ainult punane tekst

## Simulatsiooni vaade

- SVG skaleerub konteineri järgi (viewBox), töötab 360 px ja projektoril
- Liugur + numbriväli iga muudetava suuruse jaoks (sõrmega JA täpselt)
- Alguses nähtaval max 2 muudetavat suurust, ülejäänud avanevad hiljem
- „Alusta uuesti" nupp alati samas kohas (üleval paremal)
- Mõõdetav väärtus kuvatakse suurelt ja ühikuga

## Tagasiside keel

- Õige: „Õige! …" + üks lause, MIKS see õige on
- Vale: mitte kunagi ainult „Vale". Alati: mida kontrollida või mis suunas
  mõelda + võimalus uuesti proovida
- Vihjed avanevad ükshaaval nupuga „Vihje" (max 2)
- Eesti keel, sina-vorm, sõbralik aga mitte lapsik

## UI-sõnastik – kasutaja keel, mitte arendaja keel

Kasutaja EI näe kunagi tehnilisi sõnu. Tõlketabel (kood → ekraan):

| Koodis | Õpilane näeb | Õpetaja näeb |
|---|---|---|
| moodul | pealkiri (nt „Vedeliku rõhk") | „tund" |
| plokk | „teema" | „teema" |
| theory | „Loe läbi" | sama |
| hook | (sammul ei ole silti – algab kohe küsimusega) | „häälestus" |
| precheck | „Tuleta meelde" | sama |
| predict | „Paku ennustus" | sama |
| explore | „Katseta" | sama |
| collect | „Mõõda" | sama |
| explain | „Selgita oma sõnadega" | sama |
| practice | „Harjuta" | sama |
| exit | „Kokkuvõte" | „väljumispilet" |
| review_items | „Kordamine" | sama |
| sünkroonimine | „Salvestatud ✓" | sama |
| attempts/responses | — (ei kuvata) | „vastused" |

Keelatud ekraanil: „moodul", „checker", „samm esitatud", „sessioon",
„viga 500". Iga uue teksti juures küsi: kas 14-aastane saab aru?

## Turvatunne ja usaldus

Õpilane pelgab kahte asja: „kas ma saan halva hinde?" ja „kes mu vastust
näeb?". Mõlemale vastame ekraanil, mitte juhendis:

- **Ennustuse samm kannab ALATI standardlauset:** „See ei ole hinne. Vale
  pakkumine on õppimise kõige kasulikum osa." (StepShell lisab
  automaatselt – mitte iga mooduli mure)
- **Läbipaistvus:** kui vastus läheb õpetajale nähtavaks (explain, exit),
  on sammu juures väike märge „Sinu vastust näeb õpetaja". Mitte kunagi
  üllatust tagantjärele
- **Salvestamise kinnitus:** iga esitatud vastuse järel lühike „Salvestatud ✓"
  – õpilane ei pea kartma, et töö kaob. Võrgukatkestusel: „Salvestan, kui
  võrk taastub" (mitte punane veateade)
- **Vale vastus ei karista:** alati saab uuesti proovida; toon on „proovi
  veel", mitte „eksisid"
- **Mooduli lõpus kokkuvõtteekraan:** „Valmis! Täna õppisid: [õpieesmärk].
  Kordamisküsimused lisatud sinu kordamisse." + üks selge edasiviiv nupp.
  Väike positiivne hetk ilma punktide ja edetabeliteta

## Vormid mobiilis (detailid, mis otsustavad kasutatavuse)

- Numbrivastuse väljal `inputmode="decimal"` – avaneb numbriklaviatuur
- Koma JA punkt on mõlemad lubatud (checker normaliseerib)
- Klassikoodi väli: suurtähed automaatselt, ilma tühikuteta, suur font
- Ära kunagi autofocus'i välja, mis avab klaviatuuri enne, kui õpilane on
  ekraani näinud
- Ühik kuvatakse välja kõrval (õpilane ei pea kirjutama „kPa") – aga kui ta
  ikkagi kirjutab („3,9 kPa" või „3900 Pa"), siis checker teisendab ja
  aktsepteerib. Väli EI tõrgu ühiku peale; ühiku kuvamine on mugavus, mitte
  piirang. Seepärast on checkeris ühikuteisendus (etapp 1.4) päriselt vajalik

## Seadmete tugi

- Baastase: viimase ~3 aasta brauserid + kooli vanad Android-telefonid.
  Kui valida uhkema CSS-i ja laiema toe vahel, võidab laiem tugi
- Testi regulaarselt vähemalt ühe VANA odava Androidiga (mitte ainult oma
  telefoniga) – koolis on just neid
- Esilehe laadimismaht hoia väike: moodulid laaditakse dünaamiliselt,
  rasked teegid (KaTeX, Recharts) ainult seal, kus vaja. Koolivõrgus loeb
  iga sekund

## Ligipääsetavus (algusest peale)

- Kõik juhtnupud töötavad klaviatuuriga, fookus on nähtav
- Igal juhtnupul on aria-label; graafikul tekstiline kokkuvõte või tabel
- Värv pole kunagi ainus info kandja (õige/vale ka ikooni ja tekstiga)
- `prefers-reduced-motion` korral animatsioonid seisma
