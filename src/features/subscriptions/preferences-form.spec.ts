import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { test, expect } from "@playwright/test";

function token() {
  const key = createHash("sha256").update("subscription-preferences:playwright-preferences-only").digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([
    cipher.update(JSON.stringify({ email: "reader@example.com", expiresAt: Date.now() + 60_000, version: 1 })),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64url");
}

for (const { prefix, saved, unsubscribed } of [
  { prefix: "", saved: "Your preferred language has been updated.", unsubscribed: "You have been unsubscribed." },
  { prefix: "/zh-tw", saved: "你的偏好語言已更新。", unsubscribed: "你已取消訂閱。" },
  { prefix: "/zh-cn", saved: "你的偏好语言已更新。", unsubscribed: "你已取消订阅。" },
]) {
  test(
    `${prefix || "English"} preferences require a selection and clear stale success`,
    { tag: "@mobile" },
    async ({ page }) => {
      const actions: string[] = [];
      await page.route("**/api/subscription-preferences", async (route) => {
        const body: unknown = route.request().postDataJSON();
        if (!body || typeof body !== "object" || !("action" in body) || typeof body.action !== "string") {
          throw new Error("Expected a preference action");
        }
        actions.push(body.action);
        await route.fulfill({ json: { ok: true } });
      });
      await page.goto(`${prefix}/subscription-preferences?token=${token()}`);
      const select = page.locator('select[name="locale"]');
      const form = page.locator("form").filter({ has: select });
      const status = form.locator('[role="status"]');
      const unsubscribe = form.locator('button[type="button"]');
      for (const width of [320, 390, 800]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(unsubscribe).toHaveCSS("align-self", "flex-start");
        await expect(unsubscribe).toBeVisible();
        const boxes = await unsubscribe.evaluate((button) => {
          const actions = button.parentElement!;
          return {
            buttonX: button.getBoundingClientRect().x,
            actionsX: actions.getBoundingClientRect().x,
            buttonWidth: button.getBoundingClientRect().width,
            actionsWidth: actions.getBoundingClientRect().width,
          };
        });
        expect(boxes.buttonX).toBeCloseTo(boxes.actionsX, 0);
        expect(boxes.buttonWidth).toBeLessThan(boxes.actionsWidth);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      }
      await page.setViewportSize({ width: 390, height: 900 });
      await expect(select).toHaveAccessibleName(/\S/);
      await expect(select).toHaveValue("");
      await form.locator('button[type="submit"]').click();
      expect(actions).toEqual([]);
      await select.selectOption("zh-tw");
      await form.locator('button[type="submit"]').click();
      await expect(status).toHaveText(saved);
      await select.selectOption("en");
      await expect(status).toBeEmpty();
      await page.reload();
      await expect(select).toHaveValue("");
      await unsubscribe.click();
      await expect(status).toHaveText(unsubscribed);
      await expect(select).toBeDisabled();
      await expect(select).toHaveCSS("cursor", "not-allowed");
      await expect(select).toHaveCSS("border-top-style", "dashed");
      expect(actions).toEqual(["save", "unsubscribe"]);
    },
  );
}
