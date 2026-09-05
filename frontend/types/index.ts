export type Collection = "blog" | "jungle" | "projects";
export interface Post {
  slug: string;
  collection: Collection;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  series?: string;
  project?: string;
  week?: number;
  status: string;
  featured?: boolean;
  thumbnail?: string;
  readingTime: number;
  body: string;
  tech?: string[];
  github?: string;
  demo?: boolean;
}
export type PostSummary = Omit<Post, "body">;
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
export interface SearchItem {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
}
export interface Source {
  slug: string;
  title: string;
  url: string;
  heading?: string;
}
export type ChatEvent =
  | { type: "start"; data: { requestId: string } }
  | { type: "token"; data: { content: string } }
  | { type: "source"; data: Source }
  | { type: "done"; data: { requestId: string; finishReason: "stop" } }
  | { type: "error"; data: { code: string; message: string } };
export interface SearchService {
  search(
    query: string,
    signal?: AbortSignal,
  ): Promise<ApiResult<{ query: string; results: SearchItem[] }>>;
}
export interface ChatService {
  stream(message: string, signal?: AbortSignal): AsyncIterable<ChatEvent>;
}

export interface ViewCount {
  slug: string;
  views: number;
}
export interface ViewService {
  get(slug: string, signal?: AbortSignal): Promise<ApiResult<ViewCount>>;
  record(
    slug: string,
    visitorId: string,
    signal?: AbortSignal,
  ): Promise<ApiResult<ViewCount>>;
}
