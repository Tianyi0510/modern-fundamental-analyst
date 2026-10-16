import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  for (const width of [390, 1440]) {
    test(
      `${prefix || "English"} links prefetch on intent at ${width}px`,
      width === 390 ? { tag: "@mobile" } : {},
      async ({ page }) => {
        const prefetched: string[] = [];
        page.on("request", (request) => {
          if (request.headers()["next-router-prefetch"] === "1") prefetched.push(new URL(request.url()).pathname);
        });
        await page.setViewportSize({ width, height: 844 });
        // Network quiescence is the observable behavior under test: idle links must not fetch routes.
        // eslint-disable-next-line playwright/no-networkidle -- This test measures idle speculative network requests, not UI readiness.
        await page.goto(prefix || "/", { waitUntil: "networkidle" });
        expect(prefetched).toEqual([]);
        const portfolio = page
          .locator(".hero a")
          .filter({ hasText: /View Portfolio|投資組合|投资组合/ })
          .first();
        await portfolio.focus();
        await expect.poll(() => prefetched).toContain(`${prefix}/portfolio`);
        await portfolio.click();
        await expect(page).toHaveURL(`${prefix}/portfolio`);
        await expect(page.locator(".portfolio-row").first()).toBeVisible();
      },
    );
  }
}
