/**
 * Maps Czech legal form codes (pravniForma) returned by ARES to Czech-language labels.
 * If a code is not listed here, callers should display `"Kód: " + code`.
 */
export const LEGAL_FORMS: Record<string, string> = {
  "101": "Fyzická osoba podnikající dle živnostenského zákona",
  "102": "Fyzická osoba podnikající dle jiných zákonů než živnostenského",
  "105": "Zemědělský podnikatel",
  "111": "Veřejná obchodní společnost",
  "112": "Společnost s ručením omezeným",
  "113": "Komanditní společnost",
  "117": "Nadace",
  "118": "Nadační fond",
  "121": "Akciová společnost",
  "141": "Obecně prospěšná společnost",
  "161": "Školská právnická osoba",
  "205": "Družstvo",
  "206": "Bytové družstvo",
  "211": "Státní podnik",
  "231": "Příspěvková organizace (státní)",
  "232": "Příspěvková organizace",
  "301": "Obec",
  "302": "Kraj",
  "311": "Státní fond",
  "312": "Organizační složka státu",
  "325": "Veřejná výzkumná instituce",
  "331": "Zdravotní pojišťovna",
  "701": "Sdružení",
  "703": "Odborová organizace nebo organizace zaměstnavatelů",
  "704": "Církevní organizace",
  "706": "Politická strana nebo politické hnutí",
  "707": "Zájmové sdružení právnických osob",
  "711": "Komora",
  "715": "Společenství vlastníků jednotek",
  "716": "Pobočný spolek",
  "721": "Ústav",
  "745": "Veřejně prospěšná společnost",
  "751": "Spolek",
};

/**
 * Returns a human-readable Czech label for a legal form code from ARES.
 *
 * @param code - The `pravniForma` code from the ARES response.
 * @returns Czech label, or `"Kód: <code>"` when the code is not recognized.
 */
export function getLegalFormLabel(code: string | undefined): string {
  if (!code) return "—";
  return LEGAL_FORMS[code] ?? `Kód: ${code}`;
}
