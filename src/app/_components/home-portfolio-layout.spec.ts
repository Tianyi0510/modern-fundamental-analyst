import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} home portfolio aligns its card and heading`, async ({ page }) => {
    for (const width of [390, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(prefix || "/");
      const hero = page.locator(".hero");
      await expect(hero).toHaveCSS("padding-top", "96px");
      await expect(hero).toHaveCSS("padding-bottom", "96px");
      await expect(hero.getByRole("heading", { level: 1 })).toHaveCSS("margin-top", "48px");
      await expect(hero.getByRole("heading", { level: 1 })).toHaveCSS("margin-bottom", "48px");
      const section = page.locator(".home-portfolio-section");
      const title = section.getByRole("heading");
      const label = section.locator(".section-number");
      const card = section.locator(".allocation-card");
      const list = section.locator(".holdings-list");
      await expect(title).toBeVisible();
      const heading = (await title.boundingBox())!;
      const eyebrow = (await label.boundingBox())!;
      const allocation = (await card.boundingBox())!;
      const holdings = (await list.boundingBox())!;
      const ring = (await card.locator(".allocation-ring").boundingBox())!;
      const legend = (await card.locator(".allocation-legend").boundingBox())!;
      expect(legend.y - ring.y - ring.height).toBeCloseTo(48, 0);
      expect(heading.y - eyebrow.y - eyebrow.height).toBeCloseTo(48, 0);
      if (width > 800) {
        expect(allocation.y).toBeCloseTo(heading.y, 0);
        expect(allocation.y + allocation.height).toBeCloseTo(holdings.y + holdings.height, 0);
        expect(allocation.x).toBeGreaterThan(heading.x + heading.width);
      } else {
        expect(allocation.y - holdings.y - holdings.height).toBeCloseTo(48, 0);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
