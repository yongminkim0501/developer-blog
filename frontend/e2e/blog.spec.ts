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

test("home shows profile sections and images load", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "개발자 김용민입니다.",
  );
  await expect(page.locator(".post-card")).toHaveCount(3);
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
  await expect(page.locator(".home-history .timeline-row")).toHaveCount(4);
  await expect(page.locator(".home-projects .about-project-row")).toHaveCount(
    4,
  );
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

test("home hero navigation, pagination and links", async ({ page }) => {
  await page.goto("/");
  const hero = page.getByRole("region", {
    name: "개발자 소개, 정글 이야기와 기술 블로그 정리",
  });
  await expect(hero.locator(".swiper-initialized")).toBeVisible();
  await expect(hero.locator(".swiper-pagination-bullet")).toHaveCount(3);
  const expectSlide = async (index: number) => {
    await expect(hero.locator(".swiper-slide").nth(index)).toHaveClass(
      /swiper-slide-active/,
    );
    await expect(hero.locator(".swiper-slide").nth(index)).toHaveCSS(
      "opacity",
      "1",
    );
    for (const other of [0, 1, 2].filter((slide) => slide !== index)) {
      await expect(hero.locator(".swiper-slide").nth(other)).toHaveCSS(
        "opacity",
        "0",
      );
    }
  };
  await expect(hero.getByRole("link", { name: "김용민" })).toBeVisible();
  const height = (await hero.boundingBox())!.height;
  await hero
    .getByRole("button", { name: "다음 슬라이드", exact: true })
    .click();
  await expect(
    hero.getByRole("heading", { name: "몰입의 시간, 나의 정글 이야기." }),
  ).toBeVisible();
  await expectSlide(1);
  expect((await hero.boundingBox())!.height).toBeCloseTo(height, 0);
  await hero
    .getByRole("button", { name: "다음 슬라이드", exact: true })
    .click();
  await expect(
    hero.getByRole("heading", { name: "읽고, 이해하고, 기술 블로그 정리." }),
  ).toBeVisible();
  await expectSlide(2);
  expect((await hero.boundingBox())!.height).toBeCloseTo(height, 0);
  await hero
    .getByRole("button", { name: "다음 슬라이드", exact: true })
    .click();
  await expect(hero.getByRole("link", { name: "김용민" })).toBeVisible();
  await expectSlide(0);
  await hero.getByRole("button", { name: "1번 슬라이드로 이동" }).click();
  await expect(hero.getByRole("link", { name: "김용민" })).toBeVisible();
  await hero.getByRole("button", { name: "2번 슬라이드로 이동" }).click();
  await expectSlide(1);
  await hero
    .getByRole("button", { name: "이전 슬라이드", exact: true })
    .click();
  await expect(hero.getByRole("link", { name: "김용민" })).toBeVisible();
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(hero.locator(".swiper-initialized")).toBeVisible();
    await hero.getByRole("button", { name: "3번 슬라이드로 이동" }).click();
    await expectSlide(2);
    const reviewsLink = hero.getByRole("link", {
      name: "기술 블로그 정리 살펴보기",
    });
    await expect(reviewsLink).toBeVisible();
    await page.screenshot({
      path: `test-results/tech-hero-${viewport.width}.png`,
    });
    await reviewsLink.click();
    await expect(page).toHaveURL("/tech-blog");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "기술 블로그 정리",
    );
    await expect(page.locator(".post-card")).not.toHaveCount(0);
    for (const category of await page
      .locator(".post-category")
      .allTextContents()) {
      expect(category).toBe("Tech Blog Review");
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/tech-blog-${viewport.width}.png`,
    });
    await page.locator(".post-card h3 a").first().click();
    await expect(page).toHaveURL(/\/blog\/.+/);
    await expect(page.locator(".article-header h1")).toBeVisible();
  }
});

test("article full-width layout on desktop and mobile", async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/blog/python-subclass-without-inheritance");
    await expect(page.locator(".toc")).toHaveCount(0);
    const contentWidth = (await page.locator(".article-page").boundingBox())!
      .width;
    for (const selector of [".article-header", ".article-layout .prose"]) {
      expect((await page.locator(selector).boundingBox())!.width).toBeCloseTo(
        contentWidth,
        0,
      );
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/article-${viewport.width}.png`,
    });
  }
});

test("article local images, highlighted code and copy", async ({
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
  await page.goto("/projects/dev-log");
  await expect(page.locator(".story-visual")).toHaveCSS("position", "relative");
  await expect(page.locator(".story-step")).toHaveCount(3);
});

test("search outage is visible while the home page remains readable", async ({
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
  await page.goto("/");
  await page.getByRole("button", { name: "글 검색" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "서버에 연결하지 못했어요.",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "개발자 김용민입니다.",
  );
});
