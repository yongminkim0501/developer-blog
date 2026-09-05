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
        (p: { slug: string }) => p.slug === "malloc-memory-layout",
      ),
    ).toBe(true);
    const upstream = await request.get(
      "http://127.0.0.1:8080/api/v1/search?q=메모리",
    );
    expect(await upstream.json()).toEqual(json);
    await page.goto("/");
    await page.getByRole("button", { name: "글 검색" }).click();
    await page.getByRole("textbox", { name: "검색어" }).fill("메모리");
    await page
      .getByRole("dialog")
      .getByRole("link")
      .filter({ hasText: "메모리 할당기" })
      .click();
    await expect(page).toHaveURL("/blog/malloc-memory-layout");
  });
  test("article records one daily view per tab and missing posts return the API error contract", async ({
    page,
    request,
  }) => {
    const path = "/api/v1/posts/pintos-priority-donation/views";
    const before = (await (await request.get(path)).json()).data.views;
    await page.goto("/blog/pintos-priority-donation");
    await expect(page.getByLabel("조회수")).toHaveText(
      `조회 ${(before + 1).toLocaleString("ko-KR")}`,
    );
    await page.reload();
    await expect(page.getByLabel("조회수")).toHaveText(
      `조회 ${(before + 1).toLocaleString("ko-KR")}`,
    );
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
});
