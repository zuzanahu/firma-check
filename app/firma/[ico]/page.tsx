import Link from "next/link";
import CompanyDetail from "@/app/components/CompanyDetail";

/**
 * Company detail page — fetches and displays information for the given IČO.
 * @param params - Route params promise resolving to `{ ico: string }`.
 * @returns Page with company detail and a back link.
 */
export default async function FirmaPage({
  params,
}: {
  params: Promise<{ ico: string }>;
}) {
  const { ico } = await params;

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Zpět
        </Link>

        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
          <h1 className="mb-6 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Detail firmy
          </h1>
          <CompanyDetail ico={ico} />
        </div>
      </div>
    </div>
  );
}
