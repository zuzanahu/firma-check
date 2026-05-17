import { describe, it, expect } from "vitest";
import { compareCompanyName } from "@/lib/compareCompanyName";

describe("compareCompanyName", () => {
  it("returns match for identical strings", () => {
    expect(compareCompanyName("Firma s.r.o.", "Firma s.r.o.")).toBe("match");
  });

  it("returns match ignoring case", () => {
    expect(compareCompanyName("FIRMA S.R.O.", "Firma s.r.o.")).toBe("match");
  });

  it("returns match ignoring diacritics", () => {
    expect(compareCompanyName("Zluta Kuna", "Žlutá Kuňa")).toBe("match");
  });

  it("returns match ignoring punctuation", () => {
    // Both normalize "s.r.o." → "sro" and "—" → ""
    expect(compareCompanyName("ABC sro", "ABC, s.r.o.")).toBe("match");
  });

  it("returns partial when entered name is a substring of ARES name", () => {
    expect(compareCompanyName("Škoda", "Škoda Auto a.s.")).toBe("partial");
  });

  it("returns partial when ARES name is a substring of entered name", () => {
    expect(compareCompanyName("Velká Firma CZ s.r.o.", "Firma CZ")).toBe(
      "partial",
    );
  });

  it("returns none when names share no substring relationship", () => {
    expect(compareCompanyName("Alpha", "Beta")).toBe("none");
  });

  it("returns none for completely unrelated names", () => {
    expect(compareCompanyName("Červená Růže s.r.o.", "Modrý Vlk a.s.")).toBe(
      "none",
    );
  });

  it("returns match for identical diacritic-heavy names", () => {
    expect(compareCompanyName("Žlutý Kůň", "Žlutý kůň")).toBe("match");
  });
});
