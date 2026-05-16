import CompanyDetail from "@/app/components/CompanyDetail";

/**
 * Company detail page — fetches and displays information for the given IČO.
 * @param params - Route params promise resolving to `{ ico: string }`.
 * @param searchParams - Query params promise; `nazev` carries the optional name to verify.
 * @returns Page with company detail card.
 */
export default async function FirmaPage({
  params,
  searchParams,
}: {
  params: Promise<{ ico: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { ico } = await params;
  const { nazev } = await searchParams;
  const enteredName = typeof nazev === "string" ? nazev : undefined;

  return (
    <div id="main-content" className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
          <CompanyDetail ico={ico} enteredName={enteredName} />
        </div>
      </div>
    </div>
  );
}
