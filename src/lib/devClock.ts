import { browserStorage, type StorageLike } from "./storage";

/**
 * Ajakerimine ARENDUSES (plaani samm 3.5).
 *
 * Kordamise intervallid on 1 → 3 → 7 → 21 päeva. Ilma ajakerimiseta saaks
 * kogu redelit katsuda ainult kuu aja jooksul – seega on siin nihe päevades,
 * mille võrra rakendus arvab, et praegune hetk on edasi (või tagasi).
 *
 * Kolm otsust:
 *
 * 1. **Ainult arendusbuildis.** `appNow` küsib kella nihkega ainult siis, kui
 *    `import.meta.env.DEV` on tõene. Toodangu buildis asendab Vite selle
 *    `false`-iga ja kogu nihkeloogika langeb koodist välja – õpilase brauseris
 *    ei ole ühtegi viisi kuupäeva võltsida.
 * 2. **Kell ei ole kohustuslik parameeter.** Engine'i funktsioonid võtavad
 *    `now` juba praegu sisendina (`dueReviewItems`, `applyReviewResult`) –
 *    nihe elab AINULT rakenduse servas, kohtades, mis seni kutsusid
 *    `new Date()`. Nii ei tea engine ajakerimisest midagi ja tema testid
 *    jäävad puhtaks.
 * 3. **Päev liidetakse kuupäeva osale**, mitte millisekunditele – sama põhjus
 *    mis `dueDateAfter`-is (src/engine/review.ts): kellakeeramise ööl on
 *    ööpäev 23 või 25 tundi.
 */

/** Nihe elab oma võtmes – nii ei sega ta kunagi päris andmeid. */
export const DEV_CLOCK_KEY = "looduslab:dev-clock";

/**
 * Kaugeim nihe: kaks aastat mõlemas suunas. Piir ei kaitse mitte kasutaja,
 * vaid rikutud väärtuse eest: käsitsi kirjutatud `1e9` annaks kuupäeva, mida
 * `Date` enam ei esita, ja iga kaart kaoks vaikselt ära.
 */
export const MAX_OFFSET_DAYS = 730;

/**
 * Salvestatud nihe arvuks. Salvestus on VÕÕRAS andmed (käsitsi muudetud
 * tekst), seega: mitte-arv ja lõpmatus → 0, murdosa maha, piiridesse.
 */
export function parseOffsetDays(raw: string | null): number {
  if (raw === null || raw.trim() === "") return 0;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return 0;
  const whole = Math.trunc(parsed);
  return Math.min(MAX_OFFSET_DAYS, Math.max(-MAX_OFFSET_DAYS, whole));
}

/** Sama hetk `offsetDays` päeva hiljem: kuupäev nihkub, kellaaeg jääb. */
export function shiftedNow(offsetDays: number, base: Date = new Date()): Date {
  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() + offsetDays,
    base.getHours(),
    base.getMinutes(),
    base.getSeconds(),
    base.getMilliseconds(),
  );
}

export type DevClock = {
  offsetDays(): number;
  /** Liidab nihkele päevi ja tagastab uue nihke. */
  shift(days: number): number;
  /** Tagasi päris aja peale. */
  reset(): void;
  now(): Date;
};

/**
 * Kell salvestuse peal. Salvestus antakse sisse (nagu `createReviewStore`-is),
 * et testid ei vajaks brauserit.
 *
 * Ilma localStorage'ita seade saab päris kella ja nihe ei salvestu – see on
 * arendustööriist, mitte funktsioon, mille pärast tasuks kaevata.
 */
export function createDevClock(
  resolveStorage: () => StorageLike | null = browserStorage,
): DevClock {
  const storage = resolveStorage();
  if (storage === null) {
    return {
      offsetDays: () => 0,
      shift: () => 0,
      reset: () => {},
      now: () => new Date(),
    };
  }

  const read = (): number => {
    try {
      return parseOffsetDays(storage.getItem(DEV_CLOCK_KEY));
    } catch {
      return 0;
    }
  };

  return {
    offsetDays: read,
    shift: (days) => {
      // Ka liidetav surutakse piiridesse: `shift(1e9)` ei tohi anda kuupäeva,
      // mida `Date` enam ei esita.
      const next = parseOffsetDays(`${read() + Math.trunc(days)}`);
      try {
        storage.setItem(DEV_CLOCK_KEY, `${next}`);
      } catch {
        // Ketas täis – nihe jääb tegemata. Arenduses on see nähtav kohe.
      }
      return next;
    },
    reset: () => {
      try {
        storage.removeItem(DEV_CLOCK_KEY);
      } catch {
        // Sama lugu: rohkem teha ei ole.
      }
    },
    now: () => shiftedNow(read()),
  };
}

// ---------------------------------------------------------------------------
// Rakenduse kell
// ---------------------------------------------------------------------------

/** Kas ajakerimise nupp on üldse olemas. Toodangus alati `false`. */
export const devClockAvailable = import.meta.env.DEV;

let shared: DevClock | null = null;

function sharedDevClock(): DevClock {
  shared ??= createDevClock();
  return shared;
}

/**
 * „Praegu" kogu rakenduse jaoks. Kasuta seda iga kord, kui vastus sõltub
 * kuupäevast (kordamiskaardid, edenemise soovitus) – `new Date()` otse
 * tähendaks, et ajakerimine sellest kohast mööda läheb.
 */
export function appNow(): Date {
  if (!devClockAvailable) return new Date();
  return sharedDevClock().now();
}

export function devClockOffsetDays(): number {
  if (!devClockAvailable) return 0;
  return sharedDevClock().offsetDays();
}

export function shiftDevClock(days: number): number {
  if (!devClockAvailable) return 0;
  return sharedDevClock().shift(days);
}

export function resetDevClock(): void {
  if (!devClockAvailable) return;
  sharedDevClock().reset();
}
