import { describe, it, expect } from "vitest";
import { buildAddressQuery, normalizeAddressKey } from "@/lib/address";
import type { CompanyAddress } from "@/lib/ares";

describe("buildAddressQuery", () => {
  it("returns empty string for undefined address", () => {
    expect(buildAddressQuery(undefined)).toBe("");
  });

  it("returns empty string for empty address object", () => {
    expect(buildAddressQuery({})).toBe("");
  });

  it("builds street address with house number and postal code", () => {
    const addr: CompanyAddress = {
      street: "Václavské náměstí",
      houseNumber: 1,
      city: "Praha",
      postalCode: 11000,
    };
    expect(buildAddressQuery(addr)).toBe("Václavské náměstí 1, Praha, 11000");
  });

  it("appends orientation number with slash", () => {
    const addr: CompanyAddress = {
      street: "Hlavní",
      houseNumber: 5,
      orientationNumber: 3,
      city: "Brno",
    };
    expect(buildAddressQuery(addr)).toBe("Hlavní 5 /3, Brno");
  });

  it("appends orientation letter after orientation number", () => {
    const addr: CompanyAddress = {
      street: "Nová",
      houseNumber: 10,
      orientationNumber: 2,
      orientationLetter: "a",
      city: "Ostrava",
      postalCode: 70200,
    };
    expect(buildAddressQuery(addr)).toBe("Nová 10 /2a, Ostrava, 70200");
  });

  it("omits postal code when missing", () => {
    const addr: CompanyAddress = {
      street: "Dlouhá",
      houseNumber: 7,
      city: "Plzeň",
    };
    expect(buildAddressQuery(addr)).toBe("Dlouhá 7, Plzeň");
  });

  it("builds rural address without street name", () => {
    const addr: CompanyAddress = {
      city: "Malá Lhota",
      houseNumber: 42,
      postalCode: 12345,
    };
    expect(buildAddressQuery(addr)).toBe("Malá Lhota 42, 12345");
  });

  it("uses only city when no street or house number", () => {
    const addr: CompanyAddress = { city: "Praha" };
    expect(buildAddressQuery(addr)).toBe("Praha");
  });

  it("omits postal code in rural address when missing", () => {
    const addr: CompanyAddress = {
      city: "Vesnice",
      houseNumber: 5,
    };
    expect(buildAddressQuery(addr)).toBe("Vesnice 5");
  });
});

describe("normalizeAddressKey", () => {
  it("lowercases the input", () => {
    expect(normalizeAddressKey("Praha")).toBe("praha");
  });

  it("trims leading and trailing whitespace", () => {
    expect(normalizeAddressKey("  Praha  ")).toBe("praha");
  });

  it("collapses internal whitespace to single space", () => {
    expect(normalizeAddressKey("Praha   Vinohrady")).toBe("praha vinohrady");
  });

  it("handles mixed case with extra spaces", () => {
    expect(normalizeAddressKey("  Hlavní   Třída 1  ")).toBe("hlavní třída 1");
  });
});
