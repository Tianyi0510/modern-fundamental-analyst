import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";

const attempt = "550e8400-e29b-41d4-a716-446655440000";
const variants = [
  { prefix: "", language: "en", locale: "en", retry: "Try again", error: "This page could not be loaded." },
  { prefix: "/zh-tw", language: "zh-Hant-TW", locale: "zh-tw", retry: "重試", error: "目前無法載入此頁面。" },
  { prefix: "/zh-cn", language: "zh-CN", locale: "zh-cn", retry: "重试", error: "目前无法加载此页面。" },
];

function preferenceToken() {
  const key = createHash("sha256").update("subscription-preferences:playwright-preferences-only").digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([
    cipher.update(JSON.stringify({ email: "reader@example.com", expiresAt: Date.now() + 600_000, version: 1 })),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64url");
}

for (const { prefix, language, locale, retry, error } of variants) {
  test(`${locale} main content excludes chrome and skip navigation reaches the content`, async ({
    page,
    browserName,
  }) => {
    const tab = browserName === "webkit" ? "Alt+Tab" : "Tab";
    for (const path of [
      "",
      "/about",
      "/portfolio",
      "/performance",
      "/memos",
      "/contact",
      "/support",
      "/disclaimer",
      "/subscription-preferences",
    ]) {
      await page.goto(`${prefix}${path}` || "/");
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("main .site-header, main .site-footer")).toHaveCount(0);
      await page.keyboard.press(tab);
      await expect(page.locator(".skip-link")).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.locator("#main-content")).toBeFocused();
      await page.keyboard.press(tab);
      expect(await page.locator(".site-header").evaluate((header) => header.contains(document.activeElement))).toBe(
        false,
      );
    }
  });

  test(`${locale} unknown paths use a localized HTTP 404`, async ({ page }) => {
    for (const suffix of ["/unknown-review-path", "/unknown-review-path/nested", "/memos/unknown-review-memo"]) {
      const response = await page.goto(`${prefix}${suffix}`);
      expect(response?.status()).toBe(404);
      await expect(page.locator("html")).toHaveAttribute("lang", language);
      await expect(page.locator("main h1")).toBeVisible();
      await expect(page.locator("main a")).toHaveAttribute("href", prefix || "/");
    }
  });

  test(`${locale} a fresh Support visit drops the previous recovery amount`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefix}/support?status=error&checkout_attempt=${attempt}&amount=6`);
    await expect(page.locator(".support-status")).toContainText(
      locale === "en" ? "can no longer be resumed" : locale === "zh-tw" ? "已無法恢復" : "已无法恢复",
    );
    await expect(page.locator(".support-form")).toHaveCount(0);
    await page.locator(`.footer-links a[href="${prefix}/support"]`).click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/support$`));
    // Next.js may retain an inactive route tree; operate on the ready, visible form.
    const form = page.locator(".support-form:visible");
    await expect(form.locator("fieldset")).toBeEnabled();
    await form
      .locator(".support-amount-option")
      .filter({ has: page.locator('input[value="support-18-v1"]') })
      .click();
    const data = await form.evaluate((element) => {
      const data = new FormData(element as HTMLFormElement);
      return { products: data.getAll("product_id"), attempt: data.get("checkout_attempt") };
    });
    expect(data.products).toEqual(["support-18-v1"]);
    expect(data.attempt).not.toBe(attempt);
    await expect(form.locator("fieldset")).toBeEnabled();
  });

  test(`${locale} a restored checkout page unlocks a new attempt without a stale amount`, async ({ page }) => {
    await page.goto(`${prefix}/support`);
    await page
      .locator(".support-amount-option")
      .filter({ has: page.locator('input[value="support-6-v1"]') })
      .click();
    const originalAttempt = await page.locator('input[name="checkout_attempt"]').inputValue();
    await page.locator(".support-form").evaluate((form) => {
      // Prevent document navigation while exercising the real React submit handler.
      const cancel = (event: Event) => event.preventDefault();
      document.addEventListener("submit", cancel, { once: true });
      (form as HTMLFormElement).requestSubmit();
    });
    await expect(page.locator(".support-form")).toHaveAttribute("aria-busy", "true");
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
    await expect(page.locator(".support-form")).toHaveAttribute("aria-busy", "false");
    await expect(page.locator(".support-form fieldset")).toBeEnabled();
    await expect(page.locator('input[name="checkout_attempt"]')).not.toHaveValue(originalAttempt);
    await page
      .locator(".support-amount-option")
      .filter({ has: page.locator('input[value="support-18-v1"]') })
      .click();
    expect(
      await page
        .locator(".support-form")
        .evaluate((form) => new FormData(form as HTMLFormElement).getAll("product_id")),
    ).toEqual(["support-18-v1"]);
  });

  test(`${locale} article metadata uses the canonical localized article`, async ({ page }) => {
    const path = `${prefix}/memos/microsoft-stock-analysis-fiscal-year-2024`;
    await page.goto(path);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
    await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute("content", "2025-10-10");
    const article = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText()) as {
      url: string;
      headline: string;
    };
    expect(article.url).toBe(`https://www.modernfundamentalanalyst.com${path}`);
    await expect(page.locator("h1")).toHaveText(article.headline);
  });

  test(`${locale} a client rendering failure offers a localized working retry`, async ({ page }) => {
    await page.addInitScript(() => {
      const Original = Intl.NumberFormat;
      // Inject a browser-only failure in PortfolioTable, without modifying application code.
      Intl.NumberFormat = new Proxy(Original, {
        construct(target, args: ConstructorParameters<typeof Intl.NumberFormat>) {
          if (args[1]?.style === "currency" && !sessionStorage.getItem("allow-formatting")) {
            throw new Error("private-test-rendering-failure");
          }
          return Reflect.construct(target, args);
        },
      });
    });
    await page.goto(`${prefix}/portfolio`);
    await expect(page.locator("main h1")).toHaveText(error);
    await expect(page.locator("main")).not.toContainText("private-test-rendering-failure");
    await page.evaluate(() => sessionStorage.setItem("allow-formatting", "1"));
    await page.getByRole("button", { name: retry, exact: true }).click();
    await expect(page.locator(".portfolio-page")).toBeVisible();
  });
}

