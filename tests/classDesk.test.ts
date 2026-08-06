import { describe, expect, it } from "vitest";
import {
  classCodeErrorMessage,
  formatExpiry,
  joinUrl,
  matchesClassName,
  mergeStudents,
} from "../src/lib/classDesk";

describe("formatExpiry", () => {
  it("näitab tulevast kuupäeva 'aegub' sõnaga", () => {
    const now = new Date("2026-08-05T10:00:00Z");
    expect(formatExpiry("2026-08-19T10:00:00Z", now)).toBe(
      "Kood aegub 19. augustil 2026",
    );
  });

  it("näitab möödunud kuupäeva 'aegus' sõnaga", () => {
    const now = new Date("2026-08-20T10:00:00Z");
    expect(formatExpiry("2026-08-19T10:00:00Z", now)).toBe(
      "Kood aegus 19. augustil 2026",
    );
  });

  it("loeb hetkel aeguva koodi juba aegunuks (piirjuht)", () => {
    const now = new Date("2026-08-19T10:00:00Z");
    expect(formatExpiry("2026-08-19T10:00:00Z", now)).toBe(
      "Kood aegus 19. augustil 2026",
    );
  });
});

describe("joinUrl", () => {
  it("ehitab liitumisaadressi marsruudi /liitu/:kood järgi", () => {
    expect(joinUrl("483920", "https://looduslab.ee")).toBe(
      "https://looduslab.ee/liitu/483920",
    );
  });

  it("töötab ka ilma protokollita (projektoril kuvatav lühivorm)", () => {
    expect(joinUrl("483920", "looduslab.ee")).toBe("looduslab.ee/liitu/483920");
  });
});

describe("mergeStudents", () => {
  const mari = { id: "a", display_name: "Mari" };
  const jaan = { id: "b", display_name: "Jaan" };

  it("lisab uue liituja lõppu", () => {
    expect(mergeStudents([mari], [jaan])).toEqual([mari, jaan]);
  });

  it("ei lisa sama õpilast kaks korda", () => {
    expect(mergeStudents([mari, jaan], [mari])).toEqual([mari, jaan]);
  });

  it("ei lisa kordust ka ühe liitmise sees", () => {
    expect(mergeStudents([], [jaan, jaan])).toEqual([jaan]);
  });

  it("annab sama massiivi tagasi, kui midagi ei lisandunud (React ei renderda asjata)", () => {
    const current = [mari];
    expect(mergeStudents(current, [mari])).toBe(current);
  });

  it("säilitab olemasolevate järjekorra, kui algseis jõuab kohale hiljem", () => {
    // Kanalist tuli Jaan enne, kui algseisu päring Mari ja Jaani tõi.
    expect(mergeStudents([jaan], [mari, jaan])).toEqual([jaan, mari]);
  });
});

describe("classCodeErrorMessage", () => {
  it("loeb funktsiooni JSON-vastusest eestikeelse teate", async () => {
    const context = new Response(JSON.stringify({ error: "Klassi nimi on vale." }), {
      status: 400,
    });
    await expect(classCodeErrorMessage({ context })).resolves.toBe(
      "Klassi nimi on vale.",
    );
  });

  it("annab üldise teate, kui context puudub (võrguviga)", async () => {
    await expect(classCodeErrorMessage({})).resolves.toBe(
      "Ei õnnestunud ühendust luua. Kontrolli internetiühendust ja proovi uuesti.",
    );
  });

  it("annab üldise teate, kui keha ei ole korrektne JSON", async () => {
    const context = new Response("<html>502</html>", { status: 502 });
    await expect(classCodeErrorMessage({ context })).resolves.toBe(
      "Ei õnnestunud ühendust luua. Kontrolli internetiühendust ja proovi uuesti.",
    );
  });
});

describe("matchesClassName", () => {
  it("võtab vastu täpselt sama nime", () => {
    expect(matchesClassName("8.a füüsika", "8.a füüsika")).toBe(true);
  });

  it("annab andeks tühikud otstes ja teise algustähe", () => {
    expect(matchesClassName("  8.A Füüsika ", "8.a füüsika")).toBe(true);
  });

  it("annab andeks topelttühiku sees", () => {
    expect(matchesClassName("8.a  füüsika", "8.a füüsika")).toBe(true);
  });

  it("EI võta vastu naaberklassi nime (üks täht erineb)", () => {
    expect(matchesClassName("8.b füüsika", "8.a füüsika")).toBe(false);
  });

  it("EI võta vastu poolikut nime", () => {
    expect(matchesClassName("8.a", "8.a füüsika")).toBe(false);
  });

  it("EI võta vastu tühja välja", () => {
    expect(matchesClassName("", "8.a füüsika")).toBe(false);
    expect(matchesClassName("   ", "8.a füüsika")).toBe(false);
  });

  it("EI kinnita midagi, kui klassi nimi ise on tühi", () => {
    expect(matchesClassName("", "")).toBe(false);
    expect(matchesClassName("  ", "   ")).toBe(false);
  });

  it("tunneb ära täpitähed suur- ja väiketähena", () => {
    expect(matchesClassName("ÜHENDATUD RÜHM", "ühendatud rühm")).toBe(true);
  });

  it("tunneb ära lahku kirjutatud täpitähe (iPadi klaviatuur, NFD)", () => {
    // Sama nimi kahes Unicode'i kujus: "ü" ühe märgina (NFC, Windows) ja
    // "u" + täpid eraldi märgina (NFD, mida iOS/macOS klaviatuur saadab).
    // Ilma normaliseerimiseta ei loeks õigesti trükitud nimi õigeks ja
    // õpetaja ei saaks oma klassi üldse kustutada.
    const nfc = "8.a füüsika".normalize("NFC");
    const nfd = "8.a füüsika".normalize("NFD");
    expect(nfc).not.toBe(nfd);
    expect(matchesClassName(nfd, nfc)).toBe(true);
    expect(matchesClassName(nfc, nfd)).toBe(true);
  });
});
