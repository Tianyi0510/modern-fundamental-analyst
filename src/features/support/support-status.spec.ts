import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";

const supportLocales = [
  {
    prefix: "",
    locale: "en",
    submitting: "Redirecting to Stripe…",
    retry: "Try again",
    wait: "Wait 10 minutes",
    invalid: "Choose USD 6, 12, or 18",
  },
  {
    prefix: "/zh-tw",
    locale: "zh-tw",
    submitting: "正在前往 Stripe…",
    retry: "重試",
    wait: "等待 10 分鐘",
    invalid: "請選擇 6、12 或 18 美元",
  },
  {
    prefix: "/zh-cn",
    locale: "zh-cn",
    submitting: "正在前往 Stripe…",
    retry: "重试",
    wait: "等待 10 分钟",
    invalid: "请选择 6、12 或 18 美元",
  },
];

for (const copy of supportLocales) {
  test(`${copy.locale} stopped checkout navigation can resume the same product and attempt`, async ({
    page,
    baseURL,
  }) => {
    const address = `198.51.100.${70 + supportLocales.indexOf(copy)}`;
    for (let attempt = 0; attempt < 8; attempt++) {
      await page.request.post("/api/stripe/checkout", {
        headers: {
          origin: new URL(baseURL!).origin,
          "content-type": "application/x-www-form-urlencoded",
          "x-forwarded-for": address,
        },
        data: "amount=invalid",
        maxRedirects: 0,
      });
    }
    const bodies: string[] = [];
    let release!: () => void;
    const stopped = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/api/stripe/checkout", async (route) => {
      bodies.push(route.request().postData()!);
      if (bodies.length === 1) {
        await stopped;
        await route.abort("aborted");
      } else {
        await route.continue({ headers: { ...route.request().headers(), "x-forwarded-for": address } });
      }
    });
    await page.goto(`${copy.prefix}/support`);
    await page
      .locator(".support-amount-option")
      .filter({ has: page.locator('input[value="support-6-v1"]') })
      .click();
    await page.locator(".support-submit").first().click({ noWaitAfter: true });
    await expect.poll(() => bodies.length).toBe(1);
    await page.keyboard.press("Escape");
    release();
    const resume = page.locator('button[name="checkout_resume"]');
    await expect(resume).toBeVisible();
    await expect(resume).toBeEnabled();
    for (const radio of await page.locator('input[type="radio"]').all()) await expect(radio).toBeDisabled();
    await resume.click({ noWaitAfter: true });
    await expect(page).toHaveURL(new RegExp(`${copy.prefix}/support\\?status=rate-limited(?:&.*)?$`));
    expect(bodies.length).toBe(2);
    const first = new URLSearchParams(bodies[0]);
    const second = new URLSearchParams(bodies[1]);
    expect(first.get("checkout_attempt")).toMatch(/^v3\.[0-9a-f-]{36}\.[0-9]{13}\.[A-Za-z0-9_-]{43}$/);
    expect(second.get("checkout_attempt")).toBe(first.get("checkout_attempt"));
    expect(first.getAll("product_id")).toEqual(["support-6-v1"]);
    expect(second.getAll("product_id")).toEqual(["support-6-v1"]);
    await expect(page.locator(".support-submit")).toBeEnabled();
    await expect(page.locator('input[name="checkout_attempt"]')).toHaveValue(first.get("checkout_attempt")!);
    await expect(page.locator('input[type="hidden"][name="product_id"]')).toHaveValue("support-6-v1");
    for (const radio of await page.locator('input[type="radio"]').all()) await expect(radio).toBeDisabled();
  });

  test(`${copy.locale} Support locks native submissions and returns to localized retry feedback`, async ({
    page,
    baseURL,
  }) => {
    const address = `198.51.100.${20 + supportLocales.indexOf(copy)}`;
    for (let attempt = 0; attempt < 8; attempt++) {
      const response = await page.request.post("/api/stripe/checkout", {
        headers: {
          origin: new URL(baseURL!).origin,
          "content-type": "application/x-www-form-urlencoded",
          "x-forwarded-for": address,
        },
        data: `locale=${copy.locale}&amount=invalid`,
        maxRedirects: 0,
      });
      expect(response.status()).toBe(303);
    }
    let requests = 0;
    let release!: () => void;
    const waiting = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/api/stripe/checkout", async (route) => {
      requests++;
      expect(route.request().method()).toBe("POST");
      const body = new URLSearchParams(route.request().postData()!);
      expect(body.get("locale")).toBe(copy.locale);
      expect(body.get("product_id")).toBe("support-6-v1");
      await waiting;
      await route.continue({ headers: { ...route.request().headers(), "x-forwarded-for": address } });
    });
    await page.goto(`${copy.prefix}/support`);
    await page
      .locator(".support-amount-option")
      .filter({ has: page.locator('input[value="support-6-v1"]') })
      .click();
    const submit = page.locator(".support-submit");
    type SubmissionState = { text: string | null; disabled: boolean; busy: string | null };
    let submissionState: SubmissionState | undefined;
    await page.exposeFunction("recordSupportSubmission", (state: SubmissionState) => {
      submissionState = state;
    });
    // Observe before starting native navigation: later evaluations can wait behind the pending POST.
    await page.evaluate(() => {
      const form = document.querySelector(".support-form")!;
      new MutationObserver(() => {
        const button = form.querySelector<HTMLButtonElement>(".support-submit")!;
        void (
          window as typeof window & { recordSupportSubmission: (state: SubmissionState) => Promise<void> }
        ).recordSupportSubmission({
          text: button.textContent,
          disabled: button.disabled,
          busy: form.getAttribute("aria-busy"),
        });
      }).observe(form, { attributes: true, childList: true, subtree: true });
    });
    await submit.click({ noWaitAfter: true });
    await expect.poll(() => submissionState).toEqual({ text: copy.submitting, disabled: true, busy: "true" });
    await expect.poll(() => requests).toBe(1);
    expect(requests).toBe(1);
    release();
    await expect(page).toHaveURL(new RegExp(`${copy.prefix}/support\\?status=rate-limited(?:&.*)?$`));
    await expect(page.locator(".support-status")).toContainText(copy.wait);
    await expect(submit).toHaveText(copy.retry);
    await expect(submit).toBeEnabled();
    await page.goBack();
    await expect(page).toHaveURL(`${copy.prefix}/support`);
    await expect(submit).toBeEnabled();
    await expect(page.locator(".support-form")).toHaveAttribute("aria-busy", "false");
  });

  test(`${copy.locale} Support retains native POST and localized errors without JavaScript`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    try {
      const page = await context.newPage();
      await page.route("**/api/stripe/checkout", async (route) => {
        expect(route.request().method()).toBe("POST");
        const body = new URLSearchParams(route.request().postData()!);
        expect(body.get("locale")).toBe(copy.locale);
        expect(body.get("product_id")).toBe("support-18-v1");
        // Exercise the real local validation redirect; no provider request is needed.
        body.set("product_id", "invalid");
        await route.continue({
          postData: body.toString(),
          headers: { ...route.request().headers(), "x-forwarded-for": `192.0.2.${40 + supportLocales.indexOf(copy)}` },
        });
      });
      await page.goto(`${copy.prefix}/support`);
      await page
        .locator(".support-amount-option")
        .filter({ has: page.locator('input[value="support-18-v1"]') })
        .click();
      await page.locator(".support-submit").click();
      await expect(page).toHaveURL(`${copy.prefix}/support?status=invalid-amount`);
      await expect(page.locator(".support-status")).toContainText(copy.invalid);
      await expect(page.locator(".support-submit")).toHaveText(copy.retry);
      await expect(page.locator(".support-submit")).toBeEnabled();
    } finally {
      await context.close();
    }
  });
}

