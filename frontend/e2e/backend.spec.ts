import { test, expect } from "@playwright/test";

test.describe("Live Spring + PostgreSQL integration", () => {
  test.skip(
    process.env.BACKEND_INTEGRATION !== "1",
    "Set BACKEND_INTEGRATION=1 with docker compose running",
  );
  test("search uses the real Spring index through the Next proxy", async ({
    page,
    request,
  }) => {
    const response = await request.get("/api/v1/search?q=메모리");
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(
      json.data.results.some(
        (p: { slug: string }) => p.slug === "malloc-free-list",
      ),
    ).toBe(true);
    const upstream = await request.get(
      `${process.env.BACKEND_URL || "http://127.0.0.1:8080"}/api/v1/search?q=메모리`,
    );
    expect(await upstream.json()).toEqual(json);
    await page.goto("/");
    await page.getByRole("button", { name: "글 검색" }).click();
    await page.getByRole("textbox", { name: "검색어" }).fill("메모리");
    await page
      .getByRole("dialog")
      .getByRole("link")
      .filter({ hasText: "가용 블록을 어떻게 관리할까" })
      .click();
    await expect(page).toHaveURL("/blog/malloc-free-list");
  });
  test("article records one daily view per browser and missing posts return the API error contract", async ({
    page,
    request,
  }) => {
    const path = "/api/v1/posts/spring-ai-streaming-npe/views";
    const before = (await (await request.get(path)).json()).data.views;
    await page.goto("/blog/spring-ai-streaming-npe");
    await expect(
      page.locator(".article-author").getByLabel("조회수"),
    ).toHaveText(`조회 ${(before + 1).toLocaleString("ko-KR")}`);
    await page.reload();
    await expect(
      page.locator(".article-author").getByLabel("조회수"),
    ).toHaveText(`조회 ${(before + 1).toLocaleString("ko-KR")}`);
    const missing = await request.get("/api/v1/posts/not-a-post/views");
    expect(missing.status()).toBe(404);
    expect((await missing.json()).error.code).toBe("POST_NOT_FOUND");
    const invalid = await request.post(path, {
      data: { visitorId: "not-uuid" },
    });
    expect(invalid.status()).toBe(400);
    expect((await invalid.json()).error.code).toBe("INVALID_REQUEST");
    const admin = await request.get("/api/v1/admin/analytics");
    expect(admin.status()).toBe(404);
  });

  test("live site totals and cards agree, while navigation and new tabs do not add visitors", async ({
    page,
    context,
    request,
  }) => {
    const before = (await (await request.get("/api/v1/stats")).json()).data;
    expect(before.postViews).toHaveProperty("jungle-week-00-acceptance");
    expect(before.postViews).toHaveProperty(
      "ab180-kafka-event-ordering-review",
    );
    expect(before.postViews).toHaveProperty(
      "kafka-consumer-offset-and-rebalance",
    );
    const slug = "kafka-consumer-offset-and-rebalance";
    await page.goto("/blog");
    const footer = page.locator(".site-stats");
    await expect(footer.locator("dd").nth(1)).toHaveText(
      (before.totalVisitors + 1).toLocaleString("ko-KR"),
    );
    const card = page
      .locator(".post-card")
      .filter({ has: page.locator(`a[href='/blog/${slug}']`) });
    await expect(card.getByLabel("조회수")).toHaveText(
      `조회 ${before.postViews[slug].toLocaleString("ko-KR")}`,
    );
    expect(
      (await (await request.get("/api/v1/stats")).json()).data.totalViews,
    ).toBe(before.totalViews);
    await card.getByRole("heading").getByRole("link").click();
    await expect(footer.locator("dd").nth(2)).toHaveText(
      (before.totalViews + 1).toLocaleString("ko-KR"),
    );
    await page.reload();
    await expect(footer.locator("dd").nth(2)).toHaveText(
      (before.totalViews + 1).toLocaleString("ko-KR"),
    );
    const second = await context.newPage();
    await second.goto(`/blog/${slug}`);
    await expect(second.locator(".site-stats dd").nth(2)).toHaveText(
      (before.totalViews + 1).toLocaleString("ko-KR"),
    );
    const after = (await (await request.get("/api/v1/stats")).json()).data;
    expect(after.todayVisitors).toBe(before.todayVisitors + 1);
    expect(after.totalVisitors).toBe(before.totalVisitors + 1);
    expect(after.totalViews).toBe(before.totalViews + 1);
    expect(after.postViews[slug]).toBe(before.postViews[slug] + 1);
  });
});
