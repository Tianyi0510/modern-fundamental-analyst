import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(
    `${prefix || "English"} text logos render and preserve home navigation`,
    { tag: "@mobile" },
    async ({ page }) => {
      for (const width of [320, 390, 801, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${prefix}/about`);
        const header = page.locator(".site-header > .wordmark");
        const footer = page.locator(".footer-mark");
        for (const link of [header, footer]) {
          await expect(link).toHaveAccessibleName(/Modern Fundamental Analyst/);
          const logo = link.locator(".brand-logo");
          await logo.scrollIntoViewIfNeeded();
          await expect(logo).toHaveText("Modern Fundamental Analyst.");
          await expect(link.locator("img")).toHaveCount(0);
          await expect(logo).toHaveCSS("font-weight", "700");
          const box = await logo.boundingBox();
          expect(box!.x).toBeGreaterThanOrEqual(0);
          expect(box!.x + box!.width).toBeLessThanOrEqual(width);
        }
        if (width <= 390) {
          await page.locator(".mobile-menu-button").click();
          await expect(page.locator('[data-menu-phase="open"]')).toBeVisible();
          const drawer = page.locator(".mobile-menu-wordmark");
          await expect(drawer).toHaveAccessibleName("Modern Fundamental Analyst.");
          await expect(drawer.locator(".brand-logo")).toHaveText("Modern Fundamental Analyst.");
          await drawer.click();
        } else await header.click();
        await expect(page).toHaveURL(new RegExp(`${prefix || "/"}$`));
        await expect(page.locator(".mobile-menu-drawer")).not.toBeVisible();
        await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
        const overflow = await page.evaluate(() => ({
          width: innerWidth,
          scroll: document.documentElement.scrollWidth,
          elements: [...document.querySelectorAll("body *")]
            .filter((e) => {
              const b = e.getBoundingClientRect();
              return b.width > 0 && (b.right > innerWidth + 1 || b.left < -1);
            })
            .slice(0, 12)
            .map((e) => ({ tag: e.tagName, cls: e.className, right: e.getBoundingClientRect().right })),
        }));
        expect(overflow.scroll, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.width);
      }
    },
  );
}
