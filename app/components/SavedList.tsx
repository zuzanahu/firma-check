"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDb, saveDb } from "@/db/client";
import { listSavedCompanies, removeCompany, type SavedCompany } from "@/db/queries";

/**
 * Client island displaying the list of saved companies from local SQLite storage.
 * Allows removing individual companies from the list.
 *
 * @returns A table of saved companies or an empty-state message.
 */
export default function SavedList() {
  const [companies, setCompanies] = useState<SavedCompany[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getDb().then((db) => {
      setCompanies(listSavedCompanies(db));
      setLoaded(true);
    });
  }, []);

  async function handleRemove(ico: string) {
    const db = await getDb();
    removeCompany(db, ico);
    await saveDb();
    setCompanies((prev) => prev.filter((c) => c.ico !== ico));
  }

  if (!loaded) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Načítám…</p>;
  }

  if (companies.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Zatím nemáte uložené žádné firmy.{" "}
        <Link href="/" className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100">
          Vyhledat firmu
        </Link>
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            <th className="pb-3 pr-4 font-medium">IČO</th>
            <th className="pb-3 pr-4 font-medium">Název</th>
            <th className="pb-3 pr-4 font-medium">Právní forma</th>
            <th className="pb-3 pr-4 font-medium">Stav</th>
            <th className="pb-3 pr-4 font-medium">Adresa</th>
            <th className="pb-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr
              key={company.ico}
              className="border-b border-zinc-100 dark:border-zinc-800"
            >
              <td className="py-3 pr-4">
                <Link
                  href={`/firma/${company.ico}`}
                  className="font-mono underline-offset-2 hover:underline"
                >
                  {company.ico}
                </Link>
              </td>
              <td className="py-3 pr-4 font-medium text-zinc-900 dark:text-zinc-100">
                {company.name}
              </td>
              <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                {company.legalForm ?? "—"}
              </td>
              <td className="py-3 pr-4">
                <span
                  className={
                    company.status === "Zaniklý"
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }
                >
                  {company.status ?? "—"}
                </span>
              </td>
              <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                {company.address ?? "—"}
              </td>
              <td className="py-3">
                <button
                  onClick={() => handleRemove(company.ico)}
                  className="rounded px-3 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Odebrat
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
