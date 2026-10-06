import { proxyToSpring } from "@/lib/api/proxy";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return proxyToSpring("/stats", request);
}
