import { defineActivities } from "../../../engine/contract";
import type { ReviewCard, Step } from "../../../engine/contract";
import { formatNumber } from "../../../lib/format";
import { colorTemperatureLabel } from "./display";
import {
  NEUTRAL_MAX_K,
  SLIDERS,
  WARM_MAX_K,
  classifyColorTemperature,
  luminousEfficacy,
  powerForLumens,
  requiredLumens,
} from "./model";

/**
 * Sammud ja kordamiskaardid (docs/MOODULILEPING.md,
 * sisu/MOODUL-lambivalik.md).
 *
 * **Ühtki viljakust, luumenite arvu ega vatti ei ole siia käsitsi kirjutatud** –
 * kõik tulevad `model.ts`-i tehetest η = Φ / P, P = Φ / η ja Φ = S · tihedus
 * (CLAUDE.md reegel 1). Ka teooria tabeli read koostatakse mudeliga, mitte
 * kirjutatud jagatistega: tabel on ühtlasi ekraanil ja ülesannetes, seega peab
 * ühe arvu muutmine kukutama testi, mitte tooma ekraanile vale jagatise.
 * Eestikeelsed värvusesildid tulevad `display.ts`-ist, mitte mudelist.
 *
 * **Ühikud.** Valgusvoog lm, võimsus W, viljakus lm/W, värvustemperatuur K,
 * pindala m². Ühikuteisendusi selles failis EI ole (sisu/MOODUL-lambivalik.md
 * „Füüsika"): iga arv on täpselt selles ühikus, milles ta lambipakendil seisab –
 * ja just see ongi mooduli mõte.
 *
 * **Kolm piiri, mida ükski ülesanne ei ületa** (sisu/MOODUL-lambivalik.md
 * „Piirid"):
 *
 * 1. **Elektriarve, kilovatt-tund ja tasuvusaeg jäävad plokki P6** (moodul
 *    `voimsus-elus`). Vatt on siin ainult lambi tarbitav võimsus pakendil –
 *    arv, mida võrreldakse luumenitega. Ühtki hinda ekraanil ei ole.
 * 2. **Punkt- ja laiendatud allika ARVUTUS jääb moodulisse `valgusallikad`.**
 *    Siin on see eeldus ja jääb sõnaliseks: paljas pirn on väike allikas,
 *    varjundiga lamp laiendatud. Ühtki suhet ei arvutata.
 * 3. **Fotomeetria täies mahus jääb välja.** Ekraanil on luumen ja „luumenit
 *    ruutmeetri kohta"; viimase ametliku nime ütleb ainult õpetajajuhend.
 *    Kandelat, ruuminurka ega värvusesitusindeksit siin ei ole.
 *
 * **Lõkse (`traps`) selles moodulis ei ole ja see on otsus, mitte unustus:**
 * mooduli väärarusaamad on kõik SÕNALISED („vatt on heledus", „kelvin on
 * temperatuur"), mitte kindla vale ARVU kujul. Lõks nõuab teadaolevat valet
 * arvu; väljamõeldud lõksuarv annaks õpilasele sildi, mille väärarusaama tal ei
 * olnud (sama joon mis moodulis `kuu-faasid`).
 */

/** Valgusvoog ekraanile: alati täisarv luumeneid, nagu pakendil. */
const lumens = (value: number): string => formatNumber(value);

/** Võimsus ekraanile: täisarv vatte, nagu pakendil. */
const watts = (value: number): string => formatNumber(value);

/** Viljakus ekraanile: tabeli neli arvu on meelega täisarvud (vt spetsifikatsioon). */
const efficacy = (value: number): string => formatNumber(value);

// --- Lambitabel (teooria, näidis ja harjutused) -----------------------------

/**
 * Poepakendite suurusjärgud, mitte ühestki allikast võetud ülesanne
 * (sisu/MOODUL-lambivalik.md „Allikad"). Arvud on tahtlikult valitud nii, et
 * jagatis tuleb täisarv – tabeli päises on seepärast aus sõna „umbes".
 *
 * `kind` on moodulist `valgusallikad` tulnud liigitus ja SELETAB siin ainult
 * seda, miks viljakus erineb kaheksa korda. Mudel seda ei arvuta.
 *
 * Eksporditud, sest sama nelja lambi arvud on ka hooki joonisel (figures.tsx
 * `lv-poeriiul`): kaks lambitabelit läheksid ühel päeval lahku ja õpilane näeks
 * pakendil üht arvu, tabelis teist. `kelvin` on ainult joonise jaoks – teooria
 * tabelis värvustemperatuuri veergu ei ole, sest seal on jutt viljakusest.
 */
