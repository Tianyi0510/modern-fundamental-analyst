import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} MDX article preserves research and responsive layout @mobile`, async ({
    page,
  }, testInfo) => {
    await page.goto(`${prefix}/memos/microsoft-stock-analysis-fiscal-year-2024`);
    const body = page.locator(".article-body");
    await expect(body).toHaveAttribute("lang", "en");
    await expect(body.locator("p")).toHaveCount(40);
    await expect(body.locator(".memo-section")).toHaveCount(3);
    await expect(body.locator(".memo-references a")).toHaveCount(5);
    await expect(body.getByRole("heading", { level: 3, name: "Investment conclusion", exact: true })).toHaveCount(3);
    for (const width of testInfo.project.name === "webkit" ? [320, 390] : [320, 390, 834, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => document.fonts.ready);
      await expect(body).toBeVisible();
      const hero = page.locator(".memo-article-header");
      await expect(hero).toHaveCSS("padding-top", "96px");
      await expect(hero).toHaveCSS("padding-bottom", "0px");
      await expect(hero.locator("h1")).toHaveCSS("font-size", width < 800 ? "51px" : width < 1200 ? "67px" : "90px");
      const share = hero.getByRole("button");
      await expect(share).toBeEnabled();
      await expect(page.locator(".memo-article-body").getByRole("button")).toHaveCount(0);
      const meta = (await hero.locator(".article-meta").boundingBox())!;
      const action = (await share.boundingBox())!;
      expect(action.x).toBeGreaterThanOrEqual(meta.x);
      expect(action.x + action.width).toBeLessThanOrEqual(meta.x + meta.width + 1);
      const titleBox = await page.locator(".memo-article h1").boundingBox();
      for (const selector of [".article-body", ".article-lead", ".article-disclaimer", ".article-notes"]) {
        for (const region of await page.locator(selector).all()) {
          const box = await region.boundingBox();
          expect(box!.x).toBeCloseTo(titleBox!.x, 0);
          expect(box!.width).toBeCloseTo(titleBox!.width, 0);
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
