"use client";

import { useEffect, useState } from "react";
import { fetchAres, type CompanyData } from "@/lib/ares";
import { getDb, saveDb } from "@/db/client";
import { getCachedAres, saveAresCache } from "@/db/queries";
import CompanyCard from "./CompanyCard";
import SourceBadge, { type DataSource } from "./SourceBadge";

type LoadStatus = "loading" | "ok" | "notfound" | "error";

/**
 * Client island that fetches and displays ARES data for a given IČO.
 * Checks the local SQLite cache before calling the network.
 *
 * @param ico - Normalized 8-digit IČO string.
 * @returns Loading indicator, error message, or rendered CompanyCard with source badge.
 */
export default function CompanyDetail({ ico }: { ico: string }) {
  const [data, setData] = useState<CompanyData | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [source, setSource] = useState<DataSource>("api");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const db = await getDb();

      const cached = getCachedAres(db, ico);
      if (cached) {
        if (!cancelled) {
          setData(cached);
          setSource("cache");
          setStatus("ok");
        }
        return;
      }

      try {
        const result = await fetchAres(ico);
        if (cancelled) return;
        saveAresCache(db, ico, result);
        await saveDb();
        setData(result);
        setSource("api");
        setStatus("ok");
      } catch (err) {
        if (cancelled) return;
        const httpStatus = (err as { status?: number }).status;
        setStatus(httpStatus === 404 ? "notfound" : "error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [ico]);

  if (status === "loading") {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Načítám…</p>
    );
  }

  if (status === "notfound") {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Firma s tímto IČO nebyla v ARES nalezena.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Nepodařilo se načíst data z ARES, zkuste to prosím znovu.
      </p>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <span>ARES data:</span>
        <SourceBadge source={source} />
      </div>
      <CompanyCard data={data} />
    </div>
  );
}
