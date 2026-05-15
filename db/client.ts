import initSqlJs, { type Database } from "sql.js";
import { SQL_SCHEMA } from "./schema";

const IDB_NAME = "firma-check";
const IDB_STORE = "db";
const IDB_KEY = "data";

let instance: Database | null = null;

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadBytes(): Promise<Uint8Array | null> {
  const idb = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
    req.onsuccess = () => resolve((req.result as Uint8Array) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function storeBytes(bytes: Uint8Array): Promise<void> {
  const idb = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, "readwrite");
    const req = tx.objectStore(IDB_STORE).put(bytes, IDB_KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Returns the singleton sql.js Database, initializing it from IndexedDB on first call.
 * On subsequent calls, returns the cached in-memory instance immediately.
 *
 * @returns Initialized sql.js Database with the application schema applied.
 */
export async function getDb(): Promise<Database> {
  if (instance) return instance;

  const SQL = await initSqlJs({ locateFile: () => "/sql-wasm-browser.wasm" });

  const bytes = await loadBytes();
  if (bytes) {
    instance = new SQL.Database(bytes);
  } else {
    instance = new SQL.Database();
    instance.run(SQL_SCHEMA);
    await saveDb();
  }

  return instance;
}

/**
 * Serializes the in-memory database and persists it to IndexedDB.
 * Call this after every write operation.
 */
export async function saveDb(): Promise<void> {
  if (!instance) return;
  await storeBytes(instance.export());
}
