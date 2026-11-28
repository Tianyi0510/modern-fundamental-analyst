import { expect, test } from "@playwright/test";

const routes = [
  [
    "/",
    [
      [".home-opening", ".hero"],
      [".home-about", ".home-about"],
      [".home-portfolio-section", ".home-portfolio-section .intro"],
      [".performance-home", ".performance-home"],
      [".memos-home-band", ".memos-home"],
      [".cta-band", ".cta"],
    ],
  ],
  [
    "/about",
    [
      [".page-hero-band", ".page-hero"],
      [".about-section-band", ".about-section"],
      [".about-closing", ".about-closing"],
      [".about-boundaries", ".about-boundaries > section"],
    ],
  ],
  [
    "/portfolio",
    [
      [".page-hero-band", ".page-hero"],
      [".portfolio-holdings-section", ".portfolio-holdings-section"],
    ],
  ],
  [
    "/performance",
    [
      [".page-hero-band", ".page-hero"],
      [".returns", ".returns"],
      [".section-gray", ".methodology"],
    ],
  ],
  [
    "/memos",
    [
      [".page-hero-band", ".page-hero"],
      [".memo-index", ".memo-index"],
    ],
  ],
  [
    "/contact",
    [
      [".page-hero-band", ".page-hero"],
      ["main .subscribe-section", "main .subscribe-section"],
      [".contact-band", ".contact-section"],
    ],
  ],
  [
    "/support",
    [
      [".page-hero-band", ".page-hero"],
      [".support-section", ".support-section"],
    ],
  ],
  [
    "/disclaimer",
    [
      [".legal-hero", ".legal-hero"],
      [".legal-section", ".legal-section"],
    ],
  ],
  [
    "/subscription-preferences",
    [
      [".page-hero-band", ".page-hero"],
      [".preferences-panel", ".preferences-panel"],
    ],
  ],
] as const;