export const LAMPS = [
  { name: "hõõglamp", powerW: 60, lumensLm: 720, kelvin: 2700, kind: "soojuslik" },
  { name: "halogeenlamp", powerW: 42, lumensLm: 630, kelvin: 2800, kind: "soojuslik" },
  { name: "säästulamp", powerW: 15, lumensLm: 810, kelvin: 4000, kind: "külm" },
  { name: "LED-lamp", powerW: 8, lumensLm: 800, kelvin: 2700, kind: "külm" },
] as const;

/** Tabeli rida ekraanile – jagatis tuleb MUDELIST, mitte tekstist. */
function lampRow(lamp: (typeof LAMPS)[number]): string {
  return `${lamp.name}: ${watts(lamp.powerW)} W · ${lumens(lamp.lumensLm)} lm → ${efficacy(
    luminousEfficacy(lamp.lumensLm, lamp.powerW),
  )} lm/W (${lamp.kind} allikas)`;
}

const INCANDESCENT = LAMPS[0];
const CFL = LAMPS[2];
const LED = LAMPS[3];

const INCANDESCENT_EFFICACY = luminousEfficacy(
  INCANDESCENT.lumensLm,
  INCANDESCENT.powerW,
);
const CFL_EFFICACY = luminousEfficacy(CFL.lumensLm, CFL.powerW);
/**
 * LED-i valgusviljakus (100 lm/W).
 *
 * Eksporditud, sest simulatsiooni kastike „Kui palju vatte kulub" arvutab
 * võimsuse SAMA viljakusega – muidu näitaks ekraan üht arvu ja explore-4 õige
 * vastus oleks teine.
 */
export const LED_EFFICACY = luminousEfficacy(LED.lumensLm, LED.powerW);

/** Mitu korda on LED hõõglambist viljakam – teooria ja näidise väide. */
const LED_VS_INCANDESCENT = LED_EFFICACY / INCANDESCENT_EFFICACY;

// --- Ruumid (stsenaariumi arvud, mitte looduskonstandid) --------------------

/**
 * Simulatsiooni nupurida. Pindala ja soovitatav tihedus on STSENAARIUMI arvud
 * (sisu/MOODUL-lambivalik.md): nad tulevad mudelisse argumendina, nii saab
 * õpetaja rääkida ka töökojast ilma mudelit puutumata.
 *
 * Eksporditud samal põhjusel mis {@link LAMPS}: sama neli ruumi on ka
 * simulatsiooni nupureas (Simulation.tsx). Teine loend läheks ühel päeval
 * lahku ja siis küsiks explore-1 arvu, mida ekraanil ei ole.
 */
export const ROOMS = [
  { name: "magamistuba", areaM2: 12, lumensPerM2: 100 },
  { name: "elutuba", areaM2: 18, lumensPerM2: 150 },
  { name: "köögi tööpind", areaM2: 4, lumensPerM2: 300 },
  { name: "õppelaud", areaM2: 2, lumensPerM2: 500 },
] as const;

const BEDROOM = ROOMS[0];
const LIVING_ROOM = ROOMS[1];
const KITCHEN = ROOMS[2];
const DESK = ROOMS[3];

const LIVING_ROOM_LUMENS = requiredLumens(
  LIVING_ROOM.areaM2,
  LIVING_ROOM.lumensPerM2,
);
const KITCHEN_LUMENS = requiredLumens(KITCHEN.areaM2, KITCHEN.lumensPerM2);
const DESK_LUMENS = requiredLumens(DESK.areaM2, DESK.lumensPerM2);
const BEDROOM_LUMENS = requiredLumens(BEDROOM.areaM2, BEDROOM.lumensPerM2);

