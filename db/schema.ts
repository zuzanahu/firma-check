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
    saved_at         TEXT NOT NULL
  );
`;
