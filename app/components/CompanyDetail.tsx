"use client";

import { useEffect, useState } from "react";
import { fetchAres, type CompanyData } from "@/lib/ares";
import CompanyCard from "./CompanyCard";

type LoadStatus = "loading" | "ok" | "notfound" | "error";

/**
 * Client island that fetches and displays ARES data for a given IČO.
 *
 * @param ico - Normalized 8-digit IČO string.
 * @returns Loading indicator, error message, or rendered CompanyCard.
 */
export default function CompanyDetail({ ico }: { ico: string }) {
  const [data, setData] = useState<CompanyData | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    fetchAres(ico)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setStatus("ok");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const httpStatus = (err as { status?: number }).status;
        setStatus(httpStatus === 404 ? "notfound" : "error");
      });
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

  return <CompanyCard data={data} />;
}
