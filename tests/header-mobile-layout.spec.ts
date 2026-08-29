import { expect, test } from "@playwright/test";

test.describe("header interaction QA", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test("desktop navigation uses stable color, motion, and menu states", async ({ page }) => {
    await page.goto("/");
    const about = page.locator(".header-actions nav a").filter({ hasText: "About" });
    await about.hover();
    const hoverState = await about.evaluate((element) => {
      const style = getComputedStyle(element);
      return { backgroundColor: style.backgroundColor, transform: style.transform };
    });
    expect(hoverState.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(hoverState.transform).not.toBe("none");
    expect(await about.evaluate((element) => getComputedStyle(element, "::after").content)).toBe("none");

    const languageTrigger = page.locator(".language-trigger");
    await languageTrigger.click();
    await expect(languageTrigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".language-dropdown")).toHaveClass(/is-open/);
    await page.keyboard.press("Escape");
    await expect(languageTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(languageTrigger).toBeFocused();
  });
});

test.describe("mobile content and navigation QA", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("performance methodology has compact hierarchy and a top-rule source card", async ({ page }) => {
    await page.goto("/performance");
    const headingBox = await page.locator(".methodology h2").boundingBox();
    const contentBox = await page.locator(".methodology-content").boundingBox();
    expect(headingBox).not.toBeNull();
    expect(contentBox).not.toBeNull();
    expect(contentBox!.y - (headingBox!.y + headingBox!.height)).toBeLessThanOrEqual(40);

    const sourceStyle = await page.locator(".methodology-source").evaluate((element) => {
      const style = getComputedStyle(element);
      return { borderTopWidth: style.borderTopWidth, borderLeftWidth: style.borderLeftWidth, marginTop: style.marginTop };
    });
    expect(sourceStyle).toEqual({ borderTopWidth: "4px", borderLeftWidth: "0px", marginTop: "0px" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("memo count and disclosure arrow stay together and remain touch operable", async ({ page }) => {
    await page.goto("/memos");
    const countBox = await page.locator(".memo-count").boundingBox();
    const arrowBox = await page.locator(".memo-summary-meta svg").boundingBox();
    expect(countBox).not.toBeNull();
    expect(arrowBox).not.toBeNull();
    expect(countBox!.x + countBox!.width).toBeLessThan(arrowBox!.x);
    expect(Math.abs((countBox!.y + countBox!.height / 2) - (arrowBox!.y + arrowBox!.height / 2))).toBeLessThan(2);

    const disclosure = page.locator(".memo-disclosure");
    await disclosure.locator("summary").tap();
    await expect(disclosure).toHaveAttribute("open", "");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("mobile menu opens, traps focus, and closes from its visible control", async ({ page }) => {
    await page.goto("/");
    await page.locator(".mobile-menu-button").tap();
    await expect(page.locator(".mobile-menu-layer")).toHaveClass(/is-open/);
    await expect(page.locator(".mobile-menu-close")).toBeFocused();
    await page.locator(".mobile-menu-close").tap();
    await expect(page.locator(".mobile-menu-layer")).not.toHaveClass(/is-open/);
    await expect(page.locator(".mobile-menu-button")).toBeFocused();
  });
});
