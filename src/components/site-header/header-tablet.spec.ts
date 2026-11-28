import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} responsive header aligns with its Sheet`, async ({ page }) => {
    await page.goto(`${prefix}/about`);
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320, 390, 768, 800, 801, 834, 1024, 1180, 1279]) {
      await page.setViewportSize({ width, height: 900 });
      const header = page.locator(".site-header");
      const trigger = page.locator(".mobile-menu-button");
      await expect(header.locator(":scope > .wordmark")).toHaveCSS("margin-block", "24px");
      await expect(trigger).toHaveCSS("width", "44px");
      await expect(trigger).toHaveCSS("height", "44px");
      await expect(trigger.locator("svg")).toHaveCSS("width", "20px");
      await expect(page.locator(".header-actions")).toBeHidden();
      const box = (await header.boundingBox())!;
      const expectedWidth = width <= 800 ? Math.min(720, width - 32) : width - 64;
      expect(box.width).toBe(expectedWidth);
      expect(box.x).toBe((width - expectedWidth) / 2);
      const logo = (await header.locator(":scope > .wordmark .brand-logo").boundingBox())!;
      const footerLogo = (await page.locator(".footer-brand .brand-logo").boundingBox())!;
      const heading = (await page.locator("h2.about-section-heading").first().boundingBox())!;
      expect(logo.x).toBeCloseTo(footerLogo.x, 1);
      expect(logo.x).toBeCloseTo(heading.x, 1);
      const open = (await trigger.boundingBox())!;
      await trigger.click();
      await expect(page.locator(".mobile-menu-layer")).toHaveAttribute("data-menu-phase", "open");
      const close = page.locator(".mobile-menu-close");
      const menuLogo = (await page.locator(".mobile-menu-wordmark .brand-logo").boundingBox())!;
      const closeBox = (await close.boundingBox())!;
      expect(logo.x).toBeCloseTo(box.x, 1);
      expect(open.x + open.width).toBeCloseTo(box.x + box.width, 1);
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

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} desktop navigation adapts to enlarged text and restores the fitting layout`, async ({
    page,
  }) => {
    await page.goto(prefix || "/");
    await page.evaluate(() => document.fonts.ready);
    const trigger = page.locator(".mobile-menu-button");
    const actions = page.locator(".header-actions");
    const brand = page.locator(".site-header > .wordmark");
    for (const width of [1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(actions).toBeVisible();
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      await expect(actions).toBeHidden();
      const open = (await trigger.boundingBox())!;
      const logo = (await brand.boundingBox())!;
      expect(open.x - logo.x - logo.width).toBeGreaterThanOrEqual(8);
      await trigger.click();
      const close = page.locator(".mobile-menu-close");
      await expect(page.locator(".mobile-menu-layer")).toHaveAttribute("data-menu-phase", "open");
      await expect(close).toBeFocused();
      expect((await close.boundingBox())!.x).toBeCloseTo(open.x, 1);
      await page.keyboard.press("Escape");
      await expect(trigger).toBeFocused();
      await trigger.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "";
      });
      await expect(page.getByRole("dialog")).toBeHidden();
      await expect(trigger).toBeHidden();
      await expect(actions).toBeVisible();
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "125%";
      });
      if (width === 1280 && !prefix) {
        await expect(trigger).toBeVisible();
        await expect(actions).toBeHidden();
      } else {
        await expect(trigger).toBeHidden();
        await expect(actions).toBeVisible();
        const restored = (await brand.boundingBox())!;
        expect((await actions.boundingBox())!.x - restored.x - restored.width).toBeGreaterThanOrEqual(8);
      }
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "";
      });
    }
  });
}
