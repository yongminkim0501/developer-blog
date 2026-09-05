import { test } from "node:test";
import assert from "node:assert/strict";
import { httpSearch, httpViews } from "../lib/api/http";

test("HTTP search uses same-origin API and preserves query and server errors", async (t) => {
  let requested = "";
  t.mock.method(globalThis, "fetch", async (url: string) => {
    requested = String(url);
    return Response.json({
      success: true,
      data: { query: "메모리 & c", results: [] },
    });
  });
  const result = await httpSearch.search("메모리 & c");
  assert.equal(
    new URL(requested, "http://localhost").searchParams.get("q"),
    "메모리 & c",
  );
  assert.equal(result.success, true);
  t.mock.restoreAll();
  t.mock.method(globalThis, "fetch", async () =>
    Response.json(
      {
        success: false,
        error: { code: "INVALID_REQUEST", message: "요청 오류" },
      },
      { status: 400 },
    ),
  );
  assert.deepEqual(await httpSearch.search("query"), {
    success: false,
    error: { code: "INVALID_REQUEST", message: "요청 오류" },
  });
});

test("backend outages are explicit and never silently fall back to local data", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    throw new TypeError("Network failure");
  });
  const result = await httpSearch.search("Pintos");
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.error.code, "BACKEND_UNAVAILABLE");
});

test("HTTP adapters preserve cancellation and send view idempotency identity", async (t) => {
  const controller = new AbortController();
  controller.abort();
  t.mock.method(
    globalThis,
    "fetch",
    async (_url: string, init: RequestInit) => {
      init.signal?.throwIfAborted();
      return Response.json({});
    },
  );
  await assert.rejects(() => httpSearch.search("Pintos", controller.signal), {
    name: "AbortError",
  });
  t.mock.restoreAll();
  let captured: RequestInit | undefined;
  t.mock.method(
    globalThis,
    "fetch",
    async (_url: string, init: RequestInit) => {
      captured = init;
      return Response.json({
        success: true,
        data: { slug: "pintos", views: 7 },
      });
    },
  );
  const result = await httpViews.record(
    "pintos",
    "941a3370-3b3a-437e-a4b5-fdd45d48e440",
  );
  assert.equal(captured?.method, "POST");
  assert.deepEqual(JSON.parse(captured?.body as string), {
    visitorId: "941a3370-3b3a-437e-a4b5-fdd45d48e440",
  });
  assert.deepEqual(result, {
    success: true,
    data: { slug: "pintos", views: 7 },
  });
});
