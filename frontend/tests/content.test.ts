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
