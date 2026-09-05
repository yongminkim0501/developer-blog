import type { ChatService, SearchService, SearchItem } from "@/types";
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
  chat: ChatService;
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
  const chat: ChatService = {
    async *stream(message, signal) {
      const requestId = `chat_${Date.now()}`;
      yield { type: "start", data: { requestId } };
      const response = await search.search(message, signal);
      let matches = response.success ? response.data.results : [];
      if (!matches.length) {
        const terms = message
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\s]/gu, "")
          .split(/\s+/)
          .map((term) => term.replace(/(에서|에게|에|은|는|을|를|이|가)$/u, ""))
          .filter(
            (t) =>
              t.length > 1 &&
              ![
                "대해",
                "어떤",
                "기록",
                "있어",
                "어떻게",
                "내용",
                "찾아줘",
                "공부한",
                "만들었어",
              ].includes(t),
          );
        matches = items.filter((p) =>
          terms.some((t) =>
            `${p.title} ${p.tags.join(" ")}`.toLowerCase().includes(t),
          ),
        );
      }
      const answer = matches.length
        ? `아직 AI가 연결되지 않은 데모 응답이에요. 질문과 관련된 기록으로 「${matches[0].title}」을 찾았어요. ${matches[0].description} 아래 원문에서 내용을 확인해보세요.`
        : "아직 AI가 연결되지 않은 데모 응답이에요. 이 질문과 일치하는 기록을 찾지 못했어요. “Pintos”, “메모리”, “블로그”처럼 글에 등장하는 키워드로 질문해보세요.";
      for (const token of answer.split(/(?<=\s)/)) {
        await wait(55, signal);
        yield { type: "token", data: { content: token } };
      }
      for (const post of matches.slice(0, 3))
        yield {
          type: "source",
          data: {
            slug: post.slug,
            title: post.title,
            url: `/blog/${post.slug}`,
          },
        };
      yield { type: "done", data: { requestId, finishReason: "stop" } };
    },
  };
  return { search, chat };
}
