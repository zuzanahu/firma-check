/** DDL executed once when the database is first created. */
export const SQL_SCHEMA = `
  CREATE TABLE IF NOT EXISTS ares_cache (
    ico        TEXT PRIMARY KEY,
    data       TEXT NOT NULL,
    fetched_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS geocoding_cache (
    address    TEXT PRIMARY KEY,
    lat        REAL NOT NULL,
    lng        REAL NOT NULL,
    fetched_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS saved_companies (
    ico              TEXT PRIMARY KEY,
    name             TEXT NOT NULL,
    legal_form       TEXT,
    date_established TEXT,
    status           TEXT,
    address          TEXT,
    vat_id           TEXT,
    saved_at         TEXT NOT NULL,
    geocoding_key    TEXT
  );
`;

/**
 * Incremental migrations applied after opening any existing database.
 * Each statement is executed in a try/catch so already-applied migrations are silently skipped.
 */
export const SQL_MIGRATIONS = [
  `ALTER TABLE saved_companies ADD COLUMN geocoding_key TEXT`,
];
