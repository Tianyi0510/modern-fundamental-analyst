import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/about",
  "/portfolio",
  "/performance",
  "/memos",
  "/memos/microsoft-stock-analysis-fiscal-year-2024",
  "/contact",
  "/support",
  "/disclaimer",
  "/subscription-preferences",
  "/subscription-confirmation",
];

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} tablet pages remain contained`, async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    for (const width of [768, 834, 1024, 1180, 1280]) {
      await page.setViewportSize({ width, height: 1024 });
      for (const route of routes) {
        await page.goto(`${prefix}${route === "/" ? "" : route}` || "/");
        await expect(page.locator("main h1")).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        expect.soft(overflow, `${prefix}${route} at ${width}px`).toBeLessThanOrEqual(1);
        for (const value of await page.locator(".financial-value-scroll").all()) {
          expect
            .soft(await value.evaluate((node) => node.scrollWidth - node.clientWidth), `${route} KPI at ${width}px`)
            .toBeLessThanOrEqual(1);
        }
        if (width > 800 && width <= 1100) {
          const footer = page.locator(".footer-main");
          const subscription = footer.locator(".subscribe-section");
          expect((await subscription.boundingBox())!.width).toBeCloseTo((await footer.boundingBox())!.width, 0);
          if (route === "/contact") {
            expect((await page.locator('input[name="email"]').first().boundingBox())!.width).toBeGreaterThan(240);
          }
          if (route === "/support") {
            const options = page.locator(".support-amount-option");
            const first = (await options.nth(0).boundingBox())!;
            const second = (await options.nth(1).boundingBox())!;
            expect(first.y).toBeCloseTo(second.y, 0);
          }
        }
        if (!prefix && width === 834) {
          await page.screenshot({
            path: testInfo.outputPath(`${route.replaceAll("/", "-") || "home"}.png`),
            fullPage: true,
          });
        }
      }
    }
  });
}
