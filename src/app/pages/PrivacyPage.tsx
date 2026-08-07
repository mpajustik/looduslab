import { Card, CardTitle } from "../../ui/Card";
import { PageHeader } from "../../ui/PageHeader";

/**
 * /privaatsus – mida salvestame, mida mitte, kaua ja miks (samm 2.15).
 *
 * KOLM REEGLIT selle lehe kohta:
 *
 * 1. Ta on kirjutatud lapsele ja lapsevanemale, mitte juristile. Lühikesed
 *    laused, ei ühtegi „töötlemise õiguslikku alust".
 * 2. Ta ei tohi ette laadida supabase-js't ega ühtegi rasket sõltuvust:
 *    see leht avaneb tihti KÕIGE ESIMESENA (link liitumislehelt, enne kui
 *    laps üldse liitub). Seepärast on siin ainult teksti ja marsruudis
 *    ilma `lazy`-ta – kogu leht on paar kilobaiti.
 * 3. Ta peab vastama tõele. Kui andmemudel muutub (docs/ANDMEMUDEL.md),
 *    muutub see leht SAMAS commit'is – vale privaatsusleht on hullem kui
 *    puuduv.
 */
export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Privaatsus"
        lead="Siin on lihtsalt kirjas, mida LoodusLab AI sinu kohta salvestab ja mida mitte."
      />

      <Card className="flex flex-col gap-3">
        <CardTitle>Mida õpilase kohta salvestame</CardTitle>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-ink">
          <li>
            <strong>Eesnime</strong>, mille sa ise liitumisel kirjutasid. See
            on selleks, et õpetaja näeks klassi nimekirjas, kes mida tegi.
          </li>
          <li>
            <strong>Sinu vastuseid</strong> ülesannetele ja seda, kui kaugele
            oled tunnis jõudnud.
          </li>
          <li>
            <strong>Klassi</strong>, millega sa liitusid.
          </li>
          <li>
            <strong>Tehnilise numbri</strong>, mille arvuti ise sinu seansile
            annab. See seob sinu vastused omavahel kokku, aga ei ütle kellelegi,
            kes sa oled.
          </li>
        </ul>
      </Card>

      <Card className="flex flex-col gap-3">
        <CardTitle>Mida me EI salvesta</CardTitle>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-ink">
          <li>Perekonnanime, sünniaega, isikukoodi</li>
          <li>Õpilase e-posti aadressi ega telefoninumbrit</li>
          <li>Fotosid, häält ega asukohta</li>
          <li>Midagi, mis läheks reklaamiks – reklaami siin ei ole</li>
        </ul>
        <p className="text-ink-soft">
          Õpilane logib sisse ilma kontota: piisab klassikoodist ja eesnimest.
        </p>
      </Card>

      <Card className="flex flex-col gap-3">
        <CardTitle>Kes sinu vastuseid näeb</CardTitle>
        <p className="text-ink">
          Sinu enda õpetaja, kelle klassiga sa liitusid – tema jaoks see
          keskkond ongi. Teised õpetajad ja teiste klasside õpilased sinu
          vastuseid ei näe. Sinu klassikaaslased ei näe samuti sinu vastuseid;
          projektoril on näha ainult eesnimed, kes on liitunud.
        </p>
      </Card>

      <Card className="flex flex-col gap-3">
        <CardTitle>Liitumiskatsed ja IP-aadress</CardTitle>
        <p className="text-ink">
          Kui klassikoodi sisestamine ebaõnnestub, jätame meelde ühe numbri,
          mis on sinu internetiühenduse aadressist (IP-st) arvutatud. See on
          <strong> ühesuunaline räsi</strong>: aadressi ennast me ei salvesta
          ega saa seda numbrist tagasi arvutada.
        </p>
        <p className="text-ink-soft">
          Milleks: nii ei saa keegi võõraid klassikoode ükshaaval ära arvata ja
          teie klassi sisse tulla. Need read kustuvad <strong>24 tunni</strong>{" "}
          pärast automaatselt.
        </p>
      </Card>

      <Card className="flex flex-col gap-3">
        <CardTitle>Mis jääb sinu enda seadmesse</CardTitle>
        <p className="text-ink">
          Sinu eesnimi, klassi nimi ja pooleliolev töö jäävad ka brauseri
          mällu, et tund ei kaoks, kui internet hetkeks ära käib. Kui kustutad
          brauseri andmed või kasutad privaatset akent, kaob see osa ära – see
          ei riku midagi.
        </p>
      </Card>

      <Card className="flex flex-col gap-3">
        <CardTitle>Kaua andmeid hoitakse</CardTitle>
        <p className="text-ink">
          Kuni õpetaja klassi kustutab. Kustutamise hetkel kaovad{" "}
          <strong>kõik</strong> selle klassi õpilaste vastused ja edenemine
          korraga ning neid ei saa tagasi.
        </p>
        <p className="text-ink-soft">
          Kui tahad, et sinu vastused varem ära kustutataks, ütle seda oma
          õpetajale – tema saab selle ära teha.
        </p>
        <p className="text-ink-soft">
          Üks asi jääb ka siis alles: sinu <em>enda</em> telefoni või arvuti
          brauserimällu jäänud koopia (vt eelmist punkti). Selleni õpetaja ei
          ulatu – selle saad ära kustutada ainult sina ise, brauseri andmeid
          kustutades.
        </p>
      </Card>

      <Card className="flex flex-col gap-3">
        <CardTitle>Vead ja külastuste lugemine</CardTitle>
        <p className="text-ink">
          Kui midagi läheb katki, saadab rakendus meile veateate, et me
          oskaksime selle ära parandada. Selles on kirjas, mis läks katki ja
          millisel lehel – <strong>ilma sinu nimeta</strong>, ilma sinu
          vastusteta ja ilma klassikoodita.
        </p>
        <p className="text-ink-soft">
          Lisaks loeme kokku, kui palju lehti avatakse. See lugemine ei pane
          sinu seadmesse küpsist ega jälgi sind teistel veebilehtedel – me näeme
          ainult numbreid, mitte inimesi.
        </p>
      </Card>

      <Card className="flex flex-col gap-3">
        <CardTitle>Õpetaja kohta</CardTitle>
        <p className="text-ink">
          Õpetajast salvestame e-posti aadressi (sellega ta logib sisse) ja
          nime. Paroole ei ole – sisselogimine käib ühekordse lingiga.
          Klassikoodi ennast andmebaasis ei hoita, seal on ainult koodist
          arvutatud räsi.
        </p>
      </Card>

      <Card className="flex flex-col gap-3">
        <CardTitle>Küsimused</CardTitle>
        <p className="text-ink">
          Kirjuta{" "}
          <a
            className="rounded text-brand underline underline-offset-2"
            href="mailto:merlis.pajustik@gmail.com"
          >
            merlis.pajustik@gmail.com
          </a>
          . Vastame ka lapsevanema küsimustele.
        </p>
      </Card>
    </div>
  );
}
