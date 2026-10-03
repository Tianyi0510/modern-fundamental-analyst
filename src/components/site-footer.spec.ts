import { expect, test } from "@playwright/test";

test.describe("header interaction QA", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test("footer status and input text retain their semantic weight", async ({ page }) => {
    for (const width of [1440, 801, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/subscription-preferences");
      const status = page.locator(".site-footer [role=status]");
      await expect(status).toHaveCSS("font-size", "15px");
      await expect(status).toHaveCSS("font-weight", "700");
      await expect(status).toBeVisible();
      await expect(page.locator("main input[name=email]").first()).toHaveCSS("font-weight", "400");
      await expect(page.locator(".site-footer input[name=email]")).toHaveCSS("font-weight", "400");
      await page.goto("/disclaimer");
      await expect(page.locator(".site-footer [role=status]")).toHaveCSS("font-size", "15px");
      await expect(page.locator(".site-footer [role=status]")).toHaveCSS("font-weight", "700");
      const inset = await page.locator(".legal-body").evaluate((body) => {
        const first = body.querySelector(".legal-section-heading")!;
        return first.getBoundingClientRect().top - body.getBoundingClientRect().top;
      });
      expect(inset).toBe(width <= 800 ? 72 : 96);
    }
  });
});
