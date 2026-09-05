import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { allContent, assetUrl, headings, postUrl } from "../lib/content/index";
import { createMockServices } from "../lib/api/mock";

test("production excludes draft source from published content", () => {
  const cwd = process.cwd();
  const previous = process.env.NODE_ENV;
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "dev-log-content-"));
  try {
    for (const [slug, status] of [
      ["public-note", "published"],
      ["private-note", "draft"],
    ]) {
      const folder = path.join(temp, "content/blog", slug);
      fs.mkdirSync(folder, { recursive: true });
      fs.writeFileSync(
        path.join(folder, "index.mdx"),
        `---\ntitle: ${slug}\ndescription: Test\nstatus: ${status}\ndate: "2026-09-05"\nthumbnail: ./image.svg\n---\n## A heading\nBody`,
      );
    }
    process.chdir(temp);
    Object.assign(process.env, { NODE_ENV: "production" });
    const published = allContent("blog");
    assert.deepEqual(
      published.map((p) => p.slug),
      ["public-note"],
    );
    assert.equal(published[0].thumbnail, "/content/blog/public-note/image.svg");
    Object.assign(process.env, { NODE_ENV: "development" });
    assert.equal(allContent("blog").length, 2);
  } finally {
    process.chdir(cwd);
    if (previous === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
    else Object.assign(process.env, { NODE_ENV: previous });
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test("TOC ignores code headings and keeps duplicate and Korean anchor IDs", () => {
  const result = headings(
    "## 시작\n```md\n## Not a heading\n```\n## 시작\n### Next step",
  );
  assert.deepEqual(
    result.map((h) => h.id),
    ["시작", "시작-1", "next-step"],
  );
  assert.equal(
    postUrl({ collection: "jungle", slug: "week-note" }),
    "/blog/week-note",
  );
  assert.equal(
    assetUrl("blog", "sample", "./figure.svg"),
    "/content/blog/sample/figure.svg",
  );
});

const items = [
  {
    slug: "pintos",
    title: "Pintos 우선순위",
    description: "스케줄러 구현 기록",
    category: "OS",
    tags: ["scheduler"],
  },
];
test("search follows API contract and matches tags", async () => {
  const { search } = createMockServices(items);
  const result = await search.search("SCHEDULER");
  assert.deepEqual(result, {
    success: true,
    data: { query: "SCHEDULER", results: items },
  });
  const empty = await search.search("nonexistent");
  assert.deepEqual(empty, {
    success: true,
    data: { query: "nonexistent", results: [] },
  });
});
test("chat streams tokens and sources with matching request IDs; cancellation works", async () => {
  const { chat } = createMockServices(items);
  const events = [];
  for await (const event of chat.stream("Pintos")) events.push(event);
  assert.equal(events[0].type, "start");
  assert.equal(events.at(-1)?.type, "done");
  const start = events[0],
    done = events.at(-1)!;
  if (start.type === "start" && done.type === "done")
    assert.equal(start.data.requestId, done.data.requestId);
  assert.ok(
    events.some((e) => e.type === "source" && e.data.url === "/blog/pintos"),
  );
  assert.ok(
    events
      .filter((e) => e.type === "token")
      .map((e) => e.data.content)
      .join("")
      .includes("데모 응답"),
  );
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    async () => {
      for await (const event of chat.stream("Pintos", controller.signal)) {
        void event;
      }
    },
    { name: "AbortError" },
  );
});

test("Korean question particles do not create unrelated chat citations", async () => {
  const { chat } = createMockServices([
    ...items,
    {
      slug: "blog",
      title: "기록이 쌓이는 블로그",
      description: "나의 기록",
      category: "Dev Log",
      tags: ["mdx"],
    },
  ]);
  const sources = [];
  for await (const event of chat.stream("Pintos에 대해 어떤 기록이 있어?"))
    if (event.type === "source") sources.push(event.data.slug);
  assert.deepEqual(sources, ["pintos"]);
});
