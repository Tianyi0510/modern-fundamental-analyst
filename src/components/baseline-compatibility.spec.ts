import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context, baseURL }) => {
  await context.route("https://sentry.invalid/**", (route) =>
    route.fulfill({
      status: 200,
      json: {},
      headers: {
        "Access-Control-Allow-Origin": new URL(baseURL!).origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type, Sentry-Trace, Baggage",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    }),
  );
});

test("Non-Widely monitoring entries are optional during navigation and theme changes @mobile", async ({
  page,
  context,
  baseURL,
}) => {
  let captured = false;
  await context.route("https://sentry.invalid/**", (route) => {
    if (route.request().postData()?.includes("Baseline fallback probe")) captured = true;
    return route.fulfill({
      status: 200,
      json: {},
      headers: {
        "Access-Control-Allow-Origin": new URL(baseURL!).origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type, Sentry-Trace, Baggage",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const unsupported = [
      "event",
      "first-input",
      "largest-contentful-paint",
      "long-animation-frame",
      "layout-shift",
      "soft-navigation",
      "interaction-contentful-paint",
    ];
    const original = PerformanceObserver.supportedEntryTypes;
    Object.defineProperty(PerformanceObserver, "supportedEntryTypes", {
      configurable: true,
      value: original.filter((type) => !unsupported.includes(type)),
    });
    // Preserve the original method and call it with each observer as its receiver.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const observe = PerformanceObserver.prototype.observe;
    PerformanceObserver.prototype.observe = function (options) {
      if ([options?.type, ...(options?.entryTypes ?? [])].some((type) => type && unsupported.includes(type))) {
        throw new TypeError("Unsupported test entry type");
      }
      return observe.call(this, options);
    };
    for (const name of ["PerformanceSoftNavigation", "PerformanceInteractionContentfulPaint"]) {
      Object.defineProperty(window, name, { configurable: true, value: undefined });
    }
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator(".mobile-menu-button").click();
  const menu = page.getByRole("dialog");
  await expect(menu).toBeVisible();
  await menu.locator("[data-theme-toggle]").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await menu.getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByRole("textbox", { name: "Name", exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Compatibility check");
  await expect(page.getByRole("textbox", { name: "Name", exact: true })).toHaveValue("Compatibility check");
  expect(errors).toEqual([]);
  if (process.env.PLAYWRIGHT_SENTRY_TEST === "1") {
    await page.evaluate(() => {
      const button = document.createElement("button");
      button.textContent = "Trigger Baseline fallback probe";
      button.onclick = () => {
        throw new Error("Baseline fallback probe");
      };
      document.body.append(button);
    });
    await page.getByRole("button", { name: "Trigger Baseline fallback probe", exact: true }).click();
    await expect.poll(() => captured).toBe(true);
    expect(errors).toEqual(["Baseline fallback probe"]);
  }
});

test("route announcements do not require ShadowRoot referenceTarget @mobile", async ({ page }) => {
  const options: string[] = [];
  await page.exposeFunction("recordShadowOptions", (keys: string[]) => options.push(...keys));
  await page.addInitScript(() => {
    Object.defineProperty(ShadowRoot.prototype, "referenceTarget", { configurable: true, get: () => undefined });
    // Preserve the native method; the wrapper supplies the element receiver below.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const attach = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function (init) {
      void (window as typeof window & { recordShadowOptions: (keys: string[]) => Promise<void> }).recordShadowOptions(
        Object.keys(init),
      );
      if ("referenceTarget" in init) throw new Error("referenceTarget is unsupported");
      return attach.call(this, init);
    };
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator(".mobile-menu-button").click();
  await page.getByRole("dialog").getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator("next-route-announcer [role=alert]")).toHaveText(await page.title());
  expect(options).toContain("mode");
  expect(options).not.toContain("referenceTarget");
});

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} Limited CSS enhancements degrade to readable fallback content @mobile`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route(/\.(woff2?|ttf)(\?|$)/, (route) => route.abort());
    for (const path of [prefix || "/", `${prefix}/memos/microsoft-stock-analysis-fiscal-year-2024`]) {
      await page.goto(path);
      const removed = await page.evaluate(() => {
        const removed: string[] = [];
        const visit = (sheet: CSSStyleSheet | CSSGroupingRule) => {
          for (let index = sheet.cssRules.length - 1; index >= 0; index--) {
            const rule = sheet.cssRules[index];
            if (!rule) continue;
            if (rule instanceof CSSStyleRule && rule.selectorText.includes("::marker")) {
              sheet.deleteRule(index);
              removed.push("marker");
              continue;
            }
            if ("style" in rule) {
              const style = (rule as CSSStyleRule).style;
              for (const property of [
                "ascent-override",
                "descent-override",
                "line-gap-override",
                "text-wrap",
                "font-variant-emoji",
                "accent-color",
              ]) {
                if (style.getPropertyValue(property)) {
                  style.removeProperty(property);
                  removed.push(property);
                }
              }
            }
            if ("cssRules" in rule) visit(rule as CSSGroupingRule);
          }
        };
        for (const sheet of document.styleSheets) visit(sheet);
        return removed;
      });
      expect(removed.length).toBeGreaterThan(0);
      await expect(page.locator("main h1")).toBeVisible();
      await expect(page.locator("main p").first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (path.includes("/memos/")) {
        expect(removed).toContain("marker");
        expect(removed).toContain("accent-color");
        await expect(page.locator(".typeset li").first()).toBeVisible();
      }
    }
    await page.screenshot({ path: testInfo.outputPath("limited-css-fallback.png") });
    expect(errors).toEqual([]);
  });
}
