import Image from "next/image";
import Link from "next/link";

/**
 * Persistent top navigation bar shown on every page.
 *
 * @returns Sticky header element with logo and navigation links.
 */
export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <nav
        className="mx-auto flex max-w-4xl items-center justify-between px-4 py-2"
        aria-label="Hlavní navigace"
      >
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2"
        >
          <Image
            src="/building_search_icon_v5.svg"
            alt="Firma Check"
            width={56}
            height={56}
            priority
          />
          <span className="text-xl font-bold tracking-tight" translate="no">
            <span className="text-blue-800 dark:text-blue-400">Firma</span>
            {" "}
            <span className="text-green-600 dark:text-green-500">Check</span>
          </span>
        </Link>

        <ul className="flex items-center gap-6 text-sm font-medium">
          <li>
            <Link
              href="/moje-firmy"
              className="rounded-sm text-zinc-600 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Moje firmy
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
