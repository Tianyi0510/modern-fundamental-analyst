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
  test.use({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1",
  });

  test("site header remains fixed while the page scrolls", async ({ page }) => {
    await page.goto("/");
    const header = page.locator(".site-header").first();
    await expect(header).toHaveCSS("position", "fixed");
    const topBeforeScroll = await header.boundingBox();
    await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
    const topAfterScroll = await header.boundingBox();
    expect(topBeforeScroll).not.toBeNull();
    expect(topAfterScroll).not.toBeNull();
    expect(topBeforeScroll!.y).toBe(0);
    expect(topAfterScroll!.y).toBe(0);
    expect(topBeforeScroll!.x).toBe(0);
    expect(topBeforeScroll!.width).toBe(390);
    expect(topAfterScroll!.x).toBe(0);
    expect(topAfterScroll!.width).toBe(390);
  });

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
    await expect(page.locator(".mobile-menu-drawer nav a")).toHaveCount(6);
    await expect(page.locator(".mobile-menu-index")).toHaveCount(0);
    await expect(page.locator(".mobile-menu-label")).toHaveText(["Home", "About", "Portfolio", "Performance", "Investment Memos", "Contact"]);
    await expect(page.locator(".mobile-menu-drawer nav svg")).toHaveCount(6);
    await expect(page.locator(".mobile-language-links a")).toHaveCount(3);
    await expect(page.locator(".mobile-language-links svg")).toHaveCount(0);
    await expect(page.locator(".mobile-language-links a").first()).toHaveCSS("border-top-width", "1px");
    const drawer = page.locator(".mobile-menu-drawer");
    await expect(drawer).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
    const drawerBox = await drawer.boundingBox();
    expect(drawerBox).not.toBeNull();
    expect(drawerBox!.x).toBe(0);
    expect(drawerBox!.width).toBe(390);
    await expect(page.locator('.mobile-menu-drawer nav a[aria-current="page"]')).toHaveCSS("background-color", "rgb(0, 41, 145)");
    await expect(page.locator(".mobile-menu-drawer nav a").first()).toHaveCSS("padding-left", "14px");
    await expect(page.locator(".mobile-menu-language").first()).toHaveCSS("padding-left", "14px");
    const menuTop = page.locator(".mobile-menu-top");
    const topBeforeScroll = await menuTop.boundingBox();
    expect(topBeforeScroll).not.toBeNull();
    expect(topBeforeScroll!.x).toBe(0);
    expect(topBeforeScroll!.y).toBe(0);
    expect(topBeforeScroll!.width).toBe(390);
    await expect(menuTop).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(drawer).toHaveCSS("background-color", "rgb(248, 249, 251)");
    await expect(drawer).toHaveCSS("padding-top", "0px");
    await page.setViewportSize({ width: 390, height: 620 });
    await drawer.evaluate((element) => element.scrollTo({ top: 160, behavior: "instant" }));
    const topAfterScroll = await menuTop.boundingBox();
    expect(topAfterScroll).not.toBeNull();
    expect(topAfterScroll!.y).toBe(topBeforeScroll!.y);
    await page.locator(".mobile-menu-close").tap();
    await expect(page.locator(".mobile-menu-layer")).not.toHaveClass(/is-open/);
    await expect(page.locator(".mobile-menu-button")).toBeFocused();
  });
});
