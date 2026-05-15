import type { CompanyExportRow } from "@/db/queries";

const CSV_HEADER = [
  "IČO",
  "Obchodní název",
  "Právní forma",
  "Stav subjektu",
  "Adresa sídla",
  "Datum vzniku",
  "Datum posledního ověření",
  "Zdroj dat",
  "Zeměpisná šířka",
  "Zeměpisná délka",
];

/**
 * Escapes a single value for CSV output, quoting it when it contains commas, quotes, or newlines.
 *
 * @param value - Raw value to escape.
 * @returns CSV-safe string (no surrounding quotes added unless required).
 */
function escapeCsvField(value: string | number | null | undefined): string {
  if (value == null || value === "") return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Truncates an ISO 8601 timestamp to a YYYY-MM-DD date string.
 *
 * @param iso - ISO 8601 string or null.
 * @returns Date portion only, or empty string if null.
 */
function isoToDate(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

/**
 * Builds a complete CSV string (with UTF-8 BOM-ready content) from an array of export rows.
 * Columns: IČO, Obchodní název, Právní forma, Stav subjektu, Adresa sídla, Datum vzniku,
 * Datum posledního ověření, Zdroj dat, Zeměpisná šířka, Zeměpisná délka.
 *
 * @param rows - Export rows from {@link listCompaniesForExport}.
 * @returns Complete CSV text including header line, rows separated by CRLF.
 */
export function buildCsvContent(rows: CompanyExportRow[]): string {
  const lines = rows.map((r) =>
    [
      escapeCsvField(r.ico),
      escapeCsvField(r.name),
      escapeCsvField(r.legalForm),
      escapeCsvField(r.status),
      escapeCsvField(r.address),
      escapeCsvField(isoToDate(r.dateEstablished)),
      escapeCsvField(isoToDate(r.lastVerifiedAt)),
      escapeCsvField(r.dataSource),
      r.lat != null ? String(r.lat) : "",
      r.lng != null ? String(r.lng) : "",
    ].join(","),
  );

  return [CSV_HEADER.join(","), ...lines].join("\r\n");
}

/**
 * Triggers a browser file download for the given CSV content.
 * A UTF-8 BOM is prepended so Excel opens the file with correct encoding.
 *
 * @param content - CSV text produced by {@link buildCsvContent}.
 * @param filename - Suggested file name for the download dialog.
 */
export function downloadCsv(content: string, filename: string): void {
  const BOM = "﻿";
  const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
