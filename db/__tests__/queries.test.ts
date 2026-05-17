import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { resolve } from "path";
import { readFileSync } from "fs";
import initSqlJs, { type Database } from "sql.js";
import { SQL_SCHEMA } from "@/db/schema";
import {
  getCachedAres,
  saveAresCache,
  getCachedGeocoding,
  saveGeocodingCache,
  isCompanySaved,
  saveCompany,
  removeCompany,
  listSavedCompanies,
  listCompaniesForExport,
  backfillGeocodingKeys,
} from "@/db/queries";
import type { CompanyData } from "@/lib/ares";

let db: Database;

const SKODA: CompanyData = {
  ico: "27082440",
  name: "Škoda Auto a.s.",
  legalForm: "121",
  dateEstablished: "1991-11-20",
  address: {
    street: "Václavské náměstí",
    houseNumber: 1,
    city: "Praha",
    postalCode: 11000,
  },
};

const SAVED_BASE = {
  ico: "27082440",
  name: "Škoda Auto a.s.",
  legalForm: "Akciová společnost",
  dateEstablished: "1991-11-20",
  status: "Aktivní",
  address: "Václavské náměstí 1, Praha, 11000",
  vatId: null,
  geocodingKey: "václavské náměstí 1, praha, 11000",
} as const;

beforeAll(async () => {
  const buf = readFileSync(resolve("node_modules/sql.js/dist/sql-wasm.wasm"));
  const wasmBinary: ArrayBuffer = buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength,
  );
  const SQL = await initSqlJs({ wasmBinary });
  db = new SQL.Database();
  db.run(SQL_SCHEMA);
});

beforeEach(() => {
  db.run("DELETE FROM saved_companies");
  db.run("DELETE FROM ares_cache");
  db.run("DELETE FROM geocoding_cache");
});

// ─── ARES cache ───────────────────────────────────────────────────────────────

describe("getCachedAres / saveAresCache", () => {
  it("returns null on cache miss", () => {
    expect(getCachedAres(db, "27082440")).toBeNull();
  });

  it("returns stored data after save", () => {
    saveAresCache(db, "27082440", SKODA);
    const cached = getCachedAres(db, "27082440");
    expect(cached).toEqual(SKODA);
  });

  it("overwrites existing cache entry on second save", () => {
    saveAresCache(db, "27082440", SKODA);
    const updated = { ...SKODA, name: "Updated Name" };
    saveAresCache(db, "27082440", updated);
    expect(getCachedAres(db, "27082440")?.name).toBe("Updated Name");
  });

  it("returns null for a different IČO", () => {
    saveAresCache(db, "27082440", SKODA);
    expect(getCachedAres(db, "45272271")).toBeNull();
  });
});

// ─── Geocoding cache ──────────────────────────────────────────────────────────

describe("getCachedGeocoding / saveGeocodingCache", () => {
  it("returns null on cache miss", () => {
    expect(getCachedGeocoding(db, "praha")).toBeNull();
  });

  it("returns stored coords after save", () => {
    saveGeocodingCache(db, "praha, 11000", { lat: 50.0755, lng: 14.4378 });
    expect(getCachedGeocoding(db, "praha, 11000")).toEqual({
      lat: 50.0755,
      lng: 14.4378,
    });
  });

  it("returns null for a different address key", () => {
    saveGeocodingCache(db, "brno, 60200", { lat: 49.1951, lng: 16.6068 });
    expect(getCachedGeocoding(db, "olomouc")).toBeNull();
  });
});

// ─── Saved companies ──────────────────────────────────────────────────────────

describe("isCompanySaved", () => {
  it("returns false when not saved", () => {
    expect(isCompanySaved(db, "27082440")).toBe(false);
  });

  it("returns true after saving", () => {
    saveCompany(db, SAVED_BASE);
    expect(isCompanySaved(db, "27082440")).toBe(true);
  });

  it("returns false for a different IČO", () => {
    saveCompany(db, SAVED_BASE);
    expect(isCompanySaved(db, "45272271")).toBe(false);
  });
});