/** Õppelaua soovitus LED-lampidega (explore-4). */
const DESK_WATTS_LED = powerForLumens(DESK_LUMENS, LED_EFFICACY);
/** Elutoa soovitus LED-lampidega (practice-2) ja hõõglampidega (selgitus). */
const LIVING_ROOM_WATTS_LED = powerForLumens(LIVING_ROOM_LUMENS, LED_EFFICACY);
const LIVING_ROOM_WATTS_INCANDESCENT = powerForLumens(
  LIVING_ROOM_LUMENS,
  INCANDESCENT_EFFICACY,
);
/** Köögi tööpinna soovitus LED-lampidega (kordamiskaart rc-5). */
const KITCHEN_WATTS_LED = powerForLumens(KITCHEN_LUMENS, LED_EFFICACY);

/**
 * Mitu 800 lm lampi läheb elutuppa vaja (explore-2 selgitus).
 *
 * Jagatis on 3,4 – seepärast ütleb vastus „kolmest jääb puudu, täis saab
 * neljaga", mitte ümardatud „kolm".
 */
const LIVING_ROOM_LAMP_COUNT = LIVING_ROOM_LUMENS / LED.lumensLm;

// --- Simulatsiooni algseis ja värvustemperatuurid ---------------------------

/**
 * Liugurite algväärtused. Mõlemad on liuguri võre peal (`SLIDERS`), seega saab
 * õpilane alguskoha alati tagasi – see oli mooduli `varjutused` õppetund.
 *
 * Simulation.tsx impordib needsamad arvud, ei kirjuta neid uuesti: explore-4
 * lõks ON algseisu võimsus (`START_WATTS_LED`), seega kaks eri algväärtust
 * teeksid lõksust vaikselt vale arvu.
 */
export const START_LUMENS = 800;
export const START_KELVIN = 2700;
/**
 * Algseisu (ühe tavalise LED-lambi) võimsus – explore-4 lõks.
 *
 * See on arv, mis seisab simulatsiooni kastikeses ENNE seda, kui õpilane
 * valgusvoo liugurit puudutab. Vt `WATT_TOLERANCE`.
 */
const START_WATTS_LED = powerForLumens(START_LUMENS, LED_EFFICACY);
/** Töölaua ja klassiruumi tavaline lamp – explore-3 teine seis. */
const NEUTRAL_KELVIN = 4000;
/** Kõige sinakam müügilamp – „päevavalguslamp" (practice-3, teooria). */
const DAYLIGHT_KELVIN = 6500;

const START_LABEL = colorTemperatureLabel(classifyColorTemperature(START_KELVIN));
const NEUTRAL_LABEL = colorTemperatureLabel(
  classifyColorTemperature(NEUTRAL_KELVIN),
);
const DAYLIGHT_LABEL = colorTemperatureLabel(
  classifyColorTemperature(DAYLIGHT_KELVIN),
);

/**
 * Lugemistolerantsid, MITTE mõõtemääramatus: simulatsioon on ideaalne, aga
 * õpilane loeb kastikesest arvu ja tipib käsitsi (sisu/MOODUL-lambivalik.md
 * „explore").
 */
/** Valgusvoog: liuguri samm on 100 lm, seega pool sammu. */
const LUMEN_TOLERANCE = { mode: "absolute", value: 50 } as const;
/**
 * Võimsus: 10 W ja 8 W peavad jääma teineteisest KINDLALT eraldi.
 *
 * Spetsifikatsioonis oli 2 W, aga see arv teeb explore-4 hambutuks: algseisus
 * (800 lm) seisab kastikeses „8 W" ja ±2 W juures saaks liigutamata liuguriga
 * mahakirjutatud 8 vastuseks „Õige!" – täpselt see viga, mida ülesanne püüdma
 * peaks (CodeRabbiti leid, samm 4.1ooo). Vastus on täisarv ja loetakse
 * kastikesest, seega 1 W on piisavalt lahke lugemistolerants.
 */
const WATT_TOLERANCE = { mode: "absolute", value: 1 } as const;
/** Elutoa 27 W – suurem arv, veidi laiem lugemisvahemik. */
const BIG_WATT_TOLERANCE = { mode: "absolute", value: 3 } as const;
/** Viljakus: 54 lm/W peab jääma nii 100 kui ka 12 lm/W-st kaugele. */
const EFFICACY_TOLERANCE = { mode: "absolute", value: 2 } as const;

