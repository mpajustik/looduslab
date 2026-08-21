import type { ChangeEventHandler } from "react";

/**
 * Liugur koos NÄHTAVA väärtusega – simulatsioonide ainus lubatud liugur.
 *
 * Miks ta olemas on: P1 moodulites oli liuguri juures ainult nimi ja
 * otspunktid ("Langemisnurk … 0° … 85°"), aga mitte praegune väärtus. Väärtus
 * elas `Readout`-ribal simulatsiooni ülaosas, mis tähendas telefonis seda, et
 * õpilane pidi liugurit lohistades KERIMA, et näha, mille peale ta parasjagu
 * sättis. Ühe suuruse muutmine on simulatsiooni põhitegevus – väärtus peab
 * olema seal, kus käsi on.
 *
 * `Readout` jääb alles ja on endiselt õige koht TULEMUSTELE (peegeldumisnurk,
 * fookuskaugus – see, mida mudel välja arvutab). Siinne väärtus on SISEND ehk
 * see, mida õpilane ise keerab.
 *
 * Komponent on tahtlikult rumal: ta ei vorminda, ei ümarda ega piira midagi.
 * Iga moodul teab ise oma ühikut, komadi kohti ja `clamp`-i (mudel viskab
 * vahemikust väljas vea – vt moodulite model.ts). Seepärast tuleb `valueText`
 * valmis vormindatud stringina ja `onChange` saab toore sündmuse, täpselt
 * nagu enne. Nii on 31 liuguri ümbertõstmine mehaaniline töö, mitte
 * käitumise muutmine.
 */
export type SliderFieldProps = {
  /** `useId()` moodulist – seob sildi, liuguri ja väärtuse kokku. */
  id: string;
  /** Suuruse nimi, nt „Langemisnurk (ristsirge suhtes)". */
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: ChangeEventHandler<HTMLInputElement>;
  /** Nähtav väärtus koos ühikuga, moodul vormindab ise: „30°", „12 cm". */
  valueText: string;
  /**
   * Ekraanilugeja tekst, nt „30 kraadi". Eraldi `valueText`-ist, sest
   * kuuldes on „kraadi" selgem kui „°" ja siia mahub ka lisainfo
   * („4500 kelvinit, neutraalvalge").
   */
  ariaValueText: string;
  /** Otspunktide sildid ühikuga: „0°" ja „85°". */
  minLabel: string;
  maxLabel: string;
  /** Selgitava teksti id, kui moodulil on liuguri juures vihje. */
  describedBy?: string;
  /**
   * Lukus liugur (nt `valgusallikad` kosmoseskaalal, kus Päikese mõõt ja
   * kaugus on ette antud). Väärtus jääb ka lukus liuguri juures NÄHTAVAKS –
   * just siis on ta kõige tähtsam, sest õpilane ei saa teda ise liigutades
   * järele vaadata.
   */
  disabled?: boolean;
};

export function SliderField({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  valueText,
  ariaValueText,
  minLabel,
  maxLabel,
  describedBy,
  disabled,
}: SliderFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Nimi vasakul, väärtus paremal – väärtus ei lisa ühtegi rida
          kõrgust, mis 360 px ekraanil kolme liuguriga moodulis loeb. */}
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-base font-medium text-ink">
          {label}
        </label>
        {/* `tabular-nums` hoiab numbrilaiuse ühtlasena – ilma selleta
            hüpleb väärtus lohistamise ajal edasi-tagasi ja tõmbab pilgu
            joonise pealt ära.

            `aria-hidden`, sest liuguril endal on juba `aria-valuetext`:
            ekraanilugeja ütleks väärtuse muidu KAKS korda. Nägijale on see
            uus info, kuulajale kordus. */}
        <span
          aria-hidden="true"
          className="shrink-0 text-base font-semibold tabular-nums text-ink"
        >
          {valueText}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-valuetext={ariaValueText}
        aria-describedby={describedBy}
        // h-11 = 44 px klikiala (CLAUDE.md disain).
        className="h-11 w-full accent-brand disabled:opacity-40"
      />
      <div className="flex justify-between text-sm text-ink-soft">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
