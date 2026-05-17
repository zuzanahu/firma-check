import type { NextRequest } from "next/server";

const MAPY_GEOCODE = "https://api.mapy.com/v1/geocode";

/**
 * Proxies address geocoding to Mapy.com and returns coordinates.
 * @param req - Incoming request with `q` search parameter.
 * @returns JSON `{ lat, lng }` or `{ error }` on failure.
 */
export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return Response.json(
      { error: "Missing query parameter q." },
      { status: 400 },
    );
  }

  const apiKey = process.env.GEOCODE_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Geocoding not configured." },
      { status: 503 },
    );
  }

  const url = new URL(MAPY_GEOCODE);
  url.searchParams.set("query", query);
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("lang", "cs");
  url.searchParams.set("limit", "1");
  url.searchParams.set("type", "regional.address");
  url.searchParams.set("locality", "cz");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return Response.json(
      { error: `Geocoding service returned status ${res.status}.` },
      { status: 502 },
    );
  }

  const data = (await res.json()) as {
    items?: { position?: { lat: number; lon: number } }[];
  };
  const position = data.items?.[0]?.position;

  if (!position) {
    return Response.json({ error: "No results found." }, { status: 404 });
  }

  return Response.json({ lat: position.lat, lng: position.lon });
}
