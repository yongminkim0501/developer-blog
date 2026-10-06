import { NextResponse } from "next/server";
import { proxyToSpring } from "@/lib/api/proxy";
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (
      !body ||
      typeof body !== "object" ||
      !("visitorId" in body) ||
      typeof body.visitorId !== "string"
    )
      throw new Error("Invalid visitor");
    return proxyToSpring("/stats/visits", request, {
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
