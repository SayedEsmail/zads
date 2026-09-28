import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE = (process.env.API_BASE_URL || "https://api.zads.app").replace(/\/$/, "");

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

/** Upstream Helmet headers confuse browsers when forwarded through the BFF. */
const STRIP_FROM_UPSTREAM = new Set([
  "content-security-policy",
  "content-security-policy-report-only",
  "cross-origin-embedder-policy",
  "cross-origin-opener-policy",
  "cross-origin-resource-policy",
  "origin-agent-cluster",
  "x-frame-options",
  "strict-transport-security",
  "x-xss-protection",
  "x-content-type-options",
  "x-dns-prefetch-control",
  "x-download-options",
  "x-permitted-cross-domain-policies",
  "referrer-policy",
  // undici/fetch decompresses the body; forwarding these causes
  // net::ERR_CONTENT_DECODING_FAILED in the browser (200 OK + broken decode).
  "content-encoding",
  "content-length",
]);

type RouteContext = { params: Promise<{ backend: string[] }> };

async function proxy(req: NextRequest, context: RouteContext) {
  const { backend } = await context.params;
  const subpath = (backend || []).join("/");
  if (!subpath) {
    return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 });
  }

  const incoming = new URL(req.url);
  const target = `${API_BASE}/api/${subpath}${incoming.search}`;

  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        Allow: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, Idempotency-Key, idempotency-key",
        "Access-Control-Max-Age": "0",
        "Cache-Control": "no-store",
      },
    });
  }

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower)) return;
    // Keep API auth header-only; do not leak NextAuth session cookies upstream.
    if (lower === "cookie") return;
    // Ask upstream for identity encoding so we never re-advertise compression.
    if (lower === "accept-encoding") return;
    headers.set(key, value);
  });
  headers.set("Accept-Encoding", "identity");

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
    // Required by Node fetch when streaming a request body.
    (init as RequestInit & { duplex?: string }).duplex = "half";
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch {
    return NextResponse.json(
      { success: false, message: "Upstream API unreachable" },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }

  const outHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower) || STRIP_FROM_UPSTREAM.has(lower)) return;
    if (lower.startsWith("access-control-")) return;
    outHeaders.set(key, value);
  });
  outHeaders.set("Cache-Control", "no-store");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