for (const width of [1440, 834, 390]) {
  test(
    `page sections use 64px padding without external gaps at ${width}px`,
    width === 390 ? { tag: "@mobile" } : {},
    async ({ page }) => {
      for (const [route, sections] of routes) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(route);
        for (const [outer, inner] of sections) {
          await expect(page.locator(outer).first()).toBeAttached();
          await expect(page.locator(inner).first()).toBeAttached();
          for (const block of await page.locator(outer).all()) {
            await expect(block).toHaveCSS("margin-top", "0px");
            await expect(block).toHaveCSS("margin-bottom", "0px");
          }
          for (const block of await page.locator(inner).all()) {
            await expect(block).toHaveCSS("padding-top", "64px");
            await expect(block).toHaveCSS("padding-bottom", "64px");
          }
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      await page.goto("/disclaimer");
      await expect(page.locator(".legal-content").first()).toHaveCSS("row-gap", "48px");
      await page.goto("/");
      const gap = await page.locator(".home-about").evaluate((element) => {
        const previous = element.previousElementSibling!;
        return element.getBoundingClientRect().top - previous.getBoundingClientRect().bottom;
      });
      expect(gap).toBe(0);
      await expect(page.locator(".home-about")).toHaveCSS("row-gap", "48px");
      await expect(page.locator(".allocation-legend")).toHaveCSS("row-gap", "8px");
      await expect(page.locator(".holding-row div").first()).toHaveCSS("row-gap", "8px");
      const headerGap = await page.locator(".home-opening").evaluate((element) => {
        const header = document.querySelector(".home-header")!;
        return element.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
      });
      expect(headerGap).toBe(0);
    },
  );
}

for (const width of [390, 801, 1440]) {
  test(`memo index groups use 48px and content-driven cards at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/memos");
    const cards = page.locator(".memo-index-featured");
    const disclosure = page.locator(".memo-disclosure");
    await expect(cards).toHaveCSS("margin-bottom", "48px");
    const cardsBox = (await cards.boundingBox())!;
    const disclosureBox = (await disclosure.boundingBox())!;
    expect(disclosureBox.y - cardsBox.y - cardsBox.height).toBeCloseTo(48, 0);
    await expect(page.locator(".memo-card").first()).toHaveCSS("min-height", "auto");
    const columns = await cards.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
    expect(columns).toBe(width > 1100 ? 3 : width > 800 ? 2 : 1);
  });
}

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} editorial spacing follows visible content`, async ({ page }) => {
    for (const width of [390, 834, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const gapAfter = (selector: string) =>
        page
          .locator(selector)
          .evaluate(
            (element) =>
              element.nextElementSibling!.getBoundingClientRect().top - element.getBoundingClientRect().bottom,
          );
      await page.goto(`${prefix}/support`);
      expect(await gapAfter(".support-copy p")).toBeCloseTo(48, 0);
      await page.goto(`${prefix}/performance`);
      expect(await gapAfter(".returns .section-number")).toBeCloseTo(48, 0);
      expect(await gapAfter(".returns .section-heading")).toBeCloseTo(48, 0);
      expect(await gapAfter("figure h3:has(+ p) >> nth=0")).toBeCloseTo(32, 0);
      expect(await gapAfter("figure p:has(+ p) >> nth=0")).toBeCloseTo(24, 0);
      expect(await gapAfter(".methodology-source h3")).toBeCloseTo(32, 0);
      expect(await gapAfter(".methodology-explanation > p:first-child")).toBeCloseTo(24, 0);
      expect(await gapAfter(".methodology-explanation")).toBeCloseTo(48, 0);
      await expect(page.locator(".methodology")).toHaveCSS("padding-block", "64px");
      await page.goto(`${prefix}/contact`);
      await page.evaluate(() => document.fonts.ready);
      for (const [bar, content] of [
        [".site-header", ":scope > .wordmark .brand-logo"],
        [".footer-bottom", "small"],
      ] as const) {
        const insets = await page.locator(bar).evaluate((element, selector) => {
          const bounds = element.getBoundingClientRect();
          const text = element.querySelector(selector)!.getBoundingClientRect();
          const style = getComputedStyle(element);
          return [
            text.top - bounds.top - parseFloat(style.borderTopWidth),
            bounds.bottom - text.bottom - parseFloat(style.borderBottomWidth),
          ];
        }, content);
        for (const inset of insets) expect(inset).toBeCloseTo(24, 1);
      }
      const subscribeGap = await gapAfter("#contact-subscribe h2");
      expect(subscribeGap).toBeCloseTo(32, 0);
      expect(await gapAfter("#contact-form-title")).toBeCloseTo(subscribeGap, 0);
      await page.goto(`${prefix}/disclaimer`);
      expect(await gapAfter(".legal-section-copy p:first-child >> nth=0")).toBeCloseTo(24, 0);
      const risk = page.locator(".legal-section").nth(1);
      const gray = await page.locator(".legal-hero").evaluate((el) => getComputedStyle(el).backgroundColor);
      await expect(risk).toHaveCSS("background-color", gray);
      expect((await risk.boundingBox())!.width).toBe(width);
      const left = (await page.locator(".legal-header").boundingBox())!.x;
      for (const section of await page.locator(".legal-content").all()) {
        const label = (await section.locator(".legal-section-label").boundingBox())!;
        const heading = (await section.locator("h2").boundingBox())!;
        const first = (await section.locator(".legal-section-copy p").first().boundingBox())!;
        expect(heading.x).toBeCloseTo(left, 1);
        expect(heading.y - label.y - label.height).toBeCloseTo(48, 1);
        if (width > 1100) {
          expect(first.y).toBeCloseTo(heading.y, 1);
          expect(first.x).toBeGreaterThan(heading.x + heading.width);
        } else {
          expect(first.x).toBeCloseTo(left, 1);
          expect(first.y - heading.y - heading.height).toBeCloseTo(48, 1);
        }
      }
      await page.goto(`${prefix}/about`);
      expect(await gapAfter(".about-copy:has(p + p) p:first-child >> nth=0")).toBeCloseTo(24, 0);
      for (const section of await page.locator(".about-section").all()) {
        const label = (await section.locator(".about-section-label").boundingBox())!;
        const heading = (await section.locator("h2").boundingBox())!;
        const copy = (await section.locator(".about-copy p").first().boundingBox())!;
        expect(heading.y - label.y - label.height).toBeCloseTo(48, 1);
        if (width > 1100) {
          expect(copy.y).toBeCloseTo(heading.y, 1);
          expect(copy.x).toBeGreaterThan(heading.x + heading.width);
        } else {
          expect(copy.x).toBeCloseTo(heading.x, 1);
          expect(copy.y - heading.y - heading.height).toBeCloseTo(48, 1);
        }
      }
      expect(await gapAfter(".about-closing > div > p:first-child")).toBeCloseTo(24, 0);
      const panels = page.locator(".about-boundaries > section");
      const shell = (await page.locator(".about-closing").boundingBox())!;
      const first = (await panels.first().locator("h2").boundingBox())!;
      const last = (await panels.last().locator("ol").boundingBox())!;
      expect(first.x).toBeCloseTo(shell.x, 0);
      expect(last.x + last.width).toBeCloseTo(shell.x + shell.width, 0);
      for (const row of await panels.locator("li:not(:last-child)").all()) {
        expect(
          await row.evaluate(
            (el) => el.nextElementSibling!.getBoundingClientRect().top - el.getBoundingClientRect().bottom,
          ),
        ).toBeCloseTo(24, 0);
      }
      await page.goto(`${prefix}/memos`);
      expect(await gapAfter(".memo-card h2 >> nth=0")).toBeCloseTo(32, 0);
      await page.locator(".memo-disclosure button").click();
      await expect(page.locator(".memo-index-row h2").first()).toBeVisible();
      expect(await gapAfter(".memo-index-row h2 >> nth=0")).toBeCloseTo(32, 0);
      if (width === 390) {
        expect(await gapAfter(".memo-planned-row h2 >> nth=0")).toBeCloseTo(32, 0);
        expect(await gapAfter(".memo-planned-row p:first-of-type >> nth=0")).toBeCloseTo(24, 0);
      }
      await page.goto(`${prefix}/memos/microsoft-stock-analysis-fiscal-year-2024`);
      expect(await gapAfter(".memo-subsection p:has(+ p) >> nth=0")).toBeCloseTo(24, 0);
    }
  });
}

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} Home Hero action rows retain their grouping @mobile`, async ({ page }) => {
    await page.goto(prefix || "/");
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320, 390, 834, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const actions = page.locator(".hero-actions");
      const group = (await actions.boundingBox())!;
      const links = actions.getByRole("link");
      const first = (await links.nth(0).boundingBox())!;
      const second = (await links.nth(1).boundingBox())!;
      const summary = (await page.locator(".metric-band").boundingBox())!;
      if (second.y >= first.y + first.height) {
        expect(second.y - first.y - first.height).toBeCloseTo(16, 1);
      } else {
        expect(second.x - first.x - first.width).toBeCloseTo(32, 1);
      }
      if (!prefix && width === 390) expect(second.y).toBeGreaterThan(first.y + first.height);
      expect(summary.y - group.y - group.height).toBeCloseTo(48, 1);
    }
  });
}
