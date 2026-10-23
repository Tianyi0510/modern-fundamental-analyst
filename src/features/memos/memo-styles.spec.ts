import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(
    `${prefix || "English"} loads Typeset only for articles and preserves navigation styles`,
    { tag: "@mobile" },
    async ({ page, context }) => {
      const slug = "microsoft-stock-analysis-fiscal-year-2024";
      const article = `${prefix}/memos/${slug}`;
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      for (const route of ["", "/portfolio", "/performance"]) {
        await page.goto(`${prefix}${route}` || "/");
        const stylesheets = await page
          .locator('link[rel="stylesheet"]')
          .evaluateAll((links) => links.map((link) => (link as HTMLLinkElement).href));
        const css = (
          await Promise.all(
            stylesheets.map(async (url) => {
              const response = await page.request.get(url);
              expect(response.ok()).toBe(true);
              return response.text();
            }),
          )
        ).join("\n");
        expect(css, `${prefix}${route} must not load article-only styles`).not.toMatch(/\.typeset\s*\{/);
      }

      const direct = await context.newPage();
      await direct.goto(article);
      const sample = async (target: typeof page) => {
        await target.evaluate(() => document.fonts.ready);
        return target.locator(".article-body h2, .article-body h3, .article-body p").evaluateAll((elements) =>
          elements.map((element) => {
            const style = getComputedStyle(element);
            return [style.fontSize, style.lineHeight, style.fontWeight, style.marginTop, style.color];
          }),
        );
      };
      const expected = await sample(direct);
      expect(expected.length).toBeGreaterThan(0);
      await direct.close();
      await page.goto(`${prefix}/memos`);
      await page.locator(`a[href="${article}"]`).first().click();
      await expect(page).toHaveURL(new RegExp(`${slug}$`));
      await expect(page.locator(".article-body")).toHaveCSS("font-size", "16px");
      expect(await sample(page)).toEqual(expected);
      await page.goBack();
      await expect(page).toHaveURL(new RegExp(`${prefix}/memos$`));
      await page.goForward();
      await expect(page.locator(".article-body")).toBeVisible();
      expect(await sample(page)).toEqual(expected);
      expect(errors).toEqual([]);
    },
  );
}
