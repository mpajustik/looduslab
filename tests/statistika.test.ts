import { describe, expect, it } from "vitest";
import { onTundlikTee } from "../src/lib/statistika";

/**
 * Külastusstatistika värav (samm 2.17, ülevaatuse leid 1).
 *
 * Cloudflare Web Analytics mõõdab lehe TEED ja jälgib ka SPA-navigeerimist.
 * Meie teedes on kaks kohta, kus tee sees on midagi, mida kolmanda teenuse
 * aruandesse saata ei tohi: klassikood ja klassi id. See funktsioon on ainus
 * koht, mis need ära tunneb – seepärast on tal test.
 */

describe("onTundlikTee", () => {
  it("tunneb ära liitumislehe koos klassikoodiga", () => {
    expect(onTundlikTee("/liitu/483920")).toBe(true);
  });

  it("tunneb ära õpetaja klassivaate", () => {
    expect(onTundlikTee("/opetaja/klass/6b1f0c2e-1111-2222-3333-444455556666")).toBe(
      true,
    );
  });

  it("laseb tavalised lehed läbi", () => {
    expect(onTundlikTee("/")).toBe(false);
    expect(onTundlikTee("/kursus")).toBe(false);
    expect(onTundlikTee("/m/peegeldumisseadus")).toBe(false);
    expect(onTundlikTee("/privaatsus")).toBe(false);
  });

  it("laseb õpetaja esilehe läbi – seal ei ole teed sees ühtegi tunnust", () => {
    expect(onTundlikTee("/opetaja")).toBe(false);
  });
});
