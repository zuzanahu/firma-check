"use client";

import { useEffect, useState } from "react";
import initSqlJs, { type Database } from "sql.js";

type Row = { id: number; name: string };

export default function SqlDemo() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let db: Database | undefined;

    (async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: (file) => `/${file}`,
        });

        db = new SQL.Database();
        db.run(`
          CREATE TABLE company (id INTEGER PRIMARY KEY, name TEXT);
          INSERT INTO company (name) VALUES ('Acme s.r.o.'), ('Globex a.s.'), ('Initech');
        `);

        const result = db.exec("SELECT id, name FROM company ORDER BY id");
        const [{ values }] = result;
        setRows(values.map(([id, name]) => ({ id: id as number, name: name as string })));
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      db?.close();
    };
  }, []);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        sql.js demo
      </h2>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">Error: {error}</p>
      )}
      {!error && !rows && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading SQLite…</p>
      )}
      {rows && (
        <ul className="text-sm text-zinc-700 dark:text-zinc-300">
          {rows.map((row) => (
            <li key={row.id}>
              #{row.id} — {row.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
