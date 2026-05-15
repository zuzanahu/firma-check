export interface CompanyAddress {
  street?: string;
  houseNumber?: number;
  orientationNumber?: number;
  orientationLetter?: string;
  city?: string;
  cityPart?: string;
  postalCode?: number;
  textAddress?: string;
}

export interface CompanyRegistrations {
  resStatus?: string;
}

export interface CompanyData {
  ico: string;
  name?: string;
  address?: CompanyAddress;
  legalForm?: string;
  dateEstablished?: string;
  dateTerminated?: string;
  vatId?: string;
  registrations?: CompanyRegistrations;
}

function parseAddress(raw: Record<string, unknown>): CompanyAddress {
  return {
    street: raw["nazevUlice"] as string | undefined,
    houseNumber: raw["cisloDomovni"] as number | undefined,
    orientationNumber: raw["cisloOrientacni"] as number | undefined,
    orientationLetter: raw["cisloOrientacniPismeno"] as string | undefined,
    city: raw["nazevObce"] as string | undefined,
    cityPart: raw["nazevCastiObce"] as string | undefined,
    postalCode: raw["psc"] as number | undefined,
    textAddress: raw["textovaAdresa"] as string | undefined,
  };
}

function parseResponse(data: unknown): CompanyData {
  const d = data as Record<string, unknown>;
  const address = d["sidlo"] as Record<string, unknown> | undefined;
  const reg = d["seznamRegistraci"] as Record<string, unknown> | undefined;

  return {
    ico: d["ico"] as string,
    name: d["obchodniJmeno"] as string | undefined,
    address: address ? parseAddress(address) : undefined,
    legalForm: d["pravniForma"] as string | undefined,
    dateEstablished: d["datumVzniku"] as string | undefined,
    dateTerminated: d["datumZaniku"] as string | undefined,
    vatId: d["dic"] as string | undefined,
    registrations: reg
      ? { resStatus: reg["stavZdrojeRes"] as string | undefined }
      : undefined,
  };
}

/**
 * Fetches and maps company data from the local ARES proxy route handler.
 *
 * @param ico - Normalized 8-digit IČO string.
 * @returns Mapped company data with English-named fields.
 * @throws If the network request fails or ARES returns a non-OK status.
 */
export async function fetchAres(ico: string): Promise<CompanyData> {
  const res = await fetch(`/api/ares/${ico}`);
  if (!res.ok) {
    const err: unknown = await res.json().catch(() => null);
    throw Object.assign(new Error("ARES error"), { status: res.status, body: err });
  }
  return parseResponse(await res.json());
}
