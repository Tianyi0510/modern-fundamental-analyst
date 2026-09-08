import { expect, test } from "@playwright/test";

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
