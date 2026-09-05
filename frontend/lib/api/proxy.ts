import { NextResponse } from "next/server";

// Only the explicit public route handlers call this helper. Admin routes are not proxied.
export async function proxyToSpring(
  path: string,
  request: Request,
  body?: unknown,
) {
  try {
    const base = (process.env.BACKEND_URL || "http://127.0.0.1:8080").replace(
      /\/$/,
      "",
    );
    const response = await fetch(`${base}/api/v1${path}`, {
      method: request.method,
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(4000)]),
    });
    const result: unknown = await response.json();
    if (!result || typeof result !== "object" || !("success" in result))
      throw new Error("Unexpected backend response");
    return NextResponse.json(result, {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BACKEND_UNAVAILABLE",
          message: "서버에 연결하지 못했어요. 잠시 후 다시 시도해주세요.",
        },
      },
      { status: 503 },
    );
  }
}