const steps: Step[] = [
  {
    type: "hook",
    id: "hook-1",
    // Joonis näitab AINULT pakendite arve. Millist neist vaadata, ütlevad
    // teooria ja simulatsioon – hook ei tohi vastust ette öelda.
    figure: "lv-poeriiul",
    title: "Neli lampi, igal kolm arvu",
    body: [
      "Poeriiulil on neli lambikarpi. Igal karbil on kolm arvu ja kaks neist ei ütle heleduse kohta mitte midagi.",
      "Sa tahad õppelaua kohale lampi, mis annab piisavalt valgust. Millist arvu sa vaatad?",
      `Ja miks on ${watts(LED.powerW)} W lambi peal kirjas „vastab ${watts(
        INCANDESCENT.powerW,
      )} W lambile", kui ${watts(LED.powerW)} ja ${watts(
        INCANDESCENT.powerW,
      )} ei ole ligilähedaseltki sama?`,
    ],
  },
  {
    type: "theory",
    id: "theory-1",
    title: "Kolm arvu pakendil",
    figure: "lv-kolm-varvust",
    body: [
      `Luumen (lm) – kui palju valgust. See on ainus arv, mis heleduse kohta midagi ütleb. ${lumens(
        LED.lumensLm,
      )} lm on tavalise kodulambi valgusvoog.`,
      "Vatt (W) – kui palju elektrit lamp tarbib. Vatt EI ole heledus. Enne LED-e olid poes ainult hõõglambid ja siis tähendas „60 W\" ka alati sama heledust – sellest jäi harjumus, mis täna eksitab.",
      "Valgusviljakus = lm / W – kui palju valgust ühe vati kohta. Siin lähevad lambitüübid lahku (arvud on umbkaudsed):",
      ...LAMPS.map(lampRow),
      `Hõõglamp teeb valgust nii, et kuumutab niidi hõõguma – enamik energiast lahkub soojusena. LED teeb valgust ilma hõõgumata (moodulist „Valgusallikad": külm valgusallikas). Sellest tulebki umbes ${formatNumber(
        LED_VS_INCANDESCENT,
      )}-kordne vahe. „Vastab ${watts(
        INCANDESCENT.powerW,
      )} W lambile" tähendab: annab sama palju LUUMENEID kui vana ${watts(
        INCANDESCENT.powerW,
      )} W hõõglamp.`,
      `Kelvin (K) – mis värvi valgus. Arv ütleb, millise temperatuuriga hõõguv keha annaks sellist valgust. See EI ole lambi enda temperatuur – ${formatNumber(
        DAYLIGHT_KELVIN,
      )} K LED on käega katsudes leige.`,
      `Alla ${formatNumber(WARM_MAX_K)} K on ${START_LABEL} (kollakas, nagu hõõglamp), ${formatNumber(
        WARM_MAX_K,
      )}…${formatNumber(NEUTRAL_MAX_K)} K ${NEUTRAL_LABEL}, üle ${formatNumber(
        NEUTRAL_MAX_K,
      )} K ${DAYLIGHT_LABEL} (sinakas, nagu pilves päev). Tähelepanu: nimi ja arv käivad vastupidi – „soe" valgus on VÄIKE arv.`,
      `Sama valgus, teine lamp: elutoa ${lumens(
        LIVING_ROOM_LUMENS,
      )} lm tuleb LED-idega ${watts(LIVING_ROOM_WATTS_LED)} W-ga ja hõõglampidega ${watts(
        LIVING_ROOM_WATTS_INCANDESCENT,
      )} W-ga – täpselt sama valguse eest.`,
      `Kui palju luumeneid tuppa vaja on: korruta ruumi pindala sellega, kui palju valgust seal tegevuse jaoks vaja on. ${ROOMS.map(
        (room) => `${room.name} umbes ${lumens(room.lumensPerM2)}`,
      ).join(", ")} luumenit ruutmeetri kohta.`,
      "Neljas asi, mida pakend ei ütle: kas lamp jääb paljaks või varjundi taha. Paljas pirn on väike allikas – teravad varjud ja pimestav täpp silmas. Varjund või hajuti teeb temast laiendatud allika: varjud pehmed, ei pimesta (moodulist „Valgusallikad\").",
    ],
  },
  {
    type: "predict",
    id: "predict-1",
    title: "Paku oma ennustus",
    body: [
      `Kaks lampi kõrvuti: vasakul vana ${watts(INCANDESCENT.powerW)} W hõõglamp, paremal ${watts(
        LED.powerW,
      )} W LED-lamp.`,
    ],
    questions: [
      {
        kind: "choice",
        id: "predict-1",
        prompt: "Kumb annab rohkem valgust?",
        options: [
          {
            id: "hoolamp",
            text: `Hõõglamp – ${watts(INCANDESCENT.powerW)} W on ju palju rohkem kui ${watts(
              LED.powerW,
            )} W`,
            correct: false,
            misconception: "vatt-on-heledus",
          },
          {
            id: "led",
            text: `LED – tema valgusvoog on ${lumens(LED.lumensLm)} lm, hõõglambil ${lumens(
              INCANDESCENT.lumensLm,
            )} lm`,
            correct: true,
          },
          {
            id: "vordselt",
            text: `Täpselt võrdselt – muidu ei kirjutaks pakendile „vastab ${watts(
              INCANDESCENT.powerW,
            )} W lambile"`,
            correct: false,
            misconception: "vastab-on-tapne",
          },
        ],
      },
      {
        kind: "text",
        id: "predict-2",
        prompt: "Miks sa nii arvad?",
        minWords: 5,
      },
    ],
  },
  {
    type: "explore",
    id: "explore-1",
    title: "Katseta toa valgustusega",
    body: [
      "Pilt on toa läbilõige: põrand, tagasein, laes valgusti ning all laud ja tool. Nupureaga valid ruumi – iga ruum toob kaasa oma pindala ja oma soovituse.",
      `Kaks liugurit: valgusvoog ${lumens(SLIDERS.lumensLm.min)}…${lumens(
        SLIDERS.lumensLm.max,
      )} lm ja värvustemperatuur ${formatNumber(SLIDERS.kelvin.min)}…${formatNumber(
        SLIDERS.kelvin.max,
      )} K. Alguses on need ${lumens(START_LUMENS)} lm ja ${formatNumber(
        START_KELVIN,
      )} K – tavalise kodulambi arvud.`,
      "Ekraanil on korraga kaks asja: SINU valik ja SOOVITUS sellele ruumile. Kui valgusvoog jääb soovitusest alla, on toa joonisel näha hämarus ja kastikeses on see ka sõnadega kirjas.",
    ],
    questions: [
      {
        kind: "numeric",
        id: "explore-1",
        prompt: `Vajuta „${LIVING_ROOM.name}" (${formatNumber(
          LIVING_ROOM.areaM2,
        )} m²). Mitu luumenit sinna soovitatakse?`,
        hints: [
          "Korruta pindala ja soovitus.",
          "Arv on kastikeses „Soovitatav valgusvoog\".",
        ],
        unit: "lm",
        tolerance: LUMEN_TOLERANCE,
        answer: LIVING_ROOM_LUMENS,
      },
      {
        kind: "choice",
        id: "explore-2",
        prompt: `Jäta ${LIVING_ROOM.name} ja lohista valgusvoog ${lumens(
          START_LUMENS,
        )} lm peale – see on üks tavaline LED-lamp. Mis juhtub?`,
        hints: [
          `Võrdle kastikesi „Sinu valik" ja „Soovitatav valgusvoog": ${lumens(
            LIVING_ROOM_LUMENS,
          )} lm ja ${lumens(START_LUMENS)} lm.`,
        ],
        options: [
          {
            id: "hasti-valgustatud",
            text: `Tuba on hästi valgustatud, ${lumens(START_LUMENS)} lm on palju`,
            correct: false,
            misconception: "uks-lamp-piisab",
          },
          {
            id: "hamar",
            text: `Tuba jääb hämaraks – ühest lambist jääb väheks, vaja oleks nelja (${lumens(
              LIVING_ROOM_LUMENS,
            )} / ${lumens(LED.lumensLm)} ≈ ${formatNumber(LIVING_ROOM_LAMP_COUNT, 1)})`,
            correct: true,
          },
          {
            // Sildita vale variant: „liiga hele" ei ole ükski mooduli
            // väärarusaamadest – see on lihtsalt kastikeste vale lugemine.
            id: "liiga-hele",
            text: "Tuba on liiga hele",
            correct: false,
          },
        ],
      },
      {
        kind: "choice",
        id: "explore-3",
        prompt: `Vajuta „${DESK.name}" ja sea värvustemperatuur ${formatNumber(
          START_KELVIN,
        )} K peale. Mis silt ilmub? Sea siis ${formatNumber(NEUTRAL_KELVIN)} K.`,
        hints: ["Silt on kastikeses „Valguse värvus\"."],
        options: [
          {
            id: "kulm-esimene",
            text: `${formatNumber(START_KELVIN)} K on „${DAYLIGHT_LABEL}"`,
            correct: false,
            misconception: "soe-tahendab-suurt-arvu",
          },
          {
            id: "soe-ja-neutraalne",
            text: `${formatNumber(START_KELVIN)} K on „${START_LABEL}", ${formatNumber(
              NEUTRAL_KELVIN,
            )} K on „${NEUTRAL_LABEL}"`,
            correct: true,
          },
          {
            id: "molemad-neutraalsed",
            text: `Mõlemad on „${NEUTRAL_LABEL}"`,
            correct: false,
            misconception: "iga-valgus-sobib-igale-poole",
          },
        ],
      },
      {
        kind: "numeric",
        id: "explore-4",
        prompt: `Jäta ${DESK.name} (soovitus ${lumens(
          DESK_LUMENS,
        )} lm) ja sea valgusvoog soovitusega võrdseks. Mitu vatti kulub, kui kasutad LED-lampi?`,
        hints: [
          `LED annab ${efficacy(LED_EFFICACY)} lm ühest vatist.`,
          `${lumens(DESK_LUMENS)} / ${efficacy(LED_EFFICACY)}`,
        ],
        unit: "W",
        tolerance: WATT_TOLERANCE,
        answer: DESK_WATTS_LED,
        // Lõks: kes valgusvoogu ei liigutanud, kirjutab kastikesest maha
        // algseisu võimsuse. Arv käib läbi sama mudeli, seega jääb ta õigeks
        // ka siis, kui algseis kunagi muutub.
        traps: [
          {
            answer: START_WATTS_LED,
            misconception: "uks-lamp-piisab",
            feedback: `See on ${lumens(
              START_LUMENS,
            )} lm lambi võimsus ehk algseis – üks tavaline LED-lamp. Õppelauale soovitatakse ${lumens(
              DESK_LUMENS,
            )} lm: lohista valgusvoog soovitusega võrdseks ja loe uuesti.`,
          },
        ],
      },
    ],
  },
  {
    type: "practice",
    id: "practice-1",
    title: "Proovi ise järele",
    // Näidis on LAHENDATUD ülesanne, mitte küsimus (docs/MOODULILEPING.md).
    worked: {
      prompt: `Hõõglamp: ${watts(INCANDESCENT.powerW)} W ja ${lumens(
        INCANDESCENT.lumensLm,
      )} lm. LED-lamp: ${watts(LED.powerW)} W ja ${lumens(
        LED.lumensLm,
      )} lm. Kumb teeb elektrist rohkem valgust?`,
      solution: [
        `Hõõglamp: ${lumens(INCANDESCENT.lumensLm)} / ${watts(
          INCANDESCENT.powerW,
        )} = ${efficacy(INCANDESCENT_EFFICACY)} lm/W.`,
        `LED: ${lumens(LED.lumensLm)} / ${watts(LED.powerW)} = ${efficacy(
          LED_EFFICACY,
        )} lm/W.`,
        `${efficacy(LED_EFFICACY)} / ${efficacy(INCANDESCENT_EFFICACY)} ≈ ${formatNumber(
          LED_VS_INCANDESCENT,
        )}.`,
      ],
      answer: `LED teeb samast elektrist umbes ${formatNumber(
        LED_VS_INCANDESCENT,
      )} korda rohkem valgust. Põhjus: hõõglamp on soojuslik allikas – valgus tekib hõõgumisest ja enamik energiast lahkub soojusena. LED on külm allikas.`,
    },
    questions: [
      {
        // Osaline: tehe on ees, vastus tuleb ise.
        kind: "numeric",
        id: "practice-1",
        prompt: `Säästulamp tarbib ${watts(CFL.powerW)} W ja annab ${lumens(
          CFL.lumensLm,
        )} lm. Kui suur on tema valgusviljakus? ${lumens(CFL.lumensLm)} / ${watts(
          CFL.powerW,
        )} = ___`,
        hints: ["Jaga luumenid vattidega."],
        unit: "lm/W",
        tolerance: EFFICACY_TOLERANCE,
        answer: CFL_EFFICACY,
      },
      {
        // Iseseisev: sama valgus, teine lambitüüp.
        kind: "numeric",
        id: "practice-2",
        prompt: `Elutuppa on vaja ${lumens(
          LIVING_ROOM_LUMENS,
        )} lm. Mitu vatti kulub, kui valid LED-lambid (${efficacy(
          LED_EFFICACY,
        )} lm/W)?`,
        hints: [
          "Jaga luumenid viljakusega.",
          `${lumens(LIVING_ROOM_LUMENS)} / ${efficacy(LED_EFFICACY)}`,
        ],
        unit: "W",
        tolerance: BIG_WATT_TOLERANCE,
        answer: LIVING_ROOM_WATTS_LED,
      },
      {
        // Iseseisev: mida kelvin ütleb ja mida mitte.
        kind: "choice",
        id: "practice-3",
        prompt: `Pakendil on kirjas ${formatNumber(DAYLIGHT_KELVIN)} K. Mida see tähendab?`,
        hints: [
          "Kelvin ei mõõda, KUI PALJU valgust lamp annab (see on luumenite töö) ega tema pinna temperatuuri – ta ütleb, milline VÄRV valgusel on.",
        ],
        options: [
          {
            id: "lamp-lahebki-kuumaks",
            text: `Lamp läheb tööl ${formatNumber(DAYLIGHT_KELVIN)} kraadi kuumaks`,
            correct: false,
            misconception: "kelvin-on-lambi-temperatuur",
          },
          {
            id: "sinakas",
            text: `Lambi valgus on sinakas – „${DAYLIGHT_LABEL}", nagu pilves päev`,
            correct: true,
          },
          {
            id: "heledus",
            text: `Lamp annab ${formatNumber(DAYLIGHT_KELVIN)} luumenit valgust`,
            correct: false,
            misconception: "kelvin-on-heledus",
          },
        ],
      },
      {
        // Ülekanne, mitu õiget: kogu moodul korraga ühe ostuotsuse sees.
        kind: "choice",
        id: "practice-4",
        prompt: `Mis sobib ${formatNumber(
          BEDROOM.areaM2,
        )} m² magamistoa laevalgustiks?`,
        hints: [
          "Magamistuba on puhkamise koht: sobib soe, hajutatud valgus õiges koguses – mitte kõige heledam ega kõige sinakam variant.",
        ],
        multiple: true,
        shuffle: true,
        options: [
          {
            id: "1200-lm",
            text: `Umbes ${lumens(BEDROOM_LUMENS)} lm kogu toa peale`,
            correct: true,
          },
          {
            id: "soe-valgus",
            text: `${formatNumber(START_KELVIN)} K ${START_LABEL} valgus`,
            correct: true,
          },
          {
            id: "varjundiga",
            text: "Varjundiga või hajutiga valgusti",
            correct: true,
          },
          {
            id: "kulm-valgus",
            text: `${formatNumber(DAYLIGHT_KELVIN)} K ${DAYLIGHT_LABEL} valgus`,
            correct: false,
            misconception: "iga-valgus-sobib-igale-poole",
          },
          {
            id: "paljas-pirn",
            text: "Paljas pirn ilma varjundita",
            correct: false,
            misconception: "paljas-pirn-sobib",
          },
          {
            id: "3000-lm",
            text: `${lumens(SLIDERS.lumensLm.max)} lm, sest mida heledam, seda parem`,
            correct: false,
            misconception: "rohkem-on-alati-parem",
          },
        ],
      },
    ],
  },
  {
    type: "exit",
    id: "exit-1",
    title: "Väljumispilet",
    questions: [
      {
        kind: "choice",
        id: "exit-1",
        prompt:
          "Millist arvu vaatad pakendil, kui tahad teada, kui palju valgust lamp annab?",
        hints: ["Vatt näitab kulu, kelvin näitab värvi – kumbki neist ei ole valguse KOGUS."],
        options: [
          {
            id: "vatid",
            text: "Vatte",
            correct: false,
            misconception: "vatt-on-heledus",
          },
          { id: "luumenid", text: "Luumeneid", correct: true },
          {
            id: "kelvinid",
            text: "Kelvineid",
            correct: false,
            misconception: "kelvin-on-heledus",
          },
        ],
      },
      {
        kind: "numeric",
        id: "exit-2",
        prompt: `Köögi tööpind on ${formatNumber(
          KITCHEN.areaM2,
        )} m² ja sinna soovitatakse ${lumens(
          KITCHEN.lumensPerM2,
        )} lm ruutmeetri kohta. Mitu luumenit on kokku vaja?`,
        hints: ["Korruta pindala soovitusega."],
        unit: "lm",
        tolerance: LUMEN_TOLERANCE,
        answer: KITCHEN_LUMENS,
      },
      {
        kind: "text",
        id: "exit-3",
        prompt: `Sõber ütleb: „Ma ei osta ${formatNumber(
          DAYLIGHT_KELVIN,
        )} K lampi, see läheb liiga kuumaks." Mis sa talle vastad?`,
        minWords: 10,
      },
    ],
  },
];

