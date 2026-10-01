import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", backgrounds: [".home-header", ".hero-band", ".memos-home-band", ".cta-band", ".site-footer"] },
  { path: "/contact", backgrounds: [".page-hero-band", ".site-footer"] },
  { path: "/performance", backgrounds: [".page-hero-band", ".section-gray", ".site-footer"] },
  { path: "/about", backgrounds: [".page-hero-band", ".section-gray", ".site-footer"] },
  {
    path: "/memos/microsoft-stock-analysis-fiscal-year-2024",
    backgrounds: [".memo-article-header-band", ".site-footer"],
  },
] as const;

for (const width of [390, 1024, 1440]) {
  for (const reservedScrollbar of [false, true]) {
    test(`full-width backgrounds fit ${width}px with ${reservedScrollbar ? "reserved" : "normal"} scrollbar`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });

      for (const locale of ["", "/zh-tw", "/zh-cn"]) {
        for (const { path, backgrounds } of pages) {
          await page.goto(path === "/" ? locale || "/" : `${locale}${path}`);
          if (reservedScrollbar) {
            await page.addStyleTag({
              content: ":root { overflow-y: scroll !important; scrollbar-gutter: stable !important; }",
            });
            const hasReservedGutter = await page.evaluate(
              () => document.body.getBoundingClientRect().right < innerWidth,
            );
            if (!hasReservedGutter) {
              // Headless WebKit uses overlay scrollbars; reserve the same 15px of layout space explicitly.
              await page.addStyleTag({ content: ":root { padding-right: 15px !important; }" });
            }
          }

          const layout = await page.evaluate((selectors) => {
            const availableWidth = document.body.getBoundingClientRect().right;
            return {
              availableWidth,
              scrollWidth: document.body.scrollWidth,
              backgrounds: selectors.map((selector) => {
                const element = document.querySelector(selector);
                if (!element) throw new Error(`Missing background ${selector}`);
                const { left, right } = element.getBoundingClientRect();
                return { selector, left, right };
              }),
            };
          }, backgrounds);

          if (reservedScrollbar) expect(layout.availableWidth).toBeLessThan(width);
          expect(layout.scrollWidth, `${locale}${path} horizontal overflow`).toBeLessThanOrEqual(layout.availableWidth);
          for (const background of layout.backgrounds) {
            expect(background.left, `${locale}${path} ${background.selector} left`).toBeCloseTo(0, 0);
            expect(background.right, `${locale}${path} ${background.selector} right`).toBeCloseTo(
              layout.availableWidth,
              0,
            );
          }
          if (path === "/contact") {
            const formBand = await page.locator('section[aria-labelledby="contact-form-title"]').evaluate((section) => {
              const { left, right } = section.parentElement!.getBoundingClientRect();
              return { left, right };
            });
            expect(formBand.left).toBeCloseTo(0, 0);
            expect(formBand.right).toBeCloseTo(layout.availableWidth, 0);
          }
        }
      }
    });
  }
}
