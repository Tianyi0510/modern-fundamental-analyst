import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { test, expect } from "@playwright/test";

function token() {
  const key = createHash("sha256").update("subscription-preferences:playwright-preferences-only").digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(JSON.stringify({ email: "reader@example.com", expiresAt: Date.now() + 60_000, version: 1 })), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64url");
}

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} preferences require a selection and clear stale success`, async ({ page }) => {
    const actions: string[] = [];
    await page.route("**/api/subscription-preferences", async route => {
      actions.push(route.request().postDataJSON().action);
      await route.fulfill({ json: { ok: true } });
    });
    await page.goto(`${prefix}/subscription-preferences?token=${token()}`);
    const select = page.locator('select[name="locale"]');
    const form = page.locator("form").filter({ has: select });
    const status = form.locator('[role="status"]');
    await expect(select).toHaveValue("");
    await form.locator('button[type="submit"]').click();
    expect(actions).toEqual([]);
    await select.selectOption("zh-tw");
    await form.locator('button[type="submit"]').click();
    await expect(status).not.toBeEmpty();
    await select.selectOption("en");
    await expect(status).toBeEmpty();
    await page.reload();
    await expect(select).toHaveValue("");
    await form.locator('button[type="button"]').click();
    await expect(select).toBeDisabled();
    expect(actions).toEqual(["save", "unsubscribe"]);
  });
}
