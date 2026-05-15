import type { NextRequest } from "next/server";

const MAPY_GEOCODE = "https://api.mapy.com/v1/geocode";

/**
 * GET /api/geocode?q=<address>
 * Proxies the query to the Mapy.com Geocoding API.
 * A server-side proxy is used so the API key is not duplicated in client bundles
 * and so a single request path handles caching headers uniformly.
 * Returns { lat, lng } for the first result, or an error JSON with the status.
 *
 * @param req - Incoming request; must include the `q` search parameter.
 * @returns JSON with { lat: number, lng: number } or { error: string }.
 */
export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return Response.json({ error: "Missing query parameter q." }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_MAPY_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Geocoding not configured." }, { status: 503 });
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
