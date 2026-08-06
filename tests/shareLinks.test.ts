import { describe, expect, it } from "vitest";
import {
  joinPath,
  moduleUrl,
  modulePreviewPath,
  safeNextPath,
} from "../src/lib/shareLinks";

describe("moduleUrl", () => {
  it("ehitab jagatava otselingi", () => {
    expect(moduleUrl("peegeldumisseadus", "https://looduslab.ee")).toBe(
      "https://looduslab.ee/m/peegeldumisseadus",
    );
  });

  it("kodeerib slugi (aadress ei tohi katki minna)", () => {
    expect(moduleUrl("vedeliku rõhk", "https://looduslab.ee")).toBe(
      "https://looduslab.ee/m/vedeliku%20r%C3%B5hk",
    );
  });
});

describe("modulePreviewPath", () => {
  it("lisab eelvaate lipu", () => {
    expect(modulePreviewPath("peegeldumisseadus")).toBe(
      "/m/peegeldumisseadus?eelvaade=1",
    );
  });
});

describe("joinPath", () => {
  it("ilma edasiminekuta on lihtsalt liitumisleht", () => {
    expect(joinPath("483920")).toBe("/liitu/483920");
  });

  it("võtab sihtkoha kaasa kodeeritult", () => {
    expect(joinPath("483920", "/m/peegeldumisseadus")).toBe(
      "/liitu/483920?edasi=%2Fm%2Fpeegeldumisseadus",
    );
  });

  it("jätab võõra sihtkoha vahele, mitte ei pane teda linki", () => {
    expect(joinPath("483920", "https://vale-sait.ee")).toBe("/liitu/483920");
  });
});

describe("safeNextPath", () => {
  it("lubab rakenduse sisese tee", () => {
    expect(safeNextPath("/m/peegeldumisseadus")).toBe("/m/peegeldumisseadus");
    expect(safeNextPath("/kursus?plokk=2")).toBe("/kursus?plokk=2");
  });

  it("keelab täisaadressi teise saidile", () => {
    expect(safeNextPath("https://vale-sait.ee")).toBeNull();
    expect(safeNextPath("http://vale-sait.ee/m/x")).toBeNull();
  });

  it("keelab protokollivaba aadressi (see EI OLE tee)", () => {
    expect(safeNextPath("//vale-sait.ee")).toBeNull();
    expect(safeNextPath("/\\vale-sait.ee")).toBeNull();
  });

  it("keelab skeemi, mis ei alga kaldkriipsuga", () => {
    expect(safeNextPath("javascript:alert(1)")).toBeNull();
    expect(safeNextPath("m/peegeldumisseadus")).toBeNull();
  });

  it("keelab juhtsümbolid keset aadressi", () => {
    expect(safeNextPath("/m/x\njavascript:alert(1)")).toBeNull();
    expect(safeNextPath("/m/x\t")).toBeNull();
  });

  it("keelab tühja ja absurdselt pika tee", () => {
    expect(safeNextPath("")).toBeNull();
    expect(safeNextPath(`/${"a".repeat(600)}`)).toBeNull();
  });
});
