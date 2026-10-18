import { expect, test } from "@playwright/test";
import { colorContrast } from "../../../scripts/color-contrast";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  for (const width of [390, 1440]) {
    test(
      `${prefix || "English"} Fluent Web surfaces and brand exceptions at ${width}px`,
      width === 390 ? { tag: "@mobile" } : {},
      async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${prefix}/contact`);
        await expect(page.locator(".page-hero-band")).toHaveCSS("background-color", "rgb(245, 247, 250)");
        const field = page.locator('main input[type="email"]').first();
        await expect(field).toHaveCSS("background-color", "rgb(255, 255, 255)");
        await expect(field).toHaveCSS("border-radius", "4px");
        const colors = await field.evaluate((element) => {
          const style = getComputedStyle(element);
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 1;
          const context = canvas.getContext("2d")!;
          context.fillStyle = style.borderTopColor;
          context.fillRect(0, 0, 1, 1);
          const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
          return { border: `rgb(${r}, ${g}, ${b})`, background: style.backgroundColor };
        });
        expect(colorContrast(colors.border, colors.background)).toBeGreaterThanOrEqual(3);
        await field.focus();
        await expect(field).toHaveCSS("outline-color", "rgb(13, 40, 139)");
        await expect(page.locator('.site-footer input[type="email"]')).toHaveCSS("border-radius", "10000px");
        await expect(page.locator(".site-footer")).toHaveCSS("background-color", "rgb(0, 0, 0)");
        const action = page.locator('main button[type="submit"]').first();
        await expect(action).toHaveCSS("border-radius", "10000px");

        await page.goto(prefix || "/");
        const cards = page.locator(".metric");
        expect(await cards.count()).toBeGreaterThan(0);
        for (const card of await cards.all()) await expect(card).toHaveCSS("border-radius", "0px");
        const grid = page.locator(".memo-grid");
        await expect(grid).toHaveCSS("border-radius", "0px");
        await expect(grid).toHaveCSS("background-color", "rgb(238, 240, 242)");
        await expect(page.locator(".memo-card [data-slot=card-footer]").first()).toHaveCSS(
          "border-top-color",
          "rgb(238, 240, 242)",
        );
        await expect(grid).toHaveCSS("border-top-width", "0px");
        await expect(grid).toHaveCSS("overflow", "visible");
        const memo = page.locator("a.memo-card").first();
        await expect(memo.locator("[data-slot=card]")).toHaveCSS("border-radius", "0px");
        await page.keyboard.press("Tab");
        await memo.focus();
        await expect(memo).toHaveCSS("outline-width", "2px");
        await expect(memo).toHaveCSS("border-radius", "0px");
        await expect(grid).not.toHaveCSS("box-shadow", "none");
        const description = page.locator(".memo-card [data-slot=card-description]").first();
        const textColors = await description.evaluate((element) => {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 1;
          const context = canvas.getContext("2d")!;
          const rgb = (color: string) => {
            context.clearRect(0, 0, 1, 1);
            context.fillStyle = color;
            context.fillRect(0, 0, 1, 1);
            const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
            return `rgb(${r}, ${g}, ${b})`;
          };
          return {
            text: rgb(getComputedStyle(element).color),
            background: rgb(getComputedStyle(element.closest(".memo-card")!).backgroundColor),
          };
        });
        expect(colorContrast(textColors.text, textColors.background)).toBeGreaterThanOrEqual(4.5);
        const logo = page.locator(".site-header > .wordmark");
        await expect(logo.locator(".brand-logo")).toHaveText("Modern Fundamental Analyst.");

        if (width === 1440) {
          await page.locator(".language-trigger").click();
          const popup = page.locator('[data-slot="dropdown-menu-content"]');
          await expect(popup).toHaveCSS("border-radius", "12px");
          await expect(popup).toHaveCSS("border-top-width", "0px");
          await expect(popup).toHaveCSS("background-color", "rgb(255, 255, 255)");
          const shadow = await popup.evaluate((element) => getComputedStyle(element).boxShadow);
          // The menu uses the two-layer Fluent shadow16 preset.
          expect(shadow).toContain("0px 8px 16px 0px");
          expect(shadow).toContain("0px 0px 2px 0px");
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
