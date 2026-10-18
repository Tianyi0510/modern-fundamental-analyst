import { expect, test } from "@playwright/test";

const routes = [
  [
    "/",
    [
      [".home-opening", ".hero"],
      [".home-about", ".home-about"],
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
      [".legal-body", ".legal-body"],
    ],
  ],
  [
    "/subscription-preferences",
    [
      [".page-hero-band", ".page-hero"],
      [".preferences-panel", ".preferences-panel"],
    ],
  ],
  [
    "/memos/microsoft-stock-analysis-fiscal-year-2024",
    [
      [".memo-article-header-band", ".memo-article-header"],
      [".memo-article-body", ".memo-article-body"],
    ],
  ],
] as const;

for (const width of [1440, 390]) {
  test(`page sections use 96px padding without external gaps at ${width}px`, async ({ page }) => {
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
          await expect(block).toHaveCSS("padding-top", "96px");
          await expect(block).toHaveCSS("padding-bottom", inner === ".memo-article-header" ? "0px" : "96px");
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.goto("/disclaimer");
    await expect(page.locator(".legal-content")).toHaveCSS("row-gap", "48px");
    await page.goto("/");
    const gap = await page.locator(".home-about").evaluate((element) => {
      const previous = element.previousElementSibling!;
      return element.getBoundingClientRect().top - previous.getBoundingClientRect().bottom;
    });
    expect(gap).toBe(0);
    await expect(page.locator(".home-about")).toHaveCSS("row-gap", "48px");
    const headerGap = await page.locator(".home-opening").evaluate((element) => {
      const header = document.querySelector(".home-header")!;
      return element.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
    });
    expect(headerGap).toBe(0);
  });
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
