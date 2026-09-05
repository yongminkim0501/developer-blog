import { NextResponse } from "next/server";
import { proxyToSpring } from "@/lib/api/proxy";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ slug: string }> };
export async function GET(request: Request, context: Context) {
  const { slug } = await context.params;
  return proxyToSpring(`/posts/${encodeURIComponent(slug)}/views`, request);
}
export async function POST(request: Request, context: Context) {
  const { slug } = await context.params;
  try {
    const body: unknown = await request.json();
    if (
      !body ||
      typeof body !== "object" ||
      !("visitorId" in body) ||
      typeof body.visitorId !== "string"
    )
      throw new Error("Invalid body");
    return proxyToSpring(`/posts/${encodeURIComponent(slug)}/views`, request, {
      visitorId: body.visitorId,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "요청 형식을 확인해주세요.",
        },
      },
      { status: 400 },
    );
  }
}
