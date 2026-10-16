import { expect, test } from "@playwright/test";

for (const { path, included, excluded } of [
  { path: "/", included: null, excluded: ["Noto Sans TC", "Noto Sans SC"] },
  { path: "/zh-tw", included: "Noto Sans TC", excluded: ["Noto Sans SC"] },
  { path: "/zh-cn", included: "Noto Sans SC", excluded: ["Noto Sans TC"] },
]) {
  for (const missing of [false, true]) {
    test(
      `${path} ${missing ? "404 preserves its localized font fallback" : "page loads only its required font stylesheets"}`,
      { tag: "@mobile" },
      async ({ page }) => {
        const response = await page.goto(missing ? `${path === "/" ? "" : path}/missing-font-scope` : path);
        expect(response?.status()).toBe(missing ? 404 : 200);
        await page.evaluate(() => document.fonts.ready);
        const urls = await page
          .locator('link[rel="stylesheet"]')
          .evaluateAll((links) => links.map((link) => (link as HTMLLinkElement).href));
        const css = (
          await Promise.all(
            urls.map(async (url) => {
              const response = await page.request.get(url);
              expect(response.ok()).toBe(true);
              return response.text();
            }),
          )
        ).join("\n");
        expect(css.includes("Jost")).toBe(true);
        if (included) expect(css.includes(included), `${path} includes ${included}`).toBe(true);
        if (!missing) {
          for (const family of excluded) expect(css.includes(family), `${path} excludes ${family}`).toBe(false);
        }
        const family = await page.locator("body").evaluate((el) => getComputedStyle(el).fontFamily);
        expect(family).toMatch(/Jost/i);
        if (included) expect(family).toContain(included);
        for (const other of excluded) expect(family).not.toContain(other);
      },
    );
  }
}
