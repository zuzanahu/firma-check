import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/geocode/route";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function makeReq(search: string): Parameters<typeof GET>[0] {
  const req = new Request(`http://localhost/api/geocode${search}`);
  Object.defineProperty(req, "nextUrl", {
    value: new URL(`http://localhost/api/geocode${search}`),
  });
  return req as Parameters<typeof GET>[0];
}

const MAPY_SUCCESS = {
  items: [{ position: { lat: 50.0755, lon: 14.4378 } }],
};

beforeEach(() => {
  mockFetch.mockReset();
  vi.unstubAllEnvs();
});

describe("GET /api/geocode", () => {
  it("returns 400 when query parameter q is missing", async () => {
    const res = await GET(makeReq(""));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Missing query parameter");
  });

  it("returns 400 when q is empty string", async () => {
    const res = await GET(makeReq("?q="));
    expect(res.status).toBe(400);
  });

  it("returns 503 when GEOCODE_API_KEY is not set", async () => {
    vi.stubEnv("GEOCODE_API_KEY", "");
    const res = await GET(makeReq("?q=Praha"));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toContain("not configured");
  });

  it("returns 200 with lat/lng on success", async () => {
    vi.stubEnv("GEOCODE_API_KEY", "test-key");
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(MAPY_SUCCESS), { status: 200 }),
    );

    const res = await GET(makeReq("?q=Praha"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ lat: 50.0755, lng: 14.4378 });
  });

  it("returns 404 when Mapy.com returns no results", async () => {
    vi.stubEnv("GEOCODE_API_KEY", "test-key");
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ items: [] }), { status: 200 }),
    );

    const res = await GET(makeReq("?q=NonexistentPlace12345"));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain("No results");
  });

  it("returns 502 when Mapy.com returns non-OK status", async () => {
    vi.stubEnv("GEOCODE_API_KEY", "test-key");
    mockFetch.mockResolvedValue(new Response(null, { status: 429 }));

    const res = await GET(makeReq("?q=Praha"));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toContain("429");
  });

  it("includes the API key in the upstream request", async () => {
    vi.stubEnv("GEOCODE_API_KEY", "secret-key-xyz");
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(MAPY_SUCCESS), { status: 200 }),
    );

    await GET(makeReq("?q=Praha"));

    const calledUrl: string = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain("apikey=secret-key-xyz");
  });

  it("constrains upstream search to Czech Republic", async () => {
    vi.stubEnv("GEOCODE_API_KEY", "test-key");
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(MAPY_SUCCESS), { status: 200 }),
    );

    await GET(makeReq("?q=Praha"));

    const calledUrl: string = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain("locality=cz");
    expect(calledUrl).toContain("limit=1");
  });
});
