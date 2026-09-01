import { expect, test } from "@playwright/test";

test.describe("header interaction QA", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test("desktop navigation uses stable color, motion, and menu states", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".site-header").first()).toHaveCSS("height", "84px");
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
    await expect(languageTrigger.locator("svg")).toHaveAttribute("stroke-width", "2.75");
    await languageTrigger.click();
    await expect(languageTrigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".language-dropdown")).toHaveClass(/is-open/);
    await page.keyboard.press("Escape");
    await expect(languageTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(languageTrigger).toBeFocused();
  });

  test("desktop footer and legal sections use balanced vertical spacing", async ({ page }) => {
    await page.goto("/disclaimer");
    const footer = page.locator(".site-footer");
    await expect(footer).toHaveCSS("padding-top", "74px");
    await expect(footer).toHaveCSS("padding-bottom", "74px");
    const legalBody = page.locator(".legal-body");
    await expect(legalBody).toHaveCSS("padding-top", "96px");
    await expect(legalBody).toHaveCSS("padding-bottom", "96px");
  });

  test("desktop page heroes share one vertical rhythm", async ({ page }) => {
    for (const path of ["/", "/about", "/portfolio", "/performance", "/memos", "/contact", "/support", "/disclaimer", "/subscription-preferences"]) {
      await page.goto(path);
      const hero = page.locator(".hero, .page-hero, .legal-hero").first();
      await expect(hero, `${path} hero`).toHaveCSS("padding-top", "96px");
      await expect(hero, `${path} hero`).toHaveCSS("padding-bottom", "96px");
    }
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

  test("site header stays in document flow while the menu brand remains pinned", async ({ page }) => {
    await page.goto("/");
    const header = page.locator(".site-header").first();
    await expect(header).toHaveCSS("position", "relative");
    await expect(header).toHaveCSS("height", "70px");
    expect(await page.locator("body").evaluate((element) => getComputedStyle(element).paddingTop)).toBe("0px");
    const topBeforeScroll = await header.boundingBox();
    await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
    const topAfterScroll = await header.boundingBox();
    expect(topBeforeScroll).not.toBeNull();
    expect(topAfterScroll).not.toBeNull();
    expect(topBeforeScroll!.y).toBe(0);
    expect(topAfterScroll!.y).toBeLessThan(-100);
    expect(topBeforeScroll!.x).toBe(0);
    expect(topBeforeScroll!.width).toBe(390);
    expect(topAfterScroll!.width).toBe(390);
  });

  test("home metrics form a compact full-width mobile data band", async ({ page }) => {
    await page.goto("/");
    const metrics = page.locator(".home-page .metric");
    await expect(metrics).toHaveCount(3);
    const boxes = await metrics.evaluateAll((elements) => elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { width: box.width, height: box.height, left: box.left };
    }));
    for (const box of boxes) {
      expect(box.left).toBe(0);
      expect(box.width).toBe(390);
      expect(box.height).toBeLessThanOrEqual(190);
    }
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
    await expect(page.locator(".mobile-menu-drawer nav svg")).toHaveCount(0);
    await expect(page.locator(".mobile-language-links a")).toHaveCount(3);
    await expect(page.locator(".mobile-language-links a").first()).toHaveCSS("color", "rgb(0, 140, 255)");
    await expect(page.locator(".mobile-language-links a").nth(1)).toHaveCSS("color", "rgb(0, 0, 0)");
    await expect(page.locator(".mobile-language-links a").nth(2)).toHaveCSS("color", "rgb(0, 0, 0)");
    await expect(page.locator(".mobile-language-links svg")).toHaveCount(0);
    await expect(page.locator(".mobile-language-links a").first()).toHaveCSS("border-top-width", "1px");
    const drawer = page.locator(".mobile-menu-drawer");
    await expect(drawer).toHaveCSS("transform", "none");
    await expect(drawer).toHaveCSS("opacity", "1");
    await expect(drawer).toHaveCSS("clip-path", "none");
    const drawerBox = await drawer.boundingBox();
    expect(drawerBox).not.toBeNull();
    expect(drawerBox!.x).toBe(0);
    expect(drawerBox!.width).toBe(390);
    await expect(page.locator('.mobile-menu-drawer nav a[aria-current="page"]')).toHaveCSS("background-color", "color(srgb 0.736471 0.917647 0.996706)");
    await expect(page.locator('.mobile-menu-drawer nav a[aria-current="page"]')).toHaveCSS("color", "rgb(0, 140, 255)");
    await expect(page.locator(".mobile-menu-drawer nav a").first()).toHaveCSS("padding-left", "14px");
    await expect(page.locator(".mobile-menu-language").first()).toHaveCSS("padding-left", "14px");
    const menuTop = page.locator(".mobile-menu-top");
    const topBeforeScroll = await menuTop.boundingBox();
    expect(topBeforeScroll).not.toBeNull();
    expect(topBeforeScroll!.x).toBe(0);
    expect(topBeforeScroll!.y).toBe(0);
    expect(topBeforeScroll!.width).toBe(390);
    await expect(menuTop).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(drawer).toHaveCSS("background-color", "rgb(255, 255, 255)");
    expect(await drawer.evaluate((element) => getComputedStyle(element, "::before").backgroundColor)).toBe("rgb(248, 249, 251)");
    await expect.poll(() => drawer.evaluate((element) => getComputedStyle(element, "::before").transform)).toBe("matrix(1, 0, 0, 1, 0, 0)");
    await expect(drawer).toHaveCSS("padding-top", "0px");
    await expect(page.locator(".mobile-menu-wordmark")).toHaveCSS("transition-duration", "0s");
    await page.setViewportSize({ width: 390, height: 620 });
    await drawer.evaluate((element) => element.scrollTo({ top: 160, behavior: "instant" }));
    const topAfterScroll = await menuTop.boundingBox();
    expect(topAfterScroll).not.toBeNull();
    expect(topAfterScroll!.y).toBe(topBeforeScroll!.y);
    await page.locator(".mobile-menu-close").tap();
    await expect(page.locator(".mobile-menu-layer")).not.toHaveClass(/is-open/);
    await expect(page.locator(".mobile-menu-button")).toBeFocused();
  });

  test("mobile footer and legal sections use balanced vertical spacing", async ({ page }) => {
    await page.goto("/disclaimer");
    const footer = page.locator(".site-footer");
    const upperBlockEnd = await footer.locator(":scope > :nth-child(3)").boundingBox();
    const lowerBlock = await footer.locator(".footer-bottom").boundingBox();
    expect(upperBlockEnd).not.toBeNull();
    expect(lowerBlock).not.toBeNull();
    expect(lowerBlock!.y - (upperBlockEnd!.y + upperBlockEnd!.height)).toBe(48);
    await expect(footer).toHaveCSS("padding-top", "48px");
    await expect(footer).toHaveCSS("padding-bottom", "48px");
    const legalBody = page.locator(".legal-body");
    await expect(legalBody).toHaveCSS("padding-top", "72px");
    await expect(legalBody).toHaveCSS("padding-bottom", "72px");
  });

  test("mobile page heroes share one vertical rhythm", async ({ page }) => {
    for (const path of ["/", "/about", "/portfolio", "/performance", "/memos", "/contact", "/support", "/disclaimer", "/subscription-preferences"]) {
      await page.goto(path);
      const hero = page.locator(".hero, .page-hero, .legal-hero").first();
      await expect(hero, `${path} hero`).toHaveCSS("padding-top", "72px");
      await expect(hero, `${path} hero`).toHaveCSS("padding-bottom", "72px");
    }
  });

  test("mobile page content converges on shared gutters and stack spacing", async ({ page }) => {
    await page.goto("/about");
    const aboutBoundary = page.locator(".about-boundaries > article").first();
    const aboutBoundaryBox = await aboutBoundary.boundingBox();
    const aboutHeadingBox = await aboutBoundary.locator("h2").boundingBox();
    expect(aboutBoundaryBox).not.toBeNull();
    expect(aboutHeadingBox).not.toBeNull();
    expect(aboutBoundaryBox!.x).toBe(0);
    expect(aboutBoundaryBox!.width).toBe(390);
    expect(aboutHeadingBox!.x).toBe(16);
    await expect(page.locator(".about-section").first()).toHaveCSS("gap", "40px");

    await page.goto("/contact");
    const contactHeadingBox = await page.locator(".contact-grid > article h2").first().boundingBox();
    const firstControlBox = await page.locator('input[name="name"]').boundingBox();
    expect(contactHeadingBox).not.toBeNull();
    expect(firstControlBox).not.toBeNull();
    expect(contactHeadingBox!.x).toBe(16);
    expect(firstControlBox!.x).toBe(16);
    expect(firstControlBox!.width).toBe(358);
  });

  test("mobile menu locks and restores the underlying scroll position", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight)).toBeGreaterThan(1000);
    await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBeGreaterThan(0);
    await page.locator(".mobile-menu-button").evaluate((button) => (button as HTMLButtonElement).click());
    await expect(page.locator("body")).toHaveCSS("position", "fixed");
    await expect(page.locator("body")).toHaveCSS("top", `-${scrollPosition}px`);
    await page.locator(".mobile-menu-close").tap();
    await expect(page.locator("body")).toHaveCSS("position", "static");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollPosition);
  });

  test("mobile menu supports a deliberate right-swipe close gesture", async ({ page }) => {
    await page.goto("/");
    await page.locator(".mobile-menu-button").tap();
    const drawer = page.locator(".mobile-menu-drawer");
    await drawer.dispatchEvent("pointerdown", { pointerType: "touch", pointerId: 1, clientX: 40, clientY: 240 });
    await drawer.dispatchEvent("pointerup", { pointerType: "touch", pointerId: 1, clientX: 150, clientY: 246 });
    await expect(page.locator(".mobile-menu-layer")).not.toHaveClass(/is-open/);
  });
});
