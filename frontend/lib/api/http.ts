import type {
  ApiResult,
  SearchItem,
  SearchService,
  ViewService,
  ViewCount,
} from "@/types";

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`/api/v1${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
      signal: init.signal
        ? AbortSignal.any([init.signal, AbortSignal.timeout(6000)])
        : AbortSignal.timeout(6000),
      cache: "no-store",
    });
    const result: unknown = await response.json();
    if (!result || typeof result !== "object" || !("success" in result))
      throw new Error("Invalid API response");
    if (result.success === false && "error" in result)
      return result as ApiResult<T>;
    if (!response.ok || result.success !== true || !("data" in result))
      throw new Error("Invalid API response");
    return result as ApiResult<T>;
  } catch (error) {
    if (init.signal?.aborted) throw error;
    return {
      success: false,
      error: {
        code: "BACKEND_UNAVAILABLE",
        message: "서버에 연결하지 못했어요. 잠시 후 다시 시도해주세요.",
      },
    };
  }
}
export const httpSearch: SearchService = {
  search: (query, signal) =>
    request<{ query: string; results: SearchItem[] }>(
      `/search?${new URLSearchParams({ q: query })}`,
      { signal },
    ),
};
export const httpViews: ViewService = {
  get: (slug, signal) =>
    request<ViewCount>(`/posts/${encodeURIComponent(slug)}/views`, { signal }),
  record: (slug, visitorId, signal) =>
    request<ViewCount>(`/posts/${encodeURIComponent(slug)}/views`, {
      method: "POST",
      body: JSON.stringify({ visitorId }),
      signal,
    }),
};
