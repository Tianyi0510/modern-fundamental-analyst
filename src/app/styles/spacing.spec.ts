import { expect, test, type Page } from "@playwright/test";

const routes = [
  "",
  "/about",
  "/portfolio",
  "/performance",
  "/memos",
  "/contact",
  "/support",
  "/disclaimer",
  "/subscription-preferences",
  "/memos/microsoft-stock-analysis-fiscal-year-2024",
];

test("spacing uses an 8px measurement scale with explicit site extensions", async ({ page }) => {
  await page.goto("/");
  const values = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return [0, 25, 50, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 650, 700, 800, 900, 1000, 1200].map(
      (name) => ({ name, value: Number.parseFloat(style.getPropertyValue(`--space-${name}`)) }),
    );
  });
  for (const { name, value } of values) expect(value).toBe((name / 100) * 8);
});

function spacingCase(width: number, prefix: string) {
  return async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/_vercel/**/script.js", (route) =>
      route.fulfill({ status: 200, contentType: "application/javascript", body: "" }),
    );
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of routes) {
      await page.goto(`${prefix}${route}` || "/");
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("main h1")).toBeVisible();
      const geometry = await page.evaluate(() => {
        const title = document.querySelector("main h1")!;
        const hero = document.querySelector(".hero, .page-hero, .legal-hero");
        const style = hero ? getComputedStyle(hero) : null;
        return {
          titleSize: Number.parseFloat(getComputedStyle(title).fontSize),
          titleLeft: title.getBoundingClientRect().left,
          paddingTop: style?.paddingTop ?? null,
          paddingBottom: style?.paddingBottom ?? null,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      expect(geometry.titleSize, route).toBe(width < 800 ? 36 : 57);
      expect(geometry.titleLeft, route).toBe(width < 800 ? 16 : 32);
      expect(geometry.overflow, route).toBe(false);
      const expectedPadding =
        route === "/memos/microsoft-stock-analysis-fiscal-year-2024" ? null : width < 800 ? "72px" : "96px";
      expect(geometry.paddingTop, route).toBe(expectedPadding);
      expect(geometry.paddingBottom, route).toBe(expectedPadding);
      const footerGap = await page.locator(".footer-navigation").evaluate((element) => {
        const heading = element.querySelector(".footer-heading")!.getBoundingClientRect();
        const links = element.querySelector(".footer-links")!.getBoundingClientRect();
        return links.top - heading.bottom;
      });
      expect(footerGap).toBeCloseTo(16, 1);
    }

    await page.goto(`${prefix}/contact`);
    await page.evaluate(() => document.fonts.ready);
    const button = page.locator(".contact-submit");
    const trigger = page.locator(width < 800 ? ".mobile-menu-button" : ".language-trigger");
    const popup = page.getByRole(width < 800 ? "dialog" : "menu");
    await trigger.click();
    await expect(popup).toBeVisible();
    const expandedControl = page.locator(width < 800 ? ".mobile-language-disclosure > summary" : ".language-trigger");
    if (width < 800) await expandedControl.click();
    await expect(expandedControl).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(popup).toBeHidden();
    await expect(trigger).toBeFocused();
    const before = await button.evaluate((element) => {
      const style = getComputedStyle(element);
      return { padding: style.paddingInlineStart, gap: style.columnGap, font: Number.parseFloat(style.fontSize) };
    });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    // Reduced-motion CSS still has a minimal transition; sample after the observable text resize settles.
    await expect(button).toHaveCSS("font-size", `${before.font * 2}px`);
    const after = await button.evaluate((element) => {
      const style = getComputedStyle(element);
      return { padding: style.paddingInlineStart, gap: style.columnGap, font: Number.parseFloat(style.fontSize) };
    });
    expect(after.padding).toBe(before.padding);
    expect(after.gap).toBe(before.gap);
    await expect(page.locator('input[name="name"]')).toHaveCSS("padding-inline-start", "16px");
    await expect(page.locator(".contact-form")).toHaveCSS("row-gap", "24px");
    await expect(page.locator(".contact-heading")).toHaveCSS("row-gap", "24px");
    const headingGap = await page.locator(".contact-heading").evaluate((element) => {
      const title = element.querySelector("h2")!.getBoundingClientRect();
      const text = element.querySelector("p")!.getBoundingClientRect();
      return text.top - title.bottom;
    });
    expect(headingGap).toBeCloseTo(24, 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const controlFit = await button.evaluate(
      (element) => element.scrollWidth <= element.clientWidth && element.scrollHeight <= element.clientHeight,
    );
    expect(controlFit).toBe(true);
    await page.evaluate(() => {
      document.documentElement.style.removeProperty("font-size");
    });

    for (const route of ["/portfolio", "/memos/microsoft-stock-analysis-fiscal-year-2024"]) {
      await page.goto(`${prefix}${route}`);
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      await expect(page.locator("main h1")).toHaveCSS("font-size", width < 800 ? "72px" : "114px");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
    }
    await page.goto(`${prefix}/about`);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await expect(page.locator("main h1")).toHaveCSS("font-size", width < 800 ? "72px" : "114px");
    const paragraphGap = await page
      .locator(".about-copy")
      .first()
      .evaluate((element) => {
        const paragraphs = element.querySelectorAll("p");
        return paragraphs[1]!.getBoundingClientRect().top - paragraphs[0]!.getBoundingClientRect().bottom;
      });
    expect(paragraphGap).toBeCloseTo(24, 1);
    expect(errors).toEqual([]);
  };
}

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} desktop spacing preserves hierarchy and wrapping`, spacingCase(1440, prefix));
  test.describe(`${prefix || "English"} compact spacing`, { tag: "@mobile" }, () => {
    for (const width of [320, 390]) {
      test(`preserves hierarchy and wrapping at ${width}px`, spacingCase(width, prefix));
    }
  });
}
