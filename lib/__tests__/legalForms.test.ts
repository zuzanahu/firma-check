import { describe, it, expect } from "vitest";
import { getLegalFormLabel, LEGAL_FORMS } from "@/lib/legalForms";

describe("getLegalFormLabel", () => {
  it("returns dash for undefined code", () => {
    expect(getLegalFormLabel(undefined)).toBe("—");
  });

  it("returns dash for empty string code", () => {
    expect(getLegalFormLabel("")).toBe("—");
  });

  it("returns correct label for s.r.o. code 112", () => {
    expect(getLegalFormLabel("112")).toBe("Společnost s ručením omezeným");
  });

  it("returns correct label for a.s. code 121", () => {
    expect(getLegalFormLabel("121")).toBe("Akciová společnost");
  });

  it("returns correct label for živnostník code 101", () => {
    expect(getLegalFormLabel("101")).toBe(
      "Fyzická osoba podnikající dle živnostenského zákona",
    );
  });

  it("returns fallback with code for unknown code", () => {
    expect(getLegalFormLabel("999")).toBe("Kód: 999");
  });

  it("returns fallback for numeric-looking unknown code", () => {
    expect(getLegalFormLabel("000")).toBe("Kód: 000");
  });

  it("covers all 35 entries in LEGAL_FORMS map", () => {
    const codes = Object.keys(LEGAL_FORMS);
    for (const code of codes) {
      expect(getLegalFormLabel(code)).toBe(LEGAL_FORMS[code]);
    }
  });
});
