"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateIco } from "@/lib/validateIco";

/**
 * Form for entering a Czech company ID (IČO).
 * Validates the checksum locally and navigates to /firma/[ico] on success.
 */
export default function IcoForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const ico = (new FormData(e.currentTarget).get("ico") as string) ?? "";
    const result = validateIco(ico);
    if (!result.valid) {
      setError(result.error);
      return;
    }
    setError(null);
    router.push(`/firma/${result.ico}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="ico"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          IČO
        </label>
        <input
          id="ico"
          name="ico"
          type="text"
          inputMode="numeric"
          maxLength={8}
          placeholder="např. 27074358"
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Ověřit firmu
      </button>
    </form>
  );
}
