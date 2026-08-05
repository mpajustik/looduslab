import { describe, expect, it } from "vitest";
import type { Session } from "@supabase/supabase-js";
import {
  INITIAL_SESSION_STATE,
  nextSessionState,
} from "../src/lib/sessionState";
import { isTeacherSession } from "../src/lib/useSession";

/** Testi jaoks piisab sessioonist, millel on ainult vajalikud väljad. */
function fakeSession(user: Partial<Session["user"]>): Session {
  return { user } as Session;
}

const TEACHER = fakeSession({ id: "t1", email: "mari@kool.ee", is_anonymous: false });
const STUDENT = fakeSession({ id: "s1", is_anonymous: true });

describe("nextSessionState", () => {
  it("esimene õnnestunud lugemine viib laadimisest välja", () => {
    expect(
      nextSessionState(INITIAL_SESSION_STATE, { type: "loaded", session: null }),
    ).toEqual({ status: "ready", session: null });
  });

  it("ebaõnnestunud lugemine viib samuti laadimisest välja", () => {
    // Ilma selleta jääks ekraan igaveseks „Kontrollin sisselogimist …" peale.
    expect(
      nextSessionState(INITIAL_SESSION_STATE, { type: "load-failed" }),
    ).toEqual({ status: "ready", session: null });
  });

  it("kuulaja teade kirjutab vana oleku üle", () => {
    const ready = nextSessionState(INITIAL_SESSION_STATE, {
      type: "loaded",
      session: null,
    });
    expect(
      nextSessionState(ready, { type: "changed", session: TEACHER }),
    ).toEqual({ status: "ready", session: TEACHER });
  });

  it("hiljaks jäänud lugemine EI kirjuta värskemat sessiooni üle", () => {
    const afterLogin = nextSessionState(INITIAL_SESSION_STATE, {
      type: "changed",
      session: TEACHER,
    });
    expect(
      nextSessionState(afterLogin, { type: "loaded", session: null }),
    ).toBe(afterLogin);
    expect(nextSessionState(afterLogin, { type: "load-failed" })).toBe(
      afterLogin,
    );
  });

  it("väljalogimine kuulaja kaudu tühjendab sessiooni", () => {
    const afterLogin = nextSessionState(INITIAL_SESSION_STATE, {
      type: "changed",
      session: TEACHER,
    });
    expect(
      nextSessionState(afterLogin, { type: "changed", session: null }),
    ).toEqual({ status: "ready", session: null });
  });
});

describe("isTeacherSession", () => {
  it("õpetaja on õpetaja, anonüümne õpilane ei ole", () => {
    expect(isTeacherSession(TEACHER)).toBe(true);
    expect(isTeacherSession(STUDENT)).toBe(false);
    expect(isTeacherSession(null)).toBe(false);
  });

  it("puuduv is_anonymous loetakse anonüümseks – täpselt nagu RLS-is", () => {
    // public.is_teacher_account(): coalesce(claim, true) = false.
    // Kahtluse korral keelame; liides ja andmebaas peavad ütlema sama.
    expect(isTeacherSession(fakeSession({ id: "x" }))).toBe(false);
  });
});
