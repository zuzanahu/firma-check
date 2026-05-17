import { describe, it, expect } from "vitest";
import { buildCsvContent } from "@/lib/exportCsv";
import type { CompanyExportRow } from "@/db/queries";

const HEADER =
  "IČO,Obchodní název,Právní forma,Stav subjektu,Adresa sídla,Datum vzniku,Datum posledního ověření,Zdroj dat,Zeměpisná šířka,Zeměpisná délka";

function makeRow(overrides: Partial<CompanyExportRow> = {}): CompanyExportRow {
  return {
    ico: "27082440",
    name: "Škoda Auto a.s.",
    legalForm: "Akciová společnost",
    status: "Aktivní",
    address: "Václavské náměstí 1, Praha, 11000",
    dateEstablished: "1991-11-20T00:00:00.000Z",
    savedAt: "2026-05-17T10:00:00.000Z",
    lastVerifiedAt: "2026-05-17T09:58:00.000Z",
    dataSource: "API",
    lat: 50.0755,
    lng: 14.4378,
    ...overrides,
  };
}

describe("buildCsvContent", () => {
  it("returns only header row for empty input", () => {
    expect(buildCsvContent([])).toBe(HEADER);
  });

  it("produces header + one data row joined by CRLF", () => {
    const csv = buildCsvContent([makeRow()]);
    const lines = csv.split("\r\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(HEADER);
  });

  it("truncates ISO dateEstablished to YYYY-MM-DD", () => {
    const csv = buildCsvContent([makeRow()]);
    expect(csv).toContain("1991-11-20");
    expect(csv).not.toContain("T00:00:00");
  });

  it("truncates ISO lastVerifiedAt to YYYY-MM-DD", () => {
    const csv = buildCsvContent([makeRow()]);
    expect(csv).toContain("2026-05-17");
  });

  it("outputs empty string for null dates", () => {
    const csv = buildCsvContent([
      makeRow({ dateEstablished: null, lastVerifiedAt: null }),
    ]);
    // The two date columns should be empty (adjacent commas)
    const dataLine = csv.split("\r\n")[1];
    expect(dataLine).toContain(",,");
  });

  it("quotes fields containing commas", () => {
    const csv = buildCsvContent([
      makeRow({ address: "Václavské náměstí 1, Praha" }),
    ]);
    expect(csv).toContain('"Václavské náměstí 1, Praha"');
  });

  it("escapes double quotes inside fields", () => {
    const csv = buildCsvContent([makeRow({ name: 'Firma "Nejlepší" s.r.o.' })]);
    expect(csv).toContain('"Firma ""Nejlepší"" s.r.o."');
  });

  it("quotes fields containing newlines", () => {
    const csv = buildCsvContent([makeRow({ name: "Firma\nDruhý řádek" })]);
    expect(csv).toContain('"Firma\nDruhý řádek"');
  });

  it("outputs null lat/lng as empty strings (no quotes)", () => {
    const csv = buildCsvContent([makeRow({ lat: null, lng: null })]);
    const dataLine = csv.split("\r\n")[1];
    // Last two columns should be empty
    expect(dataLine.endsWith(",,")).toBe(true);
  });

  it("outputs numeric lat/lng without quotes", () => {
    const csv = buildCsvContent([makeRow({ lat: 50.0755, lng: 14.4378 })]);
    expect(csv).toContain("50.0755");
    expect(csv).toContain("14.4378");
  });

  it("produces multiple rows separated by CRLF", () => {
    const csv = buildCsvContent([makeRow(), makeRow({ ico: "45272271" })]);
    const lines = csv.split("\r\n");
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain("27082440");
    expect(lines[2]).toContain("45272271");
  });

  it("handles null optional fields as empty strings", () => {
    const csv = buildCsvContent([
      makeRow({ legalForm: null, status: null, address: null }),
    ]);
    expect(csv).toBeDefined();
    // Should not throw and produce valid CSV
    const lines = csv.split("\r\n");
    expect(lines).toHaveLength(2);
  });
});
