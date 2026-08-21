import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { SimulationProps } from "../../../engine/simulationFeatures";
import { Button } from "../../../ui/Button";
import { SliderField } from "../../../ui/SliderField";
import { formatNumber } from "../../../lib/format";
import {
  SLIDERS,
  angleFromOffsetDeg,
  offsetAtDistanceM,
  retroreflectionGain,
} from "./model";

/**
 * Helkuri simulatsioon – ainult VAADE (sisu/MOODUL-helkur.md, samm „explore";
 * docs/MOODULILEPING.md „Simulation.tsx – reeglid").
 *
 * Siin ei ole ühtegi füüsikavalemit: plekki raadius, silmade nurk ja võimendus
 * tulevad `model.ts`-ist (CLAUDE.md reegel 1). Selles failis on ainult
 * PAIGUTUS – meetrid piksliteks, auto kuju ja siltide kohad.
 *
 * VAADE ON PEALT maanteele: all auto, üleval tee ääres jalakäija helkuriga.
 *
 * KAKS MÕÕTKAVA JA MIKS NII. Korraga on pildil kaks täiesti eri suurusjärku:
 * kaugus 10…150 m ja plekk 0,03…10,5 m. Ühe mõõtkavaga neid kõrvuti ei näita:
 * kui 150 m mahub ekraanile, on kõige kitsam plekk sajandik pikslit.
 *
 * 1. LAIUS on PÜSIVAS mõõtkavas (1 m = {@link LATERAL_PX_PER_METRE} px).
 *    Püsiv peab ta olema seepärast, et just laiuse muutumine ONGI selle sammu
 *    avastus – plekiga kaasa kohanduv mõõtkava jätaks plekki ekraanil iga
 *    liuguriseisu juures ühesuuruseks (sama otsus ja sama põhjus mis
 *    moodulites `noguspeegel` ja `noguspeegli-rakendused`). Mõõtkava on
 *    valitud kõige laiema plekki järgi, mis liuguritega saavutatav on:
 *    ω = 2° ja L = 150 m annavad raadiuse 5,2 m ehk 115 px, mis mahub
 *    maantee servade vahele ära.
 * 2. PIKKUS (helkurist autoni) on ekraanil alati ÜHESUGUNE, olenemata sellest,
 *    kas L on 10 m või 150 m – tema arv on mõõdujoone juures kirjas.
 *
 * Sellel on aus hind ja ta on ka ekraanil välja öeldud: JOONISEL OLEVAD NURGAD
 * EI OLE PÄRIS NURGAD. Päris ω = 0,5° oleks joonisel silmale nähtamatu kalle;
 * koonus on siin meelega lahti venitatud. Päris arvud on kastikestes joonise
 * all, mitte joonise nurkades – ükski ülesanne ei palu nurka jooniselt mõõta.
 *
 * KUMMA ESITULE PLEKKI ME VAATAME. Autol on kaks esituld ja kumbki saadab
 * helkurile oma valguse – tagasi tuleb seega kaks plekki, kumbki oma tule
 * ümber. Joonisel on JUHIPOOLSE tule plekk, sest ainult tema juures on juhi
 * silmad (0,5 m kõrval, teisel pool tuld sõidab kaasreisija). Seepärast on
 * telg – helkur, juhipoolne tuli ja plekki kese – üks ja sama püstjoon.
 *
 * IDEALISEERINGUD, mida vaade juurde annab (mudeli omad on model.ts-is):
 * juhi silmad on tuledega samal joonel (päris autos on nad poolteist meetrit
 * tagapool – ristsuunas, mis siin loeb, see midagi ei muuda) ja auto mõõdud
 * on tavalise sõiduauto omad.
 *
 * SIMULATSIOONIL EI OLE LISAVÕIMALUSI: muudetavaid suurusi on kaks (hajuvus ja
 * kaugus) ehk täpselt nii palju, kui moodulileping korraga lubab, seega ei ole
 * explore-sammul `simulation.unlocks` kirjet.
 */

