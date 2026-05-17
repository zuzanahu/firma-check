export type NameMatchResult = "match" | "partial" | "none";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[.,\-–—/()"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Compares a user-entered company name against the name from ARES.
 * Ignores case, diacritics, whitespace, and basic punctuation.
 *
 * @param entered - Name entered by the user.
 * @param aresName - Official company name from ARES.
 * @returns `"match"` for identical, `"partial"` if one contains the other, `"none"` otherwise.
 */
export function compareCompanyName(
  entered: string,
  aresName: string,
): NameMatchResult {
  const a = normalize(entered);
  const b = normalize(aresName);
  if (a === b) return "match";
  if (b.includes(a) || a.includes(b)) return "partial";
  return "none";
}
