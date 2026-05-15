/**
 * Validates a Czech company identification number (IČO).
 *
 * Strips whitespace and pads the input with leading zeros to 8 digits.
 * Verifies the standard Czech weighted modulo-11 check digit.
 *
 * @param raw - The raw IČO string entered by the user.
 * @returns `{ valid: true, ico }` with the normalized 8-digit string,
 *          or `{ valid: false, error }` with a Czech-language error message.
 */
export function validateIco(
  raw: string,
): { valid: true; ico: string } | { valid: false; error: string } {
  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Zadejte IČO." };
  }

  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, error: "IČO může obsahovat pouze číslice." };
  }

  if (trimmed.length > 8) {
    return { valid: false, error: "IČO musí mít nejvýše 8 číslic." };
  }

  const ico = trimmed.padStart(8, "0");
  const digits = ico.split("").map(Number);

  const sum = [8, 7, 6, 5, 4, 3, 2].reduce(
    (acc, weight, i) => acc + weight * digits[i],
    0,
  );
  const rem = sum % 11;
  // rem 0 → expected 1, rem 1 → expected 0, otherwise 11 - rem
  const expected = rem === 0 ? 1 : rem === 1 ? 0 : 11 - rem;

  if (digits[7] !== expected) {
    return { valid: false, error: "IČO má neplatný kontrolní součet." };
  }

  return { valid: true, ico };
}
