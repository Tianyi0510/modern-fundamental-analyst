import { expect, test } from "@playwright/test";

const origin = "https://www.modernfundamentalanalyst.com";
const languages = { en: "", "zh-Hant-TW": "/zh-tw", "zh-Hans-CN": "/zh-cn", "x-default": "" };

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} public and private search metadata retain their indexing boundary`, async ({ page }) => {
    await page.goto(`${prefix}/about?utm_source=search-regression`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${origin}${prefix}/about`);
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(4);
    for (const [language, target] of Object.entries(languages)) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${language}"]`)).toHaveAttribute(
        "href",
        `${origin}${target}/about`,
      );
    }
    for (const route of ["subscription-preferences", "subscription-confirmation"]) {
      const response = await page.goto(`${prefix}/${route}?token=synthetic-search-test`);
      expect(response?.ok()).toBe(true);
      const initialRobots = await page.evaluate(
        (html) =>
          new DOMParser()
            .parseFromString(html, "text/html")
            .querySelector('meta[name="robots"]')
            ?.getAttribute("content"),
        await response!.text(),
      );
      expect(initialRobots).toContain("noindex");
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /nofollow/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${origin}${prefix}/${route}`);
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    }
  });
}

test("robots and the served XML sitemap agree on crawlable public URLs", async ({ page, request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  const rules = await robots.text();
  expect(rules).toContain("Allow: /");
  expect(rules).not.toContain("Disallow:");
  expect(rules).toContain(`Sitemap: ${origin}/sitemap.xml`);
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);
  await page.goto("/");
  const entries = await page.evaluate(
    (xml) => {
      const document = new DOMParser().parseFromString(xml, "application/xml");
      if (document.querySelector("parsererror")) throw new Error("Invalid sitemap XML");
      return Array.from(document.getElementsByTagName("url")).map((entry) => ({
        url: entry.getElementsByTagName("loc")[0]?.textContent,
        alternates: Array.from(entry.getElementsByTagNameNS("http://www.w3.org/1999/xhtml", "link")).map((link) => ({
          language: link.getAttribute("hreflang"),
          url: link.getAttribute("href"),
        })),
      }));
    },
    await response.text(),
  );
  expect(entries.length).toBeGreaterThan(0);
  expect(new Set(entries.map((entry) => entry.url)).size).toBe(entries.length);
  for (const entry of entries) {
    expect(entry.url).toMatch(/^https:\/\/www\.modernfundamentalanalyst\.com\//);
    expect(entry.url).not.toMatch(/subscription-preferences|subscription-confirmation|\/api\/|\?/);
    expect(entry.alternates).toHaveLength(4);
    for (const alternate of entry.alternates) {
      expect(entries.some((target) => target.url === alternate.url)).toBe(true);
      expect(entries.find((target) => target.url === alternate.url)?.alternates).toEqual(entry.alternates);
    }
  }
});
