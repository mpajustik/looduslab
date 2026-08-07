import { describe, expect, it } from "vitest";
import { puhastaAadress, puhastaSyndmus } from "../src/lib/seire";

/**
 * Veaseire maskimine (samm 2.17).
 *
 * See on ainus koht, mis takistab klassikoodi ja klassi id jõudmist Sentry
 * serverisse. Kui siin tekib auk, lekivad andmed vaikselt – ükski ekraan
 * ei näitaks seda kunagi. Seepärast on tal testid.
 */

describe("puhastaAadress", () => {
  it("asendab klassikoodi liitumislingis", () => {
    expect(puhastaAadress("https://looduslab.ee/liitu/ABC123")).toBe(
      "https://looduslab.ee/liitu/:kood",
    );
  });

  it("asendab klassi id õpetaja klassivaates", () => {
    expect(
      puhastaAadress(
        "https://looduslab.ee/opetaja/klass/6b1f0c2e-1111-2222-3333-444455556666",
      ),
    ).toBe("https://looduslab.ee/opetaja/klass/:id");
  });

  it("viskab päringu ja ankru ära", () => {
    expect(
      puhastaAadress("https://looduslab.ee/kursus?kood=ABC123#samm-2"),
    ).toBe("https://looduslab.ee/kursus");
  });

  it("jätab tavalise aadressi puutumata – moodulislug ei ole isikuandmed", () => {
    expect(puhastaAadress("https://looduslab.ee/m/peegeldumisseadus")).toBe(
      "https://looduslab.ee/m/peegeldumisseadus",
    );
  });

  it("saab hakkama ka koodiga, milles on eri kujuga märke", () => {
    expect(puhastaAadress("/liitu/abc-123_x")).toBe("/liitu/:kood");
  });
});

describe("puhastaSyndmus", () => {
  it("eemaldab kasutaja, päringu sisu ja puhastab aadressi", () => {
    const puhastatud = puhastaSyndmus({
      type: undefined,
      user: { id: "õpilane-1", ip_address: "192.0.2.7" },
      request: {
        url: "https://looduslab.ee/liitu/ABC123?nimi=Mari",
        query_string: "nimi=Mari",
        cookies: { sb: "token" },
        data: { nimi: "Mari" },
        headers: { Cookie: "sb=token" },
      },
    });

    expect(puhastatud.user).toBeUndefined();
    expect(puhastatud.request?.url).toBe("https://looduslab.ee/liitu/:kood");
    expect(puhastatud.request?.query_string).toBeUndefined();
    expect(puhastatud.request?.cookies).toBeUndefined();
    expect(puhastatud.request?.data).toBeUndefined();
    expect(puhastatud.request?.headers).toBeUndefined();
  });

  it("puhastab ka leivapuru aadressid (navigeerimine ja päringud)", () => {
    const puhastatud = puhastaSyndmus({
      type: undefined,
      breadcrumbs: [
        {
          category: "navigation",
          data: { from: "/liitu/ABC123", to: "/opetaja/klass/abc-def" },
        },
        {
          category: "fetch",
          data: { url: "https://x.supabase.co/rest/v1/students?id=eq.7" },
        },
      ],
    });

    expect(puhastatud.breadcrumbs?.[0].data).toEqual({
      from: "/liitu/:kood",
      to: "/opetaja/klass/:id",
    });
    expect(puhastatud.breadcrumbs?.[1].data?.url).toBe(
      "https://x.supabase.co/rest/v1/students",
    );
  });

  /**
   * Ülevaatuse leid 2 (mõlemad ülevaatajad): aadress võib olla ka vea
   * TEKSTI sees. Näiteks Supabase'i viga toob rea väärtused kaasa või meie
   * enda `throw` kirjutab lingi lahti – siis ei aita `request.url`
   * puhastamine midagi.
   */
  it("puhastab klassikoodi ka vea tekstist", () => {
    const puhastatud = puhastaSyndmus({
      type: undefined,
      message: "Liitumine ebaõnnestus: /liitu/483920",
      logentry: { message: "Liitumine ebaõnnestus: /liitu/483920" },
      exception: {
        values: [
          {
            type: "Error",
            value: "Klassivaade /opetaja/klass/abc-def ei vastanud",
          },
        ],
      },
    });

    expect(puhastatud.message).toBe("Liitumine ebaõnnestus: /liitu/:kood");
    expect(puhastatud.logentry?.message).toBe("Liitumine ebaõnnestus: /liitu/:kood");
    expect(puhastatud.exception?.values?.[0].value).toBe(
      "Klassivaade /opetaja/klass/:id ei vastanud",
    );
  });

  it("ei lõika vea teksti esimese küsimärgi kohalt katki", () => {
    const puhastatud = puhastaSyndmus({
      type: undefined,
      message: "Miks see nii on? Sest ühendus katkes.",
    });

    expect(puhastatud.message).toBe("Miks see nii on? Sest ühendus katkes.");
  });

  it("puhastab klassikoodi ka leivapuru tekstist", () => {
    const puhastatud = puhastaSyndmus({
      type: undefined,
      breadcrumbs: [{ category: "console", message: "Avan /liitu/483920" }],
    });

    expect(puhastatud.breadcrumbs?.[0].message).toBe("Avan /liitu/:kood");
  });

  it("ei kuku läbi, kui sündmuses ei ole midagi puhastada", () => {
    expect(() =>
      puhastaSyndmus({ type: undefined, message: "Midagi läks valesti" }),
    ).not.toThrow();
  });
});
