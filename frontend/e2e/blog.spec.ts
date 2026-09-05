import { test, expect } from "@playwright/test";

// Isolated UI suite: production HTTP adapters still run, with API responses intercepted.
// backend.spec.ts exercises the unmocked Spring/PostgreSQL integration.
test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/search?*", async (route) => {
    const query = new URL(route.request().url()).searchParams.get("q") || "";
    const results =
      !query || query.toLowerCase().includes("pintos")
        ? [
            {
              slug: "pintos-priority-donation",
              title: "Pintos에서 Priority Donation을 이해하기",
              description: "스케줄러 기록",
              category: "Operating System",
              tags: ["pintos"],
            },
          ]
        : [];
    await route.fulfill({ json: { success: true, data: { query, results } } });
  });
  await page.route("**/api/v1/posts/*/views", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: { slug: "pintos-priority-donation", views: 7 },
      },
    }),
  );
});

test("home is original, images load, scroll changes project stage", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "배우고, 만들고",
  );
  await expect(page.locator(".post-card")).toHaveCount(5);
  const images = await page
    .locator("img")
    .evaluateAll((images) =>
      images.every(
        (image) =>
          image instanceof HTMLImageElement &&
          image.complete &&
          image.naturalWidth > 0,
      ),
    );
  expect(images).toBe(true);
  await page.locator('[data-step="1"]').scrollIntoViewIfNeeded();
  await expect(page.locator(".pipeline")).toHaveClass(/active/);
  await page.locator('[data-step="2"]').scrollIntoViewIfNeeded();
  await expect(page.locator(".discover")).toHaveClass(/active/);
  expect(errors).toEqual([]);
  await page.goto("/");
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
});

test("keyboard search, empty state, result navigation and dismissal", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page
    .getByRole("textbox", { name: "검색어" })
    .fill("nonexistent-keyword");
  await expect(
    dialog.getByText("일치하는 기록이 없어요. 다른 키워드를 입력해보세요."),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "검색어" }).fill("Pintos");
  await dialog.getByRole("link").filter({ hasText: "Pintos" }).click();
  await expect(page).toHaveURL(/\/blog\/pintos-priority-donation/);
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: "글 검색" }).click();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("article local images, TOC, highlighted code and copy", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/blog/pintos-priority-donation");
  const image = page.locator('img[alt="세 스레드의 우선순위 전달 관계"]');
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await expect(page.locator("[data-rehype-pretty-code-title]")).toHaveText(
    "priority-example.c",
  );
  await page.getByRole("button", { name: "코드 복사" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "effective_priority",
  );
  await page
    .locator(".toc")
    .getByRole("link", { name: "중첩된 관계에서는" })
    .click();
  await expect(page).toHaveURL(/#/);
  await expect(page.locator('h2[id="중첩된-관계에서는"]')).toBeInViewport();
});

test("archives, taxonomy, projects and missing route", async ({ page }) => {
  for (const url of [
    "/blog",
    "/jungle",
    "/jungle/4",
    "/categories",
    "/categories/Operating%20System",
    "/tags/%EB%B8%94%EB%A1%9C%EA%B7%B8",
    "/series/Pintos",
    "/projects",
    "/projects/dev-log",
    "/about",
  ]) {
    const response = await page.goto(url);
    expect(response?.status(), url).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    if (url === "/projects/dev-log") {
      await page.locator('[data-step="1"]').scrollIntoViewIfNeeded();
      await expect(page.locator(".pipeline")).toHaveClass(/active/);
      await expect(page.locator(".pipeline")).toHaveCSS("opacity", "1");
      await page.screenshot({ path: "test-results/project-desktop.png" });
    }
  }
  const response = await page.goto("/blog/missing-note");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("아직 쓰이지 않은")).toBeVisible();
});

test("chat streams demo response with working source and supports stop", async ({
  page,
}) => {
  await page.goto("/brain");
  await page
    .getByRole("button", { name: "Pintos에 대해 어떤 기록이 있어?" })
    .click();
  await expect(page.getByRole("button", { name: "질문 보내기" })).toBeVisible({
    timeout: 10000,
  });
  await expect(page.locator(".message.assistant")).toContainText("데모 응답");
  await expect(page.locator(".sources a")).toHaveAttribute(
    "href",
    "/blog/pintos-priority-donation",
  );
  await page.getByRole("textbox", { name: "질문", exact: true }).fill("메모리");
  await page.getByRole("button", { name: "질문 보내기" }).click();
  await page.getByRole("button", { name: "응답 중단" }).click();
  await expect(page.getByRole("status")).toContainText("중단");
});

test("mobile navigation, responsive overflow and persistent dark mode", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "메뉴 열기" })).toBeVisible();
  await page.getByRole("button", { name: "메뉴 열기" }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "프로젝트", exact: true })
    .click();
  await expect(page).toHaveURL("/projects");
  for (const url of [
    "/",
    "/blog",
    "/blog/pintos-priority-donation",
    "/projects/dev-log",
    "/brain",
  ]) {
    await page.goto(url);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      url,
    ).toBe(true);
  }
  await page.goto("/");
  await page.getByRole("button", { name: "테마 전환" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.screenshot({
    path: "test-results/home-mobile-dark.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "테마 전환" }).click();
  await page.screenshot({
    path: "test-results/home-mobile.png",
    fullPage: true,
  });
});

test("reduced motion keeps project content readable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".story-visual")).toHaveCSS("position", "relative");
  await expect(page.locator(".story-step")).toHaveCount(3);
});

test("search outage is visible while the article remains readable", async ({
  page,
}) => {
  await page.route("**/api/v1/search?*", (route) =>
    route.fulfill({
      status: 503,
      json: {
        success: false,
        error: {
          code: "BACKEND_UNAVAILABLE",
          message: "서버에 연결하지 못했어요. 잠시 후 다시 시도해주세요.",
        },
      },
    }),
  );
  await page.goto("/blog/pintos-priority-donation");
  await page.getByRole("button", { name: "글 검색" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "서버에 연결하지 못했어요.",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Pintos");
});
