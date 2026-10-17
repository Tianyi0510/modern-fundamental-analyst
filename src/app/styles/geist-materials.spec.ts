import { expect, test } from "@playwright/test";
import { colorContrast } from "../../../scripts/color-contrast";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  for (const width of [390, 1440]) {
    test(
      `${prefix || "English"} Geist surfaces and brand exceptions at ${width}px`,
      width === 390 ? { tag: "@mobile" } : {},
      async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${prefix}/contact`);
        await expect(page.locator(".page-hero-band")).toHaveCSS("background-color", "rgb(248, 249, 251)");
        const field = page.locator('main input[type="email"]').first();
        await expect(field).toHaveCSS("background-color", "rgb(255, 255, 255)");
        await expect(field).toHaveCSS("border-radius", "6px");
        const colors = await field.evaluate((element) => {
          const style = getComputedStyle(element);
          return { border: style.borderTopColor, background: style.backgroundColor };
        });
        expect(colorContrast(colors.border, colors.background)).toBeGreaterThanOrEqual(3);
        await field.focus();
        await expect(field).toHaveCSS("outline-color", "rgb(0, 41, 145)");
        await expect(page.locator('.site-footer input[type="email"]')).toHaveCSS("border-radius", "999px");
        await expect(page.locator(".site-footer")).toHaveCSS("background-color", "rgb(0, 0, 0)");
        const action = page.locator('main button[type="submit"]').first();
        await expect(action).toHaveCSS("border-radius", "999px");

        await page.goto(prefix || "/");
        const cards = page.locator(".metric");
        expect(await cards.count()).toBeGreaterThan(0);
        for (const card of await cards.all()) await expect(card).toHaveCSS("border-radius", "0px");
        const grid = page.locator(".memo-grid");
        await expect(grid).toHaveCSS("border-radius", "6px");
        await expect(grid).toHaveCSS("background-color", "rgb(237, 237, 237)");
        await expect(page.locator(".memo-card > small").first()).toHaveCSS("border-top-color", "rgb(237, 237, 237)");
        await expect(grid).toHaveCSS("border-top-width", "0px");
        await expect(grid).toHaveCSS("overflow", "visible");
        const memo = page.locator("a.memo-card").first();
        await page.keyboard.press("Tab");
        await memo.focus();
        await expect(memo).toHaveCSS("outline-width", "2px");
        await expect(memo).toHaveCSS("border-radius", "6px");
        await expect(grid).not.toHaveCSS("box-shadow", "none");
        await expect(page.locator(".memo-card p").first()).toHaveCSS("color", "rgb(77, 77, 77)");
        const logo = page.locator(".site-header > .wordmark");
        await expect(logo.locator("img")).toHaveAttribute("src", "/logo-wordmark.svg");

        if (width === 1440) {
          await page.locator(".language-trigger").click();
          const popup = page.locator('[data-slot="dropdown-menu-content"]');
          await expect(popup).toHaveCSS("border-radius", "12px");
          await expect(popup).toHaveCSS("border-top-width", "0px");
          await expect(popup).toHaveCSS("background-color", "rgb(255, 255, 255)");
          const shadow = await popup.evaluate((element) => getComputedStyle(element).boxShadow);
          // The menu material owns both its outline and elevation; no extra border is stacked.
          expect(shadow).toContain("0px 16px 24px -8px");
          expect(shadow).toContain("0px 4px 8px -4px");
          await page.keyboard.press("Escape");
          await expect(page.locator(".language-trigger")).toBeFocused();
        } else {
          await page.locator(".mobile-menu-button").click();
          await expect(page.locator('[data-menu-phase="open"]')).toBeVisible();
          await expect(page.locator(".mobile-menu-content")).toHaveCSS("background-color", "rgb(255, 255, 255)");
          await page.keyboard.press("Escape");
          await expect(page.locator(".mobile-menu-button")).toBeFocused();
        }
      },
    );
  }
}
