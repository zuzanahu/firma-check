import type { Metadata } from "next";
import SavedList from "@/app/components/SavedList";

export const metadata: Metadata = {
  title: "Moje firmy – Firma Check",
  description: "Seznam uložených firem",
};

/**
 * Page displaying the user's locally saved companies.
 *
 * @returns Server Component shell with the SavedList client island.
 */
export default function MojeFirmyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Moje firmy
      </h1>
      <SavedList />
    </main>
  );
}
