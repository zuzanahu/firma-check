"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { validateIco } from "@/lib/validateIco";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:ring-zinc-400";

/**
 * Form for entering a Czech company ID (IČO) and an optional company name.
 * Validates the checksum locally and navigates to /firma/[ico] on success.
 * If a name is provided it is passed as the `nazev` query parameter.
 */
export default function IcoForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const icoRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const ico = (data.get("ico") as string) ?? "";
    const nazev = ((data.get("nazev") as string) ?? "").trim();
    const result = validateIco(ico);
    if (!result.valid) {
      setError(result.error);
      icoRef.current?.focus();
      return;
    }
    setError(null);
    const url = nazev
      ? `/firma/${result.ico}?nazev=${encodeURIComponent(nazev)}`
      : `/firma/${result.ico}`;
    router.push(url);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="ico"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          IČO <span className="text-base text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          ref={icoRef}
          id="ico"
          name="ico"
          type="text"
          inputMode="numeric"
          maxLength={8}
          required
          autoComplete="off"
          spellCheck={false}
          placeholder="např. 27074358…"
          aria-describedby={error ? "ico-error" : undefined}
          aria-invalid={error ? true : undefined}
          className={inputClass}
        />
        {error && (
          <p id="ico-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="nazev"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Název firmy{" "}
          <span className="font-normal text-zinc-400 dark:text-zinc-500">
            (volitelné)
          </span>
        </label>
        <input
          id="nazev"
          name="nazev"
          type="text"
          autoComplete="off"
          placeholder="např. Asseco Central Europe…"
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        className="mt-1 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:focus-visible:ring-zinc-400"
      >
        Ověřit firmu
      </button>
    </form>
  );
}
