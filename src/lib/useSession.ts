import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { INITIAL_SESSION_STATE, nextSessionState } from "./sessionState";
import type { SessionState } from "./sessionState";

export type { SessionState } from "./sessionState";

/**
 * Jooksev Supabase'i sessioon Reacti kujul.
 *
 * `status: "loading"` on OLULINE eraldi seisund: kohe pärast lehe avamist ei
 * tea me veel, kas sessioon on olemas. Kui seda ei eristaks, vilguks
 * sisselogitud õpetajale hetkeks sisselogimisvorm.
 *
 * Otsustamine ise on failis sessionState.ts (puhas ja testitud) – siin on
 * ainult ühendus Supabase'i ja Reacti vahel.
 */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>(INITIAL_SESSION_STATE);

  useEffect(() => {
    let active = true;

    // Esimene lugemine kohalikust seansist. onAuthStateChange annab hiljem
    // ka magic-lingilt naasmise (detectSessionInUrl) ja väljalogimise.
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) {
          setState((prev) =>
            nextSessionState(prev, { type: "loaded", session: data.session }),
          );
        }
      })
      .catch(() => {
        // Vea neelame teadlikult: kasutajale on õige vastus „sa ei ole sisse
        // logitud", mitte lõputu ootamine ega tehniline veatekst.
        if (active) {
          setState((prev) => nextSessionState(prev, { type: "load-failed" }));
        }
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setState((prev) => nextSessionState(prev, { type: "changed", session }));
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}

/**
 * Kas see sessioon kuulub õpetajale.
 *
 * Õpilane logib sisse anonüümselt (`signInAnonymously`, samm 2.10) – tal on
 * samuti sessioon. Ilma selle kontrollita näeks klassiga liitunud õpilane
 * õpetaja töölauda.
 *
 * Võrdlus on `=== false`, mitte `!== true`: RLS-funktsioon
 * `public.is_teacher_account()` kasutab `coalesce(claim, true) = false` ehk
 * loeb PUUDUVA välja anonüümseks. Liides peab ütlema sama, mis andmebaas –
 * muidu näeks kasutaja töölauda, mille päringud baas tagasi lükkab.
 */
export function isTeacherSession(session: Session | null): boolean {
  return session !== null && session.user.is_anonymous === false;
}
