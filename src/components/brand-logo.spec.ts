import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} SVG logos load and preserve home navigation`, { tag: "@mobile" }, async ({ page }) => {
    for (const width of [320, 390, 801, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${prefix}/about`);
      const header = page.locator(".site-header > .wordmark");
      const footer = page.locator(".footer-mark");
      for (const [link, src] of [
        [header, "/logo-wordmark.svg"],
        [footer, "/logo-wordmark-inverse.svg"],
      ] as const) {
        await expect(link).toHaveAccessibleName(/Modern Fundamental Analyst/);
        const image = link.locator("img");
        await image.scrollIntoViewIfNeeded();
        await expect(image).toBeInViewport();
        await expect(image).toHaveAttribute("src", src);
        await expect(image).toHaveJSProperty("complete", true);
        await expect(image).toHaveJSProperty("naturalWidth", 1098);
        const box = await image.boundingBox();
        expect(box!.width / box!.height).toBeCloseTo(1098 / 80, 1);
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      }
      if (width <= 390) {
        await page.locator(".mobile-menu-button").click();
        await expect(page.locator('[data-menu-phase="open"]')).toBeVisible();
        const drawer = page.locator(".mobile-menu-wordmark");
        await expect(drawer).toHaveAccessibleName("Modern Fundamental Analyst.");
        await expect(drawer.locator("img")).toHaveAttribute("src", "/logo-wordmark.svg");
        await expect(drawer.locator("img")).toHaveJSProperty("naturalWidth", 1098);
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
  });
}
