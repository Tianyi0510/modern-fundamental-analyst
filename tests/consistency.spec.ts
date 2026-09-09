import { expect, test } from "@playwright/test";

test("localized page titles and sharing metadata describe the same page", async ({ page }) => {
  for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
    await page.goto(`${prefix}/about`);
    const title = await page.title();
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", title);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", description!);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute("content", description!);
  }
});

test("reduced motion keeps memo summary text stationary during keyboard focus", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/memos");
  const summary = page.locator(".memo-disclosure > summary");
  await summary.focus();
  await expect(summary.locator("span").first()).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
});

test.describe("touch and keyboard state consistency", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 800 } });
  test("memo focus feedback survives a simultaneous hover state", async ({ page }) => {
    await page.goto("/memos");
    const summary = page.locator(".memo-disclosure > summary");
    await summary.focus();
    await expect(summary.locator("span").first()).toHaveCSS("transform", "matrix(1, 0, 0, 1, 8, 0)");
    const background = await summary.evaluate(element => getComputedStyle(element).backgroundColor);
    await summary.hover();
    await expect(summary).toHaveCSS("background-color", background);
  });
});

test("localized navigation and memo links retain their language and honeypots stay hidden", async ({ page }) => {
  for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
    await page.goto(`${prefix}/contact`);
    const traps = page.locator('input[name="website"]');
    await expect(traps).toHaveCount(2);
    for (const trap of await traps.all()) {
      await expect(trap).toHaveAttribute("tabindex", "-1");
      await expect(trap.locator("..")).toHaveAttribute("aria-hidden", "true");
      const bounds = await trap.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x + bounds!.width).toBeLessThan(0);
    }
    await expect(page.locator('.footer-mark')).toHaveAttribute("href", prefix || "/");
    await page.goto(`${prefix}/memos`);
    const cards = page.locator('a.memo-card');
    expect(await cards.count()).toBeGreaterThan(0);
    for (const card of await cards.all()) {
      expect(await card.getAttribute("href")).toMatch(new RegExp(`^${prefix}/memos/[^/]+$`));
    }
  }
});
