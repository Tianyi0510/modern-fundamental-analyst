import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} MDX article preserves research and responsive layout @mobile`, async ({
    page,
  }, testInfo) => {
    await page.goto(`${prefix}/memos/microsoft-stock-analysis-fiscal-year-2024`);
    const body = page.locator(".article-body");
    await expect(body).toHaveAttribute("lang", "en");
    await expect(body.locator("p")).toHaveCount(40);
    await expect(body.locator(".memo-section")).toHaveCount(3);
    await expect(body.locator(".memo-references a")).toHaveCount(5);
    await expect(body.getByRole("heading", { level: 3, name: "Investment conclusion", exact: true })).toHaveCount(3);
    for (const width of testInfo.project.name === "webkit" ? [320, 390] : [320, 390, 834, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => document.fonts.ready);
      await expect(body).toBeVisible();
      const hero = page.locator(".memo-article-header");
      await expect(hero).toHaveCSS("padding-top", "96px");
      await expect(hero).toHaveCSS("padding-bottom", "0px");
      await expect(hero.locator("h1")).toHaveCSS("font-size", width < 800 ? "51px" : width < 1200 ? "67px" : "90px");
      const share = hero.getByRole("button");
      await expect(share).toBeEnabled();
      const metadataText = hero.locator(".article-meta time");
      for (const [property, value] of [
        ["font-size", "16px"],
        ["line-height", "24px"],
        ["font-weight", "400"],
      ] as const) {
        await expect(metadataText).toHaveCSS(property, value);
        await expect(share).toHaveCSS(property, value);
      }
      await expect(page.locator(".memo-article-body").getByRole("button")).toHaveCount(1);
      const meta = (await hero.locator(".article-meta").boundingBox())!;
      const action = (await share.boundingBox())!;
      if (width <= 800) {
        expect(Math.abs(action.x - meta.x)).toBeLessThan(1);
      } else {
        expect(Math.abs(action.x + action.width - meta.x - meta.width)).toBeLessThan(1);
      }
      expect(action.x).toBeGreaterThanOrEqual(meta.x);
      expect(action.x + action.width).toBeLessThanOrEqual(meta.x + meta.width + 1);
      const titleBox = await page.locator(".memo-article h1").boundingBox();
      expect(titleBox!.x).toBeCloseTo((width - titleBox!.width) / 2, 0);
      for (const selector of [
        ".article-body",
        ".article-lead",
        ".article-disclaimer",
        ".article-notes",
        ".memo-toc",
        ".article-meta",
      ]) {
        for (const region of await page.locator(selector).all()) {
          const box = await region.boundingBox();
          expect(box!.x).toBeCloseTo(titleBox!.x, 0);
          expect(box!.width).toBeCloseTo(titleBox!.width, 0);
        }
      }
      for (const theme of ["light", "dark"]) {
        await page.evaluate((theme) => document.documentElement.setAttribute("data-theme", theme), theme);
        await expect(body).toHaveCSS("font-size", "16px");
        await expect(body).toHaveCSS("line-height", "24px");
        for (const element of await body.locator("h2, h3, p, li, a, strong, blockquote").all()) {
          const style = await element.evaluate((node) => {
            const css = getComputedStyle(node);
            return {
              tag: node.tagName,
              size: parseFloat(css.fontSize),
              leading: parseFloat(css.lineHeight),
              weight: css.fontWeight,
              tracking: css.letterSpacing,
              font: css.fontFamily,
              quote: !!node.closest("blockquote"),
            };
          });
          expect(style.font).toContain("Jost");
          expect(["400", "700"]).toContain(style.weight);
          expect(["0px", "normal"]).toContain(style.tracking);
          const heading = style.tag === "H2" || style.tag === "H3";
          const size = style.tag === "H2" ? (width < 800 ? 28 : 38) : style.tag === "H3" || style.quote ? 21 : 16;
          expect(style.size).toBe(size);
          expect(style.leading).toBeCloseTo(size * (heading || style.quote ? 1.15 : 1.5), 1);
        }
        await expect(body.locator(".memo-references ol")).toHaveCSS("list-style-type", "decimal");
        await expect(body.locator(".memo-references a").first()).toHaveCSS("text-decoration-line", "underline");
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}

test("Typeset memo preserves enlarged text and local scope", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/memos/microsoft-stock-analysis-fiscal-year-2024");
  await page.addStyleTag({ content: "html {font-size:200% !important;}" });
  await expect(page.locator(".article-body")).toHaveCSS("font-size", "32px");
  await expect(page.locator(".article-body")).toHaveCSS("line-height", "48px");
  await expect(page.locator(".typeset")).toHaveCount(1);
  await expect(
    page.locator(".memo-article-header .typeset, .article-lead.typeset, .article-disclaimer.typeset"),
  ).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
