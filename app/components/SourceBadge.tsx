export type DataSource = "api" | "cache";

/**
 * Chip indicating where data was loaded from.
 *
 * @param source - "api" for a live network request, "cache" for SQLite.
 * @returns A colored inline badge element.
 */
export default function SourceBadge({ source }: { source: DataSource }) {
  if (source === "api") {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
        API
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
      SQLite cache
    </span>
  );
}
