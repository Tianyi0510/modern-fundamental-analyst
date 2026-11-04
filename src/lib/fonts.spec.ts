import { expect, test, type Page } from "@playwright/test";

async function pageStyles(page: Page) {
  const inline = await page.locator("style").allTextContents();
  const urls = await page
    .locator('link[rel="stylesheet"]')
    .evaluateAll((links) => links.map((link) => (link as HTMLLinkElement).href));
  const external = await Promise.all(
    urls.map(async (url) => {
      const response = await page.request.get(url);
      expect(response.ok()).toBe(true);
      return response.text();
    }),
  );
  return [...inline, ...external].join("\n");
}

async function expectLoadedFont(page: Page, family: string, text: string) {
  for (const weight of [400, 700]) {
    const loaded = await page.evaluate(
      async ({ family, text, weight }) => {
        const faces = await document.fonts.load(`${weight} 16px "${family}"`, text);
        return faces.map((face) => ({ family: face.family.replaceAll('"', ""), status: face.status }));
      },
      { family, text, weight },
    );
    expect(loaded.length, `${family} ${weight} has matching font faces`).toBeGreaterThan(0);
    for (const face of loaded) expect(face).toEqual({ family, status: "loaded" });
  }
}

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
        const css = await pageStyles(page);
        expect(css.includes("Jost")).toBe(true);
        if (included) expect(css.includes(included), `${path} includes ${included}`).toBe(true);
        if (!missing) {
          for (const family of excluded) expect(css.includes(family), `${path} excludes ${family}`).toBe(false);
        }
        const family = await page.locator("body").evaluate((el) => getComputedStyle(el).fontFamily);
        expect(family).toMatch(/Jost/i);
        if (included) expect(family).toContain(included);
        for (const other of excluded) expect(family).not.toContain(other);
        await expectLoadedFont(page, "Jost", "Modern Fundamental Analyst");
        if (included) await expectLoadedFont(page, included, path === "/zh-tw" ? "實踐集中投資" : "实践集中投资");
      },
    );
  }
}

for (const { prefix, family, text } of [
  { prefix: "", family: "Jost", text: "Investment performance" },
  { prefix: "/zh-tw", family: "Noto Sans TC", text: "投資績效" },
  { prefix: "/zh-cn", family: "Noto Sans SC", text: "投资绩效" },
]) {
  test(
    `${prefix || "English"} preserves fonts and styles during client navigation`,
    { tag: "@mobile" },
    async ({ page }) => {
      await page.goto(prefix || "/");
      await page.evaluate(() => {
        document.documentElement.dataset.fontNavigationMarker = "present";
      });
      await page.locator(`a[href="${prefix}/performance"]:visible`).first().click();
      await expect(page).toHaveURL(`${prefix}/performance`);
      await expect(page.locator("html")).toHaveAttribute("data-font-navigation-marker", "present");
      await page.evaluate(() => document.fonts.ready);
      expect(await pageStyles(page)).toContain(family);
      await expectLoadedFont(page, family, text);
      const heading = page.locator("h1");
      await expect(heading).toBeVisible();
      await expect(heading).toHaveCSS("font-weight", "700");
      expect(["normal", "0px"]).toContain(await heading.evaluate((element) => getComputedStyle(element).letterSpacing));
      expect(await heading.evaluate((element) => getComputedStyle(element).fontFamily)).toContain(family);
    },
  );
}

test(
  "Simplified Chinese retains rare Han characters and variation sequences outside the core shards",
  { tag: "@mobile" },
  async ({ page }) => {
    await page.goto("/zh-cn");
    await expectLoadedFont(page, "Noto Sans SC", "龘龍漢郎\uFE00礼\uFE00；\uFE01");
    await page.locator("h1").evaluate((heading) => {
      heading.textContent = "龘龍漢郎\uFE00礼\uFE00；\uFE01";
    });
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.locator("h1").evaluate((element) => getComputedStyle(element).fontFamily)).toContain(
      "Noto Sans SC",
    );
  },
);
