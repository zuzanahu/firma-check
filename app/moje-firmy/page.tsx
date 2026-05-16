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
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-12">
      <SavedList />
    </main>
  );
}
