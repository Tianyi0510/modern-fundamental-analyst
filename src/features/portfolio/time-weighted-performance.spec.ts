import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} reconstructed TWR stays distinct from annualized XIRR`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${prefix}/performance`);
    await expect(page.getByRole("main")).toContainText(
      prefix === "/zh-tw" ? "負債餘額" : prefix === "/zh-cn" ? "负债余额" : "liability balances",
    );
    await expect(page.locator("main figure")).toHaveCount(2);
    await expect(page.locator('main svg[role="img"]')).toHaveCount(2);
    const xirr = page.locator('figure[aria-labelledby="performance-chart-title"]');
    await expect(xirr.getByRole("img")).toHaveAccessibleName(/24\.43%.*19\.26%/);
    await expect(xirr.locator("polyline")).toHaveCount(2);
    for (const line of await xirr.locator("polyline").all()) {
      expect((await line.getAttribute("points"))!.split(" ")).toHaveLength(21);
    }
    await xirr.locator("summary").click();
    await expect(xirr.getByRole("table")).toBeVisible();
    await expect(xirr.locator("tbody tr")).toHaveCount(22);
    await expect(xirr.locator("tbody tr").first()).toContainText("+24.43%");
    await expect(xirr.locator("tbody tr").first()).toContainText("+19.26%");
    await expect(xirr.locator("tbody tr").last()).toContainText(prefix ? "30" : "less than 30 days");
    await expect(page.locator(".performance-twr-summary")).toHaveCount(0);
    await expect(page.locator(".performance-summary").getByRole("term")).toHaveCount(3);
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
      await expect(xirr.getByRole("img")).toBeVisible();
    }
  });
}
