import { test, expect, type BrowserContext } from "@playwright/test";

const slug = "spring-ai-streaming-npe";
async function mockStats(context: BrowserContext) {
  const visitors = new Set<string>();
  const readers = new Set<string>();
  const writes: string[] = [];
  const data = () => ({
    date: "2026-10-06",
    timeZone: "Asia/Seoul",
    todayVisitors: visitors.size,
    totalVisitors: 40 + visitors.size,
    totalViews: 7 + readers.size,
    postViews: { [slug]: 7 + readers.size },
  });
  await context.route("**/api/v1/stats{,/visits}", async (route) => {
    if (route.request().method() === "POST") {
      visitors.add(route.request().postDataJSON().visitorId);
      writes.push("visit");
    }
    await route.fulfill({ json: { success: true, data: data() } });
  });
  await context.route("**/api/v1/posts/*/views", async (route) => {
    if (route.request().method() === "POST") {
      readers.add(route.request().postDataJSON().visitorId);
      writes.push("view");
    }
    await route.fulfill({
      json: { success: true, data: { slug, views: 7 + readers.size } },
    });
  });
  return { visitors, readers, writes };
}

test("lists only read views; article, reload and a second tab share one visitor", async ({
  page,
  context,
}) => {
  const state = await mockStats(context);
  await page.goto("/blog");
  const card = page
    .locator(".post-card")
    .filter({ has: page.locator(`a[href='/blog/${slug}']`) });
  await expect(card.getByLabel("조회수")).toHaveText("조회 7");
  expect(state.readers.size).toBe(0);
  await expect(
    page.getByRole("group", { name: "블로그 방문 통계" }),
  ).toContainText("오늘 방문1");
  await card.getByRole("heading").getByRole("link").click();
  await expect(page.locator(".article-author").getByLabel("조회수")).toHaveText(
    "조회 8",
  );
  await expect(page.locator(".site-stats")).toContainText("전체 조회8");
  await page.reload();
  await expect(page.locator(".article-author").getByLabel("조회수")).toHaveText(
    "조회 8",
  );
  const second = await context.newPage();
  await second.goto(`/blog/${slug}`);
  await expect(
    second.locator(".article-author").getByLabel("조회수"),
  ).toHaveText("조회 8");
  await expect(second.locator(".site-stats")).toContainText("누적 방문41");
  expect(state.visitors.size).toBe(1);
  expect(state.readers.size).toBe(1);
  expect([...state.readers]).toEqual([...state.visitors]);
});

test("blocked storage reads existing statistics without generating visits", async ({
  page,
  context,
}) => {
  const state = await mockStats(context);
  await context.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    });
  });
  await page.goto(`/blog/${slug}`);
  await expect(page.locator(".article-author").getByLabel("조회수")).toHaveText(
    "조회 7",
  );
  await expect(page.locator(".site-stats")).toContainText("누적 방문40");
  expect(state.writes).toEqual([]);
});

test("unavailable APIs preserve reading and show unavailable counts instead of zero", async ({
  page,
}) => {
  await page.route("**/api/v1/**", (route) =>
    route.fulfill({
      status: 503,
      json: {
        success: false,
        error: { code: "BACKEND_UNAVAILABLE", message: "Unavailable" },
      },
    }),
  );
  await page.goto(`/blog/${slug}`);
  await expect(page.locator(".article-author").getByLabel("조회수")).toHaveText(
    "조회 —",
  );
  await expect(page.locator(".site-stats dd")).toHaveText(["—", "—", "—"]);
  await expect(page.locator("article.prose")).toBeVisible();
});

test("footer statistics fit a narrow screen in light and dark themes", async ({
  page,
  context,
}) => {
  await mockStats(context);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`/blog/${slug}`);
  await expect(page.locator(".site-stats")).toContainText("누적 방문41");
  await page.locator(".site-stats").scrollIntoViewIfNeeded();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(375);
  await page
    .locator("footer")
    .screenshot({ path: "test-results/stats-mobile-light.png" });
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await page
    .locator("footer")
    .screenshot({ path: "test-results/stats-mobile-dark.png" });
});
