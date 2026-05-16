import IcoForm from "@/app/components/IcoForm";

/**
 * Homepage with the IČO search form.
 * @returns Landing page UI.
 */
export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main id="main-content" className="flex w-full max-w-md flex-col gap-6 px-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-balance text-zinc-900 dark:text-zinc-100">
            Vyhledat firmu
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Zadejte IČO a ověřte základní informace o české firmě.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
          <IcoForm />
        </div>
      </main>
    </div>
  );
}
