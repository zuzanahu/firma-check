import type { NextRequest } from "next/server";

const ARES_BASE = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest";

/**
 * GET /api/ares/[ico]
 * Proxies the request to ARES and returns the raw JSON response.
 * Returns 404 when ARES reports the entity does not exist.
 *
 * @param _req - Incoming Next.js request (unused, kept for signature compatibility).
 * @param params - Route params promise resolving to `{ ico: string }`.
 * @returns ARES JSON response or an error JSON with `{ error: string }`.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ico: string }> },
) {
  const { ico } = await params;

  const aresRes = await fetch(`${ARES_BASE}/ekonomicke-subjekty/${ico}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (aresRes.status === 404) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  if (!aresRes.ok) {
    return Response.json(
      { error: `ARES returned status ${aresRes.status}.` },
      { status: 502 },
    );
  }

  const data: unknown = await aresRes.json();
  return Response.json(data);
}
