import type { CompanyAddress } from "@/lib/ares";

/**
 * Builds a geocodable address query string from structured ARES address fields.
 *
 * Structured fields are always preferred over textAddress because ARES textAddress
 * contains Czech-specific notation (e.g. "č.p.") that geocoders do not understand.
 * For rural addresses without a street name the format "City HouseNumber, PostalCode"
 * is used — the form Czech geocoders expect.
 *
 * @param address - Structured address from ARES data.
 * @returns Single-line address string suitable for a Nominatim query, or empty string.
 */
export function buildAddressQuery(address: CompanyAddress | undefined): string {
  if (!address) return "";

  if (address.street) {
    const streetPart = [
      address.street,
      address.houseNumber,
      address.orientationNumber
        ? `/${address.orientationNumber}${address.orientationLetter ?? ""}`
        : undefined,
    ]
      .filter(Boolean)
      .join(" ");

    return [
      streetPart,
      address.city,
      address.postalCode ? String(address.postalCode) : undefined,
    ]
      .filter(Boolean)
      .join(", ");
  }

  if (address.city) {
    // Rural/village address — no named street, only a house number.
    // Format: "City HouseNumber, PostalCode" which Nominatim understands.
    const cityPart = address.houseNumber
      ? `${address.city} ${address.houseNumber}`
      : address.city;

    return [
      cityPart,
      address.postalCode ? String(address.postalCode) : undefined,
    ]
      .filter(Boolean)
      .join(", ");
  }

  return "";
}

/**
 * Normalizes an address string for use as a geocoding cache key.
 * Lowercases, trims, and collapses repeated whitespace.
 *
 * @param raw - Raw address string.
 * @returns Normalized cache key.
 */
export function normalizeAddressKey(raw: string): string {
  return raw.toLowerCase().trim().replace(/\s+/g, " ");
}
