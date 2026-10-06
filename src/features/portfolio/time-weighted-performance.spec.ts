import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} reconstructed TWR stays distinct from annualized XIRR`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${prefix}/performance`);
    await expect(page.getByRole("main")).toContainText(
      prefix === "/zh-tw" ? "負債餘額" : prefix === "/zh-cn" ? "负债余额" : "liability balances",
    );
    await expect(page.locator("main figure")).toHaveCount(1);
    await expect(page.locator('main svg[role="img"]')).toHaveCount(1);
    const history = page.locator('section[aria-labelledby="performance-chart-title"]');
    await history.locator("summary").click();
    await expect(history.locator("tbody tr")).toHaveCount(22);
    await expect(history.locator("tbody tr").first()).toContainText("+24.43%");
    await expect(history.locator("tbody tr").first()).toContainText("+19.26%");
    await expect(history.locator("tbody tr").last()).toContainText(prefix ? "30" : "less than 30 days");
    const summary = page.locator(".performance-twr-summary");
    await expect(summary.getByRole("term")).toHaveCount(2);
    await expect(summary).toContainText("+38.27%");
    await expect(summary).toContainText("+32.20%");
    await expect(summary).toContainText(prefix ? "未年化" : "not annualized");
    await expect(page.locator(".performance-summary")).toContainText("+24.43%");
    const chart = page.locator('figure[aria-labelledby="performance-twr-chart-title"]');
    await expect(chart.getByRole("img")).toHaveAccessibleName(/38\.27%.*32\.20%/);
    await expect(chart.locator("polyline")).toHaveCount(2);
    const summaryButton = chart.locator("summary");
    await summaryButton.focus();
    await page.keyboard.press("Enter");
    await expect(chart.getByRole("table")).toBeVisible();
    await expect(chart.locator("tbody tr")).toHaveCount(22);
    await expect(chart.locator("tbody tr").first()).toContainText("127,533.11");
    await expect(chart.locator("tbody tr").first()).toContainText("+38.27%");
    const ids = await page.locator("[id]").evaluateAll((elements) => elements.map((element) => element.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "32px";
      });
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await expect(chart.getByRole("img")).toBeVisible();
    }
  });
}
