import type { CompanyData } from "@/lib/ares";
import { getLegalFormLabel } from "@/lib/legalForms";

function formatAddress(address: CompanyData["address"]): string {
  if (!address) return "—";
  if (address.textAddress) return address.textAddress;

  const street = address.street
    ? [
        address.street,
        address.houseNumber,
        address.orientationNumber
          ? `/${address.orientationNumber}${address.orientationLetter ?? ""}`
          : undefined,
      ]
        .filter(Boolean)
        .join(" ")
    : undefined;

  const city = address.postalCode
    ? `${address.postalCode} ${address.city ?? ""}`
    : address.city;

  return [street, city].filter(Boolean).join(", ") || "—";
}

function resolveStatus(data: CompanyData): string {
  if (data.dateTerminated) return "Zaniklý";
  return "Aktivní";
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("cs-CZ");
}

/**
 * Renders a definition list of the key company fields from ARES data.
 *
 * @param data - Mapped company data returned by fetchAres.
 * @returns A styled dl element with all required fields.
 */
export default function CompanyCard({ data }: { data: CompanyData }) {
  const fields: { label: string; value: string }[] = [
    { label: "IČO", value: data.ico },
    { label: "Obchodní název", value: data.name ?? "—" },
    { label: "Právní forma", value: getLegalFormLabel(data.legalForm) },
    { label: "Datum vzniku", value: formatDate(data.dateEstablished) },
    { label: "Stav subjektu", value: resolveStatus(data) },
    { label: "Adresa sídla", value: formatAddress(data.address) },
    { label: "DIČ", value: data.vatId ?? "—" },
  ];

  return (
    <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {fields.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col gap-0.5 py-3 sm:flex-row sm:gap-4"
        >
          <dt className="w-40 shrink-0 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </dt>
          <dd className="text-sm text-zinc-900 dark:text-zinc-100">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
