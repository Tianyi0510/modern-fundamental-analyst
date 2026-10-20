import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} Home performance reflows with enlarged text`, async ({ page }, testInfo) => {
    for (const width of [900, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(prefix || "/");
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator(".performance-bars");
      const copy = page.locator(".performance-copy");
      const value = copy.locator("strong");
      const originalText = await value.innerText();
      const originalSize = await value.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
      const normalChart = await chart.boundingBox();
      const normalCopy = await copy.boundingBox();
      if (width === 900) {
        // The comparison stacks below 64rem of container width (see
        // DESIGN_SYSTEM.md); at a 900px viewport the copy sits below the chart.
        expect(normalCopy!.y).toBeGreaterThanOrEqual(normalChart!.y + normalChart!.height);
      } else {
        expect(normalCopy!.x).toBeGreaterThan(normalChart!.x + normalChart!.width);
      }
      await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
      const chartBox = await chart.boundingBox();
      const valueBox = await value.boundingBox();
      expect(valueBox!.y).toBeGreaterThanOrEqual(chartBox!.y + chartBox!.height);
      expect(valueBox!.x + valueBox!.width).toBeLessThanOrEqual(width);
      expect(await value.evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBeCloseTo(
        originalSize * 2,
      );
      await expect(value).toHaveText(originalText);
      expect(
        await value.evaluate((element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return range.getClientRects().length;
        }),
      ).toBe(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (prefix === "" && width === 900) {
        await page.locator(".performance-home").screenshot({ path: testInfo.outputPath("enlarged-performance.png") });
      }
    }
    await page.locator(".performance-copy").getByRole("link").click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/performance$`));
  });

  test(`${prefix || "English"} Home performance remains contained on mobile`, { tag: "@mobile" }, async ({ page }) => {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(prefix || "/");
      await page.evaluate(() => document.fonts.ready);
      for (const enlarged of [false, true]) {
        if (enlarged) await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
        const section = page.locator(".performance-home");
        await expect(section.locator("strong")).toBeVisible();
        expect(await section.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      }
    }
  });
}
