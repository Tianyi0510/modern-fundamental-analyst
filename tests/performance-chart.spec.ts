import { expect, test } from "@playwright/test";

test.use({ hasTouch: true });

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} August performance chart and monthly data remain accessible`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${prefix}/performance`);
    await expect(page.locator('a[href*="docs.google.com/spreadsheets"]')).toHaveCount(0);
    await expect(page.locator(".returns-table")).toHaveCount(0);
    await expect(page.locator(".methodology-explanation > p")).toHaveCount(3);
    const chart = page.locator('figure[aria-labelledby="performance-chart-title"]');
    await expect(chart.getByRole("img")).toBeVisible();
    await expect(chart.locator("polyline")).toHaveCount(2);
    for (const line of await chart.locator("polyline").all()) {
      expect((await line.getAttribute("points"))!.split(" ")).toHaveLength(20);
    }
    await expect(page.locator(".performance-summary")).toContainText("+21.14%");
    await expect(page.locator(".performance-summary")).toContainText("+21.00%");
    if (!prefix) await expect(page.locator(".page-intro .date-text")).toContainText("As of 31 Aug 2026");
    const summary = chart.locator("summary");
    await summary.focus();
    await expect(summary).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Enter");
    await expect(chart.getByRole("table")).toBeVisible();
    await expect(chart.locator("tbody tr")).toHaveCount(21);
    await expect(chart.locator("tbody tr").last()).toContainText("121,301.99");
    await expect(chart.locator("tbody tr").last()).toContainText("+21.14%");
    await summary.tap();
    await expect(chart.getByRole("table")).not.toBeVisible();
    await summary.tap();
    await expect(chart.getByRole("table")).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
    const introBox = await page.locator(".page-intro").boundingBox();
    const dateBox = await page.locator(".page-intro .date-text").boundingBox();
    expect(Math.abs(introBox!.x + introBox!.width - dateBox!.x - dateBox!.width)).toBeLessThan(1);
    for (const width of [320, 801, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => { document.documentElement.style.fontSize = "32px"; });
      await page.evaluate(() => document.fonts.ready);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth), `Page overflow at ${width}px`).toBeLessThanOrEqual(width);
      await expect(chart.getByRole("img")).toBeVisible();
      await expect(chart.getByRole("img")).toHaveCSS("height", "300px");
    }
  });
}
