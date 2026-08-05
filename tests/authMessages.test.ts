import { describe, expect, it } from "vitest";
import {
  isLikelyEmail,
  magicLinkErrorMessage,
  normalizeEmail,
} from "../src/lib/authMessages";

describe("normalizeEmail", () => {
  it("eemaldab tühikud ja teeb väiketäheliseks", () => {
    expect(normalizeEmail("  Mari.Maasikas@Kool.EE ")).toBe(
      "mari.maasikas@kool.ee",
    );
  });
});

describe("isLikelyEmail", () => {
  it("võtab vastu tavalise aadressi", () => {
    expect(isLikelyEmail("mari@kool.ee")).toBe(true);
    expect(isLikelyEmail(" Mari+8b@kool.tartu.ee ")).toBe(true);
  });

  it("lükkab tagasi selgelt katkise kuju", () => {
    expect(isLikelyEmail("")).toBe(false);
    expect(isLikelyEmail("mari")).toBe(false);
    expect(isLikelyEmail("mari@kool")).toBe(false);
    expect(isLikelyEmail("@kool.ee")).toBe(false);
    expect(isLikelyEmail("mari@@kool.ee")).toBe(false);
    expect(isLikelyEmail("mari @kool.ee")).toBe(false);
    expect(isLikelyEmail("mari@kool.")).toBe(false);
    expect(isLikelyEmail("mari@.ee")).toBe(false);
  });
});

describe("magicLinkErrorMessage", () => {
  it("tunneb ära liiga sagedased katsed nii koodi kui staatuse järgi", () => {
    const byCode = magicLinkErrorMessage({ code: "over_email_send_rate_limit" });
    expect(byCode).toContain("Oota paar minutit");
    expect(magicLinkErrorMessage({ status: 429 })).toBe(byCode);
  });

  it("annab vigase aadressi kohta oma teate", () => {
    expect(magicLinkErrorMessage({ code: "email_address_invalid" })).toContain(
      "kirjapildis",
    );
  });

  it("annab tundmatu vea puhul üldise teate, mitte inglise keelset teksti", () => {
    const message = magicLinkErrorMessage({
      code: "unexpected_failure",
      message: "Database error finding user",
    });
    expect(message).toContain("Kontrolli internetiühendust");
    expect(message).not.toContain("Database");
  });
});
