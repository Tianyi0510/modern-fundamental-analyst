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
    await expect(about).toHaveCSS("transform", "matrix(1.04, 0, 0, 1.04, 0, 0)");
    await about.evaluate((element) => element.addEventListener("click", (event) => event.preventDefault(), { once: true }));
    await page.mouse.down();
    try {
      await expect(about).toHaveCSS("transform", "matrix(1.04, 0, 0, 1.04, 0, 0)");
    } finally {
      await page.mouse.up();
    }
    expect(await about.evaluate((element) => getComputedStyle(element, "::after").content)).toBe("none");

    const languageTrigger = page.locator(".language-trigger");
    await expect(languageTrigger.locator("svg")).toHaveAttribute("stroke-width", "2.75");
    await languageTrigger.click();
    await expect(languageTrigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".language-dropdown")).toHaveClass(/is-open/);
    await expect(page.locator(".language-dropdown")).toHaveCSS("width", "160px");
    for (const item of await page.locator(".language-dropdown a").all()) {
      expect(await item.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(languageTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(languageTrigger).toBeFocused();
  });

  test("desktop footer and legal sections use balanced vertical spacing", async ({ page }) => {
    await page.goto("/disclaimer");
    const footer = page.locator(".site-footer");
    await expect(footer.locator(".footer-main")).toHaveCSS("padding-top", "72px");
    await expect(footer.locator(".footer-main")).toHaveCSS("padding-bottom", "72px");
    await expect(footer.locator(".footer-bottom")).toHaveCSS("padding-top", "24px");
    await expect(footer.locator(".footer-bottom")).toHaveCSS("padding-bottom", "24px");
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

  test("CTA focus uses shared scale without lift or shadow", async ({ page }) => {
    for (const [path, selector] of [
      ["/", ".hero .button"],
      ["/", ".round-link"],
      ["/support", ".support-submit"],
      ["/subscription-preferences", "main form .button"],
      ["/contact", "form .button"],
    ] as const) {
      await page.goto(path);
      await page.keyboard.press("Tab");
      const control = page.locator(selector).first();
      await control.focus();
      await expect(control).toHaveCSS("transform", "matrix(1.04, 0, 0, 1.04, 0, 0)");
      await expect(control).toHaveCSS("box-shadow", "none");
    }
  });

  test("text CTAs keep text stationary and move only their arrows", async ({ page }) => {
    for (const width of [1440, 801, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/");
      const links = page.locator(".home-page .text-link, .allocation-card > a");
      await expect(links).toHaveCount(4);
      for (const link of await links.all()) {
        await link.hover();
        await expect(link).toHaveCSS("transform", "none");
        await expect(link.locator(".arrow-icon")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 4, 0)");
        // Establish keyboard modality without tabbing to a distant link and
        // starting a smooth scroll underneath the subsequent pointer press.
        await page.keyboard.press("Shift");
        await link.focus();
        await expect(link).toHaveCSS("transform", "none");
        await expect(link.locator(".arrow-icon")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 4, 0)");
        await link.hover();
        // Release on the same link without navigating. Moving a held link away
        // starts native drag-and-drop in WebKit and can strand :active state.
        await link.evaluate((element) => element.addEventListener("click", (event) => event.preventDefault(), { once: true }));
        await page.mouse.down();
        try {
          await expect(link).toHaveCSS("transform", "none");
          await expect(link.locator(".arrow-icon")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 5, 0)");
        } finally {
          await page.mouse.up();
        }
      }
    }
  });

  test("reference notes share typography and memo conclusion spacing is balanced", async ({ page }) => {
    for (const width of [1440, 801, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const path of ["/about", "/performance", "/memos/microsoft-stock-analysis-fiscal-year-2024"]) {
        await page.goto(path);
        const note = page.locator(".reference-note");
        await expect(note).toHaveCount(1);
        await expect(note).toHaveCSS("font-size", "18px");
        await expect(note).toHaveCSS("line-height", "27px");
        await expect(note).toHaveCSS("font-weight", "400");
        await expect(note).toHaveCSS("color", "rgb(0, 0, 0)");
        if (path !== "/about") {
          await expect(note.locator(":scope > span")).toHaveCSS("font-weight", "700");
          await expect(note.locator(":scope > span")).toHaveCSS("color", "rgb(0, 0, 0)");
        }
        for (const link of await note.locator("a").all()) {
          await expect(link).toHaveCSS("font-weight", "400");
          await expect(link).toHaveCSS("color", "rgb(0, 140, 255)");
          await expect(link).toHaveCSS("text-decoration-line", "underline");
          await expect(link).toHaveCSS("text-underline-offset", "3px");
          await link.hover();
          await expect(link).toHaveCSS("color", "rgb(0, 140, 255)");
          await page.keyboard.press("Shift");
          await link.focus();
          await expect(link).toHaveCSS("color", "rgb(0, 140, 255)");
        }
        if (path.startsWith("/memos/")) {
          const gaps = await page.locator(".memo-section").last().evaluate((section) => {
            const conclusion = section.querySelector(".memo-subsection:last-child")!;
            const previousParagraph = conclusion.previousElementSibling!.lastElementChild!;
            const heading = conclusion.querySelector("h3")!;
            const finalParagraph = conclusion.lastElementChild!;
            const references = section.nextElementSibling!;
            const style = getComputedStyle(references);
            return {
              above: heading.getBoundingClientRect().top - previousParagraph.getBoundingClientRect().bottom,
              below: references.getBoundingClientRect().top - finalParagraph.getBoundingClientRect().bottom,
              innerTop: style.paddingTop,
              innerBottom: style.paddingBottom,
            };
          });
          expect(gaps.above).toBeCloseTo(width <= 800 ? 40 : 56, 1);
          expect(gaps.below).toBeCloseTo(gaps.above, 1);
          expect(gaps.innerTop).toBe(gaps.innerBottom);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    }
  });

  test("footer status and input text retain their semantic weight", async ({ page }) => {
    for (const width of [1440, 801, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/subscription-preferences");
      const status = page.locator(".site-footer [role=status]");
      await expect(status).toHaveCSS("font-size", "15px");
      await expect(status).toHaveCSS("font-weight", "700");
      await expect(status).toBeVisible();
      await expect(page.locator("main input[name=email]").first()).toHaveCSS("font-weight", "400");
      await expect(page.locator(".site-footer input[name=email]")).toHaveCSS("font-weight", "400");
      await page.goto("/disclaimer");
      await expect(page.locator(".site-footer [role=status]")).toHaveCSS("font-size", "15px");
      await expect(page.locator(".site-footer [role=status]")).toHaveCSS("font-weight", "700");
      const inset = await page.locator(".legal-body").evaluate((body) => {
        const first = body.querySelector(".legal-section-heading")!;
        return first.getBoundingClientRect().top - body.getBoundingClientRect().top;
      });
      expect(inset).toBe(width <= 800 ? 72 : 96);
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
    await expect(header.locator(":scope > .wordmark")).toHaveCSS("white-space", "nowrap");
    const wordmarkBox = await header.locator(":scope > .wordmark").boundingBox();
    expect(wordmarkBox).not.toBeNull();
    expect(wordmarkBox!.height).toBeLessThanOrEqual(25);
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
    await expect.poll(() => page.locator(".mobile-menu-close").evaluate((element) => getComputedStyle(element).transform)).toBe("none");
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
    await expect(page.locator(".mobile-menu-wordmark")).toHaveCSS("white-space", "nowrap");
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
    const upperBlock = footer.locator(".footer-main");
    const upperBlockEnd = await upperBlock.boundingBox();
    const lowerBlock = await footer.locator(".footer-bottom").boundingBox();
    expect(upperBlockEnd).not.toBeNull();
    expect(lowerBlock).not.toBeNull();
    expect(lowerBlock!.y - (upperBlockEnd!.y + upperBlockEnd!.height)).toBe(0);
    await expect(footer).toHaveCSS("padding-top", "0px");
    await expect(footer).toHaveCSS("padding-bottom", "0px");
    await expect(upperBlock).toHaveCSS("padding-top", "48px");
    await expect(upperBlock).toHaveCSS("padding-bottom", "48px");
    await expect(footer.getByRole("status")).toBeVisible();
    await expect(footer.locator(".footer-bottom")).toHaveCSS("padding-top", "24px");
    await expect(footer.locator(".footer-bottom")).toHaveCSS("padding-bottom", "24px");
    await expect(upperBlock).toHaveCSS("row-gap", "32px");
    await expect(footer.locator(".footer-links")).toHaveCSS("grid-template-columns", "358px");
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

  test("navigation switches without overlap or a stranded scroll lock", async ({ page }) => {
    await page.goto("/");
    await page.locator(".mobile-menu-button").tap();
    await expect(page.locator(".mobile-menu-layer")).toHaveClass(/is-open/);
    await page.setViewportSize({ width: 801, height: 1000 });
    await expect(page.locator(".mobile-menu-close")).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await expect(page.locator(".mobile-menu-layer")).not.toHaveClass(/is-open/);
    await expect(page.locator("body")).toHaveCSS("position", "static");
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
    for (const width of [801, 1100, 1150, 1151, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const logo = await page.locator(".site-header > .wordmark").boundingBox();
      const adjacent = await page.locator(width <= 1150 ? ".mobile-menu-button" : ".header-actions").boundingBox();
      expect(logo!.x + logo!.width).toBeLessThan(adjacent!.x);
    }
  });

  test("Escape dismisses immediately and rapid taps do not queue animations", async ({ page }) => {
    await page.goto("/");
    await page.locator(".mobile-menu-button").evaluate((button) => {
      (button as HTMLButtonElement).click();
      (button as HTMLButtonElement).click();
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    await page.waitForTimeout(350);
    await expect(page.locator(".mobile-menu-layer")).not.toHaveClass(/is-open/);
    await expect(page.locator("body")).toHaveCSS("position", "static");
    for (let count = 0; count < 3; count++) {
      await page.locator(".mobile-menu-button").tap();
      await expect(page.locator(".mobile-menu-layer")).toHaveClass(/is-open/);
      await page.locator(".mobile-menu-close").tap();
      await expect(page.locator(".mobile-menu-layer")).not.toHaveClass(/is-open/);
    }
  });

  test("touch buttons share press scale and footer links stay legible", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.locator(".mobile-menu-button");
    await menuButton.hover();
    await page.mouse.down();
    try {
      await expect.poll(() => menuButton.evaluate((element) => {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
        return Math.round(Math.hypot(matrix.a, matrix.b) * 100);
      })).toBe(104);
    } finally {
      await page.mouse.up();
    }
    await page.keyboard.press("Escape");
    const button = page.locator(".hero .button");
    await button.scrollIntoViewIfNeeded();
    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(button).toHaveCSS("transform", "matrix(0.98, 0, 0, 0.98, 0, 0)");
    await page.mouse.move(1, 1);
    await page.mouse.up();
    const textCta = page.locator(".hero .text-link");
    await textCta.hover();
    await page.mouse.down();
    try {
      await expect(textCta).toHaveCSS("transform", "none");
      await expect(textCta.locator(".arrow-icon")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 5, 0)");
    } finally {
      await page.mouse.move(1, 1);
      await page.mouse.up();
    }
    await page.keyboard.press("Tab");
    await textCta.focus();
    await expect(textCta).toHaveCSS("transform", "none");
    await expect(textCta.locator(".arrow-icon")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 4, 0)");
    const contact = page.locator(".footer-links a").first();
    await contact.hover();
    await expect(contact).toHaveCSS("color", "rgb(255, 255, 255)");
  });
});
