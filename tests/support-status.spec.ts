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
      expect(body.get("amount")).toBe("6");
      await waiting;
      await route.continue({ headers: { ...route.request().headers(), "x-forwarded-for": address } });
    });
    await page.goto(`${copy.prefix}/support`);
    await page
      .locator(".support-amount-option")
      .filter({ has: page.locator('input[value="6"]') })
      .click();
    const submit = page.locator(".support-submit");
    await submit.click({ noWaitAfter: true });
    // Locator assertions wait for navigation; read the still-visible source document while POST is pending.
    await expect
      .poll(() =>
        page.evaluate(() => {
          const button = document.querySelector<HTMLButtonElement>(".support-submit")!;
          return {
            text: button.textContent,
            disabled: button.disabled,
            busy: document.querySelector(".support-form")!.getAttribute("aria-busy"),
          };
        }),
      )
      .toEqual({ text: copy.submitting, disabled: true, busy: "true" });
    await expect.poll(() => requests).toBe(1);
    expect(requests).toBe(1);
    release();
    await expect(page).toHaveURL(`${copy.prefix}/support?status=rate-limited`);
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
        expect(body.get("amount")).toBe("18");
        // Exercise the real local validation redirect; no provider request is needed.
        body.set("amount", "invalid");
        await route.continue({
          postData: body.toString(),
          headers: { ...route.request().headers(), "x-forwarded-for": `192.0.2.${40 + supportLocales.indexOf(copy)}` },
        });
      });
      await page.goto(`${copy.prefix}/support`);
      await page
        .locator(".support-amount-option")
        .filter({ has: page.locator('input[value="18"]') })
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
