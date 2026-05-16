import Link from "next/link";
import IcoForm from "@/app/components/IcoForm";

/**
 * Homepage with the IČO search form and a link to saved companies.
 * @returns Landing page UI.
 */
export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex w-full max-w-md flex-col gap-8 rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Firma Check
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Zadejte IČO a ověřte základní informace o české firmě.
          </p>
        </div>

        <IcoForm />

        <Link
          href="/moje-firmy"
          className="text-center text-sm text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Moje uložené firmy
        </Link>
      </main>
    </div>
  );
}