for (const mobile of [false, true]) {
  test(`${mobile ? "mobile" : "desktop"} language navigation retains validated support and preference context`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: mobile ? 390 : 1440, height: 900 });
    const token = preferenceToken();
    for (const entry of [
      {
        path: "/support",
        query: `status=error&checkout_attempt=${attempt}&product_id=support-6-v1&extra=discard`,
        name: "checkout_attempt",
        value: attempt,
      },
      { path: "/subscription-preferences", query: `token=${token}&extra=discard`, name: "token", value: token },
    ]) {
      await page.goto(`${entry.path}?${entry.query}`);
      if (mobile) {
        await page.locator(".mobile-menu-button").click();
        await page.locator(".mobile-language-disclosure summary").click();
      } else {
        await page.locator(".language-trigger").click();
      }
      const menu = page.locator(mobile ? "#mobile-site-menu" : "#desktop-language-menu");
      const link = menu.locator('a[hreflang="zh-Hant-TW"]');
      const target = new URL((await link.getAttribute("href"))!, "http://localhost");
      expect(target.searchParams.get(entry.name)).toBe(entry.value);
      expect(target.searchParams.has("extra")).toBe(false);
      await link.click();
      await expect(page).toHaveURL(new RegExp(`/zh-tw${entry.path}\\?`));
      if (entry.path === "/support") {
        await expect(page.locator('input[name="checkout_locale"]')).toHaveValue("en");
        await expect(page.locator('input[type="hidden"][name="product_id"]')).toHaveValue("support-6-v1");
        await expect(page.locator('input[name="checkout_attempt"]')).toHaveValue(attempt);
      } else {
        expect(new URL(page.url()).searchParams.get("token")).toBe(token);
        await expect(page.locator('select[name="locale"]')).toBeVisible();
      }
    }
  });
}