// --- Paigutus (SVG kasutajaühikud, y kasvab ALLA) --------------------------

const VIEW = { width: 360, height: 420 };

/**
 * Laiuse mõõtkava: 1 m = 22 px. Püsiv (vt faili päis).
 *
 * Kõige laiem plekk (ω = 2°, L = 150 m) on raadiusega 5,24 m ehk 115 px –
 * teljest vasakule jääb siis x = 65 ja maantee vasak serv on x = 40, seega ei
 * jää ükski plekk ekraanist välja.
 */
const LATERAL_PX_PER_METRE = 22;

/** Telg: helkur, juhipoolne esituli ja tagasituleva plekki kese on ühel joonel. */
const AXIS_X = 180;

const REFLECTOR_Y = 52;
const HEADLIGHT_Y = 330;

/** Plekki mõõdujoon käib auto ALT läbi – seal ei ole kiirte ega auto ees. */
const SPOT_MEASURE_Y = 392;
const MEASURE_TICK = 5;

/** Maantee servad. Kõige laiem plekk (65…295) jääb nende vahele. */
const ROAD = { left: 40, right: 322 };

/**
 * Juhi silmade kaugus esitulest (m).
 *
 * Miks siin, mitte model.ts konstandina: Päikese nurk on looduskonstant, auto
 * mõõt on STSENAARIUMI arv (sisu/MOODUL-helkur.md „Füüsika"). Sama arv on
 * samal põhjusel ka activities.ts-is – kumbki fail annab ta mudelile
 * argumendina sisse.
 */
const EYE_OFFSET_M = 0.5;

/** Auto mõõdud meetrites, teljest (= juhipoolsest tulest) paremale. */
const CAR = {
  /** Kere serv jääb juhipoolsest tulest natuke vasakule. */
  leftM: -0.25,
  /** Teine esituli on 1,4 m kaugusel – tavalise sõiduauto tulede vahe. */
  otherLightM: 1.4,
  rightM: 1.65,
  lengthPx: 42,
};

/** Liugurite algseis (sisu/MOODUL-helkur.md „explore"). */
const DEFAULT_SPREAD_DEG = 0.5;
const DEFAULT_DISTANCE_M = 100;

/** Meeter teljest paremale (negatiivne = vasakule) → SVG x. */
function axisX(offsetM: number): number {
  return AXIS_X + offsetM * LATERAL_PX_PER_METRE;
}

/** Meeter → pikslid (ainult laiuses; pikkusel ei ole mõõtkava, vt faili päis). */
function lateralPx(offsetM: number): number {
  return offsetM * LATERAL_PX_PER_METRE;
}

/** Meeter ekraanile: sama üks koht peale koma, mis ülesannete tekstis. */
const metres = (value: number): string => formatNumber(value, 1);

/** Nurk ekraanile: kaks kohta peale koma – 0,29° ja 1,43° on selle mooduli arvud. */
const degrees = (value: number): string => formatNumber(value, 2);

/**
 * Võimendus ekraanile: kaks tüvenumbrit ja alati sõnaga „umbes".
 *
 * Idealiseering 6 (model.ts): 26 000 on SUURUSJÄRK, mitte mõõdetud väärtus.
 * Sama teisendus ja sama põhjendus on activities.ts-is – kordus on kolm rida
 * ja ta hoiab ära selle, et vaade impordiks õppesisu (või vastupidi).
 */
