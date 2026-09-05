import { proxyToSpring } from "@/lib/api/proxy";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q");
  return proxyToSpring(
    `/search${q === null ? "" : `?${new URLSearchParams({ q })}`}`,
    request,
  );
}
