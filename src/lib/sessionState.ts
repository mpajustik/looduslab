import type { Session } from "@supabase/supabase-js";

/**
 * Sessiooni oleku puhas loogika (`useSession` hoiab seda Reactis).
 *
 * Miks eraldi failis: hooki ennast ei saa ilma uue testipaketita testida,
 * aga siin on tegu tavalise sisend → väljund funktsiooniga, mille saab
 * katta Vitestiga (reegel 4: uut sõltuvust selle jaoks ei võta).
 */
export type SessionState =
  | { status: "loading"; session: null }
  | { status: "ready"; session: Session | null };

export type SessionEvent =
  /** `getSession()` õnnestus – esimene lugemine kohalikust seansist. */
  | { type: "loaded"; session: Session | null }
  /** `getSession()` viskas vea (katkine seansisalvestus, võrguviga). */
  | { type: "load-failed" }
  /** `onAuthStateChange` – sisselogimine, väljalogimine, tokeni uuendus. */
  | { type: "changed"; session: Session | null };

export const INITIAL_SESSION_STATE: SessionState = {
  status: "loading",
  session: null,
};

export function nextSessionState(
  prev: SessionState,
  event: SessionEvent,
): SessionState {
  switch (event.type) {
    // Kuulaja teade on ALATI värskeim tõde – ta räägib praegusest hetkest.
    case "changed":
      return { status: "ready", session: event.session };

    // Esimene lugemine võib lõpetada hiljem kui kuulaja esimene teade. Siis
    // on tema andmed juba vanad ja neid EI tohi peale kirjutada – muidu
    // kaoks just sisse loginud õpetaja sessioon uuesti ära.
    case "loaded":
      return prev.status === "ready"
        ? prev
        : { status: "ready", session: event.session };

    // Viga ei tohi jätta ekraani igaveseks „Kontrollin sisselogimist …"
    // peale seisma: sessiooni me ei tea, seega näitame sisselogimisvormi.
    case "load-failed":
      return prev.status === "ready" ? prev : { status: "ready", session: null };
  }
}
