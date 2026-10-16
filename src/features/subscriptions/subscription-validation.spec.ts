import { expect, test } from "@playwright/test";

for (const copy of [
  {
    prefix: "",
    invalid: "Enter a valid email address.",
    subscribed: "Check your inbox and confirm your subscription.",
    sent: "If this address is subscribed, a secure link is on its way.",
  },
  {
    prefix: "/zh-tw",
    invalid: "請輸入有效的電子郵件地址。",
    subscribed: "請查看電子郵件並確認你的訂閱。",
    sent: "若此地址已訂閱，安全連結將寄至你的信箱。",
  },
  {
    prefix: "/zh-cn",
    invalid: "请输入有效的电子邮件地址。",
    subscribed: "请查看电子邮件并确认你的订阅。",
    sent: "如果此地址已订阅，安全链接将发送至你的邮箱。",
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
