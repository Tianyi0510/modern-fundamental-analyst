import { expect, test } from "@playwright/test";

for (const copy of [
  {
    prefix: "",
    privacy: "The confirmation is the same for every address to protect your privacy.",
    invalid: "Enter a valid email address.",
    subscribed: "Check your inbox. Open the confirmation email to finish subscribing.",
    sent: "If this address is subscribed, check your inbox for a secure link to manage your preferences.",
  },
  {
    prefix: "/zh-tw",
    privacy: "為保護你的隱私，所有地址都會顯示相同的確認訊息。",
    invalid: "請輸入有效的電子郵件地址。",
    subscribed: "請查看收件匣，開啟確認郵件以完成訂閱。",
    sent: "若此地址已訂閱，請查看信箱中的安全連結，以管理偏好設定。",
  },
  {
    prefix: "/zh-cn",
    privacy: "为保护你的隐私，所有地址都会显示相同的确认信息。",
    invalid: "请输入有效的电子邮件地址。",
    subscribed: "请查看收件箱，打开确认邮件以完成订阅。",
    sent: "如果此地址已订阅，请查看邮箱中的安全链接，以管理偏好设置。",
  },
]) {
  test(
    `${copy.prefix || "English"} email forms guide corrections and preserve unchanged retries`,
    { tag: "@mobile" },
    async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 844 });
      const requests: { key: string | undefined; body: Record<string, unknown> }[] = [];
      await page.route(/\/api\/(?:subscribe|subscription-preferences\/request)$/, async (route) => {
        requests.push({
          key: route.request().headers()["idempotency-key"],
          body: route.request().postDataJSON() as Record<string, unknown>,
        });
        await route.fulfill({
          status: requests.length % 2 === 1 ? 400 : 200,
          json: requests.length % 2 === 1 ? { error: "Synthetic validation rejection" } : { ok: true },
        });
      });
      for (const path of ["/contact", "/subscription-preferences"]) {
        await page.goto(`${copy.prefix}${path}`);
        if (path === "/subscription-preferences") {
          await expect(page.locator(".preferences-invalid")).toContainText(copy.privacy);
        }
        const forms =
          path === "/contact"
            ? [page.locator("#contact-subscribe form"), page.locator("footer form")]
            : [page.locator("main form")];
        for (const form of forms) {
          const initialCount = requests.length;
          const email = form.locator("input[type=email]");
          const submit = form.locator("button[type=submit]");
          await email.fill("reader@example");
          await submit.click();
          await expect(email).toBeFocused();
          await expect(email).toHaveAccessibleDescription(copy.invalid);
          await expect(email).toHaveAttribute("aria-invalid", "true");
          await submit.click();
          await expect(email).toBeFocused();
          expect(requests.length).toBe(initialCount);
          await email.fill("reader@example.com");
          await expect(email).not.toHaveAttribute("aria-invalid", "true");
          await submit.click();
          await expect(email).toHaveAccessibleDescription(copy.invalid);
          await expect(email).toBeFocused();
          await expect(email).toBeEnabled();
          await expect(email).toHaveValue("reader@example.com");
          await expect(form.getByRole("status")).toBeEmpty();
          await submit.click();
          await expect(form.getByRole("status")).toHaveText(path === "/contact" ? copy.subscribed : copy.sent);
          await expect(email).toHaveValue("");
          expect(requests.length).toBe(initialCount + 2);
          expect(requests[initialCount]!.key).toBeTruthy();
          expect(requests[initialCount + 1]!.key).toBe(requests[initialCount]!.key);
          expect(requests[initialCount]!.body.locale).toBe(copy.prefix.slice(1) || "en");
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        }
      }
    },
  );
}
