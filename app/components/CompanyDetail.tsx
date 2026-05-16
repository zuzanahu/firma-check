"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { fetchAres, type CompanyData } from "@/lib/ares";
import { getDb, saveDb } from "@/db/client";
import { getCachedAres, saveAresCache } from "@/db/queries";
import { buildAddressQuery } from "@/lib/address";
import { compareCompanyName } from "@/lib/compareCompanyName";
import CompanyCard from "./CompanyCard";
import SaveButton from "./SaveButton";
import SourceBadge, { type DataSource } from "./SourceBadge";

const FirmaMap = dynamic(() => import("./FirmaMap"), { ssr: false });

type LoadStatus = "loading" | "ok" | "notfound" | "error";

/**
 * Client island that fetches and displays ARES data for a given IČO.
 * Checks the local SQLite cache before calling the network.
 *
 * @param ico - Normalized 8-digit IČO string.
 * @param enteredName - Optional company name entered by the user; compared against ARES data.
 * @returns Loading indicator, error message, or rendered CompanyCard with source badge.
 */
export default function CompanyDetail({
  ico,
  enteredName,
}: {
  ico: string;
  enteredName?: string;
}) {
  const [data, setData] = useState<CompanyData | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [source, setSource] = useState<DataSource>("api");
  const [geocodingSource, setGeocodingSource] = useState<DataSource | null>(
    null,
  );

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

  const addressQuery = data ? buildAddressQuery(data.address) : null;

  const nameMatch =
    data && enteredName && data.name
      ? compareCompanyName(enteredName, data.name)
      : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight text-balance text-zinc-900 dark:text-zinc-100">
          Detail firmy
        </h1>
        {data && <SaveButton data={data} />}
      </div>

      {status === "loading" && (
        <p aria-live="polite" className="text-sm text-zinc-500 dark:text-zinc-400">
          Načítám…
        </p>
      )}
      {status === "notfound" && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          Firma s tímto IČO nebyla v ARES nalezena.
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          Nepodařilo se načíst data z ARES, zkuste to prosím znovu.
        </p>
      )}

      {data && (
        <div className="flex flex-col gap-4">
          <CompanyCard data={data} />
          {nameMatch && (
            <NameMatchBanner
              entered={enteredName!}
              aresName={data.name!}
              result={nameMatch}
            />
          )}
        </div>
      )}

      {addressQuery && (
        <FirmaMap
          address={addressQuery}
          onSourceChangeAction={setGeocodingSource}
        />
      )}

      {data && (
        <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-600">
            Technické informace
          </p>
          <dl className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
              <dt>Zdroj dat ARES:</dt>
              <dd>
                <SourceBadge source={source} />
              </dd>
            </div>
            {geocodingSource && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                <dt>Zdroj geokódování:</dt>
                <dd>
                  <SourceBadge source={geocodingSource} />
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}

type NameMatchBannerProps = {
  entered: string;
  aresName: string;
  result: "match" | "partial" | "none";
};

function NameMatchBanner({ entered, aresName, result }: NameMatchBannerProps) {
  const styles = {
    match: "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300",
    partial:
      "bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    none: "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300",
  } as const;

  const messages = {
    match: (
      <>
        Zadaný název <q>{entered}</q> odpovídá firmě <q>{aresName}</q>.
      </>
    ),
    partial: (
      <>
        Zadaný název <q>{entered}</q> částečně odpovídá firmě <q>{aresName}</q>.
      </>
    ),
    none: (
      <>
        Zadaný název <q>{entered}</q> se liší od názvu uvedeného v ARES (
        <q>{aresName}</q>).
      </>
    ),
  } as const;

  return (
    <p className={`rounded-lg px-4 py-3 text-sm ${styles[result]}`}>
      {messages[result]}
    </p>
  );
}
