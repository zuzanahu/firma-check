import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchAres } from "@/lib/ares";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const ARES_RAW = {
  ico: "27082440",
  obchodniJmeno: "Alza.cz a.s.",
  pravniForma: "121",
  datumVzniku: "1994-01-01",
  datumZaniku: null,
  dic: "CZ27082440",
  sidlo: {
    nazevUlice: "Jankovcova",
    cisloDomovni: 1522,
    cisloOrientacni: 53,
    cisloOrientacniPismeno: "a",
    nazevObce: "Praha",
    nazevCastiObce: "Holešovice",
    psc: 17000,
    textovaAdresa: "Jankovcova 1522/53a, 170 00 Praha",
  },
  seznamRegistraci: {
    stavZdrojeRes: "AKTIVNI",
  },
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe("fetchAres", () => {
  it("returns parsed CompanyData on a successful response", async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(ARES_RAW), { status: 200 }),
    );

    const data = await fetchAres("27082440");

    expect(data.ico).toBe("27082440");
    expect(data.name).toBe("Alza.cz a.s.");
    expect(data.legalForm).toBe("121");
    expect(data.vatId).toBe("CZ27082440");
    expect(data.dateEstablished).toBe("1994-01-01");
  });

  it("maps address fields to CompanyAddress", async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(ARES_RAW), { status: 200 }),
    );

    const { address } = await fetchAres("27082440");

    expect(address?.street).toBe("Jankovcova");
    expect(address?.houseNumber).toBe(1522);
    expect(address?.orientationNumber).toBe(53);
    expect(address?.orientationLetter).toBe("a");
    expect(address?.city).toBe("Praha");
    expect(address?.cityPart).toBe("Holešovice");
    expect(address?.postalCode).toBe(17000);
    expect(address?.textAddress).toBe("Jankovcova 1522/53a, 170 00 Praha");
  });

  it("maps registrations status", async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(ARES_RAW), { status: 200 }),
    );

    const { registrations } = await fetchAres("27082440");

    expect(registrations?.resStatus).toBe("AKTIVNI");
  });

  it("returns undefined address when sidlo is absent", async () => {
    const raw = { ...ARES_RAW, sidlo: undefined };
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(raw), { status: 200 }),
    );

    const { address } = await fetchAres("27082440");
    expect(address).toBeUndefined();
  });

  it("returns undefined registrations when seznamRegistraci is absent", async () => {
    const raw = { ...ARES_RAW, seznamRegistraci: undefined };
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(raw), { status: 200 }),
    );

    const { registrations } = await fetchAres("27082440");
    expect(registrations).toBeUndefined();
  });

  it("throws with status 404 when the company is not found", async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: "Not found." }), { status: 404 }),
    );

    await expect(fetchAres("00000001")).rejects.toMatchObject({ status: 404 });
  });

  it("throws with status 502 when ARES is unavailable", async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: "Bad gateway." }), { status: 502 }),
    );

    await expect(fetchAres("27082440")).rejects.toMatchObject({ status: 502 });
  });

  it("throws when fetch itself rejects (network error)", async () => {
    mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(fetchAres("27082440")).rejects.toThrow("Failed to fetch");
  });

  it("calls the correct proxy path", async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(ARES_RAW), { status: 200 }),
    );

    await fetchAres("27082440");

    expect(mockFetch.mock.calls[0][0]).toBe("/api/ares/27082440");
  });
});