test("a success query without a Stripe session never displays payment confirmation", async ({ page }) => {
  const locales = [
    ["", "We could not confirm this payment."],
    ["/zh-tw", "目前無法確認這筆付款"],
    ["/zh-cn", "目前无法确认这笔付款"],
  ];
  for (const [prefix, message] of locales) {
    await page.goto(`${prefix}/support?status=success`);
    await expect(page.locator(".support-status")).toContainText(message!);
    await expect(page.locator(".support-status-success")).toHaveCount(0);
    await expect(page.locator(".support-submit")).toBeEnabled();
  }
});

for (const copy of supportLocales) {
  test(`${copy.locale} unsigned recovery is retired without offering a replacement form`, async ({ page }) => {
    await page.goto(
      `${copy.prefix}/support?status=error&checkout_attempt=550e8400-e29b-41d4-a716-446655440000&product_id=support-12-v1`,
    );
    await expect(page.locator(".support-form")).toHaveCount(0);
    await expect(page.locator(".support-status")).toContainText(
      copy.locale === "en" ? "can no longer be resumed" : copy.locale === "zh-tw" ? "已無法恢復" : "已无法恢复",
    );
  });
}

for (const copy of supportLocales) {
  test(`${copy.locale} expired and malformed signed recovery never renders a fresh checkout form`, async ({ page }) => {
    const payload = `v3.550e8400-e29b-41d4-a716-446655440000.${Date.now() - 1000}`;
    const signature = createHmac("sha256", "playwright-checkout-only")
      .update(`support-checkout:v3:${payload}`)
      .digest("base64url");
    for (const attempt of [`${payload}.${signature}`, "v3.invalid"]) {
      await page.goto(`${copy.prefix}/support?status=error&checkout_attempt=${attempt}&product_id=support-12-v1`);
      await expect(page.locator(".support-form")).toHaveCount(0);
      await expect(page.locator(".support-status")).toContainText(
        copy.locale === "en" ? "can no longer be resumed" : copy.locale === "zh-tw" ? "已無法恢復" : "已无法恢复",
      );
      await page.locator(".language-trigger").click();
      const target = await page.locator("#desktop-language-menu a").first().getAttribute("href");
      expect(target).toContain("status=retired-checkout");
      expect(target).not.toContain("checkout_attempt");
    }
  });
}