describe("saveCompany / removeCompany", () => {
  it("persists all fields and retrieves them", () => {
    saveCompany(db, SAVED_BASE);
    const list = listSavedCompanies(db);
    expect(list).toHaveLength(1);
    const row = list[0];
    expect(row.ico).toBe("27082440");
    expect(row.name).toBe("Škoda Auto a.s.");
    expect(row.legalForm).toBe("Akciová společnost");
    expect(row.status).toBe("Aktivní");
    expect(row.geocodingKey).toBe("václavské náměstí 1, praha, 11000");
    expect(row.savedAt).toBeTruthy();
  });

  it("removes a saved company", () => {
    saveCompany(db, SAVED_BASE);
    removeCompany(db, "27082440");
    expect(listSavedCompanies(db)).toHaveLength(0);
  });

  it("is idempotent when removing a non-existent company", () => {
    expect(() => removeCompany(db, "00000000")).not.toThrow();
  });

  it("replaces existing entry on duplicate IČO (upsert)", () => {
    saveCompany(db, SAVED_BASE);
    saveCompany(db, { ...SAVED_BASE, name: "Škoda Auto (updated)" });
    const list = listSavedCompanies(db);
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("Škoda Auto (updated)");
  });
});

describe("listSavedCompanies", () => {
  it("returns empty array when no companies saved", () => {
    expect(listSavedCompanies(db)).toEqual([]);
  });

  it("orders results by savedAt descending", async () => {
    saveCompany(db, SAVED_BASE);
    // Small delay to guarantee different savedAt timestamp
    await new Promise((r) => setTimeout(r, 10));
    saveCompany(db, {
      ico: "45272271",
      name: "ČEZ a.s.",
      legalForm: "Akciová společnost",
      dateEstablished: "1992-05-01",
      status: "Aktivní",
      address: "Duhová 2/1444, Praha 4",
      vatId: "CZ45272271",
      geocodingKey: "duhová 2/1444, praha 4",
    });
    const list = listSavedCompanies(db);
    expect(list[0].ico).toBe("45272271");
    expect(list[1].ico).toBe("27082440");
  });
});

// ─── CSV export ───────────────────────────────────────────────────────────────

describe("listCompaniesForExport", () => {
  it("returns empty array when nothing saved", () => {
    expect(listCompaniesForExport(db)).toEqual([]);
  });

  it("returns saved company enriched with ares_cache metadata", () => {
    saveAresCache(db, "27082440", SKODA);
    saveCompany(db, SAVED_BASE);
    const rows = listCompaniesForExport(db);
    expect(rows).toHaveLength(1);
    expect(rows[0].ico).toBe("27082440");
    expect(rows[0].lastVerifiedAt).toBeTruthy();
    expect(["API", "cache"]).toContain(rows[0].dataSource);
  });

  it("returns null coords when geocoding not cached", () => {
    saveCompany(db, SAVED_BASE);
    const rows = listCompaniesForExport(db);
    expect(rows[0].lat).toBeNull();
    expect(rows[0].lng).toBeNull();
  });

  it("joins geocoding coordinates when cached", () => {
    saveGeocodingCache(db, "václavské náměstí 1, praha, 11000", {
      lat: 50.0755,
      lng: 14.4378,
    });
    saveCompany(db, SAVED_BASE);
    const rows = listCompaniesForExport(db);
    expect(rows[0].lat).toBeCloseTo(50.0755);
    expect(rows[0].lng).toBeCloseTo(14.4378);
  });
});

// ─── Geocoding key backfill ───────────────────────────────────────────────────

describe("backfillGeocodingKeys", () => {
  it("returns 0 when all companies already have geocoding_key", () => {
    saveCompany(db, SAVED_BASE);
    expect(backfillGeocodingKeys(db)).toBe(0);
  });

  it("fills geocoding_key from ares_cache for companies missing it", () => {
    saveCompany(db, { ...SAVED_BASE, geocodingKey: null });
    saveAresCache(db, "27082440", SKODA);
    const count = backfillGeocodingKeys(db);
    expect(count).toBe(1);
    const row = listSavedCompanies(db)[0];
    expect(row.geocodingKey).toBeTruthy();
  });

  it("returns 0 when there are no saved companies", () => {
    expect(backfillGeocodingKeys(db)).toBe(0);
  });
});
