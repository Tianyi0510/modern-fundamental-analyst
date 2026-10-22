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

for (const { prefix, saved, unsubscribed, unavailable } of [
  {
    prefix: "",
    saved: "Your preferred language has been updated.",
    unsubscribed: "You have been unsubscribed.",
    unavailable: "Enable JavaScript to use this form. Your information has not been sent.",
  },
  {
    prefix: "/zh-tw",
    saved: "你的偏好語言已更新。",
    unsubscribed: "你已取消訂閱。",
    unavailable: "請啟用 JavaScript 以使用此表單。你的資料尚未送出。",
  },
  {
    prefix: "/zh-cn",
    saved: "你的偏好语言已更新。",
    unsubscribed: "你已取消订阅。",
    unavailable: "请启用 JavaScript 以使用此表单。你的资料尚未发送。",
  },
]) {
  test(`${prefix || "English"} saved preferences cannot discard the token without JavaScript @mobile`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      const preferenceToken = token();
      await page.goto(`${prefix}/subscription-preferences?token=${preferenceToken}`);
      // Streaming may leave completed content outside main until JavaScript moves it.
      const form = page.locator("form.preferences-form");
      await expect(form).toHaveAttribute("method", "post");
      await expect(form.locator("select")).toBeDisabled();
      await expect(form.locator("button")).toHaveCount(2);
      for (const button of await form.locator("button").all()) await expect(button).toBeDisabled();
      await expect(page.locator("main noscript p")).toHaveText(unavailable);
      await expect(page.locator("main noscript p")).toBeVisible();
      expect(await form.evaluate((element) => [...new FormData(element as HTMLFormElement).keys()])).toEqual([]);
      expect(new URL(page.url()).searchParams.get("token")).toBe(preferenceToken);
    } finally {
      await context.close();
    }
  });

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
      const status = form.getByRole("status");
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

for (const action of ["request", "save", "unsubscribe"] as const) {
  test(`preferences ${action} displays pending feedback and recovers after failure @mobile`, async ({ page }) => {
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(
      action === "request" ? "**/api/subscription-preferences/request" : "**/api/subscription-preferences",
      async (route) => {
        await pending;
        await route.fulfill({ status: 503, json: { ok: false } });
      },
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/subscription-preferences${action === "request" ? "" : `?token=${token()}`}`);
    const form = page.locator("main form");
    if (action === "request") {
      const email = form.locator('input[type="email"]');
      await expect(email).toHaveAttribute("spellcheck", "false");
      await email.fill("reader@example.com");
    } else if (action === "save") {
      await form.locator("select").selectOption("en");
    }
    const button = form.locator(action === "unsubscribe" ? 'button[type="button"]' : 'button[type="submit"]');
    await button.click();
    await expect(button).toBeDisabled();
    const spinner = button.locator('[data-slot="spinner"]');
    await expect(spinner).toBeVisible();
    await expect(spinner).toHaveAttribute("aria-hidden", "true");
    await expect(spinner).toHaveCSS("animation-name", "none");
    release();
    await expect(button).toBeEnabled();
    await expect(spinner).toHaveCount(0);
    await expect(form.getByRole("status")).not.toBeEmpty();
  });
}

test("Contact and Subscribe email inputs disable spellchecking", async ({ page }) => {
  await page.goto("/contact");
  const emails = page.locator('input[type="email"]');
  await expect(emails.first()).toBeVisible();
  expect(await emails.count()).toBeGreaterThanOrEqual(2);
  for (const email of await emails.all()) await expect(email).toHaveAttribute("spellcheck", "false");
});
