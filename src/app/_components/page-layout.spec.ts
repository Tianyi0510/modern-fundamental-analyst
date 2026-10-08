import { expect, test } from "@playwright/test";

test("home contact and portfolio totals keep consistent spacing in all languages", async ({ page }) => {
  for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(prefix || "/");
    for (const size of [16, 32]) {
      await page.evaluate((size) => {
        document.documentElement.style.fontSize = `${size}px`;
      }, size);
      const spacing = await page.locator(".cta").evaluate((e) => {
        const label = e.querySelector(".eyebrow")!.getBoundingClientRect();
        const heading = e.querySelector("h2")!.getBoundingClientRect();
        const button = e.querySelector(".button")!.getBoundingClientRect();
        return {
          before: heading.top - label.bottom,
          after: button.top - heading.bottom,
          gap: parseFloat(getComputedStyle(e).rowGap),
        };
      });
      expect(spacing.before).toBeCloseTo(spacing.gap, 0);
      expect(spacing.after).toBeCloseTo(spacing.gap, 0);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${prefix}/portfolio`);
    const heights = await page.locator(".portfolio-table-detailed").evaluate((e) => ({
      row: e.querySelector(".portfolio-row:not(.portfolio-total-row)")!.getBoundingClientRect().height,
      total: e.querySelector(".portfolio-total-row")!.getBoundingClientRect().height,
    }));
    expect(heights.total).toBe(heights.row);
  }
});

test.describe("header interaction QA", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

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
    for (const path of [
      "/",
      "/about",
      "/portfolio",
      "/performance",
      "/memos",
      "/contact",
      "/support",
      "/disclaimer",
      "/subscription-preferences",
    ]) {
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
      await page.keyboard.press("Shift");
      const control = page.locator(selector).first();
      await control.focus();
      await expect(control).toHaveCSS("transform", "matrix(1.04, 0, 0, 1.04, 0, 0)");
      await expect(control).toHaveCSS("box-shadow", "none");
      await control.hover();
      // Release on the control without following links or submitting forms.
      await control.evaluate((element) =>
        element.addEventListener("click", (event) => event.preventDefault(), { once: true }),
      );
      await page.mouse.down();
      try {
        await expect
          .poll(() => control.evaluate((element) => element.matches(":active")), {
            message: `${path} ${selector} receives the pointer press`,
          })
          .toBe(true);
        await expect(control, `${path} ${selector} uses the press duration`).toHaveCSS(
          "transition-duration",
          /^(?:0\.09s)(?:,\s*0\.09s)*$/,
        );
      } finally {
        await page.mouse.up();
      }
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
        await link.evaluate((element) =>
          element.addEventListener("click", (event) => event.preventDefault(), { once: true }),
        );
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
      for (const path of ["/about", "/memos/microsoft-stock-analysis-fiscal-year-2024"]) {
        await page.goto(path);
        const note = page.locator(".reference-note");
        if (path === "/about") {
          await expect(note).toHaveCount(1);
          await expect(note).toHaveCSS("font-size", "18px");
          await expect(note).toHaveCSS("line-height", "27px");
          await expect(note).toHaveCSS("font-weight", "400");
          await expect(note).toHaveCSS("color", "rgb(0, 0, 0)");
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
        }
        if (path.startsWith("/memos/")) {
          await expect(page.locator('.article-body a[href*="docs.google.com/document"]')).toHaveCount(0);
          await expect(page.locator(".memo-references li")).toHaveCount(5);
          await page.evaluate(() => document.fonts.ready);
          const gaps = await page
            .locator(".memo-section")
            .last()
            .evaluate((section) => {
              const conclusion = section.querySelector(".memo-subsection:last-child")!;
              const previousParagraph = conclusion.previousElementSibling!.lastElementChild!;
              const heading = conclusion.querySelector("h3")!;
              const finalParagraph = conclusion.lastElementChild!;
              const references = section.nextElementSibling!;
              window.scrollTo({ top: heading.getBoundingClientRect().top + scrollY - 250, behavior: "instant" });
              const style = getComputedStyle(references);
              return {
                above: heading.getBoundingClientRect().top - previousParagraph.getBoundingClientRect().bottom,
                below: references.getBoundingClientRect().top - finalParagraph.getBoundingClientRect().bottom,
                innerTop: style.paddingTop,
                innerBottom: style.paddingBottom,
                rects: [previousParagraph, heading, finalParagraph, references].map((node) => {
                  const { top, bottom, left, right } = node.getBoundingClientRect();
                  return { top, bottom, left, right };
                }),
              };
            });
          expect(gaps.above).toBeCloseTo(width <= 800 ? 49 : 58, 1);
          expect(gaps.below).toBeCloseTo(width <= 800 ? 50 : 60, 1);
          expect(gaps.innerTop).toBe(gaps.innerBottom);
          // Line boxes alone hide Jost's optical imbalance. Scan the rendered
          // text pixels, measuring to the gray surface rather than its heading.
          const screenshot = await page.screenshot();
          const visibleGaps = await page.evaluate(
            async ({ data, rects }) => {
              const img = new Image();
              img.src = data;
              await img.decode();
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const context = canvas.getContext("2d")!;
              context.drawImage(img, 0, 0);
              const pixels = context.getImageData(0, 0, img.width, img.height).data;
              const ink = rects.slice(0, 3).map((rect) => {
                let top = Infinity;
                let bottom = -Infinity;
                for (let y = Math.max(0, Math.ceil(rect.top)); y < Math.min(img.height, Math.floor(rect.bottom)); y++) {
                  for (let x = Math.ceil(rect.left); x < Math.floor(rect.right); x++) {
                    const index = (y * img.width + x) * 4;
                    if (pixels[index]! < 128 && pixels[index + 1]! < 128 && pixels[index + 2]! < 128) {
                      top = Math.min(top, y);
                      bottom = Math.max(bottom, y);
                    }
                  }
                }
                return { top, bottom };
              });
              return {
                above: ink[1]!.top - ink[0]!.bottom - 1,
                below: Math.ceil(rects[3]!.top) - ink[2]!.bottom - 1,
              };
            },
            { data: `data:image/png;base64,${screenshot.toString("base64")}`, rects: gaps.rects },
          );
          expect(Number.isFinite(visibleGaps.above) && Number.isFinite(visibleGaps.below)).toBe(true);
          // Ink edges can round differently across macOS/Linux and browser
          // rasterizers. Keep exact line-box assertions above, allowing only
          // two pixels of variation in this thresholded screenshot scan.
          expect(
            Math.abs(visibleGaps.above - visibleGaps.below),
            `Optical gaps at ${width}px: ${JSON.stringify(visibleGaps)}`,
          ).toBeLessThanOrEqual(2);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    }
  });
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

  test("home metrics form a compact full-width mobile data band", { tag: "@mobile" }, async ({ page }) => {
    await page.goto("/");
    const metrics = page.locator(".home-page .metric");
    await expect(metrics).toHaveCount(3);
    await page.evaluate(() => document.fonts.ready);
    const boxes = await metrics.evaluateAll((elements) =>
      elements.map((element) => {
        const box = element.getBoundingClientRect();
        const note = element.querySelector(".kpi-note small")!;
        const noteBox = note.getBoundingClientRect();
        const lineHeight = parseFloat(getComputedStyle(note).lineHeight);
        return {
          width: box.width,
          height: box.height,
          left: box.left,
          extraNoteHeight: Math.max(0, noteBox.height - lineHeight),
          noteFits: noteBox.bottom <= box.bottom && noteBox.left >= box.left && noteBox.right <= box.right,
          contentFits: element.scrollHeight <= element.clientHeight && element.scrollWidth <= element.clientWidth,
        };
      }),
    );
    for (const box of boxes) {
      expect(box.left).toBe(0);
      expect(box.width).toBe(390);
      // Preserve the compact single-line budget while allowing complete multiline explanations.
      expect(box.height - box.extraNoteHeight).toBeLessThanOrEqual(190);
      expect(box.noteFits).toBe(true);
      expect(box.contentFits).toBe(true);
    }
  });

  test("mobile footer and legal sections use balanced vertical spacing", { tag: "@mobile" }, async ({ page }) => {
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

  test("mobile page heroes share one vertical rhythm", { tag: "@mobile" }, async ({ page }) => {
    for (const path of [
      "/",
      "/about",
      "/portfolio",
      "/performance",
      "/memos",
      "/contact",
      "/support",
      "/disclaimer",
      "/subscription-preferences",
    ]) {
      await page.goto(path);
      const hero = page.locator(".hero, .page-hero, .legal-hero").first();
      await expect(hero, `${path} hero`).toHaveCSS("padding-top", "72px");
      await expect(hero, `${path} hero`).toHaveCSS("padding-bottom", "72px");
    }
  });

  test("mobile page content converges on shared gutters and stack spacing", { tag: "@mobile" }, async ({ page }) => {
    await page.goto("/about");
    const aboutBoundary = page.locator(".about-boundaries > section").first();
    const aboutBoundaryBox = await aboutBoundary.boundingBox();
    const aboutHeadingBox = await aboutBoundary.locator("h2").boundingBox();
    expect(aboutBoundaryBox).not.toBeNull();
    expect(aboutHeadingBox).not.toBeNull();
    expect(aboutBoundaryBox!.x).toBe(0);
    expect(aboutBoundaryBox!.width).toBe(390);
    expect(aboutHeadingBox!.x).toBe(16);
    await expect(page.locator(".about-section").first()).toHaveCSS("gap", "40px");

    await page.goto("/contact");
    const contactHeadingBox = await page.locator("#contact-form-title").boundingBox();
    const firstControlBox = await page.locator('input[name="name"]').boundingBox();
    expect(contactHeadingBox).not.toBeNull();
    expect(firstControlBox).not.toBeNull();
    expect(contactHeadingBox!.x).toBe(16);
    expect(firstControlBox!.x).toBe(16);
    expect(firstControlBox!.width).toBe(358);
  });

  test("touch buttons share press scale and footer links stay legible", { tag: "@mobile" }, async ({ page }) => {
    await page.goto("/");
    const menuButton = page.locator(".mobile-menu-button");
    await menuButton.hover();
    await page.mouse.down();
    try {
      await expect
        .poll(() =>
          menuButton.evaluate((element) => {
            const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
            return Math.round(Math.hypot(matrix.a, matrix.b) * 100);
          }),
        )
        .toBe(98);
    } finally {
      await page.mouse.up();
    }
    await page.keyboard.press("Escape");
    const button = page.locator(".hero .button");
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
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

test.describe("touch CTA recovery", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
    test(
      `${prefix || "English"} CTA idle hover resets while keyboard focus stays visible`,
      { tag: "@mobile" },
      async ({ page }) => {
        await page.goto(prefix || "/");
        await page.evaluate(async () => {
          await document.fonts.ready;
          // This test checks control states; settle programmatic scrolling before pointer input.
          document.documentElement.style.scrollBehavior = "auto";
        });
        for (const selector of [
          ".hero .button-dark",
          ".performance-home .button-white",
          ".cta .button-dark",
          ".round-link",
        ]) {
          const control = page.locator(selector).first();
          // Keep the page available while exercising real press/release and touch gestures on links.
          await control.evaluate((element) =>
            element.addEventListener("click", (event) => event.preventDefault(), { capture: true }),
          );
          await control.hover();
          await expect(control).toHaveCSS("transform", "none");
          await expect(control).toHaveCSS("background-color", "rgb(0, 0, 0)");
          await page.mouse.down();
          await expect(control).toHaveCSS("transform", "matrix(0.98, 0, 0, 0.98, 0, 0)");
          await page.mouse.up();
          await control.tap();
          await control.hover();
          await expect(control).toHaveCSS("transform", "none");
          await expect(control).toHaveCSS("background-color", "rgb(0, 0, 0)");
          await page.keyboard.press("Tab");
          await control.focus();
          // Keyboard focus may scroll the control away from the pointer in WebKit.
          await control.hover();
          expect(
            await control.evaluate((element) => element.matches(":hover") && element.matches(":focus-visible")),
          ).toBe(true);
          await expect(control).toHaveCSS("outline-style", "solid");
          await expect(control).toHaveCSS(
            "background-color",
            selector === ".cta .button-dark" ? "rgb(0, 41, 145)" : "rgb(95, 205, 253)",
          );
          await expect(control).toHaveCSS("transform", "matrix(1.04, 0, 0, 1.04, 0, 0)");
          await control.evaluate((element: HTMLElement) => element.blur());
        }
      },
    );
  }
});
