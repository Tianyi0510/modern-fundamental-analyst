import { expect, test } from "@playwright/test";

const pages = [
  ["/about", ".about-section"],
  ["/memos", ".memo-index"],
  ["/contact", ".subscribe-section"],
  ["/support", ".support-section"],
  ["/disclaimer", ".legal-body"],
  ["/subscription-preferences", ".preferences-panel"],
] as const;

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  for (const mobile of [false, true]) {
    test(
      `${prefix || "English"} section transitions stay balanced on ${mobile ? "mobile" : "desktop"}`,
      mobile ? { tag: "@mobile" } : {},
      async ({ page }) => {
        for (const width of mobile ? [320, 390] : [900, 1440]) {
          await page.setViewportSize({ width, height: 1000 });
          for (const [path, selector] of pages) {
            await page.goto(`${prefix}${path}`);
            const hero = page.locator(".page-hero, .legal-hero");
            const section = page.locator(`main ${selector}`).first();
            await expect(hero).toHaveCSS("padding-top", "48px");
            await expect(hero).toHaveCSS("padding-bottom", "48px");
            await expect(section).toHaveCSS("padding-top", "48px");
            await expect(section).toHaveCSS("padding-bottom", "48px");
            if (path === "/about") {
              const subsequent = page.locator("main .about-section").nth(1);
              await expect(subsequent).toHaveCSS("padding-top", mobile ? "72px" : "96px");
              await expect(subsequent).toHaveCSS("padding-bottom", mobile ? "72px" : "96px");
            }
            if (path === "/contact" || path === "/subscription-preferences") {
              const reserve = section.locator('[data-slot="alert"]');
              const dimensions = await reserve.evaluate((element) => ({
                minHeight: Number.parseFloat(getComputedStyle(element).minHeight),
                height: element.getBoundingClientRect().height,
              }));
              expect(dimensions.minHeight).toBeCloseTo(26.4, 0);
              expect(dimensions.height).toBeGreaterThanOrEqual(26);
            }
            if (path === "/contact") {
              const subsequent = page.locator(".contact-section");
              await expect(subsequent).toHaveCSS("padding-top", mobile ? "72px" : "96px");
              await expect(subsequent).toHaveCSS("padding-bottom", mobile ? "72px" : "96px");
            }
            const gap = await page.evaluate(
              ({ selector }) => {
                const hero = document.querySelector(".page-hero, .legal-hero")!;
                const intro = hero.querySelector(".page-intro, .legal-subtitle")!;
                const section = document.querySelector(`main ${selector}`)!;
                return (
                  section.getBoundingClientRect().top +
                  Number.parseFloat(getComputedStyle(section).paddingTop) -
                  intro.getBoundingClientRect().bottom
                );
              },
              { selector },
            );
            expect(gap, `${prefix}${path} at ${width}px`).toBeCloseTo(96, 0);
            await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
            expect(
              await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
              `${prefix}${path} at ${width}px and 200% text`,
            ).toBe(true);
          }
          await page.goto(`${prefix}/performance`);
          await expect(page.locator(".returns")).toHaveCSS("padding-top", "48px");
          await expect(page.locator(".returns")).toHaveCSS("padding-bottom", "48px");
          await expect(page.locator(".methodology")).toHaveCSS("padding-top", mobile ? "72px" : "96px");
          await expect(page.locator(".methodology")).toHaveCSS("padding-bottom", mobile ? "72px" : "96px");
          await page.goto(prefix || "/");
          await expect(page.locator(".home-about")).toHaveCSS("padding-top", "48px");
          await expect(page.locator(".home-about")).toHaveCSS("padding-bottom", "48px");
          const submit = page.locator(".site-footer .subscribe-submit");
          await submit.scrollIntoViewIfNeeded();
          await expect(submit).toHaveCSS("color", "rgb(0, 0, 0)");
          await submit.hover();
          await expect(submit).toHaveCSS("color", "rgb(0, 0, 0)");
          await submit.focus();
          await expect(submit).toHaveCSS("color", "rgb(0, 0, 0)");
          await page.goto(`${prefix}/memos/microsoft-stock-analysis-fiscal-year-2024`);
          await expect(page.locator(".memo-article-header")).toHaveCSS("padding-top", "48px");
          await expect(page.locator(".memo-article-header")).toHaveCSS("padding-bottom", "48px");
        }
      },
    );
  }
}