/**
 * Kordamiskaardid (docs/MOODULILEPING.md „activities.ts – kordamiskaardid",
 * sisu/MOODUL-lambivalik.md „Kordamiskaardid").
 */
const reviewCards: ReviewCard[] = [
  {
    id: "rc-1",
    type: "concept",
    question: "Milline arv lambipakendil ütleb, kui palju valgust lamp annab?",
    answer:
      "Valgusvoog luumenites (lm). Vatt ütleb ainult, kui palju elektrit lamp tarbib.",
  },
  {
    id: "rc-2",
    type: "calc",
    question: `Hõõglamp: ${watts(INCANDESCENT.powerW)} W ja ${lumens(
      INCANDESCENT.lumensLm,
    )} lm. LED: ${watts(LED.powerW)} W ja ${lumens(
      LED.lumensLm,
    )} lm. Kumb teeb elektrist rohkem valgust ja mitu korda?`,
    answer: `Hõõglamp ${lumens(INCANDESCENT.lumensLm)} / ${watts(
      INCANDESCENT.powerW,
    )} = ${efficacy(INCANDESCENT_EFFICACY)} lm/W, LED ${lumens(LED.lumensLm)} / ${watts(
      LED.powerW,
    )} = ${efficacy(LED_EFFICACY)} lm/W – LED umbes ${formatNumber(
      LED_VS_INCANDESCENT,
    )} korda viljakam.`,
  },
  {
    id: "rc-3",
    type: "explain",
    question: "Miks on hõõglambi valgusviljakus nii väike?",
    answer:
      "Hõõglamp on soojuslik valgusallikas: valgus tekib hõõgumisest ja enamik energiast lahkub soojusena. LED on külm allikas – ta teeb valgust ilma hõõgumata.",
  },
  {
    id: "rc-4",
    type: "concept",
    question: `Mida ütleb pakendil olev arv ${formatNumber(
      START_KELVIN,
    )} K või ${formatNumber(DAYLIGHT_KELVIN)} K?`,
    answer: `Valguse värvi: alla ${formatNumber(WARM_MAX_K)} K ${START_LABEL} (kollakas), ${formatNumber(
      WARM_MAX_K,
    )}–${formatNumber(NEUTRAL_MAX_K)} K ${NEUTRAL_LABEL}, üle ${formatNumber(
      NEUTRAL_MAX_K,
    )} K ${DAYLIGHT_LABEL} (sinakas). See EI ole lambi temperatuur.`,
  },
  {
    id: "rc-5",
    type: "transfer",
    question: `Kuidas leiad, mitu luumenit on ${formatNumber(
      KITCHEN.areaM2,
    )} m² köögi tööpinnale vaja, kui soovitus on ${lumens(
      KITCHEN.lumensPerM2,
    )} lm ruutmeetri kohta?`,
    answer: `Korruta pindala soovitusega: ${formatNumber(KITCHEN.areaM2)} · ${lumens(
      KITCHEN.lumensPerM2,
    )} = ${lumens(KITCHEN_LUMENS)} lm. LED-idega (${efficacy(
      LED_EFFICACY,
    )} lm/W) kulub selleks ${watts(KITCHEN_WATTS_LED)} W.`,
  },
];

export const activities = defineActivities({ steps, reviewCards });
