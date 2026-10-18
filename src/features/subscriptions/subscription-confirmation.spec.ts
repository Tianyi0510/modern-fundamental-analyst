import { expect, test } from "@playwright/test";

for (const { prefix, action, success, unavailable } of [
  {
    prefix: "",
    action: "Confirm Subscription",
    success: "Your subscription is confirmed.",
    unavailable: "Enable JavaScript to use this form. Your information has not been sent.",
  },
  {
    prefix: "/zh-tw",
    action: "確認訂閱",
    success: "你的訂閱已確認。",
    unavailable: "請啟用 JavaScript 以使用此表單。你的資料尚未送出。",
  },
  {
    prefix: "/zh-cn",
    action: "确认订阅",
    success: "你的订阅已确认。",
    unavailable: "请启用 JavaScript 以使用此表单。你的资料尚未发送。",
  },
]) {
  test(`${prefix || "English"} confirmation cannot discard the token without JavaScript @mobile`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      const confirmationToken = "a".repeat(43);
      await page.goto(`${prefix}/subscription-confirmation?token=${confirmationToken}`);
      const form = page.locator("main form");
      await expect(form).toHaveAttribute("method", "post");
      await expect(form.getByRole("button", { name: action, exact: true })).toBeDisabled();
      await expect(form.locator("noscript p")).toHaveText(unavailable);
      await expect(form.locator("noscript p")).toBeVisible();
      expect(new URL(page.url()).searchParams.get("token")).toBe(confirmationToken);
    } finally {
      await context.close();
    }
  });

  for (const width of [390, 1440]) {
    test(
      `${prefix || "English"} confirmation requires explicit action and recovers at ${width}px`,
      width === 390 ? { tag: "@mobile" } : {},
      async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        let calls = 0;
        let release: (() => void) | undefined;
        await page.route("**/api/subscription-confirmation", async (route) => {
          calls += 1;
          expect(route.request().postDataJSON()).toEqual({ token: "a".repeat(43) });
          if (calls === 1) return route.fulfill({ status: 503, json: { error: "Try Again" } });
          await new Promise<void>((resolve) => {
            release = resolve;
          });
          await route.fulfill({ json: { ok: true } });
        });
        await page.goto(`${prefix}/subscription-confirmation?token=${"a".repeat(43)}`);
        const button = page.getByRole("button", { name: action, exact: true });
        await expect(button).toBeVisible();
        expect(calls).toBe(0);
        await button.focus();
        await page.keyboard.press("Enter");
        await expect(button).toBeEnabled();
        await expect(page.getByRole("main").getByRole("status")).not.toBeEmpty();
        await button.click();
        await expect(page.locator("main form")).toHaveAttribute("aria-busy", "true");
        await expect(page.locator("main form button")).toBeDisabled();
        await expect.poll(() => calls).toBe(2);
        release?.();
        await expect(page.getByRole("main").getByRole("status")).toHaveText(success);
        await expect(button).toBeDisabled();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      },
    );
  }
}

test("a missing confirmation token cannot submit", async ({ page }) => {
  await page.goto("/subscription-confirmation");
  await expect(page.getByRole("button", { name: "Confirm Subscription", exact: true })).toBeDisabled();
});
