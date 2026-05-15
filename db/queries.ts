import type { Database } from "sql.js";
import type { CompanyData } from "@/lib/ares";

// ─── ARES cache ───────────────────────────────────────────────────────────────

const SQL_GET_ARES = `SELECT data FROM ares_cache WHERE ico = :ico`;

const SQL_SET_ARES = `
  INSERT OR REPLACE INTO ares_cache (ico, data, fetched_at)
  VALUES (:ico, :data, :fetched_at)
`;

/**
 * Returns cached ARES data for the given IČO, or null on a cache miss.
 *
 * @param db - sql.js Database instance.
 * @param ico - Normalized 8-digit IČO string.
 * @returns Cached CompanyData, or null if not cached.
 */
export function getCachedAres(db: Database, ico: string): CompanyData | null {
  const result = db.exec(SQL_GET_ARES, { ":ico": ico });
  if (!result.length || !result[0].values.length) return null;
  return JSON.parse(result[0].values[0][0] as string) as CompanyData;
}

/**
 * Stores ARES data for an IČO in the cache table.
 *
 * @param db - sql.js Database instance.
 * @param ico - Normalized 8-digit IČO string.
 * @param data - Company data to cache.
 */
export function saveAresCache(
  db: Database,
  ico: string,
  data: CompanyData,
): void {
  db.run(SQL_SET_ARES, {
    ":ico": ico,
    ":data": JSON.stringify(data),
    ":fetched_at": new Date().toISOString(),
  });
}

// ─── Geocoding cache ──────────────────────────────────────────────────────────

export interface Coords {
  lat: number;
  lng: number;
}

const SQL_GET_GEOCODING = `SELECT lat, lng FROM geocoding_cache WHERE address = :address`;

const SQL_SET_GEOCODING = `
  INSERT OR REPLACE INTO geocoding_cache (address, lat, lng, fetched_at)
  VALUES (:address, :lat, :lng, :fetched_at)
`;

/**
 * Returns cached coordinates for a normalized address string, or null on a cache miss.
 *
 * @param db - sql.js Database instance.
 * @param address - Normalized address string used as cache key.
 * @returns Cached coordinates, or null if not cached.
 */
export function getCachedGeocoding(
  db: Database,
  address: string,
): Coords | null {
  const result = db.exec(SQL_GET_GEOCODING, { ":address": address });
  if (!result.length || !result[0].values.length) return null;
  const [lat, lng] = result[0].values[0];
  return { lat: lat as number, lng: lng as number };
}

/**
 * Stores geocoding coordinates for an address in the cache table.
 *
 * @param db - sql.js Database instance.
 * @param address - Normalized address string used as cache key.
 * @param coords - Latitude and longitude to cache.
 */
export function saveGeocodingCache(
  db: Database,
  address: string,
  coords: Coords,
): void {
  db.run(SQL_SET_GEOCODING, {
    ":address": address,
    ":lat": coords.lat,
    ":lng": coords.lng,
    ":fetched_at": new Date().toISOString(),
  });
}

// ─── Saved companies ──────────────────────────────────────────────────────────

export interface SavedCompany {
  ico: string;
  name: string;
  legalForm: string | null;
  dateEstablished: string | null;
  status: string | null;
  address: string | null;
  vatId: string | null;
  savedAt: string;
}

const SQL_IS_SAVED = `SELECT 1 FROM saved_companies WHERE ico = :ico`;

const SQL_SAVE = `
  INSERT OR REPLACE INTO saved_companies
    (ico, name, legal_form, date_established, status, address, vat_id, saved_at)
  VALUES
    (:ico, :name, :legal_form, :date_established, :status, :address, :vat_id, :saved_at)
`;

const SQL_REMOVE = `DELETE FROM saved_companies WHERE ico = :ico`;

const SQL_LIST = `
  SELECT ico, name, legal_form, date_established, status, address, vat_id, saved_at
  FROM saved_companies
  ORDER BY saved_at DESC
`;

/**
 * Returns true if a company with the given IČO is in the saved list.
 *
 * @param db - sql.js Database instance.
 * @param ico - Normalized 8-digit IČO string.
 * @returns Whether the company is saved.
 */
export function isCompanySaved(db: Database, ico: string): boolean {
  const result = db.exec(SQL_IS_SAVED, { ":ico": ico });
  return result.length > 0 && result[0].values.length > 0;
}

/**
 * Inserts or replaces a company in the saved list.
 *
 * @param db - sql.js Database instance.
 * @param company - Company data to save (savedAt is set to the current timestamp).
 */
export function saveCompany(
  db: Database,
  company: Omit<SavedCompany, "savedAt">,
): void {
  db.run(SQL_SAVE, {
    ":ico": company.ico,
    ":name": company.name,
    ":legal_form": company.legalForm,
    ":date_established": company.dateEstablished,
    ":status": company.status,
    ":address": company.address,
    ":vat_id": company.vatId,
    ":saved_at": new Date().toISOString(),
  });
}

/**
 * Removes a company from the saved list.
 *
 * @param db - sql.js Database instance.
 * @param ico - Normalized 8-digit IČO string.
 */
export function removeCompany(db: Database, ico: string): void {
  db.run(SQL_REMOVE, { ":ico": ico });
}

/**
 * Returns all saved companies ordered by save date descending.
 *
 * @param db - sql.js Database instance.
 * @returns Array of saved companies, newest first.
 */
export function listSavedCompanies(db: Database): SavedCompany[] {
  const result = db.exec(SQL_LIST);
  if (!result.length) return [];
  return result[0].values.map((row) => ({
    ico: row[0] as string,
    name: row[1] as string,
    legalForm: row[2] as string | null,
    dateEstablished: row[3] as string | null,
    status: row[4] as string | null,
    address: row[5] as string | null,
    vatId: row[6] as string | null,
    savedAt: row[7] as string,
  }));
}
