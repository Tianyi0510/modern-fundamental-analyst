import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} memo grid reflows without changing reading order`, async ({ page }, testInfo) => {
    for (const width of [320, 390, 900, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`${prefix}/memos`);
      const grid = page.locator(".memo-grid");
      const cards = grid.locator(".memo-card:visible");
      await expect(cards).toHaveCount(width <= 800 ? 1 : 3);
      const boxes = await cards.evaluateAll((elements) =>
        elements.map((element) => {
          const { x, y, width, height } = element.getBoundingClientRect();
          return { x, y, width, height };
        }),
      );
      const [first, second, third] = boxes;
      if (!first || (width > 800 && (!second || !third))) throw new Error("Expected visible memo cells");
      if (prefix === "" && testInfo.project.name === "chromium" && (width === 390 || width === 900)) {
        const path = testInfo.outputPath(`memo-grid-${width}.png`);
        await grid.screenshot({ path });
        await testInfo.attach(`memo-grid-${width}`, { path, contentType: "image/png" });
      }
      if (second && third) {
        if (width > 1100) {
          expect(first.y).toBeCloseTo(third.y, 0);
          expect(first.x + first.width).toBeLessThan(second.x);
        } else {
          expect(first.y).toBeCloseTo(second.y, 0);
          expect(third.y).toBeGreaterThan(first.y + first.height);
          expect(third.width).toBeCloseTo(first.width + second.width + 1, 0);
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const link = grid.getByRole("link");
      await link.focus();
      await expect(link).toBeFocused();
      await expect(link).not.toHaveCSS("outline-style", "none");
    }
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${prefix}/memos/microsoft-stock-analysis-fiscal-year-2024$`));
  });

  test(`${prefix || "English"} Home and memo grids support enlarged text`, { tag: "@mobile" }, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of [prefix || "/", `${prefix}/memos`]) {
        await page.goto(route);
        await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
        await page.evaluate(() => document.fonts.ready);
        const grid = page.locator(".memo-grid");
        await expect(grid.getByRole("link")).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        for (const card of await grid.locator(".memo-card:visible").all()) {
          expect(await card.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
          expect(await card.evaluate((element) => element.scrollHeight <= element.clientHeight)).toBe(true);
        }
      }
    }
    expect(errors).toEqual([]);
  });
}
