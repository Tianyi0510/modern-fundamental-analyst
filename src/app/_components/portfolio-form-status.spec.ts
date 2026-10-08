import { expect, test } from "@playwright/test";

const locales = [
  {
    prefix: "",
    name: "English",
    contactSuccess: "Your message has been sent.",
    subscribeSuccess: "Check your inbox and confirm your subscription.",
    preferencesSuccess: "If this address is subscribed, a secure link is on its way.",
    returnNote: "Net dividends and financing interest are not allocated to positions",
  },
  {
    prefix: "/zh-tw",
    name: "Traditional Chinese",
    contactSuccess: "訊息已成功傳送",
    subscribeSuccess: "請查看電子郵件並確認你的訂閱。",
    preferencesSuccess: "若此地址已訂閱",
    returnNote: "淨股息與融資利息不分攤至各持股",
  },
  {
    prefix: "/zh-cn",
    name: "Simplified Chinese",
    contactSuccess: "信息已成功发送",
    subscribeSuccess: "请查看电子邮件并确认你的订阅。",
    preferencesSuccess: "如果此地址已订阅",
    returnNote: "净股息与融资利息不分摊至各持仓",
  },
] as const;

for (const { prefix, name, contactSuccess, subscribeSuccess, preferencesSuccess, returnNote } of locales) {
  test(`${name} portfolio summary and table show the same cost-basis total return`, async ({ page }) => {
    await page.goto(`${prefix}/portfolio`);
    const summaryReturn = page.locator('.portfolio-kpis [data-tone="brand"] strong');
    const tableReturn = page.locator(".portfolio-total-return");
    await expect(summaryReturn).toHaveText("+32.84%");
    const summary = page.locator('.portfolio-kpis [data-tone="brand"]');
    await expect(summary.getByRole("term")).toHaveText(
      prefix === "/zh-tw" ? "總報酬率" : prefix === "/zh-cn" ? "总回报率" : "Total Return",
    );
    await expect(summary.locator("small")).toHaveText(
      prefix === "/zh-tw" ? "絕對報酬率" : prefix === "/zh-cn" ? "绝对回报率" : "Absolute Return",
    );
    await expect(tableReturn).toHaveText("+32.84%");
    await expect(page.locator(".portfolio-table-wrap + .portfolio-return-note p")).toContainText(returnNote);
  });

  test(`${name} form success clears when entering a new submission`, async ({ page }) => {
    const contactKeys: string[] = [];
    const preferencesKeys: string[] = [];
    await page.route(/\/api\/(?:contact|subscribe|subscription-preferences\/request)$/, async (route) => {
      const path = new URL(route.request().url()).pathname;
      const key = (await route.request().headerValue("Idempotency-Key")) ?? "";
      if (path === "/api/contact") contactKeys.push(key);
      if (path === "/api/subscription-preferences/request") preferencesKeys.push(key);
      await route.fulfill({ json: { ok: true } });
    });

    await page.goto(`${prefix}/contact`);
    const contact = page.locator("form").filter({ has: page.locator('textarea[name="message"]') });
    for (const control of await contact.locator('input:not([type="hidden"]):not([name="website"]), textarea').all()) {
      await expect(control).toHaveAccessibleName(/\S/);
      const id = await control.getAttribute("id");
      await contact.locator(`label[for="${id}"]`).click();
      await expect(control).toBeFocused();
    }
    await contact.locator('[name="name"]').fill("Reader");
    await contact.locator('[name="email"]').fill("reader@example.com");
    await contact.locator('[name="subject"]').fill("First question");
    await contact.locator('[name="message"]').fill("A first question about the portfolio.");
    await contact.locator('button[type="submit"]').click();
    await expect(contact.locator('[role="status"]')).toContainText(contactSuccess);
    await contact.locator('[name="subject"]').fill("Second question");
    await expect(contact.locator('[role="status"]')).toBeEmpty();
    await contact.locator('[name="name"]').fill("Reader");
    await contact.locator('[name="email"]').fill("reader@example.com");
    await contact.locator('[name="message"]').fill("A second question about the portfolio.");
    await contact.locator('button[type="submit"]').click();
    await expect(contact.locator('[role="status"]')).toContainText(contactSuccess);
    expect(contactKeys).toHaveLength(2);
    expect(contactKeys.every(Boolean)).toBe(true);
    expect(new Set(contactKeys).size).toBe(2);

    const subscribe = page.locator(".site-footer form");
    await subscribe.locator('[name="email"]').fill("reader@example.com");
    await subscribe.locator('button[type="submit"]').click();
    await expect(subscribe.locator('[role="status"]')).toContainText(subscribeSuccess);
    await subscribe.locator('[name="email"]').fill("another@example.com");
    await expect(subscribe.locator('[role="status"]')).toBeEmpty();

    await page.goto(`${prefix}/subscription-preferences`);
    const preferences = page.locator("main form").first();
    await preferences.locator('[name="email"]').fill("reader@example.com");
    await preferences.locator('button[type="submit"]').click();
    await expect(preferences.locator('[role="status"]')).toContainText(preferencesSuccess);
    await preferences.locator('[name="email"]').fill("another@example.com");
    await expect(preferences.locator('[role="status"]')).toBeEmpty();
    await preferences.locator('button[type="submit"]').click();
    await expect(preferences.locator('[role="status"]')).toContainText(preferencesSuccess);
    expect(preferencesKeys).toHaveLength(2);
    expect(preferencesKeys.every(Boolean)).toBe(true);
    expect(new Set(preferencesKeys).size).toBe(2);
  });
}

for (const [prefix, message] of [
  ["", "You've already subscribed"],
  ["/zh-tw", "你已經訂閱了"],
  ["/zh-cn", "你已经订阅了"],
]) {
  test(`${prefix || "English"} duplicate subscription keeps input and clears feedback on editing`, async ({ page }) => {
    await page.route("**/api/subscribe", (route) =>
      route.fulfill({ status: 409, json: { error: "You've already subscribed" } }),
    );
    await page.goto(`${prefix}/contact`);
    const form = page.locator(".site-footer form");
    await form.locator('[name="email"]').fill("reader@example.com");
    await form.locator('button[type="submit"]').click();
    await expect(form.getByRole("status")).toHaveText(message!);
    await expect(form.locator('[name="email"]')).toHaveValue("reader@example.com");
    await form.locator('[name="email"]').fill("another@example.com");
    await expect(form.getByRole("status")).toBeEmpty();
  });
}
