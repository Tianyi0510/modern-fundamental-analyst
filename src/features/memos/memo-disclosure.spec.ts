import { expect, test } from "@playwright/test";

test("memo disclosure animates both directions and respects reduced motion", { tag: "@mobile" }, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(`${prefix}/memos`);
    const disclosure = page.locator(".memo-disclosure");
    const summary = disclosure.locator("[data-slot=collapsible-trigger]");
    const panel = disclosure.locator("[data-slot=collapsible-content]");
    await summary.click();
    await expect(summary).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toBeVisible();
    await expect(panel).toHaveCSS("transition-property", "height");
    await summary.click();
    await summary.click();
    await expect(summary).toHaveAttribute("aria-expanded", "true");
    await summary.click();
    await expect(panel).toBeHidden();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(disclosure).toHaveAttribute("data-open", "");
    expect(await panel.evaluate((e) => e.getAnimations().length)).toBe(0);
    await page.keyboard.press("Space");
    await expect(disclosure).not.toHaveAttribute("data-open", "");
  }
});

test.describe("mobile content and navigation QA", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1",
  });

  test(
    "memo count and disclosure arrow stay together and remain touch operable",
    { tag: "@mobile" },
    async ({ page }) => {
      await page.goto("/memos");
      const countBox = await page.locator(".memo-count").boundingBox();
      const arrowBox = await page.locator(".memo-summary-meta svg").boundingBox();
      expect(countBox).not.toBeNull();
      expect(arrowBox).not.toBeNull();
      expect(countBox!.x + countBox!.width).toBeLessThan(arrowBox!.x);
      expect(Math.abs(countBox!.y + countBox!.height / 2 - (arrowBox!.y + arrowBox!.height / 2))).toBeLessThan(2);

      const disclosure = page.locator(".memo-disclosure");
      await disclosure.locator("[data-slot=collapsible-trigger]").tap();
      await expect(disclosure).toHaveAttribute("data-open", "");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    },
  );
});

test("article categories filter published cards and index entries without publishing placeholders @mobile", async ({
  page,
  isMobile,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const [prefix, label, empty] of [
    ["", "Article category", "No published articles in this category yet."],
    ["/zh-tw", "文章分類", "此分類尚未有已發布文章。"],
    ["/zh-cn", "文章分类", "此分类尚无已发布文章。"],
  ] as const) {
    await page.goto(`${prefix}/memos`);
    const select = page.getByRole("combobox", { name: label, exact: true });
    await expect(select.locator("option")).toHaveCount(6);
    await select.selectOption("company-analysis");
    await expect(page.locator(".memo-card")).toHaveCount(1);
    await expect(page.locator(".memo-count")).toHaveText("01");
    await page.locator(".memo-disclosure [data-slot=collapsible-trigger]").click();
    await expect(page.locator(".memo-index-row")).toBeVisible();
    for (const category of ["industry-analysis", "quarterly-report", "annual-report", "blogs"]) {
      await select.selectOption(category);
      await expect(page.getByText(empty, { exact: true })).toBeVisible();
      await expect(page.locator(".memo-card")).toHaveCount(0);
      await expect(page.locator(".memo-index-row")).toHaveCount(0);
    }
    await select.selectOption("all");
    await expect(select).toHaveValue("all");
    await expect(page.locator(".memo-card")).toHaveCount(3);
    await expect(page.locator(".memo-count")).toHaveText("01");
    const article = page.locator(".memo-index-featured a");
    if (isMobile) {
      await article.tap();
    } else {
      await select.focus();
      await page.keyboard.press("Tab");
      await expect(article).toBeFocused();
      await page.keyboard.press("Enter");
    }
    await expect(page).toHaveURL(new RegExp(`${prefix}/memos/microsoft-stock-analysis-fiscal-year-2024$`));
    await expect(page.locator("main h1")).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("article category URLs survive reload and history while preserving unrelated URL state @mobile", async ({
  page,
}) => {
  await page.goto("/memos?source=review&category=not-a-category#main-content");
  const select = page.getByRole("combobox", { name: "Article category", exact: true });
  await expect(select).toHaveValue("all");
  await select.selectOption("blogs");
  await expect(page).toHaveURL(/source=review&category=blogs#main-content$/);
  await page.reload();
  await expect(select).toHaveValue("blogs");
  await expect(page.getByText("No published articles in this category yet.")).toBeVisible();
  await select.selectOption("company-analysis");
  await expect(page.locator(".memo-card")).toHaveCount(1);
  await page.goBack();
  await expect(select).toHaveValue("blogs");
  await page.goForward();
  await expect(select).toHaveValue("company-analysis");
  await select.selectOption("all");
  await expect(page).toHaveURL(/memos\?source=review#main-content$/);
  await expect(page.locator(".memo-card")).toHaveCount(3);
});

test("memo Hero describes the published research and planned articles remain unpublished @mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [prefix, title, scope, plannedTitles] of [
    [
      "",
      "Research on business qualityand financial performance",
      "This historical article does not include a published valuation model.",
      ["Will AI Kill Software?", "Agentic Finance and Stablecoins"],
    ],
    [
      "/zh-tw",
      "探討企業品質與財務表現",
      "這篇歷史文章未附公開的估值模型。",
      ["AI 會取代軟體嗎？", "AI 代理金融與穩定幣"],
    ],
    [
      "/zh-cn",
      "探讨企业质量与财务表现",
      "这篇历史文章未附公开的估值模型。",
      ["AI 会取代软件吗？", "AI 代理金融与稳定币"],
    ],
  ] as const) {
    await page.goto(`${prefix}/memos`);
    await expect(page.locator("main h1")).toHaveText(title);
    await expect(page.locator("main")).toContainText(scope);
    await expect(page.locator(".memo-grid .memo-card:visible")).toHaveCount(1);
    const planned = page.locator(".memo-planned-row");
    await expect(planned).toHaveCount(2);
    for (const heading of plannedTitles) await expect(planned.getByRole("heading", { name: heading })).toBeHidden();
    const trigger = page.locator(".memo-disclosure [data-slot=collapsible-trigger]");
    await trigger.click();
    for (const heading of plannedTitles) await expect(planned.getByRole("heading", { name: heading })).toBeVisible();
    await expect(planned.locator("a, time")).toHaveCount(0);
    await trigger.click();
    for (const heading of plannedTitles) await expect(planned.getByRole("heading", { name: heading })).toBeHidden();
    await expect(page.locator(".memo-count")).toHaveText("01");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto("/memos");
  await expect(page.getByRole("option", { name: "Blog", exact: true })).toHaveCount(1);
  await expect(page.getByRole("option", { name: "Blogs", exact: true })).toHaveCount(0);
});
