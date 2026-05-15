"use client";

import { useEffect, useState } from "react";
import { getDb, saveDb } from "@/db/client";
import { isCompanySaved, saveCompany, removeCompany } from "@/db/queries";
import { getLegalFormLabel } from "@/lib/legalForms";
import { buildAddressQuery, normalizeAddressKey } from "@/lib/address";
import type { CompanyData } from "@/lib/ares";

function resolveStatus(data: CompanyData): string {
  return data.dateTerminated ? "Zaniklý" : "Aktivní";
}

function resolveAddress(data: CompanyData): string | null {
  const a = data.address;
  if (!a) return null;
  if (a.textAddress) return a.textAddress;

  const street = a.street
    ? [a.street, a.houseNumber, a.orientationNumber ? `/${a.orientationNumber}${a.orientationLetter ?? ""}` : undefined]
        .filter(Boolean)
        .join(" ")
    : undefined;
  const city = a.postalCode ? `${a.postalCode} ${a.city ?? ""}` : a.city;
  return [street, city].filter(Boolean).join(", ") || null;
}

/**
 * Toggle button for saving and removing a company from the local saved list.
 * Reads and writes the saved_companies table via the sql.js singleton.
 *
 * @param data - Full company data loaded from ARES.
 * @returns A button that shows "Uložit" or "Odebrat" depending on saved state.
 */
export default function SaveButton({ data }: { data: CompanyData }) {
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    getDb().then((db) => setSaved(isCompanySaved(db, data.ico)));
  }, [data.ico]);

  async function toggle() {
    setPending(true);
    const db = await getDb();
    if (saved) {
      removeCompany(db, data.ico);
    } else {
      saveCompany(db, {
        ico: data.ico,
        name: data.name ?? "—",
        legalForm: getLegalFormLabel(data.legalForm),
        dateEstablished: data.dateEstablished ?? null,
        status: resolveStatus(data),
        address: resolveAddress(data),
        vatId: data.vatId ?? null,
        geocodingKey: normalizeAddressKey(buildAddressQuery(data.address)) || null,
      });
    }
    await saveDb();
    setSaved((prev) => !prev);
    setPending(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        saved
          ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
          : "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      }`}
    >
      {saved ? "Odebrat z uložených" : "Uložit firmu"}
    </button>
  );
}