const gainText = (value: number): string => {
  const magnitude = 10 ** (Math.floor(Math.log10(value)) - 1);
  return formatNumber(Math.round(value / magnitude) * magnitude);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- ühine signatuur (ModulePage annab prop alati kaasa), moodulil ei ole unlock-i.
export function Simulation(_props: Partial<SimulationProps> = {}) {
  const [spreadDeg, setSpreadDeg] = useState<number>(DEFAULT_SPREAD_DEG);
  const [distanceM, setDistanceM] = useState<number>(DEFAULT_DISTANCE_M);
  const spreadSliderId = useId();
  const distanceSliderId = useId();

  // Ainus koht, kus füüsika sisse tuleb – kõik neli arvu on mudelist.
  const spotRadiusM = offsetAtDistanceM(spreadDeg, distanceM);
  const spotWidthM = 2 * spotRadiusM;
  const eyeAngleDeg = angleFromOffsetDeg(EYE_OFFSET_M, distanceM);
  const gain = retroreflectionGain(spreadDeg);
  /**
   * Kas plekk ulatub silmadeni: koonuse pool-avanurk ω vastu silmade nurka.
   *
   * See on üks võrdlusmärk ja tema koht on siin, mitte mudelis
   * (sisu/MOODUL-helkur.md „Miks EI ole funktsiooni „kas valgus jõuab silma"").
   * Nurki võrreldakse, mitte meetreid – kumbki annab sama vastuse, aga nurgad
   * on need, mis kastikestes kõrvuti seisavad.
   */
  const reachesEyes = spreadDeg >= eyeAngleDeg;

  const spotRadiusPx = lateralPx(spotRadiusM);
  const eyeX = axisX(EYE_OFFSET_M);
  const otherLightX = axisX(CAR.otherLightM);

  const reset = () => {
    setSpreadDeg(DEFAULT_SPREAD_DEG);
    setDistanceM(DEFAULT_DISTANCE_M);
  };

  return (
    <div className="flex flex-col gap-5">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        role="img"
        // Kirjeldus ei korda liugurite arve (ekraanilugeja loeks siis iga
        // liuguriliigutuse peale terve lause uuesti ette) – arvud on
        // kastikestes joonise all. Ta ütleb, MIS pildil on ja mis on päris ning
        // ideaalse helkuri vahe, sest just see vahe on kogu samm.
        aria-label="Pealtvaade pimedale maanteele. All on auto kahe esitulega ja juhi silmadega, mis on juhipoolsest tulest pool meetrit kõrval. Üleval tee ääres seisab jalakäija, kellel on rinnal helkur. Autotuledelt läheb helkurile valgus. Helkurilt tuleb tagasi kaks asja korraga: laienev päris koonus, mille plekk auto juures on mõõdujoone ja arvuga näidatud, ning õhem katkendlik ideaalse helkuri kiir, mis läheb täpselt tuledesse tagasi. Kas plekk katab juhi silmad või jääb neist ilma, on kirjas kastikestes joonise all."
        className="w-full rounded-2xl border border-line bg-white"
      >
        {/* ---- Maantee ---- */}
        <rect
          x={ROAD.left}
          y={0}
          width={ROAD.right - ROAD.left}
          height={VIEW.height}
          className="fill-line"
          fillOpacity={0.35}
        />
        <g className="stroke-line" strokeWidth={2}>
          <line x1={ROAD.left} y1={0} x2={ROAD.left} y2={VIEW.height} />
          <line x1={ROAD.right} y1={0} x2={ROAD.right} y2={VIEW.height} />
        </g>

        {/* ---- Autotulede valgus helkurile ----
            Pehme kolmnurk mõlemalt tulelt helkurile, mitte kiirte kimp: seda,
            KUIDAS valgus helkuri sees kahelt peeglilt tagasi pöördub, näitab
            teooriajoonis (figures.tsx), mitte see pilt. */}
        <polygon
          points={`${AXIS_X},${REFLECTOR_Y} ${AXIS_X},${HEADLIGHT_Y} ${otherLightX},${HEADLIGHT_Y}`}
          className="fill-teacher"
          fillOpacity={0.16}
        />

        {/* ---- Tagasitulev PÄRIS koonus ----
            Servad on katkendjoon ja täidis heleteal – värv ei ole ainus info
            kandja (DISAINIJUHIS), mustri ja sildi järgi on ta ideaalsest
            eristatav ka mustvalgel projektoril. */}
        <polygon
          points={`${AXIS_X},${REFLECTOR_Y} ${AXIS_X + spotRadiusPx},${HEADLIGHT_Y} ${AXIS_X - spotRadiusPx},${HEADLIGHT_Y}`}
          className="fill-brand"
          fillOpacity={0.16}
        />
        <g className="stroke-brand" strokeWidth={1.5} strokeDasharray="6 4">
          <line
            x1={AXIS_X}
            y1={REFLECTOR_Y}
            x2={AXIS_X + spotRadiusPx}
            y2={HEADLIGHT_Y}
          />
          <line
            x1={AXIS_X}
            y1={REFLECTOR_Y}
            x2={AXIS_X - spotRadiusPx}
            y2={HEADLIGHT_Y}
          />
        </g>

        {/* ---- Ideaalse helkuri kiir: hajuvuseta, täpselt tuledesse tagasi ---- */}
        <line
          x1={AXIS_X}
          y1={REFLECTOR_Y}
          x2={AXIS_X}
          y2={HEADLIGHT_Y}
          className="stroke-info"
          strokeWidth={2}
          strokeDasharray="2 4"
        />

        {/* ---- Plekk auto juures ----
            Pealtvaates on ringikujulisest plekist näha ainult tema laius,
            seega madal ellips. Kitsa koonuse juures on ta ekraanil peaaegu
            joon – ja see ongi aus pilt, sest just seda ülesanne 2 küsib. */}
        <ellipse
          cx={AXIS_X}
          cy={HEADLIGHT_Y}
          rx={spotRadiusPx}
          ry={6}
          className="fill-brand"
          fillOpacity={0.45}
        />

        {/* ---- Auto ---- */}
        <rect
          x={axisX(CAR.leftM)}
          y={HEADLIGHT_Y}
          width={lateralPx(CAR.rightM - CAR.leftM)}
          height={CAR.lengthPx}
          rx={6}
          className="fill-white stroke-ink"
          strokeWidth={2}
        />
        {/* Kaks esituld. Juhipoolne on teljel – tema ümber tuleb plekk tagasi. */}
        <g className="fill-teacher stroke-ink" strokeWidth={1.5}>
          <circle cx={AXIS_X} cy={HEADLIGHT_Y} r={4.5} />
          <circle cx={otherLightX} cy={HEADLIGHT_Y} r={4.5} />
        </g>
        {/* Juhi silmad: kaks väikest täppi tulede joonel, 0,5 m küljele. */}
        <g className="fill-ink">
          <circle cx={eyeX - 3} cy={HEADLIGHT_Y + 10} r={2.5} />
          <circle cx={eyeX + 3} cy={HEADLIGHT_Y + 10} r={2.5} />
        </g>
        {/* Silmade ja tule vaheline mõõt – see 0,5 m on kogu mooduli teine pool. */}
        <g className="stroke-ink-soft" strokeWidth={1.5}>
          <line x1={AXIS_X} y1={HEADLIGHT_Y - 14} x2={eyeX} y2={HEADLIGHT_Y - 14} />
          <line
            x1={AXIS_X}
            y1={HEADLIGHT_Y - 14 - MEASURE_TICK}
            x2={AXIS_X}
            y2={HEADLIGHT_Y - 14 + MEASURE_TICK}
          />
          <line
            x1={eyeX}
            y1={HEADLIGHT_Y - 14 - MEASURE_TICK}
            x2={eyeX}
            y2={HEADLIGHT_Y - 14 + MEASURE_TICK}
          />
        </g>

        {/* ---- Jalakäija helkuriga ---- */}
        <g className="fill-white stroke-ink" strokeWidth={2}>
          <circle cx={AXIS_X} cy={REFLECTOR_Y - 16} r={7} />
        </g>
        <circle
          cx={AXIS_X}
          cy={REFLECTOR_Y}
          r={5}
          className="fill-brand stroke-ink"
          strokeWidth={1.5}
        />

        {/* ---- Kauguse mõõdujoon vasakul, kus kiiri ei ole ---- */}
        <g className="stroke-ink-soft" strokeWidth={1.5}>
          <line x1={24} y1={REFLECTOR_Y} x2={24} y2={HEADLIGHT_Y} />
          <line
            x1={24 - MEASURE_TICK}
            y1={REFLECTOR_Y}
            x2={24 + MEASURE_TICK}
            y2={REFLECTOR_Y}
          />
          <line
            x1={24 - MEASURE_TICK}
            y1={HEADLIGHT_Y}
            x2={24 + MEASURE_TICK}
            y2={HEADLIGHT_Y}
          />
        </g>

        {/* ---- Plekki mõõdujoon auto all ---- */}
        <g className="stroke-brand" strokeWidth={1} strokeDasharray="3 3">
          <line
            x1={AXIS_X - spotRadiusPx}
            y1={HEADLIGHT_Y}
            x2={AXIS_X - spotRadiusPx}
            y2={SPOT_MEASURE_Y}
          />
          <line
            x1={AXIS_X + spotRadiusPx}
            y1={HEADLIGHT_Y}
            x2={AXIS_X + spotRadiusPx}
            y2={SPOT_MEASURE_Y}
          />
        </g>
        <g className="stroke-brand" strokeWidth={2.5} strokeLinecap="round">
          <line
            x1={AXIS_X - spotRadiusPx}
            y1={SPOT_MEASURE_Y}
            x2={AXIS_X + spotRadiusPx}
            y2={SPOT_MEASURE_Y}
          />
          <line
            x1={AXIS_X - spotRadiusPx}
            y1={SPOT_MEASURE_Y - MEASURE_TICK}
            x2={AXIS_X - spotRadiusPx}
            y2={SPOT_MEASURE_Y + MEASURE_TICK}
          />
          <line
            x1={AXIS_X + spotRadiusPx}
            y1={SPOT_MEASURE_Y - MEASURE_TICK}
            x2={AXIS_X + spotRadiusPx}
            y2={SPOT_MEASURE_Y + MEASURE_TICK}
          />
        </g>

        {/* Silmade koht SAMAL mõõdujoonel. Ilma selleta peaks õpilane kahte
            arvu peast võrdlema; koos temaga on ühe pilguga näha, kas silmad
            jäävad mõõdetud plekki sisse või sellest välja – ja just see ongi
            explore-sammu teine ülesanne. */}
        <line
          x1={eyeX}
          y1={SPOT_MEASURE_Y - 8}
          x2={eyeX}
          y2={SPOT_MEASURE_Y + 8}
          className="stroke-ink"
          strokeWidth={2}
        />

        {/* ---- Laiuse mõõtkava riba: üks meeter ----
            Ta on ülal paremal, kuhu ei ulatu ükski kiir ega plekk – ja ta on
            joonisel olemas seepärast, et laiuse mõõtkava on püsiv, pikkuse oma
            aga puudub. */}
        <g className="stroke-ink-soft" strokeWidth={1.5}>
          <line
            x1={VIEW.width - 30 - LATERAL_PX_PER_METRE}
            y1={26}
            x2={VIEW.width - 30}
            y2={26}
          />
          <line
            x1={VIEW.width - 30 - LATERAL_PX_PER_METRE}
            y1={22}
            x2={VIEW.width - 30 - LATERAL_PX_PER_METRE}
            y2={30}
          />
          <line x1={VIEW.width - 30} y1={22} x2={VIEW.width - 30} y2={30} />
        </g>

        {/* Sildid kõige viimasena ja valge äärisega: koonuse servad mööduvad
            neist napilt ja jookseksid muidu neist läbi. */}
        <g className="stroke-white" strokeWidth={4} paintOrder="stroke">
          <text
            x={VIEW.width - 30 - LATERAL_PX_PER_METRE - 6}
            y={30}
            textAnchor="end"
            className="fill-ink-soft"
            fontSize={10}
          >
            1 m (laius)
          </text>
          <text
            x={AXIS_X + 14}
            y={REFLECTOR_Y - 14}
            className="fill-ink-soft"
            fontSize={10}
          >
            jalakäija helkuriga
          </text>
          <text
            x={otherLightX + 10}
            y={166}
            className="fill-ink-soft"
            fontSize={10}
          >
            autotulede valgus
          </text>
          {/* Päris koonuse silt käib koonuse VASAKULE servale, ideaalse oma
              teljest paremale: nii ei satu nad kokku ka siis, kui koonus on
              kõige kitsam ja mõlemad jooned peaaegu ühes kohas. */}
          <text
            x={AXIS_X - spotRadiusPx * 0.72 - 8}
            y={252}
            textAnchor="end"
            className="fill-brand"
            fontSize={11}
            fontWeight={600}
          >
            päris koonus
          </text>
          <text x={AXIS_X + 8} y={276} className="fill-info" fontSize={11}>
            ideaalne helkur
          </text>
          <text
            x={eyeX + 10}
            y={HEADLIGHT_Y + 14}
            className="fill-ink"
            fontSize={10}
          >
            juhi silmad
          </text>
          <text
            x={(AXIS_X + eyeX) / 2}
            y={HEADLIGHT_Y - 20}
            textAnchor="middle"
            className="fill-ink-soft"
            fontSize={10}
          >
            {metres(EYE_OFFSET_M)} m
          </text>
          <text
            x={32}
            y={(REFLECTOR_Y + HEADLIGHT_Y) / 2 - 4}
            className="fill-ink-soft"
            fontSize={10}
          >
            kaugus
          </text>
          <text
            x={32}
            y={(REFLECTOR_Y + HEADLIGHT_Y) / 2 + 10}
            className="fill-ink"
            fontSize={13}
            fontWeight={600}
          >
            {formatNumber(distanceM)} m
          </text>
          <text
            x={eyeX + 8}
            y={SPOT_MEASURE_Y - 8}
            className="fill-ink"
            fontSize={10}
          >
            silmad siin
          </text>
          <text
            x={AXIS_X}
            y={SPOT_MEASURE_Y + 22}
            textAnchor="middle"
            className="fill-ink"
            fontSize={13}
            fontWeight={600}
          >
            plekk {metres(spotWidthM)} m
          </text>
        </g>
      </svg>

      <p className="text-base leading-relaxed text-ink-soft">
        Laius on joonisel püsivas mõõtkavas, pikkus aga mitte: helkurist autoni
        on ekraanil alati sama tükk teed, olgu seal 10 või 150 meetrit. Nurgad
        joonisel on seepärast lahti venitatud – päris arvud on kastikestes.
      </p>

      {/* Numbrid suurelt ka joonise all: 13-pikslist silti ei loe projektorilt
          klassi tagant istuv õpilane. 360 px ekraanil lähevad kastid üksteise
          alla, mitte kõrvale. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Readout
          label="Tagasituleva valguse plekk auto juures"
          value={`${metres(spotWidthM)} m`}
          tone="real"
        />
        <Readout
          label="Silmad paistavad helkuri juurest tuledest"
          value={`${degrees(eyeAngleDeg)}°`}
          tone="neutral"
        />
        <Readout
          label="Kas valgus jõuab juhi silma?"
          value={reachesEyes ? "jah" : "ei"}
          note={
            reachesEyes
              ? `plekk on laiem kui ${metres(2 * EYE_OFFSET_M)} m, seega katab silmad`
              : `plekk jääb kitsamaks kui ${metres(2 * EYE_OFFSET_M)} m ja ei ulatu silmadeni`
          }
          tone={reachesEyes ? "yes" : "no"}
        />
        <Readout
          label="Nii ere kui matt riie"
          value={`umbes ${gainText(gain)} korda`}
          tone="neutral"
        />
      </div>

      <p className="text-base leading-relaxed text-ink-soft">
        Juhi silmad on esituledest {metres(EYE_OFFSET_M)} m kõrval ja helkur on
        auto poole risti – kumbki liuguriga ei muutu.
      </p>

      <SliderField
        id={spreadSliderId}
        label="Hajuvusnurk ω (koonuse pool-avanurk)"
        value={spreadDeg}
        min={SLIDERS.spreadDeg.min}
        max={SLIDERS.spreadDeg.max}
        step={SLIDERS.spreadDeg.step}
        onChange={(event) =>
          setSpreadDeg(clamp(event.target.value, SLIDERS.spreadDeg, DEFAULT_SPREAD_DEG))
        }
        valueText={`${metres(spreadDeg)}°`}
        // Ekraanilugeja ütleks muidu paljast arvu – ühik on siin kogu jutt.
        ariaValueText={`${metres(spreadDeg)} kraadi`}
        minLabel={`${metres(SLIDERS.spreadDeg.min)}° (peaaegu täpne)`}
        maxLabel={`${metres(SLIDERS.spreadDeg.max)}° (lai koonus)`}
      />

      <SliderField
        id={distanceSliderId}
        label="Kaugus auto ja helkuri vahel L"
        value={distanceM}
        min={SLIDERS.distanceM.min}
        max={SLIDERS.distanceM.max}
        step={SLIDERS.distanceM.step}
        onChange={(event) =>
          setDistanceM(clamp(event.target.value, SLIDERS.distanceM, DEFAULT_DISTANCE_M))
        }
        valueText={`${formatNumber(distanceM)} m`}
        ariaValueText={`${formatNumber(distanceM)} meetrit`}
        minLabel={`${formatNumber(SLIDERS.distanceM.min)} m (lähedal)`}
        maxLabel={`${formatNumber(SLIDERS.distanceM.max)} m (kaugel)`}
      />

      <div className="flex justify-center">
        <Button variant="ghost" onClick={reset}>
          <RotateCcw aria-hidden="true" className="size-4" />
          Alusta uuesti
        </Button>
      </div>
    </div>
  );
}

/**
 * Liuguri väärtus mudelile kõlblikuks.
 *
 * Mudel viskab vahemikust väljas vea (see on tahtlik – vt model.ts), seega
 * vaade ei tohi talle midagi kahtlast anda. `<input type="range">` hoiab piire
 * ise, aga see rida maksab vähem kui valge ekraan. Ümardamist siin EI ole:
 * hajuvuse samm on 0,1° ja täisarvuks ümardamine teeks temast kohe 0° ehk
 * väärtuse, mille peale mudel viskab vea.
 */
function clamp(
  value: string,
  bounds: { min: number; max: number },
  fallback: number,
): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(bounds.max, Math.max(bounds.min, parsed));
}

/** Üks suurus suurelt. Värvitriip kordab joonise värvi, info kannab SILT. */
function Readout({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  tone: "real" | "neutral" | "yes" | "no";
}) {
  // Klassinimed on tervikuna välja kirjutatud, mitte stringidest kokku pandud:
  // Tailwind loeb lähtekoodi tekstina ja `bg-${tone}` kaoks stiililehelt
  // vaikselt ära.
  const stripe =
    tone === "real"
      ? "bg-brand"
      : tone === "yes"
        ? "bg-correct"
        : tone === "no"
          ? "bg-retry"
          : "bg-ink-soft";
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-line p-3">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className={`h-1 w-5 shrink-0 rounded-full ${stripe}`} />
        <span className="text-sm font-medium text-ink-soft">{label}</span>
      </div>
      <p className="text-xl font-semibold tabular-nums text-ink sm:text-2xl">{value}</p>
      {/* Vastus „jah/ei" on sõna, mitte värv – triip ainult kordab teda
          (DISAINIJUHIS: värv ei ole kunagi ainus info kandja). */}
      {note ? <p className="text-sm text-ink-soft">{note}</p> : null}
    </div>
  );
}
