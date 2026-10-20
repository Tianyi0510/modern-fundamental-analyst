import { expect, test } from "@playwright/test";

test("memo disclosure animates both directions and respects reduced motion", { tag: "@mobile" }, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(`${prefix}/memos`);
    const disclosure = page.locator(".memo-disclosure");
    const summary = disclosure.locator("[data-slot=collapsible-trigger]");
    const panel = disclosure.locator("[data-slot=collapsible-content]");
    await summary.click();
    await expect(summary).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toBeVisible();
    await expect(panel).toHaveCSS("transition-property", "height");
    await summary.click();
    await summary.click();
    await expect(summary).toHaveAttribute("aria-expanded", "true");
    await summary.click();
    await expect(panel).toBeHidden();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(disclosure).toHaveAttribute("data-open", "");
    expect(await panel.evaluate((e) => e.getAnimations().length)).toBe(0);
    await page.keyboard.press("Space");
    await expect(disclosure).not.toHaveAttribute("data-open", "");
  }
});

test.describe("mobile content and navigation QA", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1",
  });

  test(
    "memo count and disclosure arrow stay together and remain touch operable",
    { tag: "@mobile" },
    async ({ page }) => {
      await page.goto("/memos");
      const countBox = await page.locator(".memo-count").boundingBox();
      const arrowBox = await page.locator(".memo-summary-meta svg").boundingBox();
      expect(countBox).not.toBeNull();
      expect(arrowBox).not.toBeNull();
      expect(countBox!.x + countBox!.width).toBeLessThan(arrowBox!.x);
      expect(Math.abs(countBox!.y + countBox!.height / 2 - (arrowBox!.y + arrowBox!.height / 2))).toBeLessThan(2);

      const disclosure = page.locator(".memo-disclosure");
      await disclosure.locator("[data-slot=collapsible-trigger]").tap();
      await expect(disclosure).toHaveAttribute("data-open", "");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    },
  );
});
