import type { SearchService, SearchItem } from "@/types";
const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    signal?.throwIfAborted();
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", abort, { once: true });
  });
export function createMockServices(items: SearchItem[]): {
  search: SearchService;
} {
  const search: SearchService = {
    async search(query, signal) {
      await wait(180, signal);
      const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
      return {
        success: true,
        data: {
          query,
          results: terms.length
            ? items.filter((p) =>
                terms.every((t) =>
                  `${p.title} ${p.description} ${p.category} ${p.tags.join(" ")}`
                    .toLowerCase()
                    .includes(t),
                ),
              )
            : items.slice(0, 5),
        },
      };
    },
  };
  return { search };
}
