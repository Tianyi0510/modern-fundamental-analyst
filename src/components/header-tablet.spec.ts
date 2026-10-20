import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} tablet header aligns with its Sheet`, async ({ page }) => {
    await page.goto(prefix || "/");
    for (const width of [834, 1024, 1180, 1279]) {
      await page.setViewportSize({ width, height: 900 });
      const header = page.locator(".site-header");
      const trigger = page.locator(".mobile-menu-button");
      await expect(header).toHaveCSS("height", "84px");
      await expect(trigger).toHaveCSS("width", "48px");
      await expect(page.locator(".header-actions")).toBeHidden();
      const box = (await header.boundingBox())!;
      expect(box.x).toBe(32);
      expect(box.width).toBe(width - 64);
      const logo = (await header.locator(":scope > .wordmark").boundingBox())!;
      const open = (await trigger.boundingBox())!;
      await trigger.click();
      await expect(page.locator(".mobile-menu-layer")).toHaveAttribute("data-menu-phase", "open");
      const close = page.locator(".mobile-menu-close");
      const menuLogo = (await page.locator(".mobile-menu-wordmark").boundingBox())!;
      const closeBox = (await close.boundingBox())!;
      expect(menuLogo.x).toBeCloseTo(logo.x, 0);
      expect(menuLogo.y).toBeCloseTo(logo.y, 0);
      expect(closeBox.x).toBeCloseTo(open.x, 0);
      expect(closeBox.y).toBeCloseTo(open.y, 0);
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toBeHidden();
      await expect(trigger).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
