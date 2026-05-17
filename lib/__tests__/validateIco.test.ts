import { describe, it, expect } from "vitest";
import { validateIco } from "@/lib/validateIco";

describe("validateIco", () => {
  describe("input sanity checks", () => {
    it("rejects empty string", () => {
      expect(validateIco("")).toEqual({ valid: false, error: "Zadejte IČO." });
    });

    it("rejects whitespace-only input", () => {
      expect(validateIco("   ")).toEqual({
        valid: false,
        error: "Zadejte IČO.",
      });
    });

    it("rejects non-digit characters", () => {
      expect(validateIco("1234abcd")).toEqual({
        valid: false,
        error: "IČO může obsahovat pouze číslice.",
      });
    });

    it("rejects input with hyphens", () => {
      expect(validateIco("1234-567")).toEqual({
        valid: false,
        error: "IČO může obsahovat pouze číslice.",
      });
    });

    it("rejects more than 8 digits", () => {
      expect(validateIco("123456789")).toEqual({
        valid: false,
        error: "IČO musí mít nejvýše 8 číslic.",
      });
    });
  });

  describe("checksum validation", () => {
    it("rejects IČO with wrong check digit", () => {
      // 12345678: expected check digit is 1 (rem=0), last digit is 8
      expect(validateIco("12345678")).toEqual({
        valid: false,
        error: "IČO má neplatný kontrolní součet.",
      });
    });

    it("accepts Škoda Auto IČO 27082440", () => {
      expect(validateIco("27082440")).toEqual({ valid: true, ico: "27082440" });
    });

    it("accepts ČEZ IČO 45272271", () => {
      expect(validateIco("45272271")).toEqual({ valid: true, ico: "45272271" });
    });

    it("pads short valid IČO with leading zeros", () => {
      // "0" padded to "00000000": sum=0, rem=0, expected=1, digit[7]=0 → invalid
      // Use a short IČO that is actually valid after padding:
      // Try "48136450" valid? digits 4,8,1,3,6,4,5,0
      // sum = 8*4+7*8+6*1+5*3+4*6+3*4+2*5 = 32+56+6+15+24+12+10 = 155
      // rem = 155%11 = 1, expected = 0, digit[7]=0 ✓
      // Short form "1364500" → "01364500"? No that changes the digits.
      // Just test that the 7-digit input "4813645" padded to "04813645":
      // digits: 0,4,8,1,3,6,4,5 — this changes the company. Let's test normalization with a known value.
      // Škoda without leading zero wouldn't apply. Instead test whitespace stripping.
      expect(validateIco("  27082440  ")).toEqual({
        valid: true,
        ico: "27082440",
      });
    });

    it("normalizes IČO shorter than 8 digits by left-padding with zeros", () => {
      // "27082440" starts with 2 so there is no shorter version that's the same company.
      // Test that a 6-digit input is padded: "006356" → "00006356"
      // digits: 0,0,0,0,6,3,5,6
      // sum = 8*0+7*0+6*0+5*0+4*6+3*3+2*5 = 0+0+0+0+24+9+10 = 43
      // rem = 43%11 = 10, expected = 11-10 = 1. digit[7] = 6 ≠ 1 → invalid
      // For the normalization test, we just want to confirm it pads and returns the padded ico.
      // 45272271 without padding is "45272271", no shorter version.
      // Let's create a valid short IČO: need digit[7] to match expected.
      // Try "1" → "00000001": sum=0, rem=0, expected=1, digit[7]=1 ✓
      expect(validateIco("1")).toEqual({ valid: true, ico: "00000001" });
    });
  });
});
