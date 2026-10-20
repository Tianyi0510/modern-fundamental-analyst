import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} holdings spacing and compact figures @mobile`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`${prefix}/portfolio`);
      const section = page.locator(".portfolio-holdings-section");
      await expect(section).toHaveCSS("padding-top", "96px");
      await expect(section).toHaveCSS("padding-bottom", "96px");
      const gaps = await section.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const heading = element.querySelector(".portfolio-holdings-heading")!.getBoundingClientRect();
        const note = element.querySelector(".portfolio-return-note p")!.getBoundingClientRect();
        return { top: heading.top - bounds.top, bottom: bounds.bottom - note.bottom };
      });
      expect(gaps.top).toBeCloseTo(96, 0);
      expect(gaps.bottom).toBeCloseTo(96, 0);
      const symbol = page.locator("tbody th[scope=row]").first();
      const value = page.locator("tbody td").first();
      await expect(symbol).toHaveCSS("font-size", "16px");
      await expect(symbol).toHaveCSS("line-height", "24px");
      await expect(symbol).toHaveCSS("font-weight", "700");
      await expect(value).toHaveCSS("font-size", "16px");
      await expect(value).toHaveCSS("line-height", "24px");
      const column = page.locator("thead th").first();
      if (width <= 800) {
        await page.locator(".portfolio-mobile-sort select").selectOption("symbol");
      } else {
        await column.getByRole("button").click();
      }
      await expect(column).toHaveAttribute("aria-sort", "ascending");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (prefix === "" && [390, 1440].includes(width)) {
        await page.locator(".portfolio-holdings-heading").scrollIntoViewIfNeeded();
        await page.screenshot({ path: `../local/audit/holdings-2026-10-17/${test.info().project.name}-${width}.png` });
      }
      await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
      await expect(value).toHaveCSS("font-size", "32px");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}
