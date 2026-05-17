import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/ares/[ico]/route";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function makeCtx(ico: string) {
  return { params: Promise.resolve({ ico }) } as Parameters<typeof GET>[1];
}

function makeReq(): Parameters<typeof GET>[0] {
  return new Request("http://localhost/api/ares/27082440") as Parameters<
    typeof GET
  >[0];
}

const ARES_PAYLOAD = {
  ico: "27082440",
  obchodniJmeno: "Škoda Auto a.s.",
  pravniForma: "121",
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe("GET /api/ares/[ico]", () => {
  it("proxies successful ARES response with status 200", async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(ARES_PAYLOAD), { status: 200 }),
    );

    const res = await GET(makeReq(), makeCtx("27082440"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ico).toBe("27082440");
    expect(body.obchodniJmeno).toBe("Škoda Auto a.s.");
  });

  it("returns 404 when ARES responds with 404", async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 404 }));

    const res = await GET(makeReq(), makeCtx("00000000"));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Not found.");
  });

  it("returns 502 when ARES responds with non-OK status", async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 503 }));

    const res = await GET(makeReq(), makeCtx("27082440"));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toContain("503");
  });

  it("calls ARES API with the correct IČO in the URL", async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(ARES_PAYLOAD), { status: 200 }),
    );

    await GET(makeReq(), makeCtx("27082440"));

    const calledUrl: string = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain("/ekonomicke-subjekty/27082440");
  });

  it("requests JSON from ARES", async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(ARES_PAYLOAD), { status: 200 }),
    );

    await GET(makeReq(), makeCtx("27082440"));

    const calledOptions = mockFetch.mock.calls[0][1] as RequestInit & {
      headers?: Record<string, string>;
      next?: { revalidate: number };
    };
    expect(calledOptions.headers).toMatchObject({ Accept: "application/json" });
    expect(calledOptions.next?.revalidate).toBe(0);
  });
});
