import { expect, test } from "@playwright/test";

test("memo disclosure animates both directions and respects reduced motion", { tag: "@mobile" }, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(`${prefix}/memos`);
    const disclosure = page.locator(".memo-disclosure");
    const summary = disclosure.locator("summary");
    const closed = await disclosure.evaluate((e) => e.getBoundingClientRect().height);
    const midpoint = await summary.evaluate((element: HTMLElement) => {
      element.click();
      const details = element.closest("details")!;
      const animation = details.getAnimations()[0];
      if (!animation) throw new Error("Expected disclosure height animation");
      animation.pause();
      animation.currentTime = Number(animation.effect!.getTiming().duration) / 2;
      return { height: details.getBoundingClientRect().height, full: details.scrollHeight };
    });
    expect(midpoint.height).toBeGreaterThan(closed);
    expect(midpoint.height).toBeLessThan(midpoint.full);
    // Reverse an unfinished opening without waiting for the element to settle.
    await summary.evaluate((e: HTMLElement) => e.click());
    await expect(disclosure).toHaveAttribute("data-closing", "");
    await expect(disclosure).not.toHaveAttribute("open", "");
    expect(await disclosure.evaluate((e) => e.getBoundingClientRect().height)).toBeCloseTo(closed, 0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(disclosure).toHaveAttribute("open", "");
    expect(await disclosure.evaluate((e) => e.getAnimations().length)).toBe(0);
    await page.keyboard.press("Space");
    await expect(disclosure).not.toHaveAttribute("open", "");
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
      await disclosure.locator("summary").tap();
      await expect(disclosure).toHaveAttribute("open", "");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    },
  );
});
